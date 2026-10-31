// The mileage reimbursement engine: prices each trip at the IRS (or GSA) rate in force on its date,
// and, for employer allowances, on the date paid where the IRS announcement says so; totals by
// period, purpose and employee; works out true-ups and the W-2 split of an allowance above the
// federal rate; and checks a log against the record elements of IRS Publication 463.
//
// Pure and dependency-free, so the browser loads this same file: no imports, no Node APIs. The rate
// tables come in as data (tool.js reads them from data/, the page from the tool's published
// example). Money is integer micro-dollars throughout (1 USD = 1,000,000); miles are kept in
// hundredths and rates in mills (tenths of a cent), so every product is exact.

export class MileageError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'MileageError';
    this.field = field;
  }
}

// ---------- dates ----------

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isRealDate(s) {
  const m = ISO.exec(String(s));
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}
export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const dayNumber = (iso) => Math.round(Date.parse(`${iso}T00:00:00Z`) / 86_400_000);
export const daysBetween = (a, b) => dayNumber(b) - dayNumber(a);
// "July 1, 2026"
export const longDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}, ${iso.slice(0, 4)}`;
// "July 1"
export const monthDay = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}`;
// "January 1 to June 30, 2026", or across years "July 1, 2011 to December 31, 2011"
export function rangeText(from, to) {
  if (from.slice(0, 4) === to.slice(0, 4)) {
    if (from.slice(5) === '01-01' && to.slice(5) === '12-31') return `all of ${from.slice(0, 4)}`;
    return `${monthDay(from)} to ${longDate(to)}`;
  }
  return `${longDate(from)} to ${longDate(to)}`;
}

// ---------- numbers and money ----------

const grouped = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// Micro-dollars to "$1,234.56" (rounded to the cent, half up).
export function usd(micros) {
  const cents = roundCents(micros) / 10_000;
  const neg = cents < 0;
  const abs = Math.abs(cents);
  return `${neg ? '-' : ''}$${grouped(String(Math.floor(abs / 100)))}.${String(abs % 100).padStart(2, '0')}`;
}
// Micro-dollars rounded to whole cents (still in micro-dollars), half away from zero.
export function roundCents(micros) {
  const sign = micros < 0 ? -1 : 1;
  return sign * Math.floor((Math.abs(micros) + 5_000) / 10_000) * 10_000;
}
// "1234.56" for a CSV cell.
export const plainUsd = (micros) => usd(micros).replace(/[$,]/g, '');
// Hundredths of a mile to "1,234.5" (trailing zeros dropped).
export function milesText(hundredths) {
  const whole = Math.floor(hundredths / 100);
  const frac = String(hundredths % 100).padStart(2, '0').replace(/0+$/, '');
  return `${grouped(String(whole))}${frac ? `.${frac}` : ''}`;
}
export const plainMiles = (hundredths) => milesText(hundredths).replace(/,/g, '');
// Mills (tenths of a cent) to "72.5 cents" and "$0.725".
export const centsText = (mills) => `${(mills / 10).toString()}`;
export function dollarsText(mills) {
  const d = Math.floor(mills / 1000);
  const rest = String(mills % 1000).padStart(3, '0').replace(/0+$/, '');
  return `$${d}.${rest.length < 2 ? rest.padEnd(2, '0') : rest}`;
}
export const rateWords = (mills) => (mills >= 1000 ? `${dollarsText(mills)} a mile` : `${centsText(mills)} cents a mile`);

// A decimal number given as a number or text ("1,234.5", "$12.50", "12.4 mi") to an integer of the
// given scale (2 decimals -> hundredths), or null when it is not one. More decimals than the scale
// are refused rather than rounded, so nothing is silently changed.
export function scaled(value, decimals) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) return null;
    const n = Math.round(value * 10 ** decimals);
    return Math.abs(n - value * 10 ** decimals) < 1e-6 ? n : null;
  }
  if (typeof value !== 'string') return null;
  const s = value.trim().replace(/^\$\s*/, '').replace(/\s*(?:mi|miles?|cents?|¢)\.?$/i, '').replace(/,(?=\d{3}(?:\D|$))/g, '');
  const m = /^(\d+)(?:\.(\d*))?$/.exec(s);
  if (!m || (m[2] ?? '').length > decimals) return null;
  return Number(m[1]) * 10 ** decimals + Number((m[2] ?? '').padEnd(decimals, '0') || 0);
}
const MAX_MILES = 100_000_000; // hundredths: one million miles
const MAX_MONEY = 1_000_000_000_000; // micro: one million dollars

// A rate per mile: "72.5" or 72.5 cents, or "0.725" / "$0.725" dollars. A value under 5 is read as
// dollars (no IRS or GSA rate is under 5 cents), anything else as cents. Returns mills or null.
export function rateMills(value) {
  const asText = typeof value === 'number' ? String(value) : String(value ?? '').trim();
  const dollars = /^\$/.test(asText);
  const n = scaled(asText.replace(/^\$\s*/, ''), 4);
  if (n === null) return null;
  const isDollars = dollars || n < 5 * 10_000;
  const mills = isDollars ? n / 10 : n / 1000; // n is in 1/10,000ths of the unit
  return Number.isInteger(mills) && mills > 0 && mills <= 100_000 ? mills : null;
}

// ---------- purposes ----------

export const PURPOSES = {
  business: { table: 'irs', field: 'business', name: 'Business', short: 'business' },
  medical: { table: 'irs', field: 'medicalMoving', name: 'Medical', short: 'medical' },
  moving: { table: 'irs', field: 'medicalMoving', name: 'Moving (active-duty military, certain intelligence-community moves)', short: 'moving' },
  charity: { table: 'irs', field: 'charity', name: 'Charity', short: 'charity' },
  'gsa-car': { table: 'gsa', field: 'automobile', name: 'Federal travel, own car (no government car available)', short: 'federal travel' },
  'gsa-car-gov-available': { table: 'gsa', field: 'governmentAutomobileAvailable', name: 'Federal travel, own car when a government car was available', short: 'federal travel' },
  'gsa-motorcycle': { table: 'gsa', field: 'motorcycle', name: 'Federal travel, motorcycle', short: 'motorcycle' },
  'gsa-airplane': { table: 'gsa', field: 'airplane', name: 'Federal travel, airplane (statute miles)', short: 'airplane' },
  'gsa-relocation': { table: 'gsa', field: 'relocation', name: 'Federal travel, car on a work-related move', short: 'relocation' },
};
export const PURPOSE_KEYS = Object.keys(PURPOSES);
const PURPOSE_ALIASES = {
  business: 'business', biz: 'business', work: 'business', 'self-employed': 'business', b: 'business',
  medical: 'medical', med: 'medical', m: 'medical', doctor: 'medical',
  moving: 'moving', 'military moving': 'moving', 'military move': 'moving', move: 'moving',
  charity: 'charity', charitable: 'charity', volunteer: 'charity', c: 'charity',
};
export function purposeOf(value) {
  if (value === undefined || value === null || String(value).trim() === '') return 'business';
  const s = String(value).trim().toLowerCase().replace(/[_\s]+/g, ' ');
  if (PURPOSES[s.replace(/ /g, '-')]) return s.replace(/ /g, '-');
  return PURPOSE_ALIASES[s] ?? null;
}

// ---------- CSV ----------

// RFC 4180 text to rows of cells. The delimiter is the first of tab, semicolon or comma found
// outside quotes in the header line. Blank lines are dropped.
export function parseCsv(text) {
  const src = String(text ?? '').replace(/^﻿/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] ?? '';
  const outside = firstLine.replace(/"[^"]*"/g, '');
  const delim = outside.includes('\t') ? '\t' : outside.includes(';') && !outside.includes(',') ? ';' : ',';
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === delim) { row.push(field); field = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

// The fields a trip row can carry, and the column headings each is recognised by (lower case,
// spaces and punctuation ignored).
export const FIELDS = {
  date: ['date', 'tripdate', 'dateoftrip', 'day', 'traveldate', 'startdate'],
  endDate: ['enddate', 'todate', 'returndate', 'until', 'dateto', 'lastday'],
  miles: ['miles', 'mileage', 'distance', 'businessmiles', 'milesdriven', 'totalmiles', 'mi'],
  purpose: ['purpose', 'type', 'category', 'mileagetype', 'kind'],
  employee: ['employee', 'employeename', 'name', 'driver', 'employeeid', 'staff', 'person'],
  vehicle: ['vehicle', 'car', 'vehiclename', 'auto'],
  start: ['start', 'from', 'origin', 'startlocation', 'startaddress', 'departure'],
  destination: ['destination', 'to', 'location', 'place', 'endlocation', 'endaddress', 'businessdestination'],
  businessPurpose: ['businesspurpose', 'reason', 'description', 'notes', 'note', 'memo', 'purposeoftrip', 'tripreason'],
  parking: ['parking', 'parkingfees'],
  tolls: ['tolls', 'toll', 'tollfees'],
  paidAmount: ['paidamount', 'paid', 'amountpaid', 'reimbursed', 'reimbursement', 'reimbursedamount', 'alreadypaid'],
  paidRate: ['paidrate', 'rate', 'ratepaid', 'ratepermile', 'reimbursementrate'],
  paidDate: ['paiddate', 'datepaid', 'paymentdate', 'paydate', 'reimburseddate'],
  recordedOn: ['recordedon', 'recorded', 'loggedon', 'dateentered', 'entered', 'enteredon', 'datelogged'],
  odometerStart: ['odometerstart', 'startodometer', 'odostart', 'startingodometer', 'beginodometer'],
  odometerEnd: ['odometerend', 'endodometer', 'odoend', 'endingodometer', 'finalodometer'],
};
export const FIELD_KEYS = Object.keys(FIELDS);
const squash = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

// Which column holds which field: explicit `columns` ({ miles: 'Distance (mi)' }) first, then the
// recognised headings. Returns { map: { field: index }, unknown: [headings not used] }.
export function mapColumns(header, columns = {}) {
  const map = {};
  const used = new Set();
  for (const [field, heading] of Object.entries(columns ?? {})) {
    const i = header.findIndex((h) => squash(h) === squash(heading));
    if (i < 0) throw new MileageError(`The column "${heading}" named for ${field} is not in the file. Its headings are: ${header.join(', ')}.`, 'columns');
    map[field] = i;
    used.add(i);
  }
  for (const field of FIELD_KEYS) {
    if (map[field] !== undefined) continue;
    const i = header.findIndex((h, j) => !used.has(j) && FIELDS[field].includes(squash(h)));
    if (i >= 0) { map[field] = i; used.add(i); }
  }
  if (map.date === undefined || map.miles === undefined) {
    throw new MileageError(`The file needs a date column and a miles column. Its headings are: ${header.join(', ')}. Name them, for example { "date": "Trip date", "miles": "Distance" }.`, 'columns');
  }
  return { map, unknown: header.filter((_, i) => !used.has(i)) };
}

// CSV text to raw row objects (strings), with the 1-based line number of each in the file.
export function rowsFromCsv(text, columns) {
  const table = parseCsv(text);
  if (table.length < 2) throw new MileageError('The file needs a heading line and at least one trip.', 'csv');
  const [header, ...body] = table;
  const { map, unknown } = mapColumns(header, columns);
  const rows = body.map((cells) => {
    const r = {};
    for (const [field, i] of Object.entries(map)) {
      const v = (cells[i] ?? '').trim();
      if (v !== '') r[field] = v;
    }
    return r;
  });
  return { rows, header, mapped: Object.fromEntries(Object.entries(map).map(([f, i]) => [f, header[i]])), unknown };
}

// ---------- reading one trip ----------

// "2026-07-04", "7/4/2026" or "7/4/26" to ISO, or null.
export function dateOf(value) {
  const s = String(value ?? '').trim();
  if (isRealDate(s)) return s;
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(s);
  if (us) {
    const y = us[3].length === 2 ? `20${us[3]}` : us[3];
    const iso = `${y}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}`;
    return isRealDate(iso) ? iso : null;
  }
  const t = /^(\d{4}-\d{2}-\d{2})T/.exec(s);
  return t && isRealDate(t[1]) ? t[1] : null;
}

const text = (v, max = 200) => (v === undefined || v === null ? '' : String(v).trim().slice(0, max));

// One raw trip (from JSON or a CSV row) to a clean trip, or a MileageError naming the row.
export function readTrip(raw, row) {
  const where = row ? `Row ${row}: ` : '';
  const fail = (msg) => { throw new MileageError(`${where}${msg}`, 'trips'); };
  const date = dateOf(raw.date);
  if (!date) fail(raw.date === undefined || raw.date === '' ? 'the trip date is missing.' : `"${raw.date}" is not a date. Write 2026-07-14 or 7/14/2026.`);
  let to = null;
  if (raw.endDate !== undefined && raw.endDate !== null && raw.endDate !== '') {
    to = dateOf(raw.endDate);
    if (!to) fail(`the end date "${raw.endDate}" is not a date.`);
    if (to < date) fail('the end date is before the start date.');
    if (to === date) to = null;
  }
  const miles = scaled(raw.miles, 2);
  if (miles === null) fail(raw.miles === undefined || raw.miles === '' ? 'the miles are missing.' : `"${raw.miles}" is not a number of miles (use up to 2 decimals).`);
  if (miles > MAX_MILES) fail('more than 1,000,000 miles on one line.');
  const purpose = purposeOf(raw.purpose);
  if (!purpose) fail(`"${raw.purpose}" is not a purpose. Use business, medical, moving or charity (or a GSA rate such as gsa-car).`);
  const money = (field, label) => {
    if (raw[field] === undefined || raw[field] === null || raw[field] === '') return null;
    const cents = scaled(raw[field], 2);
    if (cents === null) fail(`${label} "${raw[field]}" is not an amount in dollars and cents.`);
    if (cents * 10_000 > MAX_MONEY) fail(`${label} is over $1,000,000.`);
    return cents * 10_000;
  };
  const optDate = (field, label) => {
    if (raw[field] === undefined || raw[field] === null || raw[field] === '') return null;
    const d = dateOf(raw[field]);
    if (!d) fail(`${label} "${raw[field]}" is not a date.`);
    return d;
  };
  const odo = (field) => {
    if (raw[field] === undefined || raw[field] === null || raw[field] === '') return null;
    const n = scaled(raw[field], 1);
    if (n === null) fail(`the odometer reading "${raw[field]}" is not a number.`);
    return n * 10; // hundredths
  };
  let paidRate = null;
  if (raw.paidRate !== undefined && raw.paidRate !== null && raw.paidRate !== '') {
    paidRate = rateMills(raw.paidRate);
    if (paidRate === null) fail(`the paid rate "${raw.paidRate}" is not a rate per mile. Write cents (72.5) or dollars (0.725).`);
  }
  return {
    row: row ?? null,
    date,
    to,
    miles,
    purpose,
    employee: text(raw.employee, 80),
    vehicle: text(raw.vehicle, 80),
    start: text(raw.start),
    destination: text(raw.destination),
    businessPurpose: text(raw.businessPurpose),
    parking: money('parking', 'Parking') ?? 0,
    tolls: money('tolls', 'Tolls') ?? 0,
    paidAmount: money('paidAmount', 'The paid amount'),
    paidRate,
    paidDate: optDate('paidDate', 'The paid date'),
    recordedOn: optDate('recordedOn', 'The recorded-on date'),
    odometerStart: odo('odometerStart'),
    odometerEnd: odo('odometerEnd'),
  };
}

// Trips from either { rows: [...] } (objects) or { csv, columns? }, numbered as in the file.
export function readTrips({ rows, csv, columns }) {
  if (csv !== undefined) {
    const read = rowsFromCsv(csv, columns);
    // Line numbers: the heading is line 1, so the first trip is row 2, as a spreadsheet shows it.
    return { trips: read.rows.map((r, i) => readTrip(r, i + 2)), mapped: read.mapped, unknown: read.unknown };
  }
  return { trips: (rows ?? []).map((r, i) => readTrip(r, i + 1)), mapped: null, unknown: [] };
}
// How many trip rows an input has, without reading them (for the price of a batch).
export function countRows({ rows, csv }) {
  if (csv !== undefined) return Math.max(0, parseCsv(csv).length - 1);
  return (rows ?? []).length;
}

// ---------- the engine ----------

const pick = (o, keys) => Object.fromEntries(keys.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));

// Periods with their last day filled in, oldest first.
function withEnds(table) {
  const periods = [...table.periods].sort((a, b) => (a.from < b.from ? -1 : 1));
  return periods.map((p, i) => ({ ...p, to: i + 1 < periods.length ? addDays(periods[i + 1].from, -1) : table.knownThrough }));
}

export function makeEngine(data) {
  const irs = { ...data.irs, periods: withEnds(data.irs) };
  const gsa = { ...data.gsa, periods: withEnds(data.gsa) };
  const rules = data.rules;
  const tables = { irs, gsa };
  const first = { irs: irs.periods[0].from, gsa: gsa.periods[0].from };

  const millsOf = (table, period, field) => {
    const v = period[field];
    if (v === null || v === undefined) return null;
    return table === 'irs' ? Math.round(Number(v) * 10) : Math.round(Number(v) * 1000);
  };

  function periodAt(tableKey, date) {
    const table = tables[tableKey];
    const i = table.periods.findIndex((p) => p.from <= date && date <= p.to);
    if (i >= 0) return { period: table.periods[i], index: i };
    if (date < first[tableKey]) {
      throw new MileageError(tableKey === 'irs'
        ? `IRS rates before ${longDate(first.irs)} are not loaded; this tool covers ${first.irs.slice(0, 4)} to ${table.knownThrough.slice(0, 4)}.`
        : `GSA rates before ${longDate(first.gsa)} are not loaded; the GSA table covers ${first.gsa.slice(0, 4)} onward.`, 'date');
    }
    throw new MileageError(`${tableKey === 'irs' ? 'The IRS has' : 'GSA has'} not announced rates for ${date.slice(0, 4)} yet; rates are loaded through ${longDate(table.knownThrough)} and are never guessed.`, 'date');
  }

  const sourceOf = (tableKey, period) => {
    if (tableKey === 'gsa') return { table: 'gsa', title: gsa.source.title, url: gsa.source.url, label: `GSA POV rates from ${longDate(period.from)}` };
    const doc = period.paidDateRule ?? period.notice ?? null;
    return {
      table: 'irs',
      title: irs.source.title,
      url: irs.source.url,
      release: period.release,
      label: `IRS ${period.release}${doc ? `, ${doc.document}` : ''}`,
      ...(doc ? { document: doc.document, documentUrl: doc.url } : {}),
    };
  };

  // The rate for one purpose on one date. paidDate applies the allowance rule of a mid-year IRS
  // announcement: an allowance paid before the change keeps the earlier rate even for later miles.
  function rate({ date, purpose = 'business', paidDate = null }) {
    const key = purposeOf(purpose);
    if (!key) throw new MileageError(`"${purpose}" is not a purpose. Use one of ${PURPOSE_KEYS.join(', ')}.`, 'purpose');
    if (!isRealDate(date)) throw new MileageError(`"${date}" is not a date written like 2026-07-14.`, 'date');
    if (paidDate !== null && !isRealDate(paidDate)) throw new MileageError(`"${paidDate}" is not a date written like 2026-07-20.`, 'paidDate');
    const p = PURPOSES[key];
    let { period, index } = periodAt(p.table, date);
    let basis = 'trip-date';
    let note = null;
    const rule = period.paidDateRule;
    if (p.table === 'irs' && key === 'business' && paidDate && rule && paidDate < period.from) {
      const earlier = tables.irs.periods[index - 1];
      note = `Paid ${longDate(paidDate)}, before the ${longDate(period.from)} change: under ${rule.document} an allowance paid before ${monthDay(period.from)} keeps the earlier rate, ${rateWords(millsOf('irs', earlier, p.field))}.`;
      period = earlier;
      basis = 'paid-date';
    } else if (p.table === 'irs' && key === 'business' && paidDate && rule) {
      note = `Driven and paid on or after ${longDate(period.from)}, so the ${rule.document} rate applies.`;
    }
    const mills = millsOf(p.table, period, p.field);
    if (mills === null) throw new MileageError(`GSA's page gives no ${p.name.toLowerCase()} rate for travel on ${longDate(date)}; it lists that rate only from ${longDate(gsa.periods.find((x) => x[p.field] !== null).from)}.`, 'purpose');
    return {
      date,
      paidDate: paidDate ?? null,
      purpose: key,
      purposeName: p.name,
      mills,
      cents: centsText(mills),
      dollars: dollarsText(mills),
      words: rateWords(mills),
      basis,
      period: { from: period.from, to: period.to, text: rangeText(period.from, period.to) },
      source: sourceOf(p.table, period),
      note,
    };
  }

  // Each trip priced: the exact amount (micro-dollars, a multiple of 10) and the rate behind it.
  function price(trip) {
    if (trip.to) {
      const a = rate({ date: trip.date, purpose: trip.purpose });
      const b = rate({ date: trip.to, purpose: trip.purpose });
      if (a.period.from !== b.period.from) {
        const change = b.period.from;
        throw new MileageError(`${trip.row ? `Row ${trip.row}: ` : ''}the trip from ${longDate(trip.date)} to ${longDate(trip.to)} crosses the rate change on ${longDate(change)}. Enter the miles before and from ${monthDay(change)} as two lines, each on its own date.`, 'trips');
      }
    }
    const r = rate({ date: trip.date, purpose: trip.purpose, paidDate: trip.purpose === 'business' ? trip.paidDate : null });
    return { ...trip, rate: r, exact: trip.miles * r.mills * 10 };
  }

  // Sum of exact amounts, rounded to the cent once per rate: miles at a rate x the rate, the way
  // the IRS figures a deduction. Lines carry their own rounded amounts for display.
  function byRate(lines, millsOf = (l) => l.rate.mills, milesOf = (l) => l.miles) {
    const groups = new Map();
    for (const l of lines) {
      const k = millsOf(l);
      groups.set(k, (groups.get(k) ?? 0) + milesOf(l));
    }
    let total = 0;
    for (const [mills, miles] of groups) total += roundCents(miles * mills * 10);
    return total;
  }

  // Period subtotals: one per purpose and rate period, in date order.
  function periodsOf(lines) {
    const map = new Map();
    for (const l of lines) {
      const k = `${l.purpose}|${l.rate.period.from}|${l.rate.mills}`;
      const g = map.get(k) ?? { purpose: l.purpose, purposeName: l.rate.purposeName, from: l.rate.period.from, to: l.rate.period.to, mills: l.rate.mills, rate: l.rate.words, source: l.rate.source.label, sourceUrl: l.rate.source.url, trips: 0, miles: 0 };
      g.trips += 1;
      g.miles += l.miles;
      map.set(k, g);
    }
    return [...map.values()]
      .sort((a, b) => (a.purpose === b.purpose ? (a.from < b.from ? -1 : a.from > b.from ? 1 : a.mills - b.mills) : PURPOSE_KEYS.indexOf(a.purpose) - PURPOSE_KEYS.indexOf(b.purpose)))
      .map((g) => ({ ...g, amount: roundCents(g.miles * g.mills * 10), milesText: milesText(g.miles), amountText: usd(roundCents(g.miles * g.mills * 10)) }));
  }

  const sum = (xs, f) => xs.reduce((a, x) => a + f(x), 0);

  function totalsOf(lines) {
    const purposes = PURPOSE_KEYS.filter((k) => lines.some((l) => l.purpose === k)).map((k) => {
      const ls = lines.filter((l) => l.purpose === k);
      const mileage = byRate(ls);
      const parking = sum(ls, (l) => l.parking);
      const tolls = sum(ls, (l) => l.tolls);
      return { purpose: k, purposeName: PURPOSES[k].name, trips: ls.length, miles: sum(ls, (l) => l.miles), mileage, parking, tolls, total: mileage + parking + tolls };
    });
    return {
      purposes,
      miles: sum(purposes, (p) => p.miles),
      mileage: sum(purposes, (p) => p.mileage),
      parkingAndTolls: sum(purposes, (p) => p.parking + p.tolls),
      total: sum(purposes, (p) => p.total),
    };
  }

  const lineOut = (l) => ({
    row: l.row,
    date: l.date,
    ...(l.to ? { endDate: l.to } : {}),
    purpose: l.purpose,
    miles: Number(plainMiles(l.miles)),
    rateCents: l.rate.cents,
    basis: l.rate.basis,
    periodFrom: l.rate.period.from,
    source: l.rate.source.label,
    amount: usd(l.exact),
    ...(l.parking ? { parking: usd(l.parking) } : {}),
    ...(l.tolls ? { tolls: usd(l.tolls) } : {}),
    ...(l.rate.note ? { note: l.rate.note } : {}),
  });

  // The sentence that answers a calculation: "2,600 x $0.725 + 1,600 x $0.76 = $3,101.00".
  function sentence(periods, totals, lines = []) {
    const parts = periods.map((g) => `${milesText(g.miles)} x ${dollarsText(g.mills)}`);
    const extra = totals.parkingAndTolls ? ` plus ${usd(totals.parkingAndTolls)} parking and tolls` : '';
    const lead = periods.length === 1
      ? `${milesText(periods[0].miles)} ${PURPOSES[periods[0].purpose].short} miles in ${periods[0].from.slice(0, 4)}`
      : describeSplit(periods, lines.some((l) => l.rate.basis === 'paid-date'));
    return `${lead}: ${parts.join(' + ')} = ${usd(totals.mileage)}${extra}${extra ? `, ${usd(totals.total)} in all` : ''}.`;
  }
  // byPaidDate: some miles take the earlier rate because of the date paid, so "before July 1"
  // would not be true of all of them.
  function describeSplit(periods, byPaidDate = false) {
    const purposes = [...new Set(periods.map((g) => g.purpose))];
    const miles = sum(periods, (g) => g.miles);
    if (purposes.length === 1) {
      const word = PURPOSES[purposes[0]].short;
      if (periods.length === 2 && periods[0].to.slice(0, 4) === periods[1].from.slice(0, 4)) {
        if (byPaidDate) return `${milesText(miles)} ${word} miles, ${milesText(periods[0].miles)} at the rate before ${longDate(periods[1].from)} (some by the date paid) and ${milesText(periods[1].miles)} at the rate from ${monthDay(periods[1].from)}`;
        return `${milesText(miles)} ${word} miles, ${milesText(periods[0].miles)} before ${longDate(periods[1].from)} and ${milesText(periods[1].miles)} from ${monthDay(periods[1].from)}`;
      }
      return `${milesText(miles)} ${word} miles across ${periods.length} rate periods`;
    }
    return `${milesText(miles)} miles for ${purposes.length} purposes`;
  }

  // ---------- calculate: a few trips or period totals ----------

  function calculate({ trips }) {
    if (!trips.length) throw new MileageError('Give at least one trip.', 'trips');
    const lines = trips.map((t, i) => price(t.row === undefined ? readTrip(t, i + 1) : t));
    const periods = periodsOf(lines);
    const totals = totalsOf(lines);
    return {
      op: 'calculate',
      answer: sentence(periods, totals, lines),
      total: usd(totals.total),
      mileage: usd(totals.mileage),
      parkingAndTolls: usd(totals.parkingAndTolls),
      miles: Number(plainMiles(totals.miles)),
      periods: periods.map(periodOut),
      purposes: totals.purposes.map(purposeOut),
      lines: lines.map(lineOut),
      sources: sourcesOf(lines),
    };
  }
  const periodOut = (g) => ({ purpose: g.purpose, from: g.from, to: g.to, rateCents: centsText(g.mills), rate: g.rate, trips: g.trips, miles: Number(plainMiles(g.miles)), amount: g.amountText, source: g.source });
  const purposeOut = (p) => ({ purpose: p.purpose, name: p.purposeName, trips: p.trips, miles: Number(plainMiles(p.miles)), mileage: usd(p.mileage), parkingAndTolls: usd(p.parking + p.tolls), total: usd(p.total) });
  function sourcesOf(lines) {
    const seen = new Map();
    for (const l of lines) {
      const s = l.rate.source;
      seen.set(s.label, { label: s.label, url: s.documentUrl ?? s.url });
    }
    return [...seen.values()];
  }

  // ---------- log checks (Publication 463, flags only) ----------

  const norm = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

  function checkTrips(lines, { commute = null, taxYear = null } = {}) {
    const flags = [];
    const flag = (row, code, message) => flags.push({ row, code, message });
    const seen = new Map();
    const late = rules?.recordedLateDays ?? 7;
    for (const l of lines) {
      if (l.purpose === 'business') {
        if (!l.destination) flag(l.row, 'missing-destination', 'No business destination (Pub 463, Table 5-1).');
        if (!l.businessPurpose) flag(l.row, 'missing-purpose', 'No business purpose (Pub 463, Table 5-1).');
      }
      if (taxYear && (l.date.slice(0, 4) !== String(taxYear) || (l.to && l.to.slice(0, 4) !== String(taxYear)))) flag(l.row, 'outside-year', `Dated outside ${taxYear}.`);
      if (l.odometerStart !== null && l.odometerEnd !== null) {
        const driven = l.odometerEnd - l.odometerStart;
        if (driven < 0) flag(l.row, 'odometer-reversed', 'The odometer end reading is lower than the start.');
        else if (Math.abs(driven - l.miles) >= 100) flag(l.row, 'odometer-mismatch', `The odometer readings give ${milesText(driven)} miles; the line says ${milesText(l.miles)}.`);
      }
      if (l.recordedOn) {
        const lag = daysBetween(l.to ?? l.date, l.recordedOn);
        if (lag > late) flag(l.row, 'recorded-late', `Recorded ${lag} days after the trip; Pub 463 treats a weekly log as timely.`);
        if (lag < 0) flag(l.row, 'recorded-early', 'Recorded before the trip date.');
      }
      if (commute && l.purpose === 'business') {
        const ends = [norm(l.start), norm(l.destination)];
        const pair = [norm(commute.home), norm(commute.workplace)];
        if ((ends[0] === pair[0] && ends[1] === pair[1]) || (ends[0] === pair[1] && ends[1] === pair[0])) {
          flag(l.row, 'commute', 'Matches the home and regular workplace you gave: commuting miles are not deductible (Pub 463).');
        }
      }
      const key = [l.employee, l.vehicle, l.date, l.miles, norm(l.destination), l.purpose].join('|');
      if (seen.has(key)) flag(l.row, 'duplicate', `Same date, miles and destination as row ${seen.get(key)}.`);
      else seen.set(key, l.row);
    }
    // The odometer runs forward through the year: a trip that starts below the last end overlaps it.
    const withOdo = lines.filter((l) => l.odometerStart !== null && l.odometerEnd !== null);
    const byVehicle = new Map();
    for (const l of withOdo) byVehicle.set(l.vehicle, [...(byVehicle.get(l.vehicle) ?? []), l]);
    for (const ls of byVehicle.values()) {
      ls.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.odometerStart - b.odometerStart));
      for (let i = 1; i < ls.length; i++) {
        if (ls[i].odometerStart < ls[i - 1].odometerEnd) flag(ls[i].row, 'odometer-overlap', `The odometer starts at ${milesText(ls[i].odometerStart)}, below the ${milesText(ls[i - 1].odometerEnd)} where row ${ls[i - 1].row} ended.`);
      }
    }
    return flags.sort((a, b) => (a.row ?? 0) - (b.row ?? 0));
  }

  // ---------- batch: an employee trips spreadsheet ----------

  // employerRate: { cents } for one rate, or { schedule: [{ from, cents }] } effective-dated.
  function employerMillsAt(employerRate, date) {
    if (!employerRate) return null;
    if (employerRate.mills !== undefined) return employerRate.mills;
    const steps = [...employerRate.schedule].sort((a, b) => (a.from < b.from ? -1 : 1));
    const step = steps.filter((s) => s.from <= date).pop();
    if (!step) throw new MileageError(`The employer rate schedule starts ${longDate(steps[0].from)}, after a trip on ${longDate(date)}.`, 'employerRate');
    return step.mills;
  }

  function batch({ trips, employerRate = null, commute = null, taxYear = null }) {
    if (!trips.length) throw new MileageError('The file has no trips.', 'trips');
    const lines = trips.map((t) => {
      const l = price(t);
      const empMills = employerMillsAt(employerRate, l.date);
      const due = empMills === null ? l.exact : l.miles * empMills * 10;
      const paid = l.paidAmount !== null ? l.paidAmount : l.paidRate !== null ? l.miles * l.paidRate * 10 : null;
      const allowance = paid === null ? due : Math.max(paid, due);
      const over = l.purpose === 'business' && allowance > l.exact;
      return { ...l, empMills, due, paid, allowance, codeL: over ? l.exact : 0, box1: over ? allowance - l.exact : 0 };
    });
    const flags = checkTrips(lines, { commute, taxYear });
    const flagsByRow = new Map();
    for (const f of flags) flagsByRow.set(f.row, [...(flagsByRow.get(f.row) ?? []), f.code]);

    const names = [...new Set(lines.map((l) => l.employee))];
    const employees = names.map((name) => {
      const ls = lines.filter((l) => l.employee === name);
      const paidRows = ls.filter((l) => l.paid !== null);
      const irsAmount = byRate(ls);
      const due = employerRate ? byRate(ls, (l) => l.empMills) : irsAmount;
      const dueOnPaid = employerRate ? byRate(paidRows, (l) => l.empMills) : byRate(paidRows);
      const paid = roundCents(sum(paidRows, (l) => l.paid));
      const parking = sum(ls, (l) => l.parking);
      const tolls = sum(ls, (l) => l.tolls);
      return {
        employee: name || '(no name)',
        trips: ls.length,
        miles: sum(ls, (l) => l.miles),
        irsAmount,
        due,
        parking,
        tolls,
        reimbursement: due + parking + tolls,
        paidRows: paidRows.length,
        paid,
        dueOnPaid,
        trueUp: paidRows.length ? dueOnPaid - paid : 0,
        codeL: roundCents(sum(ls, (l) => l.codeL)),
        box1: roundCents(sum(ls, (l) => l.box1)),
        periods: periodsOf(ls),
        flagged: ls.filter((l) => flagsByRow.has(l.row)).length,
      };
    });
    const totals = {
      trips: lines.length,
      miles: sum(employees, (e) => e.miles),
      irsAmount: sum(employees, (e) => e.irsAmount),
      due: sum(employees, (e) => e.due),
      parkingAndTolls: sum(employees, (e) => e.parking + e.tolls),
      reimbursement: sum(employees, (e) => e.reimbursement),
      paid: sum(employees, (e) => e.paid),
      paidRows: sum(employees, (e) => e.paidRows),
      trueUpOwed: sum(employees.filter((e) => e.trueUp > 0), (e) => e.trueUp),
      trueUpOver: -sum(employees.filter((e) => e.trueUp < 0), (e) => e.trueUp),
      codeL: sum(employees, (e) => e.codeL),
      box1: sum(employees, (e) => e.box1),
    };
    const periods = periodsOf(lines);
    return {
      op: 'batch',
      answer: batchSentence(totals, employees, !!employerRate),
      totals: {
        trips: totals.trips,
        employees: employees.length,
        miles: Number(plainMiles(totals.miles)),
        irsAmount: usd(totals.irsAmount),
        due: usd(totals.due),
        parkingAndTolls: usd(totals.parkingAndTolls),
        reimbursement: usd(totals.reimbursement),
        paid: totals.paidRows ? usd(totals.paid) : null,
        trueUpOwed: usd(totals.trueUpOwed),
        overpaid: usd(totals.trueUpOver),
        box12CodeL: usd(totals.codeL),
        box1Wages: usd(totals.box1),
        flagged: flags.length,
      },
      employees: employees.map((e) => ({
        employee: e.employee,
        trips: e.trips,
        miles: Number(plainMiles(e.miles)),
        irsAmount: usd(e.irsAmount),
        due: usd(e.due),
        parkingAndTolls: usd(e.parking + e.tolls),
        reimbursement: usd(e.reimbursement),
        paid: e.paidRows ? usd(e.paid) : null,
        trueUp: e.paidRows ? usd(e.trueUp) : null,
        box12CodeL: usd(e.codeL),
        box1Wages: usd(e.box1),
        periods: e.periods.map(periodOut),
      })),
      periods: periods.map(periodOut),
      flags,
      lines: lines.map((l) => ({
        ...lineOut(l),
        employee: l.employee,
        due: usd(l.due),
        ...(l.empMills !== null ? { employerRateCents: centsText(l.empMills) } : {}),
        ...(l.paid !== null ? { paid: usd(l.paid), trueUp: usd(l.due - l.paid) } : {}),
        ...(l.box1 ? { box12CodeL: usd(l.codeL), box1Wages: usd(l.box1) } : {}),
      })),
      csv: batchCsv(lines, flagsByRow),
      employeesCsv: employeesCsv(employees),
      sources: sourcesOf(lines),
    };
  }

  function batchSentence(t, employees, custom) {
    const who = `${grouped(String(t.trips))} ${t.trips === 1 ? 'trip' : 'trips'} for ${employees.length} ${employees.length === 1 ? 'employee' : 'employees'}`;
    const parts = [`${usd(t.due)} due ${custom ? 'at your rate' : 'at the IRS rate in force on each trip date'}`];
    if (t.parkingAndTolls) parts.push(`plus ${usd(t.parkingAndTolls)} parking and tolls`);
    if (t.paidRows) {
      if (t.trueUpOwed) parts.push(`${usd(t.trueUpOwed)} still owed on trips already paid`);
      if (t.trueUpOver) parts.push(`${usd(t.trueUpOver)} overpaid`);
      if (!t.trueUpOwed && !t.trueUpOver) parts.push('nothing owed on trips already paid');
    }
    if (t.box1) parts.push(`${usd(t.box1)} above the federal rate is taxable wages (W-2 box 1)`);
    return `${who}: ${parts.join('; ')}.`;
  }

  // ---------- log: one vehicle, one tax year ----------

  function logData({ trips, vehicle, taxYear, odometerStart = null, odometerEnd = null, businessStartDate = null, commute = null, fleetOfFiveOrMore = false }) {
    if (!trips.length) throw new MileageError('The log has no trips.', 'trips');
    const names = [...new Map(trips.filter((t) => t.vehicle).map((t) => [t.vehicle.toLowerCase(), t.vehicle])).values()];
    if (names.length > 1) throw new MileageError(`The trips name ${names.length} vehicles (${names.slice(0, 3).join(', ')}). A log is for one vehicle: send each vehicle's trips on their own.`, 'trips');
    const outside = trips.find((t) => t.date.slice(0, 4) !== String(taxYear) || (t.to && t.to.slice(0, 4) !== String(taxYear)));
    if (outside) throw new MileageError(`${outside.row ? `Row ${outside.row}` : 'A trip'} is dated ${longDate(outside.date)}, outside tax year ${taxYear}.`, 'trips');
    const lines = trips.map(price).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.row ?? 0) - (b.row ?? 0)));
    const flags = checkTrips(lines, { commute });
    const yearFlag = (code, message) => flags.push({ row: null, code, message });
    let yearMiles = null;
    if (odometerStart !== null && odometerEnd !== null) {
      if (odometerEnd < odometerStart) yearFlag('year-odometer-reversed', 'The year-end odometer reading is lower than the year-start reading.');
      else yearMiles = odometerEnd - odometerStart;
    } else yearFlag('no-year-total', 'No odometer readings for the start and end of the year, so the total miles for the year are missing (Pub 463, Table 5-1).');
    if (!businessStartDate) yearFlag('no-business-start', 'No date the vehicle was first used for business (Pub 463, Table 5-1).');
    if (fleetOfFiveOrMore) yearFlag('five-or-more', 'Five or more vehicles used for business at the same time: the standard mileage rate is not allowed for any of them (Pub 463).');
    const business = lines.filter((l) => l.purpose === 'business');
    const businessMiles = sum(business, (l) => l.miles);
    if (yearMiles !== null && businessMiles > yearMiles) yearFlag('business-over-total', `Business miles (${milesText(businessMiles)}) are more than the year's total from the odometer (${milesText(yearMiles)}).`);
    const periods = periodsOf(lines);
    const totals = totalsOf(lines);
    const bizTotals = totals.purposes.find((p) => p.purpose === 'business');
    const pct = yearMiles ? Math.round((businessMiles / yearMiles) * 1000) / 10 : null;
    return { lines, flags, periods, totals, bizTotals, businessMiles, yearMiles, pct, vehicle, taxYear, odometerStart, odometerEnd, businessStartDate };
  }

  function log(args) {
    const d = logData(args);
    const { lines, flags, periods, totals, bizTotals, businessMiles, yearMiles, pct, vehicle, taxYear, odometerStart, odometerEnd, businessStartDate } = d;
    const bizPeriods = periods.filter((g) => g.purpose === 'business');
    const answer = bizTotals
      ? `${taxYear} log for ${vehicle}: ${milesText(businessMiles)} business miles (${bizPeriods.map((g) => `${milesText(g.miles)} at ${centsText(g.mills)} cents`).join(', ')}) = ${usd(bizTotals.mileage)} at the standard mileage rate${bizTotals.parking + bizTotals.tolls ? `, plus ${usd(bizTotals.parking + bizTotals.tolls)} business parking and tolls` : ''}; ${flags.length} ${flags.length === 1 ? 'entry' : 'entries'} flagged.`
      : `${taxYear} log for ${vehicle}: no business trips; ${totals.purposes.map((p) => `${milesText(p.miles)} ${p.purposeName.toLowerCase()} miles = ${usd(p.mileage)}`).join(', ')}; ${flags.length} ${flags.length === 1 ? 'entry' : 'entries'} flagged.`;
    return {
      op: 'log',
      answer,
      vehicle,
      taxYear,
      summary: {
        trips: lines.length,
        businessMiles: Number(plainMiles(businessMiles)),
        standardMileageAmount: usd(bizTotals?.mileage ?? 0),
        businessParkingAndTolls: usd((bizTotals?.parking ?? 0) + (bizTotals?.tolls ?? 0)),
        yearMiles: yearMiles === null ? null : Number(plainMiles(yearMiles)),
        businessUsePercent: pct,
        businessStartDate,
        odometerStart: odometerStart === null ? null : Number(plainMiles(odometerStart)),
        odometerEnd: odometerEnd === null ? null : Number(plainMiles(odometerEnd)),
      },
      periods: periods.map(periodOut),
      purposes: totals.purposes.map(purposeOut),
      flags,
      lines: lines.map((l) => ({ ...lineOut(l), start: l.start, destination: l.destination, businessPurpose: l.businessPurpose })),
      csv: logCsv(lines),
      sources: sourcesOf(lines),
    };
  }

  // ---------- CSV out ----------

  const csvField = (v) => {
    let s = v === null || v === undefined ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s)) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const toCsv = (columns, rows) => [columns, ...rows].map((r) => r.map(csvField).join(',')).join('\r\n') + '\r\n';

  function batchCsv(lines, flagsByRow) {
    return toCsv(
      ['row', 'employee', 'date', 'end_date', 'purpose', 'miles', 'destination', 'business_purpose', 'irs_rate_cents', 'rate_basis', 'irs_source', 'irs_amount', 'employer_rate_cents', 'due', 'parking', 'tolls', 'paid', 'true_up', 'w2_box12_code_l', 'w2_box1_excess', 'flags'],
      lines.map((l) => [l.row, l.employee, l.date, l.to ?? '', l.purpose, plainMiles(l.miles), l.destination, l.businessPurpose, l.rate.cents, l.rate.basis, l.rate.source.label,
        plainUsd(l.exact), l.empMills === null ? '' : centsText(l.empMills), plainUsd(l.due), plainUsd(l.parking), plainUsd(l.tolls),
        l.paid === null ? '' : plainUsd(l.paid), l.paid === null ? '' : plainUsd(l.due - l.paid),
        l.box1 ? plainUsd(l.codeL) : '', l.box1 ? plainUsd(l.box1) : '', (flagsByRow.get(l.row) ?? []).join(' ')]),
    );
  }
  function employeesCsv(employees) {
    return toCsv(
      ['employee', 'trips', 'miles', 'irs_amount', 'due', 'parking_and_tolls', 'reimbursement', 'paid', 'true_up', 'w2_box12_code_l', 'w2_box1_excess', 'flagged_rows'],
      employees.map((e) => [e.employee, e.trips, plainMiles(e.miles), plainUsd(e.irsAmount), plainUsd(e.due), plainUsd(e.parking + e.tolls), plainUsd(e.reimbursement),
        e.paidRows ? plainUsd(e.paid) : '', e.paidRows ? plainUsd(e.trueUp) : '', plainUsd(e.codeL), plainUsd(e.box1), e.flagged]),
    );
  }
  function logCsv(lines) {
    return toCsv(
      ['date', 'end_date', 'start', 'destination', 'business_purpose', 'purpose', 'miles', 'odometer_start', 'odometer_end', 'rate_cents', 'amount', 'parking', 'tolls', 'source'],
      lines.map((l) => [l.date, l.to ?? '', l.start, l.destination, l.businessPurpose, l.purpose, plainMiles(l.miles),
        l.odometerStart === null ? '' : plainMiles(l.odometerStart), l.odometerEnd === null ? '' : plainMiles(l.odometerEnd),
        l.rate.cents, plainUsd(l.exact), plainUsd(l.parking), plainUsd(l.tolls), l.rate.source.label]),
    );
  }

  // The rate tables as data, for the page and the API.
  const rates = () => ({
    op: 'rates',
    irs: pick(data.irs, ['source', 'knownThrough', 'periods']),
    gsa: pick(data.gsa, ['source', 'knownThrough', 'nauticalToStatute', 'periods']),
    rules: data.rules,
  });

  return { rate, calculate, batch, log, logData, rates, checkTrips, price, periodsOf, irs, gsa, rules };
}

// Airplane distance: nautical miles to statute miles, rounded to the hundredth (GSA's conversion).
export function nauticalToStatute(nm, factor = '1.15077945') {
  const h = scaled(nm, 2);
  if (h === null) return null;
  return Math.round(h * Number(factor)) / 100;
}

// A blank log to fill in, with the columns the batch and log read back.
export const TEMPLATE_COLUMNS = ['date', 'end_date', 'vehicle', 'employee', 'start', 'destination', 'business_purpose', 'purpose', 'miles', 'odometer_start', 'odometer_end', 'parking', 'tolls', 'paid_amount', 'paid_date', 'recorded_on'];
