// The sitemap validator page. A check by address runs on the server (Endwise.run): one sitemap,
// an index and up to 10 of its files, with up to 10 URLs checked live, is free here; more needs an
// account and is paid from the balance, and "the next batch" continues the live checks without
// paying for the sitemap again. Pasted XML is checked in this browser with core.js, the same file
// the server runs, so it is free and nothing is sent. Nothing is kept in this browser.
import { judgeFile, summarise, verdictOf, answerLine, toCsv, readSitemapUrl, CALL, LIVE_VERDICTS, VERDICT_WORDS, KINDS, sizeWords } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'sitemap-validator';
const PER_CHECK = 0.0005;
const $ = (id) => document.getElementById(id);

let lastInput = null;

// ---------- reading the form ----------

function readForm() {
  const live = Math.max(0, Math.min(CALL.live, Math.floor(Number($('sv-live').value) || 0)));
  const maxSitemaps = Math.max(0, Math.min(CALL.maxSitemaps, Math.floor(Number($('sv-max').value) || 0)));
  const input = { op: 'check', url: $('sv-url').value.trim(), maxSitemaps, live };
  if (live && $('sv-pick').value === 'spread') input.pick = 'spread';
  return input;
}
const isFree = (i) => i.maxSitemaps <= CALL.freeWebSitemaps && i.live <= CALL.freeWebLive && !i.liveFrom;

function hint() {
  const i = readForm();
  const box = $('sv-go-note');
  if (isFree(i)) { box.textContent = 'Free at these settings.'; return; }
  const most = 1 + i.maxSitemaps + i.live;
  box.textContent = `At most ${most} checks, $${(most * PER_CHECK).toFixed(4)}, from your balance (only files read and URLs checked are charged). Needs an account.`;
}

// ---------- showing a report ----------

const sevClass = (s) => (s === 'error' ? 's-fix' : s === 'warning' ? 's-review' : s === 'ok' ? 's-ok' : 's-note');

function tally(s) {
  const items = [
    ['URLs', s.urls], ['files', s.files], ['errors', s.errors], ['warnings', s.warnings],
    ['blocked by robots.txt', s.robotsBlocked], ['checked live', s.live.checked], ['not 200', s.live.non200],
    ['noindex', s.live.noindex], ['other canonical', s.live.canonicalElsewhere],
  ].filter(([, n], k) => k < 4 || n > 0);
  return h('ul', { class: 'sv-tally' }, items.map(([label, n]) => h('li', null, [h('span', { class: 'n' }, n.toLocaleString('en-US')), label])));
}

function issueItem(it) {
  const shown = it.examples.slice(0, 5);
  return h('li', { class: `sv-issue ${sevClass(it.severity)}` }, [
    h('details', it.severity === 'error' ? { open: '' } : null, [
      h('summary', null, [
        h('span', { class: `sv-sev ${sevClass(it.severity)}` }, it.severity),
        ` ${it.title}`,
        it.gsc ? h('span', { class: 'sv-gsc' }, ` Search Console: ${it.gsc}`) : null,
        h('span', { class: 'sv-count' }, ` (${it.count.toLocaleString('en-US')})`),
      ]),
      shown.length ? h('ul', { class: 'sv-examples' }, shown.map((e) => h('li', null, [e.line ? h('span', { class: 'sv-line' }, `line ${e.line}`) : null, e.value]))) : null,
      it.count > shown.length ? h('p', { class: 'muted' }, `${(it.count - shown.length).toLocaleString('en-US')} more in the CSV${it.count > it.examples.length ? ` (the CSV lists the first ${it.examples.length})` : ''}.`) : null,
    ]),
  ]);
}

// The server sends dates as YYYY-MM-DD; a file judged in this browser has them in milliseconds.
const count = (n, one, tail = '') => `${n.toLocaleString('en-US')} ${one}${n === 1 ? '' : 's'}${tail}`;
const day = (x) => (typeof x === 'number' ? new Date(x).toISOString().slice(0, 10) : x);

function fileBlock(f) {
  const facts = [
    KINDS[f.kind] ?? f.kind,
    f.kind === 'sitemapindex' ? count(f.sitemapCount, 'sitemap', ' listed') : f.kind === 'unfetched' ? null : count(f.urlCount, 'URL'),
    f.bytes !== null && f.bytes !== undefined ? `${f.truncated ? 'over ' : ''}${sizeWords(f.bytes)}` : null,
    f.lastmod?.dated ? `lastmod ${day(f.lastmod.oldest)} to ${day(f.lastmod.newest)}` : null,
  ].filter(Boolean).join(' · ');
  return h('section', { class: 'sv-file' }, [
    h('h3', { class: 'sv-file-url' }, f.url ?? 'Pasted file'),
    h('p', { class: 'muted' }, facts),
    f.issues.length ? h('ul', { class: 'sv-issues' }, f.issues.map(issueItem)) : h('p', { class: 'sv-clean' }, 'No problems found in this file.'),
  ]);
}

function liveTable(rows) {
  if (!rows.length) return null;
  return h('div', { class: 'table-scroll' }, [h('table', { class: 'rules sv-live' }, [
    h('thead', null, [h('tr', null, ['URL', 'Answer', 'Verdict', 'What to do'].map((c) => h('th', { scope: 'col' }, c)))]),
    h('tbody', null, rows.map((r) => h('tr', { class: sevClass(r.severity) }, [
      h('td', { class: 'sv-url-cell' }, r.url),
      h('td', null, r.status === null ? '-' : String(r.status)),
      h('td', null, r.verdicts.map((v) => h('span', { class: `sv-v ${sevClass(LIVE_VERDICTS[v].severity)}` }, LIVE_VERDICTS[v].words))),
      h('td', null, r.summary),
    ]))),
  ])]);
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  return h('a', { href: url, download: name, class: 'btn btn-small' }, 'Download the CSV');
}

function showReport(box, report, { label, charged = null, nextBatch = false }) {
  box.textContent = '';
  const s = report.summary;
  const v = report.verdict ?? verdictOf(s);
  const parts = [
    h('p', { class: 'sv-label' }, label),
    h('p', { class: `sv-verdict v-${v}` }, `The sitemap ${VERDICT_WORDS[v]}`),
    h('p', { class: 'sv-answer' }, report.answer),
    tally(s),
    report.advice?.length ? h('ol', { class: 'sv-advice' }, report.advice.map((a) => h('li', null, a))) : null,
    h('p', { class: 'sv-downloads' }, [download(report.csv.name, report.csv.text)]),
    charged ? h('p', { class: 'muted' }, charged) : null,
    report.robots ? h('p', { class: 'muted' }, robotsLine(report.robots)) : null,
    report.note ? h('p', { class: 'muted' }, report.note) : null,
    ...report.files.map(fileBlock),
    report.live?.rows?.length ? h('h3', null, `Live checks: ${report.live.rows.length} of ${report.live.listed.toLocaleString('en-US')} listed URLs`) : null,
    report.live ? liveTable(report.live.rows) : null,
    nextBatch && report.live?.next !== null && report.live?.next !== undefined
      ? h('p', null, [h('button', { class: 'btn btn-quiet', type: 'button', onclick: () => runNext(report.live.next) }, `Check the next ${lastInput.live} URLs (from number ${report.live.next + 1})`)])
      : null,
    report.checkedAt ? h('p', { class: 'muted' }, `Checked ${new Date(report.checkedAt).toUTCString()}.`) : null,
  ];
  box.append(...parts.filter(Boolean));
}

function robotsLine(r) {
  if (r.state === 'rules') return `robots.txt was read${r.listsSitemap ? ' and names this sitemap in a Sitemap: line' : '; it has no Sitemap: line for this address'}. Every listed URL on this host was tested against its rules for Googlebot.`;
  if (r.state === 'none') return `robots.txt answered ${r.detail}: no rules, so nothing is blocked.`;
  if (r.state === 'unreachable') return `robots.txt could not be read (${r.detail}): crawlers must then assume everything is disallowed.`;
  return 'robots.txt was not checked.';
}

// ---------- running ----------

async function send(input) {
  $('sv-error').textContent = '';
  $('sv-url-err').textContent = '';
  $('sv-status').textContent = 'Checking.';
  $('sv-go').disabled = true;
  try {
    const res = await T.run(SLUG, input);
    lastInput = input;
    const spent = res.charged?.amount ?? 0;
    const charged = spent > 0 ? `Charged $${(spent / 1e6).toFixed(4)} for ${res.result.billed.units} checks.` : 'Free.';
    showReport($('sv-out'), res.result, { label: 'Your report', charged, nextBatch: true });
    $('sv-status').textContent = 'Report ready.';
  } catch (err) {
    if (err.status === 401) $('sv-error').textContent = `This size of check needs an account so it can be paid from your balance. Sign in, or use ${CALL.freeWebLive} live URLs and ${CALL.freeWebSitemaps} child sitemaps or fewer.`;
    else {
      $('sv-error').textContent = err.message;
      if (err.fields?.url) $('sv-url-err').textContent = err.fields.url;
    }
    $('sv-status').textContent = '';
  } finally {
    $('sv-go').disabled = false;
  }
}

function runCheck(e) {
  e.preventDefault();
  const input = readForm();
  const r = readSitemapUrl(input.url);
  if (!r.url) { $('sv-url-err').textContent = r.error; return; }
  send(input);
}

function runNext(from) {
  if (!lastInput) return;
  send({ ...lastInput, liveFrom: from });
}

function runPaste() {
  $('sv-paste-error').textContent = '';
  const xml = $('sv-xml').value;
  const box = $('sv-paste-out');
  box.textContent = '';
  if (!xml.trim()) { $('sv-paste-error').textContent = 'Paste the sitemap first.'; return; }
  if (xml.length > CALL.pasteChars) { $('sv-paste-error').textContent = `Paste at most ${CALL.pasteChars.toLocaleString('en-US')} characters; check a larger file by its address.`; return; }
  const where = $('sv-paste-url').value.trim();
  let url = null;
  if (where) {
    const r = readSitemapUrl(where);
    if (!r.url) { $('sv-paste-error').textContent = r.error; return; }
    url = r.url;
  }
  const file = judgeFile(xml, { url, now: Date.now(), bytes: new TextEncoder().encode(xml).length });
  const s = summarise({ files: [file] });
  showReport(box, {
    summary: s, verdict: verdictOf(s), answer: answerLine(url ?? 'The pasted sitemap', s), files: [file],
    note: url ? null : 'Add the address it will live at to check the host, protocol and folder rules too.',
    csv: { name: 'sitemap-paste-check.csv', text: toCsv([file]) },
  }, { label: 'Pasted XML, checked in this browser' });
}

// ?url=...&live=10&pick=spread&max=10; run=1 runs a free-sized check on arrival.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  if (q.get('url')) $('sv-url').value = q.get('url');
  if (q.get('live') !== null && q.get('live') !== '') $('sv-live').value = q.get('live');
  if (q.get('pick') === 'spread') $('sv-pick').value = 'spread';
  if (q.get('max') !== null && q.get('max') !== '') { $('sv-max').value = q.get('max'); $('sv-more').open = true; }
  return q.get('run') === '1' && q.get('url') && isFree(readForm());
}

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('sv-code'), SLUG);
  const autorun = fromQuery();
  hint();
  for (const id of ['sv-live', 'sv-max', 'sv-pick']) $(id).addEventListener('input', hint);
  $('sv-form').addEventListener('submit', runCheck);
  $('sv-paste-go').addEventListener('click', runPaste);
  if (autorun) { $('sv-form').requestSubmit(); return; }
  try {
    const tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
    const sample = tool.examples.find((x) => x.input.op === 'check');
    if (sample) showReport($('sv-out'), sample.output, { label: 'Worked example, not a real site' });
  } catch {
    // The sample sentence and list in the page stay.
  }
}

start();
