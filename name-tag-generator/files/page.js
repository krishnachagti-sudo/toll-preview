// The name tag page. core.js (the same file the server runs) reads the list and lays out every
// badge here in the browser, from the template data embedded in the page (the same file the server
// reads; a test checks they are equal), so the preview is free and instant and the list stays on
// the page. The PDFs are the server's answer to the same input: the alignment test is free, the
// badges and walk-ins go through Endwise.run and are priced by the tool's rules.
import { makeEngine, findTemplate, countGuests, BadgeError, LIMITS, inchText, tidy } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'name-tag-generator';
const $ = (id) => document.getElementById(id);

const DATA = JSON.parse($('nt-data').textContent);
const engine = makeEngine(DATA);

// The worked example at rest: the tool's own sample list (tool.js SAMPLE_CSV; a test checks they match).
export const SAMPLE_CSV = [
  'First Name,Last Name,Company,Job Title,Pronouns,Ticket Type',
  'Ana,Ruiz,Lakeside Clinic,Practice Manager,she/her,Speaker',
  'BEN,OKAFOR,Northgate Depot,Operations Lead,,Attendee',
  'Chloé,Dubois,Riverside Bank,Analyst,,Attendee',
  'Maximiliana,Featherstonehaugh-Worthington,Acme Supply,Regional Director of Partnerships,,Sponsor',
  'dev,patel,,Volunteer,he/him,Volunteer',
  ',,,,,',
  'Grace,O\'Neil,County Library,Librarian,,Attendee',
  'Ana,Ruiz,Lakeside Clinic,Practice Manager,she/her,Speaker',
  'Sean,McDonald,Acme Supply,Buyer,,Attendee',
  'Li,Wei,Northgate Depot,Engineer,,Attendee',
].join('\r\n');

let fileText = null; // a long file read from disk, kept here rather than in the textarea
let signedIn = false;
let sheetShown = 1;
let lastPlan = null;

const money = (micros) => `$${(micros / 1_000_000).toFixed(2)}`;
const PRICE = { badge: 10_000, min: 990_000, walkin: 100_000 };

// ---------- the form ----------

function fillProducts() {
  const sel = $('nt-product');
  for (const t of DATA.templates) {
    const also = t.compatible.length ? ` (also ${t.compatible.slice(0, 3).join(', ')}${t.compatible.length > 3 ? ', ...' : ''})` : '';
    sel.append(h('option', { value: t.template }, `${t.template}: ${t.name.toLowerCase()}, ${t.nominal.replace(/"/g, ' in')}, ${t.perSheet} per sheet${also}`));
  }
  const body = $('nt-templates').querySelector('tbody');
  for (const t of DATA.templates) {
    body.append(h('tr', {}, [h('th', {}, t.template), h('td', {}, `${t.name}, ${t.nominal.replace(/"/g, ' in')}`), h('td', { class: 'num' }, String(t.perSheet)), h('td', {}, t.compatible.join(', ') || 'none listed')]));
  }
  const src = $('nt-sources');
  src.textContent = '';
  DATA.templates.forEach((t, i) => src.append(i ? ', ' : '', h('a', { href: t.source.page, class: 'ul' }, `Avery ${t.template}`)));
  src.append('.');
}

function template() {
  return DATA.templates.find((t) => t.template === $('nt-product').value) ?? DATA.templates[0];
}

function fillPositions() {
  const t = template();
  for (const [id, keep] of [['nt-start', $('nt-start').value], ['nt-w-pos', $('nt-w-pos').value]]) {
    const sel = $(id);
    sel.textContent = '';
    for (let i = 1; i <= t.perSheet; i++) sel.append(h('option', { value: String(i) }, `Label ${i}${i === 1 ? ' (top left)' : ''}`));
    sel.value = keep && Number(keep) <= t.perSheet ? keep : '1';
  }
}

const listText = () => (fileText ?? $('nt-paste').value);
const style = () => document.querySelector('input[name="style"]:checked').value;
const numberIn = (id, lo, hi) => {
  const n = Number($(id).value);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : 0;
};

// The number as the visitor typed it, when Avery lists it for the chosen template (the answer
// then says "Avery 8395 (template 5395)"); otherwise the template's own number.
function productAsked() {
  const typed = $('nt-number').value.trim();
  const found = typed ? findTemplate(DATA.templates, typed) : null;
  return found && found.template.template === template().template ? typed : template().template;
}

function options() {
  const event = tidy($('nt-event').value);
  const nudge = { right: numberIn('nt-right', -LIMITS.nudge, LIMITS.nudge), down: numberIn('nt-down', -LIMITS.nudge, LIMITS.nudge) };
  return {
    product: productAsked(),
    event: event || 'My event',
    header: $('nt-header').checked ? event : '',
    style: style(),
    sort: $('nt-sort').value,
    startAt: Number($('nt-start').value) || 1,
    spares: Math.round(numberIn('nt-spares', 0, LIMITS.spares)),
    show: { org: $('nt-show-org').checked, title: $('nt-show-title').checked, pronouns: $('nt-show-pronouns').checked, extra: $('nt-show-extra').checked },
    fixNames: $('nt-fix').checked,
    removeDuplicates: $('nt-dedupe').checked,
    outlines: $('nt-outlines').checked,
    ...(nudge.right || nudge.down ? { nudge } : {}),
  };
}

const batchInput = () => ({ op: 'batch', csv: listText(), ...options() });

// ---------- the preview ----------

const SVG = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}, kids = []) => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const k of kids) el.append(k);
  return el;
};

// One sheet drawn to scale: the sheet, every label, and the badges on it.
function sheetSvg(p, sheet) {
  const t = p.template;
  const nudge = p.o.nudge;
  const root = svg('svg', { viewBox: `0 0 ${t.sheet.w} ${t.sheet.h}`, class: 'nt-sheet', role: 'img', 'aria-label': `Sheet ${sheet} of ${p.maths.sheets}, Avery ${t.template}` });
  root.append(svg('rect', { x: 0, y: 0, width: t.sheet.w, height: t.sheet.h, class: 'nt-paper' }));
  const onSheet = new Map(p.badges.filter((b) => b.sheet === sheet).map((b) => [b.label, b]));
  t.labels.forEach(([x, y], i) => {
    const b = onSheet.get(i + 1);
    const skipped = sheet === 1 && i + 1 < p.o.startAt;
    root.append(svg('rect', { x, y, width: t.label.w, height: t.label.h, rx: 6, class: skipped ? 'nt-label nt-used' : b ? 'nt-label' : 'nt-label nt-blank' }));
    if (skipped) root.append(svg('text', { x: x + t.label.w / 2, y: y + t.label.h / 2, class: 'nt-note', 'text-anchor': 'middle' }, ['already used']));
    if (!b) return;
    const g = svg('g', { transform: `translate(${x + nudge.right * 72} ${y + nudge.down * 72})` });
    for (const piece of b.texts) {
      g.append(svg('text', { x: piece.x, y: piece.y, 'font-size': piece.size, 'font-weight': piece.bold ? 700 : 400, fill: piece.gray ? `rgb(${Math.round(piece.gray * 255)} ${Math.round(piece.gray * 255)} ${Math.round(piece.gray * 255)})` : '#000', class: 'nt-ink' }, [piece.text]));
    }
    if (b.flags.length) g.append(svg('circle', { cx: t.label.w - 10, cy: 10, r: 5, class: 'nt-flag-dot' }));
    root.append(g);
  });
  return root;
}

const FLAG_WORDS = {
  cut: (f) => `the ${f.field === 'name' ? 'name' : f.field} is cut to "${f.printed}"`,
  wrapped: () => 'the name is on two lines',
  characters: (f) => `prints as "${f.printed}" (letters outside the standard font)`,
};

function render() {
  const box = $('nt-out');
  $('nt-list-err').textContent = '';
  let p;
  try {
    const input = { ...options(), csv: listText() };
    p = engine.plan(input);
    lastPlan = p;
  } catch (e) {
    if (!(e instanceof BadgeError)) throw e;
    lastPlan = null;
    $('nt-list-err').textContent = e.message;
    box.replaceChildren(h('p', { class: 'muted' }, 'The preview shows here once the list has a name column.'));
    updateCost();
    return;
  }
  const s = engine.summary(p, { event: options().event });
  if (sheetShown > p.maths.sheets) sheetShown = 1;
  const t = p.template;
  const facts = [
    ['Badges', String(s.guests + s.spares)],
    ['Sheets', String(s.sheets)],
    ['Blank on the last sheet', String(s.lastSheetBlank)],
    ['Name sizes', s.nameSizes ? `${s.nameSizes.smallest} to ${s.nameSizes.largest} pt` : 'none'],
  ];
  const notes = [];
  if (s.columnsUsed) notes.push(`Columns read: ${Object.entries(s.columnsUsed).map(([f, c]) => `${c} (${{ first: 'first name', last: 'last name', full: 'name', org: 'organization', title: 'job title', pronouns: 'pronouns', extra: 'ticket type' }[f]})`).join(', ')}.${s.columnsIgnored.length ? ` Not used: ${s.columnsIgnored.join(', ')}.` : ''}`);
  if (s.duplicates.length) notes.push(`${s.duplicates.length === 1 ? 'One guest is' : `${s.duplicates.length} guests are`} listed twice (${s.duplicates.map((d) => `row ${d.row} repeats row ${d.sameAs}`).join('; ')})${s.duplicates[0].removed ? ' and left out.' : '. Tick "Leave out repeated guests" to drop the repeats.'}`);
  if (s.skipped.length) notes.push(`Skipped with no name: row ${s.skipped.map((x) => x.row).join(', ')}.`);
  if (s.shrunk) notes.push(`${s.shrunk === 1 ? 'One name was' : `${s.shrunk} names were`} made smaller to fit; the rest are at the largest size.`);
  const pager = p.maths.sheets > 1 ? h('div', { class: 'nt-pager' }, [
    h('button', { type: 'button', class: 'btn btn-quiet btn-small', disabled: sheetShown === 1 ? '' : null, onclick: () => { sheetShown -= 1; render(); } }, 'Previous sheet'),
    h('span', {}, `Sheet ${sheetShown} of ${p.maths.sheets}`),
    h('button', { type: 'button', class: 'btn btn-quiet btn-small', disabled: sheetShown === p.maths.sheets ? '' : null, onclick: () => { sheetShown += 1; render(); } }, 'Next sheet'),
  ]) : null;
  box.replaceChildren(
    h('p', { class: 'nt-tag' }, `Avery ${t.template}, ${inchText(t.label.w)} x ${inchText(t.label.h)}`),
    h('p', { class: 'nt-answer' }, s.answer),
    h('dl', { class: 'nt-facts' }, facts.map(([k, v]) => h('div', {}, [h('dt', {}, k), h('dd', { class: 'num' }, v)]))),
    pager,
    h('div', { class: 'nt-sheet-box' }, [sheetSvg(p, sheetShown)]),
    s.flagged.length ? h('div', { class: 'nt-flags' }, [
      h('p', { class: 'nt-heading' }, `Check ${s.flagged.length === 1 ? 'one badge' : `${s.flagged.length} badges`} before printing`),
      h('ul', {}, s.flagged.slice(0, 20).map((f) => h('li', {}, `${f.name || 'Spare badge'}${f.row ? ` (row ${f.row})` : ''}: ${f.flags.map((x) => FLAG_WORDS[x.kind](x)).join('; ')}.`))),
    ]) : h('p', { class: 'nt-ok' }, 'Every name fits on its badge.'),
    ...notes.map((n) => h('p', { class: 'nt-aside' }, n)),
  );
  updateCost();
}

function updateCost() {
  const el = $('nt-cost');
  if (!lastPlan) { el.textContent = ''; return; }
  const units = countGuests({ csv: listText(), removeDuplicates: $('nt-dedupe').checked }) + lastPlan.o.spares;
  const price = Math.max(PRICE.min, units * PRICE.badge);
  const words = `${units} ${units === 1 ? 'badge' : 'badges'}: ${money(price)}${units * PRICE.badge < PRICE.min ? ' (the event minimum)' : ''}. A reprint for the same event name within 30 days is free.`;
  el.textContent = signedIn ? words : `${words} Sign in to download; the preview and the test page are free.`;
}

// ---------- downloads ----------

function base64Bytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const pdfLink = (pdf) => h('a', { href: URL.createObjectURL(new Blob([base64Bytes(pdf.base64)], { type: 'application/pdf' })), download: pdf.filename }, pdf.filename);

function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'No charge.';
  if (typeof json.freeRunsLeft === 'number') return `Free. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  return '';
}

function errorInto(box, e) {
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

async function runInto(button, input, errBox, outBox, deliver) {
  errBox.textContent = '';
  button.disabled = true;
  try {
    const json = await T.run(SLUG, input);
    outBox.replaceChildren(...deliver(json.result), ` ${costNote(json)}`);
  } catch (e) {
    errorInto(errBox, e);
  } finally {
    button.disabled = false;
  }
}

async function onBuy(ev) {
  ev.preventDefault();
  if (!lastPlan) { $('nt-error').textContent = 'Fix the list first: see the message under it.'; return; }
  if (listText().length > LIMITS.csvChars) { $('nt-error').textContent = `This list is over ${LIMITS.csvChars.toLocaleString('en-US')} characters; split it into two events or two files.`; return; }
  await runInto($('nt-buy'), batchInput(), $('nt-error'), $('nt-got'), (r) => ['Your badges: ', pdfLink(r.pdf), '. Check-in list: ', pdfLink(r.checkIn), '.']);
}

async function onTest() {
  const o = options();
  await runInto($('nt-test'), { op: 'test', product: o.product, ...(o.nudge ? { nudge: o.nudge } : {}) }, $('nt-error'), $('nt-got'), (r) => ['Alignment test: ', pdfLink(r.pdf), '. Print it on plain paper at 100%.']);
}

async function onWalkin(ev) {
  ev.preventDefault();
  const o = options();
  const g = { first: tidy($('nt-w-first').value), last: tidy($('nt-w-last').value), org: tidy($('nt-w-org').value), title: tidy($('nt-w-title').value) };
  for (const k of Object.keys(g)) if (!g[k]) delete g[k];
  const input = { op: 'walkin', product: o.product, event: o.event, position: Number($('nt-w-pos').value) || 1, guests: [g], style: o.style, header: o.header, show: o.show, fixNames: o.fixNames, outlines: o.outlines, ...(o.nudge ? { nudge: o.nudge } : {}) };
  try { engine.walkin(input); } catch (e) {
    if (e instanceof BadgeError) { $('nt-w-error').textContent = e.message; return; }
    throw e;
  }
  await runInto($('nt-w-run'), input, $('nt-w-error'), $('nt-w-out'), (r) => [r.answer, ' ', pdfLink(r.pdf), '.']);
}

// ---------- files ----------

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
      cells[colIndex(c.getAttribute('r') ?? 'A')] = value;
    }
    grid.push(Array.from(cells, (x) => x ?? ''));
  }
  const field = (v) => (/[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return grid.filter((r) => r.some((x) => String(x).trim() !== '')).map((r) => r.map((x) => field(String(x))).join(',')).join('\r\n');
}

async function onFile() {
  const f = $('nt-upload').files[0];
  if (!f) return;
  try {
    const text = /\.xlsx$/i.test(f.name) ? await xlsxToCsv(await f.arrayBuffer()) : await f.text();
    const long = text.length > 20_000;
    fileText = long ? text : null;
    $('nt-paste').value = long ? '' : text;
    $('nt-paste').placeholder = long ? `${f.name} is open (too long to show here).` : '';
    sheetShown = 1;
    render();
  } catch (e) {
    $('nt-list-err').textContent = e.message;
  }
}

// ---------- inputs from the address ----------

// Links from the reference pages carry settings (?product=5392&style=first-only&startAt=3&spares=4
// &event=...&names=Ana Ruiz|Lakeside Clinic;Ben Okafor). Anything unusable is ignored.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const product = q.get('product');
  if (product) {
    const found = findTemplate(DATA.templates, product);
    if (found) { $('nt-product').value = found.template.template; if (found.alias) $('nt-number').value = found.asked; }
  }
  fillPositions();
  if (q.get('style') && document.querySelector(`input[name="style"][value="${CSS.escape(q.get('style'))}"]`)) document.querySelector(`input[name="style"][value="${CSS.escape(q.get('style'))}"]`).checked = true;
  if (q.get('event')) $('nt-event').value = q.get('event').slice(0, 80);
  const start = Number(q.get('startAt'));
  if (Number.isInteger(start) && start >= 1 && start <= template().perSheet) $('nt-start').value = String(start);
  const spares = Number(q.get('spares'));
  if (Number.isInteger(spares) && spares >= 0 && spares <= LIMITS.spares) $('nt-spares').value = String(spares);
  const names = q.get('names');
  if (names) {
    const rows = names.split(';').map((x) => x.split('|').map((s) => tidy(s).replace(/"/g, ''))).filter((r) => r[0]).slice(0, 200);
    if (rows.length) $('nt-paste').value = ['Name,Company', ...rows.map(([n, o]) => `"${n}","${o ?? ''}"`)].join('\r\n');
  }
}

function onNumber() {
  const v = $('nt-number').value.trim();
  const hint = $('nt-number-hint');
  if (!v) { hint.textContent = ''; return; }
  const found = findTemplate(DATA.templates, v);
  if (!found) { hint.textContent = `${v} is not one of the badge templates here.`; return; }
  $('nt-product').value = found.template.template;
  hint.textContent = found.alias ? `Avery lists ${found.asked} as using template ${found.template.template}: same size and positions.` : '';
  fillPositions();
  render();
}

// ---------- start ----------

fillProducts();
$('nt-paste').value = SAMPLE_CSV;
fromQuery();
render();
T.me().then((account) => { signedIn = !!account; updateCost(); }).catch(() => {});

let timer = null;
const later = () => { clearTimeout(timer); timer = setTimeout(render, 150); };
$('nt-paste').addEventListener('input', () => { fileText = null; later(); });
$('nt-upload').addEventListener('change', onFile);
$('nt-product').addEventListener('change', () => { $('nt-number').value = ''; $('nt-number-hint').textContent = ''; fillPositions(); sheetShown = 1; render(); });
$('nt-number').addEventListener('change', onNumber);
for (const id of ['nt-event', 'nt-header', 'nt-sort', 'nt-start', 'nt-spares', 'nt-show-org', 'nt-show-title', 'nt-show-pronouns', 'nt-show-extra', 'nt-fix', 'nt-dedupe', 'nt-outlines', 'nt-right', 'nt-down']) {
  $(id).addEventListener('input', later);
  $(id).addEventListener('change', later);
}
for (const r of document.querySelectorAll('input[name="style"]')) r.addEventListener('change', render);
$('nt-form').addEventListener('submit', onBuy);
$('nt-test').addEventListener('click', onTest);
$('nt-walkin-form').addEventListener('submit', onWalkin);

