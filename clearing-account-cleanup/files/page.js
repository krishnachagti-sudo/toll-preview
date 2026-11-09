// The clearing-account cleanup page. The preview runs here, in the browser, with core.js (the file
// the server runs): the export is read and aged without uploading anything. "Get the full report"
// sends the files to the server (Endwise.run, paid), which runs the same engine and returns every
// item, every match set and the two CSV working papers. The quick match box sends a list of amounts.
import { preview, money, longDate, SAMPLE_LEDGER, SAMPLE_BANK, LIMITS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'clearing-account-cleanup';
const $ = (id) => document.getElementById(id);

const state = { ledger: null, ledgerName: null, bank: null, bankName: null, sample: true, from: null };

function settings() {
  const num = (id, lo, hi) => { const n = Number($(id).value); return $(id).value !== '' && Number.isFinite(n) && n >= lo && n <= hi ? n : undefined; };
  const o = {
    asOf: $('ca-asof').value || undefined,
    account: $('ca-account').value.trim() || undefined,
    windowBefore: num('ca-before', 0, 366),
    windowAfter: num('ca-after', 0, 31),
    feePercent: num('ca-fee', 0, 10),
    maxSetSize: num('ca-size', 1, 25),
    dateOrder: $('ca-order').value,
  };
  if (o.windowBefore !== undefined) o.windowBefore = Math.round(o.windowBefore);
  if (o.windowAfter !== undefined) o.windowAfter = Math.round(o.windowAfter);
  if (o.maxSetSize !== undefined) o.maxSetSize = Math.round(o.maxSetSize);
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined));
}

const table = (head, rows, cls = 'ca-table') => h('table', { class: cls }, [
  h('thead', {}, h('tr', {}, head.map((c) => h('th', { scope: 'col' }, c)))),
  h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c) => h('td', {}, c))))),
]);

// ---------- the free preview ----------

const plural = (n, one, many) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;
const AGE_K = { '0-30': '30', '31-60': '60', '61-90': '90', '90+': '90+' };

// The inputs in one line: what was read, for the Example tag.
function inputsLine(r) {
  const file = state.sample ? 'a made-up Undeposited Funds export' : state.from === 'link' ? 'the worked example from the page you came from' : state.ledgerName;
  const bank = state.bank ? `, ${plural(r.deposits?.given ?? 0, 'bank deposit', 'bank deposits')}` : ', no bank file';
  return `${file} (${plural(r.lines, 'line', 'lines')})${bank}, aged as of ${longDate(r.asOf)}`;
}

// The preview like the other tool pages: a header row, the inputs, what is still open as the big
// figure, then one line per figure (each age bucket, what nets off, the deposits, the tie-out).
function showPreview() {
  $('ca-error').textContent = '';
  $('ca-report').replaceChildren();
  if (!state.ledger) return;
  let r;
  try {
    r = preview({ ledger: state.ledger, bank: state.bank }, settings());
  } catch (err) {
    $('ca-preview').replaceChildren();
    $('ca-big').replaceChildren();
    $('ca-answer').textContent = '';
    $('ca-error').textContent = err.message;
    return;
  }
  const example = state.sample || state.from === 'link';
  $('ca-tag').textContent = example ? 'Example' : 'Your result';
  $('ca-tag').className = example ? 'tf-tag' : 'tf-tag run';
  $('ca-src').textContent = `${r.account} · preview, free`;
  $('ca-label').textContent = example ? `Example: ${inputsLine(r)}` : inputsLine(r);
  $('ca-big').replaceChildren(h('p', { class: 'tf-big' }, [h('b', {}, money(r.openTotal)), h('span', {}, `still open in ${plural(r.openCount, 'item', 'items')}`)]));
  $('ca-answer').textContent = r.answer;
  const tie = r.balance;
  const d = r.deposits;
  const item = (k, label, amount, why, cls = null) => h('li', { class: cls }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, label), amount ? h('b', {}, amount) : null, h('em', {}, why)]);
  $('ca-preview').replaceChildren(
    h('p', { class: 'ca-h' }, `Aging as of ${longDate(r.asOf)}`),
    h('ul', { class: 'tf-items' }, [
      ...r.aging.map((b) => item(AGE_K[b.id] ?? b.id, b.label, money(b.total), plural(b.count, 'open item', 'open items'), b.id === '90+' && b.count ? 'sk' : null)),
      r.overYear?.count ? item('1y', 'Over a year old', money(r.overYear.total), `${plural(r.overYear.count, 'item', 'items')}, inside the over 90 days line`, 'sk') : null,
      r.netted?.lines ? item('=', 'Already netted inside the account', null, `${plural(r.netted.lines, 'line', 'lines')}: ${plural(r.netted.pairs, 'one-for-one pair', 'one-for-one pairs')} and ${plural(r.netted.sets, 'clearing line', 'clearing lines')} made of several items`, 'dim') : null,
      d?.given ? item('$', 'Bank deposits matched exactly', `${d.exact} of ${d.given}`, [d.several ? `${d.several} with more than one possible set` : '', d.fee ? `${d.fee} only after a fee` : '', d.conflict ? `${d.conflict} sharing items with another deposit` : '', d.none ? `${d.none} with no set` : ''].filter(Boolean).join('; ') || 'one set of open items each', 'hi') : null,
      item('Σ', 'Tie-out', money(tie.computed), tie.reported === null ? 'the lines add up to this; the file has no total row or running balance to check it against'
        : tie.difference ? `the report shows ${money(tie.reported)}: a difference of ${money(tie.difference)}` : `the lines add up to the report's own total${tie.opening ? `, including an opening balance of ${money(tie.opening)}` : ''}`, 'tot'),
    ]),
    h('details', { class: 'xpand' }, [h('summary', {}, 'How the file was read'), h('div', { class: 'xp-in' }, h('ul', { class: 'ca-list' }, [
      h('li', {}, `${r.account}: ${r.lines.toLocaleString('en-US')} lines read from a ${r.layout.name}${r.dateOrder.proof ? ` (dates read ${r.dateOrder.order === 'dmy' ? 'DD/MM' : 'MM/DD'}; ${r.dateOrder.proof} proves it)` : ''}.`),
      h('li', {}, `The lines add up to ${money(tie.computed)}${tie.opening ? `, including an opening balance of ${money(tie.opening)}` : ''}. ${tie.reported === null ? 'The file has no total row or running balance to check it against.' : tie.difference ? `The report shows ${money(tie.reported)}: a difference of ${money(tie.difference)}.` : `The report's own total is the same: ${money(tie.reported)}.`}`),
      r.duplicates ? h('li', {}, `${r.duplicates} open items look like duplicates (same date, amount, name and number).`) : null,
    ]))]),
    r.warnings.length ? h('ul', { class: 'ca-list' }, r.warnings.map((w) => h('li', { class: 'ca-warn' }, w))) : null,
    h('p', { class: 'tf-cost' }, 'Worked out in your browser, free. The full report lists every item and every match set.'),
  );
}

// ---------- the paid report ----------

const itemsText = (items) => items.map((it) => `line ${it.line}${it.date ? ` (${it.date}` : ' ('}${it.name ? `, ${it.name}` : ''}${it.num ? ` #${it.num}` : ''}) ${money(Math.abs(it.amount))}`).join('; ');
const STATUS = { exact: 'One set fits', several: 'Several sets fit', conflict: 'Shares items with another deposit', fee: 'Fits only after a fee', none: 'No set fits', incomplete: 'Search stopped early', 'not-searched': 'Not searched (limit reached)' };
const link = (name, text, body) => h('a', { href: URL.createObjectURL(new Blob([body], { type: 'text/csv' })), download: name, class: 'btn btn-small' }, text);

function showReport(r, charged) {
  const out = [
    h('p', { class: 'ca-label' }, 'Full report'),
    h('p', { class: 'ca-downloads' }, [
      link('open-items.csv', `Open items CSV (${r.openCount})`, r.csv.open),
      link('deposit-matches.csv', 'Deposit matches CSV', r.csv.matches),
    ]),
    h('p', { class: 'muted' }, charged > 0 ? `Charged $${(charged / 1e6).toFixed(2)}.` : 'No charge for this one.'),
  ];
  if (r.matches.length) {
    out.push(h('h3', { class: 'ca-h' }, 'Bank deposits'));
    out.push(table(['Deposit', 'Result', 'Sets'], r.matches.map((m) => [
      `${m.date ? longDate(m.date) : 'No date'}: ${money(m.amount)}${m.memo ? ` (${m.memo})` : ''}`,
      `${STATUS[m.status]}${m.count > 1 ? ` (${m.count}${m.complete ? '' : '+'})` : ''}${m.narrowed ? `; the ${LIMITS.candidates} nearest payments were searched` : ''}`,
      m.sets.length ? m.sets.map((s, k) => `Set ${k + 1}: ${itemsText(s.items)}`).join(' | ')
        : m.feeSets.length ? m.feeSets.map((s, k) => `Set ${k + 1}: ${itemsText(s.items)} = ${money(s.total)}, fee ${money(s.fee)} (${s.feePercent}%)`).join(' | ') : '',
    ])));
  }
  const n = r.netOff;
  if (n.pairs.length || n.sets.length || n.several.length) {
    out.push(h('h3', { class: 'ca-h' }, 'Already netted inside the account'));
    out.push(h('ul', { class: 'ca-list' }, [
      ...n.pairs.map((p) => h('li', {}, `Line ${p.offset.line} (${p.offset.date}, ${money(p.offset.amount)}) clears ${itemsText([p.item])}.`)),
      ...n.sets.map((s) => h('li', {}, `Line ${s.offset.line} (${s.offset.date}, ${money(s.offset.amount)}) clears ${itemsText(s.items)}.`)),
      ...n.several.map((s) => h('li', { class: 'ca-warn' }, `Line ${s.offset.line} (${s.offset.date}, ${money(s.offset.amount)}) fits ${s.count} sets; left open: ${s.sets.map((x) => itemsText(x)).join(' or ')}.`)),
    ]));
  }
  out.push(h('h3', { class: 'ca-h' }, `Open items, oldest first (${r.openCount})`));
  out.push(table(['Line', 'Date', 'Age', 'Name', 'Num', 'Amount', 'Notes'], r.open.map((l) => [String(l.line), l.date, `${l.age} days`, l.name || l.type, l.num, money(l.amount), l.flags.join('; ')])));
  if (r.payees.length > 1) {
    out.push(h('h3', { class: 'ca-h' }, 'Open totals by name'));
    out.push(table(['Name', 'Items', 'Total', 'Share', 'Running share'], r.payees.slice(0, 20).map((p) => [p.name, String(p.count), money(p.total), `${p.share}%`, `${p.cumulative}%`])));
  }
  $('ca-report').replaceChildren(...out);
}

async function runReport() {
  if (!state.ledger) return;
  $('ca-error').textContent = '';
  $('ca-status').textContent = 'Working out the report.';
  try {
    const res = await T.run(SLUG, { op: 'report', ledger: state.ledger, ...(state.bank ? { bank: state.bank } : {}), ...settings() });
    showReport(res.result, res.charged?.amount ?? 0);
    $('ca-status').textContent = 'The report is ready.';
  } catch (err) {
    $('ca-status').textContent = '';
    $('ca-error').textContent = err.status === 401 ? 'The full report needs an account, so it can be paid from your balance ($3.00). Sign in, then press the button again. The preview stays free.' : err.message;
  }
}

// ---------- the quick match ----------

function parsePayments(text) {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const parts = l.split(/\s*[,\t]\s*/);
    const dateAt = parts.findIndex((p) => /^\d{4}-\d{2}-\d{2}$/.test(p));
    const date = dateAt >= 0 ? parts.splice(dateAt, 1)[0] : undefined;
    const [amount, ref] = parts;
    return { amount, ...(date ? { date } : {}), ...(ref ? { ref } : {}) };
  });
}

async function runMatch() {
  $('ca-q-error').textContent = '';
  const payments = parsePayments($('ca-q-payments').value);
  const deposit = { amount: $('ca-q-deposit').value.trim(), ...($('ca-q-date').value ? { date: $('ca-q-date').value } : {}) };
  try {
    const res = await T.run(SLUG, { op: 'match', payments, deposits: [deposit], feePercent: 3 });
    const d = res.result.deposits[0];
    const list = d.sets.length ? d.sets : d.feeSets;
    $('ca-q-out').replaceChildren(
      h('p', { class: 'ca-answer' }, res.result.answer),
      list.length ? h('ol', { class: 'ca-list' }, list.map((s) => h('li', {}, `${s.items.map((it) => `#${it.line}${it.num ? ` (${it.num})` : ''} ${money(it.amount)}`).join(' + ')} = ${money(s.total)}${s.fee ? `, fee ${money(s.fee)}` : ''}`))) : null,
    );
  } catch (err) {
    $('ca-q-error').textContent = err.status === 401 ? 'Your free runs for today are used up. Sign in to run more ($0.10 per deposit).' : err.message;
  }
}

// ---------- files and start ----------

async function readText(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { return new TextDecoder('windows-1252').decode(bytes); }
}

function load(kind, text, name) {
  if (kind === 'ledger') { if (name !== 'example.csv') state.from = null; state.ledger = text; state.ledgerName = name; state.sample = name === 'sample'; $('ca-ledger-name').textContent = name === 'sample' ? 'The made-up sample export is loaded.' : `${name}: read in your browser, not uploaded.`; }
  else { state.bank = text; state.bankName = name; $('ca-bank-name').textContent = name === 'sample' ? 'The made-up sample bank file is loaded.' : `${name}: read in your browser.`; }
  showPreview();
}

// ?ledger=<CSV>&bank=<CSV> load a worked example (content pages link here with theirs); ?sample=1
// the sample; asOf, account, before, after, fee, size and order preset the settings; payments
// (one amount per line or separated by ;) and deposit preset the quick match.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const set = (id, v) => { if (v !== null && v !== '') $(id).value = v; };
  set('ca-asof', q.get('asOf')); set('ca-account', q.get('account')); set('ca-before', q.get('before'));
  set('ca-after', q.get('after')); set('ca-fee', q.get('fee')); set('ca-size', q.get('size'));
  if (['auto', 'mdy', 'dmy'].includes(q.get('order'))) $('ca-order').value = q.get('order');
  if (q.get('payments')) $('ca-q-payments').value = q.get('payments').split(';').map((s) => s.trim()).join('\n');
  set('ca-q-deposit', q.get('deposit')); set('ca-q-date', q.get('depositDate'));
  const ledger = q.get('ledger');
  if (ledger && ledger.length <= 8000) {
    state.bank = q.get('bank') && q.get('bank').length <= 4000 ? q.get('bank') : null;
    if (!state.bank) $('ca-bank-name').textContent = 'No bank file in this example.';
    state.from = 'link';
    load('ledger', ledger, 'example.csv');
    return true;
  }
  return false;
}

function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('ca-code'), SLUG);
  $('ca-ledger').addEventListener('change', async () => { const f = $('ca-ledger').files[0]; if (f) load('ledger', await readText(f), f.name); });
  $('ca-bank').addEventListener('change', async () => { const f = $('ca-bank').files[0]; if (f) load('bank', await readText(f), f.name); });
  $('ca-sample').addEventListener('click', () => { state.bank = SAMPLE_BANK; $('ca-bank-name').textContent = 'The made-up sample bank file is loaded.'; $('ca-fee').value = '3'; load('ledger', SAMPLE_LEDGER, 'sample'); });
  for (const id of ['ca-asof', 'ca-account', 'ca-before', 'ca-after', 'ca-fee', 'ca-size', 'ca-order']) $(id).addEventListener('change', showPreview);
  for (const [zone, input] of [['ca-drop', 'ledger'], ['ca-bank-drop', 'bank']]) {
    const el = $(zone);
    el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('over'); });
    el.addEventListener('dragleave', () => el.classList.remove('over'));
    el.addEventListener('drop', async (e) => { e.preventDefault(); el.classList.remove('over'); const f = e.dataTransfer.files[0]; if (f) load(input, await readText(f), f.name); });
  }
  $('ca-go').addEventListener('click', runReport);
  $('ca-q-go').addEventListener('click', runMatch);
  if (!fromQuery()) { state.bank = SAMPLE_BANK; state.bankName = 'sample'; load('ledger', SAMPLE_LEDGER, 'sample'); }
}

start();
