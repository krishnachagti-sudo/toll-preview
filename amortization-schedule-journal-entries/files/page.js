// The amortization schedule page. The preview runs here, in the browser, with core.js (the file the
// server runs): the schedules are read and the month worked out without sending anything. "Get the
// entries" sends them to the server (Endwise.run, paid per schedule), which runs the same engine and
// returns every month's journals and the import file.
import { preview, readTemplate, templateCsv, money, monthName, longDate, SAMPLE, TYPE_WORDS, TEMPLATE_COLUMNS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'amortization-schedule-journal-entries';
const $ = (id) => document.getElementById(id);
const state = { sample: true };

const table = (head, rows, numCols = []) => h('table', { class: 'am-table' }, [
  h('thead', {}, h('tr', {}, head.map((c, i) => h('th', { scope: 'col', class: numCols.includes(i) ? 'am-num' : '' }, c)))),
  h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, i) => h('td', { class: numCols.includes(i) ? 'am-num' : '' }, c))))),
]);

// GL balances typed one per line: "Prepaid Insurance, 7000.00".
function glBalances() {
  const out = {};
  for (const line of $('am-gl').value.split('\n')) {
    const m = /^(.*\S)\s*,\s*(\S+)\s*$/.exec(line.trim());
    if (m) out[m[1]] = m[2].replace(/[$,]/g, '');
  }
  return Object.keys(out).length ? out : undefined;
}

function request(op) {
  const base = { csv: $('am-csv').value, loanEntry: $('am-loan').value };
  if ($('am-initial').checked) base.includeInitial = true;
  const gl = glBalances();
  if (gl) base.glBalances = gl;
  if (op === 'preview') return { op, period: $('am-period').value, ...base };
  return { op, from: $('am-from').value || undefined, to: $('am-to').value || undefined, format: $('am-format').value, ...base };
}

// ---------- the free preview ----------

function showPreview() {
  $('am-error').textContent = '';
  $('am-report').replaceChildren();
  let r;
  try {
    r = preview(request('preview'));
  } catch (err) {
    $('am-preview').replaceChildren();
    $('am-answer').textContent = '';
    $('am-error').textContent = err.message;
    return;
  }
  const linked = state.linked && !state.sample;
  $('am-tag').hidden = !state.sample && !linked;
  $('am-label').textContent = state.sample ? `Example: a made-up services company's policy, software subscription, support contract and equipment loan, ${monthName(r.period)}` : linked ? 'Example: the worked example from the page you came from' : `Preview of ${monthName(r.period)}`;
  $('am-answer').textContent = r.answer;
  const rows = r.schedules.map((s) => [
    s.id,
    TYPE_WORDS[s.type],
    s.type === 'loan' ? `${money(s.thisMonth)} (interest ${money(s.interest)}, principal ${money(s.principal)})` : money(s.thisMonth),
    money(s.balance),
  ]);
  // One line per schedule: this month's amount, and the accounts and balance it comes from.
  const items = h('ol', { class: 'dz-items' }, r.schedules.map((s) => h('li', {}, [
    h('b', {}, s.id),
    h('span', {}, money(s.thisMonth)),
    h('small', {}, s.type === 'loan'
      ? `${TYPE_WORDS[s.type]}: interest ${money(s.interest)}, principal ${money(s.principal)}; ${money(s.balance)} owed at month end`
      : `${TYPE_WORDS[s.type]}: ${s.accounts.balance} to ${s.accounts.pl}; ${money(s.balance)} left at month end`),
  ])));
  const out = [
    items,
    h('details', { class: 'dz-fold am-fold' }, [
      h('summary', {}, 'The schedule table and the rollforward by account'),
      table(['Schedule', 'Type', 'This month', 'Balance at month end'], rows, [2, 3]),
      h('h3', { class: 'am-h' }, 'Rollforward by account'),
      table(['Account', 'Opening', 'Added', 'Amortized or paid', 'Cancelled', 'Closing'], r.rollforward.map((a) => [a.account, money(a.opening), money(a.additions), money(a.reductions), money(a.cancellations), money(a.closing)]), [1, 2, 3, 4, 5]),
    ]),
  ];
  if (r.tieOut) {
    out.push(h('h3', { class: 'am-h' }, 'Tie-out to the GL'));
    out.push(h('ul', { class: 'am-list' }, r.tieOut.map((t) => (t.gl === null
      ? h('li', {}, `${t.account}: no GL balance given; the schedules say ${money(t.schedule)}.`)
      : h('li', { class: t.ties ? 'am-ok' : 'am-warn' }, t.ties ? `${t.account}: ties at ${money(t.gl)}.` : `${t.account}: the GL says ${money(t.gl)}, the schedules ${money(t.schedule)}; difference ${money(t.difference)}.`)))));
  }
  const rule = r.schedules.filter((s) => s.twelveMonthRule);
  if (rule.length) {
    out.push(h('h3', { class: 'am-h' }, '12-month rule (tax, duration test only)'));
    out.push(h('ul', { class: 'am-list' }, rule.map((s) => h('li', {}, `${s.id}: ${s.twelveMonthRule.words}`))));
  }
  $('am-preview').replaceChildren(...out);
}

// ---------- the paid entries ----------

const download = (name, text, body) => h('a', { href: URL.createObjectURL(new Blob([body], { type: 'text/csv' })), download: name, class: 'btn btn-small' }, text);

function showReport(r, charged) {
  const out = [
    h('p', { class: 'am-label' }, `Entries ${monthName(r.from)} to ${monthName(r.to)}`),
    h('p', { class: 'am-downloads' }, r.files.map((f, i) => download(f.name, r.files.length > 1 ? `Import file, part ${i + 1}` : 'Import file', f.csv))),
    h('p', { class: 'muted' }, `${r.journals} journals, ${r.lines} lines. ${charged > 0 ? `Charged $${(charged / 1e6).toFixed(2)}.` : 'No charge for this one.'}`),
  ];
  for (const w of r.warnings) out.push(h('p', { class: 'am-warn' }, w));
  for (const s of r.schedules) {
    out.push(h('h3', { class: 'am-h' }, `${s.id} (${TYPE_WORDS[s.type]})`));
    out.push(s.type === 'loan'
      ? table(['#', 'Date', 'Payment', 'Interest', 'Principal', 'Balance'], s.rows.map((x) => [String(x.n), longDate(x.date), money(x.payment), money(x.interest), money(x.principal), money(x.closing)]), [2, 3, 4, 5])
      : table(['#', 'Month', 'Amount', 'Balance'], s.rows.map((x) => [String(x.n), x.cancelled ? `${monthName(x.month)} (cancelled)` : monthName(x.month), money(x.cents), money(x.closing)]), [2, 3]));
  }
  $('am-report').replaceChildren(...out);
}

async function runJournal() {
  $('am-error').textContent = '';
  $('am-status').textContent = 'Working out the entries.';
  try {
    const res = await T.run(SLUG, request('journal'));
    showReport(res.result, res.charged?.amount ?? 0);
    $('am-status').textContent = 'The entries are ready.';
  } catch (err) {
    $('am-status').textContent = '';
    $('am-error').textContent = err.status === 401 ? 'The entries and import file need an account, so they can be paid from your balance ($0.50 per schedule). Sign in, then press the button again. The preview stays free.' : err.message;
  }
}

// ---------- adding, files and start ----------

function addRow() {
  const q = (v) => (/[",]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const type = $('am-type').value;
  const raw = {
    id: $('am-item').value.trim() || undefined, type, amount: $('am-amount').value.replace(/[$,]/g, ''), start: $('am-start').value,
    months: Number($('am-months').value) || undefined, method: type === 'loan' ? undefined : $('am-method').value,
    rate: type === 'loan' ? Number($('am-rate').value) || 0 : undefined,
  };
  const line = templateCsv([{ ...raw, amount: Number(raw.amount) || 0 }]).split('\r\n')[1];
  const current = $('am-csv').value.trim();
  $('am-csv').value = state.sample || !current ? `${TEMPLATE_COLUMNS.map(q).join(',')}\n${line}\n` : `${current}\n${line}\n`;
  state.sample = false;
  showPreview();
}

const blankTemplate = () => `${TEMPLATE_COLUMNS.join(',')}\r\n`;

// ?csv=<rows> loads a worked example (content pages link here with theirs); ?type&amount&start&months
// &method&rate&id add one schedule; period, from, to, format and loanEntry preset the settings.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const set = (id, v) => { if (v) $(id).value = v; };
  set('am-period', q.get('period')); set('am-from', q.get('from') ?? q.get('period')); set('am-to', q.get('to') ?? q.get('period'));
  if (['qbo', 'xero', 'generic'].includes(q.get('format'))) $('am-format').value = q.get('format');
  if (['payment', 'interest-reclass'].includes(q.get('loanEntry'))) $('am-loan').value = q.get('loanEntry');
  const csv = q.get('csv');
  if (csv && csv.length <= 8000) {
    $('am-csv').value = csv;
    state.sample = false;
    state.linked = true;
    showPreview();
    $('am-label').textContent = 'Example: the worked example from the page you came from';
    return true;
  }
  if (q.get('type') && q.get('amount') && q.get('start')) {
    set('am-type', q.get('type')); set('am-amount', q.get('amount')); set('am-start', q.get('start')); set('am-months', q.get('months'));
    set('am-method', q.get('method')); set('am-rate', q.get('rate')); set('am-item', q.get('id'));
    addRow();
    return true;
  }
  return false;
}

function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('am-code'), SLUG);
  $('am-csv').addEventListener('input', () => { state.sample = false; state.linked = false; showPreview(); });
  for (const id of ['am-period', 'am-loan', 'am-initial', 'am-gl']) $(id).addEventListener('change', showPreview);
  $('am-add-row').addEventListener('click', addRow);
  $('am-sample').addEventListener('click', () => { $('am-csv').value = templateCsv(SAMPLE.schedules); state.sample = true; $('am-period').value = SAMPLE.period; showPreview(); });
  $('am-blank').addEventListener('click', () => {
    const a = h('a', { href: URL.createObjectURL(new Blob([blankTemplate()], { type: 'text/csv' })), download: 'amortization-schedules-template.csv' });
    document.body.append(a); a.click(); a.remove();
  });
  $('am-file').addEventListener('change', async () => {
    const f = $('am-file').files[0];
    if (!f) return;
    const text = await f.text();
    try { readTemplate(text); } catch (err) { $('am-error').textContent = err.message; return; }
    $('am-csv').value = text;
    state.sample = false;
    showPreview();
  });
  $('am-go').addEventListener('click', runJournal);
  if (!fromQuery()) { $('am-csv').value = templateCsv(SAMPLE.schedules); showPreview(); }
  if (new URLSearchParams(location.search).get('run') === '1') showPreview();
}

start();
