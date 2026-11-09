// The donor acknowledgment letter engine: reads a list of gifts and works out, for each gift, which
// letter it needs and what that letter says. The variants:
//   cash          money given, nothing back: the no-goods-or-services sentence (IRS Pub 1771), or
//                 for a church the intangible religious benefits sentence
//   quid-pro-quo  a payment partly for goods or services (a gala ticket): their description and the
//                 good faith estimate, and over $75 the disclosure that only the excess is deductible
//   in-kind       goods: described, never valued (Pub 1771)
//   stock         shares or other securities: described (count and issuer), never valued
//   daf           a grant from a donor-advised fund: a thank-you to the advisor naming the sponsor,
//                 with no tax-receipt language (the sponsor is the legal donor)
//   pledge        a promise to give: a confirmation, not a receipt
//   services      volunteer time or professional services: a thank-you, not a receipt (Pub 526)
// A gift made in memory or in honor of someone adds a line, and a notice to the family that names
// the donor but never the amount. Each gift is also put in segments (first gift, repeat, lapsed,
// major, monthly) that choose the letter's opening line and can filter the batch.
//
// Pure and dependency-free, so the browser loads this same file: no imports, no Node APIs. The
// thresholds come in as data (tool.js reads the IRS rules file; the page reads the tool's published
// "rules" example). Money is integer micro-dollars throughout (1 USD = 1,000,000). The reading
// helpers (dates, money, CSV, names, zip) are copied from the year-end giving statements tool's
// core.js so the two tools read a sheet the same way but change independently.

export class AckError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'AckError';
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


// ---------- names ----------

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


// ---------- the gift fields ----------

// The fields a gift row can carry and the headings each is recognised by (lower case, spaces and
// punctuation ignored). Plain sheets and common exports (QuickBooks, PayPal, donor databases).
export const FIELDS = {
  donor: ['donor', 'donorname', 'name', 'customer', 'customername', 'fullname', 'giver', 'member', 'membername', 'contributor', 'constituent', 'constituentname', 'household', 'householdname', 'payer', 'from'],
  donorId: ['donorid', 'memberid', 'envelope', 'envelopenumber', 'constituentid', 'customerid', 'householdid'],
  salutation: ['salutation', 'dear', 'greeting', 'addressee', 'informalname', 'nickname'],
  date: ['date', 'giftdate', 'donationdate', 'contributiondate', 'datereceived', 'received', 'receiveddate', 'transactiondate', 'paymentdate', 'depositdate', 'pledgedate'],
  amount: ['amount', 'giftamount', 'donationamount', 'contributionamount', 'pledgeamount', 'grantamount', 'gross', 'total', 'gift', 'donation', 'amountusd'],
  type: ['type', 'gifttype', 'transactiontype', 'kind', 'donationtype', 'contributiontype', 'paymenttype'],
  description: ['description', 'propertydescription', 'itemdescription', 'noncashdescription', 'inkinddescription', 'giftdescription', 'items', 'schedule', 'pledgeschedule'],
  benefitValue: ['benefitvalue', 'goodsorservicesvalue', 'goodsservicesvalue', 'goodsandservicesvalue', 'fmvreceived', 'valuereceived', 'quidproquo', 'quidproquovalue', 'nondeductible', 'nondeductibleamount', 'benefit'],
  benefitDescription: ['benefitdescription', 'goodsorservices', 'goodsorservicesdescription', 'goodsservices', 'whatreceived', 'benefitreceived'],
  fund: ['fund', 'funddescription', 'designation', 'campaign', 'appeal', 'productservice', 'purpose'],
  method: ['method', 'paymentmethod', 'payment', 'tender', 'paidby', 'checkno', 'checknumber', 'num'],
  daf: ['daf', 'dafsponsor', 'sponsor', 'sponsoringorganization', 'donoradvisedfund', 'dafname', 'grantor', 'grantmaker'],
  memoryOf: ['inmemoryof', 'memoryof', 'inmemory', 'memorial', 'memorialfor'],
  honorOf: ['inhonorof', 'honorof', 'inhonourof', 'inhonor', 'tribute', 'tributename', 'honoree'],
  notify: ['notify', 'notifyname', 'notifyfamily', 'familytonotify', 'acknowledgee', 'tributenotify', 'sendnoticeto'],
  notifyAddress: ['notifyaddress', 'acknowledgeeaddress', 'familyaddress', 'noticeaddress'],
  firstGiftDate: ['firstgiftdate', 'firstgift', 'firstdonationdate', 'datefirstgift'],
  previousGiftDate: ['previousgiftdate', 'lastgiftdate', 'priorgiftdate', 'lastdonationdate', 'previousgift'],
  address: ['address', 'street', 'streetaddress', 'address1', 'addressline1', 'mailingaddress', 'billingaddress'],
  address2: ['address2', 'addressline2', 'street2', 'apt', 'suite', 'unit'],
  city: ['city', 'town'],
  state: ['state', 'province', 'st', 'region'],
  zip: ['zip', 'zipcode', 'postalcode', 'postcode', 'zip5'],
  email: ['email', 'emailaddress', 'fromemailaddress', 'donoremail', 'e-mail'],
};
export const FIELD_KEYS = Object.keys(FIELDS);
const squash = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
export const TEMPLATE_COLUMNS = ['Donor', 'Date', 'Amount', 'Type', 'Description', 'Fund', 'Method', 'Benefit value', 'Benefit description', 'DAF sponsor', 'In memory of', 'In honor of', 'Notify', 'Notify address', 'Address', 'City', 'State', 'ZIP', 'Email'];

// Which column holds which field: explicit `columns` first, then the recognised headings.
export function mapColumns(header, columns = {}) {
  const map = {};
  const used = new Set();
  for (const [field, heading] of Object.entries(columns ?? {})) {
    const i = header.findIndex((h) => squash(h) === squash(heading));
    if (i < 0) throw new AckError(`The column "${heading}" named for ${field} is not in the file. Its headings are: ${header.join(', ')}.`, 'columns');
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
  const missing = ['donor', 'date'].filter((f) => map[f] === undefined && !(f === 'donor' && map.donorId !== undefined));
  if (map.amount === undefined && map.description === undefined) missing.push('amount (or a description for gifts of property)');
  if (missing.length) {
    throw new AckError(`The file needs a donor name, a gift date and an amount column. It is missing ${missing.join(' and ')}. Its headings are: ${header.join(', ')}. Name them, for example { "donor": "Name", "amount": "Gift" }.`, 'columns');
  }
  return { map, unknown: header.filter((_, i) => !used.has(i)) };
}

// CSV text to raw gift objects (strings), each with its line in the file (the heading is line 1).
export function rowsFromCsv(text, columns) {
  const table = parseCsv(text);
  if (table.length < 2) throw new AckError('The file needs a heading line and at least one gift.', 'csv');
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
  return { rows, mapped: Object.fromEntries(Object.entries(map).map(([f, i]) => [f, header[i]])), unknown };
}

export function countRows({ gifts, csv }) {
  if (csv !== undefined) return Math.max(0, parseCsv(csv).length - 1);
  return (gifts ?? []).length;
}

// ---------- one gift ----------

const PLEDGE = /\b(?:pledges?|pledged|promise|commitment)\b/i;
const DAF = /\b(?:daf|donor[- ]advised(?: fund)?)\b/i;
const SERVICES = /\b(?:services?|volunteer(?:ed|ing)?|labou?r|pro bono|time)\b/i;
const STOCK = /\b(?:stocks?|securities|security|shares?|mutual funds?|bonds?|etfs?)\b/i;
const NONCASH = /\b(?:in[- ]?kind|non[- ]?cash|noncash|property|goods|donated items?|items?|gik|vehicle|car|truck|boat|equipment|stocks?|securities|shares)\b/i;
const REFUND = /\b(?:refund|refunded|reversal|reversed|chargeback|returned|void)\b/i;
const VEHICLE = /\b(?:vehicles?|cars?|automobile|sedan|pickup|truck|van|suv|motorcycle|boat|yacht|airplane|aircraft|rv)\b/i;
const MONTHLY = /\b(?:monthly|recurring|sustainer|sustaining)\b/i;
const MAX_GIFT = 100_000_000 * 1_000_000; // $100 million

export const VARIANTS = ['cash', 'quid-pro-quo', 'in-kind', 'stock', 'daf', 'pledge', 'services'];
export const SEGMENTS = ['first', 'repeat', 'lapsed', 'major', 'monthly', 'memorial', 'honor'];

const present = (v) => v !== undefined && v !== null && String(v).trim() !== '';

// One raw gift (from JSON or a CSV row) to a clean gift with its variant, or an AckError naming the
// row; a refund is returned with setAside so the batch can count it.
export function readGift(raw, row) {
  const where = row ? `Row ${row}: ` : '';
  const fail = (msg) => { throw new AckError(`${where}${msg}`, 'gifts'); };
  const donor = text(raw.donor, 120);
  const donorId = text(raw.donorId, 60);
  if (!donor && !donorId) fail('the donor is missing.');
  const date = dateOf(raw.date);
  if (!date) fail(!present(raw.date) ? 'the gift date is missing.' : `"${raw.date}" is not a date. Write 2026-01-04 or 1/4/2026.`);
  const type = text(raw.type, 60);
  const method = text(raw.method, 40);
  const description = text(raw.description, 200);
  const daf = text(raw.daf, 120);
  const hasAmount = present(raw.amount);
  let amount = null;
  if (hasAmount) {
    amount = moneyOf(raw.amount);
    if (amount === null) fail(`"${raw.amount}" is not an amount in dollars and cents.`);
    if (Math.abs(amount) > MAX_GIFT) fail('an amount over $100,000,000.');
  }
  const base = { row: row ?? null, donor, donorId, date, type, method, description };
  if (REFUND.test(type) || (amount !== null && amount < 0)) return { ...base, setAside: 'refund' };

  let variant;
  if (PLEDGE.test(type)) variant = 'pledge';
  else if (DAF.test(type) || DAF.test(method) || daf) variant = 'daf';
  else if (SERVICES.test(type) && !STOCK.test(type)) variant = 'services';
  else if (STOCK.test(type) || (!hasAmount && /\bshares?\b/i.test(description))) variant = 'stock';
  else if (NONCASH.test(type) || (!hasAmount && description)) variant = 'in-kind';
  else variant = 'cash';

  const flags = [];
  if (['pledge', 'daf', 'cash'].includes(variant)) {
    if (!hasAmount) fail(variant === 'cash' ? 'the amount is missing (for a gift of property, give a description and no amount).' : `the ${variant === 'daf' ? 'grant' : 'pledge'} amount is missing.`);
    if (amount === 0) fail('an amount of $0.00 is not a gift.');
  }
  if (['in-kind', 'stock', 'services'].includes(variant)) {
    if (!description) fail(`a ${variant === 'services' ? 'gift of services' : variant === 'stock' ? 'gift of stock' : 'gift of property'} needs a description of what was given${variant === 'services' ? '' : ', such as "50 shares of Example Corp common stock"; its value is never printed'}.`);
    if (hasAmount && amount > 0 && variant !== 'services') flags.push({ code: 'value-not-printed', message: `The ${usd(amount)} in the amount column is not printed: a gift of property is described, not valued.` });
    amount = 0;
  }

  let benefit = 0;
  if (present(raw.benefitValue)) {
    benefit = moneyOf(raw.benefitValue);
    if (benefit === null || benefit < 0) fail(`the benefit value "${raw.benefitValue}" is not an amount in dollars and cents.`);
  }
  const benefitDescription = text(raw.benefitDescription, 120);
  if (benefit > 0) {
    if (variant !== 'cash') fail(`goods or services given back for ${variant === 'daf' ? 'a donor-advised fund grant' : variant === 'pledge' ? 'a pledge' : 'a gift that is not money'} are not handled; acknowledge that gift on its own.`);
    if (benefit > amount) fail(`the benefit value ${usd(benefit)} is more than the payment ${usd(amount)}, so nothing of it is a gift.`);
    if (!benefitDescription) fail('goods or services with a value need a description too (Pub 1771 asks for both), such as "Gala dinner ticket".');
    variant = 'quid-pro-quo';
  }

  const memory = text(raw.memoryOf, 120);
  const honor = text(raw.honorOf, 120);
  if (memory && honor) fail('a gift can be in memory of or in honor of someone, not both.');
  const tribute = memory ? { kind: 'memory', name: memory } : honor ? { kind: 'honor', name: honor } : null;
  const notify = text(raw.notify, 120);
  if (notify && !tribute) flags.push({ code: 'notify-without-tribute', message: `"${notify}" is named to notify, but the gift is not in memory or in honor of anyone; no notice is made.` });
  if (variant === 'in-kind' && VEHICLE.test(description)) flags.push({ code: 'vehicle', message: `"${description}": a donated motor vehicle, boat or airplane claimed at over $500 follows Form 1098-C rules, not this letter.` });
  if (variant === 'daf' && !daf) flags.push({ code: 'daf-sponsor', message: 'No DAF sponsor named (a "DAF sponsor" column); the letter says "your donor-advised fund".' });

  const firstGiftDate = present(raw.firstGiftDate) ? dateOf(raw.firstGiftDate) : null;
  const previousGiftDate = present(raw.previousGiftDate) ? dateOf(raw.previousGiftDate) : null;
  if (present(raw.firstGiftDate) && !firstGiftDate) fail(`the first gift date "${raw.firstGiftDate}" is not a date.`);
  if (present(raw.previousGiftDate) && !previousGiftDate) fail(`the previous gift date "${raw.previousGiftDate}" is not a date.`);

  return {
    ...base,
    variant,
    amount,
    benefit,
    benefitDescription,
    fund: text(raw.fund, 80),
    salutation: text(raw.salutation, 80),
    daf,
    tribute,
    notify: tribute ? notify : '',
    notifyAddress: tribute ? text(raw.notifyAddress, 200) : '',
    firstGiftDate,
    previousGiftDate,
    monthly: MONTHLY.test(`${type} ${method} ${text(raw.fund, 80)}`),
    address: text(raw.address, 120),
    address2: text(raw.address2, 80),
    city: text(raw.city, 60),
    state: text(raw.state, 30),
    zip: text(raw.zip, 15),
    email: text(raw.email, 120),
    flags,
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

// ISO date plus whole months, clamped to the month's last day.
export function addMonths(iso, n) {
  const y = +iso.slice(0, 4);
  const m = +iso.slice(5, 7) - 1 + n;
  const yy = y + Math.floor(m / 12);
  const mm = ((m % 12) + 12) % 12;
  const last = new Date(Date.UTC(yy, mm + 1, 0)).getUTCDate();
  return `${yy}-${String(mm + 1).padStart(2, '0')}-${String(Math.min(+iso.slice(8), last)).padStart(2, '0')}`;
}

const count = (n, word, plural = `${word}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? word : plural}`;
const donorKeyOf = (g) => (g.donorId ? `i:${g.donorId.toLowerCase()}` : `n:${nameKey(g.donor)}`);
const giftKeyOf = (g) => `${g.variant}|${donorKeyOf(g)}|${g.date}|${g.amount ? g.amount : nameKey(g.description)}`;

// ---------- the engine ----------

// rules: { thresholds } from the IRS rules file (whole dollars).
export function makeEngine(rules) {
  const ACK = rules.thresholds.acknowledgmentUsd * 1_000_000;
  const QPQ = rules.thresholds.quidProQuoUsd * 1_000_000;

  // The IRS sentence for a gift (Pub 1771 items 4 to 6), and the disclosure when one is due.
  function irsSentences(g, religious) {
    if (g.variant === 'quid-pro-quo') {
      const out = [`In exchange for your payment, we provided goods or services: ${g.benefitDescription}. Our good faith estimate of their fair market value is ${usd(g.benefit)}.`];
      if (g.amount > QPQ) out.push(`The amount of your contribution that is deductible for federal income tax purposes is limited to the excess of the money you gave (${usd(g.amount)}) over the value of the goods or services we provided (${usd(g.benefit)}), that is ${usd(g.amount - g.benefit)}.`);
      return out;
    }
    if (g.variant === 'daf') return ['No goods or services were provided in exchange for this grant.'];
    if (['pledge', 'services'].includes(g.variant)) return [];
    return [religious
      ? 'The only goods or services provided in exchange for your contribution were intangible religious benefits.'
      : 'No goods or services were provided in exchange for your contribution.'];
  }

  // The segments of every gift, from the file's own history (or the first and previous gift
  // dates when the file has them).
  function segmentsOf(gifts, { majorUsd = 1000, lapsedMonths = 12 } = {}) {
    const byDonor = new Map();
    for (const g of gifts) {
      const k = donorKeyOf(g);
      if (!byDonor.has(k)) byDonor.set(k, []);
      byDonor.get(k).push(g);
    }
    const out = new Map();
    for (const list of byDonor.values()) {
      const sorted = [...list].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.row ?? 0) - (b.row ?? 0)));
      sorted.forEach((g, i) => {
        const prev = g.previousGiftDate ?? (i > 0 ? sorted[i - 1].date : null);
        const first = g.firstGiftDate ? g.firstGiftDate === g.date : g.previousGiftDate ? false : i === 0;
        const s = [first ? 'first' : 'repeat'];
        if (!first && prev && addMonths(prev, lapsedMonths) < g.date) s.push('lapsed');
        if (['cash', 'quid-pro-quo', 'daf', 'pledge'].includes(g.variant) && g.amount >= majorUsd * 1_000_000) s.push('major');
        if (g.monthly) s.push('monthly');
        if (g.tribute) s.push(g.tribute.kind === 'memory' ? 'memorial' : 'honor');
        out.set(g, { segments: s, previous: prev });
      });
    }
    return out;
  }

  const opening = (segments, orgName) => {
    if (segments.includes('first')) return `Thank you for your first gift to ${orgName}.`;
    if (segments.includes('lapsed')) return `Thank you for giving to ${orgName} again; it is good to have you back.`;
    if (segments.includes('major')) return `Thank you for your generous gift to ${orgName}.`;
    if (segments.includes('monthly')) return `Thank you for your monthly gift to ${orgName}.`;
    return `Thank you for your continued support of ${orgName}.`;
  };

  const fundPart = (g) => (g.fund && !/^general$/i.test(g.fund) ? ` for ${g.fund}` : '');

  // The body of one letter: paragraphs in order; irs are the sentences printed in bold.
  function letterFor(g, seg, org, opts) {
    const religious = (org.benefits ?? (org.kind === 'church' ? 'religious' : 'none')) === 'religious';
    const when = longDate(g.date);
    const paras = [];
    if (opts.replacement) paras.push('This letter replaces our earlier acknowledgment of the same gift.');
    const sponsor = g.daf || 'your donor-advised fund';
    switch (g.variant) {
      case 'pledge':
        paras.push(`Thank you for your pledge of ${usd(g.amount)} to ${org.name}, made on ${when}${g.description ? `: ${g.description}` : ''}.`);
        paras.push('This letter confirms your pledge; it is not a receipt. We will acknowledge each payment when we receive it.');
        break;
      case 'services':
        paras.push(`Thank you for giving your time and skill to ${org.name}: ${g.description}, on ${when}.`);
        paras.push('This letter thanks you for your service; it is not a receipt for a contribution of money or property.');
        break;
      case 'daf':
        paras.push(opening(seg.segments, org.name));
        paras.push(`We received a grant of ${usd(g.amount)} on ${when} from ${sponsor}, made on your recommendation${fundPart(g)}.`);
        paras.push(`Because ${g.daf ? g.daf : 'the sponsoring organization of your fund'} made the grant, this letter is a thank-you and not a receipt for a tax deduction.`);
        break;
      case 'in-kind':
      case 'stock':
        paras.push(opening(seg.segments, org.name));
        paras.push(`We received your gift of ${g.description} on ${when}${fundPart(g)}. This letter describes your gift; it does not state its value.`);
        break;
      case 'quid-pro-quo':
        paras.push(opening(seg.segments, org.name));
        paras.push(`We received your payment of ${usd(g.amount)} on ${when}${fundPart(g)}.`);
        break;
      default:
        paras.push(opening(seg.segments, org.name));
        paras.push(`We received your contribution of ${usd(g.amount)} on ${when}${fundPart(g)}${g.method ? ` (${g.method})` : ''}.`);
    }
    if (g.tribute) paras.push(`Your gift was made in ${g.tribute.kind} of ${g.tribute.name}.`);
    if (org.message) paras.push(org.message);
    const irs = irsSentences(g, religious);
    const receipt = ['cash', 'quid-pro-quo', 'in-kind', 'stock'].includes(g.variant);
    const after = [];
    if (receipt && org.exemptLine) after.push(`${org.name} is a tax-exempt organization under section 501(c)(3) of the Internal Revenue Code${org.ein ? ` (EIN ${org.ein})` : ''}.`);
    if (receipt) after.push('Please keep this letter with your tax records.');
    return { paragraphs: paras, irs, after };
  }

  // The notice to a memorial or honor family: names the donor, never the amount.
  function noticeFor(g, name, org) {
    const t = g.tribute;
    return {
      to: g.notify,
      salutation: g.notify.replace(/^the\s+/i, ''),
      addressLines: g.notifyAddress ? g.notifyAddress.split(/\s*[;\n]\s*/).filter(Boolean).slice(0, 4) : [],
      paragraphs: [
        `We are writing to let you know that ${name} has made a gift to ${org.name} in ${t.kind} of ${t.name}.`,
        t.kind === 'memory'
          ? `We are grateful for this tribute, and we send our sympathy. ${t.name} will be remembered through the work this gift supports.`
          : `We are grateful for this tribute to ${t.name}, and we wanted you to know of it.`,
      ],
    };
  }

  // Everything but the PDFs. Throws AckError for anything it cannot read or refuses.
  function build({ org, gifts, options = {}, mapped = null, unknown = [] }) {
    const opts = { majorUsd: 1000, lapsedMonths: 12, only: [], replacement: false, ...options };
    const usable = gifts.filter((g) => !g.setAside);
    const refunds = gifts.filter((g) => g.setAside);
    if (!usable.length) throw new AckError('The file has no gifts to acknowledge (refunds and reversals are set aside).', 'gifts');
    const segs = segmentsOf(usable, opts);
    const inRange = (g) => (!opts.from || g.date >= opts.from) && (!opts.to || g.date <= opts.to);
    const wanted = (g) => !opts.only.length || opts.only.includes(g.variant) || opts.only.some((s) => segs.get(g).segments.includes(s));
    const chosen = usable.filter((g) => inRange(g) && wanted(g));
    const leftOut = usable.length - chosen.length;
    if (!chosen.length) throw new AckError(`None of the ${count(usable.length, 'gift')} ${opts.from || opts.to ? 'falls in the dates asked for' : ''}${opts.only.length ? ` matches ${opts.only.join(', ')}` : ''}.`.replace(/  +/g, ' '), opts.only.length ? 'only' : 'from');
    const letterDate = org.letterDate ?? chosen.reduce((m, g) => (g.date > m ? g.date : m), chosen[0].date);

    const used = new Map();
    const unique = (base) => {
      const n = (used.get(base) ?? 0) + 1;
      used.set(base, n);
      return `${base}${n > 1 ? `-${n}` : ''}.pdf`;
    };
    const sorted = [...chosen].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : (a.row ?? 0) - (b.row ?? 0)));
    const letters = sorted.map((g) => {
      const seg = segs.get(g);
      const name = g.donor || g.donorId;
      const body = letterFor(g, seg, org, opts);
      const addr = [g.address, g.address2, [g.city, [g.state, g.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ')].filter(Boolean);
      const file = unique(`acknowledgment-${g.date}-${slugOf(name)}`);
      const flags = [...g.flags];
      if (g.variant === 'quid-pro-quo' && g.amount > QPQ) flags.push({ code: 'quid-pro-quo', message: `${usd(g.amount)} was more than $${rules.thresholds.quidProQuoUsd} and partly for goods or services: Pub 1771 requires the disclosure when the payment is asked for or received. This letter gives it.` });
      if (g.tribute && !g.notify) flags.push({ code: 'no-family-notice', message: `In ${g.tribute.kind} of ${g.tribute.name}, but no one is named to notify (a "Notify" column), so no family notice is made.` });
      const notice = g.tribute && g.notify ? { ...noticeFor(g, name, org), file: unique(`tribute-notice-${g.date}-${slugOf(g.tribute.name)}`) } : null;
      return {
        key: giftKeyOf(g),
        row: g.row,
        donor: name,
        donorId: g.donorId,
        salutation: g.salutation || name.replace(/^the\s+/i, ''),
        addressLines: addr,
        email: g.email,
        date: g.date,
        letterDate,
        variant: g.variant,
        segments: seg.segments,
        previousGift: seg.previous,
        amount: g.amount,
        benefit: g.benefit,
        deductible: g.variant === 'cash' || g.variant === 'quid-pro-quo' ? g.amount - g.benefit : null,
        large: ['cash', 'quid-pro-quo'].includes(g.variant) && g.amount >= ACK,
        description: g.description,
        daf: g.daf,
        tribute: g.tribute,
        ...body,
        sentence: body.irs[0] ?? null,
        disclosure: body.irs[1] ?? null,
        file,
        notice,
        flags,
      };
    });

    const byVariant = Object.fromEntries(VARIANTS.map((v) => [v, letters.filter((l) => l.variant === v).length]));
    const bySegment = Object.fromEntries(SEGMENTS.map((s) => [s, letters.filter((l) => l.segments.includes(s)).length]));
    const totals = {
      gifts: usable.length,
      letters: letters.length,
      notices: letters.filter((l) => l.notice).length,
      money: letters.filter((l) => ['cash', 'quid-pro-quo'].includes(l.variant)).reduce((s, l) => s + l.amount, 0),
      large: letters.filter((l) => l.large).length,
      disclosures: letters.filter((l) => l.disclosure).length,
      leftOut,
      setAside: refunds.length,
      byVariant,
      bySegment,
    };
    const parts = [];
    const sentence = org.benefits === 'religious' || (org.benefits === undefined && org.kind === 'church') ? '"intangible religious benefits"' : '"no goods or services"';
    const n = (k) => byVariant[k];
    const verb = (k, one, many) => (k === 1 ? one : many);
    if (n('cash')) parts.push(`${count(n('cash'), 'money gift')} ${verb(n('cash'), 'gets', 'get')} the ${sentence} sentence`);
    if (n('quid-pro-quo')) parts.push(`${count(n('quid-pro-quo'), 'payment')} for a ticket or other benefit ${verb(n('quid-pro-quo'), 'gets', 'get')} a good faith estimate (${totals.disclosures} with the $${rules.thresholds.quidProQuoUsd} disclosure)`);
    if (n('in-kind') + n('stock')) parts.push(`${count(n('in-kind') + n('stock'), 'gift')} of goods or stock ${verb(n('in-kind') + n('stock'), 'is', 'are')} described without a value`);
    if (n('daf')) parts.push(`${count(n('daf'), 'grant')} from a donor-advised fund ${verb(n('daf'), 'gets', 'get')} a thank-you without tax receipt language`);
    if (n('pledge')) parts.push(`${count(n('pledge'), 'pledge')} ${verb(n('pledge'), 'is', 'are')} confirmed but not receipted`);
    if (n('services')) parts.push(`${count(n('services'), 'volunteer')} ${verb(n('services'), 'is', 'are')} thanked for services (not a receipt)`);
    const list = parts.length > 2 ? `${parts.slice(0, -1).join('; ')}; and ${parts[parts.length - 1]}` : parts.join(' and ');
    const answer = `Your file has ${count(letters.length, 'gift')} to acknowledge: ${list}${totals.notices ? `. ${count(totals.notices, 'tribute family gets', 'tribute families get')} a notice without the amount` : ''}.`;

    const flags = letters.flatMap((l) => l.flags.map((f) => ({ donor: l.donor, row: l.row, ...f })));
    if (refunds.length) flags.push({ donor: null, row: null, code: 'refund', message: `${count(refunds.length, 'refund or reversal', 'refunds or reversals')} set aside (rows ${refunds.map((g) => g.row).filter(Boolean).slice(0, 12).join(', ')}): no letter is made for them.` });
    if (leftOut) flags.push({ donor: null, row: null, code: 'left-out', message: `${count(leftOut, 'gift')} outside the dates or segments asked for left out.` });
    return { answer, org: { ...org }, letterDate, totals, letters, flags, columnsUsed: mapped, columnsIgnored: unknown };
  }

  // The keys a letters call pays for: one per letter (organization added by tool.js).
  const letterKeys = (r) => [...new Set(r.letters.map((l) => l.key))].sort();

  function summaryCsv(r) {
    return csvText(
      ['file', 'donor', 'gift_date', 'variant', 'amount', 'goods_services_value', 'deductible_part', 'segments', 'irs_sentence', 'disclosure', 'tribute', 'notice_file', 'email', 'flags'],
      r.letters.map((l) => [l.file, l.donor, l.date, l.variant, l.amount ? plainUsd(l.amount) : '', l.benefit ? plainUsd(l.benefit) : '', l.deductible === null ? '' : plainUsd(l.deductible), l.segments.join(' '), l.sentence ?? '', l.disclosure ? 'yes' : 'no', l.tribute ? `in ${l.tribute.kind} of ${l.tribute.name}` : '', l.notice?.file ?? '', l.email, l.flags.map((f) => f.code).join(' ')]),
    );
  }
  function emailCsv(r) {
    const rows = r.letters.filter((l) => l.email).map((l) => [l.donor, l.email, l.file, l.variant]);
    return rows.length ? csvText(['donor', 'email', 'file', 'variant'], rows) : null;
  }
  // A letter as plain text (for email bodies and the API).
  function letterText(l, org) {
    const head = [org.name, ...(org.addressLines ?? []), '', longDate(l.letterDate), '', l.donor, ...l.addressLines, '', `Dear ${l.salutation},`, ''];
    const sign = ['With gratitude,', '', ...[org.signer, org.signerTitle, org.name].filter(Boolean)];
    return [...head, ...l.paragraphs.flatMap((p) => [p, '']), ...l.irs.flatMap((p) => [p, '']), ...l.after.flatMap((p) => [p, '']), ...sign].join('\n').replace(/\n{3,}/g, '\n\n').trim();
  }

  return { build, letterKeys, summaryCsv, emailCsv, letterText, irsSentences, segmentsOf, ACK, QPQ };
}

// ---------- files ----------

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

// ---------- worked samples (made up), shared by the page, the examples and the content pages ----------

const FOOD_BANK = { name: 'Riverside Food Bank (sample)', address: '22 Market Street\nDayton, OH 45402', ein: '12-3456789', kind: 'nonprofit', signer: 'Dana Lee', signerTitle: 'Executive Director', exemptLine: true };
const CHURCH = { name: 'Grace Community Church (sample)', address: '100 Main Street\nSpringfield, OH 45501', kind: 'church', signer: 'Ruth Alvarez', signerTitle: 'Financial Secretary' };
const csvOf = (head, rows) => [head, ...rows].join('\r\n');
const H = 'Donor,Date,Amount,Type,Description,Fund,Method,Benefit value,Benefit description,DAF sponsor,In memory of,Notify,Notify address,Previous gift date,Address,City,State,ZIP,Email';

export const SAMPLES = {
  // A food bank's November 2026 batch: one gift of every kind, and a refund to set aside.
  batch: {
    org: { ...FOOD_BANK, letterDate: '2026-11-30' },
    csv: csvOf(H, [
      'Priya Natarajan,11/3/2026,500.00,,,Annual fund,Check 2207,,,,,,,2025-11-20,14 Birch Road,Dayton,OH,45402,priya@example.com',
      'Tom Becker,11/7/2026,150.00,,,Fall gala,Card,60.00,Gala dinner ticket,,,,,,3 Elm Court,Kettering,OH,45429,tom@example.com',
      'The Lee Family,11/10/2026,2500.00,DAF grant,,Annual fund,,,,Fidelity Charitable (Lee Family Fund),,,,2025-12-15,8 Park Lane,Oakwood,OH,45419,',
      'Maria Gomez,11/12/2026,100.00,,,General,Online,,,,Robert Gomez,The Gomez family,"40 Hill Street; Dayton, OH 45403",2024-06-01,40 Hill Street,Dayton,OH,45403,maria@example.com',
      'Hardware Depot Inc.,11/14/2026,,In-kind,"Two pallets of canned vegetables (about 1,200 cans)",,,,,,,,,,900 Industrial Way,Moraine,OH,45439,',
      'Ben Okafor,11/18/2026,,Stock,50 shares of Example Corp common stock,,,,,,,,,2025-12-30,40 River Road,Dayton,OH,45402,ben@example.com',
      'Ana Ruiz,11/20/2026,25.00,,,Monthly giving,Card (monthly),,,,,,,2026-10-20,8 Elm Street,Dayton,OH,45403,ana@example.com',
      'Sam Patel,11/21/2026,1000.00,Pledge,"$250 a quarter, January to October 2027",Building fund,,,,,,,,,55 Lake Drive,Centerville,OH,45459,',
      'Grace Chen,11/22/2026,,Volunteer services,"Pro bono bookkeeping, 20 hours",,,,,,,,,,,,,,grace@example.com',
      'Kim Novak,11/24/2026,-40.00,Refund,,General,Card,,,,,,,,,,,,',
    ]),
  },
  // A church: a building-fund check over $250 and a weekly envelope gift under it.
  church: {
    org: { ...CHURCH, letterDate: '2026-12-14' },
    csv: csvOf('Donor,Date,Amount,Fund,Method,Address,City,State,ZIP', [
      'John and Mary Smith,12/6/2026,300.00,Building Fund,Check 1031,12 Oak Lane,Springfield,OH,45501',
      'Ana Ruiz,12/6/2026,40.00,General,Envelope,8 Elm Street,Springfield,OH,45503',
    ]),
  },
  // One money gift of $250, the classic receipt.
  receipt: {
    org: { ...FOOD_BANK, letterDate: '2026-12-04' },
    csv: csvOf('Donor,Date,Amount,Fund,Method,Address,City,State,ZIP,Email', ['Jordan Ellis,12/1/2026,250.00,Annual fund,Online,77 Cedar Avenue,Dayton,OH,45406,jordan@example.com']),
  },
  // A first gift with a personal thank-you message above the IRS sentence.
  thanks: {
    org: { ...FOOD_BANK, letterDate: '2026-12-04', message: 'Your gift will put about 300 meals on our neighbors\' tables this winter. We could not do this work without you.' },
    csv: csvOf('Donor,Date,Amount,Fund,Method,Address,City,State,ZIP', ['Chris Walker,12/2/2026,100.00,Winter meals,Card,19 Maple Street,Dayton,OH,45405']),
  },
  // Goods from a business.
  'in-kind': {
    org: { ...FOOD_BANK, letterDate: '2026-11-20' },
    csv: csvOf('Donor,Date,Type,Description,Address,City,State,ZIP', ['Hardware Depot Inc.,11/14/2026,In-kind,"Two pallets of canned vegetables (about 1,200 cans)",900 Industrial Way,Moraine,OH,45439']),
  },
  // Shares transferred to the charity's brokerage account.
  stock: {
    org: { ...FOOD_BANK, letterDate: '2026-12-21' },
    csv: csvOf('Donor,Date,Type,Description,Address,City,State,ZIP', ['Ben Okafor,12/15/2026,Stock,50 shares of Example Corp common stock,40 River Road,Dayton,OH,45402']),
  },
  // A grant from a donor-advised fund, recommended by a family.
  daf: {
    org: { ...FOOD_BANK, letterDate: '2026-12-21' },
    csv: csvOf('Donor,Date,Amount,Type,Fund,DAF sponsor,Address,City,State,ZIP', ['The Lee Family,12/16/2026,2500.00,DAF grant,Annual fund,Fidelity Charitable (Lee Family Fund),8 Park Lane,Oakwood,OH,45419']),
  },
  // Two gifts in memory of the same person: a letter to each donor, a notice for the family each time.
  memorial: {
    org: { ...FOOD_BANK, letterDate: '2026-11-20' },
    csv: csvOf('Donor,Date,Amount,Fund,Method,In memory of,Notify,Notify address,Address,City,State,ZIP', [
      'Maria Gomez,11/12/2026,100.00,General,Online,Robert Gomez,The Gomez family,"40 Hill Street; Dayton, OH 45403",40 Hill Street,Dayton,OH,45403',
      'Paul and Jean Wright,11/13/2026,50.00,General,Check 4410,Robert Gomez,The Gomez family,"40 Hill Street; Dayton, OH 45403",6 Orchard Way,Dayton,OH,45405',
    ]),
  },
  // A three-year pledge.
  pledge: {
    org: { ...FOOD_BANK, letterDate: '2026-11-25' },
    csv: csvOf('Donor,Date,Amount,Type,Description,Fund,Address,City,State,ZIP', ['Sam Patel,11/21/2026,1000.00,Pledge,"$250 a quarter, January to October 2027",Building fund,55 Lake Drive,Centerville,OH,45459']),
  },
  // A gala ticket: a payment partly for a dinner.
  gala: {
    org: { ...FOOD_BANK, letterDate: '2026-11-12' },
    csv: csvOf('Donor,Date,Amount,Fund,Method,Benefit value,Benefit description,Address,City,State,ZIP', ['Tom Becker,11/7/2026,150.00,Fall gala,Card,60.00,Gala dinner ticket,3 Elm Court,Kettering,OH,45429']),
  },
  // Volunteer time.
  services: {
    org: { ...FOOD_BANK, letterDate: '2026-11-25' },
    csv: csvOf('Donor,Date,Type,Description', ['Grace Chen,11/22/2026,Volunteer services,"Pro bono bookkeeping, 20 hours"']),
  },
};
