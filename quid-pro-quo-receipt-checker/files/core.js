// The quid pro quo receipt checker's engine. Pure and dependency-free: the browser loads this same
// file, so it imports nothing and touches no Node API. The rules it applies (the $75 disclosure, the
// $10 penalty and its $5,000 cap, the $250 acknowledgment, each year's insubstantial benefit limits
// and the raffle prize reporting thresholds) are passed in by makeEngine from the data files, which
// quote irs.gov; nothing here holds a dollar figure of its own.
//
// Money is whole cents (integers) throughout. The fair market value of anything is the
// organization's good faith estimate, entered by the user; the engine never invents one.

export class QpqError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'QpqError';
    this.field = field;
  }
}

// ---------- dates ----------

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function isRealDate(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s));
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}
export const longDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}, ${iso.slice(0, 4)}`;
export const weekdayOf = (iso) => WEEKDAYS[new Date(`${iso}T00:00:00Z`).getUTCDay()];

// ---------- money ----------

const grouped = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// Cents to "$1,234.50".
export function money(cents) {
  const abs = Math.abs(cents);
  return `${cents < 0 ? '-' : ''}$${grouped(String(Math.floor(abs / 100)))}.${String(abs % 100).padStart(2, '0')}`;
}
// Cents to "$139" when whole, else "$13.90" (the way the revenue procedures print limits).
export const short = (cents) => (cents % 100 === 0 ? `$${grouped(String(cents / 100))}` : money(cents));
// "1234.50" for a CSV cell.
export const plain = (cents) => money(cents).replace(/[$,]/g, '');

// A dollar amount as a number or text ("150", "$1,250.00", "USD 40") to cents, or null. More than
// two decimals are refused rather than rounded; negative amounts are refused.
export function centsOf(value) {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value < 0) return null;
    const c = Math.round(value * 100);
    return Math.abs(c - value * 100) < 1e-6 && Number.isSafeInteger(c) ? c : null;
  }
  if (typeof value !== 'string') return null;
  const s = value.trim().replace(/^(?:USD|US\$)\s*/i, '').replace(/\s*USD$/i, '').replace(/^\$\s*/, '').replace(/,(?=\d{3}(?:\D|$))/g, '');
  const m = /^(\d+)(?:\.(\d{0,2}))?$/.exec(s);
  if (!m) return null;
  const c = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0') || 0);
  return Number.isSafeInteger(c) ? c : null;
}
const need = (value, label, field) => {
  const c = centsOf(value);
  if (c === null) throw new QpqError(`${label} must be a dollar amount such as 150 or 150.00.`, field);
  return c;
};

// ---------- CSV ----------

// RFC 4180 text to rows of cells; the delimiter is the first of tab, semicolon or comma found
// outside quotes in the header line. Blank lines are dropped.
export function parseCsv(text) {
  const src = String(text ?? '').replace(/^﻿/, '');
  const outside = (src.split(/\r?\n/, 1)[0] ?? '').replace(/"[^"]*"/g, '');
  const delim = outside.includes('\t') ? '\t' : outside.includes(';') && !outside.includes(',') ? ';' : ',';
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
const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
export const csvText = (columns, rows) => `${[columns, ...rows].map((r) => r.map(csvCell).join(',')).join('\r\n')}\r\n`;

// ---------- vocabulary ----------

// What the payment was for. 'donation' is a gift that may come with a premium (a tote, a mug).
export const KINDS = ['ticket', 'auction', 'raffle', 'sponsorship', 'membership', 'donation'];
export const KIND_LABELS = { ticket: 'Event ticket', auction: 'Auction purchase', raffle: 'Raffle or game of chance', sponsorship: 'Sponsorship', membership: 'Annual membership', donation: 'Donation with a premium or thank-you gift' };
// What the donor got back.
//   goods-services        a dinner, a show, a round of golf, an auction item, a stay: its value counts
//   logo-item             an item bearing the organization's name or logo (mug, tote, calendar): its
//                         cost to the organization decides the token test
//   membership-privilege  free or discounted admission, parking, gift-shop discounts a member can use often
//   member-event          admission to a members-only event: its cost per person decides
//   religious             an intangible religious benefit (religious organizations only)
//   recognition           a sponsor's name or logo shown (sponsorships only)
//   advertising           a sponsor's advertisement (qualitative or comparative language, prices, endorsements)
export const BENEFIT_TYPES = ['goods-services', 'logo-item', 'membership-privilege', 'member-event', 'religious', 'recognition', 'advertising'];
export const BENEFIT_LABELS = {
  'goods-services': 'Goods or services (dinner, show, golf, auction item)',
  'logo-item': 'Item with our name or logo (mug, tote, calendar)',
  'membership-privilege': 'Membership privilege (free admission, parking, discounts)',
  'member-event': 'Members-only event',
  religious: 'Intangible religious benefit',
  recognition: 'Sponsor name or logo shown',
  advertising: 'Advertising for the sponsor',
};
export const EXCEPTIONS = {
  'token-2-percent': 'insubstantial value: worth no more than 2% of the payment or the year\'s cap, whichever is less',
  'token-logo-items': 'insubstantial value: only items with the organization\'s name or logo, costing in all no more than the year\'s low-cost article limit, for a payment of at least the year\'s minimum',
  membership: 'annual membership benefits for a payment of $75 or less',
  religious: 'only intangible religious benefits from a religious organization',
  recognition: 'the sponsor\'s name or logo acknowledged, which is not a return benefit',
  'no-donative-element': 'no donative element: the payment is no more than the value received',
  raffle: 'a raffle or game of chance is not a charitable contribution',
};

const lc = (s) => String(s ?? '').toLowerCase();
const list = (items) => (items.length <= 1 ? items.join('') : items.length === 2 ? `${items[0]} and ${items[1]}` : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`);

// ---------- the engine ----------

// rules: { thresholds: { quidProQuoUsd, acknowledgmentUsd, penaltyPerContributionUsd,
//          penaltyCapPerEventUsd }, limits: { year: { lowCost, minGift, cap, source } },
//          gaming: { year: { reportUsd, source } }, sources?: { id: { title, url } } }
export function makeEngine(rules) {
  const TH = rules.thresholds;
  const QPQ = Math.round(TH.quidProQuoUsd * 100);
  const ACK = Math.round(TH.acknowledgmentUsd * 100);
  const PENALTY = Math.round(TH.penaltyPerContributionUsd * 100);
  const PENALTY_CAP = Math.round(TH.penaltyCapPerEventUsd * 100);
  const YEARS = Object.keys(rules.limits).map(Number).sort((a, b) => a - b);
  const LIMITS = Object.fromEntries(Object.entries(rules.limits).map(([y, l]) => [y, {
    year: Number(y), lowCost: centsOf(l.lowCost), minGift: centsOf(l.minGift), cap: centsOf(l.cap), source: l.source,
  }]));
  const GAMING = Object.fromEntries(Object.entries(rules.gaming ?? {}).map(([y, g]) => [y, { year: Number(y), report: centsOf(g.reportUsd), source: g.source }]));

  function limitsFor(year) {
    const l = LIMITS[year];
    if (!l) throw new QpqError(`The insubstantial benefit limits are known for ${YEARS[0]} to ${YEARS[YEARS.length - 1]} (each year's IRS revenue procedure); ${year} is not one of them.`, 'year');
    return l;
  }

  // One benefit, validated: { what, type, value (cents or null), cost (cents or null) }.
  function readBenefit(b, i, kind, org) {
    const f = `benefits.${i}`;
    const what = String(b.what ?? '').trim();
    if (!what) throw new QpqError(`Benefit ${i + 1}: say what the donor received (for example "dinner and dance").`, f);
    const type = b.type ?? 'goods-services';
    if (!BENEFIT_TYPES.includes(type)) throw new QpqError(`Benefit ${i + 1}: type is one of ${BENEFIT_TYPES.join(', ')}.`, f);
    if (type === 'religious' && !org.religious) throw new QpqError(`Benefit ${i + 1}: an intangible religious benefit comes only from an organization organized exclusively for religious purposes; set org.religious if yours is one, or describe the benefit as goods or services.`, f);
    if ((type === 'recognition' || type === 'advertising') && kind !== 'sponsorship') throw new QpqError(`Benefit ${i + 1}: ${type} applies to a sponsorship; set kind to "sponsorship".`, f);
    const value = b.value === undefined || b.value === null || b.value === '' ? null : need(b.value, `Benefit ${i + 1}'s value`, f);
    const cost = b.cost === undefined || b.cost === null || b.cost === '' ? null : need(b.cost, `Benefit ${i + 1}'s cost`, f);
    if (type === 'logo-item' && cost === null) throw new QpqError(`Benefit ${i + 1}: give what the logo item cost your organization (cost); the token test uses cost, not value.`, f);
    if (type === 'member-event' && cost === null && value === null) throw new QpqError(`Benefit ${i + 1}: give the members-only event's cost per person (cost).`, f);
    if (['goods-services', 'advertising'].includes(type) && value === null) throw new QpqError(`Benefit ${i + 1}: give your good faith estimate of its fair market value (value). The checker never guesses one.`, f);
    return { what, type, value, cost };
  }

  // The rules applied to one payment. input: { year, kind, payment, benefits[], org: { name?,
  // religious? } }. Returns what is deductible, whether a disclosure is required and why.
  function assess(input) {
    const year = Number(input.year);
    const lim = limitsFor(year);
    const kind = input.kind ?? 'ticket';
    if (!KINDS.includes(kind)) throw new QpqError(`kind is one of ${KINDS.join(', ')}.`, 'kind');
    const org = input.org ?? {};
    const payment = need(input.payment, 'The payment', 'payment');
    if (payment === 0) throw new QpqError('The payment must be more than $0.00.', 'payment');
    const benefits = (input.benefits ?? []).map((b, i) => readBenefit(b, i, kind, org));
    const base = { year, kind, payment, benefits, limits: lim, qpqThreshold: QPQ };

    if (kind === 'raffle') {
      return {
        ...base, contribution: false, counted: 0, deductible: 0, disregarded: benefits, exception: 'raffle',
        disclosureRequired: false, acknowledgmentRequired: false, quidProQuo: false,
        reasons: ['Amounts paid for raffle or lottery tickets, bingo or other games of chance are not deductible charitable contributions (IRS Publication 526), whatever the prize is worth.'],
      };
    }

    const reasons = [];
    const disregarded = [];
    let rest = [];
    let exception = null;
    const membershipOk = kind === 'membership' && payment <= QPQ;
    for (const b of benefits) {
      if (b.type === 'recognition') { disregarded.push(b); exception ??= 'recognition'; continue; }
      if (b.type === 'religious') { disregarded.push(b); exception ??= 'religious'; continue; }
      if (b.type === 'membership-privilege' && membershipOk) { disregarded.push(b); exception ??= 'membership'; continue; }
      if (b.type === 'member-event' && membershipOk && (b.cost ?? b.value) <= lim.lowCost) { disregarded.push(b); exception ??= 'membership'; continue; }
      rest.push(b);
    }
    if (benefits.some((b) => b.type === 'membership-privilege' || b.type === 'member-event') && kind === 'membership' && !membershipOk) {
      reasons.push(`The membership benefits cannot be disregarded: the membership exception covers an annual payment of $${TH.quidProQuoUsd} or less, and this one is ${money(payment)}.`);
    }
    for (const b of rest) {
      if ((b.type === 'membership-privilege' || b.type === 'member-event') && b.value === null) {
        throw new QpqError(`"${b.what}" cannot be disregarded here, so give your good faith estimate of its value (value).`, 'benefits');
      }
    }
    if (rest.length) {
      const twoPct = Math.min(Math.floor((payment * 2) / 100), lim.cap);
      const allValued = rest.every((b) => b.value !== null);
      const total = rest.reduce((s, b) => s + (b.value ?? 0), 0);
      const logoOnly = rest.every((b) => b.type === 'logo-item');
      const logoCost = rest.reduce((s, b) => s + (b.cost ?? 0), 0);
      // 2% of the payment, compared exactly (total x 100 <= payment x 2), and the year's cap.
      if (allValued && total * 100 <= payment * 2 && total <= lim.cap) {
        reasons.push(`What the donor received (${money(total)}) is no more than 2% of the payment (${money(twoPct)}) and no more than ${year}'s ${short(lim.cap)}, so it is of insubstantial value.`);
        disregarded.push(...rest); rest = []; exception = 'token-2-percent';
      } else if (logoOnly && payment >= lim.minGift && logoCost <= lim.lowCost) {
        reasons.push(`Only items with the organization's name or logo, costing ${money(logoCost)} in all (${year} limit ${money(lim.lowCost)}), for a payment of at least ${money(lim.minGift)}: they are of insubstantial value.`);
        disregarded.push(...rest); rest = []; exception = 'token-logo-items';
      } else if (logoOnly) {
        if (payment < lim.minGift) reasons.push(`The logo items are not token items: the payment (${money(payment)}) is under ${year}'s minimum of ${money(lim.minGift)}.`);
        else if (logoCost > lim.lowCost) reasons.push(`The logo items are not token items: they cost ${money(logoCost)} in all, over ${year}'s low-cost article limit of ${money(lim.lowCost)}.`);
        if (!allValued) throw new QpqError('The logo items are not of insubstantial value, so give your good faith estimate of their fair market value (value) as well as their cost.', 'benefits');
      }
    }
    const counted = rest.reduce((s, b) => s + b.value, 0);
    if (counted >= payment) {
      reasons.push(`The value received (${money(counted)}) is at least the payment (${money(payment)}): no part of it is a charitable contribution, and there is no donative element.`);
      return { ...base, contribution: false, counted, deductible: 0, disregarded, counts: rest, exception: 'no-donative-element', disclosureRequired: false, acknowledgmentRequired: false, quidProQuo: false, reasons };
    }
    const deductible = payment - counted;
    const quidProQuo = counted > 0;
    const disclosureRequired = quidProQuo && payment > QPQ;
    if (quidProQuo) {
      reasons.push(`Deductible part: ${money(payment)} paid less ${money(counted)} received = ${money(deductible)}.`);
      reasons.push(disclosureRequired
        ? `The payment is over $${TH.quidProQuoUsd} and partly for goods or services, so a written disclosure is required${deductible <= QPQ ? ', even though the deductible part is not over $75' : ''}.`
        : `The payment is not over $${TH.quidProQuoUsd} (a payment of exactly $${TH.quidProQuoUsd}.00 needs no disclosure), so no disclosure is required; the receipt should still give the value and the deductible part.`);
    } else if (exception) {
      reasons.push(`Nothing received counts (${EXCEPTIONS[exception]}), so the full ${money(payment)} is the contribution and no disclosure is required.`);
    } else {
      reasons.push(`Nothing was received in return, so the full ${money(payment)} is the contribution.`);
    }
    const acknowledgmentRequired = deductible >= ACK;
    if (acknowledgmentRequired) reasons.push(`The contribution is $${TH.acknowledgmentUsd} or more, so the donor needs a written acknowledgment before filing: the receipt below carries its elements.`);
    return { ...base, contribution: true, counted, deductible, disregarded, counts: rest, exception: quidProQuo ? null : exception, disclosureRequired, acknowledgmentRequired, quidProQuo, reasons };
  }

  // ---------- wording ----------

  const whatOf = (bs) => list(bs.map((b) => b.what));
  // The receipt sentence(s) for an assessment. ctx: { org, event, date, donor }.
  function wording(a, ctx = {}) {
    const orgName = ctx.org?.name || '[organization name]';
    const event = ctx.event ? ` for ${ctx.event}` : '';
    const on = ctx.date ? ` on ${longDate(ctx.date)}` : '';
    const p = money(a.payment);
    const out = [];
    let solicitation = null;
    if (a.exception === 'raffle') {
      out.push(`Thank you for supporting ${orgName}${event}. The ${p} you paid${on} for raffle tickets is not deductible as a charitable contribution for federal income tax purposes, because raffle tickets are a chance to win a prize.`);
      solicitation = `Raffle tickets are not tax-deductible charitable contributions.`;
    } else if (a.exception === 'no-donative-element') {
      out.push(`Thank you for your payment of ${p} to ${orgName}${event}${on}. In exchange you received ${whatOf(a.counts)}, with an estimated fair market value of ${money(a.counted)}. Because your payment is not more than that value, no part of it is deductible as a charitable contribution.`);
    } else if (a.quidProQuo) {
      const extra = a.disregarded.filter((b) => b.type === 'religious').length ? ` You also received intangible religious benefits.` : '';
      out.push(`Thank you for your payment of ${p} to ${orgName}${event}${on}. In exchange for your payment you received ${whatOf(a.counts)}, with an estimated fair market value of ${money(a.counted)}.${extra} The amount of your contribution that is deductible for federal income tax purposes is limited to the excess of your payment over the value of the goods and services we provided: ${money(a.deductible)}.`);
      if (a.disregarded.some((b) => b.type === 'recognition')) out.push(`Our acknowledgment of your name or logo (${whatOf(a.disregarded.filter((b) => b.type === 'recognition'))}) is not a return benefit and is not included in that value.`);
      solicitation = `Of each ${p} payment, ${money(a.counted)} is our good faith estimate of the fair market value of ${whatOf(a.counts)}; the amount deductible for federal income tax purposes is limited to ${money(a.deductible)}.`;
    } else if (a.exception === 'religious') {
      out.push(`Thank you for your contribution of ${p} to ${orgName}${event}${on}. ${orgName} provided only intangible religious benefits in exchange for your contribution.`);
    } else if (a.exception === 'membership') {
      out.push(`Thank you for your membership payment of ${p} to ${orgName}${on}. Your annual membership benefits (${whatOf(a.disregarded.filter((b) => b.type === 'membership-privilege' || b.type === 'member-event'))}) are disregarded under IRS rules for an annual payment of $${TH.quidProQuoUsd} or less, so no goods or services were provided in exchange for your contribution. The full ${p} is deductible for federal income tax purposes.`);
    } else if (a.exception === 'token-2-percent' || a.exception === 'token-logo-items') {
      out.push(`Thank you for your contribution of ${p} to ${orgName}${event}${on}. No goods or services were provided in exchange for your contribution, other than ${whatOf(a.disregarded)} of insubstantial value under IRS guidelines. The full ${p} is deductible for federal income tax purposes.`);
    } else if (a.exception === 'recognition') {
      out.push(`Thank you for your sponsorship payment of ${p} to ${orgName}${event}${on}. In return we acknowledged your name or logo (${whatOf(a.disregarded)}); no other goods or services were provided in exchange for your payment.`);
    } else {
      out.push(`Thank you for your contribution of ${p} to ${orgName}${event}${on}. No goods or services were provided in exchange for your contribution.`);
    }
    return { receipt: out.join(' '), solicitation };
  }

  // A corrected receipt for one already sent without the disclosure (or with a wrong sentence).
  function correction(a, ctx = {}) {
    const orgName = ctx.org?.name || '[organization name]';
    const sent = ctx.sentOn ? ` dated ${longDate(ctx.sentOn)}` : '';
    const w = wording(a, ctx).receipt;
    return `This corrects our receipt${sent} for your payment of ${money(a.payment)}${ctx.event ? ` for ${ctx.event}` : ''}. ${w} Please keep this corrected receipt with your tax records in place of the earlier one. ${orgName}`;
  }

  // ---------- checking the user's own text ----------

  const amountsIn = (text) => new Set([...String(text).matchAll(/\$\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?/g)].map((m) => Number(m[1].replace(/,/g, '')) * 100 + Number(m[2] ?? 0)));
  const RE = {
    deductible: /\bdeductib(?:le|ility)\b/i,
    limited: /\blimited to\b|\bless (?:the )?(?:fair market )?value\b|\bin excess of\b|\bexcess of\b/i,
    estimate: /fair market value|\bFMV\b|estimated value|good[- ]faith estimate|value of (?:the |your )?(?:goods|services|benefits?|dinner|meal|ticket|item|package|event)|valued at|worth/i,
    ngs: /no (?:goods (?:or|and|\/) services|goods|services|benefits?)\b[^.]{0,60}?\b(?:were|was|have been|has been)?\s*(?:provided|received|given|exchanged)|nothing (?:was |has been )?(?:provided|received|given) in (?:return|exchange)/i,
    full: /\b(?:fully|100\s?%|entirely|completely|wholly)\s+(?:tax[- ])?deductible|\bfull (?:amount|payment|price)[^.]{0,40}\b(?:is|are) (?:tax[- ])?deductible|\bentire (?:amount|payment|price)[^.]{0,40}\b(?:is|are) (?:tax[- ])?deductible/i,
    notDeductible: /\b(?:not|non|isn't|is not|are not|aren't|cannot be)[- ](?:tax[- ])?deductible|\bnot (?:a )?(?:tax[- ]deductible )?charitable contributions?\b|\bno (?:part|portion)\b[^.]{0,40}\bdeductible/i,
    religious: /intangible religious benefits?/i,
    date: /\b(?:\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.? \d{1,2},? \d{4})\b/i,
  };

  // The receipt text checked against what this payment needs. Each check: { id, label, status:
  // 'pass' | 'fail' | 'warn' | 'note', detail }. ctx: { org }.
  function checkText(a, text, ctx = {}) {
    const t = String(text ?? '');
    const amounts = amountsIn(t);
    const has = (c) => amounts.has(c);
    const checks = [];
    const add = (id, label, ok, detail, failAs = 'fail') => checks.push({ id, label, status: ok ? 'pass' : failAs, detail });
    const saysNgs = RE.ngs.test(t);
    const saysFull = RE.full.test(t);
    const saysNot = RE.notDeductible.test(t);
    // "deductible" not inside a "not deductible" phrase.
    const claimsDeductible = RE.deductible.test(t.replace(new RegExp(RE.notDeductible.source, 'gi'), ''));

    if (a.exception === 'raffle') {
      add('raffle-not-deductible', 'Does not call raffle tickets deductible', !(claimsDeductible && !saysNot) && !saysFull,
        claimsDeductible && !saysNot ? 'The text calls the payment deductible; raffle tickets are not a charitable contribution (IRS Publication 526).' : 'The text does not present the raffle payment as deductible.');
      add('raffle-says-so', 'Says the tickets are not deductible', saysNot, saysNot ? 'The text says the payment is not deductible.' : 'Not required by the IRS, but saying so stops donors from claiming it.', 'warn');
    } else if (a.quidProQuo || a.exception === 'no-donative-element') {
      const req = a.disclosureRequired ? 'fail' : 'warn';
      add('estimate', `Gives the good faith estimate of what was received (${money(a.counted)})`, RE.estimate.test(t) && has(a.counted),
        RE.estimate.test(t) && has(a.counted) ? `The text gives ${money(a.counted)} as the value received.` : has(a.counted) ? `${money(a.counted)} appears, but not as the value of what the donor received.` : `${money(a.counted)} does not appear: the disclosure must give a good faith estimate of the fair market value of the goods or services.`, req);
      const deductOk = a.exception === 'no-donative-element' ? (saysNot || (RE.deductible.test(t) && has(0))) : (RE.deductible.test(t) && (has(a.deductible) || RE.limited.test(t)));
      add('deductible-limit', a.exception === 'no-donative-element' ? 'Says no part is deductible' : `States that the deductible amount is limited (${money(a.deductible)})`, deductOk,
        deductOk ? 'The text tells the donor how much is deductible.' : a.exception === 'no-donative-element' ? 'The text should say that no part of the payment is deductible.' : 'The disclosure must tell the donor that the deductible amount is limited to the payment less the value received.', req);
      add('no-ngs-claim', 'Does not say "no goods or services"', !saysNgs, saysNgs ? 'The text says no goods or services were provided, but the donor received something of value.' : 'No conflicting "no goods or services" sentence.');
      add('no-full-claim', 'Does not call the whole payment deductible', !saysFull, saysFull ? 'The text calls the full payment deductible; only the excess over the value received is.' : 'No "fully deductible" claim.');
    } else {
      if (a.exception === 'religious') {
        add('religious', 'Says only intangible religious benefits were provided', RE.religious.test(t), RE.religious.test(t) ? 'The text uses the intangible religious benefits sentence.' : 'Use the sentence that only intangible religious benefits were provided (IRS Publication 1771); "no goods or services" is not accurate here.');
      } else {
        add('ngs-or-amount', 'Tells the donor the deductible amount (or that no goods or services were provided)', saysNgs || saysFull || (RE.deductible.test(t) && has(a.deductible)),
          saysNgs || saysFull || (RE.deductible.test(t) && has(a.deductible)) ? 'The text tells the donor the payment is fully deductible.' : `Say that no goods or services were provided${a.exception?.startsWith('token') ? ' (the token rule requires telling the donor the deductible amount)' : ''}.`, a.exception?.startsWith('token') ? 'fail' : 'warn');
      }
    }
    if (a.acknowledgmentRequired || (a.contribution && a.payment >= ACK)) {
      add('amount', `Names the amount paid (${money(a.payment)})`, has(a.payment), has(a.payment) ? 'The amount paid appears.' : 'A written acknowledgment states the amount of a money contribution.', a.acknowledgmentRequired ? 'fail' : 'warn');
      add('date', 'Gives a date', RE.date.test(t), RE.date.test(t) ? 'A date appears.' : 'Give the date of the payment or of the receipt.', 'warn');
    }
    if (ctx.org?.name) {
      const ok = lc(t).includes(lc(ctx.org.name));
      add('org', 'Names the organization', ok, ok ? 'The organization is named.' : `"${ctx.org.name}" does not appear in the text (it may be on the letterhead).`, 'warn');
    }
    if (a.disclosureRequired) checks.push({ id: 'noticeable', label: 'Can the donor see it?', status: 'note', detail: 'The disclosure must be likely to come to the donor\'s attention; small print in a larger document might not qualify (IRS Publication 1771). Give it when you solicit or when you receive the payment.' });
    return { checks, verdict: checks.some((c) => c.status === 'fail') ? 'fix' : 'meets' };
  }

  // ---------- batch ----------

  const COLUMNS = {
    donor: ['donor', 'name', 'buyer', 'bidder', 'attendee', 'customer'],
    event: ['event', 'campaign', 'appeal', 'fundraiser'],
    payment: ['payment', 'amount', 'paid', 'price', 'ticketprice', 'winningbid', 'bid', 'total'],
    value: ['value', 'fmv', 'fairmarketvalue', 'benefitvalue', 'goodsservices', 'goodsorservices', 'goodsandservices', 'estimate', 'goodfaithestimate'],
    what: ['what', 'benefit', 'benefitdescription', 'item', 'description', 'received'],
    kind: ['kind', 'type', 'paymenttype'],
    disclosed: ['disclosed', 'disclosure', 'disclosuregiven', 'qpqdisclosure', 'statementgiven'],
  };
  const key = (s) => lc(s).replace(/[^a-z0-9]/g, '');
  const YES = /^(y|yes|true|1|given|sent|x)$/i;
  const NO = /^(n|no|false|0|missing|none)$/i;

  // rows: [{ donor, event, payment, value, what, kind, disclosed }] or csv text. Returns per-row
  // results, the totals and the penalty exposure per event.
  function batch({ year, rows, csv, event: defaultEvent, org }) {
    let list2 = rows;
    if (csv !== undefined) {
      const cells = parseCsv(csv);
      if (cells.length < 2) throw new QpqError('The CSV needs a heading line and at least one payment.', 'csv');
      const head = cells[0].map(key);
      const col = Object.fromEntries(Object.entries(COLUMNS).map(([k, names]) => [k, head.findIndex((h) => names.includes(h))]));
      if (col.payment < 0) throw new QpqError(`No payment column: name one Payment, Amount, Paid or Price (headings found: ${cells[0].join(', ')}).`, 'csv');
      list2 = cells.slice(1).map((r) => Object.fromEntries(Object.entries(col).filter(([, i]) => i >= 0).map(([k, i]) => [k, (r[i] ?? '').trim()])));
    }
    if (!list2?.length) throw new QpqError('Send at least one payment.', 'rows');
    const out = list2.map((r, i) => {
      const row = i + 1;
      const kindText = lc(r.kind).trim();
      const kind = !kindText ? 'ticket' : /raffle|lottery|bingo|50.?50|drawing|game/.test(kindText) ? 'raffle' : /auction|bid/.test(kindText) ? 'auction' : /sponsor/.test(kindText) ? 'sponsorship' : /member/.test(kindText) ? 'membership' : /donat|gift/.test(kindText) ? 'donation' : 'ticket';
      const payment = centsOf(r.payment);
      if (payment === null || payment === 0) throw new QpqError(`Row ${row}: the payment "${r.payment ?? ''}" is not a dollar amount above $0.00.`, 'rows');
      const valueText = String(r.value ?? '').trim();
      const value = valueText === '' ? 0 : centsOf(valueText);
      if (value === null) throw new QpqError(`Row ${row}: the value "${valueText}" is not a dollar amount.`, 'rows');
      const what = String(r.what ?? '').trim() || (kind === 'auction' ? 'the auction item' : kind === 'sponsorship' ? 'the sponsor benefits' : 'admission to the event');
      const a = assess({ year, kind, payment: plain(payment), benefits: value > 0 ? [{ what, type: 'goods-services', value: plain(value) }] : [] });
      const d = String(r.disclosed ?? '').trim();
      const disclosed = YES.test(d) ? true : NO.test(d) ? false : null;
      return {
        row, donor: String(r.donor ?? '').trim(), event: String(r.event ?? '').trim() || defaultEvent || '', kind, payment, value, what,
        deductible: a.deductible, disclosureRequired: a.disclosureRequired, acknowledgmentRequired: a.acknowledgmentRequired,
        disclosed, missing: a.disclosureRequired && disclosed === false, unknown: a.disclosureRequired && disclosed === null,
        sentence: wording(a, { org, event: String(r.event ?? '').trim() || defaultEvent }).receipt,
      };
    });
    const events = new Map();
    for (const r of out) {
      const e = events.get(r.event) ?? { event: r.event, rows: 0, required: 0, missing: 0, unknown: 0 };
      e.rows++; if (r.disclosureRequired) e.required++; if (r.missing) e.missing++; if (r.unknown) e.unknown++;
      events.set(r.event, e);
    }
    const exposure = [...events.values()].map((e) => ({ ...e, penalty: Math.min(e.missing * PENALTY, PENALTY_CAP), penaltyIfAllMissing: Math.min((e.missing + e.unknown) * PENALTY, PENALTY_CAP) }));
    const totals = {
      rows: out.length,
      paid: out.reduce((s, r) => s + r.payment, 0),
      deductible: out.reduce((s, r) => s + r.deductible, 0),
      disclosureRequired: out.filter((r) => r.disclosureRequired).length,
      missing: out.filter((r) => r.missing).length,
      penalty: exposure.reduce((s, e) => s + e.penalty, 0),
    };
    return { rows: out, events: exposure, totals };
  }

  const batchCsv = (b) => csvText(['row', 'donor', 'event', 'kind', 'payment', 'value_received', 'deductible', 'disclosure_required', 'disclosure_given', 'receipt_sentence'],
    b.rows.map((r) => [r.row, r.donor, r.event, r.kind, plain(r.payment), plain(r.value), plain(r.deductible), r.disclosureRequired ? 'yes' : 'no', r.disclosed === null ? '' : r.disclosed ? 'yes' : 'no', r.sentence]));

  // ---------- raffle prizes ----------

  // Whether a raffle prize is reported on Form W-2G and whether 24% is withheld, for the year the
  // prize is paid. prize and wager in dollars; a noncash prize at its fair market value.
  function rafflePrize({ year, prize, wager }) {
    const g = GAMING[year];
    if (!g) throw new QpqError(`Raffle prize reporting thresholds are held for ${Object.keys(GAMING).join(', ')}.`, 'year');
    const p = need(prize, 'The prize', 'prize');
    const w = need(wager, 'The ticket price', 'wager');
    if (w === 0) throw new QpqError('The ticket price (the wager) must be more than $0.00.', 'wager');
    const net = p - w;
    const times300 = p >= w * 300;
    const reportable = times300 && net >= g.report;
    // Regular gambling withholding for raffles (W-2G instructions, sweepstakes and lotteries): the
    // winnings less the wager over $5,000.
    const withholding = net > 500_000;
    return { year, prize: p, wager: w, net, threshold: g.report, source: g.source, times300, reportable, withholding, withheld: withholding ? Math.round(net * 0.24) : 0 };
  }

  const penaltyFor = (count) => Math.min(count * PENALTY, PENALTY_CAP);

  return { assess, wording, correction, checkText, batch, batchCsv, rafflePrize, limitsFor, penaltyFor, years: YEARS, LIMITS, GAMING, QPQ, ACK, PENALTY, PENALTY_CAP };
}
