// The security-deposit engine: for a move-out in a state whose statute we have read, works out the
// day the itemized statement (and any refund) is due from the clock trigger that statute names,
// checks the deductions and delivery against the statute's own requirements, shows the statutory
// penalty if the deadline or a requirement is missed, and assembles the letter's clauses.
//
// Pure and dependency-free, so the browser loads this same file: no imports, no Node APIs. The rule
// rows come in as data (tool.js reads data/states.json, the page reads the tool's published rules
// example). Money is whole cents throughout. Nothing here decides what is wear and tear, whether a
// cost is reasonable or whether anyone acted in bad faith: those are the landlord's and a court's.

export class DepositError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'DepositError';
    this.field = field;
  }
}

// ---------- dates ----------

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isRealDate(s) {
  const m = ISO.exec(String(s));
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}
export function addDays(iso, n) {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
const dayNumber = (iso) => Math.round(Date.parse(`${iso}T00:00:00Z`) / 86_400_000);
export const daysBetween = (a, b) => dayNumber(b) - dayNumber(a);
export const weekday = (iso) => new Date(`${iso}T00:00:00Z`).getUTCDay();
export const weekdayName = (iso) => WEEKDAYS[weekday(iso)];
// "July 1, 2026"
export const longDate = (iso) => `${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}, ${iso.slice(0, 4)}`;
const ymd = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// The nth weekday of a month (nth -1 is the last), as ISO text.
function nthWeekday(y, month, wd, nth) {
  if (nth > 0) {
    const first = weekday(ymd(y, month, 1));
    return ymd(y, month, 1 + ((wd - first + 7) % 7) + (nth - 1) * 7);
  }
  const lastDay = new Date(Date.UTC(y, month, 0)).getUTCDate();
  const last = weekday(ymd(y, month, lastDay));
  return ymd(y, month, lastDay - ((last - wd + 7) % 7));
}

// The legal holidays of one year that fall on a weekday under a state's holiday rows (data/states.json
// holidays.days): fixed dates with their Sunday-to-Monday and Saturday-to-Friday moves, and nth
// weekdays. A move can cross into the next or the previous year (January 1 on a Saturday is
// observed on December 31), so callers ask for the years around a date.
export function holidaysOf(rows, y) {
  const out = new Map();
  for (const r of rows) {
    let day;
    if (r.date) {
      day = `${y}-${r.date}`;
      const wd = weekday(day);
      if (wd === 0 && r.sundayToMonday) day = addDays(day, 1);
      else if (wd === 6 && r.saturdayToFriday) day = addDays(day, -1);
    } else {
      day = nthWeekday(y, r.month, r.weekday, r.nth);
    }
    out.set(day, r.name);
  }
  return out;
}

// ---------- money ----------

const grouped = (s) => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
// Cents to "$1,234.56".
export function usd(cents) {
  const neg = cents < 0;
  const abs = Math.abs(cents);
  return `${neg ? '-' : ''}$${grouped(String(Math.floor(abs / 100)))}.${String(abs % 100).padStart(2, '0')}`;
}
// A dollar amount (number, or text such as "1,200.50") to whole cents, or null when it is not one.
export function toCents(value) {
  const s = String(value ?? '').trim().replace(/^\$/, '').replace(/,/g, '');
  if (!/^\d{1,9}(\.\d{1,2})?$/.test(s)) return null;
  const [whole, frac = ''] = s.split('.');
  return Number(whole) * 100 + Number(frac.padEnd(2, '0'));
}

// ---------- the vocabulary ----------

export const CATEGORIES = {
  rent: 'Unpaid rent',
  repair: 'Repair of damage',
  cleaning: 'Cleaning',
  utilities: 'Utilities',
  storage: 'Moving and storage of belongings',
  other: 'Other charge',
};
export const CATEGORY_KEYS = Object.keys(CATEGORIES);
// How a deduction's cost is shown: a bill from whoever did the work, a supplier's receipt, an
// estimate (work not done yet), the landlord's own labor (hours x rate), or nothing.
export const DOCS = {
  invoice: 'Invoice or bill from the person who did the work',
  receipt: 'Receipt for materials or supplies',
  estimate: 'Estimate (work not finished or bill not received yet)',
  'own-labor': 'Own or employee labor (hours and hourly rate)',
  none: 'No document',
};
export const DOC_KEYS = Object.keys(DOCS);
export const DELIVERY = {
  'first-class': 'First-class mail',
  certified: 'Certified mail',
  personal: 'Personal delivery',
  email: 'E-mail',
};
export const DELIVERY_KEYS = Object.keys(DELIVERY);
// The dates a statute's clock can start from. moveOut is the day the tenant moved out, surrendered
// the keys or gave back possession; tenancyEnd the day the lease or tenancy ended.
export const DATE_FIELDS = {
  moveOut: 'the day the tenant moved out and gave back possession',
  tenancyEnd: 'the day the lease or tenancy ended',
  tenantDemand: 'the day the tenant demanded the deposit',
  abandonmentLearned: 'the day you learned the tenant abandoned the unit',
  forwardingAddress: 'the day the tenant gave a forwarding address in writing',
  noticeSent: 'the day you sent the notice of intention to impose a claim',
};

const isDamage = (d) => d.category === 'repair' || d.category === 'cleaning';
const wordsOfDays = (n, count) => `${n} ${count === 'business' ? 'business days (excluding Saturdays, Sundays and legal holidays)' : 'calendar days'}`;

// ---------- the engine ----------

export function makeEngine(data) {
  const rows = data.states;
  const order = data.order;
  const COVERED = order.map((c) => rows[c].name);

  function rule(code) {
    const c = String(code ?? '').trim().toUpperCase();
    const row = rows[c];
    if (!row) {
      throw new DepositError(`${c ? `We have not verified the ${c} statute yet, so this tool does not answer for it` : 'Name a state'}. States covered: ${COVERED.join(', ')}.`, 'state');
    }
    return row;
  }

  // The move-out dates must sit in the window the loaded statute text is good for: older move-outs
  // may fall under earlier wording (California's 2025 photo rules, Florida's 2025 e-mail notices).
  function inWindow(iso, field) {
    if (iso < data.appliesFrom) throw new DepositError(`Rules for move-outs before ${longDate(data.appliesFrom)} are not loaded: the statutes changed before then and only the text read in ${data.readOn.slice(0, 4)} is held.`, field);
    if (iso > data.appliesTo) throw new DepositError(`Move-outs after ${longDate(data.appliesTo)} are not covered until the statutes are read again.`, field);
  }

  function dateOf(input, key, { required = false } = {}) {
    const v = input[key];
    if (v === undefined || v === null || v === '') {
      if (required) throw new DepositError(`Give ${DATE_FIELDS[key]}, written like 2026-07-31.`, key);
      return null;
    }
    if (!isRealDate(v)) throw new DepositError(`${key} is not a real date written like 2026-07-31.`, key);
    return v;
  }

  // Counting n days from a trigger: calendar days, or business days that skip Saturdays, Sundays and
  // the state's legal holidays (with the days skipped listed, so the count can be checked by hand).
  function countFrom(row, from, n, count) {
    if (count !== 'business') return { date: addDays(from, n), skipped: [] };
    const y = +from.slice(0, 4);
    const hol = new Map([...holidaysOf(row.holidays.days, y - 1), ...holidaysOf(row.holidays.days, y), ...holidaysOf(row.holidays.days, y + 1)]);
    let day = from;
    let left = n;
    const skipped = [];
    while (left > 0) {
      day = addDays(day, 1);
      const wd = weekday(day);
      if (wd === 0 || wd === 6) continue;
      if (hol.has(day)) { skipped.push({ date: day, name: hol.get(day) }); continue; }
      left -= 1;
    }
    return { date: day, skipped };
  }

  // The day the clock starts, from the trigger the statute names, and what was assumed.
  function triggerOf(row, input) {
    const moveOut = dateOf(input, 'moveOut', { required: true });
    inWindow(moveOut, 'moveOut');
    const end = dateOf(input, 'tenancyEnd');
    const assumptions = [];
    const tenancyEnd = end ?? moveOut;
    if (!end && row.deadline.trigger !== 'moveOut') assumptions.push('The lease or tenancy is taken to have ended on the move-out day; give tenancyEnd if it ended on another day.');
    const t = row.deadline.trigger;
    if (t === 'moveOut') return { date: moveOut, used: 'moveOut', assumptions };
    if (t === 'tenancyEnd') {
      if (!end) assumptions.splice(0, 1, 'The rental agreement is taken to have terminated on the move-out day; give tenancyEnd if it ended on another day.');
      return { date: tenancyEnd, used: end ? 'tenancyEnd' : 'moveOut', assumptions };
    }
    if (t === 'earlier') return tenancyEnd < moveOut ? { date: tenancyEnd, used: 'tenancyEnd', assumptions } : { date: moveOut, used: 'moveOut', assumptions };
    if (row.code === 'WA') {
      const learned = dateOf(input, 'abandonmentLearned');
      if (learned) {
        if (learned < moveOut) throw new DepositError('The day you learned of the abandonment cannot be before the tenant left.', 'abandonmentLearned');
        return { date: learned, used: 'abandonmentLearned', assumptions: [] };
      }
    }
    if (t === 'latest') {
      const demand = dateOf(input, 'tenantDemand');
      const base = tenancyEnd > moveOut ? { date: tenancyEnd, used: 'tenancyEnd' } : { date: moveOut, used: 'moveOut' };
      if (!demand) return { ...base, assumptions, waiting: 'tenantDemand' };
      if (demand > base.date) return { date: demand, used: 'tenantDemand', assumptions };
      return { ...base, assumptions };
    }
    return tenancyEnd > moveOut ? { date: tenancyEnd, used: 'tenancyEnd', assumptions } : { date: moveOut, used: 'moveOut', assumptions };
  }

  // ---------- the due date ----------

  function deadline(input) {
    const row = rule(input.state);
    const asOf = dateOf(input, 'asOf');
    const hasDeductions = input.hasDeductions !== false;
    const d = row.deadline;
    const trig = triggerOf(row, input);
    const notes = [...trig.assumptions];
    const out = {
      state: row.code,
      stateName: row.name,
      law: row.law,
      applies: true,
      trigger: { date: trig.date, field: trig.used, words: d.triggerWords },
      days: d.days,
      count: d.count,
      dueDate: null,
      dueWords: null,
      mailing: row.mailing,
      steps: [],
      notes,
      quote: row.quotes[d.quote],
      cite: d.cite,
    };

    // Illinois section 1 binds only lessors of buildings with 5 or more units.
    if (row.code === 'IL') {
      if (input.units === undefined || input.units === null) {
        notes.push(`Section 1 applies to residential property containing ${d.minUnits} or more units; give units to confirm. The dates below assume it applies.`);
      } else if (input.units < d.minUnits) {
        return { ...out, applies: false, answer: `Section 1 of the Illinois Security Deposit Return Act covers residential property containing ${d.minUnits} or more units, so its 30- and 45-day deadlines do not bind a ${input.units}-unit property. This tool has no other Illinois rule loaded, and city ordinances (Chicago's among them) were not checked.`, notes };
      }
      notes.push('City ordinances (for example Chicago\'s) can add rules; they were not checked.');
    }

    if (trig.waiting === 'tenantDemand') {
      const ifToday = countFrom(row, trig.date, d.days, d.count);
      return {
        ...out,
        dueDate: null,
        status: 'not-started',
        answer: `In Arizona the ${d.days} business days start only after the tenancy ends, possession is delivered and the tenant demands the deposit. No demand date was given, so the clock has not started; had the tenant demanded on ${longDate(trig.date)}, the list would be due by ${longDate(ifToday.date)}.`,
        notes,
      };
    }

    const main = countFrom(row, trig.date, d.days, d.count);
    out.skipped = main.skipped;
    if (row.code === 'FL') {
      const noClaim = addDays(trig.date, d.noClaimDays);
      if (!hasDeductions) {
        out.dueDate = noClaim;
        out.days = d.noClaimDays;
        out.dueWords = 'Return the whole deposit (with any interest owed)';
        out.quote = row.quotes[d.noClaimQuote];
        out.cite = '§ 83.49(3)(a)';
        out.steps.push({ date: noClaim, what: 'Return the full deposit, with interest if owed', cite: '§ 83.49(3)(a)' });
      } else {
        out.dueDate = main.date;
        out.dueWords = 'Send the notice of intention to impose a claim by certified mail (or by e-mail under a signed § 83.505 addendum)';
        const sent = dateOf(input, 'noticeSent');
        if (sent && sent < trig.date) throw new DepositError('The notice cannot be sent before the rental agreement ended.', 'noticeSent');
        const base = sent ?? main.date;
        out.steps.push({ date: main.date, what: 'Send the notice of intention to impose a claim', cite: '§ 83.49(3)(a)' });
        out.steps.push({ date: addDays(base, d.balanceDays), what: `Pay the tenant the rest of the deposit (${d.balanceDays} days after the date of the notice${sent ? '' : ', counted from the last day to send it'})`, cite: '§ 83.49(3)(b)' });
        notes.push('The tenant has 15 days after receiving the notice to object in writing.');
      }
    } else {
      out.dueDate = main.date;
      out.dueWords = {
        CA: 'Furnish the itemized statement and return the rest of the deposit',
        TX: 'Refund the deposit with a written description and itemized list of deductions',
        NY: 'Provide the itemized statement and return the rest of the deposit',
        PA: 'Provide the written list of damages with payment of the balance',
        IL: 'Furnish the itemized statement of damage with paid receipts',
        OH: 'Deliver the itemized notice of deductions with the amount due',
        GA: 'Return the deposit, with a written statement of the exact reasons for anything kept',
        NC: 'Mail or deliver the itemized accounting with the balance of the deposit',
        MI: 'Mail the itemized list of damages with a check for the balance',
        VA: 'Give the written notice itemizing the deposit and deductions, with any amount due',
        WA: 'Give the full and specific statement, documents and any refund',
        AZ: 'Provide the itemized list of deductions with the amount due',
      }[row.code];
      out.steps.push({ date: main.date, what: out.dueWords, cite: d.cite });
      if (row.code === 'IL') {
        // The full-return deadline runs from the day the tenant vacated, not the later of the two.
        out.steps.push({ date: addDays(input.moveOut, d.returnDays), what: `If no statement with receipts went out, return the full deposit (${d.returnDays} days after the tenant vacated)`, cite: '710/1(a)' });
      }
      if (row.code === 'NC') out.steps.push({ date: addDays(trig.date, d.finalDays), what: 'Final accounting, if only an interim accounting was possible at 30 days', cite: '§ 42-52' });
      if (row.code === 'MI') out.steps.push({ date: addDays(trig.date, d.courtDays), what: 'Sue for the damages claimed, or return the balance held (unless an exception in § 554.613(1) applies)', cite: '§ 554.613(1)' });
      if (row.code === 'VA') notes.push(`If damages exceed the deposit and need a third-party contractor, a written notice saying so within the ${d.days} days gives ${d.contractorDays} more days for the itemization (§ 55.1-1226(E)).`);
      if (row.code === 'AZ' && main.skipped.length) notes.push(`Holidays skipped in the count (A.R.S. § 1-301): ${main.skipped.map((s) => `${s.name}, ${longDate(s.date)}`).join('; ')}.`);
    }

    // Forwarding-address rules the statutes tie to the clock or the penalties.
    const fwd = dateOf(input, 'forwardingAddress');
    if (row.code === 'TX') notes.push(fwd ? `The tenant gave a forwarding address on ${longDate(fwd)}.${fwd > out.dueDate ? ' That is after the 30th day: § 92.107 says the landlord need not refund or itemize until the address is given, and sets no new day count, so send it at once.' : ''}` : '§ 92.107: the landlord need not refund or itemize until the tenant gives a written forwarding address; the tenant does not lose the deposit by not giving one.');
    if (row.code === 'OH' && !fwd) notes.push('If the tenant gives no forwarding address in writing, the tenant cannot recover damages or attorney\'s fees under § 5321.16(C).');
    if (row.code === 'MI') notes.push('The tenant must give an address in writing within 4 days after occupancy ends; without it the landlord is relieved of the notice of damages (§ 554.611).');
    if (row.code === 'PA') notes.push('A tenant who gives no new address in writing at the end of the lease relieves the landlord of liability under section 512 (sec. 512(e)).');

    // The statute's own word on mailing, and the weekend the statute does not move.
    if (row.mailing === 'postmark') notes.push('Mail counts as on time when postmarked on or before the due date (§ 92.1041).');
    else if (row.mailing === 'mailing-counts') notes.push(row.code === 'WA' ? 'Mailing it first-class within the 30 days complies (RCW 59.18.280(1)(a)).' : 'Mailing it first-class to the last known address complies (§ 44-7-34(a)).');
    else notes.push('The statute does not say that mailing on the last day is enough, so plan for the tenant to have it by the due date.');
    const wd = weekday(out.dueDate);
    if (d.count === 'calendar' && (wd === 0 || wd === 6)) notes.push(`The due date falls on a ${weekdayName(out.dueDate)}. The statute does not move it to the next business day, and neither does this tool.`);
    if (row.notChecked) notes.push(row.notChecked);

    out.dueWeekday = weekdayName(out.dueDate);
    if (asOf) {
      const left = daysBetween(asOf, out.dueDate);
      out.asOf = asOf;
      out.daysRemaining = left;
      out.status = left > 0 ? 'open' : left === 0 ? 'due-today' : 'late';
    }
    const when = out.daysRemaining === undefined ? '' : out.status === 'late' ? ` That was ${-out.daysRemaining} ${out.daysRemaining === -1 ? 'day' : 'days'} before ${longDate(asOf)}.` : out.status === 'due-today' ? ' That is today.' : ` That is ${out.daysRemaining} ${out.daysRemaining === 1 ? 'day' : 'days'} after ${longDate(asOf)}.`;
    out.answer = `${row.name}: ${out.dueWords.charAt(0).toLowerCase()}${out.dueWords.slice(1)} by ${out.dueWeekday}, ${longDate(out.dueDate)}, ${wordsOfDays(out.days, d.count)} after ${longDate(trig.date)} (${DATE_FIELDS[trig.used]}), under ${out.cite}.${when}`;
    return out;
  }

  // ---------- the check ----------

  function readDeductions(list) {
    return (list ?? []).map((raw, i) => {
      const n = i + 1;
      const amount = toCents(raw.amount);
      if (amount === null) throw new DepositError(`Deduction ${n}: the amount must be dollars and cents, such as 125 or 125.50.`, `deductions.${i}.amount`);
      if (!CATEGORY_KEYS.includes(raw.category)) throw new DepositError(`Deduction ${n}: category must be one of ${CATEGORY_KEYS.join(', ')}.`, `deductions.${i}.category`);
      const doc = raw.doc ?? (raw.category === 'rent' || raw.category === 'utilities' ? 'none' : null);
      if (!DOC_KEYS.includes(doc)) throw new DepositError(`Deduction ${n}: say how the cost is shown (doc: ${DOC_KEYS.join(', ')}).`, `deductions.${i}.doc`);
      const d = { n, label: String(raw.label ?? '').trim() || CATEGORIES[raw.category], category: raw.category, amount, doc, carpet: raw.carpet === true, fixture: raw.fixture === true, vendor: raw.vendor ?? null };
      if (doc === 'own-labor') {
        const hours = Number(raw.hours);
        const rate = toCents(raw.hourlyRate);
        if (!(hours > 0) || rate === null) throw new DepositError(`Deduction ${n}: own labor needs the hours spent and the hourly rate.`, `deductions.${i}.hours`);
        d.hours = hours;
        d.hourlyRate = rate;
      }
      return d;
    });
  }

  // The issues a statute raises for these deductions and this delivery. "missing" blocks the clean
  // letter (the statute requires something not given); "check" is for the landlord to confirm.
  function issuesFor(row, ded, input, dl) {
    const out = [];
    const add = (level, message, cite) => out.push({ level, message, cite });
    const damage = ded.filter(isDamage);
    const damageTotal = damage.reduce((s, d) => s + d.amount, 0);
    const delivery = input.delivery ?? null;
    const photos = input.photos ?? {};
    const vacated = input.moveOut;

    if (row.code === 'CA') {
      const exempt = damageTotal <= 12_500 || input.waiver === true;
      if (!exempt) {
        for (const d of damage) {
          if (d.doc === 'none') add('missing', `Deduction ${d.n} (${d.label}): repairs and cleaning above $125 in total need a copy of the bill, invoice or receipt, or for your own labor the time spent and the hourly rate.`, '§ 1950.5(h)(2)');
          if (d.doc === 'estimate' && !d.vendor) add('missing', `Deduction ${d.n} (${d.label}): an estimate needs the name, address and telephone number of whoever will do the work or send the bill, and the documents within 14 days of the work or bill.`, '§ 1950.5(h)(3)');
        }
        if (damage.length && vacated >= '2025-04-01' && photos.moveOut !== true) add('missing', 'Deductions for repairs or cleaning need the photographs taken after the unit was returned (and after the work), sent with the statement.', '§ 1950.5(g)(2), (h)(2)(D)');
        if (damage.length && input.tenancyStart && input.tenancyStart >= '2025-07-01' && photos.moveIn !== true) add('missing', 'This tenancy began on or after July 1, 2025, so the move-in photographs are required too.', '§ 1950.5(g)(1)');
      }
      if (delivery === 'email' && input.emailAgreement !== true) add('missing', 'The itemized statement may be e-mailed only by mutual agreement with the tenant.', '§ 1950.5(h)(1)(B)');
      if (delivery === 'certified') add('check', 'The statute names personal delivery or first-class mail; certified mail is first-class mail with a service added, so keep the receipt.', '§ 1950.5(h)(1)(B)');
      if ((input.tenants?.length ?? 1) > 1) add('check', 'With several adult tenants, the refund check is payable to all adult tenants unless all of you agreed otherwise in writing.', '§ 1950.5(h)(1)(C)');
    }
    if (row.code === 'WA') {
      for (const d of damage) {
        if (d.doc === 'none') add('missing', `Deduction ${d.n} (${d.label}): damage charges need copies of estimates received or invoices paid, or for your own work the time spent and the hourly rate.`, 'RCW 59.18.280(1)(b)');
        if (d.carpet) add('check', `Deduction ${d.n} (${d.label}): carpet cleaning may be withheld only if you document wear beyond ordinary use.`, 'RCW 59.18.280(1)(c)(ii)');
        if (d.fixture && input.moveInChecklist !== true) add('missing', `Deduction ${d.n} (${d.label}): repair or replacement of fixtures, appliances or furnishings needs their condition documented in the move-in checklist.`, 'RCW 59.18.280(1)(c)(iii)');
      }
      if (delivery === 'email') add('missing', 'The statute counts personal delivery or first-class mail to the last known address; e-mail is not named.', 'RCW 59.18.280(1)(a)');
    }
    if (row.code === 'IL' && !(input.units !== undefined && input.units < row.deadline.minUnits)) {
      for (const d of damage) {
        if (d.doc === 'none' && input.receiptsUnavailable !== true) add('missing', `Deduction ${d.n} (${d.label}): attach the paid receipts (or give an estimate and send the receipts within 30 days); if receipts cannot be had through no fault of yours, a verified statement is required instead.`, '710/1(a), (b)');
      }
      if (input.receiptsUnavailable === true) add('check', 'Without receipts you must give an itemized cost list, any other evidence of the cost and a verified statement of why the receipts cannot be produced.', '710/1(b)');
      if (delivery === 'email' && input.emailAgreement !== true) add('missing', 'E-mail counts only to a verified e-mail address the tenant provided.', '710/1(a)');
      if (delivery === 'certified') add('check', 'The statute names personal delivery, postmarked mail or e-mail; keep the postmarked receipt.', '710/1(a)');
    }
    if (row.code === 'FL' && ded.length) {
      if (delivery && delivery !== 'certified' && !(delivery === 'email' && input.emailAgreement === true)) add('missing', 'The notice of intention to impose a claim must go by certified mail, or by e-mail only under a signed § 83.505 addendum.', '§ 83.49(3)(a), § 83.505');
      if (delivery === 'email' && input.emailAgreement === true) add('check', 'Keep a copy of the e-mailed notice and evidence that it was sent.', '§ 83.505(5)');
    }
    if (row.code === 'MI') {
      if (delivery && delivery !== 'first-class' && delivery !== 'certified') add('missing', 'The notice of damages must be mailed.', '§ 554.609');
    }
    if (row.code === 'NY') {
      for (const d of ded) {
        if (d.category === 'cleaning') add('check', `Deduction ${d.n} (${d.label}): the statute lists rent, damage beyond normal wear and tear, utilities payable to the landlord and moving and storage of belongings; cleaning is kept only as damage beyond normal wear and tear.`, '§ 7-108(1-a)(b)');
        if (d.category === 'other') add('missing', `Deduction ${d.n} (${d.label}): the statute allows only rent, damage beyond normal wear and tear, utilities payable directly to the landlord and moving and storage of belongings.`, '§ 7-108(1-a)(b)');
      }
    }
    if (row.code === 'TX' && ded.length && ded.every((d) => d.category === 'rent')) add('check', 'Only rent is deducted: no itemized list is required if the tenant owed rent on surrender and the amount is not disputed (§ 92.104(c)). The letter itemizes it anyway.', '§ 92.104(c)');
    if (row.code === 'AZ' && delivery && delivery !== 'first-class' && input.otherArrangement !== true) add('missing', 'Mail the list and any amount due by first-class mail to the last known place of residence, unless the tenant arranged otherwise in writing.', 'A.R.S. § 33-1321(D)');
    if (row.code === 'GA' && delivery && delivery !== 'first-class') add('check', 'Mailing by first-class mail to the last known address is what the statute deems compliance.', '§ 44-7-34(a)');
    if (row.code === 'VA' && (input.tenants?.length ?? 1) > 1) add('check', 'With several tenants, unless each agreed otherwise in writing, the refund is one check payable to all of them, sent to a forwarding address one of them gave.', '§ 55.1-1226(B)');
    if (row.code === 'NC' && input.interim === true) add('check', `An interim accounting now and a final accounting by ${longDate(dl.steps.find((s) => /Final/.test(s.what))?.date ?? dl.dueDate)}.`, '§ 42-52');
    if (dl.status === 'late') add('check', `The due date (${longDate(dl.dueDate)}) has passed; see the penalty below.`, dl.cite);
    return out;
  }

  // The statutory exposure if the deadline or a requirement is missed: a formula on the deposit or
  // on the amount kept, shown as the statute's maximum. Never a prediction of an award.
  function exposure(row, deposit, kept) {
    const p = row.penalty;
    const base = { formula: p.words, cite: p.cite, quotes: p.quotes.map((k) => row.quotes[k]), feesToo: /attorney/.test(p.words) };
    if (p.kind === 'texas') return { ...base, amount: 10_000 + 3 * kept, math: `$100 + 3 x ${usd(kept)} kept` };
    if (p.kind === 'times-deposit') return { ...base, amount: p.factor * deposit, math: `${p.factor} x ${usd(deposit)} deposit` };
    if (p.kind === 'times-withheld') return { ...base, amount: p.factor * kept, math: `${p.factor} x ${usd(kept)} kept` };
    return { ...base, amount: null, math: null };
  }

  function check(input) {
    const row = rule(input.state);
    const deposit = toCents(input.deposit);
    if (deposit === null || deposit === 0) throw new DepositError('The deposit must be dollars and cents above zero, such as 1500.', 'deposit');
    const interest = input.interest === undefined ? 0 : toCents(input.interest);
    if (interest === null) throw new DepositError('Interest must be dollars and cents, such as 12.40.', 'interest');
    const ded = readDeductions(input.deductions);
    if (input.tenancyStart !== undefined && !isRealDate(input.tenancyStart)) throw new DepositError('tenancyStart is not a real date written like 2025-08-01.', 'tenancyStart');
    const dl = deadline({ ...input, hasDeductions: ded.length > 0 });
    const held = deposit + interest;
    const total = ded.reduce((s, d) => s + d.amount, 0);
    const kept = Math.min(total, held);
    const refund = held - kept;
    const owed = total - kept;
    const issues = dl.applies ? issuesFor(row, ded, input, dl) : [];
    const ex = exposure(row, deposit, kept);
    const missing = issues.filter((x) => x.level === 'missing').length;
    const answer = [
      dl.answer,
      `Of ${usd(held)} held, ${usd(kept)} is kept and ${usd(refund)} goes back${owed ? `; the deductions exceed the deposit by ${usd(owed)}` : ''}.`,
      missing ? `${missing} statutory ${missing === 1 ? 'requirement is' : 'requirements are'} not met yet.` : 'Nothing the statute requires is missing from what you entered.',
    ].join(' ');
    return {
      ...dl,
      answer,
      deadlineAnswer: dl.answer,
      money: { deposit, interest, held, deductions: total, kept, refund, owedByTenant: owed, display: { deposit: usd(deposit), interest: usd(interest), held: usd(held), deductions: usd(total), kept: usd(kept), refund: usd(refund), owedByTenant: usd(owed) } },
      deductions: ded.map((d) => ({ ...d, display: usd(d.amount) })),
      issues,
      ready: missing === 0 && dl.applies && dl.dueDate !== null,
      exposure: { ...ex, display: ex.amount === null ? null : usd(ex.amount) },
    };
  }

  // ---------- the letter's clauses ----------

  // The pieces the PDF lays out: a fixed clause library filled from the check, never free drafting.
  function letter(input) {
    const c = check(input);
    if (!c.applies) throw new DepositError(c.answer, 'units');
    if (c.dueDate === null) throw new DepositError(c.answer, 'tenantDemand');
    const row = rule(input.state);
    const date = input.letterDate ?? input.asOf;
    const m = c.money;
    const docLine = (d) => {
      if (d.doc === 'own-labor') return `Own labor: ${d.hours} ${d.hours === 1 ? 'hour' : 'hours'} at ${usd(d.hourlyRate)} an hour`;
      if (d.doc === 'estimate') return `Good-faith estimate${d.vendor ? `; work by ${d.vendor}` : ''}`;
      if (d.doc === 'invoice') return 'Copy of invoice enclosed';
      if (d.doc === 'receipt') return 'Copy of receipt enclosed';
      return '';
    };
    const fl = row.code === 'FL' && c.deductions.length > 0;
    const title = fl ? 'Notice of intention to impose a claim on security deposit'
      : row.code === 'MI' && c.deductions.length ? 'Notice of damages: itemized list'
        : row.code === 'NC' && input.interim === true ? 'Interim accounting of security deposit'
          : 'Itemized statement of security deposit';
    const paras = [];
    paras.push(`You moved out of ${input.property} on ${longDate(input.moveOut)}. This ${fl ? 'notice' : 'statement'} accounts for the security deposit of ${m.display.deposit} you paid${m.interest ? `, with ${m.display.interest} of interest` : ''}, as ${row.law} requires.`);
    if (fl) {
      const reasons = c.deductions.map((d) => d.label).join('; ');
      paras.push({ statutory: row.formTemplate.replace('{amount}', m.display.kept).replace('{reason}', reasons).replace('{landlordAddress}', input.landlord.address), cite: 'Fla. Stat. § 83.49(3)(a)' });
      paras.push(`Unless you object in writing within 15 days after you receive this notice, the claim will be deducted and the remaining ${m.display.refund} sent to you within 30 days after the date of this notice.`);
    } else if (c.deductions.length) {
      paras.push(`The deductions below are itemized with the cost of each. ${m.refund ? `A payment of ${m.display.refund} for the rest of the deposit is enclosed.` : 'Nothing remains of the deposit after them.'}`);
    } else {
      paras.push(`Nothing has been deducted. The full ${m.display.held} is enclosed.`);
    }
    if (m.owedByTenant) paras.push(`The deductions exceed the deposit by ${m.display.owedByTenant}. That amount remains owed.`);
    const encl = [];
    if (m.refund && !fl) encl.push(`Payment of ${m.display.refund}`);
    if (c.deductions.some((d) => d.doc === 'invoice' || d.doc === 'receipt')) encl.push('Copies of the invoices and receipts listed');
    if (row.code === 'CA' && input.photos?.moveOut === true && c.deductions.some(isDamage)) encl.push('Photographs of the unit (by the method noted)');
    if (row.code === 'IL' && c.deductions.some((d) => d.doc === 'estimate')) paras.push('Paid receipts for the items shown as estimates will be sent within 30 days of this statement, as 765 ILCS 710/1(a) requires.');
    if (row.code === 'IL' && input.receiptsUnavailable === true) encl.push('Verified statement on why receipts cannot be produced, with the other evidence of cost');
    if (row.code === 'CA' && c.deductions.some((d) => d.doc === 'estimate')) paras.push('Items shown as estimates could not be finished or billed within 21 days. The documents for them will follow within 14 days of the work or the bill.');
    if (row.code === 'NC' && input.interim === true) paras.push(`This is an interim accounting. The final accounting will follow by ${longDate(c.steps.find((s) => /Final/.test(s.what)).date)}.`);
    return {
      title,
      date,
      landlord: input.landlord,
      tenants: input.tenants,
      tenantAddress: input.tenantAddress,
      property: input.property,
      paras,
      rows: c.deductions.map((d) => ({ label: d.label, category: CATEGORIES[d.category], note: docLine(d), amount: d.display })),
      money: m,
      bold: row.code === 'MI' && c.deductions.length ? row.boldStatement : null,
      enclosures: encl,
      law: row.law,
      check: c,
    };
  }

  return {
    data,
    order,
    covered: () => order.map((code) => ({ code, name: rows[code].name, law: rows[code].law, days: rows[code].deadline.days, count: rows[code].deadline.count, trigger: rows[code].deadline.triggerWords, quality: rows[code].quality })),
    rule,
    deadline,
    check,
    letter,
  };
}
