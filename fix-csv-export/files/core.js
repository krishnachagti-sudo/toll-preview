// Fix a CSV export: the engine. Pure and dependency-free, so the page (in the browser) and the
// server run the same file. Same bytes and same recipe in, same bytes out.
//
// The job, in order:
//   1. decode   the bytes: a byte order mark first, then strict UTF-8, else Windows-1252 (the WHATWG
//               table below, pinned against data/windows-1252.json by the tests). UTF-16 with a BOM.
//   2. repair   text that was UTF-8 read as Windows-1252 ("CafÃ©" for "Café"), field by field, only
//               where turning it back gives valid UTF-8.
//   3. parse    RFC 4180: the delimiter (comma, semicolon, tab or pipe) from the first records,
//               quoted fields with commas, quotes and line breaks.
//   4. analyse  each column: dates and which order they are written in (a first part above 12 proves
//               DD/MM, a second part above 12 proves MM/DD; both in one column is a mixed column),
//               ZIP codes and codes with leading zeros, IDs of 16 or more digits, values Excel already
//               damaged, amounts written with symbols.
//   5. recipe   the settings that fix it (never any of the file's values), keyed by the header row,
//               so next month's export gets the same fix and a warning when its columns change.
//   6. write    the fixed file: UTF-8 with or without a BOM (or Windows-1252), dates as ISO
//               (YYYY-MM-DD) or a stated order, codes as text, with a report of every change.
//
// Nothing is guessed. A date whose day and month are both 12 or below is settled only by the
// column's proven order or by the recipe; otherwise it is listed and left as written. A code is
// padded only to a width a rule gives (ZIP 5, ZIP+4 9) or the recipe states.

export const ENGINE_VERSION = 'fix-csv-export-1';

export const LIMITS = {
  bytes: 2_000_000, // one file per call
  rows: 100_000,
  columns: 300,
  previewRows: 20,
  sniffRecords: 50,
  changeRows: 5_000, // rows of the change report returned in the response (the counts cover all)
};

export class CsvFixError extends Error {
  constructor(message, field = 'file') {
    super(message);
    this.name = 'CsvFixError';
    this.field = field;
  }
}

// ---------- 1. encodings ----------

// Windows-1252 bytes 0x80 to 0x9F per the WHATWG Encoding Standard (index-windows-1252, 2024-09-18);
// 0xA0 to 0xFF are the same code points as the bytes. Five bytes are unassigned in Windows-1252 and
// WHATWG maps them to the C1 control with the same number.
export const CP1252_HIGH = [
  0x20AC, 0x0081, 0x201A, 0x0192, 0x201E, 0x2026, 0x2020, 0x2021, 0x02C6, 0x2030, 0x0160, 0x2039, 0x0152, 0x008D, 0x017D, 0x008F,
  0x0090, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2013, 0x2014, 0x02DC, 0x2122, 0x0161, 0x203A, 0x0153, 0x009D, 0x017E, 0x0178,
];
const CP1252_BYTE = new Map();
for (let b = 0; b < 256; b++) CP1252_BYTE.set(b >= 0x80 && b < 0xA0 ? CP1252_HIGH[b - 0x80] : b, b);

export const ENCODINGS = ['auto', 'utf-8', 'windows-1252', 'utf-16le', 'utf-16be'];
export const ENCODING_NAMES = {
  'utf-8': 'UTF-8',
  'utf-8-bom': 'UTF-8 with a BOM',
  'windows-1252': 'Windows-1252',
  'utf-16le': 'UTF-16 (little-endian)',
  'utf-16be': 'UTF-16 (big-endian)',
};

// The offset of the first byte that is not valid UTF-8, or -1. Overlong forms, surrogates and
// code points above U+10FFFF are invalid (RFC 3629).
export function firstBadUtf8(bytes, start = 0) {
  let i = start;
  const n = bytes.length;
  while (i < n) {
    const b = bytes[i];
    if (b < 0x80) { i++; continue; }
    let need;
    let min;
    if (b >= 0xC2 && b <= 0xDF) { need = 1; min = 0x80; } else if (b >= 0xE0 && b <= 0xEF) { need = 2; min = 0x800; } else if (b >= 0xF0 && b <= 0xF4) { need = 3; min = 0x10000; } else return i;
    if (i + need >= n) return i;
    let cp = b & (need === 1 ? 0x1F : need === 2 ? 0x0F : 0x07);
    for (let k = 1; k <= need; k++) {
      const c = bytes[i + k];
      if (c === undefined || (c & 0xC0) !== 0x80) return i;
      cp = (cp << 6) | (c & 0x3F);
    }
    if (cp < min || cp > 0x10FFFF || (cp >= 0xD800 && cp <= 0xDFFF)) return i;
    i += need + 1;
  }
  return -1;
}

function utf8Decode(bytes) {
  let out = '';
  let i = 0;
  const n = bytes.length;
  const chunk = [];
  while (i < n) {
    const b = bytes[i];
    let cp;
    if (b < 0x80) { cp = b; i += 1; } else if (b < 0xE0) { cp = ((b & 0x1F) << 6) | (bytes[i + 1] & 0x3F); i += 2; } else if (b < 0xF0) { cp = ((b & 0x0F) << 12) | ((bytes[i + 1] & 0x3F) << 6) | (bytes[i + 2] & 0x3F); i += 3; } else { cp = ((b & 0x07) << 18) | ((bytes[i + 1] & 0x3F) << 12) | ((bytes[i + 2] & 0x3F) << 6) | (bytes[i + 3] & 0x3F); i += 4; }
    chunk.push(cp);
    if (chunk.length >= 8192) { out += String.fromCodePoint(...chunk); chunk.length = 0; }
  }
  if (chunk.length) out += String.fromCodePoint(...chunk);
  return out;
}

function cp1252Decode(bytes) {
  let out = '';
  const chunk = [];
  for (const b of bytes) {
    chunk.push(b >= 0x80 && b < 0xA0 ? CP1252_HIGH[b - 0x80] : b);
    if (chunk.length >= 8192) { out += String.fromCharCode(...chunk); chunk.length = 0; }
  }
  if (chunk.length) out += String.fromCharCode(...chunk);
  return out;
}

function utf16Decode(bytes, little) {
  let out = '';
  const chunk = [];
  for (let i = 0; i + 1 < bytes.length; i += 2) {
    chunk.push(little ? bytes[i] | (bytes[i + 1] << 8) : (bytes[i] << 8) | bytes[i + 1]);
    if (chunk.length >= 8192) { out += String.fromCharCode(...chunk); chunk.length = 0; }
  }
  if (chunk.length) out += String.fromCharCode(...chunk);
  return out;
}

// UTF-16 without a BOM: most of the first bytes' odd (or even) positions are zero.
function looksUtf16(bytes) {
  const n = Math.min(bytes.length - (bytes.length % 2), 400);
  if (n < 8) return null;
  let evenZero = 0;
  let oddZero = 0;
  for (let i = 0; i < n; i += 2) {
    if (bytes[i] === 0) evenZero++;
    if (bytes[i + 1] === 0) oddZero++;
  }
  const half = n / 2;
  if (oddZero > half * 0.6 && evenZero < half * 0.1) return 'utf-16le';
  if (evenZero > half * 0.6 && oddZero < half * 0.1) return 'utf-16be';
  return null;
}

// -> { text, encoding, bom, detected, firstBadByte, note }
export function decode(bytes, encoding = 'auto') {
  if (!(bytes instanceof Uint8Array)) throw new CsvFixError('The file must be bytes.');
  let bom = null;
  if (bytes[0] === 0xEF && bytes[1] === 0xBB && bytes[2] === 0xBF) bom = 'utf-8';
  else if (bytes[0] === 0xFF && bytes[1] === 0xFE) bom = 'utf-16le';
  else if (bytes[0] === 0xFE && bytes[1] === 0xFF) bom = 'utf-16be';
  const body = bom === 'utf-8' ? bytes.subarray(3) : bom ? bytes.subarray(2) : bytes;
  let enc = encoding;
  let detected = false;
  let firstBadByte = null;
  let note = null;
  if (enc === 'auto') {
    detected = true;
    if (bom) enc = bom;
    else if (looksUtf16(bytes)) enc = looksUtf16(bytes);
    else {
      const bad = firstBadUtf8(body);
      if (bad === -1) enc = 'utf-8';
      else {
        enc = 'windows-1252';
        firstBadByte = bad;
        note = `Not valid UTF-8 (byte 0x${body[bad].toString(16).toUpperCase().padStart(2, '0')} at offset ${bad.toLocaleString('en-US')}), so it was read as Windows-1252.`;
      }
    }
  }
  let text;
  if (enc === 'utf-8') {
    const bad = firstBadUtf8(body);
    if (bad !== -1) throw new CsvFixError(`The file is not valid UTF-8: byte 0x${body[bad].toString(16).toUpperCase().padStart(2, '0')} at offset ${bad.toLocaleString('en-US')}. Choose Windows-1252, or leave the encoding on automatic.`, 'encoding');
    text = utf8Decode(body);
  } else if (enc === 'windows-1252') text = cp1252Decode(body);
  else if (enc === 'utf-16le') text = utf16Decode(bom === 'utf-16le' ? body : bytes, true);
  else if (enc === 'utf-16be') text = utf16Decode(bom === 'utf-16be' ? body : bytes, false);
  else throw new CsvFixError(`Encoding must be one of ${ENCODINGS.join(', ')}.`, 'encoding');
  return { text, encoding: enc, bom: bom !== null, detected, firstBadByte, note };
}

export const OUTPUT_ENCODINGS = ['utf-8-bom', 'utf-8', 'windows-1252'];

// -> { bytes, unmappable } ; unmappable counts characters written as "?" in Windows-1252.
export function encode(text, encoding = 'utf-8-bom') {
  if (encoding === 'windows-1252') {
    const out = new Uint8Array(text.length);
    let unmappable = 0;
    let n = 0;
    for (const ch of text) {
      const b = CP1252_BYTE.get(ch.codePointAt(0));
      if (b === undefined) { out[n++] = 0x3F; unmappable++; } else out[n++] = b;
    }
    return { bytes: out.subarray(0, n), unmappable };
  }
  const parts = [];
  if (encoding === 'utf-8-bom') parts.push(0xEF, 0xBB, 0xBF);
  const bytes = new Uint8Array(text.length * 3 + parts.length);
  let n = 0;
  for (const p of parts) bytes[n++] = p;
  for (const ch of text) {
    const cp = ch.codePointAt(0);
    if (cp < 0x80) bytes[n++] = cp;
    else if (cp < 0x800) { bytes[n++] = 0xC0 | (cp >> 6); bytes[n++] = 0x80 | (cp & 0x3F); } else if (cp < 0x10000) { bytes[n++] = 0xE0 | (cp >> 12); bytes[n++] = 0x80 | ((cp >> 6) & 0x3F); bytes[n++] = 0x80 | (cp & 0x3F); } else { bytes[n++] = 0xF0 | (cp >> 18); bytes[n++] = 0x80 | ((cp >> 12) & 0x3F); bytes[n++] = 0x80 | ((cp >> 6) & 0x3F); bytes[n++] = 0x80 | (cp & 0x3F); }
  }
  return { bytes: bytes.slice(0, n), unmappable: 0 };
}

// ---------- 2. mojibake ----------

// A lead character of a two-, three- or four-byte UTF-8 sequence read as Windows-1252 (Â to ô), then
// a continuation byte read the same way (0x80 to 0xBF: the C1 range shows as € ‚ ƒ ... Ÿ).
const CONT = '\u0080-\u00BF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u20AC\u2122';
const MOJIBAKE = new RegExp(`[\u00C2-\u00F4][${CONT}]`);

// Text that was UTF-8 read as Windows-1252, turned back; null when it is not that (any character
// that is not a Windows-1252 byte, or bytes that are not valid UTF-8, or nothing non-ASCII results).
export function unmojibake(s) {
  if (!MOJIBAKE.test(s)) return null;
  let current = s;
  for (let round = 0; round < 2 && MOJIBAKE.test(current); round++) {
    const bytes = new Uint8Array(current.length);
    let n = 0;
    for (const ch of current) {
      const b = CP1252_BYTE.get(ch.codePointAt(0));
      if (b === undefined) return round ? current : null;
      bytes[n++] = b;
    }
    const raw = bytes.subarray(0, n);
    if (firstBadUtf8(raw) !== -1) return round ? current : null;
    const next = utf8Decode(raw);
    if (next === current || !/[^\x00-\x7F]/.test(next)) return round ? current : null;
    current = next;
  }
  return current === s ? null : current;
}

// ---------- 3. CSV ----------

export const DELIMITERS = [',', ';', '\t', '|'];
export const DELIMITER_NAMES = { ',': 'comma', ';': 'semicolon', '\t': 'tab', '|': 'pipe' };

// RFC 4180, leniently: a quote inside an unquoted field is kept as written; an unterminated quote
// runs to the end of the file and is reported. -> { rows: [[field]], lines: [first line of each
// row], problems: [{ line, message }] }
export function parseCsv(text, delimiter, { maxRows = Infinity } = {}) {
  const rows = [];
  const lines = [];
  const problems = [];
  let row = [];
  let field = '';
  let i = 0;
  let line = 1;
  let rowLine = 1;
  let quoted = false;
  let quoteLine = 0;
  let atStart = true; // at the start of a field
  const n = text.length;
  const endRow = () => {
    row.push(field);
    rows.push(row);
    lines.push(rowLine);
    row = [];
    field = '';
    atStart = true;
  };
  while (i < n) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false;
        i++;
        continue;
      }
      if (c === '\n' || (c === '\r' && text[i + 1] !== '\n')) line++;
      field += c;
      i++;
      continue;
    }
    if (c === '"' && atStart) { quoted = true; quoteLine = line; atStart = false; i++; continue; }
    if (c === delimiter) { row.push(field); field = ''; atStart = true; i++; continue; }
    if (c === '\r' || c === '\n') {
      endRow();
      if (rows.length >= maxRows) return { rows, lines, problems, truncated: true };
      i += c === '\r' && text[i + 1] === '\n' ? 2 : 1;
      line++;
      rowLine = line;
      continue;
    }
    field += c;
    atStart = false;
    i++;
  }
  if (quoted) problems.push({ line: quoteLine, message: 'a quote opened here is never closed, so the rest of the file is one field' });
  if (field !== '' || row.length) endRow();
  return { rows, lines, problems, truncated: false };
}

// The delimiter that splits the first records into the same number of fields (more than one),
// preferring the most fields; ties go comma, semicolon, tab, pipe.
export function sniffDelimiter(text) {
  let best = { d: ',', score: -1, fields: 1 };
  for (const d of DELIMITERS) {
    const { rows } = parseCsv(text, d, { maxRows: LIMITS.sniffRecords });
    const counts = rows.filter((r) => !(r.length === 1 && r[0] === '')).map((r) => r.length);
    if (!counts.length) continue;
    const tally = new Map();
    for (const c of counts) tally.set(c, (tally.get(c) ?? 0) + 1);
    const [mode, times] = [...tally].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0];
    if (mode < 2) continue;
    const score = times / counts.length;
    if (score > best.score + 1e-9 || (Math.abs(score - best.score) < 1e-9 && mode > best.fields)) best = { d, score, fields: mode };
  }
  return best.score < 0 ? ',' : best.d;
}

// A header's key for matching a recipe: case, spaces and a stray BOM do not matter.
export const headerKey = (h) => String(h).replace(/^\uFEFF/, '').trim().toLowerCase().replace(/\s+/g, ' ');

// FNV-1a over the header keys: a short name for the shape of an export.
export function signature(headers) {
  let h = 0x811C9DC5;
  for (const ch of headers.map(headerKey).join('\u0001')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

// RFC 4180 writer: a field with the delimiter, a quote or a line break is quoted, quotes doubled.
export function writeCsv(rows, { delimiter = ',', lineEnd = '\r\n' } = {}) {
  const field = (v) => {
    const s = v ?? '';
    return s.includes(delimiter) || /["\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(field).join(delimiter)).join(lineEnd) + (rows.length ? lineEnd : '');
}

// ---------- 4. values ----------

const MONTHS = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
const monthOf = (word) => {
  const w = word.toLowerCase().replace(/\.$/, '');
  if (w === 'sept') return 9;
  const i = MONTHS.findIndex((m) => m === w || (w.length === 3 && m.startsWith(w)));
  return i === -1 ? null : i + 1;
};
const WEEKDAY = '(?:mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)(?:day|sday|nesday|rsday|urday)?\\.?,?\\s+';
const TIME = '(?:[ T](\\d{1,2}:\\d{2}(?::\\d{2}(?:\\.\\d{1,6})?)?(?:\\s?[AaPp][Mm])?(?:Z|[+-]\\d{2}:?\\d{2})?))?';
const NUM3 = new RegExp(`^(\\d{1,4})([/.-])(\\d{1,2})\\2(\\d{2}|\\d{4})${TIME}$`);
const DMY_NAMED = new RegExp(`^(?:${WEEKDAY})?(\\d{1,2})(?:st|nd|rd|th)?[\\s-]+([A-Za-z]{3,9}\\.?)[\\s,-]+(\\d{2}|\\d{4})${TIME}$`, 'i');
const MDY_NAMED = new RegExp(`^(?:${WEEKDAY})?([A-Za-z]{3,9}\\.?)[\\s-]+(\\d{1,2})(?:st|nd|rd|th)?,?[\\s-]+(\\d{2}|\\d{4})${TIME}$`, 'i');

// Excel's rule for two-digit years in imported dates (Microsoft, "How Excel works with two-digit
// year numbers"): 00 to 29 are 2000 to 2029, 30 to 99 are 1930 to 1999.
export const fullYear = (y) => (y.length === 4 ? Number(y) : Number(y) <= 29 ? 2000 + Number(y) : 1900 + Number(y));
const daysIn = (y, m) => [31, (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1];
const realDate = (y, m, d) => y >= 1 && y <= 9999 && m >= 1 && m <= 12 && d >= 1 && d <= daysIn(y, m);

// What a value says as a date, before any order is chosen:
//   { form: 'ymd' | 'named', y, m, d, time, twoDigitYear }   settled by the value itself
//   { form: 'dm-md', a, b, y, time, twoDigitYear }            a/b/y: which of a, b is the day is open
//   null                                                      not a date
export function readDate(raw) {
  const s = raw.trim();
  if (!s || s.length > 40) return null;
  let m = NUM3.exec(s);
  if (m) {
    const [, p1, , p2, p3, time] = m;
    if (p1.length === 4) {
      const y = Number(p1);
      const mo = Number(p2);
      const d = Number(p3);
      return p3.length <= 2 && realDate(y, mo, d) ? { form: 'ymd', y, m: mo, d, time: time ?? null, twoDigitYear: false } : null;
    }
    if (p1.length > 2) return null;
    return { form: 'dm-md', a: Number(p1), b: Number(p2), y: fullYear(p3), time: time ?? null, twoDigitYear: p3.length === 2 };
  }
  m = DMY_NAMED.exec(s);
  if (m) {
    const mo = monthOf(m[2]);
    const y = fullYear(m[3]);
    if (mo && realDate(y, mo, Number(m[1]))) return { form: 'named', y, m: mo, d: Number(m[1]), time: m[4] ?? null, twoDigitYear: m[3].length === 2 };
    return null;
  }
  m = MDY_NAMED.exec(s);
  if (m) {
    const mo = monthOf(m[1]);
    const y = fullYear(m[3]);
    if (mo && realDate(y, mo, Number(m[2]))) return { form: 'named', y, m: mo, d: Number(m[2]), time: m[4] ?? null, twoDigitYear: m[3].length === 2 };
  }
  return null;
}

// What a/b/y proves about the order: 'dmy' (a is above 12), 'mdy' (b is above 12), 'same' (a = b,
// the date is the same read either way), 'ambiguous' (both 12 or below), 'invalid'.
export function proofOf(p) {
  const asDmy = realDate(p.y, p.b, p.a);
  const asMdy = realDate(p.y, p.a, p.b);
  if (asDmy && asMdy) return p.a === p.b ? 'same' : 'ambiguous';
  if (asDmy) return 'dmy';
  if (asMdy) return 'mdy';
  return 'invalid';
}

const pad2 = (n) => String(n).padStart(2, '0');
export const DATE_FORMATS = ['iso', 'mdy', 'dmy'];
export const DATE_FORMAT_NAMES = { iso: 'YYYY-MM-DD', mdy: 'MM/DD/YYYY', dmy: 'DD/MM/YYYY' };
export function formatDate(y, m, d, format = 'iso') {
  const yyyy = String(y).padStart(4, '0');
  if (format === 'mdy') return `${pad2(m)}/${pad2(d)}/${yyyy}`;
  if (format === 'dmy') return `${pad2(d)}/${pad2(m)}/${yyyy}`;
  return `${yyyy}-${pad2(m)}-${pad2(d)}`;
}

const DIGITS = /^\d+$/;
const ZIP_HEADER = /\b(?:zip|zipcode|zip code|postal|postcode|post code)\b/i;
const ZIP_HEADER_LOOSE = /zip|postal|postcode/i;
const SCI_DAMAGED = /^[1-9](?:\.\d{1,14})?E\+(1[5-9]|[2-9]\d)$/i;
const EXCEL_DATE_TEXT = /^(?:\d{1,2}-(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)-\d{2})$/i;
const CURRENCY = /[$£€₹¥]/;
const AMOUNT = /^\(?-?\s*[$£€₹¥]?\s*-?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?\s*[$£€₹¥]?\)?-?$/;
const AMOUNT_DECIMAL_COMMA = /^\(?-?\s*[$£€₹¥]?\s*-?(?:\d{1,3}(?:\.\d{3})+|\d+),\d+\s*[$£€₹¥]?\)?-?$/;

// A ZIP code (5 digits) or ZIP+4 restored to its width: "2134" -> "02134", "2134-1234" ->
// "02134-1234", "21341234" -> "021341234". Null when the value is not a ZIP shape at all.
export function restoreZip(v) {
  if (/^\d{1,5}$/.test(v)) return v.padStart(5, '0');
  let m = /^(\d{1,5})-(\d{4})$/.exec(v);
  if (m) return `${m[1].padStart(5, '0')}-${m[2]}`;
  if (/^\d{6,9}$/.test(v)) return v.padStart(9, '0');
  m = /^(\d{1,5}) (\d{4})$/.exec(v);
  if (m) return `${m[1].padStart(5, '0')}-${m[2]}`;
  return null;
}

// An amount as a plain number: "$1,200.50" -> "1200.50", "(45.00)" -> "-45.00", "45.00-" ->
// "-45.00", "1.234,56" -> "1234.56" with a decimal comma. Null when it is not an amount.
export function plainAmount(v, decimal = '.') {
  const s = v.trim();
  if (!(decimal === ',' ? AMOUNT_DECIMAL_COMMA : AMOUNT).test(s)) return null;
  let neg = false;
  let t = s;
  if (/^\(.*\)$/.test(t)) { neg = true; t = t.slice(1, -1); }
  if (/-$/.test(t)) { neg = !neg; t = t.slice(0, -1); }
  t = t.replace(/[$£€₹¥\s]/g, '');
  if (t.startsWith('-')) { neg = !neg; t = t.slice(1); }
  t = decimal === ',' ? t.replace(/\./g, '').replace(',', '.') : t.replace(/,/g, '');
  if (!/^\d+(?:\.\d+)?$/.test(t)) return null;
  return (neg && !/^0+(?:\.0+)?$/.test(t) ? '-' : '') + t;
}

// ---------- analysis ----------

const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

function analyseColumn(name, values) {
  const filled = values.map((v) => v.trim()).filter((v) => v !== '');
  const col = { name, values: filled.length, blanks: values.length - filled.length, kind: 'text' };
  if (!filled.length) { col.kind = 'empty'; return col; }

  // Dates.
  const proofs = { dmy: 0, mdy: 0, ambiguous: 0, same: 0, invalid: 0, ymd: 0, named: 0 };
  let dated = 0;
  let twoDigit = 0;
  for (const v of filled) {
    const p = readDate(v);
    if (!p) continue;
    dated++;
    if (p.twoDigitYear) twoDigit++;
    if (p.form === 'ymd') proofs.ymd++;
    else if (p.form === 'named') proofs.named++;
    else proofs[proofOf(p)]++;
  }
  if (dated && dated >= filled.length * 0.9 && dated - proofs.invalid > 0) {
    col.kind = 'date';
    const order = proofs.dmy && proofs.mdy ? 'mixed' : proofs.dmy ? 'dmy' : proofs.mdy ? 'mdy' : proofs.ambiguous ? 'unknown' : 'settled';
    col.date = { order, proofs, notDates: filled.length - dated, twoDigitYears: twoDigit };
    return col;
  }

  // Codes, ZIP codes, long IDs.
  const digits = filled.filter((v) => DIGITS.test(v));
  const zipShaped = filled.filter((v) => restoreZip(v) !== null).length;
  if (ZIP_HEADER.test(name) || (ZIP_HEADER_LOOSE.test(name) && zipShaped === filled.length)) {
    if (zipShaped >= filled.length * 0.9) {
      col.kind = 'zip';
      col.zip = { short: filled.filter((v) => restoreZip(v) !== null && restoreZip(v) !== v.replace(' ', '-')).length, notZip: filled.length - zipShaped };
      return col;
    }
  }
  const sci = filled.filter((v) => SCI_DAMAGED.test(v)).length;
  if (digits.length === filled.length || (sci && digits.length + sci === filled.length)) {
    const lens = digits.map((v) => v.length);
    const zeros = digits.filter((v) => v.length > 1 && v.startsWith('0')).length;
    const long = digits.filter((v) => v.length >= 16).length;
    const fifteen = digits.filter((v) => v.length === 15 && /0{1,}$/.test(v)).length;
    const tally = new Map();
    for (const l of lens) tally.set(l, (tally.get(l) ?? 0) + 1);
    const [width, times] = [...tally].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0] ?? [0, 0];
    const shorter = lens.filter((l) => l < width).length;
    const longer = lens.filter((l) => l > width).length;
    col.code = { leadingZeros: zeros, longIds: long, damaged: sci, minLength: Math.min(...lens), maxLength: Math.max(...lens), width, atWidth: times, shorter, longer, fifteenDigitEndingZero: fifteen };
    // A width is only suggested, never applied: most values share it, the rest are shorter.
    if (width >= 3 && shorter && !longer && times >= digits.length * 0.8) col.code.suggestWidth = width;
    col.kind = long || sci ? 'long-id' : zeros || col.code.suggestWidth ? 'code' : 'number';
    return col;
  }

  // Amounts written with symbols, digit-grouping commas, parentheses or a decimal comma.
  const amounts = filled.filter((v) => AMOUNT.test(v.trim()));
  const commaDecimal = filled.filter((v) => AMOUNT_DECIMAL_COMMA.test(v.trim()) && !AMOUNT.test(v.trim())).length;
  if (amounts.length + commaDecimal === filled.length) {
    const styled = filled.filter((v) => CURRENCY.test(v) || /,\d{3}/.test(v) || /^\(.*\)$/.test(v.trim()) || /-$/.test(v.trim())).length;
    col.kind = 'number';
    col.amount = { styled, decimalComma: commaDecimal };
    return col;
  }

  col.excelDates = filled.filter((v) => EXCEL_DATE_TEXT.test(v)).length;
  col.damaged = sci;
  return col;
}

// The suggested rule for a column: what a fix would do with no recipe.
function suggestRule(col) {
  if (col.kind === 'date') {
    const r = { type: 'date' };
    if (col.date.order === 'dmy' || col.date.order === 'mdy') r.order = col.date.order;
    else if (col.date.order === 'mixed') { r.order = 'mixed'; r.ambiguous = 'leave'; } else if (col.date.order === 'unknown') r.order = 'ask';
    return r;
  }
  if (col.kind === 'zip') return { type: 'zip' };
  if (col.kind === 'code' || col.kind === 'long-id') return { type: 'code' };
  return { type: 'keep' };
}

export const COLUMN_TYPES = ['keep', 'date', 'zip', 'code', 'number'];
export const DATE_ORDERS = ['dmy', 'mdy', 'mixed', 'ask'];
export const AMBIGUOUS = ['leave', 'dmy', 'mdy'];

export const DEFAULT_OUTPUT = { encoding: 'utf-8-bom', delimiter: ',', lineEnd: 'crlf', dates: 'iso', excelGuard: false };

// Reads the file and works out every column. recipe: an earlier recipe (its input settings are used,
// its rules are compared with what this file holds).
export function read(bytes, recipe = null) {
  if (bytes.length > LIMITS.bytes) throw new CsvFixError(`The file is ${bytes.length.toLocaleString('en-US')} bytes; one call takes at most ${LIMITS.bytes.toLocaleString('en-US')} (2 MB). Split it into parts.`);
  if (!bytes.length) throw new CsvFixError('The file is empty.');
  const input = { encoding: 'auto', delimiter: 'auto', header: true, repairMojibake: true, ...(recipe?.input ?? {}) };
  const dec = decode(bytes, input.encoding);
  if (dec.text.includes('\u0000')) throw new CsvFixError('The file holds null bytes, so it is not a text CSV (an .xlsx, a PDF or UTF-16 read the wrong way). Save it as CSV first, or choose the encoding.');
  const delimiter = input.delimiter === 'auto' ? sniffDelimiter(dec.text) : input.delimiter;
  const parsed = parseCsv(dec.text, delimiter, { maxRows: LIMITS.rows + 2 });
  // A file that ends with a line break has no empty last record; blank lines in the middle are kept.
  let rows = parsed.rows;
  while (rows.length && rows[rows.length - 1].length === 1 && rows[rows.length - 1][0] === '') rows = rows.slice(0, -1);
  if (!rows.length) throw new CsvFixError('The file has no rows.');
  if (rows.length > LIMITS.rows + 1) throw new CsvFixError(`The file has more than ${LIMITS.rows.toLocaleString('en-US')} rows; split it into parts.`);
  const width = Math.max(...rows.map((r) => r.length));
  if (width > LIMITS.columns) throw new CsvFixError(`The file has ${width} columns; at most ${LIMITS.columns}.`);

  // Mojibake, field by field.
  let mojibake = 0;
  const repairs = [];
  if (input.repairMojibake) {
    rows = rows.map((r, ri) => r.map((v, ci) => {
      const fixed = unmojibake(v);
      if (fixed === null) return v;
      mojibake++;
      repairs.push({ row: ri, col: ci, before: v, after: fixed });
      return fixed;
    }));
  }

  const headerRow = input.header ? rows[0].map((h, i) => h.replace(/^\uFEFF/, '').trim() || `Column ${i + 1}`) : [];
  const headers = Array.from({ length: width }, (_, i) => (input.header ? headerRow[i] ?? `Column ${i + 1}` : `Column ${i + 1}`));
  // Two columns with the same heading are told apart by position.
  const seen = new Map();
  const names = headers.map((h) => {
    const k = headerKey(h);
    const n = (seen.get(k) ?? 0) + 1;
    seen.set(k, n);
    return n === 1 ? h : `${h} (${n})`;
  });
  const data = input.header ? rows.slice(1) : rows;
  const dataLines = input.header ? parsed.lines.slice(1) : parsed.lines;
  const ragged = [];
  // A row is ragged when its field count differs from the header's (or, without a header, from
  // the count most rows have).
  const counts = new Map();
  for (const r of data) counts.set(r.length, (counts.get(r.length) ?? 0) + 1);
  const expected = input.header ? rows[0].length : [...counts].sort((a, b) => b[1] - a[1] || b[0] - a[0])[0]?.[0] ?? width;
  data.forEach((r, i) => { if (r.length !== expected && !(r.length === 1 && r[0] === '')) ragged.push({ line: dataLines[i], fields: r.length, expected }); });
  const nonAscii = data.reduce((n, r) => n + r.filter((v) => /[^\x00-\x7F]/.test(v)).length, 0);
  const columns = names.map((name, ci) => ({ index: ci, ...analyseColumn(name, data.map((r) => r[ci] ?? '')) }));
  for (const c of columns) c.suggested = suggestRule(c);

  return {
    encoding: dec.encoding,
    bom: dec.bom,
    encodingDetected: dec.detected,
    encodingNote: dec.note,
    delimiter,
    header: input.header,
    input,
    headers: names,
    signature: signature(names),
    rows: data,
    rowLines: dataLines,
    headerRow: input.header ? rows[0].map((h, i) => (i === 0 ? h.replace(/^\uFEFF/, '') : h)) : null,
    width,
    columns,
    mojibake,
    nonAscii,
    repairs,
    ragged,
    problems: parsed.problems,
  };
}

// The recipe (settings only) that fixes this file: the input settings that read it, the output
// choices, and one rule per column, keyed by its heading.
export function suggestRecipe(file, output = {}) {
  return {
    v: 1,
    signature: file.signature,
    headers: file.headers,
    input: { encoding: file.encodingDetected ? 'auto' : file.encoding, delimiter: file.delimiter, header: file.header, repairMojibake: file.input.repairMojibake },
    output: { ...DEFAULT_OUTPUT, ...output },
    columns: Object.fromEntries(file.columns.filter((c) => c.suggested.type !== 'keep').map((c) => [c.name, c.suggested])),
  };
}

// How this file's columns differ from the recipe's: missing, added, moved.
export function drift(file, recipe) {
  if (!recipe?.headers) return null;
  const now = file.headers.map(headerKey);
  const then = recipe.headers.map(headerKey);
  const missing = recipe.headers.filter((h) => !now.includes(headerKey(h)));
  const added = file.headers.filter((h) => !then.includes(headerKey(h)));
  const common = now.filter((k) => then.includes(k));
  const moved = common.join('|') !== then.filter((k) => now.includes(k)).join('|');
  return { same: !missing.length && !added.length && !moved, missing, added, moved, signatureThen: recipe.signature ?? signature(recipe.headers), signatureNow: file.signature };
}

// The rule each column gets: the recipe's, matched by heading; else what the file suggests.
export function rulesFor(file, recipe) {
  const byKey = new Map(Object.entries(recipe?.columns ?? {}).map(([k, v]) => [headerKey(k), v]));
  const known = new Set((recipe?.headers ?? []).map(headerKey));
  return file.columns.map((c) => {
    const k = headerKey(c.name);
    if (byKey.has(k)) return { ...byKey.get(k), from: 'recipe' };
    // A column the recipe knew but gave no rule is kept as written; a new one gets the suggestion.
    if (recipe && known.has(k)) return { type: 'keep', from: 'recipe' };
    return { ...c.suggested, from: recipe ? 'new' : 'suggested' };
  });
}

// One value through one rule -> { value, rule } (rule: why it changed) or { value, flag } (left as
// written, with the reason).
export function fixValue(raw, rule, out) {
  const v = raw.trim();
  if (v === '') return { value: raw };
  if (rule.type === 'date') {
    const p = readDate(v);
    if (!p) return { value: raw, flag: 'not a date' };
    const tail = p.time ? ` ${p.time}` : '';
    if (p.form !== 'dm-md') {
      const value = formatDate(p.y, p.m, p.d, out.dates) + tail;
      return value === raw ? { value } : { value, rule: p.form === 'named' ? 'date-named' : 'date-ymd' };
    }
    const proof = proofOf(p);
    if (proof === 'invalid') return { value: raw, flag: 'not a real date either way' };
    let order;
    if (proof === 'dmy' || proof === 'mdy') {
      if ((rule.order === 'dmy' || rule.order === 'mdy') && rule.order !== proof) return { value: raw, flag: `reads only as ${proof === 'dmy' ? 'DD/MM' : 'MM/DD'}, against the recipe's ${rule.order === 'dmy' ? 'DD/MM' : 'MM/DD'}` };
      order = proof;
    } else if (proof === 'same') order = 'dmy';
    else if (rule.order === 'dmy' || rule.order === 'mdy') order = rule.order;
    else if (rule.order === 'mixed' && (rule.ambiguous === 'dmy' || rule.ambiguous === 'mdy')) order = rule.ambiguous;
    else return { value: raw, flag: 'ambiguous' };
    const [d, m] = order === 'dmy' ? [p.a, p.b] : [p.b, p.a];
    const value = formatDate(p.y, m, d, out.dates) + tail;
    const why = proof === 'dmy' || proof === 'mdy' ? `date-proved-${proof}` : proof === 'same' ? 'date-same' : rule.order === 'mixed' ? `date-ambiguous-${order}` : `date-column-${order}`;
    return value === raw ? { value } : { value, rule: why };
  }
  if (rule.type === 'zip') {
    const z = restoreZip(v);
    if (z === null) return { value: raw, flag: 'not a ZIP code' };
    const value = out.excelGuard ? `="${z}"` : z;
    return value === raw ? { value } : { value, rule: z !== v ? 'zip-restored' : 'excel-guard' };
  }
  if (rule.type === 'code') {
    if (SCI_DAMAGED.test(v)) return { value: raw, flag: 'already turned into scientific notation; the lost digits are not in the file' };
    let z = v;
    let why = null;
    if (rule.width && DIGITS.test(v)) {
      if (v.length < rule.width) { z = v.padStart(rule.width, '0'); why = 'zeros-restored'; } else if (v.length > rule.width) return { value: raw, flag: `longer than the width ${rule.width}` };
    }
    const value = out.excelGuard && DIGITS.test(z) ? `="${z}"` : z;
    return value === raw ? { value } : { value, rule: why ?? 'excel-guard' };
  }
  if (rule.type === 'number') {
    const n = plainAmount(v, rule.decimal ?? '.');
    if (n === null) return { value: raw, flag: 'not an amount' };
    return n === raw ? { value: raw } : { value: n, rule: 'amount-plain' };
  }
  return { value: raw };
}

export const RULE_WORDS = {
  'date-named': 'date with a month name rewritten',
  'date-ymd': 'year-first date rewritten',
  'date-proved-dmy': 'date proven DD/MM by its own day',
  'date-proved-mdy': 'date proven MM/DD by its own day',
  'date-same': 'date that reads the same either way',
  'date-column-dmy': 'date read as DD/MM by its column\'s order',
  'date-column-mdy': 'date read as MM/DD by its column\'s order',
  'date-ambiguous-dmy': 'ambiguous date read as DD/MM by the recipe',
  'date-ambiguous-mdy': 'ambiguous date read as MM/DD by the recipe',
  'zip-restored': 'ZIP code zeros restored',
  'zeros-restored': 'leading zeros restored to the stated width',
  'excel-guard': 'written as ="..." so Excel keeps it as text',
  'amount-plain': 'amount written as a plain number',
  mojibake: 'garbled accents repaired',
};

// Applies the rules to every row. -> { rows, changes: [{ line, column, before, after, rule }],
// counts: { rule: n }, flags: { column: { reason: { n, lines } } } }
export function applyRules(file, rules, out) {
  const counts = {};
  const changes = [];
  const flags = {};
  const changed = new Set();
  const rows = file.rows.map((r, ri) => r.map((raw, ci) => {
    const rule = rules[ci];
    if (!rule || rule.type === 'keep') return raw;
    const res = fixValue(raw, rule, out);
    if (res.rule) {
      counts[res.rule] = (counts[res.rule] ?? 0) + 1;
      changed.add(ri);
      if (changes.length < LIMITS.changeRows) changes.push({ line: file.rowLines[ri], col: ci, column: file.headers[ci], before: raw, after: res.value, rule: res.rule });
    } else if (res.flag) {
      const name = file.headers[ci];
      flags[name] ??= {};
      const f = (flags[name][res.flag] ??= { n: 0, lines: [] });
      f.n++;
      if (f.lines.length < 20) f.lines.push(file.rowLines[ri]);
    }
    return res.value;
  }));
  for (const rep of file.repairs) {
    if (file.header && rep.row === 0) continue;
    const ri = file.header ? rep.row - 1 : rep.row;
    counts.mojibake = (counts.mojibake ?? 0) + 1;
    changed.add(ri);
    if (changes.length < LIMITS.changeRows) changes.push({ line: file.rowLines[ri], col: rep.col, column: file.headers[rep.col], before: rep.before, after: rep.after, rule: 'mojibake' });
  }
  changes.sort((a, b) => a.line - b.line || a.col - b.col);
  return { rows, changes, counts, flags, rowsChanged: changed.size };
}

const lineEndOf = (le) => (le === 'lf' ? '\n' : '\r\n');

// ---------- sentences ----------

function encodingWords(file) {
  if (file.encoding === 'utf-8') return file.bom ? 'UTF-8 with a BOM' : 'UTF-8 without a BOM';
  return ENCODING_NAMES[file.encoding] + (file.bom ? ' with a BOM' : '');
}

const ORDER_WORDS = { dmy: 'DD/MM', mdy: 'MM/DD' };

// What the scan found, in one paragraph.
export function scanSentence(file, rules) {
  const parts = [];
  const zips = file.columns.filter((c, i) => rules[i].type === 'zip' && c.zip?.short);
  for (const c of zips) parts.push(`${plural(c.zip.short, `ZIP code`)} in "${c.name}" lost ${c.zip.short === 1 ? 'its' : 'their'} leading zero`);
  const codes = file.columns.filter((c) => c.code?.leadingZeros && c.kind !== 'zip');
  if (codes.length) parts.push(`${plural(codes.length, 'column')} of codes with leading zeros to keep as text (${codes.map((c) => `"${c.name}"`).join(', ')})`);
  const longs = file.columns.filter((c) => c.code?.longIds);
  if (longs.length) parts.push(`${plural(longs.reduce((n, c) => n + c.code.longIds, 0), 'ID')} of 16 or more digits that Excel would cut to 15`);
  for (const c of file.columns.filter((x) => x.kind === 'date')) {
    const p = c.date.proofs;
    if (c.date.order === 'dmy' || c.date.order === 'mdy') parts.push(`dates in "${c.name}" read ${ORDER_WORDS[c.date.order]} (${plural(p[c.date.order], 'value')} prove${p[c.date.order] === 1 ? 's' : ''} it)`);
    else if (c.date.order === 'mixed') parts.push(`"${c.name}" mixes DD/MM (${p.dmy}) and MM/DD (${p.mdy}) dates, with ${plural(p.ambiguous, 'ambiguous value')} to settle`);
    else if (c.date.order === 'unknown') parts.push(`"${c.name}" has ${plural(p.ambiguous, 'date')} that could be DD/MM or MM/DD and none that proves which`);
    else if (p.named || p.ymd) parts.push(`dates in "${c.name}" are written ${p.named ? 'with month names' : 'year first'}`);
  }
  const damaged = file.columns.reduce((n, c) => n + (c.code?.damaged ?? 0) + (c.damaged ?? 0), 0);
  if (damaged) parts.push(`${plural(damaged, 'value')} already in scientific notation (1.23E+15), whose lost digits are not in the file`);
  const excelDates = file.columns.reduce((n, c) => n + (c.excelDates ?? 0), 0);
  if (excelDates) parts.push(`${plural(excelDates, 'value')} that look like Excel turned them into dates (such as 1-Mar)`);
  const styled = file.columns.filter((x) => x.amount?.styled);
  if (styled.length) parts.push(`${plural(styled.reduce((n, x) => n + x.amount.styled, 0), 'amount')} written with currency signs, digit-grouping commas or brackets in ${styled.map((x) => `"${x.name}"`).join(', ')} (a recipe can write them as plain numbers)`);
  if (file.encoding === 'windows-1252' && file.nonAscii) parts.push(`${plural(file.nonAscii, 'value')} with accents or symbols to convert to UTF-8`);
  else if (file.encoding === 'utf-8' && !file.bom && file.nonAscii) parts.push(`${plural(file.nonAscii, 'value')} with accents or symbols that Excel shows garbled unless the file has a BOM`);
  if (file.mojibake) parts.push(`${plural(file.mojibake, 'value')} with garbled accents (such as Ã© for é) to repair`);
  const head = `Your file is ${encodingWords(file)}, ${DELIMITER_NAMES[file.delimiter]}-separated, with ${plural(file.rows.length, 'row')} and ${plural(file.width, 'column')}`;
  return parts.length ? `${head}: ${parts.join('; ')}.` : `${head}, and nothing in it needs fixing.`;
}

export function fixSentence(file, applied, out, written) {
  const c = applied.counts;
  const dates = Object.entries(c).filter(([k]) => k.startsWith('date-')).reduce((n, [, v]) => n + v, 0);
  const parts = [];
  if (c['zip-restored']) parts.push(`${plural(c['zip-restored'], 'ZIP code')} restored to full width`);
  if (c['zeros-restored']) parts.push(`${plural(c['zeros-restored'], 'code')} given back ${c['zeros-restored'] === 1 ? 'its' : 'their'} leading zeros`);
  if (dates) parts.push(`${plural(dates, 'date')} written as ${DATE_FORMAT_NAMES[out.dates]}`);
  if (c['amount-plain']) parts.push(`${plural(c['amount-plain'], 'amount')} written as plain numbers`);
  if (c.mojibake) parts.push(`${plural(c.mojibake, 'garbled value')} repaired`);
  if (c['excel-guard']) parts.push(`${plural(c['excel-guard'], 'code')} written as ="..." for Excel`);
  const ambiguous = Object.values(applied.flags).reduce((n, f) => n + (f.ambiguous?.n ?? 0), 0);
  const other = Object.values(applied.flags).reduce((n, f) => n + Object.entries(f).filter(([k]) => k !== 'ambiguous').reduce((m, [, x]) => m + x.n, 0), 0);
  const kept = other ? ` ${plural(other, 'other value')} could not be fixed and ${other === 1 ? 'is' : 'are'} listed with ${other === 1 ? 'its line' : 'their lines'}.` : '';
  const tail = ambiguous ? ` ${plural(ambiguous, 'ambiguous date')} ${ambiguous === 1 ? 'was' : 'were'} left as written.` : '';
  const enc = { 'utf-8-bom': 'UTF-8 with a BOM', 'utf-8': 'UTF-8 without a BOM', 'windows-1252': 'Windows-1252' }[out.encoding];
  const unm = written.unmappable ? ` ${plural(written.unmappable, 'character')} had no Windows-1252 byte and became "?".` : '';
  return `Fixed ${plural(file.rows.length, 'row')}${parts.length ? `: ${parts.join(', ')}` : ', with nothing to change'}; saved as ${enc}.${tail}${kept}${unm}`;
}

// ---------- the two jobs ----------

function columnReport(file, rules) {
  return file.columns.map((c, i) => ({ ...c, rule: rules[i] }));
}

function preview(file, applied, n = LIMITS.previewRows) {
  return { headers: file.headers, before: file.rows.slice(0, n), after: applied.rows.slice(0, n) };
}

// Free: what is in the file and what a fix would do, with the first rows fixed.
export function scan(bytes, recipe = null, output = {}) {
  const file = read(bytes, recipe);
  const out = { ...DEFAULT_OUTPUT, ...(recipe?.output ?? {}), ...output };
  const rules = rulesFor(file, recipe);
  const applied = applyRules(file, rules, out);
  const suggested = { ...suggestRecipe(file, out), columns: usedColumns(file, rules) };
  return {
    op: 'scan',
    answer: scanSentence(file, rules),
    encoding: { name: file.encoding, bom: file.bom, detected: file.encodingDetected, note: file.encodingNote },
    delimiter: file.delimiter,
    rows: file.rows.length,
    columns: columnReport(file, rules),
    mojibake: file.mojibake,
    ragged: file.ragged.slice(0, 50),
    raggedCount: file.ragged.length,
    problems: file.problems,
    drift: drift(file, recipe),
    toDo: summariseToDo(file, rules, applied),
    preview: preview(file, applied),
    recipe: suggested,
    engine: ENGINE_VERSION,
  };
}

const stripFrom = ({ from, ...rest }) => { void from; return rest; };
const usedColumns = (file, rules) => Object.fromEntries(file.columns.map((c, i) => [c.name, stripFrom(rules[i])]).filter(([, r]) => r.type !== 'keep'));

function summariseToDo(file, rules, applied) {
  const ask = file.columns.filter((c, i) => rules[i].type === 'date' && rules[i].order === 'ask').map((c) => c.name);
  const widths = file.columns.filter((c, i) => c.code?.suggestWidth && !rules[i].width && rules[i].type !== 'zip').map((c) => ({ column: c.name, width: c.code.suggestWidth, shorter: c.code.shorter }));
  return { changes: applied.counts, rowsChanged: applied.rowsChanged, flags: applied.flags, chooseOrder: ask, widthsToConfirm: widths };
}

const changesCsv = (changes, out) => writeCsv([['line', 'column', 'before', 'after', 'rule'], ...changes.map((c) => [String(c.line), c.column, c.before, c.after, RULE_WORDS[c.rule] ?? c.rule])], { lineEnd: lineEndOf(out.lineEnd) });

// Paid: the whole file fixed. -> the scan's report plus the file's bytes and the change report.
export function fix(bytes, recipe = null, output = {}, { name = 'export.csv' } = {}) {
  const file = read(bytes, recipe);
  const out = { ...DEFAULT_OUTPUT, ...(recipe?.output ?? {}), ...output };
  const rules = rulesFor(file, recipe);
  const applied = applyRules(file, rules, out);
  const body = file.header ? [file.headerRow, ...applied.rows] : applied.rows;
  const text = writeCsv(body, { delimiter: out.delimiter, lineEnd: lineEndOf(out.lineEnd) });
  const written = encode(text, out.encoding);
  const used = { ...suggestRecipe(file, out), columns: usedColumns(file, rules) };
  const base = name.replace(/\.(csv|txt|tsv)$/i, '');
  return {
    op: 'fix',
    answer: fixSentence(file, applied, out, written),
    rows: file.rows.length,
    rowsChanged: applied.rowsChanged,
    counts: applied.counts,
    flags: applied.flags,
    drift: drift(file, recipe),
    columns: columnReport(file, rules),
    encoding: { read: file.encoding, readBom: file.bom, written: out.encoding },
    output: out,
    bytes: written.bytes,
    fileName: `${base}-fixed.csv`,
    changes: { rows: applied.changes.length, total: Object.values(applied.counts).reduce((a, b) => a + b, 0), csv: changesCsv(applied.changes, out), truncated: applied.changes.length >= LIMITS.changeRows },
    recipe: used,
    engine: ENGINE_VERSION,
  };
}
