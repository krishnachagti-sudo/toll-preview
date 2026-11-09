// The Business days page. core.js (the same file the server uses) draws the worked example and
// the calendar; the answer for a real run always comes from the server through Endwise.run.
import {
  between, addBusinessDays, calendarDays, weekdayOf, dayNumber, isRealDate, monthLength, REGIONS,
  MIN_YEAR, MAX_YEAR, RANGE_MESSAGE, IN, IN_NOTE,
} from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'business-days';
const MAX_DRAWN_DAYS = 100;
const MAX_DAYS_OFF = 400;

// Words in other languages, by <html lang>. English is written in place below; say(key, english,
// ...args) gives the other language's word when it has one. page.hi.html is the Hindi page.
// HI_HOLIDAYS maps the engine's English holiday names to their common Hindi names (the same map is
// in server/lib/guides/pages/i18n-business-days.js; a test keeps the two equal).
const L = document.documentElement.lang.slice(0, 2);
const HI_HOLIDAYS = {
  'Republic Day': 'गणतंत्र दिवस',
  'Maha Shivaratri': 'महाशिवरात्रि',
  'Holi': 'होली',
  'Id-ul-Fitr': 'ईद-उल-फ़ित्र',
  'Mahavir Jayanti': 'महावीर जयंती',
  'Birthday of Dr. B.R. Ambedkar': 'डॉ. बी.आर. अंबेडकर का जन्मदिन (अंबेडकर जयंती)',
  'Good Friday': 'गुड फ्राइडे',
  'Ram Navami': 'राम नवमी',
  'Budha Purnima': 'बुद्ध पूर्णिमा',
  'Id-ul-Zuha (Bakrid)': 'ईद-उल-ज़ुहा (बकरीद)',
  'Muharram': 'मुहर्रम',
  'Independence Day': 'स्वतंत्रता दिवस',
  'Janmashtami': 'जन्माष्टमी',
  'Janmashtami (Vaishnav)': 'जन्माष्टमी (वैष्णव)',
  'Milad-un-Nabi or Id-e-Milad (Birthday of Prophet Mohammad)': 'मिलाद-उन-नबी या ईद-ए-मिलाद (पैगंबर मोहम्मद का जन्मदिन)',
  'Milad-un-Nabi or Id-e-Milad (Prophet Mohammad\'s Birthday)': 'मिलाद-उन-नबी या ईद-ए-मिलाद (पैगंबर मोहम्मद का जन्मदिन)',
  'Mahatma Gandhi\'s Birthday': 'महात्मा गांधी का जन्मदिन (गांधी जयंती)',
  'Dussehra': 'दशहरा',
  'Dussehra (Vijaya Dashmi)': 'दशहरा (विजयादशमी)',
  'Diwali (Deepavali)': 'दिवाली (दीपावली)',
  'Guru Nanak\'s Birthday': 'गुरु नानक का जन्मदिन',
  'Christmas Day': 'क्रिसमस',
  'Your day off': 'आपकी अपनी छुट्टी',
};
const STR = {
  hi: {
    weekdays: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
    weekdaysShort: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
    months: ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'],
    headings: ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि'],
    regionUS: 'अमेरिका की संघीय छुट्टियां।',
    regionGB: 'इंग्लैंड और वेल्स की बैंक छुट्टियां।',
    regionIN: 'दिल्ली और नई दिल्ली के केंद्र सरकार के कार्यालयों की राजपत्रित (बंद) छुट्टियां, DoPT की सालाना सूची से, 2025 से 2027 तक। इसमें प्रतिबंधित छुट्टियां, किसी राज्य की सूची और बैंक की छुट्टियां शामिल नहीं हैं।',
    regionNames: { US: 'अमेरिका (संघीय)', 'GB-ENG': 'इंग्लैंड और वेल्स', [IN]: 'भारत (केंद्र सरकार, दिल्ली)' },
    pickStart: 'शुरू की तारीख चुनें।',
    pickEnd: 'आखिरी तारीख चुनें।',
    notReal: (label) => `${label === 'Start' ? 'शुरू की तारीख' : 'आखिरी तारीख'} कैलेंडर की असली तारीख नहीं है।`,
    range: `तारीखें ${MIN_YEAR} से ${MAX_YEAR} के बीच की होनी चाहिए।`,
    offBad: (x) => `"${x}" पढ़ा नहीं जा सका। हर छुट्टी ऐसे लिखें: 2026-07-06, एक लाइन में एक या कॉमा से अलग।`,
    offMax: (n) => `अधिकतम ${n} छुट्टियां।`,
    daysBad: 'दिनों की संख्या -3650 से 3650 के बीच की पूर्ण संख्या होनी चाहिए।',
    btnAdd: 'तारीख निकालें',
    btnBetween: 'कार्य दिवस गिनें',
    hasNoDays: 'इस अवधि में कोई छुट्टी किसी कार्य दिवस पर नहीं पड़ी।',
    keyCounted: 'गिना गया कार्य दिवस',
    keyWeekend: 'सप्ताहांत',
    keyHoliday: 'छुट्टी',
    keyOwn: 'आपकी छुट्टी',
    keyStart: 'शुरू का दिन',
    keyResult: 'नतीजा',
    legend: 'संकेत',
    tagStart: 'शुरू',
    tagEnd: 'आखिर',
    tagResult: 'नतीजा',
    saidUncovered: 'यह साल शामिल नहीं',
    saidHoliday: (name) => `छुट्टी, ${name}`,
    saidOwn: 'आपकी छुट्टी',
    saidBusiness: (n) => `कार्य दिवस ${n}`,
    saidStart: 'शुरू का दिन',
    saidEnd: 'आखिरी दिन',
    saidResult: 'नतीजा',
    tooLong: (n) => `यह अवधि ${n} दिन लंबी है, इसे दिन-दर-दिन दिखाना संभव नहीं। इसमें पड़ने वाली छुट्टियां ऊपर सूची में हैं।`,
    skippedHead: (n) => `छोड़ी गई छुट्टियां (${n})`,
    noneFell: 'इस अवधि में कोई छुट्टी किसी कार्य दिवस पर नहीं पड़ी।',
    ownHead: (n) => `छोड़ी गई आपकी छुट्टियां (${n})`,
    ownNone: 'आपकी कोई छुट्टी इस अवधि में कार्य दिवस पर नहीं पड़ी, या वह पहले से सरकारी छुट्टी थी।',
    unused: (list, reversed) => `कैलेंडर पर चिह्नित, पर गिनती से बाहर: ${list}. ${reversed ? 'आखिरी तारीख खुद कभी नहीं गिनी जाती।' : 'शुरू का दिन कभी नहीं गिना जाता।'}`,
    bdOne: 'कार्य दिवस',
    bdMany: 'कार्य दिवस',
    subForward: (a, b, where) => `${a} के बाद से ${b} तक (${b} समेत)। ${where}।`,
    subBack: (a, b, where) => `उल्टी गिनती: ${a} के बाद से ${b} तक (${b} समेत)। ${where}।`,
    subZero: (a, where) => `${a} से 0 कार्य दिवस बाद वही दिन है। ${where}।`,
    subAdd: (n, dir, a, where) => `${a} से ${n} कार्य दिवस ${dir}। ${where}।`,
    after: 'बाद',
    before: 'पहले',
    sheetLabel: 'हल किया हुआ उदाहरण',
    tagExample: 'उदाहरण',
    tagRun: 'आपका नतीजा',
    exampleLine: (x) => `उदाहरण: ${x}`,
    itemStart: 'शुरू का दिन, गिना नहीं गया',
    itemBusiness: 'कार्य दिवस',
    itemBusinessRun: (a, b) => `कार्य दिवस ${a} से ${b}`,
    itemWeekend: 'सप्ताहांत',
    itemOwn: 'आपकी छुट्टी',
    itemEnd: 'आखिरी दिन',
    itemResult: 'नतीजा',
    to: 'से',
    charged: (amount, balance) => `${amount} कटे। आपका बैलेंस ${balance} है।`,
    freeRun: (n) => `मुफ़्त रन। आज आपके ${n} मुफ़्त रन बचे हैं।`,
    signIn: 'साइन इन करें',
    openAccount: 'अपना खाता खोलें',
    priceAccount: (price) => `हर रन का खर्च ${price} है, आपके बैलेंस से कटता है।`,
    priceFree: (price) => `हर रन का खर्च ${price} है। खाते के बिना रोज़ 5 मुफ़्त रन मिलते हैं।`,
    runNoteFree: 'रोज़ 5 मुफ़्त रन, खाता ज़रूरी नहीं।',
    partRun: (price) => `${price} प्रति रन`,
    partBalance: 'आपके बैलेंस से कटता है',
    partFree: 'खाते के बिना रोज़ 5 मुफ़्त रन',
    linkedNote: (btn) => `यह आपके खोले लिंक से इसी पेज पर निकाला गया है। असली रन के लिए "${btn}" दबाएं।`,
    exampleNote: 'यह इसी पेज पर निकाला गया उदाहरण है। असली रन के लिए "कार्य दिवस गिनें" दबाएं।',
    inNote: 'दिल्ली और नई दिल्ली के केंद्र सरकार के प्रशासनिक कार्यालयों की राजपत्रित (बंद) छुट्टियां, कार्मिक एवं प्रशिक्षण विभाग (DoPT) के सालाना कार्यालय ज्ञापन से। इसमें प्रतिबंधित (वैकल्पिक) छुट्टियां, किसी राज्य की सूची और बैंक की छुट्टियां शामिल नहीं हैं: राज्यों और बैंकों की छुट्टियां अलग होती हैं। सप्ताहांत शनिवार और रविवार है (5 दिन का सप्ताह)।',
    inRange: 'भारत (केंद्र सरकार, दिल्ली) में सिर्फ 2025 से 2027 शामिल हैं: जिन सालों की DoPT की आधिकारिक छुट्टी सूची जांची जा चुकी है। बाकी सालों को अंदाज़े से नहीं, मना कर दिया जाता है।',
  },
};
const say = (key, en, ...args) => {
  const v = STR[L]?.[key];
  return v === undefined ? en : (typeof v === 'function' ? v(...args) : v);
};
const NUM = L === 'hi' ? 'en-IN' : 'en-US';
const holidayName = (name) => (L === 'hi' ? HI_HOLIDAYS[name] ?? name : name);

const WEEKDAYS = say('weekdays', ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
const MONTHS = say('months', ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);
const HEADINGS = say('headings', ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
const WEEKDAYS_SHORT = say('weekdaysShort', WEEKDAYS.map((x) => x.slice(0, 3)));
const MONTHS_SHORT = L === 'hi' ? MONTHS : MONTHS.map((x) => x.slice(0, 3));
const REGION_HINTS = {
  US: say('regionUS', 'US federal holidays.'),
  'GB-ENG': say('regionGB', 'Bank holidays in England and Wales.'),
  [IN]: say('regionIN', 'Closed (gazetted) holidays of central government offices in Delhi and New Delhi, from DoPT\'s yearly list, 2025 to 2027. Not restricted holidays, not a state\'s list, not bank holidays.'),
};

const $ = (id) => document.getElementById(id);
const pick = (name) => document.querySelector(`input[name="${name}"]:checked`).value;

const part = (iso) => iso.split('-').map(Number);
const longDate = (iso) => { const [y, m, d] = part(iso); return `${WEEKDAYS[weekdayOf(iso)]} ${d} ${MONTHS[m - 1]} ${y}`; };
const shortDate = (iso) => { const [y, m, d] = part(iso); return `${WEEKDAYS_SHORT[weekdayOf(iso)]} ${d} ${MONTHS_SHORT[m - 1]} ${y}`; };
const plural = (n, one, many) => `${Math.abs(n).toLocaleString(NUM)} ${Math.abs(n) === 1 ? one : many}`;
const signed = (n) => (n < 0 ? `−${Math.abs(n)}` : String(n));

// ---------- form ----------

const FIELD_ERRORS = { start: 'bd-start-err', end: 'bd-end-err', days: 'bd-days-err', daysOff: 'bd-off-err' };

function clearErrors() {
  $('bd-error').textContent = '';
  for (const id of Object.values(FIELD_ERRORS)) $(id).textContent = '';
}

// The server names a bad day off by its place in the list (daysOff.3); it shows under the box.
const fieldOf = (k) => k.split('.')[0];

function showFieldErrors(fields) {
  const known = Object.keys(fields).filter((k) => FIELD_ERRORS[fieldOf(k)]);
  for (const k of known) $(FIELD_ERRORS[fieldOf(k)]).textContent = fields[k];
  const fold = $('bd-off-fold');
  if (fold && known.some((k) => fieldOf(k) === 'daysOff')) fold.open = true;
  return known.length === Object.keys(fields).length;
}

function checkDate(label, value) {
  if (!value) return label === 'Start' ? say('pickStart', 'Pick a start date.') : say('pickEnd', 'Pick an end date.');
  if (!isRealDate(value)) return say('notReal', `${label} is not a real calendar date.`, label);
  const year = Number(value.slice(0, 4));
  if (year < MIN_YEAR || year > MAX_YEAR) return say('range', RANGE_MESSAGE);
  return null;
}

// The days off box: dates one per line or comma separated, in any order and repeated at will.
// { dates } sorted and once each, or { error } naming the first entry it could not read.
function readDaysOff(raw) {
  const dates = new Set();
  for (const item of raw.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean)) {
    if (!isRealDate(item)) return { error: say('offBad', `Could not read "${item.slice(0, 40)}". Write each day off like 2026-07-06, one per line or comma separated.`, item.slice(0, 40)) };
    dates.add(item);
  }
  if (dates.size > MAX_DAYS_OFF) return { error: say('offMax', `At most ${MAX_DAYS_OFF} days off.`, MAX_DAYS_OFF) };
  return { dates: [...dates].sort() };
}

// { input } for a good form, or { errors } for a bad one, so a typo never spends a run.
function readForm() {
  const op = pick('op');
  const region = pick('region');
  const start = $('bd-start').value.trim();
  const errors = {};
  const sErr = checkDate('Start', start);
  if (sErr) errors.start = sErr;
  const off = readDaysOff($('bd-off').value);
  if (off.error) errors.daysOff = off.error;
  // Only sent when there are some, so a run without them is the same call as before.
  const own = off.dates?.length ? { daysOff: off.dates } : {};
  if (op === 'between') {
    const end = $('bd-end').value.trim();
    const eErr = checkDate('End', end);
    if (eErr) errors.end = eErr;
    if (Object.keys(errors).length) return { errors };
    return { input: { op, region, start, end, ...own } };
  }
  const raw = $('bd-days').value.trim();
  const days = Number(raw);
  if (raw === '' || !Number.isInteger(days) || days < -3650 || days > 3650) errors.days = say('daysBad', 'Days must be a whole number from -3650 to 3650.');
  if (Object.keys(errors).length) return { errors };
  return { input: { op, region, start, days, ...own } };
}

function syncMode() {
  const adding = pick('op') === 'add';
  $('bd-end-field').hidden = adding;
  $('bd-days-field').hidden = !adding;
  if ($('bd-end-hint')) $('bd-end-hint').hidden = adding;
  if ($('bd-days-hint')) $('bd-days-hint').hidden = !adding;
  $('bd-run').textContent = adding ? say('btnAdd', 'Find the date') : say('btnBetween', 'Count business days');
  $('bd-region-hint').textContent = REGION_HINTS[pick('region')];
}

// ---------- reading a result ----------

// What to draw: the span of days, which days are counted (with their running number), and the marks.
function describe(input, result) {
  const isBetween = input.op === 'between';
  const s = input.start;
  let lo = s; let hi = s;
  let countFrom = null; // 'after' = (lo, hi], 'before' = [lo, hi) counted outward from the start day
  let landing = null;
  let end = null;
  let dir = 1;
  if (isBetween) {
    end = input.end;
    if (end >= s) { lo = s; hi = end; countFrom = 'after'; } else { lo = end; hi = s; countFrom = 'beforeInclusive'; dir = -1; }
  } else if (input.days > 0) {
    lo = s; hi = result.date; countFrom = 'after'; landing = result.date;
  } else if (input.days < 0) {
    lo = result.date; hi = s; countFrom = 'beforeExclusive'; landing = result.date; dir = -1;
  }
  return { lo, hi, countFrom, landing, end, start: s, dir };
}

const spanOf = (view) => dayNumber(view.hi) - dayNumber(view.lo) + 1;

// calendarDays with your own days off marked: own is true on a weekday that is not already a
// public holiday, the same rule the count uses.
function daysWithOwn(input, from, to) {
  const own = new Set(input.daysOff ?? []);
  return calendarDays(input.region, from, to).map((d) => ({ ...d, own: own.has(d.date) && !d.weekend && !d.holiday }));
}

function build(input, result) {
  const view = describe(input, result);
  // A range too long to draw has no day list: the server's holiday list is all that is shown.
  const days = spanOf(view) > MAX_DRAWN_DAYS ? [] : daysWithOwn(input, view.lo, view.hi);
  const isBusiness = (d) => !d.weekend && !d.holiday && !d.own;
  // Counted days, numbered from the start day outward.
  let counted = [];
  if (view.countFrom === 'after') counted = days.filter((d) => d.date > view.lo && isBusiness(d));
  else if (view.countFrom === 'beforeInclusive') counted = days.filter((d) => d.date > view.lo && isBusiness(d)).reverse();
  else if (view.countFrom === 'beforeExclusive') counted = days.filter((d) => d.date < view.hi && isBusiness(d)).reverse();
  const ordinals = new Map(counted.map((d, i) => [d.date, signed(view.dir * (i + 1))]));
  return { view, days, ordinals };
}

// ---------- drawing ----------

function dayCell(d, { view, ordinals }, info) {
  const inRange = d.date >= view.lo && d.date <= view.hi;
  const ord = ordinals.get(d.date);
  const classes = ['bd-day'];
  const said = [];
  if (!inRange) classes.push('out');
  if (d.uncovered) { classes.push('unk'); said.push(say('saidUncovered', 'year not covered')); }
  if (d.weekend) classes.push('we');
  if (d.holiday) { classes.push('hol'); said.push(say('saidHoliday', `holiday, ${d.holiday}`, holidayName(d.holiday))); }
  if (d.own) { classes.push('own'); said.push(say('saidOwn', 'your day off')); }
  if (ord !== undefined) { classes.push('counted'); said.push(say('saidBusiness', `business day ${ord}`, ord)); }
  let tag = null;
  if (d.date === view.start) { classes.push('start'); tag = say('tagStart', 'Start'); said.push(say('saidStart', 'start day')); }
  if (d.date === view.end) { classes.push('end'); tag = say('tagEnd', 'End'); said.push(say('saidEnd', 'end day')); }
  if (d.date === view.landing) { classes.push('land'); tag = say('tagResult', 'Result'); said.push(say('saidResult', 'result')); }
  const dayOfMonth = Number(d.date.slice(8));
  const title = [shortDate(d.date), ...said].join(': ');
  return h('div', { class: classes.join(' '), title: said.length || d.weekend ? title : null }, [
    h('span', { class: 'bd-num', 'aria-hidden': 'true' }, String(dayOfMonth)),
    ord !== undefined && d.date !== view.landing ? h('span', { class: 'bd-ord', 'aria-hidden': 'true' }, ord) : null,
    tag ? h('span', { class: 'bd-tag', 'aria-hidden': 'true' }, tag) : null,
    said.length ? h('span', { class: 'endwise-visually-hidden' }, title) : null,
  ]);
}

function monthCard(input, year, month, built) {
  const first = `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-01`;
  const last = `${first.slice(0, 8)}${String(monthLength(year, month)).padStart(2, '0')}`;
  const days = daysWithOwn(input, first, last);
  const lead = (weekdayOf(first) + 6) % 7; // weeks start on Monday
  const cells = [];
  HEADINGS.forEach((name, i) => cells.push(h('div', { class: `bd-wd${i > 4 ? ' we' : ''}`, 'aria-hidden': 'true' }, name)));
  for (let i = 0; i < lead; i++) cells.push(h('div', { class: 'bd-day pad', 'aria-hidden': 'true' }));
  for (const d of days) cells.push(dayCell(d, built));
  return h('section', { class: 'bd-month', 'aria-label': `${MONTHS[month - 1]} ${year}` }, [
    h('div', { class: 'bd-month-head' }, [h('h3', {}, MONTHS[month - 1]), h('span', {}, String(year))]),
    h('div', { class: 'bd-grid' }, cells),
  ]);
}

function calendar(input, built) {
  const { view } = built;
  const span = spanOf(view);
  if (span > MAX_DRAWN_DAYS) {
    return h('p', { class: 'bd-aside' }, say('tooLong', `That range is ${span.toLocaleString('en-US')} days long, which is too long to draw day by day. The holidays in it are listed above.`, span.toLocaleString(NUM)));
  }
  const months = [];
  let [y, m] = part(view.lo);
  const [ey, em] = part(view.hi);
  while (y < ey || (y === ey && m <= em)) {
    months.push(monthCard(input, y, m, built));
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  const legend = h('ul', { class: 'bd-legend', 'aria-label': say('legend', 'Key') }, [
    h('li', {}, [h('span', { class: 'bd-key counted' }), say('keyCounted', 'Counted business day')]),
    h('li', {}, [h('span', { class: 'bd-key we' }), say('keyWeekend', 'Weekend')]),
    h('li', {}, [h('span', { class: 'bd-key hol' }), say('keyHoliday', 'Holiday')]),
    input.daysOff?.length ? h('li', {}, [h('span', { class: 'bd-key own' }), say('keyOwn', 'Your day off')]) : null,
    h('li', {}, [h('span', { class: 'bd-key start' }), say('keyStart', 'Start day')]),
    input.op === 'add' && input.days !== 0 ? h('li', {}, [h('span', { class: 'bd-key land' }), say('keyResult', 'Result')]) : null,
  ]);
  return h('div', {}, [h('div', { class: 'bd-cal' }, months), legend]);
}

// The answer one line per day, in date order: the start, each counted day with its number, each
// skipped day with its reason (the holiday's name, your day off or the weekend). Weekends and long
// runs of counted days fold into one line so the list stays short.
const MAX_ITEMS = 12;

function dayItems(input, built) {
  const { view, days, ordinals } = built;
  if (!days.length) return [];
  const span = days.filter((d) => d.date >= view.lo && d.date <= view.hi);
  const rows = [];
  for (const d of span) {
    const ord = ordinals.get(d.date);
    let row;
    if (d.date === view.start && input.op === 'between') row = { kind: 'start', d, k: '0', em: say('itemStart', 'start, not counted') };
    else if (d.date === view.start) row = { kind: 'start', d, k: '0', em: say('saidStart', 'start day') };
    else if (d.holiday) row = { kind: 'skip', d, k: '×', em: holidayName(d.holiday) };
    else if (d.own) row = { kind: 'own', d, k: '×', em: say('itemOwn', 'your day off') };
    else if (d.weekend) row = { kind: 'we', d, k: '×', em: say('itemWeekend', 'weekend') };
    else if (ord !== undefined) row = { kind: 'bd', d, k: ord, em: say('itemBusiness', 'business day') };
    else continue;
    if (d.date === view.end) { row.last = true; if (row.kind === 'bd') row.em = say('itemEnd', 'end day'); }
    if (d.date === view.landing) { row.last = true; row.em = say('itemResult', 'result'); }
    rows.push(row);
  }
  // A weekend is one line.
  const merged = [];
  for (const r of rows) {
    const prev = merged[merged.length - 1];
    if (r.kind === 'we' && prev?.kind === 'we' && dayNumber(r.d.date) - dayNumber(prev.to.date) === 1) { prev.to = r.d; continue; }
    merged.push({ ...r, to: r.d });
  }
  // Too long: runs of counted days become one line each.
  let out = merged;
  if (merged.length > MAX_ITEMS) {
    out = [];
    for (const r of merged) {
      const prev = out[out.length - 1];
      if (r.kind === 'bd' && !r.last && prev?.kind === 'bd' && !prev.last && prev.run) { prev.to = r.d; prev.k = r.k; continue; }
      out.push({ ...r, run: r.kind === 'bd' && !r.last, from: r.k });
    }
    for (const r of out) if (r.run && r.to !== r.d) r.em = say('itemBusinessRun', `business days ${r.from} to ${r.k}`, r.from, r.k);
  }
  const label = (r) => {
    if (r.to === r.d) return shortDate(r.d.date);
    const [, m1, d1] = part(r.d.date);
    const [y2, m2, d2] = part(r.to.date);
    const head = `${WEEKDAYS_SHORT[weekdayOf(r.d.date)]} ${d1}${m1 === m2 ? '' : ` ${MONTHS_SHORT[m1 - 1]}`}`;
    const tail = `${WEEKDAYS_SHORT[weekdayOf(r.to.date)]} ${d2} ${MONTHS_SHORT[m2 - 1]} ${y2}`;
    return r.kind === 'we' && dayNumber(r.to.date) - dayNumber(r.d.date) === 1 ? `${head}, ${tail}` : `${head} ${say('to', 'to')} ${tail}`;
  };
  const cls = { start: 'plain', skip: 'sk', own: 'own', we: 'dim', bd: '' };
  return h('ol', { class: 'tf-items' }, out.map((r) => h('li', { class: [cls[r.kind], r.last ? 'hi' : ''].filter(Boolean).join(' ') || null }, [
    h('span', { class: 'k', 'aria-hidden': 'true' }, String(r.k)),
    h('span', {}, label(r)),
    h('em', {}, r.em),
  ])));
}

function holidayList(input, result, built) {
  const skipped = result.holidaysSkipped;
  const nodes = [];
  // When the days are drawn, the day list names every skipped day; a range too long to draw
  // lists the holidays and your days off here instead.
  const listed = built.days.length > 0;
  if (!listed && skipped.length) {
    nodes.push(h('p', { class: 'bd-heading' }, say('skippedHead', `Holidays skipped (${skipped.length})`, skipped.length)));
    nodes.push(h('ul', { class: 'bd-skipped' }, skipped.map((x) => h('li', {}, [
      h('span', { class: 'bd-dot', 'aria-hidden': 'true' }),
      h('span', { class: 'when' }, shortDate(x.date)),
      h('span', {}, holidayName(x.name)),
    ]))));
  } else if (!skipped.length) {
    nodes.push(h('p', { class: 'tf-note' }, say('noneFell', 'No holidays fell on a weekday in this range.')));
  }
  // Your own days off, listed the same way, when the run had any.
  const own = result.daysOffSkipped ?? [];
  if (own.length && !listed) {
    nodes.push(h('p', { class: 'bd-heading' }, say('ownHead', `Your days off skipped (${own.length})`, own.length)));
    nodes.push(h('ul', { class: 'bd-skipped' }, own.map((x) => h('li', {}, [
      h('span', { class: 'bd-dot own', 'aria-hidden': 'true' }),
      h('span', { class: 'when' }, shortDate(x.date)),
      h('span', {}, holidayName(x.name)),
    ]))));
  } else if (!own.length && input.daysOff?.length) {
    nodes.push(h('p', { class: 'tf-note' }, say('ownNone', 'None of your days off fell on a weekday in this range that was not already a holiday.')));
  }
  // Holidays inside the drawn span that the count did not use (a holiday start day).
  const used = new Set(skipped.map((x) => `${x.date}|${x.name}`));
  const reversed = input.op === 'between' && input.end < input.start;
  const unused = built.days.filter((d) => d.holiday && !used.has(`${d.date}|${d.holiday}`));
  if (unused.length) {
    nodes.push(h('p', { class: 'tf-note' }, say('unused', `Marked on the calendar but outside the count: ${unused.map((d) => `${shortDate(d.date)}, ${d.holiday}`).join('; ')}. ${reversed ? 'The end date itself is never counted.' : 'The start day is never counted.'}`, unused.map((d) => `${shortDate(d.date)}, ${holidayName(d.holiday)}`).join('; '), reversed)));
  }
  return nodes;
}

function headline(input, result) {
  if (input.op === 'between') {
    const n = result.businessDays;
    const forward = input.end >= input.start;
    const sub = forward
      ? say('subForward', `After ${longDate(input.start)}, up to and including ${longDate(input.end)}.`, longDate(input.start), longDate(input.end), say('regionNames', REGIONS)[input.region])
      : say('subBack', `Counting back: after ${longDate(input.end)}, up to and including ${longDate(input.start)}.`, longDate(input.end), longDate(input.start), say('regionNames', REGIONS)[input.region]);
    return [
      h('p', { class: 'tf-big' }, [h('b', {}, signed(n)), h('span', {}, Math.abs(n) === 1 ? say('bdOne', 'business day') : say('bdMany', 'business days'))]),
      h('p', { class: 'tf-sub' }, sub),
    ];
  }
  const n = input.days;
  const where = say('regionNames', REGIONS)[input.region];
  const sub = n === 0
    ? say('subZero', `Zero business days from ${longDate(input.start)} is the same day.`, longDate(input.start), where)
    : say('subAdd', `${plural(n, 'business day', 'business days')} ${n > 0 ? 'after' : 'before'} ${longDate(input.start)}.`, Math.abs(n).toLocaleString(NUM), n > 0 ? say('after', 'after') : say('before', 'before'), longDate(input.start), where);
  return [
    h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, longDate(result.date))]),
    h('p', { class: 'tf-sub' }, sub),
  ];
}

// The inputs in one line, for the Example tag: "US federal holidays, start July 1, end July 8, 2026".
const US_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function inputsLine(input) {
  const md = (iso) => { const [, m, d] = part(iso); return `${US_MONTHS[m - 1]} ${d}`; };
  const who = { US: 'US federal holidays', 'GB-ENG': 'England and Wales bank holidays', [IN]: 'India central government (Delhi) holidays' }[input.region];
  const own = input.daysOff?.length ? `, ${plural(input.daysOff.length, 'day off', 'days off')} of your own` : '';
  if (input.op === 'between') {
    const sameYear = input.start.slice(0, 4) === input.end.slice(0, 4);
    return `${who}, start ${md(input.start)}${sameYear ? '' : `, ${input.start.slice(0, 4)}`}, end ${md(input.end)}, ${input.end.slice(0, 4)}${own}`;
  }
  return `${who}, ${input.days} business days from ${md(input.start)}, ${input.start.slice(0, 4)}${own}`;
}

function summaryText(input, result) {
  if (input.op === 'between') return `${signed(result.businessDays)} ${say('bdMany', 'business days')}.`;
  return `${longDate(result.date)}.`;
}

// kind: 'example' (worked out on the page, free) or 'run' (a real call). note: the line under the result.
function render(input, result, { kind, note }) {
  const built = build(input, result);
  const out = $('bd-out');
  out.textContent = '';
  const where = say('regionNames', REGIONS)[input.region];
  const items = dayItems(input, built);
  const cal = calendar(input, built);
  out.appendChild(h('div', {}, [
    h('div', { class: 'tf-rh' }, [
      kind === 'example'
        ? h('span', { class: 'tf-tag' }, say('tagExample', 'Example'))
        : h('span', { class: 'tf-tag run' }, say('tagRun', 'Your result')),
      h('span', { class: 'tf-src' }, where),
    ]),
    L === 'hi' ? null : h('p', { class: 'tf-exin' }, kind === 'example' ? `Example: ${inputsLine(input)}` : inputsLine(input)),
    ...headline(input, result),
    ...holidayList(input, result, built),
    result.note ? h('p', { class: 'tf-note' }, result.note === IN_NOTE ? say('inNote', IN_NOTE) : result.note) : null,
    items && items.childNodes?.length ? h('div', { class: 'tf-grid2' }, [cal, items]) : cal,
    note ? h('p', { class: 'tf-cost' }, note) : null,
  ]));
  $('bd-status').textContent = kind === 'run' ? summaryText(input, result) : '';
}

// ---------- running ----------

function costNote(json) {
  if (json.charged) return say('charged', `Charged ${json.charged.display}. Your balance is ${json.balance.display}.`, json.charged.display, json.balance.display);
  if (typeof json.freeRunsLeft === 'number') {
    return say('freeRun', `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`, json.freeRunsLeft);
  }
  return null;
}

function showError(e) {
  const fields = e.fields || {};
  const allShown = showFieldErrors(fields);
  const box = $('bd-error');
  if (allShown && Object.keys(fields).length) return;
  box.textContent = L === 'hi' && e.code === 'invalid_input' && e.message.startsWith('India (central') ? say('inRange', e.message) : e.message;
  if (e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, say('signIn', 'Sign in')));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, say('openAccount', 'Open your account')));
}

async function onSubmit(ev) {
  ev.preventDefault();
  clearErrors();
  const read = readForm();
  if (read.errors) {
    showFieldErrors(read.errors);
    return;
  }
  // A range the engine refuses (India outside the years its list covers) is told here, free.
  const refused = outOfRange(read.input);
  if (refused) {
    $('bd-error').textContent = L === 'hi' && refused.startsWith('India (central') ? say('inRange', refused) : refused;
    return;
  }
  const button = $('bd-run');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, read.input);
    render(read.input, json.result, { kind: 'run', note: costNote(json) });
  } catch (e) {
    showError(e);
  } finally {
    button.disabled = false;
  }
}

// ---------- price line ----------

function showPrice() {
  Promise.all([T.api(`/api/v1/tools/${SLUG}`), T.me()]).then(([json, account]) => {
    const price = json.tool.price.display;
    const el = $('bd-price');
    // The price line is three short parts, in the page's language.
    const parts = el.querySelectorAll('span');
    if (account) {
      if (parts?.length) { parts[0].textContent = say('partRun', `${T.money(price)} a run`, T.money(price)); parts[1].textContent = say('partBalance', 'taken from your balance'); }
      else el.textContent = say('priceAccount', `Each run costs ${T.money(price)}, taken from your balance.`, T.money(price));
      $('bd-run-note').textContent = '';
    } else {
      if (parts?.length) { parts[0].textContent = say('partRun', `${T.money(price)} a run`, T.money(price)); parts[1].textContent = say('partFree', '5 free runs a day, no card needed'); }
      else el.textContent = say('priceFree', `Each run costs ${T.money(price)}. Without an account you get 5 free runs a day.`, T.money(price));
      $('bd-run-note').textContent = L === 'hi' ? say('runNoteFree', '5 free runs a day, no account needed.') : '';
    }
  }).catch(() => {});
}

// ---------- inputs from the address ----------

// A link may carry the inputs (?op=between&region=US&start=2026-12-31&end=2027-12-31, or op=add
// with days): the page opens with them filled in and worked out here, free. Anything unusable is
// ignored and the default example shows instead.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (!q.has('start')) return null;
  const op = q.get('op') === 'add' ? 'add' : 'between';
  const region = Object.prototype.hasOwnProperty.call(REGIONS, q.get('region')) ? q.get('region') : (L === 'hi' ? IN : 'US');
  const start = (q.get('start') || '').trim();
  if (checkDate('Start', start)) return null;
  if (op === 'between') {
    const end = (q.get('end') || '').trim();
    return checkDate('End', end) ? null : { op, region, start, end };
  }
  const days = Number(q.get('days'));
  if (!q.get('days') || !Number.isInteger(days) || days < -3650 || days > 3650) return null;
  return { op, region, start, days };
}

function fillForm(input) {
  document.querySelector(`input[name="op"][value="${input.op}"]`).checked = true;
  document.querySelector(`input[name="region"][value="${input.region}"]`).checked = true;
  $('bd-start').value = input.start;
  if (input.op === 'between') $('bd-end').value = input.end;
  else $('bd-days').value = String(input.days);
  syncMode();
}

// The engine's message when it would refuse these dates, or null.
function outOfRange(input) {
  try {
    if (input.op === 'between') between(input.region, input.start, input.end);
    else addBusinessDays(input.region, input.start, input.days);
    return null;
  } catch (e) {
    return e instanceof RangeError ? e.message : null;
  }
}

// The same answer the server would give, worked out on the page; null when out of range.
function workedOut(input) {
  try {
    return input.op === 'between' ? between(input.region, input.start, input.end) : addBusinessDays(input.region, input.start, input.days);
  } catch {
    return null;
  }
}

// ---------- start ----------

function start() {
  document.querySelectorAll('input[name="op"], input[name="region"]').forEach((el) => el.addEventListener('change', syncMode));
  $('bd-form').addEventListener('submit', onSubmit);
  syncMode();

  // The chip in the header is mounted by endwise.js; calling again is harmless.
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('bd-code'), SLUG);
  showPrice();

  // The worked example, from the address when it carries inputs, worked out here with the same
  // rules as the server, so loading the page is free.
  const linked = fromQuery();
  const linkedResult = linked && workedOut(linked);
  if (linked && linkedResult) {
    fillForm(linked);
    render(linked, linkedResult, {
      kind: 'example',
      note: say('linkedNote', `Worked out on this page from the link you followed. Press "${$('bd-run').textContent}" to run it for real.`, $('bd-run').textContent),
    });
    return;
  }
  // The Hindi page opens on India with a span that crosses Dussehra; every other page on the US example.
  const example = L === 'hi'
    ? { op: 'between', region: IN, start: '2026-10-16', end: '2026-10-23' }
    : { op: 'between', region: 'US', start: '2026-07-01', end: '2026-07-08' };
  render(example, between(example.region, example.start, example.end), {
    kind: 'example',
    note: say('exampleNote', 'Worked out on this page. Press "Count business days" to run it for real.'),
  });
}

start();
