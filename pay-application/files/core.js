// The pay application engine: a G702/G703-style schedule of values and summary, retainage
// calculators and state retainage rules. Pure and dependency-free (the page loads this same file),
// so no imports, no Node APIs. Money is whole cents and rates are basis points (10% = 1000)
// everywhere; nothing is a float until it is shown.
//
// The column logic follows AIA's published instructions for its G703 continuation sheet (read
// 2026-11-08): scheduled value, work from previous applications, work this period, materials
// presently stored, total completed and stored (the sum of the three), percent (total / scheduled
// value), balance to finish (scheduled value - total) and retainage. The layout, labels and
// wording here are this tool's own; it does not reproduce the AIA documents.

export class PayAppError extends Error {
  constructor(field, message) {
    super(message);
    this.field = field;
  }
}

const refuse = (field, message) => { throw new PayAppError(field, message); };

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const LIMITS = { lines: 200, changeOrders: 100, text: 120 };

export const isRealDate = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
export const longDate = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
};

// ---------- money and rates ----------

// Dollars as given (a number or text such as "12,500.00" or "-1,200") to whole cents, or null.
export function toCents(v, { negative = false } = {}) {
  if (v === undefined || v === null || v === '') return null;
  let s = typeof v === 'number' ? (Number.isFinite(v) ? String(v) : '') : String(v).trim().replace(/,/g, '');
  let sign = 1;
  if (/^-/.test(s)) { sign = -1; s = s.slice(1); }
  s = s.replace(/^\$/, '');
  if (/e/i.test(s)) {
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    s = n.toFixed(2);
  }
  if (!/^\d{1,11}(\.\d{1,2})?$/.test(s)) return null;
  if (sign < 0 && !negative) return null;
  const [w, f = ''] = s.split('.');
  const cents = Number(w) * 100 + Number(f.padEnd(2, '0'));
  return cents === 0 ? 0 : sign * cents;
}

// A percent (a number or text such as "7.5" or "10%") to basis points, or null. 0 to 100, at most
// two decimals.
export function toBp(v) {
  if (v === undefined || v === null || v === '') return null;
  const s = typeof v === 'number' ? String(v) : String(v).trim().replace(/%$/, '').trim();
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(s)) return null;
  const [w, f = ''] = s.split('.');
  const bp = Number(w) * 100 + Number(f.padEnd(2, '0'));
  return bp <= 10000 ? bp : null;
}

const group = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// Cents to "$12,500.00" (and "-$1,200.00").
export const usd = (cents) => `${cents < 0 ? '-' : ''}$${group(Math.floor(Math.abs(cents) / 100))}.${String(Math.abs(cents) % 100).padStart(2, '0')}`;
// Cents to "12500.00" for CSV.
export const plainAmount = (cents) => `${cents < 0 ? '-' : ''}${Math.floor(Math.abs(cents) / 100)}.${String(Math.abs(cents) % 100).padStart(2, '0')}`;
// Basis points to "10%", "7.5%", "2.25%".
export const pct = (bp) => `${Math.floor(bp / 100)}${bp % 100 ? `.${String(bp % 100).padStart(2, '0').replace(/0$/, '')}` : ''}%`;

// amount x rate, rounded half away from zero to the cent.
export function retainOf(cents, bp) {
  const a = Math.abs(cents) * bp;
  const r = Math.floor((a + 5000) / 10000);
  return cents < 0 ? -r : r;
}

// A share as a percent with one decimal ("45.0%"), from whole numbers; null when the base is zero.
export function shareText(part, whole) {
  if (!whole) return null;
  const tenths = Math.round((part * 1000) / whole);
  return `${(tenths / 10).toFixed(1)}%`;
}

// ---------- the pay application ----------

// Normalises one schedule-of-values row or change order into cents.
function rowOf(raw, i, kind) {
  const where = kind === 'co' ? `changeOrders[${i}]` : `lines[${i}]`;
  const amount = (k, opts) => {
    if (raw[k] === undefined || raw[k] === null || raw[k] === '') return 0;
    const c = toCents(raw[k], opts);
    if (c === null) refuse(`${where}.${k}`, `${where}.${k} is an amount in dollars with at most two decimals, such as 12500 or "12,500.00".`);
    return c;
  };
  const scheduled = kind === 'co' ? amount('amount', { negative: true }) : amount('scheduled');
  const previous = amount('previous', { negative: kind === 'co' });
  const thisPeriod = amount('thisPeriod', { negative: true });
  const stored = amount('stored');
  const storedPrevious = amount('storedPrevious');
  let rate = null;
  if (raw.rate !== undefined && raw.rate !== null && raw.rate !== '') {
    rate = toBp(raw.rate);
    if (rate === null) refuse(`${where}.rate`, `${where}.rate is a percent from 0 to 100, such as 10 or 7.5.`);
  }
  return {
    kind,
    index: i,
    item: raw.item === undefined || raw.item === null || raw.item === '' ? (kind === 'co' ? `CO ${raw.number ?? i + 1}` : String(i + 1)) : String(raw.item),
    description: String(raw.description ?? '').trim(),
    number: kind === 'co' ? String(raw.number ?? i + 1) : null,
    executed: kind === 'co' ? raw.executed !== false : true,
    scheduled,
    previous,
    thisPeriod,
    stored,
    storedPrevious,
    rate,
  };
}

// Retainage on a list of [amount, bp] pairs: per pair ('line') or once per rate on the summed
// amounts ('total').
function retainList(pairs, rounding) {
  if (rounding === 'line') return pairs.reduce((s, [a, bp]) => s + retainOf(a, bp), 0);
  const byRate = new Map();
  for (const [a, bp] of pairs) byRate.set(bp, (byRate.get(bp) ?? 0) + a);
  let s = 0;
  for (const [bp, a] of byRate) s += retainOf(a, bp);
  return s;
}

// Retainage on work and stored materials at one moment, under the rules given.
//   rows       [{ work, stored, rate }] (rate null = the contract rate)
//   ret        { rateBp, storedBp, reduce: { atBp, toBp, mode } | null, rounding }
//   sumToDate  contract sum to date in cents (for the reduction point)
function retainageAt(rows, ret, sumToDate) {
  const work = rows.reduce((s, r) => s + r.work, 0);
  const stored = rows.reduce((s, r) => s + r.stored, 0);
  if (!ret.reduce) {
    const workPairs = rows.map((r) => [r.work, r.rate ?? ret.rateBp]);
    const storedPairs = rows.map((r) => [r.stored, r.rate ?? ret.storedBp]);
    const onWork = retainList(workPairs, ret.rounding);
    const onStored = retainList(storedPairs, ret.rounding);
    const perRow = ret.rounding === 'line' ? rows.map((r) => retainOf(r.work, r.rate ?? ret.rateBp) + retainOf(r.stored, r.rate ?? ret.storedBp)) : null;
    return { onWork, onStored, total: onWork + onStored, perRow, work, stored, reduced: false };
  }
  // With a reduction point, retainage is worked out on the whole contract (the continuation sheet's
  // retainage column is then left empty, as for a constant retainage).
  const point = retainOf(sumToDate, ret.reduce.atBp);
  const reached = work >= point && point > 0;
  let onWork;
  if (ret.reduce.mode === 'all') onWork = retainOf(work, reached ? ret.reduce.toBp : ret.rateBp);
  else onWork = retainOf(Math.min(work, point), ret.rateBp) + retainOf(Math.max(0, work - point), ret.reduce.toBp);
  const storedBp = ret.storedSet ? ret.storedBp : reached ? ret.reduce.toBp : ret.rateBp;
  const onStored = retainOf(stored, storedBp);
  return { onWork, onStored, total: onWork + onStored, perRow: null, work, stored, reduced: reached, point };
}

// The whole application: rows, summary, checks. `stateRule` is the state rule that applies (from
// stateRule() below) or null.
export function payApp(input, { stateRule: rule = null } = {}) {
  const lines = (input.lines ?? []).map((l, i) => rowOf(l, i, 'line'));
  const cos = (input.changeOrders ?? []).map((c, i) => rowOf(c, i, 'co'));
  if (!lines.length) refuse('lines', 'Add at least one schedule of values line.');
  if (lines.length > LIMITS.lines) refuse('lines', `At most ${LIMITS.lines} schedule of values lines.`);
  if (cos.length > LIMITS.changeOrders) refuse('changeOrders', `At most ${LIMITS.changeOrders} change orders.`);
  const appNo = input.applicationNumber ?? 1;
  if (!Number.isInteger(appNo) || appNo < 1 || appNo > 999) refuse('applicationNumber', 'applicationNumber is a whole number from 1 to 999.');

  const r = input.retainage ?? {};
  const rateBp = toBp(r.rate ?? 0);
  if (rateBp === null) refuse('retainage.rate', 'retainage.rate is a percent from 0 to 100, such as 10 or 5.');
  const storedSet = r.storedRate !== undefined && r.storedRate !== null && r.storedRate !== '';
  const storedBp = storedSet ? toBp(r.storedRate) : rateBp;
  if (storedBp === null) refuse('retainage.storedRate', 'retainage.storedRate is a percent from 0 to 100.');
  let reduce = null;
  if (r.reduceAt !== undefined && r.reduceAt !== null && r.reduceAt !== '') {
    const atBp = toBp(r.reduceAt);
    const toBpV = toBp(r.reducedRate);
    if (atBp === null || atBp === 0 || atBp >= 10000) refuse('retainage.reduceAt', 'retainage.reduceAt is the percent complete at which retainage drops, such as 50.');
    if (toBpV === null) refuse('retainage.reducedRate', 'retainage.reducedRate is the percent held after the reduction point, such as 5.');
    if (toBpV > rateBp) refuse('retainage.reducedRate', `The reduced rate (${pct(toBpV)}) is above the starting rate (${pct(rateBp)}).`);
    if ([...lines, ...cos].some((x) => x.rate !== null)) refuse('retainage.reduceAt', 'A reduction point works on the whole contract, so it cannot be combined with a rate on individual lines. Use one or the other.');
    reduce = { atBp, toBp: toBpV, mode: r.reduceMode === 'all' ? 'all' : 'subsequent' };
  }
  const rounding = r.rounding === 'total' ? 'total' : 'line';
  const released = toCents(r.released ?? 0);
  const previouslyReleased = toCents(r.previouslyReleased ?? 0);
  if (released === null) refuse('retainage.released', 'retainage.released is the retainage released on this application, in dollars.');
  if (previouslyReleased === null) refuse('retainage.previouslyReleased', 'retainage.previouslyReleased is the retainage released on earlier applications, in dollars.');
  const ret = { rateBp, storedBp, storedSet, reduce, rounding };

  const checks = [];
  const flag = (level, code, message) => checks.push({ level, code, message });

  // Change orders not executed are listed, never billed or added to the contract sum.
  const billedCos = cos.filter((c) => c.executed);
  for (const c of cos.filter((x) => !x.executed)) {
    if (c.previous || c.thisPeriod || c.stored) flag('error', 'unexecuted_change_order', `Change order ${c.number} is not executed but has amounts billed. It is left out of the totals: bill it once it is signed.`);
  }
  const rows = [...lines, ...billedCos];

  // Per row: total to date, percent, balance, and the checks a reviewer runs.
  for (const x of rows) {
    x.total = x.previous + x.thisPeriod + x.stored;
    x.balance = x.scheduled - x.total;
    x.percent = shareText(x.total, x.scheduled);
    const name = x.kind === 'co' ? `Change order ${x.number}` : `Line ${x.item}${x.description ? ` (${x.description})` : ''}`;
    if (x.scheduled >= 0) {
      if (x.total > x.scheduled) flag('error', 'over_100_percent', `${name} bills ${usd(x.total)} against a scheduled value of ${usd(x.scheduled)} (${x.percent}). A line cannot pass 100%: move the excess to a change order.`);
      if (x.total < 0) flag('error', 'negative_total', `${name} totals ${usd(x.total)} to date. Work to date cannot be negative.`);
    } else if (x.total < x.scheduled || x.total > 0) {
      flag('error', 'over_100_percent', `${name} is a deduction of ${usd(x.scheduled)}; its total to date (${usd(x.total)}) must be between that and zero.`);
    }
    if (x.thisPeriod < 0) flag('warning', 'negative_this_period', `${name} has a negative amount this period (${usd(x.thisPeriod)}). That is a correction of earlier billing; say so in the cover note.`);
    if (appNo === 1 && (x.previous || x.storedPrevious)) flag('warning', 'first_application_previous', `${name} has previous work or stored materials on application 1. The first application has nothing before it.`);
  }

  // The contract sum.
  const original = lines.reduce((s, x) => s + x.scheduled, 0);
  const additions = billedCos.filter((c) => c.scheduled > 0).reduce((s, c) => s + c.scheduled, 0);
  const deductions = billedCos.filter((c) => c.scheduled < 0).reduce((s, c) => s + c.scheduled, 0);
  const netChange = additions + deductions;
  const sumToDate = original + netChange;
  if (input.contractSum !== undefined && input.contractSum !== null && input.contractSum !== '') {
    const given = toCents(input.contractSum);
    if (given === null) refuse('contractSum', 'contractSum is the original contract sum in dollars.');
    if (given !== original) flag('error', 'schedule_does_not_total', `The schedule of values lines total ${usd(original)}, but the original contract sum is ${usd(given)} (a difference of ${usd(original - given)}). The lines must add up to the contract sum.`);
  }
  if (sumToDate <= 0) refuse('lines', 'The contract sum to date must be more than zero.');

  // Retainage now, and as it stood on the last application.
  const now = retainageAt(rows.map((x) => ({ work: x.previous + x.thisPeriod, stored: x.stored, rate: x.rate })), ret, sumToDate);
  rows.forEach((x, i) => { x.retainage = now.perRow ? now.perRow[i] : null; });
  const releasedTotal = released + previouslyReleased;
  if (releasedTotal > 0 && releasedTotal > now.total) refuse('retainage.released', `Retainage released (${usd(releasedTotal)}, this and earlier applications) is more than the retainage worked out to date (${usd(now.total)}).`);
  const retainage = now.total - releasedTotal;

  const completed = rows.reduce((s, x) => s + x.total, 0);
  const earned = completed - retainage;
  const prevGiven = input.previousCertificates !== undefined && input.previousCertificates !== null && input.previousCertificates !== '';
  const previousCertificates = prevGiven ? toCents(input.previousCertificates) : 0;
  if (previousCertificates === null) refuse('previousCertificates', 'previousCertificates is the total of the payments certified on earlier applications, in dollars.');
  const due = earned - previousCertificates;
  const balanceWithRetainage = sumToDate - earned;

  // What the earlier applications should have certified: last month's work and stored materials,
  // less the retainage on them, less nothing released since.
  const prior = retainageAt(rows.map((x) => ({ work: x.previous, stored: x.storedPrevious, rate: x.rate })), ret, sumToDate);
  const priorCompleted = rows.reduce((s, x) => s + x.previous + x.storedPrevious, 0);
  const expectedPrevious = priorCompleted - (prior.total - previouslyReleased);
  if (appNo > 1 && !prevGiven) flag('warning', 'previous_certificates_missing', `Application ${appNo} has no previous certificates entered, so the whole amount earned is shown as due. Enter the total certified on applications 1 to ${appNo - 1}.`);
  if (prevGiven && previousCertificates !== Math.max(0, expectedPrevious) && priorCompleted > 0) {
    flag('warning', 'previous_certificates_differ', `Previous certificates (${usd(previousCertificates)}) differ from the earlier work and stored materials less their retainage (${usd(expectedPrevious)}). That is expected when the last application was certified for a different amount; otherwise check the previous-work column against the last approved application.`);
  }
  if (due < 0) flag('warning', 'negative_due', `The amount due is ${usd(due)}: more was certified before than is earned now. Check the previous certificates and any reduced lines.`);

  // The state rule, when one was asked for.
  if (rule && rule.covered) {
    const cap = rule.capBp;
    const top = Math.max(rateBp, storedBp, ...rows.map((x) => x.rate ?? 0));
    if (cap !== null && cap !== undefined && top > (rule.maxBp ?? cap)) {
      flag('warning', 'above_state_cap', `The retainage rate (${pct(top)}) is above ${rule.state}'s ${pct(rule.maxBp ?? cap)} limit for this kind of project (${rule.cite}).`);
    } else if (cap !== null && cap !== undefined && top > cap) {
      flag('warning', 'above_state_default', `The retainage rate (${pct(top)}) is above ${rule.state}'s ${pct(cap)} limit; ${rule.cite} allows up to ${pct(rule.maxBp)} only when the owner or contractor decides a higher rate is needed to ensure performance.`);
    } else if (reduce && rule.reduce && reduce.toBp > rule.reduce.toBp) {
      flag('warning', 'above_state_cap', `After the reduction point the rate (${pct(reduce.toBp)}) is above ${rule.state}'s ${pct(rule.reduce.toBp)} (${rule.cite}).`);
    }
  }
  if (!checks.some((c) => c.level === 'error')) flag('ok', 'ties_out', `The schedule of values totals ${usd(sumToDate)} and every line is within its scheduled value; the summary below is worked out from the same lines.`);

  const summary = {
    originalContractSum: original,
    changeOrderAdditions: additions,
    changeOrderDeductions: deductions,
    netChangeOrders: netChange,
    contractSumToDate: sumToDate,
    completedAndStored: completed,
    completedWork: now.work,
    storedMaterials: now.stored,
    retainageOnWork: now.onWork,
    retainageOnStored: now.onStored,
    retainageReleased: releasedTotal,
    retainage,
    earnedLessRetainage: earned,
    previousCertificates,
    currentPaymentDue: due,
    balanceToFinishWithRetainage: balanceWithRetainage,
    percentComplete: shareText(completed, sumToDate),
    reductionReached: now.reduced,
  };
  return {
    applicationNumber: appNo,
    retainageRule: {
      rate: pct(rateBp),
      storedRate: pct(storedBp),
      reduction: reduce ? { at: pct(reduce.atBp), to: pct(reduce.toBp), mode: reduce.mode, point: now.point } : null,
      rounding,
    },
    rows: rows.map((x) => ({
      kind: x.kind, item: x.item, description: x.description, number: x.number,
      scheduled: x.scheduled, previous: x.previous, thisPeriod: x.thisPeriod, stored: x.stored,
      total: x.total, percent: x.percent, balance: x.balance, retainage: x.retainage, rate: x.rate === null ? null : pct(x.rate),
    })),
    pendingChangeOrders: cos.filter((c) => !c.executed).map((c) => ({ number: c.number, description: c.description, amount: c.scheduled })),
    summary,
    checks,
  };
}

// The summary in words, for the answer line and the API.
export function summaryLines(s) {
  return [
    ['Original contract sum', s.originalContractSum],
    ['Net change by change orders', s.netChangeOrders],
    ['Contract sum to date', s.contractSumToDate],
    ['Total completed and stored to date', s.completedAndStored],
    ['Retainage held', s.retainage],
    ['Total earned less retainage', s.earnedLessRetainage],
    ['Less previous certificates for payment', s.previousCertificates],
    ['Current payment due', s.currentPaymentDue],
    ['Balance to finish, including retainage', s.balanceToFinishWithRetainage],
  ];
}

// The continuation sheet as CSV rows (values, not formulas).
export const CSV_COLUMNS = ['item', 'description', 'scheduled_value', 'from_previous_applications', 'this_period', 'materials_presently_stored', 'total_completed_and_stored', 'percent', 'balance_to_finish', 'retainage'];
export function csvRows(result) {
  const rows = result.rows.map((x) => [x.item, x.description, plainAmount(x.scheduled), plainAmount(x.previous), plainAmount(x.thisPeriod), plainAmount(x.stored), plainAmount(x.total), x.percent ?? '', plainAmount(x.balance), x.retainage === null ? '' : plainAmount(x.retainage)]);
  const t = (k) => plainAmount(result.rows.reduce((s, x) => s + x[k], 0));
  const s = result.summary;
  rows.push(['TOTAL', '', t('scheduled'), t('previous'), t('thisPeriod'), t('stored'), t('total'), s.percentComplete ?? '', t('balance'), plainAmount(s.retainage)]);
  return rows;
}

export function toCsv(columns, rows) {
  const field = (v) => {
    let s = v === null || v === undefined ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s)) s = `'${s}`;
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [columns, ...rows].map((r) => r.map(field).join(',')).join('\r\n') + '\r\n';
}

// ---------- retainage calculators ----------

// forward: held and net on an amount; reverse: the gross billed behind a net payment; change
// order: retainage on the billed part of a change order; reduction: held under a reduction point.
export function retainageCalc(i) {
  const rate = toBp(i.rate);
  if (rate === null) refuse('rate', 'rate is a percent from 0 to 100, such as 10 or 5.');
  if (i.mode === 'forward') {
    const amount = toCents(i.amount);
    if (amount === null) refuse('amount', 'amount is the amount billed, in dollars.');
    const held = retainOf(amount, rate);
    return { mode: 'forward', rate: pct(rate), amount, held, net: amount - held };
  }
  if (i.mode === 'reverse') {
    const net = toCents(i.net);
    if (net === null) refuse('net', 'net is the payment received after retainage, in dollars.');
    if (rate >= 10000) refuse('rate', 'At 100% retainage nothing is paid, so there is no gross to find.');
    // The smallest gross whose rounded retainage leaves exactly this net. Below 100% the net grows
    // by 0 or 1 cent for each cent of gross, so one always exists; the fallback is a guard only.
    const guess = Math.floor((net * 10000) / (10000 - rate));
    for (let g = Math.max(0, guess - 2); g <= guess + 3; g += 1) {
      if (g - retainOf(g, rate) === net) return { mode: 'reverse', rate: pct(rate), net, gross: g, held: g - net, exact: true };
    }
    const g = Math.round((net * 10000) / (10000 - rate));
    return { mode: 'reverse', rate: pct(rate), net, gross: g, held: retainOf(g, rate), exact: false, note: `No billed amount in whole cents leaves exactly ${usd(net)} at ${pct(rate)}; ${usd(g)} leaves ${usd(g - retainOf(g, rate))}.` };
  }
  if (i.mode === 'change-order') {
    const amount = toCents(i.amount, { negative: true });
    if (amount === null) refuse('amount', 'amount is the change order amount, in dollars (negative for a deduction).');
    const billedBp = i.billedPercent === undefined ? 10000 : toBp(i.billedPercent);
    if (billedBp === null) refuse('billedPercent', 'billedPercent is the percent of the change order billed to date, 0 to 100.');
    const billed = retainOf(amount, billedBp);
    const held = retainOf(billed, rate);
    return { mode: 'change-order', rate: pct(rate), amount, billedPercent: pct(billedBp), billed, held, net: billed - held };
  }
  if (i.mode === 'reduction') {
    const contract = toCents(i.contractSum);
    const done = toCents(i.completed);
    const atBp = toBp(i.reduceAt);
    const toBpV = toBp(i.reducedRate);
    if (contract === null || contract === 0) refuse('contractSum', 'contractSum is the contract sum to date, in dollars.');
    if (done === null) refuse('completed', 'completed is the work completed to date, in dollars.');
    if (done > contract) refuse('completed', 'Work completed is more than the contract sum.');
    if (atBp === null || atBp === 0 || atBp >= 10000) refuse('reduceAt', 'reduceAt is the percent complete at which retainage drops, such as 50.');
    if (toBpV === null || toBpV > rate) refuse('reducedRate', 'reducedRate is the rate after the reduction point, no higher than rate.');
    const point = retainOf(contract, atBp);
    const subsequent = retainOf(Math.min(done, point), rate) + retainOf(Math.max(0, done - point), toBpV);
    const all = retainOf(done, done >= point ? toBpV : rate);
    const flat = retainOf(done, rate);
    return { mode: 'reduction', rate: pct(rate), reducedRate: pct(toBpV), reduceAt: pct(atBp), contractSum: contract, completed: done, point, reached: done >= point, heldSubsequent: subsequent, heldAll: all, heldWithoutReduction: flat };
  }
  return refuse('mode', 'mode is "forward", "reverse", "change-order" or "reduction".');
}

// Retainage release: what to bill now.
export function releaseCalc(i) {
  const held = toCents(i.heldToDate);
  const before = toCents(i.previouslyReleased ?? 0);
  if (held === null) refuse('heldToDate', 'heldToDate is the retainage held to date, in dollars.');
  if (before === null) refuse('previouslyReleased', 'previouslyReleased is retainage already released, in dollars.');
  if (before > held) refuse('previouslyReleased', 'More has been released than was held.');
  const left = held - before;
  let amount = left;
  let share = null;
  if (i.releasePercent !== undefined) {
    share = toBp(i.releasePercent);
    if (share === null) refuse('releasePercent', 'releasePercent is the percent of the remaining retainage to release, 0 to 100.');
    amount = retainOf(left, share);
  }
  return { heldToDate: held, previouslyReleased: before, remaining: left, releasePercent: share === null ? '100%' : pct(share), releaseNow: amount, stillHeld: left - amount };
}

// ---------- state rules ----------

// The rule that applies for a state, a kind of project and (where the statute turns on it) the
// contract's value. { covered: false, reason } when the statute was not read.
export function stateRule(states, code, scope, contractValueCents = null, ruleId = null) {
  const st = states.states.find((s) => s.code === code);
  if (!st) refuse('state', `${code} is not a US state code.`);
  const rules = (st.rules ?? []).filter((r) => r.scope === scope && (!ruleId || r.id === ruleId));
  if (!rules.length) {
    const why = scope === 'private' && st.notRead ? st.notRead : st.reason ?? `No ${st.name} ${scope}-project retainage statute was read on the state's own site, so ${st.name} ${scope} work is not covered.`;
    return { covered: false, state: st.name, code, scope, reason: why, readOn: states.readOn };
  }
  const r = rules[0];
  let capBp = r.capBp;
  let note = null;
  if (r.capByValue && contractValueCents !== null) {
    for (const band of r.capByValue) {
      if ((band.belowCents !== undefined && contractValueCents < band.belowCents) || (band.maxCents !== undefined && contractValueCents <= band.maxCents)) {
        capBp = band.capBp;
        note = band.note ?? null;
        break;
      }
    }
  }
  return {
    covered: true,
    state: st.name,
    code,
    scope,
    id: r.id,
    who: r.who,
    capBp,
    cap: capBp === null || capBp === undefined ? null : pct(capBp),
    short: r.short,
    maxBp: r.maxBp ?? null,
    reserveBp: r.reserveBp ?? null,
    reduce: r.reduce ?? null,
    summary: r.summary,
    release: r.release,
    timing: r.timing ?? null,
    note,
    valueMatters: Boolean(r.capByValue),
    cite: r.cite,
    url: r.url,
    readOn: states.readOn,
    others: rules.slice(1).map((x) => x.id),
  };
}

// The most a payer may hold at the end of a job of this size under a rule (null when the statute
// read sets no percentage).
export function maxHeld(rule, contractCents) {
  if (!rule.covered || rule.capBp === null || rule.capBp === undefined) return null;
  if (rule.reduce && rule.reduce.mode === 'subsequent') {
    const point = retainOf(contractCents, rule.reduce.atBp);
    return retainOf(point, rule.capBp) + retainOf(contractCents - point, rule.reduce.toBp);
  }
  return retainOf(contractCents, rule.capBp);
}
