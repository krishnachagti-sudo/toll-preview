// Business-day arithmetic for US federal, England & Wales and India (central government, Delhi) holidays.
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
//  India (central government, Delhi): a table, IN_LIST below, copied from the Department of Personnel
//      and Training's office memorandum for each year (its sources are listed there). Festival dates
//      follow lunar calendars, so there is no rule to compute; a year is covered only once its
//      memorandum has been read, and other years are refused (IN_YEARS).

export const MIN_YEAR = 1971;
export const MAX_YEAR = 2100;
export const IN = 'IN-CENTRAL-DELHI';
export const REGIONS = { US: 'United States (federal)', 'GB-ENG': 'England and Wales', [IN]: 'India (central government, Delhi)' };
export const RANGE_MESSAGE = `Dates must fall between ${MIN_YEAR} and ${MAX_YEAR}.`;
// India is covered only for the years whose official holiday memorandum has been read.
export const IN_YEARS = { min: 2025, max: 2027 };
export const IN_RANGE_MESSAGE = `India (central government, Delhi) covers ${IN_YEARS.min} to ${IN_YEARS.max} only: the years whose official DoPT holiday list has been checked. Other years are refused rather than guessed.`;
// What every India answer says it is.
export const IN_NOTE = 'Closed (gazetted) holidays of central government administrative offices in Delhi and New Delhi, from the yearly office memorandum of the Department of Personnel and Training. Not restricted (optional) holidays, not any state\'s list and not bank holidays: states and banks differ. Weekends are Saturday and Sunday (the 5-day week).';

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

// ---------- India (central government, Delhi) ----------

// The closed (gazetted) holidays that the Government of India, Ministry of Personnel, Public
// Grievances and Pensions, Department of Personnel and Training (DoPT) declares each year for the
// administrative offices of the Central Government located at Delhi/New Delhi: Annexure-I of its
// office memorandum "Holidays to be observed in Central Government Offices during the year YYYY",
// with any later DoPT memorandum that moves one of them or declares another holiday for all Central
// Government offices. Names and dates are as printed; every printed weekday was checked.
// Not included: restricted holidays (Annexure-II), the lists of offices outside Delhi and of the
// states, bank holidays, paid holidays for voting, and one-off office closures (such as the closure
// of Delhi offices on 11 September 2026 for the BRICS summit, DoPT O.M. No. 12/7/2023-JCA dated
// 3 September 2026), as the US list leaves out one-off closures ordered by the President.
// A holiday on a Saturday or Sunday is not moved: the memorandum allows no substitute day (para 3.2).
//
// Weekends: Saturday and Sunday. DoPT O.M. No. 13/4/85-JCA dated 21 May 1985 introduced the 5-day
// week in the civil administrative offices of the Government of India from 3 June 1985, Monday to
// Friday with all Saturdays closed (https://documents.doptcirculars.nic.in/D2/D02est/jcm3.html,
// read 2026-11-03).
//
// Sources, all read 2026-11-03 from DoPT's circulars archive (listed at
// https://doptcirculars.nic.in/Default.aspx?URL=dFaVfDsok83H):
//  2025: O.M. F.No.12/2/2023-JCA dated 9 July 2024,
//        https://documents.doptcirculars.nic.in/D2/D02est/List%20of%20holidays%202025KtKLw.pdf
//        plus O.M. F.No.12/4/2020-JCA2 dated 27 March 2025 (14 April 2025, Dr. B.R. Ambedkar),
//        https://documents.doptcirculars.nic.in/D2/D02est/Holiday%20on%2014th%20April%202025%20Birthday%20of%20Dr%20B%20R%20AmbedkarDHZ8b.pdf
//  2026: O.M. F.No.12/2/2023-JCA dated 3 July 2025,
//        https://documents.doptcirculars.nic.in/D2/D02est/Holidays%20to%20be%20observed%20in%20Central%20Government%20Offices%20during%20the%20year%2020265vgBs.pdf
//        plus O.M. F.No.12/3/2023-JCA dated 22 May 2026, moving Id-ul-Zuha (Bakrid) from 27 to
//        28 May 2026 for Delhi/New Delhi offices,
//        https://documents.doptcirculars.nic.in/D2/D02est/Change%20in%20the%20date%20of%20holiday%20of%20Id-ul-Zuhamg709.PDF
//        DoPT's lists hold no 2026 memorandum for 14 April (Dr. B.R. Ambedkar), so that day is not in 2026.
//  2027: O.M. F.No.12/2/2023-JCA dated 16 July 2026 (DoPT's site gives 17 July 2026 as the file date),
//        https://documents.doptcirculars.nic.in/D2/D02est/Holiday%20list%202027Cj0HU.PDF
//        also at https://dopt.gov.in/static/uploads/2026/08/2ffd159748162a48c025f7e6ca5807d5.pdf
//        Dates of Id-ul-Fitr, Id-ul-Zuha, Muharram and Id-e-Milad may still be moved on the sighting
//        of the moon (para 5.1); a change is added here when DoPT publishes it.
export const IN_SOURCES = {
  2025: [
    { text: 'DoPT O.M. F.No.12/2/2023-JCA dated 9 July 2024: holidays during 2025', href: 'https://documents.doptcirculars.nic.in/D2/D02est/List%20of%20holidays%202025KtKLw.pdf' },
    { text: 'DoPT O.M. F.No.12/4/2020-JCA2 dated 27 March 2025: holiday on 14 April 2025', href: 'https://documents.doptcirculars.nic.in/D2/D02est/Holiday%20on%2014th%20April%202025%20Birthday%20of%20Dr%20B%20R%20AmbedkarDHZ8b.pdf' },
  ],
  2026: [
    { text: 'DoPT O.M. F.No.12/2/2023-JCA dated 3 July 2025: holidays during 2026', href: 'https://documents.doptcirculars.nic.in/D2/D02est/Holidays%20to%20be%20observed%20in%20Central%20Government%20Offices%20during%20the%20year%2020265vgBs.pdf' },
    { text: 'DoPT O.M. F.No.12/3/2023-JCA dated 22 May 2026: Id-ul-Zuha (Bakrid) moved to 28 May 2026', href: 'https://documents.doptcirculars.nic.in/D2/D02est/Change%20in%20the%20date%20of%20holiday%20of%20Id-ul-Zuhamg709.PDF' },
  ],
  2027: [
    { text: 'DoPT O.M. F.No.12/2/2023-JCA dated 16 July 2026: holidays during 2027', href: 'https://documents.doptcirculars.nic.in/D2/D02est/Holiday%20list%202027Cj0HU.PDF' },
  ],
};
export const IN_WEEKEND_SOURCE = { text: 'DoPT O.M. No. 13/4/85-JCA dated 21 May 1985: the 5-day week', href: 'https://documents.doptcirculars.nic.in/D2/D02est/jcm3.html' };
export const IN_READ_ON = '2026-11-03';

// [month-day, name] per year, in date order.
const IN_LIST = {
  2025: [
    ['01-26', 'Republic Day'],
    ['02-26', 'Maha Shivaratri'],
    ['03-14', 'Holi'],
    ['03-31', 'Id-ul-Fitr'],
    ['04-10', 'Mahavir Jayanti'],
    ['04-14', 'Birthday of Dr. B.R. Ambedkar'],
    ['04-18', 'Good Friday'],
    ['05-12', 'Budha Purnima'],
    ['06-07', 'Id-ul-Zuha (Bakrid)'],
    ['07-06', 'Muharram'],
    ['08-15', 'Independence Day'],
    ['08-16', 'Janmashtami'],
    ['09-05', 'Milad-un-Nabi or Id-e-Milad (Birthday of Prophet Mohammad)'],
    ['10-02', "Mahatma Gandhi's Birthday"],
    ['10-02', 'Dussehra'],
    ['10-20', 'Diwali (Deepavali)'],
    ['11-05', "Guru Nanak's Birthday"],
    ['12-25', 'Christmas Day'],
  ],
  2026: [
    ['01-26', 'Republic Day'],
    ['03-04', 'Holi'],
    ['03-21', 'Id-ul-Fitr'],
    ['03-26', 'Ram Navami'],
    ['03-31', 'Mahavir Jayanti'],
    ['04-03', 'Good Friday'],
    ['05-01', 'Budha Purnima'],
    ['05-28', 'Id-ul-Zuha (Bakrid)'], // 27 May in the list; moved by the O.M. of 22 May 2026
    ['06-26', 'Muharram'],
    ['08-15', 'Independence Day'],
    ['08-26', 'Milad-un-Nabi or Id-e-Milad (Birthday of Prophet Mohammad)'],
    ['09-04', 'Janmashtami (Vaishnav)'], // printed "Vaishnva"
    ['10-02', "Mahatma Gandhi's Birthday"],
    ['10-20', 'Dussehra'],
    ['11-08', 'Diwali (Deepavali)'],
    ['11-24', "Guru Nanak's Birthday"],
    ['12-25', 'Christmas Day'],
  ],
  2027: [
    ['01-26', 'Republic Day'],
    ['03-10', 'Id-ul-Fitr'],
    ['03-23', 'Holi'],
    ['03-26', 'Good Friday'],
    ['04-15', 'Ram Navami'],
    ['04-19', 'Mahavir Jayanti'],
    ['05-17', 'Id-ul-Zuha (Bakrid)'],
    ['05-20', 'Budha Purnima'],
    ['06-16', 'Muharram'],
    ['08-15', 'Independence Day'],
    ['08-15', 'Milad-un-Nabi or Id-e-Milad (Prophet Mohammad\'s Birthday)'],
    ['08-25', 'Janmashtami (Vaishnav)'],
    ['10-02', "Mahatma Gandhi's Birthday"],
    ['10-09', 'Dussehra (Vijaya Dashmi)'],
    ['10-29', 'Diwali (Deepavali)'],
    ['11-14', "Guru Nanak's Birthday"],
    ['12-25', 'Christmas Day'],
  ],
};

function inHolidays(y) {
  return IN_LIST[y].map(([md, name]) => ({ day: daysFromCivil(y, Number(md.slice(0, 2)), Number(md.slice(3))), name }));
}

// ---------- holiday lookup ----------

const RULES = { US: usHolidays, 'GB-ENG': gbHolidays, [IN]: inHolidays };

// The years a region covers, and what a call outside them is told.
const yearsOf = (region) => (region === IN ? [IN_YEARS.min, IN_YEARS.max] : [MIN_YEAR, MAX_YEAR]);
export const rangeMessage = (region) => (region === IN ? IN_RANGE_MESSAGE : RANGE_MESSAGE);
const firstDay = (region) => daysFromCivil(yearsOf(region)[0], 1, 1);
const lastDay = (region) => daysFromCivil(yearsOf(region)[1], 12, 31);
// True when a day number falls in a year the region covers.
const covers = (region, n) => n >= firstDay(region) && n <= lastDay(region);

// Every day an answer depends on must be in a covered year. The day a count or a step starts from is
// never itself counted, so it may be the day before the first covered year (31 December 2024 for India).
// dayNumber, with the region's own message for a year outside 1971-2100.
function dayIn(region, iso) {
  try { return dayNumber(iso); } catch (e) { if (e instanceof RangeError) throw new RangeError(rangeMessage(region)); throw e; }
}

function checkSpan(region, lo, hi) {
  if (lo < firstDay(region) - 1 || hi > lastDay(region)) throw new RangeError(rangeMessage(region));
}
const cache = new Map();

function checkRegion(region) {
  if (!Object.prototype.hasOwnProperty.call(RULES, region)) throw new TypeError(`Region must be "US", "GB-ENG" or "${IN}".`);
}

// Sorted [{ date, name }] for one region and year. Each entry appears once.
export function holidays(region, year) {
  checkRegion(region);
  const [lo, hi] = yearsOf(region);
  if (!Number.isInteger(year) || year < lo || year > hi) throw new RangeError(rangeMessage(region));
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
  if (!covers(region, day)) throw new RangeError(rangeMessage(region));
  const iso = isoOf(day);
  return (holidayMap(region, Number(iso.slice(0, 4))).get(iso) ?? []).map((name) => ({ date: iso, name }));
}

// ---------- counting and adding ----------

// Your own days off (company closures, state or local holidays), as a Set of 'YYYY-MM-DD', or
// null when none were given. Only the dates are compared, so a day off outside 1971-2100 is
// simply never met.
export const OWN_DAY_OFF = 'Your day off';
function ownSet(daysOff) {
  if (daysOff === undefined || daysOff === null) return null;
  if (!Array.isArray(daysOff) || !daysOff.every(isRealDate)) throw new TypeError('Days off must be a list of dates like 2026-07-01.');
  return new Set(daysOff);
}

// What one weekday is: a public holiday (listed in holidaysSkipped), one of your own days off
// that is not also a public holiday (listed in daysOffSkipped), or null for a business day.
function offOn(region, d, own) {
  const hs = holidaysOn(region, d);
  if (hs.length) return { holidays: hs };
  const iso = isoOf(d);
  return own && own.has(iso) ? { own: { date: iso, name: OWN_DAY_OFF } } : null;
}

// The answer, with daysOffSkipped only when days off were given, so a call without them gets
// exactly the answer it always did.
const withOwn = (result, own, skipped) => (own ? { ...result, daysOffSkipped: skipped } : result);

// An India answer says which list it used (IN_NOTE); the other regions' answers are unchanged.
const noted = (region, result) => (region === IN ? { ...result, note: IN_NOTE } : result);

// Business days d with start < d <= end. Negative when end is before start: the count over
// (end, start], negated. holidaysSkipped: holidays that fall on weekdays inside the counted range.
// daysOff (optional): your own dates to skip too; each one that falls on a weekday in the range
// and is not already a holiday is listed in daysOffSkipped.
export function between(region, start, end, daysOff) {
  checkRegion(region);
  const own = ownSet(daysOff);
  const s = dayIn(region, start);
  const e = dayIn(region, end);
  if (e < s) {
    const back = between(region, end, start, daysOff);
    return { ...back, businessDays: back.businessDays === 0 ? 0 : -back.businessDays };
  }
  checkSpan(region, s, e);
  let count = 0;
  const skipped = [];
  const ownSkipped = [];
  for (let d = s + 1; d <= e; d++) {
    if (isWeekend(d)) continue;
    const off = offOn(region, d, own);
    if (!off) count += 1;
    else if (off.holidays) skipped.push(...off.holidays);
    else ownSkipped.push(off.own);
  }
  return noted(region, withOwn({ businessDays: count, holidaysSkipped: skipped }, own, ownSkipped));
}

// The date `days` business days after (or before, when negative) start. Zero returns start as given.
// holidaysSkipped: weekday holidays passed on the way, in date order. daysOff as in between().
export function addBusinessDays(region, start, days, daysOff) {
  checkRegion(region);
  if (!Number.isInteger(days)) throw new TypeError('Days must be a whole number.');
  const own = ownSet(daysOff);
  let d = dayIn(region, start);
  if (days === 0) return noted(region, withOwn({ date: start, holidaysSkipped: [] }, own, []));
  checkSpan(region, d, d);
  const step = days > 0 ? 1 : -1;
  let left = Math.abs(days);
  const skipped = [];
  const ownSkipped = [];
  while (left > 0) {
    d += step;
    if (d < MIN_DAY || d > MAX_DAY || !covers(region, d)) throw new RangeError(rangeMessage(region));
    if (isWeekend(d)) continue;
    const off = offOn(region, d, own);
    if (!off) left -= 1;
    else if (off.holidays) skipped.push(...off.holidays);
    else ownSkipped.push(off.own);
  }
  if (step < 0) { skipped.reverse(); ownSkipped.reverse(); }
  return noted(region, withOwn({ date: isoOf(d), holidaysSkipped: skipped }, own, ownSkipped));
}

// Every day from `from` to `to` inclusive, for drawing a calendar.
// [{ date, weekday (0 = Sunday), weekend, holiday (names joined, or null) }]. A day in a year the
// region does not cover (India outside IN_YEARS) has holiday null and uncovered: true, so a page can
// grey it out rather than show it as a plain working day.
export function calendarDays(region, from, to) {
  checkRegion(region);
  const s = dayNumber(from);
  const e = dayNumber(to);
  const out = [];
  for (let d = s; d <= e; d++) {
    if (!covers(region, d)) {
      out.push({ date: isoOf(d), weekday: weekdayOfDay(d), weekend: isWeekend(d), holiday: null, uncovered: true });
      continue;
    }
    const hs = holidaysOn(region, d);
    out.push({ date: isoOf(d), weekday: weekdayOfDay(d), weekend: isWeekend(d), holiday: hs.length ? hs.map((h) => h.name).join('; ') : null });
  }
  return out;
}
