// The overtime auditor's engine: a timesheet (CSV rows of employee, date, hours or punches, state,
// rate and what payroll paid) to the regular, overtime and double-time hours each employee was owed
// per workweek, under the federal weekly rule (29 CFR 778) and the state rules read for this tool
// (California Labor Code 510 and 511, Alaska AS 23.10.060, Colorado COMPS Order #40 Rule 4,
// Kentucky KRS 337.050 and 337.285), the gap against what was paid, and the FLSA-only premium that
// goes on Form W-2 in box 12, code TT (IRS FS-2026-13).
//
// Pure and dependency-free, as core.js must be: the punch arithmetic (clock times, overnight
// shifts, breaks, daylight saving) is the hours calculator's engine, passed in as `hours`
// (tools/hours-calculator/core.js, used read-only), and the rule table is passed in as `rules`
// (data/rules.json). Durations are whole minutes; money is whole cents, rounded once per week.

export class AuditError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'AuditError';
    this.field = field;
  }
}

export const LIMITS = { bytes: 3_000_000, rows: 20_000, employeeWeeks: 10_000, checkDays: 7 };
export const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
export const COVERED = ['CA', 'AK', 'CO', 'KY'];
export const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia',
  FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana',
  ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska',
  NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas',
  UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};
const DAY = 1440;
const H8 = 480;
const H12 = 720;
const H40 = 2400;
// Colorado: punch pairs separated by a gap of at most this many minutes are one run of
// consecutive hours (Rule 4.1.5 subtracts a meal period from a run; it does not end it).
export const RUN_GAP = 60;
const SEVENTH = ['ca-7th', 'ca-7th-double', 'ky-7th'];

// What each rule is called on a page and in the results CSV.
export const RULE_TEXT = {
  'ca-daily': 'California Labor Code 510(a): over 8 hours in a workday at 1.5x',
  'ca-double': 'California Labor Code 510(a): over 12 hours in a workday at 2x',
  'ca-7th': 'California Labor Code 510(a): first 8 hours on the seventh day of work in the workweek at 1.5x',
  'ca-7th-double': 'California Labor Code 510(a): over 8 hours on the seventh day of work in the workweek at 2x',
  'ca-aws': 'California Labor Code 511(b): over the alternative workweek\'s scheduled hours, up to 12, at 1.5x',
  'ca-aws-double': 'California Labor Code 511(b): over 12 hours in a day at 2x',
  'ca-aws-extra': 'California Labor Code 511(b): a day beyond the scheduled workdays, first 8 hours at 1.5x',
  'ca-aws-extra-double': 'California Labor Code 511(b): over 8 hours on a day beyond the scheduled workdays at 2x',
  'ak-daily': 'Alaska AS 23.10.060(b): over 8 hours a day at 1.5x',
  'co-daily': 'Colorado COMPS Order #40 Rule 4.1.1(B): over 12 hours in a workday at 1.5x',
  'co-consecutive': 'Colorado COMPS Order #40 Rule 4.1.1(C): over 12 consecutive hours at 1.5x',
  'ky-7th': 'Kentucky KRS 337.050(1): time worked on the seventh day of work in the workweek at 1.5x',
  weekly: 'Over 40 hours in the workweek at 1.5x (29 CFR 778.101; the state\'s weekly rule where it has one)',
};

// ---------- small helpers ----------

const plural = (n, word) => `${n.toLocaleString('en-US')} ${word}${n === 1 ? '' : 's'}`;
const dec = (hours, min) => hours.decimal(min);
const money = (hours, cents) => (cents < 0 ? `-${hours.usd(-cents)}` : hours.usd(cents));
export const stateCode = (v) => {
  const s = String(v ?? '').trim();
  if (!s) return null;
  const up = s.toUpperCase();
  if (STATE_NAMES[up]) return up;
  const hit = Object.entries(STATE_NAMES).find(([, name]) => name.toUpperCase() === up);
  return hit ? hit[0] : undefined;
};
export const stateName = (code) => STATE_NAMES[code] ?? code;
export const isCovered = (code) => COVERED.includes(code);

// The workweek a date falls in: its first day, for a workweek that starts on weekday `startDay`.
export const weekStartOf = (hours, iso, startDay) => hours.addDays(iso, -((hours.weekdayOf(iso) - startDay + 7) % 7));

// "8", "8.5", "8:30" or "8h30" -> minutes worked (to the nearest minute).
export function minutesOf(hours, text, where) {
  const s = String(text ?? '').trim().toLowerCase().replace(/\s+/g, '');
  const bad = () => new AuditError(`${where}: "${String(text).trim()}" is not hours worked. Write 8.5 or 8:30.`, 'hours');
  let m = /^(\d{1,3})[:h](\d{1,2})m?$/.exec(s);
  if (m) {
    if (+m[2] > 59) throw bad();
    return hours.convert({ hours: +m[1], minutes: +m[2] }).minutes;
  }
  m = /^(\d{0,3})(\.\d{1,6})?h?$/.exec(s);
  if (!m || (!m[1] && !m[2])) throw bad();
  return hours.convert({ decimalHours: `${m[1] || '0'}${m[2] ?? ''}` }).minutes;
}

// 2026-11-02, 11/2/2026 or 11/02/26 -> 2026-11-02.
export function dateOf(hours, text, where) {
  const s = String(text ?? '').trim();
  let iso = s;
  const us = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/.exec(s);
  if (us) iso = `${us[3].length === 2 ? `20${us[3]}` : us[3]}-${us[1].padStart(2, '0')}-${us[2].padStart(2, '0')}`;
  else if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) iso = s.replace(/-(\d)(?=-|$)/g, '-0$1');
  if (!hours.isRealDate(iso)) throw new AuditError(`${where}: "${s}" is not a date. Write 2026-11-02 or 11/2/2026.`, 'date');
  return iso;
}

const centsField = (hours, text, where, label) => {
  const s = String(text ?? '').trim();
  if (!s) return null;
  const c = hours.centsOf(s);
  if (c === null) throw new AuditError(`${where}: ${label} "${s}" is not a dollar amount such as 18.50.`, 'rate');
  return c;
};

// ---------- CSV ----------

// RFC 4180 with the delimiter guessed from the header line (comma, semicolon or tab).
export function parseCsv(text) {
  const src = String(text ?? '').replace(/^﻿/, '');
  const first = src.split(/\r?\n/, 1)[0] ?? '';
  const delim = [',', ';', '\t'].map((d) => [d, first.split(d).length]).sort((a, b) => b[1] - a[1])[0][0];
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c;
    } else if (c === '"' && cell === '') quoted = true;
    else if (c === delim) { row.push(cell); cell = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((x) => x.trim() !== ''));
}

// Header names people export, folded to one field each.
export const COLUMNS = {
  employee: ['employee', 'employee name', 'name', 'employee id', 'worker', 'staff'],
  date: ['date', 'work date', 'day', 'shift date'],
  hours: ['hours', 'hours worked', 'total hours', 'worked hours', 'duration'],
  in: ['in', 'clock in', 'time in', 'start', 'start time', 'punch in'],
  out: ['out', 'clock out', 'time out', 'end', 'end time', 'punch out'],
  breakMinutes: ['break', 'break minutes', 'unpaid break', 'unpaid break minutes', 'meal minutes'],
  state: ['state', 'work state', 'location state'],
  rate: ['rate', 'hourly rate', 'pay rate', 'base rate'],
  extraPay: ['extra pay', 'bonus', 'shift pay', 'shift differential', 'nondiscretionary bonus', 'commission'],
  paidRegular: ['paid regular hours', 'paid regular', 'regular hours paid'],
  paidOvertime: ['paid overtime hours', 'paid ot hours', 'paid overtime', 'overtime hours paid', 'ot hours paid'],
  paidDoubleTime: ['paid double time hours', 'paid dt hours', 'paid double time', 'double time hours paid', 'dt hours paid'],
  paidAmount: ['paid amount', 'gross paid', 'amount paid', 'paid gross', 'paid'],
  awsDayHours: ['aws day hours', 'aws hours', 'alternative workweek hours'],
  awsDays: ['aws days', 'aws workdays', 'alternative workweek days'],
  exempt: ['exempt'],
};
const fold = (h) => String(h).trim().toLowerCase().replace(/[_\-./]+/g, ' ').replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();

export function mapHeader(header) {
  const map = {};
  const unknown = [];
  header.forEach((h, i) => {
    const f = fold(h);
    const key = Object.keys(COLUMNS).find((k) => COLUMNS[k].includes(f));
    if (key && map[key] === undefined) map[key] = i; else unknown.push(String(h).trim());
  });
  return { map, unknown };
}

// The CSV to rows, with every check that names the line it failed on.
export function readRows(hours, text, { defaultState = null } = {}) {
  if (String(text ?? '').length > LIMITS.bytes) throw new AuditError(`The file is over ${LIMITS.bytes / 1_000_000} MB. Split it by month or by employee.`, 'csv');
  const table = parseCsv(text);
  if (table.length < 2) throw new AuditError('The CSV needs a header line and at least one row.', 'csv');
  if (table.length - 1 > LIMITS.rows) throw new AuditError(`At most ${LIMITS.rows.toLocaleString('en-US')} rows in one file; this one has ${(table.length - 1).toLocaleString('en-US')}.`, 'csv');
  const { map, unknown } = mapHeader(table[0]);
  if (map.employee === undefined) throw new AuditError('The CSV needs an "employee" column.', 'csv');
  if (map.date === undefined) throw new AuditError('The CSV needs a "date" column.', 'csv');
  if (map.hours === undefined && (map.in === undefined || map.out === undefined)) throw new AuditError('The CSV needs an "hours" column, or "in" and "out" columns with clock times.', 'csv');
  if (map.state === undefined && !defaultState) throw new AuditError('The CSV has no "state" column; choose the state the work was done in.', 'defaultState');
  const get = (r, k) => (map[k] === undefined ? '' : String(r[map[k]] ?? '').trim());
  const rows = table.slice(1).map((r, i) => {
    const where = `Line ${i + 2}`;
    const employee = get(r, 'employee');
    if (!employee) throw new AuditError(`${where}: the employee is blank.`, 'employee');
    if (employee.length > 120) throw new AuditError(`${where}: the employee name is over 120 characters.`, 'employee');
    const date = dateOf(hours, get(r, 'date'), where);
    const st = get(r, 'state');
    const state = st ? stateCode(st) : defaultState;
    if (!state) throw new AuditError(`${where}: "${st}" is not a US state. Write CA or California.`, 'state');
    const inT = get(r, 'in');
    const outT = get(r, 'out');
    const h = get(r, 'hours');
    let minutes = null;
    let punch = null;
    if (inT || outT) {
      if (!inT || !outT) throw new AuditError(`${where}: give both the in and the out time.`, 'in');
      punch = { in: inT, out: outT };
    } else if (h) minutes = minutesOf(hours, h, where);
    else throw new AuditError(`${where}: no hours and no in and out times.`, 'hours');
    if (minutes !== null && minutes > DAY) throw new AuditError(`${where}: ${h} hours is more than a day.`, 'hours');
    const brk = get(r, 'breakMinutes');
    let breakMinutes = 0;
    if (brk) {
      if (!/^\d{1,3}$/.test(brk) || +brk > 720) throw new AuditError(`${where}: unpaid break minutes must be a whole number from 0 to 720.`, 'breakMinutes');
      breakMinutes = +brk;
    }
    const hoursOpt = (k, label) => {
      const v = get(r, k);
      return v ? minutesOf(hours, v, `${where} (${label})`) : null;
    };
    const aws = get(r, 'awsDayHours');
    let awsDayMinutes = null;
    if (aws) {
      awsDayMinutes = minutesOf(hours, aws, `${where} (alternative workweek hours)`);
      if (awsDayMinutes <= H8 || awsDayMinutes > 600) throw new AuditError(`${where}: an alternative workweek day is more than 8 and at most 10 hours (Labor Code 511(a)).`, 'awsDayHours');
    }
    const awsD = get(r, 'awsDays');
    if (awsD && !/^[1-6]$/.test(awsD)) throw new AuditError(`${where}: alternative workweek days must be a whole number from 1 to 6.`, 'awsDays');
    const ex = get(r, 'exempt').toLowerCase();
    return {
      line: i + 2,
      employee,
      date,
      state,
      minutes,
      punch,
      breakMinutes,
      rateCents: centsField(hours, get(r, 'rate'), where, 'the rate'),
      extraCents: centsField(hours, get(r, 'extraPay'), where, 'extra pay') ?? 0,
      paidRegular: hoursOpt('paidRegular', 'paid regular hours'),
      paidOvertime: hoursOpt('paidOvertime', 'paid overtime hours'),
      paidDoubleTime: hoursOpt('paidDoubleTime', 'paid double-time hours'),
      paidCents: centsField(hours, get(r, 'paidAmount'), where, 'the paid amount'),
      awsDayMinutes,
      awsDays: awsD ? +awsD : null,
      exempt: ['yes', 'y', 'true', '1', 'exempt'].includes(ex),
    };
  });
  const used = Object.keys(map).sort((a, b) => map[a] - map[b]).map((k) => table[0][map[k]].trim());
  return { rows, columnsUsed: used, columnsIgnored: unknown };
}

// ---------- days ----------

// One employee's rows to worked days: { date, state, minutes, runs, rateMinutes, extraCents, ... }.
// Punch rows go through the hours calculator (overnight shifts, several pairs, unpaid breaks,
// daylight saving); a shift belongs to the date it starts on.
function daysOf(hours, employee, rows, opts) {
  const byDate = new Map();
  for (const r of rows) {
    if (!byDate.has(r.date)) byDate.set(r.date, []);
    byDate.get(r.date).push(r);
  }
  const dates = [...byDate.keys()].sort();
  const days = [];
  const punchDays = [];
  for (const date of dates) {
    const rs = byDate.get(date);
    const states = [...new Set(rs.map((r) => r.state))];
    if (states.length > 1) throw new AuditError(`${employee}, ${hours.longDate(date)}: rows in more than one state (${states.join(', ')}). Put a day's work in the state where most of it was done, or split the employee.`, 'state');
    const punches = rs.filter((r) => r.punch);
    if (punches.length && punches.length !== rs.length) throw new AuditError(`${employee}, ${hours.longDate(date)}: mixes hours and in/out times on one day.`, 'hours');
    const pick = (k) => rs.map((r) => r[k]).find((v) => v !== null && v !== undefined) ?? null;
    const sumOpt = (k) => (rs.some((r) => r[k] !== null) ? rs.reduce((s, r) => s + (r[k] ?? 0), 0) : null);
    const day = {
      date,
      state: states[0],
      minutes: 0,
      runs: [],
      lines: rs.map((r) => r.line),
      rated: [],
      extraCents: rs.reduce((s, r) => s + r.extraCents, 0),
      paidRegular: sumOpt('paidRegular'),
      paidOvertime: sumOpt('paidOvertime'),
      paidDoubleTime: sumOpt('paidDoubleTime'),
      paidCents: sumOpt('paidCents'),
      awsDayMinutes: pick('awsDayMinutes'),
      awsDays: pick('awsDays'),
      exempt: rs.some((r) => r.exempt),
      breakMinutes: rs.reduce((s, r) => s + r.breakMinutes, 0),
    };
    if (punches.length) {
      if (punches.length > 6) throw new AuditError(`${employee}, ${hours.longDate(date)}: at most 6 in and out pairs a day.`, 'in');
      punchDays.push({ day, punches: punches.map((r) => ({ in: r.punch.in, out: r.punch.out, line: r.line })) });
    } else {
      day.minutes = Math.max(0, rs.reduce((s, r) => s + r.minutes, 0) - day.breakMinutes);
      // The break comes off the first rows, so each rate is paid on the minutes left to it.
      let left = day.breakMinutes;
      day.rated = rs.map((r) => { const t = Math.min(left, r.minutes); left -= t; return { cents: r.rateCents, minutes: r.minutes - t }; });
      if (day.minutes > DAY) throw new AuditError(`${employee}, ${hours.longDate(date)}: ${hours.decimal(day.minutes)} hours on one day is more than 24.`, 'hours');
      day.runs = [];
    }
    days.push(day);
  }
  // The hours calculator works out punched days, up to 62 at a time.
  for (let i = 0; i < punchDays.length; i += 62) {
    const chunk = punchDays.slice(i, i + 62);
    let res;
    try {
      res = hours.calculate({
        days: chunk.map(({ day, punches }) => ({ date: day.date, punches: punches.map((p) => ({ in: p.in, out: p.out })), breakMinutes: Math.min(day.breakMinutes, 720) })),
        weeklyOvertimeAfter: null,
        timeZone: opts.timeZone ?? null,
      });
    } catch (e) {
      if (e && e.name === 'HoursError') throw new AuditError(`${employee}: ${e.message}`, 'in');
      throw e;
    }
    res.days.forEach((d, k) => {
      const { day, punches } = chunk.find((c) => c.day.date === d.date);
      day.minutes = d.worked.minutes;
      // Absolute starts for Colorado's consecutive-hours rule, on the same wall-clock line the
      // hours calculator uses (a pair before the previous out is the next morning).
      let last = null;
      const base = hours.dayIndex(day.date) * DAY;
      day.runs = d.pairs.map((p, j) => {
        let a = base + hours.parseClock(punches[j].in);
        if (last !== null && a < last) a += DAY;
        const r = { start: a, minutes: p.minutes };
        last = a + p.minutes;
        return r;
      });
      void k;
      // An unpaid break typed beside the punches comes off the first pair.
      let left = Math.min(day.breakMinutes, day.runs.reduce((s, r) => s + r.minutes, 0));
      for (const r of day.runs) { const t = Math.min(left, r.minutes); r.minutes -= t; left -= t; }
      const rateOf = new Map(rows.filter((r) => r.date === day.date).map((r) => [r.line, r.rateCents]));
      day.rated = day.runs.map((r, j) => ({ cents: rateOf.get(punches[j].line) ?? null, minutes: r.minutes }));
    });
  }
  return days;
}

// Colorado's runs of consecutive hours: pairs with gaps of at most RUN_GAP minutes join.
function consecutiveExcess(days) {
  const pairs = days.flatMap((d) => d.runs.map((r) => ({ ...r, date: d.date }))).sort((a, b) => a.start - b.start);
  const excess = new Map();
  let run = null;
  const close = () => {
    if (run && run.worked > H12) excess.set(run.date, (excess.get(run.date) ?? 0) + run.worked - H12);
  };
  for (const p of pairs) {
    if (run && p.start - run.end <= RUN_GAP) {
      run.worked += p.minutes;
      run.end = Math.max(run.end, p.start + p.minutes);
    } else {
      close();
      run = { date: p.date, worked: p.minutes, end: p.start + p.minutes };
    }
  }
  close();
  return excess;
}

// ---------- one workweek ----------

// The buckets for one employee's workweek. Daily rules go first, day by day under the state the
// day was worked in; weekly overtime then applies to the straight-time minutes left over 40, so no
// hour is paid twice (Labor Code 510(a), AS 23.10.060(b)); for Colorado that sum equals the
// greater of the 40-hour, 12-hour and 12-consecutive-hour calculations (Rule 4.1.2), and for
// Kentucky the greater of weekly overtime and the seventh day (KRS 337.050(2)(a)).
export function bucketWeek(days, weekStart, opts = {}) {
  const worked = days.filter((d) => d.minutes > 0);
  const total = worked.reduce((s, d) => s + d.minutes, 0);
  const allSeven = new Set(worked.map((d) => d.date)).size === 7;
  const coExcess = consecutiveExcess(days.filter((d) => d.state === 'CO'));
  let dayNumber = 0;
  const rows = days.map((d) => {
    const m = d.minutes;
    const parts = [];
    let ot = 0;
    let dt = 0;
    const add = (min, kind, rule) => {
      if (min <= 0) return;
      if (kind === 'ot') ot += min; else dt += min;
      parts.push({ kind, minutes: min, rule });
    };
    if (m > 0) dayNumber += 1;
    const seventh = allSeven && m > 0 && dayNumber === 7;
    if (m > 0 && d.state === 'CA') {
      if (d.awsDayMinutes) {
        if (d.awsDays && dayNumber > d.awsDays) {
          add(Math.min(m, H8), 'ot', 'ca-aws-extra');
          add(m - H8, 'dt', 'ca-aws-extra-double');
        } else {
          add(Math.min(m, H12) - d.awsDayMinutes, 'ot', 'ca-aws');
          add(m - H12, 'dt', 'ca-aws-double');
        }
      } else if (seventh) {
        add(Math.min(m, H8), 'ot', 'ca-7th');
        add(m - H8, 'dt', 'ca-7th-double');
      } else {
        add(Math.min(m, H12) - H8, 'ot', 'ca-daily');
        add(m - H12, 'dt', 'ca-double');
      }
    } else if (m > 0 && d.state === 'AK' && !opts.alaskaSmallEmployer) {
      add(m - H8, 'ot', 'ak-daily');
    } else if (m > 0 && d.state === 'CO') {
      const daily = Math.max(0, m - H12);
      const run = Math.min(m, coExcess.get(d.date) ?? 0);
      if (run > daily) add(run, 'ot', 'co-consecutive'); else add(daily, 'ot', 'co-daily');
    } else if (m > 0 && d.state === 'KY' && seventh && total > H40) {
      add(m, 'ot', 'ky-7th');
    }
    return { date: d.date, state: d.state, minutes: m, ot, dt, parts, seventh };
  });
  const daily = rows.reduce((s, r) => s + r.ot, 0);
  const double = rows.reduce((s, r) => s + r.dt, 0);
  const straight = total - daily - double;
  const weekly = Math.max(0, straight - H40);
  // Weekly overtime is the week's latest straight-time minutes.
  let left = weekly;
  for (let i = rows.length - 1; i >= 0 && left > 0; i--) {
    const r = rows[i];
    const take = Math.min(left, r.minutes - r.ot - r.dt);
    if (take > 0) { r.ot += take; r.parts.push({ kind: 'ot', minutes: take, rule: 'weekly' }); left -= take; }
  }
  for (const r of rows) r.regular = r.minutes - r.ot - r.dt;
  return {
    weekStart,
    total,
    regular: total - daily - weekly - double,
    overtime: daily + weekly,
    doubleTime: double,
    weeklyOvertime: weekly,
    flsaOvertime: Math.max(0, total - H40),
    seventhDay: rows.find((r) => r.parts.some((p) => SEVENTH.includes(p.rule)))?.state ?? null,
    days: rows,
  };
}

// ---------- money for one week ----------

function payOfWeek(hours, week, days) {
  const withHours = days.flatMap((d) => d.rated).filter((x) => x.minutes > 0);
  if (!withHours.length || withHours.some((x) => x.cents === null) || week.total === 0) return null;
  // 29 CFR 778.109 and 778.115: every straight-time dollar (all rates, plus extra pay such as a
  // nondiscretionary bonus or shift pay) divided by all hours worked.
  const straightCents = withHours.reduce((s, x) => s + (x.minutes * x.cents) / 60, 0) + days.reduce((s, d) => s + d.extraCents, 0);
  const rr = straightCents / (week.total / 60);
  const premium = (rr * (week.overtime * 0.5 + week.doubleTime)) / 60;
  return {
    regularRateCents: rr,
    straightCents,
    owedCents: Math.round(straightCents + premium),
    premiumCents: Math.round(premium),
    qualifiedCents: Math.round((rr * week.flsaOvertime * 0.5) / 60),
  };
}

// ---------- the audit ----------

function auditRows(hours, rules, rows, opts) {
  const startDay = WEEKDAYS.indexOf(opts.workweekStart ?? 'sunday');
  if (startDay < 0) throw new AuditError('workweekStart is a day name such as "sunday".', 'workweekStart');
  const byEmployee = new Map();
  for (const r of rows) {
    if (!byEmployee.has(r.employee)) byEmployee.set(r.employee, []);
    byEmployee.get(r.employee).push(r);
  }
  const dates = rows.map((r) => r.date).sort();
  const fileFrom = opts.periodStart ?? dates[0];
  const fileTo = opts.periodEnd ?? dates.at(-1);
  const weeks = [];
  const skipped = [];
  const flags = [];
  for (const [employee, rs] of byEmployee) {
    if (rs.some((r) => r.exempt)) { skipped.push(employee); continue; }
    const days = daysOf(hours, employee, rs, opts);
    const byWeek = new Map();
    for (const d of days) {
      const ws = weekStartOf(hours, d.date, startDay);
      if (!byWeek.has(ws)) byWeek.set(ws, []);
      byWeek.get(ws).push(d);
    }
    const starts = [...byWeek.keys()].sort();
    for (const ws of starts) {
      const wd = byWeek.get(ws);
      const b = bucketWeek(wd, ws, opts);
      if (b.total === 0) continue;
      const pay = payOfWeek(hours, b, wd);
      const sum = (k) => (wd.some((d) => d[k] !== null) ? wd.reduce((s, d) => s + (d[k] ?? 0), 0) : null);
      const paid = { regular: sum('paidRegular'), overtime: sum('paidOvertime'), doubleTime: sum('paidDoubleTime'), cents: sum('paidCents') };
      const weekFlags = [];
      let shortfall = null;
      let shortfallBasis = null;
      if (paid.cents !== null && pay) {
        shortfall = pay.owedCents - paid.cents;
        shortfallBasis = 'paid amount';
      } else if ((paid.overtime !== null || paid.doubleTime !== null) && pay) {
        // Premium owed against premium paid, both at this week's regular rate, assuming every
        // hour was paid at least straight time.
        const owedPremium = b.overtime * 0.5 + b.doubleTime;
        const paidPremium = (paid.overtime ?? 0) * 0.5 + (paid.doubleTime ?? 0);
        shortfall = Math.round((pay.regularRateCents * (owedPremium - paidPremium)) / 60);
        shortfallBasis = 'paid overtime hours';
      }
      if (paid.overtime !== null || paid.doubleTime !== null) {
        const missOt = b.overtime - (paid.overtime ?? 0);
        const missDt = b.doubleTime - (paid.doubleTime ?? 0);
        if (missOt > 0) weekFlags.push(`${dec(hours, missOt)} overtime hours owed but not paid as overtime.`);
        if (missDt > 0) weekFlags.push(`${dec(hours, missDt)} double-time hours owed but not paid as double time.`);
        if (paid.regular !== null && paid.regular + (paid.overtime ?? 0) + (paid.doubleTime ?? 0) !== b.total) {
          weekFlags.push(`Paid hours (${dec(hours, paid.regular + (paid.overtime ?? 0) + (paid.doubleTime ?? 0))}) differ from hours worked (${dec(hours, b.total)}).`);
        }
      }
      const notCovered = [...new Set(wd.filter((d) => d.minutes > 0 && !isCovered(d.state)).map((d) => d.state))];
      if (notCovered.length) weekFlags.push(`${notCovered.map(stateName).join(', ')}: state law not read for this tool; the federal weekly rule only.`);
      if (new Set(wd.filter((d) => d.minutes > 0).map((d) => d.state)).size > 1) weekFlags.push('Worked in more than one state this week: each day follows its own state\'s daily rule, and weekly overtime counts the whole week.');
      const first = ws < fileFrom;
      const last = hours.addDays(ws, 6) > fileTo;
      if (first || last) weekFlags.push(`The file ${first && last ? 'starts and ends' : first ? 'starts' : 'ends'} inside this workweek; days outside the file are counted as not worked.`);
      if (hours.addDays(ws, 6).slice(0, 4) !== ws.slice(0, 4)) weekFlags.push('This workweek spans two calendar years; its qualified overtime is counted in the year the workweek ends. Use the year it was paid if that differs.');
      if (wd.some((d) => d.state === 'CO' && d.minutes > H12 && !d.runs.length)) weekFlags.push('Colorado: hours without in and out times; the 12-consecutive-hour rule needs punches and was checked by workday only.');
      if (wd.some((d) => d.state === 'CA' && d.awsDayMinutes) && b.days.some((x) => x.state === 'CA' && x.seventh)) weekFlags.push('California alternative workweek: Labor Code 510\'s seventh-day rule does not apply (510(a)(1)); days past the scheduled workdays follow 511(b) when "aws days" is given.');
      if (!pay) weekFlags.push('No hourly rate on every row: hours only, no money.');
      weeks.push({ employee, ...b, pay, paid, shortfall, shortfallBasis, underpaid: shortfall !== null && shortfall > 0, flags: weekFlags, lines: wd.flatMap((d) => d.lines) });
    }
  }
  if (weeks.length > LIMITS.employeeWeeks) throw new AuditError(`At most ${LIMITS.employeeWeeks.toLocaleString('en-US')} employee-weeks in one file; this one has ${weeks.length.toLocaleString('en-US')}.`, 'csv');
  if (skipped.length) flags.push(`Marked exempt and skipped: ${skipped.join(', ')}.`);
  return { weeks, skipped, flags };
}

// Distinct employee-weeks with hours, the unit an audit is priced by. Cheap: no punch arithmetic
// beyond reading the rows (a punched day counts as worked).
export function countEmployeeWeeks(hours, input) {
  const { rows } = readRows(hours, input.csv, { defaultState: input.defaultState ? stateCode(input.defaultState) : null });
  const startDay = Math.max(0, WEEKDAYS.indexOf(input.workweekStart ?? 'sunday'));
  const exempt = new Set(rows.filter((r) => r.exempt).map((r) => r.employee));
  const keys = new Set();
  for (const r of rows) {
    if (exempt.has(r.employee) || (r.minutes !== null && r.minutes === 0)) continue;
    keys.add(`${r.employee}\u0000${weekStartOf(hours, r.date, startDay)}`);
  }
  return keys.size;
}

const hrs = (hours, m) => dec(hours, m);

function weekOut(hours, w) {
  return {
    employee: w.employee,
    workweekStart: w.weekStart,
    workweekEnd: hours.addDays(w.weekStart, 6),
    states: [...new Set(w.days.filter((d) => d.minutes > 0).map((d) => d.state))],
    hoursWorked: hrs(hours, w.total),
    regular: hrs(hours, w.regular),
    overtime: hrs(hours, w.overtime),
    doubleTime: hrs(hours, w.doubleTime),
    flsaOvertime: hrs(hours, w.flsaOvertime),
    seventhDay: w.seventhDay,
    regularRate: w.pay ? money(hours, Math.round(w.pay.regularRateCents)) : null,
    owed: w.pay ? money(hours, w.pay.owedCents) : null,
    overtimePremium: w.pay ? money(hours, w.pay.premiumCents) : null,
    paid: w.paid.cents !== null ? money(hours, w.paid.cents) : null,
    paidOvertimeHours: w.paid.overtime !== null ? hrs(hours, w.paid.overtime) : null,
    paidDoubleTimeHours: w.paid.doubleTime !== null ? hrs(hours, w.paid.doubleTime) : null,
    shortfall: w.shortfall !== null ? money(hours, w.shortfall) : null,
    shortfallBasis: w.shortfallBasis,
    underpaid: w.underpaid,
    qualifiedOvertime: w.pay ? money(hours, w.pay.qualifiedCents) : null,
    days: w.days.filter((d) => d.minutes > 0).map((d) => ({
      date: d.date,
      weekday: hours.WEEKDAYS[hours.weekdayOf(d.date)],
      state: d.state,
      hours: hrs(hours, d.minutes),
      regular: hrs(hours, d.regular),
      overtime: hrs(hours, d.ot),
      doubleTime: hrs(hours, d.dt),
      rules: d.parts.map((p) => ({ bucket: p.kind === 'ot' ? 'overtime' : 'double time', hours: hrs(hours, p.minutes), rule: p.rule, text: RULE_TEXT[p.rule] })),
    })),
    flags: w.flags,
    lines: w.lines,
  };
}

const cell = (v) => {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) || /^[=+\-@]/.test(s) ? `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"` : s;
};
export function resultsCsv(weeks) {
  const head = ['employee', 'workweek_start', 'workweek_end', 'states', 'hours_worked', 'regular', 'overtime', 'double_time', 'flsa_overtime_hours', 'seventh_day', 'regular_rate', 'owed', 'paid', 'shortfall', 'underpaid', 'qualified_overtime_code_tt', 'rules', 'flags'];
  const lines = [head];
  for (const w of weeks) {
    const rules = [...new Set(w.days.flatMap((d) => d.rules.map((r) => r.rule)))].join(' ');
    lines.push([w.employee, w.workweekStart, w.workweekEnd, w.states.join(' '), w.hoursWorked, w.regular, w.overtime, w.doubleTime, w.flsaOvertime, w.seventhDay ?? '', w.regularRate ?? '', w.owed ?? '', w.paid ?? '', w.shortfall ?? '', w.underpaid ? 'yes' : 'no', w.qualifiedOvertime ?? '', rules, w.flags.join(' ')]);
  }
  return `${lines.map((l) => l.map(cell).join(',')).join('\r\n')}\r\n`;
}

// The CSV audit. `preview` returns the totals and the first sentence only.
export function audit(hours, rules, input, { preview = false } = {}) {
  const defaultState = input.defaultState ? stateCode(input.defaultState) : null;
  if (input.defaultState && !defaultState) throw new AuditError(`"${input.defaultState}" is not a US state.`, 'defaultState');
  const { rows, columnsUsed, columnsIgnored } = readRows(hours, input.csv, { defaultState });
  const { weeks, skipped, flags } = auditRows(hours, rules, rows, input);
  const sum = (k) => weeks.reduce((s, w) => s + w[k], 0);
  const priced = weeks.filter((w) => w.pay);
  const checked = weeks.filter((w) => w.shortfall !== null);
  const under = checked.filter((w) => w.underpaid);
  const short = under.reduce((s, w) => s + w.shortfall, 0);
  const seventh = weeks.filter((w) => w.seventhDay === 'CA').length;
  const employees = new Set(weeks.map((w) => w.employee)).size;
  const notCovered = [...new Set(weeks.flatMap((w) => w.days.filter((d) => d.minutes > 0 && !isCovered(d.state)).map((d) => d.state)))].sort();
  const n = weeks.length;
  const ot = hrs(hours, sum('overtime'));
  const dt = hrs(hours, sum('doubleTime'));
  let answer = `Across ${plural(n, 'employee-week')} (${plural(employees, 'employee')}) the rules give ${ot} overtime and ${dt} double-time hours`;
  if (checked.length) answer += `; ${plural(under.length, 'week')} ${under.length === 1 ? 'was' : 'were'} underpaid, by ${money(hours, short)} in total`;
  else answer += '; there were no paid columns, so underpayment was not checked';
  answer += `; ${seventh} ${seventh === 1 ? 'was a California seventh-day week' : 'were California seventh-day weeks'}.`;
  const qualified = {};
  for (const w of priced) {
    const y = hours.addDays(w.weekStart, 6).slice(0, 4);
    qualified[w.employee] ??= {};
    qualified[w.employee][y] = (qualified[w.employee][y] ?? 0) + w.pay.qualifiedCents;
  }
  const summary = {
    employees,
    employeeWeeks: n,
    rows: rows.length,
    hoursWorked: hrs(hours, sum('total')),
    regular: hrs(hours, sum('regular')),
    overtime: ot,
    doubleTime: dt,
    weeksChecked: checked.length,
    weeksUnderpaid: under.length,
    shortfall: checked.length ? money(hours, short) : null,
    owed: priced.length === n && n ? money(hours, priced.reduce((s, w) => s + w.pay.owedCents, 0)) : null,
    californiaSeventhDayWeeks: seventh,
    qualifiedOvertime: priced.length ? money(hours, priced.reduce((s, w) => s + w.pay.qualifiedCents, 0)) : null,
    statesNotCovered: notCovered.map((c) => ({ code: c, name: stateName(c), note: c === 'NV' ? rules.notCovered.NV : rules.notCovered.other })),
    skippedExempt: skipped,
  };
  if (preview) return { op: 'preview', answer, summary, columnsUsed, columnsIgnored, note: 'Totals only. The full audit lists every employee-week with the rule behind each overtime hour, the shortfall per week, code TT per employee and a results CSV.' };
  const out = weeks.map((w) => weekOut(hours, w));
  const people = [...new Set(weeks.map((w) => w.employee))].map((e) => {
    const ws = weeks.filter((w) => w.employee === e);
    const s = (k) => ws.reduce((a, w) => a + w[k], 0);
    const chk = ws.filter((w) => w.shortfall !== null);
    return {
      employee: e,
      weeks: ws.length,
      hoursWorked: hrs(hours, s('total')),
      regular: hrs(hours, s('regular')),
      overtime: hrs(hours, s('overtime')),
      doubleTime: hrs(hours, s('doubleTime')),
      weeksUnderpaid: chk.filter((w) => w.underpaid).length,
      shortfall: chk.length ? money(hours, chk.filter((w) => w.underpaid).reduce((a, w) => a + w.shortfall, 0)) : null,
      qualifiedOvertimeByYear: Object.fromEntries(Object.entries(qualified[e] ?? {}).sort().map(([y, c]) => [y, money(hours, c)])),
    };
  });
  return {
    op: 'audit',
    answer,
    summary,
    employees: people,
    weeks: out,
    flags,
    columnsUsed,
    columnsIgnored,
    csv: resultsCsv(out),
    rules: rulesUsed(rules, weeks),
  };
}

// The sources behind the rules this audit used, for the report.
function rulesUsed(rules, weeks) {
  const states = new Set(weeks.flatMap((w) => w.days.filter((d) => d.minutes > 0).map((d) => d.state)));
  const out = [{ name: 'Federal (FLSA)', sources: Object.values(rules.federal.sources).map((s) => ({ title: s.title, url: s.url, readOn: s.readOn })) }];
  for (const c of COVERED) {
    if (states.has(c)) out.push({ name: rules.states[c].name, sources: Object.values(rules.states[c].sources).map((s) => ({ title: s.title, url: s.url, readOn: s.readOn })) });
  }
  out.push({ name: 'Qualified overtime (W-2 box 12, code TT)', sources: Object.values(rules.qualifiedOvertime.sources).map((s) => ({ title: s.title, url: s.url, readOn: s.readOn })) });
  return out;
}

// ---------- one week, typed in ----------

// One employee's week from the page or a content page: days of hours or punches in one state.
export function check(hours, rules, input) {
  const state = stateCode(input.state);
  if (!state) throw new AuditError(`"${input.state}" is not a US state.`, 'state');
  if (!Array.isArray(input.days) || !input.days.length) throw new AuditError('Give at least one day.', 'days');
  if (input.days.length > LIMITS.checkDays * 2) throw new AuditError('At most 14 days: check one or two workweeks at a time.', 'days');
  const rate = input.rate === undefined || input.rate === null || input.rate === '' ? null : hours.centsOf(input.rate);
  if (input.rate !== undefined && input.rate !== null && input.rate !== '' && !rate) throw new AuditError('The hourly rate must be dollars with at most 2 decimals, such as 18.50.', 'rate');
  const extra = input.extraPay ? hours.centsOf(input.extraPay) : 0;
  if (input.extraPay && extra === null) throw new AuditError('Extra pay must be dollars, such as 46.00.', 'extraPay');
  if (input.aws) {
    const m = Math.round(input.aws.dayHours * 60);
    if (!(m > H8 && m <= 600)) throw new AuditError('An alternative workweek day is more than 8 and at most 10 hours (Labor Code 511(a)).', 'aws');
    if (state !== 'CA') throw new AuditError('An alternative workweek schedule is a California rule here.', 'aws');
  }
  const rows = [];
  input.days.forEach((d, i) => {
    const where = `Day ${i + 1}`;
    if (!hours.isRealDate(d.date)) throw new AuditError(`${where}: "${d.date}" is not a date written like 2026-11-02.`, 'days');
    const common = { line: i + 1, employee: input.employee || 'Employee', date: d.date, state, breakMinutes: d.breakMinutes ?? 0, rateCents: rate, extraCents: i === 0 ? extra : 0, paidRegular: null, paidOvertime: null, paidDoubleTime: null, paidCents: null, awsDayMinutes: input.aws ? Math.round(input.aws.dayHours * 60) : null, awsDays: input.aws?.days ?? null, exempt: false };
    if (d.punches && d.punches.length) {
      for (const p of d.punches) rows.push({ ...common, minutes: null, punch: { in: p.in, out: p.out } });
    } else {
      const m = typeof d.hours === 'number' ? Math.round(d.hours * 60) : minutesOf(hours, d.hours ?? '0', where);
      if (m < 0 || m > DAY) throw new AuditError(`${where}: hours must be from 0 to 24.`, 'days');
      rows.push({ ...common, minutes: m, punch: null });
    }
  });
  const dates = rows.map((r) => r.date);
  if (new Set(input.days.map((d) => d.date)).size !== input.days.length) throw new AuditError('A date is listed twice. Put all of a day\'s hours on one day.', 'days');
  void dates;
  const { weeks } = auditRows(hours, rules, rows.filter((r) => r.minutes === null || r.minutes > 0), { workweekStart: input.workweekStart ?? 'sunday', alaskaSmallEmployer: input.alaskaSmallEmployer ?? false, timeZone: input.timeZone ?? null });
  if (!weeks.length) throw new AuditError('No hours worked on these days.', 'days');
  const out = weeks.map((w) => weekOut(hours, w));
  const t = (k) => weeks.reduce((s, w) => s + w[k], 0);
  const owed = weeks.every((w) => w.pay) ? weeks.reduce((s, w) => s + w.pay.owedCents, 0) : null;
  const byDay = out.flatMap((w) => w.days.map((d) => `${d.weekday.slice(0, 3)} ${d.hours}`)).join(', ');
  const name = stateName(state);
  const covered = isCovered(state);
  const rateText = rate ? ` at ${hours.usd(rate)}/hour` : '';
  const answer = `For ${byDay}${rateText} in ${name}${covered ? '' : ' (federal rule only; state law not read)'} the hours are ${hrs(hours, t('regular'))} regular, ${hrs(hours, t('overtime'))} overtime (1.5x) and ${hrs(hours, t('doubleTime'))} double time (2x)${owed !== null ? `: ${hours.usd(owed)}` : ''}.`;
  return {
    op: 'check',
    answer,
    state: { code: state, name, covered, note: covered ? null : (state === 'NV' ? rules.notCovered.NV : rules.notCovered.other) },
    totals: { hoursWorked: hrs(hours, t('total')), regular: hrs(hours, t('regular')), overtime: hrs(hours, t('overtime')), doubleTime: hrs(hours, t('doubleTime')), flsaOvertime: hrs(hours, t('flsaOvertime')), owed: owed === null ? null : hours.usd(owed), qualifiedOvertime: weeks.every((w) => w.pay) ? hours.usd(weeks.reduce((s, w) => s + w.pay.qualifiedCents, 0)) : null },
    weeks: out,
    rules: rulesUsed(rules, weeks),
  };
}

// The state table: what the auditor applies where, with the source and the date read.
export function stateTable(rules) {
  return Object.keys(STATE_NAMES).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b])).map((code) => {
    const s = rules.states[code];
    if (!s) return { code, name: STATE_NAMES[code], covered: false, daily: 'Not read', weekly: 'Federal: over 40 (29 CFR 778.101)', seventhDay: 'Not read', note: code === 'NV' ? rules.notCovered.NV : rules.notCovered.other };
    const src = Object.values(s.sources)[0];
    const row = { code, name: s.name, covered: true, source: { title: src.title, url: src.url, readOn: src.readOn } };
    if (code === 'CA') return { ...row, daily: 'Over 8 at 1.5x; over 12 at 2x', weekly: 'Over 40 at 1.5x', seventhDay: 'First 8 at 1.5x, over 8 at 2x' };
    if (code === 'AK') return { ...row, daily: 'Over 8 at 1.5x (employers of 4 or more)', weekly: 'Over 40 at 1.5x', seventhDay: 'None' };
    if (code === 'CO') return { ...row, daily: 'Over 12 in a workday, or 12 consecutive hours, at 1.5x', weekly: 'Over 40 at 1.5x', seventhDay: 'None' };
    return { ...row, daily: 'None', weekly: 'Over 40 at 1.5x', seventhDay: 'All time on the 7th day at 1.5x, in a week over 40' };
  });
}
