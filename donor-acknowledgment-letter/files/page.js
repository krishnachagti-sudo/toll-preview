// The acknowledgment letters page. core.js (the same file the server runs) reads the gift list and
// works out every gift's letter type, IRS sentence and segments in the browser, so the table and the
// checks show before anything is sent. The PDFs are the server's answer to the same gifts: one
// sample letter (free) and the paid letters for the whole batch, sent in parts when it is large.
import { makeEngine, rowsFromCsv, readGift, usd, csvText, zipStore, AckError, TEMPLATE_COLUMNS, SAMPLES } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'donor-acknowledgment-letter';
const SHOWN = 60;
const SHOWN_FLAGS = 15;
const PART_ROWS = 400;
const PRICE = 0.05;
const CAP = 9;
const LABELS = { cash: 'Money gift', 'quid-pro-quo': 'Ticket or benefit', 'in-kind': 'In-kind', stock: 'Stock', daf: 'DAF grant', pledge: 'Pledge', services: 'Volunteer' };

const $ = (id) => document.getElementById(id);
let engine = null;
let tool = null;
let signedIn = false;
let current = null; // { input (without gifts), raw, result }

// ---------- files ----------

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
const pdfLink = (f) => download(f.filename, new Blob([base64Bytes(f.base64)], { type: 'application/pdf' }));

function sampleLinks() {
  const box = $('da-sample-links');
  const one = tool.examples.find((x) => x.input.op === 'preview')?.output.sample;
  const set = tool.examples.find((x) => x.input.op === 'letters')?.output.print;
  if (!box || !one || !set) return;
  box.textContent = '';
  box.append('a food bank\'s letter ', pdfLink(one), ' and a church\'s print file with a DAF grant and a memorial family notice ', pdfLink(set), '.');
}

// ---------- the form ----------

function fillOrg(o) {
  $('da-name').value = o.name ?? '';
  $('da-address').value = o.address ?? '';
  $('da-signer').value = o.signer ?? '';
  $('da-title').value = o.signerTitle ?? '';
  $('da-ein').value = o.ein ?? '';
  $('da-date').value = o.letterDate ?? '';
  $('da-message').value = o.message ?? '';
  $('da-exempt').checked = !!o.exemptLine;
  const religious = (o.benefits ?? (o.kind === 'church' ? 'religious' : 'none')) === 'religious';
  document.querySelector(`input[name="benefits"][value="${religious ? 'religious' : 'none'}"]`).checked = true;
}

function loadSample(which) {
  const s = SAMPLES[which] ?? SAMPLES.batch;
  fillOrg(s.org);
  $('da-paste').value = s.csv;
}

// The call's settings from the form (everything but the gifts), or an AckError.
function settings() {
  const name = $('da-name').value.trim();
  if (!name) throw new AckError('Name the organization, as it should appear on the letters.', 'org');
  const religious = document.querySelector('input[name="benefits"]:checked').value === 'religious';
  const org = { name, kind: religious ? 'church' : 'nonprofit', benefits: religious ? 'religious' : 'none' };
  const opt = (k, v) => { if (v) org[k] = v; };
  opt('address', $('da-address').value.trim());
  opt('signer', $('da-signer').value.trim());
  opt('signerTitle', $('da-title').value.trim());
  opt('letterDate', $('da-date').value);
  opt('message', $('da-message').value.trim());
  opt('exemptLine', $('da-exempt').checked);
  const ein = $('da-ein').value.trim();
  if (ein) {
    if (!/^\d{2}-?\d{7}$/.test(ein)) throw new AckError('An EIN is nine digits, written like 12-3456789.', 'org');
    org.ein = ein;
  }
  const options = {};
  const major = Number($('da-major').value);
  if (Number.isInteger(major) && major >= 1 && major !== 1000) options.majorUsd = major;
  const lapsed = Number($('da-lapsed').value);
  if (Number.isInteger(lapsed) && lapsed >= 1 && lapsed <= 60 && lapsed !== 12) options.lapsedMonths = lapsed;
  if ($('da-only').value) options.only = [$('da-only').value];
  if ($('da-replace').checked) options.replacement = true;
  return { org, ...(Object.keys(options).length ? { options } : {}) };
}

function rawGifts() {
  const text = $('da-paste').value;
  if (!text.trim()) return null;
  const read = rowsFromCsv(text);
  const rows = read.rows.map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, typeof v === 'string' ? v.slice(0, 200) : v])));
  return { rows, mapped: read.mapped, unknown: read.unknown };
}

// ---------- the summary, worked out here ----------

function put(el, ...children) {
  el.textContent = '';
  for (const c of children.flat()) if (c) el.append(c);
}

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const shortDate = (iso) => { const [y, m, d] = String(iso).split('-').map(Number); return m ? `${MONTHS[m - 1]} ${d}, ${y}` : String(iso); };

// The inputs in one line: the organization and the span of the gift dates.
function inputsLine(input, result) {
  const dates = result.letters.map((l) => l.date).filter(Boolean).sort();
  const span = dates.length ? (dates[0] === dates[dates.length - 1] ? `, ${shortDate(dates[0])}` : `, ${shortDate(dates[0])} to ${shortDate(dates[dates.length - 1])}`) : '';
  return `${input.org.name}, ${plural(result.totals.gifts, 'gift')}${span}`;
}

// One line per gift: its letter type and segments, and the IRS sentence it gets.
function giftItem(l, i) {
  const receipt = l.irs.length > 0;
  return h('li', { class: receipt ? null : 'plain' }, [
    h('span', { class: 'k', 'aria-hidden': 'true' }, String(i + 1)),
    h('span', {}, [l.donor, h('span', { class: 'da-when' }, ` · ${shortDate(l.date)}`)]),
    h('b', {}, l.amount ? usd(l.amount) : 'Described'),
    h('em', {}, [h('span', { class: 'da-tag' }, LABELS[l.variant]), ...l.segments.map((s) => h('span', { class: 'da-tag dim' }, s)), ' ', l.irs.join(' ') || 'None: not a receipt', l.notice ? ` Family notice to ${l.notice.to}.` : '']),
  ]);
}

function render(result, { example }) {
  const t = result.totals;
  const letters = result.letters.slice(0, SHOWN);
  const flags = result.flags.slice(0, SHOWN_FLAGS);
  const seg = t.bySegment;
  const extras = [
    t.notices ? plural(t.notices, 'family notice') : null,
    t.large ? `${plural(t.large, 'money gift')} of $250 or more` : null,
    t.disclosures ? plural(t.disclosures, '$75 disclosure') : null,
    t.setAside + t.leftOut ? `${t.setAside + t.leftOut} set aside` : null,
  ].filter(Boolean);
  put($('da-summary'),
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your gifts'),
      h('span', { class: 'tf-src' }, example ? 'Worked example' : 'Worked out on this page, free'),
    ]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${inputsLine(current.input, result)}` : inputsLine(current.input, result)),
    h('p', { class: 'tf-big' }, [h('b', {}, String(t.letters)), h('span', {}, t.letters === 1 ? 'letter' : 'letters')]),
    h('p', { class: 'tf-sub' }, extras.length ? `${extras.join(', ')}.` : 'Every gift gets its own letter.'),
    h('ol', { class: 'tf-items da-items' }, letters.map(giftItem)),
    result.letters.length > letters.length ? h('p', { class: 'tf-note' }, `And ${result.letters.length - letters.length} more letters.`) : null,
    flags.length
      ? h('details', { class: 'xpand da-check' }, [h('summary', {}, `To check (${result.flags.length})`), h('div', { class: 'xp-in' }, h('ul', { class: 'da-flags' }, flags.map((f) => h('li', {}, [h('span', { class: 'when' }, f.row ? `Row ${f.row}` : 'File'), h('span', {}, f.donor ? `${f.donor}: ${f.message}` : f.message)]))))])
      : h('p', { class: 'tf-note' }, 'Nothing to check'),
    h('details', { class: 'xpand' }, [h('summary', {}, 'The batch in full'), h('div', { class: 'xp-in' }, [
      h('p', {}, result.answer),
      h('p', {}, `Segments: ${seg.first} first, ${seg.repeat} repeat, ${seg.lapsed} lapsed, ${seg.major} major, ${seg.monthly} monthly, ${seg.memorial} memorial, ${seg.honor} in honor.`),
      result.columnsUsed ? h('p', {}, `Columns read: ${Object.entries(result.columnsUsed).map(([f, c]) => `${c} as ${f}`).join(', ')}${result.columnsIgnored.length ? `. Not used: ${result.columnsIgnored.join(', ')}` : ''}.`) : null,
    ])]),
  );
  const pick = $('da-sample-pick');
  pick.textContent = '';
  result.letters.slice(0, 200).forEach((l, i) => pick.append(h('option', { value: String(i + 1) }, `${i + 1}. ${l.donor}, ${l.date} (${LABELS[l.variant]})`)));
}

function analyse({ example = false } = {}) {
  $('da-file-err').textContent = '';
  $('da-error').textContent = '';
  current = null;
  $('da-buy').hidden = true;
  try {
    const raw = rawGifts();
    if (!raw) { put($('da-summary'), h('p', { class: 'muted' }, 'Open or paste a gift list to see each gift\'s letter.')); return; }
    const input = settings();
    const gifts = raw.rows.map((r) => readGift(r, r.row));
    const result = engine.build({ org: { ...input.org, addressLines: [] }, gifts, options: input.options ?? {}, mapped: raw.mapped, unknown: raw.unknown });
    current = { input, raw, result };
    render(result, { example });
    $('da-buy').hidden = false;
    $('da-preview-got').textContent = '';
    $('da-got').textContent = '';
    $('da-buy-err').textContent = '';
    priceLine();
  } catch (e) {
    if (!(e instanceof AckError)) throw e;
    (e.field === 'org' ? $('da-error') : $('da-file-err')).textContent = e.message;
    put($('da-summary'), h('p', { class: 'muted' }, 'Fix the file or the settings to see the letters.'));
  }
}

// ---------- the paid run, in parts ----------

// Rows in parts of PART_ROWS, a donor's rows kept together so the segments read the same.
function parts() {
  const byDonor = new Map();
  for (const r of current.raw.rows) {
    const key = (r.donorId ?? r.donor ?? '').toLowerCase();
    if (!byDonor.has(key)) byDonor.set(key, []);
    byDonor.get(key).push(r);
  }
  const out = [];
  let part = [];
  for (const rows of byDonor.values()) {
    if (part.length && part.length + rows.length > PART_ROWS) { out.push(part); part = []; }
    part.push(...rows);
  }
  if (part.length) out.push(part);
  return out;
}

async function priceLine() {
  const n = current.result.totals.letters;
  const words = `${n} ${n === 1 ? 'letter' : 'letters'} at $0.05 each: ${n * PRICE > CAP ? `$${CAP.toFixed(2)} (the monthly cap)` : `$${(n * PRICE).toFixed(2)}`} at most`;
  const el = $('da-quote');
  if (!signedIn) { el.textContent = `${words}. Sign in to make them.`; return; }
  const ps = parts();
  if (ps.length > 1) { el.textContent = `${words}, sent in ${ps.length} parts. Letters you already made for these gifts in the last 180 days are free.`; return; }
  try {
    const q = (await T.api(`/api/run/${SLUG}/quote`, { body: { op: 'letters', deliver: 'files', ...current.input, gifts: ps[0] } })).quote;
    el.textContent = q.amount ? `This costs ${q.display} from your balance (${words}).` : 'These letters are free for you now (made in the last 180 days, or under the monthly cap).';
  } catch {
    el.textContent = words;
  }
}

function errorInto(box, e) {
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

async function onPreview() {
  const button = $('da-preview');
  const got = $('da-preview-got');
  button.disabled = true;
  got.textContent = '';
  try {
    const sample = Number($('da-sample-pick').value) || 1;
    const json = await T.run(SLUG, { op: 'preview', ...current.input, gifts: current.raw.rows, sample });
    got.append(`Letter ${sample}: `, pdfLink(json.result.sample), '.');
  } catch (e) {
    errorInto(got, e);
  } finally {
    button.disabled = false;
  }
}

async function onMake() {
  const button = $('da-make');
  const got = $('da-got');
  const err = $('da-buy-err');
  button.disabled = true;
  got.textContent = '';
  err.textContent = '';
  const ps = parts();
  const files = [];
  const prints = [];
  const summaries = [];
  const emails = [];
  const texts = [];
  let charged = 0;
  try {
    for (const [i, gifts] of ps.entries()) {
      $('da-status').textContent = ps.length > 1 ? `Making part ${i + 1} of ${ps.length}.` : 'Making the letters.';
      const json = await T.run(SLUG, { op: 'letters', deliver: 'files', ...current.input, gifts });
      files.push(...json.result.files);
      prints.push(json.result.print);
      summaries.push(json.result.summaryCsv);
      texts.push(...json.result.texts);
      if (json.result.emailCsv) emails.push(json.result.emailCsv);
      charged += json.charged?.amount ?? 0;
    }
  } catch (e) {
    errorInto(err, e);
    if (files.length) err.append(` ${files.length} files were made before this; they are below.`);
  }
  if (files.length) {
    const zip = zipStore(files.map((f) => ({ name: f.filename, bytes: base64Bytes(f.base64) })));
    const join = (list) => list.map((t, i) => (i ? t.split('\r\n').slice(1).join('\r\n') : t)).join('');
    got.append(
      `${files.length} files: `,
      download('acknowledgment-letters.zip', new Blob([zip], { type: 'application/zip' })), ' (one PDF per letter and notice), ',
      ...prints.flatMap((p, i) => [download(prints.length > 1 ? p.filename.replace(/\.pdf$/, `-part-${i + 1}.pdf`) : p.filename, new Blob([base64Bytes(p.base64)], { type: 'application/pdf' })), ', ']),
      download('acknowledgment-summary.csv', join(summaries), 'text/csv'), ', ',
      download('acknowledgment-letters.txt', texts.map((t) => `${t.file}\n\n${t.text}`).join('\n\n----------\n\n'), 'text/plain'),
      emails.length ? ', ' : '',
      emails.length ? download('acknowledgment-email-list.csv', join(emails), 'text/csv') : '',
      '.',
      charged ? ` Charged $${(charged / 1_000_000).toFixed(2)}.` : ' No charge.',
    );
  }
  $('da-status').textContent = '';
  button.disabled = false;
}

// ---------- start ----------

async function start() {
  T.mountCodePanel($('da-code'), SLUG);
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('da-summary').textContent = 'The worked example could not load. Reload the page to try again.';
    return;
  }
  engine = makeEngine({ thresholds: tool.examples.find((x) => x.input.op === 'rules').output.thresholds });
  sampleLinks();
  T.me().then((account) => { signedIn = !!account; if (current) priceLine(); }).catch(() => {});

  const params = new URLSearchParams(window.location.search);
  loadSample(params.get('sample') ?? 'batch');
  const only = params.get('only');
  if (only && [...$('da-only').options].some((o) => o.value === only)) $('da-only').value = only;
  analyse({ example: true });

  let timer = null;
  const soon = () => { clearTimeout(timer); timer = setTimeout(() => analyse(), 300); };
  for (const id of ['da-paste', 'da-name', 'da-address', 'da-signer', 'da-title', 'da-ein', 'da-message', 'da-major', 'da-lapsed']) $(id).addEventListener('input', soon);
  for (const id of ['da-date', 'da-exempt', 'da-replace', 'da-only']) $(id).addEventListener('change', () => analyse());
  document.querySelectorAll('input[name="benefits"]').forEach((el) => el.addEventListener('change', () => analyse()));
  $('da-upload').addEventListener('change', async () => {
    const file = $('da-upload').files[0];
    if (!file) return;
    if (/\.xlsx?$/i.test(file.name)) { $('da-file-err').textContent = 'Save the sheet as CSV first (File, Save as, CSV), or copy the cells and paste them here.'; return; }
    $('da-paste').value = await file.text();
    analyse();
  });
  $('da-template').addEventListener('click', (ev) => {
    ev.preventDefault();
    const a = download('acknowledgment-letters-template.csv', csvText(TEMPLATE_COLUMNS, []), 'text/csv');
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  $('da-preview').addEventListener('click', onPreview);
  $('da-make').addEventListener('click', onMake);
  $('da-form').addEventListener('submit', (ev) => ev.preventDefault());
}

start();
