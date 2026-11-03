// The QR code page. core.js (the same file the server runs) makes every single code here, in the
// browser, free and without a call: the payload, the symbol, the SVG, PNG and PDF, and the read-back
// that proves each file. The expiry check sends only the code's text to the server, which follows
// the redirects; the spreadsheet job is the server's paid answer to the same rows.
import {
  QrError, TYPES, TYPE_NAMES, WIFI_SECURITY, SHEETS, ECC_RESTORE,
  buildPayload, encodeText, designOf, printChecks, svgOf, rasterOf, pngOf, pngScanlines, pdfOf,
  verifyPixels, verifySvg, rgbaToLuminance, decodeLuminance, payloadKind, zipEntries, parseCsv, xlsxRows,
  rowsFromTable, planBulk,
} from './core.js';

const T = window.Toll;
const h = T.h;
const SLUG = 'qr-code-generator';
const $ = (id) => document.getElementById(id);
const BODY_LIMIT = 90_000; // a request body is at most 100 kB; a big sheet goes in parts

// ---------- the fields of each type ----------

const FIELD_UI = {
  url: [['url', 'Web address', 'https://example.com/menu']],
  text: [['text', 'Text', 'Any text', 'textarea']],
  wifi: [['ssid', 'Network name (SSID)', 'Cafe Guest'], ['password', 'Password', ''], ['security', 'Security', '', 'select', WIFI_SECURITY.map((s) => [s, s === 'nopass' ? 'Open (no password)' : s === 'WPA' ? 'WPA / WPA2 / WPA3 personal' : s === 'WPA2-EAP' ? 'WPA2 enterprise (EAP)' : s])], ['hidden', 'Hidden network', '', 'checkbox'],
    ['eapMethod', 'EAP method (enterprise)', 'PEAP'], ['identity', 'Identity (enterprise)', ''], ['anonymousIdentity', 'Anonymous identity (enterprise)', ''], ['phase2', 'Phase 2 (enterprise)', 'MSCHAPV2']],
  vcard: [['firstName', 'First name', 'Jane'], ['lastName', 'Last name', 'Rivera'], ['organization', 'Organization', ''], ['title', 'Job title', ''], ['phone', 'Work phone', '+12125551212'], ['mobile', 'Mobile', ''], ['email', 'Email', ''], ['website', 'Website', ''], ['street', 'Street', ''], ['city', 'City', ''], ['region', 'State or region', ''], ['postalCode', 'ZIP or postal code', ''], ['country', 'Country', ''], ['note', 'Note', '']],
  email: [['to', 'To', 'hello@example.com'], ['subject', 'Subject', ''], ['body', 'Message', '', 'textarea'], ['cc', 'Cc', ''], ['bcc', 'Bcc', '']],
  sms: [['phone', 'Phone number', '+12125551212'], ['message', 'Message', '', 'textarea']],
  phone: [['phone', 'Phone number', '+12125551212']],
  location: [['latitude', 'Latitude', '40.71872'], ['longitude', 'Longitude', '-73.98905'], ['altitude', 'Altitude in meters (optional)', '']],
};
const ENTERPRISE = ['eapMethod', 'identity', 'anonymousIdentity', 'phase2'];
const START = { url: 'https://example.com/menu', ssid: 'Cafe Guest', password: 'tea;time42', security: 'WPA' };

function drawFields() {
  const box = $('qr-fields');
  box.textContent = '';
  for (const [name, label, placeholder, kind, options] of FIELD_UI[$('qr-type').value]) {
    const id = `qr-f-${name}`;
    let control;
    if (kind === 'textarea') control = h('textarea', { id, rows: '3', placeholder });
    else if (kind === 'select') control = h('select', { id }, options.map(([v, t]) => h('option', { value: v }, t)));
    else if (kind === 'checkbox') {
      box.appendChild(h('label', { class: 'check', 'data-field': name }, [h('input', { type: 'checkbox', id }), h('span', null, label)]));
      continue;
    } else control = h('input', { type: 'text', id, placeholder, spellcheck: 'false' });
    if (START[name] !== undefined) control.value = START[name];
    box.appendChild(h('div', { class: 'field', 'data-field': name }, [h('label', { for: id }, label), control, h('p', { class: 'field-error', id: `${id}-err` })]));
  }
  showEnterprise();
}

function showEnterprise() {
  const sec = $('qr-f-security');
  for (const f of ENTERPRISE) {
    const el = document.querySelector(`[data-field="${f}"]`);
    if (el) el.hidden = !sec || sec.value !== 'WPA2-EAP';
  }
}

function fieldValues() {
  const out = {};
  for (const [name, , , kind] of FIELD_UI[$('qr-type').value]) {
    const el = $(`qr-f-${name}`);
    if (!el || el.closest('[hidden]')) continue;
    if (kind === 'checkbox') { if (el.checked) out[name] = true; } else if (el.value !== '') out[name] = el.value;
  }
  return out;
}

// ---------- the logo ----------

let logo = null; // { rgba, width, height, dataUrl }

async function readLogo(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('That image could not be opened.'));
      i.src = url;
    });
    const max = 256;
    const k = Math.min(1, max / Math.max(img.naturalWidth || max, img.naturalHeight || max));
    const w = Math.max(1, Math.round((img.naturalWidth || max) * k));
    const ht = Math.max(1, Math.round((img.naturalHeight || max) * k));
    const c = h('canvas', { width: String(w), height: String(ht) });
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0, w, ht);
    return { rgba: g.getImageData(0, 0, w, ht).data, width: w, height: ht, dataUrl: c.toDataURL('image/png') };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ---------- making one code ----------

const num = (id, fallback) => { const n = Number(String($(id).value).trim()); return Number.isFinite(n) && n > 0 ? n : fallback; };

function designNow() {
  return designOf({
    fg: $('qr-fg').value,
    bg: $('qr-transparent').checked ? 'transparent' : $('qr-bg').value,
    margin: Math.max(0, Math.min(20, Math.round(num('qr-margin', 0) || 0))),
    logo,
    logoShare: Number($('qr-logo-share').value) / 100,
  });
}

let current = null;

function make() {
  for (const el of document.querySelectorAll('#qr-fields .field-error')) el.textContent = '';
  $('qr-error').textContent = '';
  const out = $('qr-out');
  try {
    const type = $('qr-type').value;
    const { payload, notes } = buildPayload(type, fieldValues());
    const qr = encodeText(payload, { ecc: $('qr-ecc').value });
    const design = designNow();
    const svg = svgOf(qr, design);
    // The read-back: the pixels the PNG and PDF are drawn from, and the SVG's own modules.
    const raster = rasterOf(qr, design, 4);
    const back = verifyPixels(raster.rgba, raster.width, raster.height, payload);
    verifySvg(svg, payload);
    const widthMm = num('qr-width', 30);
    const moduleMm = widthMm / (qr.size + 2 * design.margin);
    current = { type, payload, qr, design, widthMm };
    out.textContent = '';
    const preview = h('div', { class: 'qr-preview' });
    preview.innerHTML = svg; // svgOf writes only numbers, colours and the logo's data URL
    out.appendChild(preview);
    out.appendChild(h('p', { class: 'qr-verified' }, `Read back: it says exactly the text below (version ${back.version}, level ${back.ecc}, mask ${back.mask}).`));
    out.appendChild(h('div', { class: 'qr-downloads' }, [
      h('button', { class: 'btn', type: 'button', id: 'qr-dl-png' }, 'PNG'),
      h('button', { class: 'btn btn-ghost', type: 'button', id: 'qr-dl-svg' }, 'SVG'),
      h('button', { class: 'btn btn-ghost', type: 'button', id: 'qr-dl-pdf' }, `PDF, ${widthMm} mm`),
    ]));
    out.appendChild(h('p', { class: 'qr-heading' }, 'Inside the code'));
    out.appendChild(h('pre', { class: 'qr-payload' }, payload));
    out.appendChild(h('dl', { class: 'qr-facts' }, [
      h('div', null, [h('dt', null, 'Kind'), h('dd', null, `Static: ${TYPE_NAMES[type]}`)]),
      h('div', null, [h('dt', null, 'Size'), h('dd', null, `Version ${qr.version}, ${qr.size} x ${qr.size}`)]),
      h('div', null, [h('dt', null, 'Error correction'), h('dd', null, `${qr.ecc}, about ${ECC_RESTORE[qr.ecc]}`)]),
      h('div', null, [h('dt', null, 'Mask'), h('dd', null, String(qr.mask))]),
    ]));
    if (qr.ecc !== $('qr-ecc').value) out.appendChild(h('p', { class: 'qr-aside' }, `Raised to level ${qr.ecc} at no cost in size: the text fits at the same version.`));
    const checks = [...notes.map((t) => ({ level: 'info', text: t })), ...printChecks(qr, design, { moduleMm, printerDpi: num('qr-dpi', null) })];
    if (checks.length) out.appendChild(h('ul', { class: 'qr-checks' }, checks.map((c) => h('li', { class: c.level === 'warn' ? 'warn' : '' }, c.text))));
    $('qr-dl-png').addEventListener('click', downloadPng);
    $('qr-dl-svg').addEventListener('click', () => save(new Blob([svgOf(qr, design, { px: 1000 })], { type: 'image/svg+xml' }), 'qr-code.svg'));
    $('qr-dl-pdf').addEventListener('click', () => save(new Blob([pdfOf(qr, design, { widthMm })], { type: 'application/pdf' }), 'qr-code.pdf'));
  } catch (e) {
    if (!(e instanceof QrError)) throw e;
    current = null;
    const err = e.field && $(`qr-f-${e.field}-err`);
    if (err) err.textContent = e.message; else $('qr-error').textContent = e.message;
    out.textContent = '';
    out.appendChild(h('p', { class: 'muted' }, e.message.includes('read back') || e.message.includes('No readable')
      ? 'With this logo the code no longer reads back. Choose error correction Q or H, or make the logo smaller.'
      : 'Fill in the fields to see the code.'));
  }
}

// zlib with the browser's own compressor, for a smaller PNG.
async function zlib(bytes) {
  if (typeof CompressionStream !== 'function') return null;
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function downloadPng() {
  if (!current) return;
  const { qr, design } = current;
  const total = qr.size + 2 * design.margin;
  const scale = Math.max(1, Math.floor(Math.min(4000, num('qr-px', 1000)) / total));
  const img = rasterOf(qr, design, scale);
  verifyPixels(img.rgba, img.width, img.height, current.payload);
  const z = await zlib(pngScanlines(img).raw);
  const png = pngOf(img, { dpi: Math.round(num('qr-dpi', 300)), ...(z ? { deflate: () => z } : {}) });
  save(new Blob([png], { type: 'image/png' }), 'qr-code.png');
}

function save(blob, name) {
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// ---------- reading an image of a code ----------

async function imagePixels(file) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('That file is not an image this browser can open. PDF files are not read here; take a screenshot of the code instead.'));
      i.src = url;
    });
    const k = Math.min(1, 2000 / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * k);
    const ht = Math.round(img.naturalHeight * k);
    const c = h('canvas', { width: String(w), height: String(ht) });
    const g = c.getContext('2d');
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, w, ht);
    g.drawImage(img, 0, 0, w, ht);
    return { canvas: c, data: g.getImageData(0, 0, w, ht).data, width: w, height: ht };
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function readCode(file) {
  const px = await imagePixels(file);
  try {
    return decodeLuminance(rgbaToLuminance(px.data, px.width, px.height), px.width, px.height).text;
  } catch (e) {
    if (!(e instanceof QrError)) throw e;
    if ('BarcodeDetector' in window) {
      try {
        const found = await new window.BarcodeDetector({ formats: ['qr_code'] }).detect(px.canvas);
        if (found.length) return found[0].rawValue;
      } catch { /* fall through to the message */ }
    }
    throw new Error('No QR code could be read from that picture. Try a straight-on screenshot cropped to the code, or type what the code says.');
  }
}

// ---------- the expiry check ----------

const VERDICT_LABEL = {
  static: 'Static', direct: 'Static link', 'vendor-redirect': 'Vendor redirect', 'own-redirect': 'Your own redirect', 'unknown-redirect': 'Unknown redirect', unknown: 'Could not follow',
};

function drawCheck(r) {
  const out = $('qr-check-out');
  out.textContent = '';
  out.appendChild(h('p', { class: `qr-verdict v-${r.verdict}` }, VERDICT_LABEL[r.verdict]));
  out.appendChild(h('p', { class: 'qr-sub' }, r.verdictText));
  out.appendChild(h('p', { class: 'qr-heading' }, 'The code says'));
  out.appendChild(h('pre', { class: 'qr-payload' }, r.encoded));
  if (r.vendor) {
    out.appendChild(h('p', { class: 'qr-heading' }, `Vendor: ${r.vendor.name}`));
    if (r.vendor.policy) {
      const p = r.vendor.policy;
      out.appendChild(h('blockquote', { class: 'qr-quote' }, [h('p', null, `"${p.quote}"`), h('p', { class: 'small muted' }, [`${p.context} `, h('a', { href: p.url, rel: 'nofollow noopener' }, 'The vendor\'s page'), `, read ${p.readOn}${p.pageDate ? `, dated ${p.pageDate}` : ''}.`])]));
    }
  }
  if (r.chain.length) {
    out.appendChild(h('p', { class: 'qr-heading' }, 'Where it leads today'));
    out.appendChild(h('ol', { class: 'qr-chain' }, r.chain.map((s) => h('li', null, [h('span', { class: 'when' }, s.status ? `HTTP ${s.status}` : 'no answer'), h('span', { class: 'qr-url' }, s.url), s.error ? h('span', { class: 'muted' }, s.error) : null]))));
  }
  if (r.notes.length) out.appendChild(h('ul', { class: 'qr-checks' }, r.notes.map((t) => h('li', null, t))));
  if (r.replacement) {
    out.appendChild(h('p', { class: 'qr-heading' }, 'A static replacement for the reprint'));
    out.appendChild(h('p', { class: 'qr-sub' }, r.replacement.note));
    const b = h('button', { class: 'btn', type: 'button' }, 'Open it in the maker above');
    b.addEventListener('click', () => {
      $('qr-type').value = 'url';
      drawFields();
      $('qr-f-url').value = r.replacement.payload;
      make();
      $('qr-form').scrollIntoView({ behavior: 'smooth' });
    });
    out.appendChild(b);
  }
}

async function onCheck(e) {
  e.preventDefault();
  $('qr-check-error').textContent = '';
  const btn = $('qr-check-run');
  btn.disabled = true;
  try {
    let text = $('qr-check-text').value.trim();
    const file = $('qr-check-image').files[0];
    if (file && !text) {
      text = await readCode(file);
      $('qr-check-text').value = text;
    }
    if (!text) throw new Error('Choose a picture of the code, or type what it says.');
    const mine = $('qr-check-mine').value.split(/[\s,]+/).map((d) => d.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '')).filter(Boolean);
    const json = await T.run(SLUG, { op: 'expiry-check', text, ...(mine.length ? { myDomains: mine } : {}) });
    drawCheck(json.result);
  } catch (err) {
    $('qr-check-error').textContent = err.fields ? Object.values(err.fields)[0] : err.message;
  } finally {
    btn.disabled = false;
  }
}

// ---------- the spreadsheet ----------

let sheet = null; // { table, name }

async function readSheetFile(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (/\.xlsx$/i.test(file.name)) {
    const entries = zipEntries(bytes);
    const texts = {};
    for (const e of entries) {
      if (!/^xl\/(sharedStrings|worksheets\/sheet1)\.xml$/.test(e.name)) continue;
      if (e.method === 0) texts[e.name] = new TextDecoder().decode(e.data);
      else texts[e.name] = await new Response(new Blob([e.data]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).text();
    }
    return xlsxRows((name) => texts[name] ?? null);
  }
  let text;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { text = new TextDecoder('windows-1252').decode(bytes); }
  return parseCsv(text);
}

const csvLine = (r) => r.map((v) => (/[",\r\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v))).join(',');

// The sheet in parts that fit one request: each part is the heading row and a run of rows, with
// the sheet row number of its first data row.
function parts(table) {
  const [head, ...body] = table;
  const out = [];
  let lines = [];
  let size = 0;
  let first = 2;
  body.forEach((r, i) => {
    const line = csvLine(r);
    if (lines.length && size + line.length > BODY_LIMIT - 4000) {
      out.push({ firstRow: first, csv: `${[csvLine(head), ...lines].join('\r\n')}\r\n` });
      lines = [];
      size = 0;
      first = i + 2;
    }
    lines.push(line);
    size += line.length + 2;
  });
  if (lines.length) out.push({ firstRow: first, csv: `${[csvLine(head), ...lines].join('\r\n')}\r\n` });
  return out;
}

function bulkOptions() {
  const d = designNow();
  const opts = { type: $('qr-bulk-type').value, filename: $('qr-bulk-name').value.trim() || 'qr-{row}', format: $('qr-bulk-format').value, ecc: $('qr-ecc').value, margin: d.margin, fg: $('qr-fg').value, bg: $('qr-transparent').checked ? 'transparent' : $('qr-bg').value };
  if ($('qr-bulk-sheet').value) opts.sheet = $('qr-bulk-sheet').value;
  return opts;
}

const money = (n) => `$${n.toFixed(n < 1 ? 3 : 2)}`;

function analyseBulk() {
  $('qr-bulk-error').textContent = '';
  const box = $('qr-bulk-out');
  box.textContent = '';
  $('qr-bulk-run').hidden = true;
  $('qr-bulk-note').hidden = true;
  try {
    const table = sheet ? sheet.table : parseCsv($('qr-bulk-paste').value);
    if (table.length < 2) throw new QrError('Give a heading row and at least one row.');
    const { rows, ignored } = rowsFromTable(table);
    const opts = bulkOptions();
    const plan = planBulk(rows, { type: opts.type, ecc: opts.ecc, filename: opts.filename });
    const codes = plan.ok.length;
    box.appendChild(h('p', { class: 'qr-answer' }, [`${codes.toLocaleString('en-US')} ${codes === 1 ? 'code' : 'codes'}`, h('small', null, `${plan.errors.length} ${plan.errors.length === 1 ? 'row' : 'rows'} refused, never charged`)]));
    const price = Math.max(10, codes) * 0.002;
    // The rate in the page's currency (T.prices); the estimate for the job only in dollars, where
    // it is worked out here.
    const rate = T.prices(`$0.002 a code, at least 10 a job${codes > 5000 ? '; codes beyond 5,000 in a calendar month are $0.0005' : ''}`);
    const about = T.currency === 'USD' ? `About ${money(price)} for this job (${rate}).` : `${rate[0].toUpperCase()}${rate.slice(1)}.`;
    if (codes) box.appendChild(h('p', { class: 'qr-sub' }, `${about} The exact price is shown before anything is charged.`));
    if (ignored.length) box.appendChild(h('p', { class: 'qr-aside' }, `Not used: ${ignored.join(', ')} (usable in file names as {${ignored[0]}}).`));
    const list = [...plan.errors.map((e) => ({ row: e.row, text: e.text, err: true })), ...plan.warnings].sort((a, b) => a.row - b.row);
    if (list.length) box.appendChild(h('ul', { class: 'qr-checks' }, list.slice(0, 12).map((x) => h('li', { class: x.err ? 'warn' : '' }, `Row ${x.row}: ${x.text}`))));
    if (list.length > 12) box.appendChild(h('p', { class: 'small muted' }, `and ${list.length - 12} more, listed in the manifest.`));
    if (plan.ok.length) {
      const sample = plan.ok.slice(0, 3);
      box.appendChild(h('table', { class: 'qr-table' }, [
        h('thead', null, h('tr', null, [h('th', null, 'Row'), h('th', null, 'File'), h('th', null, 'Inside')])),
        h('tbody', null, sample.map((x) => h('tr', null, [h('td', null, String(x.row)), h('td', null, x.file), h('td', { class: 'qr-url' }, x.payload)]))),
      ]));
      $('qr-bulk-run').hidden = false;
      $('qr-bulk-note').hidden = false;
    }
  } catch (e) {
    if (!(e instanceof QrError)) throw e;
    $('qr-bulk-error').textContent = e.message;
  }
}

async function runBulk() {
  $('qr-bulk-error').textContent = '';
  const out = $('qr-bulk-files');
  out.textContent = '';
  const btn = $('qr-bulk-run');
  btn.disabled = true;
  try {
    const table = sheet ? sheet.table : parseCsv($('qr-bulk-paste').value);
    const jobs = parts(table);
    const opts = bulkOptions();
    for (const [i, part] of jobs.entries()) {
      const json = await T.run(SLUG, { op: 'bulk', ...opts, csv: part.csv, firstRow: part.firstRow });
      const r = json.result;
      const name = jobs.length > 1 ? `qr-codes-part-${i + 1}.zip` : 'qr-codes.zip';
      const bytes = Uint8Array.from(atob(r.zip.base64), (c) => c.charCodeAt(0));
      const a = h('a', { class: 'btn', href: URL.createObjectURL(new Blob([bytes], { type: 'application/zip' })), download: name }, `Download ${name}`);
      out.appendChild(h('p', null, [a, ` ${r.made} codes, every file read back${r.sheet ? `, with ${r.sheet.pages} label ${r.sheet.pages === 1 ? 'page' : 'pages'}` : ''}. Charged ${json.charged.display}.`]));
      if (r.sheet) out.appendChild(h('p', { class: 'small muted' }, `${r.sheet.note} Codes print ${r.sheet.codeWidthMm} mm wide.`));
    }
  } catch (err) {
    $('qr-bulk-error').textContent = err.status === 401 ? 'Sign in to make the files; the rows above stay on this page.' : (err.fields ? Object.values(err.fields)[0] : err.message);
    if (err.status === 401) $('qr-bulk-error').appendChild(h('a', { class: 'toll-fix', href: T.signInHref() }, ' Sign in'));
  } finally {
    btn.disabled = false;
  }
}

// ---------- wiring ----------

function boot() {
  for (const t of TYPES) $('qr-bulk-type').appendChild(h('option', { value: t }, TYPE_NAMES[t]));
  for (const [k, s] of Object.entries(SHEETS)) $('qr-bulk-sheet').appendChild(h('option', { value: k }, s.name));
  const q = new URLSearchParams(window.location.search);
  if (q.get('type') && TYPES.includes(q.get('type'))) $('qr-type').value = q.get('type');
  drawFields();
  if (q.get('url') && $('qr-f-url')) $('qr-f-url').value = q.get('url');
  if (q.get('ecc') && ['L', 'M', 'Q', 'H'].includes(q.get('ecc'))) $('qr-ecc').value = q.get('ecc');
  $('qr-type').addEventListener('change', () => { drawFields(); make(); });
  $('qr-form').addEventListener('input', (e) => { if (e.target.id === 'qr-f-security') showEnterprise(); make(); });
  $('qr-form').addEventListener('change', make);
  $('qr-form').addEventListener('submit', (e) => { e.preventDefault(); make(); });
  $('qr-logo-share').addEventListener('input', () => { $('qr-logo-share-out').textContent = `${$('qr-logo-share').value}%`; });
  $('qr-logo').addEventListener('change', async () => {
    const f = $('qr-logo').files[0];
    try { logo = f ? await readLogo(f) : null; } catch (e) { $('qr-error').textContent = e.message; logo = null; }
    if (logo && ($('qr-ecc').value === 'L' || $('qr-ecc').value === 'M')) $('qr-ecc').value = 'H';
    make();
  });
  $('qr-check-form').addEventListener('submit', onCheck);
  $('qr-check-image').addEventListener('change', () => { $('qr-check-text').value = ''; });
  $('qr-bulk-file').addEventListener('change', async () => {
    const f = $('qr-bulk-file').files[0];
    if (!f) return;
    try {
      sheet = { table: await readSheetFile(f), name: f.name };
      $('qr-bulk-paste').value = '';
      $('qr-bulk-paste').placeholder = `${f.name} is open.`;
      analyseBulk();
    } catch (e) {
      $('qr-bulk-error').textContent = e.message;
    }
  });
  $('qr-bulk-paste').addEventListener('input', () => { sheet = null; analyseBulk(); });
  for (const id of ['qr-bulk-type', 'qr-bulk-name', 'qr-bulk-format', 'qr-bulk-sheet']) $(id).addEventListener('change', analyseBulk);
  $('qr-bulk-run').addEventListener('click', runBulk);
  make();
  analyseBulk();
  T.mountCodePanel($('qr-code'), SLUG);
}

boot();

// For the expiry checker's kind label on non-link codes.
export { payloadKind };
