// The certificate page. core.js (the same file the server runs) reads the list and lays out every
// certificate here in the browser, so the preview is instant and the list stays on the page. The
// free proof PDF is written here too, from the same scenes. Only the clean PDF goes through
// Endwise.run: the list is sent once, priced by the tool's rules and not kept.
import { plan, summary, pdfBytes, countCertificates, textWidth, CertError, DESIGNS, DESIGN_KEYS, FONTS, LIMITS, fileSlug, tidy } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'bulk-certificate-generator';
const $ = (id) => document.getElementById(id);

// The worked example at rest: the tool's own sample list (tool.js SAMPLE_CSV; a test checks they match).
export const SAMPLE_CSV = [
  'Student,Award,Homeroom',
  'Ana Ruiz,Most Improved Reader,Room 12',
  'BEN OKAFOR,Math Whiz,Room 12',
  '"Dubois, Chloé",Kindness Award,Room 14',
  'Maximiliana Featherstonehaugh-Worthington,Science Star,Room 14',
  'dev patel,Perfect Attendance,Room 12',
  ',,',
  "Grace O'Neil,Math Whiz,Room 14",
  "Grace O'Neil,Art Star,Room 14",
  'Ana Ruiz,Most Improved Reader,Room 12',
].join('\r\n');
const START = { design: 'end-of-year', org: 'Lakeside Elementary School', date: 'June 11, 2027', s1: 'Ms. Grace Lee', r1: 'Teacher', s2: 'Dr. Sam Patel', r2: 'Principal', batch: 'Lakeside end of year 2027' };

let fileText = null; // a long file read from disk, kept here rather than in the textarea
let signedIn = false;
let shown = 1;
let lastPlan = null;

const money = (micros) => `$${(micros / 1_000_000).toFixed(2)}`;
const PRICE = { each: 10_000, min: 990_000, cap: 9_990_000 };

// ---------- the form ----------

function fillDesigns() {
  const sel = $('bc-design');
  for (const k of DESIGN_KEYS) sel.append(h('option', { value: k }, DESIGNS[k].label));
}

// The design's own wording in the three wording boxes.
function fillWording() {
  const d = DESIGNS[$('bc-design').value];
  $('bc-title').value = d.title;
  $('bc-presented').value = d.presented;
  $('bc-reason').value = d.reason;
}

const listText = () => (fileText ?? $('bc-paste').value);

function options() {
  const signers = [[$('bc-s1').value, $('bc-r1').value], [$('bc-s2').value, $('bc-r2').value]]
    .map(([name, role]) => ({ name: tidy(name), role: tidy(role) })).filter((s) => s.name || s.role);
  const o = {
    design: $('bc-design').value,
    paper: $('bc-paper').value,
    orientation: $('bc-orientation').value,
    title: tidy($('bc-title').value),
    presented: tidy($('bc-presented').value),
    reason: tidy($('bc-reason').value),
    org: tidy($('bc-org').value),
    date: tidy($('bc-date').value),
    sort: $('bc-sort').value,
    fixNames: $('bc-fix').checked,
    removeDuplicates: $('bc-dedupe').checked,
  };
  if (signers.length) o.signers = signers;
  return o;
}
const batchName = () => tidy($('bc-batch').value) || 'Certificates';

// ---------- the preview ----------

const SVG = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}, kids = []) => {
  const el = document.createElementNS(SVG, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
  for (const k of kids) el.append(k);
  return el;
};
const css = (c) => `rgb(${c.map((x) => Math.round(x * 255)).join(' ')})`;
const grey = (g) => css([g, g, g]);

// One certificate's scene drawn as SVG. Each text is stretched to the width the PDF gives it
// (textLength), so the preview breaks and fits lines exactly as the print will.
function sceneSvg(scene, label) {
  const root = svg('svg', { viewBox: `0 0 ${scene.w} ${scene.h}`, class: 'bc-page', role: 'img', 'aria-label': label });
  root.append(svg('rect', { x: 0, y: 0, width: scene.w, height: scene.h, fill: '#fff' }));
  for (const it of scene.items) {
    const paint = { fill: it.fill ? css(it.fill) : 'none', stroke: it.stroke ? css(it.stroke) : 'none', 'stroke-width': it.width ?? 1, ...(it.dash ? { 'stroke-dasharray': it.dash.join(' ') } : {}) };
    if (it.k === 'rect') root.append(svg('rect', { x: it.x, y: it.y, width: it.w, height: it.h, ...paint }));
    else if (it.k === 'line') root.append(svg('line', { x1: it.x1, y1: it.y1, x2: it.x2, y2: it.y2, ...paint }));
    else if (it.k === 'poly') root.append(svg('polygon', { points: it.pts.map((p) => p.join(',')).join(' '), ...paint }));
    else if (it.k === 'circle') root.append(svg('circle', { cx: it.cx, cy: it.cy, r: it.r, ...paint }));
    else if (it.k === 'text') {
      const attrs = { x: it.x, y: it.y, 'font-size': it.size, style: FONTS[it.font].css, fill: it.color ? css(it.color) : grey(it.gray ?? 0), 'text-anchor': it.align === 'center' ? 'middle' : it.align === 'right' ? 'end' : 'start' };
      if (it.rotate) Object.assign(attrs, { transform: `rotate(${it.rotate} ${it.x} ${it.y})`, opacity: it.alpha ? 0.55 : 1 });
      else Object.assign(attrs, { textLength: Math.round(textWidth(it.s, it.size, it.font) * 100) / 100, lengthAdjust: 'spacingAndGlyphs' });
      root.append(svg('text', attrs, [it.s]));
    }
  }
  return root;
}

const FLAG_WORDS = {
  shrunk: (f) => `the name is made smaller to fit (${f.size} pt)`,
  wrapped: () => 'the name is on two lines',
  cut: (f) => `the ${f.field} is cut to "${f.printed}"`,
  characters: (f) => `the ${f.field} prints as "${f.printed}" (letters outside the standard fonts)`,
  empty: (f) => `the row has no ${f.field} for {${f.field}}`,
};
const FIELD_WORDS = { first: 'first name', last: 'last name', full: 'name', award: 'award', detail: 'hours or course', group: 'homeroom or class' };

function render() {
  const box = $('bc-out');
  $('bc-list-err').textContent = '';
  let p;
  try {
    p = plan({ ...options(), csv: listText() });
    lastPlan = p;
  } catch (e) {
    if (!(e instanceof CertError)) throw e;
    lastPlan = null;
    $('bc-list-err').textContent = e.message;
    box.replaceChildren(h('p', { class: 'muted' }, 'The preview shows here once the list has a name column.'));
    updateCost();
    return;
  }
  const s = summary(p);
  const n = p.certificates.length;
  if (shown > n) shown = 1;
  const c = p.certificates[shown - 1];
  // One line per figure, each with where it comes from.
  const facts = [
    ['Certificates', String(n), `one page each, from the ${n === 1 ? 'name' : 'names'} in the list`],
    ['Paper', `${p.o.paper === 'a4' ? 'A4' : 'Letter'}, ${p.o.orientation}`, 'your choice; lines stay half an inch inside the edge'],
    ['Name sizes', s.nameSizes.smallest === s.nameSizes.largest ? `${s.nameSizes.largest} pt` : `${s.nameSizes.smallest} to ${s.nameSizes.largest} pt`, 'each name measured with the font\'s own widths'],
  ];
  const isSample = listText().replace(/\r\n/g, '\n') === SAMPLE_CSV.replace(/\r\n/g, '\n');
  const notes = [];
  if (s.columnsUsed) notes.push(`Columns read: ${Object.entries(s.columnsUsed).map(([f, col]) => `${col} (${FIELD_WORDS[f]})`).join(', ')}.${s.columnsIgnored.length ? ` Not used: ${s.columnsIgnored.join(', ')}.` : ''}`);
  if (s.duplicates.length) notes.push(`${s.duplicates.length === 1 ? 'One row repeats' : `${s.duplicates.length} rows repeat`} an earlier one (${s.duplicates.map((d) => `row ${d.row} repeats row ${d.sameAs}`).join('; ')})${s.duplicates[0].removed ? ' and is left out.' : '. Tick "Leave out repeated rows" under More options to drop it.'}`);
  if (s.skipped.length) notes.push(`Skipped with no name: row ${s.skipped.map((x) => x.row).join(', ')}.`);
  const pager = n > 1 ? h('div', { class: 'bc-pager' }, [
    h('button', { type: 'button', class: 'btn btn-quiet btn-small', disabled: shown === 1 ? '' : null, onclick: () => { shown -= 1; render(); } }, 'Previous'),
    h('span', {}, `Certificate ${shown} of ${n}: ${c.person.name}`),
    h('button', { type: 'button', class: 'btn btn-quiet btn-small', disabled: shown === n ? '' : null, onclick: () => { shown += 1; render(); } }, 'Next'),
  ]) : null;
  box.replaceChildren(
    isSample ? h('div', { class: 'dz-rh' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', { class: 'dz-wx' }, 'Worked example')]) : h('div', { class: 'dz-rh' }, h('span', { class: 'dz-wx' }, DESIGNS[p.o.design].label)),
    isSample ? h('p', { class: 'dz-exin' }, `Example: ${START.org}'s ${DESIGNS[p.o.design].label.toLowerCase()} list, with a repeated row and a long name`) : null,
    h('p', { class: 'bc-answer' }, s.answer),
    h('ol', { class: 'dz-items' }, facts.map(([k, v, src]) => h('li', {}, [h('b', {}, k), h('span', {}, v), h('small', {}, src)]))),
    pager,
    h('div', { class: `bc-page-box${p.o.orientation === 'portrait' ? ' bc-portrait' : ''}` }, [sceneSvg(c, `Certificate ${shown} of ${n} for ${c.person.name}`)]),
    s.flagged.length ? h('div', { class: 'bc-flags' }, [
      h('p', { class: 'bc-heading' }, `Check ${s.flagged.length === 1 ? 'one certificate' : `${s.flagged.length} certificates`} before printing`),
      h('ul', {}, s.flagged.slice(0, 30).map((f) => h('li', {}, [
        h('button', { type: 'button', class: 'linklike', onclick: () => { shown = f.page; render(); } }, `${f.name} (page ${f.page}, row ${f.row})`),
        `: ${f.flags.map((x) => FLAG_WORDS[x.kind](x)).join('; ')}.`,
      ]))),
    ]) : h('p', { class: 'bc-ok' }, 'Every name fits its line at the full size.'),
    ...notes.map((x) => h('p', { class: 'bc-aside' }, x)),
  );
  updateCost();
}

function updateCost() {
  const el = $('bc-cost');
  if (!lastPlan) { el.textContent = ''; return; }
  const units = countCertificates({ csv: listText(), removeDuplicates: $('bc-dedupe').checked });
  const price = Math.min(PRICE.cap, Math.max(PRICE.min, units * PRICE.each));
  const words = `${units} ${units === 1 ? 'certificate' : 'certificates'}: ${money(price)}${units * PRICE.each < PRICE.min ? ' (the batch minimum)' : ''}. A reprint of the same batch name within 30 days is free; a month's total never passes ${money(PRICE.cap)}.`;
  el.textContent = signedIn ? words : `${words} Sign in to download; the preview and the proof are free.`;
}

// ---------- downloads ----------

function base64Bytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const pdfLink = (bytes, filename) => h('a', { href: URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' })), download: filename }, filename);

function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'No charge.';
  return '';
}

function errorInto(box, e) {
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

// The proof: watermarked, written in this browser from the same scenes. Nothing is sent.
function onProof() {
  $('bc-error').textContent = '';
  let p;
  try { p = plan({ ...options(), csv: listText() }, { proof: true }); } catch (e) {
    if (!(e instanceof CertError)) throw e;
    $('bc-error').textContent = e.message;
    return;
  }
  const bytes = pdfBytes(p.certificates, { title: `${batchName()} (proof)` });
  $('bc-got').replaceChildren('Your proof (made in this browser, nothing sent): ', pdfLink(bytes, `${fileSlug(batchName())}-proof.pdf`), '.');
}

async function onBuy(ev) {
  ev.preventDefault();
  $('bc-error').textContent = '';
  if (!lastPlan) { $('bc-error').textContent = 'Fix the list first: see the message under it.'; return; }
  if (listText().length > LIMITS.csvChars) { $('bc-error').textContent = `This list is over ${LIMITS.csvChars.toLocaleString('en-US')} characters; split it into two batches.`; return; }
  const button = $('bc-buy');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, { op: 'batch', batch: batchName(), csv: listText(), ...options() });
    const r = json.result;
    $('bc-got').replaceChildren('Your certificates: ', pdfLink(base64Bytes(r.pdf.base64), r.pdf.filename), `. ${costNote(json)}`);
  } catch (e) {
    errorInto($('bc-error'), e);
  } finally {
    button.disabled = false;
  }
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
  const f = $('bc-upload').files[0];
  if (!f) return;
  try {
    const text = /\.xlsx$/i.test(f.name) ? await xlsxToCsv(await f.arrayBuffer()) : await f.text();
    const long = text.length > 20_000;
    fileText = long ? text : null;
    $('bc-paste').value = long ? '' : text;
    $('bc-paste').placeholder = long ? `${f.name} is open (too long to show here).` : '';
    shown = 1;
    render();
  } catch (e) {
    $('bc-list-err').textContent = e.message;
  }
}

// ---------- inputs from the address ----------

// Links from the reference pages carry settings (?design=funny&paper=a4&orientation=portrait
// &title=...&reason=...&org=...&date=...&batch=...&sort=group&names=Ana Ruiz|Math Whiz;Ben Okafor).
// Anything unusable is ignored.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const design = q.get('design');
  if (design && DESIGNS[design]) $('bc-design').value = design;
  fillWording();
  if (q.get('paper') === 'a4' || q.get('paper') === 'letter') $('bc-paper').value = q.get('paper');
  if (q.get('orientation') === 'portrait' || q.get('orientation') === 'landscape') $('bc-orientation').value = q.get('orientation');
  for (const [key, id, max] of [['title', 'bc-title', 80], ['presented', 'bc-presented', 100], ['reason', 'bc-reason', 300], ['org', 'bc-org', 100], ['date', 'bc-date', 60], ['batch', 'bc-batch', 80]]) {
    if (q.has(key)) $(id).value = q.get(key).slice(0, max);
  }
  const sort = q.get('sort');
  if (sort && [...$('bc-sort').options].some((o) => o.value === sort)) $('bc-sort').value = sort;
  const names = q.get('names');
  if (names) {
    const rows = names.split(';').map((x) => x.split('|').map((s) => tidy(s).replace(/"/g, ''))).filter((r) => r[0]).slice(0, 200);
    if (rows.length) {
      const hasAward = rows.some((r) => r[1]);
      $('bc-paste').value = [hasAward ? 'Name,Award' : 'Name', ...rows.map(([n, a]) => (hasAward ? `"${n}","${a ?? ''}"` : `"${n}"`))].join('\r\n');
    }
  }
}

// ---------- start ----------

fillDesigns();
$('bc-design').value = START.design;
$('bc-paste').value = SAMPLE_CSV;
for (const [k, id] of [['org', 'bc-org'], ['date', 'bc-date'], ['s1', 'bc-s1'], ['r1', 'bc-r1'], ['s2', 'bc-s2'], ['r2', 'bc-r2'], ['batch', 'bc-batch']]) $(id).value = START[k];
$('bc-sort').value = 'group';
fromQuery();
render();
T.me().then((account) => { signedIn = !!account; updateCost(); }).catch(() => {});

let timer = null;
const later = () => { clearTimeout(timer); timer = setTimeout(render, 150); };
$('bc-paste').addEventListener('input', () => { fileText = null; later(); });
$('bc-upload').addEventListener('change', onFile);
$('bc-design').addEventListener('change', () => { fillWording(); render(); });
for (const id of ['bc-paper', 'bc-orientation', 'bc-title', 'bc-presented', 'bc-reason', 'bc-org', 'bc-date', 'bc-s1', 'bc-r1', 'bc-s2', 'bc-r2', 'bc-sort', 'bc-fix', 'bc-dedupe']) {
  $(id).addEventListener('input', later);
  $(id).addEventListener('change', later);
}
$('bc-form').addEventListener('submit', onBuy);
$('bc-proof').addEventListener('click', onProof);
