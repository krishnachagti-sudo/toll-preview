// FBA prep checker: Amazon's US prep, packaging, labeling, expiration-date and size-tier rules
// applied to one product at a time. Pure and dependency-free: the browser loads this same file.
// Every rule comes from the dated data file (data/amazon-prep-rules.json, transcribed from Amazon's
// public Seller Central help pages) and every step it returns names the page that says so. Where
// Amazon's own pages disagree or leave a gap, the stricter reading is used and the step says so.

export class PrepError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'PrepError';
    this.field = field;
  }
}

export const PT = 72;
export const LIMITS = { products: 500, labels: 3000, copies: 500, name: 200, csvChars: 200_000 };

// The product types the checker knows. The first twelve are Amazon's prep guidance categories;
// the rest are product types with their own Seller Central page or rule.
export const TYPES = {
  adult: 'Adult',
  'apparel-hanger': 'Apparel on hanger',
  apparel: 'Apparel, fabric, plush, and textiles',
  baby: 'Baby (for a child aged three years or younger)',
  fragile: 'Fragile, glass',
  liquid: 'Liquid, paste, gel or cream',
  perforated: 'Perforated packaging',
  granular: 'Powder, pellets, and granular',
  sharp: 'Sharp',
  small: 'Small (longest side under 2 1/8 in)',
  set: 'Sold as set',
  jewelry: 'Jewelry',
  footwear: 'Footwear',
  book: 'Book',
  battery: 'Batteries or a battery product',
  scented: 'Heavily scented',
  leather: 'Leather or another material bags can damage',
  vinyl: 'Vinyl record',
  collectible: 'Collectible',
  premium: 'Premium or high retail value',
  expiring: 'Expiration-dated (has a shelf life)',
};
export const TYPE_IDS = Object.keys(TYPES);
export const CONTAINERS = ['bottle', 'tube', 'jar', 'pump', 'spray', 'roll-on', 'can', 'mascara', 'other'];
export const LIDS = ['twist', 'screw', 'push', 'clip', 'flip', 'other'];
export const CONDITIONS = ['New', 'Used - Like New', 'Used - Very Good', 'Used - Good', 'Used - Acceptable', 'Collectible - Like New', 'Collectible - Very Good', 'Collectible - Good', 'Collectible - Acceptable', 'Renewed'];
export const SET_TEXTS = ['Sold as set', 'Ready to ship', 'This is a set. Do not separate.'];

// ---------- units ----------

const IN_PER_CM = 1 / 2.54;
const LB = { lb: 1, oz: 1 / 16, kg: 2.2046226218, g: 0.0022046226218 };
export const round = (n, d = 2) => Math.round(n * 10 ** d) / 10 ** d;
export const toIn = (v, unit = 'in') => (unit === 'cm' ? v * IN_PER_CM : unit === 'mm' ? v * IN_PER_CM / 10 : v);
export const toLb = (v, unit = 'lb') => v * LB[unit];
const fmt = (n, d = 2) => {
  const r = round(n, d);
  return Number.isInteger(r) ? String(r) : String(r);
};
export const inText = (n) => `${fmt(n)} in`;
export function lbText(lb) {
  if (lb < 1) return `${fmt(lb * 16, 2)} oz`;
  return `${fmt(lb, 2)} lb`;
}

// Sides sorted longest first (Amazon's length, width, height are longest, median, shortest).
export function sides(dims) {
  if (!dims) return null;
  const unit = dims.unit ?? 'in';
  const s = [dims.length, dims.width, dims.height].map((v) => toIn(v, unit)).sort((a, b) => b - a);
  return { longest: s[0], median: s[1], shortest: s[2] };
}

// ---------- the rule set ----------

export function makeEngine(data) {
  const S = data.sources;
  const src = (k) => {
    if (!S[k]) throw new Error(`Unknown source ${k}`);
    return { title: S[k].title, url: S[k].url };
  };
  const category = (id) => data.categories.find((c) => c.id === id);
  const shelf = (id) => data.expiry.shelfLife.find((x) => x.id === id);

  // ---------- suffocation warning print size ----------

  // Amazon's table: 60 in or more 24 pt; 40 to 59 in 18 pt; 30 to 39 in 14 pt; less than 29 in
  // 10 pt. It does not say what applies between 29 and 30, 39 and 40 or 59 and 60 inches; there the
  // larger size is used, and `gap` says so.
  function warningPrintSize(lengthPlusWidth) {
    const x = lengthPlusWidth;
    const rows = data.bag.printSizes;
    const pt = (from) => rows.find((r) => r.from === from).pt;
    if (x >= 60) return { pt: pt(60), row: '60 inches or more', gap: false };
    if (x > 59) return { pt: pt(60), row: '60 inches or more', gap: true };
    if (x >= 40) return { pt: pt(40), row: '40 to 59 inches', gap: false };
    if (x > 39) return { pt: pt(40), row: '40 to 59 inches', gap: true };
    if (x >= 30) return { pt: pt(30), row: '30 to 39 inches', gap: false };
    if (x >= 29) return { pt: pt(30), row: '30 to 39 inches', gap: true };
    return { pt: rows.find((r) => r.below !== undefined).pt, row: 'less than 29 inches', gap: false };
  }

  // A bag laid flat around a product: the smallest flat size that holds it is about
  // (width + height) by (length + height); this is geometry, not an Amazon rule.
  function bagFor(s) {
    return { width: s.median + s.shortest, length: s.longest + s.shortest };
  }

  // The bag the seller plans (or the smallest that fits) against the bag rules.
  function checkBag(s, bag, { opaque = false } = {}) {
    const B = data.bag;
    const min = s ? bagFor(s) : null;
    const given = bag && bag.width !== undefined && bag.length !== undefined;
    const unit = bag?.unit ?? 'in';
    const w = given ? toIn(bag.width, unit) : min?.width;
    const l = given ? toIn(bag.length, unit) : min?.length;
    const opening = bag?.opening !== undefined ? toIn(bag.opening, unit) : w;
    const out = { opaque, given: !!given, width: w ?? null, length: l ?? null, opening: opening ?? null, minMil: B.minMil, maxOverhangIn: B.maxOverhangIn, checks: [], warning: null, smallest: min };
    const fail = (text, source = 'bagging') => out.checks.push({ ok: false, text, source: src(source) });
    const pass = (text, source = 'bagging') => out.checks.push({ ok: true, text, source: src(source) });
    if (bag?.mil !== undefined) {
      if (bag.mil < B.minMil) fail(`The bag is ${fmt(bag.mil)} mil; Amazon requires at least ${B.minMil} mil (thousandth of an inch).`);
      else pass(`The bag is ${fmt(bag.mil)} mil, at least the ${B.minMil} mil Amazon requires.`);
    }
    if (given && min) {
      const overW = w - min.width;
      const overL = l - min.length;
      if (w < min.width - 1e-9 || l < min.length - 1e-9) fail(`A ${inText(w)} x ${inText(l)} bag is smaller than the product laid flat needs (about ${inText(min.width)} x ${inText(min.length)}); do not force the product into it.`);
      else if (Math.max(overW, overL) > B.maxOverhangIn + 1e-9) fail(`The bag is about ${inText(Math.max(overW, overL))} bigger than the product needs; Amazon says a bag must not protrude more than ${B.maxOverhangIn} inches past the product. Use a smaller bag or fold and tape the excess.`);
      else pass(`The bag fits within the ${B.maxOverhangIn}-inch limit past the product.`);
    }
    if (opening !== undefined && opening !== null) {
      const needs = opening >= B.warningOpeningIn - 1e-9;
      const sum = (w ?? 0) + (l ?? 0);
      const size = warningPrintSize(sum);
      const printed = !!bag?.warningPrinted;
      out.warning = {
        required: needs,
        printedOnBag: printed,
        needLabel: needs && !printed,
        opening,
        text: B.warningText,
        lengthPlusWidth: round(sum, 2),
        minPt: needs ? size.pt : null,
        row: needs ? size.row : null,
        gap: needs ? size.gap : false,
        why: needs
          ? `The bag opening is ${inText(opening)} when flat, and Amazon requires a suffocation warning on bags with a ${B.warningOpeningIn}-inch opening or larger${printed ? '; yours is printed on the bag, so no sticker is needed' : ''}.`
          : `The bag opening is ${inText(opening)} when flat, under ${B.warningOpeningIn} inches, so no suffocation warning is required.`,
        source: src('bagging'),
      };
    }
    return out;
  }

  // ---------- liquids: Amazon's cap seal decision tree ----------

  function liquidSteps(l = {}, { fragile }) {
    const steps = [];
    const add = (prep, text, why, source) => steps.push({ prep, text, why, source: src(source) });
    const C = data.capSeal;
    const oz = l.volume === undefined ? null : (l.unit === 'ml' ? l.volume / 29.5735295625 : l.volume);
    const ml = l.volume === undefined ? null : (l.unit === 'ml' ? l.volume : l.volume * 29.5735295625);
    const isFragile = fragile || l.fragileContainer;
    if (l.hazmat) {
      add('bag', 'Bag it (or heat shrink-wrap the whole product, top and bottom closed).', 'It is a hazmat (dangerous goods) liquid: Amazon requires bagging regardless of the product seal, and a cap seal is not enough.', 'capseal');
      if (isFragile && oz !== null && oz > data.boxing.hazGlassOverOz) add('box', 'Box it (over-box), six-sided.', `Hazardous liquids in glass or fragile containers over ${data.boxing.hazGlassOverOz} oz (125 ml) require boxing.`, 'boxing');
      return steps;
    }
    if (oz === null) {
      add('check', `Measure the volume: liquids over ${C.minOz} oz (${C.minMl} ml) may need a cap seal or a bag.`, 'Volume decides the rest of the cap seal tree.', 'capseal');
      return steps;
    }
    if (l.unit === 'ml' ? ml <= C.minMl + 1e-9 : oz <= C.minOz + 1e-9) {
      add('none', 'No extra liquid prep for the volume.', `It is ${fmt(oz)} oz (${fmt(ml, 0)} ml): no additional prep is required for a non-hazmat liquid of ${C.minOz} oz (${C.minMl} ml) or less, unless it is repeatedly damaged.`, 'liquids');
      return steps;
    }
    if (isFragile) {
      add('bubble', 'Bubble wrap it (and add a cap seal only if the bubble wrap does not stop leaks).', `It is a liquid in a fragile container over ${C.minOz} oz: bubble wrap is required instead of a cap seal.`, 'capseal');
      return steps;
    }
    const c = l.container ?? 'other';
    if (['can', 'roll-on', 'mascara'].includes(c)) {
      add('none', 'No cap seal or bag needed for this container.', `Amazon lists ${c === 'can' ? 'metal cans or tins' : c === 'roll-on' ? 'roll-ons' : 'mascara'} as needing no additional prep.`, 'liquids');
      return steps;
    }
    if (c === 'jar' && (l.lid ?? 'screw') === 'screw') {
      add('none', 'No cap seal needed for a non-fragile screw-top jar.', 'Amazon lists a screw top, non-fragile jar as not needing a cap seal.', 'capseal');
      return steps;
    }
    if (c === 'pump' || c === 'spray') {
      const kind = c === 'pump' ? 'pump bottle' : 'spray (trigger) bottle';
      if (l.secondarySeal && l.locking) {
        add('none', `No cap seal needed: a ${kind} with a secondary seal and a locking mechanism.`, 'Cap seal decision tree, steps 9, 11 and 12.', 'capseal');
      } else if (c === 'pump') {
        add('cap-seal', 'Apply a cap seal vertically over the top of the pump, attached to the bottle on both sides.', l.secondarySeal ? 'Liquid pumps without a locking mechanism must have a cap seal even if they have a secondary seal.' : 'A pump bottle with no secondary seal needs a cap seal.', 'capseal');
      } else {
        add('bag', 'Bag it in a transparent poly bag.', l.secondarySeal ? 'A spray (trigger) bottle with a secondary seal but no locking mechanism requires bagging.' : 'A spray (trigger) bottle with no secondary seal requires bagging.', 'capseal');
      }
      return steps;
    }
    if (l.secondarySeal) {
      add('none', 'No cap seal needed: it has a secondary (double) seal.', 'Cap seal decision tree, step 6.', 'capseal');
      return steps;
    }
    const lid = l.lid ?? 'other';
    if ((c === 'bottle' && ['twist', 'screw', 'push', 'clip', 'flip'].includes(lid)) || (c === 'tube' && ['screw', 'twist', 'clip', 'flip'].includes(lid)) || (c === 'jar' && lid === 'clip')) {
      const how = ['twist', 'screw'].includes(lid) ? 'horizontally around the cap' : 'vertically over the opening';
      add('cap-seal', `Apply a cap seal ${how}, with the lid tight first.`, `It is over ${C.minOz} oz, non-hazmat, non-fragile, with a ${lid} top and no secondary seal.`, 'capseal');
      return steps;
    }
    add('none', 'No cap seal required by the decision tree for this container; bag it if it leaks.', 'Cap seal decision tree, steps 7 and 8, end with no cap seal for other containers.', 'capseal');
    return steps;
  }

  // ---------- size tiers ----------

  function fits(t, s, w) {
    if (t.maxLb !== undefined && w > t.maxLb + 1e-9) return false;
    if (t.longest !== undefined && s.longest > t.longest + 1e-9) return false;
    if (t.median !== undefined && s.median > t.median + 1e-9) return false;
    if (t.shortest !== undefined && s.shortest > t.shortest + 1e-9) return false;
    if (t.lengthGirth !== undefined && s.lengthGirth > t.lengthGirth + 1e-9) return false;
    return true;
  }

  // The size tier in a year's table from sides (in) and unit weight (lb). Small standard uses the
  // unit weight; large standard the greater of unit and dimensional weight; bulky and oversize the
  // same with a minimum width and height of 2 inches; the heaviest tier the unit weight.
  function sizeTier(s, unitLb, year) {
    const T = data.sizeTiers;
    const table = T[year].tiers;
    const dim = (a, b, c) => (a * b * c) / T.dimDivisor;
    const med2 = Math.max(s.median, T.dimMinIn);
    const sh2 = Math.max(s.shortest, T.dimMinIn);
    const dimActual = dim(s.longest, s.median, s.shortest);
    const dim2 = dim(s.longest, med2, sh2);
    const lg = { ...s, lengthGirth: s.longest + 2 * (s.median + s.shortest) };
    const heavy = table[table.length - 1];
    if (unitLb > 150) return { tier: heavy, shippingLb: unitLb, dimLb: dim2, weightUsed: 'unit', lengthGirth: lg.lengthGirth };
    for (const t of table.slice(0, -1)) {
      let w;
      let dimLb;
      if (t.id === 'small-standard') { w = unitLb; dimLb = dimActual; } else if (t.id === 'large-standard') { dimLb = dimActual; w = Math.max(unitLb, dimActual); } else { dimLb = dim2; w = Math.max(unitLb, dim2); }
      if (fits(t, lg, w)) return { tier: t, shippingLb: w, dimLb, weightUsed: t.weight === 'unit' ? 'unit' : w === unitLb ? 'unit' : 'dimensional', lengthGirth: lg.lengthGirth };
    }
    // Dimensional weight above 150 lb with a unit weight at or under it: Amazon's page names only the
    // heaviest tier for that.
    return { tier: heavy, shippingLb: Math.max(unitLb, dim2), dimLb: dim2, weightUsed: 'dimensional', lengthGirth: lg.lengthGirth, note: 'Dimensional weight is over 150 lb; Amazon\'s page defines the heaviest tier by shipping weight but says it uses unit weight, so check the Fee Preview report.' };
  }

  function tiers(s, unitLb, onDate) {
    const a = sizeTier(s, unitLb, '2026');
    const b = sizeTier(s, unitLb, '2027');
    const T = data.sizeTiers;
    const extra2026 = [];
    if (a.tier.group === 'Extra-large' && a.tier.id !== 'xl-150' && (s.longest > T['2026'].overmax.longest || a.lengthGirth > T['2026'].overmax.lengthGirth)) extra2026.push('Overmax');
    const extra2027 = [];
    if (b.tier.group === 'Oversize' && s.shortest < T['2027'].flat.shortestBelow && s.median >= T['2027'].flat.medianFrom) extra2027.push('Flat product handling fee applies');
    if (b.tier.group === 'Oversize' && s.median > T['2027'].overhang.medianOver) extra2027.push('Overhang handling fee applies');
    const applies = onDate ? (onDate >= T['2027'].from ? '2027' : '2026') : null;
    const pick = (r, extra) => ({ id: r.tier.id, name: r.tier.name, group: r.tier.group, shippingLb: round(r.shippingLb, 2), dimLb: round(r.dimLb, 2), weightUsed: r.weightUsed, lengthGirth: round(r.lengthGirth, 2), notes: [...extra, ...(r.note ? [r.note] : [])] });
    return { t2026: pick(a, extra2026), t2027: pick(b, extra2027), applies, changeDate: T['2027'].from, source: src('tiers'), dimSource: src('dimWeight') };
  }

  // ---------- expiration dates ----------

  const parseDay = (s) => {
    const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?$/.exec(String(s ?? ''));
    if (!m) return null;
    const y = +m[1];
    const mo = +m[2];
    const d = m[3] ? +m[3] : 1;
    const t = Date.UTC(y, mo - 1, d);
    const back = new Date(t);
    if (mo < 1 || mo > 12 || back.getUTCDate() !== d) return null;
    return { t, y, mo, d, monthOnly: !m[3] };
  };
  const iso = (t) => new Date(t).toISOString().slice(0, 10);
  const pad = (n) => String(n).padStart(2, '0');
  const MON = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

  function expiryCheck(e = {}) {
    const E = data.expiry;
    const out = { formats: { packaging: E.packagingFormats, expiryPage: E.expiryPageFormats }, boxFontPt: E.boxFontPt, source: src('expiry'), packagingSource: src('packaging') };
    const date = e.date ? parseDay(e.date) : null;
    if (e.date && !date) throw new PrepError('expiry.date is a date written YYYY-MM-DD or YYYY-MM, for example 2028-08 or 2028-08-15.', 'expiry.date');
    let days = null;
    let basis = null;
    if (e.product) {
      const row = shelf(e.product);
      if (!row) throw new PrepError(`expiry.product is one of ${E.shelfLife.map((x) => x.id).join(', ')}.`, 'expiry.product');
      days = row.days;
      basis = `${row.product}: at least ${row.days} days before expiry at check-in (Amazon's shelf-life table)`;
    } else if (e.servingDays !== undefined) {
      days = e.servingDays + E.extraDays;
      basis = `${e.servingDays} days to use it in full plus ${E.extraDays} days = ${days} days`;
    }
    if (date) {
      out.date = iso(date.t);
      out.monthOnly = date.monthOnly;
      out.printFull = date.monthOnly ? null : { mmddyyyy: `${pad(date.mo)}-${pad(date.d)}-${date.y}`, ddmmyyyy: `${pad(date.d)}-${pad(date.mo)}-${date.y}`, ddmonyyyy: `${pad(date.d)}-${MON[date.mo - 1]}-${date.y}` };
      out.stamp = `${pad(date.mo)}-${date.y}`;
      if (days !== null) {
        out.minDays = days;
        out.basis = basis;
        out.latestCheckIn = iso(date.t - days * 86_400_000);
      }
    } else if (days !== null) {
      out.minDays = days;
      out.basis = basis;
    }
    return out;
  }

  // ---------- one product ----------

  // product: { name?, sku?, types: [..], dims?, weight?, liquid?, dropTest?, book?, bag?, barcode?,
  //            expiry?, unitsPerBox?, setHasAsins?, needsAssembly?, perishable?, sealedBox?,
  //            babyExposed?, hanger? } ; onDate: 'YYYY-MM-DD' for the size tier that applies.
  function check(product, { onDate = null } = {}) {
    const p = product ?? {};
    const types = new Set(p.types ?? []);
    const s = sides(p.dims);
    const unitLb = p.weight ? toLb(p.weight.value, p.weight.unit ?? 'lb') : null;
    const steps = [];
    const labels = [];
    const notes = [];
    const refused = [];
    const add = (prep, text, why, source, extra = {}) => steps.push({ prep, text, why, source: src(source), ...extra });

    // Small: the longest side decides, so the dimensions add the type.
    let autoSmall = false;
    if (s && s.longest < data.small.longestSideIn - 1e-9 && !types.has('small')) { types.add('small'); autoSmall = true; }
    if (types.has('jewelry') && s === null) notes.push({ text: 'Jewelry must be packaged regardless of size; give the dimensions to check the small-product rule too.', source: src('small') });

    if (p.needsAssembly) refused.push({ text: 'Amazon does not accept units that would require it to assemble multiple pieces (for example a wheelbarrow with separate handles and legs sold as one piece).', source: src('packaging') });
    if (p.perishable) refused.push({ text: 'Perishable items are not allowed.', source: src('packaging') });

    // Categories in Amazon's prep guidance table, each with its steps as written.
    const used = [];
    const useCategory = (id, why) => {
      const c = category(id);
      used.push({ id, name: c.name, steps: c.steps, why, source: src('guidance') });
    };

    let bagged = false;
    let opaque = false;
    let bubble = false;
    let boxed = false;
    let bagReason = [];

    if (types.has('adult')) {
      useCategory('adult');
      opaque = true;
      bagged = true;
      bagReason.push('adult content');
      add('opaque-bag', 'Bag it in a black, opaque bag (or opaque shrink wrap) at least 1.5 mil thick, sealed, with the barcode scannable on the outside.', 'Adult products must be bagged in opaque bags so the content is not visible.', 'opaque');
    }
    if (types.has('apparel-hanger') || p.hanger) {
      useCategory('apparel-hanger');
      add('remove-hanger', 'Remove the hanger (mini-hangers for baby clothes may stay).', 'Normal-size hangers must be removed. A few garments may stay on a hanger: blazers or suit jackets, suits, and clothing over $299.99 that is formal, evening or outerwear or would be damaged stored flat.', 'packaging');
    }
    const soft = types.has('apparel') || types.has('apparel-hanger') || types.has('baby');
    if (types.has('apparel')) useCategory('apparel');
    if (types.has('baby')) useCategory('baby');
    if (soft) {
      if (types.has('leather')) {
        boxed = true;
        add('box', 'Box it instead of bagging (six-sided box, sealed).', 'Use boxes for materials such as leather that can be damaged by bags or shrink wrap.', 'softlines');
      } else if (p.sealedBox && !(types.has('baby') && p.babyExposed)) {
        add('none', 'No bag needed: it is already in a sealed, six-sided package with no opening larger than 1 x 1 inch.', 'Softlines and baby products that are fully enclosed in a sealed, six-sided package are protected against dust and humidity.', 'softlines');
      } else {
        bagged = true;
        bagReason.push(types.has('baby') ? 'baby product' : 'fabric that dust or moisture can damage');
        add('bag', 'Bag it in a sealed transparent poly bag (or shrink wrap), at least 1.5 mil, folded to its smallest size, with a suffocation warning.', types.has('baby') ? `Baby products for children younger than ${data.baby.underAge} must have no exposed surface greater than ${data.baby.exposedIn} inch by ${data.baby.exposedIn} inch.` : 'Softlines must be fully enclosed in packaging that protects against dust and humidity.', 'softlines');
      }
    }
    if (types.has('footwear')) {
      add('footwear', 'Ship footwear in its original manufacturer box (or a poly bag with a suffocation warning), with no shoe material exposed.', 'Footwear, regardless of material, must be packaged with no shoe material exposed; measure it in its original box.', 'packaging');
    }
    if (types.has('perforated')) {
      useCategory('perforated');
      bagged = true;
      bagReason.push('perforated packaging');
      add('bag', 'Seal it in a transparent poly bag with a suffocation warning; the barcode must scan without opening it.', 'Products in packaging with a perforated opening must be bagged.', 'guidance');
    }
    if (types.has('granular')) {
      useCategory('granular');
      if (p.sealedBox) {
        add('check', 'Shake test: shake it hard in its packaging for a full minute; if nothing spills, the container may be enough, otherwise bag it.', 'Pellets, powders and granular products often need poly bags if their original containers are not sturdy enough.', 'granular');
      } else {
        bagged = true;
        bagReason.push('powder, pellets or granules');
        add('bag', 'Seal it in a transparent poly bag with a suffocation warning; the barcode must scan without opening it.', 'Prep guidance for powder, pellets and granular products.', 'guidance');
      }
    }
    if (types.has('liquid')) {
      useCategory('liquid');
      for (const st of liquidSteps(p.liquid, { fragile: types.has('fragile') })) {
        steps.push(st);
        if (st.prep === 'bag') { bagged = true; bagReason.push('liquid'); }
        if (st.prep === 'bubble') bubble = true;
        if (st.prep === 'box') boxed = true;
      }
    }
    if (types.has('fragile') || types.has('premium') || types.has('collectible')) {
      if (types.has('fragile')) useCategory('fragile');
      if (!bubble) {
        bubble = true;
        const what = types.has('fragile') ? 'fragile' : types.has('premium') ? 'premium (high retail value)' : 'a collectible';
        add('bubble', 'Bubble wrap each unit individually: at least two layers, nothing exposed, no empty space, no more than 3 in of wrap past the item; wrap pieces within the unit separately.', `It is ${what}: Amazon requires bubble wrap or a box so the item is not exposed in any way.`, 'bubble');
      }
      if (p.dropTest === 'failed') {
        boxed = true;
        add('box', 'Box it: a six-sided box that does not give way when pressed, contents secured, sealed with tape, glue or staples, and test the drop again.', 'Fragile items that fail the three-foot drop test after bubble wrap must be boxed.', 'boxing');
      } else if (p.dropTest !== 'passed') {
        add('test', 'Drop test: drop it five times from 3 feet onto concrete (top, bottom, largest side, bottom corner, longest bottom edge); it must survive. If it breaks, box it.', 'The item must pass a three-foot drop test after bubble wrap; Amazon does not perform it.', 'prepare');
      }
    }
    if (types.has('sharp')) {
      useCategory('sharp');
      add('sharp-packaging', 'Package it so every sharp edge and point is covered by cut- and puncture-resistant packaging that stays closed (hardened plastic, blister or clamshell pack, sheath, Styrofoam or thick, fully enclosed corrugated box).', 'Bubble wrap or a non-corrugated box is not acceptable for sharp items; Amazon does not prep them, and non-compliant units may be disposed of without reimbursement.', 'sharp');
    }
    if (types.has('vinyl')) {
      boxed = true;
      add('box', 'Box it (vinyl records always require boxing).', 'Vinyl records: boxing always required.', 'boxing');
    }
    if (types.has('book')) {
      const b = p.book ?? {};
      if ((b.cover === 'hardcover' && b.price > data.books.hardcoverOver) || (b.cover === 'softcover' && b.price > data.books.softcoverOver)) {
        if (!bubble) {
          bubble = true;
          add('bubble', 'Bubble wrap it (not a bag).', `A ${b.cover} book over $${b.cover === 'hardcover' ? data.books.hardcoverOver : data.books.softcoverOver} requires bubble wrap, not bagging.`, 'bagging');
        }
      } else if (b.specialCover || b.looseItem) {
        bagged = true;
        bagReason.push('book cover or loose item');
        add('bag', 'Bag it in a transparent poly bag.', b.looseItem ? 'A book that contains a loose item (such as a CD or toy) must be bagged.' : 'A book with a cloth, leather, glossy or shiny cover must be bagged.', 'bagging');
      } else {
        add('none', 'No bag needed for the book.', 'For most books the original cover is enough protection.', 'fragile');
      }
    }
    if (types.has('small')) {
      useCategory('small', autoSmall ? `Its longest side is ${inText(s.longest)}, under 2 1/8 in.` : undefined);
      if (!bagged && !boxed) {
        bagged = true;
        bagReason.push('small item');
        add('bag', 'Bag or box it, with the barcode visible on the outside; a box sleeve must fit tightly.', `Items with packaging smaller than 2-1/8" (credit card length) must be bagged or boxed.`, 'small');
      }
    }
    if (types.has('jewelry')) {
      add('jewelry', 'Put jewelry in a bag (pouch) or box with the barcode visible outside; boxed jewelry with fabric or dust-prone parts needs an extra bag or box.', 'Jewelry, regardless of size, must be packaged to protect against dirt, dust, and humidity.', 'small');
    }
    if (types.has('scented') && !bagged) {
      bagged = true;
      bagReason.push('scent');
      add('bag', 'Bag it.', 'Items that contain scents must be bagged.', 'bagging');
    }
    if (types.has('set')) {
      useCategory('set');
      add('set', 'Package the set together so it cannot be separated (bag, shrink wrap or box), and label it "Sold as set", "Ready to ship" or "This is a set. Do not separate."', 'Units sold as one unit must be marked as sets on their packaging; a set that is not otherwise contained may require boxing.', 'packaging');
      add('cover-barcodes', 'Turn the individual units\' barcodes inward or cover them; only the set\'s barcode may scan.', p.setHasAsins ? 'The individual units already have ASINs, so the set needs its own unique ASIN.' : 'The barcodes on the individual units must not face outward or must be covered.', 'guidance');
      labels.push({ kind: 'set', text: SET_TEXTS[0], options: SET_TEXTS, why: 'A label that clearly states the products are received and sold as a single unit.', source: src('packaging') });
    }
    if (types.has('battery')) {
      notes.push({ text: 'Batteries: rigid packaging only (original packaging, box, clamshell or blister), terminals unable to touch metal or each other; no zipper bags, shrink wrap or other non-rigid packaging. Button cells need child-resistant packaging and a warning; lithium batteries need UN3090 or UN3480 labeling. Hazmat review is Amazon\'s.', source: src('batteries') });
      if (bagged) notes.push({ text: 'A bag is not rigid packaging: put the battery product in a box or clamshell first, then bag it only if another rule needs it.', source: src('batteries') });
    }
    if (types.has('expiring') || p.expiry) {
      add('expiry', 'Show the expiration date on every unit and on the outer box (36 pt or larger on the box), and outside any bag or bubble wrap.', 'Expiration-dated products need dates on the outer box in 36-point or larger font and on each unit; lot numbers alone are not enough.', 'packaging');
    }

    // Weight: boxes for heavy units.
    if (unitLb !== null && unitLb > data.boxing.doubleWallOverLb && (boxed || types.has('sharp'))) {
      add('double-wall', 'Use a double-wall corrugated box.', `Products that weigh more than ${data.boxing.doubleWallOverLb} lb (or sharp products) must be boxed in a double-wall corrugated box.`, 'packaging');
    }

    if (!used.length && !steps.length) useCategory('none');

    // The bag.
    let bag = null;
    if (bagged || p.bag) {
      bag = checkBag(s, p.bag, { opaque });
      bag.needed = bagged;
      bag.reasons = [...new Set(bagReason)];
      if (bagged && bag.warning && bag.warning.needLabel) {
        labels.push({ kind: 'warning', text: data.bag.warningText, minPt: bag.warning.minPt, why: bag.warning.why, source: src('bagging') });
      }
      if (bagged && !bag.warning) notes.push({ text: `Measure the bag opening flat: ${data.bag.warningOpeningIn} inches or more needs a suffocation warning.`, source: src('bagging') });
    }

    // The barcode.
    const bc = p.barcode ?? {};
    let barcode;
    if (bc.seller === 'brand' && bc.manufacturerBarcode && !bc.gtinExemption) {
      barcode = { fnskuRequired: false, why: 'Brand owners (Brand Registry brand representative) can use the manufacturer barcode without an Amazon barcode sticker, if the product is eligible.', source: src('barcodeFaq') };
    } else if (bc.seller === 'reseller') {
      barcode = { fnskuRequired: true, why: `Since ${data.barcodes.resellerRuleFrom}, resellers must use Amazon barcodes (FNSKU, X00 labels) even when the product has a manufacturer barcode.`, source: src('barcodeFaq') };
    } else if (bc.manufacturerBarcode === false || bc.gtinExemption) {
      barcode = { fnskuRequired: true, why: bc.gtinExemption ? 'Products with a GTIN exemption must use Amazon barcode stickers.' : 'Products without a manufacturer barcode need an Amazon barcode.', source: src(bc.gtinExemption ? 'barcodeFaq' : 'barcodes') };
    } else {
      barcode = { fnskuRequired: null, why: `Resellers need an Amazon barcode (FNSKU) on every unit since ${data.barcodes.resellerRuleFrom}; brand owners with a manufacturer barcode may not. Say which you are to settle it.`, source: src('barcodeFaq') };
    }
    if (barcode.fnskuRequired !== false) labels.unshift({ kind: 'fnsku', text: p.fnsku ?? null, why: barcode.why, source: barcode.source });
    if (bagged || bubble) add('barcode-outside', 'Put the barcode on the outside of the bag or wrap (or use a clear bag it scans through), flat, not on a corner or curve, 0.25 in from the edge.', 'The barcode must be scannable after prep without opening or unwrapping.', 'amazonBarcodes');

    // Size tier and box.
    const size = s && unitLb !== null ? tiers(s, unitLb, onDate) : null;
    let box = null;
    if (unitLb !== null && p.unitsPerBox) {
      const B = data.box;
      const total = unitLb * p.unitsPerBox;
      const limit = types.has('jewelry') ? B.jewelryMaxLb : B.maxLb;
      box = {
        units: p.unitsPerBox,
        contentLb: round(total, 2),
        limitLb: limit,
        ok: p.unitsPerBox === 1 ? true : total <= limit + 1e-9,
        text: p.unitsPerBox === 1
          ? `One unit of ${lbText(unitLb)} per box${unitLb > B.mechanicalLiftOverLb ? ': label the box Mechanical Lift on the top and sides' : unitLb > B.teamLiftOverLb ? ': label the box Team Lift on the top and sides' : ''}.`
          : total <= limit + 1e-9
            ? `${p.unitsPerBox} units weigh ${lbText(total)} before packing material, within the ${limit} lb box limit.`
            : `${p.unitsPerBox} units weigh ${lbText(total)} before packing material, over the ${limit} lb limit for a box of several items: use at most ${Math.floor(limit / unitLb)} per box.`,
        maxIn: B.maxIn,
        source: src('shipping'),
      };
    }

    // Expiry.
    const expiry = (types.has('expiring') || p.expiry) ? expiryCheck(p.expiry) : null;
    if (expiry && (expiry.date || expiry.minDays)) labels.push({ kind: 'expiry', text: expiry.stamp ?? null, minPt: data.expiry.boxFontPt, why: 'The expiration date in MM-YYYY (accepted on both of Amazon\'s pages) on each unit and 36 pt or larger on the outer box.', source: src('packaging') });

    // One plain sentence.
    const preps = [];
    if (opaque) preps.push('an opaque bag');
    else if (bagged) preps.push('a transparent poly bag (1.5 mil or thicker)');
    if (bubble) preps.push('bubble wrap');
    if (boxed) preps.push('a box');
    if (steps.some((x) => x.prep === 'cap-seal')) preps.push('a cap seal');
    if (types.has('sharp')) preps.push('puncture-resistant sharp packaging');
    if (types.has('set')) preps.push('a "Sold as set" label');
    const warn = bag?.warning;
    if (warn && bagged) preps.push(warn.required ? (warn.printedOnBag ? 'a suffocation warning (already printed on the bag)' : `a suffocation warning sticker at ${warn.minPt} pt or larger`) : 'no suffocation warning (bag opening under 5 in)');
    preps.push(barcode.fnskuRequired === true ? 'an FNSKU label on the outside' : barcode.fnskuRequired === false ? 'its manufacturer barcode, scannable on the outside (no FNSKU sticker)' : 'an FNSKU label on the outside if you are a reseller');
    const who = p.name ? `${p.name}` : 'This product';
    const nothing = !bagged && !bubble && !boxed && !steps.some((x) => ['cap-seal', 'sharp-packaging', 'set'].includes(x.prep));
    const answer = refused.length
      ? `${who} cannot be sent to FBA as it is: ${refused[0].text}`
      : `${who} needs ${nothing ? 'no extra prep, only ' : ''}${listText(preps)}.`;

    const sources = [];
    const seen = new Set();
    const collect = (x) => { if (x?.source && !seen.has(x.source.url)) { seen.add(x.source.url); sources.push(x.source); } };
    [...used, ...steps, ...labels, ...notes, ...refused, bag?.warning, barcode, size, box, expiry].forEach(collect);
    bag?.checks.forEach(collect);

    return {
      answer,
      ok: refused.length === 0,
      name: p.name ?? null,
      sku: p.sku ?? null,
      types: [...types],
      categories: used,
      steps,
      bag,
      labels,
      barcode,
      size,
      box,
      expiry,
      notes,
      refused,
      sources,
      sides: s ? { longest: round(s.longest, 3), median: round(s.median, 3), shortest: round(s.shortest, 3) } : null,
      unitLb: unitLb === null ? null : round(unitLb, 4),
    };
  }

  // A list of products: each verdict plus a checklist of what to buy and print.
  function plan(products, opts = {}) {
    const results = products.map((p) => check(p, opts));
    const count = (pred) => results.filter(pred).length;
    const totals = {
      products: results.length,
      bagged: count((r) => r.bag?.needed),
      warningStickers: count((r) => r.labels.some((l) => l.kind === 'warning')),
      bubble: count((r) => r.steps.some((x) => x.prep === 'bubble')),
      boxed: count((r) => r.steps.some((x) => x.prep === 'box')),
      capSeal: count((r) => r.steps.some((x) => x.prep === 'cap-seal')),
      sets: count((r) => r.types.includes('set')),
      fnsku: count((r) => r.barcode.fnskuRequired !== false),
      refused: count((r) => !r.ok),
    };
    const answer = `${plural(totals.products, 'product')}: ${plural(totals.bagged, 'needs a bag', 'need a bag')} (${totals.warningStickers} with a warning sticker), ${totals.bubble} bubble wrap, ${totals.boxed} a box, ${totals.capSeal} a cap seal, ${totals.sets} a set label and ${totals.fnsku} an FNSKU label${totals.refused ? `; ${totals.refused} cannot be sent as they are` : ''}.`;
    return { answer, totals, results };
  }

  return { data, check, plan, checkBag, warningPrintSize, sizeTier, tiers, expiryCheck, liquidSteps, bagFor, src, category };
}

export const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
export function listText(items) {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

// ---------- FNSKU ----------

// An FNSKU (X00...) or ASIN (B0...): ten capital letters and digits.
export function readFnsku(s) {
  const v = String(s ?? '').trim().toUpperCase();
  if (!/^[A-Z0-9]{10}$/.test(v)) return { ok: false, value: v, message: 'An FNSKU is 10 letters and digits, such as X001ABC123.' };
  return { ok: true, value: v, kind: v.startsWith('X') ? 'FNSKU' : v.startsWith('B') ? 'ASIN' : 'other' };
}

// ---------- Code 128 ----------

// Bar and space widths (in modules) of Code 128 symbols 0 to 106 (ISO/IEC 15417); 106 is the stop
// pattern with its final bar. Every symbol is 11 modules wide (the stop 13).
export const CODE128 = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112',
];
const START_B = 104;
const STOP = 106;

// Code 128 (code set B) for printable ASCII: the symbol values, the check symbol and the bar
// widths, bars first. -> { values, check, widths, modules }
export function code128(text) {
  const t = String(text);
  if (!t.length || [...t].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126)) throw new PrepError('A barcode holds printable ASCII letters, digits and symbols only.', 'fnsku');
  const values = [START_B, ...[...t].map((c) => c.charCodeAt(0) - 32)];
  let sum = START_B;
  for (let i = 1; i < values.length; i++) sum += values[i] * i;
  const check = sum % 103;
  const all = [...values, check, STOP];
  const widths = all.flatMap((v) => [...CODE128[v]].map(Number));
  return { values, check, widths, modules: widths.reduce((a, b) => a + b, 0) };
}

// ---------- labels and sheets ----------

const PAPER = { Letter: { w: 8.5 * PT, h: 11 * PT }, A4: { w: (210 / 25.4) * PT, h: (297 / 25.4) * PT } };
const unitPt = (v, unit) => (unit === 'mm' ? (v / 25.4) * PT : v * PT);

// A label sheet's grid: Amazon gives the label size, count and paper, not the positions, so the
// grid is centered on the page: rows touch (no gap), and the spare width is shared equally by the
// side margins and the gaps between columns. -> null when that many labels cannot fit.
export function sheetLayout(sheet) {
  const paper = PAPER[sheet.paper];
  const w = unitPt(sheet.w, sheet.unit);
  const h = unitPt(sheet.h, sheet.unit);
  let best = null;
  for (let cols = 1; cols <= sheet.count; cols++) {
    if (sheet.count % cols) continue;
    const rows = sheet.count / cols;
    if (cols * w > paper.w + 0.01 || rows * h > paper.h + 0.01) continue;
    // Prefer the grid with the least spare width (labels side by side as on real stock).
    const spare = paper.w - cols * w;
    if (!best || spare < best.spare) best = { cols, rows, spare };
  }
  if (!best) return null;
  const gap = best.spare / (best.cols + 1);
  const top = (paper.h - best.rows * h) / 2;
  const labels = [];
  for (let r = 0; r < best.rows; r++) for (let c = 0; c < best.cols; c++) labels.push([gap + c * (w + gap), top + r * h]);
  return { id: sheet.id, paper: sheet.paper, page: paper, label: { w, h }, cols: best.cols, rows: best.rows, perSheet: sheet.count, labels, name: sheetName(sheet) };
}

export const sheetName = (sheet) => `${sheet.count} per ${sheet.paper} sheet, ${sheet.unit === 'mm' ? `${sheet.w} x ${sheet.h} mm` : '1 x 2 5/8 in'}`;

// A thermal label: one label per page, its size in inches. Amazon: between 1 x 2 and 2 x 3 inches.
export function thermalLayout(wIn, hIn, rules) {
  const short = Math.min(wIn, hIn);
  const long = Math.max(wIn, hIn);
  const [minS, minL] = rules.minIn;
  const [maxS, maxL] = rules.maxIn;
  if (short < minS - 1e-9 || long < minL - 1e-9 || short > maxS + 1e-9 || long > maxL + 1e-9) {
    throw new PrepError(`Amazon barcode labels must be between ${minS} x ${minL} and ${maxS} x ${maxL} inches; ${wIn} x ${hIn} is outside that.`, 'stock');
  }
  const w = wIn * PT;
  const h = hIn * PT;
  return { id: `thermal-${wIn}x${hIn}`, paper: 'thermal', page: { w, h }, label: { w, h }, cols: 1, rows: 1, perSheet: 1, labels: [[0, 0]], name: `${wIn} x ${hIn} in thermal labels` };
}

// ---------- type metrics (Helvetica, Adobe Core 14) ----------

const HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const HELVETICA_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];

// Text the standard fonts print: curly quotes and dashes plain, anything outside ASCII loses its
// accent or becomes "?".
export function printable(s) {
  const src = String(s ?? '').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim();
  let out = '';
  for (const ch of src.normalize('NFKD')) {
    const c = ch.charCodeAt(0);
    if (c >= 0x20 && c <= 0x7e) out += ch;
    else if (c >= 0x300 && c <= 0x36f) continue;
    else out += '?';
  }
  return out;
}

export function textWidth(s, size, bold = false) {
  const table = bold ? HELVETICA_BOLD : HELVETICA;
  let w = 0;
  for (const ch of String(s)) {
    const c = ch.charCodeAt(0);
    w += c >= 32 && c <= 126 ? table[c - 32] : 556;
  }
  return (w * size) / 1000;
}

export function cutToFit(s, width, size, bold = false) {
  let t = String(s);
  if (textWidth(t, size, bold) <= width) return t;
  while (t.length && textWidth(`${t}...`, size, bold) > width) t = t.slice(0, -1);
  return `${t.trimEnd()}...`;
}

// Words wrapped into lines no wider than width. A word longer than the width is cut.
export function wrap(text, width, size, bold = false) {
  const lines = [];
  let line = '';
  for (const word of String(text).split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, size, bold) <= width) line = next;
    else {
      if (line) lines.push(line);
      line = textWidth(word, size, bold) <= width ? word : cutToFit(word, width, size, bold);
    }
  }
  if (line) lines.push(line);
  return lines;
}

// The suffocation warning wrapped at a size inside a box width: lines and the height they need.
export function warningBlock(text, size, width) {
  const lines = wrap(text, width, size, false);
  return { lines, height: lines.length * size * 1.2, size };
}

// ---------- CSV ----------

export function parseCsv(text) {
  const src = String(text ?? '').replace(/^﻿/, '');
  const first = src.split(/\r?\n/, 1)[0] ?? '';
  const delim = first.includes('\t') ? '\t' : first.includes(';') && !first.includes(',') ? ';' : ',';
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else field += c;
    } else if (c === '"' && field === '') quoted = true;
    else if (c === delim) { row.push(field); field = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

// A product list as CSV: a header row, then one product per row. Columns (any order, case and
// spaces ignored): name, sku, fnsku, types (separated by | or ;), length, width, height, dim_unit,
// weight, weight_unit, seller (brand or reseller), manufacturer_barcode (yes/no), volume,
// volume_unit, container, lid, hazmat, secondary_seal, locking, bag_width, bag_length, bag_mil,
// warning_printed, units_per_box.
const COLS = {
  name: ['name', 'title', 'product', 'productname'], sku: ['sku', 'msku', 'sellersku'], fnsku: ['fnsku'], types: ['types', 'type', 'category', 'categories', 'prepcategory'],
  length: ['length', 'l'], width: ['width', 'w'], height: ['height', 'h'], dim_unit: ['dimunit', 'dimensionunit', 'unit'],
  weight: ['weight', 'unitweight'], weight_unit: ['weightunit'], seller: ['seller', 'sellertype'], manufacturer_barcode: ['manufacturerbarcode', 'upc', 'hasupc'],
  volume: ['volume'], volume_unit: ['volumeunit'], container: ['container'], lid: ['lid'], hazmat: ['hazmat'], secondary_seal: ['secondaryseal', 'doubleseal'], locking: ['locking'],
  bag_width: ['bagwidth'], bag_length: ['baglength'], bag_mil: ['bagmil', 'mil'], warning_printed: ['warningprinted'], units_per_box: ['unitsperbox'],
};
const key = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
const yes = (s) => /^(y|yes|true|1)$/i.test(String(s ?? '').trim());
const num = (s) => {
  const t = String(s ?? '').trim();
  if (!t) return undefined;
  const n = Number(t);
  return Number.isFinite(n) ? n : NaN;
};

export function productsFromCsv(text) {
  if (String(text ?? '').length > LIMITS.csvChars) throw new PrepError(`A list of at most ${LIMITS.csvChars.toLocaleString('en-US')} characters.`, 'csv');
  const rows = parseCsv(text);
  if (rows.length < 2) throw new PrepError('Give a header row and at least one product.', 'csv');
  const head = rows[0].map(key);
  const idx = {};
  for (const [k, names] of Object.entries(COLS)) {
    const i = head.findIndex((h) => names.includes(h));
    if (i >= 0) idx[k] = i;
  }
  if (idx.name === undefined && idx.sku === undefined) throw new PrepError('The header needs a name or sku column.', 'csv');
  const out = [];
  rows.slice(1).forEach((r, n) => {
    const line = n + 2;
    const get = (k) => (idx[k] === undefined ? '' : String(r[idx[k]] ?? '').trim());
    const p = {};
    if (get('name')) p.name = get('name').slice(0, LIMITS.name);
    if (get('sku')) p.sku = get('sku').slice(0, 80);
    if (get('fnsku')) p.fnsku = get('fnsku');
    const types = get('types').split(/[|;]/).map((x) => x.trim().toLowerCase()).filter(Boolean);
    for (const t of types) if (!TYPE_IDS.includes(t)) throw new PrepError(`Line ${line}: "${t}" is not a product type; use ${TYPE_IDS.join(', ')}.`, 'csv');
    p.types = types;
    const L = num(get('length'));
    const W = num(get('width'));
    const H = num(get('height'));
    if ([L, W, H].some((x) => Number.isNaN(x))) throw new PrepError(`Line ${line}: a dimension is not a number.`, 'csv');
    if (L !== undefined && W !== undefined && H !== undefined) p.dims = { length: L, width: W, height: H, unit: get('dim_unit') === 'cm' ? 'cm' : 'in' };
    const wt = num(get('weight'));
    if (Number.isNaN(wt)) throw new PrepError(`Line ${line}: the weight is not a number.`, 'csv');
    if (wt !== undefined) p.weight = { value: wt, unit: ['lb', 'oz', 'kg', 'g'].includes(get('weight_unit')) ? get('weight_unit') : 'lb' };
    if (get('seller')) p.barcode = { seller: get('seller') === 'brand' ? 'brand' : 'reseller' };
    if (get('manufacturer_barcode')) p.barcode = { ...(p.barcode ?? {}), manufacturerBarcode: yes(get('manufacturer_barcode')) };
    if (types.includes('liquid')) {
      const v = num(get('volume'));
      p.liquid = {};
      if (v !== undefined && !Number.isNaN(v)) p.liquid.volume = v;
      if (get('volume_unit') === 'ml') p.liquid.unit = 'ml';
      if (CONTAINERS.includes(get('container'))) p.liquid.container = get('container');
      if (LIDS.includes(get('lid'))) p.liquid.lid = get('lid');
      if (get('hazmat')) p.liquid.hazmat = yes(get('hazmat'));
      if (get('secondary_seal')) p.liquid.secondarySeal = yes(get('secondary_seal'));
      if (get('locking')) p.liquid.locking = yes(get('locking'));
    }
    const bw = num(get('bag_width'));
    const bl = num(get('bag_length'));
    const bm = num(get('bag_mil'));
    if (bw !== undefined && bl !== undefined && !Number.isNaN(bw) && !Number.isNaN(bl)) p.bag = { width: bw, length: bl, unit: get('dim_unit') === 'cm' ? 'cm' : 'in' };
    if (bm !== undefined && !Number.isNaN(bm)) p.bag = { ...(p.bag ?? {}), mil: bm };
    if (get('warning_printed')) p.bag = { ...(p.bag ?? {}), warningPrinted: yes(get('warning_printed')) };
    const upb = num(get('units_per_box'));
    if (upb !== undefined && Number.isInteger(upb) && upb > 0) p.unitsPerBox = upb;
    out.push(p);
  });
  if (out.length > LIMITS.products) throw new PrepError(`At most ${LIMITS.products} products in one list.`, 'csv');
  return out;
}
