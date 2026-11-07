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
  return h('p', { class: 'zc-source' }, ['Source: ', ...sources.flatMap((s, i) => [
    i ? '; ' : '',
    h('a', { href: s.url }, s.name),
    s.release ? ` (${s.release})` : s.vintage ? ` (${s.vintage})` : '',
  ]), sources[0].readOn ? `. Files read ${sources[0].readOn}.` : '.']);
}

function usCard(r) {
  const rows = r.counties.map((c) => h('tr', {}, [
    h('th', { scope: 'row' }, [countyLabel(c), c.largest && r.counties.length > 1 ? h('span', { class: 'zc-tag' }, 'largest') : null]),
    h('td', { class: 'num' }, c.fips),
    h('td', { class: 'num' }, percentText(c.sharePercent, c.landM2)),
    h('td', {}, c.cbsa ? `${c.cbsa.title} (${c.cbsa.type})` : 'none'),
  ]));
  return [
    h('p', { class: 'zc-answer' }, [r.county.fips, h('small', {}, ` ${countyLabel(r.county)}`)]),
    h('p', { class: 'zc-sub' }, r.answer),
    h('div', { class: 'zc-bars', 'aria-hidden': 'true' }, r.counties.map((c) => h('span', { style: `flex-grow:${Math.max(c.sharePercent, 0.6)}`, title: `${countyLabel(c)} ${percentText(c.sharePercent, c.landM2)}` }))),
    h('table', { class: 'zc-table' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'County'), h('th', { class: 'num' }, 'FIPS'), h('th', { class: 'num' }, 'Share of land'), h('th', {}, 'Metro or micro area')])),
      h('tbody', {}, rows),
    ]),
    r.region ? h('p', { class: 'zc-aside' }, `Census region: ${r.region.region}, ${r.region.division} division. Land area ${r.landKm2} km².`) : null,
  ];
}

function gbCard(r) {
  if (!r.localAuthority) return [h('p', { class: 'zc-answer' }, r.code), h('p', { class: 'zc-sub' }, r.answer)];
  const dl = h('dl', { class: 'zc-facts' });
  const add = (dt, dd) => dl.append(h('dt', {}, dt), h('dd', {}, dd));
  add('Local authority', `${r.localAuthority.name} (${r.localAuthority.code})`);
  add('County council', r.county ? `${r.county.name} (${r.county.code})` : 'None: single-tier council');
  add('County or unitary authority', `${r.countyOrUnitary.name} (${r.countyOrUnitary.code})`);
  if (r.region) add('Region', `${r.region.name} (${r.region.code})`);
  add('Nation', r.nation.name);
  add('Status', r.status === 'live' ? 'Live' : 'Terminated');
  return [h('p', { class: 'zc-answer' }, [r.code, h('small', {}, ` ${r.localAuthority.name}`)]), h('p', { class: 'zc-sub' }, r.answer), dl];
}

function oneResult(r) {
  if (!r.found) return [h('p', { class: 'zc-answer zc-miss' }, r.code ?? r.input), h('p', { class: 'zc-sub' }, r.message)];
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
    h('p', { class: 'zc-answer' }, [`${s.found.toLocaleString('en-US')}`, h('small', {}, ` of ${s.codes.toLocaleString('en-US')} found`)]),
    h('p', { class: 'zc-sub' }, result.answer),
    h('p', { class: 'zc-downloads' }, download('zip-to-county.csv', toCsv(result.results))),
    h('div', { class: 'zc-scroll' }, h('table', { class: 'zc-table' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'You gave'), h('th', {}, 'Code'), h('th', {}, 'County or local authority'), h('th', { class: 'num' }, 'Share'), h('th', {}, 'Also')])),
      h('tbody', {}, shown.map(row)),
    ])),
    result.results.length > shown.length ? h('p', { class: 'zc-aside' }, `The first ${shown.length} are shown; the CSV has all ${result.results.length.toLocaleString('en-US')}.`) : null,
  ];
}

function countyView(c) {
  return [
    h('p', { class: 'zc-answer' }, [String(c.zctaCount), h('small', {}, ` ZCTAs in ${c.name}, ${c.state}`)]),
    h('p', { class: 'zc-sub' }, c.answer),
    c.cbsa ? h('p', { class: 'zc-aside' }, `Metro or micro area: ${c.cbsa.title} (${c.cbsa.code}).`) : null,
    h('div', { class: 'zc-scroll' }, h('table', { class: 'zc-table' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'ZCTA'), h('th', { class: 'num' }, 'Share in this county'), h('th', {}, 'Other counties')])),
      h('tbody', {}, c.zctas.map((z) => h('tr', {}, [h('td', {}, z.zcta), h('td', { class: 'num' }, percentText(z.sharePercent, z.landM2)),
        h('td', {}, z.otherCounties.map((o) => `${countyLabel(o)} ${percentText(o.sharePercent)}`).join('; '))]))),
    ])),
  ];
}

function render(result, { label, note }) {
  const out = $('zc-out');
  out.textContent = '';
  const body = result.op === 'county' ? countyView(result) : result.results.length === 1 ? oneResult(result.results[0]) : listView(result);
  const notes = result.op === 'county' ? result.notes : result.results.length === 1 ? result.results[0].notes : [];
  out.append(h('div', {}, [
    label ? h('p', { class: 'zc-label' }, label) : null,
    ...body,
    notes?.length ? h('ul', { class: 'zc-notes' }, notes.map((x) => h('li', {}, x))) : null,
    sourceLine(result.sources),
    note ? h('p', { class: 'zc-cost' }, note) : null,
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
    render(result, { label: codes.length === 1 ? 'Your lookup' : 'Your list', note });
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
    render(json.result, { label: 'Your county', note: costNote(json) });
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
  const ex = json.tool.examples.find((x) => x.input.op === 'lookup' && x.input.codes[0] === '39573') ?? json.tool.examples[0];
  if (!asked) {
    $('zc-codes').value = ex.input.codes.join('\n');
    render(ex.output, { label: 'Worked example', note: 'Change the code and press "Look up".' });
  }
}).catch(() => { $('zc-out').textContent = ''; });

// One code or a county runs at once (free here); a longer list waits for the button, since it is paid.
if (asked === 'lookup' && splitCodes($('zc-codes').value).length === 1) $('zc-form').requestSubmit();
if (asked === 'county') $('zc-county-form').requestSubmit();
