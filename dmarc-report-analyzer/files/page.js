// The DMARC report analyzer page. Files are read in the browser as base64 and sent to the tool's
// run endpoint (decompression and the provider data live on the server); nothing is stored. The
// worked example at rest is the tool's first published example. Links from the content pages
// prefill ?sample=<reporter> (a made-up report in that reporter's format) or ?ips=.
import { sourcesCsv } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'dmarc-report-analyzer';
const $ = (id) => document.getElementById(id);
const MAX_FILES = 50;
const MAX_BYTES = 10 * 1024 * 1024;
const SAMPLE_NAMES = { google: 'google.com!', microsoft: 'enterprise.protection.outlook.com!', yahoo: 'yahoo.com!', 'mail-ru': 'mail.ru!', gmx: 'gmx.net!' };

let picked = [];
let examples = [];
let last = null;

// ---------- the form ----------

function showList() {
  const list = $('dra-list');
  list.textContent = '';
  for (const f of picked) list.append(h('li', {}, `${f.name} (${f.size < 1024 ? `${f.size} bytes` : `${Math.round(f.size / 1024)} KB`})`));
  $('dra-run').textContent = picked.length > 1 ? `Analyze ${picked.length} files` : 'Analyze';
}

function pick(files) {
  $('dra-files-err').textContent = '';
  const all = [...files];
  const big = all.find((f) => f.size > MAX_BYTES);
  if (big) { $('dra-files-err').textContent = `${big.name} is larger than 10 MB.`; return; }
  if (all.length > MAX_FILES) { $('dra-files-err').textContent = `That is ${all.length} files; at most ${MAX_FILES} per run.`; return; }
  picked = all;
  $('dra-sample').value = '';
  showList();
}

const toBase64 = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).replace(/^data:[^,]*,/, ''));
  r.onerror = () => reject(new Error(`${file.name} could not be read.`));
  r.readAsDataURL(file);
});

async function readForm() {
  const sample = $('dra-sample').value;
  if (sample) {
    const ex = examples.find((e) => e.input.op === 'analyze' && e.input.files[0].name.startsWith(SAMPLE_NAMES[sample]));
    if (!ex) return { errors: { files: 'The sample could not load; drop a file instead.' } };
    return { input: ex.input };
  }
  const xml = $('dra-xml').value.trim();
  if (picked.length) return { input: { op: 'analyze', files: await Promise.all(picked.map(async (f) => ({ name: f.name, base64: await toBase64(f) }))) } };
  if (xml) return { input: { op: 'analyze', files: [{ name: 'pasted.xml', xml }] } };
  return { errors: { files: 'Drop a report file, paste its XML or choose a sample.' } };
}

function clearErrors() {
  for (const el of document.querySelectorAll('.field-error')) el.textContent = '';
}

function showError(e, boxId = 'dra-error') {
  const field = e.fields && (e.fields.files || e.fields.ips || Object.values(e.fields)[0]);
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

// ---------- results ----------

const STATUS = { pass: 'Passes', fail: 'Fails', mixed: 'Partly fails' };
const MARK = { pass: '✓', fail: '×', mixed: '!' };
const fmt = (n) => n.toLocaleString('en-US');

// One line per sending source: its DMARC result, the reason from the report's raw results, and
// (folded) the fix, its IPs and the provider data that names it.
function sourceItem(s) {
  const why = s.status === 'pass' ? s.reason
    : s.status === 'mixed' ? `${fmt(s.failed)} of ${fmt(s.messages)} failed. ${s.reason}` : s.reason;
  const details = h('details', {}, [
    h('summary', {}, s.failed ? 'The fix and the evidence' : 'The evidence'),
    s.failed && s.fix ? h('p', {}, [h('b', {}, 'Fix: '), s.fix]) : null,
    h('p', {}, `How it is named: ${s.confidence === 'none' ? 'not named' : s.confidence}. IPs: ${s.ips.slice(0, 12).join(', ')}${s.ips.length > 12 ? ` and ${s.ips.length - 12} more` : ''}`),
    s.evidence.length ? h('ul', {}, s.evidence.map((e) => h('li', {}, e.detail))) : h('p', {}, 'Nothing in the dated provider data names this IP.'),
    s.dkimDomains.length ? h('p', {}, `DKIM: ${s.dkimDomains.map((d) => d.replace(':', ' ')).join('; ')}`) : null,
    s.spfDomains.length ? h('p', {}, `SPF: ${s.spfDomains.map((d) => d.replace(':', ' ')).join('; ')}`) : null,
  ]);
  return h('li', { class: `st-${s.status} ${s.status === 'pass' ? 'p-pass' : s.status === 'fail' ? 'sk' : 'p-mixed'}` }, [
    h('span', { class: 'k', 'aria-label': STATUS[s.status] }, MARK[s.status]),
    h('span', {}, s.label),
    h('b', {}, `${fmt(s.messages)} ${s.messages === 1 ? 'message' : 'messages'}`),
    h('em', {}, `${STATUS[s.status]} DMARC: ${why}`),
    details,
  ]);
}

function facts(r) {
  return h('dl', { class: 'dra-facts' }, [
    h('dt', {}, 'Reporter'), h('dd', {}, [`${r.reporter.orgName ?? 'unknown'} (${r.reporter.email ?? 'no address'})`, ...(r.reporter.known ? [' ', h('a', { href: `${T.base}${r.reporter.known.page}` }, `About ${r.reporter.known.name}'s reports`)] : [])]),
    h('dt', {}, 'Domain'), h('dd', {}, r.policy.domain),
    h('dt', {}, 'Period'), h('dd', {}, r.period.words),
    h('dt', {}, 'Your policy'), h('dd', {}, `${r.policy.words}${r.policy.sp ? `; subdomains sp=${r.policy.sp}` : ''}${r.policy.testing === 'y' ? '; t=y (test mode)' : ''}`),
    h('dt', {}, 'Format'), h('dd', {}, r.schema === 'rfc9990' ? 'RFC 9990 (dmarc-2.0 namespace)' : r.schema === 'rfc7489' ? 'RFC 7489 (no namespace)' : `Unknown namespace ${r.namespace}`),
    h('dt', {}, 'Messages'), h('dd', {}, `${fmt(r.totals.messages)}, ${r.totals.passRate}% passed DMARC, from ${fmt(r.totals.sources)} sources (${fmt(r.totals.records)} records)`),
  ]);
}

const subLine = (r) => `${fmt(r.totals.failed)} of ${fmt(r.totals.messages)} messages failed, from ${fmt(r.totals.failingSources)} of ${fmt(r.totals.sources)} sources. ${r.period.words}, ${r.policy.domain}, ${r.policy.words}.`;

function reportBlock(r, { head }) {
  return h('section', { class: 'dra-report' }, [
    head ? h('h3', {}, r.file ?? 'Report') : null,
    head ? h('p', { class: 'tf-sub' }, `${r.totals.passRate}% passed DMARC. ${subLine(r)}`) : null,
    h('ol', { class: 'tf-items dra-items' }, r.sources.map(sourceItem)),
    r.errors.length ? h('p', { class: 'tf-note' }, `The reporter noted: ${r.errors.join(' ')}`) : null,
    r.warnings.length ? h('ul', { class: 'tf-note' }, r.warnings.map((w) => h('li', {}, w))) : null,
    h('details', { class: 'xpand' }, [h('summary', {}, 'The report in full'), h('div', { class: 'xp-in' }, [h('p', {}, r.answer), facts(r)])]),
  ]);
}

// kind: 'example' (a published worked example, free) or 'run'. names: the input files, for the inputs line.
function render(out, { kind, names, note }) {
  last = out;
  const box = $('dra-out');
  box.textContent = '';
  const one = out.combined ? null : out.reports[0];
  const inputs = names.length > 3 ? `${names.slice(0, 3).join(', ')} and ${names.length - 3} more` : names.join(', ');
  box.append(
    h('div', { class: 'tf-rh' }, [
      kind === 'example' ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src' }, one ? `${one.reporter.orgName ?? 'Unknown reporter'} report` : `${out.combined.reports} reports`),
    ]),
    h('p', { class: 'tf-exin' }, kind === 'example' ? `Example: ${inputs}` : inputs),
  );
  if (one) {
    box.append(
      h('p', { class: 'tf-big' }, [h('b', {}, `${one.totals.passRate}%`), h('span', {}, 'passed DMARC')]),
      h('p', { class: 'tf-sub' }, subLine(one)),
      reportBlock(one, { head: false }),
    );
  } else {
    const c = out.combined;
    box.append(
      h('p', { class: 'tf-big' }, [h('b', {}, `${c.passRate}%`), h('span', {}, 'passed DMARC')]),
      h('p', { class: 'tf-sub' }, c.answer),
      h('ol', { class: 'tf-items dra-items' }, c.sources.slice(0, 40).map((s) => h('li', { class: s.failed ? (s.failed === s.messages ? 'sk' : 'p-mixed') : 'p-pass' }, [
        h('span', { class: 'k' }, s.failed ? (s.failed === s.messages ? '×' : '!') : '✓'),
        h('span', {}, s.label),
        h('b', {}, `${fmt(s.messages)} ${s.messages === 1 ? 'message' : 'messages'}`),
        h('em', {}, `${fmt(s.failed)} failed, ${s.passRate}% passed. Reported by ${s.reporters.join(', ')}`),
      ]))),
    );
    for (const r of out.reports) box.append(reportBlock(r, { head: true }));
  }
  const problems = out.files.filter((f) => f.error || f.errors || f.skipped.length);
  if (problems.length) box.append(h('ul', { class: 'tf-note' }, problems.map((f) => h('li', {}, [f.error, ...(f.errors ?? []), f.skipped.length ? `Skipped (not XML): ${f.skipped.join(', ')}` : ''].filter(Boolean).join(' ')))));
  const csv = h('button', { class: 'btn btn-ghost', type: 'button' }, 'Download the source table (CSV)');
  csv.addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([sourcesCsv(last.reports)], { type: 'text/csv' }));
    const a = h('a', { href: url, download: 'dmarc-sources.csv' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  box.append(
    h('div', { class: 'dra-actions' }, [csv]),
    ...(note ? [h('p', { class: 'tf-cost' }, note)] : []),
    h('p', { class: 'tf-cost' }, `${out.privacy} Provider ranges measured ${out.data.providers.measuredAt}; cloud ranges read ${out.data.hosting[0].readOn}.`),
  );
}

async function onSubmit(ev) {
  ev.preventDefault();
  clearErrors();
  const btn = $('dra-run');
  btn.disabled = true;
  try {
    const { input, errors } = await readForm();
    if (errors) { $('dra-files-err').textContent = errors.files; return; }
    $('dra-status').textContent = 'Reading the report.';
    const json = await T.run(SLUG, input);
    render(json.result, { kind: 'run', names: input.files.map((f) => f.name), note: costNote(json) });
    $('dra-status').textContent = 'Done.';
  } catch (e) {
    showError(e);
  } finally {
    btn.disabled = false;
  }
}

// ---------- naming IPs ----------

async function onIdentify(ev) {
  ev?.preventDefault();
  $('dra-ips-err').textContent = '';
  const ips = $('dra-ips').value.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
  if (!ips.length) { $('dra-ips-err').textContent = 'Paste at least one IP address.'; return; }
  if (ips.length > 100) { $('dra-ips-err').textContent = 'At most 100 IPs at a time.'; return; }
  try {
    const json = await T.run(SLUG, { op: 'identify', ips });
    const out = $('dra-ip-out');
    out.textContent = '';
    out.append(h('p', {}, json.result.answer), h('div', { class: 'dra-scroll' }, h('table', { class: 'dra-table' }, [
      h('thead', {}, h('tr', {}, ['IP', 'Service', 'How it is known'].map((c) => h('th', {}, c)))),
      h('tbody', {}, json.result.rows.map((r) => h('tr', {}, [h('td', {}, h('code', {}, r.ip)), h('td', {}, r.name ?? (r.hostedAt ? `A server at ${r.hostedAt.name}` : 'Not named')), h('td', { class: 'small' }, r.evidence.map((e) => e.detail).join('; ') || r.note)]))),
    ])));
  } catch (e) {
    showError(e, 'dra-ips-err');
  }
}

// ---------- start ----------

function wireDrop() {
  const drop = $('dra-drop');
  $('dra-files').addEventListener('change', (e) => pick(e.target.files));
  for (const t of ['dragenter', 'dragover']) drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.add('over'); });
  for (const t of ['dragleave', 'drop']) drop.addEventListener(t, (e) => { e.preventDefault(); drop.classList.remove('over'); });
  drop.addEventListener('drop', (e) => pick(e.dataTransfer.files));
  $('dra-sample').addEventListener('change', () => { if ($('dra-sample').value) { picked = []; showList(); } });
}

async function start() {
  $('dra-form').addEventListener('submit', onSubmit);
  $('dra-ip-form').addEventListener('submit', onIdentify);
  wireDrop();
  const q = new URLSearchParams(location.search);
  if (q.get('ips')) $('dra-ips').value = q.get('ips').slice(0, 2000);
  if (q.get('ips') || q.get('run') === 'ips') onIdentify();
  try {
    const tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
    examples = tool.examples;
    const want = q.get('sample');
    const ex = (want && examples.find((e) => e.input.op === 'analyze' && e.input.files[0].name.startsWith(SAMPLE_NAMES[want] ?? '-'))) || examples[0];
    if (want && SAMPLE_NAMES[want]) $('dra-sample').value = want;
    render(ex.output, { kind: 'example', names: ex.input.files.map((f) => f.name) });
  } catch {
    $('dra-out').textContent = 'The worked example could not load. The analyzer still works: drop a report file and press Analyze.';
  }
}

start();
