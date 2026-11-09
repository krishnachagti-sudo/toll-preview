// The cleaning bid engine: a building walk-through (cleanable square feet, area tasks at the
// contractor's own production rates, restroom fixtures and glass panes at their own minutes each,
// fixed-time tasks) turned into labor hours by line, a loaded hourly cost, a price per visit and per
// month (janitorial) or per phase (post-construction: rough, final, touch-up), and a dollars per
// square foot check against the contractor's own target range.
//
// No production rate, minutes per fixture or market price lives here: every one is an input. The
// only figures the engine knows are official and come in as data through makeEngine(): BLS OEWS
// May 2025 wages (optional wage prefill), IRS Publication 15 (2026) employer payroll tax rates, BLS
// ECEC June 2026 benefit costs for service occupations, and the DOL state minimum wage table (a
// floor check only).
//
// Pure and dependency-free: the page loads this same file. Money is worked in cents at full
// precision and rounded to whole cents once per line, so the lines always add up to the total.

export class BidError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'BidError';
    this.field = field;
  }
}

export const BID_TYPES = ['janitorial', 'post-construction'];
export const PHASES = ['rough', 'final', 'touch-up'];
export const PHASE_NAMES = { rough: 'Rough clean', final: 'Final clean', 'touch-up': 'Touch-up clean' };
export const CATEGORIES = ['area', 'restroom', 'glass', 'other'];
export const CATEGORY_NAMES = { area: 'Area tasks', restroom: 'Restrooms and fixtures', glass: 'Glass', other: 'Other tasks' };
export const BURDEN_MODES = ['itemized', 'ecec', 'flat'];
export const OCCUPATIONS = ['janitors', 'maids'];
export const WAGE_STATS = ['median', 'mean'];
export const TARGET_BASES = ['visit', 'month', 'job'];
export const LIMITS = { lines: 60, extras: 20, sqft: 10_000_000, rate: 100_000, count: 100_000, minutes: 600, hours: 2000, wage: 500, amount: 1_000_000 };
// Weeks in a month on average: 52 weeks / 12 months.
export const WEEKS_PER_MONTH = 52 / 12;

// ---------- numbers and words ----------

const clean = (x) => Math.round(x * 1e6) / 1e6;
const roundCents = (x) => Math.round(clean(x));
const r2 = (x) => Math.round(clean(x) * 100) / 100;

const group3 = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// Cents to "$1,234.56".
export const usd = (c) => `${c < 0 ? '-' : ''}$${group3(Math.floor(Math.abs(c) / 100).toString())}.${String(Math.abs(c) % 100).padStart(2, '0')}`;
// Dollars per square foot: cents per sq ft to "$0.123" (three places; four under a cent).
export function perSqft(centsPerSqft) {
  const d = centsPerSqft / 100;
  const places = Math.abs(d) < 0.01 ? 4 : 3;
  return `$${(Math.round(clean(d) * 10 ** places) / 10 ** places).toFixed(places)}`;
}
export const hoursText = (h) => r2(h).toFixed(2);
export const intText = (n) => group3(String(Math.round(n)));
export const pctText = (p) => `${Number(r2(p).toFixed(2))}%`;
export const rateText = (r) => group3(String(Math.round(clean(r))));

// A number as it comes from a form or a spreadsheet: 3000, "3,000", "$18.50", "15%".
export function readNumber(v, field, { label = field, min = 0, max = Infinity, allowZero = true, integer = false } = {}) {
  let n = v;
  if (typeof v === 'string') {
    const t = v.trim().replace(/^\$/, '').replace(/%$/, '').replace(/,/g, '').trim();
    if (!/^-?(?:\d+\.?\d*|\.\d+)$/.test(t)) throw new BidError(`${label}: "${v}" is not a number.`, field);
    n = Number(t);
  }
  if (typeof n !== 'number' || !Number.isFinite(n)) throw new BidError(`${label} must be a number.`, field);
  if (integer && !Number.isInteger(n)) throw new BidError(`${label} must be a whole number.`, field);
  if (n < min || (!allowZero && n === 0)) throw new BidError(`${label} must be ${allowZero ? `at least ${min}` : 'above 0'}.`, field);
  if (n > max) throw new BidError(`${label} must be at most ${group3(String(max))}.`, field);
  return n;
}
const opt = (v) => v !== undefined && v !== null && v !== '';

// ---------- the engine ----------

// data: { wages (bls-oews-2025.json), payroll (payroll-2026.json), minimum (state-minimum-wage.json) }
export function makeEngine({ wages, payroll, minimum }) {
  const irs = payroll.irs;
  const ecec = payroll.ecec.serviceOccupations;
  // Employer FICA: social security + Medicare, from Pub 15.
  const FICA = Number(irs.socialSecurityRate) + Number(irs.medicareRate);
  const FUTA = Number(irs.futaNetRate);
  // BLS ECEC service occupations: benefits as a share of wages (5.47 / 18.26).
  const ECEC = (Number(ecec.benefits) / Number(ecec.wages)) * 100;

  const stateRow = (code) => {
    const k = String(code ?? '').trim().toUpperCase();
    if (k === 'US') return { code: 'US', ...wages.us };
    const row = wages.states[k];
    return row ? { code: k, ...row } : null;
  };

  // The wage table (op 'wages'): every state, or one.
  function wageTable({ state } = {}) {
    const rows = state ? [stateRow(state)] : [{ code: 'US', ...wages.us }, ...Object.entries(wages.states).map(([code, r]) => ({ code, ...r }))];
    if (rows.some((r) => !r)) throw new BidError(`State "${state}" is not in the table: use a two-letter code such as OH, DC or US.`, 'state');
    const one = state ? rows[0] : null;
    const answer = one
      ? `BLS May 2025: janitors and cleaners in ${one.code === 'US' ? 'the United States' : one.name} earned a median $${one.janitors.median} an hour (mean $${one.janitors.mean}); maids and housekeeping cleaners a median $${one.maids.median}. ${one.code === 'US' ? `The federal minimum wage is $${minimum.federal}.` : minimumOf(one.code) === null ? `${one.name} has no state minimum wage law; the federal $${minimum.federal} applies to FLSA-covered employers.` : `${one.name}'s minimum wage is $${minimumOf(one.code)} (DOL, updated ${minimum.pageUpdated}).${minimum.states[one.code].note ? ` ${minimum.states[one.code].note}` : ''}`}`
      : `BLS May 2025 hourly wages for janitors and cleaners and for maids and housekeeping cleaners in all 50 states, DC and the United States, with each state's minimum wage (DOL, updated ${minimum.pageUpdated}).`;
    return {
      op: 'wages',
      answer,
      source: wages.source,
      rows: rows.map((r) => ({
        code: r.code,
        name: r.name,
        janitors: { ...r.janitors },
        maids: { ...r.maids },
        minimumWage: r.code === 'US' ? minimum.federal : minimumOf(r.code),
      })),
    };
  }

  function minimumOf(code) {
    const m = minimum.states[code];
    if (!m) return null;
    return m.basic;
  }
  // The floor an FLSA-covered employer pays in a state: the higher of the state rate and $7.25.
  function floorOf(code) {
    const basic = minimumOf(code);
    const fed = Number(minimum.federal);
    return Math.max(basic === null ? 0 : Number(basic), fed);
  }

  // The hourly wage and where it came from.
  function readWage(w) {
    if (!w || typeof w !== 'object') throw new BidError('Give the cleaners\' hourly wage, such as { "hourly": 17.71 }, or a BLS figure, such as { "state": "OH" }.', 'wage');
    if (opt(w.hourly)) {
      const hourly = readNumber(w.hourly, 'wage.hourly', { label: 'Hourly wage', min: 1, max: LIMITS.wage });
      return { cents: hourly * 100, text: usd(roundCents(hourly * 100)), source: 'your wage' };
    }
    const row = stateRow(w.state);
    if (!row) throw new BidError(`State "${w.state}" is not in the BLS table: use a two-letter code such as OH, DC or US.`, 'wage.state');
    const occ = w.occupation ?? 'janitors';
    const stat = w.stat ?? 'median';
    if (!OCCUPATIONS.includes(occ)) throw new BidError('Occupation is "janitors" (37-2011) or "maids" (37-2012).', 'wage.occupation');
    if (!WAGE_STATS.includes(stat)) throw new BidError('Statistic is "median" or "mean".', 'wage.stat');
    const value = row[occ][stat];
    const occName = occ === 'janitors' ? 'janitors and cleaners' : 'maids and housekeeping cleaners';
    return {
      cents: Number(value) * 100,
      text: `$${value}`,
      source: `BLS May 2025 ${stat} hourly wage, ${occName}, ${row.code === 'US' ? 'United States' : row.name}`,
      bls: { state: row.code, occupation: occ, stat, value },
    };
  }

  // The burden on wages, in percent, line by line.
  function readBurden(b = { mode: 'itemized' }) {
    const mode = b.mode ?? 'itemized';
    if (!BURDEN_MODES.includes(mode)) throw new BidError('Burden mode is "itemized", "ecec" or "flat".', 'burden.mode');
    if (mode === 'flat') {
      const p = readNumber(b.percent ?? 0, 'burden.percent', { label: 'Burden percent', max: 200 });
      return { mode, percent: p, lines: [{ name: 'Payroll taxes, insurance and benefits (your figure)', percent: p }] };
    }
    if (mode === 'ecec') {
      return { mode, percent: ECEC, lines: [{ name: `Benefits and legally required costs, BLS ECEC service occupations, June 2026 ($${ecec.benefits} on $${ecec.wages} of wages)`, percent: ECEC }] };
    }
    const lines = [];
    if (b.fica !== false) lines.push({ name: `Employer social security and Medicare (${irs.socialSecurityRate}% + ${irs.medicareRate}%, IRS Pub 15, 2026)`, percent: FICA });
    if (b.futa !== false) lines.push({ name: `Federal unemployment (FUTA ${irs.futaNetRate}% after the 5.4% credit, on the first $${intText(irs.futaWageBase)} a worker earns in a year)`, percent: FUTA });
    const more = [
      ['suta', 'State unemployment (your rate)'],
      ['workersComp', 'Workers\' compensation (your rate, as a percent of wages)'],
      ['benefits', 'Other benefits and paid leave (your figure)'],
    ];
    for (const [k, name] of more) {
      if (!opt(b[k])) continue;
      const p = readNumber(b[k], `burden.${k}`, { label: name, max: 100 });
      if (p) lines.push({ name, percent: p });
    }
    return { mode, percent: lines.reduce((s, l) => s + l.percent, 0), lines, missing: more.slice(0, 2).filter(([k]) => !opt(b[k]) || Number(String(b[k]).replace(/%$/, '')) === 0).map(([k]) => k) };
  }

  // One task line: hours, and how they were found.
  function readLine(l, i, type, sqft) {
    const f = (k) => `lines.${i}.${k}`;
    if (!l || typeof l !== 'object') throw new BidError(`Line ${i + 1} must be { task, sqft and rate, or count and minutes, or hours }.`, `lines.${i}`);
    const task = String(l.task ?? '').trim();
    if (!task) throw new BidError(`Line ${i + 1}: name the task, such as "Vacuum carpet".`, f('task'));
    if (task.length > 80) throw new BidError(`Line ${i + 1}: the task name is at most 80 characters.`, f('task'));
    const label = `Line ${i + 1} (${task})`;
    const category = l.category ?? (opt(l.rate) ? 'area' : 'other');
    if (!CATEGORIES.includes(category)) throw new BidError(`${label}: category is one of ${CATEGORIES.join(', ')}.`, f('category'));
    let phase = null;
    if (type === 'post-construction') {
      phase = l.phase ?? 'final';
      if (!PHASES.includes(phase)) throw new BidError(`${label}: phase is rough, final or touch-up.`, f('phase'));
    } else if (opt(l.phase)) {
      throw new BidError(`${label}: phases are for post-construction bids only.`, f('phase'));
    }
    const kinds = [opt(l.rate), opt(l.count) || opt(l.minutes), opt(l.hours)].filter(Boolean).length;
    if (kinds !== 1) throw new BidError(`${label}: give a production rate (sq ft per hour), or a count and minutes each, or hours; one of the three.`, f('rate'));
    if (opt(l.rate)) {
      const rate = readNumber(l.rate, f('rate'), { label: `${label}: production rate`, min: 1, max: LIMITS.rate });
      const area = opt(l.sqft) ? readNumber(l.sqft, f('sqft'), { label: `${label}: square feet`, max: LIMITS.sqft }) : sqft;
      return { task, category, phase, kind: 'area', sqft: area, rate, hours: area / rate, how: `${intText(area)} sq ft at ${rateText(rate)} sq ft/hour` };
    }
    if (opt(l.count) || opt(l.minutes)) {
      if (!opt(l.count) || !opt(l.minutes)) throw new BidError(`${label}: give both the count and the minutes each.`, f(opt(l.count) ? 'minutes' : 'count'));
      const count = readNumber(l.count, f('count'), { label: `${label}: count`, max: LIMITS.count, integer: true });
      const minutes = readNumber(l.minutes, f('minutes'), { label: `${label}: minutes each`, max: LIMITS.minutes, allowZero: false });
      const unit = category === 'glass' ? (count === 1 ? 'pane' : 'panes') : category === 'restroom' ? (count === 1 ? 'fixture' : 'fixtures') : count === 1 ? 'item' : 'items';
      return { task, category, phase, kind: 'count', count, minutes, hours: (count * minutes) / 60, how: `${intText(count)} ${unit} at ${Number(r2(minutes))} min each` };
    }
    const hours = readNumber(l.hours, f('hours'), { label: `${label}: hours`, max: LIMITS.hours });
    return { task, category, phase, kind: 'time', hours, how: `${hoursText(hours)} hours` };
  }

  // The whole bid.
  function bid(input) {
    const type = input.type ?? 'janitorial';
    if (!BID_TYPES.includes(type)) throw new BidError('Bid type is "janitorial" or "post-construction".', 'type');
    const sqft = readNumber(input.sqft, 'sqft', { label: 'Cleanable square feet', min: 1, max: LIMITS.sqft });
    if (!Array.isArray(input.lines) || !input.lines.length) throw new BidError('Add at least one task line.', 'lines');
    if (input.lines.length > LIMITS.lines) throw new BidError(`At most ${LIMITS.lines} task lines.`, 'lines');
    const lines = input.lines.map((l, i) => readLine(l, i, type, sqft));
    const visitsPerWeek = type === 'janitorial' ? readNumber(input.visitsPerWeek ?? 5, 'visitsPerWeek', { label: 'Visits a week', min: 0.25, max: 21 }) : null;
    const crew = opt(input.crew) ? readNumber(input.crew, 'crew', { label: 'Crew size', min: 1, max: 500, integer: true }) : null;
    const wage = readWage(input.wage);
    const burden = readBurden(input.burden);
    const supplies = readNumber(input.suppliesPercent ?? 0, 'suppliesPercent', { label: 'Supplies and equipment percent', max: 100 });
    const overhead = readNumber(input.overheadPercent ?? 0, 'overheadPercent', { label: 'Overhead percent', max: 300 });
    const margin = readNumber(input.marginPercent ?? 0, 'marginPercent', { label: 'Profit margin percent', max: 90 });
    const extrasIn = input.extras ?? [];
    if (!Array.isArray(extrasIn) || extrasIn.length > LIMITS.extras) throw new BidError(`At most ${LIMITS.extras} extra charges.`, 'extras');
    const extras = extrasIn.map((x, i) => {
      const name = String(x?.name ?? '').trim();
      if (!name || name.length > 80) throw new BidError(`Extra ${i + 1}: name it in at most 80 characters, such as "Dumpster haul".`, `extras.${i}.name`);
      const amount = readNumber(x.amount, `extras.${i}.amount`, { label: `Extra ${i + 1} (${name})`, max: LIMITS.amount });
      let phase = null;
      if (opt(x.phase)) {
        if (type !== 'post-construction') throw new BidError(`Extra ${i + 1}: phases are for post-construction bids only.`, `extras.${i}.phase`);
        if (!PHASES.includes(x.phase)) throw new BidError(`Extra ${i + 1}: phase is rough, final or touch-up.`, `extras.${i}.phase`);
        phase = x.phase;
      }
      return { name, costCents: roundCents(amount * 100), phase };
    });
    const minimumCents = opt(input.minimum) ? roundCents(readNumber(input.minimum, 'minimum', { label: 'Minimum charge', max: LIMITS.amount }) * 100) : 0;
    let target = null;
    if (input.target && (opt(input.target.low) || opt(input.target.high))) {
      const low = opt(input.target.low) ? readNumber(input.target.low, 'target.low', { label: 'Target low $/sq ft', max: 1000 }) : null;
      const high = opt(input.target.high) ? readNumber(input.target.high, 'target.high', { label: 'Target high $/sq ft', max: 1000 }) : null;
      if (low !== null && high !== null && low > high) throw new BidError('The target range\'s low end is above its high end.', 'target.low');
      const per = input.target.per ?? (type === 'janitorial' ? 'month' : 'job');
      if (!TARGET_BASES.includes(per) || (type === 'janitorial' ? per === 'job' : per !== 'job')) {
        throw new BidError(type === 'janitorial' ? 'For a janitorial bid the target is per "visit" or per "month".' : 'For a post-construction bid the target is per "job".', 'target.per');
      }
      target = { low, high, per };
    }
    let state = null;
    if (opt(input.state)) {
      const k = String(input.state).trim().toUpperCase();
      if (!minimum.states[k]) throw new BidError(`State "${input.state}" is not a two-letter state code such as OH or DC.`, 'state');
      state = k;
    }
    if (!state && wage.bls && wage.bls.state !== 'US') state = wage.bls.state;

    // Cost per labor hour, in cents, at full precision.
    const loaded = wage.cents * (1 + burden.percent / 100);
    const withSupplies = loaded * (1 + supplies / 100);
    const withOverhead = withSupplies * (1 + overhead / 100);
    const billed = withOverhead / (1 - margin / 100);
    const extraFactor = (1 + overhead / 100) / (1 - margin / 100);

    const priced = lines.map((l) => ({ ...l, priceCents: roundCents(l.hours * billed) }));
    const pricedExtras = extras.map((x) => ({ ...x, priceCents: roundCents(x.costCents * extraFactor) }));

    // A part of the bid (one visit, or one phase): hours, cost build-up and price.
    const part = (ls, xs) => {
      const hours = ls.reduce((s, l) => s + l.hours, 0);
      const linePrice = ls.reduce((s, l) => s + l.priceCents, 0);
      const extraPrice = xs.reduce((s, x) => s + x.priceCents, 0);
      const extraCost = xs.reduce((s, x) => s + x.costCents, 0);
      const wages = roundCents(hours * wage.cents);
      const burdenC = roundCents(hours * loaded) - wages;
      const suppliesC = roundCents(hours * withSupplies) - wages - burdenC;
      const overheadC = roundCents(hours * withOverhead + extraCost * (1 + overhead / 100)) - wages - burdenC - suppliesC - extraCost;
      const price = linePrice + extraPrice;
      const profit = price - wages - burdenC - suppliesC - extraCost - overheadC;
      return { hours, wages, burden: burdenC, supplies: suppliesC, extras: extraCost, overhead: overheadC, profit, price };
    };
    const money = (p) => ({
      hours: hoursText(p.hours),
      wages: usd(p.wages), burden: usd(p.burden), supplies: usd(p.supplies), extras: usd(p.extras), overhead: usd(p.overhead), profit: usd(p.profit), price: usd(p.price),
      cents: { wages: p.wages, burden: p.burden, supplies: p.supplies, extras: p.extras, overhead: p.overhead, profit: p.profit, price: p.price },
    });

    const flags = [];
    const lineOut = priced.map((l) => ({
      task: l.task, category: l.category, phase: l.phase, kind: l.kind, how: l.how,
      ...(l.kind === 'area' ? { sqft: l.sqft, rate: l.rate } : {}), ...(l.kind === 'count' ? { count: l.count, minutes: l.minutes } : {}),
      hours: hoursText(l.hours), price: usd(l.priceCents), priceCents: l.priceCents,
      ...(l.kind === 'count' && l.count > 0 ? { pricePerItem: usd(roundCents(l.priceCents / l.count)) } : {}),
    }));
    const extrasOut = pricedExtras.map((x) => ({ name: x.name, phase: x.phase, cost: usd(x.costCents), price: usd(x.priceCents), priceCents: x.priceCents }));

    const totalsByCategory = CATEGORIES.map((c) => {
      const ls = priced.filter((l) => l.category === c);
      return ls.length ? { category: c, name: CATEGORY_NAMES[c], hours: hoursText(ls.reduce((s, l) => s + l.hours, 0)), price: usd(ls.reduce((s, l) => s + l.priceCents, 0)) } : null;
    }).filter(Boolean);
    const glass = priced.filter((l) => l.category === 'glass' && l.kind === 'count');
    const panes = glass.reduce((s, l) => s + l.count, 0);
    const restroom = priced.filter((l) => l.category === 'restroom' && l.kind === 'count');
    const fixtures = restroom.reduce((s, l) => s + l.count, 0);

    const hourly = {
      wage: usd(roundCents(wage.cents)), wageSource: wage.source,
      burdenPercent: pctText(burden.percent), loaded: usd(roundCents(loaded)),
      withSupplies: usd(roundCents(withSupplies)), withOverhead: usd(roundCents(withOverhead)), billed: usd(roundCents(billed)),
      markupOnCost: pctText((billed / withOverhead - 1) * 100),
    };

    const result = {
      op: 'bid',
      type,
      sqft,
      lines: lineOut,
      extras: extrasOut,
      byCategory: totalsByCategory,
      counts: { fixtures, panes },
      rates: {
        wage: { ...hourly, ...(wage.bls ? { bls: wage.bls } : {}) },
        burden: { mode: burden.mode, percent: pctText(burden.percent), lines: burden.lines.map((l) => ({ name: l.name, percent: pctText(l.percent) })) },
        suppliesPercent: pctText(supplies), overheadPercent: pctText(overhead), marginPercent: pctText(margin),
      },
    };
    const perSq = (c) => perSqft(c / sqft);

    let headline;
    if (type === 'janitorial') {
      const v = part(priced, pricedExtras);
      let visitCents = v.price;
      let minimumApplied = false;
      if (minimumCents && visitCents < minimumCents) { visitCents = minimumCents; minimumApplied = true; }
      const monthCents = roundCents(visitCents * visitsPerWeek * WEEKS_PER_MONTH);
      const yearCents = roundCents(visitCents * visitsPerWeek * 52);
      const monthHours = v.hours * visitsPerWeek * WEEKS_PER_MONTH;
      result.visit = { ...money(v), ...(minimumApplied ? { price: usd(visitCents), minimumApplied: true } : {}), priceCents: visitCents, onSiteHours: crew ? hoursText(v.hours / crew) : null };
      result.visitsPerWeek = visitsPerWeek;
      result.visitsPerMonth = r2(visitsPerWeek * WEEKS_PER_MONTH);
      result.month = { hours: hoursText(monthHours), price: usd(monthCents), priceCents: monthCents };
      result.year = { price: usd(yearCents), priceCents: yearCents };
      result.perSqft = { visit: perSq(visitCents), month: perSq(monthCents), year: perSq(yearCents) };
      result.crew = crew;
      headline = { cents: visitCents, per: 'visit' };
      const what = [`${intText(sqft)} sq ft`];
      if (fixtures) what.push(`${intText(fixtures)} restroom fixture${fixtures === 1 ? '' : 's'}`);
      if (panes) what.push(`${intText(panes)} glass pane${panes === 1 ? '' : 's'}`);
      result.answer = `At your production rates, ${joinAnd(what)} is ${hoursText(v.hours)} labor hours a visit; at ${hourly.loaded} an hour loaded and a ${pctText(margin)} margin the bid is ${usd(visitCents)} a visit, ${usd(monthCents)} a month at ${Number(r2(visitsPerWeek))} visit${visitsPerWeek === 1 ? '' : 's'} a week (${perSq(monthCents)} per sq ft a month, ${perSq(visitCents)} a visit).`;
      if (minimumApplied) flags.push({ code: 'minimum', message: `The visit priced at ${usd(v.price)}, under your minimum charge, so the minimum of ${usd(minimumCents)} is used.` });
      if (target) checkTarget(target.per === 'visit' ? visitCents : monthCents);
    } else {
      const phases = PHASES.map((ph) => {
        const ls = priced.filter((l) => l.phase === ph);
        const xs = pricedExtras.filter((x) => x.phase === ph);
        if (!ls.length && !xs.length) return null;
        const p = part(ls, xs);
        return { phase: ph, name: PHASE_NAMES[ph], ...money(p), priceCents: p.price, perSqft: perSq(p.price), onSiteHours: crew ? hoursText(p.hours / crew) : null };
      }).filter(Boolean);
      const jobExtras = pricedExtras.filter((x) => !x.phase);
      const all = part(priced, pricedExtras);
      let jobCents = all.price;
      let minimumApplied = false;
      if (minimumCents && jobCents < minimumCents) { jobCents = minimumCents; minimumApplied = true; }
      result.phases = phases;
      result.jobExtras = jobExtras.map((x) => ({ name: x.name, price: usd(x.priceCents) }));
      result.job = { ...money(all), ...(minimumApplied ? { price: usd(jobCents), minimumApplied: true } : {}), priceCents: jobCents, onSiteHours: crew ? hoursText(all.hours / crew) : null };
      result.perSqft = { job: perSq(jobCents) };
      result.crew = crew;
      headline = { cents: jobCents, per: 'job' };
      const phaseText = phases.map((p) => `${p.name.toLowerCase().replace(' clean', '')} ${p.price}`);
      const glassText = panes ? `, glass ${usd(glass.reduce((s, l) => s + l.priceCents, 0))} for ${intText(panes)} pane${panes === 1 ? '' : 's'} (${usd(roundCents(glass.reduce((s, l) => s + l.priceCents, 0) / panes))} a pane, inside the ${glass.length === 1 ? PHASE_NAMES[glass[0].phase].toLowerCase() : 'phases'})` : '';
      result.answer = `A ${intText(sqft)} sq ft post-construction job is ${hoursText(all.hours)} labor hours at your production rates and prices at ${joinAnd(phaseText)}: ${usd(jobCents)} in all (${perSq(jobCents)} per sq ft)${glassText}.`;
      if (minimumApplied) flags.push({ code: 'minimum', message: `The job priced at ${usd(all.price)}, under your minimum charge, so the minimum of ${usd(minimumCents)} is used.` });
      if (target) checkTarget(jobCents);
      const missing = PHASES.filter((p) => !phases.some((x) => x.phase === p));
      if (missing.length && missing.length < 3) flags.push({ code: 'phase-missing', message: `No lines for the ${joinAnd(missing.map((p) => PHASE_NAMES[p].toLowerCase()))}: if the contract includes it, add its lines; if not, say so on the proposal.` });
    }

    function checkTarget(cents) {
      const v = cents / sqft / 100;
      const per = target.per === 'job' ? 'for the job' : target.per === 'visit' ? 'a visit' : 'a month';
      const d = (n) => `$${n.toFixed(Math.max(2, (String(n).split('.')[1] ?? '').length))}`;
      const range = target.low !== null && target.high !== null ? `${d(target.low)} to ${d(target.high)}` : target.low !== null ? `at least ${d(target.low)}` : `at most ${d(target.high)}`;
      const shown = perSqft(cents / sqft);
      let status = 'within';
      if (target.low !== null && v < target.low - 1e-9) status = 'below';
      else if (target.high !== null && v > target.high + 1e-9) status = 'above';
      const breakeven = (target.per === 'job' ? result.job.cents : result.visit.cents).price - (target.per === 'job' ? result.job.cents : result.visit.cents).profit;
      const scale = target.per === 'month' ? visitsPerWeek * WEEKS_PER_MONTH : 1;
      result.check = {
        per: target.per, low: target.low, high: target.high, value: shown, status,
        breakeven: perSqft((breakeven * scale) / sqft),
        message: status === 'within'
          ? `${shown} per sq ft ${per} is inside your target of ${range}.`
          : `${shown} per sq ft ${per} is ${status} your target of ${range}. Check the production rates and the scope before changing the price: the hours are what the price is built on.`,
      };
      if (status !== 'within') flags.push({ code: `target-${status}`, message: result.check.message });
    }

    // Checks that use official figures only.
    if (state) {
      const floor = floorOf(state);
      const m = minimum.states[state];
      if (wage.cents < floor * 100 - 1e-6) {
        flags.push({ code: 'below-minimum-wage', message: `The wage of ${hourly.wage} is below ${state === 'US' ? 'the federal' : `${wages.states[state]?.name ?? state}'s`} minimum of $${floor.toFixed(2)} an hour (DOL state table, updated ${minimum.pageUpdated}).${m?.note ? ` ${m.note}` : ''} City and county minimums can be higher.` });
      }
      if (m?.next) flags.push({ code: 'minimum-wage-change', message: `${wages.states[state]?.name ?? state}'s minimum wage is scheduled to rise to $${m.next.basic} on ${longDate(m.next.date)} (DOL). A contract running past that date should be priced at the new rate.` });
      result.state = { code: state, minimumWage: (minimumOf(state) ?? minimum.federal), floor: floor.toFixed(2) };
    }
    if (burden.mode === 'itemized' && burden.missing?.length) {
      flags.push({ code: 'burden-incomplete', message: `${joinAnd(burden.missing.map((k) => (k === 'suta' ? 'State unemployment' : 'workers\' compensation')))} ${burden.missing.length === 1 ? 'is' : 'are'} not entered, so the loaded rate counts only the federal payroll taxes. Enter your own rates; they vary by state, class code and claims history.` });
    }
    if (burden.mode === 'itemized' && burden.lines.some((l) => l.name.startsWith('Federal unemployment'))) {
      flags.push({ code: 'futa-ceiling', message: `FUTA is charged on every hour here, which is the most it can be: it stops once a worker has earned $${intText(irs.futaWageBase)} in the year ($${(irs.futaWageBase * Number(irs.futaNetRate) / 100).toFixed(2)} a worker a year), and it is higher in a credit reduction state.` });
    }
    if (margin === 0) flags.push({ code: 'no-margin', message: 'The margin is 0%: this price covers costs and earns nothing.' });
    const noRateArea = !lines.some((l) => l.kind === 'area');
    if (noRateArea) flags.push({ code: 'no-area-task', message: 'No area task has a production rate, so the square feet only set the $/sq ft check, not the hours.' });

    result.headline = { price: usd(headline.cents), priceCents: headline.cents, per: headline.per };
    result.flags = flags;
    return result;
  }

  // A production rate from a timing: sq ft cleaned in minutes, or items done in minutes.
  function rate(input) {
    const minutes = readNumber(input.minutes, 'minutes', { label: 'Minutes timed', max: 6000, allowZero: false });
    if (opt(input.sqft)) {
      const sqft = readNumber(input.sqft, 'sqft', { label: 'Square feet timed', max: LIMITS.sqft, allowZero: false });
      const perHour = (sqft * 60) / minutes;
      const per1000 = (minutes * 1000) / sqft;
      return { op: 'rate', kind: 'area', sqft, minutes, perHour: Math.round(clean(perHour)), minutesPer1000: r2(per1000), answer: `${intText(sqft)} sq ft in ${Number(r2(minutes))} minutes is ${rateText(perHour)} sq ft an hour (${r2(per1000).toFixed(2)} minutes per 1,000 sq ft).` };
    }
    if (opt(input.count)) {
      const count = readNumber(input.count, 'count', { label: 'Items timed', max: LIMITS.count, allowZero: false, integer: true });
      const each = minutes / count;
      return { op: 'rate', kind: 'count', count, minutes, minutesEach: r2(each), perHour: r2(60 / each), answer: `${intText(count)} items in ${Number(r2(minutes))} minutes is ${r2(each).toFixed(2)} minutes each (${r2(60 / each).toFixed(2)} an hour).` };
    }
    throw new BidError('Give the square feet or the number of items you timed.', 'sqft');
  }

  return { bid, rate, wageTable, floorOf, minimumOf, stateRow, constants: { FICA, FUTA, ECEC } };
}

export function joinAnd(list) {
  if (list.length <= 1) return list.join('');
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// The bid as CSV lines (the proposal's companion file).
export function bidCsv(r) {
  const rows = [['section', 'task', 'phase', 'how', 'hours', 'price']];
  for (const l of r.lines) rows.push([CATEGORY_NAMES[l.category], l.task, l.phase ?? '', l.how, l.hours, l.price]);
  for (const x of r.extras) rows.push(['Extra', x.name, x.phase ?? '', `cost ${x.cost}`, '', x.price]);
  if (r.type === 'janitorial') {
    rows.push(['Total', 'Per visit', '', '', r.visit.hours, r.visit.price]);
    rows.push(['Total', 'Per month', '', `${r.visitsPerWeek} visits a week`, r.month.hours, r.month.price]);
  } else {
    for (const p of r.phases) rows.push(['Total', p.name, p.phase, '', p.hours, p.price]);
    rows.push(['Total', 'Job', '', '', r.job.hours, r.job.price]);
  }
  const field = (v) => {
    const s = String(v ?? '');
    const safe = /^[=+\-@\t\r]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s) ? `'${s}` : s;
    return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return rows.map((row) => row.map(field).join(',')).join('\r\n') + '\r\n';
}
