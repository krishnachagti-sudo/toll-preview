// MACRS depreciation schedule: one entity's additions for one calendar tax year, run through the
// mid-quarter (40%) test, Section 179, the special depreciation allowance ("bonus") and the IRS
// percentage tables, ending in a year-by-year schedule and the year's journal entry.
//
// Pure and dependency-free. makeEngine(data) takes the dated, sourced data (data/pub946-tables.json
// and data/limits.json), so every figure comes from a file a person read on irs.gov.
//
// The rules, each from IRS Publication 946 (2025) unless named otherwise:
//  - Order: Section 179 first, then the special allowance on what is left, then MACRS on the rest
//    (ch. 3 "Depreciating the remaining cost"; ch. 4 "Figuring the Unadjusted Basis").
//  - Business use: the basis is cost x business-use share. Section 179 needs more than 50% business
//    use (ch. 2, Partial business use). Listed property at 50% or less goes to ADS, which this
//    version does not compute, so vehicles at 50% or less are refused.
//  - The 40% test (ch. 4, Which Convention Applies?; 26 CFR 1.168(d)-1(b)(1)): mid-quarter applies
//    when the bases placed in service in the last 3 months are MORE than 40% of the year's total.
//    Residential rental and nonresidential real property and property placed in service and
//    disposed of in the same year are left out. The basis is after Section 179 and the personal-use
//    share, before any special allowance. Exactly 40% stays half-year.
//  - Special allowance (ch. 3): 2025: 40% for property acquired before January 20, 2025; 100% for
//    property acquired after January 19, 2025, or 40% by the election for the first tax year ending
//    after that date. 2026: 100% for property acquired after January 19, 2025. Property acquired
//    before January 20, 2025 and placed in service in 2026 is refused (the sources disagree; see
//    data/limits.json). An election out is made per class for the whole class.
//  - Table rates apply to the unadjusted basis each year (ch. 4). Tables A-1 to A-5 for 3- to
//    20-year property, A-8 to A-12 (straight line) for qualified improvement property and 25-year
//    water utility property, A-6 (27.5-year) and A-7a (39-year) with the mid-month convention.
//
// Money is whole cents. Percentages are kept exactly as printed (thousandths of a percent), so a
// year's amount is cents x pct rounded half up once; the last recovery year takes what is left, so
// the years add up to the basis to the cent.

export const ENGINE_VERSION = 'macrs-depreciation 1.0';
export const MAX_ASSETS = 500;
export const ASSETS_PER_UNIT = 250;
export const MAX_COST = 100_000_000;
export const BONUS_CUTOFF = '2025-01-20';
export const CSV_COLUMNS = ['id', 'description', 'cost', 'acquired', 'placed_in_service', 'class', 'business_use_pct', 'section_179', 'vehicle', 'disposed_same_year'];
export const VEHICLES = ['heavy-suv', 'heavy-truck', 'passenger-auto'];

// Each class: its recovery period, method, the tables and the column read from them.
export const CLASSES = {
  3: { label: '3-year property', years: 3, method: '200% DB', hy: 'A-1', mq: ['A-2', 'A-3', 'A-4', 'A-5'], col: '3', bonus: true },
  5: { label: '5-year property', years: 5, method: '200% DB', hy: 'A-1', mq: ['A-2', 'A-3', 'A-4', 'A-5'], col: '5', bonus: true },
  7: { label: '7-year property', years: 7, method: '200% DB', hy: 'A-1', mq: ['A-2', 'A-3', 'A-4', 'A-5'], col: '7', bonus: true },
  10: { label: '10-year property', years: 10, method: '200% DB', hy: 'A-1', mq: ['A-2', 'A-3', 'A-4', 'A-5'], col: '10', bonus: true },
  15: { label: '15-year property', years: 15, method: '150% DB', hy: 'A-1', mq: ['A-2', 'A-3', 'A-4', 'A-5'], col: '15', bonus: true },
  20: { label: '20-year property', years: 20, method: '150% DB', hy: 'A-1', mq: ['A-2', 'A-3', 'A-4', 'A-5'], col: '20', bonus: true },
  qip: { label: 'Qualified improvement property (15-year)', years: 15, method: 'straight line', hy: 'A-8', mq: ['A-9', 'A-10', 'A-11', 'A-12'], col: '15', bonus: true },
  25: { label: '25-year water utility property', years: 25, method: 'straight line', hy: 'A-8', mq: ['A-9', 'A-10', 'A-11', 'A-12'], col: '25', bonus: true },
  27.5: { label: 'Residential rental property (27.5-year)', years: 27.5, method: 'straight line', mm: 'A-6', real: true },
  39: { label: 'Nonresidential real property (39-year)', years: 39, method: 'straight line', mm: 'A-7a', real: true },
};
export const CLASS_KEYS = ['3', '5', '7', '10', '15', '20', 'qip', '25', '27.5', '39'];

export class MacrsError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'MacrsError';
    this.field = field ?? null;
  }
}

// ---------- dates and money ----------

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export function isRealDate(s) {
  const m = DATE_RE.exec(s ?? '');
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}
export const longDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;
const monthOf = (iso) => +iso.slice(5, 7);
const quarterOf = (iso) => Math.ceil(monthOf(iso) / 3);

// Cents as "$1,234.50".
export function money(cents) {
  const neg = cents < 0;
  const c = Math.abs(Math.round(cents));
  const dollars = String(Math.floor(c / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}$${dollars}.${String(c % 100).padStart(2, '0')}`;
}
export const toDollars = (cents) => Math.round(cents) / 100;
const toCents = (dollars) => Math.round(dollars * 100);
const plain = (cents) => (cents / 100).toFixed(2);

// "14.29" -> 14290 thousandths of a percent.
const milli = (pct) => Math.round(Number(pct) * 1000);
// cents x pct, rounded half up once. Cents are at most 1e10 and milli at most 1e5, so exact.
const ofPct = (cents, pctMilli) => Math.floor((cents * pctMilli + 50_000) / 100_000);

// ---------- the CSV template ----------

// Reads one line of a CSV with quoted fields.
function csvLine(line) {
  const out = [];
  let cur = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; } else if (ch === '"') quoted = false; else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { out.push(cur); cur = ''; } else cur += ch;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

// The fixed CSV template (CSV_COLUMNS, in any order, header row first) as asset objects. No column
// guessing: an unknown column name is an error that lists the ones read.
export function readCsv(text) {
  const lines = String(text).replace(/^﻿/, '').split(/\r?\n/).filter((l) => l.trim() !== '');
  if (lines.length < 2) throw new MacrsError('The CSV needs a header row and at least one asset row.', 'csv');
  const head = csvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  const unknown = head.filter((h) => !CSV_COLUMNS.includes(h));
  if (unknown.length) throw new MacrsError(`The CSV has columns this template does not read: ${unknown.join(', ')}. The columns are ${CSV_COLUMNS.join(', ')}.`, 'csv');
  for (const need of ['cost', 'placed_in_service', 'class']) {
    if (!head.includes(need)) throw new MacrsError(`The CSV needs a "${need}" column.`, 'csv');
  }
  if (lines.length - 1 > MAX_ASSETS) throw new MacrsError(`At most ${MAX_ASSETS} assets in one run.`, 'csv');
  return lines.slice(1).map((line, i) => {
    const cells = csvLine(line);
    const get = (k) => { const j = head.indexOf(k); return j === -1 ? '' : (cells[j] ?? ''); };
    const row = i + 2;
    const num = (k, label) => {
      const raw = get(k).replace(/[$,\s]/g, '');
      if (raw === '') return undefined;
      const n = Number(raw);
      if (!Number.isFinite(n)) throw new MacrsError(`Row ${row}: ${label} "${get(k)}" is not a number.`, 'csv');
      return n;
    };
    const yes = get('disposed_same_year').toLowerCase();
    const asset = {
      id: get('id') || `row ${row}`,
      description: get('description') || undefined,
      cost: num('cost', 'cost'),
      acquired: get('acquired') || undefined,
      placedInService: get('placed_in_service'),
      class: get('class').replace(/-?year$/i, '').trim().toLowerCase(),
      businessUsePct: num('business_use_pct', 'business_use_pct'),
      section179: num('section_179', 'section_179'),
      vehicle: get('vehicle').toLowerCase() || undefined,
      disposedSameYear: ['yes', 'y', 'true', '1'].includes(yes) ? true : undefined,
    };
    if (asset.cost === undefined) throw new MacrsError(`Row ${row}: cost is empty.`, 'csv');
    return Object.fromEntries(Object.entries(asset).filter(([, v]) => v !== undefined));
  });
}

// ---------- the engine ----------

export function makeEngine({ tables, limits }) {
  const T = tables.tables;
  const YEARS = Object.keys(limits.years).map(Number).sort();
  const other = limits.other;

  const tableLabel = (id, cls, conv, part) => {
    const c = CLASSES[cls];
    const where = conv === 'MM' ? `month ${part}` : conv === 'MQ' ? `Q${part}` : 'half-year';
    return `Table A-${id.slice(2)}, ${c.real ? `${c.years}-year` : cls === 'qip' ? 'QIP 15-year SL' : `${c.years}-year`}, ${where}`;
  };

  // The percentage column for a class under a convention, with where it was read.
  function column(cls, conv, part) {
    const c = CLASSES[cls];
    if (!c) throw new MacrsError(`Class must be one of ${CLASS_KEYS.join(', ')}.`, 'class');
    let id;
    if (c.real) {
      if (conv !== 'MM') throw new MacrsError(`${c.label} uses the mid-month convention (MM).`, 'convention');
      if (!Number.isInteger(part) || part < 1 || part > 12) throw new MacrsError('Give the month placed in service, 1 to 12.', 'month');
      id = c.mm;
    } else if (conv === 'HY') {
      id = c.hy;
    } else if (conv === 'MQ') {
      if (!Number.isInteger(part) || part < 1 || part > 4) throw new MacrsError('Give the quarter placed in service, 1 to 4.', 'quarter');
      id = c.mq[part - 1];
    } else {
      throw new MacrsError(`${c.label} uses the half-year (HY) or mid-quarter (MQ) convention.`, 'convention');
    }
    const t = T[id];
    const key = c.real ? String(part) : c.col;
    return { id, key, title: t.title, page: t.page, pcts: t.columns[key], label: tableLabel(id, cls, conv, part) };
  }

  function limitsFor(year) {
    const y = limits.years[String(year)];
    if (!y) throw new MacrsError(`Tax years ${YEARS.join(' and ')} are covered; ${year} is not.`, 'taxYear');
    return y;
  }

  // ---------- one entity-year ----------

  function run(input) {
    const year = input.taxYear;
    const L = limitsFor(year);
    const s179 = L.section179;
    const electOut = new Set((input.bonusElectOut ?? []).map(String));
    for (const k of electOut) if (!CLASSES[k]) throw new MacrsError(`bonusElectOut names "${k}", which is not a class; use ${CLASS_KEYS.join(', ')}.`, 'bonusElectOut');
    if (input.elect40Percent && year !== 2025) throw new MacrsError('The 40% election is for the first tax year ending after January 19, 2025, which is 2025 for a calendar-year taxpayer.', 'elect40Percent');
    if (!input.assets?.length) throw new MacrsError('Give at least one asset.', 'assets');
    if (input.assets.length > MAX_ASSETS) throw new MacrsError(`At most ${MAX_ASSETS} assets in one run.`, 'assets');
    const warnings = [];
    const ids = new Set();

    // Pass 1: read each asset and apply Section 179.
    const rows = input.assets.map((a, i) => {
      const at = (f) => `assets.${i}.${f}`;
      const name = `Asset ${a.id ?? i + 1}`;
      const id = String(a.id ?? i + 1);
      if (ids.has(id)) throw new MacrsError(`${name}: the id "${id}" is used twice.`, at('id'));
      ids.add(id);
      const cls = String(a.class);
      const c = CLASSES[cls];
      if (!c) throw new MacrsError(`${name}: class must be one of ${CLASS_KEYS.join(', ')} ("qip" is qualified improvement property).`, at('class'));
      if (!(typeof a.cost === 'number' && a.cost > 0 && a.cost <= MAX_COST)) throw new MacrsError(`${name}: cost must be above $0 and at most $${MAX_COST.toLocaleString('en-US')}.`, at('cost'));
      if (Math.abs(a.cost * 100 - Math.round(a.cost * 100)) > 1e-6) throw new MacrsError(`${name}: cost takes at most 2 decimals.`, at('cost'));
      if (!isRealDate(a.placedInService)) throw new MacrsError(`${name}: placedInService must be a real date written like ${year}-03-14.`, at('placedInService'));
      if (+a.placedInService.slice(0, 4) !== year) throw new MacrsError(`${name}: placed in service ${a.placedInService}, outside tax year ${year}. This schedule covers one year's additions; earlier assets go in that year's run.`, at('placedInService'));
      if (a.acquired !== undefined) {
        if (!isRealDate(a.acquired)) throw new MacrsError(`${name}: acquired must be a real date written like 2025-02-10.`, at('acquired'));
        if (a.acquired > a.placedInService) throw new MacrsError(`${name}: acquired ${a.acquired} is after it was placed in service.`, at('acquired'));
      }
      const use = a.businessUsePct ?? 100;
      if (!(typeof use === 'number' && use > 0 && use <= 100) || Math.abs(use * 100 - Math.round(use * 100)) > 1e-6) throw new MacrsError(`${name}: businessUsePct must be above 0 and at most 100, with at most 2 decimals.`, at('businessUsePct'));
      if (a.vehicle !== undefined && !VEHICLES.includes(a.vehicle)) throw new MacrsError(`${name}: vehicle must be one of ${VEHICLES.join(', ')}.`, at('vehicle'));
      if (a.vehicle === 'passenger-auto') throw new MacrsError(`${name}: passenger automobiles (the Section 280F caps) are not covered yet. Run this entity-year without it and figure the car with Publication 946 chapter 5.`, at('vehicle'));
      if (a.vehicle && use <= 50) throw new MacrsError(`${name}: a vehicle used 50% or less for business is listed property that must use ADS, which this tool does not compute.`, at('businessUsePct'));
      if (c.real && a.vehicle) throw new MacrsError(`${name}: a vehicle cannot be ${c.label.toLowerCase()}.`, at('vehicle'));

      const cents = toCents(a.cost);
      const business = Math.round(cents * Math.round(use * 100) / 10_000);
      const elected = toCents(a.section179 ?? 0);
      if (elected < 0 || Math.abs((a.section179 ?? 0) * 100 - elected) > 1e-6) throw new MacrsError(`${name}: section179 must be 0 or more, with at most 2 decimals.`, at('section179'));
      if (elected > 0) {
        if (c.real) throw new MacrsError(`${name}: a building (${c.label.toLowerCase()}) is not section 179 property.`, at('section179'));
        if (use <= 50) throw new MacrsError(`${name}: section 179 needs more than 50% business use (Publication 946, ch. 2).`, at('section179'));
        if (a.disposedSameYear) throw new MacrsError(`${name}: it was disposed of the year it was placed in service; take its section 179 off.`, at('section179'));
        if (elected > business) throw new MacrsError(`${name}: section179 ${money(elected)} is more than its business cost ${money(business)}.`, at('section179'));
        if (a.vehicle === 'heavy-suv' && elected > s179.suvCap * 100) throw new MacrsError(`${name}: at most ${money(s179.suvCap * 100)} of a heavy SUV's cost can be expensed under section 179 in ${year} (${s179.source}).`, at('section179'));
      }
      return { a, i, id, cls, c, use, cents, business, elected, quarter: quarterOf(a.placedInService), month: monthOf(a.placedInService) };
    });

    // Section 179: the dollar limit after the phase-out, then the business income limit.
    const totalElected = rows.reduce((s, r) => s + r.elected, 0);
    let phaseBase;
    if (input.section179PropertyCost !== undefined) {
      phaseBase = toCents(input.section179PropertyCost);
    } else {
      phaseBase = rows.filter((r) => !r.c.real && r.use > 50).reduce((s, r) => s + r.cents, 0);
    }
    const reduction = Math.max(0, phaseBase - s179.phaseOutStart * 100);
    const dollarLimit = Math.max(0, s179.limit * 100 - reduction);
    if (input.section179PropertyCost === undefined && reduction > 0) {
      warnings.push({ code: 'phase-out-assumed', text: `The phase-out used ${money(phaseBase)}: the cost of every listed asset outside the building classes used more than 50% for business. If some of those are not section 179 property, or you placed other section 179 property in service, give section179PropertyCost.` });
    }
    if (totalElected > dollarLimit) {
      throw new MacrsError(`Section 179 elected on these assets is ${money(totalElected)}, more than the ${year} limit of ${money(dollarLimit)}${reduction ? ` (${money(s179.limit * 100)} less ${money(reduction)} of cost over ${money(s179.phaseOutStart * 100)})` : ''}. Lower the elections; how to spread the limit across assets is your choice.`, 'assets');
    }
    if (input.businessIncome !== undefined && totalElected > toCents(input.businessIncome)) {
      throw new MacrsError(`Section 179 elected (${money(totalElected)}) is more than the business income limit you gave (${money(toCents(input.businessIncome))}). Carrying the excess forward is not covered by this tool; lower the elections to at most that amount, or work the carryover with your preparer.`, 'businessIncome');
    }
    if (totalElected > 0 && input.businessIncome === undefined) {
      warnings.push({ code: 'business-income-limit', text: `Section 179 of ${money(totalElected)} can be deducted only up to the taxable income from the active conduct of your trades or businesses (Publication 946, ch. 2, Business Income Limit). Give businessIncome to have it checked.` });
    }

    // Pass 2: the 40% test on bases after Section 179 and personal use, before any special allowance.
    let q4 = 0;
    let total = 0;
    const worksheet = rows.map((r) => {
      const testBasis = r.business - r.elected;
      let reason = null;
      if (r.c.real) reason = `${r.c.label.toLowerCase()} is left out of the test`;
      else if (r.a.disposedSameYear) reason = 'placed in service and disposed of in the same year: left out of the test';
      if (!reason) {
        total += testBasis;
        if (r.quarter === 4) q4 += testBasis;
      }
      return {
        id: r.id,
        description: r.a.description ?? '',
        class: r.cls,
        placedInService: r.a.placedInService,
        quarter: r.quarter,
        cost: toDollars(r.cents),
        businessUsePct: r.use,
        section179: toDollars(r.elected),
        testBasis: toDollars(testBasis),
        included: !reason,
        reason: reason ?? (r.quarter === 4 ? 'included, last 3 months' : 'included'),
      };
    });
    const isMq = total > 0 && q4 * 5 > total * 2;
    const convention = isMq ? 'MQ' : 'HY';
    const shareExact = total > 0 ? (q4 * 100) / total : 0;
    let shareText = `${shareExact.toFixed(2)}%`;
    if (isMq && shareText === '40.00%') shareText = 'just over 40.00%';
    if (!isMq && shareText === '40.00%' && q4 * 5 !== total * 2) shareText = 'just under 40.00%';
    const test = {
      convention,
      q4Basis: toDollars(q4),
      totalBasis: toDollars(total),
      q4Share: total > 0 ? Math.round(shareExact * 100) / 100 : 0,
      shareText,
      rule: 'Mid-quarter applies when the last-3-months share is more than 40%; exactly 40% stays half-year.',
      arithmetic: total > 0
        ? `${money(q4)} placed in service October to December / ${money(total)} for the year = ${shareText}, ${isMq ? 'more than 40%: mid-quarter for every asset in the test classes' : 'not more than 40%: half-year'}.`
        : 'No property counts toward the test (only buildings or same-year disposals), so the half-year convention is shown for anything else.',
      worksheet,
      citations: [
        { text: other.midQuarter.source, url: other.midQuarter.url },
        { text: other.regulation.source, url: other.regulation.url },
      ],
    };

    // Pass 3: special allowance and MACRS for each asset.
    const assets = rows.map((r) => {
      const name = `Asset ${r.id}`;
      const at = (f) => `assets.${r.i}.${f}`;
      const base = r.business - r.elected;
      let rate = 0;
      let bonusWhy;
      if (r.a.disposedSameYear) bonusWhy = 'none: disposed of in the year placed in service';
      else if (!r.c.bonus) bonusWhy = `none: ${r.c.label.toLowerCase()} is not qualified property`;
      else if (electOut.has(r.cls)) bonusWhy = `none: elected out for the ${r.cls === 'qip' ? 'QIP' : `${r.cls}-year`} class`;
      else {
        if (!r.a.acquired) throw new MacrsError(`${name}: give the date it was acquired (the binding written contract date), which sets the special allowance, or elect out of the allowance for its class.`, at('acquired'));
        if (r.a.acquired < '2017-09-28') throw new MacrsError(`${name}: property acquired before September 28, 2017 is not covered.`, at('acquired'));
        if (r.a.acquired >= BONUS_CUTOFF) {
          rate = year === 2025 && input.elect40Percent ? 40 : 100;
          bonusWhy = rate === 40 ? `${rate}%: acquired after January 19, 2025, with the 40% election for 2025` : `${rate}%: acquired after January 19, 2025`;
        } else if (year === 2025) {
          rate = 40;
          bonusWhy = '40%: acquired before January 20, 2025 and placed in service in 2025';
        } else {
          throw new MacrsError(`${name}: acquired ${r.a.acquired}, before January 20, 2025, and placed in service in ${year}. ${L.bonus.beforeRefused} Elect out of the allowance for its class to get the schedule without it.`, at('acquired'));
        }
      }
      const bonus = rate ? Math.floor((base * rate + 50) / 100) : 0;
      const depreciable = base - bonus;
      const years = [];
      let col = null;
      if (!r.a.disposedSameYear) {
        col = r.c.real ? column(r.cls, 'MM', r.month) : column(r.cls, convention, convention === 'MQ' ? r.quarter : undefined);
        let used = 0;
        col.pcts.forEach((p, k) => {
          const last = k === col.pcts.length - 1;
          const amount = last ? depreciable - used : ofPct(depreciable, milli(p));
          used += amount;
          years.push({ year: year + k, pct: p, amount: toDollars(amount), cents: amount });
        });
      }
      const year1 = r.elected + bonus + (years[0]?.cents ?? 0);
      return {
        id: r.id,
        description: r.a.description ?? '',
        class: r.cls,
        classLabel: r.c.label,
        method: r.c.method,
        recoveryYears: r.c.years,
        placedInService: r.a.placedInService,
        acquired: r.a.acquired ?? null,
        convention: r.c.real ? 'MM' : convention,
        cost: toDollars(r.cents),
        businessUsePct: r.use,
        businessBasis: toDollars(r.business),
        section179: toDollars(r.elected),
        bonusRate: rate,
        bonusWhy,
        bonus: toDollars(bonus),
        depreciableBasis: toDollars(depreciable),
        table: col ? { id: col.id, column: col.key, label: col.label, page: col.page } : null,
        year1Total: toDollars(year1),
        years: years.map(({ year: y, pct, amount }) => ({ year: y, pct, amount })),
        _cents: { elected: r.elected, bonus, years },
      };
    });

    // Totals by year.
    const byYear = new Map();
    const add = (y, k, c) => { if (!byYear.has(y)) byYear.set(y, { section179: 0, bonus: 0, macrs: 0 }); byYear.get(y)[k] += c; };
    for (const x of assets) {
      add(year, 'section179', x._cents.elected);
      add(year, 'bonus', x._cents.bonus);
      for (const y of x._cents.years) add(y.year, 'macrs', y.cents);
    }
    const totalsByYear = [...byYear.entries()].sort((p, q) => p[0] - q[0]).map(([y, t]) => ({
      year: y, section179: toDollars(t.section179), bonus: toDollars(t.bonus), macrs: toDollars(t.macrs), total: toDollars(t.section179 + t.bonus + t.macrs),
    }));
    const y1 = byYear.get(year) ?? { section179: 0, bonus: 0, macrs: 0 };
    const year1 = { section179: y1.section179, bonus: y1.bonus, macrs: y1.macrs, total: y1.section179 + y1.bonus + y1.macrs };
    if (rows.some((r) => r.a.vehicle === 'heavy-suv' || r.a.vehicle === 'heavy-truck')) {
      warnings.push({ code: 'vehicle', text: 'A vehicle over 6,000 pounds is still listed property: keep a business-use log, and if business use later drops to 50% or less, excess depreciation is recaptured (Publication 946, ch. 5).' });
    }
    if (isMq && assets.some((x) => x.bonusRate === 100)) {
      warnings.push({ code: 'mq-with-bonus', text: 'Mid-quarter applies even though 100% bonus takes most of year 1: the convention still sets the schedule for classes elected out, for a state that does not follow federal bonus, and for the year of a later sale.' });
    }

    const answer = `${input.entity ? `${input.entity}, ` : ''}tax year ${year}: ${test.arithmetic} Year-1 deduction ${money(year1.total)}: Section 179 ${money(year1.section179)}, special allowance ${money(year1.bonus)}, MACRS ${money(year1.macrs)}.`;
    return { taxYear: year, entity: input.entity ?? null, convention, test, assets, totalsByYear, year1: centsOut(year1), section179: {
      elected: toDollars(totalElected), dollarLimit: toDollars(dollarLimit), limit: s179.limit, phaseOutStart: s179.phaseOutStart, phaseOutBase: toDollars(phaseBase), reduction: toDollars(reduction), suvCap: s179.suvCap, source: s179.source, url: s179.url,
    }, warnings, answer, _year1Cents: year1 };
  }

  const centsOut = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, toDollars(v)]));

  // The free-standing lookups.
  function table({ class: cls, convention, quarter, month }) {
    const c = CLASSES[cls];
    if (!c) throw new MacrsError(`Class must be one of ${CLASS_KEYS.join(', ')}.`, 'class');
    const col = column(String(cls), convention ?? (c.real ? 'MM' : 'HY'), c.real ? month : quarter);
    return {
      table: col.id,
      title: col.title,
      label: col.label,
      class: String(cls),
      classLabel: c.label,
      method: c.method,
      percentages: col.pcts.map((p, k) => ({ year: k + 1, pct: p })),
      source: { text: `${tables.source.name}, ${col.id}, page ${col.page}`, url: tables.source.url, edition: tables.source.edition, readOn: tables.source.readOn },
    };
  }

  function limitsOf(year) {
    const y = limitsFor(year);
    const s = y.section179;
    const bonus = [];
    if (y.bonus.before) bonus.push({ acquired: 'before January 20, 2025', rate: y.bonus.before.rate, quote: y.bonus.before.quote });
    bonus.push({ acquired: 'after January 19, 2025', rate: y.bonus.after.rate, quote: y.bonus.after.quote });
    if (y.bonus.election40) bonus.push({ acquired: 'after January 19, 2025, electing 40% for 2025', rate: 40, quote: y.bonus.election40.quote });
    return {
      taxYear: year,
      section179: { limit: s.limit, phaseOutStart: s.phaseOutStart, phaseOutEnd: s.limit + s.phaseOutStart, suvCap: s.suvCap, source: s.source, url: s.url, quote: s.quote, note: s.note ?? null },
      bonus,
      bonusNotCovered: y.bonus.beforeRefused ?? null,
      bonusSource: { text: y.bonus.source, url: y.bonus.url },
      readOn: limits.readOn,
    };
  }

  return { years: YEARS, run, table, limits: limitsOf, column };
}

// ---------- files ----------

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvRows = (rows) => `${rows.map((r) => r.map(csvCell).join(',')).join('\r\n')}\r\n`;

// One row per asset per year, with the table behind each figure.
export function scheduleCsv(result) {
  const rows = [['asset_id', 'description', 'class', 'placed_in_service', 'convention', 'table', 'tax_year', 'pct', 'section_179', 'special_allowance', 'macrs', 'total', 'depreciable_basis']];
  for (const a of result.assets) {
    if (!a.years.length) {
      rows.push([a.id, a.description, a.class, a.placedInService, a.convention, '', result.taxYear, '', '0.00', '0.00', '0.00', '0.00', '0.00']);
      continue;
    }
    a.years.forEach((y, k) => {
      const s179 = k === 0 ? a._cents.elected : 0;
      const bonus = k === 0 ? a._cents.bonus : 0;
      const m = a._cents.years[k].cents;
      rows.push([a.id, a.description, a.class, a.placedInService, a.convention, a.table.label, y.year, y.pct, plain(s179), plain(bonus), plain(m), plain(s179 + bonus + m), plain(Math.round(a.depreciableBasis * 100))]);
    });
  }
  return csvRows(rows);
}

// The tax year's depreciation entry: debits split into Section 179, special allowance and MACRS,
// one credit to accumulated depreciation. layout 'generic' or 'qbo' (the columns Intuit's import
// help names).
export function journalCsv(result, { layout = 'generic', expense = 'Depreciation Expense', accumulated = 'Accumulated Depreciation', journalNo = `DEP-${result.taxYear}` } = {}) {
  const c = result._year1Cents;
  const date = `${result.taxYear}-12-31`;
  const lines = [
    ['Section 179 expense', c.section179],
    ['Special depreciation allowance', c.bonus],
    ['MACRS depreciation', c.macrs],
  ].filter(([, v]) => v > 0).map(([what, v]) => ({ account: expense, debit: v, credit: 0, description: `${what}, tax year ${result.taxYear}` }));
  if (c.total > 0) lines.push({ account: accumulated, debit: 0, credit: c.total, description: `Depreciation, tax year ${result.taxYear}` });
  const debit = lines.reduce((s, l) => s + l.debit, 0);
  const credit = lines.reduce((s, l) => s + l.credit, 0);
  let rows;
  if (layout === 'qbo') {
    const us = `${date.slice(5, 7)}/${date.slice(8, 10)}/${date.slice(0, 4)}`;
    rows = [['Journal No.', 'Journal Date', 'Account Name', 'Debits', 'Credits', 'Description'], ...lines.map((l) => [journalNo, us, l.account, l.debit ? plain(l.debit) : '', l.credit ? plain(l.credit) : '', l.description])];
  } else {
    rows = [['date', 'journal', 'account', 'debit', 'credit', 'description'], ...lines.map((l) => [date, journalNo, l.account, plain(l.debit), plain(l.credit), l.description])];
  }
  return { text: csvRows(rows), debitTotal: toDollars(debit), creditTotal: toDollars(credit) };
}
