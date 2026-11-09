// The Amazon settlement reconciliation page. The check runs here, in the browser, with core.js (the
// same file the server runs): the report is read, proved, tied and split without uploading anything.
// Only "Get the journals" sends the report to the server (Endwise.run, paid), which runs the same
// engine and returns the journals and the import, summary and line files. The samples are core.js's.
import { check, reconcile, groupsOf, money, longDate, BUCKETS, BUCKET_IDS, SAMPLES, SAMPLE_BANK, LIMITS, LEDGER_NAMES, defaultAccounts, isZone } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'amazon-settlement-reconciliation';
const $ = (id) => document.getElementById(id);
const SAMPLE_NAMES = { us: 'a made-up US settlement', eu: 'a made-up German settlement', negative: 'a made-up negative settlement' };
const LABEL = Object.fromEntries(BUCKETS.map((b) => [b.id, b.label]));
const ACCOUNT_KEYS = ['clearing', 'bank', ...BUCKET_IDS];
const ACCOUNT_WORDS = { clearing: 'Clearing account', bank: 'Bank account', ...LABEL };

const state = { text: SAMPLES.us, name: 'sample', sample: 'us', map: {} };

function opts() {
  const o = {
    ledger: $('as-ledger').value, feesAs: $('as-fees').value, transfer: $('as-transfer').checked, accounts: accounts(), map: { ...state.map },
  };
  const deposits = $('as-deposits').value.split(/\n/).map((x) => x.trim()).filter(Boolean);
  if (deposits.length) o.deposits = deposits;
  if ($('as-bankdate').value) o.bankDate = $('as-bankdate').value;
  if ($('as-cutoff').value) o.cutoff = $('as-cutoff').value;
  const zone = $('as-zone').value.trim();
  if (zone) {
    if (!isZone(zone)) throw new Error(`"${zone}" is not a time zone this browser knows; use one like America/Los_Angeles.`);
    o.timeZone = zone;
  }
  return o;
}

function accounts() {
  const out = {};
  for (const k of ACCOUNT_KEYS) { const el = $(`as-a-${k}`); if (el && el.value.trim()) out[k] = el.value.trim(); }
  return out;
}

function accountFields() {
  const box = $('as-accounts');
  const had = accounts();
  box.textContent = '';
  const defs = defaultAccounts($('as-fees').value);
  for (const k of ACCOUNT_KEYS) {
    const input = h('input', { id: `as-a-${k}`, type: 'text', placeholder: defs[k], value: had[k] ?? '' });
    box.append(h('label', null, [ACCOUNT_WORDS[k], ' ', input]));
  }
}

// ---------- showing the result ----------

const STATUS = { pass: 'Pass', check: 'Check', 'n/a': 'Not checked' };

function periodTable(s, full) {
  const used = full ? BUCKETS.filter((b) => s.parts.some((p) => p.totals[b.id])) : [];
  return h('div', { class: 'table-scroll' }, [h('table', { class: 'as-table' }, [
    h('caption', null, `Settlement ${s.id}${s.start ? `, ${longDate(s.start)} to ${longDate(s.end)}` : ''}`),
    h('thead', null, [h('tr', null, ['Period', 'Posted', 'Rows', ...used.map((b) => b.label), 'Net', 'Share', 'Journal date'].map((x) => h('th', { scope: 'col' }, x)))]),
    h('tbody', null, [
      ...s.parts.map((p) => h('tr', null, [
        h('th', { scope: 'row' }, p.label),
        h('td', null, p.from === p.to ? p.from : `${p.from} to ${p.to}`),
        h('td', { class: 'num' }, String(p.rows)),
        ...used.map((b) => h('td', { class: 'num' }, p.totals[b.id] ? money(p.totals[b.id], s.currency) : '')),
        h('td', { class: 'num' }, money(p.net, s.currency)),
        h('td', { class: 'num' }, p.percent === null ? '' : `${p.percent}%`),
        h('td', null, p.date ?? ''),
      ])),
      h('tr', { class: 'as-total' }, [h('th', { scope: 'row' }, 'Settlement'), h('td', null, ''), h('td', { class: 'num' }, String(s.rows)), ...used.map(() => h('td', null, '')), h('td', { class: 'num' }, money(s.sum, s.currency)), h('td', null, ''), h('td', null, s.total === null ? 'no total-amount' : s.proof === 'ties' ? 'ties to total-amount' : `total-amount ${money(s.total, s.currency)}`)]),
    ]),
  ])]);
}

function checklistBlock(s) {
  return h('ul', { class: 'as-checklist' }, s.checklist.map((c) => h('li', { class: `as-${c.status === 'n/a' ? 'na' : c.status}` }, [h('strong', null, `${STATUS[c.status]}: ${c.item}. `), c.detail])));
}

// Every value in the file with its line; a select moves it (the map), and the check runs again.
function valuesBlock(s, rows) {
  const values = groupsOf(rows.filter((r) => r.settlement === s.id));
  return h('details', { class: 'as-values' }, [
    h('summary', null, `Every amount-type and amount-description in settlement ${s.id} (${values.length}), and the line it is booked to`),
    h('div', { class: 'table-scroll' }, [h('table', { class: 'as-table' }, [
      h('thead', null, [h('tr', null, ['Transaction type', 'Amount type', 'Description', 'Rows', 'Total', 'Booked to'].map((x) => h('th', { scope: 'col' }, x)))]),
      h('tbody', null, values.map((v) => {
        const key = `${v.amountType}/${v.description}`;
        const select = h('select', { 'aria-label': `Line for ${key}` }, BUCKETS.map((b) => h('option', { value: b.id, ...(b.id === v.bucket ? { selected: 'selected' } : {}) }, b.label)));
        select.addEventListener('change', () => { state.map[key] = select.value; run(); });
        return h('tr', { class: v.bucket === 'other' ? 'as-off' : '' }, [h('td', null, v.type), h('td', null, v.amountType), h('td', null, v.description), h('td', { class: 'num' }, String(v.rows)), h('td', { class: 'num' }, money(v.total, s.currency)), h('td', null, [select, v.rule === 'yours' ? ' (yours)' : ''])]);
      })),
    ])]),
  ]);
}

function journalBlock(js, ledger) {
  return h('div', null, [
    h('h2', { class: 'as-h' }, `The journals for ${LEDGER_NAMES[ledger]}`),
    ...js.slice(0, 6).map((j) => h('div', { class: 'table-scroll' }, [h('table', { class: 'as-table as-journal' }, [
      h('caption', null, `${j.memo}, ${longDate(j.date)}`),
      h('thead', null, [h('tr', null, ['Account', 'Debit', 'Credit'].map((x) => h('th', { scope: 'col' }, x)))]),
      h('tbody', null, [...j.lines.map((l) => h('tr', null, [h('th', { scope: 'row' }, l.account), h('td', { class: 'num' }, l.debit ? money(l.debit, j.currency) : ''), h('td', { class: 'num' }, l.credit ? money(l.credit, j.currency) : '')])),
        h('tr', { class: 'as-total' }, [h('th', { scope: 'row' }, 'Total'), h('td', { class: 'num' }, money(j.debits, j.currency)), h('td', { class: 'num' }, money(j.credits, j.currency))])]),
    ])])),
    js.length > 6 ? h('p', { class: 'muted' }, `And ${js.length - 6} more in the file.`) : null,
  ]);
}

// One line per figure, each with where it comes from: the report's total, its rows, the bank, the months.
function itemsOf(s) {
  const m = (v) => money(v, s.currency);
  const items = [
    s.total === null ? null : ['Settlement total', m(s.total), 'total-amount in the report'],
    ['Rows add up to', m(s.sum), `${s.rows} rows, ${s.proof === 'ties' ? 'to the cent' : `${m(s.difference)} apart`}`],
    s.deposit ? ['Reached the bank', m(s.deposit.bank), `${s.deposit.lines.map(m).join(' + ')}, the deposits you gave${s.deposit.status === 'ties' ? ': ties' : ''}`] : null,
    ...s.parts.map((p) => [p.label, m(p.net), `${p.percent === null ? '' : `${p.percent}% `}by posted date${p.date ? `, journal dated ${p.date}` : ''}`]),
  ].filter(Boolean);
  return h('ol', { class: 'dz-items' }, items.map(([k, v, src], i) => h('li', { class: i === 2 && s.deposit ? 'tot' : '' }, [h('b', null, k), h('span', null, v), h('small', null, src)])));
}

function show(r, label, full) {
  const out = $('as-out');
  out.textContent = '';
  const head = state.sample
    ? [h('div', { class: 'dz-rh' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', { class: 'dz-wx' }, 'Worked example')]),
      h('p', { class: 'dz-exin' }, `Example: ${SAMPLE_NAMES[state.sample]}${$('as-deposits').value.trim() ? `, paid to the bank as ${$('as-deposits').value.trim().split(/\n/).join(' and ')}` : ''}`)]
    : [h('div', { class: 'dz-rh' }, h('span', { class: 'dz-wx' }, label))];
  out.append(...[
    ...head,
    h('p', { class: 'as-answer' }, r.answer),
    ...r.warnings.map((w) => h('p', { class: 'as-warn' }, w)),
    ...r.settlements.flatMap((s) => [
      itemsOf(s),
      ...s.deposit.notes.map((n) => h('p', { class: 'as-warn' }, n)),
      h('details', { class: 'dz-fold as-fold' }, [
        h('summary', null, `Settlement ${s.id}: the month split, checklist and every amount type`),
        periodTable(s, Boolean(full)),
        h('h2', { class: 'as-h' }, `Month-end checklist for settlement ${s.id}`),
        checklistBlock(s),
        valuesBlock(s, r.rows),
      ]),
    ]),
    full ? h('details', { class: 'dz-fold as-fold' }, [h('summary', null, `The journals for ${LEDGER_NAMES[full.ledger]}`), journalBlock(full.journals, full.ledger)]) : null,
  ].filter(Boolean));
}

function run() {
  $('as-error').textContent = '';
  try {
    const o = opts();
    const label = state.sample ? `Sample: ${SAMPLE_NAMES[state.sample]}` : state.name;
    if (state.sample) {
      const full = reconcile(state.text, o);
      show(full, label, full);
    } else {
      show(check(state.text, o), label, null);
    }
    const n = check(state.text, o).settlements.length;
    $('as-go').disabled = Boolean(state.sample);
    $('as-go').textContent = state.sample ? 'Choose your own report for its journals' : `Get the journals and import file ($${n.toFixed(2)})`;
    $('as-go-note').textContent = state.sample ? 'The sample\'s lines per month and journals are shown. Choose your own report to check it, free.' : `${n} ${n === 1 ? 'settlement' : 'settlements'} at $1.00 each. The same file again within 7 days is free; at most $19 a month.`;
    $('as-status').textContent = $('as-out').querySelector('.as-answer')?.textContent ?? '';
  } catch (e) {
    $('as-error').textContent = e.message;
    $('as-out').textContent = '';
    $('as-go').disabled = true;
  }
}

async function load(file) {
  if (file.size > LIMITS.bytes) { $('as-error').textContent = 'The file is over 5 MB; send one settlement report at a time.'; return; }
  state.text = await file.text();
  state.name = file.name;
  state.sample = null;
  state.map = {};
  $('as-deposits').value = '';
  $('as-file-name').textContent = `${file.name}, ${file.size.toLocaleString('en-US')} bytes. Read in your browser; nothing is uploaded.`;
  run();
}

function loadSample(key) {
  state.text = SAMPLES[key];
  state.name = 'sample';
  state.sample = key;
  state.map = {};
  $('as-deposits').value = SAMPLE_BANK[key].join('\n');
  run();
}

const link = (name, text, label) => h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/csv' })), download: name, class: 'btn btn-small' }, label);

async function buy() {
  if (state.sample) return;
  $('as-error').textContent = '';
  $('as-go').disabled = true;
  $('as-status').textContent = 'Building the journals.';
  try {
    const o = opts();
    const body = { op: 'reconcile', text: state.text, ledger: o.ledger, feesAs: o.feesAs, transfer: o.transfer };
    for (const k of ['deposits', 'bankDate', 'cutoff', 'timeZone']) if (o[k]) body[k] = o[k];
    if (Object.keys(o.accounts).length) body.accounts = o.accounts;
    if (Object.keys(o.map).length) body.map = o.map;
    const res = await T.run(SLUG, body);
    const r = res.result;
    const local = reconcile(state.text, o);
    show(local, state.name, local);
    const amount = res.charged?.amount ?? 0;
    $('as-out').prepend(h('div', { class: 'as-done' }, [
      h('p', { class: 'as-downloads' }, [link(r.files.import.name, r.files.import.text, `${LEDGER_NAMES[r.ledger]} import file`), link(r.files.summary.name, r.files.summary.text, 'Summary by month'), link(r.files.lines.name, r.files.lines.text, 'Every row')]),
      h('p', { class: 'muted' }, `${amount > 0 ? `Charged $${(amount / 1e6).toFixed(2)}.` : 'No charge for this one.'} ${r.ledger === 'xero' ? 'In Xero, paste the lines into the manual journal import template: debits are positive, credits negative.' : 'In QuickBooks Online: Settings, Import Data, Journal Entries, then map the headings.'}`),
    ]));
  } catch (e) {
    $('as-error').textContent = e.status === 401 ? 'Sign in to get the journals. The check above stays free.' : e.message;
  } finally {
    $('as-go').disabled = false;
    $('as-status').textContent = '';
  }
}

function init() {
  const q = new URLSearchParams(location.search);
  if (q.get('ledger') && LEDGER_NAMES[q.get('ledger')]) $('as-ledger').value = q.get('ledger');
  if (q.get('feesAs') === 'contra-revenue') $('as-fees').value = 'contra-revenue';
  const day = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(v ?? '') ? v : '');
  $('as-cutoff').value = day(q.get('cutoff'));
  $('as-bankdate').value = day(q.get('bankDate'));
  if (q.get('timeZone')) $('as-zone').value = q.get('timeZone').slice(0, 64);
  $('as-file').addEventListener('change', (e) => { if (e.target.files[0]) load(e.target.files[0]); });
  const drop = $('as-drop');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); if (e.dataTransfer.files[0]) load(e.dataTransfer.files[0]); });
  for (const b of document.querySelectorAll('[data-sample]')) b.addEventListener('click', () => loadSample(b.dataset.sample));
  for (const id of ['as-ledger', 'as-transfer', 'as-bankdate', 'as-cutoff', 'as-deposits', 'as-zone']) $(id).addEventListener('change', run);
  $('as-fees').addEventListener('change', () => { accountFields(); run(); });
  $('as-accounts').addEventListener('change', run);
  $('as-go').addEventListener('click', buy);
  accountFields();
  const sample = q.get('sample');
  loadSample(sample && SAMPLES[sample] ? sample : 'us');
  // Bank lines from the address replace the sample's own (a page can show a gap this way).
  if (q.get('deposits') !== null) { $('as-deposits').value = q.get('deposits').split(',').map((x) => x.trim()).filter(Boolean).slice(0, LIMITS.deposits).join('\n'); run(); }
  T.mountCodePanel($('as-code'), SLUG);
}

init();
