// The rent increase page. core.js (the same file the server runs) works out the check here, free, as
// the form changes: the rule rows come from the tool's published rules example, so the page and the
// server read the same figures and quotes. The preview (watermarked, free) and the notice (paid) are
// runs through Endwise.run.
import { makeEngine, RentCapError, longDate } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'rent-increase-cap';
const $ = (id) => document.getElementById(id);

let engine = null;
let tool = null;
let rules = null;
let signedIn = false;
let quoteTimer = null;

const put = (el, ...kids) => { el.textContent = ''; for (const k of kids.flat()) if (k) el.append(k); };
const val = (id) => $(id).value.trim();
const pick = () => $('ri-place').value;
const [stateOf, localityOf] = [(p) => p.split('/')[0], (p) => p.split('/')[1] ?? null];

function syncPlace() {
  const p = pick();
  for (const el of document.querySelectorAll('[data-only]')) el.hidden = !el.dataset.only.split(' ').includes(p);
  const row = rules.states[stateOf(p)];
  const ex = row?.exemptions ?? [];
  put($('ri-exemption'), [h('option', { value: '' }, 'None (or not sure)'), ...ex.map((e) => h('option', { value: e.id }, e.words))]);
  for (const el of document.querySelectorAll('[data-has-exemptions]')) el.hidden = !ex.length;
}

function readForm() {
  const p = pick();
  const input = { state: stateOf(p) };
  if (localityOf(p)) input.locality = localityOf(p);
  if (p === 'CA') input.county = $('ri-county').value;
  input.rent = val('ri-rent') || '0';
  input.effectiveDate = val('ri-effectiveDate');
  const vis = (id) => !$(id).closest('[hidden]');
  if (val('ri-newRent')) input.newRent = val('ri-newRent');
  if (vis('ri-baseRent') && val('ri-baseRent')) input.baseRent = val('ri-baseRent');
  for (const k of ['noticeDate', 'builtDate', 'tenancyStart']) if (val(`ri-${k}`)) input[k] = val(`ri-${k}`);
  for (const k of ['lastIncreaseDate', 'leaseEnd']) if (vis(`ri-${k}`) && val(`ri-${k}`)) input[k] = val(`ri-${k}`);
  if (vis('ri-leaseMonths') && val('ri-leaseMonths')) input.leaseMonths = Number(val('ri-leaseMonths'));
  if (vis('ri-exemption') && $('ri-exemption').value) input.exemption = $('ri-exemption').value;
  if (vis('ri-rstpoClass')) input.rstpoClass = $('ri-rstpoClass').value;
  if (vis('ri-nyc')) {
    const v = $('ri-nyc').value;
    if (v.startsWith('stabilized')) { input.stabilized = true; input.leaseYears = Number(v.slice(-1)); }
    if (v === 'neither') input.goodCause = false;
  }
  for (const k of ['weekToWeek', 'subsidized', 'elderly', 'largeLandlord']) if (vis(`ri-${k}`) && $(`ri-${k}`).checked) input[k] = true;
  if (vis('ri-notLocal') && $('ri-notLocal').checked) input.localCovered = false;
  return input;
}

function noticeInput(preview) {
  const i = readForm();
  const out = {
    op: 'notice',
    ...i,
    noticeDate: i.noticeDate ?? i.effectiveDate,
    landlord: { name: val('ri-landlord'), address: val('ri-landlordAddress') },
    tenants: $('ri-tenants').value.split('\n').map((x) => x.trim()).filter(Boolean),
    property: val('ri-property'),
  };
  if (val('ri-exemptionFacts') && i.exemption) out.exemptionFacts = val('ri-exemptionFacts');
  if (preview) out.preview = true;
  return out;
}

// ---------- the answer ----------

const TAG = { fail: 'Breaks the rule', ok: 'Meets it', check: 'Check', info: 'Also' };

let pristine = true;
function renderResult(r) {
  const big = r.cap ? r.cap.display : r.verdictWords;
  const sub = r.cap
    ? `${r.cap.kind === 'good-cause-standard' ? 'local rent standard' : 'most the rent may be'}: ${r.cap.pct} for ${r.cap.window.label}`
    : r.notice.days ? `${r.notice.days} days' notice, by ${longDate(r.notice.serveBy)}` : '';
  // Like the other tool pages: the tag and source, the inputs in one line, the most the rent may be as
  // the big figure, then one line per figure with the rule it comes from.
  const f = readForm();
  const usd = (n) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
  const ins = `${r.name}, ${usd(f.rent)} rent${f.newRent ? `, ${usd(f.newRent)} proposed` : ''} from ${longDate(r.effectiveDate)}${f.noticeDate ? `, notice served ${longDate(f.noticeDate)}` : ''}`;
  const item = (k, what, v, why, cls = null) => h('li', { class: cls }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), v ? h('b', {}, v) : null, h('em', {}, why)]);
  put($('ri-out'),
    h('div', { class: 'tf-rh' }, [h('span', { class: pristine ? 'tf-tag' : 'tf-tag run' }, pristine ? 'Example' : 'Your result'), h('span', { class: 'tf-src' }, r.law)]),
    h('p', { class: 'tf-exin' }, pristine ? `Example: ${ins}` : ins),
    h('p', { class: 'tf-big' }, [h('b', { class: r.cap ? null : 'word' }, big), sub ? h('span', {}, sub) : null]),
    h('p', { class: 'tf-sub' }, [h('strong', { class: `ri-v-${r.verdict}` }, `${r.verdictWords}. `), r.answer]),
    h('ul', { class: 'tf-items' }, [
      r.cap ? item('%', `Cap for ${r.cap.window.label}`, r.cap.pct, r.cap.math) : null,
      r.proposed ? item('$', 'Your new rent', r.proposed.display, r.proposed.over ? `a ${r.proposed.pct} increase: ${usd(r.proposed.over / 100)} over the most it may be` : `a ${r.proposed.pct} increase${r.cap ? ', within the cap' : ''}`, r.proposed.over ? 'sk' : 'hi') : null,
      r.notice.days ? item('d', `${r.notice.days} days' notice`, longDate(r.notice.serveBy), `serve by this day; ${r.notice.rule}${r.notice.earliestEffective ? `; with your notice date the earliest start is ${longDate(r.notice.earliestEffective)}` : ''}`, 'tot') : null,
    ]),
    h('details', { class: 'xpand' }, [h('summary', {}, 'Each rule applied, with the law\'s words'), h('div', { class: 'xp-in' }, [
      h('ul', { class: 'ri-reasons' }, r.reasons.map((x) => h('li', { class: `ri-${x.level}` }, [
        h('span', { class: 'ri-tag' }, TAG[x.level]), ` ${x.message}`,
        x.quote ? h('blockquote', { class: 'ri-quote' }, [`"${x.quote}"`, h('cite', {}, ` ${x.cite}`)]) : null,
      ]))),
      r.notes.length ? h('ul', { class: 'ri-notes' }, r.notes.map((n) => h('li', {}, n))) : null,
    ])]),
    h('p', { class: 'tf-cost' }, [`Source: `, ...r.sources.map((s, i) => [i ? '; ' : '', h('a', { href: s.via?.url ?? s.url }, s.cite), s.via ? ` (${s.via.name})` : '', `, read ${longDate(s.readOn)}`]).flat(), '. Worked out on this page, free.']),
  );
  $('ri-status').textContent = r.answer;
}

function showError(e) {
  for (const el of document.querySelectorAll('.ri-form .field-error')) el.textContent = '';
  $('ri-error').textContent = '';
  const field = e.field ? $(`ri-${e.field.split('.')[0]}-err`) : null;
  if (field) field.textContent = e.message; else $('ri-error').textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') $('ri-error').append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') $('ri-error').append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

function update() {
  if (!engine) return;
  for (const el of document.querySelectorAll('.ri-form .field-error')) el.textContent = '';
  $('ri-error').textContent = '';
  try {
    renderResult(engine.check(readForm()));
    clearTimeout(quoteTimer);
    quoteTimer = setTimeout(() => buy.show(), 400);
  } catch (e) {
    if (e instanceof RentCapError) showError(e); else throw e;
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
  const price = h('p', { class: 'ri-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Get the notice (PDF)');
  const got = h('p', { class: 'ri-got', role: 'status' });
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const json = await T.run(SLUG, noticeInput(false));
      put(got, 'Your notice: ', fileLink(json.result.file, 'rent increase notice (PDF)'), `. ${costNote(json)}`);
    } catch (e) { showError(e); } finally { button.disabled = false; }
  });
  return {
    mount() { put($('ri-buy'), price, button, got); },
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
  const button = $('ri-preview');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, noticeInput(true));
    put($('ri-buy').querySelector('.ri-got') ?? $('ri-buy'), 'Preview: ', fileLink(json.result.file, 'watermarked notice (PDF)'), `. ${costNote(json)}`);
  } catch (e) { showError(e); } finally { button.disabled = false; }
}

// ---------- the rules table and sources ----------

function ruleTable() {
  const covered = engine.covered();
  $('ri-covered').textContent = `Places covered: ${covered.map((c) => c.name).join(', ')}. Any other state is refused until its rule has been read.`;
  put($('ri-rule-table'), h('table', {}, [
    h('thead', {}, h('tr', {}, ['Place', 'Law', 'Cap', 'Notice'].map((x) => h('th', {}, x)))),
    h('tbody', {}, engine.order.map((c) => { const r = rules.states[c]; return h('tr', {}, [h('th', {}, r.name), h('td', {}, r.law), h('td', {}, r.cap?.words ?? 'No cap in the sections read'), h('td', {}, r.notice.words)]); })),
  ]));
  $('ri-not-covered').textContent = `Not covered: ${engine.notCovered().map((x) => x.name).join(', ')}. Each is refused until its rule has been read on its official site.`;
  const all = [...rules.order.map((c) => rules.states[c]), ...Object.values(rules.localities)];
  put($('ri-sources'), all.flatMap((r) => r.sources.map((s) => h('li', {}, [h('a', { href: s.via?.url ?? s.url }, `${s.cite}: ${s.title}`), ` (${r.name}${s.via ? `; ${s.via.name}` : ''})`]))));
}

// ---------- start ----------

function fromQuery() {
  const q = new URLSearchParams(location.search);
  if (!q.get('state') && !q.get('rent')) return false;
  const s = (q.get('state') ?? '').toUpperCase();
  const place = q.get('locality') ? `${s}/${q.get('locality')}` : s;
  if ([...$('ri-place').options].some((o) => o.value === place)) $('ri-place').value = place;
  if (q.get('county')) $('ri-county').value = q.get('county');
  for (const k of ['rent', 'newRent', 'baseRent', 'effectiveDate', 'noticeDate', 'builtDate', 'tenancyStart']) $(`ri-${k}`).value = q.get(k) ?? '';
  return true;
}

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('ri-code'), SLUG);
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    $('ri-out').textContent = 'The rules could not load. Reload the page, or call the tool from code.';
    return;
  }
  rules = tool.examples.find((x) => x.input.op === 'rules' && !x.input.state).output.rules;
  engine = makeEngine(rules);
  const L = rules.localities;
  const places = [];
  for (const c of engine.order) {
    places.push(h('option', { value: c }, rules.states[c].name));
    for (const l of Object.values(L).filter((x) => x.state === c)) places.push(h('option', { value: `${c}/${l.slug}` }, `${rules.states[c].name}: ${l.name}`));
  }
  places.push(h('option', { value: 'MD/montgomery-county' }, 'Maryland: Montgomery County'));
  put($('ri-place'), places);
  put($('ri-county'), engine.counties.map((n) => h('option', { value: n }, n)));
  ruleTable();
  buy.mount();
  T.me().then((a) => { signedIn = !!a; buy.show(); }).catch(() => {});

  // The worked example at rest: the sample Oregon notice, unless the address says otherwise.
  const ex = tool.examples.find((x) => x.input.op === 'notice').input;
  $('ri-place').value = ex.state;
  $('ri-county').value = 'Los Angeles';
  $('ri-rent').value = String(ex.rent);
  $('ri-newRent').value = String(ex.newRent);
  $('ri-effectiveDate').value = ex.effectiveDate;
  $('ri-noticeDate').value = ex.noticeDate;
  $('ri-tenancyStart').value = ex.tenancyStart;
  $('ri-landlord').value = ex.landlord.name;
  $('ri-landlordAddress').value = ex.landlord.address;
  $('ri-tenants').value = ex.tenants.join('\n');
  $('ri-property').value = ex.property;
  fromQuery();
  syncPlace();
  $('ri-place').addEventListener('change', () => { syncPlace(); pristine = false; update(); });
  pristine = !location.search;
  const edited = () => { pristine = false; update(); };
  $('ri-form').addEventListener('input', edited);
  $('ri-form').addEventListener('change', edited);
  $('ri-form').addEventListener('submit', (e) => { e.preventDefault(); update(); });
  $('ri-preview').addEventListener('click', preview);
  update();
}

start();
