// 1099-K reconciliation: the pure engine, shared by the page and the server. No imports, no Node
// APIs: tool.js reads the dated IRS file (data/irs.json) and passes it in.
//
// What it does: walks Form 1099-K Box 1a (one form or several) down to the figures a return uses,
// in the order the IRS describes them. Box 1a is the year's gross, "without regard to any
// adjustments for credits, cash equivalents, discount amounts, fees, refunded amounts, shipping
// amounts, or any other amounts" (Instructions for Form 1099-K, Box 1a). So:
//   Box 1a
//   - amounts that are not your business income (personal payments and reimbursements, a duplicate
//     form, sales tax collected for the state, cash back, personal items you sold)
//   - amounts in Box 1a that your books put in another year (timing)
//   = business gross receipts from these forms (Schedule C line 1 for a sole proprietor)
//   - refunds, chargebacks and discounts (Schedule C line 2, returns and allowances)
//   - fees and shipping taken by the platform (expenses: fees on line 10)
//   = what you kept from these sales before other costs
// The user says which amounts are which; the engine never guesses whether a payment is income.
// Every number is integer cents. Checks flag what the IRS text says to look at: the months adding
// up to Box 1a, the TPSO threshold, duplicates, backup withholding, tips in Box 1c.

export const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const MONTH_BOXES = ['5a', '5b', '5c', '5d', '5e', '5f', '5g', '5h', '5i', '5j', '5k', '5l'];
export const TAX_YEARS = [2023, 2024, 2025, 2026];
export const MAX_FORMS = 10;
export const MAX_ITEMS = 50;
export const MAX_CSV_CHARS = 180_000;
export const MAX_CENTS = 10_000_000_000; // $100,000,000

export class ReconError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ReconError';
    this.field = field;
  }
}

// ---------- money and dates ----------

// "$1,234.56", "1234.5", 1234.56, "(12.00)" -> cents. null when it is not an amount.
export function toCents(value) {
  if (value === null || value === undefined || value === '') return null;
  let s = typeof value === 'number' ? (Number.isFinite(value) ? value.toFixed(2) : '') : String(value).trim();
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  s = s.replace(/[$,\s]|USD/gi, '');
  if (s.startsWith('-')) { neg = !neg; s = s.slice(1); }
  if (s.startsWith('+')) s = s.slice(1);
  if (s.startsWith('.')) s = `0${s}`;
  const m = /^(\d+)(?:\.(\d{0,2})\d*)?$/.exec(s);
  if (!m) return null;
  const whole = Number(m[1]);
  const frac = Number(((m[2] ?? '') + '00').slice(0, 2));
  const cents = whole * 100 + frac;
  if (!Number.isSafeInteger(cents)) return null;
  return neg ? -cents : cents;
}

export function money(cents) {
  const neg = cents < 0;
  const a = Math.abs(cents);
  const d = String(Math.floor(a / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return `${neg ? '-' : ''}$${d}.${String(a % 100).padStart(2, '0')}`;
}

// $20,000 rather than $20,000.00, for rules.
export const short = (cents) => (cents % 100 === 0 ? money(cents).slice(0, -3) : money(cents));
export const plain = (cents) => `${cents < 0 ? '-' : ''}${Math.floor(Math.abs(cents) / 100)}.${String(Math.abs(cents) % 100).padStart(2, '0')}`;
export const longDate = (iso) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8))}, ${iso.slice(0, 4)}`;
const WORDS = { 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' };
export const andList = (xs) => (xs.length <= 1 ? xs.join('') : xs.length === 2 ? xs.join(' and ') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const sum = (xs) => xs.reduce((a, b) => a + b, 0);
const plural = (n, word, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;

// A date cell from an export -> YYYY-MM-DD, or null. ISO first (2026-03-04, 2026-03-04T23:10:00Z),
// then US month/day/year (03/04/2026, 3/4/26), then "Mar 4, 2026". The calendar date as written:
// the IRS counts each transaction on its date, and platforms state theirs in UTC (Shopify, Square).
const MON = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
export function parseDate(text) {
  const s = String(text ?? '').trim();
  let y; let m; let d;
  let x = /^(\d{4})-(\d{1,2})-(\d{1,2})/.exec(s);
  if (x) [y, m, d] = [Number(x[1]), Number(x[2]), Number(x[3])];
  else if ((x = /^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})\b/.exec(s))) [m, d, y] = [Number(x[1]), Number(x[2]), Number(x[3].length === 2 ? `20${x[3]}` : x[3])];
  else if ((x = /^([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2}),?\s+(\d{4})/.exec(s)) && MON[x[1].toLowerCase()]) [m, d, y] = [MON[x[1].toLowerCase()], Number(x[2]), Number(x[3])];
  else return null;
  const days = [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (m < 1 || m > 12 || d < 1 || d > days[m - 1]) return null;
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// ---------- the reconciling items ----------

// Each item the user can give, the group it falls in, and where it goes. `cite` names the IRS page
// (a key of irs.json sources) the treatment comes from.
export const ITEMS = {
  personal: { label: 'Personal payments (gifts, reimbursements, shared costs)', short: 'personal payments', group: 'not-income', where: 'Not income: ask the issuer for a corrected form; if it does not come, enter it in the space at the top of Schedule 1 (Form 1040)', cite: 'whatToDo' },
  duplicate: { label: 'Sales also on another Form 1099-K (a duplicate)', short: 'duplicate amounts', group: 'not-income', where: 'Count each sale once: ask the issuer for a corrected form showing zero', cite: 'whatToDo' },
  salesTax: { label: 'Sales tax collected for the state and paid over (by you or the marketplace)', short: 'sales tax', group: 'not-income', where: 'Not gross receipts when the tax is imposed on the buyer and paid over (Schedule C line 23 instructions)', cite: 'i1040sc' },
  cashBack: { label: 'Cash back given to customers on debit cards', short: 'cash back', group: 'not-income', where: 'Not gross receipts and not an expense (IRS: cash back payments)', cite: 'whatToDo' },
  otherYear: { label: 'In Box 1a but booked in another year (timing)', short: 'other-year timing', group: 'timing', where: 'Your books put these in the year before or after; keep the list for your preparer', cite: 'i1099k' },
  refunds: { label: 'Refunds to customers', short: 'refunds', group: 'returns', where: 'Schedule C line 2, returns and allowances', cite: 'i1040sc' },
  chargebacks: { label: 'Chargebacks and disputes lost', short: 'chargebacks', group: 'returns', where: 'Schedule C line 2, returns and allowances', cite: 'i1040sc' },
  discounts: { label: 'Discounts and credits given after the sale', short: 'discounts', group: 'returns', where: 'Schedule C line 2, returns and allowances (a reduction in the selling price)', cite: 'i1040sc' },
  fees: { label: 'Platform and processing fees', short: 'fees', group: 'expense', where: 'Schedule C line 10, commissions and fees', cite: 'i1040sc' },
  shipping: { label: 'Shipping labels and postage taken from payouts', short: 'shipping', group: 'expense', where: 'A business expense (the IRS lists shipping among the amounts you can deduct from the gross)', cite: 'whatToDo' },
};
export const ITEM_KEYS = Object.keys(ITEMS);
export const FORM_KINDS = {
  tpso: 'Payment app or online marketplace (third party network)',
  card: 'Payment card processor (merchant acquirer)',
};
export const FILER_TYPES = {
  'sole-proprietor': 'Sole proprietor, gig worker, freelancer or hobby seller',
  partnership: 'Partnership',
  corporation: 'Corporation or S corporation',
  individual: 'Personal seller (personal items, no business)',
};

// ---------- CSV ----------

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const s = String(text).replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"') {
        if (s[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((x) => x.trim() !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim() !== '')) rows.push(row);
  return rows;
}

// Header names seen in payment and marketplace exports, lowercased with punctuation as spaces. A
// column the user names in `columns` wins.
export const COLUMN_ALIASES = {
  date: ['date', 'transaction date', 'created', 'created at', 'created date', 'processed at', 'processed date', 'posted at', 'posted date', 'time', 'date time', 'datetime', 'order date', 'payment date', 'sale date'],
  type: ['type', 'transaction type', 'kind', 'category', 'event type', 'activity type', 'payment type'],
  amount: ['amount', 'gross', 'gross amount', 'gross sales', 'total', 'charge amount', 'payment amount', 'sale amount', 'transaction amount', 'gross payment amount'],
  fee: ['fee', 'fees', 'processing fee', 'processing fees', 'transaction fee', 'total fees', 'fee amount'],
  tax: ['tax', 'taxes', 'sales tax', 'tax amount', 'tax collected', 'sales tax collected'],
  refund: ['refund', 'refunds', 'refund amount', 'refunded amount', 'amount refunded'],
};
const norm = (h) => String(h).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function detectColumns(headers, explicit = {}) {
  const names = headers.map(norm);
  const found = {};
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    if (explicit[field] !== undefined) {
      const i = names.indexOf(norm(explicit[field]));
      if (i < 0) throw new ReconError(`Column "${explicit[field]}" for ${field} is not in the file's header row.`, `columns.${field}`);
      found[field] = i;
      continue;
    }
    const i = names.findIndex((n) => aliases.includes(n));
    if (i >= 0) found[field] = i;
  }
  return found;
}

// What a row is, from its type text and the sign of its amount.
export function classifyRow(typeText, cents) {
  const t = norm(typeText ?? '');
  if (/\b(payout|transfer|withdrawal|deposit|bank|top up|topup|reserve|hold|balance)\b/.test(t)) return 'ignore';
  if (/\b(chargeback|dispute|reversal)\b/.test(t)) return 'chargebacks';
  if (/\b(refund|return)\b/.test(t)) return 'refunds';
  if (/\b(shipping label|postage|label)\b/.test(t)) return 'shipping';
  if (/\bfee/.test(t)) return 'fees';
  if (/\b(sales tax|tax)\b/.test(t)) return 'salesTax';
  if (/\b(personal|friends|family|gift)\b/.test(t)) return 'personal';
  if (cents < 0) return 'refunds';
  return 'sale';
}

// Rebuilds the monthly gross (the way Boxes 5a to 5l are built: each payment by its date) and the
// reconciling totals from a transaction export.
export function readTransactions(text, { taxYear, columns = {}, taxInGross = false } = {}) {
  if (String(text).length > MAX_CSV_CHARS) throw new ReconError(`The transaction file is over ${MAX_CSV_CHARS.toLocaleString('en-US')} characters: split it, or enter the totals instead.`, 'transactionsCsv');
  const rows = parseCsv(text);
  if (rows.length < 2) throw new ReconError('The transaction file needs a header row and at least one transaction.', 'transactionsCsv');
  const col = detectColumns(rows[0], columns);
  if (col.date === undefined) throw new ReconError('No date column found: name it in columns.date (for example "Transaction Date").', 'columns.date');
  if (col.amount === undefined) throw new ReconError('No amount column found: name it in columns.amount (for example "Gross").', 'columns.amount');
  const months = Array(12).fill(0);
  const totals = { sale: 0, refunds: 0, chargebacks: 0, fees: 0, shipping: 0, salesTax: 0, personal: 0 };
  const counts = { sale: 0, refunds: 0, chargebacks: 0, fees: 0, shipping: 0, salesTax: 0, personal: 0, ignore: 0, otherYear: 0, unreadable: 0 };
  let otherYearCents = 0;
  let taxColumn = 0;
  const unreadable = [];
  rows.slice(1).forEach((r, idx) => {
    const line = idx + 2;
    const date = parseDate(r[col.date]);
    const cents = toCents(r[col.amount]);
    if (!date || cents === null) {
      counts.unreadable++;
      if (unreadable.length < 5) unreadable.push(line);
      return;
    }
    const kind = classifyRow(col.type === undefined ? '' : r[col.type], cents);
    if (kind === 'ignore') { counts.ignore++; return; }
    if (Number(date.slice(0, 4)) !== taxYear) {
      counts.otherYear++;
      if (kind === 'sale') otherYearCents += cents;
      return;
    }
    counts[kind]++;
    if (kind === 'sale') {
      totals.sale += cents;
      months[Number(date.slice(5, 7)) - 1] += cents;
    } else {
      totals[kind] += Math.abs(cents);
    }
    if (col.fee !== undefined) { const f = toCents(r[col.fee]); if (f) totals.fees += Math.abs(f); }
    if (col.refund !== undefined && kind === 'sale') { const f = toCents(r[col.refund]); if (f) totals.refunds += Math.abs(f); }
    if (col.tax !== undefined && kind === 'sale') { const f = toCents(r[col.tax]); if (f) taxColumn += Math.abs(f); }
  });
  if (taxInGross) totals.salesTax += taxColumn;
  const found = Object.fromEntries(Object.entries(col).map(([k, i]) => [k, rows[0][i]]));
  return { columns: found, rows: rows.length - 1, months, totals, counts, otherYearCents, taxColumnCents: taxColumn, taxInGross, unreadableLines: unreadable };
}

// ---------- the engine ----------

export function makeEngine(irs) {
  const T = irs.threshold;
  const S = irs.sources;

  function formOf(f, i) {
    const box1a = f.box1a;
    const months = f.months ?? null;
    return {
      index: i,
      label: f.filer?.trim() || `Form ${i + 1}`,
      kind: f.kind ?? 'tpso',
      box1a,
      box1b: f.box1b ?? null,
      box1c: f.box1c ?? null,
      box3: f.box3 ?? null,
      box4: f.box4 ?? 0,
      months,
      monthsTotal: months ? sum(months) : null,
    };
  }

  // Whether a TPSO had to file this form federally. Card forms have no threshold.
  function thresholdVerdict(form) {
    if (form.kind === 'card') return { required: true, text: `${form.label}: payment card transactions have no federal threshold, so a form is due for any amount.` };
    const overAmount = form.box1a > T.tpsoAmountCents;
    const overCount = form.box3 === null ? null : form.box3 > T.tpsoTransactions;
    if (overAmount && overCount) return { required: true, text: `${form.label}: ${money(form.box1a)} in ${plural(form.box3, 'transaction')} is over ${short(T.tpsoAmountCents)} and over ${T.tpsoTransactions}, so the platform had to file it.` };
    if (overAmount && overCount === null) return { required: null, text: `${form.label}: ${money(form.box1a)} is over ${short(T.tpsoAmountCents)}; it had to be filed only if Box 3 also shows more than ${T.tpsoTransactions} transactions.` };
    const why = !overAmount ? `${money(form.box1a)} is not over ${short(T.tpsoAmountCents)}` : `${plural(form.box3, 'transaction')} is not over ${T.tpsoTransactions}`;
    return { required: false, text: `${form.label}: ${why}, so the federal rule did not require this form. The IRS says a platform may still send one, a state may set a lower threshold, and backup withholding makes one due. The income is reportable either way.` };
  }

  function reconcile(input) {
    const year = input.taxYear;
    const filerType = input.filerType ?? 'sole-proprietor';
    const forms = input.forms.map(formOf);
    const box1a = sum(forms.map((f) => f.box1a));
    const adj = Object.fromEntries(ITEM_KEYS.map((k) => [k, input.adjustments?.[k] ?? null]));
    const checks = [];
    const add = (level, code, text) => checks.push({ level, code, text });

    // A transaction export fills the items the user left empty, and rebuilds the months.
    let csv = null;
    if (input.transactionsCsv) {
      csv = readTransactions(input.transactionsCsv, { taxYear: year, columns: input.columns, taxInGross: input.taxInGross === true });
      const filled = [];
      for (const k of ['refunds', 'chargebacks', 'fees', 'shipping', 'salesTax', 'personal']) {
        if (adj[k] === null && csv.totals[k] > 0) { adj[k] = csv.totals[k]; filled.push(`${ITEMS[k].short} ${money(csv.totals[k])}`); }
      }
      const diff = box1a - csv.totals.sale;
      add(diff === 0 ? 'ok' : 'warn', 'csv-total', `Your export's ${year} sales add up to ${money(csv.totals.sale)} over ${plural(csv.counts.sale, 'sale')}${diff === 0 ? ', the same as Box 1a.' : `; Box 1a is ${money(box1a)}, ${money(Math.abs(diff))} ${diff > 0 ? 'more' : 'less'}. Look for sales on other payment methods, rows dated in another time zone, and transactions the export leaves out.`}`);
      if (filled.length) add('info', 'csv-filled', `From the export: ${filled.join(', ')}.`);
      if (csv.counts.otherYear) add('info', 'csv-other-year', `${plural(csv.counts.otherYear, 'row')} dated outside ${year} left out (${money(csv.otherYearCents)} of sales).`);
      if (csv.counts.unreadable) add('warn', 'csv-unreadable', `${plural(csv.counts.unreadable, 'row')} without a readable date or amount (lines ${csv.unreadableLines.join(', ')}${csv.counts.unreadable > csv.unreadableLines.length ? ' and more' : ''}).`);
      if (csv.taxColumnCents && !csv.taxInGross) add('info', 'csv-tax', `The export's tax column adds up to ${money(csv.taxColumnCents)}. It was not subtracted: set taxInGross if your platform's Box 1a includes the sales tax you collected (Square says its does; eBay says its does not).`);
    }

    // Personal items: each item's gain or loss, as the IRS FAQs work them.
    const items = (input.personalItems ?? []).map((p, i) => {
      const gain = p.proceeds - p.cost;
      return { description: p.description?.trim() || `Item ${i + 1}`, proceeds: p.proceeds, cost: p.cost, gain, result: gain > 0 ? 'gain' : gain < 0 ? 'loss' : 'even' };
    });
    const lossProceeds = sum(items.filter((x) => x.result !== 'gain').map((x) => x.proceeds));
    const gainProceeds = sum(items.filter((x) => x.result === 'gain').map((x) => x.proceeds));
    const gains = sum(items.filter((x) => x.result === 'gain').map((x) => x.gain));

    // The bridge.
    const lines = [{ key: 'box1a', label: `Box 1a gross${forms.length > 1 ? ` (${forms.length} forms)` : ''}`, cents: box1a, kind: 'start', where: 'Form 1099-K' }];
    const minus = (key, cents, label, where, cite) => { if (cents) lines.push({ key, label, cents: -cents, kind: 'item', where, cite }); };
    for (const k of ['personal', 'duplicate', 'salesTax', 'cashBack']) minus(k, adj[k], ITEMS[k].label, ITEMS[k].where, ITEMS[k].cite);
    if (lossProceeds) minus('personalLoss', lossProceeds, `Personal items sold at a loss or break-even (${plural(items.filter((x) => x.result !== 'gain').length, 'item')})`, 'Not taxable: enter the proceeds in the space at the top of Schedule 1 (Form 1040), or on Form 8949 with code L', 'faqCommon');
    if (gainProceeds) minus('personalGain', gainProceeds, `Personal items sold at a gain (${plural(items.filter((x) => x.result === 'gain').length, 'item')})`, `Form 8949 and Schedule D: a taxable gain of ${money(gains)}`, 'faqReceive');
    if (adj.otherYear) lines.push({ key: 'otherYear', label: ITEMS.otherYear.label, cents: -adj.otherYear, kind: 'item', where: ITEMS.otherYear.where, cite: 'i1099k' });
    const notIncome = box1a - sum(lines.filter((l) => l.kind === 'item').map((l) => -l.cents));
    const receiptsWhere = filerType === 'sole-proprietor' ? 'Schedule C line 1, gross receipts' : irs.reporting[filerType].form;
    lines.push({ key: 'grossReceipts', label: filerType === 'individual' ? 'Left after personal amounts (business income if any remains)' : 'Business gross receipts from these forms', cents: notIncome, kind: 'subtotal', where: receiptsWhere });
    const returns = (adj.refunds ?? 0) + (adj.chargebacks ?? 0) + (adj.discounts ?? 0);
    for (const k of ['refunds', 'chargebacks', 'discounts']) minus(k, adj[k], ITEMS[k].label, ITEMS[k].where, ITEMS[k].cite);
    const netSales = notIncome - returns;
    if (returns) lines.push({ key: 'netSales', label: 'Net sales after returns and allowances', cents: netSales, kind: 'subtotal', where: 'Schedule C line 3' });
    const expenses = (adj.fees ?? 0) + (adj.shipping ?? 0);
    for (const k of ['fees', 'shipping']) minus(k, adj[k], ITEMS[k].label, ITEMS[k].where, ITEMS[k].cite);
    const kept = netSales - expenses;
    lines.push({ key: 'kept', label: 'What you kept from these sales before other costs', cents: kept, kind: 'total', where: 'Should be close to what the platform paid out to you' });

    // Checks.
    if (notIncome < 0) add('warn', 'negative', `The amounts taken out (${money(box1a - notIncome)}) are more than Box 1a (${money(box1a)}): check that nothing is counted twice.`);
    for (const f of forms) {
      if (f.months) {
        const d = f.monthsTotal - f.box1a;
        if (d !== 0) add('warn', 'months-sum', `${f.label}: Boxes 5a to 5l add up to ${money(f.monthsTotal)}, not Box 1a's ${money(f.box1a)} (${money(Math.abs(d))} ${d > 0 ? 'more' : 'less'}). The IRS instructions say each month box is that month's gross, so they should add up to Box 1a: ask the issuer.`);
      }
      if (f.box1b !== null && f.box1b > f.box1a) add('warn', 'box1b', `${f.label}: Box 1b (${money(f.box1b)}, card not present) is more than Box 1a (${money(f.box1a)}); it is a part of Box 1a.`);
      if (f.box1c) add('info', 'tips', `${f.label}: Box 1c shows ${money(f.box1c)} of cash tips, which are included in Box 1a (Instructions for Form 1099-K).`);
      if (f.box4) add('info', 'withholding', `${f.label}: Box 4 shows ${money(f.box4)} of federal income tax withheld (backup withholding). Report it with your other withholding when you file (IRS FAQs).`);
      const v = thresholdVerdict(f);
      add(v.required === false ? 'info' : 'ok', 'threshold', v.text);
    }
    for (let i = 0; i < forms.length; i++) {
      for (let j = i + 1; j < forms.length; j++) {
        const a = forms[i]; const b = forms[j];
        const sameMonths = a.months && b.months && a.months.every((m, k) => m === b.months[k]);
        if ((a.box1a > 0 && a.box1a === b.box1a) || sameMonths) add('warn', 'duplicate', `${a.label} and ${b.label} show the same ${sameMonths ? 'monthly amounts' : `Box 1a (${money(a.box1a)})`}: if they report the same sales, the IRS says to ask the issuer for a corrected form showing zero, and count the sales once.`);
      }
    }
    if (filerType === 'partnership' || filerType === 'corporation') add('warn', 'entity', 'If the form carries your own name and Social Security number but the business files Form 1065, 1120 or 1120-S, the IRS says to have the Form 1099-K corrected.');
    if (items.some((x) => x.result === 'gain') && items.some((x) => x.result === 'loss')) add('info', 'mixed', 'You sold personal items at both a gain and a loss: report them separately. A loss on one item cannot offset a gain on another (IRS FAQs, Common situations).');
    const given = ITEM_KEYS.filter((k) => adj[k] !== null).length + items.length;
    if (!given) add('info', 'nothing', 'No refunds, fees or other items given: Box 1a is the starting point, not your income. Add what your platform report shows.');

    let books = null;
    if (input.books?.grossReceipts !== undefined && input.books.grossReceipts !== null) {
      const variance = input.books.grossReceipts - notIncome;
      books = { grossReceipts: input.books.grossReceipts, variance, ties: variance === 0 };
      add(variance === 0 ? 'ok' : 'warn', 'books', variance === 0
        ? `Your books' gross receipts of ${money(input.books.grossReceipts)} tie to the walkdown exactly.`
        : `Your books show ${money(input.books.grossReceipts)} of gross receipts, ${money(Math.abs(variance))} ${variance > 0 ? 'more' : 'less'} than the walkdown: ${variance > 0 ? 'sales by cash, check or other payment methods are not on a 1099-K, so books can be higher' : 'look for an amount taken out twice or a sale missing from the books'}.`);
    }

    // Month by month: the forms' Boxes 5a to 5l against the export and the books.
    const formMonths = forms.every((f) => f.months) ? MONTHS.map((_, i) => sum(forms.map((f) => f.months[i]))) : null;
    const bookMonths = input.books?.months ?? null;
    const csvMonths = csv ? csv.months : null;
    let monthly = null;
    if (formMonths && (bookMonths || csvMonths)) {
      const other = bookMonths ?? csvMonths;
      monthly = MONTHS.map((name, i) => ({ month: name, box: MONTH_BOXES[i], form: formMonths[i], books: bookMonths ? bookMonths[i] : null, export: csvMonths ? csvMonths[i] : null, variance: formMonths[i] - other[i] }));
      const off = monthly.filter((m) => m.variance !== 0);
      add(off.length ? 'warn' : 'ok', 'months', off.length
        ? `${plural(off.length, 'month')} differ from your ${bookMonths ? 'books' : 'export'}: ${off.slice(0, 3).map((m) => `${m.month} by ${money(m.variance)}`).join(', ')}${off.length > 3 ? ' and more' : ''}. Sales near midnight and month ends often move between months because platforms date payments in UTC or by when funds are processed.`
        : `Boxes 5a to 5l match your ${bookMonths ? 'books' : 'export'} in every month.`);
    }

    const notIncomeParts = lines.filter((l) => l.kind === 'item' && lines.indexOf(l) < lines.findIndex((x) => x.key === 'grossReceipts')).map((l) => `${money(-l.cents)} of ${(ITEMS[l.key]?.short) ?? (l.key === 'personalLoss' ? 'personal items sold at a loss' : 'personal items sold at a gain')}`);
    const many = forms.length > 1;
    const head = many ? `Your ${WORDS[forms.length] ?? forms.length} ${year} Forms 1099-K, ${money(box1a)} in Box 1a together,` : `Your ${year} Form 1099-K Box 1a of ${money(box1a)}`;
    const landing = filerType === 'individual'
      ? `leave${many ? '' : 's'} ${money(notIncome)} of income after ${notIncomeParts.length ? andList(notIncomeParts) : 'nothing taken out'}`
      : `reconcile${many ? '' : 's'} to ${money(notIncome)} of business gross receipts${notIncomeParts.length ? ` after ${andList(notIncomeParts)}` : ''}`;
    const named = (keys) => andList(keys.filter((k) => adj[k]).map((k) => ITEMS[k].short));
    const tail = filerType === 'individual'
      ? (gains ? `; the ${money(gains)} gain goes on Form 8949 and Schedule D, and the losses are not deductible.` : '; the losses are not deductible.')
      : `; ${returns ? `${money(returns)} of ${named(['refunds', 'chargebacks', 'discounts'])} go${returns && ['refunds', 'chargebacks', 'discounts'].filter((k) => adj[k]).length === 1 && !adj.refunds ? 'es' : ''} on line 2` : 'no returns given'}${expenses ? ` and ${money(expenses)} of ${named(['fees', 'shipping'])} ${['fees', 'shipping'].filter((k) => adj[k]).length > 1 || adj.fees ? 'are' : 'is'} expenses` : ''}, so you kept ${money(kept)}.`;
    let answer = `${head} ${landing}${tail}`;
    if (books) answer += books.ties ? ' It ties to your books.' : ` Your books differ by ${money(books.variance)}.`;

    return {
      answer,
      taxYear: year,
      filerType,
      reportOn: irs.reporting[filerType],
      forms: forms.map((f) => ({ ...f, threshold: thresholdVerdict(f) })),
      box1a,
      bridge: lines.map((l) => ({ ...l, amount: money(l.cents) })),
      totals: { box1a, notIncome: box1a - notIncome, grossReceipts: notIncome, returns, netSales, expenses, kept, withholding: sum(forms.map((f) => f.box4)), gains },
      personalItems: items,
      monthly,
      transactions: csv,
      books,
      checks,
      sources: [S.i1099k, S.whatToDo, S.faqReceive, S.i1040sc].map((s) => ({ title: s.title, url: s.url, readOn: s.readOn })),
    };
  }

  return { reconcile, thresholdVerdict, threshold: T };
}

// The worksheet CSV (bridge, months, items) and a Markdown memo for the preparer.
const cell = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  const safe = /^[=+\-@\t\r]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s) ? `'${s}` : s;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};
export const toCsv = (rows) => rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';

export function workpaperOf(r, { dueDates, preparedOn }) {
  const bridgeRows = [['section', 'line', 'amount', 'where_it_goes'], ...r.bridge.map((l) => ['bridge', l.label, plain(l.cents), l.where])];
  const monthRows = r.monthly ? r.monthly.map((m) => ['month', `${m.month} (box ${m.box})`, plain(m.form), `books ${m.books === null ? '' : plain(m.books)}; export ${m.export === null ? '' : plain(m.export)}; variance ${plain(m.variance)}`]) : [];
  const itemRows = r.personalItems.map((p) => ['personal item', p.description, plain(p.proceeds), `cost ${plain(p.cost)}; ${p.result} ${plain(Math.abs(p.gain))}`]);
  const formRows = r.forms.map((f) => ['form', f.label, plain(f.box1a), `${FORM_KINDS[f.kind]}; box 3 ${f.box3 ?? ''}; box 4 ${plain(f.box4)}`]);
  const csv = toCsv([...bridgeRows, ...formRows, ...monthRows, ...itemRows]);
  const needsCorrection = r.checks.filter((c) => ['duplicate', 'months-sum', 'entity'].includes(c.code)).length > 0 || r.bridge.some((l) => l.key === 'personal' || l.key === 'duplicate');
  const request = needsCorrection ? [
    'To the filer named on my Form 1099-K:',
    '',
    `I am writing about the Form 1099-K you issued to me for ${r.taxYear}. ${r.bridge.some((l) => l.key === 'personal') ? `It includes ${money(-r.bridge.find((l) => l.key === 'personal').cents)} of personal payments (gifts or reimbursements) that were not payments for goods or services. ` : ''}${r.bridge.some((l) => l.key === 'duplicate') ? `It reports ${money(-r.bridge.find((l) => l.key === 'duplicate').cents)} of sales that are also reported on another Form 1099-K. ` : ''}${r.checks.some((c) => c.code === 'months-sum') ? 'Boxes 5a to 5l do not add up to Box 1a. ' : ''}${r.checks.some((c) => c.code === 'entity') ? 'The form shows my personal tax ID, but the business files its own return under its EIN. ' : ''}`,
    'Please review it and send me a corrected Form 1099-K, and file the correction with the IRS. I can provide transaction details on request.',
    '',
    '[Your name, account email and the account number shown on the form]',
  ].join('\n') : null;
  const md = [
    `# Form 1099-K reconciliation, tax year ${r.taxYear}`,
    '',
    `Prepared ${longDate(preparedOn)}. ${FILER_TYPES[r.filerType]}.`,
    '',
    r.answer,
    '',
    '## Walkdown',
    '',
    '| Line | Amount | Where it goes |',
    '| --- | ---: | --- |',
    ...r.bridge.map((l) => `| ${l.kind === 'item' ? 'Less: ' : ''}${l.label} | ${l.amount} | ${l.where} |`),
    '',
    '## Forms',
    '',
    ...r.forms.map((f) => `- ${f.label} (${FORM_KINDS[f.kind]}): Box 1a ${money(f.box1a)}${f.box3 !== null ? `, Box 3 ${f.box3} transactions` : ''}${f.box4 ? `, Box 4 ${money(f.box4)} withheld` : ''}. ${f.threshold.text}`),
    ...(r.monthly ? ['', '## Month by month (Boxes 5a to 5l)', '', '| Month | Form | Books | Export | Variance |', '| --- | ---: | ---: | ---: | ---: |', ...r.monthly.map((m) => `| ${m.month} (${m.box}) | ${money(m.form)} | ${m.books === null ? '' : money(m.books)} | ${m.export === null ? '' : money(m.export)} | ${money(m.variance)} |`)] : []),
    ...(r.personalItems.length ? ['', '## Personal items', '', ...r.personalItems.map((p) => `- ${p.description}: sold ${money(p.proceeds)}, cost ${money(p.cost)}, ${p.result === 'gain' ? `gain ${money(p.gain)} (Form 8949 and Schedule D)` : p.result === 'loss' ? `loss ${money(-p.gain)} (not deductible; proceeds in the space at the top of Schedule 1)` : 'no gain or loss'}`)] : []),
    '',
    '## Checks',
    '',
    ...r.checks.map((c) => `- ${c.text}`),
    '',
    '## Dates for these forms',
    '',
    `- Payee copy due ${longDate(dueDates.payee)}; filed with the IRS by ${longDate(dueDates.irsPaper)} on paper or ${longDate(dueDates.irsElectronic)} electronically.`,
    ...(request ? ['', '## Corrected-form request (to send to the filer, not the IRS)', '', ...request.split('\n').map((x) => (x ? `> ${x}` : '>'))] : []),
    '',
    `Sources: ${r.sources.map((s) => `${s.title}, read ${longDate(s.readOn)} (${s.url})`).join('; ')}. Computed from the amounts entered; not tax or legal advice.`,
  ].join('\n');
  return { csv, markdown: md, correctionRequest: request };
}
