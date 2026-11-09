// The late-fee engine: the most a landlord may charge as a rent late fee in a state, from which day,
// whether a proposed fee is within the statute, and the words of a late notice. Pure and
// dependency-free: the page loads this same file in the browser, and tool.js runs it on the
// server. Every rule comes from the statute rows in data/rules.json (passed in to makeEngine), each
// quoted word for word with its source and the date read. A state with no row is refused, never
// guessed. Money is whole cents; dates are YYYY-MM-DD in UTC.

export class LateFeeError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'LateFeeError';
    this.field = field;
  }
}

// ---------- dates ----------

const DAY = 86_400_000;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ms = (iso) => Date.parse(`${iso}T00:00:00Z`);
const iso = (t) => new Date(t).toISOString().slice(0, 10);

export function isRealDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = ms(s);
  return Number.isFinite(t) && iso(t) === s;
}
export const addDays = (d, n) => iso(ms(d) + n * DAY);
export const daysBetween = (a, b) => Math.round((ms(b) - ms(a)) / DAY);
export const weekday = (d) => WEEKDAYS[new Date(ms(d)).getUTCDay()];
export function longDate(d) {
  const [y, m, day] = d.split('-').map(Number);
  return `${MONTHS[m - 1]} ${day}, ${y}`;
}
export const dayDate = (d) => `${weekday(d)}, ${longDate(d)}`;

// The same day next month, or the month's last day when it has none (January 31 to February 28).
export function addMonth(d) {
  const [y, m, day] = d.split('-').map(Number);
  const ny = m === 12 ? y + 1 : y;
  const nm = m === 12 ? 1 : m + 1;
  const last = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  return `${ny}-${String(nm).padStart(2, '0')}-${String(Math.min(day, last)).padStart(2, '0')}`;
}

// The federal legal public holidays of 5 U.S.C. § 6103(a) in a year, by date, plus (to be safe for
// a landlord counting business days) the Friday before one that falls on a Saturday and the Monday
// after one that falls on a Sunday.
export function federalHolidays(year) {
  const nth = (month, dow, n) => {
    const first = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
    return iso(Date.UTC(year, month - 1, 1 + ((dow - first + 7) % 7) + 7 * (n - 1)));
  };
  const last = (month, dow) => {
    const end = new Date(Date.UTC(year, month, 0));
    return iso(Date.UTC(year, month - 1, end.getUTCDate() - ((end.getUTCDay() - dow + 7) % 7)));
  };
  const fixed = (m, d) => `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  const days = [
    [fixed(1, 1), "New Year's Day"],
    [nth(1, 1, 3), 'Birthday of Martin Luther King, Jr.'],
    [nth(2, 1, 3), "Washington's Birthday"],
    [last(5, 1), 'Memorial Day'],
    [fixed(6, 19), 'Juneteenth National Independence Day'],
    [fixed(7, 4), 'Independence Day'],
    [nth(9, 1, 1), 'Labor Day'],
    [nth(10, 1, 2), 'Columbus Day'],
    [fixed(11, 11), 'Veterans Day'],
    [nth(11, 4, 4), 'Thanksgiving Day'],
    [fixed(12, 25), 'Christmas Day'],
  ];
  const out = new Map();
  for (const [d, name] of days) {
    out.set(d, name);
    const w = new Date(ms(d)).getUTCDay();
    if (w === 6) out.set(addDays(d, -1), `${name} (observed)`);
    if (w === 0) out.set(addDays(d, 1), `${name} (observed)`);
  }
  return out;
}

const holidayName = (d) => federalHolidays(Number(d.slice(0, 4))).get(d) ?? null;
const isBusinessDay = (d) => { const w = new Date(ms(d)).getUTCDay(); return w !== 0 && w !== 6 && !holidayName(d); };

// ---------- money ----------

// Dollars as given (a number, or text such as "1,500.00") to whole cents.
export function toCents(v, field = 'amount') {
  if (typeof v === 'number') {
    if (!Number.isFinite(v) || v < 0) throw new LateFeeError(`${field} must be zero or more dollars.`, field);
    return Math.round(v * 100);
  }
  const s = String(v ?? '').trim().replace(/^\$/, '').replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new LateFeeError(`${field} must be dollars, such as 1500 or "1,500.00".`, field);
  return Math.round(Number(s) * 100);
}
export const usd = (cents) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
// A percentage of an amount, rounded down to the cent so the figure is never above the limit.
const pctOf = (cents, pct) => Math.floor((cents * pct) / 100);

// ---------- the engine ----------

const FAIL = ['not-in-lease', 'too-early', 'over'];
const VERDICT_WORDS = {
  within: 'Within the limit',
  over: 'Over the limit',
  'too-early': 'Too early for a late fee',
  'not-in-lease': 'Not allowed without the lease term',
  'max-only': 'Maximum worked out',
  'no-number': 'No number in the statute',
};
export { VERDICT_WORDS };
export const KINDS = {
  cap: 'Cap set by statute',
  'grace-only': 'Waiting period only, no amount',
  reasonable: '"Reasonable" fee, no number',
  general: 'General contract rule, no number',
};

export function makeEngine(RULES) {
  const covered = RULES.order;

  function rowFor(input) {
    const code = String(input.state ?? '').toUpperCase();
    if (input.city) {
      const city = RULES.cities[String(input.city).toLowerCase()];
      if (!city) throw new LateFeeError(`No city rule has been read for "${input.city}". Covered city: Chicago.`, 'city');
      if (code !== city.state) throw new LateFeeError(`${city.name} is in ${city.state}; give state "${city.state}".`, 'state');
      return city;
    }
    const row = RULES.states[code];
    if (row) return row;
    const nc = RULES.notCovered[code];
    if (nc) throw new LateFeeError(`${nc.name} is not covered. ${nc.reason} Covered: ${covered.map((c) => RULES.states[c].name).join(', ')}, and the city of Chicago.`, 'state');
    throw new LateFeeError('state must be a US state code such as "TX", or "DC".', 'state');
  }

  // One formula ({ type, ... } from the row) worked out on the amounts in ctx.
  function evaluate(f, ctx) {
    const base = (of) => (of === 'pastDue' ? ctx.pastDue : ctx.rent);
    const baseWords = (of) => (of === 'pastDue' ? 'the past-due rent' : 'the rent');
    switch (f.type) {
      case 'pct': {
        const v = pctOf(base(f.of), f.pct);
        return { cents: v, math: `${f.pct}% of ${usd(base(f.of))} (${baseWords(f.of)}) = ${usd(v)}` };
      }
      case 'flat':
        return { cents: f.flat, math: `${usd(f.flat)}` };
      case 'min':
      case 'max': {
        const parts = f.parts.map((p) => {
          if (p.pct !== undefined) { const v = pctOf(base(p.of), p.pct); return { cents: v, math: `${p.pct}% of ${usd(base(p.of))} = ${usd(v)}` }; }
          if (p.perDay && ctx.daysCounted !== null) {
            const v = Math.min(p.flat, p.perDay * ctx.daysCounted);
            return { cents: v, math: `${usd(p.perDay)} a day x ${ctx.daysCounted} ${ctx.daysCounted === 1 ? 'day' : 'days'}, at most ${usd(p.flat)} = ${usd(v)}` };
          }
          return { cents: p.flat, math: usd(p.flat) };
        });
        const pick = f.type === 'min' ? Math.min(...parts.map((p) => p.cents)) : Math.max(...parts.map((p) => p.cents));
        return { cents: pick, math: `the ${f.type === 'min' ? 'lesser' : 'greater'} of ${parts.map((p) => p.math).join(' and ')}: ${usd(pick)}` };
      }
      case 'units': {
        if (!Number.isInteger(ctx.units)) throw new LateFeeError('Texas sets the limit by building size: give units, the number of dwelling units in the building.', 'units');
        const pct = ctx.units <= f.upTo ? f.low : f.high;
        const v = pctOf(base(f.of), pct);
        return { cents: v, math: `${pct}% of ${usd(base(f.of))} (building of ${ctx.units} ${ctx.units === 1 ? 'unit' : 'units'}, ${ctx.units <= f.upTo ? `${f.upTo} or fewer` : `more than ${f.upTo}`}) = ${usd(v)}` };
      }
      case 'iowa': {
        const tier = ctx.rent <= f.threshold ? f.low : f.high;
        const tierWords = ctx.rent <= f.threshold ? `rent of ${usd(f.threshold)} or less` : `rent above ${usd(f.threshold)}`;
        if (ctx.daysCounted === null) return { cents: tier.max, math: `${tierWords}: at most ${usd(tier.perDay)} a day and ${usd(tier.max)} a month` };
        const v = Math.min(tier.max, tier.perDay * ctx.daysCounted);
        return { cents: v, math: `${tierWords}: ${usd(tier.perDay)} a day x ${ctx.daysCounted} ${ctx.daysCounted === 1 ? 'day' : 'days'}, at most ${usd(tier.max)} = ${usd(v)}` };
      }
      case 'chicago': {
        const above = Math.max(0, ctx.rent - f.over);
        const v = f.base + pctOf(above, f.pct);
        return { cents: v, math: `${usd(f.base)} + ${f.pct}% of ${usd(above)} (the rent above ${usd(f.over)}) = ${usd(v)}` };
      }
      case 'perPeriod': {
        const one = pctOf(base(f.of), f.pct);
        const n = ctx.periods;
        return { cents: one * n, math: `${f.pct}% of ${usd(base(f.of))} = ${usd(one)} for each ${f.every}-day period, x ${n} ${n === 1 ? 'period' : 'periods'} = ${usd(one * n)}` };
      }
      default:
        throw new Error(`late-fee-checker: unknown formula ${f.type}`);
    }
  }

  // The first day a fee may be charged for rent due on dueDate, with the words and the notes.
  function firstFeeDay(row, input) {
    const s = row.start;
    const due = input.dueDate;
    const notes = [];
    if (s.businessDays) {
      if (s.firstOfMonth && due.slice(8) !== '01') {
        notes.push(`${row.law} covers rent due on the first of the month; this rent is due on the ${Number(due.slice(8))}th, so its grace period does not apply and the statute read sets no other waiting period.`);
        return { date: addDays(due, 1), notes, count: 0 };
      }
      let d = due;
      const skipped = [];
      for (let n = 0; n < s.businessDays;) {
        d = addDays(d, 1);
        if (isBusinessDay(d)) n += 1;
        else if (holidayName(d)) skipped.push(`${longDate(d)} (${holidayName(d)})`);
      }
      notes.push(`The fifth business day after the due date is ${dayDate(d)}${skipped.length ? `, skipping ${skipped.join(', ')}` : ''}. A New Jersey State holiday in the window (not read) would move it one business day later.`);
      return { date: addDays(d, 1), notes, graceEnd: d };
    }
    let days = s.days;
    if (input.period === 'week' && s.weekDays) days = s.weekDays;
    if (s.officeDays && input.noLocalOffice) {
      days += s.officeDays;
      notes.push(`No office or permanent place in the county to receive rent: the due date is extended by ${s.officeDays} days (${row.law}).`);
    }
    let date = addDays(due, days);
    if (s.sunday) {
      const lastGrace = addDays(due, days - 1);
      if (weekday(lastGrace) === 'Sunday') {
        notes.push(`The grace period's last day, ${longDate(lastGrace)}, is a Sunday, so rent paid on ${dayDate(date)} carries no late fee.`);
        date = addDays(date, 1);
      }
      notes.push('A legal holiday on the grace period\'s last day also moves the fee a business day; the holidays of Tenn. Code § 15-1-101 were not read, so check the calendar.');
    }
    if (s.accrueFromDay1) notes.push(`Once that day is reached, ${row.name}'s statute lets the fee run from ${longDate(addDays(due, 1))}, the first day after the due date.`);
    return { date, notes };
  }

  // The end of the rental period that starts on the due date (Oregon's "through that rental period only").
  const periodEnd = (due, period) => (period === 'week' ? addDays(due, 6) : addDays(addMonth(due), -1));

  function check(input) {
    const row = rowFor(input);
    const period = input.period ?? 'month';
    if (period === 'week' && row.weekly === 'refuse') throw new LateFeeError(`${row.name} weekly rent is not worked out: ${row.weeklyWhy}`, 'period');
    if (!isRealDate(input.dueDate)) throw new LateFeeError('dueDate must be a real date written like 2026-11-01.', 'dueDate');
    if (input.paidDate !== undefined && !isRealDate(input.paidDate)) throw new LateFeeError('paidDate must be a real date written like 2026-11-08.', 'paidDate');
    if (input.paidDate && input.paidDate < input.dueDate) throw new LateFeeError('paidDate is before dueDate: rent paid before it is due is not late.', 'paidDate');
    const rentFull = toCents(input.rent, 'rent');
    if (rentFull <= 0) throw new LateFeeError('rent must be more than $0.', 'rent');
    const notes = [...row.notes];

    // Subsidized rent: where the statute says so, the fee is worked out on the tenant's share.
    let rent = rentFull;
    let share = null;
    if (input.tenantShare !== undefined) {
      share = toCents(input.tenantShare, 'tenantShare');
      if (share > rentFull) throw new LateFeeError('tenantShare is more than the rent.', 'tenantShare');
      if (row.subsidy) rent = share;
      else notes.push(`The ${row.law} text read says nothing about subsidized rent, so the figure uses the full rent.`);
    }
    const pastDue = input.pastDue === undefined ? rent : toCents(input.pastDue, 'pastDue');
    if (pastDue <= 0) throw new LateFeeError('pastDue must be more than $0: with nothing unpaid there is no late fee.', 'pastDue');
    if (pastDue > rent) throw new LateFeeError(`pastDue (${usd(pastDue)}) is more than the rent${row.subsidy && share !== null ? ' the tenant pays' : ''} (${usd(rent)}).`, 'pastDue');

    // Chicago: owner-occupied buildings of six or fewer units are outside the ordinance.
    if (row.exempt && input.ownerOccupied && Number.isInteger(input.units) && input.units <= row.exempt.ownerOccupiedUpTo) {
      throw new LateFeeError(`${row.name}: ${row.exempt.words}, so the ordinance's late-fee figure does not apply to this unit (and Illinois state law was not read).`, 'ownerOccupied');
    }

    const first = firstFeeDay(row, { ...input, period });
    notes.push(...first.notes);
    const paid = input.paidDate ?? null;
    const reasons = [];
    const quote = (k) => (k ? row.quotes[k] : null);

    // When: is it late enough?
    let tooEarly = false;
    if (paid && paid < first.date) {
      tooEarly = true;
      reasons.push({ level: 'fail', rule: 'when', message: `Paid on ${dayDate(paid)}: no late fee may be charged before ${dayDate(first.date)} (${row.start.words}).`, cite: row.law, quote: quote(row.start.quote) });
    } else {
      reasons.push({ level: 'ok', rule: 'when', message: `A late fee may be charged from ${dayDate(first.date)} for rent due ${dayDate(input.dueDate)} (${row.start.words}).`, cite: row.law, quote: quote(row.start.quote) });
    }

    // The lease or written-notice condition.
    let notInLease = false;
    if (row.lease) {
      if (input.inLease === false) {
        notInLease = true;
        reasons.push({ level: 'fail', rule: 'lease', message: `No late fee unless ${row.lease.words}.`, cite: row.law, quote: quote(row.lease.quote) });
      } else {
        reasons.push({ level: input.inLease ? 'ok' : 'check', rule: 'lease', message: `${input.inLease ? 'Your lease has the term: ' : 'Check your lease: '}${row.lease.words}.`, cite: row.law, quote: quote(row.lease.quote) });
      }
    }

    // How much.
    let max = null;
    let math = null;
    let maxWords = null;
    if (row.cap) {
      const formula = period === 'week' && row.weekly === 'own' ? row.weeklyCap : row.cap;
      maxWords = formula.words;
      let daysCounted = null;
      let periods = null;
      const asOf = paid && !tooEarly ? paid : null;
      if (formula.type === 'iowa' && asOf) daysCounted = daysBetween(input.dueDate, asOf);
      if (formula.type === 'min' && formula.parts.some((p) => p.perDay) && asOf) daysCounted = daysBetween(first.date, asOf) + 1;
      if (formula.type === 'perPeriod') {
        const end = periodEnd(input.dueDate, period);
        const upTo = asOf && asOf < end ? asOf : end;
        periods = Math.max(1, Math.ceil((daysBetween(first.date, upTo) + 1) / formula.every));
        if (!asOf) notes.push(`With no payment date given, the figure is the most the five-day-period method reaches by the end of the rental period on ${longDate(end)}; it starts at ${usd(pctOf(rent, formula.pct))} on ${longDate(first.date)}.`);
        else if (asOf > end) notes.push(`The five-day periods stop at the end of the rental period on ${longDate(end)}.`);
      }
      const r = evaluate(formula, { rent, pastDue, units: input.units, daysCounted, periods });
      max = r.cents;
      math = r.math;
      if (formula.type === 'iowa' && daysCounted === null) notes.push('With no payment date given, the figure is the monthly total; the daily limit applies too.');
      if (formula.type === 'min' && formula.parts.some((p) => p.perDay) && daysCounted === null) notes.push(`With no payment date given, the figure is the most the fee can reach; it builds at ${usd(formula.parts.find((p) => p.perDay).perDay)} a day after the grace period.`);
    }

    const fee = input.fee === undefined ? null : toCents(input.fee, 'fee');
    let over = false;
    if (max !== null) {
      if (fee !== null && fee > max) {
        over = true;
        reasons.push({ level: 'fail', rule: 'amount', message: `${usd(fee)} is ${usd(fee - max)} over the limit of ${usd(max)} (${math}).${row.safeHarbor ? ' Texas also treats a larger fee as reasonable if it is not more than the landlord\'s uncertain damages from the late payment; the tool cannot judge that.' : ''}`, cite: row.law, quote: quote(row.capQuote) });
      } else {
        reasons.push({ level: fee === null ? 'info' : 'ok', rule: 'amount', message: fee === null ? `The most you can charge: ${usd(max)} (${math}).` : `${usd(fee)} is within the limit of ${usd(max)} (${math}).`, cite: row.law, quote: quote(row.capQuote) });
      }
    } else {
      reasons.push({ level: 'check', rule: 'amount', message: row.kind === 'reasonable' ? 'The statute asks for a reasonable fee set out in the written lease and gives no number; whether yours is reasonable is for a court.' : row.kind === 'general' ? 'No late-fee statute with a number was read; the general rule on agreed damages applies, which a court applies case by case.' : 'The statute read sets when a fee may start, not how much it may be.', cite: row.law, quote: quote(row.kind === 'general' ? 'rule' : row.kind === 'reasonable' ? 'reasonable' : row.start.quote) });
    }

    for (const k of ['combined', 'once', 'subsidy', 'noEviction', 'writtenNotice']) {
      if (row[k]) reasons.push({ level: 'info', rule: k, message: `${row[k].words.charAt(0).toUpperCase()}${row[k].words.slice(1)}.`, cite: row.law, quote: quote(row[k].quote) });
    }
    if (row.penalty) reasons.push({ level: 'info', rule: 'penalty', message: `If a fee breaks the rule: ${row.penalty.words} (${row.penalty.cite}).`, cite: row.penalty.cite, quote: quote(row.penalty.quote) });

    const verdict = notInLease ? 'not-in-lease' : tooEarly ? 'too-early' : over ? 'over' : max === null ? 'no-number' : fee === null ? 'max-only' : 'within';
    const where = row.code === 'IL-CHICAGO' ? 'Chicago' : row.code === 'DC' ? 'the District of Columbia' : row.name;
    const rentWords = `${usd(rent)} ${period === 'week' ? 'weekly' : 'monthly'} rent${share !== null && row.subsidy ? ' (the tenant\'s share)' : ''}`;
    let answer;
    if (max !== null) {
      answer = `For ${rentWords} in ${where}${row.cap.type === 'units' && Number.isInteger(input.units) ? ` (a building of ${input.units} ${input.units === 1 ? 'unit' : 'units'})` : ''}, the most a landlord may charge as a late fee is ${usd(max)}${paid && !tooEarly ? ` as of ${longDate(paid)}` : ''}, and only from ${dayDate(first.date)} for rent due ${longDate(input.dueDate)} (${row.law}).`;
    } else {
      answer = `The ${row.code === 'DC' ? 'District of Columbia' : row.name} statute read sets no dollar or percent limit on a rent late fee (${row.law}); for rent due ${longDate(input.dueDate)} a fee may be charged from ${dayDate(first.date)}.`;
    }
    if (verdict === 'within') answer += ` Your ${usd(fee)} is within the limit.`;
    if (verdict === 'over') answer += ` Your ${usd(fee)} is ${usd(fee - max)} over it.`;
    if (verdict === 'too-early') answer += ` Rent paid on ${longDate(paid)} is not late enough for a fee.`;
    if (verdict === 'not-in-lease') answer += ` Without ${row.lease.words.replace(/^the /, 'that ')}, no late fee may be charged.`;

    return {
      state: row.code === 'IL-CHICAGO' ? 'IL' : row.code,
      city: row.code === 'IL-CHICAGO' ? 'chicago' : null,
      name: row.name,
      law: row.law,
      kind: row.kind,
      verdict,
      verdictWords: VERDICT_WORDS[verdict],
      answer,
      dueDate: input.dueDate,
      firstFeeDate: first.date,
      firstFeeWords: row.start.words,
      paidDate: paid,
      rent,
      pastDue,
      maxFee: max === null ? null : { cents: max, display: usd(max), words: maxWords, math },
      fee: fee === null ? null : { cents: fee, display: usd(fee) },
      over: over ? { cents: fee - max, display: usd(fee - max) } : null,
      reasons,
      notes,
      quality: row.quality,
      sources: row.sources,
    };
  }

  // A late notice: the check, then the words of the notice. The fee defaults to the maximum where
  // the statute sets one; with no number in the statute, the landlord gives it.
  function notice(input) {
    const noticeDate = input.noticeDate;
    if (!isRealDate(noticeDate)) throw new LateFeeError('noticeDate must be a real date written like 2026-11-08.', 'noticeDate');
    const c0 = check({ ...input, paidDate: input.paidDate ?? noticeDate, fee: undefined });
    const fee = input.fee === undefined ? c0.maxFee?.cents ?? null : toCents(input.fee, 'fee');
    if (fee === null) throw new LateFeeError(`${c0.name}'s statute sets no number, so give the fee from your lease.`, 'fee');
    const c = check({ ...input, paidDate: input.paidDate ?? noticeDate, fee: fee / 100 });
    const issues = c.reasons.filter((r) => r.level === 'fail');
    if (input.payBy !== undefined && !isRealDate(input.payBy)) throw new LateFeeError('payBy must be a real date written like 2026-11-15.', 'payBy');
    if (input.payBy && input.payBy < noticeDate) throw new LateFeeError('payBy is before the notice date.', 'payBy');
    const total = c.pastDue + (issues.length ? 0 : fee);
    const paras = [
      `The rent for ${input.property} that was due on ${longDate(c.dueDate)} has not been paid in full. As of ${longDate(noticeDate)}, ${usd(c.pastDue)} of rent remains unpaid.`,
      issues.length
        ? `No late fee is included. The check against ${c.law} found: ${issues.map((x) => x.message).join(' ')}`
        : `Under the late-fee term of your lease, a late fee of ${usd(fee)} now applies. It is ${c.maxFee ? `within the limit of ${c.law} (${c.maxFee.words}; ${c.maxFee.display} on this rent)` : `charged as your lease provides; ${c.law} sets no number`}, and is charged no earlier than ${longDate(c.firstFeeDate)}.`,
      `Total now due: ${usd(total)} (rent ${usd(c.pastDue)}${issues.length ? '' : ` plus late fee ${usd(fee)}`}).${input.payBy ? ` Please pay by ${longDate(input.payBy)}.` : ' Please pay as soon as possible.'}${input.payTo ? ` Payment: ${input.payTo}.` : ''}`,
      'This is a reminder of rent and a late fee owed. It is not a notice to end your tenancy.',
      'If you have already paid, or you believe this amount is wrong, please contact me in writing.',
    ];
    if (row(c).noEviction) paras.push(`Under ${c.law}, an unpaid late fee alone is not a reason to end a tenancy for nonpayment of rent.`);
    const charged = issues.length ? 0 : fee;
    return { check: c, fee: charged, feeAsked: fee, total, totalDisplay: usd(total), feeDisplay: usd(charged), date: noticeDate, issues, paras, title: 'Notice of late rent and late fee' };
  }
  const row = (c) => (c.city ? RULES.cities[c.city] : RULES.states[c.state]);

  return {
    order: covered,
    rule: (code) => rowFor({ state: code }),
    city: (name) => RULES.cities[name],
    rowFor,
    covered: () => covered.map((c) => ({ code: c, name: RULES.states[c].name, law: RULES.states[c].law, kind: RULES.states[c].kind, cap: RULES.states[c].cap?.words ?? null, start: RULES.states[c].start.words, quality: RULES.states[c].quality })),
    notCovered: () => Object.entries(RULES.notCovered).map(([code, x]) => ({ code, ...x })),
    check,
    notice,
    federalHolidays,
  };
}
