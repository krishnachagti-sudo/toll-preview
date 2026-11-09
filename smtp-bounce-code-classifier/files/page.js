// The SMTP bounce classifier page. Classifying runs on the server through Endwise.run (the rules
// read data files that are not served). The worked example at rest is the tool's first published
// example; links from the content pages prefill ?text=, ?lines= or ?code= (and run=1 to run it).

const T = window.Endwise;
const h = T.h;
const SLUG = 'smtp-bounce-code-classifier';
const $ = (id) => document.getElementById(id);
const mode = () => document.querySelector('input[name="mode"]:checked').value;

const VERDICT_WORDS = { hard: 'Hard bounce', soft: 'Soft bounce', block: 'Block', policy: 'Policy', delivered: 'Delivered', unknown: 'Unknown' };
const SUPPRESS_WORDS = { now: 'Suppress now', 'after-repeats': 'Only after repeated failures', no: 'No' };
const RETRY_WORDS = { yes: 'Yes, with backoff', later: 'Later, a few times at most', 'after-fix': 'After you fix the cause', no: 'No' };

// ---------- the form ----------

function setMode(m) {
  $('sbc-text-label').textContent = m === 'many' ? `Bounces, one per line (at most 500)` : 'The bounce';
  $('sbc-run').textContent = m === 'many' ? 'Classify every line' : 'Classify';
}

function readForm() {
  const text = $('sbc-text').value;
  const provider = $('sbc-provider').value || undefined;
  if (!text.trim()) return { errors: { text: 'Paste a bounce: an SMTP reply, a DSN or a mail log line.' } };
  if (mode() === 'many') {
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length > 500) return { errors: { text: `That is ${lines.length} lines; at most 500 per run.` } };
    return { input: { op: 'batch', lines, ...(provider ? { provider } : {}) } };
  }
  return { input: { op: 'classify', text, ...(provider ? { provider } : {}) } };
}

function clearErrors() {
  for (const el of document.querySelectorAll('.field-error')) el.textContent = '';
}

function showError(e, boxId = 'sbc-error') {
  const field = e.fields && (e.fields.text || e.fields.lines || e.fields.code || Object.values(e.fields)[0]);
  const box = $(boxId);
  box.textContent = field || e.message;
  if (e.code === 'rate_limited' || e.status === 401) box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

function costNote(json) {
  if (json.charged) return `Charged ${json.charged.display}. Your balance is ${json.balance.display}.`;
  if (typeof json.freeRunsLeft === 'number') return `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  return null;
}

// ---------- one result ----------

function codeRows(r) {
  const rows = [];
  if (r.basic) rows.push(['Reply code', [h('code', {}, r.basic.code), ` ${r.basic.meaning ?? 'not a code the RFCs define'}${r.basic.rfc ? ` (${r.basic.rfc})` : ''}`]]);
  if (r.enhanced) {
    rows.push(['Enhanced code', [h('code', {}, r.enhanced.code), r.enhanced.detail ? ` ${r.enhanced.detail.name} (IANA ${r.enhanced.detail.code}, ${r.enhanced.detail.refs.join(', ')})` : ' not in the IANA registry']]);
    rows.push(['Class', `${r.enhanced.class.name ?? ''}${r.enhanced.subject ? `; subject: ${r.enhanced.subject.name}` : ''}`]);
  }
  if (r.provider) rows.push(['Provider', r.provider.name]);
  if (r.parsed.recipient) rows.push(['Recipient', r.parsed.recipient]);
  if (r.parsed.status) rows.push(['Postfix status', r.parsed.status]);
  if (r.parsed.action) rows.push(['DSN action', r.parsed.action]);
  return rows;
}

// The inputs in one line: the bounce's first line (cut) and the provider.
const PROVIDERS = { gmail: 'Gmail', microsoft: 'Microsoft', yahoo: 'Yahoo', postfix: 'Postfix' };
function inputsLine(input) {
  if (!input) return null;
  const first = input.op === 'batch' ? `${input.lines.length} bounce lines` : String(input.text ?? '').trim().split(/\r?\n/)[0];
  const cut = first.length > 70 ? `${first.slice(0, 69)}…` : first;
  return `${cut}, ${input.provider ? PROVIDERS[input.provider] ?? input.provider : 'provider worked out from the text'}`;
}

const item = (k, label, value, why, cls = null) => h('li', { class: cls }, [
  h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, label), h('b', {}, value), h('em', {}, why),
]);

function head(example, src, input) {
  const line = inputsLine(input);
  return [
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      src ? h('span', { class: 'tf-src' }, src) : null,
    ]),
    line ? h('p', { class: 'tf-exin' }, example ? `Example: ${line}` : line) : '',
  ];
}

const fold = (summary, kids) => h('details', { class: 'xpand' }, [h('summary', {}, summary), h('div', { class: 'xp-in' }, kids)]);

function renderOne(r, { note = null, example = false, input = null } = {}) {
  const out = $('sbc-out');
  out.textContent = '';
  const rule = r.rule;
  const ruleSource = rule.source ? [h('a', { href: rule.source }, `${rule.providerName}'s page`), rule.readOn ? `, read ${rule.readOn}` : ''] : `a ${String(rule.kind ?? 'general').replace(/-/g, ' ')} rule`;
  out.append(
    ...head(example, r.provider ? r.provider.name : `confidence: ${r.confidence}`, input),
    h('p', { class: 'tf-big' }, [h('b', { class: `word sbc-big-v v-${r.verdict}` }, VERDICT_WORDS[r.verdict]), h('span', {}, [r.temporary ? 'temporary (4xx), ' : '', `confidence: ${r.confidence}`])]),
    h('p', { class: 'tf-sub sbc-answer' }, r.answer),
    h('ul', { class: 'tf-items sbc-items' }, [
      item('S', 'Suppress the address?', SUPPRESS_WORDS[r.suppress] ?? r.suppress, r.action, r.suppress === 'now' ? 'sk' : 'hi'),
      item('↻', 'Send again?', RETRY_WORDS[r.retry] ?? r.retry, r.temporary ? 'a 4xx may succeed if sent again (RFC 3463)' : 'a 5xx is a permanent failure'),
      item('R', 'Rule', h('code', {}, rule.id), ruleSource),
      r.basic ? item('#', 'Reply code', r.basic.code, `${r.basic.meaning ?? 'not a code the RFCs define'}${r.basic.rfc ? ` (${r.basic.rfc})` : ''}`, 'plain') : null,
      r.enhanced ? item('#', 'Enhanced code', r.enhanced.code, r.enhanced.detail ? `${r.enhanced.detail.name} (IANA ${r.enhanced.detail.code}, ${r.enhanced.detail.refs.join(', ')})` : 'not in the IANA registry', 'plain') : null,
    ]),
    r.warnings.length ? h('ul', { class: 'sbc-warn' }, r.warnings.map((w) => h('li', {}, w.text))) : '',
    fold('What the codes mean', [
      h('table', { class: 'sbc-codes' }, h('tbody', {}, codeRows(r).map(([k, v]) => h('tr', {}, [h('th', { scope: 'row' }, k), h('td', {}, v)])))),
      r.enhanced?.detail ? h('p', { class: 'sbc-note' }, [h('b', {}, `IANA ${r.enhanced.detail.code}: `), r.enhanced.detail.description]) : '',
    ]),
    r.variants?.length ? fold(`Published texts with this code (${r.variants.length})`, renderVariants(r.variants)) : '',
    h('p', { class: 'tf-cost' }, note ?? 'Classified on our server.'),
  );
}

function renderVariants(variants) {
  return h('div', { class: 'sbc-variants' }, [
    h('h3', {}, `Published texts with this code (${variants.length})`),
    h('table', { class: 'sbc-table' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'Provider'), h('th', {}, 'Code'), h('th', {}, 'Text'), h('th', {}, 'Verdict')])),
      h('tbody', {}, variants.map((v) => h('tr', {}, [
        h('td', {}, h('a', { href: v.source }, v.providerName)),
        h('td', {}, h('code', {}, [v.basic, v.enhanced].filter(Boolean).join(' '))),
        h('td', {}, [h('q', {}, v.phrase), ` ${v.meaning}`]),
        h('td', {}, h('span', { class: `sbc-verdict small v-${v.verdict}` }, VERDICT_WORDS[v.verdict])),
      ]))),
    ]),
  ]);
}

// ---------- a batch ----------

function csvOf(r) {
  const cell = (v) => { const s = String(v ?? ''); return /^[=+\-@]/.test(s) ? `'${s}` : s; };
  const q = (v) => `"${cell(v).replace(/"/g, '""')}"`;
  const head = ['line', 'verdict', 'suppress', 'retry', 'reply_code', 'enhanced_code', 'provider', 'rule', 'recipient', 'reason'];
  return [head.join(','), ...r.rows.map((x) => [x.line, x.verdict, x.suppress, x.retry, x.basic, x.enhanced, x.provider, x.rule, x.recipient, x.reason].map(q).join(','))].join('\r\n');
}

function renderBatch(r, { note = null, input = null } = {}) {
  const out = $('sbc-out');
  out.textContent = '';
  const blob = URL.createObjectURL(new Blob([csvOf(r)], { type: 'text/csv' }));
  out.append(
    ...head(false, null, input),
    h('p', { class: 'tf-big' }, [h('b', {}, String(r.totals.hard)), h('span', {}, `hard of ${r.lines}`)]),
    h('p', { class: 'tf-sub sbc-answer' }, `${r.lines} ${r.lines === 1 ? 'line' : 'lines'}: ${r.totals.hard} hard, ${r.totals.soft} soft, ${r.totals.block} block, ${r.totals.policy} policy, ${r.totals.unknown} unknown (not charged).`),
    h('div', { class: 'sbc-totals' }, ['hard', 'soft', 'block', 'policy', 'unknown'].map((k) => h('div', { class: `sbc-total v-${k}` }, [h('span', { class: 'sbc-big' }, String(r.totals[k])), h('span', {}, VERDICT_WORDS[k])]))),
    r.suppress.length ? h('div', { class: 'sbc-suppress' }, [h('h3', {}, 'Suppress now'), h('p', {}, r.suppress.join(', '))]) : h('p', { class: 'muted' }, 'No address to suppress now (an address shows here when its line is a hard bounce and names the recipient).'),
    h('div', { class: 'sbc-scroll' }, h('table', { class: 'sbc-table' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, '#'), h('th', {}, 'Verdict'), h('th', {}, 'Codes'), h('th', {}, 'Rule'), h('th', {}, 'Why')])),
      h('tbody', {}, r.rows.map((x) => h('tr', {}, [
        h('td', {}, String(x.line)),
        h('td', {}, h('span', { class: `sbc-verdict small v-${x.verdict}` }, VERDICT_WORDS[x.verdict])),
        h('td', {}, h('code', {}, [x.basic, x.enhanced].filter(Boolean).join(' ') || '-')),
        h('td', {}, h('code', {}, x.rule)),
        h('td', {}, x.reason),
      ]))),
    ])),
    h('p', {}, h('a', { href: blob, download: 'bounce-verdicts.csv', class: 'btn btn-ghost' }, 'Download as CSV')),
    note ? h('p', { class: 'tf-cost' }, note) : '',
  );
}

// ---------- running ----------

async function onSubmit(ev) {
  ev.preventDefault();
  clearErrors();
  const { input, errors } = readForm();
  if (errors) { $('sbc-text-err').textContent = errors.text; return; }
  const btn = $('sbc-run');
  btn.disabled = true;
  $('sbc-status').textContent = 'Classifying.';
  try {
    const json = await T.run(SLUG, input);
    const note = costNote(json);
    if (input.op === 'batch') renderBatch(json.result, { note, input }); else renderOne(json.result, { note, input });
    $('sbc-status').textContent = 'Done.';
    if (window.matchMedia('(max-width: 1080px)').matches) $('sbc-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (e) {
    showError(e);
    $('sbc-status').textContent = '';
  } finally {
    btn.disabled = false;
  }
}

async function onLookup(ev) {
  ev?.preventDefault();
  $('sbc-code-err').textContent = '';
  const box = $('sbc-lookup-out');
  const code = $('sbc-code').value.trim();
  if (!code) { $('sbc-code-err').textContent = 'Enter a code such as 550 5.1.1.'; return; }
  try {
    const json = await T.run(SLUG, { op: 'code', code });
    const r = json.result;
    box.textContent = '';
    box.append(
      h('div', { class: 'sbc-head' }, [h('span', { class: `sbc-verdict v-${r.verdict}` }, VERDICT_WORDS[r.verdict])]),
      h('p', { class: 'sbc-answer' }, r.answer),
      h('table', { class: 'sbc-codes' }, h('tbody', {}, codeRows(r).filter(([k]) => k !== 'Provider').map(([k, v]) => h('tr', {}, [h('th', { scope: 'row' }, k), h('td', {}, v)])))),
      r.variants.length ? renderVariants(r.variants) : h('p', { class: 'muted' }, 'No Gmail, Microsoft or Yahoo text is published with this code.'),
    );
  } catch (e) {
    showError(e, 'sbc-code-err');
  }
}

// ---------- from the address ----------

function fromQuery() {
  const q = new URLSearchParams(location.search);
  if (q.has('code')) {
    $('sbc-code').value = q.get('code');
    onLookup();
    if (!q.has('text') && !q.has('lines')) $('lookup').scrollIntoView();
  }
  if (q.has('lines')) {
    document.querySelector('input[name="mode"][value="many"]').checked = true;
    setMode('many');
    $('sbc-text').value = q.get('lines');
  } else if (q.has('text')) {
    $('sbc-text').value = q.get('text');
  } else {
    return null;
  }
  if (q.get('provider')) { $('sbc-provider').value = q.get('provider'); $('sbc-provider-fold').open = true; }
  return q.get('run') === '1' ? 'run' : 'filled';
}

async function start() {
  $('sbc-form').addEventListener('submit', onSubmit);
  $('sbc-lookup-form').addEventListener('submit', onLookup);
  for (const r of document.querySelectorAll('input[name="mode"]')) r.addEventListener('change', () => setMode(mode()));
  const from = fromQuery();
  if (!new URLSearchParams(location.search).has('code')) onLookup();
  if (from === 'run') { $('sbc-form').requestSubmit(); return; }
  try {
    const tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
    const ex = tool.examples[0];
    if (!from) $('sbc-text').value = ex.input.text;
    renderOne(ex.output, { example: true, input: ex.input, note: from ? 'Your text is in the box: press Classify.' : ex.title });
  } catch {
    $('sbc-out').textContent = 'The worked example could not load. The classifier still works: paste a bounce and press Classify.';
  }
}

start();
