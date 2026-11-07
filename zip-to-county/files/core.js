// ZIP code and UK postcode to county: the engine. Pure and dependency-free, so the page can load
// the same file (README, "core.js is browser-loadable"); tool.js reads the data files and hands
// them in already parsed.
//
// US: every ZCTA (the Census Bureau's area for a ZIP code) to every county it has land in, with
// the land area of each part, from the Census 2020 ZCTA5-county relationship file; the county's
// metro or micro area (CBSA) from OMB's July 2023 delineation; the state's Census region.
// GB: every Great Britain postcode, live and terminated, to its local authority district, and so
// its county (two-tier areas), region and nation, from the ONS Postcode Directory (ONSPD).
// Northern Ireland, the Channel Islands and the Isle of Man are named but not covered.

export class ZipError extends Error {
  constructor(message, field = null) {
    super(message);
    this.name = 'ZipError';
    this.field = field;
  }
}

export const LIMITS = { codes: 10_000, codeChars: 40 };

const B62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const fromB62 = (s) => {
  let n = 0;
  for (const c of s) n = n * 62 + B62.indexOf(c);
  return n;
};

export const SOURCES = {
  zcta: { name: 'Census 2020 ZCTA5 to County relationship file', url: 'https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_county20_natl.txt', vintage: '2020' },
  cbsa: { name: 'OMB July 2023 metropolitan and micropolitan delineation (Census list 1)', url: 'https://www2.census.gov/programs-surveys/metro-micro/geographies/reference-files/2023/delineation-files/list1_2023.xlsx', vintage: 'July 2023' },
  regions: { name: 'Census Bureau regions and divisions', url: 'https://www2.census.gov/geo/docs/maps-data/maps/reg_div.txt', vintage: '2020' },
  onspd: { name: 'ONS Postcode Directory', url: 'https://geoportal.statistics.gov.uk/', vintage: null },
};

// The attribution ONS asks for with postcode products (ons.gov.uk/methodology/geography/licences).
export const ONS_ATTRIBUTION = (year) => `Contains OS data © Crown copyright and database right ${year}. Contains Royal Mail data © Royal Mail copyright and database right ${year}. Source: Office for National Statistics licensed under the Open Government Licence v.3.0.`;

// ---------- reading a code ----------

const US_RE = /^(\d{3,5})(?:-?(\d{4}))?$/;
const GB_RE = /^(?:([A-Z]{1,2}[0-9][A-Z0-9]?)|(GIR))([0-9][A-Z]{2})$/;
const NOT_COVERED = {
  BT: 'Northern Ireland',
  GY: 'Guernsey',
  JE: 'Jersey',
  IM: 'the Isle of Man',
};

// Reads one entry as typed or pasted. country: 'auto' (digits are a ZIP, letters a postcode), 'us'
// or 'gb'. Returns { country, code, notes } or { country, error }.
export function readCode(raw, country = 'auto') {
  const text = String(raw ?? '').trim();
  const squeezed = text.toUpperCase().replace(/\s+/g, '');
  const looksUs = /^[\d-]+$/.test(squeezed);
  const as = country === 'auto' ? (looksUs ? 'us' : 'gb') : country;
  if (!squeezed) return { country: as === 'us' ? 'US' : 'GB', error: 'Empty entry.' };
  if (as === 'us') {
    const m = US_RE.exec(squeezed);
    if (!m) return { country: 'US', error: `"${text}" is not a ZIP code: give 5 digits, such as 02134, or ZIP+4 such as 02134-1234.` };
    const notes = [];
    let zip = m[1];
    if (zip.length < 5) {
      const fixed = zip.padStart(5, '0');
      notes.push(`Read ${zip} as ${fixed}: a spreadsheet drops leading zeros from ZIP codes.`);
      zip = fixed;
    }
    if (m[2]) notes.push(`Used the first five digits of the ZIP+4 ${text}.`);
    return { country: 'US', code: zip, notes };
  }
  const m = GB_RE.exec(squeezed);
  if (!m) return { country: 'GB', error: `"${text}" is not a UK postcode: give it in full, such as SW1A 1AA.` };
  const outward = m[1] ?? m[2];
  return { country: 'GB', code: `${outward} ${m[3]}`, outward, inward: m[3], notes: [] };
}

// ---------- the US data ----------

function makeUs(us) {
  const states = new Map(us.states.map(([fips, abbr, name, region, division]) => [fips, { fips, abbr, name, region, division }]));
  const counties = new Map(us.counties.map(([fips, name, landM2, cbsa]) => {
    const st = states.get(fips.slice(0, 2));
    return [fips, { fips, name, state: st.abbr, stateName: st.name, stateFips: st.fips, landM2, cbsa: cbsa ?? null }];
  }));
  const cbsas = new Map(Object.entries(us.cbsas).map(([code, [title, type]]) => [code, { code, title, type }]));
  const zctas = new Map();
  for (const line of us.zctas.split('\n')) {
    const [zcta, rest] = line.split(' ');
    zctas.set(zcta, rest.split(',').map((p) => {
      const [fips, land] = p.split(':');
      return { fips, landM2: Number(land) };
    }));
  }
  let byCounty = null;
  const countyIndex = () => {
    if (byCounty) return byCounty;
    byCounty = new Map();
    for (const [zcta, parts] of zctas) {
      for (const p of parts) {
        if (!byCounty.has(p.fips)) byCounty.set(p.fips, []);
        byCounty.get(p.fips).push(zcta);
      }
    }
    return byCounty;
  };
  return { states, counties, cbsas, zctas, countyIndex, waterOnly: us.waterOnlyParts };
}

// A share of land as a percentage with two decimals (half away from zero), from whole square metres.
export function percent(part, whole) {
  if (whole <= 0) return 0;
  return Math.round((part * 10000) / whole) / 100;
}
export const percentText = (p, part = 1) => (p === 100 ? '100%' : p === 0 && part > 0 ? 'under 0.01%' : `${p.toFixed(2).replace(/\.?0+$/, '')}%`);

// The parts of a ZCTA, largest land first (ties by FIPS), with shares that add up to the whole.
function zctaParts(U, zcta) {
  const parts = U.zctas.get(zcta);
  if (!parts) return null;
  const total = parts.reduce((s, p) => s + p.landM2, 0);
  const sorted = [...parts].sort((a, b) => b.landM2 - a.landM2 || (a.fips < b.fips ? -1 : 1));
  return { total, parts: sorted.map((p, i) => ({ ...p, sharePercent: percent(p.landM2, total), largest: i === 0 })) };
}

export const countyLabel = (c) => `${c.name}, ${c.state}`;
const isCt = (fips) => fips.startsWith('09');

function usAnswer(code, counties) {
  const first = counties[0];
  if (counties.length === 1) return `ZIP ${code} is in ${countyLabel(first)} (FIPS ${first.fips}): all of its land, by the Census 2020 ZCTA file.`;
  const rest = counties.slice(1).map((c) => `${countyLabel(c)} (${c.fips}) ${percentText(c.sharePercent, c.landM2)}`);
  return `ZIP ${code} crosses ${counties.length} counties: ${percentText(first.sharePercent)} of its land is in ${countyLabel(first)} (FIPS ${first.fips}), then ${rest.join(', ')}, by the Census 2020 ZCTA file.`;
}

// ---------- the GB data ----------

function makeGb(gb) {
  const lads = gb.lads.map(([code, name, county, region, nation]) => ({ code, name, county, region, nation }));
  const districts = new Map();
  for (const line of gb.districts.split('\n')) {
    const bar = line.indexOf('|');
    districts.set(line.slice(0, bar), line);
  }
  const parsed = new Map();
  // One district's postcodes as runs: starts[i] is the first inward number of run i, lengths[i]
  // how many follow in a row, attrs[i] the place of the LAD in the line's list x 2 + terminated.
  const runsOf = (outward) => {
    if (parsed.has(outward)) return parsed.get(outward);
    const line = districts.get(outward);
    if (!line) return null;
    const [, ladList, tokenText] = line.split('|');
    const local = ladList.split(',').map(Number);
    const tokens = tokenText.split(' ');
    const starts = new Int32Array(tokens.length);
    const lengths = new Int32Array(tokens.length);
    const attrs = new Int16Array(tokens.length);
    let prev = -1;
    tokens.forEach((tok, i) => {
      const m = /^([0-9a-zA-Z]+)(?:\.([0-9a-zA-Z]+))?(?:\/([0-9a-zA-Z]+))?$/.exec(tok);
      const start = prev + 1 + fromB62(m[1]);
      const len = 1 + (m[2] ? fromB62(m[2]) : 0);
      starts[i] = start;
      lengths[i] = len;
      attrs[i] = m[3] ? fromB62(m[3]) : 0;
      prev = start + len - 1;
    });
    const runs = { local, starts, lengths, attrs };
    parsed.set(outward, runs);
    return runs;
  };
  const find = (outward, inward) => {
    const runs = runsOf(outward);
    if (!runs) return null;
    const n = Number(inward[0]) * 676 + LETTERS.indexOf(inward[1]) * 26 + LETTERS.indexOf(inward[2]);
    let lo = 0;
    let hi = runs.starts.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (runs.starts[mid] > n) hi = mid - 1;
      else if (runs.starts[mid] + runs.lengths[mid] - 1 < n) lo = mid + 1;
      else {
        const attr = runs.attrs[mid];
        const lad = runs.local[attr >> 1];
        return { lad: lad < 0 ? null : lads[lad], terminated: (attr & 1) === 1 };
      }
    }
    return null;
  };
  // Every postcode counted per LAD, live and terminated (for the reference pages).
  let stats = null;
  const ladStats = () => {
    if (stats) return stats;
    stats = { byLad: new Map(lads.map((l) => [l.code, { live: 0, terminated: 0, districts: new Set() }])), unplaced: { live: 0, terminated: 0 }, live: 0, terminated: 0, districts: districts.size };
    for (const outward of districts.keys()) {
      const runs = runsOf(outward);
      for (let i = 0; i < runs.starts.length; i++) {
        const lad = runs.local[runs.attrs[i] >> 1];
        const term = (runs.attrs[i] & 1) === 1;
        const into = lad < 0 ? stats.unplaced : stats.byLad.get(lads[lad].code);
        if (term) into.terminated += runs.lengths[i]; else into.live += runs.lengths[i];
        if (lad >= 0) into.districts.add(outward);
        if (term) stats.terminated += runs.lengths[i]; else stats.live += runs.lengths[i];
      }
    }
    return stats;
  };
  return {
    release: gb.release,
    lads,
    ladByCode: new Map(lads.map((l) => [l.code, l])),
    counties: new Map(Object.entries(gb.counties)),
    regions: new Map(Object.entries(gb.regions)),
    nations: new Map(Object.entries(gb.countries)),
    districts,
    find,
    ladStats,
  };
}

// ---------- the engine ----------

// files: { us, gb, sources } as parsed from data/ (tool.js reads them).
export function makeEngine(files) {
  const U = makeUs(files.us);
  const G = makeGb(files.gb);
  const releaseYear = G.release.slice(-4);
  const usSource = { ...SOURCES.zcta, readOn: files.sources.us.readOn };
  const gbSource = { ...SOURCES.onspd, vintage: G.release, release: G.release, readOn: files.sources.gb.readOn };

  const cbsaOf = (fips) => {
    const c = U.counties.get(fips);
    return c?.cbsa ? U.cbsas.get(c.cbsa) : null;
  };

  function lookupUs(read, input) {
    const base = { input, country: 'US', code: read.code ?? null };
    if (read.error) return { ...base, found: false, reason: 'malformed', message: read.error, notes: [] };
    const zp = zctaParts(U, read.code);
    const notes = [...read.notes];
    if (!zp) {
      return {
        ...base,
        found: false,
        reason: 'no_zcta',
        message: `ZIP ${read.code} has no ZCTA in the Census 2020 file. ZIP codes used only for PO boxes or one large organization have no area of their own, and a ZIP created after 2020 is not in the file. Find the county from the street address.`,
        notes,
      };
    }
    const counties = zp.parts.map((p) => {
      const c = U.counties.get(p.fips);
      return { fips: c.fips, name: c.name, state: c.state, stateName: c.stateName, landM2: p.landM2, sharePercent: p.sharePercent, largest: p.largest, cbsa: cbsaOf(c.fips) };
    });
    const states = [...new Set(counties.map((c) => c.state))];
    const st = U.states.get(counties[0].fips.slice(0, 2));
    if (counties.some((c) => isCt(c.fips))) {
      notes.push('Connecticut: these are the 8 counties of the 2020 file. Census and federal data from 2022 on use 9 planning regions instead (FIPS 09110 to 09190), and OMB\'s 2023 metro areas are built from them, so no metro area is given here.');
    }
    if (states.length > 1) notes.push(`This ZIP's area crosses a state line: ${states.join(' and ')}.`);
    if (!st.region) notes.push(`${st.name} is not in a Census region (regions cover the 50 states and DC).`);
    return {
      ...base,
      found: true,
      zcta: read.code,
      answer: usAnswer(read.code, counties),
      county: { fips: counties[0].fips, name: counties[0].name, state: counties[0].state },
      counties,
      multiCounty: counties.length > 1,
      states,
      region: st.region ? { region: st.region, division: st.division } : null,
      landKm2: Math.round(zp.total / 1000) / 1000,
      notes,
    };
  }

  function lookupGb(read, input) {
    const base = { input, country: 'GB', code: read.code ?? null };
    if (read.error) return { ...base, found: false, reason: 'malformed', message: read.error, notes: [] };
    const area = /^[A-Z]+/.exec(read.outward)[0];
    if (NOT_COVERED[area]) {
      const where = NOT_COVERED[area];
      const why = area === 'BT'
        ? 'Northern Ireland postcodes need a separate Land and Property Services license for commercial use, so they are not covered here.'
        : `${where[0].toUpperCase()}${where.slice(1)} is a Crown dependency, outside the UK's local authorities, counties and regions.`;
      return { ...base, found: false, reason: 'not_covered', nation: area === 'BT' ? 'Northern Ireland' : null, message: `${read.code} is in ${where}. ${why}`, notes: [] };
    }
    const hit = G.find(read.outward, read.inward);
    if (!hit) {
      return {
        ...base,
        found: false,
        reason: 'not_in_onspd',
        message: `${read.code} is not in the ONS Postcode Directory (${G.release}). Check it: a postcode issued since that release is added in the next one.`,
        notes: [],
      };
    }
    const notes = [];
    const status = hit.terminated ? 'terminated' : 'live';
    if (hit.terminated) notes.push('Terminated postcode: Royal Mail no longer uses it. ONS keeps it, with the areas of its last location.');
    if (!hit.lad) {
      return {
        ...base,
        found: true,
        status,
        answer: `${read.code} is in the ONS Postcode Directory (${G.release}) but has no local authority yet: ONS has not placed it.`,
        localAuthority: null, county: null, countyOrUnitary: null, region: null, nation: null,
        notes: [...notes, 'ONS has no grid reference for it yet, so it is in no area. A new postcode is usually placed in the next release.'],
      };
    }
    const lad = hit.lad;
    const county = lad.county ? { code: lad.county, name: G.counties.get(lad.county) } : null;
    const region = lad.region ? { code: lad.region, name: G.regions.get(lad.region) } : null;
    const nation = { code: lad.nation, name: G.nations.get(lad.nation) };
    const la = { code: lad.code, name: lad.name };
    const where = county ? `${la.name} (${la.code}), in the county of ${county.name} (${county.code})` : `${la.name} (${la.code}), which has no county council above it`;
    const placed = region ? `${region.name}, ${nation.name}` : nation.name;
    if (!county) notes.push(`${la.name} is a single-tier council (unitary authority, London borough, metropolitan borough, or a Scottish or Welsh council): it is also the "county or unitary authority" ONS reports.`);
    return {
      ...base,
      found: true,
      status,
      answer: `${read.code} is in ${where}; ${placed} (ONS Postcode Directory, ${G.release}${hit.terminated ? '; terminated postcode' : ''}).`,
      localAuthority: la,
      county,
      countyOrUnitary: county ?? la,
      region,
      nation,
      notes,
    };
  }

  function lookup({ codes, country = 'auto' }) {
    if (!Array.isArray(codes) || codes.length === 0) throw new ZipError('Give at least one ZIP code or postcode.', 'codes');
    if (codes.length > LIMITS.codes) throw new ZipError(`At most ${LIMITS.codes.toLocaleString('en-US')} codes in one call; split a longer list.`, 'codes');
    const results = codes.map((raw) => {
      const input = String(raw ?? '');
      const read = readCode(input, country);
      return read.country === 'US' ? lookupUs(read, input) : lookupGb(read, input);
    });
    const count = (f) => results.filter(f).length;
    const summary = {
      codes: results.length,
      found: count((r) => r.found),
      notFound: count((r) => !r.found && r.reason !== 'malformed'),
      malformed: count((r) => r.reason === 'malformed'),
      us: count((r) => r.country === 'US' && r.found),
      gb: count((r) => r.country === 'GB' && r.found),
      multiCounty: count((r) => r.multiCounty),
    };
    const sources = [];
    if (results.some((r) => r.country === 'US')) sources.push(usSource, { ...SOURCES.cbsa }, { ...SOURCES.regions });
    if (results.some((r) => r.country === 'GB')) sources.push({ ...gbSource, attribution: ONS_ATTRIBUTION(releaseYear) });
    return { op: 'lookup', answer: results.length === 1 ? (results[0].answer ?? results[0].message) : summaryAnswer(summary), summary, results, sources };
  }

  function summaryAnswer(s) {
    const parts = [`${s.found.toLocaleString('en-US')} of ${s.codes.toLocaleString('en-US')} codes found`];
    if (s.multiCounty) parts.push(`${s.multiCounty.toLocaleString('en-US')} ${s.multiCounty === 1 ? 'ZIP crosses' : 'ZIPs cross'} a county line`);
    if (s.notFound) parts.push(`${s.notFound.toLocaleString('en-US')} not in the official files`);
    if (s.malformed) parts.push(`${s.malformed.toLocaleString('en-US')} not readable as a ZIP or postcode`);
    return `${parts.join('; ')}.`;
  }

  // Every ZCTA with land in a county, with the county's share of each ZCTA's land.
  function county({ fips }) {
    const c = U.counties.get(fips);
    if (!c) throw new ZipError(`No county with FIPS ${fips} in the Census 2020 file. A county FIPS is 5 digits: the state's 2 and the county's 3, such as 48201.`, 'fips');
    const list = (U.countyIndex().get(fips) ?? []).slice().sort();
    const zctas = list.map((zcta) => {
      const zp = zctaParts(U, zcta);
      const mine = zp.parts.find((p) => p.fips === fips);
      return {
        zcta,
        sharePercent: mine.sharePercent,
        landM2: mine.landM2,
        whole: zp.parts.length === 1,
        largest: mine.largest,
        otherCounties: zp.parts.filter((p) => p.fips !== fips).map((p) => {
          const o = U.counties.get(p.fips);
          return { fips: o.fips, name: o.name, state: o.state, sharePercent: p.sharePercent };
        }),
      };
    });
    const whole = zctas.filter((z) => z.whole).length;
    const cbsa = cbsaOf(fips);
    const notes = [];
    if (isCt(fips)) notes.push('Connecticut: 2020 county. Census and federal data from 2022 on use planning regions instead.');
    const answer = zctas.length
      ? `${countyLabel(c)} (FIPS ${fips}) has land in ${zctas.length.toLocaleString('en-US')} ZCTA${zctas.length === 1 ? '' : 's'}: ${whole.toLocaleString('en-US')} wholly inside it and ${(zctas.length - whole).toLocaleString('en-US')} shared with other counties (Census 2020 ZCTA file).`
      : `${countyLabel(c)} (FIPS ${fips}) has no ZCTA land in the Census 2020 file.`;
    return {
      op: 'county',
      answer,
      fips,
      name: c.name,
      state: c.state,
      stateName: c.stateName,
      cbsa,
      zctaCount: zctas.length,
      whollyInside: whole,
      shared: zctas.length - whole,
      zctas,
      notes,
      sources: [usSource, { ...SOURCES.cbsa }],
    };
  }

  return { us: U, gb: G, lookup, county, readCode, usSource, gbSource, cbsaOf, zctaParts: (z) => zctaParts(U, z) };
}

// ---------- CSV ----------

export const CSV_COLUMNS = [
  'input', 'country', 'code', 'found', 'county_code', 'county_name', 'state_or_nation', 'share_percent', 'largest',
  'cbsa_code', 'cbsa_title', 'local_authority_code', 'local_authority_name', 'region', 'status', 'note',
];

// A cell as text: quoted when needed, and never read as a formula by a spreadsheet.
export function csvCell(v) {
  let s = v === null || v === undefined ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// One row per ZIP-county part (US) or per postcode (GB); not-found codes keep a row with the reason.
export function csvRows(results) {
  const rows = [];
  for (const r of results) {
    if (!r.found) {
      rows.push([r.input, r.country, r.code ?? '', 'no', '', '', r.nation ?? '', '', '', '', '', '', '', '', r.reason, r.message]);
      continue;
    }
    if (r.country === 'US') {
      for (const c of r.counties) {
        rows.push([r.input, 'US', r.code, 'yes', c.fips, c.name, c.state, c.sharePercent.toFixed(2), c.largest ? 'yes' : 'no',
          c.cbsa?.code ?? '', c.cbsa?.title ?? '', '', '', r.region?.region ?? '', '', r.notes.join(' ')]);
      }
      continue;
    }
    rows.push([r.input, 'GB', r.code, 'yes', r.countyOrUnitary?.code ?? '', r.countyOrUnitary?.name ?? '', r.nation?.name ?? '', r.localAuthority ? '100.00' : '', r.localAuthority ? 'yes' : '',
      '', '', r.localAuthority?.code ?? '', r.localAuthority?.name ?? '', r.region?.name ?? r.nation?.name ?? '', r.status, r.notes.join(' ')]);
  }
  return rows;
}

export const toCsv = (results) => [CSV_COLUMNS, ...csvRows(results)].map((row) => row.map(csvCell).join(',')).join('\r\n') + '\r\n';

// Splits pasted text into entries: one per line, or separated by commas, semicolons or tabs.
export function splitCodes(text) {
  return String(text ?? '').split(/[\r\n,;\t]+/).map((s) => s.trim()).filter(Boolean);
}
