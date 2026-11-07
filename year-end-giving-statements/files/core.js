// The year-end giving statements engine: reads a file of gifts, groups them into one statement per
// donor (or household) for a tax year or a date range, totals each, and writes the sentences IRS
// Publication 1771 asks a written acknowledgment to carry: the goods-or-services sentence (none,
// intangible religious benefits only, or a description and good faith estimate per gift), the
// quid pro quo disclosure for a payment over $75 that was partly for goods or services, and a
// description without a value for gifts of property.
//
// Pure and dependency-free, so the browser loads this same file: no imports, no Node APIs. The
// thresholds come in as data (tool.js reads data/irs-rules.json, the page the tool's published
// "rules" example). Money is integer micro-dollars throughout (1 USD = 1,000,000).

export class GivingError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'GivingError';
    this.field = field;
  }
}

// ---------- dates ----------

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isRealDate(s) {
  const m = ISO.exec(String(s));
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}
// "January 31, 2027"
export const longDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}, ${iso.slice(0, 4)}`;
export const weekdayOf = (iso) => WEEKDAYS[new Date(`${iso}T00:00:00Z`).getUTCDay()];
// "1/4/2026" as printed on a statement line.
export const shortDate = (iso) => `${+iso.slice(5, 7)}/${+iso.slice(8)}/${iso.slice(0, 4)}`;

// "2026-01-04", "1/4/2026", "1/4/26", "2026-01-04T10:00:00Z", "Jan 4, 2026" or "4 Jan 2026" to ISO,
// or null. Slashes are read month first, as US exports write them.
export function dateOf(value) {
  const s = String(value ?? '').trim();
  if (isRealDate(s)) return s;
  const t = /^(\d{4}-\d{2}-\d{2})[T ]/.exec(s);
  if (t && isRealDate(t[1])) return t[1];
  const us = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2}|\d{4})$/.exec(s);
  if (us) {
    const y = us[3].length === 2 ? `20${us[3]}` : us[3];
    const iso = `${y}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}`;
    return isRealDate(iso) ? iso : null;
  }
  const named = /^([A-Za-z]{3,9})\.? (\d{1,2}),? (\d{4})$/.exec(s) ?? (() => {
    const m = /^(\d{1,2}) ([A-Za-z]{3,9})\.?,? (\d{4})$/.exec(s);
    return m ? [m[0], m[2], m[1], m[3]] : null;
  })();
  if (named) {
    const i = MONTHS.findIndex((mo) => mo.toLowerCase().startsWith(named[1].toLowerCase().slice(0, 3)));
    const iso = i < 0 ? '' : `${named[3]}-${String(i + 1).padStart(2, '0')}-${named[2].padStart(2, '0')}`;
    return isRealDate(iso) ? iso : null;
  }
  return null;
}

// ---------- money ----------

const grouped = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// Micro-dollars (whole cents) to "$1,234.56" or "-$12.00".
export function usd(micros) {
  const cents = Math.round(micros / 10_000);
  const abs = Math.abs(cents);
  return `${cents < 0 ? '-' : ''}$${grouped(String(Math.floor(abs / 100)))}.${String(abs % 100).padStart(2, '0')}`;
}
// "1234.56" for a CSV cell.
export const plainUsd = (micros) => usd(micros).replace(/[$,]/g, '');

// An amount as a number or text ("1,234.50", "$50", "(25.00)", "-25", "USD 40") to micro-dollars,
// or null. More than two decimals are refused rather than rounded.
export function moneyOf(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return null;
    const cents = Math.round(value * 100);
    return Math.abs(cents - value * 100) < 1e-6 ? cents * 10_000 : null;
  }
  if (typeof value !== 'string') return null;
  let s = value.trim().replace(/^(?:USD|US\$)\s*/i, '').replace(/\s*USD$/i, '');
  let neg = false;
  const paren = /^\((.*)\)$/.exec(s);
  if (paren) { neg = true; s = paren[1].trim(); }
  if (s.startsWith('-')) { neg = !neg; s = s.slice(1).trim(); }
  s = s.replace(/^\$\s*/, '');
  if (s.startsWith('-')) { neg = !neg; s = s.slice(1).trim(); }
  s = s.replace(/,(?=\d{3}(?:\D|$))/g, '');
  const m = /^(\d+)(?:\.(\d{0,2}))?$/.exec(s);
  if (!m) return null;
  const cents = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0') || 0);
  if (!Number.isSafeInteger(cents)) return null;
  return (neg && cents ? -cents : cents) * 10_000;
}
const MAX_GIFT = 100_000_000 * 1_000_000; // $100 million on one line

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

// A CSV cell: quoted when it holds a comma, quote or line break.
export const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const csvText = (columns, rows) => `${[columns, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')}\r\n`;

// The fields a gift row can carry and the headings each is recognised by (lower case, spaces and
// punctuation ignored). The aliases cover plain sheets and the headings of common exports:
// QuickBooks reports (Customer, Name, Amount, Memo/Description, Product/Service), PayPal activity
// (Name, Gross, From Email Address) and donor databases (Constituent ID, Gift Date, Gift Amount).
export const FIELDS = {
  donor: ['donor', 'donorname', 'name', 'customer', 'customername', 'fullname', 'giver', 'family', 'familyname', 'member', 'membername', 'contributor', 'constituent', 'constituentname', 'household', 'householdname', 'payer', 'from'],
  donorId: ['donorid', 'memberid', 'envelope', 'envelopenumber', 'envelopeno', 'givingnumber', 'constituentid', 'customerid', 'householdid', 'familyid'],
  date: ['date', 'giftdate', 'donationdate', 'contributiondate', 'datereceived', 'received', 'receiveddate', 'transactiondate', 'paymentdate', 'depositdate', 'day'],
  amount: ['amount', 'giftamount', 'donationamount', 'contributionamount', 'gross', 'total', 'gift', 'donation', 'amountusd'],
  fund: ['fund', 'funddescription', 'fundname', 'designation', 'campaign', 'productservice', 'item', 'category', 'purpose'],
  method: ['method', 'paymentmethod', 'payment', 'paymenttype', 'tender', 'paidby', 'checkno', 'checknumber', 'num'],
  type: ['type', 'gifttype', 'transactiontype', 'kind', 'donationtype', 'contributiontype'],
  description: ['description', 'propertydescription', 'itemdescription', 'noncashdescription', 'inkinddescription', 'giftdescription'],
  benefitValue: ['benefitvalue', 'goodsorservicesvalue', 'goodsservicesvalue', 'goodsandservicesvalue', 'fmvreceived', 'valuereceived', 'quidproquo', 'quidproquovalue', 'nondeductible', 'nondeductibleamount', 'benefit'],
  benefitDescription: ['benefitdescription', 'goodsorservices', 'goodsorservicesdescription', 'goodsservices', 'whatreceived', 'benefitreceived'],
  address: ['address', 'street', 'streetaddress', 'address1', 'addressline1', 'mailingaddress', 'billingaddress', 'shippingaddress'],
  address2: ['address2', 'addressline2', 'street2', 'apt', 'suite', 'unit'],
  city: ['city', 'town'],
  state: ['state', 'province', 'st', 'region'],
  zip: ['zip', 'zipcode', 'postalcode', 'postcode', 'zip5'],
  email: ['email', 'emailaddress', 'fromemailaddress', 'donoremail', 'e-mail'],
};
export const FIELD_KEYS = Object.keys(FIELDS);
const squash = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
export const TEMPLATE_COLUMNS = ['Donor', 'Donor ID', 'Date', 'Amount', 'Fund', 'Method', 'Type', 'Description', 'Benefit value', 'Benefit description', 'Address', 'City', 'State', 'ZIP', 'Email'];

// Which column holds which field: explicit `columns` ({ amount: 'Gift (USD)' }) first, then the
// recognised headings, in the order of FIELDS (so "Donor" wins over "Name" for the donor).
export function mapColumns(header, columns = {}) {
  const map = {};
  const used = new Set();
  for (const [field, heading] of Object.entries(columns ?? {})) {
    const i = header.findIndex((h) => squash(h) === squash(heading));
    if (i < 0) throw new GivingError(`The column "${heading}" named for ${field} is not in the file. Its headings are: ${header.join(', ')}.`, 'columns');
    map[field] = i;
    used.add(i);
  }
  for (const field of FIELD_KEYS) {
    if (map[field] !== undefined) continue;
    let best = -1;
    let rank = Infinity;
    header.forEach((h, j) => {
      if (used.has(j)) return;
      const r = FIELDS[field].indexOf(squash(h));
      if (r >= 0 && r < rank) { best = j; rank = r; }
    });
    if (best >= 0) { map[field] = best; used.add(best); }
  }
  const missing = ['donor', 'date', 'amount'].filter((f) => map[f] === undefined && !(f === 'donor' && map.donorId !== undefined));
  if (missing.includes('amount') && map.description !== undefined) missing.splice(missing.indexOf('amount'), 1);
  if (missing.length) {
    throw new GivingError(`The file needs a donor name, a date and an amount column. It is missing ${missing.join(' and ')}. Its headings are: ${header.join(', ')}. Name them, for example { "donor": "Family", "amount": "Gift" }.`, 'columns');
  }
  return { map, unknown: header.filter((_, i) => !used.has(i)) };
}

// CSV text to raw gift objects (strings), each with its line in the file (the heading is line 1).
export function rowsFromCsv(text, columns) {
  const table = parseCsv(text);
  if (table.length < 2) throw new GivingError('The file needs a heading line and at least one gift.', 'csv');
  const [header, ...body] = table;
  const { map, unknown } = mapColumns(header, columns);
  const rows = body.map((cells, i) => {
    const r = { row: i + 2 };
    for (const [field, j] of Object.entries(map)) {
      const v = (cells[j] ?? '').trim();
      if (v !== '') r[field] = v;
    }
    return r;
  });
  return { rows, header, mapped: Object.fromEntries(Object.entries(map).map(([f, i]) => [f, header[i]])), unknown };
}

// How many gift rows an input has, without reading them.
export function countRows({ gifts, csv }) {
  if (csv !== undefined) return Math.max(0, parseCsv(csv).length - 1);
  return (gifts ?? []).length;
}

// ---------- donors ----------

const text = (v, max = 200) => (v === undefined || v === null ? '' : String(v).replace(/\s+/g, ' ').trim().slice(0, max));

// "Smith, John" -> "John Smith"; anything else as written. Only one comma, and not a company
// suffix ("Acme, Inc."), counts as last-name-first.
const SUFFIX = /^(?:inc|llc|ltd|co|corp|jr|sr|ii|iii|iv|md|phd|esq)\.?$/i;
export function flipName(name) {
  const parts = name.split(',');
  if (parts.length !== 2) return name;
  const [last, first] = parts.map((p) => p.trim());
  if (!last || !first || SUFFIX.test(first)) return name;
  return `${first} ${last}`;
}
// The key a donor name groups under: case, punctuation and spacing ignored, and "Smith, John" the
// same as "John Smith".
export function nameKey(name) {
  return flipName(text(name)).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim();
}

// Words that mark a gift of property rather than money, and words that mark a refund.
const NONCASH = /\b(?:in[- ]?kind|non[- ]?cash|noncash|property|stock|securities|shares|goods|donated items?|item donation|vehicle|car|truck|boat|airplane|equipment)\b/i;
const REFUND = /\b(?:refund|refunded|reversal|reversed|chargeback|returned|void)\b/i;
const VEHICLE = /\b(?:vehicle|car|truck|van|suv|motorcycle|boat|airplane|aircraft|rv)\b/i;

// One raw gift (from JSON or a CSV row) to a clean gift, or a GivingError naming the row.
export function readGift(raw, row) {
  const where = row ? `Row ${row}: ` : '';
  const fail = (msg) => { throw new GivingError(`${where}${msg}`, 'gifts'); };
  const donor = text(raw.donor, 120);
  const donorId = text(raw.donorId, 60);
  if (!donor && !donorId) fail('the donor is missing.');
  const date = dateOf(raw.date);
  if (!date) fail(raw.date === undefined || raw.date === '' ? 'the gift date is missing.' : `"${raw.date}" is not a date. Write 2026-01-04 or 1/4/2026.`);
  const type = text(raw.type, 60);
  const description = text(raw.description, 200);
  const hasAmount = raw.amount !== undefined && raw.amount !== null && String(raw.amount).trim() !== '';
  const noncash = NONCASH.test(type) || (!hasAmount && description !== '');
  let amount = 0;
  if (!noncash) {
    if (!hasAmount) fail('the amount is missing (for a gift of property, give a description and no amount).');
    amount = moneyOf(raw.amount);
    if (amount === null) fail(`"${raw.amount}" is not an amount in dollars and cents.`);
    if (Math.abs(amount) > MAX_GIFT) fail('an amount over $100,000,000.');
    if (REFUND.test(type) && amount > 0) amount = -amount;
  } else if (!description) {
    fail(`a gift of property ("${type}") needs a description of what was given; its value is not printed.`);
  }
  let benefit = 0;
  if (raw.benefitValue !== undefined && raw.benefitValue !== null && String(raw.benefitValue).trim() !== '') {
    benefit = moneyOf(raw.benefitValue);
    if (benefit === null || benefit < 0) fail(`the benefit value "${raw.benefitValue}" is not an amount in dollars and cents.`);
  }
  const benefitDescription = text(raw.benefitDescription, 120);
  if (benefit > 0 && noncash) fail('goods or services given back for a gift of property are not handled; list that gift on its own acknowledgment.');
  if (benefit > 0 && amount <= 0) fail('a benefit value on a refund or a zero amount.');
  if (benefit > amount && amount > 0) fail(`the benefit value ${usd(benefit)} is more than the payment ${usd(amount)}, so nothing of it is a gift.`);
  return {
    row: row ?? null,
    donor,
    donorId,
    date,
    amount,
    noncash,
    refund: amount < 0,
    description,
    fund: text(raw.fund, 80),
    method: text(raw.method, 40),
    benefit,
    benefitDescription,
    address: text(raw.address, 120),
    address2: text(raw.address2, 80),
    city: text(raw.city, 60),
    state: text(raw.state, 30),
    zip: text(raw.zip, 15),
    email: text(raw.email, 120),
  };
}

// Gifts from either { gifts: [...] } (objects) or { csv, columns? }, numbered as in the file.
export function readGifts({ gifts, csv, columns }) {
  if (csv !== undefined) {
    const read = rowsFromCsv(csv, columns);
    return { gifts: read.rows.map((r) => readGift(r, r.row)), mapped: read.mapped, unknown: read.unknown };
  }
  return { gifts: (gifts ?? []).map((g, i) => readGift(g, g.row ?? i + 1)), mapped: null, unknown: [] };
}

// ---------- the period ----------

// { year } or { from, to } to { from, to, label, code }.
export function periodOf({ year, from, to }) {
  if (year !== undefined && year !== null) {
    return { from: `${year}-01-01`, to: `${year}-12-31`, year, label: String(year), words: `in ${year}`, code: String(year) };
  }
  if (!isRealDate(from) || !isRealDate(to)) throw new GivingError('Give a tax year, or a from and to date.', 'year');
  if (to < from) throw new GivingError('The to date is before the from date.', 'to');
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  const label = sameYear
    ? `${MONTHS[+from.slice(5, 7) - 1]} ${+from.slice(8)} to ${longDate(to)}`
    : `${longDate(from)} to ${longDate(to)}`;
  return { from, to, year: sameYear ? +from.slice(0, 4) : null, label, words: `from ${label}`, code: `${from}_${to}` };
}

// ---------- the engine ----------

// rules: data/irs-rules.json (thresholds in whole dollars).
export function makeEngine(rules) {
  const ACK = rules.thresholds.acknowledgmentUsd * 1_000_000;
  const QPQ = rules.thresholds.quidProQuoUsd * 1_000_000;

  // Which donor group each gift belongs to: the donor ID when the file has one, else the name key;
  // a merge entry ({ into, from: [names or IDs] }) puts several donors under one statement.
  function grouper(merge = []) {
    const into = new Map();
    for (const m of merge ?? []) {
      for (const f of m.from) into.set(nameKey(f), m.into);
    }
    return (g) => {
      const named = into.get(nameKey(g.donorId)) ?? into.get(nameKey(g.donor));
      if (named) return { key: `m:${nameKey(named)}`, name: named };
      if (g.donorId) return { key: `i:${g.donorId.toLowerCase()}`, name: null };
      return { key: `n:${nameKey(g.donor)}`, name: null };
    };
  }

  // The donor-period keys a file would make statements for (what the price counts), without
  // reading anything else.
  function statementKeys({ gifts, merge, period }) {
    const group = grouper(merge);
    const keys = new Set();
    for (const g of gifts) if (g.date >= period.from && g.date <= period.to) keys.add(group(g).key);
    return [...keys].sort();
  }

  // The goods-or-services sentence for one statement (Pub 1771 items 4 to 6).
  function wording({ religious, lines, orgName }) {
    const withBenefit = lines.filter((l) => l.benefit > 0);
    const none = religious
      ? 'The only goods or services provided in exchange for these contributions were intangible religious benefits.'
      : 'No goods or services were provided in exchange for these contributions.';
    if (!withBenefit.length) return { sentence: none, disclosure: null };
    const rest = religious
      ? 'For the other contributions, the only goods or services provided were intangible religious benefits.'
      : 'No goods or services were provided in exchange for the other contributions.';
    const all = withBenefit.length === lines.filter((l) => !l.noncash && !l.refund).length;
    const sentence = `${orgName} provided goods or services in exchange for the ${withBenefit.length === 1 ? 'contribution' : 'contributions'} marked *, described with our good faith estimate of their fair market value on ${withBenefit.length === 1 ? 'that line' : 'those lines'}.${all ? '' : ` ${rest}`}`;
    const disclosure = 'The amount of a contribution that is deductible for federal income tax purposes is limited to the excess of the money (and the value of any property) you gave over the value of the goods or services we provided.';
    return { sentence, disclosure };
  }

  // Everything but the PDFs. Throws GivingError for anything it cannot read.
  function build({ org, period: p, gifts, merge = [], mapped = null, unknown = [] }) {
    const period = periodOf(p);
    const religious = (org.benefits ?? (org.kind === 'church' ? 'religious' : 'none')) === 'religious';
    const group = grouper(merge);
    const inside = [];
    const outside = [];
    for (const g of gifts) (g.date >= period.from && g.date <= period.to ? inside : outside).push(g);
    if (!inside.length) {
      const years = [...new Set(gifts.map((g) => g.date.slice(0, 4)))].sort();
      throw new GivingError(`No gifts fall ${period.words}. The file's gifts are dated ${years.join(', ')}.`, 'year');
    }

    const byKey = new Map();
    for (const g of inside) {
      const { key, name } = group(g);
      if (!byKey.has(key)) byKey.set(key, { key, mergedName: name, gifts: [] });
      byKey.get(key).gifts.push(g);
    }

    const donors = [...byKey.values()].map((d) => {
      const lines = [...d.gifts].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.row ?? 0) - (b.row ?? 0)));
      const spellings = [...new Set(lines.map((l) => l.donor).filter(Boolean))];
      const first = spellings[0] ?? '';
      const name = d.mergedName ?? (org.namesLastFirst ? flipName(first) : first) ?? '';
      const id = [...new Set(lines.map((l) => l.donorId).filter(Boolean))][0] ?? '';
      const withAddress = lines.filter((l) => l.address || l.city || l.zip);
      const addr = withAddress[0] ?? null;
      const addressLines = addr ? [addr.address, addr.address2, [addr.city, [addr.state, addr.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')].filter(Boolean) : [];
      const addressSet = new Set(withAddress.map((l) => [l.address, l.city, l.zip].join('|').toLowerCase()));
      const email = lines.find((l) => l.email)?.email ?? '';

      const cash = lines.filter((l) => !l.noncash);
      const cashTotal = cash.reduce((s, l) => s + l.amount, 0);
      const benefits = cash.reduce((s, l) => s + l.benefit, 0);
      const largeGifts = cash.filter((l) => l.amount >= ACK).length;
      const qpq = cash.filter((l) => l.benefit > 0 && l.amount > QPQ);
      const property = lines.filter((l) => l.noncash);
      const funds = [...new Set(cash.map((l) => l.fund).filter(Boolean))];
      const byFund = funds.length > 1 ? funds.map((f) => ({ fund: f, total: cash.filter((l) => l.fund === f).reduce((s, l) => s + l.amount, 0) })) : [];

      const flags = [];
      const flag = (code, message, row = null) => flags.push({ code, row, message });
      if (spellings.length > 1) flag('merged-names', `Merged under one statement: ${spellings.join('; ')}.`);
      if (addressSet.size > 1) flag('addresses', `${addressSet.size} different addresses; the first is printed.`);
      for (const l of cash) if (l.refund) flag('refund', `A refund or reversal of ${usd(-l.amount)} on ${shortDate(l.date)} is subtracted from the total.`, l.row);
      if (cashTotal <= 0 && cash.length) flag('not-positive', `The money total is ${usd(cashTotal)}; check before sending.`);
      for (const l of qpq) flag('quid-pro-quo', `${usd(l.amount)} on ${shortDate(l.date)} was more than $${rules.thresholds.quidProQuoUsd} and partly for goods or services: Pub 1771 requires a disclosure statement at the time of the solicitation or receipt. This statement repeats it but does not replace one owed then.`, l.row);
      for (const l of property) {
        if (VEHICLE.test(`${l.description}`)) flag('vehicle', `"${l.description}": a donated motor vehicle, boat or airplane claimed at over $${rules.thresholds.vehicleClaimUsd} follows Form 1098-C rules, not Pub 1771.`, l.row);
      }
      for (const l of cash) if (l.benefit > 0 && !l.benefitDescription) flag('benefit-description', `The goods or services for ${usd(l.amount)} on ${shortDate(l.date)} have a value but no description; Pub 1771 asks for both.`, l.row);
      const w = wording({ religious, lines: cash, orgName: org.name });
      return {
        key: d.key,
        name,
        id,
        addressLines,
        email,
        lines: lines.map((l) => ({
          row: l.row,
          date: l.date,
          fund: l.fund,
          method: l.method,
          noncash: l.noncash,
          refund: l.refund,
          amount: l.amount,
          description: l.description,
          benefit: l.benefit,
          benefitDescription: l.benefitDescription,
          deductible: l.noncash ? null : l.amount - l.benefit,
          large: !l.noncash && l.amount >= ACK,
        })),
        gifts: cash.length,
        propertyGifts: property.length,
        cash: cashTotal,
        benefits,
        deductible: cashTotal - benefits,
        byFund,
        largeGifts,
        quidProQuo: qpq.length,
        sentence: w.sentence,
        disclosure: w.disclosure,
        flags,
      };
    }).sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase() ? -1 : a.name.toLowerCase() > b.name.toLowerCase() ? 1 : a.key < b.key ? -1 : 1));

    // File names: the donor's name, made unique.
    const used = new Map();
    for (const d of donors) {
      const base = `${period.code}-${slugOf(d.name || d.id || 'donor')}`;
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      d.file = `giving-statement-${base}${n > 1 ? `-${n}` : ''}.pdf`;
    }

    const total = donors.reduce((s, d) => s + d.cash, 0);
    const large = donors.filter((d) => d.largeGifts > 0).length;
    const totals = {
      donors: donors.length,
      gifts: donors.reduce((s, d) => s + d.gifts, 0),
      propertyGifts: donors.reduce((s, d) => s + d.propertyGifts, 0),
      cash: total,
      benefits: donors.reduce((s, d) => s + d.benefits, 0),
      deductible: donors.reduce((s, d) => s + d.deductible, 0),
      largeGiftStatements: large,
      quidProQuoGifts: donors.reduce((s, d) => s + d.quidProQuo, 0),
      setAside: outside.length,
    };
    const answer = `${count(donors.length, 'donor')} gave ${usd(total)} ${period.words}${totals.propertyGifts ? `, plus ${count(totals.propertyGifts, 'gift')} of property` : ''}; ${large === 1 ? '1 statement includes' : `${large} statements include`} a single gift of $${rules.thresholds.acknowledgmentUsd} or more, and ${donors.length === 1 ? 'it carries' : 'every statement carries'} the IRS goods-or-services sentence.`;
    const flags = donors.flatMap((d) => d.flags.map((f) => ({ donor: d.name, ...f })));
    if (outside.length) {
      const rows = outside.map((g) => g.row).filter((r) => r !== null);
      flags.push({ donor: null, code: 'outside-period', row: null, message: `${count(outside.length, 'gift')} dated outside ${period.label} set aside${rows.length ? ` (rows ${rowList(rows)})` : ''}.` });
    }
    return {
      answer,
      org: { ...org, religious },
      period,
      totals,
      donors,
      flags,
      columnsUsed: mapped,
      columnsIgnored: unknown,
    };
  }

  // The summary for the books: one line per statement.
  function summaryCsv(r) {
    return csvText(
      ['donor', 'donor_id', 'file', 'money_gifts', 'money_total', 'goods_services_value', 'deductible_estimate', 'property_gifts', 'gifts_250_or_more', 'quid_pro_quo_gifts', 'email', 'flags'],
      r.donors.map((d) => [d.name, d.id, d.file, d.gifts, plainUsd(d.cash), plainUsd(d.benefits), plainUsd(d.deductible), d.propertyGifts, d.largeGifts, d.quidProQuo, d.email, d.flags.map((f) => f.code).join(' ')]),
    );
  }
  // The list to send from: donors with an email address.
  function emailCsv(r) {
    const rows = r.donors.filter((d) => d.email).map((d) => [d.name, d.email, d.file, plainUsd(d.cash)]);
    return rows.length ? csvText(['donor', 'email', 'file', 'money_total'], rows) : null;
  }

  return { build, statementKeys, summaryCsv, emailCsv, wording, grouper, ACK, QPQ };
}

const count = (n, word) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`;
function rowList(rows) {
  const shown = rows.slice(0, 12).join(', ');
  return rows.length > 12 ? `${shown} and ${rows.length - 12} more` : shown;
}
export const slugOf = (s) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'donor';

// ---------- a zip of the per-donor files ----------

// CRC-32 (IEEE), as zip needs it.
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
export function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// Files ([{ name, bytes: Uint8Array }]) to a stored (uncompressed: PDFs are already compressed)
// zip archive. Deterministic: every entry is dated 1980-01-01 00:00, the zip epoch.
export function zipStore(files) {
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  const u16 = (v) => [v & 0xff, (v >>> 8) & 0xff];
  const u32 = (v) => [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
  const DOS_DATE = (0 << 9) | (1 << 5) | 1; // 1980-01-01
  for (const f of files) {
    const name = enc.encode(f.name);
    const crc = crc32(f.bytes);
    const size = f.bytes.length;
    const local = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(DOS_DATE), ...u32(crc), ...u32(size), ...u32(size), ...u16(name.length), ...u16(0)]);
    parts.push(local, name, f.bytes);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(DOS_DATE), ...u32(crc), ...u32(size), ...u32(size), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), name);
    offset += local.length + name.length + size;
  }
  const centralSize = central.reduce((s, p) => s + p.length, 0);
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(centralSize), ...u32(offset), ...u16(0)]);
  const all = [...parts, ...central, end];
  const out = new Uint8Array(all.reduce((s, p) => s + p.length, 0));
  let at = 0;
  for (const p of all) { out.set(p, at); at += p.length; }
  return out;
}
