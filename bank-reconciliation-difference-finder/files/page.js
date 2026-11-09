// The bank reconciliation difference finder page. The preview and the transposition check run here, in
// the browser, with core.js (the file the server runs): nothing is uploaded for them. "Get the full
// report" sends both files to the server (Endwise.run, paid), which runs the same engine and returns
// every line, hint, the balance trail, the statement and the CSVs.
import { preview, check, parseMoney, money, longDate, SAMPLE_STATEMENT, SAMPLE_LEDGER, HINT_WORDS, KIND_WORDS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'bank-reconciliation-difference-finder';
const $ = (id) => document.getElementById(id);

const state = { statement: null, ledger: null, sample: true };

function settings() {
  const int = (id, lo, hi) => { const v = $(id).value; const n = Number(v); return v !== '' && Number.isInteger(n) && n >= lo && n <= hi ? n : undefined; };
  const text = (id) => $(id).value.trim() || undefined;
  const o = {
    windowDays: int('rd-window', 0, 60),
    staleDays: int('rd-stale', 1, 3660),
    statementOpening: text('rd-sopen'),
    statementClosing: text('rd-sclose'),
    ledgerOpening: text('rd-lopen'),
    periodEnd: text('rd-end'),
    compare: $('rd-compare').value,
    account: text('rd-account'),
    dateOrder: $('rd-order').value,
  };
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
}

const table = (head, rows, cls = 'rd-table') => h('table', { class: cls }, [
  h('thead', {}, h('tr', {}, head.map((c) => h('th', { scope: 'col' }, c)))),
  h('tbody', {}, rows.map((r) => h('tr', r.cls ? { class: r.cls } : {}, (r.cells ?? r).map((c) => h('td', {}, c))))),
]);
const stmtRows = (s) => [
  ['Balance per bank statement', money(s.statementBalance)],
  ['Add: deposits in transit', money(s.depositsInTransit)],
  ['Less: outstanding checks and payments', money(-s.outstanding)],
  { cls: 'rd-total', cells: ['Adjusted bank balance', money(s.adjustedBank)] },
  ['Balance per books', money(s.booksBalance)],
  ['Bank lines not in the books', money(s.bankOnly)],
  ['Corrections the hints point to', money(s.corrections)],
  ...(s.afterPeriod ? [['Books entries dated after the statement', money(s.afterPeriod)]] : []),
  { cls: 'rd-total', cells: ['Adjusted books balance', money(s.adjustedBooks)] },
];

const stmtItems = (s) => [
  ['Balance per bank statement', money(s.statementBalance), 'The statement file'],
  ['Add: deposits in transit', money(s.depositsInTransit), 'Books deposits the bank has not shown yet'],
  ['Less: outstanding checks and payments', money(-s.outstanding), 'Books payments that have not cleared'],
  ['Adjusted bank balance', money(s.adjustedBank), 'Must equal the adjusted books balance', true],
  ['Balance per books', money(s.booksBalance), 'The ledger file'],
  ['Bank lines not in the books', money(s.bankOnly), 'On the statement, missing from the ledger'],
  ['Corrections the hints point to', money(s.corrections), 'Likely transpositions, slides, sign flips and doubles'],
  ...(s.afterPeriod ? [['Books entries dated after the statement', money(s.afterPeriod), 'Ledger lines after the statement date']] : []),
  ['Adjusted books balance', money(s.adjustedBooks), 'Must equal the adjusted bank balance', true],
];

// ---------- the free preview ----------

function showPreview() {
  $('rd-error').textContent = '';
  $('rd-report').replaceChildren();
  if (!state.statement || !state.ledger) { $('rd-preview').replaceChildren(); $('rd-answer').textContent = 'Add the statement and the ledger for the same account.'; return; }
  let r;
  try {
    r = preview({ statement: state.statement, ledger: state.ledger }, settings());
  } catch (err) {
    $('rd-preview').replaceChildren();
    $('rd-answer').textContent = '';
    $('rd-error').textContent = err.message;
    return;
  }
  const linked = $('rd-label').dataset.example === '1';
  $('rd-tag').hidden = !state.sample && !linked;
  if (state.sample) $('rd-label').textContent = 'Example: a made-up bakery\'s October bank statement and ledger';
  else if (!linked) $('rd-label').textContent = 'Preview of your files';
  $('rd-answer').textContent = r.answer;
  const c = r.counts;
  const f = r.files;
  $('rd-preview').replaceChildren(
    // The reconciliation statement, one line per figure with where it comes from.
    h('ol', { class: 'dz-items' }, stmtItems(r.statement).map(([k, v, src, tot]) => h('li', { class: tot ? 'tot' : '' }, [h('b', {}, k), h('span', {}, v), h('small', {}, src)]))),
    h('details', { class: 'dz-fold rd-fold' }, [h('summary', {}, 'What the full report will list, and the files read'),
    h('h3', { class: 'rd-h' }, 'What the report will list'),
    table(['', 'Lines'], [
      ['Matched one to one, or as a split', String(c.matched)],
      ['Likely errors (transpositions, slides, sign flips, wrong amounts, entered twice)', String(c.hints)],
      ['Bank lines missing from the books', String(c.bankOnly)],
      ['Outstanding checks and payments', String(c.outstanding)],
      ['Deposits in transit', String(c.depositsInTransit)],
      ['Stale (older than the stale setting)', String(c.stale)],
    ]),
    h('h3', { class: 'rd-h' }, 'Files read'),
    h('ul', { class: 'rd-list' }, [
      h('li', {}, `Statement: ${f.statement.lines.toLocaleString('en-US')} lines from a ${f.statement.layout.name}${f.statement.balanceColumn ? ` (balance column, ${f.statement.balanceColumn})` : ''}.`),
      h('li', {}, `Ledger: ${f.ledger.lines.toLocaleString('en-US')} lines from a ${f.ledger.layout.name}${f.ledger.account ? ` (${f.ledger.account})` : ''}.`),
      h('li', {}, r.balances.known ? `Opening balances: statement ${money(r.balances.statementOpening)} (${r.balances.statementFrom.opening}), books ${money(r.balances.ledgerOpening)} (${r.balances.ledgerFrom}).` : 'Opening balances: not in both files, so the two are assumed to agree before the first line.'),
      ...r.warnings.map((w) => h('li', { class: 'rd-warn' }, w)),
    ])]),
  );
}

// ---------- the paid report ----------

const lineText = (l) => (l ? `${l.side === 'statement' ? 'Bank' : 'Books'} line ${l.line}, ${l.date}, ${money(l.amount)}${l.name || l.memo ? `, ${[l.name, l.memo].filter(Boolean).join(' ')}` : ''}${l.ref ? ` #${l.ref}` : ''}` : '');
const download = (name, text, body) => h('a', { href: URL.createObjectURL(new Blob([body], { type: 'text/csv' })), download: name, class: 'btn btn-small' }, text);

function showReport(r, charged) {
  const out = [
    h('p', { class: 'rd-label' }, 'Full report'),
    h('p', { class: 'rd-downloads' }, [
      download('reconciliation-statement.csv', 'Reconciliation statement (CSV)', r.csv.statement),
      download('reconciliation-lines.csv', 'Every line with its status (CSV)', r.csv.lines),
    ]),
    h('p', { class: 'muted' }, charged > 0 ? `Charged $${(charged / 1e6).toFixed(2)}.` : 'No charge for this one.'),
    h('p', {}, r.breakAt ? `Break: ${r.breakAt.text}.` : 'No break: once timing items are set aside, the balances agree on every date.'),
  ];
  if (r.hints.length) {
    out.push(h('h3', { class: 'rd-h' }, 'Likely errors, in date order'));
    out.push(table(['Date', 'Kind', 'Bank', 'Books', 'Effect', 'What to check'], r.hints.map((x) => [x.date, HINT_WORDS[x.kind], lineText(x.bank ?? (x.kind === 'bank-duplicate' ? x.twin : null)), lineText(x.books ?? null), money(x.effect), x.text])));
  }
  if (r.trail.length) {
    out.push(h('h3', { class: 'rd-h' }, 'The difference that is not timing, date by date'));
    out.push(table(['Date', 'Change', 'Difference after', 'Why'], [
      ['Opening', '', money(r.balances.openingDifference), 'The gap between the two opening balances'],
      ...r.trail.map((t) => [t.date, money(t.change), money(t.after), t.items.join('; ')]),
    ]));
  }
  if (r.items.length) {
    out.push(h('h3', { class: 'rd-h' }, 'Timing items and lines on one side'));
    out.push(table(['Date', 'What', 'Line', 'Age at the statement date'], r.items.map((i) => [i.line.date, i.what ? `${KIND_WORDS[i.kind]} (${i.what})` : KIND_WORDS[i.kind], lineText(i.line), i.age === null ? '' : `${i.age} days${i.stale ? ', stale' : ''}`])));
  }
  if (r.several.length) out.push(h('p', { class: 'rd-warn' }, `${r.several.length} ${r.several.length === 1 ? 'line has' : 'lines have'} more than one set of lines on the other side that add up to it; none was picked. The CSV lists them as unmatched.`));
  out.push(h('h3', { class: 'rd-h' }, 'Matches'));
  out.push(table(['Kind', 'Bank', 'Books', 'Note'], r.matches.map((m) => [m.kind === 'split' ? 'split' : m.kind === 'far' ? 'far apart' : 'one to one', m.bank.map(lineText).join('; '), m.books.map(lineText).join('; '), [m.sameRef ? 'same reference' : '', m.ambiguous ? 'another line was equally close' : '', m.gap ? `${m.gap} days apart` : ''].filter(Boolean).join('; ')])));
  if (r.truncated) out.push(h('p', { class: 'rd-warn' }, `Only the first 3,000 lines are shown; the CSV holds them all.`));
  $('rd-report').replaceChildren(...out);
}

async function runReport() {
  if (!state.statement || !state.ledger) return;
  $('rd-error').textContent = '';
  $('rd-status').textContent = 'Working out the report.';
  try {
    const res = await T.run(SLUG, { op: 'report', statement: state.statement, ledger: state.ledger, ...settings() });
    showReport(res.result, res.charged?.amount ?? 0);
    $('rd-status').textContent = 'The report is ready.';
  } catch (err) {
    $('rd-status').textContent = '';
    $('rd-error').textContent = err.status === 401 ? 'The full report needs an account, so it can be paid from your balance ($3.00). Sign in, then press the button again. The preview stays free.' : err.message;
  }
}

// ---------- the transposition check ----------

function showCheck() {
  const d = parseMoney($('rd-diff').value);
  if (d === null) { $('rd-check-answer').textContent = 'Type the difference as an amount, like 90.00.'; return; }
  const amounts = $('rd-amounts').value.split(/[\n;]+/).map((s) => parseMoney(s.trim())).filter((x) => x !== null);
  $('rd-check-answer').textContent = check(d, amounts).answer;
}

// ---------- files and start ----------

async function readText(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { return new TextDecoder('windows-1252').decode(bytes); }
}

function load(kind, text, name) {
  state.sample = name === 'sample';
  $('rd-label').dataset.example = '';
  state[kind] = text;
  $(`rd-${kind}-name`).textContent = name === 'sample' ? `The made-up ${kind} is loaded.` : `${name}: read in your browser, not uploaded.`;
  showPreview();
}

// ?statement=<CSV>&ledger=<CSV> load a worked example (content pages link here with theirs); window, end,
// sopen, sclose, lopen, stale, compare, account and order preset the settings; diff and amounts fill the
// transposition check.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const set = (id, v) => { if (v !== null && v !== '') $(id).value = v; };
  set('rd-window', q.get('window')); set('rd-stale', q.get('stale')); set('rd-account', q.get('account'));
  set('rd-sopen', q.get('sopen')); set('rd-sclose', q.get('sclose')); set('rd-lopen', q.get('lopen'));
  if (/^\d{4}-\d{2}-\d{2}$/.test(q.get('end') ?? '')) $('rd-end').value = q.get('end');
  if (['auto', 'same', 'flipped'].includes(q.get('compare'))) $('rd-compare').value = q.get('compare');
  if (['auto', 'mdy', 'dmy'].includes(q.get('order'))) $('rd-order').value = q.get('order');
  if (['sopen', 'sclose', 'lopen', 'end', 'compare', 'stale'].some((k) => q.get(k))) $('rd-more').open = true;
  if (q.get('diff')) { set('rd-diff', q.get('diff')); $('rd-amounts').value = (q.get('amounts') ?? '').split(';').join('\n'); showCheck(); }
  const st = q.get('statement'); const lg = q.get('ledger');
  const ok = (s) => s && s.length <= 8000;
  if (ok(st) && ok(lg)) {
    state.statement = st; state.ledger = lg; state.sample = false;
    $('rd-statement-name').textContent = 'The example\'s statement is loaded.';
    $('rd-ledger-name').textContent = 'The example\'s ledger is loaded.';
    $('rd-label').textContent = 'The worked example from the page you came from';
    $('rd-label').dataset.example = '1';
    showPreview();
    return true;
  }
  return false;
}

function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('rd-code'), SLUG);
  for (const kind of ['statement', 'ledger']) {
    $(`rd-${kind}`).addEventListener('change', async () => { const f = $(`rd-${kind}`).files[0]; if (f) load(kind, await readText(f), f.name); });
    const el = $(`rd-${kind}-drop`);
    el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('over'); });
    el.addEventListener('dragleave', () => el.classList.remove('over'));
    el.addEventListener('drop', async (e) => { e.preventDefault(); el.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f) load(kind, await readText(f), f.name); });
  }
  $('rd-sample').addEventListener('click', () => { state.statement = SAMPLE_STATEMENT; load('ledger', SAMPLE_LEDGER, 'sample'); $('rd-statement-name').textContent = 'The made-up statement is loaded.'; });
  for (const id of ['rd-window', 'rd-stale', 'rd-sopen', 'rd-sclose', 'rd-lopen', 'rd-end', 'rd-compare', 'rd-account', 'rd-order']) $(id).addEventListener('change', showPreview);
  $('rd-diff').addEventListener('input', showCheck);
  $('rd-amounts').addEventListener('input', showCheck);
  $('rd-go').addEventListener('click', runReport);
  if (!fromQuery()) { state.statement = SAMPLE_STATEMENT; load('ledger', SAMPLE_LEDGER, 'sample'); $('rd-statement-name').textContent = 'The made-up statement is loaded.'; }
}

start();
