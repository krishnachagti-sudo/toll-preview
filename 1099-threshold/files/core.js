// The 1099 threshold tracker: which payees need a Form 1099-NEC or 1099-MISC for a payment year,
// in which box, and why. Pure and deterministic: no imports, no clock, no I/O. The server
// (tool.js), the content pages (pages.js) and the browser (page.js) all run this same file.
//
// makeEngine(businessDays, files) takes the Business days engine (for the IRS due-date roll over
// weekends and federal holidays) and the dated data files in data/ (tool.js reads them; the page
// gets the same files from the tool's "rules" example). Money is whole cents everywhere.
//
// The rules come from the IRS Instructions for Forms 1099-MISC and 1099-NEC (Rev. 12/2026 for
// 2026 payments, Rev. 4-2025 for 2025): the box lines, the corporate exemption and its
// exceptions, the card and payment-app exclusion (Form 1099-K), merchandise and rent paid to a
// property manager, and backup withholding forcing a form at any amount.

export const PAYMENT_YEARS = [2025, 2026, 2027];
export const YEAR_MESSAGE = 'Payment year must be 2025, 2026 or 2027.';
export const NEAR_SHARE = 0.75;
export const MAX_ROWS = 5000;

export class ThresholdError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ThresholdError';
    this.field = field;
  }
}

// ---------- the boxes ----------

// Every box the tracker fills. `optional`: the IRS says you do not have to complete it.
// `indicator`: a checkbox, not an amount. `withholding`: backup withholding (any amount forces
// the form).
export const BOXES = {
  'nec-1a': { form: '1099-NEC', box: '1a', name: 'Nonemployee compensation' },
  'nec-2': { form: '1099-NEC', box: '2', name: 'Direct sales of $5,000 or more (checkbox)', indicator: true },
  'nec-3': { form: '1099-NEC', box: '3', name: 'Excess golden parachute payments' },
  'nec-4': { form: '1099-NEC', box: '4', name: 'Federal income tax withheld', withholding: true },
  'misc-1': { form: '1099-MISC', box: '1', name: 'Rents' },
  'misc-2': { form: '1099-MISC', box: '2', name: 'Royalties' },
  'misc-3': { form: '1099-MISC', box: '3', name: 'Other income (prizes, awards, damages)' },
  'misc-4': { form: '1099-MISC', box: '4', name: 'Federal income tax withheld', withholding: true },
  'misc-5': { form: '1099-MISC', box: '5', name: 'Fishing boat proceeds' },
  'misc-6': { form: '1099-MISC', box: '6', name: 'Medical and health care payments' },
  'misc-7': { form: '1099-MISC', box: '7', name: 'Direct sales of $5,000 or more (checkbox)', indicator: true },
  'misc-8': { form: '1099-MISC', box: '8', name: 'Substitute payments in lieu of dividends or interest' },
  'misc-9': { form: '1099-MISC', box: '9', name: 'Crop insurance proceeds' },
  'misc-10': { form: '1099-MISC', box: '10', name: 'Gross proceeds paid to an attorney' },
  'misc-11': { form: '1099-MISC', box: '11', name: 'Fish purchased for resale (cash)' },
  'misc-12': { form: '1099-MISC', box: '12', name: 'Section 409A deferrals', optional: true },
  'misc-15': { form: '1099-MISC', box: '15', name: 'Nonqualified deferred compensation' },
};
// The boxes with a line, in the order the year tables show them.
export const LINE_BOXES = ['nec-1a', 'nec-2', 'nec-3', 'misc-1', 'misc-2', 'misc-3', 'misc-5', 'misc-6', 'misc-7', 'misc-8', 'misc-9', 'misc-10', 'misc-11', 'misc-12', 'misc-15'];

// What was paid. `box`: where it goes; `corp`: reportable even when the payee is a corporation
// (i1099mec, Reportable payments to corporations); `exempt`: never on a 1099-NEC or 1099-MISC.
export const PAYMENT_TYPES = {
  services: { label: 'Services by a nonemployee', box: 'nec-1a', corp: false },
  'legal-fees': { label: 'Legal fees for an attorney\'s services', box: 'nec-1a', corp: true },
  rents: { label: 'Rent (office, equipment, land)', box: 'misc-1', corp: false },
  'rent-to-agent': { label: 'Rent paid to a real estate agent or property manager', exempt: 'Rent paid to a real estate agent or property manager is not reported by the tenant; the agent or manager reports the rent it pays over to the owner.' },
  royalties: { label: 'Royalties', box: 'misc-2', corp: false },
  'other-income': { label: 'Prizes, awards, damages and other income', box: 'misc-3', corp: false },
  'fishing-boat-proceeds': { label: 'Fishing boat proceeds to crew', box: 'misc-5', corp: false },
  medical: { label: 'Medical and health care services', box: 'misc-6', corp: true },
  'direct-sales': { label: 'Your sales of consumer products to the payee for resale', box: 'nec-2', corp: false },
  'substitute-payments': { label: 'Substitute payments in lieu of dividends or tax-exempt interest (brokers)', box: 'misc-8', corp: true },
  'crop-insurance': { label: 'Crop insurance proceeds', box: 'misc-9', corp: false },
  'attorney-gross-proceeds': { label: 'Gross proceeds paid to an attorney (for example a settlement)', box: 'misc-10', corp: true },
  'fish-for-resale': { label: 'Cash paid for fish bought for resale', box: 'misc-11', corp: true, cashOnly: true },
  'section-409a-deferrals': { label: 'Section 409A deferrals for a nonemployee', box: 'misc-12', corp: false },
  'nqdc': { label: 'Nonqualified deferred compensation (fails section 409A)', box: 'misc-15', corp: false },
  'golden-parachute': { label: 'Excess golden parachute payments', box: 'nec-3', corp: false },
  merchandise: { label: 'Merchandise, freight, storage, telephone and similar items', exempt: 'Payments for merchandise, telegrams, telephone, freight, storage and similar items are not reported on Form 1099-NEC or 1099-MISC.' },
  wages: { label: 'Wages or allowances to an employee', exempt: 'Wages, bonuses and travel allowances paid to employees go on Form W-2, not a 1099.' },
  personal: { label: 'A personal payment, not for your business', exempt: 'Only payments made in the course of your trade or business are reported; personal payments are not.' },
};

// Who was paid. `corporate`: the corporate exemption applies; `exempt`: never reported to them.
export const PAYEE_TYPES = {
  individual: { label: 'Individual or sole proprietor' },
  'single-member-llc': { label: 'Single-member LLC (disregarded entity)' },
  partnership: { label: 'Partnership, or LLC taxed as a partnership' },
  'c-corporation': { label: 'C corporation, or LLC taxed as one', corporate: true },
  's-corporation': { label: 'S corporation, or LLC taxed as one', corporate: true },
  estate: { label: 'Estate or trust' },
  'tax-exempt': { label: 'Tax-exempt organization or tax-exempt trust (IRA, HSA)', exempt: 'Payments to a tax-exempt organization, including tax-exempt trusts such as IRAs and HSAs, are not reported.' },
  government: { label: 'Government (US, a state, DC, a territory, a foreign government)', exempt: 'Payments to the United States, a state, the District of Columbia, a US territory or a foreign government are not reported.' },
  foreign: { label: 'Foreign person (gave you a W-8)', exempt: 'Payments to a foreign person are reported on Form 1042-S, not on a 1099; this tracker does not cover them.' },
  unknown: { label: 'Not known yet' },
};

// How it was paid. Card and payment-app payments are reported by the processor on Form 1099-K.
export const METHODS = {
  check: { label: 'Check' },
  ach: { label: 'ACH or bank transfer' },
  wire: { label: 'Wire' },
  cash: { label: 'Cash, cashier\'s check or money order' },
  other: { label: 'Other' },
  card: { label: 'Credit, debit or gift card', form1099K: true },
  'payment-app': { label: 'Payment app or online marketplace (paid through it)', form1099K: true },
};

// ---------- money, names and TINs ----------

// Whole cents from a JSON number or a spreadsheet cell ("$1,234.50", "(80.00)", "-80"), or null.
export function toCents(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    const cents = Math.round(value * 100);
    return Math.abs(cents - value * 100) < 1e-6 && Number.isSafeInteger(cents) ? cents : null;
  }
  if (typeof value !== 'string') return null;
  let s = value.trim().replace(/^﻿/, '');
  if (s === '') return null;
  let negative = false;
  if (/^\(.*\)$/.test(s)) { negative = true; s = s.slice(1, -1).trim(); }
  if (s.startsWith('-')) { negative = !negative; s = s.slice(1).trim(); }
  s = s.replace(/^(?:US)?\$\s*/i, '').replace(/,/g, '');
  if (s.endsWith('-')) { negative = !negative; s = s.slice(0, -1); }
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) return null;
  const cents = Number(m[1]) * 100 + Number((m[2] ?? '0').padEnd(2, '0'));
  if (!Number.isSafeInteger(cents)) return null;
  return negative ? -cents : cents;
}

const groupDigits = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// "$4,250.00", or "$2,000" when whole and asked for short.
export function money(cents, { short = false } = {}) {
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  const whole = Math.floor(abs / 100);
  const part = abs % 100;
  if (short && part === 0) return `${sign}$${groupDigits(whole)}`;
  return `${sign}$${groupDigits(whole)}.${String(part).padStart(2, '0')}`;
}
export const lineText = (line) => (line === 'any' ? 'any amount' : money(line, { short: true }));
// A plain number for a CSV cell: 4250.00
export const plainAmount = (cents) => `${cents < 0 ? '-' : ''}${Math.floor(Math.abs(cents) / 100)}.${String(Math.abs(cents) % 100).padStart(2, '0')}`;

// The payee's name as one key: case, spacing, punctuation and "&" do not split a payee.
export function normName(name) {
  return String(name ?? '').toLowerCase().replace(/&/g, ' and ').replace(/[.,'"`’()]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}
const ENTITY_WORDS = /\b(?:inc|incorporated|llc|l l c|llp|lp|ltd|limited|co|corp|corporation|company|pc|pllc|pa)\b/g;
// The name without entity words, to spot a vendor set up twice ("Acme LLC" and "Acme"). Never
// used to merge: only to warn.
export const looseName = (name) => normName(name).replace(ENTITY_WORDS, ' ').replace(/\s+/g, ' ').trim();

// The 9 digits of a TIN, or null when it is not 9 digits.
export function normTin(tin) {
  if (tin === undefined || tin === null) return null;
  const digits = String(tin).replace(/\D/g, '');
  return digits.length === 9 ? digits : null;
}
// "SSN" for XXX-XX-XXXX, "EIN" for XX-XXXXXXX, null when the shape does not say.
export function tinShape(tin) {
  const s = String(tin ?? '').trim();
  if (/^\d{3}-\d{2}-\d{4}$/.test(s)) return 'SSN';
  if (/^\d{2}-\d{7}$/.test(s)) return 'EIN';
  return null;
}
const formatTin = (digits, type) => (type === 'EIN' ? `${digits.slice(0, 2)}-${digits.slice(2)}` : `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`);

// ---------- dates ----------

const pad2 = (n) => String(n).padStart(2, '0');
function realDate(y, m, d) {
  if (!(y >= 1900 && y <= 2100 && m >= 1 && m <= 12 && d >= 1)) return null;
  const days = [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
  return d <= days ? `${y}-${pad2(m)}-${pad2(d)}` : null;
}
// A payment date: 2026-06-14, 6/14/2026 or 06/14/26 (US month first), or null.
export function parseDate(value) {
  const s = String(value ?? '').trim();
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(s);
  if (m) return realDate(Number(m[1]), Number(m[2]), Number(m[3]));
  m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(s);
  if (m) {
    const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
    return realDate(y, Number(m[1]), Number(m[2]));
  }
  return null;
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const longDate = (iso) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8))}, ${iso.slice(0, 4)}`;
export const shortDate = (iso) => `${MONTHS[Number(iso.slice(5, 7)) - 1].slice(0, 3)} ${Number(iso.slice(8))}, ${iso.slice(0, 4)}`;

// ---------- reading a payments spreadsheet ----------

// RFC 4180 rows from CSV text (quoted fields, doubled quotes, CRLF or LF). Tabs separate fields
// when the first line has tabs and no commas (a sheet pasted from a spreadsheet).
export function parseCsv(text) {
  const src = String(text ?? '').replace(/^﻿/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] ?? '';
  const sep = firstLine.includes('\t') && !firstLine.includes(',') ? '\t' : ',';
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === sep) { row.push(field); field = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); rows.push(row); row = []; field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ''));
}

// The spreadsheet headings each field answers to, compared without case, spaces or punctuation.
export const COLUMN_ALIASES = {
  payee: ['payee', 'vendor', 'name', 'payeename', 'vendorname', 'contractor', 'recipient', 'paidto', 'supplier', 'contact', 'displayname', 'payto'],
  tin: ['tin', 'ein', 'ssn', 'taxid', 'taxidnumber', 'taxpayerid', 'taxpayeridnumber', 'federalid', 'fein', 'tinssnein'],
  date: ['date', 'paymentdate', 'paiddate', 'transactiondate', 'txndate', 'datepaid'],
  amount: ['amount', 'paid', 'paymentamount', 'amountpaid', 'total', 'debit', 'spent', 'payment'],
  type: ['type', 'paymenttype', 'category', 'account', 'expensecategory', '1099box', 'box', 'what'],
  method: ['method', 'paymentmethod', 'paidby', 'paidwith', 'paymentaccount', 'how'],
  payeeType: ['payeetype', 'entitytype', 'taxclassification', 'vendortype', 'classification', 'entity'],
  state: ['state', 'payeestate', 'statecode', 'workstate'],
  withheld: ['withheld', 'backupwithholding', 'federalwithholding', 'federalincometaxwithheld', 'taxwithheld'],
  address1: ['address', 'address1', 'addressline1', 'street', 'streetaddress'],
  address2: ['address2', 'addressline2', 'suite', 'unit'],
  city: ['city', 'town', 'citytown'],
  zip: ['zip', 'zipcode', 'postalcode', 'postcode'],
};
export const COLUMN_FIELDS = Object.keys(COLUMN_ALIASES);
const headKey = (h) => String(h ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');

// { field: column index } for the headings it recognises. An explicit mapping
// ({ payee: 'Vendor' }) wins over the guesses.
export function detectColumns(headers, explicit = {}) {
  const keys = headers.map(headKey);
  const out = {};
  const used = new Set();
  for (const [field, heading] of Object.entries(explicit)) {
    const i = keys.indexOf(headKey(heading));
    if (i === -1) throw new ThresholdError(`No column is headed "${heading}" (asked for ${field}).`, 'columns');
    out[field] = i;
    used.add(i);
  }
  for (const field of COLUMN_FIELDS) {
    if (out[field] !== undefined) continue;
    const i = COLUMN_ALIASES[field].map((a) => keys.findIndex((k, j) => k === a && !used.has(j))).find((j) => j !== -1);
    if (i !== undefined) { out[field] = i; used.add(i); }
  }
  return out;
}

// Words a ledger uses for a payment type or method, read as the tracker's own codes.
const TYPE_WORDS = [
  [/legal|attorney|lawyer|law firm/, 'legal-fees'],
  [/settlement|gross proceeds/, 'attorney-gross-proceeds'],
  [/\brent|lease/, 'rents'],
  [/royalt/, 'royalties'],
  [/medical|health|doctor|dental|clinic|physician/, 'medical'],
  [/prize|award|damages|other income/, 'other-income'],
  [/merchandise|materials|supplies|inventory|goods|freight|shipping|storage|telephone|postage/, 'merchandise'],
  [/wage|salary|payroll/, 'wages'],
  [/contract|labor|labour|service|consult|freelanc|professional|fee|commission|nonemployee|\bnec\b|repair|cleaning|design|bookkeep|accounting/, 'services'],
];
const METHOD_WORDS = [
  [/credit|debit|card|visa|mastercard|amex|american express|discover/, 'card'],
  [/paypal|venmo|payment app|marketplace|stripe|square/, 'payment-app'],
  [/ach|bank|transfer|direct deposit|eft|zelle/, 'ach'],
  [/wire/, 'wire'],
  [/cash|money order|cashier/, 'cash'],
  [/check|cheque|chk/, 'check'],
];
const PAYEE_WORDS = [
  [/single.?member|disregarded|smllc/, 'single-member-llc'],
  [/s.?corp/, 's-corporation'],
  [/c.?corp|corporation|\bcorp\b|\binc\b/, 'c-corporation'],
  [/partnership|\bllp\b|\blp\b/, 'partnership'],
  [/individual|sole|person/, 'individual'],
  [/tax.?exempt|nonprofit|non-profit|501/, 'tax-exempt'],
  [/government|federal|state agency|municipal|city of|county/, 'government'],
  [/estate|trust/, 'estate'],
  [/foreign|w-8|w8/, 'foreign'],
];
function readWord(text, codes, words) {
  const s = String(text ?? '').trim().toLowerCase();
  if (s === '') return { value: undefined };
  if (Object.prototype.hasOwnProperty.call(codes, s)) return { value: s };
  for (const [re, code] of words) if (re.test(s)) return { value: code, read: true };
  return { value: undefined, unknown: true };
}
export const readType = (text) => readWord(text, PAYMENT_TYPES, TYPE_WORDS);
export const readMethod = (text) => readWord(text, METHODS, METHOD_WORDS);
export const readPayeeType = (text) => readWord(text, PAYEE_TYPES, PAYEE_WORDS);

// Payment rows (the API's JSON shape) from CSV text, with a note for every cell it could not read.
//   -> { payments, problems: [{ row, message }], columns }
export function paymentsFromCsv(text, explicit = {}) {
  const table = parseCsv(text);
  if (table.length < 2) throw new ThresholdError('The CSV needs a heading row and at least one payment row.', 'csv');
  if (table.length - 1 > MAX_ROWS) throw new ThresholdError(`At most ${groupDigits(MAX_ROWS)} payment rows in one scan.`, 'csv');
  const [head, ...body] = table;
  const cols = detectColumns(head, explicit);
  if (cols.payee === undefined && cols.tin === undefined) throw new ThresholdError('No payee column found. Head it "Payee" or "Vendor", or say which column it is.', 'columns');
  if (cols.amount === undefined) throw new ThresholdError('No amount column found. Head it "Amount", or say which column it is.', 'columns');
  const cell = (r, f) => (cols[f] === undefined ? '' : String(r[cols[f]] ?? '').trim());
  const payments = [];
  const problems = [];
  body.forEach((r, i) => {
    const line = i + 2;
    const amount = toCents(cell(r, 'amount'));
    if (amount === null) { problems.push({ row: line, message: `Amount "${cell(r, 'amount')}" is not a number of dollars; the row was skipped.` }); return; }
    const p = { payee: cell(r, 'payee'), amount: amount / 100 };
    if (cell(r, 'tin')) p.tin = cell(r, 'tin');
    if (!p.payee && !p.tin) { problems.push({ row: line, message: 'No payee name or TIN; the row was skipped.' }); return; }
    if (!p.payee) p.payee = `TIN ending ${String(p.tin).replace(/\D/g, '').slice(-4)}`;
    if (cell(r, 'date')) {
      const d = parseDate(cell(r, 'date'));
      if (!d) { problems.push({ row: line, message: `Date "${cell(r, 'date')}" is not a date like 2026-06-14 or 6/14/2026; the row was skipped.` }); return; }
      p.date = d;
    }
    for (const [field, read] of [['type', readType], ['method', readMethod], ['payeeType', readPayeeType]]) {
      const text = cell(r, field);
      const got = read(text);
      if (got.value) p[field] = got.value;
      if (got.read) p[`${field}Text`] = text;
      if (got.unknown) problems.push({ row: line, message: `Could not read ${field === 'payeeType' ? 'payee type' : field} "${text}"; the default was used.` });
    }
    const st = cell(r, 'state').toUpperCase();
    if (/^[A-Z]{2}$/.test(st)) p.state = st;
    const w = cell(r, 'withheld');
    if (w) { const c = toCents(w); if (c !== null && c > 0) p.withheld = c / 100; }
    const addr = {};
    for (const f of ['address1', 'address2', 'city', 'zip']) if (cell(r, f)) addr[f] = cell(r, f);
    if (Object.keys(addr).length) p.address = addr;
    payments.push(p);
  });
  const named = Object.fromEntries(Object.entries(cols).map(([f, i]) => [f, head[i]]));
  return { payments, problems, columns: named };
}

// ---------- payees: one per TIN, else per name ----------

// The payment rows of one scan that fall in its payment year, grouped into payees. Shared by the
// engine and by billing (tool.js), so the payee-years charged are exactly the payees reported.
//   -> { year, payees: [{ key, name, names, tin, rows }], otherYears: { 2025: { rows, cents } } }
export function groupPayees(input) {
  const year = input.paymentYear;
  const defaults = input.defaults ?? {};
  const rows = [];
  const otherYears = {};
  (input.payments ?? []).forEach((p, index) => {
    const cents = toCents(p.amount);
    const date = p.date ?? null;
    if (date && Number(date.slice(0, 4)) !== year) {
      const y = date.slice(0, 4);
      otherYears[y] ??= { rows: 0, cents: 0 };
      otherYears[y].rows += 1;
      otherYears[y].cents += cents ?? 0;
      return;
    }
    rows.push({
      index,
      payee: String(p.payee ?? '').trim(),
      tinRaw: p.tin ?? null,
      tin: normTin(p.tin),
      date,
      cents: cents ?? 0,
      type: p.type ?? defaults.type ?? 'services',
      method: p.method ?? defaults.method ?? 'check',
      payeeType: p.payeeType ?? null,
      state: p.state ?? defaults.state ?? null,
      withheld: toCents(p.withheld ?? 0) ?? 0,
      address: p.address ?? null,
      typeText: p.typeText ?? null,
      methodText: p.methodText ?? null,
    });
  });

  // Rows without a TIN join the payee whose TIN-bearing rows carry the same name, when exactly
  // one TIN goes with that name.
  const tinsByName = new Map();
  for (const r of rows) {
    if (!r.tin) continue;
    const n = normName(r.payee);
    if (!tinsByName.has(n)) tinsByName.set(n, new Set());
    tinsByName.get(n).add(r.tin);
  }
  const payees = new Map();
  for (const r of rows) {
    const n = normName(r.payee);
    let key;
    let joined = false;
    if (r.tin) key = `tin:${r.tin}`;
    else if (tinsByName.get(n)?.size === 1) { key = `tin:${[...tinsByName.get(n)][0]}`; joined = true; } else key = `name:${n || `row-${r.index}`}`;
    if (!payees.has(key)) payees.set(key, { key, name: r.payee, names: [], tin: key.startsWith('tin:') ? key.slice(4) : null, rows: [], joinedByName: 0, ambiguous: !r.tin && (tinsByName.get(n)?.size ?? 0) > 1 });
    const p = payees.get(key);
    if (r.payee && !p.names.includes(r.payee)) p.names.push(r.payee);
    if (joined) p.joinedByName += 1;
    p.rows.push(r);
  }
  return { year, payees: [...payees.values()], otherYears };
}

// The job keys billing charges once each: one per payee per payment year.
export const payeeYearKeys = (input) => groupPayees(input).payees.map((p) => `${input.paymentYear}|${p.key}`);

// ---------- the engine ----------

export function makeEngine(businessDays, files) {
  const { federal, penalties, cpi, states, iris } = files;

  // ---- lines by payment year ----

  const monthValue = new Map(cpi.months.map((m) => [m.month, m]));
  // 12 months ending August of `year`, as YYYY-MM.
  const augustYear = (year) => Array.from({ length: 12 }, (_, i) => {
    const n = (year - 1) * 12 + 8 + i; // September of year - 1 is month 9 (index 8)
    return `${Math.floor(n / 12)}-${pad2((n % 12) + 1)}`;
  });
  const thousandths = (v) => Math.round(Number(v) * 1000);

  // 26 USC 6041(h) on the C-CPI-U: the provisional line for a payment year after 2026.
  function projection(year) {
    const idx = federal.indexing;
    const official = federal.years[String(year)];
    const baseMonths = augustYear(idx.baseYear);
    const prior = augustYear(year - 1);
    const read = (months) => {
      const got = months.map((m) => monthValue.get(m)).filter(Boolean);
      const missing = months.filter((m) => !monthValue.has(m));
      return { got, missing };
    };
    const base = read(baseMonths);
    const cur = read(prior);
    const unpublished = new Set(cpi.notPublished ?? []);
    const gap = cur.missing.filter((m) => !unpublished.has(m));
    const out = {
      paymentYear: year,
      status: official ? 'official' : 'provisional',
      base: { months: `${baseMonths[0]} to ${baseMonths[11]}`, count: base.got.length },
      current: { months: `${prior[0]} to ${prior[11]}`, count: cur.got.length, notPublished: cur.missing.filter((m) => unpublished.has(m)) },
      sources: { statute: idx.statute, cola: idx.cola, cpi: cpi.source },
    };
    if (official) {
      out.threshold = official.general;
      out.source = official.source;
      return out;
    }
    if (base.missing.length || gap.length) {
      out.status = 'not-available';
      out.message = `BLS has not published the C-CPI-U for ${gap.join(', ') || base.missing.join(', ')} yet, so the ${year} line cannot be worked out. The statutory $2,000 applies until then.`;
      out.threshold = null;
      return out;
    }
    // Averages in thousandths of an index point, so the sums are exact.
    const avg = (list) => list.reduce((s, m) => s + thousandths(m.value), 0) / list.length;
    const baseAvg = avg(base.got);
    const curAvg = avg(cur.got);
    const ratio = curAvg / baseAvg;
    const increase = Math.round(idx.base * (ratio - 1)); // cents
    const rounded = Math.max(0, Math.round(increase / idx.roundTo) * idx.roundTo);
    // The same with each missing month filled with the average of its neighbours, to show
    // whether the gap can move the answer.
    const filled = prior.map((m) => {
      if (monthValue.has(m)) return thousandths(monthValue.get(m).value);
      const i = prior.indexOf(m);
      const near = [prior[i - 1], prior[i + 1]].filter((x) => x && monthValue.has(x)).map((x) => thousandths(monthValue.get(x).value));
      return near.reduce((a, b) => a + b, 0) / near.length;
    });
    const filledRatio = filled.reduce((a, b) => a + b, 0) / filled.length / baseAvg;
    const filledIncrease = Math.round(idx.base * (filledRatio - 1));
    Object.assign(out, {
      base: { ...out.base, average: Math.round(baseAvg * 1000) / 1e6 },
      current: { ...out.current, average: Math.round(curAvg * 1000) / 1e6 },
      ratio: Math.round(ratio * 1e6) / 1e6,
      percent: Math.round((ratio - 1) * 10000) / 100,
      increase,
      roundedIncrease: rounded,
      threshold: idx.base + rounded,
      withGapFilled: { increase: filledIncrease, threshold: idx.base + Math.max(0, Math.round(filledIncrease / idx.roundTo) * idx.roundTo) },
      // How far the index would have to move to flip the rounding: below +$50 gives $2,000,
      // +$150 or more gives $2,200.
      flipsBelowPercent: (idx.roundTo / 2 / idx.base) * 100,
      flipsAtPercent: ((idx.roundTo * 1.5) / idx.base) * 100,
      method: `C-CPI-U average for ${out.current.months} (${cur.got.length} published months) divided by the average for ${out.base.months}; the increase on $2,000 is rounded to the nearest $100 (26 USC 6041(h), 1(f)(3)).`,
    });
    return out;
  }

  // { year, status, boxes: { id: cents | 'any' }, general, source, projection? }
  function lines(year) {
    if (!PAYMENT_YEARS.includes(year)) throw new ThresholdError(YEAR_MESSAGE, 'paymentYear');
    const data = federal.years[String(year)];
    if (data) return { year, status: 'official', general: data.general, boxes: { ...data.boxes }, source: data.source };
    const proj = projection(year);
    const prev = federal.years[String(year - 1)] ?? federal.years[String(Math.max(...Object.keys(federal.years).map(Number)))];
    const general = proj.threshold ?? federal.indexing.base;
    const boxes = { ...prev.boxes };
    for (const id of federal.indexing.indexedBoxes) boxes[id] = general;
    return { year, status: proj.threshold === null ? 'statutory' : 'provisional', general, boxes, source: prev.source, projection: proj };
  }

  // ---- due dates ----

  function roll(iso) {
    const year = Number(iso.slice(0, 4));
    const closed = new Set(businessDays.holidays('US', year).map((h) => h.date));
    let n = businessDays.dayNumber(iso);
    for (;;) {
      const d = businessDays.isoOf(n);
      const wd = businessDays.weekdayOf(d);
      if (wd !== 0 && wd !== 6 && !closed.has(d)) return d;
      n += 1;
    }
  }
  function dueDates(paymentYear) {
    const y = paymentYear + 1;
    const d = federal.dueDates;
    const at = (md) => roll(`${y}-${md}`);
    return {
      filingYear: y,
      necFile: at(d.necFile),
      necFurnish: at(d.necFurnish),
      miscFurnish: at(d.miscFurnish),
      miscFurnishBox8or10: at(d.miscFurnishBox8or10),
      miscFilePaper: at(d.miscFilePaper),
      miscFileElectronic: at(d.miscFileElectronic),
      eFileAtReturns: d.eFileAtReturns,
      source: d.source,
    };
  }

  // ---- penalties ----

  function penalty({ paymentYear, forms, smallBusiness = null }) {
    const dueYear = paymentYear + 1;
    const data = penalties.years[String(dueYear)];
    if (!data) return { dueYear, published: false, message: `The IRS has not published penalty amounts for returns due in ${dueYear} yet.`, source: penalties.source };
    const bands = penalties.bands.map((b) => {
      const per = data.perReturn[b.id];
      const each = forms * per; // returns, and again payee statements
      const max = smallBusiness === null ? null : (smallBusiness ? data.maxSmall : data.maxLarge)[b.id];
      const capped = max === null ? each : Math.min(each, max);
      return { band: b.id, label: b.label, perReturn: per, returns: capped, statements: capped, total: capped * 2, annualMaximum: max };
    });
    return { dueYear, published: true, forms, smallBusiness, bands, source: penalties.source };
  }

  // ---- states ----

  function stateRecord(code, paymentYear) {
    const s = states.states[code];
    if (!s) throw new ThresholdError('State must be a two-letter US state code such as CA, or DC.', 'state');
    const out = { state: code, name: s.name, cfsf: s.cfsf, cfsfSource: states.cfsf.source, verified: Boolean(s.rule) };
    if (s.rule) {
      const yearLines = s.rule.lines[String(paymentYear)] ?? null;
      Object.assign(out, { agency: s.rule.agency, summary: s.rule.summary, lines: yearLines, lineNotes: s.rule.lineNotes ?? {}, due: s.rule.due, source: s.rule.source });
      if (!yearLines) out.message = `${s.name}'s lines for ${paymentYear} have not been published by the ${s.rule.agency} yet; confirm with the state.`;
    } else {
      out.message = `${s.name}'s own 1099 rules have not been checked at its revenue agency yet; confirm with the state before relying on a state copy.`;
    }
    return out;
  }

  // ---- one payee ----

  const meets = (line, total) => (line === 'any' ? total > 0 : total >= line);
  const citeYear = (year) => lines(year).source;

  function judgePayee(group, year, opts) {
    const L = lines(year);
    const typeVotes = group.rows.map((r) => r.payeeType).filter((t) => t && t !== 'unknown');
    const payeeType = typeVotes[0] ?? opts.defaults?.payeeType ?? 'unknown';
    const conflicts = [...new Set(typeVotes)].length > 1;
    const pt = PAYEE_TYPES[payeeType];
    const totals = {};
    const crossedOn = {};
    const excluded = {};
    const notes = [];
    const exclude = (why, cents) => { excluded[why] = (excluded[why] ?? 0) + cents; };
    const withheld = { '1099-NEC': 0, '1099-MISC': 0 };
    let paid = 0;
    const byState = {};

    const ordered = [...group.rows].sort((a, b) => ((a.date ?? '9999') < (b.date ?? '9999') ? -1 : (a.date ?? '9999') > (b.date ?? '9999') ? 1 : a.index - b.index));
    for (const r of ordered) {
      paid += r.cents;
      const t = PAYMENT_TYPES[r.type];
      if (t.exempt) { exclude(r.type, r.cents); continue; }
      if (METHODS[r.method].form1099K) { exclude('form-1099-k', r.cents); continue; }
      if (pt.exempt) { exclude(`payee-${payeeType}`, r.cents); continue; }
      if (pt.corporate && !t.corp && !(opts.federalAgency && t.box === 'nec-1a')) { exclude('corporation', r.cents); continue; }
      if (t.cashOnly && r.method !== 'cash') { exclude('fish-not-cash', r.cents); continue; }
      const box = t.box;
      const before = totals[box] ?? 0;
      totals[box] = before + r.cents;
      const line = L.boxes[box];
      if (line !== undefined && !crossedOn[box] && meets(line, totals[box]) && r.date) crossedOn[box] = r.date;
      if (r.withheld > 0) withheld[BOXES[box].form] += r.withheld;
      if (r.state) byState[r.state] = byState[r.state] ?? {};
      if (r.state) byState[r.state][box] = (byState[r.state][box] ?? 0) + r.cents;
    }
    // A refund that takes a box back under its line undoes the crossing.
    for (const box of Object.keys(crossedOn)) if (!meets(L.boxes[box], totals[box])) delete crossedOn[box];

    const boxes = Object.entries(totals).map(([id, total]) => {
      const line = L.boxes[id];
      const met = meets(line, total);
      return {
        id, form: BOXES[id].form, box: BOXES[id].box, name: BOXES[id].name, total, line,
        met, optional: Boolean(BOXES[id].optional), indicator: Boolean(BOXES[id].indicator),
        crossedOn: met ? (crossedOn[id] ?? null) : null,
        share: line === 'any' ? null : Math.round((total / line) * 1000) / 1000,
      };
    }).sort((a, b) => LINE_BOXES.indexOf(a.id) - LINE_BOXES.indexOf(b.id));

    // Which forms: a box over its line (an optional box never forces one), or any backup
    // withholding on that form's payments.
    const forms = [];
    for (const form of ['1099-NEC', '1099-MISC']) {
      const required = boxes.filter((b) => b.form === form && b.met && !b.optional && !b.indicator);
      if (required.length || withheld[form] > 0) forms.push(form);
    }
    // Direct sales: the checkbox on the 1099-NEC when one is filed anyway, else the 1099-MISC.
    const sales = boxes.find((b) => b.id === 'nec-2');
    if (sales?.met) {
      if (!forms.includes('1099-NEC') && !forms.includes('1099-MISC')) forms.push('1099-MISC');
      if (!forms.includes('1099-NEC')) { sales.id = 'misc-7'; sales.form = '1099-MISC'; sales.box = '7'; sales.name = BOXES['misc-7'].name; }
    }
    const report = forms.map((form) => {
      const filled = boxes.filter((b) => b.form === form && (b.met || withheld[form] > 0) && b.total > 0);
      const amounts = Object.fromEntries(filled.filter((b) => !b.indicator).map((b) => [b.box, b.total]));
      if (withheld[form] > 0) amounts['4'] = withheld[form];
      const checkboxes = filled.filter((b) => b.indicator && b.met).map((b) => b.box);
      return { form, amounts, checkboxes };
    });

    const counted = boxes.reduce((s, b) => s + b.total, 0);
    const near = !forms.length && boxes.some((b) => b.line !== 'any' && !b.indicator && !b.optional && b.total > 0 && b.total >= NEAR_SHARE * b.line);
    let verdict;
    if (forms.length) verdict = 'file';
    else if (near) verdict = 'near';
    else if (counted <= 0 && paid > 0) verdict = 'exempt';
    else verdict = 'under';

    // ---- why, in plain words ----
    const reasons = [];
    for (const b of boxes) {
      const where = `${b.form} box ${b.box}`;
      if (b.indicator) {
        reasons.push(b.met ? `Sales of ${money(b.total)} for resale reach the ${money(500000, { short: true })} line: check ${where}.` : `Sales of ${money(b.total)} for resale are under the ${money(500000, { short: true })} line for ${where}.`);
      } else if (b.met) {
        reasons.push(`${b.name}: ${money(b.total)}${b.line === 'any' ? ', reported at any amount' : ` reaches the ${lineText(b.line)} line`}${b.crossedOn ? ` (crossed on ${longDate(b.crossedOn)})` : ''}: ${b.optional ? `${where} is optional` : `report it in ${where}`}.`);
      } else {
        reasons.push(`${b.name}: ${money(b.total)} is under the ${lineText(b.line)} line for ${where}${withheld[b.form] > 0 ? ', but backup withholding means the form is filed anyway' : ''}.`);
      }
    }
    for (const form of ['1099-NEC', '1099-MISC']) {
      if (withheld[form] > 0) reasons.push(`Backup withholding of ${money(withheld[form])}: a ${form} is required whatever the amount, with the tax in box 4.`);
    }
    const EXCLUDED_WORDS = {
      'form-1099-k': 'Paid by card or through a payment app: the processor reports it on Form 1099-K, so it is left out here.',
      corporation: 'Paid to a corporation: not reported, except legal fees, medical and health care payments, attorney gross proceeds, substitute payments and cash for fish.',
      'fish-not-cash': 'Fish bought for resale but not paid in cash: only cash payments go in box 11; a check on your own account is not cash.',
    };
    for (const [why, cents] of Object.entries(excluded)) {
      const text = EXCLUDED_WORDS[why] ?? (why.startsWith('payee-') ? PAYEE_TYPES[why.slice(6)].exempt : PAYMENT_TYPES[why]?.exempt);
      reasons.push(`${money(cents)} left out. ${text}`);
    }
    if (payeeType === 'unknown' && counted > 0) notes.push('Payee type not given: treated as not a corporation, so the answer errs toward filing. A Form W-9 settles it.');
    if (conflicts) notes.push(`The rows give different payee types (${[...new Set(typeVotes)].join(', ')}); the first one was used.`);
    if (group.names.length > 1) notes.push(`Rows merged under one ${group.tin ? 'TIN' : 'name'}: ${group.names.join('; ')}.`);
    if (group.joinedByName) notes.push(`${group.joinedByName} ${group.joinedByName === 1 ? 'row' : 'rows'} without a TIN joined by name.`);
    if (group.ambiguous) notes.push('This name goes with more than one TIN elsewhere in the file, so rows without a TIN were kept apart.');
    const typeRead = group.rows.find((r) => r.typeText);
    if (typeRead) notes.push(`Payment type read from "${typeRead.typeText}" as ${PAYMENT_TYPES[typeRead.type].label.toLowerCase()}.`);
    if (group.rows.some((r) => r.method === 'payment-app')) notes.push('Payment-app rows were left out on the basis that they were paid through the app for goods or services; a personal transfer through an app is not reported by the app.');

    // ---- the TIN and the W-9 ----
    let w9 = null;
    const raw = group.rows.find((r) => r.tinRaw)?.tinRaw ?? null;
    if ((verdict === 'file' || verdict === 'near') && !opts.single) {
      if (!group.tin) {
        w9 = raw ? 'invalid' : 'missing';
        notes.push(raw
          ? `The TIN "${raw}" is not 9 digits. Ask for a Form W-9.`
          : `No TIN on file. Ask for a Form W-9${verdict === 'file' ? `; without a TIN, reportable payments are subject to backup withholding at ${federal.backupWithholdingRate}%` : ' before the next payment'}.`);
      }
    }

    // ---- state copies ----
    const stateCopies = Object.entries(byState).map(([code, perBox]) => {
      const rec = states.states[code] ? stateRecord(code, year) : null;
      if (!rec) return { state: code, verified: false, message: `${code} is not a US state code.` };
      const amount = Object.values(perBox).reduce((a, b) => a + b, 0);
      const out = { state: code, name: rec.name, amount, cfsf: rec.cfsf, verified: rec.verified };
      if (rec.verified && rec.lines) {
        out.boxes = Object.entries(perBox).map(([id, total]) => {
          const fed = boxes.find((b) => b.id === id || (id === 'nec-2' && b.id === 'misc-7'));
          const stateLine = rec.lines[id];
          const stateMet = stateLine === undefined ? null : meets(stateLine, total);
          return { id, total, stateLine, stateMet, federalMet: fed?.met ?? false };
        });
        const differs = out.boxes.filter((b) => b.stateMet !== null && b.stateMet !== b.federalMet);
        out.required = out.boxes.some((b) => b.stateMet);
        out.message = differs.length
          ? `${rec.name} draws a different line here: ${differs.map((b) => `${BOXES[b.id].form} box ${BOXES[b.id].box} is ${b.stateMet ? '' : 'not '}reportable to the state at its ${lineText(b.stateLine)} line (federal: ${b.federalMet ? 'reportable' : 'not reportable'})`).join('; ')}. The ${rec.agency} says to file separately with the IRS and the state when the amounts differ.`
          : out.required ? `${rec.name}'s lines match the federal answer for these payments.` : `Under ${rec.name}'s lines for these payments.`;
        out.source = rec.source;
      } else {
        out.message = rec.message;
      }
      return out;
    });
    if (Object.keys(byState).length > 1) notes.push('Paid in more than one state: each state copy carries only the amount for that state (Pub 1220, CF/SF rules), never the total.');

    return {
      key: group.key,
      name: group.name,
      names: group.names,
      tin: group.tin ? { last4: group.tin.slice(5), type: tinShape(raw) } : null,
      payeeType,
      rows: group.rows.length,
      paid,
      counted,
      excluded,
      boxes,
      forms,
      report,
      verdict,
      w9,
      reasons,
      notes,
      states: stateCopies,
      miscStatementDue: report.some((r) => r.form === '1099-MISC')
        ? (Object.keys(report.find((r) => r.form === '1099-MISC').amounts).every((b) => b === '8' || b === '10') && !report.find((r) => r.form === '1099-MISC').checkboxes.length ? 'box8or10' : 'standard')
        : null,
    };
  }

  // Payees whose names match once entity words are dropped ("Acme LLC", "ACME"), but whose keys
  // differ: probably one vendor set up twice. Flagged, never merged.
  function possibleDuplicates(judged) {
    const by = new Map();
    for (const p of judged) {
      const k = looseName(p.name);
      if (!k) continue;
      if (!by.has(k)) by.set(k, []);
      by.get(k).push(p);
    }
    const out = [];
    for (const list of by.values()) {
      if (list.length < 2) continue;
      const tins = new Set(list.map((p) => p.tin?.last4).filter(Boolean));
      if (tins.size > 1) continue; // two TINs: two payees
      const combined = list.reduce((s, p) => s + p.counted, 0);
      out.push({ names: list.map((p) => p.name), keys: list.map((p) => p.key), combined });
      for (const p of list) p.notes.push(`Possibly the same payee as ${list.filter((q) => q !== p).map((q) => q.name).join(', ')}: together ${money(combined)}. Add the TIN to merge them.`);
    }
    return out;
  }

  // ---- the scan ----

  function scan(input) {
    const year = input.paymentYear;
    const L = lines(year);
    const grouped = groupPayees(input);
    if (!grouped.payees.length && !Object.keys(grouped.otherYears).length) throw new ThresholdError('There are no payments to check.', 'payments');
    const opts = { defaults: input.defaults ?? {}, federalAgency: Boolean(input.payer?.federalExecutiveAgency) };
    const judged = grouped.payees.map((g) => judgePayee(g, year, opts));
    const duplicates = possibleDuplicates(judged);
    const order = { file: 0, near: 1, under: 2, exempt: 3 };
    judged.sort((a, b) => order[a.verdict] - order[b.verdict] || b.counted - a.counted || (a.name < b.name ? -1 : 1));

    const nec = judged.filter((p) => p.forms.includes('1099-NEC')).length;
    const misc = judged.filter((p) => p.forms.includes('1099-MISC')).length;
    const formsOwed = nec + misc;
    const otherReturns = input.otherInformationReturns ?? 0;
    const due = dueDates(year);
    const filing = judged.filter((p) => p.verdict === 'file').length;
    const rest = judged.length - filing;
    const answer = `Of ${judged.length} ${judged.length === 1 ? 'payee' : 'payees'} paid in ${year}, ${filing} ${filing === 1 ? 'needs' : 'need'} a form (${nec} Form 1099-NEC, ${misc} Form 1099-MISC) at the ${lineText(L.general)} line${L.status === 'provisional' ? ' (provisional)' : ''}; ${rest} ${rest === 1 ? 'does' : 'do'} not.`;
    const result = {
      op: 'scan',
      paymentYear: year,
      lineStatus: L.status,
      general: L.general,
      answer,
      summary: {
        payees: judged.length,
        file: judged.filter((p) => p.verdict === 'file').length,
        near: judged.filter((p) => p.verdict === 'near').length,
        under: judged.filter((p) => p.verdict === 'under').length,
        exempt: judged.filter((p) => p.verdict === 'exempt').length,
        forms: { '1099-NEC': nec, '1099-MISC': misc },
        formsOwed,
        missingTin: judged.filter((p) => p.w9 && p.verdict === 'file').length,
        eFile: { required: formsOwed + otherReturns >= due.eFileAtReturns, count: formsOwed + otherReturns, line: due.eFileAtReturns, note: `E-filing is required when you file ${due.eFileAtReturns} or more information returns in total for the year, counting every type (W-2s included).` },
        paid: judged.reduce((s, p) => s + p.paid, 0),
        counted: judged.reduce((s, p) => s + p.counted, 0),
      },
      dueDates: due,
      penalty: penalty({ paymentYear: year, forms: formsOwed }),
      payees: judged,
      duplicates,
      otherYears: Object.entries(grouped.otherYears).map(([y, v]) => ({ year: Number(y), rows: v.rows, amount: v.cents })),
      problems: input.problems ?? [],
      sources: sourcesFor(year),
    };
    if (L.projection) result.projection = L.projection;
    if (result.otherYears.length) result.notes = [`${result.otherYears.map((o) => `${o.rows} ${o.rows === 1 ? 'row' : 'rows'} dated ${o.year}`).join(' and ')} ${result.otherYears.length === 1 && result.otherYears[0].rows === 1 ? 'was' : 'were'} left out: each payment year is checked on its own. Run the scan again with that payment year.`];
    if (input.exports?.length) Object.assign(result, exportsFor(result, input));
    return result;
  }

  function sourcesFor(year) {
    const L = lines(year);
    const list = [L.source, federal.dueDates.source, federal.dueDates.box8or10Source, penalties.source, federal.form1099K.source];
    if (L.projection) list.push(federal.indexing.statute, federal.indexing.cola, cpi.source);
    return list;
  }

  // ---- one payee, free ----

  function check(input) {
    const year = input.paymentYear;
    const L = lines(year);
    const payment = { payee: 'Payee', amount: input.amount, type: input.paymentType ?? 'services', method: input.method ?? 'check', payeeType: input.payeeType ?? 'unknown' };
    if (input.withheld) payment.withheld = input.withheld;
    if (input.state) payment.state = input.state;
    const g = groupPayees({ paymentYear: year, payments: [payment] }).payees[0];
    const p = judgePayee(g, year, { defaults: {}, federalAgency: Boolean(input.federalExecutiveAgency), single: true });
    if (p.verdict === 'file' || p.verdict === 'near') p.notes.push(`Collect a Form W-9 for the payee's TIN; without a TIN, reportable payments are subject to backup withholding at ${federal.backupWithholdingRate}%.`);
    const t = PAYMENT_TYPES[payment.type];
    const boxId = t.box ?? null;
    const box = p.boxes[0] ?? null;
    const line = boxId ? L.boxes[boxId] : null;
    const required = p.verdict === 'file';
    const where = box ? `${box.form} box ${box.box}` : null;
    let answer;
    if (required) answer = `Yes: file Form ${p.forms.join(' and Form ')}${box && box.met ? ` and report ${money(box.total)} in box ${box.box}` : ''}.`;
    else if (t.exempt) answer = `No: ${t.exempt.charAt(0).toLowerCase()}${t.exempt.slice(1)}`;
    else if (p.verdict === 'exempt') {
      const why = p.reasons[p.reasons.length - 1].replace(/^\$[\d,.]+ left out\. /, '');
      answer = `No: ${why.charAt(0).toLowerCase()}${why.slice(1)}`;
    }
    else answer = `No: ${money(p.counted)} is under the ${lineText(line)} line for ${where}${p.verdict === 'near' ? '. It is within 25% of the line, so collect a Form W-9 now in case more payments follow' : ''}.`;
    const out = {
      op: 'check',
      paymentYear: year,
      lineStatus: L.status,
      required,
      answer,
      forms: p.forms,
      box: box && required ? { form: box.form, box: box.box, name: box.name } : (boxId ? { form: BOXES[boxId].form, box: BOXES[boxId].box, name: BOXES[boxId].name } : null),
      line,
      amount: toCents(input.amount),
      verdict: p.verdict,
      reasons: p.reasons,
      notes: p.notes,
      states: p.states,
      dueDates: required ? dueDates(year) : null,
      source: L.source,
    };
    if (L.projection) out.projection = L.projection;
    return out;
  }

  // ---- reference answers, free ----

  function thresholds(year) {
    const L = lines(year);
    return {
      op: 'thresholds',
      paymentYear: year,
      status: L.status,
      general: L.general,
      boxes: LINE_BOXES.map((id) => ({ id, form: BOXES[id].form, box: BOXES[id].box, name: BOXES[id].name, line: L.boxes[id], optional: Boolean(BOXES[id].optional), corporations: Object.values(PAYMENT_TYPES).some((t) => t.box === id && t.corp), indexed: federal.indexing.indexedBoxes.includes(id) })),
      dueDates: dueDates(year),
      source: L.source,
      ...(L.projection ? { projection: L.projection } : {}),
    };
  }

  // ---- exports ----

  // { files, iris? }: the files asked for, and what to check before an IRIS upload.
  function exportsFor(result, input) {
    const files = [];
    let checks = null;
    if (input.exports.includes('csv')) files.push(verdictCsv(result));
    if (input.exports.includes('iris')) {
      const made = irisFiles(result, input);
      files.push(...made.files);
      checks = made.checks;
    }
    return checks ? { files, iris: checks } : { files };
  }

  // One row per payee: what to file, every box, and why.
  function verdictCsv(result) {
    const cols = ['payee', 'tin_last4', 'payee_type', 'verdict', 'forms', ...LINE_BOXES.map((id) => `${id.replace('-', '_')}`), 'nec_4_withheld', 'misc_4_withheld', 'crossed_on', 'left_out', 'w9', 'states', 'why'];
    const rows = result.payees.map((p) => {
      const box = (id) => { const b = p.boxes.find((x) => x.id === id); return b ? (b.indicator ? (b.met ? 'Y' : '') : plainAmount(b.total)) : ''; };
      const held = (form) => { const r = p.report.find((x) => x.form === form); return r?.amounts['4'] ? plainAmount(r.amounts['4']) : ''; };
      return [p.name, p.tin?.last4 ?? '', p.payeeType, p.verdict, p.forms.join(' '), ...LINE_BOXES.map(box), held('1099-NEC'), held('1099-MISC'),
        p.boxes.map((b) => b.crossedOn).filter(Boolean).sort()[0] ?? '', plainAmount(Object.values(p.excluded).reduce((a, b) => a + b, 0)), p.w9 ?? '', p.states.map((s) => s.state).join(' '), [...p.reasons, ...p.notes].join(' ')];
    });
    return { kind: 'csv', name: `1099-verdicts-${result.paymentYear}.csv`, records: rows.length, csv: toCsv([cols, ...rows], { safe: true }) };
  }

  // ---- IRIS Taxpayer Portal CSV ----

  const clean = (s, allowed, max) => {
    const v = String(s ?? '').normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(allowed, ' ').replace(/\s+/g, ' ').trim();
    return { value: v.slice(0, max).trim(), cut: v.length > max };
  };
  const BUSINESS = /[^A-Za-z0-9 \-#()&']/g;
  const PERSON = /[^A-Za-z \-]/g;
  const ADDRESS = /[^A-Za-z0-9 \-/]/g;
  const CITY = /[^A-Za-z ]/g;
  const SUFFIXES = new Set(['jr', 'sr', 'ii', 'iii', 'iv', 'v']);

  function splitName(name) {
    const s = String(name).replace(/\./g, '').trim();
    let first; let last; let middle = ''; let suffix = '';
    if (s.includes(',')) {
      const [l, rest] = s.split(/,(.*)/s);
      last = l.trim();
      const parts = rest.trim().split(/\s+/);
      first = parts.shift() ?? '';
      if (parts.length && SUFFIXES.has(parts[parts.length - 1].toLowerCase())) suffix = parts.pop();
      middle = parts.join(' ');
    } else {
      const parts = s.split(/\s+/);
      if (parts.length > 2 && SUFFIXES.has(parts[parts.length - 1].toLowerCase())) suffix = parts.pop();
      first = parts.shift() ?? '';
      last = parts.pop() ?? '';
      middle = parts.join(' ');
    }
    return { first, middle, last, suffix };
  }

  function irisFiles(result, input) {
    const layout = iris.columns;
    const payer = input.payer ?? {};
    const details = new Map();
    for (const d of input.payees ?? []) {
      const key = normTin(d.tin) ? `tin:${normTin(d.tin)}` : `name:${normName(d.name)}`;
      details.set(key, d);
    }
    const records = { '1099-NEC': [], '1099-MISC': [] };
    const problems = [];
    const payerCells = () => {
      const tinDigits = normTin(payer.tin);
      const type = payer.tin ? (tinShape(payer.tin) ?? 'EIN') : '';
      const pName = clean(payer.name, BUSINESS, 40);
      const individual = payer.nameType === 'I';
      const split = individual ? splitName(payer.name ?? '') : null;
      return {
        'Payer TIN Type': tinDigits ? type : '',
        'Payer Taxpayer ID Number': tinDigits ? formatTin(tinDigits, type) : '',
        'Payer Name Type': individual ? 'I' : 'B',
        'Payer Business or Entity Name Line 1': individual ? '' : pName.value,
        'Payer First Name': split ? clean(split.first, PERSON, 20).value : '',
        'Payer Middle Name': split ? clean(split.middle, PERSON, 20).value : '',
        'Payer Last Name (Surname)': split ? clean(split.last, PERSON, 20).value : '',
        'Payer Country': 'US',
        'Payer Address Line 1': clean(payer.address1, ADDRESS, 35).value,
        'Payer Address Line 2': clean(payer.address2, ADDRESS, 35).value,
        'Payer City/Town': clean(payer.city, CITY, 40).value,
        'Payer State/Province/Territory': String(payer.state ?? '').toUpperCase(),
        'Payer ZIP/Postal Code': String(payer.zip ?? '').replace(/\D/g, ''),
        'Payer Phone Type': payer.phone ? 'D' : '',
        'Payer Phone': String(payer.phone ?? '').replace(/[^\d()\- ]/g, ''),
      };
    };
    const payerMissing = ['name', 'tin', 'address1', 'city', 'state', 'zip'].filter((f) => !payer[f]);
    if (payerMissing.length) problems.push({ payee: null, message: `Payer details missing (${payerMissing.join(', ')}): fill them in before uploading.` });
    const pc = payerCells();
    const groups = new Map(groupPayees(input).payees.map((g) => [g.key, g]));

    for (const p of result.payees) {
      if (!p.forms.length) continue;
      const d = details.get(p.key) ?? {};
      const group = groups.get(p.key);
      const firstAddr = group?.rows.find((r) => r.address)?.address ?? {};
      const tinRaw = group?.rows.find((r) => r.tinRaw)?.tinRaw ?? d.tin ?? null;
      const tinDigits = group?.tin ?? normTin(d.tin);
      const shape = tinShape(tinRaw ?? d.tin);
      const individual = d.nameType ? d.nameType === 'I' : (shape === 'SSN' || (p.payeeType === 'individual' && shape !== 'EIN'));
      const tinType = tinDigits ? (tinShape(tinRaw) ?? (individual ? 'SSN' : 'EIN')) : '';
      const name = d.name ?? p.name;
      const need = [];
      const cells = { ...pc };
      cells['Recipient TIN Type'] = tinType;
      cells['Recipient Taxpayer ID Number'] = tinDigits ? formatTin(tinDigits, tinType) : '';
      if (!tinDigits) need.push('TIN');
      else if (!tinShape(tinRaw)) need.push(`TIN type (${tinType} assumed)`);
      cells['Recipient Name Type'] = individual ? 'I' : 'B';
      if (individual) {
        const s = splitName(name);
        cells['Recipient First Name'] = clean(s.first, PERSON, 20).value;
        cells['Recipient Middle Name'] = clean(s.middle, PERSON, 20).value;
        cells['Recipient Last Name (Surname)'] = clean(s.last, PERSON, 20).value;
        cells['Recipient Suffix'] = clean(s.suffix, PERSON, 20).value;
        if (!cells['Recipient First Name'] || !cells['Recipient Last Name (Surname)']) need.push('first and last name');
        else if (!name.includes(',') && name.trim().split(/\s+/).length > 2) need.push('the name split (check first, middle and last)');
      } else {
        const c = clean(name, BUSINESS, 40);
        cells['Recipient Business or Entity Name Line 1'] = c.value;
        if (c.cut) need.push('name over 40 characters (cut)');
        if (p.payeeType === 'single-member-llc') need.push('owner\'s name as on the W-9');
      }
      cells['Recipient Country'] = 'US';
      const a1 = d.address1 ?? firstAddr.address1;
      const a2 = d.address2 ?? firstAddr.address2;
      const city = d.city ?? firstAddr.city;
      const st = d.state ?? p.states[0]?.state ?? '';
      const zip = d.zip ?? firstAddr.zip;
      cells['Recipient Address Line 1'] = clean(a1, ADDRESS, 35).value;
      cells['Recipient Address Line 2'] = clean(a2, ADDRESS, 35).value;
      cells['Recipient City/Town'] = clean(city, CITY, 40).value;
      cells['Recipient State/Province/Territory'] = String(st).toUpperCase();
      cells['Recipient ZIP/Postal Code'] = String(zip ?? '').replace(/\D/g, '');
      if (!a1 || !city || !st || !zip) need.push('address');
      cells['2nd TIN Notice'] = 'N';
      for (const r of p.report) {
        const row = { ...cells, 'Form Type': r.form, 'Tax Year': String(result.paymentYear) };
        if (r.form === '1099-NEC') {
          if (r.amounts['1a'] !== undefined) row['Box 1 - Nonemployee Compensation'] = plainAmount(r.amounts['1a']);
          row['Box 2 - Payer made direct sales totaling $5,000 or more of consumer products to a recipient for resale'] = r.checkboxes.includes('2') ? 'Y' : 'N';
          if (r.amounts['3'] !== undefined) row['Box 3 - Excess golden parachute payments'] = plainAmount(r.amounts['3']);
          if (r.amounts['4'] !== undefined) row['Box 4 - Federal income tax withheld'] = plainAmount(r.amounts['4']);
        } else {
          row['FATCA Filing Requirements'] = 'N';
          const MISC = { 1: 'Box 1 - Rents', 2: 'Box 2 - Royalties', 3: 'Box 3 - Other income', 4: 'Box 4 - Federal income tax withheld', 5: 'Box 5 - Fishing boat proceeds', 6: 'Box 6 - Medical and health care payments', 8: 'Box 8 - Substitute payments in lieu of dividends or interest', 9: 'Box 9 - Crop insurance proceeds', 10: 'Box 10 - Gross proceeds paid to an attorney', 11: 'Box 11 - Fish purchased for resale', 12: 'Box 12 - Section 409A deferrals', 15: 'Box 15 - Nonqualified deferred compensation' };
          for (const [b, cents] of Object.entries(r.amounts)) row[MISC[b]] = plainAmount(cents);
          row['Box 7 - Direct sales of $5,000 or more of consumer products to a recipient for resale'] = r.checkboxes.includes('7') ? 'Y' : 'N';
        }
        records[r.form].push(layout[r.form].map((c) => row[c] ?? ''));
      }
      if (need.length) problems.push({ payee: p.name, message: `Check before uploading: ${need.join(', ')}.` });
    }
    const files = [];
    const per = iris.portal.returnsPerUpload;
    for (const form of ['1099-NEC', '1099-MISC']) {
      const list = records[form];
      const parts = Math.ceil(list.length / per);
      for (let i = 0; i < parts; i++) {
        const chunk = list.slice(i * per, (i + 1) * per);
        files.push({ kind: 'iris', form, part: i + 1, parts, name: `iris-${form.toLowerCase()}-${result.paymentYear}${parts > 1 ? `-part${i + 1}` : ''}.csv`, records: chunk.length, csv: toCsv([layout[form], ...chunk]) });
      }
    }
    const layoutNote = result.paymentYear > iris.taxYear
      ? `Built on the IRS's tax year ${iris.taxYear} CSV layout: the ${result.paymentYear} layout is not posted yet and adds boxes (cash tips, tipped occupation codes, overtime). Compare it with the ${result.paymentYear} template in the IRIS Taxpayer Portal before uploading.`
      : `Built on the IRS's tax year ${iris.taxYear} CSV layout.`;
    return { files, checks: { problems, layoutNote, returnsPerUpload: per, portal: iris.portal, source: iris.source } };
  }

  return {
    lines,
    projection,
    dueDates,
    penalty,
    stateRecord,
    thresholds,
    check,
    scan,
    files,
  };
}

// ---------- CSV writing ----------

const FORMULA_START = /^[=+\-@\t\r]/;
const PLAIN_NUMBER = /^-?\d+(?:\.\d+)?$/;
// RFC 4180 with CRLF. `safe`: a text cell that a spreadsheet would run as a formula gets a
// leading apostrophe (the verdict CSV holds names from the upload). The IRIS file is never
// changed this way: the IRS reads it, not a spreadsheet, and names cannot start with those.
export function toCsv(rows, { safe = false } = {}) {
  const field = (v) => {
    let s = v === null || v === undefined ? '' : String(v);
    if (safe && FORMULA_START.test(s) && !PLAIN_NUMBER.test(s)) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(field).join(',')).join('\r\n') + '\r\n';
}
