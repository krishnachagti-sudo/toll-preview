// The cron engine: parse a schedule in one scheduler's own dialect, say what it means in plain
// English, list its next runs in an IANA time zone across daylight saving changes (each scheduler's
// documented rule, flagged where its docs say nothing), and write the same schedule for the other
// schedulers. Pure and dependency-free: the page loads this same file, so the free answer on the page
// and the paid API answer always agree. Time zone rules come from the runtime's Intl (ICU tzdata).
//
// Every dialect rule below is from the project's own documentation; DIALECTS[x].sources names the
// pages and the date they were read. Where a page is silent, the engine says so instead of guessing.

export class CronError extends Error {
  constructor(message, field = 'expression') {
    super(message);
    this.name = 'CronError';
    this.field = field;
  }
}

export const READ_ON = '2026-11-08';
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MON3 = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
const DOW3 = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
export const LIMITS = { count: 50, expression: 200, scanYears: 30 };

const SRC = {
  debianCrontab: { text: 'Debian crontab(5), cron 3.0pl1-197 (Vixie cron)', href: 'https://manpages.debian.org/trixie/cron/crontab.5.en.html' },
  debianCron: { text: 'Debian cron(8): clock changes', href: 'https://manpages.debian.org/bookworm/cron/cron.8.en.html' },
  github: { text: 'GitHub Docs: Events that trigger workflows, schedule', href: 'https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows' },
  k8s: { text: 'Kubernetes docs: CronJob', href: 'https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/' },
  vercel: { text: 'Vercel docs: Cron Jobs', href: 'https://vercel.com/docs/cron-jobs' },
  vercelUsage: { text: 'Vercel docs: Cron Jobs usage and pricing', href: 'https://vercel.com/docs/cron-jobs/usage-and-pricing' },
  n8n: { text: 'n8n docs: Schedule Trigger node', href: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/' },
  quartz: { text: 'Quartz 2.3 tutorial: CronTrigger', href: 'https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html' },
  quartzApi: { text: 'Quartz 2.3 API: CronExpression', href: 'https://www.quartz-scheduler.org/api/2.3.0/org/quartz/CronExpression.html' },
  spring: { text: 'Spring Framework reference: Task execution and scheduling, cron expressions', href: 'https://docs.spring.io/spring-framework/reference/integration/scheduling.html' },
  springApi: { text: 'Spring Framework API: CronExpression', href: 'https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/support/CronExpression.html' },
  uipath: { text: 'UiPath Orchestrator: Using cron expressions', href: 'https://docs.uipath.com/orchestrator/automation-cloud/latest/user-guide/using-cron-expressions' },
  aws: { text: 'Amazon EventBridge Scheduler: Schedule types', href: 'https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html' },
  awsRules: { text: 'Amazon EventBridge: Schedule patterns for scheduled rules (legacy)', href: 'https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-scheduled-rule-pattern.html' },
};
export const SOURCES = Object.fromEntries(Object.entries(SRC).map(([k, v]) => [k, { ...v, readOn: READ_ON }]));

// ---------- dialects ----------
//
// fields     the field names in order ('second' first where the dialect has seconds)
// optional   'second' (n8n: a leading seconds field may be left out) or 'year' (Quartz, UiPath)
// dowBase    0: Sunday = 0 (7 also Sunday where seven7); 1: Sunday = 1 ... Saturday = 7
// names      month and weekday names: true, false, or 'single' (allowed, but not in ranges or lists)
// macros     the @ strings the dialect documents, or null
// specials   L, W and # in the day fields
// question   '?' allowed in the day fields ('any' = same as *; 'required' = one day field must be ?)
// startStep  'a/s' without a range is allowed
// overflow   ranges like 22-2 wrap (Quartz documents this)
// dayRule    how the day-of-month and day-of-week fields combine when both are set:
//            'star-prefix' (Debian: OR unless either field starts with *), 'posix' (OR unless either
//            is * or ?), 'question' (one of them is ?), 'one-star' (one of them must be *)
// zone       { fixed, default, how }  fixed: the zone it always runs in
// dst        { gap, repeat }  documented clock-change behaviour, 'unknown' where the docs are silent
export const DIALECTS = {
  vixie: {
    id: 'vixie', name: 'Linux crontab (Vixie cron)', short: 'crontab',
    fields: ['minute', 'hour', 'dom', 'month', 'dow'], dowBase: 0, seven7: true, names: 'single',
    macros: { '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *', '@monthly': '0 0 1 * *', '@weekly': '0 0 * * 0', '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@hourly': '0 * * * *' },
    reboot: true, specials: false, question: false, startStep: false, overflow: false, dayRule: 'star-prefix',
    zone: { fixed: null, default: 'the time zone the cron daemon runs in', how: 'The cron daemon runs every crontab in its own time zone; per-user time zones are not supported (crontab(5), LIMITATIONS).' },
    dst: { gap: 'vixie', repeat: 'vixie' },
    sources: ['debianCrontab', 'debianCron'],
  },
  github: {
    id: 'github', name: 'GitHub Actions', short: 'GitHub Actions',
    fields: ['minute', 'hour', 'dom', 'month', 'dow'], dowBase: 0, seven7: false, names: true,
    macros: null, macrosRefused: 'GitHub Actions does not support the non-standard syntax @yearly, @monthly, @weekly, @daily, @hourly and @reboot.',
    specials: false, question: false, startStep: true, overflow: false, dayRule: 'posix',
    zone: { fixed: null, default: 'UTC', how: 'UTC unless the schedule sets timezone to an IANA name.' },
    dst: { gap: 'advance', repeat: 'unknown' }, minMinutes: 5,
    sources: ['github'],
  },
  kubernetes: {
    id: 'kubernetes', name: 'Kubernetes CronJob', short: 'Kubernetes',
    fields: ['minute', 'hour', 'dom', 'month', 'dow'], dowBase: 0, seven7: false, names: true,
    macros: { '@yearly': '0 0 1 1 *', '@annually': '0 0 1 1 *', '@monthly': '0 0 1 * *', '@weekly': '0 0 * * 0', '@daily': '0 0 * * *', '@midnight': '0 0 * * *', '@hourly': '0 * * * *' },
    specials: false, question: 'any', startStep: false, overflow: false, dayRule: 'posix',
    zone: { fixed: null, default: 'the kube-controller-manager\'s local time zone', how: 'Set .spec.timeZone to an IANA name; CRON_TZ or TZ inside .spec.schedule is refused.' },
    dst: { gap: 'unknown', repeat: 'unknown' },
    sources: ['k8s'],
  },
  vercel: {
    id: 'vercel', name: 'Vercel Cron Jobs', short: 'Vercel',
    fields: ['minute', 'hour', 'dom', 'month', 'dow'], dowBase: 0, seven7: false, names: false,
    macros: null, macrosRefused: 'Vercel\'s docs list only the five numeric fields.',
    specials: false, question: false, startStep: false, overflow: false, dayRule: 'one-star',
    zone: { fixed: 'UTC', default: 'UTC', how: 'The time zone is always UTC.' },
    dst: { gap: 'none', repeat: 'none' },
    sources: ['vercel', 'vercelUsage'],
  },
  n8n: {
    id: 'n8n', name: 'n8n Schedule Trigger (Custom cron)', short: 'n8n',
    fields: ['second', 'minute', 'hour', 'dom', 'month', 'dow'], optional: 'second', dowBase: 0, seven7: false, names: true,
    macros: null, macrosRefused: 'The n8n Schedule Trigger docs show only field expressions.',
    specials: false, question: false, startStep: false, overflow: false, dayRule: 'posix',
    zone: { fixed: null, default: 'the workflow time zone, else the instance time zone (America/New_York by default when self-hosted)', how: 'The workflow time zone if set, otherwise the instance time zone.' },
    dst: { gap: 'unknown', repeat: 'unknown' },
    sources: ['n8n'],
  },
  quartz: {
    id: 'quartz', name: 'Quartz Scheduler', short: 'Quartz',
    fields: ['second', 'minute', 'hour', 'dom', 'month', 'dow', 'year'], optional: 'year', dowBase: 1, seven7: false, names: true,
    macros: null, macrosRefused: 'Quartz cron expressions have 6 or 7 fields; no @ strings.',
    specials: { L: true, Lminus: true, W: true, LW: true, dowL: true, bareL: 7, hash: true },
    question: 'required', startStep: true, overflow: true, dayRule: 'question', yearMax: 2099,
    zone: { fixed: null, default: 'the scheduler\'s default time zone', how: 'A CronExpression resolves in the time zone set with setTimeZone, else the default.' },
    dst: { gap: 'unknown', repeat: 'unknown' },
    sources: ['quartz', 'quartzApi'],
  },
  spring: {
    id: 'spring', name: 'Spring @Scheduled', short: 'Spring',
    fields: ['second', 'minute', 'hour', 'dom', 'month', 'dow'], dowBase: 0, seven7: true, names: true,
    macros: { '@yearly': '0 0 0 1 1 *', '@annually': '0 0 0 1 1 *', '@monthly': '0 0 0 1 * *', '@weekly': '0 0 0 * * 0', '@daily': '0 0 0 * * *', '@midnight': '0 0 0 * * *', '@hourly': '0 0 * * * *' },
    specials: { L: true, Lminus: true, W: true, LW: true, dowL: true, bareL: null, hash: true },
    question: 'any', startStep: false, overflow: false, dayRule: 'posix',
    zone: { fixed: null, default: 'the server\'s default time zone', how: 'Set the zone attribute of @Scheduled to resolve the expression in another time zone.' },
    dst: { gap: 'unknown', repeat: 'unknown' },
    sources: ['spring', 'springApi'],
  },
  uipath: {
    id: 'uipath', name: 'UiPath Orchestrator time trigger', short: 'UiPath',
    fields: ['second', 'minute', 'hour', 'dom', 'month', 'dow', 'year'], optional: 'year', dowBase: 1, seven7: false, names: true,
    macros: null, macrosRefused: 'UiPath time triggers take 6 or 7 fields; no @ strings.',
    specials: { L: true, Lminus: false, W: true, LW: false, dowL: true, bareL: null, hash: true },
    question: 'any', startStep: true, overflow: false, dayRule: 'posix', yearMax: 2099,
    zone: { fixed: null, default: 'the time zone set on the trigger', how: 'Each time trigger has its own time zone.' },
    dst: { gap: 'unknown', repeat: 'unknown' },
    sources: ['uipath'],
  },
  aws: {
    id: 'aws', name: 'Amazon EventBridge Scheduler', short: 'AWS EventBridge',
    fields: ['minute', 'hour', 'dom', 'month', 'dow', 'year'], dowBase: 1, seven7: false, names: true, wrap: 'cron',
    macros: null, macrosRefused: 'EventBridge takes cron(...) with six fields, or rate(...) and at(...) schedules.',
    specials: { L: true, Lminus: false, W: true, LW: false, dowL: true, bareL: 7, hash: true, noDowStep: true },
    question: 'required', startStep: true, overflow: false, dayRule: 'question', yearMax: 2199,
    zone: { fixed: null, default: 'UTC', how: 'UTC unless the schedule sets a time zone (IANA names); scheduled rules (legacy) run in UTC.' },
    dst: { gap: 'skip', repeat: 'once' },
    sources: ['aws', 'awsRules'],
  },
};
export const DIALECT_IDS = Object.keys(DIALECTS);

const RANGE = { second: [0, 59], minute: [0, 59], hour: [0, 23], dom: [1, 31], month: [1, 12], dow: [0, 6], year: [1970, 2199] };
const LABEL = { second: 'Seconds', minute: 'Minutes', hour: 'Hours', dom: 'Day of month', month: 'Month', dow: 'Day of week', year: 'Year' };

// ---------- dates ----------

const pad = (n, w = 2) => String(n).padStart(w, '0');
const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();
const weekdayOf = (y, m, d) => new Date(Date.UTC(y, m - 1, d)).getUTCDay();
export const isoDate = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

// ---------- time zones ----------

const fmtCache = new Map();
function formatter(zone) {
  let f = fmtCache.get(zone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
    fmtCache.set(zone, f);
  }
  return f;
}
export function isTimeZone(zone) {
  if (typeof zone !== 'string' || !zone || zone.length > 64) return false;
  try { formatter(zone); return true; } catch { return false; }
}
// The zone's name as the runtime knows it ("utc" -> "UTC").
export function canonicalZone(zone) {
  return new Intl.DateTimeFormat('en-US', { timeZone: zone }).resolvedOptions().timeZone;
}

const offCache = new Map();
// The zone's UTC offset in minutes at an instant (local = UTC + offset).
export function offsetAt(zone, ms) {
  const minute = Math.floor(ms / 60_000);
  const key = `${zone}|${minute}`;
  let o = offCache.get(key);
  if (o !== undefined) return o;
  const p = {};
  for (const x of formatter(zone).formatToParts(new Date(minute * 60_000))) p[x.type] = x.value;
  const local = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  o = Math.round((local - minute * 60_000) / 60_000);
  if (offCache.size > 50_000) offCache.clear();
  offCache.set(key, o);
  return o;
}
// Wall-clock parts of an instant in a zone.
export function wallOf(zone, ms) {
  const o = offsetAt(zone, ms);
  const d = new Date(ms + o * 60_000);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours(), mi: d.getUTCMinutes(), s: d.getUTCSeconds(), wd: d.getUTCDay(), offset: o };
}
// The instants a wall-clock time names in a zone: none in a spring-forward gap, two in a repeated hour.
export function instantsOf(zone, y, m, d, h, mi, s = 0) {
  const t0 = Date.UTC(y, m - 1, d, h, mi, s);
  const offs = [...new Set([offsetAt(zone, t0 - 43_200_000), offsetAt(zone, t0), offsetAt(zone, t0 + 43_200_000)])];
  const out = [];
  for (const o of offs) {
    const t = t0 - o * 60_000;
    if (offsetAt(zone, t) === o && !out.includes(t)) out.push(t);
  }
  return out.sort((a, b) => a - b);
}
// The first instant at or after which the zone's offset is `after`, searching (lo, hi].
function changeBetween(zone, lo, hi) {
  const target = offsetAt(zone, hi);
  let a = Math.floor(lo / 60_000);
  let b = Math.ceil(hi / 60_000);
  while (b - a > 1) {
    const mid = Math.floor((a + b) / 2);
    if (offsetAt(zone, mid * 60_000) === target) b = mid; else a = mid;
  }
  return b * 60_000;
}
export const offsetText = (o) => `${o < 0 ? '-' : '+'}${pad(Math.floor(Math.abs(o) / 60))}:${pad(Math.abs(o) % 60)}`;
export function zoneAbbr(zone, ms) {
  const part = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' }).formatToParts(new Date(ms)).find((x) => x.type === 'timeZoneName');
  return part ? part.value : '';
}

// The clock changes in a zone during a calendar year: when, from which offset to which, and the
// wall-clock times skipped or repeated.
export function clockChanges(zone, year) {
  if (!isTimeZone(zone)) throw new CronError(`"${zone}" is not an IANA time zone name like America/New_York.`, 'timeZone');
  const out = [];
  const start = Date.UTC(year, 0, 1) - 14 * 3_600_000;
  const end = Date.UTC(year + 1, 0, 1) + 14 * 3_600_000;
  let prev = offsetAt(zone, start);
  for (let t = start + 3_600_000 * 6; t <= end; t += 3_600_000 * 6) {
    const o = offsetAt(zone, t);
    if (o === prev) continue;
    const at = changeBetween(zone, t - 3_600_000 * 6, t);
    const after = wallOf(zone, at);
    const localBefore = new Date(at + prev * 60_000);
    const w = { y: localBefore.getUTCFullYear(), m: localBefore.getUTCMonth() + 1, d: localBefore.getUTCDate() };
    if (w.y === year) {
      const diff = o - prev;
      const fromClock = `${pad(localBefore.getUTCHours())}:${pad(localBefore.getUTCMinutes())}`;
      const toClock = `${pad(after.h)}:${pad(after.mi)}`;
      out.push({
        date: isoDate(w.y, w.m, w.d),
        weekday: WEEKDAYS[weekdayOf(w.y, w.m, w.d)],
        at: new Date(at).toISOString().replace('.000Z', 'Z'),
        kind: diff > 0 ? 'forward' : 'back',
        minutes: Math.abs(diff),
        fromOffset: offsetText(prev),
        toOffset: offsetText(o),
        fromAbbr: zoneAbbr(zone, at - 60_000),
        toAbbr: zoneAbbr(zone, at),
        clocks: `${fromClock} becomes ${toClock}`,
        skipped: diff > 0 ? { from: toClockText(localBefore.getUTCHours(), localBefore.getUTCMinutes()), to: toClockText(after.h, after.mi) } : null,
        repeated: diff < 0 ? { from: toClockText(after.h, after.mi), to: toClockText(localBefore.getUTCHours(), localBefore.getUTCMinutes()) } : null,
      });
    }
    prev = o;
  }
  return out;
}
const toClockText = (h, m) => `${pad(h)}:${pad(m)}`;

// ---------- parsing ----------

function nameValue(tok, field) {
  const up = tok.toUpperCase();
  if (field === 'month') { const i = MON3.indexOf(up); return i < 0 ? null : i + 1; }
  if (field === 'dow') { const i = DOW3.indexOf(up); return i < 0 ? null : i; }
  return null;
}

// One number or name in a field, as the dialect writes it; day of week comes back as 0-6, Sunday 0.
function atom(tok, field, D, ctx) {
  const where = LABEL[field];
  if (/^[A-Za-z]{3}$/.test(tok)) {
    const v = nameValue(tok, field);
    if (v === null) throw new CronError(`${where}: "${tok}" is not a ${field === 'month' ? 'month' : field === 'dow' ? 'weekday' : 'value'} name.`, field);
    if (!D.names) throw new CronError(`${where}: ${D.name} does not take names like ${tok.toUpperCase()}; write the number.`, field);
    ctx.usedNames = true;
    return v;
  }
  if (!/^\d{1,4}$/.test(tok)) throw new CronError(`${where}: "${tok}" is not a number.`, field);
  let v = Number(tok);
  if (field === 'dow') {
    if (D.dowBase === 1) {
      if (v < 1 || v > 7) throw new CronError(`${where}: ${D.name} numbers weekdays 1 to 7 (1 = Sunday); "${tok}" is out of range.`, field);
      return v - 1;
    }
    if (v === 7 && D.seven7) return 0;
    if (v < 0 || v > 6) throw new CronError(`${where}: ${D.name} numbers weekdays 0 to 6 (0 = Sunday)${D.seven7 ? ', and 7 is Sunday too' : ''}; "${tok}" is out of range.`, field);
    return v;
  }
  const [lo, hi] = field === 'year' ? [1970, D.yearMax ?? 2199] : RANGE[field];
  if (v < lo || v > hi) throw new CronError(`${where}: ${v} is out of range (${lo} to ${hi}).`, field);
  return v;
}

const spanOf = (field, D) => (field === 'year' ? [1970, D.yearMax ?? 2199] : RANGE[field]);
function rangeValues(a, b, step, field, D) {
  const [lo, hi] = spanOf(field, D);
  const out = [];
  if (a <= b) for (let v = a; v <= b; v += step) out.push(v);
  else {
    // An overflowing range (Quartz): 22-2 is 22, 23, 0, 1, 2.
    const size = hi - lo + 1;
    for (let i = 0; i <= (b - a + size) % size; i += step) out.push(lo + ((a - lo + i) % size));
  }
  return out;
}

// Parses one field into { values (Set), all, star, question, specials, text }.
function parseField(text, field, D, ctx) {
  const where = LABEL[field];
  const res = { text, values: new Set(), all: false, star: text.startsWith('*'), question: false, specials: [] };
  if (text === '?') {
    if (!D.question || !['dom', 'dow'].includes(field)) throw new CronError(`${where}: ${D.name} does not use "?"${D.question ? ' in this field' : ''}; write *.`, field);
    res.question = true;
    res.all = true;
    for (let v = field === 'dow' ? 0 : 1; v <= (field === 'dow' ? 6 : 31); v++) res.values.add(v);
    return res;
  }
  const items = text.split(',');
  if (items.some((x) => x === '')) throw new CronError(`${where}: "${text}" has an empty list item.`, field);
  const [lo, hi] = spanOf(field, D);
  for (const item of items) {
    // Day specials: L, L-3, LW, 15W (day of month); 6L, FRIL, 6#3 (day of week).
    const S = D.specials;
    if (field === 'dom' && /[LW]/i.test(item)) {
      if (!S) throw new CronError(`${where}: ${D.name} has no L or W; use one of the dialects that do (Quartz, Spring, UiPath, AWS EventBridge).`, field);
      if (items.length > 1) throw new CronError(`${where}: L and W cannot be part of a list.`, field);
      let m;
      if (/^L$/i.test(item)) res.specials.push({ kind: 'last', offset: 0 });
      else if ((m = /^L-(\d{1,2})$/i.exec(item))) {
        if (!S.Lminus) throw new CronError(`${where}: ${D.name}'s docs do not list L-n (days before the last); write L for the last day.`, field);
        if (+m[1] > 30) throw new CronError(`${where}: L-${m[1]} is more days back than any month has.`, field);
        res.specials.push({ kind: 'last', offset: +m[1] });
      } else if (/^LW$/i.test(item)) {
        if (!S.LW) throw new CronError(`${where}: ${D.name}'s docs do not list LW (last weekday of the month).`, field);
        res.specials.push({ kind: 'lastWeekday' });
      } else if ((m = /^(\d{1,2})W$/i.exec(item))) {
        if (!S.W) throw new CronError(`${where}: ${D.name} has no W.`, field);
        const n = +m[1];
        if (n < 1 || n > 31) throw new CronError(`${where}: ${n}W must name a day from 1 to 31.`, field);
        res.specials.push({ kind: 'nearestWeekday', day: n });
      } else throw new CronError(`${where}: "${item}" is not a value ${D.name} understands.`, field);
      continue;
    }
    if (field === 'dow' && /[L#]/i.test(item) && !/^[A-Za-z]{3}$/.test(item)) {
      if (!S) throw new CronError(`${where}: ${D.name} has no L or #; use one of the dialects that do (Quartz, Spring, UiPath, AWS EventBridge).`, field);
      let m;
      if (/^L$/i.test(item)) {
        if (S.bareL === null) throw new CronError(`${where}: ${D.name}'s docs do not say which day a bare L means in the day-of-week field; write the day, like SAT.`, field);
        if (items.length > 1) throw new CronError(`${where}: L cannot be part of a list.`, field);
        res.values.add(S.bareL - 1);
        continue;
      }
      if ((m = /^([A-Za-z]{3}|\d)L$/i.exec(item))) {
        if (items.length > 1) throw new CronError(`${where}: nL (the last given weekday) cannot be part of a list.`, field);
        res.specials.push({ kind: 'lastDow', dow: atom(m[1], 'dow', D, ctx) });
        continue;
      }
      if ((m = /^([A-Za-z]{3}|\d)#(\d)$/i.exec(item))) {
        if (items.length > 1) throw new CronError(`${where}: with #, the field can hold only one expression (for example "3#1,6#3" is not valid).`, field);
        const k = +m[2];
        if (k < 1 || k > 5) throw new CronError(`${where}: #${k} must be 1 to 5 (the first to the fifth such weekday).`, field);
        res.specials.push({ kind: 'nthDow', dow: atom(m[1], 'dow', D, ctx), nth: k });
        continue;
      }
      throw new CronError(`${where}: "${item}" is not a value ${D.name} understands.`, field);
    }
    let base = item;
    let step = null;
    const slash = item.split('/');
    if (slash.length > 2) throw new CronError(`${where}: "${item}" has two steps.`, field);
    if (slash.length === 2) {
      base = slash[0];
      if (!/^\d{1,4}$/.test(slash[1]) || +slash[1] < 1) throw new CronError(`${where}: the step in "${item}" must be a whole number from 1.`, field);
      step = +slash[1];
      if (field === 'dow' && S && S.noDowStep) throw new CronError(`${where}: ${D.name} does not allow / in the day-of-week field.`, field);
      if (step > hi - lo + 1 && field !== 'year') throw new CronError(`${where}: a step of ${step} is larger than the field (${lo} to ${hi}).`, field);
    }
    if (base === '*' || (base === '?' && D.question === 'any')) {
      if (step === null) res.all = true;
      for (const v of rangeValues(field === 'dow' ? 0 : lo, field === 'dow' ? 6 : hi, step ?? 1, field, D)) res.values.add(v);
      if (step !== null) ctx.steps.push({ field, start: lo, step });
      continue;
    }
    const dash = base.split('-');
    if (dash.length > 2) throw new CronError(`${where}: "${base}" is not a range.`, field);
    if (dash.length === 2) {
      if (D.names === 'single' && (/[A-Za-z]/.test(dash[0]) || /[A-Za-z]/.test(dash[1]))) ctx.warnings.push(`${where}: Debian's crontab(5) says ranges or lists of names are not allowed; write the numbers to be safe.`);
      const a = atom(dash[0], field, D, ctx);
      let b = atom(dash[1], field, D, ctx);
      // In a 0-based day of week, 7 (Sunday) can end a range: 5-7 is Friday to Sunday.
      if (field === 'dow' && D.seven7 && dash[1] === '7') b = 7;
      if (a > b) {
        if (!D.overflow) throw new CronError(`${where}: the range ${base} runs backwards; ${D.name} needs the smaller number first.`, field);
        ctx.warnings.push(`${where}: ${base} wraps around; Quartz supports this but warns that overflowing ranges can be read in more than one way.`);
      }
      for (const v of (field === 'dow' && b === 7 ? [...rangeValues(a, 6, step ?? 1, field, D), ...((7 - a) % (step ?? 1) === 0 ? [0] : [])] : rangeValues(a, b, step ?? 1, field, D))) res.values.add(field === 'dow' ? ((v % 7) + 7) % 7 : v);
      if (step !== null) ctx.steps.push({ field, start: a, step });
      continue;
    }
    const v = atom(base, field, D, ctx);
    if (step !== null) {
      if (!D.startStep) throw new CronError(`${where}: in ${D.name} a step follows a range or *; write ${base}-${field === 'dow' ? 6 : hi}/${step}.`, field);
      for (const x of rangeValues(v, field === 'dow' ? (D.dowBase ? 6 : 6) : hi, step, field, D)) res.values.add(x);
      ctx.steps.push({ field, start: v, step });
      continue;
    }
    if (items.length > 1 && D.names === 'single' && /[A-Za-z]/.test(base)) ctx.warnings.push(`${where}: Debian's crontab(5) says ranges or lists of names are not allowed; write the numbers to be safe.`);
    res.values.add(v);
  }
  if (res.specials.length && res.values.size) throw new CronError(`${where}: do not mix L, W or # with other values.`, field);
  return res;
}

// Parses an expression in a dialect. Returns the fields, the dialect, and warnings.
export function parse(expression, dialect = 'vixie') {
  const D = DIALECTS[dialect];
  if (!D) throw new CronError(`Dialect must be one of ${DIALECT_IDS.join(', ')}.`, 'dialect');
  let text = String(expression ?? '').trim().replace(/\s+/g, ' ');
  if (!text) throw new CronError('Write a cron expression, like */5 * * * *.');
  if (text.length > LIMITS.expression) throw new CronError(`A cron expression is at most ${LIMITS.expression} characters.`);
  const ctx = { warnings: [], steps: [], usedNames: false };
  let macro = null;
  if (D.wrap === 'cron') {
    const m = /^cron\((.*)\)$/i.exec(text);
    if (m) text = m[1].trim();
    else if (/^(rate|at)\(/i.test(text)) throw new CronError('This checks cron(...) schedules; rate(...) and at(...) are not cron expressions.');
  }
  if (/^(CRON_TZ|TZ)=/i.test(text)) {
    throw new CronError(dialect === 'kubernetes'
      ? 'Kubernetes refuses CRON_TZ or TZ inside .spec.schedule; set .spec.timeZone instead, and pick the time zone here.'
      : `Put the time zone in the time zone box, not in the expression; ${D.name}: ${D.zone.how}`);
  }
  if (text.startsWith('@')) {
    const key = text.toLowerCase();
    if (key === '@reboot') throw new CronError(D.reboot ? '@reboot runs once when the cron daemon starts; it has no schedule to list.' : `${D.name} has no @reboot.`);
    if (!D.macros) throw new CronError(D.macrosRefused);
    if (!D.macros[key]) throw new CronError(`${text} is not one of ${D.name}'s strings (${Object.keys(D.macros).join(', ')}).`);
    macro = key;
    text = D.macros[key];
  }
  if (/[^\w*?,\-/#\s]/.test(text)) throw new CronError(`"${text}" has characters a cron expression does not use.`);
  let parts = text.split(' ');
  let names = D.fields;
  const n = parts.length;
  if (D.optional === 'second' && n === names.length - 1) { parts = ['0', ...parts]; ctx.secondsAdded = true; }
  else if (D.optional === 'year' && n === names.length - 1) { parts = [...parts, '*']; }
  if (parts.length !== names.length) {
    const want = D.optional === 'second' ? `${names.length - 1} or ${names.length} (with seconds first)` : D.optional === 'year' ? `${names.length - 1} or ${names.length} (with a year last)` : `${names.length}`;
    const hint = n === 5 && names.length >= 6 ? ` It looks like a 5-field crontab line; ${D.name} needs ${names[0] === 'second' ? 'a seconds field first' : 'a year field last'}.` : n === 6 && names.length === 5 ? ' It looks like it has a seconds or year field; this dialect has 5 fields.' : '';
    throw new CronError(`${D.name} expressions have ${want} fields; this one has ${n}.${hint}`);
  }
  const f = {};
  names.forEach((name, i) => { f[name] = parseField(parts[i], name, D, ctx); });
  if (!f.second) f.second = { text: null, values: new Set([0]), all: false, star: false, question: false, specials: [] };
  if (!f.year) f.year = { text: null, values: new Set(), all: true, star: true, question: false, specials: [] };
  // How the two day fields combine.
  const domFree = f.dom.all && !f.dom.specials.length;
  const dowFree = f.dow.all && !f.dow.specials.length;
  let days;
  if (D.dayRule === 'question') {
    if (f.dom.question === f.dow.question) {
      throw new CronError(f.dom.question
        ? `Only one of day of month and day of week may be "?" in ${D.name}.`
        : `${D.name} needs "?" in day of month or day of week (put ? in the one you do not use, for example ${dialect === 'aws' ? 'cron(0 12 * * ? *)' : '0 0 12 * * ?'}).`, 'expression');
    }
    days = f.dom.question ? 'dow' : 'dom';
  } else if (D.dayRule === 'one-star') {
    if (!domFree && !dowFree) throw new CronError(`${D.name} cannot set both day of month and day of week; when one has a value, the other must be *.`);
    days = domFree && dowFree ? 'any' : domFree ? 'dow' : 'dom';
  } else if (D.dayRule === 'star-prefix') {
    // Debian crontab(5): OR when both are restricted, where "restricted" means the field does not
    // start with * (so */2 counts as unrestricted).
    const domStar = f.dom.star;
    const dowStar = f.dow.star;
    if (domStar && dowStar) days = 'and';
    else if (domStar || dowStar) {
      days = 'and';
      if ((domStar && !domFree) || (dowStar && !dowFree)) ctx.warnings.push(`A day field starts with * (${domStar ? f.dom.text : f.dow.text}), so Debian cron matches days where both fields match; POSIX and most other schedulers would run on either.`);
    } else days = 'or';
  } else {
    // POSIX: both must match when either is * (or ?); otherwise either may match.
    const domAny = f.dom.text === '*' || f.dom.question || (D.question === 'any' && f.dom.text === '?');
    const dowAny = f.dow.text === '*' || f.dow.question || (D.question === 'any' && f.dow.text === '?');
    days = domAny || dowAny ? 'and' : 'or';
    if (days === 'or') {
      if (f.dom.star || f.dow.star) ctx.warnings.push(`A day field starts with * (${f.dom.star ? f.dom.text : f.dow.text}); ${D.name} documents the POSIX rule, under which this runs on days matching either field, but Debian cron would need both. Schedulers disagree here.`);
      if (dialect === 'spring' || dialect === 'uipath') ctx.warnings.push(`${D.name}'s docs do not say how a day of month and a day of week combine when both are set; this shows days matching either, the common cron convention. Put ? in one of them to be sure.`);
    }
  }
  const parsed = { dialect, expression: String(expression).trim(), macro, fields: f, days, warnings: ctx.warnings, steps: ctx.steps, secondsAdded: !!ctx.secondsAdded, usedNames: ctx.usedNames };
  // Platform limits.
  const gap = minGapSeconds(parsed);
  if (D.minMinutes && gap !== null && gap < D.minMinutes * 60) ctx.warnings.push(`GitHub Actions runs a schedule at most once every ${D.minMinutes} minutes; this asks for runs ${gapText(gap)} apart.`);
  if (dialect === 'vercel' && runsPerDay(parsed) > 1) ctx.warnings.push('Vercel Hobby accounts are limited to cron jobs that run once a day; this would fail to deploy on Hobby (Pro and Enterprise allow once a minute).');
  if (dialect === 'github' && f.minute.values.size === 1 && f.minute.values.has(0)) ctx.warnings.push('GitHub says the start of every hour is a high-load time when scheduled runs can be delayed or dropped; a minute other than 0 is less likely to be late.');
  return parsed;
}

const gapText = (s) => (s % 60 === 0 ? `${s / 60} minute${s === 60 ? '' : 's'}` : `${s} seconds`);
// The shortest gap between two runs, in seconds, if every day matched (null for one run a day).
export function minGapSeconds(p) {
  const f = p.fields;
  const times = [];
  for (const h of f.hour.values) for (const m of f.minute.values) for (const s of f.second.values) times.push(h * 3600 + m * 60 + s);
  if (times.length < 2) return null;
  times.sort((x, y) => x - y);
  let best = 86_400 - times[times.length - 1] + times[0];
  for (let i = 1; i < times.length; i++) best = Math.min(best, times[i] - times[i - 1]);
  return best;
}
export const runsPerDay = (p) => p.fields.second.values.size * p.fields.minute.values.size * p.fields.hour.values.size;

// ---------- matching ----------

function domMatches(F, y, m, d) {
  if (!F.specials.length) return F.values.has(d);
  const last = daysIn(y, m);
  return F.specials.some((s) => {
    if (s.kind === 'last') return d === last - s.offset;
    if (s.kind === 'lastWeekday') {
      let x = last;
      while ([0, 6].includes(weekdayOf(y, m, x))) x--;
      return d === x;
    }
    if (s.kind === 'nearestWeekday') {
      // The weekday nearest the day, never crossing into another month (Quartz tutorial).
      const n = Math.min(s.day, last);
      const wd = weekdayOf(y, m, n);
      let x = n;
      if (wd === 6) x = n === 1 ? 3 : n - 1;
      else if (wd === 0) x = n === last ? n - 2 : n + 1;
      return s.day <= last && d === x;
    }
    return false;
  });
}
function dowMatches(F, y, m, d) {
  const wd = weekdayOf(y, m, d);
  if (!F.specials.length) return F.values.has(wd);
  return F.specials.some((s) => {
    if (s.kind === 'lastDow') return wd === s.dow && d + 7 > daysIn(y, m);
    if (s.kind === 'nthDow') return wd === s.dow && Math.ceil(d / 7) === s.nth;
    return false;
  });
}
export function dayMatches(p, y, m, d) {
  const f = p.fields;
  if (!f.month.values.has(m)) return false;
  if (!f.year.all && !f.year.values.has(y)) return false;
  if (p.days === 'dom') return domMatches(f.dom, y, m, d);
  if (p.days === 'dow') return dowMatches(f.dow, y, m, d);
  if (p.days === 'any') return true;
  const a = domMatches(f.dom, y, m, d);
  const b = dowMatches(f.dow, y, m, d);
  return p.days === 'or' ? a || b : a && b;
}

// Debian cron(8): only jobs at a particular time are moved at a clock change; those with * in the
// hour or minute field (or @hourly) run on the new time.
const isWildcard = (p) => p.macro === '@hourly' || (p.fields.minute.text ?? '').includes('*') || (p.fields.hour.text ?? '').includes('*');

// ---------- next runs ----------

// The next `count` runs after `from` (a Date) in `zone`, each { at, local, date, time, weekday,
// offset, abbr, note?, scheduled? }. The clock-change behaviour is the dialect's documented one.
export function nextRuns(p, zone, from, count = 10) {
  const D = DIALECTS[p.dialect];
  const fromMs = from.getTime();
  const runs = [];
  const seen = new Set();
  const start = wallOf(zone, fromMs - 86_400_000);
  const day = new Date(Date.UTC(start.y, start.m - 1, start.d));
  const maxYear = p.fields.year.all ? start.y + LIMITS.scanYears : Math.max(...p.fields.year.values);
  const minYear = p.fields.year.all ? 0 : Math.min(...p.fields.year.values);
  if (!p.fields.year.all && maxYear < start.y) return { runs, exhausted: true };
  if (minYear > start.y + 1) day.setUTCFullYear(minYear, 0, 1);
  const hours = [...p.fields.hour.values].sort((a, b) => a - b);
  const mins = [...p.fields.minute.values].sort((a, b) => a - b);
  const secs = [...p.fields.second.values].sort((a, b) => a - b);
  const wild = isWildcard(p);
  const push = (t, scheduled, note, extra = {}) => {
    if (t <= fromMs || seen.has(t)) return;
    seen.add(t);
    real++;
    runs.push({ t, scheduled, note, ...extra });
  };
  let real = 0;
  while (real < count) {
    const y = day.getUTCFullYear();
    const m = day.getUTCMonth() + 1;
    const d = day.getUTCDate();
    if (y > maxYear) return { runs: finish(runs, zone, count, secs.length > 1 || secs[0] !== 0), exhausted: true };
    if (dayMatches(p, y, m, d)) {
      for (const h of hours) {
        const before = runs.length;
        for (const mi of mins) {
          for (const s of secs) {
            const wall = `${isoDate(y, m, d)} ${pad(h)}:${pad(mi)}${secs.length > 1 || s ? `:${pad(s)}` : ''}`;
            const at = instantsOf(zone, y, m, d, h, mi, s);
            if (at.length === 1) { push(at[0], wall, null); continue; }
            if (at.length === 0) {
              const t0 = Date.UTC(y, m - 1, d, h, mi, s);
              const change = changeBetween(zone, t0 - 43_200_000, t0 + 43_200_000);
              const rule = D.dst.gap === 'vixie' ? (wild ? 'omit' : 'catch-up') : D.dst.gap;
              if (rule === 'omit') continue;
              if (rule === 'skip') runs.push({ t: null, scheduled: wall, note: 'gap-skipped', skippedAt: change });
              else if (rule === 'advance') push(change, wall, 'gap-advanced');
              else if (rule === 'catch-up') push(change, wall, 'gap-catch-up');
              else push(change, wall, 'gap-unknown');
              continue;
            }
            const rule = D.dst.repeat === 'vixie' ? (wild ? 'twice' : 'once') : D.dst.repeat;
            if (rule === 'twice') { push(at[0], wall, 'repeat-first'); push(at[1], wall, 'repeat-second'); }
            else if (rule === 'once') push(at[0], wall, 'repeat-once', { notAt: at[1] });
            else push(at[0], wall, 'repeat-unknown', { mayAlsoRun: at[1] });
          }
          if (runs.length - before > count * 2) break;
        }
        if (real >= count) break;
      }
    }
    day.setUTCDate(day.getUTCDate() + 1);
  }
  return { runs: finish(runs, zone, count, secs.length > 1 || secs[0] !== 0), exhausted: false };
}
function finish(runs, zone, count, withSeconds = false) {
  const real = runs.filter((r) => r.t !== null).sort((a, b) => a.t - b.t).slice(0, count);
  const lastT = real.length ? real[real.length - 1].t : Infinity;
  const skipped = runs.filter((r) => r.t === null && r.skippedAt <= lastT);
  return [...real, ...skipped].sort((a, b) => (a.t ?? a.skippedAt) - (b.t ?? b.skippedAt)).map((r) => describeRun(r, zone, withSeconds));
}
const NOTES = {
  'gap-skipped': (r) => `${r.scheduled} does not exist in this time zone (the clocks go forward), so this run is skipped.`,
  'gap-advanced': (r) => `${r.scheduled} does not exist (the clocks go forward); GitHub advances it to the next valid time.`,
  'gap-catch-up': (r) => `${r.scheduled} does not exist (the clocks go forward); cron runs it soon after the change.`,
  'gap-unknown': (r) => `${r.scheduled} does not exist (the clocks go forward); this scheduler's docs do not say whether it runs soon after or is skipped.`,
  'repeat-first': () => 'The clocks go back and this time happens twice; a wildcard job runs both times.',
  'repeat-second': () => 'The second time this clock time happens (the clocks went back).',
  'repeat-once': () => 'The clocks go back and this time happens twice; it runs only the first time.',
  'repeat-unknown': () => 'The clocks go back and this time happens twice; this scheduler\'s docs do not say whether it runs again an hour later.',
};
function describeRun(r, zone, withSeconds) {
  const t = r.t ?? r.skippedAt;
  const w = wallOf(zone, t);
  const out = {
    at: r.t === null ? null : new Date(t).toISOString().replace('.000Z', 'Z'),
    local: r.t === null ? r.scheduled : `${isoDate(w.y, w.m, w.d)} ${pad(w.h)}:${pad(w.mi)}${w.s || withSeconds ? `:${pad(w.s)}` : ''}`,
    weekday: WEEKDAYS[w.wd],
    offset: offsetText(w.offset),
    abbr: zoneAbbr(zone, t),
  };
  if (r.t !== null && r.scheduled && !r.scheduled.startsWith(out.local)) out.scheduled = r.scheduled;
  if (r.note) {
    out.dst = r.note;
    out.note = NOTES[r.note](r);
    if (r.notAt) out.notAt = new Date(r.notAt).toISOString().replace('.000Z', 'Z');
    if (r.mayAlsoRun) out.mayAlsoRun = new Date(r.mayAlsoRun).toISOString().replace('.000Z', 'Z');
  }
  return out;
}

// ---------- plain English ----------

const ORD = (n) => `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
const andList = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
export const clock12 = (h, m) => `${h % 12 === 0 ? 12 : h % 12}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`;
const clock24 = (h, m, s = null) => `${pad(h)}:${pad(m)}${s ? `:${pad(s)}` : ''}`;

// Consecutive runs of numbers as "a through b" pieces.
function runsOf(values) {
  const v = [...values].sort((a, b) => a - b);
  const out = [];
  for (let i = 0; i < v.length;) {
    let j = i;
    while (j + 1 < v.length && v[j + 1] === v[j] + 1) j++;
    if (j - i >= 2) out.push([v[i], v[j]]);
    else for (let k = i; k <= j; k++) out.push([v[k]]);
    i = j + 1;
  }
  return out;
}
const listWords = (values, word) => andList(runsOf(values).map((r) => (r.length === 2 ? `${word(r[0])} through ${word(r[1])}` : word(r[0]))));

// "every 5", if the values are an even step through the whole field.
function stepOf(values, lo, hi) {
  const v = [...values].sort((a, b) => a - b);
  if (v.length < 2) return null;
  const s = v[1] - v[0];
  for (let i = 2; i < v.length; i++) if (v[i] - v[i - 1] !== s) return null;
  if (v[v.length - 1] + s <= hi) return null;
  return { start: v[0], step: s };
}

function timePhrase(f) {
  const S = f.second.values;
  const M = f.minute.values;
  const H = f.hour.values;
  const sorted = (x) => [...x].sort((a, b) => a - b);
  // Fixed times of day.
  if (H.size < 24 && M.size * H.size * S.size <= 6) {
    const times = [];
    for (const h of sorted(H)) for (const m of sorted(M)) for (const s of sorted(S)) times.push(clock24(h, m, s));
    return `at ${andList(times)}`;
  }
  let sec = '';
  if (S.size === 60) sec = 'every second';
  else if (S.size > 1) { const st = stepOf(S, 0, 59); sec = st ? `every ${st.step} seconds${st.start ? ` from second ${st.start}` : ''}` : `at seconds ${listWords(S, String)}`; }
  else if (!S.has(0)) sec = `at second ${[...S][0]}`;
  let min = '';
  if (M.size === 60) min = sec ? '' : 'every minute';
  else if (M.size === 1) min = `${sec ? 'during' : 'at'} minute ${[...M][0]}`;
  else {
    const st = stepOf(M, 0, 59);
    min = st ? `every ${st.step} minutes${st.start ? ` from minute ${st.start}` : ''}` : `at minutes ${listWords(M, String)}`;
    if (sec) min = `during ${min.replace(/^at /, '')}`;
  }
  let hr = '';
  if (H.size === 24) hr = M.size === 1 && !sec ? 'past every hour' : '';
  else {
    const st = stepOf(H, 0, 23);
    if (st && H.size > 2) hr = `past every ${ORD(st.step)} hour${st.start ? ` from ${clock24(st.start, 0)}` : ''}`;
    else hr = `${M.size === 1 && !sec ? 'past the hours' : 'from'} ${andList(runsOf(H).map((r) => (r.length === 2 ? `${clock24(r[0], 0)} through ${clock24(r[1], 59)}` : M.size === 1 && !sec ? clock24(r[0], 0) : `${clock24(r[0], 0)} through ${clock24(r[0], 59)}`)))}`;
  }
  return [sec, min, hr].filter(Boolean).join(' ');
}

function domPhrase(F) {
  if (F.specials.length) {
    const s = F.specials[0];
    if (s.kind === 'last') return s.offset ? `on the ${ORD(s.offset)} day before the last day of the month` : 'on the last day of the month';
    if (s.kind === 'lastWeekday') return 'on the last weekday (Monday to Friday) of the month';
    if (s.kind === 'nearestWeekday') return `on the weekday (Monday to Friday) nearest the ${ORD(s.day)} of the month`;
  }
  const st = stepOf(F.values, 1, 31);
  if (st && F.values.size > 2) return `every ${ORD(st.step)} day of the month from the ${ORD(st.start)}`;
  return `on the ${listWords(F.values, ORD)} of the month`;
}
function dowPhrase(F) {
  if (F.specials.length) {
    const s = F.specials[0];
    if (s.kind === 'lastDow') return `on the last ${WEEKDAYS[s.dow]} of the month`;
    if (s.kind === 'nthDow') return `on the ${['first', 'second', 'third', 'fourth', 'fifth'][s.nth - 1]} ${WEEKDAYS[s.dow]} of the month`;
  }
  const v = [...F.values].sort((a, b) => a - b);
  if (v.join() === '1,2,3,4,5') return 'on weekdays (Monday to Friday)';
  if (v.join() === '0,6') return 'on Saturdays and Sundays';
  return `on ${listWords(v, (d) => WEEKDAYS[d])}`;
}
function monthPhrase(F) {
  if (F.values.size === 12) return '';
  const st = stepOf(F.values, 1, 12);
  if (st && F.values.size > 2) return `every ${st.step} months from ${MONTHS[st.start - 1]}`;
  return `in ${listWords(F.values, (m) => MONTHS[m - 1])}`;
}

const sortedDays = (v) => [...v].sort((a, b) => a - b);
// The schedule in one plain English sentence.
export function describe(p) {
  const f = p.fields;
  const parts = [timePhrase(f)];
  const domSet = !(f.dom.all && !f.dom.specials.length);
  const dowSet = !(f.dow.all && !f.dow.specials.length);
  if (p.days === 'dom' && domSet) parts.push(domPhrase(f.dom));
  else if (p.days === 'dow' && dowSet) parts.push(dowPhrase(f.dow));
  else if (p.days === 'or') parts.push(`${domPhrase(f.dom)}, and ${dowPhrase(f.dow)}`);
  else if (p.days === 'and') {
    if (domSet && dowSet) parts.push(`${domPhrase(f.dom)}, but only when that day is ${f.dow.specials.length ? dowPhrase(f.dow).replace(/^on /, '') : `a ${sortedDays(f.dow.values).map((d) => WEEKDAYS[d]).join(' or a ')}`}`);
    else if (domSet) parts.push(domPhrase(f.dom));
    else if (dowSet) parts.push(dowPhrase(f.dow));
  }
  const mp = monthPhrase(f.month);
  if (mp) parts.push(mp);
  if (!f.year.all) parts.push(`in ${listWords(f.year.values, String)}`);
  const s = parts.filter(Boolean).join(', ').replace(/\s+/g, ' ').trim();
  return `${s.charAt(0).toUpperCase()}${s.slice(1)}.`;
}

// ---------- writing a schedule in another dialect ----------

function compact(values, lo, hi, opts = {}) {
  const v = [...values].sort((a, b) => a - b);
  if (v.length === hi - lo + 1) return '*';
  const st = stepOf(values, lo, hi);
  // Two values a half apart read better as a step in the seconds and minutes fields (*/30).
  if (st && st.start === lo && v.length === 2 && hi === 59 && !opts.noStarStep) return `*/${st.step}`;
  if (st && v.length > 2) {
    if (st.start === lo && !opts.noStarStep) return `*/${st.step}`;
    if (opts.startStep) return `${st.start}/${st.step}`;
    return `${st.start}-${hi}/${st.step}`;
  }
  return runsOf(v).map((r) => (r.length === 2 ? `${r[0]}-${r[1]}` : String(r[0]))).join(',');
}
function dowText(values, T) {
  const days = [...values].sort((a, b) => a - b);
  if (days.length === 7) return '*';
  const shifted = days.map((d) => d + T.dowBase);
  return runsOf(shifted).map((r) => (r.length === 2 ? `${r[0]}-${r[1]}` : String(r[0]))).join(',');
}
function specialText(F, field, T) {
  const s = F.specials[0];
  const S = T.specials;
  const fail = (what) => { throw new CronError(`${T.name} has no ${what}.`); };
  if (!S) fail(field === 'dom' ? 'L or W in the day of month' : 'L or # in the day of week');
  if (s.kind === 'last') { if (s.offset && !S.Lminus) fail('L-n (days before the last) in its docs'); return s.offset ? `L-${s.offset}` : 'L'; }
  if (s.kind === 'lastWeekday') { if (!S.LW) fail('LW (last weekday) in its docs'); return 'LW'; }
  if (s.kind === 'nearestWeekday') return `${s.day}W`;
  if (s.kind === 'lastDow') return `${s.dow + T.dowBase}L`;
  if (s.kind === 'nthDow') return `${s.dow + T.dowBase}#${s.nth}`;
  return fail('this');
}

// The same schedule in dialect `to`: { expressions: [..], note? } or { error }.
export function convert(p, to) {
  const T = DIALECTS[to];
  const f = p.fields;
  try {
    const secAll = f.second.values.size === 1 && f.second.values.has(0);
    if (!T.fields.includes('second') && !secAll) throw new CronError(`${T.name} has no seconds field, and this runs at second${f.second.values.size > 1 ? 's' : ''} ${listWords(f.second.values, String)}.`);
    if (!T.fields.includes('year') && !f.year.all) throw new CronError(`${T.name} has no year field, and this is limited to ${listWords(f.year.values, String)}.`);
    if (!f.year.all && T.yearMax && Math.max(...f.year.values) > T.yearMax) throw new CronError(`${T.name} years end at ${T.yearMax}.`);
    const opts = { startStep: T.startStep, noStarStep: to === 'aws' };
    const domFree = f.dom.all && !f.dom.specials.length;
    const dowFree = f.dow.all && !f.dow.specials.length;
    const sec = T.fields.includes('second') ? compact(f.second.values, 0, 59, opts) : null;
    const minute = compact(f.minute.values, 0, 59, opts);
    const hour = compact(f.hour.values, 0, 23, opts);
    const month = compact(f.month.values, 1, 12, opts);
    const year = T.fields.includes('year') ? (f.year.all ? (to === 'aws' ? '*' : null) : compact(f.year.values, 1970, T.yearMax ?? 2199, opts)) : null;
    const domT = f.dom.specials.length ? specialText(f.dom, 'dom', T) : compact(f.dom.values, 1, 31, { ...opts, noStarStep: !dowFree });
    const dowT = f.dow.specials.length ? specialText(f.dow, 'dow', T) : dowText(f.dow.values, T);
    const wantQ = T.question === 'required' || to === 'uipath';
    const free = (x) => (wantQ ? '?' : x);
    const build = (dom, dow) => [sec, minute, hour, dom, month, dow, year].filter((x) => x !== null).join(' ');
    // Which days: one of the fields, or both (either matches), or both (each must match).
    let pairs;
    const sem = p.days === 'and' && !domFree && !dowFree ? 'and' : p.days === 'or' ? 'or' : domFree && dowFree ? 'any' : domFree ? 'dow' : 'dom';
    if (sem === 'and' && T.dayRule === 'star-prefix') {
      // Debian cron needs both fields when one starts with *: keep that field's leading *.
      const domStar = compact(f.dom.values, 1, 31, { noStarStep: false });
      const dowStar = f.dow.star && dowT !== '*' && f.dow.values.size ? `*/${stepOf(f.dow.values, 0, 6)?.step ?? 1}` : null;
      if (p.fields.dom.star && domStar.startsWith('*')) return { expressions: [build(domStar, dowT)] };
      if (p.fields.dow.star && dowStar && stepOf(f.dow.values, 0, 6)?.start === 0) return { expressions: [build(domT, dowStar)] };
    }
    if (sem === 'and') throw new CronError(`No ${T.name} expression runs only on days matching both fields (${p.fields.dom.text} and ${p.fields.dow.text}); run it ${domPhrase(f.dom).replace(/^on /, 'on ')} and check the weekday inside the job.`);
    if (sem === 'any') pairs = [[wantQ ? '*' : '*', wantQ ? '?' : '*']];
    else if (sem === 'dom') pairs = [[domT, free('*')]];
    else if (sem === 'dow') pairs = [[free('*'), dowT]];
    else if (['question', 'one-star'].includes(T.dayRule)) pairs = [[domT, free('*')], [free('*'), dowT]];
    else {
      // Both set, either matches. A field written with a leading * would change meaning in Debian
      // cron (it would then need both), so write the values out.
      pairs = [[domT.startsWith('*') ? compact(f.dom.values, 1, 31, { noStarStep: true }) : domT, dowT === '*' ? '0-6' : dowT]];
      if (to === 'spring' || to === 'uipath') return { expressions: pairs.map(([a, b]) => build(a, b)), note: `${T.name}'s docs do not say how both day fields combine; to be sure, use two schedules: ${build(domT, '?')} and ${build('?', dowT)}.` };
    }
    if (to === 'n8n' && secAll) {
      // n8n's seconds field is optional; leave it out when it is 0.
      return { expressions: pairs.map(([a, b]) => build(a, b).replace(/^0 /, '')), ...(pairs.length > 1 ? { note: 'Two schedules: n8n can hold several trigger rules in one Schedule Trigger.' } : {}) };
    }
    const exprs = pairs.map(([a, b]) => build(a, b));
    const out = { expressions: to === 'aws' ? exprs.map((e) => `cron(${e})`) : exprs };
    if (pairs.length > 1) out.note = `${T.name} cannot match a day of month or a day of week in one expression, so this needs two schedules.`;
    return out;
  } catch (e) {
    if (e instanceof CronError) return { error: e.message };
    throw e;
  }
}

// A copy-ready snippet for the platform, with the time zone where the platform takes one.
export function snippet(to, expression, zone) {
  const z = zone && zone !== 'UTC' ? zone : null;
  if (to === 'vixie') return `${expression} /path/to/command`;
  if (to === 'github') return `on:\n  schedule:\n    - cron: '${expression}'${z ? `\n      timezone: "${z}"` : ''}`;
  if (to === 'kubernetes') return `spec:\n  schedule: "${expression}"${zone ? `\n  timeZone: "${zone === 'UTC' ? 'Etc/UTC' : zone}"` : ''}`;
  if (to === 'vercel') return `{\n  "crons": [\n    { "path": "/api/cron", "schedule": "${expression}" }\n  ]\n}`;
  if (to === 'aws') return `aws scheduler create-schedule --schedule-expression "${expression}"${zone ? ` --schedule-expression-timezone "${zone}"` : ''} ...`;
  if (to === 'spring') return `@Scheduled(cron = "${expression}"${z ? `, zone = "${z}"` : ''})`;
  if (to === 'quartz') return `CronScheduleBuilder.cronSchedule("${expression}")`;
  if (to === 'n8n') return `Schedule Trigger > Trigger Interval: Custom (Cron) > Expression: ${expression}${z ? ` (workflow settings > Timezone: ${z})` : ''}`;
  if (to === 'uipath') return `Time trigger > Advanced (cron expression): ${expression}${z ? ` (trigger time zone: ${z})` : ''}`;
  return expression;
}

// ---------- the answers ----------

function zoneFor(D, timeZone) {
  const notes = [];
  let zone = timeZone ? canonicalZone(timeZone) : 'UTC';
  if (D.zone.fixed && zone !== D.zone.fixed) {
    notes.push(`${D.name} always runs in ${D.zone.fixed}, so the runs are shown in ${D.zone.fixed}, not ${zone}.`);
    zone = D.zone.fixed;
  } else if (!timeZone && D.zone.default !== 'UTC') notes.push(`${D.name} runs in ${D.zone.default}; no time zone was given, so the runs are shown in UTC.`);
  return { zone, notes };
}

// Explain an expression: fields, a sentence, next runs, warnings and every other dialect.
export function explain({ expression, dialect = 'vixie', timeZone, from, count = 10 }, now = new Date()) {
  if (timeZone !== undefined && !isTimeZone(timeZone)) throw new CronError(`"${timeZone}" is not an IANA time zone name like America/New_York.`, 'timeZone');
  const p = parse(expression, dialect);
  const D = DIALECTS[dialect];
  const { zone, notes } = zoneFor(D, timeZone);
  const start = from ? new Date(from) : now;
  if (Number.isNaN(start.getTime())) throw new CronError('from must be a date and time like 2026-11-08T09:00:00Z.', 'from');
  const n = Math.min(Math.max(1, count | 0), LIMITS.count);
  const { runs, exhausted } = nextRuns(p, zone, start, n);
  const conversions = {};
  for (const id of DIALECT_IDS) {
    const c = convert(p, id);
    if (c.error) conversions[id] = { name: DIALECTS[id].name, error: c.error };
    else conversions[id] = { name: DIALECTS[id].name, expressions: c.expressions, ...(c.note ? { note: c.note } : {}), snippet: c.expressions.map((e) => snippet(id, e, DIALECTS[id].zone.fixed ? null : zone)).join('\n\n') };
  }
  const fields = p.fields;
  return {
    expression: p.expression,
    dialect,
    dialectName: D.name,
    description: describe(p),
    fields: D.fields.map((name) => ({ field: name, label: LABEL[name], text: fields[name].text ?? (name === 'second' ? '0' : '*'), values: fields[name].specials.length ? null : fields[name].values.size > 60 ? null : [...fields[name].values].sort((a, b) => a - b).map((v) => (name === 'dow' ? WEEKDAYS[v] : v)) })),
    ...(p.macro ? { macro: { name: p.macro, same: D.macros[p.macro] } } : {}),
    days: { dom: 'day of month only', dow: 'day of week only', any: 'every day', or: 'day of month or day of week (either matches)', and: 'both day fields must match' }[p.days],
    timeZone: zone,
    zoneRule: D.zone.how,
    from: start.toISOString().replace('.000Z', 'Z'),
    nextRuns: runs,
    ...(exhausted && runs.filter((r) => r.at).length < n ? { neverAgain: runs.filter((r) => r.at).length === 0 ? `This schedule has no run after ${start.toISOString().slice(0, 10)}.` : 'This schedule has no more runs after the last one listed.' } : {}),
    dstRule: dstRuleText(D),
    warnings: [...notes, ...p.warnings],
    conversions,
    sources: D.sources.map((k) => SOURCES[k]),
  };
}
export function dstRuleText(D) {
  if (D.dst.gap === 'none') return `${D.name} runs in UTC, which has no daylight saving changes.`;
  if (D.dst.gap === 'vixie') return 'Debian cron(8): when the clocks go forward, a job at a particular time that falls in the skipped time runs soon after the change; when they go back, a job in the repeated time is not run again. Jobs with * in the minute or hour field run on the new time.';
  if (D.dst.gap === 'skip') return 'EventBridge Scheduler: a run at a time that does not exist when the clocks go forward is skipped; when they go back, it runs only once.';
  if (D.dst.gap === 'advance') return 'GitHub: with a time zone that observes daylight saving time, a run in the skipped hour advances to the next valid time (2:30 am runs at 3:00 am). GitHub\'s docs do not say what happens in the repeated hour when the clocks go back.';
  return `${D.name}'s docs do not say what happens to a run in the skipped or repeated hour at a daylight saving change; those runs are flagged.`;
}

// ---------- building an expression from a schedule ----------

export const PATTERNS = ['seconds', 'minutes', 'hours', 'daily', 'weekly', 'monthly', 'last-day'];
// { pattern, every?, at?: 'HH:MM', days?: [0-6], day?: 1-31, minute? } -> fields for a neutral parse.
export function buildFields(spec) {
  const { pattern } = spec;
  const every = spec.every ?? 1;
  const clock = (s) => {
    const m = /^(\d{1,2}):(\d{2})$/.exec(String(s ?? '00:00'));
    if (!m || +m[1] > 23 || +m[2] > 59) throw new CronError('at must be a 24-hour time like 09:30.', 'at');
    return [+m[2], +m[1]];
  };
  const step = (n, size, what) => {
    if (!Number.isInteger(n) || n < 1 || n >= size) throw new CronError(`every must be a whole number from 1 to ${size - 1} ${what}.`, 'every');
    if (size % n !== 0) return { text: `*/${n}`, uneven: true };
    return { text: n === 1 ? '*' : `*/${n}`, uneven: false };
  };
  const days = spec.days ? [...new Set(spec.days)].sort((a, b) => a - b) : null;
  const dowList = days ? days.join(',') : '*';
  const warn = [];
  let sec = '0', min, hr, dom = '*', mon = '*', dow = '*';
  if (pattern === 'seconds') {
    const s = step(every, 60, 'seconds');
    if (s.uneven) warn.push(`${every} does not divide 60, so the gap after the last run in each minute is shorter.`);
    sec = s.text; min = '*'; hr = '*';
  } else if (pattern === 'minutes') {
    const s = step(every, 60, 'minutes');
    if (s.uneven) warn.push(`${every} does not divide 60, so the gap across the top of the hour is shorter (cron steps restart every hour).`);
    min = s.text; hr = '*';
  } else if (pattern === 'hours') {
    const s = step(every, 24, 'hours');
    if (s.uneven) warn.push(`${every} does not divide 24, so the gap across midnight is shorter (cron steps restart every day).`);
    min = String(spec.minute ?? 0); hr = s.text;
    if (!/^\d{1,2}$/.test(min) || +min > 59) throw new CronError('minute must be 0 to 59.', 'minute');
  } else if (['daily', 'weekly', 'monthly', 'last-day'].includes(pattern)) {
    const times = Array.isArray(spec.at) ? spec.at : [spec.at ?? '00:00'];
    const parsedT = times.map(clock);
    const minutes = [...new Set(parsedT.map((t) => t[0]))];
    const hours = [...new Set(parsedT.map((t) => t[1]))];
    if (minutes.length > 1) throw new CronError('Several times in one expression must share the same minute (09:00 and 17:00 is fine; 09:00 and 17:30 needs two schedules).', 'at');
    min = String(minutes[0]); hr = hours.sort((a, b) => a - b).join(',');
    if (pattern === 'weekly') { if (!days || !days.length) throw new CronError('weekly needs days, like [1,2,3,4,5] for Monday to Friday (0 = Sunday).', 'days'); dow = dowList; }
    if (pattern === 'daily' && days) dow = dowList;
    if (pattern === 'monthly') {
      const d = spec.day ?? 1;
      if (!Number.isInteger(d) || d < 1 || d > 31) throw new CronError('day must be 1 to 31.', 'day');
      if (d > 28) warn.push(`Months without a ${ORD(d)} are skipped.`);
      dom = String(d);
      if (spec.months) mon = spec.months.join(',');
    }
    if (pattern === 'last-day') dom = 'L';
  } else throw new CronError(`pattern must be one of ${PATTERNS.join(', ')}.`, 'pattern');
  return { sec, min, hr, dom, mon, dow, warn };
}
// Build an expression and explain it, starting from the dialect that can hold it.
export function build(spec, now = new Date()) {
  const b = buildFields(spec);
  const needsSeconds = b.sec !== '0';
  const lastDay = b.dom === 'L';
  const source = lastDay ? 'spring' : 'spring';
  const text = [b.sec, b.min, b.hr, b.dom, b.mon, b.dow].join(' ');
  const out = explain({ expression: text, dialect: source, timeZone: spec.timeZone, from: spec.from, count: spec.count ?? 10 }, now);
  const target = spec.dialect ?? (needsSeconds ? 'n8n' : lastDay ? 'quartz' : 'vixie');
  const c = out.conversions[target];
  return {
    pattern: spec.pattern,
    dialect: target,
    expression: c.expressions ? c.expressions[0] : null,
    ...(c.error ? { error: c.error } : {}),
    ...(lastDay ? { lastDayNote: 'Classic 5-field cron has no "last day of the month"; schedulers with L (Quartz, Spring, UiPath, AWS EventBridge) do. In crontab, run on days 28 to 31 and check inside the job whether tomorrow is the 1st.' } : {}),
    description: out.description,
    timeZone: out.timeZone,
    nextRuns: out.nextRuns,
    warnings: [...b.warn, ...out.warnings.filter((w) => !/Spring/.test(w))],
    conversions: out.conversions,
  };
}
