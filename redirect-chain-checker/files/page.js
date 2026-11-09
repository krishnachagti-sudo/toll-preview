// The redirect chain checker page. core.js (the same file the server runs) reads the list as it is
// typed, so the page can say how many URLs it holds and what a run costs at most before anything is
// sent. The check itself runs on the server (Endwise.run): a list of up to 10 URLs is free here;
// longer lists go in parts of 200, one paid run each, and the parts are merged with core.js's own
// summary and CSV, so a merged report reads exactly like one run. Pasted curl output is judged free.
// Nothing is kept in this browser.
import { readList, uniqueUrls, summarise, answerLine, toCsv, LIMITS, VERDICTS, CHANGE_WORDS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'redirect-chain-checker';
const PART = 200;
const PER_URL = 0.0003;
const $ = (id) => document.getElementById(id);

const FIX = new Set(['not-checked', 'blocked', 'error', 'loop', 'too-many-hops', 'bad-location', 'broken', 'over-google-limit', 'to-http', 'wrong-target']);
const verdictClass = (v) => (v === 'ok' || v === 'via-chain' ? 's-ok' : FIX.has(v) ? 's-fix' : 's-review');

// ---------- reading the form ----------

function options() {
  const o = { userAgent: $('rc-ua').value, followMetaRefresh: $('rc-meta').checked };
  const hops = Number($('rc-hops').value);
  if (Number.isInteger(hops) && hops >= 1 && hops <= LIMITS.maxHops && hops !== LIMITS.maxHops) o.maxHops = hops;
  if ($('rc-issues').checked) o.issuesOnly = true;
  return o;
}

// As the list is typed: how many URLs, and what a run costs at most.
function hint() {
  const { items, problems } = readList({ list: $('rc-list').value });
  const n = uniqueUrls(items).length;
  const box = $('rc-go-note');
  if (!n) { box.textContent = `Up to ${LIMITS.freeWebUrls} URLs free.`; return; }
  const bad = problems.length ? ` ${problems.length} line${problems.length === 1 ? '' : 's'} cannot be read and will be skipped.` : '';
  if (n <= LIMITS.freeWebUrls) { box.textContent = `${n} URL${n === 1 ? '' : 's'}: free.${bad}`; return; }
  const parts = Math.ceil(n / PART);
  box.textContent = `${n.toLocaleString('en-US')} URLs: at most $${(n * PER_URL).toFixed(n * PER_URL < 0.1 ? 4 : 2)} from your balance${parts > 1 ? `, sent in ${parts} parts of up to ${PART}` : ''}. Needs an account.${bad}`;
}

// ---------- showing a report ----------

function hopItem(hop) {
  const change = hop.next ? ` (${hop.changes.map((c) => CHANGE_WORDS[c]).join(', ')}${hop.via && hop.via !== 'location' ? `, ${hop.via === 'meta-refresh' ? 'meta refresh' : 'Refresh header'} ${hop.refreshSeconds} s` : ''})` : '';
  return h('li', null, [
    h('span', { class: 'rc-code-n' }, String(hop.status ?? '-')),
    hop.url,
    hop.next ? h('span', { class: 'rc-change' }, ` ${hop.kind}${change}`) : null,
  ]);
}

function rowItem(r) {
  const open = r.severity === 'fix' && r.hops.length > 0;
  return h('li', { class: `rc-row s-${r.severity}` }, [
    h('details', open ? { open: '' } : null, [
      h('summary', null, [
        h('span', { class: 'rc-url' }, r.url),
        h('span', { class: 'rc-verdicts' }, r.verdicts.map((v) => h('span', { class: `rc-v ${verdictClass(v)}`, title: VERDICTS[v] }, VERDICTS[v]))),
      ]),
      h('p', null, r.summary),
      r.expected ? h('p', { class: 'rc-change' }, `Expected: ${r.expected}`) : null,
      r.hops.length ? h('ol', { class: 'rc-hops' }, r.hops.map(hopItem)) : null,
      r.notes.length ? h('ul', { class: 'rc-notes' }, r.notes.map((n) => h('li', null, n))) : null,
    ]),
  ]);
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  return h('a', { href: url, download: name, class: 'btn btn-small' }, 'Download the CSV');
}

// The report like the other tool pages: the tag and source, the inputs in one line, what needs fixing
// as the big figure, one line per finding with the rule behind it, then every URL folded.
const FINDINGS = [
  ['ok', 'OK', 'nothing flagged: no redirect, or one permanent hop', null],
  ['toReview', 'To review', 'a chain, a temporary redirect or a target off the map', 'hi'],
  ['toFix', 'To fix', 'a loop, an error, a downgrade to http, a wrong target or too many hops', 'sk'],
  ['chains', 'Chains', '2 or more hops: point the old URL straight at the last one', null],
  ['temporary', 'Temporary redirects', '302, 303 or 307: a weak signal to Google', null],
  ['httpInChain', 'Plain http in a chain', 'an http:// hop after the first', null],
  ['loops', 'Loops', 'a URL that comes back to one it already visited', 'sk'],
  ['broken', 'Ends on a 4xx or 5xx', 'the final answer is an error', 'sk'],
];
function showReport(report, { label, charged, unreadable = [] }) {
  const out = $('rc-out');
  out.textContent = '';
  const s = report.summary;
  const example = label === 'Example';
  const ins = `${example ? 'a recorded run of the checker on ' : ''}${s.total.toLocaleString('en-US')} ${example ? 'public ' : ''}URL${s.total === 1 ? '' : 's'}${s.expected?.rows ? `, ${s.expected.rows} with an expected target` : ''}`;
  const item = ([k, what, why, cls]) => (k === 'ok' || k === 'toReview' || k === 'toFix' || s[k] ? h('li', { class: s[k] ? cls : 'dim' }, [h('span', { class: 'k', 'aria-hidden': 'true' }, String(s[k] ?? 0)), h('span', null, what), h('em', null, why)]) : null);
  out.append(
    h('div', { class: 'tf-rh' }, [h('span', { class: example ? 'tf-tag' : 'tf-tag run' }, example ? 'Example' : label), h('span', { class: 'tf-src' }, example ? 'recorded November 7, 2026' : `checked ${new Date(report.checkedAt).toUTCString().slice(5, 16)}`)]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${ins}` : ins),
    h('p', { class: 'tf-big' }, [h('b', null, `${s.toFix} to fix`), h('span', null, `and ${s.toReview} to review, of ${s.total}`)]),
    h('p', { class: 'tf-sub rc-answer' }, report.answer),
    h('ul', { class: 'tf-items' }, FINDINGS.map(item)),
    h('p', { class: 'rc-downloads' }, [download(report.csv.name, report.csv.text)]),
    charged ? h('p', { class: 'muted' }, charged) : null,
    unreadable.length ? h('p', { class: 'rc-unread' }, `Skipped: ${unreadable.slice(0, 5).map((p) => `line ${p.line} (${p.message})`).join('; ')}${unreadable.length > 5 ? ` and ${unreadable.length - 5} more` : ''}.`) : null,
    report.notChecked.length ? h('p', { class: 'rc-unread' }, `${report.notChecked.length} URL${report.notChecked.length === 1 ? ' was' : 's were'} not reached in the time a run is given and not charged: run them again.`) : null,
    h('details', example ? { class: 'xpand' } : { class: 'xpand', open: '' }, [h('summary', null, `Every URL, hop by hop (${report.rows.length})`), h('div', { class: 'xp-in' }, [
      h('p', { class: 'muted' }, `Sent as ${report.userAgent.name === 'endwise' ? 'our own checker' : report.userAgent.name} on ${new Date(report.checkedAt).toUTCString()}.`),
      h('ol', { class: 'rc-rows' }, report.rows.map(rowItem)),
    ])]),
  );
}

// Several runs' reports as one: rows in list order, the summary and CSV made again by core.js.
function merge(reports, data) {
  const rows = reports.flatMap((r) => r.rows).sort((a, b) => a.line - b.line);
  const summary = summarise(rows);
  const first = reports[0];
  return {
    ...first,
    answer: answerLine(summary),
    summary,
    rows: data.issuesOnly ? rows.filter((r) => r.severity !== 'ok') : rows,
    notChecked: reports.flatMap((r) => r.notChecked),
    csv: { ...first.csv, text: toCsv(data.issuesOnly ? rows.filter((r) => r.severity !== 'ok') : rows) },
  };
}

// ---------- running ----------

async function runCheck(e) {
  e.preventDefault();
  $('rc-error').textContent = '';
  $('rc-list-err').textContent = '';
  const text = $('rc-list').value;
  const { items, problems } = readList({ list: text });
  if (!items.length) { $('rc-list-err').textContent = problems.length ? `Line ${problems[0].line}: ${problems[0].message}` : 'Paste at least one URL.'; return; }
  const opts = options();
  // Parts of up to PART distinct URLs, each keeping its lines (and their expected targets).
  const order = uniqueUrls(items);
  const parts = [];
  for (let i = 0; i < order.length; i += PART) {
    const set = new Set(order.slice(i, i + PART));
    parts.push(items.filter((it) => set.has(it.url)));
  }
  const itemLines = new Set(items.map((it) => it.line));
  const reports = [];
  let spent = 0;
  try {
    for (const [i, part] of parts.entries()) {
      $('rc-status').textContent = parts.length > 1 ? `Checking part ${i + 1} of ${parts.length}.` : 'Checking.';
      // A part keeps its lines' numbers: urls rows carry no line, so each part is sent as text
      // padded with blank lines up to its first line, which readList skips.
      const lines = text.split(/\r\n|\r|\n/);
      const keep = new Set(part.map((it) => it.line));
      // Line 1 goes with every part only when it is a header, never when it is a URL of its own.
      const partText = lines.map((l, n) => (keep.has(n + 1) || (n === 0 && !itemLines.has(1)) ? l : '')).join('\n');
      const res = await T.run(SLUG, { op: 'check', list: partText, ...opts });
      spent += res.charged?.amount ?? 0;
      reports.push(res.result);
    }
  } catch (err) {
    if (err.status === 401) {
      $('rc-error').textContent = `More than ${LIMITS.freeWebUrls} URLs needs an account, so the run can be paid from your balance. Sign in, or check ${LIMITS.freeWebUrls} at a time.`;
    } else {
      $('rc-error').textContent = err.message;
      if (err.fields?.list) $('rc-list-err').textContent = err.fields.list;
    }
    if (!reports.length) return;
  }
  const report = reports.length === 1 ? reports[0] : merge(reports, opts);
  const charged = spent > 0 ? `Charged $${(spent / 1e6).toFixed(spent < 100_000 ? 4 : 2)} for ${reports.reduce((n, r) => n + r.billedUrls, 0).toLocaleString('en-US')} URLs.` : 'Free.';
  showReport(report, { label: 'Your report', charged, unreadable: problems });
  $('rc-status').textContent = 'Report ready.';
}

async function runCurl() {
  $('rc-curl-error').textContent = '';
  const input = { op: 'analyse', url: $('rc-curl-url').value.trim(), curl: $('rc-curl').value };
  const expected = $('rc-curl-expected').value.trim();
  if (expected) input.expected = expected;
  const box = $('rc-curl-out');
  box.textContent = '';
  try {
    const res = await T.run(SLUG, input);
    const list = h('ol', { class: 'rc-rows' }, [rowItem(res.result.row)]);
    box.append(list);
    list.querySelector('details').open = true;
  } catch (err) {
    $('rc-curl-error').textContent = err.message;
  }
}

// ?list=... (newline separated), ?u=..., ?ua=googlebot, ?hops=5; run=1 runs a free-sized list on arrival.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const list = q.get('list') ?? q.get('u');
  if (list) $('rc-list').value = list;
  if (q.get('ua') && [...$('rc-ua').options].some((o) => o.value === q.get('ua'))) { $('rc-ua').value = q.get('ua'); $('rc-more').open = true; }
  if (q.get('hops')) $('rc-hops').value = q.get('hops');
  return q.get('run') === '1' && list && uniqueUrls(readList({ list }).items).length <= LIMITS.freeWebUrls;
}

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('rc-code'), SLUG);
  const autorun = fromQuery();
  hint();
  $('rc-list').addEventListener('input', hint);
  $('rc-form').addEventListener('submit', runCheck);
  $('rc-curl-go').addEventListener('click', runCurl);
  if (autorun) { $('rc-form').requestSubmit(); return; }
  try {
    const tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
    const sample = tool.examples.find((x) => x.input.op === 'check');
    if (sample) showReport(sample.output, { label: 'Example' });
  } catch {
    // The sample sentence in the page stays.
  }
}

start();
