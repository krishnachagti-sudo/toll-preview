// The security deposit page. core.js (the same file the server runs) works out the due date and the
// check here, free, as the form changes: the statute rows come from the tool's published rules
// example, so the page and the server read the same quoted text. The preview (watermarked, free)
// and the letter with its proof record (paid) are runs through Endwise.run.
import { makeEngine, DepositError, CATEGORIES, CATEGORY_KEYS, DOCS, DOC_KEYS, DELIVERY, DELIVERY_KEYS, longDate } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'security-deposit-letter';
const $ = (id) => document.getElementById(id);

let engine = null;
let tool = null;
let signedIn = false;
let rows = [];
let quoteTimer = null;
// The worked example at rest is shown as of its own date; the first edit switches to today.
let exampleAsOf = null;

const put = (el, ...kids) => { el.textContent = ''; for (const k of kids.flat()) if (k) el.append(k); };
const today = () => new Date().toISOString().slice(0, 10);

// ---------- the deductions editor ----------

function deductionRow(d = {}) {
  const r = {
    label: h('input', { type: 'text', maxlength: '80', value: d.label ?? '', placeholder: 'What it is for', 'aria-label': 'What the deduction is for' }),
    amount: h('input', { type: 'text', inputmode: 'decimal', value: d.amount === undefined ? '' : String(d.amount), placeholder: 'Amount ($)', 'aria-label': 'Amount in dollars' }),
    category: h('select', { 'aria-label': 'Kind' }, CATEGORY_KEYS.map((k) => h('option', { value: k }, CATEGORIES[k]))),
    doc: h('select', { 'aria-label': 'How the cost is shown' }, DOC_KEYS.map((k) => h('option', { value: k }, DOCS[k]))),
    hours: h('input', { type: 'number', min: '0', step: '0.25', value: d.hours ?? '', 'aria-label': 'Hours', placeholder: 'Hours' }),
    rate: h('input', { type: 'text', inputmode: 'decimal', value: d.hourlyRate ?? '', 'aria-label': 'Hourly rate', placeholder: '$ an hour' }),
  };
  r.category.value = d.category ?? 'repair';
  r.doc.value = d.doc ?? (r.category.value === 'rent' ? 'none' : 'invoice');
  const labor = h('div', { class: 'sd-labor' }, [r.hours, r.rate]);
  const remove = h('button', { type: 'button', class: 'btn btn-quiet btn-small' }, 'Remove');
  const box = h('div', { class: 'sd-ded' }, [r.label, r.amount, r.category, r.doc, labor, remove]);
  const sync = () => { labor.hidden = r.doc.value !== 'own-labor'; };
  r.doc.addEventListener('change', sync);
  sync();
  remove.addEventListener('click', () => { rows = rows.filter((x) => x !== r); box.remove(); exampleAsOf = null; update(); });
  r.box = box;
  rows.push(r);
  $('sd-deductions').append(box);
}

function readDeductions() {
  return rows.filter((r) => r.label.value.trim() || r.amount.value.trim()).map((r) => {
    const d = { label: r.label.value.trim(), amount: r.amount.value.trim(), category: r.category.value, doc: r.doc.value };
    if (r.doc.value === 'own-labor') { d.hours = Number(r.hours.value); d.hourlyRate = r.rate.value.trim(); }
    return d;
  });
}

// ---------- the form ----------

const state = () => $('sd-state').value;
const val = (id) => $(id).value.trim();

function syncState() {
  for (const el of document.querySelectorAll('[data-only]')) el.hidden = !el.dataset.only.split(' ').includes(state());
}

function readForm() {
  const s = state();
  const input = { state: s, moveOut: val('sd-moveOut'), asOf: exampleAsOf ?? today(), deposit: val('sd-deposit') || '0', deductions: readDeductions() };
  const opt = { tenancyEnd: 'sd-tenancyEnd', tenantDemand: 'sd-tenantDemand', abandonmentLearned: 'sd-abandonmentLearned', noticeSent: 'sd-noticeSent', forwardingAddress: 'sd-forwardingAddress', tenancyStart: 'sd-tenancyStart' };
  for (const [k, id] of Object.entries(opt)) if (!$(id).closest('[hidden]') && val(id)) input[k] = val(id);
  if (val('sd-interest')) input.interest = val('sd-interest');
  if (s === 'IL' && val('sd-units')) input.units = Number(val('sd-units'));
  if (val('sd-delivery')) input.delivery = val('sd-delivery');
  if ($('sd-emailAgreement').checked) input.emailAgreement = true;
  if (s === 'CA') input.photos = { moveIn: $('sd-photosIn').checked, moveOut: $('sd-photosOut').checked };
  if (s === 'WA' && $('sd-checklist').checked) input.moveInChecklist = true;
  if (s === 'IL' && $('sd-noReceipts').checked) input.receiptsUnavailable = true;
  if (s === 'NC' && $('sd-interim').checked) input.interim = true;
  const tenants = $('sd-tenants').value.split('\n').map((x) => x.trim()).filter(Boolean);
  if (tenants.length) input.tenants = tenants;
  return input;
}

function letterInput(preview) {
  const i = readForm();
  return {
    op: 'letter',
    ...i,
    landlord: { name: val('sd-landlord'), address: val('sd-landlordAddress') },
    tenantAddress: val('sd-tenantAddress'),
    property: val('sd-property'),
    ...(preview ? { preview: true } : {}),
  };
}

// ---------- the answer ----------

function renderResult(r, { note } = {}) {
  const out = $('sd-out');
  const big = r.dueDate ? longDate(r.dueDate) : 'Not started';
  const left = r.daysRemaining === undefined ? '' : r.status === 'late' ? `${-r.daysRemaining} days late` : r.status === 'due-today' ? 'Due today' : `${r.daysRemaining} days left`;
  // Like the other tool pages: the tag and source, the inputs in one line, the due date as the big
  // figure, then one line per step and per sum with the statute it comes from.
  const f = readForm();
  const example = Boolean(exampleAsOf);
  const n = f.deductions?.length ?? 0;
  const ins = `${r.stateName}, moved out ${f.moveOut ? longDate(f.moveOut) : 'not given'}${Number(f.deposit) > 0 ? `, a $${Number(f.deposit).toLocaleString('en-US')} deposit with ${n} ${n === 1 ? 'deduction' : 'deductions'}` : ''}${exampleAsOf ? `, as of ${longDate(exampleAsOf)}` : ''}`;
  const item = (k, what, v, why, cls = null) => h('li', { class: cls }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), v ? h('b', {}, v) : null, h('em', {}, why)]);
  const m = r.money?.display;
  put(out,
    h('div', { class: 'tf-rh' }, [h('span', { class: example ? 'tf-tag' : 'tf-tag run' }, example ? 'Example' : 'Your result'), h('span', { class: 'tf-src' }, r.law)]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${ins}` : ins),
    h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, big), left ? h('span', {}, left) : null]),
    h('p', { class: 'tf-sub' }, r.answer),
    h('ul', { class: 'tf-items' }, [
      ...(r.steps ?? []).map((s) => item('d', s.what, longDate(s.date), s.cite, 'hi')),
      m ? item('$', 'Deposit held', m.held, 'your figure') : null,
      m ? item('-', 'Kept for deductions', m.kept, `${n} ${n === 1 ? 'deduction' : 'deductions'}, each checked below`) : null,
      m ? item('=', 'To return', m.refund, r.money.owedByTenant ? `the tenant owes ${m.owedByTenant} above the deposit` : 'with the itemized statement', 'tot') : null,
    ]),
    r.issues ? h('div', { class: 'sd-issues' }, [
      h('h3', {}, r.issues.length ? 'What the statute still asks for' : 'Nothing the statute requires is missing'),
      h('ul', {}, r.issues.map((i) => h('li', { class: `sd-${i.level}` }, [h('span', { class: 'sd-tag' }, i.level === 'missing' ? 'Required' : 'Check'), ` ${i.message} (${i.cite})`]))),
    ]) : null,
    r.exposure ? h('p', { class: 'tf-note' }, [h('strong', {}, 'If missed: '), `${r.exposure.formula} (${r.exposure.cite}).${r.exposure.display ? ` Statutory maximum on these figures: ${r.exposure.display} (${r.exposure.math}).` : ''}`]) : null,
    (r.notes?.length || r.quote) ? h('details', { class: 'xpand' }, [h('summary', {}, 'Notes and the statute\'s words'), h('div', { class: 'xp-in' }, [
      h('ul', { class: 'sd-notes' }, (r.notes ?? []).map((x) => h('li', {}, x))),
      r.quote ? h('blockquote', { class: 'sd-quote' }, [`"${r.quote}"`, h('cite', {}, ` ${r.cite}`)]) : null,
    ])]) : null,
    note ? h('p', { class: 'tf-cost' }, note) : null,
  );
  $('sd-status').textContent = r.answer;
}

function showError(e) {
  for (const el of document.querySelectorAll('.sd-form .field-error')) el.textContent = '';
  $('sd-error').textContent = '';
  const field = e.field ? $(`sd-${e.field.split('.')[0]}-err`) : null;
  if (field) field.textContent = e.message; else $('sd-error').textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') $('sd-error').append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') $('sd-error').append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

// Worked out on the page, free, as the form changes.
function update() {
  if (!engine) return;
  for (const el of document.querySelectorAll('.sd-form .field-error')) el.textContent = '';
  $('sd-error').textContent = '';
  try {
    const input = readForm();
    const r = Number(input.deposit) > 0 || input.deductions.length ? engine.check(input) : engine.deadline(input);
    renderResult(r, { note: exampleAsOf ? `The worked example, as of ${longDate(exampleAsOf)}. Change any date or deduction to work out your own, free.` : 'Worked out on this page, free. Change any date or deduction and it updates.' });
    // The signed-in quote is asked for a moment after typing stops, not on every key.
    clearTimeout(quoteTimer);
    quoteTimer = setTimeout(() => buy.show(), 400);
  } catch (e) {
    if (e instanceof DepositError) showError(e); else throw e;
  }
}

// ---------- files ----------

function base64Bytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const fileLink = (f, text = f.filename) => h('a', { href: URL.createObjectURL(new Blob([f.base64 ? base64Bytes(f.base64) : f.text], { type: f.contentType })), download: f.filename }, text);

function sampleLinks() {
  const ex = tool.examples.find((x) => x.input.op === 'letter');
  if (!ex) return;
  const { letter, record, calendar } = ex.output;
  put($('sd-sample-links'), fileLink(letter, 'the letter (PDF)'), ', ', fileLink(record, 'its proof record (PDF)'), ' and ', fileLink(calendar, 'the calendar file'), '.');
}

function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'Free for you this time.';
  if (typeof json.freeRunsLeft === 'number') return `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  return '';
}

// The paid letter: the signed-in account's own quote, then the run.
const buy = (() => {
  const price = h('p', { class: 'sd-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Get the letter, proof record and calendar file');
  const got = h('p', { class: 'sd-got', role: 'status' });
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const json = await T.run(SLUG, letterInput(false));
      put(got, 'Your files: ', fileLink(json.result.letter, 'letter (PDF)'), ', ', fileLink(json.result.record, 'proof record (PDF)'), ' and ', fileLink(json.result.calendar, 'calendar file'), `. ${costNote(json)}`);
    } catch (e) { showError(e); } finally { button.disabled = false; }
  });
  return {
    mount() { put($('sd-buy'), price, button, got); },
    async show() {
      const text = tool?.pricing?.actions.find((a) => a.name === 'letter')?.text;
      const words = text ? T.money(text) : '';
      if (!signedIn) { price.textContent = `${words}. Sign in to download.`; return; }
      try {
        const q = (await T.api(`/api/run/${SLUG}/quote`, { body: letterInput(false) })).quote;
        price.textContent = q.amount ? `This letter costs ${q.display} from your balance (${words}).` : `This letter is free for you now (${words}).`;
      } catch { price.textContent = words; }
    },
  };
})();

async function preview() {
  const button = $('sd-preview');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, letterInput(true));
    put($('sd-buy').querySelector('.sd-got') ?? $('sd-buy'), 'Preview: ', fileLink(json.result.letter, 'watermarked letter (PDF)'), `. ${costNote(json)}`);
  } catch (e) { showError(e); } finally { button.disabled = false; }
}

// ---------- the rules table ----------

function ruleTable() {
  const covered = engine.covered();
  $('sd-covered').textContent = `States covered: ${covered.map((c) => c.name).join(', ')}. Any other state is refused until its statute has been read.`;
  put($('sd-rule-table'), h('table', {}, [
    h('thead', {}, h('tr', {}, ['State', 'Law', 'Days', 'Clock starts'].map((x) => h('th', {}, x)))),
    h('tbody', {}, covered.map((c) => h('tr', {}, [h('th', {}, c.name), h('td', {}, c.law), h('td', { class: 'r num' }, `${c.days}${c.count === 'business' ? ' business' : ''}`), h('td', {}, c.trigger)]))),
  ]));
}

// ---------- start ----------

function fromQuery() {
  const q = new URLSearchParams(location.search);
  if (!q.get('state') && !q.get('moveOut')) return false;
  if (q.get('state')) $('sd-state').value = q.get('state').toUpperCase();
  for (const k of ['moveOut', 'tenancyEnd', 'tenantDemand']) if (q.get(k)) $(`sd-${k}`).value = q.get(k);
  return true;
}

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('sd-code'), SLUG);
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('sd-out').textContent = 'The rules could not load. Reload the page, or call the tool from code.';
    return;
  }
  engine = makeEngine(tool.examples.find((x) => x.input.op === 'rules').output.rules);
  put($('sd-state'), engine.order.map((c) => h('option', { value: c }, engine.rule(c).name)));
  put($('sd-delivery'), [h('option', { value: '' }, 'Not decided'), ...DELIVERY_KEYS.map((k) => h('option', { value: k }, DELIVERY[k]))]);
  ruleTable();
  sampleLinks();
  buy.mount();
  T.me().then((a) => { signedIn = !!a; buy.show(); }).catch(() => {});

  const linked = fromQuery();
  if (!linked) {
    // The worked example at rest: the sample letter's California move-out.
    const ex = tool.examples.find((x) => x.input.op === 'letter').input;
    $('sd-state').value = ex.state;
    $('sd-moveOut').value = ex.moveOut;
    $('sd-tenancyStart').value = ex.tenancyStart;
    $('sd-deposit').value = String(ex.deposit);
    $('sd-delivery').value = ex.delivery;
    $('sd-photosOut').checked = true;
    for (const d of ex.deductions) deductionRow(d);
    $('sd-landlord').value = ex.landlord.name;
    $('sd-landlordAddress').value = ex.landlord.address;
    $('sd-tenants').value = ex.tenants.join('\n');
    $('sd-tenantAddress').value = ex.tenantAddress;
    $('sd-property').value = ex.property;
    exampleAsOf = ex.asOf;
  } else {
    deductionRow();
  }
  syncState();
  $('sd-state').addEventListener('change', () => { syncState(); update(); });
  const edited = () => { exampleAsOf = null; update(); };
  $('sd-form').addEventListener('input', edited);
  $('sd-form').addEventListener('change', edited);
  $('sd-form').addEventListener('submit', (e) => { e.preventDefault(); update(); });
  $('sd-add').addEventListener('click', () => { deductionRow(); });
  $('sd-preview').addEventListener('click', preview);
  update();
}

start();
