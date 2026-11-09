// Payout reconciliation: the engine. Reads a payment processor's own payout export and splits it
// into sales, refunds, disputes, fees, tax on fees, reserves and adjustments, per payout and per
// currency, proves the rows add up to the money that moved, and builds a balanced journal through a
// clearing account for QuickBooks Online or Xero.
//
// Pure and dependency-free: the page loads this same file in the browser (the split runs there, free,
// nothing uploaded) and the server runs it for the paid journal. No AI and no guessing: every row is
// placed by the processor's own category or type, named in its documentation (see data/sources.json),
// and anything the file does not say is reported, never made up.
//
// Money is integer minor units (cents for USD) everywhere; strings only at the edges.

export const ENGINE_VERSION = 'payout-2026.11';
export const LIMITS = { bytes: 5_000_000, rows: 50_000 };
export const PROCESSORS = ['stripe', 'shopify', 'paypal', 'square', 'custom'];
export const LEDGERS = ['quickbooks-online', 'xero'];

export class PayoutError extends Error {
  constructor(message, field = 'file') {
    super(message);
    this.name = 'PayoutError';
    this.field = field;
  }
}

// ---------- buckets: where a row's money goes in the books ----------

// Each bucket is one line of the split and, by default, one account in the journal. A positive
// amount is money that came into the processor balance (a credit to the account); a negative one
// went out of it (a debit). The clearing account takes the difference, which is the net.
export const BUCKETS = [
  { id: 'sales', label: 'Sales', account: 'Sales' },
  { id: 'salesTax', label: 'Sales tax collected', account: 'Sales tax payable' },
  { id: 'refunds', label: 'Refunds', account: 'Refunds' },
  { id: 'disputes', label: 'Chargebacks and disputes', account: 'Chargebacks' },
  { id: 'fees', label: 'Processing fees', account: 'Merchant fees' },
  { id: 'taxOnFees', label: 'Tax on fees', account: 'Tax on merchant fees' },
  { id: 'reserves', label: 'Reserves and holds', account: 'Processor reserve' },
  { id: 'loans', label: 'Loan and advance repayments', account: 'Merchant loan' },
  { id: 'transfers', label: 'Transfers between balances', account: 'Transfers in transit' },
  { id: 'platform', label: 'Platform earnings', account: 'Platform fee revenue' },
  { id: 'shipping', label: 'Shipping labels', account: 'Shipping expense' },
  { id: 'duties', label: 'Duties and import taxes', account: 'Duties and import taxes' },
  { id: 'fx', label: 'Currency conversion', account: 'Currency conversion' },
  { id: 'withholding', label: 'Tax withheld by the processor', account: 'Tax withheld by processor' },
  { id: 'spent', label: 'Payments sent', account: 'Payments sent' },
  { id: 'bank', label: 'Money from or back to your bank', account: null },
  { id: 'adjustments', label: 'Other adjustments', account: 'Processor adjustments' },
];
export const BUCKET_IDS = BUCKETS.map((b) => b.id);
const BUCKET = Object.fromEntries(BUCKETS.map((b) => [b.id, b]));

export const PROCESSOR_NAMES = { stripe: 'Stripe', shopify: 'Shopify Payments', paypal: 'PayPal', square: 'Square', custom: 'your processor' };
export const LEDGER_NAMES = { 'quickbooks-online': 'QuickBooks Online', xero: 'Xero' };
const CLEARING = { stripe: 'Stripe clearing', shopify: 'Shopify Payments clearing', paypal: 'PayPal', square: 'Square clearing', custom: 'Processor clearing' };

// ---------- Stripe: reporting_category (docs.stripe.com/reports/reporting-categories) ----------

export const STRIPE_CATEGORIES = {
  charge: 'sales',
  // "Summing the two balance transactions yields the captured portion of the charge": the
  // uncaptured part reverses the sale, it is not a refund.
  partial_capture_reversal: 'sales',
  // A pending ACH or direct debit payment that later failed takes the charge back.
  charge_failure: 'sales',
  refund: 'refunds',
  refund_failure: 'refunds',
  dispute: 'disputes',
  dispute_reversal: 'disputes',
  fee: 'fees',
  // "Typically, this is a tax on Stripe fees."
  tax: 'taxOnFees',
  tax_withholding: 'withholding',
  tax_fund: 'transfers',
  risk_reserved_funds: 'reserves',
  connect_reserved_funds: 'reserves',
  payment_network_reserve_hold: 'reserves',
  payment_network_reserve_release: 'reserves',
  payout_minimum_balance_hold: 'reserves',
  payout_minimum_balance_release: 'reserves',
  anticipation_repayment: 'loans',
  transfer: 'transfers',
  transfer_reversal: 'transfers',
  connect_collection_transfer: 'transfers',
  platform_earning: 'platform',
  platform_earning_refund: 'platform',
  currency_conversion: 'fx',
  topup: 'bank',
  topup_reversal: 'bank',
  // A payout that failed comes back to the balance: the bank never got it.
  payout_reversal: 'bank',
  payout: 'payout',
  other_adjustment: 'adjustments',
  advance: 'adjustments',
  advance_funding: 'adjustments',
  climate_order_purchase: 'adjustments',
  climate_order_refund: 'adjustments',
  contribution: 'adjustments',
  revenue_share: 'adjustments',
  reward: 'adjustments',
  fee_credit_funding: 'fees',
  stripe_balance_payment_debit: 'adjustments',
  stripe_balance_payment_debit_reversal: 'adjustments',
  unreconciled_customer_funds: 'adjustments',
};
// The Itemized payout reconciliation report's default columns we read (payout_reconciliation.itemized.7).
export const STRIPE_COLUMNS = ['balance_transaction_id', 'created', 'available_on', 'currency', 'gross', 'fee', 'net', 'reporting_category', 'description', 'automatic_payout_id', 'automatic_payout_effective_at'];

// ---------- Shopify Payments: payout transactions CSV and transaction types ----------

// The CSV columns from Shopify's help ("Viewing and exporting your Shopify Payments payout details").
export const SHOPIFY_COLUMNS = ['Transaction Date', 'Type', 'Order', 'Card Brand', 'Card Source', 'Payout Status', 'Payout Date', 'Available On', 'Amount', 'Fee', 'Net'];
// Types from Shopify's ShopifyPaymentsTransactionType list, written in the CSV in lower case.
const SHOPIFY_EXACT = {
  charge: 'sales',
  charge_adjustment: 'sales',
  refund: 'refunds',
  refund_adjustment: 'refunds',
  refund_failure: 'refunds',
  dispute: 'disputes',
  dispute_reversal: 'disputes',
  dispute_withdrawal: 'disputes',
  chargeback_hold: 'disputes',
  chargeback_hold_release: 'disputes',
  chargeback_fee: 'fees',
  chargeback_fee_refund: 'fees',
  referral_fee: 'fees',
  referral_fee_tax: 'taxOnFees',
  marketplace_fee_credit: 'fees',
  marketplace_fee_credit_reversal: 'fees',
  billing_debit: 'fees',
  billing_debit_reversal: 'fees',
  application_fee_refund: 'fees',
  currency_conversion: 'fx',
  advance: 'adjustments',
  advance_funding: 'adjustments',
  payout: 'payout',
};
const SHOPIFY_PREFIX = [
  [/^chargeback_protection/, 'disputes'],
  [/^(reserved_funds|risk_)/, 'reserves'],
  [/^lending_/, 'loans'],
  [/^shipping_/, 'shipping'],
  [/^(customs_duty|import_tax)/, 'duties'],
  [/^(balance_transfer|channel_transfer|merchant_to_merchant)/, 'transfers'],
  [/^ach_bank_failure/, 'fees'],
];

function shopifyBucket(type) {
  const t = String(type).trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (SHOPIFY_EXACT[t]) return SHOPIFY_EXACT[t];
  for (const [re, b] of SHOPIFY_PREFIX) if (re.test(t)) return b;
  return 'adjustments';
}

// ---------- PayPal: Activity Download, Type is the T-code description ----------

export const PAYPAL_COLUMNS = ['Date', 'Time', 'TimeZone', 'Name', 'Type', 'Status', 'Currency', 'Gross', 'Fee', 'Net', 'Transaction ID', 'Reference Txn ID', 'Balance', 'Sales Tax', 'Balance Impact'];
// In the order tried: the first match wins. Each rule is named after the T-code families in
// PayPal's T-code reference (developer.paypal.com/reports/reference/t-codes).
const PAYPAL_RULES = [
  [/fee (refund|reversal)/i, 'fees'], // T1108, T1109
  [/(chargeback|dispute) fee/i, 'fees'], // T0106, T0114
  [/withdraw|auto-?sweep/i, 'payout'], // T0400-T0403 (T0502 ATM included)
  [/bank deposit|funding|credit card deposit|reversal of ach/i, 'bank'], // T0300-T0303, T0700-T0701, T1101, T1104
  [/chargeback|dispute|payment reversal|pacman/i, 'disputes'], // T1106, T1110, T1111, T1201-T1208
  [/reserve|hold|release/i, 'reserves'], // T1500-T1503, T2101-T2123
  [/currency conversion/i, 'fx'], // T0200-T0202
  [/withholding/i, 'withholding'], // T2301
  [/refund/i, 'refunds'], // T1107, T1120
  [/fee/i, 'fees'], // T0100-T0118
  [/transfer|consolidation/i, 'transfers'], // T2000-T2003
];
function paypalBucket(type, gross) {
  for (const [re, b] of PAYPAL_RULES) if (re.test(type)) return b;
  // Payments received and sent (T0000-T0023): money in is a sale, money out is a payment sent.
  return gross >= 0 ? 'sales' : 'spent';
}

// ---------- Square: Payouts API payout entries, ActivityType ----------

export const SQUARE_TYPES = {
  CHARGE: 'sales',
  REFUND: 'refunds',
  DISPUTE: 'disputes',
  OPEN_DISPUTE: 'disputes',
  FEE: 'fees',
  PROCESSING_FEE: 'fees',
  PROCESSING_FEE_REFUND: 'fees',
  UNDO_PROCESSING_FEE_REFUND: 'fees',
  DEPOSIT_FEE: 'fees',
  DEPOSIT_FEE_REVERSED: 'fees',
  THIRD_PARTY_FEE: 'fees',
  THIRD_PARTY_FEE_REFUND: 'fees',
  PAID_SERVICE_FEE: 'fees',
  PAID_SERVICE_FEE_REFUND: 'fees',
  SUBSCRIPTION_FEE: 'fees',
  SUBSCRIPTION_FEE_PAID_REFUND: 'fees',
  SUBSCRIPTION_FEE_REFUND: 'fees',
  LOCAL_OFFERS_FEE: 'fees',
  GIFT_CARD_LOAD_FEE: 'fees',
  GIFT_CARD_LOAD_FEE_REFUND: 'fees',
  UNDO_GIFT_CARD_LOAD_FEE_REFUND: 'fees',
  FREE_PROCESSING: 'fees',
  TAX_ON_FEE: 'taxOnFees',
  RESERVE_HOLD: 'reserves',
  RESERVE_RELEASE: 'reserves',
  HOLD_ADJUSTMENT: 'reserves',
  RELEASE_ADJUSTMENT: 'reserves',
  SQUARE_CAPITAL_PAYMENT: 'loans',
  SQUARE_CAPITAL_REVERSED_PAYMENT: 'loans',
  CREDIT_CARD_REPAYMENT: 'loans',
  CREDIT_CARD_REPAYMENT_REVERSED: 'loans',
  PERCENTAGE_PROCESSING_ENROLLMENT: 'loans',
  PERCENTAGE_PROCESSING_DEACTIVATION: 'loans',
  PERCENTAGE_PROCESSING_REPAYMENT: 'loans',
  PERCENTAGE_PROCESSING_REPAYMENT_REVERSED: 'loans',
  AUTOMATIC_SAVINGS: 'transfers',
  AUTOMATIC_SAVINGS_REVERSED: 'transfers',
  BALANCE_FOLDERS_TRANSFER: 'transfers',
  BALANCE_FOLDERS_TRANSFER_REVERSED: 'transfers',
  MONEY_TRANSFER: 'transfers',
  MONEY_TRANSFER_REVERSAL: 'transfers',
  GIFT_CARD_POOL_TRANSFER: 'transfers',
  GIFT_CARD_POOL_TRANSFER_REVERSED: 'transfers',
  AUTOMATIC_BITCOIN_CONVERSIONS: 'transfers',
  AUTOMATIC_BITCOIN_CONVERSIONS_REVERSED: 'transfers',
  SQUARE_PAYROLL_TRANSFER: 'transfers',
  SQUARE_PAYROLL_TRANSFER_REVERSED: 'transfers',
  APP_FEE_REVENUE: 'platform',
  APP_FEE_REFUND: 'platform',
  RETURNED_PAYOUT: 'bank',
  PAYOUT: 'payout',
};

// ---------- a custom CSV: any processor, with the columns named by the user ----------

const CUSTOM_RULES = [
  [/withdraw|payout|deposit to bank|transfer to bank/i, 'payout'],
  [/(chargeback|dispute) fee/i, 'fees'],
  [/chargeback|dispute/i, 'disputes'],
  [/refund|return/i, 'refunds'],
  [/reserve|hold|release/i, 'reserves'],
  [/tax/i, 'taxOnFees'],
  [/fee/i, 'fees'],
  [/conversion|currency/i, 'fx'],
  [/loan|capital|advance/i, 'loans'],
  [/transfer/i, 'transfers'],
  [/sale|charge|payment|order/i, 'sales'],
];
function customBucket(type, gross) {
  for (const [re, b] of CUSTOM_RULES) if (re.test(type)) return b;
  return gross >= 0 && !type ? 'sales' : 'adjustments';
}

// ---------- the fee check: each processor's published standard US rates ----------

// Read on each processor's own US pricing page (data/sources.json). A rate applies per payment:
// percent of the payment plus a fixed amount, rounded to the cent. Shopify Payments rates depend on
// the plan and are shown only in the store's admin, so there is no Shopify preset.
export const STANDARD_RATES = {
  'stripe-card': { processor: 'stripe', label: 'Stripe, domestic cards', bps: 290, fixed: 30, source: 'stripePricing' },
  'stripe-card-international': { processor: 'stripe', label: 'Stripe, international cards (2.9% + 1.5%)', bps: 440, fixed: 30, source: 'stripePricing' },
  'paypal-checkout': { processor: 'paypal', label: 'PayPal Checkout', bps: 349, fixed: 49, source: 'paypalFees' },
  'paypal-cards': { processor: 'paypal', label: 'PayPal standard credit and debit card payments', bps: 299, fixed: 49, source: 'paypalFees' },
  'square-in-person': { processor: 'square', label: 'Square Free plan, tap, dip or swipe', bps: 260, fixed: 15, source: 'squarePricing' },
  'square-online': { processor: 'square', label: 'Square Free plan, online', bps: 330, fixed: 30, source: 'squarePricing' },
  'square-online-plus': { processor: 'square', label: 'Square Plus or Premium, online', bps: 290, fixed: 30, source: 'squarePricing' },
};

// ---------- CSV ----------

// RFC 4180 records: quoted fields with doubled quotes and line breaks, CRLF, LF or CR line ends.
export function parseCsv(text, delimiter = ',') {
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
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
}

// The separator that gives the header line the most fields: comma, tab or semicolon.
export function sniffDelimiter(text) {
  const first = text.split(/\r?\n|\r/, 1)[0] ?? '';
  let best = ',';
  let most = 0;
  for (const d of [',', '\t', ';']) {
    const n = first.split(d).length;
    if (n > most) { most = n; best = d; }
  }
  return best;
}

const norm = (h) => String(h).replace(/^﻿/, '').trim().toLowerCase().replace(/[\s_]+/g, ' ');

// ---------- money ----------

const DIGITS_CACHE = new Map();
// Decimal places of a currency, from the platform's ISO 4217 data (Intl). Unknown codes: 2.
export function decimalsOf(currency) {
  const c = String(currency || 'USD').toUpperCase();
  if (DIGITS_CACHE.has(c)) return DIGITS_CACHE.get(c);
  let d = 2;
  try { d = new Intl.NumberFormat('en-US', { style: 'currency', currency: c }).resolvedOptions().maximumFractionDigits; } catch { d = 2; }
  DIGITS_CACHE.set(c, d);
  return d;
}

// A written amount ("1,234.56", "-3.20", "(12.00)", "$5", "1.234,56") in minor units, exactly.
// Blank is null. Anything else that is not a number is an error naming the value.
export function toMinor(value, places = 2) {
  if (value === null || value === undefined) return null;
  let s = String(value).trim();
  if (s === '' || s === '-' || s === '--') return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1).trim(); }
  s = s.replace(/[−‒–]/g, '-');
  if (s.startsWith('-')) { neg = !neg; s = s.slice(1); }
  if (s.endsWith('-')) { neg = !neg; s = s.slice(0, -1); }
  s = s.replace(/^[A-Za-z]{3}\s*/, '').replace(/\s*[A-Za-z]{3}$/, '').replace(/^[^\d.,]+/, '').replace(/[\s ']/g, '');
  if (s.startsWith('-')) { neg = !neg; s = s.slice(1); }
  if (!/^[\d.,]+$/.test(s) || !/\d/.test(s)) return NaN;
  // Decimal comma: "1.234,56" or "12,5" (one or two digits after a single comma).
  const commaDecimal = /^\d{1,3}(\.\d{3})+,\d+$/.test(s) || /^\d+,\d{1,2}$/.test(s);
  if (commaDecimal) s = s.replace(/\./g, '').replace(',', '.');
  else s = s.replace(/,/g, '');
  if ((s.match(/\./g) ?? []).length > 1) return NaN;
  const [int, frac = ''] = s.split('.');
  if (frac.length > places && /[1-9]/.test(frac.slice(places))) return NaN;
  const minor = Number(int || '0') * 10 ** places + Number((frac + '0'.repeat(places)).slice(0, places) || '0');
  if (!Number.isSafeInteger(minor)) return NaN;
  return neg ? -minor : minor;
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

const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
const pad = (n) => String(n).padStart(2, '0');
// A date in any of the forms these exports use, as YYYY-MM-DD; null if blank or unreadable.
export function isoDate(value, order = 'mdy') {
  const s = String(value ?? '').trim();
  if (!s) return null;
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/.exec(s);
  if (m) {
    const [a, b] = [Number(m[1]), Number(m[2])];
    const [mo, d] = order === 'dmy' ? [b, a] : [a, b];
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
    return `${m[3]}-${pad(mo)}-${pad(d)}`;
  }
  m = /^(\d{1,2})[\s-]([A-Za-z]{3})[a-z]*[\s-,]+(\d{4})/.exec(s);
  if (m && MONTHS[m[2].toLowerCase()]) return `${m[3]}-${pad(MONTHS[m[2].toLowerCase()])}-${pad(Number(m[1]))}`;
  m = /^([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/.exec(s);
  if (m && MONTHS[m[1].toLowerCase()]) return `${m[3]}-${pad(MONTHS[m[1].toLowerCase()])}-${pad(Number(m[2]))}`;
  return null;
}
// Which order a column of slash dates proves: a first part above 12 proves day first.
function slashOrder(values) {
  let dmy = 0;
  let mdy = 0;
  for (const v of values) {
    const m = /^(\d{1,2})[/.-](\d{1,2})[/.-]\d{4}/.exec(String(v ?? '').trim());
    if (!m) continue;
    if (Number(m[1]) > 12) dmy++;
    if (Number(m[2]) > 12) mdy++;
  }
  return dmy && !mdy ? 'dmy' : 'mdy';
}

// ---------- reading a file ----------

// Which processor wrote this file, from its header line (or JSON shape for Square).
export function detect(text) {
  const t = text.replace(/^﻿/, '').trimStart();
  if (t.startsWith('{') || t.startsWith('[')) return 'square';
  const header = parseCsv(t.split(/\r?\n|\r/, 1)[0] ?? '', sniffDelimiter(t)).flat().map(norm);
  const has = (...names) => names.every((n) => header.includes(norm(n)));
  if (has('balance_transaction_id', 'reporting_category', 'gross', 'fee', 'net')) return 'stripe';
  if (has('Transaction Date', 'Type', 'Payout Date', 'Amount', 'Fee', 'Net')) return 'shopify';
  if (has('Gross', 'Fee', 'Net', 'Type') && (has('Balance Impact') || has('Transaction ID') || has('TimeZone'))) return 'paypal';
  return null;
}

function table(text) {
  const t = text.replace(/^﻿/, '');
  const rows = parseCsv(t, sniffDelimiter(t));
  if (rows.length < 1) throw new PayoutError('The file is empty.');
  if (rows.length - 1 > LIMITS.rows) throw new PayoutError(`The file has ${rows.length - 1} rows; at most ${LIMITS.rows.toLocaleString('en-US')} at a time. Split it by month.`);
  const header = rows[0].map(norm);
  const col = (...names) => {
    for (const n of names) { const i = header.indexOf(norm(n)); if (i >= 0) return i; }
    return -1;
  };
  return { header, body: rows.slice(1).filter((r) => r.some((v) => String(v).trim() !== '')), col };
}

function amountOf(raw, places, line, column) {
  const v = toMinor(raw, places);
  if (Number.isNaN(v)) throw new PayoutError(`Line ${line}: "${raw}" in ${column} is not an amount.`);
  return v;
}

// A row in the one shape every processor is read into.
//   bucket, type (as written), gross, fee (positive = charged), net (all minor units), currency,
//   date (YYYY-MM-DD), payout (group key), payoutDate, ref, line (in the file), salesTax, withheldTax
function readStripe(text) {
  const { body, col } = table(text);
  const c = {
    id: col('balance_transaction_id'), created: col('created', 'created_utc'), currency: col('currency'), gross: col('gross'), fee: col('fee'), net: col('net'),
    category: col('reporting_category'), description: col('description'), payout: col('automatic_payout_id'), payoutAt: col('automatic_payout_effective_at', 'automatic_payout_effective_at_utc'),
    withheld: col('withheld_tax'),
  };
  const out = [];
  body.forEach((r, i) => {
    const line = i + 2;
    const currency = String(r[c.currency] ?? 'usd').trim().toUpperCase() || 'USD';
    const places = decimalsOf(currency);
    const category = String(r[c.category] ?? '').trim().toLowerCase();
    const bucket = STRIPE_CATEGORIES[category];
    out.push({
      line, currency, type: category || '(blank)', bucket: bucket ?? 'adjustments', known: Boolean(bucket),
      gross: amountOf(r[c.gross], places, line, 'gross') ?? 0,
      fee: amountOf(r[c.fee], places, line, 'fee') ?? 0,
      net: c.net >= 0 ? amountOf(r[c.net], places, line, 'net') : null,
      withheldTax: c.withheld >= 0 ? amountOf(r[c.withheld], places, line, 'withheld_tax') ?? 0 : 0,
      salesTax: 0,
      date: isoDate(r[c.created]),
      payout: c.payout >= 0 ? String(r[c.payout] ?? '').trim() : '',
      payoutDate: c.payoutAt >= 0 ? isoDate(r[c.payoutAt]) : null,
      ref: String(r[c.id] ?? '').trim(),
      description: c.description >= 0 ? String(r[c.description] ?? '').trim() : '',
      feeSign: 1,
    });
  });
  return out;
}

function readShopify(text, opts) {
  const { body, col } = table(text);
  const c = {
    date: col('Transaction Date'), type: col('Type'), order: col('Order'), status: col('Payout Status'), payoutDate: col('Payout Date'),
    amount: col('Amount'), fee: col('Fee'), net: col('Net'), currency: col('Currency'), payoutId: col('Payout ID'),
  };
  const currency = (opts.currency ?? 'USD').toUpperCase();
  return body.map((r, i) => {
    const line = i + 2;
    const cur = c.currency >= 0 && String(r[c.currency] ?? '').trim() ? String(r[c.currency]).trim().toUpperCase() : currency;
    const places = decimalsOf(cur);
    const type = String(r[c.type] ?? '').trim();
    const status = c.status >= 0 ? String(r[c.status] ?? '').trim().toLowerCase() : '';
    const pDate = isoDate(r[c.payoutDate]);
    const pending = status === 'pending';
    return {
      line, currency: cur, type: type || '(blank)', bucket: shopifyBucket(type), known: true,
      gross: amountOf(r[c.amount], places, line, 'Amount') ?? 0,
      fee: amountOf(r[c.fee], places, line, 'Fee') ?? 0,
      net: c.net >= 0 ? amountOf(r[c.net], places, line, 'Net') : null,
      withheldTax: 0, salesTax: 0,
      date: isoDate(r[c.date]),
      payout: pending ? 'pending' : (c.payoutId >= 0 && String(r[c.payoutId] ?? '').trim()) || (pDate ? `payout-${pDate}` : ''),
      payoutDate: pending ? null : pDate,
      pending,
      ref: c.order >= 0 ? String(r[c.order] ?? '').trim() : '',
      description: '',
      feeSign: 1,
    };
  });
}

const PAYPAL_SKIP_STATUS = new Set(['pending', 'denied', 'voided', 'expired', 'canceled', 'cancelled', 'created', 'unverified']);
function readPaypal(text, opts) {
  const { body, col } = table(text);
  const c = {
    date: col('Date'), time: col('Time'), type: col('Type'), status: col('Status'), currency: col('Currency'), gross: col('Gross'), fee: col('Fee'), net: col('Net'),
    id: col('Transaction ID'), balance: col('Balance'), salesTax: col('Sales Tax'), impact: col('Balance Impact'), name: col('Name'),
  };
  const order = opts.dateOrder ?? slashOrder(body.map((r) => r[c.date]));
  const out = [];
  const skipped = [];
  body.forEach((r, i) => {
    const line = i + 2;
    const impact = c.impact >= 0 ? String(r[c.impact] ?? '').trim().toLowerCase() : null;
    const status = c.status >= 0 ? String(r[c.status] ?? '').trim().toLowerCase() : '';
    const type = String(r[c.type] ?? '').trim();
    if (impact === 'memo' || (impact === null && PAYPAL_SKIP_STATUS.has(status))) { skipped.push({ line, type, reason: impact === 'memo' ? 'memo row (no effect on the balance)' : `status ${status}` }); return; }
    const currency = String(r[c.currency] ?? 'USD').trim().toUpperCase() || 'USD';
    const places = decimalsOf(currency);
    const gross = amountOf(r[c.gross], places, line, 'Gross') ?? 0;
    const feeRaw = amountOf(r[c.fee], places, line, 'Fee') ?? 0;
    const net = c.net >= 0 ? amountOf(r[c.net], places, line, 'Net') : null;
    // PayPal writes fees as negative amounts in most files; the Net column settles which way round.
    const feeSign = net !== null ? (gross + feeRaw === net && feeRaw !== 0 ? -1 : 1) : (feeRaw < 0 ? -1 : 1);
    out.push({
      line, currency, type: type || '(blank)', bucket: paypalBucket(type, gross), known: true,
      gross, fee: feeSign * feeRaw, net,
      withheldTax: 0,
      salesTax: c.salesTax >= 0 ? amountOf(r[c.salesTax], places, line, 'Sales Tax') ?? 0 : 0,
      date: isoDate(r[c.date], order),
      time: c.time >= 0 ? String(r[c.time] ?? '').trim() : '',
      balance: c.balance >= 0 ? amountOf(r[c.balance], places, line, 'Balance') : null,
      payout: `paypal-${currency}`,
      payoutDate: null,
      ref: c.id >= 0 ? String(r[c.id] ?? '').trim() : '',
      description: c.name >= 0 ? String(r[c.name] ?? '').trim() : '',
      feeSign,
    });
  });
  return { rows: out, skipped, dateOrder: order };
}

function readSquare(text) {
  let data;
  try { data = JSON.parse(text.replace(/^﻿/, '')); } catch (e) { throw new PayoutError(`The file looks like JSON but cannot be read: ${e.message}.`); }
  const entries = Array.isArray(data) ? data : data.payout_entries ?? data.entries;
  if (!Array.isArray(entries)) throw new PayoutError('A Square file is the JSON from the Payouts API: an object with "payout_entries" (ListPayoutEntries), or a list of payout entries.');
  if (entries.length > LIMITS.rows) throw new PayoutError(`The file has ${entries.length} entries; at most ${LIMITS.rows.toLocaleString('en-US')} at a time.`);
  const payouts = new Map();
  for (const p of (Array.isArray(data.payouts) ? data.payouts : [])) if (p?.id) payouts.set(p.id, p);
  const money = (m, i, f) => {
    if (m === undefined || m === null) return { amount: 0, currency: null };
    if (typeof m !== 'object' || !Number.isSafeInteger(m.amount)) throw new PayoutError(`Entry ${i + 1}: ${f}.amount must be a whole number in the currency's smallest unit (cents for USD).`);
    return { amount: m.amount, currency: m.currency_code ?? m.currency ?? null };
  };
  const rows = entries.map((e, i) => {
    if (!e || typeof e !== 'object') throw new PayoutError(`Entry ${i + 1} is not an object.`);
    const g = money(e.gross_amount_money, i, 'gross_amount_money');
    const f = money(e.fee_amount_money, i, 'fee_amount_money');
    const n = e.net_amount_money === undefined ? null : money(e.net_amount_money, i, 'net_amount_money');
    const type = String(e.type ?? '').toUpperCase();
    return {
      line: i + 1, currency: String(g.currency ?? n?.currency ?? 'USD').toUpperCase(), type: type || '(blank)', bucket: SQUARE_TYPES[type] ?? 'adjustments', known: Boolean(SQUARE_TYPES[type]),
      gross: g.amount, fee: f.amount, net: n ? n.amount : null, withheldTax: 0, salesTax: 0,
      date: isoDate(e.effective_at), payout: String(e.payout_id ?? ''), payoutDate: null, ref: String(e.id ?? ''), description: '', feeSign: 1,
    };
  });
  return { rows, payouts };
}

// A CSV from any processor, read through the columns the user names. Amount (gross) is required;
// fee and net are optional. feeSign: 'positive' (a fee of 3.20 is charged) or 'negative' ("-3.20").
function readCustom(text, map, opts) {
  const { body, col } = table(text);
  const need = (k, label) => {
    const i = map[k] ? col(map[k]) : -1;
    if (map[k] && i < 0) throw new PayoutError(`There is no column "${map[k]}" in the file for ${label}.`, `columns.${k}`);
    return i;
  };
  const c = { gross: need('gross', 'the amount'), fee: need('fee', 'the fee'), net: need('net', 'the net'), type: need('type', 'the type'), date: need('date', 'the date'), payout: need('payout', 'the payout'), currency: need('currency', 'the currency'), ref: need('ref', 'the reference') };
  if (c.gross < 0 && c.net < 0) throw new PayoutError('Name the column that holds the amount (gross) or the net.', 'columns.gross');
  const order = opts.dateOrder ?? slashOrder(c.date >= 0 ? body.map((r) => r[c.date]) : []);
  return body.map((r, i) => {
    const line = i + 2;
    const currency = c.currency >= 0 && String(r[c.currency] ?? '').trim() ? String(r[c.currency]).trim().toUpperCase() : (opts.currency ?? 'USD').toUpperCase();
    const places = decimalsOf(currency);
    const feeRaw = c.fee >= 0 ? amountOf(r[c.fee], places, line, map.fee) ?? 0 : 0;
    const fee = map.feeSign === 'negative' ? -feeRaw : feeRaw;
    const net = c.net >= 0 ? amountOf(r[c.net], places, line, map.net) : null;
    const gross = c.gross >= 0 ? amountOf(r[c.gross], places, line, map.gross) ?? 0 : (net ?? 0) + fee;
    const type = c.type >= 0 ? String(r[c.type] ?? '').trim() : '';
    const date = c.date >= 0 ? isoDate(r[c.date], order) : null;
    const payout = c.payout >= 0 ? String(r[c.payout] ?? '').trim() : '';
    return {
      line, currency, type: type || '(none)', bucket: customBucket(type, gross), known: true,
      gross, fee, net, withheldTax: 0, salesTax: 0, date, payout: payout || 'file', payoutDate: null,
      ref: c.ref >= 0 ? String(r[c.ref] ?? '').trim() : '', description: '', feeSign: 1,
    };
  });
}

// ---------- the split ----------

const emptyTotals = () => Object.fromEntries(BUCKET_IDS.map((b) => [b, 0]));

// Every row's money placed in its buckets. Sum of the effects = the row's net.
function effects(row) {
  const e = [];
  const gross = row.gross - row.salesTax;
  if (row.salesTax) e.push(['salesTax', row.salesTax]);
  e.push([row.bucket, gross]);
  if (row.fee) {
    // Stripe's withheld_tax "is already included within the fee column".
    if (row.withheldTax) e.push(['taxOnFees', -row.withheldTax]);
    e.push(['fees', -(row.fee - row.withheldTax)]);
  }
  return e;
}

const monthOf = (iso) => (iso ? iso.slice(0, 7) : null);

function groupRows(processor, rows, extra) {
  const groups = new Map();
  for (const row of rows) {
    const key = `${row.payout || 'file'}|${row.currency}`;
    if (!groups.has(key)) groups.set(key, { key, payout: row.payout || 'file', currency: row.currency, rows: [] });
    groups.get(key).rows.push(row);
  }
  const out = [];
  for (const g of groups.values()) {
    const totals = emptyTotals();
    let net = 0;
    let moved = 0; // payout rows: money sent to (negative) or taken from (positive) the bank
    let mismatched = 0;
    let unknown = 0;
    const months = new Set();
    let first = null;
    let last = null;
    let salesCount = 0;
    let salesGross = 0;
    let salesFees = 0;
    for (const r of g.rows) {
      const computed = r.gross - r.fee;
      if (r.net !== null && r.net !== computed) mismatched++;
      if (!r.known) unknown++;
      if (r.bucket === 'payout') {
        moved += r.net ?? computed;
        // A PayPal withdrawal dates the end of the period it closes.
        if (processor === 'paypal' && r.date && (!last || r.date > last)) last = r.date;
        continue;
      }
      for (const [b, v] of effects(r)) totals[b] += v;
      net += computed;
      if (r.date) {
        months.add(monthOf(r.date));
        if (!first || r.date < first) first = r.date;
        if (!last || r.date > last) last = r.date;
      }
      if (r.bucket === 'sales' && r.gross > 0) { salesCount++; salesGross += r.gross; salesFees += r.fee; }
    }
    const payoutDates = [...new Set(g.rows.map((r) => r.payoutDate).filter(Boolean))].sort();
    const isBalance = processor === 'paypal';
    const pending = g.payout === 'pending';
    let deposit = null;
    let depositFrom = null;
    if (moved !== 0) { deposit = -moved; depositFrom = isBalance ? 'withdrawals' : 'payout rows'; }
    const sq = extra.squarePayouts?.get(g.payout);
    if (sq && sq.amount_money && Number.isSafeInteger(sq.amount_money.amount)) { deposit = sq.amount_money.amount; depositFrom = 'Square payout'; }
    const given = extra.deposits?.[g.payout];
    if (given !== undefined && given !== null) {
      const v = toMinor(given, decimalsOf(g.currency));
      if (Number.isNaN(v) || v === null) throw new PayoutError(`The deposit for ${g.payout} ("${given}") is not an amount.`, 'deposits');
      deposit = v; depositFrom = 'you';
    }
    const date = payoutDates.at(-1) ?? (sq?.arrival_date ?? null) ?? last;
    // PayPal is a balance: what is left after withdrawals stays in PayPal. The running Balance
    // column, where present, proves it: first balance before its row + all nets = last balance.
    let balance = null;
    if (isBalance) {
      const withBal = g.rows.filter((r) => r.balance !== null && r.balance !== undefined);
      if (withBal.length) {
        const sorted = [...withBal].sort((a, b) => (`${a.date} ${a.time}` < `${b.date} ${b.time}` ? -1 : `${a.date} ${a.time}` > `${b.date} ${b.time}` ? 1 : b.line - a.line));
        // Files list newest first; within a second, the later line is the earlier event.
        const start = sorted[0].balance - (sorted[0].net ?? sorted[0].gross - sorted[0].fee);
        const end = sorted.at(-1).balance;
        const all = g.rows.reduce((s, r) => s + (r.net ?? r.gross - r.fee), 0);
        balance = { start, end, change: all, ties: start + all === end };
      }
    }
    const difference = !isBalance && deposit !== null ? deposit - net : null;
    out.push({
      id: g.payout, currency: g.currency, kind: isBalance ? 'balance' : pending ? 'pending' : 'payout', date, from: first, to: last,
      months: [...months].filter(Boolean).sort(), rows: g.rows.length, totals, net, deposit, depositFrom, difference,
      withdrawals: isBalance ? -moved : 0, balance, mismatched, unknown,
      sales: { count: salesCount, gross: salesGross, fees: salesFees },
    });
  }
  return out.sort((a, b) => (a.kind === 'pending') - (b.kind === 'pending') || String(a.date ?? '').localeCompare(String(b.date ?? '')) || a.id.localeCompare(b.id) || a.currency.localeCompare(b.currency));
}

// Reads a file into rows. text: the file as text. opts: { processor?, columns? (custom), currency?, dateOrder? }
export function read(text, opts = {}) {
  if (typeof text !== 'string' || !text.trim()) throw new PayoutError('The file is empty.');
  if (text.length > LIMITS.bytes) throw new PayoutError(`The file is over ${LIMITS.bytes / 1e6} MB; split it by month.`);
  const found = detect(text);
  let processor = opts.processor ?? (opts.columns ? 'custom' : found);
  if (!processor) {
    throw new PayoutError('This file is not one of the exports read here: Stripe\'s itemized payout reconciliation CSV, Shopify Payments\' payout transactions CSV, PayPal\'s Activity Download CSV, or Square\'s payout entries JSON. For any other CSV, name its columns (amount, fee, net, type, date, payout).');
  }
  if (opts.processor && opts.processor !== 'custom' && found && found !== opts.processor) {
    throw new PayoutError(`This looks like a ${PROCESSOR_NAMES[found]} file, not ${PROCESSOR_NAMES[opts.processor]}.`, 'processor');
  }
  if (opts.processor && opts.processor !== 'custom' && !found) {
    throw new PayoutError(`This is not ${PROCESSOR_NAMES[opts.processor]}'s export: its headings are not the ones ${PROCESSOR_NAMES[opts.processor]} documents. Name the columns instead.`, 'processor');
  }
  let rows;
  let skipped = [];
  let squarePayouts = null;
  let dateOrder = null;
  if (processor === 'stripe') rows = readStripe(text);
  else if (processor === 'shopify') rows = readShopify(text, opts);
  else if (processor === 'paypal') ({ rows, skipped, dateOrder } = readPaypal(text, opts));
  else if (processor === 'square') ({ rows, payouts: squarePayouts } = readSquare(text));
  else {
    if (!opts.columns) throw new PayoutError('Name the columns of this file: at least the amount (gross) or the net.', 'columns');
    rows = readCustom(text, opts.columns, opts);
    processor = 'custom';
  }
  if (!rows.length) throw new PayoutError('The file has headings but no transactions.');
  return { processor, rows, skipped, squarePayouts, dateOrder };
}

// The fee a published rate would charge on these payments: per payment, percent plus fixed,
// rounded half up to the cent.
export function expectedFee(payments, rate) {
  let total = 0;
  for (const g of payments) total += Math.round((g * rate.bps) / 10_000) + rate.fixed;
  return total;
}

// The split of a file: totals per payout and currency, the proof, and the words.
//   opts: read() options plus deposits { payoutId: "123.45" }, rate (a STANDARD_RATES id or { bps, fixed })
export function split(text, opts = {}) {
  const { processor, rows, skipped, squarePayouts, dateOrder } = read(text, opts);
  const groups = groupRows(processor, rows, { deposits: opts.deposits, squarePayouts });
  const warnings = [];
  const mismatched = groups.reduce((s, g) => s + g.mismatched, 0);
  if (mismatched) warnings.push(`${mismatched} ${mismatched === 1 ? 'row says' : 'rows say'} a net that is not the gross less the fee; the gross and fee were used.`);
  const unknownTypes = [...new Set(rows.filter((r) => !r.known).map((r) => r.type))];
  if (unknownTypes.length) warnings.push(`Types not in ${PROCESSOR_NAMES[processor]}'s published list, booked as other adjustments: ${unknownTypes.join(', ')}.`);
  for (const g of groups) {
    if (g.months.length > 1 && g.kind !== 'balance') warnings.push(`Payout ${g.id} holds activity from ${g.months.join(' and ')}: it spans a month end.`);
    if (g.difference) warnings.push(`Payout ${g.id}: the rows add up to ${money(g.net, g.currency)} but the deposit is ${money(g.deposit, g.currency)}, ${money(g.difference, g.currency)} apart.`);
    if (g.net < 0 && g.kind === 'payout') warnings.push(`Payout ${g.id} is negative (${money(g.net, g.currency)}): the processor takes this from your bank or from later payouts.`);
    if (g.balance && !g.balance.ties) warnings.push(`PayPal ${g.currency}: the Balance column does not run from ${money(g.balance.start, g.currency)} to ${money(g.balance.end, g.currency)} with these rows; some rows may be missing from the download.`);
  }
  if (processor === 'stripe' && !rows.some((r) => r.payout)) warnings.push('No automatic_payout_id in this file: it is read as one batch. The payout reconciliation report covers automatic payouts only; Stripe cannot say which transactions are in an instant payout.');
  const salesTaxNote = processor === 'paypal' ? rows.some((r) => r.salesTax) : false;

  let rate = null;
  if (opts.rate) {
    rate = typeof opts.rate === 'string' ? STANDARD_RATES[opts.rate] : opts.rate;
    if (!rate) throw new PayoutError(`Rate must be one of ${Object.keys(STANDARD_RATES).join(', ')}, or { bps, fixed }.`, 'rate');
  }
  const feeCheck = rate ? groups.filter((g) => g.kind !== 'pending' && g.sales.count).map((g) => {
    const payments = rows.filter((r) => `${r.payout || 'file'}` === g.id && r.currency === g.currency && r.bucket === 'sales' && r.gross > 0).map((r) => r.gross);
    const expected = expectedFee(payments, rate);
    return { id: g.id, currency: g.currency, payments: payments.length, charged: g.sales.fees, expected, over: g.sales.fees - expected };
  }) : null;

  const result = { processor, processorName: PROCESSOR_NAMES[processor], groups, skipped, warnings, dateOrder, salesTaxNote, feeCheck, rate: rate ? { label: rate.label ?? 'your rate', bps: rate.bps, fixed: rate.fixed } : null };
  result.answer = answerOf(result);
  return result;
}

// The number of payouts a file holds, for the price: pending money and a PayPal balance count once each.
export function countPayouts(text, opts = {}) {
  const { processor, rows, squarePayouts } = read(text, opts);
  return groupRows(processor, rows, { squarePayouts }).length;
}

const signedMoney = (v, c) => (v < 0 ? `- ${money(-v, c)}` : `+ ${money(v, c)}`);
const SENTENCE_ORDER = ['sales', 'salesTax', 'refunds', 'disputes', 'fees', 'taxOnFees', 'reserves', 'loans', 'transfers', 'platform', 'shipping', 'duties', 'fx', 'withholding', 'spent', 'bank', 'adjustments'];
const WORD = { sales: 'sales', salesTax: 'sales tax', refunds: 'refunds', disputes: 'chargebacks', fees: 'fees', taxOnFees: 'tax on fees', reserves: 'reserves', loans: 'loan repayments', transfers: 'transfers', platform: 'platform earnings', shipping: 'shipping labels', duties: 'duties', fx: 'currency conversion', withholding: 'tax withheld', spent: 'payments sent', bank: 'bank movements', adjustments: 'adjustments' };

export function equation(totals, currency) {
  const parts = SENTENCE_ORDER.filter((b) => totals[b]).map((b, i) => (i === 0 && totals[b] > 0 ? `${money(totals[b], currency)} ${WORD[b]}` : `${signedMoney(totals[b], currency)} ${WORD[b]}`));
  return parts.join(' ') || money(0, currency);
}

const longDate = (iso) => {
  if (!iso) return 'no date';
  const [y, m, d] = iso.split('-').map(Number);
  return `${['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][m - 1]} ${d}, ${y}`;
};
export { longDate };

function answerOf(r) {
  const paid = r.groups.filter((g) => g.kind === 'payout');
  const name = r.processorName;
  if (r.groups.length === 1) {
    const g = r.groups[0];
    if (g.kind === 'balance') {
      return `${name} ${g.currency} activity from ${longDate(g.from)} to ${longDate(g.to)}: ${equation(g.totals, g.currency)} = ${money(g.net, g.currency)} net, of which ${money(g.withdrawals, g.currency)} was withdrawn to the bank${g.balance ? ` and the balance went from ${money(g.balance.start, g.currency)} to ${money(g.balance.end, g.currency)}${g.balance.ties ? ', to the cent' : ''}` : ''}.`;
    }
    const tie = g.deposit === null ? '' : g.difference === 0 ? ', and it ties to the deposit to the cent' : `; the deposit is ${money(g.deposit, g.currency)}, ${money(g.difference, g.currency)} apart`;
    const what = g.kind === 'pending' ? `${name} pending balance` : `Your ${name} payout of ${money(g.net, g.currency)}${g.date ? ` on ${longDate(g.date)}` : ''}`;
    return `${what} = ${equation(g.totals, g.currency)}${tie}.`;
  }
  const byCur = new Map();
  for (const g of r.groups) {
    if (!byCur.has(g.currency)) byCur.set(g.currency, { totals: emptyTotals(), net: 0, n: 0 });
    const t = byCur.get(g.currency);
    for (const b of BUCKET_IDS) t.totals[b] += g.totals[b];
    t.net += g.net; t.n++;
  }
  const dated = paid.map((g) => g.date).filter(Boolean).sort();
  const span = dated.length ? ` from ${longDate(dated[0])} to ${longDate(dated.at(-1))}` : '';
  const pend = r.groups.some((g) => g.kind === 'pending') ? ' (pending money included)' : '';
  const sums = [...byCur.entries()].map(([c, t]) => `${money(t.net, c)} = ${equation(t.totals, c)}`).join('; ');
  const ties = r.groups.filter((g) => g.deposit !== null);
  const tieWords = ties.length ? ` ${ties.filter((g) => g.difference === 0).length} of ${ties.length} with a known deposit tie to the cent.` : '';
  return `${r.groups.length} ${name} ${paid.length === r.groups.length ? 'payouts' : 'groups'}${span}${pend}: ${sums}.${tieWords}`;
}

// ---------- the journal ----------

export function defaultAccounts(processor) {
  const a = Object.fromEntries(BUCKETS.filter((b) => b.account).map((b) => [b.id, b.account]));
  a.clearing = CLEARING[processor] ?? CLEARING.custom;
  a.bank = 'Checking';
  return a;
}

// One balanced journal per payout (per currency): each bucket to its account, against the clearing
// account. With transfer, a second journal moves the deposit from clearing to the bank (skip it when
// the bank feed records the deposit, or it is booked twice).
export function journals(result, { accounts = {}, transfer = false } = {}) {
  const acct = { ...defaultAccounts(result.processor), ...accounts };
  const out = [];
  for (const g of result.groups) {
    const byAccount = new Map();
    const add = (name, v) => byAccount.set(name, (byAccount.get(name) ?? 0) + v);
    for (const b of BUCKET_IDS) if (g.totals[b]) add(b === 'bank' ? acct.bank : acct[b], g.totals[b]);
    const lines = [];
    for (const [account, v] of byAccount) {
      if (v === 0) continue;
      lines.push({ account, debit: v < 0 ? -v : 0, credit: v > 0 ? v : 0 });
    }
    if (g.net) lines.push({ account: acct.clearing, debit: g.net > 0 ? g.net : 0, credit: g.net < 0 ? -g.net : 0 });
    const label = g.kind === 'balance' ? `${result.processorName} ${g.currency} ${g.from ?? ''} to ${g.to ?? ''}`.trim() : g.kind === 'pending' ? `${result.processorName} pending` : `${result.processorName} payout ${g.id}`;
    out.push({ id: g.id, currency: g.currency, date: g.date ?? g.to, memo: label, lines, debits: sum(lines, 'debit'), credits: sum(lines, 'credit') });
    const moved = g.kind === 'balance' ? g.withdrawals : g.kind === 'payout' ? (g.deposit ?? g.net) : 0;
    if (transfer && moved) {
      const tl = [
        { account: acct.bank, debit: moved > 0 ? moved : 0, credit: moved < 0 ? -moved : 0 },
        { account: acct.clearing, debit: moved < 0 ? -moved : 0, credit: moved > 0 ? moved : 0 },
      ];
      out.push({ id: `${g.id}-transfer`, currency: g.currency, date: g.date ?? g.to, memo: `${label}: ${moved > 0 ? 'deposit to' : 'debit from'} the bank`, lines: tl, debits: moved > 0 ? moved : -moved, credits: moved > 0 ? moved : -moved });
    }
  }
  return out;
}
const sum = (lines, k) => lines.reduce((s, l) => s + l[k], 0);

// ---------- files for import ----------

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
// QuickBooks Online journal numbers are short; keep the end of a long payout id, which is the unique part.
const journalNo = (id, i) => {
  const s = String(id).replace(/[^A-Za-z0-9-]/g, '');
  return (s.length > 21 ? s.slice(-21) : s) || `PAYOUT-${i + 1}`;
};

// QuickBooks Online "Import journal entries": Journal No., Journal Date, Account Name,
// Journal/Description, Debits, Credits. Lines with the same journal number are one entry.
export function quickbooksCsv(js, { dates = 'mdy' } = {}) {
  const rows = [['Journal No', 'Journal Date', 'Account Name', 'Description', 'Debits', 'Credits', 'Currency Code']];
  js.forEach((j, i) => {
    const places = decimalsOf(j.currency);
    for (const l of j.lines) rows.push([journalNo(j.id, i), dateAs(j.date, dates), l.account, j.memo, l.debit ? toDecimal(l.debit, places) : '', l.credit ? toDecimal(l.credit, places) : '', j.currency]);
  });
  return writeCsv(rows);
}

// Xero manual journal lines: one signed amount, debits positive and credits negative (Xero's
// ManualJournalLine.LineAmount). Lines with the same narration and date are one journal.
export function xeroCsv(js, { dates = 'mdy' } = {}) {
  const rows = [['Narration', 'Date', 'Description', 'Account', 'Amount', 'Currency']];
  for (const j of js) {
    const places = decimalsOf(j.currency);
    for (const l of j.lines) rows.push([j.memo, dateAs(j.date, dates), j.memo, l.account, toDecimal(l.debit - l.credit, places), j.currency]);
  }
  return writeCsv(rows);
}

// One row per payout: every bucket, the net, the deposit and the difference.
export function summaryCsv(result) {
  const head = ['payout', 'currency', 'kind', 'date', 'first_activity', 'last_activity', 'rows', ...BUCKET_IDS.map((b) => b.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`)), 'net', 'deposit', 'difference', 'withdrawn'];
  const rows = [head];
  for (const g of result.groups) {
    const p = decimalsOf(g.currency);
    rows.push([g.id, g.currency, g.kind, g.date ?? '', g.from ?? '', g.to ?? '', g.rows, ...BUCKET_IDS.map((b) => toDecimal(g.totals[b], p)), toDecimal(g.net, p), g.deposit === null ? '' : toDecimal(g.deposit, p), g.difference === null ? '' : toDecimal(g.difference, p), toDecimal(g.withdrawals, p)]);
  }
  return writeCsv(rows);
}

// Every row of the file with the bucket it went to: the audit trail behind the totals.
export function detailCsv(rows, processor) {
  const out = [['line', 'payout', 'currency', 'date', 'type', 'bucket', 'gross', 'fee', 'net', 'reference']];
  for (const r of rows) {
    const p = decimalsOf(r.currency);
    out.push([r.line, r.payout, r.currency, r.date ?? '', r.type, r.bucket === 'payout' ? 'payout' : BUCKET[r.bucket].label, toDecimal(r.gross, p), toDecimal(r.fee, p), toDecimal(r.net ?? r.gross - r.fee, p), r.ref]);
  }
  void processor;
  return writeCsv(out);
}

// The paid output: the split, the journals and the files.
export function journalOutput(text, opts = {}) {
  const ledger = opts.ledger ?? 'quickbooks-online';
  if (!LEDGERS.includes(ledger)) throw new PayoutError(`ledger must be one of ${LEDGERS.join(', ')}.`, 'ledger');
  const result = split(text, opts);
  const { rows } = read(text, opts);
  const js = journals(result, { accounts: opts.accounts, transfer: opts.transfer });
  const dates = opts.dates ?? 'mdy';
  const importFile = ledger === 'xero' ? xeroCsv(js, { dates }) : quickbooksCsv(js, { dates });
  return {
    ...result,
    ledger,
    ledgerName: LEDGER_NAMES[ledger],
    accounts: { ...defaultAccounts(result.processor), ...(opts.accounts ?? {}) },
    journals: js,
    files: {
      import: { name: `${result.processor}-payouts-${ledger}.csv`, contentType: 'text/csv', text: importFile },
      summary: { name: `${result.processor}-payouts-summary.csv`, contentType: 'text/csv', text: summaryCsv(result) },
      detail: { name: `${result.processor}-payouts-lines.csv`, contentType: 'text/csv', text: detailCsv(rows, result.processor) },
    },
  };
}

// ---------- made-up sample files (the page's worked examples; no real store's data) ----------

export const SAMPLES = {
  stripe: [
    'automatic_payout_id,automatic_payout_effective_at,balance_transaction_id,created,available_on,currency,gross,fee,net,reporting_category,description',
    'po_SAMPLE1014,2026-10-14,txn_S01,2026-10-10 14:02:11,2026-10-12,usd,120.00,3.78,116.22,charge,Order 1041',
    'po_SAMPLE1014,2026-10-14,txn_S02,2026-10-10 16:40:05,2026-10-12,usd,45.00,1.61,43.39,charge,Order 1042',
    'po_SAMPLE1014,2026-10-14,txn_S03,2026-10-11 09:15:44,2026-10-13,usd,89.99,2.91,87.08,charge,Order 1043',
    'po_SAMPLE1014,2026-10-14,txn_S04,2026-10-11 11:20:00,2026-10-13,usd,-30.00,0.00,-30.00,refund,Refund for order 1038',
    'po_SAMPLE1014,2026-10-14,txn_S05,2026-10-12 08:00:00,2026-10-12,usd,-45.00,15.00,-60.00,dispute,Chargeback on order 1022',
    'po_SAMPLE1102,2026-11-02,txn_S06,2026-10-30 13:05:09,2026-11-01,usd,250.00,7.55,242.45,charge,Order 1050',
    'po_SAMPLE1102,2026-11-02,txn_S07,2026-10-31 19:44:31,2026-11-02,usd,19.99,0.88,19.11,charge,Order 1051',
    'po_SAMPLE1102,2026-11-02,txn_S08,2026-11-01 10:12:00,2026-11-01,usd,-19.99,0.00,-19.99,refund,Refund for order 1051',
    'po_SAMPLE1102,2026-11-02,txn_S09,2026-11-01 00:00:00,2026-11-01,usd,-2.00,0.00,-2.00,fee,Billing - usage fee',
  ].join('\n') + '\n',
  shopify: [
    'Transaction Date,Type,Order,Card Brand,Card Source,Payout Status,Payout Date,Available On,Amount,Fee,Net',
    '2026-10-12 10:14:03 -0400,charge,#1001,visa,online,paid,2026-10-14,2026-10-14,64.00,2.16,61.84',
    '2026-10-12 12:30:41 -0400,charge,#1002,master,online,paid,2026-10-14,2026-10-14,128.50,4.03,124.47',
    '2026-10-12 15:02:19 -0400,charge,#1003,amex,online,paid,2026-10-14,2026-10-14,37.25,1.38,35.87',
    '2026-10-13 09:41:00 -0400,refund,#0998,visa,online,paid,2026-10-14,2026-10-14,-22.00,0.00,-22.00',
    '2026-10-13 11:00:00 -0400,dispute,#0975,visa,online,paid,2026-10-14,2026-10-14,-49.00,15.00,-64.00',
    '2026-10-13 11:00:00 -0400,reserved_funds,,,,paid,2026-10-14,2026-10-14,-10.00,0.00,-10.00',
  ].join('\n') + '\n',
  shopifyNegative: [
    'Transaction Date,Type,Order,Card Brand,Card Source,Payout Status,Payout Date,Available On,Amount,Fee,Net',
    '2026-11-03 10:02:11 -0500,charge,#1101,visa,online,paid,2026-11-05,2026-11-05,42.00,1.52,40.48',
    '2026-11-03 16:20:45 -0500,refund,#1088,visa,online,paid,2026-11-05,2026-11-05,-180.00,0.00,-180.00',
    '2026-11-04 09:15:00 -0500,refund,#1090,master,online,paid,2026-11-05,2026-11-05,-35.00,0.00,-35.00',
  ].join('\n') + '\n',
  paypal: [
    'Date,Time,TimeZone,Name,Type,Status,Currency,Gross,Fee,Net,Transaction ID,Reference Txn ID,Balance,Sales Tax,Balance Impact',
    '10/20/2026,16:05:00,PDT,,General Withdrawal,Completed,USD,-150.00,0.00,-150.00,8SAMPLE0000000007,,57.78,0.00,Debit',
    '10/19/2026,09:30:12,PDT,,Chargeback Fee,Completed,USD,-20.00,0.00,-20.00,8SAMPLE0000000006,8SAMPLE0000000005,207.78,0.00,Debit',
    '10/18/2026,14:22:51,PDT,Sample Buyer C,Payment Refund,Completed,USD,-25.00,0.00,-25.00,8SAMPLE0000000005,8SAMPLE0000000002,227.78,0.00,Debit',
    '10/17/2026,11:02:33,PDT,Sample Buyer C,Express Checkout Payment,Completed,USD,25.00,-1.36,23.64,8SAMPLE0000000004,,252.78,0.00,Credit',
    '10/16/2026,18:45:09,PDT,Sample Buyer B,Express Checkout Payment,Completed,USD,54.00,-2.37,51.63,8SAMPLE0000000003,,229.14,0.00,Credit',
    '10/16/2026,18:45:09,PDT,Sample Buyer B,Authorization,Pending,USD,54.00,0.00,54.00,8SAMPLE0000000009,,,0.00,Memo',
    '10/15/2026,10:10:10,PDT,Sample Buyer A,Express Checkout Payment,Completed,USD,107.00,-4.22,102.78,8SAMPLE0000000002,,177.51,7.00,Credit',
  ].join('\n') + '\n',
  square: JSON.stringify({
    payouts: [{ id: 'po_SAMPLE-SQ-1016', status: 'PAID', amount_money: { amount: 13093, currency_code: 'USD' }, arrival_date: '2026-10-16', type: 'BATCH' }],
    payout_entries: [
      { id: 'poe_SAMPLE01', payout_id: 'po_SAMPLE-SQ-1016', effective_at: '2026-10-15T15:02:11Z', type: 'CHARGE', gross_amount_money: { amount: 10000, currency_code: 'USD' }, fee_amount_money: { amount: 275, currency_code: 'USD' }, net_amount_money: { amount: 9725, currency_code: 'USD' } },
      { id: 'poe_SAMPLE02', payout_id: 'po_SAMPLE-SQ-1016', effective_at: '2026-10-15T18:40:00Z', type: 'CHARGE', gross_amount_money: { amount: 4500, currency_code: 'USD' }, fee_amount_money: { amount: 132, currency_code: 'USD' }, net_amount_money: { amount: 4368, currency_code: 'USD' } },
      { id: 'poe_SAMPLE03', payout_id: 'po_SAMPLE-SQ-1016', effective_at: '2026-10-15T20:15:30Z', type: 'REFUND', gross_amount_money: { amount: -1000, currency_code: 'USD' }, fee_amount_money: { amount: 0, currency_code: 'USD' }, net_amount_money: { amount: -1000, currency_code: 'USD' } },
    ],
  }, null, 1) + '\n',
};
