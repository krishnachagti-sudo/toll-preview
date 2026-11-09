// A real estate agent's commission: what one deal nets after the referral fee, the franchise or
// royalty fee, the team's cut, the brokerage split up to the cap and the per-deal fees, and a year
// of deals worked out in date order across anniversary caps, with the 1099 total per calendar year.
// Pure and dependency-free: the page loads this same file. Every split, cap and fee is the plan the
// person enters; nothing here is a typical rate. Published plans (data/plans.json, each read on the
// brokerage's own site with its date) are only presets to start from.
//
// Money is whole cents. Percentages are thousandths of a percent (70% = 70000, 2.875% = 2875), so
// any rate with up to three decimals is exact. Every product is worked in BigInt and rounded once,
// half up, to the cent.

export const ENGINE_VERSION = 'commission-split-1';

export class CommissionError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'CommissionError';
    this.field = field;
  }
}

export const LIMITS = { maxCents: 10_000_000_000, maxDeals: 500, maxFees: 10, maxPlans: 4, maxCompareDeals: 200 };
export const HUNDRED = 100_000; // 100% in thousandths of a percent
export const TEAM_ORDERS = ['team-first', 'brokerage-first'];
export const ROYALTY_FROM = ['top', 'agent'];
export const FEE_WHEN = ['always', 'pre-cap', 'post-cap'];

// ---------- reading numbers ----------

const clean = (v) => String(v).trim().replace(/^\$\s*/, '').replace(/,/g, '');

// "20,000", "$1,250.50", 800 -> cents, rounded half up past the cent.
export function toCents(v, field, { min = 0, max = LIMITS.maxCents, label = field } = {}) {
  if (v === undefined || v === null || String(v).trim() === '') throw new CommissionError(`${label} is missing.`, field);
  const s = clean(v);
  if (!/^\d{1,11}(?:\.\d+)?$/.test(s)) throw new CommissionError(`${label} must be an amount like 800 or 1,250.50.`, field);
  const [whole, frac = ''] = s.split('.');
  let cents = Number(whole) * 100 + Number((frac + '00').slice(0, 2));
  if (frac.length > 2 && Number(frac[2]) >= 5) cents += 1;
  if (cents < min) throw new CommissionError(`${label} must be at least ${usd(min)}.`, field);
  if (cents > max) throw new CommissionError(`${label} must be at most ${usd(max)}.`, field);
  return cents;
}

// "70", "2.5%", 2.875 -> thousandths of a percent. Three decimals at most.
export function toPct(v, field, { min = 0, max = HUNDRED, label = field } = {}) {
  if (v === undefined || v === null || String(v).trim() === '') throw new CommissionError(`${label} is missing.`, field);
  const s = String(v).trim().replace(/\s*%$/, '');
  if (!/^\d{1,3}(?:\.\d{1,3})?$/.test(s)) throw new CommissionError(`${label} must be a percentage like 70 or 2.5, with at most three decimals.`, field);
  const [w, f = ''] = s.split('.');
  const p = Number(w) * 1000 + Number((f + '000').slice(0, 3));
  if (p < min || p > max) throw new CommissionError(`${label} must be from ${pctText(min)} to ${pctText(max)}.`, field);
  return p;
}

const has = (v) => v !== undefined && v !== null && String(v).trim() !== '';

// ---------- showing numbers ----------

const group = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export function usd(cents) {
  const neg = cents < 0;
  const a = Math.abs(cents);
  return `${neg ? '-' : ''}$${group(String(Math.floor(a / 100)))}.${String(a % 100).padStart(2, '0')}`;
}
// Whole dollars without cents when there are none: $20,000 but $3,412.50.
export const usdShort = (cents) => (cents % 100 === 0 ? usd(cents).slice(0, -3) : usd(cents));
export const plainUsd = (cents) => `${cents < 0 ? '-' : ''}${Math.floor(Math.abs(cents) / 100)}.${String(Math.abs(cents) % 100).padStart(2, '0')}`;
export function pctText(p) {
  const w = Math.floor(p / 1000);
  const f = String(p % 1000).padStart(3, '0').replace(/0+$/, '');
  return `${w}${f ? `.${f}` : ''}%`;
}
export const ratioText = (agentPct) => `${pctText(agentPct).slice(0, -1)}/${pctText(HUNDRED - agentPct).slice(0, -1)}`;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// ---------- arithmetic ----------

const half = (n, d) => (n + d / 2n) / d; // BigInt, n >= 0, d > 0: half up
// A percentage of an amount in cents, rounded half up to the cent.
export const pctOf = (cents, p) => Number(half(BigInt(cents) * BigInt(p), BigInt(HUNDRED)));

// The brokerage's share of a base A when R is left before the cap: the share at the pre-cap rate
// until it reaches R, and the rest of the base at the post-cap rate. On the crossing deal the part
// of the base that fills the cap is A1 = R / pre; the rest, A - A1, pays the post-cap rate. Exact:
// post share = (A x pre - R x 100%) x post / (pre x 100%), rounded once.
export function brokerShare(base, prePct, postPct, remaining) {
  const full = pctOf(base, prePct);
  if (remaining === null || full <= remaining) return { company: full, crossed: false, preBase: base };
  const H = BigInt(HUNDRED);
  const over = BigInt(base) * BigInt(prePct) - BigInt(remaining) * H; // > 0 here
  const post = Number(half(over * BigInt(postPct), BigInt(prePct) * H));
  const preBase = Number(half(BigInt(remaining) * H, BigInt(prePct)));
  return { company: remaining + post, crossed: true, preBase, postBase: base - preBase, postCompany: post };
}

// ---------- dates ----------

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const isLeap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
const daysIn = (y, m) => [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
export function readDate(v, field, label = field) {
  const m = DATE_RE.exec(String(v ?? '').trim());
  if (!m) throw new CommissionError(`${label} must be a date like 2026-03-15.`, field);
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (y < 2000 || y > 2100 || mo < 1 || mo > 12 || d < 1 || d > daysIn(y, mo)) throw new CommissionError(`${label} is not a real date between 2000 and 2100.`, field);
  return `${m[1]}-${m[2]}-${m[3]}`;
}
// "03-15" or "2024-03-15" -> [3, 15]. February 29 is allowed (it falls on February 28 in common years).
export function readAnniversary(v, field = 'plan.capStart') {
  const s = String(v ?? '').trim();
  const m = /^(?:\d{4}-)?(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new CommissionError('The cap start (anniversary) must be a month and day like 03-15, or a date like 2024-03-15.', field);
  const [mo, d] = [Number(m[1]), Number(m[2])];
  if (mo < 1 || mo > 12 || d < 1 || d > daysIn(2024, mo)) throw new CommissionError('The cap start is not a real month and day.', field);
  return [mo, d];
}
const pad = (n) => String(n).padStart(2, '0');
const anniversaryIn = (y, [mo, d]) => `${y}-${pad(mo)}-${pad(Math.min(d, daysIn(y, mo)))}`;
function dayBefore(iso) {
  const t = Date.UTC(...iso.split('-').map((x, i) => Number(x) - (i === 1 ? 1 : 0))) - 86_400_000;
  return new Date(t).toISOString().slice(0, 10);
}
// The cap period a date falls in: from the last anniversary on or before it to the day before the next.
export function periodOf(date, ann) {
  const y = Number(date.slice(0, 4));
  const startY = anniversaryIn(y, ann) <= date ? y : y - 1;
  const start = anniversaryIn(startY, ann);
  return { start, end: dayBefore(anniversaryIn(startY + 1, ann)) };
}

// ---------- the plan ----------

// -> a plan with every amount in cents and every rate in thousandths of a percent.
export function readPlan(p = {}, field = 'plan') {
  if (!p || typeof p !== 'object') throw new CommissionError('The plan is missing.', field);
  const f = (k) => `${field}.${k}`;
  const split = toPct(p.split, f('split'), { label: 'Your split (your share before the cap)' });
  const plan = {
    label: has(p.label) ? String(p.label).slice(0, 60) : null,
    split,
    cap: has(p.cap) ? toCents(p.cap, f('cap'), { label: 'The cap' }) : null,
    ann: readAnniversary(has(p.capStart) ? p.capStart : '01-01', f('capStart')),
    capStartGiven: has(p.capStart),
    postCapSplit: has(p.postCapSplit) ? toPct(p.postCapSplit, f('postCapSplit'), { label: 'Your split after the cap' }) : HUNDRED,
    royalty: has(p.royaltyPercent) ? toPct(p.royaltyPercent, f('royaltyPercent'), { label: 'The royalty or franchise fee', max: 50_000 }) : 0,
    royaltyCap: has(p.royaltyCap) ? toCents(p.royaltyCap, f('royaltyCap'), { label: 'The royalty cap' }) : null,
    royaltyFrom: p.royaltyFrom ?? 'top',
    royaltyCountsToCap: p.royaltyCountsToCap === true,
    fees: [],
    team: null,
    monthlyFee: has(p.monthlyFee) ? toCents(p.monthlyFee, f('monthlyFee'), { label: 'The monthly fee', max: 10_000_00 }) : 0,
  };
  if (!ROYALTY_FROM.includes(plan.royaltyFrom)) throw new CommissionError('royaltyFrom is top (off the commission before the split) or agent (out of your share).', f('royaltyFrom'));
  if (plan.postCapSplit < split) throw new CommissionError('Your split after the cap cannot be lower than before it.', f('postCapSplit'));
  const fees = p.fees ?? [];
  if (!Array.isArray(fees) || fees.length > LIMITS.maxFees) throw new CommissionError(`Fees are a list of at most ${LIMITS.maxFees}.`, f('fees'));
  fees.forEach((x, i) => {
    const when = x?.when ?? 'always';
    if (!FEE_WHEN.includes(when)) throw new CommissionError('A fee applies always, pre-cap or post-cap.', f(`fees.${i}.when`));
    plan.fees.push({
      name: has(x?.name) ? String(x.name).slice(0, 40) : `Fee ${i + 1}`,
      amount: toCents(x?.amount, f(`fees.${i}.amount`), { label: `${has(x?.name) ? x.name : `Fee ${i + 1}`} amount`, max: 1_000_000 }),
      when,
      countsToCap: x?.countsToCap === true,
    });
  });
  if (p.team && has(p.team.percent)) {
    const order = p.team.order ?? 'team-first';
    if (!TEAM_ORDERS.includes(order)) throw new CommissionError('The team order is team-first (the team takes its share of the commission before the brokerage split) or brokerage-first (of what is left after it).', f('team.order'));
    plan.team = {
      percent: toPct(p.team.percent, f('team.percent'), { label: 'The team\'s share' }),
      order,
      cap: has(p.team.cap) ? toCents(p.team.cap, f('team.cap'), { label: 'The team cap' }) : null,
    };
  }
  return plan;
}

// A deal: the side's gross commission from price x rate, or a commission typed in.
export function readDeal(d = {}, field = 'deal', { needDate = false } = {}) {
  if (!d || typeof d !== 'object') throw new CommissionError('The deal is missing.', field);
  const f = (k) => `${field}.${k}`;
  let gross;
  let price = null;
  let rate = null;
  if (has(d.commission)) gross = toCents(d.commission, f('commission'), { label: 'The commission', min: 1 });
  else {
    price = toCents(d.price, f('price'), { label: 'The sale price', min: 1 });
    rate = toPct(d.rate, f('rate'), { label: 'Your side\'s commission rate', min: 1, max: 50_000 });
    gross = pctOf(price, rate);
  }
  const deal = {
    label: has(d.label) ? String(d.label).slice(0, 60) : null,
    date: has(d.date) || needDate ? readDate(d.date, f('date'), 'The closing date') : null,
    price, rate, gross,
    referral: has(d.referralPercent) ? toPct(d.referralPercent, f('referralPercent'), { label: 'The referral fee' }) : 0,
    referralFlat: has(d.referralFlat) ? toCents(d.referralFlat, f('referralFlat'), { label: 'The referral fee' }) : 0,
    pending: d.pending === true,
  };
  if (deal.referral && deal.referralFlat) throw new CommissionError('Give the referral fee as a percentage or as an amount, not both.', f('referralFlat'));
  if (deal.referralFlat > gross) throw new CommissionError('The referral fee is more than the commission.', f('referralFlat'));
  return deal;
}

// ---------- one deal, in order ----------

// state: what was paid in this cap period before this deal: { capPaid, royaltyPaid, teamPaid }.
// -> the deal's lines and the state after it.
export function workDeal(plan, deal, state) {
  const steps = [];
  const line = (key, label, amount, basis) => steps.push({ key, label, amount, basis });
  const capLeftBefore = plan.cap === null ? null : Math.max(0, plan.cap - state.capPaid);
  const cappedAtStart = capLeftBefore === 0;
  line('gross', 'Your side of the commission', deal.gross, deal.price !== null ? `${usd(deal.price)} x ${pctText(deal.rate)}` : 'as entered');

  const referral = deal.referralFlat || pctOf(deal.gross, deal.referral);
  if (referral) line('referral', 'Referral fee paid out', -referral, deal.referralFlat ? 'flat' : `${pctText(deal.referral)} of your side`);
  const afterReferral = deal.gross - referral;

  // Royalty or franchise fee, on the commission after the referral, up to its own cap.
  let royalty = 0;
  if (plan.royalty) {
    const full = pctOf(afterReferral, plan.royalty);
    royalty = plan.royaltyCap === null ? full : Math.min(full, Math.max(0, plan.royaltyCap - state.royaltyPaid));
  }
  let base = afterReferral;
  if (royalty && plan.royaltyFrom === 'top') {
    line('royalty', 'Royalty or franchise fee (off the top)', -royalty, `${pctText(plan.royalty)}${royalty < pctOf(afterReferral, plan.royalty) ? ', up to its cap' : ''}`);
    base -= royalty;
  }

  const teamCut = (amount) => {
    const full = pctOf(amount, plan.team.percent);
    return plan.team.cap === null ? full : Math.min(full, Math.max(0, plan.team.cap - state.teamPaid));
  };
  let team = 0;
  if (plan.team && plan.team.order === 'team-first') {
    team = teamCut(base);
    if (team) line('team', 'Team\'s share (before the brokerage split)', -team, `${pctText(plan.team.percent)}${team < pctOf(base, plan.team.percent) ? ', up to the team cap' : ''}`);
    base -= team;
  }

  // The brokerage split, up to the cap; the crossing deal pays part at each rate.
  const pre = HUNDRED - plan.split;
  const post = HUNDRED - plan.postCapSplit;
  const share = brokerShare(base, pre, post, capLeftBefore);
  const company = share.company;
  let basis = cappedAtStart ? `capped: ${pctText(post)} after the cap` : `${pctText(pre)} of ${usd(base)}`;
  if (share.crossed && !cappedAtStart) basis = `${pctText(pre)} of ${usd(share.preBase)} fills the cap, then ${pctText(post)} of ${usd(share.postBase)}`;
  if (cappedAtStart) {
    const atPost = pctOf(base, post);
    line('brokerage', 'Brokerage split', -atPost, basis);
  } else {
    line('brokerage', 'Brokerage split', -company, basis);
  }
  const companyPaid = cappedAtStart ? pctOf(base, post) : company;
  let agentShare = base - companyPaid;
  // What counts toward the cap: the pre-cap company dollar (never past the cap).
  let capAdd = plan.cap === null || cappedAtStart ? 0 : Math.min(company, capLeftBefore);

  if (royalty && plan.royaltyFrom === 'agent') {
    line('royalty', 'Royalty (out of your share)', -royalty, `${pctText(plan.royalty)} of ${usd(afterReferral)}${royalty < pctOf(afterReferral, plan.royalty) ? ', up to its cap' : ''}`);
    agentShare -= royalty;
  }
  if (plan.team && plan.team.order === 'brokerage-first') {
    team = teamCut(agentShare);
    if (team) line('team', 'Team\'s share (after the brokerage split)', -team, `${pctText(plan.team.percent)} of ${usd(agentShare)}${team < pctOf(agentShare, plan.team.percent) ? ', up to the team cap' : ''}`);
    agentShare -= team;
  }

  let fees = 0;
  let feesToCap = 0;
  for (const fee of plan.fees) {
    if (fee.when === 'pre-cap' && cappedAtStart) continue;
    if (fee.when === 'post-cap' && !cappedAtStart) continue;
    line('fee', fee.name, -fee.amount, fee.when === 'always' ? 'every deal' : fee.when === 'pre-cap' ? 'until you cap' : 'after you cap');
    fees += fee.amount;
    if (fee.countsToCap) feesToCap += fee.amount;
  }
  const royaltyToCap = plan.royaltyCountsToCap ? royalty : 0;
  if (plan.cap !== null) capAdd = Math.min(capLeftBefore, capAdd + feesToCap + royaltyToCap);
  const net = agentShare - fees;
  line('net', 'You net', net, null);

  const after = {
    capPaid: state.capPaid + capAdd,
    royaltyPaid: state.royaltyPaid + royalty,
    teamPaid: state.teamPaid + team,
  };
  const cappedNow = plan.cap !== null && after.capPaid >= plan.cap;
  return {
    gross: deal.gross, referral, royalty, team, brokerage: companyPaid, fees, net,
    // What the brokerage pays you, and your share before the fees it charges you are taken off.
    paidToYou: net,
    beforeYourFees: net + fees + (plan.royaltyFrom === 'agent' ? royalty : 0),
    capAdd,
    capLeft: plan.cap === null ? null : Math.max(0, plan.cap - after.capPaid),
    cappedAtStart,
    crossedCap: !cappedAtStart && cappedNow && plan.cap !== null,
    steps,
    after,
  };
}

const ZERO = { capPaid: 0, royaltyPaid: 0, teamPaid: 0 };

// ---------- the 1099 threshold ----------

// thresholds: [{ fromYear, toYear?, amount (cents), note }] from data/irs.json.
export function thresholdFor(year, thresholds) {
  return thresholds.find((t) => year >= t.fromYear && (t.toYear === undefined || year <= t.toYear)) ?? null;
}

// ---------- ops ----------

function planSummary(plan) {
  const bits = [`${ratioText(plan.split)} split`];
  if (plan.cap !== null) bits.push(`${usdShort(plan.cap)} cap${plan.capStartGiven ? ` from ${longDate(`2000-${pad(plan.ann[0])}-${pad(plan.ann[1])}`).replace(', 2000', '')}` : ' per calendar year'}`);
  if (plan.cap !== null && plan.postCapSplit !== HUNDRED) bits.push(`${ratioText(plan.postCapSplit)} after the cap`);
  if (plan.royalty) bits.push(`${pctText(plan.royalty)} royalty${plan.royaltyCap !== null ? ` capped at ${usdShort(plan.royaltyCap)}` : ''}`);
  if (plan.team) bits.push(`${pctText(plan.team.percent)} team share ${plan.team.order === 'team-first' ? 'before' : 'after'} the brokerage split${plan.team.cap !== null ? ` (team cap ${usdShort(plan.team.cap)})` : ''}`);
  for (const f of plan.fees) bits.push(`${usd(f.amount)} ${f.name.toLowerCase()} ${f.when === 'always' ? 'per deal' : f.when === 'pre-cap' ? 'per deal until the cap' : 'per deal after the cap'}`);
  if (plan.monthlyFee) bits.push(`${usd(plan.monthlyFee)} a month`);
  return bits.join(', ');
}

function readSoFar(s = {}, plan) {
  const v = (k, label) => (has(s?.[k]) ? toCents(s[k], `paidSoFar.${k}`, { label }) : 0);
  const st = { capPaid: v('cap', 'Paid toward the cap so far'), royaltyPaid: v('royalty', 'Royalty paid so far'), teamPaid: v('team', 'Paid to the team so far') };
  if (plan.cap !== null && st.capPaid > plan.cap) throw new CommissionError('Paid toward the cap is more than the cap.', 'paidSoFar.cap');
  return st;
}

// One deal. input: { plan, deal, paidSoFar? }
export function deal(input) {
  const plan = readPlan(input.plan);
  const d = readDeal(input.deal);
  const state = readSoFar(input.paidSoFar, plan);
  const r = workDeal(plan, d, state);
  const capText = plan.cap === null ? '' : r.cappedAtStart ? ' You were already capped.'
    : r.crossedCap ? ` This deal crosses your ${usdShort(plan.cap)} cap.` : ` ${usd(r.capLeft)} is left to your ${usdShort(plan.cap)} cap.`;
  const deductions = [];
  if (r.referral) deductions.push(`the ${usd(r.referral)} referral fee`);
  if (r.royalty) deductions.push(`the ${usd(r.royalty)} royalty`);
  if (r.team && plan.team.order === 'team-first') deductions.push(`the team's ${usd(r.team)}`);
  deductions.push(`the ${usd(r.brokerage)} brokerage split`);
  if (r.team && plan.team.order === 'brokerage-first') deductions.push(`the team's ${usd(r.team)}`);
  if (r.fees) deductions.push(`${usd(r.fees)} in fees`);
  const list = deductions.length > 1 ? `${deductions.slice(0, -1).join(', ')} and ${deductions[deductions.length - 1]}` : deductions[0];
  const side = d.price !== null ? `On a ${usdShort(d.price)} sale at ${pctText(d.rate)}, your side is ${usd(d.gross)}` : `Your side is ${usd(d.gross)}`;
  const answer = `${side}; after ${list}, you net ${usd(r.net)}.${capText}`;
  return {
    op: 'deal', answer, plan: planSummary(plan),
    gross: usd(r.gross), referral: usd(r.referral), royalty: usd(r.royalty), team: usd(r.team), brokerage: usd(r.brokerage), fees: usd(r.fees), net: usd(r.net),
    netCents: r.net, grossCents: r.gross,
    capLeft: r.capLeft === null ? null : usd(r.capLeft), crossedCap: r.crossedCap, cappedAtStart: r.cappedAtStart,
    paidSoFarAfter: { cap: plainUsd(r.after.capPaid), royalty: plainUsd(r.after.royaltyPaid), team: plainUsd(r.after.teamPaid) },
    steps: r.steps.map((s) => ({ label: s.label, amount: usd(s.amount), basis: s.basis ?? null })),
  };
}

// A year (or several) of deals. input: { plan, deals: [...], asOf? }
// thresholds: the 1099-NEC thresholds by payment year.
export function year(input, { thresholds = [] } = {}) {
  const plan = readPlan(input.plan);
  if (!Array.isArray(input.deals) || !input.deals.length) throw new CommissionError('Add at least one deal.', 'deals');
  if (input.deals.length > LIMITS.maxDeals) throw new CommissionError(`At most ${LIMITS.maxDeals} deals at a time.`, 'deals');
  const deals = input.deals.map((d, i) => ({ ...readDeal(d, `deals.${i}`, { needDate: true }), index: i }));
  // Date order; deals on the same day keep the order given.
  deals.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.index - b.index));

  const periods = [];
  const years = new Map();
  let cur = null;
  let state = { ...ZERO };
  const rows = [];
  for (const d of deals) {
    const per = periodOf(d.date, plan.ann);
    if (!cur || cur.start !== per.start) {
      cur = { ...per, deals: 0, pending: 0, gross: 0, net: 0, brokerage: 0, team: 0, royalty: 0, referral: 0, fees: 0, cappedOn: null, crossingDeal: null, closedGross: 0, closedDeals: 0 };
      periods.push(cur);
      state = { ...ZERO };
    }
    const r = workDeal(plan, d, state);
    state = r.after;
    cur.deals += 1;
    if (d.pending) cur.pending += 1; else { cur.closedGross += r.gross; cur.closedDeals += 1; }
    for (const k of ['gross', 'net', 'brokerage', 'team', 'royalty', 'referral', 'fees']) cur[k] += r[k];
    if (r.crossedCap) { cur.cappedOn = d.date; cur.crossingDeal = d.label ?? `deal of ${longDate(d.date)}`; cur.crossingPending = d.pending; }
    cur.capPaid = state.capPaid;
    if (!d.pending) {
      const y = Number(d.date.slice(0, 4));
      const t = years.get(y) ?? { year: y, deals: 0, paidToYou: 0, beforeYourFees: 0, gross: 0 };
      t.deals += 1; t.paidToYou += r.paidToYou; t.beforeYourFees += r.beforeYourFees; t.gross += r.gross;
      years.set(y, t);
    }
    rows.push({
      date: d.date, label: d.label, pending: d.pending, period: per.start,
      gross: r.gross, referral: r.referral, royalty: r.royalty, team: r.team, brokerage: r.brokerage, fees: r.fees, net: r.net,
      capPaid: plan.cap === null ? null : state.capPaid, capLeft: r.capLeft, crossedCap: r.crossedCap, cappedAtStart: r.cappedAtStart,
    });
  }

  // How many more deals like the period's average closed deal until the cap, in the last period.
  const last = periods[periods.length - 1];
  let forecast = null;
  if (plan.cap !== null) {
    const left = Math.max(0, plan.cap - last.capPaid);
    if (left === 0) forecast = { capLeft: usd(0), deals: 0, text: `Capped on ${longDate(last.cappedOn ?? last.start)}.` };
    else if (last.closedDeals) {
      const avg = Math.round(last.closedGross / last.closedDeals);
      let st = { ...state };
      let n = 0;
      const step = workDeal(plan, { gross: avg, price: null, rate: null, referral: 0, referralFlat: 0 }, st);
      if (step.capAdd > 0) {
        while (st.capPaid < plan.cap && n < LIMITS.maxCompareDeals) { st = workDeal(plan, { gross: avg, price: null, rate: null, referral: 0, referralFlat: 0 }, st).after; n += 1; }
      }
      forecast = step.capAdd > 0 && st.capPaid >= plan.cap
        ? { capLeft: usd(left), deals: n, averageGross: usd(avg), text: `${usd(left)} left to cap: about ${n} more deal${n === 1 ? '' : 's'} like your average of ${usd(avg)} this period.` }
        : { capLeft: usd(left), deals: null, averageGross: usd(avg), text: `${usd(left)} left to cap; deals of ${usd(avg)} do not reach it.` };
    }
  }

  const yearRows = [...years.values()].sort((a, b) => a.year - b.year).map((t) => {
    const th = thresholdFor(t.year, thresholds);
    return {
      year: t.year, deals: t.deals, gross: usd(t.gross), paidToYou: usd(t.paidToYou), beforeYourFees: usd(t.beforeYourFees),
      threshold: th ? usd(th.amount) : null,
      reportable: th ? t.paidToYou >= th.amount || t.beforeYourFees >= th.amount : null,
      thresholdNote: th?.note ?? null,
    };
  });

  const lastYear = yearRows[yearRows.length - 1];
  const capPart = plan.cap === null ? '' : last.cappedOn ? (last.crossingPending ? ` You cap on ${longDate(last.cappedOn)} if ${last.crossingDeal} closes (pending).` : ` You capped on ${longDate(last.cappedOn)} (${last.crossingDeal}).`) : ` ${usd(Math.max(0, plan.cap - last.capPaid))} of your ${usdShort(plan.cap)} cap is left in the period from ${longDate(last.start)}.`;
  const answer = `${deals.length} deal${deals.length === 1 ? '' : 's'}: ${usd(periods.reduce((s, p) => s + p.gross, 0))} on your side, you net ${usd(periods.reduce((s, p) => s + p.net, 0))}.${capPart}${lastYear ? ` Paid to you in ${lastYear.year}: ${lastYear.paidToYou} (the 1099 basis; ${lastYear.beforeYourFees} before fees charged to you).` : ''}`;

  const csvHead = ['date', 'deal', 'status', 'cap_period_start', 'gross', 'referral', 'royalty', 'team', 'brokerage', 'fees', 'net', 'cap_paid', 'cap_left'];
  const csv = [csvHead.join(','), ...rows.map((r) => [r.date, csvText(r.label ?? ''), r.pending ? 'pending' : 'closed', r.period, ...['gross', 'referral', 'royalty', 'team', 'brokerage', 'fees', 'net'].map((k) => plainUsd(r[k])), r.capPaid === null ? '' : plainUsd(r.capPaid), r.capLeft === null ? '' : plainUsd(r.capLeft)].join(','))].join('\n') + '\n';

  return {
    op: 'year', answer, plan: planSummary(plan),
    deals: rows.map((r) => ({ ...r, ...Object.fromEntries(['gross', 'referral', 'royalty', 'team', 'brokerage', 'fees', 'net'].map((k) => [k, usd(r[k])])), capPaid: r.capPaid === null ? null : usd(r.capPaid), capLeft: r.capLeft === null ? null : usd(r.capLeft) })),
    periods: periods.map((p) => ({
      start: p.start, end: p.end, deals: p.deals, pending: p.pending, gross: usd(p.gross), net: usd(p.net), brokerage: usd(p.brokerage), team: usd(p.team), royalty: usd(p.royalty), referral: usd(p.referral), fees: usd(p.fees),
      capPaid: plan.cap === null ? null : usd(p.capPaid), capLeft: plan.cap === null ? null : usd(Math.max(0, plan.cap - p.capPaid)), cappedOn: p.cappedOn, crossingDeal: p.crossingDeal, crossingPending: !!p.crossingPending,
    })),
    forecast,
    years: yearRows,
    csv,
  };
}
const csvText = (s) => (/[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);

// The net of n equal deals in one cap period under a plan, less its monthly fees for a year.
export function netForDeals(plan, n, gross) {
  let st = { ...ZERO };
  let net = 0;
  let brokerage = 0;
  for (let i = 0; i < n; i++) {
    const r = workDeal(plan, { gross, price: null, rate: null, referral: 0, referralFlat: 0 }, st);
    st = r.after; net += r.net; brokerage += r.brokerage + r.royalty + r.team;
  }
  return { net: net - plan.monthlyFee * 12, kept: net, paidOut: brokerage + plan.monthlyFee * 12, capped: plan.cap !== null && st.capPaid >= plan.cap };
}

function averageGross(input) {
  if (has(input.averageCommission)) return toCents(input.averageCommission, 'averageCommission', { label: 'The average commission per deal', min: 1 });
  const price = toCents(input.averagePrice, 'averagePrice', { label: 'The average sale price', min: 1 });
  return pctOf(price, toPct(input.rate, 'rate', { label: 'Your side\'s commission rate', min: 1, max: 50_000 }));
}

// Two to four plans at the same deals. input: { plans: [...], deals, averageCommission | averagePrice + rate }
export function compare(input) {
  if (!Array.isArray(input.plans) || input.plans.length < 2 || input.plans.length > LIMITS.maxPlans) throw new CommissionError(`Compare 2 to ${LIMITS.maxPlans} plans.`, 'plans');
  const plans = input.plans.map((p, i) => readPlan(p, `plans.${i}`));
  const n = Number(input.deals);
  if (!Number.isInteger(n) || n < 1 || n > LIMITS.maxCompareDeals) throw new CommissionError(`Deals a year is a whole number from 1 to ${LIMITS.maxCompareDeals}.`, 'deals');
  const gross = averageGross(input);
  const names = plans.map((p, i) => p.label ?? `Plan ${String.fromCharCode(65 + i)}`);
  const res = plans.map((p, i) => ({ name: names[i], plan: planSummary(p), ...netForDeals(p, n, gross) }));
  const best = res.reduce((b, r, i) => (r.net > res[b].net ? i : b), 0);
  // Where the first two plans swap: the fewest deals a year from which the other plan nets more.
  const [a, b] = plans;
  const sign = (k) => Math.sign(netForDeals(a, k, gross).net - netForDeals(b, k, gross).net);
  let breakEven = null;
  const s1 = sign(1);
  for (let k = 2; k <= LIMITS.maxCompareDeals; k++) { const s = sign(k); if (s !== s1 && s !== 0) { breakEven = k; break; } }
  const table = [1, 2, 3, 4, 6, 8, 10, 12, 15, 20, 25, 30, 40].filter((k) => k <= LIMITS.maxCompareDeals).map((k) => ({ deals: k, nets: plans.map((p) => usd(netForDeals(p, k, gross).net)) }));
  const others = res.filter((_, i) => i !== best).map((r) => `${r.name} ${usd(r.net)}`).join(', ');
  const answer = `At ${n} deal${n === 1 ? '' : 's'} a year of ${usd(gross)} each, ${res[best].name} nets the most: ${usd(res[best].net)} (${others}).${breakEven ? ` ${names[0]} and ${names[1]} swap places at ${breakEven} deals a year.` : ''}`;
  return { op: 'compare', answer, averageGross: usd(gross), deals: n, plans: res.map((r) => ({ name: r.name, plan: r.plan, net: usd(r.net), netCents: r.net, paidOut: usd(r.paidOut), capped: r.capped })), breakEven, table, names };
}

// Deals and GCI needed for a net goal. input: { plan, goal, averageCommission | averagePrice + rate }
export function goal(input) {
  const plan = readPlan(input.plan);
  const target = toCents(input.goal, 'goal', { label: 'Your net income goal', min: 1 });
  const gross = averageGross(input);
  let n = 0;
  let r = null;
  while (n < LIMITS.maxCompareDeals) {
    n += 1;
    r = netForDeals(plan, n, gross);
    if (r.net >= target) break;
  }
  const reached = r.net >= target;
  const answer = reached
    ? `To net ${usd(target)} on a ${planSummary(plan)}, you need ${n} deal${n === 1 ? '' : 's'} of ${usd(gross)}: ${usd(n * gross)} in GCI, netting ${usd(r.net)}${r.capped ? ' (you cap along the way)' : ''}.`
    : `Deals of ${usd(gross)} do not reach ${usd(target)} within ${LIMITS.maxCompareDeals} deals on this plan.`;
  return { op: 'goal', answer, reached, deals: reached ? n : null, gci: reached ? usd(n * gross) : null, net: usd(r.net), averageGross: usd(gross), capped: r.capped, plan: planSummary(plan) };
}

export function compute(input, ctx = {}) {
  switch (input.op) {
    case 'deal': return deal(input);
    case 'year': return year(input, ctx);
    case 'compare': return compare(input);
    case 'goal': return goal(input);
    case 'plans': return { op: 'plans', plans: ctx.plans ?? [], thresholds: (ctx.thresholds ?? []).map((t) => ({ ...t, amount: usd(t.amount) })) };
    default: throw new CommissionError('op is deal, year, compare, goal or plans.', 'op');
  }
}
