// The trucker per diem page. core.js (the same file the server runs) prices the log here, free,
// as it is typed: the rate table comes from the tool's published rates example, so the page and the
// server read the same dated notices. Only the worksheet (PDF and CSV) is a paid run, through
// Toll.run. The log is kept in this browser (localStorage) and sent only for the worksheet.
import {
  makeEngine, PerDiemError, COUNT_KEYS, STATUS_WORDS, money, longDate, shortDate, isRealDate,
  dayNumber, fromDayNumber, monthName, MIN_YEAR,
} from './core.js';

const T = window.Toll;
const h = T.h;
const SLUG = 'trucker-per-diem';
const STORE_KEY = 'trucker-per-diem.v1';
const $ = (id) => document.getElementById(id);

let engine = null;
let marks = {}; // date -> { status, locality }, set by tapping the calendar
let brush = 'full';
let lastResult = null;
let lastInput = null;
let pendingQuote = null;
let kind = 'example';

const BRUSHES = [
  { key: 'full', label: 'Full day' },
  { key: 'partial', label: 'Departure or return' },
  { key: 'incidental', label: 'Incidental only' },
  { key: 'reimbursed', label: 'Reimbursed' },
  { key: 'home', label: 'Home' },
  { key: 'clear', label: 'Unmark' },
];
const COUNT_LABELS = {
  fullDays: 'Full days',
  partialDays: 'Departure or return days',
  oconusFullDays: 'Full days outside the lower 48',
  oconusPartialDays: 'Departure or return days outside',
  incidentalOnlyDays: 'Incidental-only days',
  incidentalOnlyPartialDays: 'Incidental-only partial days',
};
const SHORT = { fullDays: 'full', partialDays: 'partial', oconusFullDays: 'ofull', oconusPartialDays: 'opartial', incidentalOnlyDays: 'inc', incidentalOnlyPartialDays: 'incp' };

// The worked example at rest: three trips across the October 1, 2024 rate change, one to Canada,
// and a day the carrier paid. The same log as the tool's preview example.
const EXAMPLE = {
  year: 2024,
  mode: 'log',
  trips: '2024-09-16 to 2024-09-27 Load 1180\n2024-09-29 to 2024-10-11 Load 1187\n2024-10-14 to 2024-10-19 Canada Toronto run',
  marks: { '2024-10-05': { status: 'reimbursed', locality: 'CONUS' } },
  counts: { fullDays: 240, partialDays: 40 },
  oct: { fullDays: 60, partialDays: 10 },
};

// ---------- the form ----------

function countInputs(el, prefix, values) {
  el.textContent = '';
  for (const k of COUNT_KEYS) {
    const id = `${prefix}-${k}`;
    el.appendChild(h('div', { class: 'pd-count' }, [
      h('label', { for: id }, COUNT_LABELS[k]),
      h('input', { type: 'number', id, min: '0', max: '366', step: '1', inputmode: 'numeric', value: values[k] ? String(values[k]) : '' }),
    ]));
  }
}
const readCounts = (prefix) => {
  const out = {};
  for (const k of COUNT_KEYS) {
    const raw = $(`${prefix}-${k}`).value.trim();
    if (raw === '') continue;
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > 366) return { error: `${COUNT_LABELS[k]} must be a whole number from 0 to 366.` };
    if (n) out[k] = n;
  }
  return { counts: out };
};

function brushes() {
  const el = $('pd-brushes');
  el.textContent = '';
  for (const b of BRUSHES) {
    const btn = h('button', { type: 'button', class: `pd-brush s-${b.key}`, role: 'radio', 'aria-checked': b.key === brush ? 'true' : 'false' }, b.label);
    btn.addEventListener('click', () => { brush = b.key; brushes(); });
    el.appendChild(btn);
  }
}

const mode = () => document.querySelector('input[name="mode"]:checked').value;
const year = () => Number($('pd-year').value);
const splitYear = (y) => {
  const ps = engine.yearPeriods(y);
  return ps.length > 1 && ps[0].conus !== ps[1].conus;
};

function syncMode() {
  const m = mode();
  for (const el of document.querySelectorAll('[data-mode]')) el.hidden = el.dataset.mode !== m;
  const y = year();
  const ps = engine.yearPeriods(y);
  const words = ps.map((p) => `$${p.conus} from ${longDate(p.clipFrom)} (${p.notice})`).join(', then ');
  $('pd-year-hint').textContent = `${words}.${ps.length === 1 ? ` The rate for travel from ${longDate(fromDayNumber(dayNumber(engine.last) + 1))} is not published yet.` : ''}`;
  $('pd-octdec').hidden = ps.length === 1;
  $('pd-octdec-hint').textContent = splitYear(y)
    ? `Needed for ${y}: the rate changed on October 1 from $${ps[0].conus} to $${ps[1].conus}.`
    : `Optional for ${y}: the rate was $${ps[0].conus} all year, so the split does not change the total.`;
  $('pd-get').disabled = m !== 'log';
  $('pd-get-note').textContent = m === 'log'
    ? 'Your log stays in this browser. It is sent only when you get the worksheet.'
    : 'The worksheet is built from a day-by-day log: switch to "Trips and a calendar" to make one.';
}

const TRIP_RE = /^(\d{4}-\d{2}-\d{2})(?:\s*(?:to|-|–)\s*(\d{4}-\d{2}-\d{2}))?\s*(.*)$/i;
const ABROAD = /^(canada|oconus|alaska|hawaii|mexico|outside)\b[\s,:;-]*/i;

function readTrips() {
  const trips = [];
  for (const line of $('pd-trips').value.split('\n').map((x) => x.trim()).filter(Boolean)) {
    const m = TRIP_RE.exec(line);
    if (!m || !isRealDate(m[1]) || (m[2] && !isRealDate(m[2]))) return { error: `Could not read "${line}". Write 2026-03-02 to 2026-03-13, then "Canada" if it was outside the lower 48, then a load number.` };
    let rest = m[3].trim();
    let locality = 'CONUS';
    const abroad = ABROAD.exec(rest);
    if (abroad) { locality = 'OCONUS'; rest = rest.slice(abroad[0].length).trim(); }
    trips.push({ depart: m[1], return: m[2] || m[1], ...(locality === 'OCONUS' ? { locality } : {}), ...(rest ? { ref: rest.slice(0, 40) } : {}) });
  }
  return { trips };
}

const eligibility = () => ({
  hosSubject: $('pd-hos').checked,
  interstate: $('pd-interstate').checked,
  transportationIndustry: $('pd-transport').checked,
});

// { input } for the form, or { error, field } for a typo, so nothing is sent until it reads.
function readForm() {
  const y = year();
  if (mode() === 'counts') {
    const all = readCounts('pd-y');
    if (all.error) return { error: all.error, field: 'pd-counts-err' };
    const input = { op: 'quick', taxYear: y, ...all.counts, ...eligibility() };
    if (engine.yearPeriods(y).length > 1) {
      const oct = readCounts('pd-o');
      if (oct.error) return { error: oct.error, field: 'pd-counts-err' };
      if (splitYear(y) || Object.keys(oct.counts).length) input.octDec = oct.counts;
    }
    return { input };
  }
  const t = readTrips();
  if (t.error) return { error: t.error, field: 'pd-trips-err' };
  const days = Object.entries(marks).filter(([d]) => d.startsWith(`${y}-`)).sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([date, m]) => ({ date, status: m.status, ...(m.locality === 'OCONUS' ? { locality: 'OCONUS' } : {}) }));
  return { input: { op: 'preview', taxYear: y, ...(t.trips.length ? { trips: t.trips } : {}), ...(days.length ? { days } : {}), ...eligibility() } };
}

function clearErrors() {
  for (const id of ['pd-error', 'pd-trips-err', 'pd-counts-err', 'pd-driver-err', 'pd-transport-err']) $(id).textContent = '';
}

// ---------- drawing ----------

const cell = (v) => (typeof v === 'number' ? money(Math.round(v * 100)) : v);

function table(columns, rows, foot) {
  return h('div', { class: 'table-scroll' }, h('table', { class: 'rules pd-table' }, [
    h('thead', {}, h('tr', {}, columns.map((c) => h('th', { scope: 'col', class: c.num ? 'r num' : null }, c.label)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, r.map((v, i) => (i === 0 ? h('th', { scope: 'row' }, v) : h('td', { class: columns[i].num ? 'r num' : null }, cell(v))))))),
    foot ? h('tfoot', {}, h('tr', {}, foot.map((v, i) => (i === 0 ? h('th', { scope: 'row' }, v) : h('td', { class: columns[i].num ? 'r num' : null }, cell(v)))))) : null,
  ]));
}

function render(r) {
  const out = $('pd-out');
  out.textContent = '';
  const t = r.totals;
  const label = kind === 'example' ? 'Worked example' : kind === 'saved' ? 'Your saved log' : 'Worked out on this page, free';
  const sheet = h('div', {}, [
    h('p', { class: 'pd-sheet-label' }, label),
    h('p', { class: 'pd-answer' }, [h('small', {}, `Schedule C line 24b, ${r.taxYear}`), t.display.deductible]),
    h('dl', { class: 'pd-facts' }, [
      h('div', {}, [h('dt', {}, 'Full per diem, for tax software'), h('dd', {}, t.display.perDiem)]),
      h('div', {}, [h('dt', {}, 'Limit'), h('dd', {}, `${t.deductiblePct}%`)]),
      t.scheduleCLine24a ? h('div', {}, [h('dt', {}, 'Line 24a, incidental only'), h('dd', {}, t.display.incidentalOnly)]) : null,
    ]),
    h('p', { class: 'pd-sub' }, r.answer),
    h('p', { class: 'pd-heading' }, 'By rate period'),
    table(
      [{ label: 'Dates' }, { label: 'Notice' }, { label: 'Rate', num: true }, { label: 'Full', num: true }, { label: 'Partial', num: true }, { label: 'Per diem', num: true }, { label: 'Deductible', num: true }],
      r.segments.map((s) => [`${shortDate(s.from).slice(5)} to ${shortDate(s.to).slice(5)}`, s.notices.map((n) => n.notice).join(', '), `$${s.rateConus}${s.oconusFullDays + s.oconusPartialDays ? ` / $${s.rateOconus}` : ''}`,
        String(s.fullDays + s.oconusFullDays), String(s.partialDays + s.oconusPartialDays), s.perDiem, s.deductible]),
    ),
  ]);
  if (r.months) {
    const active = r.months.filter((m) => m.perDiem || m.incidentalOnly || m.reimbursedDays);
    if (active.length) {
      sheet.append(h('p', { class: 'pd-heading' }, 'By month'), table(
        [{ label: 'Month' }, { label: 'Full', num: true }, { label: 'Partial', num: true }, { label: 'Outside', num: true }, { label: 'Per diem', num: true }, { label: 'Deductible', num: true }],
        active.map((m) => [m.name, String(m.fullDays), String(m.partialDays), String(m.oconusDays), m.perDiem, m.deductible]),
      ));
    }
    sheet.append(h('p', { class: 'pd-heading' }, `Log checks (${r.warnings.length})`));
    sheet.append(r.warnings.length
      ? h('ul', { class: 'pd-warn' }, r.warnings.map((w) => h('li', {}, w.message)))
      : h('p', { class: 'pd-aside' }, 'No problems found in the log.'));
  }
  sheet.append(
    h('p', { class: 'pd-heading' }, 'Where the numbers go'),
    h('ul', { class: 'pd-enter' }, r.howToEnter.map((x) => h('li', {}, x))),
    h('details', { class: 'pd-why' }, [h('summary', {}, 'Rules applied'), h('ul', {}, [r.methodLock, r.limit.basis[0].toUpperCase() + r.limit.basis.slice(1) + '.', ...r.notes].map((x) => h('li', {}, x)))]),
    h('div', { id: 'pd-files' }),
  );
  out.appendChild(sheet);
}

function renderCalendar(r) {
  const y = year();
  const rows = new Map((r?.rows ?? []).map((x) => [x.date, x]));
  const cal = $('pd-cal');
  cal.textContent = '';
  for (let m = 1; m <= 12; m++) {
    const first = `${y}-${String(m).padStart(2, '0')}-01`;
    const startDow = new Date(dayNumber(first) * 86400000).getUTCDay();
    const n = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < startDow; i++) cells.push(h('span', { class: 'pd-day pad', 'aria-hidden': 'true' }));
    for (let d = 1; d <= n; d++) {
      const date = `${first.slice(0, 8)}${String(d).padStart(2, '0')}`;
      const row = rows.get(date);
      const mark = marks[date];
      const status = row?.status ?? null;
      const off = date > engine.last;
      const said = `${shortDate(date)}: ${status ? STATUS_WORDS[status] : 'not logged'}${row?.locality === 'OCONUS' && status !== 'home' ? ', outside the continental US' : ''}${row?.amount ? `, ${money(Math.round(row.amount * 100))}` : ''}${mark ? ' (marked)' : ''}`;
      const btn = h('button', {
        type: 'button',
        class: `pd-day${status ? ` s-${status}` : ''}${mark ? ' marked' : ''}${row?.locality === 'OCONUS' && status !== 'home' ? ' abroad' : ''}`,
        title: said,
        'aria-label': said,
        disabled: off ? '' : null,
      }, String(d));
      btn.addEventListener('click', () => {
        if (brush === 'clear') delete marks[date];
        else marks[date] = { status: brush, locality: $('pd-oconus').checked ? 'OCONUS' : 'CONUS' };
        kind = 'edit';
        update();
      });
      cells.push(btn);
    }
    cal.appendChild(h('div', { class: 'pd-month' }, [
      h('p', { class: 'pd-month-name' }, monthName(m)),
      h('div', { class: 'pd-dow', 'aria-hidden': 'true' }, ['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((x) => h('span', {}, x))),
      h('div', { class: 'pd-days' }, cells),
    ]));
  }
  // As a sideways strip, open on the latest month with a logged day (else this month), once per year shown.
  if (cal.scrollWidth > cal.clientWidth && cal.dataset.openedYear !== String(y)) {
    cal.dataset.openedYear = String(y);
    const logged = [...rows.keys(), ...Object.keys(marks)].filter((d) => d.startsWith(`${y}-`)).sort().pop();
    const today = new Date().toISOString().slice(0, 10);
    const m = Number((logged ?? (today.startsWith(`${y}-`) ? today : `${y}-01`)).slice(5, 7));
    cal.scrollLeft = cal.children[m - 1].offsetLeft - cal.offsetLeft;
  }
}

function legend() {
  $('pd-legend').textContent = '';
  for (const s of ['full', 'partial', 'incidental', 'reimbursed', 'home']) $('pd-legend').appendChild(h('li', {}, [h('span', { class: `pd-key s-${s}` }), STATUS_WORDS[s]]));
  $('pd-legend').appendChild(h('li', {}, [h('span', { class: 'pd-key s-full abroad' }), 'Outside the lower 48']));
}

function rateTable(periods) {
  const el = $('pd-rate-table');
  el.textContent = '';
  el.appendChild(h('table', { class: 'rules pd-table' }, [
    h('thead', {}, h('tr', {}, ['Travel on or after', 'Notice', 'Full day', 'Partial day', 'Outside the lower 48', 'Incidental only'].map((x, i) => h('th', { scope: 'col', class: i > 1 ? 'r num' : null }, x)))),
    h('tbody', {}, periods.map((p) => h('tr', {}, [
      h('th', { scope: 'row' }, longDate(p.from)),
      h('td', {}, h('a', { href: p.url }, p.notice)),
      h('td', { class: 'r num' }, `$${p.conus}`),
      h('td', { class: 'r num' }, money(p.conus * 75)),
      h('td', { class: 'r num' }, `$${p.oconus} / ${money(p.oconus * 75)}`),
      h('td', { class: 'r num' }, `$${p.incidentalOnly}`),
    ]))),
  ]));
}

// ---------- working it out ----------

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      year: year(), mode: mode(), trips: $('pd-trips').value, marks,
      counts: readCounts('pd-y').counts ?? {}, oct: readCounts('pd-o').counts ?? {},
      driver: $('pd-driver').value, home: $('pd-home').value,
      hos: $('pd-hos').checked, interstate: $('pd-interstate').checked, transport: $('pd-transport').checked,
    }));
  } catch { /* storage may be off; the page still works */ }
}

function update() {
  clearErrors();
  syncMode();
  pendingQuote = null;
  $('pd-get').textContent = 'Get the worksheet (PDF and CSV)';
  const read = readForm();
  if (read.error) { $(read.field).textContent = read.error; return; }
  try {
    const r = read.input.op === 'quick' ? engine.quick(read.input) : engine.log(read.input);
    lastResult = r;
    lastInput = read.input;
    render(r);
    renderCalendar(r);
    $('pd-status').textContent = kind === 'edit' ? r.answer : '';
  } catch (e) {
    if (!(e instanceof PerDiemError)) throw e;
    lastResult = null;
    const target = e.field === 'transportationIndustry' ? 'pd-transport-err' : e.field === 'trips' || e.field === 'days' ? 'pd-trips-err' : mode() === 'counts' ? 'pd-counts-err' : 'pd-error';
    $(target).textContent = e.message;
    renderCalendar(null);
  }
  if (kind !== 'example') save();
}

let timer = null;
const soon = () => { kind = 'edit'; clearTimeout(timer); timer = setTimeout(() => { timer = null; update(); }, 150); };

// ---------- the paid worksheet ----------

function download(name, type, data) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: name, class: 'btn btn-small' }, `Download ${name.endsWith('.pdf') ? 'the PDF' : 'the CSV'}`);
  return a;
}
const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

function showError(e) {
  const box = $('pd-error');
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in or create an account'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

async function getWorksheet() {
  // A change typed just before the click is worked out first, so the quote is for what is shown.
  if (timer) { clearTimeout(timer); timer = null; update(); }
  clearErrors();
  const read = readForm();
  if (read.error || !lastResult || read.input.op !== 'preview') { $('pd-error').textContent = read.error ?? 'Fix the log first: the worksheet is built from the days shown.'; $('pd-error').scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
  const driverLabel = $('pd-driver').value.trim();
  if (!driverLabel) {
    $('pd-driver-err').textContent = 'Put the driver\'s name on the worksheet.';
    $('pd-driver').scrollIntoView({ block: 'center', behavior: 'smooth' });
    $('pd-driver').focus({ preventScroll: true });
    return;
  }
  const input = { ...read.input, op: 'worksheet', driverLabel, ...($('pd-home').value.trim() ? { taxHome: $('pd-home').value.trim() } : {}) };
  const key = JSON.stringify(input);
  const button = $('pd-get');
  button.disabled = true;
  try {
    const account = await T.me().catch(() => null);
    if (!account) {
      showError({ message: 'The worksheet is $3.00 per driver and tax year, taken from a prepaid balance.', code: 'unauthorized' });
      return;
    }
    if (!pendingQuote || pendingQuote.key !== key) {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
      pendingQuote = { key, q };
      button.textContent = q.amount ? `Pay ${q.display} and download` : 'Download (no charge)';
      $('pd-get-note').textContent = q.detail ?? '';
      return;
    }
    const json = await T.run(SLUG, input);
    const f = json.result.files;
    const box = $('pd-files');
    box.textContent = '';
    box.append(
      h('p', { class: 'pd-heading' }, 'Your worksheet'),
      h('p', { class: 'pd-downloads' }, [
        f.pdf ? download(f.pdf.name, 'application/pdf', fromBase64(f.pdf.base64)) : null, ' ',
        download(f.csv.name, 'text/csv', f.csv.text),
      ]),
      h('p', { class: 'pd-aside' }, `Input hash ${json.result.inputHash.slice(0, 16)}. ${json.charged ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : ''}`),
    );
    pendingQuote = null;
    button.textContent = 'Get the worksheet (PDF and CSV)';
    $('pd-get-note').textContent = 'A later run for the same driver and year is $0.10 for 15 months.';
  } catch (e) {
    showError(e);
  } finally {
    button.disabled = false;
  }
}

// ---------- inputs from the address and the saved log ----------

// Links from the year and guide pages carry day counts (?year=2026&mode=counts&full=240&partial=40
// &oct_full=60&oct_partial=10&hos=1): the page opens with them filled in and worked out here, free.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (![...q.keys()].length) return null;
  const n = (k) => { const v = Number(q.get(k)); return q.get(k) !== null && Number.isInteger(v) && v >= 0 && v <= 366 ? v : 0; };
  const state = { ...EXAMPLE, trips: '', marks: {}, counts: {}, oct: {} };
  const y = Number(q.get('year'));
  if (Number.isInteger(y) && y >= MIN_YEAR && y <= engine.maxYear) state.year = y;
  state.mode = q.get('mode') === 'log' ? 'log' : 'counts';
  for (const k of COUNT_KEYS) {
    if (n(SHORT[k])) state.counts[k] = n(SHORT[k]);
    if (n(`oct_${SHORT[k]}`)) state.oct[k] = n(`oct_${SHORT[k]}`);
  }
  if (q.get('trips')) {
    state.trips = q.get('trips').split(',').map((x) => x.split('_')).filter((p) => p.length >= 2 && isRealDate(p[0]) && isRealDate(p[1]))
      .map((p) => `${p[0]} to ${p[1]}${p[2] === 'c' ? ' Canada' : ''}`).join('\n');
    state.mode = 'log';
  }
  if (q.get('hos') === '0') state.hos = false;
  return state;
}

function loadSaved() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null');
    return s && typeof s === 'object' ? s : null;
  } catch {
    return null;
  }
}

function apply(state) {
  $('pd-year').value = String(state.year);
  document.querySelector(`input[name="mode"][value="${state.mode === 'counts' ? 'counts' : 'log'}"]`).checked = true;
  $('pd-trips').value = state.trips ?? '';
  marks = state.marks && typeof state.marks === 'object' ? state.marks : {};
  countInputs($('pd-counts-year'), 'pd-y', state.counts ?? {});
  countInputs($('pd-counts-oct'), 'pd-o', state.oct ?? {});
  $('pd-driver').value = state.driver ?? '';
  $('pd-home').value = state.home ?? '';
  $('pd-hos').checked = state.hos !== false;
  $('pd-interstate').checked = state.interstate !== false;
  $('pd-transport').checked = state.transport !== false;
}

// ---------- start ----------

async function start() {
  const chip = document.querySelector('[data-toll-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('pd-code'), SLUG);
  let tool;
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('pd-out').textContent = 'The rates could not load. Reload the page to try again.';
    return;
  }
  const rates = tool.examples.find((x) => x.input.op === 'rates').output;
  engine = makeEngine(rates);
  rateTable(rates.periods);
  for (let y = engine.maxYear; y >= MIN_YEAR; y--) $('pd-year').appendChild(h('option', { value: String(y) }, y === engine.maxYear ? `${y} (January to September)` : String(y)));
  brushes();
  legend();

  const linked = fromQuery();
  const saved = linked ? null : loadSaved();
  kind = linked ? 'edit' : saved ? 'saved' : 'example';
  apply(linked ?? saved ?? EXAMPLE);

  $('pd-form').addEventListener('input', soon);
  $('pd-form').addEventListener('change', soon);
  $('pd-form').addEventListener('submit', (ev) => ev.preventDefault());
  $('pd-get').addEventListener('click', getWorksheet);
  $('pd-clear-marks').addEventListener('click', () => { marks = {}; kind = 'edit'; update(); });
  $('pd-year').addEventListener('change', () => {
    // The example's trips are for 2024; another year starts from an empty log.
    if ($('pd-trips').value === EXAMPLE.trips && year() !== EXAMPLE.year) { $('pd-trips').value = ''; marks = {}; }
  });
  update();
}

start();
