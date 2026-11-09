// The late fee page. core.js (the same file the server runs) works out the check here, free, as
// the form changes: the statute rows come from the tool's published rules example, so the page and
// the server read the same quoted text. The preview (watermarked, free) and the notice (paid) are
// runs through Endwise.run.
import { makeEngine, LateFeeError, longDate, KINDS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'late-fee-checker';
const CHICAGO = 'IL-CHICAGO';
const $ = (id) => document.getElementById(id);

let engine = null;
let tool = null;
let rules = null;
let signedIn = false;
let quoteTimer = null;
// While the form still holds the first worked example, the result says so (with its inputs).
let atExample = false;

const put = (el, ...kids) => { el.textContent = ''; for (const k of kids.flat()) if (k) el.append(k); };
const val = (id) => $(id).value.trim();
const pick = () => $('lf-state').value;

function syncState() {
  for (const el of document.querySelectorAll('[data-only]')) el.hidden = !el.dataset.only.split(' ').includes(pick());
}

function readForm() {
  const s = pick();
  const input = s === CHICAGO ? { state: 'IL', city: 'chicago' } : { state: s };
  input.rent = val('lf-rent') || '0';
  input.period = $('lf-period').value;
  input.dueDate = val('lf-dueDate');
  if (val('lf-paidDate')) input.paidDate = val('lf-paidDate');
  if (val('lf-fee')) input.fee = val('lf-fee');
  if (val('lf-pastDue')) input.pastDue = val('lf-pastDue');
  if (val('lf-tenantShare')) input.tenantShare = val('lf-tenantShare');
  if ($('lf-inLease').value) input.inLease = $('lf-inLease').value === 'yes';
  if (!$('lf-units').closest('[hidden]') && val('lf-units')) input.units = Number(val('lf-units'));
  if (s === CHICAGO && $('lf-ownerOccupied').checked) input.ownerOccupied = true;
  if (s === 'DE' && $('lf-noLocalOffice').checked) input.noLocalOffice = true;
  return input;
}

function noticeInput(preview) {
  const i = readForm();
  delete i.paidDate;
  const out = {
    op: 'notice',
    ...i,
    noticeDate: val('lf-noticeDate') || val('lf-paidDate') || i.dueDate,
    landlord: { name: val('lf-landlord'), address: val('lf-landlordAddress') },
    tenants: $('lf-tenants').value.split('\n').map((x) => x.trim()).filter(Boolean),
    property: val('lf-property'),
  };
  if (val('lf-payBy')) out.payBy = val('lf-payBy');
  if (val('lf-payTo')) out.payTo = val('lf-payTo');
  if (preview) out.preview = true;
  return out;
}

// ---------- the answer ----------

const TAG = { fail: 'Breaks the rule', ok: 'Meets it', check: 'Check', info: 'Also' };

function renderResult(r) {
  const big = r.maxFee ? r.maxFee.display : 'No number';
  put($('lf-out'),
    atExample ? h('p', { class: 't-ex' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', {}, `Worked example: ${tool.examples[0].title}`)]) : null,
    h('p', { class: `lf-label lf-v-${r.verdict}` }, `${r.verdictWords}: ${r.name}`),
    h('p', { class: 'lf-answer' }, [big, h('small', {}, r.maxFee ? `most you can charge, from ${longDate(r.firstFeeDate)}` : `in the statute; a fee may start ${longDate(r.firstFeeDate)}`)]),
    h('p', {}, r.answer),
    r.maxFee ? h('p', { class: 'lf-aside' }, [h('strong', {}, 'How: '), r.maxFee.math]) : null,
    h('ul', { class: 'lf-reasons' }, r.reasons.map((x) => h('li', { class: `lf-${x.level}` }, [
      h('span', { class: 'lf-tag' }, TAG[x.level]), ` ${x.message}`,
      x.quote ? h('details', { class: 'lf-q' }, [h('summary', {}, `The words: ${x.cite}`), h('blockquote', { class: 'lf-quote' }, [`"${x.quote}"`, h('cite', {}, ` ${x.cite}`)])]) : null,
    ]))),
    r.notes.length ? h('ul', { class: 'lf-notes' }, r.notes.map((n) => h('li', {}, n))) : null,
    h('p', { class: 'lf-aside' }, [`Source: `, ...r.sources.map((s, i) => [i ? '; ' : '', h('a', { href: s.via?.url ?? s.url }, s.cite), s.via ? ` (${s.via.name})` : ' (official site)', `, read ${longDate(s.readOn)}`]).flat(), '. Worked out on this page, free.']),
  );
  $('lf-status').textContent = r.answer;
}

function showError(e) {
  for (const el of document.querySelectorAll('.lf-form .field-error')) el.textContent = '';
  $('lf-error').textContent = '';
  const field = e.field ? $(`lf-${e.field.split('.')[0]}-err`) : null;
  if (field) field.textContent = e.message; else $('lf-error').textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') $('lf-error').append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') $('lf-error').append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

function update() {
  if (!engine) return;
  for (const el of document.querySelectorAll('.lf-form .field-error')) el.textContent = '';
  $('lf-error').textContent = '';
  try {
    renderResult(engine.check(readForm()));
    clearTimeout(quoteTimer);
    quoteTimer = setTimeout(() => buy.show(), 400);
  } catch (e) {
    if (e instanceof LateFeeError) showError(e); else throw e;
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

// The paid notice: the signed-in account's own quote, then the run.
const buy = (() => {
  const price = h('p', { class: 'lf-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Get the notice (PDF)');
  const got = h('p', { class: 'lf-got', role: 'status' });
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const json = await T.run(SLUG, noticeInput(false));
      put(got, 'Your notice: ', fileLink(json.result.notice, 'late rent notice (PDF)'), `. ${costNote(json)}`);
    } catch (e) { showError(e); } finally { button.disabled = false; }
  });
  return {
    mount() { put($('lf-buy'), price, button, got); },
    async show() {
      const text = tool?.pricing?.actions.find((a) => a.name === 'notice')?.text;
      const words = text ? T.money(text) : '';
      if (!signedIn) { price.textContent = `${words}. Sign in to download.`; return; }
      try {
        const q = (await T.api(`/api/run/${SLUG}/quote`, { body: noticeInput(false) })).quote;
        price.textContent = q.amount ? `This notice costs ${q.display} from your balance (${words}).` : `This notice is free for you now (${words}).`;
      } catch { price.textContent = words; }
    },
  };
})();

async function preview() {
  const button = $('lf-preview');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, noticeInput(true));
    put($('lf-buy').querySelector('.lf-got') ?? $('lf-buy'), 'Preview: ', fileLink(json.result.notice, 'watermarked notice (PDF)'), `. ${costNote(json)}`);
  } catch (e) { showError(e); } finally { button.disabled = false; }
}

// ---------- the rules table and sources ----------

const QUALITY = { official: 'official site', 'official-archive': 'official site, archived copy', mirror: 'copy of the statute', 'mirror-archive': 'archived copy of the statute' };

function ruleTable() {
  const covered = engine.covered();
  $('lf-covered').textContent = `States covered: ${covered.map((c) => c.name).join(', ')}, and the city of Chicago. Any other state is refused until its statute has been read.`;
  put($('lf-rule-table'), h('table', {}, [
    h('thead', {}, h('tr', {}, ['State', 'Law', 'Limit', 'Fee may start', 'Read from'].map((x) => h('th', {}, x)))),
    h('tbody', {}, covered.map((c) => h('tr', {}, [h('th', {}, c.name), h('td', {}, c.law), h('td', {}, c.cap ?? KINDS[c.kind]), h('td', {}, c.start), h('td', {}, QUALITY[c.quality])]))),
  ]));
  $('lf-not-covered').textContent = `Not covered: ${engine.notCovered().map((x) => x.name).join(', ')}. Each is refused until its statute has been read and quoted.`;
  const all = [...rules.order.map((c) => rules.states[c]), rules.cities.chicago];
  put($('lf-sources'), all.flatMap((r) => r.sources.map((s) => h('li', {}, [h('a', { href: s.via?.url ?? s.url }, s.cite), ` (${r.name}; ${s.via ? s.via.name : 'official site'})`]))));
}

// ---------- start ----------

function fromQuery() {
  const q = new URLSearchParams(location.search);
  if (!q.get('state') && !q.get('rent')) return false;
  const s = (q.get('state') ?? '').toUpperCase();
  if (s) $('lf-state').value = s === 'IL' && q.get('city') === 'chicago' ? CHICAGO : s;
  for (const k of ['rent', 'dueDate', 'paidDate', 'fee', 'units', 'pastDue']) if (q.get(k)) $(`lf-${k}`).value = q.get(k);
  if (q.get('period') === 'week') $('lf-period').value = 'week';
  return true;
}

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('lf-code'), SLUG);
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('lf-out').textContent = 'The rules could not load. Reload the page, or call the tool from code.';
    return;
  }
  rules = tool.examples.find((x) => x.input.op === 'rules' && !x.input.state).output.rules;
  engine = makeEngine(rules);
  put($('lf-state'), [...engine.order.map((c) => h('option', { value: c }, rules.states[c].name)), h('option', { value: CHICAGO }, 'Illinois: Chicago')]);
  ruleTable();
  buy.mount();
  T.me().then((a) => { signedIn = !!a; buy.show(); }).catch(() => {});

  // The worked example at rest: the tool's first example (a Texas rent and a $200 fee), with the
  // sample notice's names for the PDF, unless the address says otherwise.
  const first = tool.examples[0].input;
  const ex = tool.examples.find((x) => x.input.op === 'notice').input;
  $('lf-state').value = first.state;
  $('lf-rent').value = String(first.rent);
  $('lf-units').value = String(first.units);
  $('lf-dueDate').value = first.dueDate;
  $('lf-paidDate').value = first.paidDate;
  $('lf-fee').value = String(first.fee);
  $('lf-inLease').value = first.inLease ? 'yes' : '';
  $('lf-landlord').value = ex.landlord.name;
  $('lf-landlordAddress').value = ex.landlord.address;
  $('lf-tenants').value = ex.tenants.join('\n');
  $('lf-property').value = ex.property;
  $('lf-noticeDate').value = ex.noticeDate;
  $('lf-payBy').value = ex.payBy;
  $('lf-payTo').value = ex.payTo;
  atExample = true;
  if (fromQuery()) { atExample = false; $('lf-paidDate').value = new URLSearchParams(location.search).get('paidDate') ?? ''; $('lf-fee').value = new URLSearchParams(location.search).get('fee') ?? ''; $('lf-inLease').value = ''; }
  syncState();
  $('lf-state').addEventListener('change', () => { syncState(); });
  const edited = () => { atExample = false; update(); };
  $('lf-form').addEventListener('input', edited);
  $('lf-form').addEventListener('change', edited);
  // The button checks again and, on a phone, brings the answer into view under the form.
  $('lf-form').addEventListener('submit', (e) => {
    e.preventDefault();
    update();
    if (matchMedia('(max-width: 959px)').matches) $('lf-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('lf-preview').addEventListener('click', preview);
  update();
}

start();
