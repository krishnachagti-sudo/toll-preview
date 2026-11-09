// The VAT number check page. core.js (the same file the server runs) reads the number as it is
// typed, free and on this page: the format table comes from the tool's published formats example,
// so the page and the server read a number against the same dated VIES table. Only the check
// itself goes to VIES (through Endwise.run); verifying a receipt and VIES availability are free runs.
// Nothing is kept in this browser.
import { makeChecker, checkerDataFrom, MATCH_FIELDS, MATCH_WORDS, utcText } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'vat-number-check';
const $ = (id) => document.getElementById(id);

let checker = null;
let formats = null;

const STATUS_TITLES = {
  valid: 'Valid',
  invalid: 'Not valid',
  unavailable: 'Could not check',
  requester_invalid: 'Not checked: your own number was refused',
  rejected: 'Not checked: VIES could not read it',
  blocked: 'Not checked: blocked by VIES',
  bad_format: 'Not checked: wrong shape',
  not_covered: 'Not checked here',
};

// ---------- reading the form ----------

function readForm() {
  const input = { op: 'check', vatNumber: $('vc-number').value.trim() };
  const cc = $('vc-country').value;
  if (cc) input.countryCode = cc;
  const req = $('vc-requester').value.trim();
  if (req) input.requesterVatNumber = req;
  const ref = $('vc-ref').value.trim();
  if (ref) input.reference = ref;
  const trader = {};
  for (const [key, id] of [['name', 'vc-t-name'], ['street', 'vc-t-street'], ['postalCode', 'vc-t-postal'], ['city', 'vc-t-city'], ['companyType', 'vc-t-type']]) {
    const v = $(id).value.trim();
    if (v) trader[key] = v;
  }
  if (Object.keys(trader).length) input.trader = trader;
  return input;
}

function clearErrors() {
  for (const id of ['vc-number-err', 'vc-requester-err', 'vc-error']) $(id).textContent = '';
}

// As the number is typed: its shape against the VIES table, before anything is sent.
function hint() {
  const v = $('vc-number').value.trim();
  const box = $('vc-number-hint');
  if (!checker || !v) { box.textContent = 'With its 2-letter country prefix. Spaces and dots are fine.'; box.className = 'hint tf-long'; return; }
  const f = checker.format({ vatNumber: v, countryCode: $('vc-country').value || undefined });
  box.textContent = f.wellFormed ? `${f.vatNumber}: the shape VIES lists for ${f.country}. Checked with ${f.checkedWith}.` : f.message;
  box.className = f.wellFormed ? 'hint vc-shape' : 'hint';
}

// ---------- showing an answer ----------

function download(name, type, data, label) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  return h('a', { href: url, download: name, class: 'btn btn-small' }, label);
}
const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

function downloads(files) {
  return h('p', { class: 'vc-downloads' }, [
    download(files.pdf.name, 'application/pdf', fromBase64(files.pdf.base64), 'Download the PDF'),
    download(files.json.name, 'application/json', files.json.text, 'Download the JSON receipt'),
  ]);
}

// One line per figure: a mark, the figure, then what it is and where it comes from.
const item = (k, label, value, src, cls) => h('li', { class: cls ?? null }, [
  h('span', { class: 'k', 'aria-hidden': 'true' }, k),
  h('span', { class: 'vc-v' }, value),
  h('em', {}, src ? `${label} · ${src}` : label),
]);

// A check result, or a receipt's outcome (the sample): the same picture either way.
// kind: 'example' (the sample receipt, at rest) or 'run' (your check).
function showAnswer(r, { kind, files, receipt, charged }) {
  const out = $('vc-out');
  out.textContent = '';
  const status = r.status;
  const number = r.vatNumber ?? $('vc-number').value.trim();
  const service = receipt?.service ?? 'VIES';
  const sample = kind === 'example';
  out.append(h('div', { class: 'tf-rh' }, [
    sample ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your check'),
    h('span', { class: 'tf-src' }, sample ? 'VIES test service' : `Checked with ${service}`),
  ]));
  out.append(h('p', { class: 'tf-exin' }, sample ? `Example: ${number}, checked with the VIES test service` : `${number}${receipt?.reference ? `, reference ${receipt.reference}` : ''}`));
  out.append(h('p', { class: `tf-big vc-answer s-${status}` }, [h('b', { class: 'word' }, STATUS_TITLES[status] ?? status), h('span', {}, number)]));
  out.append(h('p', { class: 'tf-sub' }, r.message));
  if (r.link) out.append(h('p', { class: 'tf-note' }, h('a', { href: r.link }, 'Check a UK VAT number on GOV.UK')));
  if (receipt) {
    const o = receipt.outcome;
    const said = `${receipt.service} reply`;
    const rows = [];
    if (o.status === 'valid') {
      rows.push(item('N', 'Name', o.name ?? 'Not disclosed by this state', said));
      rows.push(item('A', 'Address', o.address ?? 'Not disclosed by this state', said));
    }
    rows.push(item('C', 'Consultation number', o.consultationNumber ?? (receipt.request.requester ? 'None returned' : 'None (add your own VAT number to get one)'), o.consultationNumber ? said : null, o.consultationNumber ? null : 'plain'));
    if (o.officialTime) rows.push(item('T', `${receipt.service} time`, utcText(o.officialTime), said));
    rows.push(item('t', 'Our clock', utcText(receipt.issuedAt), 'this receipt', 'plain'));
    if (o.matches) {
      const names = Object.fromEntries(MATCH_FIELDS.map(([k, , words]) => [k, words]));
      rows.push(item('=', 'Compared', Object.entries(o.matches).map(([k, v]) => `${names[k]}: ${MATCH_WORDS[v] ?? 'no answer'}`).join('; '), said));
    }
    if (receipt.reference) rows.push(item('R', 'Your reference', receipt.reference, null, 'plain'));
    rows.push(item('#', 'SHA-256', h('span', { class: 'vc-hash' }, receipt.hash), 'of the request and reply', 'plain'));
    rows.push(item('S', 'Signature', receipt.signature ? `Ed25519, key ${receipt.signature.keyId}` : 'Not signed (no signing key set up yet)', null, 'plain'));
    out.append(h('ol', { class: 'tf-items vc-items' }, rows));
  }
  const notes = r.notes ?? receipt?.notes ?? [];
  if (notes.length) out.append(h('ul', { class: 'vc-notes' }, notes.map((n) => h('li', null, n))));
  if (files) out.append(downloads(files));
  if (charged !== undefined) {
    out.append(h('p', { class: 'tf-cost' }, charged ? `Charged ${charged.display}.` : r.billed === false ? 'No charge.' : 'Free run (no account).'));
  }
}

function showError(e) {
  const box = $('vc-error');
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in or create an account'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
  if (e.fields?.vatNumber) $('vc-number-err').textContent = e.fields.vatNumber;
  if (e.fields?.requesterVatNumber) $('vc-requester-err').textContent = e.fields.requesterVatNumber;
}

async function runCheck(ev) {
  ev.preventDefault();
  clearErrors();
  const input = readForm();
  if (!input.vatNumber) { $('vc-number-err').textContent = 'Enter a VAT number.'; return; }
  // A wrong shape is answered here, as the server would answer it (free), without a call.
  const p = checker.plan(input, { hmrcOn: false });
  if (!p.ok && p.status === 'bad_format') {
    $(p.field === 'requesterVatNumber' ? 'vc-requester-err' : 'vc-number-err').textContent = p.message;
    return;
  }
  const button = $('vc-go');
  button.disabled = true;
  $('vc-status').textContent = 'Checking with VIES.';
  try {
    const json = await T.run(SLUG, input);
    const r = json.result;
    showAnswer(r, { kind: 'run', files: r.files, receipt: r.receipt, charged: json.charged ?? null });
    $('vc-status').textContent = STATUS_TITLES[r.status] ?? r.status;
  } catch (e) {
    showError(e);
  } finally {
    button.disabled = false;
  }
}

// ---------- verify ----------

async function runVerify() {
  $('vc-verify-error').textContent = '';
  const out = $('vc-verify-out');
  out.textContent = '';
  let receipt;
  try {
    receipt = JSON.parse($('vc-receipt').value);
  } catch {
    $('vc-verify-error').textContent = 'That is not JSON. Paste the whole .json receipt, or choose the file.';
    return;
  }
  try {
    const v = (await T.run(SLUG, { op: 'verify', receipt })).result;
    const cls = v.hashMatches && v.signature === 'valid' ? 'vc-ok' : v.hashMatches && v.signature === 'unsigned' ? null : 'vc-bad';
    out.append(h('p', cls ? { class: cls } : null, v.message));
    if (v.receiptId) out.append(h('p', { class: 'tf-note' }, `Receipt ${v.receiptId}${v.keyId ? `, key ${v.keyId}` : ''}.`));
  } catch (e) {
    $('vc-verify-error').textContent = e.message;
  }
}

async function readReceiptFile() {
  const file = $('vc-receipt-file').files[0];
  if (!file) return;
  $('vc-receipt').value = await file.text();
  runVerify();
}

// ---------- availability ----------

function statusTable(rows) {
  const box = $('vc-status-table');
  box.textContent = '';
  box.append(h('table', { class: 'vc-table' }, [
    h('thead', null, h('tr', null, [h('th', null, 'State'), h('th', null, 'Format'), h('th', null, 'Now'), h('th', null, 'Scheduled downtime')])),
    h('tbody', null, rows.map((c) => h('tr', null, [
      h('td', null, c.code),
      h('td', null, c.shape ?? ''),
      h('td', null, c.availability ?? '-'),
      h('td', null, c.window ?? (c.code === 'GB' ? 'Checked with HMRC, not VIES' : '')),
    ]))),
  ]));
}

async function runStatus() {
  const button = $('vc-status-go');
  button.disabled = true;
  try {
    const s = (await T.run(SLUG, { op: 'status' })).result;
    const shapes = Object.fromEntries(formats.countries.map((c) => [c.code, c.shape]));
    statusTable(s.countries.map((c) => ({ ...c, shape: shapes[c.code] })));
    $('vc-status-table').append(h('p', { class: 'tf-note' }, s.message));
  } catch (e) {
    $('vc-status-table').append(h('p', { class: 'form-error' }, e.message));
  } finally {
    button.disabled = false;
  }
}

// ---------- start ----------

function fromQuery() {
  const q = new URLSearchParams(location.search);
  if (q.get('vat')) $('vc-number').value = q.get('vat').slice(0, 40);
  if (q.get('requester')) $('vc-requester').value = q.get('requester').slice(0, 40);
}

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('vc-code'), SLUG);
  let tool;
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('vc-out').textContent = 'The format table could not load. Reload the page to try again.';
    return;
  }
  formats = tool.examples.find((x) => x.input.op === 'formats').output;
  checker = makeChecker(checkerDataFrom(formats));
  for (const c of formats.countries) $('vc-country').append(h('option', { value: c.code }, `${c.code} ${c.name}`));
  statusTable(formats.countries);

  // The sample receipt near the price and in the answer pane, before anything is checked.
  const sample = tool.examples.find((x) => x.input.op === 'render');
  if (sample) {
    const links = $('vc-sample-links');
    links.textContent = '';
    links.append(downloads(sample.output.files));
    const receipt = sample.input.receipt;
    showAnswer({ ...receipt.outcome, notes: receipt.notes }, { kind: 'example', receipt });
  }

  fromQuery();
  hint();
  $('vc-number').addEventListener('input', hint);
  $('vc-country').addEventListener('change', hint);
  $('vc-form').addEventListener('submit', runCheck);
  $('vc-verify').addEventListener('click', runVerify);
  $('vc-receipt-file').addEventListener('change', readReceiptFile);
  $('vc-status-go').addEventListener('click', runStatus);
}

start();
