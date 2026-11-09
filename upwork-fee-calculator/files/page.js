// The Upwork fee calculator page. The fee tables and the reference rates live on the server, so
// every answer runs there through Endwise.run: on this page it is free and never uses a free run.
// The statement of many payments (with its CSV) is the paid output.
import { FeeError } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'upwork-fee-calculator';
const $ = (id) => document.getElementById(id);
const val = (id) => $(id).value.trim();

let mode = 'net';
let signedIn = false;
let tool = null;
let lastRoute = null; // the route of the last good "net" answer, for the statement

const put = (el, ...kids) => { el.textContent = ''; el.append(...kids.filter(Boolean)); };
const soon = (fn, ms = 350) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
const opt = (o, k, v) => { if (v !== '' && v !== undefined && v !== null) o[k] = v; };

// ---------- reading the form ----------

function routeInput() {
  const platform = $('uf-platform').value;
  const o = { platform };
  if (platform === 'upwork') { opt(o, 'feePercent', val('uf-fee')); opt(o, 'withdrawalFee', val('uf-wfee')); }
  else { o.projectType = $('uf-type').value; opt(o, 'withdrawalMethod', $('uf-method').value); }
  const n = Number(val('uf-n') || 1);
  if (!Number.isInteger(n) || n < 1 || n > 60) throw new FeeError('Withdrawals is a whole number from 1 to 60.');
  if (n > 1) o.withdrawals = n;
  o.receive = $('uf-receive').value;
  if (o.receive !== 'usd') o.country = $('uf-country').value;
  opt(o, 'rate', val('uf-rate'));
  if (['wise', 'bank', 'payoneer'].includes(o.receive)) opt(o, 'marginPercent', val('uf-margin'));
  opt(o, 'providerFee', val('uf-provider'));
  if (o.receive === 'wise' && $('uf-wire').checked) o.wire = true;
  return o;
}

function inputFor(m) {
  if (m === 'net') return { op: 'net', amount: val('uf-amount'), ...routeInput() };
  if (m === 'rate') {
    const o = { op: 'rate', target: val('uf-target'), per: $('uf-per').value, platform: $('uf-rplatform').value };
    if (o.platform === 'upwork') opt(o, 'feePercent', val('uf-rfee'));
    opt(o, 'marginPercent', val('uf-rmargin'));
    opt(o, 'fixedFee', val('uf-rfixed'));
    if (o.fixedFee && o.per === 'hour') opt(o, 'hoursPerPayment', val('uf-rhours'));
    return o;
  }
  if (m === 'connects') {
    const int = (id, label) => { const n = Number(val(id)); if (!Number.isInteger(n)) throw new FeeError(`${label} is a whole number.`); return n; };
    const o = { op: 'connects', connectsPerProposal: int('uf-cpp', 'Connects per proposal'), proposals: int('uf-props', 'Proposals'), wins: int('uf-wins', 'Jobs won') };
    opt(o, 'contractValue', val('uf-value'));
    opt(o, 'feePercent', val('uf-cfee'));
    return o;
  }
  const o = { op: 'schedule' };
  if ($('uf-smethod').value) o.method = $('uf-smethod').value;
  else o.feePerWithdrawal = val('uf-sfee');
  opt(o, 'monthlyAmount', val('uf-smonthly'));
  return o;
}

// ---------- showing a result ----------

const sourceLink = (s) => (s.href ? h('a', { href: s.href, rel: 'noopener' }, s.text) : s.text);
function sourcesLine(list) {
  if (!list?.length) return null;
  return h('p', { class: 'tf-cost uf-sources' }, ['Sources: ', ...list.flatMap((s, i) => [i ? '; ' : '', sourceLink(s)]), '.']);
}
const flagsList = (flags) => (flags?.length ? h('ul', { class: 'uf-flags' }, flags.map((f) => h('li', {}, f))) : null);

// One line per figure: a mark, what it is, the amount, and where it comes from.
const item = (k, label, amount, why, cls = null) => h('li', { class: cls }, [
  h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, label), amount ? h('b', {}, amount) : null, why ? h('em', {}, why) : null,
]);

// The form as first served, so the result says "Example" until it is changed.
let DEFAULTS = null;
const formNow = () => [mode, ...[...document.querySelectorAll('#uf-form input, #uf-form select')].map((el) => (el.type === 'checkbox' ? el.checked : el.value))].join('|');

const RECEIVE = { usd: 'kept in US dollars', paypal: 'PayPal', payoneer: 'Payoneer', wise: 'Wise', skydo: 'Skydo', bank: 'a bank' };
// The inputs in one line: "$800 at a 10% Upwork fee, to PayPal in India (INR)".
function inputsLine(m) {
  if (m === 'net') {
    const up = $('uf-platform').value === 'upwork';
    const fee = up ? `a ${val('uf-fee') || 0}% Upwork fee` : `Freelancer.com ${$('uf-type').value === 'fixed' ? 'fixed price' : 'hourly'}`;
    const to = $('uf-receive').value === 'usd' ? 'kept in US dollars' : `to ${RECEIVE[$('uf-receive').value]} in ${$('uf-country').selectedOptions[0].textContent}`;
    return `$${val('uf-amount')} at ${fee}, ${to}`;
  }
  if (m === 'rate') return `keep $${val('uf-target')} an ${$('uf-per').value === 'hour' ? 'hour' : 'payment'} on ${$('uf-rplatform').selectedOptions[0].textContent}`;
  if (m === 'connects') return `${val('uf-props')} proposals at ${val('uf-cpp')} Connects, ${val('uf-wins')} won at $${val('uf-value')}`;
  return `${$('uf-smethod').value ? $('uf-smethod').selectedOptions[0].textContent : `$${val('uf-sfee')} a withdrawal`}, $${val('uf-smonthly')} a month`;
}
const SRC = { net: 'Reaches the bank', rate: 'What to bill', connects: 'Connects', schedule: 'Fixed fees a year' };
function head(m) {
  const example = formNow() === DEFAULTS;
  return [
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src' }, SRC[m]),
    ]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${inputsLine(m)}` : inputsLine(m)),
  ];
}
const big = (b, span) => h('p', { class: 'tf-big' }, [h('b', { class: b.length > 14 ? 'word' : null }, b), span ? h('span', {}, span) : null]);

function showNet(r) {
  const top = r.local ? (r.local.amount ?? `${r.local.low} to ${r.local.high}`) : r.net;
  const last = r.steps.length - 1;
  return [
    ...head('net'),
    big(top, `${r.netPercent} of the ${r.gross} billed${r.local ? ' at the reference rate' : ''}`),
    h('p', { class: 'tf-sub' }, r.answer),
    h('ul', { class: 'tf-items uf-items' }, r.steps.map((s, i) => {
      const minus = /^-/.test(s.usd ?? '');
      const why = [s.basis, s.source ? sourceLink(s.source) : null].filter(Boolean);
      return item(minus ? '-' : i === last ? '=' : '$', s.label, s.local ?? s.usd ?? '', why.length ? why.flatMap((w, j) => [j ? ', ' : '', w]) : null, minus ? 'sk' : i === last ? 'hi tot' : 'plain');
    })),
    flagsList(r.flags),
    sourcesLine(r.sources),
  ];
}
function showRate(r) {
  return [
    ...head('rate'),
    big(r.gross, `${r.per === 'hour' ? 'an hour' : 'a payment'}, to keep ${r.target}`),
    h('p', { class: 'tf-sub' }, r.answer),
    r.byFee ? h('ul', { class: 'tf-items uf-items' }, r.byFee.map((x) => item('%', `At a ${x.feePercent} service fee`, x.gross, null, 'plain'))) : null,
    h('p', { class: 'tf-note' }, r.formula),
    flagsList(r.flags),
    sourcesLine(r.sources),
  ];
}
function showConnects(r) {
  return [
    ...head('connects'),
    big(r.perWin ? r.perWin : r.cost, r.perWin ? 'in Connects per job won' : 'spent on Connects'),
    h('p', { class: 'tf-sub' }, r.answer),
    h('ul', { class: 'tf-items uf-items' }, [
      item('#', 'Connects', String(r.connects), `at ${r.connectPrice} each`),
      item('$', 'Spent', r.cost, null),
      item('%', 'Win rate', r.winRate, null, 'hi'),
    ]),
    flagsList(r.flags),
    sourcesLine(r.sources),
  ];
}
function showSchedule(r) {
  return [
    ...head('schedule'),
    big(r.weeklyVsMonthly, 'saved a year withdrawing monthly instead of weekly'),
    h('p', { class: 'tf-sub' }, r.answer),
    h('ul', { class: 'tf-items uf-items' }, r.rows.map((x) => item(String(x.perYear), x.schedule, x.cost, `${x.perYear} withdrawals a year${x.share ? `, ${x.share} of what you withdraw` : ''}`, 'plain'))),
    sourcesLine(r.sources),
  ];
}
const SHOW = { net: showNet, rate: showRate, connects: showConnects, schedule: showSchedule };

async function recompute() {
  const out = $('uf-out');
  const err = $('uf-err');
  err.textContent = '';
  let input;
  try { input = inputFor(mode); } catch (e) { err.textContent = e.message; return; }
  try {
    const r = (await T.run(SLUG, input)).result;
    put(out, ...SHOW[mode](r));
    if (mode === 'net') { const { op, amount, ...route } = input; lastRoute = route; buy?.refresh(); }
  } catch (e) {
    err.textContent = e.fields ? Object.values(e.fields)[0] : e.message;
  }
}
const later = soon(recompute);

// ---------- the statement ----------

function readPayments(text) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new FeeError('Add at least one payment, one a line.');
  return lines.map((l) => {
    const parts = l.split(',').map((x) => x.trim()).filter(Boolean);
    const p = {};
    if (/^\d{4}-\d{2}-\d{2}$/.test(parts[0] ?? '')) p.date = parts.shift();
    if (!parts.length) throw new FeeError(`Could not read "${l.slice(0, 40)}". Write a date if you like, the amount, and the fee: 2026-10-02, 450, 10.`);
    p.amount = parts[0];
    if (parts[1] !== undefined) p.feePercent = parts[1].replace(/%$/, '');
    return p;
  });
}
let buy = null;
function buyBox(el) {
  const price = h('p', { class: 'uf-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Work out the statement');
  const got = h('div', { role: 'status' });
  const err = h('p', { class: 'form-error', role: 'alert' });
  const words = () => {
    const text = tool?.pricing?.actions.find((a) => a.name === 'statement')?.text;
    return text ? T.money(text) : '';
  };
  const input = () => ({ op: 'statement', payments: readPayments($('uf-pay').value), ...(lastRoute ?? {}) });
  button.addEventListener('click', async () => {
    err.textContent = '';
    button.disabled = true;
    try {
      const json = await T.run(SLUG, input());
      const r = json.result;
      const charged = json.charged?.amount ? ` Charged ${json.charged.display}.` : '';
      const file = h('a', { href: URL.createObjectURL(new Blob([r.csv], { type: 'text/csv' })), download: 'upwork-fee-statement.csv' }, 'upwork-fee-statement.csv');
      put(got, h('p', {}, [r.answer, ' ', file, charged]));
    } catch (e) {
      err.textContent = e.message;
      if (e.code === 'unauthorized' || e.code === 'rate_limited') err.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
      if (e.code === 'insufficient_balance' || e.code === 'cap_reached') err.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
    } finally {
      button.disabled = false;
    }
  });
  put(el, price, button, got, err);
  return {
    refresh: soon(async () => {
      if (!signedIn) { price.textContent = `${words()}. Sign in to work it out.`; return; }
      try {
        const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input() })).quote;
        price.textContent = q.amount ? `This statement costs ${q.display} from your balance (${words()}).` : `This statement is free for you now (${words()}).`;
      } catch {
        price.textContent = words();
      }
    }, 300),
  };
}

// ---------- modes and the address ----------

function setMode(m) {
  mode = m;
  for (const b of document.querySelectorAll('.uf-tab')) b.setAttribute('aria-pressed', String(b.dataset.mode === m));
  const more = document.querySelector('.uf-tabmore');
  if (more) { more.classList.toggle('on', m === 'schedule'); more.open = false; }
  for (const f of document.querySelectorAll('#uf-form fieldset')) f.hidden = f.dataset.for !== m;
  recompute();
}
function showPlatform() {
  const p = $('uf-platform').value;
  for (const el of document.querySelectorAll('[data-platform]')) el.hidden = el.dataset.platform !== p;
}

function prefill() {
  const q = new URLSearchParams(location.search);
  const set = (id, key) => { if (q.has(key)) $(id).value = q.get(key); };
  const pairs = [['uf-platform', 'platform'], ['uf-amount', 'amount'], ['uf-fee', 'fee'], ['uf-type', 'type'], ['uf-wfee', 'wfee'], ['uf-method', 'method'], ['uf-n', 'n'], ['uf-receive', 'receive'], ['uf-country', 'country'], ['uf-rate', 'rate'], ['uf-margin', 'margin'], ['uf-provider', 'provider'],
    ['uf-target', 'target'], ['uf-per', 'per'], ['uf-rplatform', 'rplatform'], ['uf-rfee', 'rfee'], ['uf-rmargin', 'rmargin'], ['uf-rfixed', 'rfixed'], ['uf-rhours', 'rhours'],
    ['uf-cpp', 'cpp'], ['uf-props', 'proposals'], ['uf-wins', 'wins'], ['uf-value', 'value'], ['uf-cfee', 'cfee'], ['uf-smethod', 'smethod'], ['uf-sfee', 'sfee'], ['uf-smonthly', 'monthly']];
  for (const [id, key] of pairs) set(id, key);
  if (q.get('wire') === '1') $('uf-wire').checked = true;
  if (['platform', 'rate', 'margin', 'provider', 'wfee', 'method', 'n'].some((k) => q.has(k))) $('uf-more-fold').open = true;
  if (['rmargin', 'rfixed', 'rhours'].some((k) => q.has(k))) $('uf-rmore-fold').open = true;
  const m = q.get('mode');
  return ['net', 'rate', 'connects', 'schedule'].includes(m) ? m : 'net';
}

async function main() {
  try { tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool; } catch { tool = null; }
  try { signedIn = !!(await T.me()); } catch { signedIn = false; }
  try {
    const presets = (await T.run(SLUG, { op: 'fees' })).result;
    const sel = $('uf-smethod');
    const fl = presets.freelancerCom.withdrawal;
    for (const [id, row] of Object.entries(fl)) sel.append(h('option', { value: `freelancer-com-${id}` }, `Freelancer.com ${row.label} ($${row.fee})`));
    sel.append(h('option', { value: 'wise-usd-wire' }, 'Wise, receiving a USD wire (6.11 USD)'), h('option', { value: 'payoneer-local' }, 'Payoneer, same country and currency ($1.50)'));
  } catch { /* the own-fee field still works */ }
  const start = prefill();
  showPlatform();
  buy = buyBox($('uf-buy'));
  for (const b of document.querySelectorAll('.uf-tab')) b.addEventListener('click', () => setMode(b.dataset.mode));
  $('uf-form').addEventListener('input', later);
  // The button shows the result for the form as it stands (it also updates as you type).
  $('uf-form').addEventListener('submit', (e) => {
    e.preventDefault();
    recompute();
    if (window.matchMedia('(max-width: 1080px)').matches) $('uf-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('uf-form').addEventListener('change', () => { showPlatform(); later(); });
  $('uf-pay').addEventListener('input', () => buy.refresh());
  T.mountCodePanel($('uf-code'), SLUG);
  mode = 'net';
  DEFAULTS = new URLSearchParams(location.search).toString() ? null : formNow();
  setMode(start);
}

main();
