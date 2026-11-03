// The Exchange rate on a date page. core.js (the same file the server uses) supplies the currency
// list, the sources and the wording for dates; the rate itself always comes from the server
// through Endwise.run.
import { CURRENCIES, FIRST_FIXING, SOURCES, SOURCE_IDS, fixingNote, longDate, isRealDate } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'fx-on-date';
const NAMES = Object.fromEntries(CURRENCIES.map((c) => [c.code, c.name]));
const QUICK = [['USD', 'INR'], ['EUR', 'USD'], ['GBP', 'USD'], ['EUR', 'INR'], ['USD', 'JPY'], ['GBP', 'INR']];

const $ = (id) => document.getElementById(id);
const FIELD_ERRORS = { base: 'fx-base-err', quote: 'fx-quote-err', date: 'fx-date-err' };

// What the selector's hint and the date hint say for each source.
const HINTS = {
  ecb: ["The European Central Bank's daily euro reference rate.", 'From 4 January 1999. Weekends and bank holidays use the last fixing before them.'],
  treasury: ["Treasury's quarterly rate, in units per US dollar. One side must be USD.", 'The report in effect on that day, from the report as of 31 March 2001.'],
  irs: ['The IRS average for the year of your date, in units per US dollar. One side must be USD.', 'Only the year of the date counts.'],
  hmrc: ["HMRC's rate for the month of your date, in units per pound. One side must be GBP.", 'Only the month of the date counts, from January 2021.'],
};
const sourceOf = () => (SOURCE_IDS.includes($('fx-source').value) ? $('fx-source').value : 'ecb');

function syncSource() {
  const [what, when] = HINTS[sourceOf()];
  const hint = $('fx-source-hint');
  hint.textContent = `${what} `;
  hint.appendChild(h('a', { href: '#fx-which' }, 'Which rate to use'));
  $('fx-date-hint').textContent = when;
}

// 1.113 -> "1.1130", 20193.16 -> "20,193.1600", 95.269093 -> "95.269093"
// Set once the visitor changes the form or runs it, so the worked example, which arrives
// after a fetch, never overwrites their own input or result.
let touched = false;
const touch = () => { touched = true; };

const fmt = (n) => n.toLocaleString('en-US', { minimumFractionDigits: 4, maximumFractionDigits: 6 });

// ---------- form ----------

function fillSelect(select, value) {
  for (const c of CURRENCIES) select.appendChild(h('option', { value: c.code }, `${c.code}  ${c.name}`));
  select.value = value;
}

function clearErrors() {
  $('fx-error').textContent = '';
  for (const id of Object.values(FIELD_ERRORS)) $(id).textContent = '';
}

function showFieldErrors(fields) {
  const known = Object.keys(fields).filter((k) => FIELD_ERRORS[k]);
  for (const k of known) $(FIELD_ERRORS[k]).textContent = fields[k];
  return known.length === Object.keys(fields).length;
}

// { input } for a good form, or { errors } for a bad one, so a typo never spends a run.
function readForm() {
  const source = sourceOf();
  const input = { base: $('fx-base').value, quote: $('fx-quote').value, date: $('fx-date').value.trim() };
  // The default source is left out, so the request is the same one the API always took.
  if (source !== 'ecb') input.source = source;
  const errors = {};
  if (!input.date) errors.date = 'Pick a date.';
  else if (!isRealDate(input.date)) errors.date = 'That is not a real calendar date.';
  else if (source === 'ecb' && input.date < FIRST_FIXING) errors.date = 'The ECB has no rates before 4 January 1999.';
  return Object.keys(errors).length ? { errors } : { input };
}

function syncQuick() {
  const base = $('fx-base').value;
  const quote = $('fx-quote').value;
  for (const b of document.querySelectorAll('.fx-chip')) {
    b.setAttribute('aria-pressed', String(b.dataset.base === base && b.dataset.quote === quote));
  }
}

function setPair(base, quote) {
  $('fx-base').value = base;
  $('fx-quote').value = quote;
  syncQuick();
}

// ---------- the ticket ----------

const HEADS = { ecb: 'ECB reference rate', treasury: 'US Treasury reporting rate', irs: 'IRS yearly average', hmrc: 'HMRC monthly rate' };

function head(right, source = 'ecb') {
  return h('div', { class: 'fx-ticket-head' }, [h('span', {}, HEADS[source] || HEADS.ecb), h('span', {}, right)]);
}

// The source id of an answer, from its source name.
const idOf = (r) => SOURCE_IDS.find((id) => SOURCES[id].name === r.source) || 'ecb';

function tear() {
  return h('div', { class: 'fx-tear', 'aria-hidden': 'true' }, [h('i')]);
}

function pairName(base, quote) {
  return h('p', { class: 'fx-pair-name' }, [h('b', {}, base), ' to ', h('b', {}, quote), ` · ${NAMES[base] || base} to ${NAMES[quote] || quote}`]);
}

function show(node) {
  const board = $('fx-board');
  board.textContent = '';
  board.appendChild(node);
}

function idleTicket(line = 'The rate, its inverse and the date or period used appear here.') {
  const source = sourceOf();
  show(h('article', { class: 'fx-ticket idle' }, [
    head('Waiting', source),
    h('div', { class: 'fx-ticket-body' }, [
      h('p', { class: 'fx-pair-name' }, 'Pick two currencies and a date'),
      h('span', { class: 'fx-rate' }, '–'),
      h('p', { class: 'fx-inverse' }, line),
    ]),
    tear(),
    h('div', { class: 'fx-stub' }, [h('p', { class: 'fx-source' }, `Source: ${SOURCES[source].name}.`)]),
  ]));
}

// "Wednesday 31 Dec 2025 to Monday 30 Mar 2026"
const span = (from, to) => `${longDate(from)} to ${longDate(to)}`;

// example: true labels the ticket as a worked example (the tool's first real example), so it is
// never mistaken for the visitor's own lookup.
function resultTicket(r, costLine, { example = false } = {}) {
  if (!r.fixingDate) {
    otherTicket(r, costLine, { example });
    return;
  }
  const note = fixingNote(r.requestedDate, r.fixingDate);
  show(h('article', { class: example ? 'fx-ticket example' : 'fx-ticket' }, [
    head(`Fixing ${r.fixingDate}`),
    h('div', { class: 'fx-ticket-body' }, [
      example ? h('p', { class: 'fx-example-tag' }, 'Worked example') : null,
      pairName(r.base, r.quote),
      h('p', { class: 'fx-rate-line' }, `1 ${r.base} buys`),
      h('span', { class: 'fx-rate' }, [fmt(r.rate), ' ', h('small', {}, r.quote)]),
      h('p', { class: 'fx-inverse' }, ['The other way round: 1 ', r.quote, ' = ', h('b', {}, fmt(r.inverse)), ` ${r.base}`]),
      note ? h('p', { class: 'fx-note' }, [h('span', { class: 'fx-note-tag' }, 'Different day'), note]) : null,
    ]),
    tear(),
    h('div', { class: 'fx-stub' }, [
      h('dl', { class: 'fx-facts' }, [
        h('dt', {}, 'You asked for'), h('dd', {}, longDate(r.requestedDate)),
        h('dt', {}, 'Fixing used'), h('dd', {}, longDate(r.fixingDate)),
      ]),
      h('p', { class: 'fx-source' }, `Source: ${r.source}.`),
      costLine ? h('p', { class: 'fx-cost' }, costLine) : null,
    ]),
  ]));
  $('fx-board').setAttribute('aria-busy', 'false');
}

// An answer from Treasury, the IRS or HMRC: the publication and period used, and the rate as published.
function otherTicket(r, costLine, { example = false } = {}) {
  const id = idOf(r);
  show(h('article', { class: example ? 'fx-ticket example' : 'fx-ticket' }, [
    head(r.effectiveDate ? `Effective ${r.effectiveDate}` : `From ${r.periodStart}`, id),
    h('div', { class: 'fx-ticket-body' }, [
      example ? h('p', { class: 'fx-example-tag' }, 'Worked example') : null,
      pairName(r.base, r.quote),
      h('p', { class: 'fx-rate-line' }, `1 ${r.base} buys`),
      h('span', { class: 'fx-rate' }, [fmt(r.rate), ' ', h('small', {}, r.quote)]),
      h('p', { class: 'fx-inverse' }, ['The other way round: 1 ', r.quote, ' = ', h('b', {}, fmt(r.inverse)), ` ${r.base}`]),
    ]),
    tear(),
    h('div', { class: 'fx-stub' }, [
      h('dl', { class: 'fx-facts' }, [
        h('dt', {}, 'You asked for'), h('dd', {}, longDate(r.requestedDate)),
        h('dt', {}, 'Publication'), h('dd', {}, r.publication),
        h('dt', {}, 'Rate covers'), h('dd', {}, span(r.periodStart, r.periodEnd)),
        h('dt', {}, 'As published'), h('dd', {}, `${r.publishedRate} ${r.publishedAs}`),
      ]),
      h('p', { class: 'fx-source' }, ['Source: ', h('a', { href: r.sourceUrl, rel: 'noopener' }, r.source), '.']),
      costLine ? h('p', { class: 'fx-cost' }, costLine) : null,
    ]),
  ]));
  $('fx-board').setAttribute('aria-busy', 'false');
}

// The source has no rate for this pair and date. The run was free, and the ticket says so.
function noRateTicket(input, message, costLine) {
  const source = input.source || 'ecb';
  show(h('article', { class: 'fx-ticket none' }, [
    head('No rate', source),
    h('div', { class: 'fx-ticket-body' }, [
      pairName(input.base, input.quote),
      h('span', { class: 'fx-rate' }, '–'),
      h('p', { class: 'fx-none-msg' }, `${message} You were not charged for this run.`),
    ]),
    tear(),
    h('div', { class: 'fx-stub' }, [
      h('p', { class: 'fx-source' }, `Source: ${SOURCES[source].name}.`),
      costLine ? h('p', { class: 'fx-cost' }, costLine) : null,
    ]),
  ]));
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
  if (allShown && Object.keys(fields).length) return;
  const box = $('fx-error');
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
  const button = $('fx-run');
  button.disabled = true;
  $('fx-board').setAttribute('aria-busy', 'true');
  try {
    const json = await T.run(SLUG, read.input);
    resultTicket(json.result, costNote(json));
  } catch (e) {
    $('fx-board').setAttribute('aria-busy', 'false');
    if (e.code === 'not_available') noRateTicket(read.input, e.message, null);
    else showError(e);
  } finally {
    button.disabled = false;
  }
}

// ---------- price line and worked example ----------

function showPrice(tool, account) {
  const price = tool.price.display;
  const el = $('fx-price');
  if (account) {
    el.textContent = `Each run costs ${T.money(price)}, taken from your balance. A day with no rate costs nothing.`;
    $('fx-run-note').textContent = '';
  } else {
    el.textContent = `Each run costs ${T.money(price)}. Without an account you get 5 free runs a day.`;
    $('fx-run-note').textContent = '5 free runs a day, no account needed.';
  }
}

// The tool's first example is a real input and the real answer from the ECB file. Showing it
// costs nothing: it comes from the tool listing, not from a run. The form is filled with the
// same input, so pressing the button runs it for real.
function showExample(tool) {
  const ex = (tool.examples || [])[0];
  if (touched) return;
  if (!ex || !ex.output) {
    idleTicket();
    return;
  }
  setPair(ex.input.base, ex.input.quote);
  $('fx-source').value = ex.input.source || 'ecb';
  syncSource();
  $('fx-date').value = ex.input.date;
  resultTicket(ex.output, 'A worked example from the ECB file, not your own lookup. Press "Get the rate" to run it for real.', { example: true });
}

function loadTool() {
  T.api(`/api/v1/tools/${SLUG}`).then((json) => {
    showExample(json.tool);
    T.me().then((account) => showPrice(json.tool, account), () => showPrice(json.tool, null));
  }).catch(() => idleTicket());
}

// ---------- inputs from the address ----------

// A link may carry the inputs (?base=USD&quote=INR&date=2026-10-23, plus &source=treasury): the form opens with them
// filled in, ready to run. The rate itself costs a run, so nothing is run until the visitor asks.
// Anything unusable is ignored and the worked example shows instead.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const base = (q.get('base') || '').toUpperCase();
  const quote = (q.get('quote') || '').toUpperCase();
  const date = (q.get('date') || '').trim();
  const source = (q.get('source') || 'ecb').toLowerCase();
  if (!SOURCE_IDS.includes(source)) return null;
  if (!NAMES[base] || !NAMES[quote] || !isRealDate(date) || (source === 'ecb' && date < FIRST_FIXING)) return null;
  return { base, quote, date, source };
}

// ---------- start ----------

function start() {
  fillSelect($('fx-base'), 'USD');
  fillSelect($('fx-quote'), 'EUR');
  // Today in UTC, as plain text. The server decides which fixing applies.
  $('fx-date').value = new Date().toISOString().slice(0, 10);

  const row = $('fx-quick');
  for (const [base, quote] of QUICK) {
    row.appendChild(h('button', {
      type: 'button', class: 'fx-chip', 'data-base': base, 'data-quote': quote, 'aria-pressed': 'false',
      onclick: () => { touch(); setPair(base, quote); },
    }, `${base} → ${quote}`));
  }
  $('fx-swap').addEventListener('click', () => { touch(); setPair($('fx-quote').value, $('fx-base').value); });
  $('fx-form').addEventListener('input', touch);
  $('fx-form').addEventListener('change', touch);
  $('fx-base').addEventListener('change', syncQuick);
  $('fx-quote').addEventListener('change', syncQuick);
  $('fx-source').addEventListener('change', syncSource);
  $('fx-form').addEventListener('submit', (ev) => { touch(); onSubmit(ev); });
  syncQuick();
  syncSource();

  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('fx-code'), SLUG);
  const asked = fromQuery();
  if (asked) {
    touch();
    setPair(asked.base, asked.quote);
    $('fx-source').value = asked.source;
    syncSource();
    $('fx-date').value = asked.date;
    idleTicket(`Press "Get the rate" for ${asked.base} to ${asked.quote} on ${longDate(asked.date)}.`);
    if (T.takeRunFlag()) $('fx-form').requestSubmit();
    T.api(`/api/v1/tools/${SLUG}`).then((json) => {
      T.me().then((account) => showPrice(json.tool, account), () => showPrice(json.tool, null));
    }).catch(() => {});
    return;
  }
  idleTicket('Loading the worked example.');
  loadTool();
}

start();
