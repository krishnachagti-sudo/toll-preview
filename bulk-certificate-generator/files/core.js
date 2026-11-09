// Bulk certificates: the pure engine shared by the page (live preview and the free proof PDF, both
// made in the browser) and the server (the clean PDF). No imports and no Node APIs, so the browser
// loads this same file. Deterministic: the same list and settings always give the same pages, the
// same sizes and the same bytes.
//
// One certificate is a "scene": a list of drawing items (text, lines, boxes, polygons, circles) in
// PDF points (1/72 inch) measured from the top-left corner of the page. The PDF writer at the end of
// this file and the page's SVG preview both draw the same scene, so what the preview shows is what
// prints.

export class CertError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'CertError';
    this.field = field ?? null;
  }
}

export const LIMITS = { rows: 2000, csvChars: 200_000, field: 120, title: 80, presented: 100, reason: 300, org: 100, date: 60, signer: 60, batch: 80 };
export const PAPERS = {
  letter: { name: 'US Letter', w: 612, h: 792, inches: '8.5 x 11 in' },
  a4: { name: 'A4', w: 595.28, h: 841.89, inches: '210 x 297 mm' },
};
export const ORIENTATIONS = ['landscape', 'portrait'];
export const SORTS = ['as-given', 'last-name', 'first-name', 'group', 'award'];
export const PT = 72;
// Everything printed stays at least this far inside the page edge: half an inch, twice the usual
// quarter-inch a desktop printer cannot reach.
export const SAFE = 0.5 * PT;

// ---------- type metrics ----------

// Advance widths (1/1000 em) of the standard PDF fonts for character codes 32 to 126 (Adobe's Core
// 14 font metrics), and for the Windows-1252 letters that do not decompose to an ASCII letter.
const W = {
  TR: [250, 333, 408, 500, 500, 833, 778, 180, 333, 333, 500, 564, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 278, 278, 564, 564, 564, 444, 921, 722, 667, 667, 722, 611, 556, 722, 722, 333, 389, 722, 611, 889, 722, 722, 556, 722, 667, 556, 611, 722, 722, 944, 722, 722, 611, 333, 278, 333, 469, 500, 333, 444, 500, 444, 500, 444, 333, 500, 500, 278, 278, 500, 278, 778, 500, 500, 500, 500, 333, 389, 278, 500, 500, 722, 500, 500, 444, 480, 200, 480, 541],
  TB: [250, 333, 555, 500, 500, 1000, 833, 278, 333, 333, 500, 570, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 333, 333, 570, 570, 570, 500, 930, 722, 667, 722, 722, 667, 611, 778, 778, 389, 500, 778, 667, 944, 722, 778, 611, 778, 722, 556, 667, 722, 722, 1000, 722, 722, 667, 333, 278, 333, 581, 500, 333, 500, 556, 444, 556, 444, 333, 500, 556, 278, 333, 556, 278, 833, 556, 500, 556, 556, 444, 389, 333, 556, 500, 722, 500, 500, 444, 394, 220, 394, 520],
  TI: [250, 333, 420, 500, 500, 833, 778, 214, 333, 333, 500, 675, 250, 333, 250, 278, 500, 500, 500, 500, 500, 500, 500, 500, 500, 500, 333, 333, 675, 675, 675, 500, 920, 611, 611, 667, 722, 611, 611, 722, 722, 333, 444, 667, 556, 833, 667, 722, 611, 722, 611, 500, 556, 722, 611, 833, 611, 556, 556, 389, 278, 389, 422, 500, 333, 500, 500, 444, 500, 444, 278, 500, 500, 278, 278, 444, 278, 722, 500, 500, 500, 500, 389, 389, 278, 500, 444, 667, 444, 444, 389, 400, 275, 400, 541],
  H: [278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584],
  HB: [278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611, 975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556, 333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611, 611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584],
};
const EXTRA = {
  TR: { 'ß': 500, 'æ': 667, 'Æ': 889, 'ø': 500, 'Ø': 722, 'Ð': 722, 'ð': 500, 'þ': 500, 'Þ': 556, 'Œ': 889, 'œ': 722, '·': 250, '¿': 444, '¡': 333 },
  TB: { 'ß': 556, 'æ': 722, 'Æ': 1000, 'ø': 500, 'Ø': 778, 'Ð': 722, 'ð': 500, 'þ': 556, 'Þ': 611, 'Œ': 1000, 'œ': 722, '·': 250, '¿': 500, '¡': 333 },
  TI: { 'ß': 500, 'æ': 667, 'Æ': 889, 'ø': 500, 'Ø': 722, 'Ð': 722, 'ð': 500, 'þ': 500, 'Þ': 611, 'Œ': 944, 'œ': 667, '·': 250, '¿': 500, '¡': 389 },
  H: { 'ß': 611, 'æ': 889, 'Æ': 1000, 'ø': 611, 'Ø': 778, 'Ð': 722, 'ð': 556, 'þ': 556, 'Þ': 667, 'Œ': 1000, 'œ': 944, '·': 278, '¿': 611, '¡': 333 },
  HB: { 'ß': 611, 'æ': 889, 'Æ': 1000, 'ø': 611, 'Ø': 778, 'Ð': 722, 'ð': 611, 'þ': 611, 'Þ': 667, 'Œ': 1000, 'œ': 944, '·': 278, '¿': 611, '¡': 333 },
};
// The PDF base font of each face (all with WinAnsiEncoding) and the CSS look the preview uses.
export const FONTS = {
  TR: { pdf: 'Times-Roman', css: 'font-family:"Times New Roman",Times,serif' },
  TB: { pdf: 'Times-Bold', css: 'font-family:"Times New Roman",Times,serif;font-weight:700' },
  TI: { pdf: 'Times-Italic', css: 'font-family:"Times New Roman",Times,serif;font-style:italic' },
  H: { pdf: 'Helvetica', css: 'font-family:Helvetica,Arial,sans-serif' },
  HB: { pdf: 'Helvetica-Bold', css: 'font-family:Helvetica,Arial,sans-serif;font-weight:700' },
};
// Windows-1252 characters in 0x80 to 0x9F that names can contain, and their byte.
export const WIN_ANSI_HIGH = { 'Š': 0x8a, 'Œ': 0x8c, 'Ž': 0x8e, 'š': 0x9a, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f };

// Latin letters with a stroke, which do not decompose into a letter and an accent.
const STROKED = { 'Ł': 'L', 'ł': 'l', 'Đ': 'D', 'đ': 'd', 'Ħ': 'H', 'ħ': 'h', 'ı': 'i', 'Ŧ': 'T', 'ŧ': 't' };

// Text as the standard fonts can print it. Curly quotes and dashes become plain; letters in
// Windows-1252 (é, ñ, ø, š, ...) stay as written; anything else loses its accent if that makes it
// printable (ő -> o) or becomes "?". `changed` says the printed text differs from the input.
export function printable(s) {
  const src = String(s ?? '').replace(/[‘’′]/g, "'").replace(/[“”″]/g, '"')
    .replace(/[–—−]/g, '-').replace(/…/g, '...').replace(/[\u00a0\u2000-\u200b\u202f]/g, ' ');
  let out = '';
  let changed = false;
  for (const ch of src.normalize('NFC')) {
    const code = ch.codePointAt(0);
    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_HIGH[ch]) { out += ch; continue; }
    const base = STROKED[ch] ?? ch.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
    if (base && [...base].every((c) => c.codePointAt(0) >= 0x20 && c.codePointAt(0) <= 0x7e)) out += base;
    else out += '?';
    changed = true;
  }
  return { text: out, changed };
}

function charWidth(ch, font) {
  const table = W[font];
  const code = ch.codePointAt(0);
  if (code >= 32 && code <= 126) return table[code - 32];
  if (EXTRA[font][ch]) return EXTRA[font][ch];
  const base = ch.normalize('NFD')[0];
  const b = base.codePointAt(0);
  if (b >= 32 && b <= 126) return table[b - 32];
  return table[0x6e - 32]; // "n"
}

// Width in points of printable text at a size in one of the faces (TR, TB, TI, H, HB).
export function textWidth(s, size, font = 'TR') {
  let w = 0;
  for (const ch of String(s)) w += charWidth(ch, font);
  return (w * size) / 1000;
}

const round2 = (n) => Math.round(n * 100) / 100;
// The largest size, in quarter points, at which text fits a width (never above max).
function sizeToFit(text, width, max, font) {
  const w = textWidth(text, 1000, font) / 1000;
  if (w === 0) return max;
  return Math.min(max, Math.floor((width / w) * 4) / 4);
}

// Text cut to fit a width, ending "..." when cut.
export function cutToFit(s, width, size, font = 'TR') {
  let t = String(s);
  if (textWidth(t, size, font) <= width) return t;
  while (t.length && textWidth(`${t}...`, size, font) > width) t = t.slice(0, -1);
  return `${t.trimEnd()}...`;
}

// One line fitted to a width between a largest and smallest size. With wrap, a line with spaces
// may go onto two lines rather than below its smallest size; past that it is cut.
// -> { lines, size, shrunk, cut }
export function fitLine(text, width, max, min, { font = 'TR', wrap = false } = {}) {
  const one = sizeToFit(text, width, max, font);
  if (one >= min) return { lines: [text], size: one, shrunk: one < max, cut: false };
  const words = text.split(' ');
  if (wrap && words.length > 1) {
    let best = null;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ');
      const b = words.slice(i).join(' ');
      const size = Math.min(sizeToFit(a, width, max, font), sizeToFit(b, width, max, font));
      if (!best || size > best.size) best = { lines: [a, b], size };
    }
    if (best.size >= min) return { lines: best.lines, size: best.size, shrunk: true, cut: false };
  }
  return { lines: [cutToFit(text, width, min, font)], size: min, shrunk: true, cut: true };
}

// Words wrapped into lines no wider than width at a size.
export function wrapWords(text, width, size, font = 'TR') {
  const lines = [];
  let line = '';
  for (const word of String(text).split(' ').filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (!line || textWidth(next, size, font) <= width) line = next;
    else { lines.push(line); line = word; }
  }
  if (line) lines.push(line);
  return lines;
}

// A paragraph in at most maxLines lines: at its size if it fits, otherwise smaller (in half
// points) down to min, and cut on the last line past that.
export function fitParagraph(text, width, max, min, maxLines, font = 'TR') {
  for (let size = max; size >= min; size -= 0.5) {
    const lines = wrapWords(text, width, size, font);
    if (lines.length <= maxLines && lines.every((l) => textWidth(l, size, font) <= width)) return { lines, size, shrunk: size < max, cut: false };
  }
  const lines = wrapWords(text, width, min, font);
  const kept = lines.slice(0, maxLines);
  kept[kept.length - 1] = cutToFit(`${kept[kept.length - 1]}${lines.length > maxLines ? ` ${lines.slice(maxLines).join(' ')}` : ''}`, width, min, font);
  return { lines: kept, size: min, shrunk: true, cut: true };
}

// ---------- names ----------

const PARTICLES = new Set(['van', 'von', 'de', 'da', 'das', 'dos', 'del', 'della', 'di', 'du', 'la', 'le', 'der', 'den', 'ter', 'ten', 'bin', 'al', 'el', 'y']);
const isUpper = (s) => s === s.toUpperCase() && s !== s.toLowerCase();
const isLower = (s) => s === s.toLowerCase() && s !== s.toUpperCase();
const cap = (w) => w.charAt(0).toUpperCase() + w.slice(1);

// A name typed all in capitals or all in lower case, in title case: each word and each part after
// a hyphen or apostrophe capitalised, Mc + capital, particles such as "van" or "de" kept lower
// after the first word. Names in mixed case are left exactly as written.
export function fixCase(name) {
  const s = String(name);
  if (!(isUpper(s) || isLower(s))) return s;
  return s.toLowerCase().split(' ').map((word, i) => {
    if (i > 0 && PARTICLES.has(word)) return word;
    return word.split('-').map((part) => part.split("'").map((p, j, all) => {
      if (j === 0 && all.length > 1 && p.length === 1) return cap(p);
      const c = cap(p);
      return /^Mc[a-z]/.test(c) ? `Mc${cap(c.slice(2))}` : c;
    }).join("'")).join('-');
  }).join(' ');
}

export const tidy = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// ---------- reading the list ----------

export function parseCsv(text) {
  const src = String(text ?? '').replace(/^\ufeff/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] ?? '';
  const outside = firstLine.replace(/"[^"]*"/g, '');
  const delim = outside.includes('\t') ? '\t' : outside.includes(';') && !outside.includes(',') ? ';' : ',';
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let line = 1;
  let rowLine = 1;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') { field += '"'; i++; } else if (c === '"') quoted = false; else { if (c === '\n') line++; field += c; }
    } else if (c === '"' && field === '') quoted = true;
    else if (c === delim) { row.push(field); field = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((x) => x.trim() !== '')) { row.line = rowLine; rows.push(row); }
      row = [];
      line++;
      rowLine = line;
    } else field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim() !== '')) { row.line = rowLine; rows.push(row); }
  return rows;
}

// The fields a row can carry, and the column headings each is recognised by (lower case, spaces
// and punctuation ignored).
export const FIELDS = {
  first: ['firstname', 'first', 'givenname', 'forename', 'preferredname', 'preferredfirstname', 'studentfirstname', 'legalfirstname', 'fname'],
  last: ['lastname', 'last', 'surname', 'familyname', 'studentlastname', 'legallastname', 'lname'],
  full: ['name', 'fullname', 'studentname', 'student', 'recipient', 'recipientname', 'nameoncertificate', 'attendee', 'attendeename', 'participant', 'participantname', 'awardee', 'honoree', 'childname', 'child', 'volunteer', 'volunteername', 'employee', 'employeename', 'member', 'membername'],
  award: ['award', 'awards', 'awardname', 'awardtitle', 'honor', 'honour', 'honors', 'achievement', 'recognition', 'superlative', 'prize', 'funnyaward', 'certificate', 'certificatetitle'],
  detail: ['detail', 'details', 'hours', 'cehours', 'ceu', 'ceus', 'credits', 'credit', 'course', 'coursename', 'program', 'programme', 'workshop', 'training', 'reason', 'for', 'note', 'subject'],
  group: ['homeroom', 'class', 'classroom', 'room', 'teacher', 'grade', 'gradelevel', 'section', 'period', 'group', 'house', 'team', 'cohort', 'department'],
};
export const FIELD_KEYS = Object.keys(FIELDS);
const squash = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

// Which column holds each field: named ones first (columns: { full: "Kid" }), then by heading.
export function mapColumns(header, columns = {}) {
  const map = {};
  const used = new Set();
  for (const [field, heading] of Object.entries(columns ?? {})) {
    const i = header.findIndex((h) => squash(h) === squash(heading));
    if (i < 0) throw new CertError(`The column "${heading}" named for ${field} is not in the file. Its headings are: ${header.join(', ')}.`, 'columns');
    map[field] = i;
    used.add(i);
  }
  for (const field of FIELD_KEYS) {
    if (map[field] !== undefined) continue;
    const i = header.findIndex((h, j) => !used.has(j) && FIELDS[field].includes(squash(h)));
    if (i >= 0) { map[field] = i; used.add(i); }
  }
  if (map.first === undefined && map.full === undefined) {
    // A one-column list with a heading nobody recognises is a list of names.
    if (header.length === 1) { map.full = 0; used.add(0); } else {
      throw new CertError(`The list needs a name column: Name (or First name with Last name). Its headings are: ${header.join(', ')}. Name it, for example { "full": "Student" }.`, 'columns');
    }
  }
  return { map, unknown: header.filter((_, i) => !used.has(i)).filter((h) => h.trim() !== '') };
}

// One recipient from its raw fields: names tidied (case fixed when typed all in capitals or all in
// lower case), "Last, First" turned round, the printed name built as "First Last".
export function readRecipient(raw, { fixNames = true } = {}) {
  const t = (k) => tidy(raw[k]).slice(0, LIMITS.field);
  let first = t('first');
  let last = t('last');
  const full = t('full');
  if (!first && !last && full) {
    const comma = full.indexOf(',');
    if (comma > 0) { last = tidy(full.slice(0, comma)); first = tidy(full.slice(comma + 1)); } else {
      const words = full.split(' ');
      first = words.length > 1 ? words.slice(0, -1).join(' ') : words[0];
      last = words.length > 1 ? words[words.length - 1] : '';
    }
  }
  if (fixNames) { first = fixCase(first); last = fixCase(last); }
  return { first, last, name: tidy(`${first} ${last}`), award: t('award'), detail: t('detail'), group: t('group') };
}

// The list as recipients: { people: [{ row, first, last, name, award, detail, group }], mapped,
// unknown, skipped }. `row` is the line in the file (the heading is line 1) or the place in rows.
export function readList({ csv, rows, columns } = {}, { fixNames = true } = {}) {
  let raws;
  let mapped = null;
  let unknown = [];
  if (csv !== undefined && csv !== null) {
    const table = parseCsv(csv);
    if (!table.length) throw new CertError('The list is empty: a heading line, then one name a line.', 'csv');
    const [header, ...body] = table;
    const m = mapColumns(header.map((h) => tidy(h)), columns);
    if (!body.length) throw new CertError('The list needs a heading line and at least one name under it.', 'csv');
    mapped = Object.fromEntries(Object.entries(m.map).map(([f, i]) => [f, tidy(header[i])]));
    unknown = m.unknown;
    raws = body.map((cells) => {
      const r = { row: cells.line };
      for (const [f, i] of Object.entries(m.map)) r[f] = cells[i] ?? '';
      return r;
    });
  } else {
    raws = (rows ?? []).map((r, i) => ({ full: r.name, first: r.first, last: r.last, award: r.award, detail: r.detail, group: r.group, row: i + 1 }));
  }
  const people = [];
  const skipped = [];
  for (const r of raws) {
    const p = readRecipient(r, { fixNames });
    if (!p.name) { skipped.push({ row: r.row, reason: 'no name' }); continue; }
    people.push({ row: r.row, ...p });
  }
  if (people.length > LIMITS.rows) throw new CertError(`At most ${LIMITS.rows.toLocaleString('en-US')} certificates in one batch; split the list.`, csv !== undefined && csv !== null ? 'csv' : 'rows');
  return { people, mapped, unknown, skipped };
}

// The same certificate twice: same name, award and detail (one student with two awards is two
// certificates, not a duplicate).
const personKey = (p) => [p.name, p.award, p.detail].map((s) => s.toLowerCase()).join('|');
export function dedupe(people) {
  const seen = new Map();
  const kept = [];
  const dropped = [];
  for (const p of people) {
    const k = personKey(p);
    if (seen.has(k)) dropped.push({ row: p.row, sameAs: seen.get(k) }); else { seen.set(k, p.row); kept.push(p); }
  }
  return { kept, dropped };
}

// How many certificates a list makes (rows with a name), for the price.
export function countCertificates(input) {
  try {
    const { people } = readList(input, { fixNames: false });
    return input.removeDuplicates ? dedupe(people).kept.length : people.length;
  } catch { return 0; }
}

const collate = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true });
export function sortPeople(people, sort) {
  if (sort === 'as-given') return [...people];
  const key = {
    'last-name': (p) => [p.last || p.first, p.first],
    'first-name': (p) => [p.first, p.last],
    group: (p) => [p.group || '\uffff', p.last || p.first, p.first],
    award: (p) => [p.award || '\uffff', p.last || p.first, p.first],
  }[sort];
  return [...people].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    for (let i = 0; i < ka.length; i++) {
      const c = collate(ka[i], kb[i]);
      if (c) return c;
    }
    return a.row - b.row;
  });
}

// ---------- designs ----------

// Seven certificate designs: the wording each starts with (every line can be changed), its accent
// colour (RGB, 0 to 1), its frame and its faces. The wording is written for this tool.
export const DESIGNS = {
  achievement: {
    noun: ['certificate of achievement', 'certificates of achievement'],
    label: 'Certificate of Achievement',
    title: 'Certificate of Achievement',
    presented: 'This certificate is proudly presented to',
    reason: 'for outstanding achievement and hard work',
    accent: [0.11, 0.23, 0.45], frame: 'classic', titleFont: 'TB', nameFont: 'TB',
  },
  completion: {
    noun: ['certificate of completion', 'certificates of completion'],
    label: 'Certificate of Completion',
    title: 'Certificate of Completion',
    presented: 'This certifies that',
    reason: 'has successfully completed {detail}',
    reasonEmpty: 'has successfully completed the course',
    accent: [0.07, 0.36, 0.33], frame: 'band', titleFont: 'TB', nameFont: 'TB',
  },
  appreciation: {
    noun: ['certificate of appreciation', 'certificates of appreciation'],
    label: 'Certificate of Appreciation',
    title: 'Certificate of Appreciation',
    presented: 'Presented with sincere thanks to',
    reason: 'in appreciation of your kindness, effort and dedication',
    accent: [0.5, 0.13, 0.2], frame: 'diamond', titleFont: 'TB', nameFont: 'TI',
  },
  'end-of-year': {
    noun: ['end-of-year award', 'end-of-year awards'],
    label: 'End of Year Award',
    title: 'End of Year Award',
    presented: 'This award is presented to',
    reason: 'in recognition of an outstanding school year',
    accent: [0.55, 0.38, 0.05], frame: 'seal', titleFont: 'TB', nameFont: 'TB',
  },
  funny: {
    noun: ['funny class award', 'funny class awards'],
    label: 'Funny class award',
    title: 'Class Award',
    presented: 'And the award goes to',
    reason: 'for making this year one to remember',
    awardEmpty: 'Most Likely to Make Us Laugh',
    accent: [0.42, 0.18, 0.55], frame: 'dashed', titleFont: 'HB', nameFont: 'TB',
  },
  kids: {
    noun: ['kids\' award', 'kids\' awards'],
    label: 'Kids award',
    title: 'Super Star Award',
    presented: 'Hooray for',
    reason: 'for shining bright in our class',
    accent: [0.85, 0.33, 0.1], frame: 'stars', titleFont: 'HB', nameFont: 'HB',
  },
  participation: {
    noun: ['certificate of participation', 'certificates of participation'],
    label: 'Certificate of Participation',
    title: 'Certificate of Participation',
    presented: 'This certificate is presented to',
    reason: 'for taking part in {detail}',
    reasonEmpty: 'for taking part with enthusiasm',
    accent: [0.2, 0.2, 0.2], frame: 'brackets', titleFont: 'TB', nameFont: 'TB',
  },
};
export const DESIGN_KEYS = Object.keys(DESIGNS);

// Options as given (validated by the server), with defaults.
export function settings(o = {}) {
  const d = DESIGNS[o.design ?? 'achievement'] ?? DESIGNS.achievement;
  return {
    design: o.design ?? 'achievement',
    paper: o.paper ?? 'letter',
    orientation: o.orientation ?? 'landscape',
    title: o.title !== undefined ? tidy(o.title) : d.title,
    presented: o.presented !== undefined ? tidy(o.presented) : d.presented,
    reason: o.reason !== undefined ? tidy(o.reason) : d.reason,
    org: tidy(o.org ?? ''),
    date: tidy(o.date ?? ''),
    signers: (o.signers ?? []).map((s) => ({ name: tidy(s.name ?? ''), role: tidy(s.role ?? '') })).filter((s) => s.name || s.role),
    sort: o.sort ?? 'as-given',
    fixNames: o.fixNames ?? true,
    removeDuplicates: o.removeDuplicates ?? false,
  };
}

export function pageSize(paper = 'letter', orientation = 'landscape') {
  const p = PAPERS[paper] ?? PAPERS.letter;
  return orientation === 'portrait' ? { w: p.w, h: p.h } : { w: p.h, h: p.w };
}

// {award}, {detail}, {group} and {name} in a line, from one row. `missing` lists placeholders the
// row had nothing for.
export function fillIn(text, person) {
  const missing = [];
  const out = String(text).replace(/\{(award|detail|group|name)\}/g, (_, k) => {
    const v = person[k] ?? '';
    if (!v) missing.push(k);
    return v;
  });
  return { text: tidy(out), missing };
}

// ---------- drawing pieces ----------

const GOLD = [0.72, 0.56, 0.18];
function starPoints(cx, cy, outer, inner, spikes = 5, turn = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 ? inner : outer;
    const a = turn + (i * Math.PI) / spikes;
    pts.push([round2(cx + r * Math.cos(a)), round2(cy + r * Math.sin(a))]);
  }
  return pts;
}

// The frame of a design: items drawn behind the words, all inside SAFE of the page edge.
function frameItems(frame, accent, w, h) {
  const s = SAFE;
  const items = [];
  const box = (inset, width, color = accent, dash) => items.push({ k: 'rect', x: inset, y: inset, w: round2(w - 2 * inset), h: round2(h - 2 * inset), stroke: color, width, ...(dash ? { dash } : {}) });
  if (frame === 'classic') {
    box(s, 3.5);
    box(s + 9, 0.8);
    for (const [x, y] of [[s, s], [w - s, s], [s, h - s], [w - s, h - s]]) items.push({ k: 'rect', x: round2(x - 7), y: round2(y - 7), w: 14, h: 14, fill: accent });
  } else if (frame === 'band') {
    box(s, 1.2);
    items.push({ k: 'rect', x: s + 6, y: s + 6, w: round2(w - 2 * s - 12), h: 12, fill: accent });
    items.push({ k: 'rect', x: s + 6, y: round2(h - s - 18), w: round2(w - 2 * s - 12), h: 12, fill: accent });
  } else if (frame === 'diamond') {
    box(s, 1.5);
    box(s + 6, 0.6);
    for (const [x, y] of [[w / 2, s], [w / 2, h - s], [s, h / 2], [w - s, h / 2]]) {
      items.push({ k: 'poly', pts: [[x, y - 9], [x + 9, y], [x, y + 9], [x - 9, y]].map(([a, b]) => [round2(a), round2(b)]), fill: accent });
    }
  } else if (frame === 'seal') {
    box(s, 5);
    box(s + 10, 1, GOLD);
    items.push({ k: 'poly', pts: starPoints(round2(w - s - 62), round2(h - s - 62), 34, 27, 16), fill: GOLD });
    items.push({ k: 'circle', cx: round2(w - s - 62), cy: round2(h - s - 62), r: 23, stroke: [1, 1, 1], width: 1.2 });
  } else if (frame === 'dashed') {
    box(s, 2.5, accent, [9, 5]);
    box(s + 8, 0.7);
    for (const [x, y] of [[s + 26, s + 26], [w - s - 26, s + 26], [s + 26, h - s - 26], [w - s - 26, h - s - 26]]) items.push({ k: 'poly', pts: starPoints(round2(x), round2(y), 12, 5), fill: GOLD });
  } else if (frame === 'stars') {
    box(s, 4, accent);
    const n = Math.max(6, Math.floor((w - 2 * s) / 64));
    for (let i = 0; i <= n; i++) {
      const x = s + 18 + ((w - 2 * s - 36) * i) / n;
      const color = i % 2 ? GOLD : accent;
      items.push({ k: 'poly', pts: starPoints(round2(x), s + 16, 9, 4), fill: color });
      items.push({ k: 'poly', pts: starPoints(round2(x), round2(h - s - 16), 9, 4), fill: color });
    }
  } else {
    // brackets: a thin rule and an L at each corner.
    box(s + 6, 0.6);
    const L = 40;
    for (const [x, y, dx, dy] of [[s, s, 1, 1], [w - s, s, -1, 1], [s, h - s, 1, -1], [w - s, h - s, -1, -1]]) {
      items.push({ k: 'line', x1: x, y1: y, x2: round2(x + dx * L), y2: y, stroke: accent, width: 3 });
      items.push({ k: 'line', x1: x, y1: y, x2: x, y2: round2(y + dy * L), stroke: accent, width: 3 });
    }
  }
  return items;
}

// ---------- one certificate ----------

// The words of one certificate laid out on the page, with the frame. Returns the scene and what
// happened to the name (its size, the largest it could be) and flags: shrunk, wrapped, cut,
// characters (letters the fonts cannot print), empty (a {placeholder} the row had nothing for).
export function layoutCertificate(person, o, { proof = false } = {}) {
  const d = DESIGNS[o.design] ?? DESIGNS.achievement;
  const { w, h } = pageSize(o.paper, o.orientation);
  // Sizes are set for landscape Letter and scaled to the page; a portrait page is narrower, so a
  // little less.
  const f = o.orientation === 'portrait' ? Math.min(w / 612, h / 792) * 0.85 : Math.min(w / 792, h / 612);
  const q = (n) => Math.floor(n * f * 4) / 4;
  const inner = SAFE + 30;
  const width = w - 2 * inner;
  const flags = [];
  const missing = new Set();
  const fill = (text) => {
    const r = fillIn(text, person);
    r.missing.forEach((m) => missing.add(m));
    return r.text;
  };
  const items = [...frameItems(d.frame, d.accent, w, h)];

  // The lines from the top, before vertical placement: { text, font, max, min, color, wrap, gap, para }.
  const blocks = [];
  const add = (b) => { if (b.text) blocks.push(b); };
  if (o.org) add({ key: 'org', text: o.org.toUpperCase(), font: 'HB', max: q(12), min: 7, color: d.accent, gap: q(14) });
  add({ key: 'title', text: fill(o.title), font: d.titleFont, max: q(d.titleFont === 'HB' ? 38 : 42), min: 16, color: d.accent, gap: q(16), wrap: true });
  add({ key: 'presented', text: fill(o.presented), font: 'TI', max: q(17), min: 9, gap: q(14) });
  add({ key: 'name', text: person.name, font: d.nameFont, max: q(d.nameFont === 'HB' ? 54 : 50), min: q(22), gap: q(20), wrap: true, rule: true });
  const award = person.award || d.awardEmpty || '';
  const awardInTitle = /\{award\}/.test(`${o.title} ${o.presented} ${o.reason}`);
  if (award && !awardInTitle) add({ key: 'award', text: award, font: d.titleFont, max: q(24), min: 12, color: d.accent, gap: q(12), wrap: true });
  let reason = o.reason;
  if (/\{detail\}/.test(reason) && !person.detail && d.reasonEmpty && o.reason === d.reason) reason = d.reasonEmpty;
  const detailUsed = /\{detail\}/.test(`${o.title} ${o.presented} ${reason}`);
  add({ key: 'reason', text: fill(reason), font: 'TR', max: q(16), min: 9, gap: q(10), para: 3 });
  if (person.detail && !detailUsed) add({ key: 'detail', text: person.detail, font: 'H', max: q(12), min: 7, gray: 0.3, gap: 0 });

  const fitted = blocks.map((b) => {
    const p = printable(b.text);
    if (p.changed) flags.push({ kind: 'characters', field: b.key, printed: p.text });
    const r = b.para ? fitParagraph(p.text, width, b.max, b.min, b.para, b.font) : fitLine(p.text, width, b.max, b.min, { font: b.font, wrap: b.wrap });
    if (r.cut) flags.push({ kind: 'cut', field: b.key, printed: r.lines.join(' ') });
    return { ...b, ...r };
  });
  const name = fitted.find((b) => b.key === 'name');
  if (name.shrunk && !name.cut) flags.push({ kind: name.lines.length > 1 ? 'wrapped' : 'shrunk', field: 'name', size: name.size });
  for (const m of missing) flags.push({ kind: 'empty', field: m });

  // The signature row: the date over its rule, then one rule per signer with the name and role
  // under it.
  const slots = [];
  if (o.date) slots.push({ over: o.date, under: 'Date' });
  for (const s of o.signers.slice(0, 2)) slots.push({ over: '', under: s.name, role: s.role });
  const sigRule = h - inner - q(34);
  const top = inner + (d.frame === 'band' || d.frame === 'stars' ? q(18) : q(4));
  const bottom = slots.length ? sigRule - q(40) : h - inner;

  const lead = (b) => b.size * 1.16;
  const heightOf = (b) => b.lines.length * lead(b) + (b.rule ? q(8) : 0) + b.gap;
  const total = fitted.reduce((s, b) => s + heightOf(b), 0);
  let scale = 1;
  if (total > bottom - top) scale = (bottom - top) / total;
  let y = top + Math.max(0, (bottom - top - total * scale) / 2);
  for (const b0 of fitted) {
    const b = scale < 1 ? { ...b0, size: Math.floor(b0.size * scale * 4) / 4, gap: b0.gap * scale } : b0;
    if (scale < 1 && b.key === 'name') { name.size = b.size; if (!flags.some((x) => x.field === 'name')) flags.push({ kind: 'shrunk', field: 'name', size: b.size }); }
    let widest = 0;
    for (const line of b.lines) {
      y += b.size;
      const tw = textWidth(line, b.size, b.font);
      widest = Math.max(widest, tw);
      items.push({ k: 'text', x: round2(w / 2), y: round2(y), s: line, size: b.size, font: b.font, align: 'center', ...(b.color ? { color: b.color } : {}), ...(b.gray ? { gray: b.gray } : {}) });
      y += lead(b) - b.size;
    }
    if (b.rule) {
      const rw = Math.min(width, Math.max(widest + 60, width * 0.55));
      y += q(4);
      items.push({ k: 'line', x1: round2((w - rw) / 2), y1: round2(y), x2: round2((w + rw) / 2), y2: round2(y), stroke: d.accent, width: 0.9 });
      y += q(4);
    }
    y += b.gap;
  }

  if (slots.length) {
    // The seal sits in the bottom-right corner, so its signature row is narrower.
    const room = d.frame === 'seal' ? width - 2 * q(100) : width;
    const slotW = Math.min(q(200), (room - (slots.length - 1) * 24) / slots.length);
    const span = slots.length * slotW + (slots.length - 1) * 24;
    slots.forEach((s, i) => {
      const x = (w - span) / 2 + i * (slotW + 24);
      const cx = round2(x + slotW / 2);
      items.push({ k: 'line', x1: round2(x), y1: round2(sigRule), x2: round2(x + slotW), y2: round2(sigRule), stroke: [0, 0, 0], width: 0.7 });
      if (s.over) items.push({ k: 'text', x: cx, y: round2(sigRule - 6), s: cutToFit(printable(s.over).text, slotW, q(13), 'TR'), size: q(13), font: 'TR', align: 'center' });
      items.push({ k: 'text', x: cx, y: round2(sigRule + q(14)), s: cutToFit(printable(s.under).text, slotW, q(11), 'H'), size: q(11), font: 'H', align: 'center', gray: 0.2 });
      if (s.role) items.push({ k: 'text', x: cx, y: round2(sigRule + q(27)), s: cutToFit(printable(s.role).text, slotW, q(9.5), 'TI'), size: q(9.5), font: 'TI', align: 'center', gray: 0.35 });
    });
  }

  if (proof) {
    const size = Math.round(Math.min(w, h) * 0.28);
    items.push({ k: 'text', x: round2(w / 2), y: round2(h / 2 + size * 0.35), s: 'PROOF', size, font: 'HB', align: 'center', gray: 0.82, rotate: -24, alpha: true });
    items.push({ k: 'text', x: round2(w / 2), y: round2(h - SAFE + 22), s: 'Free proof: check names and spacing. The clean PDF has no watermark.', size: 8, font: 'H', align: 'center', gray: 0.45 });
  }
  return { w, h, items, nameSize: name.size, nameMax: name.max, flags };
}

// ---------- the whole batch ----------

const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

// Every certificate laid out, in print order. -> { o, people, certificates, flagged, duplicates,
// skipped, mapped, unknown, shrunk, nameSizes, page }
export function plan(input, { proof = false } = {}) {
  const o = settings(input);
  if (!DESIGNS[o.design]) throw new CertError(`design is ${DESIGN_KEYS.join(', ')}.`, 'design');
  const read = readList(input, { fixNames: o.fixNames });
  if (!read.people.length) throw new CertError('No row in the list has a name.', input.csv !== undefined ? 'csv' : 'rows');
  let people = read.people;
  let duplicates;
  if (o.removeDuplicates) { const d = dedupe(people); people = d.kept; duplicates = d.dropped.map((x) => ({ ...x, removed: true })); } else {
    duplicates = dedupe(people).dropped.map((x) => ({ ...x, removed: false }));
  }
  const ordered = sortPeople(people, o.sort);
  const certificates = ordered.map((p, i) => ({ page: i + 1, row: p.row, person: p, ...layoutCertificate(p, o, { proof }) }));
  const flagged = certificates.filter((c) => c.flags.length).map((c) => ({ page: c.page, row: c.row, name: c.person.name, flags: c.flags }));
  const sizes = certificates.map((c) => c.nameSize);
  return {
    o, people: ordered, certificates, flagged, duplicates, skipped: read.skipped, mapped: read.mapped, unknown: read.unknown,
    shrunk: certificates.filter((c) => c.nameSize < c.nameMax).length,
    nameSizes: { largest: Math.max(...sizes), smallest: Math.min(...sizes), max: certificates[0].nameMax },
    page: pageSize(o.paper, o.orientation),
  };
}

export function paperWords(o) {
  return `${PAPERS[o.paper].name} ${o.orientation}`;
}

// The answer in words and the summary the API returns (no drawing).
export function summary(p) {
  const n = p.certificates.length;
  const d = DESIGNS[p.o.design];
  const kinds = (k) => p.flagged.filter((f) => f.flags.some((x) => x.field === 'name' && x.kind === k)).length;
  const notes = [];
  if (p.shrunk) notes.push(`${plural(p.shrunk, 'long name')} made smaller to fit${kinds('wrapped') ? ` (${kinds('wrapped')} on two lines)` : ''}`);
  else notes.push(`every name at the full ${p.nameSizes.max} pt`);
  const cut = p.flagged.filter((f) => f.flags.some((x) => x.kind === 'cut')).length;
  if (cut) notes.push(`${plural(cut, 'certificate')} with a line cut short (listed)`);
  const chars = p.flagged.filter((f) => f.flags.some((x) => x.kind === 'characters')).length;
  if (chars) notes.push(`${plural(chars, 'certificate')} with letters the font cannot print (listed)`);
  const answer = `${plural(n, 'name')} made ${n.toLocaleString('en-US')} ${d.noun[n === 1 ? 0 : 1]} on ${paperWords(p.o)}, one page each in one PDF; ${notes.join('; ')}.`;
  return {
    answer,
    certificates: n,
    pages: n,
    design: p.o.design,
    paper: p.o.paper,
    orientation: p.o.orientation,
    pageSize: { w: round2(p.page.w), h: round2(p.page.h) },
    nameSizes: p.nameSizes,
    shrunk: p.shrunk,
    flagged: p.flagged,
    duplicates: p.duplicates,
    skipped: p.skipped,
    columnsUsed: p.mapped,
    columnsIgnored: p.unknown,
    list: p.certificates.map((c) => ({ page: c.page, row: c.row, name: c.person.name, award: c.person.award || null, group: c.person.group || null, nameSize: c.nameSize })),
  };
}

// The batch title as a key: case and spacing ignored.
export const batchKey = (s) => tidy(s).toLowerCase();

// ---------- the PDF ----------

const num = (n) => (Math.round(n * 100) / 100).toString();
const rgb = (c) => c.map(num).join(' ');

// PDF string bytes: printable text, with ( ) \ escaped and the Windows-1252 letters above 0x7f
// written as their byte.
function pdfString(s) {
  let out = '';
  for (const ch of printable(s).text) {
    if (ch === '(' || ch === ')' || ch === '\\') out += `\\${ch}`;
    else if (WIN_ANSI_HIGH[ch]) out += String.fromCharCode(WIN_ANSI_HIGH[ch]);
    else out += ch;
  }
  return out;
}

const FONT_KEYS = ['TR', 'TB', 'TI', 'H', 'HB'];
const pathOps = (pts, H) => `${pts.map(([x, y], i) => `${num(x)} ${num(H - y)} ${i ? 'l' : 'm'}`).join(' ')} h`;
function circleOps(cx, cy, r, H) {
  const k = 0.5523 * r;
  const y = H - cy;
  return `${num(cx + r)} ${num(y)} m ${num(cx + r)} ${num(y + k)} ${num(cx + k)} ${num(y + r)} ${num(cx)} ${num(y + r)} c ${num(cx - k)} ${num(y + r)} ${num(cx - r)} ${num(y + k)} ${num(cx - r)} ${num(y)} c ${num(cx - r)} ${num(y - k)} ${num(cx - k)} ${num(y - r)} ${num(cx)} ${num(y - r)} c ${num(cx + k)} ${num(y - r)} ${num(cx + r)} ${num(y - k)} ${num(cx + r)} ${num(y)} c`;
}
const paint = (it) => (it.fill && it.stroke ? 'B' : it.fill ? 'f' : 'S');
const colours = (it) => `${it.fill ? `${rgb(it.fill)} rg ` : ''}${it.stroke ? `${rgb(it.stroke)} RG ${num(it.width ?? 1)} w ` : ''}${it.dash ? `[${it.dash.join(' ')}] 0 d ` : ''}`;

// One scene as a PDF content stream.
export function sceneOps(scene) {
  const H = scene.h;
  const ops = [];
  for (const it of scene.items) {
    if (it.k === 'text') {
      const fill = it.color ? `${rgb(it.color)} rg` : `${num(it.gray ?? 0)} g`;
      const tw = textWidth(printable(it.s).text, it.size, it.font);
      const font = `/F${FONT_KEYS.indexOf(it.font) + 1} ${num(it.size)} Tf`;
      if (it.rotate) {
        const a = (-it.rotate * Math.PI) / 180;
        const c = Math.cos(a);
        const s = Math.sin(a);
        // Turned about the middle of its baseline, (x, y), as the preview's SVG does.
        const dx = it.align === 'center' ? tw / 2 : 0;
        const ox = it.x - dx * c;
        const oy = H - it.y - dx * s;
        ops.push(`q ${it.alpha ? '/GS1 gs ' : ''}BT ${font} ${fill} ${num(c)} ${num(s)} ${num(-s)} ${num(c)} ${num(ox)} ${num(oy)} Tm (${pdfString(it.s)}) Tj ET Q`);
      } else {
        const left = it.align === 'center' ? it.x - tw / 2 : it.align === 'right' ? it.x - tw : it.x;
        ops.push(`BT ${font} ${fill} ${num(left)} ${num(H - it.y)} Td (${pdfString(it.s)}) Tj ET`);
      }
    } else if (it.k === 'rect') {
      ops.push(`q ${colours(it)}${num(it.x)} ${num(H - it.y - it.h)} ${num(it.w)} ${num(it.h)} re ${paint(it)} Q`);
    } else if (it.k === 'line') {
      ops.push(`q ${colours(it)}${num(it.x1)} ${num(H - it.y1)} m ${num(it.x2)} ${num(H - it.y2)} l S Q`);
    } else if (it.k === 'poly') {
      ops.push(`q ${colours(it)}${pathOps(it.pts, H)} ${paint(it)} Q`);
    } else if (it.k === 'circle') {
      ops.push(`q ${colours(it)}${circleOps(it.cx, it.cy, it.r, H)} ${paint(it)} Q`);
    }
  }
  return ops.join('\n');
}

const latin1 = (s) => {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
};

// The scenes as one PDF, one page each. deflate (bytes -> bytes, zlib format) compresses the
// content streams when given (the server passes Node's zlib); the browser writes them plain. No
// dates or ids are stamped in, so the same scenes give the same bytes.
export function pdfBytes(scenes, { title = 'Certificates', deflate = null } = {}) {
  const objects = [];
  const add = (body) => { objects.push(body); return objects.length; };
  const catalog = add(null);
  const pagesId = add(null);
  const fonts = FONT_KEYS.map((k) => add(`<< /Type /Font /Subtype /Type1 /BaseFont /${FONTS[k].pdf} /Encoding /WinAnsiEncoding >>`));
  const gs = add('<< /Type /ExtGState /ca 0.55 /CA 0.55 >>');
  const resources = `<< /Font << ${fonts.map((id, i) => `/F${i + 1} ${id} 0 R`).join(' ')} >> /ExtGState << /GS1 ${gs} 0 R >> >>`;
  const kids = [];
  for (const scene of scenes) {
    const raw = latin1(sceneOps(scene));
    const data = deflate ? deflate(raw) : raw;
    const content = add({ dict: `<< /Length ${data.length}${deflate ? ' /Filter /FlateDecode' : ''} >>`, data });
    kids.push(add(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${num(scene.w)} ${num(scene.h)}] /Resources ${resources} /Contents ${content} 0 R >>`));
  }
  // PrintScaling /None asks the print dialog to default to 100% (Actual size), not Fit.
  objects[catalog - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R /ViewerPreferences << /PrintScaling /None >> >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${kids.map((k) => `${k} 0 R`).join(' ')}] /Count ${kids.length} >>`;
  const info = add(`<< /Title (${pdfString(title)}) /Producer (certificates) >>`);

  const chunks = [latin1('%PDF-1.4\n%\xe2\xe3\xcf\xd3\n')];
  let offset = chunks[0].length;
  const offsets = [];
  objects.forEach((body, i) => {
    offsets.push(offset);
    const parts = typeof body === 'string'
      ? [latin1(`${i + 1} 0 obj\n${body}\nendobj\n`)]
      : [latin1(`${i + 1} 0 obj\n${body.dict}\nstream\n`), body.data, latin1('\nendstream\nendobj\n')];
    for (const p of parts) { chunks.push(p); offset += p.length; }
  });
  const xref = [`xref\n0 ${objects.length + 1}\n`, '0000000000 65535 f \n', ...offsets.map((o) => `${String(o).padStart(10, '0')} 00000 n \n`)].join('');
  chunks.push(latin1(`${xref}trailer\n<< /Size ${objects.length + 1} /Root ${catalog} 0 R /Info ${info} 0 R >>\nstartxref\n${offset}\n%%EOF\n`));
  const out = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let at = 0;
  for (const c of chunks) { out.set(c, at); at += c.length; }
  return out;
}

// A file name from the batch title: lower case, hyphens.
export const fileSlug = (s) => tidy(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 50) || 'certificates';
