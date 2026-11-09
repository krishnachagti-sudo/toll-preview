// The Good Faith Estimate page. core.js (the same file the server runs) works out the due date, the
// sessions, the totals and the element check here, free, as the form changes; the rules come from
// the tool's published rules example, so the page and the server read the same data. The preview
// (watermarked, free) and the PDF (paid) are runs through Endwise.run. Nothing typed here is stored
// by the page.
import { makeEstimate, GfeError, longDate, dayDate, usd2, addDays, addMonths, CADENCES } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'good-faith-estimate-generator';
const $ = (id) => document.getElementById(id);

let rules = null;
let tool = null;
let signedIn = false;
let quoteTimer = null;

const put = (el, ...kids) => { el.textContent = ''; for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) el.append(k); };
const val = (id) => $(id).value.trim();
const list = (s) => s.split(/[\s,;]+/).map((x) => x.trim()).filter(Boolean);

// ---------- repeatable cards ----------

const field = (label, name, { type = 'text', value = '', max = 120, hint } = {}) => h('div', { class: 'field' }, [
  h('label', {}, [label, h('input', { type, 'data-k': name, value: String(value ?? ''), maxlength: String(max), autocomplete: 'off', class: 'gf-in' })]),
  hint ? h('p', { class: 'hint' }, hint) : null,
]);

function lineCard(line = {}) {
  const el = h('div', { class: 'gf-line', 'data-line': '' }, [
    field('Item or service', 'description', { value: line.description, max: 160 }),
    field('Charge ($)', 'charge', { value: line.charge ?? '', max: 16 }),
    field('Service code', 'serviceCode', { value: line.serviceCode, max: 16 }),
    field('Quantity', 'quantity', { type: 'number', value: line.quantity ?? 1, max: 3 }),
    field('Diagnosis code', 'diagnosisCode', { value: line.diagnosisCode, max: 10 }),
    h('div', {}, [
      h('label', { class: 'check' }, [h('input', { type: 'checkbox', 'data-k': 'perSession', ...(line.perSession ? { checked: '' } : {}) }), h('span', {}, 'Every session')]),
      h('button', { type: 'button', class: 'gf-remove', 'data-remove': 'line' }, 'Remove item'),
    ]),
  ]);
  return el;
}

function providerCard(p = {}) {
  const a = p.address ?? {};
  const lines = h('div', { 'data-lines': '' }, (p.items?.length ? p.items : [{}]).map(lineCard));
  const el = h('div', { class: 'gf-card', 'data-provider': '' }, [
    h('div', { class: 'gf-card-head' }, [h('strong', { 'data-title': '' }, 'Provider'), h('button', { type: 'button', class: 'gf-remove', 'data-remove': 'provider' }, 'Remove')]),
    field('Name', 'name', { value: p.name }),
    field('Type (optional)', 'type', { value: p.type, max: 80 }),
    h('div', { class: 'gf-pair' }, [field('NPI', 'npi', { value: p.npi, max: 12 }), field('TIN', 'tin', { value: p.tin, max: 12, hint: 'EIN 12-3456789' })]),
    field('Street', 'street', { value: a.street }),
    h('div', { class: 'gf-pair' }, [field('City', 'city', { value: a.city, max: 60 }), h('div', { class: 'gf-pair' }, [field('State', 'state', { value: a.state, max: 2 }), field('ZIP', 'zip', { value: a.zip, max: 10 })])]),
    h('div', { class: 'gf-pair' }, [field('Phone', 'phone', { value: p.phone, max: 30 }), field('Email', 'email', { value: p.email })]),
    field('Contact for billing questions (optional)', 'contact', { value: p.contact, max: 80 }),
    lines,
    h('button', { type: 'button', class: 'btn btn-quiet gf-small', 'data-add': 'line' }, 'Add an item'),
  ]);
  return el;
}

function separateCard(s = {}) {
  return h('div', { class: 'gf-card', 'data-separate': '' }, [
    field('Item or service', 'description', { value: s.description, max: 160 }),
    field('Provider (if known)', 'provider', { value: s.provider }),
    field('How to get its estimate', 'howToGet', { value: s.howToGet, max: 240 }),
    h('button', { type: 'button', class: 'gf-remove', 'data-remove': 'separate' }, 'Remove'),
  ]);
}

const k = (root, name) => root.querySelector(`[data-k="${name}"]`);
const kv = (root, name) => (k(root, name)?.value ?? '').trim();
const opt = (o) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== '' && v !== undefined));

function renumber() {
  [...document.querySelectorAll('[data-provider]')].forEach((c, i) => { c.querySelector('[data-title]').textContent = i === 0 ? 'Convening provider or facility' : `Co-provider or facility ${i}`; });
}

// ---------- the input ----------

function readForm(op) {
  const mode = $('gf-mode').value;
  const input = {
    op,
    gfeDate: val('gf-gfeDate'),
    patient: opt({ firstName: val('gf-firstName'), lastName: val('gf-lastName'), dob: val('gf-dob'), address: val('gf-patientAddress'), email: val('gf-patientEmail'), phone: val('gf-patientPhone'), contactPreference: $('gf-contactPreference').value }),
    primary: { description: val('gf-description') },
    providers: [...document.querySelectorAll('[data-provider]')].map((c) => opt({
      name: kv(c, 'name'), type: kv(c, 'type'), npi: kv(c, 'npi'), tin: kv(c, 'tin'),
      address: { street: kv(c, 'street'), city: kv(c, 'city'), state: kv(c, 'state').toUpperCase(), zip: kv(c, 'zip') },
      phone: kv(c, 'phone'), email: kv(c, 'email'), contact: kv(c, 'contact'),
      items: $('gf-noCost').checked ? [] : [...c.querySelectorAll('[data-line]')].map((l) => opt({
        description: kv(l, 'description'), charge: kv(l, 'charge') || '0', serviceCode: kv(l, 'serviceCode'), diagnosisCode: kv(l, 'diagnosisCode'),
        quantity: Number(kv(l, 'quantity')) || 1, perSession: mode === 'recurring' && k(l, 'perSession').checked ? true : undefined,
      })),
    })),
  };
  if (!input.patient.firstName) input.patient.firstName = '';
  if (!input.patient.lastName) input.patient.lastName = '';
  if (val('gf-scheduledOn')) input.scheduledOn = val('gf-scheduledOn');
  if (val('gf-requestedOn')) input.requestedOn = val('gf-requestedOn');
  if (val('gf-closedDays')) input.closedDays = list(val('gf-closedDays'));
  if (val('gf-dxDescription') || val('gf-dxCode')) input.primary.diagnoses = [opt({ description: val('gf-dxDescription'), code: val('gf-dxCode') })];
  if (mode === 'recurring') {
    input.recurring = opt({ firstDate: val('gf-firstDate'), cadence: $('gf-cadence').value, count: val('gf-count') ? Number(val('gf-count')) : undefined, through: val('gf-through') });
  } else if (mode === 'dates') {
    input.primary.dates = list(val('gf-dates'));
  } else {
    input.primary.notScheduled = true;
  }
  const separate = [...document.querySelectorAll('[data-separate]')].map((c) => opt({ description: kv(c, 'description'), provider: kv(c, 'provider'), howToGet: kv(c, 'howToGet') }));
  if (separate.length) input.separate = separate;
  if ($('gf-noCost').checked) input.noCost = true;
  return input;
}

// ---------- the answer ----------

const TAG = { missing: 'Missing', warn: 'Check', ok: 'Has it', auto: 'Added' };

// The page opens on the worked example, tagged as one, until the visitor changes something.
let atRest = true;

function renderResult(E) {
  const t = E.timing;
  const dueBox = t ? h('p', { class: `gf-due${t.onTime === false ? ' gf-late' : ''}` }, [
    h('strong', {}, t.due ? `Due by 11:59 PM on ${dayDate(t.due)}. ` : 'No deadline on scheduling. '),
    t.answer,
    t.onTime === false ? ` The estimate is dated ${longDate(E.gfeDate)}, after the due date.` : '',
    t.scheduled?.reissueBy ? ` A changed estimate is due by ${longDate(t.scheduled.reissueBy)} (1 business day before the first service).` : '',
  ]) : h('p', { class: 'gf-aside' }, 'Add the date the service was scheduled (or the patient asked) to see when the estimate is due.');
  const rule = t?.scheduled?.rule ?? t?.requested?.rule;
  put($('gf-out'),
    atRest ? h('div', { class: 'tf-res-h' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', { class: 'gf-aside' }, 'Worked example')]) : null,
    atRest ? h('p', { class: 'tf-exin' }, 'Example: scheduled Monday, November 16, 2026, first session Thursday, November 19, weekly therapy for 12 months at $150 a session plus a $200 intake (made-up practice and patient)') : null,
    h('p', { class: `gf-label${E.check.complete ? '' : ' gf-incomplete'}` }, E.check.complete ? 'Every required element is there' : `${E.check.missing} required ${E.check.missing === 1 ? 'element' : 'elements'} missing`),
    h('p', { class: 'gf-answer tf-big' }, [E.noCost ? '$0' : E.total, h('small', {}, E.noCost ? 'no-cost estimate' : `estimated total${E.providers.length > 1 ? `, ${E.providers.length} providers or facilities` : ''}`)]),
    // One line per figure: the due date and each provider's estimate, with where each comes from.
    h('ul', { class: 'tf-items' }, [
      t?.due ? h('li', { class: 'key' }, [h('span', {}, 'Due by 11:59 PM on'), h('b', {}, dayDate(t.due)), h('small', {}, rule ? `${rule}; business days skip weekends and federal holidays` : 'business days skip weekends and federal holidays')]) : null,
      ...(E.noCost ? [] : E.providers.map((p) => h('li', {}, [h('span', {}, p.name || 'Unnamed'), h('b', {}, usd2(p.totalCents)), h('small', {}, `from your charges; dispute line ${usd2(p.disputeAtCents)} (CMS model notice)`)]))),
      E.recurring ? h('li', {}, [h('span', {}, `Sessions ${E.recurring.words}`), h('b', {}, String(E.recurring.count)), h('small', {}, `within 12 months of the estimate: on or before ${longDate(E.recurring.scopeEnd)}`)]) : null,
    ].filter(Boolean)),
    h('p', {}, E.answer),
    dueBox,
    E.recurring ? h('p', { class: 'gf-sessions' }, `${E.recurring.count} sessions ${E.recurring.words}: ${E.recurring.dates.map((d) => d.slice(5).replace('-', '/')).join(', ')}. Within 12 months of the estimate date: on or before ${longDate(E.recurring.scopeEnd)}.`) : null,
    E.noCost ? null : h('p', { class: 'gf-aside' }, `Dispute line: a bill from that provider or facility at least $400 above its estimate lets the patient start dispute resolution, within 120 calendar days of the bill (CMS model notice).`),
    ...E.providers.filter((p) => p.stateCap).map((p) => h('p', { class: 'gf-aside' }, `Colorado: the final cost from ${p.name} generally may not exceed ${usd2(p.stateCap.maxFinalCents)} (its estimate plus the lesser of 15% or $400), except for an emergency or an unforeseen, medically necessary service (${p.stateCap.law}).`)),
    h('ul', { class: 'gf-checks' }, E.check.items.map((x) => h('li', { class: `gf-${x.level}` }, [h('span', { class: 'gf-tag' }, TAG[x.level]), ` ${x.para}: ${x.message}`]))),
    h('p', { class: 'gf-aside' }, 'Worked out on this page, free. Nothing you type is sent until you ask for the preview or the PDF.'),
  );
  $('gf-status').textContent = E.answer;
}

function clearErrors() {
  for (const el of document.querySelectorAll('.gf-form .field-error')) el.textContent = '';
  $('gf-error').textContent = '';
}

function showError(e) {
  clearErrors();
  const key = (e.field ?? '').split('.').filter((x) => !/^\d+$/.test(x)).pop();
  const target = key ? $(`gf-${key}-err`) : null;
  if (target) target.textContent = e.message; else $('gf-error').textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') $('gf-error').append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') $('gf-error').append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

function update() {
  if (!rules) return;
  clearErrors();
  for (const el of document.querySelectorAll('[data-mode]')) el.hidden = el.dataset.mode !== $('gf-mode').value;
  try {
    renderResult(makeEstimate(readForm('check'), rules));
    clearTimeout(quoteTimer);
    quoteTimer = setTimeout(() => buy.show(), 400);
  } catch (e) {
    if (e instanceof GfeError) showError(e); else showError({ message: 'Check the dates and amounts: one of them could not be read.' });
  }
}

// ---------- files ----------

function base64Bytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const fileLink = (f, text = f.filename) => h('a', { href: URL.createObjectURL(new Blob([base64Bytes(f.base64)], { type: f.contentType })), download: f.filename }, text);

function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'Free for you this time.';
  if (typeof json.freeRunsLeft === 'number') return `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  return '';
}

const buy = (() => {
  const price = h('p', { class: 'gf-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Get the estimate (PDF)');
  const got = h('p', { class: 'gf-got', role: 'status' });
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const json = await T.run(SLUG, readForm('estimate'));
      put(got, 'Your estimate: ', fileLink(json.result.estimate, 'Good Faith Estimate (PDF)'), `. ${costNote(json)} Keep it with the patient's record: copies must be given on request for 6 years.`);
    } catch (e) { showError(e); } finally { button.disabled = false; }
  });
  return {
    mount() { put($('gf-buy'), price, button, got); },
    async show() {
      const text = tool?.pricing?.actions.find((a) => a.name === 'estimate')?.text;
      const words = text ? T.money(text) : '';
      if (!signedIn) { price.textContent = `${words}. Sign in to download.`; return; }
      try {
        const q = (await T.api(`/api/run/${SLUG}/quote`, { body: readForm('estimate') })).quote;
        price.textContent = q.amount ? `This estimate costs ${q.display} from your balance (${words}).` : `This estimate is free for you now (${words}).`;
      } catch { price.textContent = words; }
    },
  };
})();

async function preview() {
  const button = $('gf-preview');
  button.disabled = true;
  try {
    const input = readForm('estimate');
    input.preview = true;
    const json = await T.run(SLUG, input);
    put($('gf-buy').querySelector('.gf-got') ?? $('gf-buy'), 'Preview: ', fileLink(json.result.estimate, 'watermarked estimate (PDF)'), `. ${costNote(json)}`);
  } catch (e) { showError(e); } finally { button.disabled = false; }
}

// ---------- rules and sources ----------

function rulesBlock() {
  put($('gf-elements'), h('table', {}, [
    h('thead', {}, h('tr', {}, ['Paragraph', 'Element', 'Filled by'].map((x) => h('th', {}, x)))),
    h('tbody', {}, rules.elements.map((e) => h('tr', {}, [h('th', {}, `149.610${e.para}`), h('td', {}, e.label), h('td', {}, { you: 'You', tool: 'The tool', both: 'You, with the tool\'s disclaimer' }[e.fill])]))),
  ]));
  put($('gf-sources'), Object.values(rules.sources).map((s) => h('li', {}, [
    h('a', { href: s.url }, s.title), s.via ? [' (read from an ', h('a', { href: s.via.url }, s.via.name), ')'] : ' (official site)', `, read ${longDate(s.readOn)}.`,
  ].flat())));
}

// ---------- start ----------

function load(input) {
  $('gf-gfeDate').value = input.gfeDate ?? '';
  $('gf-scheduledOn').value = input.scheduledOn ?? '';
  $('gf-requestedOn').value = input.requestedOn ?? '';
  const p = input.patient ?? {};
  $('gf-firstName').value = p.firstName ?? '';
  $('gf-lastName').value = p.lastName ?? '';
  $('gf-dob').value = p.dob ?? '';
  $('gf-patientEmail').value = p.email ?? '';
  $('gf-contactPreference').value = p.contactPreference ?? '';
  $('gf-description').value = input.primary?.description ?? '';
  if (input.recurring) {
    $('gf-mode').value = 'recurring';
    $('gf-firstDate').value = input.recurring.firstDate;
    $('gf-cadence').value = input.recurring.cadence;
    $('gf-count').value = input.recurring.count ?? '';
    $('gf-through').value = input.recurring.through ?? '';
  } else if (input.primary?.dates?.length) {
    $('gf-mode').value = 'dates';
    $('gf-dates').value = input.primary.dates.join(', ');
  }
  put($('gf-providers'), (input.providers ?? [{}]).map(providerCard));
  renumber();
}

// Prefill from the address (the content pages' forms): dates, a schedule and up to two lines.
function fromQuery(sample) {
  const q = new URLSearchParams(location.search);
  if (![...q.keys()].length) return false;
  const g = (x) => q.get(x) ?? undefined;
  const items = [];
  if (g('code') || g('rate')) items.push({ description: g('item') ?? 'Session', serviceCode: g('code'), charge: g('rate'), perSession: !!g('cadence'), quantity: Number(g('quantity')) || 1 });
  if (g('code2') || g('rate2')) items.push({ description: g('item2') ?? 'Item', serviceCode: g('code2'), charge: g('rate2'), quantity: Number(g('quantity2')) || 1 });
  const first = g('firstDate') ?? g('serviceDate');
  const input = {
    gfeDate: g('gfeDate') ?? g('scheduledOn') ?? sample.gfeDate,
    scheduledOn: g('scheduledOn'),
    requestedOn: g('requestedOn'),
    patient: {},
    primary: { description: g('description') ?? '', ...(!g('cadence') && first ? { dates: [first] } : {}) },
    ...(g('cadence') ? { recurring: { firstDate: first ?? sample.recurring.firstDate, cadence: g('cadence'), count: g('count') ? Number(g('count')) : undefined, through: g('through') } } : {}),
    providers: [{ address: { state: (g('state') ?? '').toUpperCase() }, items: items.length ? items : [{}] }],
  };
  load(input);
  if (!g('cadence') && !first) $('gf-mode').value = 'none';
  if (g('closedDays')) $('gf-closedDays').value = g('closedDays');
  return true;
}

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('gf-code'), SLUG);
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('gf-out').textContent = 'The rules could not load. Reload the page, or call the tool from code.';
    return;
  }
  rules = tool.examples.find((x) => x.input.op === 'rules').output.rules;
  rulesBlock();
  buy.mount();
  T.me().then((a) => { signedIn = !!a; buy.show(); }).catch(() => {});

  // The worked example at rest: weekly therapy for 12 months, unless the address says otherwise.
  const sample = tool.examples.find((x) => x.input.op === 'estimate').input;
  if (fromQuery(sample)) atRest = false; else load(sample);

  for (const ev of ['input', 'change']) $('gf-form').addEventListener(ev, () => { atRest = false; update(); });
  // The button runs the same check and, on a phone (where the answer sits under the form), shows it.
  $('gf-run').addEventListener('click', () => {
    update();
    if (window.matchMedia('(max-width: 860px)').matches) $('gf-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('gf-form').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || b.id === 'gf-run') return;
    atRest = false;
    if (b.dataset.add === 'line') { b.previousElementSibling.append(lineCard()); update(); }
    if (b.dataset.remove === 'line') { b.closest('[data-line]').remove(); update(); }
    if (b.dataset.remove === 'provider' && document.querySelectorAll('[data-provider]').length > 1) { b.closest('[data-provider]').remove(); renumber(); update(); }
    if (b.dataset.remove === 'separate') { b.closest('[data-separate]').remove(); update(); }
  });
  $('gf-addProvider').addEventListener('click', () => { $('gf-providers').append(providerCard()); renumber(); update(); });
  $('gf-addSeparate').addEventListener('click', () => { $('gf-separate').append(separateCard()); update(); });
  $('gf-fill12').addEventListener('click', () => {
    const g = val('gf-gfeDate');
    if (!g) return;
    $('gf-count').value = '';
    $('gf-through').value = addDays(addMonths(g, 12), -1);
    update();
  });
  $('gf-preview').addEventListener('click', preview);
  update();
}

void CADENCES;
start();
