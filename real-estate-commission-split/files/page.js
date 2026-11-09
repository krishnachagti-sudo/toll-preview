// The commission split page. Every answer runs on the server through Endwise.run: one deal, a
// comparison and a goal are free on this page and never use a free run; the year tracker is the paid
// output (per agent cap year, free to re-run for 12 months), so it runs only when asked.
import { CommissionError } from './core.js';

const T = typeof window === 'undefined' ? null : window.Endwise; // null when the tests import readDeals
const h = T?.h;
const SLUG = 'real-estate-commission-split';
const $ = (id) => document.getElementById(id);
const val = (id) => $(id).value.trim();

let mode = 'deal';
let signedIn = false;
let tool = null;
let seq = 0;

const put = (el, ...kids) => { el.textContent = ''; el.append(...kids.filter(Boolean)); };
const soon = (fn, ms = 350) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
const opt = (o, k, v) => { if (v !== '' && v !== undefined && v !== null) o[k] = v; };

// ---------- reading the form ----------

function readPlan() {
  const p = { split: val('rc-split') };
  opt(p, 'cap', val('rc-cap'));
  opt(p, 'capStart', val('rc-start'));
  opt(p, 'postCapSplit', val('rc-post'));
  if (val('rc-roy')) { p.royaltyPercent = val('rc-roy'); opt(p, 'royaltyCap', val('rc-roycap')); p.royaltyFrom = $('rc-royfrom').value; }
  if (val('rc-fee')) p.fees = [{ name: 'Transaction fee', amount: val('rc-fee'), when: $('rc-feewhen').value, ...($('rc-feecap').checked ? { countsToCap: true } : {}) }];
  if (val('rc-team')) { p.team = { percent: val('rc-team'), order: $('rc-order').value }; opt(p.team, 'cap', val('rc-teamcap')); }
  opt(p, 'monthlyFee', val('rc-monthly'));
  return p;
}

// "2026-04-10, Maple St, 420000, 2.5, 25, pending" or "2026-08-21, Referral, $4500".
export function readDeals(text) {
  const lines = text.split(/\n|;/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new CommissionError('Add at least one deal.');
  return lines.map((l) => {
    const parts = l.split(',').map((x) => x.trim());
    const pending = parts.some((x) => /^pending$/i.test(x));
    const f = parts.filter((x) => !/^pending$/i.test(x));
    if (!/^\d{4}-\d{2}-\d{2}$/.test(f[0] ?? '')) throw new CommissionError(`Start each line with the closing date, like 2026-04-10: "${l.slice(0, 40)}".`);
    const d = { date: f[0] };
    let i = 1;
    if (f[i] !== undefined && !/^\$?[\d,.]+$/.test(f[i])) { if (f[i]) d.label = f[i]; i += 1; }
    const amount = f[i] ?? '';
    if (amount.startsWith('$')) { d.commission = amount.slice(1); i += 1; }
    else { d.price = amount; d.rate = f[i + 1] ?? ''; i += 2; }
    if (f[i]) d.referralPercent = f[i].replace(/%$/, '');
    if (pending) d.pending = true;
    return d;
  });
}

function inputFor(m) {
  const plan = readPlan();
  if (m === 'deal') {
    const deal = {};
    if (val('rc-commission')) deal.commission = val('rc-commission');
    else { deal.price = val('rc-price'); deal.rate = val('rc-rate'); }
    opt(deal, 'referralPercent', val('rc-ref'));
    const o = { op: 'deal', plan, deal };
    if (val('rc-cappaid')) o.paidSoFar = { cap: val('rc-cappaid') };
    return o;
  }
  if (m === 'year') return { op: 'year', agent: val('rc-agent'), plan, deals: readDeals($('rc-deals').value) };
  if (m === 'compare') {
    const b = { split: val('rc-bsplit') };
    opt(b, 'cap', val('rc-bcap'));
    if (val('rc-bfee')) b.fees = [{ name: 'Transaction fee', amount: val('rc-bfee') }];
    opt(b, 'monthlyFee', val('rc-bmonthly'));
    return { op: 'compare', plans: [{ ...plan, label: 'Plan A' }, { ...b, label: 'Plan B' }], deals: Number(val('rc-n')), averageCommission: val('rc-avg') };
  }
  return { op: 'goal', plan, goal: val('rc-goal'), averageCommission: val('rc-gavg') };
}

// ---------- showing a result ----------

const table = (head, rows, numFrom = 1) => h('div', { class: 'table-scroll' }, h('table', { class: 'rules rc-table' }, [
  h('thead', {}, h('tr', {}, head.map((x, i) => h('th', { scope: 'col', class: i >= numFrom ? 'num' : null }, x)))),
  h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, i) => (i === 0 ? h('th', { scope: 'row' }, c) : h('td', { class: i >= numFrom ? 'num' : null }, c)))))),
]));

// Each result like the other tool pages: the tag (Example until the form is changed), the inputs in
// one line, the big figure, the answer, then one line per step with how it was worked out.
let pristine = true;
const MODE_SRC = { deal: 'your plan, in its order', compare: 'two plans, the same deals', goal: 'your plan, worked back', year: 'your deals, in date order' };
// Only one deal's defaults are the tool's worked example; the other modes start from sample values.
const head = (m, ins) => {
  const tag = !pristine ? 'Your result' : m === 'deal' || m === 'year' ? 'Example' : 'Sample values';
  return [
    h('div', { class: 'tf-rh' }, [h('span', { class: pristine ? 'tf-tag' : 'tf-tag run' }, tag), h('span', { class: 'tf-src' }, MODE_SRC[m])]),
    h('p', { class: 'tf-exin' }, tag === 'Example' ? `Example: ${ins}` : ins),
  ];
};
const item = (k, what, v, why, cls = null) => h('li', { class: cls }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), h('b', {}, v), why ? h('em', {}, why) : null]);

function showDeal(r) {
  const what = val('rc-commission') ? `a $${val('rc-commission')} commission` : `a $${Number(val('rc-price')).toLocaleString('en-US')} sale at ${val('rc-rate')}%`;
  return [
    ...head('deal', `${what} on a ${r.plan}`),
    h('p', { class: 'tf-big' }, [h('b', {}, r.net), h('span', {}, 'you net')]),
    h('p', { class: 'tf-sub' }, r.answer),
    h('ul', { class: 'tf-items' }, r.steps.map((s, i) => item(i === r.steps.length - 1 ? '=' : i ? '-' : '$', s.label, s.amount, s.basis, i === r.steps.length - 1 ? 'tot' : null))),
    h('p', { class: 'tf-note' }, r.capLeft === null ? 'No cap in this plan.' : r.cappedAtStart ? 'Already capped before this deal.' : r.crossedCap ? 'This deal crosses your cap.' : `${r.capLeft} left to your cap.`),
  ];
}
function showCompare(r) {
  return [
    ...head('compare', `${val('rc-n')} deals a year at $${Number(val('rc-avg')).toLocaleString('en-US')} each`),
    h('p', { class: 'tf-sub' }, r.answer),
    table(['Deals a year', ...r.names], r.table.map((x) => [String(x.deals), ...x.nets])),
    h('ul', { class: 'tf-items' }, r.plans.map((p, i) => item(String.fromCharCode(65 + i), p.name, '', p.plan))),
  ];
}
function showGoal(r) {
  return [
    ...head('goal', `$${Number(val('rc-goal')).toLocaleString('en-US')} a year, deals of $${Number(val('rc-gavg')).toLocaleString('en-US')}`),
    h('p', { class: 'tf-big' }, [h('b', {}, r.gci ?? 'Not reached'), h('span', {}, r.deals ? `GCI, ${r.deals} deals of ${r.averageGross}` : 'GCI needed')]),
    h('p', { class: 'tf-sub' }, r.answer),
  ];
}
function showYear(r, charged) {
  const file = h('a', { href: URL.createObjectURL(new Blob([r.csv], { type: 'text/csv' })), download: 'commission-tracker.csv' }, 'commission-tracker.csv');
  return [
    h('p', { class: 'tf-sub' }, [r.answer, r.forecast && r.forecast.deals !== 0 ? ` ${r.forecast.text}` : '', ' ', file, charged ?? '']),
    table(['Date', 'Deal', 'Commission', 'Referral', 'Brokerage', 'Team', 'Fees', 'Net', 'Cap left'], r.deals.map((d) => [d.date, `${d.label ?? ''}${d.pending ? ' (pending)' : ''}`, d.gross, d.referral, d.brokerage, d.team, d.fees, d.net, d.capLeft ?? ''])),
    h('h3', {}, 'Cap years'),
    table(['From', 'To', 'Deals', 'Paid toward cap', 'Left', 'Capped on', 'Net'], r.periods.map((p) => [p.start, p.end, String(p.deals), p.capPaid ?? '', p.capLeft ?? '', p.cappedOn ?? '', p.net]), 2),
    h('h3', {}, 'For the 1099, by calendar year'),
    table(['Year', 'Deals', 'Commission', 'Paid to you', 'Before fees charged to you', 'Threshold'], r.years.map((y) => [String(y.year), String(y.deals), y.gross, y.paidToYou, y.beforeYourFees, y.threshold ?? ''])),
  ];
}

function showError(e) {
  const kids = [h('p', { class: 'form-error' }, e.message)];
  if (e.code === 'unauthorized' || e.code === 'rate_limited') kids.push(h('p', {}, h('a', { href: `${T.base}/account` }, 'Sign in')));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') kids.push(h('p', {}, h('a', { href: `${T.base}/account#top-up` }, 'Open your account')));
  return kids;
}

async function recompute() {
  const my = ++seq;
  $('rc-err').textContent = '';
  if (mode === 'year') return showTrackerPanel();
  let input;
  try { input = inputFor(mode); } catch (e) { $('rc-err').textContent = e.message; return; }
  try {
    const r = (await T.run(SLUG, input)).result;
    if (my !== seq) return;
    put($('rc-out'), ...(mode === 'deal' ? showDeal(r) : mode === 'compare' ? showCompare(r) : showGoal(r)));
  } catch (e) {
    if (my !== seq) return;
    $('rc-err').textContent = e.message;
  }
}
const later = soon(recompute);

// The tracker: the worked example at rest (from the tool's own examples); a run only on request.
async function showTrackerPanel() {
  const t = tool?.pricing?.actions.find((a) => a.name === 'tracker')?.text;
  const words = (typeof t === 'object' && t ? t.USD : t) ?? '';
  const price = h('p', { class: 'rc-aside' }, signedIn ? words : `${words}. Sign in to run your own year.`);
  const button = h('button', { class: 'btn', type: 'button' }, 'Work out my year');
  const example = tool?.examples?.find((x) => x.input.op === 'year');
  const body = h('div', {}, example ? [h('div', { class: 'tf-rh' }, [h('span', { class: 'tf-tag' }, 'Example'), h('span', { class: 'tf-src' }, MODE_SRC.year)]), h('p', { class: 'tf-exin' }, 'Example: six example deals on a 70/30 plan with a $20,000 cap from March 15 and a $300 fee, not yet your own deals'), ...showYear(example.output)] : []);
  button.addEventListener('click', async () => {
    $('rc-err').textContent = '';
    button.disabled = true;
    try {
      const json = await T.run(SLUG, inputFor('year'));
      const charged = json.charged?.amount ? ` Charged ${json.charged.display}.` : '';
      put(body, ...showYear(json.result, charged));
    } catch (e) {
      put(body, ...showError(e));
    } finally {
      button.disabled = false;
    }
  });
  put($('rc-out'), price, button, body);
  if (signedIn) {
    try {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: inputFor('year') })).quote;
      price.textContent = q.amount ? `This year costs ${q.display} from your balance (${words}).` : `This year is already paid for: re-running is free (${words}).`;
    } catch { /* the words stay */ }
  }
}

// ---------- modes and the address ----------

function setMode(m) {
  mode = m;
  for (const b of document.querySelectorAll('.rc-tab')) b.setAttribute('aria-pressed', String(b.dataset.mode === m));
  for (const f of document.querySelectorAll('#rc-form fieldset')) f.hidden = f.dataset.for !== m;
  recompute();
}

function prefill() {
  const q = new URLSearchParams(location.search);
  const m = ['deal', 'year', 'compare', 'goal'].includes(q.get('mode')) ? q.get('mode') : 'deal';
  const pairs = [['rc-split', 'split'], ['rc-cap', 'cap'], ['rc-start', 'start'], ['rc-fee', 'fee'], ['rc-feewhen', 'feewhen'], ['rc-post', 'post'], ['rc-roy', 'roy'], ['rc-roycap', 'roycap'], ['rc-royfrom', 'royfrom'],
    ['rc-team', 'team'], ['rc-order', 'order'], ['rc-teamcap', 'teamcap'], ['rc-monthly', 'monthly'], ['rc-price', 'price'], ['rc-rate', 'rate'], ['rc-commission', 'commission'], ['rc-ref', 'ref'], ['rc-cappaid', 'capPaid'],
    ['rc-agent', 'agent'], ['rc-n', 'n'], ['rc-goal', 'goal'], ['rc-bsplit', 'bsplit'], ['rc-bcap', 'bcap'], ['rc-bfee', 'bfee'], ['rc-bmonthly', 'bmonthly']];
  // A link from a page carries the whole plan: fields it leaves out are cleared, not left at the example.
  const fromLink = q.has('split');
  for (const [id, key] of pairs) {
    if (q.has(key)) $(id).value = q.get(key);
    else if (fromLink && $(id).tagName === 'INPUT' && !['rc-agent', 'rc-n', 'rc-goal', 'rc-bsplit', 'rc-bcap', 'rc-price', 'rc-rate'].includes(id)) $(id).value = '';
  }
  if (q.has('commission') && !q.has('price')) { $('rc-price').value = ''; $('rc-rate').value = ''; }
  if (q.has('avg')) $(m === 'goal' ? 'rc-gavg' : 'rc-avg').value = q.get('avg');
  if (q.has('deals')) $('rc-deals').value = q.get('deals').split(';').join('\n');
  if (['post', 'roy', 'team', 'monthly'].some((k) => q.has(k))) $('rc-more').open = true;
  return m;
}

async function main() {
  try { tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool; } catch { tool = null; }
  try { signedIn = !!(await T.me()); } catch { signedIn = false; }
  const start = prefill();
  pristine = !location.search;
  for (const b of document.querySelectorAll('.rc-tab')) b.addEventListener('click', () => setMode(b.dataset.mode));
  $('rc-form').addEventListener('input', () => { pristine = false; if (mode !== 'year') later(); });
  $('rc-form').addEventListener('submit', (e) => { e.preventDefault(); recompute(); });
  $('rc-form').addEventListener('change', () => { if (mode === 'year') showTrackerPanel(); else later(); });
  T.mountCodePanel($('rc-code'), SLUG);
  setMode(start);
}

if (T) main();
