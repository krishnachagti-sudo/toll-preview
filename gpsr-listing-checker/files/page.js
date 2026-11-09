// The GPSR listing checker page. Every check runs on the server through Endwise.run (the rules and
// country data live in the tool's data folder): one listing is free here, a file is priced per SKU.
// The worked example at rest is the tool's first published example. Address parameters prefill the
// form: ?platform=amazon&markets=DE,FR, ?mc=US for the responsible person check, ?tab=one.

const T = window.Endwise;
const h = T.h;
const SLUG = 'gpsr-listing-checker';
const $ = (id) => document.getElementById(id);

// The 27 Member States (data/eu-member-states.json; a test keeps this list equal to it).
export const MARKETS = [['AT', 'Austria'], ['BE', 'Belgium'], ['BG', 'Bulgaria'], ['HR', 'Croatia'], ['CY', 'Cyprus'], ['CZ', 'Czechia'], ['DK', 'Denmark'], ['EE', 'Estonia'], ['FI', 'Finland'], ['FR', 'France'], ['DE', 'Germany'], ['GR', 'Greece'], ['HU', 'Hungary'], ['IE', 'Ireland'], ['IT', 'Italy'], ['LV', 'Latvia'], ['LT', 'Lithuania'], ['LU', 'Luxembourg'], ['MT', 'Malta'], ['NL', 'Netherlands'], ['PL', 'Poland'], ['PT', 'Portugal'], ['RO', 'Romania'], ['SK', 'Slovakia'], ['SI', 'Slovenia'], ['ES', 'Spain'], ['SE', 'Sweden']];
const PLATFORM_NOTES = {
  amazon: 'Amazon keeps the manufacturer\'s and responsible person\'s names and postal addresses in Seller Central, so a listings report usually has only the emails: give the rest once under shop-wide details.',
  etsy: 'Etsy keeps the manufacturer in each listing\'s "Manufacturers" field and the responsible person as an Economic Operator on the account: give shop-wide details once if your export lacks them.',
  ebay: 'eBay\'s product safety fields hold up to 4 pictograms, 8 statements and 120 characters of additional information per listing.',
  shopify: 'Shopify\'s product CSV has no GPSR columns of its own: add them, or give shop-wide details. Variant rows take the product\'s fields from the row above.',
  generic: '',
};

let mode = 'file';
let signedIn = false;

// ---------- the form ----------

function marketsChosen() {
  return [...document.querySelectorAll('#gp-markets input:checked')].map((x) => x.value);
}

function readForm() {
  const markets = marketsChosen();
  if (mode === 'one') {
    const val = (id) => $(id).value.trim();
    const row = {
      sku: val('gp-o-sku'), title: val('gp-o-title'),
      manufacturerName: val('gp-o-mname'), manufacturerAddress: val('gp-o-maddr'), manufacturerEmail: val('gp-o-memail'), manufacturerCountry: val('gp-o-mcountry'),
      rpName: val('gp-o-rname'), rpAddress: val('gp-o-raddr'), rpEmail: val('gp-o-remail'),
      imageUrl: val('gp-o-image'), productType: val('gp-o-type'), gtin: val('gp-o-gtin'),
      warnings: val('gp-o-warn'), warningLanguages: val('gp-o-lang'),
    };
    for (const k of Object.keys(row)) if (!row[k]) delete row[k];
    if (!row.sku && !row.title) return { errors: { error: 'Give the listing a SKU or a title.' } };
    return { input: { op: 'check', rows: [row], markets } };
  }
  const csv = $('gp-csv').value;
  if (!csv.trim()) return { errors: { csv: 'Paste a CSV or choose a file.' } };
  const defaults = {};
  for (const [id, key] of [['gp-d-mname', 'manufacturerName'], ['gp-d-maddr', 'manufacturerAddress'], ['gp-d-memail', 'manufacturerEmail'], ['gp-d-mcountry', 'manufacturerCountry'], ['gp-d-rname', 'rpName'], ['gp-d-raddr', 'rpAddress'], ['gp-d-remail', 'rpEmail']]) {
    const v = $(id).value.trim();
    if (v) defaults[key] = v;
  }
  const input = { op: 'check', csv, platform: $('gp-platform').value, markets };
  if (Object.keys(defaults).length) input.defaults = defaults;
  return { input };
}

function clearErrors() {
  for (const el of document.querySelectorAll('.gp-form .field-error')) el.textContent = '';
}

function showError(e) {
  const fields = e.fields || {};
  if (fields.csv && mode === 'file') { $('gp-csv-err').textContent = fields.csv; return; }
  const box = $('gp-error');
  box.textContent = Object.values(fields)[0] || e.message;
  if (e.status === 401) box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in to check a file'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

function costNote(json) {
  if (json.charged) return `Charged ${json.charged.display}. Your balance is ${json.balance.display}.`;
  if (typeof json.freeRunsLeft === 'number') return `Free check. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'check' : 'checks'} left today.`;
  return null;
}

// What a file costs before it runs: the signed-in account's own quote.
let quoteTimer = null;
function quoteSoon() {
  clearTimeout(quoteTimer);
  quoteTimer = setTimeout(async () => {
    const el = $('gp-cost');
    if (mode === 'one') { el.textContent = 'Free: one listing on this page.'; return; }
    const { input } = readForm();
    if (!input) { el.textContent = ''; return; }
    if (!signedIn) { el.textContent = 'Checking a file needs an account: $0.01 per SKU for the first 1,000 SKUs in a month.'; return; }
    try {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
      el.textContent = q.amount ? `This file costs ${q.display} from your balance.` : 'This check is free for you now.';
    } catch (e) {
      el.textContent = e.status === 401 ? 'Checking a file needs an account: $0.01 per SKU.' : '';
    }
  }, 300);
}

// ---------- the result ----------

const VERDICT = { ok: 'ready', check: 'check by hand', missing: 'missing', 'out-of-scope': 'out of scope' };

function download(name, body) {
  const blob = new Blob([body], { type: 'text/csv' });
  return h('a', { href: URL.createObjectURL(blob), download: name, class: 'gp-dl' }, name);
}

function render(r, { example = null, note = null } = {}) {
  const out = $('gp-out');
  out.textContent = '';
  if (example) out.appendChild(h('p', { class: 't-ex' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', {}, `Worked example: ${example}`)]));
  out.appendChild(h('p', { class: 'gp-answer' }, r.answer));
  if (note) out.appendChild(h('p', { class: 'muted small' }, note));
  const s = r.summary;
  out.appendChild(h('div', { class: 'gp-figures' }, [
    ['SKUs', s.skus], ['missing', s.missing], ['check by hand', s.check], ['ready', s.ok], ...(s['out-of-scope'] ? [['out of scope', s['out-of-scope']]] : []),
  ].map(([k, v]) => h('div', { class: `gp-fig gp-fig-${k.replace(/\s+/g, '-')}` }, [h('span', { class: 'gp-big' }, String(v)), h('span', { class: 'gp-label' }, k)]))));
  if (s.issues.length) {
    out.appendChild(h('div', { class: 'gp-issues' }, [
      h('h3', {}, 'What is missing or to check, by SKUs'),
      h('ul', {}, s.issues.map((x) => h('li', { class: `sev-${x.severity}` }, [h('span', { class: 'gp-n' }, String(x.skus)), ` ${x.label} `, h('span', { class: 'muted' }, `(Article 19(${x.item}))`)]))),
    ]));
  }
  const rows = r.results.slice(0, 200);
  const table = h('table', { class: 'gp-table' }, [
    h('thead', {}, h('tr', {}, ['Line', 'SKU', 'Verdict', 'What to fix'].map((c) => h('th', {}, c)))),
    h('tbody', {}, rows.map((x) => h('tr', { class: `v-${x.verdict}` }, [
      h('td', {}, String(x.line)),
      h('td', {}, [h('b', {}, x.sku ?? ''), x.title ? h('div', { class: 'muted small' }, x.title) : null]),
      h('td', {}, h('span', { class: `gp-verdict v-${x.verdict}` }, VERDICT[x.verdict])),
      h('td', {}, x.verdict === 'out-of-scope' ? x.note : x.findings.length ? h('ul', { class: 'gp-fixes' }, x.findings.map((f) => h('li', { class: `sev-${f.severity}` }, [h('span', { class: 'gp-art' }, f.article), ' ', f.fix]))) : 'Nothing missing.'),
    ]))),
  ]);
  out.appendChild(h('div', { class: 'gp-table-wrap' }, table));
  if (r.results.length > rows.length) out.appendChild(h('p', { class: 'muted small' }, `The first ${rows.length} rows are shown; the fix list has all ${r.results.length}.`));
  out.appendChild(h('p', { class: 'gp-downloads' }, ['Download: ', download('gpsr-fix-list.csv', r.fixCsv), ' and ', download('gpsr-checklist.csv', r.checklistCsv), '.']));
  const labels = r.labels.filter((l) => l.label);
  if (labels.length) {
    out.appendChild(h('details', { class: 'gp-labels' }, [
      h('summary', {}, `Label and listing blocks (${labels.length} of ${r.labels.length} SKUs)`),
      ...labels.slice(0, 50).map((l) => h('figure', { class: 'gp-label-block' }, [h('figcaption', {}, l.sku ?? l.title ?? ''), h('pre', {}, l.label)])),
    ]));
  }
  const used = Object.entries(r.columnsUsed);
  out.appendChild(h('p', { class: 'muted small' }, `Columns read: ${used.map(([k]) => k).join(', ')}.${r.columnsIgnored.length ? ` Not used: ${r.columnsIgnored.slice(0, 12).join(', ')}${r.columnsIgnored.length > 12 ? ' and more' : ''}.` : ''}`));
  if (r.platformNote) out.appendChild(h('p', { class: 'muted small' }, r.platformNote));
}

async function onSubmit(ev) {
  ev.preventDefault();
  clearErrors();
  const { input, errors } = readForm();
  if (errors) { if (errors.csv) $('gp-csv-err').textContent = errors.csv; else $('gp-error').textContent = errors.error; return; }
  $('gp-status').textContent = 'Checking.';
  try {
    const json = await T.run(SLUG, input);
    render(json.result, { note: costNote(json) });
    $('gp-status').textContent = 'Done.';
  } catch (e) {
    showError(e);
    $('gp-status').textContent = '';
  }
}

async function onRp(ev) {
  if (ev) ev.preventDefault();
  const out = $('gp-rp-out');
  const input = { op: 'responsible-person', manufacturerCountry: $('gp-rp-country').value.trim() };
  const rc = $('gp-rp-rpcountry').value.trim();
  if (rc) input.rpCountry = rc;
  try {
    const r = (await T.run(SLUG, input)).result;
    out.textContent = '';
    out.appendChild(h('p', { class: 'gp-answer' }, r.answer));
    out.appendChild(h('ul', {}, r.notes.map((n) => h('li', {}, n))));
  } catch (e) {
    out.textContent = (e.fields && Object.values(e.fields)[0]) || e.message;
  }
}

function setMode(next) {
  mode = next;
  $('gp-tab-file').setAttribute('aria-selected', String(next === 'file'));
  $('gp-tab-one').setAttribute('aria-selected', String(next === 'one'));
  $('gp-file').hidden = next !== 'file';
  $('gp-one').hidden = next !== 'one';
  $('gp-run').textContent = next === 'one' ? 'Check this listing' : 'Check the listings';
  quoteSoon();
}

function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const platform = q.get('platform');
  if (platform && [...$('gp-platform').options].some((o) => o.value === platform)) $('gp-platform').value = platform;
  const markets = (q.get('markets') || '').toUpperCase().split(/[\s,]+/).filter(Boolean);
  if (markets.length) for (const box of document.querySelectorAll('#gp-markets input')) box.checked = markets.includes(box.value);
  if (q.get('mc')) $('gp-rp-country').value = q.get('mc');
  if (q.get('rc')) $('gp-rp-rpcountry').value = q.get('rc');
  if (q.get('tab') === 'one') setMode('one');
}

async function start() {
  $('gp-markets').append(...MARKETS.map(([code, name]) => h('label', { class: 'gp-market' }, [h('input', { type: 'checkbox', value: code, ...(code === 'DE' || code === 'FR' ? { checked: '' } : {}) }), ` ${name}`])));
  $('gp-platform').addEventListener('change', () => { $('gp-platform-note').textContent = PLATFORM_NOTES[$('gp-platform').value] || ''; quoteSoon(); });
  $('gp-tab-file').addEventListener('click', () => setMode('file'));
  $('gp-tab-one').addEventListener('click', () => setMode('one'));
  $('gp-csv').addEventListener('input', quoteSoon);
  $('gp-markets').addEventListener('change', quoteSoon);
  $('gp-upload').addEventListener('change', async () => {
    const file = $('gp-upload').files[0];
    if (!file) return;
    if (file.size > 1_900_000) { $('gp-csv-err').textContent = 'That file is over 1.9 MB; split it into smaller files.'; return; }
    $('gp-csv').value = await file.text();
    quoteSoon();
  });
  $('gp-form').addEventListener('submit', onSubmit);
  $('gp-rp-form').addEventListener('submit', onRp);
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('gp-code'), SLUG);
  T.me().then((account) => { signedIn = !!account; quoteSoon(); }).catch(() => {});
  fromQuery();
  $('gp-platform-note').textContent = PLATFORM_NOTES[$('gp-platform').value] || '';
  try {
    const tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
    const ex = tool.examples[0];
    $('gp-csv').value = ex.input.csv;
    render(ex.output, { example: ex.title, note: 'Made-up listings for a US brand selling into Germany and France. Press "Check the listings" to run it, or paste your own export.' });
  } catch {
    $('gp-out').textContent = 'The worked example could not load. The checker still works: paste your export and press the button.';
  }
  quoteSoon();
}

start();
