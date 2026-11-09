// Bank-feed duplicate finder: the engine. Pure and dependency-free, so the page and the server run the
// same file (README: core.js is browser-loadable).
//
// Two files, either or both, for one bank or card account:
//   feed   the lines from the bank: QuickBooks Online's For review list, a bank CSV (Intuit's 3- or
//          4-column upload layout, Xero's CSV import template), or Xero statement lines
//   books  what is already posted to the account: QuickBooks Online Transaction Detail by Account (or
//          any account report), Xero Account Transactions, or any CSV with a date and an amount
// What it does:
//  1. Reads each CSV (comma, tab or semicolon), finds the header row by its column names, skips title
//     rows, account headings, Total rows and opening balances, and reads Source (Bank Feed, Imported,
//     User) and Status (Reconciled, Cleared, Deleted) columns when a file has them.
//  2. Lists every candidate pair: two lines with the same amount, to the cent, dated no more than N days
//     apart (3 by default), inside the feed, inside the books, or one in each. Each pair is scored on the
//     date gap, the payee words and the reference, and given a confidence: high, medium or low.
//  3. Settles pairs one line at a time, best score first: a line is removed at most once and a line kept
//     is never also removed. Which copy to keep follows the vendors' own rules: the reconciled copy; the
//     books entry over a feed line waiting for review; Xero's bank-feed line over an imported one; else
//     the earlier line.
//  4. Gives each pair its cause and the action in the platform's own words (Exclude in For review, Match
//     instead of add, Delete statement line, Undo then exclude), spots a whole date range that came in
//     twice, and writes the exclude-ready CSV.
// It never decides that two equal charges are one: every pair is listed for review against the statement.
// Money is whole cents throughout.

export const ENGINE_VERSION = 'dupes-1';

export const LIMITS = {
  bytes: 2_000_000,   // characters per file
  lines: 20_000,      // transaction lines per file
  window: 31,         // most days apart a pair may be
  pairsShown: 2_000,  // pairs listed in a report (all are counted)
};

export const DEFAULTS = { windowDays: 3, dateOrder: 'auto', platform: 'auto', compare: 'auto' };

export class DupesError extends Error {
  constructor(message, field = 'feed') { super(message); this.name = 'DupesError'; this.field = field; }
}

// ---------- money and dates ----------

// "1,234.56", "$1,234.56", "(45.00)", "-45", "45.00-". A decimal comma ("1 234,56") is refused rather
// than guessed. Returns whole cents, or null for a blank or unreadable value.
export function parseMoney(raw) {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? parseMoney(String(raw)) : null;
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
    const n = Number(s);
    if (!Number.isFinite(n)) return null;
    s = n.toFixed(2);
  }
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

// One date as YYYY-MM-DD, or null. order is 'mdy' or 'dmy' for slash dates. Trailing words (a weekday
// some banks add, "20/11/2018 TUE") are ignored.
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
// proves MM/DD; neither uses the choice (MM/DD by default, as US QuickBooks writes them).
export function dateOrderOf(values, choice = 'auto', field = 'feed') {
  if (choice === 'mdy' || choice === 'dmy') return { order: choice, proof: 'chosen' };
  let dmy = null; let mdy = null;
  for (const v of values) {
    const p = slashParts(String(v ?? '').trim().replace(/ .*$/, ''));
    if (!p) continue;
    if (p[0] > 12 && p[1] <= 12) dmy ??= v;
    if (p[1] > 12 && p[0] <= 12) mdy ??= v;
  }
  if (dmy && mdy) throw new DupesError(`The dates mix two orders: ${String(dmy).trim()} can only be day first and ${String(mdy).trim()} only month first. Fix the file or choose the order.`, field);
  if (dmy) return { order: 'dmy', proof: String(dmy).trim() };
  if (mdy) return { order: 'mdy', proof: String(mdy).trim() };
  return { order: 'mdy', proof: null };
}

export const dayNumber = (d) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10)) / 86_400_000;
export const fromDayNumber = (n) => new Date(n * 86_400_000).toISOString().slice(0, 10);
export const addDays = (d, n) => fromDayNumber(dayNumber(d) + n);
const WORD_MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (d) => `${WORD_MONTHS[+d.slice(5, 7) - 1]} ${+d.slice(8, 10)}, ${d.slice(0, 4)}`;
const WEEKDAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];
export const weekday = (d) => WEEKDAYS[((dayNumber(d) % 7) + 7) % 7];

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
// Column names, as the exports and templates write them. "source" is read two ways: Xero's statement
// lines say Bank Feed, Imported or User there; its Account Transactions report says Spend Money,
// Receive Money and the like, which is a transaction type.
export const HEADER_NAMES = {
  date: ['date', 'transaction date', 'txn date', 'posting date', 'posted date', 'trans date', 'trans. date'],
  type: ['transaction type', 'type', 'txn type'],
  source: ['source'],
  status: ['status', 'reconciled', 'reconcile status', 'clr', 'cleared', 'reconciliation status'],
  ref: ['num', 'no.', 'no', 'number', 'reference', 'ref', 'ref no.', 'ref no', 'ref #', 'check no.', 'check number', 'check no', 'doc number', 'transaction id', 'id'],
  name: ['name', 'payee', 'contact', 'customer', 'vendor', 'customer/vendor', 'received from', 'payee/payer'],
  memo: ['memo/description', 'memo', 'description', 'details', 'narration', 'transaction description', 'particulars', 'bank detail', 'bank description'],
  account: ['account', 'account name', 'distribution account', 'account full name'],
  amount: ['amount', 'net amount', 'transaction amount', 'net'],
  debit: ['debit', 'debits', 'dr', 'withdrawal', 'withdrawals', 'money out', 'paid out', 'spent', 'payment', 'payments'],
  credit: ['credit', 'credits', 'cr', 'deposit', 'deposits', 'money in', 'paid in', 'received'],
  balance: ['balance', 'running balance'],
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

// Which layout the header looks like: for the answer's wording and the platform guess only.
function layoutOf(map, cells, side) {
  const names = cells.map(norm);
  if (names.includes('related account') || names.includes('running balance')) return { id: 'xero-account-transactions', platform: 'xero', name: 'Xero Account Transactions report' };
  if (names.includes('split') || (names.includes('transaction type') && names.includes('memo/description'))) return { id: 'qbo-report', platform: 'qbo', name: 'QuickBooks Online account report (Transaction Detail by Account or a register)' };
  if (names.includes('particulars') || (names.includes('payee') && names.includes('reference') && map.amount !== undefined)) return { id: 'xero-statement', platform: 'xero', name: 'statement lines in Xero\'s CSV layout (Date, Amount, Payee, Description, Reference)' };
  if (names.length >= 3 && names[0] === 'date' && names[1] === 'description' && (names[2] === 'amount' || (names[2] === 'credit' && names[3] === 'debit'))) {
    return { id: 'qbo-bank-csv', platform: 'qbo', name: `bank CSV in Intuit's ${names[2] === 'amount' ? '3' : '4'}-column upload layout` };
  }
  return { id: 'generic', platform: null, name: side === 'feed' ? 'bank CSV with a date and an amount' : 'account CSV with a date and an amount' };
}

const TOTAL_RE = /^total\b/i;
const OPENING_RE = /^(beginning|opening|closing|ending) balance$/i;
const SOURCE_FEED = /^bank ?feed$/i;
const SOURCE_IMPORTED = /^imported$/i;
const SOURCE_USER = /^user$/i;

function statusOf(raw) {
  const s = norm(raw);
  if (!s) return '';
  if (s === 'r' || s.startsWith('reconciled') || s === 'yes' || s === 'y' || s === 'true') return 'reconciled';
  if (s === 'c' || s.startsWith('cleared')) return 'cleared';
  if (s.startsWith('deleted')) return 'deleted';
  if (s.startsWith('unreconciled') || s === 'no' || s === 'n' || s === 'false') return 'unreconciled';
  return '';
}

// Reads one file's lines. side is 'feed' or 'books'. A books file that holds several accounts (an
// account report grouped by account) keeps one: the one named by `account`, else the one with most lines.
export function readFile(text, side, { dateOrder = 'auto', account = null } = {}) {
  const label = side === 'feed' ? 'The bank-feed file' : 'The books file';
  if (typeof text !== 'string' || !text.trim()) throw new DupesError(`${label} is empty.`, side);
  if (text.length > LIMITS.bytes) throw new DupesError(`${label} is over ${LIMITS.bytes.toLocaleString('en-US')} characters; export a shorter date range.`, side);
  const rows = parseCsv(text);
  const head = findHeader(rows);
  if (!head) throw new DupesError(`${label} has no header row with a Date column and an Amount (or Debit and Credit, or Spent and Received) column in its first 40 rows.`, side);
  const { map, index } = head;
  const layout = layoutOf(map, rows[index], side);
  const body = rows.slice(index + 1);
  const { order, proof } = dateOrderOf(body.map((r) => r[map.date]), dateOrder, side);
  // A bank file's Credit is money in; a ledger report's Debit is money into a bank account.
  const moneyIn = side === 'feed' ? 'credit' : 'debit';
  const moneyOut = side === 'feed' ? 'debit' : 'credit';
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
  const groups = new Map();
  const group = (name) => { if (!groups.has(name)) groups.set(name, []); return groups.get(name); };
  let section = null;
  let skipped = 0; let deleted = 0; let zero = 0;
  body.forEach((r, k) => {
    const lineNo = index + 2 + k;
    if (!r.some((v) => v !== '')) return;
    const texts = r.filter((v) => v !== '');
    const first = texts[0] ?? '';
    if (texts.some((v) => OPENING_RE.test(v))) return;
    const date = parseDate(r[map.date], order);
    if (!date) {
      if (TOTAL_RE.test(first)) return;
      if (texts.length === 1 && parseMoney(first) === null && !parseDate(first, order)) { section = first; return; }
      if (r[map.date]) skipped++;
      return;
    }
    const amount = amountOf(r);
    if (amount === null) { skipped++; return; }
    if (amount === 0) { zero++; return; }
    const rawSource = cellOf(r, 'source');
    const source = SOURCE_FEED.test(rawSource) ? 'bank feed' : SOURCE_IMPORTED.test(rawSource) ? 'imported' : SOURCE_USER.test(rawSource) ? 'user' : '';
    const status = statusOf(cellOf(r, 'status'));
    if (status === 'deleted') { deleted++; return; }
    const type = cellOf(r, 'type') || (source ? '' : rawSource);
    group(cellOf(r, 'account') || section || '').push({
      side, line: lineNo, date, amount, name: cellOf(r, 'name'), memo: cellOf(r, 'memo'), ref: cellOf(r, 'ref'), type, source, status,
    });
  });
  const accounts = [...groups.entries()].filter(([, l]) => l.length).map(([name, lines]) => ({ name, lines }));
  if (!accounts.length) throw new DupesError(`${label} has no lines with a date and an amount under its header row.`, side);
  let chosen;
  if (accounts.length === 1) chosen = accounts[0];
  else if (account) {
    const want = account.toLowerCase();
    chosen = accounts.find((a) => a.name.toLowerCase() === want) ?? accounts.find((a) => a.name.toLowerCase().includes(want));
    if (!chosen) throw new DupesError(`No account named like "${account}" in ${label.toLowerCase()}. It holds: ${accounts.map((a) => a.name || '(no name)').join(', ')}.`, 'account');
  } else {
    chosen = [...accounts].sort((a, b) => b.lines.length - a.lines.length || a.name.localeCompare(b.name))[0];
  }
  if (chosen.lines.length > LIMITS.lines) throw new DupesError(`${label} has ${chosen.lines.length.toLocaleString('en-US')} lines; the most is ${LIMITS.lines.toLocaleString('en-US')}. Export a shorter date range.`, side);
  return {
    side, layout, header: rows[index], order, orderProof: proof, account: chosen.name, accounts: accounts.map((a) => ({ name: a.name, lines: a.lines.length })),
    lines: chosen.lines, skipped, deleted, zero,
  };
}

// ---------- matching ----------

// Words that say nothing about who was paid: dropped before payee words are compared.
const STOP = new Set(['inc', 'llc', 'ltd', 'co', 'corp', 'the', 'and', 'of', 'pos', 'ach', 'debit', 'credit', 'card', 'purchase', 'payment', 'pmt', 'dep', 'deposit',
  'online', 'transfer', 'xfer', 'web', 'id', 'ppd', 'ccd', 'des', 'checkcard', 'visa', 'mc', 'expense', 'check', 'bill', 'sale', 'sales', 'receipt', 'us', 'usa']);
export const words = (s) => [...new Set(String(s ?? '').toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 2 && !STOP.has(w) && !/^\d{1,3}$/.test(w)))];
// Shared payee words over the shorter list: "Verizon" and "VERIZON WIRELESS" score 1.
export function similarity(a, b) {
  const A = words(a); const B = words(b);
  if (!A.length || !B.length) return 0;
  const set = new Set(B);
  const shared = A.filter((w) => set.has(w)).length;
  return Math.round((shared / Math.min(A.length, B.length)) * 100) / 100;
}
const textOf = (l) => [l.name, l.memo].filter(Boolean).join(' ');
const primaryOf = (l) => l.name || l.memo || '';
// Payee words: the better of the names alone and the names with their memos.
const payeeSimilarity = (a, b) => Math.max(similarity(primaryOf(a), primaryOf(b)), similarity(textOf(a), textOf(b)));
const refOf = (l) => String(l.ref ?? '').trim().toLowerCase();
const settled = (l) => l.status === 'reconciled' || l.status === 'cleared';

// The score of a candidate pair: date gap 0 days = 2, 1 day = 1; payee words 0.6 or more = 2, 0.3 or
// more = 1; the same reference = 2. 4 or more is high confidence, 2 or 3 medium, 0 or 1 low.
export function scorePair(a, b) {
  const gap = Math.abs(dayNumber(a.date) - dayNumber(b.date));
  const sim = payeeSimilarity(a, b);
  const sameRef = refOf(a) !== '' && refOf(a) === refOf(b);
  const score = (gap === 0 ? 2 : gap === 1 ? 1 : 0) + (sim >= 0.6 ? 2 : sim >= 0.3 ? 1 : 0) + (sameRef ? 2 : 0);
  return { gap, sim, sameRef, score, confidence: score >= 4 ? 'high' : score >= 2 ? 'medium' : 'low' };
}
const CONF_RANK = { high: 3, medium: 2, low: 1 };

// Which copy to keep, and why, for a pair (a, b) of the same side or a feed line and a books entry.
function keeperOf(a, b) {
  if (a.side !== b.side) return a.side === 'books' ? [a, b, 'books'] : [b, a, 'books'];
  if (settled(a) !== settled(b)) return settled(a) ? [a, b, 'reconciled'] : [b, a, 'reconciled'];
  if (a.source === 'bank feed' && b.source && b.source !== 'bank feed') return [a, b, 'feed-source'];
  if (b.source === 'bank feed' && a.source && a.source !== 'bank feed') return [b, a, 'feed-source'];
  if (a.date !== b.date) return a.date < b.date ? [a, b, 'earlier'] : [b, a, 'earlier'];
  return a.line <= b.line ? [a, b, 'earlier'] : [b, a, 'earlier'];
}

const KEEP_WHY = {
  books: 'the entry already in the books is kept',
  reconciled: 'the reconciled copy is kept',
  'feed-source': 'the bank-feed line is kept over the imported one',
  earlier: 'the earlier copy is kept',
};

// Cross-file amounts are compared as written, or with the books' signs flipped (a credit-card account
// exported with charges positive on one side and negative on the other). 'auto' picks whichever gives
// more candidate pairs, the same signs on a tie.
function candidates(lines, windowDays, flipBooks) {
  const keyOf = (l) => (flipBooks && l.side === 'books' ? -l.amount : l.amount);
  const byAmount = new Map();
  for (const l of lines) {
    const k = keyOf(l);
    if (!byAmount.has(k)) byAmount.set(k, []);
    byAmount.get(k).push(l);
  }
  const out = [];
  for (const list of byAmount.values()) {
    if (list.length < 2) continue;
    list.sort((x, y) => x.date.localeCompare(y.date) || x.side.localeCompare(y.side) || x.line - y.line);
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const gap = dayNumber(list[j].date) - dayNumber(list[i].date);
        if (gap > windowDays) break;
        out.push([list[i], list[j]]);
      }
    }
  }
  return out;
}

const KIND = (a, b) => (a.side !== b.side ? 'already-entered' : a.side === 'feed' ? 'feed-twice' : 'books-twice');

// Settles the candidate pairs: best score first, then the smallest gap, then file order.
function settle(cands) {
  const scored = cands.map(([a, b]) => ({ a, b, ...scorePair(a, b) }));
  scored.sort((x, y) => y.score - x.score || x.gap - y.gap
    || Math.min(x.a.line, x.b.line) - Math.min(y.a.line, y.b.line) || Math.max(x.a.line, x.b.line) - Math.max(y.a.line, y.b.line)
    || x.a.side.localeCompare(y.a.side) || x.b.side.localeCompare(y.b.side));
  const removed = new Set(); const kept = new Set();
  const id = (l) => `${l.side}:${l.line}`;
  const pairs = [];
  for (const c of scored) {
    const [keep, extra, why] = keeperOf(c.a, c.b);
    if (removed.has(id(keep)) || removed.has(id(extra)) || kept.has(id(extra))) continue;
    removed.add(id(extra)); kept.add(id(keep));
    pairs.push({ ...c, keep, extra, keepWhy: why, kind: KIND(c.a, c.b) });
  }
  return pairs;
}

// A run of dates where nearly every line came in twice: at least 5 pairs of one kind, covering 80% or
// more of the feed lines dated from the first to the last of them.
function patternOf(pairs, feedLines) {
  const out = [];
  for (const kind of ['feed-twice', 'already-entered']) {
    const ps = pairs.filter((p) => p.kind === kind);
    if (ps.length < 5) continue;
    const extras = ps.map((p) => p.extra.date).sort();
    const from = extras[0]; const to = extras[extras.length - 1];
    const inRange = feedLines.filter((l) => l.date >= from && l.date <= to);
    const base = kind === 'feed-twice' ? inRange.length / 2 : inRange.length;
    const share = base ? Math.min(100, Math.round((ps.length / base) * 1000) / 10) : 0;
    if (share >= 80) out.push({ kind, from, to, pairs: ps.length, share, total: ps.reduce((s, p) => s + Math.abs(p.extra.amount), 0) });
  }
  return out;
}

const PLATFORM_NAME = { qbo: 'QuickBooks Online', xero: 'Xero' };

// The action and cause of a settled pair, in the platform's own words.
function describe(p, platform, patterns) {
  const inPattern = (kind) => patterns.some((x) => x.kind === kind && p.extra.date >= x.from && p.extra.date <= x.to);
  const bothSettled = p.kind !== 'already-entered' && settled(p.keep) && settled(p.extra);
  let cause; let action; let code;
  if (p.kind === 'feed-twice') {
    const mixed = p.keep.source && p.extra.source && p.keep.source !== p.extra.source;
    cause = mixed ? 'overlapping-import' : inPattern('feed-twice') ? 'downloaded-twice' : 'feed-twice';
    code = bothSettled ? 'ask' : platform === 'xero' ? 'delete-statement-line' : 'exclude';
    action = bothSettled ? 'Both copies are reconciled: ask your accountant before changing a reconciled period'
      : platform === 'xero' ? 'Delete this statement line (Bank Statements, Statement lines)' : 'Exclude this copy in For review; keep the other to match or add';
  } else if (p.kind === 'already-entered') {
    // From the files alone, a line entered by hand and a line downloaded again after a reconnect look
    // the same; the platform settles it. An entry that is not yet matched is offered as a match; one
    // already matched or reconciled is not, and then the feed line is excluded (Intuit's match article).
    const reconciled = settled(p.keep);
    cause = reconciled ? 'downloaded-again' : 'already-in-books';
    code = reconciled ? (platform === 'xero' ? 'delete-statement-line' : 'exclude') : 'match';
    if (platform === 'xero') {
      action = reconciled ? 'Delete this statement line: its transaction is already reconciled'
        : 'Reconcile this statement line to the transaction already entered; if that transaction is already reconciled, delete this statement line instead';
    } else {
      action = reconciled ? 'Exclude this line in For review: the entry is already reconciled'
        : 'Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead';
    }
  } else {
    cause = 'entered-twice';
    code = bothSettled ? 'ask' : 'remove-entry';
    action = bothSettled ? 'Both copies are reconciled: ask your accountant before changing a reconciled period'
      : platform === 'xero' ? 'Remove the extra account transaction (unreconcile it first if it is reconciled)'
        : 'Remove the extra entry: if it was added from the bank feed, Undo it in Categorized and exclude it; if it was entered by hand, delete or void it in the register';
  }
  const flags = [];
  if (bothSettled) flags.push('both copies are reconciled');
  if (p.kind !== 'already-entered' && p.gap === 0 && p.keep.side === p.extra.side) flags.push('same day: two equal charges can both be real; check the statement');
  return { cause, action, code, flags };
}

export const CAUSE_WORDS = {
  'downloaded-twice': 'the feed brought the same lines twice (an account connected twice, or a reconnect that downloaded history again)',
  'overlapping-import': 'an imported statement overlaps the bank feed',
  'feed-twice': 'the same line is in the feed twice',
  'downloaded-again': 'the feed sent a line that is already in the books and reconciled',
  'already-in-books': 'the feed sent a line that is already in the books: entered by hand before the feed, or downloaded again after a reconnect',
  'entered-twice': 'the same transaction is in the books twice',
};
export const KIND_WORDS = { 'feed-twice': 'twice in the feed', 'already-entered': 'feed line already in the books', 'books-twice': 'twice in the books' };

const normOpts = (o = {}) => {
  const windowDays = o.windowDays ?? DEFAULTS.windowDays;
  if (!Number.isInteger(windowDays) || windowDays < 0 || windowDays > LIMITS.window) throw new DupesError(`windowDays is a whole number from 0 to ${LIMITS.window}.`, 'windowDays');
  return { windowDays, dateOrder: o.dateOrder ?? DEFAULTS.dateOrder, platform: o.platform ?? DEFAULTS.platform, compare: o.compare ?? DEFAULTS.compare, account: o.account ?? null };
};
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const lineOut = (l) => ({ side: l.side, line: l.line, date: l.date, amount: l.amount, name: l.name, memo: l.memo, ref: l.ref, type: l.type, source: l.source, status: l.status });

// The full analysis. input: { feed?, books? } as CSV text.
export function analyze({ feed = null, books = null }, options = {}) {
  const opts = normOpts(options);
  if (!(feed && String(feed).trim()) && !(books && String(books).trim())) throw new DupesError('Give a bank-feed file, a books file, or both.', 'feed');
  const files = {};
  if (feed && String(feed).trim()) files.feed = readFile(feed, 'feed', { dateOrder: opts.dateOrder });
  if (books && String(books).trim()) files.books = readFile(books, 'books', { dateOrder: opts.dateOrder, account: opts.account });
  const feedLines = files.feed?.lines ?? [];
  const bookLines = files.books?.lines ?? [];
  const all = [...feedLines, ...bookLines];

  // The platform: as chosen, else Xero when a file looks like Xero's or carries Xero's Source values,
  // else QuickBooks Online.
  const platform = opts.platform === 'qbo' || opts.platform === 'xero' ? opts.platform
    : [files.feed?.layout.platform, files.books?.layout.platform].includes('xero') || feedLines.some((l) => l.source) ? 'xero' : 'qbo';

  // Signs across the two files.
  let flip = false; let compareNote = null;
  if (feedLines.length && bookLines.length) {
    if (opts.compare === 'flipped') flip = true;
    else if (opts.compare === 'auto') {
      const cross = (f) => candidates(all, opts.windowDays, f).filter(([a, b]) => a.side !== b.side).length;
      const same = cross(false); const flipped = cross(true);
      if (flipped > same) { flip = true; compareNote = `The books file's signs are the reverse of the bank file's (${flipped} cross-file candidates that way, ${same} as written), so its amounts were compared with the sign flipped.`; }
    }
  }

  const pairs = settle(candidates(all, opts.windowDays, flip));
  const patterns = patternOf(pairs, feedLines);
  const described = pairs.map((p) => ({ ...p, ...describe(p, platform, patterns) }));
  // Pairs read in the order of the copy to remove: date, then file and line.
  described.sort((x, y) => x.extra.date.localeCompare(y.extra.date) || x.extra.side.localeCompare(y.extra.side) || x.extra.line - y.extra.line);
  // An amount on one side of the file three or more times is a repeat (rent, a subscription): its
  // pairs are never above medium confidence.
  const counts = new Map();
  for (const l of all) { const k = `${l.side}:${l.amount}`; counts.set(k, (counts.get(k) ?? 0) + 1); }
  const out = described.map((p, i) => {
    const repeats = Math.max(counts.get(`${p.keep.side}:${p.keep.amount}`), counts.get(`${p.extra.side}:${p.extra.amount}`));
    const flags = [...p.flags];
    let confidence = p.confidence;
    if (p.keep.side === p.extra.side && repeats >= 3) { flags.push(`this amount is in the file ${repeats} times`); if (confidence === 'high') confidence = 'medium'; }
    return {
      n: i + 1, kind: p.kind, cause: p.cause, confidence, score: p.score, gapDays: p.gap, similarity: p.sim, sameRef: p.sameRef,
      amount: p.extra.amount, keep: lineOut(p.keep), extra: lineOut(p.extra), keepWhy: KEEP_WHY[p.keepWhy], action: p.action, code: p.code, flags,
    };
  });

  const byConf = { high: 0, medium: 0, low: 0 };
  const byKind = { 'feed-twice': 0, 'already-entered': 0, 'books-twice': 0 };
  for (const p of out) { byConf[p.confidence]++; byKind[p.kind]++; }
  // Totals are the sizes of the copies to act on (money in and out alike); the net is what the books
  // copies do to the account's balance.
  const sum = (kind) => out.filter((p) => p.kind === kind).reduce((s, p) => s + Math.abs(p.amount), 0);
  const dates = all.map((l) => l.date).sort();
  const warnings = [];
  for (const f of Object.values(files)) {
    const what = f.side === 'feed' ? 'bank-feed file' : 'books file';
    if (f.accounts.length > 1) warnings.push(`The ${what} holds ${f.accounts.length} accounts; ${f.account || 'the largest'} was checked (${f.accounts.map((a) => `${a.name || '(no name)'}: ${a.lines}`).join(', ')}). Choose another with the account setting.`);
    if (f.skipped) warnings.push(`${plural(f.skipped, 'line')} in the ${what} had a date but no readable amount and were skipped.`);
    if (f.deleted) warnings.push(`${plural(f.deleted, 'line')} in the ${what} are marked Deleted and were left out.`);
  }
  if (compareNote) warnings.push(compareNote);
  if (!feedLines.length) warnings.push('No bank-feed file: only duplicates inside the books are looked for. Add the feed lines waiting for review to find the ones already entered.');
  if (out.some((p) => p.flags.some((f) => f.startsWith('same day')))) warnings.push('Some pairs are two equal amounts on the same day. Check each against the bank statement: if the statement shows the charge twice, both are real.');

  const r = {
    engine: ENGINE_VERSION,
    platform, platformName: PLATFORM_NAME[platform],
    windowDays: opts.windowDays,
    compare: flip ? 'flipped' : 'same',
    files: Object.fromEntries(Object.entries(files).map(([k, f]) => [k, { layout: f.layout, account: f.account, lines: f.lines.length, dateOrder: f.order, orderProof: f.orderProof, skipped: f.skipped, deleted: f.deleted }])),
    lines: { feed: feedLines.length, books: bookLines.length },
    range: dates.length ? { from: dates[0], to: dates[dates.length - 1] } : null,
    counts: { pairs: out.length, ...byConf, byKind },
    totals: { feedTwice: sum('feed-twice'), alreadyEntered: sum('already-entered'), booksTwice: sum('books-twice'), booksTwiceNet: out.filter((p) => p.kind === 'books-twice').reduce((s, p) => s + p.amount, 0) },
    patterns,
    pairs: out,
    warnings,
  };
  r.answer = answerOf(r);
  return r;
}

// The answer in one paragraph: the first sentence of the page, the preview and the API.
export function answerOf(r) {
  const c = r.counts;
  const files = [r.lines.feed ? `${plural(r.lines.feed, 'bank-feed line')}` : null, r.lines.books ? `${plural(r.lines.books, 'books entry', 'books entries')}` : null].filter(Boolean).join(' and ');
  const range = r.range ? ` from ${longDate(r.range.from)} to ${longDate(r.range.to)}` : '';
  if (!c.pairs) return `No likely duplicates in ${files}${range}: no two lines have the same amount within ${plural(r.windowDays, 'day')} of each other.`;
  const parts = [];
  if (c.byKind['feed-twice']) parts.push(`${c.byKind['feed-twice']} ${c.byKind['feed-twice'] === 1 ? 'is' : 'are'} in the feed twice (${money(r.totals.feedTwice)})`);
  if (c.byKind['already-entered']) parts.push(`${c.byKind['already-entered']} ${c.byKind['already-entered'] === 1 ? 'is a feed line' : 'are feed lines'} already entered in the books (${money(r.totals.alreadyEntered)})`);
  if (c.byKind['books-twice']) parts.push(`${c.byKind['books-twice']} ${c.byKind['books-twice'] === 1 ? 'is' : 'are'} in the books twice (${money(r.totals.booksTwice)})`);
  const conf = ['high', 'medium', 'low'].filter((k) => c[k]).map((k) => `${c[k]} ${k}`).join(', ');
  let s = `Found ${plural(c.pairs, 'likely duplicate')} in ${files}${range}, each the same amount within ${plural(r.windowDays, 'day')}: ${parts.join('; ')}. Confidence: ${conf}.`;
  for (const p of r.patterns) {
    const verb = p.kind === 'feed-twice' ? 'came in twice' : p.share === 100 ? 'is already in the books' : 'are already in the books';
    s += p.share === 100
      ? ` Every feed line from ${longDate(p.from)} to ${longDate(p.to)} ${verb} (${p.pairs} pairs, 100% of the lines in that range).`
      : ` From ${longDate(p.from)} to ${longDate(p.to)}, ${p.share}% of the feed lines ${verb} (${p.pairs} pairs).`;
  }
  const net = r.totals.booksTwiceNet;
  if (net) s += ` The entries in the books twice make the account's balance ${money(Math.abs(net))} ${net < 0 ? 'lower' : 'higher'} than it should be.`;
  return s;
}

// The free preview: the answer, counts and totals; no pair detail.
export function preview(input, options) {
  const r = analyze(input, options);
  const { pairs, ...rest } = r;
  return { ...rest, preview: true };
}

// The paid report: every pair, the exclude-ready list and the pairs CSV.
export function report(input, options) {
  const r = analyze(input, options);
  const shown = r.pairs.slice(0, LIMITS.pairsShown);
  return { ...r, pairs: shown, truncated: r.pairs.length > shown.length, csv: { exclude: excludeCsv(r.pairs, r.platform), pairs: pairsCsv(r.pairs) } };
}

// ---------- CSV working papers ----------

const FORMULA = /^[=+\-@\t\r]/;
const cell = (v, text = false) => {
  let s = String(v ?? '');
  if (text && FORMULA.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csvOf = (rows) => rows.map((r) => r.join(',')).join('\r\n') + '\r\n';
const WHERE = {
  qbo: { feed: 'For review', books: 'Register' },
  xero: { feed: 'Statement lines', books: 'Account transactions' },
};

// The copies to act on, one row each, in the order to work through them.
export function excludeCsv(pairs, platform = 'qbo') {
  return csvOf([
    ['Pair', 'Confidence', 'Action', 'Where', 'Date', 'Amount', 'Payee or description', 'Reference', 'File', 'Line', 'Kept copy: file', 'Kept copy: line', 'Kept copy: date', 'Cause'],
    ...pairs.map((p) => [p.n, p.confidence, cell(p.action), WHERE[platform][p.extra.side], p.extra.date, plain(p.extra.amount), cell(textOf(p.extra), true), cell(p.extra.ref, true),
      p.extra.side, p.extra.line, p.keep.side, p.keep.line, p.keep.date, cell(CAUSE_WORDS[p.cause])]),
  ]);
}

export function pairsCsv(pairs) {
  return csvOf([
    ['Pair', 'Kind', 'Confidence', 'Score', 'Days apart', 'Payee words shared', 'Same reference', 'Amount', 'Keep: file', 'Keep: line', 'Keep: date', 'Keep: text', 'Remove: file', 'Remove: line', 'Remove: date', 'Remove: text', 'Why this copy is kept', 'Flags'],
    ...pairs.map((p) => [p.n, p.kind, p.confidence, p.score, p.gapDays, p.similarity, p.sameRef ? 'yes' : 'no', plain(p.amount), p.keep.side, p.keep.line, p.keep.date, cell(textOf(p.keep), true),
      p.extra.side, p.extra.line, p.extra.date, cell(textOf(p.extra), true), cell(p.keepWhy), cell(p.flags.join('; '))]),
  ]);
}

// ---------- the reconciliation calendar ----------

// Month ends from fromYm to toYm (YYYY-MM), inclusive.
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
// The feed dates to check for a month's close: a line dated up to N days after the month end can be
// the twin of one inside it, so the check runs past the end by the window.
export function closeWindow(monthEnd, windowDays = DEFAULTS.windowDays) {
  return { from: `${monthEnd.slice(0, 8)}01`, to: monthEnd, checkThrough: addDays(monthEnd, windowDays), quarterEnd: ['03', '06', '09', '12'].includes(monthEnd.slice(5, 7)) };
}

// ---------- the worked example (made up; the page, the examples and the content pages use it) ----------

// A bakery's Business Checking in QuickBooks Online: the register for October 2026 (Transaction
// Detail by Account) and the bank lines still waiting in For review, in Intuit's 3-column layout.
export const SAMPLE_BOOKS = [
  'Northwind Bakery (made-up sample)',
  'Transaction Detail by Account',
  '"October 1-31, 2026"',
  '',
  ',Date,Transaction Type,Num,Name,Memo/Description,Split,Amount,Balance',
  'Business Checking,,,,,,,,',
  ',10/01/2026,Expense,,Harbor Properties,October rent,Rent or Lease,"-2,400.00","-2,400.00"',
  ',10/02/2026,Expense,,Comcast Business,,Utilities,-189.99,"-2,589.99"',
  ',10/03/2026,Deposit,,Square,Card sales,Sales,"1,284.50","-1,305.49"',
  ',10/06/2026,Expense,,Sysco,Flour and dairy,Supplies,-642.18,"-1,947.67"',
  ',10/06/2026,Expense,,SYSCO FOOD SVC,,Supplies,-642.18,"-2,589.85"',
  ',10/08/2026,Check,1052,Rivera Electric,Oven repair,Repairs,-350.00,"-2,939.85"',
  ',10/10/2026,Deposit,,Square,Card sales,Sales,"1,102.75","-1,837.10"',
  ',10/13/2026,Expense,,Amazon,Packaging,Supplies,-86.40,"-1,923.50"',
  ',10/14/2026,Expense,,AMZN Mktp US,,Supplies,-86.40,"-2,009.90"',
  ',10/15/2026,Expense,,Gusto,Payroll,Payroll Expenses,"-4,215.33","-6,225.23"',
  ',10/17/2026,Deposit,,Square,Card sales,Sales,"1,317.20","-4,908.03"',
  ',10/20/2026,Expense,,Shell,Van fuel,Car & Truck,-58.00,"-4,966.03"',
  ',10/20/2026,Expense,,Shell,Van fuel,Car & Truck,-58.00,"-5,024.03"',
  ',10/24/2026,Bill Payment (Check),1053,Sysco,,Accounts Payable (A/P),"-1,018.44","-6,042.47"',
  ',10/27/2026,Deposit,,Square,Card sales,Sales,"1,245.90","-4,796.57"',
  ',10/28/2026,Expense,,Verizon,Phones,Utilities,-112.60,"-4,909.17"',
  'Total for Business Checking,,,,,,,"-$4,909.17",',
].join('\r\n') + '\r\n';

export const SAMPLE_FEED = [
  'Date,Description,Amount',
  '10/26/2026,SQUARE INC DEP,"1,245.90"',
  '10/28/2026,VERIZON WIRELESS,-112.60',
  '10/29/2026,SQUARE INC DEP,"1,198.05"',
  '10/29/2026,SQUARE INC DEP,"1,198.05"',
  '10/30/2026,COMCAST BUSINESS,-189.99',
  '10/30/2026,STAPLES 0412,-45.17',
  '10/31/2026,HARBOR PROPERTIES RENT,"-2,400.00"',
].join('\r\n') + '\r\n';
