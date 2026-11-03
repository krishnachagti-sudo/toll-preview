// The MACRS schedule page. Nothing is worked out in this browser: the 40% test (a cheap run, free
// for a few runs a day before sign-in) and the schedule (paid once per entity and tax year) both go
// through Toll.run, so the page shows exactly what the API returns. The asset list is kept in this
// browser (localStorage) between visits.
import { CLASS_KEYS, money } from './core.js';

const T = window.Toll;
const h = T.h;
const SLUG = 'macrs-depreciation';
const STORE_KEY = 'macrs-depreciation.v1';
const $ = (id) => document.getElementById(id);

let pendingQuote = null;

const CLASS_WORDS = { qip: 'QIP', 27.5: '27.5-yr', 39: '39-yr' };
const classWord = (k) => CLASS_WORDS[k] ?? `${k}-yr`;

// The example at rest: the made-up client in the tool's schedule example, as the CSV template.
const EXAMPLE = {
  entity: '',
  year: '2026',
  csv: [
    'id,description,cost,acquired,placed_in_service,class,business_use_pct,section_179,vehicle,disposed_same_year',
    'A-101,CNC router,84000,2026-01-20,2026-02-09,7,,,,',
    'A-102,Laptops (6),9600,2026-04-01,2026-04-14,5,,,,',
    'A-103,"Pickup over 6,000 lb, 6 ft bed",58000,2026-06-05,2026-06-20,5,90,,heavy-truck,',
    'A-104,"SUV over 6,000 lb",71000,2026-08-01,2026-08-11,5,80,32000,heavy-suv,',
    'A-105,Office interior fit-out,46000,2026-07-15,2026-10-28,qip,,,,',
    'A-106,Packing table,3400,,2026-12-02,7,,,,',
    'A-107,Warehouse building (no land),410000,,2026-05-18,39,,,,',
  ].join('\n'),
  electOut: ['7'],
  income: '250000',
};

const dollars = (n) => money(Math.round(n * 100));
const num = (id) => { const v = $(id).value.trim(); return v === '' ? undefined : Number(v); };

function table(columns, rows, foot) {
  return h('div', { class: 'table-scroll' }, h('table', { class: 'rules md-table' }, [
    h('thead', {}, h('tr', {}, columns.map((c) => h('th', { scope: 'col', class: c.num ? 'r num' : null }, c.label)))),
    h('tbody', {}, rows.map((r) => h('tr', { class: r.muted ? 'md-left-out' : null }, r.cells.map((v, i) => (i === 0 ? h('th', { scope: 'row' }, v) : h('td', { class: columns[i].num ? 'r num' : null }, v)))))),
    foot ? h('tfoot', {}, h('tr', {}, foot.map((v, i) => (i === 0 ? h('th', { scope: 'row' }, v) : h('td', { class: columns[i].num ? 'r num' : null }, v))))) : null,
  ]));
}

function readForm(op) {
  const csv = $('md-csv').value.trim();
  if (!csv) return { error: 'Paste the assets, header row first.', field: 'md-csv-err' };
  const input = { op, taxYear: Number($('md-year').value), csv };
  const entity = $('md-entity').value.trim();
  if (entity) input.entity = entity;
  const out = [...document.querySelectorAll('#md-electout input:checked')].map((x) => x.value);
  if (out.length) input.bonusElectOut = out;
  if (input.taxYear === 2025 && $('md-40').checked) input.elect40Percent = true;
  const income = num('md-income');
  if (income !== undefined) input.businessIncome = income;
  const cost = num('md-s179cost');
  if (cost !== undefined) input.section179PropertyCost = cost;
  return { input };
}

function clearErrors() {
  for (const id of ['md-error', 'md-csv-err', 'md-entity-err']) $(id).textContent = '';
}

function showError(e) {
  const fields = e.fields ? Object.values(e.fields) : [];
  $('md-error').textContent = fields[0] ?? e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') $('md-error').append(' ', h('a', { href: `${T.base}/account` }, 'Sign in or create an account'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') $('md-error').append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

// The verdict, the worksheet and year 1: what the test returns, and the top of a schedule.
function renderTest(r, box) {
  const t = r.test;
  box.append(
    h('p', { class: 'md-label' }, `Tax year ${r.taxYear}`),
    h('p', { class: 'md-answer' }, [t.convention === 'MQ' ? 'Mid-quarter' : 'Half-year', h('small', {}, t.arithmetic)]),
    h('dl', { class: 'md-facts' }, [
      h('div', {}, [h('dt', {}, 'Year 1 total'), h('dd', {}, dollars(r.year1.total))]),
      h('div', {}, [h('dt', {}, 'Section 179'), h('dd', {}, dollars(r.year1.section179))]),
      h('div', {}, [h('dt', {}, 'Special allowance'), h('dd', {}, dollars(r.year1.bonus))]),
      h('div', {}, [h('dt', {}, 'MACRS'), h('dd', {}, dollars(r.year1.macrs))]),
    ]),
    h('p', { class: 'md-heading' }, 'The 40% worksheet'),
    table(
      [{ label: 'Asset' }, { label: 'Placed in service' }, { label: 'Class' }, { label: 'Basis for the test', num: true }, { label: 'Counted' }],
      t.worksheet.map((w) => ({ muted: !w.included, cells: [w.description ? `${w.id} ${w.description}` : w.id, `${w.placedInService} (Q${w.quarter})`, classWord(w.class), dollars(w.testBasis), w.reason] })),
      ['Last 3 months / year', '', '', `${dollars(t.q4Basis)} / ${dollars(t.totalBasis)}`, t.shareText],
    ),
    h('p', { class: 'md-aside' }, `${t.rule} Section 179 for the year: ${dollars(r.section179.elected)} elected of a ${dollars(r.section179.dollarLimit)} limit.`),
  );
  if (r.warnings.length) box.append(h('ul', { class: 'md-warn' }, r.warnings.map((w) => h('li', {}, w.text))));
}

function renderSchedule(r, box) {
  box.append(
    h('p', { class: 'md-heading' }, 'Each asset'),
    table(
      [{ label: 'Asset' }, { label: 'Table' }, { label: 'Section 179', num: true }, { label: 'Special allowance', num: true }, { label: 'MACRS year 1', num: true }, { label: 'Year 1', num: true }],
      r.assets.map((a) => ({ cells: [a.description ? `${a.id} ${a.description}` : a.id, a.table ? `${a.table.label}: ${a.years[0].pct}%` : 'none', dollars(a.section179), `${dollars(a.bonus)}${a.bonusRate ? ` (${a.bonusRate}%)` : ''}`, dollars(a.years[0]?.amount ?? 0), dollars(a.year1Total)] })),
    ),
    h('p', { class: 'md-heading' }, 'By year'),
    table(
      [{ label: 'Tax year' }, { label: 'Section 179', num: true }, { label: 'Special allowance', num: true }, { label: 'MACRS', num: true }, { label: 'Total', num: true }],
      r.totalsByYear.map((y) => ({ cells: [String(y.year), dollars(y.section179), dollars(y.bonus), dollars(y.macrs), dollars(y.total)] })),
    ),
  );
}

const fileLink = (f, label) => h('a', { href: URL.createObjectURL(new Blob([f.text], { type: f.contentType })), download: f.name, class: 'btn btn-small' }, label);
const downloads = (files, quiet) => h('p', { class: 'md-downloads' }, [
  fileLink(files.schedule, quiet ? 'Sample schedule (CSV)' : 'Download the schedule (CSV)'), ' ',
  fileLink(files.journal, quiet ? 'Sample journal entry (CSV)' : 'Journal entry (CSV)'), ' ',
  fileLink(files.journalQbo, quiet ? 'Sample QuickBooks journal (CSV)' : 'QuickBooks Online journal (CSV)'),
]);

async function runTest() {
  clearErrors();
  const read = readForm('mid-quarter-test');
  if (read.error) { $(read.field).textContent = read.error; return; }
  save();
  const button = $('md-test');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, read.input);
    const box = $('md-out');
    box.textContent = '';
    renderTest(json.result, box);
    if (json.charged) box.append(h('p', { class: 'md-aside' }, `Charged ${json.charged.display}.`));
    $('md-status').textContent = json.result.answer;
  } catch (e) {
    showError(e);
  } finally {
    button.disabled = false;
  }
}

async function getSchedule() {
  clearErrors();
  const read = readForm('schedule');
  if (read.error) { $(read.field).textContent = read.error; return; }
  if (!read.input.entity) {
    $('md-entity-err').textContent = 'Name the client or entity: the schedule is priced once per entity and tax year.';
    $('md-entity').focus();
    return;
  }
  save();
  const key = JSON.stringify(read.input);
  const button = $('md-get');
  button.disabled = true;
  try {
    const account = await T.me().catch(() => null);
    if (!account) {
      showError({ message: T.prices('The schedule is $2.00 per entity and tax year, taken from a prepaid balance.'), code: 'unauthorized' });
      return;
    }
    if (!pendingQuote || pendingQuote.key !== key) {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: read.input })).quote;
      pendingQuote = { key, q };
      button.textContent = q.amount ? `Pay ${q.display} and get the schedule` : 'Get the schedule (no charge)';
      $('md-get-note').textContent = q.detail ?? '';
      return;
    }
    const json = await T.run(SLUG, read.input);
    const box = $('md-out');
    box.textContent = '';
    renderTest(json.result, box);
    renderSchedule(json.result, box);
    box.append(downloads(json.result.files, false), h('p', { class: 'md-aside' }, `${json.result.journal.note} ${json.charged ? `Charged ${json.charged.display}.` : ''}`));
    pendingQuote = null;
    button.textContent = 'Get the schedule (CSV and journal entry)';
    $('md-get-note').textContent = 'Running the same entity and year again with edits within 30 days is free.';
  } catch (e) {
    showError(e);
  } finally {
    button.disabled = false;
  }
}

// ---------- saved list ----------

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      entity: $('md-entity').value, year: $('md-year').value, csv: $('md-csv').value,
      electOut: [...document.querySelectorAll('#md-electout input:checked')].map((x) => x.value),
      income: $('md-income').value, s179cost: $('md-s179cost').value, e40: $('md-40').checked,
    }));
  } catch { /* storage may be off */ }
}
function loadSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null');
    return s && typeof s === 'object' ? s : null;
  } catch {
    return null;
  }
}
function apply(s) {
  $('md-entity').value = s.entity ?? '';
  $('md-year').value = s.year === '2025' ? '2025' : '2026';
  $('md-csv').value = s.csv ?? '';
  for (const x of document.querySelectorAll('#md-electout input')) x.checked = (s.electOut ?? []).includes(x.value);
  $('md-income').value = s.income ?? '';
  $('md-s179cost').value = s.s179cost ?? '';
  $('md-40').checked = !!s.e40;
}
const sync40 = () => { $('md-40-row').hidden = $('md-year').value !== '2025'; };

// ---------- settings from the address ----------

// A link may carry settings for the sample assets (?year=2026&electout=7&income=250000, as the home
// page's mockup sends them): the form opens with the sample's list and these settings, ready to
// run. Anything unusable is ignored.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (!['year', 'electout', 'income'].some((k) => q.has(k))) return null;
  const s = { ...EXAMPLE };
  if (q.get('year') === '2025' || q.get('year') === '2026') s.year = q.get('year');
  if (q.has('electout')) s.electOut = q.get('electout').split(',').filter((k) => CLASS_KEYS.includes(k));
  const income = (q.get('income') ?? '').trim();
  if (/^\d+(\.\d+)?$/.test(income)) s.income = income;
  return s;
}

// The sample files near the price: the tool's own schedule example for a made-up client.
async function sampleLinks() {
  const box = $('md-sample-links');
  try {
    const tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
    const ex = tool.examples.find((x) => x.input.op === 'schedule');
    if (!ex) return;
    box.textContent = '';
    box.append(downloads(ex.output.files, true));
  } catch {
    box.textContent = 'The sample files could not load.';
  }
}

function start() {
  const chip = document.querySelector('[data-toll-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('md-code'), SLUG);
  const el = $('md-electout');
  for (const k of CLASS_KEYS.filter((c) => c !== '27.5' && c !== '39')) {
    el.appendChild(h('label', { class: 'check' }, [h('input', { type: 'checkbox', value: k }), h('span', {}, classWord(k))]));
  }
  apply(fromQuery() ?? loadSaved() ?? EXAMPLE);
  sync40();
  $('md-year').addEventListener('change', sync40);
  $('md-form').addEventListener('input', () => { pendingQuote = null; $('md-get').textContent = 'Get the schedule (CSV and journal entry)'; });
  $('md-form').addEventListener('submit', (ev) => ev.preventDefault());
  $('md-test').addEventListener('click', runTest);
  $('md-get').addEventListener('click', getSchedule);
  sampleLinks();
}

start();
