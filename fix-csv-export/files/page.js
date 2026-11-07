// The fix-a-CSV-export page. The scan runs here, in the browser, with core.js (the same file the
// server runs): the file is read and every column worked out without uploading anything. Choices
// made in the column table become the recipe. Only "Download the fixed file" sends the file to the
// server (Endwise.run, paid), which runs the same engine and returns the file, the change report
// and the recipe. A recipe is remembered in this browser by the file's header signature, and can be
// downloaded to use elsewhere; it holds settings only.
import { scan, LIMITS, COLUMN_TYPES, DATE_FORMAT_NAMES, signature } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'fix-csv-export';
const $ = (id) => document.getElementById(id);
const STORE = 'endwise-fix-csv-recipe:';

// The made-up export the sample button loads (tool.js SAMPLE_CSV; the tests check they match).
const SAMPLE = 'Account,Customer,ZIP,Posted,Amount,Order ID\r\n0010,CafÃ© Rio,2134,13/03/2026,"$1,200.50",4000123412341234\r\n0200,ZoÃ« Park,90210,03/04/2026,(45.00),4000123412349876\r\n3000,Ann Lee,501,05/05/2026,12.00,1.23457E+15\r\n0040,Ã‰lise Roy,7030,28/02/2026,"$2,050.00",4000555566667777\r\n';

const state = { bytes: null, name: null, recipe: null, recipeFrom: null, columns: {}, last: null };

const TYPE_WORDS = { keep: 'Leave as written', date: 'Date', zip: 'ZIP code', code: 'Code (keep as text)', number: 'Amount (plain number)' };
const ORDER_WORDS = { dmy: 'DD/MM', mdy: 'MM/DD', mixed: 'Mixed: row by row', ask: 'Not known: leave ambiguous dates' };

const store = {
  get(sig) { try { return JSON.parse(localStorage.getItem(STORE + sig) ?? 'null'); } catch { return null; } },
  set(sig, recipe) { try { localStorage.setItem(STORE + sig, JSON.stringify(recipe)); } catch { /* private mode: the download still works */ } },
};

function output() {
  return { encoding: $('fx-out-enc').value, dates: $('fx-out-dates').value, lineEnd: $('fx-out-eol').value, excelGuard: $('fx-out-guard').checked, delimiter: ',' };
}

// The recipe the page would send: the loaded or remembered one, with the table's choices on top.
function currentRecipe() {
  // The last scan's recipe holds every rule in force (loaded, chosen or suggested), so a change to
  // one column keeps the others as they were.
  const base = state.last?.recipe ?? state.recipe ?? {};
  const columns = { ...(base.columns ?? {}) };
  for (const [name, rule] of Object.entries(state.columns)) {
    if (rule.type === 'keep') delete columns[name];
    else columns[name] = rule;
  }
  const withTable = Object.keys(state.columns).length || state.recipe;
  return withTable ? { ...base, v: 1, output: output(), columns, headers: state.recipe?.headers ?? base.headers } : null;
}

// ---------- showing the scan ----------

function ruleControls(col) {
  const rule = col.rule;
  const set = (patch) => { state.columns[col.name] = { ...stripFrom(rule), ...patch }; rescan(); };
  const type = h('select', { 'aria-label': `What "${col.name}" holds` }, COLUMN_TYPES.map((t) => h('option', { value: t, ...(t === rule.type ? { selected: '' } : {}) }, TYPE_WORDS[t])));
  type.addEventListener('change', () => {
    const t = type.value;
    state.columns[col.name] = t === 'date' ? { type: 'date', order: col.date?.order === 'dmy' || col.date?.order === 'mdy' ? col.date.order : 'ask' } : { type: t };
    rescan();
  });
  const extra = [];
  if (rule.type === 'date') {
    const order = h('select', { 'aria-label': `Date order of "${col.name}"` }, Object.keys(ORDER_WORDS).map((o) => h('option', { value: o, ...(o === (rule.order ?? 'ask') ? { selected: '' } : {}) }, ORDER_WORDS[o])));
    order.addEventListener('change', () => set({ order: order.value, ...(order.value === 'mixed' ? { ambiguous: rule.ambiguous ?? 'leave' } : { ambiguous: undefined }) }));
    extra.push(order);
    if (rule.order === 'mixed') {
      const amb = h('select', { 'aria-label': `Ambiguous dates in "${col.name}"` }, [['leave', 'Ambiguous: leave as written'], ['dmy', 'Ambiguous: read as DD/MM'], ['mdy', 'Ambiguous: read as MM/DD']].map(([v, w]) => h('option', { value: v, ...(v === (rule.ambiguous ?? 'leave') ? { selected: '' } : {}) }, w)));
      amb.addEventListener('change', () => set({ ambiguous: amb.value }));
      extra.push(amb);
    }
  }
  if (rule.type === 'code') {
    const width = h('input', { type: 'number', min: '1', max: '30', placeholder: col.code?.suggestWidth ? `width ${col.code.suggestWidth}?` : 'no width', value: rule.width ?? '', 'aria-label': `Pad "${col.name}" to this many digits` });
    width.addEventListener('change', () => { const n = Number(width.value); set({ width: Number.isInteger(n) && n >= 1 && n <= 30 ? n : undefined }); });
    extra.push(width);
  }
  if (rule.type === 'number') {
    const dec = h('select', { 'aria-label': `Decimal mark in "${col.name}"` }, [['.', '1,234.56'], [',', '1.234,56']].map(([v, w]) => h('option', { value: v, ...(v === (rule.decimal ?? '.') ? { selected: '' } : {}) }, w)));
    dec.addEventListener('change', () => set({ decimal: dec.value }));
    extra.push(dec);
  }
  return h('div', { class: 'fx-controls' }, [type, ...extra]);
}
const stripFrom = ({ from, ...rest }) => { void from; return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)); };

function findings(col) {
  const out = [];
  if (col.date) {
    const p = col.date.proofs;
    if (p.dmy) out.push(`${p.dmy} prove DD/MM`);
    if (p.mdy) out.push(`${p.mdy} prove MM/DD`);
    if (p.ambiguous) out.push(`${p.ambiguous} read either way`);
    if (p.ymd) out.push(`${p.ymd} year first`);
    if (p.named) out.push(`${p.named} with month names`);
    if (col.date.twoDigitYears) out.push(`${col.date.twoDigitYears} with two-digit years`);
  }
  if (col.zip?.short) out.push(`${col.zip.short} short ZIP codes`);
  if (col.code?.leadingZeros) out.push(`${col.code.leadingZeros} with leading zeros`);
  if (col.code?.longIds) out.push(`${col.code.longIds} of 16+ digits`);
  if (col.code?.suggestWidth && col.rule.type === 'code' && !col.rule.width) out.push(`${col.code.atWidth} are ${col.code.suggestWidth} digits, ${col.code.shorter} shorter: set the width to restore their zeros`);
  if (col.code?.damaged || col.damaged) out.push(`${col.code?.damaged ?? col.damaged} already in scientific notation`);
  if (col.amount?.styled) out.push(`${col.amount.styled} written with signs or brackets`);
  if (col.excelDates) out.push(`${col.excelDates} look like Excel-made dates`);
  return out.join('; ') || (col.kind === 'empty' ? 'empty' : '');
}

function columnTable(report) {
  return h('div', { class: 'table-scroll' }, [h('table', { class: 'fx-cols' }, [
    h('thead', null, [h('tr', null, ['Column', 'What it holds', 'Found'].map((x) => h('th', { scope: 'col' }, x)))]),
    h('tbody', null, report.columns.map((c) => h('tr', { class: c.rule.from === 'new' ? 'fx-new' : '' }, [
      h('th', { scope: 'row' }, c.rule.from === 'new' ? `${c.name} (new)` : c.name),
      h('td', null, [ruleControls(c)]),
      h('td', { class: 'fx-found' }, findings(c)),
    ]))),
  ])]);
}

function previewTable(p) {
  return h('div', { class: 'table-scroll' }, [h('table', { class: 'fx-preview' }, [
    h('thead', null, [h('tr', null, p.headers.map((x) => h('th', { scope: 'col' }, x)))]),
    h('tbody', null, p.after.map((row, i) => h('tr', null, row.map((v, j) => {
      const before = p.before[i][j] ?? '';
      return before !== v ? h('td', { class: 'fx-changed', title: `Was: ${before}` }, [h('s', null, before), ' ', v]) : h('td', null, v);
    })))),
  ])]);
}

function flagList(flags) {
  const items = [];
  for (const [col, reasons] of Object.entries(flags)) {
    for (const [why, f] of Object.entries(reasons)) items.push(h('li', null, `"${col}": ${f.n} ${why === 'ambiguous' ? 'ambiguous dates left as written' : `left as written (${why})`}, line${f.lines.length === 1 ? '' : 's'} ${f.lines.join(', ')}${f.n > f.lines.length ? ' and more' : ''}.`));
  }
  return items.length ? h('ul', { class: 'fx-flags' }, items) : null;
}

function driftNote(d) {
  if (!d || d.same) return null;
  const bits = [];
  if (d.missing.length) bits.push(`missing since the recipe: ${d.missing.join(', ')}`);
  if (d.added.length) bits.push(`new: ${d.added.join(', ')} (given the suggested rule)`);
  if (d.moved) bits.push('columns are in a different order');
  return h('p', { class: 'fx-drift' }, `This file's columns changed since the recipe was saved: ${bits.join('; ')}.`);
}

function show(report, label) {
  const out = $('fx-out');
  out.textContent = '';
  const todo = report.toDo;
  const parts = [
    h('p', { class: 'fx-label' }, label),
    h('p', { class: 'fx-answer' }, report.answer),
    state.recipeFrom ? h('p', { class: 'muted' }, state.recipeFrom) : null,
    driftNote(report.drift),
    report.encoding.note ? h('p', { class: 'muted' }, report.encoding.note) : null,
    todo.chooseOrder.length ? h('p', { class: 'fx-ask' }, `Choose the date order for ${todo.chooseOrder.map((x) => `"${x}"`).join(', ')}: no value in it proves DD/MM or MM/DD, so its dates are left as written until you do.`) : null,
    report.raggedCount ? h('p', { class: 'fx-drift' }, `${report.raggedCount} row${report.raggedCount === 1 ? ' has' : 's have'} a different number of fields from the header (line${report.raggedCount === 1 ? '' : 's'} ${report.ragged.slice(0, 10).map((r) => r.line).join(', ')}). They are written as they are.`) : null,
    ...report.problems.map((p) => h('p', { class: 'fx-drift' }, `Line ${p.line}: ${p.message}.`)),
    h('h2', { class: 'fx-h' }, 'Columns'),
    columnTable(report),
    flagList(todo.flags),
    h('h2', { class: 'fx-h' }, `The first ${Math.min(LIMITS.previewRows, report.rows)} rows, fixed`),
    h('p', { class: 'muted' }, `Dates are written as ${DATE_FORMAT_NAMES[output().dates]}. Struck-out text is what the file had.`),
    previewTable(report.preview),
  ];
  out.append(...parts.filter(Boolean));
}

// ---------- scanning (in the browser) ----------

function rescan() {
  if (!state.bytes) return;
  $('fx-error').textContent = '';
  try {
    const report = scan(state.bytes, currentRecipe(), output());
    state.last = report;
    show(report, state.name === 'sample' ? 'Sample: the made-up monthly export' : `Your file: ${state.name}`);
    $('fx-go').disabled = false;
    $('fx-go-note').textContent = `The fixed file of ${report.rows.toLocaleString('en-US')} rows: $0.25 from your balance (needs an account). The scan is free.`;
  } catch (err) {
    state.last = null;
    $('fx-go').disabled = true;
    $('fx-error').textContent = err.message;
  }
}

function load(bytes, name) {
  state.bytes = bytes;
  state.name = name;
  state.columns = {};
  state.last = null;
  $('fx-file-name').textContent = name === 'sample' ? 'The sample export.' : `${name}, ${bytes.length.toLocaleString('en-US')} bytes.`;
  if (bytes.length > LIMITS.bytes) { $('fx-error').textContent = `This file is over 2 MB (${bytes.length.toLocaleString('en-US')} bytes). Split it into parts and fix each one.`; $('fx-go').disabled = true; return; }
  // A recipe remembered for files with these columns is used again by itself.
  if (!state.recipe || state.recipeFrom?.startsWith('Remembered')) {
    state.recipe = null;
    state.recipeFrom = null;
    try {
      const first = scan(bytes, null, output());
      const saved = store.get(signature(first.columns.map((c) => c.name)));
      if (saved) { state.recipe = saved; state.recipeFrom = `Remembered recipe${saved.name ? ` "${saved.name}"` : ''}, saved in this browser for files with these columns.`; }
    } catch { /* the rescan below shows the error */ }
  }
  rescan();
}

async function readFile(file) {
  const buf = new Uint8Array(await file.arrayBuffer());
  load(buf, file.name);
}

// ---------- fixing (on the server, paid) ----------

function toBase64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromBase64(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}
const link = (name, blob, text) => h('a', { href: URL.createObjectURL(blob), download: name, class: 'btn btn-small' }, text);

async function runFix() {
  if (!state.bytes || !state.last) return;
  $('fx-error').textContent = '';
  $('fx-status').textContent = 'Fixing the file.';
  // The scan's recipe is what the table shows: the loaded recipe, the choices, and suggestions for the rest.
  const recipe = { ...state.last.recipe, ...(state.recipe?.name ? { name: state.recipe.name } : {}) };
  try {
    const res = await T.run(SLUG, { op: 'fix', file: toBase64(state.bytes), name: state.name === 'sample' ? 'sample-export.csv' : state.name, recipe, output: output() });
    const r = res.result;
    store.set(r.recipe.signature, r.recipe);
    const amount = res.charged?.amount ?? 0;
    const box = h('div', { class: 'fx-done' }, [
      h('p', { class: 'fx-label' }, 'Fixed'),
      h('p', { class: 'fx-answer' }, r.answer),
      h('p', { class: 'fx-downloads' }, [
        link(r.file.name, new Blob([fromBase64(r.file.base64)], { type: 'text/csv' }), 'Download the fixed file'),
        link(r.file.name.replace(/\.csv$/, '-changes.csv'), new Blob([r.changes.csv], { type: 'text/csv' }), `Change report (${r.changes.total.toLocaleString('en-US')} changes)`),
        link('recipe.json', new Blob([JSON.stringify(r.recipe, null, 2)], { type: 'application/json' }), 'Download the recipe'),
      ]),
      h('p', { class: 'muted' }, `${amount > 0 ? `Charged $${(amount / 1e6).toFixed(2)}.` : 'No charge for this one.'} The recipe is remembered in this browser for files with these columns; download it to use on another computer or from code.`),
    ]);
    $('fx-out').prepend(box);
    $('fx-status').textContent = 'The fixed file is ready.';
  } catch (err) {
    $('fx-status').textContent = '';
    $('fx-error').textContent = err.status === 401 ? 'The fixed file needs an account, so it can be paid from your balance ($0.25). Sign in, then press the button again. The scan above stays free.' : err.message;
  }
}

// ---------- start ----------

// ?text=<CSV> loads that CSV (content pages link here with their worked example); ?sample=1 loads
// the sample; ?dates=iso|mdy|dmy and ?enc=utf-8-bom|utf-8|windows-1252 preset the output.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const pick = (id, v) => { if (v && [...$(id).options].some((o) => o.value === v)) $(id).value = v; };
  pick('fx-out-dates', q.get('dates'));
  pick('fx-out-enc', q.get('enc'));
  if (q.get('guard') === '1') $('fx-out-guard').checked = true;
  const text = q.get('text');
  if (text && text.length <= 4000) { load(new TextEncoder().encode(text), 'example.csv'); return true; }
  if (q.get('sample') === '1') { load(new TextEncoder().encode(SAMPLE), 'sample'); return true; }
  return false;
}

function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('fx-code'), SLUG);
  $('fx-file').addEventListener('change', () => { const f = $('fx-file').files[0]; if (f) readFile(f); });
  $('fx-sample').addEventListener('click', () => load(new TextEncoder().encode(SAMPLE), 'sample'));
  const drop = $('fx-drop');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f) readFile(f); });
  $('fx-recipe-file').addEventListener('change', async () => {
    const f = $('fx-recipe-file').files[0];
    if (!f) return;
    try {
      state.recipe = JSON.parse(await f.text());
      state.recipeFrom = `Recipe from ${f.name}${state.recipe.name ? ` ("${state.recipe.name}")` : ''}.`;
      $('fx-recipe-note').textContent = state.recipeFrom;
      state.columns = {};
      state.last = null;
      rescan();
    } catch {
      $('fx-recipe-note').textContent = 'That file is not a recipe (it is not JSON).';
    }
  });
  for (const id of ['fx-out-enc', 'fx-out-dates', 'fx-out-eol', 'fx-out-guard']) $(id).addEventListener('change', rescan);
  $('fx-go').addEventListener('click', runFix);
  fromQuery();
}

start();
