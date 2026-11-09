// The rent-increase engine: the most a landlord may raise the rent for a unit on an effective date
// (the state cap, a CPI region, or a local ordinance), whether a proposed increase is within it, the
// written notice owed and the last day to serve it. Pure and dependency-free: the page loads this
// same file in the browser, and tool.js runs it on the server. Every rule comes from the rows in
// data/rules.json (passed to makeEngine), each with its source and the date it was read; a figure is
// given only inside the window its source publishes, and a place with no row is refused, never
// guessed. Money is whole cents; percentages are kept as text and worked in thousandths of a
// percent; dates are YYYY-MM-DD in UTC.

export class RentCapError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'RentCapError';
    this.field = field;
  }
}

// ---------- dates ----------

const DAY = 86_400_000;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ms = (d) => Date.parse(`${d}T00:00:00Z`);
const iso = (t) => new Date(t).toISOString().slice(0, 10);

export function isRealDate(s) {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const t = ms(s);
  return Number.isFinite(t) && iso(t) === s;
}
export const addDays = (d, n) => iso(ms(d) + n * DAY);
export const daysBetween = (a, b) => Math.round((ms(b) - ms(a)) / DAY);
export const weekday = (d) => WEEKDAYS[new Date(ms(d)).getUTCDay()];
export function longDate(d) {
  const [y, m, day] = d.split('-').map(Number);
  return `${MONTHS[m - 1]} ${day}, ${y}`;
}
export const dayDate = (d) => `${weekday(d)}, ${longDate(d)}`;
// The same day n years later (February 29 becomes February 28).
export function addYears(d, n) {
  const [y, m, day] = d.split('-').map(Number);
  const last = new Date(Date.UTC(y + n, m, 0)).getUTCDate();
  return `${y + n}-${String(m).padStart(2, '0')}-${String(Math.min(day, last)).padStart(2, '0')}`;
}
// Whole months from a to b (a day short of a month does not count).
export function monthsBetween(a, b) {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return (y2 - y1) * 12 + (m2 - m1) - (d2 < d1 ? 1 : 0);
}

// ---------- money and percentages ----------

export function toCents(v, field = 'amount') {
  if (typeof v === 'number') {
    if (!Number.isFinite(v) || v < 0) throw new RentCapError(`${field} must be zero or more dollars.`, field);
    return Math.round(v * 100);
  }
  const s = String(v ?? '').trim().replace(/^\$/, '').replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) throw new RentCapError(`${field} must be dollars, such as 2000 or "2,000.00".`, field);
  return Math.round(Number(s) * 100);
}
export const usd = (cents) => `${cents < 0 ? '-' : ''}$${(Math.abs(cents) / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
// "9.683" -> 9683 (thousandths of a percent).
export function milli(pct) {
  const m = /^(\d+)(?:\.(\d{1,3}))?$/.exec(String(pct));
  if (!m) throw new Error(`rent-increase-cap: bad percentage ${pct}`);
  return Number(m[1]) * 1000 + Number((m[2] ?? '').padEnd(3, '0'));
}
export const pctText = (m) => `${(m / 1000).toFixed(3).replace(/\.?0+$/, '')}%`;
// The increase on a base at a percentage, rounded down to the cent so it is never above the cap.
export const raise = (cents, m) => Math.floor((cents * m) / 100_000);
// The change from a to b in thousandths of a percent, rounded up so a hair over the cap shows as over.
export const changeMilli = (a, b) => (a <= 0 ? 0 : Math.ceil(((b - a) * 100_000) / a));
// For display: the change to two decimals.
export const changeText = (a, b) => `${(Math.round(((b - a) * 10_000) / a) / 100).toFixed(2).replace(/\.?0+$/, '')}%`;

// ---------- the engine ----------

export const VERDICT_WORDS = {
  within: 'Within the cap',
  over: 'Over the cap',
  'max-only': 'Maximum worked out',
  exempt: 'Exempt from the cap',
  'no-cap': 'No cap; notice rules only',
  'not-published': 'Figure not published yet',
  'first-year': 'No increase in the first year',
  'too-soon': 'Too soon after the last increase',
  'above-standard': 'Above the local rent standard',
};

export function makeEngine(RULES) {
  const S = RULES.states;
  const L = RULES.localities;
  const ORDER = RULES.order;
  const coveredNames = () => `${ORDER.map((c) => S[c].name).join(', ')}, and Montgomery County, Maryland`;

  function stateRow(code, locality) {
    const c = String(code ?? '').toUpperCase();
    if (S[c]) return S[c];
    // A state read only for one locality (Maryland: Montgomery County).
    const lr = locality && L[locality];
    if (lr && lr.state === c && RULES.notCovered[c]) {
      return { code: c, name: RULES.notCovered[c].name, kind: 'local-only', law: lr.law, noticeLaw: lr.law, notice: { type: 'fixed', days: 0, words: `${lr.notice?.days ?? 0} days' written notice (${lr.name})` }, quotes: {}, notes: [], sources: [], quality: lr.quality };
    }
    const nc = RULES.notCovered[c];
    if (nc) throw new RentCapError(`${nc.name} is not covered. ${nc.reason} Covered: ${coveredNames()}.`, 'state');
    throw new RentCapError('state must be a US state code such as "OR", or "DC".', 'state');
  }

  function localityRow(input) {
    if (!input.locality) return null;
    const row = L[input.locality];
    if (!row) throw new RentCapError(`No local rule has been read for "${input.locality}". Covered: ${Object.keys(L).join(', ')}.`, 'locality');
    if (String(input.state).toUpperCase() !== row.state) throw new RentCapError(`${row.name} is in ${row.state}; give state "${row.state}".`, 'state');
    return row;
  }

  // California county -> Tenant Protection Act region.
  function regionOf(county) {
    const c = String(county ?? '').trim().toLowerCase().replace(/\s+county$/, '');
    for (const [id, r] of Object.entries(S.CA.cap.regions)) if (r.counties.some((n) => n.toLowerCase() === c)) return id;
    return 'other';
  }
  const CA_COUNTIES = ['Alameda', 'Alpine', 'Amador', 'Butte', 'Calaveras', 'Colusa', 'Contra Costa', 'Del Norte', 'El Dorado', 'Fresno', 'Glenn', 'Humboldt', 'Imperial', 'Inyo', 'Kern', 'Kings', 'Lake', 'Lassen', 'Los Angeles', 'Madera', 'Marin', 'Mariposa', 'Mendocino', 'Merced', 'Modoc', 'Mono', 'Monterey', 'Napa', 'Nevada', 'Orange', 'Placer', 'Plumas', 'Riverside', 'Sacramento', 'San Benito', 'San Bernardino', 'San Diego', 'San Francisco', 'San Joaquin', 'San Luis Obispo', 'San Mateo', 'Santa Barbara', 'Santa Clara', 'Santa Cruz', 'Shasta', 'Sierra', 'Siskiyou', 'Solano', 'Sonoma', 'Stanislaus', 'Sutter', 'Tehama', 'Trinity', 'Tulare', 'Tuolumne', 'Ventura', 'Yolo', 'Yuba'];
  const isCaCounty = (county) => CA_COUNTIES.some((n) => n.toLowerCase() === String(county ?? '').trim().toLowerCase().replace(/\s+county$/, ''));

  const inWindow = (w, d) => d >= w.from && d <= w.to;
  const windowWords = (w) => `${longDate(w.from)} to ${longDate(w.to)}`;

  // The cap row in force on the effective date: { milli, words, window, cite, ... } or a reason it is not.
  function stateCap(row, input, region) {
    const eff = input.effectiveDate;
    const cap = row.cap;
    if (cap.type === 'tpa') {
      const w = cap.windows.find((x) => inWindow(x, eff));
      const rName = cap.regions[region].name;
      if (!w) return { missing: `The California figure for an increase taking effect ${longDate(eff)} is published only once April's CPI is out; the tool has ${cap.windows.map(windowWords).join(' and ')}.` };
      return { milli: milli(w.pct[region]), window: { from: w.from, to: w.to, label: `increases taking effect ${windowWords(w)}` }, label: `${rName}`, cpi: w.cpiPct[region] ?? null };
    }
    if (cap.type === 'year') {
      const y = eff.slice(0, 4);
      if (!cap.years[y]) return { missing: `${row.name}'s figure for ${y} is not published yet (the tool has ${Object.keys(cap.years).join(' and ')}).` };
      const out = { milli: milli(cap.years[y]), window: { from: `${y}-01-01`, to: `${y}-12-31`, label: `calendar year ${y}` }, label: `${y}`, cpi: cap.cpiPct?.[y] ?? null };
      // Oregon: the statute does not say whether the notice year or the effective year sets the figure.
      if (row.code === 'OR' && input.noticeDate && input.noticeDate.slice(0, 4) !== y && cap.years[input.noticeDate.slice(0, 4)]) {
        out.noticeYear = { year: input.noticeDate.slice(0, 4), milli: milli(cap.years[input.noticeDate.slice(0, 4)]) };
      }
      return out;
    }
    if (cap.type === 'window') {
      const w = cap.windows.find((x) => inWindow(x, eff));
      if (!w) return { missing: `${row.name}'s figure for an increase taking effect ${longDate(eff)} is not published yet; the tool has ${cap.windows.map((x) => `${x.label} (${windowWords(x)})`).join(', ')}.` };
      return { milli: milli(input.elderly ? w.elderly : w.pct), window: { from: w.from, to: w.to, label: w.label }, label: input.elderly ? `${w.label}, registered elderly or disabled tenant` : w.label };
    }
    throw new Error(`rent-increase-cap: unknown cap ${cap.type}`);
  }

  // ---- notice ----

  // Days of notice and the last day to serve it, for this rule and this increase (pct in milli).
  function noticeFor(row, input, pctMilli, local) {
    const n = row.notice ?? { type: 'fixed', days: 0 };
    const eff = input.effectiveDate;
    const out = { days: null, serveBy: null, words: n.words, rule: row.noticeLaw, notes: [] };
    const tiered = (tiers) => {
      if (pctMilli === null) return tiers[0].days;
      for (const t of tiers) {
        if (t.upToPct !== undefined && pctMilli <= milli(t.upToPct)) return t.days;
        if (t.belowPct !== undefined && pctMilli < milli(t.belowPct)) return t.days;
        if (t.upToPct === undefined && t.belowPct === undefined) return t.days;
      }
      return tiers.at(-1).days;
    };
    switch (n.type) {
      case 'tiered':
        out.days = tiered(n.tiers);
        if (pctMilli === null) out.notes.push(`Worked out for an increase within the lower band; ${n.words}.`);
        break;
      case 'fixed':
        out.days = row.code === 'OR' && input.weekToWeek ? n.weekDays : row.code === 'WA' && input.subsidized ? n.subsidizedDays : n.days;
        if (n.atRenewal) {
          const end = input.leaseEnd ?? addDays(eff, -1);
          out.serveBy = addDays(end, -out.days);
          out.basis = `before the rental agreement expires on ${longDate(end)}`;
        }
        break;
      case 'nextRentDay': {
        out.days = n.days;
        // In force from the first rent day more than 60 days after notice: serve by 61 days before.
        out.serveBy = addDays(eff, -(n.days + 1));
        const rentDay = input.rentDay ?? 1;
        if (Number(eff.slice(8)) !== rentDay) out.notes.push(`${longDate(eff)} is not a rent day (the ${rentDay}${rentDay === 1 ? 'st' : 'th'}); the increase would take effect on the next one.`);
        out.basis = 'so that the effective date is the first rent day more than 60 days after it';
        break;
      }
      case 'tenure': {
        if (pctMilli !== null && pctMilli < milli(n.thresholdPct)) {
          out.days = 0;
          out.notes.push(`${row.noticeLaw} sets a notice period only for an increase of ${n.thresholdPct}% or more; for a smaller one the lease decides.`);
          break;
        }
        const occ = input.tenancyStart ? monthsBetween(input.tenancyStart, eff) : null;
        const months = Math.max(occ ?? 0, input.leaseMonths ?? 0);
        if (occ === null && input.leaseMonths === undefined) {
          out.days = 90;
          out.notes.push('With no tenancy start date or lease length given, the longest period (90 days, for two years or more) is used.');
        } else {
          out.days = n.tiers.find((t) => t.underMonths === undefined || months < t.underMonths).days;
          out.notes.push(`Counted on ${months} ${months === 1 ? 'month' : 'months'} of occupancy or lease term, whichever is longer.`);
        }
        if (pctMilli === null) out.notes.push(`This applies to an increase of ${n.thresholdPct}% or more.`);
        break;
      }
      case 'virginia': {
        if (!input.largeLandlord) {
          out.days = 0;
          out.notes.push('Va. Code § 55.1-1204(K) applies only to a landlord with more than four rental units (or more than a 10% interest in more than four); for others the section sets no notice period.');
          break;
        }
        const end = input.leaseEnd ?? addDays(eff, -1);
        const d60 = addDays(end, -n.daysBefore);
        out.days = d60 > n.until ? n.daysAfter : n.daysBefore;
        out.serveBy = addDays(end, -out.days);
        out.basis = `before the lease term ends on ${longDate(end)}`;
        if (out.days === n.daysAfter) out.notes.push('The 90-day version of § 55.1-1204(K) is in force from July 1, 2027; the notice must also give the tenant a deadline to answer at least 30 days after it is delivered.');
        break;
      }
      default:
        throw new Error(`rent-increase-cap: unknown notice ${n.type}`);
    }
    // A local ordinance's own notice: the longer of it and the state's.
    if (local?.notice?.days && local.notice.days > out.days) {
      out.days = local.notice.days;
      out.rule = local.name;
      out.words = `${local.notice.days} days' written notice (${local.name})`;
    } else if (local?.notice?.days) {
      out.notes.push(`${local.name} asks for ${local.notice.days} days; the state rule asks for ${out.days}, so the longer applies.`);
    }
    if (out.serveBy === null && out.days !== null) out.serveBy = addDays(eff, -out.days);
    if (row.notice?.mailNote) out.notes.push(row.notice.mailNote);
    out.ok = input.noticeDate && out.days ? input.noticeDate <= out.serveBy : null;
    if (input.noticeDate && out.days) {
      out.earliest = n.type === 'nextRentDay'
        ? nextRentDay(addDays(input.noticeDate, n.days + 1), input.rentDay ?? 1)
        : addDays(input.noticeDate, out.days);
    }
    return out;
  }
  function nextRentDay(from, day) {
    let d = from;
    for (let i = 0; i < 40 && Number(d.slice(8)) !== day; i += 1) d = addDays(d, 1);
    return d;
  }

  // ---- exemptions ----

  function autoExempt(row, input, ref) {
    const e = row.exemptions?.find((x) => x.auto);
    if (!e || !input.builtDate) return null;
    const cutoff = addYears(ref, -e.auto.years);
    // Oregon: "less than 15 years"; California "within the past 15 years"; Washington "12 or less years".
    const exempt = e.auto.strict ? input.builtDate > cutoff : input.builtDate >= cutoff;
    return exempt ? e : null;
  }

  // ---- the check ----

  function check(input) {
    const row = stateRow(input.state, input.locality);
    const local = localityRow(input);
    const eff = input.effectiveDate;
    if (!isRealDate(eff)) throw new RentCapError('effectiveDate must be a real date written like 2027-02-01.', 'effectiveDate');
    for (const f of ['noticeDate', 'builtDate', 'tenancyStart', 'lastIncreaseDate', 'leaseEnd']) {
      if (input[f] !== undefined && !isRealDate(input[f])) throw new RentCapError(`${f} must be a real date written like 2026-11-01.`, f);
    }
    if (input.noticeDate && input.noticeDate > eff) throw new RentCapError('noticeDate is after effectiveDate.', 'noticeDate');
    const rent = toCents(input.rent, 'rent');
    if (rent <= 0) throw new RentCapError('rent must be more than $0.', 'rent');
    const base = input.baseRent === undefined ? rent : toCents(input.baseRent, 'baseRent');
    if (base <= 0) throw new RentCapError('baseRent must be more than $0.', 'baseRent');
    if (base > rent) throw new RentCapError(`baseRent (${usd(base)}) is the lowest rent in the 12 months before the increase, so it cannot be above the current rent (${usd(rent)}).`, 'baseRent');
    if (input.newRent !== undefined && input.increasePct !== undefined) throw new RentCapError('Give newRent or increasePct, not both.', 'newRent');
    let proposed = null;
    if (input.newRent !== undefined) proposed = toCents(input.newRent, 'newRent');
    else if (input.increasePct !== undefined) {
      const p = String(input.increasePct).replace(/%$/, '').trim();
      if (!/^\d+(\.\d{1,3})?$/.test(p)) throw new RentCapError('increasePct must be a percentage such as 7.5.', 'increasePct');
      proposed = rent + Math.round((rent * milli(p)) / 100_000);
    }
    if (proposed !== null && proposed < rent) throw new RentCapError('The new rent is below the current rent: that is a decrease, which no rule here limits.', 'newRent');
    if (input.exemption !== undefined && !(row.exemptions ?? []).some((e) => e.id === input.exemption)) {
      throw new RentCapError(`exemption must be one of ${(row.exemptions ?? []).map((e) => `"${e.id}"`).join(', ') || 'none for this state'}.`, 'exemption');
    }

    const reasons = [];
    const notes = [...(row.notes ?? [])];
    const sources = [...row.sources];
    let region = null;
    if (row.code === 'CA') {
      region = local?.region ?? (input.county ? regionOf(input.county) : null);
      if (!region) throw new RentCapError('California caps depend on the county: give county (for example "Los Angeles"), or a locality.', 'county');
      if (input.county && !local && !isCaCounty(input.county)) throw new RentCapError(`"${input.county}" is not a California county.`, 'county');
    }
    const ref = input.noticeDate ?? eff;
    const increase12 = proposed === null ? null : proposed - base;
    const pct12 = proposed === null ? null : changeMilli(base, proposed);

    // 1. Which cap applies: none (notice-only state), a local ordinance, or the state's.
    let cap = null;
    let capSource = null;
    let verdict = null;
    let exempt = null;
    let exemptWords = null;

    if (input.exemption) {
      exempt = row.exemptions.find((e) => e.id === input.exemption);
      exemptWords = `Exempt from the cap: ${exempt.words} (your answer).`;
    } else {
      const auto = row.cap ? autoExempt(row, input, row.code === 'CA' ? ref : (input.noticeDate ?? eff)) : null;
      if (auto) { exempt = auto; exemptWords = `Exempt from the cap: ${auto.words} (first certificate of occupancy ${longDate(input.builtDate)}).`; }
    }

    if (row.kind === 'notice' && !local) {
      verdict = 'no-cap';
      reasons.push({ level: 'info', rule: 'cap', message: `${row.name} has no percentage cap in the sections read (${row.law}); only the notice rule below applies.` });
    } else if (exempt && !local) {
      verdict = 'exempt';
      reasons.push({ level: 'info', rule: 'cap', message: exemptWords, cite: row.law });
    } else if (row.code === 'OR' && input.weekToWeek) {
      verdict = 'no-cap';
      reasons.push({ level: 'info', rule: 'cap', message: 'A week-to-week tenancy is outside the Oregon cap (ORS 90.323(2) covers "any tenancy other than week-to-week"); it needs 7 days\' written notice.', cite: row.law, quote: row.quotes.week });
    } else {
      // A local ordinance first.
      let useState = true;
      if (local && !local.statewideOnly && local.cap) {
        const r = localCap(local, input);
        if (r.applies) {
          useState = false;
          if (r.missing) { verdict = 'not-published'; reasons.push({ level: 'check', rule: 'cap', message: r.missing }); }
          else { cap = r; capSource = local; }
        } else {
          reasons.push({ level: 'info', rule: 'local', message: r.why });
        }
        sources.unshift(...local.sources);
        notes.unshift(...local.notes);
      } else if (local) {
        if (local.sources?.length) sources.unshift(...local.sources);
        notes.unshift(...(local.notes ?? []));
      }
      if (useState && local && row.kind !== 'cap' && local.slug !== 'new-york-city') {
        verdict = 'no-cap';
        reasons.push({ level: 'info', rule: 'cap', message: `${row.name} state law was not read for a cap; outside the ${local.name} rule no percentage limit is given here.` });
      } else if (useState && exempt) {
        verdict = 'exempt';
        reasons.push({ level: 'info', rule: 'cap', message: exemptWords, cite: row.law });
      } else if (useState && row.code === 'NY') {
        // Handled by the New York City block below.
      } else if (useState) {
        if (row.code === 'DC' && input.elderly === undefined) notes.push('A registered elderly tenant or tenant with a disability has a lower cap; answer elderly: true for that figure.');
        const r = stateCap(row, input, region);
        if (r.missing) { verdict = 'not-published'; reasons.push({ level: 'check', rule: 'cap', message: r.missing }); }
        else { cap = r; capSource = row; }
      }
    }

    // New York City: rent-stabilized guideline, or the Good Cause local rent standard.
    let standard = null;
    if (local?.slug === 'new-york-city' && !verdict) {
      if (input.stabilized) {
        const years = input.leaseYears ?? 1;
        const o = local.rgb.find((x) => inWindow(x, eff));
        if (!o) verdict = 'not-published';
        else cap = { milli: milli(years === 2 ? o.two : o.one), window: { from: o.from, to: o.to, label: `RGB Order #${o.order}, ${years}-year leases starting ${windowWords(o)}` }, label: `Order #${o.order}`, base: 'current' };
        if (!o) reasons.push({ level: 'check', rule: 'cap', message: `No Rent Guidelines Board order read covers a lease starting ${longDate(eff)}; the tool has Orders #57 and #58 (October 1, 2025 to September 30, 2027).` });
        capSource = local;
        notes.push('Rent-stabilized renewal offers follow the Rent Stabilization Code\'s own timing, which was not read here; the notice line below is the general Real Prop. Law § 226-c rule.');
      } else if (input.goodCause === false) {
        verdict = 'no-cap';
        reasons.push({ level: 'info', rule: 'cap', message: 'Not rent-stabilized and not covered by Good Cause Eviction (your answers): no percentage limit applies; the notice rule below still does.' });
      } else {
        const g = local.goodCause.find((x) => inWindow(x, eff));
        if (!g) { verdict = 'not-published'; reasons.push({ level: 'check', rule: 'cap', message: `DHCR's Good Cause figure for ${longDate(eff)} is not in the tool (it has the notice posted ${longDate(local.goodCause[0].posted)}, used through ${longDate(local.goodCause[0].to)}).` }); }
        else standard = { milli: milli(g.standard), cpi: g.cpi, window: { from: g.from, to: g.to, label: `DHCR notice posted ${longDate(g.posted)}` } };
      }
    }

    // 2. Timing rules: first year, once in 12 months, end of the lease term.
    const firstYearEnd = input.tenancyStart ? addYears(input.tenancyStart, 1) : null;
    if (row.firstYear && firstYearEnd && eff < firstYearEnd && verdict !== 'exempt' && !(row.code === 'OR' && input.weekToWeek)) {
      verdict = 'first-year';
      reasons.push({ level: 'fail', rule: 'first-year', message: `No increase may take effect in the first ${row.code === 'WA' ? '12 months' : 'year'} of the tenancy; the earliest is ${longDate(firstYearEnd)}.`, cite: row.law, quote: row.quotes.firstYear });
    }
    const onceRule = (row.cap?.period === 'once-12' && capSource === row) || (capSource && capSource !== row && capSource.slug !== 'new-york-city');
    if (input.lastIncreaseDate && onceRule && verdict !== 'first-year' && verdict !== 'exempt' && eff < addYears(input.lastIncreaseDate, 1)) {
      verdict = 'too-soon';
      reasons.push({ level: 'fail', rule: 'once', message: `Only one increase in 12 months: the last took effect ${longDate(input.lastIncreaseDate)}, so the next may take effect from ${longDate(addYears(input.lastIncreaseDate, 1))}.`, cite: capSource.law ?? row.law, quote: row.quotes.once ?? capSource.quotes?.once });
    }
    if (row.code === 'WA' && input.leaseEnd && eff <= input.leaseEnd && !input.subsidized) {
      reasons.push({ level: 'fail', rule: 'term', message: `The increase may not take effect before the lease term is complete (it ends ${longDate(input.leaseEnd)}).`, cite: 'RCW 59.18.140(3)(a)', quote: row.quotes.notice });
      if (!verdict) verdict = 'too-soon';
    }

    // 3. The amount.
    let max = null;
    if (cap) {
      // California and Washington measure from the lowest rent in the 12 months before; the others from the current rent.
      const capOn = capSource === row && row.cap.base === 'lowest12' ? base : rent;
      max = { milli: cap.milli, base: capOn, increase: raise(capOn, cap.milli) };
      max.rent = capOn + max.increase;
      const cite = capSource === row ? row.law : capSource.law;
      const capWords = capSource === row ? row.cap.words : capSource.cap?.words ?? 'the Rent Guidelines Board guideline for the lease';
      const math = `${pctText(cap.milli)} of ${usd(capOn)} = ${usd(max.increase)}; ${usd(capOn)} + ${usd(max.increase)} = ${usd(max.rent)}`;
      max.math = math;
      if (!verdict) {
        if (proposed === null) {
          verdict = 'max-only';
          reasons.push({ level: 'info', rule: 'amount', message: `The most the rent may be: ${usd(max.rent)} (${math}).`, cite });
        } else if (proposed > max.rent) {
          verdict = 'over';
          reasons.push({ level: 'fail', rule: 'amount', message: `${usd(proposed)} is ${usd(proposed - max.rent)} over the cap of ${usd(max.rent)} (${math}).`, cite, quote: capSource === row ? row.quotes.cap ?? row.quotes.formula : capSource.quotes?.pct });
        } else {
          verdict = 'within';
          reasons.push({ level: 'ok', rule: 'amount', message: `${usd(proposed)} is within the cap of ${usd(max.rent)} (${math}).`, cite });
        }
      }
      reasons.push({ level: 'info', rule: 'formula', message: `The cap: ${capWords}; figure in force: ${pctText(cap.milli)} for ${cap.window.label}.`, cite });
      if (cap.noticeYear && proposed !== null && changeMilli(capOn, proposed) > cap.noticeYear.milli) {
        reasons.push({ level: 'check', rule: 'year', message: `The notice is dated in ${cap.noticeYear.year}, whose figure was ${pctText(cap.noticeYear.milli)}; this increase is above it. ORS 90.324 does not say which year's figure governs a notice given in one year for an increase in the next.`, cite: row.law });
      }
    } else if (standard) {
      max = { milli: standard.milli, base: rent, increase: raise(rent, standard.milli) };
      max.rent = rent + max.increase;
      max.math = `${pctText(standard.milli)} of ${usd(rent)} = ${usd(max.increase)}; ${usd(rent)} + ${usd(max.increase)} = ${usd(max.rent)}`;
      if (proposed === null) {
        verdict = 'max-only';
        reasons.push({ level: 'info', rule: 'amount', message: `The Good Cause local rent standard: ${usd(max.rent)} (${max.math}), if the unit is covered by Good Cause Eviction.`, cite: 'Real Prop. Law § 211(8)' });
      } else if (proposed > max.rent) {
        verdict = 'above-standard';
        reasons.push({ level: 'check', rule: 'amount', message: `${usd(proposed)} is ${usd(proposed - max.rent)} above the local rent standard of ${usd(max.rent)} (${max.math}). For a covered unit the notice must justify it (Real Prop. Law § 226-c).`, cite: 'Real Prop. Law §§ 211(8), 226-c' });
      } else {
        verdict = 'within';
        reasons.push({ level: 'ok', rule: 'amount', message: `${usd(proposed)} is within the local rent standard of ${usd(max.rent)} (${max.math}).`, cite: 'Real Prop. Law § 211(8)' });
      }
      reasons.push({ level: 'info', rule: 'formula', message: `${local.words.standard} DHCR's CPI: ${standard.cpi}%, so ${pctText(standard.milli)}.`, cite: 'Real Prop. Law § 211' });
    }
    if (!verdict) verdict = 'no-cap';

    // 4. The notice.
    const noticePct = proposed === null ? (max ? changeMilli(max.base, max.rent) : null) : (row.notice?.measure === '12 months' ? pct12 : changeMilli(rent, proposed));
    const nlocal = local?.notice ? local : (capSource && capSource !== row ? capSource : null);
    const notice = verdict === 'first-year' || verdict === 'not-published' ? noticeFor(row, input, noticePct, null) : noticeFor(row, input, noticePct, nlocal);
    if (local?.slug === 'los-angeles' && capSource === local) {
      notice.rule = local.law;
      notice.words = '30 days\' written notice for an increase under 10% in 12 months, 90 days over 10% (LAHD)';
    }
    if (notice.days) {
      if (input.noticeDate) {
        reasons.push(notice.ok
          ? { level: 'ok', rule: 'notice', message: `Notice dated ${longDate(input.noticeDate)} is in time: ${notice.days} days' written notice is due by ${dayDate(notice.serveBy)}.`, cite: notice.rule }
          : { level: 'fail', rule: 'notice', message: `Notice dated ${longDate(input.noticeDate)} is late: ${notice.days} days' notice${notice.basis ? ` ${notice.basis}` : ''} was due by ${dayDate(notice.serveBy)}. With that notice the increase can take effect ${longDate(notice.earliest)} at the earliest.`, cite: notice.rule });
      } else {
        reasons.push({ level: 'info', rule: 'notice', message: `Serve ${notice.days} days' written notice${notice.basis ? ` ${notice.basis}` : ''}: by ${dayDate(notice.serveBy)} for an increase taking effect ${longDate(eff)}.`, cite: notice.rule });
      }
    }
    for (const nn of notice.notes) notes.push(nn);
    if (row.code === 'OR') notes.push('The notice must state the amount of the increase, the new rent and the date it takes effect, plus the facts behind any exemption claimed (ORS 90.323(3)).');
    if (row.code === 'WA') notes.push('The notice must be substantially in the form of RCW 59.18.720 and served as RCW 59.12.040 says.');

    // The answer, in one or two sentences.
    const where = local ? (local.slug === 'san-diego' ? 'San Diego County' : local.name) : row.code === 'DC' ? 'the District of Columbia' : row.code === 'CA' ? `${S.CA.cap.regions[region].name === 'All other counties' ? `${cleanCounty(input.county)} County` : `${cleanCounty(input.county) || S.CA.cap.regions[region].name.replace(/ Area$/, '')}${input.county ? ' County' : ''}`}, California` : row.name;
    const nWords = notice.days ? ` Written notice: ${notice.days} days, served by ${longDate(notice.serveBy)}.` : '';
    let answer;
    if (max && verdict !== 'first-year' && verdict !== 'too-soon') {
      const what = standard ? 'the Good Cause local rent standard' : 'the most it may rise';
      answer = `For ${usd(max.base)} rent in ${where}, ${what} for an increase taking effect ${longDate(eff)} is ${pctText(max.milli)} (${usd(max.increase)}), to ${usd(max.rent)}.${nWords}`;
      if (verdict === 'within') answer += ` Your ${usd(proposed)} is within it.`;
      if (verdict === 'over') answer += ` Your ${usd(proposed)} is ${usd(proposed - max.rent)} over it.`;
      if (verdict === 'above-standard') answer += ` Your ${usd(proposed)} is ${usd(proposed - max.rent)} above it, so a covered unit's notice must justify it.`;
    } else if (verdict === 'exempt') {
      answer = `This unit in ${where} is exempt from the cap (${exempt.words}), so no percentage limit applies to an increase taking effect ${longDate(eff)}.${nWords}`;
    } else if (verdict === 'no-cap') {
      answer = `${cap1(where)} has no percentage cap on this rent increase in the rules read${row.kind === 'notice' ? ` (${row.law} sets notice only)` : ''}.${nWords || ' No notice period applies under the rule read.'}`;
    } else if (verdict === 'not-published') {
      answer = `The cap for an increase taking effect ${longDate(eff)} in ${where} is not published yet: ${reasons.find((r) => r.rule === 'cap')?.message ?? ''}${nWords}`;
    } else if (verdict === 'first-year') {
      answer = `No rent increase may take effect in the first ${row.code === 'WA' ? '12 months' : 'year'} of a ${row.name} tenancy; the earliest date is ${longDate(firstYearEnd)}.`;
    } else {
      answer = `${cap1(reasons.find((r) => r.level === 'fail')?.message ?? 'Check the rule.')}`;
    }
    if (notice.ok === false) answer += ` The notice dated ${longDate(input.noticeDate)} is late for that date.`;

    return {
      state: row.code,
      locality: local?.slug ?? null,
      region: region ? { id: region, name: S.CA.cap.regions[region].name } : null,
      name: where,
      law: capSource === local && local ? local.law : row.law,
      verdict,
      verdictWords: VERDICT_WORDS[verdict],
      answer,
      effectiveDate: eff,
      noticeDate: input.noticeDate ?? null,
      rent,
      baseRent: base,
      cap: max ? { pct: pctText(max.milli), milli: max.milli, base: max.base, increase: max.increase, maxRent: max.rent, display: usd(max.rent), increaseDisplay: usd(max.increase), math: max.math, window: (cap ?? standard).window, cpi: (cap ?? standard).cpi ?? null, kind: standard ? 'good-cause-standard' : 'cap' } : null,
      proposed: proposed === null ? null : { rent: proposed, display: usd(proposed), increase: proposed - rent, pct: changeText(rent, proposed), pct12: changeText(base, proposed), over: max && proposed > max.rent ? proposed - max.rent : 0 },
      notice: { days: notice.days, serveBy: notice.days ? notice.serveBy : null, earliestEffective: notice.earliest ?? null, inTime: notice.ok, rule: notice.rule, words: notice.words },
      exempt: exempt ? { id: exempt.id, words: exempt.words } : null,
      reasons,
      notes: [...new Set(notes)],
      quality: (local && local.quality) || row.quality,
      sources,
    };
  }
  const cleanCounty = (c) => String(c ?? '').trim().replace(/\s+county$/i, '').replace(/\b\w/g, (x) => x.toUpperCase());
  const cap1 = (s) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;

  // A local ordinance's figure, or why it does not apply to this unit.
  function localCap(local, input) {
    const eff = input.effectiveDate;
    if (input.localCovered === false) return { applies: false, why: `Not covered by the ${local.name} ordinance (your answer); the statewide rule applies.` };
    if (local.coverage?.builtBy && input.builtDate && input.builtDate > local.coverage.builtBy) {
      return { applies: false, why: `Built ${longDate(input.builtDate)}, after ${longDate(local.coverage.builtBy)}: the ${local.name} cap does not reach it (${local.coverage.words}); the statewide rule applies.` };
    }
    if (local.coverage?.ageYears) {
      if (input.builtDate) {
        const from = `${Number(input.builtDate.slice(0, 4)) + local.coverage.ageYears}-01-01`;
        if (eff < from) return { applies: false, why: `Built in ${input.builtDate.slice(0, 4)}, the unit is rent-stabilized from ${longDate(from)} (${local.coverage.words}); before then no county cap applies.` };
      }
    }
    const w = local.cap.windows.find((x) => inWindow(x, eff));
    if (!w) return { applies: true, missing: `${local.name}'s figure for ${longDate(eff)} is not published yet; the tool has ${local.cap.windows.map((x) => windowWords(x)).join(', ')}.` };
    const cls = input.rstpoClass ?? 'general';
    const pct = typeof w.pct === 'object' ? w.pct[cls] : w.pct;
    return { applies: true, milli: milli(pct), window: { from: w.from, to: w.to, label: `${windowWords(w)}${typeof w.pct === 'object' ? `, ${local.cap.classes[cls].toLowerCase()}` : ''}` }, label: local.name, base: 'current', cpi: w.cpi ?? null };
  }

  // ---- the notice text ----

  function notice(input) {
    if (!isRealDate(input.noticeDate)) throw new RentCapError('noticeDate must be a real date written like 2026-11-08.', 'noticeDate');
    if (input.newRent === undefined && input.increasePct === undefined) throw new RentCapError('Give newRent or increasePct for the notice.', 'newRent');
    const c = check(input);
    const issues = c.reasons.filter((r) => r.level === 'fail');
    const row = S[c.state];
    const p = c.proposed;
    const paras = [
      `This is written notice that the rent for ${input.property} will increase from ${usd(c.rent)} to ${p.display} a month, an increase of ${usd(p.increase)} (${p.pct}), starting ${longDate(c.effectiveDate)}.`,
      c.cap
        ? `${c.cap.kind === 'good-cause-standard' ? 'The New York local rent standard under Real Prop. Law § 211' : `The limit under ${c.law}`} for an increase taking effect on that date is ${c.cap.pct} (${c.cap.display} on this rent); this increase ${p.rent <= c.cap.maxRent ? 'is within it' : 'is above it'}.`
        : c.exempt ? `The unit is exempt from the ${row.name} rent cap: ${c.exempt.words}.` : `${c.name} sets no percentage limit on this increase in the rules applied.`,
      c.notice.days ? `This notice is given ${daysBetween(c.noticeDate, c.effectiveDate)} days before the increase takes effect; ${c.notice.rule} requires ${c.notice.days} days.` : 'All other terms of your tenancy stay the same.',
    ];
    if (c.notice.days) paras.push('All other terms of your tenancy stay the same.');
    if (row.code === 'OR' && c.exempt) paras.push(`Facts supporting the exemption: ${input.exemptionFacts ?? c.exempt.words}.`);
    if (row.code === 'VA' && input.largeLandlord) paras.push(`Please tell me by ${longDate(input.replyBy ?? addDays(input.noticeDate, 30))} whether you will renew.`);
    paras.push('If you have questions about this notice, please contact me in writing.');
    return { check: c, issues, paras, title: c.state === 'WA' ? 'Rent and fee increase notice to tenants' : 'Notice of rent increase', form: c.state === 'WA' ? waForm(c, input) : null };
  }

  // Washington's statutory form (RCW 59.18.720(3)), filled in.
  function waForm(c, input) {
    const max = c.cap ? c.cap.maxRent : null;
    const level = c.exempt ? 'exemption' : max !== null && c.proposed.rent === max ? 'maximum' : 'lower';
    return {
      intro: 'This notice is required by Washington state law to inform you of your rights regarding rent and fee increases. Your rent or rental amount includes all recurring and periodic charges, sometimes referred to as rent and fees, identified in your rental agreement for the use and occupancy of your rental unit. Washington state limits how much your landlord can raise your rent and any other recurring or periodic charges for the use and occupancy of your rental unit.',
      rights: [
        '(1) Your landlord can raise your rent and any other recurring or periodic charges identified in the rental agreement for use and occupancy of your rental unit once every 12 months by up to seven percent plus consumer price index, or 10 percent, whichever is less, as allowed by RCW 59.18.700. Your landlord is not required to raise the rent or other recurring or periodic charges by any amount.',
        '(2) Your landlord may be exempt from the limit on increases for rent and other recurring or periodic charges for the reasons described in RCW 59.18.710. If your landlord claims an exemption, your landlord is required to include supporting facts with this notice.',
        '(3) Your landlord must properly and fully complete the form below to notify you of any increases in rent and other recurring or periodic charges and any exemptions claimed.',
      ],
      raise: `Your landlord ${input.landlord?.name ?? ''} intends to: [X] Raise your rent and/or other recurring or periodic charges: Your total increase for rent and other recurring or periodic charges effective ${longDate(c.effectiveDate)} will be ${c.proposed.pct}, which totals an additional ${usd(c.proposed.increase)} per month, for a new total amount of ${c.proposed.display} per month for rent and other recurring or periodic charges.`,
      level,
      levels: [
        `[${level === 'lower' ? 'X' : ' '}] A lower increase than the maximum allowed by state law.`,
        `[${level === 'maximum' ? 'X' : ' '}] The maximum increase allowed by state law.`,
        `[${level === 'exemption' ? 'X' : ' '}] Authorized by an exemption under RCW 59.18.710.`,
      ],
      exemption: c.exempt ? `Exemption claimed: ${c.exempt.words}. ${input.exemptionFacts ? `Supporting facts: ${input.exemptionFacts}` : 'The landlord must include facts or attach documents supporting the exemption.'}` : null,
    };
  }

  // ---- the percentage calculator ----

  function percent(input) {
    const a = toCents(input.rent, 'rent');
    const b = toCents(input.newRent, 'newRent');
    if (a <= 0) throw new RentCapError('rent must be more than $0.', 'rent');
    const diff = b - a;
    return { rent: a, newRent: b, change: diff, changeDisplay: usd(diff), pct: changeText(a, b), yearly: diff * 12, yearlyDisplay: usd(diff * 12), answer: `Raising ${usd(a)} to ${usd(b)} is a ${changeText(a, b)} ${diff >= 0 ? 'increase' : 'decrease'} (${usd(Math.abs(diff))} a month, ${usd(Math.abs(diff) * 12)} a year).` };
  }

  return {
    order: ORDER,
    states: S,
    localities: L,
    stateRow,
    regionOf,
    counties: CA_COUNTIES,
    check,
    notice,
    percent,
    covered: () => [...ORDER.map((c) => ({ code: c, name: S[c].name, law: S[c].law, kind: S[c].kind, cap: S[c].cap?.words ?? null, notice: S[c].notice.words })), ...Object.values(L).map((l) => ({ code: `${l.state}/${l.slug}`, name: l.name, law: l.law, kind: 'local' }))],
    notCovered: () => Object.entries(RULES.notCovered).map(([code, x]) => ({ code, ...x })),
  };
}
