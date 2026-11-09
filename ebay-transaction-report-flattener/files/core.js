// eBay transaction report flattener: the engine. Pure and dependency-free, so the page and the server
// run the same file (README: core.js is browser-loadable).
//
// What eBay publishes, and what this engine does with it:
//  - eBay's help ("Reconciling your eBay sales transactions", US, UK, AU and CA, read 2026-11-08)
//    names the details a transaction report can hold (Order ID, Item ID, Payout ID, Reference ID,
//    Gross transaction amount, Net amount, Final value fee, Other fees, Shipping label, Claim,
//    Payment dispute, Hold, Charge, Adjustment ...) and says the columns can be customized. Its
//    Earnings report help names Item subtotal, Shipping and handling and Seller collected tax.
//  - eBay does NOT publish the exact header text of the CSV. So a column is found by eBay's help name
//    first, then by a word rule (any header with "fee" is a fee column, kept by its own name), and
//    any column can be named with the `columns` map. Every column is reported with how it was found.
//  - Row types are read by eBay's own words for them (sale/order, refund, claim, payment dispute,
//    hold, shipping label, other fee, charge, adjustment, transfer, payout). A type no rule knows is
//    kept, counted with its order, and named in the warnings.
//  - Money is eBay's own Net amount, as written, row by row. A sale's "kept" is the sum of the Net
//    amount of every row with its order number, so nothing is estimated; the proof checks that every
//    row's Net amount is accounted for to the cent.

export const ENGINE_VERSION = 'ebay-flattener-2026.11';
export const LIMITS = { bytes: 5_000_000, rows: 100_000, costs: 5_000, labels: 5_000 };
// Sales per billing unit (tool.js prices a file per started block of this many sales).
export const SALES_PER_UNIT = 2500;

export class FlattenError extends Error {
  constructor(message, field = 'file') {
    super(message);
    this.name = 'FlattenError';
    this.field = field;
  }
}

// ---------- columns ----------

// h is a normalized heading (normHeading). `names` are eBay's help names, lowercased; `word` is the
// fallback rule. `help` says where the name comes from, for the column report.
export const FIELDS = [
  { id: 'type', label: 'Type', names: ['type', 'transaction type'], help: 'transaction report: Type', required: true },
  { id: 'date', label: 'Transaction date', names: ['transaction date'], word: (h) => /\bdate\b/.test(h) && !/\bpayout\b/.test(h), help: 'transaction report: transaction date', required: true },
  { id: 'order', label: 'Order ID', names: ['order id', 'order number'], word: (h) => /\border (id|number)\b/.test(h) && !/\blegacy\b/.test(h), help: 'transaction report: Order ID, order number' },
  { id: 'itemId', label: 'Item ID', names: ['item id'], help: 'transaction report: Item ID' },
  { id: 'title', label: 'Item title', word: (h) => /\btitle\b/.test(h) },
  { id: 'quantity', label: 'Quantity', word: (h) => /\bquantity\b/.test(h) },
  { id: 'sku', label: 'SKU / custom label', word: (h) => /\bcustom label\b/.test(h) || h === 'sku' },
  { id: 'itemSubtotal', label: 'Item subtotal', names: ['item subtotal'], help: 'Earnings report: Item subtotal' },
  { id: 'shipping', label: 'Shipping and handling', names: ['shipping and handling'], help: 'Earnings report: Shipping and handling' },
  { id: 'sellerTax', label: 'Seller collected tax', names: ['seller collected tax'], word: (h) => /\bseller collected\b/.test(h) && /\btax\b/.test(h), help: 'transaction report: Seller collected tax' },
  { id: 'gross', label: 'Gross transaction amount', names: ['gross transaction amount', 'gross amount'], help: 'transaction report: Gross transaction amount', required: true },
  { id: 'net', label: 'Net amount', names: ['net amount'], help: 'transaction report: Net amount', required: true },
  { id: 'payoutId', label: 'Payout ID', names: ['payout id'], help: 'transaction report: Payout ID' },
  { id: 'payoutDate', label: 'Payout date', names: ['payout date'], help: 'transaction report: payout date' },
  { id: 'description', label: 'Description', word: (h) => /\bdescription\b/.test(h) },
  { id: 'currency', label: 'Payout currency', word: (h) => /\bpayout currency\b/.test(h) },
  { id: 'referenceId', label: 'Reference ID', names: ['reference id'], help: 'transaction report: Reference ID' },
];
export const FIELD_IDS = FIELDS.map((f) => f.id);
const FIELD = Object.fromEntries(FIELDS.map((f) => [f.id, f]));

export const normHeading = (h) => String(h ?? '').replace(/^﻿/, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const isFeeHeading = (h) => /\bfees?\b/.test(h);
const isTaxHeading = (h) => /\btax(es)?\b/.test(h);

// Which column holds each field. columns: { fieldId: 'Header text in your file' }.
export function mapColumns(head, columns = {}) {
  const norm = head.map(normHeading);
  const used = new Set();
  const fields = {};
  for (const [id, text] of Object.entries(columns)) {
    if (!FIELD[id]) throw new FlattenError(`columns.${id} is not a column this tool reads. It reads: ${FIELD_IDS.join(', ')}.`, `columns.${id}`);
    const i = norm.indexOf(normHeading(text));
    if (i < 0) throw new FlattenError(`columns.${id} says "${text}", but no column in the file is called that. The file's columns are: ${head.join(', ')}.`, `columns.${id}`);
    fields[id] = { index: i, heading: head[i], how: 'your map' };
    used.add(i);
  }
  for (const f of FIELDS) {
    if (fields[f.id]) continue;
    let i = (f.names ?? []).map((n) => norm.findIndex((h, k) => h === n && !used.has(k))).find((k) => k >= 0) ?? -1;
    let how = i >= 0 ? 'eBay\'s help name' : null;
    if (i < 0 && f.word) { i = norm.findIndex((h, k) => !used.has(k) && h && f.word(h)); how = i >= 0 ? 'word rule' : null; }
    if (i >= 0) { fields[f.id] = { index: i, heading: head[i], how }; used.add(i); }
  }
  const fees = [];
  const taxes = [];
  const other = [];
  norm.forEach((h, i) => {
    if (used.has(i) || !h) return;
    if (isFeeHeading(h)) fees.push({ index: i, heading: head[i] });
    else if (isTaxHeading(h)) taxes.push({ index: i, heading: head[i] });
    else other.push(head[i]);
  });
  return { fields, fees, taxes, other };
}

// ---------- row types, by eBay's own words for them ----------

// kind: 'sale' rows open an order; 'cost' rows (labels, other fees, refunds ...) belong to an order
// when they carry its number; 'moves' rows move money already earned (payouts, transfers, holds, and
// charges recouped from your payment method) and are listed apart, out of the sales totals.
export const TYPES = [
  { id: 'dispute', label: 'Payment dispute', test: (t) => /\bdispute\b/.test(t), kind: 'cost' },
  { id: 'claim', label: 'Claim', test: (t) => /\bclaim\b/.test(t), kind: 'cost' },
  { id: 'label', label: 'Shipping label', test: (t) => /\blabel\b/.test(t), kind: 'cost' },
  { id: 'payout', label: 'Payout', test: (t) => /\bpayout\b/.test(t), kind: 'moves' },
  { id: 'transfer', label: 'Transfer', test: (t) => /\btransfer\b/.test(t), kind: 'moves' },
  { id: 'hold', label: 'Hold', test: (t) => /\bhold\b/.test(t), kind: 'moves' },
  { id: 'charge', label: 'Charge', test: (t) => /\bcharge\b/.test(t) && !/\bfees?\b/.test(t), kind: 'moves' },
  { id: 'otherFee', label: 'Other fee', test: (t) => /\bfees?\b/.test(t), kind: 'cost' },
  { id: 'refund', label: 'Refund', test: (t) => /\brefund\b/.test(t), kind: 'cost' },
  { id: 'adjustment', label: 'Adjustment', test: (t) => /\badjustment\b/.test(t) || /\bcredit\b/.test(t), kind: 'cost' },
  { id: 'sale', label: 'Order (sale)', test: (t) => /\b(order|sale)\b/.test(t), kind: 'sale' },
];
const TYPE = Object.fromEntries(TYPES.map((t) => [t.id, t]));
export function typeOf(raw) {
  const t = normHeading(raw);
  return TYPES.find((x) => x.test(t))?.id ?? 'unknown';
}
export const typeLabel = (id) => TYPE[id]?.label ?? 'Not a known type';

// ---------- delimited text ----------

// RFC 4180 records with a chosen separator: quoted fields, doubled quotes, CRLF/LF/CR line ends.
// Each record keeps its 1-based line number.
export function parseDelimited(text, delimiter = ',') {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let line = 1;
  let start = 1;
  const s = text;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; continue; }
        quoted = false; continue;
      }
      if (c === '\n') line++;
      field += c; continue;
    }
    if (c === '"' && field.trim() === '') { quoted = true; field = ''; continue; }
    if (c === delimiter) { row.push(field); field = ''; continue; }
    if (c === '\r' || c === '\n') {
      row.push(field); field = '';
      row.line = start; rows.push(row); row = [];
      if (c === '\r' && s[i + 1] === '\n') i++;
      line++; start = line; continue;
    }
    field += c;
  }
  if (field !== '' || row.length) { row.push(field); row.line = start; rows.push(row); }
  return rows.filter((r) => !r.every((x) => x.trim() === ''));
}

// A CSV saved from a spreadsheet may use tabs or semicolons; the separator is the one that splits
// the header line (the first line with "net amount" or the most cells) the most.
export function sniffDelimiter(text) {
  const lines = text.split(/\r?\n|\r/).slice(0, 40);
  const head = lines.find((l) => /net amount/i.test(l)) ?? lines[0] ?? '';
  let best = ',';
  let most = 0;
  for (const d of [',', '\t', ';']) {
    const n = head.split(d).length;
    if (n > most) { most = n; best = d; }
  }
  return best;
}

// ---------- money ----------

const DIGITS = new Map();
export function decimalsOf(currency) {
  const c = String(currency || 'USD').toUpperCase();
  if (DIGITS.has(c)) return DIGITS.get(c);
  let d = 2;
  try { d = new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).resolvedOptions().maximumFractionDigits; } catch { d = 2; }
  DIGITS.set(c, d);
  return d;
}

// A cell that holds no amount: blank, or a dash on its own.
export const isBlank = (raw) => /^\s*'?(?:[-–—]{1,2})?\s*$/.test(String(raw ?? ''));
// Currency signs and codes around an amount: $, US $, £, €, AU $, C $, GBP ...
const stripCurrency = (s) => s.replace(/^(?:[A-Z]{2,3}\s?)?[$£€¥]\s?|\s?(?:[A-Z]{3})$/g, '').replace(/^([-+(])\s*(?:[A-Z]{2,3}\s?)?[$£€¥]\s?/, '$1');

// Which mark is the decimal separator in a written amount: 'comma', 'point' or null (cannot tell).
export function decimalMark(raw) {
  const s = stripCurrency(String(raw ?? '').trim()).replace(/^[-+(]/, '').replace(/\)$/, '');
  const lastComma = s.lastIndexOf(',');
  const lastPoint = s.lastIndexOf('.');
  if (lastComma >= 0 && lastPoint >= 0) return lastComma > lastPoint ? 'comma' : 'point';
  if (lastComma >= 0) return s.length - lastComma - 1 === 3 ? null : 'comma';
  if (lastPoint >= 0) return s.length - lastPoint - 1 === 3 && /^\d{1,3}(\.\d{3})+$/.test(s) ? null : 'point';
  return null;
}

// A written amount in minor units, exactly. Blank or a lone dash is null; not a number is NaN.
export function parseAmount(raw, places = 2, mark = 'point') {
  if (raw === null || raw === undefined || isBlank(raw)) return null;
  let s = String(raw).trim().replace(/^'/, '').replace(/[−‒–]/g, '-');
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1).trim(); }
  s = stripCurrency(s);
  if (s.startsWith('-')) { neg = !neg; s = s.slice(1); } else if (s.startsWith('+')) s = s.slice(1);
  s = stripCurrency(s.trim()).replace(/[\s  ']/g, '');
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return NaN;
  s = mark === 'comma' ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  if ((s.match(/\./g) ?? []).length > 1) return NaN;
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

// For people: "$1,234.56", "-$3.20", "£10.00".
export function money(minor, currency = 'USD') {
  const places = decimalsOf(currency);
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: String(currency).toUpperCase(), minimumFractionDigits: places, maximumFractionDigits: places }).format(minor / 10 ** places);
  } catch {
    return `${toDecimal(minor, places)} ${currency}`;
  }
}

// ---------- dates ----------

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n) => String(n).padStart(2, '0');
const realDay = (y, m, d) => {
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};
const year4 = (y) => (String(y).length === 2 ? 2000 + Number(y) : Number(y));

// The calendar date in a date cell (time and zone after it are ignored): 2026-10-15, Oct 15, 2026,
// 15 Oct 2026, 15-Oct-26, or slashes (10/15/2026 is mdy; dmy on request). Returns 'YYYY-MM-DD',
// null for a blank cell, or NaN when the cell is not a date.
export function parseDay(raw, order = 'mdy') {
  const s = String(raw ?? '').trim();
  if (!s || isBlank(s)) return null;
  let y; let m; let d; let x;
  if ((x = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|[T\s])/.exec(s))) [, y, m, d] = x;
  else if ((x = /^([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/.exec(s))) { m = MONTHS.indexOf(x[1].slice(0, 3).toLowerCase()) + 1; [, , d, y] = x; }
  else if ((x = /^(\d{1,2})[\s-]([A-Za-z]{3,9})\.?[\s-](\d{4}|\d{2})\b/.exec(s))) { m = MONTHS.indexOf(x[2].slice(0, 3).toLowerCase()) + 1; d = x[1]; y = year4(x[3]); }
  else if ((x = /^(\d{1,2})\/(\d{1,2})\/(\d{4}|\d{2})\b/.exec(s))) { [, m, d] = x; y = year4(x[3]); if (order === 'dmy') [m, d] = [d, m]; }
  else return NaN;
  y = Number(y); m = Number(m); d = Number(d);
  if (!m || !realDay(y, m, d)) return NaN;
  return `${y}-${pad(m)}-${pad(d)}`;
}

// Slash dates: which order the file uses, from values that can only be read one way. 'mdy', 'dmy',
// or null when nothing tells; throws when the file mixes the two.
export function slashOrder(cells) {
  let mdy = false; let dmy = false;
  for (const c of cells) {
    const x = /^\s*(\d{1,2})\/(\d{1,2})\//.exec(String(c ?? ''));
    if (!x) continue;
    if (Number(x[1]) > 12) dmy = true;
    if (Number(x[2]) > 12) mdy = true;
  }
  if (mdy && dmy) throw new FlattenError('The dates mix month-first (10/25/2026) and day-first (25/10/2026). Fix the dates or send dateOrder.', 'dateOrder');
  return mdy ? 'mdy' : dmy ? 'dmy' : null;
}

export const longDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTH_NAMES[m - 1]} ${d}, ${y}`;
};
export const monthName = (ym) => `${MONTH_NAMES[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;

// ---------- reading ----------

// The header row: the first row (within the first 40) with a Net amount and a Type column, or the
// map's headings. Lines above it (a title, a date range) are skipped.
function findHeader(rows, columns) {
  const want = Object.values(columns).map(normHeading);
  for (let i = 0; i < Math.min(rows.length, 40); i++) {
    const norm = rows[i].map(normHeading);
    if (want.length && want.every((w) => norm.includes(w))) return i;
    if (!want.length || !('net' in columns) || !('type' in columns)) {
      const hasNet = 'net' in columns ? norm.includes(normHeading(columns.net)) : norm.includes('net amount');
      const hasType = 'type' in columns ? norm.includes(normHeading(columns.type)) : (norm.includes('type') || norm.includes('transaction type'));
      if (hasNet && hasType) return i;
    }
  }
  return -1;
}

// Reads the file into rows with amounts in minor units. opts: columns, currency, decimal, dateOrder.
export function read(text, opts = {}) {
  if (typeof text !== 'string' || !text.trim()) throw new FlattenError('The file is empty.');
  if (text.length > LIMITS.bytes) throw new FlattenError(`The file is larger than ${LIMITS.bytes / 1_000_000} MB.`);
  const columns = opts.columns ?? {};
  const delimiter = sniffDelimiter(text);
  const all = parseDelimited(text, delimiter);
  let h = findHeader(all, columns);
  // A map naming a heading the file does not have: find the header by eBay's names, so the map's
  // mistake is the error the reader sees.
  if (h < 0 && Object.keys(columns).length) h = findHeader(all, {});
  if (h < 0) {
    throw new FlattenError('This does not look like an eBay transaction report: no header row with "Net amount" and "Type" was found in the first 40 lines. If your columns are named differently, name them with the column map (for example columns: { "net": "Net", "type": "Kind" }).');
  }
  const head = all[h];
  const map = mapColumns(head, columns);
  const missing = FIELDS.filter((f) => f.required && !map.fields[f.id]).map((f) => f.label);
  if (missing.length) throw new FlattenError(`The report has no ${missing.join(', ')} column. Name it with the column map (columns.${FIELDS.find((f) => missing.includes(f.label)).id}), or add it in Seller Hub: Payments, Reports, Transaction report, Customize column settings.`, 'columns');
  const body = all.slice(h + 1);
  if (body.length > LIMITS.rows) throw new FlattenError(`The report has more than ${LIMITS.rows.toLocaleString('en-US')} rows. Split it by date range.`);
  const cell = (r, id) => {
    const v = map.fields[id] ? (r[map.fields[id].index] ?? '').trim() : '';
    return isBlank(v) ? '' : v;
  };

  // Currency: the option, else one payout currency column value, else USD.
  let currency = opts.currency ? opts.currency.toUpperCase() : null;
  if (!currency && map.fields.currency) {
    const seen = [...new Set(body.map((r) => cell(r, 'currency').toUpperCase()).filter((c) => /^[A-Z]{3}$/.test(c)))];
    if (seen.length > 1) throw new FlattenError(`The report has payouts in ${seen.join(' and ')}. Create one report per currency, or send currency to read it as one.`, 'currency');
    currency = seen[0] ?? null;
  }
  currency = currency ?? 'USD';
  const places = decimalsOf(currency);

  // Decimal mark: the option, else what the amounts show; a file that mixes the two is refused.
  const amountCols = ['gross', 'net', 'itemSubtotal', 'shipping', 'sellerTax'].filter((id) => map.fields[id]).map((id) => map.fields[id].index)
    .concat(map.fees.map((f) => f.index), map.taxes.map((f) => f.index));
  let mark = opts.decimal ?? null;
  if (!mark) {
    const marks = new Set();
    for (const r of body) for (const i of amountCols) { const k = decimalMark(r[i]); if (k) marks.add(k); }
    if (marks.size > 1) throw new FlattenError('Some amounts use a decimal point (12.50) and others a decimal comma (12,50). Send decimal: "point" or "comma".', 'decimal');
    mark = [...marks][0] ?? 'point';
  }
  const order = opts.dateOrder ?? slashOrder(body.map((r) => cell(r, 'date'))) ?? 'mdy';

  const amount = (r, i, what) => {
    const v = parseAmount(r[i], places, mark);
    if (Number.isNaN(v)) throw new FlattenError(`Line ${r.line}: ${what} "${r[i]}" is not an amount.`);
    return v;
  };
  const rows = body.map((r) => {
    const typeRaw = cell(r, 'type');
    const day = parseDay(cell(r, 'date'), order);
    if (Number.isNaN(day)) throw new FlattenError(`Line ${r.line}: "${cell(r, 'date')}" in ${map.fields.date.heading} is not a date.`);
    const net = amount(r, map.fields.net.index, map.fields.net.heading);
    const opt = (id) => (map.fields[id] ? amount(r, map.fields[id].index, map.fields[id].heading) : null);
    const q = cell(r, 'quantity');
    return {
      line: r.line,
      typeRaw,
      type: typeOf(typeRaw),
      date: day,
      order: cell(r, 'order').replace(/^'/, '') || null,
      itemId: cell(r, 'itemId').replace(/^'/, '') || null,
      title: cell(r, 'title') || null,
      sku: cell(r, 'sku') || null,
      quantity: /^\d+$/.test(q) ? Number(q) : null,
      description: cell(r, 'description') || null,
      gross: opt('gross'),
      net,
      itemSubtotal: opt('itemSubtotal'),
      shipping: opt('shipping'),
      sellerTax: opt('sellerTax'),
      fees: map.fees.map((f) => amount(r, f.index, f.heading)),
      taxes: map.taxes.map((f) => amount(r, f.index, f.heading)),
    };
  }).filter((r) => r.typeRaw !== '' || r.net !== null || r.order);
  if (!rows.length) throw new FlattenError('The report has a header row but no transactions under it.');
  return { rows, map, currency, places, decimal: mark, dateOrder: order, delimiter, headerLine: all[h].line };
}

// How many sales (orders with a sale row) a file holds: the unit tool.js prices by.
export function countSales(text, opts = {}) {
  const { rows } = read(text, opts);
  return new Set(rows.filter((r) => r.type === 'sale').map((r) => r.order ?? `line ${r.line}`)).size;
}

// ---------- flattening ----------

const sum = (xs) => xs.reduce((a, x) => a + (x ?? 0), 0);
const BUCKETS_OF = { refund: 'refunds', claim: 'claims', dispute: 'claims', label: 'labels', otherFee: 'otherFees', adjustment: 'adjustments', unknown: 'adjustments' };

// Spread an amount over weights by largest remainder, so the shares add up exactly.
export function spread(total, weights) {
  const w = sum(weights);
  if (!w || !total) return weights.map(() => 0);
  const raw = weights.map((x) => (total * x) / w);
  const out = raw.map((x) => Math.trunc(x));
  let left = total - sum(out);
  const order = raw.map((x, i) => [Math.abs(x - Math.trunc(x)), i]).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  for (let k = 0; left !== 0 && k < order.length; k++) { const s = Math.sign(left); out[order[k][1]] += s; left -= s; }
  return out;
}

const blankTotals = () => ({ sales: 0, gross: 0, saleDeductions: 0, refunds: 0, claims: 0, labels: 0, otherFees: 0, adjustments: 0, net: 0, outsideLabels: 0, cost: 0, profit: 0 });

// The whole job. opts: columns, currency, decimal, dateOrder, costs { itemId: per-unit cost },
// labels { orderId: label cost bought outside eBay }, allocate 'none' | 'gross'.
export function flatten(text, opts = {}) {
  const data = read(text, opts);
  const { rows, map, currency, places } = data;
  const parse = (v, what) => {
    const x = typeof v === 'number' ? Math.round(v * 10 ** places) : parseAmount(v, places, data.decimal);
    if (x === null || Number.isNaN(x)) throw new FlattenError(`${what} "${v}" is not an amount.`, what.split(' ')[0]);
    return x;
  };
  const costs = Object.fromEntries(Object.entries(opts.costs ?? {}).map(([k, v]) => [k.trim(), parse(v, `costs ${k}`)]));
  const outside = Object.fromEntries(Object.entries(opts.labels ?? {}).map(([k, v]) => [k.trim(), Math.abs(parse(v, `labels ${k}`))]));

  // Fee sign: eBay's sale rows show fees as deductions; whichever sign the file uses, fees come out
  // negative (money out) here.
  const feeSum = sum(rows.filter((r) => r.type === 'sale').flatMap((r) => r.fees));
  const feeSign = feeSum > 0 ? -1 : 1;

  const orders = new Map();
  const unmatched = [];
  const moves = [];
  const unknown = new Map();
  for (const r of rows) {
    if (r.type === 'unknown') unknown.set(r.typeRaw || '(blank)', (unknown.get(r.typeRaw || '(blank)') ?? 0) + 1);
    if (TYPE[r.type]?.kind === 'moves') { moves.push(r); continue; }
    const key = r.order ?? (r.type === 'sale' ? `line ${r.line}` : null);
    if (!key) { unmatched.push(r); continue; }
    if (!orders.has(key)) orders.set(key, { order: key, rows: [] });
    orders.get(key).rows.push(r);
  }

  const sales = [...orders.values()].map((o) => {
    const saleRows = o.rows.filter((r) => r.type === 'sale');
    const items = [];
    for (const r of saleRows) {
      if (!r.itemId && !r.title) continue;
      const prev = items.find((x) => x.itemId === r.itemId && x.title === r.title);
      if (prev) prev.quantity += r.quantity ?? 1;
      else items.push({ itemId: r.itemId, title: r.title, sku: r.sku, quantity: r.quantity ?? 1 });
    }
    const gross = sum(saleRows.map((r) => r.gross));
    const saleNet = sum(saleRows.map((r) => r.net));
    const fees = map.fees.map((_, i) => feeSign * sum(saleRows.map((r) => r.fees[i])));
    const taxes = map.taxes.map((_, i) => sum(saleRows.map((r) => r.taxes[i])));
    const by = { refunds: 0, claims: 0, labels: 0, otherFees: 0, adjustments: 0 };
    for (const r of o.rows) if (r.type !== 'sale') by[BUCKETS_OF[r.type]] += r.net ?? 0;
    const deductions = saleNet - gross;
    const feeTotal = sum(fees);
    const missingCost = items.filter((x) => x.itemId && !(x.itemId in costs) && !(x.sku && x.sku in costs));
    const cost = sum(items.map((x) => ((x.itemId && costs[x.itemId]) ?? (x.sku && costs[x.sku]) ?? 0) * x.quantity));
    const date = saleRows[0]?.date ?? o.rows[0].date;
    const flags = [];
    if (!saleRows.length) flags.push('no sale row in this file (an earlier sale)');
    if (saleRows.length && feeTotal !== deductions) flags.push(`fee columns ${Math.abs(feeTotal) > Math.abs(deductions) ? 'exceed' : 'fall short of'} the sale row's deductions by ${money(Math.abs(feeTotal - deductions), currency)}`);
    if (by.refunds || by.claims) flags.push('refund or claim');
    return {
      order: o.order,
      date,
      items,
      quantity: sum(items.map((x) => x.quantity)),
      lines: o.rows.map((r) => r.line),
      hasSale: saleRows.length > 0,
      gross,
      itemSubtotal: map.fields.itemSubtotal ? sum(saleRows.map((r) => r.itemSubtotal)) : null,
      shipping: map.fields.shipping ? sum(saleRows.map((r) => r.shipping)) : null,
      sellerTax: map.fields.sellerTax ? sum(saleRows.map((r) => r.sellerTax)) : null,
      fees,
      taxes,
      feeTotal,
      deductions,
      unexplained: saleRows.length ? deductions - feeTotal : 0,
      saleNet,
      ...by,
      ebayNet: sum(o.rows.map((r) => r.net)),
      allocated: 0,
      outsideLabel: -(outside[o.order] ?? 0),
      cost: -cost,
      costKnown: missingCost.length === 0 && items.length > 0,
      flags,
    };
  }).sort((a, b) => (a.date ?? '').localeCompare(b.date ?? '') || a.lines[0] - b.lines[0]);

  // Rows without an order number: labels and other fees may be spread over the sales by gross.
  const spreadable = unmatched.filter((r) => r.type === 'label' || r.type === 'otherFee');
  const allocate = opts.allocate ?? 'none';
  if (allocate === 'gross' && spreadable.length) {
    const targets = sales.filter((s) => s.hasSale && s.gross > 0);
    const shares = spread(sum(spreadable.map((r) => r.net)), targets.map((s) => s.gross));
    targets.forEach((s, i) => { if (shares[i]) { s.allocated = shares[i]; s.flags.push('includes a share of label or fee rows with no order number'); } });
  }
  for (const s of sales) {
    s.kept = s.ebayNet + s.allocated + s.outsideLabel;
    s.profit = s.kept + s.cost;
  }
  const knownOrders = new Set(sales.map((s) => s.order));
  const unusedLabels = Object.keys(outside).filter((k) => !knownOrders.has(k));
  const unusedCosts = Object.keys(costs).filter((k) => !sales.some((s) => s.items.some((x) => x.itemId === k || x.sku === k)));

  // Totals by calendar year and month of each row's own date (cash basis): sale rows by their date,
  // refunds and labels by theirs. Outside labels and costs go with the sale's date.
  const periods = { year: new Map(), month: new Map() };
  const bucket = (kind, key) => {
    const m = periods[kind];
    if (!m.has(key)) m.set(key, blankTotals());
    return m.get(key);
  };
  const add = (date, f) => { for (const [kind, key] of [['year', date ? date.slice(0, 4) : 'no date'], ['month', date ? date.slice(0, 7) : 'no date']]) f(bucket(kind, key)); };
  const included = rows.filter((r) => TYPE[r.type]?.kind !== 'moves');
  const isSaleOpen = new Set();
  for (const r of included) {
    add(r.date, (t) => {
      t.net += r.net ?? 0;
      if (r.type === 'sale') {
        t.gross += r.gross ?? 0;
        t.saleDeductions += (r.net ?? 0) - (r.gross ?? 0);
      } else t[BUCKETS_OF[r.type]] += r.net ?? 0;
    });
    if (r.type === 'sale') {
      const k = r.order ?? `line ${r.line}`;
      if (!isSaleOpen.has(k)) { isSaleOpen.add(k); add(r.date, (t) => { t.sales += 1; }); }
    }
  }
  for (const s of sales) add(s.date, (t) => { t.outsideLabels += s.outsideLabel; t.cost += s.cost; });
  const finish = (m) => [...m.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([key, t]) => ({ period: key, ...t, kept: t.net + t.outsideLabels, profit: t.net + t.outsideLabels + t.cost }));
  const years = finish(periods.year);
  const months = finish(periods.month);

  const totals = blankTotals();
  for (const y of years) for (const k of Object.keys(totals)) totals[k] += y[k];
  totals.kept = totals.net + totals.outsideLabels;
  totals.profit = totals.kept + totals.cost;

  // The proof: every row's Net amount is in a sale, the unmatched list or the money-moved list.
  const fileNet = sum(rows.map((r) => r.net));
  const inSales = sum(sales.map((s) => s.ebayNet));
  const inUnmatched = sum(unmatched.map((r) => r.net));
  const inMoves = sum(moves.map((r) => r.net));
  const proof = { fileNet, inSales, inUnmatched, inMoves, difference: fileNet - inSales - inUnmatched - inMoves };
  proof.ok = proof.difference === 0;

  const typeCounts = {};
  for (const r of rows) typeCounts[r.type] = (typeCounts[r.type] ?? 0) + 1;
  const nSales = sales.filter((s) => s.hasSale).length;
  const unmatchedLabels = unmatched.filter((r) => r.type === 'label');
  const warnings = [];
  if (unknown.size) warnings.push(`Row types no rule knows, counted with their order (or as unmatched): ${[...unknown.entries()].map(([k, n]) => `"${k}" (${n})`).join(', ')}.`);
  if (unmatchedLabels.length) warnings.push(`${unmatchedLabels.length} shipping label row${unmatchedLabels.length === 1 ? '' : 's'} had no order number (${money(sum(unmatchedLabels.map((r) => r.net)), currency)})${allocate === 'gross' ? ', spread over the sales by gross' : '; they can be spread over the sales by gross (allocate: "gross")'}.`);
  const off = sales.filter((s) => s.hasSale && s.unexplained !== 0);
  if (off.length) warnings.push(`On ${off.length} sale${off.length === 1 ? '' : 's'} the fee columns do not add up to Gross minus Net on the sale row; the difference is shown as "other deductions" (a column may be hidden in your report settings, or hold tax).`);
  if (!map.fees.length) warnings.push('The report has no fee columns. Add them in Seller Hub (Customize column settings) to see each fee; the net amounts are still exact.');
  if (unusedLabels.length) warnings.push(`labels: no order ${unusedLabels.slice(0, 5).join(', ')}${unusedLabels.length > 5 ? ' ...' : ''} in this report.`);
  if (unusedCosts.length) warnings.push(`costs: no item ${unusedCosts.slice(0, 5).join(', ')}${unusedCosts.length > 5 ? ' ...' : ''} in this report.`);
  if (!proof.ok) warnings.push(`The rows do not add up: ${money(proof.difference, currency)} of Net amount is unaccounted for.`);

  const m = (v) => money(v || 0, currency);
  const answer = `Your report's ${rows.length} rows became ${nSales} sale${nSales === 1 ? '' : 's'}: gross ${m(totals.gross)}, fees ${m(-totals.saleDeductions)}, labels ${m(-totals.labels)}, ad and other fees ${m(-totals.otherFees)}, refunds and claims ${m(-(totals.refunds + totals.claims))}, net ${m(totals.net)}; ${unmatchedLabels.length} label row${unmatchedLabels.length === 1 ? '' : 's'} had no order number.`;

  return {
    answer,
    currency,
    places,
    decimal: data.decimal,
    dateOrder: data.dateOrder,
    headerLine: data.headerLine,
    columns: {
      fields: Object.fromEntries(Object.entries(map.fields).map(([id, f]) => [id, { heading: f.heading, how: f.how }])),
      fees: map.fees.map((f) => f.heading),
      taxes: map.taxes.map((f) => f.heading),
      notUsed: map.other,
      feeSign: feeSign === 1 ? 'as written (negative is a cost)' : 'flipped (the file shows fees as positive)',
    },
    rowCount: rows.length,
    typeCounts,
    nSales,
    sales,
    unmatched: unmatched.map((r) => ({ line: r.line, date: r.date, type: r.type, typeRaw: r.typeRaw, description: r.description, net: r.net })),
    moves: moves.map((r) => ({ line: r.line, date: r.date, type: r.type, typeRaw: r.typeRaw, net: r.net })),
    allocate,
    years,
    months,
    totals,
    proof,
    warnings,
  };
}

// ---------- files ----------

const csvField = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+@\t\r]/.test(s) || (/^-/.test(s) && !/^-\d+(\.\d+)?$/.test(s))) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const writeCsv = (rows) => rows.map((r) => r.map(csvField).join(',')).join('\r\n') + '\r\n';
const snake = (h) => normHeading(h).replace(/ /g, '_');

// One row per sale, every fee column by its own name.
export function salesCsv(r) {
  const d = (v) => (v === null || v === undefined ? '' : toDecimal(v, r.places));
  const opt = ['itemSubtotal', 'shipping', 'sellerTax'].filter((k) => r.sales.some((s) => s[k] !== null));
  const optNames = { itemSubtotal: 'item_subtotal', shipping: 'shipping_and_handling', sellerTax: 'seller_collected_tax' };
  const head = ['order', 'sale_date', 'items', 'item_ids', 'quantity', 'gross', ...opt.map((k) => optNames[k]), ...r.columns.fees.map(snake), 'other_deductions_on_sale_row', 'sale_row_net', ...r.columns.taxes.map(snake),
    'ad_and_other_fees', 'shipping_labels', 'labels_outside_ebay', 'refunds', 'claims_and_disputes', 'adjustments', 'allocated_unmatched', 'kept', 'your_cost', 'profit', 'currency', 'notes'];
  const rows = r.sales.map((s) => [
    s.order, s.date ?? '', s.items.map((x) => (x.quantity > 1 ? `${x.title ?? x.itemId} x${x.quantity}` : x.title ?? x.itemId)).join('; '), s.items.map((x) => x.itemId).filter(Boolean).join('; '), s.quantity,
    d(s.gross), ...opt.map((k) => d(s[k])), ...s.fees.map(d), d(s.unexplained), d(s.saleNet), ...s.taxes.map(d),
    d(s.otherFees), d(s.labels), d(s.outsideLabel), d(s.refunds), d(s.claims), d(s.adjustments), d(s.allocated), d(s.kept), s.costKnown ? d(s.cost) : (s.cost ? d(s.cost) : ''), s.costKnown || s.cost ? d(s.profit) : '', r.currency, s.flags.join('; '),
  ]);
  return writeCsv([head, ...rows]);
}

const PERIOD_HEAD = ['sales', 'gross', 'fees_on_sale_rows', 'ad_and_other_fees', 'shipping_labels', 'refunds', 'claims_and_disputes', 'adjustments', 'net_ebay', 'labels_outside_ebay', 'kept', 'your_cost', 'profit'];
const periodCells = (t, places) => [t.sales, ...['gross', 'saleDeductions', 'otherFees', 'labels', 'refunds', 'claims', 'adjustments', 'net', 'outsideLabels', 'kept', 'cost', 'profit'].map((k) => toDecimal(t[k], places))];
export function periodsCsv(r, kind = 'year') {
  const list = kind === 'year' ? r.years : r.months;
  return writeCsv([[kind, ...PERIOD_HEAD, 'currency'], ...list.map((t) => [t.period, ...periodCells(t, r.places), r.currency]), ['total', ...periodCells(r.totals, r.places), r.currency]]);
}

export function unmatchedCsv(r) {
  return writeCsv([['line', 'date', 'type', 'type_in_file', 'description', 'net', 'currency'], ...r.unmatched.map((u) => [u.line, u.date ?? '', typeLabel(u.type), u.typeRaw, u.description ?? '', toDecimal(u.net ?? 0, r.places), r.currency])]);
}

// ---------- samples (made up; headings are eBay's help names) ----------

// Each sample is written as CSV with the headings eBay's help uses for these details. The rows and
// amounts are invented: they show the layout sellers describe (a sale row, then label and other-fee
// rows; a bulk label row with no order number; a multi-item order whose item rows follow the first).
const US_HEAD = ['Transaction date', 'Type', 'Order ID', 'Item ID', 'Item title', 'Quantity', 'Item subtotal', 'Shipping and handling', 'Seller collected tax', 'Final value fee - fixed', 'Final value fee - variable', 'International fee', 'Gross transaction amount', 'Net amount', 'Payout ID', 'Payout date', 'Description'];
const US_ROWS = [
  ['2025-12-18', 'Order', '01-11111-00001', '110000000001', 'Vintage Pyrex mixing bowl', '1', '24.00', '8.50', '0.00', '-0.40', '-4.31', '--', '32.50', '27.79', 'P-0001', '2025-12-22', ''],
  ['2025-12-19', 'Shipping label', '01-11111-00001', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '-6.85', 'P-0001', '2025-12-22', 'USPS Ground Advantage'],
  ['2026-10-03', 'Order', '02-22222-00002', '110000000002', 'Fleece jacket, size M', '1', '15.00', '9.00', '0.00', '-0.40', '-3.18', '--', '24.00', '20.42', 'P-0102', '2026-10-06', ''],
  ['2026-10-03', 'Other fee', '02-22222-00002', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '-1.82', 'P-0102', '2026-10-06', 'Promoted Listings - General fee'],
  ['2026-10-04', 'Shipping label', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '-18.94', 'P-0102', '2026-10-06', 'Bulk shipping labels (4)'],
  ['2026-10-05', 'Order', '03-33333-00003', '--', '--', '3', '40.00', '6.00', '0.00', '-0.40', '-6.10', '--', '46.00', '39.50', 'P-0103', '2026-10-08', ''],
  ['2026-10-05', 'Order', '03-33333-00003', '110000000003', 'Minifigure lot', '2', '--', '--', '--', '--', '--', '--', '--', '--', 'P-0103', '2026-10-08', ''],
  ['2026-10-05', 'Order', '03-33333-00003', '110000000004', 'Baseplate 32x32', '1', '--', '--', '--', '--', '--', '--', '--', '--', 'P-0103', '2026-10-08', ''],
  ['2026-10-10', 'Payout', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '-57.92', 'P-0103', '2026-10-10', 'Payout to checking ...1234'],
  ['2026-10-12', 'Order', '04-44444-00004', '110000000005', 'Camera lens 50mm', '1', '120.00', '0.00', '0.00', '-0.40', '-15.90', '-1.98', '120.00', '101.72', 'P-0104', '2026-10-15', ''],
  ['2026-10-12', 'Shipping label', '04-44444-00004', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '-9.40', 'P-0104', '2026-10-15', 'USPS Priority Mail'],
  ['2026-10-20', 'Refund', '04-44444-00004', '110000000005', 'Camera lens 50mm', '1', '--', '--', '--', '--', '--', '--', '-20.00', '-20.00', 'P-0105', '2026-10-23', 'Partial refund'],
  ['2026-10-31', 'Other fee', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '-4.95', 'P-0106', '2026-11-03', 'Store subscription fee'],
  ['2026-11-02', 'Order', '05-55555-00005', '110000000006', 'Board game, sealed', '1', '18.00', '5.00', '0.00', '-0.40', '-3.05', '--', '23.00', '19.55', 'P-0106', '2026-11-03', ''],
  ['2026-11-02', 'Shipping label', '05-55555-00005', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '-7.10', 'P-0106', '2026-11-03', 'USPS Ground Advantage'],
  ['2026-11-15', 'Claim', '05-55555-00005', '110000000006', 'Board game, sealed', '1', '--', '--', '--', '--', '--', '--', '-23.00', '-23.00', 'P-0107', '2026-11-18', 'Item not received'],
  ['2026-11-20', 'Adjustment', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '5.00', 'P-0107', '2026-11-18', 'Credit from eBay'],
];
const UK_HEAD = ['Transaction date', 'Type', 'Order number', 'Item ID', 'Item title', 'Quantity', 'Item subtotal', 'Shipping and handling', 'Final value fee - fixed', 'Final value fee - variable', 'Regulatory operating fee', 'Gross transaction amount', 'Net amount', 'Payout currency', 'Description'];
const UK_ROWS = [
  ['8 Oct 2026', 'Order', '11-00001-00001', '220000000001', 'Wool scarf', '1', '£22.00', '£3.95', '-£0.30', '-£3.33', '-£0.09', '£25.95', '£22.23', 'GBP', ''],
  ['8 Oct 2026', 'Shipping label', '11-00001-00001', '--', '--', '--', '--', '--', '--', '--', '--', '--', '-£3.20', 'GBP', 'Royal Mail 2nd Class'],
  ['14 Oct 2026', 'Order', '11-00002-00002', '220000000002', 'Paperback set (5)', '1', '£12.00', '£4.50', '-£0.30', '-£2.11', '-£0.06', '£16.50', '£14.03', 'GBP', ''],
  ['14 Oct 2026', 'Other fee', '11-00002-00002', '--', '--', '--', '--', '--', '--', '--', '--', '--', '-£0.99', 'GBP', 'Promoted listings fee'],
  ['21 Oct 2026', 'Order', '11-00003-00003', '220000000003', 'Ceramic vase', '1', '£40.00', '£0.00', '-£0.30', '-£5.12', '-£0.14', '£40.00', '£34.44', 'GBP', ''],
  ['22 Oct 2026', 'Shipping label', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '-£6.40', 'GBP', 'Bulk labels (2)'],
  ['30 Oct 2026', 'Payout', '--', '--', '--', '--', '--', '--', '--', '--', '--', '--', '-£54.11', 'GBP', 'Payout to bank'],
];
const toCsvText = (head, rows) => [head, ...rows].map((r) => r.map((v) => (/[",]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v)).join(',')).join('\r\n') + '\r\n';
export const SAMPLES = { us: toCsvText(US_HEAD, US_ROWS), uk: toCsvText(UK_HEAD, UK_ROWS) };
export const SAMPLE_COSTS = { us: { 110000000001: '6.00', 110000000002: '4.00', 110000000003: '3.50', 110000000004: '9.00', 110000000005: '55.00', 110000000006: '8.00' }, uk: { 220000000001: '5.00', 220000000002: '3.00', 220000000003: '12.00' } };
export const SAMPLE_LABELS = { us: { '03-33333-00003': '8.75' }, uk: {} };
export const SAMPLE_HEADINGS = { us: US_HEAD, uk: UK_HEAD };
