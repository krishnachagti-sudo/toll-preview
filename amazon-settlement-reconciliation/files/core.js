// Amazon settlement reconciliation: the engine. Pure and dependency-free, so the page loads this
// same file in the browser (README "core.js is browser-loadable") and the free check never uploads.
//
// It reads Amazon's Flat File V2 settlement report (GET_V2_SETTLEMENT_REPORT_DATA_FLAT_FILE_V2),
// whose 24 columns Amazon lists in its SP-API docs (data/sources.json). All money is in one column,
// "amount", labelled by "amount-type" and "amount-description"; amounts are written in the
// marketplace's local number format (95,00 in the EU). Then, per settlement:
//   1. the proof: the rows add up to total-amount, to the cent;
//   2. the tie: total-amount against the bank deposit(s) you give, with Amazon's own reasons for a gap;
//   3. the split: every row placed in the month (or the period before a cut-off) of its posted date;
//   4. on the paid run, every amount-type/amount-description placed on a line (sales, fees, refunds,
//      tax, reserve, ...) and a balanced journal per month through a clearing account.
// Amazon publishes the column names but not a list of amount-type or amount-description values, so
// the line each value goes to is decided by Endwise's own word rules below, shown value by value,
// and the user can move any of them. Nothing is guessed silently: a value no rule knows is "Other".

export const ENGINE_VERSION = 'amazon-settlement-2026.11';
export const LIMITS = { bytes: 5_000_000, rows: 100_000, settlements: 60, deposits: 10 };
export const LEDGERS = ['quickbooks-online', 'xero'];
export const LEDGER_NAMES = { 'quickbooks-online': 'QuickBooks Online', xero: 'Xero' };

// The Flat File V2 settlement report's columns, in Amazon's order (SP-API "Settlement Reports").
export const V2_COLUMNS = [
  'settlement-id', 'settlement-start-date', 'settlement-end-date', 'deposit-date', 'total-amount', 'currency',
  'transaction-type', 'order-id', 'merchant-order-id', 'adjustment-id', 'shipment-id', 'marketplace-name',
  'amount-type', 'amount-description', 'amount', 'fulfillment-id', 'posted-date', 'posted-date-time',
  'order-item-code', 'merchant-order-item-id', 'merchant-adjustment-item-id', 'sku', 'quantity-purchased', 'promotion-id',
];

export class SettlementError extends Error {
  constructor(message, field = 'file') {
    super(message);
    this.name = 'SettlementError';
    this.field = field;
  }
}

// The lines a settlement is booked on. `sign` says how the line usually runs (+ money to you).
export const BUCKETS = [
  { id: 'sales', label: 'Product sales', account: 'Amazon sales' },
  { id: 'shipping', label: 'Shipping and gift wrap charged', account: 'Amazon shipping income' },
  { id: 'promotions', label: 'Promotions', account: 'Amazon promotions' },
  { id: 'refunds', label: 'Refunds', account: 'Amazon refunds' },
  { id: 'taxCollected', label: 'Sales tax collected', account: 'Sales tax payable' },
  { id: 'taxWithheld', label: 'Tax withheld by Amazon', account: 'Sales tax payable' },
  { id: 'sellingFees', label: 'Selling fees', account: 'Amazon selling fees' },
  { id: 'fbaFees', label: 'FBA fees', account: 'Amazon FBA fees' },
  { id: 'advertising', label: 'Advertising', account: 'Amazon advertising' },
  { id: 'subscription', label: 'Subscription', account: 'Amazon subscription fee' },
  { id: 'reimbursements', label: 'Reimbursements', account: 'Amazon reimbursements' },
  { id: 'reserve', label: 'Reserve held and released', account: 'Amazon reserve' },
  { id: 'other', label: 'Other', account: 'Amazon other adjustments' },
];
export const BUCKET_IDS = BUCKETS.map((b) => b.id);
const BUCKET = Object.fromEntries(BUCKETS.map((b) => [b.id, b]));
const FEE_BUCKETS = ['sellingFees', 'fbaFees'];

// Endwise's word rules, in order, on the row's transaction-type (t), amount-type (a) and
// amount-description (d), case-insensitive. The first that matches places the row.
export const RULES = [
  { id: 'reserve', bucket: 'reserve', test: (t, a, d) => /reserve/i.test(d), words: 'the description names a reserve' },
  { id: 'advertising', bucket: 'advertising', test: (t, a, d) => /advertis|sponsored/i.test(`${t} ${a} ${d}`), words: 'advertising' },
  { id: 'subscription', bucket: 'subscription', test: (t, a, d) => /subscription/i.test(`${a} ${d}`), words: 'subscription' },
  { id: 'reimbursement', bucket: 'reimbursements', test: (t, a, d) => /reimburs|warehouse[\s_-]*(?:lost|damage)|\blost\b|\bdamaged?\b/i.test(`${t} ${a} ${d}`), words: 'a reimbursement, lost or damaged' },
  { id: 'withheld', bucket: 'taxWithheld', test: (t, a, d) => /withheld|marketplace[\s_-]*facilitator/i.test(`${a} ${d}`), words: 'withheld or marketplace facilitator tax' },
  { id: 'tax', bucket: 'taxCollected', test: (t, a, d) => /tax/i.test(d), words: 'a tax' },
  { id: 'promotion', bucket: 'promotions', test: (t, a, d) => /promo|rebate|discount/i.test(`${a} ${d}`), words: 'a promotion' },
  { id: 'fba', bucket: 'fbaFees', test: (t, a, d) => /fba|fulfil|pick|pack|weight|storage|inbound|placement|removal|disposal|labeling/i.test(d), words: 'an FBA service' },
  { id: 'fee', bucket: 'sellingFees', test: (t, a, d) => /fee|commission|closing|referral|holdback|chargeback/i.test(`${a} ${d}`), words: 'a fee or commission' },
  { id: 'shipping', bucket: 'shipping', refund: true, test: (t, a, d) => /shipping|gift[\s_-]*wrap/i.test(d), words: 'shipping or gift wrap charged' },
  { id: 'principal', bucket: 'sales', refund: true, test: (t, a, d) => /principal|item[\s_-]*price|product/i.test(`${a} ${d}`), words: 'the item price' },
];

export function classify(transactionType, amountType, description, map = {}) {
  const t = transactionType ?? '';
  const a = amountType ?? '';
  const d = description ?? '';
  const key = `${a}/${d}`;
  if (map[key]) return { bucket: map[key], rule: 'yours' };
  if (map[d]) return { bucket: map[d], rule: 'yours' };
  for (const r of RULES) {
    if (r.test(t, a, d)) return { bucket: r.refund && /refund/i.test(t) ? 'refunds' : r.bucket, rule: r.id };
  }
  return { bucket: 'other', rule: 'none' };
}

// ---------- delimited text ----------

// RFC 4180 records with a chosen separator: quoted fields, doubled quotes, CRLF/LF/CR line ends.
export function parseDelimited(text, delimiter = '\t') {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let i = 0;
  const s = text;
  while (i < s.length) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i++; continue;
      }
      field += c; i++; continue;
    }
    if (c === '"' && field === '') { quoted = true; i++; continue; }
    if (c === delimiter) { row.push(field); field = ''; i++; continue; }
    if (c === '\r' || c === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
      if (c === '\r' && s[i + 1] === '\n') i++;
      i++; continue;
    }
    field += c; i++;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => !r.every((x) => x.trim() === ''));
}

// Amazon's file is tab-delimited; a copy saved from a spreadsheet may use commas or semicolons.
export function sniffDelimiter(text) {
  const first = text.split(/\r?\n|\r/, 1)[0] ?? '';
  let best = '\t';
  let most = 0;
  for (const d of ['\t', ',', ';']) {
    const n = first.split(d).length;
    if (n > most) { most = n; best = d; }
  }
  return best;
}

export const normHeading = (h) => String(h).replace(/^﻿/, '').trim().toLowerCase().replace(/[\s_]+/g, '-');

// ---------- money ----------

const DIGITS = new Map();
// Decimal places of a currency, from the platform's ISO 4217 data (Intl). Unknown codes: 2.
export function decimalsOf(currency) {
  const c = String(currency || 'USD').toUpperCase();
  if (DIGITS.has(c)) return DIGITS.get(c);
  let d = 2;
  try { d = new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).resolvedOptions().maximumFractionDigits; } catch { d = 2; }
  DIGITS.set(c, d);
  return d;
}

// Which mark is the decimal separator in a written amount: 'comma', 'point' or null (cannot tell).
export function decimalMark(raw) {
  const s = String(raw ?? '').trim().replace(/^[-+(]/, '').replace(/\)$/, '');
  const lastComma = s.lastIndexOf(',');
  const lastPoint = s.lastIndexOf('.');
  if (lastComma >= 0 && lastPoint >= 0) return lastComma > lastPoint ? 'comma' : 'point';
  if (lastComma >= 0) return s.length - lastComma - 1 === 3 ? null : 'comma';
  if (lastPoint >= 0) return s.length - lastPoint - 1 === 3 && /^\d{1,3}(\.\d{3})+$/.test(s) ? null : 'point';
  return null;
}

// A written amount in minor units, exactly. mark is 'point' (1,234.56) or 'comma' (1.234,56).
// Blank is null; anything that is not a number is NaN.
export function parseAmount(raw, places = 2, mark = 'point') {
  if (raw === null || raw === undefined) return null;
  let s = String(raw).trim();
  if (s === '') return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1).trim(); }
  s = s.replace(/[−‒–]/g, '-');
  if (s.startsWith('-')) { neg = !neg; s = s.slice(1); } else if (s.startsWith('+')) s = s.slice(1);
  s = s.replace(/[\s  ']/g, '');
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return NaN;
  s = mark === 'comma' ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  if ((s.match(/[.,]/g) ?? []).length > 1) return NaN;
  const [int, frac = ''] = s.split('.');
  if (frac.length > places && /[1-9]/.test(frac.slice(places))) return NaN;
  const minor = Number(int || '0') * 10 ** places + Number((frac + '0'.repeat(places)).slice(0, places) || '0');
  if (!Number.isSafeInteger(minor)) return NaN;
  return neg && minor ? -minor : minor;
}

// Minor units as a plain decimal string: 123456 -> "1234.56", -5 -> "-0.05".
export function toDecimal(minor, places = 2) {
  const neg = minor < 0;
  const a = String(Math.abs(minor)).padStart(places + 1, '0');
  const s = places ? `${a.slice(0, -places)}.${a.slice(-places)}` : a;
  return (neg ? '-' : '') + s;
}

// For people: "$1,234.56", "-$3.20", "€10.00", "¥500".
export function money(minor, currency = 'USD') {
  const places = decimalsOf(currency);
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: String(currency).toUpperCase(), minimumFractionDigits: places, maximumFractionDigits: places }).format(minor / 10 ** places);
  } catch {
    return `${toDecimal(minor, places)} ${currency}`;
  }
}

// ---------- dates ----------

const pad = (n) => String(n).padStart(2, '0');
const realDay = (y, m, d) => {
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};

// A date or timestamp as Amazon writes it: 2026-10-24, 2026-10-24 07:00:00 UTC, 2026-10-24T07:00:00Z,
// 24.10.2026 07:00:00 UTC, or 10/24/26 (MM/DD/YY, the order Amazon gives for posted-date; dmy on
// request). Returns { date, time, utc } or null when it is not a date.
export function parseStamp(raw, order = 'mdy') {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  let y; let m; let d; let rest;
  let x = /^(\d{4})-(\d{1,2})-(\d{1,2})(.*)$/.exec(s);
  if (x) { [, y, m, d, rest] = x; } else if ((x = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(.*)$/.exec(s))) { [, d, m, y, rest] = x; } else if ((x = /^(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})(.*)$/.exec(s))) {
    [, m, d, y, rest] = x;
    if (order === 'dmy') [m, d] = [d, m];
    if (y.length === 2) y = `20${y}`;
  } else return null;
  y = Number(y); m = Number(m); d = Number(d);
  if (!realDay(y, m, d)) return null;
  const t = /^(?:[T ]\s*(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?)?\s*(UTC|GMT|Z|[+-]00:?00)?\s*$/i.exec(rest);
  if (!t) return null;
  const time = t[1] !== undefined ? `${pad(t[1])}:${t[2]}:${t[3] ?? '00'}` : null;
  if (time && (Number(t[1]) > 23 || Number(t[2]) > 59 || Number(t[3] ?? 0) > 59)) return null;
  return { date: `${y}-${pad(m)}-${pad(d)}`, time, utc: Boolean(t[4]) || /T.*Z$/i.test(s) };
}

// The calendar date at a UTC moment in a time zone (Intl; throws on an unknown zone).
export function dateInZone(date, time, zone) {
  const at = new Date(`${date}T${time}Z`);
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(at).map((p) => [p.type, p.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export const isZone = (zone) => {
  try { dateInZone('2026-01-01', '00:00:00', zone); return true; } catch { return false; }
};

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (iso) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
};
export const monthName = (ym) => `${MONTH_NAMES[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;
export const monthEnd = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return `${ym}-${pad(new Date(Date.UTC(y, m, 0)).getUTCDate())}`;
};
export const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
export const weekdayOf = (iso) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(`${iso}T12:00:00Z`).getUTCDay()];
const isWeekday = (iso) => { const w = new Date(`${iso}T12:00:00Z`).getUTCDay(); return w !== 0 && w !== 6; };

// Weekdays after `from` up to and including `to` (no holidays): Amazon says a payment can take up to
// five business days to reach the bank after it is sent.
export function businessDaysBetween(from, to) {
  if (to <= from) return 0;
  let n = 0;
  for (let d = addDays(from, 1); d <= to; d = addDays(d, 1)) if (isWeekday(d)) n++;
  return n;
}
// The fifth weekday after a date.
export function addBusinessDays(iso, n) {
  let d = iso;
  let k = 0;
  while (k < n) { d = addDays(d, 1); if (isWeekday(d)) k++; }
  return d;
}

// Settlement periods of `days` days from a first start date until a date: Amazon's help gives a
// 14-day payout period. Each says whether a month end falls inside it, and how its days split.
export function cycles(firstStart, until, days = 14) {
  const out = [];
  for (let start = firstStart; start <= until; start = addDays(start, days)) {
    const end = addDays(start, days);
    const lastDay = addDays(end, -1);
    const me = monthEnd(start.slice(0, 7));
    const straddles = me < lastDay;
    out.push({ start, end, straddles, monthEnd: straddles ? me : null, daysBefore: straddles ? Math.round((Date.parse(me) - Date.parse(start)) / 86_400_000) + 1 : days, daysAfter: straddles ? Math.round((Date.parse(lastDay) - Date.parse(me)) / 86_400_000) : 0 });
  }
  return out;
}

// ---------- reading the file ----------

function headerMap(head, columns = {}) {
  const at = new Map(head.map((h, i) => [normHeading(h), i]));
  const idx = {};
  for (const c of V2_COLUMNS) {
    if (columns[c] !== undefined) {
      const i = at.get(normHeading(columns[c]));
      if (i === undefined) throw new SettlementError(`The column "${columns[c]}" you named for ${c} is not in the file's first line.`, 'columns');
      idx[c] = i;
    } else if (at.has(c)) idx[c] = at.get(c);
  }
  return idx;
}

// The file as rows and settlements. Throws SettlementError naming the line on anything it cannot read.
export function read(text, opts = {}) {
  if (typeof text !== 'string' || !text.trim()) throw new SettlementError('The file is empty.');
  if (text.length > LIMITS.bytes) throw new SettlementError('The file is over 5 MB; Amazon makes one report per settlement, so send them one or a few at a time.');
  const delim = sniffDelimiter(text);
  const table = parseDelimited(text, delim);
  if (table.length > LIMITS.rows + 1) throw new SettlementError(`The file has more than ${LIMITS.rows.toLocaleString('en-US')} rows.`);
  const head = table[0];
  const idx = headerMap(head, opts.columns ?? {});
  const missing = ['settlement-id', 'amount'].filter((c) => idx[c] === undefined);
  if (missing.length) {
    throw new SettlementError(`This is not an Amazon Flat File V2 settlement report: the first line has no ${missing.join(' or ')} column. Download the settlement report as Flat File V2, or name the columns (columns: { "amount": "your heading" }).`);
  }
  if (idx['posted-date'] === undefined && idx['posted-date-time'] === undefined) {
    throw new SettlementError('The file has no posted-date or posted-date-time column, so it cannot be split by month. Name the date column (columns: { "posted-date": "your heading" }).', 'columns');
  }
  const cell = (r, c) => (idx[c] === undefined ? '' : String(r[idx[c]] ?? '').trim());
  const order = opts.dateOrder === 'dmy' ? 'dmy' : 'mdy';
  const body = table.slice(1).map((r, i) => ({ r, line: i + 2 }));

  // The decimal mark: Amazon writes amounts in the marketplace's own format (95,00 in the EU).
  let mark = opts.decimal ?? null;
  if (!mark) {
    const seen = new Set();
    for (const { r } of body) for (const c of ['amount', 'total-amount']) { const m = decimalMark(cell(r, c)); if (m) seen.add(m); }
    if (seen.size > 1) throw new SettlementError('The amounts mix decimal points (12.50) and decimal commas (12,50). Say which one the file uses (decimal: "point" or "comma").', 'decimal');
    mark = seen.has('comma') ? 'comma' : 'point';
  }

  const zone = opts.timeZone || null;
  const settlements = new Map();
  const rows = [];
  const settle = (id) => {
    if (!settlements.has(id)) settlements.set(id, { id, currency: null, start: null, end: null, depositDate: null, total: null, totalLine: null, rows: [] });
    return settlements.get(id);
  };
  const stamp = (raw, line, column) => {
    if (!raw) return null;
    const p = parseStamp(raw, order);
    if (!p) throw new SettlementError(`Line ${line}: ${column} "${raw}" is not a date this reads (2026-10-24, 2026-10-24 07:00:00 UTC, 24.10.2026 or 10/24/26).`, 'file');
    return p;
  };
  for (const { r, line } of body) {
    const id = cell(r, 'settlement-id');
    if (!id) throw new SettlementError(`Line ${line} has no settlement-id.`);
    const s = settle(id);
    if (settlements.size > LIMITS.settlements) throw new SettlementError(`The file holds more than ${LIMITS.settlements} settlements.`);
    const currency = (cell(r, 'currency') || s.currency || opts.currency || 'USD').toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency)) throw new SettlementError(`Line ${line}: currency "${cell(r, 'currency')}" is not a three-letter code.`);
    if (s.currency && cell(r, 'currency') && s.currency !== currency) throw new SettlementError(`Settlement ${id} has rows in ${s.currency} and ${currency}.`);
    s.currency = s.currency ?? currency;
    const places = decimalsOf(s.currency);
    for (const [k, c] of [['start', 'settlement-start-date'], ['end', 'settlement-end-date'], ['depositDate', 'deposit-date']]) {
      const p = stamp(cell(r, c), line, c);
      if (p && !s[k]) s[k] = p.date;
      else if (p && s[k] !== p.date) throw new SettlementError(`Settlement ${id} has two ${c} values: ${s[k]} and ${p.date}.`);
    }
    const totalRaw = cell(r, 'total-amount');
    if (totalRaw) {
      const t = parseAmount(totalRaw, places, mark);
      if (Number.isNaN(t)) throw new SettlementError(`Line ${line}: total-amount "${totalRaw}" is not an amount in ${s.currency}.`);
      if (s.total !== null && s.total !== t) throw new SettlementError(`Settlement ${id} has two total-amount values: ${toDecimal(s.total, places)} (line ${s.totalLine}) and ${toDecimal(t, places)} (line ${line}).`);
      s.total = t;
      s.totalLine = s.totalLine ?? line;
    }
    const amountRaw = cell(r, 'amount');
    if (!amountRaw) continue; // the settlement's summary row carries the totals, not a transaction
    const amount = parseAmount(amountRaw, places, mark);
    if (Number.isNaN(amount)) throw new SettlementError(`Line ${line}: amount "${amountRaw}" is not an amount in ${s.currency}.`);
    const pdt = stamp(cell(r, 'posted-date-time'), line, 'posted-date-time');
    const pd = stamp(cell(r, 'posted-date'), line, 'posted-date');
    let posted = null;
    if (zone && pdt?.time) posted = dateInZone(pdt.date, pdt.time, zone);
    else if (pd) posted = pd.date;
    else if (pdt) posted = pdt.date;
    const type = cell(r, 'transaction-type');
    const amountType = cell(r, 'amount-type');
    const desc = cell(r, 'amount-description');
    const { bucket, rule } = classify(type, amountType, desc, opts.map);
    const row = {
      line, settlement: id, currency: s.currency, type, amountType, desc, amount, posted, bucket, rule,
      order: cell(r, 'order-id'), sku: cell(r, 'sku'), quantity: cell(r, 'quantity-purchased'), marketplace: cell(r, 'marketplace-name'),
    };
    rows.push(row);
    s.rows.push(row);
  }
  if (!rows.length) throw new SettlementError('The file has a header but no rows with an amount.');
  return { settlements: [...settlements.values()], rows, decimal: mark, dateOrder: order, delimiter: delim === '\t' ? 'tab' : delim === ',' ? 'comma' : 'semicolon', timeZone: zone };
}

export function countSettlements(text, opts = {}) {
  return read(text, opts).settlements.length;
}

// ---------- periods ----------

// The period a posted day belongs to: its calendar month, or with cut-offs, the first cut-off on or
// after it ("through 2026-10-31") and "after" the last one.
function periodOf(day, cutoffs) {
  if (!cutoffs.length) return { key: day.slice(0, 7), label: monthName(day.slice(0, 7)), last: monthEnd(day.slice(0, 7)) };
  for (const c of cutoffs) if (day <= c) return { key: `to:${c}`, label: `through ${longDate(c)}`, last: c };
  const c = cutoffs.at(-1);
  return { key: `after:${c}`, label: `after ${longDate(c)}`, last: null };
}

const emptyTotals = () => Object.fromEntries(BUCKET_IDS.map((b) => [b, 0]));

// ---------- the check (free) ----------

// Bank amounts you give, per settlement: { "<settlement-id>": ["1234.56", "100.00"] } or one list
// (or one amount) for a file with a single settlement.
function depositsFor(s, opts, many) {
  const d = opts.deposits;
  if (d === undefined || d === null) return null;
  let list;
  if (Array.isArray(d) || typeof d !== 'object') list = many ? null : [].concat(d);
  else list = d[s.id] === undefined ? null : [].concat(d[s.id]);
  if (!list) return null;
  if (list.length > LIMITS.deposits) throw new SettlementError(`At most ${LIMITS.deposits} bank deposits for one settlement.`, 'deposits');
  const places = decimalsOf(opts.bankCurrency || s.currency);
  return list.map((v) => {
    const x = typeof v === 'number' ? Math.round(v * 10 ** places) : parseAmount(v, places, decimalMark(v) === 'comma' ? 'comma' : 'point');
    if (x === null || Number.isNaN(x)) throw new SettlementError(`The bank deposit "${v}" is not an amount.`, 'deposits');
    return x;
  });
}

function tie(s, opts, many) {
  const bank = depositsFor(s, opts, many);
  const bankCurrency = (opts.bankCurrency || s.currency).toUpperCase();
  const out = { bank: bank ? bank.reduce((a, b) => a + b, 0) : null, lines: bank, currency: bankCurrency, status: 'not given', difference: null, notes: [] };
  if (s.total === null) { out.status = 'no total'; return out; }
  if (s.total < 0) {
    out.status = 'negative';
    out.notes.push(`The settlement is negative (${money(s.total, s.currency)}): Amazon pays nothing for it. Amazon's help says a negative balance not cleared by the next settlement has to be paid, and it may charge the card on file.`);
    if (bank && out.bank !== 0) out.notes.push(`A bank line of ${money(out.bank, bankCurrency)} does not belong to this settlement.`);
    return out;
  }
  if (!bank) return out;
  if (bankCurrency !== s.currency) {
    out.status = 'converted';
    const rate = out.bank / 10 ** decimalsOf(bankCurrency) / (s.total / 10 ** decimalsOf(s.currency));
    out.rate = s.total ? Number(rate.toFixed(6)) : null;
    out.notes.push(`The settlement is in ${s.currency} and the bank line in ${bankCurrency}: ${money(s.total, s.currency)} arrived as ${money(out.bank, bankCurrency)}, ${out.rate} ${bankCurrency} per ${s.currency}. The conversion is the bank's or Amazon's; book the difference as currency gain or loss.`);
    return out;
  }
  out.difference = out.bank - s.total;
  out.status = out.difference === 0 ? 'ties' : 'gap';
  if (out.difference < 0 && bank.length === 1) out.notes.push(`Amazon's help says a payment can come from two payers, Amazon Payments, Inc. and Amazon Services LLC. Look for a second deposit of ${money(-out.difference, s.currency)}.`);
  if (out.difference !== 0) out.notes.push(`${money(Math.abs(out.difference), s.currency)} ${out.difference < 0 ? 'short of' : 'more than'} the settlement's total-amount. Check the deposit is for settlement ${s.id}, and that no other settlement's deposit landed the same day.`);
  if (opts.bankDate && s.depositDate) {
    const bd = businessDaysBetween(s.depositDate, opts.bankDate);
    out.businessDays = bd;
    if (opts.bankDate < s.depositDate) out.notes.push(`The bank date ${longDate(opts.bankDate)} is before the deposit-date ${longDate(s.depositDate)}: it is probably another settlement's deposit.`);
    else if (bd > 5) out.notes.push(`The money reached the bank ${bd} business days after the deposit-date; Amazon says it can take up to five. Ask the bank with the Trace ID from Seller Central.`);
  }
  return out;
}

function summarize(s, opts, many) {
  const cutoffs = [].concat(opts.cutoff ?? []).filter(Boolean).sort();
  const places = decimalsOf(s.currency);
  const parts = new Map();
  let undated = 0;
  const endDay = s.end ?? s.rows.map((r) => r.posted).filter(Boolean).sort().at(-1) ?? null;
  for (const r of s.rows) {
    let day = r.posted;
    if (!day) { day = endDay; undated++; }
    if (!day) throw new SettlementError(`Settlement ${s.id}: line ${r.line} has no posted date and the settlement no end date.`);
    const p = periodOf(day, cutoffs);
    if (!parts.has(p.key)) parts.set(p.key, { key: p.key, label: p.label, last: p.last, from: day, to: day, rows: 0, net: 0, totals: emptyTotals() });
    const part = parts.get(p.key);
    part.rows++;
    part.net += r.amount;
    part.totals[r.bucket] += r.amount;
    if (day < part.from) part.from = day;
    if (day > part.to) part.to = day;
    r.part = p.key;
  }
  const list = [...parts.values()].sort((a, b) => (a.from < b.from ? -1 : 1));
  // A part's journal date: the end of its month (or cut-off), or the settlement's end in the last part.
  for (const [i, p] of list.entries()) p.date = i < list.length - 1 && p.last ? p.last : (endDay && (!p.last || endDay <= p.last) ? endDay : p.last ?? p.to);
  const sum = s.rows.reduce((a, r) => a + r.amount, 0);
  const sameSign = s.total && list.every((p) => p.net === 0 || Math.sign(p.net) === Math.sign(s.total));
  for (const p of list) p.percent = sameSign ? Math.round((p.net / s.total) * 1000) / 10 : null;
  const reserveRows = s.rows.filter((r) => r.bucket === 'reserve');
  const reserve = {
    released: reserveRows.filter((r) => r.amount > 0).reduce((a, r) => a + r.amount, 0),
    held: -reserveRows.filter((r) => r.amount < 0).reduce((a, r) => a + r.amount, 0),
  };
  reserve.net = reserve.released - reserve.held;
  const out = {
    id: s.id, currency: s.currency, places, start: s.start, end: s.end, depositDate: s.depositDate,
    total: s.total, sum, difference: s.total === null ? null : sum - s.total, proof: s.total === null ? 'no total' : sum === s.total ? 'ties' : 'gap',
    rows: s.rows.length, undated, parts: list, straddles: list.length > 1, reserve,
    others: [...new Set(s.rows.filter((r) => r.bucket === 'other' && r.rule !== 'yours').map((r) => `${r.amountType}/${r.desc}`))],
    marketplaces: [...new Set(s.rows.map((r) => r.marketplace).filter(Boolean))],
  };
  out.deposit = tie(s, opts, many);
  out.checklist = checklist(out, opts);
  return out;
}

// The month-end checklist, item by item, from the file (and the bank lines given).
function checklist(s, opts) {
  const m = (v) => money(v, s.currency);
  const items = [];
  items.push({ item: 'The rows add up to total-amount', status: s.proof === 'ties' ? 'pass' : s.proof === 'gap' ? 'check' : 'n/a', detail: s.proof === 'ties' ? `${s.rows} rows make ${m(s.sum)}.` : s.proof === 'gap' ? `${s.rows} rows make ${m(s.sum)}, ${m(Math.abs(s.difference))} ${s.difference < 0 ? 'under' : 'over'} the ${m(s.total)} total: the file may be cut short.` : 'The file has no total-amount.' });
  const d = s.deposit;
  items.push({ item: 'Tied to the bank', status: d.status === 'ties' ? 'pass' : d.status === 'gap' ? 'check' : d.status === 'negative' ? 'pass' : d.status === 'converted' ? 'check' : 'n/a', detail: d.status === 'ties' ? `${m(d.bank)} in the bank equals the total.` : d.status === 'gap' ? `The bank has ${m(d.bank)}, ${m(Math.abs(d.difference))} ${d.difference < 0 ? 'short' : 'over'}.` : d.status === 'negative' ? 'A negative settlement pays nothing.' : d.status === 'converted' ? `Received in ${d.currency}; book the conversion.` : 'Give the bank deposit to tie it.' });
  items.push({ item: 'Split at the period end', status: 'pass', detail: s.straddles ? `Split into ${s.parts.length} parts: ${s.parts.map((p) => `${p.label} ${m(p.net)}`).join(', ')}.` : `All of it is in ${s.parts[0].label}.` });
  items.push({ item: 'Reserve on the balance sheet', status: 'pass', detail: s.reserve.held || s.reserve.released ? `${m(s.reserve.released)} released and ${m(s.reserve.held)} held: book them to the reserve account, not to expenses.` : 'No reserve rows in this settlement.' });
  items.push({ item: 'Every amount-type placed on a line', status: s.others.length ? 'check' : 'pass', detail: s.others.length ? `Not placed by the rules, booked to Other: ${s.others.slice(0, 6).join(', ')}${s.others.length > 6 ? ', ...' : ''}.` : 'Every value matched a rule; review the list before you post.' });
  items.push({ item: 'Every row has a posted date', status: s.undated ? 'check' : 'pass', detail: s.undated ? `${s.undated} rows had none and were put on the settlement's end date.` : 'Yes.' });
  if (opts.bankDate && d.businessDays !== undefined) items.push({ item: 'Arrived within five business days', status: d.businessDays <= 5 ? 'pass' : 'check', detail: `${d.businessDays} business day${d.businessDays === 1 ? '' : 's'} after the deposit-date.` });
  return items;
}

function answerOf(list, many) {
  if (list.length > 1) {
    const by = new Map();
    for (const s of list) by.set(s.currency, (by.get(s.currency) ?? 0) + (s.total ?? s.sum));
    const ties = list.filter((s) => s.proof === 'ties').length;
    const straddle = list.filter((s) => s.straddles).length;
    return `${list.length} settlements totalling ${[...by].map(([c, v]) => money(v, c)).join(' and ')}: ${ties === list.length ? 'every one adds up to its total-amount to the cent' : `${ties} of ${list.length} add up to their total-amount`}, and ${straddle} ${straddle === 1 ? 'crosses' : 'cross'} a period end and ${straddle === 1 ? 'is' : 'are'} split.`;
  }
  void many;
  const s = list[0];
  const m = (v) => money(v, s.currency);
  const period = s.start && s.end ? ` (${longDate(s.start)} to ${longDate(s.end)})` : '';
  const head = s.total === null
    ? `Settlement ${s.id}${period} has no total-amount in the file; its ${s.rows} rows add up to ${m(s.sum)}`
    : s.proof === 'ties'
      ? `Settlement ${s.id}${period} totals ${m(s.total)}, and its ${s.rows} rows add up to it to the cent`
      : `Settlement ${s.id}${period} says ${m(s.total)}, but its ${s.rows} rows add up to ${m(s.sum)}, ${m(Math.abs(s.difference))} ${s.difference < 0 ? 'short' : 'over'}`;
  const d = s.deposit;
  const tail = d.status === 'ties' ? `; it ties to the bank deposit${d.lines.length > 1 ? `s of ${d.lines.map(m).join(' and ')}` : ` of ${m(d.bank)}`}`
    : d.status === 'gap' ? `; the bank shows ${m(d.bank)}, ${m(Math.abs(d.difference))} ${d.difference < 0 ? 'short' : 'over'}`
      : d.status === 'negative' ? '; it is negative, so no deposit comes from it'
        : d.status === 'converted' ? `; it arrived as ${money(d.bank, d.currency)}`
          : s.depositDate ? `, to be deposited on ${longDate(s.depositDate)}` : '';
  const split = s.straddles
    ? ` ${s.parts.map((p, i) => `${p.percent !== null ? `${p.percent}% (${m(p.net)})` : m(p.net)} ${i === 0 ? 'is posted in' : 'in'} ${p.label}`).join(i18nAnd(s.parts.length))}.`
    : ` All of it is posted in ${s.parts[0].label}.`;
  return `${head}${tail}.${split}`;
}
const i18nAnd = (n) => (n > 2 ? ', ' : ' and ');

// The free check: the proof, the bank tie, the split per period, the reserve and the checklist.
export function check(text, opts = {}) {
  const data = read(text, opts);
  const many = data.settlements.length > 1;
  const list = data.settlements.map((s) => summarize(s, opts, many));
  const warnings = [];
  for (const s of list) {
    if (s.proof === 'gap') warnings.push(`Settlement ${s.id}: the rows add up to ${money(s.sum, s.currency)}, not the ${money(s.total, s.currency)} total-amount. The file may be cut short or edited.`);
    if (s.others.length) warnings.push(`Settlement ${s.id}: ${s.others.length} amount ${s.others.length === 1 ? 'type' : 'types'} matched no rule and ${s.others.length === 1 ? 'is' : 'are'} booked to Other: ${s.others.slice(0, 4).join(', ')}. Move ${s.others.length === 1 ? 'it' : 'them'} with map if you know where ${s.others.length === 1 ? 'it goes' : 'they go'}.`);
    if (s.undated) warnings.push(`Settlement ${s.id}: ${s.undated} rows have no posted date and were put on the settlement's end date.`);
  }
  return { answer: answerOf(list, many), settlements: list, warnings, decimal: data.decimal, dateOrder: data.dateOrder, delimiter: data.delimiter, timeZone: data.timeZone, rows: data.rows };
}

// Every distinct transaction-type / amount-type / amount-description in a settlement, its total,
// how many rows, and the line it went to (and by which rule): the list to review before posting.
export function groupsOf(rows) {
  const g = new Map();
  for (const r of rows) {
    const k = `${r.type}\u0000${r.amountType}\u0000${r.desc}`;
    if (!g.has(k)) g.set(k, { type: r.type, amountType: r.amountType, description: r.desc, bucket: r.bucket, rule: r.rule, rows: 0, total: 0 });
    const x = g.get(k);
    x.rows++;
    x.total += r.amount;
  }
  return [...g.values()].sort((a, b) => BUCKET_IDS.indexOf(a.bucket) - BUCKET_IDS.indexOf(b.bucket) || Math.abs(b.total) - Math.abs(a.total));
}

// ---------- journals (paid) ----------

export function defaultAccounts(feesAs = 'expense') {
  const a = Object.fromEntries(BUCKETS.map((b) => [b.id, b.account]));
  if (feesAs === 'contra-revenue') { a.sellingFees = 'Amazon sales: selling fees'; a.fbaFees = 'Amazon sales: FBA fees'; }
  a.clearing = 'Amazon clearing';
  a.bank = 'Checking';
  return a;
}

// One balanced journal per settlement and period: each line's total against its account (money to you
// is a credit, money taken a debit), and the period's net into the clearing account. With transfer,
// a journal moves the total-amount from clearing to the bank on the deposit-date.
export function journals(result, { accounts = {}, feesAs = 'expense', transfer = false } = {}) {
  const acc = { ...defaultAccounts(feesAs), ...accounts };
  const out = [];
  for (const s of result.settlements) {
    for (const p of s.parts) {
      const byAccount = new Map();
      for (const b of BUCKET_IDS) {
        const v = p.totals[b];
        if (!v) continue;
        byAccount.set(acc[b], (byAccount.get(acc[b]) ?? 0) + v);
      }
      const lines = [];
      for (const [account, v] of byAccount) if (v) lines.push({ account, debit: v < 0 ? -v : 0, credit: v > 0 ? v : 0 });
      if (p.net) lines.push({ account: acc.clearing, debit: p.net > 0 ? p.net : 0, credit: p.net < 0 ? -p.net : 0 });
      out.push({ id: s.id, part: p.key, currency: s.currency, date: p.date, memo: `Amazon settlement ${s.id}, ${p.label}`, lines, debits: sumOf(lines, 'debit'), credits: sumOf(lines, 'credit') });
    }
    if (transfer && s.total) {
      const lines = s.total > 0 ? [{ account: acc.bank, debit: s.total, credit: 0 }, { account: acc.clearing, debit: 0, credit: s.total }] : [{ account: acc.clearing, debit: -s.total, credit: 0 }, { account: acc.bank, debit: 0, credit: -s.total }];
      out.push({ id: s.id, part: 'deposit', currency: s.currency, date: s.depositDate ?? s.end, memo: `Amazon settlement ${s.id}, ${s.total > 0 ? 'deposit' : 'paid to Amazon'}`, lines, debits: Math.abs(s.total), credits: Math.abs(s.total) });
    }
  }
  return out;
}
const sumOf = (lines, k) => lines.reduce((a, l) => a + l[k], 0);

// ---------- files ----------

const csvField = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+@\t\r]/.test(s) || (/^-/.test(s) && !/^-\d+(\.\d+)?$/.test(s))) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const writeCsv = (rows) => rows.map((r) => r.map(csvField).join(',')).join('\r\n') + '\r\n';

const dateAs = (iso, fmt) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return fmt === 'iso' ? iso : fmt === 'dmy' ? `${d}/${m}/${y}` : `${m}/${d}/${y}`;
};
// QuickBooks Online journal numbers are short: the end of the settlement id and the part's number.
const journalNo = (j, i) => `AMZ${String(j.id).replace(/[^A-Za-z0-9]/g, '').slice(-10)}-${i + 1}`;

// QuickBooks Online "Import journal entries": Journal No., Journal Date, Account Name,
// Journal/Description, Debits, Credits (Intuit's list). Lines with the same number are one entry.
export function quickbooksCsv(js, { dates = 'mdy' } = {}) {
  const rows = [['Journal No', 'Journal Date', 'Account Name', 'Description', 'Debits', 'Credits']];
  const seen = new Map();
  for (const j of js) {
    const n = seen.get(j.id) ?? 0;
    seen.set(j.id, n + 1);
    const places = decimalsOf(j.currency);
    for (const l of j.lines) rows.push([journalNo(j, n), dateAs(j.date, dates), l.account, j.memo, l.debit ? toDecimal(l.debit, places) : '', l.credit ? toDecimal(l.credit, places) : '']);
  }
  return writeCsv(rows);
}

// Xero manual journal lines: one signed amount, debits positive and credits negative (Xero's
// ManualJournalLine.LineAmount). Lines with the same narration and date are one journal.
export function xeroCsv(js, { dates = 'mdy' } = {}) {
  const rows = [['Narration', 'Date', 'Description', 'Account', 'Amount']];
  for (const j of js) {
    const places = decimalsOf(j.currency);
    for (const l of j.lines) rows.push([j.memo, dateAs(j.date, dates), j.memo, l.account, toDecimal(l.debit - l.credit, places)]);
  }
  return writeCsv(rows);
}

// One row per settlement and period: every line's total, the net, and the settlement's proof and tie.
export function summaryCsv(result) {
  const rows = [['settlement_id', 'currency', 'period', 'from', 'to', 'journal_date', 'rows', ...BUCKET_IDS, 'net', 'settlement_total', 'proof', 'bank', 'bank_tie']];
  for (const s of result.settlements) {
    const p2 = s.places;
    for (const p of s.parts) {
      rows.push([s.id, s.currency, p.label, p.from, p.to, p.date, p.rows, ...BUCKET_IDS.map((b) => toDecimal(p.totals[b], p2)), toDecimal(p.net, p2), s.total === null ? '' : toDecimal(s.total, p2), s.proof, s.deposit.bank === null ? '' : toDecimal(s.deposit.bank, decimalsOf(s.deposit.currency)), s.deposit.status]);
    }
  }
  return writeCsv(rows);
}

// Every row with its period and line: the audit trail behind the journal.
export function lineCsv(rows) {
  const out = [['line', 'settlement_id', 'posted', 'period', 'transaction_type', 'amount_type', 'amount_description', 'order_id', 'sku', 'amount', 'currency', 'booked_to', 'rule']];
  for (const r of rows) out.push([r.line, r.settlement, r.posted ?? '', r.part ?? '', r.type, r.amountType, r.desc, r.order, r.sku, toDecimal(r.amount, decimalsOf(r.currency)), r.currency, BUCKET[r.bucket].label, r.rule]);
  return writeCsv(out);
}

// The full, paid output: the check plus the lines per period, the value list, the journals and files.
export function reconcile(text, opts = {}) {
  const r = check(text, opts);
  const js = journals(r, { accounts: opts.accounts, feesAs: opts.feesAs, transfer: opts.transfer });
  const ledger = opts.ledger === 'xero' ? 'xero' : 'quickbooks-online';
  const dates = opts.dates ?? 'mdy';
  const stem = r.settlements.length === 1 ? `amazon-settlement-${String(r.settlements[0].id).replace(/[^A-Za-z0-9-]/g, '')}` : 'amazon-settlements';
  return {
    ...r,
    groups: r.settlements.map((s) => ({ settlement: s.id, currency: s.currency, values: groupsOf(r.rows.filter((x) => x.settlement === s.id)) })),
    ledger,
    accounts: { ...defaultAccounts(opts.feesAs), ...(opts.accounts ?? {}) },
    journals: js,
    files: {
      import: { name: `${stem}-${ledger}.csv`, text: ledger === 'xero' ? xeroCsv(js, { dates }) : quickbooksCsv(js, { dates }) },
      summary: { name: `${stem}-summary.csv`, text: summaryCsv(r) },
      lines: { name: `${stem}-lines.csv`, text: lineCsv(r.rows) },
    },
  };
}

// ---------- made-up samples (V2 headers; the amount-type and amount-description values are
// illustrative, not a list from Amazon) ----------

function sampleFile({ id, start, end, deposit, currency, marketplace, rows, comma = false, dates = 'us' }) {
  const places = decimalsOf(currency);
  const total = rows.reduce((a, r) => a + r[4], 0);
  const amt = (v) => (comma ? toDecimal(v, places).replace('.', ',') : toDecimal(v, places));
  const stampOf = (iso, time = '07:00:00') => (dates === 'eu' ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)} ${time} UTC` : `${iso} ${time} UTC`);
  const postedOf = (iso) => (dates === 'eu' ? `${iso.slice(8, 10)}.${iso.slice(5, 7)}.${iso.slice(0, 4)}` : `${iso.slice(5, 7)}/${iso.slice(8, 10)}/${iso.slice(2, 4)}`);
  const lines = [V2_COLUMNS.join('\t')];
  lines.push([id, stampOf(start), stampOf(end), stampOf(deposit, '09:00:00'), amt(total), currency, ...Array(18).fill('')].join('\t'));
  for (const [type, order, amountType, desc, v, posted, sku = '', qty = '', time = '15:20:11'] of rows) {
    const rec = Object.fromEntries(V2_COLUMNS.map((c) => [c, '']));
    Object.assign(rec, { 'settlement-id': id, 'transaction-type': type, 'order-id': order, 'marketplace-name': order ? marketplace : '', 'amount-type': amountType, 'amount-description': desc, amount: amt(v), 'fulfillment-id': order ? 'AFN' : '', 'posted-date': postedOf(posted), 'posted-date-time': `${posted} ${time} UTC`, sku, 'quantity-purchased': qty });
    lines.push(V2_COLUMNS.map((c) => rec[c]).join('\t'));
  }
  return lines.join('\n') + '\n';
}

// An order's rows: price, tax, the tax Amazon withholds as marketplace facilitator, commission and FBA fee.
const order = (o, posted, price, tax, commission, fba, sku, qty = '1', time) => [
  ['Order', o, 'ItemPrice', 'Principal', price, posted, sku, qty, time],
  ['Order', o, 'ItemPrice', 'Tax', tax, posted, sku, qty, time],
  ['Order', o, 'ItemWithheldTax', 'MarketplaceFacilitatorTax-Principal', -tax, posted, sku, qty, time],
  ['Order', o, 'ItemFees', 'Commission', -commission, posted, sku, qty, time],
  ['Order', o, 'ItemFees', 'FBAPerUnitFulfillmentFee', -fba, posted, sku, qty, time],
];

export const SAMPLE_DEFS = {
  us: {
    id: '24816093571', start: '2026-10-24', end: '2026-11-07', deposit: '2026-11-09', currency: 'USD', marketplace: 'Amazon.com',
    rows: [
      ['other-transaction', '', 'other-transaction', 'Previous Reserve Amount Balance', 12000, '2026-10-24'],
      ...order('112-0000001-0000001', '2026-10-25', 3999, 320, 600, 540, 'MUG-BLUE'),
      ...order('112-0000002-0000002', '2026-10-29', 7998, 640, 1200, 1080, 'MUG-SET', '2'),
      ['Order', '112-0000002-0000002', 'Promotion', 'Principal', -500, '2026-10-29', 'MUG-SET', '2'],
      ['other-transaction', '', 'other-transaction', 'Subscription Fee', -3999, '2026-10-30'],
      ...order('112-0000003-0000003', '2026-10-31', 2499, 200, 375, 425, 'COASTER-4', '1', '22:41:05'),
      ['other-transaction', '', 'Cost of Advertising', 'TransactionTotalAmount', -4217, '2026-11-01'],
      ...order('112-0000004-0000004', '2026-11-02', 5999, 480, 900, 610, 'MUG-RED'),
      ['Refund', '112-0000001-0000001', 'ItemPrice', 'Principal', -3999, '2026-11-03', 'MUG-BLUE', '1'],
      ['Refund', '112-0000001-0000001', 'ItemPrice', 'Tax', -320, '2026-11-03', 'MUG-BLUE', '1'],
      ['Refund', '112-0000001-0000001', 'ItemWithheldTax', 'MarketplaceFacilitatorTax-Principal', 320, '2026-11-03', 'MUG-BLUE', '1'],
      ['Refund', '112-0000001-0000001', 'ItemFees', 'Commission', 600, '2026-11-03', 'MUG-BLUE', '1'],
      ['Refund', '112-0000001-0000001', 'ItemFees', 'RefundCommission', -120, '2026-11-03', 'MUG-BLUE', '1'],
      ['other-transaction', '', 'FBA Inventory Reimbursement', 'WAREHOUSE_DAMAGE', 1850, '2026-11-04', 'MUG-RED', '1'],
      ...order('112-0000005-0000005', '2026-11-05', 14999, 1200, 2250, 815, 'MUG-GIFT'),
      ['other-transaction', '', 'other-transaction', 'Current Reserve Amount', -9500, '2026-11-07'],
    ],
  },
  negative: {
    id: '24816093572', start: '2026-11-07', end: '2026-11-21', deposit: '2026-11-23', currency: 'USD', marketplace: 'Amazon.com',
    rows: [
      ['other-transaction', '', 'other-transaction', 'Previous Reserve Amount Balance', 9500, '2026-11-07'],
      ...order('112-0000006-0000006', '2026-11-10', 2499, 200, 375, 425, 'COASTER-4'),
      ['Refund', '112-0000005-0000005', 'ItemPrice', 'Principal', -14999, '2026-11-12', 'MUG-GIFT', '1'],
      ['Refund', '112-0000005-0000005', 'ItemPrice', 'Tax', -1200, '2026-11-12', 'MUG-GIFT', '1'],
      ['Refund', '112-0000005-0000005', 'ItemWithheldTax', 'MarketplaceFacilitatorTax-Principal', 1200, '2026-11-12', 'MUG-GIFT', '1'],
      ['Refund', '112-0000005-0000005', 'ItemFees', 'Commission', 2250, '2026-11-12', 'MUG-GIFT', '1'],
      ['Refund', '112-0000005-0000005', 'ItemFees', 'RefundCommission', -450, '2026-11-12', 'MUG-GIFT', '1'],
      ['other-transaction', '', 'Cost of Advertising', 'TransactionTotalAmount', -6380, '2026-11-15'],
      ['other-transaction', '', 'other-transaction', 'FBA Inventory Storage Fee', -2875, '2026-11-16'],
      ['other-transaction', '', 'other-transaction', 'Current Reserve Amount', -2000, '2026-11-21'],
    ],
  },
  eu: {
    id: '13572468024', start: '2026-10-22', end: '2026-11-05', deposit: '2026-11-07', currency: 'EUR', marketplace: 'Amazon.de', comma: true, dates: 'eu',
    rows: [
      ...order('302-0000001-0000001', '2026-10-23', 9500, 0, 1425, 410, 'TEE-BLK-M').filter((r) => r[3] !== 'Tax' && !/Withheld/.test(r[2])),
      ...order('302-0000002-0000002', '2026-10-30', 12350, 0, 1853, 615, 'TEE-SET-3', '2').filter((r) => r[3] !== 'Tax' && !/Withheld/.test(r[2])),
      ['other-transaction', '', 'other-transaction', 'Subscription Fee', -3900, '2026-10-31'],
      ...order('302-0000003-0000003', '2026-11-02', 4750, 0, 713, 410, 'TEE-WHT-S').filter((r) => r[3] !== 'Tax' && !/Withheld/.test(r[2])),
      ['other-transaction', '', 'other-transaction', 'Current Reserve Amount', -2500, '2026-11-05'],
    ],
  },
};

export const SAMPLES = Object.fromEntries(Object.entries(SAMPLE_DEFS).map(([k, d]) => [k, sampleFile(d)]));
// The bank side of each sample: what reached the bank (two payers for the US sample).
export const SAMPLE_BANK = { us: ['150.00', '38.14'], negative: [], eu: ['147.74'] };
