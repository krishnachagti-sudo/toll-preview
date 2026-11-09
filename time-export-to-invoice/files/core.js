// The time-export-to-invoice engine: a time tracker's CSV export (Toggl Track, Clockify, Harvest,
// Everhour or any sheet with a date and a duration) read into entries, filtered, priced from a rate
// card, rounded at the level the contract says and grouped into invoice lines, with a
// reconciliation of raw, rounded and billed time. Pure and dependency-free: the page loads this
// same file, so the free preview and the paid invoice always agree.
//
// Rounding itself is not done here. makeInvoicer({ round }) takes the rounding primitive, and
// tool.js and page.js both pass the hours calculator's roundPunch (tools/hours-calculator/core.js),
// so a 15-minute rule rounds the same way on every page of the site.
//
// Time is whole seconds throughout and money whole cents; hours on a line are hundredths of an
// hour (36 seconds each), worked out from the seconds, never added up from decimals.

export class InvoiceError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'InvoiceError';
    this.field = field;
  }
}

export const LIMITS = { rows: 5000, csvChars: 100_000, lines: 500, entrySeconds: 24 * 3600 };
// Toggl's rounding offers 1, 5, 6, 10, 12, 15, 30 and 60 minutes (and 4 hours); these are the ones
// a contract uses.
export const INCREMENTS = [1, 5, 6, 10, 12, 15, 30, 60];
export const MODES = ['up', 'nearest', 'down'];
export const LEVELS = ['entry', 'line'];
export const GROUPS = ['project', 'task', 'day', 'day-project', 'client', 'user', 'tag', 'description', 'entry', 'single'];
export const GROUP_WORDS = {
  project: 'project', task: 'project and task', day: 'day', 'day-project': 'day and project', client: 'client',
  user: 'person', tag: 'tag', description: 'description', entry: 'time entry (one line each)', single: 'one line for everything',
};
export const SOURCES = ['toggl', 'clockify', 'harvest', 'everhour', 'other'];
export const SOURCE_NAMES = { toggl: 'Toggl Track', clockify: 'Clockify', harvest: 'Harvest', everhour: 'Everhour', other: 'a time sheet' };
export const FIELD_KEYS = ['date', 'start', 'endDate', 'end', 'duration', 'hours', 'project', 'task', 'client', 'user', 'firstName', 'lastName', 'email', 'description', 'tags', 'billable', 'rate'];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// ---------- dates and times ----------

export function isRealDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d && y >= 1970 && y <= 2100;
}
export const longDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;
export const shortDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1].slice(0, 3)} ${+iso.slice(8, 10)}`;
// "Nov 2 to Nov 27, 2026", "Nov 30, 2026 to Jan 4, 2027" or "Nov 2, 2026".
export function rangeText(from, to) {
  if (from === to) return `${shortDate(from)}, ${from.slice(0, 4)}`;
  if (from.slice(0, 4) === to.slice(0, 4)) return `${shortDate(from)} to ${shortDate(to)}, ${to.slice(0, 4)}`;
  return `${shortDate(from)}, ${from.slice(0, 4)} to ${shortDate(to)}, ${to.slice(0, 4)}`;
}

// A date as the trackers write it: 2026-11-02 (with or without a time after it), 2026/11/02,
// 11/02/2026, 02/11/2026, 2.11.2026 or with a two-digit year. Returns { iso } or { a, b, y } when
// the day and month order is still to be decided, or null.
function dateParts(text) {
  const s = String(text ?? '').trim();
  let m = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:$|[T\s])/.exec(s);
  if (m) return { iso: `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}` };
  m = /^(\d{1,2})([-/.])(\d{1,2})[-/.](\d{2}|\d{4})(?:$|[\sT,])/.exec(s);
  if (m) return { a: +m[1], b: +m[3], y: m[4].length === 2 ? 2000 + +m[4] : +m[4], dot: m[2] === '.' };
  return null;
}
function isoFrom(p, order) {
  if (!p) return null;
  const iso = p.iso ?? (() => {
    const [mo, d] = order === 'dmy' ? [p.b, p.a] : [p.a, p.b];
    return `${p.y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  })();
  return isRealDate(iso) ? iso : null;
}

// "09:00", "9:00:30", "9:00 AM", "1:05:30 pm", or the time part of "2026-11-02 09:00:00" -> seconds
// after midnight; null when it is not a clock time.
export function clockSeconds(text) {
  const s = String(text ?? '').trim().toLowerCase();
  const m = /(?:^|[t\s])(\d{1,2}):(\d{2})(?::(\d{2}))?\s?(am|pm|a\.m\.|p\.m\.)?$/.exec(s) ?? /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s?(am|pm)?$/.exec(s);
  if (!m) return null;
  let h = +m[1];
  const min = +m[2];
  const sec = m[3] ? +m[3] : 0;
  if (min > 59 || sec > 59) return null;
  if (m[4]) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (m[4][0] === 'p' ? 12 : 0);
  } else if (h > 23) return null;
  return h * 3600 + min * 60 + sec;
}
// 32400 -> "9:00 AM"; 49530 -> "1:45 PM" (seconds dropped).
export function clockText(sec) {
  const min = Math.floor(sec / 60) % 1440;
  const h = Math.floor(min / 60);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(min % 60).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

// A duration: "1:15:45" (h:mm:ss, Toggl's Improved format), "1:15" (h:mm, Clockify's clock format),
// "1.26" or "1,26" (decimal hours, Clockify's decimal format and Harvest's hours), with an optional
// trailing "h", or "1h 30m" / "45m". -> whole seconds, or null.
export function durationSeconds(text, { decimalOnly = false } = {}) {
  const s = String(text ?? '').trim().replace(/\s?h(ours?)?$/i, '');
  if (!s) return null;
  // "1h 30m", "45m", "2h": the way some trackers write time.
  const hm = /^(?:(\d{1,4})\s?h)?\s?(?:(\d{1,4})\s?m(?:in)?)?$/i.exec(String(text ?? '').trim());
  if (hm && (hm[1] || hm[2]) && !decimalOnly) return (+(hm[1] ?? 0)) * 3600 + (+(hm[2] ?? 0)) * 60;
  let m = /^(\d{1,5}):(\d{1,2})(?::(\d{1,2}))?$/.exec(s);
  if (m && !decimalOnly) {
    if (+m[2] > 59 || (m[3] && +m[3] > 59)) return null;
    return +m[1] * 3600 + +m[2] * 60 + (m[3] ? +m[3] : 0);
  }
  m = /^(\d{1,5})(?:[.,](\d{1,6}))?$/.exec(s);
  if (!m) return null;
  // Decimal hours to seconds without a float sum: whole hours, then the fraction to the nearest second.
  const frac = m[2] ?? '';
  return +m[1] * 3600 + (frac ? Math.round((Number(frac) * 3600) / 10 ** frac.length) : 0);
}
// 18065 -> "5:01:05".
export const hms = (sec) => `${Math.floor(sec / 3600)}:${String(Math.floor(sec / 60) % 60).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
// Hundredths of an hour, to the nearest (half up): 36 seconds each.
export const hundredthsOf = (sec) => Math.floor((sec + 18) / 36);
export const hoursText = (hundredths) => `${Math.floor(hundredths / 100).toLocaleString('en-US')}.${String(hundredths % 100).padStart(2, '0')}`;
// Hours with up to 4 decimals for exact times: 18065 s -> "5.0181".
export function exactHours(sec) {
  const v = Math.floor((sec * 10000 + 1800) / 3600);
  return `${Math.floor(v / 10000)}.${String(v % 10000).padStart(4, '0')}`;
}
export const minutesWords = (n) => (n % 60 === 0 && n >= 60 ? `${n / 60} hour${n === 60 ? '' : 's'}` : `${n} minute${n === 1 ? '' : 's'}`);

// ---------- money ----------

// "$1,250.50", "120", 120, "95.5" -> cents; null when not an amount with at most 2 decimals.
export function centsOf(v) {
  const s = String(v ?? '').trim().replace(/^[$€£]/, '').replace(/^(USD|EUR|GBP|CAD|AUD)\s?/i, '').replace(/,(?=\d{3}(\D|$))/g, '');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(s)) return null;
  const [w, f = ''] = s.split('.');
  return Number(w) * 100 + Number(f.padEnd(2, '0'));
}
// A percentage with up to 3 decimals ("8.875", 20) -> thousandths of a percent; null if not one.
export function percentOf(v) {
  const s = String(v ?? '').trim().replace(/%$/, '');
  if (!/^\d{1,3}(\.\d{1,3})?$/.test(s)) return null;
  const [w, f = ''] = s.split('.');
  const n = Number(w) * 1000 + Number(f.padEnd(3, '0'));
  return n <= 100_000 ? n : null;
}
export function money(cents, currency = 'USD') {
  const neg = cents < 0;
  const a = Math.abs(cents);
  const n = `${Math.floor(a / 100).toLocaleString('en-US')}.${String(a % 100).padStart(2, '0')}`;
  return `${neg ? '-' : ''}${currency === 'USD' ? `$${n}` : `${n} ${currency}`}`;
}
// Cents for hundredths of an hour at a rate in cents, half up.
const lineAmount = (hundredths, rate) => Math.floor((hundredths * rate + 50) / 100);
const exactAmount = (sec, rate) => Math.floor((sec * rate + 1800) / 3600);
const percentCut = (cents, milli) => Math.floor((cents * milli + 50_000) / 100_000);

// ---------- the CSV ----------

// RFC 4180 with the delimiter found in the heading line (comma, semicolon or tab), a byte-order
// mark dropped, quoted fields with commas, quotes and line breaks. -> rows of strings.
export function parseCsv(text) {
  const src = String(text ?? '').replace(/^﻿/, '');
  const firstLine = src.slice(0, src.search(/\r?\n|$/));
  const count = (ch) => firstLine.split('"').filter((_, i) => i % 2 === 0).join('').split(ch).length - 1;
  const delimiter = ['\t', ';', ','].reduce((best, ch) => (count(ch) > count(best) ? ch : best), ',');
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === delimiter) { row.push(field); field = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return { rows: rows.filter((r) => r.some((v) => v.trim() !== '')), delimiter };
}

// A heading as a key: "Duration (h)" -> "duration h", "Billable Rate (USD)" -> "billable rate usd".
export const headingKey = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

// The headings each field is read from. Toggl and Clockify document the time-entry fields Email,
// User, Client, Project, Task, Description, Tags/Tag, Billable, Start date, Start time and Duration
// (their CSV import guides, which tell you to copy a Detailed report export); Harvest's API names
// spent_date, hours, notes, client, project, task, user and billable_rate; the rest are the
// common wordings of a hand-made sheet. data/export-formats.json holds the sources and dates.
export const HEADINGS = {
  date: ['start date', 'date', 'spent date', 'day', 'work date', 'entry date'],
  start: ['start time', 'started time', 'time started', 'start', 'from', 'clock in'],
  endDate: ['end date', 'stop date'],
  end: ['end time', 'ended time', 'stop time', 'time ended', 'end', 'stop', 'to', 'clock out'],
  duration: ['duration', 'duration h', 'duration hh mm ss', 'duration hh mm', 'time', 'time spent', 'tracked time', 'logged time'],
  hours: ['hours', 'duration decimal', 'decimal hours', 'hours decimal', 'time decimal', 'time h', 'logged hours'],
  project: ['project', 'project name'],
  task: ['task', 'task name', 'task title', 'activity', 'service'],
  client: ['client', 'client name', 'customer'],
  user: ['user', 'member', 'person', 'team member', 'employee', 'name', 'user name'],
  firstName: ['first name'],
  lastName: ['last name'],
  email: ['email', 'user email'],
  description: ['description', 'notes', 'note', 'comment', 'comments', 'details', 'work description'],
  tags: ['tags', 'tag', 'labels', 'label'],
  billable: ['billable', 'is billable', 'billable status'],
  rate: ['billable rate', 'rate', 'hourly rate', 'billable rate usd', 'billable rate eur', 'billable rate gbp', 'bill rate'],
};
// Headings read but never used for the money: rounded hours and amounts the tracker worked out.
const KNOWN_UNUSED = ['hours rounded', 'rounded hours', 'billable amount', 'amount', 'cost rate', 'cost amount', 'currency', 'end date', 'id', 'invoiced'];

// Which column holds each field: from the caller's map (headings as written), else by name.
export function mapColumns(header, given = {}) {
  const keys = header.map(headingKey);
  const map = {};
  for (const [field, name] of Object.entries(given)) {
    const i = keys.indexOf(headingKey(name));
    if (i < 0) throw new InvoiceError(`No column is headed "${name}" (given for ${field}). The headings are: ${header.join(', ')}.`, 'columns');
    map[field] = i;
  }
  for (const field of FIELD_KEYS) {
    if (map[field] !== undefined) continue;
    for (const name of HEADINGS[field]) {
      const i = keys.indexOf(name);
      if (i >= 0 && !Object.values(map).includes(i)) { map[field] = i; break; }
    }
  }
  const used = new Set(Object.values(map));
  const unknown = header.filter((h, i) => !used.has(i) && h.trim() !== '');
  return { map, unknown, known: unknown.filter((h) => KNOWN_UNUSED.includes(headingKey(h)) || /^billable (rate|amount)/.test(headingKey(h))) };
}

// The layout a heading row looks like. Only the documented fields are used to tell them apart.
export function detectLayout(header) {
  const keys = new Set(header.map(headingKey));
  if (keys.has('start date') && keys.has('start time') && keys.has('duration')) return 'start-date-duration';
  if (keys.has('hours') && keys.has('notes')) return 'date-hours-notes';
  return 'other';
}
const LAYOUT_WORDS = {
  'start-date-duration': 'Start date, Start time and Duration columns, the layout Toggl Track and Clockify document',
  'date-hours-notes': 'Date, Hours and Notes columns, the fields Harvest names',
  other: 'columns matched by their headings',
};

const yes = (v) => /^(yes|y|true|1|billable)$/i.test(String(v ?? '').trim());
const no = (v) => /^(no|n|false|0|non ?billable|not billable)$/i.test(String(v ?? '').trim());
const clean = (v, max = 200) => String(v ?? '').trim().replace(/\s+/g, ' ').slice(0, max);

// ---------- reading entries ----------

// Rows as objects (the API's "rows") or as CSV text -> entries with whole seconds, plus what was
// skipped and why. Dates are read day-first only when a value proves it (a first part over 12) or
// the caller says so.
export function readEntries({ csv, rows, columns = {}, dateOrder = 'auto' }) {
  let header;
  let body;
  let lineOf;
  if (rows) {
    header = [...new Set(rows.flatMap((r) => Object.keys(r)))];
    body = rows.map((r) => header.map((k) => (r[k] === undefined || r[k] === null ? '' : String(r[k]))));
    lineOf = (i) => i + 1;
  } else {
    const parsed = parseCsv(csv);
    if (!parsed.rows.length) throw new InvoiceError('The file is empty. Export a detailed report as CSV and send that.', 'csv');
    [header, ...body] = parsed.rows;
    lineOf = (i) => i + 2;
  }
  if (body.length > LIMITS.rows) throw new InvoiceError(`At most ${LIMITS.rows.toLocaleString('en-US')} time entries in one file; split the export by month.`, 'csv');
  const { map, unknown, known } = mapColumns(header, columns);
  const hasTime = map.duration !== undefined || map.hours !== undefined || (map.start !== undefined && map.end !== undefined);
  if (map.date === undefined || !hasTime) {
    const need = [map.date === undefined ? 'a date column (Start date, Date or Spent date)' : null, hasTime ? null : 'a duration column (Duration or Hours, or Start time and End time)'].filter(Boolean);
    throw new InvoiceError(`The file needs ${need.join(' and ')}. Its headings are: ${header.slice(0, 20).join(', ')}. Name the columns in "columns" if they are headed differently.`, 'columns');
  }
  const cell = (cells, f) => (map[f] === undefined ? '' : cells[map[f]] ?? '');

  // Day and month order, decided once for the whole file.
  let order = dateOrder;
  let orderGuessed = false;
  if (order === 'auto') {
    const parts = body.map((c) => dateParts(cell(c, 'date'))).filter((p) => p && p.iso === undefined);
    // Day first when a value proves it (a first part over 12), or when the dates are written with
    // dots (2.11.2026), the European form; otherwise month first, flagged when nothing proves it.
    if (parts.some((p) => p.a > 12) || (parts.length && parts.every((p) => p.dot) && !parts.some((p) => p.b > 12))) order = 'dmy';
    else {
      order = 'mdy';
      orderGuessed = parts.length > 0 && !parts.some((p) => p.b > 12);
    }
  }

  const entries = [];
  const skipped = [];
  body.forEach((cells, i) => {
    const row = lineOf(i);
    const date = isoFrom(dateParts(cell(cells, 'date')), order);
    if (!date) { skipped.push({ row, reason: `no date that can be read ("${clean(cell(cells, 'date'), 30)}")` }); return; }
    const start = map.start === undefined ? null : clockSeconds(cell(cells, 'start'));
    const end = map.end === undefined ? null : clockSeconds(cell(cells, 'end'));
    let seconds = null;
    if (map.duration !== undefined && cell(cells, 'duration').trim() !== '') seconds = durationSeconds(cell(cells, 'duration'));
    if (seconds === null && map.hours !== undefined && cell(cells, 'hours').trim() !== '') seconds = durationSeconds(cell(cells, 'hours'), { decimalOnly: true });
    if (seconds === null && start !== null && end !== null) {
      const endDate = map.endDate === undefined ? null : isoFrom(dateParts(cell(cells, 'endDate')), order);
      const days = endDate && endDate > date ? Math.round((Date.parse(endDate) - Date.parse(date)) / 86_400_000) : (end < start ? 1 : 0);
      seconds = end - start + days * 86_400;
    }
    if (seconds === null) { skipped.push({ row, reason: 'no duration that can be read' }); return; }
    if (seconds > LIMITS.entrySeconds) { skipped.push({ row, reason: `an entry of ${hms(seconds)}, over 24 hours (split it in the tracker)` }); return; }
    const billableText = cell(cells, 'billable');
    const user = clean(cell(cells, 'user'), 80) || clean(`${cell(cells, 'firstName')} ${cell(cells, 'lastName')}`, 80) || clean(cell(cells, 'email'), 80);
    entries.push({
      row,
      date,
      start,
      end,
      seconds,
      project: clean(cell(cells, 'project')),
      task: clean(cell(cells, 'task')),
      client: clean(cell(cells, 'client')),
      user,
      description: clean(cell(cells, 'description'), 300),
      tags: cell(cells, 'tags').split(/[,;|]/).map((t) => clean(t, 60)).filter(Boolean),
      billable: yes(billableText) ? true : no(billableText) ? false : null,
      fileRate: map.rate === undefined ? null : centsOf(cell(cells, 'rate')),
    });
  });
  const used = Object.fromEntries(Object.entries(map).map(([f, i]) => [f, header[i]]));
  return { entries, skipped, header, columnsUsed: used, columnsIgnored: unknown, columnsKnownUnused: known, layout: detectLayout(header), dateOrder: order, dateOrderGuessed: orderGuessed, rowsRead: body.length };
}

// The number of entry rows a call carries, for limits and pricing (no parsing beyond lines).
export function countRows({ csv, rows }) {
  if (rows) return rows.length;
  return Math.max(0, parseCsv(csv).rows.length - 1);
}

// ---------- the rate card ----------

// { default, task: { Design: 90 }, project: {...}, tag: {...}, client: {...}, user: {...} } with
// amounts as text or numbers -> cents, keys matched ignoring case and spacing. Precedence, most
// specific first: task, tag, project, client, user, then the rate in the file, then the default.
export const RATE_ORDER = ['task', 'tag', 'project', 'client', 'user'];
export function readRates(card = {}) {
  const out = { default: null, useFileRates: card.useFileRates !== false };
  if (card.default !== undefined && card.default !== null && card.default !== '') {
    out.default = centsOf(card.default);
    if (out.default === null) throw new InvoiceError(`The default rate "${card.default}" is not an amount such as 95 or 95.50.`, 'rates');
  }
  for (const kind of RATE_ORDER) {
    out[kind] = new Map();
    for (const [name, v] of Object.entries(card[kind] ?? {})) {
      const c = centsOf(v);
      if (c === null) throw new InvoiceError(`The ${kind} rate for "${name}" ("${v}") is not an amount such as 95 or 95.50.`, 'rates');
      out[kind].set(headingKey(name), { name, cents: c });
    }
  }
  return out;
}
function rateFor(e, rates) {
  const hit = (kind, value) => (value ? rates[kind].get(headingKey(value)) : undefined);
  const task = hit('task', e.task) ?? hit('task', e.task && e.project ? `${e.project}: ${e.task}` : '');
  if (task) return { cents: task.cents, source: `task "${task.name}"` };
  for (const t of e.tags) { const x = hit('tag', t); if (x) return { cents: x.cents, source: `tag "${x.name}"` }; }
  for (const kind of ['project', 'client', 'user']) { const x = hit(kind, e[kind]); if (x) return { cents: x.cents, source: `${kind} "${x.name}"` }; }
  if (rates.useFileRates && e.fileRate !== null && e.fileRate > 0) return { cents: e.fileRate, source: 'the file' };
  if (rates.default !== null) return { cents: rates.default, source: 'the default rate' };
  return { cents: null, source: 'none' };
}

// ---------- rounding ----------

export function ruleText(r) {
  if (!r) return 'not rounded (exact time)';
  const step = minutesWords(r.increment);
  const how = r.mode === 'up' ? `up to the next ${step}` : r.mode === 'down' ? `down to the ${step}` : `to the nearest ${step}`;
  return `${r.level === 'entry' ? 'each entry' : 'each line'} rounded ${how}`;
}

// ---------- the invoicer ----------

const label = (e, group) => {
  const project = e.project || '(no project)';
  switch (group) {
    case 'project': return project;
    case 'task': return e.task ? `${project}: ${e.task}` : project;
    case 'day': return longDate(e.date);
    case 'day-project': return `${shortDate(e.date)}: ${project}`;
    case 'client': return e.client || '(no client)';
    case 'user': return e.user || '(no name)';
    case 'tag': return e.tags[0] || '(no tag)';
    case 'description': return e.description || '(no description)';
    case 'entry': return e.description || (e.task ? `${project}: ${e.task}` : project);
    default: return null;
  }
};
const keyOf = (e, group) => (group === 'entry' ? `#${e.row}` : group === 'single' ? '' : headingKey(label(e, group)) || label(e, group));
const sortKey = (e) => `${e.date}|${String(e.start ?? 0).padStart(6, '0')}|${String(e.row).padStart(6, '0')}`;

// makeInvoicer({ round }) where round(value, increment, mode) rounds a whole number of seconds to a
// whole number of seconds ('up', 'nearest' or 'down'; a half rounds up).
export function makeInvoicer({ round }) {
  const roundBy = (sec, r) => (r ? round(sec, r.increment * 60, r.mode) : sec);

  // The whole answer for one export and one set of choices. o: the validated input, with
  // rounding { increment, mode, level }, minimumMinutes, groupBy, rates, billable ('billable' or
  // 'all'), periodFrom/periodTo, onlyClient/onlyProject, quantity ('two-decimals' or 'exact'),
  // showDescriptions, singleLabel, retainer { hours, overageRate, fee }, discountPercent,
  // capAmount, taxPercent, currency, source.
  function build(o) {
    const read = readEntries(o);
    const r = o.rounding ? { increment: o.rounding.increment, mode: o.rounding.mode ?? 'up', level: o.rounding.level ?? 'entry' } : null;
    const min = (o.minimumMinutes ?? 0) * 60;
    const rates = readRates(o.rates);
    const group = o.groupBy ?? 'project';
    const currency = o.currency ?? 'USD';
    const twoDecimals = (o.quantity ?? 'two-decimals') === 'two-decimals';
    const m = (c) => money(c, currency);
    const flags = [];

    // Filters, each counted.
    const out = { nonBillable: [], outside: [], other: [] };
    const want = (v, w) => !w || headingKey(v) === headingKey(w);
    const included = [];
    for (const e of read.entries) {
      if ((o.billable ?? 'billable') === 'billable' && e.billable === false) out.nonBillable.push(e);
      else if ((o.periodFrom && e.date < o.periodFrom) || (o.periodTo && e.date > o.periodTo)) out.outside.push(e);
      else if (!want(e.client, o.onlyClient) || !want(e.project, o.onlyProject)) out.other.push(e);
      else included.push(e);
    }
    if (!included.length) {
      const why = read.entries.length ? `none of its ${read.entries.length} entries is left after the filters (${out.nonBillable.length} not billable, ${out.outside.length} outside the dates, ${out.other.length} for another client or project)` : 'none of its rows could be read';
      throw new InvoiceError(`Nothing to invoice: ${why}.`, read.entries.length ? 'periodFrom' : 'csv');
    }
    included.sort((a, b) => (sortKey(a) < sortKey(b) ? -1 : 1));

    // Each entry's rate and billed time.
    let noRate = 0;
    for (const e of included) {
      const rate = rateFor(e, rates);
      e.rate = rate.cents;
      e.rateSource = rate.source;
      if (e.rate === null) noRate++;
      const atLeast = e.seconds > 0 ? Math.max(e.seconds, min) : 0;
      e.billed = r && r.level === 'entry' ? roundBy(atLeast, r) : atLeast;
    }
    if (noRate) flags.push({ message: `${noRate} ${noRate === 1 ? 'entry has' : 'entries have'} no rate: give a default rate, or a rate for their task, project, tag, client or person. ${noRate === 1 ? 'It is' : 'They are'} billed at $0 until then.` });

    // Lines: one per group and rate, in the order of their first entry.
    const byKey = new Map();
    for (const e of included) {
      const k = `${keyOf(e, group)}|${e.rate ?? 'none'}`;
      if (!byKey.has(k)) byKey.set(k, { key: keyOf(e, group), rate: e.rate, entries: [] });
      byKey.get(k).entries.push(e);
    }
    const groups = [...byKey.values()];
    if (groups.length > LIMITS.lines) throw new InvoiceError(`That makes ${groups.length} lines, more than ${LIMITS.lines} on one invoice. Group by project, task or day instead.`, 'groupBy');
    const ratesPerGroup = new Map();
    for (const g of groups) ratesPerGroup.set(g.key, (ratesPerGroup.get(g.key) ?? 0) + 1);

    const lines = groups.map((g, i) => {
      const first = g.entries[0];
      const last = g.entries.at(-1);
      const raw = g.entries.reduce((s, e) => s + e.seconds, 0);
      const entryBilled = g.entries.reduce((s, e) => s + e.billed, 0);
      const billed = r && r.level === 'line' ? roundBy(entryBilled, r) : entryBilled;
      const hundredths = hundredthsOf(billed);
      const rate = g.rate ?? 0;
      let text = group === 'single' ? (o.singleLabel || 'Professional services') : label(first, group);
      if (ratesPerGroup.get(g.key) > 1) text += ` (at ${m(rate)}/h)`;
      const descriptions = [...new Set(g.entries.map((e) => e.description).filter(Boolean))];
      const shownDescriptions = o.showDescriptions && group !== 'entry' && group !== 'description' && descriptions.length
        ? `${descriptions.slice(0, 5).join('; ')}${descriptions.length > 5 ? `; and ${descriptions.length - 5} more` : ''}` : '';
      const times = group === 'entry' && first.start !== null && first.end !== null ? `${clockText(first.start)} to ${clockText(first.end)}` : '';
      const detail = [
        group === 'day' || (group === 'entry' && !times) ? '' : group === 'entry' ? `${shortDate(first.date)}, ${times}` : rangeText(first.date, last.date),
        group === 'entry' ? '' : `${g.entries.length} ${g.entries.length === 1 ? 'entry' : 'entries'}`,
        shownDescriptions,
      ].filter(Boolean).join('; ');
      return {
        n: i + 1,
        label: text,
        detail,
        from: first.date,
        to: last.date,
        entries: g.entries.length,
        rows: g.entries.map((e) => e.row),
        rawSeconds: raw,
        billedSeconds: billed,
        hundredths,
        quantity: hoursText(hundredths),
        rateCents: g.rate,
        rate: g.rate === null ? 'no rate' : `${m(rate)}/h`,
        rateSource: [...new Set(g.entries.map((e) => e.rateSource))].join(', '),
        amountCents: twoDecimals ? lineAmount(hundredths, rate) : exactAmount(billed, rate),
      };
    });
    if (!twoDecimals && lines.some((l) => l.amountCents !== lineAmount(l.hundredths, l.rateCents ?? 0))) {
      flags.push({ message: 'Amounts are worked out from the exact time, so on some lines the hours shown (two decimals) times the rate differ from the amount by a cent or more.' });
    }

    // A prepaid block of hours: used by the lines in date order, the rest billed as overage.
    let retainer = null;
    if (o.retainer) {
      const block = durationSeconds(String(o.retainer.hours), { decimalOnly: true });
      const overage = o.retainer.overageRate === undefined || o.retainer.overageRate === null ? null : centsOf(o.retainer.overageRate);
      let left = hundredthsOf(block);
      const rows = [];
      for (const l of lines) {
        const covered = Math.min(left, l.hundredths);
        left -= covered;
        const rate = overage ?? l.rateCents ?? 0;
        l.coveredHundredths = covered;
        l.covered = hoursText(covered);
        l.overageHundredths = l.hundredths - covered;
        if (covered) {
          l.amountCents = lineAmount(l.overageHundredths, rate);
          if (overage !== null && l.overageHundredths) l.rate = `${m(overage)}/h over the block`;
        } else if (overage !== null) {
          l.amountCents = lineAmount(l.hundredths, overage);
          l.rate = `${m(overage)}/h over the block`;
        }
        rows.push({ line: l.n, label: l.label, hours: l.quantity, covered: l.covered, overage: hoursText(l.overageHundredths), balance: hoursText(left) });
      }
      const used = hundredthsOf(block) - left;
      retainer = {
        blockHours: hoursText(hundredthsOf(block)),
        usedHours: hoursText(used),
        remainingHours: hoursText(left),
        overageHours: hoursText(lines.reduce((s, l) => s + l.overageHundredths, 0)),
        overageRate: overage === null ? 'each line\'s rate' : `${m(overage)}/h`,
        feeCents: o.retainer.fee === undefined || o.retainer.fee === null ? null : centsOf(o.retainer.fee),
        balance: rows,
      };
      retainer.fee = retainer.feeCents === null ? null : m(retainer.feeCents);
    }

    // Totals.
    const linesCents = lines.reduce((s, l) => s + l.amountCents, 0);
    const subtotal = linesCents + (retainer?.feeCents ?? 0);
    const discountMilli = o.discountPercent === undefined || o.discountPercent === null ? 0 : percentOf(o.discountPercent);
    if (discountMilli === null) throw new InvoiceError('The discount is a percentage such as 10 or 12.5.', 'discountPercent');
    const discount = percentCut(subtotal, discountMilli);
    const cap = o.capAmount === undefined || o.capAmount === null ? null : centsOf(o.capAmount);
    const capCut = cap !== null && subtotal - discount > cap ? subtotal - discount - cap : 0;
    const net = subtotal - discount - capCut;
    const taxMilli = o.taxPercent === undefined || o.taxPercent === null ? 0 : percentOf(o.taxPercent);
    if (taxMilli === null) throw new InvoiceError('The tax rate is a percentage such as 8.25.', 'taxPercent');
    const tax = percentCut(net, taxMilli);
    const rawSeconds = included.reduce((s, e) => s + e.seconds, 0);
    const billedSeconds = lines.reduce((s, l) => s + l.billedSeconds, 0);
    const billedHundredths = lines.reduce((s, l) => s + l.hundredths, 0);

    // How each rounding level, and Clockify's two ways of multiplying, would bill the same entries.
    const rateGroups = new Map();
    for (const e of included) {
      if (!rateGroups.has(e.rate ?? 0)) rateGroups.set(e.rate ?? 0, []);
      rateGroups.get(e.rate ?? 0).push(e);
    }
    // Each method's money is its time at each rate, to the cent (exact, not via two-decimal hours).
    const priced = (secByRate) => [...secByRate].reduce((s, [rate, sec]) => s + exactAmount(sec, rate), 0);
    const sumBy = (fn) => new Map([...rateGroups].map(([rate, es]) => [rate, fn(es)]));
    const atLeast = (e) => (e.seconds > 0 ? Math.max(e.seconds, min) : 0);
    const methods = [];
    const method = (name, byRate) => {
      const sec = [...byRate.values()].reduce((s, x) => s + x, 0);
      methods.push({ method: name, seconds: sec, hours: hoursText(hundredthsOf(sec)), amountCents: priced(byRate), amount: m(priced(byRate)) });
    };
    method('Exact time, no rounding', sumBy((es) => es.reduce((s, e) => s + e.seconds, 0)));
    if (r) {
      const rr = (level) => ({ ...r, level });
      method(`${ruleText(rr('entry')).replace(/^each entry rounded/, 'Each entry rounded')}`, sumBy((es) => es.reduce((s, e) => s + roundBy(atLeast(e), r), 0)));
      // Per line: the chosen grouping's lines, each rounded once.
      const perLine = new Map();
      for (const g of groups) perLine.set(g.rate ?? 0, (perLine.get(g.rate ?? 0) ?? 0) + roundBy(g.entries.reduce((s, e) => s + atLeast(e), 0), r));
      method(`${ruleText(rr('line')).replace(/^each line rounded/, 'Each line rounded')}`, perLine);
      method(`The total rounded ${ruleText(r).replace(/^each (entry|line) rounded /, '')}`, sumBy((es) => roundBy(es.reduce((s, e) => s + atLeast(e), 0), r)));
    }
    const clockifyInvoice = included.reduce((s, e) => s + hundredthsOf(e.seconds) * (e.rate ?? 0), 0);
    const reportCents = [...rateGroups].reduce((s, [rate, es]) => s + exactAmount(es.reduce((x, e) => x + e.seconds, 0), rate), 0);
    const invoiceCents = Math.floor((clockifyInvoice + 50) / 100);

    const summary = {
      entries: included.length,
      rawSeconds,
      rawTime: hms(rawSeconds),
      rawHours: exactHours(rawSeconds),
      billedSeconds,
      billedHours: hoursText(billedHundredths),
      lines: lines.length,
      linesAmount: m(linesCents),
      retainerFee: retainer?.fee ?? null,
      subtotalCents: subtotal,
      subtotal: m(subtotal),
      discountPercent: discountMilli ? String(o.discountPercent) : null,
      discountCents: discount,
      discount: discount ? m(-discount) : null,
      capCents: capCut,
      cap: capCut ? `${m(-capCut)} (capped at ${m(cap)})` : null,
      taxPercent: taxMilli ? String(o.taxPercent) : null,
      taxCents: tax,
      tax: taxMilli ? m(tax) : null,
      totalCents: net + tax,
      total: m(net + tax),
      currency,
    };

    const roundingWords = r ? ruleText(r) : 'not rounded';
    const minWords = min ? `, at least ${minutesWords(o.minimumMinutes)} an entry` : '';
    const answer = `Your ${included.length} ${included.length === 1 ? 'entry' : 'entries'} (${hms(rawSeconds)}, ${exactHours(rawSeconds)} h) become ${lines.length} invoice ${lines.length === 1 ? 'line' : 'lines'} grouped by ${GROUP_WORDS[group]}, ${roundingWords}${minWords}, billing ${summary.billedHours} h and totalling ${summary.total}.`;

    if (read.dateOrderGuessed) flags.push({ message: 'Every date in the file could be month first or day first (such as 03/04/2026); they were read month first (March 4). Set dateOrder to "dmy" if they are day first.' });
    if (read.skipped.length) flags.push({ message: `${read.skipped.length} ${read.skipped.length === 1 ? 'row was' : 'rows were'} skipped: ${read.skipped.slice(0, 5).map((s) => `row ${s.row}, ${s.reason}`).join('; ')}${read.skipped.length > 5 ? `; and ${read.skipped.length - 5} more` : ''}.` });
    const zero = included.filter((e) => e.seconds === 0).length;
    if (zero) flags.push({ message: `${zero} ${zero === 1 ? 'entry is' : 'entries are'} 0:00:00 long and bill nothing.` });
    if (r?.mode === 'up' && r.level === 'entry' && included.length > 1) {
      const extra = billedSeconds - rawSeconds;
      if (extra > 0) flags.push({ message: `Rounding each entry up adds ${hms(extra)} (${hoursText(hundredthsOf(extra))} h) to the exact time. Check your contract allows it.` });
    }

    return {
      answer,
      source: { given: o.source ?? null, layout: read.layout, words: LAYOUT_WORDS[read.layout] },
      columnsUsed: read.columnsUsed,
      columnsIgnored: read.columnsIgnored,
      dateOrder: read.dateOrder,
      period: { from: o.periodFrom ?? included[0].date, to: o.periodTo ?? included.at(-1).date },
      groupBy: group,
      rounding: r ? { ...r, minimumMinutes: o.minimumMinutes ?? 0, text: ruleText(r) + minWords } : { increment: null, mode: null, level: null, minimumMinutes: o.minimumMinutes ?? 0, text: `not rounded${minWords}` },
      quantity: twoDecimals ? 'two-decimals' : 'exact',
      lines,
      totals: summary,
      retainer,
      reconciliation: {
        rowsRead: read.rowsRead,
        rowsSkipped: read.skipped,
        entriesRead: read.entries.length,
        excluded: [
          { reason: 'not billable', entries: out.nonBillable.length, time: hms(out.nonBillable.reduce((s, e) => s + e.seconds, 0)) },
          { reason: 'outside the invoice dates', entries: out.outside.length, time: hms(out.outside.reduce((s, e) => s + e.seconds, 0)) },
          { reason: 'another client or project', entries: out.other.length, time: hms(out.other.reduce((s, e) => s + e.seconds, 0)) },
        ],
        included: { entries: included.length, time: hms(rawSeconds), hours: exactHours(rawSeconds) },
        billed: { time: hms(billedSeconds), hours: summary.billedHours, differenceSeconds: billedSeconds - rawSeconds, difference: `${billedSeconds < rawSeconds ? '-' : '+'}${hms(Math.abs(billedSeconds - rawSeconds))}` },
        methods,
        twoDecimalsPerEntry: {
          invoice: m(invoiceCents),
          invoiceCents,
          report: m(reportCents),
          reportCents,
          difference: m(invoiceCents - reportCents),
          differenceCents: invoiceCents - reportCents,
          words: 'Each entry rounded to two decimals of an hour, then multiplied by its rate (how Clockify invoices compute), against the exact total time multiplied by the rate (how Clockify reports compute).',
        },
      },
      entries: included.map((e) => ({ row: e.row, date: e.date, start: e.start === null ? '' : clockText(e.start), end: e.end === null ? '' : clockText(e.end), project: e.project, task: e.task, description: e.description, user: e.user, time: hms(e.seconds), billed: hms(e.billed), rate: e.rate === null ? '' : m(e.rate), rateSource: e.rateSource })),
      flags,
    };
  }

  return { build };
}

// ---------- files ----------

const csvField = (v) => {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvOf = (rows) => `${rows.map((r) => r.map(csvField).join(',')).join('\r\n')}\r\n`;
const plainAmount = (c) => `${c < 0 ? '-' : ''}${Math.floor(Math.abs(c) / 100)}.${String(Math.abs(c) % 100).padStart(2, '0')}`;

// The lines as a CSV an accounting app can import line by line: service dates, description, hours,
// rate and amount as plain numbers.
export function linesCsv(b) {
  const rows = [['Line', 'Service date from', 'Service date to', 'Description', 'Detail', 'Hours', 'Rate', 'Amount']];
  for (const l of b.lines) rows.push([l.n, l.from, l.to, l.label, l.detail, l.quantity, l.rateCents === null ? '' : plainAmount(l.rateCents), plainAmount(l.amountCents)]);
  return csvOf(rows);
}
// Every entry with its exact and billed time, its rate and where the rate came from: the audit
// trail behind each line, for a client who asks.
export function entriesCsv(b) {
  const lineOf = new Map();
  for (const l of b.lines) for (const row of l.rows) lineOf.set(row, l.n);
  const rows = [['Row in file', 'Date', 'Start', 'End', 'Project', 'Task', 'Description', 'Person', 'Exact time', 'Billed time', 'Rate', 'Rate from', 'Invoice line']];
  for (const e of b.entries) rows.push([e.row, e.date, e.start, e.end, e.project, e.task, e.description, e.user, e.time, e.billed, e.rate, e.rateSource, lineOf.get(e.row) ?? '']);
  return csvOf(rows);
}
