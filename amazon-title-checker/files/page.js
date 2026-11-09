// The Amazon title checker page. One title is counted in the browser as you type, with the same
// engine the server runs (core.js) and the rule set from the tool's published example, so it costs
// nothing and sends nothing. Many titles run on the server through Endwise.run, priced per title.
// The worked example at rest is the tool's first published example. Address parameters prefill
// the form: ?title=..., ?brand=..., ?media=1, ?tab=file.
import { makeEngine } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'amazon-title-checker';
const $ = (id) => document.getElementById(id);

let mode = 'one';
let signedIn = false;
let engine = null;
let limit = 75;
let atRest = '';

// ---------- one title, live ----------

function live() {
  if (!engine) return;
  const title = $('at-title').value.replace(/\r?\n/g, ' ');
  const r = engine.checkTitle(title, { brand: $('at-brand').value.trim(), media: $('at-media').checked });
  const bar = $('at-meter-bar');
  bar.style.width = `${Math.min(100, (r.length / limit) * 100)}%`;
  bar.className = r.over ? 'over' : r.length > limit * 0.9 ? 'near' : '';
  $('at-meter-text').textContent = r.media ? `${r.length} characters (media: no 75 limit)` : `${r.length} of ${limit} characters${r.over ? `, ${r.over} over` : `, ${limit - r.length} to spare`}`;
  if (mode === 'one') renderOne(r, { example: title === atRest });
}

function renderOne(r, { example = false } = {}) {
  const out = $('at-out');
  out.textContent = '';
  if (example) {
    out.appendChild(h('div', { class: 'dz-rh' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', { class: 'dz-wx' }, 'Worked example')]));
    out.appendChild(h('p', { class: 'dz-exin' }, 'Example: Amazon\'s own "before" title from its 2026 Engage post'));
  }
  out.appendChild(h('p', { class: 'dz-answer' }, r.verdict === 'ok' ? 'Breaks none of the published rules' : r.verdict === 'warn' ? 'Check it before you list' : 'Fix it before Amazon replaces it'));
  out.appendChild(h('ol', { class: 'dz-items' }, [
    h('li', {}, [h('b', {}, 'Characters'), h('span', {}, String(r.length)), h('small', {}, 'Counted as you see them, spaces and punctuation included')]),
    r.media ? null : h('li', { class: 'tot' }, [h('b', {}, r.over ? 'Over the limit' : 'To spare'), h('span', {}, r.over ? `+${r.over}` : String(limit - r.length)), h('small', {}, `Amazon: ${limit} characters or less from July 27, 2026`)]),
  ].filter(Boolean)));
  if (r.findings.length) out.appendChild(h('ul', { class: 'at-fixes' }, r.findings.map((f) => h('li', { class: `sev-${f.severity}` }, [f.message, ' ', h('span', { class: 'muted' }, f.fix)]))));
  else out.appendChild(h('p', {}, 'Breaks none of the published rules.'));
  if (r.cut) out.appendChild(splitBlock(r.cut));
  for (const n of r.notes) out.appendChild(h('p', { class: 'muted small' }, n));
}

function fig(big, label, tone) {
  return h('div', { class: `at-fig tone-${tone}` }, [h('span', { class: 'at-big' }, big), h('span', { class: 'at-label' }, label)]);
}

function splitBlock(cut) {
  return h('div', { class: 'at-split' }, [
    h('p', { class: 'at-label' }, 'A mechanical cut at the last whole word (not a rewrite)'),
    h('p', { class: 'at-cut' }, [h('span', { class: 'at-keep' }, cut.title), h('span', { class: 'muted small' }, ` ${cut.titleLength} characters`)]),
    h('p', { class: 'at-cut' }, [h('span', { class: 'at-spill' }, cut.overflow), h('span', { class: cut.fitsHighlights ? 'muted small' : 'at-bad small' }, ` ${cut.overflowLength} of 125 for Item Highlights${cut.fitsHighlights ? '' : ': too long for it as well'}`)]),
  ]);
}

// ---------- many titles, on the server ----------

function readForm() {
  if (mode === 'one') {
    const title = $('at-title').value.replace(/\r?\n/g, ' ');
    if (!title.trim()) return { errors: { error: 'Type a title.' } };
    const input = { op: 'check', titles: [title] };
    addOptions(input);
    return { input };
  }
  const csv = $('at-csv').value;
  if (!csv.trim()) return { errors: { csv: 'Paste titles or a CSV, or choose a file.' } };
  const input = { op: 'check', csv };
  addOptions(input);
  return { input };
}

function addOptions(input) {
  const brand = $('at-brand').value.trim();
  if (brand) input.brand = brand;
  if ($('at-media').checked) input.media = true;
}

function clearErrors() {
  for (const el of document.querySelectorAll('.at-form .field-error')) el.textContent = '';
}

function showError(e) {
  const fields = e.fields || {};
  if (fields.csv && mode === 'file') { $('at-csv-err').textContent = fields.csv; return; }
  const box = $('at-error');
  box.textContent = Object.values(fields)[0] || e.message;
  if (e.status === 401) box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in to check a file'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

function costNote(json) {
  if (json.charged && json.charged.amount) return `Charged ${json.charged.display}. Your balance is ${json.balance.display}.`;
  if (typeof json.freeRunsLeft === 'number') return `Free check. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'check' : 'checks'} left today.`;
  return 'Free.';
}

let quoteTimer = null;
function quoteSoon() {
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(async () => {
    const el = $('at-cost');
    if (mode === 'one') { el.textContent = ''; return; }
    const { input } = readForm();
    if (!input) { el.textContent = ''; return; }
    if (!signedIn) { el.textContent = 'Checking many titles needs an account: $0.002 per title for the first 5,000 in a month.'; return; }
    try {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
      el.textContent = q.amount ? `This costs ${q.display} from your balance.` : 'This check is free for you now.';
    } catch (e) {
      el.textContent = e.status === 400 ? '' : 'Checking many titles needs an account: $0.002 per title.';
    }
  }, 300);
}

const VERDICT = { ok: 'ok', warn: 'check', fail: 'fix' };

function download(name, body) {
  const blob = new Blob([body], { type: 'text/csv' });
  return h('a', { href: URL.createObjectURL(blob), download: name, class: 'at-dl' }, name);
}

function renderFile(r, { example = false, note = null } = {}) {
  const out = $('at-out');
  out.textContent = '';
  if (example) {
    out.appendChild(h('div', { class: 'dz-rh' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', { class: 'dz-wx' }, 'Worked example')]));
    out.appendChild(h('p', { class: 'dz-exin' }, `Example: ${example}`));
  }
  out.appendChild(h('p', { class: 'at-answer' }, r.answer));
  if (note) out.appendChild(h('p', { class: 'muted small' }, note));
  const s = r.summary;
  out.appendChild(h('div', { class: 'at-figures' }, [
    fig(String(s.titles), 'titles', 'plain'), fig(String(s.fail), 'to fix', s.fail ? 'bad' : 'good'),
    fig(String(s.long), 'over 75', s.long ? 'bad' : 'good'), fig(String(s.chars), 'banned character', s.chars ? 'bad' : 'good'),
    fig(String(s.repeat), 'word 3+ times', s.repeat ? 'bad' : 'good'), ...(s.brandCut ? [fig(String(s.brandCut), 'brand past 75', 'warn')] : []),
  ]));
  const rows = r.results.slice(0, 300);
  const table = h('table', { class: 'at-table' }, [
    h('thead', {}, h('tr', {}, ['Line', 'Title', 'Chars', 'Verdict', 'What to fix'].map((c) => h('th', {}, c)))),
    h('tbody', {}, rows.map((x) => h('tr', {}, [
      h('td', {}, String(x.line)),
      h('td', {}, [x.sku ? h('b', {}, `${x.sku} `) : null, x.title, x.cut ? splitBlock(x.cut) : null]),
      h('td', { class: 'num' }, x.media ? `${x.length} (media)` : x.over ? `${x.length} (+${x.over})` : String(x.length)),
      h('td', {}, h('span', { class: `at-verdict v-${x.verdict}` }, VERDICT[x.verdict])),
      h('td', {}, x.findings.length ? h('ul', { class: 'at-fixes' }, x.findings.map((f) => h('li', { class: `sev-${f.severity}` }, f.message))) : 'Nothing.'),
    ]))),
  ]);
  out.appendChild(h('div', { class: 'at-table-wrap' }, table));
  if (r.results.length > rows.length) out.appendChild(h('p', { class: 'muted small' }, `The first ${rows.length} titles are shown; the fix list has all ${r.results.length}.`));
  out.appendChild(h('p', { class: 'at-downloads' }, ['Download: ', download('amazon-title-fix-list.csv', r.fixCsv), '.']));
  const used = Object.keys(r.columnsUsed || {});
  if (used.length) out.appendChild(h('p', { class: 'muted small' }, `Columns read: ${used.join(', ')}.`));
}

async function onSubmit(ev) {
  ev.preventDefault();
  clearErrors();
  const { input, errors } = readForm();
  if (errors) { if (errors.csv) $('at-csv-err').textContent = errors.csv; else $('at-error').textContent = errors.error; return; }
  $('at-status').textContent = 'Checking.';
  try {
    const json = await T.run(SLUG, input);
    renderFile(json.result, { note: costNote(json) });
    $('at-status').textContent = 'Done.';
  } catch (e) {
    showError(e);
    $('at-status').textContent = '';
  }
}

function setMode(next) {
  mode = next;
  $('at-tab-one').setAttribute('aria-selected', String(next === 'one'));
  $('at-tab-file').setAttribute('aria-selected', String(next === 'file'));
  $('at-one').hidden = next !== 'one';
  $('at-file').hidden = next !== 'file';
  $('at-run').textContent = next === 'one' ? 'Check on the server (free)' : 'Check the titles';
  if (next === 'one') live();
  quoteSoon();
}

function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (q.get('title')) $('at-title').value = q.get('title');
  if (q.get('brand')) $('at-brand').value = q.get('brand');
  if (q.get('media') === '1') $('at-media').checked = true;
  if (q.get('tab') === 'file') setMode('file');
}

async function start() {
  atRest = $('at-title').value;
  $('at-tab-one').addEventListener('click', () => setMode('one'));
  $('at-tab-file').addEventListener('click', () => setMode('file'));
  $('at-title').addEventListener('input', live);
  $('at-brand').addEventListener('input', () => { live(); quoteSoon(); });
  $('at-media').addEventListener('change', () => { live(); quoteSoon(); });
  $('at-csv').addEventListener('input', quoteSoon);
  $('at-upload').addEventListener('change', async () => {
    const file = $('at-upload').files[0];
    if (!file) return;
    if (file.size > 2_900_000) { $('at-csv-err').textContent = 'That file is over 2.9 MB; split it into smaller files.'; return; }
    $('at-csv').value = await file.text();
    quoteSoon();
  });
  $('at-form').addEventListener('submit', onSubmit);
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('at-code'), SLUG);
  T.me().then((account) => { signedIn = !!account; quoteSoon(); }).catch(() => {});
  try {
    const tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
    const rules = tool.examples.find((x) => x.input.op === 'rules').output;
    limit = rules.titleLimit;
    engine = makeEngine({ rules, exemptWords: rules.exemptWords, quotes: rules.quotes, sources: rules.sources });
    $('at-csv').value = tool.examples[0].input.csv;
    fromQuery();
    if (mode === 'file') renderFile(tool.examples[0].output, { example: `${tool.examples[0].output.summary.titles} listings from a made-up kitchen brand's flat file`, note: 'A made-up kitchen brand\'s flat file. Press "Check the titles" to run it, or paste your own.' });
    else live();
  } catch {
    fromQuery();
    $('at-out').textContent = 'The rules could not load. The checker still works: press the button to check on the server.';
  }
  quoteSoon();
}

start();
