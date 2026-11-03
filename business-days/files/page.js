// The Business days page. core.js (the same file the server uses) draws the worked example and
// the calendar; the answer for a real run always comes from the server through Endwise.run.
import {
  between, addBusinessDays, calendarDays, weekdayOf, dayNumber, isRealDate, monthLength, REGIONS,
  MIN_YEAR, MAX_YEAR, RANGE_MESSAGE, IN,
} from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'business-days';
const MAX_DRAWN_DAYS = 100;
const MAX_DAYS_OFF = 400;

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const HEADINGS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const REGION_HINTS = {
  US: 'US federal holidays.',
  'GB-ENG': 'Bank holidays in England and Wales.',
  [IN]: 'Closed (gazetted) holidays of central government offices in Delhi and New Delhi, from DoPT\'s yearly list, 2025 to 2027. Not restricted holidays, not a state\'s list, not bank holidays.',
};

const $ = (id) => document.getElementById(id);
const pick = (name) => document.querySelector(`input[name="${name}"]:checked`).value;

const part = (iso) => iso.split('-').map(Number);
const longDate = (iso) => { const [y, m, d] = part(iso); return `${WEEKDAYS[weekdayOf(iso)]} ${d} ${MONTHS[m - 1]} ${y}`; };
const shortDate = (iso) => { const [y, m, d] = part(iso); return `${WEEKDAYS[weekdayOf(iso)].slice(0, 3)} ${d} ${MONTHS[m - 1].slice(0, 3)} ${y}`; };
const plural = (n, one, many) => `${Math.abs(n).toLocaleString('en-US')} ${Math.abs(n) === 1 ? one : many}`;
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
  return known.length === Object.keys(fields).length;
}

function checkDate(label, value) {
  if (!value) return `Pick ${label === 'Start' ? 'a start' : 'an end'} date.`;
  if (!isRealDate(value)) return `${label} is not a real calendar date.`;
  const year = Number(value.slice(0, 4));
  if (year < MIN_YEAR || year > MAX_YEAR) return RANGE_MESSAGE;
  return null;
}

// The days off box: dates one per line or comma separated, in any order and repeated at will.
// { dates } sorted and once each, or { error } naming the first entry it could not read.
function readDaysOff(raw) {
  const dates = new Set();
  for (const item of raw.split(/[\n,]+/).map((x) => x.trim()).filter(Boolean)) {
    if (!isRealDate(item)) return { error: `Could not read "${item.slice(0, 40)}". Write each day off like 2026-07-06, one per line or comma separated.` };
    dates.add(item);
  }
  if (dates.size > MAX_DAYS_OFF) return { error: `At most ${MAX_DAYS_OFF} days off.` };
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
  if (raw === '' || !Number.isInteger(days) || days < -3650 || days > 3650) errors.days = 'Days must be a whole number from -3650 to 3650.';
  if (Object.keys(errors).length) return { errors };
  return { input: { op, region, start, days, ...own } };
}

function syncMode() {
  const adding = pick('op') === 'add';
  $('bd-end-field').hidden = adding;
  $('bd-days-field').hidden = !adding;
  $('bd-run').textContent = adding ? 'Find the date' : 'Count business days';
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
  if (d.uncovered) { classes.push('unk'); said.push('year not covered'); }
  if (d.weekend) classes.push('we');
  if (d.holiday) { classes.push('hol'); said.push(`holiday, ${d.holiday}`); }
  if (d.own) { classes.push('own'); said.push('your day off'); }
  if (ord !== undefined) { classes.push('counted'); said.push(`business day ${ord}`); }
  let tag = null;
  if (d.date === view.start) { classes.push('start'); tag = 'Start'; said.push('start day'); }
  if (d.date === view.end) { classes.push('end'); tag = 'End'; said.push('end day'); }
  if (d.date === view.landing) { classes.push('land'); tag = 'Result'; said.push('result'); }
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
    return h('p', { class: 'bd-aside' }, `That range is ${span.toLocaleString('en-US')} days long, which is too long to draw day by day. The holidays in it are listed above.`);
  }
  const months = [];
  let [y, m] = part(view.lo);
  const [ey, em] = part(view.hi);
  while (y < ey || (y === ey && m <= em)) {
    months.push(monthCard(input, y, m, built));
    m += 1;
    if (m > 12) { m = 1; y += 1; }
  }
  const legend = h('ul', { class: 'bd-legend', 'aria-label': 'Key' }, [
    h('li', {}, [h('span', { class: 'bd-key counted' }), 'Counted business day']),
    h('li', {}, [h('span', { class: 'bd-key we' }), 'Weekend']),
    h('li', {}, [h('span', { class: 'bd-key hol' }), 'Holiday']),
    input.daysOff?.length ? h('li', {}, [h('span', { class: 'bd-key own' }), 'Your day off']) : null,
    h('li', {}, [h('span', { class: 'bd-key start' }), 'Start day']),
    input.op === 'add' && input.days !== 0 ? h('li', {}, [h('span', { class: 'bd-key land' }), 'Result']) : null,
  ]);
  return h('div', {}, [h('div', { class: 'bd-cal' }, months), legend]);
}

function holidayList(input, result, built) {
  const skipped = result.holidaysSkipped;
  const nodes = [];
  if (skipped.length) {
    nodes.push(h('p', { class: 'bd-heading' }, `Holidays skipped (${skipped.length})`));
    nodes.push(h('ul', { class: 'bd-skipped' }, skipped.map((x) => h('li', {}, [
      h('span', { class: 'bd-dot', 'aria-hidden': 'true' }),
      h('span', { class: 'when' }, shortDate(x.date)),
      h('span', {}, x.name),
    ]))));
  } else {
    nodes.push(h('p', { class: 'bd-none' }, 'No holidays fell on a weekday in this range.'));
  }
  // Your own days off, listed the same way, when the run had any.
  const own = result.daysOffSkipped ?? [];
  if (own.length) {
    nodes.push(h('p', { class: 'bd-heading' }, `Your days off skipped (${own.length})`));
    nodes.push(h('ul', { class: 'bd-skipped' }, own.map((x) => h('li', {}, [
      h('span', { class: 'bd-dot own', 'aria-hidden': 'true' }),
      h('span', { class: 'when' }, shortDate(x.date)),
      h('span', {}, x.name),
    ]))));
  } else if (input.daysOff?.length) {
    nodes.push(h('p', { class: 'bd-none' }, 'None of your days off fell on a weekday in this range that was not already a holiday.'));
  }
  // Holidays inside the drawn span that the count did not use (a holiday start day).
  const used = new Set(skipped.map((x) => `${x.date}|${x.name}`));
  const reversed = input.op === 'between' && input.end < input.start;
  const unused = built.days.filter((d) => d.holiday && !used.has(`${d.date}|${d.holiday}`));
  if (unused.length) {
    nodes.push(h('p', { class: 'bd-aside' }, `Marked on the calendar but outside the count: ${unused.map((d) => `${shortDate(d.date)}, ${d.holiday}`).join('; ')}. ${reversed ? 'The end date itself is never counted.' : 'The start day is never counted.'}`));
  }
  return nodes;
}

function headline(input, result) {
  const where = REGIONS[input.region];
  if (input.op === 'between') {
    const n = result.businessDays;
    const forward = input.end >= input.start;
    const sub = forward
      ? `After ${longDate(input.start)}, up to and including ${longDate(input.end)}. ${where}.`
      : `Counting back: after ${longDate(input.end)}, up to and including ${longDate(input.start)}. ${where}.`;
    return [
      h('p', { class: 'bd-answer' }, [signed(n), ' ', h('small', {}, Math.abs(n) === 1 ? 'business day' : 'business days')]),
      h('p', { class: 'bd-sub' }, sub),
    ];
  }
  const n = input.days;
  const sub = n === 0
    ? `Zero business days from ${longDate(input.start)} is the same day. ${where}.`
    : `${plural(n, 'business day', 'business days')} ${n > 0 ? 'after' : 'before'} ${longDate(input.start)}. ${where}.`;
  return [
    h('p', { class: 'bd-answer' }, longDate(result.date)),
    h('p', { class: 'bd-sub' }, sub),
  ];
}

function summaryText(input, result) {
  if (input.op === 'between') return `${signed(result.businessDays)} business days.`;
  return `${longDate(result.date)}.`;
}

// kind: 'example' (worked out on the page, free) or 'run' (a real call). note: the line under the result.
function render(input, result, { kind, note }) {
  const built = build(input, result);
  const out = $('bd-out');
  out.textContent = '';
  out.appendChild(h('div', {}, [
    kind === 'example' ? h('p', { class: 'bd-sheet-label' }, 'Worked example') : null,
    ...headline(input, result),
    ...holidayList(input, result, built),
    result.note ? h('p', { class: 'bd-aside' }, result.note) : null,
    calendar(input, built),
    note ? h('p', { class: 'bd-cost' }, note) : null,
  ]));
  $('bd-status').textContent = kind === 'run' ? summaryText(input, result) : '';
}

// ---------- running ----------

function costNote(json) {
  if (json.charged) return `Charged ${json.charged.display}. Your balance is ${json.balance.display}.`;
  if (typeof json.freeRunsLeft === 'number') {
    return `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  }
  return null;
}

function showError(e) {
  const fields = e.fields || {};
  const allShown = showFieldErrors(fields);
  const box = $('bd-error');
  if (allShown && Object.keys(fields).length) return;
  box.textContent = e.message;
  if (e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
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
    $('bd-error').textContent = refused;
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
    if (account) {
      el.textContent = `Each run costs ${T.money(price)}, taken from your balance.`;
      $('bd-run-note').textContent = '';
    } else {
      el.textContent = `Each run costs ${T.money(price)}. Without an account you get 5 free runs a day.`;
      $('bd-run-note').textContent = '5 free runs a day, no account needed.';
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
  const region = Object.prototype.hasOwnProperty.call(REGIONS, q.get('region')) ? q.get('region') : 'US';
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
      note: `Worked out on this page from the link you followed. Press "${$('bd-run').textContent}" to run it for real.`,
    });
    return;
  }
  const example = { op: 'between', region: 'US', start: '2026-07-01', end: '2026-07-08' };
  render(example, between(example.region, example.start, example.end), {
    kind: 'example',
    note: 'Worked out on this page. Press "Count business days" to run it for real.',
  });
}

start();
