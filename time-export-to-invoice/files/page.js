// The time-export-to-invoice page. core.js (the same file the server runs) reads the export and
// builds the lines in the browser, with the hours calculator's rounding (its core.js, loaded from
// its own files), so the free preview and the paid invoice always agree. The file stays on this
// page until the visitor asks for the invoice; then it is sent once, to make it.
import { makeInvoicer, InvoiceError, money, centsOf } from './core.js';
import { roundPunch } from '../../hours-calculator/files/core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'time-export-to-invoice';
const $ = (id) => document.getElementById(id);

const round = (v, inc, mode) => (mode === 'nearest' ? roundPunch(v, inc, 'nearest') : roundPunch(v, inc, 'in-up-out-down', mode === 'up' ? 'in' : 'out'));
const invoicer = makeInvoicer({ round });

let tool = null;
let signedIn = false;
let fileText = '';
let samples = [];

// ---------- reading the form ----------

const RATE_KINDS = ['task', 'tag', 'project', 'client', 'user', 'person'];
// "default = 95" and "task: Design = 90" lines -> the rate card.
function readRates(text) {
  const card = {};
  const errors = [];
  for (const [i, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trim();
    if (!line) continue;
    const m = /^(?:(\w+)\s*:\s*)?(.+?)\s*[=:]\s*\$?([\d,]+(?:\.\d{1,2})?)\s*(?:\/\s*h(?:our)?)?$/i.exec(line);
    if (!m || centsOf(m[3]) === null) { errors.push(`Line ${i + 1} ("${line}") is not "name = rate".`); continue; }
    const kind = m[1] ? m[1].toLowerCase() : null;
    if (!kind && /^default$/i.test(m[2])) { card.default = m[3]; continue; }
    if (!kind || !RATE_KINDS.includes(kind)) { errors.push(`Line ${i + 1}: start with task:, tag:, project:, client: or person:, or write "default = 95".`); continue; }
    const key = kind === 'person' ? 'user' : kind;
    card[key] = { ...(card[key] ?? {}), [m[2]]: m[3] };
  }
  return { card, errors };
}
function rateText(card) {
  const lines = card.default ? [`default = ${card.default}`] : [];
  for (const kind of ['task', 'tag', 'project', 'client', 'user']) for (const [k, v] of Object.entries(card[kind] ?? {})) lines.push(`${kind === 'user' ? 'person' : kind}: ${k} = ${v}`);
  return lines.join('\n');
}

const num = (id) => $(id).value.trim();
// The input the server would get, from the form. Throws InvoiceError naming a field.
function readForm() {
  if (!fileText.trim()) throw new InvoiceError('Open or paste a time export first.', 'csv');
  const { card, errors } = readRates($('ti-rates').value);
  if (errors.length) throw new InvoiceError(errors[0], 'rates');
  const d = { op: 'preview', source: $('ti-source').value, csv: fileText, groupBy: $('ti-group').value, rates: card, billable: $('ti-billable').value, quantity: $('ti-qty').value, dateOrder: $('ti-order').value };
  if ($('ti-inc').value) d.rounding = { increment: Number($('ti-inc').value), mode: $('ti-mode').value, level: $('ti-level').value };
  if (num('ti-min')) {
    if (!/^\d{1,3}$/.test(num('ti-min')) || Number(num('ti-min')) > 240) throw new InvoiceError('The minimum is whole minutes from 0 to 240.', 'minimumMinutes');
    d.minimumMinutes = Number(num('ti-min'));
  }
  if ($('ti-from').value) d.periodFrom = $('ti-from').value;
  if ($('ti-to').value) d.periodTo = $('ti-to').value;
  if (d.periodFrom && d.periodTo && d.periodFrom > d.periodTo) throw new InvoiceError('"Invoice to" is before "Invoice from".', 'periodTo');
  if (num('ti-retainer')) {
    const hrs = Number(num('ti-retainer'));
    if (!/^\d{1,5}(\.\d{1,2})?$/.test(num('ti-retainer')) || !hrs) throw new InvoiceError('Retainer hours are a number such as 20 or 12.5.', 'retainer');
    d.retainer = { hours: hrs };
    if (num('ti-overage')) d.retainer.overageRate = num('ti-overage');
  }
  if (num('ti-discount')) d.discountPercent = num('ti-discount');
  if (num('ti-tax')) d.taxPercent = num('ti-tax');
  if (num('ti-cap')) d.capAmount = num('ti-cap');
  if ($('ti-desc').checked) d.showDescriptions = true;
  const cur = num('ti-currency').toUpperCase();
  if (cur && cur !== 'USD') {
    if (!/^[A-Z]{3}$/.test(cur)) throw new InvoiceError('The currency is a three-letter code such as USD or EUR.', 'currency');
    d.currency = cur;
  }
  return d;
}

function invoiceInput() {
  const d = { ...readForm(), op: 'invoice' };
  delete d.dateOrder;
  if ($('ti-order').value !== 'auto') d.dateOrder = $('ti-order').value;
  d.client = num('ti-client');
  if (!d.client) throw new InvoiceError('Name the client, as it should print on the invoice.', 'client');
  for (const [id, key] of [['ti-number', 'invoiceNumber'], ['ti-issue', 'issueDate'], ['ti-due', 'dueDate'], ['ti-seller', 'seller'], ['ti-seller-details', 'sellerDetails'], ['ti-client-details', 'clientDetails'], ['ti-notes', 'notes']]) {
    if (num(id)) d[key] = num(id);
  }
  return d;
}

// ---------- the preview ----------

const put = (el, ...kids) => { el.textContent = ''; for (const k of kids.flat()) if (k) el.append(k); };
const table = (cols, rows, cls = '') => h('div', { class: 'table-scroll' }, h('table', { class: `rules ti-table ${cls}` }, [
  h('thead', {}, h('tr', {}, cols.map((c, i) => h('th', { scope: 'col', class: i && c.num ? 'num' : null }, c.label)))),
  h('tbody', {}, rows),
]));
// One line per figure: a mark, what it is, the amount and where it comes from.
const item = (k, label, value, why, cls = null) => h('li', { class: cls }, [
  h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, label), h('b', {}, value), h('em', {}, why),
]);
const fold = (summary, ...kids) => h('details', { class: 'xpand' }, [h('summary', {}, summary), h('div', { class: 'xp-in' }, kids)]);
const SOURCES = { toggl: 'Toggl Track', clockify: 'Clockify', harvest: 'Harvest', everhour: 'Everhour', other: 'A CSV' };

// The inputs in one line: "Toggl Track export, 13 entries, one line per project and task, 15 minutes up per entry, 3 rates".
function inputsLine(b) {
  const r = b.rounding;
  const rates = $('ti-rates').value.split('\n').filter((l) => l.includes('=')).length;
  return [
    `${SOURCES[b.source.given] ?? 'A'} export, ${b.totals.entries} ${b.totals.entries === 1 ? 'entry' : 'entries'}`,
    `one line per ${$('ti-group').selectedOptions[0].textContent.toLowerCase()}`,
    r.increment ? `${r.increment} minutes ${r.mode} per ${r.level}` : 'no rounding',
    `${rates} ${rates === 1 ? 'rate' : 'rates'}`,
  ].join(', ');
}

function render(b, { example = false, note = '' } = {}) {
  const t = b.totals;
  const shown = b.lines.slice(0, 3);
  const rec = b.reconciliation;
  const left = rec.excluded.filter((x) => x.entries);
  put($('ti-out'),
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src' }, 'Worked out in your browser'),
    ]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${inputsLine(b)}` : inputsLine(b)),
    h('p', { class: 'tf-big' }, [h('b', {}, t.total), h('span', {}, `${t.lines} ${t.lines === 1 ? 'line' : 'lines'}, ${t.billedHours} h billed`)]),
    h('p', { class: 'tf-sub' }, b.answer),
    note ? h('p', { class: 'tf-note' }, note) : null,
    h('ul', { class: 'tf-items ti-items' }, [
      item('#', 'Entries', String(t.entries), `${rec.rowsRead} rows read; ${b.source.words}`),
      item('h', 'Exact time', `${t.rawTime}`, `${t.rawHours} h in the entries on the invoice`, 'plain'),
      item('↑', 'Billed time', `${t.billedHours} h`, `${b.rounding.text ?? 'no rounding'}: ${rec.billed.difference}`),
      ...shown.map((l) => item(String(l.n), l.label, money(l.amountCents, t.currency), `${l.quantity} h at ${l.rate} (${l.rateSource}); ${l.detail}`)),
      b.lines.length > shown.length ? item('+', `${b.lines.length - shown.length} more ${b.lines.length - shown.length === 1 ? 'line' : 'lines'}`, '', 'in the invoice below', 'dim') : null,
      t.discount ? item('−', `Discount ${t.discountPercent}%`, t.discount, 'the discount you entered') : null,
      t.cap ? item('≤', 'Not to exceed', t.cap, 'the cap you entered') : null,
      t.tax ? item('%', `Tax ${t.taxPercent}%`, t.tax, 'at the rate you entered') : null,
      item('=', 'Total', t.total, b.lines.length > shown.length ? `subtotal of all ${b.lines.length} lines: ${t.subtotal}` : `subtotal ${t.subtotal}`, 'tot hi'),
    ]),
    b.retainer ? h('p', { class: 'tf-note' }, `Retainer: ${b.retainer.usedHours} of ${b.retainer.blockHours} hours used, ${b.retainer.remainingHours} left; ${b.retainer.overageHours} hours over the block at ${b.retainer.overageRate}.`) : null,
    b.flags.length ? h('ul', { class: 'ti-flags' }, b.flags.map((f) => h('li', {}, f.message))) : null,
    fold('How the rounding changes the bill',
      table([{ label: 'Method' }, { label: 'Hours', num: true }, { label: 'At your rates', num: true }], rec.methods.map((m, i) => h('tr', { class: chosen(b, i) ? 'ti-chosen' : null }, [
        h('th', { scope: 'row' }, m.method + (chosen(b, i) ? ' (this invoice)' : '')),
        h('td', { class: 'num' }, m.hours),
        h('td', { class: 'num' }, m.amount),
      ]))),
      h('p', { class: 'ti-aside' }, `Each entry at 2 decimals of an hour, then x rate (Clockify's invoice method): ${rec.twoDecimalsPerEntry.invoice}. Exact total time x rate (Clockify's report method): ${rec.twoDecimalsPerEntry.report}. Difference: ${rec.twoDecimalsPerEntry.difference}.`)),
    fold(`What was left out (${left.reduce((n, x) => n + x.entries, 0) + rec.rowsSkipped.length})`, h('ul', { class: 'ti-flags' }, [
      ...left.map((x) => h('li', {}, `${x.entries} ${x.entries === 1 ? 'entry' : 'entries'} ${x.reason} (${x.time})`)),
      rec.rowsSkipped.length ? h('li', {}, `${rec.rowsSkipped.length} unreadable ${rec.rowsSkipped.length === 1 ? 'row' : 'rows'}`) : null,
      !left.length && !rec.rowsSkipped.length ? h('li', {}, 'Nothing: every row is on the invoice.') : null,
    ])),
    h('p', { class: 'tf-cost' }, 'Worked out on this page, free; the file does not leave your browser.'),
  );
}
// Which reconciliation row is this invoice's own method.
function chosen(b, i) {
  if (!b.rounding.increment) return i === 0;
  return i === (b.rounding.level === 'entry' ? 1 : 2);
}

function errorInto(box, e) {
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

let lastPreview = null;
function update({ example = false, note = '' } = {}) {
  $('ti-error').textContent = '';
  $('ti-file-err').textContent = '';
  $('ti-rates-err').textContent = '';
  try {
    const d = readForm();
    lastPreview = invoicer.build(d);
    render(lastPreview, { example, note });
    buy.refresh();
  } catch (e) {
    if (!(e instanceof InvoiceError)) throw e;
    const box = e.field === 'rates' ? $('ti-rates-err') : e.field === 'csv' || e.field === 'columns' ? $('ti-file-err') : $('ti-error');
    box.textContent = e.message;
    // A problem with the pasted export shows the export, so it can be fixed in place.
    if (box === $('ti-file-err') && $('ti-paste').value) $('ti-pastefold').open = true;
  }
}

// ---------- the invoice ----------

function download(name, body, type) {
  const blob = body instanceof Blob ? body : new Blob([body], { type });
  return h('a', { href: URL.createObjectURL(blob), download: name }, name);
}
function base64Bytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const files = (r) => {
  const pdf = r.pdf;
  const stem = pdf.filename.replace(/\.pdf$/, '');
  return [download(pdf.filename, new Blob([base64Bytes(pdf.base64)], { type: 'application/pdf' })), ' (PDF), ', download(`${stem}-lines.csv`, r.csv, 'text/csv'), ' and ', download(`${stem}-entries.csv`, r.entriesCsv, 'text/csv'), ' (CSV)'];
};

function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'Free this time.';
  return '';
}

const buy = {
  price: h('p', { class: 'ti-aside' }),
  button: h('button', { class: 'btn', type: 'button' }, 'Make the invoice'),
  got: h('p', { class: 'ti-got', role: 'status' }),
  err: h('p', { class: 'form-error', role: 'alert' }),
  mount() {
    put($('ti-buy'), this.price, this.button, this.got, this.err);
    this.button.addEventListener('click', () => this.go());
    for (const id of ['ti-client']) $(id).addEventListener('change', () => this.refresh());
  },
  async refresh() {
    const text = tool?.pricing?.actions.find((a) => a.name === 'invoice')?.text;
    const words = text ? T.money(text) : '$0.40 per invoice';
    if (!signedIn) { this.price.textContent = `${words}. Sign in to make it.`; return; }
    let input;
    try { input = invoiceInput(); } catch { this.price.textContent = `${words}. Name the client to see your price.`; return; }
    try {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
      this.price.textContent = q.amount ? `This invoice costs ${q.display} from your balance (${words}).` : `This invoice is free for you now (${words}).`;
    } catch { this.price.textContent = words; }
  },
  async go() {
    this.err.textContent = '';
    this.got.textContent = '';
    let input;
    try { input = invoiceInput(); } catch (e) { this.err.textContent = e.message; return; }
    this.button.disabled = true;
    try {
      const json = await T.run(SLUG, input);
      this.got.append('Your invoice: ', ...files(json.result), `. ${costNote(json)}`);
    } catch (e) {
      errorInto(this.err, e);
    } finally {
      this.button.disabled = false;
    }
  },
};

// ---------- inputs from the address ----------

// Links from the guides carry the settings (?sample=0&group=task&inc=15&mode=up&level=entry
// &rates=task:Design=90;task:Development=120): the page opens with them filled in and the preview
// worked out here, free. Anything unusable is ignored.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  if (![...q.keys()].length) return false;
  const pick = (key, id) => { const v = q.get(key); if (v !== null && [...$(id).options].some((o) => o.value === v)) $(id).value = v; };
  pick('source', 'ti-source');
  pick('group', 'ti-group');
  pick('inc', 'ti-inc');
  pick('mode', 'ti-mode');
  pick('level', 'ti-level');
  pick('billable', 'ti-billable');
  pick('qty', 'ti-qty');
  if (q.get('rates')) $('ti-rates').value = q.get('rates').split(';').map((x) => x.replace(/=/, ' = ').replace(/^(\w+):/, '$1: ')).join('\n');
  for (const [key, id] of [['min', 'ti-min'], ['retainer', 'ti-retainer'], ['overage', 'ti-overage'], ['discount', 'ti-discount'], ['tax', 'ti-tax'], ['cap', 'ti-cap']]) if (q.get(key) && /^[\d.]{1,10}$/.test(q.get(key))) $(id).value = q.get(key);
  for (const [key, id] of [['from', 'ti-from'], ['to', 'ti-to']]) if (/^\d{4}-\d{2}-\d{2}$/.test(q.get(key) ?? '')) $(id).value = q.get(key);
  if (q.get('desc') === '1') $('ti-desc').checked = true;
  // Settings from the link that live in More options show themselves.
  if (['from', 'to', 'billable', 'qty', 'min', 'retainer', 'overage', 'discount', 'tax', 'cap', 'desc'].some((k) => q.has(k))) document.querySelector('.ti-options').open = true;
  const s = Number(q.get('sample'));
  if (q.get('sample') !== null && samples[s]) useSample(s, { keepSettings: true });
  return true;
}

function useSample(i, { keepSettings = false } = {}) {
  const ex = samples[i];
  fileText = ex.input.csv;
  $('ti-paste').value = fileText;
  if (keepSettings) return;
  $('ti-source').value = ex.input.source;
  $('ti-group').value = ex.input.groupBy;
  $('ti-inc').value = ex.input.rounding ? String(ex.input.rounding.increment) : '';
  if (ex.input.rounding) { $('ti-mode').value = ex.input.rounding.mode; $('ti-level').value = ex.input.rounding.level; }
  $('ti-rates').value = rateText(ex.input.rates);
}

function sampleLinks() {
  const ex = tool.examples.find((x) => x.input.op === 'invoice');
  if (!ex?.output.pdf) return;
  put($('ti-sample-links'), files(ex.output), '.');
}

// ---------- start ----------

async function start() {
  T.mountCodePanel($('ti-code'), SLUG);
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('ti-out').textContent = 'The worked example could not load. Open your export to see its lines.';
  }
  samples = (tool?.examples ?? []).filter((x) => x.input.op === 'preview');
  if (tool) sampleLinks();
  buy.mount();
  T.me().then((account) => { signedIn = !!account; buy.refresh(); }).catch(() => {});

  const soon = (fn) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, 250); }; };
  $('ti-upload').addEventListener('change', async () => {
    const f = $('ti-upload').files[0];
    if (!f) return;
    if (f.size > 100_000) { $('ti-file-err').textContent = 'That file is over 100 kB. Export one month at a time, or fewer columns.'; return; }
    fileText = await f.text();
    $('ti-paste').value = fileText;
    update();
  });
  $('ti-paste').addEventListener('input', soon(() => { fileText = $('ti-paste').value; update(); }));
  for (const el of document.querySelectorAll('#ti-form select, #ti-form input:not([type=file]), #ti-rates')) {
    el.addEventListener('change', () => update());
    if (el.tagName !== 'SELECT') el.addEventListener('input', soon(update));
  }
  $('ti-currency').addEventListener('input', soon(update));
  $('ti-form').addEventListener('submit', (e) => {
    e.preventDefault();
    update();
    if (window.matchMedia('(max-width: 1080px)').matches) $('ti-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  for (const b of document.querySelectorAll('[data-sample]')) b.addEventListener('click', () => { useSample(Number(b.dataset.sample)); update({ example: true }); });

  const linked = fromQuery();
  if (!fileText && samples.length) useSample(0, { keepSettings: linked });
  if (fileText) update({ example: !linked, note: linked ? 'Worked out on this page from the link you followed. Open your own export to replace the sample.' : 'Worked out on this page from a made-up month of Toggl entries. Open your own export to replace it.' });
}

start();
