// The USPS adjustment dispute page. The worked example at rest is the tool's first example, worked
// out by the server; every check after that is a run through Endwise.run (free on this page), and
// the packet is a paid run (signed in). Photos are read in the browser and sent once; the server
// builds the PDF in memory and keeps nothing.

const T = window.Endwise;
const h = T.h;
const SLUG = 'usps-adjustment-dispute';
const $ = (id) => document.getElementById(id);
const put = (el, ...kids) => { el.textContent = ''; for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) el.append(k); };
const val = (id) => $(id).value.trim();
const numOr = (id) => (val(id) === '' ? undefined : Number(val(id)));
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${MONTHS[m - 1]} ${d}, ${y}`; };
const usd = (c) => `${c < 0 ? '-' : ''}$${(Math.abs(c) / 100).toFixed(2)}`;

let last = null; // the last check result, for the packet

function measures(prefix) {
  const o = {};
  for (const k of ['weight', 'length', 'width', 'height']) { const v = numOr(`ua-${prefix}-${k}`); if (v !== undefined) o[k] = v; }
  return o;
}

function checkInput() {
  const input = { op: 'check', service: $('ua-service').value, zone: Number(val('ua-zone')), shipDate: val('ua-shipDate'), label: measures('l') };
  if ($('ua-pricing').value === 'cubic') input.label.pricing = 'cubic';
  if ($('ua-shape').value !== 'rectangular') input.shape = $('ua-shape').value;
  if ($('ua-softPack').checked) input.softPack = true;
  if ($('ua-characteristics').checked) input.characteristics = true;
  if (val('ua-notified')) input.notified = val('ua-notified');
  if (val('ua-charged') !== '') input.charged = Number(val('ua-charged'));
  const u = measures('u');
  if (val('ua-u-zone')) u.zone = Number(val('ua-u-zone'));
  if ($('ua-u-service').value) u.service = $('ua-u-service').value;
  if (Object.keys(u).length) input.usps = u;
  const a = measures('a');
  if (Object.keys(a).length) input.actual = a;
  return input;
}

function fill(input) {
  $('ua-service').value = input.service;
  $('ua-zone').value = input.zone ?? '';
  $('ua-shipDate').value = input.shipDate ?? '';
  $('ua-pricing').value = input.label?.pricing ?? 'weight';
  $('ua-shape').value = input.shape ?? 'rectangular';
  $('ua-softPack').checked = !!input.softPack;
  $('ua-characteristics').checked = !!input.characteristics;
  $('ua-notified').value = input.notified ?? '';
  $('ua-charged').value = input.charged ?? '';
  for (const [p, src] of [['l', input.label], ['u', input.usps], ['a', input.actual]]) {
    for (const k of ['weight', 'length', 'width', 'height']) $(`ua-${p}-${k}`).value = src?.[k] ?? '';
  }
  $('ua-u-zone').value = input.usps?.zone ?? '';
  $('ua-u-service').value = input.usps?.service ?? '';
}

const VERDICT = {
  dispute: (c) => `Dispute ${c.verdict.disputeWords}`,
  owed: () => 'Owed at your measurements',
  matches: () => 'Matches USPS\'s numbers',
  above: (c) => `${usd(c.charged)} is above the published difference`,
  below: () => 'Below the published difference',
  computed: (c) => `Expected ${usd(c.expected.withoutFee)}`,
};

// One line per figure: a mark, what it is, the figure, and where it comes from.
const item = (k, label, fig, src, cls) => h('li', { class: cls ?? null }, [
  h('span', { class: 'k', 'aria-hidden': 'true' }, k),
  h('span', {}, label),
  h('b', {}, fig),
  h('em', {}, src),
]);
const N123 = 'Notice 123 commercial prices';
const how = (p, weight) => `${p.serviceName}, zone ${p.zone}, ${p.how === 'dimensional' ? `${p.row} dimensional` : p.how === 'cubic' ? 'cubic' : `${weight ?? p.row}${weight ? ' lb' : ''}`}`;

function column(title, p, dims) {
  return h('div', { class: 'ua-col' }, [
    h('p', { class: 'ua-col-h' }, [title, h('small', {}, `${p.totalWords}${dims ? `, ${dims} in` : ''}`)]),
    h('ol', { class: 'ua-steps' }, p.steps.map((s) => h('li', {}, s))),
  ]);
}

// The inputs in one line: "Ground Advantage, zone 5, label 12 x 10 x 8 in 3 lb, USPS 14 x 12 x 11 in, $13.01 charged".
function inputsLine(c) {
  return [`${c.serviceName}, zone ${c.label.zone}`, `label ${c.label.dims} in, ${c.label.weight} lb`, `USPS ${c.usps.dims} in`, c.charged != null ? `${usd(c.charged)} charged` : null].filter(Boolean).join(', ');
}

// kind: 'example' (the worked example, at rest) or 'run' (your check).
function render(c, kind = 'run') {
  last = c;
  const d = c.deadline;
  const fee = c.expected.fee;
  put($('ua-answer'),
    h('div', { class: 'tf-rh' }, [
      kind === 'example' ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your check'),
      h('span', { class: 'tf-src' }, c.edition.name),
    ]),
    h('p', { class: 'tf-exin' }, kind === 'example' ? `Example: ${inputsLine(c)}` : inputsLine(c)),
    h('p', { class: `tf-big${c.verdict.code === 'dispute' ? ' ua-go' : ''}` }, [h('b', { class: 'word' }, VERDICT[c.verdict.code](c))]),
    h('p', { class: 'tf-sub' }, c.answer),
    h('ol', { class: 'tf-items ua-items' }, [
      item('L', `As labelled: ${how(c.label, c.label.weight)}`, c.label.totalWords, N123, 'plain'),
      item('U', `At USPS's measurements: ${c.usps.dims} in, ${how(c.usps, c.usps.weight)}`, c.usps.totalWords, `${N123}, DMM dimensional weight`),
      c.actual ? item('Y', `At your measurements: ${c.actual.dims} in`, c.actual.price.totalWords, N123) : null,
      item('=', 'The adjustment should be', usd(c.expected.withoutFee), 'USPS\'s price less the label\'s', 'hi'),
      fee.applies ? item('+', 'Dimension Noncompliance Fee', usd(fee.cents), fee.why) : null,
      c.charged != null ? item('$', 'Charged on the notice', usd(c.charged), 'your adjustment notice', 'plain') : null,
      c.actual ? item('O', 'Owed at your measurements', usd(c.actual.owed), c.actual.fee.why) : null,
      d ? item('D', d.open === false ? 'Dispute window closed' : `Last day to dispute: ${longDate(d.lastDay)}`, d.open === false ? '' : `${d.daysLeft} ${d.daysLeft === 1 ? 'day' : 'days'} left`, `60 days from the notice; USPS answers in ${d.responseDays}`, d.open === false ? 'sk' : null) : null,
    ]),
    c.notes.map((n) => h('p', { class: 'tf-note' }, n)),
  );
  put($('ua-work'), h('details', { class: 'xpand ua-working' }, [
    h('summary', {}, 'Show the working'),
    h('div', { class: 'xp-in ua-cols' }, [
      column('As labelled', c.label, c.label.dims),
      column('At USPS\'s measurements', c.usps, c.usps.dims),
      c.actual ? column('At your measurements', c.actual.price, c.actual.dims) : null,
    ]),
  ]));
  summaries();
}

// The folded parts of the form say what is in them.
function summaries() {
  const dims = (p) => ['length', 'width', 'height'].map((k) => val(`ua-${p}-${k}`)).filter(Boolean).join(' x ');
  const w = (p) => (val(`ua-${p}-weight`) ? `${val(`ua-${p}-weight`)} lb` : '');
  const join = (...x) => x.filter(Boolean).join(', ');
  $('ua-sum-l').textContent = join(`zone ${val('ua-zone')}`, dims('l') && `${dims('l')} in`, w('l'));
  $('ua-sum-u').textContent = join(dims('u') && `${dims('u')} in`, w('u'), val('ua-charged') && `$${val('ua-charged')}`);
  $('ua-sum-a').textContent = join(dims('a') && `${dims('a')} in`, w('a')) || 'none';
}

function showError(el, e) {
  const fields = e.fields ? Object.values(e.fields).join(' ') : '';
  $(el).textContent = fields || e.message;
}

async function check(ev) {
  ev?.preventDefault();
  $('ua-error').textContent = '';
  try {
    const json = await T.run(SLUG, checkInput());
    render(json.result);
  } catch (e) { showError('ua-error', e); }
}

const readFile = (f) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
  r.onerror = () => reject(new Error(`${f.name} could not be read.`));
  r.readAsDataURL(f);
});

async function build() {
  $('ua-packet-error').textContent = '';
  const input = { ...checkInput(), op: 'packet', raid: val('ua-raid'), tracking: val('ua-tracking') };
  for (const k of ['name', 'email', 'phone', 'note']) if (val(`ua-${k}`)) input[k] = val(`ua-${k}`);
  const files = [...$('ua-photos').files].slice(0, 6);
  try {
    if (files.length) input.photos = await Promise.all(files.map(async (f) => ({ name: f.name, data: await readFile(f) })));
    const json = await T.run(SLUG, input);
    const r = json.result;
    render(r);
    const p = r.packet;
    const pdf = URL.createObjectURL(new Blob([Uint8Array.from(atob(p.file.base64), (ch) => ch.charCodeAt(0))], { type: 'application/pdf' }));
    const text = h('textarea', { class: 'ua-text', rows: '7', readonly: '' }, p.text);
    const status = h('span', { class: 'tf-note' });
    put($('ua-packet-out'),
      h('p', { class: 'tf-exin' }, `Reason: ${p.fields.reason} · file by ${p.fields.fileBy ?? 'the 60th day after the notice'}`),
      h('label', {}, 'Description of dispute (paste into the webform)'), text,
      h('p', {}, [h('button', { type: 'button', class: 'btn btn-quiet', onclick: () => T.copy(p.text, text, status) }, 'Copy the text'), ' ', h('a', { class: 'btn', href: pdf, download: p.file.name }, `Download the PDF (${p.file.pages} pages)`), ' ', status]),
      h('ol', { class: 'ua-steps' }, p.steps.map((s) => h('li', {}, s))),
    );
  } catch (e) {
    if (e.code === 'unauthorized' || e.status === 401) $('ua-packet-error').append('Sign in to build the packet: ', h('a', { href: `${T.base}/account?next=${encodeURIComponent(location.pathname)}` }, 'sign in or create an account'), '.');
    else showError('ua-packet-error', e);
  }
}

async function dim(ev) {
  ev?.preventDefault();
  const input = { op: 'dim', service: $('ua-d-service').value, length: numOr('ua-d-length'), width: numOr('ua-d-width'), height: numOr('ua-d-height') };
  if ($('ua-d-shape').value !== 'rectangular') input.shape = $('ua-d-shape').value;
  if (numOr('ua-d-weight') !== undefined) input.weight = numOr('ua-d-weight');
  try {
    const r = (await T.run(SLUG, input)).result;
    put($('ua-dim-out'), h('div', { class: 'ua-dim-res' }, [
      h('p', { class: 'tf-big' }, h('b', { class: 'word' }, r.billable ? `Billed at ${r.billable}` : r.current.over ? `${r.current.dimLb} lb dimensional` : 'No dimensional weight')),
      h('p', { class: 'tf-sub' }, r.answer),
      h('ol', { class: 'ua-steps' }, r.current.steps.map((s) => h('li', {}, s))),
      h('p', { class: 'tf-note' }, `Before July 12, 2026 (sides rounded off, divided by 166): ${r.before.over ? `${r.before.dimLb} lb` : 'no dimensional weight'}.`),
      r.fees.length ? h('p', { class: 'tf-note' }, `Nonstandard fees: ${r.fees.map((f) => `${f.words} ${usd(f.cents)}`).join('; ')}.`) : null,
    ]));
  } catch (e) { put($('ua-dim-out'), h('p', { class: 'field-error' }, e.fields ? Object.values(e.fields).join(' ') : e.message)); }
}

// Prefill from the address: ?service=&zone=&shipDate=&notified=&charged=&weight=&length=&width=
// &height=&uweight=&ulength=&uwidth=&uheight=&uzone= for a check, or ?op=dim&... for the calculator.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  if (![...q.keys()].length) return null;
  if (q.get('op') === 'dim') {
    for (const k of ['length', 'width', 'height', 'weight']) $(`ua-d-${k}`).value = '';
    $('ua-d-shape').value = 'rectangular';
    for (const k of ['service', 'shape', 'length', 'width', 'height', 'weight']) if (q.get(k)) $(`ua-d-${k}`).value = q.get(k);
    return 'dim';
  }
  fill({ service: 'ground-advantage', label: {} });
  const set = (id, k) => { if (q.get(k)) $(id).value = q.get(k); };
  set('ua-service', 'service'); set('ua-zone', 'zone'); set('ua-shipDate', 'shipDate'); set('ua-notified', 'notified'); set('ua-charged', 'charged');
  set('ua-shape', 'shape'); set('ua-pricing', 'pricing');
  for (const k of ['weight', 'length', 'width', 'height']) { set(`ua-l-${k}`, k); set(`ua-u-${k}`, `u${k}`); set(`ua-a-${k}`, `a${k}`); }
  set('ua-u-zone', 'uzone');
  return 'check';
}

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('ua-code-panel'), SLUG);
  let tool;
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    put($('ua-answer'), h('p', {}, 'The worked example could not load. Reload the page, or call the tool from code.'));
    return;
  }
  const ex = tool.examples[0];
  fill(ex.input);
  render(ex.output, 'example');
  put($('ua-sources'), ex.output.sources.map((s) => h('li', {}, [h('a', { href: s.url }, s.title), `, read ${longDate(s.readOn)}`])));
  const dimEx = tool.examples.find((x) => x.input.op === 'dim').input;
  for (const k of ['service', 'length', 'width', 'height', 'weight']) $(`ua-d-${k}`).value = dimEx[k];
  $('ua-form').addEventListener('submit', check);
  $('ua-form').addEventListener('input', summaries);
  $('ua-dim-form').addEventListener('submit', dim);
  $('ua-build').addEventListener('click', build);
  const custom = fromQuery();
  if (custom === 'check') { await check(); $('ua-answer').scrollIntoView({ block: 'nearest' }); }
  if (custom === 'dim') { await dim(); $('ua-dim-out').scrollIntoView({ block: 'nearest' }); }
}

start();
