// The 1099 threshold page. core.js (the same file the server runs) works out the worked examples,
// the line table, links from the content pages and the free preview of an upload; it reads the
// rule files from the tool's "rules" example, so the page and the server read the same dated data.
// A real check or scan always comes from the server through Endwise.run.
import * as businessDays from '../../business-days/files/core.js';
import {
  makeEngine, paymentsFromCsv, parseCsv, detectColumns, toCents, money, lineText, longDate, shortDate,
  PAYMENT_TYPES, PAYEE_TYPES, METHODS, COLUMN_FIELDS, LINE_BOXES, BOXES, PAYMENT_YEARS,
} from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = '1099-threshold';
const $ = (id) => document.getElementById(id);
// Element.append writes null as the text "null": leave the empty parts out.
const put = (el, ...parts) => el.append(...parts.filter((x) => x !== null && x !== undefined && x !== false));
const picked = (name) => Number(document.querySelector(`input[name="${name}"]:checked`).value);

let engine = null;
let files = null;
let tool = null;
let account = null;

const VERDICT = {
  file: { text: 'Needs a form', cls: 'file' },
  near: { text: 'Near the line', cls: 'near' },
  under: { text: 'Under the line', cls: 'under' },
  exempt: { text: 'Left out', cls: 'exempt' },
};

// ---------- the forms ----------

function options(sel, entries, value) {
  sel.textContent = '';
  for (const [v, label] of entries) sel.appendChild(h('option', { value: v, selected: v === value ? '' : null }, label));
}
const labelled = (codes) => Object.entries(codes).map(([k, v]) => [k, v.label]);

function fillForms() {
  options($('tt-type'), labelled(PAYMENT_TYPES), 'services');
  options($('tt-payee'), labelled(PAYEE_TYPES), 'individual');
  options($('tt-method'), labelled(METHODS), 'check');
  options($('tt-state'), [['', 'None'], ...Object.entries(files.states.states).map(([c, s]) => [c, `${s.name}${s.rule ? '' : ' (not verified)'}`])], '');
  options($('tt-def-type'), labelled(PAYMENT_TYPES), 'services');
  options($('tt-def-payee'), labelled(PAYEE_TYPES), 'unknown');
  options($('tt-def-method'), labelled(METHODS), 'check');
}

function readCheck() {
  const errors = {};
  const input = { op: 'check', paymentYear: picked('year') };
  const cents = toCents($('tt-amount').value);
  if (cents === null || cents < 0) errors.amount = 'Enter the dollars paid, like 1500 or 1,500.00.';
  else input.amount = cents / 100;
  input.paymentType = $('tt-type').value;
  input.payeeType = $('tt-payee').value;
  input.method = $('tt-method').value;
  if ($('tt-state').value) input.state = $('tt-state').value;
  if ($('tt-withheld').value.trim()) {
    const w = toCents($('tt-withheld').value);
    if (w === null || w < 0) errors.withheld = 'Enter the tax withheld in dollars, or leave it blank.';
    else if (w > 0) input.withheld = w / 100;
  }
  return Object.keys(errors).length ? { errors } : { input };
}

// ---------- drawing a check ----------

const dueLine = (d, forms, boxOnly) => {
  const out = [];
  if (forms.includes('1099-NEC')) out.push(`1099-NEC to the payee and the IRS by ${longDate(d.necFile)}`);
  if (forms.includes('1099-MISC')) out.push(`1099-MISC to the payee by ${longDate(boxOnly ? d.miscFurnishBox8or10 : d.miscFurnish)}, to the IRS by ${longDate(d.miscFilePaper)} on paper or ${longDate(d.miscFileElectronic)} electronically`);
  return out.join('; ');
};

function stateList(states) {
  if (!states?.length) return null;
  return h('ul', { class: 'tt-states' }, states.map((s) => h('li', {}, [
    h('strong', {}, s.name ?? s.state), ` ${s.verified ? '' : '(not verified) '}`, s.message,
    s.cfsf ? ` ${s.name} is on the IRS's Combined Federal/State Filing list (Pub 1220).` : '',
  ])));
}

function renderCheck(r, { kind, note }) {
  const out = $('tt-check-out');
  out.textContent = '';
  const year = r.paymentYear;
  put(out,
    kind === 'example' ? h('p', { class: 'tt-sheet-label' }, 'Worked example') : null,
    h('p', { class: `tt-answer ${r.required ? 'yes' : 'no'}` }, [h('small', {}, `${year} payments${r.lineStatus === 'provisional' ? ', provisional line' : ''}`), r.required ? 'Yes, file it' : 'No form needed']),
    h('p', { class: 'tt-sub' }, r.answer),
    r.line !== null && r.line !== undefined ? h('dl', { class: 'tt-facts' }, [
      h('div', {}, [h('dt', {}, 'Box'), h('dd', {}, r.box ? `${r.box.form} box ${r.box.box}` : 'None')]),
      h('div', {}, [h('dt', {}, 'Line'), h('dd', {}, lineText(r.line))]),
      h('div', {}, [h('dt', {}, 'Paid'), h('dd', {}, money(r.amount))]),
    ]) : null,
    h('ul', { class: 'tt-reasons' }, [...r.reasons, ...r.notes].map((x) => h('li', {}, x))),
    r.required && r.dueDates ? h('p', { class: 'tt-aside' }, `Due: ${dueLine(r.dueDates, r.forms, r.box?.box === '10' || r.box?.box === '8')}.`) : null,
    stateList(r.states),
    r.projection && r.projection.status === 'provisional' ? h('p', { class: 'tt-aside' }, `The 2027 line of ${lineText(r.projection.threshold)} is worked out from 26 USC 6041(h) and BLS data; the IRS has not published it yet, and its figure will replace this one.`) : null,
    h('p', { class: 'tt-aside' }, ['Source: ', h('a', { href: r.source.url }, r.source.title), `, read ${longDate(r.source.readOn)}.`]),
    note ? h('p', { class: 'tt-cost' }, note) : null,
  );
}

// ---------- the scan ----------

let table = null; // the parsed CSV: [head, ...rows]

function mappingSelects(head) {
  const grid = $('tt-map-grid');
  grid.textContent = '';
  const guessed = detectColumns(head);
  const NAMES = { payee: 'Payee', tin: 'TIN', date: 'Date', amount: 'Amount', type: 'Category', method: 'Paid by', payeeType: 'Payee type', state: 'State', withheld: 'Withheld', address1: 'Address', address2: 'Address line 2', city: 'City', zip: 'ZIP' };
  for (const field of COLUMN_FIELDS) {
    const id = `tt-col-${field}`;
    const sel = h('select', { id, 'data-field': field });
    options(sel, [['', 'None'], ...head.map((x) => [x, x])], guessed[field] === undefined ? '' : head[guessed[field]]);
    sel.addEventListener('change', preview);
    grid.appendChild(h('div', { class: 'field' }, [h('label', { for: id }, NAMES[field]), sel]));
  }
  $('tt-map').hidden = false;
}
const chosenColumns = () => Object.fromEntries([...document.querySelectorAll('#tt-map-grid select')].filter((s) => s.value).map((s) => [s.dataset.field, s.value]));

function scanInput() {
  const text = $('tt-csv').value;
  const defaults = { type: $('tt-def-type').value, payeeType: $('tt-def-payee').value, method: $('tt-def-method').value };
  const payer = {};
  for (const [f, id] of [['name', 'tt-payer-name'], ['tin', 'tt-payer-tin'], ['address1', 'tt-payer-a1'], ['city', 'tt-payer-city'], ['state', 'tt-payer-state'], ['zip', 'tt-payer-zip'], ['phone', 'tt-payer-phone']]) {
    const v = $(id).value.trim();
    if (v) payer[f] = f === 'state' ? v.toUpperCase() : v;
  }
  const input = { op: 'scan', paymentYear: picked('scan-year'), defaults, exports: ['csv', 'iris'] };
  if (Object.keys(payer).length) input.payer = payer;
  return { text, input };
}

let previewTimer = null;
function schedulePreview() { clearTimeout(previewTimer); previewTimer = setTimeout(preview, 250); }

function onCsvChanged() {
  $('tt-csv-err').textContent = '';
  table = parseCsv($('tt-csv').value);
  if (table.length) mappingSelects(table[0]); else $('tt-map').hidden = true;
  preview();
}

// The free preview: counted on this page from the same rules, totals only.
async function preview() {
  const box = $('tt-preview');
  $('tt-scan-error').textContent = '';
  if (!engine || !$('tt-csv').value.trim()) { box.textContent = ''; $('tt-scan-run').disabled = true; return; }
  const { text, input } = scanInput();
  let parsed;
  try {
    parsed = paymentsFromCsv(text, chosenColumns());
  } catch (e) {
    $('tt-csv-err').textContent = e.message;
    box.textContent = '';
    $('tt-scan-run').disabled = true;
    return;
  }
  $('tt-csv-err').textContent = '';
  let r;
  try {
    r = engine.scan({ ...input, exports: [], payments: parsed.payments });
  } catch (e) {
    box.textContent = e.message;
    $('tt-scan-run').disabled = true;
    return;
  }
  const s = r.summary;
  const parts = [`${s.payees} ${s.payees === 1 ? 'payee' : 'payees'} paid in ${r.paymentYear}: ${s.file} need a form, ${s.near} near the line, ${s.under + s.exempt} not.`];
  if (r.otherYears.length) parts.push(`${r.otherYears.map((o) => `${o.rows} ${o.rows === 1 ? 'row' : 'rows'} from ${o.year}`).join(', ')} left out.`);
  if (parsed.problems.length) parts.push(`${parsed.problems.length} ${parsed.problems.length === 1 ? 'row needs' : 'rows need'} a look.`);
  box.textContent = parts.join(' ');
  $('tt-scan-run').disabled = false;
  // Signed in: what the full scan costs this account now (payees already paid for are free),
  // from the same code that charges it. Signed out: the list price for this many payees.
  if (!account) {
    const n = s.payees;
    const usd = Math.min(n, 500) * 10 + Math.max(0, n - 500) * 5;
    box.append(' ', h('strong', {}, `The full scan, with the IRIS file, costs ${money(usd)} (${n} payee-${n === 1 ? 'year' : 'years'}) from an account.`));
    return;
  }
  try {
    const q = await T.api(`/api/run/${SLUG}/quote`, { body: requestBody(input, text) });
    if (q?.quote?.display) box.append(' ', h('strong', {}, `The full scan costs ${q.quote.display}${q.quote.amount === 0 ? ': every payee here is already paid for' : ''}.`));
  } catch { /* the preview stands without the quote */ }
}

// The scan as sent: the CSV text with the chosen headings, or rows when the CSV is too long.
function requestBody(input, text) {
  if (text.length <= 95_000) {
    const cols = chosenColumns();
    return { ...input, csv: text, ...(Object.keys(cols).length ? { columns: cols } : {}) };
  }
  return { ...input, payments: paymentsFromCsv(text, chosenColumns()).payments };
}

function download(file) {
  const blob = new Blob([file.csv], { type: 'text/csv' });
  const a = h('a', { href: URL.createObjectURL(blob), download: file.name, class: 'btn btn-quiet btn-small' }, `${file.name} (${file.records} ${file.records === 1 ? 'row' : 'rows'})`);
  return a;
}

function boxCells(p) {
  if (!p.report.length) {
    const b = p.boxes[0];
    return b ? `${money(b.total)} in ${b.form} box ${b.box} (line ${lineText(b.line)})` : '';
  }
  return p.report.map((r) => `${r.form}: ${[...Object.entries(r.amounts).map(([box, c]) => `box ${box} ${money(c)}`), ...r.checkboxes.map((b) => `box ${b} checked`)].join(', ')}`).join('; ');
}

function renderReport(r, { kind, note }) {
  const out = $('tt-report');
  out.textContent = '';
  const s = r.summary;
  const d = r.dueDates;
  const owed = Object.values(s.forms).reduce((a, b) => a + b, 0);
  put(out,
    kind === 'example' ? h('p', { class: 'tt-sheet-label' }, 'Sample: a made-up remodeling business\'s 2026 payments') : null,
    h('p', { class: 'tt-answer' }, [h('small', {}, `${r.paymentYear} payments, ${lineText(r.general)} line${r.lineStatus === 'provisional' ? ' (provisional)' : ''}`), `${s.file} of ${s.payees} need a form`]),
    h('p', { class: 'tt-sub' }, r.answer),
    h('dl', { class: 'tt-facts' }, [
      h('div', {}, [h('dt', {}, 'Forms owed'), h('dd', {}, `${s.forms['1099-NEC']} NEC, ${s.forms['1099-MISC']} MISC`)]),
      h('div', {}, [h('dt', {}, '1099-NEC due'), h('dd', {}, shortDate(d.necFile))]),
      h('div', {}, [h('dt', {}, 'E-file'), h('dd', {}, s.eFile.required ? 'Required' : `Not required (${s.eFile.count} of ${s.eFile.line})`)]),
      h('div', {}, [h('dt', {}, 'Missing TINs'), h('dd', {}, String(s.missingTin))]),
    ]),
  );
  const rows = r.payees.map((p) => h('tr', { class: `v-${p.verdict}` }, [
    h('th', { scope: 'row' }, [p.name, p.tin ? h('small', {}, `TIN ending ${p.tin.last4}`) : h('small', {}, 'No TIN')]),
    h('td', {}, h('span', { class: `tt-badge ${VERDICT[p.verdict].cls}` }, VERDICT[p.verdict].text)),
    h('td', { class: 'money', 'data-label': 'Counted' }, money(p.counted)),
    h('td', { class: 'tt-boxes' }, boxCells(p)),
    h('td', { 'data-label': 'Crossed on' }, p.boxes.map((b) => b.crossedOn).filter(Boolean).sort()[0] ? shortDate(p.boxes.map((b) => b.crossedOn).filter(Boolean).sort()[0]) : ''),
    h('td', {}, h('details', { class: 'tt-why' }, [h('summary', {}, 'Why'), h('ul', {}, [...p.reasons, ...p.notes].map((x) => h('li', {}, x))), stateList(p.states)])),
  ]));
  out.append(h('div', { class: 'table-scroll' }, h('table', { class: 'rules tt-table' }, [
    h('thead', {}, h('tr', {}, ['Payee', 'Verdict', 'Counted', 'Boxes', 'Crossed on', ''].map((x) => h('th', { scope: 'col' }, x)))),
    h('tbody', {}, rows),
  ])));
  const notes = [...(r.notes ?? [])];
  for (const dup of r.duplicates) notes.push(`Possibly one payee set up twice: ${dup.names.join(' and ')} (together ${money(dup.combined)}). Add the TIN to merge them.`);
  for (const p of r.problems ?? []) notes.push(`Row ${p.row}: ${p.message}`);
  if (notes.length) out.append(h('ul', { class: 'tt-notes' }, notes.map((x) => h('li', {}, x))));
  if (owed) {
    out.append(h('p', { class: 'tt-heading' }, 'Due dates'), h('p', { class: 'tt-aside' }, `${dueLine(d, ['1099-NEC', '1099-MISC'], false)}. A 1099-MISC that reports only box 8 or 10 goes to the payee by ${longDate(d.miscFurnishBox8or10)}.`));
    if (r.penalty?.published) {
      // The penalty table folds behind its range: the summary says what is at stake.
      const bands = r.penalty.bands;
      out.append(h('details', { class: 'tt-fold' }, [
        h('summary', {}, `If these ${owed} forms are late: ${money(bands[0].total, { short: true })} to ${money(bands[bands.length - 1].total, { short: true })} in penalties (returns due in ${r.penalty.dueYear})`),
        h('div', { class: 'table-scroll' }, h('table', { class: 'rules tt-pen' }, [
          h('thead', {}, h('tr', {}, ['Late by', 'Per return', 'Returns and statements'].map((x) => h('th', { scope: 'col' }, x)))),
          h('tbody', {}, bands.map((b) => h('tr', {}, [h('th', { scope: 'row' }, b.label), h('td', { class: 'money' }, money(b.perReturn, { short: true })), h('td', { class: 'money' }, money(b.total, { short: true }))]))),
        ])),
        h('p', { class: 'tt-aside' }, 'A late form is two failures, the return and the payee statement, each with its own penalty. Annual maximums apply; there is none for intentional disregard.'),
      ]));
    }
  }
  if (r.files?.length) {
    out.append(h('p', { class: 'tt-heading' }, 'Files'), h('p', { class: 'tt-files' }, r.files.map(download)));
    if (r.iris) {
      const checks = r.iris.problems.map((p) => (p.payee ? `${p.payee}: ${p.message}` : p.message));
      out.append(h('p', { class: 'tt-aside' }, `${r.iris.layoutNote} The IRIS Taxpayer Portal takes up to ${r.iris.returnsPerUpload} returns at a time, so longer lists come in parts.`));
      if (checks.length) out.append(h('ul', { class: 'tt-notes' }, checks.map((x) => h('li', {}, x))));
    }
  }
  if (note) out.append(h('p', { class: 'tt-cost' }, note));
}

// ---------- the line table and the 2027 projection ----------

// The boxes most payers meet show first; the rest fold behind "Show all".
const COMMON_BOXES = new Set(['nec-1a', 'misc-1', 'misc-2', 'misc-3', 'misc-6', 'misc-10']);

function renderLines() {
  const years = PAYMENT_YEARS.map((y) => engine.thresholds(y));
  const rows = LINE_BOXES.map((id) => h('tr', { class: COMMON_BOXES.has(id) ? null : 'tt-rare' }, [
    h('th', { scope: 'row' }, [`${BOXES[id].form} box ${BOXES[id].box}`, h('small', {}, BOXES[id].name)]),
    ...years.map((t) => h('td', { class: 'money' }, lineText(t.boxes.find((b) => b.id === id).line))),
    h('td', {}, years[1].boxes.find((b) => b.id === id).corporations ? 'Yes' : 'No'),
  ]));
  const table = h('table', { class: 'rules tt-lines-grid tt-short', id: 'tt-lines-grid' }, [
    h('thead', {}, h('tr', {}, ['Box', '2025', '2026', '2027 (provisional)', 'Also to corporations'].map((x) => h('th', { scope: 'col' }, x)))),
    h('tbody', {}, rows),
  ]);
  const more = h('button', { type: 'button', class: 'tt-more', 'aria-expanded': 'false', 'aria-controls': 'tt-lines-grid' }, `Show all ${LINE_BOXES.length} boxes`);
  more.addEventListener('click', () => {
    const open = table.classList.toggle('tt-short') === false;
    more.setAttribute('aria-expanded', String(open));
    more.textContent = open ? 'Show the common boxes only' : `Show all ${LINE_BOXES.length} boxes`;
  });
  $('tt-lines-table').textContent = '';
  $('tt-lines-table').append(h('div', { class: 'table-scroll' }, table), more);
  const p = engine.projection(2027);
  if (p.status === 'provisional') {
    $('tt-projection').append(h('details', { class: 'tt-fold' }, [
      h('summary', {}, `How the 2027 line of ${lineText(p.threshold)} is worked out`),
      h('p', {}, `From 2027 the $2,000 line rises with the chained consumer price index (26 USC 6041(h)): the average C-CPI-U for the 12 months to August 2026 over the average for the 12 months to August 2025, applied to $2,000, with the increase rounded to the nearest $100. BLS published ${p.current.count} of those 12 months (October 2025 was not published). The averages are ${p.current.average} and ${p.base.average}: up ${p.percent}%, an increase of ${money(p.increase)}, which rounds to ${money(p.roundedIncrease, { short: true })}. So the provisional 2027 line is ${lineText(p.threshold)}. Filling the missing month from its neighbours gives the same answer, and the rounding would only change below +${p.flipsBelowPercent}% or at +${p.flipsAtPercent}%.`),
      h('p', { class: 'tt-aside' }, 'The IRS has not published the 2027 figure. When it does, its figure replaces this one here and in every 2027 answer.'),
    ]));
  }
}

// ---------- running ----------

function costNote(json) {
  if (json.charged) return `${json.charged.amount ? `Charged ${json.charged.display}` : 'No charge'}${json.charged.detail ? ` (${json.charged.detail})` : ''}. Your balance is ${json.balance.display}.`;
  if (typeof json.freeRunsLeft === 'number') return `Free check. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'check' : 'checks'} left today.`;
  return null;
}

function showError(box, e) {
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

async function onCheck(ev) {
  ev.preventDefault();
  $('tt-check-error').textContent = '';
  $('tt-amount-err').textContent = '';
  $('tt-withheld-err').textContent = '';
  const read = readCheck();
  if (read.errors) {
    if (read.errors.amount) $('tt-amount-err').textContent = read.errors.amount;
    if (read.errors.withheld) $('tt-withheld-err').textContent = read.errors.withheld;
    return;
  }
  const button = $('tt-check-run');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, read.input);
    renderCheck(json.result, { kind: 'run', note: costNote(json) });
  } catch (e) {
    showError($('tt-check-error'), e);
  } finally {
    button.disabled = false;
  }
}

async function onScan(ev) {
  ev.preventDefault();
  // Signed out, the button says it signs you in, and does.
  if (!account) { window.location.href = `${T.base}/account?next=${encodeURIComponent(window.location.pathname)}`; return; }
  $('tt-scan-error').textContent = '';
  const { text, input } = scanInput();
  let body;
  try {
    body = requestBody(input, text);
  } catch (e) {
    $('tt-csv-err').textContent = e.message;
    return;
  }
  const button = $('tt-scan-run');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, body);
    renderReport(json.result, { kind: 'run', note: costNote(json) });
    $('tt-report').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    showError($('tt-scan-error'), e);
  } finally {
    button.disabled = false;
  }
}

function showPrice() {
  const scan = tool.pricing.actions.find((a) => a.name === 'scan');
  $('tt-price').textContent = `A year-end scan costs ${T.money(scan.text)}. Checking one payee is free${account ? '' : ': 5 free checks a day without an account'}.`;
  $('tt-check-note').textContent = account ? 'Free, and not taken from your balance.' : '5 free checks a day, no account needed.';
  $('tt-scan-note').textContent = account ? 'Charged from your balance, once per payee for the year.' : 'A scan needs an account. The free preview above needs none.';
  $('tt-scan-run').textContent = account ? 'Run the scan' : 'Sign in to run the scan';
}

// ---------- inputs from the address ----------

// Links from the content pages carry a payee (?year=2026&amount=2500&type=legal-fees
// &payee=c-corporation&method=check&state=CA): the form opens filled in and worked out here, free.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (![...q.keys()].length) return false;
  const year = q.get('year');
  if (year && PAYMENT_YEARS.includes(Number(year))) document.querySelector(`input[name="year"][value="${year}"]`).checked = true;
  const amount = q.get('amount');
  if (amount !== null && toCents(amount) !== null && toCents(amount) >= 0) $('tt-amount').value = amount;
  const set = (id, value, codes) => { if (value !== null && Object.prototype.hasOwnProperty.call(codes, value)) $(id).value = value; };
  set('tt-type', q.get('type'), PAYMENT_TYPES);
  set('tt-payee', q.get('payee'), PAYEE_TYPES);
  set('tt-method', q.get('method'), METHODS);
  set('tt-state', q.get('state'), files.states.states);
  return true;
}

// ---------- start ----------

async function start() {
  $('tt-check-form').addEventListener('submit', onCheck);
  $('tt-scan-form').addEventListener('submit', onScan);
  $('tt-csv').addEventListener('input', () => { clearTimeout(previewTimer); previewTimer = setTimeout(onCsvChanged, 300); });
  $('tt-file').addEventListener('change', async () => {
    const f = $('tt-file').files[0];
    if (!f) return;
    if (f.size > 2_000_000) { $('tt-csv-err').textContent = 'That file is over 2 MB. Export just the payments for one year.'; return; }
    $('tt-csv').value = await f.text();
    onCsvChanged();
  });
  for (const el of document.querySelectorAll('input[name="scan-year"], #tt-def-type, #tt-def-payee, #tt-def-method')) el.addEventListener('change', schedulePreview);
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('tt-code'), SLUG);

  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('tt-check-out').textContent = 'The worked example could not load. The tracker still works: press the button to run it.';
    return;
  }
  files = tool.examples.find((x) => x.input.op === 'rules').output.files;
  engine = makeEngine(businessDays, files);
  fillForms();
  account = await T.me().catch(() => null);
  showPrice();
  renderLines();

  const linked = fromQuery();
  if (linked) {
    const read = readCheck();
    if (read.input) {
      try {
        renderCheck(engine.check(read.input), { kind: 'example', note: 'Worked out on this page from the link you followed. Press "Check this payee" to run it for real.' });
      } catch { /* fall back to the example */ }
    }
    $('tt-check-form').scrollIntoView({ block: 'start' });
  }
  if (!linked) renderCheck(tool.examples.find((x) => x.input.op === 'check').output, { kind: 'example', note: 'Change the amount, the payee or the payment and press "Check this payee".' });
  renderReport(tool.examples.find((x) => x.input.op === 'scan').output, { kind: 'example', note: 'Drop your own payments CSV above to see your own list.' });
  // The same sample's files, near the price, so what a paid scan gives can be seen before paying.
  const sample = $('tt-sample-links');
  const sampleFiles = tool.examples.find((x) => x.input.op === 'scan').output.files ?? [];
  if (sample && sampleFiles.length) { sample.textContent = ''; put(sample, ...sampleFiles.flatMap((f) => [download(f), ' '])); }
}

start();
