// Bank reconciliation difference finder: the engine. Pure and dependency-free, so the page and the server
// run the same file (README: core.js is browser-loadable).
//
// Two files for one bank or card account and one statement period:
//   statement  the bank's lines: a bank CSV (Intuit's 3- or 4-column layout, Xero's CSV import fields,
//              Xero's Uncoded statement lines export, most bank downloads), with a Balance column when
//              the bank gives one
//   ledger     the books' lines for the same account: QuickBooks Online Transaction Detail by Account
//              (or a register), Xero Account Transactions, or any CSV with a date and an amount (or
//              Debit and Credit), with its Beginning, Opening or Closing Balance rows when present
// What it does:
//  1. Reads both files (the CSV reader, date and money parsing are the ones the bank-feed duplicate
//     finder uses, copied so this file stays import-free), plus balance columns and balance rows.
//  2. Matches lines one to one: the same amount within N days (7 by default), or the same check or
//     reference number within 120 days, best score first; then one bank line against two to four
//     books lines (a split deposit) or the reverse, only when exactly one set fits.
//  3. Explains what is left. Error hints first, from arithmetic only: a digit transposition (an actual
//     swap of two adjacent digits, so the gap is a multiple of 9), a slide (an amount ten times
//     another), a sign flip (the same amount the other way, so the balance moves by twice it), a wrong
//     amount on the same reference, and a books line that repeats a matched one (a duplicate). Then
//     timing: books lines on or before the statement date are outstanding payments or deposits in
//     transit, aged; bank lines are items the books do not have yet.
//  4. Works out the reconciliation statement (adjusted bank balance vs adjusted books balance), the
//     difference at the statement date, the difference that is not timing, and the date the running
//     balance broke: the first date something the books are missing or have wrong took effect, or
//     "before the files start" when the opening balances already differ.
//  5. The checker: for one difference, whether a single adjacent-digit swap, a slide or a sign flip can
//     explain it, and which of the given amounts could have produced it.
// It never decides that an item is wrong: every hint names both lines and the arithmetic, to check
// against the statement. Money is whole cents throughout.

export const ENGINE_VERSION = 'recdiff-1';

export const LIMITS = {
  bytes: 2_000_000,   // characters per file
  lines: 20_000,      // transaction lines per file
  window: 60,         // most days apart a one-to-one match may be
  refDays: 120,       // most days apart two lines with the same check or reference number may be
  farDays: 92,        // a leftover same-amount pair this far apart is matched with a date flag
  hintDays: 45,       // most days apart two lines of an error hint may be
  splitPool: 14,      // nearest lines tried for a split match
  splitMax: 4,        // most lines in a split
  shown: 3_000,       // lines listed in a report (all are counted and in the CSV)
};

export const DEFAULTS = { windowDays: 7, staleDays: 90, dateOrder: 'auto', compare: 'auto' };

export class RecError extends Error {
  constructor(message, field = 'statement') { super(message); this.name = 'RecError'; this.field = field; }
}

// ---------- money and dates (as in bank-feed-duplicate-finder/core.js) ----------

// "1,234.56", "$1,234.56", "(45.00)", "-45", "45.00-". A decimal comma is refused rather than guessed.
// Returns whole cents, or null for a blank or unreadable value.
export function parseMoney(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? parseMoney(raw.toFixed(2)) : null;
  let s = String(raw).trim();
  if (!s) return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1).trim(); }
  if (/-$/.test(s)) { neg = !neg; s = s.slice(0, -1).trim(); }
  s = s.replace(/^[A-Z]{3}\s+/i, '').replace(/\s+[A-Z]{3}$/i, '').replace(/\s*(CR|DR)$/i, (m) => { if (/dr/i.test(m)) neg = !neg; return ''; });
  if (/^-/.test(s)) { neg = !neg; s = s.slice(1).trim(); }
  s = s.replace(/^[$£€]/, '').trim();
  if (/^-/.test(s)) { neg = !neg; s = s.slice(1).trim(); }
  if (!/^(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$|^\.\d+$/.test(s)) return null;
  s = s.replace(/,/g, '');
  const [whole, frac = ''] = s.split('.');
  let cents = Number(whole || '0') * 100 + Number((frac + '00').slice(0, 2));
  if (frac.length > 2 && Number(frac[2]) >= 5) cents += 1;
  if (!Number.isSafeInteger(cents)) return null;
  return neg ? -cents : cents;
}

export function money(cents) {
  const a = Math.abs(cents);
  return `${cents < 0 ? '-' : ''}$${Math.floor(a / 100).toLocaleString('en-US')}.${String(a % 100).padStart(2, '0')}`;
}
export const plain = (cents) => `${cents < 0 ? '-' : ''}${Math.floor(Math.abs(cents) / 100)}.${String(Math.abs(cents) % 100).padStart(2, '0')}`;

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const monthOf = (word) => {
  const w = word.toLowerCase().replace(/\.$/, '');
  if (w.length < 3) return 0;
  return MONTHS.findIndex((m) => m.startsWith(w) || (w === 'sept' && m === 'september')) + 1;
};
const iso = (y, m, d) => `${String(y).padStart(4, '0')}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const valid = (y, m, d) => y >= 1900 && y <= 2200 && m >= 1 && m <= 12 && d >= 1 && d <= new Date(Date.UTC(y, m, 0)).getUTCDate();
const year4 = (y) => (y.length === 2 ? 2000 + Number(y) : Number(y));

function slashParts(s) {
  const m = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})$/.exec(s);
  return m ? [Number(m[1]), Number(m[2]), year4(m[3])] : null;
}

// One date as YYYY-MM-DD, or null. order is 'mdy' or 'dmy' for slash dates.
export function parseDate(raw, order = 'mdy') {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().replace(/\s+/g, ' ');
  if (!s) return null;
  let m = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T ].*)?$/.exec(s);
  if (m) return valid(+m[1], +m[2], +m[3]) ? iso(+m[1], +m[2], +m[3]) : null;
  const p = slashParts(s.replace(/ .*$/, ''));
  if (p) {
    const [a, b, y] = p;
    const [mo, d] = order === 'dmy' ? [b, a] : [a, b];
    return valid(y, mo, d) ? iso(y, mo, d) : null;
  }
  m = /^(\d{1,2})[ /-]([A-Za-z]{3,9}\.?)[ ,/-]*(\d{4}|\d{2})$/.exec(s);
  if (m) { const mo = monthOf(m[2]); const y = year4(m[3]); return mo && valid(y, mo, +m[1]) ? iso(y, mo, +m[1]) : null; }
  m = /^([A-Za-z]{3,9}\.?) (\d{1,2}),? (\d{4})$/.exec(s);
  if (m) { const mo = monthOf(m[1]); return mo && valid(+m[3], mo, +m[2]) ? iso(+m[3], mo, +m[2]) : null; }
  return null;
}

// A column's slash-date order from its values: a first number over 12 proves DD/MM, a second over 12
// proves MM/DD; neither uses the choice (MM/DD by default, as US exports write them).
export function dateOrderOf(values, choice = 'auto', field = 'statement') {
  if (choice === 'mdy' || choice === 'dmy') return { order: choice, proof: 'chosen' };
  let dmy = null; let mdy = null;
  for (const v of values) {
    const p = slashParts(String(v ?? '').trim().replace(/ .*$/, ''));
    if (!p) continue;
    if (p[0] > 12 && p[1] <= 12) dmy ??= v;
    if (p[1] > 12 && p[0] <= 12) mdy ??= v;
  }
  if (dmy && mdy) throw new RecError(`The dates mix two orders: ${String(dmy).trim()} can only be day first and ${String(mdy).trim()} only month first. Fix the file or choose the order.`, field);
  if (dmy) return { order: 'dmy', proof: String(dmy).trim() };
  if (mdy) return { order: 'mdy', proof: String(mdy).trim() };
  return { order: 'mdy', proof: null };
}

export const dayNumber = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 86_400_000;
export const fromDayNumber = (n) => new Date(n * 86_400_000).toISOString().slice(0, 10);
export const addDays = (d, n) => fromDayNumber(dayNumber(d) + n);
const gapOf = (a, b) => Math.abs(dayNumber(a) - dayNumber(b));
const WORD_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (d) => `${WORD_MONTHS[+d.slice(5, 7) - 1]} ${+d.slice(8, 10)}, ${d.slice(0, 4)}`;
const WEEKDAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];
export const weekday = (d) => WEEKDAYS[((dayNumber(d) % 7) + 7) % 7];
export const isDay = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && valid(+s.slice(0, 4), +s.slice(5, 7), +s.slice(8, 10));

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
  return rows.map((r) => r.map((v) => v.trim()));
}

// ---------- layouts ----------

const norm = (s) => String(s ?? '').toLowerCase().replace(/[*\s]+/g, ' ').replace(/\s*\((usd|gbp|eur|cad|aud|nzd)\)$/, '').trim();
export const HEADER_NAMES = {
  date: ['date', 'transaction date', 'txn date', 'posting date', 'posted date', 'trans date', 'trans. date', 'value date'],
  type: ['transaction type', 'type', 'txn type', 'source'],
  status: ['status', 'reconciled', 'reconcile status', 'clr', 'cleared', 'reconciliation status'],
  ref: ['num', 'no.', 'no', 'number', 'reference', 'ref', 'ref no.', 'ref no', 'ref #', 'check no.', 'check number', 'check no', 'cheque number', 'doc number', 'transaction id'],
  name: ['name', 'payee', 'contact', 'customer', 'vendor', 'customer/vendor', 'received from', 'payee/payer'],
  memo: ['memo/description', 'memo', 'description', 'details', 'narration', 'transaction description', 'particulars', 'bank detail', 'bank description'],
  account: ['account', 'account name', 'distribution account', 'account full name'],
  amount: ['amount', 'net amount', 'transaction amount', 'net'],
  debit: ['debit', 'debits', 'dr', 'withdrawal', 'withdrawals', 'money out', 'paid out', 'spent', 'payment', 'payments'],
  credit: ['credit', 'credits', 'cr', 'deposit', 'deposits', 'money in', 'paid in', 'received'],
  balance: ['balance', 'running balance', 'running bal.', 'ledger balance'],
};

function mapHeader(cells) {
  const map = {};
  cells.forEach((c, i) => {
    const n = norm(c);
    for (const [key, list] of Object.entries(HEADER_NAMES)) if (map[key] === undefined && list.includes(n)) map[key] = i;
  });
  return map;
}

function findHeader(rows) {
  for (let i = 0; i < Math.min(rows.length, 40); i++) {
    const map = mapHeader(rows[i]);
    if (map.date !== undefined && (map.amount !== undefined || map.debit !== undefined || map.credit !== undefined)) return { index: i, map };
  }
  return null;
}

function layoutOf(map, cells, side) {
  const names = cells.map(norm);
  if (names.includes('related account') || names.includes('running balance')) return { id: 'xero-account-transactions', platform: 'xero', name: 'Xero Account Transactions report' };
  if (names.includes('split') || (names.includes('transaction type') && names.includes('memo/description'))) return { id: 'qbo-report', platform: 'qbo', name: 'QuickBooks Online account report (Transaction Detail by Account or a register)' };
  if (names.includes('particulars') || (names.includes('payee') && names.includes('reference') && map.amount !== undefined)) return { id: 'xero-statement', platform: 'xero', name: 'statement lines in Xero\'s CSV layout (Date, Amount, Payee, Description, Reference)' };
  if (names.length >= 3 && names[0] === 'date' && names[1] === 'description' && (names[2] === 'amount' || (names[2] === 'credit' && names[3] === 'debit'))) {
    return { id: 'bank-csv', platform: null, name: `bank CSV in Intuit's ${names[2] === 'amount' ? '3' : '4'}-column upload layout${map.balance !== undefined ? ' with a Balance column' : ''}` };
  }
  return { id: 'generic', platform: null, name: side === 'statement' ? `bank CSV with a date and an amount${map.balance !== undefined ? ' and a balance' : ''}` : `ledger CSV with a date and an amount${map.balance !== undefined ? ' and a balance' : ''}` };
}

const TOTAL_RE = /^total\b/i;
const OPENING_RE = /^(beginning|opening|starting|start|brought forward|balance brought forward|b\/f)( balance)?$/i;
const CLOSING_RE = /^(ending|closing|end|carried forward|balance carried forward|c\/f)( balance)?$/i;
const isOpening = (v) => OPENING_RE.test(v) && /balance|b\/f|forward/i.test(v);
const isClosing = (v) => CLOSING_RE.test(v) && /balance|c\/f|forward/i.test(v);

function statusOf(raw) {
  const s = norm(raw);
  if (!s) return '';
  if (s === 'r' || s.startsWith('reconciled') || s === 'yes' || s === 'y' || s === 'true') return 'reconciled';
  if (s === 'c' || s.startsWith('cleared')) return 'cleared';
  if (s.startsWith('deleted')) return 'deleted';
  if (s.startsWith('unreconciled') || s === 'no' || s === 'n' || s === 'false') return 'unreconciled';
  return '';
}

// The opening and closing balances a balance column proves, in file order or newest first. Returns null
// when fewer than 80% of the rows chain (balance = previous balance + amount).
function balanceChain(lines) {
  const withBal = lines.filter((l) => l.balance !== null);
  if (withBal.length < 2 || withBal.length < lines.length) return null;
  let up = 0; let down = 0;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].balance === lines[i - 1].balance + lines[i].amount) up++;
    if (lines[i - 1].balance === lines[i].balance + lines[i - 1].amount) down++;
  }
  const n = lines.length - 1;
  if (Math.max(up, down) < Math.ceil(n * 0.8)) return null;
  const breaks = [];
  if (up >= down) {
    for (let i = 1; i < lines.length; i++) if (lines[i].balance !== lines[i - 1].balance + lines[i].amount) breaks.push({ line: lines[i].line, date: lines[i].date, gap: lines[i].balance - lines[i - 1].balance - lines[i].amount });
    return { order: 'oldest first', opening: lines[0].balance - lines[0].amount, closing: lines[lines.length - 1].balance, breaks };
  }
  for (let i = 1; i < lines.length; i++) if (lines[i - 1].balance !== lines[i].balance + lines[i - 1].amount) breaks.push({ line: lines[i - 1].line, date: lines[i - 1].date, gap: lines[i - 1].balance - lines[i].balance - lines[i - 1].amount });
  const last = lines[lines.length - 1];
  return { order: 'newest first', opening: last.balance - last.amount, closing: lines[0].balance, breaks };
}

// Reads one file. side is 'statement' (the bank's lines: Credit is money in) or 'ledger' (the books'
// account report: Debit is money into a bank account). A ledger file that holds several accounts keeps
// the one named by `account`, else the one with most lines.
export function readFile(text, side, { dateOrder = 'auto', account = null } = {}) {
  const label = side === 'statement' ? 'The statement file' : 'The ledger file';
  if (typeof text !== 'string' || !text.trim()) throw new RecError(`${label} is empty.`, side);
  if (text.length > LIMITS.bytes) throw new RecError(`${label} is over ${LIMITS.bytes.toLocaleString('en-US')} characters; export a shorter date range.`, side);
  const rows = parseCsv(text);
  const head = findHeader(rows);
  if (!head) throw new RecError(`${label} has no header row with a Date column and an Amount (or Debit and Credit) column in its first 40 rows.`, side);
  const { map, index } = head;
  const layout = layoutOf(map, rows[index], side);
  const body = rows.slice(index + 1);
  const { order, proof } = dateOrderOf(body.map((r) => r[map.date]), dateOrder, side);
  const moneyIn = side === 'statement' ? 'credit' : 'debit';
  const moneyOut = side === 'statement' ? 'debit' : 'credit';
  const amountOf = (r) => {
    if (map.amount !== undefined) {
      const a = parseMoney(r[map.amount]);
      if (a !== null) return a;
    }
    const inn = map[moneyIn] !== undefined ? parseMoney(r[map[moneyIn]]) : null;
    const out = map[moneyOut] !== undefined ? parseMoney(r[map[moneyOut]]) : null;
    if (inn === null && out === null) return null;
    return Math.abs(inn ?? 0) - Math.abs(out ?? 0);
  };
  const cellOf = (r, key) => (map[key] !== undefined ? r[map[key]] ?? '' : '');
  // A balance row's value: its balance cell, else its amount, else the last money cell in the row.
  const balanceRowValue = (r) => {
    if (map.balance !== undefined && parseMoney(r[map.balance]) !== null) return parseMoney(r[map.balance]);
    const a = amountOf(r);
    if (a !== null) return a;
    const nums = r.map(parseMoney).filter((x) => x !== null);
    return nums.length ? nums[nums.length - 1] : null;
  };
  const groups = new Map();
  const group = (name) => { if (!groups.has(name)) groups.set(name, { lines: [], opening: null, closing: null }); return groups.get(name); };
  let section = null;
  let skipped = 0; let deleted = 0; let zero = 0;
  body.forEach((r, k) => {
    const lineNo = index + 2 + k;
    if (!r.some((v) => v !== '')) return;
    const texts = r.filter((v) => v !== '');
    const first = texts[0] ?? '';
    const g = () => group(cellOf(r, 'account') || section || '');
    if (texts.some(isOpening)) { const v = balanceRowValue(r); if (v !== null) g().opening = v; return; }
    if (texts.some(isClosing)) { const v = balanceRowValue(r); if (v !== null) g().closing = v; return; }
    const date = parseDate(r[map.date], order);
    if (!date) {
      if (TOTAL_RE.test(first)) return;
      if (texts.length === 1 && parseMoney(first) === null && !parseDate(first, order)) { section = first; return; }
      if (r[map.date]) skipped++;
      return;
    }
    const amount = amountOf(r);
    if (amount === null) { skipped++; return; }
    const status = statusOf(cellOf(r, 'status'));
    if (status === 'deleted') { deleted++; return; }
    if (amount === 0) { zero++; return; }
    g().lines.push({
      side, line: lineNo, date, amount, name: cellOf(r, 'name'), memo: cellOf(r, 'memo'), ref: cellOf(r, 'ref'), type: cellOf(r, 'type'), status,
      balance: map.balance !== undefined ? parseMoney(r[map.balance]) : null,
    });
  });
  const accounts = [...groups.entries()].filter(([, gr]) => gr.lines.length).map(([name, gr]) => ({ name, ...gr }));
  if (!accounts.length) throw new RecError(`${label} has no lines with a date and an amount under its header row.`, side);
  let chosen;
  if (accounts.length === 1) chosen = accounts[0];
  else if (account) {
    const want = account.toLowerCase();
    chosen = accounts.find((a) => a.name.toLowerCase() === want) ?? accounts.find((a) => a.name.toLowerCase().includes(want));
    if (!chosen) throw new RecError(`No account named like "${account}" in ${label.toLowerCase()}. It holds: ${accounts.map((a) => a.name || '(no name)').join(', ')}.`, 'account');
  } else {
    chosen = [...accounts].sort((a, b) => b.lines.length - a.lines.length || a.name.localeCompare(b.name))[0];
  }
  if (chosen.lines.length > LIMITS.lines) throw new RecError(`${label} has ${chosen.lines.length.toLocaleString('en-US')} lines; the most is ${LIMITS.lines.toLocaleString('en-US')}. Export a shorter date range.`, side);
  const chain = balanceChain(chosen.lines);
  return {
    side, layout, header: rows[index], order, orderProof: proof, account: chosen.name, accounts: accounts.map((a) => ({ name: a.name, lines: a.lines.length })),
    lines: chosen.lines, openingRow: chosen.opening, closingRow: chosen.closing, chain, skipped, deleted, zero,
  };
}

// ---------- matching ----------

const STOP = new Set(['inc', 'llc', 'ltd', 'co', 'corp', 'the', 'and', 'of', 'pos', 'ach', 'debit', 'credit', 'card', 'purchase', 'payment', 'pmt', 'dep', 'deposit',
  'online', 'transfer', 'xfer', 'web', 'id', 'ppd', 'ccd', 'des', 'checkcard', 'visa', 'mc', 'expense', 'check', 'bill', 'sale', 'sales', 'receipt', 'us', 'usa']);
export const words = (s) => [...new Set(String(s ?? '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 2 && !STOP.has(w) && !/^\d{1,3}$/.test(w)))];
export function similarity(a, b) {
  const A = words(a); const B = words(b);
  if (!A.length || !B.length) return 0;
  const set = new Set(B);
  const shared = A.filter((w) => set.has(w)).length;
  return Math.round((shared / Math.min(A.length, B.length)) * 100) / 100;
}
const textOf = (l) => [l.name, l.memo].filter(Boolean).join(' ');
// A check or reference number, compared without punctuation or leading zeros; "CHECK 1052" in a bank
// description counts as 1052.
export function refOf(l) {
  const r = String(l.ref ?? '').toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^0+/, '');
  if (r) return r;
  const m = /\b(?:check|chk|cheque|ck)\s*#?\s*0*(\d{3,})\b/i.exec(textOf(l));
  return m ? m[1] : '';
}

function scoreOf(b, l, windowDays) {
  const gap = gapOf(b.date, l.date);
  const sameRef = refOf(b) && refOf(b) === refOf(l);
  if (gap > windowDays && !(sameRef && gap <= LIMITS.refDays)) return null;
  const sim = similarity(textOf(b), textOf(l));
  return { gap, score: (sameRef ? 4 : 0) + (gap === 0 ? 3 : gap <= 2 ? 2 : gap <= windowDays ? 1 : 0) + (sim >= 0.5 ? 2 : sim > 0 ? 1 : 0), sameRef: Boolean(sameRef) };
}

// One-to-one matches on the same amount, best score first; a line is used once.
function matchOneToOne(bank, books, windowDays, far = false) {
  const byAmount = new Map();
  for (const l of books) if (!l.used) { if (!byAmount.has(l.amount)) byAmount.set(l.amount, []); byAmount.get(l.amount).push(l); }
  const cands = [];
  for (const b of bank) {
    if (b.used) continue;
    for (const l of byAmount.get(b.amount) ?? []) {
      if (far) {
        const gap = gapOf(b.date, l.date);
        if (gap <= LIMITS.farDays) cands.push({ b, l, gap, score: 0, sameRef: false });
        continue;
      }
      const s = scoreOf(b, l, windowDays);
      if (s) cands.push({ b, l, ...s });
    }
  }
  cands.sort((x, y) => y.score - x.score || x.gap - y.gap || x.b.line - y.b.line || x.l.line - y.l.line);
  const byB = new Map(); const byL = new Map();
  for (const c of cands) {
    if (!byB.has(c.b)) byB.set(c.b, []); byB.get(c.b).push(c);
    if (!byL.has(c.l)) byL.set(c.l, []); byL.get(c.l).push(c);
  }
  const out = [];
  for (const c of cands) {
    if (c.b.used || c.l.used) continue;
    c.b.used = true; c.l.used = true;
    const tie = (o) => o !== c && o.score === c.score && o.gap === c.gap;
    const rivals = byB.get(c.b).some((o) => tie(o) && !o.l.used) || byL.get(c.l).some((o) => tie(o) && !o.b.used);
    out.push({ kind: far ? 'far' : 'one', bank: [c.b], books: [c.l], gap: c.gap, sameRef: c.sameRef, ambiguous: rivals });
  }
  return out;
}

// Every set of 2 to `max` lines from pool whose amounts sum to target. Stops at `limit` sets.
function subsets(pool, target, max, limit = 3) {
  const found = [];
  const pick = [];
  const walk = (start, sum) => {
    if (found.length >= limit) return;
    if (pick.length >= 2 && sum === target) found.push([...pick]);
    if (pick.length === max) return;
    for (let i = start; i < pool.length; i++) { pick.push(pool[i]); walk(i + 1, sum + pool[i].amount); pick.pop(); if (found.length >= limit) return; }
  };
  walk(0, 0);
  return found.filter((s) => s.reduce((a, l) => a + l.amount, 0) === target);
}

// One line on one side against two or more on the other, within the window, when exactly one set fits.
function matchSplits(one, many, windowDays, max, oneSide) {
  const out = []; const several = [];
  if (one.filter((x) => !x.used).length > 3000) return { out, several };
  for (const x of one) {
    if (x.used) continue;
    const pool = many.filter((y) => !y.used && Math.sign(y.amount) === Math.sign(x.amount) && Math.abs(y.amount) < Math.abs(x.amount) && gapOf(x.date, y.date) <= windowDays)
      .sort((a, b) => gapOf(x.date, a.date) - gapOf(x.date, b.date) || a.line - b.line).slice(0, LIMITS.splitPool)
      .sort((a, b) => a.line - b.line);
    if (pool.length < 2) continue;
    const sets = subsets(pool, x.amount, max);
    if (sets.length === 1) {
      x.used = true; for (const y of sets[0]) y.used = true;
      out.push(oneSide === 'bank' ? { kind: 'split', bank: [x], books: sets[0] } : { kind: 'split', bank: sets[0], books: [x] });
    } else if (sets.length > 1) several.push({ line: x, sets });
  }
  return { out, several };
}

// ---------- the checker ----------

// A digit's place by its power of ten in cents: 0 is the 1-cent digit, 2 the $1 digit, 4 the $100 digit.
export const placeName = (k) => (k === 0 ? '1-cent' : k === 1 ? '10-cent' : `$${(10 ** (k - 2)).toLocaleString('en-US')}`);

// The one adjacent swap of a's digits (in cents) that changes it by exactly diff, or null.
export function swapOf(a, diff) {
  const s = String(Math.abs(a));
  for (let i = 0; i < s.length - 1; i++) {
    if (s[i] === s[i + 1]) continue;
    const t = s.slice(0, i) + s[i + 1] + s[i] + s.slice(i + 2);
    if (t[0] === '0' && t.length > 1) continue;
    if (Math.abs(Number(t) - Math.abs(a)) === Math.abs(diff)) return { swapped: Math.sign(a || 1) * Number(t), position: s.length - 2 - i };
  }
  return null;
}
// Two amounts that are one adjacent-digit swap of each other (same number of digits).
export function isSwap(a, b) {
  if (a === b || Math.sign(a) !== Math.sign(b)) return null;
  const s = swapOf(a, Math.abs(a - b));
  return s && s.swapped === b ? s : null;
}

// What one difference (in cents, either sign) can say: divisible by 9, the quotient, which single adjacent
// swap would give it, and which of the amounts (cents) could have produced it as a swap, a slide (ten
// times), a sign flip (half the difference) or a whole missing line (the difference itself).
export function check(diff, amounts = []) {
  if (!Number.isSafeInteger(diff)) throw new RecError('The difference must be a whole number of cents.', 'difference');
  const d = Math.abs(diff);
  const div9 = d > 0 && d % 9 === 0;
  const q = div9 ? d / 9 : null;
  let swap = null;
  if (div9) {
    const qs = String(q);
    const lead = Number(qs[0]);
    if (/^[1-9]0*$/.test(qs)) {
      const k = qs.length - 1;
      swap = { gap: lead, position: k, places: [placeName(k + 1), placeName(k)], text: `two adjacent digits ${lead} apart in the ${placeName(k + 1)} and ${placeName(k)} places` };
    }
  }
  const uniq = [...new Set(amounts.filter((a) => Number.isSafeInteger(a) && a !== 0))].sort((x, y) => Math.abs(x) - Math.abs(y) || x - y);
  const swaps = []; const slides = []; const halves = []; const equals = [];
  for (const a of uniq) {
    const s = d > 0 ? swapOf(a, d) : null;
    if (s) swaps.push({ amount: a, other: s.swapped, position: s.position });
    if (d > 0 && Math.abs(a) * 9 === d) slides.push({ amount: a, other: Math.sign(a) * Math.abs(a) * 10, way: 'entered ten times too large, or this is the tenfold entry' });
    if (d > 0 && Math.abs(a) % 10 === 0 && (Math.abs(a) / 10) * 9 === d) slides.push({ amount: a, other: Math.sign(a) * Math.abs(a) / 10, way: 'entered ten times too small, or this is the tenth' });
    if (d > 0 && Math.abs(a) * 2 === d) halves.push({ amount: a });
    if (d > 0 && Math.abs(a) === d) equals.push({ amount: a });
  }
  const parts = [];
  if (d === 0) parts.push('No difference: nothing to check.');
  else {
    parts.push(div9 ? `${money(d)} is divisible by 9 (${money(d)} / 9 = ${money(q)}), so a transposition is possible${swap ? `: ${swap.text}` : ', but not one swap of two adjacent digits (the quotient is not one digit followed by zeros)'}.`
      : `${money(d)} is not divisible by 9, so it is not a transposition of two digits.`);
    if (swaps.length) parts.push(`Amounts that become it with one swap: ${swaps.slice(0, 5).map((x) => `${money(x.amount)} (vs ${money(x.other)})`).join(', ')}.`);
    if (halves.length) parts.push(`Half the difference is ${money(d / 2)}: ${halves.length === 1 ? 'an amount' : `${halves.length} amounts`} of that size entered the wrong way round would do it.`);
    if (slides.length) parts.push(`A slide (a missing or extra zero) fits ${slides.slice(0, 3).map((x) => money(x.amount)).join(', ')}.`);
    if (equals.length) parts.push(`${equals.length === 1 ? 'One amount equals' : `${equals.length} amounts equal`} the difference: a line missing on one side.`);
  }
  return { difference: d, divisibleBy9: div9, divisibleBy3: d > 0 && d % 3 === 0, quotient: q, swap, candidates: { swaps, slides, halves, equals }, answer: parts.join(' ') };
}

// ---------- analysis ----------

const sum = (ls) => ls.reduce((a, l) => a + l.amount, 0);
const flipLines = (ls) => ls.map((l) => ({ ...l, amount: -l.amount, balance: l.balance === null ? null : -l.balance }));
function overlap(a, b) {
  const m = new Map();
  for (const x of a) m.set(x, (m.get(x) ?? 0) + 1);
  let n = 0;
  for (const y of b) { const k = m.get(y) ?? 0; if (k) { n++; m.set(y, k - 1); } }
  return n;
}

const optMoney = (v, field) => {
  if (v === undefined || v === null || v === '') return null;
  const c = typeof v === 'number' ? parseMoney(v.toFixed(2)) : parseMoney(v);
  if (c === null) throw new RecError(`${field} is not an amount; write it like 12,345.67 or -45.00.`, field);
  return c;
};

export const HINT_WORDS = {
  transposition: 'digit transposition',
  slide: 'slide (a missing or extra zero)',
  'sign-flip': 'sign flip (entered the wrong way round)',
  'wrong-amount': 'wrong amount on the same reference',
  duplicate: 'entered twice in the books',
  'bank-duplicate': 'twice in the statement',
};
export const KIND_WORDS = {
  'deposit-in-transit': 'deposit in transit',
  'outstanding-payment': 'outstanding payment',
  'outstanding-check': 'outstanding check',
  'bank-only': 'in the bank, not in the books',
  'after-period': 'in the books after the statement date',
};

// The whole comparison. input: { statement, ledger } as CSV text. options: windowDays, staleDays,
// statementOpening, statementClosing, ledgerOpening (amounts), periodEnd (YYYY-MM-DD), compare
// ('auto' | 'same' | 'flipped'), account, dateOrder.
export function analyze({ statement = null, ledger = null }, options = {}) {
  const windowDays = options.windowDays ?? DEFAULTS.windowDays;
  const staleDays = options.staleDays ?? DEFAULTS.staleDays;
  if (!Number.isInteger(windowDays) || windowDays < 0 || windowDays > LIMITS.window) throw new RecError(`windowDays is a whole number from 0 to ${LIMITS.window}.`, 'windowDays');
  if (!Number.isInteger(staleDays) || staleDays < 1 || staleDays > 3660) throw new RecError('staleDays is a whole number from 1 to 3,660.', 'staleDays');
  if (!statement || !statement.trim()) throw new RecError('Add the bank statement file.', 'statement');
  if (!ledger || !ledger.trim()) throw new RecError('Add the ledger file for the same account.', 'ledger');
  const sf = readFile(statement, 'statement', { dateOrder: options.dateOrder ?? 'auto' });
  const lf = readFile(ledger, 'ledger', { dateOrder: options.dateOrder ?? 'auto', account: options.account ?? null });
  const warnings = [];

  // Signs: a card account is often exported with opposite signs on the two sides.
  const compare = options.compare ?? 'auto';
  const same = overlap(sf.lines.map((l) => l.amount), lf.lines.map((l) => l.amount));
  const flipped = overlap(sf.lines.map((l) => l.amount), lf.lines.map((l) => -l.amount));
  const flip = compare === 'flipped' || (compare === 'auto' && flipped > same);
  if (flip && compare === 'auto') warnings.push(`The ledger's signs are the opposite of the statement's (${flipped} amounts agree that way, ${same} as written), as a card account often is; its amounts and balances were flipped to compare.`);
  const bankLines = sf.lines.map((l, i) => ({ ...l, id: `S${i}` }));
  const bookLines = (flip ? flipLines(lf.lines) : lf.lines).map((l, i) => ({ ...l, id: `L${i}` }));
  const bookOpeningRow = lf.openingRow === null ? null : flip ? -lf.openingRow : lf.openingRow;
  const bookClosingRow = lf.closingRow === null ? null : flip ? -lf.closingRow : lf.closingRow;
  const bookChain = lf.chain ? (flip ? { ...lf.chain, opening: -lf.chain.opening, closing: -lf.chain.closing } : lf.chain) : null;

  // The period: from the first date in either file to the statement date.
  const allDates = [...bankLines, ...bookLines].map((l) => l.date).sort();
  const bankDates = bankLines.map((l) => l.date).sort();
  // The statement date: entered, else the last statement line, moved to the month's last day when the
  // statement starts in a month's first 3 days and ends in its last 5 (a calendar-month statement).
  const lastBank = bankDates[bankDates.length - 1];
  const monthEnd = (d) => fromDayNumber(Date.UTC(+d.slice(0, 4), +d.slice(5, 7), 0) / 86_400_000);
  const calendarMonth = +bankDates[0].slice(8, 10) <= 3 && dayNumber(monthEnd(lastBank)) - dayNumber(lastBank) <= 4;
  const periodEnd = options.periodEnd ?? (calendarMonth ? monthEnd(lastBank) : lastBank);
  if (!isDay(periodEnd)) throw new RecError('periodEnd is a date written like 2026-10-31.', 'periodEnd');
  const periodStart = allDates[0];
  if (periodEnd < periodStart) throw new RecError(`periodEnd ${periodEnd} is before every line in the files.`, 'periodEnd');
  const lateBank = bankLines.filter((l) => l.date > periodEnd);
  if (lateBank.length) warnings.push(`${lateBank.length} statement ${lateBank.length === 1 ? 'line is' : 'lines are'} after the statement date ${longDate(periodEnd)} and ${lateBank.length === 1 ? 'is' : 'are'} left out.`);
  const bank = bankLines.filter((l) => l.date <= periodEnd);
  const books = bookLines;

  // Balances. The bank's: entered, a balance row, the balance column, in that order.
  const bankSumAll = sum(bank);
  let bankOpening = optMoney(options.statementOpening, 'statementOpening');
  let bankClosing = optMoney(options.statementClosing, 'statementClosing');
  const bankFrom = { opening: bankOpening !== null ? 'entered' : null, closing: bankClosing !== null ? 'entered' : null };
  if (bankOpening === null && sf.openingRow !== null) { bankOpening = sf.openingRow; bankFrom.opening = 'the statement\'s opening balance row'; }
  if (bankClosing === null && sf.closingRow !== null && !lateBank.length) { bankClosing = sf.closingRow; bankFrom.closing = 'the statement\'s closing balance row'; }
  if (sf.chain && !lateBank.length) {
    if (bankOpening === null) { bankOpening = sf.chain.opening; bankFrom.opening = 'the statement\'s Balance column'; }
    if (bankClosing === null) { bankClosing = sf.chain.closing; bankFrom.closing = 'the statement\'s Balance column'; }
  }
  if (bankOpening === null && bankClosing !== null) { bankOpening = bankClosing - bankSumAll; bankFrom.opening = 'the closing balance less the lines'; }
  if (bankClosing === null && bankOpening !== null) { bankClosing = bankOpening + bankSumAll; bankFrom.closing = 'the opening balance plus the lines'; }
  if (bankOpening !== null && bankClosing !== null && bankClosing - bankOpening !== bankSumAll) {
    warnings.push(`The statement's lines add up to ${money(bankSumAll)}, but its balances move by ${money(bankClosing - bankOpening)} (${money(bankOpening)} to ${money(bankClosing)}): ${money(bankClosing - bankOpening - bankSumAll)} of lines are missing from the statement file, or a balance is mistyped.`);
  }
  for (const b of (sf.chain?.breaks ?? []).slice(0, 5)) warnings.push(`The statement's Balance column jumps by ${money(b.gap)} at line ${b.line} (${longDate(b.date)}): a line may be missing from the export there.`);

  // The books': entered opening, an opening row, the running balance column.
  const booksInPeriod = books.filter((l) => l.date <= periodEnd);
  const booksAfter = books.filter((l) => l.date > periodEnd);
  // An entered ledger opening is in the ledger's own signs, like its lines.
  let booksOpening = optMoney(options.ledgerOpening, 'ledgerOpening');
  if (booksOpening !== null && flip) booksOpening = -booksOpening;
  let booksOpeningFrom = booksOpening !== null ? 'entered' : null;
  if (booksOpening === null && bookOpeningRow !== null) { booksOpening = bookOpeningRow; booksOpeningFrom = 'the ledger\'s opening balance row'; }
  if (booksOpening === null && bookChain) { booksOpening = bookChain.opening; booksOpeningFrom = 'the ledger\'s balance column'; }
  if (booksOpening === null && bookClosingRow !== null) { booksOpening = bookClosingRow - sum(books); booksOpeningFrom = 'the ledger\'s closing balance less its lines'; }
  for (const b of (bookChain?.breaks ?? []).slice(0, 5)) warnings.push(`The ledger's balance column jumps by ${money(b.gap)} at line ${b.line} (${longDate(b.date)}): a line may be missing from the export there.`);
  const balancesKnown = bankOpening !== null && booksOpening !== null;
  if (!balancesKnown) warnings.push('No opening balance for ' + [bankOpening === null ? 'the statement' : null, booksOpening === null ? 'the ledger' : null].filter(Boolean).join(' or ') + ': the comparison assumes the two agreed before the first line. Enter the balances to check that too.');
  const openingDiff = balancesKnown ? bankOpening - booksOpening : 0;
  const booksAtEnd = booksOpening !== null ? booksOpening + sum(booksInPeriod) : null;

  // 1. Matching.
  const matches = [];
  matches.push(...matchOneToOne(bank, books, windowDays));
  const s1 = matchSplits(bank, books, windowDays, LIMITS.splitMax, 'bank');
  const s2 = matchSplits(books, bank, windowDays, 3, 'books');
  matches.push(...s1.out, ...s2.out);
  matches.push(...matchOneToOne(bank, books, windowDays, true));
  const several = [...s1.several, ...s2.several];

  // 2. Error hints on what is left: pairs first, nearest dates first.
  const leftBank = bank.filter((l) => !l.used);
  const leftBooks = books.filter((l) => !l.used);
  const hintCands = [];
  const reach = Math.max(windowDays, LIMITS.hintDays);
  const byDay = [...leftBooks].sort((x, y) => dayNumber(x.date) - dayNumber(y.date));
  const days = byDay.map((l) => dayNumber(l.date));
  const firstAt = (n) => { let lo = 0; let hi = days.length; while (lo < hi) { const mid = (lo + hi) >> 1; if (days[mid] < n) lo = mid + 1; else hi = mid; } return lo; };
  for (const b of leftBank) {
    const bd = dayNumber(b.date);
    for (let i = firstAt(bd - reach); i < byDay.length && days[i] <= bd + reach; i++) {
      const l = byDay[i];
      const gap = gapOf(b.date, l.date);
      const sameRef = refOf(b) && refOf(b) === refOf(l);
      let kind = null; let detail = null;
      const sw = isSwap(b.amount, l.amount);
      if (sw) { kind = 'transposition'; detail = sw; }
      else if (b.amount === -l.amount) kind = 'sign-flip';
      else if (Math.sign(b.amount) === Math.sign(l.amount) && (b.amount === l.amount * 10 || l.amount === b.amount * 10)) kind = 'slide';
      else if (sameRef && gap <= LIMITS.refDays && Math.sign(b.amount) === Math.sign(l.amount)) kind = 'wrong-amount';
      if (!kind) continue;
      const rank = { transposition: 0, 'sign-flip': 1, slide: 2, 'wrong-amount': 3 }[kind];
      hintCands.push({ kind, b, l, gap, rank, detail, sim: similarity(textOf(b), textOf(l)) });
    }
  }
  hintCands.sort((x, y) => x.rank - y.rank || (y.sim >= 0.5) - (x.sim >= 0.5) || x.gap - y.gap || x.b.line - y.b.line || x.l.line - y.l.line);
  const hints = [];
  for (const c of hintCands) {
    if (c.b.used || c.l.used) continue;
    c.b.used = true; c.l.used = true;
    const effect = c.b.amount - c.l.amount;
    const what = (x) => `${money(Math.abs(x.amount))} ${x.amount < 0 ? 'payment' : 'deposit'}`;
    const words = {
      transposition: `the ${what(c.l)} in the books (${longDate(c.l.date)}) is ${money(Math.abs(c.b.amount))} at the bank: the same digits with two neighbours swapped, a gap of ${money(Math.abs(effect))} (9 x ${money(Math.abs(effect) / 9)})`,
      'sign-flip': `the ${money(Math.abs(c.l.amount))} in the books (${longDate(c.l.date)}) is a ${c.l.amount < 0 ? 'payment' : 'deposit'} there and a ${c.b.amount < 0 ? 'payment' : 'deposit'} at the bank: entered the wrong way round, it moves the balance by ${money(Math.abs(effect))}, twice the amount`,
      slide: `the ${what(c.l)} in the books (${longDate(c.l.date)}) is ${money(Math.abs(c.b.amount))} at the bank: ten times apart, a missing or extra zero`,
      'wrong-amount': `reference ${c.b.ref || refOf(c.b)} is ${money(Math.abs(c.l.amount))} in the books and ${money(Math.abs(c.b.amount))} at the bank`,
    }[c.kind];
    hints.push({ kind: c.kind, bank: c.b, books: c.l, date: c.b.date < c.l.date ? c.b.date : c.l.date, effect, gap: c.gap, text: `${words.charAt(0).toUpperCase()}${words.slice(1)}. Correct the books entry to match the statement if the statement confirms it.` });
  }
  // Books lines that repeat a matched line: entered twice.
  const hinted = new Set(hints.map((h) => h.books));
  const matchedBooks = new Map();
  for (const l of books) if (l.used && !hinted.has(l)) { if (!matchedBooks.has(l.amount)) matchedBooks.set(l.amount, []); matchedBooks.get(l.amount).push(l); }
  for (const l of books) {
    if (l.used) continue;
    const twin = (matchedBooks.get(l.amount) ?? []).find((m) => m.amount === l.amount && gapOf(m.date, l.date) <= windowDays && (similarity(textOf(m), textOf(l)) >= 0.5 || (refOf(m) && refOf(m) === refOf(l)) || !textOf(l)));
    if (!twin) continue;
    l.used = true;
    hints.push({ kind: 'duplicate', bank: null, books: l, twin, date: l.date, effect: -l.amount, gap: gapOf(twin.date, l.date), text: `${money(l.amount)} on ${longDate(l.date)} repeats books line ${twin.line} (${longDate(twin.date)}), which the bank shows once. Delete or void the extra entry if it is not a second real payment.` });
  }
  const matchedBank = new Map();
  for (const l of bank) if (l.used) { const k = `${l.date}|${l.amount}`; if (!matchedBank.has(k)) matchedBank.set(k, []); matchedBank.get(k).push(l); }
  for (const b of bank) {
    if (b.used) continue;
    const twin = (matchedBank.get(`${b.date}|${b.amount}`) ?? []).find((m) => m.amount === b.amount && m.date === b.date && similarity(textOf(m), textOf(b)) >= 0.5);
    if (!twin) continue;
    b.used = true;
    hints.push({ kind: 'bank-duplicate', bank: b, books: null, twin, date: b.date, effect: b.amount, gap: 0, text: `${money(b.amount)} on ${longDate(b.date)} is in the statement file twice (line ${twin.line} and line ${b.line}). If the bank really charged twice, record it; if the export overlapped, drop the extra line.` });
  }
  hints.sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0) || (x.bank?.line ?? x.books.line) - (y.bank?.line ?? y.books.line));

  // 3. Timing and bank-only items.
  const items = [];
  for (const l of books) {
    if (l.used) continue;
    const age = dayNumber(periodEnd) - dayNumber(l.date);
    if (l.date > periodEnd) { items.push({ kind: 'after-period', line: l, age: null, stale: false }); continue; }
    const check = l.amount < 0 && (/^check$|^chk$|cheque/i.test(l.type) || /^\d{3,}$/.test(refOf(l)));
    items.push({ kind: l.amount > 0 ? 'deposit-in-transit' : check ? 'outstanding-check' : 'outstanding-payment', line: l, age, stale: age > staleDays });
  }
  for (const b of bank) if (!b.used) items.push({ kind: 'bank-only', line: b, age: dayNumber(periodEnd) - dayNumber(b.date), stale: false, what: /interest/i.test(textOf(b)) ? 'interest' : /fee|charge|service|maint/i.test(textOf(b)) ? 'bank fee' : b.amount > 0 ? 'money in' : 'money out' });
  items.sort((x, y) => (x.line.date < y.line.date ? -1 : x.line.date > y.line.date ? 1 : 0) || x.line.line - y.line.line);
  const of = (k) => items.filter((i) => i.kind === k);
  const dit = of('deposit-in-transit'); const oc = [...of('outstanding-check'), ...of('outstanding-payment')]; const bankOnly = of('bank-only');
  const lateMatched = matches.filter((m) => m.books.some((l) => l.date > periodEnd));
  const lateMatchedSum = lateMatched.reduce((a, m) => a + sum(m.books.filter((l) => l.date > periodEnd)), 0);

  // 4. The reconciliation statement and the break.
  const corrections = hints.filter((h) => h.kind !== 'bank-duplicate').reduce((a, h) => a + (h.kind === 'duplicate' ? h.effect : h.effect), 0);
  const bankDup = hints.filter((h) => h.kind === 'bank-duplicate');
  const statementBalance = bankClosing ?? bankSumAll;
  const booksBalance = booksAtEnd ?? sum(booksInPeriod);
  const adjustedBank = statementBalance + sum(dit.map((i) => i.line)) + sum(oc.map((i) => i.line));
  const adjustedBooks = booksBalance + sum(bankOnly.map((i) => i.line)) + corrections + sum(bankDup.map((h) => h.bank)) + lateMatchedSum;
  const unexplained = adjustedBank - adjustedBooks;
  const difference = statementBalance - booksBalance;
  const timing = sum(dit.map((i) => i.line)) + sum(oc.map((i) => i.line));
  const notTiming = difference + timing;

  // The trail: the difference that is not timing, by date. It starts at the opening difference and moves
  // on each date the books miss or get wrong something the bank has.
  const events = [
    ...hints.map((h) => ({ date: h.date, effect: h.kind === 'bank-duplicate' ? h.bank.amount : h.effect, what: `${HINT_WORDS[h.kind]}: ${h.text.split('. ')[0]}` })),
    ...bankOnly.map((i) => ({ date: i.line.date, effect: i.line.amount, what: `${i.what} at the bank, not in the books: ${textOf(i.line) || 'no description'} ${money(i.line.amount)}` })),
  ].sort((x, y) => (x.date < y.date ? -1 : x.date > y.date ? 1 : 0));
  const trail = [];
  let running = openingDiff;
  for (const e of events) {
    running += e.effect;
    const last = trail[trail.length - 1];
    if (last && last.date === e.date) { last.change += e.effect; last.after = running; last.items.push(e.what); } else trail.push({ date: e.date, change: e.effect, after: running, items: [e.what] });
  }
  const unexplainedNote = unexplained !== openingDiff ? `The adjusted balances differ by ${money(unexplained)}, not by the opening difference: a balance in a file does not add up to its lines.` : null;
  if (unexplainedNote) warnings.push(unexplainedNote);
  let breakAt = null;
  if (openingDiff !== 0) breakAt = { date: null, before: periodStart, text: `before ${longDate(periodStart)}: the opening balances already differ by ${money(openingDiff)} (statement ${money(bankOpening)}, books ${money(booksOpening)})` };
  else if (trail.length) breakAt = { date: trail[0].date, text: `${longDate(trail[0].date)}: ${trail[0].items[0]}` };
  const lastAgreed = openingDiff !== 0 ? null : trail.length ? addDays(trail[0].date, -1) : periodEnd;

  const counts = {
    statement: bank.length, ledger: books.length,
    matched: matches.length, split: matches.filter((m) => m.kind === 'split').length, far: matches.filter((m) => m.kind === 'far').length,
    ambiguous: matches.filter((m) => m.ambiguous).length,
    unmatched: hints.reduce((a, h) => a + (h.bank ? 1 : 0) + (h.books ? 1 : 0), 0) + items.length,
    unmatchedStatement: bank.filter((l) => !matches.some((m) => m.bank.includes(l))).length,
    unmatchedLedger: books.filter((l) => !matches.some((m) => m.books.includes(l))).length,
    hints: hints.length,
    transpositions: hints.filter((h) => h.kind === 'transposition').length,
    signFlips: hints.filter((h) => h.kind === 'sign-flip').length,
    slides: hints.filter((h) => h.kind === 'slide').length,
    wrongAmounts: hints.filter((h) => h.kind === 'wrong-amount').length,
    duplicates: hints.filter((h) => h.kind === 'duplicate').length,
    bankDuplicates: bankDup.length,
    depositsInTransit: dit.length, outstanding: oc.length, outstandingChecks: of('outstanding-check').length, bankOnly: bankOnly.length,
    afterPeriod: of('after-period').length, stale: items.filter((i) => i.stale).length, several: several.length,
  };
  const checkResult = check(notTiming, [...bank, ...books].map((l) => l.amount));

  const r = {
    engine: ENGINE_VERSION, windowDays, staleDays, periodStart, periodEnd, compare: flip ? 'flipped' : 'same',
    files: {
      statement: { layout: sf.layout, lines: bank.length, dateOrder: sf.order, orderProof: sf.orderProof, balanceColumn: sf.chain ? sf.chain.order : null, skipped: sf.skipped, zero: sf.zero, deleted: sf.deleted },
      ledger: { layout: lf.layout, lines: books.length, dateOrder: lf.order, orderProof: lf.orderProof, account: lf.account, accounts: lf.accounts, balanceColumn: bookChain ? bookChain.order : null, skipped: lf.skipped, zero: lf.zero, deleted: lf.deleted },
    },
    balances: {
      statementOpening: bankOpening, statementClosing: bankClosing, statementFrom: bankFrom,
      ledgerOpening: booksOpening, ledgerAtEnd: booksAtEnd, ledgerFrom: booksOpeningFrom, known: balancesKnown, openingDifference: openingDiff,
    },
    difference, timing, notTiming, unexplained,
    statement: {
      statementBalance, depositsInTransit: sum(dit.map((i) => i.line)), outstanding: sum(oc.map((i) => i.line)), adjustedBank,
      booksBalance, bankOnly: sum(bankOnly.map((i) => i.line)), corrections: corrections + sum(bankDup.map((h) => h.bank)), afterPeriod: lateMatchedSum, adjustedBooks,
    },
    counts, breakAt, lastAgreed, trail, check: checkResult, warnings,
    matches, hints, items, several,
  };
  r.answer = answerOf(r);
  return r;
}

const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const listWords = (xs) => (xs.length <= 1 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);

// The one-paragraph answer: the difference, what explains it, the hints and the break.
export function answerOf(r) {
  const c = r.counts;
  const head = r.balances.known
    ? `At ${longDate(r.periodEnd)} the statement shows ${money(r.statement.statementBalance)} and the books ${money(r.statement.booksBalance)}: a difference of ${money(Math.abs(r.difference))}.`
    : `From ${longDate(r.periodStart)} to ${longDate(r.periodEnd)} the statement lines and the books lines differ by ${money(Math.abs(r.difference))}.`;
  const matched = c.matched === 0 ? 'No lines match' : `${plural(c.matched, 'line matches', 'lines match')}${c.split ? ` (${c.split} as a split)` : ''}`;
  const timingParts = [c.outstandingChecks ? plural(c.outstandingChecks, 'outstanding check') : null, c.outstanding - c.outstandingChecks ? plural(c.outstanding - c.outstandingChecks, 'outstanding payment') : null, c.depositsInTransit ? plural(c.depositsInTransit, 'deposit in transit', 'deposits in transit') : null].filter(Boolean);
  const timing = timingParts.length ? `Timing explains ${money(Math.abs(r.timing))} (${listWords(timingParts)})` : 'There are no timing items';
  const errs = [];
  if (c.transpositions) errs.push(plural(c.transpositions, 'likely transposition'));
  if (c.signFlips) errs.push(plural(c.signFlips, 'sign flip'));
  if (c.slides) errs.push(plural(c.slides, 'slide'));
  if (c.wrongAmounts) errs.push(plural(c.wrongAmounts, 'wrong amount'));
  if (c.duplicates) errs.push(plural(c.duplicates, 'entry made twice in the books', 'entries made twice in the books'));
  if (c.bankDuplicates) errs.push(plural(c.bankDuplicates, 'line twice in the statement', 'lines twice in the statement'));
  if (c.bankOnly) errs.push(plural(c.bankOnly, 'bank line missing from the books', 'bank lines missing from the books'));
  if (r.balances.openingDifference) errs.push(`an opening difference of ${money(Math.abs(r.balances.openingDifference))}`);
  const side = r.notTiming < 0 ? 'the books are higher' : 'the bank is higher';
  const rest = r.notTiming === 0 && !errs.length
    ? 'nothing else is off'
    : `the other ${money(Math.abs(r.notTiming))}${r.notTiming ? ` (${side})` : ''} comes from ${errs.length ? listWords(errs) : 'no single line'}`;
  const brk = r.breakAt
    ? r.breakAt.date ? `The running balances first disagree on ${longDate(r.breakAt.date)}.` : `The running balances already disagree before ${longDate(r.breakAt.before)}: the opening balances differ.`
    : 'Once timing items are set aside, the running balances agree on every date.';
  return `${head} ${matched} and ${c.unmatched ? `${plural(c.unmatched, 'line is', 'lines are')} on one side only` : 'no line is on one side only'}. ${timing}; ${rest}. ${brk}`;
}

// ---------- outputs ----------

const FORMULA = /^[=+\-@\t\r]/;
const cell = (v) => {
  let s = String(v ?? '');
  if (FORMULA.test(s) && !/^-?\d+(\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvOf = (rows) => rows.map((r) => r.map(cell).join(',')).join('\r\n') + '\r\n';

// Every line of both files with what it is: matched, a hint, timing or bank-only.
export function linesCsv(r) {
  const rows = [['Side', 'File line', 'Date', 'Amount', 'Description', 'Reference', 'Status', 'Paired with', 'Note']];
  const desc = (l) => textOf(l);
  for (const m of r.matches) {
    const both = [...m.bank, ...m.books];
    for (const l of both) {
      const others = (l.side === 'statement' ? m.books : m.bank).map((o) => `${o.side} line ${o.line}`).join('; ');
      rows.push([l.side, l.line, l.date, plain(l.amount), desc(l), l.ref, m.kind === 'split' ? 'matched (split)' : m.kind === 'far' ? 'matched (far apart)' : 'matched', others, m.ambiguous ? 'another line of the same amount and date was equally close' : m.kind === 'far' ? `dates ${m.gap} days apart` : '']);
    }
  }
  for (const h of r.hints) {
    for (const l of [h.bank, h.books].filter(Boolean)) {
      const other = l === h.bank ? h.books ?? h.twin : h.bank ?? h.twin;
      rows.push([l.side, l.line, l.date, plain(l.amount), desc(l), l.ref, HINT_WORDS[h.kind], other ? `${other.side} line ${other.line}` : '', h.text]);
    }
  }
  for (const i of r.items) rows.push([i.line.side, i.line.line, i.line.date, plain(i.line.amount), desc(i.line), i.line.ref, KIND_WORDS[i.kind], '', i.stale ? `${i.age} days old at the statement date` : i.what ?? '']);
  const head = rows.shift();
  rows.sort((a, b) => (a[2] < b[2] ? -1 : a[2] > b[2] ? 1 : 0) || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0) || a[1] - b[1]);
  return csvOf([head, ...rows]);
}

// The reconciliation statement, as Excel or Google Sheets opens it: values in column B.
export function statementRows(r) {
  const s = r.statement;
  const rows = [
    ['Bank reconciliation', `${longDate(r.periodStart)} to ${longDate(r.periodEnd)}`],
    ['Balance per bank statement', plain(s.statementBalance)],
    ['Add: deposits in transit', plain(s.depositsInTransit)],
    ['Less: outstanding checks and payments', plain(-s.outstanding)],
    ['Adjusted bank balance', plain(s.adjustedBank)],
    ['Balance per books', plain(s.booksBalance)],
    ['Add or less: bank lines not in the books', plain(s.bankOnly)],
    ['Add or less: corrections the hints point to', plain(s.corrections)],
    ...(s.afterPeriod ? [['Add or less: books entries dated after the statement', plain(s.afterPeriod)]] : []),
    ['Adjusted books balance', plain(s.adjustedBooks)],
    ['Difference (should be 0.00)', plain(r.unexplained)],
  ];
  return rows;
}
export const statementCsv = (r) => csvOf([['Line', 'Amount'], ...statementRows(r)]);

const lineBrief = (l) => ({ side: l.side, line: l.line, date: l.date, amount: l.amount, name: l.name, memo: l.memo, ref: l.ref });

// The free preview: the answer, the difference, counts, the break date and the statement totals.
export function preview(input, options) {
  const r = analyze(input, options);
  return {
    op: 'preview', answer: r.answer, periodStart: r.periodStart, periodEnd: r.periodEnd, windowDays: r.windowDays, compare: r.compare,
    difference: r.difference, notTiming: r.notTiming, timing: r.timing, balances: r.balances, counts: r.counts,
    breakDate: r.breakAt?.date ?? null, breaksBefore: r.breakAt && !r.breakAt.date ? r.breakAt.before : null, lastAgreed: r.lastAgreed,
    statement: r.statement, files: r.files, warnings: r.warnings,
  };
}

// The paid report: every match, hint and item, the trail, the statement and the CSVs.
export function report(input, options) {
  const r = analyze(input, options);
  return {
    op: 'report', answer: r.answer, periodStart: r.periodStart, periodEnd: r.periodEnd, windowDays: r.windowDays, staleDays: r.staleDays, compare: r.compare,
    difference: r.difference, notTiming: r.notTiming, timing: r.timing, unexplained: r.unexplained, balances: r.balances, counts: r.counts,
    breakAt: r.breakAt, lastAgreed: r.lastAgreed, trail: r.trail, check: r.check, statement: r.statement, statementRows: statementRows(r),
    hints: r.hints.map((h) => ({ kind: h.kind, date: h.date, effect: h.effect, gap: h.gap, text: h.text, bank: h.bank ? lineBrief(h.bank) : null, books: h.books ? lineBrief(h.books) : null, twin: h.twin ? lineBrief(h.twin) : null })),
    items: r.items.slice(0, LIMITS.shown).map((i) => ({ kind: i.kind, age: i.age, stale: i.stale, what: i.what ?? null, line: lineBrief(i.line) })),
    matches: r.matches.slice(0, LIMITS.shown).map((m) => ({ kind: m.kind, gap: m.gap ?? null, sameRef: Boolean(m.sameRef), ambiguous: Boolean(m.ambiguous), bank: m.bank.map(lineBrief), books: m.books.map(lineBrief) })),
    several: r.several.slice(0, 50).map((s) => ({ line: lineBrief(s.line), sets: s.sets.map((set) => set.map(lineBrief)) })),
    truncated: r.matches.length > LIMITS.shown || r.items.length > LIMITS.shown,
    files: r.files, warnings: r.warnings,
    csv: { lines: linesCsv(r), statement: statementCsv(r) },
  };
}

// ---------- worked-file builders (the samples, the page and the content pages use them) ----------

const mdy = (d) => `${d.slice(5, 7)}/${d.slice(8, 10)}/${d.slice(0, 4)}`;
const SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dMonY = (d) => `${+d.slice(8, 10)} ${SHORT[+d.slice(5, 7) - 1]} ${d.slice(0, 4)}`;
const q2 = (s) => (/[",]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
const amt = (c) => q2(money(c).replace('$', ''));
const joinRows = (rows) => rows.join('\r\n') + '\r\n';

// A bank CSV: Date, Description, Amount, Balance (oldest first) from an opening balance. rows: [date, description, cents].
export function bankCsv(opening, rows, { balance = true } = {}) {
  let bal = opening;
  return joinRows([balance ? 'Date,Description,Amount,Balance' : 'Date,Description,Amount', ...rows.map(([d, desc, c]) => { bal += c; return `${mdy(d)},${q2(desc)},${amt(c)}${balance ? `,${amt(bal)}` : ''}`; })]);
}

// QuickBooks Online Transaction Detail by Account for one bank account, with a Beginning Balance row.
// rows: [date, type, num, name, memo, split, cents].
export function qboLedger(company, period, account, opening, rows) {
  let bal = opening;
  const lines = rows.map(([d, type, num, name, memo, split, c]) => { bal += c; return `,${mdy(d)},${q2(type)},${num},${q2(name)},${q2(memo)},${q2(split)},${amt(c)},${amt(bal)}`; });
  return joinRows([`${company} (made-up sample)`, 'Transaction Detail by Account', `"${period}"`, '', ',Date,Transaction Type,Num,Name,Memo/Description,Split,Amount,Balance', `${account},,,,,,,,`, `Beginning Balance,,,,,,,,${amt(opening)}`, ...lines, `Total for ${account},,,,,,,${q2(money(bal - opening))},`]);
}

// Xero Account Transactions for one bank account with Opening and Closing Balance rows.
// rows: [date, source, description, reference, cents, related].
export function xeroLedger(company, period, account, opening, rows) {
  let bal = opening;
  const lines = rows.map(([d, source, desc, ref, c, rel]) => { bal += c; return `${dMonY(d)},${q2(source)},${q2(desc)},${q2(ref)},${c > 0 ? amt(c) : ''},${c < 0 ? amt(-c) : ''},${amt(bal)},${q2(rel)}`; });
  return joinRows(['Account Transactions', `${company} (made-up sample)`, `For the period ${period}`, '', 'Date,Source,Description,Reference,Debit,Credit,Running Balance,Related account', account, `Opening Balance,,,,,,${amt(opening)},`, ...lines, `Closing Balance,,,,,,${amt(bal)},`]);
}

// Statement lines in Xero's CSV import fields: [date, cents, payee, description, reference].
export const xeroStatement = (rows) => joinRows(['Date,Amount,Payee,Description,Reference', ...rows.map(([d, c, p, desc, ref]) => `${dMonY(d)},${plain(c)},${q2(p)},${q2(desc)},${q2(ref)}`)]);

// ---------- the sample: a made-up bakery's October ----------

const SAMPLE_BANK_ROWS = [
  ['2026-10-01', 'HARBOR PROPERTIES RENT', -240000],
  ['2026-10-02', 'SQUARE INC DEP', 124590],
  ['2026-10-05', 'MONTHLY SERVICE FEE', -1500],
  ['2026-10-06', 'SYSCO FOOD SVC', -54000],
  ['2026-10-09', 'SQUARE INC DEP', 118250],
  ['2026-10-12', 'CHECK 1049', -27500],
  ['2026-10-15', 'GUSTO PAYROLL', -421533],
  ['2026-10-16', 'SQUARE INC DEP', 131720],
  ['2026-10-19', 'COMCAST BUSINESS', -18999],
  ['2026-10-21', 'DEPOSIT', 124590],
  ['2026-10-23', 'SQUARE INC DEP', 127430],
  ['2026-10-27', 'SHELL OIL 5741', -6120],
  ['2026-10-30', 'SQUARE INC DEP', 129975],
];
export const SAMPLE_STATEMENT = bankCsv(1_284_210, SAMPLE_BANK_ROWS);
export const SAMPLE_LEDGER = qboLedger('Northwind Bakery', 'October 1-31, 2026', 'Business Checking', 1_284_210, [
  ['2026-10-01', 'Expense', '', 'Harbor Properties', 'October rent', 'Rent or Lease', -240000],
  ['2026-10-02', 'Deposit', '', 'Square', 'Card sales', 'Sales', 124590],
  ['2026-10-03', 'Check', '1049', 'Rivera Electric', 'Oven repair', 'Repairs', -27500],
  ['2026-10-06', 'Expense', '', 'Sysco', 'Flour and dairy', 'Supplies', -45000],
  ['2026-10-09', 'Deposit', '', 'Square', 'Card sales', 'Sales', 118250],
  ['2026-10-15', 'Expense', '', 'Gusto', 'Payroll', 'Payroll Expenses', -421533],
  ['2026-10-16', 'Deposit', '', 'Square', 'Card sales', 'Sales', 131720],
  ['2026-10-19', 'Expense', '', 'Comcast Business', 'Internet', 'Utilities', -18999],
  ['2026-10-20', 'Deposit', '', 'Lakeside Cafe', 'Wholesale invoice 2210', 'Sales', 74590],
  ['2026-10-20', 'Deposit', '', 'Hill School', 'Catering invoice 2211', 'Sales', 50000],
  ['2026-10-23', 'Deposit', '', 'Square', 'Card sales', 'Sales', 127430],
  ['2026-10-27', 'Expense', '', 'Shell', 'Van fuel', 'Car & Truck', -6120],
  ['2026-10-28', 'Check', '1053', 'Pacific Produce', 'Fruit', 'Supplies', -31275],
  ['2026-10-30', 'Deposit', '', 'Square', 'Card sales', 'Sales', 129975],
  ['2026-10-31', 'Deposit', '', 'Front counter', 'Cash sales', 'Sales', 41260],
]);
