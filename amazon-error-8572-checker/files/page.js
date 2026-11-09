// The Amazon Error 8572 checker page. Every check runs on the server through Endwise.run: one code
// is free here, a file is priced per code, a letter once per licensee and brand, the cost planner
// is free. The worked examples at rest are the tool's own published examples. Address parameters
// prefill the forms: ?gtin=&brand=&licensee=&prefix=&role=, ?tab=file, ?items=&years= for the cost
// planner, ?letter=1 to jump to the letter.

const T = window.Endwise;
const h = T.h;
const SLUG = 'amazon-error-8572-checker';
const $ = (id) => document.getElementById(id);

let mode = 'one';
let signedIn = false;

// ---------- the checker ----------

function readForm() {
  const role = $('ae-role').value;
  if (mode === 'one') {
    const row = { gtin: $('ae-gtin').value.trim() };
    for (const [id, key] of [['ae-brand', 'brand'], ['ae-licensee', 'licensee'], ['ae-prefix', 'companyPrefix']]) {
      const v = $(id).value.trim();
      if (v) row[key] = v;
    }
    if (!row.gtin) return { errors: { error: 'Type the UPC, EAN or GTIN.' } };
    return { input: { op: 'check', rows: [row], role } };
  }
  const csv = $('ae-csv').value;
  if (!csv.trim()) return { errors: { csv: 'Paste a CSV or choose a file.' } };
  const input = { op: 'check', csv, role };
  const defaults = {};
  if ($('ae-d-licensee').value.trim()) defaults.licensee = $('ae-d-licensee').value.trim();
  if ($('ae-d-prefix').value.trim()) defaults.companyPrefix = $('ae-d-prefix').value.trim();
  if (Object.keys(defaults).length) input.defaults = defaults;
  return { input };
}

function costNote(json) {
  if (json.charged) return `Charged ${json.charged.display}. Your balance is ${json.balance.display}.`;
  if (typeof json.freeRunsLeft === 'number') return `Free check. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'check' : 'checks'} left today.`;
  return null;
}

function showError(e, box) {
  const fields = e.fields || {};
  if (fields.csv && mode === 'file' && box === $('ae-error')) { $('ae-csv-err').textContent = fields.csv; return; }
  box.textContent = Object.values(fields)[0] || e.message;
  if (e.status === 401) box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in to continue'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

let quoteTimer = null;
function quoteSoon() {
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(async () => {
    const el = $('ae-cost');
    if (mode === 'one') { el.textContent = ''; return; }
    const { input } = readForm();
    if (!input) { el.textContent = ''; return; }
    if (!signedIn) { el.textContent = 'Checking a file needs an account: $0.001 per code, at most $4.99 a month.'; return; }
    try {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
      el.textContent = q.amount ? `This file costs ${q.display} from your balance.` : 'This check is free for you now.';
    } catch (e) {
      el.textContent = e.status === 401 ? 'Checking a file needs an account: $0.001 per code.' : '';
    }
  }, 300);
}

const VERDICT = { pass: 'nothing found', review: 'review', fail: 'fix first' };

function download(name, body) {
  const blob = new Blob([body], { type: 'text/csv' });
  return h('a', { href: URL.createObjectURL(blob), download: name, class: 'ae-dl' }, name);
}

function render(r, { example = false, note = null } = {}) {
  const out = $('ae-out');
  out.textContent = '';
  if (example) {
    out.appendChild(h('div', { class: 'dz-rh' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', { class: 'dz-wx' }, 'Worked example')]));
    out.appendChild(h('p', { class: 'dz-exin' }, `Example: ${example}`));
  }
  out.appendChild(h('p', { class: 'ae-answer' }, r.answer));
  if (note) out.appendChild(h('p', { class: 'muted small' }, note));
  const s = r.summary;
  if (r.results.length > 1) {
    out.appendChild(h('div', { class: 'ae-figures' }, [['codes', s.codes], ['fix first', s.fail], ['review', s.review], ['nothing found', s.pass]]
      .map(([k, v]) => h('div', { class: `ae-fig ae-fig-${k.replace(/\s+/g, '-')}` }, [h('span', { class: 'ae-big' }, String(v)), h('span', { class: 'ae-label' }, k)]))));
  }
  const rows = r.results.slice(0, 200);
  out.appendChild(h('div', { class: 'ae-table-wrap' }, h('table', { class: 'ae-table' }, [
    h('thead', {}, h('tr', {}, ['Line', 'Code', 'Verdict', 'What to fix'].map((c) => h('th', {}, c)))),
    h('tbody', {}, rows.map((x) => h('tr', { class: `v-${x.verdict}` }, [
      h('td', {}, String(x.line)),
      h('td', {}, [h('b', { class: 'ae-mono' }, x.gtin || '(empty)'), x.sku ? h('div', { class: 'muted small' }, x.sku) : null, x.gs1Prefix ? h('div', { class: 'muted small' }, `GS1 Prefix ${x.gs1Prefix}: ${x.prefixClass.label}`) : null]),
      h('td', {}, h('span', { class: `ae-verdict v-${x.verdict}` }, VERDICT[x.verdict])),
      h('td', {}, x.findings.length ? h('ul', { class: 'ae-fixes' }, x.findings.map((f) => h('li', { class: `sev-${f.severity}` }, [f.text, ' ', h('span', { class: 'ae-fix' }, f.fix)]))) : 'Check digit valid, a product GS1 Prefix, and the names agree.'),
    ]))),
  ])));
  if (r.results.length > rows.length) out.appendChild(h('p', { class: 'muted small' }, `The first ${rows.length} rows are shown; the fix list has all ${r.results.length}.`));
  if (r.results.length > 1) out.appendChild(h('p', { class: 'ae-downloads' }, ['Download: ', download('8572-fix-list.csv', r.fixCsv), '.']));
  const d = r.documents;
  out.appendChild(h('details', { class: 'ae-docs', open: r.summary.fail || r.summary.review ? '' : null }, [
    h('summary', {}, 'What Amazon\'s Error 8572 help asks you to send'),
    h('ul', {}, [...d.all.map((x) => h('li', {}, x)), h('li', {}, d.forRole), h('li', {}, d.wait)]),
    h('p', { class: 'muted small' }, `Amazon's help: "${d.thirdParty}"`),
  ]));
}

async function onSubmit(ev) {
  ev.preventDefault();
  for (const el of document.querySelectorAll('.ae-form .field-error')) el.textContent = '';
  const { input, errors } = readForm();
  if (errors) { if (errors.csv) $('ae-csv-err').textContent = errors.csv; else $('ae-error').textContent = errors.error; return; }
  $('ae-status').textContent = 'Checking.';
  try {
    const json = await T.run(SLUG, input);
    render(json.result, { note: costNote(json) });
    $('ae-status').textContent = 'Done.';
  } catch (e) {
    showError(e, $('ae-error'));
    $('ae-status').textContent = '';
  }
}

function setMode(next) {
  mode = next;
  $('ae-tab-one').setAttribute('aria-selected', String(next === 'one'));
  $('ae-tab-file').setAttribute('aria-selected', String(next === 'file'));
  $('ae-one').hidden = next !== 'one';
  $('ae-file').hidden = next !== 'file';
  $('ae-run').textContent = next === 'one' ? 'Check this code' : 'Check the file';
  quoteSoon();
}

// ---------- the letter ----------

function renderLetter(r, note) {
  const out = $('ae-l-out');
  out.textContent = '';
  out.appendChild(h('p', { class: 'ae-answer' }, r.answer));
  if (note) out.appendChild(h('p', { class: 'muted small' }, note));
  const status = h('span', { class: 'muted small' });
  const pre = h('pre', { class: 'ae-letter-text' }, r.text);
  out.appendChild(pre);
  out.appendChild(h('p', {}, [h('button', { type: 'button', class: 'btn btn-ghost', onclick: () => T.copy(r.text, pre, status) }, 'Copy the letter'), ' ', status]));
  out.appendChild(h('h3', {}, 'Amazon\'s checks, and how this letter meets them'));
  out.appendChild(h('ul', {}, r.checks.map((c) => h('li', {}, [h('b', {}, c.component), `: ${c.how}`]))));
  out.appendChild(h('p', { class: 'muted small' }, `Formats Amazon's help accepts: ${r.formats.join('; ')}.`));
}

async function onLetter(ev) {
  if (ev) ev.preventDefault();
  $('ae-l-error').textContent = '';
  const v = (id) => $(id).value.trim();
  const input = {
    op: 'letter', licensee: v('ae-l-licensee'), brand: v('ae-l-brand'),
    gtins: v('ae-l-gtins').split(/[\s,;]+/).filter(Boolean),
    issuer: { name: v('ae-l-name') }, date: v('ae-l-date'),
  };
  if (v('ae-l-title')) input.issuer.title = v('ae-l-title');
  if (v('ae-l-email')) input.issuer.email = v('ae-l-email');
  if (v('ae-l-rel')) input.relationship = v('ae-l-rel');
  if (v('ae-l-prefix')) input.companyPrefix = v('ae-l-prefix');
  if (v('ae-l-seller')) input.seller = v('ae-l-seller');
  try {
    const json = await T.run(SLUG, input);
    renderLetter(json.result, costNote(json));
  } catch (e) {
    showError(e, $('ae-l-error'));
  }
}

// ---------- the cost planner ----------

const usd = (n) => `$${n.toLocaleString('en-US')}`;
function renderCost(r) {
  const out = $('ae-c-out');
  out.textContent = '';
  out.appendChild(h('p', { class: 'ae-answer' }, r.answer));
  out.appendChild(h('div', { class: 'ae-table-wrap' }, h('table', { class: 'ae-table ae-ctable' }, [
    h('thead', {}, h('tr', {}, ['Option', 'Up front', 'Each later year', `Total, ${r.years} year${r.years === 1 ? '' : 's'}`].map((c) => h('th', {}, c)))),
    h('tbody', {}, [r.best, ...r.options.filter((o) => o.plan !== r.best.plan)].map((o, i) => h('tr', { class: i === 0 ? 'v-pass' : '' }, [h('td', {}, i === 0 ? [h('b', {}, o.plan), ' (cheapest)'] : o.plan), h('td', {}, usd(o.initial)), h('td', {}, usd(o.renewal)), h('td', {}, usd(o.total))]))),
  ])));
  out.appendChild(h('p', { class: 'muted small' }, r.note));
}

async function onCost(ev) {
  if (ev) ev.preventDefault();
  try {
    renderCost((await T.run(SLUG, { op: 'cost', items: Number($('ae-c-items').value), years: Number($('ae-c-years').value) })).result);
  } catch (e) {
    $('ae-c-out').textContent = (e.fields && Object.values(e.fields)[0]) || e.message;
  }
}

// ---------- start ----------

function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const set = (id, key) => { if (q.get(key) !== null) $(id).value = q.get(key); };
  set('ae-gtin', 'gtin'); set('ae-brand', 'brand'); set('ae-licensee', 'licensee'); set('ae-prefix', 'prefix');
  set('ae-c-items', 'items'); set('ae-c-years', 'years');
  const role = q.get('role');
  if (role && [...$('ae-role').options].some((o) => o.value === role)) $('ae-role').value = role;
  if (q.get('tab') === 'file') setMode('file');
  if (q.get('letter')) $('letter').scrollIntoView();
  return q.get('gtin') !== null;
}

async function start() {
  $('ae-tab-one').addEventListener('click', () => setMode('one'));
  $('ae-tab-file').addEventListener('click', () => setMode('file'));
  $('ae-csv').addEventListener('input', quoteSoon);
  $('ae-upload').addEventListener('change', async () => {
    const file = $('ae-upload').files[0];
    if (!file) return;
    if (file.size > 1_400_000) { $('ae-csv-err').textContent = 'That file is over 1.4 MB; split it into smaller files.'; return; }
    $('ae-csv').value = await file.text();
    quoteSoon();
  });
  $('ae-form').addEventListener('submit', onSubmit);
  $('ae-letter-form').addEventListener('submit', onLetter);
  $('ae-cost-form').addEventListener('submit', onCost);
  $('ae-l-date').value = new Date().toISOString().slice(0, 10);
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('ae-code'), SLUG);
  T.me().then((account) => { signedIn = !!account; quoteSoon(); }).catch(() => {});
  const prefilled = fromQuery();
  try {
    const tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
    const [file, , letter, cost] = tool.examples;
    $('ae-csv').value = file.input.csv;
    $('ae-d-prefix').value = file.input.defaults.companyPrefix;
    if (prefilled) await onSubmit(new Event('submit'));
    else render(file.output, { example: `a ${file.output.summary.codes}-code upload file for ${file.output.results[0]?.licensee ?? 'one brand'}, checked against its GS1 prefix ${file.input.defaults.companyPrefix}`, note: 'A made-up brand\'s upload file. Press "Check this code" for one code free, or open "A file" to run your own.' });
    renderLetter(letter.output, 'Worked example. Writing a letter needs an account.');
    if (new URLSearchParams(window.location.search).get('items')) await onCost();
    else renderCost(cost.output);
  } catch {
    $('ae-out').textContent = 'The worked example could not load. The checker still works: type a code and press the button.';
  }
  quoteSoon();
  // A link to #cost opens the GS1 US cost tab.
  if (window.location.hash === '#cost') $('ae-tab-cost')?.click();
}

start();
