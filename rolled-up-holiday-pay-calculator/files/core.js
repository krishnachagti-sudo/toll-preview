// Rolled-up holiday pay and 12.07% accrual for irregular-hours and part-year workers in Great
// Britain, as GOV.UK's guidance "Holiday pay and entitlement reforms from 1 January 2024" sets them
// out (read 2026-11-08). Pure and dependency-free: the page loads this same file.
//
// Money is whole pence and percentages are hundredths of a percent (12.07% is 1207), so every
// answer is integer arithmetic and the same input always gives the same pence.
//
//   rate        the accrual percentage for an entitlement: weeks / (52 - weeks) x 100, to 2 places
//   rolledUp    the holiday pay line for one pay period: pay x rate, rounded three ways
//   accrual     holiday hours accrued for hours worked, rounded to the hour (30 minutes up)
//   eligibility irregular-hours / part-year test and the 1 April 2024 leave-year start
//   reference   a week's holiday pay from the last 52 paid weeks (104 weeks at most)
//   leaveAccrual hours accrued while off sick or on statutory leave (GOV.UK section 3.3)
//   batch       a payroll CSV in, the same rows out with the holiday pay line and hours

export class HolidayError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'HolidayError';
    this.field = field;
  }
}
const fail = (message, field) => { throw new HolidayError(message, field); };

export const STATUTORY_WEEKS = 5.6;
export const STATUTORY_RATE = 1207; // 12.07%
export const FIRST_LEAVE_YEAR = '2024-04-01';
export const ROUNDINGS = ['nearest', 'up', 'govuk-steps'];
export const HOUR_ROUNDINGS = ['hour', 'half-hour-up', 'none'];
export const LIMITS = { rows: 5000, csvChars: 2_000_000, weeks: 104, payPence: 100_000_000_00, hours: 10_000 };

// ---------- numbers ----------

// Integer division rounded half up (both arguments positive, or a zero numerator).
const divRound = (n, d) => Math.floor((2 * n + d) / (2 * d));
const divCeil = (n, d) => Math.floor((n + d - 1) / d);
const grouped = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

// £1,234.56 from pence.
export const pounds = (p) => `${p < 0 ? '-' : ''}£${grouped(Math.floor(Math.abs(p) / 100))}.${String(Math.abs(p) % 100).padStart(2, '0')}`;
// "12.07%" from hundredths of a percent.
export const pctText = (r) => `${Math.floor(r / 100)}.${String(r % 100).padStart(2, '0')}%`;
// Hours to at most 4 places, without trailing zeros: 8.2076, 8, 3.5.
export const hoursText = (v) => {
  const s = Number(v).toFixed(4).replace(/\.?0+$/, '');
  const [a, b] = s.split('.');
  return b ? `${grouped(a)}.${b}` : grouped(a);
};

// A money amount ("£1,234.50", "1234.5", 1234.5) to pence. Up to 2 decimal places.
export function toPence(v, field = 'pay') {
  if (typeof v === 'number') {
    if (!Number.isFinite(v)) fail(`${field} must be a number of pounds.`, field);
    v = String(v);
  }
  if (typeof v !== 'string') fail(`${field} must be an amount of money such as 364.70.`, field);
  const s = v.trim().replace(/^£/, '').replace(/,/g, '').replace(/^\+/, '');
  if (s === '') fail(`${field} is empty.`, field);
  if (s.startsWith('-')) fail(`${field} cannot be negative: enter the pay for the period.`, field);
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) fail(`${field}: "${v}" is not an amount of money like 364.70 (pounds and pence).`, field);
  const pence = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'));
  if (pence > LIMITS.payPence) fail(`${field} is over £100,000,000.`, field);
  return pence;
}

// Hours ("68", "37.5", "7.25") to hundredths of an hour. Up to 2 decimal places.
export function toCentiHours(v, field = 'hours') {
  const s = String(v ?? '').trim().replace(/,/g, '');
  if (s === '') fail(`${field} is empty.`, field);
  const m = /^(\d+)(?:\.(\d{1,2}))?$/.exec(s);
  if (!m) fail(`${field}: "${v}" is not a number of hours like 68 or 37.5 (up to 2 decimal places).`, field);
  const c = Number(m[1]) * 100 + Number((m[2] ?? '').padEnd(2, '0'));
  if (c > LIMITS.hours * 100) fail(`${field} is over ${grouped(LIMITS.hours)} hours.`, field);
  return c;
}

// A decimal with up to `places` places to an integer scaled by 10^places.
function scaled(v, places, field, what) {
  const s = String(v ?? '').trim();
  const m = /^(\d+)(?:\.(\d+))?$/.exec(s);
  if (!m || (m[2] ?? '').length > places) fail(`${field}: "${v}" is not ${what} (up to ${places} decimal places).`, field);
  return Number(m[1]) * 10 ** places + Number((m[2] ?? '').padEnd(places, '0'));
}

export const isRealDate = (s) => {
  if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// "1 April 2024" (UK order).
export const longDate = (iso) => `${Number(iso.slice(8, 10))} ${MONTHS[Number(iso.slice(5, 7)) - 1]} ${iso.slice(0, 4)}`;

// ---------- the percentage ----------

// The accrual rate for an entitlement, in hundredths of a percent:
//   { weeks: 6 }                 6 / (52 - 6) x 100 = 13.04%
//   { days: 33, daysPerWeek: 5 } 33 days on a 5-day week = 6.6 weeks = 14.54%
//   {}                           the statutory 5.6 weeks = 12.07%
// GOV.UK: "(total holiday entitlement ÷ remaining working weeks in the year) x 100", shown to two
// decimal places (6 ÷ 46 = 0.1304, so 13.04%). Below 5.6 weeks is refused: that is the minimum.
export function rate(ent = {}) {
  const has = (k) => ent[k] !== undefined && ent[k] !== null && ent[k] !== '';
  if (has('weeks') && has('days')) fail('Give the entitlement in weeks or in days, not both.', 'weeks');
  let num;
  let den;
  let weeks;
  let basis;
  if (has('days')) {
    const d10 = scaled(ent.days, 1, 'days', 'a number of days');
    const dpw = Number(ent.daysPerWeek ?? 5);
    if (!Number.isInteger(dpw) || dpw < 1 || dpw > 5) {
      fail('daysPerWeek must be 1 to 5. On a 6 or 7-day week the 28-day cap on statutory leave applies, and GOV.UK gives no percentage for it.', 'daysPerWeek');
    }
    // weeks = days / dpw, so rate = days / (52 x dpw - days).
    num = d10;
    den = 520 * dpw - d10;
    weeks = d10 / 10 / dpw;
    basis = `${hoursText(d10 / 10)} days on a ${dpw}-day week = ${hoursText(Math.round(weeks * 10000) / 10000)} weeks`;
    if (d10 < 56 * dpw) fail(`${hoursText(d10 / 10)} days on a ${dpw}-day week is less than the statutory 5.6 weeks (${hoursText(5.6 * dpw)} days).`, 'days');
  } else {
    const w4 = has('weeks') ? scaled(ent.weeks, 4, 'weeks', 'a number of weeks') : 56000;
    num = w4;
    den = 520000 - w4;
    weeks = w4 / 10000;
    basis = `${hoursText(weeks)} weeks`;
    if (w4 < 56000) fail(`${hoursText(weeks)} weeks is less than the statutory minimum of 5.6 weeks.`, 'weeks');
  }
  if (weeks > 10) fail('An entitlement above 10 weeks a year is not supported.', has('days') ? 'days' : 'weeks');
  const r = divRound(num * 10000, den);
  const remaining = Math.round((52 - weeks) * 10000) / 10000;
  return {
    rate: r,
    percent: pctText(r),
    weeks: Math.round(weeks * 10000) / 10000,
    remainingWeeks: remaining,
    statutory: r === STATUTORY_RATE && Math.abs(weeks - STATUTORY_WEEKS) < 1e-9,
    basis,
    working: `${hoursText(Math.round(weeks * 10000) / 10000)} ÷ (52 - ${hoursText(Math.round(weeks * 10000) / 10000)}) = ${hoursText(Math.round(weeks * 10000) / 10000)} ÷ ${hoursText(remaining)} = ${pctText(r)}`,
  };
}

// ---------- the holiday pay line ----------

// Rolled-up holiday pay for one pay period. GOV.UK: "12.07% of a worker's total pay ... in a pay
// period", "clearly marked as a separate item on each payslip", "paid at the same time as the
// worker is paid for the work done". Rounding:
//   nearest     pay x rate, to the nearest penny (half a penny up). The default.
//   up          pay x rate, up to the next whole penny (never below the percentage).
//   govuk-steps GOV.UK's worked tables: pay ÷ 100 to the nearest penny, x 12.07, to the nearest
//               penny (Hana: £364.70 -> £3.65 -> £44.0555 -> £44.06).
// All three are returned so a payroll can see a difference before it chooses.
export function rolledUp({ payPence, rate: r = STATUTORY_RATE, rounding = 'nearest' }) {
  if (!ROUNDINGS.includes(rounding)) fail(`rounding is one of ${ROUNDINGS.join(', ')}.`, 'rounding');
  const exact = payPence * r; // in 1/10000 of a penny
  const nearest = divRound(exact, 10000);
  const up = divCeil(exact, 10000);
  const step1 = divRound(payPence, 100); // pay ÷ 100, in pence
  const steps = divRound(step1 * r, 100);
  const all = { nearest, up, 'govuk-steps': steps };
  const amount = all[rounding];
  const exactText = (() => {
    const whole = Math.floor(exact / 10000);
    const frac = String(exact % 10000).padStart(4, '0').replace(/0+$/, '');
    return `£${grouped(Math.floor(whole / 100))}.${String(whole % 100).padStart(2, '0')}${frac}`;
  })();
  return {
    amount,
    display: pounds(amount),
    rounding,
    exact: exactText,
    byRounding: { nearest: pounds(nearest), up: pounds(up), 'govuk-steps': pounds(steps) },
    differs: new Set(Object.values(all)).size > 1,
    working: rounding === 'govuk-steps'
      ? `${pounds(payPence)} ÷ 100 = ${pounds(step1)}; ${pounds(step1)} x ${pctText(r).replace('%', '')} = £${(step1 * r / 10000).toFixed(4).replace(/0+$/, '').replace(/\.$/, '')}, to the nearest penny ${pounds(steps)}`
      : `${pounds(payPence)} x ${pctText(r)} = ${exactText}, ${rounding === 'up' ? 'up to the next penny' : 'to the nearest penny'} ${pounds(amount)}`,
  };
}

// The payslip line, as it would read: "Rolled-up holiday pay (12.07%)  £44.02".
export const payslipLabel = (r = STATUTORY_RATE) => `Rolled-up holiday pay (${pctText(r)})`;

// ---------- holiday hours accrued ----------

// Hours of holiday accrued for hours worked in a pay period: hours x rate. GOV.UK: "Round up or
// down to the nearest hour" ... "rounded up to one hour if it is 30 minutes or more" (Jill: 68
// hours -> 8.2076 -> 8). half-hour-up is GOV.UK's note for workers on 4 hours a week or less ("it
// may be appropriate ... to round up to the next half hour or hour"); none keeps 4 places.
export function accrual({ centiHours, rate: r = STATUTORY_RATE, hourRounding = 'hour' }) {
  if (!HOUR_ROUNDINGS.includes(hourRounding)) fail(`hourRounding is one of ${HOUR_ROUNDINGS.join(', ')}.`, 'hourRounding');
  const micro = centiHours * r; // millionths of an hour
  const exact = micro / 1_000_000;
  let hours;
  if (hourRounding === 'hour') hours = Math.floor(micro / 1_000_000) + (micro % 1_000_000 >= 500_000 ? 1 : 0);
  else if (hourRounding === 'half-hour-up') hours = divCeil(micro, 500_000) / 2;
  else hours = Math.round(micro / 100) / 10000;
  const minutes = Math.round((micro % 1_000_000) * 60 / 1_000_000);
  return {
    hours,
    exact: Math.round(exact * 10000) / 10000,
    hourRounding,
    working: `${hoursText(centiHours / 100)} x ${pctText(r)} = ${hoursText(Math.round(exact * 10000) / 10000)} hours (${Math.floor(exact)} hours ${minutes} minutes)${hourRounding === 'none' ? '' : `, ${hourRounding === 'hour' ? 'to the nearest hour' : 'up to the next half hour'}: ${hoursText(hours)}`}`,
  };
}

// ---------- who can be paid it ----------

export const VARIABILITY = ['wholly-variable', 'mostly-variable', 'fixed'];

// The two definitions (GOV.UK reforms guidance section 2) and the leave-year start (section 6.2).
// The contract facts are the user's; the tool applies them.
export function eligibility({ hours, unpaidWeeks = false, leaveYearStart }) {
  if (hours !== undefined && !VARIABILITY.includes(hours)) fail(`hours is one of ${VARIABILITY.join(', ')}.`, 'hours');
  if (leaveYearStart !== undefined && !isRealDate(leaveYearStart)) fail('leaveYearStart must be a real date like 2026-04-01.', 'leaveYearStart');
  const irregular = hours === 'wholly-variable' || hours === 'mostly-variable';
  const partYear = Boolean(unpaidWeeks);
  const kind = irregular && partYear ? 'irregular-hours and part-year' : irregular ? 'irregular-hours' : partYear ? 'part-year' : 'regular-hours';
  const yearOk = leaveYearStart === undefined ? null : leaveYearStart >= FIRST_LEAVE_YEAR;
  const allowed = (irregular || partYear) && yearOk !== false;
  const reasons = [];
  if (irregular) reasons.push(`Paid hours in each pay period are ${hours === 'wholly-variable' ? 'wholly' : 'mostly'} variable under the contract: an irregular-hours worker.`);
  if (partYear) reasons.push('The contract requires work for only part of the year, with periods of at least a week not required to work and not paid: a part-year worker.');
  if (!irregular && !partYear) reasons.push('Hours are fixed under the contract (a rotating fixed pattern counts as fixed) and there is no unpaid break of a week or more: a regular-hours worker. Rolled-up holiday pay is not allowed; pay holiday when it is taken.');
  if (yearOk === false) reasons.push(`The leave year began on ${longDate(leaveYearStart)}, before 1 April 2024: rolled-up pay and the 12.07% accrual start with the first leave year beginning on or after 1 April 2024.`);
  if (yearOk === null && (irregular || partYear)) reasons.push('Rolled-up pay applies only in leave years beginning on or after 1 April 2024: check the leave year.');
  return {
    kind,
    irregular,
    partYear,
    rolledUpAllowed: allowed,
    accrual: allowed ? '12.07% of hours worked each pay period (or the enhanced rate)' : irregular || partYear ? 'the old method until the leave year renews' : '5.6 weeks, pro rata (one twelfth a month in the first year)',
    answer: allowed
      ? `This is ${/^[aeiou]/.test(kind) ? 'an' : 'a'} ${kind} worker${yearOk ? ` with a leave year from ${longDate(leaveYearStart)}` : ''}, so rolled-up holiday pay can be used${yearOk === null ? ' in leave years beginning on or after 1 April 2024' : ''}, as a separate payslip item paid with the work.`
      : irregular || partYear
        ? `This is ${/^[aeiou]/.test(kind) ? 'an' : 'a'} ${kind} worker, but the leave year began on ${longDate(leaveYearStart)}: rolled-up holiday pay can be used from the first leave year beginning on or after 1 April 2024.`
        : 'This is a regular-hours worker: rolled-up holiday pay is not allowed. Holiday is paid when it is taken, at a week\'s pay.',
    reasons,
  };
}

// ---------- the 52-week reference period ----------

// A week's holiday pay from the last 52 weeks with pay (GOV.UK section 6.3 and 6.4): weeks are
// listed most recent first; weeks with no pay and weeks with any sick or statutory leave are
// skipped and earlier weeks counted instead, never more than 104 weeks back; with fewer paid weeks,
// the average is over those. The average is rounded to the nearest penny (£12,040 ÷ 52 = £231.54).
//   weeks: [{ pay, excluded? }]   excluded: 'sick' | 'statutory' (or true)
export function reference({ weeks, leaveWeeks }) {
  if (!Array.isArray(weeks) || !weeks.length) fail('List the weekly pay, most recent week first.', 'weeks');
  if (weeks.length > LIMITS.weeks) fail(`At most ${LIMITS.weeks} weeks: weeks before the 104 complete weeks before the holiday are not counted.`, 'weeks');
  const used = [];
  const skipped = { unpaid: 0, excluded: 0 };
  weeks.forEach((w, i) => {
    const pay = toPence(w.pay ?? w, `weeks[${i}].pay`);
    if (w.excluded) { skipped.excluded += 1; return; }
    if (pay === 0) { skipped.unpaid += 1; return; }
    if (used.length < 52) used.push({ week: i + 1, pay });
  });
  if (!used.length) fail('No week in the list has pay. GOV.UK: with no pay data, pay an amount that fairly represents the worker\'s pay for the leave.', 'weeks');
  const total = used.reduce((s, w) => s + w.pay, 0);
  const average = divRound(total, used.length);
  const lastWeek = used.at(-1).week;
  let holiday = null;
  if (leaveWeeks !== undefined && leaveWeeks !== null && leaveWeeks !== '') {
    const lw = scaled(leaveWeeks, 2, 'leaveWeeks', 'a number of weeks');
    if (lw === 0 || lw > 1000) fail('leaveWeeks must be above 0 and at most 10 weeks.', 'leaveWeeks');
    holiday = { weeks: lw / 100, amount: divRound(total * lw, used.length * 100) };
    holiday.display = pounds(holiday.amount);
  }
  return {
    paidWeeks: used.length,
    weeksLookedAt: lastWeek,
    skipped,
    total,
    average,
    display: pounds(average),
    holiday,
    short: used.length < 52,
    working: `${pounds(total)} ÷ ${used.length} paid week${used.length === 1 ? '' : 's'} = ${pounds(average)} a week`,
  };
}

// ---------- accrual while off sick or on statutory leave ----------

// GOV.UK section 3.3, Table 3: average weekly hours in the relevant period (hours ÷ 46.4, the
// guidance's recommended divisor, or another), x rate, x weeks of leave, each step to 3 decimal
// places, then to the nearest hour (Harriet: 1,032 hours, 40 weeks -> 107 hours).
export function leaveAccrual({ centiHours, weeksOff, divisor = '46.4', rate: r = STATUTORY_RATE }) {
  const d10 = scaled(divisor, 1, 'divisor', 'a number of weeks');
  if (d10 < 10 || d10 > 520) fail('divisor must be from 1 to 52 weeks.', 'divisor');
  const w100 = scaled(weeksOff, 2, 'weeksOff', 'a number of weeks');
  if (w100 === 0 || w100 > 10400) fail('weeksOff must be above 0 and at most 104 weeks.', 'weeksOff');
  const avg = divRound(centiHours * 100, d10); // thousandths of an hour a week
  const perWeek = divRound(avg * r, 10000); // thousandths
  const total = perWeek * w100; // in units of 0.00001 hour
  const hours = Math.floor(total / 100_000) + (total % 100_000 >= 50_000 ? 1 : 0);
  const t3 = (n) => hoursText(n / 1000);
  return {
    averageWeeklyHours: avg / 1000,
    accruedPerWeek: perWeek / 1000,
    exact: total / 100_000,
    hours,
    steps: [
      `${hoursText(centiHours / 100)} hours ÷ ${hoursText(d10 / 10)} = ${t3(avg)} hours a week`,
      `${t3(avg)} ÷ 100 x ${pctText(r).replace('%', '')} = ${t3(perWeek)} hours of holiday a week`,
      `${t3(perWeek)} x ${hoursText(w100 / 100)} weeks = ${hoursText(total / 100_000)}`,
      `to the nearest hour: ${hours}`,
    ],
  };
}

// ---------- one worker, one pay period ----------

// pay: a total, or lines [{ label, amount }] added together (GOV.UK bases the line on total pay
// in the pay period, premium-rate hours included, Table 7).
export function calculate(input) {
  const lines = input.lines?.length ? input.lines.map((l, i) => ({ label: String(l.label ?? `Line ${i + 1}`).slice(0, 60), pence: toPence(l.amount, `lines[${i}].amount`) })) : null;
  if (lines && input.pay !== undefined && input.pay !== null && input.pay !== '') fail('Give pay as a total or as lines, not both.', 'pay');
  const payPence = lines ? lines.reduce((s, l) => s + l.pence, 0) : toPence(input.pay ?? '', 'pay');
  const ent = rate(input.entitlement ?? {});
  const line = rolledUp({ payPence, rate: ent.rate, rounding: input.rounding ?? 'nearest' });
  const hasHours = input.hours !== undefined && input.hours !== null && input.hours !== '';
  const acc = hasHours ? accrual({ centiHours: toCentiHours(input.hours), rate: ent.rate, hourRounding: input.hourRounding ?? 'hour' }) : null;
  const elig = input.worker ? eligibility(input.worker) : null;
  const allowed = elig ? elig.rolledUpAllowed : true;
  const label = payslipLabel(ent.rate);
  const answer = allowed
    ? `On total pay of ${pounds(payPence)} this pay period, rolled-up holiday pay is ${line.display} (${ent.percent}), shown as a separate payslip line${acc ? `; the worker also accrues ${hoursText(acc.hours)} hour${acc.hours === 1 ? '' : 's'} of holiday` : ''}.`
    : `${elig.answer} At ${ent.percent} the line would have been ${line.display}${acc ? `; holiday accrues as ${elig.accrual}` : ''}.`;
  return {
    op: 'calculate',
    answer,
    allowed,
    pay: { pence: payPence, display: pounds(payPence), lines: lines?.map((l) => ({ label: l.label, display: pounds(l.pence) })) ?? null },
    rate: ent,
    holidayPay: line,
    payslip: allowed ? [
      ...(lines ? lines.map((l) => ({ item: l.label, amount: pounds(l.pence) })) : [{ item: 'Pay for work done this period', amount: pounds(payPence) }]),
      { item: label, amount: line.display },
      { item: 'Gross pay', amount: pounds(payPence + line.amount) },
    ] : null,
    accrual: acc,
    eligibility: elig,
  };
}

// ---------- the payroll CSV ----------

// RFC 4180 CSV: quoted fields, doubled quotes, CRLF or LF. A leading BOM is dropped.
export function parseCsv(text) {
  if (typeof text !== 'string') fail('csv must be text.', 'csv');
  if (text.length > LIMITS.csvChars) fail('The CSV is over 2,000,000 characters: split the payroll.', 'csv');
  const s = text.replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let field = '';
  let q = false;
  for (let i = 0; i < s.length; i += 1) {
    const c = s[i];
    if (q) {
      if (c === '"' && s[i + 1] === '"') { field += '"'; i += 1; } else if (c === '"') q = false; else field += c;
    } else if (c === '"' && field === '') q = true;
    else if (c === ',') { row.push(field); field = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i += 1;
      row.push(field); field = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  if (q) fail('A quoted field in the CSV is never closed.', 'csv');
  row.push(field);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

const csvCell = (v) => {
  const s = String(v ?? '');
  // A cell that a spreadsheet would read as a formula is prefixed with an apostrophe.
  const safe = /^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};
export const toCsv = (rows) => `${rows.map((r) => r.map(csvCell).join(',')).join('\r\n')}\r\n`;

const norm = (h) => h.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
const ALIASES = {
  worker: ['worker', 'name', 'employee', 'employee_name', 'worker_name', 'staff', 'employee_id', 'worker_id', 'payroll_id'],
  periodEnd: ['period_end', 'pay_period_end', 'period_ending', 'pay_date', 'week_ending', 'period'],
  total: ['pay', 'total_pay', 'gross_pay', 'gross', 'total'],
  hours: ['hours', 'hours_worked', 'total_hours'],
  workerType: ['worker_type', 'type', 'contract_type'],
  leaveYearStart: ['leave_year_start', 'leave_year'],
  weeks: ['entitlement_weeks', 'weeks'],
  days: ['entitlement_days', 'days'],
  daysPerWeek: ['days_per_week'],
};
// Pay parts added together when there is no total column.
export const PAY_PARTS = ['basic', 'basic_pay', 'overtime', 'overtime_pay', 'commission', 'bonus', 'premium', 'premium_pay', 'enhanced_pay', 'shift_premium', 'other_pay', 'allowance', 'tips'];
const TYPES = {
  irregular: 'irregular', 'irregular-hours': 'irregular', 'irregular_hours': 'irregular', 'zero-hours': 'irregular', 'zero hours': 'irregular', casual: 'irregular', bank: 'irregular', agency: 'irregular',
  'part-year': 'part-year', 'part year': 'part-year', 'part_year': 'part-year', 'term-time': 'part-year', 'term time': 'part-year', seasonal: 'part-year',
  regular: 'regular', fixed: 'regular', salaried: 'regular', 'fixed-hours': 'regular',
};

// A payroll CSV in, every row out with the holiday pay line and hours. Columns are matched by
// name (case and spacing ignored, see ALIASES). Pay is the total column, or the pay parts added.
// options: { periodEnd, leaveYearStart, entitlement, rounding, hourRounding } for every row.
export function batch(csvText, options = {}) {
  const table = parseCsv(csvText);
  if (table.length < 2) fail('The CSV needs a header row and at least one worker.', 'csv');
  const header = table[0].map(norm);
  const col = {};
  for (const [key, names] of Object.entries(ALIASES)) {
    const i = header.findIndex((h) => names.includes(h));
    if (i >= 0) col[key] = i;
  }
  const parts = header.map((h, i) => (PAY_PARTS.includes(h) ? i : -1)).filter((i) => i >= 0);
  if (col.worker === undefined) fail('No worker column: name one "worker", "name" or "employee".', 'csv');
  if (col.total === undefined && !parts.length) fail(`No pay column: name one "pay" (the total), or pay parts such as ${PAY_PARTS.slice(0, 4).join(', ')}.`, 'csv');
  if (col.periodEnd === undefined && !options.periodEnd) fail('Each row needs its pay period: add a "period_end" column, or give periodEnd for the whole file.', 'periodEnd');
  if (options.periodEnd !== undefined && !isRealDate(options.periodEnd)) fail('periodEnd must be a real date like 2026-11-06.', 'periodEnd');
  const rows = table.slice(1);
  if (rows.length > LIMITS.rows) fail(`At most ${grouped(LIMITS.rows)} rows in one file.`, 'csv');
  const defaultRate = rate(options.entitlement ?? {});
  const rounding = options.rounding ?? 'nearest';
  const hourRounding = options.hourRounding ?? 'hour';
  if (!ROUNDINGS.includes(rounding)) fail(`rounding is one of ${ROUNDINGS.join(', ')}.`, 'rounding');
  if (!HOUR_ROUNDINGS.includes(hourRounding)) fail(`hourRounding is one of ${HOUR_ROUNDINGS.join(', ')}.`, 'hourRounding');
  if (options.leaveYearStart !== undefined && !isRealDate(options.leaveYearStart)) fail('leaveYearStart must be a real date like 2026-04-01.', 'leaveYearStart');
  const seen = new Map();
  const out = [];
  const totals = { rows: 0, paid: 0, refused: 0, payPence: 0, holidayPence: 0, accruedHours: 0 };
  rows.forEach((cells, idx) => {
    const line = idx + 2;
    const cell = (k) => (col[k] === undefined ? '' : String(cells[col[k]] ?? '').trim());
    const worker = cell('worker');
    const periodEnd = cell('periodEnd') || options.periodEnd;
    const base = { line, worker, periodEnd };
    try {
      if (!worker) fail(`Line ${line}: no worker.`, 'csv');
      if (!isRealDate(periodEnd)) fail(`Line ${line}: period end "${periodEnd}" is not a date like 2026-11-06.`, 'csv');
      const payPence = col.total !== undefined && cell('total') !== ''
        ? toPence(cell('total'), `line ${line} pay`)
        : parts.reduce((s, i) => s + (String(cells[i] ?? '').trim() === '' ? 0 : toPence(String(cells[i]).trim(), `line ${line} ${header[i]}`)), 0);
      const ent = cell('weeks') || cell('days')
        ? rate({ weeks: cell('weeks') || undefined, days: cell('days') || undefined, daysPerWeek: cell('daysPerWeek') || undefined })
        : defaultRate;
      const typeRaw = cell('workerType').toLowerCase();
      const type = typeRaw ? TYPES[typeRaw] : null;
      if (typeRaw && !type) fail(`Line ${line}: worker type "${cell('workerType')}" is not irregular, part-year or regular.`, 'csv');
      const lys = cell('leaveYearStart') || options.leaveYearStart;
      if (lys && !isRealDate(lys)) fail(`Line ${line}: leave year start "${lys}" is not a date.`, 'csv');
      let status = 'paid';
      let note = type ? '' : 'Assumed irregular-hours or part-year (no worker type given).';
      if (type === 'regular') { status = 'not-allowed'; note = 'Regular-hours worker: rolled-up pay not allowed; pay holiday when taken.'; }
      if (status === 'paid' && lys && lys < FIRST_LEAVE_YEAR) { status = 'not-allowed'; note = `Leave year began ${lys}, before 1 April 2024.`; }
      const hp = rolledUp({ payPence, rate: ent.rate, rounding });
      const hasHours = cell('hours') !== '';
      const acc = hasHours ? accrual({ centiHours: toCentiHours(cell('hours'), `line ${line} hours`), rate: ent.rate, hourRounding }) : null;
      const key = `${periodEnd}|${worker.toLowerCase().replace(/\s+/g, ' ')}`;
      const n = (seen.get(key) ?? 0) + 1;
      seen.set(key, n);
      const r = {
        ...base,
        key: n === 1 ? key : `${key}|${n}`,
        status,
        payPence,
        pay: pounds(payPence),
        rate: ent.percent,
        holidayPence: status === 'paid' ? hp.amount : 0,
        holidayPay: status === 'paid' ? hp.display : '',
        accruedHours: status === 'paid' && acc ? acc.hours : null,
        payslipLine: status === 'paid' ? `${payslipLabel(ent.rate)} ${hp.display}` : '',
        note: [note, status === 'paid' && hp.differs && rounding !== 'govuk-steps' ? `GOV.UK's worked-example steps give ${hp.byRounding['govuk-steps']}.` : ''].filter(Boolean).join(' '),
        cells,
      };
      totals.rows += 1;
      if (status === 'paid') {
        totals.paid += 1;
        totals.payPence += payPence;
        totals.holidayPence += hp.amount;
        if (acc) totals.accruedHours += acc.hours;
      } else totals.refused += 1;
      out.push(r);
    } catch (e) {
      if (!(e instanceof HolidayError)) throw e;
      totals.rows += 1;
      totals.refused += 1;
      out.push({ ...base, key: null, status: 'error', note: e.message, cells, holidayPay: '', payslipLine: '', rate: '', accruedHours: null, holidayPence: 0 });
    }
  });
  totals.accruedHours = Math.round(totals.accruedHours * 100) / 100;
  const width = table[0].length;
  const csv = toCsv([
    [...table[0], 'holiday_pay_rate', 'rolled_up_holiday_pay', 'accrued_holiday_hours', 'payslip_line', 'status', 'note'],
    ...out.map((r) => [...Array.from({ length: width }, (_, i) => r.cells[i] ?? ''), r.rate, r.holidayPay ? r.holidayPay.replace('£', '').replace(/,/g, '') : '', r.accruedHours ?? '', r.payslipLine, r.status, r.note]),
  ]);
  const errors = out.filter((r) => r.status === 'error').length;
  return {
    op: 'batch',
    answer: `${grouped(totals.paid)} of ${grouped(totals.rows)} worker row${totals.rows === 1 ? '' : 's'} get a rolled-up holiday pay line: ${pounds(totals.holidayPence)} in all on ${pounds(totals.payPence)} of pay${totals.accruedHours ? `, and ${hoursText(totals.accruedHours)} hours of holiday accrued` : ''}${totals.refused - errors ? `; ${totals.refused - errors} ${totals.refused - errors === 1 ? 'row is' : 'rows are'} not allowed rolled-up pay` : ''}${errors ? `; ${errors} ${errors === 1 ? 'row' : 'rows'} could not be read` : ''}.`,
    totals: { ...totals, pay: pounds(totals.payPence), holidayPay: pounds(totals.holidayPence), errors },
    rounding,
    hourRounding,
    payColumns: col.total !== undefined ? [table[0][col.total]] : parts.map((i) => table[0][i]),
    rows: out.map(({ cells, ...r }) => r),
    csv,
  };
}

// The keys a batch is charged by: one per row with a worker and a real period end (rows that fail
// to read are not charged). A re-run of the same rows is a repeat of the same keys.
export function batchKeys(csvText, options = {}) {
  try {
    return batch(csvText, options).rows.filter((r) => r.key).map((r) => r.key);
  } catch (e) {
    if (e instanceof HolidayError) return [];
    throw e;
  }
}
