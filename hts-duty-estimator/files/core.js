// The US import duty estimator: one SKU or a whole product list, layer by layer, from the USITC HTS
// and the Chapter 99 actions read in the Federal Register. Pure and dependency-free: the browser
// loads this same file (README "core.js is browser-loadable"), and tool.js injects the data.
//
// The rule of this engine: anything not read in an official source is refused, never guessed.
//   computed  base rate (column 1 general; a special rate when the caller claims a trade program
//             the line lists for that origin; column 2 for Cuba, North Korea, Belarus, Russia),
//             Section 301 on 60 economies (U.S. note 52), China (notes 20 and 31), Brazil
//             (note 50) and Nicaragua (9903.89.01), MPF and HMF for one shipment
//   ended     IEEPA duties (EO 14389) and the section 122 surcharge (150 days from Feb 24, 2026)
//   refused   a line another Chapter 99 note names for that origin (Section 232, section 338
//             Canada, Russia, safeguards, quotas), a footnote into those headings, a rate we
//             cannot compute from the inputs (a quantity-based rate without the quantity)

export const LIMITS = { rows: 5000, csvChars: 190_000, value: 1e9, skuChars: 80, textChars: 200 };

export class DutyError extends Error {
  constructor(message, field) { super(message); this.name = 'DutyError'; this.field = field; }
}

// ISO 3166-1 alpha-2 codes and short names, for origins typed as a code or a name.
export const COUNTRIES = Object.fromEntries('AD Andorra|AE United Arab Emirates|AF Afghanistan|AG Antigua and Barbuda|AL Albania|AM Armenia|AO Angola|AR Argentina|AT Austria|AU Australia|AZ Azerbaijan|BA Bosnia and Herzegovina|BB Barbados|BD Bangladesh|BE Belgium|BF Burkina Faso|BG Bulgaria|BH Bahrain|BI Burundi|BJ Benin|BN Brunei|BO Bolivia|BR Brazil|BS Bahamas|BT Bhutan|BW Botswana|BY Belarus|BZ Belize|CA Canada|CD Congo (Kinshasa)|CF Central African Republic|CG Congo (Brazzaville)|CH Switzerland|CI Cote d\'Ivoire|CL Chile|CM Cameroon|CN China|CO Colombia|CR Costa Rica|CU Cuba|CV Cabo Verde|CY Cyprus|CZ Czechia|DE Germany|DJ Djibouti|DK Denmark|DM Dominica|DO Dominican Republic|DZ Algeria|EC Ecuador|EE Estonia|EG Egypt|ER Eritrea|ES Spain|ET Ethiopia|FI Finland|FJ Fiji|FR France|GA Gabon|GB United Kingdom|GD Grenada|GE Georgia|GH Ghana|GM Gambia|GN Guinea|GQ Equatorial Guinea|GR Greece|GT Guatemala|GW Guinea-Bissau|GY Guyana|HK Hong Kong|HN Honduras|HR Croatia|HT Haiti|HU Hungary|ID Indonesia|IE Ireland|IL Israel|IN India|IQ Iraq|IR Iran|IS Iceland|IT Italy|JM Jamaica|JO Jordan|JP Japan|KE Kenya|KG Kyrgyzstan|KH Cambodia|KI Kiribati|KM Comoros|KN Saint Kitts and Nevis|KP North Korea|KR South Korea|KW Kuwait|KZ Kazakhstan|LA Laos|LB Lebanon|LC Saint Lucia|LI Liechtenstein|LK Sri Lanka|LR Liberia|LS Lesotho|LT Lithuania|LU Luxembourg|LV Latvia|LY Libya|MA Morocco|MC Monaco|MD Moldova|ME Montenegro|MG Madagascar|MK North Macedonia|ML Mali|MM Burma|MN Mongolia|MO Macau|MR Mauritania|MT Malta|MU Mauritius|MV Maldives|MW Malawi|MX Mexico|MY Malaysia|MZ Mozambique|NA Namibia|NE Niger|NG Nigeria|NI Nicaragua|NL Netherlands|NO Norway|NP Nepal|NZ New Zealand|OM Oman|PA Panama|PE Peru|PG Papua New Guinea|PH Philippines|PK Pakistan|PL Poland|PS West Bank and Gaza|PT Portugal|PY Paraguay|QA Qatar|RO Romania|RS Serbia|RU Russia|RW Rwanda|SA Saudi Arabia|SB Solomon Islands|SC Seychelles|SD Sudan|SE Sweden|SG Singapore|SI Slovenia|SK Slovakia|SL Sierra Leone|SN Senegal|SO Somalia|SR Suriname|SS South Sudan|SV El Salvador|SY Syria|SZ Eswatini|TD Chad|TG Togo|TH Thailand|TJ Tajikistan|TL Timor-Leste|TM Turkmenistan|TN Tunisia|TO Tonga|TR Turkiye|TT Trinidad and Tobago|TW Taiwan|TZ Tanzania|UA Ukraine|UG Uganda|UY Uruguay|UZ Uzbekistan|VC Saint Vincent and the Grenadines|VE Venezuela|VN Vietnam|VU Vanuatu|WS Samoa|YE Yemen|ZA South Africa|ZM Zambia|ZW Zimbabwe'
  .split('|').map((x) => [x.slice(0, 2), x.slice(3)]));
const NAME_TO_ISO = new Map(Object.entries(COUNTRIES).map(([k, v]) => [v.toLowerCase(), k]));
for (const [alias, iso] of [['usa', 'US'], ['uk', 'GB'], ['great britain', 'GB'], ['england', 'GB'], ['korea', 'KR'], ['republic of korea', 'KR'], ['türkiye', 'TR'], ['turkey', 'TR'], ['vietnam', 'VN'], ['viet nam', 'VN'], ['czech republic', 'CZ'], ['the netherlands', 'NL'], ['holland', 'NL'], ['uae', 'AE'], ['prc', 'CN'], ["people's republic of china", 'CN'], ['hong kong, china', 'HK'], ['myanmar', 'MM'], ['russian federation', 'RU'], ['ivory coast', 'CI']]) NAME_TO_ISO.set(alias, iso);

export function originOf(text) {
  const s = String(text ?? '').trim();
  if (!s) return null;
  if (/^[A-Za-z]{2}$/.test(s)) {
    const iso = s.toUpperCase();
    if (iso === 'UK') return 'GB';
    return COUNTRIES[iso] || iso === 'US' ? iso : null;
  }
  return NAME_TO_ISO.get(s.toLowerCase()) ?? null;
}
export const countryName = (iso) => (iso === 'US' ? 'United States' : COUNTRIES[iso] ?? iso);

export const digitsOf = (s) => String(s ?? '').replace(/[\s.\-–]/g, '');
export function htsDisplay(d) {
  if (d.length <= 4) return d;
  if (d.length === 6) return `${d.slice(0, 4)}.${d.slice(4)}`;
  if (d.length === 8) return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)}.${d.slice(8)}`;
}
const DATE_RE = /(\w+) (\d+), (\d{4})/;
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export function isoDate(text) {
  const m = DATE_RE.exec(text ?? '');
  return m ? `${m[3]}-${String(MONTHS.indexOf(m[1]) + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}` : null;
}
export function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

// Money: whole cents, rounded half up, so the page, the CSV and the API agree.
export const cents = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
export const money = (x) => (x === null || x === undefined ? '' : `$${cents(x).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
const pct = (x) => `${Number(x.toFixed(4))}%`;

// ---------- rate text ----------

// One HTS rate column as terms: Free; N%; N¢ or $N per kg, liter, each, pair, dozen, gross, metric
// ton; and sums of those. Anything else (on the case, of total sugars, "The rate applicable to...")
// is returned as null: not computable here.
const UNIT_WORDS = { kg: 'kg', liter: 'liter', each: 'each', 'pr.': 'pair', 'doz.': 'dozen', gross: 'gross', t: 'metric ton', 'pf.liter': null, bbl: null };
export function parseRate(text) {
  const s = String(text ?? '').trim().replace(/\s+/g, ' ');
  if (!s) return null;
  if (/^free$/i.test(s)) return { free: true, terms: [] };
  const terms = [];
  for (const part of s.split(' + ')) {
    let m = /^(\d+(?:\.\d+)?)%$/.exec(part);
    if (m) { terms.push({ pct: Number(m[1]) }); continue; }
    m = /^(?:(\d+(?:\.\d+)?)¢|\$(\d+(?:\.\d+)?))(?:\/(kg|liter|pr\.|doz\.|gross|t)| (each))$/.exec(part);
    if (m) {
      const unit = UNIT_WORDS[m[3] ?? m[4]];
      if (!unit) return null;
      terms.push({ perUnit: m[1] !== undefined ? Number(m[1]) / 100 : Number(m[2]), unit });
      continue;
    }
    return null;
  }
  return { free: false, terms };
}
// Duty for one row from parsed terms: { duty, needs } where needs names a missing quantity.
export function dutyOf(rate, { value, quantity, weightKg }) {
  let duty = 0;
  for (const t of rate.terms) {
    if (t.pct !== undefined) { duty += value * t.pct / 100; continue; }
    const q = t.unit === 'kg' ? (weightKg ?? quantity) : quantity;
    if (q === undefined || q === null) return { duty: null, needs: t.unit };
    duty += q * t.perUnit;
  }
  return { duty, needs: null };
}
// The special column as groups: [{ rate, programs: [...] }]: "Free (AU,BH,...) 2.5% (JP)".
export function parseSpecial(text) {
  const out = [];
  const re = /([^()]+?)\s*\(([^()]+)\)/g;
  let m;
  while ((m = re.exec(String(text ?? '')))) out.push({ rate: m[1].trim(), programs: m[2].split(',').map((x) => x.trim()).filter(Boolean) });
  return out;
}

// ---------- CSV ----------

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let q = false;
  const s = String(text ?? '').replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) {
      if (c === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n' || c === '\r') {
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
export function csvCell(v) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+(?:\.\d+)?$/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Column names we read, by platform. Shopify keeps HS Code and COO in its inventory CSV and the
// SKU, weight (grams) and cost in its product CSV (Shopify Help, read 2026-11-08); Etsy's listing
// CSV has Title, Price, Quantity, Materials and SKU but no HS code, origin or weight.
const HEADERS = {
  sku: ['sku', 'variant sku', 'item sku', 'product sku'],
  title: ['title', 'product title', 'name', 'product name', 'description'],
  code: ['hs code', 'hts code', 'hts', 'hs', 'variant hs code', 'harmonized system code', 'harmonized code', 'tariff code', 'hs tariff number', 'commodity code', 'hts number'],
  origin: ['coo', 'country of origin', 'variant country of origin', 'origin', 'country', 'origin country', 'made in'],
  grams: ['weight value (grams)', 'variant grams', 'weight (g)', 'weight g', 'grams'],
  kg: ['weight (kg)', 'weight kg', 'kg', 'net weight (kg)'],
  lb: ['weight (lb)', 'weight lb', 'lb', 'lbs'],
  value: ['customs value', 'value', 'unit value', 'declared value', 'cost per item', 'variant cost', 'cost', 'unit cost'],
  price: ['price', 'variant price'],
  quantity: ['duty quantity', 'quantity for duty'],
};
export function readCatalogue(csv, inventoryCsv) {
  const table = (text) => {
    const rows = parseCsv(text);
    if (!rows.length) return { cols: {}, data: [] };
    const head = rows[0].map((h) => h.trim().toLowerCase());
    const cols = {};
    for (const [k, names] of Object.entries(HEADERS)) {
      const i = names.map((n) => head.indexOf(n)).find((x) => x >= 0);
      if (i !== undefined) cols[k] = i;
    }
    return { cols, data: rows.slice(1), head: rows[0] };
  };
  const main = table(csv);
  const inv = inventoryCsv ? table(inventoryCsv) : null;
  if (!main.data.length) throw new DutyError('The CSV has no rows under its header line.', 'csv');
  const cell = (t, r, k) => (t.cols[k] === undefined ? '' : String(r[t.cols[k]] ?? '').trim());
  const invBySku = new Map();
  if (inv) {
    if (inv.cols.sku === undefined) throw new DutyError('The inventory CSV needs a SKU column to join it to the products.', 'inventoryCsv');
    for (const r of inv.data) {
      const sku = cell(inv, r, 'sku');
      if (sku && !invBySku.has(sku)) invBySku.set(sku, { code: cell(inv, r, 'code'), origin: cell(inv, r, 'origin') });
    }
  }
  const out = [];
  let lastTitle = '';
  for (const r of main.data) {
    const sku = cell(main, r, 'sku');
    const title = cell(main, r, 'title') || lastTitle;
    if (cell(main, r, 'title')) lastTitle = title;
    const extra = invBySku.get(sku) ?? {};
    const num = (k) => { const v = cell(main, r, k).replace(/[$,\s]/g, ''); return v === '' ? null : Number(v); };
    const g = num('grams'); const kg = num('kg'); const lb = num('lb');
    const weightKg = kg !== null && Number.isFinite(kg) ? kg : g !== null && Number.isFinite(g) ? g / 1000 : lb !== null && Number.isFinite(lb) ? lb * 0.45359237 : null;
    const value = num('value');
    const price = num('price');
    out.push({
      sku, title: title.slice(0, LIMITS.textChars),
      code: cell(main, r, 'code') || extra.code || '',
      origin: cell(main, r, 'origin') || extra.origin || '',
      weightKg: weightKg !== null && weightKg > 0 ? weightKg : null,
      value: value !== null && Number.isFinite(value) && value > 0 ? value : price !== null && Number.isFinite(price) && price > 0 ? price : null,
      valueFrom: value !== null && Number.isFinite(value) && value > 0 ? 'value' : price !== null && Number.isFinite(price) && price > 0 ? 'price' : null,
      quantity: num('quantity'),
    });
  }
  return {
    rows: out,
    columns: Object.fromEntries(Object.keys(HEADERS).map((k) => [k, main.cols[k] !== undefined ? main.head[main.cols[k]] : inv && inv.cols[k] !== undefined ? `${inv.head[inv.cols[k]]} (inventory CSV)` : null])),
    joined: inv ? invBySku.size : 0,
  };
}
// Rows in a CSV (the units billing counts before the run): data lines under the header.
export const csvRowCount = (csv) => Math.max(0, parseCsv(csv).length - 1);

// ---------- the engine ----------

// hts: the code table from tools/industry-code-lookup (its engine's .hts: line, rate, fullText, rows).
// duty: data/duty.json.gz. sources: data/sources.json.
export function makeDutyEngine({ hts, duty, sources }) {
  const D = duty;
  const asOf = D.readOn;
  const lineData = (d) => D.lines[d] ?? (d.length === 10 ? D.lines[d.slice(0, 8)] : null) ?? null;
  const fr = Object.fromEntries(sources.federalRegister.map((x) => [x.document, x]));
  const SRC = {
    hts: { text: `USITC: Harmonized Tariff Schedule, ${D.revision}, effective ${D.effective}`, href: 'https://hts.usitc.gov/', readOn: asOf },
    note: (n) => ({ text: `USITC: HTS Chapter 99, subchapter III, U.S. note ${n} (${D.revision})`, href: 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=Chapter%2099', readOn: asOf }),
    fr: (d) => ({ text: `Federal Register ${fr[d].citation} (${longDate(fr[d].published)}): ${fr[d].title}`, href: fr[d].url, readOn: asOf }),
    gn: { text: `USITC: HTS General Notes, general note 3 (${D.revision})`, href: 'https://hts.usitc.gov/reststop/file?release=currentRelease&filename=General%20Notes', readOn: asOf },
    fees: { text: `Federal Register: ${fr['2026-15530'].title}`, href: fr['2026-15530'].url, readOn: asOf },
    hmf: { text: 'eCFR: 19 CFR 24.24, harbor maintenance fee (0.125 percent)', href: 'https://www.ecfr.gov/current/title-19/chapter-I/part-24/section-24.24', readOn: asOf },
    informal: { text: 'eCFR: 19 CFR 143.21, merchandise eligible for informal entry', href: 'https://www.ecfr.gov/current/title-19/chapter-I/part-143/subpart-C/section-143.21', readOn: asOf },
  };
  const EU = new Set(D.eu);
  const n52Key = (iso) => (EU.has(iso) ? 'EU' : iso);
  // Code lists as sets, made once per list: a line matches a list when one of its prefixes (2, 4,
  // 6, 8 or 10 digits) is on it; "narrower" is a 10-digit number on the list under an 8-digit line.
  const index = new WeakMap();
  const indexOf = (codes) => {
    let ix = index.get(codes);
    if (!ix) {
      ix = { all: new Set(codes), under8: new Set(codes.filter((c) => c.length > 8).map((c) => c.slice(0, 8))) };
      index.set(codes, ix);
    }
    return ix;
  };
  const matches = (d, codes) => { const ix = indexOf(codes); return [2, 4, 6, 8, 10].some((k) => k <= d.length && ix.all.has(d.slice(0, k))); };
  const narrower = (d, codes) => d.length === 8 && indexOf(codes).under8.has(d);
  const hasTen = new Set(hts.rows.filter((r) => r.d.length === 10).map((r) => r.d.slice(0, 8)));

  // Before an estimate: which measures we refuse for this line and origin.
  function refusalsFor(d, iso) {
    const out = [];
    for (const r of D.refuse) {
      if (r.origins !== '*' && !r.origins.includes(iso)) continue;
      if (matches(d, r.codes) || narrower(d, r.codes)) out.push({ reason: `${r.label}: this line is named in U.S. note ${r.note} to subchapter III of Chapter 99, which this estimator does not compute`, note: r.note });
    }
    const keys = [d, d.slice(0, 8)];
    for (const k of keys) {
      for (const g of D.refuseFootnote[k] ?? []) {
        const only = D.footnoteOrigins[g];
        if (only && !only.includes(iso)) continue;
        if (!out.some((x) => x.heading === g)) out.push({ reason: `A footnote on this line points to Chapter 99 heading ${g}, which this estimator does not compute`, heading: g });
      }
    }
    if (iso === 'CA' && D.canada338Chapters.includes(d.slice(0, 2))) {
      out.push({ reason: `Section 338 duties on products of Canada: the scope was changed on October 30, 2026 by an annex published as images (FR 2026-22292), so chapter ${d.slice(0, 2)} goods of Canada are refused`, fr: '2026-22292' });
    }
    if (iso === 'RU' && !out.length) out.push({ reason: 'Products of Russia: column 2 and the additional duties in U.S. note 30 are not computed here' });
    return out;
  }

  function chinaLayers(d, ctx) {
    const layers = [];
    const notes = [];
    const hits = D.china.lists.filter((l) => (l.stat ? d.length === 10 && l.codes.includes(d) : matches(d, l.codes)));
    if (d.length === 8 && D.china.lists.some((l) => l.stat && narrower(d, l.codes))) {
      return { refuse: 'Section 301 list 4A names some 10-digit numbers under this line; give the 10-digit HTS number' };
    }
    const n31 = D.china.n31.filter((x) => matches(d, x.codes) && isoDate(x.from) <= asOf && (!x.before || asOf < isoDate(x.before)));
    if (hits.length && n31.length) return { refuse: `Both a Section 301 list heading (${hits[0].heading}) and a four-year-review heading (${n31[0].heading}) name this line; how the two combine is not stated in the notes read` };
    const heads = new Set();
    for (const l of [...hits, ...n31]) {
      if (heads.has(l.heading)) continue;
      heads.add(l.heading);
      const isN31 = l.sub !== undefined;
      layers.push({
        heading: l.heading, name: isN31 ? 'Section 301 China (four-year review increase)' : `Section 301 China (${{ '9903.88.01': 'list 1', '9903.88.02': 'list 2', '9903.88.03': 'list 3', '9903.88.04': 'list 3', '9903.88.15': 'list 4A' }[l.heading]})`,
        authority: 'Section 301', rate: l.rate, duty: ctx.value * l.rate / 100,
        sources: [SRC.note(isN31 ? 31 : 20), SRC.fr('2026-20510')],
      });
    }
    for (const x of D.china.exclusions) {
      if (matches(d, x.codes) || narrower(d, x.codes)) notes.push(`A USTR product exclusion (${x.heading}, through ${x.through}) may remove the list 1-4A duty if the goods match its description in U.S. note 20; not applied.`);
    }
    for (const x of D.china.n31) {
      if (matches(d, x.codes) && isoDate(x.from) > asOf) notes.push(`From ${x.from}, heading ${x.heading} adds ${x.rate}% for goods described in U.S. note 31(${x.sub}).`);
    }
    return { layers, notes };
  }

  // Informational materials (publications, films, posters, records, photographs, artworks) have
  // their own exemption headings in notes 50 and 52 (9903.05.09, 9903.05.92). Books, newspapers,
  // children's picture books, printed music and maps (4901-4905) and paintings, prints and
  // sculptures (9701-9703) are publications and artworks by their HTS headings; pictures, films and
  // recorded media may be, depending on what is on them, so those get a note instead.
  const INFO = ['4901', '4902', '4903', '4904', '4905', '9701', '9702', '9703'];
  const INFO_MAYBE = ['4911', '3706', '8523'];
  const infoNote = (d, heading) => (matches(d, INFO_MAYBE) ? [`Informational materials (posters, photographs, films, recordings) are exempt under heading ${heading}; not applied, since it depends on the article.`] : []);

  // Section 301, 60 economies (note 52), with its exemption lists.
  function n52Layer(d, iso, ctx) {
    const key = n52Key(iso);
    const c = D.n52.countries[key];
    if (!c) return { layers: [], notes: [] };
    const notes = [];
    const src = [SRC.note(52), SRC.fr('2026-15274'), SRC.fr('2026-15181')];
    const exempt = (heading, why) => ({ layers: [{ heading, name: 'Section 301 (forced labor), exempt', authority: 'Section 301', rate: 0, duty: 0, exempt: why, sources: src }], notes });
    if (matches(d, INFO)) return exempt('9903.05.92', 'informational materials (publications and artworks)');
    notes.push(...infoNote(d, '9903.05.92'));
    for (const e of D.n52.exempt) if (matches(d, e.codes)) return exempt(e.heading, 'listed in U.S. note 52(b)');
    for (const e of D.n52.byCountry[key] ?? []) {
      if (e.kind === 'list' && e.codes?.length && matches(d, e.codes)) return exempt(e.heading, `listed for ${countryName(iso === 'EU' ? 'EU' : iso)} in U.S. note 52(j)`);
      if (e.kind === 'usmca' && ctx.program && ['S', 'S+'].includes(ctx.program)) return exempt(e.heading, 'entered under USMCA (U.S. note 52(g) and (h))');
      if (e.kind === 'cafta' && ctx.program && ['P', 'P+'].includes(ctx.program)) {
        const textile = Number(d.slice(0, 2)) >= 50 && Number(d.slice(0, 2)) <= 63;
        if ((e.codes?.length ? matches(d, e.codes) : textile)) return exempt(e.heading, 'textiles or apparel entered under CAFTA-DR (U.S. note 52(i) and (j))');
      }
      if (e.kind === 'particular' && e.codes?.length && (matches(d, e.codes) || narrower(d, e.codes))) notes.push(`Heading ${e.heading} exempts some particular articles of this line (U.S. note 52(j)); not applied.`);
    }
    for (const e of D.n52.conditional) {
      if (e.codes?.length && matches(d, e.codes)) notes.push(`${{ aircraft: 'Civil aircraft parts', pharma: 'Articles for use in pharmaceutical applications', particular: 'Some particular articles' }[e.kind] ?? 'Some articles'} of this line are exempt under heading ${e.heading} (U.S. note 52); not applied.`);
    }
    if (c.kind === 'add') return { layers: [{ heading: c.heading, name: 'Section 301 (forced labor), 60 economies', authority: 'Section 301', rate: c.rate, duty: ctx.value * c.rate / 100, sources: src }], notes };
    // EU, Japan, Korea, Switzerland, Taiwan: base (column 1 general, ad valorem or its equivalent)
    // plus this duty adds up to the cap; nothing when the general rate is already at or above it.
    if (ctx.generalAve === null) return { refuse: `Section 301 for ${countryName(iso)} depends on the column 1 general rate as a percentage of value; this line's rate needs a quantity` };
    if (ctx.generalAve >= c.rate) return { layers: [{ heading: c.headingAbove, name: 'Section 301 (forced labor), net of MFN', authority: 'Section 301', rate: 0, duty: 0, sources: src, cap: c.rate }], notes };
    const add = c.rate - ctx.generalAve;
    return { layers: [{ heading: c.heading, name: `Section 301 (forced labor), up to ${c.rate}% with the general rate`, authority: 'Section 301', rate: Number(add.toFixed(6)), duty: ctx.value * add / 100, sources: src, cap: c.rate }], notes };
  }

  function brazilLayer(d, ctx) {
    const b = D.brazil;
    const src = [SRC.note(50), SRC.fr('2026-14654'), SRC.fr('2026-14542')];
    const notes = [...infoNote(d, '9903.05.09')];
    if (matches(d, INFO)) return { layers: [{ heading: '9903.05.09', name: 'Section 301 Brazil, exempt', authority: 'Section 301', rate: 0, duty: 0, exempt: 'informational materials (publications and artworks)', sources: src }], notes };
    for (const e of b.exempt) if (matches(d, e.codes)) return { layers: [{ heading: e.heading, name: 'Section 301 Brazil, exempt', authority: 'Section 301', rate: 0, duty: 0, exempt: 'listed in U.S. note 50(a)(ii)', sources: src }], notes };
    for (const e of b.conditional) if (e.codes?.length && (matches(d, e.codes) || narrower(d, e.codes))) notes.push(`Some articles of this line are exempt from the Brazil duty under heading ${e.heading} (U.S. note 50); not applied.`);
    return { layers: [{ heading: b.heading, name: 'Section 301 Brazil', authority: 'Section 301', rate: b.rate, duty: ctx.value * b.rate / 100, sources: src }], notes };
  }

  function nicaraguaLayer(ctx) {
    const n = D.nicaragua;
    if (ctx.program === 'P' || ctx.program === 'P+') return { layers: [], notes: ['Goods originating under CAFTA-DR are outside the Nicaragua Section 301 duty.'] };
    const rate = [...n.phases].reverse().find(([from]) => from <= asOf)[1];
    return { layers: [{ heading: n.heading, name: 'Section 301 Nicaragua', authority: 'Section 301', rate, duty: ctx.value * rate / 100, sources: [SRC.fr('2025-22690')] }], notes: [`The Nicaragua rate rises to 10% on January 1, 2027 and 15% on January 1, 2028.`] };
  }

  // One SKU row -> its estimate. Throws DutyError only for input that is not a row at all.
  function estimateRow(row, { claimFta = false } = {}) {
    const d = digitsOf(row.code);
    const base = { sku: row.sku ?? '', title: row.title ?? '', code: row.code ?? '', origin: row.origin ?? '', value: row.value ?? null };
    const problems = [];
    if (!d) problems.push({ field: 'code', reason: 'No HTS code' });
    else if (!/^\d+$/.test(d)) problems.push({ field: 'code', reason: `"${row.code}" is not an HTS number` });
    else if (d.length === 6) problems.push({ field: 'code', reason: `${htsDisplay(d)} is a 6-digit HS code; a US entry needs the 10-digit HTS number` });
    else if (d.length !== 8 && d.length !== 10) problems.push({ field: 'code', reason: `${row.code} has ${d.length} digits; give the 8- or 10-digit HTS number` });
    const iso = row.origin ? originOf(row.origin) : null;
    if (!row.origin) problems.push({ field: 'origin', reason: 'No country of origin' });
    else if (!iso) problems.push({ field: 'origin', reason: `"${row.origin}" is not a country we recognize; use a two-letter ISO code such as CN` });
    else if (iso === 'US') problems.push({ field: 'origin', reason: 'US-origin goods returning to the US are entered under chapter 98, which this estimator does not cover' });
    if (row.value === null || row.value === undefined) problems.push({ field: 'value', reason: 'No customs value' });
    let line = null;
    if (d && /^\d+$/.test(d) && (d.length === 8 || d.length === 10)) {
      if (d.startsWith('98') || d.startsWith('99')) problems.push({ field: 'code', reason: `${htsDisplay(d)} is a chapter 98 or 99 number; give the product's chapter 1-97 number` });
      else {
        line = hts.line(d);
        if (!line) problems.push({ field: 'code', reason: `${htsDisplay(d)} is not in the ${D.revision}; check it in the HTS code checker` });
      }
    }
    if (problems.length) return { ...base, status: 'incomplete', problems };

    const generalText = hts.rate(line);
    const ld = lineData(d) ?? ['', '', []];
    const out = {
      ...base, origin: iso, originName: countryName(iso),
      line: { code: htsDisplay(d), description: hts.fullText(line), general: generalText, special: ld[0] || null, column2: ld[1] || null, digits: d.length },
      status: 'estimated', base: null, layers: [], notes: [], refusals: [], duty: null, effectiveRate: null,
    };
    if (d.length === 8 && hasTen.has(d)) out.notes.push('Give the 10-digit number on the entry; the duty rate sits on this 8-digit line.');
    const ctx = { value: row.value, quantity: row.quantity ?? undefined, weightKg: row.weightKg ?? undefined, program: null, generalAve: null };

    // Base rate.
    const general = parseRate(generalText);
    const generalDuty = general ? dutyOf(general, ctx) : { duty: null, needs: 'rate' };
    ctx.generalAve = generalDuty.duty !== null && row.value > 0 ? generalDuty.duty / row.value * 100 : null;
    let baseRate = general;
    let baseText = generalText;
    let column = 'column 1 general';
    if (D.column2.includes(iso)) {
      baseText = ld[1];
      baseRate = parseRate(ld[1]);
      column = 'column 2';
    } else if (claimFta) {
      const progs = Object.entries(D.programs).filter(([, list]) => list.includes(iso)).map(([p]) => p);
      const hit = parseSpecial(ld[0]).find((g) => g.programs.some((p) => progs.includes(p)));
      if (hit) {
        ctx.program = hit.programs.find((p) => progs.includes(p));
        baseText = hit.rate;
        baseRate = parseRate(hit.rate);
        column = `special (${ctx.program})`;
        out.notes.push(`Special rate claimed under program ${ctx.program}: the goods must meet that agreement's rules of origin, and you must claim it on the entry.`);
      } else {
        out.notes.push(progs.length ? `This line lists no special rate for ${countryName(iso)}'s trade program; the general rate is used.` : `No trade program this estimator supports covers ${countryName(iso)}; the general rate is used.`);
      }
    }
    if (!baseRate) {
      out.status = 'refused';
      out.refusals.push({ reason: `The ${column} rate "${baseText}" is not a rate this estimator can compute` });
    } else {
      const b = dutyOf(baseRate, ctx);
      if (b.duty === null) {
        out.status = 'refused';
        out.refusals.push({ reason: `The ${column} rate "${baseText}" is per ${b.needs}: give ${b.needs === 'kg' ? 'weightKg' : `quantity (in ${b.needs === 'each' ? 'units' : b.needs})`}` });
      } else out.base = { column, rate: baseText, duty: b.duty, sources: [column === 'column 2' ? SRC.gn : SRC.hts] };
    }

    // Measures we do not compute for this line and origin.
    out.refusals.push(...refusalsFor(d, iso));

    // Additional layers.
    const add = (r) => {
      if (!r) return;
      if (r.refuse) { out.refusals.push({ reason: r.refuse }); return; }
      out.layers.push(...r.layers);
      out.notes.push(...r.notes);
    };
    if (out.base || out.refusals.length) {
      if (iso === 'CN') add(chinaLayers(d, ctx));
      if (iso === 'BR') add(brazilLayer(d, ctx));
      if (iso === 'NI') add(nicaraguaLayer(ctx));
      if (iso !== 'RU') add(n52Layer(d, iso, ctx));
    }
    if (iso === 'HK') out.notes.push('Hong Kong is a separate economy in the Section 301 actions: the China lists do not apply to goods of Hong Kong.');
    if (out.refusals.length) {
      out.status = 'refused';
      out.duty = null;
      return out;
    }
    out.duty = out.base.duty + out.layers.reduce((s, l) => s + l.duty, 0);
    out.effectiveRate = row.value > 0 ? out.duty / row.value * 100 : null;
    out.ch99 = out.layers.map((l) => l.heading);
    return out;
  }

  // Fees for one shipment of these rows (19 CFR 143.21, 24.24; CBP FY2027 fees).
  function shipmentFees(rows, mode) {
    const F = D.fees;
    const valued = rows.filter((r) => r.value !== null && r.value !== undefined);
    const total = valued.reduce((s, r) => s + r.value, 0);
    const out = { mode, value: total, sources: [SRC.fees, SRC.informal] };
    if (mode === 'mail') return { ...out, refused: 'Postal shipments use the postal informal entry process (FR 2026-12669); its fees are not computed here.' };
    const ch99Over = rows.some((r) => r.status === 'estimated' && r.ch99?.length && r.value > F.informalCh99Limit);
    const unknown = rows.some((r) => r.status !== 'estimated');
    const formal = total > F.informalLimit || ch99Over;
    out.entry = formal ? 'formal' : 'informal';
    out.why = total > F.informalLimit
      ? `the shipment is worth more than $${F.informalLimit.toLocaleString('en-US')}`
      : ch99Over ? `an article classified under a Chapter 99 subchapter III heading is worth more than $${F.informalCh99Limit}` : `the shipment is worth $${F.informalLimit.toLocaleString('en-US')} or less${unknown ? ' (rows without an estimate were not checked for Chapter 99 headings)' : ''}`;
    if (formal) {
      const raw = total * F.mpfPercent / 100;
      out.mpf = Math.min(F.mpfMax, Math.max(F.mpfMin, raw));
      out.mpfRule = `${F.mpfPercent}% of value, at least ${money(F.mpfMin)} and at most ${money(F.mpfMax)} (fiscal year ${F.fiscalYear})`;
    } else {
      out.mpf = F.informalAutomated;
      out.mpfRule = `${money(F.informalAutomated)} for an automated informal entry not prepared by CBP (${money(F.informalManual)} manual, ${money(F.informalCbp)} prepared by CBP)`;
    }
    out.hmf = mode === 'ocean' ? total * F.hmfPercent / 100 : 0;
    if (mode === 'ocean') out.sources.push(SRC.hmf);
    out.note = 'MPF exemptions for goods originating under some trade agreements are not applied.';
    return out;
  }

  function estimate({ rows, claimFta = false, shipment = null }) {
    const results = rows.map((r) => estimateRow(r, { claimFta }));
    const ok = results.filter((r) => r.status === 'estimated');
    const totalDuty = ok.reduce((s, r) => s + r.duty, 0);
    const out = {
      revision: D.revision, effective: D.effective, asOf, rows: results,
      summary: {
        rows: results.length, estimated: ok.length,
        refused: results.filter((r) => r.status === 'refused').length,
        incomplete: results.filter((r) => r.status === 'incomplete').length,
        duty: totalDuty, value: ok.reduce((s, r) => s + r.value, 0),
      },
      notApplied: notApplied(),
      scheduled: scheduled(),
    };
    if (shipment) {
      out.fees = shipmentFees(results, shipment.mode);
      // A landed total only when every row has an estimate: a refused row's duty is unknown.
      if (!out.fees.refused && ok.length === results.length) out.summary.total = totalDuty + out.fees.mpf + out.fees.hmf;
    }
    out.answer = answerOf(out);
    return out;
  }

  function audit({ csv, inventoryCsv, platform = 'generic' }) {
    const cat = readCatalogue(csv, inventoryCsv);
    const rows = cat.rows.map((r) => {
      const missing = [];
      const d = digitsOf(r.code);
      if (!d) missing.push('HTS code');
      else if (!/^\d+$/.test(d) || ![8, 10].includes(d.length)) missing.push(d.length === 6 ? 'HTS code (has a 6-digit HS code only)' : 'HTS code (not 8 or 10 digits)');
      else if (!hts.line(d) || d.startsWith('98') || d.startsWith('99')) missing.push(`HTS code (${htsDisplay(d)} is not in ${D.revision})`);
      if (!r.origin) missing.push('country of origin');
      else if (!originOf(r.origin)) missing.push(`country of origin ("${r.origin}" not recognized)`);
      if (r.weightKg === null) missing.push('weight');
      if (r.value === null) missing.push('value');
      return { ...r, missing };
    });
    const count = (p) => rows.filter((r) => r.missing.some((m) => m.startsWith(p))).length;
    const s = { rows: rows.length, noCode: count('HTS code'), noOrigin: count('country of origin'), noWeight: count('weight'), noValue: count('value'), complete: rows.filter((r) => !r.missing.length).length };
    const etsyNote = platform === 'etsy' && cat.columns.code === null ? 'Etsy\'s listing CSV has no HS code, country of origin or weight columns: add columns named "HS Code", "COO" and "Weight (kg)", fill them in, and check the file again.' : null;
    return {
      revision: D.revision, platform, columns: cat.columns, joinedFromInventory: cat.joined, summary: s, rows,
      note: etsyNote,
      answer: `Of your ${s.rows.toLocaleString('en-US')} ${s.rows === 1 ? 'product row' : 'product rows'}, ${s.noCode.toLocaleString('en-US')} ${s.noCode === 1 ? 'has' : 'have'} no valid HTS code, ${s.noOrigin.toLocaleString('en-US')} no country of origin and ${s.noWeight.toLocaleString('en-US')} no weight; ${s.complete.toLocaleString('en-US')} ${s.complete === 1 ? 'is' : 'are'} complete.`,
    };
  }

  const notApplied = () => [
    { what: 'IEEPA duties (fentanyl, reciprocal, Brazil, India, Russia oil and others)', why: 'ended by Executive Order 14389 of February 20, 2026; their headings (9903.01 and 9903.02) are still printed in the HTS', sources: [SRC.fr('2026-03832')] },
    { what: 'Section 122 import surcharge of 10%', why: 'imposed for 150 days from February 24, 2026; headings 9903.03.01-9903.03.11 are still printed in the HTS', sources: [SRC.fr('2026-03824')] },
    { what: 'Antidumping and countervailing duties', why: 'set per producer by the Department of Commerce, not in the HTS; check them before you import' },
  ];
  const scheduled = () => D.scheduled.filter((x) => x.date > asOf).map((x) => ({ ...x, source: x.source === 'hts' ? SRC.hts : SRC.fr(x.source) }));

  function answerOf(out) {
    const s = out.summary;
    if (s.rows === 1) {
      const r = out.rows[0];
      if (r.status === 'incomplete') return `No estimate: ${r.problems.map((p) => p.reason).join('; ')}.`;
      if (r.status === 'refused') return `No estimate for HTS ${r.line.code} from ${r.originName}: ${r.refusals[0].reason}.`;
      const parts = [`${r.base.rate === 'Free' ? 'free' : r.base.rate} base (${r.base.column})`, ...r.layers.filter((l) => l.duty > 0).map((l) => `${pct(l.rate)} ${l.name} (${l.heading})`)];
      return `HTS ${r.line.code} from ${r.originName}, ${money(r.value)}: ${money(r.duty)} US duty (${pct(r.effectiveRate)} of value) as of ${longDate(asOf)} under the ${out.revision}: ${parts.join(' + ')}.`;
    }
    const fees = out.fees && s.total !== undefined ? ` With ${out.fees.entry} entry fees (MPF ${money(out.fees.mpf)}${out.fees.hmf ? `, HMF ${money(out.fees.hmf)}` : ''}) the shipment pays ${money(s.total)}.` : '';
    const rest = [s.refused ? `${s.refused.toLocaleString('en-US')} ${s.refused === 1 ? 'is' : 'are'} refused (a layer we have not verified)` : '', s.incomplete ? `${s.incomplete.toLocaleString('en-US')} ${s.incomplete === 1 ? 'is' : 'are'} missing a code, origin or value` : ''].filter(Boolean);
    return `Of ${s.rows.toLocaleString('en-US')} rows, ${s.estimated.toLocaleString('en-US')} ${s.estimated === 1 ? 'has' : 'have'} an estimate totalling ${money(s.duty)} in US duty on ${money(s.value)} of goods (as of ${longDate(asOf)}, ${out.revision})${rest.length ? `; ${rest.join(' and ')}` : ''}.${fees}`;
  }

  // The result as CSV, the same on the page and over the API.
  function toCsv(result) {
    const cols = ['sku', 'title', 'hts', 'origin', 'value', 'status', 'base_rate', 'base_duty', 'additional_layers', 'additional_duty', 'duty', 'effective_rate', 'reason', 'hts_revision', 'as_of'];
    const lines = [cols.join(',')];
    for (const r of result.rows) {
      const extra = r.layers ? r.layers.reduce((s, l) => s + l.duty, 0) : null;
      lines.push([
        r.sku, r.title, r.line?.code ?? r.code, r.origin, r.value ?? '', r.status, r.base?.rate ?? '', r.base ? cents(r.base.duty) : '',
        r.layers ? r.layers.map((l) => `${l.heading} ${pct(l.rate)}`).join('; ') : '', extra !== null && r.status === 'estimated' ? cents(extra) : '',
        r.duty !== null && r.duty !== undefined ? cents(r.duty) : '', r.effectiveRate !== null && r.effectiveRate !== undefined ? pct(r.effectiveRate) : '',
        r.status === 'incomplete' ? r.problems.map((p) => p.reason).join('; ') : r.status === 'refused' ? r.refusals.map((x) => x.reason).join('; ') : r.notes.join(' '),
        result.revision, result.asOf,
      ].map(csvCell).join(','));
    }
    return lines.join('\r\n') + '\r\n';
  }

  return { estimate, estimateRow, audit, toCsv, refusalsFor, asOf, revision: D.revision, effective: D.effective, data: D, SRC, n52Key };
}
