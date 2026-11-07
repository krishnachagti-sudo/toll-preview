// The SPF lookup counter page. A real count needs DNS, so it always comes from the server through
// Endwise.run. The worked example at rest is the tool's first published example (its DNS was
// recorded on the date it shows). The macro explainer runs core.js in the browser: no DNS, no charge.
import { explainMacro } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'spf-lookup-counter';
const $ = (id) => document.getElementById(id);
const words = (s) => s.trim().split(/\s+/).filter(Boolean);

// ---------- the form ----------

function readForm() {
  const input = { op: 'check', domain: $('spf-domain').value.trim() };
  const errors = {};
  if (!input.domain) errors.domain = 'Enter a domain like example.com.';
  const record = $('spf-record').value.trim();
  const add = words($('spf-add').value);
  const remove = words($('spf-remove').value);
  if (record) input.record = record;
  if (add.length) input.add = add;
  if (remove.length) input.remove = remove;
  const ip = $('spf-ip').value.trim();
  const sender = $('spf-from').value.trim();
  const helo = $('spf-helo').value.trim();
  if (ip) input.ip = ip;
  if (sender) input.sender = sender;
  if (helo) input.helo = helo;
  return Object.keys(errors).length ? { errors } : { input };
}

function clearErrors() {
  for (const el of document.querySelectorAll('.spf-form .field-error')) el.textContent = '';
}

const FIELD_BOX = { domain: 'spf-domain-err', ip: 'spf-ip-err', sender: 'spf-sender-err', record: 'spf-record-err', add: 'spf-add-err' };
function showFieldErrors(fields) {
  let shown = false;
  for (const [k, msg] of Object.entries(fields)) {
    const box = $(FIELD_BOX[k.split('.')[0]]);
    if (box) { box.textContent = msg; shown = true; }
  }
  return shown;
}

function showError(e) {
  if (showFieldErrors(e.fields || {})) return;
  const box = $('spf-error');
  box.textContent = e.message;
  if (e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

function costNote(json) {
  if (json.charged) return `Charged ${json.charged.display}. Your balance is ${json.balance.display}.`;
  if (typeof json.freeRunsLeft === 'number') return `Free check. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'check' : 'checks'} left today.`;
  return null;
}

// ---------- the result ----------

const STATUS_WORDS = { ok: '', void: 'void', none: 'no record', depends: 'depends on sender', error: 'error', refused: 'not queried', temperror: 'DNS error', loop: 'loop', ignored: 'ignored', 'not-walked': 'not walked', multiple: 'two records', syntax: 'syntax error' };

function termRow(e) {
  const badge = e.counted ? h('span', { class: `spf-n${e.n > 10 ? ' over' : ''}`, title: `Lookup ${e.n}` }, String(e.n)) : h('span', { class: 'spf-n free' }, '0');
  const st = STATUS_WORDS[e.status] ?? '';
  const li = h('li', { class: `spf-term st-${e.status ?? 'ok'}` }, [
    h('div', { class: 'spf-term-line' }, [
      badge,
      h('code', {}, e.term),
      e.cost > 1 ? h('span', { class: 'spf-cost' }, `costs ${e.cost}`) : null,
      st ? h('span', { class: 'spf-tag' }, st) : null,
    ]),
    e.note ? h('p', { class: 'spf-note' }, e.note) : null,
  ]);
  if (e.child) li.appendChild(treeNode(e.child));
  return li;
}

function treeNode(node) {
  const wrap = h('div', { class: 'spf-node' }, [
    h('p', { class: 'spf-node-head' }, [h('b', {}, node.domain), node.cost !== undefined ? ` (${node.cost} inside)` : '']),
  ]);
  if (node.terms?.length) wrap.appendChild(h('ol', { class: 'spf-terms' }, node.terms.map(termRow)));
  else if (node.note) wrap.appendChild(h('p', { class: 'spf-note' }, node.note));
  return wrap;
}

function gauge(r) {
  const cells = [];
  const n = Math.min(r.lookups, 14);
  for (let i = 1; i <= Math.max(10, n); i++) cells.push(h('span', { class: `cell${i <= r.lookups ? ' on' : ''}${i > 10 ? ' over' : ''}` }));
  return h('div', { class: 'spf-gauge', role: 'img', 'aria-label': `${r.lookups} of 10 lookups` }, cells);
}

function list(title, items, cls) {
  if (!items?.length) return null;
  return h('div', { class: `spf-list ${cls}` }, [h('h3', {}, title), h('ul', {}, items)]);
}

function render(r, { kind, note }) {
  const out = $('spf-out');
  out.textContent = '';
  if (kind === 'example') out.appendChild(h('p', { class: 'spf-label' }, 'Worked example'));
  out.appendChild(h('p', { class: 'spf-answer' }, r.answer));
  if (r.tree) {
    out.appendChild(h('div', { class: 'spf-figures' }, [
      h('div', {}, [h('span', { class: `spf-big${r.lookups > 10 ? ' over' : ''}` }, `${r.lookupsComplete ? '' : '>'}${r.lookups}`), h('span', { class: 'muted' }, ' of 10 lookups')]),
      h('div', {}, [h('span', { class: `spf-big${r.voidLookups > 2 ? ' over' : ''}` }, String(r.voidLookups)), h('span', { class: 'muted' }, ' of 2 void')]),
      h('div', {}, [h('span', { class: `spf-verdict v-${r.verdict}` }, r.verdict === 'ok' ? 'No permerror' : r.verdict)]),
    ]));
    out.appendChild(gauge(r));
  }
  if (r.path) {
    out.appendChild(h('div', { class: 'spf-path' }, [
      h('h3', {}, `For ${r.path.ip}: ${r.path.result}`),
      h('p', {}, r.path.matched
        ? `Matched "${r.path.matched.term}" in ${r.path.matched.domain} after ${r.path.lookups} ${r.path.lookups === 1 ? 'lookup' : 'lookups'}.`
        : `${r.path.reason ?? ''} (${r.path.lookups ?? 0} lookups).`),
    ]));
  }
  out.appendChild(list('Errors', r.errors.map((e) => h('li', {}, e.message)), 'errors') ?? h('span'));
  out.appendChild(list('Warnings', r.warnings.map((e) => h('li', {}, e.message)), 'warnings') ?? h('span'));
  out.appendChild(list('Ways to save lookups', r.suggestions.map((s) => h('li', {}, `${s.action}: saves ${s.saves}. ${s.why[0].toUpperCase()}${s.why.slice(1)}.`)), 'tips') ?? h('span'));
  if (r.record) out.appendChild(h('div', { class: 'spf-record' }, [h('h3', {}, r.source === 'draft' ? 'Draft record' : 'Record'), h('code', {}, r.record), r.recordNote ? h('p', { class: 'spf-note' }, r.recordNote) : null]));
  if (r.tree) out.appendChild(h('div', { class: 'spf-tree' }, [h('h3', {}, 'Every term, in the order a receiver reaches it'), treeNode(r.tree)]));
  out.appendChild(h('p', { class: 'muted small' }, `DNS: ${r.dns.resolver}, ${r.dns.queries} queries, ${r.dns.checkedAt.replace('T', ' ').slice(0, 19)} UTC.${note ? ` ${note}` : ''}`));
}

async function onSubmit(ev) {
  ev.preventDefault();
  clearErrors();
  $('spf-error').textContent = '';
  const read = readForm();
  if (read.errors) { showFieldErrors(read.errors); return; }
  const button = $('spf-run');
  button.disabled = true;
  $('spf-status').textContent = 'Counting.';
  try {
    const json = await T.run(SLUG, read.input);
    render(json.result, { kind: 'run', note: costNote(json) });
    $('spf-status').textContent = 'Done.';
  } catch (e) {
    showError(e);
  } finally {
    button.disabled = false;
  }
}

// ---------- macros (in the browser) ----------

function onMacro(ev) {
  ev?.preventDefault();
  const box = $('spf-macro-out');
  box.textContent = '';
  try {
    const r = explainMacro({ macro: $('m-macro').value, domain: $('m-domain').value.trim() || undefined, ip: $('m-ip').value.trim() || undefined, sender: $('m-sender').value.trim() || undefined });
    box.append(
      h('p', { class: 'spf-answer' }, [h('code', {}, r.macro), ' becomes ', h('code', {}, r.expansion)]),
      h('table', { class: 'spf-steps' }, [
        h('thead', {}, h('tr', {}, [h('th', {}, 'Macro'), h('th', {}, 'Means'), h('th', {}, 'Value'), h('th', {}, 'Becomes')])),
        h('tbody', {}, r.steps.map((s) => h('tr', {}, [h('td', {}, h('code', {}, s.macro)), h('td', {}, s.meaning), h('td', {}, h('code', {}, s.from)), h('td', {}, h('code', {}, s.becomes))]))),
      ]),
      r.note ? h('p', { class: 'spf-note' }, r.note) : h('span'),
    );
  } catch (e) {
    box.append(h('p', { class: 'field-error' }, e.message));
  }
}

// ---------- from the address ----------

// Links from the guides carry ?domain=&add=&record=&ip= (and run=1 when the visitor pressed the
// button), or ?macro=&mdomain=&mip=&msender= for the explainer.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  if (q.has('macro')) {
    $('m-macro').value = q.get('macro');
    if (q.has('mdomain')) $('m-domain').value = q.get('mdomain');
    if (q.has('mip')) $('m-ip').value = q.get('mip');
    if (q.has('msender')) $('m-sender').value = q.get('msender');
    onMacro();
    $('macro').scrollIntoView();
  }
  if (!q.has('domain')) return false;
  $('spf-domain').value = q.get('domain');
  for (const [key, id, box] of [['add', 'spf-add', 'spf-whatif'], ['remove', 'spf-remove', 'spf-whatif'], ['record', 'spf-record', 'spf-whatif'], ['ip', 'spf-ip', 'spf-sender'], ['sender', 'spf-from', 'spf-sender'], ['helo', 'spf-helo', 'spf-sender']]) {
    if (q.get(key)) { $(id).value = q.get(key); $(box).open = true; }
  }
  return q.get('run') === '1';
}

async function start() {
  $('spf-form').addEventListener('submit', onSubmit);
  $('spf-macro-form').addEventListener('submit', onMacro);
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('spf-code'), SLUG);
  onMacro();
  const runNow = fromQuery();
  if (runNow) { $('spf-form').requestSubmit(); return; }
  try {
    const tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
    const ex = tool.examples[0];
    render(ex.output, { kind: 'example', note: `Recorded DNS for ${ex.input.domain}; press "Count the lookups" for today's answer.` });
  } catch {
    $('spf-out').textContent = 'The worked example could not load. The counter still works: enter a domain and press the button.';
  }
}

start();
