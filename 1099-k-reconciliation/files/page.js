// The 1099-K reconciliation page. The worked example is static HTML (a test keeps its answer equal to
// the engine's); every real answer comes from the server through Endwise.run, which runs the same
// core.js. URL parameters prefill the form (content pages link here with them); run=1 runs once.
import { ITEMS, FORM_KINDS, MONTHS, money, toCents } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = '1099-k-reconciliation';
const $ = (id) => document.getElementById(id);
const ADJ = ['refunds', 'chargebacks', 'discounts', 'fees', 'shipping', 'salesTax', 'personal', 'duplicate', 'cashBack', 'otherYear'];
let last = null;
let csvText = null;
let formCount = 0;

function addForm(values = {}) {
  const i = formCount++;
  const row = h('div', { class: 'kr-formrow', 'data-form': String(i) }, [
    h('div', { class: 'kr-row2' }, [
      h('div', { class: 'field' }, [h('label', { for: `kr-1a-${i}` }, 'Box 1a ($)'), h('input', { type: 'text', inputmode: 'decimal', id: `kr-1a-${i}`, value: values.box1a ?? '' })]),
      h('div', { class: 'field' }, [h('label', { for: `kr-3-${i}` }, 'Box 3 (transactions)'), h('input', { type: 'number', min: '0', step: '1', id: `kr-3-${i}`, value: values.box3 ?? '' })]),
    ]),
    h('details', { class: 'dz-fold', ...(values.filer || values.months ? { open: '' } : {}) }, [
      h('summary', {}, 'Filer, kind of form and months'),
      h('div', { class: 'field' }, [h('label', { for: `kr-filer-${i}` }, 'Filer (top left of the form)'), h('input', { type: 'text', id: `kr-filer-${i}`, maxlength: '80', value: values.filer ?? '' })]),
      h('div', { class: 'field' }, [h('label', { for: `kr-kind-${i}` }, 'Kind'), h('select', { id: `kr-kind-${i}` }, Object.entries(FORM_KINDS).map(([k, v]) => h('option', { value: k, ...(values.kind === k ? { selected: '' } : {}) }, v)))]),
      h('div', { class: 'field' }, [h('label', { for: `kr-months-${i}` }, 'Boxes 5a to 5l (optional, 12 amounts)'), h('textarea', { id: `kr-months-${i}`, rows: '2' }, values.months ?? '')]),
    ]),
  ]);
  $('kr-form-list').append(row);
}

function buildAdjustments() {
  for (const k of ADJ) {
    $('kr-adj').append(h('div', { class: 'field' }, [
      h('label', { for: `kr-a-${k}` }, ITEMS[k].label),
      h('input', { type: 'text', inputmode: 'decimal', id: `kr-a-${k}` }),
    ]));
  }
}

const val = (id) => $(id).value.trim();
const amounts = (text) => text.split(/[\s;]+/).map((x) => x.trim()).filter(Boolean);

function readInput(op) {
  const input = { op, taxYear: Number(val('kr-year')), filerType: val('kr-type'), forms: [] };
  for (const row of document.querySelectorAll('[data-form]')) {
    const i = row.dataset.form;
    const box1a = val(`kr-1a-${i}`);
    if (!box1a) continue;
    const f = { filer: val(`kr-filer-${i}`) || undefined, kind: $(`kr-kind-${i}`).value, box1a };
    if (val(`kr-3-${i}`)) f.box3 = Number(val(`kr-3-${i}`));
    const m = amounts(val(`kr-months-${i}`).replace(/,(?=\s)/g, ' '));
    if (m.length) f.months = m;
    input.forms.push(f);
  }
  const adjustments = {};
  for (const k of ADJ) if (val(`kr-a-${k}`)) adjustments[k] = val(`kr-a-${k}`);
  if (Object.keys(adjustments).length) input.adjustments = adjustments;
  const items = val('kr-items').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const parts = l.split(',').map((x) => x.trim());
    const cost = parts.pop();
    const proceeds = parts.pop();
    return { description: parts.join(', ') || undefined, proceeds, cost };
  });
  if (items.length) input.personalItems = items;
  const books = {};
  if (val('kr-books')) books.grossReceipts = val('kr-books');
  const bm = amounts(val('kr-book-months').replace(/,(?=\s)/g, ' '));
  if (bm.length) books.months = bm;
  if (Object.keys(books).length) input.books = books;
  if (csvText) { input.transactionsCsv = csvText; if ($('kr-taxin').checked) input.taxInGross = true; }
  return input;
}

const ERR = { forms: 'kr-forms-err', adjustments: 'kr-adj-err', personalItems: 'kr-items-err', books: 'kr-books-err', transactionsCsv: 'kr-csv-err', columns: 'kr-csv-err' };
function clearErrors() {
  $('kr-error').textContent = '';
  for (const id of new Set(Object.values(ERR))) $(id).textContent = '';
}
function showError(e, box = 'kr-error') {
  let shown = false;
  for (const [k, msg] of Object.entries(e.fields ?? {})) {
    const id = ERR[k.split('.')[0]];
    if (id) { $(id).textContent = msg; shown = true; }
  }
  if (!shown) $(box).textContent = e.status === 401 ? 'Sign in to keep going: you have used today\'s free runs.' : (e.message || 'Something went wrong. Try again.');
}

function render(r) {
  const out = $('kr-out');
  out.textContent = '';
  out.append(
    h('div', { class: 'dz-rh' }, h('span', { class: 'dz-wx' }, 'Your walkdown')),
    h('p', { class: 'dz-answer' }, r.answer),
    h('ol', { class: 'dz-items kr-bridge' }, r.bridge.map((l) => h('li', { class: `is-${l.kind}${l.kind === 'total' ? ' tot' : ''}` }, [
      h('b', {}, `${l.kind === 'item' ? 'Less: ' : ''}${l.label}`), h('span', {}, l.amount), h('small', {}, l.where)]))),
  );
  if (r.checks.length) out.append(h('h3', { class: 'kr-heading' }, 'Checks'), h('ul', { class: 'kr-checks' }, r.checks.map((c) => h('li', { class: `is-${c.level}` }, c.text))));
  if (r.monthly) {
    out.append(h('h3', { class: 'kr-heading' }, 'Month by month'), h('table', { class: 'rules' }, [
      h('thead', {}, h('tr', {}, ['Month', 'Form', r.monthly[0].books === null ? 'Export' : 'Books', 'Difference'].map((x) => h('th', {}, x)))),
      h('tbody', {}, r.monthly.map((m) => h('tr', { class: m.variance ? 'is-off' : '' }, [`${m.month} (${m.box})`, money(m.form), money(m.books ?? m.export), money(m.variance)].map((c) => h('td', {}, c))))),
    ]));
  }
  out.append(h('p', { class: 'kr-aside' }, `${r.reportOn.form}: ${r.reportOn.text}`));
  $('kr-sheet-box').hidden = false;
}

async function run(op = 'reconcile') {
  clearErrors();
  const input = readInput(op);
  if (!input.forms.length) { $('kr-forms-err').textContent = 'Enter Box 1a from at least one form.'; return null; }
  $('kr-status').textContent = 'Working it out';
  try {
    const res = await T.run(SLUG, input);
    $('kr-status').textContent = 'Done';
    return res.result ?? res;
  } catch (e) {
    $('kr-status').textContent = '';
    showError(e, op === 'workpaper' ? 'kr-sheet-error' : 'kr-error');
    return null;
  }
}

$('kr-form').addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const r = await run();
  if (r) { last = r; render(r); }
});

$('kr-sheet-run').addEventListener('click', async () => {
  $('kr-sheet-error').textContent = '';
  const r = await run('workpaper');
  if (!r) return;
  const box = $('kr-sheet-out');
  box.textContent = '';
  const status = h('p', { class: 'visually-hidden', role: 'status' });
  const download = (name, text, type) => {
    const a = h('a', { class: 'btn btn-ghost kr-small', href: URL.createObjectURL(new Blob([text], { type })), download: name }, `Download ${name}`);
    return a;
  };
  box.append(
    h('pre', { class: 'kr-md' }, r.markdown),
    h('div', { class: 'kr-actions' }, [
      download(`1099-k-reconciliation-${r.taxYear}.md`, r.markdown, 'text/markdown'),
      download(`1099-k-reconciliation-${r.taxYear}.csv`, r.csv, 'text/csv'),
      h('button', { class: 'btn btn-ghost kr-small', type: 'button', onclick: (e) => T.copy(r.markdown, e.currentTarget, status) }, 'Copy the worksheet'),
    ]),
    status,
  );
});

$('kr-add-form').addEventListener('click', () => addForm());

$('kr-file').addEventListener('change', async () => {
  $('kr-csv-err').textContent = '';
  const file = $('kr-file').files[0];
  csvText = null;
  if (!file) return;
  if (file.size > 180_000) { $('kr-csv-err').textContent = 'That file is over 180 kB: export a shorter date range, or enter the totals instead.'; return; }
  csvText = await file.text();
});

// ---------- prefill from the URL ----------

buildAdjustments();
const q = new URLSearchParams(location.search);
addForm({
  filer: q.get('filer') ?? '',
  kind: q.get('kind') ?? 'tpso',
  box1a: q.get('box1a') ?? '',
  box3: q.get('box3') ?? '',
  months: (q.get('months') ?? '').split(',').filter(Boolean).join(' '),
});
if (q.get('year')) $('kr-year').value = q.get('year');
if (q.get('type')) $('kr-type').value = q.get('type');
for (const k of ADJ) if (q.get(k) && toCents(q.get(k)) !== null) $(`kr-a-${k}`).value = q.get(k);
if (q.get('items')) $('kr-items').value = q.get('items').split('|').join('\n');
if (q.get('books')) $('kr-books').value = q.get('books');
if (q.get('run') === '1' && q.get('box1a')) $('kr-form').requestSubmit();
export { last, MONTHS };
