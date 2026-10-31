// The tax set-aside page. The worked example at rest is the tool's own first example, worked out on
// the server when it booted; every real answer comes from the server through Toll.run (signed in:
// the full answer, charged; signed out: the percentage on a free run). The year ledger lives in
// this browser's localStorage and is never sent anywhere except to a replay the visitor asks for.
import { usd, gbp, longDate, ukDate, STATUS_NAMES, NATION_NAMES } from './core.js';

const T = window.Toll;
const SLUG = 'tax-set-aside';
const $ = (id) => document.getElementById(id);
const h = (tag, attrs, children) => T.h(tag, attrs, children);
const STORE = 'tax-set-aside-ledger-v1';

let account = null;
let last = null; // { input, result } of the last full answer

const country = () => document.querySelector('input[name="country"]:checked').value;
const fmt = (c) => (c === 'UK' ? (n) => gbp(n, { pence: true }) : (n) => usd(n, { cents: true }));
const whole = (c) => (c === 'UK' ? gbp : usd);

// ---------- the form ----------

function syncCountry() {
  const c = country();
  document.querySelectorAll('[data-country]').forEach((el) => { el.hidden = el.dataset.country !== c; });
  $('ts-ytd-hint').textContent = c === 'UK'
    ? 'Profit from self-employment since 6 April 2026, less expenses. Use a minus sign for a loss so far.'
    : 'Income from self-employment since January 1, 2026, less expenses. Use a minus sign for a loss so far.';
  syncState();
}

let covered = {};
function fillStates(constants) {
  covered = constants.statesCovered;
  const all = { ...constants.statesCovered, ...constants.statesNotCovered };
  const sel = $('ts-state');
  sel.replaceChildren(h('option', { value: '', text: 'Federal only' }));
  for (const [slug, name] of Object.entries(all).sort((a, b) => a[1].localeCompare(b[1]))) {
    sel.append(h('option', { value: slug, text: covered[slug] ? name : `${name} (federal only)` }));
  }
  sel.value = 'texas';
}
function syncState() {
  const v = $('ts-state').value;
  $('ts-state-hint').textContent = !v ? 'No state tax is added.'
    : covered[v] ? `${covered[v]} income tax is included.`
    : 'This state\'s income tax is not included yet: the answer is federal only, and says so.';
}

const num = (id) => {
  const s = $(id).value.trim();
  return s === '' ? undefined : Number(s);
};

function readForm() {
  const errors = {};
  const c = country();
  const input = { op: 'payment', country: c, amount: num('ts-amount') };
  if (!(input.amount > 0)) errors['ts-amount'] = 'Enter the amount received, more than 0.';
  const date = $('ts-date').value;
  if (date) input.date = date; else errors['ts-date'] = 'Enter the date you were paid.';
  const exp = num('ts-expenses');
  if (exp !== undefined) { if (exp >= 0) input.expenses = exp; else errors['ts-expenses'] = 'Expenses cannot be negative.'; }
  const ytd = num('ts-ytd');
  if (ytd !== undefined) { if (Number.isFinite(ytd)) input.ytdNetProfit = ytd; else errors['ts-ytd'] = 'Enter a number.'; }
  if (c === 'US') {
    input.filingStatus = $('ts-status').value;
    if ($('ts-state').value) input.state = $('ts-state').value;
    const miles = num('ts-miles');
    if (miles) input.miles = miles;
    const tips = num('ts-tips');
    if (tips) { if (tips <= (input.amount ?? 0)) input.tips = tips; else errors['ts-tips'] = 'Tips cannot be more than the payment.'; }
    const w2 = num('ts-w2');
    if (w2) input.w2Wages = w2;
    if ($('ts-age').value !== '0') input.age65 = Number($('ts-age').value);
    if ($('ts-sstb').value) input.sstb = $('ts-sstb').value === 'yes';
  } else {
    input.nation = $('ts-nation').value;
    const salary = num('ts-salary');
    if (salary) input.salary = salary;
    if ($('ts-loan').value) input.studentLoan = $('ts-loan').value;
    if ($('ts-pg').checked) input.postgraduateLoan = true;
  }
  return { input, errors };
}

function showErrors(errors) {
  for (const el of document.querySelectorAll('.ts-form .field-error')) el.textContent = '';
  for (const [id, msg] of Object.entries(errors)) { const el = $(`${id}-err`); if (el) el.textContent = msg; }
}

// ---------- the answer ----------

const row = (label, value, cls) => h('tr', cls ? { class: cls } : null, [h('th', { scope: 'row', text: label }), h('td', { class: 'num', text: value })]);

function renderPercentage(input, result) {
  const out = $('ts-out');
  out.replaceChildren(
    h('p', { class: 'ts-kicker', text: 'Your answer (free run)' }),
    h('p', { class: 'ts-big num', text: `${result.percent.toFixed(1)}%` }),
    h('p', { class: 'ts-sub', text: `of this payment goes to your tax pot.` }),
    h('p', { class: 'muted', text: 'Sign in for the amount in dollars or pounds, the breakdown, the working with every source, the next due date and the year ledger: $0.10 a payment, never more than $2.49 a month.' }),
    h('p', null, [h('a', { class: 'btn btn-small', href: `${T.base}/account?next=${encodeURIComponent(window.location.pathname)}`, text: 'Sign in' })]),
  );
}

function render(input, result, { kind }) {
  const c = result.country;
  const m = fmt(c);
  const out = $('ts-out');
  const b = result.breakdown;
  const where = c === 'UK' ? NATION_NAMES[result.nation] : result.state ? result.state.name : 'federal only';
  const lines = c === 'UK'
    ? [row('Income Tax', m(b.incomeTax)), row('Class 4 National Insurance', m(b.class4)), ...(b.studentLoan ? [row('Student loan', m(b.studentLoan))] : [])]
    : [
      row('Self-employment tax', m(b.seTax)),
      ...(b.additionalMedicare ? [row('Additional Medicare Tax', m(b.additionalMedicare))] : []),
      row('Federal income tax', m(b.federalIncomeTax)),
      row(result.state?.covered ? `${result.state.name} income tax` : 'State income tax', result.state?.covered ? m(b.state) : 'not included'),
    ];
  const children = [
    h('p', { class: 'ts-kicker', text: kind === 'example' ? 'Worked example' : 'Your answer' }),
    h('p', { class: 'ts-big num', text: m(result.setAside) }),
    h('p', { class: 'ts-sub', text: `${result.percent.toFixed(1)}% of this ${whole(c)(result.payment.amount)} payment. ${c === 'US' ? `${STATUS_NAMES[result.filingStatus][0].toUpperCase()}${STATUS_NAMES[result.filingStatus].slice(1)}, ${where}` : where}, with ${whole(c)(result.ytdNetProfitBefore)} of profit before it.` }),
    h('div', { class: 'table-scroll' }, h('table', { class: 'ts-table' }, [h('tbody', null, [...lines, row('Set aside', m(result.setAside), 'ts-total')])])),
  ];
  if (c === 'UK') {
    children.push(h('p', { class: 'ts-poa' }, [h('strong', { text: `First year of Self Assessment? Set aside ${m(result.firstYearSetAside)} (${result.firstYearPercent.toFixed(1)}%). ` }), 'Your first January bill also carries the first payment on account for the next year, half of this year\'s tax again.']));
  }
  if (result.marginalRate !== null) children.push(h('p', { class: 'muted small', text: `That is ${result.marginalRate.toFixed(1)}% of the ${whole(c)(result.payment.net)} of profit this payment adds.` }));
  for (const x of [...result.crossings, ...result.flags]) children.push(h('p', { class: 'ts-flag', text: x }));
  if (result.nextDue) {
    children.push(h('p', { class: 'ts-due' }, c === 'UK'
      ? [h('strong', { text: `Next Self Assessment date: ${ukDate(result.nextDue.due)}. ` }), result.nextDue.what + '.']
      : [h('strong', { text: `Next federal estimated payment: ${longDate(result.nextDue.due)}` }), ` (Form 1040-ES, period ${result.nextDue.period}).${result.nextStateDue ? ` ${result.nextStateDue.state}: ${longDate(result.nextStateDue.due)}, ${Math.round(result.nextStateDue.share * 100)}% of the year's state estimate.` : ''}`]));
  }
  const working = h('details', { class: 'ts-working' }, [
    h('summary', { text: 'Show the working and sources' }),
    h('div', { class: 'table-scroll' }, h('table', { class: 'ts-table' }, h('tbody', null, result.working.map((w) => h('tr', null, [
      h('th', { scope: 'row' }, w.source ? h('a', { href: w.source, text: w.label, rel: 'noopener' }) : w.label),
      h('td', { class: 'num', text: w.value }),
    ]))))),
    h('ul', { class: 'ts-sources' }, result.sources.map((s) => h('li', null, [h('a', { href: s.url, text: s.name, rel: 'noopener' }), ` (read ${s.readOn})`]))),
    h('p', { class: 'muted small', text: `Input fingerprint ${result.inputHash}: the same inputs always give this answer.` }),
  ]);
  children.push(working);
  if (kind === 'answer') {
    last = { input, result };
    children.push(h('p', null, [h('button', { class: 'btn btn-quiet btn-small', type: 'button', text: 'Add to my year', onclick: addToYear })]));
  } else {
    children.push(h('p', { class: 'muted small', text: `Worked out on the server for the inputs shown in the form. Press "${$('ts-run').textContent}" to work out your own.` }));
  }
  out.replaceChildren(...children);
}

async function onSubmit(e) {
  e.preventDefault();
  $('ts-error').textContent = '';
  const { input, errors } = readForm();
  showErrors(errors);
  if (Object.keys(errors).length) return;
  const signedIn = Boolean(account);
  const body = signedIn ? input : { ...input, detail: 'percentage' };
  $('ts-run').disabled = true;
  $('ts-status-live').textContent = 'Working it out.';
  try {
    const res = await T.run(SLUG, body);
    if (signedIn) render(input, res.result, { kind: 'answer' }); else renderPercentage(input, res.result);
    $('ts-status-live').textContent = 'Done.';
  } catch (err) {
    $('ts-error').textContent = err.message;
    if (err.fields) showErrors(Object.fromEntries(Object.entries(err.fields).map(([k, v]) => [`ts-${{ ytdNetProfit: 'ytd', amount: 'amount', date: 'date', expenses: 'expenses', tips: 'tips' }[k] ?? k}`, v])));
  } finally {
    $('ts-run').disabled = false;
  }
}

// ---------- the year ledger (this browser only) ----------

function load() {
  try { return JSON.parse(localStorage.getItem(STORE)) ?? { rows: [], saved: null }; } catch { return { rows: [], saved: null }; }
}
function save(state) {
  try { localStorage.setItem(STORE, JSON.stringify(state)); } catch { /* storage off: the ledger lasts this visit */ }
}
let ledgerState = { rows: [], saved: null };

function addToYear() {
  if (!last) return;
  const { input, result } = last;
  ledgerState.rows.push({ country: result.country, date: input.date, amount: input.amount, expenses: input.expenses, miles: input.miles, tips: input.tips, setAside: result.setAside, profile: profileOf(input) });
  save(ledgerState);
  renderLedger();
  $('ts-ledger').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function profileOf(input) {
  const p = { ...input };
  for (const k of ['op', 'amount', 'date', 'expenses', 'miles', 'tips', 'ytdNetProfit', 'detail']) delete p[k];
  return p;
}

function renderLedger(note) {
  const body = $('ts-ledger-body');
  const rows = ledgerState.rows;
  if (!rows.length) {
    body.replaceChildren(h('p', { class: 'muted', text: 'Nothing yet. Work out a payment, then press "Add to my year".' }));
    return;
  }
  const c = rows[0].country;
  const m = fmt(c);
  const should = rows.reduce((s, r) => s + r.setAside, 0);
  const saved = ledgerState.saved ?? 0;
  body.replaceChildren(
    h('div', { class: 'table-scroll' }, h('table', { class: 'ts-table' }, [
      h('thead', null, h('tr', null, ['Date', 'Payment', 'Set aside'].map((t) => h('th', { scope: 'col', text: t })))),
      h('tbody', null, rows.map((r) => h('tr', null, [h('td', { text: r.date }), h('td', { class: 'num', text: m(r.amount) }), h('td', { class: 'num', text: m(r.setAside) })]))),
    ])),
    h('p', { class: 'ts-sum' }, [h('strong', { text: `Should be in your pot: ${m(should)}. ` }), saved >= should ? `You have ${m(saved)}, enough.` : `You have ${m(saved)}: move ${m(should - saved)} to catch up.`]),
    ...(note ? [h('p', { class: 'muted small', text: note })] : []),
  );
}

async function replay() {
  const rows = ledgerState.rows;
  if (!rows.length) return;
  if (!account) { $('ts-ledger-note').textContent = 'Sign in to replay your year: $0.10 per 25 payments.'; return; }
  const c = rows[0].country;
  const mixed = rows.some((r) => r.country !== c || JSON.stringify(r.profile) !== JSON.stringify(rows[0].profile));
  const input = { op: 'ledger', ...rows[0].profile, payments: rows.map((r) => Object.fromEntries(Object.entries({ date: r.date, amount: r.amount, expenses: r.expenses, miles: r.miles, tips: r.tips }).filter(([, v]) => v !== undefined))) };
  if (ledgerState.saved) input.savedToDate = ledgerState.saved;
  try {
    const res = await T.run(SLUG, input);
    const order = res.result.rows;
    ledgerState.rows = order.map((x) => ({ ...rows[x.index], setAside: x.setAside }));
    save(ledgerState);
    renderLedger(`Replayed in date order from a profit of zero${mixed ? ', using the settings of the first payment' : ''}.`);
  } catch (err) {
    $('ts-ledger-note').textContent = err.message;
  }
}

function downloadCsv() {
  const rows = ledgerState.rows;
  if (!rows.length) return;
  const lines = [['date', 'country', 'amount', 'expenses', 'miles', 'tips', 'set_aside'], ...rows.map((r) => [r.date, r.country, r.amount, r.expenses ?? '', r.miles ?? '', r.tips ?? '', r.setAside])];
  const blob = new Blob([lines.map((l) => l.join(',')).join('\r\n') + '\r\n'], { type: 'text/csv' });
  const a = h('a', { href: URL.createObjectURL(blob), download: 'tax-set-aside-year.csv' });
  document.body.append(a);
  a.click();
  a.remove();
}

// ---------- inputs from the address ----------

// Links from the reference pages carry their example (?country=US&amount=3000&ytd=40000
// &status=single&state=texas&w2=60000&miles=600&tips=150&date=2026-10-31, or for the UK
// &nation=scotland&salary=20000&loan=plan2&pg=1). Anything unusable is ignored.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (![...q.keys()].length) return false;
  const set = (id, v, ok = (x) => x !== null && x !== '' && Number.isFinite(Number(x))) => { if (ok(v)) $(id).value = v; };
  const opt = (id, v) => { if (v !== null && [...$(id).options].some((o) => o.value === v)) $(id).value = v; };
  if (q.get('country') === 'UK' || q.get('country') === 'US') document.querySelector(`input[name="country"][value="${q.get('country')}"]`).checked = true;
  set('ts-amount', q.get('amount'));
  set('ts-ytd', q.get('ytd'));
  set('ts-expenses', q.get('expenses'));
  set('ts-miles', q.get('miles'));
  set('ts-tips', q.get('tips'));
  set('ts-w2', q.get('w2'));
  set('ts-salary', q.get('salary'));
  set('ts-date', q.get('date'), (x) => /^\d{4}-\d{2}-\d{2}$/.test(x ?? ''));
  opt('ts-status', q.get('status'));
  opt('ts-state', q.get('state'));
  opt('ts-age', q.get('age65'));
  opt('ts-sstb', q.get('sstb'));
  opt('ts-nation', q.get('nation'));
  opt('ts-loan', q.get('loan'));
  if (q.get('pg') === '1') $('ts-pg').checked = true;
  return true;
}

function showPrice() {
  if (account) {
    $('ts-price').textContent = `${account.currency === 'INR' ? '₹8' : '$0.10'} per payment from your balance, at most ${account.currency === 'INR' ? '₹199' : '$2.49'} a calendar month for this tool.`;
    $('ts-run-note').textContent = '';
  } else {
    $('ts-run-note').textContent = 'Signed out you get the percentage, free, 5 runs a day. Sign in for the amount and the working.';
  }
}

// ---------- start ----------

async function start() {
  document.querySelectorAll('input[name="country"]').forEach((el) => el.addEventListener('change', syncCountry));
  $('ts-state').addEventListener('change', syncState);
  $('ts-form').addEventListener('submit', onSubmit);
  $('ts-replay').addEventListener('click', replay);
  $('ts-csv').addEventListener('click', downloadCsv);
  $('ts-clear').addEventListener('click', () => { ledgerState = { rows: [], saved: ledgerState.saved }; save(ledgerState); renderLedger(); });
  $('ts-saved').addEventListener('input', () => { const v = num('ts-saved'); ledgerState.saved = Number.isFinite(v) ? v : null; save(ledgerState); renderLedger(); });
  T.mountCodePanel($('ts-code'), SLUG);
  ledgerState = load();
  if (ledgerState.saved !== null) $('ts-saved').value = ledgerState.saved;
  renderLedger();

  try { account = await T.me(); } catch { account = null; }
  showPrice();

  let tool;
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('ts-out').textContent = 'The worked example could not load. The calculator still works: press the button to run it.';
    syncCountry();
    return;
  }
  const constants = tool.examples.find((x) => x.input.op === 'constants').output;
  fillStates(constants);
  const linked = fromQuery();
  syncCountry();
  const ex = tool.examples[0];
  if (!linked) render(ex.input, ex.output, { kind: 'example' });
  else $('ts-out').replaceChildren(h('p', { class: 'muted', text: `The form is filled in from the page you came from. Press "${$('ts-run').textContent}" to work it out${account ? '' : ' (signed out you get the percentage, free)'}.` }));
}

start();
