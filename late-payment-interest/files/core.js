// Late-payment interest: the statutory interest and fixed compensation a supplier may claim on a
// late business invoice, from the official rules and rate tables (data/rules.json, data/rates.json).
// Pure and dependency-free: the page loads this same file, so the browser and the server agree.
//
// Laws applied (each with its own rate rule):
//   uk          Late Payment of Commercial Debts (Interest) Act 1998: 8% over the Bank Rate on the
//               reference date (31 Dec or 30 Jun) before the day interest starts, fixed for the debt;
//               simple, 365-day year; £40 / £70 / £100; at most 6 years.
//   ie          S.I. 580/2012: ECB main refinancing rate on 1 Jan / 1 Jul plus 8 points, applied to
//               each half-year of the delay; €40 / €70 / €100.
//   de          § 288(2) BGB: Basiszinssatz plus 9 points, changing on 1 Jan / 1 Jul; €40 (§ 288(5)).
//   eu          Directive 2011/7/EU minimum: ECB rate on 1 Jan / 1 Jul plus 8 points; at least €40.
//   us-federal  Prompt Payment Act, 5 CFR 1315.10: rate in effect the day after the due date, 360-day
//               year, compounded every 30 days, for at most one year.
//   us-tx       Texas Gov. Code 2251.025: the rate of the fiscal year (Sep 1 - Aug 31) in which the
//               payment became overdue, days / 365, simple.
//   us-fl       Florida s. 218.74(4): 1% a month from 30 days after the due date, compounded monthly,
//               a part month counts as a month.
//   terms       the visitor's own agreed rate (per month or per year, simple or monthly compounding).
// Money is whole minor units (pence, cents); rates are thousandths of a percent (11.75% = 11750).

export class LatePaymentError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'LatePaymentError';
    this.field = field;
  }
}
const fail = (message, field) => { throw new LatePaymentError(message, field); };

export const JURISDICTIONS = ['uk', 'ie', 'de', 'eu', 'us-federal', 'us-tx', 'us-fl', 'terms'];
export const STATUTORY = ['uk', 'ie', 'de', 'eu'];
export const SYMBOL = { GBP: '£', EUR: '€', USD: '$' };

// ---------- dates (ISO strings, UTC) ----------

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export function isRealDate(s) {
  const m = DATE_RE.exec(String(s));
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}
const toMs = (s) => Date.parse(`${s}T00:00:00Z`);
const fromMs = (ms) => new Date(ms).toISOString().slice(0, 10);
export const addDays = (s, n) => fromMs(toMs(s) + n * 86_400_000);
export const diffDays = (a, b) => Math.round((toMs(a) - toMs(b)) / 86_400_000);
const daysInMonth = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
// The same day n months later; a day the month lacks becomes its last day (31 Jan + 1 = 28 Feb).
export function addMonths(s, n) {
  const [y, m, d] = s.split('-').map(Number);
  const t = (m - 1) + n;
  const yy = y + Math.floor(t / 12);
  const mm = ((t % 12) + 12) % 12 + 1;
  return `${yy}-${String(mm).padStart(2, '0')}-${String(Math.min(d, daysInMonth(yy, mm))).padStart(2, '0')}`;
}
export const addYears = (s, n) => addMonths(s, 12 * n);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function longDate(s) {
  const [y, m, d] = s.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
// The half-year a date is in, and its first day.
export const halfOf = (s) => `${s.slice(0, 4)}-H${Number(s.slice(5, 7)) <= 6 ? 1 : 2}`;
export const halfStart = (h) => `${h.slice(0, 4)}-${h.endsWith('1') ? '01' : '07'}-01`;
export const halfEnd = (h) => `${h.slice(0, 4)}-${h.endsWith('1') ? '06-30' : '12-31'}`;
const nextHalf = (h) => (h.endsWith('1') ? `${h.slice(0, 4)}-H2` : `${Number(h.slice(0, 4)) + 1}-H1`);
export const halfWords = (h) => `${h.endsWith('1') ? 'January 1 to June 30' : 'July 1 to December 31'}, ${h.slice(0, 4)}`;

// ---------- numbers ----------

// "11.75" -> 11750 (thousandths of a percent). Up to three decimals, sign allowed.
export function parseRate(v, field = 'rate') {
  const s = String(v).trim().replace(/%$/, '').trim();
  const m = /^(-?)(\d{1,3})(?:\.(\d{1,3}))?$/.exec(s);
  if (!m) fail(`${field} must be a percentage such as 1.5 or 11.75.`, field);
  const n = Number(m[2]) * 1000 + Number((m[3] ?? '').padEnd(3, '0'));
  return m[1] ? -n : n;
}
export function rateText(milli) {
  const sign = milli < 0 ? '-' : '';
  const a = Math.abs(milli);
  const frac = String(a % 1000).padStart(3, '0').replace(/0+$/, '');
  return `${sign}${Math.floor(a / 1000)}${frac ? `.${frac}` : ''}%`;
}

// Money in: a number or text such as "1,500.00" or "£1,500". Out: whole minor units.
export function parseMoney(v, field = 'amount') {
  const s = typeof v === 'number' ? String(v) : String(v ?? '').trim().replace(/^[£€$]\s*/, '').replace(/,/g, '');
  const m = /^(\d{1,9})(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) fail(`${field} must be an amount such as 1500 or "1,500.00" (at most two decimals).`, field);
  return Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'));
}
export function money(minor, currency = 'GBP') {
  const neg = minor < 0;
  const a = Math.abs(minor);
  const whole = String(Math.floor(a / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}${SYMBOL[currency] ?? ''}${whole}.${String(a % 100).padStart(2, '0')}`;
}
// Whole pounds or euros without pence when there are none (fixed sums: "£40").
export const moneyShort = (minor, currency) => (minor % 100 ? money(minor, currency) : money(minor, currency).slice(0, -3));

// Simple interest in minor units, exact, rounded half up: amount x rate x days / basis.
const DEN = 100_000n;
function simple(minor, milli, days, basis) {
  const num = BigInt(minor) * BigInt(milli) * BigInt(days);
  const den = BigInt(basis) * DEN;
  const neg = num < 0n;
  const a = neg ? -num : num;
  const q = (a * 2n + den) / (den * 2n);
  return Number(neg ? -q : q);
}
// The daily amount, to four decimals of the minor unit's major (0.2329 = 23.29p a day).
function dailyOf(minor, milli, basis) {
  const num = BigInt(minor) * BigInt(milli) * 100n;
  const den = BigInt(basis) * DEN;
  return Number((num * 2n + den) / (den * 2n)) / 10000;
}
const roundMinor = (x) => Math.round(x + 1e-9);

// ---------- the engine ----------

export function makeEngine({ rates, rules }) {
  const J = rules.jurisdictions;
  const UK = rates.uk;
  const ECB = rates.ecb;

  // The rate in force on a day from a list of changes ({ from, rate }), and the change it came from.
  const inForce = (changes, day) => {
    let hit = null;
    for (const c of changes) if (c.from <= day) hit = c;
    return hit;
  };

  // UK: the reference date for interest that starts on `start`.
  const ukReferenceDate = (start) => (Number(start.slice(5, 7)) <= 6 ? `${Number(start.slice(0, 4)) - 1}-12-31` : `${start.slice(0, 4)}-06-30`);
  function ukReference(start) {
    const date = ukReferenceDate(start);
    if (date > UK.knownThrough) {
      fail(`Interest that starts on ${longDate(start)} uses the Bank Rate on ${longDate(date)}, which is not known yet (rates read ${longDate(UK.knownThrough)}; Bank Rate is ${UK.latest.rate}% since ${longDate(UK.latest.decided)}, next decision ${longDate(UK.latest.nextDecision)}).`, 'dueDate');
    }
    const c = inForce(UK.changes, date);
    const base = parseRate(c.rate);
    return { date, base, changedOn: c.from, rate: base + parseRate(J.uk.margin), source: UK.source };
  }

  // The reference rate for a half-year under the EU directive, Ireland or Germany.
  function halfReference(code, h) {
    const first = halfStart(h);
    if (J[code].reference === 'de') {
      const row = rates.de.halfYears.find((x) => x.from === first);
      if (!row) fail(`The Basiszinssatz for ${halfWords(h)} is not loaded (loaded: ${rates.de.halfYears[0].from} to ${rates.de.halfYears.at(-1).from}; it changes on January 1 and July 1).`, 'paidDate');
      const base = parseRate(row.rate);
      return { half: h, date: first, base, changedOn: first, rate: base + parseRate(J[code].margin), source: rates.de.source };
    }
    if (first > ECB.knownThrough) fail(`The ECB rate in force on ${longDate(first)} is not known yet (rates read ${longDate(ECB.knownThrough)}). Use an end date up to ${longDate(halfEnd(halfOf(ECB.knownThrough)))}.`, 'paidDate');
    const c = inForce(ECB.changes, first);
    const base = parseRate(c.rate);
    return { half: h, date: first, base, changedOn: c.from, rate: base + parseRate(J[code].margin), source: ECB.source };
  }

  function compensation(code, minor) {
    const c = J[code].compensation;
    if (c.kind === 'flat') return parseMoney(c.amount);
    if (c.kind !== 'bands') return 0;
    for (const b of c.bands) {
      if (b.below !== undefined && minor < parseMoney(b.below)) return parseMoney(b.amount);
      if (b.upTo !== undefined && minor <= parseMoney(b.upTo)) return parseMoney(b.amount);
      if (b.below === undefined && b.upTo === undefined) return parseMoney(b.amount);
    }
    return 0;
  }

  // The dates every calculation shares: the due date (last day to pay) and the end of the claim.
  function datesOf(i, code) {
    const rule = J[code];
    let due = i.dueDate;
    let dueFrom = 'given';
    if (!due) {
      if (!i.invoiceDate) fail('Give the due date (the last day of the payment terms), or the invoice date.', 'dueDate');
      if (!isRealDate(i.invoiceDate)) fail('invoiceDate must be a date written like 2026-08-01.', 'invoiceDate');
      const terms = i.termsDays ?? rule.defaultTermsDays ?? 30;
      if (!Number.isInteger(terms) || terms < 0 || terms > 365) fail('termsDays must be a whole number of days from 0 to 365.', 'termsDays');
      due = addDays(i.invoiceDate, terms);
      dueFrom = i.termsDays === undefined ? 'statutory' : 'terms';
    }
    if (!isRealDate(due)) fail('dueDate must be a date written like 2026-08-31.', 'dueDate');
    const end = i.paidDate ?? i.asOf;
    const endField = i.paidDate ? 'paidDate' : 'asOf';
    if (!end) fail('Give the date it was paid (paidDate), or the date to work interest out to (asOf).', 'asOf');
    if (!isRealDate(end)) fail(`${endField} must be a date written like 2026-11-02.`, endField);
    return { due, dueFrom, end, endField, paid: !!i.paidDate, termsDays: i.termsDays ?? (dueFrom === 'statutory' ? rule.defaultTermsDays ?? 30 : null) };
  }

  function guards(i, code) {
    const rule = J[code];
    if (i.debtorIsConsumer && code !== 'terms') fail(`${rule.law} covers business debts only, not money owed by a consumer.`, 'debtorIsConsumer');
    if (i.disputed && code !== 'terms') {
      const why = { uk: J.uk.quotes.disputes, 'us-federal': 'Interest penalties are not required when payment is delayed because of a dispute (5 CFR 1315.10(c)).', 'us-tx': 'Chapter 2251 does not apply where a bona fide dispute causes the payment to be late (Gov. Code 2251.002).' }[code];
      fail(`Not worked out for a disputed invoice. ${why ?? 'Interest is due only where the debtor is responsible for the delay; settle the dispute first.'}`, 'disputed');
    }
    if (i.contractRate !== undefined && ['uk', 'ie', 'eu'].includes(code)) {
      fail(`Your contract sets its own late-payment rate, so statutory interest does not apply to it (${code === 'uk' ? 'GOV.UK: "You cannot claim statutory interest if there\'s a different rate of interest in a contract."' : 'the rate applies "unless otherwise specified in the contract"'}). Use jurisdiction "terms" with the contract's rate.`, 'contractRate');
    }
  }

  // One result shape for every law.
  function finish(code, i, d, minor, periods, extra = {}) {
    const rule = J[code];
    const currency = code === 'terms' ? (i.currency ?? 'USD') : rule.currency;
    const interest = periods.reduce((s, p) => s + p.interest, 0);
    const comp = extra.compensation ?? 0;
    const flat = extra.flatFee ?? 0;
    const total = interest + comp + flat;
    const last = periods.at(-1);
    return {
      jurisdiction: code,
      name: rule.name,
      law: rule.law,
      currency,
      amount: minor,
      dueDate: d.due,
      dueFrom: d.dueFrom,
      termsDays: d.termsDays,
      end: d.end,
      endKind: d.paid ? 'paid' : 'asOf',
      interestFrom: extra.interestFrom ?? (periods[0]?.from ?? null),
      interestTo: extra.interestTo ?? (last?.to ?? null),
      daysLate: Math.max(0, diffDays(d.end, d.due)),
      days: periods.reduce((s, p) => s + p.days, 0),
      periods,
      interest,
      compensation: comp,
      flatFee: flat,
      total,
      owed: d.paid ? total : total + minor,
      daily: extra.daily ?? null,
      capped: extra.capped ?? false,
      notes: extra.notes ?? [],
      display: {
        amount: money(minor, currency),
        interest: money(interest, currency),
        compensation: moneyShort(comp, currency),
        flatFee: money(flat, currency),
        total: money(total, currency),
        owed: money(d.paid ? total : total + minor, currency),
        daily: extra.daily === null || extra.daily === undefined ? null : `${SYMBOL[currency]}${extra.daily.toFixed(2)}`,
        rate: last ? rateText(last.rate) : null,
      },
    };
  }

  function notLate(code, i, d, minor, why) {
    const r = finish(code, i, d, minor, [], { notes: [why] });
    r.notLate = true;
    return r;
  }

  // ---------- each law ----------

  function uk(i, minor, d) {
    const rule = J.uk;
    if (d.end <= d.due) return notLate('uk', i, d, minor, `Not late: the invoice was due by ${longDate(d.due)}.`);
    const start = addDays(d.due, 1);
    if (start < rule.loadedFrom) fail(`Bank Rate reference dates are loaded for interest starting from ${longDate(rule.loadedFrom)}.`, 'dueDate');
    const ref = ukReference(start);
    const limit = addDays(addYears(start, rule.maxYears), -1);
    const to = d.end > limit ? limit : d.end;
    const days = diffDays(to, start) + 1;
    const notes = [];
    if (d.end > limit) notes.push(`Interest is counted for at most 6 years, to ${longDate(limit)} (Small Business Commissioner: "${rule.quotes.sixYears}").`);
    const periods = [{ from: start, to, days, rate: ref.rate, base: ref.base, referenceDate: ref.date, changedOn: ref.changedOn, interest: simple(minor, ref.rate, days, rule.dayBasis) }];
    return finish('uk', i, d, minor, periods, { compensation: compensation('uk', minor), daily: dailyOf(minor, ref.rate, rule.dayBasis), capped: d.end > limit, notes, reference: ref });
  }

  function halfYearly(code, i, minor, d) {
    const rule = J[code];
    if (d.end <= d.due) return notLate(code, i, d, minor, `Not late: the invoice was due by ${longDate(d.due)}.`);
    const start = addDays(d.due, 1);
    if (start < rule.loadedFrom) fail(`${rule.name}: worked out for interest starting from ${longDate(rule.loadedFrom)}.`, 'dueDate');
    const periods = [];
    let from = start;
    let h = halfOf(start);
    while (from <= d.end) {
      const to = halfEnd(h) < d.end ? halfEnd(h) : d.end;
      const ref = halfReference(code, h);
      const days = diffDays(to, from) + 1;
      periods.push({ from, to, days, rate: ref.rate, base: ref.base, referenceDate: ref.date, changedOn: ref.changedOn, half: h, interest: simple(minor, ref.rate, days, rule.dayBasis) });
      h = nextHalf(h);
      from = halfStart(h);
    }
    const last = periods.at(-1);
    const notes = [];
    if (periods.length > 1) notes.push('The rate changes with each half-year of the delay, so each half-year is worked out at its own rate.');
    if (code === 'eu') notes.push('This is the directive\'s minimum. National law may give more (Germany adds 9 points); check the law that governs the contract.');
    return finish(code, i, d, minor, periods, { compensation: compensation(code, minor), daily: dailyOf(minor, last.rate, rule.dayBasis), notes });
  }

  function federal(i, minor, d) {
    const rule = J['us-federal'];
    if (d.end <= d.due) return notLate('us-federal', i, d, minor, `Not late: payment was due by ${longDate(d.due)}.`);
    const start = addDays(d.due, 1);
    const row = rates.usFederal.periods.find((p) => p.from <= start && start <= p.to);
    if (!row) fail(`Prompt Payment rates are loaded from ${longDate(rates.usFederal.periods[0].from)} to ${longDate(rates.usFederal.periods.at(-1).to)}; the rate for ${longDate(start)} is not loaded.`, 'dueDate');
    const milli = parseRate(row.rate);
    const all = diffDays(d.end, d.due);
    const days = Math.min(all, rule.maxDays);
    const r = milli / 100_000;
    const n = Math.floor(days / 30);
    const rest = days % 30;
    const interest = roundMinor(minor * (1 + r / 12) ** n * (1 + (r / 360) * rest) - minor);
    const to = addDays(d.due, days);
    const notes = [];
    if (all > rule.maxDays) notes.push(`Interest stops after one year (5 CFR 1315.10(a)(5)), here on ${longDate(to)}.`);
    if (interest < 100) notes.push('An interest penalty of less than one dollar need not be paid (5 CFR 1315.10(a)(7)).');
    const periods = [{ from: start, to, days, rate: milli, months: n, extraDays: rest, interest, federalRegister: row.federalRegister, ratePeriod: { from: row.from, to: row.to } }];
    return finish('us-federal', i, d, minor, periods, { daily: dailyOf(minor, milli, 360), capped: all > rule.maxDays, notes });
  }

  function texas(i, minor, d) {
    const rule = J['us-tx'];
    if (d.end <= d.due) return notLate('us-tx', i, d, minor, `Not late: payment was due by ${longDate(d.due)}.`);
    const start = addDays(d.due, 1);
    const fy = Number(start.slice(0, 4)) + (Number(start.slice(5, 7)) >= 9 ? 1 : 0);
    const row = rates.texas.fiscalYears.find((x) => x.fiscalYear === fy);
    if (!row) fail(`Texas rates are loaded for fiscal ${rates.texas.fiscalYears[0].fiscalYear} to ${rates.texas.fiscalYears.at(-1).fiscalYear}; the payment became overdue in fiscal ${fy}.`, 'dueDate');
    const milli = parseRate(row.rate);
    const days = diffDays(d.end, d.due);
    const periods = [{ from: start, to: d.end, days, rate: milli, fiscalYear: fy, interest: simple(minor, milli, days, rule.dayBasis) }];
    const notes = [];
    if (fy !== Number(d.end.slice(0, 4)) + (Number(d.end.slice(5, 7)) >= 9 ? 1 : 0)) notes.push(`The delay runs into a later fiscal year; only one rate is used, fiscal ${fy}'s (Texas Comptroller).`);
    return finish('us-tx', i, d, minor, periods, { daily: dailyOf(minor, milli, 365), notes });
  }

  function florida(i, minor, d) {
    const rule = J['us-fl'];
    const from = addDays(d.due, rule.graceDays);
    if (d.end <= d.due) return notLate('us-fl', i, d, minor, `Not late: payment was due by ${longDate(d.due)}.`);
    if (d.end <= from) {
      const r = notLate('us-fl', i, d, minor, `Late, but interest starts only 30 days after the due date, on ${longDate(from)} (s. 218.74(4)).`);
      r.notLate = false;
      r.interestFrom = from;
      return r;
    }
    let m = 1;
    while (addMonths(from, m) < d.end) m += 1;
    const monthly = parseRate(rule.monthlyRate) / 100_000;
    const interest = roundMinor(minor * ((1 + monthly) ** m - 1));
    const periods = [{ from, to: d.end, days: diffDays(d.end, from), months: m, rate: parseRate(rule.monthlyRate) * 12, monthlyRate: parseRate(rule.monthlyRate), interest }];
    return finish('us-fl', i, d, minor, periods, { interestFrom: from, notes: [`${m} ${m === 1 ? 'month' : 'months'} counted from ${longDate(from)}: a part month counts as a whole month, and unpaid interest compounds monthly (s. 218.74(4)).`] });
  }

  function terms(i, minor, d) {
    if (i.rate === undefined) fail('Give the late-payment rate your terms state, such as 1.5 (percent).', 'rate');
    const milli = parseRate(i.rate, 'rate');
    if (milli <= 0 || milli > 100_000) fail('rate must be above 0 and at most 100 (percent).', 'rate');
    const per = i.per ?? 'month';
    const method = i.method ?? 'simple';
    const grace = i.graceDays ?? 0;
    if (!Number.isInteger(grace) || grace < 0 || grace > 365) fail('graceDays must be a whole number from 0 to 365.', 'graceDays');
    const flat = i.flatFee === undefined ? 0 : parseMoney(i.flatFee, 'flatFee');
    const startAfter = addDays(d.due, grace);
    if (d.end <= d.due) return notLate('terms', i, d, minor, `Not late: payment was due by ${longDate(d.due)}.`);
    if (d.end <= startAfter) {
      const r = notLate('terms', i, d, minor, `Within the ${grace}-day grace period, which ends ${longDate(startAfter)}.`);
      r.notLate = false;
      return r;
    }
    const days = diffDays(d.end, startAfter);
    const from = addDays(startAfter, 1);
    // The monthly rate as a fraction; a per-year rate is spread over 12 months of 30 days.
    const monthly = per === 'month' ? milli / 100_000 : milli / 100_000 / 12;
    let interest;
    if (method === 'simple') {
      interest = per === 'month' ? simple(minor, milli, days, 30) : simple(minor, milli, days, 365);
    } else {
      const n = Math.floor(days / 30);
      interest = roundMinor(minor * (1 + monthly) ** n * (1 + monthly * ((days % 30) / 30)) - minor);
    }
    const yearly = per === 'month' ? milli * 12 : milli;
    const periods = [{ from, to: d.end, days, rate: yearly, monthlyRate: per === 'month' ? milli : null, interest }];
    const notes = [
      method === 'simple'
        ? (per === 'month' ? `Simple interest at ${rateText(milli)} a month, prorated by day (a month counted as 30 days).` : `Simple interest at ${rateText(milli)} a year, by day on a 365-day year.`)
        : 'Interest added to the balance every 30 days, with simple interest for the days after the last full 30.',
      'Charge this only if your signed contract or accepted invoice terms state the rate; a state usury or late-fee limit may apply.',
    ];
    const daily = per === 'month' ? dailyOf(minor, milli, 30) : dailyOf(minor, milli, 365);
    return finish('terms', i, d, minor, periods, { flatFee: flat, daily, notes });
  }

  // The full answer for one invoice. i: { jurisdiction, amount, dueDate | invoiceDate (+termsDays),
  // paidDate | asOf, disputed?, debtorIsConsumer?, contractRate?, and for "terms": rate, per,
  // method, graceDays, flatFee, currency }.
  function calculate(i) {
    const code = i.jurisdiction ?? 'uk';
    if (!J[code]) fail(`jurisdiction must be one of ${JURISDICTIONS.join(', ')}.`, 'jurisdiction');
    const minor = parseMoney(i.amount, 'amount');
    if (minor <= 0) fail('amount must be above 0.', 'amount');
    guards(i, code);
    const d = datesOf(i, code);
    const r = code === 'uk' ? uk(i, minor, d)
      : code === 'us-federal' ? federal(i, minor, d)
        : code === 'us-tx' ? texas(i, minor, d)
          : code === 'us-fl' ? florida(i, minor, d)
            : code === 'terms' ? terms(i, minor, d)
              : halfYearly(code, i, minor, d);
    r.answer = answerOf(r);
    r.sources = (J[code].sources ?? []).map((s) => ({ ...s, readOn: rules.readOn }));
    return r;
  }

  // The first sentence: what may be claimed, in the visitor's numbers.
  function answerOf(r) {
    const c = r.currency;
    const late = `${r.display.amount} invoice due ${longDate(r.dueDate)}`;
    const until = r.endKind === 'paid' ? `paid ${longDate(r.end)}` : `unpaid on ${longDate(r.end)}`;
    if (r.notLate) return `${r.display.amount} due ${longDate(r.dueDate)}: ${r.notes[0]}`;
    if (!r.periods.length) return `On a ${late} and ${until}: ${r.notes[0]} No interest yet.`;
    const p = r.periods[0];
    const days = `${r.daysLate} ${r.daysLate === 1 ? 'day' : 'days'} late`;
    if (r.jurisdiction === 'uk') {
      return `On a ${late} and ${until} (${days}), you can claim ${r.display.interest} statutory interest at ${rateText(p.rate)} (8% plus the ${rateText(p.base)} Bank Rate on ${longDate(p.referenceDate)}) and ${r.display.compensation} fixed compensation: ${r.display.total} in all.${r.endKind === 'asOf' && !r.capped ? ` Interest runs on at ${r.display.daily} a day.` : ''}`;
    }
    if (STATUTORY.includes(r.jurisdiction)) {
      const rateWords = r.periods.length === 1 ? `at ${rateText(p.rate)}` : `at ${r.periods.map((x) => rateText(x.rate)).join(', then ')} by half-year`;
      const what = r.jurisdiction === 'de' ? 'Verzugszinsen (statutory interest)' : 'statutory interest';
      return `On a ${late} and ${until} (${days}), you can claim ${r.display.interest} ${what} ${rateWords} and ${r.display.compensation} fixed compensation: ${r.display.total} in all.${r.endKind === 'asOf' ? ` Interest runs on at ${r.display.daily} a day.` : ''}`;
    }
    if (r.jurisdiction === 'us-federal') return `A federal agency paying a ${late} on ${longDate(r.periods[0].to)} (${r.days} days of interest${r.capped ? ', the one-year limit' : ''}) owes ${r.display.interest} Prompt Payment interest at ${rateText(p.rate)}, compounded every 30 days.`;
    if (r.jurisdiction === 'us-tx') return `A Texas governmental entity paying a ${late} on ${longDate(r.end)} (${days}) owes ${r.display.interest} interest at ${rateText(p.rate)}, the fiscal ${p.fiscalYear} rate.`;
    if (r.jurisdiction === 'us-fl') return `A Florida local government paying a ${late} on ${longDate(r.end)} owes ${r.display.interest} interest: 1% a month for ${p.months} ${p.months === 1 ? 'month' : 'months'} from ${longDate(r.interestFrom)}, compounded monthly.`;
    const fee = r.flatFee ? ` plus the ${r.display.flatFee} flat fee, ${r.display.total} in all` : '';
    return `At the rate in your terms, a ${late} and ${until} accrues ${r.display.interest} over ${r.days} days${fee}.`;
  }

  // ---------- tables ----------

  // Every UK half-year from H1 2003 to the last one whose reference date is known.
  function ukHalfYears() {
    const out = [];
    for (let h = '2003-H1'; ; h = nextHalf(h)) {
      const first = halfStart(h);
      const date = ukReferenceDate(first);
      if (date > UK.knownThrough) break;
      const ref = ukReference(first);
      out.push({ half: h, from: first, to: halfEnd(h), referenceDate: date, base: ref.base, changedOn: ref.changedOn, rate: ref.rate });
    }
    return out;
  }
  function ecbHalfYears(from = '2013-H1') {
    const out = [];
    for (let h = from; halfStart(h) <= ECB.knownThrough; h = nextHalf(h)) {
      const ie = halfReference('ie', h);
      const de = rates.de.halfYears.find((x) => x.from === halfStart(h));
      out.push({ half: h, from: halfStart(h), to: halfEnd(h), ecb: ie.base, ecbChangedOn: ie.changedOn, directive: ie.rate, ireland: ie.rate, basiszins: de ? parseRate(de.rate) : null, germany: de ? parseRate(de.rate) + parseRate(J.de.margin) : null });
    }
    return out;
  }
  function rateTable(code) {
    if (code === 'uk') return ukHalfYears();
    if (['ie', 'de', 'eu'].includes(code)) return ecbHalfYears();
    if (code === 'us-federal') return rates.usFederal.periods.map((p) => ({ ...p, rate: parseRate(p.rate) }));
    if (code === 'us-tx') return rates.texas.fiscalYears.map((p) => ({ ...p, rate: parseRate(p.rate) }));
    if (code === 'us-fl') return [{ rate: parseRate(J['us-fl'].monthlyRate), per: 'month' }];
    return [];
  }

  // Many invoices for one debtor or one ledger: each worked out alone, then totalled.
  function batch({ jurisdiction, asOf, invoices, ...common }) {
    const rows = invoices.map((inv, n) => {
      try {
        const r = calculate({ jurisdiction, asOf, ...common, ...inv, amount: inv.amount });
        return { row: n + 1, invoice: inv.invoice ?? '', ...r };
      } catch (e) {
        if (e instanceof LatePaymentError) throw new LatePaymentError(`Row ${n + 1}${inv.invoice ? ` (invoice ${inv.invoice})` : ''}: ${e.message}`, 'invoices');
        throw e;
      }
    });
    const currency = rows[0]?.currency ?? 'GBP';
    const sum = (k) => rows.reduce((s, r) => s + r[k], 0);
    const totals = { invoices: rows.length, late: rows.filter((r) => r.interest > 0 || r.compensation > 0).length, amount: sum('amount'), interest: sum('interest'), compensation: sum('compensation'), flatFee: sum('flatFee'), total: sum('total') };
    totals.display = { amount: money(totals.amount, currency), interest: money(totals.interest, currency), compensation: money(totals.compensation, currency), total: money(totals.total, currency) };
    return { jurisdiction, currency, asOf: asOf ?? null, rows, totals };
  }

  return { calculate, batch, rateTable, ukHalfYears, ecbHalfYears, ukReference, halfReference, compensation, rules, rates };
}

// ---------- CSV in and out ----------

// RFC 4180 rows.
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let q = false;
  const s = String(text).replace(/^﻿/, '');
  for (let k = 0; k < s.length; k++) {
    const ch = s[k];
    if (q) {
      if (ch === '"') { if (s[k + 1] === '"') { cell += '"'; k++; } else q = false; } else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[k + 1] === '\n') k++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const HEAD = {
  invoice: ['invoice', 'invoice number', 'invoice no', 'number', 'ref', 'reference'],
  amount: ['amount', 'total', 'invoice total', 'amount due', 'value'],
  dueDate: ['due date', 'due', 'duedate'],
  invoiceDate: ['invoice date', 'date', 'invoicedate', 'issued'],
  termsDays: ['terms', 'terms days', 'payment terms', 'termsdays', 'days'],
  paidDate: ['paid date', 'paid', 'date paid', 'paiddate', 'payment date'],
};
export const CSV_COLUMNS = Object.keys(HEAD);

// Invoice rows from a CSV whose first line names the columns.
export function invoicesFromCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new LatePaymentError('The CSV needs a header line and at least one invoice.', 'csv');
  const head = rows[0].map((h) => h.trim().toLowerCase());
  const col = {};
  for (const [k, names] of Object.entries(HEAD)) {
    const at = head.findIndex((h) => names.includes(h));
    if (at >= 0) col[k] = at;
  }
  if (col.amount === undefined) throw new LatePaymentError(`The CSV needs an "amount" column (found: ${rows[0].join(', ')}).`, 'csv');
  if (col.dueDate === undefined && col.invoiceDate === undefined) throw new LatePaymentError('The CSV needs a "due date" or an "invoice date" column.', 'csv');
  return rows.slice(1).map((r, n) => {
    const get = (k) => (col[k] === undefined ? '' : (r[col[k]] ?? '').trim());
    const inv = { amount: get('amount') };
    if (get('invoice')) inv.invoice = get('invoice').slice(0, 60);
    if (get('dueDate')) inv.dueDate = get('dueDate');
    if (get('invoiceDate') && !inv.dueDate) inv.invoiceDate = get('invoiceDate');
    if (get('termsDays')) {
      const t = Number(get('termsDays'));
      if (!Number.isInteger(t)) throw new LatePaymentError(`Row ${n + 1}: terms must be a whole number of days.`, 'csv');
      inv.termsDays = t;
    }
    if (get('paidDate')) inv.paidDate = get('paidDate');
    return inv;
  });
}

// A spreadsheet-safe cell (no formula can run when the file is opened).
const safeCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  const t = /^[=+\-@\t\r]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};
export const toCsv = (columns, rows) => `${[columns, ...rows].map((r) => r.map(safeCell).join(',')).join('\r\n')}\r\n`;
const major = (minor) => (minor / 100).toFixed(2);

export function batchCsv(b) {
  return toCsv(
    ['row', 'invoice', 'amount', 'due date', 'interest from', 'interest to', 'days', 'rate', 'interest', 'compensation', 'total claim'],
    b.rows.map((r) => [r.row, r.invoice, major(r.amount), r.dueDate, r.interestFrom ?? '', r.interestTo ?? '', r.days, r.periods.map((p) => rateText(p.rate)).join(' then '), major(r.interest), major(r.compensation), major(r.total)]),
  );
}

// ---------- the claim letter and interest invoice (words only; pdf.js draws them) ----------

const LAW_TITLE = {
  uk: 'Claim for statutory interest and compensation',
  ie: 'Claim for statutory late payment interest and compensation',
  de: 'Claim for default interest (Verzugszinsen) and the €40 lump sum',
  eu: 'Claim for late payment interest and compensation',
  'us-federal': 'Claim for Prompt Payment Act interest',
  'us-tx': 'Claim for interest on an overdue payment',
  'us-fl': 'Invoice for interest on an overdue payment',
  terms: 'Late payment charges under our terms',
};
const COMP_LABEL = {
  uk: 'Fixed sum for recovery costs (Late Payment of Commercial Debts (Interest) Act 1998)',
  ie: 'Compensation for recovery costs (S.I. No. 580 of 2012, Schedule)',
  de: 'Pauschale, § 288(5) BGB',
  eu: 'Fixed sum for recovery costs (Directive 2011/7/EU, Article 6)',
};

// The words of the claim for one result. p: { creditor, debtor, invoiceNumber, date, payBy, payTo }.
export function claimText(r, p) {
  const c = r.currency;
  const m = (x) => money(x, c);
  const no = p.invoiceNumber;
  const first = r.periods[0];
  const late = r.endKind === 'paid'
    ? `It was paid on ${longDate(r.end)}, ${r.daysLate} ${r.daysLate === 1 ? 'day' : 'days'} late.`
    : `It is still unpaid: on ${longDate(r.end)} it was ${r.daysLate} ${r.daysLate === 1 ? 'day' : 'days'} overdue.`;
  const paras = [`Invoice ${no} for ${m(r.amount)} was due for payment by ${longDate(r.dueDate)}. ${late}`];
  const span = (x) => `from ${longDate(x.from)} to ${longDate(x.to)} (${x.days} ${x.days === 1 ? 'day' : 'days'}) at ${rateText(x.rate)} a year`;
  const each = r.periods.map((x) => `${span(x)}: ${m(x.interest)}`).join('; ');
  const code = r.jurisdiction;
  let method;
  if (code === 'uk') {
    paras.push(`The Late Payment of Commercial Debts (Interest) Act 1998 gives us the right to statutory interest on this business debt at 8% a year over the Bank of England base rate on the reference date. Interest began to run on ${longDate(first.from)}, so the reference date is ${longDate(first.referenceDate)}, when Bank Rate was ${rateText(first.base)}. The rate is ${rateText(first.rate)} a year, simple interest, and stays the same until the debt is paid.`);
    paras.push(`Statutory interest ${each}. The Act also gives fixed compensation for a debt of this size: ${moneyShort(r.compensation, c)}. We claim ${m(r.total)} in all, as set out in the enclosed interest invoice.`);
    method = `${m(r.amount)} x ${rateText(first.rate)} x ${first.days} days / 365 = ${m(first.interest)}. Reference rate: Bank Rate on ${longDate(first.referenceDate)} (${rateText(first.base)}, set ${longDate(first.changedOn)}) plus 8%. Fixed sum by debt size: £40 up to £999.99, £70 from £1,000 to £9,999.99, £100 from £10,000.`;
  } else if (code === 'ie' || code === 'eu' || code === 'de') {
    const law = code === 'ie' ? 'The European Communities (Late Payment in Commercial Transactions) Regulations 2012 (S.I. No. 580 of 2012) give us the right to statutory late payment interest at the European Central Bank main refinancing rate in force on 1 January or 1 July of each half-year, plus 8 percentage points'
      : code === 'de' ? 'Under § 288(2) BGB, a payment claim in a transaction without a consumer bears default interest at 9 percentage points over the Basiszinssatz, which changes on 1 January and 1 July'
        : 'Directive 2011/7/EU, as implemented in national law, gives us the right to statutory interest for late payment at the European Central Bank main refinancing rate in force on 1 January or 1 July of each half-year, plus at least 8 percentage points';
    paras.push(`${law}. Interest runs from ${longDate(first.from)}, the day after payment was due.`);
    paras.push(`Interest ${each}. ${code === 'de' ? 'Under § 288(5) BGB we also claim the lump sum of €40.' : `We also claim the fixed sum for recovery costs of ${moneyShort(r.compensation, c)}.`} We claim ${m(r.total)} in all, as set out in the enclosed interest invoice.`);
    method = `${r.periods.map((x) => `${m(r.amount)} x ${rateText(x.rate)} x ${x.days} / 365 = ${m(x.interest)} (${code === 'de' ? `Basiszinssatz ${rateText(x.base)}` : `ECB rate ${rateText(x.base)} on ${longDate(x.referenceDate)}`} + ${code === 'de' ? 9 : 8} points)`).join('; ')}.`;
  } else if (code === 'us-federal') {
    paras.push(`Under the Prompt Payment Act and 5 CFR 1315.10, interest runs from the day after the payment due date through the payment date at the rate in effect on the day after the due date, ${rateText(first.rate)} a year, on a 360-day year, with unpaid interest added to the principal every 30 days for up to one year.`);
    paras.push(`Interest from ${longDate(first.from)} to ${longDate(first.to)} (${first.days} days): ${m(r.interest)}. We ask that this interest penalty be paid with, or promptly after, the invoice.`);
    method = `${m(r.amount)} x (1 + ${rateText(first.rate)}/12)^${first.months} x (1 + ${rateText(first.rate)}/360 x ${first.extraDays}) - ${m(r.amount)} = ${m(r.interest)} (Bureau of the Fiscal Service formula; rate for ${longDate(first.ratePeriod.from)} to ${longDate(first.ratePeriod.to)}, Federal Register ${first.federalRegister}).`;
  } else if (code === 'us-tx') {
    paras.push(`Under Texas Government Code section 2251.025, an overdue payment accrues interest from the date it becomes overdue at the rate in effect on September 1 of the fiscal year in which it became overdue: ${rateText(first.rate)} for fiscal ${first.fiscalYear}, as published by the Comptroller.`);
    paras.push(`Interest from ${longDate(first.from)} to ${longDate(first.to)} (${first.days} days): ${m(r.interest)}.`);
    method = `${first.days} days / 365 x ${rateText(first.rate)} x ${m(r.amount)} = ${m(r.interest)} (Texas Comptroller formula).`;
  } else if (code === 'us-fl') {
    paras.push(`Under section 218.74(4), Florida Statutes, a payment for goods or services not made within the time the section sets bears interest from 30 days after the due date at 1 percent per month on the unpaid balance, compounded monthly, with a part month counted as a month. The vendor must invoice the local governmental entity for the interest; this letter and the enclosed invoice do so.`);
    paras.push(`Interest from ${longDate(first.from)} for ${first.months} ${first.months === 1 ? 'month' : 'months'}: ${m(r.interest)}.`);
    method = `${m(r.amount)} x (1.01^${first.months} - 1) = ${m(r.interest)}.`;
  } else {
    paras.push(`Our agreed terms provide for late-payment interest at ${first.monthlyRate ? `${rateText(first.monthlyRate)} a month` : `${rateText(first.rate)} a year`}. Interest ${span(first).replace(/ at .*$/, '')}: ${m(r.interest)}.${r.flatFee ? ` Our terms also provide a flat late fee of ${m(r.flatFee)}.` : ''} We claim ${m(r.total)} in all.`);
    method = r.notes[0];
  }
  if (r.endKind !== 'paid' && r.daily) paras.push(`Interest continues to run at ${r.display.daily} a day until the invoice is paid.`);
  if (['uk', 'ie', 'eu'].includes(code)) paras.push('We may also claim the reasonable costs of recovering the debt if it remains unpaid.');
  const pay = r.endKind === 'paid' ? r.total : r.total + r.amount;
  paras.push(`Please pay ${m(pay)}${r.endKind === 'paid' ? '' : ` (the invoice and the claim)`}${p.payBy ? ` by ${longDate(p.payBy)}` : ''}${p.payTo ? `, to ${p.payTo}` : ''}. If you believe any part of this claim is wrong, please tell us${p.payBy ? ' by that date' : ' promptly'}.`);
  const periodLabel = (x) => (code === 'us-fl' ? `Interest at 1% a month, ${x.months} ${x.months === 1 ? 'month' : 'months'} from ${longDate(x.from)}` : `Interest ${longDate(x.from)} to ${longDate(x.to)}, ${x.days} days at ${rateText(x.rate)}`);
  const periodNote = (x) => {
    if (code === 'uk') return `8% + Bank Rate ${rateText(x.base)} on ${longDate(x.referenceDate)}; ${m(r.amount)} x ${rateText(x.rate)} x ${x.days} / 365`;
    if (code === 'ie' || code === 'eu') return `8 points + ECB rate ${rateText(x.base)} in force on ${longDate(x.referenceDate)}`;
    if (code === 'de') return `9 points + Basiszinssatz ${rateText(x.base)} from ${longDate(x.referenceDate)}`;
    if (code === 'us-federal') return `Compounded every 30 days: ${x.months} periods of 30 days and ${x.extraDays} more days, 360-day year`;
    if (code === 'us-tx') return `Fiscal ${x.fiscalYear} rate; days / 365`;
    return null;
  };
  const invoiceNotes = [
    `This invoice is for late payment of invoice ${no}${r.endKind === 'paid' ? ', which has been paid.' : ', which is still unpaid and remains due in full.'}`,
    ...(r.endKind === 'paid' ? [] : [`Interest is worked out to ${longDate(r.end)} and continues at ${r.display.daily} a day.`]),
  ];
  return {
    title: LAW_TITLE[code],
    invoiceTitle: code === 'us-fl' || code === 'us-tx' || code === 'us-federal' ? 'Interest invoice' : 'Interest and compensation invoice',
    subject: `Invoice ${no}: ${m(r.amount)} due ${longDate(r.dueDate)}`,
    claimNumber: `${no}-INT`,
    invoiceNumber: no,
    creditor: p.creditor,
    debtor: p.debtor,
    date: p.date,
    payBy: p.payBy ?? null,
    paras,
    method,
    periodLabel,
    periodNote,
    compensationLabel: COMP_LABEL[code] ?? 'Fixed sum',
    invoiceNotes,
    result: r,
  };
}
