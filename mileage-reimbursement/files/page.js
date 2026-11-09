// The mileage reimbursement page. core.js (the same file the server runs) prices the worked example
// and previews a trip file in the browser, from the rate tables in this tool's published example,
// so the page and the server read the same dated data. A calculation run here goes through
// Endwise.run (free on this page); the paid downloads (the results CSV and the log PDF) are the
// server's answer to the same file.
import {
  makeEngine, readTrips, parseCsv, mapColumns, dateOf, scaled, usd, milesText, centsText, longDate, rangeText,
  MileageError, PURPOSES, TEMPLATE_COLUMNS,
} from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'mileage-reimbursement';
const MAX_TRIPS = 25;
const SHOWN_FLAGS = 15;
const SHOWN_LOG_LINES = 10;

// The Spanish page (page.es.html, at /es/mileage-reimbursement/) is <html lang="es">: there this
// script shows its own words in Spanish. The English page reads exactly the English words below.
// Text worked out by core.js or the server (the answer sentence, notes, flags, source labels,
// error messages) stays in English on both.
const ES = document.documentElement.lang === 'es';
const tr = (en, es) => (ES ? es : en);
const ES_MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const esDate = (iso) => `${+iso.slice(8)} de ${ES_MONTHS[+iso.slice(5, 7) - 1]} de ${iso.slice(0, 4)}`;
const esRange = (from, to) => {
  if (from.slice(0, 4) === to.slice(0, 4) && from.slice(5) === '01-01' && to.slice(5) === '12-31') return `todo ${from.slice(0, 4)}`;
  return `${from.slice(0, 4) === to.slice(0, 4) ? esDate(from).replace(/ de \d{4}$/, '') : esDate(from)} al ${esDate(to)}`;
};
const ES_SHORT = { business: 'negocios', medical: 'médico', moving: 'mudanza', charity: 'caridad', 'federal travel': 'viaje federal', motorcycle: 'motocicleta', airplane: 'avión', relocation: 'reubicación' };
const shortOf = (purpose) => (ES ? ES_SHORT[PURPOSES[purpose].short] ?? PURPOSES[purpose].short : PURPOSES[purpose].short);
const range = (from, to) => (ES ? esRange(from, to) : rangeText(from, to));
const dateLong = (iso) => (ES ? esDate(iso) : longDate(iso));

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

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortRange = (from, to) => [from, to].map((d) => `${MON[+d.slice(5, 7) - 1]} ${+d.slice(8)}`).join(' to ');

function fillPeriods(values = []) {
  const box = $('mr-periods');
  const old = [...box.querySelectorAll('input')].map((x) => x.value);
  box.textContent = '';
  periodsIn($('mr-purpose').value, $('mr-year').value).forEach((p, i) => {
    const id = `mr-m${i + 1}`;
    box.appendChild(h('div', { class: 'field' }, [
      h('label', { for: id }, tr(`Miles, ${shortRange(p.from, p.to)}`, `Millas, ${range(p.from, p.to)}`)),
      h('input', { type: 'text', id, inputmode: 'decimal', value: values[i] ?? old[i] ?? '', placeholder: '0', title: tr(`${p.rate.words}, ${p.rate.source.label}`, `${p.rate.mills >= 1000 ? `${p.rate.dollars} por milla` : `${p.rate.cents} centavos por milla`}, ${p.rate.source.label}`) }),
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
      if (scaled(raw, 2) === null) { errors.periods = tr(`"${raw}" is not a number of miles.`, `"${raw}" no es un número de millas.`); return; }
      trips.push({ date: p.from, ...(p.to !== p.from ? { endDate: p.to } : {}), miles: raw, purpose });
    });
    if (!trips.length && !errors.periods) errors.periods = tr('Enter the miles for at least one period.', 'Ingrese las millas de al menos un período.');
  } else {
    const lines = $('mr-trips').value.split('\n').map((x) => x.trim()).filter(Boolean);
    for (const line of lines) {
      const t = tripLine(line);
      if (!t) { errors.trips = tr(`Could not read "${line}". Write a date, then the miles, for example 2026-07-14, 340.`, `No se pudo leer "${line}". Escriba una fecha y luego las millas, por ejemplo 2026-07-14, 340.`); break; }
      trips.push({ ...t, purpose, ...(purpose === 'business' ? {} : { paidDate: undefined }) });
    }
    if (!trips.length && !errors.trips) errors.trips = tr('Enter at least one trip.', 'Ingrese al menos un viaje.');
    if (trips.length > MAX_TRIPS) errors.trips = tr(`Up to ${MAX_TRIPS} trips here; put a longer list in the trip file below.`, `Hasta ${MAX_TRIPS} viajes aquí; ponga una lista más larga en el archivo de viajes de abajo.`);
  }
  const extra = $('mr-extra').value.trim();
  if (extra) {
    if (scaled(extra, 2) === null) errors.extra = tr('Parking and tolls must be an amount such as 12.50.', 'El estacionamiento y los peajes deben ser un monto como 12.50.');
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

// The inputs in one line: "4,200 business miles in 2026, 2,600 of them January 1 to June 30".
function inputsLine(r) {
  const miles = milesText(Math.round(r.miles * 100));
  const parts = r.periods.map((p) => tr(`${milesText(Math.round(p.miles * 100))} ${range(p.from, p.to)}`, `${milesText(Math.round(p.miles * 100))} ${range(p.from, p.to)}`));
  const purpose = shortOf(r.periods[0]?.purpose ?? $('mr-purpose').value);
  const extra = r.parkingAndTolls !== '$0.00' ? tr(`, ${r.parkingAndTolls} parking and tolls`, `, ${r.parkingAndTolls} de estacionamiento y peajes`) : '';
  return tr(`${miles} ${purpose} miles: ${parts.join(', ')}${extra}`, `${miles} millas (${purpose}): ${parts.join(', ')}${extra}`);
}

// The total, then one line per rate period (its rate, miles and amount, with the source), any
// parking and tolls, and each trip folded.
function renderCalc(r, { kind, note }) {
  const out = $('mr-out');
  out.textContent = '';
  const notes = r.lines.filter((l) => l.note || l.basis === 'paid-date');
  const item = (k, what, fig, em, cls) => h('li', { class: cls ?? null }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), h('b', {}, fig), h('em', {}, em)]);
  const lines = r.periods.map((p, i) => item(String(i + 1),
    `${PURPOSES[p.purpose].short === 'business' ? '' : `${shortOf(p.purpose)}, `}${range(p.from, p.to)}, ${p.rateCents}¢`,
    p.amount, tr(`${milesText(Math.round(p.miles * 100))} mi x ${p.rateCents}¢, ${p.source}`, `${milesText(Math.round(p.miles * 100))} mi x ${p.rateCents}¢, ${p.source}`), i === r.periods.length - 1 && r.periods.length > 1 ? 'hi' : null));
  if (r.parkingAndTolls !== '$0.00') lines.push(item('+', tr('Parking and tolls', 'Estacionamiento y peajes'), r.parkingAndTolls, tr('At cost, on top of the mileage (Pub 463)', 'Al costo, además del millaje (Pub 463)'), 'plain'));
  lines.push(item('=', tr('Total', 'Total'), r.total, tr(`${milesText(Math.round(r.miles * 100))} miles`, `${milesText(Math.round(r.miles * 100))} millas`), 'tot'));
  put(out,
    h('div', { class: 'tf-rh' }, [
      kind === 'example' ? h('span', { class: 'tf-tag' }, tr('Example', 'Ejemplo')) : h('span', { class: 'tf-tag run' }, tr('Your result', 'Su resultado')),
      h('span', { class: 'tf-src' }, tr(`IRS rates, read ${longDate(engine.irs.source.readOn)}`, `Tarifas del IRS, ${dateLong(engine.irs.source.readOn)}`)),
    ]),
    h('p', { class: 'tf-exin' }, kind === 'example' ? `${tr('Example', 'Ejemplo')}: ${inputsLine(r)}` : inputsLine(r)),
    h('p', { class: 'tf-big' }, [h('b', {}, r.total), h('span', {}, r.parkingAndTolls !== '$0.00' ? tr('mileage, parking and tolls', 'millaje, estacionamiento y peajes') : tr('mileage amount', 'monto por millaje'))]),
    h('p', { class: 'tf-sub' }, r.answer),
    h('ol', { class: 'tf-items mr-items' }, lines),
    r.lines.length > 2 || mode() === 'trips' ? h('details', { class: 'xpand mr-why', open: mode() === 'trips' && r.lines.length <= 8 ? true : null }, [
      h('summary', {}, tr(`Each trip (${r.lines.length})`, `Cada viaje (${r.lines.length})`)),
      h('div', { class: 'xp-in' }, h('ul', { class: 'mr-lines' }, r.lines.map((l) => h('li', {}, [
        h('span', { class: 'when' }, l.endDate ? tr(`${l.date} to ${l.endDate}`, `${l.date} al ${l.endDate}`) : l.date),
        h('span', {}, `${milesText(Math.round(l.miles * 100))} mi x ${l.rateCents}¢ = ${l.amount}`),
        l.basis === 'paid-date' ? h('span', { class: 'mr-tag' }, tr('rate set by the paid date', 'tarifa fijada por la fecha de pago')) : null,
      ])))),
    ]) : null,
    ...notes.map((l) => h('p', { class: 'tf-note' }, l.note)),
    h('p', { class: 'tf-cost' }, [tr('Sources: ', 'Fuentes: '), ...r.sources.flatMap((s, i) => [i ? '; ' : '', link(s.label, s.url)]), '.']),
    note ? h('p', { class: 'tf-cost' }, note) : null,
  );
  $('mr-status').textContent = kind === 'run' ? r.answer : '';
}

function costNote(json) {
  if (json.charged) return json.charged.amount ? tr(`Charged ${json.charged.display}. Your balance is ${json.balance.display}.`, `Se cobró ${json.charged.display}. Su saldo es ${json.balance.display}.`) : tr('Free on this page.', 'Gratis en esta página.');
  if (typeof json.freeRunsLeft === 'number') return tr(`Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`, `Ejecución gratis. Le ${json.freeRunsLeft === 1 ? 'queda' : 'quedan'} ${json.freeRunsLeft} ${json.freeRunsLeft === 1 ? 'ejecución gratis' : 'ejecuciones gratis'} hoy.`);
  return null;
}

function errorInto(box, e) {
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, tr('Sign in', 'Iniciar sesión')));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, tr('Open your account', 'Abrir su cuenta')));
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

const FIELD_WORDS = ES ? {
  date: 'la fecha', endDate: 'la fecha final', miles: 'millas', purpose: 'el uso', employee: 'el empleado', vehicle: 'el vehículo',
  start: 'el inicio', destination: 'el destino', businessPurpose: 'el motivo de negocios', parking: 'estacionamiento', tolls: 'peajes',
  paidAmount: 'el monto pagado', paidRate: 'la tarifa pagada', paidDate: 'la fecha de pago', recordedOn: 'la fecha de anotación',
  odometerStart: 'el odómetro inicial', odometerEnd: 'el odómetro final',
} : {
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

// The sample log near the price: the tool's own "log" worked example (made-up trips for one van),
// so the PDF a paid run gives can be seen before paying.
function sampleLinks() {
  const box = $('mr-sample-links');
  const ex = tool.examples.find((x) => x.input.op === 'log');
  if (!box || !ex?.output.pdf) return;
  const { pdf, csv } = ex.output;
  box.textContent = '';
  const pdfLink = download(pdf.filename, new Blob([base64Bytes(pdf.base64)], { type: 'application/pdf' }));
  const csvLink = download(pdf.filename.replace(/\.pdf$/, '.csv'), csv, 'text/csv');
  pdfLink.textContent = 'PDF';
  csvLink.textContent = 'CSV';
  box.append(pdfLink, tr(' and ', ' y '), csvLink);
}

const options = () => {
  const o = {};
  const rate = $('mr-employer').value.trim().replace(/¢|cents?/i, '').trim();
  if (rate) {
    const tenths = scaled(rate, 1);
    if (tenths === null || tenths === 0) throw new MileageError(tr('Your rate must be cents per mile with at most one decimal, such as 65.5.', 'Su tarifa debe estar en centavos por milla con un decimal como máximo, por ejemplo 65.5.'), 'employerRate');
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
  const text = tool?.pricing?.actions.find((a) => a.name === action)?.text;
  const words = text ? T.money(text) : '';
  if (!signedIn) { el.textContent = tr(`${words}. Sign in to download.`, `${words}. Inicie sesión para descargar.`); return; }
  try {
    const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
    el.textContent = q.amount ? tr(`This download costs ${q.display} from your balance (${words}).`, `Esta descarga cuesta ${q.display} de su saldo (${words}).`) : tr(`This download is free for you now (${words}).`, `Esta descarga es gratis para usted ahora (${words}).`);
  } catch (e) {
    el.textContent = words;
  }
}

function factsList(pairs) {
  return h('dl', { class: 'mr-facts' }, pairs.map(([k, v]) => h('div', {}, [h('dt', {}, k), h('dd', {}, v)])));
}

function flagsList(flags) {
  if (!flags.length) return h('p', { class: 'mr-aside' }, tr('Nothing flagged: every business trip has a destination and a purpose, and nothing repeats.', 'Nada marcado: cada viaje de negocios tiene un destino y un motivo, y nada se repite.'));
  const shown = flags.slice(0, SHOWN_FLAGS);
  return h('div', {}, [
    h('ul', { class: 'mr-flags' }, shown.map((f) => h('li', {}, [h('span', { class: 'when' }, f.row ? tr(`Row ${f.row}`, `Fila ${f.row}`) : tr('Year', 'Año')), h('span', {}, f.message)]))),
    flags.length > shown.length ? h('p', { class: 'mr-aside' }, tr(`And ${flags.length - shown.length} more in the results file.`, `Y ${flags.length - shown.length} más en el archivo de resultados.`)) : null,
  ]);
}

function renderFile(r, { example = false } = {}) {
  const out = $('mr-file-out');
  out.textContent = '';
  const t = r.totals;
  const custom = r.lines.some((l) => l.employerRateCents);
  const anyPaid = t.paid !== null;
  const cols = ES
    ? ['Empleado', 'Viajes', 'Millas', custom ? 'A pagar con su tarifa' : 'A pagar', 'Estacionamiento, peajes', ...(anyPaid ? ['Pagado', 'Ajuste'] : []), 'W-2 casilla 12 L', 'W-2 casilla 1']
    : ['Employee', 'Trips', 'Miles', custom ? 'Due at your rate' : 'Due', 'Parking, tolls', ...(anyPaid ? ['Paid', 'True-up'] : []), 'W-2 box 12 L', 'W-2 box 1'];
  put(out,
    example ? h('div', { class: 'tf-rh' }, [h('span', { class: 'tf-tag' }, tr('Example', 'Ejemplo')), h('span', { class: 'tf-src' }, tr('A made-up payroll sheet', 'Una hoja de nómina inventada'))]) : null,
    h('p', { class: 'tf-sub mr-file-answer' }, r.answer),
    factsList([
      [tr('Trips', 'Viajes'), String(t.trips)],
      [tr('Miles', 'Millas'), milesText(Math.round(t.miles * 100))],
      [tr('Reimbursement', 'Reembolso'), t.reimbursement],
      ...(anyPaid ? [[tr('Still owed', 'Todavía se debe'), t.trueUpOwed]] : []),
      ...(t.box1Wages !== '$0.00' ? [[tr('Taxable excess', 'Excedente tributable'), t.box1Wages]] : []),
      [tr('Flagged rows', 'Filas marcadas'), String(new Set(r.flags.map((f) => f.row)).size)],
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
    h('p', { class: 'mr-heading' }, tr('By rate period', 'Por período de tarifa')),
    h('ul', { class: 'mr-lines' }, r.periods.map((p) => h('li', {}, [
      h('span', { class: 'when' }, `${shortOf(p.purpose)}, ${range(p.from, p.to)}`),
      h('span', {}, `${milesText(Math.round(p.miles * 100))} mi x ${p.rateCents}¢ = ${p.amount}`),
    ]))),
    h('p', { class: 'mr-heading' }, tr(`Log check (${r.flags.length})`, `Revisión del registro (${r.flags.length})`)),
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
  const input = { op: 'log', vehicle: vehicle || tr('Vehicle', 'Vehículo'), taxYear: year, csv, ...(options().commute ? { commute: options().commute } : {}) };
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
    if (!read.rows) { out.append(h('p', { class: 'mr-aside' }, tr(`No trips in the file for that vehicle in ${$('mr-taxyear').value}.`, `No hay viajes en el archivo para ese vehículo en ${$('mr-taxyear').value}.`))); logBuy.hide(); return; }
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
        [tr('Business miles', 'Millas de negocios'), milesText(Math.round(s.businessMiles * 100))],
        [tr('Standard mileage amount', 'Monto con la tarifa estándar por milla'), s.standardMileageAmount],
        [tr('Parking and tolls', 'Estacionamiento y peajes'), s.businessParkingAndTolls],
        [tr('Business use', 'Uso para negocios'), s.businessUsePercent === null ? tr('needs the odometer readings', 'necesita las lecturas del odómetro') : `${s.businessUsePercent}%`],
      ]),
      h('p', { class: 'mr-heading' }, tr(`First ${Math.min(SHOWN_LOG_LINES, r.lines.length)} of ${r.lines.length} log lines`, `Primeras ${Math.min(SHOWN_LOG_LINES, r.lines.length)} de ${r.lines.length} líneas del registro`)),
      h('ul', { class: 'mr-lines' }, r.lines.slice(0, SHOWN_LOG_LINES).map((l) => h('li', {}, [
        h('span', { class: 'when' }, l.date),
        h('span', {}, tr(
          `${l.destination || '(no destination)'}: ${l.businessPurpose || (l.purpose === 'business' ? '(no purpose)' : PURPOSES[l.purpose].short)}, ${milesText(Math.round(l.miles * 100))} mi at ${l.rateCents}¢`,
          `${l.destination || '(sin destino)'}: ${l.businessPurpose || (l.purpose === 'business' ? '(sin motivo)' : shortOf(l.purpose))}, ${milesText(Math.round(l.miles * 100))} mi a ${l.rateCents}¢`,
        )),
      ]))),
      h('p', { class: 'mr-heading' }, tr(`Completeness check (${r.flags.length})`, `Revisión de que esté completo (${r.flags.length})`)),
      flagsList(r.flags),
      read.rows < read.total ? h('p', { class: 'mr-aside' }, tr(`${read.total - read.rows} rows of the file are for another vehicle or year and are left out.`, `${read.total - read.rows} filas del archivo son de otro vehículo o año y quedan fuera.`)) : null,
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
    $('mr-file-out').prepend(h('p', { class: 'mr-aside' }, tr(
      `Columns read: ${Object.entries(mapped).map(([k, v]) => `"${v}" as ${FIELD_WORDS[k] ?? k}`).join(', ')}${unknown.length ? `; not used: ${unknown.join(', ')}` : ''}.`,
      `Columnas leídas: ${Object.entries(mapped).map(([k, v]) => `"${v}" como ${FIELD_WORDS[k] ?? k}`).join(', ')}${unknown.length ? `; no usadas: ${unknown.join(', ')}` : ''}.`,
    )));
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
  if (eocd < 0) throw new Error(tr('That file is not a readable .xlsx workbook. Save it as CSV and open that instead.', 'Ese archivo no es un libro .xlsx que se pueda leer. Guárdelo como CSV y abra ese.'));
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
  if (!sheetName) throw new Error(tr('No worksheet found in that workbook.', 'No se encontró ninguna hoja en ese libro.'));
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
    $('mr-paste').placeholder = fileText.length > 20_000 ? tr(`${f.name} is open (too long to show here).`, `${f.name} está abierto (es demasiado largo para mostrarlo aquí).`) : '';
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
  if (q.get('extra') && scaled(q.get('extra'), 2) !== null) { $('mr-extra').value = q.get('extra'); if ($('mr-extra-fold')) $('mr-extra-fold').open = true; }
  return true;
}

// ---------- start ----------

async function start() {
  document.querySelectorAll('input[name="mode"]').forEach((el) => el.addEventListener('change', syncMode));
  $('mr-form').addEventListener('submit', onSubmit);
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('mr-code'), SLUG);

  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('mr-out').textContent = tr('The worked example could not load. The calculator still works: press the button to run it.', 'No se pudo cargar el ejemplo resuelto. La calculadora sigue funcionando: presione el botón para usarla.');
    return;
  }
  const tables = tool.examples.find((x) => x.input.op === 'rates').output;
  sampleLinks();
  engine = makeEngine(tables);
  T.me().then((account) => { signedIn = !!account; if (account) $('mr-run-note').textContent = tr('Free on this page.', 'Gratis en esta página.'); }).catch(() => {});

  fileBuy = buyBox($('mr-file-buy'), {
    action: 'batch',
    label: tr('Download the results', 'Descargar los resultados'),
    intro: tr('Every row with its rate, the rule that set it, the source, the amount due, the true-up and its flags, plus a file of employee totals for payroll.', 'Cada fila con su tarifa, la regla que la fijó, la fuente, el monto a pagar, el ajuste y sus marcas, más un archivo con los totales por empleado para la nómina.'),
    inputNow: batchInput,
    deliver: (json, got) => got.append(tr('Your files: ', 'Sus archivos: '), download('mileage-trips.csv', json.result.csv, 'text/csv'), tr(' and ', ' y '), download('mileage-employees.csv', json.result.employeesCsv, 'text/csv'), `. ${costNote(json) ?? ''}`),
  });
  logBuy = buyBox($('mr-log-buy'), {
    action: 'log',
    label: tr('Download the log PDF', 'Descargar el PDF del registro'),
    inputNow: () => logInput().input,
    deliver: (json, got) => {
      const pdf = json.result.pdf;
      got.append(tr('Your log: ', 'Su registro: '), download(pdf.filename, new Blob([base64Bytes(pdf.base64)], { type: 'application/pdf' })), tr(' and ', ' y '), download(pdf.filename.replace(/\.pdf$/, '.csv'), json.result.csv, 'text/csv'), `. ${costNote(json) ?? ''}`);
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
    renderCalc(result, { kind: linked ? 'link' : 'example', note: tr(`Worked out on this page${linked ? ' from the link you followed' : ''}. Press "Work it out" to run it, or change the miles.`, `Calculado en esta página${linked ? ' con el enlace que siguió' : ''}. Presione "Calcular" para ejecutarlo, o cambie las millas.`) });
  } else {
    $('mr-out').textContent = tr('Enter your miles and press "Work it out".', 'Ingrese sus millas y presione "Calcular".');
  }

  // The trip file's worked example: the payroll sheet in the tool's examples, worked out here.
  const sheet = tool.examples.find((x) => x.input.op === 'batch');
  if (sheet) renderFile(engine.batch({ trips: readTrips(sheet.input).trips }), { example: true });
}

start();
