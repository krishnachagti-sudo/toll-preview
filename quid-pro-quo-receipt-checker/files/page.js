// The quid pro quo receipt checker page. core.js (the same file the server runs) does the free check
// in the browser, built from the rules the tool publishes in its 'limits' example, so the verdict
// updates as the form changes and nothing is sent. The event wording and the list check are the
// server's paid answers to the same engine.
import { makeEngine, QpqError, money, BENEFIT_TYPES, BENEFIT_LABELS, KINDS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'quid-pro-quo-receipt-checker';
const $ = (id) => document.getElementById(id);
const STATUS = { pass: 'Meets it', fail: 'Fix', warn: 'Check', note: 'Note' };
const KIND_WORDS = { ticket: 'an event ticket', auction: 'an auction purchase', raffle: 'a raffle ticket', sponsorship: 'a sponsorship', membership: 'a membership', donation: 'a donation' };
let engine = null;
let tool = null;
let signedIn = false;
const levels = []; // the event wording's levels, added from the form

// ---------- the form ----------

function benefitRow(b = {}) {
  const row = h('div', { class: 'qp-benefit' });
  const type = h('select', { 'aria-label': 'Kind of item' }, BENEFIT_TYPES.map((t) => h('option', { value: t }, BENEFIT_LABELS[t])));
  type.value = b.type ?? 'goods-services';
  const what = h('input', { type: 'text', maxlength: '120', placeholder: 'What (dinner, mug, lesson)', 'aria-label': 'What the donor received', value: b.what ?? '' });
  const value = h('input', { type: 'text', inputmode: 'decimal', placeholder: 'Value $', 'aria-label': 'Fair market value in dollars', value: b.value ?? '' });
  const cost = h('input', { type: 'text', inputmode: 'decimal', placeholder: 'Cost to you $', 'aria-label': 'Cost to the organization in dollars', value: b.cost ?? '' });
  const drop = h('button', { type: 'button', class: 'btn btn-quiet qp-drop', 'aria-label': 'Remove this item' }, 'Remove');
  drop.addEventListener('click', () => { row.remove(); update(); });
  for (const el of [type, what, value, cost]) el.addEventListener('input', update);
  row.append(type, what, value, cost, drop);
  row.read = () => {
    const out = { what: what.value.trim(), type: type.value };
    if (value.value.trim()) out.value = value.value.trim();
    if (cost.value.trim()) out.cost = cost.value.trim();
    return out;
  };
  $('qp-benefits').append(row);
}

function readForm() {
  const input = { op: 'check', year: Number($('qp-year').value), kind: $('qp-kind').value, payment: $('qp-payment').value.trim() };
  const benefits = [...$('qp-benefits').children].map((r) => r.read()).filter((b) => b.what || b.value || b.cost);
  if (benefits.length) input.benefits = benefits;
  const org = {};
  if ($('qp-org').value.trim()) org.name = $('qp-org').value.trim();
  if ($('qp-religious').checked) org.religious = true;
  if (Object.keys(org).length) input.org = org;
  if ($('qp-event').value.trim()) input.event = $('qp-event').value.trim();
  if ($('qp-text').value.trim()) input.text = $('qp-text').value;
  if ($('qp-kind').value === 'raffle' && $('qp-prize').value.trim() && $('qp-wager').value.trim()) input.prize = { prize: $('qp-prize').value.trim(), wager: $('qp-wager').value.trim() };
  return input;
}

function fill(input) {
  $('qp-year').value = String(input.year ?? 2026);
  $('qp-kind').value = input.kind ?? 'ticket';
  $('qp-payment').value = input.payment ?? '';
  $('qp-benefits').textContent = '';
  for (const b of input.benefits ?? []) benefitRow(b);
  if (!(input.benefits ?? []).length) benefitRow();
  $('qp-org').value = input.org?.name ?? '';
  $('qp-religious').checked = !!input.org?.religious;
  $('qp-event').value = input.event ?? '';
  $('qp-text').value = input.text ?? '';
}

// Prefill from the address: ?year=&kind=&payment=&what=&value=&type=&cost=&org=&event=&religious=1&text=
function fromParams(p) {
  const base = tool.examples[0].input;
  if (!['payment', 'kind', 'what', 'value', 'year'].some((k) => p.has(k))) return base;
  const input = { year: Number(p.get('year')) || 2026, kind: KINDS.includes(p.get('kind')) ? p.get('kind') : 'ticket', payment: p.get('payment') ?? '' };
  if (p.get('what') || p.get('value') || p.get('cost')) input.benefits = [{ what: p.get('what') ?? '', type: BENEFIT_TYPES.includes(p.get('type')) ? p.get('type') : 'goods-services', value: p.get('value') ?? '', cost: p.get('cost') ?? '' }];
  if (p.get('org') || p.get('religious')) input.org = { name: p.get('org') ?? '', religious: p.get('religious') === '1' };
  if (p.get('event')) input.event = p.get('event');
  if (p.get('text')) input.text = p.get('text');
  return input;
}

// ---------- the free check, in the browser ----------

function render(input, example) {
  const box = $('qp-result');
  box.textContent = '';
  $('qp-error').textContent = '';
  let a;
  try {
    if (!String(input.payment).trim()) throw new QpqError('Enter the amount paid.', 'payment');
    a = engine.assess({ ...input, kind: input.kind });
  } catch (e) {
    if (!(e instanceof QpqError)) throw e;
    $('qp-error').textContent = e.message;
    box.append(h('p', { class: 'muted' }, 'The verdict shows here once the payment and items are filled in.'));
    $('qp-buy').hidden = true;
    return;
  }
  const w = engine.wording(a, { org: input.org, event: input.event });
  const head = a.exception === 'raffle' ? 'Not deductible: a raffle ticket' : a.quidProQuo ? (a.disclosureRequired ? 'Disclosure required' : 'No disclosure required') : a.exception === 'no-donative-element' ? 'Nothing deductible' : 'Fully deductible';
  // Like the other tool pages: the tag and source, the inputs in one line, the deductible part as the
  // big figure, then one line per figure with where it comes from.
  const got = (input.benefits ?? []).filter((b) => b.what || b.value).map((b) => `${b.value ? `a $${b.value} ` : ''}${b.what || 'item'}`);
  const said = input.text ? `, receipt text ${/100% tax deductible/i.test(input.text) ? 'that says "100% tax deductible"' : 'checked'}` : '';
  const ins = `${money(a.payment)} for ${KIND_WORDS[input.kind] ?? input.kind}${got.length ? ` with ${got.join(' and ')}` : ''}${said}`;
  const item = (k, what, v, why, cls = null) => h('li', { class: cls }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), h('b', {}, v), h('em', {}, why)]);
  box.append(
    h('div', { class: 'tf-rh' }, [h('span', { class: example ? 'tf-tag' : 'tf-tag run' }, example ? 'Example' : 'Your result'), h('span', { class: 'tf-src' }, 'IRS Publication 1771')]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${ins}` : ins),
    h('p', { class: 'tf-big' }, [h('b', {}, money(a.deductible)), h('span', {}, 'deductible')]),
    h('p', { class: 'tf-sub qp-verdict' }, head),
    h('ul', { class: 'tf-items' }, [
      item('$', 'Paid', money(a.payment), `for ${KIND_WORDS[input.kind] ?? input.kind}, ${a.year}`),
      item('-', 'Value received', money(a.counted), a.disregarded?.length ? `counted items only; ${a.disregarded.length} left out as insubstantial` : 'your good faith estimate, IRS Publication 1771'),
      item('=', 'Deductible', money(a.deductible), a.reasons[0] ?? '', 'tot'),
      a.quidProQuo ? item('!', 'Written disclosure', a.disclosureRequired ? 'required' : 'not required', a.reasons[1] ?? 'over $75 and partly for goods or services', a.disclosureRequired ? 'hi' : null) : null,
    ]),
  );
  if (input.text) {
    const c = engine.checkText(a, input.text, { org: input.org });
    box.append(h('p', { class: 'qp-heading' }, c.verdict === 'meets' ? 'Your receipt meets it' : 'Your receipt needs fixing'),
      h('ul', { class: 'qp-checks' }, c.checks.map((x) => h('li', { class: `qp-${x.status}` }, [h('span', { class: 'qp-tag' }, STATUS[x.status]), h('strong', {}, x.label), ' ', x.detail]))));
  }
  const copy = h('button', { type: 'button', class: 'btn btn-quiet' }, 'Copy');
  const st = h('span', { class: 'small muted', role: 'status' });
  copy.addEventListener('click', () => T.copy(w.receipt, copy, st));
  box.append(h('p', { class: 'qp-heading' }, 'Use this wording'), h('blockquote', { class: 'qp-quote' }, w.receipt), h('p', {}, [copy, ' ', st]));
  if (w.solicitation) box.append(h('p', { class: 'small' }, [h('strong', {}, 'On the invitation or ticket page: '), w.solicitation]));
  if (input.prize) {
    try {
      const p = engine.rafflePrize({ year: input.year, prize: input.prize.prize, wager: input.prize.wager });
      box.append(h('p', { class: 'small' }, `Prize less ticket price ${money(p.net)}: ${p.reportable ? `report on Form W-2G (${input.year} threshold ${money(p.threshold)}, and at least 300 times the ticket price)` : 'no Form W-2G'}${p.withholding ? `; withhold 24% (${money(p.withheld)})` : ''}.`));
    } catch (e) { if (!(e instanceof QpqError)) throw e; box.append(h('p', { class: 'small muted' }, e.message)); }
  }
  $('qp-buy').hidden = false;
  showLevels();
}

let timer = null;
function update() { clearTimeout(timer); timer = setTimeout(() => render(readForm(), false), 200); }

// ---------- paid: the event wording and the list ----------

function showLevels() {
  const box = $('qp-levels');
  box.textContent = '';
  if (!levels.length) { box.append(h('p', { class: 'small muted' }, 'Levels: this receipt is used as the only level. Add it, change the form for the next level (a table, a sponsor package), and add again.')); return; }
  box.append(h('ol', { class: 'small' }, levels.map((l) => h('li', {}, `${l.name}: ${money(Math.round(Number(String(l.payment).replace(/[$,]/g, '')) * 100) || 0)}`))));
}

function wordingInput() {
  const f = readForm();
  const lv = levels.length ? levels : [{ name: f.kind === 'ticket' ? 'Ticket' : 'Payment', payment: f.payment, kind: f.kind, ...(f.benefits ? { benefits: f.benefits } : {}) }];
  return { op: 'wording', year: f.year, org: { name: f.org?.name || 'Our organization', ...(f.org?.religious ? { religious: true } : {}) }, event: f.event || 'our event', levels: lv };
}

async function quoteLine(el, body) {
  if (!signedIn) { el.textContent = 'Sign in to buy; the price is shown above.'; return; }
  try {
    const q = (await T.api(`/api/run/${SLUG}/quote`, { body })).quote;
    el.textContent = q.amount ? `This costs ${q.display} from your balance.` : "This is free for you now (made in the last 90 days, or under the monthly cap).";
  } catch { el.textContent = 'Sign in to see what this costs you.'; }
}

function download(name, text, type) {
  return h('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name }, name);
}

async function onMake() {
  $('qp-buy-err').textContent = '';
  $('qp-got').textContent = 'Writing the wording.';
  try {
    const json = await T.run(SLUG, wordingInput());
    const r = json.result;
    $('qp-got').textContent = '';
    $('qp-got').append(`${r.answer} `, download(r.file.filename, r.file.text, 'text/plain'), ' ', download(r.csv.filename, r.csv.text, 'text/csv'));
  } catch (e) {
    $('qp-got').textContent = '';
    $('qp-buy-err').textContent = e.status === 401 ? 'Sign in to buy the event wording (the check stays free).' : e.message;
  }
}

async function onBatch() {
  const out = $('qp-batch-out');
  out.textContent = 'Checking the list.';
  const f = readForm();
  try {
    const json = await T.run(SLUG, { op: 'batch', year: f.year, csv: $('qp-csv').value, ...(f.org?.name ? { org: { name: f.org.name } } : {}) });
    const r = json.result;
    out.textContent = '';
    out.append(h('p', {}, r.answer), h('p', {}, download(r.csv.filename, r.csv.text, 'text/csv')));
  } catch (e) {
    out.textContent = e.status === 401 ? 'Sign in to check a list (single receipts stay free).' : e.message;
  }
}

function limitsTable(rows) {
  return h('table', { class: 'qp-table small' }, [
    h('thead', {}, h('tr', {}, ['Year', 'Low-cost article', 'Minimum gift', 'Cap'].map((x) => h('th', {}, x)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, [String(r.year), `$${r.lowCostArticle}`, `$${r.minimumGift}`, `$${r.cap}`].map((x) => h('td', {}, x))))),
  ]);
}

async function start() {
  T.mountCodePanel($('qp-code'), SLUG);
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('qp-result').textContent = 'The worked example could not load. Reload the page to try again.';
    return;
  }
  const published = tool.examples.find((x) => x.input.op === 'limits').output;
  engine = makeEngine({
    thresholds: published.thresholds,
    gaming: published.gaming,
    limits: Object.fromEntries(published.limits.map((l) => [l.year, { lowCost: l.lowCostArticle, minGift: l.minimumGift, cap: l.cap, source: l.source.id }])),
  });
  $('qp-year').append(...engine.years.slice().reverse().map((y) => h('option', { value: String(y) }, String(y))));
  $('qp-limits').append(limitsTable(published.limits));
  $('qp-csv').value = tool.examples.find((x) => x.input.op === 'batch').input.csv;
  const params = new URLSearchParams(window.location.search);
  const input = fromParams(params);
  fill(input);
  render(readForm(), input === tool.examples[0].input);

  for (const id of ['qp-payment', 'qp-org', 'qp-event', 'qp-text', 'qp-prize', 'qp-wager']) $(id).addEventListener('input', update);
  for (const id of ['qp-year', 'qp-kind', 'qp-religious']) $(id).addEventListener('change', update);
  $('qp-add').addEventListener('click', () => benefitRow());
  $('qp-add-level').addEventListener('click', () => {
    const f = readForm();
    levels.push({ name: `${f.kind === 'ticket' ? 'Ticket' : f.kind[0].toUpperCase() + f.kind.slice(1)} ${levels.length + 1}`, payment: f.payment, kind: f.kind, ...(f.benefits ? { benefits: f.benefits } : {}) });
    showLevels();
    quoteLine($('qp-quote'), wordingInput());
  });
  $('qp-make').addEventListener('click', onMake);
  $('qp-batch-run').addEventListener('click', onBatch);
  $('qp-form').addEventListener('submit', (ev) => { ev.preventDefault(); clearTimeout(timer); render(readForm(), false); });
  const quotes = () => { quoteLine($('qp-quote'), wordingInput()); quoteLine($('qp-batch-quote'), { op: 'batch', year: Number($('qp-year').value), csv: $('qp-csv').value }); };
  quotes();
  T.me().then((account) => { signedIn = !!account; quotes(); }).catch(() => {});
}

start();
