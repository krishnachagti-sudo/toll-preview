// Name tags: the pure engine shared by the page (live sheet preview) and the server (the PDFs).
// No imports and no Node APIs, so the browser loads this same file. Deterministic: the same guest
// list and settings always give the same badges, in the same places, at the same sizes.
//
// Geometry comes from data/avery-badge-templates.json (each label's outline measured from the
// blank PDF template on the template's avery.com page). Everything here is in PDF points
// (1/72 inch), measured from the top-left corner of the sheet.

export class BadgeError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'BadgeError';
    this.field = field ?? null;
  }
}

export const LIMITS = { guests: 2000, csvChars: 100_000, spares: 200, header: 60, field: 120, walkins: 8, nudge: 0.25 };
export const STYLES = ['first-large', 'full-name', 'first-only'];
export const SORTS = ['last-name', 'first-name', 'organization', 'as-given'];
export const PT = 72;

// ---------- type metrics ----------

// Advance widths (1/1000 em) of the standard PDF fonts Helvetica and Helvetica-Bold for character
// codes 32 to 126 (Adobe's Core 14 font metrics).
const HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
];
const HELVETICA_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
];
// Letters of Windows-1252 (the fonts' WinAnsiEncoding) that do not decompose to an ASCII letter.
const EXTRA_WIDTHS = { 'ß': [611, 611], 'æ': [889, 889], 'Æ': [1000, 1000], 'ø': [611, 611], 'Ø': [778, 778], 'Ð': [722, 722], 'ð': [556, 611], 'þ': [556, 611], 'Þ': [667, 667], 'Œ': [1000, 1000], 'œ': [944, 944], '·': [278, 278], '¿': [611, 611], '¡': [333, 333] };
// Windows-1252 characters in 0x80 to 0x9F that names can contain, and their byte.
export const WIN_ANSI_HIGH = { 'Š': 0x8a, 'Œ': 0x8c, 'Ž': 0x8e, 'š': 0x9a, 'œ': 0x9c, 'ž': 0x9e, 'Ÿ': 0x9f };

// Text as the standard fonts can print it. Curly quotes and dashes become plain; letters in
// Windows-1252 (é, ñ, ø, š, ...) stay as written; anything else loses its accent if that makes it
// printable (ő -> o) or becomes "?". `changed` says the printed text differs from the input.
export function printable(s) {
  const src = String(s ?? '').replace(/[‘’′]/g, "'").replace(/[“”″]/g, '"')
    .replace(/[–—−]/g, '-').replace(/…/g, '...').replace(/[  -​ ]/g, ' ');
  let out = '';
  let changed = false;
  for (const ch of src.normalize('NFC')) {
    const code = ch.codePointAt(0);
    if ((code >= 0x20 && code <= 0x7e) || (code >= 0xa0 && code <= 0xff) || WIN_ANSI_HIGH[ch]) { out += ch; continue; }
    const base = ch.normalize('NFKD').replace(/[̀-ͯ]/g, '');
    if (base && [...base].every((c) => c.codePointAt(0) >= 0x20 && c.codePointAt(0) <= 0x7e)) out += base;
    else out += '?';
    changed = true;
  }
  return { text: out, changed };
}

function charWidth(ch, bold) {
  const table = bold ? HELVETICA_BOLD : HELVETICA;
  const code = ch.codePointAt(0);
  if (code >= 32 && code <= 126) return table[code - 32];
  if (EXTRA_WIDTHS[ch]) return EXTRA_WIDTHS[ch][bold ? 1 : 0];
  const base = ch.normalize('NFD')[0];
  const b = base.codePointAt(0);
  if (b >= 32 && b <= 126) return table[b - 32];
  return 556;
}

// Width in points of printable text at a size.
export function textWidth(s, size, bold = false) {
  let w = 0;
  for (const ch of String(s)) w += charWidth(ch, bold);
  return (w * size) / 1000;
}

const round2 = (n) => Math.round(n * 100) / 100;
// The largest size, in quarter points, at which text fits a width (never above max).
function sizeToFit(text, width, max, bold) {
  const w = textWidth(text, 1000, bold) / 1000;
  if (w === 0) return max;
  return Math.min(max, Math.floor((width / w) * 4) / 4);
}

// Text cut to fit a width, ending "..." when cut.
export function cutToFit(s, width, size, bold = false) {
  let t = String(s);
  if (textWidth(t, size, bold) <= width) return t;
  while (t.length && textWidth(`${t}...`, size, bold) > width) t = t.slice(0, -1);
  return `${t.trimEnd()}...`;
}

// One line of text fitted to a width between a largest and smallest size. A big line with spaces
// may wrap onto two lines rather than go below its smallest size; past that it is cut.
// -> { lines: [text], size, shrunk, cut }
export function fitLine(text, width, max, min, { bold = false, wrap = false } = {}) {
  const one = sizeToFit(text, width, max, bold);
  if (one >= min) return { lines: [text], size: one, shrunk: one < max, cut: false };
  const words = text.split(' ');
  if (wrap && words.length > 1) {
    // The split that lets both halves be largest.
    let best = null;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ');
      const b = words.slice(i).join(' ');
      const size = Math.min(sizeToFit(a, width, max, bold), sizeToFit(b, width, max, bold));
      if (!best || size > best.size) best = { lines: [a, b], size };
    }
    if (best.size >= min) return { lines: best.lines, size: best.size, shrunk: true, cut: false };
  }
  return { lines: [cutToFit(text, width, min, bold)], size: min, shrunk: true, cut: true };
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
      if (j === 0 && all.length > 1 && p.length === 1) return cap(p); // o'neil -> O'Neil, d'angelo
      const c = cap(p);
      return /^Mc[a-z]/.test(c) ? `Mc${cap(c.slice(2))}` : c;
    }).join("'")).join('-');
  }).join(' ');
}

export const tidy = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

// ---------- reading the guest list ----------

export function parseCsv(text) {
  const src = String(text ?? '').replace(/^﻿/, '');
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

// The fields a guest can carry, and the column headings each is recognised by (lower case,
// spaces and punctuation ignored).
export const FIELDS = {
  first: ['firstname', 'first', 'givenname', 'forename', 'preferredname', 'preferredfirstname', 'nickname', 'badgename', 'attendeefirstname', 'fname'],
  last: ['lastname', 'last', 'surname', 'familyname', 'attendeelastname', 'lname'],
  full: ['name', 'fullname', 'attendeename', 'guestname', 'guest', 'attendee', 'participant', 'registrant', 'nameonbadge', 'yourname'],
  org: ['company', 'organization', 'organisation', 'org', 'employer', 'school', 'affiliation', 'institution', 'companyname', 'business', 'church', 'chapter'],
  title: ['jobtitle', 'title', 'role', 'position', 'job', 'occupation', 'designation'],
  pronouns: ['pronouns', 'pronoun'],
  extra: ['tickettype', 'badgetype', 'type', 'category', 'group', 'table', 'track', 'team', 'class', 'grade', 'tickettier', 'attendeetype'],
};
export const FIELD_KEYS = Object.keys(FIELDS);
const squash = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');

// Which column holds each field: named ones first (columns: { first: "Given" }), then by heading.
export function mapColumns(header, columns = {}) {
  const map = {};
  const used = new Set();
  for (const [field, heading] of Object.entries(columns ?? {})) {
    const i = header.findIndex((h) => squash(h) === squash(heading));
    if (i < 0) throw new BadgeError(`The column "${heading}" named for ${field} is not in the file. Its headings are: ${header.join(', ')}.`, 'columns');
    map[field] = i;
    used.add(i);
  }
  for (const field of FIELD_KEYS) {
    if (map[field] !== undefined) continue;
    const i = header.findIndex((h, j) => !used.has(j) && FIELDS[field].includes(squash(h)));
    if (i >= 0) { map[field] = i; used.add(i); }
  }
  if (map.first === undefined && map.full === undefined) {
    throw new BadgeError(`The list needs a name column: First name (with Last name) or Name. Its headings are: ${header.join(', ')}. Name them, for example { "first": "Given", "last": "Family" }.`, 'columns');
  }
  return { map, unknown: header.filter((_, i) => !used.has(i)).filter((h) => h.trim() !== '') };
}

// One guest from its raw fields: names tidied (and their case fixed when typed all in capitals or
// all in lower case), a full name split into first and last ("Last, First" reversed).
export function readGuest(raw, { fixNames = true } = {}) {
  const t = (k) => tidy(raw[k]).slice(0, LIMITS.field);
  let first = t('first');
  let last = t('last');
  const full = t('full');
  if (!first && !last && full) {
    const comma = full.indexOf(',');
    if (comma > 0) { last = tidy(full.slice(0, comma)); first = tidy(full.slice(comma + 1)); } else {
      const words = full.split(' ');
      first = words[0];
      last = words.slice(1).join(' ');
    }
  } else if (!first && full) first = full;
  if (fixNames) { first = fixCase(first); last = fixCase(last); }
  return { first, last, org: t('org'), title: t('title'), pronouns: t('pronouns'), extra: t('extra') };
}

// The list as guests: { guests: [{ row, first, last, ... }], mapped, unknown, skipped }.
// `row` is the line in the file (the heading is line 1) or the place in rows (from 1).
export function readGuests({ csv, rows, columns } = {}, { fixNames = true } = {}) {
  let raws;
  let mapped = null;
  let unknown = [];
  if (csv !== undefined && csv !== null) {
    const table = parseCsv(csv);
    if (table.length < 2) throw new BadgeError('The list needs a heading line and at least one guest.', 'csv');
    const [header, ...body] = table;
    const m = mapColumns(header.map((h) => tidy(h)), columns);
    mapped = Object.fromEntries(Object.entries(m.map).map(([f, i]) => [f, tidy(header[i])]));
    unknown = m.unknown;
    raws = body.map((cells) => {
      const r = { row: cells.line };
      for (const [f, i] of Object.entries(m.map)) r[f] = cells[i] ?? '';
      return r;
    });
  } else {
    raws = (rows ?? []).map((r, i) => ({ ...r, row: i + 1 }));
  }
  const guests = [];
  const skipped = [];
  for (const r of raws) {
    const g = readGuest(r, { fixNames });
    if (!g.first && !g.last) { skipped.push({ row: r.row, reason: 'no name' }); continue; }
    guests.push({ row: r.row, ...g });
  }
  if (guests.length > LIMITS.guests) throw new BadgeError(`At most ${LIMITS.guests} guests in one batch; split the list.`, 'csv');
  return { guests, mapped, unknown, skipped };
}

// How many guests a list holds (rows with a name), for the price.
export function countGuests(input) {
  try {
    const { guests } = readGuests(input, { fixNames: false });
    return input.removeDuplicates ? dedupe(guests).kept.length : guests.length;
  } catch { return 0; }
}

const nameKey = (g) => [g.first, g.last, g.org].map((s) => s.toLowerCase()).join('|');
export function dedupe(guests) {
  const seen = new Map();
  const kept = [];
  const dropped = [];
  for (const g of guests) {
    const k = nameKey(g);
    if (seen.has(k)) dropped.push({ row: g.row, sameAs: seen.get(k) }); else { seen.set(k, g.row); kept.push(g); }
  }
  return { kept, dropped };
}

const collate = (a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' });
export function sortGuests(guests, sort) {
  if (sort === 'as-given') return [...guests];
  const key = {
    'last-name': (g) => [g.last || g.first, g.first, g.org],
    'first-name': (g) => [g.first, g.last, g.org],
    organization: (g) => [g.org || '￿', g.last || g.first, g.first],
  }[sort];
  return [...guests].sort((a, b) => {
    const ka = key(a);
    const kb = key(b);
    for (let i = 0; i < ka.length; i++) {
      const c = collate(ka[i], kb[i]);
      if (c) return c;
    }
    return a.row - b.row;
  });
}

// ---------- templates ----------

export const inchText = (pt) => {
  const inches = pt / PT;
  return `${Math.round(inches * 1000) / 1000} in`;
};

// Find a template by its number or any number Avery lists as compatible ("8395", "Avery 5395",
// "Presta 94366").
export function findTemplate(templates, product) {
  const want = String(product ?? '').toLowerCase().replace(/avery|template|#|no\.|\s+/g, ' ').trim();
  const digits = want.replace(/[^0-9]/g, '');
  for (const t of templates) {
    if (t.template === digits) return { template: t, asked: t.template, alias: false };
  }
  for (const t of templates) {
    for (const c of t.compatible) {
      if (c.replace(/[^0-9]/g, '') === digits && digits) return { template: t, asked: c, alias: true };
    }
  }
  return null;
}

export function templateFacts(t) {
  return {
    template: t.template,
    name: t.name,
    nominal: t.nominal,
    perSheet: t.perSheet,
    layout: `${t.cols} across, ${t.rows} down`,
    sheet: `${inchText(t.sheet.w)} x ${inchText(t.sheet.h)}`,
    label: `${inchText(t.label.w)} x ${inchText(t.label.h)}`,
    compatible: t.compatible,
    source: t.source,
  };
}

// Sheets for n badges starting at label `startAt` on the first sheet, and what is left blank.
export function sheetMaths(perSheet, n, { startAt = 1, spares = 0 } = {}) {
  const used = startAt - 1 + n + spares;
  const sheets = Math.max(1, Math.ceil(used / perSheet));
  return { badges: n + spares, sheets, lastSheetBlank: sheets * perSheet - used, skipped: startAt - 1 };
}

// ---------- one badge ----------

// Inner padding: text stays this far inside every label edge (rounded corners, die-cut drift).
export const PAD = 0.12 * PT;

// The text lines of one badge, before fitting: [{ key, text, bold, max, min, wrap, gray }].
function badgeLines(g, t, { style, header, show }) {
  const h = t.label.h;
  const lines = [];
  const q = (n) => Math.floor(n * 4) / 4;
  if (header) lines.push({ key: 'header', text: header, bold: true, max: q(Math.min(11, h * 0.07)), min: 6, gray: 0.35 });
  const full = tidy(`${g.first} ${g.last}`);
  if (style === 'first-only') {
    lines.push({ key: 'name', text: g.first || g.last, bold: true, max: q(Math.min(72, h * 0.42)), min: 14, wrap: true });
  } else if (style === 'full-name') {
    lines.push({ key: 'name', text: full, bold: true, max: q(Math.min(40, h * 0.2)), min: 12, wrap: true });
  } else {
    lines.push({ key: 'name', text: g.first || g.last, bold: true, max: q(Math.min(54, h * 0.3)), min: 14, wrap: true });
    if (g.first && g.last) lines.push({ key: 'fullName', text: full, bold: false, max: q(Math.min(16, h * 0.09)), min: 7 });
  }
  if (style !== 'first-only') {
    if (show.org && g.org) lines.push({ key: 'org', text: g.org, bold: false, max: q(Math.min(13, h * 0.075)), min: 6.5 });
    const role = [show.title && g.title, show.pronouns && g.pronouns ? `(${g.pronouns.replace(/^\(|\)$/g, '')})` : ''].filter(Boolean).join(' ');
    if (role) lines.push({ key: 'title', text: role, bold: false, max: q(Math.min(11, h * 0.065)), min: 6, gray: 0.25 });
  } else if (show.pronouns && g.pronouns) {
    lines.push({ key: 'title', text: `(${g.pronouns.replace(/^\(|\)$/g, '')})`, bold: false, max: q(Math.min(12, h * 0.07)), min: 6, gray: 0.25 });
  }
  if (show.extra && g.extra) lines.push({ key: 'extra', text: g.extra.toUpperCase(), bold: true, max: q(Math.min(10, h * 0.065)), min: 6 });
  return lines.filter((l) => l.text);
}

// One badge laid out inside its label: text pieces with positions relative to the label's top-left
// corner, centred, every line as large as fits (the name first), and what happened to each line.
// -> { texts: [{ text, x, y, size, bold, gray }], nameSize, flags: [] }
export function layoutBadge(g, t, opts) {
  const width = t.label.w - 2 * PAD;
  const height = t.label.h - 2 * PAD;
  const flags = [];
  const fitted = badgeLines(g, t, opts).map((l) => {
    const p = printable(l.text);
    if (p.changed) flags.push({ kind: 'characters', field: l.key, printed: p.text });
    return { ...l, ...fitLine(p.text, width, l.max, l.min, { bold: l.bold, wrap: l.wrap }) };
  });
  // Header on top, extra (ticket type) at the foot, everything else centred between them.
  const lead = (l) => l.size * 1.18;
  const block = (ls) => ls.reduce((s, l) => s + l.lines.length * lead(l), 0);
  let head = fitted.filter((l) => l.key === 'header');
  let foot = fitted.filter((l) => l.key === 'extra');
  let body = fitted.filter((l) => l.key !== 'header' && l.key !== 'extra');
  let total = block(head) + block(foot) + block(body) + (head.length ? 4 : 0) + (foot.length ? 4 : 0);
  if (total > height) {
    // Too tall: every line scaled down together (shrinking never makes a line wider).
    const k = height / total;
    const scale = (l) => ({ ...l, size: Math.floor(l.size * k * 4) / 4, shrunk: true });
    head = head.map(scale); foot = foot.map(scale); body = body.map(scale);
  }
  const texts = [];
  const put = (l, y) => {
    for (const line of l.lines) {
      const w = textWidth(line, l.size, l.bold);
      y += l.size;
      texts.push({ text: line, x: round2(PAD + (width - w) / 2), y: round2(y), size: l.size, bold: l.bold, gray: l.gray ?? 0 });
      y += lead(l) - l.size;
    }
    return y;
  };
  let y = PAD;
  for (const l of head) y = put(l, y) + 4;
  const top = y;
  const bottom = PAD + height - block(foot) - (foot.length ? 4 : 0);
  y = top + Math.max(0, (bottom - top - block(body)) / 2);
  for (const l of body) y = put(l, y);
  y = PAD + height - block(foot);
  for (const l of foot) y = put(l, y);
  const name = [...head, ...body, ...foot].find((l) => l.key === 'name');
  for (const l of [...head, ...body, ...foot]) {
    if (l.cut) flags.push({ kind: 'cut', field: l.key, printed: l.lines.join(' ') });
  }
  if (name && name.lines.length > 1) flags.push({ kind: 'wrapped', field: 'name' });
  return { texts, nameSize: name ? name.size : null, nameMax: name ? name.max : null, flags };
}

// ---------- the whole batch ----------

export const DEFAULT_SHOW = { org: true, title: true, pronouns: true, extra: true };

// Options as given (validated by the server), with defaults.
export function settings(o = {}) {
  return {
    style: o.style ?? 'first-large',
    sort: o.sort ?? 'last-name',
    header: o.header !== undefined ? tidy(o.header) : tidy(o.event ?? ''),
    show: { ...DEFAULT_SHOW, ...(o.show ?? {}) },
    startAt: o.startAt ?? 1,
    spares: o.spares ?? 0,
    fixNames: o.fixNames ?? true,
    removeDuplicates: o.removeDuplicates ?? false,
    nudge: { right: o.nudge?.right ?? 0, down: o.nudge?.down ?? 0 },
    outlines: o.outlines ?? false,
  };
}

const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

export function makeEngine(data) {
  const templates = data.templates;

  const resolve = (product) => {
    const found = findTemplate(templates, product);
    if (!found) {
      throw new BadgeError(`"${product}" is not one of the badge templates here. Use ${templates.map((t) => t.template).join(', ')}, or a number Avery lists as compatible with one of them (for example 8395 or 74459).`, 'product');
    }
    return found;
  };

  // Every badge with its sheet, label number and laid-out text. Spares carry only the header.
  function plan(input) {
    const o = settings(input);
    const { template: t, asked, alias } = resolve(input.product);
    if (o.startAt > t.perSheet) throw new BadgeError(`Avery ${t.template} has ${t.perSheet} labels a sheet, so startAt is 1 to ${t.perSheet}.`, 'startAt');
    const read = readGuests(input, { fixNames: o.fixNames });
    if (!read.guests.length) throw new BadgeError('No guest in the list has a name.', input.csv !== undefined ? 'csv' : 'rows');
    let guests = read.guests;
    let duplicates = [];
    if (o.removeDuplicates) { const d = dedupe(guests); guests = d.kept; duplicates = d.dropped.map((x) => ({ ...x, removed: true })); } else {
      duplicates = dedupe(guests).dropped.map((x) => ({ ...x, removed: false }));
    }
    const ordered = sortGuests(guests, o.sort);
    const maths = sheetMaths(t.perSheet, ordered.length, { startAt: o.startAt, spares: o.spares });
    const badges = [];
    const place = (i) => {
      const slot = o.startAt - 1 + i;
      return { sheet: Math.floor(slot / t.perSheet) + 1, label: (slot % t.perSheet) + 1 };
    };
    ordered.forEach((g, i) => {
      const b = layoutBadge(g, t, o);
      badges.push({ row: g.row, guest: { first: g.first, last: g.last, org: g.org, title: g.title, pronouns: g.pronouns, extra: g.extra }, ...place(i), ...b });
    });
    for (let s = 0; s < o.spares; s++) {
      const b = layoutBadge({ first: '', last: '', org: '', title: '', pronouns: '', extra: '' }, t, o);
      badges.push({ row: null, spare: true, guest: null, ...place(ordered.length + s), ...b });
    }
    const flagged = badges.filter((b) => b.flags.length).map((b) => ({ row: b.row, name: tidy(`${b.guest.first} ${b.guest.last}`), flags: b.flags }));
    const shrunk = badges.filter((b) => !b.spare && b.nameSize !== null && b.nameSize < b.nameMax).length;
    const sizes = badges.filter((b) => !b.spare && b.nameSize !== null).map((b) => b.nameSize);
    return { template: t, asked, alias, o, guests: ordered, badges, maths, flagged, duplicates, skipped: read.skipped, mapped: read.mapped, unknown: read.unknown, shrunk, nameSizes: sizes.length ? { largest: Math.max(...sizes), smallest: Math.min(...sizes) } : null };
  }

  // The answer in words and the summary the API returns (no drawing).
  function summary(p, { event } = {}) {
    const t = p.template;
    const n = p.guests.length;
    const product = p.alias ? `Avery ${p.asked} (template ${t.template}, ${t.perSheet} per sheet` : `Avery ${t.template} (${t.perSheet} per sheet`;
    const parts = [`${plural(n, 'guest')}${p.o.spares ? ` and ${plural(p.o.spares, 'spare badge')}` : ''} fit on ${plural(p.maths.sheets, 'sheet')} of ${product}${p.o.startAt > 1 ? `, starting at label ${p.o.startAt}` : ''})`];
    parts.push(p.maths.lastSheetBlank ? `the last sheet has ${plural(p.maths.lastSheetBlank, 'blank label')} for walk-ins` : 'the last sheet is full');
    const answer = `${parts.join('; ')}.`;
    return {
      answer,
      event: event ?? null,
      template: templateFacts(t),
      asked: p.asked,
      guests: n,
      spares: p.o.spares,
      sheets: p.maths.sheets,
      startAt: p.o.startAt,
      lastSheetBlank: p.maths.lastSheetBlank,
      nameSizes: p.nameSizes,
      shrunk: p.shrunk,
      flagged: p.flagged,
      duplicates: p.duplicates,
      skipped: p.skipped,
      columnsUsed: p.mapped,
      columnsIgnored: p.unknown,
      badges: p.badges.map((b) => ({ row: b.row, name: b.spare ? null : tidy(`${b.guest.first} ${b.guest.last}`), org: b.guest?.org || null, sheet: b.sheet, label: b.label, nameSize: b.nameSize, spare: Boolean(b.spare) })),
    };
  }

  // Walk-ins: up to a sheet's worth of badges placed from label `position` on one sheet.
  function walkin(input) {
    const o = settings(input);
    const { template: t, asked, alias } = resolve(input.product);
    const position = input.position ?? 1;
    if (position > t.perSheet) throw new BadgeError(`Avery ${t.template} has ${t.perSheet} labels a sheet, so position is 1 to ${t.perSheet}.`, 'position');
    const people = (input.guests ?? []).map((g, i) => ({ row: i + 1, ...readGuest(g, { fixNames: o.fixNames }) }));
    if (!people.length || people.some((g) => !g.first && !g.last)) throw new BadgeError('Give each walk-in a first or last name.', 'guests');
    if (position - 1 + people.length > t.perSheet) throw new BadgeError(`${plural(people.length, 'badge')} from label ${position} does not fit on one sheet of ${t.perSheet}; start at label ${t.perSheet - people.length + 1} or earlier.`, 'position');
    const badges = people.map((g, i) => ({ row: g.row, guest: g, sheet: 1, label: position + i, ...layoutBadge(g, t, o) }));
    const flagged = badges.filter((b) => b.flags.length).map((b) => ({ row: b.row, name: tidy(`${b.guest.first} ${b.guest.last}`), flags: b.flags }));
    const labels = badges.map((b) => b.label);
    const where = labels.length === 1 ? `label ${labels[0]}` : `labels ${labels[0]} to ${labels[labels.length - 1]}`;
    const product = alias ? `Avery ${asked} (template ${t.template})` : `Avery ${t.template}`;
    const names = badges.map((b) => tidy(`${b.guest.first} ${b.guest.last}`)).join(', ');
    return { template: t, asked, alias, o, badges, flagged, answer: `${names}: printed on ${where} of one ${product} sheet; feed a sheet with ${where} still on it and leave the rest blank.` };
  }

  return { templates, resolve, plan, summary, walkin };
}

// Event names as a key: case and spacing ignored.
export const eventKey = (s) => tidy(s).toLowerCase();
