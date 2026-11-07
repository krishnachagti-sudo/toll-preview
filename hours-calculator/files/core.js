// The hours calculator's engine: clock times in and out, unpaid breaks, overnight shifts, daylight
// saving when a time zone is given, overtime per fixed workweek (29 CFR 778.104 and 778.105) with
// optional daily thresholds, and a rounding check that sets the punches as entered against the
// same punches rounded (29 CFR 785.48(b)). Pure and dependency-free: the page loads this same
// file, so the totals on the page and the paid timesheet always agree. Durations are whole
// minutes throughout; decimals are worked out from the minutes, never added up from decimals.

export class HoursError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'HoursError';
    this.field = field;
  }
}

export const LIMITS = { days: 62, pairs: 6, shiftMinutes: 24 * 60, longShift: 16 * 60, shortBreak: 20 };
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const INCREMENTS = [5, 6, 15];
export const ROUNDING_MODES = ['nearest', 'in-up-out-down'];
const DAY = 1440;

// ---------- dates ----------

export function isRealDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d && y >= 1970 && y <= 2100;
}
// Days since 1970-01-01 (a Thursday).
export const dayIndex = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86_400_000;
export const isoOf = (idx) => new Date(idx * 86_400_000).toISOString().slice(0, 10);
export const weekdayOf = (iso) => (dayIndex(iso) + 4) % 7;
export const addDays = (iso, n) => isoOf(dayIndex(iso) + n);
export const longDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;
export const shortDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1].slice(0, 3)} ${+iso.slice(8, 10)}`;
export const dayDate = (iso) => `${WEEKDAYS[weekdayOf(iso)].slice(0, 3)}, ${shortDate(iso)}`;

// ---------- clock times ----------

// "8:45", "08:45", "0845", "8:45 am", "8:45a", "845p", "9am", "noon", "midnight", "24:00" -> minutes
// after midnight (0 to 1440). Without am or pm a time is read on the 24-hour clock, so "5:15" is
// early morning; the page warns about a shift that looks like a slip (over 16 hours).
export function parseClock(text, field = 'time') {
  const raw = String(text ?? '').trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ');
  const bad = () => new HoursError(`"${String(text ?? '').trim()}" is not a clock time. Write it like 8:45 am, 17:15 or 0845.`, field);
  if (raw === 'noon') return 720;
  if (raw === 'midnight') return 0;
  // A bare hour, "9" or "17", is on the 24-hour clock.
  if (/^\d{1,2}$/.test(raw)) {
    if (+raw > 24) throw bad();
    return +raw === 24 ? DAY : +raw * 60;
  }
  let m = /^(\d{1,2}):(\d{2})\s?(am|pm|a|p)?$/.exec(raw) ?? /^(\d{1,2})\s?(am|pm|a|p)$/.exec(raw);
  let h;
  let min;
  let half;
  if (m && m.length === 4) { h = +m[1]; min = +m[2]; half = m[3]; } else if (m) { h = +m[1]; min = 0; half = m[2]; } else {
    m = /^(\d{3,4})\s?(am|pm|a|p)?$/.exec(raw);
    if (!m) throw bad();
    h = +m[1].slice(0, -2);
    min = +m[1].slice(-2);
    half = m[2];
  }
  if (min > 59) throw bad();
  if (half) {
    if (h < 1 || h > 12) throw bad();
    return (h % 12) * 60 + min + (half[0] === 'p' ? 720 : 0);
  }
  if (h === 24 && min === 0) return DAY;
  if (h > 23) throw bad();
  return h * 60 + min;
}

// 525 -> "8:45 AM"; 1440 -> "12:00 AM".
export function clockText(min) {
  const m = ((min % DAY) + DAY) % DAY;
  const h = Math.floor(m / 60);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

// A duration: 2490 -> { minutes: 2490, hhmm: '41:30', decimal: '41.50' }.
export const hhmm = (min) => `${min < 0 ? '-' : ''}${Math.floor(Math.abs(min) / 60)}:${String(Math.abs(min) % 60).padStart(2, '0')}`;
export function decimal(min, places = 2) {
  const f = 10 ** places;
  const v = Math.round((Math.abs(min) * f) / 60);
  const s = String(Math.floor(v / f)) + (places ? `.${String(v % f).padStart(places, '0')}` : '');
  return min < 0 && v ? `-${s}` : s;
}
export const span = (min) => ({ minutes: min, hhmm: hhmm(min), decimal: decimal(min) });
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
export const minutesWords = (min) => {
  const a = Math.abs(min);
  const h = Math.floor(a / 60);
  const m = a % 60;
  return [h ? plural(h, 'hour') : '', m || !h ? plural(m, 'minute') : ''].filter(Boolean).join(' ');
};

// ---------- money ----------

// "15.25", 15.25 or "$15.25" -> 1525 cents; null when not a money amount with at most 2 decimals.
export function centsOf(v) {
  const s = String(v ?? '').trim().replace(/^\$/, '').replace(/,/g, '');
  if (!/^\d{1,6}(\.\d{1,2})?$/.test(s)) return null;
  const [w, f = ''] = s.split('.');
  return Number(w) * 100 + Number(f.padEnd(2, '0'));
}
export const usd = (cents) => `$${Math.floor(cents / 100).toLocaleString('en-US')}.${String(cents % 100).padStart(2, '0')}`;
// Minutes at a rate in cents with a multiplier of num/den, to the nearest cent.
const pay = (min, rateCents, num = 1, den = 1) => Math.round((min * rateCents * num) / (60 * den));

// ---------- converting ----------

// Hours and minutes to decimal hours, or decimal hours to hours and minutes (to the nearest minute).
export function convert({ hours = 0, minutes = 0, decimalHours } = {}) {
  if (decimalHours !== undefined) {
    const s = String(decimalHours).trim();
    if (!/^\d{1,5}(\.\d{1,6})?$/.test(s)) throw new HoursError('Decimal hours must be a number such as 7.88.', 'decimalHours');
    const [w, f = ''] = s.split('.');
    // Exact: the fraction as an integer over 10^k, times 60, rounded half up.
    const k = f.length;
    const total = Number(w) * 60 + (k ? Math.round((Number(f) * 60) / 10 ** k) : 0);
    return { op: 'convert', from: 'decimal', decimalHours: s, ...span(total), answer: `${s} hours is ${minutesWords(total)} (${hhmm(total)}), to the nearest minute.` };
  }
  if (!Number.isInteger(hours) || hours < 0 || hours > 99_999) throw new HoursError('Hours must be a whole number from 0.', 'hours');
  if (!Number.isInteger(minutes) || minutes < 0 || minutes > 59) throw new HoursError('Minutes must be a whole number from 0 to 59.', 'minutes');
  const total = hours * 60 + minutes;
  const exact = minutes ? `${hours} + ${minutes}/60` : String(hours);
  return { op: 'convert', from: 'hours-minutes', ...span(total), decimal4: decimal(total, 4), answer: `${minutesWords(total)} is ${decimal(total)} hours (${exact} = ${decimal(total, 4)}).` };
}

// ---------- time zones (daylight saving) ----------

const zoneFormats = new Map();
function zoneFormat(zone) {
  if (!zoneFormats.has(zone)) {
    zoneFormats.set(zone, new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }));
  }
  return zoneFormats.get(zone);
}
export function isZone(zone) {
  if (typeof zone !== 'string' || !zone) return false;
  try { zoneFormat(zone); return true; } catch { return false; }
}
// The zone's offset from UTC, in minutes, at a UTC minute.
function offsetAt(zone, utcMin) {
  const p = Object.fromEntries(zoneFormat(zone).formatToParts(new Date(utcMin * 60_000)).map((x) => [x.type, x.value]));
  const local = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) / 60_000;
  return local - utcMin;
}
// A wall-clock minute (days since 1970 x 1440 + minute of day) to a UTC minute. A time skipped by
// the spring change is read with the offset before it; a time that happens twice in the autumn is
// read as its first occurrence. Both are reported.
function toUtc(zone, local) {
  const found = [];
  for (const probe of [local - 720, local + 720]) {
    const o = offsetAt(zone, probe);
    const utc = local - o;
    if (offsetAt(zone, utc) === o && !found.includes(utc)) found.push(utc);
  }
  if (!found.length) return { utc: local - offsetAt(zone, local - 720), skipped: true };
  found.sort((a, b) => a - b);
  return { utc: found[0], twice: found.length > 1 };
}

// ---------- rounding ----------

// A punch rounded to an increment of the clock. 'nearest' rounds the lower half down and the
// upper half up (to the quarter hour: 1 to 7 minutes past down, 8 to 14 up); 'in-up-out-down'
// rounds every in punch up and every out punch down, the one-way practice a rounding check is for.
export function roundPunch(min, increment, mode, kind) {
  const r = ((min % increment) + increment) % increment;
  if (!r) return min;
  if (mode === 'in-up-out-down') return kind === 'in' ? min - r + increment : min - r;
  return r * 2 < increment ? min - r : min - r + increment;
}

// ---------- the timesheet ----------

// Workweek start: a weekday (0 = Sunday) and a minute of the day. 29 CFR 778.105: a fixed and
// regularly recurring period of 168 hours that may begin on any day and at any hour.
function weekStartOf(local, startDay, startMin) {
  const idx = Math.floor(local / DAY);
  const wd = (idx + 4) % 7;
  let s = (idx - ((wd - startDay + 7) % 7)) * DAY + startMin;
  if (s > local) s -= 7 * DAY;
  return s;
}
const localText = (local) => `${WEEKDAYS[(Math.floor(local / DAY) + 4) % 7]}, ${longDate(isoOf(Math.floor(local / DAY)))} at ${clockText(local % DAY)}`;

function readRules(o = {}) {
  const startDay = o.weekStartDay ?? 0;
  const startMin = o.weekStartTime === undefined ? 0 : parseClock(o.weekStartTime, 'weekStartTime');
  if (startMin >= DAY) throw new HoursError('The workweek starts at a time from 12:00 AM to 11:59 PM.', 'weekStartTime');
  const hoursOpt = (v, field, label) => {
    if (v === undefined || v === null) return null;
    if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0 || v > 168 || Math.round(v * 60) !== v * 60) throw new HoursError(`${label} must be hours above 0, such as 40 or 7.5.`, field);
    return Math.round(v * 60);
  };
  const weekly = o.weeklyOvertimeAfter === undefined ? 40 * 60 : hoursOpt(o.weeklyOvertimeAfter, 'weeklyOvertimeAfter', 'Weekly overtime');
  const daily = hoursOpt(o.dailyOvertimeAfter, 'dailyOvertimeAfter', 'Daily overtime');
  const double = hoursOpt(o.dailyDoubleTimeAfter, 'dailyDoubleTimeAfter', 'Daily double time');
  if (daily !== null && daily > DAY) throw new HoursError('Daily overtime starts after at most 24 hours.', 'dailyOvertimeAfter');
  if (double !== null && double > DAY) throw new HoursError('Daily double time starts after at most 24 hours.', 'dailyDoubleTimeAfter');
  if (double !== null && daily !== null && double <= daily) throw new HoursError('Daily double time must start after daily overtime.', 'dailyDoubleTimeAfter');
  let rounding = null;
  if (o.rounding) {
    if (!INCREMENTS.includes(o.rounding.increment)) throw new HoursError('Rounding is to 5, 6 or 15 minutes.', 'rounding');
    rounding = { increment: o.rounding.increment, mode: o.rounding.mode ?? 'nearest' };
    if (!ROUNDING_MODES.includes(rounding.mode)) throw new HoursError(`Rounding mode is ${ROUNDING_MODES.join(' or ')}.`, 'rounding');
  }
  if (o.timeZone !== undefined && o.timeZone !== null && !isZone(o.timeZone)) throw new HoursError(`"${o.timeZone}" is not a time zone. Use a name like America/Chicago.`, 'timeZone');
  let rate = null;
  if (o.hourlyRate !== undefined && o.hourlyRate !== null && o.hourlyRate !== '') {
    rate = centsOf(o.hourlyRate);
    if (!rate) throw new HoursError('The hourly rate must be dollars with at most 2 decimals, such as 18.50.', 'hourlyRate');
  }
  return { startDay, startMin, weekly, daily, double, rounding, zone: o.timeZone || null, rate };
}

// Reads the days into punches on one wall-clock line. Each pair runs from in to out; an out at or
// before its in is the next day (an overnight shift), and a pair whose in is before the previous
// out starts after midnight.
function readDays(days) {
  if (!Array.isArray(days) || !days.length) throw new HoursError('Give at least one day.', 'days');
  if (days.length > LIMITS.days) throw new HoursError(`At most ${LIMITS.days} days in one timesheet.`, 'days');
  const seen = new Set();
  const out = days.map((d, i) => {
    const where = `days.${i}`;
    if (!isRealDate(d.date)) throw new HoursError(`Day ${i + 1}: "${d.date}" is not a date written like 2026-11-02.`, `${where}.date`);
    if (seen.has(d.date)) throw new HoursError(`${longDate(d.date)} is listed twice. Put all of a day's punches on one day.`, `${where}.date`);
    seen.add(d.date);
    const pairs = d.punches ?? [];
    if (pairs.length > LIMITS.pairs) throw new HoursError(`${longDate(d.date)}: at most ${LIMITS.pairs} in and out pairs a day.`, `${where}.punches`);
    const base = dayIndex(d.date) * DAY;
    let last = null;
    let prevIn = null;
    const read = pairs.map((p, k) => {
      const field = `${where}.punches.${k}`;
      let a = base + parseClock(p.in, `${field}.in`);
      if (a - base >= DAY) throw new HoursError(`${longDate(d.date)}: an in punch cannot be 24:00.`, `${field}.in`);
      // Before the previous pair's out: inside that pair is an overlap; earlier on the clock
      // than its in is the next morning.
      if (last !== null && a < last && a >= prevIn) throw new HoursError(`${longDate(d.date)}: pair ${k + 1} starts before pair ${k} ends.`, `${field}.in`);
      if (last !== null && a < last) a += DAY;
      if (last !== null && a < last) throw new HoursError(`${longDate(d.date)}: pair ${k + 1} starts before pair ${k} ends.`, `${field}.in`);
      let b = a - (a - base) % DAY + parseClock(p.out, `${field}.out`);
      if (b <= a) b += DAY;
      if (b - a > LIMITS.shiftMinutes) throw new HoursError(`${longDate(d.date)}: pair ${k + 1} is longer than 24 hours.`, `${field}.out`);
      last = b;
      prevIn = a;
      return { in: a, out: b, inText: String(p.in).trim(), outText: String(p.out).trim() };
    });
    const brk = d.breakMinutes ?? 0;
    if (!Number.isInteger(brk) || brk < 0 || brk > 720) throw new HoursError(`${longDate(d.date)}: unpaid break minutes must be a whole number from 0 to 720.`, `${where}.breakMinutes`);
    if (brk && !read.length) throw new HoursError(`${longDate(d.date)}: a break with no punches.`, `${where}.breakMinutes`);
    return { date: d.date, pairs: read, breakMinutes: brk, note: d.note ?? '' };
  }).sort((x, y) => (x.date < y.date ? -1 : 1));
  for (let i = 1; i < out.length; i++) {
    const prev = out[i - 1].pairs.at(-1);
    const next = out[i].pairs[0];
    if (prev && next && next.in < prev.out) throw new HoursError(`${longDate(out[i].date)} starts at ${clockText(next.in % DAY)}, before the shift from ${longDate(out[i - 1].date)} ends.`, 'days');
  }
  return out;
}

// Real minutes between two wall-clock minutes: the same number without a zone; with one, the
// actual elapsed time (a 10 PM to 6 AM shift is 9 hours on the night clocks fall back).
function elapsed(zone, a, b, notes) {
  if (!zone) return b - a;
  const x = toUtc(zone, a);
  const y = toUtc(zone, b);
  for (const [t, at] of [[x, a], [y, b]]) {
    if (t.skipped) notes.add(`${localText(at)} does not exist in ${zone} (clocks moved forward); it is read as the time before the change.`);
    if (t.twice) notes.add(`${localText(at)} happens twice in ${zone} (clocks moved back); it is read as the first time.`);
  }
  return y.utc - x.utc;
}

// One version of the sheet (exact, or rounded): per-day pieces split at workweek boundaries.
function workOut(days, rules, punchOf) {
  const notes = new Set();
  const weeks = new Map();
  const weekOf = (start) => {
    if (!weeks.has(start)) weeks.set(start, { start, total: 0, daily: 0, double: 0, days: new Set() });
    return weeks.get(start);
  };
  const dayRows = days.map((d) => {
    const pieces = [];
    const pairs = d.pairs.map((p) => {
      const a = punchOf(p.in, 'in');
      const b = Math.max(punchOf(p.out, 'out'), a);
      let t = a;
      let minutes = 0;
      while (t < b) {
        const ws = weekStartOf(t, rules.startDay, rules.startMin);
        const end = Math.min(b, ws + 7 * DAY);
        const m = elapsed(rules.zone, t, end, notes);
        pieces.push({ week: ws, minutes: m });
        minutes += m;
        t = end;
      }
      return { in: a, out: b, minutes };
    });
    const gross = pairs.reduce((s, p) => s + p.minutes, 0);
    const brk = Math.min(d.breakMinutes, gross);
    // The break comes off the earliest pieces; overtime is the latest minutes of the day.
    let left = brk;
    for (const p of pieces) { const take = Math.min(left, p.minutes); p.minutes -= take; left -= take; }
    const worked = gross - brk;
    const double = rules.double === null ? 0 : Math.max(0, worked - rules.double);
    const daily = rules.daily === null ? 0 : Math.max(0, worked - double - rules.daily);
    let dd = double;
    let dl = daily;
    for (let i = pieces.length - 1; i >= 0; i--) {
      const p = pieces[i];
      const w = weekOf(p.week);
      w.total += p.minutes;
      w.days.add(d.date);
      const takeD = Math.min(dd, p.minutes);
      dd -= takeD;
      const takeO = Math.min(dl, p.minutes - takeD);
      dl -= takeO;
      w.double += takeD;
      w.daily += takeO;
    }
    if (!pieces.length && d.pairs.length === 0) weekOf(weekStartOf(dayIndex(d.date) * DAY + 720, rules.startDay, rules.startMin)).days.add(d.date);
    return { date: d.date, pairs, gross, breakMinutes: brk, worked, dailyOvertime: daily, doubleTime: double };
  });
  const weekRows = [...weeks.values()].sort((a, b) => a.start - b.start).map((w) => {
    const straight = w.total - w.daily - w.double;
    const weeklyOt = rules.weekly === null ? 0 : Math.max(0, straight - rules.weekly);
    return { start: w.start, total: w.total, straight, weeklyOvertime: weeklyOt, dailyOvertime: w.daily, doubleTime: w.double, regular: straight - weeklyOt, days: [...w.days].sort() };
  });
  const sum = (k) => weekRows.reduce((s, w) => s + w[k], 0);
  const totals = { worked: sum('total'), regular: sum('regular'), overtime: sum('weeklyOvertime') + sum('dailyOvertime'), doubleTime: sum('doubleTime'), breaks: dayRows.reduce((s, d) => s + d.breakMinutes, 0) };
  return { days: dayRows, weeks: weekRows, totals, notes: [...notes] };
}

function payOf(t, rate) {
  if (!rate) return null;
  const regular = pay(t.regular, rate);
  const overtime = pay(t.overtime, rate, 3, 2);
  const doubleTime = pay(t.doubleTime, rate, 2);
  return { rateCents: rate, rate: usd(rate), regular: usd(regular), overtime: usd(overtime), doubleTime: usd(doubleTime), grossCents: regular + overtime + doubleTime, gross: usd(regular + overtime + doubleTime) };
}

const ruleWords = (rules) => {
  const parts = [];
  if (rules.weekly !== null) parts.push(`over ${decimal(rules.weekly).replace(/\.00$/, '')} hours a workweek`);
  if (rules.daily !== null) parts.push(`over ${decimal(rules.daily).replace(/\.00$/, '')} hours a day`);
  return parts.length ? parts.join(' and ') : 'no overtime threshold';
};

// The whole sheet. Totals are the punches as paid: rounded when a rounding rule is given, as
// entered otherwise; with rounding, the exact totals and every punch's difference come too.
export function calculate(input) {
  const rules = readRules(input);
  const days = readDays(input.days);
  const exact = workOut(days, rules, (m) => m);
  const paid = rules.rounding ? workOut(days, rules, (m, kind) => roundPunch(m, rules.rounding.increment, rules.rounding.mode, kind)) : exact;
  const flags = [];
  for (const n of paid.notes) flags.push({ date: null, kind: 'clock-change', message: n });
  days.forEach((d, i) => {
    d.pairs.forEach((p, k) => {
      if (p.out - p.in > LIMITS.longShift) flags.push({ date: d.date, kind: 'long-shift', message: `${longDate(d.date)}: ${clockText(p.in % DAY)} to ${clockText(p.out % DAY)} is ${hhmm(p.out - p.in)} hours. If that is a slip between AM and PM, fix the time.` });
      const gap = k ? p.in - d.pairs[k - 1].out : null;
      if (gap !== null && gap > 0 && gap < LIMITS.shortBreak) flags.push({ date: d.date, kind: 'short-break', message: `${longDate(d.date)}: an unpaid gap of ${plural(gap, 'minute')}. Rest periods of 5 to about 20 minutes count as hours worked (29 CFR 785.18).` });
    });
    if (d.breakMinutes > 0 && d.breakMinutes < LIMITS.shortBreak) flags.push({ date: d.date, kind: 'short-break', message: `${longDate(d.date)}: an unpaid break of ${plural(d.breakMinutes, 'minute')}. Rest periods of 5 to about 20 minutes count as hours worked (29 CFR 785.18); a meal period is ordinarily 30 minutes or more (785.19).` });
    if (d.breakMinutes > 0 && exact.days[i].gross < d.breakMinutes) flags.push({ date: d.date, kind: 'break-longer', message: `${longDate(d.date)}: the break is longer than the time punched; the day counts as 0 hours.` });
  });
  // A workweek with days outside this sheet: overtime counts only the days entered.
  const first = days[0].date;
  const last = days.at(-1).date;
  const from = input.periodStart && isRealDate(input.periodStart) ? input.periodStart : first;
  const to = input.periodEnd && isRealDate(input.periodEnd) ? input.periodEnd : last;
  if (from > first || to < last) throw new HoursError(`The pay period ${longDate(from)} to ${longDate(to)} does not hold every day entered (${longDate(first)} to ${longDate(last)}).`, 'periodStart');
  // Only a pay period given outright can cut a workweek: days left out of a sheet with no period
  // are days not worked.
  const explicit = Boolean(input.periodStart || input.periodEnd);
  for (const w of explicit ? paid.weeks : []) {
    const startDate = isoOf(Math.floor(w.start / DAY));
    const endDate = isoOf(Math.floor((w.start + 7 * DAY - 1) / DAY));
    if (startDate < from || endDate > to) w.partial = true;
  }
  const partial = paid.weeks.filter((w) => w.partial);
  if (partial.length && rules.weekly !== null) flags.push({ date: null, kind: 'partial-week', message: `${plural(partial.length, 'workweek')} ${partial.length === 1 ? 'runs' : 'run'} past this pay period (${partial.map((w) => `from ${localText(w.start)}`).join('; ')}). Weekly overtime counts only the hours entered here; add the other days of that workweek for the full count.` });

  const t = paid.totals;
  const money = payOf(t, rules.rate);
  let rounding = null;
  if (rules.rounding) {
    const punches = [];
    let up = 0;
    let down = 0;
    let same = 0;
    for (const d of days) {
      for (const p of d.pairs) {
        for (const kind of ['in', 'out']) {
          const actual = p[kind];
          const rounded = roundPunch(actual, rules.rounding.increment, rules.rounding.mode, kind);
          // Positive: more paid time for the worker (an in moved earlier or an out moved later).
          const effect = kind === 'in' ? actual - rounded : rounded - actual;
          if (effect > 0) up += 1; else if (effect < 0) down += 1; else same += 1;
          punches.push({ date: d.date, kind, actual: clockText(actual % DAY), rounded: clockText(rounded % DAY), effectMinutes: effect });
        }
      }
    }
    const net = t.worked - exact.totals.worked;
    const exactPay = payOf(exact.totals, rules.rate);
    rounding = {
      increment: rules.rounding.increment,
      mode: rules.rounding.mode,
      exact: span(exact.totals.worked),
      rounded: span(t.worked),
      netMinutes: net,
      net: `${net < 0 ? '-' : '+'}${hhmm(Math.abs(net))}`,
      punchesInWorkersFavour: up,
      punchesAgainstWorker: down,
      punchesUnchanged: same,
      exactOvertime: span(exact.totals.overtime),
      payDifference: money ? `${money.grossCents - exactPay.grossCents < 0 ? '-' : ''}${usd(Math.abs(money.grossCents - exactPay.grossCents))}` : null,
      punches,
      answer: `Rounded ${rules.rounding.mode === 'nearest' ? 'to the nearest' : 'in up and out down to'} ${rules.rounding.increment} minutes, these punches pay ${hhmm(t.worked)} instead of the ${hhmm(exact.totals.worked)} punched: ${net === 0 ? 'no difference' : `${minutesWords(net)} ${net < 0 ? 'less' : 'more'} for the worker`} (${up} punches rounded in the worker's favour, ${down} against, ${same} unchanged).`,
    };
  }

  const range = from === to ? longDate(from) : `${dayDate(from)} to ${dayDate(to)}, ${to.slice(0, 4)}`;
  const otWords = rules.weekly === null && rules.daily === null ? '' : `: ${decimal(t.regular)} regular and ${decimal(t.overtime)} overtime${t.doubleTime ? ` and ${decimal(t.doubleTime)} double time` : ''} (${ruleWords(rules)})`;
  const answer = `${from === to ? 'On' : 'From'} ${range} the hours worked are ${hhmm(t.worked)} (${decimal(t.worked)} hours)${otWords}${money ? `; gross pay ${money.gross} at ${money.rate} an hour` : ''}.`;

  return {
    op: 'calculate',
    answer,
    period: { from, to },
    totals: { worked: span(t.worked), regular: span(t.regular), overtime: span(t.overtime), doubleTime: span(t.doubleTime), unpaidBreaks: span(t.breaks) },
    pay: money ? { rate: money.rate, regular: money.regular, overtime: money.overtime, doubleTime: money.doubleTime, gross: money.gross } : null,
    days: paid.days.map((d, i) => ({
      date: d.date,
      weekday: WEEKDAYS[weekdayOf(d.date)],
      pairs: d.pairs.map((p, k) => ({
        in: clockText(p.in % DAY),
        out: clockText(p.out % DAY),
        ...(rules.rounding ? { punchedIn: clockText(days[i].pairs[k].in % DAY), punchedOut: clockText(days[i].pairs[k].out % DAY) } : {}),
        overnight: Math.floor((p.out - 1) / DAY) > Math.floor(days[i].pairs[k].in / DAY) || Math.floor(p.in / DAY) > dayIndex(d.date),
        minutes: p.minutes,
      })),
      unpaidBreakMinutes: d.breakMinutes,
      worked: span(d.worked),
      dailyOvertime: span(d.dailyOvertime),
      doubleTime: span(d.doubleTime),
      note: days[i].note,
    })),
    weeks: paid.weeks.map((w) => ({
      starts: localText(w.start),
      startDate: isoOf(Math.floor(w.start / DAY)),
      dates: w.days,
      worked: span(w.total),
      regular: span(w.regular),
      weeklyOvertime: span(w.weeklyOvertime),
      dailyOvertime: span(w.dailyOvertime),
      doubleTime: span(w.doubleTime),
      partial: Boolean(w.partial),
    })),
    rounding,
    flags,
    rules: {
      workweekStarts: `${WEEKDAYS[rules.startDay]} at ${clockText(rules.startMin)}`,
      weeklyOvertimeAfterHours: rules.weekly === null ? null : rules.weekly / 60,
      dailyOvertimeAfterHours: rules.daily === null ? null : rules.daily / 60,
      dailyDoubleTimeAfterHours: rules.double === null ? null : rules.double / 60,
      overtimeMultiplier: '1.5',
      doubleTimeMultiplier: '2',
      timeZone: rules.zone,
    },
  };
}

// Two clock times on one shift, minus a break: the duration, across midnight when the end is
// earlier than the start. With a date and a zone it counts a daylight-saving change too.
export function between({ start, end, breakMinutes = 0, date, timeZone }) {
  const a = parseClock(start, 'start');
  const bRaw = parseClock(end, 'end');
  if (a >= DAY) throw new HoursError('The start cannot be 24:00.', 'start');
  if (!Number.isInteger(breakMinutes) || breakMinutes < 0 || breakMinutes > 720) throw new HoursError('Break minutes must be a whole number from 0 to 720.', 'breakMinutes');
  const overnight = bRaw <= a;
  const b = overnight ? bRaw + DAY : bRaw;
  let minutes = b - a;
  const notes = new Set();
  if (timeZone) {
    if (!isZone(timeZone)) throw new HoursError(`"${timeZone}" is not a time zone. Use a name like America/Chicago.`, 'timeZone');
    if (!isRealDate(date)) throw new HoursError('A time zone needs the date the shift starts, written like 2026-11-01.', 'date');
    const base = dayIndex(date) * DAY;
    minutes = elapsed(timeZone, base + a, base + b, notes);
  }
  const worked = Math.max(0, minutes - breakMinutes);
  const tail = `${breakMinutes ? `, minus a ${breakMinutes}-minute break` : ''}${overnight ? ', across midnight' : ''}${timeZone ? ` in ${timeZone} on the night of ${longDate(date)}` : ''}`;
  return {
    op: 'between',
    start: clockText(a),
    end: clockText(b),
    overnight,
    breakMinutes,
    shift: span(minutes),
    ...span(worked),
    notes: [...notes],
    answer: `${clockText(a)} to ${clockText(b)}${tail} is ${minutesWords(worked)} (${decimal(worked)} hours).`,
  };
}

// The CSV of a calculated sheet: one line a day, then the week and period totals.
const cell = (v) => {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export function sheetCsv(r, { employee = '' } = {}) {
  const rows = [['employee', 'date', 'weekday', 'punches', 'unpaid_break_minutes', 'hours_hmm', 'hours_decimal', 'daily_overtime_decimal', 'double_time_decimal']];
  for (const d of r.days) {
    rows.push([employee, d.date, d.weekday, d.pairs.map((p) => `${p.in}-${p.out}`).join('; '), d.unpaidBreakMinutes, d.worked.hhmm, d.worked.decimal, d.dailyOvertime.decimal, d.doubleTime.decimal]);
  }
  rows.push([]);
  rows.push(['employee', 'workweek_starts', 'worked_decimal', 'regular_decimal', 'weekly_overtime_decimal', 'daily_overtime_decimal', 'double_time_decimal', 'partial_week']);
  for (const w of r.weeks) rows.push([employee, w.starts, w.worked.decimal, w.regular.decimal, w.weeklyOvertime.decimal, w.dailyOvertime.decimal, w.doubleTime.decimal, w.partial ? 'yes' : 'no']);
  rows.push([]);
  rows.push(['employee', 'period_from', 'period_to', 'worked_hmm', 'worked_decimal', 'regular_decimal', 'overtime_decimal', 'double_time_decimal', 'gross_pay']);
  rows.push([employee, r.period.from, r.period.to, r.totals.worked.hhmm, r.totals.worked.decimal, r.totals.regular.decimal, r.totals.overtime.decimal, r.totals.doubleTime.decimal, r.pay ? r.pay.gross : '']);
  return `${rows.map((x) => x.map(cell).join(',')).join('\r\n')}\r\n`;
}

// The minutes-to-decimal chart (1 to 60) and the 24-hour clock chart, for the page and the
// reference pages.
export const minutesChart = () => Array.from({ length: 60 }, (_, i) => ({ minutes: i + 1, decimal: decimal(i + 1), exact: decimal(i + 1, 4) }));
export const militaryChart = (step = 30) => Array.from({ length: DAY / step }, (_, i) => {
  const m = i * step;
  return { military: `${String(Math.floor(m / 60)).padStart(2, '0')}${String(m % 60).padStart(2, '0')}`, clock: clockText(m), decimal: decimal(m) };
});
