// The minimum wage page. The rate data lives on the server (data/ is never served), so every answer
// comes through Endwise.run: one place is free on this page. The worked example is in the HTML, so
// it shows at rest. Query parameters (?address=, ?zip=, ?state=&city=&county=&unincorporated=,
// &date=, &employees=) prefill the form; content pages link here with them and run=1.
import { STATES } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'minimum-wage-lookup';
const $ = (id) => document.getElementById(id);
const by = () => document.querySelector('input[name="by"]:checked').value;

function showBy(value) {
  const radio = document.querySelector(`input[name="by"][value="${value}"]`);
  if (!radio.checked) { radio.checked = true; radio.dispatchEvent(new Event('change', { bubbles: true })); }
  for (const el of document.querySelectorAll('[data-by]')) el.hidden = el.dataset.by !== value;
}

function fillStates() {
  const sel = $('mw-state');
  const list = Object.entries(STATES).sort((a, b) => a[1][0].localeCompare(b[1][0]));
  sel.replaceChildren(...list.map(([code, [name]]) => h('option', { value: code }, name)));
  sel.value = 'CA';
}

function placeInput() {
  const kind = by();
  if (kind === 'address') return { address: $('mw-address').value.trim() };
  if (kind === 'zip') return { zip: $('mw-zip').value.trim() };
  const p = { state: $('mw-state').value };
  if ($('mw-city').value.trim()) p.city = $('mw-city').value.trim();
  if ($('mw-county').value.trim()) p.county = $('mw-county').value.trim();
  if ($('mw-uninc').checked && !p.city) p.unincorporated = true;
  return p;
}

// ---------- drawing an answer ----------

const link = (s) => (s?.url ? h('a', { href: s.url, rel: 'noopener' }, s.title) : null);

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (iso) => (iso ? `${MON[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}, ${iso.slice(0, 4)}` : '');
const LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const long = (iso) => `${LONG[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}, ${iso.slice(0, 4)}`;
const ABBR = { federal: 'US', state: 'ST', county: 'CO', city: 'CI' };

// One line per layer (federal, state, county, city): its rate, since when, tipped cash and source.
// The layer that sets the rate is marked; the ones under it are dimmed.
function layerItems(r) {
  return h('ol', { class: 'tf-items mw-items' }, r.layers.map((l) => {
    const wins = r.setBy?.id === l.id;
    const tipped = l.tippedCash === null ? '' : l.tippedCash === 'unknown' ? 'Tipped cash not covered. ' : `Tipped cash $${l.tippedCash}. `;
    const when = l.from ? `since ${short(l.from)}` : l.inForceOn ? `in force ${short(l.inForceOn)}` : '';
    return h('li', { class: wins ? 'hi' : 'dim' }, [
      h('span', { class: 'k', 'aria-hidden': 'true' }, ABBR[l.level] ?? '·'),
      h('span', {}, [l.name, when ? `, ${when}` : '', l.tier ? ` (${l.tier})` : '', l.region ? ` (${l.region})` : '']),
      h('b', {}, `$${l.rate}`),
      h('em', {}, [tipped, link(l.source), l.source?.readOn ? `, read ${short(l.source.readOn)}` : '']),
    ]);
  }));
}

function onePlace(r) {
  if (r.status === 'not-found' || r.status === 'error') return [h('p', { class: 'tf-big' }, h('b', { class: 'word' }, 'Not found')), h('p', { class: 'tf-sub' }, r.answer)];
  if (r.candidates) {
    return [
      h('p', { class: 'tf-big' }, [h('b', {}, `$${r.range.low} to $${r.range.high}`), h('span', {}, r.where)]),
      h('p', { class: 'tf-sub' }, r.answer),
      ...r.candidates.flatMap((c) => [h('h3', { class: 'mw-cand' }, c.where.replace(/^the /, 'The ')), h('p', { class: 'tf-sub' }, c.answer), layerItems(c)]),
    ];
  }
  const out = [
    h('p', { class: 'tf-big' }, [h('b', {}, r.status === 'not-covered' ? `$${r.rate}+` : `$${r.rate}`), h('span', {}, `an hour, ${r.where}, ${long(r.date)}`)]),
    h('p', { class: 'tf-sub' }, r.answer),
    layerItems(r),
  ];
  if (r.possible?.length) out.push(h('p', { class: 'mw-warn' }, r.possible.map((p) => `${p.name}${p.rate ? ` ($${p.rate})` : ''} applies ${p.when}.`).join(' ')));
  if (r.notCovered?.length) out.push(h('p', { class: 'mw-warn' }, ['Not covered: ', ...r.notCovered.flatMap((n) => [n.url ? h('a', { href: n.url, rel: 'noopener' }, n.name) : n.name, `: ${n.why} `])]));
  if (r.notes?.length) out.push(h('ul', { class: 'mw-list' }, r.notes.map((n) => h('li', {}, n))));
  if (r.geocoded) out.push(h('p', { class: 'tf-cost' }, `Census geocoder match: ${r.geocoded.matchedAddress}${r.geocoded.place ? `, in ${r.geocoded.place.name}` : ', outside any incorporated city'}, ${r.geocoded.county.name}.`));
  return out;
}

// The inputs in one line: "Los Angeles, California, on November 9, 2026, 25 employees".
function inputsLine(r) {
  const p = placeInput();
  const where = p.address ?? (p.zip ? `ZIP ${p.zip}` : r.where);
  const emp = $('mw-emp').value.trim();
  return `${where}, on ${long(r.date ?? $('mw-date').value)}${emp ? `, ${emp} employees` : ''}`;
}

function render(result, note) {
  const box = $('mw-out');
  const r = result.results[0];
  const set = r.setBy?.name ? `Set by ${r.setBy.name}` : r.status === 'not-covered' ? 'Not covered' : '';
  box.replaceChildren(
    h('div', { class: 'tf-rh' }, [h('span', { class: 'tf-tag run' }, 'Your result'), h('span', { class: 'tf-src' }, set)]),
    h('p', { class: 'tf-exin' }, inputsLine(r)),
    ...onePlace(r),
  );
  if (note) box.append(h('p', { class: 'tf-cost' }, note));
}

function costNote(json) {
  const amt = json?.charged?.amount ?? 0;
  return amt ? `Charged ${json.charged.display}.` : 'Free on this page.';
}

function showError(e) {
  const msg = e.fields ? Object.values(e.fields)[0] : e.message;
  $('mw-error').textContent = msg || 'Something went wrong; try again.';
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') $('mw-error').append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

async function onRun(ev) {
  ev?.preventDefault();
  $('mw-error').textContent = '';
  const place = placeInput();
  if (Object.values(place).some((v) => v === '')) { $('mw-error').textContent = 'Enter where the work is.'; return; }
  const input = { op: 'lookup', places: [place] };
  if ($('mw-date').value) input.date = $('mw-date').value;
  const emp = $('mw-emp').value.trim();
  if (emp) {
    if (!/^\d+$/.test(emp) || Number(emp) < 1) { $('mw-error').textContent = 'Employees is a whole number, such as 25.'; return; }
    input.employees = Number(emp);
  }
  const button = $('mw-run');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, input);
    render(json.result, costNote(json));
    $('mw-status').textContent = json.result.answer;
  } catch (e) {
    showError(e);
  } finally {
    button.disabled = false;
  }
}

// ---------- boot ----------

function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  let kind = null;
  if (q.get('address')) { $('mw-address').value = q.get('address').slice(0, 200); kind = 'address'; }
  else if (q.get('zip')) { $('mw-zip').value = q.get('zip').slice(0, 10); kind = 'zip'; }
  else if (q.get('state')) {
    const st = q.get('state').toUpperCase();
    if (STATES[st]) $('mw-state').value = st;
    $('mw-city').value = (q.get('city') ?? '').slice(0, 200);
    $('mw-county').value = (q.get('county') ?? '').slice(0, 200);
    $('mw-uninc').checked = q.get('unincorporated') === 'true';
    if ($('mw-county').value || $('mw-uninc').checked) $('mw-county-fold').open = true;
    kind = 'names';
  }
  const d = q.get('date');
  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) $('mw-date').value = d;
  const e = q.get('employees');
  if (e && /^\d+$/.test(e)) $('mw-emp').value = e;
  return { kind, run: q.get('run') === '1' };
}

fillStates();
$('mw-date').value = new Date().toISOString().slice(0, 10);
for (const r of document.querySelectorAll('input[name="by"]')) r.addEventListener('change', () => showBy(by()));
$('mw-form').addEventListener('submit', onRun);
const asked = fromQuery();
// At rest the form holds the worked example's place (the result beside it is in the HTML).
showBy(asked.kind ?? 'names');
if (!asked.kind) $('mw-city').value = 'Los Angeles';
// One place is free here, so a prefilled lookup runs at once.
if (asked.kind) $('mw-form').requestSubmit();
