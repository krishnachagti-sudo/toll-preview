// Natural-language date resolver: a phrase such as "10 business days after next Friday", "end of
// next month" or "90 days ago" in, one exact calendar date out, with its weekday, every step taken,
// every holiday skipped and every assumption stated. When a phrase can honestly mean two dates
// ("next Friday" said on a Monday), the answer says so and gives both.
//
// Pure and dependency-free: Node (tool.js, pages.js, tests) and the browser (page.js) load this same
// file, so it imports nothing. Business days and their holiday calendars come from the Business days
// engine (tools/business-days/core.js), which every caller imports and hands in, read-only:
//
//   const engine = makeEngine(businessDays);
//
// The grammar is small and written by hand; anything it does not know is refused with a message
// that says what it does know, never guessed. All arithmetic is on whole day numbers (days since
// 1970-01-01), never on Date objects, so the machine's time zone cannot change an answer.
//
// Conventions (each is stated in every answer):
//  - The start day is never counted: 1 day after Friday is Saturday, 1 business day after Friday
//    is Monday (as Excel's WORKDAY counts).
//  - Months, quarters and years keep the day of the month, clamped to the month's last day:
//    January 31 plus 1 month is February 28 (29 in a leap year).
//  - Weeks run Monday to Sunday (ISO 8601). "End of the week" is the Sunday; the Friday is given as
//    the other reading.
//  - "Friday", "this Friday", "on Friday": the coming Friday, today if today is a Friday (the
//    Friday a week later is the other reading).
//  - "next Friday": the nearest Friday after today, by default; the Friday of next week (Monday to
//    Sunday) is the other reading when it is a different day. weekdayRule 'next-week' swaps them.
//    "last Friday" works the same way backwards.
//  - A date with no year ("March 3") is the next one on or after the reference date; the one in
//    the reference date's year is the other reading when it differs.
//  - 3/4/2027 is month/day (US) unless dateOrder is 'DMY'; the other order is the other reading.

export const MIN_YEAR = 1900;
export const MAX_YEAR = 2199;
export const MAX_TEXT = 200;
export const MAX_TEXTS = 50;
export const MAX_QUANTITY = 99999;
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const NONE = 'none';
export const WEEKDAY_RULES = ['nearest', 'next-week'];
export const DATE_ORDERS = ['MDY', 'DMY'];
export const ROLLS = ['none', 'following', 'preceding', 'modified-following'];
export const RANGE_MESSAGE = `Dates must fall between ${MIN_YEAR} and ${MAX_YEAR}.`;

// What the resolver understands, said when it does not understand a phrase.
export const GRAMMAR_HINT = 'Try forms like "90 days from today", "10 business days after next Friday", "3 weeks ago", "in 6 months", "next Tuesday", "end of next month", "first Monday of March 2027", "last business day of this quarter" or a date such as "2027-03-03" or "March 3, 2027".';

// A problem with the phrase or options that the caller can fix; field names the input it is about.
export class ResolveError extends Error {
  constructor(message, field = 'text') {
    super(message);
    this.name = 'ResolveError';
    this.field = field;
  }
}

// ---------- calendar arithmetic ----------

// Days since 1970-01-01 for a proleptic Gregorian date (Hinnant's algorithm), any year.
export function daysFromCivil(y, m, d) {
  const yy = m <= 2 ? y - 1 : y;
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

export function civilFromDays(n) {
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

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const monthLength = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
const pad = (n, w = 2) => String(n).padStart(w, '0');
// 0 = Sunday ... 6 = Saturday. 1970-01-01 was a Thursday.
export const weekdayOfDay = (n) => (((n + 4) % 7) + 7) % 7;
const isWeekendDay = (n) => { const w = weekdayOfDay(n); return w === 0 || w === 6; };

export function isoOfDay(n) {
  const [y, m, d] = civilFromDays(n);
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
// The day number of a real 'YYYY-MM-DD' date, or null.
export function dayOfIso(iso) {
  const m = typeof iso === 'string' ? ISO_RE.exec(iso) : null;
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > monthLength(y, mo)) return null;
  return daysFromCivil(y, mo, d);
}
export const isRealDate = (iso) => dayOfIso(iso) !== null;

const MIN_DAY = daysFromCivil(MIN_YEAR, 1, 1);
const MAX_DAY = daysFromCivil(MAX_YEAR, 12, 31);
function inRange(n) {
  if (n < MIN_DAY || n > MAX_DAY) throw new ResolveError(RANGE_MESSAGE);
  return n;
}

// Add months to a day, keeping the day of the month, clamped to the target month's last day.
function addMonths(n, months) {
  const [y, m, d] = civilFromDays(n);
  const total = y * 12 + (m - 1) + months;
  const ty = Math.floor(total / 12);
  const tm = total - ty * 12 + 1;
  return { day: daysFromCivil(ty, tm, Math.min(d, monthLength(ty, tm))), clamped: d > monthLength(ty, tm) };
}

// ISO 8601 week: weeks start on Monday and week 1 holds the year's first Thursday. "2026-W45".
export function isoWeek(n) {
  const wd = weekdayOfDay(n) || 7;
  const thursday = n + 4 - wd;
  const [y] = civilFromDays(thursday);
  const week = Math.floor((thursday - daysFromCivil(y, 1, 1)) / 7) + 1;
  return `${pad(y, 4)}-W${pad(week)}`;
}

export function dayOfYear(n) {
  const [y] = civilFromDays(n);
  return n - daysFromCivil(y, 1, 1) + 1;
}

// ---------- words ----------

export const weekdayName = (iso) => WEEKDAYS[weekdayOfDay(dayOfIso(iso))];
// "Friday, November 13, 2026"
export function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${weekdayName(iso)}, ${MONTHS[m - 1]} ${d}, ${y}`;
}
// "Fri, Nov 13, 2026"
export function shortDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${weekdayName(iso).slice(0, 3)}, ${MONTHS[m - 1].slice(0, 3)} ${d}, ${y}`;
}
const long = (n) => longDate(isoOfDay(n));
const plural = (q, word) => `${q} ${word}${q === 1 ? '' : 's'}`;

// ---------- today in a time zone ----------

export function isTimeZone(tz) {
  if (typeof tz !== 'string' || !tz || tz.length > 64) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch { return false; }
}

// The calendar date (YYYY-MM-DD) at an instant in a time zone.
export function todayIn(tz, now) {
  const p = {};
  for (const x of new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now)) p[x.type] = x.value;
  return `${p.year}-${p.month}-${p.day}`;
}

// ---------- the words of the grammar ----------

const WEEKDAY_WORDS = {
  sunday: 0, sun: 0, monday: 1, mon: 1, tuesday: 2, tue: 2, tues: 2, wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thur: 4, thurs: 4, friday: 5, fri: 5, saturday: 6, sat: 6,
};
const MONTH_WORDS = {
  january: 1, jan: 1, february: 2, feb: 2, march: 3, mar: 3, april: 4, apr: 4, may: 5, june: 6, jun: 6,
  july: 7, jul: 7, august: 8, aug: 8, september: 9, sep: 9, sept: 9, october: 10, oct: 10,
  november: 11, nov: 11, december: 12, dec: 12,
};
const SMALL = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16, seventeen: 17,
  eighteen: 18, nineteen: 19,
};
const TENS = { twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60, seventy: 70, eighty: 80, ninety: 90 };
const ORDINALS = { first: 1, 1: 1, second: 2, 2: 2, third: 3, 3: 3, fourth: 4, 4: 4, fifth: 5, 5: 5, last: -1, final: -1 }; // "4th" is "4" by now

// unit word -> { kind: 'day' | 'business' | 'week' | 'month', size }
const UNITS = {
  day: ['day', 1], days: ['day', 1],
  week: ['day', 7], weeks: ['day', 7], wk: ['day', 7], wks: ['day', 7],
  fortnight: ['day', 14], fortnights: ['day', 14],
  month: ['month', 1], months: ['month', 1], mo: ['month', 1], mos: ['month', 1],
  quarter: ['month', 3], quarters: ['month', 3],
  year: ['month', 12], years: ['month', 12], yr: ['month', 12], yrs: ['month', 12],
  weekday: ['business', 1], weekdays: ['business', 1],
};
// Two-word units: "business days", "working days", "calendar days", "work days", "banking days".
const BUSINESS_FIRST = new Set(['business', 'working', 'work', 'banking']);
const UNIT_NAMES = { day: ['calendar day', 'calendar days'], business: ['business day', 'business days'] };

const PERIODS = new Set(['week', 'month', 'quarter', 'year']);

// ---------- tokens ----------

// The phrase as lower-case tokens. Dates written with digits become one token each:
// { iso } for 2027-03-03, { slash: [a, b, y] } for 3/4/2027.
const LEADING = [
  'what is the date', 'what was the date', 'what will the date be', 'what date will it be', 'what date was it',
  'what day of the week is', 'what day of the week was', 'what day of the week will be', 'what day of the week',
  'what date is', 'what date was', 'what day is', 'what day was', 'what day will it be', 'what day will be',
  'what is', 'what was', 'which day is', 'when is', 'when was', 'when will be', 'the date of', 'date of', 'the date', 'date',
  'due', 'due on', 'deadline', 'by', 'until', 'on',
];
const TIME_RE = /\b\d{1,2}(:\d{2})?\s*(am|pm|a\.m\.|p\.m\.)\b|\b\d{1,2}:\d{2}\b|\b(noon|midnight|hours?|hrs?|minutes?|mins?|seconds?|secs?|tonight|morning|afternoon|evening|eod|cob|eob|o'clock)\b/;

export function tokenize(text) {
  if (typeof text !== 'string' || !text.trim()) throw new ResolveError('Send the phrase to resolve, like "90 days from today".');
  if (text.length > MAX_TEXT) throw new ResolveError(`A phrase can be at most ${MAX_TEXT} characters.`);
  let s = ` ${text.toLowerCase().replace(/[‘’]/g, "'").replace(/[–—]/g, '-')} `;
  if (TIME_RE.test(s)) throw new ResolveError('Times of day are not supported: this resolves calendar dates only. Leave out the time (for example "tomorrow" rather than "tomorrow at 5pm").');
  s = s
    .replace(/\btoday's date\b|\btodays date\b|\bthe current date\b|\bright now\b/g, 'today')
    .replace(/\btmrw\b|\btmr\b|\btomorow\b|\btommorow\b|\btommorrow\b/g, 'tomorrow')
    .replace(/(\d)(st|nd|rd|th)\b/g, '$1')
    .replace(/\b(excluding|excl|not counting|skipping|without) (weekends and |weekends & )?(federal |public |bank |us |national )?holidays\b/g, ' ')
    .replace(/\b(excluding|excl|not counting|skipping) weekends\b/g, ' ')
    .replace(/[?!,;()]/g, ' ')
    .replace(/\.(\s|$)/g, ' ')
    .replace(/\s\+\s?/g, ' plus ').replace(/\s-\s?(?=\d)|\s-\s/g, ' minus ')
    .replace(/(\d)(days?|weeks?|months?|years?|wks?|yrs?|d|w|m|y)\b/g, '$1 $2')
    .replace(/\s+/g, ' ').trim();
  for (let again = true; again;) {
    again = false;
    for (const lead of LEADING) {
      if (s === lead) break;
      if (s.startsWith(`${lead} `)) { s = s.slice(lead.length + 1); again = true; break; }
    }
  }
  const out = [];
  for (const raw of s.split(' ')) {
    if (!raw) continue;
    const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw);
    if (iso) { out.push({ ymd: [Number(iso[1]), Number(iso[2]), Number(iso[3])], raw }); continue; }
    const slash = /^(\d{1,2})[/.](\d{1,2})[/.](\d{4})$/.exec(raw);
    if (slash) { out.push({ slash: [Number(slash[1]), Number(slash[2]), Number(slash[3])], raw }); continue; }
    if (/^\d{1,2}[/.]\d{1,2}$/.test(raw)) throw new ResolveError(`"${raw}" has no year: write it with the year (3/4/2027) or the month's name (March 4).`);
    // Hyphenated number words ("twenty-one") and "a.m." style leftovers.
    if (/^[a-z]+-[a-z]+$/.test(raw) && raw.split('-').every((w) => TENS[w] !== undefined || SMALL[w] !== undefined)) { out.push(...raw.split('-')); continue; }
    if (raw === 'the') continue;
    out.push(raw);
  }
  if (!out.length) throw new ResolveError(`There is no date in that phrase. ${GRAMMAR_HINT}`);
  return out;
}

// ---------- the parser: tokens -> a small tree ----------
//
// expr   := ('in' | 'within') offset
//         | offset ('ago' | 'later' | 'hence' | 'from now')
//         | offset ('from' | 'after' | 'past' | 'since') expr
//         | offset ('before' | 'prior to' | 'earlier than') expr
//         | 'net' N [('from' | 'after') expr]
//         | offset                                   (from the reference date)
//         | anchor { ('plus' | 'minus') offset }
// offset := quantity unit { ['and'] quantity unit }
// anchor := today | tomorrow | yesterday | the day after tomorrow | the day before yesterday
//         | [this | next | last | coming | past | previous] weekday [after next | before last]
//         | (start | beginning | end | first day | last day) of period
//         | (first | last) (business | working) day of period
//         | ordinal weekday (of | in) period
//         | a date: 2027-03-03, 3/4/2027, March 3 [2027], 3 March [2027]
// period := [this | next | last] (week | month | quarter | year) | (week | month) after next
//         | month-name [year] | q1..q4 [year] | year

class Parser {
  constructor(tokens) { this.t = tokens; this.i = 0; }
  peek(k = 0) { return this.t[this.i + k]; }
  word(k = 0) { const x = this.peek(k); return typeof x === 'string' ? x : null; }
  is(...words) { return words.includes(this.word()); }
  eat(...words) { if (this.is(...words)) { this.i += 1; return true; } return false; }
  done() { return this.i >= this.t.length; }
  rest() { return this.t.slice(this.i).map((x) => (typeof x === 'string' ? x : x.raw)).join(' '); }
  fail(msg) { throw new ResolveError(msg ?? `Could not read "${this.rest() || 'the end of the phrase'}". ${GRAMMAR_HINT}`); }

  // A whole number written in digits or words, or null (position unchanged).
  quantity() {
    const w = this.word();
    if (w === null) return null;
    if (/^\d+$/.test(w)) {
      const n = Number(w);
      if (n > MAX_QUANTITY) this.fail(`${w} is too large: at most ${MAX_QUANTITY}.`);
      this.i += 1; return n;
    }
    if (w === 'a' || w === 'an' || w === 'one') { this.i += 1; return 1; }
    if (SMALL[w] !== undefined) { this.i += 1; return SMALL[w]; }
    if (TENS[w] !== undefined) {
      this.i += 1;
      const u = this.word();
      if (u && SMALL[u] !== undefined && SMALL[u] > 0 && SMALL[u] < 10) { this.i += 1; return TENS[w] + SMALL[u]; }
      return TENS[w];
    }
    return null;
  }

  // A unit after a quantity, or null (position unchanged).
  unit() {
    const w = this.word();
    if (w === null) return null;
    if (BUSINESS_FIRST.has(w) && ['day', 'days'].includes(this.word(1))) { this.i += 2; return 'business'; }
    if (w === 'calendar' && ['day', 'days'].includes(this.word(1))) { this.i += 2; return 'day'; }
    if (w === 'business' && this.word(1) === 'week') return null;
    if (['d', 'w', 'm', 'y'].includes(w)) { this.i += 1; return { d: 'day', w: 'week', m: 'month', y: 'year' }[w]; }
    if (UNITS[w]) { this.i += 1; return w.replace(/s$/, '').replace(/^wk$/, 'week').replace(/^yr$/, 'year').replace(/^mo$/, 'month'); }
    return null;
  }

  // One or more "quantity unit" parts, or null (position unchanged).
  offset() {
    const start = this.i;
    const parts = [];
    for (;;) {
      const save = this.i;
      if (parts.length) this.eat('and');
      const q = this.quantity();
      if (q === null) { this.i = save; break; }
      const u = this.unit();
      if (u === null) { this.i = save; break; }
      parts.push({ q, unit: u });
    }
    if (!parts.length) { this.i = start; return null; }
    return parts;
  }

  expr(tail = true) {
    let node;
    if (this.eat('in', 'within')) {
      const off = this.offset();
      if (!off) this.fail();
      node = { shift: 1, off, base: { ref: true } };
      if (this.eat('from', 'after')) node.base = this.expr(false);
    } else if (this.is('net') && /^\d+$/.test(this.word(1) ?? '')) {
      this.i += 1;
      const q = this.quantity();
      node = { shift: 1, off: [{ q, unit: 'day' }], base: { ref: true }, net: true };
      if (this.eat('from', 'after')) node.base = this.expr(false);
    } else if (this.is('plus', 'minus') && this.peek(1) !== undefined) {
      // "+90 days", "-3 weeks": from the reference date.
      const sign = this.word() === 'minus' ? -1 : 1;
      this.i += 1;
      const off = this.offset();
      if (!off) this.fail();
      node = { shift: sign, off, base: { ref: true } };
    } else {
      const off = this.offset();
      if (off) {
        if (this.eat('ago')) node = { shift: -1, off, base: { ref: true } };
        else if (this.eat('later', 'hence')) node = { shift: 1, off, base: { ref: true } };
        else if (this.is('from') && this.word(1) === 'now') { this.i += 2; node = { shift: 1, off, base: { ref: true } }; }
        else if (this.eat('from', 'after', 'past', 'since')) node = { shift: 1, off, base: this.expr(false) };
        else if (this.eat('before')) node = { shift: -1, off, base: this.expr(false) };
        else if (this.is('prior', 'earlier') && ['to', 'than'].includes(this.word(1))) { this.i += 2; node = { shift: -1, off, base: this.expr(false) }; }
        else node = { shift: 1, off, base: { ref: true }, bare: true };
      } else {
        node = this.anchor();
      }
    }
    if (!tail) return node;
    while (this.is('plus', 'minus', 'and')) {
      const sign = this.word() === 'minus' ? -1 : 1;
      this.i += 1;
      const off = this.offset();
      if (!off) this.fail();
      node = { shift: sign, off, base: node };
    }
    return node;
  }

  anchor() {
    const w = this.word();
    const x = this.peek();
    if (x && typeof x === 'object') { this.i += 1; return x.ymd ? { ymd: x.ymd, raw: x.raw } : { slash: x.slash, raw: x.raw }; }
    if (w === null) this.fail();
    if (this.eat('today', 'now')) return { ref: true, said: 'today' };
    if (this.eat('tomorrow')) return { shift: 1, off: [{ q: 1, unit: 'day' }], base: { ref: true }, said: 'tomorrow' };
    if (this.eat('yesterday')) return { shift: -1, off: [{ q: 1, unit: 'day' }], base: { ref: true }, said: 'yesterday' };
    // "the day after tomorrow", "the week after Friday": one unit after or before an anchor.
    if (UNITS[w] && ['after', 'before'].includes(this.word(1)) && this.word(2) !== 'next' && this.word(2) !== 'last') {
      const unit = this.unit();
      const sign = this.word() === 'after' ? 1 : -1;
      this.i += 1;
      return { shift: sign, off: [{ q: 1, unit }], base: this.expr(false) };
    }
    // nth weekday of a period.
    if (ORDINALS[w] !== undefined && WEEKDAY_WORDS[this.word(1)] !== undefined && ['of', 'in'].includes(this.word(2))) {
      const n = ORDINALS[w];
      const wd = WEEKDAY_WORDS[this.word(1)];
      this.i += 3;
      return { nth: n, weekday: wd, period: this.period() };
    }
    // Weekdays.
    const mod = ['this', 'next', 'last', 'coming', 'past', 'previous', 'upcoming'].includes(w) && WEEKDAY_WORDS[this.word(1)] !== undefined ? w : null;
    if (mod || WEEKDAY_WORDS[w] !== undefined) {
      if (mod) this.i += 1;
      const wd = WEEKDAY_WORDS[this.word()];
      this.i += 1;
      let how = { this: 'this', coming: 'this', upcoming: 'this', next: 'next', last: 'last', past: 'last', previous: 'last' }[mod] ?? 'this';
      if (this.is('after') && this.word(1) === 'next') { this.i += 2; how = 'after-next'; }
      else if (this.is('before') && this.word(1) === 'last') { this.i += 2; how = 'before-last'; }
      return { weekday: wd, how };
    }
    // Start or end of a period.
    const pos = this.position();
    if (pos) {
      if (!this.eat('of')) this.fail();
      return { ...pos, period: this.period() };
    }
    // A month name with a day.
    const named = this.namedDate();
    if (named) return named;
    if (['next', 'last', 'this'].includes(w) && PERIODS.has(this.word(1))) {
      this.fail(`"${w} ${this.word(1)}" is not one day. Say "start of ${w} ${this.word(1)}", "end of ${w} ${this.word(1)}" or "1 ${this.word(1)} from today".`);
    }
    return this.fail();
  }

  // "start of", "end of", "first business day of" ...: { at: 'start' | 'end', business? }
  position() {
    const w = this.word();
    const w1 = this.word(1);
    if (['start', 'beginning', 'begining'].includes(w)) { this.i += 1; return { at: 'start' }; }
    if (w === 'end') { this.i += 1; return { at: 'end' }; }
    if (['first', 'last'].includes(w) && w1 === 'day') { this.i += 2; return { at: w === 'first' ? 'start' : 'end' }; }
    if (['first', 'last'].includes(w) && BUSINESS_FIRST.has(w1) && this.word(2) === 'day') { this.i += 3; return { at: w === 'first' ? 'start' : 'end', business: true }; }
    if (['first', 'last'].includes(w) && w1 === 'weekday' && this.word(2) === 'of') { this.i += 2; return { at: w === 'first' ? 'start' : 'end', business: true }; }
    return null;
  }

  year() {
    const w = this.word();
    if (w && /^\d{4}$/.test(w)) { this.i += 1; return Number(w); }
    return null;
  }

  period() {
    const w = this.word();
    if (['this', 'next', 'last', 'current', 'previous', 'coming'].includes(w) && PERIODS.has(this.word(1))) {
      const unit = this.word(1);
      this.i += 2;
      return { unit, move: { next: 1, coming: 1, last: -1, previous: -1 }[w] ?? 0 };
    }
    if (PERIODS.has(w)) {
      this.i += 1;
      if (this.is('after') && this.word(1) === 'next') { this.i += 2; return { unit: w, move: 2 }; }
      if (this.is('before') && this.word(1) === 'last') { this.i += 2; return { unit: w, move: -2 }; }
      return { unit: w, move: 0 };
    }
    if (MONTH_WORDS[w] !== undefined) {
      this.i += 1;
      return { month: MONTH_WORDS[w], year: this.year() };
    }
    const q = /^q([1-4])$/.exec(w ?? '');
    if (q) { this.i += 1; return { quarter: Number(q[1]), year: this.year() }; }
    const y = this.year();
    if (y !== null) return { wholeYear: y };
    return this.fail(`After "of", name a period: "this month", "next quarter", "March 2027", "Q1 2027" or "2027". ${GRAMMAR_HINT}`);
  }

  // "March 3 2027", "March 3", "3 March 2027", "3 March": { md: [m, d], year | null }
  namedDate() {
    const w = this.word();
    const w1 = this.word(1);
    if (MONTH_WORDS[w] !== undefined && /^\d{1,2}$/.test(w1 ?? '')) {
      this.i += 2;
      this.eat('of');
      return { md: [MONTH_WORDS[w], Number(w1)], year: this.year(), raw: `${w} ${w1}` };
    }
    if (/^\d{1,2}$/.test(w ?? '') && (MONTH_WORDS[w1] !== undefined || (w1 === 'of' && MONTH_WORDS[this.word(2)] !== undefined))) {
      this.i += w1 === 'of' ? 3 : 2;
      return { md: [MONTH_WORDS[this.word(-1)], Number(w)], year: this.year(), raw: `${w} ${this.word(-1)}` };
    }
    return null;
  }
}

export function parse(text) {
  const p = new Parser(tokenize(text));
  const node = p.expr();
  if (!p.done()) p.fail();
  return node;
}

// ---------- the engine ----------

// The choices a phrase can leave open. Each answer uses one set; readings flip one at a time.
const DEFAULT_CHOICES = { next: 'nearest', last: 'nearest', sameDay: 'today', yearless: 'upcoming', weekEnd: 'sunday', dateOrder: 'MDY' };
const READINGS = {
  next: { nearest: 'the nearest one after the reference date', 'next-week': 'the one in next week (Monday to Sunday)' },
  last: { nearest: 'the nearest one before the reference date', 'last-week': 'the one in last week (Monday to Sunday)' },
  sameDay: { today: 'the reference date itself', following: 'a week after the reference date' },
  yearless: { upcoming: 'the next one on or after the reference date', 'this-year': 'the one in the reference date\'s year' },
  weekEnd: { sunday: 'Sunday (ISO weeks end on Sunday)', friday: 'Friday (the end of the work week)' },
  dateOrder: { MDY: 'month/day/year (US)', DMY: 'day/month/year' },
};
const OTHER = { next: { nearest: 'next-week', 'next-week': 'nearest' }, last: { nearest: 'last-week', 'last-week': 'nearest' }, sameDay: { today: 'following', following: 'today' }, yearless: { upcoming: 'this-year', 'this-year': 'upcoming' }, weekEnd: { sunday: 'friday', friday: 'sunday' }, dateOrder: { MDY: 'DMY', DMY: 'MDY' } };

export function makeEngine(bd) {
  const REGION_NAMES = { ...bd.REGIONS, [NONE]: 'no holidays (weekends only)' };
  const regionOk = (r) => Object.prototype.hasOwnProperty.call(REGION_NAMES, r);

  // Is a day a business day? Weekends never are; holidays per region; your own days off.
  function offDay(region, n, own) {
    if (isWeekendDay(n)) return { weekend: true };
    const iso = isoOfDay(n);
    if (region !== NONE) {
      let d;
      try { [d] = bd.calendarDays(region, iso, iso); } catch (e) { throw new ResolveError(e.message); }
      if (d.uncovered) throw new ResolveError(bd.rangeMessage(region));
      if (d.holiday) return { holiday: d.holiday };
    }
    if (own && own.has(iso)) return { own: true };
    return null;
  }

  // Business days added with the engine for a region, or weekends only for 'none'.
  function addBusiness(region, n, q, own) {
    if (q === 0) return { day: n, holidays: [], daysOff: [] };
    if (region !== NONE) {
      let r;
      try { r = bd.addBusinessDays(region, isoOfDay(n), q, own ? [...own] : undefined); } catch (e) { throw new ResolveError(e.message); }
      return { day: dayOfIso(r.date), holidays: r.holidaysSkipped, daysOff: r.daysOffSkipped ?? [] };
    }
    const step = q > 0 ? 1 : -1;
    let left = Math.abs(q);
    let d = n;
    const daysOff = [];
    while (left > 0) {
      d = inRange(d + step);
      if (isWeekendDay(d)) continue;
      if (own && own.has(isoOfDay(d))) { daysOff.push({ date: isoOfDay(d), name: bd.OWN_DAY_OFF ?? 'Your day off' }); continue; }
      left -= 1;
    }
    return { day: d, holidays: [], daysOff };
  }

  // [first, last] day of a period, as day numbers.
  function periodSpan(period, ref, ctx) {
    const [ry, rm] = civilFromDays(ref);
    const yearOr = (y, endOf) => {
      if (y !== null && y !== undefined) return y;
      // No year: this year's, unless it has already ended, then next year's.
      ctx.flag('yearless');
      if (ctx.choices.yearless === 'this-year') return ry;
      return endOf(ry) < ref ? ry + 1 : ry;
    };
    if (period.wholeYear !== undefined) return [daysFromCivil(period.wholeYear, 1, 1), daysFromCivil(period.wholeYear, 12, 31)];
    if (period.month !== undefined) {
      const y = yearOr(period.year, (yy) => daysFromCivil(yy, period.month, monthLength(yy, period.month)));
      return [daysFromCivil(y, period.month, 1), daysFromCivil(y, period.month, monthLength(y, period.month))];
    }
    if (period.quarter !== undefined) {
      const qm = (period.quarter - 1) * 3 + 1;
      const y = yearOr(period.year, (yy) => daysFromCivil(yy, qm + 2, monthLength(yy, qm + 2)));
      return [daysFromCivil(y, qm, 1), daysFromCivil(y, qm + 2, monthLength(y, qm + 2))];
    }
    const k = period.move;
    if (period.unit === 'week') {
      const monday = ref - ((weekdayOfDay(ref) + 6) % 7) + 7 * k;
      return [monday, monday + 6];
    }
    const months = period.unit === 'month' ? 1 : period.unit === 'quarter' ? 3 : 12;
    const firstMonth = Math.floor((rm - 1) / months) * months; // 0-based month index in the year
    const total = ry * 12 + firstMonth + months * k;
    const y = Math.floor(total / 12);
    const m = total - y * 12 + 1;
    const endTotal = total + months - 1;
    const ey = Math.floor(endTotal / 12);
    const em = endTotal - ey * 12 + 1;
    return [daysFromCivil(y, m, 1), daysFromCivil(ey, em, monthLength(ey, em))];
  }

  function periodWords(period) {
    if (period.wholeYear !== undefined) return String(period.wholeYear);
    if (period.month !== undefined) return `${MONTHS[period.month - 1]}${period.year ? ` ${period.year}` : ''}`;
    if (period.quarter !== undefined) return `Q${period.quarter}${period.year ? ` ${period.year}` : ''}`;
    const which = { 0: 'this', 1: 'next', '-1': 'last', 2: 'the', '-2': 'the' }[period.move];
    return period.move === 2 ? `the ${period.unit} after next` : period.move === -2 ? `the ${period.unit} before last` : `${which} ${period.unit}`;
  }

  // Evaluate a tree to a day number, writing steps and skipped holidays into ctx.
  function evaluate(node, ctx) {
    if (node.ref) return ctx.ref;
    if (node.ymd) {
      const [y, m, d] = node.ymd;
      if (m < 1 || m > 12 || d < 1 || d > monthLength(y, m)) throw new ResolveError(`${node.raw} is not a real calendar date.`);
      const n = inRange(daysFromCivil(y, m, d));
      ctx.step(`${node.raw} is ${long(n)}`);
      return n;
    }
    if (node.slash) {
      const [a, b, y] = node.slash;
      const read = (order) => {
        const [m, d] = order === 'MDY' ? [a, b] : [b, a];
        return m >= 1 && m <= 12 && d >= 1 && d <= monthLength(y, m) ? daysFromCivil(y, m, d) : null;
      };
      const mine = read(ctx.choices.dateOrder);
      const other = read(OTHER.dateOrder[ctx.choices.dateOrder]);
      if (mine === null) throw new ResolveError(`${node.raw} is not a real date read as ${READINGS.dateOrder[ctx.choices.dateOrder]}${other !== null ? `; set dateOrder to "${OTHER.dateOrder[ctx.choices.dateOrder]}" to read it as ${READINGS.dateOrder[OTHER.dateOrder[ctx.choices.dateOrder]]}` : ''}.`, other !== null ? 'dateOrder' : 'text');
      if (other !== null && other !== mine) ctx.flag('dateOrder');
      ctx.step(`${node.raw}, read as ${READINGS.dateOrder[ctx.choices.dateOrder]}, is ${long(inRange(mine))}`);
      return mine;
    }
    if (node.md) {
      const [m, d] = node.md;
      if (d < 1 || d > 31 || (node.year && d > monthLength(node.year, m)) || (!node.year && d > monthLength(2000, m))) throw new ResolveError(`${MONTHS[m - 1]} ${d} is not a real calendar date.`);
      let y = node.year;
      if (!y) {
        const [ry] = civilFromDays(ctx.ref);
        // February 29 with no year: the next leap year's (or this year's when it is one).
        const fits = (yy) => d <= monthLength(yy, m);
        let upcoming = ry;
        while (!fits(upcoming) || daysFromCivil(upcoming, m, d) < ctx.ref) upcoming += 1;
        let thisYear = ry;
        while (!fits(thisYear)) thisYear -= 1;
        if (upcoming !== thisYear) ctx.flag('yearless');
        y = ctx.choices.yearless === 'this-year' ? thisYear : upcoming;
      }
      if (d > monthLength(y, m)) throw new ResolveError(`${MONTHS[m - 1]} ${d}, ${y} is not a real calendar date.`);
      const n = inRange(daysFromCivil(y, m, d));
      ctx.step(`${MONTHS[m - 1]} ${d}${node.year ? `, ${y}` : ` (no year given: ${READINGS.yearless[ctx.choices.yearless]})`} is ${long(n)}`);
      return n;
    }
    if (node.weekday !== undefined && node.how) return weekdayAnchor(node, ctx);
    if (node.nth !== undefined) {
      const [lo, hi] = periodSpan(node.period, ctx.ref, ctx);
      let n;
      if (node.nth > 0) {
        n = lo + ((node.weekday - weekdayOfDay(lo) + 7) % 7) + (node.nth - 1) * 7;
        if (n > hi) throw new ResolveError(`There is no ${['', 'first', 'second', 'third', 'fourth', 'fifth'][node.nth]} ${WEEKDAYS[node.weekday]} in ${periodWords(node.period)}.`);
      } else {
        n = hi - ((weekdayOfDay(hi) - node.weekday + 7) % 7);
      }
      inRange(n);
      ctx.step(`The ${node.nth > 0 ? ['', 'first', 'second', 'third', 'fourth', 'fifth'][node.nth] : 'last'} ${WEEKDAYS[node.weekday]} of ${periodWords(node.period)} is ${long(n)}`);
      return n;
    }
    if (node.at) {
      const [lo, hi] = periodSpan(node.period, ctx.ref, ctx);
      let n = node.at === 'start' ? lo : hi;
      if (node.period.unit === 'week' && node.at === 'end' && !node.business) {
        ctx.flag('weekEnd');
        if (ctx.choices.weekEnd === 'friday') n = hi - 2;
      }
      inRange(n);
      if (node.business) {
        const step = node.at === 'start' ? 1 : -1;
        const skipped = [];
        for (let guard = 0; ; guard += 1) {
          if (guard > 40 || n < lo || n > hi) throw new ResolveError(`There is no business day in ${periodWords(node.period)}.`);
          const off = offDay(ctx.region, n, ctx.own);
          if (!off) break;
          if (off.holiday) skipped.push({ date: isoOfDay(n), name: off.holiday });
          if (off.own) ctx.daysOff.push({ date: isoOfDay(n), name: 'Your day off' });
          n += step;
        }
        ctx.holidays.push(...skipped);
        ctx.step(`The ${node.at === 'start' ? 'first' : 'last'} business day of ${periodWords(node.period)} (${ctx.calendarWords}) is ${long(n)}${skipped.length ? `, after skipping ${skipped.map((h) => `${h.name} (${shortDate(h.date)})`).join(', ')}` : ''}`);
        return n;
      }
      const which = node.at === 'start' ? 'start' : 'end';
      ctx.step(`The ${which} of ${periodWords(node.period)} is ${long(n)}${node.period.unit === 'week' ? (node.at === 'start' ? ' (weeks start on Monday)' : ` (${READINGS.weekEnd[ctx.choices.weekEnd]})`) : ''}`);
      return n;
    }
    if (node.shift) {
      let n = evaluate(node.base, ctx);
      if (node.bare) ctx.step(`No starting point given: counted from the reference date, ${long(ctx.ref)}`);
      for (const part of node.off) {
        const sign = node.shift;
        const [kind, size] = UNITS[part.unit] ?? (part.unit === 'business' ? ['business', 1] : ['day', 1]);
        const q = part.q * size;
        const before = n;
        let words;
        if (kind === 'day') {
          n = inRange(n + sign * q);
          words = `${sign > 0 ? '+' : '-'}${plural(part.q, part.unit === 'day' ? 'calendar day' : part.unit)}`;
        } else if (kind === 'month') {
          const r = addMonths(n, sign * q);
          n = inRange(r.day);
          words = `${sign > 0 ? '+' : '-'}${plural(part.q, part.unit)}${r.clamped ? ` (${MONTHS[civilFromDays(n)[1] - 1]} has no day ${civilFromDays(before)[2]}, so its last day)` : ''}`;
        } else {
          const r = addBusiness(ctx.region, n, sign * q, ctx.own);
          n = inRange(r.day);
          ctx.holidays.push(...r.holidays);
          ctx.daysOff.push(...r.daysOff);
          const skip = [...r.holidays.map((h) => `${h.name} (${shortDate(h.date)})`), ...r.daysOff.map((h) => `your day off (${shortDate(h.date)})`)];
          words = `${sign > 0 ? '+' : '-'}${plural(part.q, 'business day')} (${ctx.calendarWords}; the start day is not counted)${skip.length ? `, skipping ${skip.join(', ')}` : ''}`;
        }
        if (node.net) words = `net ${part.q}: ${part.q} calendar days after the invoice date`;
        ctx.step(`${long(before)} ${words}: ${long(n)}`);
      }
      return n;
    }
    throw new ResolveError(`Could not read that phrase. ${GRAMMAR_HINT}`);
  }

  function weekdayAnchor(node, ctx) {
    const ref = ctx.ref;
    const w0 = weekdayOfDay(ref);
    const wd = node.weekday;
    const name = WEEKDAYS[wd];
    const ahead = (wd - w0 + 7) % 7; // 0 when today is that weekday
    const monday = ref - ((w0 + 6) % 7);
    const inWeek = (k) => monday + 7 * k + ((wd + 6) % 7);
    let n;
    let why;
    if (node.how === 'this') {
      n = ref + ahead;
      if (ahead === 0) {
        ctx.flag('sameDay');
        if (ctx.choices.sameDay === 'following') n = ref + 7;
        why = `the reference date is a ${name}: ${READINGS.sameDay[ctx.choices.sameDay]}`;
      } else why = `the coming ${name}`;
    } else if (node.how === 'next' || node.how === 'after-next') {
      const nearest = ref + (ahead === 0 ? 7 : ahead);
      const nextWeek = inWeek(1);
      if (nearest !== nextWeek) ctx.flag('next');
      n = ctx.choices.next === 'next-week' ? nextWeek : nearest;
      why = nearest === nextWeek ? `the ${name} of next week` : READINGS.next[ctx.choices.next];
      if (node.how === 'after-next') { n += 7; why = `a week after next ${name} (${why})`; }
    } else {
      const back = (w0 - wd + 7) % 7;
      const nearest = ref - (back === 0 ? 7 : back);
      const lastWeek = inWeek(-1);
      if (nearest !== lastWeek) ctx.flag('last');
      n = ctx.choices.last === 'last-week' ? lastWeek : nearest;
      why = nearest === lastWeek ? `the ${name} of last week` : READINGS.last[ctx.choices.last];
      if (node.how === 'before-last') { n -= 7; why = `a week before last ${name} (${why})`; }
    }
    inRange(n);
    const said = { this: name, next: `next ${name}`, last: `last ${name}`, 'after-next': `${name} after next`, 'before-last': `${name} before last` }[node.how];
    ctx.step(`"${said}" from ${long(ref)}: ${why}, ${long(n)}`);
    return n;
  }

  // Move a date that is not a business day, if asked.
  function roll(n, rule, ctx) {
    if (rule === 'none' || !offDay(ctx.region, n, ctx.own)) return n;
    const dir = rule === 'preceding' ? -1 : 1;
    let d = n;
    do { d = inRange(d + dir); } while (offDay(ctx.region, d, ctx.own));
    if (rule === 'modified-following' && civilFromDays(d)[1] !== civilFromDays(n)[1]) {
      d = n;
      do { d = inRange(d - 1); } while (offDay(ctx.region, d, ctx.own));
    }
    const why = offDay(ctx.region, n, ctx.own);
    ctx.step(`${long(n)} is not a business day (${why.weekend ? 'a weekend' : why.holiday ?? 'your day off'}); rolled ${rule.replace('-', ' ')} to ${long(d)}`);
    return d;
  }

  function run(tree, opts, choices) {
    const ctx = {
      ref: opts.refDay,
      region: opts.region,
      own: opts.own,
      calendarWords: opts.region === NONE ? 'weekends only' : `weekends and ${REGION_NAMES[opts.region]} holidays`,
      choices,
      flags: new Set(),
      steps: [],
      holidays: [],
      daysOff: [],
      flag(k) { this.flags.add(k); },
      step(s) { this.steps.push(s); },
    };
    let day = evaluate(tree, ctx);
    const unrolled = day;
    day = roll(day, opts.roll, ctx);
    return { day, unrolled, ctx };
  }

  // Normalise and check the options; throws ResolveError naming the field.
  function options(o = {}) {
    const ref = o.ref;
    const refDay = dayOfIso(ref);
    if (refDay === null) throw new ResolveError('ref must be a real date written like 2026-11-07 (or "today" with a timeZone).', 'ref');
    inRange(refDay);
    const region = o.region ?? 'US';
    if (!regionOk(region)) throw new ResolveError(`region must be one of ${Object.keys(REGION_NAMES).map((r) => `"${r}"`).join(', ')}.`, 'region');
    const weekdayRule = o.weekdayRule ?? 'nearest';
    if (!WEEKDAY_RULES.includes(weekdayRule)) throw new ResolveError('weekdayRule must be "nearest" or "next-week".', 'weekdayRule');
    const dateOrder = o.dateOrder ?? 'MDY';
    if (!DATE_ORDERS.includes(dateOrder)) throw new ResolveError('dateOrder must be "MDY" or "DMY".', 'dateOrder');
    const rollRule = o.roll ?? 'none';
    if (!ROLLS.includes(rollRule)) throw new ResolveError(`roll must be one of ${ROLLS.join(', ')}.`, 'roll');
    let own = null;
    if (o.daysOff !== undefined && o.daysOff !== null) {
      if (!Array.isArray(o.daysOff) || !o.daysOff.every(isRealDate)) throw new ResolveError('daysOff must be a list of dates like 2026-12-24.', 'daysOff');
      own = new Set(o.daysOff);
    }
    return { ref, refDay, refSource: o.refSource ?? 'given', timeZone: o.timeZone ?? null, region, weekdayRule, dateOrder, roll: rollRule, own };
  }

  // Resolve one phrase. opts: { ref: 'YYYY-MM-DD', refSource?, timeZone?, region?, daysOff?,
  // weekdayRule?, dateOrder?, roll? }.
  function resolve(text, rawOpts) {
    const opts = options(rawOpts);
    const tree = parse(text);
    const choices = {
      ...DEFAULT_CHOICES,
      next: opts.weekdayRule === 'next-week' ? 'next-week' : 'nearest',
      last: opts.weekdayRule === 'next-week' ? 'last-week' : 'nearest',
      dateOrder: opts.dateOrder,
    };
    const main = run(tree, opts, choices);
    // Other readings: flip each open choice on its own and keep the ones that give another date.
    const readings = [];
    for (const k of main.ctx.flags) {
      const flipped = { ...choices, [k]: OTHER[k][choices[k]] };
      let alt;
      try { alt = run(tree, opts, flipped); } catch { continue; }
      if (alt.day === main.day) continue;
      readings.push({ reading: `${k}:${flipped[k]}`, means: `${{ next: '"next <weekday>"', last: '"last <weekday>"', sameDay: 'a weekday that is the reference date\'s', yearless: 'a date with no year', weekEnd: 'the end of a week', dateOrder: 'a numeric date' }[k]} as ${READINGS[k][flipped[k]]}`, date: isoOfDay(alt.day), weekday: WEEKDAYS[weekdayOfDay(alt.day)] });
    }
    const used = [...main.ctx.flags].map((k) => ({ reading: `${k}:${choices[k]}`, means: READINGS[k][choices[k]] }));
    const day = main.day;
    const iso = isoOfDay(day);
    const off = offDay(opts.region, day, opts.own);
    const out = {
      text,
      date: iso,
      weekday: WEEKDAYS[weekdayOfDay(day)],
      dateText: long(day),
      isoWeek: isoWeek(day),
      dayOfYear: dayOfYear(day),
      calendarDaysFromRef: day - opts.refDay,
      businessDay: off === null,
      ambiguous: readings.length > 0,
    };
    if (readings.length) {
      out.readings = [{ reading: used.map((u) => u.reading).join(','), means: 'the answer above', date: iso, weekday: out.weekday }, ...readings];
    }
    if (opts.roll !== 'none' && main.unrolled !== day) out.rolledFrom = isoOfDay(main.unrolled);
    out.holidaysSkipped = dedupe(main.ctx.holidays);
    if (opts.own) out.daysOffSkipped = dedupe(main.ctx.daysOff);
    out.steps = [`Reference date: ${long(opts.refDay)}${opts.refSource === 'today' ? ` (today in ${opts.timeZone})` : ''}`, ...main.ctx.steps];
    out.assumptions = {
      ref: opts.ref,
      refWeekday: WEEKDAYS[weekdayOfDay(opts.refDay)],
      refSource: opts.refSource,
      ...(opts.timeZone ? { timeZone: opts.timeZone } : {}),
      region: opts.region,
      holidayCalendar: REGION_NAMES[opts.region],
      weekdayRule: opts.weekdayRule,
      dateOrder: opts.dateOrder,
      roll: opts.roll,
      ...(used.length ? { readingsUsed: used } : {}),
      rules: RULES_TEXT,
    };
    if (opts.region === bd.IN) out.assumptions.note = bd.IN_NOTE;
    return out;
  }

  // Resolve several phrases with the same options. Throws on the first one that cannot be resolved,
  // naming it, so a batch is all or nothing (and nothing is charged for a refused batch).
  function resolveMany(texts, rawOpts) {
    if (!Array.isArray(texts) || !texts.length || texts.length > MAX_TEXTS) throw new ResolveError(`texts must be a list of 1 to ${MAX_TEXTS} phrases.`, 'texts');
    return texts.map((t, i) => {
      try { return resolve(t, rawOpts); } catch (e) {
        if (e instanceof ResolveError && e.field === 'text') throw new ResolveError(`Phrase ${i + 1} ("${String(t).slice(0, 60)}"): ${e.message}`, `texts.${i}`);
        throw e;
      }
    });
  }

  return { resolve, resolveMany, regions: REGION_NAMES };
}

function dedupe(list) {
  const seen = new Set();
  return list.filter((h) => { const k = `${h.date}|${h.name}`; if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

// The fixed conventions, as every answer states them.
export const RULES_TEXT = [
  'The start day is not counted: 1 day after a Friday is the Saturday, 1 business day after a Friday is the Monday.',
  'Business days skip Saturdays, Sundays and the chosen calendar\'s holidays (US: the federal holidays of 5 U.S.C. 6103 on the days OPM observes them).',
  'Adding months, quarters or years keeps the day of the month, or the month\'s last day when it is shorter (January 31 + 1 month = February 28 or 29).',
  'Weeks run Monday to Sunday (ISO 8601).',
];
