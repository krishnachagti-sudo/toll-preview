// Tip-pool calculator: the pure engine the page and the server share. No imports, no Node APIs.
//
// Two jobs, both deterministic:
//  1. Split a pool to the cent. Money is whole cents; weights are whole hundredths of an hour or a
//     point. Each person gets floor(pool x weight / total); the cents left over go one each to the
//     largest remainders (ties to the person listed first), so the shares always add up to the pool.
//  2. Check who is in the pool against the federal rules (29 CFR 531.50-531.60 and DOL Fact Sheet
//     #15), the state's own rules where its site was read (data/states.json), the UK Tipping Act code
//     or Ontario's ESA guide. The rule text comes from the data the caller passes in (ctx), so this
//     file holds the logic only.
//
// ctx: { roles, dol, states, federal, uk, ontario, irs } as read by tool.js from data/.

export class TipError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'TipError';
    this.field = field;
  }
}

export const LIMITS = { staff: 200, poolCents: 100_000_000, hours: 744, points: 100, name: 60, feePercent: 10, roles: 30 };
export const METHODS = ['hours', 'points', 'hours-points', 'percentage', 'equal'];
export const METHOD_NAMES = { hours: 'hours worked', points: 'points', 'hours-points': 'hours x points', percentage: 'role percentages', equal: 'equal shares' };
const UNIT = { hours: ['hour', 'hours'], points: ['point', 'points'], 'hours-points': ['point-hour', 'point-hours'], equal: ['share', 'shares'] };

// ---------- numbers ----------

// "$1,240.50", "1240.5", 1240.5 -> whole hundredths (124050). Up to `decimals` places, never negative.
export function scaled(v, field, { decimals = 2, max = Infinity, label = field } = {}) {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) throw new TipError(`${label} must be a number.`, field);
    v = String(v);
  }
  if (typeof v !== 'string') throw new TipError(`${label} must be a number.`, field);
  const s = v.trim().replace(/^[$£]|^C\$/, '').replace(/,/g, '');
  const m = /^(\d+)(?:\.(\d*))?$/.exec(s);
  if (!m) throw new TipError(`${label}: "${String(v).slice(0, 20)}" is not a number like 12.50.`, field);
  const frac = m[2] ?? '';
  if (frac.length > decimals) throw new TipError(`${label}: at most ${decimals} decimal places.`, field);
  const n = Number(m[1]) * 10 ** decimals + Number((frac + '0'.repeat(decimals)).slice(0, decimals) || 0);
  if (!Number.isSafeInteger(n)) throw new TipError(`${label} is too large.`, field);
  if (n / 10 ** decimals > max) throw new TipError(`${label} can be at most ${max.toLocaleString('en-US')}.`, field);
  return n;
}
export const toCents = (v, field, label) => {
  const c = scaled(v, field, { label: label ?? field });
  if (c > LIMITS.poolCents) throw new TipError(`${label ?? field} can be at most $1,000,000.00.`, field);
  return c;
};

const SYMBOL = { USD: '$', GBP: '£', CAD: 'C$' };
export function money(cents, currency = 'USD') {
  const neg = cents < 0;
  const c = Math.abs(cents);
  const whole = Math.floor(c / 100).toLocaleString('en-US');
  return `${neg ? '-' : ''}${SYMBOL[currency] ?? '$'}${whole}.${String(c % 100).padStart(2, '0')}`;
}
// Hundredths as a plain number: 3050 -> "30.5", 4000 -> "40".
export const plain = (h, decimals = 2) => {
  const d = 10 ** decimals;
  const whole = Math.floor(h / d);
  const frac = String(h % d).padStart(decimals, '0').replace(/0+$/, '');
  return frac ? `${whole.toLocaleString('en-US')}.${frac}` : whole.toLocaleString('en-US');
};
const plural = (n, [one, many]) => (n === 1 ? one : many);
// "an $18.40", "a $15.00": by how the amount is said aloud (eight, eleven, eighteen, eighty...).
export const article = (amount) => (/^\$(8|11(\.|$)|18(\.|$))/.test(amount) ? 'an' : 'a');

// Largest remainder: weights are non-negative safe integers with a positive total. Returns whole
// shares summing exactly to `total`, and how many people got one of the leftover cents.
export function allocate(total, weights) {
  const W = weights.reduce((a, b) => a + BigInt(b), 0n);
  if (W <= 0n) throw new TipError('Nobody in the pool has any hours or points.', 'staff');
  const T = BigInt(total);
  const rows = weights.map((w, i) => {
    const p = T * BigInt(w);
    return { i, share: p / W, rem: p % W };
  });
  let left = total - Number(rows.reduce((a, r) => a + r.share, 0n));
  const order = [...rows].sort((a, b) => (a.rem === b.rem ? a.i - b.i : a.rem > b.rem ? -1 : 1));
  const extra = new Set();
  for (const r of order) {
    if (left <= 0) break;
    if (r.rem === 0n) continue;
    r.share += 1n;
    extra.add(r.i);
    left -= 1;
  }
  return { shares: rows.map((r) => Number(r.share)), extra: [...extra].sort((a, b) => a - b) };
}

// Rounds cents x percent (in thousandths of a percent) half up to a whole cent.
export const percentOf = (cents, pctMilli) => Math.floor((cents * pctMilli * 2 + 100_000) / 200_000);

// ---------- dates ----------

export const isRealDate = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (s) => `${MONTHS[Number(s.slice(5, 7)) - 1]} ${Number(s.slice(8, 10))}, ${s.slice(0, 4)}`;
export const ukDate = (s) => `${Number(s.slice(8, 10))} ${MONTHS[Number(s.slice(5, 7)) - 1]} ${s.slice(0, 4)}`;
// The last day of the month after the month of `date`: the UK Tipping Act deadline (code para 33).
export function ukDeadline(date) {
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7)); // 1-12; the next month is m + 1, its last day is day 0 of m + 2
  const d = new Date(Date.UTC(y, m + 1, 0));
  return d.toISOString().slice(0, 10);
}

// ---------- jurisdictions ----------

// 'US', 'US-WA', 'UK', 'CA-ON' -> what the engine knows about it.
export function jurisdictionOf(code, ctx) {
  const c = String(code ?? 'US').trim().toUpperCase();
  if (c === 'US' || c === 'FEDERAL') return { code: 'US', country: 'US', name: 'United States (federal rules only)', currency: 'USD', row: null, state: null, covered: true };
  if (c === 'UK' || c === 'GB') return { code: 'UK', country: 'UK', name: 'United Kingdom', currency: 'GBP', covered: true };
  if (c === 'CA-ON' || c === 'ON') return { code: 'CA-ON', country: 'CA', name: 'Ontario', currency: 'CAD', covered: true };
  const m = /^(?:US-)?([A-Z]{2})$/.exec(c);
  const row = m && ctx.dol.rows.find((r) => r.code === m[1]);
  if (!row) throw new TipError(`Unknown place "${String(code).slice(0, 12)}". Use US, a state code such as US-TX, UK or CA-ON.`, 'jurisdiction');
  const state = ctx.states[row.code] ?? null;
  const the = row.code === 'DC' ? 'the ' : '';
  return { code: `US-${row.code}`, country: 'US', name: row.name, inName: `${the}${row.name}`, currency: 'USD', row, state, covered: Boolean(state) };
}

const fedCite = (ctx, sec) => ({ text: `29 CFR ${sec}`, href: `https://www.ecfr.gov/current/title-29/section-${sec.replace(/\(.*$/, '')}` });
const fs15 = (ctx) => ({ text: 'DOL Fact Sheet #15', href: ctx.federal.sources.fs15.url });
const dolTable = (ctx) => ({ text: `DOL tipped wage table (revised ${longDate(ctx.dol.revised)})`, href: ctx.dol.url });
const stateCite = (st, rule) => {
  const src = st.sources[rule.source ?? 0];
  return { text: rule.cite ? `${st.name}: ${rule.cite}` : src.name, href: src.url };
};

// ---------- reading the staff list ----------

function readStaff(input, ctx, { needWeights = true } = {}) {
  const list = input.staff;
  if (!Array.isArray(list) || !list.length) throw new TipError('Add at least one person to the pool.', 'staff');
  if (list.length > LIMITS.staff) throw new TipError(`At most ${LIMITS.staff} people.`, 'staff');
  const method = input.method ?? 'hours';
  return list.map((p, i) => {
    const at = `Person ${i + 1}`;
    const name = String(p.name ?? '').trim() || at;
    if (name.length > LIMITS.name) throw new TipError(`${at}: a name is at most ${LIMITS.name} characters.`, 'staff');
    const role = String(p.role ?? 'other').trim().toLowerCase().replace(/\s+/g, '-');
    if (!ctx.roles[role]) throw new TipError(`${name}: unknown role "${role.slice(0, 20)}". Use one of ${Object.keys(ctx.roles).join(', ')}.`, 'staff');
    const hours = p.hours === undefined || p.hours === null || p.hours === '' ? null : scaled(p.hours, 'staff', { label: `${name}'s hours`, max: LIMITS.hours });
    const points = p.points === undefined || p.points === null || p.points === '' ? null : scaled(p.points, 'staff', { label: `${name}'s points`, max: LIMITS.points });
    if (needWeights) {
      if ((method === 'hours' || method === 'hours-points') && hours === null) throw new TipError(`${name}: hours are needed to split by ${METHOD_NAMES[method]}.`, 'staff');
      if ((method === 'points' || method === 'hours-points') && points === null) throw new TipError(`${name}: points are needed to split by ${METHOD_NAMES[method]}.`, 'staff');
    }
    const tipped = p.tipped === undefined || p.tipped === null ? ctx.roles[role].tipped : p.tipped;
    if (!['yes', 'no', 'check'].includes(tipped)) throw new TipError(`${name}: tipped is yes, no or check.`, 'staff');
    return {
      name, role, hours, points, tipped,
      supervisor: Boolean(p.supervisor) || ctx.roles[role].barred === 'manager',
      owner: Boolean(p.owner) || ctx.roles[role].barred === 'owner',
    };
  });
}

// ---------- the legality check ----------

const LEVELS = { fail: 3, warn: 2, info: 1, ok: 0 };
const roleLabel = (ctx, role) => ctx.roles[role].label;
const who = (people) => {
  const names = people.map((p) => p.name);
  return names.length <= 2 ? names.join(' and ') : `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
};

// Findings for a pool: [{ level, rule, names, text, quote?, cites }], worst first.
export function findingsFor(people, opts, j, ctx) {
  const out = [];
  const add = (level, rule, text, cites, extra = {}) => out.push({ level, rule, text, cites, ...extra });
  const { tipCredit = false, voluntary = false, cardFee = null } = opts;
  const F = ctx.federal.quotes;

  if (j.country === 'US') {
    const bosses = people.filter((p) => p.supervisor && !p.owner);
    const owners = people.filter((p) => p.owner);
    if (bosses.length) add('fail', 'manager', `${who(bosses)}: a manager or supervisor may not receive tips from the pool, whether or not you take a tip credit. They may keep tips customers give them directly for service they alone provide.`, [fedCite(ctx, '531.52(b)(2)'), fedCite(ctx, '531.54(c)(3)'), fs15(ctx)], { names: bosses.map((p) => p.name), quote: F.s531_52b2 });
    if (owners.length) add('fail', 'owner', `${who(owners)}: an employer may not receive tips from the pool, and an owner of at least 20 percent who actively manages counts as a manager.`, [fedCite(ctx, '531.54(b)(1)'), fs15(ctx)], { names: owners.map((p) => p.name), quote: F.fs15_owners });
    const staff = people.filter((p) => !p.supervisor && !p.owner);
    const notTipped = staff.filter((p) => p.tipped === 'no');
    const unsure = staff.filter((p) => p.tipped === 'check');
    if (tipCredit) {
      if (notTipped.length) add('fail', 'credit-boh', `${who(notTipped)}: with a tip credit, the pool may include only employees who customarily and regularly receive tips, so ${notTipped.length === 1 ? 'this role is' : 'these roles are'} not allowed. Pay everyone in the pool at least the full minimum wage in cash to include them.`, [fedCite(ctx, '531.54(c)(1)'), fedCite(ctx, '531.54(d)'), fs15(ctx)], { names: notTipped.map((p) => p.name), quote: F.s531_54c1 });
      if (unsure.length) add('warn', 'credit-unsure', `${who(unsure)}: with a tip credit, each must customarily and regularly receive more than $30 a month in tips in their own job to be in the pool. The DOL does not name ${unsure.length === 1 ? 'this role' : 'these roles'} either way, so check the facts.`, [fedCite(ctx, '531.56(c)'), fedCite(ctx, '531.54(c)(1)')], { names: unsure.map((p) => p.name), quote: F.s531_56c });
      add('info', 'credit-notice', 'With a tip credit you must tell staff any required pool contribution, and you may take a credit only for the tips each person ends up with.', [fedCite(ctx, '531.54(c)(2)')], { quote: F.s531_54c2 });
    } else if (notTipped.length) {
      add('info', 'no-credit-boh', `${who(notTipped)} may share because you take no tip credit, provided everyone in the pool gets a cash wage of at least the full minimum wage.`, [fedCite(ctx, '531.54(d)'), fs15(ctx)], { names: notTipped.map((p) => p.name), quote: F.s531_54d });
    }
    add('info', 'payday', 'Pay out every collected tip by the regular payday for the workweek (or for the pay period it ends in).', [fedCite(ctx, '531.54(b)(2)')], { quote: F.s531_54b2 });
  }

  if (j.code.startsWith('US-')) {
    const st = j.state;
    if (j.row.group === 'full' && tipCredit) {
      const r = st?.rules.find((x) => x.kind === 'no-tip-credit');
      add('fail', 'state-no-credit', `${j.name} requires the full state minimum wage (${j.row.cash}) before tips, so no tip credit can be taken there.`, r ? [stateCite(st, r), dolTable(ctx)] : [dolTable(ctx)], r ? { quote: r.quote } : {});
    }
    if (!st) {
      add('warn', 'state-not-covered', `${j.name}'s own tip-pool rules are not covered here (its site was not read), so only the federal rules were applied. ${j.name}'s rules may be stricter.`, [dolTable(ctx), fs15(ctx)], { quote: F.fs15_states });
    } else {
      for (const r of st.rules) {
        const c = [stateCite(st, r)];
        if (r.kind === 'voluntary-only') {
          if (voluntary) add('info', 'state-voluntary', `${j.name}: the staff agreed this pool among themselves, which is the only kind allowed; you may hold and pay out the shares only when they ask.`, c, { quote: r.quote });
          else add('fail', 'state-voluntary', `${j.name}: an employer may not require staff to share tips or pay into a pool. Staff may agree to share among themselves.`, c, { quote: r.quote });
        } else if (r.kind === 'mandatory-limited') {
          if (!voluntary) add('warn', 'state-limited', `${j.name}: you may require pooling only among direct service employees who served the same customer, and at most ${r.capPercent}% of the main server's tips; any wider pool must be the staff's own choice.`, c, { quote: r.quote });
        } else if (r.kind === 'eligible-roles') {
          const mandatoryOnly = r.mandatoryDenied ?? [];
          const denied = people.filter((p) => !p.supervisor && !p.owner && (r.denied.includes(p.role) && !(voluntary && mandatoryOnly.includes(p.role))));
          const unsure = people.filter((p) => !p.supervisor && !p.owner && !r.allowed.includes(p.role) && !r.denied.includes(p.role));
          if (denied.length) add('fail', 'state-roles', `${j.name}: ${who(denied)} may not share in the pool there (${denied.map((p) => roleLabel(ctx, p.role).toLowerCase()).filter((v, i, a) => a.indexOf(v) === i).join(', ')}), whether or not you take a tip credit.`, c, { names: denied.map((p) => p.name), quote: r.quote, explain: r.explain });
          if (unsure.length) add('warn', 'state-roles-unsure', `${j.name}: whether ${who(unsure)} may share depends on their duties under the state's rule; check before including them.`, c, { names: unsure.map((p) => p.name), quote: r.quote, explain: r.explain });
        } else if (r.kind === 'credit-pool') {
          const notTipped = people.filter((p) => !p.supervisor && !p.owner && p.tipped === 'no');
          if (tipCredit && notTipped.length) add('fail', 'state-credit-pool', `${j.name}: with the tip credit, the pool must be only among service employees.`, c, { names: notTipped.map((p) => p.name), quote: r.quote });
        } else if (r.kind === 'pool-members') {
          if (people.some((p) => p.supervisor || p.owner)) add('fail', 'state-members', `${j.name}: a pool or tip-out may not include salaried-exempt managers or business owners.`, c, { names: people.filter((p) => p.supervisor || p.owner).map((p) => p.name), quote: r.quote });
        } else if (r.kind === 'boh-allowed') {
          if (people.some((p) => p.tipped === 'no')) add('info', 'state-boh', `${j.name} lets a pool include staff who do not serve customers directly, such as the kitchen.`, c, { quote: r.quote });
        } else if (r.kind === 'no-card-fee') {
          if (cardFee?.asked) add(r.level, 'state-card-fee', `${j.name}: the card processing fee may not come out of card tips, so it was not taken off.`, c, { quote: r.quote });
        } else if (r.kind === 'card-fee') {
          if (cardFee?.cents > 0) add('info', 'state-card-fee', `${j.name} allows taking off only the card company's pro-rated fee on the tip.`, c, { quote: r.quote });
        } else if (r.kind === 'payout' || r.kind === 'records' || r.kind === 'notice') {
          add('info', `state-${r.kind}`, `${j.name}: ${r.kind === 'payout' ? 'when tips must be paid' : r.kind === 'records' ? 'records to keep' : 'what the tipped-wage notice must say'}.`, c, { quote: r.quote });
        }
      }
    }
    if (cardFee?.cents > 0) add('info', 'card-fee', `${money(cardFee.cents)} came off ${money(cardFee.cardCents)} of card tips (${cardFee.percent}%). Take off no more than the card company actually charges you, and do not hold the tips until it pays you.`, [fs15(ctx)], { quote: ctx.federal.quotes.fs15_cardsLimit });
  }

  if (j.country === 'US' && j.code === 'US' && cardFee?.cents > 0) add('info', 'card-fee', `${money(cardFee.cents)} came off ${money(cardFee.cardCents)} of card tips (${cardFee.percent}%). Take off no more than the card company actually charges you.`, [fs15(ctx)], { quote: F.fs15_cardsLimit });

  if (j.code === 'UK') {
    const U = ctx.uk.quotes;
    const code = { text: 'UK code of practice on tips', href: ctx.uk.sources.code.url };
    if (cardFee?.asked) add('fail', 'uk-deduction', 'Tips must be passed on without deductions other than tax, so the card fee was not taken off.', [code], { quote: U.p2a });
    if (opts.tipsPaidOn) add('info', 'uk-deadline', `Tips customers paid on ${ukDate(opts.tipsPaidOn)} must reach staff by ${ukDate(ukDeadline(opts.tipsPaidOn))} at the latest.`, [code], { quote: U.p33, deadline: ukDeadline(opts.tipsPaidOn) });
    const owners = people.filter((p) => p.owner);
    if (owners.length) add('warn', 'uk-owner', `${who(owners)}: the Act applies to workers, not to the self-employed, and all tips must go to workers.`, [code], { names: owners.map((p) => p.name), quote: U.p16 });
    add('info', 'uk-policy', 'Keep a written tipping policy available to all staff.', [code], { quote: U.p34 });
    add('info', 'uk-record', 'Keep this record of the tips and each worker\'s share for three years from the date each tip was paid.', [code], { quote: U.p43 });
  }

  if (j.code === 'CA-ON') {
    const O = ctx.ontario.quotes;
    const guide = { text: 'Ontario ESA guide: tips or other gratuities', href: ctx.ontario.source.url };
    if (tipCredit) add('fail', 'on-no-credit', 'Tips are not wages under Ontario\'s Employment Standards Act, so they cannot count towards the minimum wage.', [guide], { quote: O.notWages });
    const owners = people.filter((p) => p.owner);
    if (owners.length) add('warn', 'on-owner', `${who(owners)}: an employer may share in a pool only as a sole proprietor, partner, director or shareholder who regularly does, to a substantial degree, the same work as the staff who share.`, [guide], { names: owners.map((p) => p.name), quote: `${O.employer} ${O.employerA}` });
    const bosses = people.filter((p) => p.supervisor && !p.owner);
    if (bosses.length) add('info', 'on-managers', `${who(bosses)}: managers generally may share in a pool if your policy allows it.`, [guide], { names: bosses.map((p) => p.name), quote: O.managers });
    if (cardFee?.cents > 0) add('info', 'on-card-fee', `Only a credit card processing fee may come off, at the card company's percentage or 1.5%, whichever is greater; never a debit card or other processing fee.`, [guide], { quote: O.debit });
  }

  return out.sort((a, b) => LEVELS[b.level] - LEVELS[a.level]);
}

export const verdictOf = (findings) => (findings.some((f) => f.level === 'fail') ? 'fail' : findings.some((f) => f.level === 'warn') ? 'check' : 'ok');
export function verdictText(findings) {
  const fails = findings.filter((f) => f.level === 'fail').length;
  const warns = findings.filter((f) => f.level === 'warn').length;
  if (fails) return `The check found ${fails} ${plural(fails, ['problem', 'problems'])}${warns ? ` and ${warns} ${plural(warns, ['point', 'points'])} to check` : ''}: ${findings.find((f) => f.level === 'fail').text}`;
  if (warns) return `No rule is broken on these facts, with ${warns} ${plural(warns, ['point', 'points'])} to check: ${findings.find((f) => f.level === 'warn').text}`;
  return 'No rule is broken on these facts.';
}

// ---------- the split ----------

function readCardFee(input, poolCents, j) {
  const asked = input.cardTips !== undefined && input.cardTips !== null && input.cardTips !== '' && input.cardFeePercent !== undefined && input.cardFeePercent !== null && input.cardFeePercent !== '';
  if (!asked) return null;
  const cardCents = toCents(input.cardTips, 'cardTips', 'Card tips');
  if (cardCents > poolCents) throw new TipError('Card tips cannot be more than the whole pool.', 'cardTips');
  const pctMilli = scaled(input.cardFeePercent, 'cardFeePercent', { decimals: 3, max: LIMITS.feePercent, label: 'Card fee percent' });
  const percent = plain(pctMilli, 3);
  const blocked = j.code === 'UK' || Boolean(j.state?.rules.some((r) => r.kind === 'no-card-fee'));
  const cents = blocked ? 0 : percentOf(cardCents, pctMilli);
  return { asked: pctMilli > 0 && cardCents > 0, cardCents, pctMilli, percent, cents, blocked };
}

function readPercents(input, ctx) {
  const list = input.rolePercents;
  if (!Array.isArray(list) || !list.length) throw new TipError('Give each role its percentage of the pool.', 'rolePercents');
  if (list.length > LIMITS.roles) throw new TipError(`At most ${LIMITS.roles} roles.`, 'rolePercents');
  const seen = new Set();
  const out = list.map((x) => {
    const role = String(x.role ?? '').trim().toLowerCase().replace(/\s+/g, '-');
    if (!ctx.roles[role]) throw new TipError(`Unknown role "${role.slice(0, 20)}" in the percentages.`, 'rolePercents');
    if (seen.has(role)) throw new TipError(`${ctx.roles[role].label} is listed twice in the percentages.`, 'rolePercents');
    seen.add(role);
    return { role, pct: scaled(x.percent, 'rolePercents', { label: `${ctx.roles[role].label} percent`, max: 100 }) };
  });
  const sum = out.reduce((a, x) => a + x.pct, 0);
  if (sum !== 10_000) throw new TipError(`The role percentages add up to ${plain(sum)}%, not 100%.`, 'rolePercents');
  return out;
}

const rateText = (net, units, decimals, unit, currency) => {
  // net cents / (units / 10^decimals) per unit, shown to the cent; "about" when not exact.
  const num = BigInt(net) * BigInt(10 ** decimals);
  const exact = num % BigInt(units) === 0n;
  const cents = Number((num * 2n + BigInt(units)) / (2n * BigInt(units)));
  return `${exact ? '' : 'about '}${money(cents, currency)} ${unit === 'hour' ? 'an' : 'a'} ${unit}`;
};

export function split(input, ctx) {
  const method = input.method ?? 'hours';
  if (!METHODS.includes(method)) throw new TipError(`method is one of ${METHODS.join(', ')}.`, 'method');
  const j = jurisdictionOf(input.jurisdiction, ctx);
  const pool = toCents(input.pool, 'pool', 'The pool');
  if (pool <= 0) throw new TipError('The pool must be more than zero.', 'pool');
  if (input.tipsPaidOn !== undefined && !isRealDate(input.tipsPaidOn)) throw new TipError('tipsPaidOn must be a date like 2026-11-08.', 'tipsPaidOn');
  const people = readStaff(input, ctx);
  const cardFee = readCardFee(input, pool, j);
  const net = pool - (cardFee?.cents ?? 0);
  const cur = j.currency;

  let shares; let extra; let rows; let rate = null; let groups = null; let totalUnits = null;
  if (method === 'percentage') {
    const pcts = readPercents(input, ctx);
    const inPool = new Set(people.map((p) => p.role));
    const missing = people.filter((p) => !pcts.some((x) => x.role === p.role));
    if (missing.length) throw new TipError(`${missing[0].name} is a ${roleLabel(ctx, missing[0].role).toLowerCase()}, which has no percentage.`, 'rolePercents');
    // A role with nobody on shift: its percentage is shared among the roles that worked, in proportion.
    const active = pcts.filter((x) => inPool.has(x.role));
    const roleSplit = allocate(net, active.map((x) => x.pct));
    shares = new Array(people.length).fill(0);
    extra = [];
    groups = active.map((x, k) => {
      const members = people.map((p, i) => ({ p, i })).filter(({ p }) => p.role === x.role);
      const byHours = members.every(({ p }) => p.hours !== null) && members.reduce((a, { p }) => a + p.hours, 0) > 0;
      const inner = allocate(roleSplit.shares[k], members.map(({ p }) => (byHours ? p.hours : 1)));
      members.forEach(({ i }, n) => { shares[i] = inner.shares[n]; });
      for (const n of inner.extra) extra.push(members[n].i);
      return { role: x.role, label: roleLabel(ctx, x.role), percent: plain(x.pct), cents: roleSplit.shares[k], people: members.length, by: byHours ? 'hours' : 'equal' };
    });
    extra.sort((a, b) => a - b);
    const dropped = pcts.filter((x) => !inPool.has(x.role)).map((x) => roleLabel(ctx, x.role));
    groups.dropped = dropped;
  } else {
    const weightOf = {
      hours: (p) => p.hours,
      points: (p) => p.points,
      'hours-points': (p) => p.hours * p.points,
      equal: () => 1,
    }[method];
    const weights = people.map(weightOf);
    ({ shares, extra } = allocate(net, weights));
    totalUnits = weights.reduce((a, b) => a + b, 0);
    const decimals = { hours: 2, points: 2, 'hours-points': 4, equal: 0 }[method];
    rate = rateText(net, totalUnits, decimals, UNIT[method][0], cur);
    totalUnits = { value: plain(totalUnits, decimals), unit: UNIT[method][1] };
  }

  rows = people.map((p, i) => ({
    name: p.name,
    role: p.role,
    roleLabel: roleLabel(ctx, p.role),
    hours: p.hours === null ? null : plain(p.hours),
    points: p.points === null ? null : plain(p.points),
    cents: shares[i],
    share: money(shares[i], cur),
    extraCent: extra.includes(i),
    ttoc: j.country === 'US' ? ctx.roles[p.role].ttoc : undefined,
  }));
  const findings = findingsFor(people, { tipCredit: Boolean(input.tipCredit), voluntary: Boolean(input.voluntary), cardFee, tipsPaidOn: input.tipsPaidOn }, j, ctx);
  const verdict = verdictOf(findings);

  const named = rows.slice(0, 8).map((r) => `${r.name} ${r.share}`);
  const list = rows.length > 8 ? `${named.join(', ')} and ${rows.length - 8} more` : named.length > 1 ? `${named.slice(0, -1).join(', ')} and ${named.at(-1)}` : named[0];
  const feeText = cardFee?.cents ? ` after ${money(cardFee.cents, cur)} of card fees` : '';
  let head;
  if (method === 'percentage') {
    head = `Your ${money(pool, cur)} pool${feeText} split by role percentages gives ${groups.map((g) => `${g.label.toLowerCase()}s ${money(g.cents, cur)} (${g.percent}%)`).join(', ')}: ${list}`;
  } else if (method === 'equal') {
    head = `Your ${money(pool, cur)} pool${feeText} split equally between ${rows.length} ${plural(rows.length, ['person', 'people'])} is ${rate.replace(' a share', ' each')}: ${list}`;
  } else {
    head = `Your ${money(pool, cur)} pool${feeText} over ${totalUnits.value} ${totalUnits.unit} pays ${rate}: ${list}`;
  }
  const answer = `${head} (to the cent, adding up to ${money(net, cur)}). ${verdictText(findings)}`;

  return {
    op: 'split',
    answer,
    jurisdiction: publicJurisdiction(j, ctx),
    currency: cur,
    method,
    methodName: METHOD_NAMES[method],
    pool: money(pool, cur),
    poolCents: pool,
    cardFee: cardFee ? { cardTips: money(cardFee.cardCents, cur), percent: cardFee.percent, deducted: money(cardFee.cents, cur), deductedCents: cardFee.cents, blocked: cardFee.blocked } : null,
    net: money(net, cur),
    netCents: net,
    rate,
    totalUnits,
    groups: groups ? groups.map((g) => ({ ...g, amount: money(g.cents, cur) })) : null,
    droppedRoles: groups?.dropped ?? [],
    rows,
    rounding: {
      extraCents: extra.length,
      rule: 'Each share is the pool times that person\'s part, rounded down to the cent; the cents left over go one each to the largest remainders (ties to the person listed first), so the shares add up exactly.',
    },
    findings,
    verdict,
    tipCredit: Boolean(input.tipCredit),
    voluntary: Boolean(input.voluntary),
    deadline: j.code === 'UK' && input.tipsPaidOn ? ukDeadline(input.tipsPaidOn) : null,
  };
}

export function publicJurisdiction(j, ctx) {
  const out = { code: j.code, name: j.name, covered: j.covered };
  if (j.row) out.wage = { combined: j.row.combined, credit: j.row.credit, cash: j.row.cash, threshold: j.row.threshold, group: j.row.group, groupText: ctx.dol.groups[j.row.group], note: j.row.note ?? null, source: dolTable(ctx) };
  if (j.state) out.rules = { scope: j.state.scope, readOn: j.state.readOn, sources: j.state.sources.map((s) => ({ text: s.name, href: s.url })) };
  return out;
}

// ---------- tip-out ----------

export function tipout(input, ctx) {
  const j = jurisdictionOf(input.jurisdiction, ctx);
  const cur = j.currency;
  const base = input.base ?? 'sales';
  if (base !== 'sales' && base !== 'tips') throw new TipError('base is sales or tips.', 'base');
  const sales = input.sales === undefined || input.sales === null || input.sales === '' ? null : toCents(input.sales, 'sales', 'Sales');
  const tips = input.tips === undefined || input.tips === null || input.tips === '' ? null : toCents(input.tips, 'tips', 'Tips');
  if (base === 'sales' && sales === null) throw new TipError('Type the sales the tip-out is a percentage of.', 'sales');
  if (base === 'tips' && tips === null) throw new TipError('Type the tips the tip-out is a percentage of.', 'tips');
  const outs = input.outs;
  if (!Array.isArray(outs) || !outs.length) throw new TipError('Add at least one role to tip out.', 'outs');
  if (outs.length > LIMITS.roles) throw new TipError(`At most ${LIMITS.roles} roles.`, 'outs');
  const baseCents = base === 'sales' ? sales : tips;
  const lines = outs.map((o, i) => {
    const role = String(o.role ?? '').trim().toLowerCase().replace(/\s+/g, '-');
    if (!ctx.roles[role]) throw new TipError(`Tip-out ${i + 1}: unknown role "${role.slice(0, 20)}".`, 'outs');
    const pctMilli = scaled(o.percent, 'outs', { decimals: 3, max: 100, label: `${ctx.roles[role].label} percent` });
    const cents = percentOf(baseCents, pctMilli);
    return { role, label: ctx.roles[role].label, percent: plain(pctMilli, 3), cents, amount: money(cents, cur) };
  });
  const total = lines.reduce((a, l) => a + l.cents, 0);
  const keeps = tips === null ? null : tips - total;
  const findings = [];
  if (keeps !== null && keeps < 0) {
    // Washington and Ontario say so in terms; elsewhere the excess would come out of wages.
    const r = j.state?.rules.find((x) => x.kind === 'note' && /more than they received/.test(x.quote));
    const over = `The tip-outs (${money(total, cur)}) are more than the ${money(tips, cur)} in tips`;
    if (r) findings.push({ level: 'fail', rule: 'tipout-over', text: `${over}: in ${j.name} staff cannot be required to pay in more than they received in tips.`, cites: [stateCite(j.state, r)], quote: r.quote });
    else if (j.code === 'CA-ON') findings.push({ level: 'fail', rule: 'tipout-over', text: `${over}: in Ontario a tip-out can come only from tips.`, cites: [{ text: 'Ontario ESA guide: tips or other gratuities', href: ctx.ontario.source.url }], quote: ctx.ontario.quotes.sources });
    else findings.push({ level: 'warn', rule: 'tipout-over', text: `${over}, so part would come out of the server's own pay. With a tip credit, the credit counts only the tips each person ends up with.`, cites: [fedCite(ctx, '531.54(c)(2)')], quote: ctx.federal.quotes.s531_54c2 });
  }
  // Who receives the tip-outs is a pool question too.
  const recipients = lines.map((l) => ({ name: l.label, role: l.role, hours: null, points: null, tipped: ctx.roles[l.role].tipped, supervisor: ctx.roles[l.role].barred === 'manager', owner: ctx.roles[l.role].barred === 'owner' }));
  findings.push(...findingsFor(recipients, { tipCredit: Boolean(input.tipCredit), voluntary: false }, j, ctx).filter((f) => f.rule !== 'payday' && f.rule !== 'credit-notice'));
  findings.sort((a, b) => LEVELS[b.level] - LEVELS[a.level]);
  const of = `${money(baseCents, cur)} in ${base}`;
  const parts = lines.map((l) => `the ${l.label.toLowerCase()} tip-out at ${l.percent}% is ${l.amount}`);
  const answer = `On ${of}, ${parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0]}, ${money(total, cur)} in all${keeps !== null && keeps >= 0 ? `; the server keeps ${money(keeps, cur)} of ${money(tips, cur)} in tips` : ''}. ${verdictText(findings)}`;
  return { op: 'tipout', answer, jurisdiction: publicJurisdiction(j, ctx), currency: cur, base, baseAmount: money(baseCents, cur), lines, total: money(total, cur), totalCents: total, keeps: keeps === null ? null : money(keeps, cur), keepsCents: keeps, findings, verdict: verdictOf(findings) };
}

// ---------- check (who may be in the pool, no money) ----------

export function check(input, ctx) {
  const j = jurisdictionOf(input.jurisdiction, ctx);
  const people = readStaff({ ...input, method: 'equal' }, ctx, { needWeights: false });
  const findings = findingsFor(people, { tipCredit: Boolean(input.tipCredit), voluntary: Boolean(input.voluntary) }, j, ctx);
  const verdict = verdictOf(findings);
  const where = j.code === 'US' ? 'under the federal rules' : `in ${j.inName ?? j.name}`;
  const answer = `${people.length} ${plural(people.length, ['person', 'people'])} checked ${where}${j.country === 'US' ? (input.tipCredit ? ' with a tip credit' : ' with no tip credit') : ''}. ${verdictText(findings)}`;
  return { op: 'check', answer, jurisdiction: publicJurisdiction(j, ctx), people: people.map((p) => ({ name: p.name, role: p.role, roleLabel: roleLabel(ctx, p.role), tipped: p.tipped, supervisor: p.supervisor, owner: p.owner, status: statusOf(p, findings) })), findings, verdict };
}
const statusOf = (p, findings) => {
  const mine = findings.filter((f) => f.names?.includes(p.name));
  return mine.some((f) => f.level === 'fail') ? 'not allowed' : mine.some((f) => f.level === 'warn') ? 'check' : 'allowed';
};

// ---------- rules for a place ----------

export function rulesFor(input, ctx) {
  const j = jurisdictionOf(input.jurisdiction, ctx);
  const out = { op: 'rules', jurisdiction: publicJurisdiction(j, ctx) };
  if (j.code === 'US') {
    out.answer = `Under the FLSA the tipped cash wage is at least ${ctx.federal.numbers.cashWage} an hour with a tip credit of up to ${ctx.federal.numbers.maxCredit} against the ${ctx.federal.numbers.minimumWage} minimum wage; with a tip credit a pool may include only customarily tipped employees, and employers, managers and supervisors may never receive tips from a pool.`;
    out.rules = [];
  } else if (j.code === 'UK') {
    out.answer = 'In the UK, employers must pass on all tips without deductions other than tax, share them fairly under a written tipping policy, pay them by the end of the month after the month the customer paid, and keep a record for three years.';
    out.rules = Object.entries(ctx.uk.quotes).map(([k, quote]) => ({ kind: k, quote, cite: { text: 'UK code of practice on tips', href: ctx.uk.sources.code.url } }));
  } else if (j.code === 'CA-ON') {
    out.answer = 'In Ontario, an employer may require a tip pool among some or all employees, managers may share if the policy allows, the employer itself only in narrow cases, and only a credit card fee may come off card tips. Other provinces are not covered.';
    out.rules = Object.entries(ctx.ontario.quotes).map(([k, quote]) => ({ kind: k, quote, cite: { text: 'Ontario ESA guide: tips or other gratuities', href: ctx.ontario.source.url } }));
  } else {
    const r = j.row;
    const wage = r.group === 'full'
      ? `${j.inName} requires the full state minimum wage of ${r.cash} before tips, so there is no tip credit`
      : !/^\$/.test(r.cash)
        ? `in ${j.inName} the minimum wage is ${r.combined}, and tipped wages and the tip credit vary by region and type of employer`
        : `in ${j.inName} the minimum cash wage for tipped staff is ${r.cash}${r.credit ? ` and the tip credit is ${r.credit}` : ''}${/^\$/.test(r.combined) ? ` against ${article(r.combined)} ${r.combined} minimum wage` : ''}`;
    const pools = j.state ? stateSummary(j, ctx) : `${j.name}'s own tip-pool rules are not covered here, so the federal rules apply: with a tip credit only customarily tipped staff may share, and employers, managers and supervisors never may`;
    out.answer = `${wage[0].toUpperCase()}${wage.slice(1)} (DOL table revised ${longDate(ctx.dol.revised)}); ${pools}.`;
    out.rules = j.state ? j.state.rules.map((x) => ({ kind: x.kind, quote: x.quote, cite: stateCite(j.state, x), explain: x.explain ?? null })) : [];
  }
  return out;
}

// One clause on a covered state's pool rules, from its rule kinds.
export function stateSummary(j, ctx) {
  const st = j.state;
  const has = (k) => st.rules.find((r) => r.kind === k);
  const bits = [];
  if (has('voluntary-only')) bits.push('an employer may not require staff to pool or share tips; staff may agree to share among themselves');
  if (has('mandatory-limited')) bits.push(`an employer may require pooling only among direct service employees who served the same customer, up to ${has('mandatory-limited').capPercent}% of the main server's tips`);
  const er = has('eligible-roles');
  if (er) bits.push(`only ${j.code === 'US-MA' ? 'wait staff, service employees and service bartenders' : 'food service workers who give personal service to patrons'} may share, so ${er.denied.filter((r) => ['cook', 'dishwasher'].includes(r)).map((r) => `${ctx.roles[r].label.toLowerCase()}s`).join(' and ')} may not`);
  if (has('pool-members')) bits.push('pools may include kitchen staff and hourly leads but not salaried-exempt managers or owners');
  if (has('credit-pool')) bits.push('with the tip credit the pool must be only among service employees; without it, a wider group may share');
  if (has('no-card-fee')) bits.push('the card processing fee may not come out of card tips');
  if (has('card-fee')) bits.push('only the card company\'s pro-rated fee may come off a card tip');
  if (has('notice')) bits.push('the tipped-wage notice must state the tip-sharing policy and the percentage card fees take off card tips');
  if (st.rules.some((r) => /does not prohibit the pooling/.test(r.quote))) bits.push('the statute says it does not prohibit the pooling of tips');
  if (st.summaryNote) bits.push(st.summaryNote);
  if (!has('voluntary-only') && !has('mandatory-limited') && !er && !has('pool-members') && !has('credit-pool')) {
    bits.push(st.scope === 'wages'
      ? `nothing read on the state's site (${st.sources.map((x) => x.name.replace(/ \(.*$/, '')).join('; ')}) adds a tip-pool rule, so the federal pool rules apply`
      : 'otherwise the federal pool rules apply');
  }
  return bits.join('; ');
}

// ---------- the record ----------

const csvCell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  // A leading =, +, - or @ would run as a formula in a spreadsheet: prefix a quote.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};
export function recordCsv(result, { location = '', periodEnd = '' } = {}) {
  const cols = ['location', 'period_end', 'name', 'role', 'hours', 'points', 'share', 'currency', 'got_leftover_cent'];
  if (result.currency === 'USD') cols.push('irs_ttoc');
  cols.push('check');
  const lines = [cols.join(',')];
  for (const r of result.rows) {
    const status = result.findings.filter((f) => f.names?.includes(r.name)).sort((a, b) => LEVELS[b.level] - LEVELS[a.level])[0];
    const row = [location, periodEnd, r.name, r.roleLabel, r.hours ?? '', r.points ?? '', (r.cents / 100).toFixed(2), result.currency, r.extraCent ? 'yes' : 'no'];
    if (result.currency === 'USD') row.push(r.ttoc ?? '');
    row.push(status ? (status.level === 'fail' ? 'not allowed' : status.level === 'warn' ? 'check' : 'allowed') : 'allowed');
    lines.push(row.map(csvCell).join(','));
  }
  return `${lines.join('\n')}\n`;
}

// A plain-text tip sheet to print and sign.
export function tipSheet(result, { location = '', periodEnd = '' } = {}) {
  const out = [];
  out.push(`Tip pool${location ? `: ${location}` : ''}${periodEnd ? `, period ending ${longDate(periodEnd)}` : ''}`);
  out.push(`Pool ${result.pool}${result.cardFee?.deductedCents ? `, less ${result.cardFee.deducted} card fees (${result.cardFee.percent}% of ${result.cardFee.cardTips})` : ''}: ${result.net} split by ${result.methodName}.`);
  if (result.rate) out.push(`Rate: ${result.rate}.`);
  out.push('');
  const w = Math.max(4, ...result.rows.map((r) => r.name.length));
  for (const r of result.rows) out.push(`${r.name.padEnd(w)}  ${r.roleLabel.padEnd(22)} ${(r.hours ?? '').padStart(7)} ${(r.points ?? '').padStart(6)} ${r.share.padStart(12)}   signed ____________`);
  out.push(`${'Total'.padEnd(w)}  ${''.padEnd(22)} ${''.padStart(7)} ${''.padStart(6)} ${result.net.padStart(12)}`);
  out.push('');
  out.push(`Check: ${result.verdict === 'ok' ? 'no rule broken on these facts' : result.verdict === 'check' ? 'points to check' : 'problems found'}.`);
  for (const f of result.findings.filter((x) => x.level !== 'info')) out.push(`- ${f.text} (${f.cites.map((c) => c.text).join('; ')})`);
  out.push(result.rounding.rule);
  return `${out.join('\n')}\n`;
}

// The worked dates of the UK deadline for each month in a range: [{ month, deadline }].
export function ukDeadlines(fromMonth, count) {
  const out = [];
  let y = Number(fromMonth.slice(0, 4));
  let m = Number(fromMonth.slice(5, 7));
  for (let k = 0; k < count; k += 1) {
    const first = `${y}-${String(m).padStart(2, '0')}-01`;
    out.push({ month: first.slice(0, 7), deadline: ukDeadline(first) });
    m += 1;
    if (m === 13) { m = 1; y += 1; }
  }
  return out;
}
