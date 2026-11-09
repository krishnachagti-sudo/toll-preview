// Landed cost allocator: spread a shipment's freight, duty, broker and other invoices across its PO
// lines and give the landed cost per unit of every SKU. Pure arithmetic on what the user enters: no
// rates, no data files. The server and the page load this same file, so it imports nothing.
//
// Money is kept in integers: product cost in 1/10,000 of a currency unit (unit prices may have four
// decimals), charges and their shares in cents. Each charge is split over the lines by the largest
// remainder method, so the line shares add back to the invoice exactly. Shares use BigInt, since a
// charge in cents times a basis in milligrams or cubic millimetres can pass 2^53.

export class LandedError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'LandedError';
    this.field = field;
  }
}

export const LIMITS = { lines: 2000, charges: 40, skuChars: 80, textChars: 200, csvChars: 400_000, qty: 10_000_000, unitCost: 1_000_000, amount: 100_000_000, lineValue: 1_000_000_000 };
export const KINDS = ['freight', 'duty', 'brokerage', 'insurance', 'fees', 'discount', 'other'];
export const BASES = ['value', 'weight', 'volume', 'quantity', 'equal', 'specific', 'mixed'];
// The bases a mixed charge may combine, and the ones the side-by-side comparison runs.
export const MIX_BASES = ['value', 'weight', 'volume', 'quantity'];
export const KIND_WORDS = { freight: 'Freight', duty: 'Duty', brokerage: 'Brokerage', insurance: 'Insurance', fees: 'Fees', discount: 'Discount', other: 'Other' };
export const BASIS_WORDS = { value: 'by value', weight: 'by weight', volume: 'by volume (CBM)', quantity: 'by units', equal: 'equally per line', specific: 'as given per SKU', mixed: 'by a mix' };
// Which basis suits which charge, as the guides explain (a default for the page, never forced).
export const DEFAULT_BASIS = { freight: 'volume', duty: 'value', brokerage: 'value', insurance: 'value', fees: 'value', discount: 'value', other: 'value' };

const DIG4 = 10_000;
const MG_PER_KG = 1_000_000;
const MG_PER_LB = 453_592.37;
const MM3_PER_CBM = 1_000_000_000;

// ---------- reading numbers ----------

const cleanNum = (v) => (typeof v === 'string' ? v.replace(/[$€£,\s]/g, '') : v);
function num(v, field, { min = 0, max = Infinity, allowNegative = false, label = field } = {}) {
  const raw = cleanNum(v);
  if (raw === '' || raw === null || raw === undefined) throw new LandedError(`${label} is missing.`, field);
  const n = typeof raw === 'number' ? raw : (/^-?\d+(?:\.\d+)?$/.test(raw) ? Number(raw) : NaN);
  if (!Number.isFinite(n)) throw new LandedError(`${label} must be a number, such as 12.50; "${String(v).slice(0, 20)}" is not.`, field);
  if (!allowNegative && n < min) throw new LandedError(`${label} must be ${min === 0 ? 'zero or more' : `at least ${min}`}.`, field);
  if (Math.abs(n) > max) throw new LandedError(`${label} must be at most ${max.toLocaleString('en-US')}.`, field);
  return n;
}
// Exact decimal to integer: "4.125" with 4 places -> 41250. Refuses more places than allowed.
function scaled(v, places, field, label, opts = {}) {
  const n = num(v, field, { label, ...opts });
  const text = typeof cleanNum(v) === 'string' ? cleanNum(v) : String(n);
  const frac = /\.(\d+)$/.exec(text.replace(/e.*$/i, ''));
  if (frac && frac[1].replace(/0+$/, '').length > places) throw new LandedError(`${label} has more than ${places} decimal places.`, field);
  return Math.round(n * 10 ** places);
}
const cents = (v, field, label, opts) => scaled(v, 2, field, label, opts);

// ---------- formatting ----------

export function currencyLabel(code) {
  return code === 'USD' ? '$' : `${code} `;
}
const groupDigits = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// An integer amount in units of 10^-places, as text with exactly `places` decimals.
function fixed(intVal, places) {
  const neg = intVal < 0;
  const s = String(neg ? -intVal : intVal).padStart(places + 1, '0');
  const whole = s.slice(0, s.length - places);
  const frac = s.slice(s.length - places);
  return `${neg ? '-' : ''}${groupDigits(whole)}${places ? `.${frac}` : ''}`;
}
export const money2 = (c, cur = 'USD') => (c < 0 ? `-${currencyLabel(cur)}${fixed(-c, 2)}` : `${currencyLabel(cur)}${fixed(c, 2)}`);
export const money4 = (d, cur = 'USD') => (d < 0 ? `-${currencyLabel(cur)}${fixed(-d, 4)}` : `${currencyLabel(cur)}${fixed(d, 4)}`);
// An amount in 1/10,000: two decimals when it is whole cents, four when it is not.
export const moneyAuto = (d, cur = 'USD') => (d % 100 === 0 ? money2(d / 100, cur) : money4(d, cur));
const plain = (intVal, places) => fixed(intVal, places).replace(/,/g, '');
const pct = (part, whole) => (whole ? `${(Math.round((part / whole) * 1000) / 10).toFixed(1)}%` : '0.0%');
// Half-up integer division for BigInt (a >= 0, b > 0).
const divRound = (a, b) => (a * 2n + b) / (2n * b);
const divRoundSigned = (a, b) => (a < 0n ? -divRound(-a, b) : divRound(a, b));
const qtyText = (n) => n.toLocaleString('en-US');

// ---------- the core split ----------

// Splits `total` (integer, may be negative) over `weights` (non-negative integers or BigInts) by the
// largest remainder: floor shares first, then the leftover units one each to the largest remainders,
// ties to the larger weight, then to the earlier line. Returns integers that sum exactly to total.
export function largestRemainder(total, weights) {
  const W = weights.map((w) => BigInt(w));
  const sum = W.reduce((a, b) => a + b, 0n);
  if (sum === 0n) throw new Error('largestRemainder: weights sum to zero');
  const neg = total < 0;
  const T = BigInt(neg ? -total : total);
  const floors = W.map((w) => (T * w) / sum);
  const rems = W.map((w, i) => (T * w) - floors[i] * sum);
  let left = Number(T - floors.reduce((a, b) => a + b, 0n));
  const order = W.map((_, i) => i).sort((a, b) => (rems[b] > rems[a] ? 1 : rems[b] < rems[a] ? -1 : W[b] > W[a] ? 1 : W[b] < W[a] ? -1 : a - b));
  const out = floors.map(Number);
  for (const i of order) {
    if (left <= 0) break;
    out[i] += 1;
    left -= 1;
  }
  return neg ? out.map((x) => -x) : out;
}

// ---------- reading lines ----------

function readDims(text, field) {
  const m = /^\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*[x×*]\s*(\d+(?:\.\d+)?)\s*(?:cm)?\s*$/i.exec(String(text));
  if (!m) throw new LandedError('unitCm is length x width x height of one unit in centimetres, such as "30 x 20 x 15".', field);
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

// One PO line, checked, with its bases as integers. index is its place in the shipment.
function readLine(raw, i) {
  const f = (k) => `lines.${i}.${k}`;
  const sku = String(raw.sku ?? '').trim();
  if (!sku) throw new LandedError(`Line ${i + 1} has no SKU.`, f('sku'));
  if (sku.length > LIMITS.skuChars) throw new LandedError(`Line ${i + 1}: the SKU is over ${LIMITS.skuChars} characters.`, f('sku'));
  const qty = num(raw.qty, f('qty'), { label: `${sku}: quantity`, max: LIMITS.qty });
  if (!Number.isInteger(qty) || qty < 1) throw new LandedError(`${sku}: quantity must be a whole number of units, 1 or more.`, f('qty'));
  const unit4 = scaled(raw.unitCost, 4, f('unitCost'), `${sku}: unit cost`, { max: LIMITS.unitCost });
  const product4 = unit4 * qty;
  if (product4 > LIMITS.lineValue * DIG4) throw new LandedError(`${sku}: the line is worth over ${LIMITS.lineValue.toLocaleString('en-US')}; split it.`, f('qty'));
  const value4 = raw.value !== undefined && raw.value !== null && raw.value !== '' ? scaled(raw.value, 4, f('value'), `${sku}: value`, { max: LIMITS.lineValue }) : product4;

  const given = (k) => raw[k] !== undefined && raw[k] !== null && raw[k] !== '';
  const weightKeys = ['weightKg', 'unitWeightKg', 'weightLb', 'unitWeightLb'].filter(given);
  if (weightKeys.length > 1) throw new LandedError(`${sku}: give one weight (${weightKeys.join(' or ')}), not several.`, f(weightKeys[1]));
  let weightMg = null;
  if (weightKeys.length) {
    const k = weightKeys[0];
    const w = num(raw[k], f(k), { label: `${sku}: weight`, max: 1e7 });
    const perMg = k.endsWith('Kg') ? MG_PER_KG : MG_PER_LB;
    weightMg = Math.round(w * perMg * (k.startsWith('unit') ? qty : 1));
  }
  const volKeys = ['cbm', 'unitCbm', 'unitCm'].filter(given);
  if (volKeys.length > 1) throw new LandedError(`${sku}: give one volume (${volKeys.join(' or ')}), not several.`, f(volKeys[1]));
  let volumeMm3 = null;
  if (volKeys.length) {
    const k = volKeys[0];
    if (k === 'unitCm') {
      const [l, w, h] = readDims(raw.unitCm, f(k));
      volumeMm3 = Math.round(l * w * h * 1000 * qty);
    } else {
      const v = num(raw[k], f(k), { label: `${sku}: CBM`, max: 1e5 });
      volumeMm3 = Math.round(v * MM3_PER_CBM * (k === 'unitCbm' ? qty : 1));
    }
  }
  let onHand = null;
  if (given('onHand')) {
    onHand = num(raw.onHand, f('onHand'), { label: `${sku}: units on hand` });
    if (!Number.isInteger(onHand) || onHand > qty) throw new LandedError(`${sku}: units on hand must be a whole number from 0 to ${qtyText(qty)}.`, f('onHand'));
  }
  const title = raw.title === undefined || raw.title === null ? '' : String(raw.title).trim().slice(0, LIMITS.textChars);
  return { index: i, sku, title, qty, unit4, product4, value4, weightMg, volumeMm3, onHand };
}

// ---------- reading charges ----------

function basisWeights(lines, basis, field, chargeName) {
  const missing = (k) => lines.filter((l) => l[k] === null).map((l) => l.sku);
  if (basis === 'value') return lines.map((l) => l.value4);
  if (basis === 'quantity') return lines.map((l) => l.qty);
  if (basis === 'equal') return lines.map(() => 1);
  const key = basis === 'weight' ? 'weightMg' : 'volumeMm3';
  const gaps = missing(key);
  if (gaps.length) throw new LandedError(`${chargeName} is split ${BASIS_WORDS[basis]}, but ${gaps.length === 1 ? 'this line has' : 'these lines have'} no ${basis === 'weight' ? 'weight' : 'volume'}: ${gaps.slice(0, 8).join(', ')}${gaps.length > 8 ? ` and ${gaps.length - 8} more` : ''}. Add it, or pick another basis.`, field);
  return lines.map((l) => l[key]);
}

// Shares of one charge (integer cents, may be negative) over all lines, for one basis. Lines outside
// applyTo get nothing.
function shareBy(lines, amount, basis, { applyTo, field, name }) {
  const inScope = lines.filter((l) => !applyTo || applyTo.has(l.sku));
  const weights = basisWeights(inScope, basis, field, name);
  if (weights.every((w) => w === 0)) throw new LandedError(`${name}: every line it applies to has a ${basis === 'value' ? 'value' : basis} of zero, so it cannot be split ${BASIS_WORDS[basis]}.`, field);
  const parts = largestRemainder(amount, weights);
  const out = lines.map(() => 0);
  inScope.forEach((l, j) => { out[l.index] = parts[j]; });
  return out;
}

function readCharge(raw, i, lines, bySku) {
  const f = (k) => `charges.${i}.${k}`;
  const kind = raw.kind ?? 'other';
  if (!KINDS.includes(kind)) throw new LandedError(`Charge ${i + 1}: kind must be one of ${KINDS.join(', ')}.`, f('kind'));
  const name = String(raw.name ?? '').trim().slice(0, 60) || `${KIND_WORDS[kind]}${i ? ` ${i + 1}` : ''}`;
  const basis = raw.basis ?? DEFAULT_BASIS[kind];
  if (!BASES.includes(basis)) throw new LandedError(`${name}: basis must be one of ${BASES.join(', ')}.`, f('basis'));
  let applyTo = null;
  if (raw.applyTo !== undefined && raw.applyTo !== null) {
    const list = (Array.isArray(raw.applyTo) ? raw.applyTo : String(raw.applyTo).split(/[|,;]/)).map((s) => String(s).trim()).filter(Boolean);
    if (!list.length) throw new LandedError(`${name}: applyTo names no SKU.`, f('applyTo'));
    const unknown = list.filter((s) => !bySku.has(s));
    if (unknown.length) throw new LandedError(`${name}: applyTo names SKUs not in the shipment: ${unknown.slice(0, 8).join(', ')}.`, f('applyTo'));
    applyTo = new Set(list);
  }
  let amount;
  let shares;
  let mix = null;
  if (basis === 'specific') {
    const given = raw.amounts && typeof raw.amounts === 'object' ? raw.amounts : null;
    if (!given || !Object.keys(given).length) throw new LandedError(`${name}: a charge split as given per SKU needs amounts, such as { "SKU-A": 120.50 }.`, f('amounts'));
    shares = lines.map(() => 0);
    for (const [sku, v] of Object.entries(given)) {
      if (!bySku.has(sku.trim())) throw new LandedError(`${name}: amounts names a SKU not in the shipment: ${sku.slice(0, 40)}.`, f('amounts'));
      shares[bySku.get(sku.trim()).index] = cents(v, f('amounts'), `${name} for ${sku}`, { allowNegative: true, max: LIMITS.amount });
    }
    const sum = shares.reduce((a, b) => a + b, 0);
    if (raw.amount !== undefined && raw.amount !== null && raw.amount !== '') {
      amount = cents(raw.amount, f('amount'), `${name}: amount`, { allowNegative: true, max: LIMITS.amount });
      if (amount !== sum) throw new LandedError(`${name}: the amounts per SKU add up to ${money2(sum)}, not the invoice's ${money2(amount)}.`, f('amounts'));
    } else amount = sum;
  } else {
    amount = cents(raw.amount, f('amount'), `${name}: amount`, { allowNegative: true, max: LIMITS.amount });
    if (basis === 'mixed') {
      const m = raw.mix && typeof raw.mix === 'object' ? raw.mix : null;
      const keys = m ? Object.keys(m).filter((k) => m[k] !== undefined && m[k] !== null && m[k] !== '' && Number(cleanNum(m[k])) !== 0) : [];
      if (!keys.length) throw new LandedError(`${name}: a mixed basis needs percentages, such as { "weight": 50, "value": 50 }.`, f('mix'));
      const bad = keys.find((k) => !MIX_BASES.includes(k));
      if (bad) throw new LandedError(`${name}: a mix may use ${MIX_BASES.join(', ')}; "${bad}" is not one of them.`, f('mix'));
      const p = keys.map((k) => scaled(m[k], 2, f('mix'), `${name}: ${k} percent`, { max: 100 }));
      if (p.reduce((a, b) => a + b, 0) !== 10_000) throw new LandedError(`${name}: the mix percentages must add up to 100.`, f('mix'));
      // The charge is first cut into one part per basis (largest remainder on the percentages),
      // then each part is split over the lines by its basis.
      const parts = largestRemainder(amount, p);
      mix = keys.map((k, j) => ({ basis: k, percent: p[j] / 100, amount: parts[j] }));
      shares = lines.map(() => 0);
      for (const part of mix) {
        if (!part.amount) continue;
        const s = shareBy(lines, part.amount, part.basis, { applyTo, field: f('mix'), name });
        s.forEach((c, j) => { shares[j] += c; });
      }
    } else if (amount === 0) {
      shares = lines.map(() => 0);
    } else {
      shares = shareBy(lines, amount, basis, { applyTo, field: f('basis'), name });
    }
  }
  if (applyTo) shares.forEach((c, j) => { if (c && !applyTo.has(lines[j].sku)) throw new LandedError(`${name}: an amount is given for ${lines[j].sku}, which is not in applyTo.`, f('amounts')); });
  return { index: i, name, kind, basis, amount, shares, mix, applyTo: applyTo ? [...applyTo] : null, late: Boolean(raw.late) };
}

// ---------- the allocation ----------

const unitOf = (total4, qty) => divRoundSigned(BigInt(total4), BigInt(qty)); // 1/10,000 per unit
const to2 = (d4) => Number(divRoundSigned(BigInt(d4), 100n)); // cents, half up

export function checkInput(input) {
  if (!input || typeof input !== 'object') throw new LandedError('Give the shipment as { lines, charges }.', 'lines');
  const rawLines = input.lines;
  if (!Array.isArray(rawLines) || !rawLines.length) throw new LandedError('Give at least one PO line: SKU, quantity and unit cost.', 'lines');
  if (rawLines.length > LIMITS.lines) throw new LandedError(`At most ${LIMITS.lines.toLocaleString('en-US')} lines in one shipment; split it.`, 'lines');
  const charges = input.charges ?? [];
  if (!Array.isArray(charges)) throw new LandedError('charges must be a list.', 'charges');
  if (charges.length > LIMITS.charges) throw new LandedError(`At most ${LIMITS.charges} charges in one shipment.`, 'charges');
  const currency = String(input.currency ?? 'USD').toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new LandedError('currency is a three-letter code such as USD.', 'currency');
  const policy = input.latePolicy ?? 'split';
  if (!['split', 'onhand'].includes(policy)) throw new LandedError('latePolicy is "split" (sold units\' share goes to a COGS variance) or "onhand" (the whole late amount goes into units still on hand).', 'latePolicy');
  const lines = rawLines.map(readLine);
  const bySku = new Map();
  for (const l of lines) {
    if (bySku.has(l.sku)) throw new LandedError(`SKU ${l.sku} is on two lines; put each SKU on one line.`, `lines.${l.index}.sku`);
    bySku.set(l.sku, l);
  }
  return { lines, bySku, currency, policy, rawCharges: charges };
}

// The allocation itself. Returns everything the page, the API and the files show.
export function allocate(input) {
  const { lines, bySku, currency, policy, rawCharges } = checkInput(input);
  const charges = rawCharges.map((c, i) => readCharge(c, i, lines, bySku));
  const m2 = (c) => money2(c, currency);
  const m4 = (d) => money4(d, currency);
  const ma = (d) => moneyAuto(d, currency);
  const anyLate = charges.some((c) => c.late);

  const rows = lines.map((l) => {
    const at = (list) => list.reduce((a, c) => a + c.shares[l.index], 0);
    const extras = at(charges);
    const lateCents = at(charges.filter((c) => c.late));
    const total4 = l.product4 + extras * 100;
    const unit4 = Number(unitOf(total4, l.qty));
    const unit2 = to2(unit4);
    const row = {
      sku: l.sku,
      title: l.title,
      qty: l.qty,
      unitCost: ma(l.unit4),
      productCost: ma(l.product4),
      byCharge: charges.map((c) => m2(c.shares[l.index])),
      byChargeCents: charges.map((c) => c.shares[l.index]),
      extras: m2(extras),
      extrasCents: extras,
      landedTotal: ma(total4),
      landedTotal4: total4,
      landedUnit: m4(unit4),
      landedUnit4: unit4,
      landedUnit2: plain(unit2, 2),
      uplift: pct(extras * 100, l.product4),
      // Shopify keeps 2 decimals: qty x the rounded cost against the exact line total.
      shopifyDrift4: unit2 * 100 * l.qty - total4,
      shopifyDrift: ma(unit2 * 100 * l.qty - total4),
    };
    if (anyLate) {
      // The late charges' share: on-hand units take theirs (or all of it, under "onhand"); the rest is
      // a COGS variance for units already sold. The units' cost before the late charges is the base.
      const onHand = l.onHand ?? l.qty;
      let onHandPart;
      if (!lateCents) onHandPart = 0;
      else if (policy === 'onhand') onHandPart = onHand > 0 ? lateCents : 0;
      else if (onHand === l.qty) onHandPart = lateCents;
      else if (onHand === 0) onHandPart = 0;
      else onHandPart = largestRemainder(lateCents, [onHand, l.qty - onHand])[0];
      const variance = lateCents - onHandPart;
      const before4 = total4 - lateCents * 100;
      const unitBefore4 = Number(unitOf(before4, l.qty));
      // On-hand units after: their share of the cost before, plus their late part, per unit.
      const unitAfter4 = onHand > 0 ? Number(divRoundSigned(BigInt(before4) * BigInt(onHand) + BigInt(onHandPart * 100) * BigInt(l.qty), BigInt(l.qty) * BigInt(onHand))) : null;
      row.late = {
        onHand,
        onHandAssumed: l.onHand === null,
        lateShare: m2(lateCents),
        lateCents,
        toOnHand: m2(onHandPart),
        toOnHandCents: onHandPart,
        cogsVariance: m2(variance),
        cogsVarianceCents: variance,
        unitBefore: m4(unitBefore4),
        unitBefore4,
        unitOnHandAfter: unitAfter4 === null ? null : m4(unitAfter4),
        unitOnHandAfter4: unitAfter4,
        shopifyCostAfter: unitAfter4 === null ? null : plain(to2(unitAfter4), 2),
      };
    }
    return row;
  });

  const productTotal4 = lines.reduce((a, l) => a + l.product4, 0);
  const chargeTotal = charges.reduce((a, c) => a + c.amount, 0);
  const landedTotal4 = rows.reduce((a, r) => a + r.landedTotal4, 0);
  const chargeList = charges.map((c) => ({
    name: c.name,
    kind: c.kind,
    basis: c.basis,
    basisWords: c.basis === 'mixed' ? `by a mix: ${c.mix.map((x) => `${x.percent}% ${x.basis}`).join(', ')}` : BASIS_WORDS[c.basis],
    mix: c.mix ? c.mix.map((x) => ({ ...x, amount: m2(x.amount) })) : null,
    applyTo: c.applyTo,
    late: c.late,
    amount: m2(c.amount),
    amountCents: c.amount,
    allocated: m2(c.shares.reduce((a, b) => a + b, 0)),
    reconciles: c.shares.reduce((a, b) => a + b, 0) === c.amount,
    share: pct(c.amount * 100, productTotal4),
  }));
  const summary = {
    shipment: input.shipment ? String(input.shipment).trim().slice(0, 80) : null,
    currency,
    lines: lines.length,
    units: lines.reduce((a, l) => a + l.qty, 0),
    productTotal: ma(productTotal4),
    chargeTotal: m2(chargeTotal),
    landedTotal: ma(landedTotal4),
    uplift: pct(chargeTotal * 100, productTotal4),
    // Every charge's shares add back to it, and the lines add back to product + charges.
    reconciles: chargeList.every((c) => c.reconciles) && landedTotal4 === productTotal4 + chargeTotal * 100,
    shopifyDrift: ma(rows.reduce((a, r) => a + r.shopifyDrift4, 0)),
  };
  const result = { summary, charges: chargeList, rows };
  if (anyLate) {
    const variance = rows.reduce((a, r) => a + r.late.cogsVarianceCents, 0);
    const toOnHand = rows.reduce((a, r) => a + r.late.toOnHandCents, 0);
    result.late = {
      policy,
      charges: chargeList.filter((c) => c.late).map((c) => c.name),
      total: m2(variance + toOnHand),
      toOnHand: m2(toOnHand),
      cogsVariance: m2(variance),
      assumedOnHand: rows.filter((r) => r.late.onHandAssumed).map((r) => r.sku),
    };
  }
  result.compare = compareBases(lines, charges, input, currency);
  result.steps = stepsFor(lines[0], charges, rows[0], currency);
  result.answer = answerOf(result);
  return result;
}

// The freight charges run through every basis the lines have data for, side by side, with the other
// charges as entered: what each SKU's landed unit cost would be. Null when there is no freight.
export function compareBases(lines, charges, input, currency) {
  const freight = charges.filter((c) => c.kind === 'freight' && c.basis !== 'specific');
  if (!freight.length) return null;
  const others = charges.filter((c) => !freight.includes(c));
  const available = MIX_BASES.filter((b) => (b === 'weight' ? lines.every((l) => l.weightMg !== null) : b === 'volume' ? lines.every((l) => l.volumeMm3 !== null) : true));
  const base = lines.map((l) => l.product4 + others.reduce((a, c) => a + c.shares[l.index], 0) * 100);
  const columns = available.map((b) => {
    const extra = lines.map(() => 0);
    for (const c of freight) {
      if (!c.amount) continue;
      const s = shareBy(lines, c.amount, b, { applyTo: c.applyTo ? new Set(c.applyTo) : null, field: 'charges', name: c.name });
      s.forEach((x, j) => { extra[j] += x; });
    }
    return { basis: b, words: BASIS_WORDS[b], units: lines.map((l, j) => Number(unitOf(base[j] + extra[j] * 100, l.qty))), freight: extra };
  });
  const chosen = freight.map((c) => (c.basis === 'mixed' ? 'mixed' : c.basis));
  return {
    charges: freight.map((c) => c.name),
    chosen: [...new Set(chosen)].join(', '),
    bases: available,
    rows: lines.map((l, j) => ({ sku: l.sku, qty: l.qty, byBasis: Object.fromEntries(columns.map((c) => [c.basis, money4(c.units[j], currency)])), freightBy: Object.fromEntries(columns.map((c) => [c.basis, money2(c.freight[j], currency)])) })),
    units4: Object.fromEntries(columns.map((c) => [c.basis, c.units])),
  };
}

// The arithmetic for one line, written out, so anyone can check it by hand.
function stepsFor(line, charges, row, currency) {
  const m2 = (c) => money2(c, currency);
  const out = [`${line.sku}: ${qtyText(line.qty)} units x ${moneyAuto(line.unit4, currency)} = ${moneyAuto(line.product4, currency)} product cost.`];
  for (const c of charges) {
    const share = c.shares[line.index];
    if (c.basis === 'specific') out.push(`${c.name}: ${m2(share)} as given for ${line.sku}.`);
    else if (c.basis === 'mixed') out.push(`${c.name}: ${m2(c.amount)} cut ${c.mix.map((x) => `${x.percent}% ${x.basis}`).join(' and ')}, each part split by its basis: ${m2(share)} to ${line.sku}.`);
    else if (c.applyTo && !c.applyTo.includes(line.sku)) out.push(`${c.name}: does not apply to ${line.sku}.`);
    else out.push(`${c.name}: ${m2(c.amount)} ${BASIS_WORDS[c.basis]}, ${line.sku}'s share ${m2(share)} (rounded to the cent; the leftover cents go to the largest remainders so the lines add back to ${m2(c.amount)}).`);
  }
  out.push(`Landed: ${row.productCost} + ${row.extras} = ${row.landedTotal}; / ${qtyText(line.qty)} units = ${row.landedUnit} a unit (${currencyLabel(currency)}${row.landedUnit2} in a 2-decimal field).`);
  return out;
}

function answerOf(r) {
  const first = r.rows.slice(0, 3).map((x) => `${x.landedUnit} for ${x.sku}`);
  const more = r.rows.length > 3 ? ` and ${r.rows.length - 3} more SKU${r.rows.length - 3 === 1 ? '' : 's'}` : '';
  const base = `Landed cost per unit is ${first.join(', ')}${more}: ${r.summary.chargeTotal} of charges on ${r.summary.productTotal} of goods (${r.summary.uplift}), every charge split to the cent and added back to its invoice.`;
  if (!r.late) return base;
  const onHand = r.rows.reduce((a, x) => a + x.late.onHand, 0);
  return `${base} The late ${r.late.total} adds ${r.late.toOnHand} to the ${qtyText(onHand)} units still on hand and ${r.late.cogsVariance} to cost of goods sold for units already sold.`;
}

// ---------- reading CSV ----------

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const s = String(text).replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (quoted) {
      if (ch === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

// A cell as a spreadsheet should read it: text that would start a formula is prefixed with ' .
export function csvCell(v) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const csvLine = (cells) => cells.map(csvCell).join(',');

// Columns a PO-line CSV may use, by header (case and punctuation ignored).
const LINE_HEADERS = {
  sku: ['sku', 'variantsku', 'item', 'itemcode', 'partnumber', 'productcode'],
  title: ['title', 'name', 'description', 'product'],
  qty: ['qty', 'quantity', 'units', 'qtyreceived', 'receivedqty'],
  unitCost: ['unitcost', 'cost', 'unitprice', 'price', 'costperunit', 'fobunitprice'],
  value: ['value', 'customsvalue', 'linevalue', 'enteredvalue'],
  weightKg: ['weightkg', 'grossweightkg', 'kg', 'linekg', 'weight'],
  unitWeightKg: ['unitweightkg', 'unitkg'],
  weightLb: ['weightlb', 'weightlbs', 'lb', 'lbs'],
  unitWeightLb: ['unitweightlb', 'unitlb', 'unitlbs'],
  cbm: ['cbm', 'volumecbm', 'm3', 'linecbm', 'volume'],
  unitCbm: ['unitcbm', 'cbmperunit'],
  unitCm: ['unitcm', 'dimensionscm', 'dimscm', 'lxwxhcm'],
  onHand: ['onhand', 'available', 'instock', 'unitsonhand'],
};
const norm = (h) => String(h).toLowerCase().replace(/\([^)]*\)/g, (m) => m.replace(/[()]/g, '')).replace(/[^a-z0-9]/g, '');

// PO lines from a CSV with a header row. Unknown columns are ignored and named in `ignored`.
export function readLinesCsv(text) {
  if (String(text).length > LIMITS.csvChars) throw new LandedError(`The CSV is over ${LIMITS.csvChars.toLocaleString('en-US')} characters; split it.`, 'linesCsv');
  const rows = parseCsv(text);
  if (rows.length < 2) throw new LandedError('The CSV needs a header row and at least one line.', 'linesCsv');
  const head = rows[0].map(norm);
  const col = {};
  const ignored = [];
  head.forEach((h, j) => {
    const key = Object.keys(LINE_HEADERS).find((k) => LINE_HEADERS[k].includes(h));
    if (key && col[key] === undefined) col[key] = j;
    else ignored.push(rows[0][j]);
  });
  for (const k of ['sku', 'qty', 'unitCost']) {
    if (col[k] === undefined) throw new LandedError(`The CSV has no ${k === 'sku' ? 'SKU' : k === 'qty' ? 'quantity' : 'unit cost'} column. Name the columns SKU, Qty, Unit cost (and Weight kg, CBM if you have them).`, 'linesCsv');
  }
  if (rows.length - 1 > LIMITS.lines) throw new LandedError(`At most ${LIMITS.lines.toLocaleString('en-US')} lines in one shipment; split it.`, 'linesCsv');
  const lines = rows.slice(1).map((r) => {
    const o = {};
    for (const [k, j] of Object.entries(col)) if (r[j] !== undefined && r[j].trim() !== '') o[k] = r[j].trim();
    return o;
  });
  return { lines, ignored };
}

// ---------- files ----------

// The per-SKU CSV: one row per line with every charge, the landed total and unit cost.
export function resultCsv(r) {
  const head = ['sku', 'title', 'qty', 'unit_cost', 'product_cost', ...r.charges.map((c) => `${c.name} (${c.basisWords})`), 'charges_total', 'landed_total', 'landed_unit', 'landed_unit_2dp', 'shopify_rounding_difference'];
  if (r.late) head.push('on_hand', 'late_share', 'late_to_on_hand', 'late_cogs_variance', 'unit_before_late', 'unit_on_hand_after', 'shopify_cost_after');
  const n = (s) => (s === null || s === undefined ? '' : String(s).replace(/[^0-9.\-]/g, ''));
  const body = r.rows.map((x) => {
    const cells = [x.sku, x.title, x.qty, n(x.unitCost), n(x.productCost), ...x.byCharge.map(n), n(x.extras), n(x.landedTotal), n(x.landedUnit), x.landedUnit2, n(x.shopifyDrift)];
    if (r.late) cells.push(x.late.onHand, n(x.late.lateShare), n(x.late.toOnHand), n(x.late.cogsVariance), n(x.late.unitBefore), n(x.late.unitOnHandAfter), x.late.shopifyCostAfter ?? '');
    return csvLine(cells);
  });
  const totals = ['TOTAL', '', r.summary.units, '', n(r.summary.productTotal), ...r.charges.map((c) => n(c.allocated)), n(r.summary.chargeTotal), n(r.summary.landedTotal), '', '', n(r.summary.shopifyDrift)];
  if (r.late) totals.push('', n(r.late.total), n(r.late.toOnHand), n(r.late.cogsVariance), '', '', '');
  return [csvLine(head), ...body, csvLine(totals)].join('\r\n') + '\r\n';
}

const colName = (j) => { let s = ''; let n = j + 1; while (n) { const m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); } return s; };

// A spreadsheet (CSV that Excel and Google Sheets open with live formulas): the same shipment, each
// charge split with =amount*basis/SUM(basis). Spreadsheet rounding is not the cent-exact split, so
// the last row shows how far the rounded cents drift; the tool's own result is the exact one.
export function workbookCsv(input) {
  const { lines, rawCharges, currency } = checkInput(input);
  const charges = rawCharges.map((c, i) => readCharge(c, i, lines, new Map(lines.map((l) => [l.sku, l]))));
  const first = 3;
  const last = first + lines.length - 1;
  // Columns: A SKU, B Qty, C Unit cost, D Weight kg, E CBM, F Value, G Product cost, then one per charge.
  const fixedHead = ['SKU', 'Qty', 'Unit cost', 'Weight (kg)', 'CBM', 'Value', 'Product cost'];
  const chargeCol = (k) => colName(fixedHead.length + k);
  const landedCol = colName(fixedHead.length + charges.length);
  const unitCol = colName(fixedHead.length + charges.length + 1);
  const basisCol = { value: 'F', weight: 'D', volume: 'E', quantity: 'B' };
  const head = [...fixedHead, ...charges.map((c) => `${c.name} (${c.basis === 'mixed' ? 'mixed' : BASIS_WORDS[c.basis]})`), `Landed total (${currency})`, 'Landed per unit'];
  const amountsRow = ['Charge amounts', '', '', '', '', '', '', ...charges.map((c) => plain(c.amount, 2)), '', ''];
  const r4 = (v) => plain(v, 4);
  const shareFormula = (c, k, row) => {
    const amt = `${chargeCol(k)}$2`;
    const one = (b, part) => (b === 'equal' ? `${part}/${lines.length}` : `${part}*${basisCol[b]}${row}/SUM(${basisCol[b]}$${first}:${basisCol[b]}$${last})`);
    if (c.basis === 'specific' || (c.applyTo && c.basis === 'mixed')) return plain(c.shares[row - first], 2);
    if (c.applyTo) {
      // A charge for some SKUs only: the basis summed over those rows.
      const rowsIn = lines.filter((l) => c.applyTo.includes(l.sku)).map((l) => first + l.index);
      if (!rowsIn.includes(row)) return '0';
      const b = c.basis === 'mixed' ? null : c.basis;
      if (b === 'equal') return `=${amt}/${rowsIn.length}`;
      if (b) return `=${amt}*${basisCol[b]}${row}/(${rowsIn.map((x) => `${basisCol[b]}${x}`).join('+')})`;
    }
    if (c.basis === 'mixed') return `=${c.mix.map((x) => one(x.basis, `${amt}*${x.percent}/100`)).join('+')}`;
    return `=${one(c.basis, amt)}`;
  };
  const body = lines.map((l, j) => {
    const row = first + j;
    return [l.sku, String(l.qty), r4(l.unit4), l.weightMg === null ? '' : String(l.weightMg / MG_PER_KG), l.volumeMm3 === null ? '' : String(l.volumeMm3 / MM3_PER_CBM), r4(l.value4),
      `=B${row}*C${row}`, ...charges.map((c, k) => shareFormula(c, k, row)),
      `=G${row}${charges.length ? `+SUM(${chargeCol(0)}${row}:${chargeCol(charges.length - 1)}${row})` : ''}`, `=${landedCol}${row}/B${row}`];
  });
  const sumOf = (c) => `=SUM(${c}${first}:${c}${last})`;
  const totals = ['Total', sumOf('B'), '', sumOf('D'), sumOf('E'), sumOf('F'), sumOf('G'), ...charges.map((_, k) => sumOf(chargeCol(k))), sumOf(landedCol), ''];
  const check = ['Rounded cents minus invoice', '', '', '', '', '', '', ...charges.map((_, k) => `=SUMPRODUCT(ROUND(${chargeCol(k)}${first}:${chargeCol(k)}${last},2))-${chargeCol(k)}$2`), '', ''];
  const esc = (cells) => cells.map((v) => (typeof v === 'string' && v.startsWith('=') ? (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v) : csvCell(v))).join(',');
  return [esc(head), esc(amountsRow), ...body.map(esc), esc(totals), esc(check)].join('\r\n') + '\r\n';
}

// ---------- Shopify ----------

const SHOPIFY = {
  handle: ['handle', 'urlhandle'],
  sku: ['variantsku', 'sku'],
  cost: ['costperitem'],
};
// The merchant's own Shopify product export with Cost per item filled for the SKUs in this shipment.
// Every other column is kept as exported, because Shopify Help says a blank cell overwrites the value
// with a blank. Rows of products with no SKU in the shipment are left out (an import without them
// leaves them as they are); every row of a product that has one is kept, so no variant is dropped.
export function fillShopifyExport(text, costBySku) {
  if (String(text).length > LIMITS.csvChars * 10) throw new LandedError('The Shopify export is over 4,000,000 characters; export only the products in this shipment.', 'shopifyExport');
  const rows = parseCsv(text);
  if (rows.length < 2) throw new LandedError('The Shopify export needs its header row and at least one product row.', 'shopifyExport');
  const head = rows[0].map(norm);
  const find = (names) => head.findIndex((h) => names.includes(h));
  const hi = find(SHOPIFY.handle);
  const si = find(SHOPIFY.sku);
  const ci = find(SHOPIFY.cost);
  if (hi < 0 || si < 0 || ci < 0) throw new LandedError('This does not look like a Shopify product export: it needs the Handle (or URL handle), SKU (or Variant SKU) and Cost per item columns. Export the products from Shopify admin and paste the file as it is.', 'shopifyExport');
  const seen = new Map();
  const handles = new Set();
  rows.slice(1).forEach((r) => {
    const sku = (r[si] ?? '').trim();
    if (sku && costBySku.has(sku)) {
      seen.set(sku, (seen.get(sku) ?? 0) + 1);
      handles.add((r[hi] ?? '').trim());
    }
  });
  const duplicates = [...seen].filter(([, n]) => n > 1).map(([s]) => s);
  if (duplicates.length) throw new LandedError(`These SKUs are on more than one variant in the export, so the cost cannot be placed safely: ${duplicates.slice(0, 8).join(', ')}.`, 'shopifyExport');
  const out = [rows[0]];
  let updated = 0;
  for (const r of rows.slice(1)) {
    if (!handles.has((r[hi] ?? '').trim())) continue;
    const copy = [...r];
    while (copy.length < rows[0].length) copy.push('');
    const sku = (r[si] ?? '').trim();
    if (sku && costBySku.has(sku)) { copy[ci] = costBySku.get(sku); updated += 1; }
    out.push(copy);
  }
  const quote = (v) => (/[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return {
    csv: out.map((r) => r.map((v) => quote(String(v))).join(',')).join('\n') + '\n',
    updated,
    products: handles.size,
    notFound: [...costBySku.keys()].filter((s) => !seen.has(s)),
  };
}

// The cost each SKU should carry in Shopify: the landed unit cost to 2 decimals, or after a late
// invoice the on-hand units' new cost (units sold keep theirs; the variance is reported).
export function shopifyCosts(r) {
  const m = new Map();
  for (const x of r.rows) {
    if (r.late && x.late.unitOnHandAfter4 !== null) m.set(x.sku, x.late.shopifyCostAfter);
    else if (!r.late || x.late.onHand > 0) m.set(x.sku, x.landedUnit2);
  }
  return m;
}

// The shipment's fingerprint for billing: the reference and the SKU:quantity set, so a re-run for the
// same shipment (a late invoice, a corrected charge, the Shopify file) is the same job.
export function shipmentKey(input, lines) {
  const ref = String(input.shipment ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
  const set = lines.map((l) => `${String(l.sku).trim()}:${Number(cleanNum(l.qty))}`).sort().join('|');
  return `${ref}#${set}`;
}

// A short text block for QuickBooks or any ledger: what each charge adds to inventory, and the late
// variance, from the result. Arithmetic only: which accounts to use is for you and your accountant.
export function bookSummary(r) {
  const out = [`Shipment ${r.summary.shipment ?? '(no reference)'}: goods ${r.summary.productTotal}, charges ${r.summary.chargeTotal}, landed ${r.summary.landedTotal}.`];
  for (const c of r.charges) out.push(`${c.name}${c.late ? ' (late)' : ''}: ${c.amount}, ${c.basisWords}.`);
  if (r.late) out.push(`Late charges ${r.late.total}: ${r.late.toOnHand} into units on hand, ${r.late.cogsVariance} for units already sold (a cost of goods sold variance).`);
  return out;
}

// ---------- the page's short text forms ----------

// "MUG-12, 600, 2.10, 0.42, 0.0018, 240": SKU, units, unit cost, kg per unit, CBM per unit, units on
// hand (the last three optional; leave one empty with ", ,"). A text with a header row is a CSV.
export function readLinesText(text) {
  const t = String(text ?? '').trim();
  if (!t) throw new LandedError('Add at least one PO line: SKU, units, unit cost.', 'lines');
  const firstLine = t.split(/\r?\n/)[0];
  if (/(^|,)\s*"?(sku|variant sku|item)"?\s*(,|$)/i.test(firstLine)) return { linesCsv: t };
  const rows = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (rows.length > LIMITS.lines) throw new LandedError(`At most ${LIMITS.lines.toLocaleString('en-US')} lines in one shipment.`, 'lines');
  const lines = rows.map((l, i) => {
    const p = l.split(/\s*[,\t;]\s*/);
    if (p.length < 3) throw new LandedError(`Line ${i + 1}: write the SKU, units and unit cost, such as MUG-12, 600, 2.10.`, 'lines');
    const o = { sku: p[0], qty: p[1], unitCost: p[2] };
    if (p[3]) o.unitWeightKg = p[3];
    if (p[4]) o.unitCbm = p[4];
    if (p[5]) o.onHand = p[5];
    return o;
  });
  return { lines };
}

// "Ocean freight, freight, 1840.00, volume [, late] [, only A B]"; bases also "volume 70 weight 30"
// (a mix) and "A=12.50 B=8" (amounts per SKU, the amount may then be empty).
export function readChargesText(text) {
  const rows = String(text ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (rows.length > LIMITS.charges) throw new LandedError(`At most ${LIMITS.charges} invoices.`, 'charges');
  return rows.map((l, i) => {
    const p = l.split(/\s*,\s*/);
    if (p.length < 3) throw new LandedError(`Invoice ${i + 1}: write a name, a kind, the amount and a basis, such as Ocean freight, freight, 1840, volume.`, 'charges');
    const kind = p[1].toLowerCase();
    if (!KINDS.includes(kind)) throw new LandedError(`Invoice ${i + 1}: the kind "${p[1].slice(0, 20)}" is not one of ${KINDS.join(', ')}.`, 'charges');
    const c = { name: p[0], kind };
    if (p[2] !== '') c.amount = p[2];
    for (const extra of p.slice(3)) {
      const e = extra.trim();
      const low = e.toLowerCase();
      if (!e) continue;
      if (low === 'late') c.late = true;
      else if (low.startsWith('only ')) c.applyTo = e.slice(5).trim().split(/\s+/);
      else if (BASES.includes(low)) c.basis = low;
      else if (/=/.test(e)) {
        c.basis = 'specific';
        c.amounts = Object.fromEntries(e.split(/\s+/).map((kv) => { const [k, v] = kv.split('='); return [k, v]; }));
      } else if (/^(?:[a-z]+\s+\d+(?:\.\d+)?\s*)+$/i.test(e)) {
        c.basis = 'mixed';
        c.mix = Object.fromEntries([...e.matchAll(/([a-z]+)\s+(\d+(?:\.\d+)?)/gi)].map((m) => [m[1].toLowerCase(), m[2]]));
      } else throw new LandedError(`Invoice ${i + 1}: could not read "${e.slice(0, 30)}". Write a basis (value, weight, volume, quantity, equal), a mix (volume 70 weight 30), amounts (SKU=12.50), "late" or "only SKU SKU".`, 'charges');
    }
    return c;
  });
}

// The inverse, for links that open the tool prefilled.
export function linesText(lines) {
  return lines.map((l) => {
    const p = [l.sku, l.qty, l.unitCost, l.unitWeightKg ?? '', l.unitCbm ?? '', l.onHand ?? ''];
    while (p.length > 3 && p[p.length - 1] === '') p.pop();
    return p.join(', ');
  }).join('\n');
}
export function chargesText(charges) {
  return charges.map((c) => {
    const p = [c.name, c.kind, c.amount ?? ''];
    if (c.basis === 'mixed') p.push(Object.entries(c.mix).map(([k, v]) => `${k} ${v}`).join(' '));
    else if (c.basis === 'specific') p.push(Object.entries(c.amounts).map(([k, v]) => `${k}=${v}`).join(' '));
    else if (c.basis) p.push(c.basis);
    if (c.late) p.push('late');
    if (c.applyTo) p.push(`only ${c.applyTo.join(' ')}`);
    return p.join(', ');
  }).join('\n');
}
