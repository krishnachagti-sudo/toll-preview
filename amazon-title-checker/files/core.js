// Amazon title checker: the engine. Pure and dependency-free, so the page and the server run the
// same code. It reads titles (a list, rows or CSV text such as a listings report or flat file),
// and checks each against the rules Amazon published in its own Seller Forums announcements:
//   - 75 characters or less including spaces, all categories except media (from July 27, 2026);
//   - none of the characters ! $ ? _ { } ^ ¬ ¦ unless they are part of the brand name;
//   - no word more than twice, prepositions, articles and conjunctions excepted (both from
//     January 21, 2025).
// The rule numbers, the characters and the exempt word list come in from tool.js
// (data/title-rules.json), each quoted from the post it was read in. A rule that only Amazon's
// signed-in help page states is not checked.
//
// A finding is 'fail' (a published rule is broken) or 'warn' (not a rule, but what the 75 cut does
// to the title: the brand falls past it). Notes explain the count and are never a verdict.
// Titles over the limit get a mechanical split: the text up to the last whole word that fits, and
// the rest as a draft for Item Highlights. It is a cut, not a rewrite.

export class TitleError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'TitleError';
    this.field = field;
  }
}

export const LIMITS = { titles: 10_000, csvChars: 2_500_000, titleChars: 5000 };

// ---------- columns ----------

// Field keys and the column headers each is read from. Headers are compared lowercased with
// everything but letters and digits removed, so "item_name", "Item Name" and "item-name" (the
// listings report) are one header.
export const FIELDS = {
  title: ['title', 'itemname', 'producttitle', 'productname', 'listingtitle', 'name'],
  sku: ['sku', 'sellersku', 'itemsku', 'contributionsku', 'asin', 'asin1', 'productid'],
  brand: ['brand', 'brandname'],
  media: ['media', 'ismedia'],
  highlights: ['itemhighlights', 'itemhighlight', 'highlights'],
};
export const FIELD_KEYS = Object.keys(FIELDS);
export const headerKey = (h) => String(h).toLowerCase().replace(/#\d+/g, '').replace(/[^\p{L}\p{N}]/gu, '');
const fieldOf = (header, columns) => {
  const key = headerKey(header);
  for (const f of FIELD_KEYS) if (columns[f] !== undefined && headerKey(columns[f]) === key) return f;
  return FIELD_KEYS.find((f) => FIELDS[f].includes(key)) ?? null;
};

// ---------- CSV ----------

// The delimiter is whichever of tab, comma and semicolon appears most in the first line (outside
// quotes): Amazon's listings reports are tab-separated, flat files saved as CSV are commas.
function delimiterOf(src) {
  const end = src.search(/\r|\n/);
  const first = end < 0 ? src : src.slice(0, end);
  let best = ',';
  let most = 0;
  for (const d of ['\t', ',', ';']) {
    const n = first.split(d).length - 1;
    if (n > most) { most = n; best = d; }
  }
  return best;
}

export function parseCsv(text) {
  const src = String(text).replace(/^﻿/, '');
  const d = delimiterOf(src);
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"') {
        if (src[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && cell === '') quoted = true;
    else if (ch === d) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(cell); rows.push(row); row = []; cell = '';
    } else cell += ch;
  }
  if (quoted) throw new TitleError('The CSV has a quote that is never closed.', 'csv');
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const text = (v) => (v === undefined || v === null ? '' : String(v));
const truthy = (v) => /^(?:true|yes|y|1|x|media)$/i.test(text(v).trim());

// Reads the titles. `titles` is a list of strings; `rows` are objects keyed by header or field
// key; `csv` is text whose header row names a title column (Amazon flat files have template rows
// above the header, so the first 5 rows are searched), or, when no row does, one title per line.
// Returns { items: [{ line, title, sku?, brand?, media, highlights? }], columnsUsed, headerLine }.
export function readTitles({ titles, rows, csv, columns = {} }) {
  let items;
  let columnsUsed = {};
  if (titles !== undefined) {
    items = titles.map((t, i) => ({ line: i + 1, title: text(t) }));
  } else if (rows !== undefined) {
    items = rows.map((r, i) => {
      const it = { line: i + 1 };
      for (const [h, v] of Object.entries(r)) {
        const f = FIELD_KEYS.includes(h) ? h : fieldOf(h, columns);
        if (f && it[f] === undefined) { it[f] = v; columnsUsed[h] = f; }
      }
      return it;
    });
    if (items.every((it) => it.title === undefined)) throw new TitleError('No title column: name one "title" (or item_name), or map it with columns.title.', 'rows');
  } else {
    const src = String(csv).replace(/^﻿/, '');
    if (src.length > LIMITS.csvChars) throw new TitleError(`A file of at most ${LIMITS.csvChars.toLocaleString('en-US')} characters; split a longer file.`, 'csv');
    const table = parseCsv(src);
    if (!table.length) throw new TitleError('The file is empty.', 'csv');
    const isHeader = (r) => r.some((h) => fieldOf(h, columns) === 'title');
    let at = table.slice(0, 5).findIndex(isHeader);
    // A flat file has a label row ("Product Name") above the attribute row ("item_name"): the
    // header is the last of the consecutive header rows.
    while (at >= 0 && at + 1 < Math.min(table.length, 5) && isHeader(table[at + 1])) at++;
    if (at < 0) {
      // No header: one title per non-empty line, as typed (commas and all).
      items = src.split(/\r\n|\r|\n/).map((t, i) => ({ line: i + 1, title: t })).filter((x) => x.title.trim() !== '');
    } else {
      const headers = table[at].map((h) => h.trim());
      const map = headers.map((h) => fieldOf(h, columns));
      headers.forEach((h, i) => { if (map[i] && !Object.values(columnsUsed).includes(map[i])) columnsUsed[h] = map[i]; });
      items = table.slice(at + 1).map((r, k) => {
        const it = { line: at + 2 + k };
        map.forEach((f, i) => { if (f && it[f] === undefined && Object.keys(columnsUsed).includes(headers[i])) it[f] = r[i] ?? ''; });
        return it;
      });
    }
  }
  items = items.map((it) => ({
    line: it.line,
    title: text(it.title),
    ...(text(it.sku).trim() ? { sku: text(it.sku).trim() } : {}),
    ...(text(it.brand).trim() ? { brand: text(it.brand).trim() } : {}),
    media: truthy(it.media),
    ...(it.highlights !== undefined && text(it.highlights) !== '' ? { highlights: text(it.highlights) } : {}),
  }));
  if (!items.length) throw new TitleError('Give at least one title.', titles !== undefined ? 'titles' : rows !== undefined ? 'rows' : 'csv');
  if (items.length > LIMITS.titles) throw new TitleError(`At most ${LIMITS.titles.toLocaleString('en-US')} titles in one call; split the file.`, titles !== undefined ? 'titles' : rows !== undefined ? 'rows' : 'csv');
  const long = items.find((it) => it.title.length > LIMITS.titleChars);
  if (long) throw new TitleError(`Line ${long.line}: a title of more than ${LIMITS.titleChars.toLocaleString('en-US')} characters is not a title; check the column.`, 'csv');
  return { items, columnsUsed };
}

// The number of titles a call checks (what a file or API call is priced on). Input the engine
// refuses counts 0; validation refuses it before any charge.
export function countTitles(input) {
  try { return readTitles(input).items.length; } catch { return 0; }
}

// ---------- counting ----------

// Characters as Amazon's post counts them: "including spaces". The count is in Unicode code
// points, so an accented letter or a CJK character is one. Emoji, combining marks and joiners can
// be counted differently by other systems, so a title holding them gets a note.
export const charsOf = (s) => Array.from(s);
const ODD = /[\p{M}\p{Extended_Pictographic}​-‍️]/u;

// Words for the repeat rule: split on spaces and , / | ; : +; a hyphenated word ("BPA-Free") is one
// word; punctuation at either end is dropped; letters are compared lowercased. A token with no
// letter (a number, a size like 24, a symbol) is not counted as a word.
const SPLIT = /[\s,/|;:+]+/u;
const EDGE = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;
export function wordsOf(title) {
  return title.split(SPLIT).map((w) => w.replace(EDGE, '').toLowerCase()).filter((w) => /\p{L}/u.test(w));
}

// Where a title over the limit is cut: the longest start of at most `limit` characters that ends
// on a whole word, with separators trimmed from its end. A first word longer than the limit is
// cut at the limit itself.
const SEP_END = /[\s,;:|/+\-–—]+$/u;
const SEP_START = /^[\s,;:|/+\-–—]+/u;
export function cutAt(title, limit) {
  const chars = charsOf(title);
  if (chars.length <= limit) return { title, overflow: '' };
  const next = chars[limit];
  let k = limit;
  if (!/\s/u.test(next)) {
    while (k > 0 && !/\s/u.test(chars[k - 1])) k--;
    if (k === 0) k = limit;
  }
  const head = chars.slice(0, k).join('').replace(SEP_END, '');
  const rest = chars.slice(k).join('').replace(SEP_START, '').trim();
  return { title: head, overflow: rest };
}

// ---------- the engine ----------

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function makeEngine(file) {
  const R = file.rules;
  const exempt = new Set([...file.exemptWords.articles, ...file.exemptWords.prepositions, ...file.exemptWords.conjunctions]);
  const banned = R.bannedChars;
  const Q = file.quotes;
  const src = (key) => file.sources[Q[key].source];

  function checkTitle(raw, { brand = '', media = false, highlights } = {}) {
    const title = text(raw);
    const chars = charsOf(title);
    const length = chars.length;
    const findings = [];
    const notes = [];
    if (!title.trim()) {
      findings.push({ code: 'empty', severity: 'fail', message: 'The title is empty.', fix: 'Write a title.' });
    }
    // 1. Length.
    const over = media ? 0 : Math.max(0, length - R.titleLimit);
    if (over > 0) {
      findings.push({ code: 'length', severity: 'fail', message: `${length} characters, ${over} over the ${R.titleLimit}-character limit.`, fix: `Cut ${over} ${over === 1 ? 'character' : 'characters'}; the cut below keeps the whole words that fit and leaves the rest for Item Highlights.`, source: src('length').url });
    }
    if (media) {
      notes.push(`Marked media: the ${R.titleLimit}-character rule does not apply. Amazon's July 2026 post names no other number for media.${length > R.legacyLimit ? ` This title is also over ${R.legacyLimit}, the limit Amazon's January 2025 post set "for most product categories".` : ''}`);
    }
    if (/^\s|\s$/u.test(title)) notes.push('Spaces at the start or end count as characters.');
    if (/\s{2,}/u.test(title)) notes.push('Two or more spaces in a row each count.');
    if (ODD.test(title)) notes.push('Contains emoji, joiners or combining marks: other systems may count these as more than one character each.');

    // 2. Characters, outside the brand name.
    const brandText = text(brand).trim();
    let masked = title;
    let brandAt = -1;
    if (brandText) {
      const re = new RegExp(escapeRe(brandText), 'giu');
      masked = title.replace(re, (m) => ' '.repeat(m.length));
      const m = new RegExp(escapeRe(brandText), 'iu').exec(title);
      if (m) brandAt = charsOf(title.slice(0, m.index)).length;
    }
    const found = [];
    for (const c of banned) {
      const n = masked.split(c).length - 1;
      if (n) found.push({ char: c, count: n });
    }
    if (found.length) {
      const list = found.map((f) => (f.count > 1 ? `${f.char} (${f.count} times)` : f.char)).join(', ');
      findings.push({ code: 'chars', severity: 'fail', message: `Contains ${list}, not allowed unless part of the brand name.`, fix: `Remove ${found.map((f) => f.char).join(' ')}${brandText ? '' : ', or give the brand name if the character is in it'}.`, chars: found, source: src('chars').url });
    }
    if (brandText && banned.some((c) => brandText.includes(c)) && brandAt >= 0) {
      notes.push(`The brand name "${brandText}" holds a character that is otherwise not allowed; inside the brand name it is allowed.`);
    }

    // 3. Repeats.
    const counts = new Map();
    for (const w of wordsOf(title)) if (!exempt.has(w)) counts.set(w, (counts.get(w) ?? 0) + 1);
    const repeats = [...counts].filter(([, n]) => n > R.maxRepeats).map(([word, count]) => ({ word, count }));
    if (repeats.length) {
      findings.push({ code: 'repeat', severity: 'fail', message: `${repeats.map((r) => `"${r.word}" ${r.count} times`).join(', ')}: no word more than ${R.maxRepeats === 2 ? 'twice' : `${R.maxRepeats} times`}.`, fix: `Use ${repeats.length === 1 ? 'it' : 'each'} at most twice.`, repeats, source: src('repeats').url });
    }

    // 4. Item Highlights given beside the title.
    let highlightsLength = null;
    if (highlights !== undefined) {
      highlightsLength = charsOf(text(highlights)).length;
      if (highlightsLength > R.highlightsLimit) {
        findings.push({ code: 'highlights', severity: 'fail', message: `Item Highlights is ${highlightsLength} characters, ${highlightsLength - R.highlightsLimit} over ${R.highlightsLimit}.`, fix: `Cut Item Highlights to ${R.highlightsLimit} characters.`, source: src('highlights').url });
      }
    }

    // 5. The cut, and what it does to the brand.
    const cut = over > 0 ? cutAt(title, R.titleLimit) : null;
    if (cut) {
      cut.titleLength = charsOf(cut.title).length;
      cut.overflowLength = charsOf(cut.overflow).length;
      cut.fitsHighlights = cut.overflowLength <= R.highlightsLimit;
    }
    if (brandText) {
      if (brandAt < 0) notes.push(`The brand "${brandText}" is not in the title.`);
      else if (!media && brandAt + charsOf(brandText).length > R.titleLimit) {
        findings.push({ code: 'brand-cut', severity: 'warn', message: `The brand "${brandText}" ends at character ${brandAt + charsOf(brandText).length}, past ${R.titleLimit}: cutting the title to ${R.titleLimit} loses it.`, fix: 'Move the brand to the start of the title.' });
      }
    }

    const verdict = findings.some((f) => f.severity === 'fail') ? 'fail' : findings.length ? 'warn' : 'ok';
    return { title, length, limit: media ? null : R.titleLimit, over, media, verdict, findings, notes, cut, ...(highlightsLength !== null ? { highlightsLength } : {}), ...(brandText ? { brand: brandText, brandAt: brandAt >= 0 ? brandAt + 1 : null } : {}) };
  }

  function check(input) {
    const { items, columnsUsed } = readTitles(input);
    const brandAll = text(input.brand).trim();
    const results = items.map((it) => ({
      line: it.line,
      ...(it.sku ? { sku: it.sku } : {}),
      ...checkTitle(it.title, { brand: it.brand ?? brandAll, media: input.media === true || it.media, highlights: it.highlights }),
    }));
    const has = (code) => results.filter((r) => r.findings.some((f) => f.code === code)).length;
    const summary = {
      titles: results.length,
      fail: results.filter((r) => r.verdict === 'fail').length,
      warn: results.filter((r) => r.verdict === 'warn').length,
      ok: results.filter((r) => r.verdict === 'ok').length,
      long: has('length'),
      chars: has('chars'),
      repeat: has('repeat'),
      highlights: has('highlights'),
      brandCut: has('brand-cut'),
      media: results.filter((r) => r.media).length,
      overflowTooLong: results.filter((r) => r.cut && !r.cut.fitsHighlights).length,
    };
    return { answer: answerOf(results, summary), summary, results, fixCsv: fixCsv(results), columnsUsed };
  }

  function answerOf(results, s) {
    const R0 = results[0];
    if (results.length === 1) {
      const parts = [];
      if (R0.media) parts.push(`This title is ${R0.length} characters; it is marked media, so the ${R.titleLimit}-character rule does not apply`);
      else if (R0.over) parts.push(`This title is ${R0.length} characters, ${R0.over} over Amazon's ${R.titleLimit}-character limit`);
      else parts.push(`This title is ${R0.length} characters, within Amazon's ${R.titleLimit}-character limit`);
      const f = (code) => R0.findings.find((x) => x.code === code);
      if (f('chars')) parts.push(`it contains ${f('chars').chars.map((c) => c.char).join(' ')}`);
      if (f('repeat')) parts.push(`it repeats ${f('repeat').repeats.map((r) => `"${r.word}"`).join(' and ')} more than twice`);
      let s1 = parts.join('; ');
      s1 += R0.verdict === 'ok' ? ', and it breaks none of the published rules.' : '.';
      if (R0.cut) s1 += ` Cut at the last whole word it reads "${R0.cut.title}" (${R0.cut.titleLength}), leaving ${R0.cut.overflowLength} characters for Item Highlights.`;
      return s1;
    }
    const t = s.titles;
    if (!s.fail) return `None of your ${t} titles breaks Amazon's published title rules${s.media ? ` (${s.media} marked media)` : ''}${s.brandCut ? `; ${s.brandCut} would lose the brand if cut to ${R.titleLimit}` : ''}.`;
    return `${s.fail} of your ${t} titles ${s.fail === 1 ? 'breaks' : 'break'} Amazon's title rules: ${s.long} ${s.long === 1 ? 'is' : 'are'} over ${R.titleLimit} characters, ${s.chars} ${s.chars === 1 ? 'contains' : 'contain'} a banned character, ${s.repeat} ${s.repeat === 1 ? 'repeats' : 'repeat'} a word more than twice${s.highlights ? `, ${s.highlights} ${s.highlights === 1 ? 'has' : 'have'} Item Highlights over ${R.highlightsLimit}` : ''}.`;
  }

  function rules() {
    return {
      titleLimit: R.titleLimit,
      titleLimitFrom: R.titleLimitFrom,
      countsSpaces: R.countsSpaces,
      exempt: R.exempt,
      highlightsLimit: R.highlightsLimit,
      reviewDays: R.reviewDays,
      legacyLimit: R.legacyLimit,
      bannedChars: [...banned],
      brandException: R.brandException,
      maxRepeats: R.maxRepeats,
      exemptWords: { articles: [...file.exemptWords.articles], prepositions: [...file.exemptWords.prepositions], conjunctions: [...file.exemptWords.conjunctions] },
      quotes: Object.fromEntries(Object.entries(Q).map(([k, q]) => [k, { text: q.text, source: q.source }])),
      sources: file.sources,
      readOn: file.readOn,
      notChecked: [
        'Rules that only Amazon\'s help page "Product title requirements and guidelines" states: it asks for a Seller Central sign-in, so it was not read.',
        'Category style guides.',
        'Plural and other forms of a word: Amazon\'s posts say "the same word".',
      ],
    };
  }

  return { checkTitle, check, rules };
}

// ---------- the fix list ----------

// A cell that starts like a formula is written as text, so a spreadsheet never runs it.
const cell = (v) => {
  let s = v === undefined || v === null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const VERDICT = { ok: 'ok', warn: 'check', fail: 'fix' };
export function fixCsv(results) {
  const head = ['line', 'sku', 'title', 'characters', 'over by', 'verdict', 'problems', 'title cut to the limit', 'overflow (Item Highlights draft)', 'overflow characters'];
  const rows = results.map((r) => [r.line, r.sku ?? '', r.title, r.length, r.over, VERDICT[r.verdict], r.findings.map((f) => f.message).join(' '), r.cut ? r.cut.title : '', r.cut ? r.cut.overflow : '', r.cut ? r.cut.overflowLength : '']);
  return `${[head, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')}\r\n`;
}
