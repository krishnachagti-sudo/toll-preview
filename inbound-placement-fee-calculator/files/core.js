// Amazon FBA inbound placement fee comparator: the engine. Pure and dependency-free, so the page and the
// server load the same file. Every figure comes from the data the caller passes in (data/amazon-placement.json,
// transcribed from Amazon's own US Seller Central pages); nothing here is a rate of its own.
//
// Units: money in whole US cents (BigInt where products can grow), weight in thousandths of an ounce,
// sides in hundredths of an inch. A dimensional weight is kept as an exact fraction, so a band edge is
// never crossed by rounding.

export const ENGINE_VERSION = 'placement-1';
export const OPTIONS = ['minimal', 'partial', 'optimized'];
export const TIERS = ['small-standard', 'large-standard', 'small-bulky', 'medium-bulky', 'large-bulky', 'extra-large-bulky', 'extra-large', 'oversize'];
export const TIER_LABEL = {
  'small-standard': 'small standard', 'large-standard': 'large standard', 'small-bulky': 'small bulky', 'medium-bulky': 'medium bulky',
  'large-bulky': 'large bulky', 'extra-large-bulky': 'extra-large bulky', 'extra-large': 'extra-large', oversize: 'oversize',
};
export const OPTION_LABEL = { minimal: 'Minimal shipment splits', partial: 'Partial shipment splits', optimized: 'Amazon-optimized shipment splits' };
export const OPTION_SHORT = { minimal: 'minimal splits', partial: 'partial splits', optimized: 'Amazon-optimized splits' };
export const LIMITS = { items: 200, cartons: 500, units: 1_000_000, money: 100_000_000_00, months: 12 };
// The day Amazon's 2027 size tiers start (data.sizeTiers['2027'].from); before it the 2026 table applies.
const TIERS_2027 = '2027-01-15';

export class PlacementError extends Error {
  constructor(message, field) { super(message); this.name = 'PlacementError'; this.field = field; }
}
const fail = (msg, field) => { throw new PlacementError(msg, field); };

// ---------- numbers ----------

// "1,250.50", "$1250.5", 1250.5 -> 125050 cents. At most two decimals; never negative.
export function toCents(v, field = 'amount') {
  if (typeof v === 'number') {
    if (!Number.isFinite(v) || v < 0) fail(`${field} is an amount of zero or more.`, field);
    v = String(v);
  }
  if (typeof v !== 'string') fail(`${field} is an amount like 420 or "1,250.50".`, field);
  const s = v.trim().replace(/^\$/, '').replace(/,/g, '');
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) fail(`${field} is an amount in dollars with at most two decimals, like 420 or 1250.50.`, field);
  const cents = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'));
  if (cents > LIMITS.money) fail(`${field} is at most $100,000,000.`, field);
  return cents;
}

// A decimal with at most `places` decimals as an integer of 10^-places, above zero.
function toScaled(v, places, field, what) {
  if (typeof v === 'number') {
    if (!Number.isFinite(v) || v <= 0) fail(`${field} is ${what} above zero.`, field);
    v = String(v);
  }
  if (typeof v !== 'string') fail(`${field} is ${what}.`, field);
  const m = new RegExp(`^(\\d+)(?:\\.(\\d{1,${places}}))?$`).exec(v.trim());
  if (!m) fail(`${field} is ${what} with at most ${places} decimals.`, field);
  const n = Number(m[1]) * 10 ** places + Number((m[2] ?? '').padEnd(places, '0'));
  if (n <= 0) fail(`${field} is ${what} above zero.`, field);
  return n;
}

// Weight -> thousandths of an ounce.
export function toMilliOz(v, unit = 'lb', field = 'weight') {
  if (!['oz', 'lb'].includes(unit)) fail('weightUnit is oz or lb.', 'weightUnit');
  const k = toScaled(v, 3, field, 'a weight');
  const mo = unit === 'lb' ? k * 16 : k;
  if (mo > 200_000_000) fail(`${field} is too large.`, field);
  return mo;
}
// Side -> hundredths of an inch.
export const toHundredths = (v, field) => toScaled(v, 2, field, 'a length in inches');

const commas = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export function money(cents) {
  const c = BigInt(cents);
  const neg = c < 0n;
  const a = neg ? -c : c;
  return `${neg ? '-' : ''}$${commas(String(a / 100n))}.${String(a % 100n).padStart(2, '0')}`;
}
export const moneyRange = (lo, hi) => (BigInt(lo) === BigInt(hi) ? money(lo) : `${money(lo)} to ${money(hi)}`);

// A weight fraction (thousandths of an ounce) in words: under a pound in ounces, else pounds, 2 decimals.
export function weightWords(w) {
  const { num, den } = typeof w === 'object' ? w : { num: BigInt(w), den: 1n };
  if (num < 16000n * den) {
    const tenths = (num * 10n + 500n * den) / (1000n * den);
    return `${tenths / 10n}${tenths % 10n ? `.${tenths % 10n}` : ''} oz`;
  }
  const hund = (num * 100n + 8000n * den) / (16000n * den);
  const s = `${hund / 100n}.${String(hund % 100n).padStart(2, '0')}`.replace(/\.?0+$/, '');
  return `${s} lb`;
}

// ---------- dates ----------

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
export function isDay(s) {
  return typeof s === 'string' && DAY_RE.test(s) && new Date(`${s}T00:00:00Z`).toISOString().startsWith(s);
}
export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (iso) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}, ${iso.slice(0, 4)}`;

// ---------- size tiers and the fee row ----------

// Which of Amazon's placement-fee rows a tier pays under, or null when the fee does not apply.
// Amazon's table names Small/Medium Bulky and Large/Extra Large Bulky; its 2026 small bulky is the
// 2027 small plus medium bulky, and its 2026 large bulky the 2027 large plus extra-large bulky.
// "The FBA inbound placement service fee doesn't apply to Extra-Large products", and Amazon's
// dimensional weight page calls oversize "also known as 'Extra Large'".
export function rowOf(tier) {
  if (tier === 'small-standard' || tier === 'large-standard') return tier;
  if (tier === 'small-bulky' || tier === 'medium-bulky') return 'small-medium-bulky';
  if (tier === 'large-bulky' || tier === 'extra-large-bulky') return 'large-xl-bulky';
  return null;
}
export const isStandard = (tier) => tier === 'small-standard' || tier === 'large-standard';
export const tableFor = (day) => (day >= TIERS_2027 ? '2027' : '2026');

// The weight band of a row for a weight (thousandths of an ounce, or an exact fraction).
function bandOf(rows, row, w) {
  const { num, den } = typeof w === 'object' ? w : { num: BigInt(w), den: 1n };
  return rows.filter((r) => r.row === row).find((r) => num > BigInt(r.minOz * 1000) * den && num <= BigInt(r.maxOz * 1000) * den) ?? null;
}
export function feeBand(data, tier, w) {
  const row = rowOf(tier);
  if (!row) return null;
  return bandOf(isStandard(tier) ? data.placement.standard : data.placement.bulky, row, w);
}
export function defectBand(data, tier, w) {
  const row = rowOf(tier);
  return row ? bandOf(data.defect.rows, row, w) : null;
}
// The heaviest weight a tier's fee row covers, in ounces.
const rowMaxOz = (data, tier) => Math.max(...(isStandard(tier) ? data.placement.standard : data.placement.bulky).filter((r) => r.row === rowOf(tier)).map((r) => r.maxOz));

// The size tier and the fee's shipping weight from the packaged dimensions and unit weight.
// sides in hundredths of an inch (any order), unit weight in thousandths of an ounce.
export function classify(data, { sides, unitMilliOz, day }) {
  const [l, m, s] = [...sides].sort((a, b) => b - a);
  const table = tableFor(day);
  const def = data.sizeTiers[table];
  const divisor = BigInt(data.dimWeight.divisor);
  const min = data.dimWeight.minSideBulky * 100;
  // Dimensional weight in thousandths of an ounce: (L x W x H in^3 / divisor) lb x 16,000.
  const dim = (a, b, c) => ({ num: BigInt(a) * BigInt(b) * BigInt(c) * 16n, den: divisor * 1000n });
  const unit = { num: BigInt(unitMilliOz), den: 1n };
  const max = (x, y) => (x.num * y.den >= y.num * x.den ? x : y);
  const plain = dim(l, m, s);
  const bulkyDim = dim(l, Math.max(m, min), Math.max(s, min));
  const fits = (t, w) => {
    const [tl, tm, ts] = t.sides.map((x) => Math.round(x * 100));
    if (l > tl || m > tm || s > ts) return false;
    if (t.girth && l + 2 * (m + s) > t.girth * 100) return false;
    return w.num <= BigInt(t.maxOz * 1000) * w.den;
  };
  const girth = l + 2 * (m + s);
  for (const t of def.tiers) {
    const w = t.tier === 'small-standard' ? unit : t.tier === 'large-standard' ? max(unit, plain) : max(unit, bulkyDim);
    if (fits(t, w)) return { tier: t.tier, label: t.label, table, weight: w, dimWeight: t.tier === 'large-standard' ? plain : bulkyDim, usesDim: w !== unit, girth };
  }
  return { tier: def.over.tier, label: def.over.label, table, weight: max(unit, bulkyDim), dimWeight: bulkyDim, usesDim: false, girth };
}

// ---------- one shipping plan: items ----------

// Each item: { sku?, units, tier + weight (the fee's shipping weight) } or { sku?, units, length, width,
// height, unitWeight } (the tier and weight are worked out). weightUnit applies to both weights.
function resolveItems(data, items, day) {
  if (!Array.isArray(items) || !items.length) fail('items lists at least one product: its units and its size tier and weight (or its dimensions).', 'items');
  if (items.length > LIMITS.items) fail(`items holds at most ${LIMITS.items} products.`, 'items');
  const seen = new Set();
  let total = 0;
  return items.map((it, i) => {
    const f = (k) => `items.${i}.${k}`;
    const sku = it.sku === undefined || it.sku === '' ? `Item ${i + 1}` : String(it.sku).trim().slice(0, 60);
    if (seen.has(sku)) fail(`${sku} is listed twice; give each product one line.`, f('sku'));
    seen.add(sku);
    const units = it.units;
    if (!Number.isInteger(units) || units < 1) fail(`${f('units')} is a whole number of units, 1 or more.`, f('units'));
    total += units;
    if (total > LIMITS.units) fail(`A plan holds at most ${LIMITS.units.toLocaleString('en-US')} units.`, f('units'));
    const unitName = it.weightUnit ?? 'lb';
    let tier;
    let weight = null;
    let from = 'given';
    let detail = null;
    if (it.length !== undefined || it.width !== undefined || it.height !== undefined) {
      if ([it.length, it.width, it.height, it.unitWeight].some((x) => x === undefined)) fail(`${sku}: give length, width and height in inches and unitWeight, or a tier and weight.`, f('length'));
      const sides = [toHundredths(it.length, f('length')), toHundredths(it.width, f('width')), toHundredths(it.height, f('height'))];
      const c = classify(data, { sides, unitMilliOz: toMilliOz(it.unitWeight, unitName, f('unitWeight')), day });
      if (it.tier !== undefined && it.tier !== c.tier) fail(`${sku}: these dimensions and weight make it ${TIER_LABEL[c.tier]} in Amazon's ${c.table} table, not ${TIER_LABEL[it.tier] ?? it.tier}.`, f('tier'));
      tier = c.tier;
      weight = c.weight;
      from = 'dimensions';
      detail = { table: c.table, dimWeight: weightWords(c.dimWeight), usesDimWeight: c.usesDim, lengthPlusGirth: `${(c.girth / 100).toFixed(2).replace(/\.?0+$/, '')} in` };
    } else {
      tier = it.tier;
      if (!TIERS.includes(tier)) fail(`${f('tier')} is one of ${TIERS.join(', ')}.`, f('tier'));
      if (rowOf(tier)) {
        if (it.weight === undefined) fail(`${sku}: give its shipping weight (unit weight for small standard; the larger of unit and dimensional weight otherwise).`, f('weight'));
        weight = { num: BigInt(toMilliOz(it.weight, unitName, f('weight'))), den: 1n };
      }
    }
    let band = null;
    if (rowOf(tier)) {
      band = feeBand(data, tier, weight);
      if (!band) fail(`${sku}: ${weightWords(weight)} is over the ${rowMaxOz(data, tier) / 16} lb that Amazon's ${TIER_LABEL[tier]} rows cover; check the size tier.`, f('weight'));
    }
    return { sku, units, tier, weight, band, from, detail, defect: rowOf(tier) ? defectBand(data, tier, weight) : null };
  });
}

// ---------- the eligibility of Amazon-optimized splits ----------

const sig = (items) => Object.entries(items).filter(([, q]) => q > 0).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, q]) => `${k}=${q}`).join('&');
const packing = (items) => Object.entries(items).filter(([, q]) => q > 0).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([k, q]) => `${q} x ${k}`).join(' + ');
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const listWords = (xs) => (xs.length <= 2 ? xs.join(' and ') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);

// A repack that gives a product at least 5 identical single-product cartons.
function repack(sku, units, unit) {
  if (units < 5) return `${sku} has only ${plural(units, 'unit')}, too few for five ${unit}s: send it in a separate shipment with minimal splits.`;
  for (let k = 5; k <= 20; k++) if (units % k === 0) return `Repack ${sku}'s ${units.toLocaleString('en-US')} units as ${k} identical ${unit}s of ${(units / k).toLocaleString('en-US')}.`;
  const per = Math.floor(units / 5);
  const rest = units - per * 5;
  return `Repack ${(per * 5).toLocaleString('en-US')} of ${sku}'s units as 5 identical ${unit}s of ${per.toLocaleString('en-US')} and send the other ${plural(rest, 'unit')} separately.`;
}

// cartons: [{ id?, count?, items: { sku: quantity } }]. Amazon: "shipments must include at least five
// identical cartons or pallets per item. Each carton or pallet must contain the same quantity per item
// and the same item mix." So every carton holding a product must be packed the same, and there must
// be five or more of them.
export function eligibility(data, { cartons, unit = 'carton' } = {}) {
  if (!['carton', 'pallet'].includes(unit)) fail('unit is carton or pallet.', 'unit');
  if (!Array.isArray(cartons) || !cartons.length) fail(`cartons lists at least one ${unit}: what each holds, like { "items": { "SKU-A": 24 } }.`, 'cartons');
  const list = [];
  cartons.forEach((c, i) => {
    const count = c.count ?? 1;
    if (!Number.isInteger(count) || count < 1) fail(`cartons.${i}.count is a whole number, 1 or more.`, `cartons.${i}.count`);
    if (!c.items || typeof c.items !== 'object' || Array.isArray(c.items)) fail(`cartons.${i}.items is { sku: quantity }.`, `cartons.${i}.items`);
    const entries = Object.entries(c.items);
    if (entries.length > LIMITS.items) fail(`cartons.${i}.items holds at most ${LIMITS.items} products.`, `cartons.${i}.items`);
    for (const [k, q] of entries) {
      if (!k.trim() || k.length > 60) fail(`cartons.${i}.items: a product name is 1 to 60 characters.`, `cartons.${i}.items`);
      if (!Number.isInteger(q) || q < 0) fail(`cartons.${i}.items.${k} is a whole number of units.`, `cartons.${i}.items`);
    }
    if (!entries.some(([, q]) => q > 0)) fail(`${unit} ${i + 1} holds no units.`, `cartons.${i}.items`);
    for (let n = 0; n < count; n++) {
      if (list.length >= LIMITS.cartons) fail(`At most ${LIMITS.cartons} ${unit}s in a plan.`, 'cartons');
      const no = list.length + 1;
      list.push({ no, id: c.id ? `${String(c.id).slice(0, 40)}${count > 1 ? ` #${n + 1}` : ''}` : `${unit[0].toUpperCase()}${unit.slice(1)} ${no}`, items: c.items, sig: sig(c.items) });
    }
  });
  const skus = [...new Set(list.flatMap((c) => Object.entries(c.items).filter(([, q]) => q > 0).map(([k]) => k)))];
  const items = skus.map((sku) => {
    const holding = list.filter((c) => (c.items[sku] ?? 0) > 0);
    const groups = new Map();
    for (const c of holding) groups.set(c.sig, [...(groups.get(c.sig) ?? []), c]);
    // The most common packing (the first seen on a tie) is the one the others are told to match.
    const main = [...groups.values()].sort((a, b) => b.length - a.length || a[0].no - b[0].no)[0];
    const odd = holding.filter((c) => c.sig !== main[0].sig);
    const units = holding.reduce((a, c) => a + c.items[sku], 0);
    const eligible = odd.length === 0 && holding.length >= 5;
    let reason;
    let fix = null;
    if (eligible) reason = `${sku} is in ${plural(holding.length, unit)}, all packed the same (${packing(main[0].items)}).`;
    else if (odd.length) {
      reason = `${sku} is in ${plural(holding.length, unit)}, but they are not identical: ${listWords(odd.map((c) => c.id))} ${odd.length === 1 ? 'is' : 'are'} packed differently from the other ${main.length} (${packing(main[0].items)}).`;
      const odds = listWords(odd.map((c) => c.id));
      fix = holding.length >= 5
        ? `Pack ${odds} the same as the others (${packing(main[0].items)}), so all ${holding.length} match${main.length >= 5 ? `, or move ${odd.length === 1 ? 'it' : 'them'} to another shipment; the other ${main.length} ${unit}s qualify` : ''}.`
        : repack(sku, units, unit);
    } else {
      reason = `${sku} is in ${plural(holding.length, unit)}; Amazon asks for at least five identical ${unit}s per item.`;
      fix = repack(sku, units, unit);
    }
    return { sku, cartons: holding.length, identical: main.length, units, eligible, reason, fix, packedDifferently: odd.map((c) => c.id) };
  });
  const blocking = items.filter((x) => !x.eligible);
  const eligible = blocking.length === 0;
  const answer = eligible
    ? `Amazon-optimized splits: eligible. All ${plural(items.length, 'product')} in this plan have at least five identical ${unit}s (${plural(list.length, unit)} in all).`
    : `Amazon-optimized splits: not eligible. ${blocking.length} of ${plural(items.length, 'product')} ${blocking.length === 1 ? 'blocks' : 'block'} it: ${listWords(blocking.map((x) => x.sku))}. ${blocking[0].fix}`;
  return {
    answer, eligible, unit, cartons: list.length, products: items.length, items, blocking: blocking.map((x) => x.sku),
    rule: data.placement.options.optimized.quote,
    tips: [data.placement.quotes.separate, ...data.placement.quotes.maximize],
  };
}

// The page's text forms. A carton a line: "[label] 5 x SKU-A: 24, SKU-B: 6" (label and count optional).
export function parseCartons(text) {
  const lines = String(text ?? '').split(/\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) fail('Add at least one carton, one a line, like "5 x SKU-A: 24".', 'cartons');
  return lines.map((line, i) => {
    let rest = line;
    const c = {};
    const label = /^\[([^\]]{1,40})\]\s*/.exec(rest);
    if (label) { c.id = label[1].trim(); rest = rest.slice(label[0].length); }
    const count = /^(\d+)\s*[xX×]\s+/.exec(rest);
    if (count) { c.count = Number(count[1]); rest = rest.slice(count[0].length); }
    c.items = {};
    for (const part of rest.split(',').map((x) => x.trim()).filter(Boolean)) {
      const m = /^(.+?)\s*:\s*(\d+)$/.exec(part);
      if (!m) fail(`Line ${i + 1}: write each product as SKU: units, like "SKU-A: 24".`, 'cartons');
      c.items[m[1]] = (c.items[m[1]] ?? 0) + Number(m[2]);
    }
    if (!Object.keys(c.items).length) fail(`Line ${i + 1} lists no products.`, 'cartons');
    return c;
  });
}
// A product a line: "SKU, units, tier, weight in lb".
export function parseItems(text) {
  return String(text ?? '').split(/\n/).map((l) => l.trim()).filter(Boolean).map((line, i) => {
    const [sku, units, tier, weight] = line.split(',').map((x) => x.trim());
    if (!sku || !/^\d+$/.test(units ?? '') || !TIERS.includes(tier)) fail(`Product line ${i + 1}: write SKU, units, tier, weight in lb, like "LID-01, 400, large-standard, 0.6".`, 'items');
    return { sku, units: Number(units), tier, ...(weight ? { weight } : {}) };
  });
}

// ---------- comparing the options ----------

function optionInput(o, key) {
  if (!o || typeof o !== 'object') return null;
  const f = (k) => `options.${key}.${k}`;
  if (o.freight === undefined) fail(`${f('freight')} is the freight for this option: your carrier's quote, in dollars, for all its shipments (0 if none).`, f('freight'));
  const out = { freight: toCents(o.freight, f('freight')), other: o.other === undefined ? 0 : toCents(o.other, f('other')) };
  if (key === 'optimized') {
    if (o.fee !== undefined || o.feePerUnit !== undefined) fail('Amazon-optimized splits have no placement fee; give only its freight (and other costs).', f('fee'));
    return out;
  }
  if (o.fee !== undefined && o.feePerUnit !== undefined) fail(`Give ${f('fee')} (the total) or ${f('feePerUnit')}, not both.`, f('fee'));
  if (o.fee !== undefined) out.fee = toCents(o.fee, f('fee'));
  if (o.feePerUnit !== undefined) out.feePerUnit = toCents(o.feePerUnit, f('feePerUnit'));
  return out;
}

// input: { items, options: { minimal?, partial?, optimized? }, planDate?, region?, credits?, receivedDate?,
// cartons?, unit?, worksheet? }. today: the day of the call (YYYY-MM-DD), the default plan date.
export function compare(data, input, { today } = {}) {
  const day = input.planDate ?? today;
  if (!isDay(day)) fail('planDate is a date written YYYY-MM-DD.', 'planDate');
  const items = resolveItems(data, input.items, day);
  const opts = input.options ?? {};
  const asked = OPTIONS.filter((k) => opts[k] !== undefined);
  if (!asked.length) fail('options needs at least one of minimal, partial and optimized, each with its freight.', 'options');
  const given = Object.fromEntries(asked.map((k) => [k, optionInput(opts[k], k)]));
  const credits = input.credits === undefined ? 0 : toCents(input.credits, 'credits');
  if (input.receivedDate !== undefined && !isDay(input.receivedDate)) fail('receivedDate is a date written YYYY-MM-DD.', 'receivedDate');
  const region = input.region;
  if (region !== undefined && !['east', 'west', 'central'].includes(region)) fail('region is east, west or central.', 'region');

  const feeItems = items.filter((it) => it.band);
  const feeUnits = feeItems.reduce((a, it) => a + it.units, 0);
  const totalUnits = items.reduce((a, it) => a + it.units, 0);
  const anyStandard = feeItems.some((it) => isStandard(it.tier));
  const anyBulky = feeItems.some((it) => !isStandard(it.tier));
  const notes = [];

  // Amazon-optimized: checked against the carton plan when one is given.
  let elig = null;
  if (input.cartons !== undefined) elig = eligibility(data, { cartons: input.cartons, unit: input.unit ?? 'carton' });
  const tooFew = items.filter((it) => it.units < 5).map((it) => it.sku);

  const offered = {};
  for (const k of asked) {
    let why = null;
    if (k === 'partial' && anyStandard) why = data.placement.options.partial.quote.split('. ')[1];
    if (k === 'partial' && !anyStandard && !anyBulky) why = 'Partial splits are for Bulky items; nothing in this plan pays a placement fee.';
    if (k === 'optimized' && elig && !elig.eligible) why = `Not offered for this carton plan: ${elig.blocking.join(', ')} ${elig.blocking.length === 1 ? 'does' : 'do'} not have five identical ${elig.unit}s.`;
    if (k === 'optimized' && !elig && tooFew.length) why = `Not offered: ${listWords(tooFew)} ${tooFew.length === 1 ? 'has' : 'have'} fewer than five units, so cannot fill five identical cartons.`;
    offered[k] = why;
  }

  // The fee per option: Amazon's published range for each item's row and band, or the figure you give.
  const options = asked.map((k) => {
    const g = given[k];
    let low = 0n;
    let high = 0n;
    const perItem = items.map((it) => {
      const range = k === 'optimized' || !it.band ? [0, 0] : it.band[k] ?? null;
      return { sku: it.sku, range };
    });
    if (k !== 'optimized') {
      for (let i = 0; i < items.length; i++) {
        const r = perItem[i].range;
        if (!r) continue;
        low += BigInt(items[i].units) * BigInt(r[0]);
        high += BigInt(items[i].units) * BigInt(r[1]);
      }
    }
    let exact = k === 'optimized';
    let fee = null;
    let outside = null;
    if (g.fee !== undefined || g.feePerUnit !== undefined) {
      fee = g.fee !== undefined ? BigInt(g.fee) : BigInt(g.feePerUnit) * BigInt(feeUnits);
      exact = true;
      if (offered[k] === null && (fee < low || fee > high)) outside = `The fee given (${money(fee)}) is outside Amazon's published range for these items (${moneyRange(low, high)}). Check the units and tiers, or the figure Send to Amazon shows.`;
    }
    const lo = exact ? (fee ?? 0n) : low;
    const hi = exact ? (fee ?? 0n) : high;
    const cr = (f) => (BigInt(credits) < f ? BigInt(credits) : f);
    const fixed = BigInt(g.freight + g.other);
    return {
      option: k, label: OPTION_LABEL[k], offered: offered[k] === null, notOffered: offered[k],
      fee: { low: lo, high: hi, exact, published: k === 'optimized' ? null : { low, high } },
      credit: { low: cr(lo), high: cr(hi) }, freight: BigInt(g.freight), other: BigInt(g.other),
      total: { low: lo - cr(lo) + fixed, high: hi - cr(hi) + fixed }, outside, perItem,
    };
  });

  const live = options.filter((o) => o.offered);
  let verdict = null;
  if (live.length) {
    const byLow = [...live].sort((a, b) => (a.total.low < b.total.low ? -1 : a.total.low > b.total.low ? 1 : OPTIONS.indexOf(a.option) - OPTIONS.indexOf(b.option)));
    const byHigh = [...live].sort((a, b) => (a.total.high < b.total.high ? -1 : a.total.high > b.total.high ? 1 : OPTIONS.indexOf(a.option) - OPTIONS.indexOf(b.option)));
    const sure = live.find((a) => live.every((b) => b === a || a.total.high <= b.total.low));
    if (live.length === 1) verdict = { kind: 'only', option: live[0].option };
    else if (sure) {
      const others = live.filter((b) => b !== sure);
      const gapLow = others.reduce((m, b) => (b.total.low - sure.total.high < m ? b.total.low - sure.total.high : m), others[0].total.low - sure.total.high);
      const gapHigh = others.reduce((m, b) => (b.total.high - sure.total.low < m ? b.total.high - sure.total.low : m), others[0].total.high - sure.total.low);
      const runner = [...others].sort((a, b) => (a.total.low < b.total.low ? -1 : 1))[0];
      verdict = { kind: live.every((o) => o.fee.exact) ? 'exact' : 'certain', option: sure.option, runnerUp: runner.option, by: { low: gapLow, high: gapHigh } };
    } else if (byLow[0] === byHigh[0]) {
      verdict = { kind: 'both-ends', option: byLow[0].option, runnerUp: byLow[1].option, by: { low: byLow[1].total.low - byLow[0].total.low, high: byHigh[1].total.high - byHigh[0].total.high } };
    } else verdict = { kind: 'depends', option: null, cheapIfLow: byLow[0].option, cheapIfHigh: byHigh[0].option };
  }

  // Break-even: the most a fee option's placement fee can be before Amazon-optimized splits are cheaper.
  const opt = live.find((o) => o.option === 'optimized');
  const breakEven = live.filter((o) => o.option !== 'optimized' && opt).map((o) => {
    const room = opt.total.low - o.freight - o.other;
    const feeTotal = room <= 0n ? 0n : room + BigInt(credits);
    const perUnit = feeUnits ? feeTotal / BigInt(feeUnits) : 0n;
    return {
      option: o.option, feeTotal, perUnit,
      words: room <= 0n
        ? `${OPTION_SHORT[o.option][0].toUpperCase()}${OPTION_SHORT[o.option].slice(1)} cannot win: their freight alone (${money(o.freight + o.other)}) is not below Amazon-optimized's total (${money(opt.total.low)}).`
        : `${OPTION_SHORT[o.option][0].toUpperCase()}${OPTION_SHORT[o.option].slice(1)} are cheaper while their placement fee stays under ${money(feeTotal)}${feeUnits ? ` (${money(perUnit)} a unit across ${feeUnits.toLocaleString('en-US')} units)` : ''}; above it, Amazon-optimized splits are cheaper.`,
    };
  });

  // Notes, each from Amazon's page.
  if (anyStandard && anyBulky) notes.push(`This plan mixes standard-size and Bulky items. Amazon: "${data.placement.quotes.mixed}" It suggests: "${data.placement.quotes.separate}".`);
  if (region === 'west') notes.push(`Amazon's page says ${data.placement.quotes.west}. Its table gives ranges, not a rate per region: the fee Send to Amazon shows for your West location is the one to enter.`);
  if (region === 'central' && anyStandard && day >= data.changes2027.date) notes.push(`From ${longDate(data.changes2027.date)}, Amazon is ${data.changes2027.regions}. A standard-size plan dated ${longDate(day)} has no central inbound region.`);
  if (region === 'central' && anyStandard && day < data.changes2027.date) notes.push(`Amazon: "${data.placement.quotes.region2027}"`);
  if (items.some((it) => !it.band)) notes.push(`${listWords(items.filter((it) => !it.band).map((it) => it.sku))}: ${data.placement.quotes.extraLarge}`);
  if (credits) notes.push(`Credits of ${money(credits)} are taken off the placement fee (Amazon's new-seller credits "apply to the FBA inbound placement service fee"; ${data.placement.creditTerms.toLowerCase()}).`);
  for (const o of options) if (o.outside) notes.push(o.outside);
  if (!elig && asked.includes('optimized') && !tooFew.length) notes.push(`Amazon-optimized splits need "at least five identical cartons or pallets per item". Add your carton plan to check it.`);
  const charge = input.receivedDate ? { receivedOn: input.receivedDate, chargedOn: addDays(input.receivedDate, data.placement.chargedDaysAfterReceipt) } : null;
  if (charge) notes.push(`Amazon charges the fee ${data.placement.chargedDaysAfterReceipt} days after the shipment is received, on the units received: received ${longDate(charge.receivedOn)}, charged about ${longDate(charge.chargedOn)}.`);

  const answer = answerOf({ items, options, verdict, breakEven, feeUnits, totalUnits });
  const out = {
    answer, verdict: verdict && present(verdict), planDate: day, sizeTable: tableFor(day), units: totalUnits, feeUnits,
    items: items.map((it) => ({
      sku: it.sku, units: it.units, tier: it.tier, from: it.from, shippingWeight: it.weight ? weightWords(it.weight) : null,
      feeRow: it.band ? `${it.band.label}, ${it.band.band}` : 'No placement fee (extra-large / oversize)',
      minimalPerUnit: it.band ? perUnitWords(it.band.minimal) : '$0.00', partialPerUnit: it.band?.partial ? perUnitWords(it.band.partial) : null,
      defectPerUnit: it.defect ? money(it.defect.fee) : null, ...(it.detail ? { measured: it.detail } : {}),
    })),
    options: options.map((o) => ({
      option: o.option, label: o.label, offered: o.offered, ...(o.notOffered ? { notOffered: o.notOffered } : {}),
      placementFee: moneyRange(o.fee.low, o.fee.high), feeSource: o.option === 'optimized' ? 'No placement fee' : o.fee.exact ? 'The fee you entered' : 'Amazon\'s published range',
      credits: o.credit.high ? moneyRange(o.credit.low, o.credit.high) : null,
      freight: money(o.freight), other: o.other ? money(o.other) : null, total: moneyRange(o.total.low, o.total.high),
      totalLow: money(o.total.low), totalHigh: money(o.total.high),
      perUnit: moneyRange(o.total.low / BigInt(totalUnits), o.total.high / BigInt(totalUnits)),
    })),
    breakEven: breakEven.map((b) => ({ option: b.option, feeTotal: money(b.feeTotal), perUnit: money(b.perUnit), words: b.words })),
    eligibility: elig, charge, notes,
  };
  if (input.worksheet) out.csv = worksheet(items, options);
  return out;
}

const perUnitWords = ([lo, hi]) => `${money(lo)} to ${money(hi)}`;
function present(v) {
  const o = { kind: v.kind, option: v.option, label: v.option ? OPTION_LABEL[v.option] : null };
  if (v.by) { o.runnerUp = v.runnerUp; o.by = moneyRange(v.by.low < v.by.high ? v.by.low : v.by.high, v.by.low < v.by.high ? v.by.high : v.by.low); }
  if (v.kind === 'depends') { o.cheapestAtLowEnd = v.cheapIfLow; o.cheapestAtHighEnd = v.cheapIfHigh; }
  return o;
}

function describeItems(items) {
  if (items.length === 1) {
    const it = items[0];
    return `${it.units.toLocaleString('en-US')} ${TIER_LABEL[it.tier]} units${it.weight ? ` at ${weightWords(it.weight)}` : ''}`;
  }
  return `${items.reduce((a, it) => a + it.units, 0).toLocaleString('en-US')} units of ${items.length} products`;
}
function optionWords(o) {
  if (o.option === 'optimized') return `Amazon-optimized splits cost ${money(o.freight + o.other)} in freight${o.other ? ' and other costs' : ''}, no placement fee`;
  const fee = `${moneyRange(o.fee.low, o.fee.high)} in placement fees${o.fee.exact ? '' : ' (Amazon\'s range)'}`;
  const less = o.credit.high ? ` less ${moneyRange(o.credit.low, o.credit.high)} of credits` : '';
  return `${OPTION_SHORT[o.option]} cost ${fee}${less} plus ${money(o.freight + o.other)} freight${o.other ? ' and other costs' : ''} = ${moneyRange(o.total.low, o.total.high)}`;
}
function answerOf({ items, options, verdict, breakEven }) {
  const live = options.filter((o) => o.offered);
  const head = `For ${describeItems(items)}, ${live.map(optionWords).join('; ')}`;
  const off = options.filter((o) => !o.offered).map((o) => `${OPTION_SHORT[o.option]}: ${o.notOffered}`);
  const tail = off.length ? ` (${off.join(' ')})` : '';
  if (!verdict) return `For ${describeItems(items)}, none of the options asked for is offered.${tail}`;
  const name = (k) => OPTION_SHORT[k];
  if (verdict.kind === 'only') return `${head}; it is the only option here.${tail}`;
  if (verdict.kind === 'depends') {
    const be = breakEven.find((b) => b.option === verdict.cheapIfLow || b.option === verdict.cheapIfHigh);
    return `${head}; cheapest: it depends on the fee Send to Amazon shows. ${be ? be.words : `At the low end of Amazon's range ${name(verdict.cheapIfLow)} are cheaper; at the high end, ${name(verdict.cheapIfHigh)}.`}${tail}`;
  }
  const lo = verdict.by.low < verdict.by.high ? verdict.by.low : verdict.by.high;
  const hi = verdict.by.low < verdict.by.high ? verdict.by.high : verdict.by.low;
  const how = verdict.kind === 'both-ends' ? ' at both ends of Amazon\'s fee range' : verdict.kind === 'certain' ? ' wherever the fee falls in Amazon\'s range' : '';
  return `${head}; cheapest: ${name(verdict.option)}, by ${moneyRange(lo, hi)}${how}.${tail}`;
}

// The send-in worksheet: one row per product and option, then one per option. Text cells that a
// spreadsheet would read as a formula are quoted with a leading apostrophe.
function cell(v) {
  let s = String(v ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
function worksheet(items, options) {
  const rows = [['sku', 'units', 'size_tier', 'fee_row', 'shipping_weight', 'option', 'offered', 'fee_per_unit_low', 'fee_per_unit_high', 'fee_low', 'fee_high', 'freight', 'other', 'total_low', 'total_high']];
  const cents = (c) => (Number(c) / 100).toFixed(2);
  for (const o of options) {
    items.forEach((it, i) => {
      const r = o.perItem[i].range;
      const per = o.fee.exact || !r ? null : r;
      rows.push([it.sku, it.units, it.tier, it.band ? `${it.band.label}, ${it.band.band}` : 'no fee', it.weight ? weightWords(it.weight) : '', o.option, o.offered ? 'yes' : 'no',
        per ? cents(per[0]) : '', per ? cents(per[1]) : '', per ? cents(BigInt(it.units) * BigInt(per[0])) : '', per ? cents(BigInt(it.units) * BigInt(per[1])) : '', '', '', '', '']);
    });
    rows.push(['(option total)', items.reduce((a, it) => a + it.units, 0), '', '', '', o.option, o.offered ? 'yes' : 'no', '', '', cents(o.fee.low), cents(o.fee.high), cents(o.freight), cents(o.other), cents(o.total.low), cents(o.total.high)]);
  }
  return rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
}

// ---------- the rate table ----------

export function rates(data, { tier, weight, weightUnit = 'lb' } = {}) {
  const fmt = (r, kind) => ({
    row: r.row, label: r.label, band: r.band, minimal: perUnitWords(r.minimal), partial: r.partial ? perUnitWords(r.partial) : kind === 'standard' ? 'Not offered' : null, optimized: 'No fee',
  });
  const table = [...data.placement.standard.map((r) => fmt(r, 'standard')), ...data.placement.bulky.map((r) => fmt(r, 'bulky'))];
  let match = null;
  if (tier !== undefined) {
    if (!TIERS.includes(tier)) fail(`tier is one of ${TIERS.join(', ')}.`, 'tier');
    if (!rowOf(tier)) match = { tier, fee: 'No placement fee', words: data.placement.quotes.extraLarge };
    else {
      if (weight === undefined) fail('weight is the shipping weight for that tier.', 'weight');
      const w = toMilliOz(weight, weightUnit);
      const b = feeBand(data, tier, w);
      if (!b) fail(`${weightWords(w)} is over what Amazon's ${TIER_LABEL[tier]} rows cover.`, 'weight');
      const d = defectBand(data, tier, w);
      match = {
        tier, row: `${b.label}, ${b.band}`, minimal: perUnitWords(b.minimal), partial: b.partial ? perUnitWords(b.partial) : 'Not offered for standard-size', optimized: 'No fee', defect: d ? money(d.fee) : null,
        words: `Amazon's inbound placement fee for ${TIER_LABEL[tier]} at ${weightWords(w)} (${b.band}) is ${perUnitWords(b.minimal)} a unit on minimal splits${b.partial ? `, ${perUnitWords(b.partial)} on partial splits` : ''} and no fee on Amazon-optimized splits.`,
      };
    }
  }
  return {
    answer: match ? match.words : `Amazon publishes the inbound placement fee as ranges per unit: ${perUnitWords(data.placement.standard[0].minimal)} for small standard up to ${perUnitWords(data.placement.bulky.at(-1).minimal)} for large/extra-large bulky over 42 lb on minimal splits; Amazon-optimized splits have no fee.`,
    match, table, readOn: data.readOn, example: data.placement.example, notes: [data.placement.quotes.ranges, data.placement.quotes.extraLarge, data.changes2027.placement],
  };
}

// ---------- AWD instead of the placement fee ----------

// AWD's cost per unit for a carton that waits `months` in AWD and is then sent to FBA, against the
// placement fee it avoids. Amazon: "AWD pricing covers FBA inbound placement". Freight into AWD is yours.
export function awd(data, { unitsPerCarton, cubicFeet, months = 1, region = 'east', rate = 'base', date, placementFeePerUnit, tier, weight, weightUnit = 'lb' } = {}, { today } = {}) {
  const day = date ?? today;
  if (!isDay(day)) fail('date is a date written YYYY-MM-DD.', 'date');
  if (!Number.isInteger(unitsPerCarton) || unitsPerCarton < 1 || unitsPerCarton > 10_000) fail('unitsPerCarton is a whole number from 1 to 10,000.', 'unitsPerCarton');
  const cf = toScaled(cubicFeet, 3, 'cubicFeet', 'the carton\'s cubic feet');
  if (!Number.isInteger(months) || months < 0 || months > LIMITS.months) fail(`months is a whole number from 0 to ${LIMITS.months}.`, 'months');
  if (!['east', 'west'].includes(region)) fail('region is east or west.', 'region');
  if (!['base', 'smart', 'managed'].includes(rate)) fail('rate is base, smart or managed.', 'rate');
  const set = day >= data.awd.from20270201.from ? data.awd.from20270201 : data.awd.current;
  const disc = rate === 'smart' ? data.awd.discounts.smartStorage : rate === 'managed' ? data.awd.discounts.amazonManaged : 0;
  // Everything per carton in 1/100,000 of a cent: cubic feet are thousandths, percents are tenths.
  const S = 100_000n;
  const storage = BigInt(set.storage[region]) * BigInt(cf) * BigInt(months) * BigInt(1000 - disc * 10) / 1000n * S / 1000n;
  const transportRate = rate === 'managed' && set.transportManaged ? set.transportManaged : set.transportPerCuFt;
  const transport = BigInt(transportRate) * BigInt(cf) * BigInt(1000 + Math.round(set.surchargePercent * 10)) / 1000n * S / 1000n;
  const processing = BigInt(set.inboundPerBox + set.outboundPerBox) * S;
  const perCarton = storage + transport + processing;
  const per = (x) => (x + (BigInt(unitsPerCarton) * S) / 2n) / (BigInt(unitsPerCarton) * S); // round half up to a cent
  const perUnit = per(perCarton);
  let fee = null;
  if (placementFeePerUnit !== undefined) { const c = toCents(placementFeePerUnit, 'placementFeePerUnit'); fee = { low: c, high: c, from: 'given' }; }
  else if (tier !== undefined) {
    const r = rates(data, { tier, weight, weightUnit }).match;
    const b = rowOf(tier) ? feeBand(data, tier, toMilliOz(weight, weightUnit)) : null;
    fee = b ? { low: b.minimal[0], high: b.minimal[1], from: r.row } : { low: 0, high: 0, from: 'no fee' };
  }
  // Months of AWD storage that cost one unit's placement fee, after processing and transport.
  const fixedPerUnit = per(transport + processing);
  const storagePerMonth = BigInt(set.storage[region]) * BigInt(cf) * BigInt(1000 - disc * 10) / 1000n * S / 1000n;
  const monthsFor = (c) => {
    const room = BigInt(c) * BigInt(unitsPerCarton) * S - transport - processing;
    return room < 0n ? null : Number(room / storagePerMonth);
  };
  const words = fee
    ? `AWD costs ${money(perUnit)} a unit for a carton of ${unitsPerCarton.toLocaleString('en-US')} at ${(cf / 1000).toString()} cu ft held ${plural(months, 'month')} (${money(fixedPerUnit)} of it processing and transport to FBA), against a minimal-split placement fee of ${moneyRange(fee.low, fee.high)} a unit; ${perUnit <= BigInt(fee.low) ? 'AWD is cheaper across that range' : perUnit > BigInt(fee.high) ? 'paying the placement fee is cheaper across that range' : 'which is cheaper depends where in the range your fee falls'}. Freight into AWD is not included.`
    : `AWD costs ${money(perUnit)} a unit for a carton of ${unitsPerCarton.toLocaleString('en-US')} at ${(cf / 1000).toString()} cu ft held ${plural(months, 'month')}; freight into AWD is not included.`;
  return {
    answer: words, perUnit: money(perUnit), perCarton: money((perCarton + S / 2n) / S), feeSet: set === data.awd.current ? `AWD fees until ${longDate(data.awd.current.until)}` : `AWD fees from ${longDate(set.from)}`,
    parts: { processing: money((processing + S / 2n) / S), transport: money((transport + S / 2n) / S), storage: money((storage + S / 2n) / S) },
    placementFee: fee ? { range: moneyRange(fee.low, fee.high), row: fee.from } : null,
    breakEvenMonths: fee ? { low: monthsFor(fee.low), high: monthsFor(fee.high) } : null,
    notes: [data.awd.coversPlacement, ...(set.surchargePercent ? [`Transport includes the ${set.surchargePercent}% fuel and logistics surcharge (${data.awd.from20270201.surchargeQuote})`] : []), `Storage: ${money(set.storage[region])} per cubic foot a month (${data.awd.storageRegions[region]})${disc ? `, less ${disc}%` : ''}.`],
  };
}
