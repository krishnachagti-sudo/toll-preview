// The inbound placement fee calculator page. Amazon's table lives on the server, so every answer runs
// there through Endwise.run: on this page it is free and never uses a free run. The send-in worksheet
// (the comparison with its CSV) is the paid output.
import { parseCartons, parseItems, PlacementError } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'inbound-placement-fee-calculator';
const $ = (id) => document.getElementById(id);
const val = (id) => $(id).value.trim();
const MODES = ['compare', 'eligibility', 'awd', 'rates'];

let mode = 'compare';
let signedIn = false;
let tool = null;
// While the form still holds the first worked example (no address, nothing edited), the answer says so.
let atExample = false;

const put = (el, ...kids) => { el.textContent = ''; el.append(...kids.filter(Boolean)); };
const soon = (fn, ms = 350) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
const opt = (o, k, v) => { if (v !== '' && v !== undefined && v !== null) o[k] = v; };

// ---------- reading the form ----------

function product() {
  const units = Number(val('ip-units'));
  if (!Number.isInteger(units) || units < 1) throw new PlacementError('Units is a whole number, 1 or more.');
  const p = { sku: 'This product', units, weightUnit: $('ip-wu').value };
  if (val('ip-l') || val('ip-w') || val('ip-h')) {
    Object.assign(p, { length: val('ip-l'), width: val('ip-w'), height: val('ip-h'), unitWeight: val('ip-uw') || val('ip-weight') });
  } else {
    p.tier = $('ip-tier').value;
    if (p.tier !== 'extra-large') p.weight = val('ip-weight');
  }
  return p;
}

function compareInput() {
  const items = [product(), ...parseItems($('ip-items').value)];
  const options = {};
  const option = (key, freightId, feeId) => {
    if (!val(freightId)) return;
    options[key] = { freight: val(freightId) };
    if (feeId) opt(options[key], 'fee', val(feeId));
  };
  option('minimal', 'ip-min', 'ip-minfee');
  option('partial', 'ip-par', 'ip-parfee');
  option('optimized', 'ip-opt');
  const o = { op: 'compare', items, options };
  opt(o, 'planDate', val('ip-date'));
  opt(o, 'receivedDate', val('ip-recv'));
  opt(o, 'region', $('ip-region').value);
  opt(o, 'credits', val('ip-credits'));
  if (val('ip-cartons')) o.cartons = parseCartons($('ip-cartons').value);
  return o;
}

function inputFor(m) {
  if (m === 'compare') return compareInput();
  if (m === 'eligibility') return { op: 'eligibility', cartons: parseCartons($('ip-ecartons').value), unit: $('ip-eunit').value };
  if (m === 'awd') {
    const o = { op: 'awd', unitsPerCarton: Number(val('ip-upc')), cubicFeet: val('ip-cf'), months: Number(val('ip-months') || 0), region: $('ip-aregion').value, rate: $('ip-arate').value };
    opt(o, 'date', val('ip-adate'));
    if (val('ip-afee')) o.placementFeePerUnit = val('ip-afee');
    else if ($('ip-tier').value !== 'extra-large' && !val('ip-l')) Object.assign(o, { tier: $('ip-tier').value, weight: val('ip-weight'), weightUnit: $('ip-wu').value });
    return o;
  }
  const o = { op: 'rates' };
  if (!val('ip-l')) { o.tier = $('ip-tier').value; if (o.tier !== 'extra-large') Object.assign(o, { weight: val('ip-weight'), weightUnit: $('ip-wu').value }); }
  return o;
}

// ---------- showing a result ----------

const table = (head, rows, numFrom = 1) => h('div', { class: 'table-scroll' }, h('table', { class: 'rules ip-table' }, [
  h('thead', {}, h('tr', {}, head.map((x, i) => h('th', { scope: 'col', class: i >= numFrom ? 'num' : '' }, x)))),
  h('tbody', {}, rows.map((r) => h('tr', { class: r.cls ?? '' }, (r.cells ?? r).map((x, i) => (i === 0 ? h('th', { scope: 'row' }, x) : h('td', { class: i >= numFrom ? 'num' : '' }, x)))))),
]));
const list = (xs, cls = 'ip-flags') => (xs?.length ? h('ul', { class: cls }, xs.map((x) => h('li', {}, x))) : null);

function showCompare(r) {
  const v = r.verdict;
  const big = !v ? 'No option offered' : v.option ? v.label : 'It depends on the fee';
  const sub = v?.by ? `cheaper by ${v.by}` : v?.kind === 'depends' ? 'enter the fee Send to Amazon shows' : '';
  return [
    atExample ? h('p', { class: 't-ex' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', {}, `Worked example: ${tool?.examples?.[0]?.title ?? '1,000 large standard units at 2 lb'}`)]) : null,
    h('p', { class: 'ip-label' }, 'Cheapest'),
    h('p', { class: 'ip-answer' }, [big, sub ? h('small', {}, sub) : null]),
    h('p', { class: 'ip-sub' }, r.answer),
    table(['Option', 'Placement fee', 'Freight', 'Total', 'Per unit'], r.options.map((o) => ({
      cls: v?.option === o.option ? 'ip-win' : o.offered ? '' : 'ip-off',
      cells: [o.offered ? o.label : `${o.label} (not offered)`, o.placementFee + (o.credits ? ` less ${o.credits}` : ''), o.freight + (o.other ? ` + ${o.other}` : ''), o.total, o.perUnit],
    }))),
    r.breakEven.length ? h('p', { class: 'ip-sub' }, r.breakEven.map((b) => b.words).join(' ')) : null,
    table(['Product', 'Units', 'Weight', 'Amazon row', 'Minimal per unit', 'Partial per unit'], r.items.map((it) => [it.sku, it.units.toLocaleString('en-US'), it.shippingWeight ?? '', it.feeRow, it.minimalPerUnit, it.partialPerUnit ?? 'Not offered']), 1),
    r.eligibility ? h('p', { class: 'ip-sub' }, r.eligibility.answer) : null,
    list(r.notes),
  ];
}
function showEligibility(r) {
  return [
    h('p', { class: 'ip-label' }, 'Amazon-optimized splits'),
    h('p', { class: 'ip-answer' }, [r.eligible ? 'Eligible' : 'Not eligible', h('small', {}, `${r.products} ${r.products === 1 ? 'product' : 'products'} in ${r.cartons} ${r.unit}${r.cartons === 1 ? '' : 's'}`)]),
    h('p', { class: 'ip-sub' }, r.answer),
    table(['Product', `${r.unit[0].toUpperCase()}${r.unit.slice(1)}s`, 'Identical', 'Units', 'Result'], r.items.map((x) => ({ cls: x.eligible ? '' : 'ip-off', cells: [x.sku, String(x.cartons), String(x.identical), x.units.toLocaleString('en-US'), x.eligible ? 'Qualifies' : x.fix ?? x.reason] })), 1),
    h('p', { class: 'small muted' }, `Amazon: "${r.rule}"`),
    list(r.tips),
  ];
}
function showAwd(r) {
  return [
    h('p', { class: 'ip-label' }, 'AWD per unit'),
    h('p', { class: 'ip-answer' }, [r.perUnit, h('small', {}, r.placementFee ? `against a placement fee of ${r.placementFee.range} a unit` : r.feeSet)]),
    h('p', { class: 'ip-sub' }, r.answer),
    table(['Per carton', 'Amount'], [['Inbound and outbound processing', r.parts.processing], ['Transport to FBA', r.parts.transport], ['Storage', r.parts.storage], ['Total', r.perCarton]]),
    r.breakEvenMonths ? h('p', { class: 'ip-sub' }, `Storage months before AWD costs more than the fee: ${r.breakEvenMonths.low ?? 'none'} at the low end of the range, ${r.breakEvenMonths.high ?? 'none'} at the high end.`) : null,
    list([r.feeSet, ...r.notes]),
  ];
}
function showRates(r) {
  return [
    h('p', { class: 'ip-label' }, 'Amazon\'s table'),
    h('p', { class: 'ip-answer' }, [r.match?.minimal ?? r.match?.fee ?? 'By tier and weight', h('small', {}, r.match?.row ? `${r.match.row}, minimal splits` : `read ${r.readOn}`)]),
    h('p', { class: 'ip-sub' }, r.answer),
    table(['Size tier and weight', 'Minimal splits', 'Partial splits', 'Amazon-optimized'], r.table.map((x) => ({ cls: r.match?.row === `${x.label}, ${x.band}` ? 'ip-win' : '', cells: [`${x.label}, ${x.band}`, x.minimal, x.partial, x.optimized] }))),
    list(r.notes),
  ];
}
const SHOW = { compare: showCompare, eligibility: showEligibility, awd: showAwd, rates: showRates };

async function recompute() {
  const out = $('ip-out');
  const err = $('ip-err');
  err.textContent = '';
  let input;
  try { input = inputFor(mode); } catch (e) { err.textContent = e.message; return; }
  try {
    const r = (await T.run(SLUG, input)).result;
    put(out, ...SHOW[mode](r));
    buy?.refresh();
  } catch (e) {
    err.textContent = e.fields ? Object.values(e.fields)[0] : e.message;
  }
}
const later = soon(recompute);

// ---------- the worksheet ----------

let buy = null;
function buyBox(el) {
  const price = h('p', { class: 'ip-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Get the worksheet');
  const got = h('div', { role: 'status' });
  const err = h('p', { class: 'form-error', role: 'alert' });
  const words = () => tool?.pricing?.actions.find((a) => a.name === 'worksheet')?.text ?? '';
  const input = () => ({ ...compareInput(), worksheet: true });
  button.addEventListener('click', async () => {
    err.textContent = '';
    button.disabled = true;
    try {
      const json = await T.run(SLUG, input());
      const r = json.result;
      const charged = json.charged?.amount ? ` Charged ${json.charged.display}.` : '';
      const file = h('a', { href: URL.createObjectURL(new Blob([r.csv], { type: 'text/csv' })), download: 'inbound-placement-worksheet.csv' }, 'inbound-placement-worksheet.csv');
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
      if (!signedIn) { price.textContent = `${words()}. Sign in to get it.`; return; }
      try {
        const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input() })).quote;
        price.textContent = q.amount ? `This worksheet costs ${q.display} from your balance (${words()}).` : `This worksheet is free for you now (${words()}).`;
      } catch {
        price.textContent = words();
      }
    }, 300),
  };
}

// ---------- modes and the address ----------

function setMode(m) {
  mode = m;
  for (const b of document.querySelectorAll('.ip-tab')) b.setAttribute('aria-pressed', String(b.dataset.mode === m));
  for (const f of document.querySelectorAll('#ip-form fieldset')) f.hidden = f.dataset.for !== m;
  recompute();
}

// The partial-split fields only matter for Bulky items.
function showBulky() {
  const bulky = /bulky/.test($('ip-tier').value) || /bulky/.test($('ip-items').value) || !!val('ip-l');
  for (const el of document.querySelectorAll('[data-bulky]')) el.hidden = !bulky;
}

function prefill() {
  const q = new URLSearchParams(location.search);
  const set = (id, key) => { if (q.has(key)) $(id).value = q.get(key); };
  const pairs = [['ip-units', 'units'], ['ip-tier', 'tier'], ['ip-weight', 'weight'], ['ip-wu', 'wu'], ['ip-l', 'l'], ['ip-w', 'w'], ['ip-h', 'h'], ['ip-uw', 'uw'],
    ['ip-min', 'min'], ['ip-minfee', 'minfee'], ['ip-par', 'par'], ['ip-parfee', 'parfee'], ['ip-opt', 'opt'], ['ip-date', 'date'], ['ip-recv', 'recv'], ['ip-region', 'region'], ['ip-credits', 'credits'],
    ['ip-upc', 'upc'], ['ip-cf', 'cf'], ['ip-months', 'months'], ['ip-aregion', 'aregion'], ['ip-arate', 'arate'], ['ip-adate', 'adate'], ['ip-afee', 'afee'], ['ip-eunit', 'eunit']];
  for (const [id, key] of pairs) set(id, key);
  // Several lines travel as one parameter, lines split by "|".
  if (q.has('items')) $('ip-items').value = q.get('items').split('|').join('\n');
  if (q.has('cartons')) $('ip-cartons').value = q.get('cartons').split('|').join('\n');
  if (q.has('ecartons')) $('ip-ecartons').value = q.get('ecartons').split('|').join('\n');
  // An option left out of the address is not compared (the page's defaults are the worked example).
  if (q.has('units') && !q.has('min')) $('ip-min').value = '';
  if (q.has('units') && !q.has('opt')) $('ip-opt').value = '';
  if (['minfee', 'par', 'parfee'].some((k) => q.has(k))) $('ip-fee-box').open = true;
  if (['l', 'w', 'h'].some((k) => q.has(k))) $('ip-dims-box').open = true;
  if (q.has('items')) $('ip-items-box').open = true;
  if (['date', 'recv', 'region', 'credits', 'cartons'].some((k) => q.has(k))) $('ip-plan-box').open = true;
  const m = q.get('mode');
  return MODES.includes(m) ? m : 'compare';
}

async function main() {
  try { tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool; } catch { tool = null; }
  try { signedIn = !!(await T.me()); } catch { signedIn = false; }
  const start = prefill();
  showBulky();
  buy = buyBox($('ip-buy'));
  for (const b of document.querySelectorAll('.ip-tab')) b.addEventListener('click', () => setMode(b.dataset.mode));
  atExample = !location.search;
  $('ip-form').addEventListener('input', () => { atExample = false; showBulky(); later(); });
  $('ip-form').addEventListener('change', () => { atExample = false; showBulky(); later(); });
  // The button compares again and, on a phone, brings the answer into view under the form.
  $('ip-form').addEventListener('submit', (e) => {
    e.preventDefault();
    recompute();
    if (matchMedia('(max-width: 999px)').matches) $('ip-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  T.mountCodePanel($('ip-code'), SLUG);
  setMode(start);
}

main();
