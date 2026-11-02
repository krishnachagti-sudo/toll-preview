// The IFTA calculator page. core.js (the same file the server runs) works out estimates from totals
// and the trip sheet check here, free, as they are typed: the rate matrix comes from the tool's
// published rates example, so the page and the server read the same dated tables. Only the
// prepared return (every line, error and missing field, PDF and CSV) is a paid run, through
// Toll.run. Entries are kept in this browser (localStorage) and sent only for the return.
import {
  makeEngine, IftaError, money, whole, longDate, quarterWords, rateText, rate10k, templateCsv,
  tripsFromCsv, receiptsFromCsv, vehiclesFromCsv, csvLine, TRIP_COLUMNS, RECEIPT_COLUMNS, VEHICLE_COLUMNS, isRealDate, QUARTER_RE,
} from './core.js';

const T = window.Toll;
const h = T.h;
const SLUG = 'ifta-calculator';
const STORE_KEY = 'ifta-calculator.v1';
const $ = (id) => document.getElementById(id);

let engine = null;
let rates = null;
let tool = null;
let lastResult = null;
let pendingQuote = null;
let kind = 'example';

// ---------- the example at rest, from the tool's own examples ----------

function exampleState() {
  const est = tool.examples.find((x) => x.input.op === 'estimate').input;
  const ret = tool.examples.find((x) => x.input.op === 'return').input;
  return {
    mode: 'totals',
    quarter: est.quarter,
    fuel: est.fuel,
    rows: est.rows.map((r) => `${r.jurisdiction} ${r.miles}${r.taxPaidGallons ? ` ${r.taxPaidGallons}` : ''}`).join('\n'),
    gallons: est.totalGallons === undefined ? '' : String(est.totalGallons),
    ...sheetText(ret),
    licensee: '',
    base: ret.baseJurisdiction,
  };
}

// A return input as the three CSV boxes.
function sheetText(i) {
  const trips = [csvLine(TRIP_COLUMNS)];
  for (const t of i.trips) {
    t.miles.forEach((m, k) => trips.push(csvLine([t.unit, t.trip ?? '', k ? '' : t.startDate ?? '', k ? '' : t.endDate ?? '', k ? '' : t.from ?? '', k ? '' : t.to ?? '', k ? '' : t.route ?? '', k ? '' : t.odoStart ?? '', k ? '' : t.odoEnd ?? '', m.jurisdiction, m.miles, m.taxableMiles ?? ''])));
  }
  const receipts = [csvLine(RECEIPT_COLUMNS), ...(i.receipts ?? []).map((r) => csvLine([r.unit, r.date ?? '', r.seller ?? '', r.sellerAddress ?? '', r.purchaser ?? '', r.jurisdiction ?? '', r.gallons ?? '', r.fuel ?? '', r.pricePerGallon ?? '', r.total ?? '', r.taxPaid === false ? 'no' : 'yes']))];
  const vehicles = [csvLine(VEHICLE_COLUMNS), ...i.vehicles.map((v) => csvLine([v.unit, v.vin ?? '', v.fuel ?? '']))];
  return { vehicles: vehicles.join('\n'), trips: trips.join('\n'), receipts: receipts.join('\n') };
}

// ---------- the form ----------

const mode = () => document.querySelector('input[name="mode"]:checked').value;
const quarter = () => $('if-quarter').value;

function syncMode() {
  const m = mode();
  for (const el of document.querySelectorAll('[data-mode]')) el.hidden = el.dataset.mode !== m;
  const qd = engine.quarterData(quarter());
  const due = engine.dueDates({ year: +quarter().slice(0, 4) }).dueDates.find((d) => d.quarter === quarter());
  $('if-quarter-hint').textContent = `${qd.label}, ${longDate(qd.from)} to ${longDate(qd.to)}: final rates. Return due ${longDate(due.due)}.`;
  $('if-get').disabled = m !== 'sheet';
  $('if-get-note').textContent = m === 'sheet'
    ? 'Your entries stay in this browser. They are sent only when you prepare the return.'
    : 'The prepared return is built from trip sheets and receipts: switch to "Trip sheets and receipts" to make one. Estimates from totals are free.';
}

const ROW_RE = /^([A-Za-z]{2})[\s,;:]+([\d.,]+)(?:[\s,;:]+([\d.,]*))?(?:[\s,;:]+([\d.,]+))?\s*$/;
const n = (s) => Number(String(s).replace(/,/g, ''));

function readRows() {
  const rows = [];
  for (const line of $('if-rows').value.split('\n').map((x) => x.trim()).filter(Boolean)) {
    const m = ROW_RE.exec(line);
    if (!m || !Number.isFinite(n(m[2])) || (m[3] && !Number.isFinite(n(m[3]))) || (m[4] && !Number.isFinite(n(m[4])))) {
      return { error: `Could not read "${line}". Write the code, the miles, then the tax-paid gallons, like "TX 1200 150".` };
    }
    rows.push({ jurisdiction: m[1].toUpperCase(), miles: n(m[2]), ...(m[3] ? { taxPaidGallons: n(m[3]) } : {}), ...(m[4] ? { taxableMiles: n(m[4]) } : {}) });
  }
  if (!rows.length) return { error: 'Add at least one jurisdiction, like "TX 1200 150".' };
  return { rows };
}

// { input } for the form, or { error, field }, so nothing is worked out until it reads.
function readForm() {
  if (mode() === 'totals') {
    const r = readRows();
    if (r.error) return { error: r.error, field: 'if-rows-err' };
    const g = $('if-gallons').value.trim();
    const input = { op: 'estimate', quarter: quarter(), fuel: $('if-fuel').value, rows: r.rows };
    if (g !== '') {
      if (!Number.isFinite(Number(g)) || Number(g) < 0) return { error: 'All fuel must be a number of gallons.', field: 'if-error' };
      input.totalGallons = Number(g);
    }
    return { input };
  }
  try {
    const vehicles = vehiclesFromCsv($('if-vehicles').value);
    if (!vehicles.length) return { error: 'List at least one vehicle under the header unit,vin,fuel.', field: 'if-error' };
    return { input: { op: 'check', quarter: quarter(), vehicles, trips: tripsFromCsv($('if-trips').value), receipts: receiptsFromCsv($('if-receipts').value) } };
  } catch (e) {
    if (e instanceof IftaError) return { error: e.message, field: 'if-error' };
    throw e;
  }
}

function clearErrors() {
  for (const id of ['if-error', 'if-rows-err', 'if-licensee-err']) $(id).textContent = '';
}

// ---------- drawing ----------

function table(columns, rows, foot) {
  const td = (v, c) => h('td', { class: [c.num ? 'r num' : null, v?.cls ?? null].filter(Boolean).join(' ') || null }, v?.text ?? v);
  return h('div', { class: 'table-scroll' }, h('table', { class: 'rules if-table' }, [
    h('thead', {}, h('tr', {}, columns.map((c) => h('th', { scope: 'col', class: c.num ? 'r num' : null }, c.label)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, r.map((v, i) => (i === 0 ? h('th', { scope: 'row' }, v) : td(v, columns[i])))))),
    foot ? h('tfoot', {}, h('tr', {}, foot.map((v, i) => (i === 0 ? h('th', { scope: 'row' }, v) : td(v, columns[i]))))) : null,
  ]));
}
const signed = (dollars, text) => ({ text, cls: dollars < 0 ? 'credit' : dollars > 0 ? 'due' : null });

function linesTable(f) {
  return table(
    [{ label: 'Jurisdiction' }, { label: 'Miles', num: true }, { label: 'Taxable', num: true }, { label: 'Taxable gal', num: true }, { label: 'Tax-paid gal', num: true }, { label: 'Net gal', num: true }, { label: 'Rate', num: true }, { label: 'Tax (credit)', num: true }, { label: 'Surcharge', num: true }],
    f.lines.map((l) => [`${l.jurisdiction} ${l.name}`, whole(l.totalMiles), whole(l.taxableMiles), whole(l.taxableGallons), whole(l.taxPaidGallons), whole(l.netTaxableGallons), l.display.rate,
      signed(l.tax, l.display.tax), l.surcharge ? { text: l.display.surcharge, cls: 'sur' } : '']),
    ['Total', whole(f.totalMiles), '', '', whole(f.totalGallons), '', `${f.display.mpg} MPG`, signed(f.tax, f.display.tax), ''],
  );
}

function headline(label, cents, sub) {
  return [
    h('p', { class: 'if-label' }, label),
    h('p', { class: `if-answer${cents < 0 ? ' credit' : ''}` }, [h('small', {}, sub), cents < 0 ? `${money(-cents)} credit` : `${money(cents)} due`]),
  ];
}

function renderEstimate(r) {
  const out = $('if-out');
  out.textContent = '';
  const label = kind === 'example' ? 'Worked example' : kind === 'saved' ? 'Your saved figures' : 'Worked out on this page, free';
  const cents = Math.round(r.netDue * 100);
  out.append(
    ...headline(label, cents, `${quarterWords(r.quarter)}, ${r.name.toLowerCase()}`),
    h('dl', { class: 'if-facts' }, [
      h('div', {}, [h('dt', {}, 'Fleet MPG'), h('dd', {}, r.display.mpg)]),
      h('div', {}, [h('dt', {}, 'Miles'), h('dd', {}, whole(r.totalMiles))]),
      h('div', {}, [h('dt', {}, 'Gallons'), h('dd', {}, whole(r.totalGallons))]),
      h('div', {}, [h('dt', {}, 'Due'), h('dd', {}, longDate(r.dueDate.due))]),
    ]),
    h('p', { class: 'if-sub' }, r.answer),
    h('p', { class: 'if-heading' }, 'By jurisdiction'),
    linesTable(r),
    ...(r.warnings.length || r.notes.length ? [h('ul', { class: 'if-warn' }, [...r.warnings.map((w) => w.message), ...r.notes].map((x) => h('li', {}, x)))] : []),
    h('p', { class: 'if-aside' }, r.rateStatus.words),
    lateBox(r),
  );
}

// "If filed late": the late cost of the lines above, worked out here.
function lateBox(r) {
  const box = h('div', {});
  const input = h('input', { type: 'date', id: 'if-filed', value: '' });
  const said = h('p', { class: 'if-aside', 'aria-live': 'polite' }, `On time until ${longDate(r.dueDate.due)}.`);
  const show = () => {
    const d = input.value;
    if (!isRealDate(d)) { said.textContent = `On time until ${longDate(r.dueDate.due)}.`; return; }
    try {
      // A surcharge is its own line: interest is owed on it even when the jurisdiction's tax line is a credit.
      const lines = r.lines.flatMap((l) => [{ jurisdiction: l.jurisdiction, tax: l.tax }, ...(l.surcharge ? [{ jurisdiction: l.jurisdiction, tax: l.surcharge.tax }] : [])]);
      said.textContent = engine.lateCost({ quarter: r.quarter, filedOn: d, lines }).answer;
    } catch (e) {
      if (!(e instanceof IftaError)) throw e;
      said.textContent = e.message;
    }
  };
  input.addEventListener('input', show);
  box.append(h('p', { class: 'if-heading' }, 'If it is filed late'), h('div', { class: 'if-late' }, [h('div', {}, [h('label', { for: 'if-filed' }, 'Filed on'), input])]), said);
  return box;
}

function renderCheck(r, sheet) {
  const out = $('if-out');
  out.textContent = '';
  const label = kind === 'example' ? 'Worked example' : kind === 'saved' ? 'Your saved trip sheet' : 'Checked on this page, free';
  out.append(
    h('p', { class: 'if-label' }, label),
    h('p', { class: 'if-answer' }, [h('small', {}, `${quarterWords(r.quarter)} trip sheet check`), r.passed ? 'Reconciles' : `${r.errorCount} error${r.errorCount === 1 ? '' : 's'}`]),
    h('dl', { class: 'if-facts' }, [
      h('div', {}, [h('dt', {}, 'Vehicles'), h('dd', {}, String(r.vehicles))]),
      h('div', {}, [h('dt', {}, 'Trips'), h('dd', {}, String(r.trips))]),
      h('div', {}, [h('dt', {}, 'Receipts'), h('dd', {}, String(r.receipts))]),
      h('div', {}, [h('dt', {}, 'Warnings'), h('dd', {}, String(r.warningCount))]),
      h('div', {}, [h('dt', {}, 'Missing fields'), h('dd', {}, String(r.missingCount))]),
    ]),
    h('p', { class: 'if-sub' }, r.answer),
    h('p', { class: 'if-aside' }, `Preparing the return lists every error, warning and missing field with what it puts at risk, works out each fuel's lines and gives the PDF and CSV: ${priceFor(sheet.vehicles.length)} for this ${sheet.vehicles.length}-vehicle fleet.`),
    h('div', { id: 'if-files' }),
  );
}

const priceFor = (vehicles) => (vehicles <= 5 ? '$5.00' : vehicles <= 25 ? '$9.00' : '$15.00');

function renderReturn(r, json) {
  const out = $('if-out');
  out.textContent = '';
  const cents = Math.round(r.netDue * 100);
  out.append(...headline('Your prepared return', cents, `${quarterWords(r.quarter)}, ${r.licensee}`), h('p', { class: 'if-sub' }, r.answer));
  for (const f of r.byFuel) out.append(h('p', { class: 'if-heading' }, `${f.name}: ${f.display.mpg} MPG`), linesTable(f));
  const rec = r.reconciliation;
  out.append(h('p', { class: 'if-heading' }, `Reconciliation (${rec.errors.length} errors, ${rec.warnings.length} warnings)`));
  out.append(table([{ label: 'Unit' }, { label: 'Trips', num: true }, { label: 'Miles logged', num: true }, { label: 'Odometer', num: true }, { label: 'Not logged', num: true }],
    rec.perVehicle.map((v) => [v.unit, String(v.trips), whole(v.sumMiles), v.odoDelta === null ? 'none' : whole(v.odoDelta), whole(v.unlogged)])));
  if (rec.errors.length) out.append(h('ul', { class: 'if-warn err' }, rec.errors.map((e) => h('li', {}, e.message))));
  if (rec.warnings.length) out.append(h('ul', { class: 'if-warn' }, rec.warnings.map((e) => h('li', {}, e.message))));
  out.append(h('p', { class: 'if-heading' }, `Record check (${r.recordCheck.missing.length} missing)`));
  out.append(r.recordCheck.missing.length
    ? h('ul', { class: 'if-warn' }, r.recordCheck.missing.map((m) => h('li', {}, `${m.record}: no ${m.field}. ${m.effect}`)))
    : h('p', { class: 'if-aside' }, 'Every trip and receipt has the fields an auditor asks for.'));
  const f = r.files;
  out.append(
    h('p', { class: 'if-heading' }, 'Files'),
    h('p', { class: 'if-downloads' }, [f.pdf ? download(f.pdf.name, 'application/pdf', fromBase64(f.pdf.base64)) : null, ' ', download(f.csv.name, 'text/csv', f.csv.text)]),
    h('p', { class: 'if-aside' }, `Input hash ${r.inputHash.slice(0, 16)}, data ${r.dataVersion}. ${json.charged ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : ''}`),
  );
}

function rateTable() {
  const qd = engine.quarterData(quarter());
  const el = $('if-rate-table');
  el.textContent = '';
  const fuels = ['special_diesel', 'gasoline', 'propane', 'biodiesel'];
  const idx = fuels.map((f) => rates.fuels.findIndex((x) => x.key === f));
  const cell = (row, i) => (row?.noIftaRate ? 'none' : row?.rates[i] == null ? '-' : rateText(rate10k(row.rates[i])));
  const rows = rates.jurisdictions.map((j) => {
    const row = qd.rows.find((r) => r.code === j.code);
    const sur = qd.surcharges.find((r) => r.code === j.code);
    const held = qd.disputed.filter((d) => d.code === j.code).flatMap((d) => d.fuels);
    return [`${j.code} ${j.name}`, ...idx.map((i, k) => (held.includes(fuels[k]) ? 'held back' : cell(row, i) + (sur && sur.rates[i] != null ? ` + ${rateText(rate10k(sur.rates[i]))}` : '')))];
  });
  el.appendChild(table([{ label: 'Jurisdiction' }, { label: 'Diesel', num: true }, { label: 'Gasoline', num: true }, { label: 'Propane', num: true }, { label: 'Biodiesel', num: true }], rows));
  $('if-rate-title').textContent = `Rates for the ${quarterWords(qd.quarter)}, US dollars a gallon`;
  $('if-rate-note').textContent = `"+" is the surcharge row. "-" means the matrix shows no rate. Exchange rate for Canadian rates: US $${qd.exchangeRate.usPerCa} per Canadian dollar. From the Oregon DOT copy of the matrix (${qd.primary.quote}), checked against New York State Tax's IFTA-105 table, both read ${longDate(qd.primary.readOn)}. All 15 fuel types are in the rates lookup.`;
}

function dueTable() {
  const years = [...new Set(engine.quarters.map((q) => +q.slice(0, 4)))];
  const rows = years.flatMap((y) => engine.dueDates({ year: y }).dueDates).filter((d) => d.quarter >= engine.first);
  $('if-due-table').textContent = '';
  $('if-due-table').appendChild(table([{ label: 'Quarter' }, { label: 'Due' }, { label: 'Note' }], rows.map((d) => [quarterWords(d.quarter), longDate(d.due), d.moved ? `${longDate(d.statutory)} is a weekend` : ''])));
}

// ---------- working it out ----------

function save() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({
      mode: mode(), quarter: quarter(), fuel: $('if-fuel').value, rows: $('if-rows').value, gallons: $('if-gallons').value,
      vehicles: $('if-vehicles').value, trips: $('if-trips').value, receipts: $('if-receipts').value,
      licensee: $('if-licensee').value, base: $('if-base').value,
    }));
  } catch { /* storage may be off; the page still works */ }
}

function update() {
  clearErrors();
  syncMode();
  rateTable();
  pendingQuote = null;
  $('if-get').textContent = 'Prepare the return (PDF and CSV)';
  const read = readForm();
  if (read.error) { $(read.field).textContent = read.error; lastResult = null; return; }
  try {
    if (read.input.op === 'estimate') {
      lastResult = engine.estimate(read.input);
      renderEstimate(lastResult);
    } else {
      const sheet = { ...read.input, odometerTolerance: 1 };
      lastResult = engine.check(sheet);
      renderCheck(lastResult, sheet);
    }
    $('if-status').textContent = kind === 'edit' ? lastResult.answer : '';
  } catch (e) {
    if (!(e instanceof IftaError)) throw e;
    lastResult = null;
    $(mode() === 'totals' && /row|jurisdiction/.test(e.field ?? '') ? 'if-rows-err' : 'if-error').textContent = e.message;
  }
  if (kind !== 'example') save();
}

let timer = null;
const soon = () => { kind = 'edit'; clearTimeout(timer); timer = setTimeout(() => { timer = null; update(); }, 150); };

// ---------- the paid return ----------

function download(name, type, data, text) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  return h('a', { href: url, download: name, class: 'btn btn-small' }, text ?? `Download ${name.endsWith('.pdf') ? 'the PDF' : 'the CSV'}`);
}
const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

// The sample near the price: the tool's own "return" example (a made-up fleet), so what a paid
// run gives can be seen before paying. The templates are free.
function sampleLinks() {
  const box = $('if-sample-links');
  const ex = tool.examples.find((x) => x.input.op === 'return');
  if (box && ex) {
    const f = ex.output.files;
    box.textContent = '';
    box.append(
      h('a', { href: URL.createObjectURL(new Blob([fromBase64(f.pdf.base64)], { type: 'application/pdf' })), download: f.pdf.name, class: 'btn btn-quiet btn-small' }, 'Sample return (PDF)'), ' ',
      h('a', { href: URL.createObjectURL(new Blob([f.csv.text], { type: 'text/csv' })), download: f.csv.name, class: 'btn btn-quiet btn-small' }, 'Sample return CSV'),
    );
  }
  const t = $('if-templates');
  for (const [k, label] of [['vehicles', 'Vehicles'], ['trips', 'Trip sheet'], ['receipts', 'Receipts']]) {
    t.append(h('a', { href: URL.createObjectURL(new Blob([templateCsv(k)], { type: 'text/csv' })), download: `ifta-${k}-template.csv`, class: 'btn btn-quiet btn-small' }, label));
  }
}

function showError(e) {
  const box = $('if-error');
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in or create an account'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

async function getReturn() {
  // A change typed just before the click is worked out first, so the quote is for what is shown.
  if (timer) { clearTimeout(timer); timer = null; update(); }
  clearErrors();
  const read = readForm();
  if (read.error || !lastResult || read.input.op !== 'check') { $('if-error').textContent = read.error ?? 'Fix the trip sheet first: the return is built from what is shown.'; return; }
  const licensee = $('if-licensee').value.trim();
  if (!licensee) {
    $('if-licensee-err').textContent = 'Put the licensee name or IFTA licence number on the return.';
    $('if-licensee').focus();
    return;
  }
  const input = { ...read.input, op: 'return', licensee, baseJurisdiction: $('if-base').value };
  const key = JSON.stringify(input);
  const button = $('if-get');
  button.disabled = true;
  try {
    const account = await T.me().catch(() => null);
    if (!account) {
      showError({ message: `The prepared return is ${priceFor(input.vehicles.length)} per licensee and quarter, taken from a prepaid balance.`, code: 'unauthorized' });
      return;
    }
    if (!pendingQuote || pendingQuote.key !== key) {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
      pendingQuote = { key, q };
      button.textContent = q.amount ? `Pay ${q.display} and prepare` : 'Prepare (no charge)';
      $('if-get-note').textContent = q.detail ?? '';
      return;
    }
    const json = await T.run(SLUG, input);
    renderReturn(json.result, json);
    pendingQuote = null;
    button.textContent = 'Prepare the return (PDF and CSV)';
    $('if-get-note').textContent = 'Re-runs for the same licensee and quarter are free for 90 days.';
  } catch (e) {
    showError(e);
  } finally {
    button.disabled = false;
  }
}

// ---------- inputs from the address and the saved entries ----------

// Links from the rate and guide pages carry totals (?quarter=2026Q3&fuel=special_diesel
// &rows=TX:1200:150,OK:400&gallons=250): the page opens with them filled in and worked out here.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (![...q.keys()].length) return null;
  const state = { ...exampleState(), mode: 'totals' };
  if (QUARTER_RE.test(q.get('quarter') ?? '') && engine.quarters.includes(q.get('quarter'))) state.quarter = q.get('quarter');
  if (engine.FUELS.includes(q.get('fuel'))) state.fuel = q.get('fuel');
  if (q.get('rows')) state.rows = q.get('rows').split(',').map((x) => x.split(':').filter(Boolean).join(' ')).join('\n');
  if (q.get('gallons') !== null) state.gallons = q.get('gallons');
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
  if (engine.quarters.includes(state.quarter)) $('if-quarter').value = state.quarter;
  document.querySelector(`input[name="mode"][value="${state.mode === 'sheet' ? 'sheet' : 'totals'}"]`).checked = true;
  if (engine.FUELS.includes(state.fuel)) $('if-fuel').value = state.fuel;
  for (const [id, k] of [['if-rows', 'rows'], ['if-gallons', 'gallons'], ['if-vehicles', 'vehicles'], ['if-trips', 'trips'], ['if-receipts', 'receipts'], ['if-licensee', 'licensee']]) $(id).value = state[k] ?? '';
  if (state.base) $('if-base').value = state.base;
}

// ---------- start ----------

async function start() {
  const chip = document.querySelector('[data-toll-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('if-code'), SLUG);
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('if-out').textContent = 'The rates could not load. Reload the page to try again.';
    return;
  }
  rates = tool.examples.find((x) => x.input.op === 'rates' && !x.input.quarter && !x.input.jurisdiction).output;
  engine = makeEngine({ rates, rules: rates.rules });
  for (const q of [...engine.quarters].reverse()) $('if-quarter').appendChild(h('option', { value: q }, quarterWords(q)));
  for (const f of rates.computedFuels) $('if-fuel').appendChild(h('option', { value: f }, engine.fuelName[f]));
  for (const j of rates.jurisdictions) $('if-base').appendChild(h('option', { value: j.code }, `${j.code} ${j.name}`));
  sampleLinks();
  dueTable();

  const linked = fromQuery();
  const saved = linked ? null : loadSaved();
  kind = linked ? 'edit' : saved ? 'saved' : 'example';
  apply(linked ?? saved ?? exampleState());

  $('if-form').addEventListener('input', soon);
  $('if-form').addEventListener('change', soon);
  $('if-form').addEventListener('submit', (ev) => ev.preventDefault());
  $('if-get').addEventListener('click', getReturn);
  update();
}

start();
