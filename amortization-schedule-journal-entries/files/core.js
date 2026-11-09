// Amortization schedules to monthly journal entries: the engine. Pure and dependency-free, so the
// page (in the browser) and the server run this same file.
//
// Four schedule types, each turned into dated, balanced journal entries:
//   prepaid           paid in advance, expensed over the coverage (Dr expense, Cr Prepaid)
//   deferred-revenue  billed in advance, recognized over the service (Dr Deferred Revenue, Cr Revenue)
//   loan              each payment split into interest and principal (Dr Loan, Dr Interest, Cr Bank)
//   loan-fees         fees paid to get a loan, spread over its term (Dr Interest Expense, Cr Debt
//                     Issuance Costs), straight-line only
// Straight-line types use one of three conventions: monthly (equal months, the start month counts in
// full), half-month (the first and last calendar month get half a month each) or daily (actual days
// in each month over the days of the term). Every amount is in whole cents; all months but the last
// are rounded half up and the last month takes the remainder (the rounding plug), so the balance ends
// at exactly zero. A loan's last payment clears what is left.
//
// The 12-month rule check (prepaids) applies only the duration test of 26 CFR 1.263(a)-4(f)(1).

export const ENGINE_VERSION = 'amortization-je-1';
export const LIMITS = { schedules: 500, months: 600, rangeMonths: 600, lenderRows: 600, bytes: 1_000_000, maxCents: 10_000_000_000, xeroLines: 300 };
export const TYPES = ['prepaid', 'deferred-revenue', 'loan', 'loan-fees'];
export const METHODS = ['monthly', 'half-month', 'daily'];
export const DAY_COUNTS = ['30/360', 'actual/365', 'actual/360'];
export const FORMATS = ['qbo', 'xero', 'generic'];

export const TYPE_WORDS = { prepaid: 'Prepaid expense', 'deferred-revenue': 'Deferred revenue', loan: 'Loan', 'loan-fees': 'Loan fees' };
export const METHOD_WORDS = { monthly: 'equal months (the start month counts in full)', 'half-month': 'half-month (half a month in the first and last month)', daily: 'actual days in each month' };
export const DEFAULT_ACCOUNTS = {
  prepaid: { balance: 'Prepaid Expenses', pl: 'Insurance Expense', cash: 'Checking' },
  'deferred-revenue': { balance: 'Deferred Revenue', pl: 'Revenue', cash: 'Checking' },
  loan: { balance: 'Loan Payable', pl: 'Interest Expense', cash: 'Checking' },
  'loan-fees': { balance: 'Debt Issuance Costs', pl: 'Interest Expense', cash: 'Checking' },
};
// Which side a balance sheet account's balance sits on: prepaids and loan costs are debits (assets
// or a contra-liability), deferred revenue and the loan are credits.
const DEBIT_BALANCE = { prepaid: true, 'deferred-revenue': false, loan: false, 'loan-fees': true };

export class AmortError extends Error {
  constructor(message, field) { super(message); this.name = 'AmortError'; this.field = field; }
}
const fail = (msg, field) => { throw new AmortError(msg, field); };

// ---------- dates ----------

const DAY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MONTH_RE = /^(\d{4})-(\d{2})$/;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const pad = (n, w = 2) => String(n).padStart(w, '0');
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const daysInMonth = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

export function isDay(s) {
  const m = DAY_RE.exec(String(s ?? ''));
  if (!m) return false;
  const [y, mo, d] = [+m[1], +m[2], +m[3]];
  return y >= 1900 && y <= 2200 && mo >= 1 && mo <= 12 && d >= 1 && d <= daysInMonth(y, mo);
}
export const isMonth = (s) => { const m = MONTH_RE.exec(String(s ?? '')); return Boolean(m) && +m[2] >= 1 && +m[2] <= 12 && +m[1] >= 1900 && +m[1] <= 2200; };
const ymd = (s) => s.split('-').map(Number);
// Days since 1970-01-01 (UTC), for differences.
export const dayNumber = (s) => { const [y, m, d] = ymd(s); return Math.round(Date.UTC(y, m - 1, d) / 86_400_000); };
export const fromDayNumber = (n) => new Date(n * 86_400_000).toISOString().slice(0, 10);
export const addDays = (s, n) => fromDayNumber(dayNumber(s) + n);
// Adds months, keeping the day where the month has it and the month's last day where it does not
// (January 31 plus one month is February 28 or 29). `anchor` is the day to aim for.
export function addMonths(s, n, anchor) {
  const [y, m, d] = ymd(s);
  const idx = y * 12 + (m - 1) + n;
  const ny = Math.floor(idx / 12);
  const nm = (idx % 12) + 1;
  return `${ny}-${pad(nm)}-${pad(Math.min(anchor ?? d, daysInMonth(ny, nm)))}`;
}
export const monthOf = (s) => s.slice(0, 7);
export const monthIndex = (mo) => { const [y, m] = mo.split('-').map(Number); return y * 12 + m - 1; };
export const monthFromIndex = (i) => `${Math.floor(i / 12)}-${pad((i % 12) + 1)}`;
export const monthEnd = (mo) => { const [y, m] = mo.split('-').map(Number); return `${mo}-${pad(daysInMonth(y, m))}`; };
export const monthStart = (mo) => `${mo}-01`;
export const monthName = (mo) => { const [y, m] = mo.split('-').map(Number); return `${MONTHS[m - 1]} ${y}`; };
export const longDate = (s) => { const [y, m, d] = ymd(s); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const weekday = (s) => WEEKDAYS[((dayNumber(s) % 7) + 7 + 4) % 7];

// A date as typed in a spreadsheet: 2026-11-15, 11/15/2026 (month first), or 15 Nov 2026.
const SHORT = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
export function parseDay(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  if (isDay(s)) return s;
  let m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (m) { const out = `${m[3]}-${pad(+m[1])}-${pad(+m[2])}`; return isDay(out) ? out : null; }
  m = /^(\d{1,2})[ -]([A-Za-z]{3})[a-z]*[ -](\d{4})$/.exec(s);
  if (m) { const i = SHORT.indexOf(m[2].toLowerCase()); const out = i < 0 ? '' : `${m[3]}-${pad(i + 1)}-${pad(+m[1])}`; return isDay(out) ? out : null; }
  return null;
}

// ---------- money ----------

// Dollars (a number or text like "$12,000.00") to whole cents; null when it is not money.
export function toCents(v) {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) return null;
    const c = Math.round(v * 100);
    return Math.abs(c - v * 100) < 1e-6 ? c : null;
  }
  const s = String(v ?? '').trim().replace(/^\$/, '').replace(/,/g, '');
  if (!/^-?\d+(\.\d{1,2})?$/.test(s)) return null;
  const neg = s.startsWith('-');
  const [w, f = ''] = s.replace('-', '').split('.');
  const c = Number(w) * 100 + Number((f + '00').slice(0, 2));
  return neg ? -c : c;
}
export function money(c) {
  const neg = c < 0;
  const a = Math.abs(c);
  const s = `$${Math.floor(a / 100).toLocaleString('en-US')}.${pad(a % 100)}`;
  return neg ? `-${s}` : s;
}
// Plain decimal for files: 1234.5 dollars -> "1234.50".
export const plain = (c) => `${c < 0 ? '-' : ''}${Math.floor(Math.abs(c) / 100)}.${pad(Math.abs(c) % 100)}`;
// a x num / den in cents, rounded half up, with whole numbers only (exact for these sizes).
const share = (a, num, den) => Math.floor((2 * a * num + den) / (2 * den));

// ---------- reading schedules ----------

const text = (v, max, field) => {
  if (v === undefined || v === null) return undefined;
  const s = String(v).trim();
  if (s.length > max) fail(`${field} is at most ${max} characters.`, field);
  return s || undefined;
};

// Validates one schedule and fills in its defaults. `at` names it in messages ("Schedule 3").
export function normalize(raw, n = 1) {
  const at = raw?.id ? `Schedule ${n} (${String(raw.id).slice(0, 40)})` : `Schedule ${n}`;
  const bad = (msg, f) => fail(`${at}: ${msg}`, f);
  if (!raw || typeof raw !== 'object') bad('is not a schedule.');
  const type = raw.type;
  if (!TYPES.includes(type)) bad(`type must be one of ${TYPES.join(', ')}.`, 'type');
  const amount = toCents(raw.amount);
  if (amount === null || amount <= 0) bad('amount must be a positive dollar amount with at most 2 decimals.', 'amount');
  if (amount > LIMITS.maxCents) bad('amount is at most $100,000,000.00.', 'amount');
  if (!isDay(raw.start)) bad('start must be a date written like 2026-11-15.', 'start');
  const s = {
    n, type, amount, start: raw.start,
    id: text(raw.id, 80, 'id') ?? `${TYPE_WORDS[type]} ${n}`,
    name: text(raw.name, 100, 'name'),
    accounts: {
      balance: text(raw.accounts?.balance, 100, 'accounts.balance') ?? DEFAULT_ACCOUNTS[type].balance,
      pl: text(raw.accounts?.pl, 100, 'accounts.pl') ?? DEFAULT_ACCOUNTS[type].pl,
      cash: text(raw.accounts?.cash, 100, 'accounts.cash') ?? DEFAULT_ACCOUNTS[type].cash,
    },
  };
  if (raw.paidOn !== undefined && !isDay(raw.paidOn)) bad('paidOn must be a date written like 2026-11-15.', 'paidOn');

  if (type === 'loan') {
    for (const f of ['method', 'end', 'cancelOn', 'refund']) if (raw[f] !== undefined) bad(`${f} does not apply to a loan.`, f);
    const rate = raw.rate;
    if (!(typeof rate === 'number' && Number.isFinite(rate) && rate >= 0 && rate <= 100)) bad('rate is the annual interest rate in percent, from 0 to 100 (6.5 for 6.5%).', 'rate');
    s.rate = rate;
    s.dayCount = raw.dayCount ?? '30/360';
    if (!DAY_COUNTS.includes(s.dayCount)) bad(`dayCount must be one of ${DAY_COUNTS.join(', ')}.`, 'dayCount');
    s.paidOn = raw.paidOn ?? raw.start;
    if (Array.isArray(raw.lender) && raw.lender.length) {
      if (raw.lender.length > LIMITS.lenderRows) bad(`lender is at most ${LIMITS.lenderRows} rows.`, 'lender');
      if (raw.payment !== undefined || raw.interestOnly) bad('give the lender\'s rows or a payment, not both.', 'lender');
      let prev = s.start;
      s.lender = raw.lender.map((r, i) => {
        if (!isDay(r?.date)) bad(`lender row ${i + 1}: date must be written like 2026-12-01.`, 'lender');
        if (r.date <= prev) bad(`lender row ${i + 1}: dates must be after the loan date and in order.`, 'lender');
        prev = r.date;
        const payment = toCents(r.payment);
        const interest = toCents(r.interest);
        if (payment === null || payment < 0 || interest === null || interest < 0) bad(`lender row ${i + 1}: payment and interest are dollar amounts of zero or more.`, 'lender');
        if (interest > payment) bad(`lender row ${i + 1}: interest is more than the payment.`, 'lender');
        return { date: r.date, payment, interest };
      });
      s.months = s.lender.length;
    } else {
      const months = raw.months;
      if (!(Number.isInteger(months) && months >= 1 && months <= LIMITS.months)) bad(`months is the number of payments, from 1 to ${LIMITS.months}.`, 'months');
      s.months = months;
      s.firstPayment = raw.firstPayment ?? addMonths(raw.start, 1);
      if (!isDay(s.firstPayment) || s.firstPayment <= raw.start) bad('firstPayment must be a date after the loan date.', 'firstPayment');
      s.interestOnly = Boolean(raw.interestOnly);
      if (raw.payment !== undefined) {
        if (s.interestOnly) bad('interestOnly works out the payment itself; leave payment out.', 'payment');
        const p = toCents(raw.payment);
        if (p === null || p <= 0) bad('payment must be a positive dollar amount.', 'payment');
        s.payment = p;
      }
    }
    return s;
  }

  for (const f of ['rate', 'payment', 'firstPayment', 'dayCount', 'lender', 'interestOnly']) if (raw[f] !== undefined) bad(`${f} applies only to a loan.`, f);
  s.method = raw.method ?? 'monthly';
  if (!METHODS.includes(s.method)) bad(`method must be one of ${METHODS.join(', ')}.`, 'method');
  if ((raw.months === undefined) === (raw.end === undefined)) bad('give months (the term) or end (the last day covered), one of the two.', 'months');
  if (raw.months !== undefined) {
    if (!(Number.isInteger(raw.months) && raw.months >= 1 && raw.months <= LIMITS.months)) bad(`months is a whole number from 1 to ${LIMITS.months}.`, 'months');
    s.months = raw.months;
    s.end = addDays(addMonths(raw.start, raw.months), -1);
  } else {
    if (!isDay(raw.end) || raw.end < raw.start) bad('end is the last day covered, on or after start.', 'end');
    s.end = raw.end;
    // Whole months exactly, when the end is the day before a monthly anniversary of the start.
    const k = monthIndex(monthOf(raw.end)) - monthIndex(monthOf(raw.start)) + 1;
    s.months = [k - 1, k].find((x) => x >= 1 && addDays(addMonths(raw.start, x), -1) === raw.end) ?? null;
    if (s.months === null && s.method !== 'daily') bad(`runs from ${raw.start} to ${raw.end}, which is not a whole number of months; use method "daily", or give months.`, 'end');
    if (monthIndex(monthOf(raw.end)) - monthIndex(monthOf(raw.start)) >= LIMITS.months) bad(`the term is at most ${LIMITS.months} months.`, 'end');
  }
  s.paidOn = raw.paidOn ?? raw.start;
  if (s.paidOn > s.end) bad('paidOn is after the last day covered.', 'paidOn');
  if (raw.cancelOn !== undefined) {
    if (type === 'loan-fees') bad('cancelOn is for prepaids and deferred revenue; for a loan paid off early, shorten its months.', 'cancelOn');
    if (!isDay(raw.cancelOn) || raw.cancelOn < raw.start || raw.cancelOn >= s.end) bad('cancelOn is the last day used, on or after start and before the end of the term.', 'cancelOn');
    s.cancelOn = raw.cancelOn;
    s.refund = raw.refund === undefined ? 0 : toCents(raw.refund);
    if (s.refund === null || s.refund < 0) bad('refund is a dollar amount of zero or more.', 'refund');
  } else if (raw.refund !== undefined) {
    bad('refund needs cancelOn.', 'refund');
  }
  return s;
}

// ---------- straight-line ----------

// The posting months of a straight-line schedule and their amounts, before any cancellation:
// [{ month, cents, days? }].
export function straightLine(s) {
  const a = s.amount;
  const startMonth = monthIndex(monthOf(s.start));
  const equal = (n, parts) => {
    // Equal shares, rounded half up, with the remainder in the last one. For a tiny amount over many
    // months where that would leave the last one negative, the cents are spread by cumulative rounding.
    const each = parts.map((w) => share(a, w, 2 * n));
    const head = each.slice(0, -1).reduce((x, y) => x + y, 0);
    if (head <= a) return [...each.slice(0, -1), a - head];
    let done = 0;
    let acc = 0;
    return parts.map((w) => { acc += w; const c = share(a, acc, 2 * n) - done; done += c; return c; });
  };
  if (s.method === 'monthly') {
    const parts = Array.from({ length: s.months }, () => 2);
    return equal(s.months, parts).map((cents, i) => ({ month: monthFromIndex(startMonth + i), cents }));
  }
  if (s.method === 'half-month') {
    if (+s.start.slice(8) === 1) return straightLine({ ...s, method: 'monthly' });
    const parts = [1, ...Array.from({ length: s.months - 1 }, () => 2), 1];
    return equal(s.months, parts).map((cents, i) => ({ month: monthFromIndex(startMonth + i), cents }));
  }
  // daily
  const total = dayNumber(s.end) - dayNumber(s.start) + 1;
  const out = [];
  let done = 0;
  for (let i = startMonth; i <= monthIndex(monthOf(s.end)); i++) {
    const mo = monthFromIndex(i);
    const from = mo === monthOf(s.start) ? s.start : monthStart(mo);
    const to = mo === monthOf(s.end) ? s.end : monthEnd(mo);
    const days = dayNumber(to) - dayNumber(from) + 1;
    const last = i === monthIndex(monthOf(s.end));
    const cents = last ? a - done : share(a, days, total);
    done += cents;
    out.push({ month: mo, cents, days });
  }
  return out;
}

// ---------- loans ----------

// The level payment for a loan, rounded half up to the cent: the annuity formula on the monthly rate
// (Excel's PMT(rate/12, n, -principal)).
export function levelPayment(principal, ratePct, n) {
  if (ratePct === 0) return Math.ceil(principal / n);
  const i = ratePct / 1200;
  const p = (principal / 100) * i / (1 - (1 + i) ** -n);
  return Math.round(p * 100 + 1e-7);
}

// Interest for one period on a balance, half up to the cent.
function periodInterest(balance, s, from, to) {
  if (s.rate === 0) return 0;
  if (s.dayCount === '30/360') return Math.round((balance * s.rate) / 1200 + 1e-9);
  const days = dayNumber(to) - dayNumber(from);
  const base = s.dayCount === 'actual/365' ? 365 : 360;
  return Math.round((balance * s.rate * days) / (100 * base) + 1e-9);
}

// The loan's payments: [{ n, date, payment, interest, principal, opening, closing }].
export function loanRows(s) {
  const rows = [];
  let bal = s.amount;
  if (s.lender) {
    let prev = s.start;
    s.lender.forEach((r, i) => {
      const principal = Math.min(r.payment - r.interest, bal);
      rows.push({ n: i + 1, date: r.date, payment: r.payment, interest: r.interest, principal, opening: bal, closing: bal - principal, days: dayNumber(r.date) - dayNumber(prev) });
      bal -= principal;
      prev = r.date;
    });
    return rows;
  }
  const anchor = +s.firstPayment.slice(8);
  const payment = s.interestOnly ? null : (s.payment ?? levelPayment(s.amount, s.rate, s.months));
  let prev = s.start;
  for (let k = 0; k < s.months && bal > 0; k++) {
    const date = addMonths(s.firstPayment, k, anchor);
    const interest = periodInterest(bal, s, prev, date);
    const last = k === s.months - 1;
    let pay = s.interestOnly ? interest : payment;
    if (!last && pay < interest) fail(`Schedule ${s.n} (${s.id}): the payment of ${money(pay)} does not cover payment ${k + 1}'s interest of ${money(interest)}; raise the payment or give the lender's rows.`, 'payment');
    let principal = pay - interest;
    if (last || principal >= bal) { principal = bal; pay = bal + interest; }
    rows.push({ n: k + 1, date, payment: pay, interest, principal, opening: bal, closing: bal - principal, days: dayNumber(date) - dayNumber(prev) });
    bal -= principal;
    prev = date;
  }
  return rows;
}

// ---------- entries ----------

// One balanced entry: { date, kind, schedule, lines: [{ account, dr, cr, desc }] }.
const entry = (s, date, kind, desc, lines) => ({ date, kind, schedule: s.n, id: s.id, type: s.type, name: s.name, desc, lines: lines.filter((l) => l.dr || l.cr) });
const dr = (account, c) => ({ account, dr: c, cr: 0 });
const cr = (account, c) => ({ account, dr: 0, cr: c });

// Every entry a schedule makes, in date order, plus its rows and balance movements:
// { s, rows, entries, moves: [{ date, kind, cents }] } where cents changes the balance account's
// normal-side balance (+ adds to it).
export function scheduleEntries(s, { loanEntry = 'payment' } = {}) {
  const A = s.accounts;
  const entries = [];
  const moves = [];
  const label = (what) => `${s.id}: ${what}`;
  if (s.type === 'loan') {
    entries.push(entry(s, s.paidOn, 'initial', label(`loan received, ${money(s.amount)}`), [dr(A.cash, s.amount), cr(A.balance, s.amount)]));
    moves.push({ date: s.paidOn, kind: 'addition', cents: s.amount });
    const rows = loanRows(s);
    for (const r of rows) {
      const desc = label(`payment ${r.n} of ${rows.length}, interest ${money(r.interest)}, principal ${money(r.principal)}`);
      const lines = loanEntry === 'interest-reclass'
        ? [dr(A.pl, r.interest), cr(A.balance, r.interest)]
        : [dr(A.balance, r.principal), dr(A.pl, r.interest), cr(A.cash, r.payment)];
      entries.push(entry(s, r.date, 'payment', desc, lines));
      moves.push({ date: r.date, kind: 'reduction', cents: r.principal });
    }
    return { s, rows, entries, moves };
  }
  const plan = straightLine(s);
  const recognize = s.type === 'deferred-revenue';
  // The initial entry, dated when paid or invoiced.
  const init = {
    prepaid: [dr(A.balance, s.amount), cr(A.cash, s.amount)],
    'deferred-revenue': [dr(A.cash, s.amount), cr(A.balance, s.amount)],
    'loan-fees': [dr(A.balance, s.amount), cr(A.cash, s.amount)],
  }[s.type];
  entries.push(entry(s, s.paidOn, 'initial', label(`${recognize ? 'billed' : 'paid'} ${money(s.amount)} for ${longDate(s.start)} to ${longDate(s.end)}`), init));
  moves.push({ date: s.paidOn, kind: 'addition', cents: s.amount });
  const rows = [];
  let bal = s.amount;
  const cancelMonth = s.cancelOn ? monthOf(s.cancelOn) : null;
  for (let i = 0; i < plan.length; i++) {
    const p = plan[i];
    if (cancelMonth && p.month > cancelMonth) break;
    let cents = p.cents;
    let date = monthEnd(p.month);
    if (cancelMonth === p.month) {
      date = s.cancelOn;
      // Daily: only the days up to the last day used. Monthly conventions: the month counts in full.
      if (s.method === 'daily') {
        const total = dayNumber(s.end) - dayNumber(s.start) + 1;
        const from = p.month === monthOf(s.start) ? s.start : monthStart(p.month);
        cents = Math.min(bal, share(s.amount, dayNumber(s.cancelOn) - dayNumber(from) + 1, total));
      }
      cents = Math.min(cents, bal);
    }
    const nth = `${monthName(p.month)} (${i + 1} of ${plan.length})`;
    const lines = recognize ? [dr(A.balance, cents), cr(A.pl, cents)] : [dr(A.pl, cents), cr(A.balance, cents)];
    entries.push(entry(s, date, 'amortization', label(`${recognize ? 'revenue earned' : 'amortization'}, ${nth}`), lines));
    moves.push({ date, kind: 'reduction', cents });
    rows.push({ n: i + 1, month: p.month, date, cents, days: p.days ?? null, opening: bal, closing: bal - cents });
    bal -= cents;
  }
  if (cancelMonth && bal > 0) {
    const refund = Math.min(s.refund, bal);
    const rest = bal - refund;
    const lines = recognize
      ? [dr(A.balance, bal), cr(A.cash, refund), cr(A.pl, rest)]
      : [dr(A.cash, refund), dr(A.pl, rest), cr(A.balance, bal)];
    const words = recognize
      ? `cancelled ${longDate(s.cancelOn)}: ${money(refund)} refunded, ${money(rest)} recognized`
      : `cancelled ${longDate(s.cancelOn)}: ${money(refund)} refunded, ${money(rest)} written off`;
    entries.push(entry(s, s.cancelOn, 'cancellation', label(words), lines));
    moves.push({ date: s.cancelOn, kind: 'cancellation', cents: bal });
    rows.push({ n: rows.length + 1, month: cancelMonth, date: s.cancelOn, cents: bal, cancelled: true, refund, writeOff: rest, opening: bal, closing: 0 });
  }
  return { s, rows, entries, moves };
}

// ---------- the 12-month rule (duration test only) ----------

// 26 CFR 1.263(a)-4(f)(1): no capitalization for a right or benefit that does not extend beyond the
// earlier of (i) 12 months after the first date the benefit is realized and (ii) the end of the
// taxable year following the taxable year in which the payment is made.
export function twelveMonthRule({ paidOn, start, end }, taxYearEnd = '12-31') {
  const [mm, dd] = taxYearEnd.split('-').map(Number);
  const yearEndAfter = (d) => {
    const y = +d.slice(0, 4);
    const fit = (yy) => `${yy}-${pad(mm)}-${pad(Math.min(dd, daysInMonth(yy, mm)))}`;
    return fit(y) >= d ? fit(y) : fit(y + 1);
  };
  const limitA = addMonths(start, 12);
  const yearOfPayment = yearEndAfter(paidOn);
  const limitB = yearEndAfter(addDays(yearOfPayment, 1));
  const limit = limitA < limitB ? limitA : limitB;
  const meets = end <= limit;
  return {
    meets, end, limit, limitA, limitB, taxYearEnd,
    words: meets
      ? `Coverage ends ${longDate(end)}, not beyond ${longDate(limit)} (the earlier of 12 months after ${longDate(start)} and the end of the tax year after the one paid in, ${longDate(limitB)}): the duration test of the 12-month rule is met.`
      : `Coverage ends ${longDate(end)}, beyond ${longDate(limit)} (the earlier of 12 months after ${longDate(start)}, ${longDate(limitA)}, and the end of the tax year after the one paid in, ${longDate(limitB)}): the duration test of the 12-month rule is not met, so the rule does not let the payment be deducted when paid.`,
  };
}

// ---------- the CSV template ----------

const HEADER_ALIASES = {
  id: ['id', 'item', 'schedule', 'description', 'contract'], type: ['type', 'schedule type'], amount: ['amount', 'cost', 'total', 'principal'],
  start: ['start', 'start date', 'service start', 'loan date'], months: ['months', 'term', 'term months', 'payments'], end: ['end', 'end date', 'service end'],
  method: ['method', 'convention'], paidOn: ['paid on', 'paidon', 'paid', 'invoice date', 'payment date'],
  balance: ['balance account', 'balanceaccount', 'asset or liability account', 'prepaid account', 'deferred account'],
  pl: ['pl account', 'placcount', 'expense or revenue account', 'expense account', 'revenue account'],
  cash: ['cash account', 'cashaccount', 'bank account'], name: ['name', 'vendor', 'customer', 'lender'],
  rate: ['rate', 'annual rate', 'interest rate'], payment: ['payment'], firstPayment: ['first payment', 'firstpayment'],
  dayCount: ['day count', 'daycount'], interestOnly: ['interest only', 'interestonly'], cancelOn: ['cancel on', 'cancelon', 'cancelled on'], refund: ['refund'],
};
export const TEMPLATE_COLUMNS = ['Item', 'Type', 'Amount', 'Start', 'Months', 'End', 'Method', 'Paid on', 'Balance account', 'PL account', 'Cash account', 'Name', 'Rate', 'Payment', 'First payment', 'Day count', 'Cancel on', 'Refund'];

export function parseCsv(textIn) {
  const t = String(textIn).replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && t[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ''));
}

const TYPE_ALIASES = { prepaid: 'prepaid', 'prepaid expense': 'prepaid', prepayment: 'prepaid', 'deferred revenue': 'deferred-revenue', 'deferred-revenue': 'deferred-revenue', 'unearned revenue': 'deferred-revenue', 'deferred income': 'deferred-revenue', loan: 'loan', mortgage: 'loan', 'loan fees': 'loan-fees', 'loan-fees': 'loan-fees', 'loan fee': 'loan-fees', 'debt issuance costs': 'loan-fees' };

// Schedules from the CSV template (or any sheet with those headings; other columns are ignored, so
// the template's monthly columns can stay). Returns raw schedules for normalize().
export function readTemplate(csv) {
  if (String(csv).length > LIMITS.bytes) fail('The CSV is at most 1,000,000 characters.', 'csv');
  const rows = parseCsv(csv);
  if (!rows.length) fail('The CSV is empty.', 'csv');
  const head = rows[0].map((h) => h.trim().toLowerCase().replace(/[*_]/g, ' ').replace(/\s+/g, ' ').trim());
  const col = {};
  for (const [k, names] of Object.entries(HEADER_ALIASES)) {
    const i = head.findIndex((h) => names.includes(h));
    if (i >= 0) col[k] = i;
  }
  for (const k of ['type', 'amount', 'start']) if (col[k] === undefined) fail(`The CSV needs a ${k[0].toUpperCase() + k.slice(1)} column (the template's headings are ${TEMPLATE_COLUMNS.join(', ')}).`, 'csv');
  const out = [];
  for (let r = 1; r < rows.length; r++) {
    const get = (k) => (col[k] === undefined ? '' : String(rows[r][col[k]] ?? '').trim());
    if (/^total/i.test(get('id')) || (!get('type') && !get('amount'))) continue;
    const line = `CSV row ${r + 1}`;
    const type = TYPE_ALIASES[get('type').toLowerCase()];
    if (!type) fail(`${line}: Type "${get('type')}" is not prepaid, deferred revenue, loan or loan fees.`, 'csv');
    const amount = toCents(get('amount'));
    if (amount === null) fail(`${line}: Amount "${get('amount')}" is not a dollar amount.`, 'csv');
    const day = (k) => { const v = get(k); if (!v) return undefined; const d = parseDay(v); if (!d) fail(`${line}: ${k} "${v}" is not a date (write 2026-11-15 or 11/15/2026).`, 'csv'); return d; };
    const num = (k) => { const v = get(k).replace(/%$/, ''); if (!v) return undefined; const x = Number(v); if (!Number.isFinite(x)) fail(`${line}: ${k} "${get(k)}" is not a number.`, 'csv'); return x; };
    const s = { type, amount: amount / 100, start: day('start') };
    if (!s.start) fail(`${line}: Start is required.`, 'csv');
    const opt = { id: get('id'), name: get('name'), method: get('method').toLowerCase(), dayCount: get('dayCount').toLowerCase() };
    for (const [k, v] of Object.entries(opt)) if (v) s[k] = v;
    for (const k of ['end', 'paidOn', 'firstPayment', 'cancelOn']) { const v = day(k); if (v) s[k] = v; }
    for (const k of ['months', 'rate']) { const v = num(k); if (v !== undefined) s[k] = v; }
    for (const k of ['payment', 'refund']) { const v = get(k); if (v) { const c = toCents(v); if (c === null) fail(`${line}: ${k} "${v}" is not a dollar amount.`, 'csv'); s[k] = c / 100; } }
    if (/^(yes|true|y|1)$/i.test(get('interestOnly'))) s.interestOnly = true;
    const accounts = {};
    for (const k of ['balance', 'pl', 'cash']) if (get(k)) accounts[k] = get(k);
    if (Object.keys(accounts).length) s.accounts = accounts;
    out.push(s);
  }
  if (!out.length) fail('The CSV has no schedule rows.', 'csv');
  return out;
}

// Raw schedules as the CSV template (the round trip of readTemplate), optionally with one column per
// month holding the amount that schedule posts that month (the waterfall) and a closing balance
// column for the last month. The extra columns are ignored when the file is read back.
export function templateRows(raw, { months = [] } = {}) {
  const cell = (v) => (v === undefined || v === null ? '' : String(v));
  const built = months.length ? raw.map((x, i) => scheduleEntries(normalize(x, i + 1))) : [];
  const head = [...TEMPLATE_COLUMNS, ...months.map(monthName), ...(months.length ? [`Balance ${longDate(monthEnd(months.at(-1)))}`] : [])];
  const rows = raw.map((x, i) => {
    const base = [x.id, { prepaid: 'Prepaid', 'deferred-revenue': 'Deferred revenue', loan: 'Loan', 'loan-fees': 'Loan fees' }[x.type], plain(toCents(x.amount)), x.start, x.months, x.end, x.method, x.paidOn,
      x.accounts?.balance, x.accounts?.pl, x.accounts?.cash, x.name, x.rate, x.payment === undefined ? '' : plain(toCents(x.payment)), x.firstPayment, x.dayCount, x.cancelOn, x.refund === undefined ? '' : plain(toCents(x.refund))].map(cell);
    if (!months.length) return base;
    const b = built[i];
    const per = months.map((mo) => {
      const c = b.s.type === 'loan'
        ? sumBy(b.rows.filter((r) => monthOf(r.date) === mo), (r) => r.principal)
        : sumBy(b.rows.filter((r) => r.month === mo), (r) => r.cents);
      return plain(c);
    });
    return [...base, ...per, plain(balanceAt(b, monthEnd(months.at(-1))))];
  });
  return { columns: head, rows };
}
export const templateCsv = (raw, opts) => { const t = templateRows(raw, opts); return toCsv([t.columns, ...t.rows]); };

// ---------- building ----------

// Normalizes the request's schedules (from `schedules` or `csv`).
export function schedulesOf(req) {
  const raw = req.csv ? readTemplate(req.csv) : req.schedules;
  if (!Array.isArray(raw) || !raw.length) fail('Give schedules (a list) or csv (the template filled in).', 'schedules');
  if (raw.length > LIMITS.schedules) fail(`At most ${LIMITS.schedules} schedules in one call.`, 'schedules');
  return raw.map((x, i) => normalize(x, i + 1));
}

// The job key of a schedule for billing: its terms, not its labels or accounts, so renaming an
// account or a schedule is the same schedule.
export function scheduleKey(s) {
  const terms = [s.type, s.amount, s.start, s.end ?? '', s.months ?? '', s.method ?? '', s.paidOn, s.rate ?? '', s.payment ?? '', s.firstPayment ?? '', s.dayCount ?? '', s.interestOnly ? 'io' : '', s.cancelOn ?? '', s.refund ?? '', s.lender ? JSON.stringify(s.lender) : ''];
  return terms.join('|');
}

const sumBy = (xs, f) => xs.reduce((a, x) => a + f(x), 0);

// The balance of a schedule's balance account at the end of a day (normal side).
const balanceAt = (built, day) => sumBy(built.moves.filter((m) => m.date <= day), (m) => (m.kind === 'addition' ? m.cents : -m.cents));

// Rollforward per balance sheet account for one month.
function rollforward(builtAll, month) {
  const from = monthStart(month);
  const to = monthEnd(month);
  const accounts = new Map();
  for (const b of builtAll) {
    const key = b.s.accounts.balance;
    if (!accounts.has(key)) accounts.set(key, { account: key, side: DEBIT_BALANCE[b.s.type] ? 'debit' : 'credit', types: new Set(), opening: 0, additions: 0, reductions: 0, cancellations: 0, closing: 0, schedules: 0 });
    const a = accounts.get(key);
    a.types.add(b.s.type);
    a.opening += balanceAt(b, addDays(from, -1));
    a.closing += balanceAt(b, to);
    for (const m of b.moves.filter((x) => x.date >= from && x.date <= to)) {
      if (m.kind === 'addition') a.additions += m.cents;
      else if (m.kind === 'reduction') a.reductions += m.cents;
      else a.cancellations += m.cents;
    }
    if (balanceAt(b, to) !== 0 || b.moves.some((x) => x.date >= from && x.date <= to)) a.schedules += 1;
  }
  return [...accounts.values()].map((a) => ({ ...a, types: [...a.types] }));
}

// Totals of one month's activity, for the answer.
function monthTotals(builtAll, month, { includeInitial }) {
  const t = { prepaid: 0, deferred: 0, interest: 0, principal: 0, fees: 0, cancelled: 0, lines: 0, entries: 0, schedules: 0 };
  for (const b of builtAll) {
    const es = b.entries.filter((e) => monthOf(e.date) === month && (includeInitial || e.kind !== 'initial'));
    if (es.length) t.schedules += 1;
    for (const e of es) {
      t.entries += 1;
      t.lines += e.lines.length;
      if (e.kind === 'amortization') {
        const c = e.lines[0].dr;
        if (b.s.type === 'prepaid') t.prepaid += c;
        else if (b.s.type === 'deferred-revenue') t.deferred += c;
        else t.fees += c;
      }
      if (e.kind === 'payment') {
        const row = b.rows.find((r) => r.date === e.date);
        t.interest += row.interest;
        t.principal += row.principal;
      }
      if (e.kind === 'cancellation') t.cancelled += b.rows.find((r) => r.cancelled).cents;
    }
  }
  return t;
}

export function answerFor(month, totals, count) {
  const parts = [];
  if (totals.prepaid) parts.push(`${money(totals.prepaid)} from prepaids to expense`);
  if (totals.deferred) parts.push(`${money(totals.deferred)} from deferred revenue to revenue`);
  if (totals.interest || totals.principal) parts.push(`${money(totals.interest)} of loan interest against ${money(totals.principal)} of principal`);
  if (totals.fees) parts.push(`${money(totals.fees)} of loan fees to interest expense`);
  if (totals.cancelled) parts.push(`${money(totals.cancelled)} cleared on cancellation`);
  const list = parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}` : parts[0];
  const sched = `${count} ${count === 1 ? 'schedule' : 'schedules'}`;
  const post = count === 1 ? 'posts' : 'post';
  if (!parts.length) return `For ${monthName(month)}, your ${sched} ${post} no entries: nothing falls in that month.`;
  return `For ${monthName(month)}, your ${sched} ${post} ${totals.lines} journal lines: ${list}.`;
}

// Everything both ops share: the built schedules and the month list.
function build(req) {
  const schedules = schedulesOf(req);
  const loanEntry = req.loanEntry ?? 'payment';
  const built = schedules.map((s) => scheduleEntries(s, { loanEntry }));
  return { schedules, built, loanEntry };
}

const bySchedule = (b) => {
  const s = b.s;
  const base = { n: s.n, id: s.id, type: s.type, amount: s.amount, start: s.start, accounts: s.accounts };
  if (s.type === 'loan') return { ...base, rate: s.rate, dayCount: s.dayCount, payments: b.rows.length, payment: b.rows[0]?.payment ?? 0, lastPayment: b.rows.at(-1)?.date ?? null, totalInterest: sumBy(b.rows, (r) => r.interest), lender: Boolean(s.lender) };
  return { ...base, end: s.end, months: s.months, method: s.method, paidOn: s.paidOn, cancelOn: s.cancelOn ?? null, firstMonth: b.rows[0]?.month ?? null, lastMonth: b.rows.at(-1)?.month ?? null };
};

function tieOut(roll, gl) {
  if (!gl) return null;
  return roll.map((a) => {
    const given = gl[a.account];
    if (given === undefined) return { account: a.account, schedule: a.closing, gl: null, difference: null };
    const c = toCents(given);
    if (c === null) fail(`glBalances: ${a.account} must be a dollar amount.`, 'glBalances');
    return { account: a.account, schedule: a.closing, gl: c, difference: c - a.closing, ties: c === a.closing };
  });
}

// The free preview for one month: the answer, each schedule's amount that month, the balances, the
// rollforward and tie-out, and the 12-month rule check of each prepaid.
export function preview(req) {
  if (!isMonth(req.period)) fail('period is the month to show, written like 2026-11.', 'period');
  const { built, loanEntry } = build(req);
  const month = req.period;
  const includeInitial = Boolean(req.includeInitial);
  const totals = monthTotals(built, month, { includeInitial });
  const roll = rollforward(built, month);
  const items = built.map((b) => {
    const es = b.entries.filter((e) => monthOf(e.date) === month && (includeInitial || e.kind !== 'initial'));
    const amount = sumBy(es, (e) => (e.kind === 'payment' ? b.rows.find((r) => r.date === e.date).payment : e.lines[0].dr || e.lines[0].cr));
    const loan = b.s.type === 'loan' ? b.rows.filter((r) => monthOf(r.date) === month) : [];
    return {
      ...bySchedule(b),
      thisMonth: amount,
      interest: sumBy(loan, (r) => r.interest),
      principal: sumBy(loan, (r) => r.principal),
      balance: balanceAt(b, monthEnd(month)),
      twelveMonthRule: b.s.type === 'prepaid' ? twelveMonthRule(b.s, req.taxYearEnd ?? '12-31') : null,
    };
  });
  return {
    op: 'preview',
    period: month,
    answer: answerFor(month, totals, built.length),
    totals,
    loanEntry,
    schedules: items,
    rollforward: roll,
    tieOut: tieOut(roll, req.glBalances),
    engine: ENGINE_VERSION,
  };
}

// ---------- journals and files ----------

const mdy = (d) => `${d.slice(5, 7)}/${d.slice(8, 10)}/${d.slice(0, 4)}`;
const csvField = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  // A cell a spreadsheet would run as a formula is written as text.
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const toCsv = (rows) => rows.map((r) => r.map(csvField).join(',')).join('\r\n') + '\r\n';

// Groups the entries into journals: one per date. lines 'by-schedule' keeps each schedule's lines;
// 'by-account' nets them to one line per account (fewer lines for Xero's 300-line files).
export function journals(entries, { lines = 'by-schedule', prefix = 'AM' } = {}) {
  const byDate = new Map();
  for (const e of entries) {
    if (!byDate.has(e.date)) byDate.set(e.date, []);
    byDate.get(e.date).push(e);
  }
  return [...byDate.keys()].sort().map((date) => {
    const es = byDate.get(date);
    let ls;
    if (lines === 'by-account') {
      const net = new Map();
      for (const e of es) for (const l of e.lines) net.set(l.account, (net.get(l.account) ?? 0) + l.dr - l.cr);
      ls = [...net.entries()].filter(([, c]) => c !== 0).map(([account, c]) => ({ account, dr: c > 0 ? c : 0, cr: c < 0 ? -c : 0, desc: `Amortization schedules, ${longDate(date)} (${es.length} ${es.length === 1 ? 'entry' : 'entries'})`, name: undefined }));
    } else {
      ls = es.flatMap((e) => e.lines.map((l) => ({ ...l, desc: e.desc, name: e.name })));
    }
    const debits = sumBy(ls, (l) => l.dr);
    const credits = sumBy(ls, (l) => l.cr);
    if (debits !== credits) throw new Error(`Journal on ${date} does not balance (${debits} vs ${credits})`);
    return { no: `${prefix}-${date.replace(/-/g, '')}`, date, lines: ls, debits, entries: es.length };
  });
}

export const QBO_COLUMNS = ['Journal No.', 'Journal Date', 'Account Name', 'Debits', 'Credits', 'Description', 'Name'];
export const XERO_COLUMNS = ['Narration', 'Date', 'Description', 'AccountCode', 'TaxRate', 'Amount', 'TrackingName1', 'TrackingOption1', 'TrackingName2', 'TrackingOption2'];
export const GENERIC_COLUMNS = ['Date', 'Journal', 'Account', 'Debit', 'Credit', 'Description', 'Name'];

export function qboCsv(js) {
  return toCsv([QBO_COLUMNS, ...js.flatMap((j) => j.lines.map((l) => [j.no, mdy(j.date), l.account, l.dr ? plain(l.dr) : '', l.cr ? plain(l.cr) : '', l.desc, l.name ?? '']))]);
}
// Xero: Narration and Date on a journal's first row only; debits positive, credits negative; files of
// at most 300 lines, never splitting a journal.
export function xeroFiles(js, { taxRate = '' } = {}) {
  const files = [];
  let cur = [];
  for (const j of js) {
    if (j.lines.length > LIMITS.xeroLines) fail(`The journal on ${longDate(j.date)} has ${j.lines.length} lines; Xero imports at most ${LIMITS.xeroLines} lines per file. Use lines "by-account".`, 'lines');
    if (cur.length + j.lines.length > LIMITS.xeroLines) { files.push(cur); cur = []; }
    j.lines.forEach((l, i) => cur.push([i === 0 ? `Schedule entries ${longDate(j.date)} (${j.no})` : '', i === 0 ? mdy(j.date) : '', l.desc, l.account, taxRate, plain(l.dr - l.cr), '', '', '', '']));
  }
  if (cur.length) files.push(cur);
  return files.map((rows) => toCsv([XERO_COLUMNS, ...rows]));
}
export function genericCsv(js) {
  return toCsv([GENERIC_COLUMNS, ...js.flatMap((j) => j.lines.map((l) => [j.date, j.no, l.account, l.dr ? plain(l.dr) : '', l.cr ? plain(l.cr) : '', l.desc, l.name ?? '']))]);
}

// Warnings about the import the books will refuse or mis-post.
function importWarnings(built, format, includeInitial) {
  const w = [];
  const accounts = new Set(built.flatMap((b) => [b.s.accounts.balance, b.s.accounts.pl, ...(b.s.type === 'loan' || includeInitial || b.s.cancelOn ? [b.s.accounts.cash] : [])]));
  if (format === 'xero') {
    const names = [...accounts].filter((a) => !/^[A-Za-z0-9.-]{1,10}$/.test(a));
    if (names.length) w.push(`Xero imports account codes, not names: ${names.slice(0, 5).join(', ')}${names.length > 5 ? ' and others' : ''} must be replaced with codes such as 200 before importing.`);
    w.push('Xero needs a tax rate on each line before it posts: set taxRate, or add it to the drafts in Xero.');
  }
  if (format === 'qbo') {
    const ap = [...accounts].filter((a) => /payable|receivable/i.test(a) && !/loan|note/i.test(a));
    if (ap.length) w.push(`QuickBooks Online asks for a Name (customer or vendor) on lines to ${ap.join(', ')}; give each schedule a name.`);
  }
  return w;
}

// The paid output: every month in the range, each schedule's full table, the journals and the import
// files, the rollforward for each month and the tie-out at the last one.
export function journal(req) {
  const { built, loanEntry } = build(req);
  const includeInitial = Boolean(req.includeInitial);
  const all = built.flatMap((b) => b.entries).filter((e) => includeInitial || e.kind !== 'initial');
  const months = all.map((e) => monthOf(e.date)).sort();
  const from = req.from ?? months[0] ?? req.to;
  const to = req.to ?? months.at(-1) ?? req.from;
  if (!from || !to) fail('These schedules post nothing; give from and to.', 'from');
  if (!isMonth(from)) fail('from is a month written like 2026-11.', 'from');
  if (!isMonth(to)) fail('to is a month written like 2027-10.', 'to');
  if (to < from) fail('to is before from.', 'to');
  if (monthIndex(to) - monthIndex(from) + 1 > LIMITS.rangeMonths) fail(`At most ${LIMITS.rangeMonths} months in one call.`, 'to');
  const inRange = all.filter((e) => monthOf(e.date) >= from && monthOf(e.date) <= to)
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.schedule - b.schedule));
  const format = req.format ?? 'qbo';
  const js = journals(inRange, { lines: req.lines ?? 'by-schedule', prefix: req.journalPrefix ?? 'AM' });
  const files = format === 'qbo' ? [{ name: `quickbooks-online-journal-entries-${from}-to-${to}.csv`, csv: qboCsv(js) }]
    : format === 'xero' ? xeroFiles(js, { taxRate: req.taxRate ?? '' }).map((csv, i, a) => ({ name: `xero-manual-journals-${from}-to-${to}${a.length > 1 ? `-part-${i + 1}` : ''}.csv`, csv }))
      : [{ name: `journal-entries-${from}-to-${to}.csv`, csv: genericCsv(js) }];
  const monthList = [];
  for (let i = monthIndex(from); i <= monthIndex(to); i++) monthList.push(monthFromIndex(i));
  const perMonth = monthList.map((mo) => ({ month: mo, totals: monthTotals(built, mo, { includeInitial }), rollforward: rollforward(built, mo) }));
  const last = perMonth.at(-1);
  return {
    op: 'journal',
    from, to, format, loanEntry,
    answer: answerFor(to, last.totals, built.length),
    journals: js.length,
    lines: sumBy(js, (j) => j.lines.length),
    files,
    schedules: built.map((b) => ({ ...bySchedule(b), rows: b.rows, twelveMonthRule: b.s.type === 'prepaid' ? twelveMonthRule(b.s, req.taxYearEnd ?? '12-31') : null })),
    months: perMonth,
    tieOut: tieOut(last.rollforward, req.glBalances),
    warnings: importWarnings(built, format, includeInitial),
    engine: ENGINE_VERSION,
  };
}

// ---------- the worked sample (the tool page at rest, the examples and several content pages) ----------

export const SAMPLE = {
  period: '2026-11',
  schedules: [
    { id: 'Hartwell general liability policy', type: 'prepaid', amount: 12000, start: '2026-07-01', months: 12, accounts: { balance: 'Prepaid Insurance', pl: 'Insurance Expense' }, name: 'Hartwell Mutual' },
    { id: 'Design software, annual seats', type: 'prepaid', amount: 4380, start: '2026-09-17', end: '2027-09-16', method: 'daily', accounts: { balance: 'Prepaid Expenses', pl: 'Software Subscriptions' } },
    { id: 'Bayline Foods support contract', type: 'deferred-revenue', amount: 30000, start: '2026-10-01', months: 12, accounts: { balance: 'Deferred Revenue', pl: 'Service Revenue' }, name: 'Bayline Foods' },
    { id: 'Equipment loan', type: 'loan', amount: 60000, start: '2026-06-15', months: 60, rate: 6.5, accounts: { balance: 'Equipment Loan', pl: 'Interest Expense', cash: 'Checking' } },
  ],
};
