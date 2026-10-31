// Business-day arithmetic for US federal and England & Wales holidays.
//
// Pure and dependency-free: Node (tool.js, tests) and the browser (page.js) load this same file.
// Dates are 'YYYY-MM-DD' strings. All arithmetic is on whole day numbers (days since
// 1970-01-01), never on Date objects, so the time zone of the machine cannot change an answer.
//
// Sources for the rules:
//  US: 5 U.S.C. 6103 and OPM's federal holiday list. Uniform Monday Holiday Act (1971):
//      Washington's Birthday, Memorial Day, Columbus Day on Mondays; Veterans Day on the fourth
//      Monday of October 1971-1977, back to 11 November from 1978. Martin Luther King Jr. Day from
//      1986. Juneteenth from 2021. A fixed-date holiday on a Saturday is observed on the Friday, on a
//      Sunday on the Monday. That includes 1 January on a Saturday: it is observed on Friday 31
//      December (5 U.S.C. 6103(b); OPM lists Friday 31 December 2021 as New Year's Day). That day
//      belongs to the previous year, so it is generated in that year's list to keep each list in its year.
//  England and Wales: Banking and Financial Dealings Act 1971 and royal proclamations. New Year's
//      Day from 1974, the early May bank holiday from 1978. A holiday that lands on a weekend moves
//      to the next weekday that is not already a holiday. One-off changes are in GB_MOVED and GB_EXTRA.

export const MIN_YEAR = 1971;
export const MAX_YEAR = 2100;
export const REGIONS = { US: 'United States (federal)', 'GB-ENG': 'England and Wales' };
export const RANGE_MESSAGE = `Dates must fall between ${MIN_YEAR} and ${MAX_YEAR}.`;

// ---------- calendar arithmetic ----------

// Days since 1970-01-01 for a proleptic Gregorian date (Hinnant's algorithm).
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

const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
export const monthLength = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];

const ISO_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

function parts(iso) {
  const m = typeof iso === 'string' ? ISO_RE.exec(iso) : null;
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (mo < 1 || mo > 12 || d < 1 || d > monthLength(y, mo)) return null;
  return [y, mo, d];
}

// True for a real calendar date written as YYYY-MM-DD (any year).
export function isRealDate(iso) {
  return parts(iso) !== null;
}

const pad = (n, w) => String(n).padStart(w, '0');
const MIN_DAY = daysFromCivil(MIN_YEAR, 1, 1);
const MAX_DAY = daysFromCivil(MAX_YEAR, 12, 31);

// The day number of a supported date. Throws TypeError for text that is not a real date and
// RangeError for a real date outside 1971-2100.
export function dayNumber(iso) {
  const p = parts(iso);
  if (!p) throw new TypeError('Dates must look like 2026-07-01 and be real calendar dates.');
  if (p[0] < MIN_YEAR || p[0] > MAX_YEAR) throw new RangeError(RANGE_MESSAGE);
  return daysFromCivil(...p);
}

export function isoOf(n) {
  const [y, m, d] = civilFromDays(n);
  return `${pad(y, 4)}-${pad(m, 2)}-${pad(d, 2)}`;
}

// 0 = Sunday ... 6 = Saturday. 1970-01-01 was a Thursday.
const weekdayOfDay = (n) => (((n + 4) % 7) + 7) % 7;
export const weekdayOf = (iso) => weekdayOfDay(dayNumber(iso));
const isWeekend = (n) => { const w = weekdayOfDay(n); return w === 0 || w === 6; };

// The nth (1-based) given weekday of a month, as a day number.
function nthWeekday(y, m, weekday, n) {
  const first = daysFromCivil(y, m, 1);
  return first + ((weekday - weekdayOfDay(first) + 7) % 7) + (n - 1) * 7;
}

function lastWeekday(y, m, weekday) {
  const last = daysFromCivil(y, m, monthLength(y, m));
  return last - ((weekdayOfDay(last) - weekday + 7) % 7);
}

// ---------- Easter ----------

// Anonymous Gregorian algorithm (Meeus/Jones/Butcher).
export function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}

// ---------- United States (federal) ----------

const MON = 1;
const THU = 4;

function usHolidays(y) {
  const out = [];
  const add = (day, name) => out.push({ day, name });
  // A fixed date: Saturday -> Friday, Sunday -> Monday. A Saturday 1 January is observed on the
  // previous 31 December, which the previous year's list adds below.
  const fixed = (m, d, name, { moveSaturday = true } = {}) => {
    const day = daysFromCivil(y, m, d);
    const wd = weekdayOfDay(day);
    if (wd === 6) { if (moveSaturday) add(day - 1, `${name} (observed)`); } else if (wd === 0) add(day + 1, `${name} (observed)`);
    else add(day, name);
  };
  fixed(1, 1, "New Year's Day", { moveSaturday: false });
  if (weekdayOfDay(daysFromCivil(y + 1, 1, 1)) === 6) add(daysFromCivil(y, 12, 31), "New Year's Day (observed)");
  if (y >= 1986) add(nthWeekday(y, 1, MON, 3), 'Birthday of Martin Luther King Jr.');
  add(nthWeekday(y, 2, MON, 3), "Washington's Birthday");
  add(lastWeekday(y, 5, MON), 'Memorial Day');
  if (y >= 2021) fixed(6, 19, 'Juneteenth National Independence Day');
  fixed(7, 4, 'Independence Day');
  add(nthWeekday(y, 9, MON, 1), 'Labor Day');
  add(nthWeekday(y, 10, MON, 2), 'Columbus Day');
  if (y <= 1977) add(nthWeekday(y, 10, MON, 4), 'Veterans Day');
  else fixed(11, 11, 'Veterans Day');
  add(nthWeekday(y, 11, THU, 4), 'Thanksgiving Day');
  fixed(12, 25, 'Christmas Day');
  return out;
}

// ---------- England and Wales ----------

// A standard holiday moved for a royal or national occasion: { standard id: { year: [date, name] } }.
const GB_MOVED = {
  'early-may': {
    1995: ['1995-05-08', 'Early May bank holiday (moved for the 50th anniversary of VE Day)'],
    2020: ['2020-05-08', 'Early May bank holiday (moved for the 75th anniversary of VE Day)'],
  },
  spring: {
    1977: ['1977-06-06', 'Spring bank holiday (moved for the Silver Jubilee)'],
    2002: ['2002-06-04', 'Spring bank holiday (moved for the Golden Jubilee)'],
    2012: ['2012-06-04', 'Spring bank holiday (moved for the Diamond Jubilee)'],
    2022: ['2022-06-02', 'Spring bank holiday (moved for the Platinum Jubilee)'],
  },
};

// Extra one-off bank holidays on top of the usual ones.
const GB_EXTRA = [
  ['1973-11-14', 'Wedding of Princess Anne'],
  ['1977-06-07', 'Silver Jubilee bank holiday'],
  ['1981-07-29', 'Wedding of Prince Charles and Lady Diana Spencer'],
  ['1999-12-31', 'Millennium bank holiday'],
  ['2002-06-03', 'Golden Jubilee bank holiday'],
  ['2011-04-29', 'Wedding of Prince William and Catherine Middleton'],
  ['2012-06-05', 'Diamond Jubilee bank holiday'],
  ['2022-06-03', 'Platinum Jubilee bank holiday'],
  ['2022-09-19', 'State Funeral of Queen Elizabeth II'],
  ['2023-05-08', 'Coronation bank holiday'],
];

function gbHolidays(y) {
  const out = [];
  const add = (day, name) => out.push({ day, name });
  const moved = (id, standardDay, standardName) => {
    const m = GB_MOVED[id][y];
    if (m) add(dayNumber(m[0]), m[1]);
    else add(standardDay, standardName);
  };

  // Holidays tied to a weekday are never on a weekend. Fixed dates may be, and then move on.
  const easter = dayNumber(easterSunday(y));
  add(easter - 2, 'Good Friday');
  add(easter + 1, 'Easter Monday');
  if (y >= 1978) moved('early-may', nthWeekday(y, 5, MON, 1), 'Early May bank holiday');
  moved('spring', lastWeekday(y, 5, MON), 'Spring bank holiday');
  add(lastWeekday(y, 8, MON), 'Summer bank holiday');
  for (const [iso, name] of GB_EXTRA) if (Number(iso.slice(0, 4)) === y) add(dayNumber(iso), name);

  const taken = new Set(out.map((h) => h.day));
  const fixed = [];
  if (y >= 1974) fixed.push([daysFromCivil(y, 1, 1), "New Year's Day"]);
  fixed.push([daysFromCivil(y, 12, 25), 'Christmas Day'], [daysFromCivil(y, 12, 26), 'Boxing Day']);
  for (const [day, name] of fixed) if (!isWeekend(day)) { add(day, name); taken.add(day); }
  for (const [day, name] of fixed) {
    if (!isWeekend(day)) continue;
    let sub = day;
    do { sub += 1; } while (isWeekend(sub) || taken.has(sub));
    taken.add(sub);
    add(sub, `${name} (substitute day)`);
  }
  return out;
}

// ---------- holiday lookup ----------

const RULES = { US: usHolidays, 'GB-ENG': gbHolidays };
const cache = new Map();

function checkRegion(region) {
  if (!Object.prototype.hasOwnProperty.call(RULES, region)) throw new TypeError('Region must be "US" or "GB-ENG".');
}

// Sorted [{ date, name }] for one region and year. Each entry appears once.
export function holidays(region, year) {
  checkRegion(region);
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) throw new RangeError(RANGE_MESSAGE);
  const key = `${region}:${year}`;
  let list = cache.get(key);
  if (!list) {
    const seen = new Set();
    list = RULES[region](year)
      .map((h) => ({ date: isoOf(h.day), name: h.name }))
      .filter((h) => { const k = `${h.date}|${h.name}`; if (seen.has(k)) return false; seen.add(k); return true; })
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    cache.set(key, list);
  }
  return list.map((h) => ({ ...h }));
}

// date -> [names] for a year; used by the day-by-day loops.
const mapCache = new Map();
function holidayMap(region, year) {
  const key = `${region}:${year}`;
  let map = mapCache.get(key);
  if (!map) {
    map = new Map();
    for (const h of holidays(region, year)) map.set(h.date, [...(map.get(h.date) ?? []), h.name]);
    mapCache.set(key, map);
  }
  return map;
}

// The holidays on one day number (empty when none).
function holidaysOn(region, day) {
  if (day < MIN_DAY || day > MAX_DAY) throw new RangeError(RANGE_MESSAGE);
  const iso = isoOf(day);
  return (holidayMap(region, Number(iso.slice(0, 4))).get(iso) ?? []).map((name) => ({ date: iso, name }));
}

// ---------- counting and adding ----------

// Business days d with start < d <= end. Negative when end is before start: the count over
// (end, start], negated. holidaysSkipped: holidays that fall on weekdays inside the counted range.
export function between(region, start, end) {
  checkRegion(region);
  const s = dayNumber(start);
  const e = dayNumber(end);
  if (e < s) {
    const back = between(region, end, start);
    return { businessDays: back.businessDays === 0 ? 0 : -back.businessDays, holidaysSkipped: back.holidaysSkipped };
  }
  let count = 0;
  const skipped = [];
  for (let d = s + 1; d <= e; d++) {
    if (isWeekend(d)) continue;
    const hs = holidaysOn(region, d);
    if (hs.length) skipped.push(...hs);
    else count += 1;
  }
  return { businessDays: count, holidaysSkipped: skipped };
}

// The date `days` business days after (or before, when negative) start. Zero returns start as given.
// holidaysSkipped: weekday holidays passed on the way, in date order.
export function addBusinessDays(region, start, days) {
  checkRegion(region);
  if (!Number.isInteger(days)) throw new TypeError('Days must be a whole number.');
  let d = dayNumber(start);
  if (days === 0) return { date: start, holidaysSkipped: [] };
  const step = days > 0 ? 1 : -1;
  let left = Math.abs(days);
  const skipped = [];
  while (left > 0) {
    d += step;
    if (d < MIN_DAY || d > MAX_DAY) throw new RangeError(RANGE_MESSAGE);
    if (isWeekend(d)) continue;
    const hs = holidaysOn(region, d);
    if (hs.length) skipped.push(...hs);
    else left -= 1;
  }
  if (step < 0) skipped.reverse();
  return { date: isoOf(d), holidaysSkipped: skipped };
}

// Every day from `from` to `to` inclusive, for drawing a calendar.
// [{ date, weekday (0 = Sunday), weekend, holiday (names joined, or null) }]
export function calendarDays(region, from, to) {
  checkRegion(region);
  const s = dayNumber(from);
  const e = dayNumber(to);
  const out = [];
  for (let d = s; d <= e; d++) {
    const hs = holidaysOn(region, d);
    out.push({ date: isoOf(d), weekday: weekdayOfDay(d), weekend: isWeekend(d), holiday: hs.length ? hs.map((h) => h.name).join('; ') : null });
  }
  return out;
}
