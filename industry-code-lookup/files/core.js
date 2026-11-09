// Industry and product code checker: the engine. Pure and dependency-free, so the page can load
// the same file (README, "core.js is browser-loadable"); tool.js reads the data files and hands them
// in already parsed.
//
// Systems, each from its official table (data/sources.json names the file, its date and hash):
//   naics       NAICS 2022 (United States), 2 to 6 digits, Census; with the 2017 concordance, 1987 SIC
//               by chaining the Census concordances, SBA size standards and OMB's proposed 2027 changes
//   hs          the international HS level (2-digit chapter, 4-digit heading, 6-digit subheading), as
//               carried in the US HTS for chapters 01 to 97
//   hts         the US Harmonized Tariff Schedule (USITC), 4, 6, 8 and 10 digits, current revision
//   schedule-b  US export numbers (Census Schedule B), 10 digits
//   us-sic      US SIC 1987, 4 digits, as reached from NAICS 2022 by the Census concordances
//   uk-sic      UK SIC 2007, the 5-digit condensed list Companies House accepts
//   schedule-c  IRS principal business or professional activity codes for Schedule C, 6 digits
// A code existing is not a ruling that it fits a product or a business: the answers say so.

export class CodeError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'CodeError';
    this.field = field;
  }
}

export const LIMITS = { codes: 5000, codeChars: 40, queryChars: 120, searchResults: 25 };

export const SYSTEMS = ['naics', 'hs', 'hts', 'schedule-b', 'us-sic', 'uk-sic', 'schedule-c'];
export const SYSTEM_NAMES = {
  naics: 'NAICS 2022',
  hs: 'HS (6-digit)',
  hts: 'US HTS',
  'schedule-b': 'Schedule B',
  'us-sic': 'US SIC 1987',
  'uk-sic': 'UK SIC 2007',
  'schedule-c': 'Schedule C business code',
};

const NAICS_LEVELS = { 2: 'sector', 3: 'subsector', 4: 'industry group', 5: 'NAICS industry', 6: 'national industry' };
const RANGE_SECTORS = { 31: '31-33', 32: '31-33', 33: '31-33', 44: '44-45', 45: '44-45', 48: '48-49', 49: '48-49' };

// The HS 2028 headings the WCO's announcement names (21 January 2026): new 21.07 (dietary
// supplements), new 30.07 (vaccines for human medicine) and 30.08 (other vaccines), taking products
// from 30.02. Nothing else is known per code until the WCO publishes the correlation tables.
export const HS2028 = {
  inForce: '2028-01-01',
  accepted: '2026-01-21',
  amendmentSets: 299,
  headings: 1229,
  subheadings: 5852,
  newHeadings: 6,
  deletedHeadings: 5,
  newSubheadings: 428,
  deletedSubheadings: 172,
  named: {
    2107: 'New heading 21.07 for dietary supplements, with new legal Notes.',
    3002: 'Vaccines move out of heading 30.02 into new headings 30.07 (human medicine) and 30.08 (other, including veterinary).',
    3007: 'New heading 30.07 for vaccines for human medicine, with disease-based subheadings.',
    3008: 'New heading 30.08 for other vaccines, including veterinary vaccines.',
    3915: 'Plastic waste is restructured to align with the Basel Convention (hazardous, prior-informed-consent and other plastic waste); heading 39.15 is where HS 2022 puts plastic waste.',
  },
};

// ---------- small helpers ----------

export const digitsOf = (s) => String(s ?? '').replace(/[\s.\-–]/g, '');
const n = (x) => x.toLocaleString('en-US');

export function htsDisplay(d) {
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}.${d.slice(4)}`;
  if (d.length <= 8) return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}.${d.slice(8)}`;
}
export const scheduleBDisplay = (d) => `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`;

// "1.5" ($ million) and 500 (employees) as words.
export function sbaText(s) {
  if (!s) return null;
  const [money, emp] = s;
  const parts = [];
  if (money !== null && money !== undefined) parts.push(typeof money === 'number' ? `$${money % 1 ? money.toFixed(2).replace(/0$/, '') : money} million in average annual receipts` : String(money));
  if (emp !== null && emp !== undefined) parts.push(typeof emp === 'number' ? `${n(emp)} employees` : String(emp));
  return parts.join(' or ');
}

// Splits a pasted column or list into entries: new lines, commas, semicolons and tabs.
export function splitCodes(text) {
  return String(text ?? '').split(/[\n,;\t\r]+/).map((s) => s.trim()).filter(Boolean);
}

const STOP = new Set(['a', 'an', 'and', 'the', 'of', 'for', 'to', 'in', 'on', 'or', 'with', 'my', 'is', 'code', 'codes', 'naics', 'hs', 'hts', 'sic', 'business', 'llc', 'company']);
const stem = (w) => (w.length > 4 && w.endsWith('ies') ? `${w.slice(0, -3)}y` : w.length > 3 && w.endsWith('s') && !w.endsWith('ss') ? w.slice(0, -1) : w);
// "T-shirts" is one word ("tshirt"), so a search for t-shirts does not match every word with a t.
export const wordsOf = (text) => String(text).toLowerCase().replace(/\b([a-z])[-\u2010\u2011]([a-z])/g, '$1$2').replace(/[^a-z0-9]+/g, ' ').split(' ').filter(Boolean).map(stem);
export const queryWords = (q) => [...new Set(String(q).toLowerCase().replace(/\b([a-z])[-\u2010\u2011]([a-z])/g, '$1$2').replace(/[^a-z0-9]+/g, ' ').split(' ').filter((w) => w && !STOP.has(w)).map(stem))];
// Every query word must be a word of the text (after the plural is taken off).
const matches = (words, qw) => qw.every((q) => words.includes(q));

// ---------- the engine ----------

export function makeEngine(files) {
  const N = files.naics;
  const naicsTitle = new Map(N.codes);
  const naicsCodes = N.codes.map(([c]) => c);
  const six = naicsCodes.filter((c) => c.length === 6);
  const codes2017 = new Set(N.codes2017);
  const sicTo = new Map();
  for (const [code, list] of Object.entries(N.sic)) for (const s of list) { if (!sicTo.has(s)) sicTo.set(s, []); sicTo.get(s).push(code); }

  const naicsPath = (code) => {
    const out = [];
    const sector = RANGE_SECTORS[code.slice(0, 2)] ?? code.slice(0, 2);
    out.push({ code: sector, title: naicsTitle.get(sector) });
    for (let len = 3; len <= code.length; len++) out.push({ code: code.slice(0, len), title: naicsTitle.get(code.slice(0, len)) });
    return out;
  };

  // ---------- HTS rows with their full descriptions ----------
  const H = files.hts;
  const htsRows = [];
  const htsByDigits = new Map();
  {
    const stack = [];
    let heading = null;
    H.rows.forEach(([no, indent, desc, general, unit], i) => {
      const d = no.replace(/\./g, '');
      if (d.length === 4) { heading = { d, desc }; stack.length = 0; }
      while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop();
      const parent = stack.length ? stack[stack.length - 1] : null;
      const path = [...stack.map((s) => s.desc), desc].filter(Boolean);
      const row = { i, no, d, indent, desc, general, unit, path, parent, heading: heading?.d ?? null };
      htsRows.push(row);
      stack.push(row);
      if (d) htsByDigits.set(d, row);
    });
  }
  // A 10-digit line with suffix written in one row (0802.70.10.00) also stands for its 8-digit line.
  const htsLine = (d) => {
    if (htsByDigits.has(d)) return htsByDigits.get(d);
    if (d.length === 8 && htsByDigits.has(`${d}00`)) return htsByDigits.get(`${d}00`);
    return null;
  };
  const htsChildren = (d) => htsRows.filter((r) => r.d.length > d.length && r.d.startsWith(d));
  // The general (column 1) duty rate: a 10-digit statistical line takes its 8-digit line's rate.
  const htsRate = (row) => {
    if (row.general) return row.general;
    const p = row.d.length === 10 ? htsLine(row.d.slice(0, 8)) : null;
    return p?.general || null;
  };
  const joinPath = (path) => path.map((p) => p.replace(/[:;,]\s*$/, '')).filter(Boolean).join(': ');
  const fullText = (row) => joinPath(row.path);

  // HS six-digit subheadings: every 6-digit code the HTS carries in chapters 01 to 97.
  const hs6 = new Map();
  for (const r of htsRows) {
    if (r.d.length < 6 || r.d.startsWith('98') || r.d.startsWith('99')) continue;
    const k = r.d.slice(0, 6);
    if (!hs6.has(k)) hs6.set(k, []);
    hs6.get(k).push(r);
  }
  const hs6Title = (k) => {
    const own = htsByDigits.get(k);
    if (own) return own.path;
    const lines = hs6.get(k);
    const first = lines[0];
    const top = lines.filter((r) => r.d.length >= 8 && r.indent === first.indent);
    if (top.length === 1 && !first.parent?.d) {
      // One national line: it is the subheading itself, unless an unnumbered parent row names it.
      return first.path;
    }
    if (first.parent && !first.parent.d) return first.parent.path;
    return first.path;
  };
  const hs4 = new Map(htsRows.filter((r) => r.d.length === 4 && !r.d.startsWith('98') && !r.d.startsWith('99')).map((r) => [r.d, r]));
  const chapters = new Map();
  for (const r of htsRows) {
    if (!r.d) continue;
    const ch = r.d.slice(0, 2);
    if (!chapters.has(ch)) chapters.set(ch, { ch, headings: [], lines: 0, stat: 0, rate: 0 });
    const c = chapters.get(ch);
    if (r.d.length === 4) c.headings.push(r.d);
    if (r.d.length === 10) c.stat++;
    if (r.d.length === 8 || (r.d.length === 10 && !htsByDigits.has(r.d.slice(0, 8)))) c.rate++;
  }

  // Chapter and section titles, as the USITC site lists them.
  const chapterInfo = new Map();
  for (const sec of files.small.htsSections ?? []) for (const [nn, title] of sec.chapters) chapterInfo.set(nn, { title, section: sec.section, sectionLabel: sec.label });

  // ---------- Schedule B ----------
  const B = new Map(files.scheduleB.rows.map(([code, desc, naics]) => [code, { code, desc, naics }]));
  const bByHs6 = new Map();
  for (const r of B.values()) { const k = r.code.slice(0, 6); if (!bByHs6.has(k)) bByHs6.set(k, []); bByHs6.get(k).push(r); }

  // ---------- the small tables ----------
  const UK = new Map(files.small.ukSic.rows.map(([code, desc, section]) => [code, { code, desc, section }]));
  const ukSections = new Map(files.small.ukSic.sections);
  const SC = new Map(files.small.scheduleC.rows.map(([code, title, category, sub]) => [code, { code, title, category, sub }]));

  const S = files.sources;
  const SRC = {
    naics: { name: 'Census Bureau: NAICS 2022 codes, descriptions and index', url: 'https://www.census.gov/naics/', edition: 'NAICS 2022', readOn: S.readOn },
    sba: { name: 'SBA: Table of Size Standards, effective March 17, 2023', url: 'https://www.sba.gov/document/support-table-size-standards', edition: 'March 17, 2023', readOn: S.readOn },
    n2027: { name: 'OMB: NAICS updates for 2027 (proposed), 91 FR 42976, July 13, 2026', url: 'https://www.govinfo.gov/content/pkg/FR-2026-07-13/pdf/2026-14086.pdf', edition: 'proposed', readOn: S.readOn },
    hts: { name: `USITC: Harmonized Tariff Schedule, ${H.revision}`, url: 'https://hts.usitc.gov/', edition: `${H.revision}, effective ${H.effective}`, readOn: S.readOn },
    scheduleB: { name: 'Census Bureau: Schedule B export codes (2026 concordance)', url: 'https://www.census.gov/foreign-trade/schedules/b/index.html', edition: '2026', readOn: S.readOn },
    ukSic: { name: 'Companies House: condensed SIC 2007 list (Open Government Licence v3.0)', url: 'https://www.gov.uk/government/publications/standard-industrial-classification-of-economic-activities-sic', edition: 'UK SIC 2007', readOn: S.readOn },
    scheduleC: { name: 'IRS: Instructions for Schedule C (Form 1040) (2025), activity codes', url: 'https://www.irs.gov/instructions/i1040sc', edition: '2025 instructions', readOn: S.readOn },
    sic: { name: 'Census Bureau: NAICS concordances 2022 to 2002 and 2002 NAICS to 1987 SIC', url: 'https://www.census.gov/naics/?68967', edition: 'chained concordances', readOn: S.readOn },
  };

  // ---------- one record per system ----------

  function naicsRecord(code) {
    const title = naicsTitle.get(code);
    if (!title) return null;
    const level = code.includes('-') ? 2 : code.length;
    const rec = {
      system: 'naics', code, valid: true, status: 'valid', title, level: NAICS_LEVELS[level], edition: 'NAICS 2022',
      path: level === 2 ? [{ code, title }] : naicsPath(code),
      notes: [],
    };
    if (level === 6) {
      rec.description = N.desc[code] ?? null;
      rec.index = N.index[code] ?? [];
      const sba = N.sba[code];
      rec.sba = sba ? { receiptsMillions: typeof sba[0] === 'number' ? sba[0] : null, employees: typeof sba[1] === 'number' ? sba[1] : null, text: sbaText(sba), footnote: sba[2] ?? null } : null;
      rec.naics2017 = N.to2017[code] ?? [code];
      rec.sic = (N.sic[code] ?? []).map((s) => ({ code: s, title: N.sicTitles[s] }));
      rec.scheduleC = SC.has(code) ? { code, title: SC.get(code).title } : null;
    }
    const next = N.n2027[code];
    if (next) {
      const same = next.to.length === 1 && next.to[0][0] === code;
      rec.next = {
        edition: 'NAICS 2027 (proposed)',
        change: same ? 'title' : next.to.length > 1 ? 'split' : next.part ? 'part moves' : 'combined',
        to: next.to.map(([c, t]) => ({ code: c, title: t })),
        part: next.part ?? null,
      };
    } else if (N.titles2027[code]) {
      rec.next = { edition: 'NAICS 2027 (proposed)', change: 'title', to: [{ code, title: N.titles2027[code] }], part: null };
    } else {
      rec.next = { edition: 'NAICS 2027 (proposed)', change: 'none', to: [{ code, title }], part: null };
    }
    rec.answer = naicsAnswer(rec);
    rec.sources = [SRC.naics, ...(rec.sba ? [SRC.sba] : []), SRC.n2027];
    return rec;
  }

  function nextText(next) {
    if (!next || next.change === 'none') return 'no change is proposed for NAICS 2027';
    const to = next.to.map((t) => `${t.code} ${t.title}`).join(' and ');
    if (next.change === 'title') return `NAICS 2027 proposes the new title "${next.to[0].title}"`;
    if (next.change === 'split') return `NAICS 2027 proposes splitting it into ${to}`;
    if (next.change === 'part moves') return `NAICS 2027 proposes moving ${next.part} to ${to}`;
    return `NAICS 2027 proposes combining it into ${to}`;
  }

  function naicsAnswer(rec) {
    const lvl = rec.level;
    let s = `${rec.code} is a valid NAICS 2022 code (${lvl}): ${rec.title}`;
    if (rec.sba?.text) s += `; SBA size standard ${rec.sba.text}`;
    s += `; ${nextText(rec.next)}.`;
    return s;
  }

  function naicsCheck(d, raw) {
    let code = d;
    if (/^(31|32|33|44|45|48|49)$/.test(d) || /^(3133|4445|4849)$/.test(d)) code = RANGE_SECTORS[d.slice(0, 2)];
    if (/^\d{2}-\d{2}$/.test(String(raw).trim())) code = String(raw).trim();
    const rec = naicsTitle.has(code) ? naicsRecord(code) : null;
    if (rec) {
      if (code !== d && RANGE_SECTORS[d.slice(0, 2)] && d.length === 2) rec.notes.push(`Sector ${d} is part of sector ${code}.`);
      return rec;
    }
    if (!/^\d{2,6}$/.test(d)) return miss('naics', d, 'malformed', `"${raw}" is not a NAICS code: NAICS codes are 2 to 6 digits.`);
    if (d.length === 6 && codes2017.has(d)) {
      const to = N.from2017[d] ?? [d];
      return {
        system: 'naics', code: d, valid: false, status: 'retired', title: N.titles2017[d] ?? null, edition: 'NAICS 2017',
        replacedBy: to.map((c) => ({ code: c, title: naicsTitle.get(c) })),
        notes: ['This is a NAICS 2017 code that NAICS 2022 replaced.'],
        answer: `${d} is not in NAICS 2022: it is a NAICS 2017 code${N.titles2017[d] ? ` (${N.titles2017[d]})` : ''}, ${to.length === 1 ? `now ${to[0]} ${naicsTitle.get(to[0])}` : to.length <= 3 ? `now split across ${to.map((c) => `${c} ${naicsTitle.get(c)}`).join(', ')}` : `now split across ${to.length} NAICS 2022 codes, such as ${to.slice(0, 3).map((c) => `${c} ${naicsTitle.get(c)}`).join(', ')}`}.`,
        sources: [SRC.naics],
      };
    }
    const parent = [5, 4, 3, 2].map((l) => d.slice(0, l)).find((p) => naicsTitle.has(p) || naicsTitle.has(RANGE_SECTORS[p] ?? ''));
    const out = miss('naics', d, 'not-found', `${d} is not a NAICS 2022 code.${parent ? ` Its first digits, ${parent}, are ${naicsTitle.get(parent) ?? naicsTitle.get(RANGE_SECTORS[parent])}.` : ''}`);
    if (parent) out.nearest = { code: naicsTitle.has(parent) ? parent : RANGE_SECTORS[parent], title: naicsTitle.get(parent) ?? naicsTitle.get(RANGE_SECTORS[parent]) };
    return out;
  }

  function miss(system, code, status, answer, extra = {}) {
    return { system, code, valid: false, status, title: null, answer, notes: [], ...extra };
  }

  function hsCheck(d, raw) {
    if (!/^\d{2}$|^\d{4}$|^\d{6}$/.test(d)) {
      if (/^\d{8}$|^\d{10}$/.test(d)) {
        const r = hsCheck(d.slice(0, 6), raw);
        r.notes.unshift(`HS codes are 6 digits; the digits after the sixth are national. Checked ${htsDisplay(d.slice(0, 6))}; check the full number as an HTS or Schedule B number.`);
        r.input6 = true;
        return r;
      }
      return miss('hs', d, 'malformed', `"${raw}" is not an HS code: HS codes are 2 (chapter), 4 (heading) or 6 (subheading) digits.`);
    }
    if (d.startsWith('98') || d.startsWith('99') || d === '77') return miss('hs', d, 'not-found', `${d} is not an HS code: chapter 77 is reserved and chapters 98 and 99 are US-only.`);
    if (d.length === 2) {
      const c = chapters.get(d);
      if (!c) return miss('hs', d, 'not-found', `${d} is not an HS chapter.`);
      const subs = [...hs6.keys()].filter((k) => k.startsWith(d));
      const title = chapterInfo.get(d)?.title ?? `Chapter ${d}`;
      return { system: 'hs', code: d, valid: true, status: 'valid', level: 'chapter', title, edition: 'HS 2022', notes: [],
        headings: c.headings.length, subheadings: subs.length,
        answer: `HS chapter ${d} (${title}) has ${c.headings.length} headings and ${subs.length} six-digit subheadings (as carried in the US HTS, ${H.revision}).`, sources: [SRC.hts] };
    }
    if (d.length === 4) {
      const h = hs4.get(d);
      if (!h) {
        const later = HS2028.named[d];
        return miss('hs', d, 'not-found', `${htsDisplay(d)} is not an HS 2022 heading in the US HTS (${H.revision}).${later ? ` HS 2028 (in force January 1, 2028): ${later}` : ''}`, later ? { next: hs2028(d) } : {});
      }
      const subs = [...hs6.keys()].filter((k) => k.startsWith(d));
      const rec = { system: 'hs', code: htsDisplay(d), digits: d, valid: true, status: 'valid', level: 'heading', title: h.desc, edition: 'HS 2022', notes: [], subheadings: subs.map((k) => ({ code: htsDisplay(k), title: joinPath(hs6Title(k)) })), sources: [SRC.hts] };
      rec.next = hs2028(d);
      rec.answer = `${htsDisplay(d)} is a valid HS heading: ${h.desc.replace(/:$/, '')}; ${subs.length} six-digit subheading${subs.length === 1 ? '' : 's'}.`;
      return rec;
    }
    if (!hs6.has(d)) {
      const head = hs4.get(d.slice(0, 4));
      return miss('hs', htsDisplay(d), 'not-found', `${htsDisplay(d)} is not an HS subheading in the US HTS (${H.revision}).${head ? ` Heading ${htsDisplay(d.slice(0, 4))} is ${head.desc}` : ''}`, head ? { nearest: { code: htsDisplay(d.slice(0, 4)), title: head.desc } } : {});
    }
    const title = hs6Title(d);
    const lines = hs6.get(d).filter((r) => r.d.length === 10).length;
    const sb = bByHs6.get(d)?.length ?? 0;
    const rec = {
      system: 'hs', code: htsDisplay(d), digits: d, valid: true, status: 'valid', level: 'subheading', title: joinPath(title), path: [{ code: htsDisplay(d.slice(0, 4)), title: hs4.get(d.slice(0, 4))?.desc }], edition: 'HS 2022',
      notes: [`The first 6 digits are international. The US needs 10 digits: ${lines} HTS statistical number${lines === 1 ? '' : 's'} for imports and ${sb} Schedule B number${sb === 1 ? '' : 's'} for exports start with ${htsDisplay(d)}.`],
      htsLines: lines, scheduleBLines: sb, next: hs2028(d), sources: [SRC.hts],
    };
    rec.answer = `${htsDisplay(d)} is a valid HS subheading: ${rec.title}`.replace(/:?\s*$/, '') + `; HS 2028 (in force January 1, 2028): ${rec.next.text}`;
    return rec;
  }

  function hs2028(d) {
    const h = d.slice(0, 4);
    const named = HS2028.named[h];
    return { edition: 'HS 2028', inForce: HS2028.inForce, named: Boolean(named), text: named ?? 'the WCO has not yet published the correlation tables that say which codes change.' };
  }

  function htsCheck(d, raw) {
    if (!/^\d{4}$|^\d{6}$|^\d{8}$|^\d{10}$/.test(d)) return miss('hts', d, 'malformed', `"${raw}" is not an HTS number: HTS numbers are 4, 6, 8 or 10 digits, such as 6109.10.00.12.`);
    const row = htsLine(d);
    if (!row) {
      let p = null;
      for (const l of [8, 6, 4]) if (d.length > l && htsLine(d.slice(0, l))) { p = htsLine(d.slice(0, l)); break; }
      const ex = d.length === 10 && p && p.d.length === 8 ? htsChildren(p.d).filter((r) => r.d.length === 10).map((r) => htsDisplay(r.d)) : [];
      return miss('hts', htsDisplay(d), 'not-found', `${htsDisplay(d)} is not in the US HTS (${H.revision}).${p ? ` ${htsDisplay(p.d.length === 10 ? p.d.slice(0, 8) : p.d)} is: ${fullText(p)}.` : ''}${ex.length ? ` Its statistical numbers are ${ex.slice(0, 8).join(', ')}${ex.length > 8 ? ' and more' : ''}.` : ''}`,
        p ? { nearest: { code: htsDisplay(p.d.length === 10 && d.length < 10 ? p.d.slice(0, 8) : p.d), title: fullText(p) }, statistical: ex } : {});
    }
    const level = d.length === 4 ? 'heading' : d.length === 6 ? 'subheading' : d.length === 8 ? 'tariff line' : 'statistical number';
    const rate = d.length >= 8 ? htsRate(row) : null;
    const stat = d.length === 8 && row.d.length === 8 ? htsChildren(d).filter((r) => r.d.length === 10) : [];
    const rec = {
      system: 'hts', code: htsDisplay(d), digits: d, valid: true, status: 'valid', level, title: fullText(row), edition: H.revision,
      generalRate: rate, unit: row.unit || null, notes: [], sources: [SRC.hts],
    };
    if (d.length === 8 && row.d.length === 10) rec.notes.push(`The 8-digit line has one statistical number, ${htsDisplay(row.d)}: use that 10-digit number on an entry.`);
    if (stat.length) {
      rec.statistical = stat.map((r) => ({ code: htsDisplay(r.d), title: r.desc }));
      rec.notes.push(`An entry needs one of its ${stat.length} 10-digit statistical numbers.`);
    }
    if (d.length < 8) rec.notes.push('A heading or subheading is not enough on an entry: the US needs a 10-digit number.');
    if (!d.startsWith('98') && !d.startsWith('99') && d.length >= 6) {
      const sb = bByHs6.get(d.slice(0, 6)) ?? [];
      rec.scheduleB = { count: sb.length, same: d.length === 10 && B.has(d) };
      if (d.length === 10) rec.notes.push(B.has(d) ? `${htsDisplay(d)} is also a Schedule B export number.` : `${htsDisplay(d)} is not a Schedule B number; ${sb.length} Schedule B number${sb.length === 1 ? '' : 's'} share${sb.length === 1 ? 's' : ''} its first 6 digits.`);
    }
    if (d.startsWith('99')) rec.notes.push('Chapter 99 holds temporary and additional duties; it is reported alongside a chapter 1 to 97 number, not instead of it.');
    if (d.startsWith('98')) rec.notes.push('Chapter 98 holds US special classification provisions.');
    rec.answer = `${htsDisplay(d)} is a valid US HTS ${level} (${H.revision}): ${rec.title.replace(/:$/, '')}${rate ? `; general duty ${rate}` : ''}.`;
    return rec;
  }

  function scheduleBCheck(d, raw) {
    if (!/^\d{10}$/.test(d)) return miss('schedule-b', d, 'malformed', `"${raw}" is not a Schedule B number: Schedule B numbers are 10 digits, such as 6109.10.0012.`);
    const r = B.get(d);
    if (!r) {
      const same = bByHs6.get(d.slice(0, 6)) ?? [];
      const hts = htsLine(d);
      return miss('schedule-b', scheduleBDisplay(d), 'not-found', `${scheduleBDisplay(d)} is not a Schedule B number (2026).${hts ? ' It is a US HTS import number; exports need a Schedule B number.' : ''}${same.length ? ` ${same.length} Schedule B number${same.length === 1 ? '' : 's'} start${same.length === 1 ? 's' : ''} with ${htsDisplay(d.slice(0, 6))}.` : ''}`,
        { alternatives: same.slice(0, 12).map((x) => ({ code: scheduleBDisplay(x.code), title: x.desc })) });
    }
    const naics = r.naics && naicsTitle.has(r.naics) ? { code: r.naics, title: naicsTitle.get(r.naics) } : r.naics ? { code: r.naics, title: null } : null;
    const rec = {
      system: 'schedule-b', code: scheduleBDisplay(d), digits: d, valid: true, status: 'valid', level: 'export number', title: r.desc, edition: 'Schedule B 2026',
      naics, alsoHts: Boolean(htsLine(d)), notes: [], sources: [SRC.scheduleB],
    };
    rec.notes.push(rec.alsoHts ? 'The same 10 digits are also a US HTS import number.' : 'The same 10 digits are not a US HTS import number: imports use the HTS.');
    rec.answer = `${scheduleBDisplay(d)} is a valid Schedule B export number (2026): ${r.desc}.`;
    return rec;
  }

  function usSicCheck(d, raw) {
    if (!/^\d{4}$/.test(d)) return miss('us-sic', d, 'malformed', `"${raw}" is not a US SIC code: SIC 1987 industries are 4 digits.`);
    const title = N.sicTitles[d];
    if (!title) return miss('us-sic', d, 'not-found', `${d} is not a SIC 1987 industry that the Census concordances link to NAICS 2022.`);
    const to = (sicTo.get(d) ?? []).sort();
    return {
      system: 'us-sic', code: d, valid: true, status: 'valid', level: 'industry', title, edition: 'SIC 1987', notes: ['SIC 1987 is no longer revised: NAICS replaced it in 1997.'],
      naics2022: to.map((c) => ({ code: c, title: naicsTitle.get(c) })),
      answer: `${d} is a SIC 1987 industry: ${title}; it maps to NAICS 2022 ${to.slice(0, 6).join(', ')}${to.length > 6 ? ` and ${to.length - 6} more` : ''}.`,
      sources: [SRC.sic],
    };
  }

  function ukSicCheck(d, raw) {
    if (!/^\d{4,5}$/.test(d)) return miss('uk-sic', d, 'malformed', `"${raw}" is not a UK SIC code: Companies House takes 5 digits, such as 62012.`);
    const code = d.length === 4 ? `${d}0` : d;
    const r = UK.get(code);
    if (!r) {
      const near = [...UK.values()].filter((x) => x.code.startsWith(d.slice(0, 4)));
      return miss('uk-sic', code, 'not-found', `${code} is not on the Companies House SIC 2007 list.${near.length ? ` Codes starting ${d.slice(0, 4)}: ${near.map((x) => `${x.code} ${x.desc}`).join('; ')}.` : ''}`);
    }
    const rec = {
      system: 'uk-sic', code, valid: true, status: 'valid', level: 'subclass', title: r.desc, edition: 'UK SIC 2007', section: r.section ? { code: r.section, title: ukSections.get(r.section) } : null,
      notes: d.length === 4 ? [`Read ${d} as ${code}: Companies House takes 5 digits.`] : [], sources: [SRC.ukSic],
    };
    rec.answer = `${code} is on the Companies House SIC 2007 list: ${r.desc}${rec.section ? ` (section ${rec.section.code}, ${rec.section.title})` : ''}.`;
    return rec;
  }

  function scheduleCCheck(d, raw) {
    if (!/^\d{6}$/.test(d)) return miss('schedule-c', d, 'malformed', `"${raw}" is not a Schedule C business code: they are 6 digits, such as 492000.`);
    const r = SC.get(d);
    if (!r) {
      const nt = naicsTitle.get(d);
      return miss('schedule-c', d, 'not-found', `${d} is not on the IRS list of Schedule C activity codes (2025 instructions).${nt ? ` It is a NAICS 2022 code (${nt}), but Schedule C line B takes only the codes on the IRS list.` : ''}`);
    }
    const rec = {
      system: 'schedule-c', code: d, valid: true, status: 'valid', level: 'activity code', title: r.title, edition: 'Schedule C instructions, 2025',
      category: r.category, subcategory: r.sub, naics: naicsTitle.has(d) ? { code: d, title: naicsTitle.get(d) } : null, notes: [], sources: [SRC.scheduleC],
    };
    rec.answer = `${d} is on the IRS list of Schedule C activity codes (2025 instructions): ${r.title}${r.category ? `, under ${r.category}` : ''}.`;
    return rec;
  }

  const CHECKERS = { naics: naicsCheck, hs: hsCheck, hts: htsCheck, 'schedule-b': scheduleBCheck, 'us-sic': usSicCheck, 'uk-sic': ukSicCheck, 'schedule-c': scheduleCCheck };

  // Which systems a code of this shape could belong to, in the order "auto" tries them.
  function systemsFor(d) {
    if (!/^\d+$/.test(d)) return [];
    switch (d.length) {
      case 2: return ['naics', 'hs'];
      case 3: return ['naics'];
      case 4: return ['naics', 'hs', 'hts', 'us-sic', 'uk-sic'];
      case 5: return ['naics', 'uk-sic'];
      case 6: return ['naics', 'schedule-c', 'hs', 'hts'];
      case 8: return ['hts'];
      case 10: return ['hts', 'schedule-b'];
      default: return [];
    }
  }

  function checkOne(raw, system = 'auto') {
    const text = String(raw ?? '').trim();
    const d = /^\d{2}-\d{2}$/.test(text) ? text : digitsOf(text);
    if (!text) return { input: text, system, valid: false, status: 'malformed', answer: 'Empty entry.', notes: [] };
    if (system !== 'auto') {
      const r = CHECKERS[system](/^\d{2}-\d{2}$/.test(d) ? d : d, text);
      return { input: text, ...r };
    }
    if (/^\d{2}-\d{2}$/.test(d)) return { input: text, ...naicsCheck(d, text) };
    const tries = systemsFor(d);
    if (!tries.length) {
      return { input: text, system: 'auto', code: d, valid: false, status: 'malformed', notes: [], matches: [],
        answer: `"${text}" is not a code these tables use: NAICS is 2 to 6 digits, HS 2 to 6, HTS 4 to 10, Schedule B 10, US SIC 4, UK SIC 5 and Schedule C 6.` };
    }
    const all = tries.map((s) => CHECKERS[s](d, text));
    // An HTS heading or subheading is the HS one: name it once.
    const found = all.filter((r) => r.valid && !(r.system === 'hts' && d.length <= 6 && all.some((x) => x.system === 'hs' && x.valid)));
    const retired = all.find((r) => r.status === 'retired');
    if (!found.length && retired) return { input: text, ...retired, matches: [] };
    if (!found.length) {
      return { input: text, system: 'auto', code: d, valid: false, status: 'not-found', notes: [], matches: [],
        answer: `${text} is not in any of the tables a ${d.length}-digit code could belong to (${tries.map((s) => SYSTEM_NAMES[s]).join(', ')}).` };
    }
    const first = found[0];
    return {
      input: text, ...first, matches: found.map((r) => ({ system: r.system, code: r.code, title: r.title, level: r.level })),
      answer: found.length === 1 ? first.answer : `${text} is valid in ${found.length} systems: ${found.map((r) => `${SYSTEM_NAMES[r.system]} (${r.title.replace(/:$/, '')})`).join('; ')}. Give a system to check just one.`,
    };
  }

  function check({ codes, system = 'auto' }) {
    if (!Array.isArray(codes) || !codes.length) throw new CodeError('Give at least one code.', 'codes');
    if (codes.length > LIMITS.codes) throw new CodeError(`At most ${n(LIMITS.codes)} codes in one call; split a longer list.`, 'codes');
    if (system !== 'auto' && !SYSTEMS.includes(system)) throw new CodeError(`system must be "auto" or one of ${SYSTEMS.join(', ')}.`, 'system');
    const results = codes.map((c) => checkOne(c, system));
    const valid = results.filter((r) => r.valid).length;
    const retired = results.filter((r) => r.status === 'retired').length;
    const malformed = results.filter((r) => r.status === 'malformed').length;
    const changing = results.filter((r) => r.next && r.next.change && r.next.change !== 'none').length;
    const parts = [`${n(valid)} of ${n(results.length)} valid`];
    if (retired) parts.push(`${n(retired)} retired (NAICS 2017)`);
    if (malformed) parts.push(`${n(malformed)} not in a code format`);
    if (changing) parts.push(`${n(changing)} with a proposed NAICS 2027 change`);
    const used = [...new Set(results.flatMap((r) => r.sources ?? []).map((s) => s.name))];
    return {
      op: 'check', system, answer: `${parts.join('; ')}.`,
      summary: { codes: results.length, valid, invalid: results.length - valid, retired, malformed, changing },
      results,
      sources: Object.values(SRC).filter((s) => used.includes(s.name)),
    };
  }

  // ---------- search ----------

  let searchIndex = null;
  function buildSearch() {
    const naicsLines = [];
    for (const c of six) {
      naicsLines.push({ code: c, text: naicsTitle.get(c), kind: 'title' });
      for (const e of N.index[c] ?? []) naicsLines.push({ code: c, text: e, kind: 'index' });
    }
    for (const l of naicsLines) l.words = wordsOf(l.text);
    const hts = htsRows.filter((r) => r.d.length >= 8 && !r.d.startsWith('99')).map((r) => ({ code: r.d, levels: r.path.map(wordsOf), words: wordsOf(r.path.join(' ')), row: r }));
    const sb = [...B.values()].map((r) => ({ code: r.code, words: wordsOf(r.desc), r }));
    const uk = [...UK.values()].map((r) => ({ code: r.code, words: wordsOf(r.desc), r }));
    const sc = [...SC.values()].map((r) => ({ code: r.code, words: wordsOf(`${r.title} ${r.sub ?? ''}`), r }));
    searchIndex = { naicsLines, hts, sb, uk, sc };
    return searchIndex;
  }

  // Official lines that contain every word asked, best first: lines whose own text has the words,
  // then shorter text, then code order. Deterministic: the same words give the same list.
  function search({ query, system = 'naics', limit = LIMITS.searchResults }) {
    const q = String(query ?? '').trim();
    if (!q) throw new CodeError('Type a word or two to search for, such as "restaurant".', 'query');
    if (q.length > LIMITS.queryChars) throw new CodeError(`Keep the search under ${LIMITS.queryChars} characters.`, 'query');
    if (!SYSTEMS.includes(system) || system === 'us-sic') throw new CodeError('system must be naics, hs, hts, schedule-b, uk-sic or schedule-c for a search.', 'system');
    const qw = queryWords(q);
    if (!qw.length) throw new CodeError('Use words that describe the activity or product, such as "landscaping" or "cotton t-shirts".', 'query');
    const ix = searchIndex ?? buildSearch();
    let results = [];
    if (system === 'naics') {
      const best = new Map();
      for (const l of ix.naicsLines) {
        if (!matches(l.words, qw)) continue;
        const score = (l.kind === 'title' ? 0 : 1) * 1000 + l.text.length;
        const cur = best.get(l.code);
        if (!cur || score < cur.score) best.set(l.code, { score, line: l, count: (cur?.count ?? 0) + 1 });
        else cur.count++;
      }
      results = [...best.values()].sort((a, b) => b.count - a.count || a.score - b.score || (a.line.code < b.line.code ? -1 : 1))
        .map((x) => {
          const sba = N.sba[x.line.code];
          return { system: 'naics', code: x.line.code, title: naicsTitle.get(x.line.code), matched: x.line.text, matchedIn: x.line.kind === 'title' ? 'title' : 'Census index', indexMatches: x.count, sba: sbaText(sba) };
        });
    } else if (system === 'hts' || system === 'hs') {
      // Depth: the first level of the description that names a word asked (the heading naming it
      // ranks before a line deep under "Other"), then the shorter description.
      const depth = (r) => r.levels.findIndex((lv) => qw.some((q) => lv.includes(q)));
      const hits = ix.hts.filter((r) => matches(r.words, qw) && (system === 'hts' || !r.code.startsWith('98')))
        .map((r) => ({ ...r, depth: depth(r) }));
      hits.sort((a, b) => a.depth - b.depth || a.words.length - b.words.length || (a.code < b.code ? -1 : 1));
      if (system === 'hs') {
        const seen = new Map();
        for (const h of hits) { const k = h.code.slice(0, 6); if (!seen.has(k)) seen.set(k, h); }
        results = [...seen.entries()].map(([k]) => ({ system: 'hs', code: htsDisplay(k), title: joinPath(hs6Title(k)), lines: hits.filter((h) => h.code.startsWith(k)).length }));
      } else {
        results = hits.map((h) => ({ system: 'hts', code: htsDisplay(h.code), title: fullText(h.row), generalRate: htsRate(h.row), unit: h.row.unit || null }));
      }
    } else {
      const list = system === 'schedule-b' ? ix.sb : system === 'uk-sic' ? ix.uk : ix.sc;
      const hits = list.filter((r) => matches(r.words, qw)).sort((a, b) => a.words.length - b.words.length || (a.code < b.code ? -1 : 1));
      results = hits.map((h) => ({ system, code: system === 'schedule-b' ? scheduleBDisplay(h.code) : h.code, title: h.r.desc ?? h.r.title }));
    }
    const total = results.length;
    const shown = results.slice(0, Math.min(limit, LIMITS.searchResults));
    const where = { naics: 'NAICS 2022 titles and Census index entries', hs: 'HS subheadings in the US HTS', hts: `US HTS lines (${H.revision})`, 'schedule-b': 'Schedule B export numbers (2026)', 'uk-sic': 'the Companies House SIC 2007 list', 'schedule-c': 'IRS Schedule C activity codes (2025)' }[system];
    const src = { naics: [SRC.naics, SRC.sba], hs: [SRC.hts], hts: [SRC.hts], 'schedule-b': [SRC.scheduleB], 'uk-sic': [SRC.ukSic], 'schedule-c': [SRC.scheduleC] }[system];
    return {
      op: 'search', system, query: q, words: qw, total, results: shown,
      answer: total
        ? `${n(total)} ${total === 1 ? 'line' : 'lines'} in ${where} ${total === 1 ? 'contains' : 'contain'} "${qw.join(' ')}"; the first is ${shown[0].code} ${shown[0].title.replace(/:$/, '')}.`
        : `No line in ${where} contains "${qw.join(' ')}". Try fewer or more general words.`,
      note: 'These are the official lines that contain your words, not a classification. The right code depends on the whole activity or product.',
      sources: src,
    };
  }

  return {
    check, checkOne, search, naicsRecord, systemsFor,
    naics: { title: naicsTitle, codes: naicsCodes, six, data: N, path: naicsPath, sicTo },
    hts: { rows: htsRows, line: htsLine, rate: htsRate, children: htsChildren, fullText, revision: H.revision, effective: H.effective, name: H.name, basics: H.basicEditions ?? [] },
    hs: { six: hs6, title: hs6Title, headings: hs4, chapters, chapterInfo, joinPath },
    scheduleB: { map: B, byHs6: bByHs6 },
    ukSic: { map: UK, sections: ukSections },
    scheduleC: { map: SC, rows: files.small.scheduleC.rows },
    SOURCES: SRC,
  };
}

// ---------- CSV of a check, the same in the page and the API ----------

export const CSV_COLUMNS = ['input', 'system', 'code', 'valid', 'status', 'title', 'edition', 'next_revision', 'answer'];
export function csvCell(v) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export function toCsv(results) {
  const lines = [CSV_COLUMNS.join(',')];
  for (const r of results) {
    const next = r.next ? (r.next.text ?? (r.next.change === 'none' ? 'no change proposed' : `${r.next.change}: ${r.next.to.map((t) => t.code).join(' ')}`)) : '';
    lines.push([r.input, r.system, r.code, r.valid ? 'yes' : 'no', r.status, r.title, r.edition, next, r.answer].map(csvCell).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}
