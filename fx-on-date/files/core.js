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
