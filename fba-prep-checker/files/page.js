// The FBA prep checker page. core.js (the same file the server runs) checks one product here in the
// browser from the rule data embedded in the page (the same file the server reads; a test checks
// they are equal), so the single check is free, instant and private. Lists, FNSKU label PDFs and the
// free label sheets are the server's answer to the same input, through Endwise.run.
import { makeEngine, TYPES, sheetName, sheetLayout, readFnsku, PrepError, inText, lbText } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'fba-prep-checker';
const $ = (id) => document.getElementById(id);

const DATA = JSON.parse($('fp-data').textContent);
const engine = makeEngine(DATA);
let signedIn = false;

// The worked example at rest (tool.js SAMPLE_PRODUCT; a test checks they match).
export const SAMPLE_CSV = [
  'sku,name,types,length,width,height,weight,weight_unit,seller,volume,container,lid',
  'TS-BLK-M,Cotton T-shirt black M,apparel,10,8,1,6,oz,reseller,,,',
  'LOT-16,Shea body lotion 16 fl oz,liquid,7,2.6,2.6,1.2,lb,brand,16,pump,',
  'MUG-2,Ceramic mug set of 2,fragile|set,9,5,4.5,1.9,lb,reseller,,,',
  'KNF-8,Chef knife 8 in,sharp,13,2,1,8,oz,reseller,,,',
  'EAR-01,Stud earrings,jewelry,1.5,1,0.4,0.4,oz,reseller,,,',
].join('\r\n');

// ---------- the form ----------

const SHOWN_TYPES = ['apparel', 'apparel-hanger', 'baby', 'liquid', 'fragile', 'granular', 'perforated', 'sharp', 'set', 'adult', 'jewelry', 'footwear', 'book', 'battery', 'scented', 'leather', 'vinyl', 'collectible', 'premium', 'expiring'];
function fillTypes() {
  $('fp-types').replaceChildren(...SHOWN_TYPES.map((id) => h('label', { class: 'check' }, [h('input', { type: 'checkbox', value: id, name: 'type', ...(id === 'apparel' ? { checked: '' } : {}) }), h('span', {}, TYPES[id])])));
  $('fp-shelf').append(...DATA.expiry.shelfLife.map((s) => h('option', { value: s.id }, `${s.product} (${s.days} days)`)));
  $('fp-sizes').replaceChildren(...DATA.bag.printSizes.map((r) => h('tr', {}, [h('td', {}, r.label), h('td', { class: 'num' }, `${r.pt} point`)])));
  $('fp-sources').replaceChildren(...Object.values(DATA.sources).flatMap((s, i) => [i ? '; ' : '', h('a', { href: s.url, rel: 'noopener' }, s.title)]));
  const sheets = DATA.labels.sheets.filter((s) => sheetLayout(s));
  $('fp-stock').replaceChildren(
    ...sheets.map((s) => h('option', { value: `sheet:${s.id}`, ...(s.id === 'letter-30' ? { selected: '' } : {}) }, sheetName(s))),
    ...[[2.25, 1.25], [2, 1], [3, 2], [2, 2], [3, 1]].map(([w, ht]) => h('option', { value: `thermal:${w}x${ht}` }, `Thermal ${w} x ${ht} in`)),
  );
}

const types = () => [...document.querySelectorAll('input[name="type"]:checked')].map((x) => x.value);
const numOf = (id) => {
  const v = $(id).value.trim();
  if (v === '') return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

function productInput() {
  const p = { name: $('fp-name').value.trim() || undefined, types: types() };
  const L = numOf('fp-l');
  const W = numOf('fp-w');
  const H = numOf('fp-h');
  if (L && W && H) p.dims = { length: L, width: W, height: H, unit: $('fp-du').value };
  const wt = numOf('fp-wt');
  if (wt) p.weight = { value: wt, unit: $('fp-wu').value };
  const seller = $('fp-seller').value;
  if (seller) p.barcode = { seller, ...(seller === 'brand' ? { manufacturerBarcode: true } : {}) };
  if (p.types.includes('liquid')) {
    p.liquid = { container: $('fp-cont').value, lid: $('fp-lid').value, secondarySeal: $('fp-seal').checked, locking: $('fp-lock').checked, hazmat: $('fp-haz').checked, fragileContainer: $('fp-glass').checked };
    const vol = numOf('fp-vol');
    if (vol) { p.liquid.volume = vol; p.liquid.unit = $('fp-volu').value; }
  }
  if (p.types.some((t) => ['fragile', 'premium', 'collectible'].includes(t))) p.dropTest = $('fp-dropv').value;
  const bw = numOf('fp-bw');
  const bl = numOf('fp-bl');
  if (bw && bl) p.bag = { width: bw, length: bl, unit: $('fp-du').value };
  const mil = numOf('fp-mil');
  if (mil && p.bag) p.bag.mil = mil;
  if ($('fp-printed').checked && p.bag) p.bag.warningPrinted = true;
  const exp = $('fp-exp').value.trim();
  const shelf = $('fp-shelf').value;
  if (exp || shelf) p.expiry = { ...(exp ? { date: exp } : {}), ...(shelf ? { product: shelf } : {}) };
  const upb = Number($('fp-upb').value);
  if (Number.isInteger(upb) && upb > 0) p.unitsPerBox = upb;
  return p;
}

function syncSections() {
  const t = types();
  $('fp-liquid').hidden = !t.includes('liquid');
  $('fp-drop').hidden = !t.some((x) => ['fragile', 'premium', 'collectible'].includes(x));
}

// ---------- the answer ----------

const srcLink = (s) => h('a', { href: s.url, rel: 'noopener', class: 'fp-src' }, s.title);
const PREP_WORDS = { bag: 'Bag', 'opaque-bag': 'Opaque bag', bubble: 'Bubble wrap', box: 'Box', 'cap-seal': 'Cap seal', 'sharp-packaging': 'Sharp packaging', set: 'Set', 'cover-barcodes': 'Barcodes', 'barcode-outside': 'Barcode', 'remove-hanger': 'Hanger', footwear: 'Footwear', jewelry: 'Jewelry', expiry: 'Expiry', 'double-wall': 'Box', test: 'Test', check: 'Check', none: 'No prep' };

// The page opens on the first worked example, tagged as one, until the visitor changes something.
let atRest = true;
const EXAMPLE_LINE = 'Example: cotton T-shirt, size M, 10 x 8 x 1 in, 6 oz, in a 10 x 13 in bag, sold by a reseller';

// The answer's figures, one line each with the Amazon page it comes from.
function factItems(r) {
  const items = [];
  const li = (k, v, src) => h('li', {}, [h('span', {}, k), h('b', {}, v), h('small', {}, src)]);
  if (r.bag?.warning) items.push(li('Suffocation warning', r.bag.warning.required ? (r.bag.warning.printedOnBag ? 'Printed on bag' : `Yes, ${r.bag.warning.minPt} pt+`) : 'Not required', r.bag.warning.source?.title ?? DATA.sources.bagging.title));
  items.push(li('FNSKU label', r.barcode.fnskuRequired === true ? 'Yes' : r.barcode.fnskuRequired === false ? 'No' : 'If reseller', r.barcode.source?.title ?? DATA.sources.amazonBarcodes.title));
  if (r.size) {
    items.push(li('Size tier until January 14, 2027', r.size.t2026.name, r.size.source?.title ?? DATA.sources.tiers.title));
    items.push(li('Size tier from January 15, 2027', r.size.t2027.name, r.size.source?.title ?? DATA.sources.tiers.title));
  }
  return h('ul', { class: 'tf-items' }, items);
}

function syncTypes() {
  const names = types().map((id) => TYPES[id]);
  $('fp-types-sum').textContent = `What it is: ${names.length ? names.join(', ') : 'nothing ticked'}`;
}

function render(r) {
  const bag = r.bag ? h('div', { class: 'fp-block' }, [
    h('h3', {}, r.bag.needed ? 'The bag' : 'Your bag'),
    h('p', {}, `${r.bag.opaque ? 'Black or opaque' : 'Transparent'}, at least ${r.bag.minMil} mil, sealed, no more than ${r.bag.maxOverhangIn} in past the product.${r.bag.smallest ? ` The smallest flat bag that holds it is about ${inText(r.bag.smallest.width)} x ${inText(r.bag.smallest.length)} (our estimate from the size).` : ''}`),
    r.bag.warning ? h('p', {}, [r.bag.warning.why, r.bag.warning.required ? ` Length plus width is ${r.bag.warning.lengthPlusWidth} in, so it prints at ${r.bag.warning.minPt} pt or larger${r.bag.warning.gap ? ' (Amazon\'s table skips this size; the larger one is used)' : ''}. ` : ' ', srcLink(r.bag.warning.source)]) : null,
    r.bag.checks.length ? h('ul', { class: 'fp-checks' }, r.bag.checks.map((c) => h('li', { class: c.ok ? 'ok' : 'bad' }, `${c.ok ? 'OK' : 'Fix'}: ${c.text}`))) : null,
  ]) : null;
  $('fp-out').replaceChildren(...[
    h('div', { class: 'tf-res-h' }, [atRest ? h('span', { class: 'ex-tag' }, 'Example') : null, h('p', { class: 'fp-tag' }, r.ok ? 'What Amazon requires' : 'Cannot be sent as it is')].filter(Boolean)),
    atRest ? h('p', { class: 'tf-exin' }, EXAMPLE_LINE) : null,
    h('p', { class: 'fp-answer' }, r.answer),
    factItems(r),
    r.refused.length ? h('ul', { class: 'fp-refused' }, r.refused.map((x) => h('li', {}, [x.text, ' ', srcLink(x.source)]))) : null,
    h('ol', { class: 'fp-steps' }, r.steps.map((s) => h('li', {}, [h('span', { class: 'fp-prep' }, PREP_WORDS[s.prep] ?? s.prep), h('strong', {}, s.text), h('span', { class: 'fp-why' }, [` ${s.why} `, srcLink(s.source)])]))),
    r.categories.length ? h('p', { class: 'small muted' }, ['Amazon prep categories: ', r.categories.map((c) => c.name).join(', '), '. ', srcLink(DATA.sources.guidance)]) : null,
    bag,
    r.size ? h('div', { class: 'fp-block' }, [h('h3', {}, 'Size tier'), h('p', {}, `${r.size.t2026.name} until January 14, 2027, then ${r.size.t2027.name}. Shipping weight ${lbText(r.size.t2027.shippingLb)} (${r.size.t2027.weightUsed} weight; dimensional weight ${lbText(r.size.t2027.dimLb)}). ${r.size.t2027.notes.join(' ')}`), srcLink(r.size.source)]) : null,
    r.box ? h('p', { class: r.box.ok ? '' : 'fp-bad' }, [r.box.text, ' ', srcLink(r.box.source)]) : null,
    r.expiry ? h('div', { class: 'fp-block' }, [h('h3', {}, 'Expiration date'), h('p', {}, [
      r.expiry.stamp ? `Print ${r.expiry.stamp} (MM-YYYY): Product packaging requirements accept MM-DD-YYYY or MM-YYYY, while Expiration dates on FBA products lists DD-MM-YYYY; MM-YYYY is on both. ` : 'Give the date to see what to print. ',
      r.expiry.latestCheckIn ? `It must be checked in by ${r.expiry.latestCheckIn} (${r.expiry.basis}). ` : '',
      srcLink(r.expiry.source),
    ])]) : null,
    ...r.notes.map((n) => h('p', { class: 'fp-aside' }, [n.text, ' ', srcLink(n.source)])),
  ].filter(Boolean));
}

function check(ev) {
  ev?.preventDefault();
  $('fp-error').textContent = '';
  try {
    render(engine.check(productInput()));
  } catch (e) {
    if (e instanceof PrepError) { $('fp-error').textContent = e.message; return; }
    throw e;
  }
}

// ---------- server calls ----------

function base64Bytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const fileLink = (name, bytes, type) => h('a', { href: URL.createObjectURL(new Blob([bytes], { type })), download: name }, name);
const pdfLink = (pdf) => fileLink(pdf.filename, base64Bytes(pdf.base64), 'application/pdf');

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

async function onList(ev) {
  ev.preventDefault();
  await runInto($('fp-list-run'), { op: 'plan', csv: $('fp-csv').value }, $('fp-list-error'), $('fp-list-out'), (r) => [
    h('p', { class: 'fp-answer fp-answer-s' }, r.answer),
    h('div', { class: 'fp-table-wrap' }, [h('table', { class: 'fp-table' }, [
      h('thead', {}, h('tr', {}, ['SKU', 'Product', 'Prep', 'Warning', 'FNSKU', 'Tier 2027'].map((x) => h('th', {}, x)))),
      h('tbody', {}, r.results.map((x) => h('tr', {}, [x.sku ?? '', x.name ?? '', x.steps.filter((s) => !['none', 'check', 'test', 'barcode-outside'].includes(s.prep)).map((s) => PREP_WORDS[s.prep] ?? s.prep).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'None',
        x.bag?.warning ? (x.bag.warning.required ? `${x.bag.warning.minPt} pt` : 'No') : '', x.barcode.fnskuRequired === true ? 'Yes' : x.barcode.fnskuRequired === false ? 'No' : 'If reseller', x.size?.t2027.name ?? ''].map((v) => h('td', {}, v))))),
    ])]),
    h('p', {}, ['Checklist: ', fileLink('fba-prep-checklist.csv', new TextEncoder().encode(r.csv), 'text/csv'), '.']),
  ]);
}

function stockInput() {
  const [kind, v] = $('fp-stock').value.split(':');
  if (kind === 'sheet') return { sheet: v };
  const [w, ht] = v.split('x').map(Number);
  return { thermal: { w, h: ht } };
}
function labelLines() {
  const out = [];
  for (const [n, line] of $('fp-lines').value.split(/\r?\n/).entries()) {
    if (!line.trim()) continue;
    const [fnsku, name, condition, copies] = line.split(',').map((s) => s.trim());
    const f = readFnsku(fnsku);
    if (!f.ok) throw new PrepError(`Line ${n + 1}: ${f.message}`);
    out.push({ fnsku: f.value, name: name || 'Product', ...(condition ? { condition } : {}), ...(copies ? { copies: Math.max(1, Math.min(500, Math.floor(Number(copies)) || 1)) } : {}) });
  }
  return out;
}

async function onFnsku(ev) {
  ev.preventDefault();
  let labels;
  try { labels = labelLines(); } catch (e) { $('fp-fnsku-error').textContent = e.message; return; }
  const down = Number($('fp-down').value) || 0;
  const input = { op: 'labels', batch: $('fp-batch').value, labels, stock: stockInput(), dpi: Number($('fp-dpi').value), startAt: Number($('fp-start').value) || 1, ...(down ? { nudge: { down } } : {}) };
  await runInto($('fp-fnsku-run'), input, $('fp-fnsku-error'), $('fp-fnsku-got'), (r) => [`${r.answer} `, pdfLink(r.pdf), '.']);
}
async function onAlign() {
  const st = stockInput();
  if (!st.sheet) { $('fp-fnsku-error').textContent = 'Thermal labels need no alignment test: one label is one page.'; return; }
  const down = Number($('fp-down').value) || 0;
  await runInto($('fp-align'), { op: 'sheet', kind: 'alignment', stock: st, ...(down ? { nudge: { down } } : {}) }, $('fp-fnsku-error'), $('fp-fnsku-got'), (r) => [`${r.answer} `, pdfLink(r.pdf), '.']);
}
function updateFnskuCost() {
  let n = 0;
  try { n = labelLines().reduce((a, l) => a + (l.copies ?? 1), 0); } catch { n = 0; }
  const price = Math.max(250_000, n * 1_000);
  const words = `${n} ${n === 1 ? 'label' : 'labels'}: $${(price / 1e6).toFixed(2)}${n * 1_000 < 250_000 ? ' (the minimum per PDF)' : ''}. Reprints of the same batch name are free for 14 days.`;
  $('fp-fnsku-cost').textContent = signedIn ? words : `${words} Sign in to download.`;
}

async function onSheet(ev) {
  ev.preventDefault();
  const kind = $('fp-kind').value;
  const input = { op: 'sheet', kind, count: Number($('fp-count').value) || 20 };
  if (kind === 'warning') { input.pt = Number($('fp-pt').value); input.paper = $('fp-paper').value; }
  if (kind === 'set') { input.text = $('fp-settext').value; input.stock = stockInput(); }
  if (kind === 'expiry') { input.date = $('fp-date').value.trim(); input.stock = stockInput(); }
  if (kind === 'expiry-box') { input.date = $('fp-date').value.trim(); input.paper = $('fp-paper').value; }
  await runInto($('fp-sheet-run'), input, $('fp-sheet-error'), $('fp-sheet-got'), (r) => [`${r.answer} `, pdfLink(r.pdf), '.']);
}

// ---------- links from the reference pages ----------

// ?name=...&types=liquid,fragile&l=7&w=2.6&h=2.6&unit=in&wt=1.2&wtu=lb&seller=reseller&vol=16
// &volu=oz&container=pump&lid=screw&bagw=10&bagl=13&mil=1.5&exp=2028-08&shelf=supplements
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (![...q.keys()].length) return;
  const set = (id, v, ok = () => true) => { if (v !== null && v !== '' && ok(v)) $(id).value = v; };
  const isNum = (v) => Number.isFinite(Number(v)) && Number(v) > 0;
  set('fp-name', q.get('name')?.slice(0, 200) ?? null);
  if (q.get('types') !== null) {
    const want = q.get('types').split(/[,|]/).map((s) => s.trim());
    for (const box of document.querySelectorAll('input[name="type"]')) box.checked = want.includes(box.value);
  }
  for (const [k, id] of [['l', 'fp-l'], ['w', 'fp-w'], ['h', 'fp-h'], ['wt', 'fp-wt'], ['vol', 'fp-vol'], ['bagw', 'fp-bw'], ['bagl', 'fp-bl'], ['mil', 'fp-mil'], ['upb', 'fp-upb']]) set(id, q.get(k), isNum);
  if (!q.get('bagw')) { $('fp-bw').value = ''; $('fp-bl').value = ''; }
  for (const [k, id, allowed] of [['unit', 'fp-du', ['in', 'cm']], ['wtu', 'fp-wu', ['oz', 'lb', 'g', 'kg']], ['seller', 'fp-seller', ['', 'brand', 'reseller']], ['volu', 'fp-volu', ['oz', 'ml']], ['container', 'fp-cont', ['bottle', 'tube', 'jar', 'pump', 'spray', 'roll-on', 'can', 'mascara', 'other']], ['lid', 'fp-lid', ['screw', 'twist', 'push', 'clip', 'flip', 'other']], ['drop', 'fp-dropv', ['not-tested', 'passed', 'failed']], ['shelf', 'fp-shelf', DATA.expiry.shelfLife.map((s) => s.id)]]) set(id, q.get(k), (v) => allowed.includes(v));
  for (const [k, id] of [['seal', 'fp-seal'], ['lock', 'fp-lock'], ['hazmat', 'fp-haz'], ['glass', 'fp-glass'], ['printed', 'fp-printed']]) if (q.get(k) !== null) $(id).checked = q.get(k) === '1' || q.get(k) === 'yes';
  set('fp-exp', q.get('exp')?.slice(0, 10) ?? null);
  if (q.get('bagw') || q.get('exp') || q.get('upb') || q.get('printed')) $('fp-more').open = true;
}

// ---------- start ----------

fillTypes();
$('fp-csv').value = SAMPLE_CSV;
if (location.search.length > 1) atRest = false;
fromQuery();
syncSections();
syncTypes();
check();
updateFnskuCost();
T.me().then((account) => { signedIn = !!account; updateFnskuCost(); }).catch(() => {});
document.querySelectorAll('input[name="type"]').forEach((x) => x.addEventListener('change', () => { syncSections(); syncTypes(); }));
$('fp-form').addEventListener('submit', (ev) => { atRest = false; check(ev); });
$('fp-form').addEventListener('change', () => { atRest = false; check(); });
$('fp-list-form').addEventListener('submit', onList);
$('fp-fnsku-form').addEventListener('submit', onFnsku);
$('fp-lines').addEventListener('input', updateFnskuCost);
$('fp-align').addEventListener('click', onAlign);
$('fp-sheet-form').addEventListener('submit', onSheet);
