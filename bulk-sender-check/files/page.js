// The bulk sender check page. A real check needs DNS and the DKIM verifier, so it always runs on
// the server through Endwise.run. The worked examples come from the free "sample" action: real
// signed messages on documentation domains, with the report the engine made on recorded DNS.
// A message is never put in the address bar: links from the guides carry only ?example=<id>.
const T = window.Endwise;
const h = T.h;
const SLUG = 'bulk-sender-check';
const MAX = 150_000;
const $ = (id) => document.getElementById(id);

const STATUS = { pass: 'Pass', fail: 'Fail', warn: 'Check', unknown: 'Unknown', 'n/a': 'Not required', 'not-checkable': 'Not in one message' };
const badge = (s) => h('span', { class: `bsc-badge s-${s.replace('/', '')}` }, STATUS[s] ?? s);

// ---------- input ----------

let fileNote = null;

// A file is read as bytes: UTF-8 when it is valid UTF-8, otherwise byte for byte (Latin-1), so the
// server can rebuild the exact bytes the DKIM body hash was made from.
async function readFile(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch {
    text = '';
    for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  }
  fileNote = null;
  if (text.length > MAX) {
    const end = text.search(/\r?\n\r?\n/);
    text = end > 0 ? text.slice(0, end) : text.slice(0, MAX);
    fileNote = `The file is longer than ${MAX.toLocaleString('en-US')} characters, so only its headers were sent; the body hash and the body link are not checked.`;
  }
  $('bsc-eml').value = text;
}

function readForm() {
  const eml = $('bsc-eml').value;
  if (!eml.trim()) return { errors: { eml: 'Paste the raw message, or open an .eml file.' } };
  if (eml.length > MAX) return { errors: { eml: `The message is ${eml.length.toLocaleString('en-US')} characters; the limit is ${MAX.toLocaleString('en-US')}. Paste the headers and the start of the body.` } };
  return { input: { op: 'check', eml, messageType: $('bsc-type').value, dns: $('bsc-dns').checked } };
}

function clearErrors() { for (const el of document.querySelectorAll('.bsc-form .field-error')) el.textContent = ''; }

function showError(e) {
  if (e.fields?.eml) { $('bsc-eml-err').textContent = e.fields.eml; return; }
  const box = $('bsc-error');
  box.textContent = e.message;
  if (e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

function costNote(json) {
  if (json.charged?.amount) return `Charged ${json.charged.display}. Your balance is ${json.balance.display}.`;
  if (typeof json.freeRunsLeft === 'number') return `Free check. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'check' : 'checks'} left today.`;
  return null;
}

// ---------- the report ----------

function providerCard(p) {
  return h('section', { class: 'bsc-card' }, [
    h('h3', {}, p.name),
    h('p', { class: 'bsc-scope' }, p.scope),
    ...p.audiences.map((a) => h('div', { class: 'bsc-aud' }, [
      h('p', { class: 'bsc-aud-head' }, [
        h('b', {}, a.label),
        h('span', { class: `bsc-score${a.failed ? ' bad' : ''}` }, `${a.passed} of ${a.checked} pass`),
      ]),
      h('ul', { class: 'bsc-rows' }, a.rows.map((r) => h('li', {}, [
        badge(r.status),
        h('span', { class: 'bsc-rule' }, [
          r.text,
          r.level === 'recommended' ? h('span', { class: 'bsc-tag' }, ' recommended') : null,
          r.codes.length && r.status === 'fail' ? h('span', { class: 'bsc-tag' }, ` bounce: ${r.codes.join(', ')}`) : null,
        ]),
        h('a', { class: 'bsc-src', href: r.source, title: r.quote, rel: 'noopener' }, 'source'),
      ]))),
    ])),
  ]);
}

function sigTable(sigs) {
  if (!sigs?.length) return null;
  return h('div', { class: 'bsc-scroll' }, h('table', { class: 'bsc-table' }, [
    h('thead', {}, h('tr', {}, ['Signer (d=)', 'Selector', 'Receiver', 'Our check', 'Key', 'Aligned'].map((x) => h('th', {}, x)))),
    h('tbody', {}, sigs.map((s) => h('tr', {}, [
      h('td', {}, h('code', {}, s.d || '?')), h('td', {}, h('code', {}, s.s || '?')),
      h('td', {}, s.receiver ?? 'none'), h('td', { title: s.oursWhy ?? '' }, s.ours ?? 'not checked'),
      h('td', {}, s.bits ? `${s.bits}-bit ${s.keyType === 'ed25519' ? 'Ed25519' : 'RSA'}` : 'unknown'), h('td', {}, s.aligned ? 'yes' : 'no'),
    ]))),
  ]));
}

const MARK = { pass: '✓', fail: '×', warn: '!', unknown: '?', 'n/a': '–', 'not-checkable': '–' };
const ITEM_CLASS = { pass: 'p-pass', fail: 'sk', warn: 'p-warn', unknown: 'dim', 'n/a': 'dim', 'not-checkable': 'dim' };

// Which providers' rules each check feeds, from the verdicts: { checkId: ['Gmail', 'Yahoo'] }.
function rulesByCheck(verdicts) {
  const out = {};
  for (const p of verdicts) {
    const short = p.name.replace(/ \(.*\)$/, '');
    for (const a of p.audiences) for (const r of a.rows) for (const id of r.checks ?? []) {
      out[id] ??= [];
      if (!out[id].includes(short)) out[id].push(short);
    }
  }
  return out;
}

// One line per check: pass or fail, the providers whose rule it is, what was found, and the fix.
function checkItem(c, who) {
  const extra = [];
  if (c.id === 'dkim') extra.push(sigTable(c.signatures));
  if (c.id === 'one-click' && c.steps?.length) extra.push(h('ul', { class: 'bsc-steps' }, c.steps.map((s) => h('li', { class: s.ok ? 'ok' : 'no' }, s.text))));
  if (c.id === 'format') for (const e of [...(c.errors ?? []).slice(1), ...(c.warnings ?? [])]) extra.push(h('p', { class: 'bsc-note' }, e.text));
  if (c.note) extra.push(h('p', { class: 'bsc-note' }, c.note));
  return h('li', { class: `bsc-item s-${c.status.replace('/', '')} ${ITEM_CLASS[c.status] ?? ''}` }, [
    h('span', { class: 'k', 'aria-hidden': 'true' }, MARK[c.status] ?? '?'),
    h('span', {}, c.name.charAt(0).toUpperCase() + c.name.slice(1)),
    badge(c.status),
    h('em', {}, [who?.length ? h('span', { class: 'bsc-who' }, `${who.join(', ')} · `) : null, c.summary]),
    c.fix ? h('p', { class: 'bsc-fix' }, [h('b', {}, 'Fix: '), c.fix]) : null,
    extra.length ? h('details', { class: 'bsc-more' }, [h('summary', {}, 'Details'), ...extra]) : null,
  ]);
}

// The inputs in one line: the kind of message, its From: domain and the receiver it reached.
function inputsLine(r) {
  const m = r.message;
  return `a ${r.messageType ?? 'marketing'} message from ${m.fromDomain ?? 'no From: domain'}${m.receiver?.authserv ? `, as received by ${m.receiver.authserv}` : ''}`;
}

function render(r, { kind, note, more } = {}) {
  const out = $('bsc-out');
  out.textContent = '';
  const m = r.message;
  const who = rulesByCheck(r.verdicts);
  const failed = r.checks.filter((c) => c.status === 'fail').length;
  // Each provider's score on its strictest audience (the last one: bulk senders).
  const scores = r.verdicts.map((p) => { const a = p.audiences[p.audiences.length - 1]; return `${p.name.replace(/ \(.*\)$/, '')} ${a.passed} of ${a.checked}`; });
  out.append(
    h('div', { class: 'tf-rh' }, [
      kind === 'example' ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src' }, m.receiver?.authserv ? `Received by ${m.receiver.authserv}` : 'No Authentication-Results'),
    ]),
    h('p', { class: 'tf-exin' }, kind === 'example' ? `Example: ${inputsLine(r)}` : inputsLine(r)),
    failed
      ? h('p', { class: 'tf-big' }, [h('b', {}, String(failed)), h('span', {}, failed === 1 ? 'check fails' : 'checks fail')])
      : h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, 'Nothing fails'), h('span', {}, 'in what one message shows')]),
    h('p', { class: 'tf-sub' }, `Bulk-sender rules met: ${scores.join(', ')}.`),
    h('ol', { class: 'tf-items bsc-items' }, r.checks.map((c) => checkItem(c, who[c.id]))),
    ...(r.notes ?? []).map((n) => h('p', { class: 'tf-note' }, n)),
    h('details', { class: 'xpand' }, [h('summary', {}, 'Rule by rule, per provider'), h('div', { class: 'xp-in' }, [
      h('p', {}, r.answer),
      h('div', { class: 'bsc-cards' }, r.verdicts.map(providerCard)),
    ])]),
    h('details', { class: 'xpand' }, [h('summary', {}, 'The message'), h('div', { class: 'xp-in' }, [
      more ? h('p', {}, more) : null,
      h('dl', { class: 'bsc-facts' }, [
        ['From domain', m.fromDomain ?? 'none'], ['Envelope domain', m.mailFrom?.domain ?? 'none'], ['Sending IP', m.sendingIp ? `${m.sendingIp.ip} (${m.sendingIp.from})` : 'not found'],
        ['Receiver', m.receiver ? (m.receiver.authserv ?? 'no server name') : 'no Authentication-Results'], ['Delivery hop', m.deliveryHop ? `${m.deliveryHop.by ?? '?'} with ${m.deliveryHop.with ?? '?'}${m.deliveryHop.tls ? `, ${m.deliveryHop.tls}` : ''}` : 'not found'],
      ].flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)])),
    ])]),
    note ? h('p', { class: 'tf-cost' }, note) : h('span'),
    h('p', { class: 'tf-cost' }, r.dns.checked ? `DNS: ${r.dns.resolver}, ${r.dns.queries} queries, ${r.dns.checkedAt.replace('T', ' ').slice(0, 16)} UTC. Rules read ${r.rulesReadOn}. ${r.privacy}` : `DNS was not looked up. Rules read ${r.rulesReadOn}. ${r.privacy}`),
  );
}

// ---------- actions ----------

async function onSubmit(ev) {
  ev.preventDefault();
  clearErrors();
  const { input, errors } = readForm();
  if (errors) { $('bsc-eml-err').textContent = errors.eml; return; }
  const btn = $('bsc-run');
  btn.disabled = true;
  $('bsc-status').textContent = 'Checking.';
  try {
    const json = await T.run(SLUG, input);
    render(json.result, { kind: 'run', note: [fileNote, costNote(json)].filter(Boolean).join(' ') || null });
    $('bsc-status').textContent = 'Done.';
  } catch (e) {
    showError(e);
    $('bsc-status').textContent = '';
  } finally {
    btn.disabled = false;
  }
}

async function loadSample(id, { fill = true } = {}) {
  clearErrors();
  try {
    const json = await T.run(SLUG, { op: 'sample', id });
    const s = json.result;
    if (fill) { $('bsc-eml').value = s.eml; $('bsc-type').value = s.messageType; }
    render(s.report, { kind: 'example', more: `Worked example: ${s.title}. ${s.about} Documentation domains and IPs, really DKIM-signed, checked on DNS recorded for the example.` });
  } catch (e) {
    $('bsc-out').textContent = 'The worked example could not load. The checker still works: paste a message and press the button.';
  }
}

function start() {
  $('bsc-form').addEventListener('submit', onSubmit);
  $('bsc-file').addEventListener('change', async (ev) => { const f = ev.target.files?.[0]; if (f) await readFile(f); });
  for (const b of document.querySelectorAll('[data-sample]')) b.addEventListener('click', () => loadSample(b.dataset.sample));
  const drop = $('bsc-eml');
  drop.addEventListener('dragover', (ev) => ev.preventDefault());
  drop.addEventListener('drop', async (ev) => { const f = ev.dataTransfer?.files?.[0]; if (f) { ev.preventDefault(); await readFile(f); } });
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('bsc-code'), SLUG);
  const q = new URLSearchParams(location.search);
  const ex = q.get('example');
  if (q.get('type') === 'transactional') $('bsc-type').value = 'transactional';
  loadSample(['compliant', 'one-click-missing', 'not-aligned'].includes(ex) ? ex : 'not-aligned', { fill: Boolean(ex) });
  if (ex) $('bsc-out').scrollIntoView?.();
}

start();
