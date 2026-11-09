// The landed cost allocator page. The engine (core.js) is pure arithmetic with no data, so the table
// is worked out here in the browser as you type, free. The files (per-SKU CSV, the Shopify export
// filled, and the spreadsheet) come from the paid run through Endwise.run; the spreadsheet with
// formulas alone is made here, free.
import { allocate, readLinesText, readChargesText, readLinesCsv, workbookCsv, LandedError, BASIS_WORDS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'landed-cost-allocator';
const $ = (id) => document.getElementById(id);

let tool = null;
let signedIn = false;
let last = null; // the last input that allocated cleanly

const put = (el, ...kids) => { el.textContent = ''; el.append(...kids.filter(Boolean)); };
const soon = (fn, ms = 300) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

function readForm() {
  const input = { ...readLinesText($('lc-lines').value), charges: readChargesText($('lc-charges').value) };
  const ship = $('lc-ship').value.trim();
  if (ship) input.shipment = ship;
  if ($('lc-policy').value !== 'split') input.latePolicy = $('lc-policy').value;
  return input;
}
// The engine takes lines; a pasted CSV is read the same way the server reads it.
const linesFor = (input) => (input.linesCsv ? { ...input, lines: readLinesCsv(input.linesCsv).lines, linesCsv: undefined } : input);

// ---------- showing the result ----------

function table(columns, rows, cls = 'lc-table') {
  return h('div', { class: 'lc-wrap-table' }, h('table', { class: cls }, [
    h('thead', {}, h('tr', {}, columns.map((c, i) => h('th', i ? { class: 'num' } : {}, c)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, r.map((v, i) => h('td', i ? { class: 'num' } : {}, String(v)))))),
  ]));
}

function show(r, label) {
  const facts = [['Goods', r.summary.productTotal], ['Charges', r.summary.chargeTotal], ['Landed', r.summary.landedTotal], ['Uplift', r.summary.uplift]];
  const out = [
    label ? h('p', { class: 't-ex' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', {}, `${label}: ${r.summary.shipment}, ${r.summary.lines} SKUs, ${r.charges.length} invoices (${r.charges.map((c) => `${c.name.toLowerCase()} ${c.basisWords}`).join(', ')})`)]) : null,
    h('p', { class: 'lc-sub' }, r.answer),
    h('dl', { class: 'lc-facts' }, facts.map(([k, v]) => h('div', {}, [h('dt', {}, k), h('dd', {}, v)]))),
    table(['SKU', 'Units', 'Unit cost', 'Landed per unit', 'Cost per item', ...r.charges.map((c) => c.name)],
      r.rows.map((x) => [x.sku, x.qty.toLocaleString('en-US'), x.unitCost, x.landedUnit, x.landedUnit2, ...x.byCharge]), 'lc-table lc-main'),
    h('p', { class: 'small muted' }, `Each invoice: ${r.charges.map((c) => `${c.name} ${c.amount} ${c.basisWords}${c.late ? ' (late)' : ''}`).join('; ')}. Every invoice's lines add back to it exactly. Shopify keeps two decimals, so the units at the two-decimal cost differ from the exact total by ${r.summary.shopifyDrift} in all.`),
  ];
  if (r.late) {
    out.push(h('h3', { class: 'lc-heading' }, `Late invoice: ${r.late.charges.join(', ')}`),
      table(['SKU', 'On hand', 'Late share', 'To units on hand', 'To COGS (sold)', 'Unit cost before', 'On hand after', 'New cost per item'],
        r.rows.map((x) => [x.sku, x.late.onHand.toLocaleString('en-US'), x.late.lateShare, x.late.toOnHand, x.late.cogsVariance, x.late.unitBefore, x.late.unitOnHandAfter ?? 'none on hand', x.late.shopifyCostAfter ?? '']), 'lc-table'));
    if (r.late.assumedOnHand.length) out.push(h('p', { class: 'small muted' }, `No units on hand given for ${r.late.assumedOnHand.join(', ')}, so all were treated as on hand. Add them as the sixth number on the line.`));
  }
  if (r.compare) {
    const bases = r.compare.bases;
    out.push(h('h3', { class: 'lc-heading' }, `${r.compare.charges.join(', ')} by each basis: landed per unit`),
      table(['SKU', ...bases.map((b) => BASIS_WORDS[b])], r.compare.rows.map((x) => [x.sku, ...bases.map((b) => x.byBasis[b])]), 'lc-table lc-compare'));
    if (bases.length < 4) out.push(h('p', { class: 'small muted' }, 'Add kg and CBM per unit to every line to compare weight and volume too.'));
  }
  out.push(h('details', { class: 'lc-why' }, [h('summary', {}, `The arithmetic for ${r.rows[0].sku}`), h('ol', { class: 'small' }, r.steps.map((s) => h('li', {}, s)))]));
  put($('lc-out'), ...out);
}

function recompute(label) {
  $('lc-err').textContent = '';
  try {
    const input = readForm();
    const r = allocate(linesFor(input));
    last = input;
    show(r, typeof label === 'string' ? label : null);
    buy?.refresh();
  } catch (e) {
    if (!(e instanceof LandedError)) throw e;
    $('lc-err').textContent = e.message;
  }
}

// ---------- files ----------

const download = (name, text) => h('a', { href: URL.createObjectURL(new Blob([text], { type: 'text/csv' })), download: name }, name);

function filesInput() {
  if (!last) return null;
  const input = { ...last };
  const shop = $('lc-shopify').value.trim();
  if (shop) input.shopifyExport = shop;
  return input;
}

let buy = null;
function buyBox(el) {
  const price = h('p', { class: 'lc-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Get the files');
  const got = h('div', { class: 'lc-got', role: 'status' });
  const err = h('p', { class: 'form-error', role: 'alert' });
  const words = () => (tool?.pricing?.actions ?? []).map((a) => a.text).filter(Boolean).map((t) => T.money(t)).join(' ');
  button.addEventListener('click', async () => {
    err.textContent = '';
    const input = filesInput();
    if (!input) { err.textContent = 'Fix the shipment above first.'; return; }
    button.disabled = true;
    try {
      const json = await T.run(SLUG, input);
      const r = json.result;
      const charged = json.charged ? (json.charged.amount ? ` Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : ' Free for this shipment.') : '';
      const links = [download(r.filenames.csv, r.csv), ', ', download(r.filenames.workbook, r.workbook)];
      if (r.shopify) links.push(' and ', download(r.filenames.shopify, r.shopify.csv));
      const notes = [];
      if (r.shopify) notes.push(`Cost per item filled on ${r.shopify.updated} variant${r.shopify.updated === 1 ? '' : 's'} in ${r.shopify.products} product${r.shopify.products === 1 ? '' : 's'}.${r.shopify.notFound.length ? ` Not in the export: ${r.shopify.notFound.join(', ')}.` : ''} Import it with "Overwrite products with matching handles" ticked.`);
      put(got, h('p', {}, ['Your files: ', ...links, `.${charged}`]), ...notes.map((n) => h('p', { class: 'small' }, n)), h('ul', { class: 'small muted' }, r.book.map((b) => h('li', {}, b))));
    } catch (e) {
      err.textContent = e.message;
      if (e.code === 'unauthorized' || e.code === 'rate_limited') err.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
      if (e.code === 'insufficient_balance' || e.code === 'cap_reached') err.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
    } finally {
      button.disabled = false;
    }
  });
  put(el, price, button, got, err);
  let timer = null;
  return {
    refresh() {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const input = filesInput();
        if (!input) { price.textContent = words(); return; }
        try {
          const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
          price.textContent = q.amount ? `These files cost ${q.display} from your balance.` : (signedIn ? 'These files are free for you now.' : 'These files are free: 3 lines or fewer.');
        } catch {
          price.textContent = signedIn ? words() : `${words()} Sign in to get the files.`;
        }
      }, 300);
    },
  };
}

// ---------- the address ----------

// ?lines=MUG-12, 600, 2.10, 0.42, 0.0018|TEE-M, ...&charges=Ocean freight, freight, 1840, volume|...
// &ship=PO-1042&policy=onhand
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const lines = (v) => v.split('|').join('\n');
  const set = (id, key, map = (v) => v, ok = () => true) => { const v = q.get(key); if (v !== null && v.length <= 60000 && ok(v)) $(id).value = map(v); };
  set('lc-lines', 'lines', lines);
  set('lc-charges', 'charges', lines);
  set('lc-ship', 'ship');
  set('lc-policy', 'policy', (v) => v, (v) => v === 'split' || v === 'onhand');
  return ['lines', 'charges'].some((k) => q.has(k));
}

// ---------- start ----------

async function start() {
  T.mountCodePanel($('lc-code'), SLUG);
  const linked = fromQuery();
  recompute(linked ? null : 'Worked example');
  const again = soon(recompute);
  // The button allocates again and, on a phone, brings the table into view under the form.
  $('lc-form').addEventListener('submit', (e) => {
    e.preventDefault();
    recompute();
    if (matchMedia('(max-width: 959px)').matches) $('lc-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('lc-form').addEventListener('input', again);
  $('lc-form').addEventListener('change', again);
  $('lc-shopify').addEventListener('input', () => buy && buy.refresh());
  $('lc-workbook').addEventListener('click', () => {
    try {
      const input = linesFor(readForm());
      const a = download(`landed-cost-${(input.shipment || 'shipment').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-formulas.csv`, workbookCsv(input));
      a.click();
    } catch (e) {
      if (!(e instanceof LandedError)) throw e;
      $('lc-err').textContent = e.message;
    }
  });
  try { tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool; } catch { tool = null; }
  try { signedIn = !!(await T.me()); } catch { signedIn = false; }
  buy = buyBox($('lc-buy'));
  buy.refresh();
}

start();
