// The chargeback evidence page. core.js (the same file the server runs) works out the checklist, the
// deadline, the fees and the CE 3.0 check here, free, as the form changes; the rules come from the
// tool's published rules example, so the page and the server read the same data. The preview (free,
// watermarked) and the packet (paid) are runs through Endwise.run, with the files read in the
// browser and sent once.
import { makeEngine, ChargebackError, longDate, zipStore, normalizeCode } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'chargeback-evidence';
const $ = (id) => document.getElementById(id);

let engine = null;
let tool = null;
let rules = null;
let signedIn = false;
let quoteTimer = null;
let items = [];
const kept = new Map(); // item id -> { files: [File], note, text }, kept while the list changes

const put = (el, ...kids) => { el.textContent = ''; for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) el.append(k); };
const val = (id) => $(id).value.trim();
const opt = (o, k, v) => { if (v !== '' && v !== undefined && v !== null) o[k] = v; };

function sync() {
  for (const el of document.querySelectorAll('[data-only]')) el.hidden = !el.dataset.only.split(' ').includes($('cb-platform').value);
  const net = $('cb-network').value;
  put($('cb-codes'), engine.codes(net).map((r) => h('option', { value: r.code }, `${r.code} ${r.name}`)));
}

function dispute() {
  return { platform: $('cb-platform').value, network: $('cb-network').value, code: val('cb-code'), productType: $('cb-productType').value };
}

// ---------- the free answers ----------

const TAGS = ['Lead with', 'Then', 'Also'];
const PRODUCTS = { physical: 'physical product', digital: 'digital product or service', offline: 'offline service, ticket or booking' };

// The worked example until the dispute is changed by hand; then it is "Your result".
let touched = false;

// The inputs in one line: "Stripe, Visa 13.1, physical product".
const inputsLine = (c) => `${c.platformName}, ${`${c.networkName ?? ''} ${c.code ?? ''}`.trim()}, ${PRODUCTS[c.productType] ?? c.productType}`;

// The checklist like the other tool pages: a header row, the inputs, the code's name as the big
// line, then one line per piece of evidence with the slot it goes in; the long notes are folded.
function renderChecklist(c) {
  const note = c.codeNote;
  const example = !touched;
  put($('cb-answer'),
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src' }, `${`${c.networkName ?? ''} ${c.code ?? ''}`.trim()} · ${c.categoryName}`),
    ]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${inputsLine(c)}` : inputsLine(c)),
    h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, c.codeName ?? c.categoryName)]),
    h('p', { class: 'tf-sub' }, `Stripe category: ${c.categoryName}. ${c.claim ?? ''}`.trim()),
    h('p', { class: 'cb-label' }, `${c.items.length} pieces of evidence, strongest first`),
    h('ol', { class: 'tf-items' }, c.items.map((x, i) => h('li', { class: i < 2 ? 'hi' : null }, [
      h('span', { class: 'k', 'aria-hidden': 'true' }, String(x.rank)),
      h('span', {}, x.label),
      h('em', {}, `${TAGS[Math.min(2, Math.floor(i / 2))]} · ${c.platformName}: ${x.slot.words}`),
    ]))),
    h('details', { class: 'xpand' }, [h('summary', {}, 'What each piece should show'), h('div', { class: 'xp-in' }, [
      h('ol', { class: 'cb-items' }, c.items.map((x) => h('li', {}, [h('strong', {}, x.label), `: ${x.include}`]))),
    ])]),
    h('details', { class: 'xpand' }, [h('summary', {}, 'The full answer, limits and sources'), h('div', { class: 'xp-in' }, [
      h('p', {}, c.answer),
      c.subReasons?.length ? h('p', { class: 'cb-aside' }, `Sub-reasons Stripe lists under this code: ${c.subReasons.join('; ')}.`) : null,
      note ? h('div', { class: 'cb-note' }, [
        h('p', {}, [h('strong', {}, 'What the network says: '), note.means]),
        note.show?.length ? h('ul', {}, note.show.map((x) => h('li', {}, x))) : null,
        note.watch?.length ? h('p', { class: 'cb-aside' }, note.watch.join(' ')) : null,
        note.timeLimit ? h('p', { class: 'cb-aside' }, [h('strong', {}, 'Time limit for the issuer: '), note.timeLimit]) : null,
      ]) : null,
      h('p', { class: 'cb-aside' }, `${c.submissions} ${c.window}`),
      c.sourceNote ? h('p', { class: 'cb-aside' }, c.sourceNote) : null,
      h('p', { class: 'cb-aside' }, ['Sources: ', ...c.sources.map((s, i) => [i ? '; ' : '', h('a', { href: s.url }, s.title)]).flat(), `. Read ${longDate(c.readOn)}.`]),
    ])]),
    h('p', { class: 'tf-cost' }, 'Worked out on this page, free.'),
  );
  $('cb-status').textContent = c.answer;
}

function renderTime() {
  if (!val('cb-dueBy')) { put($('cb-time')); return; }
  const today = new Date().toISOString().slice(0, 10);
  const d = engine.deadline({ platform: $('cb-platform').value, dueBy: val('cb-dueBy'), caseId: val('cb-caseId') || undefined }, today);
  const ics = URL.createObjectURL(new Blob([d.ics], { type: 'text/calendar' }));
  put($('cb-time'), h('div', { class: `cb-card${d.late ? ' cb-bad' : ''}` }, [
    h('p', { class: 'cb-card-big' }, d.late ? 'Past due' : `${d.daysLeft} ${d.daysLeft === 1 ? 'day' : 'days'} left`),
    h('p', {}, [d.answer, ' ', h('a', { href: ics, download: 'dispute-due.ics' }, 'Add to calendar (.ics)')]),
    d.note ? h('p', { class: 'cb-aside' }, d.note) : null,
  ]));
}

function renderWorth() {
  if (!val('cb-amount')) { put($('cb-worth')); return; }
  const input = { platform: $('cb-platform').value, amount: val('cb-amount'), paypalCase: $('cb-paypalCase').value };
  if (val('cb-winChance') !== '') input.winChance = Number(val('cb-winChance'));
  const w = engine.worth(input);
  put($('cb-worth'), h('div', { class: 'cb-card' }, [
    h('p', { class: 'cb-card-big' }, w.extraToFight.cents ? `Fight above ${w.breakEven.display}` : 'Fighting adds no fee'),
    h('p', {}, w.answer),
    h('ul', { class: 'cb-aside' }, w.fees.map((x) => h('li', {}, x))),
    h('p', { class: 'cb-aside' }, w.math),
  ]));
}

function exhibitRows(c) {
  // Keep what was typed or chosen for an item when the list changes.
  for (const row of document.querySelectorAll('.cb-ex')) {
    kept.set(row.dataset.item, { files: [...row.querySelector('input[type=file]')?.files ?? []], note: row.querySelector('.cb-ex-note')?.value ?? '', text: row.querySelector('textarea')?.value ?? '' });
  }
  const same = items.map((x) => x.id).join() === c.items.map((x) => x.id).join();
  items = c.items;
  if (same) return;
  put($('cb-exhibits'), c.items.map((x) => {
    const k = kept.get(x.id) ?? {};
    const text = h('textarea', { rows: 2, maxlength: 20000, placeholder: x.kind === 'text' ? 'Type it here' : 'Or type it (a chat, an access log)' });
    text.value = k.text ?? '';
    const note = h('input', { type: 'text', class: 'cb-ex-note', maxlength: 600, placeholder: 'What this shows, in a sentence' });
    note.value = k.note ?? '';
    const fileInput = x.kind === 'file' ? h('input', { type: 'file', multiple: true, accept: '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png' }) : null;
    return h('div', { class: 'cb-ex', 'data-item': x.id }, [
      h('p', { class: 'cb-ex-head' }, [h('strong', {}, `${x.rank}. ${x.label}`), h('span', { class: 'cb-slot' }, ` ${x.slot.words}`)]),
      fileInput, note, text,
    ]);
  }));
}

function update() {
  if (!engine) return;
  for (const el of document.querySelectorAll('.cb-form .field-error')) el.textContent = '';
  $('cb-error').textContent = '';
  try {
    const c = engine.checklist(dispute());
    renderChecklist(c);
    exhibitRows(c);
    renderTime();
    renderWorth();
    clearTimeout(quoteTimer);
    quoteTimer = setTimeout(() => buy.show(), 400);
  } catch (e) {
    if (e instanceof ChargebackError) showError(e); else throw e;
  }
}

function showError(e) {
  const field = e.field ? $(`cb-${e.field.split('.')[0]}-err`) : null;
  if (field) field.textContent = e.message; else $('cb-error').textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') $('cb-error').append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') $('cb-error').append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

// ---------- the packet ----------

const toBase64 = (file) => new Promise((resolve, reject) => {
  const r = new FileReader();
  r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
  r.onerror = () => reject(new Error(`${file.name} could not be read.`));
  r.readAsDataURL(file);
});

async function packetInput(preview) {
  const d = dispute();
  const input = { op: 'packet', platform: d.platform, network: d.network, code: d.code, productType: d.productType, caseId: val('cb-caseId'), merchant: { name: val('cb-merchant') }, transaction: { date: val('cb-txDate'), amount: val('cb-amount') || '0' }, exhibits: [] };
  const customer = {};
  opt(customer, 'name', val('cb-customer'));
  opt(customer, 'email', val('cb-email'));
  if (Object.keys(customer).length) input.customer = customer;
  opt(input.transaction, 'orderId', val('cb-orderId'));
  opt(input.transaction, 'description', val('cb-description'));
  opt(input, 'dueBy', val('cb-dueBy'));
  const f = {};
  for (const k of ['shippedOn', 'carrier', 'tracking', 'deliveredOn', 'deliveredTo', 'accessedOn', 'refundOn', 'cancelRequestedOn', 'cancelEffectiveOn', 'summary']) opt(f, k, val(`cb-${k}`));
  if ($('cb-contacted').value) f.customerContacted = $('cb-contacted').value === 'yes';
  if (Object.keys(f).length) input.facts = f;
  for (const row of document.querySelectorAll('.cb-ex')) {
    const files = [...row.querySelector('input[type=file]')?.files ?? []];
    const text = row.querySelector('textarea').value.trim();
    const note = row.querySelector('.cb-ex-note').value.trim();
    if (!files.length && !text) continue;
    const ex = { item: row.dataset.item };
    if (note) ex.note = note;
    if (text) ex.text = text;
    if (files.length) ex.files = await Promise.all(files.map(async (x) => ({ name: x.name, data: await toBase64(x) })));
    input.exhibits.push(ex);
  }
  if (preview) input.preview = true;
  return input;
}

function base64Bytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const fileLink = (f, text = f.name) => h('a', { href: URL.createObjectURL(new Blob([base64Bytes(f.base64)], { type: f.contentType })), download: f.name }, text);

function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'Free for you this time.';
  if (typeof json.freeRunsLeft === 'number') return `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  return '';
}

function renderPacket(r, json) {
  const L = r.limits;
  put($('cb-packet'), h('div', { class: `cb-card${L && !L.ok ? ' cb-bad' : ''}` }, [
    h('p', { class: 'cb-card-big' }, r.preview ? 'Preview' : 'Your packet'),
    r.answer ? h('p', {}, r.answer) : null,
    L ? h('table', { class: 'cb-limits' }, [
      h('thead', {}, h('tr', {}, ['Rule', 'Limit', 'This packet', ''].map((x) => h('th', {}, x)))),
      h('tbody', {}, L.checks.map((x) => h('tr', { class: x.ok ? '' : 'cb-fail' }, [h('td', {}, x.rule), h('td', {}, x.limit), h('td', {}, x.actual), h('td', {}, x.ok ? (x.unsure ? 'Check' : 'OK') : 'Over')]))),
    ]) : null,
    r.warnings.length ? h('ul', { class: 'cb-warn' }, r.warnings.map((x) => h('li', {}, x))) : null,
    r.letterPreview ? h('p', {}, ['Letter: ', fileLink(r.letterPreview, 'watermarked preview (PDF)'), '. ', costNote(json)]) : null,
    r.files ? h('div', {}, [
      h('p', {}, [h('strong', {}, 'Files: '), ...r.files.map((f, i) => [i ? ', ' : '', fileLink(f), f.upload ? '' : ' (keep; the letter text goes in a text field)']).flat(), '. ',
        h('a', { href: URL.createObjectURL(new Blob([zipStore(r.files.map((f) => ({ name: f.name, bytes: base64Bytes(f.base64) })))], { type: 'application/zip' })), download: `dispute-${r.caseId.replace(/[^A-Za-z0-9_-]/g, '')}.zip` }, 'All as .zip'), '. ', costNote(json)]),
    ]) : null,
    Object.keys(r.textFields).length ? h('details', {}, [h('summary', {}, 'Text fields to fill'), h('dl', { class: 'cb-fields' }, Object.entries(r.textFields).flatMap(([k, v]) => [h('dt', {}, k), h('dd', {}, v)]))]) : null,
    h('ol', { class: 'cb-steps' }, r.steps.map((x) => h('li', {}, x))),
  ]));
}

const buy = (() => {
  const price = h('p', { class: 'cb-aside' });
  const button = h('button', { class: 'btn btn-quiet', type: 'button' }, 'Build the packet');
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const json = await T.run(SLUG, await packetInput(false));
      renderPacket(json.result, json);
    } catch (e) { showError(e); } finally { button.disabled = false; }
  });
  return {
    mount() { put($('cb-buy'), price, button); },
    async show() {
      const text = tool?.pricing?.actions.find((a) => a.name === 'packet')?.text;
      const words = text ? T.money(text) : '';
      if (!signedIn) { price.textContent = `${words}. Sign in to build it.`; return; }
      try {
        const body = await packetInput(false);
        for (const x of body.exhibits) delete x.files; // the price does not depend on the files
        if (!body.exhibits.length) body.exhibits = [{ item: items[0]?.id ?? 'receipt', text: '.' }];
        const q = (await T.api(`/api/run/${SLUG}/quote`, { body })).quote;
        price.textContent = q.amount ? `This packet costs ${q.display} from your balance (${words}).` : `This packet is free for you now (${words}).`;
      } catch { price.textContent = words; }
    },
  };
})();

async function preview() {
  const button = $('cb-preview');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, await packetInput(true));
    renderPacket(json.result, json);
  } catch (e) { showError(e); } finally { button.disabled = false; }
}

// ---------- CE 3.0 ----------

const CE3_ROWS = ['Disputed', 'Earlier 1', 'Earlier 2', 'Earlier 3'];
const CE3_FIELDS = ['date', 'description', 'ip', 'device', 'login', 'address'];

function ce3Form(sample) {
  put($('cb-ce3-rows'), CE3_ROWS.map((name, r) => h('tr', {}, [
    h('th', { scope: 'row' }, name),
    ...CE3_FIELDS.map((k) => {
      if (k === 'date' && r === 0) return h('td', {}, 'see above');
      const src = r === 0 ? sample?.disputed : sample?.prior?.[r - 1];
      const v = k === 'device' ? (src?.deviceId ?? src?.deviceFingerprint) : src?.[k];
      return h('td', {}, h('input', { type: k === 'date' ? 'date' : 'text', 'data-r': r, 'data-k': k, 'aria-label': `${name}: ${k}`, value: v ?? '' }));
    }),
  ])));
}

function ce3Update() {
  const date = val('cb-ce3-date');
  if (!date) { put($('cb-ce3-out')); return; }
  const rows = CE3_ROWS.map(() => ({}));
  for (const el of document.querySelectorAll('#cb-ce3-rows input')) {
    const v = el.value.trim();
    if (!v) continue;
    const k = el.dataset.k === 'device' ? (v.length >= 20 && !/^[0-9A-Za-z]{15,19}$/.test(v) ? 'deviceFingerprint' : 'deviceId') : el.dataset.k;
    rows[Number(el.dataset.r)][k] = v;
  }
  const prior = rows.slice(1).filter((x) => x.date);
  try {
    const r = engine.ce3({ disputeDate: date, disputed: rows[0], prior });
    put($('cb-ce3-out'), h('div', { class: `cb-card${r.eligible ? '' : ' cb-bad'}` }, [
      h('p', { class: 'cb-card-big' }, r.eligible ? 'Meets the CE 3.0 test' : 'Does not meet it yet'),
      h('p', {}, r.answer),
      h('ul', {}, [...r.problems.map((x) => h('li', {}, x)), ...r.prior.map((p) => h('li', {}, `Earlier payment of ${longDate(p.date)} (${p.daysBefore} days before): ${p.qualifies ? `qualifies, matching ${p.matched.join(', ')}` : p.problems.join('; ')}.`))]),
      h('p', { class: 'cb-aside' }, `${r.rule}. Stripe checks this for you on Stripe disputes and pre-fills the fields.`),
    ]));
  } catch (e) {
    if (e instanceof ChargebackError) put($('cb-ce3-out'), h('p', { class: 'form-error' }, e.message)); else throw e;
  }
}

// ---------- start ----------

function fromQuery() {
  const q = new URLSearchParams(location.search);
  let any = false;
  for (const k of ['platform', 'network', 'productType']) if (q.get(k) && $(`cb-${k}`).querySelector(`option[value="${q.get(k)}"]`)) { $(`cb-${k}`).value = q.get(k); any = true; }
  if (q.get('code')) { $('cb-code').value = normalizeCode($('cb-network').value, q.get('code')); any = true; }
  for (const k of ['amount', 'dueBy', 'winChance']) if (q.get(k)) { $(`cb-${k}`).value = q.get(k); any = true; }
  return any;
}

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('cb-code-panel'), SLUG);
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    put($('cb-answer'), h('p', {}, 'The rules could not load. Reload the page, or call the tool from code.'));
    return;
  }
  rules = tool.examples.find((x) => x.input.op === 'rules').output.rules;
  engine = makeEngine(rules);
  put($('cb-sources'), Object.values(rules.sources).map((s) => h('li', {}, [h('a', { href: s.url }, s.title), `, read ${longDate(s.readOn)}`])));

  // The worked example at rest: the sample packet, unless the address says otherwise.
  const ex = tool.examples.find((x) => x.input.op === 'packet').input;
  $('cb-platform').value = ex.platform;
  $('cb-network').value = ex.network;
  $('cb-code').value = ex.code;
  $('cb-productType').value = ex.productType;
  $('cb-dueBy').value = ex.dueBy;
  $('cb-amount').value = String(ex.transaction.amount);
  $('cb-caseId').value = ex.caseId;
  $('cb-merchant').value = ex.merchant.name;
  $('cb-txDate').value = ex.transaction.date;
  $('cb-orderId').value = ex.transaction.orderId;
  $('cb-customer').value = ex.customer.name;
  $('cb-email').value = ex.customer.email;
  $('cb-description').value = ex.transaction.description;
  for (const k of ['shippedOn', 'carrier', 'tracking', 'deliveredOn', 'deliveredTo']) $(`cb-${k}`).value = ex.facts[k] ?? '';
  $('cb-contacted').value = ex.facts.customerContacted === false ? 'no' : '';
  for (const x of ex.exhibits) kept.set(x.item, { note: x.note, text: x.text });
  const custom = fromQuery();
  if (custom) touched = true;
  sync();
  buy.mount();
  T.me().then((a) => { signedIn = !!a; buy.show(); }).catch(() => {});
  const ce = tool.examples.find((x) => x.input.op === 'ce3').input;
  $('cb-ce3-date').value = ce.disputeDate;
  ce3Form(ce);
  ce3Update();
  $('cb-network').addEventListener('change', () => { sync(); $('cb-code').value = engine.codes($('cb-network').value)[0].code; });
  $('cb-platform').addEventListener('change', sync);
  // A change made by hand turns the worked example into your result.
  const byHand = (ev) => { if (ev.isTrusted && ev.target.closest('.cb-group')) touched = true; update(); };
  $('cb-form').addEventListener('input', byHand);
  $('cb-form').addEventListener('change', byHand);
  $('cb-preview').addEventListener('click', preview);
  $('cb-ce3-form').addEventListener('input', ce3Update);
  if (custom) $('cb-out').scrollIntoView({ block: 'nearest' });
  update();
}

start();
