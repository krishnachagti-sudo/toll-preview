// Ontario rent increase engine: the most the rent can rise to, the earliest date, the last day to
// serve the notice by each delivery method the Residential Tenancies Act names, the November 15,
// 2018 exemption, and the interest and top-up on a last month's rent deposit. Pure and
// dependency-free: the page loads this same file. The guideline table and the rule numbers come in
// through makeEngine() from data/ (ontario.ca and e-Laws, dated), never from here.
//
// Day counting follows the Legislation Act, 2006, s.89: the days between two events exclude the
// first and include the second, even for "at least" (89(3)); months land on the same day number or
// the month's last day (89(6)); a February 29 anniversary is February 28 outside leap years (89(7)).

export class RentError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

// ---------- dates (ISO strings, UTC arithmetic) ----------

const DAY = 86_400_000;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function isRealDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}
const ms = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const iso = (t) => new Date(t).toISOString().slice(0, 10);
export const addDays = (d, n) => iso(ms(d) + n * DAY);
export const daysBetween = (a, b) => Math.round((ms(b) - ms(a)) / DAY);
export const weekday = (d) => WEEKDAYS[new Date(ms(d)).getUTCDay()];
export const yearOf = (d) => Number(d.slice(0, 4));

// Legislation Act s.89(6) and (7): n months after a day, on the same day number or the last day.
export function addMonths(d, n) {
  const y = +d.slice(0, 4);
  const m = +d.slice(5, 7) - 1 + n;
  const ty = y + Math.floor(m / 12);
  const tm = ((m % 12) + 12) % 12;
  const last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  const day = Math.min(+d.slice(8, 10), last);
  return `${ty}-${String(tm + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export const longDate = (d) => `${MONTHS[+d.slice(5, 7) - 1]} ${+d.slice(8, 10)}, ${d.slice(0, 4)}`;
export const dayDate = (d) => `${weekday(d)}, ${longDate(d)}`;
export const monthYear = (d) => `${MONTHS[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`;
export const dmy = (d) => `${d.slice(8, 10)}/${d.slice(5, 7)}/${d.slice(0, 4)}`;
export const maxDate = (a, b) => (a > b ? a : b);

// ---------- money (whole cents) ----------

export function toCents(x) {
  const n = typeof x === 'string' ? Number(x.replace(/[$,\s]/g, '')) : x;
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}
export function money(c) {
  const sign = c < 0 ? '-' : '';
  const a = Math.abs(c);
  return `${sign}$${Math.floor(a / 100).toLocaleString('en-US')}.${String(a % 100).padStart(2, '0')}`;
}
export const pctText = (tenths) => `${(tenths / 10).toFixed(1)}%`;
const tenthsOf = (pct) => Math.round(pct * 10);

// The delivery methods the Act itself names (s.191(1)), and when each counts as given.
export const METHODS = {
  hand: { label: 'by hand', name: 'Handed to the tenant or an adult in the unit', section: '191(1)(a), (c)', addDays: 0 },
  mailbox: { label: 'in the mail box', name: 'Left in the tenant\'s mail box (or where mail is delivered)', section: '191(1)(d), (e)', addDays: 0 },
  mail: { label: 'by mail', name: 'Sent by mail', section: '191(1)(f), 191(3)', addDays: 5 },
};
export const METHOD_KEYS = Object.keys(METHODS);

export const FIRST_DATE = '2007-01-31'; // the Act came into force on January 31, 2007
export const LAST_DATE = '2040-12-31';

export function makeEngine({ guidelines, rules }) {
  const CUTOFF = rules.exemptionCutoff;
  const NOTICE = rules.noticeDays;
  const MAIL = rules.mailDays;
  const years = Object.keys(guidelines.years).map(Number).sort((a, b) => a - b);
  const FIRST_YEAR = years[0];
  const LAST_YEAR = years[years.length - 1];

  const guideline = (year) => {
    const pct = guidelines.years[String(year)];
    return pct === undefined ? null : { year, percent: pct, tenths: tenthsOf(pct), text: pctText(tenthsOf(pct)) };
  };
  const notPublished = (year) => `The ${year} guideline is not published yet. The Minister must publish it by August 31, ${year - 1} (RTA s.120(3)); ontario.ca listed up to ${LAST_YEAR} when read on ${longDate(guidelines.source.readOn)}.`;

  // Rounded down to the cent, so the new rent is never above the guideline.
  const raise = (rentCents, tenths) => {
    const inc = Math.floor((rentCents * tenths) / 1000);
    return { increaseCents: inc, newRentCents: rentCents + inc };
  };

  // The last day the notice can be given, and the day it must leave your hands, for an increase on `effective`.
  function serveBy(effective) {
    const given = addDays(effective, -NOTICE);
    return {
      effective,
      givenBy: given,
      hand: given,
      mailbox: given,
      mail: addDays(given, -MAIL),
    };
  }
  const deemedGiven = (on, method) => addDays(on, METHODS[method].addDays === 0 ? 0 : MAIL);

  function noticeCheck(servedOn, method, effective) {
    const given = deemedGiven(servedOn, method);
    const days = daysBetween(given, effective);
    return { servedOn, method, deemedGiven: given, days, enough: days >= NOTICE, earliestEffective: addDays(given, NOTICE) };
  }

  // RTA s.6.1: is the unit exempt from the guideline (and ss.121, 122, 126, 127, ...)?
  function exemption(u) {
    if (!u || !u.kind) return { exempt: null, reasons: ['No exemption answers given: the guideline is applied.'], missing: ['kind'] };
    const reasons = [];
    const missing = [];
    let exempt = null;
    let paragraph = null;
    if (u.kind === 'other') {
      return { exempt: null, reasons: ['Only the November 15, 2018 rule (RTA s.6.1) is checked here. Social housing, care-home services, long-term care and other exemptions in ss.5 to 8 are not.'], missing: [] };
    }
    if (u.kind === 'building' || u.kind === 'addition') {
      paragraph = u.kind === 'building' ? '6.1(2) para 1' : '6.1(2) para 2';
      const what = u.kind === 'building' ? 'building' : 'addition';
      if (!u.firstOccupied) missing.push('firstOccupied');
      else if (u.firstOccupied > CUTOFF) {
        exempt = true;
        reasons.push(`No part of the ${what} was occupied for residential purposes on or before November 15, 2018: it was first occupied on ${longDate(u.firstOccupied)} (${paragraph}).`);
      } else {
        exempt = false;
        reasons.push(`Part of the ${what} was occupied for residential purposes on ${longDate(u.firstOccupied)}, on or before November 15, 2018, so ${paragraph} does not apply.`);
      }
    } else if (u.kind === 'house') {
      paragraph = '6.1(3)';
      const tests = [
        ['unitsOnCutoff', u.unitsOnCutoff === undefined ? null : u.unitsOnCutoff <= 2, 'the house had at most two residential units on or before November 15, 2018 (para 1)', `the house had ${u.unitsOnCutoff} units on or before November 15, 2018, more than two (para 1)`],
        ['selfContained', u.selfContained ?? null, 'the unit has its own bathroom and kitchen, an entrance with a door that secures from inside and one that locks from outside (para 2)', 'the unit is not self-contained as para 2 describes'],
        ['becameUnit', u.becameUnit ? u.becameUnit > CUTOFF : null, `it became such a unit on ${u.becameUnit ? longDate(u.becameUnit) : ''}, after November 15, 2018 (para 3)`, `it became such a unit on ${u.becameUnit ? longDate(u.becameUnit) : ''}, not after November 15, 2018 (para 3)`],
        ['ownerOrUnfinished', u.ownerLivedThere === undefined && u.unfinishedSpace === undefined ? null : Boolean(u.ownerLivedThere || u.unfinishedSpace), u.ownerLivedThere ? 'the owner lived in another unit of the house when it was first occupied (para 4 i)' : 'it was built in space that was unfinished just before (para 4 ii)', 'neither did the owner live in the house when it was first occupied nor was it built in unfinished space (para 4)'],
      ];
      for (const [field, ok, yes, no] of tests) {
        if (ok === null) missing.push(field);
        else reasons.push(ok ? `Met: ${yes}.` : `Not met: ${no}.`);
      }
      const failed = tests.some(([, ok]) => ok === false);
      exempt = failed ? false : missing.length ? null : true;
    } else {
      throw new RentError('kind must be "building", "addition", "house" or "other".', 'unit.kind');
    }
    if (exempt === true && u.tenancyAgreed && u.tenancyAgreed <= CUTOFF) {
      exempt = false;
      reasons.push(`This tenancy's agreement was entered into on ${longDate(u.tenancyAgreed)}, on or before November 15, 2018, so the exemption does not apply to it (6.1(4)); it would apply to a later tenancy (6.1(5)).`);
    }
    if (exempt === true) reasons.push('If disputed, the landlord must prove it (6.1(6)). The 90-day notice and the 12-month rule still apply: s.6.1 does not lift ss.116 and 119.');
    if (exempt === null && missing.length) reasons.push(`Not enough answers to decide: ${missing.join(', ')}. Until then the guideline is applied.`);
    return { exempt, paragraph, reasons, missing };
  }

  const need = (cond, msg, field) => { if (!cond) throw new RentError(msg, field); };
  const inRange = (d, field) => need(d >= FIRST_DATE && d <= LAST_DATE, `${field} must be between ${longDate(FIRST_DATE)} (the Act's start) and ${longDate(LAST_DATE)}.`, field);

  // Everything for one tenancy's next increase.
  function check(input, today) {
    const method = input.method ?? 'hand';
    need(METHODS[method], `method must be one of ${METHOD_KEYS.join(', ')}.`, 'method');
    const rentCents = toCents(input.rent);
    need(rentCents !== null && rentCents > 0, 'rent must be a positive amount, such as 2000 or 1850.50.', 'rent');
    const since = input.lastIncrease ?? input.tenancyStart ?? null;
    const sinceKind = input.lastIncrease ? 'last increase' : input.tenancyStart ? 'start of the tenancy' : null;
    need(since || input.effectiveDate, 'Give lastIncrease (or tenancyStart), effectiveDate, or both.', 'lastIncrease');
    if (since) inRange(since, input.lastIncrease ? 'lastIncrease' : 'tenancyStart');
    if (input.effectiveDate) inRange(input.effectiveDate, 'effectiveDate');
    if (input.servedOn) inRange(input.servedOn, 'servedOn');

    const twelve = since ? addMonths(since, rules.monthsBetweenIncreases) : null;
    // The soonest a notice handed over (or mailed) today allows.
    const fromToday = addDays(today, NOTICE + METHODS[method].addDays);
    const fromServed = input.servedOn ? noticeCheck(input.servedOn, method, input.effectiveDate ?? addDays(deemedGiven(input.servedOn, method), NOTICE)) : null;
    const earliest = [twelve, input.servedOn ? fromServed.earliestEffective : fromToday].filter(Boolean).reduce(maxDate);
    const effective = input.effectiveDate ?? earliest;
    const notice = input.servedOn ? noticeCheck(input.servedOn, method, effective) : null;
    const dates = serveBy(effective);
    const lastDay = dates[method];
    const problems = [];
    if (twelve && effective < twelve) problems.push({ code: 'twelve-months', text: `${longDate(effective)} is less than 12 months after the ${sinceKind} on ${longDate(since)}; the earliest is ${longDate(twelve)} (RTA s.119(1)).` });
    if (since && effective <= since) problems.push({ code: 'order', text: 'The increase date must be after the last increase or the start of the tenancy.' });
    if (notice && !notice.enough) problems.push({ code: 'notice', text: `Served ${METHODS[method].label} on ${longDate(input.servedOn)}, the notice counts as given on ${longDate(notice.deemedGiven)}: ${notice.days} days before ${longDate(effective)}, short of 90. Without 90 days the increase is void and a new notice is needed (s.116(4)); the earliest date this notice allows is ${longDate(notice.earliestEffective)}.` });
    if (!notice && lastDay < today) problems.push({ code: 'serve-by-passed', text: `The last day to serve ${METHODS[method].label} for ${longDate(effective)} was ${longDate(lastDay)}, before today (${longDate(today)}). Served today it can start on ${longDate(fromToday)}.` });
    const freeze = yearOf(effective) === 2021;
    if (freeze) problems.push({ code: 'freeze', text: 'No increase could take effect in 2021, the rent freeze period, for most units including those first occupied after November 15, 2018 (RTA s.136.1(3); ontario.ca).' });

    const ex = exemption(input.unit);
    const g = guideline(yearOf(effective));
    let max = null;
    if (freeze) max = { capped: true, increaseCents: 0, newRentCents: rentCents };
    else if (ex.exempt === true) max = { capped: false, increaseCents: null, newRentCents: null };
    else if (g) max = { capped: true, ...raise(rentCents, g.tenths) };

    let proposed = null;
    if (input.proposedRent !== undefined) {
      const p = toCents(input.proposedRent);
      need(p !== null && p > 0, 'proposedRent must be a positive amount.', 'proposedRent');
      proposed = {
        rentCents: p,
        increaseCents: p - rentCents,
        percent: Math.round(((p - rentCents) / rentCents) * 10_000) / 100,
        overCents: max && max.capped ? Math.max(0, p - max.newRentCents) : 0,
        withinGuideline: max ? (max.capped ? p <= max.newRentCents : true) : null,
      };
      if (proposed.overCents > 0) problems.push({ code: 'over-guideline', text: `${money(p)} is ${money(proposed.overCents)} above the ${g ? g.text : '0%'} limit of ${money(max.newRentCents)}. More needs an N10 agreement (at most the guideline plus 3%, s.121(3)) or a Board order (s.126).` });
    }

    let deposit = null;
    if (input.deposit !== undefined) {
      const d = toCents(input.deposit);
      need(d !== null, 'deposit must be an amount, such as 2000.', 'deposit');
      const newRent = proposed && (!max || !max.capped || proposed.overCents === 0) ? proposed.rentCents : max?.newRentCents ?? null;
      deposit = { heldCents: d, newRentCents: newRent, topUpCents: newRent === null ? null : Math.max(0, newRent - d), interestRate: g ? g.text : null };
    }

    const answer = answerText({ rentCents, effective, g, max, method, lastDay, freeze, ex, dates, notice });
    return {
      answer,
      effectiveDate: effective,
      effectiveChosen: Boolean(input.effectiveDate),
      guideline: g ? { year: g.year, percent: g.percent } : null,
      guidelineNote: g ? null : notPublished(yearOf(effective)),
      rent: money(rentCents),
      rentCents,
      maxRent: max && max.newRentCents !== null ? money(max.newRentCents) : null,
      maxRentCents: max ? max.newRentCents : null,
      increase: max && max.increaseCents !== null ? money(max.increaseCents) : null,
      capped: max ? max.capped : null,
      twelveMonthDate: twelve,
      since: since ? { date: since, kind: sinceKind } : null,
      serveBy: { hand: dates.hand, mailbox: dates.mailbox, mail: dates.mail, givenBy: dates.givenBy },
      method,
      lastDayToServe: lastDay,
      lastDayIsSunday: weekday(lastDay) === 'Sunday',
      notice,
      exemption: ex,
      proposed: proposed && { ...proposed, rent: money(proposed.rentCents), over: money(proposed.overCents) },
      deposit: deposit && { ...deposit, held: money(deposit.heldCents), topUp: deposit.topUpCents === null ? null : money(deposit.topUpCents) },
      problems,
      ok: problems.length === 0,
      asOf: today,
    };
  }

  function answerText({ rentCents, effective, g, max, method, lastDay, freeze, ex, dates, notice }) {
    const when = longDate(effective);
    const form = ex.exempt === true ? 'notice' : 'N1';
    const serve = notice
      ? `the notice ${notice.enough ? 'gives' : 'gives only'} ${notice.days} days`
      : method === 'mail' ? `mail the ${form} by ${longDate(dates.mail)} (or hand it over by ${longDate(dates.hand)})` : `serve the ${form} ${METHODS[method].label} by ${longDate(lastDay)} (or mail it by ${longDate(dates.mail)})`;
    if (freeze) return `No increase could take effect on ${when}: 2021 was the rent freeze year (RTA s.136.1), so the rent stays ${money(rentCents)}.`;
    if (ex.exempt === true) return `The unit is exempt from the guideline (RTA ${ex.paragraph}), so there is no percentage limit on ${when}; the 12-month rule and 90 days' notice still apply: ${serve}.`;
    if (!g) return `The ${yearOf(effective)} guideline is not published yet, so the most your rent of ${money(rentCents)} can rise to on ${when} is not known; ${serve}.`;
    return `Your rent of ${money(rentCents)} can rise to at most ${money(max.newRentCents)} on ${when} (${g.year} guideline ${g.text}); ${serve}.`;
  }

  // Interest on a last month's rent deposit, every anniversary of the day it was paid (s.106(6), (7)).
  function depositInterest(input, today) {
    let held = toCents(input.deposit);
    need(held !== null && held > 0, 'deposit must be a positive amount.', 'deposit');
    need(input.paidOn, 'paidOn is the date the deposit was paid.', 'paidOn');
    need(input.paidOn >= FIRST_DATE, `paidOn must be on or after ${longDate(FIRST_DATE)}: earlier periods use the Act's 6% transition rate (s.106(8)), not computed here.`, 'paidOn');
    const through = input.through ?? today;
    need(through >= input.paidOn, 'through must be after paidOn.', 'through');
    const changes = [...(input.rentChanges ?? [])].map((c) => ({ from: c.from, cents: toCents(c.rent) })).sort((a, b) => (a.from < b.from ? -1 : 1));
    const baseRent = input.rent !== undefined ? toCents(input.rent) : held;
    need(baseRent !== null && baseRent > 0, 'rent must be a positive amount.', 'rent');
    const rentOn = (d) => changes.filter((c) => c.from <= d).reduce((r, c) => c.cents, baseRent);
    const apply = input.applyToTopUp !== false;
    const rows = [];
    let note = null;
    for (let k = 1; k <= 40; k++) {
      const due = addMonths(input.paidOn, 12 * k);
      if (due > through) break;
      const g = guideline(yearOf(due));
      if (!g) { note = notPublished(yearOf(due)); break; }
      const interest = Math.round((held * g.tenths) / 1000);
      const rent = rentOn(due);
      const shortfall = Math.max(0, rent - held);
      const kept = apply ? Math.min(interest, shortfall) : 0;
      rows.push({
        due, year: g.year, rate: g.text, depositBefore: money(held), interest: money(interest), rentAtDue: money(rent),
        keptForTopUp: money(kept), paidToTenant: money(interest - kept), depositAfter: money(held + kept),
        cents: { depositBefore: held, interest, kept, paid: interest - kept },
      });
      held += kept;
    }
    const sum = (k) => rows.reduce((s, r) => s + r.cents[k], 0);
    const total = sum('interest');
    const next = addMonths(input.paidOn, 12 * (rows.length + 1));
    const ng = guideline(yearOf(next));
    const answer = rows.length
      ? `On a ${money(toCents(input.deposit))} deposit paid ${longDate(input.paidOn)}, ${rows.length} yearly interest payment${rows.length === 1 ? '' : 's'} came due through ${longDate(through)}, ${money(total)} in all: ${money(sum('kept'))} kept to top the deposit up to the rent and ${money(sum('paid'))} owed to the tenant; the deposit is now ${money(held)}.`
      : `No interest has come due yet on a deposit paid ${longDate(input.paidOn)}: the first payment is due ${longDate(next)}${ng ? ` at the ${ng.year} guideline, ${ng.text}` : ''}.`;
    return { answer, rows, totals: { interest: money(total), kept: money(sum('kept')), paid: money(sum('paid')) }, depositNow: money(held), nextDue: next, nextRate: ng ? ng.text : null, note, appliedToTopUp: apply };
  }

  function table() {
    return years.map((y) => ({ year: y, percent: guidelines.years[String(y)], text: pctText(tenthsOf(guidelines.years[String(y)])), note: guidelines.notes[String(y)] ?? null }));
  }

  // The serve-by dates for an increase on the 1st of every month of a year (year pages, calendars).
  function firstOfMonths(year, rentCents) {
    const g = guideline(year);
    return Array.from({ length: 12 }, (_, i) => {
      const effective = `${year}-${String(i + 1).padStart(2, '0')}-01`;
      const s = serveBy(effective);
      return { effective, hand: s.hand, mail: s.mail, newRentCents: g && rentCents ? raise(rentCents, g.tenths).newRentCents : null };
    });
  }

  return {
    guideline, table, raise, serveBy, deemedGiven, noticeCheck, exemption, check, depositInterest, firstOfMonths,
    FIRST_YEAR, LAST_YEAR, CUTOFF, NOTICE, MAIL, rules, guidelines,
  };
}
