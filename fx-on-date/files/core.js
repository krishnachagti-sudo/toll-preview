// Exchange rates from the ECB's euro foreign exchange reference rates file.
//
// Pure and dependency-free: Node (tool.js, tests) and the browser (page.js) load this same file.
// Dates are 'YYYY-MM-DD' strings and are compared as strings or whole day numbers, never as
// local-time Date objects, so the time zone of the machine cannot change an answer.
//
// How a rate is made: the ECB publishes how many units of each currency one euro buys, once per
// TARGET working day at about 16:00 CET. The rate from BASE to QUOTE is
// (QUOTE per euro) / (BASE per euro). It is worked out exactly, as a ratio of decimal numbers in
// BigInt, and rounded half away from zero to 6 decimal places. The inverse is 1 / that same
// unrounded ratio, rounded the same way, so it is never the inverse of an already-rounded rate.
//
// Errors are FxError, which carries a code ('invalid_input', 'not_available', 'bad_data') and, for
// invalid input, the field it belongs to. core.js cannot import the server's TollError because
// the browser loads this file too, so tool.js turns an FxError into a TollError.

export const SOURCE = 'European Central Bank euro foreign exchange reference rates';
export const FIRST_FIXING = '1999-01-04';
export const DEFAULT_LOOKBACK_DAYS = 7;

export class FxError extends Error {
  constructor(code, message, field) {
    super(message);
    this.name = 'FxError';
    this.code = code;
    if (field !== undefined) this.field = field;
  }
}

// The currencies the ECB publishes today, for the page's pickers. The server accepts any code in
// the data file, including retired ones such as HRK and BGN (both joined the euro); a test keeps this list inside the file's header.
export const CURRENCIES = [
  { code: 'EUR', name: 'Euro' },
  { code: 'AUD', name: 'Australian dollar' },
  { code: 'BRL', name: 'Brazilian real' },
  { code: 'CAD', name: 'Canadian dollar' },
  { code: 'CHF', name: 'Swiss franc' },
  { code: 'CNY', name: 'Chinese yuan' },
  { code: 'CZK', name: 'Czech koruna' },
  { code: 'DKK', name: 'Danish krone' },
  { code: 'GBP', name: 'British pound' },
  { code: 'HKD', name: 'Hong Kong dollar' },
  { code: 'HUF', name: 'Hungarian forint' },
  { code: 'IDR', name: 'Indonesian rupiah' },
  { code: 'ILS', name: 'Israeli shekel' },
  { code: 'INR', name: 'Indian rupee' },
  { code: 'ISK', name: 'Icelandic krona' },
  { code: 'JPY', name: 'Japanese yen' },
  { code: 'KRW', name: 'South Korean won' },
  { code: 'MXN', name: 'Mexican peso' },
  { code: 'MYR', name: 'Malaysian ringgit' },
  { code: 'NOK', name: 'Norwegian krone' },
  { code: 'NZD', name: 'New Zealand dollar' },
  { code: 'PHP', name: 'Philippine peso' },
  { code: 'PLN', name: 'Polish zloty' },
  { code: 'RON', name: 'Romanian leu' },
  { code: 'SEK', name: 'Swedish krona' },
  { code: 'SGD', name: 'Singapore dollar' },
  { code: 'THB', name: 'Thai baht' },
  { code: 'TRY', name: 'Turkish lira' },
  { code: 'USD', name: 'US dollar' },
  { code: 'ZAR', name: 'South African rand' },
];

// ---------- calendar arithmetic (integer day numbers) ----------

// Days since 1970-01-01 for a proleptic Gregorian date (Hinnant's algorithm).
function daysFromCivil(y, m, d) {
  const yy = m <= 2 ? y - 1 : y;
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

function civilFromDays(n) {
  const z = n + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp + (mp < 10 ? 3 : -9);
  return [yoe + era * 400 + (m <= 2 ? 1 : 0), m, d];
}

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const monthLength = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parts(iso) {
  const m = typeof iso === 'string' ? ISO_RE.exec(iso) : null;
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > monthLength(y, mo)) return null;
  return [y, mo, d];
}

export const isRealDate = (iso) => parts(iso) !== null;

export function dayNumber(iso) {
  const p = parts(iso);
  if (!p) throw new RangeError(`Not a real date: ${iso}`);
  return daysFromCivil(...p);
}

export function isoOf(n) {
  const [y, m, d] = civilFromDays(n);
  return `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// 1970-01-01 was a Thursday (4).
export const weekdayName = (iso) => WEEKDAYS[(((dayNumber(iso) + 4) % 7) + 7) % 7];

// "Saturday 31 Oct 2026"
export function longDate(iso) {
  const [y, m, d] = parts(iso);
  return `${weekdayName(iso)} ${d} ${MONTHS[m - 1]} ${y}`;
}

// The sentence for a fixing that is not on the requested day, or null when they match.
export function fixingNote(requestedDate, fixingDate) {
  if (requestedDate === fixingDate) return null;
  return `No ECB fixing on ${longDate(requestedDate)}, so this uses ${longDate(fixingDate)}.`;
}

// ---------- parsing the ECB file ----------

// text -> { currencies, rows, latest, earliest }
//   currencies: header codes in file order, e.g. ['USD', 'JPY', ...]
//   rows: Map of 'YYYY-MM-DD' to Map of code to units per euro; 'N/A' and blanks are left out
//   latest, earliest: the newest and oldest fixing dates
export function parseEcbCsv(text) {
  if (typeof text !== 'string') throw new FxError('bad_data', 'The exchange-rate file is empty.');
  const lines = text.replace(/^﻿/, '').split(/\r?\n/);
  const header = (lines[0] ?? '').split(',').map((s) => s.trim());
  if (header[0] !== 'Date') throw new FxError('bad_data', 'The exchange-rate file does not start with a Date column.');
  const currencies = header.slice(1).filter((c) => c !== '');
  for (const c of currencies) {
    if (!/^[A-Z]{3}$/.test(c)) throw new FxError('bad_data', `The exchange-rate file has an unexpected column: ${c}.`);
  }
  const rows = new Map();
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === '') continue;
    const cells = line.split(',').map((s) => s.trim());
    if (!isRealDate(cells[0])) throw new FxError('bad_data', `The exchange-rate file has a bad date on line ${i + 1}.`);
    const values = new Map();
    currencies.forEach((code, j) => {
      const cell = cells[j + 1];
      if (cell === undefined || cell === '' || cell === 'N/A') return;
      const n = Number(cell);
      if (Number.isFinite(n) && n > 0) values.set(code, n);
    });
    rows.set(cells[0], values);
  }
  if (rows.size === 0) throw new FxError('bad_data', 'The exchange-rate file has no rates in it.');
  let latest = null;
  let earliest = null;
  for (const date of rows.keys()) {
    if (latest === null || date > latest) latest = date;
    if (earliest === null || date < earliest) earliest = date;
  }
  return { currencies, rows, latest, earliest };
}

// ---------- exact rounding ----------

// A positive finite number as an exact decimal: { int: BigInt, scale } meaning int / 10^scale.
// String(n) is the shortest text that reads back as n, which is the decimal the ECB wrote.
function toDecimal(n) {
  let s = String(n);
  if (/e/i.test(s)) s = n.toFixed(12);
  const [whole, frac = ''] = s.split('.');
  return { int: BigInt(whole + frac), scale: frac.length };
}

// numerator / denominator, rounded half away from zero to 6 decimals, as a Number.
function ratio6(num, den) {
  const r = (2n * num * 1_000_000n + den) / (2n * den);
  const s = r.toString().padStart(7, '0');
  return Number(`${s.slice(0, -6)}.${s.slice(-6)}`);
}

// Units of quote per base, and the inverse, from units of each per euro.
export function crossRate(quotePerEur, basePerEur) {
  const q = toDecimal(quotePerEur);
  const b = toDecimal(basePerEur);
  // rate = (q.int / 10^q.scale) / (b.int / 10^b.scale)
  const rate = ratio6(q.int * 10n ** BigInt(b.scale), b.int * 10n ** BigInt(q.scale));
  const inverse = ratio6(b.int * 10n ** BigInt(q.scale), q.int * 10n ** BigInt(b.scale));
  return { rate, inverse };
}

// ---------- looking up a rate ----------

const supported = (table) => ['EUR', ...table.currencies].join(', ');

function checkCode(table, code, field) {
  if (code === 'EUR' || table.currencies.includes(code)) return;
  throw new FxError('invalid_input', `${code} is not a currency in the ECB data. Supported codes: ${supported(table)}.`, field);
}

// Is there a Monday-to-Friday day after `from` and on or before `to`? Both are ISO dates.
function weekdayBetween(from, to) {
  for (let n = dayNumber(from) + 1; n <= dayNumber(to); n++) {
    const wd = (((n + 4) % 7) + 7) % 7;
    if (wd !== 0 && wd !== 6) return true;
  }
  return false;
}

// -> { rate, inverse, fixingDate }
// `today` ('YYYY-MM-DD', UTC) is optional; with it, any later date is refused.
// A date after the file's latest fixing is answered only when the days in between are a weekend:
// a weekday in that gap has its own fixing coming (or is a holiday the file cannot prove yet),
// so answering with an older rate would be wrong.
export function rateOn(table, { base, quote, date, maxLookbackDays = DEFAULT_LOOKBACK_DAYS, today }) {
  checkCode(table, base, 'base');
  checkCode(table, quote, 'quote');
  if (!isRealDate(date)) throw new FxError('invalid_input', 'Date must be a real date written like 2026-10-29.', 'date');
  if (date < FIRST_FIXING) {
    throw new FxError('not_available', `The ECB has no rates before ${FIRST_FIXING}, the first day of the euro.`);
  }
  if ((today !== undefined && date > today) || (date > table.latest && weekdayBetween(table.latest, date))) {
    throw new FxError('not_available', `The ECB has not published rates for ${date} yet. The latest fixing is ${table.latest}.`);
  }
  const day = dayNumber(date);
  let fixingDate = null;
  let row = null;
  for (let back = 0; back <= maxLookbackDays; back++) {
    const iso = isoOf(day - back);
    if (table.rows.has(iso)) { fixingDate = iso; row = table.rows.get(iso); break; }
  }
  if (!row) {
    throw new FxError('not_available', `The ECB has no fixing on ${date} or in the ${maxLookbackDays} days before it.`);
  }
  const perEur = (code) => (code === 'EUR' ? 1 : row.get(code));
  for (const code of [base, quote]) {
    if (perEur(code) === undefined) throw new FxError('not_available', `The ECB has no ${code} rate for ${date}.`);
  }
  return { ...crossRate(perEur(quote), perEur(base)), fixingDate };
}

// ---------- other official sources ----------
//
// Three more published tables, each quoted against one currency (its anchor), so one side of the
// pair must be that currency. The rate the authority prints is kept as text (publishedRate) and
// the answer is worked out from it exactly, the same way as an ECB cross:
//  - treasury: U.S. Treasury Reporting Rates of Exchange (quarterly, units per US dollar). Treasury
//    says agencies use each report "as of the date of this report and for the ensuing three
//    months", and that an amendment is a separate line "with a new effective date". So a date uses
//    the latest report dated on or before it, and in that report the latest line for the currency
//    whose effective date is on or before it.
//  - irs: IRS yearly average currency exchange rates (units per US dollar), the year of the date.
//  - hmrc: HMRC monthly exchange rates (units per pound), which cover the first to the last day of
//    their month. HMRC's weekly amendments are not in the monthly files and are not used.

export const SOURCE_IDS = ['ecb', 'treasury', 'irs', 'hmrc'];
export const SOURCES = {
  ecb: { name: SOURCE, label: 'ECB reference (default)' },
  treasury: {
    name: 'U.S. Treasury Reporting Rates of Exchange',
    label: 'US Treasury reporting rate',
    anchor: 'USD',
    url: 'https://fiscaldata.treasury.gov/datasets/treasury-reporting-rates-exchange/treasury-reporting-rates-of-exchange',
  },
  irs: {
    name: 'IRS yearly average currency exchange rates',
    label: 'IRS yearly average',
    anchor: 'USD',
    url: 'https://www.irs.gov/individuals/international-taxpayers/yearly-average-currency-exchange-rates',
  },
  hmrc: {
    name: 'HMRC monthly exchange rates',
    label: 'HMRC monthly rate',
    anchor: 'GBP',
    url: 'https://www.trade-tariff.service.gov.uk/exchange_rates',
  },
};

// Treasury's country-currency names for each code. A name with a date applies only to reports
// dated on or after it (for example "Turkey-Lira" before 2005 is the old lira, not TRY).
export const TREASURY_NAMES = {
  AUD: [['Australia-Dollar']], BRL: [['Brazil-Real']], BGN: [['Bulgaria-Lev New'], ['Bulgaria-Lev', '2015-03-31']],
  CAD: [['Canada-Dollar']], CNY: [['China-Renminbi']], CZK: [['Czech Republic-Koruna']], DKK: [['Denmark-Krone']],
  EUR: [['Euro Zone-Euro']], HKD: [['Hong Kong-Dollar']], HUF: [['Hungary-Forint']], ISK: [['Iceland-Krona']],
  INR: [['India-Rupee']], IDR: [['Indonesia-Rupiah']], ILS: [['Israel-Shekel']], JPY: [['Japan-Yen']], KRW: [['Korea-Won']],
  MYR: [['Malaysia-Ringgit']], MXN: [['Mexico-Peso'], ['Mexico-New Peso']], NZD: [['New Zealand-Dollar']],
  NOK: [['Norway-Krone']], PHP: [['Philippines-Peso']], PLN: [['Poland-Zloty']],
  RON: [['Romania-New Leu'], ['Romania-Leu', '2015-03-31']], SGD: [['Singapore-Dollar']], ZAR: [['South Africa-Rand']],
  SEK: [['Sweden-Krona']], CHF: [['Switzerland-Franc']], THB: [['Thailand-Baht']],
  TRY: [['Turkey-New Lira'], ['Turkey-Lira', '2015-03-31']], GBP: [['United Kingdom-Pound'], ['United Kingdom-Pound Sterling']],
};

// The IRS table's country and currency for each code.
export const IRS_NAMES = {
  AUD: 'Australia|Dollar', BRL: 'Brazil|Real', CAD: 'Canada|Dollar', CNY: 'China|Yuan', DKK: 'Denmark|Krone',
  EUR: 'Euro Zone|Euro', HKD: 'Hong Kong|Dollar', HUF: 'Hungary|Forint', ISK: 'Iceland|Krona', INR: 'India|Rupee',
  ILS: 'Israel|New Shekel', JPY: 'Japan|Yen', MXN: 'Mexico|Peso', NZD: 'New Zealand|Dollar', NOK: 'Norway|Kroner',
  SGD: 'Singapore|Dollar', ZAR: 'South Africa|Rand', KRW: 'South Korean|Won', SEK: 'Sweden|Krona', CHF: 'Switzerland|Franc',
  THB: 'Thailand|Baht', TRY: 'Turkey|New Lira', GBP: 'United Kingdom|Pound', RUB: 'Russia|Ruble',
};

const PLAIN_NUMBER = /^\d+(\.\d+)?$/;
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// "December 31, 2025"
export function usDate(iso) {
  const [y, m, d] = parts(iso);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
}

// The quarter-end after a quarter-end: 2025-12-31 -> 2026-03-31.
export function nextQuarterEnd(iso) {
  const [y, m] = parts(iso);
  const q = Math.floor((m - 1) / 3);
  return q === 3 ? `${y + 1}-03-31` : [`${y}-06-30`, `${y}-09-30`, `${y}-12-31`][q];
}

// A minimal CSV reader: commas, double-quoted cells with "" for a quote, CRLF or LF.
export function parseCsvRows(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

// A CSV cell for parseCsvRows.
export const csvCell = (v) => (/[",\r\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

function header(rows, expected, what) {
  const got = (rows[0] ?? []).map((s) => s.trim());
  if (got.join(',') !== expected.join(',')) throw new FxError('bad_data', `The ${what} file does not have the expected columns.`);
}

// Units of quote per base from a published rate, where the anchor is one side of the pair.
function anchored(anchor, base, quote, published) {
  if (base === quote) return { rate: 1, inverse: 1 };
  const perAnchor = Number(published);
  return base === anchor ? crossRate(perAnchor, 1) : crossRate(1, perAnchor);
}

function checkAnchored(src, base, quote, known) {
  const { anchor, label } = SOURCES[src];
  for (const [code, field] of [[base, 'base'], [quote, 'quote']]) {
    if (code !== anchor && !known.has(code)) {
      throw new FxError('invalid_input', `${code} is not a currency in the ${label} data. Supported codes: ${[anchor, ...[...known].sort()].join(', ')}.`, field);
    }
  }
  if (base !== anchor && quote !== anchor) {
    throw new FxError('invalid_input', `The ${label} is published against the ${anchor === 'USD' ? 'US dollar' : 'British pound'}, so base or quote must be ${anchor}.`);
  }
}

function notAfterToday(date, today, label) {
  if (today !== undefined && date > today) throw new FxError('not_available', `${date} is after today, so there is no ${label} for it yet.`);
}

// ----- Treasury -----

// text (record_date,country_currency_desc,exchange_rate,effective_date) ->
// { reports: Map(recordDate -> Map(desc -> [{ effective, rate }] by effective date)), recordDates, earliest, latest }
export function parseTreasuryCsv(text) {
  if (typeof text !== 'string') throw new FxError('bad_data', 'The Treasury file is empty.');
  const rows = parseCsvRows(text);
  header(rows, ['record_date', 'country_currency_desc', 'exchange_rate', 'effective_date'], 'Treasury');
  const reports = new Map();
  for (let i = 1; i < rows.length; i++) {
    const [record, desc, rate, effective] = rows[i].map((s) => s.trim());
    if (!isRealDate(record) || !isRealDate(effective) || effective < record || !desc || !PLAIN_NUMBER.test(rate)) {
      throw new FxError('bad_data', `The Treasury file has a bad row on line ${i + 1}.`);
    }
    if (!reports.has(record)) reports.set(record, new Map());
    const r = reports.get(record);
    if (!r.has(desc)) r.set(desc, []);
    r.get(desc).push({ effective, rate });
  }
  if (reports.size === 0) throw new FxError('bad_data', 'The Treasury file has no rates in it.');
  for (const r of reports.values()) for (const lines of r.values()) lines.sort((a, b) => (a.effective < b.effective ? -1 : a.effective > b.effective ? 1 : 0));
  const recordDates = [...reports.keys()].sort();
  return { reports, recordDates, earliest: recordDates[0], latest: recordDates[recordDates.length - 1] };
}

const TREASURY_KNOWN = new Set(Object.keys(TREASURY_NAMES));

// -> { rate, inverse, reportDate, effectiveDate, amended, publishedRate, periodStart, periodEnd }
export function treasuryRateOn(table, { base, quote, date, today }) {
  checkAnchored('treasury', base, quote, TREASURY_KNOWN);
  if (!isRealDate(date)) throw new FxError('invalid_input', 'Date must be a real date written like 2026-10-29.', 'date');
  notAfterToday(date, today, 'US Treasury reporting rate');
  if (date < table.earliest) {
    throw new FxError('not_available', `The Treasury data starts with the report as of ${table.earliest}, so it has no rate for ${date}.`);
  }
  const next = nextQuarterEnd(table.latest);
  if (date >= next) {
    throw new FxError('not_available', `Treasury has not published its report as of ${next} yet. The latest report is as of ${table.latest}.`);
  }
  let reportDate = table.earliest;
  for (const d of table.recordDates) if (d <= date) reportDate = d;
  const reportEnd = isoOf(dayNumber(nextQuarterEnd(reportDate)) - 1);
  const report = table.reports.get(reportDate);
  const foreign = base === 'USD' ? quote : base;
  let line = null;
  let following = null;
  if (foreign === 'USD') line = { effective: reportDate, rate: '1' };
  else {
    const names = TREASURY_NAMES[foreign].filter(([, from]) => !from || reportDate >= from).map(([n]) => n);
    const lines = names.map((n) => report.get(n)).find(Boolean);
    if (!lines) throw new FxError('not_available', `The Treasury report as of ${reportDate} has no ${foreign} rate.`);
    for (const l of lines) {
      if (l.effective <= date) line = l;
      else if (!following) following = l;
    }
    if (!line) throw new FxError('not_available', `The Treasury report as of ${reportDate} has no ${foreign} rate in effect on ${date}.`);
    if (Number(line.rate) <= 0) throw new FxError('not_available', `The Treasury report as of ${reportDate} lists the ${foreign} rate as ${line.rate}, so it cannot be used.`);
  }
  return {
    ...anchored('USD', base, quote, line.rate),
    reportDate,
    effectiveDate: line.effective,
    amended: line.effective !== reportDate,
    publishedRate: line.rate,
    periodStart: line.effective,
    periodEnd: following ? isoOf(dayNumber(following.effective) - 1) : reportEnd,
  };
}

// ----- IRS -----

// The IRS sources file -> { year, publishedRate, rate, inverse }
export function irsRateOn(data, { base, quote, date, today }) {
  const known = new Set(Object.keys(IRS_NAMES));
  checkAnchored('irs', base, quote, known);
  if (!isRealDate(date)) throw new FxError('invalid_input', 'Date must be a real date written like 2026-10-29.', 'date');
  notAfterToday(date, today, 'IRS yearly average');
  const year = date.slice(0, 4);
  const col = data.columns.indexOf(year);
  if (col < 0) {
    const years = data.years.slice().sort((a, b) => a - b);
    throw new FxError('not_available', `The IRS table has yearly averages for ${years[0]} to ${years[years.length - 1]}, not ${year}.`);
  }
  const foreign = base === 'USD' ? quote : base;
  let published = '1';
  if (foreign !== 'USD') {
    const row = data.rows.find(([country, currency]) => `${country}|${currency}` === IRS_NAMES[foreign]);
    const cell = row ? row[col] : undefined;
    if (cell === undefined || cell === '') throw new FxError('not_available', `The IRS table has no ${year} rate for ${foreign}.`);
    if (!PLAIN_NUMBER.test(cell) || Number(cell) <= 0) {
      throw new FxError('not_available', `The IRS table prints the ${year} ${foreign} rate as "${cell}", which is not a plain number, so it is not used.`);
    }
    published = cell;
  }
  return { ...anchored('USD', base, quote, published), year: Number(year), publishedRate: published };
}

// ----- HMRC -----

// text (month,published,country,code,rate,start,end) ->
// { months: Map('YYYY-MM' -> { published, start, end, rates: Map(code -> rate, or null when the file
//   gives one code two different rates) }), codes: Set, earliest, latest }
export function parseHmrcCsv(text) {
  if (typeof text !== 'string') throw new FxError('bad_data', 'The HMRC file is empty.');
  const rows = parseCsvRows(text);
  header(rows, ['month', 'published', 'country', 'code', 'rate', 'start', 'end'], 'HMRC');
  const months = new Map();
  const codes = new Set();
  for (let i = 1; i < rows.length; i++) {
    const [month, published, , code, rate, start, end] = rows[i].map((s) => s.trim());
    if (!/^\d{4}-\d{2}$/.test(month) || !isRealDate(start) || !isRealDate(end) || !start.startsWith(month) || !end.startsWith(month)
      || !/^[A-Z]{3}$/.test(code) || !PLAIN_NUMBER.test(rate) || (published !== '' && !isRealDate(published))) {
      throw new FxError('bad_data', `The HMRC file has a bad row on line ${i + 1}.`);
    }
    if (!months.has(month)) months.set(month, { published: published || null, start, end, rates: new Map() });
    const m = months.get(month);
    if (m.start !== start || m.end !== end) throw new FxError('bad_data', `The HMRC file has two periods for ${month}.`);
    if (!m.rates.has(code)) m.rates.set(code, rate);
    else if (m.rates.get(code) !== null && Number(m.rates.get(code)) !== Number(rate)) m.rates.set(code, null);
    codes.add(code);
  }
  if (months.size === 0) throw new FxError('bad_data', 'The HMRC file has no rates in it.');
  const keys = [...months.keys()].sort();
  return { months, codes, earliest: keys[0], latest: keys[keys.length - 1] };
}

// -> { month, published, periodStart, periodEnd, publishedRate, rate, inverse }
export function hmrcRateOn(table, { base, quote, date, today }) {
  checkAnchored('hmrc', base, quote, new Set([...table.codes].filter((c) => c !== 'GBP')));
  if (!isRealDate(date)) throw new FxError('invalid_input', 'Date must be a real date written like 2026-10-29.', 'date');
  notAfterToday(date, today, 'HMRC monthly rate');
  const key = date.slice(0, 7);
  const month = table.months.get(key);
  if (!month) {
    if (key > table.latest) throw new FxError('not_available', `HMRC has not published its monthly rates for ${key} yet. The latest month is ${table.latest}.`);
    throw new FxError('not_available', `The HMRC monthly rates held here start in ${table.earliest}, so there is none for ${key}.`);
  }
  const foreign = base === 'GBP' ? quote : base;
  let published = '1';
  if (foreign !== 'GBP') {
    if (!month.rates.has(foreign)) throw new FxError('not_available', `HMRC's monthly rates for ${key} have no ${foreign} rate.`);
    published = month.rates.get(foreign);
    if (published === null) throw new FxError('not_available', `HMRC's monthly rates for ${key} list more than one ${foreign} rate, so none is used.`);
    if (Number(published) <= 0) throw new FxError('not_available', `HMRC's monthly rates for ${key} list the ${foreign} rate as ${published}, so it cannot be used.`);
  }
  return {
    ...anchored('GBP', base, quote, published),
    month: key,
    published: month.published,
    periodStart: month.start,
    periodEnd: month.end,
    publishedRate: published,
  };
}
