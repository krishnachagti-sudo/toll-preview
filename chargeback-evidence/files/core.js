// Chargeback evidence engine. Pure and dependency-free: the page loads this same file in the browser.
// It works from the rules object (data/rules.json, passed in), never from the network or the clock:
// "today" is always an argument. Every answer names its source.
//
// What it answers:
//   lookup / checklist   a reason code (Visa, Mastercard, Amex, Discover, PayPal) -> Stripe's category,
//                        the evidence that answers it, strongest first, for a physical product, a digital
//                        product or an offline service, with the upload slot on Stripe, Shopify or PayPal
//   worth                the fees on each platform and the win chance at which fighting pays
//   deadline             days left to the due date, and a calendar file
//   ce3                  whether a Visa 10.4 dispute meets Visa's Compelling Evidence 3.0 test
//   letter               the rebuttal letter, from the facts given (nothing is assumed)
//   checkLimits          a packet's files against the platform's upload limits

export class ChargebackError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ChargebackError';
    this.field = field;
  }
}

// ---------- dates and money ----------

const DAY = 86_400_000;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const isRealDate = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
const ms = (d) => Date.parse(`${d}T00:00:00Z`);
export const addDays = (d, n) => new Date(ms(d) + n * DAY).toISOString().slice(0, 10);
export const daysBetween = (a, b) => Math.round((ms(b) - ms(a)) / DAY);
export const longDate = (d) => {
  const x = new Date(`${d}T00:00:00Z`);
  return `${MONTHS[x.getUTCMonth()]} ${x.getUTCDate()}, ${x.getUTCFullYear()}`;
};
export const weekday = (d) => WEEKDAYS[new Date(`${d}T00:00:00Z`).getUTCDay()];
// Cents in, "$1,234.50" out.
export const usd = (cents) => {
  const neg = cents < 0;
  const c = Math.abs(Math.round(cents));
  const whole = Math.floor(c / 100).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const frac = String(c % 100).padStart(2, '0');
  return `${neg ? '-' : ''}$${whole}.${frac}`;
};
// "1,234.50", 1234.5, "$40" -> cents; null when it is not money.
export function toCents(v) {
  if (typeof v === 'number') return Number.isFinite(v) && v >= 0 ? Math.round(v * 100) : null;
  if (typeof v !== 'string') return null;
  const s = v.trim().replace(/^\$/, '').replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  return Math.round(Number(s) * 100);
}
const pct = (x) => `${Math.round(x * 1000) / 10}%`;
const cap1 = (s) => `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
const lower1 = (s) => `${s.charAt(0).toLowerCase()}${s.slice(1)}`;
export const and = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const norm = (s) => String(s ?? '').trim().toLowerCase().replace(/[\s.,#-]+/g, ' ').trim();

export const PLATFORMS = ['stripe', 'shopify', 'paypal'];
export const NETWORKS = ['visa', 'mastercard', 'amex', 'discover', 'paypal'];
export const PRODUCT_TYPES = { physical: 'a physical product', digital: 'a digital product or service', offline: 'an offline service (tickets, bookings, work done in person)' };

// ---------- codes ----------

// A code as people write it: Visa "13.1", "13-1" or "131"; Mastercard "4853" or "53"; Amex "C08";
// PayPal "MERCHANDISE_OR_SERVICE_NOT_RECEIVED" or its words.
export function normalizeCode(network, raw) {
  const s = String(raw ?? '').trim();
  if (!s) return '';
  if (network === 'visa') {
    if (/^\d{2}$/.test(s)) return s; // the old two-digit retrieval codes (28, 30, 33, 34)
    const m = /^(1[0-3])[.\- ]?(\d)(?:[.\- ]?(\d))?$/.exec(s);
    return m ? `${m[1]}.${m[2]}${m[3] ? `.${m[3]}` : ''}` : s;
  }
  if (network === 'mastercard') return /^\d{2}$/.test(s) ? `48${s}` : s;
  if (network === 'amex') return s.toUpperCase();
  if (network === 'paypal') return s.toUpperCase().replace(/[^A-Z]+/g, '_').replace(/^_|_$/g, '');
  return s;
}
export const codeSlug = (code) => code.toLowerCase().replace(/\./g, '-');

export function makeEngine(R) {
  const NET = R.networks;
  const net = (n, field = 'network') => {
    if (!NET[n]) throw new ChargebackError(`network must be one of ${NETWORKS.join(', ')}.`, field);
    return NET[n];
  };
  const plat = (p, field = 'platform') => {
    if (!R.platforms[p]) throw new ChargebackError(`platform must be one of ${PLATFORMS.join(', ')}.`, field);
    return R.platforms[p];
  };
  const src = (ids) => ids.map((id) => ({ id, ...R.sources[id] }));

  // Every row Stripe publishes for a code (Mastercard 4853 has several sub-reasons in one category).
  function lookup(network, rawCode) {
    const N = net(network);
    const code = normalizeCode(network, rawCode);
    const rows = N.rows.filter((r) => r.code === code || (network === 'paypal' && norm(r.name) === norm(rawCode)));
    if (!rows.length) {
      throw new ChargebackError(`${N.name} code "${rawCode}" is not in Stripe's published table (read ${longDate(R.readOn)}). Check the code on your dispute, or pick the category instead.`, 'code');
    }
    const category = rows[0].category;
    const note = R.notes[`${network}:${rows[0].code}`] ?? null;
    return {
      network,
      networkName: N.name,
      code: rows[0].code,
      name: note?.title ?? rows[0].name,
      subReasons: rows.length > 1 ? rows.map((r) => r.name) : [],
      category,
      categoryName: R.categories[category].name,
      note,
      sourceNote: N.ownNote ?? null,
      sources: src([N.source, ...(note?.sources ?? [])].filter((x, i, a) => a.indexOf(x) === i)),
    };
  }

  // The upload slot for one evidence item on a platform.
  function slotOf(item, platform) {
    const e = R.evidence[item];
    if (platform === 'stripe') {
      const parts = [];
      if (e.stripe.file) parts.push(`file field ${e.stripe.file}`);
      if (e.stripe.text) parts.push(`text ${e.stripe.text.length > 1 ? 'fields' : 'field'} ${e.stripe.text.join(', ')}`);
      return { file: e.stripe.file ?? null, text: e.stripe.text ?? [], words: parts.join('; ') };
    }
    if (platform === 'paypal') return { file: e.textOnly ? null : e.paypal, text: e.textOnly ? [e.paypal] : [], words: `evidence type ${e.paypal}` };
    return { file: e.textOnly ? null : item, text: [], words: e.textOnly ? 'the matching text box in the response form' : 'its own file, typed as this evidence' };
  }

  function checklist({ platform = 'stripe', network, code, category, productType = 'physical' }) {
    const P = plat(platform);
    if (!PRODUCT_TYPES[productType]) throw new ChargebackError('productType must be physical, digital or offline.', 'productType');
    let found = null;
    if (code !== undefined && code !== '') {
      if (!network) throw new ChargebackError('Give the network with the code (visa, mastercard, amex, discover or paypal).', 'network');
      found = lookup(network, code);
    } else if (category) {
      if (!R.categories[category]) throw new ChargebackError(`category must be one of ${Object.keys(R.categories).join(', ')}.`, 'category');
    } else {
      throw new ChargebackError('Give the reason code (with its network) or the dispute category.', 'code');
    }
    const cat = found?.category ?? category;
    const C = R.categories[cat];
    const ids = C.evidence[productType];
    const items = ids.map((id, i) => {
      const e = R.evidence[id];
      return { id, rank: i + 1, label: e.label, include: e.include, kind: e.textOnly ? 'text' : 'file', slot: slotOf(id, platform) };
    });
    const top = items.slice(0, 3).map((x) => lower1(x.label));
    const codeWords = found ? `${found.networkName} ${found.code} (${found.name})` : `A "${C.name}" dispute`;
    const limits = limitWords(platform, found?.network);
    const answer = `${codeWords}${found ? ` is in Stripe's "${C.name}" category` : ''}: ${lower1(C.claim)} For ${PRODUCT_TYPES[productType]} on ${P.name}, lead with ${and(top)}. ${limits}`;
    return {
      op: 'checklist',
      platform,
      platformName: P.name,
      productType,
      ...(found ? { network: found.network, networkName: found.networkName, code: found.code, codeName: found.name, subReasons: found.subReasons, codeNote: found.note, sourceNote: found.sourceNote } : {}),
      category: cat,
      categoryName: C.name,
      claim: C.claim,
      overturn: C.overturn,
      items,
      answer,
      limits,
      window: P.window,
      submissions: P.submissions,
      sources: src([...new Set([...(found ? found.sources.map((s) => s.id) : ['stripe-categories']), ...P.sources])]),
      readOn: R.readOn,
    };
  }

  function limitWords(platform, network) {
    const P = R.platforms[platform];
    const mb = (b) => `${b / 1_000_000} MB`;
    if (platform === 'stripe') return `Stripe takes one response: one file per evidence type, PDF, JPEG or PNG, ${mb(P.maxTotalBytes)} combined, a 50-page limit${network === 'mastercard' ? ` and a ${P.mastercardPages}-page limit for this Mastercard dispute` : ` (a ${P.mastercardPages}-page limit for Mastercard)`}, and no links, audio or video.`;
    if (platform === 'shopify') return `Shopify takes one file per evidence type, PDF, JPEG or PNG, each under ${mb(P.maxFileBytes)} and ${mb(P.maxTotalBytes)} combined, each PDF under the 50-page limit, and no links, audio or video.`;
    return `PayPal takes PDF, JPEG, PNG or GIF files under ${mb(P.maxFileBytes)} each, up to ${mb(P.maxTotalBytes)} per case.`;
  }

  // ---------- is it worth fighting ----------

  // Fees in dollars (USD, US accounts) from the platform's own pages. Break-even: fighting adds the
  // countered fee (plus your time and the packet, if counted) and, on a win, gives back the amount and
  // every fee the platform returns. Fight when p x (amount + returned fees) > (1 - p) x extra cost.
  function worth({ platform = 'stripe', amount, winChance, compliance = false, paypalCase = 'chargeback', highVolume = false, minutes = 0, hourly = 0, packet = 0 }) {
    const P = plat(platform);
    const A = toCents(amount);
    if (A === null || A <= 0) throw new ChargebackError('amount: give the disputed amount in dollars, such as 40 or "1,250.00".', 'amount');
    if (winChance !== undefined && (typeof winChance !== 'number' || winChance < 0 || winChance > 100)) throw new ChargebackError('winChance is a percent from 0 to 100.', 'winChance');
    const F = P.fees;
    let sunk = 0; // charged whatever you do, never returned
    let atStart = 0; // charged at once, returned if you win
    let counter = 0; // charged only if you fight, returned if you win
    const lines = [];
    if (platform === 'stripe') {
      sunk = F.received * 100;
      counter = F.countered * 100;
      lines.push(`Stripe charges ${usd(sunk)} when the dispute arrives; it is never returned.`, `Countering adds ${usd(counter)}, returned if you win (disputes after June 17, 2025; waived with Smart Disputes).`);
      if (compliance) { counter += F.compliance * 100; lines.push(`A Visa or Mastercard compliance case adds a ${usd(F.compliance * 100)} network amount, returned if you win.`); }
    } else if (platform === 'shopify') {
      atStart = F.chargeback * 100;
      lines.push(`Shopify Payments takes a ${usd(atStart)} chargeback fee (United States) with the disputed amount, and returns both if you win.`, 'There is no extra fee for submitting evidence.');
    } else {
      sunk = (paypalCase === 'dispute' ? (highVolume ? F.highVolumeDispute : F.dispute) : F.chargeback) * 100;
      lines.push(paypalCase === 'dispute'
        ? `PayPal's ${highVolume ? 'High Volume' : 'Standard'} Dispute Fee is ${usd(sunk)} (US).`
        : `PayPal's chargeback fee is ${usd(sunk)} (US; card payments not made through a PayPal account).`, `${F.returnedNote} It is counted here as not returned, so it does not change the decision.`);
    }
    const time = Math.round((minutes / 60) * (toCents(hourly) ?? 0));
    const pack = toCents(packet) ?? 0;
    const extra = counter + time + pack;
    const back = A + atStart + counter; // what a win gives back that a loss does not
    const breakEven = extra === 0 ? 0 : extra / back;
    // Outcomes, money out of your pocket against the sale.
    const accept = A + sunk + atStart;
    const fightWin = sunk + time + pack;
    const fightLose = A + sunk + atStart + counter + time + pack;
    const out = {
      op: 'worth',
      platform,
      platformName: P.name,
      amount: { cents: A, display: usd(A) },
      fees: lines,
      costIfAccepted: { cents: accept, display: usd(accept) },
      costIfWon: { cents: fightWin, display: usd(fightWin) },
      costIfLost: { cents: fightLose, display: usd(fightLose) },
      extraToFight: { cents: extra, display: usd(extra) },
      breakEven: { fraction: breakEven, display: pct(breakEven) },
      math: extra === 0
        ? 'Fighting adds no cost here, so any chance of winning is worth it (your time aside).'
        : `break-even = extra cost of fighting / (amount + fees returned on a win) = ${usd(extra)} / ${usd(back)} = ${pct(breakEven)}`,
      stripeRanks: R.stripeWinTable.rows.map(([dots, p]) => ({ dots, chance: p, fight: p / 100 > breakEven })),
      sources: src(P.sources.filter((s) => /fees|process/.test(s))),
    };
    if (winChance !== undefined) {
      const p = winChance / 100;
      const ev = Math.round(p * fightWin + (1 - p) * fightLose);
      out.winChance = winChance;
      out.expectedCostIfFought = { cents: ev, display: usd(ev) };
      out.verdict = ev < accept ? 'fight' : ev > accept ? 'accept' : 'even';
    }
    out.answer = extra === 0
      ? `On a ${usd(A)} ${P.name} dispute, fighting adds no fee${platform === 'shopify' ? ` (the ${usd(atStart)} fee comes back if you win)` : ''}, so submit evidence whenever you have it.`
      : `On a ${usd(A)} ${P.name} dispute, fighting costs ${usd(extra)} more than accepting and pays off when your chance of winning is above ${pct(breakEven)}${winChance !== undefined ? `; at ${winChance}% the expected cost is ${out.expectedCostIfFought.display} against ${usd(accept)} if you accept` : ''}.`;
    return out;
  }

  // ---------- deadline ----------

  function deadline({ platform = 'stripe', opened, dueBy, paypalCase = 'chargeback', caseId }, today) {
    const P = plat(platform);
    if (opened !== undefined && !isRealDate(opened)) throw new ChargebackError('opened must be a date written like 2026-11-08.', 'opened');
    if (dueBy !== undefined && !isRealDate(dueBy)) throw new ChargebackError('dueBy must be a date written like 2026-11-20.', 'dueBy');
    if (!opened && !dueBy) throw new ChargebackError('Give the due date on the dispute, or the date it was opened.', 'dueBy');
    let due = dueBy ?? null;
    let range = null;
    let basis;
    if (due) basis = `the due date you gave (${P.name} shows it on the dispute)`;
    else if (platform === 'paypal') {
      const days = paypalCase === 'dispute' ? P.disputeDays : P.windowDays[0];
      due = addDays(opened, days);
      basis = paypalCase === 'dispute'
        ? `PayPal gives buyer and seller up to ${days} days to settle a dispute before either can escalate it to a claim`
        : `PayPal gives a standard ${days}-day window to respond to a card chargeback`;
    } else {
      range = { from: addDays(opened, P.windowDays[0]), to: addDays(opened, P.windowDays[1]) };
      basis = `${P.name} says the window is usually ${P.windowDays[0]} to ${P.windowDays[1]} days; the exact date is on the dispute`;
    }
    const out = { op: 'deadline', platform, platformName: P.name, today, opened: opened ?? null, basis, sources: src(P.sources.filter((s) => !/fees/.test(s))) };
    if (due) {
      const left = daysBetween(today, due);
      Object.assign(out, { dueBy: due, daysLeft: left, weekday: weekday(due), late: left < 0 });
      out.answer = left < 0
        ? `The ${P.name} due date, ${longDate(due)}, passed ${-left} ${-left === 1 ? 'day' : 'days'} ago; an unanswered dispute is lost.`
        : `You have ${left} ${left === 1 ? 'day' : 'days'} to respond: the ${P.name} due date is ${weekday(due)}, ${longDate(due)}${dueBy ? '' : ` (${basis})`}.`;
      out.ics = icsFor({ due, platformName: P.name, caseId, opened });
    } else {
      out.range = range;
      out.answer = `For a ${P.name} dispute opened ${longDate(opened)}, the due date falls between ${longDate(range.from)} and ${longDate(range.to)}; read the exact date on the dispute and enter it.`;
    }
    if (platform === 'shopify') out.note = 'Shopify sends whatever evidence is saved on the due date, even if you add none; after you click Submit now you cannot change it.';
    if (platform === 'stripe') out.note = 'If you do not respond by the due date you lose the dispute automatically.';
    return out;
  }

  // ---------- Visa Compelling Evidence 3.0 ----------

  const IPV4 = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
  const isIp = (s) => IPV4.test(s) || (/^[0-9a-f:]+$/i.test(s) && s.includes(':') && s.split(':').length <= 8);
  const keyIp = (s) => (s ? String(s).trim().toLowerCase() : '');
  // The identifiers Visa compares, each checked for the form the rule asks for.
  function idsOf(t) {
    const out = {};
    const bad = [];
    const dev = String(t.deviceId ?? '').trim();
    const fp = String(t.deviceFingerprint ?? '').trim();
    if (dev) (dev.length >= R.ce3.deviceIdMin ? (out.device = `id:${dev.toLowerCase()}`) : bad.push(`device ID shorter than ${R.ce3.deviceIdMin} characters`));
    else if (fp) (fp.length >= R.ce3.fingerprintMin ? (out.device = `fp:${fp.toLowerCase()}`) : bad.push(`device fingerprint shorter than ${R.ce3.fingerprintMin} characters`));
    const ip = keyIp(t.ip);
    if (ip) (isIp(ip) ? (out.ip = ip) : bad.push('IP address not in IPv4 or IPv6 form'));
    if (t.login) out.login = String(t.login).trim().toLowerCase();
    if (t.address) out.address = norm(t.address);
    return { ids: out, bad };
  }
  const ELEMENT_WORDS = { device: 'device ID or fingerprint', ip: 'IP address', login: 'account or login ID', address: 'full delivery address' };

  function ce3({ disputeDate, network = 'visa', code = '10.4', disputed, prior = [] }) {
    if (!isRealDate(disputeDate)) throw new ChargebackError('disputeDate must be a date written like 2026-11-08 (the day the dispute was submitted).', 'disputeDate');
    const c = normalizeCode(network, code);
    const applies = network === 'visa' && c === '10.4';
    const D = idsOf(disputed ?? {});
    const results = prior.map((t, i) => {
      const reasons = [];
      if (!isRealDate(t.date)) throw new ChargebackError(`prior[${i}].date must be a date written like 2026-05-01.`, `prior.${i}.date`);
      const age = daysBetween(t.date, disputeDate);
      const P = idsOf(t);
      const matched = R.ce3.elements.filter((k) => D.ids[k] && P.ids[k] && D.ids[k] === P.ids[k]);
      if (t.sameCard === false) reasons.push('paid with a different card');
      if (t.reportedFraud) reasons.push('reported as fraud by the issuer');
      if (t.disputed) reasons.push('itself disputed');
      if (age < R.ce3.minDays) reasons.push(`only ${age} days before the dispute (more than 120 needed)`);
      if (age > R.ce3.maxDays) reasons.push(`${age} days before the dispute (365 at most)`);
      if (!matched.includes('device') && !matched.includes('ip')) reasons.push('neither the device ID or fingerprint nor the IP address matches');
      if (matched.length < 2) reasons.push(`${matched.length === 0 ? 'no identifier matches' : `only the ${ELEMENT_WORDS[matched[0]]} matches`} (two needed)`);
      if (!t.description) reasons.push('no description of what was bought');
      return { index: i, date: t.date, daysBefore: age, matched: matched.map((k) => ELEMENT_WORDS[k]), problems: [...P.bad, ...reasons], qualifies: reasons.length === 0 && !P.bad.length };
    });
    const good = results.filter((r) => r.qualifies);
    const problems = [];
    if (!applies) problems.push(`CE 3.0 applies only to Visa 10.4 (card-absent fraud); this is ${network} ${c}.`);
    if (D.bad.length) problems.push(...D.bad.map((b) => `Disputed payment: ${b}.`));
    if (!disputed?.description) problems.push('Disputed payment: give a description of what was bought.');
    if (good.length < R.ce3.priorNeeded) problems.push(`${good.length} of the ${R.ce3.priorNeeded} qualifying earlier payments needed.`);
    const eligible = applies && problems.length === 0;
    const from = addDays(disputeDate, -R.ce3.maxDays);
    const to = addDays(disputeDate, -R.ce3.minDays);
    return {
      op: 'ce3',
      eligible,
      ruleVersion: R.ce3.version,
      window: { from, to, words: `${longDate(from)} to ${longDate(to)}` },
      prior: results,
      problems,
      answer: eligible
        ? `This Visa 10.4 dispute meets the Compelling Evidence 3.0 test as entered: ${good.length} earlier undisputed payments between ${longDate(from)} and ${longDate(to)} match on ${and([...new Set(good.flatMap((g) => g.matched))])}.`
        : `Not eligible for Compelling Evidence 3.0 as entered: ${problems[0]} Qualifying payments fall between ${longDate(from)} and ${longDate(to)}.`,
      rule: R.ce3.rule,
      sources: src(R.ce3.sources),
    };
  }

  // ---------- the letter ----------

  function letter(input, today) {
    const P = plat(input.platform ?? 'stripe');
    const found = input.code ? lookup(input.network, input.code) : null;
    const cat = found?.category ?? input.category;
    if (!R.categories[cat]) throw new ChargebackError('Give the reason code (with its network) or the dispute category.', 'code');
    const C = R.categories[cat];
    const t = input.transaction ?? {};
    const f = input.facts ?? {};
    const amount = toCents(t.amount);
    if (amount === null) throw new ChargebackError('transaction.amount: give the amount in dollars.', 'transaction.amount');
    if (!isRealDate(t.date)) throw new ChargebackError('transaction.date must be a date written like 2026-10-02.', 'transaction.date');
    const date = input.letterDate ?? today;
    const who = input.customer?.name ? input.customer.name : 'The cardholder';
    const paras = [];
    paras.push(`We contest this dispute. ${who} paid ${usd(amount)} on ${longDate(t.date)}${t.orderId ? ` for order ${t.orderId}` : ''}${t.description ? ` (${t.description})` : ''}.`);
    paras.push(found
      ? `The dispute is filed under ${found.networkName} reason code ${found.code} (${found.name}): ${lower1(C.claim)}`
      : `The dispute is a "${C.name}" dispute: ${lower1(C.claim)}`);
    const facts = factSentences(cat, input.productType ?? 'physical', f, t);
    if (facts.length) paras.push(facts.join(' '));
    if (f.summary) paras.push(String(f.summary).trim());
    const ex = (input.exhibits ?? []).map((x, i) => `Exhibit ${exhibitLetter(i)}: ${R.evidence[x.item]?.label ?? x.item}${R.evidence[x.item]?.textOnly ? ' (in the text fields of this response)' : ''}${x.note ? `. ${String(x.note).trim().replace(/\.$/, '')}` : ''}.`);
    if (ex.length) paras.push(`Enclosed, in order: ${ex.join(' ')}`);
    paras.push(`We ask the card issuer to reverse this dispute on the records enclosed.`);
    const head = [
      input.merchant?.name ?? 'Merchant',
      ...(input.merchant?.contact ? [input.merchant.contact] : []),
      longDate(date),
      `Re: ${P.name} dispute ${input.caseId ?? ''}`.trim(),
      `Amount: ${usd(amount)}, charged ${longDate(t.date)}${t.descriptor ? ` as "${t.descriptor}"` : ''}`,
    ];
    const text = [...head, '', ...paras.flatMap((p) => [p, '']), input.merchant?.name ?? ''].join('\n').trim();
    return { title: `Response to dispute ${input.caseId ?? ''}`.trim(), head, paras, sign: input.merchant?.name ?? '', text, chars: text.length, category: cat, code: found };
  }

  return {
    R,
    lookup,
    checklist,
    worth,
    deadline,
    ce3,
    letter,
    limitWords,
    slotOf,
    codes: (network) => net(network).rows,
    sourcesOf: src,
  };
}

export const exhibitLetter = (i) => (i < 26 ? String.fromCharCode(65 + i) : `A${String.fromCharCode(65 + i - 26)}`);

// Only the facts the merchant gave become sentences; nothing is assumed.
function factSentences(cat, type, f, t) {
  const s = [];
  const d = (x) => longDate(x);
  if (f.customerContacted === false) s.push('The customer did not contact us before disputing the charge.');
  if (f.customerContacted === true) s.push('We were in contact with the customer before the dispute; the relevant messages are enclosed.');
  if (f.shippedOn) s.push(`We shipped the order on ${d(f.shippedOn)}${f.carrier ? ` by ${f.carrier}` : ''}${f.tracking ? `, tracking number ${f.tracking}` : ''}.`);
  if (f.deliveredOn) s.push(`The carrier recorded delivery on ${d(f.deliveredOn)}${f.deliveredTo ? ` to ${f.deliveredTo}` : ''}${f.signedBy ? `, signed for by ${f.signedBy}` : ''}.`);
  if (f.deliveredTo && f.billingMatches === true) s.push('The delivery address matches the billing address the card issuer verified.');
  if (f.accessedOn) s.push(`The customer ${type === 'digital' ? 'logged in to or downloaded the purchase' : 'used what they bought'} on ${d(f.accessedOn)}, after the payment.`);
  if (f.serviceDate) s.push(`We provided the service on ${d(f.serviceDate)}.`);
  if (f.expectedDelivery) s.push(`The delivery date agreed at checkout is ${d(f.expectedDelivery)}.`);
  if (f.priorPayments) s.push(`The same customer made ${f.priorPayments} earlier ${f.priorPayments === 1 ? 'payment' : 'payments'} with us that ${f.priorPayments === 1 ? 'was' : 'were'} not disputed.`);
  if (f.authenticated) s.push('The payment was authenticated with 3D Secure.');
  if (f.policyShownAt) s.push(`Our ${cat === 'subscription_canceled' ? 'cancellation' : 'refund'} policy was shown to the customer ${f.policyShownAt} before payment.`);
  if (cat === 'subscription_canceled') {
    if (f.cancelRequestedOn) {
      const eff = f.cancelEffectiveOn ?? f.cancelRequestedOn;
      s.push(`The customer asked to cancel on ${d(f.cancelRequestedOn)}${f.cancelEffectiveOn ? `, effective ${d(f.cancelEffectiveOn)} under the terms shown at sign-up` : ''}.`);
      if (t.date && t.date < eff) s.push(`This charge, on ${d(t.date)}, was made before the cancellation took effect.`);
    } else if (f.noCancelRequest) s.push(`We have no cancellation request from the customer before this charge on ${d(t.date)}.`);
    if (f.lastUsedOn) s.push(`The account was last used on ${d(f.lastUsedOn)}.`);
  }
  if (f.duplicateChargeId) s.push(`The other payment (${f.duplicateChargeId}) was for a separate purchase; receipts for both are enclosed.`);
  if (f.agreedAmount) s.push(`The customer agreed to a total of ${usd(toCents(f.agreedAmount) ?? 0)} at checkout.`);
  if (f.refundOn) s.push(`We refunded ${f.refundAmount ? usd(toCents(f.refundAmount) ?? 0) : 'the customer'} on ${d(f.refundOn)}.`);
  return s;
}

// ---------- the upload limits ----------

// files: [{ name, bytes, pages, type: 'pdf'|'jpeg'|'png', slot }]. Pages may be null (not counted).
export function checkLimits(R, platform, files, { network } = {}) {
  const P = R.platforms[platform];
  const mb = (b) => (b < 100_000 ? `${Math.max(1, Math.ceil(b / 1000))} KB` : `${(b / 1_000_000).toFixed(2)} MB`);
  const total = files.reduce((n, f) => n + f.bytes, 0);
  const pages = files.reduce((n, f) => n + (f.pages ?? 0), 0);
  const unknownPages = files.filter((f) => f.pages === null).map((f) => f.name);
  const checks = [];
  checks.push({ rule: 'File types', limit: P.fileTypes.map((x) => x.toUpperCase()).join(', '), actual: [...new Set(files.map((f) => f.type.toUpperCase()))].join(', ') || 'none', ok: files.every((f) => P.fileTypes.includes(f.type)) });
  checks.push({ rule: 'Combined size', limit: mb(P.maxTotalBytes), actual: mb(total), ok: total <= P.maxTotalBytes });
  if (P.maxFileBytes) {
    const big = files.filter((f) => f.bytes > P.maxFileBytes);
    checks.push({ rule: 'Size of each file', limit: mb(P.maxFileBytes), actual: big.length ? big.map((f) => `${f.name} ${mb(f.bytes)}`).join('; ') : `largest ${mb(Math.max(0, ...files.map((f) => f.bytes)))}`, ok: !big.length });
  }
  if (P.maxPagesTotal) checks.push({ rule: 'Combined pages', limit: `under ${P.maxPagesTotal + 1}`, actual: `${pages}${unknownPages.length ? ' + uncounted' : ''}`, ok: pages <= P.maxPagesTotal, unsure: unknownPages.length > 0 });
  if (P.mastercardPages && network === 'mastercard') checks.push({ rule: 'Mastercard page limit', limit: `${P.mastercardPages}`, actual: `${pages}${unknownPages.length ? ' + uncounted' : ''}`, ok: pages <= P.mastercardPages, unsure: unknownPages.length > 0 });
  if (P.maxPdfPages) {
    const long = files.filter((f) => (f.pages ?? 0) > P.maxPdfPages);
    checks.push({ rule: 'Pages in each PDF', limit: `under ${P.maxPdfPages + 1}`, actual: long.length ? long.map((f) => `${f.name} ${f.pages}`).join('; ') : `longest ${Math.max(0, ...files.map((f) => f.pages ?? 0))}`, ok: !long.length, unsure: unknownPages.length > 0 });
  }
  if (P.oneFilePerType) {
    const seen = new Map();
    for (const f of files) seen.set(f.slot, (seen.get(f.slot) ?? 0) + 1);
    const twice = [...seen].filter(([, n]) => n > 1).map(([k]) => k);
    checks.push({ rule: 'One file per evidence type', limit: '1', actual: twice.length ? `more than one for ${twice.join(', ')}` : 'yes', ok: !twice.length });
  }
  const ok = checks.every((c) => c.ok);
  return { platform, ok, totalBytes: total, pages, unknownPages, checks, answer: ok ? `Fits ${P.name}'s limits: ${files.length} ${files.length === 1 ? 'file' : 'files'}, ${mb(total)} of ${mb(P.maxTotalBytes)}${pages ? `, ${pages} ${pages === 1 ? 'page' : 'pages'}` : ''}.` : `Does not fit ${P.name}'s limits: ${checks.filter((c) => !c.ok).map((c) => `${c.rule} ${c.actual} (limit ${c.limit})`).join('; ')}.` };
}

// ---------- a calendar file ----------

export function icsFor({ due, platformName, caseId, opened }) {
  const d = due.replace(/-/g, '');
  const next = addDays(due, 1).replace(/-/g, '');
  const stamp = `${(opened ?? due).replace(/-/g, '')}T000000Z`;
  const uid = `${d}-${String(caseId ?? 'dispute').replace(/[^A-Za-z0-9]/g, '').slice(0, 40) || 'dispute'}@chargeback-evidence`;
  const esc = (s) => String(s).replace(/[\\;,]/g, (c) => `\\${c}`);
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//chargeback-evidence//EN', 'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT', `UID:${uid}`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${d}`, `DTEND;VALUE=DATE:${next}`,
    `SUMMARY:${esc(`${platformName} dispute evidence due${caseId ? `: ${caseId}` : ''}`)}`,
    `DESCRIPTION:${esc('Last day to respond. An unanswered dispute is lost.')}`,
    'BEGIN:VALARM', 'TRIGGER:-P2D', 'ACTION:DISPLAY', 'DESCRIPTION:Dispute evidence due in 2 days', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR', '',
  ].join('\r\n');
}

// ---------- a zip of the packet (stored, not compressed: PDFs and images are compressed already) ----------

let CRC = null;
export function crc32(bytes) {
  if (!CRC) {
    CRC = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      CRC[n] = c >>> 0;
    }
  }
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

// files: [{ name, bytes: Uint8Array }] -> Uint8Array. A fixed date (1980-01-01) keeps it deterministic.
export function zipStore(files) {
  const enc = new TextEncoder();
  const parts = [];
  const central = [];
  let offset = 0;
  const u16 = (v) => [v & 0xff, (v >>> 8) & 0xff];
  const u32 = (v) => [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff];
  for (const f of files) {
    const name = enc.encode(f.name);
    const crc = crc32(f.bytes);
    const size = f.bytes.length;
    const local = new Uint8Array([...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(size), ...u32(size), ...u16(name.length), ...u16(0)]);
    parts.push(local, name, f.bytes);
    central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(size), ...u32(size), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), name);
    offset += local.length + name.length + size;
  }
  const cdSize = central.reduce((n, p) => n + p.length, 0);
  const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(cdSize), ...u32(offset), ...u16(0)]);
  const all = [...parts, ...central, end];
  const out = new Uint8Array(all.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of all) { out.set(p, at); at += p.length; }
  return out;
}
