// The recipe cost engine: one ingredient price list (pack size, pack price, yield %) costs every
// recipe and sub-recipe, gives the cost per portion, the food cost % against the menu price and the
// price that meets a target food cost, and, when the list carries last time's prices, how far each
// dish moved. Also the single calculations its pages answer: menu price from a target, food cost %,
// pour cost, cake and bakery pricing, catering per guest, yield and edible portion cost, unit
// conversion and actual against ideal food cost.
//
// Pure and dependency-free: the page loads this same file. Units come in as data (NIST Handbook 44,
// Appendix C) and so do household weights (USDA FoodData Central), through makeEngine(). Money is
// worked in dollars at full precision and rounded only for output: costs to 4 decimals (a pinch of
// saffron costs fractions of a cent), prices to cents, percentages to 1 decimal.

export class CostError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'CostError';
    this.field = field;
  }
}

export const LIMITS = { ingredients: 2000, recipes: 500, lines: 120, depth: 12, csvChars: 150_000 };
export const ENDINGS = ['cent', 'quarter', 'half', 'whole', '.95', '.99'];

// Written forms people use for each unit. Single letters "t" and "T" are left out on purpose:
// they mean teaspoon or tablespoon depending on who wrote the recipe.
const ALIASES = {
  g: ['g', 'gr', 'gram', 'grams', 'gm', 'gms'],
  kg: ['kg', 'kgs', 'kilo', 'kilos', 'kilogram', 'kilograms'],
  oz: ['oz', 'ozs', 'ounce', 'ounces', 'oz wt', 'wt oz', 'net wt oz'],
  lb: ['lb', 'lbs', 'pound', 'pounds', '#'],
  ml: ['ml', 'milliliter', 'milliliters', 'millilitre', 'millilitres', 'cc'],
  l: ['l', 'liter', 'liters', 'litre', 'litres', 'ltr'],
  tsp: ['tsp', 'tsps', 'teaspoon', 'teaspoons', 'tspn'],
  tbsp: ['tbsp', 'tbsps', 'tbs', 'tbl', 'tablespoon', 'tablespoons'],
  'fl oz': ['fl oz', 'floz', 'fl. oz', 'fluid ounce', 'fluid ounces', 'fl ozs'],
  cup: ['cup', 'cups', 'c'],
  pt: ['pt', 'pts', 'pint', 'pints'],
  qt: ['qt', 'qts', 'quart', 'quarts'],
  gal: ['gal', 'gals', 'gallon', 'gallons'],
  each: ['each', 'ea', 'pc', 'pcs', 'piece', 'pieces', 'unit', 'units', 'whole', 'item', 'items', 'egg', 'eggs', 'ct', 'count'],
  dozen: ['dozen', 'doz', 'dz'],
};
const RECIPE_UNITS = { portion: ['portion', 'portions', 'serving', 'servings', 'pc portion'], batch: ['batch', 'batches', 'recipe', 'recipes'] };
const ALIAS_OF = new Map();
for (const [k, list] of Object.entries({ ...ALIASES, ...RECIPE_UNITS })) for (const a of list) ALIAS_OF.set(a, k);

export function unitKey(s) {
  if (typeof s !== 'string') return null;
  const t = s.trim().toLowerCase().replace(/\.$/, '').replace(/\s+/g, ' ');
  return ALIAS_OF.get(t) ?? ALIAS_OF.get(t.replace(/\./g, '')) ?? null;
}

// ---------- numbers and words ----------

const r4 = (x) => Math.round(x * 10000) / 10000;
const r2 = (x) => Math.round(x * 100) / 100;
const r1 = (x) => Math.round(x * 10) / 10;
// Whole cents, up: a price rounded down would land above the target food cost.
const centsUp = (x) => Math.ceil(Math.round(x * 1e6) / 1e4 - 1e-9);
export const money = (x) => {
  const neg = x < 0;
  const v = Math.abs(x);
  const s = v >= 0.0995 || v === 0 ? v.toFixed(2) : v.toFixed(4).replace(/0+$/, '');
  const [i, d] = s.split('.');
  return `${neg ? '-' : ''}$${i.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${d ? `.${d}` : ''}`;
};
export const cents = (x) => `${x < 0 ? '-' : ''}$${Math.abs(r2(x)).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
export const pct = (x) => `${r1(x).toFixed(1)}%`;
const num = (x) => String(r4(x));

// A menu price that meets the target: the exact price, then rounded UP to the chosen ending.
export function roundPrice(price, ending = 'cent') {
  if (!ENDINGS.includes(ending)) throw new CostError(`Price ending must be one of ${ENDINGS.join(', ')}.`, 'ending');
  const c = centsUp(price);
  if (ending === 'cent') return c / 100;
  if (ending === 'quarter') return Math.ceil(c / 25) * 25 / 100;
  if (ending === 'half') return Math.ceil(c / 50) * 50 / 100;
  if (ending === 'whole') return Math.ceil(c / 100);
  const tail = ending === '.95' ? 95 : 99;
  let d = Math.floor(c / 100) * 100 + tail;
  if (d < c) d += 100;
  return d / 100;
}

const positive = (v, field, label) => {
  if (typeof v !== 'number' || !Number.isFinite(v) || v <= 0) throw new CostError(`${label} must be a number above 0.`, field);
  return v;
};
const nonNegative = (v, field, label) => {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) throw new CostError(`${label} must be 0 or more.`, field);
  return v;
};
const percent = (v, field, label, { min = 0, max = 100, open = true } = {}) => {
  if (typeof v !== 'number' || !Number.isFinite(v) || (open ? v <= min : v < min) || v > max) throw new CostError(`${label} must be above ${min} and at most ${max}.`, field);
  return v;
};
const nameKey = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ');

// ---------- the engine ----------

export function makeEngine({ units, household }) {
  const U = units.units;
  const FOODS = new Map(household.foods.map((f) => [f.key, f]));

  const dim = (u) => U[u]?.dimension ?? null;
  const toBase = (qty, u) => qty * U[u].base;

  // Grams per milliliter, or per piece, from the ingredient's own numbers or a USDA household weight.
  function densities(ing, field) {
    let perMl = null;
    let each = null;
    if (ing.gramsPerCup !== undefined) perMl = positive(ing.gramsPerCup, field, 'Grams per cup') / U.cup.base;
    if (ing.gramsEach !== undefined) each = positive(ing.gramsEach, field, 'Grams each');
    if (ing.usda !== undefined) {
      const f = FOODS.get(ing.usda);
      if (!f) throw new CostError(`USDA weight "${ing.usda}" is not one the tool holds. Use one of: ${[...FOODS.keys()].join(', ')}.`, field);
      const [n, u] = [Number(f.measure.split(' ')[0]), f.measure.split(' ').slice(1).join(' ')];
      if (dim(u) === 'volume' && perMl === null) perMl = f.grams / toBase(n, u);
      if (dim(u) === 'count' && each === null) each = f.grams / n;
    }
    return { perMl, each };
  }

  // qty of unit u expressed in the dimension `to`, via grams where the dimensions differ.
  function convertQty(qty, u, to, dens, what, field) {
    const from = dim(u);
    if (from === to) return toBase(qty, u);
    let grams;
    if (from === 'mass') grams = toBase(qty, u);
    else if (from === 'volume') {
      if (dens.perMl === null) throw new CostError(`${what}: ${u} is a volume and the price is by ${to === 'count' ? 'the piece' : 'weight'}. Give grams per cup for it (or a USDA weight), or use a ${to === 'count' ? 'count' : 'weight'} unit.`, field);
      grams = toBase(qty, u) * dens.perMl;
    } else {
      if (dens.each === null) throw new CostError(`${what}: ${u} is a count and the price is by ${to}. Give grams each for it, or use a ${to} unit.`, field);
      grams = toBase(qty, u) * dens.each;
    }
    if (to === 'mass') return grams;
    if (to === 'volume') {
      if (dens.perMl === null) throw new CostError(`${what}: the price is by volume and the recipe uses a ${from}. Give grams per cup for it (or a USDA weight).`, field);
      return grams / dens.perMl;
    }
    if (dens.each === null) throw new CostError(`${what}: the price is per piece and the recipe uses a ${from}. Give grams each for it.`, field);
    return grams / dens.each;
  }

  function convert({ qty, from, to, gramsPerCup, gramsEach, usda }) {
    const a = unitKey(from);
    const b = unitKey(to);
    if (!a || !U[a]) throw new CostError(`"${from}" is not a unit the tool knows.`, 'from');
    if (!b || !U[b]) throw new CostError(`"${to}" is not a unit the tool knows.`, 'to');
    nonNegative(qty, 'qty', 'Quantity');
    const dens = densities({ gramsPerCup, gramsEach, usda }, 'from');
    const base = convertQty(qty, a, dim(b), dens, 'Conversion', 'from');
    const value = base / U[b].base;
    const via = dim(a) === dim(b) ? 'NIST Handbook 44, exact' : `NIST Handbook 44 and ${usda ? `USDA FoodData Central: ${FOODS.get(usda).name}, ${FOODS.get(usda).usdaPortion} = ${FOODS.get(usda).grams} g` : 'your weight'}`;
    return { qty, from: a, to: b, value: Number(value.toPrecision(12)), rounded: r4(value), via, answer: `${num(qty)} ${a} = ${num(value)} ${b} (${via}).` };
  }

  // ---------- the price list ----------

  function priceList(ingredients, { previous = false } = {}) {
    if (!Array.isArray(ingredients) || ingredients.length === 0) throw new CostError('Add at least one ingredient with a pack size, unit and price.', 'ingredients');
    if (ingredients.length > LIMITS.ingredients) throw new CostError(`At most ${LIMITS.ingredients} ingredients.`, 'ingredients');
    const map = new Map();
    ingredients.forEach((ing, i) => {
      const field = `ingredients.${i}`;
      const name = String(ing.name ?? '').trim();
      if (!name) throw new CostError(`Ingredient ${i + 1} has no name.`, field);
      const k = nameKey(name);
      if (map.has(k)) throw new CostError(`"${name}" is on the price list twice.`, field);
      const u = unitKey(ing.packUnit);
      if (!u || !U[u]) throw new CostError(`${name}: pack unit "${ing.packUnit}" is not one of g, kg, oz, lb, ml, l, tsp, tbsp, fl oz, cup, pt, qt, gal, each, dozen.`, field);
      positive(ing.packSize, field, `${name}: pack size`);
      nonNegative(ing.packPrice, field, `${name}: pack price`);
      const yieldPct = ing.yieldPct === undefined ? 100 : percent(ing.yieldPct, field, `${name}: yield %`);
      if (ing.previousPackPrice !== undefined) nonNegative(ing.previousPackPrice, field, `${name}: previous price`);
      const base = toBase(ing.packSize, u);
      const unitCost = (price) => price / base / (yieldPct / 100);
      map.set(k, {
        name, unit: u, dimension: dim(u), packSize: ing.packSize, packPrice: ing.packPrice, yieldPct,
        previousPackPrice: ing.previousPackPrice ?? null,
        epCost: unitCost(ing.packPrice),
        epCostBefore: unitCost(previous && ing.previousPackPrice !== undefined ? ing.previousPackPrice : ing.packPrice),
        dens: densities(ing, field),
        usedIn: new Set(),
      });
    });
    return map;
  }

  // ---------- recipes ----------

  function cookbook(ingredients, recipes) {
    const prices = priceList(ingredients, { previous: true });
    if (!Array.isArray(recipes) || recipes.length === 0) throw new CostError('Add at least one recipe.', 'recipes');
    if (recipes.length > LIMITS.recipes) throw new CostError(`At most ${LIMITS.recipes} recipes in one run.`, 'recipes');
    const book = new Map();
    recipes.forEach((r, i) => {
      const field = `recipes.${i}`;
      const name = String(r.name ?? '').trim();
      if (!name) throw new CostError(`Recipe ${i + 1} has no name.`, field);
      const k = nameKey(name);
      if (book.has(k)) throw new CostError(`Two recipes are called "${name}".`, field);
      if (prices.has(k)) throw new CostError(`"${name}" is both a recipe and an ingredient. Rename one of them.`, field);
      positive(r.portions ?? 1, field, `${name}: portions`);
      if (!Array.isArray(r.lines) || r.lines.length === 0) throw new CostError(`${name} has no ingredient lines.`, field);
      if (r.lines.length > LIMITS.lines) throw new CostError(`${name}: at most ${LIMITS.lines} lines.`, field);
      if (r.menuPrice !== undefined && r.menuPrice !== null) positive(r.menuPrice, field, `${name}: menu price`);
      if (r.extraPerPortion !== undefined) nonNegative(r.extraPerPortion, field, `${name}: extra cost per portion`);
      let makes = null;
      if (r.makes) {
        const mu = unitKey(r.makes.unit);
        if (!mu || !U[mu] || dim(mu) === 'count') throw new CostError(`${name}: "makes" needs a weight or volume unit, like 2 qt or 1.5 kg.`, field);
        makes = { qty: positive(r.makes.qty, field, `${name}: makes`), unit: mu, base: toBase(r.makes.qty, mu), dimension: dim(mu) };
      }
      book.set(k, { ...r, name, field, portions: r.portions ?? 1, makes, index: i });
    });

    const done = new Map();
    function cost(k, stack) {
      if (done.has(k)) return done.get(k);
      const r = book.get(k);
      if (stack.includes(k)) {
        const loop = [...stack.slice(stack.indexOf(k)), k].map((x) => book.get(x).name).join(' -> ');
        throw new CostError(`Sub-recipes go round in a circle: ${loop}.`, r.field);
      }
      if (stack.length >= LIMITS.depth) throw new CostError(`Sub-recipes nest more than ${LIMITS.depth} deep at ${r.name}.`, r.field);
      const lines = r.lines.map((line, j) => {
        const field = `${r.field}.lines.${j}`;
        const item = String(line.item ?? '').trim();
        const ik = nameKey(item);
        positive(line.qty, field, `${r.name}, line ${j + 1}: quantity`);
        const u = unitKey(line.unit);
        if (!u) throw new CostError(`${r.name}: "${line.unit}" for ${item || `line ${j + 1}`} is not a unit the tool knows.`, field);
        if (prices.has(ik)) {
          const p = prices.get(ik);
          if (!U[u]) throw new CostError(`${r.name}: ${item} is an ingredient; "${u}" is for sub-recipes.`, field);
          p.usedIn.add(r.name);
          const qtyBase = convertQty(line.qty, u, p.dimension, p.dens, `${r.name}, ${item}`, field);
          return { item: p.name, kind: 'ingredient', qty: line.qty, unit: u, inPackUnits: qtyBase / U[p.unit].base, packUnit: p.unit, epUnitCost: p.epCost * U[p.unit].base, cost: qtyBase * p.epCost, costBefore: qtyBase * p.epCostBefore };
        }
        if (book.has(ik)) {
          const sub = cost(ik, [...stack, k]);
          const s = book.get(ik);
          let portions;
          if (u === 'portion') portions = line.qty;
          else if (u === 'batch') portions = line.qty * s.portions;
          else {
            if (!s.makes) throw new CostError(`${r.name} uses ${s.name} by ${u}; say what one batch of ${s.name} makes (for example 2 qt), or use it by the portion.`, field);
            if (dim(u) !== s.makes.dimension) throw new CostError(`${r.name} uses ${s.name} by ${dim(u)} but a batch is measured by ${s.makes.dimension}.`, field);
            portions = toBase(line.qty, u) / s.makes.base * s.portions;
          }
          sub.usedIn.add(r.name);
          return { item: s.name, kind: 'recipe', qty: line.qty, unit: u, portions, cost: portions * sub.portionCost, costBefore: portions * sub.portionCostBefore };
        }
        throw new CostError(`${r.name}: "${item}" is not on the price list or a recipe.`, field);
      });
      const extra = (r.extraPerPortion ?? 0) * r.portions;
      const batch = lines.reduce((s, l) => s + l.cost, 0) + extra;
      const before = lines.reduce((s, l) => s + l.costBefore, 0) + extra;
      const out = { name: r.name, portions: r.portions, lines, extra, batchCost: batch, portionCost: batch / r.portions, portionCostBefore: before / r.portions, usedIn: new Set(), recipe: r };
      done.set(k, out);
      return out;
    }
    for (const k of book.keys()) cost(k, []);
    return { prices, book, costed: done };
  }

  function recipeReport(c, targetPct, ending) {
    const r = c.recipe;
    const target = targetPct / 100;
    const price = r.menuPrice ?? null;
    const priceAtTarget = c.portionCost / target;
    const suggested = roundPrice(priceAtTarget, ending);
    const foodCostPct = price ? c.portionCost / price * 100 : null;
    const before = price ? c.portionCostBefore / price * 100 : null;
    const moved = c.portionCost - c.portionCostBefore;
    return {
      name: c.name,
      portions: c.portions,
      batchCost: r4(c.batchCost),
      portionCost: r4(c.portionCost),
      menuPrice: price,
      foodCostPct: foodCostPct === null ? null : r1(foodCostPct),
      priceAtTarget: r2(priceAtTarget),
      suggestedPrice: suggested,
      status: price === null ? 'no menu price' : foodCostPct > targetPct + 1e-9 ? 'over target' : 'on target',
      shortBy: price === null ? null : r2(Math.max(0, priceAtTarget - price)),
      previousPortionCost: r4(c.portionCostBefore),
      costChange: r4(moved),
      costChangePct: c.portionCostBefore > 0 ? r1(moved / c.portionCostBefore * 100) : null,
      pointsMoved: price === null ? null : r1(foodCostPct - before),
      usedIn: [...c.usedIn].sort(),
      lines: c.lines.map((l) => ({
        item: l.item, kind: l.kind, qty: l.qty, unit: l.unit,
        ...(l.kind === 'ingredient' ? { packUnit: l.packUnit, inPackUnits: r4(l.inPackUnits), epCostPerPackUnit: r4(l.epUnitCost) } : { portions: r4(l.portions) }),
        cost: r4(l.cost), sharePct: c.batchCost > 0 ? r1(l.cost / c.batchCost * 100) : 0,
      })),
      ...(c.extra ? { extraPerPortion: r4(c.extra / c.portions) } : {}),
    };
  }

  // The whole menu: every recipe costed from one list, against one target.
  function recost({ ingredients, recipes, targetPct = 30, ending = 'cent', driftPoints = 1 }) {
    percent(targetPct, 'targetPct', 'Target food cost %');
    nonNegative(driftPoints, 'driftPoints', 'Drift threshold');
    const { prices, costed } = cookbook(ingredients, recipes);
    const rows = [...costed.values()].sort((a, b) => a.recipe.index - b.recipe.index).map((c) => recipeReport(c, targetPct, ending));
    const priced = rows.filter((r) => r.menuPrice !== null);
    const over = priced.filter((r) => r.status === 'over target').sort((a, b) => b.foodCostPct - a.foodCostPct || a.name.localeCompare(b.name));
    const hasPrevious = [...prices.values()].some((p) => p.previousPackPrice !== null && p.previousPackPrice !== p.packPrice);
    const moved = hasPrevious ? priced.filter((r) => Math.abs(r.pointsMoved) > driftPoints).sort((a, b) => b.pointsMoved - a.pointsMoved || a.name.localeCompare(b.name)) : [];
    const changedIngredients = [...prices.values()].filter((p) => p.previousPackPrice !== null && p.previousPackPrice !== p.packPrice).map((p) => ({
      name: p.name, previousPackPrice: p.previousPackPrice, packPrice: p.packPrice,
      changePct: p.previousPackPrice > 0 ? r1((p.packPrice - p.previousPackPrice) / p.previousPackPrice * 100) : null,
      usedIn: [...p.usedIn].sort(),
    }));
    const unused = [...prices.values()].filter((p) => p.usedIn.size === 0).map((p) => p.name);
    const avg = priced.length ? r1(priced.reduce((s, r) => s + r.foodCostPct, 0) / priced.length) : null;
    const lead = over[0] ?? priced[0] ?? rows[0];
    let answer = lead.menuPrice !== null
      ? `At today's prices ${lead.name} costs ${money(lead.portionCost)} per portion (${pct(lead.foodCostPct)} of its ${cents(lead.menuPrice)} menu price); `
      : `At today's prices ${lead.name} costs ${money(lead.portionCost)} per portion; `;
    answer += `${over.length} of ${priced.length} priced recipe${priced.length === 1 ? '' : 's'} miss${over.length === 1 ? 'es' : ''} your ${num(targetPct)}% target`;
    answer += hasPrevious ? `, and ${moved.length} moved more than ${num(driftPoints)} point${driftPoints === 1 ? '' : 's'} since your last price update.` : '.';
    return {
      answer,
      targetPct, ending, driftPoints,
      summary: { recipes: rows.length, priced: priced.length, overTarget: over.length, averageFoodCostPct: avg, movedMoreThanThreshold: hasPrevious ? moved.length : null },
      reprice: over.map((r) => ({ name: r.name, foodCostPct: r.foodCostPct, menuPrice: r.menuPrice, priceAtTarget: r.priceAtTarget, suggestedPrice: r.suggestedPrice, shortBy: r.shortBy })),
      drift: moved.map((r) => ({ name: r.name, previousPortionCost: r.previousPortionCost, portionCost: r.portionCost, pointsMoved: r.pointsMoved })),
      changedIngredients,
      unusedIngredients: unused,
      recipes: rows,
      csv: reportCsv(rows),
    };
  }

  // One recipe (and any sub-recipes it uses): the plate cost calculator.
  function costOne({ ingredients, recipes, recipe, targetPct = 30, ending = 'cent' }) {
    const all = recipes ?? [];
    const list = recipe ? [...all, recipe] : all;
    const r = recost({ ingredients, recipes: list, targetPct, ending });
    const main = r.recipes[r.recipes.length - 1];
    const answer = main.menuPrice !== null
      ? `${main.name} costs ${money(main.portionCost)} per portion (${money(main.batchCost)} for ${num(main.portions)}), ${pct(main.foodCostPct)} of its ${cents(main.menuPrice)} menu price; at a ${num(targetPct)}% target it sells for ${cents(main.priceAtTarget)}.`
      : `${main.name} costs ${money(main.portionCost)} per portion (${money(main.batchCost)} for ${num(main.portions)}); at a ${num(targetPct)}% food cost target it sells for ${cents(main.priceAtTarget)}, rounded to ${cents(main.suggestedPrice)}.`;
    return { answer, recipe: main, subRecipes: r.recipes.slice(0, -1), targetPct };
  }

  return { convert, recost, costOne, priceList, cookbook, FOODS, U, dim, toBase, densities, convertQty };
}

// ---------- single calculations (no units data needed except pour) ----------

export function menuPrice({ cost, targetPct, ending = 'cent' }) {
  nonNegative(cost, 'cost', 'Plate cost');
  percent(targetPct, 'targetPct', 'Target food cost %');
  const exact = cost / (targetPct / 100);
  const price = roundPrice(exact, ending);
  const at = price > 0 ? cost / price * 100 : 0;
  return {
    cost, targetPct, ending, exactPrice: r4(exact), price, foodCostPctAtPrice: r1(at), grossProfit: r2(price - cost),
    answer: `A plate that costs ${money(cost)} at a ${num(targetPct)}% food cost target sells for ${cents(exact)} (cost / ${num(targetPct / 100)})${ending === 'cent' ? '' : `, rounded up to ${cents(price)}`}, leaving ${cents(price - cost)} per plate before labor and overhead.`,
  };
}

export function foodCost({ cost, price, targetPct }) {
  nonNegative(cost, 'cost', 'Plate cost');
  positive(price, 'price', 'Menu price');
  const p = cost / price * 100;
  const out = { cost, price, foodCostPct: r1(p), grossProfit: r2(price - cost), grossMarginPct: r1(100 - p) };
  let answer = `Food cost % = cost / price x 100: ${money(cost)} / ${cents(price)} = ${pct(p)}, leaving ${cents(price - cost)} (${pct(100 - p)}) per plate.`;
  if (targetPct !== undefined) {
    percent(targetPct, 'targetPct', 'Target food cost %');
    out.targetPct = targetPct;
    out.priceAtTarget = r2(cost / (targetPct / 100));
    answer += ` At ${num(targetPct)}% it would sell for ${cents(cost / (targetPct / 100))}.`;
  }
  return { ...out, answer };
}

// Pour cost: the bottle's cost per fluid ounce times the pour, against the drink price.
export function pour({ bottleSize, bottleUnit = 'ml', bottlePrice, pourSize, pourUnit = 'fl oz', drinkPrice, lossPct = 0, extraCost = 0, targetPct, ending = 'cent' }, units) {
  const U = units.units;
  const bu = unitKey(bottleUnit);
  const pu = unitKey(pourUnit);
  if (!bu || U[bu]?.dimension !== 'volume') throw new CostError('Bottle size needs a volume unit (ml, l, fl oz, qt, gal).', 'bottleUnit');
  if (!pu || U[pu]?.dimension !== 'volume') throw new CostError('Pour size needs a volume unit (fl oz or ml).', 'pourUnit');
  positive(bottleSize, 'bottleSize', 'Bottle size');
  nonNegative(bottlePrice, 'bottlePrice', 'Bottle price');
  positive(pourSize, 'pourSize', 'Pour size');
  nonNegative(extraCost, 'extraCost', 'Mixer and garnish cost');
  if (typeof lossPct !== 'number' || lossPct < 0 || lossPct >= 100) throw new CostError('Loss % must be at least 0 and under 100.', 'lossPct');
  const bottleMl = bottleSize * U[bu].base;
  const pourMl = pourSize * U[pu].base;
  if (pourMl > bottleMl) throw new CostError('The pour is larger than the bottle.', 'pourSize');
  const usable = bottleMl * (1 - lossPct / 100);
  const pours = usable / pourMl;
  const cost = bottlePrice / pours + extraCost;
  const out = {
    bottleMl: r4(bottleMl), bottleFlOz: r4(bottleMl / U['fl oz'].base), pourMl: r4(pourMl), poursPerBottle: r1(pours), wholePours: Math.floor(pours + 1e-9),
    costPerPour: r4(cost), costPerFlOz: r4(bottlePrice / (usable / U['fl oz'].base)),
  };
  let answer = `A ${num(pourSize)} ${pu} pour from a ${num(bottleSize)} ${bu} bottle at ${cents(bottlePrice)} costs ${money(cost)} (${r1(pours)} pours a bottle${lossPct ? ` after ${num(lossPct)}% loss` : ''}${extraCost ? `, plus ${money(extraCost)} mixer and garnish` : ''})`;
  if (drinkPrice !== undefined) {
    positive(drinkPrice, 'drinkPrice', 'Drink price');
    out.drinkPrice = drinkPrice;
    out.pourCostPct = r1(cost / drinkPrice * 100);
    answer += `, a pour cost of ${pct(cost / drinkPrice * 100)} at ${cents(drinkPrice)}`;
  }
  if (targetPct !== undefined) {
    percent(targetPct, 'targetPct', 'Target pour cost %');
    out.targetPct = targetPct;
    out.priceAtTarget = r2(cost / (targetPct / 100));
    out.suggestedPrice = roundPrice(cost / (targetPct / 100), ending);
    answer += `; at ${num(targetPct)}% it sells for ${cents(cost / (targetPct / 100))}`;
  }
  return { ...out, answer: `${answer}.` };
}

// Cake and bakery pricing: ingredients, labor and overhead per batch, then a profit margin on price.
export function bake({ ingredientCost, pieces, laborHours = 0, hourlyRate = 0, overheadPct = 0, overheadPerBatch = 0, packagingPerPiece = 0, marginPct, ending = 'cent', label = 'piece' }) {
  nonNegative(ingredientCost, 'ingredientCost', 'Ingredient cost');
  positive(pieces, 'pieces', 'Pieces or servings per batch');
  nonNegative(laborHours, 'laborHours', 'Labor hours');
  nonNegative(hourlyRate, 'hourlyRate', 'Hourly rate');
  nonNegative(overheadPct, 'overheadPct', 'Overhead %');
  nonNegative(overheadPerBatch, 'overheadPerBatch', 'Overhead per batch');
  nonNegative(packagingPerPiece, 'packagingPerPiece', 'Packaging per piece');
  if (typeof marginPct !== 'number' || marginPct < 0 || marginPct >= 100) throw new CostError('Profit margin % must be at least 0 and under 100.', 'marginPct');
  const labor = laborHours * hourlyRate;
  const overhead = (ingredientCost + labor) * overheadPct / 100 + overheadPerBatch;
  const packaging = packagingPerPiece * pieces;
  const batch = ingredientCost + labor + overhead + packaging;
  const per = batch / pieces;
  const exact = per / (1 - marginPct / 100);
  const price = roundPrice(exact, ending);
  return {
    batch: { ingredients: r4(ingredientCost), labor: r4(labor), overhead: r4(overhead), packaging: r4(packaging), total: r4(batch) },
    perPiece: { ingredients: r4(ingredientCost / pieces), labor: r4(labor / pieces), overhead: r4(overhead / pieces), packaging: r4(packagingPerPiece), total: r4(per) },
    exactPrice: r4(exact), price, profitPerPiece: r2(price - per), batchRevenue: r2(price * pieces), batchProfit: r2((price - per) * pieces),
    foodCostPct: r1(ingredientCost / pieces / price * 100),
    answer: `${num(pieces)} ${label}${pieces === 1 ? '' : 's'} cost ${cents(batch)} a batch (ingredients ${cents(ingredientCost)}, labor ${cents(labor)}, overhead ${cents(overhead)}${packaging ? `, packaging ${cents(packaging)}` : ''}), ${money(per)} each; a ${num(marginPct)}% profit margin prices each at ${cents(exact)}${ending === 'cent' ? '' : `, rounded up to ${cents(price)}`}.`,
  };
}

// Catering: food cost per guest from what each guest eats, scaled to the head count.
export function catering({ guests, items, targetPct, extraPerGuest = 0, ending = 'cent' }) {
  positive(guests, 'guests', 'Guests');
  if (!Number.isInteger(guests)) throw new CostError('Guests must be a whole number.', 'guests');
  if (!Array.isArray(items) || items.length === 0) throw new CostError('Add at least one menu item.', 'items');
  if (items.length > 60) throw new CostError('At most 60 menu items.', 'items');
  percent(targetPct, 'targetPct', 'Target food cost %');
  nonNegative(extraPerGuest, 'extraPerGuest', 'Extra cost per guest');
  const rows = items.map((it, i) => {
    const name = String(it.name ?? '').trim() || `Item ${i + 1}`;
    nonNegative(it.costPerPortion, `items.${i}`, `${name}: cost per portion`);
    nonNegative(it.portionsPerGuest, `items.${i}`, `${name}: portions per guest`);
    const perGuest = it.costPerPortion * it.portionsPerGuest;
    return { name, costPerPortion: it.costPerPortion, portionsPerGuest: it.portionsPerGuest, perGuest: r4(perGuest), portionsToMake: Math.ceil(it.portionsPerGuest * guests - 1e-9), total: r2(perGuest * guests), raw: perGuest };
  });
  const food = rows.reduce((s, r) => s + r.raw, 0);
  const perGuest = food + extraPerGuest;
  const exact = food / (targetPct / 100) + extraPerGuest;
  const price = roundPrice(exact, ending);
  return {
    guests, targetPct,
    items: rows.map(({ raw, ...r }) => r),
    foodCostPerGuest: r4(food), costPerGuest: r4(perGuest), totalCost: r2(perGuest * guests),
    pricePerGuest: price, exactPricePerGuest: r4(exact), totalPrice: r2(price * guests),
    answer: `Food for ${guests} guests costs ${cents(food * guests)} (${money(food)} a guest${extraPerGuest ? `, plus ${money(extraPerGuest)} a guest in disposables and extras` : ''}); at a ${num(targetPct)}% food cost the price is ${cents(price)} a guest, ${cents(price * guests)} in all.`,
  };
}

// Yield % = EP weight / AP weight x 100; EP cost = AP cost / yield (Egan, LibreTexts).
export function yieldCost({ apQty, epQty, yieldPct, apPrice, unit = 'lb' }) {
  let y = yieldPct;
  if (y === undefined) {
    positive(apQty, 'apQty', 'As-purchased weight');
    nonNegative(epQty, 'epQty', 'Edible portion weight');
    if (epQty > apQty) throw new CostError('The edible weight cannot be more than the as-purchased weight.', 'epQty');
    y = epQty / apQty * 100;
  }
  percent(y, 'yieldPct', 'Yield %');
  nonNegative(apPrice, 'apPrice', 'As-purchased price');
  const ep = apPrice / (y / 100);
  return {
    yieldPct: r1(y), apPrice, epPrice: r2(ep), epPriceExact: r4(ep), unit,
    answer: `${apQty !== undefined && yieldPct === undefined ? `${num(epQty)} ${unit} usable from ${num(apQty)} ${unit} is a ${pct(y)} yield, so ` : `At a ${pct(y)} yield, `}${cents(apPrice)} per ${unit} as purchased is ${cents(ep)} per edible ${unit} (${cents(apPrice)} / ${num(r4(y / 100))}).`,
  };
}

// Actual food cost from the stock count, set against the ideal from the recipes.
export function actual({ beginningInventory, purchases, endingInventory, foodSales, idealPct }) {
  nonNegative(beginningInventory, 'beginningInventory', 'Beginning inventory');
  nonNegative(purchases, 'purchases', 'Purchases');
  nonNegative(endingInventory, 'endingInventory', 'Ending inventory');
  positive(foodSales, 'foodSales', 'Food sales');
  const used = beginningInventory + purchases - endingInventory;
  if (used < 0) throw new CostError('Ending inventory is more than beginning inventory plus purchases.', 'endingInventory');
  const a = used / foodSales * 100;
  const out = { costOfFoodSold: r2(used), actualPct: r1(a) };
  let answer = `Cost of food sold = ${cents(beginningInventory)} + ${cents(purchases)} - ${cents(endingInventory)} = ${cents(used)}, ${pct(a)} of ${cents(foodSales)} in food sales`;
  if (idealPct !== undefined) {
    percent(idealPct, 'idealPct', 'Ideal food cost %');
    const gap = a - idealPct;
    out.idealPct = idealPct;
    out.gapPoints = r1(gap);
    out.gapDollars = r2(gap / 100 * foodSales);
    answer += gap > 0
      ? `; against the ${pct(idealPct)} your recipes say, ${r1(gap)} points (${cents(gap / 100 * foodSales)}) went to waste, over-portioning, comps, theft or prices not updated`
      : `; that is at or under the ${pct(idealPct)} your recipes say`;
  }
  return { ...out, answer: `${answer}.` };
}

// ---------- CSV in and out ----------

export function parseCsv(text) {
  if (typeof text !== 'string') throw new CostError('CSV must be text.', 'csv');
  if (text.length > LIMITS.csvChars) throw new CostError(`CSV is longer than ${LIMITS.csvChars} characters.`, 'csv');
  const sep = (text.split(/\r?\n/)[0].match(/\t/g) ?? []).length > (text.split(/\r?\n/)[0].match(/,/g) ?? []).length ? '\t' : ',';
  const rows = [];
  let row = [];
  let f = '';
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += ch;
    } else if (ch === '"' && f === '') q = true;
    else if (ch === sep) { row.push(f); f = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(f); f = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
    } else f += ch;
  }
  row.push(f);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows.map((r) => r.map((c) => c.trim()));
}

const HEAD = {
  name: ['ingredient', 'item', 'name', 'product', 'ingredient name'],
  packSize: ['pack size', 'size', 'pack qty', 'pack quantity', 'case size', 'purchase size', 'qty per pack', 'amount'],
  packUnit: ['pack unit', 'unit', 'purchase unit', 'uom', 'units'],
  packPrice: ['pack price', 'price', 'cost', 'case price', 'purchase price', 'new price', 'current price'],
  yieldPct: ['yield', 'yield %', 'yield pct', 'yield percent', 'ep yield'],
  previousPackPrice: ['previous price', 'old price', 'last price', 'previous pack price', 'was'],
  gramsPerCup: ['grams per cup', 'g per cup', 'g/cup'],
  gramsEach: ['grams each', 'g each', 'weight each (g)'],
  usda: ['usda', 'usda weight'],
};
const RHEAD = {
  recipe: ['recipe', 'dish', 'menu item', 'recipe name'],
  portions: ['portions', 'servings', 'yield', 'serves', 'portion count'],
  menuPrice: ['menu price', 'selling price', 'sale price', 'price'],
  makes: ['makes', 'batch yield', 'batch size'],
  extraPerPortion: ['extra per portion', 'sundries', 'garnish cost'],
  item: ['ingredient', 'item', 'component'],
  qty: ['qty', 'quantity', 'amount'],
  unit: ['unit', 'uom', 'units', 'measure'],
};
function columns(header, spec, required, what) {
  const h = header.map((x) => x.toLowerCase().replace(/[()]/g, '').replace(/\s+/g, ' ').replace(/\s*%$/, ' %').trim());
  const at = {};
  for (const [k, names] of Object.entries(spec)) {
    const i = h.findIndex((x) => names.includes(x) || names.includes(x.replace(/ %$/, '')));
    if (i >= 0 && !Object.values(at).includes(i)) at[k] = i;
  }
  const missing = required.filter((k) => at[k] === undefined);
  if (missing.length) throw new CostError(`${what} needs a header row with columns for ${required.map((k) => spec[k][0]).join(', ')} (missing: ${missing.map((k) => spec[k][0]).join(', ')}).`, 'csv');
  return at;
}
const numberOf = (s, field, label) => {
  const t = String(s).replace(/[$,\s%]/g, '');
  if (t === '') return undefined;
  if (/^\d+\s*\/\s*\d+$/.test(String(s).trim())) { const [a, b] = String(s).split('/').map(Number); return a / b; }
  const m = /^(\d+)\s+(\d+)\/(\d+)$/.exec(String(s).trim());
  if (m) return +m[1] + +m[2] / +m[3];
  const v = Number(t);
  if (!Number.isFinite(v)) throw new CostError(`${label}: "${s}" is not a number.`, field);
  return v;
};

export function priceListFromCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new CostError('The price list needs a header row and at least one ingredient.', 'priceListCsv');
  const at = columns(rows[0], HEAD, ['name', 'packSize', 'packUnit', 'packPrice'], 'The price list');
  return rows.slice(1).map((r, i) => {
    const line = `Price list row ${i + 2}`;
    const o = { name: r[at.name], packSize: numberOf(r[at.packSize], 'priceListCsv', line), packUnit: r[at.packUnit], packPrice: numberOf(r[at.packPrice], 'priceListCsv', line) };
    for (const k of ['yieldPct', 'previousPackPrice', 'gramsPerCup', 'gramsEach']) {
      if (at[k] !== undefined) { const v = numberOf(r[at[k]] ?? '', 'priceListCsv', line); if (v !== undefined) o[k] = v; }
    }
    if (at.usda !== undefined && r[at.usda]) o.usda = r[at.usda];
    if (o.packSize === undefined || o.packPrice === undefined) throw new CostError(`${line} (${o.name || 'no name'}) needs a pack size and a price.`, 'priceListCsv');
    return o;
  });
}

// "2 qt", "1.5 kg" -> { qty, unit }.
export function parseAmount(s) {
  const m = /^\s*(\d+(?:\.\d+)?(?:\s+\d+\/\d+)?|\d+\/\d+)\s*(.+?)\s*$/.exec(String(s ?? ''));
  if (!m) return null;
  return { qty: numberOf(m[1], 'makes', 'Makes'), unit: m[2] };
}

export function recipesFromCsv(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) throw new CostError('The recipes need a header row and at least one line.', 'recipesCsv');
  const at = columns(rows[0], RHEAD, ['recipe', 'item', 'qty', 'unit'], 'The recipes');
  const out = [];
  let cur = null;
  rows.slice(1).forEach((r, i) => {
    const line = `Recipe row ${i + 2}`;
    const name = r[at.recipe] ?? '';
    if (name && (!cur || cur.name !== name)) {
      cur = { name, lines: [] };
      out.push(cur);
    }
    if (!cur) throw new CostError(`${line} has no recipe name.`, 'recipesCsv');
    for (const k of ['portions', 'menuPrice', 'extraPerPortion']) {
      if (at[k] !== undefined && cur[k] === undefined) { const v = numberOf(r[at[k]] ?? '', 'recipesCsv', line); if (v !== undefined) cur[k] = v; }
    }
    if (at.makes !== undefined && !cur.makes && r[at.makes]) {
      const a = parseAmount(r[at.makes]);
      if (!a) throw new CostError(`${line}: makes "${r[at.makes]}" should look like 2 qt.`, 'recipesCsv');
      cur.makes = a;
    }
    if (r[at.item]) {
      const qty = numberOf(r[at.qty] ?? '', 'recipesCsv', line);
      if (qty === undefined) throw new CostError(`${line}: ${r[at.item]} has no quantity.`, 'recipesCsv');
      cur.lines.push({ item: r[at.item], qty, unit: r[at.unit] });
    }
  });
  return out;
}

export const csvField = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export function reportCsv(rows) {
  const head = ['recipe', 'portions', 'batch_cost', 'portion_cost', 'menu_price', 'food_cost_pct', 'price_at_target', 'suggested_price', 'previous_portion_cost', 'cost_change', 'points_moved', 'status'];
  const body = rows.map((r) => [r.name, r.portions, r.batchCost, r.portionCost, r.menuPrice, r.foodCostPct, r.priceAtTarget, r.suggestedPrice, r.previousPortionCost, r.costChange, r.pointsMoved, r.status]);
  return [head, ...body].map((r) => r.map(csvField).join(',')).join('\r\n') + '\r\n';
}

// How many recipes a recost or workbook call carries (its billable units), JSON or CSV.
export function recipeCount(input) {
  if (Array.isArray(input.recipes)) return input.recipes.length;
  if (typeof input.recipesCsv === 'string') {
    try { return recipesFromCsv(input.recipesCsv).length; } catch { return 0; }
  }
  return 0;
}

// ---------- samples the page and the content pages share ----------

// One plate: the plate cost calculator's sample (?sample=plate on the page).
export const SAMPLE_PLATE = {
  targetPct: 30,
  ingredients: [
    { name: 'Chicken breast', packSize: 40, packUnit: 'lb', packPrice: 131.60, yieldPct: 92 },
    { name: 'Yukon gold potatoes', packSize: 50, packUnit: 'lb', packPrice: 38.50, yieldPct: 85 },
    { name: 'Butter, unsalted', packSize: 1, packUnit: 'lb', packPrice: 4.60, usda: 'butter' },
    { name: 'Heavy cream', packSize: 1, packUnit: 'qt', packPrice: 5.89 },
    { name: 'Green beans', packSize: 20, packUnit: 'lb', packPrice: 36.00, yieldPct: 88 },
    { name: 'Olive oil', packSize: 1, packUnit: 'gal', packPrice: 32.00 },
  ],
  recipes: [{ name: 'Roast chicken plate', portions: 1, menuPrice: 14, lines: [
    { item: 'Chicken breast', qty: 8, unit: 'oz' }, { item: 'Yukon gold potatoes', qty: 6, unit: 'oz' }, { item: 'Butter, unsalted', qty: 1, unit: 'tbsp' },
    { item: 'Heavy cream', qty: 2, unit: 'tbsp' }, { item: 'Green beans', qty: 4, unit: 'oz' }, { item: 'Olive oil', qty: 2, unit: 'tsp' }] }],
};

// A buffet for a head count: the catering calculator's sample.
export const SAMPLE_CATERING = {
  guests: 120,
  targetPct: 32,
  extraPerGuest: 0.45,
  items: [
    { name: 'Chicken skewers', costPerPortion: 1.10, portionsPerGuest: 2 },
    { name: 'Rice pilaf', costPerPortion: 0.38, portionsPerGuest: 1 },
    { name: 'Garden salad', costPerPortion: 0.62, portionsPerGuest: 1 },
    { name: 'Dinner rolls', costPerPortion: 0.21, portionsPerGuest: 1.5 },
    { name: 'Cookies', costPerPortion: 0.21, portionsPerGuest: 2 },
  ],
};
export const cateringText = (items) => items.map((i) => `${i.name}, ${i.costPerPortion.toFixed(2)}, ${i.portionsPerGuest}`).join('\n');
