// The XRechnung / ZUGFeRD viewer page (German at /de/xrechnung-viewer/, English at /xrechnung-viewer/).
// Reading runs here, in the browser, with core.js (the same file the server runs): the XML is
// parsed, a ZUGFeRD PDF's embedded XML is found (its compressed streams are unpacked with the
// browser's DecompressionStream), and the invoice is drawn, all without uploading anything. Only
// "Check" and "PDF" send the file to the server (Endwise.run), which runs the official rules.
import {
  readFile, readInvoice, scanPdf, isPdf, describeFormat, linesCsv, attachmentData, InvoiceError, LIMITS,
  TERMS, GROUPS, TYPE_CODES, VAT_CATEGORIES, PAYMENT_MEANS, UNITS, LABELS, money, dateText, percentText,
  SAMPLES, FAILING_SAMPLE, samplePdf, SAMPLE_PDF_LINES,
} from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'xrechnung-viewer';
const LANG = document.documentElement.lang === 'de' ? 'de' : 'en';
const L = LABELS[LANG];
const $ = (id) => document.getElementById(id);
const W = {
  de: {
    samples: { fehler: 'Beispiel: XRechnung mit zwei Fehlern', ubl: 'Beispiel: gültige XRechnung', pdf: 'Beispiel: ZUGFeRD-PDF' },
    readLocal: (n, b) => `${n}, ${b.toLocaleString('de-DE')} Bytes. Im Browser gelesen; nichts wurde hochgeladen.`,
    tooBig: 'Die Datei ist größer als 5 MB.', checking: 'Die Datei wird nach den offiziellen Regeln geprüft.', making: 'Das PDF wird erstellt.',
    signIn: 'Für das PDF melden Sie sich bitte an. Anzeigen und Lesen bleiben kostenlos.', charged: (a) => (a > 0 ? `Berechnet: $${(a / 1e6).toFixed(2)}.` : 'Für diese Datei fällt nichts an.'),
    download: 'PDF herunterladen', file: 'Datei', check: 'Prüfergebnis', explainNone: 'Bitte einen Fehlercode eingeben, zum Beispiel BR-DE-15.',
    page: 'Erklärung und Lösung', where: 'Stelle', fields: 'Felder', copy: 'Kopieren', due: 'Zahlbetrag', notInvoice: 'Kein Rechnungsinhalt lesbar.',
    sampleCheck: 'Beispiele werden ohne Kosten geprüft.', open: 'öffnen', noNeed: 'Wählen Sie zuerst eine Datei.',
    example: 'Beispiel', yours: 'Ihre Datei', asRead: 'Die Rechnung, wie gelesen', readHere: 'Im Browser gelesen, ohne Upload',
    valid: 'Gültig', invalid: 'Ungültig', errors: (n) => `${n} Fehler`,
  },
  en: {
    samples: { fehler: 'Sample: an XRechnung with two mistakes', ubl: 'Sample: a valid XRechnung', pdf: 'Sample: a ZUGFeRD PDF' },
    readLocal: (n, b) => `${n}, ${b.toLocaleString('en-US')} bytes. Read in your browser; nothing was uploaded.`,
    tooBig: 'The file is larger than 5 MB.', checking: 'Checking the file against the official rules.', making: 'Making the PDF.',
    signIn: 'Sign in to get the PDF. Opening and reading stay free.', charged: (a) => (a > 0 ? `Charged $${(a / 1e6).toFixed(2)}.` : 'No charge for this file.'),
    download: 'Download the PDF', file: 'File', check: 'Check result', explainNone: 'Type an error code, for example BR-DE-15.',
    page: 'Explanation and fix (German)', where: 'Location', fields: 'Fields', copy: 'Copy', due: 'Amount due', notInvoice: 'No invoice content could be read.',
    sampleCheck: 'Samples are checked at no cost.', open: 'open', noNeed: 'Choose a file first.',
    example: 'Example', yours: 'Your file', asRead: 'The invoice as read', readHere: 'Read in your browser, no upload',
    valid: 'Valid', invalid: 'Invalid', errors: (n) => `${n} ${n === 1 ? 'error' : 'errors'}`,
  },
}[LANG];

const state = { bytes: null, name: '', sample: null, read: null, invoice: null };
const t = (bt) => TERMS[bt]?.[LANG] ?? bt;
const first = (v) => (Array.isArray(v) ? v[0] : v);
const all = (v) => (Array.isArray(v) ? v.join(', ') : (v ?? ''));

// ---------- reading (in the browser) ----------

async function inflate(raw) {
  const stream = new Blob([raw]).stream().pipeThrough(new DecompressionStream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function readBytes(bytes) {
  if (!isPdf(bytes)) return readFile(bytes);
  const scan = scanPdf(bytes);
  const map = new Map();
  for (const o of scan.needs) {
    if (!o.filters.length) continue;
    try { map.set(o.raw, await inflate(o.raw)); } catch { /* a stream that will not unpack is reported when it is needed */ }
  }
  return readFile(bytes, map, scan);
}

// ---------- drawing the invoice ----------

const kv = (pairs) => h('dl', { class: 'xv-kv' }, pairs.filter(([, v]) => v !== undefined && v !== null && v !== '').flatMap(([k, v]) => [h('dt', null, k), h('dd', null, v)]));

function partyBlock(p, kind) {
  const isSeller = kind === 'seller';
  const k = isSeller ? ['BT-27', 'BT-28', 'BT-35', 'BT-36', 'BT-162', 'BT-38', 'BT-37', 'BT-40'] : ['BT-44', 'BT-45', 'BT-50', 'BT-51', 'BT-163', 'BT-53', 'BT-52', 'BT-55'];
  const name = first(p[k[0]]);
  const trade = first(p[k[1]]);
  const lines = [trade && trade !== name ? trade : null, first(p[k[2]]), first(p[k[3]]), first(p[k[4]]), [first(p[k[5]]), first(p[k[6]])].filter(Boolean).join(' '), first(p[k[7]])].filter(Boolean);
  const ids = isSeller ? ['BT-31', 'BT-32', 'BT-30', 'BT-29', 'BT-34', 'BT-41', 'BT-42', 'BT-43'] : ['BT-48', 'BT-47', 'BT-46', 'BT-49', 'BT-56', 'BT-57', 'BT-58'];
  return h('div', { class: 'xv-party' }, [
    h('p', { class: 'xv-party-role' }, isSeller ? L.seller : L.buyer),
    h('p', { class: 'xv-party-name' }, name ?? '?'),
    ...lines.map((l) => h('p', null, l)),
    ...ids.filter((id) => p[id]).map((id) => h('p', { class: 'xv-party-id' }, [h('span', null, `${t(id)}: `), all(p[id])])),
  ]);
}

function invoiceView(inv) {
  const D = inv.doc;
  const cur = first(D['BT-5']) ?? '';
  const amt = (v) => money(first(v), cur, LANG);
  const type = first(D['BT-3']);
  const lines = h('table', { class: 'xv-lines' }, [
    h('thead', null, [h('tr', null, [L.pos, L.item, L.qty, L.unitPrice, L.vatRate, L.net].map((x, i) => h('th', { scope: 'col', class: i >= 2 ? 'num' : '' }, x)))]),
    h('tbody', null, inv.lines.map((l) => {
      const unit = first(l['BT-130']);
      const extra = [first(l['BT-154']), all(l['BT-127']), l['BT-134'] || l['BT-135'] ? `${dateText(first(l['BT-134']), LANG)} - ${dateText(first(l['BT-135']), LANG)}` : null,
        ...l.allowances.map((a) => `${a.charge ? L.charge : L.allowance}: ${money(a.amount, cur, LANG)}${a.reason ? ` (${a.reason})` : ''}`)].filter(Boolean);
      return h('tr', null, [
        h('td', null, first(l['BT-126']) ?? ''),
        h('td', null, [h('span', { class: 'xv-item' }, `${first(l['BT-155']) ? `${first(l['BT-155'])} ` : ''}${first(l['BT-153']) ?? ''}`), ...extra.map((e) => h('span', { class: 'xv-sub' }, e))]),
        h('td', { class: 'num' }, `${money(first(l['BT-129']), '', LANG).replace(/[.,]00$/, '')} ${UNITS[unit]?.[LANG] ?? unit ?? ''}`),
        h('td', { class: 'num' }, `${money(first(l['BT-146']), '', LANG)}${first(l['BT-149']) && first(l['BT-149']) !== '1' ? ` / ${first(l['BT-149'])}` : ''}`),
        h('td', { class: 'num' }, l['BT-152'] !== undefined ? percentText(first(l['BT-152']), LANG) : (first(l['BT-151']) ?? '')),
        h('td', { class: 'num' }, money(first(l['BT-131']), '', LANG)),
      ]);
    })),
  ]);
  const totals = ['BT-106', 'BT-107', 'BT-108', 'BT-109', 'BT-110', 'BT-112', 'BT-113', 'BT-114', 'BT-115'].filter((bt) => D[bt] !== undefined);
  const iban = inv.accounts.map((a) => first(a['BT-84'])).filter(Boolean)[0];
  return h('article', { class: 'xv-paper', id: 'xv-paper' }, [
    h('header', { class: 'xv-paper-head' }, [
      h('h2', null, `${TYPE_CODES[type]?.[LANG] ?? L.invoice} ${first(D['BT-1']) ?? ''}`),
      kv([[t('BT-2'), dateText(first(D['BT-2']), LANG)], [t('BT-72'), dateText(first(D['BT-72']), LANG)], [L.period, D['BT-73'] || D['BT-74'] ? `${dateText(first(D['BT-73']), LANG)} - ${dateText(first(D['BT-74']), LANG)}` : null], [t('BT-9'), dateText(first(D['BT-9']), LANG)]]),
    ]),
    h('div', { class: 'xv-parties' }, [partyBlock(inv.seller, 'seller'), partyBlock(inv.buyer, 'buyer')]),
    kv([[t('BT-10'), all(D['BT-10'])], [t('BT-13'), all(D['BT-13'])], [t('BT-14'), all(D['BT-14'])], [t('BT-12'), all(D['BT-12'])], [t('BT-11'), all(D['BT-11'])], [t('BT-16'), all(D['BT-16'])], [t('BT-17'), all(D['BT-17'])], [t('BT-19'), all(D['BT-19'])],
      [t('BT-25'), D['BT-25'] ? `${all(D['BT-25'])}${D['BT-26'] ? ` (${dateText(first(D['BT-26']), LANG)})` : ''}` : null], [t('BT-3'), type ? `${type} ${TYPE_CODES[type]?.[LANG] ?? ''}` : null], [t('BT-5'), cur]]),
    Object.keys(inv.delivery).length ? kv([[L.delivery, [first(inv.delivery['BT-70']), first(inv.delivery['BT-75']), [first(inv.delivery['BT-78']), first(inv.delivery['BT-77'])].filter(Boolean).join(' '), first(inv.delivery['BT-80'])].filter(Boolean).join(', ')]]) : null,
    Object.keys(inv.payee).length ? kv([[L.payee, [first(inv.payee['BT-59']), all(inv.payee['BT-60'])].filter(Boolean).join(', ')]]) : null,
    h('h3', null, `${L.lines} (${inv.lines.length})`),
    h('div', { class: 'table-scroll' }, [lines]),
    inv.allowances.length ? h('div', null, [h('h3', null, `${L.allowance} / ${L.charge}`), kv(inv.allowances.map((a) => [`${a.charge ? L.charge : L.allowance}${a.category ? ` (${a.category}${a.rate ? ` ${percentText(a.rate, LANG)}` : ''})` : ''}`, `${money(a.amount, cur, LANG)}${a.reason ? `, ${a.reason}` : ''}`]))]) : null,
    h('div', { class: 'xv-sums' }, [
      h('div', null, [h('h3', null, L.vat), h('table', { class: 'xv-vat' }, [h('tbody', null, inv.vat.map((v) => h('tr', null, [
        h('td', null, `${first(v['BT-118']) ?? ''} ${VAT_CATEGORIES[first(v['BT-118'])]?.[LANG] ?? ''}${v['BT-120'] ? `: ${all(v['BT-120'])}` : ''}`),
        h('td', { class: 'num' }, v['BT-119'] !== undefined ? percentText(first(v['BT-119']), LANG) : ''),
        h('td', { class: 'num' }, amt(v['BT-116'])), h('td', { class: 'num' }, amt(v['BT-117'])),
      ])))])]),
      h('table', { class: 'xv-totals' }, [h('tbody', null, totals.map((bt) => h('tr', { class: bt === 'BT-115' ? 'xv-due' : '' }, [h('th', { scope: 'row' }, t(bt)), h('td', { class: 'num' }, amt(D[bt]))])))]),
    ]),
    h('h3', null, L.payment),
    kv([
      [t('BT-81'), D['BT-81'] ? `${first(D['BT-81'])} ${PAYMENT_MEANS[first(D['BT-81'])]?.[LANG] ?? ''}` : null],
      [t('BT-84'), iban ? h('span', null, [h('code', null, iban), ' ', h('button', { type: 'button', class: 'link-btn', onclick: (e) => T.copy(iban, e.target, $('xv-status')) }, W.copy)]) : null],
      ...inv.accounts.flatMap((a) => [[t('BT-85'), all(a['BT-85'])], [t('BT-86'), all(a['BT-86'])]]),
      [t('BT-83'), all(D['BT-83'])], [t('BT-89'), all(D['BT-89'])], [t('BT-90'), all(D['BT-90'])], [t('BT-91'), all(D['BT-91'])], [t('BT-20'), all(D['BT-20'])],
      [W.due, D['BT-115'] ? amt(D['BT-115']) : null],
    ]),
    inv.notes.length ? h('div', null, [h('h3', null, L.notes), ...inv.notes.map((n) => h('p', { class: 'xv-note' }, n))]) : null,
    inv.attachments.length ? h('div', null, [h('h3', null, `${GROUPS['BG-24'][LANG]} (${inv.attachments.length})`), h('ul', { class: 'xv-attach' }, inv.attachments.map((a, i) => h('li', null, [
      a.embedded ? h('button', { type: 'button', class: 'link-btn', onclick: () => downloadAttachment(i, a) }, a.filename ?? a.id ?? `#${i + 1}`) : h('span', null, a.id ?? ''),
      ` ${[a.description, a.mime, a.size ? `${a.size.toLocaleString(LANG === 'de' ? 'de-DE' : 'en-US')} B` : null, a.uri].filter(Boolean).join(', ')}`,
    ])))]) : null,
    h('p', { class: 'xv-paper-foot' }, L.viewNote),
  ]);
}

function downloadAttachment(i, a) {
  const b64 = attachmentData(state.read.doc, i, state.read.format);
  if (!b64) return;
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
  save(new Blob([bytes], { type: a.mime ?? 'application/octet-stream' }), a.filename ?? `${a.id ?? 'anhang'}`);
}

function save(blob, name) {
  const url = URL.createObjectURL(blob);
  const link = h('a', { href: url, download: name });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

// One line per finding: a mark, the rule and its official message, then its BMF group and where it is.
function findingsList(v) {
  if (!v.findings.length) return h('p', { class: 'xv-ok' }, L.noFindings);
  const word = { error: LANG === 'de' ? 'Fehler' : 'error', warning: LANG === 'de' ? 'Warnung' : 'warning', information: LANG === 'de' ? 'Hinweis' : 'notice' };
  const cls = { error: 'sk', warning: 'own', information: 'plain' };
  return h('ol', { class: 'tf-items xv-items' }, v.findings.map((f) => h('li', { class: cls[f.level] ?? null }, [
    h('span', { class: 'k', 'aria-hidden': 'true' }, f.level === 'error' ? '!' : f.level === 'warning' ? '?' : 'i'),
    h('span', null, [f.page ? h('a', { href: `${T.base}/xrechnung-viewer/${f.page}` }, [h('code', null, f.id)]) : h('code', null, f.id ?? ''), ` ${f.message.replace(/^\[[^\]]+\]-?\s*/, '')}`]),
    h('em', null, [word[f.level] ?? f.level, f.bmf ? L.bucket[f.bmf] : null, f.location ? `${W.where}: ${f.location}` : null, f.note].filter(Boolean).join(' · ')),
  ])));
}

// The file as read here. A sample at rest keeps the page's own worked example (its check result,
// written into the HTML) on top, with the invoice folded under it.
function showRead(label, { atRest = false } = {}) {
  const r = state.read;
  const out = $('xv-out');
  const fmt = describeFormat(r.format, r.pdf, LANG);
  const note = r.format.profile?.einvoice === false ? (LANG === 'de' ? 'Dieses Profil gilt nach dem BMF-Schreiben vom 15.10.2025 nicht als E-Rechnung.' : 'This profile does not count as an e-invoice under the BMF letter of 15 Oct 2025.') : null;
  const view = state.invoice ? invoiceView(state.invoice) : h('p', null, W.notInvoice);
  const sample = $('xv-sample');
  if (atRest && sample) {
    for (const n of [...out.children]) if (n !== sample) n.remove();
    out.append(h('div', { id: 'xv-check' }), h('details', { class: 'xpand xv-asread' }, [h('summary', null, W.asRead), h('div', { class: 'xp-in' }, view)]));
    return;
  }
  const D = state.invoice?.doc;
  const due = D?.['BT-115'] ? money(first(D['BT-115']), first(D['BT-5']) ?? '', LANG) : null;
  out.textContent = '';
  out.append(...[
    h('div', { class: 'tf-rh' }, [state.sample ? h('span', { class: 'tf-tag' }, W.example) : h('span', { class: 'tf-tag run' }, W.yours), h('span', { class: 'tf-src' }, W.readHere)]),
    h('p', { class: 'tf-exin' }, label),
    due ? h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, due), h('span', null, W.due)]) : null,
    h('p', { class: 'tf-sub xv-answer' }, `${LANG === 'de' ? 'Ihre Datei ist' : 'Your file is'} ${fmt}.`),
    note ? h('p', { class: 'xv-warnline' }, note) : null,
    r.pdf?.xmp ? h('p', { class: 'tf-note' }, `PDF/A-${r.pdf.xmp.pdfaPart ?? '?'}${r.pdf.xmp.pdfaConformance ?? ''}${r.pdf.xmp.conformanceLevel ? `, Factur-X ${r.pdf.xmp.conformanceLevel}` : ''}${r.pdf.relationship ? `, AFRelationship ${r.pdf.relationship}` : ''}`) : null,
    h('div', { id: 'xv-check' }),
    view,
  ].filter(Boolean));
}

async function load(bytes, name, sample, { atRest = false } = {}) {
  $('xv-error').textContent = '';
  $('xv-explain-out').textContent = '';
  if (bytes.length > LIMITS.bytes) { $('xv-error').textContent = W.tooBig; return; }
  state.bytes = bytes; state.name = name; state.sample = sample;
  try {
    state.read = await readBytes(bytes);
    state.invoice = state.read.format.syntax === 'zugferd1' ? null : readInvoice(state.read.doc, state.read.format);
    showRead(sample ? W.samples[sample] : name, { atRest });
    if (!sample) $('xv-file-name').textContent = W.readLocal(name, bytes.length);
    $('xv-status').textContent = $('xv-out').querySelector('.xv-answer')?.textContent ?? '';
  } catch (e) {
    state.read = null; state.invoice = null;
    $('xv-out').textContent = '';
    $('xv-error').textContent = e instanceof InvoiceError ? e.message : String(e.message ?? e);
  }
}

const enc = new TextEncoder();
function loadSample(key, opts) {
  if (key === 'pdf') return load(samplePdf(SAMPLES.cii, SAMPLE_PDF_LINES), 'muster-zugferd.pdf', 'pdf', opts);
  return load(enc.encode(key === 'fehler' ? FAILING_SAMPLE : SAMPLES.ubl), `${key}.xml`, key, opts);
}

function base64(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

async function server(op) {
  if (!state.bytes) { $('xv-error').textContent = W.noNeed; return null; }
  $('xv-error').textContent = '';
  $('xv-status').textContent = op === 'pdf' ? W.making : W.checking;
  try {
    return await T.run(SLUG, { op, file: base64(state.bytes), lang: LANG });
  } catch (e) {
    $('xv-error').textContent = e.status === 401 ? W.signIn : e.message;
    return null;
  } finally { $('xv-status').textContent = ''; }
}

function showCheck(res) {
  const v = res.result.validation;
  $('xv-sample')?.remove();
  const box = $('xv-check');
  if (!box) return;
  box.textContent = '';
  const n = v.counts?.error ?? 0;
  box.append(h('section', { class: `xv-result xv-${v.status}` }, [
    h('div', { class: 'tf-rh' }, [h('span', { class: 'tf-tag run' }, W.check), h('span', { class: 'tf-src' }, v.scenario ?? '')]),
    h('p', { class: `tf-big xv-big xv-${v.status}` }, [h('b', { class: 'word' }, v.status === 'valid' ? W.valid : W.errors(n)), v.status === 'valid' ? null : h('span', null, W.invalid.toLowerCase())]),
    h('p', { class: 'tf-sub xv-answer' }, v.headline),
    findingsList(v),
    h('p', { class: 'tf-cost' }, `${v.versions}. ${LANG === 'de' ? 'Nicht geprüft' : 'Not checked'}: ${v.notChecked}. ${W.charged(res.charged?.amount ?? 0)}`),
  ]));
}

async function validate() {
  const res = await server('validate');
  if (res) showCheck(res);
}

async function makePdf() {
  const res = await server('pdf');
  if (!res) return;
  showCheck(res);
  const f = res.result.file;
  const bin = atob(f.base64);
  const bytes = new Uint8Array(bin.length);
  for (let k = 0; k < bin.length; k++) bytes[k] = bin.charCodeAt(k);
  const blob = new Blob([bytes], { type: 'application/pdf' });
  $('xv-check').prepend(h('p', { class: 'xv-downloads' }, [h('a', { href: URL.createObjectURL(blob), download: f.name, class: 'btn btn-small' }, `${W.download} (${f.name})`)]));
}

function csv() {
  if (!state.invoice) { $('xv-error').textContent = W.noNeed; return; }
  save(new Blob(['﻿', linesCsv(state.invoice, { lang: LANG })], { type: 'text/csv' }), `${String(first(state.invoice.doc['BT-1']) ?? 'rechnung').replace(/[^\w.-]+/g, '_')}-positionen.csv`);
}

async function explain(e) {
  e?.preventDefault();
  const rule = $('xv-rule').value.trim();
  const out = $('xv-explain-out');
  out.textContent = '';
  if (!rule) { out.append(h('p', { class: 'muted' }, W.explainNone)); return; }
  try {
    const res = await T.run(SLUG, { op: 'explain', rule, lang: LANG });
    const r = res.result;
    out.append(h('div', { class: 'xv-explained' }, [
      h('p', null, [h('code', null, r.rule), ` ${r.message}`]),
      r.explanation ? h('p', null, r.explanation.plain) : null,
      r.explanation ? h('p', null, [h('strong', null, LANG === 'de' ? 'Lösung: ' : 'Fix: '), r.explanation.fix]) : null,
      r.page ? h('p', null, [h('a', { href: `${T.base}/xrechnung-viewer/${r.page}` }, W.page)]) : null,
      h('p', { class: 'muted' }, r.source),
    ]));
  } catch (err) { out.append(h('p', { class: 'form-error' }, err.message)); }
}

function init() {
  $('xv-file').addEventListener('change', async (e) => { const f = e.target.files[0]; if (f) load(new Uint8Array(await f.arrayBuffer()), f.name, null); });
  const drop = $('xv-drop');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', async (e) => { e.preventDefault(); drop.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f) load(new Uint8Array(await f.arrayBuffer()), f.name, null); });
  for (const b of document.querySelectorAll('[data-sample]')) b.addEventListener('click', () => loadSample(b.dataset.sample));
  $('xv-validate').addEventListener('click', validate);
  $('xv-pdf').addEventListener('click', makePdf);
  $('xv-print').addEventListener('click', () => { if (state.invoice) window.print(); else $('xv-error').textContent = W.noNeed; });
  $('xv-csv').addEventListener('click', csv);
  $('xv-explain-form').addEventListener('submit', explain);
  const q = new URLSearchParams(location.search);
  const sample = ['fehler', 'ubl', 'pdf'].includes(q.get('sample')) ? q.get('sample') : 'fehler';
  loadSample(sample, { atRest: sample === 'fehler' }).then(() => { if (q.get('job') === 'validate') validate(); });
  if (q.get('rule')) { $('xv-rule').value = q.get('rule').slice(0, 40); explain(); }
  T.mountCodePanel($('xv-code'), SLUG);
}

init();
