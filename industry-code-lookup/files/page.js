// The industry and product code checker page. Every answer comes from the server through
// Endwise.run (the tables are too large for a page); core.js (the same file the server runs) splits
// the pasted list and writes the results CSV, so the page and the API agree on both. One code or one
// search is free here; a list is charged per code checked. The worked example shows at rest.
import { splitCodes, toCsv, SYSTEM_NAMES, LIMITS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'industry-code-lookup';
const $ = (id) => document.getElementById(id);

// ---------- drawing an answer ----------

function sourceLine(sources) {
  if (!sources?.length) return null;
  return h('p', { class: 'ic-source' }, ['Source: ', ...sources.flatMap((s, i) => [i ? '; ' : '', h('a', { href: s.url }, s.name)]), sources[0].readOn ? `. Tables read ${sources[0].readOn}.` : '.']);
}

const statusText = { valid: 'Valid', 'not-found': 'Not found', malformed: 'Not a code', retired: 'Retired' };

function details(r) {
  const dl = h('dl', { class: 'ic-facts' });
  const add = (dt, dd) => { if (dd !== null && dd !== undefined && dd !== '') dl.append(h('dt', {}, dt), h('dd', {}, dd)); };
  add('System', SYSTEM_NAMES[r.system] ?? r.system);
  add('Edition', r.edition);
  add('Level', r.level);
  if (r.path?.length > 1) add('Under', r.path.slice(0, -1).map((p) => `${p.code} ${p.title}`).join(' > '));
  if (r.generalRate) add('General duty', r.generalRate);
  if (r.sba?.text) add('SBA size standard', r.sba.text);
  if (r.naics2017 && r.naics2017.join() !== r.code) add('NAICS 2017', r.naics2017.join(', '));
  if (r.sic?.length) add('SIC 1987', r.sic.map((s) => `${s.code} ${s.title}`).join('; '));
  if (r.scheduleC) add('Schedule C', `${r.scheduleC.code} ${r.scheduleC.title}`);
  if (r.naics) add('NAICS', `${r.naics.code}${r.naics.title ? ` ${r.naics.title}` : ''}`);
  if (r.naics2022?.length) add('NAICS 2022', r.naics2022.map((x) => `${x.code} ${x.title}`).join('; '));
  if (r.section) add('Section', `${r.section.code} ${r.section.title}`);
  if (r.category) add('Category', r.category);
  if (r.replacedBy?.length) add('Now', r.replacedBy.map((x) => `${x.code} ${x.title}`).join('; '));
  if (r.next) add('Next revision', r.next.text ?? (r.next.change === 'none' ? 'No change proposed for NAICS 2027' : `NAICS 2027 (proposed): ${r.next.change}, ${r.next.to.map((t) => `${t.code} ${t.title}`).join('; ')}`));
  return dl;
}

function oneResult(r) {
  const out = [
    h('p', { class: `ic-answer${r.valid ? '' : ' ic-miss'}` }, [r.code ?? r.input, h('small', {}, ` ${statusText[r.status] ?? r.status}`)]),
    h('p', { class: 'ic-sub' }, r.answer),
  ];
  if (r.valid || r.status === 'retired') out.push(details(r));
  if (r.description) out.push(h('p', { class: 'ic-aside' }, r.description.split('\n')[0]));
  if (r.statistical?.length) out.push(h('p', { class: 'ic-aside' }, `Statistical numbers: ${r.statistical.map((s) => `${s.code} ${s.title}`).join('; ')}.`));
  if (r.matches?.length > 1) out.push(h('p', { class: 'ic-aside' }, `Also valid as: ${r.matches.slice(1).map((m) => `${SYSTEM_NAMES[m.system]} (${m.title})`).join('; ')}.`));
  return out;
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  return h('a', { href: url, download: name, class: 'btn btn-small' }, 'Download the results CSV');
}

function listView(result) {
  const s = result.summary;
  const shown = result.results.slice(0, 300);
  return [
    h('p', { class: 'ic-answer' }, [s.valid.toLocaleString('en-US'), h('small', {}, ` of ${s.codes.toLocaleString('en-US')} valid`)]),
    h('p', { class: 'ic-sub' }, result.answer),
    h('p', { class: 'ic-downloads' }, download('code-check.csv', toCsv(result.results))),
    h('div', { class: 'ic-scroll' }, h('table', { class: 'ic-table' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'You gave'), h('th', {}, 'Result'), h('th', {}, 'System'), h('th', {}, 'Title or reason')])),
      h('tbody', {}, shown.map((r) => h('tr', { class: r.valid ? '' : 'ic-miss' }, [
        h('td', {}, r.input), h('td', {}, statusText[r.status] ?? r.status), h('td', {}, SYSTEM_NAMES[r.system] ?? ''), h('td', {}, r.valid ? r.title : r.answer),
      ]))),
    ])),
    result.results.length > shown.length ? h('p', { class: 'ic-aside' }, `The first ${shown.length} are shown; the CSV has all ${result.results.length.toLocaleString('en-US')}.`) : null,
  ];
}

function searchView(r) {
  return [
    h('p', { class: 'ic-answer' }, [String(r.total), h('small', {}, ` ${r.total === 1 ? 'line' : 'lines'} for "${r.query}"`)]),
    h('p', { class: 'ic-sub' }, r.answer),
    r.results.length ? h('div', { class: 'ic-scroll' }, h('table', { class: 'ic-table' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'Code'), h('th', {}, 'Title'), h('th', {}, r.system === 'naics' ? 'Index entry' : r.system === 'hts' ? 'General duty' : '')])),
      h('tbody', {}, r.results.map((x) => h('tr', {}, [h('td', { class: 'num' }, x.code), h('td', {}, x.title), h('td', {}, x.matched ?? x.generalRate ?? (x.lines ? `${x.lines} HTS lines` : ''))]))),
    ])) : null,
    h('p', { class: 'ic-aside' }, r.note),
  ];
}

function render(result, { label, note, example }) {
  const out = $('ic-out');
  out.textContent = '';
  const body = result.op === 'search' ? searchView(result) : result.results.length === 1 ? oneResult(result.results[0]) : listView(result);
  const notes = result.op === 'check' && result.results.length === 1 ? result.results[0].notes : [];
  out.append(h('div', {}, [
    label && example ? h('p', { class: 't-ex' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', {}, `${label}: ${example}`)]) : label ? h('p', { class: 'ic-label' }, label) : null,
    ...body,
    notes?.length ? h('ul', { class: 'ic-notes' }, notes.map((x) => h('li', {}, x))) : null,
    sourceLine(result.op === 'search' ? result.sources : result.results.length === 1 ? result.results[0].sources ?? result.sources : result.sources),
    note ? h('p', { class: 'ic-cost' }, note) : null,
  ]));
}

// ---------- running ----------

function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'No charge.';
  if (typeof json.freeRunsLeft === 'number') return `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  return null;
}

function showError(e, errId) {
  const box = $(errId);
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited' || e.code === 'sign_in_required') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in or create an account'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

async function onCheck(ev) {
  ev.preventDefault();
  $('ic-error').textContent = '';
  $('ic-codes-err').textContent = '';
  const codes = splitCodes($('ic-codes').value);
  if (!codes.length) { $('ic-codes-err').textContent = 'Enter a code, such as 722511.'; return; }
  if (codes.length > LIMITS.codes) { $('ic-codes-err').textContent = `At most ${LIMITS.codes.toLocaleString('en-US')} codes at once; split the list.`; return; }
  const long = codes.find((c) => c.length > LIMITS.codeChars);
  if (long) { $('ic-codes-err').textContent = `"${long.slice(0, 30)}..." is too long for a code.`; return; }
  const button = $('ic-run');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, { op: 'check', codes, system: $('ic-system').value });
    render(json.result, { label: codes.length === 1 ? 'Your check' : 'Your list', note: costNote(json) });
    $('ic-status').textContent = json.result.answer;
  } catch (e) {
    showError(e, 'ic-error');
  } finally {
    button.disabled = false;
  }
}

async function onSearch(ev) {
  ev.preventDefault();
  $('ic-query-err').textContent = '';
  const query = $('ic-query').value.trim();
  if (!query) { $('ic-query-err').textContent = 'Type a word or two, such as "food truck".'; return; }
  const button = $('ic-search-run');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, { op: 'search', query, system: $('ic-search-system').value });
    render(json.result, { label: 'Your search', note: costNote(json) });
  } catch (e) {
    showError(e, 'ic-query-err');
  } finally {
    button.disabled = false;
  }
}

// ---------- boot ----------

const SEARCHABLE = ['naics', 'hts', 'hs', 'schedule-b', 'uk-sic', 'schedule-c'];
// ?q=722511,454110&system=naics or ?search=food+truck&system=naics open the page with those filled
// in (content pages link here).
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const codes = q.get('q');
  const search = q.get('search');
  const system = q.get('system');
  if (codes) {
    $('ic-codes').value = splitCodes(codes).slice(0, 200).join('\n');
    if (system && [...$('ic-system').options].some((o) => o.value === system)) $('ic-system').value = system;
  }
  if (search) {
    $('ic-query').value = search.slice(0, LIMITS.queryChars);
    if (system && SEARCHABLE.includes(system)) $('ic-search-system').value = system;
  }
  return codes ? 'check' : search ? 'search' : null;
}

$('ic-form').addEventListener('submit', onCheck);
$('ic-search-form').addEventListener('submit', onSearch);
const asked = fromQuery();

T.api(`/api/v1/tools/${SLUG}`).then((json) => {
  const ex = json.tool.examples[0];
  if (!asked) {
    $('ic-codes').value = ex.input.codes.join('\n');
    render(ex.output, { label: 'Worked example', example: ex.title, note: 'Change the codes and press "Check the codes".' });
  }
}).catch(() => { if (!asked) $('ic-out').textContent = ''; });

// One code or a search runs at once (free here); a longer list waits for the button, since it is paid.
if (asked === 'check' && splitCodes($('ic-codes').value).length === 1) $('ic-form').requestSubmit();
if (asked === 'search') $('ic-search-form').requestSubmit();
