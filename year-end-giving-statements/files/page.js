// The giving statements page. core.js (the same file the server runs) reads the gift file and works
// out every donor's statement in the browser, so the totals, the sentences and the flags show
// before anything is sent. The PDFs are the server's answer to the same gifts: the preview (free)
// for one donor, and the paid statements for all of them, sent in parts split by donor when the
// file is larger than one request allows.
import {
  makeEngine, rowsFromCsv, readGift, usd, csvText, zipStore, GivingError, TEMPLATE_COLUMNS,
} from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'year-end-giving-statements';
const SHOWN_DONORS = 40;
const SHOWN_FLAGS = 15;
const PART_CHARS = 1_900_000; // under this tool's 2 MB request limit (maxBody in tool.js)
const PRICE = 0.1;
const CAP = 19;

const $ = (id) => document.getElementById(id);
let engine = null;
let tool = null;
let signedIn = false;
let current = null; // { input (without gifts), gifts, result }

// A household giving quarterly, for the letter template's link (?sample=letter).
const LETTER = {
  org: { name: 'Hope Valley Community Center', address: '5 Center Street, Fairborn, OH 45324', signer: 'Marcus Hill', signerTitle: 'Board Treasurer', statementDate: '2027-01-12', message: 'Thank you for standing with our neighbors all year. Your gifts kept the after-school program open five days a week. This letter lists the contributions Hope Valley Community Center received from you in 2026; please keep it with your tax records.' },
  csv: 'Donor,Date,Amount,Fund,Method\r\nElena and David Garcia,2026-03-01,250.00,After-school program,Bank transfer\r\nElena and David Garcia,2026-06-01,275.00,After-school program,Bank transfer\r\nElena and David Garcia,2026-09-01,250.00,After-school program,Bank transfer\r\nElena and David Garcia,2026-12-01,400.00,After-school program,Bank transfer\r\n',
};

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
  const box = $('gs-sample-links');
  const church = tool.examples.find((x) => x.input.op === 'preview')?.output.sample;
  const np = tool.examples.find((x) => x.input.op === 'statements')?.output.print;
  if (!box || !church || !np) return;
  box.textContent = '';
  box.append('a church statement ', pdfLink(church), ' and a nonprofit print file with a gala ticket and a stock gift ', pdfLink(np), '.');
}

// ---------- the form ----------

const gifts2csv = (gifts) => {
  const keys = [...new Set(gifts.flatMap((g) => Object.keys(g)))];
  const head = { donor: 'Donor', date: 'Date', amount: 'Amount', fund: 'Fund', method: 'Method', type: 'Type', description: 'Description', benefitValue: 'Benefit value', benefitDescription: 'Benefit description', email: 'Email' };
  return csvText(keys.map((k) => head[k] ?? k), gifts.map((g) => keys.map((k) => g[k] ?? '')));
};

function fillOrg(o) {
  $('gs-name').value = o.name ?? '';
  $('gs-address').value = o.address ?? '';
  $('gs-signer').value = o.signer ?? '';
  $('gs-title').value = o.signerTitle ?? '';
  $('gs-ein').value = o.ein ?? '';
  $('gs-date').value = o.statementDate ?? '';
  $('gs-message').value = o.message ?? '';
  $('gs-exempt').checked = !!o.exemptLine;
  const religious = (o.benefits ?? (o.kind === 'church' ? 'religious' : 'none')) === 'religious';
  document.querySelector(`input[name="benefits"][value="${religious ? 'religious' : 'none'}"]`).checked = true;
}

function loadSample(which) {
  const ex = which === 'nonprofit' ? tool.examples.find((x) => x.input.op === 'statements') : tool.examples.find((x) => x.input.op === 'preview');
  if (which === 'letter') {
    fillOrg(LETTER.org);
    $('gs-paste').value = LETTER.csv;
  } else {
    fillOrg(ex.input.org);
    $('gs-paste').value = ex.input.csv ?? gifts2csv(ex.input.gifts);
  }
  $('gs-year').value = '2026';
  $('gs-range').value = '';
}

function fillYears() {
  const sel = $('gs-year');
  for (let y = 2027; y >= 2018; y--) sel.append(h('option', { value: String(y) }, String(y)));
  sel.value = '2026';
}

const RANGES = { q1: ['01-01', '03-31'], q2: ['04-01', '06-30'], q3: ['07-01', '09-30'], q4: ['10-01', '12-31'], h1: ['01-01', '06-30'] };

function mergeList() {
  return $('gs-merge').value.split(/\r?\n/).map((line) => {
    const [into, rest] = line.split(':');
    if (!into?.trim() || !rest?.trim()) return null;
    return { into: into.trim().slice(0, 120), from: rest.split(';').map((s) => s.trim().slice(0, 120)).filter(Boolean).slice(0, 20) };
  }).filter((m) => m && m.from.length);
}

// The call's settings from the form (everything but the gifts), or a GivingError.
function settings() {
  const name = $('gs-name').value.trim();
  if (!name) throw new GivingError('Name the organization, as it should appear on the statements.', 'org');
  const religious = document.querySelector('input[name="benefits"]:checked').value === 'religious';
  const org = { name, kind: religious ? 'church' : 'nonprofit', benefits: religious ? 'religious' : 'none' };
  const opt = (k, v) => { if (v) org[k] = v; };
  opt('address', $('gs-address').value.trim());
  opt('signer', $('gs-signer').value.trim());
  opt('signerTitle', $('gs-title').value.trim());
  opt('statementDate', $('gs-date').value);
  opt('message', $('gs-message').value.trim());
  const ein = $('gs-ein').value.trim();
  if (ein) {
    if (!/^\d{2}-?\d{7}$/.test(ein)) throw new GivingError('An EIN is nine digits, written like 12-3456789.', 'org');
    org.ein = ein;
  }
  opt('exemptLine', $('gs-exempt').checked);
  opt('nonItemizerNote', $('gs-nonitem').checked);
  opt('namesLastFirst', $('gs-flip').checked);
  const year = Number($('gs-year').value);
  const range = RANGES[$('gs-range').value];
  const period = range ? { from: `${year}-${range[0]}`, to: `${year}-${range[1]}` } : { year };
  const merge = mergeList();
  return { org, ...period, ...(merge.length ? { merge } : {}) };
}

// The pasted or opened file as raw gift rows (strings, each with its line number).
function rawGifts() {
  const text = $('gs-paste').value;
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

// The inputs in one line: "Grace Community Church (sample), 2026, 10 gift rows".
function inputsLine(input, raw) {
  const org = input.org?.name || 'Your organization';
  const period = input.year !== undefined ? String(input.year) : `${input.from} to ${input.to}`;
  return `${org}, ${period}, ${raw.rows.length} gift ${raw.rows.length === 1 ? 'row' : 'rows'}`;
}

const SENTENCE = (d) => (d.benefits ? 'goods or services marked, with the disclosure' : d.sentence.startsWith('The only') ? 'intangible religious benefits only' : 'no goods or services');

// One line per donor: the gift count, the donor, the total, and the sentence the statement carries.
function donorItem(d) {
  const extra = [d.largeGifts ? `${d.largeGifts} gift${d.largeGifts === 1 ? '' : 's'} of $250 or more` : null, d.propertyGifts ? `${d.propertyGifts} of property, not valued` : null];
  return h('li', { class: d.largeGifts ? 'hi' : null }, [
    h('span', { class: 'k', 'aria-hidden': 'true' }, String(d.gifts + d.propertyGifts)),
    h('span', {}, d.name || d.id),
    h('b', {}, usd(d.cash)),
    h('em', {}, [...extra, SENTENCE(d)].filter(Boolean).join('; ') + ' (Pub 1771)'),
  ]);
}

function render(result, { example }) {
  const t = result.totals;
  const donors = result.donors.slice(0, SHOWN_DONORS);
  const flags = result.flags.slice(0, SHOWN_FLAGS);
  const line = current ? inputsLine(current.input, current.raw) : '';
  put($('gs-summary'),
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your gifts'),
      h('span', { class: 'tf-src' }, example ? 'Worked out on this page' : 'Worked out on this page, free'),
    ]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${line}` : line),
    h('p', { class: 'tf-big' }, [h('b', {}, String(t.donors)), h('span', {}, t.donors === 1 ? 'statement' : 'statements')]),
    h('p', { class: 'tf-sub' }, result.answer),
    h('ol', { class: 'tf-items gs-items' }, [
      ...donors.map(donorItem),
      h('li', { class: 'tot' }, [h('span', { class: 'k', 'aria-hidden': 'true' }, String(t.gifts + t.propertyGifts)), h('span', {}, 'Money given in all'), h('b', {}, usd(t.cash)), h('em', {}, `${t.largeGiftStatements} with a gift of $250 or more; ${t.setAside} set aside, outside the period`)]),
    ]),
    result.donors.length > donors.length ? h('p', { class: 'tf-note' }, `And ${result.donors.length - donors.length} more donors.`) : null,
    result.columnsUsed ? h('p', { class: 'tf-note' }, `Columns read: ${Object.entries(result.columnsUsed).map(([f, c]) => `${c} as ${f}`).join(', ')}${result.columnsIgnored.length ? `. Not used: ${result.columnsIgnored.join(', ')}` : ''}.`) : null,
    h('p', { class: 'gs-heading' }, flags.length ? `To check (${result.flags.length})` : 'Nothing to check'),
    flags.length ? h('ul', { class: 'gs-flags' }, flags.map((f) => h('li', {}, [h('span', { class: 'when' }, f.row ? `Row ${f.row}` : f.donor ?? 'File'), h('span', {}, f.donor && f.row ? `${f.donor}: ${f.message}` : f.message)]))) : null,
  );
}

function analyse({ example = false } = {}) {
  $('gs-file-err').textContent = '';
  $('gs-error').textContent = '';
  current = null;
  $('gs-buy').hidden = true;
  let raw;
  let input;
  try {
    raw = rawGifts();
    if (!raw) { put($('gs-summary'), h('p', { class: 'muted' }, 'Open or paste a gift file to see every donor\'s total.')); return; }
    input = settings();
    const gifts = raw.rows.map((r) => readGift(r, r.row));
    const period = input.year !== undefined ? { year: input.year } : { from: input.from, to: input.to };
    const result = engine.build({ org: { ...input.org, addressLines: [] }, period, gifts, merge: input.merge ?? [], mapped: raw.mapped, unknown: raw.unknown });
    current = { input, raw, result };
    render(result, { example });
    $('gs-buy').hidden = false;
    $('gs-preview-got').textContent = '';
    $('gs-got').textContent = '';
    $('gs-buy-err').textContent = '';
    priceLine();
  } catch (e) {
    if (!(e instanceof GivingError)) throw e;
    (e.field === 'org' ? $('gs-error') : $('gs-file-err')).textContent = e.message;
    put($('gs-summary'), h('p', { class: 'muted' }, 'Fix the file or the settings to see the totals.'));
  }
}

// ---------- the paid run, in parts ----------

// The gifts grouped by statement, then packed into parts that each fit one request.
function parts() {
  const group = engine.grouper(current.input.merge ?? []);
  const byDonor = new Map();
  for (const r of current.raw.rows) {
    const key = group({ donor: r.donor ?? '', donorId: r.donorId ?? '' }).key;
    if (!byDonor.has(key)) byDonor.set(key, []);
    byDonor.get(key).push(r);
  }
  const base = JSON.stringify({ op: 'statements', deliver: 'files', ...current.input, gifts: [] }).length;
  const out = [];
  let part = [];
  let size = base;
  for (const rows of byDonor.values()) {
    const add = JSON.stringify(rows).length;
    if (part.length && size + add > PART_CHARS) { out.push(part); part = []; size = base; }
    part.push(...rows);
    size += add;
  }
  if (part.length) out.push(part);
  return out;
}

async function priceLine() {
  const n = current.result.totals.donors;
  const words = `${n} ${n === 1 ? 'statement' : 'statements'} at $0.10 each: ${n * PRICE > CAP ? `$${CAP.toFixed(2)} (the monthly cap)` : `$${(n * PRICE).toFixed(2)}`} at most`;
  const el = $('gs-quote');
  if (!signedIn) { el.textContent = `${words}. Sign in to make them.`; return; }
  const ps = parts();
  if (ps.length > 1) { el.textContent = `${words}, sent in ${ps.length} parts. Statements you already made for these donors and period in the last 180 days are free.`; return; }
  try {
    const q = (await T.api(`/api/run/${SLUG}/quote`, { body: { op: 'statements', deliver: 'files', ...current.input, gifts: ps[0] } })).quote;
    el.textContent = q.amount ? `This costs ${q.display} from your balance (${words}).` : `These statements are free for you now (made in the last 180 days, or under the monthly cap).`;
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
  const button = $('gs-preview');
  const got = $('gs-preview-got');
  button.disabled = true;
  got.textContent = '';
  try {
    // Only the first donor's gifts go: that is the statement the preview draws.
    const first = current.result.donors[0];
    const group = engine.grouper(current.input.merge ?? []);
    const gifts = current.raw.rows.filter((r) => group({ donor: r.donor ?? '', donorId: r.donorId ?? '' }).key === first.key);
    const json = await T.run(SLUG, { op: 'preview', ...current.input, gifts });
    got.append(`The statement for ${first.name || first.id}: `, pdfLink(json.result.sample), '.');
  } catch (e) {
    errorInto(got, e);
  } finally {
    button.disabled = false;
  }
}

async function onMake() {
  const button = $('gs-make');
  const got = $('gs-got');
  const err = $('gs-buy-err');
  button.disabled = true;
  got.textContent = '';
  err.textContent = '';
  const ps = parts();
  const files = [];
  const prints = [];
  const summaries = [];
  const emails = [];
  let charged = 0;
  let balance = null;
  try {
    for (const [i, gifts] of ps.entries()) {
      $('gs-status').textContent = ps.length > 1 ? `Making part ${i + 1} of ${ps.length}.` : 'Making the statements.';
      const json = await T.run(SLUG, { op: 'statements', deliver: 'files', ...current.input, gifts });
      files.push(...json.result.files);
      prints.push(json.result.print);
      summaries.push(json.result.summaryCsv);
      if (json.result.emailCsv) emails.push(json.result.emailCsv);
      charged += json.charged?.amount ?? 0;
      balance = json.balance?.display ?? balance;
    }
  } catch (e) {
    errorInto(err, e);
    if (files.length) err.append(` ${files.length} statements were made before this; they are below.`);
  }
  if (files.length) {
    const zip = zipStore(files.map((f) => ({ name: f.filename, bytes: base64Bytes(f.base64) })));
    const join = (list) => list.map((t, i) => (i ? t.split('\r\n').slice(1).join('\r\n') : t)).join('');
    const year = current.result.period.label.replace(/[^0-9A-Za-z]+/g, '-');
    got.append(
      `${files.length} statements: `,
      download(`giving-statements-${year}.zip`, new Blob([zip], { type: 'application/zip' })), ' (one PDF per donor), ',
      ...prints.flatMap((p, i) => [download(prints.length > 1 ? p.filename.replace(/\.pdf$/, `-part-${i + 1}.pdf`) : p.filename, new Blob([base64Bytes(p.base64)], { type: 'application/pdf' })), ', ']),
      download(`giving-summary-${year}.csv`, join(summaries), 'text/csv'),
      emails.length ? ', ' : '',
      emails.length ? download(`giving-email-list-${year}.csv`, join(emails), 'text/csv') : '',
      '.',
      charged ? ` Charged $${(charged / 1_000_000).toFixed(2)}${balance ? `; your balance is ${T.money(balance)}` : ''}.` : ' No charge.',
    );
  }
  $('gs-status').textContent = '';
  button.disabled = false;
}

// ---------- start ----------

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('gs-code'), SLUG);
  fillYears();
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('gs-summary').textContent = 'The worked example could not load. Reload the page to try again.';
    return;
  }
  engine = makeEngine({ thresholds: tool.examples.find((x) => x.input.op === 'rules').output.thresholds });
  sampleLinks();
  T.me().then((account) => { signedIn = !!account; if (current) priceLine(); }).catch(() => {});

  const q = new URLSearchParams(window.location.search).get('sample');
  loadSample(['church', 'nonprofit', 'letter'].includes(q) ? q : 'church');
  analyse({ example: true });

  let timer = null;
  const soon = () => { clearTimeout(timer); timer = setTimeout(() => analyse(), 300); };
  for (const id of ['gs-paste', 'gs-name', 'gs-address', 'gs-signer', 'gs-title', 'gs-ein', 'gs-message', 'gs-merge']) $(id).addEventListener('input', soon);
  for (const id of ['gs-date', 'gs-year', 'gs-range', 'gs-exempt', 'gs-nonitem', 'gs-flip']) $(id).addEventListener('change', () => analyse());
  document.querySelectorAll('input[name="benefits"]').forEach((el) => el.addEventListener('change', () => analyse()));
  $('gs-upload').addEventListener('change', async () => {
    const file = $('gs-upload').files[0];
    if (!file) return;
    if (/\.xlsx?$/i.test(file.name)) { $('gs-file-err').textContent = 'Save the sheet as CSV first (File, Save as, CSV), or copy the cells and paste them here.'; return; }
    $('gs-paste').value = await file.text();
    analyse();
  });
  $('gs-template').addEventListener('click', (ev) => {
    ev.preventDefault();
    const a = download('giving-statements-template.csv', `${TEMPLATE_COLUMNS.join(',')}\r\n`, 'text/csv');
    document.body.appendChild(a);
    a.click();
    a.remove();
  });
  $('gs-preview').addEventListener('click', onPreview);
  $('gs-make').addEventListener('click', onMake);
  $('gs-form').addEventListener('submit', (ev) => ev.preventDefault());
}

start();
