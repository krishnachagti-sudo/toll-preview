// The eBay transaction report flattener page. The preview runs here, in the browser, with core.js
// (the same file the server runs): the report is read, folded by order number and proved without
// uploading anything. Only "Get every sale as CSV" sends the report to the server (Endwise.run, paid),
// which runs the same engine and returns the CSV files. The samples are core.js's.
import { flatten, money, typeLabel, FIELDS, SAMPLES, SAMPLE_COSTS, SAMPLE_LABELS, LIMITS, SALES_PER_UNIT } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'ebay-transaction-report-flattener';
const $ = (id) => document.getElementById(id);
const SAMPLE_NAMES = { us: 'a made-up US report', uk: 'a made-up eBay UK report' };
const PREVIEW_SALES = 3;

const state = { text: SAMPLES.us, name: 'sample', sample: 'us' };

// "key, amount" lines into { key: amount }.
function pairs(id, what) {
  const out = {};
  for (const line of $(id).value.split(/\n/)) {
    const t = line.trim();
    if (!t) continue;
    const m = /^(.+?)[\s,;\t]+(-?[$£€]?\s?[\d.,]+)$/.exec(t);
    if (!m) throw new Error(`${what}: "${t}" is not "id, amount".`);
    out[m[1].replace(/[,;]$/, '').trim()] = m[2].replace(/[$£€\s]/g, '');
  }
  return out;
}

function opts() {
  const o = { costs: pairs('ef-costs', 'Your cost'), labels: pairs('ef-labels', 'Labels'), allocate: $('ef-allocate').checked ? 'gross' : 'none' };
  const columns = {};
  for (const f of FIELDS) { const v = $(`ef-c-${f.id}`)?.value.trim(); if (v) columns[f.id] = v; }
  if (Object.keys(columns).length) o.columns = columns;
  const cur = $('ef-currency').value.trim();
  if (cur) {
    if (!/^[A-Za-z]{3}$/.test(cur)) throw new Error('Currency is a three-letter code such as USD or GBP.');
    o.currency = cur.toUpperCase();
  }
  if ($('ef-dateorder').value) o.dateOrder = $('ef-dateorder').value;
  return o;
}

function columnFields() {
  const box = $('ef-columns');
  for (const f of FIELDS) box.append(h('label', null, [f.label, ' ', h('input', { id: `ef-c-${f.id}`, type: 'text', placeholder: 'found by name' })]));
}

// ---------- showing the result ----------

const cellsOf = (r, s, m) => [
  s.order, s.date ?? '', s.items.map((x) => `${x.title ?? x.itemId}${x.quantity > 1 ? ` x${x.quantity}` : ''}`).join('; ') || '(no item rows)',
  m(s.gross), m(s.feeTotal + s.unexplained), m(s.labels + s.outsideLabel), m(s.otherFees), m(s.refunds + s.claims + s.adjustments), m(s.allocated), m(s.kept),
  s.costKnown || s.cost ? m(s.cost) : '', s.costKnown || s.cost ? m(s.profit) : '', s.flags.join('; '),
];
const SALE_HEAD = ['Order', 'Date', 'Items', 'Gross', 'Fees on the sale row', 'Labels', 'Ad and other fees', 'Refunds, claims, adjustments', 'Spread share', 'Kept', 'Your cost', 'Profit', 'Notes'];

function salesTable(r, list, caption) {
  const m = (v) => money(v, r.currency);
  return h('div', { class: 'table-scroll' }, [h('table', { class: 'ef-table' }, [
    h('caption', null, caption),
    h('thead', null, [h('tr', null, SALE_HEAD.map((x) => h('th', { scope: 'col' }, x)))]),
    h('tbody', null, list.map((s) => h('tr', { class: s.flags.length ? 'ef-off' : '' }, cellsOf(r, s, m).map((c, i) => (i === 0 ? h('th', { scope: 'row' }, c) : h('td', { class: i >= 3 && i <= 11 ? 'num' : '' }, c)))))),
  ])]);
}

function yearsTable(r) {
  const m = (v) => money(v, r.currency);
  const row = (label, t, cls) => h('tr', { class: cls }, [h('th', { scope: 'row' }, label), ...[String(t.sales), m(t.gross), m(t.saleDeductions), m(t.labels), m(t.otherFees), m(t.refunds + t.claims), m(t.adjustments), m(t.net), m(t.kept), m(t.profit)].map((c) => h('td', { class: 'num' }, c))]);
  return h('div', { class: 'table-scroll' }, [h('table', { class: 'ef-table' }, [
    h('caption', null, 'By calendar year, each row by its own date (the label or refund in the year it happened)'),
    h('thead', null, [h('tr', null, ['Year', 'Sales', 'Gross', 'Fees on sale rows', 'Labels', 'Ad and other fees', 'Refunds and claims', 'Adjustments', 'Net (eBay)', 'Kept', 'Profit'].map((x) => h('th', { scope: 'col' }, x)))]),
    h('tbody', null, [...r.years.map((y) => row(y.period, y, '')), row('Total', r.totals, 'ef-total')]),
  ])]);
}

function columnsBlock(r) {
  const f = r.columns.fields;
  return h('details', { class: 'ef-values' }, [
    h('summary', null, `How each column was found (${Object.keys(f).length} columns, ${r.columns.fees.length} fee columns)`),
    h('ul', null, [
      ...Object.entries(f).map(([id, c]) => h('li', null, `${FIELDS.find((x) => x.id === id).label}: "${c.heading}" (${c.how})`)),
      h('li', null, `Fee columns, by the word "fee": ${r.columns.fees.length ? r.columns.fees.map((x) => `"${x}"`).join(', ') : 'none'}; signs ${r.columns.feeSign}.`),
      r.columns.taxes.length ? h('li', null, `Tax columns, shown apart: ${r.columns.taxes.map((x) => `"${x}"`).join(', ')}.`) : null,
      r.columns.notUsed.length ? h('li', null, `Not used: ${r.columns.notUsed.join(', ')}.`) : null,
    ].filter(Boolean)),
  ]);
}

function unmatchedBlock(r) {
  if (!r.unmatched.length && !r.moves.length) return null;
  const m = (v) => money(v ?? 0, r.currency);
  return h('details', { class: 'ef-values' }, [
    h('summary', null, `Rows without an order number (${r.unmatched.length}) and money moved (${r.moves.length})`),
    h('ul', null, [
      ...r.unmatched.map((u) => h('li', null, `Line ${u.line}, ${u.date ?? 'no date'}: ${typeLabel(u.type)}${u.description ? ` (${u.description})` : ''}, ${m(u.net)}`)),
      ...r.moves.map((u) => h('li', null, `Line ${u.line}, ${u.date ?? 'no date'}: ${typeLabel(u.type)}, ${m(u.net)} (money moved, not in the sales totals)`)),
    ]),
  ]);
}

function show(r, label, full) {
  const out = $('ef-out');
  out.textContent = '';
  const list = full ? r.sales : r.sales.slice(0, PREVIEW_SALES);
  const p = r.proof;
  const t = r.totals;
  const m = (v) => money(v, r.currency);
  // One line per figure, each from its own rows of the report.
  const item = (k, v, src, key = false) => h('li', key ? { class: 'key' } : {}, [h('span', null, k), h('b', null, m(v)), h('small', null, src)]);
  out.append(...[
    h('div', { class: 'tf-res-h' }, [full && state.sample ? h('span', { class: 'ex-tag' }, 'Example') : null, h('p', { class: 'ef-label' }, label)].filter(Boolean)),
    full && state.sample ? h('p', { class: 'tf-exin' }, `Example: ${SAMPLE_NAMES[state.sample]}${state.sample === 'us' ? ', December 2025 to November 2026' : ', in pounds'}`) : null,
    h('p', { class: 'tf-big' }, [`${m(t.kept)} kept`, h('small', null, `from ${t.sales} sales with ${m(t.gross)} gross`)]),
    h('p', { class: 'ef-answer' }, r.answer),
    h('ul', { class: 'tf-items' }, [
      item('Gross', t.gross, 'Gross transaction amount on the sale rows'),
      item('Fees on the sale rows', t.saleDeductions, 'the fee columns, by name'),
      item('Shipping labels', t.labels, 'label rows with the order number'),
      item('Ad and other fees', t.otherFees, 'other fee rows with the order number'),
      item('Refunds and claims', t.refunds + t.claims, 'refund, claim and dispute rows'),
      t.adjustments ? item('Adjustments', t.adjustments, 'adjustment rows') : null,
      t.outsideLabels ? item('Labels bought outside eBay', t.outsideLabels, 'your list under More') : null,
      item('Kept', t.kept, t.outsideLabels ? "eBay's Net amount on each sale's rows, less outside labels" : "the sum of eBay's Net amount on each sale's rows", !t.cost),
      t.cost ? item('Your cost', t.cost, 'your list under More') : null,
      t.cost ? item('Profit', t.profit, 'kept less your cost', true) : null,
    ].filter(Boolean)),
    ...r.warnings.map((w) => h('p', { class: 'ef-warn' }, w)),
    h('p', { class: p.ok ? 'muted' : 'ef-warn' }, `Proof: the file's Net amount totals ${money(p.fileNet, r.currency)}: ${money(p.inSales, r.currency)} in sales, ${money(p.inUnmatched, r.currency)} on rows without an order number and ${money(p.inMoves, r.currency)} of money moved${p.ok ? ', to the cent.' : `, ${money(p.difference, r.currency)} not accounted for.`}`),
    yearsTable(r),
    h('h2', { class: 'ef-h' }, full ? 'Every sale, one row each' : `The first ${Math.min(PREVIEW_SALES, r.sales.length)} of ${r.sales.length} sales`),
    salesTable(r, list, full ? `${r.sales.length} orders` : 'The full file has every sale and the months'),
    unmatchedBlock(r),
    columnsBlock(r),
  ].filter(Boolean));
}

function unitsOf(r) { return Math.max(1, Math.ceil(r.nSales / SALES_PER_UNIT)); }

function run() {
  $('ef-error').textContent = '';
  try {
    const r = flatten(state.text, opts());
    show(r, state.sample ? `Sample: ${SAMPLE_NAMES[state.sample]}` : state.name, Boolean(state.sample));
    const u = unitsOf(r);
    $('ef-go').disabled = Boolean(state.sample);
    $('ef-go').textContent = state.sample ? 'Choose your own report for the CSV files' : `Get every sale as CSV ($${(2 * u).toFixed(2)})`;
    $('ef-go-note').textContent = state.sample ? 'The sample\'s full result is shown. Choose your own report to preview it, free.' : `${r.nSales.toLocaleString('en-US')} sales: $2.00 per 2,500. The same file again within 7 days is free; at most $9 a month.`;
    $('ef-status').textContent = r.answer;
  } catch (e) {
    $('ef-error').textContent = e.message;
    $('ef-out').textContent = '';
    $('ef-go').disabled = true;
  }
}

async function load(file) {
  if (file.size > LIMITS.bytes) { $('ef-error').textContent = 'The file is over 5 MB; create the report for a shorter date range.'; return; }
  state.text = await file.text();
  state.name = file.name;
  state.sample = null;
  $('ef-costs').value = '';
  $('ef-labels').value = '';
  $('ef-file-name').textContent = `${file.name}, ${file.size.toLocaleString('en-US')} bytes. Read in your browser; nothing is uploaded.`;
  run();
}

function loadSample(key) {
  state.text = SAMPLES[key];
  state.name = 'sample';
  state.sample = key;
  $('ef-costs').value = Object.entries(SAMPLE_COSTS[key]).map(([k, v]) => `${k}, ${v}`).join('\n');
  $('ef-labels').value = Object.entries(SAMPLE_LABELS[key]).map(([k, v]) => `${k}, ${v}`).join('\n');
  run();
}

const link = (f, label) => h('a', { href: URL.createObjectURL(new Blob([f.text], { type: 'text/csv' })), download: f.name, class: 'btn btn-small' }, label);

async function buy() {
  if (state.sample) return;
  $('ef-error').textContent = '';
  $('ef-go').disabled = true;
  $('ef-status').textContent = 'Flattening the report.';
  try {
    const o = opts();
    const body = { op: 'flatten', text: state.text, allocate: o.allocate };
    for (const k of ['columns', 'currency', 'dateOrder']) if (o[k]) body[k] = o[k];
    if (Object.keys(o.costs).length) body.costs = o.costs;
    if (Object.keys(o.labels).length) body.labels = o.labels;
    const res = await T.run(SLUG, body);
    const f = res.result.files;
    show(flatten(state.text, o), state.name, true);
    const amount = res.charged?.amount ?? 0;
    $('ef-out').prepend(h('div', { class: 'ef-done' }, [
      h('p', { class: 'ef-downloads' }, [link(f.sales, 'One row per sale'), link(f.years, 'Totals by year'), link(f.months, 'Totals by month'), link(f.unmatched, 'Rows without an order number')]),
      h('p', { class: 'muted' }, `${amount > 0 ? `Charged $${(amount / 1e6).toFixed(2)}.` : 'No charge for this one.'} The CSV files open in Excel, Numbers or Google Sheets.`),
    ]));
  } catch (e) {
    $('ef-error').textContent = e.status === 401 ? 'Sign in to get the CSV files. The preview above stays free.' : e.message;
  } finally {
    $('ef-go').disabled = false;
    $('ef-status').textContent = '';
  }
}

function init() {
  columnFields();
  const q = new URLSearchParams(location.search);
  if (q.get('allocate') === 'gross') $('ef-allocate').checked = true;
  if (/^[A-Za-z]{3}$/.test(q.get('currency') ?? '')) $('ef-currency').value = q.get('currency').toUpperCase();
  if (['mdy', 'dmy'].includes(q.get('dateOrder'))) $('ef-dateorder').value = q.get('dateOrder');
  $('ef-file').addEventListener('change', (e) => { if (e.target.files[0]) load(e.target.files[0]); });
  const drop = $('ef-drop');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });
  for (const b of document.querySelectorAll('[data-sample]')) b.addEventListener('click', () => loadSample(b.dataset.sample));
  for (const id of ['ef-costs', 'ef-labels', 'ef-allocate', 'ef-currency', 'ef-dateorder']) $(id).addEventListener('change', run);
  $('ef-columns').addEventListener('change', run);
  $('ef-go').addEventListener('click', buy);
  const sample = q.get('sample');
  loadSample(sample && SAMPLES[sample] ? sample : 'us');
  if (q.get('costs') === 'none') { $('ef-costs').value = ''; run(); }
  T.mountCodePanel($('ef-code'), SLUG);
}

init();
