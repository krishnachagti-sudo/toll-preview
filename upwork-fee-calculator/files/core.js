// What a freelancer keeps from an Upwork (or Freelancer.com) payment: the platform's service fee,
// the withdrawal fee, a payout provider's fee and its conversion margin, at a dated reference rate.
// Pure and dependency-free: the page loads this same file. Every fee figure comes from the fee
// tables passed in (data/fees.json, each read on the company's own page); a fee we could not read
// there is an input the person types, never a guess.
//
// Money is whole cents (USD) and whole hundredths of the local currency. Percentages are whole
// hundredths of a percent (10% = 1000). Rates are local currency per US dollar, held as millionths
// in a BigInt, so a conversion is exact before its one rounding (half up, to the hundredth).

export const ENGINE_VERSION = 'upwork-fee-1';

export class FeeError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'FeeError';
    this.field = field;
  }
}

export const COUNTRIES = {
  IN: { name: 'India', currency: 'INR', slug: 'india' },
  PH: { name: 'the Philippines', short: 'Philippines', currency: 'PHP', slug: 'philippines' },
  PK: { name: 'Pakistan', currency: 'PKR', slug: 'pakistan' },
  BD: { name: 'Bangladesh', currency: 'BDT', slug: 'bangladesh' },
  NG: { name: 'Nigeria', currency: 'NGN', slug: 'nigeria' },
  NP: { name: 'Nepal', currency: 'NPR', slug: 'nepal' },
  EG: { name: 'Egypt', currency: 'EGP', slug: 'egypt' },
  LK: { name: 'Sri Lanka', currency: 'LKR', slug: 'sri-lanka' },
  US: { name: 'the United States', short: 'United States', currency: 'USD', slug: 'united-states' },
};
export const COUNTRY_CODES = Object.keys(COUNTRIES);
export const CURRENCY_NAMES = {
  USD: 'US dollars', INR: 'Indian rupees', PHP: 'Philippine pesos', PKR: 'Pakistani rupees', BDT: 'Bangladeshi taka',
  NGN: 'Nigerian naira', NPR: 'Nepalese rupees', EGP: 'Egyptian pounds', LKR: 'Sri Lankan rupees',
};
export const PLATFORMS = ['upwork', 'freelancer-com'];
export const ROUTES = ['usd', 'paypal', 'payoneer', 'wise', 'skydo', 'bank'];
export const ROUTE_NAMES = { usd: 'Keep US dollars', paypal: 'PayPal', payoneer: 'Payoneer', wise: 'Wise', skydo: 'Skydo', bank: 'Your bank' };
export const FL_METHODS = ['express', 'paypal', 'skrill', 'payoneer-card', 'wire'];
export const SCHEDULES = [
  { id: 'weekly', label: 'Weekly', perYear: 52 },
  { id: 'fortnightly', label: 'Every two weeks', perYear: 26 },
  { id: 'twice-monthly', label: 'Twice a month', perYear: 24 },
  { id: 'monthly', label: 'Monthly', perYear: 12 },
];
export const LIMITS = { maxCents: 1_000_000_000, maxWithdrawals: 60, maxPayments: 1000, maxRateMicros: 1_000_000_000_000n };

// ---------- reading numbers ----------

const DEC = /^\d{1,12}(?:\.\d+)?$/;
const clean = (v) => String(v).trim().replace(/^\$\s*/, '').replace(/,/g, '').replace(/\s*(usd|us\$)$/i, '');

// "1,250.50", "$800", 800 -> cents. Rounds half up past the cent.
export function toCents(v, field, { min = 0, max = LIMITS.maxCents, label = field } = {}) {
  if (v === undefined || v === null || String(v).trim() === '') throw new FeeError(`${label} is missing.`, field);
  const s = clean(v);
  if (!DEC.test(s)) throw new FeeError(`${label} must be an amount like 800 or 1,250.50.`, field);
  const [whole, frac = ''] = s.split('.');
  let cents = Number(whole) * 100 + Number((frac + '00').slice(0, 2));
  if (frac.length > 2 && Number(frac[2]) >= 5) cents += 1;
  if (cents < min) throw new FeeError(`${label} must be at least ${usd(min)}.`, field);
  if (cents > max) throw new FeeError(`${label} must be at most ${usd(max)}.`, field);
  return cents;
}

// "10", "7.5%", 12.25 -> hundredths of a percent (1000, 750, 1225). Two decimals at most.
export function toBps(v, field, { min = 0, max = 10000, label = field } = {}) {
  if (v === undefined || v === null || String(v).trim() === '') throw new FeeError(`${label} is missing.`, field);
  const s = String(v).trim().replace(/\s*%$/, '');
  if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(s)) throw new FeeError(`${label} must be a percentage like 10 or 7.5, with at most two decimals.`, field);
  const [w, f = ''] = s.split('.');
  const bps = Number(w) * 100 + Number((f + '00').slice(0, 2));
  if (bps < min || bps > max) throw new FeeError(`${label} must be from ${pctText(min)} to ${pctText(max)}.`, field);
  return bps;
}

// "93.922526" -> 93922526n (millionths). Six decimals at most.
export function toRateMicros(v, field = 'rate') {
  const s = String(v ?? '').trim().replace(/,/g, '');
  if (!/^\d{1,7}(?:\.\d{1,6})?$/.test(s)) throw new FeeError('The exchange rate must be a number like 93.92 (local currency per US dollar), with at most six decimals.', field);
  const [w, f = ''] = s.split('.');
  const micros = BigInt(w) * 1_000_000n + BigInt((f + '000000').slice(0, 6));
  if (micros <= 0n) throw new FeeError('The exchange rate must be above zero.', field);
  return micros;
}

// ---------- showing numbers ----------

const group = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
export function usd(cents) {
  const neg = cents < 0;
  const a = Math.abs(cents);
  return `${neg ? '-' : ''}$${group(String(Math.floor(a / 100)))}.${String(a % 100).padStart(2, '0')}`;
}
export const plainUsd = (cents) => `${cents < 0 ? '-' : ''}${Math.floor(Math.abs(cents) / 100)}.${String(Math.abs(cents) % 100).padStart(2, '0')}`;
export function local(minor, currency) {
  const m = typeof minor === 'bigint' ? minor : BigInt(minor);
  const neg = m < 0n;
  const a = neg ? -m : m;
  return `${neg ? '-' : ''}${group(String(a / 100n))}.${String(a % 100n).padStart(2, '0')} ${currency}`;
}
export const plainLocal = (minor) => { const m = BigInt(minor); return `${m / 100n}.${String(m % 100n).padStart(2, '0')}`; };
export function pctText(bps) {
  const w = Math.floor(bps / 100);
  const f = bps % 100;
  return `${w}${f ? `.${String(f).padStart(2, '0').replace(/0$/, '')}` : ''}%`;
}
export const rateText = (micros) => {
  const w = micros / 1_000_000n;
  const f = String(micros % 1_000_000n).padStart(6, '0').replace(/0+$/, '');
  return f ? `${w}.${f}` : String(w);
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// ---------- arithmetic ----------

// A percentage of an amount in cents, rounded half up to the cent.
export const pctOf = (cents, bps) => Math.floor((cents * bps + 5000) / 10000);
const divRound = (n, d) => (n + d / 2n) / d; // BigInt, both positive: half up
// USD cents -> local hundredths at rate (millionths) less a margin, rounded half up once.
export function convert(cents, micros, marginBps = 0) {
  if (cents <= 0) return 0n;
  return divRound(BigInt(cents) * micros * BigInt(10000 - marginBps), 1_000_000n * 10000n);
}

// ---------- the fee tables ----------

function serviceFeeBps(input, fees) {
  const sf = fees.upwork.serviceFee;
  if (input.feePercent === undefined || input.feePercent === null || input.feePercent === '') return { bps: sf.examplePercent * 100, assumed: true };
  return { bps: toBps(input.feePercent, 'feePercent', { min: sf.minPercent * 100, max: sf.maxPercent * 100, label: 'The Upwork service fee' }), assumed: false };
}

const upworkSource = (fees) => ({ text: `${fees.upwork.sources.fee.name} (read ${longDate(fees.readOn)})`, href: fees.upwork.sources.fee.url });
const flSource = (fees) => ({ text: `${fees.freelancerCom.name} (read ${longDate(fees.readOn)})`, href: fees.freelancerCom.url });

// The gross billed: an amount, or an hourly rate times hours (hours to two decimals).
export function grossOf(input) {
  const hasAmount = input.amount !== undefined && input.amount !== null && String(input.amount).trim() !== '';
  const hasHourly = input.hourlyRate !== undefined && input.hourlyRate !== null && String(input.hourlyRate).trim() !== '';
  if (hasAmount && hasHourly) throw new FeeError('Give the amount billed, or an hourly rate and hours, not both.', 'amount');
  if (hasAmount) return { cents: toCents(input.amount, 'amount', { min: 1, label: 'The amount billed' }), how: null };
  if (!hasHourly) throw new FeeError('Give the amount billed (like 800), or an hourly rate and hours.', 'amount');
  const rate = toCents(input.hourlyRate, 'hourlyRate', { min: 1, max: 100_000_00, label: 'The hourly rate' });
  const h = toBps(input.hours ?? '', 'hours', { min: 1, max: 1000_00, label: 'Hours' }); // hundredths of an hour
  const cents = Math.floor((rate * h + 50) / 100);
  if (cents > LIMITS.maxCents) throw new FeeError('The amount billed is too large.', 'hours');
  return { cents, how: `${usd(rate)} an hour x ${h % 100 ? (h / 100).toFixed(2).replace(/0$/, '') : h / 100} hours` };
}

// The platform's own fee on the gross.
function platformFee(input, fees, gross) {
  const platform = input.platform ?? 'upwork';
  if (platform === 'upwork') {
    const { bps, assumed } = serviceFeeBps(input, fees);
    return {
      platform, bps, assumed,
      fee: pctOf(gross, bps),
      label: `Upwork service fee (${pctText(bps)}${assumed ? ', the 10% Upwork\'s own calculator starts at' : ''})`,
      basis: `${pctText(bps)} of ${usd(gross)}`,
      source: upworkSource(fees),
    };
  }
  if (platform !== 'freelancer-com') throw new FeeError(`platform is one of ${PLATFORMS.join(', ')}.`, 'platform');
  const fl = fees.freelancerCom.freelancer;
  const hourly = (input.projectType ?? 'fixed') === 'hourly';
  if (!['fixed', 'hourly'].includes(input.projectType ?? 'fixed')) throw new FeeError('projectType is fixed or hourly.', 'projectType');
  const pct = pctOf(gross, (hourly ? fl.hourlyPercent : fl.fixedPercent) * 100);
  const min = toCents(fl.fixedMinimum, 'fixedMinimum');
  const fee = hourly ? pct : Math.max(pct, min);
  return {
    platform, bps: (hourly ? fl.hourlyPercent : fl.fixedPercent) * 100, assumed: false, hourly,
    fee: Math.min(fee, gross),
    label: hourly ? `Freelancer.com project fee (${fl.hourlyPercent}% on an hourly project)` : `Freelancer.com project fee (${fl.fixedPercent}% or ${usd(min)}, whichever is greater)`,
    basis: hourly ? `${fl.hourlyPercent}% of ${usd(gross)}` : `${usd(pct)} is ${fee === min && pct < min ? 'under' : 'not under'} the ${usd(min)} minimum`,
    source: flSource(fees),
  };
}

function withdrawalCount(input) {
  const n = input.withdrawals ?? 1;
  if (!Number.isInteger(Number(n)) || Number(n) < 1 || Number(n) > LIMITS.maxWithdrawals) throw new FeeError(`withdrawals is a whole number from 1 to ${LIMITS.maxWithdrawals}.`, 'withdrawals');
  return Number(n);
}

// The platform's own withdrawal fee: typed in for Upwork (its help pages could not be read), from
// the published table for Freelancer.com.
function platformWithdrawal(input, fees, platform, n) {
  if (platform === 'upwork') {
    if (input.withdrawalMethod !== undefined) throw new FeeError('withdrawalMethod is for Freelancer.com. For Upwork, type the fee your Upwork withdrawal page shows in withdrawalFee.', 'withdrawalMethod');
    const given = input.withdrawalFee !== undefined && input.withdrawalFee !== null && String(input.withdrawalFee).trim() !== '';
    const each = given ? toCents(input.withdrawalFee, 'withdrawalFee', { max: 100_00, label: 'The Upwork withdrawal fee' }) : 0;
    return {
      each, n, total: each * n, given,
      label: given ? `Upwork withdrawal fee (${usd(each)} as you entered${n > 1 ? `, x ${n} withdrawals` : ''})` : 'Upwork withdrawal fee (not entered)',
      source: given ? { text: 'The fee you entered from your Upwork Get Paid page' } : null,
    };
  }
  const m = input.withdrawalMethod;
  if (input.withdrawalFee !== undefined) throw new FeeError('For Freelancer.com the withdrawal fee comes from its published table: choose withdrawalMethod.', 'withdrawalFee');
  if (m === undefined) return { each: 0, n, total: 0, given: false, label: 'Freelancer.com withdrawal fee (no method chosen)', source: null };
  if (!FL_METHODS.includes(m)) throw new FeeError(`withdrawalMethod is one of ${FL_METHODS.join(', ')}.`, 'withdrawalMethod');
  const row = fees.freelancerCom.withdrawal[m];
  const each = toCents(row.fee, 'fee');
  return { each, n, total: each * n, given: true, method: m, label: `Freelancer.com withdrawal fee, ${row.label} (${usd(each)}${n > 1 ? ` x ${n}` : ''})`, source: flSource(fees) };
}

// Skydo's flat fee for one payment, from its published tiers, with GST on the fee.
export function skydoFee(cents, fees) {
  const s = fees.skydo;
  let fee = null;
  for (const t of s.tiers) {
    if (t.upTo !== undefined && cents <= toCents(t.upTo, 'upTo')) { fee = toCents(t.fee, 'fee'); break; }
    if (t.percent !== undefined) { fee = pctOf(cents, Math.round(t.percent * 100)); break; }
  }
  const gst = pctOf(fee, s.gstPercent * 100);
  return { fee, gst };
}

const routeSource = {
  paypal: (fees, market) => ({ text: `PayPal, Consumer fees for ${fees.paypal.markets[market].name} (last updated ${longDate(fees.paypal.markets[market].updated)}, read ${longDate(fees.readOn)})`, href: fees.paypal.markets[market].url }),
  payoneer: (fees) => ({ text: `${fees.payoneer.name} (last updated ${longDate(fees.payoneer.updated)}, read ${longDate(fees.readOn)})`, href: fees.payoneer.url }),
  wise: (fees) => ({ text: `${fees.wise.name} (read ${longDate(fees.readOn)})`, href: fees.wise.url }),
  skydo: (fees) => ({ text: `${fees.skydo.name} (read ${longDate(fees.readOn)})`, href: fees.skydo.url }),
};

// The rate for a currency: typed in, or the reference the caller looked up.
function rateFor(input, ctx, currency) {
  if (input.rate !== undefined && input.rate !== null && String(input.rate).trim() !== '') {
    return { micros: toRateMicros(input.rate), text: `${rateText(toRateMicros(input.rate))} ${currency} per US dollar, as you entered`, given: true, source: null };
  }
  const ref = ctx.rates?.[currency];
  if (!ref) throw new FeeError(`There is no reference rate for ${currency} here: type the rate (${currency} per US dollar) in rate.`, 'rate');
  const micros = toRateMicros(ref.rate);
  const label = ref.source === 'ecb' ? `the ECB reference rate of ${longDate(ref.date)}, crossed through the euro` : `the US Treasury reporting rate as of ${longDate(ref.date)}`;
  return { micros, text: `${rateText(micros)} ${currency} per US dollar, ${label}`, given: false, source: { text: `${ref.sourceName} (${ref.source === 'ecb' ? `fixing of ${longDate(ref.date)}` : `report as of ${longDate(ref.date)}`})`, href: ref.url }, ref };
}

function currencyOf(input) {
  if (input.currency !== undefined) {
    if (!/^[A-Z]{3}$/.test(String(input.currency))) throw new FeeError('currency is a three-letter code in capitals, like INR.', 'currency');
    return input.currency;
  }
  if (input.country !== undefined) return COUNTRIES[input.country].currency;
  return null;
}

function checkCountry(input) {
  if (input.country !== undefined && !COUNTRIES[input.country]) throw new FeeError(`country is one of ${COUNTRY_CODES.join(', ')}.`, 'country');
}

// ---------- net: gross to bank ----------

export function net(input, ctx) {
  const fees = ctx.fees;
  checkCountry(input);
  const gross = grossOf(input);
  const route = input.receive ?? 'usd';
  if (!ROUTES.includes(route)) throw new FeeError(`receive is one of ${ROUTES.join(', ')}.`, 'receive');
  const n = withdrawalCount(input);
  const pf = platformFee(input, fees, gross.cents);
  const steps = [{ label: `Billed${gross.how ? ` (${gross.how})` : ''}`, usd: gross.cents, kind: 'gross' }];
  steps.push({ label: pf.label, usd: -pf.fee, basis: pf.basis, source: pf.source, kind: 'platform' });
  const afterFee = gross.cents - pf.fee;
  const pw = platformWithdrawal(input, fees, pf.platform, n);
  if (pw.total) steps.push({ label: pw.label, usd: -pw.total, source: pw.source, kind: 'withdrawal' });
  let usdLeft = afterFee - pw.total;
  if (usdLeft <= 0) throw new FeeError('The fees are more than the amount: nothing would be left to withdraw.', 'amount');
  const flags = [];
  const sources = [pf.source];
  if (pw.source?.href) sources.push(pw.source);
  if (pf.assumed) flags.push('No service fee was given, so 10% (where Upwork\'s own calculator starts) is used. Your contract shows its own fee, from 0% to 15%.');
  if (pf.platform === 'upwork' && !pw.given) flags.push('Upwork\'s own withdrawal fee is not included: type the fee your Get Paid page shows for your method. Upwork\'s help pages on withdrawal fees could not be read here, so no figure is assumed.');
  if (pf.platform === 'freelancer-com' && pw.given) {
    const each = Math.floor(usdLeft / n);
    if (each < toCents(fees.freelancerCom.minimumWithdrawalAfterFees, 'min')) flags.push(`Freelancer.com sets a minimum withdrawal, after fees, of ${usd(toCents(fees.freelancerCom.minimumWithdrawalAfterFees, 'min'))}; each withdrawal here is ${usd(each)}.`);
  }

  // The provider's own fees in dollars, before any conversion.
  const market = input.country ?? null;
  const currency = route === 'usd' ? 'USD' : (currencyOf(input) ?? 'USD');
  let marginBps = 0;
  let range = null;
  let localFeeRule = null;
  const providerGiven = input.providerFee !== undefined && input.providerFee !== null && String(input.providerFee).trim() !== '';
  if (providerGiven) {
    const each = toCents(input.providerFee, 'providerFee', { max: 1000_00, label: 'The provider\'s fee' });
    steps.push({ label: `${ROUTE_NAMES[route]} fee to receive (${usd(each)} as you entered${n > 1 ? ` x ${n}` : ''})`, usd: -each * n, kind: 'provider', source: { text: 'The fee you entered' } });
    usdLeft -= each * n;
  }
  if (route === 'paypal') {
    if (!market) throw new FeeError('For PayPal, choose the country your PayPal account is registered in: PayPal publishes its fees per market.', 'country');
    const m = fees.paypal.markets[market];
    if (!m) throw new FeeError(`${fees.paypal.notCovered[market] ?? `PayPal's fees for ${COUNTRIES[market].name} were not read`}, so PayPal is not offered for it here.`, 'country');
    sources.push(routeSource.paypal(fees, market));
    if (currency !== 'USD') {
      marginBps = Math.round(m.conversionPercent * 100);
      if (input.marginPercent !== undefined) throw new FeeError('PayPal\'s conversion margin comes from its published fee page for your market; leave marginPercent out.', 'marginPercent');
    }
    if (m.bank.kind === 'under' || m.bank.kind === 'fixed') localFeeRule = m.bank;
    if (m.bank.kind === 'other') flags.push(`PayPal lists no bank withdrawal fee for ${COUNTRIES[market].name} ("${m.bank.text}"); whether bank withdrawal is available there is not on that page.`);
    if (!providerGiven) flags.push('PayPal may charge to receive the payment itself; that fee is on PayPal\'s merchant fee page and is not included. Type it in providerFee if your account shows one.');
  } else if (route === 'payoneer') {
    sources.push(routeSource.payoneer(fees));
    if (currency !== 'USD') {
      if (input.marginPercent !== undefined) marginBps = toBps(input.marginPercent, 'marginPercent', { max: 1000, label: 'Payoneer\'s withdrawal fee' });
      else range = [Math.round(fees.payoneer.conversionMinPercent * 100), Math.round(fees.payoneer.conversionMaxPercent * 100)];
    }
    if (!providerGiven) flags.push(`Payoneer's fee to receive from a marketplace is "${fees.payoneer.quotes.marketplace.split(': ')[1]}": it is not included. Type it in providerFee from your Payoneer Fees page.`);
    flags.push(`Payoneer charges an annual account fee of ${usd(toCents(fees.payoneer.annualAccountFee, 'a'))} if the account receives less than ${usd(toCents(fees.payoneer.annualFeeUnder, 'a'))} in any 12 consecutive months; it is not taken from this payment.`);
  } else if (route === 'wise') {
    sources.push(routeSource.wise(fees));
    if (input.wire) {
      const each = toCents(fees.wise.receiveUsdWire, 'wire');
      steps.push({ label: `Wise fee to receive a USD wire (${usd(each)}${n > 1 ? ` x ${n}` : ''})`, usd: -each * n, kind: 'provider', source: routeSource.wise(fees) });
      usdLeft -= each * n;
    }
    if (currency !== 'USD') {
      if (input.marginPercent !== undefined) marginBps = toBps(input.marginPercent, 'marginPercent', { max: 1000, label: 'Wise\'s conversion fee' });
      else flags.push(`Wise's conversion fee varies by currency ("from ${fees.wise.conversionFrom}%" on its pricing page) and is not included: type the fee its calculator shows in marginPercent.`);
    }
  } else if (route === 'skydo') {
    if (market && market !== fees.skydo.country) throw new FeeError('Skydo\'s published pricing is for Indian accounts; choose India or another route.', 'country');
    if (currency !== 'INR') throw new FeeError('Skydo pays out in Indian rupees: use country IN or currency INR.', 'currency');
    sources.push(routeSource.skydo(fees));
    const each = Math.floor(usdLeft / n);
    let fee = 0; let gst = 0;
    for (let i = 0; i < n; i++) {
      const part = i < n - 1 ? each : usdLeft - each * (n - 1);
      const f = skydoFee(part, fees);
      fee += f.fee; gst += f.gst;
    }
    steps.push({ label: `Skydo flat fee (${n > 1 ? `${n} payments` : 'one payment'}, by its published tiers)`, usd: -fee, kind: 'provider', source: routeSource.skydo(fees) });
    steps.push({ label: `GST on Skydo's fee (${fees.skydo.gstPercent}%, as in Skydo's own worked example)`, usd: -gst, kind: 'provider', source: routeSource.skydo(fees) });
    usdLeft -= fee + gst;
    flags.push('Skydo states "Zero FX margin"; its live rate may differ from the reference rate used here.');
  } else if (route === 'bank') {
    if (currency !== 'USD') {
      if (input.marginPercent !== undefined) marginBps = toBps(input.marginPercent, 'marginPercent', { max: 1000, label: 'Your bank\'s margin' });
      else flags.push('Your bank\'s margin over the reference rate is not included: type it in marginPercent (your bank\'s rate sheet shows its buying rate).');
    }
  }
  if (usdLeft <= 0) throw new FeeError('The fees are more than the amount: nothing would be left to convert.', 'amount');
  steps.push({ label: 'In US dollars before conversion', usd: usdLeft, kind: 'subtotal' });

  const out = {
    platform: pf.platform,
    gross: usd(gross.cents),
    feePercent: pctText(pf.bps),
    platformFee: usd(pf.fee),
    afterPlatformFee: usd(afterFee),
    withdrawalFee: usd(pw.total),
    usdBeforeConversion: usd(usdLeft),
    receive: route,
    withdrawals: n,
    steps: null,
    local: null,
    netPercent: null,
    flags,
    sources: null,
  };

  if (currency === 'USD') {
    out.netPercent = pctText(Math.floor((usdLeft * 10000) / gross.cents));
    out.net = usd(usdLeft);
    out.steps = steps.map(showStep);
    out.sources = sources;
    out.answer = `${usd(gross.cents)} billed on ${pf.platform === 'upwork' ? 'Upwork' : 'Freelancer.com'} at a ${pctText(pf.bps)} fee leaves ${usd(afterFee)}${pw.total ? `, and ${usd(usdLeft)} after the ${usd(pw.total)} withdrawal fee` : ''}${usdLeft !== afterFee - pw.total ? `; ${usd(usdLeft)} after ${ROUTE_NAMES[route]}'s fees` : ''}: ${out.netPercent} of what was billed.`;
    return out;
  }

  const rate = rateFor(input, ctx, currency);
  if (rate.source) sources.push(rate.source);
  const localBank = (minor) => {
    if (!localFeeRule) return 0n;
    const fee = BigInt(Math.round(Number(localFeeRule.fee) * 100));
    if (localFeeRule.kind === 'fixed') return fee * BigInt(n);
    // PH: the fee applies under the threshold, per withdrawal.
    const per = minor / BigInt(n);
    const threshold = BigInt(Math.round(Number(localFeeRule.threshold) * 100));
    if (per === threshold) flags.push(`Each withdrawal is exactly ${local(threshold, localFeeRule.currency)}; PayPal's table names amounts above and below it only, so no fee is applied.`);
    return per < threshold ? fee * BigInt(n) : 0n;
  };
  const at = (bps) => {
    const minor = convert(usdLeft, rate.micros, bps);
    const bankFee = localBank(minor);
    return { minor, bankFee, final: minor - bankFee };
  };
  const refLocal = convert(gross.cents, rate.micros, 0);
  const pctOfRef = (minor) => pctText(Number((minor * 10000n) / (refLocal || 1n)));
  if (range) {
    const lo = at(range[1]);
    const hi = at(range[0]);
    steps.push({ label: `Payoneer withdrawal to a ${currency} bank account with conversion (${pctText(range[0])} to ${pctText(range[1])}, Payoneer's published range)`, local: `${local(lo.minor, currency)} to ${local(hi.minor, currency)}`, kind: 'convert', source: routeSource.payoneer(fees) });
    out.local = { currency, rate: rateText(rate.micros), rateText: rate.text, rateSource: rate.ref ? { source: rate.ref.source, date: rate.ref.date } : 'entered', marginPercent: null, marginRange: [pctText(range[0]), pctText(range[1])], low: local(lo.final, currency), high: local(hi.final, currency), lowValue: plainLocal(lo.final), highValue: plainLocal(hi.final) };
    out.netPercent = `${pctOfRef(lo.final)} to ${pctOfRef(hi.final)}`;
    out.answer = `${usd(gross.cents)} billed at a ${pctText(pf.bps)} ${pf.platform === 'upwork' ? 'Upwork' : 'Freelancer.com'} fee leaves ${usd(afterFee)}; withdrawn through Payoneer to a ${currency} bank account at Payoneer's published ${pctText(range[0])} to ${pctText(range[1])}, about ${local(lo.final, currency)} to ${local(hi.final, currency)} arrives at ${rateText(rate.micros)} ${currency} per dollar (${out.netPercent} of the gross at that rate).`;
  } else {
    const r = at(marginBps);
    steps.push({ label: `Converted to ${currency} at ${rate.text}${marginBps ? `, less ${route === 'paypal' ? 'PayPal\'s' : route === 'wise' ? 'Wise\'s' : route === 'payoneer' ? 'Payoneer\'s' : 'the'} ${pctText(marginBps)} ${route === 'paypal' ? 'conversion fee above the base rate' : 'margin'}` : ''}`, local: local(r.minor, currency), kind: 'convert', source: route === 'paypal' ? routeSource.paypal(fees, market) : rate.source });
    if (localFeeRule) steps.push({ label: localFeeRule.kind === 'fixed' ? `PayPal bank withdrawal fee (${local(BigInt(Math.round(Number(localFeeRule.fee) * 100)), localFeeRule.currency)} per withdrawal${n > 1 ? ` x ${n}` : ''})` : `PayPal bank withdrawal fee (${local(BigInt(Math.round(Number(localFeeRule.fee) * 100)), localFeeRule.currency)} when a withdrawal is under ${local(BigInt(Math.round(Number(localFeeRule.threshold) * 100)), localFeeRule.currency)}; none above it)`, local: local(-r.bankFee, currency), kind: 'bank', source: routeSource.paypal(fees, market) });
    out.local = { currency, rate: rateText(rate.micros), rateText: rate.text, rateSource: rate.ref ? { source: rate.ref.source, date: rate.ref.date } : 'entered', marginPercent: pctText(marginBps), amount: local(r.final, currency), value: plainLocal(r.final) };
    out.netPercent = pctOfRef(r.final);
    const via = route === 'paypal' ? ` through PayPal at its published ${pctText(marginBps)} conversion fee` : route === 'skydo' ? ' through Skydo' : route === 'wise' ? ` through Wise${marginBps ? ` at a ${pctText(marginBps)} conversion fee` : ''}` : route === 'bank' ? `${marginBps ? ` at a ${pctText(marginBps)} bank margin` : ' at the reference rate'}` : '';
    out.answer = `${usd(gross.cents)} billed at a ${pctText(pf.bps)} ${pf.platform === 'upwork' ? 'Upwork' : 'Freelancer.com'} fee leaves ${usd(afterFee)}${pw.total ? `, ${usd(afterFee - pw.total)} after the withdrawal fee` : ''}; converted${via}, about ${local(r.final, currency)} reaches the bank at ${rateText(rate.micros)} ${currency} per dollar (${out.netPercent} of the gross at that rate).`;
  }
  out.steps = steps.map(showStep);
  out.sources = dedupe(sources);
  return out;
}

const showStep = (s) => ({ label: s.label, ...(s.usd !== undefined ? { usd: usd(s.usd) } : {}), ...(s.local !== undefined ? { local: s.local } : {}), ...(s.basis ? { basis: s.basis } : {}), ...(s.source ? { source: s.source } : {}) });
const dedupe = (list) => { const seen = new Set(); return list.filter((s) => s && !seen.has(s.text) && seen.add(s.text)); };

// ---------- rate: what to bill to keep a target ----------

// The smallest gross (cents) whose net, after the fee, a share of fixed fees and a margin, is at
// least the target. Exact: compared as whole numbers, then stepped a cent at a time from an estimate.
function grossNeeded(target, feeFn, fixedShare, marginBps) {
  const ok = (g) => (g - feeFn(g) - fixedShare) * (10000 - marginBps) >= target * 10000;
  const denomFee = 1 - feeFn(1_000_000) / 1_000_000;
  let g = Math.max(1, Math.floor(((target * 10000) / (10000 - marginBps) + fixedShare) / (denomFee || 1)) - 3);
  let guard = 0;
  while (!ok(g)) { g += 1; if (++guard > 10000) throw new FeeError('Could not work out the rate for these numbers.', 'target'); }
  while (g > 1 && ok(g - 1)) g -= 1;
  return g;
}

export function rate(input, ctx) {
  const fees = ctx.fees;
  const target = toCents(input.target, 'target', { min: 1, max: 100_000_00, label: 'The target you want to keep' });
  const platform = input.platform ?? 'upwork';
  const per = input.per ?? 'hour';
  if (!['hour', 'payment'].includes(per)) throw new FeeError('per is hour or payment.', 'per');
  const marginBps = input.marginPercent === undefined ? 0 : toBps(input.marginPercent, 'marginPercent', { max: 1000, label: 'The conversion margin' });
  const fixed = input.fixedFee === undefined ? 0 : toCents(input.fixedFee, 'fixedFee', { max: 1000_00, label: 'The fixed fee per payment' });
  let fixedShare = fixed;
  let hoursText = null;
  if (per === 'hour' && fixed) {
    const h = toBps(input.hoursPerPayment ?? '', 'hoursPerPayment', { min: 1, max: 1000_00, label: 'Hours per payment' });
    fixedShare = Math.ceil((fixed * 100) / h);
    hoursText = h % 100 ? (h / 100).toFixed(2) : String(h / 100);
  }
  let feeFn; let feeText; let bps = null; let assumed = false;
  if (platform === 'upwork') {
    ({ bps, assumed } = serviceFeeBps(input, fees));
    feeFn = (g) => pctOf(g, bps);
    feeText = `a ${pctText(bps)} Upwork service fee`;
  } else if (platform === 'freelancer-com') {
    const fl = fees.freelancerCom.freelancer;
    if (per === 'hour') { bps = fl.hourlyPercent * 100; feeFn = (g) => pctOf(g, bps); feeText = `Freelancer.com's ${fl.hourlyPercent}% hourly fee`; }
    else { bps = fl.fixedPercent * 100; const min = toCents(fl.fixedMinimum, 'm'); feeFn = (g) => Math.min(g, Math.max(pctOf(g, bps), min)); feeText = `Freelancer.com's ${fl.fixedPercent}% (at least ${usd(min)}) fixed-price fee`; }
  } else throw new FeeError(`platform is one of ${PLATFORMS.join(', ')}.`, 'platform');
  const gross = grossNeeded(target, feeFn, fixedShare, marginBps);
  const unit = per === 'hour' ? 'an hour' : 'a payment';
  const extras = [fixed ? `${usd(fixed)} per payment${hoursText ? ` spread over ${hoursText} hours` : ''}` : null, marginBps ? `a ${pctText(marginBps)} conversion margin` : null].filter(Boolean);
  const byFee = platform === 'upwork' ? [0, 500, 1000, 1500].map((b) => ({ feePercent: pctText(b), gross: usd(grossNeeded(target, (g) => pctOf(g, b), fixedShare, marginBps)) })) : null;
  return {
    target: usd(target), per, platform, feePercent: pctText(bps), marginPercent: pctText(marginBps), fixedFee: usd(fixed),
    gross: usd(gross), grossValue: plainUsd(gross),
    keeps: usd(Math.floor(((gross - feeFn(gross) - fixedShare) * (10000 - marginBps)) / 10000)),
    formula: `gross = (target / (1 - margin) + fixed share) / (1 - fee), rounded up to the cent`,
    byFee,
    flags: assumed ? ['No service fee was given, so 10% (where Upwork\'s own calculator starts) is used.'] : [],
    answer: `To keep ${usd(target)} ${unit} after ${feeText}${extras.length ? ` and ${extras.join(' and ')}` : ''}, bill ${usd(gross)} ${unit}.`,
    sources: [platform === 'upwork' ? upworkSource(fees) : flSource(fees)],
  };
}

// ---------- Connects ----------

export function connects(input, ctx) {
  const fees = ctx.fees;
  const int = (v, field, label, min, max) => {
    const n = Number(v);
    if (v === undefined || v === null || String(v).trim() === '' || !Number.isInteger(n) || n < min || n > max) throw new FeeError(`${label} is a whole number from ${min} to ${max}.`, field);
    return n;
  };
  const per = int(input.connectsPerProposal, 'connectsPerProposal', 'Connects per proposal', 1, 200);
  const proposals = int(input.proposals, 'proposals', 'Proposals', 1, 100_000);
  const wins = int(input.wins ?? 0, 'wins', 'Jobs won', 0, proposals);
  const price = toCents(fees.upwork.connectPrice, 'price');
  const totalConnects = per * proposals;
  const cost = totalConnects * price;
  const perWin = wins ? Math.floor((cost + Math.floor(wins / 2)) / wins) : null;
  const out = {
    connectPrice: usd(price), connectsPerProposal: per, proposals, wins, connects: totalConnects,
    perProposal: usd(per * price), cost: usd(cost), perWin: perWin === null ? null : usd(perWin),
    winRate: pctText(Math.floor((wins * 10000) / proposals)),
    sources: [{ text: `${fees.upwork.sources.connects.name} (read ${longDate(fees.readOn)})`, href: fees.upwork.sources.connects.url }],
    flags: [],
  };
  if (input.contractValue !== undefined && wins) {
    const value = toCents(input.contractValue, 'contractValue', { min: 1, label: 'The average won contract' });
    const { bps } = serviceFeeBps(input, fees);
    const billed = value * wins;
    const fee = pctOf(value, bps) * wins;
    const shareBps = Math.floor((cost * 10000) / billed);
    out.contractValue = usd(value);
    out.feePercent = pctText(bps);
    out.connectsShare = pctText(shareBps);
    out.netAfterFeeAndConnects = usd(billed - fee - cost);
    out.effectivePercent = pctText(Math.floor(((fee + cost) * 10000) / billed));
    if (input.feePercent === undefined) out.flags.push('No service fee was given, so 10% (where Upwork\'s own calculator starts) is used.');
  }
  out.answer = `${proposals} proposal${proposals === 1 ? '' : 's'} at ${per} Connects each use ${totalConnects} Connects, ${usd(cost)} at ${usd(price)} a Connect (${usd(per * price)} a proposal)${wins ? `; with ${wins} job${wins === 1 ? '' : 's'} won that is ${usd(perWin)} per win${out.connectsShare ? `, ${out.connectsShare} of the ${usd(toCents(input.contractValue, 'contractValue'))} average contract, and ${out.effectivePercent} with the ${out.feePercent} service fee` : ''}` : ''}.`;
  return out;
}

// ---------- schedule: fixed fees a year by how often you withdraw ----------

export function schedule(input, ctx) {
  const fees = ctx.fees;
  let each; let what; let source = null;
  if (input.method !== undefined) {
    const presets = presetFixedFees(fees);
    const p = presets.find((x) => x.id === input.method);
    if (!p) throw new FeeError(`method is one of ${presets.map((x) => x.id).join(', ')}, or give feePerWithdrawal.`, 'method');
    each = p.cents; what = p.label; source = p.source;
    if (input.feePerWithdrawal !== undefined) throw new FeeError('Give a method or a fee per withdrawal, not both.', 'feePerWithdrawal');
  } else {
    each = toCents(input.feePerWithdrawal, 'feePerWithdrawal', { min: 1, max: 1000_00, label: 'The fee per withdrawal' });
    what = `${usd(each)} per withdrawal`;
  }
  const monthly = input.monthlyAmount === undefined ? null : toCents(input.monthlyAmount, 'monthlyAmount', { min: 1, label: 'The amount you withdraw a month' });
  const rows = SCHEDULES.map((s) => {
    const cost = each * s.perYear;
    return { schedule: s.label, id: s.id, perYear: s.perYear, cost: usd(cost), costValue: plainUsd(cost), share: monthly ? pctText(Math.floor((cost * 10000) / (monthly * 12))) : null };
  });
  const saving = each * (52 - 12);
  return {
    feePerWithdrawal: usd(each), what, monthlyAmount: monthly === null ? null : usd(monthly), rows,
    weeklyVsMonthly: usd(saving),
    breakEven: usd(each * 100), // the withdrawal size at which the fixed fee is 1%
    answer: `At ${what}, withdrawing weekly costs ${rows[0].cost} a year and monthly ${rows[3].cost}, so monthly saves ${usd(saving)}${monthly ? ` (${rows[0].share} vs ${rows[3].share} of ${usd(monthly * 12)} a year)` : ''}; the fee is under 1% of any withdrawal above ${usd(each * 100)}.`,
    sources: source ? [source] : [],
  };
}

// The fixed per-withdrawal fees we could read on the companies' own pages, in dollars.
export function presetFixedFees(fees) {
  const fl = Object.entries(fees.freelancerCom.withdrawal).map(([id, r]) => ({ id: `freelancer-com-${id}`, label: `Freelancer.com ${r.label} (${usd(toCents(r.fee, 'f'))})`, cents: toCents(r.fee, 'f'), source: { text: `${fees.freelancerCom.name} (read ${longDate(fees.readOn)})`, href: fees.freelancerCom.url } }));
  return [
    ...fl,
    { id: 'wise-usd-wire', label: `Wise, receiving a USD wire (${usd(toCents(fees.wise.receiveUsdWire, 'w'))})`, cents: toCents(fees.wise.receiveUsdWire, 'w'), source: { text: `${fees.wise.name} (read ${longDate(fees.readOn)})`, href: fees.wise.url } },
    { id: 'payoneer-local', label: 'Payoneer, to a bank in the same country and currency, e.g. USA to USA ($1.50)', cents: 150, source: { text: `${fees.payoneer.name} (read ${longDate(fees.readOn)})`, href: fees.payoneer.url } },
  ];
}

// ---------- statement: a list of payments, each worked out the same way ----------

export function statement(input, ctx) {
  const list = input.payments;
  if (!Array.isArray(list) || !list.length) throw new FeeError('payments is a list of at least one payment.', 'payments');
  if (list.length > LIMITS.maxPayments) throw new FeeError(`At most ${LIMITS.maxPayments} payments in one statement.`, 'payments');
  const shared = { ...input };
  delete shared.payments;
  delete shared.op;
  const rows = [];
  let gross = 0; let fee = 0; let usdLeft = 0; let localTotal = 0n; let currency = null; let ranged = false;
  list.forEach((p, i) => {
    if (!p || typeof p !== 'object') throw new FeeError(`Payment ${i + 1} must be { amount, date?, feePercent?, note? }.`, 'payments');
    if (p.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(String(p.date))) throw new FeeError(`Payment ${i + 1}: date must be written like 2026-11-08.`, 'payments');
    let r;
    try {
      r = net({ ...shared, amount: p.amount, feePercent: p.feePercent ?? shared.feePercent, hourlyRate: undefined, hours: undefined }, ctx);
    } catch (e) {
      if (e instanceof FeeError) throw new FeeError(`Payment ${i + 1}: ${e.message}`, 'payments');
      throw e;
    }
    const c = (s) => toCents(s.replace('-', ''), 'x');
    gross += c(r.gross); fee += c(r.platformFee); usdLeft += c(r.usdBeforeConversion);
    if (r.local) {
      currency = r.local.currency;
      if (r.local.value) localTotal += BigInt(Math.round(Number(r.local.value) * 100));
      else ranged = true;
    }
    rows.push({ n: i + 1, date: p.date ?? '', note: p.note ? String(p.note).slice(0, 80) : '', gross: r.gross, feePercent: r.feePercent, platformFee: r.platformFee, withdrawalFee: r.withdrawalFee, usd: r.usdBeforeConversion, local: r.local ? (r.local.amount ?? `${r.local.low} to ${r.local.high}`) : null, localValue: r.local ? (r.local.value ?? `${r.local.lowValue} to ${r.local.highValue}`) : null });
  });
  const columns = ['n', 'date', 'note', 'gross_usd', 'fee_percent', 'platform_fee_usd', 'withdrawal_fee_usd', 'usd_before_conversion', ...(currency ? [`net_${currency.toLowerCase()}`] : [])];
  const csvRows = rows.map((r) => [r.n, r.date, r.note, r.gross.replace(/[$,]/g, ''), r.feePercent, r.platformFee.replace(/[$,]/g, ''), r.withdrawalFee.replace(/[$,]/g, ''), r.usd.replace(/[$,]/g, ''), ...(currency ? [r.localValue] : [])]);
  const cell = (v) => { const s = String(v); const t = /^[=+\-@]/.test(s) && !/^-?\d+(\.\d+)?$/.test(s) ? `'${s}` : s; return /[",\r\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t; };
  const csv = [columns, ...csvRows].map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';
  return {
    payments: rows.length, rows,
    totals: { gross: usd(gross), platformFees: usd(fee), usdBeforeConversion: usd(usdLeft), ...(currency && !ranged ? { local: local(localTotal, currency) } : {}) },
    csv,
    answer: `${rows.length} payment${rows.length === 1 ? '' : 's'}: ${usd(gross)} billed, ${usd(fee)} in platform fees, ${usd(usdLeft)} before conversion${currency && !ranged ? `, ${local(localTotal, currency)} to the bank` : ''}.`,
  };
}

// ---------- the dated fee tables ----------

export function feeTables(ctx) {
  const f = ctx.fees;
  return {
    readOn: f.readOn,
    upwork: { serviceFee: `${f.upwork.serviceFee.minPercent}% to ${f.upwork.serviceFee.maxPercent}% per contract`, connect: usd(toCents(f.upwork.connectPrice, 'c')), quotes: f.upwork.quotes, notRead: f.upwork.notRead, sources: f.upwork.sources },
    freelancerCom: { freelancer: f.freelancerCom.freelancer, employer: f.freelancerCom.employer, withdrawal: f.freelancerCom.withdrawal, minimumWithdrawalAfterFees: f.freelancerCom.minimumWithdrawalAfterFees, url: f.freelancerCom.url },
    paypal: Object.fromEntries(Object.entries(f.paypal.markets).map(([k, m]) => [k, { conversionPercent: m.conversionPercent, row: m.row, bank: m.bank.text, updated: m.updated, url: m.url }])),
    payoneer: { conversion: `${f.payoneer.conversionMinPercent}% to ${f.payoneer.conversionMaxPercent}%`, annualAccountFee: f.payoneer.annualAccountFee, quotes: f.payoneer.quotes, updated: f.payoneer.updated, url: f.payoneer.url },
    wise: { quotes: f.wise.quotes, url: f.wise.url },
    skydo: { tiers: f.skydo.tiers, gstPercent: f.skydo.gstPercent, quotes: f.skydo.quotes, url: f.skydo.url },
    answer: `Fees read on each company's own page on ${longDate(f.readOn)}. Upwork's withdrawal and client fees could not be read and are left out.`,
  };
}

export function compute(input, ctx) {
  const op = input.op ?? 'net';
  if (op === 'net') return net(input, ctx);
  if (op === 'rate') return rate(input, ctx);
  if (op === 'connects') return connects(input, ctx);
  if (op === 'schedule') return schedule(input, ctx);
  if (op === 'statement') return statement(input, ctx);
  if (op === 'fees') return feeTables(ctx);
  throw new FeeError('op is net, rate, connects, schedule, statement or fees.', 'op');
}
