// The FMLA eligibility checker's engine: the three eligibility tests of 29 CFR 825.110 (12 months
// of employment counted in weeks with the seven-year break rule, 1,250 hours of service in the 12
// months before leave starts, 50 employees within 75 surface miles of the worksite, where a
// teleworker's worksite is the office they report to under 825.111(a)(2) and FAB 2023-1), the
// employer coverage test (825.104, 825.105(e)), the five-business-day eligibility notice
// (825.300(b)), the hours in 12 or 26 workweeks for the employee's schedule (825.205(b)), and the
// leave balance under each of the four 12-month methods of 825.200(b), with the days leave comes
// back under the rolling method. Pure and dependency-free: the page loads this same file, so the
// free answer on the page and the paid record always agree. Hours are whole hundredths of an hour
// throughout, never floats. Business days come from the caller (the federal holiday calendar of
// the business days tool), so this file stays free of imports.

export class FmlaError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'FmlaError';
    this.field = field;
  }
}

export const RULE = {
  weeks: 52, hours: 1250, employees: 50, miles: 75, breakYears: 7, coverageEmployees: 50, coverageWeeks: 20,
  entitlementWeeks: 12, caregiverWeeks: 26, noticeDays: 5,
};
export const LIMITS = { periods: 20, sites: 200, entries: 1000, hoursLog: 400 };
export const METHODS = ['rolling', 'calendar', 'fixed', 'forward'];
export const METHOD_NAMES = {
  rolling: 'Rolling 12 months measured backward',
  calendar: 'Calendar year',
  fixed: 'Fixed 12-month leave year',
  forward: '12 months measured forward from the first leave',
};
const METHOD_SHORT = { rolling: 'rolling 12-month', calendar: 'calendar-year', fixed: 'fixed leave-year', forward: 'measured-forward' };
export const EMPLOYER_TYPES = ['private', 'public-agency', 'school'];
export const WORK_LOCATIONS = ['site', 'home', 'no-fixed-site'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ---------- dates ----------

export const MIN_YEAR = 1990;
export const MAX_YEAR = 2100;
export function isRealDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d && y >= MIN_YEAR && y <= MAX_YEAR;
}
// Days since 1970-01-01 (a Thursday).
export const dayIndex = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86_400_000;
export const isoOf = (idx) => new Date(idx * 86_400_000).toISOString().slice(0, 10);
export const addDays = (iso, n) => isoOf(dayIndex(iso) + n);
export const weekdayOf = (iso) => (((dayIndex(iso) + 4) % 7) + 7) % 7;
export const longDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;
export const dayDate = (iso) => `${WEEKDAYS[weekdayOf(iso)].slice(0, 3)}, ${MONTHS[+iso.slice(5, 7) - 1].slice(0, 3)} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;
const lastDay = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
// The same day k months later (or earlier), on the month's last day when it has no such day: one
// year after February 29 is February 28.
export function addMonths(iso, k) {
  const y = +iso.slice(0, 4);
  const m = +iso.slice(5, 7) - 1 + k;
  const ny = y + Math.floor(m / 12);
  const nm = ((m % 12) + 12) % 12 + 1;
  const d = Math.min(+iso.slice(8, 10), lastDay(ny, nm));
  return `${String(ny).padStart(4, '0')}-${String(nm).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}
// The Sunday-to-Saturday week a day is in, as a number (week 0 began Sunday 1969-12-28).
const weekOf = (idx) => Math.floor((idx + 4) / 7);
const weekSunday = (w) => w * 7 - 4;
// Whole calendar months from a to b (a <= b): 2025-11-10 to 2026-11-09 is 11.
export function monthsBetween(a, b) {
  let m = (+b.slice(0, 4) - +a.slice(0, 4)) * 12 + (+b.slice(5, 7) - +a.slice(5, 7));
  if (addMonths(a, m) > b) m -= 1;
  return m;
}

function date(v, field, label = field) {
  if (!isRealDate(v)) throw new FmlaError(`${label} must be a real date from ${MIN_YEAR} to ${MAX_YEAR}, written like 2026-11-10.`, field);
  return v;
}

// ---------- hours ----------

// Hours as whole hundredths: 37.5 -> 3750, "1,312.25" -> 131225. At most two decimals.
export function hundredths(v, field = 'hours', { max = 1_000_000 } = {}) {
  const s = typeof v === 'number' ? String(v) : String(v ?? '').trim().replace(/,/g, '');
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!m || (typeof v === 'number' && !Number.isFinite(v))) throw new FmlaError(`"${String(v ?? '').slice(0, 20)}" is not a number of hours (at most two decimals, like 37.5).`, field);
  const n = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'));
  if (n > max * 100) throw new FmlaError(`${field} is over ${max.toLocaleString('en-US')} hours.`, field);
  return n;
}
// 48000 -> "480", 3750 -> "37.5", 131225 -> "1,312.25".
export function hoursText(h) {
  const neg = h < 0;
  const a = Math.abs(h);
  const whole = Math.floor(a / 100).toLocaleString('en-US');
  const frac = a % 100;
  const out = frac ? `${whole}.${String(frac).padStart(2, '0').replace(/0$/, '')}` : whole;
  return neg ? `-${out}` : out;
}
// Weeks with up to two decimals from hundredths of hours and the weekly hours: 16000 / 4000 -> "4".
export function weeksText(h, weekly) {
  const w = Math.round((h * 100) / weekly) / 100;
  return String(w);
}
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

// ---------- 12 months of employment (825.110(b)) ----------

// periods: [{ start, end?, breakBefore? }] in any order; end missing means still employed. A break
// of seven years or more drops the service before it, unless the break was USERRA service (which
// also counts as employment), a written rehire agreement covers it, or the employer counts older
// service for everyone (countOldService). Service is counted in Sunday-to-Saturday weeks: any part
// of a week on the payroll counts as a week, and 52 weeks equal 12 months (825.110(b)(3)).
export function serviceTest({ periods, leaveStart, countOldService = false }) {
  if (!Array.isArray(periods) || !periods.length) throw new FmlaError('Give the employment dates: the hire date, or each period worked.', 'periods');
  if (periods.length > LIMITS.periods) throw new FmlaError(`At most ${LIMITS.periods} employment periods.`, 'periods');
  const L = dayIndex(leaveStart);
  const list = periods.map((p, i) => {
    const s = date(p.start, `periods.${i}.start`, 'Each period\'s start');
    const e = p.end == null || p.end === '' ? null : date(p.end, `periods.${i}.end`, 'Each period\'s end');
    if (e && e < s) throw new FmlaError(`The period starting ${longDate(s)} ends before it starts.`, `periods.${i}.end`);
    if (p.breakBefore != null && !['userra', 'agreement'].includes(p.breakBefore)) throw new FmlaError('breakBefore is "userra" or "agreement".', `periods.${i}.breakBefore`);
    return { start: s, end: e, breakBefore: p.breakBefore ?? null, i };
  }).sort((a, b) => (a.start < b.start ? -1 : 1));
  for (let k = 0; k < list.length; k++) {
    if (list[k].end === null && k < list.length - 1) throw new FmlaError(`The period starting ${longDate(list[k].start)} has no end, but a later period follows it.`, `periods.${list[k].i}.end`);
    if (k && list[k].start <= list[k - 1].end) throw new FmlaError(`The periods starting ${longDate(list[k - 1].start)} and ${longDate(list[k].start)} overlap.`, `periods.${list[k].i}.start`);
  }
  if (dayIndex(list[0].start) >= L) throw new FmlaError('The leave starts before the employee was hired: there is no service to count.', 'leaveStart');
  const counted = [];
  const breaks = [];
  let dropped = null;
  for (let k = 0; k < list.length; k++) {
    const p = list[k];
    if (dayIndex(p.start) >= L) break; // a later rehire after the leave starts does not count
    if (k) {
      const prev = list[k - 1];
      const gapFrom = addDays(prev.end, 1);
      const gapTo = addDays(p.start, -1);
      const long = p.start >= addMonths(gapFrom, 12 * RULE.breakYears);
      const why = p.breakBefore === 'userra' ? 'userra' : p.breakBefore === 'agreement' ? 'agreement' : countOldService ? 'employer' : null;
      breaks.push({ from: gapFrom, to: gapTo, days: dayIndex(p.start) - dayIndex(gapFrom), sevenYearsOrMore: long, kept: !long || !!why, because: long ? why : null, userra: p.breakBefore === 'userra' });
      if (long && !why) { counted.length = 0; dropped = { before: p.start, from: gapFrom, to: gapTo }; }
      if (p.breakBefore === 'userra' && gapFrom <= gapTo) counted.push({ start: gapFrom, end: gapTo, userra: true });
    }
    counted.push({ start: p.start, end: p.end === null || dayIndex(p.end) >= L ? addDays(leaveStart, -1) : p.end, open: p.end === null || dayIndex(p.end) >= L });
  }
  const weeks = new Map(); // week -> first counted day in it
  for (const c of counted) {
    for (let d = dayIndex(c.start); d <= dayIndex(c.end); d = weekSunday(weekOf(d)) + 7) {
      const w = weekOf(d);
      if (!weeks.has(w) || weeks.get(w) > d) weeks.set(w, d);
    }
  }
  const sorted = [...weeks.keys()].sort((a, b) => a - b);
  const n = sorted.length;
  const last = list.at(-1);
  const stillEmployed = last.end === null || dayIndex(last.end) >= L - 1;
  let metOn = null;
  if (n >= RULE.weeks) metOn = isoOf(weeks.get(sorted[RULE.weeks - 1]) + 1);
  else if (stillEmployed) metOn = isoOf(weekSunday(sorted[n - 1] + (RULE.weeks - n)) + 1);
  // One continuous job with no breaks: the 12-month anniversary too, for comparison.
  // One continuous job with no counted break is measured in calendar months: the test is met on
  // the 12-month anniversary of the first day. Separate periods are added up in weeks.
  const single = counted.length === 1;
  const anniversary = single ? addMonths(counted[0].start, 12) : null;
  const months = single ? monthsBetween(counted[0].start, leaveStart) : null;
  const pass = single ? leaveStart >= anniversary : n >= RULE.weeks;
  return {
    pass,
    measure: single ? 'months' : 'weeks',
    months,
    weeks: n,
    short: single ? null : Math.max(0, RULE.weeks - n),
    firstCountedDay: counted[0]?.start ?? null,
    metOn: single ? anniversary : metOn,
    anniversary,
    breaks,
    dropped,
    periods: counted,
  };
}

// ---------- 1,250 hours (825.110(c)) ----------

// The 12 months immediately before the leave starts: from the same date a year earlier to the day
// before.
export const hoursWindow = (leaveStart) => ({ from: addMonths(leaveStart, -12), to: addDays(leaveStart, -1) });

export function hoursTest({ leaveStart, hours, hoursLog, userraHours, recordsKept = true, flightCrew = false }) {
  const win = hoursWindow(leaveStart);
  if (flightCrew) {
    return { pass: null, flightCrew: true, window: win, note: 'Airline flight crew have their own hours rule (29 CFR 825.801: 60 percent of the applicable monthly guarantee and 504 hours). This tool does not work it out.' };
  }
  let worked;
  let fromLog = null;
  if (hoursLog !== undefined && hoursLog !== null) {
    if (hours !== undefined && hours !== null) throw new FmlaError('Give the hours worked, or an hours log, not both.', 'hours');
    if (!Array.isArray(hoursLog) || !hoursLog.length) throw new FmlaError('The hours log needs at least one line of { date, hours }.', 'hoursLog');
    if (hoursLog.length > LIMITS.hoursLog) throw new FmlaError(`At most ${LIMITS.hoursLog} lines in the hours log; add up weeks or pay periods first.`, 'hoursLog');
    worked = 0;
    let inside = 0;
    let outside = 0;
    hoursLog.forEach((x, i) => {
      const d = date(x?.date, `hoursLog.${i}.date`, 'Each hours log line\'s date');
      const h = hundredths(x.hours, `hoursLog.${i}.hours`, { max: 744 });
      if (d >= win.from && d <= win.to) { worked += h; inside += 1; } else outside += 1;
    });
    fromLog = { lines: hoursLog.length, inside, outside };
  } else {
    if (hours === undefined || hours === null || hours === '') throw new FmlaError('Give the hours worked in the 12 months before the leave starts.', 'hours');
    worked = hundredths(hours, 'hours', { max: 8784 });
  }
  const credit = userraHours == null || userraHours === '' ? 0 : hundredths(userraHours, 'userraHours', { max: 8784 });
  const total = worked + credit;
  const meets = total >= RULE.hours * 100;
  return {
    pass: meets ? true : recordsKept ? false : null,
    worked,
    userraCredit: credit,
    total,
    short: meets ? 0 : RULE.hours * 100 - total,
    window: win,
    fromLog,
    recordsKept,
    note: !meets && !recordsKept ? 'Without an accurate record of hours worked the employer has the burden of showing the employee did not work 1,250 hours (29 CFR 825.110(c)(3)); an estimate below 1,250 is not enough to deny leave.' : null,
  };
}

// ---------- 50 employees within 75 miles (825.111) ----------

// Either a count the user has made, or the sites with their surface miles from the employee's
// worksite. A teleworker's worksite is the site they report to or get assignments from (their home
// is never a worksite), so the sites are measured from that office.
export function worksiteTest({ employeesWithin75, sites, reportsTo, workLocation = 'site' }) {
  if (!WORK_LOCATIONS.includes(workLocation)) throw new FmlaError(`workLocation is one of ${WORK_LOCATIONS.join(', ')}.`, 'workLocation');
  const home = workLocation === 'home';
  const roaming = workLocation === 'no-fixed-site';
  if (employeesWithin75 !== undefined && employeesWithin75 !== null) {
    if (sites !== undefined && sites !== null) throw new FmlaError('Give the count within 75 miles, or the list of sites, not both.', 'sites');
    if (!Number.isInteger(employeesWithin75) || employeesWithin75 < 0 || employeesWithin75 > 10_000_000) throw new FmlaError('The count of employees within 75 miles is a whole number.', 'employeesWithin75');
    return { pass: employeesWithin75 >= RULE.employees, count: employeesWithin75, worksite: reportsTo ?? null, home, roaming, sites: null, short: Math.max(0, RULE.employees - employeesWithin75) };
  }
  if (!Array.isArray(sites) || !sites.length) throw new FmlaError('Give the number of employees within 75 miles of the worksite, or list the sites.', 'employeesWithin75');
  if (sites.length > LIMITS.sites) throw new FmlaError(`At most ${LIMITS.sites} sites.`, 'sites');
  const names = new Set();
  const list = sites.map((s, i) => {
    const name = String(s?.name ?? '').trim();
    if (!name) throw new FmlaError('Every site needs a name.', `sites.${i}.name`);
    const key = name.toLowerCase();
    if (names.has(key)) throw new FmlaError(`Two sites are called "${name}".`, `sites.${i}.name`);
    names.add(key);
    if (!Number.isInteger(s.employees) || s.employees < 0 || s.employees > 10_000_000) throw new FmlaError(`${name}: employees is a whole number.`, `sites.${i}.employees`);
    return { name, employees: s.employees, miles: s.miles ?? null, outsideUS: !!s.outsideUS, i };
  });
  const target = String(reportsTo ?? '').trim().toLowerCase();
  const at = target ? list.find((s) => s.name.toLowerCase() === target) : list.length === 1 ? list[0] : null;
  if (!at) throw new FmlaError(target ? `"${reportsTo}" is not one of the sites listed.` : 'Name the site the employee reports to or gets assignments from (reportsTo).', 'reportsTo');
  let count = 0;
  const rows = list.map((s) => {
    let miles = s === at ? 0 : s.miles;
    if (s !== at && (typeof miles !== 'number' || !Number.isFinite(miles) || miles < 0 || miles > 100_000)) throw new FmlaError(`${s.name}: give its surface miles from ${at.name}.`, `sites.${s.i}.miles`);
    const within = !s.outsideUS && miles <= RULE.miles;
    if (within) count += s.employees;
    return { name: s.name, employees: s.employees, miles, outsideUS: s.outsideUS, counted: within, worksite: s === at };
  });
  return { pass: count >= RULE.employees, count, worksite: at.name, home, roaming, sites: rows, short: Math.max(0, RULE.employees - count) };
}

// ---------- employer coverage (825.104, 825.105(e)) ----------

export function coverageTest({ type = 'private', workweeksWith50 } = {}) {
  if (!EMPLOYER_TYPES.includes(type)) throw new FmlaError(`The employer type is one of ${EMPLOYER_TYPES.join(', ')}.`, 'employer.type');
  if (type !== 'private') return { pass: true, type, assumed: false, why: type === 'school' ? 'Public and private elementary and secondary schools are covered whatever their size.' : 'Public agencies are covered whatever their size.' };
  if (workweeksWith50 === undefined || workweeksWith50 === null) return { pass: true, type, assumed: true, why: 'Coverage assumed: give the number of workweeks with 50 or more employees to check it.' };
  if (!Number.isInteger(workweeksWith50) || workweeksWith50 < 0 || workweeksWith50 > 53) throw new FmlaError('Workweeks with 50 or more employees is a whole number from 0 to 53.', 'employer.workweeksWith50');
  const pass = workweeksWith50 >= RULE.coverageWeeks;
  return { pass, type, assumed: false, workweeksWith50, why: pass ? `${workweeksWith50} workweeks with 50 or more employees in the current or preceding calendar year: covered.` : `${plural(workweeksWith50, 'workweek')} with 50 or more employees: fewer than 20, so the employer is not covered by the FMLA.` };
}

// ---------- the eligibility notice (825.300(b)) ----------

// Five business days after the request (or after the employer learned the leave may qualify).
// businessDays(start, n, closedDays) -> { date, holidaysSkipped } comes from the caller; without it
// only weekends are skipped, and the answer says so.
export function noticeDue(noticeDate, { businessDays, closedDays = [] } = {}) {
  date(noticeDate, 'noticeDate', 'The notice date');
  if (!Array.isArray(closedDays) || closedDays.length > 60) throw new FmlaError('closedDays is a list of at most 60 dates.', 'closedDays');
  closedDays.forEach((d, i) => date(d, `closedDays.${i}`, 'Each closed day'));
  if (businessDays) {
    const r = businessDays(noticeDate, RULE.noticeDays, closedDays);
    return { from: noticeDate, due: r.date, holidaysSkipped: r.holidaysSkipped ?? [], closedSkipped: r.daysOffSkipped ?? [], holidaysChecked: true };
  }
  const closed = new Set(closedDays);
  let d = noticeDate;
  let left = RULE.noticeDays;
  const skipped = [];
  while (left > 0) {
    d = addDays(d, 1);
    const wd = weekdayOf(d);
    if (wd === 0 || wd === 6) continue;
    if (closed.has(d)) { skipped.push({ date: d, name: 'Closed' }); continue; }
    left -= 1;
  }
  return { from: noticeDate, due: d, holidaysSkipped: [], closedSkipped: skipped, holidaysChecked: false };
}

// ---------- the whole check ----------

// input: { leaveStart, noticeDate?, hireDate? | periods?, countOldService?, hours? | hoursLog?,
//   userraHours?, recordsKept?, flightCrew?, employeesWithin75? | sites?, reportsTo?, workLocation?,
//   employer?: { type, workweeksWith50 }, closedDays? }
export function check(input, opts = {}) {
  const leaveStart = date(input.leaveStart, 'leaveStart', 'The leave start date');
  const noticeDate = input.noticeDate == null || input.noticeDate === '' ? leaveStart : date(input.noticeDate, 'noticeDate', 'The notice date');
  if (noticeDate > leaveStart && dayIndex(noticeDate) - dayIndex(leaveStart) > 366) throw new FmlaError('The notice date is more than a year after the leave start.', 'noticeDate');
  if ((input.hireDate != null) === (input.periods != null)) throw new FmlaError('Give the hire date, or the list of employment periods, one of the two.', 'hireDate');
  const periods = input.periods ?? [{ start: date(input.hireDate, 'hireDate', 'The hire date') }];
  const coverage = coverageTest(input.employer);
  const service = serviceTest({ periods, leaveStart, countOldService: !!input.countOldService });
  const hours = hoursTest({ leaveStart, hours: input.hours, hoursLog: input.hoursLog, userraHours: input.userraHours, recordsKept: input.recordsKept ?? true, flightCrew: !!input.flightCrew });
  const site = worksiteTest({ employeesWithin75: input.employeesWithin75, sites: input.sites, reportsTo: input.reportsTo, workLocation: input.workLocation });
  const notice = noticeDue(noticeDate, { businessDays: opts.businessDays, closedDays: input.closedDays ?? [] });
  const passes = [coverage.pass, service.pass, hours.pass, site.pass];
  const eligible = passes.includes(false) ? false : passes.includes(null) ? null : true;
  const where = site.worksite ? ` of ${site.worksite}` : ' of the worksite';
  const reasons = [];
  if (!coverage.pass) reasons.push(`The employer is not covered by the FMLA: it had 50 or more employees in ${plural(coverage.workweeksWith50, 'workweek')} of the current or preceding calendar year, fewer than 20.`);
  if (!service.pass) reasons.push(`You have been employed by the employer for ${serviceText(service)} as of ${longDate(leaveStart)}, less than 12 months${service.measure === 'weeks' ? ' (52 weeks)' : ''}.`);
  if (hours.pass === false) reasons.push(`You have worked ${hoursText(hours.total)} hours of service with the employer in the 12 months before ${longDate(leaveStart)} (${longDate(hours.window.from)} to ${longDate(hours.window.to)}), fewer than 1,250.`);
  if (!site.pass) reasons.push(`You are employed at a worksite where the employer has ${plural(site.count, 'employee')} within 75 miles${where}, fewer than 50.`);
  const verdict = eligible === true ? 'is eligible for FMLA leave' : eligible === false ? 'is not eligible for FMLA leave' : 'cannot be found ineligible on these facts';
  const hoursPart = hours.flightCrew ? 'the airline flight crew hours rule (not worked out here)' : `${hoursText(hours.total)} hours in the 12 months before ${longDate(leaveStart)}`;
  const answer = `With ${serviceText(service)} of service, ${hoursPart}, and ${plural(site.count, 'employee')} within 75 surface miles${where}, this employee ${verdict}${eligible === false ? ` (${[!coverage.pass && 'employer not covered', !service.pass && 'under 12 months', hours.pass === false && 'under 1,250 hours', !site.pass && 'under 50 within 75 miles'].filter(Boolean).join(', ')})` : ''}; the eligibility notice is due by ${longDate(notice.due)}.`;
  return {
    op: 'check',
    eligible,
    answer,
    leaveStart,
    noticeDate,
    tests: { coverage, service, hours, worksite: site },
    reasons,
    notice: {
      ...notice,
      text: `Notify the employee whether they are eligible within five business days of ${longDate(noticeDate)}: by ${longDate(notice.due)}, absent extenuating circumstances (29 CFR 825.300(b)(1)). DOL form WH-381 may be used.`,
    },
    notes: notesFor({ coverage, service, hours, site }),
  };
}

export const serviceText = (s) => (s.measure === 'months' ? plural(s.months, 'month') : plural(s.weeks, 'week'));

function notesFor({ coverage, service, hours, site }) {
  const n = [];
  if (coverage.assumed) n.push(coverage.why);
  if (service.dropped) n.push(`Service before ${longDate(service.dropped.before)} is not counted: it ends before a break of seven years or more (${longDate(service.dropped.from)} to ${longDate(service.dropped.to)}), and no exception was given (29 CFR 825.110(b)(1)).`);
  for (const b of service.breaks) if (b.sevenYearsOrMore && b.kept) n.push(`The break from ${longDate(b.from)} to ${longDate(b.to)} is seven years or more, but earlier service still counts: ${b.because === 'userra' ? 'it was USERRA-covered service, which itself counts as employment' : b.because === 'agreement' ? 'a written agreement covers the rehire' : 'the employer counts such service for everyone'} (29 CFR 825.110(b)(2) and (4)).`);
  if (service.breaks.some((b) => b.userra && !b.sevenYearsOrMore)) n.push('USERRA-covered service between periods counts as employment (29 CFR 825.110(b)(2)(i)).');
  if (service.measure === 'weeks') n.push(`Separate periods of employment are added up in weeks: any part of a week on the payroll counts as a week, and 52 weeks equal 12 months (29 CFR 825.110(b)(3)). Counted: ${plural(service.weeks, 'week')}.`);
  if (!service.pass && service.metOn) n.push(`If still employed, the 12-month test is met for leave starting on or after ${longDate(service.metOn)}.`);
  if (hours.fromLog?.outside) n.push(`${plural(hours.fromLog.outside, 'line')} of the hours log fall outside ${longDate(hours.window.from)} to ${longDate(hours.window.to)} and are not counted.`);
  if (hours.userraCredit) n.push(`${hoursText(hours.userraCredit)} hours are credited for USERRA-covered service (29 CFR 825.110(c)(2)).`);
  if (hours.note) n.push(hours.note);
  if (site.home) n.push(`A home is not a worksite: a teleworker's worksite is the office they report to or get assignments from${site.worksite ? `, here ${site.worksite}` : ''}, and that office's count includes teleworkers assigned to it (29 CFR 825.111(a)(2); DOL Field Assistance Bulletin 2023-1).`);
  if (site.roaming) n.push(`With no fixed worksite, the worksite is the home base the employee is assigned to, works from or reports to${site.worksite ? `, here ${site.worksite}` : ''} (29 CFR 825.111(a)(2)).`);
  if (site.sites?.some((s) => s.outsideUS)) n.push('Employees outside the United States, its territories and possessions are not counted (29 CFR 825.105(b)).');
  return n;
}

// ---------- hours in 12 or 26 workweeks (825.205(b)) ----------

export function entitlement({ weeklyHours, weeks = RULE.entitlementWeeks }) {
  const w = hundredths(weeklyHours, 'weeklyHours', { max: 168 });
  if (!w) throw new FmlaError('The weekly hours must be more than 0.', 'weeklyHours');
  if (![RULE.entitlementWeeks, RULE.caregiverWeeks].includes(weeks)) throw new FmlaError('weeks is 12, or 26 for military caregiver leave.', 'weeks');
  const total = w * weeks;
  return {
    op: 'hours',
    weeklyHours: w,
    weeks,
    hours: total,
    answer: `${weeks} workweeks at ${hoursText(w)} hours a week is ${hoursText(total)} hours of FMLA leave (${weeks} x ${hoursText(w)}).`,
  };
}

// ---------- the leave balance (825.200) ----------

// Where a fixed leave year starting MM-DD begins, for the year containing day iso.
function fixedYearStart(iso, mmdd) {
  const y = +iso.slice(0, 4);
  const here = `${y}-${mmdd}`;
  return here <= iso ? here : `${y - 1}-${mmdd}`;
}
// The day hours used on d come back under the rolling method: the same date a year later.
export const restoreDate = (d) => addMonths(d, 12);

// The leave already counted against an employee on day D, under a method, from the entries
// protected so far. Entries are [{ date, hours }] with protected hours only. Returns
// { used, from } where from is the first day of the 12-month period D is in.
function usedOn(method, D, entries, st) {
  if (method === 'rolling') {
    let used = 0;
    for (const e of entries) if (e.date < D && D < restoreDate(e.date)) used += e.protected;
    return { used, from: addDays(addMonths(D, -12), 1) };
  }
  if (method === 'calendar') {
    const from = `${D.slice(0, 4)}-01-01`;
    let used = 0;
    for (const e of entries) if (e.date >= from && e.date < D) used += e.protected;
    return { used, from, until: `${+D.slice(0, 4) + 1}-01-01` };
  }
  if (method === 'fixed') {
    const from = fixedYearStart(D, st.leaveYearStart);
    let used = 0;
    for (const e of entries) if (e.date >= from && e.date < D) used += e.protected;
    return { used, from, until: addMonths(from, 12) };
  }
  // forward: the period begins with the first leave and lasts 12 months; the next begins with the
  // first leave after it ends.
  if (!st.periodStart || D >= addMonths(st.periodStart, 12)) return { used: 0, from: null, until: null };
  let used = 0;
  for (const e of entries) if (e.date >= st.periodStart && e.date < D) used += e.protected;
  return { used, from: st.periodStart, until: addMonths(st.periodStart, 12) };
}

function readEntries(list, field, kind) {
  if (list === undefined || list === null) return [];
  if (!Array.isArray(list)) throw new FmlaError(`${field} is a list of { date, hours }.`, field);
  return list.map((x, i) => {
    const d = date(x?.date, `${field}.${i}.date`, `Each ${kind} day`);
    const h = hundredths(x.hours, `${field}.${i}.hours`, { max: 24 });
    if (!h) throw new FmlaError(`${longDate(d)}: hours must be more than 0.`, `${field}.${i}.hours`);
    return { date: d, hours: h, kind };
  });
}

// input: { method, leaveYearStart? (MM-DD, fixed only), weeklyHours, weeks? (12 or 26), used?,
//   requested?, asOf }. weeks 26 is military caregiver leave: always the single 12-month period
//   measured forward (825.200(f)).
export function balance(input) {
  const asOf = date(input.asOf, 'asOf', 'The as-of date');
  const weeks = input.weeks ?? RULE.entitlementWeeks;
  const ent = entitlement({ weeklyHours: input.weeklyHours, weeks });
  const caregiver = weeks === RULE.caregiverWeeks;
  const method = caregiver ? 'forward' : input.method;
  if (!METHODS.includes(method)) throw new FmlaError(`method is one of ${METHODS.join(', ')}.`, 'method');
  let leaveYearStart = null;
  if (method === 'fixed') {
    const m = /^(\d{2})-(\d{2})$/.exec(String(input.leaveYearStart ?? ''));
    if (!m || +m[1] < 1 || +m[1] > 12 || +m[2] < 1 || +m[2] > lastDay(2025, +m[1])) throw new FmlaError('A fixed leave year needs its first day as MM-DD, like 07-01 (not 02-29).', 'leaveYearStart');
    leaveYearStart = input.leaveYearStart;
  }
  const all = [...readEntries(input.used, 'used', 'leave'), ...readEntries(input.requested, 'requested', 'requested')];
  if (all.length > LIMITS.entries) throw new FmlaError(`At most ${LIMITS.entries} days of leave in one call.`, 'used');
  const seen = new Set();
  for (const e of all) {
    if (seen.has(e.date)) throw new FmlaError(`${longDate(e.date)} is listed twice. Put a day's FMLA hours on one line.`, e.kind === 'leave' ? 'used' : 'requested');
    seen.add(e.date);
  }
  all.sort((a, b) => (a.date < b.date ? -1 : 1));
  return ledgerFor(method, { all, ent, asOf, leaveYearStart, caregiver });
}

function ledgerFor(method, { all, ent, asOf, leaveYearStart, caregiver }) {
  const st = { leaveYearStart, periodStart: null };
  const done = [];
  const rows = [];
  for (const e of all) {
    if (method === 'forward' && (!st.periodStart || e.date >= addMonths(st.periodStart, 12))) st.periodStart = e.date;
    const { used, from } = usedOn(method, e.date, done, st);
    const left = Math.max(0, ent.hours - used);
    const prot = Math.min(e.hours, left);
    const row = { date: e.date, kind: e.kind, hours: e.hours, protected: prot, over: e.hours - prot, periodFrom: from, usedBefore: used, remainingAfter: left - prot };
    done.push(row);
    rows.push(row);
  }
  // The balance on the as-of day (leave on earlier days only).
  const stAt = { leaveYearStart, periodStart: null };
  for (const r of rows) if (r.date < asOf && method === 'forward' && (!stAt.periodStart || r.date >= addMonths(stAt.periodStart, 12))) stAt.periodStart = r.date;
  const at = usedOn(method, asOf, rows.filter((r) => r.date < asOf), stAt);
  const remaining = Math.max(0, ent.hours - at.used);
  let restores = [];
  let resetOn = null;
  if (method === 'rolling') {
    const back = new Map();
    for (const r of rows) if (r.date < asOf && r.protected && asOf < restoreDate(r.date)) back.set(restoreDate(r.date), (back.get(restoreDate(r.date)) ?? 0) + r.protected);
    let run = remaining;
    restores = [...back.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([d, h]) => { run += h; return { date: d, hours: h, balance: Math.min(ent.hours, run) }; });
  } else {
    resetOn = at.until ?? null;
  }
  const over = rows.filter((r) => r.over > 0);
  const requestedRows = rows.filter((r) => r.kind === 'requested');
  const weekly = ent.weeklyHours;
  const name = METHOD_NAMES[method];
  let answer = `On ${longDate(asOf)}, under the ${METHOD_SHORT[method]} method, ${hoursText(at.used)} of ${hoursText(ent.hours)} FMLA hours are used${at.from ? ` in the period from ${longDate(at.from)}` : ''}; ${hoursText(remaining)} hours (${weeksText(remaining, weekly)} weeks) remain`;
  if (method === 'rolling' && restores.length) answer += `, and ${hoursText(restores[0].hours)} hours come back on ${longDate(restores[0].date)}`;
  else if (resetOn && at.used) answer += `, and the full ${hoursText(ent.hours)} hours return on ${longDate(resetOn)}`;
  answer += '.';
  if (requestedRows.length) {
    const p = requestedRows.reduce((s, r) => s + r.protected, 0);
    const q = requestedRows.reduce((s, r) => s + r.over, 0);
    answer += ` Of the ${hoursText(p + q)} requested hours, ${hoursText(p)} are FMLA-protected${q ? ` and ${hoursText(q)} are not` : ''}.`;
  }
  return {
    op: 'balance',
    method,
    methodName: name,
    caregiver,
    asOf,
    weeklyHours: weekly,
    weeks: ent.weeks,
    entitlement: ent.hours,
    used: at.used,
    remaining,
    remainingWeeks: weeksText(remaining, weekly),
    periodFrom: at.from,
    resetOn,
    restores: restores.slice(0, 24),
    fullOn: restores.length ? restores.at(-1).date : null,
    rows,
    overEntitlement: over.map((r) => ({ date: r.date, hours: r.over })),
    answer,
  };
}

// The remaining hours on the as-of day under every method (fixed only with leaveYearStart), and
// which gives the employee the most: 825.200(e) applies that one when the employer chose none.
export function compareMethods(input) {
  const out = [];
  for (const m of METHODS) {
    if (m === 'fixed' && !input.leaveYearStart) continue;
    const r = balance({ ...input, method: m, weeks: RULE.entitlementWeeks });
    out.push({ method: m, name: METHOD_NAMES[m], used: r.used, remaining: r.remaining, protectedRequested: r.rows.filter((x) => x.kind === 'requested').reduce((s, x) => s + x.protected, 0) });
  }
  const best = Math.max(...out.map((x) => x.remaining + x.protectedRequested));
  return out.map((x) => ({ ...x, best: x.remaining + x.protectedRequested === best }));
}

// ---------- the record (the paid output) ----------

const csvCell = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const csvOf = (columns, rows) => [columns, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n') + '\r\n';

// One employee's leave record: the ledger as CSV (one line per day of leave) and, with a check,
// the fields of the eligibility notice.
export function recordCsv(employee, b) {
  const plain = (h) => (h / 100).toFixed(2);
  return csvOf(
    ['employee', 'date', 'kind', 'hours', 'fmla_protected_hours', 'not_protected_hours', 'period_from', 'used_before', 'remaining_after', 'returns_on'],
    b.rows.map((r) => [employee, r.date, r.kind, plain(r.hours), plain(r.protected), plain(r.over), r.periodFrom ?? '', plain(r.usedBefore), plain(r.remainingAfter), b.method === 'rolling' && r.protected ? restoreDate(r.date) : '']),
  );
}

export function noticeFields(c) {
  const t = c.tests;
  return {
    form: 'WH-381 Notice of Eligibility and Rights and Responsibilities, Part A',
    requestDate: c.noticeDate,
    dueBy: c.notice.due,
    leaveStart: c.leaveStart,
    eligible: c.eligible,
    monthsEmployed: serviceText(t.service),
    hoursWorked: t.hours.flightCrew ? 'airline flight crew rule' : hoursText(t.hours.total),
    hoursPeriod: `${t.hours.window.from} to ${t.hours.window.to}`,
    employeesWithin75Miles: t.worksite.count,
    worksite: t.worksite.worksite ?? '',
    reasons: c.reasons,
  };
}
