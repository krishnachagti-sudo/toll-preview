// The payout reconciliation page. The split runs here, in the browser, with core.js (the same file
// the server runs): the file is read and every payout split without uploading anything. Only "Get the
// journal" sends the file to the server (Endwise.run, paid), which runs the same engine and returns
// the journals and the import, summary and line files. The made-up samples are core.js's own.
import { split, journals, journalOutput, money, longDate, BUCKETS, STANDARD_RATES, SAMPLES, LIMITS, LEDGER_NAMES, defaultAccounts } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'payout-reconciliation';
const $ = (id) => document.getElementById(id);
const SAMPLE_NAMES = { stripe: 'a made-up Stripe file of 2 payouts', shopify: 'a made-up Shopify Payments payout', paypal: 'a made-up PayPal Activity Download', square: 'a made-up Square payout', shopifyNegative: 'a made-up negative Shopify Payments payout' };
const ACCOUNT_KEYS = ['clearing', 'bank', 'sales', 'refunds', 'disputes', 'fees', 'taxOnFees', 'reserves', 'salesTax', 'adjustments'];
const ACCOUNT_WORDS = { clearing: 'Clearing account', bank: 'Bank account', sales: 'Sales', refunds: 'Refunds', disputes: 'Chargebacks', fees: 'Processing fees', taxOnFees: 'Tax on fees', reserves: 'Reserves', salesTax: 'Sales tax', adjustments: 'Other adjustments' };

const state = { text: SAMPLES.stripe, name: 'sample', sample: 'stripe', result: null };

function opts() {
  const processor = $('pr-processor').value || undefined;
  const o = { processor, ledger: $('pr-ledger').value, rate: $('pr-rate').value || undefined, transfer: $('pr-transfer').checked, accounts: accounts() };
  if (processor === 'custom') {
    const columns = {};
    for (const k of ['gross', 'fee', 'net', 'type', 'date', 'payout']) { const v = $(`pr-c-${k}`).value.trim(); if (v) columns[k] = v; }
    if ($('pr-c-neg').checked) columns.feeSign = 'negative';
    o.columns = columns;
  }
  return o;
}

function accounts() {
  const out = {};
  for (const k of ACCOUNT_KEYS) { const el = $(`pr-a-${k}`); if (el && el.value.trim()) out[k] = el.value.trim(); }
  return out;
}

function accountFields(processor) {
  const box = $('pr-accounts');
  const had = accounts();
  box.textContent = '';
  const defs = defaultAccounts(processor ?? 'custom');
  for (const k of ACCOUNT_KEYS) {
    const input = h('input', { id: `pr-a-${k}`, type: 'text', placeholder: defs[k], value: had[k] ?? '' });
    box.append(h('label', null, [ACCOUNT_WORDS[k], ' ', input]));
  }
}

// ---------- showing the split ----------

const cell = (v, c) => (v ? money(v, c) : '');
function groupTable(r) {
  const used = BUCKETS.filter((b) => r.groups.some((g) => g.totals[b.id]));
  return h('div', { class: 'table-scroll' }, [h('table', { class: 'pr-table' }, [
    h('thead', null, [h('tr', null, ['Payout', 'Date', ...used.map((b) => b.label), 'Net', 'Deposit', 'Gap'].map((x) => h('th', { scope: 'col' }, x)))]),
    h('tbody', null, r.groups.map((g) => h('tr', { class: g.difference ? 'pr-off' : '' }, [
      h('th', { scope: 'row' }, g.kind === 'pending' ? 'Pending' : g.kind === 'balance' ? `${r.processorName} ${g.currency}` : g.id),
      h('td', null, g.date ?? ''),
      ...used.map((b) => h('td', { class: 'num' }, cell(g.totals[b.id], g.currency))),
      h('td', { class: 'num' }, money(g.net, g.currency)),
      h('td', { class: 'num' }, g.kind === 'balance' ? `${money(g.withdrawals, g.currency)} withdrawn` : g.deposit === null ? 'not in the file' : money(g.deposit, g.currency)),
      h('td', { class: 'num' }, g.difference === null ? '' : g.difference === 0 ? 'ties' : money(g.difference, g.currency)),
    ]))),
  ])]);
}

function feeTable(r) {
  if (!r.feeCheck?.length) return null;
  return h('div', null, [
    h('h2', { class: 'pr-h' }, `Fees on sales against ${r.rate.label} (${r.rate.bps / 100}% + ${r.rate.fixed}¢ a payment)`),
    h('div', { class: 'table-scroll' }, [h('table', { class: 'pr-table' }, [
      h('thead', null, [h('tr', null, ['Payout', 'Payments', 'Charged', 'At the published rate', 'Difference'].map((x) => h('th', { scope: 'col' }, x)))]),
      h('tbody', null, r.feeCheck.map((f) => h('tr', null, [h('th', { scope: 'row' }, f.id), h('td', { class: 'num' }, String(f.payments)), h('td', { class: 'num' }, money(f.charged, f.currency)), h('td', { class: 'num' }, money(f.expected, f.currency)), h('td', { class: 'num' }, money(f.over, f.currency))]))),
    ])]),
    h('p', { class: 'muted' }, 'Each payment at the rate, rounded to the cent. Your contract, card mix or international cards can make the real fee differ.'),
  ]);
}

function journalBlock(js, ledger) {
  return h('div', null, [
    h('h2', { class: 'pr-h' }, `The journal for ${LEDGER_NAMES[ledger]}`),
    ...js.slice(0, 6).map((j) => h('div', { class: 'table-scroll' }, [h('table', { class: 'pr-table pr-journal' }, [
      h('caption', null, `${j.memo}, ${longDate(j.date)}`),
      h('thead', null, [h('tr', null, ['Account', 'Debit', 'Credit'].map((x) => h('th', { scope: 'col' }, x)))]),
      h('tbody', null, [...j.lines.map((l) => h('tr', null, [h('th', { scope: 'row' }, l.account), h('td', { class: 'num' }, l.debit ? money(l.debit, j.currency) : ''), h('td', { class: 'num' }, l.credit ? money(l.credit, j.currency) : '')])),
        h('tr', { class: 'pr-total' }, [h('th', { scope: 'row' }, 'Total'), h('td', { class: 'num' }, money(j.debits, j.currency)), h('td', { class: 'num' }, money(j.credits, j.currency))])]),
    ])])),
    js.length > 6 ? h('p', { class: 'muted' }, `And ${js.length - 6} more in the file.`) : null,
  ]);
}

// The result like the other tool pages: a header row with the Example tag, the inputs in one line,
// the money paid out as the big figure, then one line per figure (each kind of activity with the
// account it books to, the fee check, the payouts), and the tables and the journal folded under it.
function show(r, label, sampleJournal) {
  state.result = r;
  const out = $('pr-out');
  out.textContent = '';
  const example = Boolean(state.sample);
  const cur = r.groups[0]?.currency ?? 'USD';
  const one = r.groups.every((g) => g.currency === cur);
  const sum = (f) => r.groups.reduce((a, g) => a + (f(g) || 0), 0);
  const item = (k, what, amount, why, cls = null) => h('li', { class: cls }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), amount ? h('b', {}, amount) : null, h('em', {}, why)]);
  const n = r.groups.length;
  const items = one ? BUCKETS.filter((b) => sum((g) => g.totals[b.id])).map((b) => {
    const v = sum((g) => g.totals[b.id]);
    return item(v < 0 ? '-' : '+', b.label, money(v, cur), b.account ? `booked to ${b.account}, from the file's own labels` : 'moved to or from your bank, not booked', null);
  }) : [];
  const fees = r.feeCheck?.length ? r.feeCheck : null;
  const over = fees ? fees.reduce((a, f) => a + f.over, 0) : 0;
  out.append(...[
    h('div', { class: 'tf-rh' }, [h('span', { class: example ? 'tf-tag' : 'tf-tag run' }, example ? 'Example' : 'Your result'), h('span', { class: 'tf-src' }, `${r.processorName} · split, free`)]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${label}${r.rate ? `, fees checked against ${r.rate.bps / 100}% + ${r.rate.fixed}¢` : ''}` : label),
    one ? h('p', { class: 'tf-big' }, [h('b', {}, money(sum((g) => g.net), cur)), h('span', {}, `paid out in ${n} ${n === 1 ? 'payout' : 'payouts'}`)]) : null,
    h('p', { class: 'tf-sub pr-answer' }, r.answer),
    h('ul', { class: 'tf-items' }, [
      ...items,
      fees ? item('%', `Fees on sales against ${r.rate.label}`, over ? money(over, cur) : 'match', over ? 'charged above the published rate, payment by payment' : 'each payment at the published rate, rounded to the cent', over ? 'sk' : 'hi') : null,
      one ? item('=', 'Paid out', money(sum((g) => g.net), cur), r.groups.some((g) => g.difference) ? 'a payout does not tie to its deposit: see the gap below' : `${n} ${n === 1 ? 'payout' : 'payouts'}; every row's gross less fee equals its net`, 'tot') : null,
    ]),
    ...r.warnings.map((w) => h('p', { class: 'pr-warn' }, w)),
    r.skipped.length ? h('p', { class: 'tf-note' }, `${r.skipped.length} row${r.skipped.length === 1 ? '' : 's'} left out: ${r.skipped.slice(0, 5).map((s) => `line ${s.line} (${s.reason})`).join(', ')}.`) : null,
    h('details', { class: 'xpand' }, [h('summary', {}, `Each payout, split (${n})`), h('div', { class: 'xp-in' }, [groupTable(r), feeTable(r)])]),
    sampleJournal ? h('details', { class: 'xpand' }, [h('summary', {}, `The journal for ${LEDGER_NAMES[$('pr-ledger').value]}`), h('div', { class: 'xp-in' }, journalBlock(sampleJournal, $('pr-ledger').value))]) : null,
    h('p', { class: 'tf-cost' }, 'Split in your browser, free. Nothing is uploaded until you ask for the journal.'),
  ].filter(Boolean));
}

function run() {
  $('pr-error').textContent = '';
  try {
    const o = opts();
    const r = split(state.text, o);
    const label = state.sample ? SAMPLE_NAMES[state.sample] : state.name;
    show(r, label, state.sample ? journals(r, { accounts: o.accounts, transfer: o.transfer }) : null);
    accountFields(r.processor);
    $('pr-go').disabled = Boolean(state.sample);
    const n = r.groups.length;
    const price = Math.max(0.5, n * 0.1);
    $('pr-go').textContent = state.sample ? 'Choose your own file for its journal' : `Get the journal and import file ($${price.toFixed(2)})`;
    $('pr-go-note').textContent = state.sample ? 'The sample\'s journal is shown with the split. Choose your own file to split it, free.' : `${n} ${n === 1 ? 'payout' : 'payouts'} at $0.10 each, at least $0.50 a file. The same file again within 7 days is free.`;
    $('pr-status').textContent = r.answer;
  } catch (e) {
    $('pr-error').textContent = e.message;
    $('pr-out').textContent = '';
    $('pr-go').disabled = true;
  }
}

async function load(file) {
  if (file.size > LIMITS.bytes) { $('pr-error').textContent = 'The file is over 5 MB; split it by month.'; return; }
  state.text = await file.text();
  state.name = file.name;
  state.sample = null;
  $('pr-file-name').textContent = `${file.name}, ${file.size.toLocaleString('en-US')} bytes. Read in your browser; nothing is uploaded.`;
  run();
}

function loadSample(key) {
  state.text = SAMPLES[key];
  state.name = 'sample';
  state.sample = key;
  $('pr-processor').value = '';
  run();
}

const link = (name, text, label) => h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/csv' })), download: name, class: 'btn btn-small' }, label);

async function buy() {
  if (state.sample) return;
  $('pr-error').textContent = '';
  $('pr-go').disabled = true;
  $('pr-status').textContent = 'Building the journal.';
  try {
    const o = opts();
    const body = { op: 'journal', text: state.text, ledger: o.ledger, transfer: o.transfer };
    for (const k of ['processor', 'rate', 'columns']) if (o[k]) body[k] = o[k];
    if (Object.keys(o.accounts).length) body.accounts = o.accounts;
    const res = await T.run(SLUG, body);
    const r = res.result;
    const local = journalOutput(state.text, o);
    show(split(state.text, o), state.name, local.journals);
    const amount = res.charged?.amount ?? 0;
    $('pr-out').prepend(h('div', { class: 'pr-done' }, [
      h('p', { class: 'pr-downloads' }, [link(r.files.import.name, r.files.import.text, `${LEDGER_NAMES[r.ledger]} import file`), link(r.files.summary.name, r.files.summary.text, 'Summary by payout'), link(r.files.detail.name, r.files.detail.text, 'Every line')]),
      h('p', { class: 'muted' }, `${amount > 0 ? `Charged $${(amount / 1e6).toFixed(2)}.` : 'No charge for this one.'} ${r.ledger === 'xero' ? 'In Xero, paste the lines into the manual journal import template: debits are positive, credits negative.' : 'In QuickBooks Online: Settings, Import Data, Journal Entries, then map the headings.'}`),
    ]));
  } catch (e) {
    $('pr-error').textContent = e.status === 401 ? 'Sign in to get the journal. The split above stays free.' : e.message;
  } finally {
    $('pr-go').disabled = false;
    $('pr-status').textContent = '';
  }
}

function init() {
  const rate = $('pr-rate');
  for (const [id, r] of Object.entries(STANDARD_RATES)) rate.append(h('option', { value: id }, `${r.label}: ${r.bps / 100}% + ${r.fixed}¢`));
  const q = new URLSearchParams(location.search);
  if (q.get('ledger') && LEDGER_NAMES[q.get('ledger')]) $('pr-ledger').value = q.get('ledger');
  if (q.get('rate') && STANDARD_RATES[q.get('rate')]) rate.value = q.get('rate');
  const sample = q.get('sample');
  $('pr-file').addEventListener('change', (e) => { if (e.target.files[0]) load(e.target.files[0]); });
  const drop = $('pr-drop');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });
  for (const b of document.querySelectorAll('[data-sample]')) b.addEventListener('click', () => loadSample(b.dataset.sample));
  for (const id of ['pr-processor', 'pr-ledger', 'pr-rate', 'pr-transfer']) $(id).addEventListener('change', () => { $('pr-custom').hidden = $('pr-processor').value !== 'custom'; run(); });
  for (const k of ['gross', 'fee', 'net', 'type', 'date', 'payout']) $(`pr-c-${k}`).addEventListener('change', run);
  $('pr-c-neg').addEventListener('change', run);
  $('pr-accounts').addEventListener('change', run);
  $('pr-go').addEventListener('click', buy);
  accountFields('stripe');
  loadSample(sample && SAMPLES[sample] ? sample : 'stripe');
  T.mountCodePanel($('pr-code'), SLUG);
}

init();
