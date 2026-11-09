// The renewal tracker page. The state rules live on the server (data/states.json is never served),
// so every total is the server's, through Endwise.run: free on this page. The activity log is kept
// in this browser (localStorage) and sent with each run; the server does not store it.
const T = window.Endwise;
const h = T.h;
const SLUG = 'teacher-license-renewal-tracker';
const $ = (id) => document.getElementById(id);

// The states, and for the covered ones their license types (the tests check this against the data).
export const STATES = {"AK": "Alaska", "AL": "Alabama", "AR": "Arkansas", "AZ": "Arizona", "CA": "California", "CO": "Colorado", "CT": "Connecticut", "DC": "District of Columbia", "DE": "Delaware", "FL": "Florida", "GA": "Georgia", "HI": "Hawaii", "IA": "Iowa", "ID": "Idaho", "IL": "Illinois", "IN": "Indiana", "KS": "Kansas", "KY": "Kentucky", "LA": "Louisiana", "MA": "Massachusetts", "MD": "Maryland", "ME": "Maine", "MI": "Michigan", "MN": "Minnesota", "MO": "Missouri", "MS": "Mississippi", "MT": "Montana", "NC": "North Carolina", "ND": "North Dakota", "NE": "Nebraska", "NH": "New Hampshire", "NJ": "New Jersey", "NM": "New Mexico", "NV": "Nevada", "NY": "New York", "OH": "Ohio", "OK": "Oklahoma", "OR": "Oregon", "PA": "Pennsylvania", "RI": "Rhode Island", "SC": "South Carolina", "SD": "South Dakota", "TN": "Tennessee", "TX": "Texas", "UT": "Utah", "VA": "Virginia", "VT": "Vermont", "WA": "Washington", "WI": "Wisconsin", "WV": "West Virginia", "WY": "Wyoming"};
export const LICENSES = {"AK": [{"id": "five-year", "name": "Regular five-year certificate", "entered": false, "birth": false, "units": ["credit", "semester", "quarter", "ceu", "micro", "hour"], "categories": []}], "CA": [{"id": "clear-credential", "name": "Clear teaching or services credential", "entered": false, "birth": false, "units": ["hour"], "categories": []}, {"id": "child-development-permit", "name": "Child Development Permit", "entered": false, "birth": false, "units": ["hour"], "categories": []}], "CO": [{"id": "professional-teacher", "name": "Professional teacher license", "entered": false, "birth": false, "units": ["hour", "semester", "quarter", "ceu"], "categories": [["behavioral-health", "Behavioral health"], ["disabilities", "Educating students with disabilities"], ["english-learner", "English Learner Professional Learning"]]}], "GA": [{"id": "professional-not-employed", "name": "Standard or Performance-Based Professional certificate (not employed in a Georgia school system at renewal)", "entered": true, "birth": false, "units": ["semester", "plu", "ceu", "hour"], "categories": []}], "IA": [{"id": "standard", "name": "Standard teaching license", "entered": false, "birth": false, "units": ["credit"], "categories": [["ipdp", "Individual professional development plan"]]}, {"id": "master-educator", "name": "Master educator teaching license", "entered": false, "birth": false, "units": ["credit"], "categories": [["ipdp", "Individual professional development plan"]]}], "MA": [{"id": "professional", "name": "Professional license", "entered": false, "birth": false, "units": ["pdp"], "categories": [["content", "Content"], ["pedagogy", "Pedagogy"], ["sei-esl", "Sheltered English Immersion"], ["disabilities", "Students with disabilities and diverse learning styles"]]}], "ME": [{"id": "teacher", "name": "Teacher, specialist or administrator certificate", "entered": true, "birth": false, "units": ["semester", "hour"], "categories": []}, {"id": "education-technician", "name": "Education technician", "entered": true, "birth": false, "units": ["semester", "hour"], "categories": []}], "MT": [{"id": "class-1", "name": "Class 1 license", "entered": false, "birth": false, "units": ["pdu", "semester", "quarter"], "categories": []}, {"id": "class-2", "name": "Class 2 license", "entered": false, "birth": false, "units": ["pdu", "semester", "quarter"], "categories": []}, {"id": "class-3", "name": "Class 3 license", "entered": false, "birth": false, "units": ["pdu", "semester", "quarter"], "categories": []}], "NC": [{"id": "grades-k-5", "name": "Continuing Professional License, grades K-5", "entered": false, "birth": false, "units": ["credit", "ceu", "hour"], "categories": [["subject", "Subject area"], ["literacy", "Literacy"]]}, {"id": "grades-6-12", "name": "Continuing Professional License, grades 6-12", "entered": false, "birth": false, "units": ["credit", "ceu", "hour"], "categories": [["subject", "Subject area"]]}, {"id": "student-services", "name": "Continuing Professional License, student services personnel", "entered": false, "birth": false, "units": ["credit", "ceu", "hour"], "categories": [["discipline", "Professional discipline"]]}, {"id": "administrators", "name": "Continuing Professional License, administrators", "entered": false, "birth": false, "units": ["credit", "ceu", "hour"], "categories": [["executive", "Executive's role"]]}], "NE": [{"id": "standard", "name": "Initial or Standard teaching certificate", "entered": false, "birth": false, "units": ["semester"], "categories": []}, {"id": "professional", "name": "Professional teaching certificate", "entered": false, "birth": false, "units": ["semester"], "categories": []}], "NY": [{"id": "professional", "name": "Professional classroom teacher or school leader certificate", "entered": false, "birth": true, "units": ["hour", "semester", "quarter"], "categories": [["language-acquisition", "Language acquisition"], ["mentoring-new-teacher", "Mentoring a new classroom teacher"], ["mentoring-candidate", "Mentoring a teacher candidate"]]}, {"id": "professional-esol-bilingual", "name": "Professional ESOL certificate or Bilingual Education extension", "entered": false, "birth": true, "units": ["hour", "semester", "quarter"], "categories": [["language-acquisition", "Language acquisition"], ["mentoring-new-teacher", "Mentoring a new classroom teacher"], ["mentoring-candidate", "Mentoring a teacher candidate"]]}, {"id": "teaching-assistant-level-3", "name": "Level III Teaching Assistant certificate", "entered": false, "birth": true, "units": ["hour", "semester", "quarter"], "categories": [["language-acquisition", "Language acquisition"], ["mentoring-new-teacher", "Mentoring a new classroom teacher"], ["mentoring-candidate", "Mentoring a teacher candidate"]]}, {"id": "permanent", "name": "Permanent classroom teacher or school leader certificate", "entered": false, "birth": true, "units": ["hour"], "categories": []}], "OH": [{"id": "five-year-professional", "name": "Five-year professional or associate license", "entered": false, "birth": false, "units": ["hour", "semester", "quarter", "ceu"], "categories": []}], "OR": [{"id": "professional-teaching", "name": "Professional Teaching License", "entered": true, "birth": false, "units": ["pdu", "hour", "semester", "quarter"], "categories": []}, {"id": "preliminary-teaching", "name": "Preliminary Teaching License", "entered": true, "birth": false, "units": ["pdu", "hour", "semester", "quarter"], "categories": []}, {"id": "professional-administrator", "name": "Professional Administrator License", "entered": true, "birth": false, "units": ["pdu", "hour", "semester", "quarter"], "categories": []}, {"id": "principal", "name": "Principal License", "entered": true, "birth": false, "units": ["pdu", "hour", "semester", "quarter"], "categories": []}], "PA": [{"id": "act-48", "name": "Professional educator certificate (Act 48)", "entered": false, "birth": false, "units": ["hour", "semester", "cpe"], "categories": []}], "SD": [{"id": "educator", "name": "Teacher, administrator or education specialist certificate", "entered": false, "birth": false, "units": ["credit", "semester", "hour"], "categories": [["transcripted", "Transcripted college credit"]]}], "TN": [{"id": "professional", "name": "Professional license", "entered": true, "birth": false, "units": ["pdp", "hour", "micro", "ceu", "semester"], "categories": []}], "TX": [{"id": "classroom-teacher", "name": "Classroom Teacher", "entered": false, "birth": false, "units": ["hour", "semester"], "categories": [["disabilities", "Educating students with disabilities, including dyslexia"], ["independent-study", "Independent study"], ["presenting", "Teaching or presenting CPE activities"], ["mentoring", "Mentoring other educators"], ["mental-health", "Mental health first aid, trauma-informed care, grief-informed practices"]]}, {"id": "principal-and-student-services", "name": "Principal, Superintendent, Counselor, Librarian, Educational Diagnostician or Reading Specialist", "entered": false, "birth": false, "units": ["hour", "semester"], "categories": [["disabilities", "Educating students with disabilities, including dyslexia"], ["independent-study", "Independent study"], ["presenting", "Teaching or presenting CPE activities"], ["mentoring", "Mentoring other educators"], ["mental-health", "Mental health first aid, trauma-informed care, grief-informed practices"]]}, {"id": "multiple-certificates", "name": "Multiple certificates (classroom teacher, administrator and/or student services)", "entered": false, "birth": false, "units": ["hour", "semester"], "categories": [["disabilities", "Educating students with disabilities, including dyslexia"], ["independent-study", "Independent study"], ["presenting", "Teaching or presenting CPE activities"], ["mentoring", "Mentoring other educators"], ["mental-health", "Mental health first aid, trauma-informed care, grief-informed practices"]]}], "UT": [{"id": "professional-educator-license", "name": "Professional Educator License (PEL)", "entered": false, "birth": false, "units": ["hour"], "categories": []}], "VT": [{"id": "level-2", "name": "Level II license (per endorsement)", "entered": true, "birth": false, "units": ["semester", "hour"], "categories": [["endorsement", "Knowledge and performance standards of the endorsement"]]}, {"id": "level-1", "name": "Three-year Level I license (per endorsement)", "entered": false, "birth": false, "units": ["semester", "hour"], "categories": [["endorsement", "Knowledge and performance standards of the endorsement"]]}], "WY": [{"id": "teaching-administrative", "name": "Teaching or administrative license (most fields)", "entered": true, "birth": false, "units": ["credit"], "categories": []}]};
export const UNIT_LABELS = { hour: 'clock hours', semester: 'semester hours', quarter: 'quarter hours', ceu: 'CEUs', credit: 'renewal credits', pdp: 'PDPs', pdu: 'PDUs', cpe: 'PDE CPE credits', plu: 'PLUs', micro: 'micro-credentials' };

const EXAMPLE = [
  { date: '2022-10-10', amount: 6, unit: 'hour', title: 'District in-service: reading strategies', provider: 'Northside ISD', evidence: 'cert-0141' },
  { date: '2023-06-12', amount: 3, unit: 'semester', title: 'EDU 5310 Assessment (graduate course)', provider: 'UT San Antonio', evidence: 'transcript' },
  { date: '2024-02-17', amount: 12, unit: 'hour', category: 'disabilities', title: 'Dyslexia: identification and instruction', provider: 'TEA Learn', evidence: 'cert-2231' },
  { date: '2024-07-22', amount: 40, unit: 'hour', category: 'independent-study', title: 'Professional reading log', provider: 'Self', evidence: 'reading log' },
  { date: '2025-09-20', amount: 18, unit: 'hour', category: 'mental-health', title: 'Youth Mental Health First Aid', provider: 'ESC Region 20', evidence: 'cert-3390' },
];
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const val = (id) => $(id).value.trim();
const today = () => new Date().toISOString().slice(0, 10);

// ---------- the log, kept in this browser ----------

const KEY = 'endwise.teacher-renewal.log.v1';
let log = [];
function load() {
  try { const v = JSON.parse(localStorage.getItem(KEY) ?? 'null'); if (Array.isArray(v)) return v.slice(0, 500); } catch { /* private window */ }
  return null;
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(log)); } catch { /* storage blocked: the log lives for this visit */ } }

const lic = () => (LICENSES[val('tr-state')] ?? []).find((l) => l.id === val('tr-license'));
function unitOptions(sel, current) {
  const l = lic();
  const units = l ? l.units : Object.keys(UNIT_LABELS);
  sel.replaceChildren(...units.map((u) => h('option', { value: u }, UNIT_LABELS[u])));
  if (units.includes(current)) sel.value = current;
}
function categoryOptions(sel, current) {
  const l = lic();
  const cats = l ? l.categories : [];
  sel.replaceChildren(h('option', { value: '' }, 'General'), ...cats.map(([c, n]) => h('option', { value: c }, n)));
  if (current && cats.some(([c]) => c === current)) sel.value = current;
}
function drawRows() {
  const box = $('tr-rows');
  box.replaceChildren(...log.map((e, i) => {
    const field = (name, label, el, cls = '') => h('div', { class: `field ${cls}` }, [h('label', { for: `tr-${name}-${i}` }, label), el]);
    const inp = (name, type, extra = {}) => {
      const el = h('input', { type, id: `tr-${name}-${i}`, value: e[name] ?? '', ...extra });
      el.addEventListener('input', () => { e[name] = type === 'number' ? el.value : el.value.trim(); save(); later(); });
      return el;
    };
    const unit = h('select', { id: `tr-unit-${i}` });
    unitOptions(unit, e.unit);
    e.unit = unit.value;
    unit.addEventListener('change', () => { e.unit = unit.value; save(); later(); });
    const cat = h('select', { id: `tr-category-${i}` });
    categoryOptions(cat, e.category);
    cat.addEventListener('change', () => { e.category = cat.value || undefined; save(); later(); });
    const del = h('button', { type: 'button', class: 'btn btn-ghost tr-del', 'aria-label': `Remove activity ${i + 1}` }, 'Remove');
    del.addEventListener('click', () => { log.splice(i, 1); save(); drawRows(); later(); });
    // Each activity folds to one line (what, how much), so the button stays near the top; a new
    // activity opens to be filled in.
    const sum = h('summary', { class: 'tr-sum' });
    const label = () => { sum.textContent = `${e.title || `Activity ${i + 1}`}${Number(e.amount) > 0 ? `: ${e.amount} ${UNIT_LABELS[e.unit] ?? ''}` : ''}`.trim(); };
    label();
    const row = h('details', { class: 'tr-row' }, [sum, h('div', { class: 'tr-row-in' }, [
      field('title', `Activity ${i + 1}`, inp('title', 'text', { maxlength: 120, placeholder: 'Workshop, course, conference' }), 'tr-title'),
      field('date', 'Date', inp('date', 'date')),
      field('amount', 'Amount', inp('amount', 'text', { inputmode: 'decimal' })),
      field('unit', 'Unit', unit),
      field('category', 'Counts as', cat),
      field('provider', 'Provider', inp('provider', 'text', { maxlength: 120 })),
      field('evidence', 'Certificate or transcript', inp('evidence', 'text', { maxlength: 120 })),
      del,
    ])]);
    row.addEventListener('input', label);
    row.addEventListener('change', label);
    if (!(Number(e.amount) > 0) && !e.title) row.open = true;
    return row;
  }));
}

// ---------- inputs ----------

function statusInput(op = 'status') {
  const input = { op, state: val('tr-state'), asOf: today(), entries: [] };
  if (val('tr-license')) input.license = val('tr-license');
  if (val('tr-start')) input.cycleStart = val('tr-start');
  if (val('tr-end')) input.cycleEnd = val('tr-end');
  if (!$('tr-birth-wrap').hidden && val('tr-birth')) input.birthMonth = Number(val('tr-birth'));
  if (!$('tr-carry-wrap').hidden && val('tr-carry')) input.carriedOver = Number(val('tr-carry'));
  if (!$('tr-el-wrap').hidden && $('tr-el').checked) input.options = { elRequired: true };
  for (const e of log) {
    if (!isDate(e.date ?? '') || !(Number(e.amount) > 0)) continue;
    const x = { date: e.date, amount: Number(e.amount), unit: e.unit };
    for (const k of ['category', 'title', 'provider', 'evidence']) if (e[k]) x[k] = e[k];
    input.entries.push(x);
  }
  return input;
}
function staffInput() {
  const rows = val('tr-staff-rows').split(/\n+/).map((l) => l.trim()).filter(Boolean).map((line) => {
    const [name, state, license, expires, logged] = line.split(',').map((s) => s.trim());
    const r = { state: state ?? '', expires: expires ?? '' };
    if (name) r.name = name;
    if (license) r.license = license;
    if (logged) r.logged = Number(logged);
    return r;
  });
  return { op: 'staff', asOf: today(), rows };
}

// ---------- answers ----------

const quotes = (r) => h('ul', { class: 'tr-quotes' }, (r.quotes ?? []).map((q) => {
  const s = (r.sourcePages ?? []).find((p) => p.id === q.source);
  return h('li', {}, [h('q', {}, q.quote), ' ', s ? h('a', { href: s.url, rel: 'noopener' }, s.title) : '', s ? `, read ${s.readOn}` : '']);
}));
const item = (k, label, value, why, cls = null) => h('li', { class: cls }, [
  h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, label), h('b', {}, value), h('em', {}, why),
]);
const fold = (summary, kids) => h('details', { class: 'xpand' }, [h('summary', {}, summary), h('div', { class: 'xp-in' }, kids)]);
const longDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

// The inputs in one line: "Texas Classroom Teacher, cycle began August 15, 2022, 5 activities".
function inputsLine(r, input) {
  const n = input?.entries?.length ?? r.rows?.length ?? 0;
  return [`${r.stateName} ${r.licenseName ?? ''}`.trim(), r.cycle?.start ? `cycle began ${longDate(r.cycle.start)}` : null, `${n} ${n === 1 ? 'activity' : 'activities'}`].filter(Boolean).join(', ');
}

function show(r, { example = false, input = null } = {}) {
  const el = $('tr-out');
  const keep = el.querySelector('.tr-actions');
  el.replaceChildren();
  const head = h('div', { class: 'tf-rh' }, [
    example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
    h('span', { class: 'tf-src' }, r.agency ?? r.stateName ?? ''),
  ]);
  if (!r.covered) {
    el.append(head, h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, 'Not covered')]), h('p', { class: 'tf-sub' }, r.answer));
    if (keep) el.append(keep);
    return;
  }
  const line = inputsLine(r, input);
  const pct = r.required ? Math.min(100, Math.round((r.earned / r.required) * 100)) : 100;
  const src = (r.sourcePages ?? [])[0];
  const items = [
    item('=', 'Required', r.requirement ?? `${r.required} ${r.unit}s`, src ? h('a', { href: src.url, rel: 'noopener' }, `${src.title}, read ${src.readOn}`) : (r.agency ?? '')),
    item('+', 'Logged', `${r.logged}`, `${r.rows?.length ?? 0} activities you entered, in ${r.unit}s`),
    r.carriedOver ? item('+', 'Carried over', `${r.carriedOver}`, 'from your last cycle') : null,
    ...(r.caps ?? []).filter((c) => c.over).map((c) => item('×', `${c.name} over the cap`, `-${c.over}`, `capped at ${c.max}; ${c.counted} of ${c.logged} counted`, 'sk')),
    item('✓', 'Counted', `${r.earned}`, `${pct} percent of the requirement`),
    item('→', r.met ? 'Left' : 'Still needed', r.met ? '0' : `${r.stillNeeded}`, `by ${longDate(r.cycle.end)} (${r.cycle.text ?? 'the cycle end'})${r.perMonth ? `, about ${r.perMonth} a month` : ''}`, 'tot hi'),
  ].filter(Boolean);
  el.append(
    head,
    h('p', { class: 'tf-exin' }, example ? `Example: ${line}` : line),
    h('p', { class: 'tf-big' }, r.met ? [h('b', { class: 'word' }, 'Met'), h('span', {}, `for the cycle ending ${longDate(r.cycle.end)}`)] : [h('b', {}, String(r.stillNeeded)), h('span', {}, `${r.unit}s left by ${longDate(r.cycle.end)}`)]),
    h('div', { class: 'tr-bar', role: 'img', 'aria-label': `${pct} percent done` }, h('span', { style: `width:${pct}%` })),
    h('p', { class: 'tf-sub' }, r.answer),
    h('ul', { class: 'tf-items tr-items' }, items),
  );
  if (r.alternative) el.append(h('p', { class: 'tf-note' }, r.alternative));
  const rows = [...(r.minimums ?? []).filter((m) => m.need !== null).map((m) => [m.name, `${m.have} of ${m.need}`, m.short ? `${m.short} short` : 'met']),
    ...(r.caps ?? []).filter((c) => c.logged).map((c) => [`${c.name} (cap)`, `${c.counted} counted of ${c.logged}`, c.over ? `${c.over} not counted` : 'within the cap'])];
  if (rows.length) el.append(fold(`Required topics and caps (${rows.length})`, h('div', { class: 'tr-scroll' }, h('table', { class: 'tr-table' }, [h('thead', {}, h('tr', {}, ['Category', 'Have', 'Status'].map((t) => h('th', {}, t)))), h('tbody', {}, rows.map((c) => h('tr', {}, c.map((t) => h('td', {}, String(t))))))]))));
  if (r.options) el.append(h('ul', { class: 'tr-list' }, r.options.map((o) => h('li', {}, `${o.unitName}s: ${o.have} of ${o.need}`))));
  const flagged = (r.rows ?? []).filter((x) => x.flags.length);
  if (flagged.length) el.append(fold(`Not counted (${flagged.length})`, h('ul', { class: 'tr-list' }, flagged.map((x) => h('li', {}, `Activity ${x.n} (${x.date}): ${x.flags.join('; ')}`)))));
  if (r.incomplete) el.append(h('p', { class: 'tf-note' }, `${r.incomplete} of your activities miss a title, provider or certificate an audit would ask for.`));
  if (r.conversions?.length) el.append(h('p', { class: 'tf-note' }, `Conversions used: ${r.conversions.join('; ')}.`));
  if (r.derived) el.append(h('p', { class: 'tf-note' }, r.derived));
  el.append(fold('The state\'s words', quotes(r)));
  if (r.notes?.length) el.append(fold('Notes', h('ul', { class: 'tr-list' }, r.notes.map((n) => h('li', {}, n)))));
  if (keep) el.append(keep);
}
function showStaff(r) {
  const el = $('tr-staff-out');
  el.replaceChildren(h('div', { class: 'tf-rh' }, [h('span', { class: 'tf-tag run' }, 'Your result'), h('span', { class: 'tf-src' }, `${r.rows.length} educators`)]), h('p', { class: 'tf-sub' }, r.answer), h('div', { class: 'tr-scroll' }, h('table', { class: 'tr-table' }, [
    h('thead', {}, h('tr', {}, ['Name', 'State', 'Expires', 'Band', 'Required', 'Left'].map((t) => h('th', {}, t)))),
    h('tbody', {}, r.rows.map((x) => h('tr', {}, (x.error ? [x.name, '', '', x.error, '', ''] : [x.name, x.state, x.expires, x.band, x.covered ? `${x.required} ${x.unit}s` : 'not covered', x.remaining ?? '']).map((t) => h('td', {}, String(t)))))),
  ])));
  el.append(download('Download the table (CSV)', 'staff-renewals.csv', r.csv));
}
function download(text, name, body) {
  const a = h('a', { class: 'btn btn-ghost', download: name, href: URL.createObjectURL(new Blob([body], { type: 'text/csv' })) }, text);
  return h('p', {}, a);
}

// ---------- running ----------

let seq = 0;
async function run() {
  const mine = ++seq;
  $('tr-err').textContent = '';
  try {
    const input = statusInput();
    const res = await T.run(SLUG, input);
    if (mine === seq) show(res.result ?? res, { input });
  } catch (e) {
    if (mine === seq) $('tr-err').textContent = e.fields ? Object.values(e.fields).join(' ') : e.message;
  }
}
let timer = null;
const later = () => { clearTimeout(timer); timer = setTimeout(run, 400); };

async function exportCycle() {
  $('tr-export-note').textContent = 'Working...';
  try {
    const res = await T.run(SLUG, statusInput('export'));
    const r = res.result ?? res;
    const note = $('tr-export-note');
    note.replaceChildren('Ready: ', download('the CSV log', 'pd-log.csv', r.csv), download('the printable summary', 'renewal-summary.txt', r.summary));
  } catch (e) {
    $('tr-export-note').textContent = e.status === 401 ? 'Sign in to export (the totals stay free).' : e.message;
  }
}

function syncLicense() {
  const st = val('tr-state');
  const list = LICENSES[st] ?? [];
  const sel = $('tr-license');
  sel.replaceChildren(...(list.length ? list.map((l) => h('option', { value: l.id }, l.name)) : [h('option', { value: '' }, 'Not covered yet')]));
  syncFields();
}
function syncFields() {
  const l = lic();
  $('tr-birth-wrap').hidden = !l?.birth;
  $('tr-carry-wrap').hidden = val('tr-state') !== 'PA';
  $('tr-el-wrap').hidden = val('tr-state') !== 'CO';
  drawRows();
}

function fillStates() {
  const sel = $('tr-state');
  const byName = Object.entries(STATES).sort((a, b) => a[1].localeCompare(b[1]));
  sel.replaceChildren(
    h('optgroup', { label: 'Covered' }, byName.filter(([c]) => LICENSES[c]).map(([c, n]) => h('option', { value: c }, n))),
    h('optgroup', { label: 'Not covered yet' }, byName.filter(([c]) => !LICENSES[c]).map(([c, n]) => h('option', { value: c }, n))),
  );
  sel.value = 'TX';
}

// ?state=TX&license=classroom-teacher&start=2022-08-15&end=2027-08-14&birth=12&logged=40&unit=hour
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const up = q.get('state')?.toUpperCase();
  if (up && Object.hasOwn(STATES, up)) { $('tr-state').value = up; syncLicense(); }
  const l = q.get('license');
  if (l && (LICENSES[val('tr-state')] ?? []).some((x) => x.id === l)) $('tr-license').value = l;
  for (const [id, key] of [['tr-start', 'start'], ['tr-end', 'end']]) { const v = q.get(key); if (v && isDate(v)) $(id).value = v; }
  if (q.has('start') && !q.has('end')) $('tr-end').value = '';
  const b = Number(q.get('birth'));
  if (b >= 1 && b <= 12) $('tr-birth').value = String(b);
  const logged = Number(q.get('logged'));
  if (logged > 0 && logged <= 10000) {
    log = [{ title: 'Logged so far', date: val('tr-start') || today(), amount: String(logged), unit: q.get('unit') && UNIT_LABELS[q.get('unit')] ? q.get('unit') : undefined }];
  }
  syncFields();
  return q.has('state') || q.has('start');
}

function start() {
  fillStates();
  syncLicense();
  $('tr-coverage').textContent = `Covered: ${Object.keys(LICENSES).map((c) => STATES[c]).join(', ')}. Not covered yet: ${Object.keys(STATES).filter((c) => !LICENSES[c]).map((c) => STATES[c]).join(', ')}.`;
  T.mountCodePanel($('tr-code'), SLUG);
  log = load() ?? EXAMPLE.map((e) => ({ ...e }));
  const linked = fromQuery();
  drawRows();
  $('tr-state').addEventListener('change', () => { syncLicense(); later(); });
  $('tr-license').addEventListener('change', () => { syncFields(); later(); });
  for (const id of ['tr-start', 'tr-end', 'tr-birth', 'tr-carry', 'tr-el']) { $(id).addEventListener('change', later); $(id).addEventListener('input', later); }
  $('tr-add').addEventListener('click', () => { log.push({ date: today(), amount: '', unit: lic()?.units[0] }); save(); drawRows(); });
  $('tr-example').addEventListener('click', () => { log = EXAMPLE.map((e) => ({ ...e })); save(); $('tr-state').value = 'TX'; syncLicense(); $('tr-start').value = '2022-08-15'; $('tr-end').value = ''; run(); });
  $('tr-clear').addEventListener('click', () => { log = []; save(); drawRows(); later(); });
  $('tr-form').addEventListener('submit', (e) => {
    e.preventDefault();
    run();
    if (window.matchMedia('(max-width: 1080px)').matches) $('tr-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('tr-export').addEventListener('click', exportCycle);
  $('tr-staff').addEventListener('submit', async (e) => {
    e.preventDefault();
    $('tr-staff-err').textContent = '';
    try { const res = await T.run(SLUG, staffInput()); showStaff(res.result ?? res); } catch (err) { $('tr-staff-err').textContent = err.status === 401 ? 'Sign in to run the staff table.' : (err.fields ? Object.values(err.fields).join(' ') : err.message); }
  });
  // At rest the worked example is the tool's own first example, drawn from the tool's record (no run
  // used), unless the address carried their own case or the browser holds their own log.
  if (linked || load()) run();
  else T.api(`/api/v1/tools/${SLUG}`).then(({ tool }) => { const ex = tool.examples[0]; if (seq === 0) show(ex.output, { example: true, input: ex.input }); }).catch(() => { /* the static example stays */ });
}

start();
