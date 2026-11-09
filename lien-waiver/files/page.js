// The lien waiver page. Which waiver to sign is asked of the tool as the form changes (a free
// "decide" call, so the page and the API give the same answer); the state's forms and their blanks
// come from the free "rules" call. Previews (watermarked) are free; a waiver to sign is a paid run
// through Endwise.run, quoted first. Entries are kept in this browser (localStorage) and sent only
// when a preview or a waiver is asked for.
const T = window.Endwise;
const h = T.h;
const SLUG = 'lien-waiver';
const STORE_KEY = 'lien-waiver.v1';
const $ = (id) => document.getElementById(id);

// The blanks a form can have, in the order they are asked for, with the words for each.
const FIELDS = [
  ['claimant', 'Your company, as it signs (claimant, lienor)', 'Sample Electric LLC'],
  ['customer', 'Who you contracted with (customer)', 'Sample Builders Inc.'],
  ['owner', 'Property owner', 'Sample Owner LP'],
  ['amount', 'Payment amount ($)', '48,250.00'],
  ['project', 'Project name', 'Sample Office Building'],
  ['jobNo', 'Job number', '2026-118'],
  ['location', 'Job location or address', '100 Example Street, Austin, Texas'],
  ['jobDescription', 'Job description', 'Electrical rough-in, floors 1 to 3'],
  ['propertyDescription', 'Description of the property (Florida)', 'Lot 4, Block B, or the street address'],
  ['recipient', 'TO (Wyoming: who receives the waiver)', ''],
  ['checkMaker', 'Who wrote the check (maker)', ''],
  ['payees', 'Check payable to', ''],
  ['throughDate', 'Work through date', ''],
  ['signDate', 'Date you sign', ''],
  ['signerTitle', 'Signer\'s title', 'Manager'],
  ['disputedAmount', 'Disputed claims amount ($)', ''],
  ['retainageAmount', 'Retainage withheld ($, Wyoming)', ''],
  ['unpaidAmount', 'Amount not yet paid ($, Wyoming)', ''],
];
const DATE_FIELDS = new Set(['throughDate', 'signDate']);
const DERIVED = { signMonthDay: 'signDate', signYear: 'signDate' };

let rulesAll = null;
let stateRules = {};
let lastDecision = null;
let pendingQuote = null;
let lastPaid = null;
let timer = null;

// ---------- the form ----------

const stage = () => $('lw-stage').value;
const status = () => $('lw-pay').value;
// Sets a select to a value only when it is one of its options.
const pickOption = (id, v) => { const el = $(id); if ([...el.options].some((o) => o.value === v)) el.value = v; };

function fieldInputs() {
  const box = $('lw-fields');
  box.textContent = '';
  for (const [key, label, placeholder] of FIELDS) {
    box.appendChild(h('div', { class: 'field lw-f', 'data-field': key }, [
      h('label', { for: `lw-f-${key}` }, label),
      h('input', { id: `lw-f-${key}`, type: DATE_FIELDS.has(key) ? 'date' : 'text', maxlength: key === 'propertyDescription' ? '400' : '200', placeholder: placeholder ? `e.g. ${placeholder}` : '' }),
    ]));
  }
  box.appendChild(h('div', { class: 'field lw-f', 'data-field': 'signerEntity' }, [
    h('label', { for: 'lw-f-signerEntity' }, 'Who signs (picks the Texas notary certificate)'),
    h('select', { id: 'lw-f-signerEntity' }, [
      h('option', { value: '' }, 'Leave the certificate for the notary'),
      h('option', { value: 'individual' }, 'A person in their own right'),
      h('option', { value: 'corporation' }, 'An officer of a corporation'),
      h('option', { value: 'llc' }, 'For a limited liability company'),
    ]),
  ]));
}

// Shows only the blanks the chosen form has.
function syncFields() {
  const code = $('lw-state').value;
  $('lw-tx').hidden = code !== 'TX';
  const formId = lastDecision?.formId;
  const r = stateRules[code];
  const form = r?.forms?.find((f) => f.id === formId);
  const wanted = new Set(form ? form.fields.map((f) => DERIVED[f] ?? f) : []);
  for (const el of document.querySelectorAll('.lw-f')) {
    const k = el.dataset.field;
    el.hidden = k === 'signerEntity' ? !(lastDecision?.formVersion === 'pre-2022') : !wanted.has(k) && !['claimant', 'customer', 'owner', 'amount'].includes(k);
  }
  $('lw-details').hidden = !form;
}

function readForm() {
  const code = $('lw-state').value;
  const base = { state: code, stage: stage(), paymentStatus: status() };
  if ($('lw-more').checked) base.expectsMoreMoney = true;
  if (code === 'TX' && $('lw-contract').value) base.originalContractDate = $('lw-contract').value;
  if ($('lw-override').checked && !$('lw-override-row').hidden) base.signBeforeCleared = true;
  const payment = {};
  for (const [key] of FIELDS) {
    const el = $(`lw-f-${key}`);
    if (el.closest('.lw-f').hidden) continue;
    const v = el.value.trim();
    if (v) payment[key] = v;
  }
  const entity = $('lw-f-signerEntity');
  const extra = !entity.closest('.lw-f').hidden && entity.value ? { signerEntity: entity.value } : {};
  return { base, payment, extra };
}

function save() {
  try {
    const values = {};
    for (const [key] of FIELDS) values[key] = $(`lw-f-${key}`).value;
    localStorage.setItem(STORE_KEY, JSON.stringify({ state: $('lw-state').value, stage: stage(), status: status(), contract: $('lw-contract').value, more: $('lw-more').checked, values }));
  } catch { /* private mode: nothing kept */ }
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null');
    if (!s || typeof s !== 'object') return;
    if (s.state) $('lw-state').value = s.state;
    pickOption('lw-stage', s.stage);
    pickOption('lw-pay', s.status);
    $('lw-contract').value = s.contract ?? '';
    $('lw-more').checked = !!s.more;
    for (const [key] of FIELDS) if (s.values?.[key]) $(`lw-f-${key}`).value = s.values[key];
  } catch { /* a bad saved copy is ignored */ }
}

// ---------- the answer ----------

function warningList(ws) {
  return ws.length ? h('ul', { class: 'lw-warnings' }, ws.map((w) => h('li', { class: w.code === 'unconditional_before_payment' ? 'lw-stop' : '' }, w.message))) : null;
}

// The form as first served (the worked example), so its answer says "Example".
let DEFAULTS = null;
const formNow = () => [$('lw-state').value, stage(), status(), $('lw-contract').value, $('lw-more').checked].join('|');

function showDecision(d) {
  const out = $('lw-out');
  out.textContent = '';
  $('lw-files').textContent = '';
  const example = formNow() === DEFAULTS;
  const type = `${d.waiverType === 'unconditional' ? 'Unconditional' : 'Conditional'} waiver, ${d.stage} payment`;
  const said = { not_received: 'not paid yet', check_received: 'a check not cleared yet', cleared: 'money cleared' }[d.paymentStatus] ?? '';
  const inputs = `${d.stateName}, ${d.stage} payment, ${said}${d.state === 'TX' && $('lw-contract').value ? `, prime contract signed ${new Date(`${$('lw-contract').value}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}` : ''}`;
  const src = d.sources?.[0];
  const line = (k, what, fig, em, cls) => h('li', { class: cls ?? null }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), h('b', {}, fig), h('em', {}, em)]);
  const items = [line('1', 'Waiver that matches', type, d.cite ? `${d.cite}` : 'Which waiver to sign only', 'hi')];
  if (d.coverage === 'covered') items.push(line('2', 'Statutory form', d.formTitle, d.statute ?? d.cite));
  if (d.coverage === 'covered') items.push(line('3', 'Notary', d.notaryRequired ? 'Required' : 'Not needed',
    d.formVersion === 'pre-2022' ? 'Original contract before January 1, 2022 (H.B. 2237)' : d.formVersion ? 'Original contract on or after January 1, 2022 (H.B. 2237)' : 'The state\'s form has no notary block', d.notaryRequired ? 'sk' : null));
  out.append(...[
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src' }, d.coverage === 'covered' ? `${d.stateName}: statutory form` : `${d.stateName}: no form made here`),
    ]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${inputs}` : inputs),
    h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, d.waiverType === 'unconditional' ? 'Unconditional' : 'Conditional'), h('span', {}, `waiver, ${d.stage} payment`)]),
    h('p', { class: 'tf-sub' }, d.explanation),
    warningList(d.warnings),
    h('ol', { class: 'tf-items lw-items' }, items),
    src ? h('p', { class: 'tf-cost' }, ['Source: ', h('a', { href: src.url }, src.text ?? src.name), '.']) : null,
  ].filter(Boolean));
  $('lw-override-row').hidden = !d.warnings.some((w) => w.code === 'unconditional_before_payment');
  $('lw-get').disabled = d.coverage !== 'covered' || d.blocked;
  $('lw-preview').disabled = d.coverage !== 'covered' || d.blocked;
}

async function update() {
  timer = null;
  const { base } = readForm();
  pendingQuote = null;
  $('lw-get').textContent = 'Make the waiver';
  try {
    if (!stateRules[base.state]) stateRules[base.state] = (await T.api(`/api/run/${SLUG}`, { body: { op: 'rules', state: base.state } })).result;
    const json = await T.api(`/api/run/${SLUG}`, { body: { op: 'decide', ...base } });
    lastDecision = json.result;
    showDecision(lastDecision);
    syncFields();
    $('lw-error').textContent = '';
  } catch (e) {
    showError(e);
  }
  save();
}
const soon = () => { if (timer) clearTimeout(timer); timer = setTimeout(update, 250); };

// ---------- files ----------

const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
const pdfLink = (pdf, text, quiet) => h('a', { href: URL.createObjectURL(new Blob([fromBase64(pdf.base64)], { type: 'application/pdf' })), download: pdf.filename, class: `btn btn-small${quiet ? ' btn-quiet' : ''}` }, text);

function showError(e) {
  const box = $('lw-error');
  const fields = e.fields ? Object.values(e.fields) : [];
  box.textContent = fields[0] ?? e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: T.signInHref() }, 'Sign in or create an account'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

async function preview() {
  const { base, payment, extra } = readForm();
  $('lw-error').textContent = '';
  try {
    const json = await T.run(SLUG, { op: 'preview', ...base, ...extra, ...(Object.keys(payment).length ? { payment } : {}) });
    const box = $('lw-files');
    box.textContent = '';
    box.append(h('p', { class: 'lw-downloads' }, [pdfLink(json.result.pdf, 'Download the preview (PDF)', true)]));
    if (json.result.blanks.length) box.append(h('p', { class: 'lw-aside' }, `Blank lines left: ${json.result.blanks.join(', ')}.`));
  } catch (e) {
    showError(e);
  }
}

async function getWaiver() {
  if (timer) { clearTimeout(timer); await update(); }
  const { base, payment, extra } = readForm();
  const input = { op: 'waiver', ...base, ...extra, payment };
  const button = $('lw-get');
  $('lw-error').textContent = '';
  button.disabled = true;
  try {
    const key = JSON.stringify(input);
    if (!pendingQuote || pendingQuote.key !== key) {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
      pendingQuote = { key, q };
      button.textContent = q.amount ? `Pay ${q.display} and download` : 'Download (no charge)';
      $('lw-get-note').textContent = q.detail ?? '';
      return;
    }
    const json = await T.run(SLUG, input);
    lastPaid = input;
    showWaiver(json);
    pendingQuote = null;
    button.textContent = 'Make the waiver';
  } catch (e) {
    showError(e);
  } finally {
    button.disabled = false;
  }
}

function showWaiver(json) {
  const r = json.result;
  const box = $('lw-files');
  box.textContent = '';
  box.append(
    h('p', { class: 'lw-heading' }, `Your ${r.waiver.type} waiver`),
    h('p', { class: 'lw-downloads' }, [pdfLink(r.pdf, 'Download the PDF')]),
    h('p', { class: 'lw-aside' }, `Payment ${r.paymentId}. Document hash ${r.documentHash.slice(0, 16)}. ${json.charged ? `Charged ${json.charged.display}.` : 'No charge.'}`),
  );
  if (r.waiver.type === 'conditional') {
    const date = h('input', { type: 'date', id: 'lw-cleared', 'aria-label': 'Date the payment cleared' });
    const go = h('button', { type: 'button', class: 'btn btn-small' }, 'Make the matching unconditional (no charge)');
    go.addEventListener('click', () => unconditional(date.value));
    box.append(h('div', { class: 'lw-next' }, [h('p', {}, 'When the check clears, come back for the unconditional waiver for this same payment. It is free for 180 days.'), h('label', { for: 'lw-cleared' }, 'Cleared on'), date, ' ', go]));
  }
}

async function unconditional(clearedOn) {
  if (!lastPaid || !clearedOn) { $('lw-error').textContent = 'Give the date the payment cleared.'; return; }
  const input = { op: 'unconditional', state: lastPaid.state, stage: lastPaid.stage, clearedOn, payment: lastPaid.payment };
  if (lastPaid.originalContractDate) input.originalContractDate = lastPaid.originalContractDate;
  if (lastPaid.signerEntity) input.signerEntity = lastPaid.signerEntity;
  try {
    showWaiver(await T.run(SLUG, input));
  } catch (e) {
    showError(e);
  }
}

// The sample near the price: the tool's own paid example, a made-up Texas job.
function sampleLinks(tool) {
  const box = $('lw-sample-links');
  const ex = tool.examples.find((x) => x.input.op === 'waiver');
  if (!box || !ex) return;
  box.textContent = '';
  box.append(pdfLink(ex.output.pdf, 'Sample waiver (PDF)', true));
}

// ---------- start ----------

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('lw-code'), SLUG);
  let tool;
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('lw-out').textContent = 'The states could not load. Reload the page to try again.';
    return;
  }
  rulesAll = tool.examples.find((x) => x.input.op === 'rules').output;
  sampleLinks(tool);
  const sel = $('lw-state');
  for (const s of rulesAll.states) sel.appendChild(h('option', { value: s.code }, s.coverage === 'covered' ? `${s.name} (statutory form)` : s.name));
  sel.value = 'TX';
  fieldInputs();
  DEFAULTS = formNow();
  load();
  // Links from the state pages carry ?state=TX&stage=progress&status=check_received.
  const q = new URLSearchParams(window.location.search);
  if (rulesAll.states.some((s) => s.code === q.get('state'))) sel.value = q.get('state');
  for (const [name, key] of [['stage', 'stage'], ['status', 'status']]) {
    if (q.get(key)) pickOption(name === 'stage' ? 'lw-stage' : 'lw-pay', q.get(key));
  }
  $('lw-form').addEventListener('input', soon);
  $('lw-form').addEventListener('change', soon);
  $('lw-form').addEventListener('submit', (ev) => { ev.preventDefault(); update(); });
  $('lw-get').addEventListener('click', getWaiver);
  $('lw-preview').addEventListener('click', preview);
  await update();
}

start();
