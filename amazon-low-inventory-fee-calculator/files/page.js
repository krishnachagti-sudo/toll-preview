// The Amazon low-inventory-level fee calculator page. Every check runs on the server through
// Endwise.run: one SKU is free here, a file is priced per SKU. The worked examples at rest are the
// tool's own published examples. Address parameters prefill the form with the API's own names
// (?date=&rule=&sku=&tier=&weightLb=&avgInventory30=&unitsShipped30=&dos30=&inventory=
// &avgDailyBefore=&prepDays=... ; ?tab=file opens the file tab; run=1 runs it on arrival).

const T = window.Endwise;
const h = T.h;
const SLUG = 'amazon-low-inventory-fee-calculator';
const $ = (id) => document.getElementById(id);

let mode = 'one';
let signedIn = false;

const NUM = ['weightLb', 'unitsLast7', 'avgInventory30', 'unitsShipped30', 'avgInventory90', 'unitsShipped90', 'dos30', 'dos90', 'inventory', 'avgDailyBefore', 'avgDailyAfter', 'awdSharePct', 'onHand', 'dailySales', 'inboundUnits'];
const TEXT = ['sku', 'tier', 'sellerFirstReceived', 'newSelection', 'productFirstReceived', 'inboundArrives'];
const PLAN = ['prepDays', 'transitDays', 'receivingDays', 'supplierDays', 'safetyDays', 'coverDays'];
const RULE_2026 = ['avgInventory30', 'unitsShipped30', 'avgInventory90', 'unitsShipped90', 'dos30', 'dos90'];
const RULE_2027 = ['inventory', 'avgDailyBefore', 'avgDailyAfter'];

const ruleNow = () => $('li-rule').value || ($('li-date').value && $('li-date').value > '2027-01-31' ? '2027' : '2026');
function showRule() {
  const r = ruleNow();
  $('li-set-2026').hidden = r !== '2026';
  $('li-set-2027').hidden = r !== '2027';
}

function readForm() {
  const input = { op: 'plan', date: $('li-date').value };
  if (!input.date) return { errors: { error: 'Pick the week you are checking.' } };
  if ($('li-rule').value) input.rule = $('li-rule').value;
  for (const k of PLAN) { const v = $(`li-${k}`).value.trim(); if (v !== '') input[k] = Number(v); }
  if (mode === 'file') {
    const csv = $('li-csv').value;
    if (!csv.trim()) return { errors: { csv: 'Paste a CSV or choose a file.' } };
    input.csv = csv;
    return { input };
  }
  const rule = ruleNow();
  const sku = {};
  const useDos = $('li-dos30').value.trim() !== '' && $('li-dos90').value.trim() !== '';
  for (const k of NUM) {
    if (rule === '2026' && RULE_2027.includes(k)) continue;
    if (rule === '2027' && RULE_2026.includes(k)) continue;
    if (rule === '2026' && (useDos ? ['avgInventory30', 'unitsShipped30', 'avgInventory90', 'unitsShipped90'] : ['dos30', 'dos90']).includes(k)) continue;
    const v = $(`li-${k}`).value.trim();
    if (v !== '') sku[k] = Number(v);
  }
  for (const k of TEXT) { const v = $(`li-${k}`).value.trim(); if (v) sku[k] = v; }
  if ($('li-grocery').checked) sku.grocery = true;
  input.skus = [sku];
  return { input };
}

function costNote(json) {
  if (json.charged) return `Charged ${json.charged.display}. Your balance is ${json.balance.display}.`;
  if (typeof json.freeRunsLeft === 'number') return `Free check. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'check' : 'checks'} left today.`;
  return null;
}

function showError(e) {
  const fields = e.fields || {};
  if (fields.csv && mode === 'file') { $('li-csv-err').textContent = fields.csv; return; }
  const box = $('li-error');
  box.textContent = Object.values(fields)[0] || e.message;
  if (e.status === 401) box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in to continue'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

let quoteTimer = null;
function quoteSoon() {
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(async () => {
    const el = $('li-cost');
    if (mode === 'one') { el.textContent = ''; return; }
    const { input } = readForm();
    if (!input) { el.textContent = ''; return; }
    if (!signedIn) { el.textContent = 'A file needs an account: $0.005 per SKU, at most $4.99 a month.'; return; }
    try {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
      el.textContent = q.amount ? `This file costs ${q.display} from your balance.` : 'This check is free for you now.';
    } catch (e) {
      el.textContent = e.status === 401 ? 'A file needs an account: $0.005 per SKU.' : '';
    }
  }, 300);
}

const STATUS = { fee: 'fee', exempt: 'exempt', 'no-fee': 'no fee', 'not-charged': 'not charged' };
const money = (c) => `$${(c / 100).toFixed(2)}`;

function download(name, body) {
  const blob = new Blob([body], { type: 'text/csv' });
  return h('a', { href: URL.createObjectURL(blob), download: name, class: 'li-dl' }, name);
}

function render(r, { example = false, note = null } = {}) {
  const out = $('li-out');
  out.textContent = '';
  if (example) {
    out.appendChild(h('div', { class: 'dz-rh' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', { class: 'dz-wx' }, 'Worked example')]));
    out.appendChild(h('p', { class: 'dz-exin' }, `Example: ${example}`));
  }
  if (r.results.length === 1) return renderOne(r, out, note);
  out.appendChild(h('p', { class: 'li-answer' }, r.answer));
  if (note) out.appendChild(h('p', { class: 'muted small' }, note));
  const s = r.summary;
  out.appendChild(h('div', { class: 'li-figures' }, [
    ['fee', s.fee], ['exempt', s.exempt], ['no fee', s.noFee + s.notCharged], ['fee this week', money(s.weekFeeCents)], ['send now', s.sendNow],
  ].map(([k, v]) => h('div', { class: `li-fig li-fig-${k.replace(/\s+/g, '-')}` }, [h('span', { class: 'li-big' }, String(v)), h('span', { class: 'li-label' }, k)]))));
  const rows = r.results.slice(0, 200);
  out.appendChild(h('div', { class: 'li-table-wrap' }, h('table', { class: 'li-table' }, [
    h('thead', {}, h('tr', {}, ['SKU', 'Days of supply', 'Fee', 'Send', 'Why'].map((c) => h('th', {}, c)))),
    h('tbody', {}, rows.map((x) => {
      const p = x.plan || {};
      return h('tr', { class: `s-${x.status}` }, [
        h('td', {}, [h('b', { class: 'li-mono' }, x.sku || 'SKU'), h('div', { class: 'muted small' }, x.tier)]),
        h('td', {}, [h('b', { class: 'li-mono' }, x.daysOfSupply === null ? '--' : x.daysOfSupply.toFixed(1)), h('div', { class: 'muted small' }, Object.entries(x.windows).map(([k, v]) => `${k} ${v}`).join(', '))]),
        h('td', {}, [h('span', { class: `li-status s-${x.status}` }, STATUS[x.status]), x.status === 'fee' ? h('div', { class: 'small' }, `${money(x.rateCents)} a unit${x.weekFeeCents !== null ? `, ${money(x.weekFeeCents)} this week` : ''}`) : null]),
        h('td', {}, p.unitsToSend !== undefined ? [h('b', {}, `${p.unitsToSend.toLocaleString('en-US')} units`), h('div', { class: 'small' }, p.status === 'on-time' ? `by ${p.sendBy}` : 'today')] : h('span', { class: 'muted small' }, p.skipped || (p.status === 'later' ? 'not this year' : ''))),
        h('td', { class: 'small' }, x.reason),
      ]);
    })),
  ])));
  if (r.results.length > rows.length) out.appendChild(h('p', { class: 'muted small' }, `The first ${rows.length} SKUs are shown; the CSV has all ${r.results.length}.`));
  out.appendChild(h('p', { class: 'li-downloads' }, ['Download: ', download('low-inventory-plan.csv', r.csv), '.']));
}

// One SKU: the answer, then one line per figure with where it comes from, then the plan's detail.
function renderOne(r, out, note) {
  const x = r.results[0];
  const p = x.plan;
  out.appendChild(h('p', { class: 'dz-answer' }, x.status === 'fee' ? `${x.sku || 'This SKU'} pays the fee: about ${money(x.weekFeeCents ?? 0)} this week` : `${x.sku || 'This SKU'}: ${STATUS[x.status]} this week`));
  if (note) out.appendChild(h('p', { class: 'muted small' }, note));
  const win = Object.entries(x.windows).map(([k, v]) => `${k === 'short' ? 'short-term' : k === 'long' ? 'long-term' : k} ${v}`).join(', ');
  const items = [
    ['Days of supply', x.daysOfSupply === null ? '--' : x.daysOfSupply.toFixed(1), `${win}; the fee needs both under 28`],
    x.band ? ['Band', x.band, `${x.rule} rule`] : null,
    x.rateCents !== null && x.rateCents !== undefined ? ['Rate', `${money(x.rateCents)} a unit`, `Amazon's ${x.rule} table: ${x.rateLabel}`] : null,
    x.weekFeeCents !== null && x.weekFeeCents !== undefined ? ['Fee this week', money(x.weekFeeCents), `${x.weekUnits} units shipped in the week`] : null,
    x.toClear ? ['To stop it', `${x.toClear.averageUnits.toLocaleString('en-US')} units`, x.toClear.text] : null,
    p && p.unitsToSend !== undefined ? ['Send', `${p.unitsToSend.toLocaleString('en-US')} units`, p.status === 'on-time' ? `by ${p.sendBy}, after your lead time` : `today: they arrive ${p.arrivesOn} after ${p.leadDays} days of prep, transit and receiving`] : null,
  ].filter(Boolean);
  out.appendChild(h('ol', { class: 'dz-items' }, items.map(([k, v, src]) => h('li', { class: k === 'Fee this week' ? 'tot' : '' }, [h('b', {}, k), h('span', {}, v), h('small', {}, src)]))));
  out.appendChild(h('p', { class: 'muted small' }, x.reason));
  out.appendChild(h('p', { class: 'li-downloads' }, ['Download: ', download('low-inventory-plan.csv', r.csv), '.']));
  {
    if (p && p.answer) out.appendChild(h('details', { class: 'dz-fold' }, [h('summary', {}, 'The full answer and the reorder plan'), h('p', {}, r.answer), h('p', {}, p.answer)]));
    if (p && p.lateWeeks && p.lateWeeks.length) {
      out.appendChild(h('div', { class: 'li-table-wrap' }, h('table', { class: 'li-table' }, [
        h('caption', {}, 'Weekly checks until the shipment is in (steady sales)'),
        h('thead', {}, h('tr', {}, ['Check', 'Days of stock', 'Band', 'Units', 'Fee'].map((c) => h('th', {}, c)))),
        h('tbody', {}, p.lateWeeks.map((w) => h('tr', {}, [w.check, w.daysOfSupply.toFixed(1), w.band, String(w.units), w.feeCents === null ? '2026 averages' : money(w.feeCents)].map((c) => h('td', {}, c))))),
      ])));
    }
    if (p && p.safeZone) out.appendChild(h('p', { class: 'muted small' }, `Safe zone at ${p.dailySales} a day: at least ${p.safeZone.minUnits.toLocaleString('en-US')} units (28 days) and, first in first out, no more than ${p.safeZone.agedFromUnits.toLocaleString('en-US')} (180 days), past which units age into Amazon's aged-inventory storage rates from day ${p.safeZone.agedFromDays}.`));
    if (p && p.note) out.appendChild(h('p', { class: 'muted small' }, p.note));
    const ex = x.exemptions.filter((e) => e.applies !== false);
    if (ex.length) out.appendChild(h('ul', { class: 'small li-ex' }, ex.map((e) => h('li', {}, `${e.applies === true ? 'Exempt: ' : ''}${e.why}`))));
    for (const n of x.notes) out.appendChild(h('p', { class: 'muted small' }, n));
  }
}

async function onSubmit(ev) {
  ev.preventDefault();
  for (const el of document.querySelectorAll('.li-form .field-error')) el.textContent = '';
  const { input, errors } = readForm();
  if (errors) { if (errors.csv) $('li-csv-err').textContent = errors.csv; else $('li-error').textContent = errors.error; return; }
  $('li-status').textContent = 'Checking.';
  try {
    const json = await T.run(SLUG, input);
    render(json.result, { note: costNote(json) });
    $('li-status').textContent = 'Done.';
  } catch (e) {
    showError(e);
    $('li-status').textContent = '';
  }
}

function setMode(next) {
  mode = next;
  $('li-tab-one').setAttribute('aria-selected', String(next === 'one'));
  $('li-tab-file').setAttribute('aria-selected', String(next === 'file'));
  $('li-one').hidden = next !== 'one';
  $('li-file').hidden = next !== 'file';
  $('li-reorder').hidden = next !== 'one';
  $('li-run').textContent = next === 'one' ? 'Check this SKU' : 'Check the file';
  quoteSoon();
}

function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  let any = false;
  for (const k of ['date', 'rule', ...NUM, ...TEXT, ...PLAN]) {
    const el = $(`li-${k}`);
    if (el && q.get(k) !== null) { el.value = q.get(k); any = true; }
  }
  if (q.get('grocery')) $('li-grocery').checked = true;
  // A page that prefills the 2027 rule clears the 2026 sample numbers, and the other way round.
  if (any) {
    for (const k of [...RULE_2026, ...RULE_2027, 'onHand', 'unitsLast7', 'weightLb', 'supplierDays']) if (q.get(k) === null) $(`li-${k}`).value = '';
  }
  if (q.get('tab') === 'file') setMode('file');
  showRule();
  // run=1: the visitor pressed a content page's button, so it runs once on arrival.
  return any && q.get('run') !== null;
}

async function start() {
  $('li-tab-one').addEventListener('click', () => setMode('one'));
  $('li-tab-file').addEventListener('click', () => setMode('file'));
  $('li-date').addEventListener('change', showRule);
  $('li-rule').addEventListener('change', showRule);
  $('li-csv').addEventListener('input', quoteSoon);
  $('li-upload').addEventListener('change', async () => {
    const file = $('li-upload').files[0];
    if (!file) return;
    if (file.size > 1_900_000) { $('li-csv-err').textContent = 'That file is over 1.9 MB; split it into smaller files.'; return; }
    $('li-csv').value = await file.text();
    quoteSoon();
  });
  $('li-form').addEventListener('submit', onSubmit);
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('li-code'), SLUG);
  T.me().then((account) => { signedIn = !!account; quoteSoon(); }).catch(() => {});
  const prefilled = fromQuery();
  try {
    const tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
    const [one, , file] = tool.examples;
    $('li-csv').value = file.input.csv;
    if (prefilled) await onSubmit(new Event('submit'));
    else render(one.output, { example: `${one.input.skus[0].sku}, ${one.input.skus[0].tier.replace('-', ' ')}, ${one.input.skus[0].weightLb} lb, ${one.input.skus[0].unitsLast7} units shipped last week, week of ${one.input.date}`, note: 'A made-up mug under 28 days of supply. Change the numbers and press "Check this SKU" (free), or open "A file" for many SKUs.' });
  } catch {
    $('li-out').textContent = 'The worked example could not load. The calculator still works: fill in a SKU and press the button.';
  }
  quoteSoon();
}

start();
