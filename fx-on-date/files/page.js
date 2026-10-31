// The Exchange rate on a date page. core.js (the same file the server uses) supplies the currency
// list and the wording for dates; the rate itself always comes from the server through Toll.run.
import { CURRENCIES, FIRST_FIXING, SOURCE, fixingNote, longDate, isRealDate } from './core.js';

const T = window.Toll;
const h = T.h;
const SLUG = 'fx-on-date';
const NAMES = Object.fromEntries(CURRENCIES.map((c) => [c.code, c.name]));
const QUICK = [['USD', 'INR'], ['EUR', 'USD'], ['GBP', 'USD'], ['EUR', 'INR'], ['USD', 'JPY'], ['GBP', 'INR']];

const $ = (id) => document.getElementById(id);
const FIELD_ERRORS = { base: 'fx-base-err', quote: 'fx-quote-err', date: 'fx-date-err' };

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
  const input = { base: $('fx-base').value, quote: $('fx-quote').value, date: $('fx-date').value.trim() };
  const errors = {};
  if (!input.date) errors.date = 'Pick a date.';
  else if (!isRealDate(input.date)) errors.date = 'That is not a real calendar date.';
  else if (input.date < FIRST_FIXING) errors.date = 'The ECB has no rates before 4 January 1999.';
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

function head(right) {
  return h('div', { class: 'fx-ticket-head' }, [h('span', {}, 'ECB reference rate'), h('span', {}, right)]);
}

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

function idleTicket(line = 'The rate, its inverse and the fixing date appear here.') {
  show(h('article', { class: 'fx-ticket idle' }, [
    head('Waiting'),
    h('div', { class: 'fx-ticket-body' }, [
      h('p', { class: 'fx-pair-name' }, 'Pick two currencies and a date'),
      h('span', { class: 'fx-rate' }, '–'),
      h('p', { class: 'fx-inverse' }, line),
    ]),
    tear(),
    h('div', { class: 'fx-stub' }, [h('p', { class: 'fx-source' }, `Source: ${SOURCE}.`)]),
  ]));
}

// example: true labels the ticket as a worked example (the tool's first real example), so it is
// never mistaken for the visitor's own lookup.
function resultTicket(r, costLine, { example = false } = {}) {
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

// The ECB has no rate for this pair and date. The run was free, and the ticket says so.
function noRateTicket(input, message, costLine) {
  show(h('article', { class: 'fx-ticket none' }, [
    head('No rate'),
    h('div', { class: 'fx-ticket-body' }, [
      pairName(input.base, input.quote),
      h('span', { class: 'fx-rate' }, '–'),
      h('p', { class: 'fx-none-msg' }, `${message} You were not charged for this run.`),
    ]),
    tear(),
    h('div', { class: 'fx-stub' }, [
      h('p', { class: 'fx-source' }, `Source: ${SOURCE}.`),
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
    const mine = account.currency === 'INR' ? price.INR : price.USD;
    el.textContent = `Each run costs ${mine}, taken from your balance. A day with no rate costs nothing.`;
    $('fx-run-note').textContent = '';
  } else {
    el.textContent = `Each run costs ${price.USD} (${price.INR} on a rupee account). Without an account you get 5 free runs a day.`;
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

// A link may carry the inputs (?base=USD&quote=INR&date=2026-10-23): the form opens with them
// filled in, ready to run. The rate itself costs a run, so nothing is run until the visitor asks.
// Anything unusable is ignored and the worked example shows instead.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const base = (q.get('base') || '').toUpperCase();
  const quote = (q.get('quote') || '').toUpperCase();
  const date = (q.get('date') || '').trim();
  if (!NAMES[base] || !NAMES[quote] || !isRealDate(date) || date < FIRST_FIXING) return null;
  return { base, quote, date };
}

// ---------- start ----------

function start() {
  fillSelect($('fx-base'), 'USD');
  fillSelect($('fx-quote'), 'INR');
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
  $('fx-form').addEventListener('submit', (ev) => { touch(); onSubmit(ev); });
  syncQuick();

  const chip = document.querySelector('[data-toll-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('fx-code'), SLUG);
  const asked = fromQuery();
  if (asked) {
    touch();
    setPair(asked.base, asked.quote);
    $('fx-date').value = asked.date;
    idleTicket(`Press "Get the rate" for ${asked.base} to ${asked.quote} on ${longDate(asked.date)}.`);
    T.api(`/api/v1/tools/${SLUG}`).then((json) => {
      T.me().then((account) => showPrice(json.tool, account), () => showPrice(json.tool, null));
    }).catch(() => {});
    return;
  }
  idleTicket('Loading the worked example.');
  loadTool();
}

start();
