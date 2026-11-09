// The refunded-but-never-returned page. The check runs here, in the browser, with core.js (the same
// file the server runs): the three reports are read and joined without uploading anything. Only "Get
// the order list" sends them to the server (Endwise.run, paid per order found), which runs the same
// engine and returns every order, the case text and the CSV. The sample is core.js's.
import { audit, windowOf, caseText, money, longDate, isDay, STATUSES, OWED, SAMPLE, SAMPLE_AS_OF, LIMITS, WINDOWS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'fba-refund-not-returned';
const REPORTS = ['refunds', 'returns', 'reimbursements'];
const $ = (id) => document.getElementById(id);
const state = { sample: true, text: { ...SAMPLE }, name: {} };
const PER_ORDER = 0.25;
const CAP = 9.99;

function opts() {
  const o = { marketplace: $('rn-market').value, asOf: $('rn-asof').value || SAMPLE_AS_OF, dateOrder: $('rn-dates').value };
  const open = $('rn-open').value.trim();
  const close = $('rn-close').value.trim();
  if (open || close) {
    const base = WINDOWS[o.marketplace];
    o.window = { open: open ? Number(open) : base.open, close: close ? Number(close) : base.close };
  }
  const cols = $('rn-columns').value.trim();
  if (cols) {
    try { o.columns = JSON.parse(cols); } catch { throw new Error('The column map is not valid JSON, e.g. {"refunds": {"orderId": "Order Number"}}.'); }
  }
  return o;
}

// ---------- showing the result ----------

// The totals, one line per status: how many orders, what they were refunded, and where it comes from.
const SOURCE = {
  claim: 'refunds with no return or reimbursement, window open today',
  wait: 'window not open yet',
  'open-ended': 'no closing day on Amazon\'s page',
  expired: 'window closed',
  'paid-less': 'gap below the refund, Reimbursements report',
  reimbursed: 'Reimbursements report',
  returned: 'FBA Customer Returns report',
  'not-eligible': 'customer damaged or defective, Returns report',
};
function totalsList(r) {
  const rows = Object.entries(r.totals).filter(([, v]) => v.orders);
  return h('ul', { class: 'tf-items' }, rows.map(([k, v]) => h('li', k === 'claim' ? { class: 'key' } : {}, [
    h('span', null, `${STATUSES[k]}: ${v.orders} ${v.orders === 1 ? 'order' : 'orders'}`),
    h('b', null, v.value ? money(v.value, r.currency) : '-'),
    h('small', null, SOURCE[k] ?? ''),
  ])));
}
function bigLine(r) {
  const c = r.totals.claim ?? { orders: 0, value: 0 };
  return h('p', { class: 'tf-big' }, [`${c.orders} to claim today`, h('small', null, `${money(c.value, r.currency)} refunded; days ${r.rule.open} to ${r.rule.close ?? 'open'} after the refund (${r.rule.name}${r.rule.yours ? ', your window' : ''})`)]);
}

function ordersTable(r) {
  return h('div', { class: 'table-scroll' }, [h('table', { class: 'rn-table' }, [
    h('caption', null, 'Every refunded FBA order'),
    h('thead', null, [h('tr', null, ['Order', 'Refunded', 'Units back / paid', 'Refund', 'Paid', 'Status', 'Claim window', 'Why'].map((x) => h('th', { scope: 'col' }, x)))]),
    h('tbody', null, r.orders.map((o) => h('tr', { class: o.status === 'claim' ? 'rn-claim' : '' }, [
      h('th', { scope: 'row' }, o.orderId),
      h('td', null, o.refundDate),
      h('td', { class: 'num' }, `${o.returnedUnits} / ${o.reimbursedUnits} of ${o.refundedUnits}`),
      h('td', { class: 'num' }, money(o.refundAmount, r.currency)),
      h('td', { class: 'num' }, o.reimbursedCash ? money(o.reimbursedCash, r.currency) : ''),
      h('td', null, STATUSES[o.status]),
      h('td', null, OWED.includes(o.status) || o.status === 'expired' ? `${o.opens} to ${o.closes ?? 'open'}` : ''),
      h('td', { class: 'rn-note' }, o.note),
    ]))),
  ])]);
}

function casesBlock(r) {
  const cases = r.orders.map((o) => ({ o, text: caseText(o, r) })).filter((c) => c.text);
  if (!cases.length) return null;
  return h('div', { class: 'rn-cases' }, [
    h('h2', { class: 'rn-h' }, `Case text (${cases.length})`),
    ...cases.map(({ o, text }) => {
      const pre = h('pre', null, text);
      const status = h('span', { class: 'muted' }, '');
      const btn = h('button', { type: 'button', class: 'link-btn' }, 'Copy');
      btn.addEventListener('click', () => T.copy(text, btn, status));
      return h('details', null, [h('summary', null, `${o.orderId}: ${o.status === 'paid-less' ? 'valuation dispute' : 'customer return claim'}`), pre, btn, ' ', status]);
    }),
  ]);
}

function show(r, label, full) {
  const out = $('rn-out');
  out.textContent = '';
  out.append(...[
    h('div', { class: 'tf-res-h' }, [full ? h('span', { class: 'ex-tag' }, 'Example') : null, h('p', { class: 'rn-label' }, label)].filter(Boolean)),
    full ? h('p', { class: 'tf-exin' }, `Example: a made-up US seller's refunds, returns and reimbursements, June 20 to October 1, 2026, checked ${longDate(r.asOf)}`) : null,
    bigLine(r),
    h('p', { class: 'rn-answer' }, r.answer),
    ...r.warnings.map((w) => h('p', { class: 'rn-warn' }, w)),
    r.skipped.notFba ? h('p', { class: 'muted' }, `${r.skipped.notFba} seller-fulfilled ${r.skipped.notFba === 1 ? 'refund was' : 'refunds were'} left out: only FBA refunds are reimbursed under this policy.`) : null,
    totalsList(r),
    full ? h('h2', { class: 'rn-h' }, 'The orders') : null,
    full ? ordersTable(r) : null,
    full ? casesBlock(r) : null,
  ].filter(Boolean));
}

const owedOf = (r) => r.orders.filter((o) => OWED.includes(o.status)).length;

function run() {
  $('rn-error').textContent = '';
  try {
    const o = opts();
    const r = audit({ ...state.text, ...o });
    show(r, state.sample ? `Sample: a made-up US seller, checked on ${longDate(o.asOf)}` : 'Your reports', state.sample);
    const n = owedOf(r);
    const price = Math.min(CAP, n * PER_ORDER);
    $('rn-go').disabled = state.sample;
    $('rn-go').textContent = state.sample ? 'Choose your own reports for their order list' : `Get the order list, case text and CSV ($${price.toFixed(2)})`;
    $('rn-go-note').textContent = state.sample ? 'The sample\'s order list and case text are shown. Choose your own reports to check them, free.'
      : `${n} ${n === 1 ? 'order' : 'orders'} found still owed, at $0.25 each; nothing for the rest. At most $9.99 a month.`;
    $('rn-status').textContent = r.answer;
  } catch (e) {
    $('rn-error').textContent = e.message;
    $('rn-out').textContent = '';
    $('rn-go').disabled = true;
  }
}

async function load(report, file) {
  if (file.size > LIMITS.bytes) { $('rn-error').textContent = `The ${report} file is over 5 MB; use a shorter date range.`; return; }
  if (state.sample) { state.text = { refunds: '', returns: '', reimbursements: '' }; state.sample = false; }
  state.text[report] = await file.text();
  state.name[report] = file.name;
  $(`rn-${report}-name`).textContent = `${file.name}, ${file.size.toLocaleString('en-US')} bytes. Read in your browser; nothing is uploaded.`;
  document.querySelector(`[data-report="${report}"]`).classList.add('loaded');
  if (state.text.refunds) run();
  else { $('rn-out').textContent = ''; $('rn-out').append(h('p', { class: 'muted' }, 'Add the refunds file to check.')); $('rn-go').disabled = true; }
}

function loadSample() {
  state.sample = true;
  state.text = { ...SAMPLE };
  for (const k of REPORTS) { $(`rn-${k}`).value = ''; document.querySelector(`[data-report="${k}"]`).classList.remove('loaded'); }
  run();
}

const link = (name, text, label) => h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/csv' })), download: name, class: 'btn btn-small' }, label);

async function buy() {
  if (state.sample) return;
  $('rn-error').textContent = '';
  $('rn-go').disabled = true;
  $('rn-status').textContent = 'Building the order list.';
  try {
    const o = opts();
    const body = { op: 'audit', refunds: state.text.refunds, marketplace: o.marketplace, asOf: o.asOf, dateOrder: o.dateOrder };
    if (state.text.returns) body.returns = state.text.returns;
    if (state.text.reimbursements) body.reimbursements = state.text.reimbursements;
    if (o.window) body.window = o.window;
    if (o.columns) body.columns = o.columns;
    const res = await T.run(SLUG, body);
    const local = audit({ ...state.text, ...o });
    show(local, 'Your reports', true);
    const amount = res.charged?.amount ?? 0;
    $('rn-out').prepend(h('div', { class: 'rn-done' }, [
      h('p', { class: 'rn-downloads' }, [link(res.result.files.orders.name, res.result.files.orders.text, 'Every order (CSV)'), link(`case-text-${o.asOf}.txt`, res.result.cases.map((c) => c.text).join('\n\n----\n\n'), 'All case text')]),
      h('p', { class: 'muted' }, `${amount > 0 ? `Charged $${(amount / 1e6).toFixed(2)}.` : 'No charge for this one.'} File one order at a time, inside its window, after checking the Eligible for claim tab of the Inventory Defect and Reimbursement portal.`),
    ]));
  } catch (e) {
    $('rn-error').textContent = e.status === 401 ? 'Sign in to get the order list. The check above stays free.' : e.message;
  } finally {
    $('rn-go').disabled = false;
    $('rn-status').textContent = '';
  }
}

function oneDate() {
  const d = $('rn-one').value;
  const m = $('rn-one-market').value;
  if (!isDay(d)) { $('rn-one-out').textContent = 'Pick a refund date.'; return; }
  const today = new Date().toISOString().slice(0, 10);
  const w = windowOf(d, { marketplace: m, asOf: today });
  $('rn-one-out').textContent = `A refund made on ${longDate(d)} can be claimed ${w.closes ? `from ${longDate(w.opens)} to ${longDate(w.closes)}` : `from ${longDate(w.opens)} (Amazon's page gives no last day)`} (days ${w.rule.open} to ${w.rule.close ?? 'open'} after the refund, Amazon's ${w.rule.name} help page). Today it is: ${STATUSES[w.status].toLowerCase()}.`;
}

function init() {
  const q = new URLSearchParams(location.search);
  const day = (v) => (isDay(v ?? '') ? v : '');
  if (WINDOWS[q.get('marketplace')]) { $('rn-market').value = q.get('marketplace'); $('rn-one-market').value = q.get('marketplace'); }
  $('rn-asof').value = day(q.get('asOf')) || SAMPLE_AS_OF;
  if (day(q.get('refundDate'))) $('rn-one').value = q.get('refundDate');
  if (/^\d{1,4}$/.test(q.get('open') ?? '')) $('rn-open').value = q.get('open');
  if (/^\d{1,4}$/.test(q.get('close') ?? '')) $('rn-close').value = q.get('close');
  for (const k of REPORTS) {
    $(`rn-${k}`).addEventListener('change', (e) => { if (e.target.files[0]) load(k, e.target.files[0]); });
    const drop = document.querySelector(`[data-report="${k}"]`);
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files[0]) load(k, e.dataTransfer.files[0]); });
  }
  $('rn-sample').addEventListener('click', loadSample);
  for (const id of ['rn-market', 'rn-asof', 'rn-open', 'rn-close', 'rn-dates', 'rn-columns']) $(id).addEventListener('change', run);
  $('rn-go').addEventListener('click', buy);
  for (const id of ['rn-one', 'rn-one-market']) $(id).addEventListener('change', oneDate);
  run();
  oneDate();
  if (q.get('refundDate')) document.getElementById('rn-window-title').scrollIntoView();
  T.mountCodePanel($('rn-code'), SLUG);
}

init();
