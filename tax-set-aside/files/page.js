// The tax set-aside page. The worked example at rest is the tool's own first example, worked out on
// the server when it booted; every real answer comes from the server through Endwise.run (signed in:
// the full answer, charged; signed out: the percentage on a free run). The year ledger lives in
// this browser's localStorage and is never sent anywhere except to a replay the visitor asks for.
import { usd, gbp, longDate, ukDate, STATUS_NAMES, NATION_NAMES } from './core.js';

const T = window.Endwise;
const SLUG = 'tax-set-aside';
const $ = (id) => document.getElementById(id);
const h = (tag, attrs, children) => T.h(tag, attrs, children);
const STORE = 'tax-set-aside-ledger-v1';
// The Spanish page (page.es.html, at /es/tax-set-aside/) is <html lang="es">: there this script
// shows its own words in Spanish. The English page reads exactly the English words below.
const ES = document.documentElement.lang === 'es';
const tr = (en, es) => (ES ? es : en);
const ES_STATUS = { single: 'soltero', mfj: 'casado declarando en conjunto', mfs: 'casado declarando por separado', hoh: 'jefe de familia', qss: 'cónyuge sobreviviente que reúne los requisitos' };
const ES_MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const esDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} de ${ES_MONTHS[m - 1]} de ${y}`; };
const statusName = (s) => (ES ? ES_STATUS[s] : STATUS_NAMES[s]);
const dateLong = (iso) => (ES ? esDate(iso) : longDate(iso));
// The paid price as a signed-out visitor sees it, in the page's currency (T.prices). A page in
// dollars says a UK answer is still paid for in dollars.
const paidPrice = (c) => tr(
  T.prices(`$0.10 a payment from ${c === 'UK' && T.currency === 'USD' ? 'an account held in US dollars' : 'your balance'}, never more than $2.49 a month`),
  `$0.10 por pago de ${c === 'UK' ? 'una cuenta en dólares estadounidenses' : 'su saldo'}, nunca más de $2.49 al mes`,
);

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
    ? tr('Profit from self-employment since 6 April 2026, before this payment, less expenses. Use a minus sign for a loss so far.', 'Ganancia del trabajo por cuenta propia desde el 6 de abril de 2026, antes de este pago, menos los gastos. Use un signo de menos si hasta ahora tiene una pérdida.')
    : tr('Income from self-employment since January 1, 2026, before this payment, less expenses. Use a minus sign for a loss so far.', 'Ingresos del trabajo por cuenta propia desde el 1 de enero de 2026, antes de este pago, menos los gastos. Use un signo de menos si hasta ahora tiene una pérdida.');
  syncState();
}

let covered = {};
function fillStates(constants) {
  covered = constants.statesCovered;
  const all = { ...constants.statesCovered, ...constants.statesNotCovered };
  const sel = $('ts-state');
  sel.replaceChildren(h('option', { value: '', text: tr('Federal only', 'Solo federal') }));
  for (const [slug, name] of Object.entries(all).sort((a, b) => a[1].localeCompare(b[1]))) {
    sel.append(h('option', { value: slug, text: covered[slug] ? name : tr(`${name} (federal only)`, `${name} (solo federal)`) }));
  }
  sel.value = 'texas';
}
function syncState() {
  const v = $('ts-state').value;
  $('ts-state-hint').textContent = !v ? tr('No state tax is added.', 'No se suma impuesto estatal.')
    : covered[v] ? tr(`${covered[v]} income tax is included.`, `Se incluye el impuesto sobre los ingresos de ${covered[v]}.`)
    : tr('This state\'s income tax is not included yet: the answer is federal only, and says so.', 'El impuesto sobre los ingresos de este estado todavía no está incluido: la respuesta es solo federal y lo indica.');
}

const num = (id) => {
  const s = $(id).value.trim();
  return s === '' ? undefined : Number(s);
};

function readForm() {
  const errors = {};
  const c = country();
  const input = { op: 'payment', country: c, amount: num('ts-amount') };
  if (!(input.amount > 0)) errors['ts-amount'] = tr('Enter the amount received, more than 0.', 'Ingrese el monto recibido, mayor que 0.');
  const date = $('ts-date').value;
  if (date) input.date = date; else errors['ts-date'] = tr('Enter the date you were paid.', 'Ingrese la fecha en que le pagaron.');
  const exp = num('ts-expenses');
  if (exp !== undefined) { if (exp >= 0) input.expenses = exp; else errors['ts-expenses'] = tr('Expenses cannot be negative.', 'Los gastos no pueden ser negativos.'); }
  const ytd = num('ts-ytd');
  if (ytd !== undefined) { if (Number.isFinite(ytd)) input.ytdNetProfit = ytd; else errors['ts-ytd'] = tr('Enter a number.', 'Ingrese un número.'); }
  if (c === 'US') {
    input.filingStatus = $('ts-status').value;
    if ($('ts-state').value) input.state = $('ts-state').value;
    const miles = num('ts-miles');
    if (miles) input.miles = miles;
    const tips = num('ts-tips');
    if (tips) { if (tips <= (input.amount ?? 0)) input.tips = tips; else errors['ts-tips'] = tr('Tips cannot be more than the payment.', 'Las propinas no pueden ser más que el pago.'); }
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
  for (const [id, msg] of Object.entries(errors)) {
    const el = $(`${id}-err`);
    if (el) { el.textContent = msg; if (el.closest('#ts-more')) $('ts-more').open = true; }
  }
}

// ---------- the answer ----------

const row = (label, value, cls) => h('tr', cls ? { class: cls } : null, [h('th', { scope: 'row', text: label }), h('td', { class: 'num', text: value })]);
// One line per figure: a mark, what it is, the amount and where it comes from (a working line).
const item = (k, label, value, why, cls = null) => h('li', { class: cls }, [
  h('span', { class: 'k', 'aria-hidden': 'true', text: k }), h('span', { text: label }), h('b', { text: value }), h('em', null, why),
]);
const whyOf = (result, start) => {
  const w = result.working.find((x) => x.label.startsWith(start));
  if (!w) return '';
  return w.source ? h('a', { href: w.source, text: w.label, rel: 'noopener' }) : w.label;
};
const head = (kind) => h('div', { class: 'tf-rh' }, [
  kind === 'example' ? h('span', { class: 'tf-tag', text: tr('Example', 'Ejemplo') }) : h('span', { class: 'tf-tag run', text: tr('Your result', 'Su resultado') }),
  h('span', { class: 'tf-src', text: tr('Tax year 2026 rates, dated sources', 'Tasas del año fiscal 2026, fuentes con fecha') }),
]);

// The inputs in one line: "$3,000 on October 31, 2026, single, Texas, $40,000 of profit so far".
function inputsLine(input, result) {
  const c = input.country;
  const where = c === 'UK' ? NATION_NAMES[input.nation ?? result?.nation] : [statusName(input.filingStatus), result?.state?.name ?? $('ts-state').selectedOptions[0]?.textContent].filter(Boolean).join(', ');
  return [
    tr(`${whole(c)(input.amount)} on ${dateLong(input.date)}`, `${whole(c)(input.amount)} el ${dateLong(input.date)}`),
    where,
    tr(`${whole(c)(input.ytdNetProfit)} of profit so far`, `${whole(c)(input.ytdNetProfit)} de ganancia hasta ahora`),
  ].filter(Boolean).join(', ');
}
const inputs = (kind, input, result) => h('p', { class: 'tf-exin', text: kind === 'example' ? tr(`Example: ${inputsLine(input, result)}`, `Ejemplo: ${inputsLine(input, result)}`) : inputsLine(input, result) });

function renderPercentage(input, result) {
  const out = $('ts-out');
  out.replaceChildren(
    head('free'),
    inputs('free', input, result),
    h('p', { class: 'tf-big' }, [h('b', { class: 'num', text: `${result.percent.toFixed(1)}%` }), h('span', { text: tr('of this payment', 'de este pago') })]),
    h('p', { class: 'tf-sub', text: tr(`goes to your tax pot.`, 'va a su fondo para impuestos.') }),
    ...(result.flags ?? []).map((x) => h('p', { class: 'ts-flag', text: x })),
    h('p', { class: 'tf-note', text: tr(
      `Sign in for the amount in ${result.country === 'UK' ? 'pounds' : 'dollars'}, the breakdown, the working with every source, the next due date and the year ledger: ${paidPrice(result.country)}.`,
      `Inicie sesión para ver el monto en ${result.country === 'UK' ? 'libras' : 'dólares'}, el desglose, el cálculo con cada fuente, la próxima fecha de pago y el registro del año: ${paidPrice(result.country)}.`,
    ) }),
    h('p', null, [h('a', { class: 'btn btn-small', href: `${T.base}/account?next=${encodeURIComponent(window.location.pathname)}`, text: tr('Sign in', 'Iniciar sesión') })]),
  );
}

function render(input, result, { kind }) {
  const c = result.country;
  const m = fmt(c);
  const out = $('ts-out');
  const b = result.breakdown;
  const where = c === 'UK' ? NATION_NAMES[result.nation] : result.state ? result.state.name : tr('federal only', 'solo federal');
  const lines = c === 'UK'
    ? [
      item('IT', 'Income Tax', m(b.incomeTax), whyOf(result, 'Income Tax')),
      item('C4', 'Class 4 National Insurance', m(b.class4), whyOf(result, 'Class 4')),
      b.studentLoan ? item('SL', tr('Student loan', 'Préstamo estudiantil'), m(b.studentLoan), whyOf(result, 'Student loan') || whyOf(result, 'Postgraduate')) : null,
    ]
    : [
      item('SS', tr('Social Security', 'Seguro Social'), m(b.socialSecurity), whyOf(result, 'Social Security')),
      item('M', 'Medicare', m(b.medicare), whyOf(result, 'Medicare')),
      b.additionalMedicare ? item('AM', tr('Additional Medicare Tax', 'Impuesto adicional del Medicare'), m(b.additionalMedicare), whyOf(result, 'Additional Medicare')) : null,
      item('F', tr('Federal income tax', 'Impuesto federal sobre los ingresos'), m(b.federalIncomeTax), whyOf(result, 'Federal income tax')),
      item('S', result.state?.covered ? tr(`${result.state.name} income tax`, `Impuesto sobre los ingresos de ${result.state.name}`) : tr('State income tax', 'Impuesto estatal sobre los ingresos'), result.state?.covered ? m(b.state) : tr('not included', 'no incluido'), result.state ? whyOf(result, result.state.name) : '', result.state?.covered ? null : 'dim'),
    ];
  const children = [
    head(kind),
    inputs(kind, input, result),
    h('p', { class: 'tf-big' }, [h('b', { class: 'num', text: m(result.setAside) }), h('span', { text: tr('to set aside', 'para apartar') })]),
    h('p', { class: 'tf-sub', text: tr(
      `${result.percent.toFixed(1)}% of this ${whole(c)(result.payment.amount)} payment. ${c === 'US' ? `${statusName(result.filingStatus)[0].toUpperCase()}${statusName(result.filingStatus).slice(1)}, ${where}` : where}, with ${whole(c)(result.ytdNetProfitBefore)} of profit before it.`,
      `${result.percent.toFixed(1)}% de este pago de ${whole(c)(result.payment.amount)}. ${c === 'US' ? `${statusName(result.filingStatus)[0].toUpperCase()}${statusName(result.filingStatus).slice(1)}, ${where}` : where}, con ${whole(c)(result.ytdNetProfitBefore)} de ganancia antes de este pago.`,
    ) }),
    h('ul', { class: 'tf-items ts-items' }, [
      ...lines.filter(Boolean),
      item('=', tr('Set aside', 'Apartar'), m(result.setAside), tr('the tax this payment adds to the year', 'el impuesto que este pago agrega al año'), 'tot hi'),
    ]),
  ];
  if (c === 'UK') {
    children.push(h('p', { class: 'ts-poa' }, [
      h('strong', { text: tr(`First year of Self Assessment? Set aside ${m(result.firstYearSetAside)} (${result.firstYearPercent.toFixed(1)}%). `, `¿Primer año de Self Assessment? Aparte ${m(result.firstYearSetAside)} (${result.firstYearPercent.toFixed(1)}%). `) }),
      tr('Your first January bill also carries the first payment on account for the next year, half of this year\'s tax again.', 'Su primera cuenta de enero también incluye el primer payment on account del año siguiente: otra vez la mitad del impuesto de este año.'),
    ]));
  }
  if (result.marginalRate !== null) children.push(h('p', { class: 'tf-note', text: tr(`That is ${result.marginalRate.toFixed(1)}% of the ${whole(c)(result.payment.net)} of profit this payment adds.`, `Es el ${result.marginalRate.toFixed(1)}% de los ${whole(c)(result.payment.net)} de ganancia que agrega este pago.`) }));
  for (const x of [...result.crossings, ...result.flags]) children.push(h('p', { class: 'ts-flag', text: x }));
  if (result.nextDue) {
    children.push(h('p', { class: 'ts-due' }, c === 'UK'
      ? [h('strong', { text: tr(`Next Self Assessment date: ${ukDate(result.nextDue.due)}. `, `Próxima fecha de Self Assessment: ${dateLong(result.nextDue.due)}. `) }), result.nextDue.what + '.']
      : [h('strong', { text: tr(`Next federal estimated payment: ${longDate(result.nextDue.due)}`, `Próximo pago federal de impuestos estimados: ${dateLong(result.nextDue.due)}`) }), tr(
        ` (Form 1040-ES, period ${result.nextDue.period}).${result.nextStateDue ? ` ${result.nextStateDue.state}: ${longDate(result.nextStateDue.due)}, ${Math.round(result.nextStateDue.share * 100)}% of the year's state estimate.` : ''}`,
        ` (Formulario 1040-ES, período ${result.nextDue.period}).${result.nextStateDue ? ` ${result.nextStateDue.state}: ${dateLong(result.nextStateDue.due)}, el ${Math.round(result.nextStateDue.share * 100)}% del impuesto estatal estimado del año.` : ''}`,
      )]));
  }
  const working = h('details', { class: 'xpand ts-working' }, [
    h('summary', { text: tr('Show the working and sources', 'Ver el cálculo y las fuentes') }),
    h('div', { class: 'xp-in' }, [
      h('div', { class: 'table-scroll' }, h('table', { class: 'ts-table' }, h('tbody', null, result.working.map((w) => h('tr', null, [
        h('th', { scope: 'row' }, w.source ? h('a', { href: w.source, text: w.label, rel: 'noopener' }) : w.label),
        h('td', { class: 'num', text: w.value }),
      ]))))),
      h('ul', { class: 'ts-sources' }, result.sources.map((s) => h('li', null, [h('a', { href: s.url, text: s.name, rel: 'noopener' }), tr(` (read ${s.readOn})`, ` (consultada el ${s.readOn})`)]))),
      h('p', { class: 'muted small', text: tr(`Input fingerprint ${result.inputHash}: the same inputs always give this answer.`, `Huella de los datos ${result.inputHash}: los mismos datos siempre dan esta respuesta.`) }),
    ]),
  ]);
  children.push(working);
  if (kind === 'answer') {
    last = { input, result };
    children.push(h('p', null, [h('button', { class: 'btn btn-quiet btn-small', type: 'button', text: tr('Add to my year', 'Agregar a mi año'), onclick: addToYear })]));
  } else {
    children.push(h('p', { class: 'tf-cost', text: tr(`Worked out on the server for the inputs shown in the form. Press "${$('ts-run').textContent}" to work out your own.`, `Calculado en el servidor con los datos que muestra el formulario. Presione "${$('ts-run').textContent}" para calcular el suyo.`) }));
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
  $('ts-status-live').textContent = tr('Working it out.', 'Calculando.');
  try {
    const res = await T.run(SLUG, body);
    if (signedIn) render(input, res.result, { kind: 'answer' }); else renderPercentage(input, res.result);
    $('ts-status-live').textContent = tr('Done.', 'Listo.');
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
    body.replaceChildren(h('p', { class: 'muted', text: tr('Nothing yet. Work out a payment, then press "Add to my year".', 'Todavía nada. Calcule un pago y luego presione "Agregar a mi año".') }));
    return;
  }
  const c = rows[0].country;
  const m = fmt(c);
  const should = rows.reduce((s, r) => s + r.setAside, 0);
  const saved = ledgerState.saved ?? 0;
  body.replaceChildren(
    h('div', { class: 'table-scroll' }, h('table', { class: 'ts-table' }, [
      h('thead', null, h('tr', null, (ES ? ['Fecha', 'Pago', 'Apartar'] : ['Date', 'Payment', 'Set aside']).map((t) => h('th', { scope: 'col', text: t })))),
      h('tbody', null, rows.map((r) => h('tr', null, [h('td', { text: r.date }), h('td', { class: 'num', text: m(r.amount) }), h('td', { class: 'num', text: m(r.setAside) })]))),
    ])),
    h('p', { class: 'ts-sum' }, [
      h('strong', { text: tr(`Should be in your pot: ${m(should)}. `, `Debería tener apartado: ${m(should)}. `) }),
      saved >= should ? tr(`You have ${m(saved)}, enough.`, `Tiene ${m(saved)}, suficiente.`) : tr(`You have ${m(saved)}: move ${m(should - saved)} to catch up.`, `Tiene ${m(saved)}: mueva ${m(should - saved)} para ponerse al día.`),
    ]),
    ...(note ? [h('p', { class: 'muted small', text: note })] : []),
  );
}

async function replay() {
  const rows = ledgerState.rows;
  if (!rows.length) return;
  if (!account) { $('ts-ledger-note').textContent = tr(T.prices('Sign in to replay your year: $0.10 per 25 payments.'), 'Inicie sesión para recalcular su año: $0.10 por cada 25 pagos.'); return; }
  const c = rows[0].country;
  const mixed = rows.some((r) => r.country !== c || JSON.stringify(r.profile) !== JSON.stringify(rows[0].profile));
  const input = { op: 'ledger', ...rows[0].profile, payments: rows.map((r) => Object.fromEntries(Object.entries({ date: r.date, amount: r.amount, expenses: r.expenses, miles: r.miles, tips: r.tips }).filter(([, v]) => v !== undefined))) };
  if (ledgerState.saved) input.savedToDate = ledgerState.saved;
  try {
    const res = await T.run(SLUG, input);
    const order = res.result.rows;
    ledgerState.rows = order.map((x) => ({ ...rows[x.index], setAside: x.setAside }));
    save(ledgerState);
    renderLedger(tr(`Replayed in date order from a profit of zero${mixed ? ', using the settings of the first payment' : ''}.`, `Recalculado en orden de fecha desde una ganancia de cero${mixed ? ', con la configuración del primer pago' : ''}.`));
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
    $('ts-price').textContent = tr(
      T.prices('$0.10 per payment from your balance, at most $2.49 a calendar month for this tool.'),
      '$0.10 por pago de su saldo, como máximo $2.49 por mes calendario por esta herramienta.',
    );
    $('ts-run-note').textContent = '';
  } else {
    $('ts-run-note').textContent = tr('Signed out you get the percentage, free, 5 runs a day. Sign in for the amount and the working.', 'Sin iniciar sesión obtiene el porcentaje, gratis, 5 ejecuciones al día. Inicie sesión para ver el monto y el cálculo.');
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
    $('ts-out').textContent = tr('The worked example could not load. The calculator still works: press the button to run it.', 'No se pudo cargar el ejemplo resuelto. La calculadora sigue funcionando: presione el botón para usarla.');
    syncCountry();
    return;
  }
  const constants = tool.examples.find((x) => x.input.op === 'constants').output;
  fillStates(constants);
  const linked = fromQuery();
  syncCountry();
  // Optional fields filled in from a link show themselves.
  const changed = (el) => (el.type === 'checkbox' ? el.checked !== el.defaultChecked
    : el.tagName === 'SELECT' ? el.value !== ([...el.options].find((o) => o.defaultSelected) ?? el.options[0])?.value
      : el.value !== el.defaultValue);
  if ([...$('ts-more').querySelectorAll('input, select')].some(changed)) $('ts-more').open = true;
  const ex = tool.examples[0];
  if (!linked) render(ex.input, ex.output, { kind: 'example' });
  else if (T.takeRunFlag()) $('ts-form').requestSubmit();
  else $('ts-out').replaceChildren(h('p', { class: 'muted', text: tr(`The form is filled in from the page you came from. Press "${$('ts-run').textContent}" to work it out${account ? '' : ' (signed out you get the percentage, free)'}.`, `El formulario viene lleno desde la página de la que llegó. Presione "${$('ts-run').textContent}" para calcularlo${account ? '' : ' (sin iniciar sesión obtiene el porcentaje, gratis)'}.`) }));
}

start();
