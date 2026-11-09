// The minimum wage engine: the legal minimum wage (and tipped cash wage) at a place on a date, as the
// highest of the federal, state, county and city rates in force there, which government sets it,
// and when it changes next.
//
// The engine knows no rate of its own. Everything comes in through makeEngine() as dated data read
// from official pages: DOL's state table (the base for every state), DOL's tipped table, the state
// labor departments' dated steps and announced changes (data/states.json) and each city's or
// county's own page (data/local.json). A place or state whose page could not be read is "not
// covered" and is never filled in from somewhere else: an answer that depends on it says so.
//
// Pure and dependency-free: the page loads this same file (README, "core.js is browser-loadable").
// Rates are worked in mills (thousandths of a dollar), because South Dakota prints $5.925.

export class WageError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'WageError';
    this.field = field;
  }
}

export const LIMITS = { places: 1000, addresses: 100, windowDays: 800, text: 200 };
export const FIRST_DATE = '2009-07-24';
export const LAST_DATE = '2030-12-31';

export const STATES = {
  AL: ['Alabama', '01'], AK: ['Alaska', '02'], AZ: ['Arizona', '04'], AR: ['Arkansas', '05'], CA: ['California', '06'],
  CO: ['Colorado', '08'], CT: ['Connecticut', '09'], DE: ['Delaware', '10'], DC: ['District of Columbia', '11'], FL: ['Florida', '12'],
  GA: ['Georgia', '13'], HI: ['Hawaii', '15'], ID: ['Idaho', '16'], IL: ['Illinois', '17'], IN: ['Indiana', '18'],
  IA: ['Iowa', '19'], KS: ['Kansas', '20'], KY: ['Kentucky', '21'], LA: ['Louisiana', '22'], ME: ['Maine', '23'],
  MD: ['Maryland', '24'], MA: ['Massachusetts', '25'], MI: ['Michigan', '26'], MN: ['Minnesota', '27'], MS: ['Mississippi', '28'],
  MO: ['Missouri', '29'], MT: ['Montana', '30'], NE: ['Nebraska', '31'], NV: ['Nevada', '32'], NH: ['New Hampshire', '33'],
  NJ: ['New Jersey', '34'], NM: ['New Mexico', '35'], NY: ['New York', '36'], NC: ['North Carolina', '37'], ND: ['North Dakota', '38'],
  OH: ['Ohio', '39'], OK: ['Oklahoma', '40'], OR: ['Oregon', '41'], PA: ['Pennsylvania', '42'], RI: ['Rhode Island', '44'],
  SC: ['South Carolina', '45'], SD: ['South Dakota', '46'], TN: ['Tennessee', '47'], TX: ['Texas', '48'], UT: ['Utah', '49'],
  VT: ['Vermont', '50'], VA: ['Virginia', '51'], WA: ['Washington', '53'], WV: ['West Virginia', '54'], WI: ['Wisconsin', '55'], WY: ['Wyoming', '56'],
};
export const stateName = (code) => STATES[code]?.[0] ?? code;
export const stateSlug = (code) => stateName(code).toLowerCase().replace(/[^a-z]+/g, '-');
export const CODE_BY_FIPS = Object.fromEntries(Object.entries(STATES).map(([c, [, f]]) => [f, c]));
const CODE_BY_NAME = Object.fromEntries(Object.entries(STATES).flatMap(([c, [n]]) => [[n.toLowerCase(), c], [c.toLowerCase(), c]]));

// ---------- numbers, dates and words ----------

export const mills = (s) => Math.round(Number(s) * 1000);
export const dollars = (m) => (m % 10 ? (m / 1000).toFixed(3) : (m / 1000).toFixed(2));
export const money = (m) => `$${dollars(m)}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
export function isRealDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}
export const addDays = (iso, n) => new Date(Date.parse(`${iso}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000);
const listWords = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
export const readState = (s) => CODE_BY_NAME[String(s ?? '').trim().toLowerCase().replace(/\.$/, '')] ?? null;
const norm = (s) => String(s ?? '').toLowerCase().replace(/^city of |^saint |^st\.? /, (m) => (m.startsWith('s') ? 'saint ' : ''))
  .replace(/ (city|town|village|county)$/, '').replace(/[^a-z0-9]+/g, ' ').trim();

// ---------- the rules, built once from the data ----------

// One jurisdiction's dated steps. Each step: { from (null: in force on asOf, start not stated),
// asOf, rate (mills, null: no law of its own, 'unknown': not covered), tippedCash, variants,
// regions, src }.
function stepOf(s, extra = {}) {
  const rate = s.rate === 'unknown' ? 'unknown' : s.rate == null ? null : mills(s.rate);
  const cash = s.tippedCash === undefined ? undefined : s.tippedCash === 'unknown' ? 'unknown' : mills(s.tippedCash);
  return {
    from: s.from ?? null,
    asOf: s.from ? null : extra.asOf,
    rate,
    tippedCash: cash,
    variants: (s.variants ?? []).map((v) => ({ ...v, rate: v.rate === 'unknown' ? 'unknown' : v.rate == null ? null : mills(v.rate) })),
    regions: s.regions ? Object.fromEntries(Object.entries(s.regions).map(([k, r]) => [k, {
      rate: mills(r.rate), tippedCash: r.tippedCash ? mills(r.tippedCash) : undefined, foodCash: r.foodCash ? mills(r.foodCash) : undefined,
    }])) : null,
    pending: Boolean(s.pending),
    basis: s.basis ?? 'stated',
    src: s.src ?? extra.src ?? null,
  };
}
const startOf = (st) => st.from ?? st.asOf;

function buildStates({ dol, tipped, states }) {
  const out = {};
  for (const [code, [name, fips]] of Object.entries(STATES)) {
    const base = dol.states[code] ?? {};
    const tip = tipped.states[code] ?? {};
    const site = states.states[code] ?? { steps: [], sources: {} };
    const noTipCredit = Boolean(tip.noTipCredit) || site.tipCredit === false;
    const sources = { dol: { title: dol.source, url: dol.url, readOn: dol.readOn, dated: dol.pageUpdated }, ...site.sources };
    const steps = site.steps.map((s) => stepOf(s));
    const dolDate = dol.pageUpdated;
    const inForce = steps.filter((s) => s.from && s.from <= dolDate).pop();
    const dolStep = stepOf({ from: null, rate: base.basic ?? null, tippedCash: tip.cash ?? undefined, src: 'dol' }, { asOf: dolDate });
    let conflict = null;
    if (inForce) {
      if (base.basic && inForce.rate !== mills(base.basic)) conflict = `DOL's table (${dolDate}) shows $${base.basic}; the state's page shows ${money(inForce.rate)}.`;
      if (inForce.tippedCash === undefined && tip.cash) inForce.tippedCash = mills(tip.cash);
    } else {
      // The DOL rate is in force on DOL's date; a state step before it (none here) would date it.
      const regionsStep = steps.find((s) => s.regions && !s.from);
      if (regionsStep) Object.assign(regionsStep, { asOf: dolDate });
      else steps.unshift(dolStep);
    }
    steps.sort((a, b) => startOf(a).localeCompare(startOf(b)));
    out[code] = {
      code, name, fips, slug: stateSlug(code), level: 'state', id: stateSlug(code),
      steps, sources, noTipCredit,
      dolNote: base.note ?? null,
      tip: { ...tip, credit: tip.credit ? mills(tip.credit) : null, cash: tip.cash ? mills(tip.cash) : null },
      regions: site.regions ?? null, regionNote: site.regionNote ?? null, tipNote: site.tipNote ?? null,
      blocked: site.blocked ?? null, indexed: Boolean(site.indexed), next: site.next ?? null, nextNote: site.nextNote ?? null,
      noLaw: base.basic == null, conflict, coveredTo: site.coveredTo ?? null,
    };
  }
  return out;
}

// The last date a local rate is known for: the day before its next yearly adjustment after the last
// step we read (an ordinance that adjusts every January 1 or July 1 publishes the next rate late).
const MONTH_NO = Object.fromEntries(MONTHS.map((m, i) => [m, i + 1]));
export function coveredToOf(annual, lastStart) {
  const days = [...String(annual ?? '').matchAll(/(January|February|March|April|May|June|July|August|September|October|November|December) (\d{1,2})/g)]
    .map((m) => [MONTH_NO[m[1]], Number(m[2])]);
  if (!days.length || !lastStart) return null;
  const y = Number(lastStart.slice(0, 4));
  const cands = [];
  for (const yy of [y, y + 1]) for (const [mo, d] of days) cands.push(`${yy}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  const nextDate = cands.filter((c) => c > lastStart).sort()[0];
  return addDays(nextDate, -1);
}

function buildLocals({ local, states }) {
  return local.places.map((p) => {
    const sources = Object.fromEntries((p.sources ?? []).map((s) => [s.id, s]));
    const firstSrc = p.sources?.[0]?.id ?? null;
    return {
      ...p,
      level: p.kind === 'city' ? 'city' : 'county',
      covered: p.status === 'covered',
      steps: (p.steps ?? []).map((s) => stepOf(s, { asOf: local.readOn, src: firstSrc })).sort((a, b) => startOf(a).localeCompare(startOf(b))),
      sources,
      noTipCredit: states.states[p.state]?.tipCredit === false,
      tipCreditMax: p.tipCreditMax ? mills(p.tipCreditMax) : null,
      notes: p.notes ?? [],
      coveredTo: p.coveredTo ?? (p.steps?.length ? coveredToOf(p.annual, p.steps.map((x) => x.from ?? local.readOn).sort().pop()) : null),
    };
  });
}

// ---------- which rules apply where ----------

// A location: { state, county: { fips, name } | null, counties: [...] (ZIP), place: { geoid, name } |
// null (unincorporated) | undefined (not known), precision }.
function localsFor(rules, loc) {
  const counties = loc.county ? [loc.county.fips] : [];
  const out = [];
  for (const l of rules.locals) {
    if (l.state !== loc.state) continue;
    const countyName = l.name.replace(/ \(unincorporated\)$/, '');
    if (l.kind === 'city') {
      if (loc.place && loc.place.geoid === l.place) out.push({ rule: l, certain: true });
    } else if (!counties.length) {
      // A city named without its county: a county-wide ordinance may still reach it.
      if (l.kind === 'county' && loc.precision === 'city') out.push({ rule: l, certain: false, why: `if the work is in ${countyName}${l.optOut ? ' and the municipality has not opted out' : ''}` });
    } else if (!counties.includes(l.county)) {
      continue;
    } else if (l.kind === 'unincorporated') {
      if (loc.place === null) out.push({ rule: l, certain: true });
      else if (loc.place === undefined) out.push({ rule: l, certain: false, why: `in unincorporated ${countyName} (outside any city)` });
    } else if (!l.optOut || loc.place === null) {
      out.push({ rule: l, certain: true });
    } else {
      out.push({ rule: l, certain: false, why: loc.place ? 'only if the municipality has not opted out of the county ordinance' : 'in unincorporated areas and in municipalities that have not opted out' });
    }
  }
  // A city with its own ordinance (Chicago) follows its own, not the county's.
  if (out.some((x) => x.rule.kind === 'city' && x.certain)) return out.filter((x) => !(x.rule.kind === 'county' && x.rule.optOut));
  return out;
}

const stepAt = (steps, date) => {
  let hit = null;
  for (const s of steps) if (startOf(s) <= date) hit = s;
  return hit;
};
// The first step of the run of steps that set the same rates as this one (a dated restatement, such
// as New York's "stays the same" on January 1, 2027, does not restart "since").
function runStart(steps, step, rateOf) {
  let i = steps.indexOf(step);
  while (i > 0 && rateOf(steps[i - 1]) === rateOf(steps[i])) i -= 1;
  return steps[i];
}

// The rate one jurisdiction sets for a date and employer, or why it cannot be said.
function layerRate(rule, step, { employees, regionId }) {
  let rate = step.rate;
  let cash = step.tippedCash;
  let foodCash;
  let variant = null;
  const others = [];
  if (step.regions && regionId && step.regions[regionId]) {
    ({ rate } = step.regions[regionId]);
    if (step.regions[regionId].tippedCash !== undefined) cash = step.regions[regionId].tippedCash;
    foodCash = step.regions[regionId].foodCash;
  }
  for (const v of step.variants) {
    const bySize = v.min !== undefined || v.max !== undefined;
    const fits = bySize && employees !== undefined && (v.min === undefined || employees >= v.min) && (v.max === undefined || employees <= v.max);
    if (fits && !variant) variant = v;
    else others.push(v);
  }
  if (variant) rate = variant.rate;
  return { rate, cash, foodCash, variant, others };
}

function cashFor(rule, rate, cash) {
  if (rate === null || rate === 'unknown') return undefined;
  if (cash !== undefined) return cash;
  if (rule.level === 'state' ? rule.noTipCredit : rule.noTipCredit) return rate;
  if (rule.tipCreditMax) return rate - rule.tipCreditMax;
  return 'unknown';
}

const sourceOf = (rule, step) => {
  const s = rule.sources?.[step?.src] ?? Object.values(rule.sources ?? {})[0] ?? null;
  return s ? { title: s.title, url: s.url, readOn: s.readOn, ...(s.dated ? { dated: s.dated } : {}) } : null;
};

// ---------- the engine ----------

export function makeEngine(data) {
  const readDay = data.local.readOn;
  const states = buildStates(data);
  const locals = buildLocals(data);
  const rules = { states, locals };
  const federal = { level: 'federal', name: 'Federal (FLSA)', rate: mills(data.states.federal.rate), cash: mills(data.states.federal.cash), from: data.states.federal.from, source: { ...data.states.federal.source, readOn: data.states.readOn } };
  const zctas = data.zctaPlaces?.zctas ?? {};
  const placeNames = data.zctaPlaces?.places ?? {};
  const byPlace = new Map(locals.filter((l) => l.place).map((l) => [l.place, l]));
  const localById = new Map(locals.map((l) => [l.id, l]));

  function regionOf(st, loc) {
    if (!st.regions) return { id: null };
    const counties = loc.county ? [loc.county.fips] : [];
    for (const r of st.regions) {
      if (r.counties && counties.some((c) => r.counties.includes(c))) return { id: r.id, label: r.label, partial: Boolean(r.partial) };
    }
    if (!counties.length) return { id: null, unknown: true };
    const rest = st.regions.find((r) => !r.counties);
    return { id: rest.id, label: rest.label };
  }

  // Every layer at a location and date: federal, state, county, city.
  function layersAt(loc, date, opts = {}) {
    const st = states[loc.state];
    const layers = [];
    const notes = [];
    const notCovered = [];
    const possible = [];
    layers.push({ level: 'federal', id: 'federal', name: federal.name, rate: federal.rate, cash: federal.cash, from: federal.from, source: federal.source, flsa: true });
    const region = regionOf(st, loc);
    const sStep = stepAt(st.steps, date);
    if (sStep && st.coveredTo && date > st.coveredTo) {
      notCovered.push({ level: 'state', id: st.id, name: st.name, why: `${st.name}'s rate from ${longDate(addDays(st.coveredTo, 1))} was not on the pages we read on ${longDate(readDay)}${st.blocked ? ` (${st.blocked})` : ''}.`, url: sourceOf(st, sStep)?.url });
    } else if (!sStep) {
      notCovered.push({ level: 'state', id: st.id, name: st.name, why: `We hold ${st.name}'s rates from ${longDate(startOf(st.steps[0]))}; earlier dates are not covered.`, url: st.sources.dol.url });
    } else {
      const regionId = region.partial ? 'standard' : region.id;
      const r = layerRate(st, sStep, { employees: opts.employees, regionId });
      const since = runStart(st.steps, sStep, (x) => layerRate(st, x, { employees: opts.employees, regionId }).rate);
      if (r.rate === 'unknown') notCovered.push({ level: 'state', id: st.id, name: st.name, why: r.variant?.label ?? 'not stated on the pages we read', url: sourceOf(st, sStep)?.url });
      else if (r.rate !== null) {
        layers.push({ level: 'state', id: st.id, name: st.name, rate: r.rate, cash: cashFor(st, r.rate, r.cash), foodCash: r.foodCash, from: since.from, asOf: since.asOf, variant: r.variant?.label ?? null, region: region.label ?? null, source: sourceOf(st, sStep) });
      }
      for (const v of r.others) if (v.rate !== 'unknown') notes.push(`${st.name}: ${v.label}${v.rate && !v.label.includes('$') ? `: ${money(v.rate)}` : ''}.`);
      if (st.regions && region.unknown) notes.push(`${st.name} sets different rates by region; give the county or address for the regional rate (${st.regions.filter((x) => x.counties).map((x) => `${x.label} ${money(sStep.regions?.[x.id]?.rate ?? 0)}`).join(', ')}).`);
      if (region.partial && st.regionNote) {
        notes.push(st.regionNote);
        possible.push({ level: 'state', id: st.id, name: `${st.name} (${region.label})`, rate: sStep.regions[region.id].rate, when: 'inside the Portland metro urban growth boundary' });
      }
    }
    if (st.noLaw) notes.push(`${st.name} has no minimum wage law of its own; employers covered by the federal Fair Labor Standards Act pay at least $7.25.`);
    else if (st.dolNote && sStep && !sStep.from) notes.push(`DOL on ${st.name}: ${st.dolNote}`);
    for (const { rule, certain, why } of localsFor(rules, loc)) {
      if (!rule.covered) {
        (certain ? notCovered : possible).push({ level: rule.level, id: rule.id, name: rule.name, why: rule.reason, url: rule.url ?? null, ...(certain ? {} : { when: why }) });
        continue;
      }
      const step = stepAt(rule.steps, date);
      if (step && rule.coveredTo && date > rule.coveredTo) {
        const why = `${rule.name} adjusts its rate every ${rule.annual}; the rate from ${longDate(addDays(rule.coveredTo, 1))} was not published on its page when we read it on ${longDate(readDay)}.`;
        (certain ? notCovered : possible).push({ level: rule.level, id: rule.id, name: rule.name, why, url: sourceOf(rule, step)?.url, ...(certain ? {} : { when: why }) });
        continue;
      }
      if (!step) {
        const why = rule.gap ?? `The ${rule.name} page we read gives rates from ${longDate(startOf(rule.steps[0]))}; earlier dates are not covered.`;
        (certain ? notCovered : possible).push({ level: rule.level, id: rule.id, name: rule.name, why, url: sourceOf(rule, rule.steps[0])?.url, ...(certain ? {} : { when: why }) });
        continue;
      }
      const r = layerRate(rule, step, { employees: opts.employees });
      const since = runStart(rule.steps, step, (x) => layerRate(rule, x, { employees: opts.employees }).rate);
      const entry = { level: rule.level, id: rule.id, name: rule.name, from: since.from, asOf: since.asOf, variant: r.variant?.label ?? null, source: sourceOf(rule, step), pending: step.pending, basis: step.basis };
      if (r.rate === 'unknown') {
        const why = r.variant ? `${r.variant.label}: not stated on the city's page` : (rule.pending ?? 'not stated on the page we read');
        (certain ? notCovered : possible).push({ ...entry, why, url: entry.source?.url, ...(certain ? {} : { when: why }) });
        continue;
      }
      if (r.rate === null) {
        notes.push(`${rule.name}: ${r.variant?.label ?? 'not covered by the local rate'}.${r.variant?.unless ? ` ${r.variant.unless}` : ''}`);
        continue;
      }
      const layer = { ...entry, rate: r.rate, cash: cashFor(rule, r.rate, r.cash) };
      if (certain) layers.push(layer);
      else possible.push({ ...layer, when: why });
      for (const v of r.others) {
        if (v.rate === 'unknown') continue;
        notes.push(`${rule.name}: ${v.label}${v.rate && !/\$\d/.test(v.label) ? `, ${money(v.rate)}` : ''}${v.rate === null ? '' : ''}.${v.unless ? ` ${v.unless}` : ''}`);
      }
      if (r.variant?.unless) notes.push(`${rule.name}: ${r.variant.unless}`);
      if (certain) for (const n of rule.notes) notes.push(n);
      if (certain && rule.tipNote) notes.push(`${rule.name}: ${rule.tipNote}`);
    }
    if (st.tipNote && date >= '2027-01-01') notes.push(st.tipNote);
    return { layers, notes, notCovered, possible, region };
  }

  // The answer at one place and date.
  function rateAt(loc, date, opts = {}) {
    const { layers, notes, notCovered, possible } = layersAt(loc, date, opts);
    const top = layers.reduce((a, b) => (b.rate > a.rate || (b.rate === a.rate && rank(b) > rank(a)) ? b : a));
    const cashes = layers.map((l) => l.cash);
    const tippedCash = cashes.some((c) => c === 'unknown') ? 'unknown' : Math.max(...cashes.filter((c) => c !== undefined));
    const next = nextChange(loc, date, opts, top.rate);
    const status = notCovered.length ? 'not-covered' : possible.length ? 'depends' : 'answered';
    return { status, rate: top.rate, setBy: top, layers, tippedCash, next, notes: [...new Set(notes)], notCovered, possible };
  }
  const rank = (l) => ({ federal: 0, state: 1, county: 2, city: 3 }[l.level]);

  // The first later date on which the applicable rate changes, within the data we hold.
  function nextChange(loc, date, opts, current) {
    const st = states[loc.state];
    const dates = new Set();
    for (const s of st.steps) if (s.from && s.from > date) dates.add(s.from);
    if (st.coveredTo && st.coveredTo >= date) dates.add(addDays(st.coveredTo, 1));
    for (const { rule } of localsFor(rules, loc)) {
      for (const s of rule.steps ?? []) if (s.from && s.from > date) dates.add(s.from);
      if (rule.coveredTo && rule.coveredTo >= date) dates.add(addDays(rule.coveredTo, 1));
    }
    for (const d of [...dates].sort()) {
      const { layers, notCovered } = layersAt(loc, d, opts);
      const top = layers.reduce((a, b) => (b.rate > a.rate ? b : a));
      const unknown = notCovered.length > 0;
      if (unknown) return { date: d, rate: null, setBy: null, unknown: true, why: notCovered.map((n) => `${n.name}: ${n.why}`).join(' ') };
      if (top.rate !== current) return { date: d, rate: top.rate, setBy: { level: top.level, id: top.id, name: top.name }, pending: Boolean(top.pending), basis: top.basis ?? 'stated', source: top.source };
    }
    return null;
  }

  // ---------- reading where the work is ----------

  function findLocal(state, text) {
    const n = norm(text);
    if (!n) return null;
    return locals.find((l) => l.state === state && (norm(l.name) === n || norm(l.name.replace(/ \(unincorporated\)$/, '')) === n && l.kind === 'city')) ?? null;
  }

  // A place from names: state, optional city and county (name or FIPS). counties: the zip-to-county
  // tool's county list for the state (fips -> name), handed in by tool.js.
  function placeFromNames({ state, city, county, unincorporated }, countyIndex) {
    const code = readState(state);
    if (!code) throw new WageError(`"${state}" is not a US state or DC: give a two-letter code such as CA.`, 'state');
    let c = null;
    if (county) {
      const fips = /^\d{5}$/.test(String(county).trim()) ? String(county).trim() : null;
      const hit = fips ? countyIndex.byFips(fips) : countyIndex.byName(code, county);
      if (!hit || hit.state !== code) throw new WageError(`No county "${county}" in ${stateName(code)} in the Census 2020 county list.`, 'county');
      c = { fips: hit.fips, name: hit.name };
    }
    let place;
    let cityRule = null;
    if (city) {
      cityRule = locals.find((l) => l.state === code && l.kind === 'city' && norm(l.name) === norm(city));
      place = cityRule ? { geoid: cityRule.place, name: cityRule.name } : { geoid: null, name: String(city).trim() };
    } else if (unincorporated) {
      if (!c) throw new WageError('An unincorporated place needs its county: give county as a name or a 5-digit FIPS code.', 'county');
      place = null;
    }
    else place = undefined;
    return { precision: city ? 'city' : c ? 'county' : 'state', state: code, county: c, place, cityKnown: Boolean(cityRule) };
  }

  // The cities with their own rate a ZIP code area has land in (Census 2020 ZCTA-place file).
  const citiesInZcta = (zcta) => (zctas[zcta] ?? []).map(([geoid, share]) => ({ geoid, name: byPlace.get(geoid)?.name ?? placeNames[geoid], share, rule: byPlace.get(geoid) ?? null }));

  // ---------- one lookup ----------

  function answer(loc, date, opts = {}, label = null) {
    const r = rateAt(loc, date, opts);
    const where = label && loc.precision === 'zip' ? label : `${whereText(loc)}${label ? ` (${label})` : ''}`;
    const layer = (l) => ({
      level: l.level, id: l.id, name: l.name, rate: dollars(l.rate),
      from: l.from ?? null, inForceOn: l.from ? null : l.asOf ?? null,
      tippedCash: l.cash === undefined ? null : l.cash === 'unknown' ? 'unknown' : dollars(l.cash),
      ...(l.foodCash ? { tippedFoodServiceCash: dollars(l.foodCash) } : {}),
      ...(l.variant ? { tier: l.variant } : {}), ...(l.region ? { region: l.region } : {}),
      ...(l.pending ? { pending: true } : {}), ...(l.basis === 'formula' ? { basis: 'formula' } : {}),
      source: l.source,
    });
    const out = {
      where, date, status: r.status,
      rate: dollars(r.rate),
      setBy: { level: r.setBy.level, id: r.setBy.id, name: r.setBy.name },
      since: r.setBy.from ?? null,
      tippedCash: r.tippedCash === 'unknown' ? 'unknown' : dollars(r.tippedCash),
      next: r.next ? (r.next.unknown ? { date: r.next.date, rate: null, why: r.next.why } : { date: r.next.date, rate: dollars(r.next.rate), setBy: r.next.setBy, ...(r.next.pending ? { pending: true } : {}), ...(r.next.basis === 'formula' ? { basis: 'formula' } : {}) }) : null,
      layers: r.layers.map(layer),
      possible: r.possible.map((p) => ({ level: p.level, id: p.id, name: p.name, when: p.when, ...(p.rate !== undefined ? { rate: dollars(p.rate) } : { why: p.why }) })),
      notCovered: r.notCovered.map((n) => ({ level: n.level, id: n.id, name: n.name, why: n.why, url: n.url ?? null })),
      notes: r.notes,
    };
    out.answer = sentence(out, loc);
    return out;
  }

  function whereText(loc) {
    const st = loc.state === 'DC' ? 'the District of Columbia' : stateName(loc.state);
    if (loc.matched) return loc.matched;
    if (loc.place?.name) return `${loc.place.name}, ${st}`;
    if (loc.county && loc.place === null) return `unincorporated ${loc.county.name}, ${st}`;
    if (loc.county) return `${loc.county.name}, ${st}`;
    return st;
  }

  function sentence(o, loc) {
    const at = loc.precision === 'address' ? 'At' : 'In';
    const head = o.status === 'not-covered'
      ? `${at} ${o.where} on ${longDate(o.date)} the minimum wage is at least $${o.rate} an hour, but ${listWords(o.notCovered.map((n) => n.name))} ${o.notCovered.length > 1 ? 'are' : 'is'} not covered: ${o.notCovered[0].why}`
      : `${at} ${o.where} on ${longDate(o.date)} the minimum wage is $${o.rate} an hour, set by ${setByText(o.setBy)}${o.since ? ` (since ${longDate(o.since)})` : ''}.`;
    const parts = [head.endsWith('.') ? head : `${head}.`];
    if (o.status === 'depends') parts.push(`It can be higher: ${o.possible.map((p) => `${p.name}${p.rate ? ` ($${p.rate})` : ''} applies ${p.when}`).join('; ')}.`);
    if (o.tippedCash !== 'unknown' && o.status !== 'not-covered') {
      parts.push(o.tippedCash === o.rate ? 'Tipped employees get the full rate: no tip credit.' : `Tipped employees: at least $${o.tippedCash} an hour in cash wages, with tips making up the rest.`);
    }
    if (o.status === 'not-covered') return parts.join(' ');
    if (o.next?.rate) parts.push(`Next change: $${o.next.rate} on ${longDate(o.next.date)}${o.next.pending ? ' (pending approval)' : ''}${o.next.basis === 'formula' ? ' (by the city\'s stated formula)' : ''}, set by ${setByText(o.next.setBy)}.`);
    else if (o.next) parts.push(`The rate changes on ${longDate(o.next.date)}, but the new rate is not covered yet.`);
    return parts.join(' ');
  }
  const setByText = (s) => (s.level === 'federal' ? 'federal law (the FLSA)' : s.level === 'state' ? (s.id === 'district-of-columbia' ? 'the District of Columbia' : `the state of ${s.name}`) : s.name);

  // ---------- the change calendar ----------

  function changes({ from, to, state = null }) {
    const rows = [];
    const add = (rule, level, steps, prevOf) => {
      steps.forEach((s, i) => {
        if (!s.from || s.from < from || s.from > to) return;
        const prev = i > 0 ? steps[i - 1] : null;
        rows.push({
          date: s.from, level, id: rule.id, name: rule.name, state: rule.code ?? rule.state,
          rate: s.rate === 'unknown' ? null : s.rate === null ? null : dollars(s.rate),
          previous: prev && typeof prev.rate === 'number' ? dollars(prev.rate) : null,
          tippedCash: typeof s.tippedCash === 'number' ? dollars(s.tippedCash) : null,
          tiers: s.variants.filter((v) => typeof v.rate === 'number').map((v) => ({ tier: v.label, rate: dollars(v.rate) })),
          regions: s.regions ? Object.entries(s.regions).map(([k, v]) => ({ region: (rule.regions ?? []).find((x) => x.id === k)?.label ?? k, rate: dollars(v.rate) })) : [],
          ...(s.pending ? { pending: true } : {}), ...(s.basis === 'formula' ? { basis: 'formula' } : {}),
          source: sourceOf(rule, s),
        });
      });
    };
    for (const st of Object.values(states)) if (!state || st.code === state) add(st, 'state', st.steps);
    for (const l of locals) if (l.covered && (!state || l.state === state)) add(l, l.level, l.steps);
    rows.sort((a, b) => a.date.localeCompare(b.date) || a.state.localeCompare(b.state) || (a.level === 'state' ? -1 : b.level === 'state' ? 1 : a.name.localeCompare(b.name)));
    // Rows whose rate equals the previous one (a dated restatement, such as Everett's July large rate) are kept only when a tier changes.
    return rows.filter((r) => r.rate !== r.previous || r.tiers.length || r.rate === null);
  }

  function checkWindow(from, to) {
    if (!isRealDate(from)) throw new WageError('from must be a real date written like 2027-01-01.', 'from');
    if (!isRealDate(to)) throw new WageError('to must be a real date written like 2027-12-31.', 'to');
    if (to < from) throw new WageError('to must be on or after from.', 'to');
    if (daysBetween(from, to) > LIMITS.windowDays) throw new WageError(`The window is at most ${LIMITS.windowDays} days.`, 'to');
  }

  return {
    states, locals, federal, rules, localById, byPlace,
    layersAt, rateAt, answer, changes, checkWindow, placeFromNames, citiesInZcta, findLocal, whereText,
    dates: { first: FIRST_DATE, last: LAST_DATE },
  };
}

// ---------- ZIP code areas ----------

// The answer for a ZIP code: each county and each city with its own rate the ZIP area has land in,
// as candidate places. A ZIP wholly inside one city and one county is answered; otherwise the
// answers per candidate are listed, and the street address decides.
export function zipCandidates(engine, zip, counties) {
  const cities = engine.citiesInZcta(zip);
  const out = [];
  for (const c of cities) {
    const rule = c.rule;
    const county = counties.find((k) => rule?.county === k.fips) ?? (counties.length === 1 ? counties[0] : null);
    out.push({ share: c.share, loc: { state: rule.state, county: county ? { fips: county.fips, name: county.name } : null, place: { geoid: c.geoid, name: rule.name }, precision: 'zip' }, label: `the part of ZIP ${zip} in ${rule.name}` });
  }
  const inCities = cities.reduce((a, c) => a + c.share, 0);
  if (inCities < 0.999) {
    for (const k of counties) {
      if (!engine.states[k.state]) continue;
      out.push({ share: null, countyShare: k.share, loc: { state: k.state, county: { fips: k.fips, name: k.name }, place: undefined, precision: 'zip', outsideCities: cities.map((c) => c.name) }, label: `the rest of ZIP ${zip} in ${k.name}, ${stateName(k.state)}${cities.length ? ` (outside ${listWords(cities.map((c) => c.name))})` : ''}` });
    }
  }
  return out;
}
