// The pay application page. The lines and the summary are worked out in the browser with the same
// core.js the server runs, so typing is instant and free; the state rule comes from the tool's free
// "state" call. The watermarked preview is free; the PDF and CSV to submit are a paid run through
// Endwise.run, quoted first. Entries are kept in this browser (localStorage) and sent only when a
// preview, a pay application or a state rule is asked for.
import { payApp, retainageCalc, releaseCalc, usd, PayAppError } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'pay-application';
const STORE_KEY = 'pay-application.v1';
const $ = (id) => document.getElementById(id);

const STATE_NAMES = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida',
  GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire',
  NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania',
  RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington',
  WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
};

// The made-up sample job (the same as the tool's first example).
const SAMPLE = {
  project: 'Sample Medical Office Building (made-up)', projectNumber: '2026-114', contractor: 'Sample Electric LLC (made-up)', to: 'Sample Builders Inc. (made-up)', owner: 'Sample Owner LP (made-up)',
  applicationNumber: '3', periodTo: '2026-11-30', applicationDate: '2026-11-25', contractDate: '2026-08-03', contractSum: '240,000.00',
  rate: '10', storedRate: '', reduceAt: '', reducedRate: '', reduceMode: 'subsequent', rounding: 'line', released: '', previouslyReleased: '', state: 'TX', projectType: 'private',
  previousCertificates: '46,800.00',
  lines: [
    { item: '1', description: 'Mobilization and submittals', scheduled: '12,000.00', previous: '12,000.00' },
    { item: '2', description: 'Underground and rough-in', scheduled: '96,000.00', previous: '40,000.00', thisPeriod: '25,000.00' },
    { item: '3', description: 'Switchgear and panels', scheduled: '60,000.00', stored: '18,000.00' },
    { item: '4', description: 'Trim, fixtures and devices', scheduled: '60,000.00' },
    { item: '5', description: 'Testing and closeout', scheduled: '12,000.00' },
  ],
  changeOrders: [
    { number: '1', description: 'Added generator receptacle', amount: '8,500.00', thisPeriod: '4,250.00', executed: true },
    { number: '2', description: 'Delete exterior pole lights', amount: '-1,500.00', executed: false },
  ],
};
const BLANK = { ...Object.fromEntries(Object.keys(SAMPLE).map((k) => [k, ''])), applicationNumber: '1', rate: '10', reduceMode: 'subsequent', rounding: 'line', projectType: 'private', lines: [{ item: '1' }, { item: '2' }, { item: '3' }], changeOrders: [] };
const FIELDS = ['project', 'projectNumber', 'contractor', 'to', 'owner', 'applicationNumber', 'periodTo', 'applicationDate', 'contractDate', 'contractSum', 'rate', 'storedRate', 'reduceAt', 'reducedRate', 'reduceMode', 'rounding', 'released', 'previouslyReleased', 'state', 'projectType', 'previousCertificates'];
const LINE_COLS = ['item', 'description', 'scheduled', 'previous', 'thisPeriod', 'stored', 'storedPrevious'];
const CO_COLS = ['number', 'description', 'amount', 'executed', 'previous', 'thisPeriod', 'stored'];

let job = null;
let rule = null;
let ruleKey = '';
let last = null;

const load = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { return null; } };
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(job)); } catch { /* private mode */ } };
const clone = (x) => JSON.parse(JSON.stringify(x));

// ---------- the form ----------

function fillForm() {
  for (const f of FIELDS) { const el = $(`pa-${f}`); if (el) el.value = job[f] ?? ''; }
  drawRows();
}

function cellInput(kind, i, col, value) {
  if (col === 'executed') {
    const box = h('input', { type: 'checkbox', 'aria-label': `Change order ${i + 1} signed` });
    box.checked = value !== false;
    box.addEventListener('change', () => { job.changeOrders[i].executed = box.checked; changed(); });
    return h('td', { class: 'c' }, [box]);
  }
  const money = !['item', 'description', 'number'].includes(col);
  const input = h('input', { type: 'text', value: value ?? '', inputmode: money ? 'decimal' : 'text', class: money ? 'num' : '', 'aria-label': `${kind === 'co' ? 'Change order' : 'Line'} ${i + 1} ${col}` });
  input.addEventListener('input', () => { (kind === 'co' ? job.changeOrders : job.lines)[i][col] = input.value; changed(); });
  return h('td', {}, [input]);
}

function drawRows() {
  const body = $('pa-lines').querySelector('tbody');
  body.replaceChildren(...job.lines.map((l, i) => h('tr', {}, [
    ...LINE_COLS.map((c) => cellInput('line', i, c, l[c])),
    h('td', {}, [h('button', { type: 'button', class: 'pa-x', 'aria-label': `Remove line ${i + 1}`, onclick: () => { job.lines.splice(i, 1); if (!job.lines.length) job.lines.push({}); drawRows(); changed(); } }, ['×'])]),
  ])));
  const cbody = $('pa-cos').querySelector('tbody');
  cbody.replaceChildren(...job.changeOrders.map((c, i) => h('tr', {}, [
    ...CO_COLS.map((k) => cellInput('co', i, k, c[k])),
    h('td', {}, [h('button', { type: 'button', class: 'pa-x', 'aria-label': `Remove change order ${i + 1}`, onclick: () => { job.changeOrders.splice(i, 1); drawRows(); changed(); } }, ['×'])]),
  ])));
}

const filled = (v) => v !== undefined && v !== null && String(v).trim() !== '';
const pick = (o, keys) => Object.fromEntries(keys.filter((k) => filled(o[k])).map((k) => [k, String(o[k]).trim()]));

// The tool's input from the form, as the API takes it.
function inputOf(op) {
  const j = job;
  const retainage = { rate: j.rate || '0', ...pick(j, ['storedRate', 'reduceAt', 'reducedRate', 'released', 'previouslyReleased']) };
  if (filled(j.reduceAt)) retainage.reduceMode = j.reduceMode;
  if (j.rounding === 'total') retainage.rounding = 'total';
  const lines = j.lines.filter((l) => filled(l.scheduled) || filled(l.description)).map((l) => ({ ...pick(l, ['item', 'description', 'previous', 'thisPeriod', 'stored', 'storedPrevious']), scheduled: filled(l.scheduled) ? String(l.scheduled).trim() : '0' }));
  const changeOrders = j.changeOrders.filter((c) => filled(c.amount)).map((c) => ({ ...pick(c, ['number', 'description', 'amount', 'previous', 'thisPeriod', 'stored']), ...(c.executed === false ? { executed: false } : {}) }));
  return {
    op,
    project: j.project || 'Project',
    contractor: j.contractor || 'Contractor',
    applicationNumber: Number(j.applicationNumber) || 1,
    periodTo: j.periodTo || new Date().toISOString().slice(0, 10),
    ...pick(j, ['projectNumber', 'to', 'owner', 'applicationDate', 'contractDate', 'contractSum', 'previousCertificates']),
    retainage,
    lines,
    ...(changeOrders.length ? { changeOrders } : {}),
    ...(j.state ? { state: j.state, projectType: j.projectType } : {}),
  };
}

// ---------- the answer ----------

const levelWord = { error: 'Fix', warning: 'Check', ok: 'Ties out' };

function render() {
  const out = $('pa-out');
  let r;
  try {
    r = payApp(inputOf('check'), { stateRule: rule });
  } catch (e) {
    last = null;
    out.replaceChildren(h('div', { class: 'tf-rh' }, [h('span', { class: 'tf-tag run' }, 'Not worked out yet')]), h('p', {}, [e instanceof PayAppError ? e.message : 'Check the amounts entered.']));
    return;
  }
  last = r;
  const s = r.summary;
  const rows = [
    ['Original contract sum', s.originalContractSum],
    ['Net change by change orders', s.netChangeOrders],
    ['Contract sum to date', s.contractSumToDate, true],
    ['Completed and stored to date', s.completedAndStored],
    ['Retainage held', s.retainage],
    ['Earned less retainage', s.earnedLessRetainage],
    ['Less previous certificates', s.previousCertificates],
    ['Current payment due', s.currentPaymentDue, true],
    ['Balance to finish, with retainage', s.balanceToFinishWithRetainage],
  ];
  const stateLine = !job.state ? null
    : !rule ? h('p', { class: 'tf-note' }, ['Looking up the state rule.'])
      : rule.covered ? h('p', { class: 'tf-note' }, [`${rule.state}, ${rule.scope} projects (${rule.cite}, read ${rule.readOn}): ${rule.summary}`])
        : h('p', { class: 'tf-note' }, [rule.reason]);
  const example = JSON.stringify(job) === JSON.stringify(SAMPLE);
  const co = r.rows.filter((x) => x.kind === 'co').length;
  const inputs = `application ${r.applicationNumber} on a ${usd(s.originalContractSum)} contract at ${job.rate || 0}% retainage, ${r.rows.length - co} lines${co ? ` and ${co} change ${co === 1 ? 'order' : 'orders'}` : ''}`;
  const why = {
    'Original contract sum': 'As entered; the lines are checked against it',
    'Net change by change orders': 'Signed change orders only',
    'Contract sum to date': 'Line 1 plus line 2',
    'Completed and stored to date': `Previous plus this period plus stored, every line (${s.percentComplete ?? '0.0%'} complete)`,
    'Retainage held': `${job.rate || 0}% on completed work${job.storedRate ? `, ${job.storedRate}% on stored materials` : ' and stored materials'}`,
    'Earned less retainage': 'Line 4 less line 5',
    'Less previous certificates': 'Certified on earlier applications',
    'Current payment due': 'Line 6 less line 7 (G702 column logic)',
    'Balance to finish, with retainage': 'Contract sum to date less line 6',
  };
  out.replaceChildren(...[
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your pay app'),
      h('span', { class: 'tf-src' }, `Application ${r.applicationNumber}, G702/G703-style`),
    ]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${inputs} (a made-up job)` : inputs[0].toUpperCase() + inputs.slice(1)),
    h('p', { class: 'tf-big' }, [h('b', {}, usd(s.currentPaymentDue)), h('span', {}, 'due now')]),
    h('p', { class: 'tf-sub' }, [`${usd(s.completedAndStored)} completed and stored (${s.percentComplete ?? '0.0%'}), ${usd(s.retainage)} retainage held, less ${usd(s.previousCertificates)} previous certificates.`]),
    h('ol', { class: 'tf-items pa-items' }, rows.map(([k, v, strong], i) => h('li', { class: k === 'Current payment due' ? 'hi' : strong ? 'plain' : null }, [
      h('span', { class: 'k', 'aria-hidden': 'true' }, String(i + 1)), h('span', {}, k), h('b', {}, usd(v)), h('em', {}, why[k] ?? ''),
    ]))),
    h('ul', { class: 'pa-checks' }, r.checks.map((c) => h('li', { class: `pa-${c.level}` }, [h('strong', {}, [`${levelWord[c.level]}: `]), c.message]))),
    stateLine,
    h('details', { class: 'xpand pa-sheet' }, [
      h('summary', {}, ['Continuation sheet']),
      h('div', { class: 'xp-in table-scroll' }, [h('table', { class: 'rules' }, [
        h('thead', {}, [h('tr', {}, ['Item', 'Description', 'Scheduled', 'To date', '%', 'Balance', 'Retainage'].map((x, i) => h('th', { class: i > 1 ? 'r' : '' }, [x])))]),
        h('tbody', {}, r.rows.map((x) => h('tr', {}, [x.kind === 'co' ? `CO ${x.number}` : x.item, x.description, usd(x.scheduled), usd(x.total), x.percent ?? '', usd(x.balance), x.retainage === null ? '' : usd(x.retainage)].map((v, i) => h('td', { class: i > 1 ? 'r num' : '' }, [v]))))),
      ])]),
    ]),
    h('div', { id: 'pa-files' }),
  ].filter(Boolean));
}

async function refreshRule() {
  const key = job.state ? `${job.state}|${job.projectType}|${last?.summary.contractSumToDate ?? ''}` : '';
  if (key === ruleKey) return;
  ruleKey = key;
  if (!job.state) { rule = null; render(); return; }
  rule = null;
  try {
    const value = last ? (last.summary.contractSumToDate / 100).toFixed(2) : undefined;
    const res = await T.run(SLUG, { op: 'state', state: job.state, projectType: job.projectType, ...(value ? { contractValue: value } : {}) });
    if (key === ruleKey) { rule = res.result.rule; render(); }
  } catch {
    if (key === ruleKey) { rule = { covered: false, reason: 'The state rule could not be loaded; try again.' }; render(); }
  }
}

let timer = null;
function changed() {
  save();
  render();
  clearTimeout(timer);
  timer = setTimeout(refreshRule, 300);
}

// ---------- files ----------

const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const fileLink = (bytes, type, name, text, quiet) => h('a', { href: URL.createObjectURL(new Blob([bytes], { type })), download: name, class: `btn btn-small${quiet ? ' btn-quiet' : ''}` }, [text]);
const showError = (e) => { $('pa-error').textContent = e?.fields ? Object.values(e.fields)[0] : e?.message ?? 'Something went wrong.'; };

async function preview() {
  $('pa-error').textContent = '';
  $('pa-status').textContent = 'Making the preview.';
  try {
    const res = await T.run(SLUG, inputOf('preview'));
    $('pa-files').replaceChildren(h('p', { class: 'pa-downloads' }, [fileLink(fromBase64(res.result.pdf.base64), 'application/pdf', res.result.pdf.filename, 'Download the preview (PDF)', true)]));
    $('pa-status').textContent = 'Preview ready.';
  } catch (e) { showError(e); }
}

async function make() {
  $('pa-error').textContent = '';
  const body = inputOf('payapp');
  const box = $('pa-files');
  try {
    const q = (await T.api(`/api/run/${SLUG}/quote`, { body })).quote;
    const go = h('button', { type: 'button', class: 'btn' }, [q.amount ? `Pay ${q.display} and download` : 'Download (no charge)']);
    box.replaceChildren(h('p', { class: 'tf-cost' }, [q.detail ?? '']), go);
    go.addEventListener('click', async () => {
      go.disabled = true;
      try {
        const res = await T.run(SLUG, body);
        const r = res.result;
        box.replaceChildren(h('p', { class: 'pa-downloads' }, [
          fileLink(fromBase64(r.pdf.base64), 'application/pdf', r.pdf.filename, 'Download the PDF'),
          fileLink(new TextEncoder().encode(r.csv.text), 'text/csv', r.csv.filename, 'Download the CSV', true),
        ]), h('p', { class: 'tf-cost' }, [`Corrections of application ${body.applicationNumber} for this project are free for 60 days.`]));
      } catch (e) { go.disabled = false; showError(e); }
    });
  } catch (e) {
    if (e.status === 401) box.replaceChildren(h('p', {}, ['Sign in to make the pay application to submit. The totals, checks and preview stay free.']));
    else showError(e);
  }
}

// ---------- the calculators ----------

const CALC_FIELDS = {
  forward: [['amount', 'Amount billed ($)', '50,000.00'], ['rate', 'Retainage (%)', '10']],
  reverse: [['net', 'Payment received ($)', '45,000.00'], ['rate', 'Retainage (%)', '10']],
  'change-order': [['amount', 'Change order amount ($)', '8,500.00'], ['billedPercent', 'Billed to date (%)', '100'], ['rate', 'Retainage (%)', '10']],
  reduction: [['contractSum', 'Contract sum ($)', '240,000.00'], ['completed', 'Completed to date ($)', '180,000.00'], ['rate', 'Retainage (%)', '10'], ['reduceAt', 'Drops at percent complete', '50'], ['reducedRate', 'Then (%)', '5']],
  release: [['heldToDate', 'Retainage held to date ($)', '24,000.00'], ['previouslyReleased', 'Already released ($)', '0'], ['releasePercent', 'Release now (% of what is left)', '100']],
};
const calc = { mode: 'forward', values: {} };

function drawCalc() {
  const box = $('pa-calc-fields');
  box.replaceChildren(...CALC_FIELDS[calc.mode].map(([k, label, dflt]) => {
    const id = `pc-${k}`;
    const input = h('input', { type: 'text', id, inputmode: 'decimal', value: calc.values[k] ?? dflt });
    calc.values[k] = input.value;
    input.addEventListener('input', () => { calc.values[k] = input.value; runCalc(); });
    return h('div', { class: 'field' }, [h('label', { for: id }, [label]), input]);
  }));
  runCalc();
}

function runCalc() {
  const out = $('pa-calc-out');
  const v = calc.values;
  try {
    let lines;
    if (calc.mode === 'release') {
      const r = releaseCalc({ heldToDate: v.heldToDate, previouslyReleased: v.previouslyReleased || 0, releasePercent: v.releasePercent || 100 });
      lines = [`Bill ${usd(r.releaseNow)} of retainage now.`, `${usd(r.remaining)} was still held; ${usd(r.stillHeld)} stays held after this release.`];
    } else {
      const r = retainageCalc({ mode: calc.mode, ...v });
      if (r.mode === 'forward') lines = [`${usd(r.held)} held, ${usd(r.net)} paid.`, `${r.rate} of ${usd(r.amount)}.`];
      if (r.mode === 'reverse') lines = [`${usd(r.gross)} was billed.`, r.exact ? `${usd(r.gross)} less ${r.rate} retainage (${usd(r.held)}) is the ${usd(r.net)} received.` : r.note];
      if (r.mode === 'change-order') lines = [`${usd(r.held)} held on this change order.`, `${r.billedPercent} of ${usd(r.amount)} billed is ${usd(r.billed)}; ${r.rate} of that is held and ${usd(r.net)} paid.`];
      if (r.mode === 'reduction') lines = [`${usd(r.heldSubsequent)} held at ${usd(r.completed)} complete.`, `${r.rate} on the first ${usd(r.point)} (${r.reduceAt}) and ${r.reducedRate} on the rest. With the lower rate on all work once past the point: ${usd(r.heldAll)}; with no reduction: ${usd(r.heldWithoutReduction)}.`];
    }
    out.replaceChildren(h('div', { class: 'tf-rh' }, [h('span', { class: 'tf-tag run' }, 'Retainage')]), h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, [lines[0]])]), h('p', { class: 'tf-sub' }, [lines[1]]));
  } catch (e) {
    out.replaceChildren(h('p', {}, [e.message]));
  }
}

// ---------- start ----------

function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const mode = q.get('calc');
  if (mode && CALC_FIELDS[mode]) {
    calc.mode = mode;
    for (const [k] of CALC_FIELDS[mode]) if (q.has(k)) calc.values[k] = q.get(k);
    const radio = document.querySelector(`#pa-calc input[value="${mode}"]`);
    if (radio) radio.checked = true;
    setTimeout(() => document.getElementById('calculators')?.scrollIntoView(), 0);
  }
  let fromUrl = false;
  for (const f of FIELDS) if (q.has(f)) { job[f] = q.get(f); fromUrl = true; }
  if (q.get('sample') === '0') { job = clone(BLANK); fromUrl = true; }
  return fromUrl;
}

function start() {
  job = load() ?? clone(SAMPLE);
  fromQuery();
  const sel = $('pa-state');
  sel.replaceChildren(h('option', { value: '' }, ['No state check']), ...Object.entries(STATE_NAMES).map(([c, n]) => h('option', { value: c }, [n])));
  fillForm();
  for (const f of FIELDS) {
    const el = $(`pa-${f}`);
    if (el) el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'input', () => { job[f] = el.value; changed(); });
  }
  $('pa-add-line').addEventListener('click', () => { job.lines.push({ item: String(job.lines.length + 1) }); drawRows(); changed(); });
  $('pa-add-co').addEventListener('click', () => { job.changeOrders.push({ number: String(job.changeOrders.length + 1), executed: true }); drawRows(); changed(); });
  $('pa-clear').addEventListener('click', () => { job = clone(BLANK); fillForm(); changed(); });
  $('pa-preview').addEventListener('click', preview);
  $('pa-get').addEventListener('click', make);
  $('pa-form').addEventListener('submit', (e) => e.preventDefault());
  document.querySelectorAll('#pa-calc input[name="mode"]').forEach((r) => r.addEventListener('change', () => { calc.mode = r.value; calc.values = {}; drawCalc(); }));
  render();
  refreshRule();
  drawCalc();
}

start();
