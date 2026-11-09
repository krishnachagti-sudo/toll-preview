// Refunded-but-never-returned checker: the engine the page (in the browser) and the server share.
// Pure and dependency-free (README: "core.js is browser-loadable").
//
// It joins three Amazon reports by order ID: the refunds (the Payment Date Range Transaction report,
// a Flat File V2 settlement report, or any refunds list with a column map), the FBA Customer Returns
// report and the Reimbursements report. Each refunded FBA order is then returned, reimbursed, paid
// less than the refund, or still owed; an owed order gets the claim window of its marketplace from
// Amazon's own help page (data/sources.json, read 2026-11-08) and its status on the as-of day.
// Money is integer minor units (cents); dates are calendar days written YYYY-MM-DD, taken as written
// in the report (no time-zone shift).

export const ENGINE_VERSION = 'refund-check-2026.11.08';
export const READ_ON = '2026-11-08';

// Customer-return claim windows, in days after the customer refund or replacement, from each
// marketplace's Seller Central help page "FBA inventory reimbursement policy: Customer return claims"
// (G9N934L7Y4SFWPJ4), read 2026-11-08. The US page says 60 to 120; the Canada and Australia pages say
// 45 to 105. The UK page says Amazon reimburses a refund not returned within 45 days and states no
// closing day, so a UK check needs the seller's own window for the closing day.
export const WINDOWS = {
  US: { open: 60, close: 120, currency: 'USD', name: 'United States', source: 'usClaims' },
  CA: { open: 45, close: 105, currency: 'CAD', name: 'Canada', source: 'caClaims' },
  AU: { open: 45, close: 105, currency: 'AUD', name: 'Australia', source: 'auClaims' },
  UK: { open: 45, close: null, currency: 'GBP', name: 'United Kingdom', source: 'ukClaims' },
};
export const MARKETPLACES = Object.keys(WINDOWS);
// US policy (G200213130): a valuation dispute is filed within 60 days after the reimbursement.
export const DISPUTE_DAYS = 60;
// US policy (G200213130): at most $5,000 for a single unit.
export const MAX_PER_UNIT = 500_000;
export const LIMITS = { bytes: 5 * 1024 * 1024, rows: 200_000, dates: 100 };

export class RefundError extends Error {
  constructor(message, field) { super(message); this.name = 'RefundError'; this.field = field; }
}

// ---------- dates ----------

const DAY_MS = 86_400_000;
const pad = (n) => String(n).padStart(2, '0');
const iso = (y, m, d) => {
  const t = Date.UTC(y, m - 1, d);
  const dt = new Date(t);
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  return `${y}-${pad(m)}-${pad(d)}`;
};
export const isDay = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && iso(+s.slice(0, 4), +s.slice(5, 7), +s.slice(8, 10)) === s;
export function addDays(day, n) {
  const t = Date.parse(`${day}T00:00:00Z`) + n * DAY_MS;
  return new Date(t).toISOString().slice(0, 10);
}
export const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / DAY_MS);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (day) => `${MONTHS[+day.slice(5, 7) - 1]} ${+day.slice(8, 10)}, ${day.slice(0, 4)}`;
export const monthName = (ym) => `${MONTHS[+ym.slice(5, 7) - 1]} ${ym.slice(0, 4)}`;
export const weekdayOf = (day) => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date(`${day}T00:00:00Z`).getUTCDay()];

const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const year4 = (y) => (y.length === 2 ? 2000 + +y : +y);

// A report's date or date-time as a calendar day: ISO (2026-11-03T10:00:00+00:00), Amazon's Date
// Range form ("Nov 3, 2026 1:02:03 AM PST"), "3 Nov 2026", DD.MM.YYYY, DD-MM-YYYY (the returns
// report's help gives this), and slash dates (MM/DD/YY by default, as the settlement report writes
// them; dateOrder 'dmy' for the other way). The day is taken as written.
export function parseDay(raw, dateOrder = 'mdy') {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:$|[T\s])/.exec(s);
  if (m) return iso(+m[1], +m[2], +m[3]);
  m = /^([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/.exec(s);
  if (m && MON[m[1].slice(0, 3).toLowerCase()]) return iso(+m[3], MON[m[1].slice(0, 3).toLowerCase()], +m[2]);
  m = /^(\d{1,2})\s+([A-Za-z]{3,9})\.?,?\s+(\d{4})\b/.exec(s);
  if (m && MON[m[2].slice(0, 3).toLowerCase()]) return iso(+m[3], MON[m[2].slice(0, 3).toLowerCase()], +m[1]);
  m = /^(\d{1,2})[.-](\d{1,2})[.-](\d{4})\b/.exec(s);
  if (m) return iso(+m[3], +m[2], +m[1]);
  m = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\b/.exec(s);
  if (m) return dateOrder === 'dmy' ? iso(year4(m[3]), +m[2], +m[1]) : iso(year4(m[3]), +m[1], +m[2]);
  return null;
}

// ---------- money ----------

// An amount as integer minor units: "$1,234.56", "-12.99", "(12.99)", "12,99" (a decimal comma when
// the value ends in a comma and two digits, or always with decimal 'comma').
export function parseAmount(raw, decimal = 'auto') {
  let s = String(raw ?? '').trim();
  if (!s) return 0;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  s = s.replace(/[^\d.,\-+]/g, '');
  if (s.startsWith('-')) { neg = !neg; s = s.slice(1); } else if (s.startsWith('+')) s = s.slice(1);
  if (s.endsWith('-')) { neg = !neg; s = s.slice(0, -1); }
  const comma = decimal === 'comma' || (decimal === 'auto' && (/^\d*,\d{1,2}$/.test(s) || /^\d{1,3}(\.\d{3})+,\d{1,2}$/.test(s)));
  s = comma ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
  if (!/^\d*(\.\d*)?$/.test(s) || s === '' || s === '.') throw new RefundError(`"${raw}" is not an amount.`);
  const [whole, frac = ''] = s.split('.');
  const cents = Number(whole || '0') * 100 + Number((frac + '00').slice(0, 2)) + (Number(frac[2] ?? 0) >= 5 ? 1 : 0);
  return neg ? -cents : cents;
}

const SYMBOL = { USD: '$', CAD: 'CA$', AUD: 'A$', GBP: '£', EUR: '€' };
export function money(cents, currency = 'USD') {
  const sym = SYMBOL[currency] ?? `${currency} `;
  const a = Math.abs(cents);
  const s = `${sym}${Math.floor(a / 100).toLocaleString('en-US')}.${pad(a % 100)}`;
  return cents < 0 ? `-${s}` : s;
}
export const toDecimal = (cents) => `${cents < 0 ? '-' : ''}${Math.floor(Math.abs(cents) / 100)}.${pad(Math.abs(cents) % 100)}`;

// ---------- delimited text ----------

export function sniffDelimiter(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim()).slice(0, 15);
  const score = (d) => Math.max(0, ...lines.map((l) => l.split(d).length - 1));
  const tabs = score('\t');
  const commas = score(',');
  const semis = score(';');
  if (tabs >= 2 && tabs >= commas / 2) return '\t';
  return semis > commas ? ';' : ',';
}

// Rows of cells; quotes as in RFC 4180; blank lines dropped; a byte-order mark removed.
export function parseDelimited(text, delimiter = sniffDelimiter(text)) {
  const src = text.replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') { if (src[i + 1] === '"') { cell += '"'; i++; } else quoted = false; } else cell += c;
    } else if (c === '"' && cell === '') quoted = true;
    else if (c === delimiter) { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
      if (rows.length > LIMITS.rows) throw new RefundError(`A report has more than ${LIMITS.rows.toLocaleString('en-US')} rows; split it by date range.`);
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

const norm = (h) => String(h ?? '').trim().toLowerCase().replace(/[_\s]+/g, '-').replace(/[^a-z0-9/\-[\]]/g, '');

// The columns each report is read by: Amazon's download headers (and the online headers) from the
// help pages, normalised. A column map (opts.columns.<report>) names any other heading.
export const COLUMNS = {
  dateRange: {
    date: ['date/time', 'date-time', 'date'], type: ['type'], orderId: ['order-id'], sku: ['sku'], quantity: ['quantity'],
    fulfillment: ['fulfillment', 'fulfilment'], amount: ['product-sales'], marketplace: ['store', 'marketplace'],
  },
  settlement: {
    date: ['posted-date', 'posted-date-time'], type: ['transaction-type'], orderId: ['order-id'], sku: ['sku'], quantity: ['quantity-purchased'],
    amountType: ['amount-type'], amountDescription: ['amount-description'], amount: ['amount'], fulfillment: ['fulfillment-id'], currency: ['currency'],
  },
  list: { date: ['refund-date', 'date', 'posted-date'], orderId: ['order-id', 'amazon-order-id'], sku: ['sku'], quantity: ['quantity', 'units'], amount: ['refund-amount', 'amount', 'refund'] },
  returns: {
    date: ['return-date', 'returned-date'], orderId: ['order-id', 'amazon-order-id'], sku: ['sku', 'merchant-sku'], fnsku: ['fnsku'], quantity: ['quantity'],
    disposition: ['detailed-disposition', 'disposition'], status: ['status'], reason: ['reason'],
  },
  reimbursements: {
    date: ['approval-date', 'date'], id: ['reimbursement-id'], caseId: ['case-id'], orderId: ['amazon-order-id', 'order-id'], reason: ['reason'],
    sku: ['sku', 'merchant-sku'], fnsku: ['fnsku'], quantity: ['quantity'], cash: ['quantity-reimbursed-cash', 'quantity-reimbursed-[cash]'],
    inventory: ['quantity-reimbursed-inventory', 'quantity-reimbursed-[inventory]'], total: ['quantity-reimbursed-total', 'quantity-reimbursed-[total]'],
    amount: ['amount-total'], perUnit: ['amount-per-unit'], currency: ['currency-unit'], originalId: ['original-reimbursement-id'],
  },
};
export const MAP_KEYS = {
  refunds: ['date', 'type', 'orderId', 'sku', 'quantity', 'fulfillment', 'amount'],
  returns: Object.keys(COLUMNS.returns),
  reimbursements: Object.keys(COLUMNS.reimbursements),
};

// Finds the header row (the first of the first 30 rows that has every required column) and returns
// { at: { key: index }, header, body }.
function locate(rows, aliases, required, map = {}, what, field) {
  for (let r = 0; r < Math.min(rows.length, 30); r++) {
    const head = rows[r].map(norm);
    const at = {};
    for (const [key, names] of Object.entries(aliases)) {
      const wanted = map[key] !== undefined ? [norm(map[key])] : names;
      const i = head.findIndex((h) => wanted.includes(h));
      if (i >= 0) at[key] = i;
    }
    if (required.every((k) => at[k] !== undefined)) return { at, header: rows[r], body: rows.slice(r + 1) };
  }
  const missing = required.map((k) => (map[k] ?? aliases[k][0])).join(', ');
  throw new RefundError(`The ${what} has no heading row with ${missing}. If your copy renames them, give a column map (columns.${field}).`, field);
}
const cellOf = (row, at, key) => (at[key] === undefined ? '' : String(row[at[key]] ?? '').trim());
const qtyOf = (raw, dflt = 1) => {
  const s = String(raw ?? '').trim();
  if (!s) return dflt;
  const n = Number(s.replace(/,/g, ''));
  if (!Number.isFinite(n) || !Number.isInteger(n)) throw new RefundError(`"${raw}" is not a whole number of units.`);
  return n;
};
const bad = (what, i, e, field) => new RefundError(`${what}, data row ${i + 1}: ${e.message}`, field);

// ---------- reading the three reports ----------

// The refunds: { kind, rows: [{ orderId, date, qty, amount, sku }], skipped: { notRefund, notFba } }.
// kind 'date-range' (type = Refund, fulfillment Amazon; amount = product sales), 'settlement'
// (transaction-type Refund; amount = ItemPrice Principal, fulfillment AFN) or 'list' (every row a refund).
export function readRefunds(text, opts = {}) {
  const rows = parseDelimited(text);
  const map = opts.columns?.refunds ?? {};
  const head = (rows.slice(0, 30).map((r) => r.map(norm)));
  const has = (names) => head.some((h) => names.some((n) => h.includes(n)));
  let kind = 'list';
  if (has(['amount-type']) && has(['transaction-type'])) kind = 'settlement';
  else if (has(['product-sales']) || (map.type && map.amount)) kind = 'date-range';
  const aliases = kind === 'settlement' ? COLUMNS.settlement : kind === 'date-range' ? COLUMNS.dateRange : COLUMNS.list;
  const required = kind === 'list' ? ['date', 'orderId', 'amount'] : ['date', 'type', 'orderId', 'amount'];
  const { at, body } = locate(rows, aliases, required, map, 'refunds file', 'refunds');
  const out = [];
  const skipped = { notRefund: 0, notFba: 0, noOrder: 0 };
  body.forEach((row, i) => {
    try {
      const type = cellOf(row, at, 'type').toLowerCase();
      if (kind !== 'list' && type !== 'refund') { skipped.notRefund++; return; }
      if (kind === 'settlement') {
        const at2 = cellOf(row, at, 'amountType').toLowerCase();
        const ad = cellOf(row, at, 'amountDescription').toLowerCase();
        if (at2 !== 'itemprice' || ad !== 'principal') { skipped.notRefund++; return; }
      }
      const f = cellOf(row, at, 'fulfillment').toLowerCase();
      if (f && !(/amazon|afn/.test(f))) { skipped.notFba++; return; }
      const orderId = cellOf(row, at, 'orderId');
      if (!orderId) { skipped.noOrder++; return; }
      const date = parseDay(cellOf(row, at, 'date'), opts.dateOrder);
      if (!date) throw new RefundError(`"${cellOf(row, at, 'date')}" is not a date this tool can read.`);
      const amount = Math.abs(parseAmount(cellOf(row, at, 'amount'), opts.decimal));
      const qty = Math.abs(qtyOf(cellOf(row, at, 'quantity'), kind === 'settlement' ? 0 : 1));
      out.push({ orderId, date, qty, amount, sku: cellOf(row, at, 'sku'), currency: cellOf(row, at, 'currency') || null });
    } catch (e) { throw bad('The refunds file', i, e, 'refunds'); }
  });
  return { kind, rows: out, skipped };
}

const DISPOSITION = (raw) => norm(raw).replace(/-/g, ' ').toUpperCase();
// Amazon's condition codes (FBA Customer Returns report help): who is responsible.
export const AMAZON_RESPONSIBLE = ['DAMAGED', 'CARRIER DAMAGED'];
export const NOT_ELIGIBLE = ['CUSTOMER DAMAGED', 'DEFECTIVE'];

export function readReturns(text, opts = {}) {
  if (!String(text ?? '').trim()) return [];
  const rows = parseDelimited(text);
  const { at, body } = locate(rows, COLUMNS.returns, ['orderId', 'quantity'], opts.columns?.returns, 'FBA Customer Returns report', 'returns');
  return body.map((row, i) => {
    try {
      return {
        orderId: cellOf(row, at, 'orderId'), date: parseDay(cellOf(row, at, 'date'), opts.dateOrder), qty: qtyOf(cellOf(row, at, 'quantity')),
        disposition: DISPOSITION(cellOf(row, at, 'disposition')), status: cellOf(row, at, 'status'), sku: cellOf(row, at, 'sku'), fnsku: cellOf(row, at, 'fnsku'),
      };
    } catch (e) { throw bad('The FBA Customer Returns report', i, e, 'returns'); }
  }).filter((r) => r.orderId);
}

export function readReimbursements(text, opts = {}) {
  if (!String(text ?? '').trim()) return [];
  const rows = parseDelimited(text);
  const { at, body } = locate(rows, COLUMNS.reimbursements, ['orderId', 'amount'], opts.columns?.reimbursements, 'Reimbursements report', 'reimbursements');
  return body.map((row, i) => {
    try {
      const cash = qtyOf(cellOf(row, at, 'cash'), 0);
      const inventory = qtyOf(cellOf(row, at, 'inventory'), 0);
      const totalRaw = cellOf(row, at, 'total');
      return {
        orderId: cellOf(row, at, 'orderId'), date: parseDay(cellOf(row, at, 'date'), opts.dateOrder), id: cellOf(row, at, 'id'), caseId: cellOf(row, at, 'caseId'),
        reason: cellOf(row, at, 'reason'), cash, inventory, units: totalRaw ? qtyOf(totalRaw) : cash + inventory,
        amount: parseAmount(cellOf(row, at, 'amount'), opts.decimal), currency: cellOf(row, at, 'currency') || null, originalId: cellOf(row, at, 'originalId'),
      };
    } catch (e) { throw bad('The Reimbursements report', i, e, 'reimbursements'); }
  }).filter((r) => r.orderId);
}

// ---------- the claim window ----------

// The window for one refund date: { opens, closes, status, daysToOpen, daysLeft, day }. status is
// 'wait' (before the first day), 'claim' (inside it), 'expired' (after the last day) or 'open-ended'
// (a marketplace whose page gives no last day, with no window of the seller's own).
export function windowOf(refundDate, { marketplace = 'US', asOf, window } = {}) {
  const w = windowRule(marketplace, window);
  const opens = addDays(refundDate, w.open);
  const closes = w.close === null ? null : addDays(refundDate, w.close);
  const day = asOf ? daysBetween(refundDate, asOf) : null;
  let status = null;
  if (asOf) status = asOf < opens ? 'wait' : closes === null ? 'open-ended' : asOf <= closes ? 'claim' : 'expired';
  return { refundDate, opens, closes, day, status, daysToOpen: asOf && asOf < opens ? daysBetween(asOf, opens) : 0, daysLeft: asOf && closes && asOf <= closes ? daysBetween(asOf, closes) : null, rule: w };
}

export function windowRule(marketplace = 'US', window) {
  const base = WINDOWS[marketplace];
  if (!base) throw new RefundError(`marketplace is one of ${MARKETPLACES.join(', ')}.`, 'marketplace');
  if (!window) return { ...base, marketplace, yours: false };
  const open = window.open ?? base.open;
  const close = window.close ?? base.close;
  if (!Number.isInteger(open) || open < 0 || (close !== null && (!Number.isInteger(close) || close < open))) throw new RefundError('window is { open, close } in whole days after the refund, with close at or after open.', 'window');
  return { ...base, open, close, marketplace, yours: true };
}

// ---------- the check ----------

export const STATUSES = {
  claim: 'Claim now',
  wait: 'Not yet claimable',
  'open-ended': 'Claimable (no closing day published)',
  expired: 'Window closed',
  'paid-less': 'Reimbursed below the refund',
  reimbursed: 'Reimbursed',
  returned: 'Returned',
  'not-eligible': 'Returned damaged by the customer or defective',
};
// The statuses that are money still owed: the unit is gone and nothing was paid. These are the
// orders the paid audit charges for.
export const OWED = ['claim', 'wait', 'open-ended'];

export function audit({ refunds, returns = '', reimbursements = '', marketplace = 'US', asOf, window, columns, dateOrder, decimal } = {}) {
  if (!isDay(asOf)) throw new RefundError('asOf is a date written YYYY-MM-DD.', 'asOf');
  const rule = windowRule(marketplace, window);
  const opts = { columns, dateOrder, decimal };
  const ref = readRefunds(String(refunds ?? ''), opts);
  const ret = readReturns(returns, opts);
  const rei = readReimbursements(reimbursements, opts);
  const warnings = [];
  if (!ref.rows.length) throw new RefundError(`The refunds file has no FBA refund rows${ref.skipped.notFba ? ` (${ref.skipped.notFba} seller-fulfilled refunds were left out)` : ''}.`, 'refunds');
  if (!String(returns ?? '').trim()) warnings.push('No FBA Customer Returns report was given, so no refund is shown as returned: add it before you file anything.');
  if (!String(reimbursements ?? '').trim()) warnings.push('No Reimbursements report was given, so no refund is shown as reimbursed: add it before you file anything.');
  if (rule.close === null) warnings.push(`Amazon's ${rule.name} help page says a refund not returned within ${rule.open} days is reimbursed, but gives no last day to claim. Give your own window to date the last day.`);
  if (rule.yours) warnings.push(`Your window is used: days ${rule.open} to ${rule.close ?? 'no limit'} after the refund, not Amazon's ${rule.name} page (days ${WINDOWS[marketplace].open} to ${WINDOWS[marketplace].close ?? 'not stated'}).`);

  const byOrder = new Map();
  const group = (list, key) => { for (const r of list) { if (!byOrder.has(r.orderId)) byOrder.set(r.orderId, { refunds: [], returns: [], reimbursements: [] }); byOrder.get(r.orderId)[key].push(r); } };
  group(ref.rows, 'refunds');
  const refunded = new Set(byOrder.keys());
  group(ret.filter((r) => refunded.has(r.orderId)), 'returns');
  group(rei.filter((r) => refunded.has(r.orderId)), 'reimbursements');
  const currency = ref.rows.find((r) => r.currency)?.currency || rei.find((r) => r.currency)?.currency || rule.currency;

  const orders = [];
  for (const [orderId, g] of byOrder) {
    const date = g.refunds.map((r) => r.date).sort()[0];
    const dates = [...new Set(g.refunds.map((r) => r.date))].sort();
    let refundedUnits = g.refunds.reduce((a, r) => a + r.qty, 0);
    if (refundedUnits === 0) refundedUnits = 1; // settlement refunds carry no quantity
    const refundAmount = g.refunds.reduce((a, r) => a + r.amount, 0);
    const returned = g.returns.reduce((a, r) => a + r.qty, 0);
    const amazonDamaged = g.returns.filter((r) => AMAZON_RESPONSIBLE.includes(r.disposition)).reduce((a, r) => a + r.qty, 0);
    const customerFault = g.returns.filter((r) => NOT_ELIGIBLE.includes(r.disposition)).reduce((a, r) => a + r.qty, 0);
    const missing = Math.max(0, refundedUnits - returned);
    const owedUnits = missing + amazonDamaged;
    const reimbursedUnits = Math.max(0, g.reimbursements.reduce((a, r) => a + r.units, 0));
    const reimbursedCash = g.reimbursements.reduce((a, r) => a + r.amount, 0);
    const reversed = g.reimbursements.some((r) => r.amount < 0 || r.units < 0);
    const lastPaid = g.reimbursements.filter((r) => r.amount > 0 && r.date).map((r) => r.date).sort().at(-1) ?? null;
    const unitValue = Math.round(refundAmount / refundedUnits);
    const w = windowOf(date, { marketplace, asOf, window });
    const o = {
      orderId, sku: g.refunds.find((r) => r.sku)?.sku ?? '', refundDate: date, refundDates: dates, refundedUnits, refundAmount, returnedUnits: returned,
      dispositions: [...new Set(g.returns.map((r) => r.disposition).filter(Boolean))], amazonDamaged, customerFault, missingUnits: missing,
      owedUnits, reimbursedUnits, reimbursedCash, reimbursements: g.reimbursements.map((r) => ({ id: r.id, date: r.date, reason: r.reason, units: r.units, amount: r.amount, caseId: r.caseId })),
      reversed, opens: w.opens, closes: w.closes, status: null, value: 0, gap: 0, disputeBy: null, note: '',
    };
    if (owedUnits === 0) {
      o.status = customerFault > 0 ? 'not-eligible' : 'returned';
      o.note = customerFault > 0 ? `Returned ${o.dispositions.join(', ')}: Amazon's policy does not reimburse an item damaged by a customer or defective.` : 'Received back in the FBA Customer Returns report.';
    } else if (reimbursedUnits >= owedUnits && reimbursedCash > 0) {
      const expected = Math.min(unitValue, MAX_PER_UNIT) * owedUnits;
      o.gap = Math.max(0, expected - reimbursedCash);
      o.disputeBy = lastPaid ? addDays(lastPaid, DISPUTE_DAYS) : null;
      if (o.gap > 0) {
        o.status = 'paid-less';
        o.note = o.disputeBy ? (asOf <= o.disputeBy ? `Paid ${money(o.gap, currency)} less than the refund for ${owedUnits} ${owedUnits === 1 ? 'unit' : 'units'}; the policy deducts "applicable fees". A valuation dispute is due by ${longDate(o.disputeBy)}.` : `Paid ${money(o.gap, currency)} less than the refund; the 60 days to dispute the value ended ${longDate(o.disputeBy)}.`) : `Paid ${money(o.gap, currency)} less than the refund.`;
      } else { o.status = 'reimbursed'; o.note = 'Reimbursed in cash at or above the refund.'; }
    } else if (reimbursedUnits >= owedUnits) {
      o.status = 'reimbursed';
      o.note = 'Reimbursed with inventory units.';
    } else {
      const unpaid = owedUnits - reimbursedUnits;
      o.value = Math.min(unitValue, MAX_PER_UNIT) * unpaid;
      o.status = w.status;
      o.unpaidUnits = unpaid;
      const what = `${unpaid} ${unpaid === 1 ? 'unit' : 'units'}${amazonDamaged ? ` (${amazonDamaged} returned ${o.dispositions.filter((d) => AMAZON_RESPONSIBLE.includes(d)).join(' or ')}, Amazon's responsibility)` : ''} not reimbursed${reversed ? ' after a reversed reimbursement' : ''}`;
      o.note = w.status === 'wait' ? `${what}. Amazon says it reimburses most of these by itself; the claim window opens ${longDate(w.opens)}.`
        : w.status === 'claim' ? `${what}. Claim by ${longDate(w.closes)} (${w.daysLeft} ${w.daysLeft === 1 ? 'day' : 'days'} left).`
          : w.status === 'expired' ? `${what}. The window closed ${longDate(w.closes)}.`
            : `${what}. Claimable from ${longDate(w.opens)}; the page gives no last day.`;
    }
    orders.push(o);
  }
  orders.sort((a, b) => (a.refundDate < b.refundDate ? -1 : a.refundDate > b.refundDate ? 1 : a.orderId < b.orderId ? -1 : 1));

  const totals = Object.fromEntries(Object.keys(STATUSES).map((s) => [s, { orders: 0, value: 0 }]));
  for (const o of orders) { totals[o.status].orders++; totals[o.status].value += o.status === 'paid-less' ? o.gap : o.value; }
  const claimable = orders.filter((o) => o.status === 'claim').sort((a, b) => (a.closes < b.closes ? -1 : 1));
  const disputable = orders.filter((o) => o.status === 'paid-less' && o.disputeBy && asOf <= o.disputeBy);
  const span = { from: orders[0].refundDate, to: orders.reduce((m, o) => (o.refundDate > m ? o.refundDate : m), orders[0].refundDate) };
  const r = {
    asOf, marketplace, rule: { open: rule.open, close: rule.close, yours: rule.yours, name: rule.name }, currency, kind: ref.kind, span, orders, totals,
    owed: OWED.reduce((a, s) => a + totals[s].orders, 0), nextClose: claimable[0]?.closes ?? null, disputable: disputable.length,
    skipped: ref.skipped, warnings, counts: { refundRows: ref.rows.length, returnRows: ret.length, reimbursementRows: rei.length },
  };
  r.answer = answerOf(r);
  return r;
}

const n = (k, one, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;

function answerOf(r) {
  const t = r.totals;
  const c = r.currency;
  const unpaid = t.claim.orders + t.wait.orders + t['open-ended'].orders + t.expired.orders;
  const total = r.orders.length;
  const head = `${unpaid} of your ${n(total, 'refunded FBA order')} from ${longDate(r.span.from)} to ${longDate(r.span.to)} ${unpaid === 1 ? 'was' : 'were'} neither returned nor reimbursed`;
  if (unpaid === 0 && t['paid-less'].orders === 0) return `None of your ${n(total, 'refunded FBA order')} from ${longDate(r.span.from)} to ${longDate(r.span.to)} is owed: every one was returned or reimbursed at the refund.`;
  const parts = [];
  if (t.claim.orders) parts.push(`${t.claim.orders} can be claimed today (${money(t.claim.value, c)} refunded; the first window closes ${longDate(r.nextClose)})`);
  if (t['open-ended'].orders) parts.push(`${t['open-ended'].orders} can be claimed today (${money(t['open-ended'].value, c)} refunded)`);
  if (t.wait.orders) parts.push(`${t.wait.orders} ${t.wait.orders === 1 ? 'opens' : 'open'} later (${money(t.wait.value, c)} refunded)`);
  if (t.expired.orders) parts.push(`${t.expired.orders} expired`);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0];
  const p = t['paid-less'].orders;
  const less = p ? `${n(p, 'order')} ${p === 1 ? 'was' : 'were'} reimbursed ${money(t['paid-less'].value, c)} below the refund` : '';
  if (!unpaid) return `None of your ${n(total, 'refunded FBA order')} from ${longDate(r.span.from)} to ${longDate(r.span.to)} is unpaid, but ${less}.`;
  return `${head}: ${list}${less ? `; ${less}` : ''}.`;
}

// How many refunded FBA orders a refunds file holds (the unit a paid audit reserves).
export function countOrders(refunds, opts = {}) {
  return new Set(readRefunds(String(refunds ?? ''), opts).rows.map((r) => r.orderId)).size;
}

// ---------- outputs: claim text and CSV ----------

const unitWords = (k) => n(k, 'unit');

// The text for one order: a customer return claim for an owed order, a valuation dispute for one
// paid below the refund. None for any other status: a claim before the window opens is premature,
// and Amazon's policy warns against premature requests.
export function caseText(o, r) {
  const c = r.currency;
  if (o.status === 'claim' || o.status === 'open-ended') {
    const lines = [
      `Subject: FBA customer return claim, order ${o.orderId}`,
      '',
      'Hello,',
      '',
      `I am filing a customer return claim under the FBA inventory reimbursement policy (Customer return claims) for order ${o.orderId}${o.sku ? `, SKU ${o.sku}` : ''}.`,
      '',
      `- Customer refunded on ${longDate(o.refundDate)} (${daysBetween(o.refundDate, r.asOf)} days ago), ${unitWords(o.refundedUnits)}, ${money(o.refundAmount, c)}.`,
      `- FBA Customer Returns report: ${o.returnedUnits ? `${unitWords(o.returnedUnits)} received${o.amazonDamaged ? ` (${o.dispositions.join(', ')})` : ''}` : 'no unit received'} as of ${longDate(r.asOf)}.`,
      `- Reimbursements report: ${o.reimbursedUnits ? `${unitWords(o.reimbursedUnits)} reimbursed` : 'no reimbursement'} for this order${o.reversed ? ' (a reimbursement was reversed)' : ''}.`,
      `- This is inside the claim window: ${longDate(o.opens)}${o.closes ? ` to ${longDate(o.closes)}` : ' onward'}.`,
      '',
      `Please reimburse the ${unitWords(o.unpaidUnits)} ${o.amazonDamaged && !o.missingUnits ? 'returned in a condition Amazon is responsible for' : 'not returned'}, valued as the policy states (the refund amount minus applicable fees).`,
      '',
      'Thank you.',
    ];
    return lines.join('\n');
  }
  if (o.status === 'paid-less' && o.disputeBy && r.asOf <= o.disputeBy) {
    const last = o.reimbursements.filter((x) => x.amount > 0).at(-1);
    return [
      `Subject: Reimbursement valuation, order ${o.orderId}`,
      '',
      'Hello,',
      '',
      `For order ${o.orderId}${o.sku ? `, SKU ${o.sku}` : ''}, the customer was refunded ${money(o.refundAmount, c)} for ${unitWords(o.refundedUnits)} on ${longDate(o.refundDate)}, and reimbursement ${last?.id || '(see the Reimbursements report)'}${last?.date ? ` of ${longDate(last.date)}` : ''} paid ${money(o.reimbursedCash, c)} for ${unitWords(o.owedUnits)}.`,
      '',
      `The policy values a customer return claim at the refund amount minus applicable fees. Please show which fees make up the ${money(o.gap, c)} difference, or correct the reimbursement. This is within 60 days of the reimbursement (by ${longDate(o.disputeBy)}).`,
      '',
      'Thank you.',
    ].join('\n');
  }
  return null;
}

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const CSV_COLUMNS = ['order_id', 'sku', 'refund_date', 'units_refunded', 'units_returned', 'dispositions', 'units_reimbursed', 'refund_amount', 'reimbursed_amount', 'owed_value', 'paid_below_refund', 'status', 'claim_opens', 'claim_closes', 'dispute_by', 'note'];
export function ordersCsv(r) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const o of r.orders) {
    lines.push([o.orderId, o.sku, o.refundDate, o.refundedUnits, o.returnedUnits, o.dispositions.join(' '), o.reimbursedUnits, toDecimal(o.refundAmount), toDecimal(o.reimbursedCash), toDecimal(o.value), toDecimal(o.gap), STATUSES[o.status], o.opens, o.closes ?? '', o.disputeBy ?? '', o.note].map(csvCell).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}

// ---------- the claim window calendar ----------

// For each month from `from` to `to` (YYYY-MM): refunds made on the 1st and the last day of the month,
// when their windows open and close.
export function calendar(from, to, marketplace = 'US') {
  const out = [];
  let [y, m] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    const first = `${y}-${pad(m)}-01`;
    const last = addDays(m === 12 ? `${y + 1}-01-01` : `${y}-${pad(m + 1)}-01`, -1);
    const a = windowOf(first, { marketplace });
    const b = windowOf(last, { marketplace });
    out.push({ month: `${y}-${pad(m)}`, first, last, opensFrom: a.opens, opensTo: b.opens, closesFrom: a.closes, closesTo: b.closes });
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
}

// ---------- the made-up sample (US, checked on November 8, 2026) ----------

const DR_HEAD = ['date/time', 'settlement id', 'type', 'order id', 'sku', 'description', 'quantity', 'store', 'fulfillment', 'order city', 'order state', 'order post code', 'tax collection model', 'product sales', 'product sales tax', 'shipping credits', 'shipping credits tax', 'gift wrap credits', 'gift wrap credits tax', 'regulatory fee', 'tax on regulatory fee', 'promotional rebate', 'promotional rebate tax', 'marketplace withheld tax', 'selling fees', 'fba fees', 'other transaction fees', 'other', 'total'];
const drRow = (when, type, order, sku, qty, fulfil, sales, fees, fba, total) => [when, '24816093571', type, order, sku, `Sample product ${sku}`, String(qty), 'amazon.com', fulfil, 'Austin', 'TX', '78701', 'MarketplaceFacilitator', sales, '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', fees, fba, '0', '0', total];
const q = (cells) => cells.map((c) => (/[",]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',');

export const SAMPLE_AS_OF = '2026-11-08';
export const SAMPLE = {
  refunds: [
    '"Includes Amazon Marketplace, Fulfillment by Amazon (FBA), and Amazon Webstore transactions"',
    '"All amounts in USD, unless specified"',
    q(DR_HEAD),
    q(drRow('Jun 20, 2026 9:14:02 AM PDT', 'Refund', '112-0000001-0000001', 'MUG-BLUE', 1, 'Amazon', '-19.99', '2.40', '0', '-17.59')),
    q(drRow('Jul 1, 2026 4:02:11 PM PDT', 'Refund', '112-0000002-0000002', 'MUG-RED', 1, 'Amazon', '-19.99', '2.40', '0', '-17.59')),
    q(drRow('Jul 10, 2026 11:45:00 AM PDT', 'Refund', '112-0000003-0000003', 'LAMP-01', 1, 'Amazon', '-34.50', '4.14', '0', '-30.36')),
    q(drRow('Jul 15, 2026 8:30:41 AM PDT', 'Refund', '112-0000004-0000004', 'LAMP-01', 1, 'Amazon', '-34.50', '4.14', '0', '-30.36')),
    q(drRow('Jul 25, 2026 2:12:09 PM PDT', 'Refund', '112-0000005-0000005', 'KETTLE-2', 1, 'Amazon', '-42.00', '5.04', '0', '-36.96')),
    q(drRow('Aug 1, 2026 7:55:30 AM PDT', 'Refund', '112-0000006-0000006', 'MUG-BLUE', 1, 'Amazon', '-24.99', '3.00', '0', '-21.99')),
    q(drRow('Aug 10, 2026 10:10:10 AM PDT', 'Refund', '112-0000007-0000007', 'KETTLE-2', 1, 'Amazon', '-42.00', '5.04', '0', '-36.96')),
    q(drRow('Aug 20, 2026 6:20:00 PM PDT', 'Refund', '112-0000008-0000008', 'TEAPOT-3', 1, 'Amazon', '-27.95', '3.35', '0', '-24.60')),
    q(drRow('Sep 2, 2026 1:00:00 PM PDT', 'Order', '112-0000013-0000013', 'MUG-BLUE', 1, 'Amazon', '24.99', '-3.75', '-4.10', '17.14')),
    q(drRow('Sep 5, 2026 3:33:33 PM PDT', 'Refund', '112-0000009-0000009', 'TEAPOT-3', 1, 'Amazon', '-27.95', '3.35', '0', '-24.60')),
    q(drRow('Sep 12, 2026 9:00:00 AM PDT', 'Refund', '112-0000012-0000012', 'MUG-RED', 1, 'Seller', '-19.99', '2.40', '0', '-17.59')),
    q(drRow('Sep 20, 2026 12:00:00 PM PDT', 'Refund', '112-0000010-0000010', 'LAMP-01', 1, 'Amazon', '-34.50', '4.14', '0', '-30.36')),
    q(drRow('Oct 1, 2026 5:45:00 PM PDT', 'Refund', '112-0000011-0000011', 'MUG-RED', 2, 'Amazon', '-39.98', '4.80', '0', '-35.18')),
  ].join('\n') + '\n',
  returns: [
    ['return-date', 'order-id', 'sku', 'asin', 'fnsku', 'product-name', 'quantity', 'fulfillment-center-id', 'detailed-disposition', 'reason', 'status', 'license-plate-number', 'customer-comments'].join('\t'),
    ['2026-07-10T15:02:00+00:00', '112-0000002-0000002', 'MUG-RED', 'B0SAMPLE02', 'X00SAMPLE2', 'Sample product MUG-RED', '1', 'SBD1', 'SELLABLE', 'NO_REASON_GIVEN', 'Unit returned to inventory', 'LPN0000002', ''].join('\t'),
    ['2026-08-25T11:20:00+00:00', '112-0000007-0000007', 'KETTLE-2', 'B0SAMPLE07', 'X00SAMPLE7', 'Sample product KETTLE-2', '1', 'SBD1', 'CARRIER_DAMAGED', 'DAMAGED_BY_CARRIER', 'Unit returned to inventory', 'LPN0000007', ''].join('\t'),
    ['2026-09-19T09:40:00+00:00', '112-0000009-0000009', 'TEAPOT-3', 'B0SAMPLE09', 'X00SAMPLE9', 'Sample product TEAPOT-3', '1', 'ONT8', 'CUSTOMER_DAMAGED', 'UNWANTED_ITEM', 'Unit returned to inventory', 'LPN0000009', ''].join('\t'),
    ['2026-10-09T13:05:00+00:00', '112-0000011-0000011', 'MUG-RED', 'B0SAMPLE02', 'X00SAMPLE2', 'Sample product MUG-RED', '1', 'ONT8', 'SELLABLE', 'NO_REASON_GIVEN', 'Unit returned to inventory', 'LPN0000011', ''].join('\t'),
  ].join('\n') + '\n',
  reimbursements: [
    ['approval-date', 'reimbursement-id', 'case-id', 'amazon-order-id', 'reason', 'sku', 'fnsku', 'asin', 'product-name', 'condition', 'currency-unit', 'amount-per-unit', 'amount-total', 'quantity-reimbursed-cash', 'quantity-reimbursed-inventory', 'quantity-reimbursed-total', 'original-reimbursement-id', 'original-reimbursement-type'].join('\t'),
    ['2026-08-21T08:00:00+00:00', '9000000001', '', '112-0000001-0000001', 'CustomerReturn', 'MUG-BLUE', 'X00SAMPLE1', 'B0SAMPLE01', 'Sample product MUG-BLUE', 'NewItem', 'USD', '19.99', '19.99', '1', '0', '1', '', ''].join('\t'),
    ['2026-09-25T08:00:00+00:00', '9000000005', '', '112-0000005-0000005', 'CustomerReturn', 'KETTLE-2', 'X00SAMPLE5', 'B0SAMPLE05', 'Sample product KETTLE-2', 'NewItem', 'USD', '42.00', '42.00', '1', '0', '1', '', ''].join('\t'),
    ['2026-10-20T08:00:00+00:00', '9000000015', '', '112-0000005-0000005', 'Reimbursement_Reversal', 'KETTLE-2', 'X00SAMPLE5', 'B0SAMPLE05', 'Sample product KETTLE-2', 'NewItem', 'USD', '-42.00', '-42.00', '-1', '', '-1', '9000000005', 'CustomerReturn'].join('\t'),
    ['2026-10-01T08:00:00+00:00', '9000000006', '', '112-0000006-0000006', 'CustomerReturn', 'MUG-BLUE', 'X00SAMPLE1', 'B0SAMPLE01', 'Sample product MUG-BLUE', 'NewItem', 'USD', '8.12', '8.12', '1', '0', '1', '', ''].join('\t'),
  ].join('\n') + '\n',
};
