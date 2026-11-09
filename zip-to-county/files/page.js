// The ZIP and postcode to county page. Every answer comes from the server through Endwise.run (the
// data files are too large for a page); core.js (the same file the server runs) reads the pasted
// list and writes the results CSV, so the page and the API agree on both. One code or one county
// is free here; a list is charged per code found. The worked example shows at rest.
import { splitCodes, toCsv, percentText, countyLabel, LIMITS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'zip-to-county';
const PAGE_MAX = 50_000;
const $ = (id) => document.getElementById(id);
const country = () => document.querySelector('input[name="country"]:checked').value;

// ---------- drawing an answer ----------

function sourceLine(sources) {
  if (!sources?.length) return null;
  return h('p', { class: 'tf-note zc-source' }, ['Source: ', ...sources.flatMap((s, i) => [
    i ? '; ' : '',
    h('a', { href: s.url }, s.name),
    s.release ? ` (${s.release})` : s.vintage ? ` (${s.vintage})` : '',
  ]), sources[0].readOn ? `. Files read ${sources[0].readOn}.` : '.']);
}

// One line per figure: a mark, what it is, the figure, and where it comes from.
const item = (k, label, fig, src, cls) => h('li', { class: cls ?? null }, [
  h('span', { class: 'k', 'aria-hidden': 'true' }, k),
  h('span', {}, label),
  fig == null ? h('b', {}, '') : h('b', {}, fig),
  h('em', {}, src),
]);
const ZCTA_FILE = 'Census 2020 ZCTA file';

function usCard(r) {
  const many = r.counties.length > 1;
  return [
    h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, countyLabel(r.county)), h('span', {}, `FIPS ${r.county.fips}`)]),
    h('p', { class: 'tf-sub' }, many ? `ZIP ${r.code} has land in ${r.counties.length} counties, largest share first, by the Census 2020 ZCTA file.` : r.answer),
    h('div', { class: 'zc-bars', 'aria-hidden': 'true' }, r.counties.map((c) => h('span', { style: `flex-grow:${Math.max(c.sharePercent, 0.6)}`, title: `${countyLabel(c)} ${percentText(c.sharePercent, c.landM2)}` }))),
    h('ol', { class: 'tf-items zc-items' }, [
      ...r.counties.map((c, i) => item(String(i + 1), `${countyLabel(c)} · FIPS ${c.fips}`, percentText(c.sharePercent, c.landM2),
        `${c.cbsa ? `${c.cbsa.title} (${c.cbsa.type})` : 'No metro or micro area'} · share of land, ${ZCTA_FILE}`, i === 0 && many ? 'hi' : null)),
      r.region ? item('R', `Census region: ${r.region.region}, ${r.region.division} division`, null, 'Census Bureau regions and divisions', 'plain') : null,
      r.landKm2 != null ? item('A', 'Land area of the ZIP', `${r.landKm2} km²`, ZCTA_FILE, 'plain') : null,
    ]),
  ];
}

function gbCard(r) {
  if (!r.localAuthority) return [h('p', { class: 'tf-big' }, h('b', { class: 'word' }, r.code)), h('p', { class: 'tf-sub' }, r.answer)];
  const ONS = 'ONS Postcode Directory';
  return [
    h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, r.localAuthority.name), h('span', {}, r.code)]),
    h('p', { class: 'tf-sub' }, r.answer),
    h('ol', { class: 'tf-items zc-items' }, [
      item('LA', 'Local authority', `${r.localAuthority.name} (${r.localAuthority.code})`, ONS, 'hi'),
      item('CC', 'County council', r.county ? `${r.county.name} (${r.county.code})` : 'None: single-tier council', ONS),
      item('CU', 'County or unitary authority', `${r.countyOrUnitary.name} (${r.countyOrUnitary.code})`, ONS),
      r.region ? item('R', 'Region', `${r.region.name} (${r.region.code})`, ONS) : null,
      item('N', 'Nation', r.nation.name, ONS),
      item('S', 'Status', r.status === 'live' ? 'Live' : 'Terminated', ONS, 'plain'),
    ]),
  ];
}

function oneResult(r) {
  if (!r.found) return [h('p', { class: 'tf-big zc-miss' }, h('b', { class: 'word' }, r.code ?? r.input)), h('p', { class: 'tf-sub' }, r.message)];
  return r.country === 'US' ? usCard(r) : gbCard(r);
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  return h('a', { href: url, download: name, class: 'btn btn-small' }, 'Download the results CSV');
}

function listView(result) {
  const s = result.summary;
  const shown = result.results.slice(0, 200);
  const row = (r) => {
    if (!r.found) return h('tr', { class: 'zc-miss' }, [h('td', {}, r.input), h('td', {}, r.code ?? ''), h('td', { colspan: '3' }, r.message)]);
    if (r.country === 'US') {
      return h('tr', {}, [h('td', {}, r.input), h('td', {}, r.code), h('td', {}, `${countyLabel(r.county)} (${r.county.fips})`),
        h('td', { class: 'num' }, percentText(r.counties[0].sharePercent)), h('td', {}, r.counties.slice(1).map((c) => `${countyLabel(c)} ${percentText(c.sharePercent, c.landM2)}`).join('; '))]);
    }
    return h('tr', {}, [h('td', {}, r.input), h('td', {}, r.code), h('td', {}, r.localAuthority ? `${r.localAuthority.name} (${r.localAuthority.code})` : 'no area yet'),
      h('td', { class: 'num' }, r.localAuthority ? '100%' : ''), h('td', {}, [r.county?.name, r.region?.name ?? r.nation?.name, r.status === 'terminated' ? 'terminated' : null].filter(Boolean).join('; '))]);
  };
  return [
    h('p', { class: 'tf-big' }, [h('b', {}, `${s.found.toLocaleString('en-US')}`), h('span', {}, `of ${s.codes.toLocaleString('en-US')} found`)]),
    h('p', { class: 'tf-sub' }, result.answer),
    h('p', { class: 'zc-downloads' }, download('zip-to-county.csv', toCsv(result.results))),
    h('div', { class: 'zc-scroll' }, h('table', { class: 'zc-table' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'You gave'), h('th', {}, 'Code'), h('th', {}, 'County or local authority'), h('th', { class: 'num' }, 'Share'), h('th', {}, 'Also')])),
      h('tbody', {}, shown.map(row)),
    ])),
    result.results.length > shown.length ? h('p', { class: 'tf-note' }, `The first ${shown.length} are shown; the CSV has all ${result.results.length.toLocaleString('en-US')}.`) : null,
  ];
}

function countyView(c) {
  return [
    h('p', { class: 'tf-big' }, [h('b', {}, String(c.zctaCount)), h('span', {}, `ZCTAs in ${c.name}, ${c.state}`)]),
    h('p', { class: 'tf-sub' }, c.answer),
    c.cbsa ? h('p', { class: 'tf-note' }, `Metro or micro area: ${c.cbsa.title} (${c.cbsa.code}).`) : null,
    h('div', { class: 'zc-scroll' }, h('table', { class: 'zc-table' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'ZCTA'), h('th', { class: 'num' }, 'Share in this county'), h('th', {}, 'Other counties')])),
      h('tbody', {}, c.zctas.map((z) => h('tr', {}, [h('td', {}, z.zcta), h('td', { class: 'num' }, percentText(z.sharePercent, z.landM2)),
        h('td', {}, z.otherCounties.map((o) => `${countyLabel(o)} ${percentText(o.sharePercent)}`).join('; '))]))),
    ])),
  ];
}

// The inputs in one line: "ZIP code 39573", "6 codes: 2134, 10463-2201, ...", "County FIPS 11001".
function inputsLine(result) {
  if (result.op === 'county') return `Every ZIP in county FIPS ${result.fips ?? ''}`.trim();
  const codes = result.results.map((r) => r.input);
  if (codes.length === 1) return `${result.results[0].country === 'GB' ? 'UK postcode' : 'ZIP code'} ${codes[0]}`;
  return `${codes.length.toLocaleString('en-US')} codes: ${codes.slice(0, 4).join(', ')}${codes.length > 4 ? ', ...' : ''}`;
}

// kind: 'example' (the worked example, at rest) or 'run' (your lookup).
function render(result, { kind, note }) {
  const out = $('zc-out');
  out.textContent = '';
  const body = result.op === 'county' ? countyView(result) : result.results.length === 1 ? oneResult(result.results[0]) : listView(result);
  const notes = result.op === 'county' ? result.notes : result.results.length === 1 ? result.results[0].notes : [];
  out.append(h('div', {}, [
    h('div', { class: 'tf-rh' }, [
      kind === 'example' ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src' }, result.op === 'county' ? 'Census 2020 ZCTA file' : 'Census 2020 and ONS files'),
    ]),
    h('p', { class: 'tf-exin' }, kind === 'example' ? `Example: ${inputsLine(result)}` : inputsLine(result)),
    ...body,
    notes?.length ? h('ul', { class: 'zc-notes' }, notes.map((x) => h('li', {}, x))) : null,
    sourceLine(result.sources),
    note ? h('p', { class: 'tf-cost' }, note) : null,
  ]));
}

// ---------- running ----------

function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'No charge.';
  if (typeof json.freeRunsLeft === 'number') return `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  return null;
}

function showError(e, errId = 'zc-error') {
  const box = $(errId);
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited' || e.code === 'sign_in_required') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in or create an account'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

// A list longer than one call goes in calls of 10,000, one after another; the answers are joined.
async function runList(codes, ctry) {
  const results = [];
  let charged = 0;
  let last = null;
  let sources = [];
  for (let i = 0; i < codes.length; i += LIMITS.codes) {
    $('zc-status').textContent = `Looking up ${Math.min(i + LIMITS.codes, codes.length).toLocaleString('en-US')} of ${codes.length.toLocaleString('en-US')}.`;
    const json = await T.run(SLUG, { op: 'lookup', codes: codes.slice(i, i + LIMITS.codes), country: ctry });
    results.push(...json.result.results);
    for (const s of json.result.sources) if (!sources.some((x) => x.name === s.name)) sources.push(s);
    charged += json.charged?.amount ?? 0;
    last = json;
  }
  const count = (f) => results.filter(f).length;
  const summary = {
    codes: results.length,
    found: count((r) => r.found),
    notFound: count((r) => !r.found && r.reason !== 'malformed'),
    malformed: count((r) => r.reason === 'malformed'),
    multiCounty: count((r) => r.multiCounty),
  };
  const parts = [`${summary.found.toLocaleString('en-US')} of ${summary.codes.toLocaleString('en-US')} codes found`];
  if (summary.multiCounty) parts.push(`${summary.multiCounty.toLocaleString('en-US')} ${summary.multiCounty === 1 ? 'ZIP crosses' : 'ZIPs cross'} a county line`);
  if (summary.notFound) parts.push(`${summary.notFound.toLocaleString('en-US')} not in the official files`);
  if (summary.malformed) parts.push(`${summary.malformed.toLocaleString('en-US')} not readable as a ZIP or postcode`);
  const note = codes.length > LIMITS.codes && last?.balance
    ? `Charged $${(charged / 1e6).toFixed(4).replace(/0+$/, '').replace(/\.$/, '')} in ${Math.ceil(codes.length / LIMITS.codes)} calls. Your balance is ${last.balance.display}.`
    : costNote(last);
  return { result: { op: 'lookup', answer: `${parts.join('; ')}.`, summary, results, sources }, note };
}

async function onLookup(ev) {
  ev.preventDefault();
  $('zc-error').textContent = '';
  $('zc-codes-err').textContent = '';
  const codes = splitCodes($('zc-codes').value);
  if (!codes.length) { $('zc-codes-err').textContent = 'Enter a ZIP code or a postcode.'; return; }
  if (codes.length > PAGE_MAX) { $('zc-codes-err').textContent = `At most ${PAGE_MAX.toLocaleString('en-US')} here; send a longer list from code.`; return; }
  const bad = codes.find((c) => c.length > LIMITS.codeChars);
  if (bad) { $('zc-codes-err').textContent = `"${bad.slice(0, 30)}..." is too long for a ZIP code or postcode.`; return; }
  const button = $('zc-run');
  button.disabled = true;
  try {
    const { result, note } = await runList(codes, country());
    render(result, { kind: 'run', note });
    $('zc-status').textContent = result.answer;
  } catch (e) {
    showError(e);
  } finally {
    button.disabled = false;
  }
}

async function onCounty(ev) {
  ev.preventDefault();
  $('zc-fips-err').textContent = '';
  const fips = $('zc-fips').value.trim();
  if (!/^\d{5}$/.test(fips)) { $('zc-fips-err').textContent = 'A county FIPS code is 5 digits, such as 48201.'; return; }
  const button = $('zc-county-run');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, { op: 'county', fips });
    render(json.result, { kind: 'run', note: costNote(json) });
  } catch (e) {
    showError(e, 'zc-fips-err');
  } finally {
    button.disabled = false;
  }
}

// ---------- boot ----------

// ?q=39573,02134 or ?county=48201 open the page with those filled in (content pages link here).
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const codes = q.get('q');
  const county = q.get('county');
  if (codes) $('zc-codes').value = splitCodes(codes).slice(0, 200).join('\n');
  if (county && /^\d{5}$/.test(county)) $('zc-fips').value = county;
  return codes ? 'lookup' : county ? 'county' : null;
}

$('zc-form').addEventListener('submit', onLookup);
$('zc-county-form').addEventListener('submit', onCounty);
const asked = fromQuery();

T.api(`/api/v1/tools/${SLUG}`).then((json) => {
  const ex = json.tool.examples[0];
  if (!asked) {
    $('zc-codes').value = ex.input.codes.join('\n');
    render(ex.output, { kind: 'example', note: 'Change the code and press "Look up".' });
  }
}).catch(() => { $('zc-out').textContent = ''; });

// One code or a county runs at once (free here); a longer list waits for the button, since it is paid.
if (asked === 'lookup' && splitCodes($('zc-codes').value).length === 1) $('zc-form').requestSubmit();
if (asked === 'county') $('zc-county-form').requestSubmit();
