// The payment schedule page. core.js (the same file the server runs) works the schedule out in the
// browser as you type, so the schedule is free and never uses a run. The invoice pack comes from the
// server through Endwise.run, which charges a signed-in account.
import * as businessDays from '../../business-days/files/core.js';
import {
  schedule, sentence, ScheduleError, STATE_RULES, STATE_CODES, PRESETS, PRESET_IDS, CURRENCIES, CURRENCY_CODES,
  shortDate, NOT_COVERED_NOTE, READ_ON,
} from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'payment-schedule';
const $ = (id) => document.getElementById(id);
const cal = { holidays: (region, year) => businessDays.holidays(region, year) };

// ---------- the form ----------

function fillSelects() {
  for (const code of CURRENCY_CODES) $('ps-currency').appendChild(h('option', { value: code }, `${code} (${CURRENCIES[code].symbol})`));
  for (const id of PRESET_IDS) $('ps-split').appendChild(h('option', { value: id, ...(id === '50-25-25' ? { selected: '' } : {}) }, PRESETS[id].label));
  $('ps-split').appendChild(h('option', { value: 'custom' }, 'Your own stages'));
}
function fillRules() {
  const rows = $('ps-rule-rows');
  for (const code of STATE_CODES) {
    const r = STATE_RULES[code];
    rows.appendChild(h('tr', {}, [
      h('th', { scope: 'row' }, r.name),
      h('td', {}, [h('p', {}, `${r.applies}: ${r.capText}.`), h('p', { class: 'small muted' }, `"${r.quote}"`)]),
      h('td', {}, h('a', { href: r.href, rel: 'noopener' }, `${r.cite} (read ${shortDate(READ_ON)})`)),
    ]));
  }
}

function stageRow(s = {}) {
  const row = h('div', { class: 'ps-row' }, [
    h('input', { type: 'text', class: 'ps-r-name', 'aria-label': 'Stage name', value: s.name ?? '', maxlength: '120' }),
    h('input', { type: 'text', class: 'ps-r-share', 'aria-label': 'Share: a percentage or an amount', value: s.share ?? '', placeholder: 'balance', inputmode: 'decimal', maxlength: '20' }),
    h('input', { type: 'date', class: 'ps-r-date', 'aria-label': 'Invoice date', value: s.date ?? '' }),
    h('button', { type: 'button', class: 'btn btn-small btn-quiet ps-r-del', 'aria-label': 'Remove this stage' }, 'Remove'),
  ]);
  row.querySelector('.ps-r-del').addEventListener('click', () => { row.remove(); update(); });
  $('ps-rows').appendChild(row);
}
const DEFAULT_ROWS = [
  { name: 'Deposit', share: '40%', date: '2027-01-04' },
  { name: 'Design approved', share: '30%', date: '2027-02-01' },
  { name: 'Launch', share: '', date: '2027-03-01' },
];

// A share box: "25%" or "25" with % is a percentage; a plain number with no % is a percentage too
// when every share is 100 or less and they add up to 100; otherwise it is an amount.
function customStages() {
  const rows = [...document.querySelectorAll('.ps-row')];
  const raw = rows.map((r) => ({ name: r.querySelector('.ps-r-name').value.trim(), share: r.querySelector('.ps-r-share').value.trim(), date: r.querySelector('.ps-r-date').value }));
  const nums = raw.map((x) => x.share.replace(/[%,\s]/g, '')).filter(Boolean).map(Number);
  const asPercent = raw.every((x) => !x.share || /%$/.test(x.share) || Number(x.share.replace(/,/g, '')) <= 100) && nums.reduce((a, b) => a + b, 0) <= 100.0001;
  return raw.map((x, i) => {
    const out = { name: x.name || undefined, due: x.date ? { date: x.date } : (i === 0 ? undefined : { after: 0 }) };
    if (!x.share) out.balance = true;
    else if (/%$/.test(x.share) || asPercent) out.percent = x.share.replace(/[%\s]/g, '');
    else out.amount = x.share;
    return out;
  });
}

function prefixParts(text) {
  const m = /^(.*?)(\d{1,8})$/.exec(text.trim());
  return m ? { invoicePrefix: m[1], firstNumber: Number(m[2]) } : { invoicePrefix: text.trim() || 'INV-', firstNumber: 1001 };
}

function readInput() {
  const split = $('ps-split').value;
  const input = {
    total: $('ps-total').value.trim(),
    currency: $('ps-currency').value,
    start: $('ps-start').value,
    net: Number($('ps-net').value),
    region: $('ps-region').value,
    roll: $('ps-roll').value,
  };
  if (split === 'custom') input.stages = customStages();
  else { input.split = split; input.weeks = Number($('ps-weeks').value || 0); }
  const tax = $('ps-tax').value.trim().replace(/%$/, '');
  if (tax) input.tax = { rate: tax };
  if ($('ps-state').value) { input.state = $('ps-state').value; if ($('ps-cap').checked) input.capDeposit = true; }
  if ($('ps-project').value.trim()) input.project = $('ps-project').value.trim();
  if ($('ps-client').value.trim()) input.client = $('ps-client').value.trim();
  return input;
}

// ---------- drawing ----------

function draw(r) {
  const out = $('ps-out');
  out.textContent = '';
  const example = DEFAULTS !== null && JSON.stringify(current) === DEFAULTS;
  const split = r.split === 'custom' ? `${r.stages.length} stages of your own` : `split ${PRESETS[r.split]?.label ?? r.split}`;
  const inputs = `a ${r.total} project ${split}${r.split === 'custom' ? '' : ` over ${$('ps-weeks').value} weeks`} from ${shortDate(r.start)}, ${r.stages[0]?.terms ?? ''}`;
  const last = r.stages.at(-1);
  out.append(
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your schedule'),
      h('span', { class: 'tf-src' }, r.regionName ?? ''),
    ]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${inputs}` : inputs),
    h('p', { class: 'tf-big' }, [h('b', {}, r.stages[0]?.totalDue ?? r.total), h('span', {}, `${r.stages[0]?.name.toLowerCase() ?? 'first payment'}, due ${shortDate(r.stages[0]?.dueDate)}`)]),
    h('p', { class: 'tf-sub' }, sentence(r)),
    h('ol', { class: 'tf-items ps-items' }, [
      ...r.stages.map((x, i) => h('li', { class: i === 0 ? 'hi' : null }, [
        h('span', { class: 'k', 'aria-hidden': 'true' }, String(x.n)),
        h('span', {}, `${x.name}, ${x.share}: invoice ${shortDate(x.invoiceDate)}, due ${shortDate(x.dueDate)}`),
        h('b', {}, x.totalDue ?? x.amount),
        h('em', {}, [`${x.terms}; balance after ${x.balanceAfter}`, x.rolled ? `; moved from ${shortDate(x.rolled.from)} (${x.rolled.reason})` : '', x.invoiceDateNote ? `; ${x.invoiceDateNote}` : ''].join('')),
      ])),
      h('li', { class: 'tot' }, [h('span', { class: 'k', 'aria-hidden': 'true' }, '='), h('span', {}, 'The stages add up to'), h('b', {}, r.grandTotal ?? r.check.stagesAddUpTo), h('em', {}, `${r.check.equalsTotal ? 'Equal to the fee, to the cent' : 'Check the shares'}; last due ${shortDate(last?.dueDate)}`)]),
    ]),
  );
  const tax = Boolean(r.tax);
  const head = ['Stage', 'Share', 'Amount', ...(tax ? [r.tax.label] : []), 'Invoice date', 'Terms', 'Due date', 'Balance after'];
  const table = (h('div', { class: 'ps-table-wrap' }, h('table', { class: 'ps-table ps-sched' }, [
    h('thead', {}, h('tr', {}, head.map((x) => h('th', { scope: 'col' }, x)))),
    h('tbody', {}, r.stages.map((s) => h('tr', {}, [
      h('th', { scope: 'row' }, `${s.n}. ${s.name}`),
      h('td', {}, s.share),
      h('td', { class: 'num' }, s.amount),
      ...(tax ? [h('td', { class: 'num' }, s.tax)] : []),
      h('td', {}, [shortDate(s.invoiceDate), ...(s.invoiceDateNote ? [h('span', { class: 'ps-flag' }, ` ${s.invoiceDateNote}`)] : [])]),
      h('td', {}, s.terms),
      h('td', {}, [shortDate(s.dueDate), ...(s.rolled ? [h('span', { class: 'ps-flag' }, ` moved from ${shortDate(s.rolled.from)} (${s.rolled.reason})`)] : [])]),
      h('td', { class: 'num' }, s.balanceAfter),
    ]))),
    h('tfoot', {}, h('tr', {}, [h('th', { scope: 'row' }, 'Total'), h('td', {}, '100%'), h('td', { class: 'num' }, r.check.stagesAddUpTo), ...(tax ? [h('td', { class: 'num' }, r.tax.total)] : []), h('td', { colspan: '4' }, r.grandTotal ? `${r.grandTotal} with ${r.tax.label.toLowerCase()}` : '')])),
  ])));
  out.append(h('details', { class: 'xpand ps-fold' }, [h('summary', {}, 'As a table'), h('div', { class: 'xp-in' }, table)]));
  const notes = [];
  if (r.rounding) notes.push(r.rounding.note);
  if (r.tax?.adjustedOnLast) notes.push(`${r.tax.label} is rounded on each invoice; ${r.tax.adjustedOnLast} is added on the last so the stages' ${r.tax.label.toLowerCase()} adds up to ${r.tax.total}.`);
  if (notes.length) out.append(h('p', { class: 'tf-note' }, notes.join(' ')));
  if (r.warnings.length) out.append(h('ul', { class: 'ps-warn' }, r.warnings.map((w) => h('li', {}, w))));
  if (r.stateRule) {
    const s = r.stateRule;
    out.append(h('div', { class: 'ps-state' }, s.covered
      ? [h('p', {}, [h('strong', {}, `${s.name}: `), s.message]), h('p', { class: 'small muted' }, [`"${s.quote}" `, h('a', { href: s.href, rel: 'noopener' }, `${s.cite}, read ${shortDate(s.readOn)}`)])]
      : [h('p', {}, NOT_COVERED_NOTE)]));
  }
  const words = h('p', { class: 'ps-wording' }, r.wording);
  const status = h('span', { class: 'small muted', role: 'status' });
  const copy = h('button', { type: 'button', class: 'btn btn-small btn-quiet' }, 'Copy the wording');
  copy.addEventListener('click', () => T.copy(r.wording, copy, status));
  out.append(h('details', { class: 'xpand ps-fold' }, [h('summary', {}, 'Payment terms wording for the contract'), h('div', { class: 'xp-in' }, [words, h('p', {}, [copy, ' ', status])])]));
}

function showError(e) {
  $('ps-err').textContent = e.message;
  $('ps-out').textContent = '';
  $('ps-out').append(h('p', { class: 'muted' }, 'Fix the field above to see the schedule.'));
}

let current = null;
// The form as first served (the worked example), so its schedule says "Example".
let DEFAULTS = null;
function update() {
  $('ps-custom').hidden = $('ps-split').value !== 'custom';
  $('ps-weeks-field').hidden = $('ps-split').value === 'custom';
  $('ps-err').textContent = '';
  try {
    current = readInput();
    draw(schedule(current, cal));
  } catch (e) {
    if (e instanceof ScheduleError) showError(e);
    else throw e;
  }
}

// ---------- the paid pack ----------

function download(text, name, type) {
  const href = URL.createObjectURL(new Blob([text], { type }));
  return h('a', { href, download: name, class: 'btn btn-small btn-quiet' }, `Download ${name}`);
}
function drawPack(r) {
  const box = $('ps-invoices');
  box.textContent = '';
  const slug = (r.project || 'project').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'project';
  box.append(h('p', {}, [download(r.ics, `${slug}-payments.ics`, 'text/calendar'), ' ', download(r.csv, `${slug}-payments.csv`, 'text/csv')]));
  for (const inv of r.invoices) {
    const text = [
      `Invoice ${inv.number}${inv.billTo ? ` to ${inv.billTo}` : ''}`,
      `Issued ${shortDate(inv.issueDate)}. ${inv.terms}: due ${shortDate(inv.dueDate)}.`,
      ...inv.lines.map((l) => `${l.description}\t${l.amount}`),
      `Total due\t${inv.total}`,
      inv.note,
    ].join('\n');
    const status = h('span', { class: 'small muted', role: 'status' });
    const copy = h('button', { type: 'button', class: 'btn btn-small btn-quiet' }, 'Copy');
    copy.addEventListener('click', () => T.copy(text, copy, status));
    box.append(h('article', { class: 'ps-inv' }, [
      h('h3', {}, `${inv.number}: ${inv.name}${inv.final ? ' (final)' : ''}`),
      h('p', { class: 'small muted' }, `Issued ${shortDate(inv.issueDate)}. ${inv.terms}: due ${shortDate(inv.dueDate)}.${inv.billTo ? ` Bill to ${inv.billTo}.` : ''}`),
      h('table', { class: 'ps-table' }, [
        h('tbody', {}, inv.lines.map((l) => h('tr', { class: l.deduction ? 'ps-less' : '' }, [h('td', {}, l.description), h('td', { class: 'num' }, l.amount)]))),
        h('tfoot', {}, h('tr', {}, [h('th', { scope: 'row' }, 'Total due'), h('td', { class: 'num' }, inv.total)])),
      ]),
      h('p', { class: 'small' }, inv.note),
      h('p', {}, [copy, ' ', status]),
    ]));
  }
}

async function buy() {
  const note = $('ps-buy-note');
  try {
    const input = { op: 'pack', ...readInput(), ...prefixParts($('ps-prefix').value) };
    if (!input.project) {
      $('ps-more').open = true;
      $('ps-project').focus();
      note.textContent = 'Name the project first: the pack is bought once per project, and edits to it are free for 90 days.';
      return;
    }
    schedule(input, cal);
    note.textContent = 'Working.';
    const res = await T.run(SLUG, input);
    drawPack(res.result ?? res);
    note.textContent = res.charged ? `Charged ${res.charged.display ?? ''}.` : '';
  } catch (e) {
    note.textContent = e.message;
  }
}

// ---------- start ----------

function prefill() {
  const q = new URLSearchParams(location.search);
  const set = (id, v) => { if (v !== null && v !== '') $(id).value = v; };
  set('ps-total', q.get('total'));
  if (CURRENCY_CODES.includes(q.get('currency'))) set('ps-currency', q.get('currency'));
  set('ps-start', q.get('start'));
  if (PRESET_IDS.includes(q.get('split')) || q.get('split') === 'custom') set('ps-split', q.get('split'));
  set('ps-weeks', q.get('weeks'));
  if ([...$('ps-net').options].some((o) => o.value === q.get('net'))) set('ps-net', q.get('net'));
  if (['US', 'GB-ENG', 'none'].includes(q.get('region'))) set('ps-region', q.get('region'));
  if (['next', 'previous', 'none'].includes(q.get('roll'))) set('ps-roll', q.get('roll'));
  if (q.get('tax')) { set('ps-tax', q.get('tax')); $('ps-more').open = true; }
  if (q.get('state')) { set('ps-state', STATE_CODES.includes(q.get('state')) ? q.get('state') : 'XX'); $('ps-more').open = true; }
  if (q.get('cap') === '1') $('ps-cap').checked = true;
  set('ps-project', q.get('project'));
  set('ps-client', q.get('client'));
}

fillSelects();
fillRules();
for (const s of DEFAULT_ROWS) stageRow(s);
DEFAULTS = JSON.stringify(readInput());
prefill();
$('ps-add').addEventListener('click', () => { stageRow({}); update(); });
$('ps-form').addEventListener('input', update);
$('ps-form').addEventListener('change', update);
$('ps-buy').addEventListener('click', buy);
$('ps-form').addEventListener('submit', (e) => { e.preventDefault(); update(); $('ps-out').scrollIntoView({ block: 'nearest' }); });
update();
