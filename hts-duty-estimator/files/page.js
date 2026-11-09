// The US import duty estimator page. Every answer comes from the server through Endwise.run (the
// HTS table is too large for a page); core.js (the same file the server runs) lists the countries
// and formats money, so the page and the API agree. One SKU and the missing-data check are free here;
// an estimate for a product list is charged per SKU row. The worked example shows at rest.
import { COUNTRIES, money, LIMITS, longDate } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'hts-duty-estimator';
const $ = (id) => document.getElementById(id);
const pct = (x) => `${Number(x.toFixed(2))}%`;

// ---------- drawing an answer ----------

const sourceLinks = (sources) => (sources ?? []).flatMap((s, i) => [i ? '; ' : '', h('a', { href: s.href }, s.text)]);

function layerTable(r) {
  const rows = [h('tr', {}, [h('td', {}, `Base rate, ${r.base.column}`), h('td', {}, r.base.rate), h('td', { class: 'num' }, money(r.base.duty)), h('td', {}, sourceLinks(r.base.sources))])];
  for (const l of r.layers) {
    rows.push(h('tr', {}, [
      h('td', {}, [`${l.name} `, h('span', { class: 'hd-tag' }, l.heading)]),
      h('td', {}, l.exempt ? `exempt: ${l.exempt}` : pct(l.rate)),
      h('td', { class: 'num' }, money(l.duty)),
      h('td', {}, sourceLinks(l.sources)),
    ]));
  }
  return h('div', { class: 'hd-scroll' }, h('table', { class: 'hd-table' }, [
    h('thead', {}, h('tr', {}, [h('th', {}, 'Layer'), h('th', {}, 'Rate'), h('th', { class: 'num' }, 'Duty'), h('th', {}, 'Source')])),
    h('tbody', {}, rows),
    h('tfoot', {}, h('tr', {}, [h('td', {}, 'Total'), h('td', {}, pct(r.effectiveRate)), h('td', { class: 'num' }, money(r.duty)), h('td', {}, '')])),
  ]));
}

function oneView(result) {
  const r = result.rows[0];
  if (r.status !== 'estimated') {
    const why = r.status === 'incomplete' ? r.problems.map((p) => p.reason) : r.refusals.map((x) => x.reason);
    return [
      h('p', { class: 'hd-answer hd-miss' }, r.status === 'incomplete' ? 'Missing data' : 'No estimate'),
      h('p', { class: 'hd-sub' }, result.answer),
      h('ul', { class: 'hd-notes' }, why.map((x) => h('li', {}, x))),
      r.line ? h('p', { class: 'hd-aside' }, `${r.line.code}: ${r.line.description}. General rate ${r.line.general || 'not printed'}.`) : null,
    ];
  }
  return [
    h('p', { class: 'hd-answer' }, [money(r.duty), h('small', {}, ` ${pct(r.effectiveRate)} of ${money(r.value)}, from ${r.originName}`)]),
    h('p', { class: 'hd-sub' }, result.answer),
    h('p', { class: 'hd-aside' }, `${r.line.code}: ${r.line.description}.`),
    layerTable(r),
    r.notes.length ? h('ul', { class: 'hd-notes' }, r.notes.map((x) => h('li', {}, x))) : null,
  ];
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
  return h('a', { href: url, download: name, class: 'btn btn-small' }, 'Download the results CSV');
}

function listView(result) {
  const s = result.summary;
  const shown = result.rows.slice(0, 300);
  const reason = (r) => (r.status === 'incomplete' ? r.problems.map((p) => p.reason).join('; ') : r.status === 'refused' ? r.refusals[0].reason : r.layers.filter((l) => l.duty > 0).map((l) => `${l.heading} ${pct(l.rate)}`).join(' + ') || 'base rate only');
  return [
    h('p', { class: 'hd-answer' }, [money(s.duty), h('small', {}, ` on ${s.estimated.toLocaleString('en-US')} of ${s.rows.toLocaleString('en-US')} rows`)]),
    h('p', { class: 'hd-sub' }, result.answer),
    result.csv ? h('p', { class: 'hd-downloads' }, download('duty-estimate.csv', result.csv)) : null,
    result.fees ? feesView(result.fees) : null,
    h('div', { class: 'hd-scroll' }, h('table', { class: 'hd-table' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'SKU'), h('th', {}, 'HTS'), h('th', {}, 'Origin'), h('th', { class: 'num' }, 'Value'), h('th', { class: 'num' }, 'Duty'), h('th', {}, 'Layers or reason')])),
      h('tbody', {}, shown.map((r) => h('tr', { class: r.status === 'estimated' ? '' : 'hd-miss' }, [
        h('td', {}, r.sku || r.title || ''), h('td', {}, r.line?.code ?? r.code ?? ''), h('td', {}, r.origin ?? ''),
        h('td', { class: 'num' }, r.value ? money(r.value) : ''), h('td', { class: 'num' }, r.status === 'estimated' ? money(r.duty) : '-'), h('td', {}, reason(r)),
      ]))),
    ])),
    result.rows.length > shown.length ? h('p', { class: 'hd-aside' }, `The first ${shown.length} rows are shown; the CSV has all ${result.rows.length.toLocaleString('en-US')}.`) : null,
  ];
}

function feesView(f) {
  if (f.refused) return h('p', { class: 'hd-aside' }, f.refused);
  return h('p', { class: 'hd-aside' }, `As one ${f.mode} shipment worth ${money(f.value)}: ${f.entry} entry, because ${f.why}. MPF ${money(f.mpf)} (${f.mpfRule})${f.hmf ? `; HMF ${money(f.hmf)} (0.125% of value)` : ''}. ${f.note}`);
}

function auditView(result) {
  const s = result.summary;
  const shown = result.rows.filter((r) => r.missing.length).slice(0, 300);
  return [
    h('p', { class: 'hd-answer' }, [s.complete.toLocaleString('en-US'), h('small', {}, ` of ${s.rows.toLocaleString('en-US')} rows complete`)]),
    h('p', { class: 'hd-sub' }, result.answer),
    result.note ? h('p', { class: 'hd-aside' }, result.note) : null,
    h('p', { class: 'hd-aside' }, `Columns read: ${Object.entries(result.columns).filter(([, v]) => v).map(([k, v]) => `${k} from "${v}"`).join(', ') || 'none we recognize'}.${result.joinedFromInventory ? ` ${result.joinedFromInventory} SKUs joined from the inventory CSV.` : ''}`),
    shown.length ? h('div', { class: 'hd-scroll' }, h('table', { class: 'hd-table' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'SKU'), h('th', {}, 'Title'), h('th', {}, 'Missing')])),
      h('tbody', {}, shown.map((r) => h('tr', {}, [h('td', {}, r.sku), h('td', {}, r.title), h('td', {}, r.missing.join(', '))]))),
    ])) : null,
  ];
}

function render(result, { label, note, example }) {
  const out = $('hd-out');
  out.textContent = '';
  const body = result.summary && 'complete' in result.summary ? auditView(result) : result.rows.length === 1 && !result.fees ? oneView(result) : listView(result);
  const dated = result.asOf ? h('p', { class: 'hd-aside' }, `As of ${longDate(result.asOf)}: ${result.revision} (effective ${result.effective}) and the Federal Register actions read that day. Not applied: ${result.notApplied.map((x) => `${x.what} (${x.why})`).join('; ')}.`) : null;
  const next = result.scheduled?.length ? h('p', { class: 'hd-aside' }, ['Scheduled: ', result.scheduled.map((x) => `${longDate(x.date)}, ${x.what}`).join('; '), '.']) : null;
  out.append(h('div', {}, [
    label && example ? h('p', { class: 't-ex' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', {}, `${label}: ${example}`)]) : label ? h('p', { class: 'hd-label' }, label) : null,
    ...body,
    dated || next ? h('details', { class: 'xpand hd-asof' }, [h('summary', {}, result.asOf ? `As of ${longDate(result.asOf)}: what is not applied${next ? ', and what is scheduled' : ''}` : 'What is scheduled'), h('div', { class: 'xp-in' }, [dated, next])]) : null,
    note ? h('p', { class: 'hd-cost' }, note) : null,
  ]));
}

// ---------- running ----------

function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'No charge.';
  if (typeof json.freeRunsLeft === 'number') return `Free run. You have ${json.freeRunsLeft} free ${json.freeRunsLeft === 1 ? 'run' : 'runs'} left today.`;
  return null;
}

function showError(e, errId) {
  const box = $(errId);
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited' || e.code === 'sign_in_required') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in or create an account'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

const num = (s) => { const v = String(s ?? '').replace(/[$,\s]/g, ''); return v === '' ? undefined : Number(v); };

async function onOne(ev) {
  ev.preventDefault();
  for (const id of ['hd-error', 'hd-code-err', 'hd-origin-err', 'hd-value-err']) $(id).textContent = '';
  const code = $('hd-code').value.trim();
  const origin = $('hd-origin').value.trim();
  const value = num($('hd-value').value);
  if (!code) { $('hd-code-err').textContent = 'Enter an HTS code, such as 6109.10.00.12.'; return; }
  if (!origin) { $('hd-origin-err').textContent = 'Enter the country of origin, such as VN.'; return; }
  if (!(value > 0)) { $('hd-value-err').textContent = 'Enter the customs value in US dollars.'; return; }
  const row = { code, origin, value };
  const qty = num($('hd-qty').value);
  const kg = num($('hd-kg').value);
  if (qty !== undefined && qty >= 0) row.quantity = qty;
  if (kg !== undefined && kg >= 0) row.weightKg = kg;
  const button = $('hd-run');
  button.disabled = true;
  try {
    const json = await T.run(SLUG, { op: 'estimate', rows: [row], claimFta: $('hd-fta').checked });
    render(json.result, { label: 'Your estimate', note: costNote(json) });
    $('hd-status').textContent = json.result.answer;
  } catch (e) {
    showError(e, 'hd-error');
  } finally {
    button.disabled = false;
  }
}

const readFile = (file) => new Promise((resolve, reject) => {
  const fr = new FileReader();
  fr.onload = () => resolve(String(fr.result));
  fr.onerror = () => reject(new Error('That file could not be read.'));
  fr.readAsText(file);
});

async function onFile(ev) {
  ev.preventDefault();
  $('hd-file-error').textContent = '';
  $('hd-csv-err').textContent = '';
  const op = ev.submitter?.value === 'estimate' ? 'estimate' : 'audit';
  const file = $('hd-csv').files[0];
  if (!file) { $('hd-csv-err').textContent = 'Choose your product CSV.'; return; }
  try {
    const csv = await readFile(file);
    if (csv.length > LIMITS.csvChars) { $('hd-csv-err').textContent = `The file is over ${LIMITS.csvChars.toLocaleString('en-US')} characters; split it.`; return; }
    const inv = $('hd-inv').files[0] ? await readFile($('hd-inv').files[0]) : undefined;
    const body = { op, csv, platform: $('hd-platform').value };
    if (inv) body.inventoryCsv = inv;
    if (op === 'estimate' && $('hd-mode').value) body.shipment = { mode: $('hd-mode').value };
    if (op === 'audit') delete body.shipment;
    ev.submitter.disabled = true;
    const json = await T.run(SLUG, body);
    render(json.result, { label: op === 'audit' ? 'Your product check' : 'Your product list', note: costNote(json) });
    $('hd-status').textContent = json.result.answer;
  } catch (e) {
    showError(e, 'hd-file-error');
  } finally {
    if (ev.submitter) ev.submitter.disabled = false;
  }
}

// ---------- boot ----------

$('hd-countries').append(...Object.entries(COUNTRIES).map(([iso, name]) => h('option', { value: iso }, name)));
// ?code=6109.10.00.12&origin=VN&value=12 (content pages link here) fill the form and run it, free.
function fromQuery() {
  const q = new URLSearchParams(window.location.search);
  const code = q.get('code');
  if (!code) return false;
  $('hd-code').value = code.slice(0, 20);
  $('hd-origin').value = (q.get('origin') ?? '').slice(0, 60);
  $('hd-value').value = (q.get('value') ?? '').slice(0, 20);
  if (q.get('qty')) $('hd-qty').value = q.get('qty').slice(0, 20);
  if (q.get('kg')) $('hd-kg').value = q.get('kg').slice(0, 20);
  if (q.get('fta') === '1') $('hd-fta').checked = true;
  return true;
}

$('hd-one').addEventListener('submit', onOne);
$('hd-file').addEventListener('submit', onFile);
const asked = fromQuery();

T.api(`/api/v1/tools/${SLUG}`).then((json) => {
  const ex = json.tool.examples[0];
  if (!asked) {
    const r = ex.input.rows[0];
    $('hd-code').value = r.code;
    $('hd-origin').value = r.origin;
    $('hd-value').value = String(r.value);
    render(ex.output, { label: 'Worked example', example: ex.title, note: 'Change the code, origin or value and press "Estimate the duty".' });
  }
}).catch(() => { if (!asked) $('hd-out').textContent = ''; });

if (asked && $('hd-origin').value && $('hd-value').value) $('hd-one').requestSubmit();
