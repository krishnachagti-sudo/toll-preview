// Deposit and milestone payment schedules: a project fee split into stages to the cent, each with
// an invoice date and a due date, the invoice-ready lines for every stage (the last one netting off
// what was paid before), a calendar file and a CSV.
//
// Pure and dependency-free: Node (tool.js, pages.js, tests) and the browser (page.js) load this
// same file, so it imports nothing. Public holidays come from the Business days engine
// (tools/business-days/core.js), which every caller imports and hands in as `cal`:
//
//   schedule(input, cal)      cal = { holidays(region, year) -> [{ date, name }] }
//
// Money is whole minor units (cents) held as BigInt while it is worked out, never floats. A share
// is an exact fraction: 50% is 500000/1000000, a third is 1/3. Each share is rounded half up to
// the cent; the cents the rounding leaves over go to one stage (the last by default), so the stages
// always add up to the total exactly.
//
// Nothing here sends anything: the invoices are lines to paste or import, and the calendar file is
// for the user's own calendar.

export const READ_ON = '2026-11-08';
export const MIN_DATE = '2000-01-01';
export const MAX_DATE = '2099-12-31';
export const LIMITS = { stages: 12, total: 100_000_000, net: 120, weeks: 260, payments: 20, text: 120 };

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Currencies: symbol and decimals. Others can be added the same way.
export const CURRENCIES = {
  USD: { symbol: '$', decimals: 2, name: 'US dollar' },
  CAD: { symbol: 'CA$', decimals: 2, name: 'Canadian dollar' },
  AUD: { symbol: 'A$', decimals: 2, name: 'Australian dollar' },
  NZD: { symbol: 'NZ$', decimals: 2, name: 'New Zealand dollar' },
  GBP: { symbol: '£', decimals: 2, name: 'Pound sterling' },
  EUR: { symbol: '€', decimals: 2, name: 'Euro' },
  SGD: { symbol: 'S$', decimals: 2, name: 'Singapore dollar' },
  ZAR: { symbol: 'R', decimals: 2, name: 'South African rand', space: true },
  JPY: { symbol: '¥', decimals: 0, name: 'Japanese yen' },
};
export const CURRENCY_CODES = Object.keys(CURRENCIES);

export const REGIONS = {
  US: 'US federal holidays',
  'GB-ENG': 'England and Wales bank holidays',
  none: 'Weekends only (no public holidays)',
};
export const REGION_IDS = Object.keys(REGIONS);

// Preset splits. Shares in percent; the first stage is the deposit, due at the start.
export const PRESETS = {
  '100': { label: '100% upfront', shares: ['100'], names: ['Payment in full'] },
  '50-50': { label: '50/50', shares: ['50', '50'], names: ['Deposit', 'Balance on delivery'] },
  '50-25-25': { label: '50/25/25', shares: ['50', '25', '25'], names: ['Deposit', 'Midpoint milestone', 'Final delivery'] },
  '30-30-40': { label: '30/30/40', shares: ['30', '30', '40'], names: ['Deposit', 'Midpoint milestone', 'Final delivery'] },
  '40-30-30': { label: '40/30/30', shares: ['40', '30', '30'], names: ['Deposit', 'Midpoint milestone', 'Final delivery'] },
  '60-30-10': { label: '60/30/10', shares: ['60', '30', '10'], names: ['Deposit', 'Midpoint milestone', 'Final delivery'] },
  '25-25-25-25': { label: '25/25/25/25', shares: ['25', '25', '25', '25'], names: ['Deposit', 'Milestone 1', 'Milestone 2', 'Final delivery'] },
  thirds: { label: 'Thirds', shares: ['1/3', '1/3', '1/3'], names: ['Deposit', 'Midpoint milestone', 'Final delivery'] },
};
export const PRESET_IDS = Object.keys(PRESETS);

export class ScheduleError extends Error {
  constructor(message, field) { super(message); this.name = 'ScheduleError'; this.field = field; }
}
const fail = (message, field) => { throw new ScheduleError(message, field); };

// ---------- dates ----------

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const monthLength = (y, m) => [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
export function isRealDate(iso) {
  const m = typeof iso === 'string' ? ISO_RE.exec(iso) : null;
  if (!m) return false;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  return mo >= 1 && mo <= 12 && d >= 1 && d <= monthLength(y, mo);
}
const toDay = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86_400_000;
const fromDay = (n) => new Date(n * 86_400_000).toISOString().slice(0, 10);
export const addDays = (iso, n) => fromDay(toDay(iso) + n);
export const daysBetween = (a, b) => toDay(b) - toDay(a);
export const weekdayOf = (iso) => new Date(`${iso}T12:00:00Z`).getUTCDay();
export function addMonths(iso, n) {
  const y = +iso.slice(0, 4);
  const m = +iso.slice(5, 7) - 1 + n;
  const yy = y + Math.floor(m / 12);
  const mm = ((m % 12) + 12) % 12 + 1;
  const d = Math.min(+iso.slice(8, 10), monthLength(yy, mm));
  return `${String(yy).padStart(4, '0')}-${String(mm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
export const longDate = (iso) => `${WEEKDAYS[weekdayOf(iso)]}, ${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;
export const shortDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;

function checkDate(iso, field) {
  if (!isRealDate(iso)) fail(`${field} must be a real date written like 2027-01-04.`, field);
  if (iso < MIN_DATE || iso > MAX_DATE) fail(`${field} must fall between 2000 and 2099.`, field);
  return iso;
}

// A calendar of days off for one region: weekends, plus that region's public holidays.
export function calendarFor(region, cal) {
  if (!REGION_IDS.includes(region)) fail(`region must be one of ${REGION_IDS.join(', ')}.`, 'region');
  const years = new Map();
  const holidayOn = (iso) => {
    if (region === 'none') return null;
    const y = +iso.slice(0, 4);
    if (!years.has(y)) years.set(y, new Map((cal?.holidays ? cal.holidays(region, y) : []).map((h) => [h.date, h.name])));
    return years.get(y).get(iso) ?? null;
  };
  const offReason = (iso) => {
    const wd = weekdayOf(iso);
    if (wd === 0 || wd === 6) return WEEKDAYS[wd];
    return holidayOn(iso);
  };
  const roll = (iso, dir) => {
    let d = iso;
    for (let i = 0; i < 30 && offReason(d); i++) d = addDays(d, dir);
    return d;
  };
  const addBusiness = (iso, n) => {
    let d = iso;
    let left = n;
    while (left > 0) { d = addDays(d, 1); if (!offReason(d)) left -= 1; }
    return d;
  };
  return { region, offReason, holidayOn, next: (iso) => roll(iso, 1), previous: (iso) => roll(iso, -1), addBusiness };
}

// ---------- money ----------

const big = (n) => BigInt(n);
// Text like "6000", "6,000.00" or 6000 to minor units, exactly.
export function parseMoney(value, currency, field = 'total') {
  const { decimals } = CURRENCIES[currency];
  const s = typeof value === 'number' ? (Number.isFinite(value) ? String(value) : '') : String(value ?? '').trim().replace(/,/g, '').replace(/^\$/, '');
  const m = /^(\d{1,12})(?:\.(\d+))?$/.exec(s);
  if (!m || (m[2] && m[2].length > decimals)) {
    fail(decimals ? `${field} must be an amount like 6000 or 6000.50 (at most ${decimals} decimals).` : `${field} must be a whole amount like 6000 (${currency} has no decimals).`, field);
  }
  const minor = big(m[1]) * 10n ** big(decimals) + big((m[2] ?? '').padEnd(decimals, '0') || '0');
  if (minor > big(LIMITS.total) * 10n ** big(decimals)) fail(`${field} must be at most ${LIMITS.total.toLocaleString('en-US')}.`, field);
  return minor;
}

const group3 = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export function money(minor, currency) {
  const c = CURRENCIES[currency];
  const v = big(minor);
  const neg = v < 0n;
  const a = neg ? -v : v;
  const scale = 10n ** big(c.decimals);
  const whole = group3(String(a / scale));
  const frac = c.decimals ? `.${String(a % scale).padStart(c.decimals, '0')}` : '';
  return `${neg ? '-' : ''}${c.symbol}${c.space ? ' ' : ''}${whole}${frac}`;
}
// The plain number for a CSV or an accounting import: "3000.00".
export function plain(minor, currency) {
  const c = CURRENCIES[currency];
  const v = big(minor);
  const neg = v < 0n;
  const a = neg ? -v : v;
  const scale = 10n ** big(c.decimals);
  return `${neg ? '-' : ''}${a / scale}${c.decimals ? `.${String(a % scale).padStart(c.decimals, '0')}` : ''}`;
}

// A percentage as an exact fraction of 1: "25" -> 250000/1000000, "1/3" -> 1/3, "8.25" -> 82500/1000000.
export function parseShare(value, field = 'percent') {
  const s = String(value ?? '').trim().replace(/%$/, '');
  const frac = /^(\d{1,2})\/(\d{1,2})$/.exec(s);
  if (frac) {
    const [num, den] = [big(frac[1]), big(frac[2])];
    if (den === 0n || num === 0n || num > den) fail(`${field} must be a fraction like 1/3, above 0 and at most 1.`, field);
    return { num, den, text: percentOf(num * 10_000n, den * 10_000n) };
  }
  const m = /^(\d{1,3})(?:\.(\d{1,4}))?$/.exec(s);
  if (!m) fail(`${field} must be a percentage like 25 or 33.3333 (at most 4 decimals), or a fraction like 1/3.`, field);
  const num = big(m[1]) * 10000n + big((m[2] ?? '').padEnd(4, '0') || '0');
  if (num === 0n || num > 1_000_000n) fail(`${field} must be above 0% and at most 100%.`, field);
  return { num, den: 1_000_000n, text: `${s.replace(/\.?0+$/, (x) => (x.includes('.') ? '' : x))}%` };
}
// value x num / den, rounded half up (value and the fraction are never negative here).
const share = (minor, { num, den }) => (minor * num * 2n + den) / (2n * den);
const gcd = (a, b) => (b === 0n ? a : gcd(b, a % b));
const addFrac = (a, b) => { const num = a.num * b.den + b.num * a.den; const den = a.den * b.den; const g = gcd(num, den); return { num: num / g, den: den / g }; };
// A share as text for a stage that was given as an amount: "33.33%".
export function percentOf(part, whole) {
  if (whole === 0n) return '0%';
  const bp = (part * 1_000_000n * 2n + whole) / (2n * whole); // in millionths
  const hundredths = (bp + 50n) / 100n; // 0.01% steps
  const s = `${hundredths / 100n}.${String(hundredths % 100n).padStart(2, '0')}`.replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  return `${s}%`;
}

// ---------- state rules on home-improvement deposits ----------
// Each rule is quoted from the state's own statute site or its consumer agency, read on READ_ON.
// Only these states are covered; any other state is said to be not covered, never guessed.
export const STATE_RULES = {
  CA: {
    name: 'California',
    kind: 'cap',
    applies: 'Home improvement and swimming pool contracts',
    capText: '$1,000 or 10% of the contract price, whichever is less (finance charges excluded)',
    cap: (total) => { const ten = share(total, { num: 1n, den: 10n }); return ten < 100_000n ? ten : 100_000n; },
    quote: 'The down payment cannot be more than $1,000 or 10 percent of the contract price, whichever is less, for a home improvement job or swimming pool, excluding finance charges.',
    also: 'The same page says the payments cannot exceed the value of the work performed, the down payment excepted.',
    cite: 'Contractors State License Board (CSLB), Learn About Home Improvement Contracts (Cal. Bus. & Prof. Code 7159.5)',
    href: 'https://www.cslb.ca.gov/Consumers/Hire_A_Contractor/Home_Improvement_Contracts/What_Is_A_Contract.aspx',
    source: 'cslb-what-is-a-contract.txt',
  },
  MD: {
    name: 'Maryland',
    kind: 'cap',
    applies: 'Home improvement contracts',
    capText: 'one-third of the contract price, before or when the contract is signed; no payment at all before it is signed',
    cap: (total) => total / 3n,
    quote: 'A person may not receive a deposit of more than one-third of the home improvement contract price before or at the time of execution of the home improvement contract.',
    also: 'Section 8-617(a): a person may not demand or receive any payment for a home improvement before the home improvement contract is signed.',
    cite: 'Md. Code, Business Regulation 8-617(b)',
    href: 'https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gbr&section=8-617&enactments=false',
    source: 'md-gbr-8-617.txt',
  },
  ME: {
    name: 'Maine',
    kind: 'cap',
    applies: 'Home construction contracts for more than $3,000 in materials or labor',
    capText: 'one-third of the total contract price, on contracts over $3,000',
    over: 300_000n,
    cap: (total) => total / 3n,
    quote: 'The method of payment, with the initial down payment being limited to no more than 1/3 of the total contract price;',
    also: 'Section 1487 applies to any home construction contract for more than $3,000 in materials or labor, which must be in writing.',
    cite: '10 M.R.S. 1487(5)',
    href: 'https://legislature.maine.gov/statutes/10/title10sec1487.html',
    source: 'me-10-1487.txt',
  },
  FL: {
    name: 'Florida',
    kind: 'duty',
    applies: 'Repair, restoration, improvement or construction to residential real property',
    capText: 'no cap; above 10% of the contract price, the contractor must apply for permits within 30 days and start work within 90 days after the permits are issued',
    threshold: (total) => share(total, { num: 1n, den: 10n }),
    quote: 'A contractor who receives, as initial payment, money totaling more than 10 percent of the contract price for repair, restoration, improvement, or construction to residential real property must:',
    also: 'apply for the permits within 30 days after the date payment is made, and start the work within 90 days after the permits are issued, unless there is just cause or the payer agreed in writing to longer periods (489.126(2)(a)).',
    cite: 'Fla. Stat. 489.126(2)(a)',
    href: 'https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0489/Sections/0489.126.html',
    source: 'fl-489-126.txt',
  },
};
export const STATE_CODES = Object.keys(STATE_RULES);
export const NOT_COVERED_NOTE = 'Only California, Maryland, Maine and Florida are covered: their rules were read on the state\'s own statute site or consumer agency. Other states are not covered here, which does not mean they have no rule.';

export function rules() {
  return {
    readOn: READ_ON,
    covered: STATE_CODES.map((code) => {
      const r = STATE_RULES[code];
      return { state: code, name: r.name, kind: r.kind, applies: r.applies, rule: r.capText, quote: r.quote, also: r.also, cite: r.cite, href: r.href };
    }),
    note: NOT_COVERED_NOTE,
  };
}

function stateCheck(code, total, deposit, currency, payDate) {
  const r = STATE_RULES[code];
  if (!r) return { state: code, covered: false, note: NOT_COVERED_NOTE };
  if (currency !== 'USD') fail('The state deposit check works in US dollars only: set currency to USD.', 'currency');
  const base = { state: code, name: r.name, covered: true, kind: r.kind, applies: r.applies, rule: r.capText, quote: r.quote, also: r.also, cite: r.cite, href: r.href, readOn: READ_ON };
  if (r.kind === 'cap') {
    if (r.over !== undefined && total <= r.over) return { ...base, applicable: false, ok: true, message: `${r.name}'s one-third limit applies to contracts over ${money(r.over, 'USD')}; this one is ${money(total, 'USD')}.` };
    const cap = r.cap(total);
    const ok = deposit <= cap;
    return {
      ...base, applicable: true, ok, capMinor: cap, cap: money(cap, 'USD'),
      message: ok
        ? `The deposit of ${money(deposit, 'USD')} is within ${r.name}'s limit of ${money(cap, 'USD')} (${r.capText}).`
        : `The deposit of ${money(deposit, 'USD')} is over ${r.name}'s limit of ${money(cap, 'USD')} (${r.capText}).`,
    };
  }
  const threshold = r.threshold(total);
  const over = deposit > threshold;
  return {
    ...base, applicable: true, ok: true, over, thresholdMinor: threshold, threshold: money(threshold, 'USD'),
    ...(over && payDate ? { permitsBy: addDays(payDate, 30) } : {}),
    message: over
      ? `The deposit of ${money(deposit, 'USD')} is more than 10% of the price (${money(threshold, 'USD')}): Florida then requires the contractor to apply for permits within 30 days of payment${payDate ? ` (by ${shortDate(addDays(payDate, 30))} if it is paid on its due date)` : ''} and start work within 90 days after the permits are issued.`
      : `The deposit of ${money(deposit, 'USD')} is not more than 10% of the price (${money(threshold, 'USD')}), so 489.126(2)(a)'s permit and start deadlines are not triggered by it.`,
  };
}

// ---------- the schedule ----------

const DUE_UNITS = ['days', 'business-days', 'weeks', 'months'];
export { DUE_UNITS };
const termsText = (net) => (net === 0 ? 'Due on receipt' : `Net ${net}`);
const cleanText = (s, field, max = LIMITS.text) => {
  if (s === undefined || s === null) return '';
  const t = String(s).replace(/\s+/g, ' ').trim();
  if (t.length > max) fail(`${field} must be at most ${max} characters.`, field);
  return t;
};

// The stages the input asks for: from a preset (with the project length in weeks) or as given.
function stagesOf(input) {
  if (input.stages && input.split) fail('Give either split or stages, not both.', 'stages');
  if (input.stages) {
    if (!Array.isArray(input.stages) || input.stages.length < 1 || input.stages.length > LIMITS.stages) fail(`stages must list 1 to ${LIMITS.stages} payments.`, 'stages');
    return input.stages.map((s, i) => ({ ...s, name: cleanText(s.name, `stages[${i}].name`) || (i === 0 ? 'Deposit' : i === input.stages.length - 1 ? 'Final payment' : `Milestone ${i}`) }));
  }
  const id = input.split ?? '50-25-25';
  const p = PRESETS[id];
  if (!p) fail(`split must be one of ${PRESET_IDS.join(', ')}.`, 'split');
  const weeks = input.weeks ?? 8;
  if (!Number.isInteger(weeks) || weeks < 0 || weeks > LIMITS.weeks) fail(`weeks must be a whole number from 0 to ${LIMITS.weeks}.`, 'weeks');
  const n = p.shares.length;
  const names = input.names ?? p.names;
  return p.shares.map((pct, i) => ({
    name: cleanText(names[i], `names[${i}]`) || p.names[i],
    percent: pct,
    due: i === 0 ? { after: 0, unit: 'days' } : { after: Math.floor((weeks * 7 * i) / (n - 1)), unit: 'days' },
  }));
}

// Amounts for every stage, exact to the cent.
function amountsOf(stages, total, currency, remainderTo) {
  let balanceAt = -1;
  const shares = stages.map((s, i) => {
    const given = ['percent', 'amount', 'balance'].filter((k) => s[k] !== undefined && s[k] !== false);
    if (given.length !== 1) fail(`stages[${i}] needs exactly one of percent, amount or balance.`, `stages[${i}]`);
    if (s.balance !== undefined) {
      if (s.balance !== true) fail(`stages[${i}].balance must be true.`, `stages[${i}].balance`);
      if (balanceAt >= 0) fail('Only one stage can be the balance.', `stages[${i}].balance`);
      balanceAt = i;
      return { kind: 'balance' };
    }
    if (s.percent !== undefined) return { kind: 'percent', frac: parseShare(s.percent, `stages[${i}].percent`) };
    const amount = parseMoney(s.amount, currency, `stages[${i}].amount`);
    if (amount === 0n) fail(`stages[${i}].amount must be above zero.`, `stages[${i}].amount`);
    return { kind: 'amount', amount };
  });
  const amounts = shares.map((x) => (x.kind === 'percent' ? share(total, x.frac) : x.kind === 'amount' ? x.amount : 0n));
  let rounding = null;
  if (balanceAt >= 0) {
    const rest = total - amounts.reduce((a, b) => a + b, 0n);
    if (rest <= 0n) fail(`The other stages already come to ${money(total - rest, currency)} of ${money(total, currency)}, so nothing is left for the balance.`, `stages[${balanceAt}]`);
    amounts[balanceAt] = rest;
  } else if (shares.every((x) => x.kind === 'percent')) {
    const sum = shares.reduce((a, x) => addFrac(a, x.frac), { num: 0n, den: 1n });
    if (sum.num !== sum.den) {
      const pct = Number((sum.num * 1_000_000n) / sum.den) / 10_000;
      fail(`The percentages add up to ${pct}%, not 100%. Change one, or make the last stage the balance.`, 'stages');
    }
    const diff = total - amounts.reduce((a, b) => a + b, 0n);
    if (diff !== 0n) {
      const at = remainderTo === 'first' ? 0 : amounts.length - 1;
      amounts[at] += diff;
      rounding = { minor: diff, stage: at + 1 };
    }
  } else if (shares.every((x) => x.kind === 'amount')) {
    const sum = amounts.reduce((a, b) => a + b, 0n);
    if (sum !== total) fail(`The amounts add up to ${money(sum, currency)}, not the total of ${money(total, currency)}. Change one, or make the last stage the balance.`, 'stages');
  } else {
    fail('A mix of percentages and amounts needs one stage marked as the balance.', 'stages');
  }
  return { amounts, shares, rounding };
}

// The date a stage's milestone (and its invoice) falls on.
function milestoneDate(due, i, start, prev, cal) {
  if (due === undefined || due === null) return i === 0 ? start : fail(`stages[${i}].due is needed: a date, or a number of days, business days, weeks or months after the start.`, `stages[${i}].due`);
  if (due.date !== undefined) return checkDate(due.date, `stages[${i}].due.date`);
  const after = due.after;
  if (!Number.isInteger(after) || after < 0 || after > 3650) fail(`stages[${i}].due.after must be a whole number from 0 to 3650.`, `stages[${i}].due.after`);
  const unit = due.unit ?? 'days';
  if (!DUE_UNITS.includes(unit)) fail(`stages[${i}].due.unit must be one of ${DUE_UNITS.join(', ')}.`, `stages[${i}].due.unit`);
  const from = due.from === 'previous' && i > 0 ? prev : start;
  const d = unit === 'days' ? addDays(from, after) : unit === 'weeks' ? addDays(from, after * 7) : unit === 'months' ? addMonths(from, after) : cal.addBusiness(from, after);
  return checkDate(d, `stages[${i}].due`);
}

// FNV-1a over text: a short, stable id for calendar entries.
export function fnv(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}

export function schedule(input, cal) {
  const currency = input.currency ?? 'USD';
  if (!CURRENCIES[currency]) fail(`currency must be one of ${CURRENCY_CODES.join(', ')}.`, 'currency');
  const total = parseMoney(input.total, currency, 'total');
  if (total === 0n) fail('total must be above zero.', 'total');
  const start = checkDate(input.start, 'start');
  const region = input.region ?? 'US';
  const calendar = calendarFor(region, cal);
  const net = input.net ?? 0;
  if (!Number.isInteger(net) || net < 0 || net > LIMITS.net) fail(`net must be a whole number of days from 0 to ${LIMITS.net}.`, 'net');
  const roll = input.roll ?? 'next';
  if (!['next', 'previous', 'none'].includes(roll)) fail('roll must be next, previous or none.', 'roll');
  const remainderTo = input.remainderTo ?? 'last';
  if (!['last', 'first'].includes(remainderTo)) fail('remainderTo must be last or first.', 'remainderTo');
  const project = cleanText(input.project, 'project');
  const client = cleanText(input.client, 'client');

  const raw = stagesOf(input);
  const { amounts, shares, rounding } = amountsOf(raw, total, currency, remainderTo);
  const warnings = [];

  // Home-improvement deposit rules, from the state's own sources.
  let stateRule = null;
  if (input.state) {
    stateRule = stateCheck(input.state, total, amounts[0], currency, null);
    if (stateRule.covered && stateRule.kind === 'cap' && stateRule.applicable && !stateRule.ok && input.capDeposit) {
      if (amounts.length < 2) fail('To lower the deposit to the state limit there must be a later stage to take the rest.', 'capDeposit');
      const excess = amounts[0] - stateRule.capMinor;
      amounts[0] = stateRule.capMinor;
      amounts[1] += excess;
      shares[0] = { kind: 'amount' };
      shares[1] = { kind: 'amount' };
      warnings.push(`The deposit was lowered to ${stateRule.cap}, ${stateRule.name}'s limit, and the other ${money(excess, currency)} moved to "${raw[1].name}".`);
      stateRule = stateCheck(input.state, total, amounts[0], currency, null);
    }
  }

  // Tax: per invoice, half up; the last invoice takes the cent so the taxes add up to tax on the total.
  let tax = null;
  if (input.tax !== undefined && input.tax !== null) {
    const rate = parseShare(input.tax.rate, 'tax.rate');
    const label = cleanText(input.tax.label, 'tax.label', 40) || 'Tax';
    const per = amounts.map((a) => share(a, rate));
    const whole = share(total, rate);
    const diff = whole - per.reduce((a, b) => a + b, 0n);
    per[per.length - 1] += diff;
    tax = { rate: rate.text, label, per, whole, adjusted: diff };
  }

  const stages = [];
  let paid = 0n;
  let prevDate = start;
  const grand = total + (tax ? tax.whole : 0n);
  raw.forEach((s, i) => {
    const date = milestoneDate(s.due, i, start, prevDate, calendar);
    if (date < prevDate && i > 0) warnings.push(`"${s.name}" (${shortDate(date)}) comes before the stage above it.`);
    if (date < start) warnings.push(`"${s.name}" (${shortDate(date)}) is before the start date.`);
    prevDate = date;
    const stageNet = s.net ?? net;
    if (!Number.isInteger(stageNet) || stageNet < 0 || stageNet > LIMITS.net) fail(`stages[${i}].net must be a whole number from 0 to ${LIMITS.net}.`, `stages[${i}].net`);
    const rawDue = addDays(date, stageNet);
    const off = calendar.offReason(rawDue);
    const dueDate = !off || roll === 'none' ? rawDue : roll === 'next' ? calendar.next(rawDue) : calendar.previous(rawDue);
    const invoiceOff = calendar.offReason(date);
    const amount = amounts[i];
    const stageTax = tax ? tax.per[i] : 0n;
    const due = amount + stageTax;
    const before = paid;
    paid += due;
    stages.push({
      n: i + 1,
      name: s.name,
      share: shares[i].kind === 'percent' ? shares[i].frac.text : percentOf(amount, total),
      given: shares[i].kind,
      amountMinor: amount,
      amount: money(amount, currency),
      ...(tax ? { taxMinor: stageTax, tax: money(stageTax, currency) } : {}),
      dueMinor: due,
      totalDue: money(due, currency),
      invoiceDate: date,
      ...(invoiceOff ? { invoiceDateNote: `${shortDate(date)} is ${/day$/.test(invoiceOff) ? 'a ' : ''}${invoiceOff}.` } : {}),
      terms: termsText(stageNet),
      net: stageNet,
      dueDate,
      ...(dueDate !== rawDue ? { rolled: { from: rawDue, reason: off } } : off ? { dueDateNote: `${shortDate(rawDue)} is ${/day$/.test(off) ? 'a ' : ''}${off}; not moved.` } : {}),
      paidBefore: money(before, currency),
      balanceAfter: money(grand - paid, currency),
      balanceAfterMinor: grand - paid,
    });
  });

  if (stateRule && stateRule.covered && stateRule.kind === 'duty') stateRule = stateCheck(input.state, total, amounts[0], currency, stages[0].dueDate);
  if (stateRule && stateRule.covered && stateRule.applicable && !stateRule.ok) warnings.push(stateRule.message);

  const result = {
    currency,
    total: money(total, currency),
    totalMinor: total,
    ...(tax ? { tax: { rate: tax.rate, label: tax.label, total: money(tax.whole, currency), totalMinor: tax.whole, ...(tax.adjusted !== 0n ? { adjustedOnLast: money(tax.adjusted, currency) } : {}) }, grandTotal: money(grand, currency), grandTotalMinor: grand } : {}),
    start,
    region,
    regionName: REGIONS[region],
    roll,
    ...(project ? { project } : {}),
    ...(client ? { client } : {}),
    split: input.stages ? 'custom' : (input.split ?? '50-25-25'),
    stages,
    ...(rounding ? { rounding: { amount: money(rounding.minor, currency), stage: rounding.stage, note: `${money(rounding.minor < 0n ? -rounding.minor : rounding.minor, currency)} of rounding ${rounding.minor > 0n ? 'added to' : 'taken from'} stage ${rounding.stage} so the stages add up to ${money(total, currency)} exactly.` } } : {}),
    check: { stagesAddUpTo: money(amounts.reduce((a, b) => a + b, 0n), currency), equalsTotal: amounts.reduce((a, b) => a + b, 0n) === total },
    ...(stateRule ? { stateRule } : {}),
    warnings,
  };
  result.wording = wordingOf(result);
  return result;
}

// The payment-terms paragraph for a contract or proposal.
export function wordingOf(r) {
  const s = r.stages;
  const what = r.project ? `for ${r.project} ` : '';
  const tax = r.tax ? ` plus ${r.tax.label.toLowerCase()} at ${r.tax.rate}` : '';
  const parts = s.map((x, i) => {
    const kind = i === 0 ? (s.length === 1 ? 'the full fee' : 'a deposit') : i === s.length - 1 ? 'the final payment' : 'a further payment';
    const when = i === 0 && x.invoiceDate === r.start ? `on signing (${shortDate(x.invoiceDate)})` : `on ${shortDate(x.invoiceDate)} (${x.name.toLowerCase()})`;
    return `${kind} of ${x.amount} (${x.share}) is invoiced ${when} and due ${x.net === 0 ? 'on receipt' : `within ${x.net} days of the invoice date`}`;
  });
  const joined = parts.length > 1 ? `${parts.slice(0, -1).join('; ')}; and ${parts[parts.length - 1]}` : parts[0];
  return `The total fee ${what}is ${r.total}${tax}. ${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`
    + (s.length > 1 ? ' Work on each later stage starts when the payment before it has been received.' : '');
}

// ---------- invoices, calendar and CSV ----------

const line = (description, amountMinor, currency, extra = {}) => ({ description, quantity: 1, unitPrice: money(amountMinor, currency), amount: money(amountMinor, currency), amountMinor, ...extra });

export function invoicesOf(r, { prefix = 'INV-', firstNumber = 1001, finalStyle = 'netting' } = {}) {
  const cur = r.currency;
  const of = r.project ? r.project : 'the project';
  const numbers = r.stages.map((_, i) => `${prefix}${firstNumber + i}`);
  return r.stages.map((s, i) => {
    const last = i === r.stages.length - 1 && r.stages.length > 1;
    const head = { number: numbers[i], stage: s.n, name: s.name, issueDate: s.invoiceDate, dueDate: s.dueDate, terms: s.terms, ...(r.client ? { billTo: r.client } : {}) };
    if (last && finalStyle === 'netting') {
      const lines = [line(`Project total${r.project ? `: ${r.project}` : ''} (contract price)`, r.totalMinor, cur)];
      if (r.tax) lines.push(line(`${r.tax.label} at ${r.tax.rate} on the project total`, r.tax.totalMinor, cur));
      for (let j = 0; j < i; j++) {
        const p = r.stages[j];
        lines.push(line(`Less: ${p.name}, invoice ${numbers[j]} dated ${shortDate(p.invoiceDate)}`, -p.dueMinor, cur, { deduction: true }));
      }
      return { ...head, final: true, lines, total: s.totalDue, totalMinor: s.dueMinor, balanceDue: s.totalDue, note: `Balance due: ${s.totalDue}. The amounts above "Less" are the whole project; the deductions are the ${i === 1 ? 'invoice' : `${i} invoices`} already issued, assumed paid in full.` };
    }
    const lines = [line(`${s.name}: ${s.share} of ${of} (contract price ${r.total})`, s.amountMinor, cur)];
    if (r.tax) lines.push(line(`${r.tax.label} at ${r.tax.rate}`, s.taxMinor, cur));
    return { ...head, final: last, lines, total: s.totalDue, totalMinor: s.dueMinor, note: i === 0 && r.stages.length > 1 ? `Deposit toward a total of ${r.grandTotal ?? r.total}. Balance after this invoice: ${s.balanceAfter}.` : `Paid before this invoice: ${s.paidBefore}. Balance after it: ${s.balanceAfter}.` };
  });
}

// The final invoice after payments already received (a deposit, milestones), for any project.
export function finalInvoice(input) {
  const currency = input.currency ?? 'USD';
  if (!CURRENCIES[currency]) fail(`currency must be one of ${CURRENCY_CODES.join(', ')}.`, 'currency');
  const total = parseMoney(input.total, currency, 'total');
  if (total === 0n) fail('total must be above zero.', 'total');
  const payments = input.payments ?? [];
  if (!Array.isArray(payments) || payments.length < 1 || payments.length > LIMITS.payments) fail(`payments must list 1 to ${LIMITS.payments} payments already received.`, 'payments');
  const issueDate = input.issueDate === undefined ? null : checkDate(input.issueDate, 'issueDate');
  const net = input.net ?? 0;
  if (!Number.isInteger(net) || net < 0 || net > LIMITS.net) fail(`net must be a whole number of days from 0 to ${LIMITS.net}.`, 'net');
  const project = cleanText(input.project, 'project');
  let taxMinor = 0n;
  let taxInfo = null;
  if (input.tax) {
    const rate = parseShare(input.tax.rate, 'tax.rate');
    taxMinor = share(total, rate);
    taxInfo = { rate: rate.text, label: cleanText(input.tax.label, 'tax.label', 40) || 'Tax' };
  }
  const lines = [line(`Project total${project ? `: ${project}` : ''} (contract price)`, total, currency)];
  if (taxInfo) lines.push(line(`${taxInfo.label} at ${taxInfo.rate} on the project total`, taxMinor, currency));
  let received = 0n;
  payments.forEach((p, i) => {
    const amount = parseMoney(p.amount, currency, `payments[${i}].amount`);
    if (amount === 0n) fail(`payments[${i}].amount must be above zero.`, `payments[${i}].amount`);
    const date = p.date === undefined ? null : checkDate(p.date, `payments[${i}].date`);
    const name = cleanText(p.label, `payments[${i}].label`) || (i === 0 ? 'Deposit' : `Payment ${i + 1}`);
    const ref = cleanText(p.invoice, `payments[${i}].invoice`, 40);
    received += amount;
    lines.push(line(`Less: ${name} received${ref ? `, invoice ${ref}` : ''}${date ? ` on ${shortDate(date)}` : ''}`, -amount, currency, { deduction: true }));
  });
  const gross = total + taxMinor;
  const balance = gross - received;
  if (balance < 0n) fail(`The payments received (${money(received, currency)}) are more than the total of ${money(gross, currency)}: that is a credit of ${money(-balance, currency)} to the client, not an invoice.`, 'payments');
  const dueDate = issueDate ? addDays(issueDate, net) : null;
  return {
    currency,
    total: money(total, currency),
    ...(taxInfo ? { tax: { ...taxInfo, amount: money(taxMinor, currency) } } : {}),
    received: money(received, currency),
    balanceDue: money(balance, currency),
    balanceDueMinor: balance,
    ...(issueDate ? { issueDate, dueDate, terms: termsText(net) } : {}),
    lines,
    answer: `Bill the total of ${money(gross, currency)}, subtract the ${money(received, currency)} already received, and the balance due is ${money(balance, currency)}.`,
    note: balance === 0n ? 'Nothing is left to pay: send a paid-in-full statement instead of an invoice.' : 'Show the deposit and every milestone payment as its own "Less" line, so the client sees how the balance was reached.',
  };
}

const icsText = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
// RFC 5545: lines longer than 75 octets are folded with CRLF and one space.
function fold(l) {
  const bytes = new TextEncoder().encode(l);
  if (bytes.length <= 75) return l;
  const out = [];
  let cur = '';
  let size = 0;
  for (const ch of l) {
    const n = new TextEncoder().encode(ch).length;
    if (size + n > (out.length ? 74 : 75)) { out.push(cur); cur = ''; size = 0; }
    cur += ch; size += n;
  }
  out.push(cur);
  return out.join('\r\n ');
}
const icsDate = (iso) => iso.replace(/-/g, '');

export function icsOf(r, invoices) {
  const id = fnv(JSON.stringify([r.total, r.currency, r.start, r.project ?? '', r.client ?? '', r.stages.map((s) => [s.name, s.amount, s.dueDate])]));
  const who = r.project ? ` (${r.project})` : '';
  const events = [];
  r.stages.forEach((s, i) => {
    const inv = invoices?.[i];
    const ref = inv ? ` ${inv.number}` : '';
    if (s.invoiceDate !== s.dueDate) {
      events.push(['BEGIN:VEVENT', `UID:ps-${id}-${s.n}-invoice@endwise`, `DTSTAMP:${icsDate(r.start)}T000000Z`,
        `DTSTART;VALUE=DATE:${icsDate(s.invoiceDate)}`, `DTEND;VALUE=DATE:${icsDate(addDays(s.invoiceDate, 1))}`,
        `SUMMARY:${icsText(`Send invoice${ref}: ${s.name} ${s.totalDue}${who}`)}`,
        `DESCRIPTION:${icsText(`${s.name}, ${s.share} of ${r.total}. ${s.terms}: due ${shortDate(s.dueDate)}.`)}`, 'END:VEVENT']);
    }
    events.push(['BEGIN:VEVENT', `UID:ps-${id}-${s.n}-due@endwise`, `DTSTAMP:${icsDate(r.start)}T000000Z`,
      `DTSTART;VALUE=DATE:${icsDate(s.dueDate)}`, `DTEND;VALUE=DATE:${icsDate(addDays(s.dueDate, 1))}`,
      `SUMMARY:${icsText(`Payment due${ref}: ${s.name} ${s.totalDue}${who}`)}`,
      `DESCRIPTION:${icsText(`${s.name}, ${s.share} of ${r.total}, invoiced ${shortDate(s.invoiceDate)} (${s.terms}).${s.rolled ? ` Moved from ${shortDate(s.rolled.from)} (${s.rolled.reason}).` : ''} Balance after it: ${s.balanceAfter}.`)}`, 'END:VEVENT']);
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Endwise//Payment schedule//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    ...events.flat(), 'END:VCALENDAR'].map(fold).join('\r\n') + '\r\n';
}

const csvCell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s)) s = `'${s}`; return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
export const CSV_COLUMNS = ['stage', 'name', 'share', 'amount', 'tax', 'total_due', 'currency', 'invoice_number', 'invoice_date', 'terms', 'due_date', 'paid_before', 'balance_after'];
export function csvRows(r, invoices) {
  let paid = 0n;
  const grand = r.grandTotalMinor ?? r.totalMinor;
  return r.stages.map((s, i) => {
    const row = [s.n, s.name, s.share, plain(s.amountMinor, r.currency), plain(s.taxMinor ?? 0n, r.currency), plain(s.dueMinor, r.currency), r.currency,
      invoices?.[i]?.number ?? '', s.invoiceDate, s.terms, s.dueDate, plain(paid, r.currency), plain(grand - paid - s.dueMinor, r.currency)];
    paid += s.dueMinor;
    return row;
  });
}
export const csvOf = (r, invoices) => [CSV_COLUMNS, ...csvRows(r, invoices)].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';

// Everything for one project: the schedule, every invoice's lines, the calendar file and the CSV.
export function pack(input, cal) {
  const r = schedule(input, cal);
  const prefix = cleanText(input.invoicePrefix ?? 'INV-', 'invoicePrefix', 20);
  const firstNumber = input.firstNumber ?? 1001;
  if (!Number.isInteger(firstNumber) || firstNumber < 0 || firstNumber > 99_999_999) fail('firstNumber must be a whole number from 0 to 99999999.', 'firstNumber');
  const finalStyle = input.finalStyle ?? 'netting';
  if (!['netting', 'simple'].includes(finalStyle)) fail('finalStyle must be netting or simple.', 'finalStyle');
  const invoices = invoicesOf(r, { prefix, firstNumber, finalStyle });
  return { ...r, invoices, ics: icsOf(r, invoices), csv: csvOf(r, invoices) };
}

// BigInt fields become strings so a result can be sent as JSON.
export function toJson(value) {
  return JSON.parse(JSON.stringify(value, (k, v) => (typeof v === 'bigint' ? v.toString() : v)));
}

// The one-sentence answer for a schedule, as the pages and the page lead with it.
export function sentence(r) {
  const s = r.stages;
  if (s.length === 1) return `On a ${r.total} project paid upfront, you invoice the full ${s[0].totalDue} on ${shortDate(s[0].invoiceDate)}, due ${shortDate(s[0].dueDate)}.`;
  const items = s.map((x, i) => `${x.totalDue} ${i === 0 ? 'as the deposit' : i === s.length - 1 ? 'as the final payment' : `at ${x.name.toLowerCase()}`} on ${shortDate(x.invoiceDate)}${x.dueDate !== x.invoiceDate ? ` (due ${shortDate(x.dueDate)})` : ''}`);
  return `On a ${r.grandTotal ?? r.total} project split ${s.map((x) => x.share.replace('%', '')).join('/')}, you invoice ${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}.`;
}
