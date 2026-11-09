// The bank-feed duplicate finder page. The preview runs here, in the browser, with core.js (the file
// the server runs): both files are read and paired without uploading anything. "Get the full report"
// sends them to the server (Endwise.run, paid), which runs the same engine and returns every pair, the
// copy to keep, the action and the CSVs.
import { preview, money, longDate, SAMPLE_FEED, SAMPLE_BOOKS, KIND_WORDS, CAUSE_WORDS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'bank-feed-duplicate-finder';
const $ = (id) => document.getElementById(id);

const state = { feed: null, feedName: null, books: null, booksName: null, sample: true };

function settings() {
  const w = Number($('bd-window').value);
  const o = {
    windowDays: $('bd-window').value !== '' && Number.isInteger(w) && w >= 0 && w <= 31 ? w : undefined,
    platform: $('bd-platform').value,
    compare: $('bd-compare').value,
    account: $('bd-account').value.trim() || undefined,
    dateOrder: $('bd-order').value,
  };
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
}
const files = () => ({ ...(state.feed ? { feed: state.feed } : {}), ...(state.books ? { books: state.books } : {}) });

const table = (head, rows) => h('table', { class: 'bd-table' }, [
  h('thead', {}, h('tr', {}, head.map((c) => h('th', { scope: 'col' }, c)))),
  h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c) => h('td', {}, c))))),
]);

// ---------- the free preview ----------

function showPreview() {
  $('bd-error').textContent = '';
  $('bd-report').replaceChildren();
  if (!state.feed && !state.books) { $('bd-preview').replaceChildren(); $('bd-answer').textContent = 'Add a bank-feed file, a books file, or both.'; return; }
  let r;
  try {
    r = preview(files(), settings());
  } catch (err) {
    $('bd-preview').replaceChildren();
    $('bd-answer').textContent = '';
    $('bd-error').textContent = err.message;
    return;
  }
  $('bd-tag').hidden = !state.sample && !state.linked;
  $('bd-label').textContent = state.sample ? 'Example: a made-up bakery\'s October register and the bank lines waiting in For review' : state.linked ? 'Example: the worked example from the page you came from' : 'Preview of your files';
  $('bd-answer').textContent = r.answer;
  const c = r.counts;
  const fileLines = Object.entries(r.files).map(([side, f]) => h('li', {}, `${side === 'feed' ? 'Bank feed' : 'Books'}: ${f.lines.toLocaleString('en-US')} lines read from a ${f.layout.name}${f.account ? ` (${f.account})` : ''}${f.orderProof && f.orderProof !== 'chosen' ? `; dates read ${f.dateOrder === 'dmy' ? 'DD/MM' : 'MM/DD'}, as ${f.orderProof} proves` : ''}.`));
  $('bd-preview').replaceChildren(
    // One line per kind of pair: how many, and the total of the copies to act on.
    h('ol', { class: 'dz-items' }, [
      ['In the feed twice', c.byKind['feed-twice'], r.totals.feedTwice, 'two bank-feed lines'],
      ['Feed line already in the books', c.byKind['already-entered'], r.totals.alreadyEntered, 'a feed line and a books entry'],
      ['In the books twice', c.byKind['books-twice'], r.totals.booksTwice, 'two books entries: the balance is low by this much'],
    ].map(([k, n, total, src]) => h('li', {}, [h('b', {}, k), h('span', {}, money(total)), h('small', {}, `${n} ${n === 1 ? 'pair' : 'pairs'}, ${src}`)]))
      .concat(h('li', { class: 'tot' }, [h('b', {}, 'All'), h('span', {}, money(r.totals.feedTwice + r.totals.alreadyEntered + r.totals.booksTwice)), h('small', {}, `${c.pairs} pairs, the same amount within ${r.windowDays} days`)]))),
    h('p', { class: 'muted' }, `Confidence: ${c.high} high, ${c.medium} medium, ${c.low} low. Actions in ${r.platformName}'s words.`),
    h('h3', { class: 'bd-h' }, 'Files read'),
    h('ul', { class: 'bd-list' }, [...fileLines, ...r.warnings.map((w) => h('li', { class: 'bd-warn' }, w))]),
  );
}

// ---------- the paid report ----------

const lineText = (l) => `${l.side === 'feed' ? 'Feed' : 'Books'} line ${l.line}, ${l.date}${l.name || l.memo ? `, ${[l.name, l.memo].filter(Boolean).join(' ')}` : ''}${l.ref ? ` #${l.ref}` : ''}${l.status ? ` (${l.status})` : ''}${l.source ? ` [${l.source}]` : ''}`;
const download = (name, text, body) => h('a', { href: URL.createObjectURL(new Blob([body], { type: 'text/csv' })), download: name, class: 'btn btn-small' }, text);

function showReport(r, charged) {
  const out = [
    h('p', { class: 'bd-label' }, 'Full report'),
    h('p', { class: 'bd-downloads' }, [
      download('exclude-ready.csv', `Exclude-ready list (${r.counts.pairs})`, r.csv.exclude),
      download('duplicate-pairs.csv', 'All pairs with scores', r.csv.pairs),
    ]),
    h('p', { class: 'muted' }, charged > 0 ? `Charged $${(charged / 1e6).toFixed(2)}.` : 'No charge for this one.'),
  ];
  for (const p of r.patterns) {
    out.push(h('p', { class: 'bd-warn' }, `From ${longDate(p.from)} to ${longDate(p.to)}, ${p.share}% of the feed lines ${p.kind === 'feed-twice' ? 'came in twice' : 'are already in the books'}: ${p.pairs} pairs, ${money(Math.abs(p.total))} in all.`));
  }
  if (r.pairs.length) {
    out.push(h('h3', { class: 'bd-h' }, 'The pairs, in date order'));
    out.push(table(['#', 'Confidence', 'Amount', 'Remove or act on', 'Keep', 'Action', 'Why'], r.pairs.map((p) => [
      String(p.n),
      h('span', { class: `bd-conf bd-conf-${p.confidence}` }, p.confidence),
      money(p.amount),
      lineText(p.extra),
      lineText(p.keep),
      p.action,
      `${KIND_WORDS[p.kind]}: ${CAUSE_WORDS[p.cause]}; ${p.keepWhy}; ${p.gapDays} ${p.gapDays === 1 ? 'day' : 'days'} apart${p.flags.length ? `; ${p.flags.join('; ')}` : ''}.`,
    ])));
  }
  if (r.truncated) out.push(h('p', { class: 'bd-warn' }, 'Only the first 2,000 pairs are shown; the CSVs hold them all.'));
  $('bd-report').replaceChildren(...out);
}

async function runReport() {
  if (!state.feed && !state.books) return;
  $('bd-error').textContent = '';
  $('bd-status').textContent = 'Working out the report.';
  try {
    const res = await T.run(SLUG, { op: 'report', ...files(), ...settings() });
    showReport(res.result, res.charged?.amount ?? 0);
    $('bd-status').textContent = 'The report is ready.';
  } catch (err) {
    $('bd-status').textContent = '';
    $('bd-error').textContent = err.status === 401 ? 'The full report needs an account, so it can be paid from your balance ($3.00). Sign in, then press the button again. The preview stays free.' : err.message;
  }
}

// ---------- files and start ----------

async function readText(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { return new TextDecoder('windows-1252').decode(bytes); }
}

function load(kind, text, name) {
  state.sample = name === 'sample';
  state.linked = false;
  if (kind === 'feed') { state.feed = text; state.feedName = name; $('bd-feed-name').textContent = name === 'sample' ? 'The made-up bank lines are loaded.' : `${name}: read in your browser, not uploaded.`; }
  else { state.books = text; state.booksName = name; $('bd-books-name').textContent = name === 'sample' ? 'The made-up register is loaded.' : `${name}: read in your browser, not uploaded.`; }
  showPreview();
}

// ?feed=<CSV>&books=<CSV> load a worked example (content pages link here with theirs); window, platform,
// compare, account and order preset the settings.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const set = (id, v) => { if (v !== null && v !== '') $(id).value = v; };
  set('bd-window', q.get('window')); set('bd-account', q.get('account'));
  if (['auto', 'qbo', 'xero'].includes(q.get('platform'))) $('bd-platform').value = q.get('platform');
  if (['auto', 'same', 'flipped'].includes(q.get('compare'))) $('bd-compare').value = q.get('compare');
  if (['auto', 'mdy', 'dmy'].includes(q.get('order'))) $('bd-order').value = q.get('order');
  const feed = q.get('feed'); const books = q.get('books');
  const ok = (s) => s && s.length <= 8000;
  if (ok(feed) || ok(books)) {
    state.feed = ok(feed) ? feed : null; state.books = ok(books) ? books : null; state.sample = false;
    $('bd-feed-name').textContent = state.feed ? 'The example\'s bank lines are loaded.' : 'No bank-feed file in this example.';
    $('bd-books-name').textContent = state.books ? 'The example\'s books file is loaded.' : 'No books file in this example.';
    state.linked = true;
    showPreview();
    return true;
  }
  return false;
}

function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('bd-code'), SLUG);
  $('bd-feed').addEventListener('change', async () => { const f = $('bd-feed').files[0]; if (f) load('feed', await readText(f), f.name); });
  $('bd-books').addEventListener('change', async () => { const f = $('bd-books').files[0]; if (f) load('books', await readText(f), f.name); });
  $('bd-sample').addEventListener('click', () => { state.feed = SAMPLE_FEED; $('bd-feed-name').textContent = 'The made-up bank lines are loaded.'; load('books', SAMPLE_BOOKS, 'sample'); });
  for (const id of ['bd-window', 'bd-platform', 'bd-compare', 'bd-account', 'bd-order']) $(id).addEventListener('change', showPreview);
  for (const [zone, kind] of [['bd-feed-drop', 'feed'], ['bd-books-drop', 'books']]) {
    const el = $(zone);
    el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('over'); });
    el.addEventListener('dragleave', () => el.classList.remove('over'));
    el.addEventListener('drop', async (e) => { e.preventDefault(); el.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f) load(kind, await readText(f), f.name); });
  }
  $('bd-go').addEventListener('click', runReport);
  if (!fromQuery()) { state.feed = SAMPLE_FEED; state.feedName = 'sample'; $('bd-feed-name').textContent = 'The made-up bank lines are loaded.'; load('books', SAMPLE_BOOKS, 'sample'); }
}

start();
