// IFTA quarterly return: miles and fuel by jurisdiction, per fuel type, at the quarter's rates
// from the IFTA tax rate matrix, with a reconciliation of the trip sheets and a check of each
// record against the elements an auditor asks for.
//
// Pure and dependency-free: the server (tool.js) and the page load this same file. The rate matrix
// and the rules are not in here; makeEngine(data) takes them (data/ifta-rates.json and
// data/ifta-rules.json on the server, the published rates example in the browser), so both sides
// work from the same dated tables.
//
// The method, line by line, is the one Oregon DOT prints on Form 735-9740 (03-26):
//  - Miles and gallons are rounded to whole numbers (525.5 is 526).
//  - Fleet MPG for a fuel type = total miles (IFTA plus non-IFTA) / total gallons, carried to three
//    decimals and then rounded to two (6.155 is 6.16).
//  - Taxable gallons in a jurisdiction = its taxable miles / that MPG, rounded to a whole number.
//  - Net taxable gallons = taxable gallons - tax-paid gallons bought there; tax = net x the rate,
//    in dollars and cents (a negative figure is a credit).
//  - A surcharge (Indiana, Kentucky, Virginia rows of the matrix) = taxable gallons x the surcharge
//    rate, with no credit for fuel bought there.
//  - Interest on a late return: tax due on each line x the IFTA monthly rate for each month or
//    part of a month late, never on credits; penalty: the greater of $50 or 10% of the net tax.
// Rates are kept as ten-thousandths of a dollar (the matrix prints four decimals), money as whole
// cents, so every step is exact integer arithmetic.

export const ENGINE_VERSION = 'ifta-calculator 1.0';
export const QUARTER_RE = /^(\d{4})Q([1-4])$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export class IftaError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'IftaError';
    this.field = field ?? null;
  }
}

// ---------- dates ----------

export function isRealDate(s) {
  const m = DATE_RE.exec(s ?? '');
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}
const dayNumber = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86400000;
const fromDayNumber = (n) => new Date(n * 86400000).toISOString().slice(0, 10);
const weekday = (iso) => new Date(dayNumber(iso) * 86400000).getUTCDay();
// The last day of month m (1 to 12, or 13 for January of the next year) of year y.
const monthEnd = (y, m) => fromDayNumber(Date.UTC(y, m, 0) / 86400000);
export const longDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;

// "2026Q3" as "3rd quarter 2026 (July 1 to September 30)".
export function quarterWords(q) {
  const m = QUARTER_RE.exec(q);
  const n = +m[2];
  const ord = ['1st', '2nd', '3rd', '4th'][n - 1];
  return `${ord} quarter ${m[1]}`;
}
export function quarterRange(q) {
  const m = QUARTER_RE.exec(q);
  const y = +m[1];
  const n = +m[2];
  return { from: `${y}-${String(3 * n - 2).padStart(2, '0')}-01`, to: monthEnd(y, 3 * n) };
}

// The statutory due date (the last day of the month after the quarter) and the date it moves to
// when that falls on a Saturday or Sunday (Virginia DMV: the next business day). January 31,
// April 30, July 31 and October 31 are never a US federal holiday, so only weekends move them.
export function dueDate(q) {
  const m = QUARTER_RE.exec(q);
  const y = +m[1];
  const n = +m[2];
  const statutory = monthEnd(y, 3 * n + 1);
  let due = statutory;
  while (weekday(due) === 0 || weekday(due) === 6) due = fromDayNumber(dayNumber(due) + 1);
  return { quarter: q, statutory, due, moved: due !== statutory };
}

// ---------- numbers ----------

// "0.3100" as 3100 ten-thousandths of a dollar.
export function rate10k(s) {
  const m = /^(\d+)\.(\d{1,4})$/.exec(s);
  if (!m) throw new Error(`Bad rate ${s}`);
  return Number(m[1]) * 10000 + Number(m[2].padEnd(4, '0'));
}
export const rateText = (r) => `${r < 0 ? '-' : ''}$${Math.floor(Math.abs(r) / 10000)}.${String(Math.abs(r) % 10000).padStart(4, '0')}`;
// Half up, on a non-negative number (miles, gallons).
export const roundWhole = (x) => Math.floor(x + 0.5 + 1e-9);
// a / b rounded half away from zero, for integers (b > 0).
const divRound = (a, b) => (a < 0 ? -Math.floor((-a * 2 + b) / (2 * b)) : Math.floor((a * 2 + b) / (2 * b)));

export function money(cents) {
  const neg = cents < 0;
  const c = Math.abs(Math.round(cents));
  const dollars = String(Math.floor(c / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}$${dollars}.${String(c % 100).padStart(2, '0')}`;
}
export const toDollars = (cents) => Math.round(cents) / 100;
export const whole = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const mpgText = (m100) => `${Math.floor(m100 / 100)}.${String(m100 % 100).padStart(2, '0')}`;

// Fleet MPG in hundredths: miles / gallons carried to three decimals (cut, not rounded), then
// rounded half up to two, as Form 9740 column 5 says.
export function mpg100(miles, gallons) {
  const t3 = Math.floor((miles * 1000) / gallons);
  return Math.floor((t3 + 5) / 10);
}
// Taxable gallons: taxable miles / MPG, rounded to a whole number.
export const taxableGallons = (taxableMiles, m100) => divRound(taxableMiles * 100, m100);

// ---------- CSV ----------

// RFC 4180 rows, so a seller's address with a comma in quotes reads as one field.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  const s = String(text ?? '').replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}
// A cell for a CSV we write: quoted when needed, and a leading = + - @ defused so a spreadsheet
// never runs it as a formula.
export function csvCell(v) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export const csvLine = (cells) => cells.map(csvCell).join(',');

export const TRIP_COLUMNS = ['unit', 'trip', 'start_date', 'end_date', 'from', 'to', 'route', 'odo_start', 'odo_end', 'jurisdiction', 'miles', 'taxable_miles'];
export const RECEIPT_COLUMNS = ['unit', 'date', 'seller', 'seller_address', 'purchaser', 'jurisdiction', 'gallons', 'fuel', 'price_per_gallon', 'total', 'tax_paid'];
export const VEHICLE_COLUMNS = ['unit', 'vin', 'fuel'];

// The blank trip sheet (one row per jurisdiction a trip crossed; the trip's own fields on its
// first row) and receipt list, as CSV templates with one example row each.
export function templateCsv(kind) {
  if (kind === 'trips') {
    return [csvLine(TRIP_COLUMNS),
      csvLine(['101', 'T1', '2026-07-06', '2026-07-08', 'Joplin, MO', 'Dallas, TX', 'I-44 W, US-69 S, I-75 S', '412050', '412480', 'MO', '45', '45']),
      csvLine(['101', 'T1', '', '', '', '', '', '', '', 'OK', '250', '250']),
      csvLine(['101', 'T1', '', '', '', '', '', '', '', 'TX', '135', '135']), ''].join('\r\n');
  }
  if (kind === 'receipts') {
    return [csvLine(RECEIPT_COLUMNS),
      csvLine(['101', '2026-07-07', 'Example Travel Center', '100 Main St, Big Cabin, OK', 'Your Company LLC', 'OK', '120.5', 'special_diesel', '3.899', '', 'yes']), ''].join('\r\n');
  }
  return [csvLine(VEHICLE_COLUMNS), csvLine(['101', '1XKYDP9X0LJ000000', 'special_diesel']), ''].join('\r\n');
}

const num = (s) => {
  const t = String(s ?? '').trim().replace(/,/g, '');
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
};
const txt = (s) => { const t = String(s ?? '').trim(); return t === '' ? null : t; };

function headed(text, columns, what) {
  const rows = parseCsv(text);
  if (!rows.length) return [];
  const head = rows[0].map((x) => x.trim().toLowerCase().replace(/\s+/g, '_'));
  const missing = columns.filter((c) => !head.includes(c));
  if (missing.length === columns.length) throw new IftaError(`The ${what} need a header row: ${columns.join(',')}.`, what);
  return rows.slice(1).map((r, i) => ({ line: i + 2, get: (c) => (head.indexOf(c) === -1 ? '' : r[head.indexOf(c)] ?? '') }));
}

// CSV trip sheet to the API's trips: rows with the same unit and trip id are one trip.
export function tripsFromCsv(text) {
  const trips = [];
  const byKey = new Map();
  for (const r of headed(text, TRIP_COLUMNS, 'trips')) {
    const unit = txt(r.get('unit'));
    if (!unit) throw new IftaError(`Trip sheet line ${r.line}: the unit is missing.`, 'trips');
    const id = txt(r.get('trip')) ?? `line ${r.line}`;
    const key = `${unit}\u0000${id}`;
    let t = byKey.get(key);
    if (!t) {
      t = { unit, trip: id.slice(0, 40), miles: [] };
      for (const [col, field] of [['start_date', 'startDate'], ['end_date', 'endDate'], ['from', 'from'], ['to', 'to'], ['route', 'route']]) {
        const v = txt(r.get(col));
        if (v) t[field] = v;
      }
      for (const [col, field] of [['odo_start', 'odoStart'], ['odo_end', 'odoEnd']]) {
        const v = num(r.get(col));
        if (Number.isNaN(v)) throw new IftaError(`Trip sheet line ${r.line}: ${col} is not a number.`, 'trips');
        if (v !== null) t[field] = v;
      }
      byKey.set(key, t);
      trips.push(t);
    }
    const j = txt(r.get('jurisdiction'))?.toUpperCase();
    const miles = num(r.get('miles'));
    const taxable = num(r.get('taxable_miles'));
    if (!j && miles === null) continue;
    if (!j || miles === null || Number.isNaN(miles) || Number.isNaN(taxable)) throw new IftaError(`Trip sheet line ${r.line}: give a jurisdiction code and its miles.`, 'trips');
    t.miles.push({ jurisdiction: j, miles, ...(taxable !== null ? { taxableMiles: taxable } : {}) });
  }
  return trips;
}

export function receiptsFromCsv(text) {
  return headed(text, RECEIPT_COLUMNS, 'receipts').map((r) => {
    const out = { unit: txt(r.get('unit')) ?? '' };
    for (const [col, field] of [['date', 'date'], ['seller', 'seller'], ['seller_address', 'sellerAddress'], ['purchaser', 'purchaser'], ['fuel', 'fuel']]) {
      const v = txt(r.get(col));
      if (v) out[field] = field === 'fuel' ? v.toLowerCase().replace(/[\s-]+/g, '_') : v;
    }
    const j = txt(r.get('jurisdiction'));
    if (j) out.jurisdiction = j.toUpperCase();
    for (const [col, field] of [['gallons', 'gallons'], ['price_per_gallon', 'pricePerGallon'], ['total', 'total']]) {
      const v = num(r.get(col));
      if (Number.isNaN(v)) throw new IftaError(`Receipt line ${r.line}: ${col} is not a number.`, 'receipts');
      if (v !== null) out[field] = v;
    }
    const paid = txt(r.get('tax_paid'));
    if (paid && /^(no|n|false|0)$/i.test(paid)) out.taxPaid = false;
    return out;
  });
}

export function vehiclesFromCsv(text) {
  return headed(text, VEHICLE_COLUMNS, 'vehicles').map((r) => {
    const out = { unit: txt(r.get('unit')) ?? '' };
    const vin = txt(r.get('vin'));
    if (vin) out.vin = vin;
    const fuel = txt(r.get('fuel'));
    if (fuel) out.fuel = fuel.toLowerCase().replace(/[\s-]+/g, '_');
    return out;
  });
}

// ---------- the engine ----------

export function makeEngine(data) {
  const { rates, rules } = data;
  const FUELS = rates.fuels.map((f) => f.key);
  const fuelName = Object.fromEntries(rates.fuels.map((f) => [f.key, f.name]));
  const COMPUTED = new Set(rules.computedFuels);
  const JUR = new Map(rates.jurisdictions.map((j) => [j.code, j]));
  const NON_IFTA = new Map(rules.nonIfta.map((j) => [j.code, j]));
  const nameOf = (code) => JUR.get(code)?.name ?? NON_IFTA.get(code)?.name ?? code;
  const quarters = [...rates.quarters].sort((a, b) => (a.quarter < b.quarter ? -1 : 1));
  const byQuarter = new Map(quarters.map((q) => [q.quarter, q]));
  const first = quarters[0].quarter;
  const last = quarters[quarters.length - 1].quarter;
  const interest = rules.interest.periods.map((p) => ({ ...p, micro: Math.round(Number(p.monthly) * 1e6) }));

  function quarterData(q, field = 'quarter') {
    if (!QUARTER_RE.test(q ?? '')) throw new IftaError('A quarter is written like 2026Q3.', field);
    const d = byQuarter.get(q);
    if (d) return d;
    const when = q > last ? 'is not in the published copies of the matrix this tool has read yet' : 'is older than the matrices this tool keeps';
    throw new IftaError(`No rate table is on file for ${q}: it ${when}. This tool has final rates for ${quarters.map((x) => x.quarter).join(', ')}.`, field);
  }

  function checkFuel(fuel, field = 'fuel') {
    if (!FUELS.includes(fuel)) throw new IftaError(`Fuel must be one of ${FUELS.join(', ')}.`, field);
    if (!COMPUTED.has(fuel)) throw new IftaError(`${fuelName[fuel]} is not computed: ${rules.refusedFuels[fuel]}`, field);
  }

  // The rate (and surcharge) for one jurisdiction and fuel in a quarter, or why there is none.
  function rateFor(qd, code, fuel) {
    const i = FUELS.indexOf(fuel);
    const row = qd.rows.find((r) => r.code === code);
    const sur = qd.surcharges.find((r) => r.code === code);
    const disputed = qd.disputed.find((d) => d.code === code && !d.surcharge && d.fuels.includes(fuel));
    const surRate = sur && sur.rates[i] !== null ? rate10k(sur.rates[i]) : null;
    if (disputed) {
      const said = (src) => Object.entries(src).map(([f, v]) => `${fuelName[f].toLowerCase()} ${v === null ? '-' : `$${v}`}`).join(', ');
      return { kind: 'disputed', rate: null, surcharge: surRate, reason: `The two official copies of the ${qd.quarter} matrix disagree for ${nameOf(code)} (Oregon DOT: ${said(disputed.oregon)}; New York State Tax: ${said(disputed.newYork)}), so this tool will not price ${nameOf(code)} ${fuelName[fuel].toLowerCase()} for ${qd.quarter}. Use the rate your base jurisdiction's return or portal shows.` };
    }
    if (row?.noIftaRate) return { kind: 'none', rate: 0, surcharge: null, reason: `${nameOf(code)} publishes no IFTA fuel tax rate (the New York copy of the matrix shows N/A for every fuel and the Oregon copy leaves Oregon out). Its miles and fuel still go on the return, and Oregon's weight-mile tax is a separate report.` };
    if (!row || row.rates[i] === null) return { kind: 'missing', rate: null, surcharge: surRate, reason: `The ${qd.quarter} matrix shows no ${fuelName[fuel].toLowerCase()} rate for ${nameOf(code)} ("-" in the Oregon copy), so this tool will not price that line. Ask your base jurisdiction how to report it.` };
    return { kind: 'rate', rate: rate10k(row.rates[i]), surcharge: surRate, footnote: row.footnote ?? null };
  }

  const isMember = (code) => JUR.has(code);
  const isKnown = (code) => JUR.has(code) || NON_IFTA.has(code);
  function checkJurisdiction(code, field) {
    if (!isKnown(code)) throw new IftaError(`"${code}" is not an IFTA jurisdiction code (two letters, like TX or ON) or one of the non-IFTA areas ${[...NON_IFTA.keys()].join(', ')}.`, field);
  }

  // One fuel type's lines from per-jurisdiction totals: { code -> { miles, taxableMiles, gallons } }
  // plus all the fuel put in the tanks. The Form 9740 columns, in order.
  function fuelLines(qd, fuel, per, totalGallonsRaw) {
    let iftaMiles = 0;
    let nonIftaMiles = 0;
    const rounded = [];
    for (const [code, v] of [...per.entries()].sort(([a], [b]) => nameOf(a).localeCompare(nameOf(b)))) {
      const miles = roundWhole(v.miles);
      const taxable = roundWhole(v.taxableMiles ?? v.miles);
      const gallons = roundWhole(v.gallons ?? 0);
      if (isMember(code)) iftaMiles += miles; else nonIftaMiles += miles;
      rounded.push({ code, miles, taxable, gallons });
    }
    const allMiles = iftaMiles + nonIftaMiles;
    const totalGallons = roundWhole(totalGallonsRaw);
    if (allMiles > 0 && totalGallons === 0) throw new IftaError(`${fuelName[fuel]}: there are miles but no fuel, so fleet MPG cannot be worked out. Give all the fuel put in the tanks this quarter.`, 'totalGallons');
    const m100 = totalGallons ? mpg100(allMiles, totalGallons) : 0;
    if (allMiles > 0 && m100 === 0) throw new IftaError(`${fuelName[fuel]}: fleet MPG rounds to 0.00. Check the miles and gallons.`, 'totalGallons');
    const lines = [];
    const refused = [];
    let tax = 0;
    for (const r of rounded) {
      if (!isMember(r.code)) continue;
      const rt = rateFor(qd, r.code, fuel);
      if (rt.kind === 'disputed' || rt.kind === 'missing') {
        if (r.miles || r.gallons) refused.push(rt.reason);
        continue;
      }
      const tg = allMiles ? taxableGallons(r.taxable, m100) : 0;
      const net = tg - r.gallons;
      const lineTax = divRound(net * rt.rate, 100);
      const surTax = rt.surcharge !== null ? divRound(tg * rt.surcharge, 100) : null;
      tax += lineTax + (surTax ?? 0);
      lines.push({
        jurisdiction: r.code,
        name: nameOf(r.code),
        totalMiles: r.miles,
        taxableMiles: r.taxable,
        taxableGallons: tg,
        taxPaidGallons: r.gallons,
        netTaxableGallons: net,
        rate: rt.rate / 10000,
        tax: toDollars(lineTax),
        surcharge: surTax === null ? null : { rate: rt.surcharge / 10000, taxableGallons: tg, tax: toDollars(surTax) },
        ...(rt.kind === 'none' ? { note: rt.reason } : {}),
        ...(rt.footnote ? { matrixFootnote: rt.footnote } : {}),
        display: { rate: rt.kind === 'none' ? 'none' : rateText(rt.rate), tax: money(lineTax), surcharge: surTax === null ? null : money(surTax) },
        cents: lineTax + (surTax ?? 0),
      });
    }
    if (refused.length) throw new IftaError([...new Set(refused)].join(' '), 'jurisdiction');
    const warnings = [];
    if (allMiles && (m100 < 50 || m100 > 2000)) warnings.push({ code: 'mpg_band', message: `${fuelName[fuel]} fleet MPG is ${mpgText(m100)}. Oregon DOT notes the average is typically .50 through 20 and may ask for documents outside that band.` });
    return {
      fuel,
      name: fuelName[fuel],
      iftaMiles,
      nonIftaMiles,
      totalMiles: allMiles,
      totalGallons,
      mpg: m100 / 100,
      lines: lines.map(({ cents, ...l }) => l),
      tax: toDollars(tax),
      display: { mpg: mpgText(m100), tax: money(tax) },
      cents: tax,
      warnings,
    };
  }

  function rateStatus(qd) {
    return {
      quarter: qd.quarter,
      status: qd.status,
      source: qd.primary.name,
      sourceUrl: qd.primary.url,
      crossCheck: qd.crossCheck.name,
      crossCheckUrl: qd.crossCheck.url,
      readOn: qd.primary.readOn,
      words: `${qd.label} rates marked FINAL in the Oregon DOT copy of the IFTA matrix, checked against New York State Tax's IFTA-105 table for gasoline, diesel, propane, CNG, ethanol and biodiesel (both read ${longDate(qd.primary.readOn)}).`,
    };
  }

  // ---------- estimate from totals ----------

  function estimate({ quarter, fuel, rows, nonIftaMiles = 0, totalGallons }) {
    const qd = quarterData(quarter);
    checkFuel(fuel);
    const per = new Map();
    for (const [i, r] of rows.entries()) {
      checkJurisdiction(r.jurisdiction, `rows.${i}.jurisdiction`);
      if (r.taxableMiles !== undefined && r.taxableMiles > r.miles) throw new IftaError(`${nameOf(r.jurisdiction)}: taxable miles are more than total miles.`, `rows.${i}.taxableMiles`);
      const prev = per.get(r.jurisdiction) ?? { miles: 0, taxableMiles: 0, gallons: 0 };
      per.set(r.jurisdiction, { miles: prev.miles + r.miles, taxableMiles: prev.taxableMiles + (r.taxableMiles ?? r.miles), gallons: prev.gallons + (r.taxPaidGallons ?? 0) });
    }
    if (nonIftaMiles) {
      const prev = per.get('XX') ?? { miles: 0, taxableMiles: 0, gallons: 0 };
      per.set('XX', { miles: prev.miles + nonIftaMiles, taxableMiles: 0, gallons: 0 });
    }
    const notes = [];
    const dup = rows.length - new Set(rows.map((r) => r.jurisdiction)).size;
    if (dup) notes.push(`${dup} jurisdiction${dup === 1 ? ' was' : 's were'} listed more than once; the rows were added together.`);
    let gallons = totalGallons;
    if (gallons === undefined) {
      gallons = rows.reduce((s, r) => s + (r.taxPaidGallons ?? 0), 0);
      notes.push('Total fuel was not given, so the tax-paid gallons were taken as all the fuel used. Give totalGallons if some fuel was bought without tax or in a non-IFTA area.');
    } else if (gallons + 1e-9 < rows.reduce((s, r) => s + (r.taxPaidGallons ?? 0), 0)) {
      throw new IftaError('Total gallons are less than the tax-paid gallons listed by jurisdiction.', 'totalGallons');
    }
    const f = fuelLines(qd, fuel, per, gallons);
    const due = dueDate(quarter);
    return {
      op: 'estimate',
      quarter,
      fuel,
      ...strip(f),
      netDue: f.tax,
      display: { ...f.display, netDue: money(f.cents) },
      answer: `${quarterWords(quarter)}, ${f.name.toLowerCase()}: ${whole(f.totalMiles)} miles on ${whole(f.totalGallons)} gallons is ${f.display.mpg} MPG, and the return comes to ${f.cents >= 0 ? `${money(f.cents)} due` : `a ${money(-f.cents)} credit`}${f.lines.some((l) => l.surcharge) ? ', surcharges included' : ''}. It is due ${longDate(due.due)}.`,
      dueDate: due,
      rateStatus: rateStatus(qd),
      warnings: f.warnings,
      notes,
    };
  }
  const strip = ({ cents, warnings, display, ...f }) => f;

  // ---------- the trip sheet: reconciliation and record check ----------

  function analyse({ quarter, vehicles, trips, receipts = [], odometerTolerance = 1 }) {
    const qd = quarterData(quarter);
    const { from, to } = quarterRange(quarter);
    const errors = [];
    const warnings = [];
    const missing = [];
    const units = new Map();
    for (const [i, v] of vehicles.entries()) {
      const fuel = v.fuel ?? 'special_diesel';
      checkFuel(fuel, `vehicles.${i}.fuel`);
      if (units.has(v.unit)) throw new IftaError(`Unit "${v.unit}" is listed twice in the vehicles.`, `vehicles.${i}.unit`);
      units.set(v.unit, { unit: v.unit, vin: v.vin ?? null, fuel });
    }
    const tripLabel = (t, i) => `Trip ${t.trip ?? i + 1} (unit ${t.unit})`;
    const kept = [];
    for (const [i, t] of trips.entries()) {
      if (!units.has(t.unit)) throw new IftaError(`${tripLabel(t, i)}: unit "${t.unit}" is not in the vehicle list.`, `trips.${i}.unit`);
      for (const [k, m] of t.miles.entries()) {
        checkJurisdiction(m.jurisdiction, `trips.${i}.miles.${k}.jurisdiction`);
        if (m.taxableMiles !== undefined && m.taxableMiles > m.miles) throw new IftaError(`${tripLabel(t, i)}: taxable miles in ${m.jurisdiction} are more than its total miles.`, `trips.${i}.miles.${k}.taxableMiles`);
      }
      const label = tripLabel(t, i);
      for (const el of rules.records.trip) {
        const has = el.field === 'miles' ? t.miles.length > 0 : el.field === 'unit' ? Boolean(t.unit) : t[el.field] !== undefined && t[el.field] !== '';
        if (!has) missing.push({ record: label, field: el.field, element: el.text, effect: 'Distance without this can be questioned in an audit; Oregon DOT warns that inadequate records may lead to fleet MPG being assessed at 4.0.' });
      }
      if (t.startDate && t.endDate && t.endDate < t.startDate) errors.push({ code: 'trip_dates', unit: t.unit, message: `${label} ends (${t.endDate}) before it starts (${t.startDate}).` });
      const outside = (t.startDate && (t.startDate < from || t.startDate > to)) || (t.endDate && (t.endDate < from || t.endDate > to));
      if (outside) {
        errors.push({ code: 'trip_outside_quarter', unit: t.unit, message: `${label} runs outside ${from} to ${to}. Split it at the quarter's end and report each part on its own quarter; it is left out of this return.` });
        continue;
      }
      if (t.odoStart !== undefined && t.odoEnd !== undefined) {
        const delta = t.odoEnd - t.odoStart;
        const sum = t.miles.reduce((s, m) => s + m.miles, 0);
        if (delta < 0) errors.push({ code: 'odometer_backwards', unit: t.unit, message: `${label}: the ending odometer (${t.odoEnd}) is below the starting one (${t.odoStart}).` });
        else if (Math.abs(sum - delta) > odometerTolerance) errors.push({ code: 'trip_sum', unit: t.unit, message: `${label}: miles by jurisdiction add up to ${whole(Math.round(sum * 10) / 10)}, the odometer moved ${whole(delta)} (a difference of ${whole(Math.round((sum - delta) * 10) / 10)}).` });
      }
      const seen = new Set();
      for (const m of t.miles) {
        if (seen.has(m.jurisdiction)) warnings.push({ code: 'duplicate_jurisdiction', unit: t.unit, message: `${label} lists ${nameOf(m.jurisdiction)} more than once; the rows were added together. Check that a border crossing was not entered twice.` });
        seen.add(m.jurisdiction);
      }
      kept.push({ ...t, label, index: i });
    }
    // Odometer continuity across trips, per unit, in odometer order.
    const perVehicle = [];
    for (const v of units.values()) {
      const ts = kept.filter((t) => t.unit === v.unit);
      const withOdo = ts.filter((t) => t.odoStart !== undefined && t.odoEnd !== undefined).sort((a, b) => a.odoStart - b.odoStart || (a.startDate ?? '').localeCompare(b.startDate ?? ''));
      const gaps = [];
      const overlaps = [];
      for (let k = 1; k < withOdo.length; k++) {
        const a = withOdo[k - 1];
        const b = withOdo[k];
        const d = b.odoStart - a.odoEnd;
        if (d > odometerTolerance) gaps.push({ after: a.trip ?? a.label, before: b.trip ?? b.label, miles: d });
        if (d < -odometerTolerance) overlaps.push({ after: a.trip ?? a.label, before: b.trip ?? b.label, miles: -d });
        if (a.startDate && b.startDate && b.startDate < a.startDate) warnings.push({ code: 'odometer_order', unit: v.unit, message: `Unit ${v.unit}: ${b.label} has a higher odometer than ${a.label} but an earlier start date.` });
      }
      for (const g of gaps) warnings.push({ code: 'odometer_gap', unit: v.unit, message: `Unit ${v.unit}: ${whole(g.miles)} odometer miles between trip ${g.after} and trip ${g.before} are on no trip sheet. Log them (personal or bobtail miles still count) or explain them.` });
      for (const o of overlaps) errors.push({ code: 'odometer_overlap', unit: v.unit, message: `Unit ${v.unit}: trip ${o.before} starts ${whole(o.miles)} miles before trip ${o.after} ends on the odometer, so the same miles are logged twice.` });
      const sumMiles = ts.reduce((s, t) => s + t.miles.reduce((x, m) => x + m.miles, 0), 0);
      const odoFirst = withOdo.length ? withOdo[0].odoStart : null;
      const odoLast = withOdo.length ? Math.max(...withOdo.map((t) => t.odoEnd)) : null;
      if (!ts.length) warnings.push({ code: 'vehicle_no_trips', unit: v.unit, message: `Unit ${v.unit} has no trips this quarter. If it did not run, that is fine; it is still on the return.` });
      perVehicle.push({ unit: v.unit, fuel: v.fuel, trips: ts.length, odoFirst, odoLast, odoDelta: odoFirst === null ? null : odoLast - odoFirst, sumMiles: Math.round(sumMiles * 10) / 10, unlogged: gaps.reduce((s, g) => s + g.miles, 0), gaps, overlaps });
    }
    // Receipts.
    const keptReceipts = [];
    const driven = new Map();
    for (const t of kept) for (const m of t.miles) driven.set(`${t.unit}|${m.jurisdiction}`, true);
    const seenReceipt = new Map();
    for (const [i, r] of receipts.entries()) {
      const label = `Receipt ${i + 1}${r.date ? ` (${r.date}` : ' ('}${r.seller ? `, ${r.seller}` : ''})`;
      if (!units.has(r.unit)) throw new IftaError(`${label}: unit "${r.unit}" is not in the vehicle list.`, `receipts.${i}.unit`);
      if (r.jurisdiction) checkJurisdiction(r.jurisdiction, `receipts.${i}.jurisdiction`);
      if (r.fuel !== undefined && !FUELS.includes(r.fuel)) throw new IftaError(`${label}: fuel must be one of ${FUELS.join(', ')} (diesel exhaust fluid and fuel for a reefer or other separate tank are not IFTA fuel).`, `receipts.${i}.fuel`);
      for (const el of rules.records.receipt) {
        const has = el.field === 'price' ? r.pricePerGallon !== undefined || r.total !== undefined : r[el.field] !== undefined && r[el.field] !== '';
        if (!has) missing.push({ record: label, field: el.field, element: el.text, effect: r.taxPaid === false ? 'The receipt still backs the fuel total.' : 'Without it the tax-paid credit for this receipt can be disallowed in an audit (Oregon DOT).' });
      }
      if (!r.date || !r.jurisdiction || r.gallons === undefined) {
        errors.push({ code: 'receipt_incomplete', unit: r.unit, message: `${label} needs a date, a jurisdiction and gallons to count; it is left out.` });
        continue;
      }
      if (r.date < from || r.date > to) {
        errors.push({ code: 'receipt_outside_quarter', unit: r.unit, message: `${label} is dated outside ${from} to ${to}; it is left out of this quarter.` });
        continue;
      }
      const fuel = r.fuel ?? units.get(r.unit).fuel;
      if (fuel !== units.get(r.unit).fuel) {
        warnings.push({ code: 'receipt_fuel', unit: r.unit, message: `${label} is ${fuelName[fuel].toLowerCase()} but unit ${r.unit} runs on ${fuelName[units.get(r.unit).fuel].toLowerCase()}; it is left out. Biodiesel blended into a diesel tank is reported as diesel.` });
        continue;
      }
      const sig = `${r.unit}|${r.date}|${r.jurisdiction}|${r.gallons}|${(r.seller ?? '').toLowerCase()}`;
      if (seenReceipt.has(sig)) warnings.push({ code: 'duplicate_receipt', unit: r.unit, message: `${label} looks the same as receipt ${seenReceipt.get(sig) + 1} (same unit, date, place, seller and gallons). Both are counted; remove one if it was entered twice.` });
      else seenReceipt.set(sig, i);
      if (isMember(r.jurisdiction) && !driven.has(`${r.unit}|${r.jurisdiction}`)) warnings.push({ code: 'receipt_no_miles', unit: r.unit, message: `${label}: unit ${r.unit} bought fuel in ${nameOf(r.jurisdiction)} but logged no miles there this quarter.` });
      if (!isMember(r.jurisdiction) && r.taxPaid !== false) warnings.push({ code: 'receipt_non_ifta', unit: r.unit, message: `${label} is from ${nameOf(r.jurisdiction)}, outside IFTA: its gallons count in total fuel but earn no tax-paid credit.` });
      keptReceipts.push({ ...r, fuel });
    }
    return { qd, units, kept, keptReceipts, perVehicle, errors, warnings, missing };
  }

  function check(input) {
    const a = analyse(input);
    const passed = a.errors.length === 0;
    return {
      op: 'check',
      quarter: input.quarter,
      passed,
      vehicles: a.units.size,
      trips: input.trips.length,
      receipts: (input.receipts ?? []).length,
      errorCount: a.errors.length,
      warningCount: a.warnings.length,
      missingCount: a.missing.length,
      answer: `${a.units.size} vehicle${a.units.size === 1 ? '' : 's'}, ${input.trips.length} trip${input.trips.length === 1 ? '' : 's'} and ${(input.receipts ?? []).length} receipt${(input.receipts ?? []).length === 1 ? '' : 's'}: ${a.errors.length} error${a.errors.length === 1 ? '' : 's'}, ${a.warnings.length} warning${a.warnings.length === 1 ? '' : 's'} and ${a.missing.length} missing record field${a.missing.length === 1 ? '' : 's'}. The prepared return lists each one.`,
    };
  }

  // ---------- the full return ----------

  function prepare(input) {
    const a = analyse(input);
    const fuelsUsed = [...new Set([...a.units.values()].map((v) => v.fuel))].sort((x, y) => FUELS.indexOf(x) - FUELS.indexOf(y));
    const byFuel = [];
    const notes = [];
    let total = 0;
    for (const fuel of fuelsUsed) {
      const per = new Map();
      const unitsOf = new Set([...a.units.values()].filter((v) => v.fuel === fuel).map((v) => v.unit));
      for (const t of a.kept.filter((x) => unitsOf.has(x.unit))) {
        for (const m of t.miles) {
          const p = per.get(m.jurisdiction) ?? { miles: 0, taxableMiles: 0, gallons: 0 };
          p.miles += m.miles;
          p.taxableMiles += isMember(m.jurisdiction) ? (m.taxableMiles ?? m.miles) : 0;
          per.set(m.jurisdiction, p);
        }
      }
      let gallons = 0;
      for (const r of a.keptReceipts.filter((x) => unitsOf.has(x.unit))) {
        gallons += r.gallons;
        if (r.taxPaid !== false && isMember(r.jurisdiction)) {
          const p = per.get(r.jurisdiction) ?? { miles: 0, taxableMiles: 0, gallons: 0 };
          p.gallons += r.gallons;
          per.set(r.jurisdiction, p);
        }
      }
      if (![...per.values()].some((p) => p.miles || p.gallons) && !gallons) { notes.push(`${fuelName[fuel]}: no miles or fuel this quarter.`); continue; }
      const f = fuelLines(a.qd, fuel, per, gallons);
      a.warnings.push(...f.warnings);
      total += f.cents;
      byFuel.push({ ...strip(f), units: [...unitsOf], display: f.display });
    }
    const due = dueDate(input.quarter);
    const passed = a.errors.length === 0;
    return {
      op: 'return',
      licensee: input.licensee,
      baseJurisdiction: input.baseJurisdiction,
      quarter: input.quarter,
      dueDate: due,
      vehicles: [...a.units.values()],
      byFuel,
      netDue: toDollars(total),
      display: { netDue: money(total) },
      reconciliation: { passed, errors: a.errors, warnings: a.warnings, perVehicle: a.perVehicle },
      recordCheck: { complete: a.missing.length === 0, missing: a.missing },
      rateStatus: rateStatus(a.qd),
      notes,
      answer: `${quarterWords(input.quarter)} return for ${input.licensee} (base ${input.baseJurisdiction}): ${total >= 0 ? `${money(total)} due` : `a ${money(-total)} credit`} across ${byFuel.length} fuel type${byFuel.length === 1 ? '' : 's'}, due ${longDate(due.due)}. Reconciliation ${passed ? 'passed' : `found ${a.errors.length} error${a.errors.length === 1 ? '' : 's'}`}; ${a.missing.length ? `${a.missing.length} record field${a.missing.length === 1 ? ' is' : 's are'} missing` : 'every record has the fields an auditor asks for'}.`,
    };
  }

  // ---------- late cost ----------

  function interestOn(iso) {
    const p = interest.find((x) => x.from <= iso && iso <= x.to);
    return p ?? null;
  }

  function lateCost({ quarter, filedOn, lines }) {
    if (!QUARTER_RE.test(quarter)) throw new IftaError('A quarter is written like 2026Q3.', 'quarter');
    const due = dueDate(quarter);
    const net = lines.reduce((s, l) => s + Math.round(l.tax * 100), 0);
    for (const [i, l] of lines.entries()) checkJurisdiction(l.jurisdiction, `lines.${i}.jurisdiction`);
    const base = { op: 'late-cost', quarter, filedOn, dueDate: due };
    if (filedOn <= due.due) {
      return { ...base, late: false, monthsLate: 0, interest: 0, penalty: 0, total: 0, display: { interest: money(0), penalty: money(0), total: money(0) }, lines: [], answer: `Filed ${longDate(filedOn)}, on or before the ${longDate(due.due)} due date: no penalty or interest.` };
    }
    // Months late: one for each month-end from the statutory due date that the filing date is past.
    const y = +quarter.slice(0, 4);
    const n = +quarter.slice(5);
    const months = [];
    for (let k = 0; ; k++) {
      const end = monthEnd(y, 3 * n + 1 + k);
      if (filedOn <= end) break;
      const accrues = fromDayNumber(dayNumber(end) + 1);
      const p = interestOn(accrues);
      if (!p) throw new IftaError(`No IFTA interest rate is on file for ${accrues.slice(0, 7)}: the rates on file run from ${interest[0].from} to ${interest[interest.length - 1].to}.`, 'filedOn');
      months.push({ month: accrues.slice(0, 7), rate: p.monthly, micro: p.micro });
    }
    const out = lines.map((l) => {
      const cents = Math.round(l.tax * 100);
      const owed = cents > 0 ? divRound(months.reduce((s, m) => s + cents * m.micro, 0), 1_000_000) : 0;
      return { jurisdiction: l.jurisdiction, tax: l.tax, interest: toDollars(owed), cents: owed };
    });
    const totalInterest = out.reduce((s, l) => s + l.cents, 0);
    const penalty = Math.max(5000, divRound(Math.max(0, net) * 10, 100));
    return {
      ...base,
      late: true,
      monthsLate: months.length,
      months: months.map(({ micro, ...m }) => m),
      netTax: toDollars(net),
      interest: toDollars(totalInterest),
      penalty: toDollars(penalty),
      total: toDollars(totalInterest + penalty),
      lines: out.map(({ cents, ...l }) => l),
      display: { interest: money(totalInterest), penalty: money(penalty), total: money(totalInterest + penalty) },
      answer: `Filed ${longDate(filedOn)}, ${months.length} month${months.length === 1 ? '' : 's'} late counting each month or part month after ${longDate(due.statutory)}: ${money(totalInterest)} interest on the lines with tax due and a ${money(penalty)} penalty (the greater of $50 or 10% of the ${money(Math.max(0, net))} net tax), ${money(totalInterest + penalty)} in all.`,
    };
  }

  // ---------- rates and due dates ----------

  function ratesLookup({ quarter, jurisdiction, fuel } = {}) {
    const qs = quarter ? [quarterData(quarter)] : quarters;
    if (jurisdiction && !isMember(jurisdiction)) throw new IftaError(`"${jurisdiction}" is not an IFTA member jurisdiction code.`, 'jurisdiction');
    if (fuel && !FUELS.includes(fuel)) throw new IftaError(`Fuel must be one of ${FUELS.join(', ')}.`, 'fuel');
    const pick = (rows) => rows.filter((r) => !jurisdiction || r.code === jurisdiction).map((r) => (fuel ? { ...r, rates: [r.rates[FUELS.indexOf(fuel)]] } : r));
    const out = qs.map((q) => ({ ...q, rows: pick(q.rows), surcharges: pick(q.surcharges) }));
    const fuels = fuel ? rates.fuels.filter((f) => f.key === fuel) : rates.fuels;
    let answer;
    if (jurisdiction && fuel) {
      answer = out.map((q) => {
        const rt = rateFor(byQuarter.get(q.quarter), jurisdiction, fuel);
        const r = rt.kind === 'rate' ? rateText(rt.rate) : rt.kind === 'none' ? 'no IFTA rate' : rt.kind === 'disputed' ? 'held back (the copies disagree)' : 'no rate ("-")';
        return `${q.quarter}: ${nameOf(jurisdiction)} ${fuelName[fuel].toLowerCase()} ${r}${rt.surcharge !== null && rt.kind !== 'none' ? ` plus a ${rateText(rt.surcharge)} surcharge` : ''}`;
      }).join('; ');
      answer += ' a gallon.';
    } else {
      answer = `IFTA tax rates on file for ${out.map((q) => q.quarter).join(', ')}, all marked FINAL, in US dollars a gallon.`;
    }
    return {
      op: 'rates',
      answer,
      fuels,
      jurisdictions: rates.jurisdictions,
      quarters: out,
      computedFuels: rules.computedFuels,
      readOn: rates.readOn,
    };
  }

  function dueDates({ year }) {
    const rows = [1, 2, 3, 4].map((n) => dueDate(`${year}Q${n}`));
    return {
      op: 'due-dates',
      year,
      dueDates: rows,
      answer: `IFTA returns for ${year}: ${rows.map((r) => `${quarterWords(r.quarter)} due ${longDate(r.due)}${r.moved ? ` (${longDate(r.statutory)} is a weekend)` : ''}`).join('; ')}.`,
    };
  }

  return {
    first, last, quarters: quarters.map((q) => q.quarter), FUELS, fuelName, nameOf, isMember, quarterData, rateFor,
    estimate, check, prepare, lateCost, rates: ratesLookup, dueDates, analyse,
  };
}

// ---------- the return worksheet (CSV) ----------

export function returnCsv(r) {
  const lines = [csvLine(['fuel', 'jurisdiction', 'total_miles', 'taxable_miles', 'taxable_gallons', 'tax_paid_gallons', 'net_taxable_gallons', 'rate', 'tax', 'surcharge_rate', 'surcharge', 'quarter'])];
  for (const f of r.byFuel) {
    for (const l of f.lines) {
      lines.push(csvLine([f.fuel, l.jurisdiction, l.totalMiles, l.taxableMiles, l.taxableGallons, l.taxPaidGallons, l.netTaxableGallons, l.display.rate === 'none' ? '' : l.rate.toFixed(4), l.tax.toFixed(2), l.surcharge ? l.surcharge.rate.toFixed(4) : '', l.surcharge ? l.surcharge.tax.toFixed(2) : '', r.quarter]));
    }
    lines.push(csvLine([f.fuel, 'TOTAL', f.totalMiles, '', '', f.totalGallons, '', `mpg ${f.display.mpg}`, f.tax.toFixed(2), '', '', r.quarter]));
  }
  return `${lines.join('\r\n')}\r\n`;
}
