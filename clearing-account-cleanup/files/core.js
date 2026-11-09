// Clearing-account cleanup: the engine. Pure and dependency-free, so the page and the server run the
// same file (README: core.js is browser-loadable).
//
// What it does with an account export (QuickBooks Online Transaction Detail by Account or General
// Ledger, Xero Account Transactions, or any CSV with a date and an amount):
//  1. Reads the CSV (comma, tab or semicolon), finds the header row by its column names, skips title
//     rows, account headings, Total rows and the opening balance row (kept as a figure), and picks the
//     clearing account when the file holds several.
//  2. Nets off inside the account: each line on the clearing side (a deposit or transfer out of
//     Undeposited Funds, a reclass out of Ask My Accountant) is paired with the item it cleared, one
//     for one by exact amount first, then as an exact set of items. A line that more than one set fits
//     is left open and every set is listed.
//  3. Ages what is still open into 0-30, 31-60, 61-90 and over 90 days as of a date (the latest date in
//     the file unless one is given), with the over-a-year count, possible duplicates and payee totals.
//  4. For each bank deposit given (a bank CSV or a list), finds every set of open items whose amounts
//     add up to the deposit to the cent, inside a date window. A deposit that two sets fit is never
//     settled for you. With a fee allowance, sets that exceed the deposit by up to that percent are
//     listed apart, with the fee each implies.
// Money is whole cents throughout; nothing is rounded except where a value is parsed.

export const ENGINE_VERSION = 'clearing-1';

export const LIMITS = {
  bytes: 2_000_000,        // ledger text
  bankBytes: 1_000_000,    // bank CSV text
  lines: 20_000,           // transaction lines in the chosen account
  deposits: 300,           // bank deposits per report
  candidates: 40,          // open items searched per deposit (the nearest by date when more fit the window)
  setsShown: 20,           // sets listed per deposit (all are counted while the search runs)
  feeSetsShown: 5,
  nodes: 2_000_000,        // search steps per deposit
  totalNodes: 40_000_000,  // search steps per report
  maxSetSize: 25,
  matchPayments: 200,
  matchDeposits: 50,
};

export const DEFAULTS = { windowBefore: 31, windowAfter: 3, feePercent: 0, maxSetSize: 12, dateOrder: 'auto' };
// A clearing line inside the account (a deposit, a reclass journal) is matched to a set of items dated
// up to this many days before it, or the deposit window if that is longer: reclasses are often made
// at a quarter's end.
export const NET_WINDOW = 92;

export const BUCKETS = [
  { id: '0-30', label: '0 to 30 days', from: 0, to: 30 },
  { id: '31-60', label: '31 to 60 days', from: 31, to: 60 },
  { id: '61-90', label: '61 to 90 days', from: 61, to: 90 },
  { id: '90+', label: 'Over 90 days', from: 91, to: Infinity },
];

export const CLEARING_RE = /undeposited|payments to deposit|ask my accountant|suspense|clearing|uncategori[sz]ed|opening balance equity/i;

export class ClearingError extends Error {
  constructor(message, field = 'ledger') { super(message); this.name = 'ClearingError'; this.field = field; }
}

// ---------- money and dates ----------

// "1,234.56", "$1,234.56", "(45.00)", "-45", "45.00-", "1 234,56" is not read (a decimal comma is
// refused rather than guessed). Returns whole cents, or null for a blank or unreadable value.
export function parseMoney(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') {
    if (!Number.isFinite(raw)) return null;
    return parseMoney(String(raw));
  }
  let s = String(raw).trim();
  if (!s) return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1).trim(); }
  if (/-$/.test(s)) { neg = !neg; s = s.slice(0, -1).trim(); }
  s = s.replace(/^[A-Z]{3}\s+/i, '').replace(/\s+[A-Z]{3}$/i, '');
  if (/^-/.test(s)) { neg = !neg; s = s.slice(1).trim(); }
  s = s.replace(/^[$£€]/, '').trim();
  if (/^-/.test(s)) { neg = !neg; s = s.slice(1).trim(); }
  if (/e/i.test(s)) {
    // 1.23E+3 style: only whole-number results are accepted.
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    s = n.toFixed(2);
  }
  if (!/^(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$|^\.\d+$/.test(s)) return null;
  s = s.replace(/,/g, '');
  const [whole, frac = ''] = s.split('.');
  let cents = Number(whole || '0') * 100 + Number((frac + '00').slice(0, 2));
  // A third decimal rounds half up (exports carry two; this only guards hand-made files).
  if (frac.length > 2 && Number(frac[2]) >= 5) cents += 1;
  if (!Number.isSafeInteger(cents)) return null;
  return neg ? -cents : cents;
}

export function money(cents) {
  const neg = cents < 0;
  const a = Math.abs(cents);
  const whole = Math.floor(a / 100).toLocaleString('en-US');
  return `${neg ? '-' : ''}$${whole}.${String(a % 100).padStart(2, '0')}`;
}
// Plain 1234.56 for CSV cells.
export const plain = (cents) => `${cents < 0 ? '-' : ''}${Math.floor(Math.abs(cents) / 100)}.${String(Math.abs(cents) % 100).padStart(2, '0')}`;

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const monthOf = (word) => {
  const w = word.toLowerCase().replace(/\.$/, '');
  if (w.length < 3) return 0;
  const i = MONTHS.findIndex((m) => m.startsWith(w) || (w === 'sept' && m === 'september'));
  return i + 1;
};
const iso = (y, m, d) => `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const valid = (y, m, d) => y >= 1900 && y <= 2200 && m >= 1 && m <= 12 && d >= 1 && d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
const year4 = (y) => (y.length === 2 ? 2000 + Number(y) : Number(y));

// The two numbers before the year in a slash date: [a, b, year] or null.
function slashParts(s) {
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})$/.exec(s);
  return m ? [Number(m[1]), Number(m[2]), year4(m[3])] : null;
}

// One date, as YYYY-MM-DD, or null. order is 'mdy' or 'dmy' for slash dates.
export function parseDate(raw, order = 'mdy') {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().replace(/\s+/g, ' ');
  if (!s) return null;
  let m = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T ].*)?$/.exec(s);
  if (m) return valid(+m[1], +m[2], +m[3]) ? iso(+m[1], +m[2], +m[3]) : null;
  const p = slashParts(s.replace(/ .*$/, ''));
  if (p) {
    const [a, b, y] = p;
    const [mo, d] = order === 'dmy' ? [b, a] : [a, b];
    return valid(y, mo, d) ? iso(y, mo, d) : null;
  }
  m = /^(\d{1,2})[ -]([A-Za-z]{3,9}\.?)[ ,-]*(\d{4}|\d{2})$/.exec(s);
  if (m) { const mo = monthOf(m[2]); const y = year4(m[3]); return mo && valid(y, mo, +m[1]) ? iso(y, mo, +m[1]) : null; }
  m = /^([A-Za-z]{3,9}\.?) (\d{1,2}),? (\d{4})$/.exec(s);
  if (m) { const mo = monthOf(m[1]); return mo && valid(+m[3], mo, +m[2]) ? iso(+m[3], mo, +m[2]) : null; }
  return null;
}

// Settles a column's slash-date order from its values: a first number over 12 proves DD/MM, a second
// over 12 proves MM/DD. Values that prove both are an error; values that prove neither use the
// choice (MM/DD by default, as US QuickBooks writes them).
export function dateOrderOf(values, choice = 'auto') {
  if (choice === 'mdy' || choice === 'dmy') return { order: choice, proof: 'chosen' };
  let dmy = null; let mdy = null;
  for (const v of values) {
    const p = slashParts(String(v ?? '').trim().replace(/ .*$/, ''));
    if (!p) continue;
    if (p[0] > 12 && p[1] <= 12) dmy ??= v;
    if (p[1] > 12 && p[0] <= 12) mdy ??= v;
  }
  if (dmy && mdy) throw new ClearingError(`The dates mix two orders: ${String(dmy).trim()} can only be day first and ${String(mdy).trim()} only month first. Fix the file or choose the order.`, 'dateOrder');
  if (dmy) return { order: 'dmy', proof: String(dmy).trim() };
  if (mdy) return { order: 'mdy', proof: String(mdy).trim() };
  return { order: 'mdy', proof: null };
}

export const dayNumber = (isoDate) => Date.UTC(+isoDate.slice(0, 4), +isoDate.slice(5, 7) - 1, +isoDate.slice(8, 10)) / 86_400_000;
export const fromDayNumber = (n) => new Date(n * 86_400_000).toISOString().slice(0, 10);
export const addDays = (isoDate, n) => fromDayNumber(dayNumber(isoDate) + n);
const WORD_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (isoDate) => `${WORD_MONTHS[+isoDate.slice(5, 7) - 1]} ${+isoDate.slice(8, 10)}, ${isoDate.slice(0, 4)}`;
const WEEKDAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];
export const weekday = (isoDate) => WEEKDAYS[((dayNumber(isoDate) % 7) + 7) % 7];

// ---------- CSV ----------

function detectDelimiter(text) {
  const lines = text.split(/\r\n|\n|\r/).filter((l) => l.trim()).slice(0, 40);
  let best = ','; let bestScore = -1;
  for (const d of [',', '\t', ';']) {
    let score = 0;
    for (const l of lines) {
      let q = false; let n = 0;
      for (const c of l) { if (c === '"') q = !q; else if (c === d && !q) n++; }
      if (n) score += 1;
    }
    if (score > bestScore) { best = d; bestScore = score; }
  }
  return best;
}

// RFC 4180 reading: quoted fields may hold the delimiter, quotes ("") and line breaks.
export function parseCsv(text, delimiter = null) {
  if (typeof text !== 'string') throw new ClearingError('The file must be text (a CSV).');
  const t = text.replace(/^﻿/, '');
  const d = delimiter ?? detectDelimiter(t);
  const rows = []; let row = []; let field = ''; let q = false; let i = 0;
  while (i < t.length) {
    const c = t[i];
    if (q) {
      if (c === '"') { if (t[i + 1] === '"') { field += '"'; i += 2; continue; } q = false; i++; continue; }
      field += c; i++; continue;
    }
    if (c === '"' && field.trim() === '') { q = true; field = ''; i++; continue; }
    if (c === d) { row.push(field); field = ''; i++; continue; }
    if (c === '\r' || c === '\n') {
      row.push(field); rows.push(row); row = []; field = '';
      i += c === '\r' && t[i + 1] === '\n' ? 2 : 1; continue;
    }
    field += c; i++;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return { rows: rows.map((r) => r.map((v) => v.trim())), delimiter: d };
}

// ---------- layouts ----------

const norm = (s) => String(s ?? '').toLowerCase().replace(/[ \s]+/g, ' ').replace(/\s*\((usd|gbp|eur|cad|aud|nzd)\)$/, '').trim();
export const HEADER_NAMES = {
  date: ['date', 'transaction date', 'txn date', 'posting date', 'posted date', 'trans date', 'trans. date'],
  type: ['transaction type', 'type', 'source', 'txn type'],
  num: ['num', 'no.', 'no', 'number', 'reference', 'ref', 'ref no.', 'ref no', 'ref #', 'check no.', 'check number', 'doc number'],
  name: ['name', 'contact', 'customer', 'payee', 'received from', 'customer/vendor', 'vendor'],
  memo: ['memo/description', 'memo', 'description', 'details', 'narration', 'transaction description'],
  split: ['split', 'related account', 'split account'],
  account: ['account', 'account name', 'distribution account', 'account full name'],
  amount: ['amount', 'net amount', 'net'],
  debit: ['debit', 'debits', 'dr'],
  credit: ['credit', 'credits', 'cr'],
  balance: ['balance', 'running balance'],
};
const BANK_NAMES = {
  date: HEADER_NAMES.date,
  memo: ['description', 'memo', 'details', 'narration', 'transaction description', 'payee', 'name'],
  amount: ['amount', 'transaction amount'],
  credit: ['credit', 'credits', 'deposit', 'deposits', 'money in', 'credit amount', 'paid in'],
  debit: ['debit', 'debits', 'withdrawal', 'withdrawals', 'money out', 'debit amount', 'paid out'],
  num: ['reference', 'ref', 'check number', 'check no.', 'id', 'transaction id'],
};

function mapHeader(cells, names) {
  const map = {};
  cells.forEach((c, i) => {
    const n = norm(c);
    for (const [key, list] of Object.entries(names)) if (map[key] === undefined && list.includes(n)) map[key] = i;
  });
  return map;
}

function findHeader(rows, names, need) {
  for (let i = 0; i < Math.min(rows.length, 40); i++) {
    const map = mapHeader(rows[i], names);
    if (map.date !== undefined && need(map)) return { index: i, map };
  }
  return null;
}

// Which product the header looks like, for the answer's wording only.
function layoutOf(map, cells) {
  const has = (k) => map[k] !== undefined;
  const names = cells.map(norm);
  if (has('split') && names.includes('transaction type')) return { id: 'qbo', name: 'QuickBooks account report (Transaction Detail by Account or General Ledger)' };
  if (names.includes('related account') || names.includes('running balance')) return { id: 'xero', name: 'Xero Account Transactions report' };
  return { id: 'generic', name: 'CSV with a date and an amount' };
}

const TOTAL_RE = /^total\b/i;
const OPENING_RE = /^(beginning|opening) balance$/i;

// Reads the account lines of a ledger export. Returns { layout, header, accounts: [{ name, lines,
// opening, reported }], order, skipped }.
export function readLedger(text, { dateOrder = 'auto' } = {}) {
  if (typeof text !== 'string' || !text.trim()) throw new ClearingError('The ledger file is empty.');
  if (text.length > LIMITS.bytes) throw new ClearingError(`The ledger file is over ${LIMITS.bytes.toLocaleString('en-US')} characters; export a shorter date range.`);
  const { rows } = parseCsv(text);
  const head = findHeader(rows, HEADER_NAMES, (m) => m.amount !== undefined || m.debit !== undefined || m.credit !== undefined);
  if (!head) throw new ClearingError('No header row with a Date column and an Amount (or Debit and Credit) column was found in the first 40 rows. Export the account report with those columns, or add a header row.');
  const { map, index } = head;
  const layout = layoutOf(map, rows[index]);
  const body = rows.slice(index + 1);
  const { order, proof } = dateOrderOf(body.map((r) => r[map.date]), dateOrder);
  const accounts = new Map();
  const acct = (name) => {
    if (!accounts.has(name)) accounts.set(name, { name, lines: [], opening: null, reported: null });
    return accounts.get(name);
  };
  let section = null;
  let skipped = 0;
  const amountOf = (r) => {
    if (map.amount !== undefined) return parseMoney(r[map.amount]);
    const dr = map.debit !== undefined ? parseMoney(r[map.debit]) : null;
    const cr = map.credit !== undefined ? parseMoney(r[map.credit]) : null;
    if (dr === null && cr === null) return null;
    return (dr ?? 0) - (cr ?? 0);
  };
  body.forEach((r, k) => {
    const lineNo = index + 2 + k;
    if (!r.some((v) => v !== '')) return;
    const texts = r.filter((v) => v !== '');
    const first = texts[0] ?? '';
    const date = parseDate(r[map.date], order);
    const named = (key) => (map[key] !== undefined ? r[map[key]] ?? '' : '');
    const isOpening = texts.some((v) => OPENING_RE.test(v));
    if (isOpening) {
      const amt = amountOf(r) ?? (map.balance !== undefined ? parseMoney(r[map.balance]) : null);
      const a = acct((map.account !== undefined && named('account')) || section || 'The account');
      a.opening = { amount: amt ?? 0, date, line: lineNo };
      return;
    }
    if (!date) {
      if (TOTAL_RE.test(first)) {
        const label = first.replace(/^total\s*(for\s*)?/i, '').trim();
        const amt = amountOf(r) ?? (map.balance !== undefined ? parseMoney(r[map.balance]) : null);
        const target = label || section || 'The account';
        if (amt !== null && accounts.has(target)) accounts.get(target).reported = amt;
        else if (amt !== null && section) acct(section).reported = amt;
        return;
      }
      // An account heading: one text cell (QuickBooks and Xero group the report by account).
      if (texts.length === 1 && !parseMoney(first) && !parseDate(first, order)) { section = first; return; }
      if (r[map.date]) skipped++;
      return;
    }
    const amount = amountOf(r);
    if (amount === null) { skipped++; return; }
    if (amount === 0) return;
    const name = (map.account !== undefined && named('account')) || section || 'The account';
    const a = acct(name);
    a.lines.push({
      line: lineNo, date, amount,
      type: named('type'), num: named('num'), name: named('name'), memo: named('memo'), split: named('split'),
      balance: map.balance !== undefined ? parseMoney(r[map.balance]) : null,
    });
  });
  // A Running Balance column gives the reported closing figure when there is no Total row.
  for (const a of accounts.values()) {
    if (a.reported === null) {
      const withBal = a.lines.filter((l) => l.balance !== null);
      if (withBal.length) a.reported = withBal[withBal.length - 1].balance;
    }
  }
  const list = [...accounts.values()].filter((a) => a.lines.length || a.opening);
  if (!list.length) throw new ClearingError('No transaction lines with a date and an amount were found under the header row.');
  return { layout, header: rows[index], columns: map, order, orderProof: proof, accounts: list, skipped };
}

// Reads deposits from a bank CSV: money in only (a positive Amount, or the Credit/Deposit column).
export function readBank(text, { dateOrder = 'auto' } = {}) {
  if (typeof text !== 'string' || !text.trim()) return [];
  if (text.length > LIMITS.bankBytes) throw new ClearingError(`The bank file is over ${LIMITS.bankBytes.toLocaleString('en-US')} characters; export a shorter date range.`, 'bank');
  const { rows } = parseCsv(text);
  const head = findHeader(rows, BANK_NAMES, (m) => m.amount !== undefined || m.credit !== undefined);
  if (!head) throw new ClearingError('The bank file needs a header row with a Date column and an Amount (or Credit / Deposits) column.', 'bank');
  const { map, index } = head;
  const body = rows.slice(index + 1);
  let order;
  try { ({ order } = dateOrderOf(body.map((r) => r[map.date]), dateOrder)); } catch (e) { throw new ClearingError(e.message, 'bank'); }
  const out = [];
  body.forEach((r, k) => {
    const date = parseDate(r[map.date], order);
    if (!date) return;
    let amount = null;
    if (map.credit !== undefined) amount = parseMoney(r[map.credit]);
    if ((amount === null || amount === 0) && map.amount !== undefined) amount = parseMoney(r[map.amount]);
    if (amount === null || amount <= 0) return;
    out.push({ date, amount: Math.abs(amount), ref: map.num !== undefined ? r[map.num] ?? '' : '', memo: map.memo !== undefined ? r[map.memo] ?? '' : '', line: index + 2 + k });
  });
  return out;
}

// ---------- the search: every set of amounts whose total falls in [lo, hi] ----------

// amounts are positive cents. Returns { sets: [[index...]], count, complete, nodes }.
export function findSets(amounts, lo, hi, { maxSize = DEFAULTS.maxSetSize, keep = LIMITS.setsShown, budget = LIMITS.nodes } = {}) {
  const order = amounts.map((a, i) => i).sort((x, y) => amounts[y] - amounts[x] || x - y);
  const a = order.map((i) => amounts[i]);
  const n = a.length;
  const suffix = new Array(n + 1).fill(0);
  for (let i = n - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + a[i];
  const sets = []; let count = 0; let nodes = 0; let stopped = false;
  const chosen = [];
  const go = (start, sum) => {
    if (stopped) return;
    if (++nodes > budget) { stopped = true; return; }
    if (chosen.length && sum >= lo && sum <= hi) {
      count++;
      if (sets.length < keep) sets.push(chosen.map((j) => order[j]).sort((x, y) => x - y));
    }
    if (chosen.length >= maxSize) return;
    for (let j = start; j < n; j++) {
      const s = sum + a[j];
      if (s > hi) continue;
      if (s + suffix[j + 1] < lo) break;
      chosen.push(j);
      go(j + 1, s);
      chosen.pop();
      if (stopped) return;
    }
  };
  if (n && hi > 0 && suffix[0] >= lo) go(0, 0);
  return { sets, count, complete: !stopped, nodes };
}

// ---------- the analysis ----------

const pickAccount = (accounts, wanted) => {
  if (wanted) {
    const w = norm(wanted);
    const exact = accounts.find((a) => norm(a.name) === w) ?? accounts.find((a) => norm(a.name).includes(w));
    if (!exact) throw new ClearingError(`No account named "${wanted}" in the file. Accounts found: ${accounts.map((a) => a.name).join(', ')}.`, 'account');
    return exact;
  }
  if (accounts.length === 1) return accounts[0];
  const clearing = accounts.filter((a) => CLEARING_RE.test(a.name));
  if (clearing.length) return clearing[0];
  throw new ClearingError(`The file holds ${accounts.length} accounts (${accounts.slice(0, 8).map((a) => a.name).join(', ')}${accounts.length > 8 ? ', ...' : ''}). Name the one to clean up.`, 'account');
};

// What kind of clearing account this is, from its name, for the wording.
export function kindOf(name) {
  if (/undeposited|payments to deposit/i.test(name)) return 'undeposited';
  if (/ask my accountant/i.test(name)) return 'ama';
  if (/uncategori[sz]ed/i.test(name)) return 'uncategorized';
  if (/suspense/i.test(name)) return 'suspense';
  if (/opening balance equity/i.test(name)) return 'obe';
  return 'clearing';
}

const itemOut = (l) => ({ line: l.line, date: l.date, amount: l.amount, type: l.type, num: l.num, name: l.name, memo: l.memo });

// Pairs clearing-side lines with the items they cleared. Mutates nothing; returns the open items and
// offsets and what cleared what.
function netOff(items, offsets, opts, budget) {
  const used = new Set();
  const pairs = []; const sets = []; const several = []; const unmatched = [];
  let ties = 0;
  const after = opts.windowAfter;
  const sorted = [...offsets].sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : x.line - y.line));
  const byAmount = new Map();
  for (const it of items) {
    const k = Math.abs(it.amount);
    if (!byAmount.has(k)) byAmount.set(k, []);
    byAmount.get(k).push(it);
  }
  const left = [];
  // 1. One for one: same amount, dated no later than the clearing line (plus the window after); the
  //    same name first, then the closest earlier date, then the earlier line.
  for (const o of sorted) {
    const cands = (byAmount.get(Math.abs(o.amount)) ?? []).filter((it) => !used.has(it.line) && dayNumber(it.date) <= dayNumber(o.date) + after);
    if (!cands.length) { left.push(o); continue; }
    if (cands.length > 1) ties++;
    const dist = (it) => {
      const d = dayNumber(o.date) - dayNumber(it.date);
      return d >= 0 ? d : 100_000 - d;
    };
    const same = o.name ? cands.filter((it) => it.name && norm(it.name) === norm(o.name)) : [];
    const pool = same.length ? same : cands;
    pool.sort((x, y) => dist(x) - dist(y) || x.line - y.line);
    used.add(pool[0].line);
    pairs.push({ offset: itemOut(o), item: itemOut(pool[0]) });
  }
  // 2. A clearing line equal to a set of items in its window. One set clears them; several are listed.
  for (const o of left) {
    const lo = dayNumber(o.date) - Math.max(opts.windowBefore, NET_WINDOW); const hi = dayNumber(o.date) + after;
    let cands = items.filter((it) => !used.has(it.line) && Math.abs(it.amount) <= Math.abs(o.amount) && dayNumber(it.date) >= lo && dayNumber(it.date) <= hi);
    if (cands.length > LIMITS.candidates) {
      cands = [...cands].sort((x, y) => Math.abs(dayNumber(o.date) - dayNumber(x.date)) - Math.abs(dayNumber(o.date) - dayNumber(y.date)) || x.line - y.line).slice(0, LIMITS.candidates);
    }
    if (cands.length < 2 || budget.left <= 0) { unmatched.push(o); continue; }
    const r = findSets(cands.map((c) => Math.abs(c.amount)), Math.abs(o.amount), Math.abs(o.amount), { maxSize: opts.maxSetSize, budget: Math.min(LIMITS.nodes, budget.left) });
    budget.left -= r.nodes;
    if (r.count === 1 && r.complete) {
      const set = r.sets[0].map((i) => cands[i]);
      set.forEach((it) => used.add(it.line));
      sets.push({ offset: itemOut(o), items: set.map(itemOut) });
    } else if (r.count > 1) {
      several.push({ offset: itemOut(o), count: r.count, complete: r.complete, sets: r.sets.map((s) => s.map((i) => itemOut(cands[i]))) });
      unmatched.push(o);
    } else {
      unmatched.push(o);
    }
  }
  return { used, pairs, sets, several, unmatched, ties };
}

function bucketOf(age) {
  return BUCKETS.find((b) => age >= b.from && age <= b.to) ?? BUCKETS[0];
}

// The most a set may total for a deposit when fees of up to feePercent of the set's total were
// taken out before the money reached the bank: total - deposit <= total x feePercent / 100.
export const feeCeiling = (deposit, feePercent) => (feePercent > 0 ? Math.floor((deposit * 100) / (100 - feePercent)) : deposit);

// Every set of open items that adds up to each deposit. items carry sign-free cents (abs).
export function matchDeposits(open, deposits, opts, budget = { left: LIMITS.totalNodes }) {
  const results = deposits.map((dep, di) => {
    const out = { index: di, date: dep.date ?? null, amount: dep.amount, ref: dep.ref ?? '', memo: dep.memo ?? '', status: 'none', sets: [], count: 0, feeSets: [], complete: true, candidates: 0, narrowed: false };
    let cands = open.filter((it) => Math.abs(it.amount) <= feeCeiling(dep.amount, opts.feePercent) && (!dep.date || !it.date || (dayNumber(it.date) >= dayNumber(dep.date) - opts.windowBefore && dayNumber(it.date) <= dayNumber(dep.date) + opts.windowAfter)));
    const near = (it) => (dep.date && it.date ? Math.abs(dayNumber(dep.date) - dayNumber(it.date)) : 0);
    if (cands.length > LIMITS.candidates) {
      cands = [...cands].sort((x, y) => near(x) - near(y) || x.line - y.line).slice(0, LIMITS.candidates);
      out.narrowed = true;
    }
    out.candidates = cands.length;
    if (!cands.length) return out;
    if (budget.left <= 0) { out.status = 'not-searched'; out.complete = false; return out; }
    const amounts = cands.map((c) => Math.abs(c.amount));
    const exact = findSets(amounts, dep.amount, dep.amount, { maxSize: opts.maxSetSize, budget: Math.min(LIMITS.nodes, budget.left) });
    budget.left -= exact.nodes;
    out.count = exact.count;
    out.complete = exact.complete;
    const rank = (set) => [Math.max(0, ...set.map((i) => near(cands[i]))), set.length];
    const sortSets = (sets) => [...sets].sort((x, y) => {
      const [a1, a2] = rank(x); const [b1, b2] = rank(y);
      return a1 - b1 || a2 - b2 || cands[x[0]].line - cands[y[0]].line;
    });
    out.sets = sortSets(exact.sets).map((s) => ({ items: s.map((i) => itemOut(cands[i])), total: s.reduce((t, i) => t + amounts[i], 0), spanDays: rank(s)[0] }));
    if (exact.count === 1 && exact.complete) out.status = 'exact';
    else if (exact.count > 1) out.status = 'several';
    else if (!exact.complete) out.status = 'incomplete';
    if (!exact.count && opts.feePercent > 0 && budget.left > 0) {
      const hi = feeCeiling(dep.amount, opts.feePercent);
      const fee = findSets(amounts, dep.amount + 1, hi, { maxSize: opts.maxSetSize, keep: 200, budget: Math.min(LIMITS.nodes, budget.left) });
      budget.left -= fee.nodes;
      if (fee.count) {
        out.status = 'fee';
        out.feeCount = fee.count;
        out.feeSets = fee.sets
          .map((s) => ({ items: s.map((i) => itemOut(cands[i])), total: s.reduce((t, i) => t + amounts[i], 0), spanDays: rank(s)[0] }))
          .map((x) => ({ ...x, fee: x.total - dep.amount, feePercent: Math.round(((x.total - dep.amount) / x.total) * 10_000) / 100 }))
          .sort((x, y) => x.fee - y.fee || x.spanDays - y.spanDays || x.items.length - y.items.length || x.items[0].line - y.items[0].line)
          .slice(0, LIMITS.feeSetsShown);
      }
    }
    return out;
  });
  // A single exact set whose item another single exact set also uses: neither is settled.
  const owner = new Map();
  for (const r of results) if (r.status === 'exact') for (const it of r.sets[0].items) owner.set(it.line, (owner.get(it.line) ?? 0) + 1);
  for (const r of results) {
    if (r.status === 'exact' && r.sets[0].items.some((it) => owner.get(it.line) > 1)) r.status = 'conflict';
  }
  return results;
}

const normOpts = (o = {}) => ({
  windowBefore: o.windowBefore ?? DEFAULTS.windowBefore,
  windowAfter: o.windowAfter ?? DEFAULTS.windowAfter,
  feePercent: o.feePercent ?? DEFAULTS.feePercent,
  maxSetSize: Math.min(o.maxSetSize ?? DEFAULTS.maxSetSize, LIMITS.maxSetSize),
  dateOrder: o.dateOrder ?? DEFAULTS.dateOrder,
  asOf: o.asOf ?? null,
  account: o.account ?? null,
});

const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const KIND_WORDS = { undeposited: 'payments', ama: 'items', uncategorized: 'items', suspense: 'items', obe: 'entries', clearing: 'items' };

// The whole report for one ledger export (and optionally bank deposits).
export function analyze({ ledger, bank = null, deposits = null }, options = {}) {
  const opts = normOpts(options);
  const read = readLedger(ledger, { dateOrder: opts.dateOrder });
  const account = pickAccount(read.accounts, opts.account);
  if (account.lines.length > LIMITS.lines) throw new ClearingError(`The account has ${account.lines.length.toLocaleString('en-US')} lines; at most ${LIMITS.lines.toLocaleString('en-US')} are read at once. Export a shorter date range.`);
  const kind = kindOf(account.name);
  const lines = account.lines;
  const opening = account.opening?.amount ?? 0;
  const computed = lines.reduce((t, l) => t + l.amount, 0) + opening;
  // The item side is the side the balance is on (debits for Undeposited Funds and Ask My Accountant).
  const gross = (sign) => lines.filter((l) => Math.sign(l.amount) === sign).reduce((t, l) => t + Math.abs(l.amount), 0);
  const side = computed > 0 ? 1 : computed < 0 ? -1 : (gross(1) >= gross(-1) ? 1 : -1);
  const items = lines.filter((l) => Math.sign(l.amount) === side);
  const offsets = lines.filter((l) => Math.sign(l.amount) === -side);
  const budget = { left: LIMITS.totalNodes };
  const net = netOff(items, offsets, opts, budget);
  const latest = lines.reduce((m, l) => (l.date > m ? l.date : m), account.opening?.date ?? '0000-00-00');
  const asOf = opts.asOf ?? latest;
  const asOfFrom = opts.asOf ? 'chosen' : 'latest';
  const openLines = [
    ...(opening ? [{ line: account.opening.line, date: account.opening.date ?? lines[0]?.date ?? asOf, amount: opening, type: 'Opening balance', num: '', name: '', memo: 'Balance brought forward from before the report dates', opening: true }] : []),
    ...items.filter((it) => !net.used.has(it.line)),
    ...net.unmatched,
  ].sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : x.line - y.line));
  // Possible duplicates: the same date, amount, name and number, two or more times.
  const dupKey = (l) => [l.date, l.amount, norm(l.name), norm(l.num)].join('|');
  const dupCount = new Map();
  for (const l of openLines) if (!l.opening) dupCount.set(dupKey(l), (dupCount.get(dupKey(l)) ?? 0) + 1);
  let future = 0;
  const open = openLines.map((l) => {
    const age = dayNumber(asOf) - dayNumber(l.date);
    if (age < 0) future++;
    const b = bucketOf(Math.max(0, age));
    const flags = [];
    if (l.opening) flags.push('opening balance');
    if (Math.sign(l.amount) === -side) flags.push('clearing line with no match');
    if (!l.opening && dupCount.get(dupKey(l)) > 1) flags.push('possible duplicate');
    if (age > 365) flags.push('over a year old');
    if (age < 0) flags.push('dated after the as-of date');
    return { ...itemOut(l), age, bucket: b.id, flags };
  });
  const openTotal = open.reduce((t, l) => t + l.amount, 0);
  const aging = BUCKETS.map((b) => {
    const inB = open.filter((l) => l.bucket === b.id);
    return { id: b.id, label: b.label, count: inB.length, total: inB.reduce((t, l) => t + l.amount, 0) };
  });
  const overYear = open.filter((l) => l.age > 365);
  // Payee totals for the open items, largest first.
  const payeeMap = new Map();
  for (const l of open) {
    const k = l.name || (l.opening ? '(opening balance)' : l.memo || '(no name)');
    const p = payeeMap.get(k) ?? { name: k, count: 0, total: 0 };
    p.count++; p.total += l.amount;
    payeeMap.set(k, p);
  }
  let run = 0;
  const payees = [...payeeMap.values()].sort((x, y) => Math.abs(y.total) - Math.abs(x.total) || (x.name < y.name ? -1 : 1)).map((p) => {
    run += Math.abs(p.total);
    const base = open.reduce((t, l) => t + Math.abs(l.amount), 0) || 1;
    return { ...p, share: Math.round((Math.abs(p.total) / base) * 1000) / 10, cumulative: Math.round((run / base) * 1000) / 10 };
  });
  // Deposits: from the bank file and/or the list given.
  const depList = [
    ...(bank ? readBank(bank, { dateOrder: opts.dateOrder }) : []),
    ...(deposits ?? []).map((d, i) => ({ date: d.date ? parseDate(d.date, 'mdy') : null, amount: Math.abs(parseMoney(d.amount) ?? 0), ref: d.ref ?? '', memo: d.memo ?? '', line: null, given: i })),
  ].filter((d) => d.amount > 0);
  if (depList.length > LIMITS.deposits) throw new ClearingError(`${depList.length} deposits were given; at most ${LIMITS.deposits} are matched at once. Use a shorter bank date range.`, 'bank');
  const matchable = open.filter((l) => !l.opening && Math.sign(l.amount) === side);
  const matches = matchDeposits(matchable, depList, opts, budget);
  const count = (s) => matches.filter((m) => m.status === s).length;
  const deposited = new Set();
  for (const m of matches) if (m.status === 'exact') for (const it of m.sets[0].items) deposited.add(it.line);
  for (const l of open) if (deposited.has(l.line)) l.flags.push('matched to a bank deposit');
  const reported = account.reported;
  const tie = { computed, reported, difference: reported === null ? null : reported - computed, openTotal, opening };
  const warnings = [];
  if (read.skipped) warnings.push(`${plural(read.skipped, 'row')} with a date but no readable amount ${read.skipped === 1 ? 'was' : 'were'} skipped.`);
  if (read.accounts.length > 1) warnings.push(`The file holds ${read.accounts.length} accounts; this report is for ${account.name}. Others: ${read.accounts.filter((a) => a !== account).slice(0, 8).map((a) => a.name).join(', ')}.`);
  if (opening) warnings.push(`The account had an opening balance of ${money(opening)} on the report's first day. Its items are older than the report, so it is aged as one item; run the report from an earlier date to see them.`);
  if (tie.difference) warnings.push(`The lines add up to ${money(computed)} but the report shows ${money(reported)} (a difference of ${money(tie.difference)}). Check the report's date range and basis.`);
  if (future) warnings.push(`${plural(future, 'item')} ${future === 1 ? 'is' : 'are'} dated after the as-of date ${asOf}.`);
  if (net.ties) warnings.push(`${plural(net.ties, 'clearing line')} could pair with more than one item of the same amount; the one with the same name, then the closest earlier date, was used.`);
  if (matches.some((m) => !m.complete)) warnings.push('The search stopped early for some deposits (too many combinations). Narrow the date window or the set size to finish them.');
  const result = {
    engine: ENGINE_VERSION,
    account: account.name,
    kind,
    layout: read.layout,
    dateOrder: { order: read.order, proof: read.orderProof },
    asOf, asOfFrom,
    options: { windowBefore: opts.windowBefore, windowAfter: opts.windowAfter, feePercent: opts.feePercent, maxSetSize: opts.maxSetSize },
    lines: lines.length,
    accountsFound: read.accounts.map((a) => a.name),
    balance: tie,
    netted: {
      pairs: net.pairs.length, sets: net.sets.length,
      lines: net.pairs.length * 2 + net.sets.reduce((t, s) => t + 1 + s.items.length, 0),
      several: net.several.length,
    },
    openCount: open.length,
    openTotal,
    aging,
    overYear: { count: overYear.length, total: overYear.reduce((t, l) => t + l.amount, 0) },
    duplicates: open.filter((l) => l.flags.includes('possible duplicate')).length,
    deposits: { given: depList.length, exact: count('exact'), several: count('several'), fee: count('fee'), conflict: count('conflict'), none: count('none'), incomplete: count('incomplete') + count('not-searched') },
    warnings,
  };
  result.answer = answerOf(result);
  return { result, detail: { open, pairs: net.pairs, sets: net.sets, severalOffsets: net.several, matches, payees } };
}

export function answerOf(r) {
  const what = KIND_WORDS[r.kind];
  const parts = [];
  parts.push(`${r.account} holds ${plural(r.openCount, what === 'payments' ? 'open payment' : what === 'entries' ? 'open entry' : 'open item', what === 'payments' ? 'open payments' : what === 'entries' ? 'open entries' : 'open items')} totaling ${r.openTotal < 0 ? `${money(-r.openTotal)} (a credit balance)` : money(r.openTotal)} as of ${longDate(r.asOf)}${r.asOfFrom === 'latest' ? ' (the latest date in the file)' : ''}.`);
  const old = r.aging.find((b) => b.id === '90+');
  parts.push(old.count ? `${old.count.toLocaleString('en-US')} ${old.count === 1 ? 'is' : 'are'} over 90 days old (${money(Math.abs(old.total))}${old.total < 0 ? ' in credits' : ''})${r.overYear.count ? `, ${r.overYear.count} of them over a year` : ''}.` : 'None is over 90 days old.');
  if (r.netted.pairs || r.netted.sets) parts.push(`${plural(r.netted.lines, 'line')} already net off inside the account (${plural(r.netted.pairs, 'one-for-one pair')}${r.netted.sets ? ` and ${plural(r.netted.sets, 'clearing line')} made of several items` : ''}).`);
  if (r.netted.several) parts.push(`${plural(r.netted.several, 'clearing line')} could be made of more than one set of items and ${r.netted.several === 1 ? 'is' : 'are'} left open.`);
  if (r.deposits.given) {
    const d = r.deposits;
    const bits = [`${d.exact} of ${plural(d.given, 'bank deposit')} ${d.exact === 1 ? 'is' : 'are'} matched exactly by one set of open items`];
    if (d.several) bits.push(`${d.several} ${d.several === 1 ? 'has' : 'have'} more than one possible set`);
    if (d.conflict) bits.push(`${d.conflict} share${d.conflict === 1 ? 's' : ''} items with another deposit`);
    if (d.fee) bits.push(`${d.fee} match${d.fee === 1 ? 'es' : ''} only after a fee`);
    if (d.none) bits.push(`${d.none} ${d.none === 1 ? 'has' : 'have'} no match`);
    if (d.incomplete) bits.push(`${d.incomplete} could not be searched to the end`);
    parts.push(`${bits.join('; ')}.`);
  }
  if (r.balance.difference) parts.push(`The lines and the report's own total differ by ${money(r.balance.difference)}.`);
  return parts.join(' ');
}

// The free preview: the totals and counts, not the item lists.
export function preview(input, options) {
  const { result } = analyze(input, options);
  return result;
}

// The paid report: everything, with CSV working papers.
export function report(input, options) {
  const { result, detail } = analyze(input, options);
  return {
    ...result,
    open: detail.open,
    netOff: { pairs: detail.pairs, sets: detail.sets, several: detail.severalOffsets },
    matches: detail.matches,
    payees: detail.payees.slice(0, 50),
    csv: { open: openCsv(detail.open), matches: matchesCsv(detail.matches) },
  };
}

// ---------- the quick match: amounts in, every set out ----------

export function match({ payments, deposits }, options = {}) {
  const opts = normOpts(options);
  if (!Array.isArray(payments) || !payments.length) throw new ClearingError('Give at least one payment.', 'payments');
  if (payments.length > LIMITS.matchPayments) throw new ClearingError(`At most ${LIMITS.matchPayments} payments at once.`, 'payments');
  if (!Array.isArray(deposits) || !deposits.length) throw new ClearingError('Give at least one deposit.', 'deposits');
  if (deposits.length > LIMITS.matchDeposits) throw new ClearingError(`At most ${LIMITS.matchDeposits} deposits at once.`, 'deposits');
  const items = payments.map((p, i) => {
    const amount = parseMoney(p.amount);
    if (amount === null || amount === 0) throw new ClearingError(`Payment ${i + 1}: "${p.amount}" is not an amount.`, 'payments');
    const date = p.date ? parseDate(p.date, 'mdy') : null;
    if (p.date && !date) throw new ClearingError(`Payment ${i + 1}: "${p.date}" is not a date (use YYYY-MM-DD).`, 'payments');
    return { line: i + 1, date, amount: Math.abs(amount), type: '', num: p.ref ?? '', name: p.name ?? '', memo: '' };
  });
  const deps = deposits.map((d, i) => {
    const amount = parseMoney(d.amount);
    if (amount === null || amount === 0) throw new ClearingError(`Deposit ${i + 1}: "${d.amount}" is not an amount.`, 'deposits');
    const date = d.date ? parseDate(d.date, 'mdy') : null;
    if (d.date && !date) throw new ClearingError(`Deposit ${i + 1}: "${d.date}" is not a date (use YYYY-MM-DD).`, 'deposits');
    return { date, amount: Math.abs(amount), ref: d.ref ?? '' };
  });
  const results = matchDeposits(items, deps, opts);
  const says = results.map((r) => {
    const amt = money(r.amount);
    if (r.status === 'exact') return `${amt}: one set fits, payments ${r.sets[0].items.map((x) => x.line).join(', ')}.`;
    if (r.status === 'several' || r.status === 'conflict') return `${amt}: ${plural(r.count, 'set')} fit${r.count === 1 ? 's' : ''}${r.complete ? '' : ' (search stopped early)'}; the closest by date is payments ${r.sets[0].items.map((x) => x.line).join(', ')}.`;
    if (r.status === 'fee') return `${amt}: no exact set; payments ${r.feeSets[0].items.map((x) => x.line).join(', ')} total ${money(r.feeSets[0].total)}, a fee of ${money(r.feeSets[0].fee)}.`;
    if (r.status === 'incomplete' || r.status === 'not-searched') return `${amt}: the search stopped before finishing; narrow the window or the set size.`;
    return `${amt}: no set of the payments adds up to it${opts.feePercent ? ` or to it plus up to ${opts.feePercent}% in fees` : ''}.`;
  });
  return { engine: ENGINE_VERSION, options: { windowBefore: opts.windowBefore, windowAfter: opts.windowAfter, feePercent: opts.feePercent, maxSetSize: opts.maxSetSize }, payments: items.length, answer: says.join(' '), deposits: results };
}

// ---------- CSV working papers ----------

const FORMULA = /^[=+\-@\t\r]/;
const cell = (v, text = false) => {
  let s = String(v ?? '');
  if (text && FORMULA.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvOf = (rows) => rows.map((r) => r.join(',')).join('\r\n') + '\r\n';

export function openCsv(open) {
  return csvOf([
    ['Line', 'Date', 'Age (days)', 'Bucket', 'Type', 'Num', 'Name', 'Memo', 'Amount', 'Flags'],
    ...open.map((l) => [l.line, l.date, l.age, l.bucket, cell(l.type, true), cell(l.num, true), cell(l.name, true), cell(l.memo, true), plain(l.amount), cell(l.flags.join('; '))]),
  ]);
}

export function matchesCsv(matches) {
  const rows = [['Deposit date', 'Deposit amount', 'Deposit reference', 'Status', 'Set', 'Fee', 'Line', 'Date', 'Name', 'Num', 'Amount']];
  for (const m of matches) {
    const sets = m.sets.length ? m.sets.map((s) => ({ ...s, fee: 0 })) : m.feeSets;
    if (!sets.length) rows.push([m.date ?? '', plain(m.amount), cell(m.ref, true), m.status, '', '', '', '', '', '', '']);
    sets.forEach((s, k) => {
      for (const it of s.items) rows.push([m.date ?? '', plain(m.amount), cell(m.ref, true), m.status, k + 1, plain(s.fee ?? 0), it.line, it.date ?? '', cell(it.name, true), cell(it.num, true), plain(Math.abs(it.amount))]);
    });
  }
  return csvOf(rows);
}

// ---------- the aging cut-offs (the month-end calendar) ----------

// For a close date: items dated on or before each cut-off are older than 30, 60, 90 and 365 days.
export function cutoffs(closeDate) {
  return { close: closeDate, over30: addDays(closeDate, -31), over60: addDays(closeDate, -61), over90: addDays(closeDate, -91), over365: addDays(closeDate, -366) };
}
export function monthEnds(fromYm, toYm) {
  const out = [];
  let [y, m] = fromYm.split('-').map(Number);
  const [ty, tm] = toYm.split('-').map(Number);
  while (y < ty || (y === ty && m <= tm)) {
    out.push(iso(y, m, new Date(Date.UTC(y, m, 0)).getUTCDate()));
    m++; if (m > 12) { m = 1; y++; }
  }
  return out;
}

// ---------- the worked example (made up; the page, the examples and the content pages use it) ----------

export const SAMPLE_LEDGER = [
  'Harbor Lane Studio (made-up sample)',
  'Transaction Detail by Account',
  '"January 1, 2025 - October 31, 2026"',
  '',
  ',Date,Transaction Type,Num,Name,Memo/Description,Split,Amount,Balance',
  'Undeposited Funds,,,,,,,,',
  ',03/14/2025,Payment,1041,Birch Cafe,,Accounts Receivable (A/R),"1,200.00","1,200.00"',
  ',06/02/2025,Sales Receipt,1077,Walk-in sale,,Sales,85.00,"1,285.00"',
  ',07/06/2026,Payment,2210,Oak & Co,,Accounts Receivable (A/R),640.00,"1,925.00"',
  ',07/08/2026,Payment,2214,Lumen Dental,,Accounts Receivable (A/R),"1,150.00","3,075.00"',
  ',07/10/2026,Deposit,,,,Business Checking,"-1,790.00","1,285.00"',
  ',08/03/2026,Payment,2251,Birch Cafe,,Accounts Receivable (A/R),300.00,"1,585.00"',
  ',08/04/2026,Deposit,,Birch Cafe,,Business Checking,-300.00,"1,285.00"',
  ',08/20/2026,Payment,2268,Pine Street Gym,,Accounts Receivable (A/R),450.00,"1,735.00"',
  ',09/05/2026,Payment,2280,Oak & Co,,Accounts Receivable (A/R),275.50,"2,010.50"',
  ',09/09/2026,Payment,2283,Lumen Dental,,Accounts Receivable (A/R),412.25,"2,422.75"',
  ',09/12/2026,Payment,2290,Rivera Plumbing,,Accounts Receivable (A/R),687.75,"3,110.50"',
  ',09/18/2026,Payment,2297,Pine Street Gym,,Accounts Receivable (A/R),412.25,"3,522.75"',
  ',10/02/2026,Payment,2305,Birch Cafe,,Accounts Receivable (A/R),960.00,"4,482.75"',
  ',10/06/2026,Payment,2311,Lumen Dental,,Accounts Receivable (A/R),540.00,"5,022.75"',
  ',10/09/2026,Payment,2316,Oak & Co,,Accounts Receivable (A/R),230.00,"5,252.75"',
  ',10/14/2026,Payment,2320,Rivera Plumbing,,Accounts Receivable (A/R),320.00,"5,572.75"',
  ',10/14/2026,Payment,2320,Rivera Plumbing,,Accounts Receivable (A/R),320.00,"5,892.75"',
  ',10/27/2026,Payment,2334,Pine Street Gym,,Accounts Receivable (A/R),"1,050.00","6,942.75"',
  ',10/30/2026,Sales Receipt,2339,Walk-in sale,,Sales,129.99,"7,072.74"',
  'Total for Undeposited Funds,,,,,,,"$7,072.74",',
].join('\r\n') + '\r\n';

export const SAMPLE_BANK = [
  'Date,Description,Amount',
  '09/14/2026,DEPOSIT,963.25',
  '09/15/2026,ACH VENDOR PAYMENT,-220.00',
  '09/22/2026,DEPOSIT,412.25',
  '10/16/2026,DEPOSIT,"1,500.00"',
  '10/29/2026,DEPOSIT,"1,019.25"',
].join('\r\n') + '\r\n';

export const SAMPLE_OPTIONS = { feePercent: 3 };
