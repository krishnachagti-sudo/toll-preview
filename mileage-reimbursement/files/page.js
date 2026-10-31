// The mileage reimbursement page. core.js (the same file the server runs) prices the worked example
// and previews a trip file in the browser, from the rate tables in this tool's published example,
// so the page and the server read the same dated data. A calculation run here goes through
// Toll.run (free on this page); the paid downloads (the results CSV and the log PDF) are the
// server's answer to the same file.
import {
  makeEngine, readTrips, parseCsv, mapColumns, dateOf, scaled, usd, milesText, centsText, longDate, rangeText,
  MileageError, PURPOSES, TEMPLATE_COLUMNS,
} from './core.js';

const T = window.Toll;
const h = T.h;
const SLUG = 'mileage-reimbursement';
const MAX_TRIPS = 25;
const SHOWN_FLAGS = 15;
const SHOWN_LOG_LINES = 10;

const $ = (id) => document.getElementById(id);
const mode = () => document.querySelector('input[name="mode"]:checked').value;

let engine = null;
let tool = null;
let signedIn = false;

// ---------- the calculator form ----------

const tableOf = (purpose) => (PURPOSES[purpose].table === 'gsa' ? engine.gsa : engine.irs);

function yearsFor(purpose) {
  const t = tableOf(purpose);
  const first = Number(t.periods[0].from.slice(0, 4));
  const last = Number(t.knownThrough.slice(0, 4));
  return Array.from({ length: last - first + 1 }, (_, i) => last - i);
}

// The rate periods of a year, clipped to the year: 2026 has two, most years one.
function periodsIn(purpose, year) {
  const field = PURPOSES[purpose].field;
  const a = `${year}-01-01`;
  const b = `${year}-12-31`;
  return tableOf(purpose).periods
    .filter((p) => p.from <= b && p.to >= a && p[field] !== null && p[field] !== undefined)
    .map((p) => ({ from: p.from > a ? p.from : a, to: p.to < b ? p.to : b, rate: engine.rate({ date: p.from > a ? p.from : a, purpose }) }));
}

function fillYears(keep) {
  const sel = $('mr-year');
  const purpose = $('mr-purpose').value;
  const want = keep ?? sel.value;
  sel.textContent = '';
  for (const y of yearsFor(purpose)) sel.appendChild(h('option', { value: String(y) }, String(y)));
  sel.value = [...sel.options].some((o) => o.value === String(want)) ? String(want) : sel.options[0].value;
}

function fillPeriods(values = []) {
  const box = $('mr-periods');
  const old = [...box.querySelectorAll('input')].map((x) => x.value);
  box.textContent = '';
  periodsIn($('mr-purpose').value, $('mr-year').value).forEach((p, i) => {
    const id = `mr-m${i + 1}`;
    box.appendChild(h('div', { class: 'field' }, [
      h('label', { for: id }, `Miles, ${rangeText(p.from, p.to)}`),
      h('input', { type: 'text', id, inputmode: 'decimal', value: values[i] ?? old[i] ?? '', placeholder: '0' }),
      h('p', { class: 'hint' }, `${p.rate.words}, ${p.rate.source.label}`),
    ]));
  });
}

function syncMode() {
  for (const el of document.querySelectorAll('[data-mode]')) el.hidden = el.dataset.mode !== mode();
}

// "2026-06-28, 120, paid 2026-07-05" -> { date, miles, paidDate? }
function tripLine(line) {
  const parts = line.split(/[,;\t]+|\s+/).map((x) => x.trim()).filter((x) => x && !/^paid$/i.test(x));
  const dates = parts.map(dateOf);
  const date = dates.find(Boolean);
  const paid = dates.filter(Boolean)[1];
  const miles = parts.find((x, i) => !dates[i] && scaled(x, 2) !== null);
  if (!date || miles === undefined) return null;
  return { date, miles, ...(paid ? { paidDate: paid } : {}) };
}

// { input } for a good form, or { errors } for a bad one, so a typo never spends a run.
function readForm() {
  const errors = {};
  const purpose = $('mr-purpose').value;
  const trips = [];
  if (mode() === 'split') {
    periodsIn(purpose, $('mr-year').value).forEach((p, i) => {
      const raw = $(`mr-m${i + 1}`).value.trim();
      if (raw === '' || raw === '0') return;
      if (scaled(raw, 2) === null) { errors.periods = `"${raw}" is not a number of miles.`; return; }
      trips.push({ date: p.from, ...(p.to !== p.from ? { endDate: p.to } : {}), miles: raw, purpose });
    });
    if (!trips.length && !errors.periods) errors.periods = 'Enter the miles for at least one period.';
  } else {
    const lines = $('mr-trips').value.split('\n').map((x) => x.trim()).filter(Boolean);
    for (const line of lines) {
      const t = tripLine(line);
      if (!t) { errors.trips = `Could not read "${line}". Write a date, then the miles, for example 2026-07-14, 340.`; break; }
      trips.push({ ...t, purpose, ...(purpose === 'business' ? {} : { paidDate: undefined }) });
    }
    if (!trips.length && !errors.trips) errors.trips = 'Enter at least one trip.';
    if (trips.length > MAX_TRIPS) errors.trips = `Up to ${MAX_TRIPS} trips here; put a longer list in the trip file below.`;
  }
  const extra = $('mr-extra').value.trim();
  if (extra) {
    if (scaled(extra, 2) === null) errors.extra = 'Parking and tolls must be an amount such as 12.50.';
    else if (trips.length) trips[0].parking = extra;
  }
  for (const t of trips) if (t.paidDate === undefined) delete t.paidDate;
  return Object.keys(errors).length ? { errors } : { input: { op: 'calculate', trips } };
}

const ERROR_BOX = { periods: 'mr-periods-err', trips: 'mr-trips-err', extra: 'mr-extra-err' };
function clearErrors() {
  $('mr-error').textContent = '';
  for (const id of Object.values(ERROR_BOX)) $(id).textContent = '';
}
function showFieldErrors(fields) {
  let shown = 0;
  for (const [k, msg] of Object.entries(fields ?? {})) {
    const box = $(ERROR_BOX[k === 'date' || k === 'purpose' ? (mode() === 'split' ? 'periods' : 'trips') : k] ?? '');
    if (box) { box.textContent = msg; shown += 1; }
  }
  return shown > 0;
}

// ---------- drawing ----------

const link = (text, href) => h('a', { href }, text);
// Element.append writes null as the text "null", so leave the empty ones out.
const put = (el, ...nodes) => el.append(...nodes.filter((x) => x !== null && x !== undefined));

function renderCalc(r, { kind, note }) {
  const out = $('mr-out');
  out.textContent = '';
  const periods = h('div', { class: 'table-scroll' }, h('table', { class: 'rules mr-table' }, [
    h('thead', {}, h('tr', {}, ['Period', 'Rate', 'Miles', 'Amount', 'Source'].map((x, i) => h('th', { scope: 'col', class: i && i < 4 ? 'num' : null }, x)))),
    h('tbody', {}, r.periods.map((p) => h('tr', {}, [
      h('th', { scope: 'row' }, `${PURPOSES[p.purpose].short === 'business' ? '' : `${PURPOSES[p.purpose].short}, `}${rangeText(p.from, p.to)}`),
      h('td', { class: 'num' }, `${p.rateCents}¢`),
      h('td', { class: 'num' }, milesText(Math.round(p.miles * 100))),
      h('td', { class: 'num' }, p.amount),
      h('td', { class: 'mr-src' }, p.source),
    ]))),
  ]));
  const notes = r.lines.filter((l) => l.note || l.basis === 'paid-date');
  out.appendChild(h('div', {}, [
    kind === 'example' ? h('p', { class: 'mr-sheet-label' }, 'Worked example') : null,
    h('p', { class: 'mr-answer' }, [h('small', {}, r.parkingAndTolls !== '$0.00' ? 'Mileage, parking and tolls' : 'Mileage amount'), r.total]),
    h('p', { class: 'mr-sub' }, r.answer),
    periods,
    r.lines.length > 2 || mode() === 'trips' ? h('details', { class: 'mr-why', open: r.lines.length <= 8 ? true : null }, [
      h('summary', {}, `Each trip (${r.lines.length})`),
      h('ul', { class: 'mr-lines' }, r.lines.map((l) => h('li', {}, [
        h('span', { class: 'when' }, l.endDate ? `${l.date} to ${l.endDate}` : l.date),
        h('span', {}, `${milesText(Math.round(l.miles * 100))} mi x ${l.rateCents}¢ = ${l.amount}`),
        l.basis === 'paid-date' ? h('span', { class: 'mr-tag' }, 'rate set by the paid date') : null,
      ]))),
    ]) : null,
    ...notes.map((l) => h('p', { class: 'mr-aside' }, l.note)),
    h('p', { class: 'mr-aside' }, ['Sources: ', ...r.sources.flatMap((s, i) => [i ? '; ' : '', link(s.label, s.url)]), `. Rates read ${longDate(engine.irs.source.readOn)}.`]),
    note ? h('p', { class: 'mr-cost' }, note) : null,
  ]));
  $('mr-status').textContent = kind === 'run' ? r.answer : '';
}

function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'Free on this page.';
  if (typeof json.freeRunsLeft === 'number') return `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  return null;
}

function errorInto(box, e) {
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

async function onSubmit(ev) {
  ev.preventDefault();
  clearErrors();
  const read = readForm();
  if (read.errors) { showFieldErrors(read.errors); return; }
  const button = $('mr-run');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, read.input);
    renderCalc(json.result, { kind: 'run', note: costNote(json) });
  } catch (e) {
    if (!showFieldErrors(e.fields)) errorInto($('mr-error'), e);
  } finally {
    button.disabled = false;
  }
}

// ---------- the trip file ----------

const FIELD_WORDS = {
  date: 'the date', endDate: 'the end date', miles: 'miles', purpose: 'the purpose', employee: 'the employee', vehicle: 'the vehicle',
  start: 'the start', destination: 'the destination', businessPurpose: 'the business purpose', parking: 'parking', tolls: 'tolls',
  paidAmount: 'the amount paid', paidRate: 'the rate paid', paidDate: 'the date paid', recordedOn: 'the date recorded',
  odometerStart: 'the odometer start', odometerEnd: 'the odometer end',
};

let fileText = '';

function download(name, body, type) {
  const blob = body instanceof Blob ? body : new Blob([body], { type });
  const a = h('a', { href: URL.createObjectURL(blob), download: name }, name);
  return a;
}
function base64Bytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const options = () => {
  const o = {};
  const rate = $('mr-employer').value.trim().replace(/¢|cents?/i, '').trim();
  if (rate) {
    const tenths = scaled(rate, 1);
    if (tenths === null || tenths === 0) throw new MileageError('Your rate must be cents per mile with at most one decimal, such as 65.5.', 'employerRate');
    o.employerRate = { cents: tenths / 10 };
  }
  const home = $('mr-home').value.trim();
  const work = $('mr-work').value.trim();
  if (home && work) o.commute = { home, workplace: work };
  return o;
};
const engineOptions = (o) => ({ ...(o.employerRate ? { employerRate: { mills: Math.round(o.employerRate.cents * 10) } } : {}), commute: o.commute ?? null });

// What a paid action costs: the signed-in account's own quote, or the price in words.
async function priceLine(input, action, el) {
  const words = tool?.pricing?.actions.find((a) => a.name === action)?.text.USD ?? '';
  if (!signedIn) { el.textContent = `${words}. Sign in to download.`; return; }
  try {
    const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
    el.textContent = q.amount ? `This download costs ${q.display} from your balance (${words}).` : `This download is free for you now (${words}).`;
  } catch (e) {
    el.textContent = words;
  }
}

function factsList(pairs) {
  return h('dl', { class: 'mr-facts' }, pairs.map(([k, v]) => h('div', {}, [h('dt', {}, k), h('dd', {}, v)])));
}

function flagsList(flags) {
  if (!flags.length) return h('p', { class: 'mr-aside' }, 'Nothing flagged: every business trip has a destination and a purpose, and nothing repeats.');
  const shown = flags.slice(0, SHOWN_FLAGS);
  return h('div', {}, [
    h('ul', { class: 'mr-flags' }, shown.map((f) => h('li', {}, [h('span', { class: 'when' }, f.row ? `Row ${f.row}` : 'Year'), h('span', {}, f.message)]))),
    flags.length > shown.length ? h('p', { class: 'mr-aside' }, `And ${flags.length - shown.length} more in the results file.`) : null,
  ]);
}

function renderFile(r, { example = false } = {}) {
  const out = $('mr-file-out');
  out.textContent = '';
  const t = r.totals;
  const custom = r.lines.some((l) => l.employerRateCents);
  const anyPaid = t.paid !== null;
  const cols = ['Employee', 'Trips', 'Miles', custom ? 'Due at your rate' : 'Due', 'Parking, tolls', ...(anyPaid ? ['Paid', 'True-up'] : []), 'W-2 box 12 L', 'W-2 box 1'];
  put(out,
    example ? h('p', { class: 'mr-sheet-label' }, 'Worked example') : null,
    h('p', { class: 'mr-sub mr-file-answer' }, r.answer),
    factsList([
      ['Trips', String(t.trips)],
      ['Miles', milesText(Math.round(t.miles * 100))],
      ['Reimbursement', t.reimbursement],
      ...(anyPaid ? [['Still owed', t.trueUpOwed]] : []),
      ...(t.box1Wages !== '$0.00' ? [['Taxable excess', t.box1Wages]] : []),
      ['Flagged rows', String(new Set(r.flags.map((f) => f.row)).size)],
    ]),
    h('div', { class: 'table-scroll' }, h('table', { class: 'rules mr-table' }, [
      h('thead', {}, h('tr', {}, cols.map((x, i) => h('th', { scope: 'col', class: i ? 'num' : null }, x)))),
      h('tbody', {}, r.employees.map((e) => h('tr', {}, [
        h('th', { scope: 'row' }, e.employee),
        h('td', { class: 'num' }, String(e.trips)),
        h('td', { class: 'num' }, milesText(Math.round(e.miles * 100))),
        h('td', { class: 'num' }, e.due),
        h('td', { class: 'num' }, e.parkingAndTolls),
        ...(anyPaid ? [h('td', { class: 'num' }, e.paid ?? ''), h('td', { class: `num${e.trueUp && e.trueUp !== '$0.00' ? ' mr-owed' : ''}` }, e.trueUp ?? '')] : []),
        h('td', { class: 'num' }, e.box12CodeL),
        h('td', { class: 'num' }, e.box1Wages),
      ]))),
    ])),
    h('p', { class: 'mr-heading' }, 'By rate period'),
    h('ul', { class: 'mr-lines' }, r.periods.map((p) => h('li', {}, [
      h('span', { class: 'when' }, `${PURPOSES[p.purpose].short}, ${rangeText(p.from, p.to)}`),
      h('span', {}, `${milesText(Math.round(p.miles * 100))} mi x ${p.rateCents}¢ = ${p.amount}`),
    ]))),
    h('p', { class: 'mr-heading' }, `Log check (${r.flags.length})`),
    flagsList(r.flags),
  );
}

// A download box that stays put while the preview above it is redrawn, so a click that lands just
// as a field loses focus (and the preview redraws) is never lost. It reads the inputs on click.
function buyBox(el, { action, label, intro, inputNow, deliver }) {
  const price = h('p', { class: 'mr-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, label);
  const got = h('p', { class: 'mr-got', role: 'status' });
  const err = h('p', { class: 'form-error', role: 'alert' });
  button.addEventListener('click', async () => {
    button.disabled = true;
    err.textContent = '';
    try {
      const json = await T.run(SLUG, inputNow());
      got.textContent = '';
      deliver(json, got);
    } catch (e) {
      errorInto(err, e);
    } finally {
      button.disabled = false;
    }
  });
  put(el, intro ? h('p', { class: 'mr-aside' }, intro) : null, price, button, got, err);
  return {
    show(input) { el.hidden = false; got.textContent = ''; err.textContent = ''; priceLine(input, action, price); },
    hide() { el.hidden = true; },
  };
}
const batchInput = () => ({ op: 'batch', csv: fileText, ...options() });
let fileBuy = null;
let logBuy = null;

// ---------- the log ----------

// The file's rows for one vehicle and year, as CSV text (the heading kept).
function logCsv(vehicle, year) {
  const table = parseCsv(fileText);
  const [header, ...body] = table;
  const { map } = mapColumns(header);
  const keep = body.filter((cells) => {
    const d = dateOf(cells[map.date]);
    if (!d || d.slice(0, 4) !== String(year)) return false;
    return map.vehicle === undefined || !vehicle || (cells[map.vehicle] ?? '').trim().toLowerCase() === vehicle.trim().toLowerCase();
  });
  const field = (v) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return { csv: [header, ...keep].map((r) => r.map((v) => field(v ?? '')).join(',')).join('\r\n'), rows: keep.length, total: body.length };
}

function logInput() {
  const vehicle = $('mr-vehicle').value.trim();
  const year = Number($('mr-taxyear').value);
  const { csv, rows, total } = logCsv(vehicle, year);
  const input = { op: 'log', vehicle: vehicle || 'Vehicle', taxYear: year, csv, ...(options().commute ? { commute: options().commute } : {}) };
  const odo = (id) => { const v = scaled($(id).value.trim(), 1); return v === null ? undefined : v / 10; };
  if (odo('mr-odo-start') !== undefined) input.odometerStart = odo('mr-odo-start');
  if (odo('mr-odo-end') !== undefined) input.odometerEnd = odo('mr-odo-end');
  if ($('mr-biz-start').value) input.businessStartDate = $('mr-biz-start').value;
  if ($('mr-fleet').checked) input.fleetOfFiveOrMore = true;
  return { input, rows, total };
}

// The settings the log preview was last drawn for: redrawing for the same ones would only move
// the page under a click.
let logDrawn = '';

function renderLog() {
  const out = $('mr-log-out');
  let read;
  try {
    read = logInput();
  } catch (e) {
    read = null;
  }
  const key = read ? JSON.stringify(read.input) : '';
  if (read && key === logDrawn) return;
  logDrawn = key;
  out.textContent = '';
  try {
    if (!read) read = logInput();
    if (!read.rows) { out.append(h('p', { class: 'mr-aside' }, `No trips in the file for that vehicle in ${$('mr-taxyear').value}.`)); logBuy.hide(); return; }
    const { trips } = readTrips({ csv: read.input.csv });
    const r = engine.log({
      trips,
      vehicle: read.input.vehicle,
      taxYear: read.input.taxYear,
      odometerStart: read.input.odometerStart === undefined ? null : Math.round(read.input.odometerStart * 100),
      odometerEnd: read.input.odometerEnd === undefined ? null : Math.round(read.input.odometerEnd * 100),
      businessStartDate: read.input.businessStartDate ?? null,
      commute: read.input.commute ?? null,
      fleetOfFiveOrMore: !!read.input.fleetOfFiveOrMore,
    });
    const s = r.summary;
    put(out,
      h('p', { class: 'mr-sub' }, r.answer),
      factsList([
        ['Business miles', milesText(Math.round(s.businessMiles * 100))],
        ['Standard mileage amount', s.standardMileageAmount],
        ['Parking and tolls', s.businessParkingAndTolls],
        ['Business use', s.businessUsePercent === null ? 'needs the odometer readings' : `${s.businessUsePercent}%`],
      ]),
      h('p', { class: 'mr-heading' }, `First ${Math.min(SHOWN_LOG_LINES, r.lines.length)} of ${r.lines.length} log lines`),
      h('ul', { class: 'mr-lines' }, r.lines.slice(0, SHOWN_LOG_LINES).map((l) => h('li', {}, [
        h('span', { class: 'when' }, l.date),
        h('span', {}, `${l.destination || '(no destination)'}: ${l.businessPurpose || (l.purpose === 'business' ? '(no purpose)' : PURPOSES[l.purpose].short)}, ${milesText(Math.round(l.miles * 100))} mi at ${l.rateCents}¢`),
      ]))),
      h('p', { class: 'mr-heading' }, `Completeness check (${r.flags.length})`),
      flagsList(r.flags),
      read.rows < read.total ? h('p', { class: 'mr-aside' }, `${read.total - read.rows} rows of the file are for another vehicle or year and are left out.`) : null,
    );
  } catch (e) {
    out.append(h('p', { class: 'field-error' }, e.message));
    logBuy.hide();
    return;
  }
  logBuy.show(read.input);
}

function setUpLog(trips) {
  const years = [...new Set(trips.map((t) => t.date.slice(0, 4)))].sort().reverse();
  const sel = $('mr-taxyear');
  const was = sel.value;
  sel.textContent = '';
  for (const y of years) sel.appendChild(h('option', { value: y }, y));
  if (years.includes(was)) sel.value = was;
  const vehicles = [...new Set(trips.map((t) => t.vehicle).filter(Boolean))];
  const list = $('mr-vehicles');
  list.textContent = '';
  for (const v of vehicles) list.appendChild(h('option', { value: v }));
  if (vehicles.length && !vehicles.some((v) => v.toLowerCase() === $('mr-vehicle').value.trim().toLowerCase())) $('mr-vehicle').value = vehicles[0];
  $('mr-log').hidden = false;
  logDrawn = '';
  renderLog();
}

let fileDrawn = '';

function analyse() {
  let key = '';
  try { key = JSON.stringify(batchInput()); } catch { key = ''; }
  if (key && key === fileDrawn) return;
  fileDrawn = key;
  $('mr-file-err').textContent = '';
  if (!fileText.trim()) { $('mr-log').hidden = true; fileBuy.hide(); return; }
  try {
    const o = options();
    const { trips, mapped, unknown } = readTrips({ csv: fileText });
    const r = engine.batch({ trips, ...engineOptions(o) });
    renderFile(r);
    $('mr-file-out').prepend(h('p', { class: 'mr-aside' }, `Columns read: ${Object.entries(mapped).map(([k, v]) => `"${v}" as ${FIELD_WORDS[k] ?? k}`).join(', ')}${unknown.length ? `; not used: ${unknown.join(', ')}` : ''}.`));
    fileBuy.show(batchInput());
    setUpLog(trips);
  } catch (e) {
    $('mr-file-err').textContent = e.message;
    $('mr-log').hidden = true;
    fileBuy.hide();
  }
}

// ---------- Excel files, read in the browser ----------

// An .xlsx is a zip of XML. This reads the first worksheet into CSV text: the central directory
// gives each member, and the browser's own DecompressionStream inflates it.
async function xlsxToCsv(buffer) {
  const bytes = new Uint8Array(buffer);
  const view = new DataView(buffer);
  let eocd = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65_557); i--) if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) throw new Error('That file is not a readable .xlsx workbook. Save it as CSV and open that instead.');
  const count = view.getUint16(eocd + 10, true);
  let p = view.getUint32(eocd + 16, true);
  const members = {};
  for (let n = 0; n < count; n++) {
    const method = view.getUint16(p + 10, true);
    const size = view.getUint32(p + 20, true);
    const nameLen = view.getUint16(p + 28, true);
    const extraLen = view.getUint16(p + 30, true);
    const commentLen = view.getUint16(p + 32, true);
    const local = view.getUint32(p + 42, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 46, p + 46 + nameLen));
    members[name] = { method, size, local };
    p += 46 + nameLen + extraLen + commentLen;
  }
  const read = async (name) => {
    const m = members[name];
    if (!m) return null;
    const start = m.local + 30 + view.getUint16(m.local + 26, true) + view.getUint16(m.local + 28, true);
    const raw = bytes.subarray(start, start + m.size);
    if (m.method === 0) return new TextDecoder().decode(raw);
    const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(stream).text();
  };
  const xml = (s) => new DOMParser().parseFromString(s, 'application/xml');
  const shared = [];
  const sst = await read('xl/sharedStrings.xml');
  if (sst) for (const si of xml(sst).getElementsByTagName('si')) shared.push([...si.getElementsByTagName('t')].map((t) => t.textContent).join(''));
  const sheetName = Object.keys(members).filter((n) => /^xl\/worksheets\/sheet\d+\.xml$/.test(n)).sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]))[0];
  if (!sheetName) throw new Error('No worksheet found in that workbook.');
  const sheet = xml(await read(sheetName));
  const grid = [];
  const colIndex = (ref) => [...ref.replace(/\d+/g, '')].reduce((n, c) => n * 26 + c.charCodeAt(0) - 64, 0) - 1;
  for (const row of sheet.getElementsByTagName('row')) {
    const cells = [];
    for (const c of row.getElementsByTagName('c')) {
      const type = c.getAttribute('t');
      const v = c.getElementsByTagName('v')[0]?.textContent ?? '';
      let value = v;
      if (type === 's') value = shared[Number(v)] ?? '';
      else if (type === 'inlineStr') value = [...c.getElementsByTagName('t')].map((t) => t.textContent).join('');
      else if (type !== 'str' && type !== 'b' && v !== '' && !Number.isNaN(Number(v))) {
        const n = Number(v);
        value = Math.abs(n - Number(n.toFixed(2))) < 1e-7 ? String(Number(n.toFixed(2))) : String(n);
      }
      cells[colIndex(c.getAttribute('r') ?? 'A')] = value;
    }
    grid.push(Array.from(cells, (x) => x ?? ''));
  }
  // Date columns hold Excel day numbers: turn them into dates (1900 date system).
  const header = grid[0] ?? [];
  let map = {};
  try { map = mapColumns(header).map; } catch { /* reported when the CSV is read */ }
  const dateCols = ['date', 'endDate', 'paidDate', 'recordedOn'].map((f) => map[f]).filter((i) => i !== undefined);
  for (const r of grid.slice(1)) {
    for (const i of dateCols) {
      const n = Number(r[i]);
      if (r[i] !== '' && Number.isFinite(n) && n > 20_000 && n < 80_000) r[i] = new Date(Date.UTC(1899, 11, 30) + Math.floor(n) * 86_400_000).toISOString().slice(0, 10);
    }
  }
  const field = (v) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return grid.filter((r) => r.some((x) => String(x).trim() !== '')).map((r) => r.map((x) => field(String(x))).join(',')).join('\r\n');
}

async function onFile() {
  const f = $('mr-upload').files[0];
  if (!f) return;
  try {
    fileText = /\.xlsx$/i.test(f.name) ? await xlsxToCsv(await f.arrayBuffer()) : await f.text();
    $('mr-paste').value = fileText.length > 20_000 ? '' : fileText;
    $('mr-paste').placeholder = fileText.length > 20_000 ? `${f.name} is open (too long to show here).` : '';
    analyse();
  } catch (e) {
    $('mr-file-err').textContent = e.message;
  }
}

// ---------- inputs from the address ----------

// Links from the reference pages carry the settings (?mode=split&purpose=medical&year=2026&m1=600
// &m2=400, or ?mode=trips&trips=2026-06-28,120,2026-07-05;2026-07-14,340): the page opens with
// them filled in and worked out here, free. Anything unusable is ignored.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (![...q.keys()].length) return false;
  if (q.get('purpose') && PURPOSES[q.get('purpose')] && [...$('mr-purpose').options].some((o) => o.value === q.get('purpose'))) $('mr-purpose').value = q.get('purpose');
  fillYears(q.get('year'));
  const values = ['m1', 'm2', 'm3'].map((k) => (q.get(k) && scaled(q.get(k), 2) !== null ? q.get(k) : undefined));
  fillPeriods(values);
  if (q.get('mode') === 'trips' || q.get('trips')) {
    document.querySelector('input[name="mode"][value="trips"]').checked = true;
    if (q.get('trips')) $('mr-trips').value = q.get('trips').split(';').map((x) => x.split(',').join(', ')).join('\n');
  }
  if (q.get('extra') && scaled(q.get('extra'), 2) !== null) $('mr-extra').value = q.get('extra');
  return true;
}

// ---------- start ----------

async function start() {
  document.querySelectorAll('input[name="mode"]').forEach((el) => el.addEventListener('change', syncMode));
  $('mr-form').addEventListener('submit', onSubmit);
  const chip = document.querySelector('[data-toll-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('mr-code'), SLUG);

  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('mr-out').textContent = 'The worked example could not load. The calculator still works: press the button to run it.';
    return;
  }
  const tables = tool.examples.find((x) => x.input.op === 'rates').output;
  engine = makeEngine(tables);
  T.me().then((account) => { signedIn = !!account; if (account) $('mr-run-note').textContent = 'Free on this page.'; }).catch(() => {});

  fileBuy = buyBox($('mr-file-buy'), {
    action: 'batch',
    label: 'Download the results',
    intro: 'Every row with its rate, the rule that set it, the source, the amount due, the true-up and its flags, plus a file of employee totals for payroll.',
    inputNow: batchInput,
    deliver: (json, got) => got.append('Your files: ', download('mileage-trips.csv', json.result.csv, 'text/csv'), ' and ', download('mileage-employees.csv', json.result.employeesCsv, 'text/csv'), `. ${costNote(json) ?? ''}`),
  });
  logBuy = buyBox($('mr-log-buy'), {
    action: 'log',
    label: 'Download the log PDF',
    inputNow: () => logInput().input,
    deliver: (json, got) => {
      const pdf = json.result.pdf;
      got.append('Your log: ', download(pdf.filename, new Blob([base64Bytes(pdf.base64)], { type: 'application/pdf' })), ' and ', download(pdf.filename.replace(/\.pdf$/, '.csv'), json.result.csv, 'text/csv'), `. ${costNote(json) ?? ''}`);
    },
  });
  $('mr-purpose').addEventListener('change', () => { fillYears(); fillPeriods([]); });
  $('mr-year').addEventListener('change', () => fillPeriods([]));
  $('mr-upload').addEventListener('change', onFile);
  let timer = null;
  $('mr-paste').addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(() => { fileText = $('mr-paste').value; analyse(); }, 300); });
  // Typed settings redraw the preview a moment after typing stops, so it is current before the
  // download button is pressed.
  const soon = (fn) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, 250); }; };
  for (const id of ['mr-employer', 'mr-home', 'mr-work']) { $(id).addEventListener('input', soon(analyse)); $(id).addEventListener('change', analyse); }
  for (const id of ['mr-vehicle', 'mr-taxyear', 'mr-odo-start', 'mr-odo-end', 'mr-biz-start', 'mr-fleet']) { $(id).addEventListener('input', soon(renderLog)); $(id).addEventListener('change', renderLog); }
  $('mr-template').addEventListener('click', (ev) => {
    ev.preventDefault();
    const a = download('mileage-log-template.csv', `${TEMPLATE_COLUMNS.join(',')}\r\n`, 'text/csv');
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  const linked = fromQuery();
  if (!linked) {
    fillYears('2026');
    const example = tool.examples.find((x) => x.input.op === 'calculate');
    fillPeriods(example.input.trips.map((t) => String(t.miles)));
  }
  syncMode();
  const read = readForm();
  let result = null;
  try { result = read.input ? engine.calculate(read.input) : null; } catch { result = null; }
  if (result) {
    renderCalc(result, { kind: 'example', note: `Worked out on this page${linked ? ' from the link you followed' : ''}. Press "Work it out" to run it, or change the miles.` });
  } else {
    $('mr-out').textContent = 'Enter your miles and press "Work it out".';
  }

  // The trip file's worked example: the payroll sheet in the tool's examples, worked out here.
  const sheet = tool.examples.find((x) => x.input.op === 'batch');
  if (sheet) renderFile(engine.batch({ trips: readTrips(sheet.input).trips }), { example: true });
}

start();
