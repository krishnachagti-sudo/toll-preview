// The tip pool calculator page. The rules data lives on the server, so the split, the tip-out and the
// check run there through Endwise.run: on this page they are free and never use a free run. The
// pay-run record (payroll CSV and tip sheet) is the paid output.
import { TipError, isRealDate } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'tip-pool-calculator';
const $ = (id) => document.getElementById(id);

let tool = null;
let signedIn = false;
let lastSplit = null; // the last good split input

const put = (el, ...kids) => { el.textContent = ''; el.append(...kids.filter(Boolean)); };
const soon = (fn, ms = 350) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

// ---------- reading the form ----------

const FLAGS = new Set(['supervisor', 'manager', 'owner']);
// "Ana, server, 8" / "Ana, server, 8, 10" / "Hal, server, 6, 5, supervisor" -> a person.
function readStaff(text) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new TipError('Add at least one person, one per line: name, role, hours.');
  if (lines.length > 200) throw new TipError('At most 200 people.');
  return lines.map((l) => {
    const parts = l.split(',').map((x) => x.trim()).filter((x) => x !== '');
    const flags = parts.filter((x) => FLAGS.has(x.toLowerCase()) && parts.indexOf(x) > 1);
    const rest = parts.filter((x) => !flags.includes(x));
    const [name, role = 'other', hours, points] = rest;
    if (!name) throw new TipError(`Could not read "${l.slice(0, 40)}". Write a name, a role and the hours: Ana, server, 8.`);
    const p = { name, role: role.toLowerCase() };
    if (hours !== undefined) p.hours = hours;
    if (points !== undefined) p.points = points;
    for (const f of flags.map((x) => x.toLowerCase())) {
      if (f === 'owner') p.owner = true;
      else p.supervisor = true;
    }
    return p;
  });
}
// "server 70" / "bartender: 20%" -> [{ role, percent }].
function readPercents(text) {
  return text.split(/\n+/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = /^([a-z][a-z -]*?)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*%?$/i.exec(l);
    if (!m) throw new TipError(`Could not read "${l.slice(0, 40)}". Write a role and its percentage: bartender 20.`);
    return { role: m[1].trim().toLowerCase().replace(/\s+/g, '-'), percent: m[2] };
  });
}

function splitInput() {
  const place = $('tp-place').value;
  const input = { op: 'split', jurisdiction: place, pool: $('tp-pool').value.trim(), method: $('tp-method').value, staff: readStaff($('tp-staff').value) };
  if (place.startsWith('US') && $('tp-credit').checked) input.tipCredit = true;
  if ($('tp-vol').checked) input.voluntary = true;
  if (input.method === 'percentage') input.rolePercents = readPercents($('tp-pct').value);
  const card = $('tp-card').value.trim();
  const fee = $('tp-fee').value.trim();
  if (card && fee) { input.cardTips = card; input.cardFeePercent = fee; }
  const paid = $('tp-paid').value;
  if (place === 'UK' && paid) {
    if (!isRealDate(paid)) throw new TipError('The tip date must be a real date.');
    input.tipsPaidOn = paid;
  }
  return input;
}

// ---------- showing a result ----------

function cites(list) {
  const out = h('span', { class: 'cite' });
  list.forEach((c, i) => out.append(i ? '; ' : '', h('a', { href: c.href, rel: 'noopener' }, c.text)));
  return out;
}
function findingsList(findings) {
  const shown = findings.filter((f) => f.level !== 'info' || f.quote);
  return h('ul', { class: 'tp-findings' }, shown.map((f) => h('li', { class: f.level }, [
    h('span', { class: 'lvl' }, f.level === 'fail' ? 'Not allowed' : f.level === 'warn' ? 'Check' : 'Note'),
    f.text, ' ', cites(f.cites),
    f.quote ? h('blockquote', {}, `“${f.quote}”`) : null,
    f.explain ? h('p', { class: 'small muted' }, f.explain) : null,
  ])));
}
const VERDICT = { ok: 'No rule broken on these facts', check: 'Points to check', fail: 'Problems found' };

// The form as first served, so the result says "Example" until it is changed.
let DEFAULTS = null;
const formNow = () => [...document.querySelectorAll('#tp-split input, #tp-split select, #tp-split textarea')].map((el) => (el.type === 'checkbox' ? el.checked : el.value)).join('|');

// The inputs in one line: "$800.00 pool, 5 people by hours worked, United States, no tip credit".
function inputsLine(r) {
  const n = r.rows.length;
  const credit = $('tp-place').value.startsWith('US') ? ($('tp-credit').checked ? ', tip credit' : ', no tip credit') : '';
  return `${r.pool} pool, ${n} ${n === 1 ? 'person' : 'people'} by ${r.methodName}, ${r.jurisdiction.name}${credit}`;
}

// One line per figure: a mark, what it is, the amount, and where it comes from.
const item = (k, label, amount, why, cls = null) => h('li', { class: cls }, [
  h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, label), amount ? h('b', {}, amount) : null, why ? h('em', {}, why) : null,
]);

// The split like the other tool pages: a header row, the inputs, the pool as the big figure, one
// line per person with how their share was found, then the check; the long notes are folded.
function showSplit(r) {
  const example = formNow() === DEFAULTS;
  const unit = r.totalUnits?.unit;
  const why = (x) => {
    const parts = [];
    if (x.hours !== null && x.hours !== undefined) parts.push(`${x.hours} hours${unit === 'hours' ? ` of ${r.totalUnits.value}` : ''}`);
    if (x.points !== null && x.points !== undefined) parts.push(`${x.points} points`);
    if (!parts.length) parts.push(r.methodName);
    if (x.extraCent) parts.push('plus one leftover cent');
    return parts.join(', ');
  };
  const items = [
    ...r.rows.map((x) => item(x.name.slice(0, 1).toUpperCase(), `${x.name}, ${x.roleLabel}`, x.share, why(x), 'plain')),
    r.cardFee?.deductedCents ? item('-', 'Card fees', `-${r.cardFee.deducted}`, 'taken off the card tips before the split', 'sk') : null,
    item('=', 'Split', r.net, r.rate ? `${r.rate}, adding up exactly to the pool` : 'adding up exactly to the pool', 'hi tot'),
    r.deadline ? item('!', 'Pay by', r.deadline, 'the deadline for these tips') : null,
  ];
  const problems = r.findings.some((f) => f.level !== 'info');
  put($('tp-out'),
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src' }, r.jurisdiction.name),
    ]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${inputsLine(r)}` : inputsLine(r)),
    h('p', { class: 'tf-big' }, [h('b', {}, r.net), h('span', {}, r.rate ? `split by ${r.methodName}, ${r.rate}` : `split by ${r.methodName}`)]),
    h('p', { class: `tp-verdict ${r.verdict}` }, VERDICT[r.verdict]),
    h('p', { class: 'tf-sub' }, r.answer),
    h('ul', { class: 'tf-items tp-items' }, items),
    r.groups ? h('p', { class: 'tf-note' }, r.groups.map((g) => `${g.label}: ${g.percent}% = ${g.amount}, ${g.by === 'hours' ? 'by hours' : 'equally'}`).join('; ') + (r.droppedRoles.length ? `. Nobody worked as ${r.droppedRoles.join(', ')}, so that share went to the roles that did.` : '.')) : null,
    h('details', { class: 'xpand tp-check-fold', open: problems ? '' : null }, [
      h('summary', {}, `The check: ${r.jurisdiction.name}`),
      h('div', { class: 'xp-in' }, findingsList(r.findings)),
    ]),
    r.rounding.extraCents ? h('p', { class: 'tf-note' }, `${r.rounding.extraCents} leftover ${r.rounding.extraCents === 1 ? 'cent' : 'cents'}: ${r.rounding.rule}`) : null,
    h('details', { class: 'xpand' }, [h('summary', {}, 'Not legal or tax advice'), h('div', { class: 'xp-in' }, h('ul', { class: 'tp-list' }, r.disclaimers.map((d) => h('li', {}, d))))]),
  );
}

async function recomputeSplit() {
  $('tp-err').textContent = '';
  let input;
  try {
    input = splitInput();
  } catch (e) {
    if (!(e instanceof TipError)) throw e;
    $('tp-err').textContent = e.message;
    return;
  }
  try {
    const json = await T.run(SLUG, input);
    lastSplit = input;
    showSplit(json.result);
    buy?.refresh();
  } catch (e) {
    $('tp-err').textContent = e.message;
  }
}

function placeChanged() {
  const place = $('tp-place').value;
  $('tp-credit-row').hidden = !place.startsWith('US');
  $('tp-paid-row').hidden = place !== 'UK';
  $('tp-pct-row').hidden = $('tp-method').value !== 'percentage';
}

// ---------- tip-out ----------

async function recomputeTipout() {
  const out = $('tp-to-out');
  try {
    const outs = readPercents($('tp-to-outs').value);
    const input = { op: 'tipout', jurisdiction: $('tp-place').value, base: $('tp-to-base').value, sales: $('tp-to-sales').value.trim() || undefined, tips: $('tp-to-tips').value.trim() || undefined, outs };
    if ($('tp-place').value.startsWith('US') && $('tp-credit').checked) input.tipCredit = true;
    const r = (await T.run(SLUG, input)).result;
    put(out, h('p', {}, r.answer), findingsList(r.findings.filter((f) => f.level !== 'info')));
  } catch (e) {
    put(out, h('p', { class: 'field-error' }, e.message));
  }
}

// ---------- the record ----------

function download(name, body) {
  return h('a', { href: URL.createObjectURL(body), download: name }, name);
}
function recordInput() {
  if (!lastSplit) return null;
  const location = $('tp-loc').value.trim();
  const periodEnd = $('tp-end').value;
  if (!location || !isRealDate(periodEnd)) return null;
  const { op, ...rest } = lastSplit;
  return { op: 'record', ...rest, location, periodEnd };
}
let buy = null;
function buyBox(el) {
  const price = h('p', { class: 'tp-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Download the pay-run record');
  const got = h('div', { class: 'tp-got', role: 'status' });
  const err = h('p', { class: 'form-error', role: 'alert' });
  const words = () => {
    const text = tool?.pricing?.actions.find((a) => a.name === 'record')?.text;
    return text ? T.money(text) : '';
  };
  button.addEventListener('click', async () => {
    err.textContent = '';
    const input = recordInput();
    if (!input) { err.textContent = lastSplit ? 'Type the location and the day the pay period ends.' : 'Fix the split above first.'; return; }
    button.disabled = true;
    try {
      const json = await T.run(SLUG, input);
      const r = json.result;
      const charged = json.charged ? (json.charged.amount ? ` Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : ' Free: a correction to the same pay run.') : '';
      put(got,
        h('p', {}, ['Your record: ', download(r.filename, new Blob([r.csv], { type: 'text/csv' })), ' and ', download(r.filename.replace(/\.csv$/, '.txt'), new Blob([r.sheet], { type: 'text/plain' })), `.${charged}`]),
        h('pre', { class: 'tp-sheet' }, r.sheet));
    } catch (e) {
      err.textContent = e.message;
      if (e.code === 'unauthorized' || e.code === 'rate_limited') err.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
      if (e.code === 'insufficient_balance' || e.code === 'cap_reached') err.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
    } finally {
      button.disabled = false;
    }
  });
  put(el, price, button, got, err);
  let timer = null;
  return {
    refresh() {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const input = recordInput();
        if (!signedIn) { price.textContent = `${words()}. Sign in to download.`; return; }
        if (!input) { price.textContent = words(); return; }
        try {
          const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
          price.textContent = q.amount ? `This record costs ${q.display} from your balance (${words()}).` : `This record is free for you now (${words()}).`;
        } catch {
          price.textContent = words();
        }
      }, 300);
    },
  };
}

// ---------- the address ----------

// ?place=US-WA&pool=800&method=hours&staff=Ana,server,8|Ben,server,6.5&credit=1&vol=1&card=300&fee=2.9
// &pct=server 70|bartender 20&paid=2026-11-30&loc=Main Street&end=2026-11-15
// &tobase=sales&sales=2000&tips=360&outs=bartender 2|busser 1.5
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const lines = (v) => v.split('|').join('\n');
  const set = (id, key, ok = () => true, map = (v) => v) => { const v = q.get(key); if (v !== null && v.length <= 8000 && ok(v)) $(id).value = map(v); };
  const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
  set('tp-place', 'place', (v) => [...$('tp-place').options].some((o) => o.value === v));
  set('tp-pool', 'pool');
  set('tp-method', 'method', (v) => ['hours', 'points', 'hours-points', 'percentage', 'equal'].includes(v));
  set('tp-staff', 'staff', () => true, lines);
  set('tp-pct', 'pct', () => true, lines);
  set('tp-card', 'card');
  set('tp-fee', 'fee');
  set('tp-paid', 'paid', isDate);
  set('tp-loc', 'loc');
  set('tp-end', 'end', isDate);
  set('tp-to-base', 'tobase', (v) => v === 'sales' || v === 'tips');
  set('tp-to-sales', 'sales');
  set('tp-to-tips', 'tips');
  set('tp-to-outs', 'outs', () => true, lines);
  if (q.get('credit') === '1') $('tp-credit').checked = true;
  if (q.get('vol') === '1') $('tp-vol').checked = true;
  if (['card', 'fee', 'paid', 'credit', 'vol'].some((k) => q.has(k))) $('tp-card-fold').open = true;
  const has = (keys) => keys.some((k) => q.has(k));
  // A linked tip-out with no tips clears the example's tips.
  if (has(['sales', 'outs']) && !q.has('tips')) $('tp-to-tips').value = '';
  return { split: has(['pool', 'staff', 'place', 'method']), tipout: has(['sales', 'outs', 'tips']) };
}

// ---------- start ----------

async function start() {
  T.mountCodePanel($('tp-code'), SLUG);
  const linked = fromQuery();
  placeChanged();
  DEFAULTS = linked.split ? null : formNow();
  await recomputeSplit();
  recomputeTipout();
  const again = soon(recomputeSplit);
  // The button shows the split for the form as it stands (it also updates as you type).
  $('tp-split').addEventListener('submit', (e) => {
    e.preventDefault();
    recomputeSplit();
    if (window.matchMedia('(max-width: 1080px)').matches) $('tp-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('tp-split').addEventListener('input', again);
  $('tp-split').addEventListener('change', () => { placeChanged(); again(); });
  $('tp-to').addEventListener('submit', (e) => e.preventDefault());
  $('tp-to').addEventListener('input', soon(recomputeTipout));
  $('tp-to').addEventListener('change', recomputeTipout);
  for (const id of ['tp-loc', 'tp-end']) $(id).addEventListener('input', () => buy && buy.refresh());
  try { tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool; } catch { tool = null; }
  buy = buyBox($('tp-buy'));
  try { signedIn = !!(await T.me()); } catch { signedIn = false; }
  buy.refresh();
}

start();
