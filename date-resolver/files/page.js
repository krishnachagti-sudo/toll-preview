// The date resolver page. core.js (the same file the server runs), built on the Business days
// engine loaded from that tool's files, works out the worked example and any linked phrase here,
// free. The answer for a real run always comes from the server through Endwise.run.
import * as businessDays from '../../business-days/files/core.js';
import { makeEngine, ResolveError, isRealDate, longDate, shortDate, MIN_YEAR, MAX_YEAR } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'date-resolver';
const engine = makeEngine(businessDays);
const $ = (id) => document.getElementById(id);

const TRY = [
  '90 days from today', '10 business days after next Friday', 'next Tuesday', 'end of next month',
  '6 weeks from today', '30 days ago', 'first Monday of March 2027', 'last business day of this quarter',
];

// Today on the visitor's clock, as YYYY-MM-DD.
function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ---------- the form ----------

const FIELDS = { text: 'dr-text-err', texts: 'dr-text-err', ref: 'dr-ref-err', daysOff: 'dr-off-err' };

function clearErrors() {
  for (const id of new Set(Object.values(FIELDS))) $(id).textContent = '';
  $('dr-error').textContent = '';
}

// Shows each field's message beside it; true when every message found a place.
function showFieldErrors(fields) {
  let all = true;
  for (const [k, msg] of Object.entries(fields)) {
    const id = FIELDS[k.split('.')[0]];
    if (id) $(id).textContent = msg; else all = false;
  }
  return all;
}

function readForm() {
  const errors = {};
  const text = $('dr-text').value.trim();
  if (!text) errors.text = 'Type a phrase, like "90 days from today".';
  const ref = $('dr-ref').value;
  if (!isRealDate(ref) || Number(ref.slice(0, 4)) < MIN_YEAR || Number(ref.slice(0, 4)) > MAX_YEAR) errors.ref = `Pick a date between ${MIN_YEAR} and ${MAX_YEAR}.`;
  const off = $('dr-off').value.split(/[\s,;]+/).filter(Boolean);
  const badOff = off.find((d) => !isRealDate(d));
  if (badOff) errors.daysOff = `"${badOff}" is not a date like 2026-12-24.`;
  if (Object.keys(errors).length) return { errors };
  const input = { text, ref, region: $('dr-region').value };
  if ($('dr-rule').value !== 'nearest') input.weekdayRule = $('dr-rule').value;
  if ($('dr-roll').value !== 'none') input.roll = $('dr-roll').value;
  if ($('dr-order').value !== 'MDY') input.dateOrder = $('dr-order').value;
  if (off.length) input.daysOff = off;
  return { input };
}

function fillForm(input) {
  $('dr-text').value = input.text;
  $('dr-ref').value = input.ref;
  $('dr-region').value = input.region ?? 'US';
  $('dr-rule').value = input.weekdayRule ?? 'nearest';
  $('dr-roll').value = input.roll ?? 'none';
  $('dr-order').value = input.dateOrder ?? 'MDY';
  $('dr-off').value = (input.daysOff ?? []).join(', ');
  if (input.weekdayRule || input.roll || input.dateOrder || input.daysOff) $('dr-form').querySelector('details').open = true;
}

// ---------- the answer ----------

// The inputs in one line: "10 business days after next Friday", said on Monday, November 2, 2026, US federal holidays.
function inputsLine(input, r) {
  const opts = [];
  if (r.assumptions.weekdayRule === 'next-week') opts.push('"next" means next week');
  if (r.assumptions.roll && r.assumptions.roll !== 'none') opts.push(`roll ${r.assumptions.roll}`);
  if (r.assumptions.dateOrder === 'DMY') opts.push('day/month/year');
  if (input.daysOff?.length) opts.push(`${input.daysOff.length} ${input.daysOff.length === 1 ? 'day' : 'days'} off of your own`);
  return [`"${r.text}", said on ${longDate(r.assumptions.ref)}`, `${r.assumptions.holidayCalendar} holidays`, ...opts].join(', ');
}

// The answer one line per step, then each day skipped with its reason.
function items(r) {
  const rows = r.steps.map((step, i) => h('li', { class: i === r.steps.length - 1 ? 'hi' : null }, [
    h('span', { class: 'k', 'aria-hidden': 'true' }, String(i + 1)),
    h('span', {}, step),
  ]));
  for (const x of r.holidaysSkipped) rows.push(h('li', { class: 'sk' }, [h('span', { class: 'k', 'aria-hidden': 'true' }, '×'), h('span', {}, shortDate(x.date)), h('em', {}, `skipped: ${x.name}`)]));
  for (const x of r.daysOffSkipped ?? []) rows.push(h('li', { class: 'own' }, [h('span', { class: 'k', 'aria-hidden': 'true' }, '×'), h('span', {}, shortDate(x.date)), h('em', {}, 'skipped: your day off')]));
  return h('ol', { class: 'tf-items' }, rows);
}

// kind: 'example' (worked out on the page, free) or 'run' (a real call). note: the line under the result.
function render(input, r, { kind = 'example', note }) {
  const out = $('dr-out');
  out.textContent = '';
  const parts = [
    h('div', { class: 'tf-rh' }, [
      kind === 'example' ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src' }, r.assumptions.holidayCalendar),
    ]),
    h('p', { class: 'tf-exin' }, kind === 'example' ? `Example: ${inputsLine(input, r)}` : inputsLine(input, r)),
    h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, r.dateText)]),
    h('p', { class: 'tf-sub' }, [
      `${r.calendarDaysFromRef === 0 ? 'The reference date itself' : `${Math.abs(r.calendarDaysFromRef)} calendar ${Math.abs(r.calendarDaysFromRef) === 1 ? 'day' : 'days'} ${r.calendarDaysFromRef > 0 ? 'after' : 'before'} the reference date`}. ISO week ${r.isoWeek}, day ${r.dayOfYear} of the year. `,
      r.businessDay ? 'A business day.' : 'Not a business day.',
      r.rolledFrom ? ` Moved from ${shortDate(r.rolledFrom)}.` : '',
    ]),
  ];
  if (r.ambiguous) {
    parts.push(h('div', { class: 'dr-readings' }, [
      h('p', {}, h('strong', {}, 'This phrase can mean another date:')),
      h('ul', {}, r.readings.slice(1).map((x) => h('li', {}, [h('strong', {}, longDate(x.date)), ` if you read ${x.means}.`]))),
    ]));
  }
  parts.push(items(r));
  if (!r.holidaysSkipped.length && !(r.daysOffSkipped ?? []).length) parts.push(h('p', { class: 'tf-note' }, 'No holiday was skipped.'));
  parts.push(h('details', { class: 'xpand' }, [
    h('summary', {}, 'The rules it used'),
    h('div', { class: 'xp-in' }, [
      h('ul', {}, (r.assumptions.rules ?? []).map((x) => h('li', {}, x))),
      h('p', {}, `Holidays: ${r.assumptions.holidayCalendar}.${r.assumptions.note ? ` ${r.assumptions.note}` : ''}`),
    ]),
  ]));
  if (note) parts.push(h('p', { class: 'tf-cost' }, note));
  for (const p of parts) out.appendChild(p);
  $('dr-status').textContent = `${r.text}: ${r.dateText}`;
}

// The same answer the server gives, worked out here; null when the phrase is refused.
function workedOut(input) {
  try {
    return engine.resolve(input.text, input);
  } catch (e) {
    if (e instanceof ResolveError) return null;
    throw e;
  }
}

function costNote(json) {
  if (json.charged) return `Charged ${json.charged.display}. Your balance is ${json.balance.display}.`;
  if (typeof json.freeRunsLeft === 'number') return `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  return null;
}

function showError(e) {
  const fields = e.fields || {};
  if (showFieldErrors(fields) && Object.keys(fields).length) return;
  const box = $('dr-error');
  box.textContent = e.message;
  if (e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

async function onSubmit(ev) {
  ev.preventDefault();
  clearErrors();
  const read = readForm();
  if (read.errors) { showFieldErrors(read.errors); return; }
  // A phrase the engine refuses is told here, free.
  try { engine.resolve(read.input.text, read.input); } catch (e) {
    if (e instanceof ResolveError) { showFieldErrors({ [e.field]: e.message }) || ($('dr-error').textContent = e.message); return; }
    throw e;
  }
  const button = $('dr-run');
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

// ---------- inputs from the address ----------

// ?text=90+days+from+today&ref=2026-11-07&region=US&rule=next-week&roll=following&order=DMY.
// Anything unusable is left out; a phrase the engine refuses shows the default example instead.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const text = (q.get('text') || '').trim().slice(0, 200);
  if (!text) return null;
  const ref = isRealDate(q.get('ref') || '') ? q.get('ref') : localToday();
  const input = { text, ref, region: ['US', 'GB-ENG', 'IN-CENTRAL-DELHI', 'none'].includes(q.get('region')) ? q.get('region') : 'US' };
  if (q.get('rule') === 'next-week') input.weekdayRule = 'next-week';
  if (['following', 'preceding', 'modified-following'].includes(q.get('roll'))) input.roll = q.get('roll');
  if (q.get('order') === 'DMY') input.dateOrder = 'DMY';
  return input;
}

// ---------- start ----------

function start() {
  $('dr-form').addEventListener('submit', onSubmit);
  const chips = $('dr-chips');
  for (const t of TRY) {
    chips.appendChild(h('button', { type: 'button', class: 'dr-chip' }, t));
  }
  chips.addEventListener('click', (ev) => {
    const b = ev.target.closest('.dr-chip');
    if (!b) return;
    $('dr-text').value = b.textContent;
    const input = readForm().input;
    const r = input && workedOut(input);
    if (r) render(input, r, { note: 'Worked out on this page. Press "Resolve the date" to run it for real.' });
  });
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('dr-code'), SLUG);
  // The price line says what a signed-in visitor pays from; the run note is in it.
  T.me().then((account) => { if (account) $('dr-price').querySelectorAll('span')[1].textContent = 'taken from your balance'; }).catch(() => {});

  const linked = fromQuery();
  const linkedResult = linked && workedOut(linked);
  if (linked && linkedResult) {
    fillForm(linked);
    render(linked, linkedResult, { note: 'Worked out on this page from the link you followed. Press "Resolve the date" to run it for real.' });
    return;
  }
  // The worked example: the phrase in the box, said on a fixed Monday, so both readings of
  // "next Friday" and the Veterans Day skip show. The date box then moves to today for the visitor.
  const example = { text: '10 business days after next Friday', ref: '2026-11-02', region: 'US' };
  render(example, engine.resolve(example.text, example), { note: 'A worked example, said on Monday, November 2, 2026. The date box is set to today: press "Resolve the date" to work it out from today.' });
  $('dr-ref').value = localToday();
}

start();
