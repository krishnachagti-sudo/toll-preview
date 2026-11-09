// The late payment interest page. core.js (the same file the server runs) works the figure out
// here, free, as the form changes: the rules and rate tables come from the tool's published
// "rates" example, so the page and the server read the same official figures. The preview
// (watermarked, free), the claim letter (paid) and the CSV batch (paid) are runs through Endwise.run.
import { makeEngine, LatePaymentError, longDate, rateText, money, SYMBOL } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'late-payment-interest';
const $ = (id) => document.getElementById(id);

let engine = null;
let tool = null;
let signedIn = false;
let quoteTimer = null;
// While the form still holds the first worked example, the result says so (with its inputs).
let atExample = false;

const put = (el, ...kids) => { el.textContent = ''; for (const k of kids.flat()) if (k) el.append(k); };
const val = (id) => $(id).value.trim();
const law = () => $('lp-jurisdiction').value;
const CUR = { uk: 'GBP', ie: 'EUR', de: 'EUR', eu: 'EUR', 'us-federal': 'USD', 'us-tx': 'USD', 'us-fl': 'USD' };

function sync() {
  for (const el of document.querySelectorAll('[data-only]')) el.hidden = !el.dataset.only.split(' ').includes(law());
  const cur = law() === 'terms' ? $('lp-currency').value : CUR[law()];
  $('lp-cur').textContent = SYMBOL[cur];
}

function readForm() {
  const i = { jurisdiction: law(), amount: val('lp-amount') || '0' };
  for (const k of ['dueDate', 'invoiceDate', 'paidDate', 'asOf']) if (val(`lp-${k}`)) i[k] = val(`lp-${k}`);
  if (i.dueDate) delete i.invoiceDate;
  if (!i.dueDate && val('lp-termsDays')) i.termsDays = Number(val('lp-termsDays'));
  if (i.paidDate) delete i.asOf;
  if ($('lp-disputed').checked) i.disputed = true;
  if (law() === 'terms') {
    i.rate = val('lp-rate') || '0';
    i.per = $('lp-per').value;
    i.method = $('lp-method').value;
    i.currency = $('lp-currency').value;
    if (val('lp-graceDays')) i.graceDays = Number(val('lp-graceDays'));
    if (val('lp-flatFee')) i.flatFee = val('lp-flatFee');
  }
  return i;
}

function noticeInput(preview) {
  const i = readForm();
  const out = {
    op: 'notice',
    ...i,
    asOf: i.paidDate ? (val('lp-asOf') || i.paidDate) : i.asOf,
    invoiceNumber: val('lp-invoiceNumber'),
    creditor: { name: val('lp-creditor'), address: val('lp-creditorAddress') },
    debtor: { name: val('lp-debtor'), address: val('lp-debtorAddress') },
  };
  if (val('lp-payBy')) out.payBy = val('lp-payBy');
  if (val('lp-payTo')) out.payTo = val('lp-payTo');
  if (preview) out.preview = true;
  return out;
}

// ---------- the answer ----------

function renderResult(r) {
  const c = r.currency;
  const big = r.periods.length ? r.display.total : money(0, c);
  put($('lp-out'),
    atExample ? h('p', { class: 't-ex' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', {}, `Worked example: ${tool.examples[0].title}`)]) : null,
    h('p', { class: 'lp-label' }, r.law),
    h('p', { class: 'lp-answer' }, [big, h('small', {}, r.periods.length ? (r.compensation ? 'interest and fixed compensation' : 'interest') : 'nothing to claim yet')]),
    h('p', {}, r.answer),
    r.periods.length ? h('div', { class: 'table-scroll' }, h('table', {}, [
      h('thead', {}, h('tr', {}, ['Period', 'Days', 'Rate', 'Reference', 'Interest'].map((x) => h('th', {}, x)))),
      h('tbody', {}, [
        ...r.periods.map((p) => h('tr', {}, [
          h('td', {}, `${longDate(p.from)} to ${longDate(p.to)}`),
          h('td', { class: 'num' }, String(p.days)),
          h('td', { class: 'num' }, p.monthlyRate ? `${rateText(p.monthlyRate)} a month` : rateText(p.rate)),
          h('td', {}, p.referenceDate ? `${r.jurisdiction === 'de' ? 'Basiszinssatz' : r.jurisdiction === 'uk' ? 'Bank Rate' : 'ECB rate'} ${rateText(p.base)} on ${longDate(p.referenceDate)}` : p.fiscalYear ? `Fiscal ${p.fiscalYear}` : p.federalRegister ? `Treasury, ${longDate(p.ratePeriod.from)} to ${longDate(p.ratePeriod.to)}` : p.months ? `${p.months} months` : 'Your terms'),
          h('td', { class: 'num' }, money(p.interest, c)),
        ])),
        r.compensation ? h('tr', {}, [h('td', { colspan: '4' }, 'Fixed compensation'), h('td', { class: 'num' }, r.display.compensation)]) : null,
        r.flatFee ? h('tr', {}, [h('td', { colspan: '4' }, 'Flat fee in your terms'), h('td', { class: 'num' }, r.display.flatFee)]) : null,
      ]),
    ])) : null,
    r.notes.length ? h('ul', { class: 'lp-notes' }, r.notes.map((n) => h('li', {}, n))) : null,
    r.sources.length ? h('p', { class: 'lp-aside' }, ['Rates and rules from ', ...r.sources.map((s, i) => [i ? '; ' : '', h('a', { href: s.url }, s.title)]).flat(), `, read ${longDate(r.sources[0].readOn)}. Worked out on this page, free.`]) : null,
  );
  $('lp-status').textContent = r.answer;
}

function showError(e, box = 'lp-error') {
  for (const el of document.querySelectorAll('.lp-form .field-error')) el.textContent = '';
  $(box).textContent = '';
  const field = e.field ? $(`lp-${e.field.split('.')[0]}-err`) : null;
  if (field) field.textContent = e.message; else $(box).textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') $(box).append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') $(box).append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

function update() {
  if (!engine) return;
  sync();
  for (const el of document.querySelectorAll('.lp-form .field-error')) el.textContent = '';
  $('lp-error').textContent = '';
  try {
    renderResult(engine.calculate(readForm()));
    clearTimeout(quoteTimer);
    quoteTimer = setTimeout(() => buy.show(), 400);
  } catch (e) {
    if (e instanceof LatePaymentError) showError(e); else throw e;
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
const priceWords = (name) => {
  const text = tool?.pricing?.actions.find((a) => a.name === name)?.text;
  return text ? T.money(text) : '';
};

// The paid letter: the signed-in account's own quote, then the run.
const buy = (() => {
  const price = h('p', { class: 'lp-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Get the letter and interest invoice (PDF)');
  const got = h('p', { class: 'lp-got', role: 'status' });
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const json = await T.run(SLUG, noticeInput(false));
      put(got, 'Your claim: ', fileLink(json.result.notice, 'letter and interest invoice (PDF)'), `. ${costNote(json)}`);
    } catch (e) { showError(e); } finally { button.disabled = false; }
  });
  return {
    mount() { put($('lp-buy'), price, button, got); },
    async show() {
      const words = priceWords('notice');
      if (!signedIn) { price.textContent = `${words}. Sign in to download.`; return; }
      try {
        const q = (await T.api(`/api/run/${SLUG}/quote`, { body: noticeInput(false) })).quote;
        price.textContent = q.amount ? `This letter costs ${q.display} from your balance (${words}).` : `This letter is free for you now (${words}).`;
      } catch { price.textContent = words; }
    },
  };
})();

async function preview() {
  const button = $('lp-preview');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, noticeInput(true));
    put($('lp-buy').querySelector('.lp-got') ?? $('lp-buy'), 'Preview: ', fileLink(json.result.notice, 'watermarked letter (PDF)'), `. ${costNote(json)}`);
  } catch (e) { showError(e); } finally { button.disabled = false; }
}

// ---------- batch ----------

function mountBatch(example) {
  $('lp-csv').value = example.input.csv;
  const button = h('button', { class: 'btn', type: 'button' }, 'Work out every invoice (CSV)');
  const price = h('p', { class: 'lp-aside' }, `${priceWords('batch')}.`);
  button.addEventListener('click', async () => {
    button.disabled = true;
    $('lp-batch-error').textContent = '';
    try {
      const f = readForm();
      const body = { op: 'batch', jurisdiction: f.jurisdiction, asOf: val('lp-asOf') || f.paidDate || example.input.asOf, csv: $('lp-csv').value };
      for (const k of ['rate', 'per', 'method', 'graceDays', 'flatFee', 'currency']) if (f[k] !== undefined) body[k] = f[k];
      const json = await T.run(SLUG, body);
      const b = json.result;
      put($('lp-batch-out'),
        h('p', {}, `${b.totals.invoices} invoices: ${b.totals.display.interest} interest and ${b.totals.display.compensation} compensation, ${b.totals.display.total} in all.`),
        h('p', {}, [fileLink(b.file, 'claims (CSV)'), `. ${costNote(json)}`]));
    } catch (e) { showError(e, 'lp-batch-error'); } finally { button.disabled = false; }
  });
  put($('lp-batch-buy'), price, button);
}

// ---------- the rate table and sources ----------

function rateTable(answer) {
  const rows = answer.uk.slice(-6).reverse();
  put($('lp-rate-table'), h('table', {}, [
    h('thead', {}, h('tr', {}, ['Debts late from', 'Reference date', 'Bank Rate', 'Statutory rate'].map((x) => h('th', {}, x)))),
    h('tbody', {}, rows.map((r) => h('tr', {}, [h('td', {}, `${longDate(r.from)} to ${longDate(r.to)}`), h('td', {}, longDate(r.referenceDate)), h('td', { class: 'num' }, rateText(r.base)), h('td', { class: 'num' }, rateText(r.rate))]))),
  ]));
  const seen = new Set();
  const items = [];
  for (const j of Object.values(answer.rules.jurisdictions)) {
    for (const s of j.sources) if (!seen.has(s.url)) { seen.add(s.url); items.push(h('li', {}, [h('a', { href: s.url }, s.title)])); }
  }
  put($('lp-sources'), items);
}

// ---------- start ----------

const FIELDS = ['amount', 'dueDate', 'invoiceDate', 'termsDays', 'paidDate', 'asOf', 'rate'];
function fromQuery() {
  const q = new URLSearchParams(location.search);
  if (!q.get('amount') && !q.get('jurisdiction')) return false;
  if (q.get('jurisdiction')) $('lp-jurisdiction').value = q.get('jurisdiction');
  for (const k of FIELDS) $(`lp-${k}`).value = q.get(k) ?? (k === 'rate' ? '1.5' : '');
  for (const k of ['per', 'method', 'currency']) if (q.get(k)) $(`lp-${k}`).value = q.get(k);
  if (!q.get('paidDate') && !q.get('asOf')) $('lp-asOf').value = new Date().toISOString().slice(0, 10);
  return true;
}

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('lp-code'), SLUG);
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('lp-out').textContent = 'The rates could not load. Reload the page, or call the tool from code.';
    return;
  }
  const answer = tool.examples.find((x) => x.input.op === 'rates' && !x.input.jurisdiction).output;
  engine = makeEngine({ rules: answer.rules, rates: answer.rates });
  rateTable(answer);
  buy.mount();
  mountBatch(tool.examples.find((x) => x.input.op === 'batch'));
  T.me().then((a) => { signedIn = !!a; buy.show(); }).catch(() => {});

  // The worked example at rest: the tool's first example (a UK invoice paid late), with the sample
  // claim's made-up firms for the letter, unless the address says otherwise.
  const first = tool.examples[0].input;
  const ex = tool.examples.find((x) => x.input.op === 'notice').input;
  $('lp-jurisdiction').value = first.jurisdiction;
  $('lp-amount').value = String(first.amount);
  $('lp-dueDate').value = first.dueDate;
  $('lp-paidDate').value = first.paidDate ?? '';
  $('lp-asOf').value = first.asOf ?? '';
  $('lp-invoiceNumber').value = ex.invoiceNumber;
  $('lp-creditor').value = ex.creditor.name;
  $('lp-creditorAddress').value = ex.creditor.address;
  $('lp-debtor').value = ex.debtor.name;
  $('lp-debtorAddress').value = ex.debtor.address;
  $('lp-payBy').value = ex.payBy;
  $('lp-payTo').value = ex.payTo;
  atExample = true;
  if (fromQuery()) atExample = false;
  const edited = () => { atExample = false; update(); };
  $('lp-form').addEventListener('input', edited);
  $('lp-form').addEventListener('change', edited);
  // The button works it out again and, on a phone, brings the answer into view under the form.
  $('lp-form').addEventListener('submit', (e) => {
    e.preventDefault();
    update();
    if (matchMedia('(max-width: 959px)').matches) $('lp-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('lp-preview').addEventListener('click', preview);
  update();
}

start();
