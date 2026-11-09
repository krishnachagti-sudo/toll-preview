// The hours calculator page. core.js (the same file the server runs) works out the totals, the
// rounding check and the two quick conversions in the browser as you type, so they are free and
// never use a run. The timesheet PDF is the server's answer to the same input, through
// Endwise.run, and is the paid output.
import { calculate, between, convert, parseClock, addDays, dayDate, longDate, HoursError, WEEKDAYS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'hours-calculator';
const $ = (id) => document.getElementById(id);

let tool = null;
let signedIn = false;
let last = null; // the last good { input, result }

// ---------- the day rows ----------

const daysCount = () => Number($('hc-weeks').value) * 7;

function drawDays(values = {}) {
  const box = $('hc-days');
  const old = {};
  box.querySelectorAll('[data-i]').forEach((row) => { old[row.dataset.i] = { t: row.querySelector('.hc-t').value, b: row.querySelector('.hc-b').value }; });
  box.textContent = '';
  const start = $('hc-start').value || '2026-11-02';
  for (let i = 0; i < daysCount(); i++) {
    const date = addDays(start, i);
    const v = values[i] ?? old[i] ?? { t: '', b: '' };
    box.appendChild(h('div', { class: 'hc-day', 'data-i': String(i) }, [
      h('label', { class: 'hc-date', for: `hc-t${i}` }, dayDate(date)),
      h('input', { type: 'text', id: `hc-t${i}`, class: 'hc-t', value: v.t, placeholder: i % 7 < 5 ? '9 am - 5 pm' : 'off', autocomplete: 'off', 'aria-label': `In and out times, ${longDate(date)}` }),
      h('input', { type: 'text', id: `hc-b${i}`, class: 'hc-b', value: v.b, inputmode: 'numeric', placeholder: 'break', 'aria-label': `Unpaid break minutes, ${longDate(date)}` }),
      h('span', { class: 'hc-day-total', id: `hc-dt${i}` }),
    ]));
  }
}

// "8:45 am - 12 pm, 12:30 pm - 5:15 pm" -> [{ in, out }, ...]
function pairsOf(text) {
  const t = text.trim();
  if (!t || /^off$/i.test(t)) return [];
  return t.split(/[,;]+/).map((p) => p.trim()).filter(Boolean).map((p) => {
    const m = /^(.+?)\s*(?:-|–|—|\bto\b)\s*(.+)$/i.exec(p);
    if (!m) throw new HoursError(`"${p}" needs a start and an end, like 8:45 am - 5:15 pm.`);
    parseClock(m[1]);
    parseClock(m[2]);
    return { in: m[1].trim(), out: m[2].trim() };
  });
}

const num = (id) => {
  const v = $(id).value.trim();
  if (!v) return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n <= 0) throw new HoursError(`"${v}" is not a number of hours.`, id);
  return n;
};

// The engine input the form describes, or throws a HoursError naming the problem.
function readForm() {
  const start = $('hc-start').value || '2026-11-02';
  const days = [];
  for (let i = 0; i < daysCount(); i++) {
    const date = addDays(start, i);
    let punches;
    try { punches = pairsOf($(`hc-t${i}`).value); } catch (e) { throw new HoursError(`${dayDate(date)}: ${e.message}`); }
    const b = $(`hc-b${i}`).value.trim();
    if (b && !/^\d{1,3}$/.test(b)) throw new HoursError(`${dayDate(date)}: the break is whole minutes, such as 30.`);
    if (punches.length || (b && b !== '0')) days.push({ date, punches, ...(b && b !== '0' ? { breakMinutes: Number(b) } : {}) });
  }
  if (!days.length) throw new HoursError('Type the times of at least one day.');
  const input = {
    days,
    weekStart: $('hc-ws').value,
    periodStart: start,
    periodEnd: addDays(start, daysCount() - 1),
  };
  const wst = $('hc-wst').value.trim();
  if (wst && parseClock(wst) !== 0) input.weekStartTime = wst;
  const ot = $('hc-ot').value.trim();
  input.weeklyOvertimeAfter = ot ? num('hc-ot') : null;
  if (num('hc-dot') !== null) input.dailyOvertimeAfter = num('hc-dot');
  if (num('hc-ddt') !== null) input.dailyDoubleTimeAfter = num('hc-ddt');
  if ($('hc-rate').value.trim()) input.hourlyRate = $('hc-rate').value.trim().replace(/^\$/, '');
  if ($('hc-round').value) input.rounding = { increment: Number($('hc-round').value), mode: $('hc-rmode').value };
  if ($('hc-tz').value) input.timeZone = $('hc-tz').value;
  return input;
}
const engineInput = (i) => ({ ...i, weekStartDay: WEEKDAYS.map((x) => x.toLowerCase()).indexOf(i.weekStart) });

// ---------- the result ----------

function put(el, ...nodes) {
  el.textContent = '';
  for (const n of nodes.flat()) if (n) el.append(n);
}
const fact = (k, v) => h('div', {}, [h('dt', {}, k), h('dd', {}, v)]);
const table = (cols, rows) => h('div', { class: 'table-scroll' }, h('table', { class: 'rules hc-table' }, [
  h('thead', {}, h('tr', {}, cols.map((c, i) => h('th', { scope: 'col', class: i ? 'num' : null }, c)))),
  h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, i) => (i ? h('td', { class: 'num' }, c) : h('th', { scope: 'row' }, c)))))),
]));

function render(r, { example = false } = {}) {
  const t = r.totals;
  const daily = r.rules.dailyOvertimeAfterHours !== null;
  put($('hc-out'),
    example ? h('p', { class: 'hc-label' }, 'Worked example') : null,
    h('p', { class: 'hc-answer' }, [t.worked.hhmm, h('small', {}, `${t.worked.decimal} hours`)]),
    h('p', { class: 'hc-sub' }, r.answer),
    h('dl', { class: 'hc-facts' }, [
      fact('Regular', t.regular.decimal),
      fact('Overtime', t.overtime.decimal),
      t.doubleTime.minutes ? fact('Double time', t.doubleTime.decimal) : null,
      fact('Unpaid breaks', t.unpaidBreaks.hhmm),
      r.pay ? fact('Gross pay', r.pay.gross) : null,
    ]),
    h('p', { class: 'hc-heading' }, 'By workweek'),
    table(['Workweek from', 'Hours', 'Regular', 'Overtime', ...(t.doubleTime.minutes ? ['Double'] : [])], r.weeks.map((w) => [
      `${w.starts.replace(/, \d{4} at/, ' at')}${w.partial ? ' (runs past this period)' : ''}`,
      `${w.worked.hhmm} (${w.worked.decimal})`, w.regular.decimal,
      ((w.weeklyOvertime.minutes + w.dailyOvertime.minutes) / 60).toFixed(2),
      ...(t.doubleTime.minutes ? [w.doubleTime.decimal] : []),
    ])),
    h('p', { class: 'hc-heading' }, 'By day'),
    table(['Day', 'In and out', 'Break', 'Hours', 'Decimal', ...(daily ? ['Daily OT'] : [])], r.days.map((d) => [
      dayDate(d.date), d.pairs.map((p) => `${p.in} - ${p.out}`).join(', ') || 'off', d.unpaidBreakMinutes ? `${d.unpaidBreakMinutes} min` : '', d.worked.hhmm, d.worked.decimal,
      ...(daily ? [d.dailyOvertime.minutes ? d.dailyOvertime.decimal : ''] : []),
    ])),
    r.rounding ? roundingBlock(r.rounding) : null,
    r.flags.length ? [h('p', { class: 'hc-heading' }, `Checks (${r.flags.length})`), h('ul', { class: 'hc-flags' }, r.flags.map((f) => h('li', {}, f.message)))] : null,
  );
  // Each day's hours beside its row.
  for (let i = 0; i < daysCount(); i++) {
    const date = addDays($('hc-start').value || '2026-11-02', i);
    const d = r.days.find((x) => x.date === date);
    const el = $(`hc-dt${i}`);
    if (el) el.textContent = d && d.pairs.length ? d.worked.hhmm : '';
  }
}

function roundingBlock(x) {
  return [
    h('p', { class: 'hc-heading' }, 'Rounding check'),
    h('p', { class: 'hc-sub' }, `${x.answer}${x.payDifference ? ` At the rate entered that is ${x.payDifference} of gross pay.` : ''}`),
    h('details', { class: 'hc-why' }, [
      h('summary', {}, 'Every punch, as entered and rounded'),
      table(['Day', 'Punch', 'Entered', 'Rounded', 'For the worker'], x.punches.map((p) => [
        dayDate(p.date), p.kind, p.actual, p.rounded, p.effectMinutes ? `${p.effectMinutes > 0 ? '+' : '-'}${Math.abs(p.effectMinutes)} min` : '0',
      ])),
    ]),
    h('p', { class: 'hc-aside' }, '29 CFR 785.48(b) accepts rounding only if it does not, over a period of time, fail to pay for all the time actually worked. This check shows the numbers; it does not decide whether a practice is lawful.'),
  ];
}

function recompute() {
  $('hc-days-err').textContent = '';
  try {
    const input = readForm();
    const result = calculate(engineInput(input));
    last = { input, result };
    render(result);
    if (buy) buy.refresh();
  } catch (e) {
    if (!(e instanceof HoursError)) throw e;
    last = null;
    $('hc-days-err').textContent = e.message;
    if (buy) buy.refresh();
  }
}

// ---------- the timesheet PDF ----------

function download(name, body) {
  return h('a', { href: URL.createObjectURL(body), download: name }, name);
}
function base64Blob(b64, type) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return new Blob([out], { type });
}
function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'Free: a corrected timesheet for the same person and period.';
  return '';
}
function errorInto(box, e) {
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

function sheetInput() {
  if (!last) return null;
  const employee = $('hc-employee').value.trim();
  if (!employee) return null;
  const extra = {};
  if ($('hc-employer').value.trim()) extra.employer = $('hc-employer').value.trim();
  if ($('hc-approver').value.trim()) extra.approver = $('hc-approver').value.trim();
  return { op: 'timesheet', employee, ...extra, ...last.input };
}

let buy = null;
function buyBox(el) {
  const price = h('p', { class: 'hc-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Download the timesheet PDF');
  const got = h('p', { class: 'hc-got', role: 'status' });
  const err = h('p', { class: 'form-error', role: 'alert' });
  const words = () => {
    const text = tool?.pricing?.actions.find((a) => a.name === 'timesheet')?.text;
    return text ? T.money(text) : '';
  };
  button.addEventListener('click', async () => {
    err.textContent = '';
    const input = sheetInput();
    if (!input) { err.textContent = last ? 'Name the employee first.' : 'Fix the times above first.'; return; }
    button.disabled = true;
    try {
      const json = await T.run(SLUG, input);
      const pdf = json.result.pdf;
      got.textContent = '';
      got.append('Your timesheet: ', download(pdf.filename, base64Blob(pdf.base64, 'application/pdf')), ' and ', download(pdf.filename.replace(/\.pdf$/, '.csv'), new Blob([json.result.csv], { type: 'text/csv' })), `. ${costNote(json)}`);
    } catch (e) {
      errorInto(err, e);
    } finally {
      button.disabled = false;
    }
  });
  put(el, price, button, got, err);
  let timer = null;
  return {
    refresh() {
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const input = sheetInput();
        if (!signedIn) { price.textContent = `${words()}. Sign in to download.`; return; }
        if (!input) { price.textContent = words(); return; }
        try {
          const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
          price.textContent = q.amount ? `This timesheet costs ${q.display} from your balance (${words()}).` : `This timesheet is free for you now (${words()}).`;
        } catch {
          price.textContent = words();
        }
      }, 300);
    },
  };
}

function sampleLink() {
  const ex = tool?.examples.find((x) => x.input.op === 'timesheet');
  const box = $('hc-sample-link');
  if (!ex?.output.pdf || !box) return;
  box.textContent = '';
  box.append(download(ex.output.pdf.filename, base64Blob(ex.output.pdf.base64, 'application/pdf')), ' (PDF).');
}

// ---------- quick conversions ----------

function miniBetween() {
  const out = $('hc-between-out');
  const b = $('hc-brk').value.trim();
  try {
    if (b && !/^\d{1,3}$/.test(b)) throw new HoursError('The break is whole minutes, such as 30.');
    out.textContent = between({ start: $('hc-from').value, end: $('hc-to').value, breakMinutes: b ? Number(b) : 0 }).answer;
  } catch (e) {
    if (!(e instanceof HoursError)) throw e;
    out.textContent = e.message;
  }
}
function miniConvert() {
  const out = $('hc-convert-out');
  try {
    const dec = $('hc-dec').value.trim();
    if (dec) { out.textContent = convert({ decimalHours: dec }).answer; return; }
    const hh = $('hc-h').value.trim() || '0';
    const mm = $('hc-m').value.trim() || '0';
    if (!/^\d{1,5}$/.test(hh) || !/^\d{1,2}$/.test(mm)) throw new HoursError('Hours and minutes are whole numbers.');
    out.textContent = convert({ hours: Number(hh), minutes: Number(mm) }).answer;
  } catch (e) {
    if (!(e instanceof HoursError)) throw e;
    out.textContent = e.message;
  }
}

// ---------- the address ----------

// ?start=2026-11-02&weeks=2&d0=8:45 am - 5:15 pm&b0=30&ws=monday&ot=40&dot=8&ddt=12&rate=18&round=15&rmode=nearest&tz=America/Chicago
// and for the quick conversions ?from=10 pm&to=6:30 am&brk=30, ?h=7&m=53 or ?dec=7.88.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const set = (id, key, ok = () => true) => { const v = q.get(key); if (v !== null && v.length <= 80 && ok(v)) $(id).value = v; };
  set('hc-start', 'start', (v) => /^\d{4}-\d{2}-\d{2}$/.test(v));
  set('hc-weeks', 'weeks', (v) => v === '1' || v === '2');
  set('hc-ws', 'ws', (v) => WEEKDAYS.map((x) => x.toLowerCase()).includes(v));
  set('hc-wst', 'wst');
  set('hc-ot', 'ot');
  set('hc-dot', 'dot');
  set('hc-ddt', 'ddt');
  set('hc-rate', 'rate');
  set('hc-round', 'round', (v) => ['5', '6', '15'].includes(v));
  set('hc-rmode', 'rmode', (v) => ['nearest', 'in-up-out-down'].includes(v));
  set('hc-tz', 'tz', (v) => [...$('hc-tz').options].some((o) => o.value === v));
  set('hc-from', 'from');
  set('hc-to', 'to');
  set('hc-brk', 'brk');
  set('hc-h', 'h');
  set('hc-m', 'm');
  set('hc-dec', 'dec');
  const values = {};
  for (let i = 0; i < 14; i++) if (q.has(`d${i}`) || q.has(`b${i}`)) values[i] = { t: (q.get(`d${i}`) ?? '').slice(0, 120), b: (q.get(`b${i}`) ?? '').slice(0, 3) };
  if (['ot', 'dot', 'ddt', 'rate', 'round', 'tz', 'ws'].some((k) => q.has(k))) $('hc-options').open = true;
  return { days: Object.keys(values).length ? values : null };
}

// ---------- start ----------

const soon = (fn, ms = 200) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('hc-code'), SLUG);
  const linked = fromQuery();
  // The worked example at rest: the tool's first example week, unless the address says otherwise.
  const EXAMPLE = {
    0: { t: '8:45 am - 5:15 pm', b: '30' }, 1: { t: '9:00 am - 6:00 pm', b: '30' }, 2: { t: '8:30 am - 12:00 pm, 12:30 pm - 5:00 pm', b: '' },
    3: { t: '9:00 am - 7:30 pm', b: '30' }, 4: { t: '8:45 am - 4:45 pm', b: '30' }, 5: { t: '9:00 am - 1:00 pm', b: '' },
  };
  if (!linked.days && !$('hc-rate').value && !new URLSearchParams(location.search).has('rate')) $('hc-rate').value = '18.50';
  drawDays(linked.days ?? EXAMPLE);
  recompute();
  if (!linked.days) {
    const label = h('p', { class: 't-ex' }, [h('span', { class: 'ex-tag' }, 'Example'), h('span', {}, 'Worked example: a week with lunches, a split shift and a Saturday morning, at $18.50 an hour')]);
    $('hc-out').prepend(label);
  }
  miniBetween();
  miniConvert();

  const form = $('hc-form');
  // The button counts again and, on a phone, brings the totals into view under the form.
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    recompute();
    if (matchMedia('(max-width: 959px)').matches) $('hc-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  form.addEventListener('input', soon(recompute));
  form.addEventListener('change', recompute);
  $('hc-start').addEventListener('change', () => { drawDays(); recompute(); });
  $('hc-weeks').addEventListener('change', () => { drawDays(); recompute(); });
  $('hc-between').addEventListener('input', soon(miniBetween));
  $('hc-convert').addEventListener('input', soon(miniConvert));
  for (const id of ['hc-employee', 'hc-employer', 'hc-approver']) $(id).addEventListener('input', () => buy && buy.refresh());

  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    tool = null;
  }
  sampleLink();
  buy = buyBox($('hc-buy'));
  try { signedIn = !!(await T.me()); } catch { signedIn = false; }
  buy.refresh();
}

start();
