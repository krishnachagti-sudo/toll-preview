// The recipe cost page. core.js (the same file the server runs) parses the pasted price list and
// recipes, previews the menu as you type, and works out the quick calculators in the browser. The
// unit factors and household weights come from the tool's published reference example, so the page
// and the server read the same dated data. The full menu report and the workbook come from the
// server through Endwise.run.
import {
  makeEngine, CostError, priceListFromCsv, recipesFromCsv, menuPrice, foodCost, pour, bake, catering, yieldCost, actual, parseCsv,
  money, cents, pct, csvField, SAMPLE_PLATE, SAMPLE_CATERING, cateringText,
} from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'recipe-cost-calculator';
const $ = (id) => document.getElementById(id);

let tool = null;
let engine = null;
let units = null;
let household = null;
let signedIn = false;

// ---------- the sample, as the CSV a spreadsheet would paste ----------

const csv = (rows) => rows.map((r) => r.map(csvField).join(',')).join('\n');
function priceCsv(ingredients) {
  const extra = ingredients.some((i) => i.yieldPct !== undefined);
  const prev = ingredients.some((i) => i.previousPackPrice !== undefined);
  const usda = ingredients.some((i) => i.usda !== undefined);
  const head = ['ingredient', 'pack size', 'pack unit', 'pack price', ...(extra ? ['yield %'] : []), ...(prev ? ['previous price'] : []), ...(usda ? ['usda'] : [])];
  return csv([head, ...ingredients.map((i) => [i.name, i.packSize, i.packUnit, i.packPrice.toFixed(2), ...(extra ? [i.yieldPct ?? ''] : []), ...(prev ? [i.previousPackPrice?.toFixed(2) ?? ''] : []), ...(usda ? [i.usda ?? ''] : [])])]);
}
function recipeCsv(recipes) {
  const rows = [['recipe', 'portions', 'menu price', 'makes', 'extra per portion', 'ingredient', 'qty', 'unit']];
  for (const r of recipes) {
    r.lines.forEach((l, i) => rows.push(i === 0
      ? [r.name, r.portions ?? 1, r.menuPrice ?? '', r.makes ? `${r.makes.qty} ${r.makes.unit}` : '', r.extraPerPortion ?? '', l.item, l.qty, l.unit]
      : ['', '', '', '', '', l.item, l.qty, l.unit]));
  }
  return csv(rows);
}

const PLATE = SAMPLE_PLATE;

// The catering card starts from the shared sample unless the address fills it.
function fillCatering() {
  const f = $('calc-catering');
  if (!new URLSearchParams(location.search).has('items')) f.elements.items.value = cateringText(SAMPLE_CATERING.items);
}

// ---------- the menu form ----------

function readNumber(id, label, { min = 0, max = Infinity, open = false } = {}) {
  const v = Number($(id).value.trim());
  if ($(id).value.trim() === '' || !Number.isFinite(v) || (open ? v <= min : v < min) || v > max) throw new CostError(`${label} must be a number${open ? ` above ${min}` : ''}${max < Infinity ? ` up to ${max}` : ''}.`);
  return v;
}
function menuInput() {
  return {
    ingredients: priceListFromCsv($('rc-prices').value),
    recipes: recipesFromCsv($('rc-recipes').value),
    targetPct: readNumber('rc-target', 'Target food cost %', { open: true, max: 100 }),
    ending: $('rc-ending').value,
    driftPoints: readNumber('rc-drift', 'The drift threshold', { max: 100 }),
  };
}

function preview() {
  const err = $('rc-err');
  const out = $('rc-preview');
  err.textContent = '';
  out.textContent = '';
  if (!engine) return null;
  try {
    const input = menuInput();
    const r = engine.recost(input);
    if (input.recipes.length === 1) {
      renderReport(r, 'Your plate (free for one recipe)');
      out.textContent = '';
    } else {
      out.textContent = `Preview: ${r.answer} Re-cost the menu for every recipe's numbers, the repricing list and the CSV.`;
    }
    quote();
    return input;
  } catch (e) {
    if (!(e instanceof CostError)) throw e;
    err.textContent = e.message;
    return null;
  }
}

// ---------- the report ----------

function table(columns, rows, cls = '') {
  return h('div', { class: 'table-scroll' }, [h('table', { class: `rules rc-table ${cls}` }, [
    h('thead', {}, [h('tr', {}, columns.map((c, i) => h('th', { scope: 'col', class: i ? 'r' : '' }, c)))]),
    h('tbody', {}, rows.map((r) => h('tr', { class: r.cls ?? '' }, r.cells.map((c, i) => (i ? h('td', { class: 'r' }, c) : h('th', { scope: 'row' }, c)))))),
  ])]);
}
const dash = '-';
function download(name, blob, text) {
  return h('a', { href: URL.createObjectURL(blob), download: name }, text ?? name);
}
function base64Blob(b64, type) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return new Blob([out], { type });
}

function renderReport(r, label) {
  const out = $('rc-out');
  out.textContent = '';
  // Like the other tool pages: the tag and source, the inputs in one line, the dishes over target as
  // the big figure, then one line per dish to reprice and per price that moved.
  const example = label === 'Worked example';
  const s = r.summary;
  const ins = `${r.changedIngredients.length ? `${r.changedIngredients.map((x) => x.name.split(',')[0].toLowerCase()).join(', ')} ${r.changedIngredients.every((x) => x.changePct > 0) ? 'went up' : 'changed'}; ` : ''}${s.recipes} recipes against a ${r.targetPct}% target`;
  out.append(
    h('div', { class: 'tf-rh' }, [h('span', { class: example ? 'tf-tag' : 'tf-tag run' }, example ? 'Example' : 'Your result'), h('span', { class: 'tf-src' }, label && !example ? label : 'your prices and recipes')]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${ins}` : ins),
    h('p', { class: 'tf-big' }, [h('b', {}, `${s.overTarget} of ${s.priced}`), h('span', {}, `priced dishes over your ${r.targetPct}% target`)]),
    h('p', { class: 'tf-sub' }, r.answer),
  );
  const item = (k, what, v, why, cls = null) => h('li', { class: cls }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), h('b', {}, v), h('em', {}, why)]);
  out.append(h('ul', { class: 'tf-items' }, [
    ...r.reprice.map((x) => item('%', x.name, pct(x.foodCostPct), `menu ${cents(x.menuPrice)}; ${cents(x.suggestedPrice)} meets the target`, 'sk')),
    ...r.changedIngredients.map((x) => item('$', x.name, x.changePct === null ? cents(x.packPrice) : `${x.changePct > 0 ? '+' : ''}${x.changePct}%`, `${cents(x.previousPackPrice)} to ${cents(x.packPrice)} a pack; in ${x.usedIn.join(', ') || 'nothing'}`)),
    s.averageFoodCostPct === null ? null : item('=', 'Average food cost', pct(s.averageFoodCostPct), `of ${s.priced} priced ${s.priced === 1 ? 'dish' : 'dishes'}`, 'tot'),
  ]));
  const more = h('div', { class: 'xp-in' });
  out.append(h('details', { class: 'xpand' }, [h('summary', {}, 'Every recipe, line by line'), more]));
  if (r.reprice.length) {
    more.append(h('h3', { class: 'rc-heading' }, `Over your ${r.targetPct}% target, worst first`));
    more.append(table(['Dish', 'Food cost', 'Menu price', 'Price at target', 'Rounded', 'Short by'], r.reprice.map((x) => ({ cells: [x.name, pct(x.foodCostPct), cents(x.menuPrice), cents(x.priceAtTarget), cents(x.suggestedPrice), cents(x.shortBy)] }))));
  }
  if (r.changedIngredients.length) {
    more.append(h('h3', { class: 'rc-heading' }, 'Prices that changed'));
    more.append(table(['Ingredient', 'Was', 'Now', 'Change', 'Used in'], r.changedIngredients.map((x) => ({ cells: [x.name, cents(x.previousPackPrice), cents(x.packPrice), x.changePct === null ? dash : `${x.changePct > 0 ? '+' : ''}${x.changePct}%`, x.usedIn.join(', ') || 'nothing'] }))));
  }
  more.append(h('h3', { class: 'rc-heading' }, 'Every recipe'));
  more.append(table(['Recipe', 'Per portion', 'Was', 'Menu price', 'Food cost', 'Moved', 'At target'], r.recipes.map((x) => ({
    cls: x.status === 'over target' ? 'rc-over' : '',
    cells: [x.name, money(x.portionCost), money(x.previousPortionCost), x.menuPrice === null ? dash : cents(x.menuPrice), x.foodCostPct === null ? dash : pct(x.foodCostPct), x.pointsMoved === null ? dash : `${x.pointsMoved > 0 ? '+' : ''}${x.pointsMoved}`, cents(x.priceAtTarget)],
  }))));
  for (const x of r.recipes) {
    const d = h('details', { class: 'rc-lines' }, [h('summary', {}, `${x.name}: ${money(x.batchCost)} a batch of ${x.portions}`)]);
    d.append(table(['Line', 'Qty', 'Cost', 'Share'], x.lines.map((l) => ({ cells: [l.item + (l.kind === 'recipe' ? ' (sub-recipe)' : ''), `${l.qty} ${l.unit}`, money(l.cost), `${l.sharePct}%`] }))));
    more.append(d);
  }
  if (r.unusedIngredients?.length) out.append(h('p', { class: 'tf-note' }, `On the price list but in no recipe: ${r.unusedIngredients.join(', ')}.`));
  if (r.csv) out.append(h('p', { class: 'tf-note' }, ['Download: ', download('recipe-costs.csv', new Blob([r.csv], { type: 'text/csv' }))]));
}

// ---------- paid runs ----------

const words = (name) => {
  const text = tool?.pricing?.actions.find((a) => a.name === name)?.text;
  return text ? T.money(text) : '';
};
function errorInto(box, e) {
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}
const charged = (json) => (json.charged ? (json.charged.amount ? ` Charged ${json.charged.display}.` : ' Free this time.') : '');

let quoteTimer = null;
function quote() {
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(async () => {
    const box = $('rc-quote');
    if (!signedIn) { box.textContent = `${words('recost')}. Without an account you get 5 free runs a day.`; return; }
    try {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: { op: 'recost', ...menuInput() } })).quote;
      box.textContent = q.amount ? `This re-cost costs ${q.display} from your balance (${words('recost')}).` : `This re-cost is free for you now (${words('recost')}).`;
    } catch {
      box.textContent = words('recost');
    }
  }, 300);
}

async function runMenu(op, button) {
  const err = $('rc-err');
  err.textContent = '';
  let input;
  try { input = menuInput(); } catch (e) { if (!(e instanceof CostError)) throw e; err.textContent = e.message; return; }
  button.disabled = true;
  try {
    const json = await T.run(SLUG, { op, ...input });
    if (op === 'recost') {
      renderReport(json.result, null);
      $('rc-preview').textContent = `Done.${charged(json)}`;
    } else {
      const f = json.result.file;
      $('rc-preview').textContent = '';
      $('rc-preview').append('Your workbook: ', download(f.filename, base64Blob(f.base64, f.contentType)), `.${charged(json)}`);
    }
  } catch (e) {
    errorInto(err, e);
  } finally {
    button.disabled = false;
  }
}

async function template(e) {
  e.preventDefault();
  try {
    const json = await T.run(SLUG, { op: 'template' });
    const f = json.result.file;
    const link = download(f.filename, base64Blob(f.base64, f.contentType));
    document.body.append(link);
    link.click();
    link.remove();
  } catch (err) {
    errorInto($('rc-err'), err);
  }
}

// ---------- quick calculators ----------

const val = (form, name) => form.elements[name].value.trim();
const n = (form, name, label) => {
  const s = val(form, name).replace(/[$,%\s]/g, '');
  const v = Number(s);
  if (s === '' || !Number.isFinite(v)) throw new CostError(`${label} must be a number.`);
  return v;
};
const opt = (form, name, label) => (val(form, name) === '' ? undefined : n(form, name, label));

const CALCS = {
  'menu-price': (f) => menuPrice({ cost: n(f, 'cost', 'Plate cost'), targetPct: n(f, 'target', 'Target'), ending: val(f, 'ending') }).answer,
  'food-cost': (f) => foodCost({ cost: n(f, 'cost', 'Plate cost'), price: n(f, 'price', 'Menu price'), targetPct: opt(f, 'target', 'Target') }).answer,
  pour: (f) => pour({
    bottleSize: n(f, 'bottle', 'Bottle size'), bottleUnit: val(f, 'bunit'), bottlePrice: n(f, 'bprice', 'Bottle price'), pourSize: n(f, 'pour', 'Pour'), pourUnit: val(f, 'punit'),
    drinkPrice: opt(f, 'drink', 'Drink price'), lossPct: opt(f, 'loss', 'Loss %') ?? 0, extraCost: opt(f, 'extra', 'Mixer and garnish') ?? 0, targetPct: opt(f, 'target', 'Target'),
  }, units).answer,
  bake: (f) => bake({
    ingredientCost: n(f, 'ing', 'Ingredient cost'), pieces: n(f, 'pieces', 'Pieces'), laborHours: opt(f, 'hours', 'Labor hours') ?? 0, hourlyRate: opt(f, 'rate', 'Hourly rate') ?? 0,
    overheadPct: opt(f, 'ovh', 'Overhead %') ?? 0, packagingPerPiece: opt(f, 'pack', 'Packaging') ?? 0, marginPct: n(f, 'margin', 'Profit margin %'), ending: val(f, 'ending'),
  }).answer,
  catering: (f) => {
    const rows = parseCsv(f.elements.items.value);
    const items = rows.map((r, i) => {
      if (r.length < 3) throw new CostError(`Menu line ${i + 1} needs: item, cost per portion, portions per guest.`);
      return { name: r[0], costPerPortion: Number(r[1].replace(/[$,]/g, '')), portionsPerGuest: Number(r[2]) };
    });
    const r = catering({ guests: n(f, 'guests', 'Guests'), items, targetPct: n(f, 'target', 'Target'), extraPerGuest: opt(f, 'extra', 'Disposables') ?? 0 });
    return r.answer;
  },
  yield: (f) => yieldCost({ apQty: n(f, 'ap', 'As purchased'), epQty: n(f, 'ep', 'Usable weight'), apPrice: n(f, 'price', 'Price'), unit: 'lb' }).answer,
  actual: (f) => actual({ beginningInventory: n(f, 'begin', 'Opening inventory'), purchases: n(f, 'buy', 'Purchases'), endingInventory: n(f, 'end', 'Closing inventory'), foodSales: n(f, 'sales', 'Food sales'), idealPct: opt(f, 'ideal', 'Ideal %') }).answer,
  convert: (f) => engine.convert({ qty: n(f, 'qty', 'Amount'), from: val(f, 'from'), to: val(f, 'to'), usda: val(f, 'food') || undefined }).answer,
};

function calc(form) {
  const out = form.querySelector('[data-out]');
  try {
    if (!engine && (form.dataset.calc === 'pour' || form.dataset.calc === 'convert')) { out.textContent = 'Loading the unit tables.'; return; }
    out.textContent = CALCS[form.dataset.calc](form);
  } catch (e) {
    if (!(e instanceof CostError)) throw e;
    out.textContent = e.message;
  }
}

function fillUnits() {
  const from = $('cv-from');
  const to = $('cv-to');
  for (const [k, u] of Object.entries(units.units)) {
    from.append(h('option', { value: k }, `${k} (${u.name})`));
    to.append(h('option', { value: k }, `${k} (${u.name})`));
  }
  from.value = 'cup';
  to.value = 'g';
  for (const f of household.foods) $('cv-food').append(h('option', { value: f.key }, `${f.name} (USDA: ${f.usdaPortion} = ${f.grams} g)`));
  $('cv-food').value = 'flour-all-purpose';
}

// ---------- the address ----------

// ?calc=pour&bottle=750&bunit=ml&bprice=28&pour=1.5&punit=fl oz&drink=9&target=20 fills a quick
// calculator (its fields by name) and scrolls to it; ?sample=plate loads the one-plate sample;
// ?target=30&ending=.95 set the menu's target and price ending.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const calcName = q.get('calc');
  const form = calcName ? document.querySelector(`form[data-calc="${CSS.escape(calcName)}"]`) : null;
  if (form) {
    for (const [k, v] of q) {
      const el = form.elements[k];
      if (el && v.length <= 2000 && 'value' in el) {
        if (el.tagName === 'SELECT' && ![...el.options].some((o) => o.value === v)) continue;
        el.value = v;
      }
    }
  } else {
    if (q.has('target') && /^\d{1,3}(\.\d+)?$/.test(q.get('target'))) $('rc-target').value = q.get('target');
    if (q.has('ending') && [...$('rc-ending').options].some((o) => o.value === q.get('ending'))) $('rc-ending').value = q.get('ending');
  }
  return { form, sample: q.get('sample'), template: q.get('template') === '1' };
}

// ---------- start ----------

const soon = (fn, ms = 250) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('rc-code'), SLUG);
  fillCatering();
  const linked = fromQuery();
  for (const f of document.querySelectorAll('form[data-calc]')) {
    f.addEventListener('submit', (e) => e.preventDefault());
    f.addEventListener('input', soon(() => calc(f)));
    f.addEventListener('change', () => calc(f));
  }
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    tool = null;
  }
  const ref = tool?.examples.find((x) => x.input.op === 'reference')?.output;
  const menuEx = tool?.examples.find((x) => x.input.op === 'recost');
  if (ref) {
    units = ref.units;
    household = ref.household;
    engine = makeEngine({ units, household });
    fillUnits();
  }
  for (const f of document.querySelectorAll('form[data-calc]')) calc(f);
  if (linked.form) linked.form.scrollIntoView({ block: 'start' });
  if (linked.template) { $('rc-template').scrollIntoView({ block: 'center' }); $('rc-template').focus(); }

  const sample = linked.sample === 'plate' ? PLATE : menuEx?.input;
  if (sample) {
    $('rc-prices').value = priceCsv(sample.ingredients);
    $('rc-recipes').value = recipeCsv(sample.recipes);
    if (sample.targetPct && !new URLSearchParams(location.search).has('target')) $('rc-target').value = String(sample.targetPct);
  }
  if (linked.sample === 'plate' && engine) preview();
  else if (menuEx) renderReport(menuEx.output, 'Worked example');
  else $('rc-out').textContent = 'The worked example could not be loaded.';

  const form = $('rc-form');
  form.addEventListener('submit', (e) => e.preventDefault());
  form.addEventListener('input', soon(preview, 400));
  form.addEventListener('change', preview);
  $('rc-run').addEventListener('click', () => runMenu('recost', $('rc-run')));
  $('rc-xlsx').addEventListener('click', () => runMenu('workbook', $('rc-xlsx')));
  $('rc-template').addEventListener('click', template);
  try { signedIn = !!(await T.me()); } catch { signedIn = false; }
  $('rc-xlsx').title = words('workbook');
  quote();
}

start();
