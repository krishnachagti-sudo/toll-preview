// Trucker per diem: the IRS special meal and incidental expenses (M&IE) rate for the
// transportation industry, applied day by day.
//
// Pure and dependency-free: the server (tool.js) and the page load this same file. The rate table
// is not in here; makeEngine(data) takes it (data/transportation-rates.json on the server, the
// published rates example in the browser), so both sides price a day from the same dated table.
//
// The rules, each from the source named:
//  - The rate is the one in force on the day of travel. Each IRS notice sets it for travel on or
//    after October 1 until the next notice, so a calendar year has two notice periods, and 2021
//    ($66 then $69) and 2024 ($69 then $80) have two rates.
//  - A full day is 12:01 a.m. to midnight. A departure or return day is a partial day at 3/4 of the
//    rate: Rev. Proc. 2019-48 sec. 6.04 (and Rev. Proc. 2011-47 sec. 6.04 before November 26, 2019)
//    requires the 3/4 method for the self-employed M&IE method of sec. 4.03.
//  - The whole M&IE amount is food and beverage (sec. 6.05(1)): 80% deductible for meals during
//    periods subject to DOT hours-of-service limits (IRC 274(n)(3), Pub 463), 50% otherwise, and
//    100% for 2021 and 2022 (Notice 2021-63: the meal portion of per diem treated as restaurant
//    food under the temporary 274(n)(2)(D) exception).
//  - Incidental-expenses-only days ($5, 3/4 on a partial day) are not limited (sec. 6.05(5)) and
//    go on Schedule C line 24a, not 24b.
//  - Days a carrier or employer reimbursed cannot also be deducted (sec. 6.06).
//
// Money is whole cents. Every rate is whole dollars, so 3/4 of a rate is a whole number of cents
// and the 80% and 100% limits are exact; only the 50% limit can leave half a cent, rounded half up
// once on the total.

export const ENGINE_VERSION = 'trucker-per-diem 1.0';
export const MIN_YEAR = 2019;
export const STATUSES = ['full', 'partial', 'incidental', 'incidental-partial', 'reimbursed', 'home'];
export const LOCALITIES = ['CONUS', 'OCONUS'];
export const STATUS_WORDS = {
  full: 'Full day',
  partial: 'Departure or return day',
  incidental: 'Incidental only',
  'incidental-partial': 'Incidental only, partial day',
  reimbursed: 'Reimbursed',
  home: 'Home',
};
export const COUNT_KEYS = ['fullDays', 'partialDays', 'oconusFullDays', 'oconusPartialDays', 'incidentalOnlyDays', 'incidentalOnlyPartialDays'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const AWAY = new Set(['full', 'partial', 'incidental', 'incidental-partial', 'reimbursed']);
const MEALS = new Set(['full', 'partial']);
const INCIDENTAL = new Set(['incidental', 'incidental-partial']);
const PARTIAL = new Set(['partial', 'incidental-partial']);

export class PerDiemError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'PerDiemError';
    this.field = field ?? null;
  }
}

// ---------- dates ----------

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
export function isRealDate(s) {
  const m = DATE_RE.exec(s ?? '');
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}
export const dayNumber = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / 86400000;
export const fromDayNumber = (n) => new Date(n * 86400000).toISOString().slice(0, 10);
export const addDays = (iso, n) => fromDayNumber(dayNumber(iso) + n);
export const daysInYear = (y) => (dayNumber(`${y + 1}-01-01`) - dayNumber(`${y}-01-01`));
const weekdayOf = (iso) => new Date(dayNumber(iso) * 86400000).getUTCDay();
export const monthName = (m) => MONTHS[m - 1];
export const longDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}, ${iso.slice(0, 4)}`;
export const shortDate = (iso) => `${WEEKDAYS[weekdayOf(iso)]}, ${MONTHS[+iso.slice(5, 7) - 1].slice(0, 3)} ${+iso.slice(8, 10)}`;
export const monthDay = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`;

// ---------- money ----------

// Cents as "$1,234.50".
export function money(cents) {
  const neg = cents < 0;
  const c = Math.abs(Math.round(cents));
  const dollars = String(Math.floor(c / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}$${dollars}.${String(c % 100).padStart(2, '0')}`;
}
// Cents as "$80" when whole, "$51.75" when not: for rates.
export const rateMoney = (cents) => (cents % 100 === 0 ? `$${cents / 100}` : money(cents));
export const toDollars = (cents) => Math.round(cents) / 100;
// a x pct / 100, rounded half up (amounts are never negative).
const pctOf = (cents, pct) => Math.floor((cents * pct + 50) / 100);

// ---------- the engine ----------

export function makeEngine(data) {
  const periods = [...data.periods].sort((a, b) => (a.from < b.from ? -1 : 1));
  for (let i = 1; i < periods.length; i++) {
    if (addDays(periods[i - 1].to, 1) !== periods[i].from) throw new Error(`Rate periods are not contiguous at ${periods[i].from}`);
  }
  const first = periods[0].from;
  const last = periods[periods.length - 1].to;
  const maxYear = Number(last.slice(0, 4));
  const meals100 = data.meals100;
  const revProcs = data.revProcs ?? [];

  const periodOn = (iso) => periods.find((p) => p.from <= iso && iso <= p.to) ?? null;
  const hundred = (iso) => Boolean(meals100 && meals100.from <= iso && iso <= meals100.to);
  const pctFor = (iso, hos) => (hundred(iso) ? 100 : hos ? 80 : 50);
  const revProcOn = (iso) => revProcs.find((r) => (!r.from || r.from <= iso) && (!r.to || iso <= r.to)) ?? null;

  function checkYear(y, field = 'taxYear') {
    if (!Number.isInteger(y) || y < MIN_YEAR || y > maxYear) {
      throw new PerDiemError(`Tax year must be ${MIN_YEAR} to ${maxYear}: the IRS rates on file run from ${longDate(first)} to ${longDate(last)}.`, field);
    }
  }
  const yearEndCovered = (y) => `${y}-12-31` <= last;
  const coveredEnd = (y) => (yearEndCovered(y) ? `${y}-12-31` : last);

  // The notice periods that touch a calendar year, clipped to it.
  function yearPeriods(y) {
    const from = `${y}-01-01`;
    const to = `${y}-12-31`;
    return periods.filter((p) => p.to >= from && p.from <= to).map((p) => ({ ...p, clipFrom: p.from < from ? from : p.from, clipTo: p.to > to ? to : p.to }));
  }

  // The amount for one day, in cents, and what it rests on.
  function dayValue(iso, status, locality, hos) {
    const p = periodOn(iso);
    if (!p && status === 'home') return { period: null, base: 0, share: '0', amount: 0, line: null, pct: null };
    if (!p) throw new PerDiemError(`No IRS rate is on file for ${longDate(iso)}: the rates run from ${longDate(first)} to ${longDate(last)}.`, 'days');
    const partial = PARTIAL.has(status);
    let base = 0;
    let line = null;
    let pct = null;
    if (MEALS.has(status)) {
      base = (locality === 'OCONUS' ? p.oconus : p.conus) * 100;
      line = '24b';
      pct = pctFor(iso, hos);
    } else if (INCIDENTAL.has(status)) {
      base = p.incidentalOnly * 100;
      line = '24a';
      pct = 100;
    }
    const amount = partial ? (base * 3) / 4 : base;
    return { period: p, base, share: partial ? '3/4' : base ? '1' : '0', amount, line, pct };
  }

  // ---------- rates ----------

  function rates({ from = first, to = last } = {}) {
    if (!isRealDate(from) || !isRealDate(to)) throw new PerDiemError('Dates must be real dates written like 2024-10-01.', 'from');
    if (to < from) throw new PerDiemError('The "to" date is before the "from" date.', 'to');
    const out = periods.filter((p) => p.to >= from && p.from <= to).map((p) => ({
      from: p.from,
      to: p.to,
      notice: p.notice,
      url: p.url,
      conus: p.conus,
      oconus: p.oconus,
      conusPartial: toDollars((p.conus * 300) / 4),
      oconusPartial: toDollars((p.oconus * 300) / 4),
      incidentalOnly: p.incidentalOnly,
      incidentalOnlyPartial: toDollars((p.incidentalOnly * 300) / 4),
      section3: p.section3,
      section4: p.section4,
      readOn: p.readOn,
    }));
    const notes = [];
    if (from < first) notes.push(`No rate is on file before ${longDate(first)}.`);
    if (to > last) notes.push(`The IRS has not published the rate for travel on or after ${longDate(addDays(last, 1))} yet; it usually does in late September.`);
    return {
      op: 'rates',
      from,
      to,
      periods: out,
      meals100: meals100 ? { ...meals100 } : null,
      revProcs: revProcs.map((r) => ({ ...r })),
      other: data.other ? JSON.parse(JSON.stringify(data.other)) : null,
      answer: out.length
        ? `${out.length === 1 ? 'The rate' : 'Rates'} from ${longDate(out[0].from < from ? from : out[0].from)} to ${longDate(out[out.length - 1].to > to ? to : out[out.length - 1].to)}: ${out.map((p) => `$${p.conus} CONUS and $${p.oconus} OCONUS from ${longDate(p.from)} (${p.notice})`).join('; ')}.`
        : 'No IRS transportation-industry rate is on file for those dates.',
      notes,
    };
  }

  // ---------- the year's limit and words ----------

  function limitFor(y, hos) {
    const pct = pctFor(`${y}-06-30`, hos);
    let basis;
    if (pct === 100) basis = `100%: ${meals100.notice} lets the meal portion of ${y} per diem be treated as restaurant meals, deductible in full under the temporary IRC 274(n)(2)(D) exception for 2021 and 2022`;
    else if (pct === 80) basis = '80%: meals during periods subject to DOT hours-of-service limits (IRC 274(n)(3), Publication 463)';
    else basis = '50%: the general limit on meals (IRC 274(n)(1)); 80% applies only to meals during DOT hours-of-service periods';
    return { pct, basis };
  }

  function methodLock(y) {
    return `The special transportation rate is used for every CONUS and OCONUS day of ${y}; once used, it applies to all trips that calendar year, and this driver cannot switch to federal locality M&IE rates until January 1, ${y + 1} (Rev. Proc. 2019-48 secs. 4.04(3) and 4.06(2); Publication 463).`;
  }

  // Shared notes for a result, plus the sources it rests on.
  function notesFor(y, { hos, interstate, segments }) {
    const notes = [];
    const rp = revProcOn(`${y}-12-31`);
    notes.push(`Departure and return days are 3/4 of the day's rate: ${rp ? rp.name : 'Rev. Proc. 2019-48'} sec. 6.04 requires the 3/4 method for the self-employed per diem method. Publication 463 also describes other proration methods; ask your preparer if you use one.`);
    if (segments.length > 1 && segments[0].conus !== segments[segments.length - 1].conus) {
      notes.push(`Rev. Proc. 2019-48 sec. 4.06 lets a taxpayer keep the January to September rates for October to December; the transportation rate rose on October 1, ${y}, so this worksheet uses the rate in force each day.`);
    }
    if (!hos) notes.push('Meals outside DOT hours-of-service periods are 50% deductible. The Schedule C instructions name interstate truck operators under DOT regulations for the 80% limit.');
    if (hos && interstate === false) notes.push('The Schedule C instructions name interstate truck operators under DOT regulations for the 80% limit. If you drive only within one state, confirm with your preparer that your meals were during periods subject to DOT hours-of-service limits.');
    if (!yearEndCovered(y)) notes.push(`The IRS has not published the rate for travel on or after ${longDate(addDays(last, 1))} yet.`);
    return notes;
  }

  function citations(y, segments) {
    const out = segments.flatMap((s) => s.notices.map((n) => ({ name: n.notice, url: n.url })));
    const seen = new Set();
    const list = out.filter((c) => (seen.has(c.name) ? false : seen.add(c.name)));
    if (pctFor(`${y}-06-30`, true) === 100 && meals100) list.push({ name: meals100.notice, url: meals100.url });
    const rp = revProcOn(`${y}-12-31`);
    if (rp) list.push({ name: rp.name, url: rp.url });
    if (data.other?.pub463) list.push({ name: data.other.pub463.name, url: data.other.pub463.url });
    if (data.other?.scheduleC) list.push({ name: data.other.scheduleC.name, url: data.other.scheduleC.url });
    return list;
  }

  // ---------- quick: counts in, deduction out ----------

  function readCounts(src = {}, field) {
    const c = {};
    for (const k of COUNT_KEYS) {
      const v = src[k] ?? 0;
      if (!Number.isInteger(v) || v < 0) throw new PerDiemError(`${k} must be a whole number of days, 0 or more.`, field ? `${field}.${k}` : k);
      c[k] = v;
    }
    return c;
  }
  const sumCounts = (c) => COUNT_KEYS.reduce((s, k) => s + c[k], 0);

  function countAmounts(c, p) {
    const mie = c.fullDays * p.conus * 100 + c.partialDays * p.conus * 75 + c.oconusFullDays * p.oconus * 100 + c.oconusPartialDays * p.oconus * 75;
    const inc = c.incidentalOnlyDays * p.incidentalOnly * 100 + c.incidentalOnlyPartialDays * p.incidentalOnly * 75;
    return { mie, inc };
  }

  function quick(input) {
    const y = input.taxYear;
    checkYear(y);
    const hos = input.hosSubject ?? true;
    if (input.transportationIndustry === false) throw notTransport();
    const total = readCounts(input);
    const yp = yearPeriods(y);
    const [a, b] = yp; // Jan-Sep and Oct-Dec
    const split = Boolean(b) && (a.conus !== b.conus || a.oconus !== b.oconus || a.incidentalOnly !== b.incidentalOnly);
    const janSepDays = dayNumber(a.clipTo) - dayNumber(a.clipFrom) + 1;
    let late = null;
    if (input.octDec !== undefined && input.octDec !== null) late = readCounts(input.octDec, 'octDec');
    if (!b && late && sumCounts(late) > 0) {
      throw new PerDiemError(`The IRS has not published the rate for travel on or after ${longDate(addDays(last, 1))} yet, so October to December ${y} cannot be counted.`, 'octDec');
    }
    if (split && !late) {
      throw new PerDiemError(`The rate changed on October 1, ${y} ($${a.conus} to $${b.conus}), so say how many of these days were October to December (octDec).`, 'octDec');
    }
    if (sumCounts(total) > (b ? daysInYear(y) : janSepDays)) {
      throw new PerDiemError(`That is ${sumCounts(total)} days, more than ${b ? `the ${daysInYear(y)} days in ${y}` : `the ${janSepDays} days with a published rate`}.`, 'fullDays');
    }
    const early = {};
    if (late) {
      for (const k of COUNT_KEYS) {
        if (late[k] > total[k]) throw new PerDiemError(`October to December ${k} (${late[k]}) is more than the year's ${total[k]}.`, `octDec.${k}`);
        early[k] = total[k] - late[k];
      }
      if (sumCounts(late) > 92) throw new PerDiemError(`October to December has 92 days, not ${sumCounts(late)}.`, 'octDec');
      if (sumCounts(early) > janSepDays) throw new PerDiemError(`January to September ${y} has ${janSepDays} days, not ${sumCounts(early)}.`, 'octDec');
    }
    const { pct, basis } = limitFor(y, hos);
    const segments = [];
    const seg = (from, to, ps, counts) => {
      const p = ps[0];
      const { mie, inc } = countAmounts(counts, p);
      segments.push({
        from, to, notices: ps.map((x) => ({ notice: x.notice, url: x.url })), conus: p.conus, oconus: p.oconus, incidentalOnly: p.incidentalOnly,
        ...counts, perDiemCents: mie, incidentalCents: inc,
      });
    };
    if (late && b) {
      seg(a.clipFrom, a.clipTo, [a], early);
      seg(b.clipFrom, b.clipTo, [b], late);
    } else {
      seg(a.clipFrom, b ? b.clipTo : a.clipTo, b ? [a, b] : [a], total);
    }
    return finish(y, { hos, interstate: input.interstate, segments, pct, basis, op: 'quick', counts: total });
  }

  function notTransport() {
    return new PerDiemError('The special transportation rate is only for work that directly moves people or goods by truck (or bus, train, ship, barge or plane) and regularly stops on one trip at places with different federal M&IE rates (Rev. Proc. 2019-48 sec. 4.04(2)). Without that, use the federal M&IE rate for each place you stop to sleep or rest (GSA per diem rates).', 'transportationIndustry');
  }

  // Totals, words and the two numbers, from segments with per diem and incidental cents.
  function finish(y, { hos, interstate, segments, pct, basis, op, counts, extra = {} }) {
    const perDiem = segments.reduce((s, x) => s + x.perDiemCents, 0);
    const incidental = segments.reduce((s, x) => s + x.incidentalCents, 0);
    const deductible = pctOf(perDiem, pct);
    const notes = notesFor(y, { hos, interstate, segments });
    const fmtSeg = segments.map((s) => ({
      from: s.from,
      to: s.to,
      notices: s.notices,
      rateConus: s.conus,
      rateOconus: s.oconus,
      rateIncidentalOnly: s.incidentalOnly,
      ...Object.fromEntries(COUNT_KEYS.map((k) => [k, s[k]])),
      perDiem: toDollars(s.perDiemCents),
      deductible: toDollars(pctOf(s.perDiemCents, pct)),
      incidentalOnly: toDollars(s.incidentalCents),
    }));
    const full = (counts.fullDays ?? 0) + (counts.oconusFullDays ?? 0);
    const part = (counts.partialDays ?? 0) + (counts.oconusPartialDays ?? 0);
    const rateWords = segments.length > 1 && segments[0].conus !== segments[1].conus
      ? `$${segments[0].conus} a day to September 30 (${segments[0].notices[0].notice}) and $${segments[1].conus} from October 1 (${segments[1].notices[0].notice})`
      : `$${segments[0].conus} a day (${segments.flatMap((s) => s.notices.map((n) => n.notice)).join(', ')})`;
    const oconus = (counts.oconusFullDays ?? 0) + (counts.oconusPartialDays ?? 0);
    const oconusWords = oconus ? `, and $${[...new Set(segments.map((s) => s.oconus))].join(' and $')} outside the continental US,` : '';
    const answer = perDiem === 0 && incidental === 0
      ? `No meal or incidental days are logged for ${y}, so there is no per diem deduction.`
      : `${full} full ${full === 1 ? 'day' : 'days'} and ${part} departure or return ${part === 1 ? 'day' : 'days'} in ${y} at ${rateWords}${oconusWords} come to ${money(perDiem)} of per diem; at the ${pct}% limit the deduction for Schedule C line 24b is ${money(deductible)}${incidental ? `, plus ${money(incidental)} of incidental-expenses-only days on line 24a` : ''}.`;
    return {
      op,
      taxYear: y,
      answer,
      totals: {
        perDiem: toDollars(perDiem),
        deductiblePct: pct,
        deductible: toDollars(deductible),
        scheduleCLine24b: toDollars(deductible),
        scheduleCLine24a: toDollars(incidental),
        softwareEntry: toDollars(perDiem),
        display: { perDiem: money(perDiem), deductible: money(deductible), incidentalOnly: money(incidental) },
      },
      limit: { pct, basis },
      howToEnter: [
        `Tax software that asks for your meal expenses and applies the limit itself (for example by ticking "subject to DOT hours of service"): enter the full per diem, ${money(perDiem)}.`,
        `A form line that asks for the deductible amount (Schedule C line 24b): enter ${money(deductible)}. Never take ${pct}% of a figure that already had it applied.`,
        ...(incidental ? [`Incidental-expenses-only days go on Schedule C line 24a (travel), not 24b: ${money(incidental)}, not limited.`] : []),
      ],
      segments: fmtSeg,
      methodLock: methodLock(y),
      notes,
      citations: citations(y, segments),
      ...extra,
    };
  }

  // ---------- the log: days and trips to a worksheet ----------

  // Expands trips and day entries into one entry per date, with the warnings found on the way.
  function expandLog(y, { days = [], trips = [] }) {
    const from = `${y}-01-01`;
    const to = `${y}-12-31`;
    const end = coveredEnd(y);
    const warnings = [];
    const byDate = new Map();
    const tripDay = new Map();
    trips.forEach((t, i) => {
      if (!isRealDate(t.depart) || !isRealDate(t.return)) throw new PerDiemError(`Trip ${i + 1}: depart and return must be real dates like 2026-03-02.`, 'trips');
      if (t.return < t.depart) throw new PerDiemError(`Trip ${i + 1} returns (${t.return}) before it departs (${t.depart}).`, 'trips');
      if (t.return < from || t.depart > to) throw new PerDiemError(`Trip ${i + 1} (${t.depart} to ${t.return}) is outside ${y}.`, 'trips');
      if (dayNumber(t.return) - dayNumber(t.depart) > 800) throw new PerDiemError(`Trip ${i + 1} is longer than two years.`, 'trips');
      const loc = t.locality ?? 'CONUS';
      for (let n = dayNumber(t.depart); n <= dayNumber(t.return); n++) {
        const d = fromDayNumber(n);
        if (d < from || d > to) continue;
        if (d > end) throw new PerDiemError(`Trip ${i + 1} runs past ${longDate(end)}: the IRS has not published the rate for later travel yet.`, 'trips');
        const status = d === t.depart || d === t.return ? 'partial' : 'full';
        const prev = tripDay.get(d);
        if (prev) {
          warnings.push({ code: 'trips_overlap', date: d, message: `${shortDate(d)} is in two trips. Counted once, as ${prev.status === 'full' || status === 'full' ? 'a full day' : 'a departure or return day'}.` });
          if (prev.status === 'full' || status !== 'full') continue;
        }
        tripDay.set(d, { date: d, status, locality: loc, ref: t.ref ?? null, from: 'trip' });
      }
      if (t.depart === t.return) warnings.push({ code: 'same_day_trip', date: t.depart, message: `${shortDate(t.depart)}: a trip that leaves and returns the same day. It counts only if you were relieved from duty long enough to sleep or rest; napping in the truck does not count (Publication 463).` });
    });
    for (const [d, e] of tripDay) byDate.set(d, e);
    const explicit = new Map();
    days.forEach((e, i) => {
      if (!isRealDate(e.date)) throw new PerDiemError(`Day ${i + 1}: "${e.date}" is not a real date like 2026-03-02.`, 'days');
      if (e.date < from || e.date > to) throw new PerDiemError(`${e.date} is not in tax year ${y}.`, 'days');
      if (!STATUSES.includes(e.status)) throw new PerDiemError(`${e.date}: status must be one of ${STATUSES.join(', ')}.`, 'days');
      if (e.date > end && e.status !== 'home') throw new PerDiemError(`${longDate(e.date)}: the IRS has not published the rate for travel on or after ${longDate(addDays(last, 1))} yet.`, 'days');
      const loc = e.locality ?? 'CONUS';
      const seen = explicit.get(e.date);
      if (seen) {
        if (seen.status !== e.status || seen.locality !== loc) throw new PerDiemError(`${e.date} is logged twice, as ${seen.status} ${seen.locality} and as ${e.status} ${loc}. Keep one.`, 'days');
        warnings.push({ code: 'duplicate_date', date: e.date, message: `${shortDate(e.date)} is logged twice the same way; counted once.` });
        return;
      }
      const entry = { date: e.date, status: e.status, locality: loc, ref: e.ref ?? null, from: 'day' };
      explicit.set(e.date, entry);
      byDate.set(e.date, entry);
    });
    return { entries: [...byDate.values()].sort((p, q) => (p.date < q.date ? -1 : 1)), warnings };
  }

  // The checks a preparer or examiner would make of a days-away log.
  function checkLog(y, entries, { hos, interstate }) {
    const warnings = [];
    const at = new Map(entries.map((e) => [e.date, e]));
    const away = (d) => AWAY.has(at.get(d)?.status);
    const first = `${y}-01-01`;
    const lastDay = coveredEnd(y);
    for (const e of entries) {
      const prev = addDays(e.date, -1);
      const next = addDays(e.date, 1);
      if (e.status === 'full' || e.status === 'incidental') {
        if (e.date > first && !away(prev)) warnings.push({ code: 'missing_departure_day', date: e.date, message: `${shortDate(e.date)}: a full day right after a day at home. The day you leave is a departure day at 3/4 of the rate, unless you left before 12:01 a.m.` });
        if (e.date < lastDay && !away(next)) warnings.push({ code: 'missing_return_day', date: e.date, message: `${shortDate(e.date)}: a full day right before a day at home. The day you get back is a return day at 3/4 of the rate.` });
      }
      if (PARTIAL.has(e.status) && e.from === 'day') {
        const before = away(prev);
        const after = away(next);
        if (!before && !after && e.date > first && e.date < lastDay) warnings.push({ code: 'same_day_trip', date: e.date, message: `${shortDate(e.date)}: away for part of one day only. It counts only if you were relieved from duty long enough to sleep or rest; napping in the truck does not count (Publication 463).` });
        if (before && after) warnings.push({ code: 'partial_mid_trip', date: e.date, message: `${shortDate(e.date)}: a departure or return day in the middle of a trip. If you did not get home that day, log it as a full day.` });
      }
    }
    const meals = entries.some((e) => MEALS.has(e.status));
    const inc = entries.filter((e) => INCIDENTAL.has(e.status));
    if (meals && inc.length) {
      warnings.push({ code: 'incidental_mixed', date: inc[0].date, message: `${inc.length} incidental-only ${inc.length === 1 ? 'day is' : 'days are'} mixed with meal days. Publication 463 bars the $5 method only on a day you use the meal allowance, but Rev. Proc. 2019-48 sec. 4.05 says it is not for taxpayers who use the M&IE method. Ask your preparer before claiming both in one year.` });
    }
    // Months with nothing logged between the first and last month that have entries.
    const months = [...new Set(entries.filter((e) => e.status !== 'home').map((e) => Number(e.date.slice(5, 7))))].sort((p, q) => p - q);
    if (months.length) {
      for (let m = months[0] + 1; m < months[months.length - 1]; m++) {
        if (!months.includes(m)) warnings.push({ code: 'month_without_entries', date: `${y}-${String(m).padStart(2, '0')}-01`, message: `No days away in ${monthName(m)} ${y}. If you were on the road, get the records now: carriers need keep duty-status records and ELD back-ups only 6 months (49 CFR 395.8(k), 395.22(i)).` });
      }
    }
    const reimbursed = entries.filter((e) => e.status === 'reimbursed').length;
    if (reimbursed) warnings.push({ code: 'reimbursed_days', date: entries.find((e) => e.status === 'reimbursed').date, message: `${reimbursed} ${reimbursed === 1 ? 'day' : 'days'} reimbursed by a carrier or employer ${reimbursed === 1 ? 'is' : 'are'} left out: a day that was paid per diem cannot also be deducted (Rev. Proc. 2019-48 sec. 6.06).` });
    if (hos && interstate === false) warnings.push({ code: 'intrastate', date: null, message: 'You said you drive only within one state. The Schedule C instructions name interstate truck operators under DOT regulations for the 80% limit; confirm with your preparer before using 80%.' });
    return warnings;
  }

  function log(input) {
    const y = input.taxYear;
    checkYear(y);
    if (input.transportationIndustry === false) throw notTransport();
    const hos = input.hosSubject ?? true;
    const { entries, warnings: expandWarnings } = expandLog(y, input);
    const { pct, basis } = limitFor(y, hos);
    const rows = entries.map((e) => {
      const v = dayValue(e.date, e.status, e.locality, hos);
      return {
        date: e.date,
        status: e.status,
        locality: e.locality,
        rate: v.base ? toDollars(v.base) : 0,
        share: v.share,
        amount: toDollars(v.amount),
        cents: v.amount,
        notice: v.base ? v.period.notice : null,
        deductiblePct: v.pct,
        line: v.line,
        ref: e.ref,
      };
    });
    // One segment per notice period in the year, for the rate table.
    const segments = yearPeriods(y).filter((p) => p.clipFrom <= coveredEnd(y)).map((p) => {
      const inP = rows.filter((r) => r.date >= p.clipFrom && r.date <= p.clipTo);
      const c = (status, loc) => inP.filter((r) => r.status === status && (loc === undefined || r.locality === loc)).length;
      return {
        from: p.clipFrom,
        to: p.clipTo > coveredEnd(y) ? coveredEnd(y) : p.clipTo,
        notices: [{ notice: p.notice, url: p.url }],
        conus: p.conus,
        oconus: p.oconus,
        incidentalOnly: p.incidentalOnly,
        fullDays: c('full', 'CONUS'),
        partialDays: c('partial', 'CONUS'),
        oconusFullDays: c('full', 'OCONUS'),
        oconusPartialDays: c('partial', 'OCONUS'),
        incidentalOnlyDays: c('incidental'),
        incidentalOnlyPartialDays: c('incidental-partial'),
        perDiemCents: inP.filter((r) => r.line === '24b').reduce((s, r) => s + r.cents, 0),
        incidentalCents: inP.filter((r) => r.line === '24a').reduce((s, r) => s + r.cents, 0),
      };
    });
    const counts = {};
    for (const k of COUNT_KEYS) counts[k] = segments.reduce((s, x) => s + x[k], 0);
    const months = MONTHS.map((name, i) => {
      const m = i + 1;
      const inM = rows.filter((r) => Number(r.date.slice(5, 7)) === m);
      const per = inM.filter((r) => r.line === '24b').reduce((s, r) => s + r.cents, 0);
      const incid = inM.filter((r) => r.line === '24a').reduce((s, r) => s + r.cents, 0);
      return {
        month: `${y}-${String(m).padStart(2, '0')}`,
        name,
        fullDays: inM.filter((r) => r.status === 'full').length,
        partialDays: inM.filter((r) => r.status === 'partial').length,
        oconusDays: inM.filter((r) => MEALS.has(r.status) && r.locality === 'OCONUS').length,
        incidentalOnlyDays: inM.filter((r) => INCIDENTAL.has(r.status)).length,
        reimbursedDays: inM.filter((r) => r.status === 'reimbursed').length,
        perDiem: toDollars(per),
        deductible: toDollars(pctOf(per, pct)),
        incidentalOnly: toDollars(incid),
      };
    });
    const warnings = [...expandWarnings, ...checkLog(y, entries, { hos, interstate: input.interstate })]
      .sort((p, q) => ((p.date ?? '') < (q.date ?? '') ? -1 : (p.date ?? '') > (q.date ?? '') ? 1 : p.code < q.code ? -1 : 1));
    const reimbursedDays = rows.filter((r) => r.status === 'reimbursed').length;
    const homeDays = rows.filter((r) => r.status === 'home').length;
    return finish(y, {
      hos,
      interstate: input.interstate,
      segments,
      pct,
      basis,
      op: 'log',
      counts,
      extra: {
        counts: { ...counts, reimbursedDays, homeDaysLogged: homeDays, daysLogged: rows.length },
        months,
        rows: rows.map(({ cents, ...r }) => r),
        warnings,
      },
    });
  }

  return {
    first,
    last,
    maxYear,
    periods,
    meals100,
    periodOn,
    pctFor,
    dayValue,
    yearPeriods,
    rates,
    quick,
    log,
  };
}

// ---------- the worksheet: canonical input, hash, CSV and PDF ----------

// The log in one canonical form, so the same log always hashes the same however it was sent.
export function canonicalLog(input, result) {
  return JSON.stringify({
    engine: ENGINE_VERSION,
    taxYear: result.taxYear,
    driverLabel: (input.driverLabel ?? '').trim(),
    taxHome: (input.taxHome ?? '').trim(),
    hosSubject: input.hosSubject ?? true,
    interstate: input.interstate ?? null,
    days: result.rows.map((r) => [r.date, r.status, r.locality, r.ref ?? '']),
  });
}

const CSV_FORMULA = /^[=+\-@\t\r]/;
const csvCell = (v) => {
  let s = v === null || v === undefined ? '' : String(v);
  if (CSV_FORMULA.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function worksheetCsv(result) {
  const head = ['date', 'weekday', 'status', 'locality', 'daily_rate', 'share', 'amount', 'notice', 'deductible_pct', 'schedule_c_line', 'ref'];
  const lines = [head];
  for (const r of result.rows) {
    lines.push([r.date, WEEKDAYS[weekdayOf(r.date)], r.status, r.locality, r.rate ? r.rate.toFixed(2) : '', r.share, r.amount.toFixed(2), r.notice ?? '', r.deductiblePct ?? '', r.line ?? '', r.ref ?? '']);
  }
  return lines.map((l) => l.map(csvCell).join(',')).join('\r\n') + '\r\n';
}

// SHA-256 of a string (UTF-8), as hex. Small and standard, so the browser and server agree.
export function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];
  const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
  const len = bytes.length;
  const padded = new Uint8Array(Math.ceil((len + 9) / 64) * 64);
  padded.set(bytes);
  padded[len] = 0x80;
  const bits = len * 8;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, Math.floor(bits / 0x100000000));
  view.setUint32(padded.length - 4, bits >>> 0);
  const w = new Uint32Array(64);
  const rotr = (x, n) => (x >>> n) | (x << (32 - n));
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(off + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let [a, b, c, d, e, f, g, h] = H;
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + w[i]) >>> 0;
      const t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) >>> 0;
      h = g; g = f; f = e; e = (d + t1) >>> 0; d = c; c = b; b = a; a = (t1 + t2) >>> 0;
    }
    H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0; H[2] = (H[2] + c) >>> 0; H[3] = (H[3] + d) >>> 0;
    H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0; H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
  }
  return H.map((x) => x.toString(16).padStart(8, '0')).join('');
}

// ---------- a small PDF writer: Letter pages, Helvetica and Courier, text and rules ----------

// Helvetica glyph widths (per 1000 em) for ASCII 32 to 126, WinAnsiEncoding.
const HELV = [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556,
  278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667,
  944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500,
  278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584];

// Printable ASCII only: the standard fonts here have no glyphs beyond it.
export const pdfSafe = (s) => String(s ?? '').normalize('NFKD').replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/[^\x20-\x7e]/g, '');
const textWidth = (s, size, mono) => (mono ? s.length * 600 : [...s].reduce((w, ch) => w + (HELV[ch.charCodeAt(0) - 32] ?? 556), 0)) * size / 1000;
const pdfString = (s) => `(${pdfSafe(s).replace(/[\\()]/g, (c) => `\\${c}`)})`;

function wrap(text, size, width) {
  const words = pdfSafe(text).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (textWidth(next, size) > width && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

const PAGE_W = 612;
const PAGE_H = 792;
const MARGIN = 48;
const INNER = PAGE_W - MARGIN * 2;

function pdfLayout(header, footer) {
  const pages = [];
  let ops = null;
  let y = 0;
  const newPage = () => {
    ops = [];
    pages.push(ops);
    y = PAGE_H - MARGIN;
    text(header, MARGIN, y, 8, 'F1');
    rule(y - 4, 0.5);
    y -= 22;
  };
  const text = (s, x, yy, size, font = 'F1') => ops.push(`BT /${font} ${size} Tf ${x.toFixed(2)} ${yy.toFixed(2)} Td ${pdfString(s)} Tj ET`);
  const rule = (yy, width = 0.5) => ops.push(`${width} w ${MARGIN} ${yy.toFixed(2)} m ${PAGE_W - MARGIN} ${yy.toFixed(2)} l S`);
  const need = (h) => { if (!ops || y - h < MARGIN + 24) newPage(); };
  const api = {
    heading(s, size = 13) { need(size + 14); y -= 4; text(s, MARGIN, y, size, 'F2'); y -= size + 6; },
    para(s, size = 9.5, font = 'F1') {
      for (const line of wrap(s, size, INNER)) { need(size + 4); text(line, MARGIN, y, size, font); y -= size + 3.5; }
      y -= 3;
    },
    bullet(s, size = 9) {
      const lines = wrap(s, size, INNER - 12);
      lines.forEach((line, i) => { need(size + 4); if (i === 0) text('-', MARGIN, y, size); text(line, MARGIN + 12, y, size); y -= size + 3; });
      y -= 2;
    },
    // A line of label: value pairs in a box, for the two figures that matter.
    box(rows) {
      const h = rows.length * 18 + 12;
      need(h + 8);
      ops.push(`0.8 w ${MARGIN} ${(y - h + 10).toFixed(2)} ${INNER} ${h} re S`);
      let yy = y - 6;
      for (const [label, value] of rows) {
        text(label, MARGIN + 10, yy, 10, 'F1');
        const v = pdfSafe(value);
        text(v, PAGE_W - MARGIN - 10 - textWidth(v, 12, false), yy, 12, 'F2');
        yy -= 18;
      }
      y -= h + 8;
    },
    // A table in Courier: columns [{ label, width (chars), right }], rows of strings.
    table(columns, rows, size = 8) {
      const line = (cells) => columns.map((c, i) => {
        const s = pdfSafe(cells[i] ?? '').slice(0, c.width);
        return c.right ? s.padStart(c.width) : s.padEnd(c.width);
      }).join(' ');
      const headRow = () => { text(line(columns.map((c) => c.label)), MARGIN, y, size, 'F3'); y -= 3; rule(y, 0.3); y -= size + 2; };
      need((size + 3) * 3);
      headRow();
      for (const r of rows) {
        if (y - size < MARGIN + 24) { newPage(); headRow(); }
        text(line(r), MARGIN, y, size, r.bold ? 'F4' : 'F3');
        y -= size + 3;
      }
      y -= 6;
    },
    space(h = 6) { y -= h; },
    newPage,
  };
  return {
    ...api,
    finish(info) {
      const total = pages.length;
      pages.forEach((p, i) => {
        p.push(`0.3 w ${MARGIN} ${MARGIN + 6} m ${PAGE_W - MARGIN} ${MARGIN + 6} l S`);
        p.push(`BT /F1 7 Tf ${MARGIN} ${MARGIN - 4} Td ${pdfString(`${footer} | Page ${i + 1} of ${total}`)} Tj ET`);
      });
      return pdfBytes(pages, info);
    },
  };
}

// The document as a string of bytes (all ASCII), with a correct cross-reference table.
function pdfBytes(pages, info) {
  const objs = [];
  const add = (body) => { objs.push(body); return objs.length; };
  const catalog = add(null);
  const pagesObj = add(null);
  const fonts = [add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>'),
    add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'),
    add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>'),
    add('<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>')];
  const kids = [];
  for (const ops of pages) {
    const stream = ops.join('\n');
    const content = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
    kids.push(add(`<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 ${fonts[0]} 0 R /F2 ${fonts[1]} 0 R /F3 ${fonts[2]} 0 R /F4 ${fonts[3]} 0 R >> >> /Contents ${content} 0 R >>`));
  }
  objs[catalog - 1] = `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`;
  objs[pagesObj - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;
  const infoObj = add(`<< /Title ${pdfString(info.title)} /Producer ${pdfString(info.producer)} >>`);
  let out = '%PDF-1.4\n';
  const offsets = [];
  objs.forEach((body, i) => { offsets.push(out.length); out += `${i + 1} 0 obj\n${body}\nendobj\n`; });
  const xref = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`).join('')}`;
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalog} 0 R /Info ${infoObj} 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return out;
}

// Base64 of a byte string (every char code under 256).
export function base64(bin) {
  const A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bin.length; i += 3) {
    const a = bin.charCodeAt(i);
    const b = i + 1 < bin.length ? bin.charCodeAt(i + 1) : NaN;
    const c = i + 2 < bin.length ? bin.charCodeAt(i + 2) : NaN;
    const n = (a << 16) | ((b || 0) << 8) | (c || 0);
    out += A[(n >> 18) & 63] + A[(n >> 12) & 63] + (Number.isNaN(b) ? '=' : A[(n >> 6) & 63]) + (Number.isNaN(c) ? '=' : A[n & 63]);
  }
  return out;
}

// The worksheet PDF, as a byte string. Everything on it comes from the result, so it is
// reproducible: no clock, no random ids.
export function worksheetPdf(result, { driverLabel, taxHome, inputHash, dataVersion, disclaimers, sources }) {
  const y = result.taxYear;
  const t = result.totals;
  const name = pdfSafe(driverLabel) || 'Driver';
  const doc = pdfLayout(`Per diem worksheet: ${name}, tax year ${y}`, `Input hash ${inputHash.slice(0, 16)} | ${ENGINE_VERSION} | rates ${dataVersion}`);
  doc.newPage();
  doc.heading(`Trucker per diem worksheet, tax year ${y}`, 16);
  doc.para(`Driver: ${name}${taxHome ? `    Tax home: ${pdfSafe(taxHome)}` : ''}`, 10);
  doc.para(`Method: the IRS special meal and incidental expenses (M&IE) rate for the transportation industry (Rev. Proc. 2019-48 sec. 4.04), each day priced at the rate of the notice in force that day. Departure and return days at 3/4 of the rate (sec. 6.04(1)). Limit: ${result.limit.basis}.`, 9);
  doc.box([
    ['Schedule C line 24b, deductible meals', money(Math.round(t.scheduleCLine24b * 100))],
    ['Full per diem, for software that applies the limit itself', money(Math.round(t.softwareEntry * 100))],
    ...(t.scheduleCLine24a ? [['Schedule C line 24a, incidental expenses only (not limited)', money(Math.round(t.scheduleCLine24a * 100))]] : []),
  ]);
  doc.para(result.howToEnter[1], 8.5);
  doc.heading('By rate period', 11);
  doc.table([
    { label: 'From', width: 10 }, { label: 'To', width: 10 }, { label: 'Notice', width: 14 }, { label: 'Rate', width: 5, right: true },
    { label: 'OCONUS', width: 6, right: true }, { label: 'Full', width: 4, right: true }, { label: 'Part', width: 4, right: true },
    { label: 'O/S', width: 4, right: true }, { label: 'Per diem', width: 11, right: true }, { label: 'Deductible', width: 11, right: true },
  ], result.segments.map((s) => [s.from, s.to, s.notices.map((n) => n.notice.replace('Notice ', 'N. ')).join(', '), `$${s.rateConus}`, `$${s.rateOconus}`,
    String(s.fullDays + s.oconusFullDays), String(s.partialDays + s.oconusPartialDays), String(s.oconusFullDays + s.oconusPartialDays),
    money(Math.round(s.perDiem * 100)), money(Math.round(s.deductible * 100))]));
  doc.heading('By month', 11);
  const mrows = result.months.map((m) => [m.name, String(m.fullDays), String(m.partialDays), String(m.oconusDays), String(m.incidentalOnlyDays), String(m.reimbursedDays),
    money(Math.round(m.perDiem * 100)), money(Math.round(m.deductible * 100)), money(Math.round(m.incidentalOnly * 100))]);
  const sum = (k) => result.months.reduce((s, m) => s + m[k], 0);
  mrows.push(Object.assign(['Total', String(sum('fullDays')), String(sum('partialDays')), String(sum('oconusDays')), String(sum('incidentalOnlyDays')), String(sum('reimbursedDays')),
    money(Math.round(t.perDiem * 100)), money(Math.round(t.deductible * 100)), money(Math.round(t.scheduleCLine24a * 100))], { bold: true }));
  doc.table([
    { label: 'Month', width: 10 }, { label: 'Full', width: 4, right: true }, { label: 'Part', width: 4, right: true }, { label: 'O/S', width: 4, right: true },
    { label: 'Inc.', width: 4, right: true }, { label: 'Reimb', width: 5, right: true }, { label: 'Per diem', width: 11, right: true },
    { label: 'Deductible', width: 11, right: true }, { label: 'Line 24a', width: 9, right: true },
  ], mrows);
  doc.para('Full and Part count meal days (Part = departure or return day). O/S = days outside the continental US (OCONUS, including Alaska, Hawaii and Canada). Inc. = incidental-expenses-only days. Reimb = days a carrier or employer reimbursed, left out.', 8);
  doc.heading('Consistency', 11);
  doc.para(result.methodLock, 9);
  doc.heading(`Log checks (${result.warnings.length})`, 11);
  if (!result.warnings.length) doc.para('No problems found in the log.', 9);
  for (const w of result.warnings) doc.bullet(w.message);
  doc.heading('Notes', 11);
  for (const n of result.notes) doc.bullet(n);

  doc.newPage();
  doc.heading('Day-by-day log', 11);
  doc.table([
    { label: 'Date', width: 10 }, { label: 'Day', width: 3 }, { label: 'Status', width: 18 }, { label: 'Where', width: 6 },
    { label: 'Rate', width: 6, right: true }, { label: 'Share', width: 5, right: true }, { label: 'Amount', width: 9, right: true },
    { label: 'Notice', width: 14 }, { label: 'Ref', width: 12 },
  ], result.rows.map((r) => [r.date, WEEKDAYS[weekdayOf(r.date)], STATUS_WORDS[r.status], r.status === 'home' ? '' : r.locality, r.rate ? `$${r.rate}` : '',
    r.share === '0' ? '' : r.share, r.amount ? money(Math.round(r.amount * 100)) : '', r.notice ?? '', r.ref ?? '']));

  doc.heading('Sources', 11);
  for (const s of sources) doc.bullet(`${s.name}: ${s.url}`);
  doc.heading('Please read', 11);
  for (const d of disclaimers) doc.bullet(d);
  doc.para(`Input hash (SHA-256 of the log as entered): ${inputHash}. The same log always gives the same figures and the same hash. Engine ${ENGINE_VERSION}, rates ${dataVersion}.`, 8);
  return doc.finish({ title: `Per diem worksheet ${y}: ${name}`, producer: ENGINE_VERSION });
}
