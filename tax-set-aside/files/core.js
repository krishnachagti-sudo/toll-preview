// Tax set-aside per payment: how much of one incoming payment a self-employed person should move
// to their tax pot, given what they have already earned this year. The answer is the marginal tax
// of this payment: the year's tax on (profit so far + this payment) minus the year's tax on the
// profit so far, worked out with the same rules both times, so every bracket, the Social Security
// wage base, the Additional Medicare line, the QBI threshold, a state bracket or the UK Personal
// Allowance taper crossed inside the payment is split exactly.
//
// Pure and dependency-free: the browser loads this same file. The constants (IRS, state, GOV.UK
// figures, each with its source) are passed in by tool.js from data/; nothing here reads a file.
// Money is worked in dollars or pounds as numbers and rounded to cents only at the edges, so the
// two runs of the year's tax use identical arithmetic and their difference is exact to the cent.

export class SetAsideError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'SetAsideError';
    this.field = field ?? null;
  }
}

export const US_STATUSES = ['single', 'mfj', 'mfs', 'hoh', 'qss'];
export const STATUS_NAMES = { single: 'single', mfj: 'married filing jointly', mfs: 'married filing separately', hoh: 'head of household', qss: 'qualifying surviving spouse' };
export const UK_NATIONS = ['england-wales-ni', 'scotland'];
export const NATION_NAMES = { 'england-wales-ni': 'England, Wales and Northern Ireland', scotland: 'Scotland' };
export const LOAN_PLANS = ['plan1', 'plan2', 'plan4', 'plan5'];

export const r2 = (x) => Math.round((x + (x >= 0 ? 1e-9 : -1e-9)) * 100) / 100;
const pos = (x) => (x > 0 ? x : 0);

// ---------- formatting (pages and the tool page share these) ----------

const grouped = (n, digits) => n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
export const usd = (n, { cents = false } = {}) => `${n < 0 ? '-' : ''}$${grouped(Math.abs(cents ? n : Math.round(n)), cents ? 2 : 0)}`;
export const gbp = (n, { pence = false } = {}) => `${n < 0 ? '-' : ''}£${grouped(Math.abs(pence ? n : Math.round(n)), pence ? 2 : 0)}`;
export const pctText = (x, digits = 1) => `${(Math.round(x * 10 ** (digits + 2)) / 10 ** digits).toFixed(digits)}%`;
export const money = (country) => (country === 'UK' ? gbp : usd);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}
export function ukDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

export const isRealDate = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
};

// A reproducible fingerprint of the inputs (cyrb53), so a receipt can be matched to its run.
export function inputHash(value) {
  const text = JSON.stringify(value, Object.keys(flatKeys(value)).sort());
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}
function flatKeys(v, out = {}) {
  if (Array.isArray(v)) v.forEach((x) => flatKeys(x, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) { out[k] = true; flatKeys(x, out); }
  return out;
}

// ---------- shared arithmetic ----------

// Tax on an amount from [[upTo, rate], ..., [null, rate]] brackets, with the bracket it ends in.
// A row may carry a third number, the tax at its start as the agency prints it (California rounds
// those), which is then used instead of the running sum.
export function bracketTax(brackets, amount) {
  let tax = 0;
  let lower = 0;
  const income = pos(amount);
  for (const [upTo, rate, base] of brackets) {
    if (base !== undefined) tax = base;
    if (upTo === null || income <= upTo) {
      tax += (income - lower) * rate;
      return { tax, rate, from: lower, to: upTo };
    }
    tax += (upTo - lower) * rate;
    lower = upTo;
  }
  return { tax, rate: brackets.at(-1)[1], from: lower, to: null };
}

// ---------- United States ----------

const joint = (status) => status === 'mfj';
const bracketKey = (status) => (status === 'qss' ? 'mfj' : status);
const otherKey = (status) => (status === 'qss' ? 'single' : status); // QSS uses "all other returns" thresholds
export const qbiKey = (status) => (status === 'mfj' ? 'mfj' : status === 'mfs' ? 'mfs' : 'single');

export function mileageRate(F, date) {
  const row = F.mileage.business.find((r) => date >= r.from && date <= r.to);
  if (!row) throw new SetAsideError(`The IRS business mileage rate for ${date} is not in this tool's ${F.taxYear} table.`, 'date');
  return row;
}

// The year's tax for one set of totals. seProfit is the net profit from self-employment for the
// year so far (it may be negative); tips the qualified tips inside it.
export function usYear(F, S, profile, { seProfit, tips = 0 }) {
  const status = profile.filingStatus;
  const w2 = profile.w2Wages ?? 0;
  const se = F.selfEmployment;

  // Self-employment tax (Schedule SE): 92.35% of net profit, nothing under $400 of net earnings.
  let nese = pos(seProfit) * se.netEarningsFactor;
  if (nese < se.minimumNetEarnings) nese = 0;
  const ssRoom = pos(se.socialSecurityWageBase - w2);
  const ssBase = Math.min(nese, ssRoom);
  const socialSecurity = ssBase * se.socialSecurityRate;
  const medicare = nese * se.medicareRate;
  const halfSe = (socialSecurity + medicare) / 2;

  // Additional Medicare Tax (Form 8959): wages over the threshold, and SE earnings over the
  // threshold less wages.
  const am = F.additionalMedicare;
  const amLine = am.threshold[otherKey(status)];
  const amWages = pos(w2 - amLine) * am.rate;
  const amSe = pos(nese - pos(amLine - w2)) * am.rate;
  const additionalMedicare = amWages + amSe;

  // Income tax.
  const agi = w2 + seProfit - halfSe;
  const unmarried = status === 'single' || status === 'hoh';
  const aged = Math.min(profile.age65 ?? 0, joint(status) ? 2 : 1);
  const standard = F.standardDeduction[bracketKey(status)] + aged * (unmarried ? F.additionalStandardDeduction.unmarried : F.additionalStandardDeduction.married);

  // OBBBA deductions, 2025 to 2028, not on a separate return (they need a joint return if married).
  const o = F.obbba;
  const obbbaYear = F.taxYear >= o.firstYear && F.taxYear <= o.lastYear;
  const magi = agi;
  const jk = joint(status) ? 'joint' : 'other';
  let tipsDeduction = 0;
  let overtimeDeduction = 0;
  let seniorDeduction = 0;
  if (obbbaYear && status !== 'mfs') {
    const steps = (start) => Math.floor(pos(magi - start) / 1000);
    if (profile.sstb !== true) {
      tipsDeduction = pos(Math.min(tips, o.tips.cap, pos(seProfit)) - steps(o.tips.phaseOutStart[jk]) * o.tips.reducePer1000);
    }
    overtimeDeduction = pos(Math.min(profile.overtime ?? 0, o.overtime.cap[jk]) - steps(o.overtime.phaseOutStart[jk]) * o.overtime.reducePer1000);
    seniorDeduction = pos(aged * o.senior.perPerson - pos(magi - o.senior.phaseOutStart[jk]) * o.senior.phaseOutRate);
  }
  const beforeQbi = pos(agi - standard - tipsDeduction - overtimeDeduction - seniorDeduction);

  // Qualified business income deduction (section 199A) for a sole proprietor with no employees
  // and no business property: below the threshold 20% of QBI; in the phase-in range it falls to
  // nothing (squared for a specified service business, whose QBI is also scaled down); limited to
  // 20% of taxable income; at least $400 when QBI is $1,000 or more.
  const q = F.qbi;
  const qbi = pos(seProfit - halfSe);
  const thr = q.threshold[qbiKey(status)];
  const end = q.phaseInEnd[qbiKey(status)];
  let qbiDeduction = q.rate * qbi;
  let qbiPhase = 'below';
  if (beforeQbi > thr) {
    const kept = beforeQbi >= end ? 0 : 1 - (beforeQbi - thr) / (end - thr);
    qbiDeduction *= profile.sstb === false ? kept : kept * kept;
    qbiPhase = kept === 0 ? 'above' : 'phase-in';
  }
  qbiDeduction = Math.min(qbiDeduction, q.rate * beforeQbi);
  if (qbi >= q.minimumQbi && F.taxYear >= 2026) qbiDeduction = Math.max(qbiDeduction, q.minimumDeduction);
  const taxable = pos(beforeQbi - qbiDeduction);
  const income = bracketTax(F.brackets[bracketKey(status)], taxable);

  const state = usState(S, profile, { agi, seProfit, w2 });
  return {
    seProfit, netEarnings: nese, socialSecurity, medicare, seTax: socialSecurity + medicare, halfSe,
    additionalMedicare, agi, standardDeduction: standard, tipsDeduction, overtimeDeduction, seniorDeduction,
    qbi, qbiDeduction, qbiPhase, taxable, federalIncomeTax: income.tax, bracketRate: income.rate,
    ssWagesAndEarnings: w2 + nese, state,
    total: socialSecurity + medicare + additionalMedicare + income.tax + state.tax,
  };
}

export function stateInfo(S, slug) {
  if (!slug) return null;
  const s = S.states[slug];
  if (s) return { slug, name: s.name, code: s.code, covered: true, kind: s.kind, sources: s.source ? [s.source] : s.sources };
  const name = S.notCovered.names[slug];
  if (name) return { slug, name, covered: false, kind: null, sources: [] };
  return undefined;
}

function usState(S, profile, { agi, seProfit, w2 }) {
  const slug = profile.state;
  const s = slug ? S.states[slug] : null;
  if (!s || s.kind === 'none') return { tax: 0, rate: 0, taxable: 0 };
  const status = profile.filingStatus;
  if (s.kind === 'pennsylvania') {
    const taxable = pos(seProfit) + w2;
    return { tax: taxable * s.rate, rate: s.rate, taxable };
  }
  if (s.kind === 'flat-agi') {
    const taxable = pos(agi - s.deduction[bracketKey(status)]);
    return { tax: taxable * s.rate, rate: s.rate, taxable };
  }
  if (s.kind === 'illinois') {
    const persons = joint(status) ? 2 : 1;
    const allowed = agi <= s.exemptionAgiLimit[joint(status) ? 'mfj' : 'other'];
    const exemption = allowed ? persons * s.exemption + Math.min(profile.age65 ?? 0, persons) * s.exemptionAged : 0;
    const taxable = pos(agi - exemption);
    return { tax: taxable * s.rate, rate: s.rate, taxable, exemption };
  }
  if (s.kind === 'california') {
    const sched = s.schedules[status === 'mfj' || status === 'qss' ? 'mfj' : status === 'hoh' ? 'hoh' : 'single'];
    const taxable = pos(agi - s.standardDeduction[bracketKey(status) === 'mfj' ? 'mfj' : status]);
    const t = bracketTax(sched, taxable);
    const persons = status === 'mfj' || status === 'qss' ? 2 : 1;
    const credits = persons + Math.min(profile.age65 ?? 0, persons);
    const limit = s.exemptionPhaseOut.agi[bracketKey(status) === 'mfj' ? 'mfj' : status];
    const step = s.exemptionPhaseOut.step[status === 'mfs' ? 'mfs' : 'other'];
    const per = pos(s.exemptionCredit - Math.ceil(pos(agi - limit) / step) * s.exemptionPhaseOut.perStep);
    const exemptionCredits = credits * per;
    const bhst = pos(taxable - s.behavioralHealth.over) * s.behavioralHealth.rate;
    return { tax: pos(t.tax - exemptionCredits) + bhst, rate: t.rate + (taxable > s.behavioralHealth.over ? s.behavioralHealth.rate : 0), taxable, exemptionCredits };
  }
  throw new Error(`Unknown state kind ${s.kind}`);
}

// What this payment adds to the profit: the amount, less expenses and business miles at the IRS
// rate for the payment's date.
function usNet(F, input) {
  const expenses = input.expenses ?? (input.expenseRate ? input.amount * input.expenseRate : 0);
  let mileage = null;
  if (input.miles) {
    if (!input.date) throw new SetAsideError('Give the payment date with miles: the IRS rate changed on July 1, 2026.', 'date');
    const row = mileageRate(F, input.date);
    mileage = { miles: input.miles, centsPerMile: row.centsPerMile, notice: row.notice, deduction: r2((input.miles * row.centsPerMile) / 100) };
  }
  const net = input.amount - expenses - (mileage?.deduction ?? 0);
  return { amount: input.amount, expenses: r2(expenses), mileage, net: r2(net), tips: input.tips ?? 0 };
}

const usParts = (y) => ({
  socialSecurity: y.socialSecurity, medicare: y.medicare, additionalMedicare: y.additionalMedicare,
  federalIncomeTax: y.federalIncomeTax, state: y.state.tax,
});

function usCrossings(F, S, profile, before, after) {
  const out = [];
  const status = profile.filingStatus;
  if (after.bracketRate !== before.bracketRate) out.push(`Federal taxable income moves from the ${pctText(before.bracketRate, 0)} to the ${pctText(after.bracketRate, 0)} bracket inside this payment.`);
  const base = F.selfEmployment.socialSecurityWageBase;
  if (before.ssWagesAndEarnings < base && after.ssWagesAndEarnings > base) out.push(`Wages and self-employment earnings pass the ${usd(base)} Social Security wage base: earnings above it pay only the 2.9% Medicare part.`);
  const am = F.additionalMedicare.threshold[otherKey(status)];
  if (before.ssWagesAndEarnings <= am && after.ssWagesAndEarnings > am) out.push(`Earnings pass the ${usd(am)} Additional Medicare Tax line: 0.9% more on the part above it.`);
  if (before.qbiPhase !== after.qbiPhase) out.push(`Taxable income enters the QBI ${after.qbiPhase === 'phase-in' ? 'phase-in range, so the 20% deduction starts to shrink' : 'range above the phase-in, so no QBI deduction is left'}.`);
  if (after.state.rate !== before.state.rate && profile.state && S.states[profile.state]?.kind === 'california') out.push(`California taxable income moves from the ${pctText(before.state.rate, 1)} to the ${pctText(after.state.rate, 1)} bracket.`);
  return out;
}

export function usTaxYear(F, date) {
  if (!date) return F.taxYear;
  const y = Number(date.slice(0, 4));
  if (y !== F.taxYear) throw new SetAsideError(`A payment received on ${date} belongs to tax year ${y} (cash basis: taxed in the year received). This tool has the ${F.taxYear} US tables only.`, 'date');
  return y;
}

export function nextDueUS(F, date) {
  const row = F.estimatedTax.due.find((r) => date <= r.due);
  return row ? { period: row.period, due: row.due, paidThrough: row.paidThrough } : null;
}

function checkUsProfile(S, input) {
  if (!US_STATUSES.includes(input.filingStatus)) throw new SetAsideError(`Filing status must be one of ${US_STATUSES.join(', ')}.`, 'filingStatus');
  if (input.state !== undefined && stateInfo(S, input.state) === undefined) throw new SetAsideError(`State must be a lowercase state name with hyphens, like "texas" or "new-york".`, 'state');
}

export function usPayment(F, S, input, { now } = {}) {
  checkUsProfile(S, input);
  const taxYear = usTaxYear(F, input.date);
  const pay = usNet(F, input);
  const ytd = input.ytdNetProfit ?? 0;
  const ytdTips = input.ytdTips ?? 0;
  const before = usYear(F, S, input, { seProfit: ytd, tips: ytdTips });
  const after = usYear(F, S, input, { seProfit: ytd + pay.net, tips: ytdTips + pay.tips });
  const b = usParts(before);
  const a = usParts(after);
  const breakdown = Object.fromEntries(Object.keys(a).map((k) => [k, r2(a[k] - b[k])]));
  breakdown.seTax = r2(breakdown.socialSecurity + breakdown.medicare);
  const change = r2(breakdown.socialSecurity + breakdown.medicare + breakdown.additionalMedicare + breakdown.federalIncomeTax + breakdown.state);
  const setAside = Math.max(0, change);
  const pct = input.amount > 0 ? setAside / input.amount : 0;
  const state = stateInfo(S, input.state);

  if (input.detail === 'percentage') {
    return { country: 'US', taxYear, detail: 'percentage', percent: Math.round(pct * 1000) / 10, note: 'The share of this payment to set aside. Sign in for the dollar amount, the breakdown and the working.' };
  }

  const flags = [];
  if (pay.net < 0) flags.push(`Expenses and mileage exceed this payment, so it lowers your tax by ${usd(-change, { cents: true })}; there is nothing to set aside from it.`);
  if (state && !state.covered) flags.push(`${state.name} income tax is not included: this tool covers ${Object.values(S.states).map((s) => s.name).join(', ')}. The amount is federal only.`);
  if (!input.state) flags.push('No state given: the amount is federal only.');
  if (after.qbiPhase !== 'below') flags.push(`Taxable income is above the ${usd(F.qbi.threshold[qbiKey(input.filingStatus)])} QBI threshold: the deduction is worked out for a business with no employees and no business property, ${input.sstb === false ? 'not a specified service business (as you said)' : 'treated as a specified service business unless you say it is not (the smaller deduction)'}.`);
  if (input.filingStatus === 'mfs' && ((input.tips ?? 0) + ytdTips > 0 || (input.overtime ?? 0) > 0 || (input.age65 ?? 0) > 0)) flags.push('The tips, overtime and senior deductions need a joint return if you are married, so none is taken on a separate return.');
  if (input.sstb === true && ytdTips + pay.tips > 0) flags.push('Tips earned in a specified service business do not qualify for the tips deduction, so none is taken.');
  if (state?.slug === 'pennsylvania') flags.push('Pennsylvania local earned income tax (set by your municipality and school district) is not included.');

  const sources = [...Object.values(F.sources), ...(state?.sources ?? [])];
  const dueDate = input.date ?? (now ? now.toISOString().slice(0, 10) : null);
  const stateDue = state?.covered && S.states[state.slug].estimated
    ? S.states[state.slug].estimated.find((r) => dueDate && dueDate <= r.due) ?? null : null;

  return {
    country: 'US',
    taxYear,
    date: input.date ?? null,
    filingStatus: input.filingStatus,
    state: state ? { slug: state.slug, name: state.name, covered: state.covered } : null,
    payment: pay,
    setAside,
    percent: Math.round(pct * 1000) / 10,
    marginalRate: pay.net > 0 ? Math.round((change / pay.net) * 1000) / 10 : null,
    breakdown,
    ytdNetProfitBefore: r2(ytd),
    ytdNetProfitAfter: r2(ytd + pay.net),
    year: yearUS(before, after, input),
    crossings: usCrossings(F, S, input, before, after),
    nextDue: dueDate ? nextDueUS(F, dueDate) : null,
    nextStateDue: stateDue ? { state: state.name, due: stateDue.due, share: stateDue.share } : null,
    flags,
    working: usWorking(F, S, input, pay, before, after, breakdown),
    sources,
    inputHash: inputHash(input),
  };
}

const roundYear = (y) => ({
  netProfit: r2(y.seProfit), agi: r2(y.agi), standardDeduction: r2(y.standardDeduction),
  otherDeductions: r2(y.tipsDeduction + y.overtimeDeduction + y.seniorDeduction), qbiDeduction: r2(y.qbiDeduction),
  taxableIncome: r2(y.taxable), bracketRate: y.bracketRate,
  seTax: r2(y.seTax), additionalMedicare: r2(y.additionalMedicare), federalIncomeTax: r2(y.federalIncomeTax),
  stateTax: r2(y.state.tax), total: r2(y.total),
});

function yearUS(before, after, input) {
  const withheld = input.w2Withholding ?? 0;
  const paid = input.estimatedPaid ?? 0;
  return {
    before: roundYear(before),
    after: roundYear(after),
    w2Withholding: r2(withheld),
    estimatedPaid: r2(paid),
    stillToCover: r2(pos(after.total - withheld - paid)),
  };
}

function usWorking(F, S, input, pay, before, after, d) {
  const lines = [];
  const add = (label, value, source) => lines.push({ label, value, source: source ?? null });
  add('Payment', usd(pay.amount, { cents: true }));
  if (pay.expenses) add('Less expenses', usd(pay.expenses, { cents: true }));
  if (pay.mileage) add(`Less ${pay.mileage.miles} business miles at ${pay.mileage.centsPerMile} cents (${pay.mileage.notice})`, usd(pay.mileage.deduction, { cents: true }), F.sources.mileage.url);
  add('Net profit added', usd(pay.net, { cents: true }));
  add('Net profit this year: before, after', `${usd(before.seProfit, { cents: true })}, ${usd(after.seProfit, { cents: true })}`);
  add('Net earnings for SE tax (92.35%)', `${usd(before.netEarnings, { cents: true })}, ${usd(after.netEarnings, { cents: true })}`, F.sources.tc554.url);
  add(`Social Security 12.4% (wage base ${usd(F.selfEmployment.socialSecurityWageBase)} less W-2 wages)`, usd(d.socialSecurity, { cents: true }), F.sources.setax.url);
  add('Medicare 2.9%', usd(d.medicare, { cents: true }), F.sources.setax.url);
  if (d.additionalMedicare) add('Additional Medicare Tax 0.9%', usd(d.additionalMedicare, { cents: true }), F.sources.addlmed.url);
  add('AGI (half of SE tax deducted): before, after', `${usd(before.agi, { cents: true })}, ${usd(after.agi, { cents: true })}`);
  add(`Standard deduction (${STATUS_NAMES[input.filingStatus]})`, usd(after.standardDeduction), F.sources.rp2532.url);
  if (after.tipsDeduction || before.tipsDeduction) add('Qualified tips deduction: before, after', `${usd(before.tipsDeduction, { cents: true })}, ${usd(after.tipsDeduction, { cents: true })}`, F.sources.usc224.url);
  if (after.overtimeDeduction) add('Qualified overtime deduction', usd(after.overtimeDeduction, { cents: true }), F.sources.usc225.url);
  if (after.seniorDeduction || before.seniorDeduction) add('Senior deduction: before, after', `${usd(before.seniorDeduction, { cents: true })}, ${usd(after.seniorDeduction, { cents: true })}`, F.sources.usc151.url);
  add('QBI deduction: before, after', `${usd(before.qbiDeduction, { cents: true })}, ${usd(after.qbiDeduction, { cents: true })}`, F.sources.rp2532.url);
  add('Taxable income: before, after', `${usd(before.taxable, { cents: true })}, ${usd(after.taxable, { cents: true })}`);
  add(`Federal income tax (${pctText(before.bracketRate, 0)} to ${pctText(after.bracketRate, 0)} bracket)`, usd(d.federalIncomeTax, { cents: true }), F.sources.rp2532.url);
  const st = input.state ? S.states[input.state] : null;
  if (st) add(st.kind === 'none' ? `${st.name}: no state income tax` : `${st.name} income tax`, usd(d.state, { cents: true }), (st.source ?? st.sources[0]).url);
  add('Set aside from this payment', usd(Math.max(0, d.socialSecurity + d.medicare + d.additionalMedicare + d.federalIncomeTax + d.state), { cents: true }));
  return lines;
}

// ---------- United Kingdom ----------

export function ukTaxYear(U, date) {
  if (!date) return U.taxYear;
  if (date < U.starts || date > U.ends) throw new SetAsideError(`A payment on ${date} is outside the ${U.taxYear} tax year (${ukDate(U.starts)} to ${ukDate(U.ends)}). This tool has the ${U.taxYear} UK rates only.`, 'date');
  return U.taxYear;
}

export function personalAllowance(U, income) {
  const p = U.personalAllowance;
  return pos(p.amount - Math.floor(pos(income - p.taperFrom) / 2) * p.taperPerTwo);
}

export function incomeTaxUK(U, nation, income) {
  const allowance = personalAllowance(U, income);
  const t = bracketTax(U.bands[nation].bands, income - allowance);
  return { tax: t.tax, rate: t.rate, allowance };
}

export function class4(U, profit) {
  const c = U.class4;
  return pos(Math.min(profit, c.upper) - c.lower) * c.mainRate + pos(profit - c.upper) * c.upperRate;
}

function loan(U, plan, income) {
  if (!plan) return 0;
  const p = U.studentLoan.plans[plan];
  return pos(income - p.threshold) * p.rate;
}

// The Self Assessment side of the year for a profit: Income Tax beyond what PAYE takes from the
// salary, Class 4, and student loan beyond what payroll takes, plus what is due by the first
// 31 January when payments on account start (half the year's tax again).
export function ukYear(U, profile, profit) {
  const nation = profile.nation;
  const salary = profile.salary ?? 0;
  const p = pos(profit);
  const all = incomeTaxUK(U, nation, salary + p);
  const atSource = incomeTaxUK(U, nation, salary).tax;
  const incomeTax = all.tax - atSource;
  const c4 = class4(U, p);
  const plans = [profile.studentLoan, profile.postgraduateLoan ? 'postgraduate' : null].filter(Boolean);
  const studentLoan = plans.reduce((sum, plan) => sum + loan(U, plan, salary + p) - loan(U, plan, salary), 0);
  const bill = incomeTax + c4 + studentLoan;
  const poaBase = incomeTax + c4;
  const o = U.paymentsOnAccount;
  const poaRequired = poaBase >= o.minimumBill && !(atSource > o.collectedAtSourceShare * (atSource + poaBase));
  return {
    profit: p, incomeTax, rate: all.rate, allowance: all.allowance, class4: c4, studentLoan, bill,
    poaRequired, firstPoa: poaRequired ? poaBase * o.share : 0, january: bill + (poaRequired ? poaBase * o.share : 0),
    class2TreatedAsPaid: p >= U.class2.smallProfits,
  };
}

export function nextDueUK(U, date) {
  const d = U.dates;
  for (const [due, what] of [[d.firstPoa, 'First payment on account for 2026 to 2027 (half of your 2025 to 2026 bill), or the balance of 2025 to 2026'], [d.secondPoa, 'Second payment on account for 2026 to 2027'], [d.balancing, 'Balancing payment for 2026 to 2027, with the first payment on account for 2027 to 2028']]) {
    if (date <= due) return { due, what };
  }
  return null;
}

export function ukPayment(U, input, { now } = {}) {
  if (!UK_NATIONS.includes(input.nation)) throw new SetAsideError(`Nation must be one of ${UK_NATIONS.join(', ')}.`, 'nation');
  const taxYear = ukTaxYear(U, input.date);
  const expenses = input.expenses ?? (input.expenseRate ? input.amount * input.expenseRate : 0);
  const net = r2(input.amount - expenses);
  const ytd = input.ytdNetProfit ?? 0;
  const before = ukYear(U, input, ytd);
  const after = ukYear(U, input, ytd + net);
  const breakdown = {
    incomeTax: r2(after.incomeTax - before.incomeTax),
    class4: r2(after.class4 - before.class4),
    studentLoan: r2(after.studentLoan - before.studentLoan),
  };
  const change = r2(breakdown.incomeTax + breakdown.class4 + breakdown.studentLoan);
  const setAside = Math.max(0, change);
  const firstYear = Math.max(0, r2(after.january - before.january));
  const pct = input.amount > 0 ? setAside / input.amount : 0;
  if (input.detail === 'percentage') {
    return { country: 'UK', taxYear, detail: 'percentage', percent: Math.round(pct * 1000) / 10, note: 'The share of this payment to set aside. Sign in for the pound amount, the breakdown and the working.' };
  }
  const flags = [];
  if (net < 0) flags.push(`Expenses exceed this payment, so it lowers your bill by ${gbp(-change, { pence: true })}; there is nothing to set aside from it.`);
  if (!after.class2TreatedAsPaid) flags.push(`Profits under ${gbp(U.class2.smallProfits)}: Class 2 is not treated as paid. You may pay it voluntarily (${gbp(U.class2.weekly, { pence: true })} a week) to protect your State Pension record; it is not in this amount.`);
  if (after.allowance < U.personalAllowance.amount) flags.push(`Income is over ${gbp(U.personalAllowance.taperFrom)}, so the Personal Allowance is ${gbp(after.allowance)} (it falls £1 for every £2 over).`);
  const crossings = [];
  if (after.rate !== before.rate) crossings.push(`Income Tax moves from the ${pctText(before.rate, 0)} to the ${pctText(after.rate, 0)} band inside this payment.`);
  if (before.profit <= U.class4.upper && after.profit > U.class4.upper) crossings.push(`Profit passes ${gbp(U.class4.upper)}: Class 4 drops from 6% to 2% above it.`);
  if (before.allowance !== after.allowance) crossings.push(`The Personal Allowance falls from ${gbp(before.allowance)} to ${gbp(after.allowance)} inside this payment.`);
  if (!before.poaRequired && after.poaRequired) crossings.push('The year\'s Self Assessment bill reaches £1,000, so payments on account start.');
  const date = input.date ?? (now ? now.toISOString().slice(0, 10) : null);
  const S = U.sources;
  const working = [
    { label: 'Payment', value: gbp(input.amount, { pence: true }), source: null },
    ...(expenses ? [{ label: 'Less expenses', value: gbp(r2(expenses), { pence: true }), source: null }] : []),
    { label: 'Profit this tax year: before, after', value: `${gbp(before.profit, { pence: true })}, ${gbp(after.profit, { pence: true })}`, source: null },
    { label: `Personal Allowance${after.allowance < U.personalAllowance.amount ? ' (tapered)' : ''}`, value: gbp(after.allowance), source: S.it.url },
    { label: `Income Tax, ${NATION_NAMES[input.nation]} bands (${pctText(before.rate, 0)} to ${pctText(after.rate, 0)})`, value: gbp(breakdown.incomeTax, { pence: true }), source: input.nation === 'scotland' ? S.scot.url : S.it.url },
    { label: 'Class 4 National Insurance (6% to £50,270, 2% above)', value: gbp(breakdown.class4, { pence: true }), source: S.ni.url },
    ...(breakdown.studentLoan ? [{ label: 'Student loan through Self Assessment', value: gbp(breakdown.studentLoan, { pence: true }), source: S.sl.url }] : []),
    { label: 'Set aside from this payment', value: gbp(setAside, { pence: true }), source: null },
    { label: 'With the first payment on account (first year)', value: gbp(firstYear, { pence: true }), source: S.poa.url },
  ];
  return {
    country: 'UK',
    taxYear,
    date: input.date ?? null,
    nation: input.nation,
    payment: { amount: input.amount, expenses: r2(expenses), net },
    setAside,
    percent: Math.round(pct * 1000) / 10,
    marginalRate: net > 0 ? Math.round((change / net) * 1000) / 10 : null,
    breakdown,
    firstYearSetAside: firstYear,
    firstYearPercent: input.amount > 0 ? Math.round((firstYear / input.amount) * 1000) / 10 : 0,
    ytdNetProfitBefore: r2(ytd),
    ytdNetProfitAfter: r2(ytd + net),
    year: {
      before: { profit: r2(before.profit), incomeTax: r2(before.incomeTax), class4: r2(before.class4), studentLoan: r2(before.studentLoan), bill: r2(before.bill), poaRequired: before.poaRequired },
      after: { profit: r2(after.profit), incomeTax: r2(after.incomeTax), class4: r2(after.class4), studentLoan: r2(after.studentLoan), bill: r2(after.bill), poaRequired: after.poaRequired, firstJanuary: r2(after.january) },
    },
    crossings,
    nextDue: date ? nextDueUK(U, date) : null,
    flags,
    working,
    sources: Object.values(S),
    inputHash: inputHash(input),
  };
}

// ---------- one call for both countries ----------

export function payment(C, input, opts) {
  if (input.country === 'UK') return ukPayment(C.uk, input, opts);
  return usPayment(C.federal, C.states, input, opts);
}

// A year of payments replayed in date order: each payment's set-aside on the profit before it,
// what should be in the pot by now, and the catch-up.
export function ledger(C, input) {
  const uk = input.country === 'UK';
  const rows = input.payments.map((p, i) => ({ ...p, i })).sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.i - b.i));
  let ytd = input.openingYtd ?? 0;
  let ytdTips = input.openingTips ?? 0;
  const out = [];
  const profile = { ...input };
  delete profile.payments;
  for (const p of rows) {
    let res;
    try {
      res = payment(C, { ...profile, op: 'payment', ...p, i: undefined, ytdNetProfit: ytd, ytdTips, detail: 'full' });
    } catch (e) {
      if (e instanceof SetAsideError) throw new SetAsideError(`Payment ${p.i + 1}: ${e.message}`, 'payments');
      throw e;
    }
    out.push({ index: p.i, date: p.date, amount: p.amount, net: res.payment.net, setAside: res.setAside, percent: res.percent, ytdNetProfitAfter: res.ytdNetProfitAfter });
    ytd = res.ytdNetProfitAfter;
    ytdTips += p.tips ?? 0;
  }
  const opening = uk ? ukYear(C.uk, input, input.openingYtd ?? 0).bill : usYear(C.federal, C.states, input, { seProfit: input.openingYtd ?? 0, tips: input.openingTips ?? 0 }).total;
  const closing = uk ? ukYear(C.uk, input, ytd).bill : usYear(C.federal, C.states, input, { seProfit: ytd, tips: ytdTips }).total;
  const shouldHaveSaved = Math.max(0, r2(closing - opening));
  const saved = input.savedToDate ?? 0;
  return {
    country: uk ? 'UK' : 'US',
    taxYear: uk ? C.uk.taxYear : C.federal.taxYear,
    payments: out.length,
    rows: out,
    ytdNetProfit: r2(ytd),
    shouldHaveSaved,
    savedToDate: r2(saved),
    catchUp: r2(pos(shouldHaveSaved - saved)),
    ahead: r2(pos(saved - shouldHaveSaved)),
    yearTax: r2(closing),
    inputHash: inputHash(input),
  };
}

// The next estimated payment date, and the safe-harbor amount when last year's tax is given (US),
// or the next Self Assessment date and payments on account when last year's bill is given (UK).
export function nextDue(C, input) {
  if (input.country === 'UK') {
    const U = C.uk;
    const n = nextDueUK(U, input.date);
    const out = { country: 'UK', date: input.date, next: n };
    if (input.lastYearBill !== undefined) {
      const o = U.paymentsOnAccount;
      const share = input.collectedAtSourceShare ?? 0;
      const required = input.lastYearBill >= o.minimumBill && share <= o.collectedAtSourceShare;
      out.paymentsOnAccount = { required, each: required ? r2(input.lastYearBill * o.share) : 0, dates: [U.dates.firstPoa, U.dates.secondPoa], why: required ? 'Each payment on account is half of last year\'s Self Assessment bill.' : input.lastYearBill < o.minimumBill ? 'Last year\'s bill was under £1,000, so no payments on account are due.' : 'More than 80% of last year\'s tax was collected at source, so no payments on account are due.' };
    }
    return out;
  }
  const F = C.federal;
  const n = nextDueUS(F, input.date);
  const out = { country: 'US', date: input.date, next: n, all: F.estimatedTax.due };
  if (input.priorYearTax !== undefined) {
    const sh = F.estimatedTax.safeHarbor;
    const high = (input.priorYearAgi ?? 0) > sh.highIncomeAgi[input.filingStatus === 'mfs' ? 'mfs' : 'other'];
    const annual = r2(input.priorYearTax * (high ? sh.priorYearHighIncome : sh.priorYear));
    const withheld = input.w2Withholding ?? 0;
    const perPeriod = r2(pos(annual - withheld) / 4);
    out.safeHarbor = { rule: high ? '110% of last year\'s tax (last year\'s AGI over the limit)' : '100% of last year\'s tax', annual, w2Withholding: r2(withheld), perPeriod, paidSoFar: r2(input.estimatedPaid ?? 0) };
    if (n) out.safeHarbor.dueByNext = r2(pos(perPeriod * n.period - (input.estimatedPaid ?? 0)));
  }
  return out;
}
