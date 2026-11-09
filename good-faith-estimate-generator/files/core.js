// Good Faith Estimate generator: the pure engine the page and the server share. No imports, no Node
// APIs: the browser loads this same file.
//
// It works out, from 45 CFR 149.610 and CMS's guidance (the rules come in as data, read from
// data/rules.json by tool.js, or from the tool's published rules example by the page):
//  - the date a self-pay Good Faith Estimate is due, in business days (Monday to Friday, no federal
//    holidays, by 11:59 PM; CMS GFE FAQs Part 5 Q7), from the scheduling or request date;
//  - a recurring course of care turned into dated sessions, refused past 12 months;
//  - the estimate itself: lines grouped by provider, totals per provider and overall, the
//    element-by-element check against 149.610(c)(1), the $400 dispute line per provider and, in
//    Colorado, the state's self-pay cap.
// Money is integer cents. Dates are 'YYYY-MM-DD' strings, worked out on whole days (no time zones).

export class GfeError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'GfeError';
    this.field = field;
  }
}

// ---------- dates ----------

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const monthLength = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
export const MIN_YEAR = 2022; // the rule applies from January 1, 2022 (149.610(g)(1))
export const MAX_YEAR = 2040;

function parts(iso) {
  const m = typeof iso === 'string' ? ISO_RE.exec(iso) : null;
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > monthLength(y, mo)) return null;
  return [y, mo, d];
}
export const isRealDate = (iso) => parts(iso) !== null;

// Days since 1970-01-01 (Howard Hinnant's days_from_civil).
function daysFromCivil(y, m, d) {
  const yy = m <= 2 ? y - 1 : y;
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}
function civilFromDays(n) {
  const z = n + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp + (mp < 10 ? 3 : -9);
  return [yoe + era * 400 + (m <= 2 ? 1 : 0), m, d];
}
const pad = (n, w = 2) => String(n).padStart(w, '0');
export const dayNumber = (iso) => { const p = parts(iso); if (!p) throw new TypeError(`Not a date: ${iso}`); return daysFromCivil(...p); };
export const isoOf = (n) => { const [y, m, d] = civilFromDays(n); return `${pad(y, 4)}-${pad(m)}-${pad(d)}`; };
export const addDays = (iso, n) => isoOf(dayNumber(iso) + n);
const weekdayOfDay = (n) => (((n + 4) % 7) + 7) % 7; // 0 = Sunday
export const weekdayOf = (iso) => weekdayOfDay(dayNumber(iso));
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (iso) => { const [y, m, d] = parts(iso); return `${MONTHS[m - 1]} ${d}, ${y}`; };
export const dayDate = (iso) => `${WEEKDAYS[weekdayOf(iso)]}, ${longDate(iso)}`;

// The same day n calendar months later, clamped to the month's last day (January 31 + 1 month is
// February 28 or 29).
export function addMonths(iso, n) {
  const [y, m, d] = parts(iso);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  return `${pad(ny, 4)}-${pad(nm)}-${pad(Math.min(d, monthLength(ny, nm)))}`;
}

// ---------- federal holidays (5 U.S.C. 6103, observed days as OPM lists them) ----------

function nthWeekday(y, m, weekday, n) {
  const first = daysFromCivil(y, m, 1);
  return first + ((weekday - weekdayOfDay(first) + 7) % 7) + (n - 1) * 7;
}
function lastWeekday(y, m, weekday) {
  const last = daysFromCivil(y, m, monthLength(y, m));
  return last - ((weekdayOfDay(last) - weekday + 7) % 7);
}

const holidayCache = new Map();
// [{ date, name }] for one year, in date order. A fixed date on a Saturday is observed the Friday
// before (New Year's Day on a Saturday is observed on the previous December 31), on a Sunday the
// Monday after.
export function federalHolidays(y) {
  if (!Number.isInteger(y) || y < MIN_YEAR - 1 || y > MAX_YEAR + 1) throw new RangeError(`Years ${MIN_YEAR} to ${MAX_YEAR} are covered.`);
  if (holidayCache.has(y)) return holidayCache.get(y);
  const out = [];
  const add = (n, name) => out.push({ date: isoOf(n), name });
  const fixed = (m, d, name, moveSaturday = true) => {
    const n = daysFromCivil(y, m, d);
    const w = weekdayOfDay(n);
    if (w === 6) { if (moveSaturday) add(n - 1, `${name} (observed)`); } else if (w === 0) add(n + 1, `${name} (observed)`);
    else add(n, name);
  };
  fixed(1, 1, "New Year's Day", false);
  add(nthWeekday(y, 1, 1, 3), 'Birthday of Martin Luther King, Jr.');
  add(nthWeekday(y, 2, 1, 3), "Washington's Birthday");
  add(lastWeekday(y, 5, 1), 'Memorial Day');
  fixed(6, 19, 'Juneteenth National Independence Day');
  fixed(7, 4, 'Independence Day');
  add(nthWeekday(y, 9, 1, 1), 'Labor Day');
  add(nthWeekday(y, 10, 1, 2), 'Columbus Day');
  fixed(11, 11, 'Veterans Day');
  add(nthWeekday(y, 11, 4, 4), 'Thanksgiving Day');
  fixed(12, 25, 'Christmas Day');
  if (weekdayOfDay(daysFromCivil(y + 1, 1, 1)) === 6) add(daysFromCivil(y, 12, 31), "New Year's Day (observed)");
  out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  holidayCache.set(y, out);
  return out;
}

const holidayOn = (iso) => federalHolidays(Number(iso.slice(0, 4))).find((h) => h.date === iso) ?? null;

// What a weekday is: null for a business day, or why it is not.
function closedOn(n, closed) {
  const w = weekdayOfDay(n);
  if (w === 0 || w === 6) return { weekend: true };
  const iso = isoOf(n);
  const h = holidayOn(iso);
  if (h) return { date: iso, name: h.name, kind: 'federal' };
  if (closed.has(iso)) return { date: iso, name: 'State holiday or day you listed', kind: 'listed' };
  return null;
}

const closedSet = (closedDays) => new Set(closedDays ?? []);

// Business days d with start < d <= end (the CMS example: scheduled Monday January 3 for Thursday
// January 6 is 3 business days in advance). skipped: holidays and listed days passed over.
export function businessDaysBetween(start, end, closedDays) {
  const closed = closedSet(closedDays);
  const s = dayNumber(start);
  const e = dayNumber(end);
  let days = 0;
  const skipped = [];
  for (let d = s + 1; d <= e; d++) {
    const c = closedOn(d, closed);
    if (!c) days += 1;
    else if (!c.weekend) skipped.push({ date: c.date, name: c.name });
  }
  return { days, skipped };
}

// The business day n after (n > 0) or before (n < 0) a date.
export function addBusinessDays(start, n, closedDays) {
  const closed = closedSet(closedDays);
  let d = dayNumber(start);
  const step = n > 0 ? 1 : -1;
  let left = Math.abs(n);
  const skipped = [];
  while (left > 0) {
    d += step;
    const c = closedOn(d, closed);
    if (!c) left -= 1;
    else if (!c.weekend) skipped.push({ date: c.date, name: c.name });
  }
  return { date: isoOf(d), skipped };
}

export const isBusinessDay = (iso, closedDays) => !closedOn(dayNumber(iso), closedSet(closedDays));

// ---------- money ----------

// Dollars as a number or text ("1,250.50", "$95") to whole cents, or null when not money.
export function toCents(v) {
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? Math.round(v * 100) : null;
  if (typeof v !== 'string') return null;
  const t = v.trim().replace(/^\$/, '').replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(t)) return null;
  const [whole, frac = ''] = t.split('.');
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'));
}
export const usd = (cents) => {
  const neg = cents < 0;
  const c = Math.abs(cents);
  const whole = Math.floor(c / 100).toLocaleString('en-US');
  const rest = c % 100;
  return `${neg ? '-' : ''}$${whole}${rest ? `.${pad(rest)}` : ''}`;
};
export const usd2 = (cents) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ---------- identifiers and codes (format checks only) ----------

// An NPI is 10 digits whose last is a Luhn check digit over the prefix 80840 and the first nine.
export function npiValid(npi) {
  if (!/^\d{10}$/.test(String(npi ?? ''))) return false;
  const digits = `80840${npi}`.split('').map(Number);
  let sum = 0;
  for (let i = digits.length - 1, k = 0; i >= 0; i--, k++) {
    let v = digits[i];
    if (k % 2 === 1) { v *= 2; if (v > 9) v -= 9; }
    sum += v;
  }
  return sum % 10 === 0;
}
// The check digit that makes nine digits a valid NPI (for examples and tests).
export function npiCheckDigit(nine) {
  for (let c = 0; c <= 9; c++) if (npiValid(`${nine}${c}`)) return c;
  return null;
}
export const tinValid = (tin) => /^\d{9}$/.test(String(tin ?? '').replace(/-/g, '')) && /^(\d{2}-?\d{7}|\d{3}-?\d{2}-?\d{4})$/.test(String(tin));

// What kind of service code a code looks like, or null.
export function codeKind(code) {
  const c = String(code ?? '').trim().toUpperCase();
  if (/^\d{4}[0-9FTU]$/.test(c)) return 'CPT';
  if (/^D\d{4}$/.test(c)) return 'CDT';
  if (/^[A-V]\d{4}$/.test(c)) return 'HCPCS';
  if (/^\d{3}$/.test(c)) return 'DRG';
  if (/^(\d{4}-\d{4}-\d{2}|\d{5}-\d{3}-\d{2}|\d{5}-\d{4}-\d{1,2}|\d{11})$/.test(c)) return 'NDC';
  return null;
}
export const icdValid = (code) => /^[A-TV-Z][0-9][0-9A-Z](\.?[0-9A-Z]{1,4})?$/.test(String(code ?? '').trim().toUpperCase());

// ---------- due dates ----------

// When the GFE is due. input: { scheduledOn, serviceDate } for a scheduled service, or
// { requestedOn } for a request (both can be given: the request rule then applies, and the
// scheduling rule again once it is scheduled, 149.610(b)(1)(ix)). closedDays: state holidays or other
// dates to skip as well (CMS allows states that enforce the rule to exclude state holidays).
export function dueDate(input, rules) {
  const T = rules.timing;
  const closed = input.closedDays ?? [];
  const check = (iso, field) => {
    if (!isRealDate(iso)) throw new GfeError(`${field} must be a real date written like 2026-11-16.`, field);
    const y = Number(iso.slice(0, 4));
    if (y < MIN_YEAR || y > MAX_YEAR) throw new GfeError(`${field}: dates from ${MIN_YEAR} to ${MAX_YEAR} are covered (the rule applies from January 1, 2022).`, field);
  };
  for (const d of closed) check(d, 'closedDays');
  const out = { closedDays: closed };
  if (input.requestedOn) {
    check(input.requestedOn, 'requestedOn');
    const r = addBusinessDays(input.requestedOn, T.dueAfterRequest, closed);
    out.request = {
      requestedOn: input.requestedOn,
      due: r.date,
      businessDays: T.dueAfterRequest,
      skipped: r.skipped,
      rule: '45 CFR 149.610(b)(1)(vi)(C)',
      words: `Requested on ${dayDate(input.requestedOn)}: due by ${T.deadlineTime} on ${dayDate(r.date)}, ${T.dueAfterRequest} business days after the request.`,
    };
  }
  if (input.scheduledOn || input.serviceDate) {
    if (!input.scheduledOn) throw new GfeError('Give the date the service was scheduled (scheduledOn) with the service date.', 'scheduledOn');
    if (!input.serviceDate) throw new GfeError('Give the date of the service (serviceDate) with the scheduling date.', 'serviceDate');
    check(input.scheduledOn, 'scheduledOn');
    check(input.serviceDate, 'serviceDate');
    if (input.serviceDate < input.scheduledOn) throw new GfeError('The service date is before the day it was scheduled.', 'serviceDate');
    const ahead = businessDaysBetween(input.scheduledOn, input.serviceDate, closed);
    const s = { scheduledOn: input.scheduledOn, serviceDate: input.serviceDate, businessDaysAhead: ahead.days, skippedAhead: ahead.skipped };
    if (ahead.days < T.minBusinessDays) {
      Object.assign(s, {
        band: 'under-3', required: false, due: null, rule: 'CMS GFE FAQs Part 2 Q5; Part 5 Q5',
        words: `Scheduled ${ahead.days} business ${ahead.days === 1 ? 'day' : 'days'} ahead: no GFE is required on scheduling (fewer than ${T.minBusinessDays} business days). One given anyway is voluntary and not eligible for dispute resolution (CMS FAQs Part 5 Q5).`,
      });
    } else {
      const long = ahead.days >= T.tenDayBand;
      const n = long ? T.dueAfterScheduling.long : T.dueAfterScheduling.short;
      const r = addBusinessDays(input.scheduledOn, n, closed);
      Object.assign(s, {
        band: long ? '10-plus' : '3-to-9',
        required: true,
        due: r.date,
        businessDays: n,
        skipped: r.skipped,
        rule: long ? '45 CFR 149.610(b)(1)(vi)(B)' : '45 CFR 149.610(b)(1)(vi)(A)',
        words: `Scheduled ${ahead.days} business days ahead (${long ? '10 or more' : '3 to 9'}): due by ${T.deadlineTime} on ${dayDate(r.date)}, ${n} business ${n === 1 ? 'day' : 'days'} after scheduling.`,
      });
      // A new GFE for a change of scope is due no later than 1 business day before the service.
      s.reissueBy = addBusinessDays(input.serviceDate, -T.reissueBeforeService, closed).date;
    }
    out.scheduled = s;
  }
  if (!out.request && !out.scheduled) throw new GfeError('Give scheduledOn and serviceDate, or requestedOn.', 'scheduledOn');
  out.due = out.scheduled?.due && out.request?.due ? (out.scheduled.due < out.request.due ? out.scheduled.due : out.request.due) : (out.scheduled?.due ?? out.request?.due ?? null);
  out.answer = [out.request?.words, out.scheduled?.words].filter(Boolean).join(' ');
  return out;
}

// ---------- recurring courses of care ----------

export const CADENCES = {
  'twice-weekly': { words: 'twice a week', perYear: 104 },
  weekly: { words: 'once a week', perYear: 52 },
  'every-2-weeks': { words: 'every 2 weeks', perYear: 26 },
  'every-4-weeks': { words: 'every 4 weeks', perYear: 13 },
  monthly: { words: 'once a month', perYear: 12 },
};

// Dated sessions for a recurring course: from firstDate at the cadence, `count` of them or every one
// through `through`, kept within 12 months of the GFE date (the stricter reading: the model notice
// says the costs are valid for 12 months from the date of the GFE, and 149.610(b)(1)(x)(B) caps the
// scope at 12 months). Twice a week adds a second session `secondDayOffset` days (default 3) after
// each weekly one. Sessions are dates on the calendar; the rule does not move them off holidays.
export function sessions({ firstDate, cadence, count, through, secondDayOffset = 3 }, gfeDate, rules) {
  if (!CADENCES[cadence]) throw new GfeError(`cadence must be one of ${Object.keys(CADENCES).join(', ')}.`, 'recurring.cadence');
  if (!isRealDate(firstDate)) throw new GfeError('recurring.firstDate must be a real date.', 'recurring.firstDate');
  if (firstDate < gfeDate) throw new GfeError('The first session is before the date of the Good Faith Estimate.', 'recurring.firstDate');
  const months = rules.recurring.maxMonths;
  const scopeEnd = addDays(addMonths(gfeDate, months), -1);
  if (count === undefined && !through) throw new GfeError('Give the number of sessions (count) or the last date (through).', 'recurring.count');
  if (through !== undefined) {
    if (!isRealDate(through)) throw new GfeError('recurring.through must be a real date.', 'recurring.through');
    if (through < firstDate) throw new GfeError('recurring.through is before the first session.', 'recurring.through');
    if (through > scopeEnd) throw new GfeError(`A recurring estimate may cover at most ${months} months: the last session can be no later than ${longDate(scopeEnd)} for a GFE dated ${longDate(gfeDate)}. Issue a new GFE for later sessions (45 CFR 149.610(b)(1)(x)(B)).`, 'recurring.through');
  }
  if (count !== undefined && !(Number.isInteger(count) && count >= 1)) throw new GfeError('recurring.count must be a whole number of sessions, at least 1.', 'recurring.count');
  const dates = [];
  const limit = through ?? scopeEnd;
  for (let k = 0; dates.length < (count ?? Infinity); k++) {
    let d;
    if (cadence === 'monthly') d = addMonths(firstDate, k);
    else if (cadence === 'twice-weekly') d = addDays(firstDate, Math.floor(k / 2) * 7 + (k % 2 ? secondDayOffset : 0));
    else d = addDays(firstDate, k * { weekly: 7, 'every-2-weeks': 14, 'every-4-weeks': 28 }[cadence]);
    if (d > limit) {
      if (count !== undefined && through === undefined) {
        throw new GfeError(`${count} sessions ${CADENCES[cadence].words} from ${longDate(firstDate)} run past ${longDate(scopeEnd)}, 12 months from the GFE date. At most ${dates.length} fit; issue a new GFE for the rest (45 CFR 149.610(b)(1)(x)(B)).`, 'recurring.count');
      }
      break;
    }
    dates.push(d);
    if (dates.length > 400) break;
  }
  if (!dates.length) throw new GfeError('No session falls in the period given.', 'recurring.through');
  return { cadence, words: CADENCES[cadence].words, count: dates.length, first: dates[0], last: dates.at(-1), dates, scopeEnd };
}

// ---------- the estimate ----------

const text = (v) => (typeof v === 'string' ? v.trim() : '');
const nameOf = (p) => [text(p.firstName), text(p.middleName), text(p.lastName)].filter(Boolean).join(' ');

// The whole estimate, worked out and checked. Throws GfeError for input it cannot work with (bad
// dates, a scope past 12 months); everything a GFE would lack is reported in `check` instead, so
// the caller decides whether to refuse (a clean PDF) or show it (a check or a preview).
export function makeEstimate(input, rules) {
  const gfeDate = input.gfeDate;
  if (!isRealDate(gfeDate)) throw new GfeError('gfeDate (the date of the Good Faith Estimate) must be a real date.', 'gfeDate');
  if (gfeDate.slice(0, 4) < String(MIN_YEAR) || Number(gfeDate.slice(0, 4)) > MAX_YEAR) throw new GfeError(`gfeDate: ${MIN_YEAR} to ${MAX_YEAR} are covered.`, 'gfeDate');
  const patient = input.patient ?? {};
  const primary = input.primary ?? {};
  const providers = input.providers ?? [];
  if (!providers.length) throw new GfeError('List at least one provider or facility (the convening one first).', 'providers');
  const noCost = input.noCost === true;
  if (noCost && providers.length > 1) throw new GfeError('The abbreviated no-cost GFE is for one provider or facility with no co-providers (CMS GFE FAQs Part 4 Q2).', 'providers');

  const recurring = input.recurring ? sessions(input.recurring, gfeDate, rules) : null;
  const dates = recurring ? recurring.dates : (primary.dates ?? []);
  for (const d of dates) if (!isRealDate(d)) throw new GfeError('Each primary service date must be a real date.', 'primary.dates');
  if (!recurring && dates.some((d) => d < gfeDate)) throw new GfeError('A scheduled service date is before the date of the Good Faith Estimate.', 'primary.dates');
  if (!recurring && dates.length > 1 && dates.at(-1) > addDays(addMonths(gfeDate, rules.recurring.maxMonths), -1)) {
    throw new GfeError(`The service dates run past 12 months from the GFE date (${longDate(addDays(addMonths(gfeDate, rules.recurring.maxMonths), -1))}).`, 'primary.dates');
  }

  // Lines and totals. A line marked perSession repeats once for every recurring session.
  const provs = providers.map((p, pi) => {
    const lines = (p.items ?? []).map((it, li) => {
      const unit = toCents(it.charge);
      if (unit === null) throw new GfeError(`Provider ${pi + 1}, item ${li + 1}: the expected charge must be dollars, such as 150 or "150.00".`, `providers.${pi}.items.${li}.charge`);
      const perSession = it.perSession === true;
      if (perSession && !recurring) throw new GfeError(`Provider ${pi + 1}, item ${li + 1} is per session, but no recurring schedule was given.`, `providers.${pi}.items.${li}.perSession`);
      const each = Number.isInteger(it.quantity) && it.quantity > 0 ? it.quantity : 1;
      const qty = perSession ? each * recurring.count : each;
      const code = text(it.serviceCode).toUpperCase();
      const dx = text(it.diagnosisCode).toUpperCase();
      return {
        description: text(it.description), serviceCode: code, codeKind: code ? codeKind(code) : null, diagnosisCode: dx,
        quantity: qty, perSession, perSessionQuantity: perSession ? each : null, unitCents: unit, totalCents: unit * qty,
        location: text(it.location),
      };
    });
    const total = lines.reduce((s, l) => s + l.totalCents, 0);
    const addr = p.address ?? {};
    return {
      role: pi === 0 ? 'convening' : 'co-provider',
      name: text(p.name), type: text(p.type), npi: text(p.npi), tin: text(p.tin),
      address: { street: text(addr.street), city: text(addr.city), state: text(addr.state).toUpperCase(), zip: text(addr.zip) },
      contact: text(p.contact), phone: text(p.phone), email: text(p.email), notes: text(p.notes),
      lines, totalCents: total, disputeAtCents: total + rules.dispute.thresholdCents,
    };
  });
  const totalCents = provs.reduce((s, p) => s + p.totalCents, 0);

  // Colorado's self-pay cap, per provider's estimate (the statute speaks of the provider's own
  // self-pay estimate): the final cost may exceed it by the lesser of 15% or $400.
  const states = {};
  for (const p of provs) {
    const st = rules.states[p.address.state];
    if (!st) continue;
    const room = Math.min(Math.round((p.totalCents * st.pct) / 100), st.capCents);
    p.stateCap = { state: p.address.state, law: st.law, roomCents: room, maxFinalCents: p.totalCents + room, binding: room === st.capCents ? 'dollars' : 'percent' };
    states[p.address.state] = st;
  }

  // The element-by-element check (149.610(c)(1)). level: ok, missing (the GFE lacks it), warn (it
  // may be fine, check it), auto (the tool adds it).
  const items = [];
  const add = (id, level, message) => items.push({ id, para: rules.elements.find((e) => e.id === id).para, level, message });
  const name = nameOf(patient);
  if (!text(patient.firstName) || !text(patient.lastName)) add('i', 'missing', 'Give the patient\'s first and last name.');
  else if (!isRealDate(patient.dob)) add('i', 'missing', 'Give the patient\'s date of birth.');
  else if (patient.dob > gfeDate) add('i', 'missing', 'The date of birth is after the date of the estimate.');
  else add('i', 'ok', 'Patient name and date of birth given.');

  if (!text(primary.description)) add('ii', 'missing', 'Describe the primary item or service in plain words.');
  else if (!dates.length && primary.notScheduled !== true) add('ii', 'missing', 'Give the scheduled date or dates, or mark the service as not yet scheduled.');
  else add('ii', 'ok', dates.length ? `Primary service described, ${dates.length === 1 ? `scheduled for ${longDate(dates[0])}` : `${dates.length} dates from ${longDate(dates[0])} to ${longDate(dates.at(-1))}`}.` : 'Primary service described; not yet scheduled.');

  if (noCost) {
    add('iii', 'ok', 'No-cost estimate: the abbreviated form lists no items (CMS GFE FAQs Part 4 Q2).');
    add('iv', 'ok', 'No-cost estimate: no codes or charges are listed (CMS GFE FAQs Part 4 Q2).');
  } else {
    const empty = provs.filter((p) => !p.lines.length);
    if (empty.length) add('iii', 'missing', `List at least one item for ${empty.map((p) => p.name || 'each provider').join(', ')}.`);
    else if (provs.some((p) => p.lines.some((l) => !l.description))) add('iii', 'missing', 'Describe every item or service.');
    else add('iii', 'ok', `${provs.reduce((s, p) => s + p.lines.length, 0)} items, grouped by ${provs.length} ${provs.length === 1 ? 'provider' : 'providers or facilities'}.`);
    const lines = provs.flatMap((p) => p.lines);
    const noCode = lines.filter((l) => !l.serviceCode).length;
    const oddCode = lines.filter((l) => l.serviceCode && !l.codeKind).map((l) => l.serviceCode);
    const oddDx = lines.filter((l) => l.diagnosisCode && !icdValid(l.diagnosisCode)).map((l) => l.diagnosisCode);
    if (noCode) add('iv', 'missing', `${noCode} ${noCode === 1 ? 'item has' : 'items have'} no service code. Service codes and charges are needed even when there is no diagnosis code (CMS GFE FAQs Part 2 Q1).`);
    else if (oddCode.length || oddDx.length) add('iv', 'warn', `Check the format of ${[...oddCode, ...oddDx].join(', ')}: not a CPT, HCPCS, CDT, DRG or NDC service code${oddDx.length ? ', or an ICD-10 diagnosis code' : ''} as written.`);
    else if (!lines.some((l) => l.diagnosisCode) && !primary.diagnoses?.length) add('iv', 'warn', 'No diagnosis code: fine where none is required for the estimate, such as a first evaluation (CMS GFE FAQs Part 2 Q1).');
    else add('iv', 'ok', 'Service codes and expected charges on every item.');
  }

  const vProblems = [];
  provs.forEach((p, i) => {
    const who = p.name || `provider ${i + 1}`;
    if (!p.name) vProblems.push(`provider ${i + 1} has no name`);
    if (!p.npi) vProblems.push(`${who}: no NPI`);
    else if (!npiValid(p.npi)) vProblems.push(`${who}: NPI ${p.npi} fails the NPI check digit`);
    if (!p.tin) vProblems.push(`${who}: no TIN`);
    else if (!tinValid(p.tin)) vProblems.push(`${who}: TIN must be 9 digits (EIN 12-3456789 or SSN)`);
    if (!p.address.state || !/^[A-Z]{2}$/.test(p.address.state)) vProblems.push(`${who}: no state`);
    if (!p.address.street || !p.address.city) vProblems.push(`${who}: no office or facility address`);
  });
  if (vProblems.length) add('v', 'missing', `${vProblems.join('; ')}.`);
  else add('v', 'ok', `Name, NPI (check digit valid), TIN and location for ${provs.length === 1 ? 'the provider' : `all ${provs.length}`}.`);
  if (!vProblems.length && provs.some((p) => !p.email && !p.phone)) {
    items.at(-1).message += ' CMS strongly encourages a phone and email for someone who can act in a billing dispute (FAQs Part 4 Q4).';
  }

  const separate = (input.separate ?? []).map((s) => ({ description: text(s.description), provider: text(s.provider), howToGet: text(s.howToGet) }));
  if (separate.some((s) => !s.description || !s.howToGet)) add('vi', 'missing', 'Each separately scheduled item needs a description and instructions for getting its own estimate.');
  else add('vi', separate.length ? 'auto' : 'ok', separate.length ? `${separate.length} separately scheduled ${separate.length === 1 ? 'item' : 'items'}, with the required disclaimer printed directly above the list.` : 'No separately scheduled items listed.');
  for (const id of ['viii', 'ix', 'x', 'xi']) add(id, 'auto', `Added in the CMS model notice's words (${rules.elements.find((e) => e.id === id).label.replace(/^Disclaimer: /, '')}).`);

  const missing = items.filter((x) => x.level === 'missing');

  // Timing, when the scheduling or request date was given.
  let timing = null;
  if (input.scheduledOn || input.requestedOn) {
    const sched = input.scheduledOn && dates.length ? { scheduledOn: input.scheduledOn, serviceDate: dates[0] } : {};
    timing = dueDate({ ...sched, requestedOn: input.requestedOn, closedDays: input.closedDays }, rules);
    timing.onTime = timing.due ? gfeDate <= timing.due : null;
  }

  const answer = noCost
    ? `A no-cost Good Faith Estimate for ${name || 'the patient'} from ${provs[0].name || 'the provider'}, dated ${longDate(gfeDate)}: the provider will not bill for ${dates.length ? `items or services on ${dates.map(longDate).join(', ')}` : 'the items or services'}.`
    : `A Good Faith Estimate for ${name || 'the patient'} dated ${longDate(gfeDate)}${recurring ? `: ${recurring.count} sessions ${recurring.words} from ${longDate(recurring.first)} to ${longDate(recurring.last)}` : ''}, totals ${usd2(totalCents)}${provs.length > 1 ? ` across ${provs.length} providers or facilities` : ''}.${timing?.due ? ` It is due by ${rules.timing.deadlineTime} on ${longDate(timing.due)}.` : ''}`;

  return {
    gfeDate,
    noCost,
    patient: { name, dob: patient.dob ?? null },
    primary: { description: text(primary.description), dates, notScheduled: primary.notScheduled === true && !dates.length, diagnoses: primary.diagnoses ?? [] },
    recurring,
    providers: provs,
    separate,
    totalCents,
    total: usd2(totalCents),
    timing,
    check: { complete: !missing.length, missing: missing.length, items },
    states: Object.keys(states),
    answer,
  };
}
