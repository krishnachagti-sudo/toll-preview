// The overtime auditor's page. Every answer is the server's (Endwise.run): one week and a file's
// totals are free on this page, the full audit is paid per employee-week. The worked example is in
// the HTML, so it shows without JavaScript; a prefilled link (?state=CA&rate=22&start=...&d0=10...)
// runs its own week on load.
import { STATE_NAMES, COVERED } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'overtime-auditor';
const SHOWN_WEEKS = 60;
const $ = (id) => document.getElementById(id);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const addDays = (iso, n) => new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) + n)).toISOString().slice(0, 10);
const dayLabel = (iso) => `${DAYS[new Date(`${iso}T12:00:00Z`).getUTCDay()]}, ${MONTHS[+iso.slice(5, 7) - 1]} ${+iso.slice(8, 10)}`;
let signedIn = false;
let tool = null;
// The week as first served (the worked example), so its answer says "Example".
let DEFAULTS = null;
const weekNow = () => JSON.stringify(weekInput());

function fillStates() {
  const opts = Object.entries(STATE_NAMES).sort((a, b) => a[1].localeCompare(b[1]));
  for (const id of ['oa-state', 'oa-default-state']) {
    const sel = $(id);
    if (id === 'oa-default-state') sel.append(h('option', { value: '' }, 'Use the file\'s state column'));
    for (const [code, name] of opts) sel.append(h('option', { value: code }, `${name}${COVERED.includes(code) ? '' : ' (federal rule only)'}`));
    sel.value = id === 'oa-state' ? 'CA' : '';
  }
}

function drawDays(values = []) {
  const start = $('oa-start').value || '2026-11-01';
  const box = $('oa-days');
  box.textContent = '';
  for (let i = 0; i < 7; i++) {
    const date = addDays(start, i);
    const id = `oa-d${i}`;
    box.append(h('div', { class: 'field oa-day' }, [
      h('label', { for: id }, dayLabel(date)),
      h('input', { type: 'text', id, value: values[i] ?? '', autocomplete: 'off' }),
    ]));
  }
}

// "10", "8.5", "8:30" -> hours; "7 am - 5:30 pm, 6 pm - 8 pm" -> punch pairs.
function dayOf(text, date) {
  const s = text.trim();
  if (!s) return null;
  if (/[-–]/.test(s) && /[a-z\d]\s*[-–]\s*[a-z\d]/i.test(s) && !/^\d+(\.\d+)?$/.test(s)) {
    const punches = s.split(',').map((p) => p.split(/\s*[-–]\s*/)).map(([a, b]) => ({ in: (a ?? '').trim(), out: (b ?? '').trim() }));
    return { date, punches };
  }
  return { date, hours: s };
}

function weekInput() {
  const start = $('oa-start').value;
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = dayOf($(`oa-d${i}`).value, addDays(start, i));
    if (d) days.push(d);
  }
  const weekday = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date(`${start}T12:00:00Z`).getUTCDay()];
  const input = { op: 'check', state: $('oa-state').value, days, workweekStart: weekday };
  if ($('oa-rate').value.trim()) input.rate = $('oa-rate').value.trim();
  if ($('oa-extra').value.trim()) input.extraPay = $('oa-extra').value.trim();
  if ($('oa-aws').value.trim()) {
    input.aws = { dayHours: Number($('oa-aws').value.trim()) };
    if ($('oa-awsdays').value.trim()) input.aws.days = Number($('oa-awsdays').value.trim());
  }
  return input;
}

const errorText = (e) => (e.fields ? Object.values(e.fields).join(' ') : e.message);

function dayTable(weeks, caption) {
  const rows = weeks.flatMap((w) => w.days.map((d) => h('tr', {}, [
    h('td', {}, dayLabel(d.date)),
    h('td', { class: 'num' }, d.hours), h('td', { class: 'num' }, d.regular), h('td', { class: 'num' }, d.overtime), h('td', { class: 'num' }, d.doubleTime),
    h('td', {}, d.rules.map((r) => `${r.hours} h: ${r.text}`).join('; ')),
  ])));
  return h('div', { class: 'oa-table-wrap' }, h('table', { class: 'oa-table' }, [
    h('caption', {}, caption),
    h('thead', {}, h('tr', {}, ['Day', 'Hours', 'Regular', 'Overtime', 'Double', 'Rule'].map((x, i) => h('th', i && i < 5 ? { class: 'num' } : {}, x)))),
    h('tbody', {}, rows),
  ]));
}

async function runWeek(ev) {
  ev?.preventDefault();
  $('oa-err').textContent = '';
  const out = $('oa-out');
  try {
    const json = await T.run(SLUG, weekInput());
    const r = json.result;
    const w = r.weeks[0];
    const rulesOf = (bucket) => [...new Set(r.weeks.flatMap((wk) => wk.days.flatMap((d) => d.rules.filter((x) => x.bucket === bucket).map((x) => x.text))))].join('; ');
    const item = (k, what, fig, em, cls) => h('li', { class: cls ?? null }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), h('b', {}, fig), h('em', {}, em)]);
    const example = weekNow() === DEFAULTS;
    const inputs = `${r.state.name}, ${$('oa-rate').value.trim() ? `$${$('oa-rate').value.trim()} an hour` : 'no rate'}, week from ${dayLabel(w.workweekStart)}: ${w.days.map((d) => Number(d.hours)).join(', ')} hours`;
    out.textContent = '';
    out.append(
      h('div', { class: 'tf-rh' }, [
        example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
        h('span', { class: 'tf-src' }, r.state.covered ? `${r.state.name} rule and 29 CFR 778` : 'Federal rule, 29 CFR 778'),
      ]),
      h('p', { class: 'tf-exin' }, example ? `Example: ${inputs}` : inputs),
      h('p', { class: 'tf-big' }, r.totals.owed ? [h('b', {}, r.totals.owed), h('span', {}, `owed for ${Number(r.totals.hoursWorked)} hours`)] : [h('b', {}, r.totals.overtime), h('span', {}, 'overtime hours')]),
      h('p', { class: 'tf-sub' }, r.answer),
      h('ol', { class: 'tf-items oa-items' }, [
        item('1x', 'Regular hours', `${r.totals.regular} h`, `At the regular rate${w?.regularRate ? ` of ${w.regularRate}` : ''} (29 CFR 778.109)`),
        item('1.5', 'Overtime hours (1.5x)', `${r.totals.overtime} h`, rulesOf('overtime') || 'None this week', 'hi'),
        ...(Number(r.totals.doubleTime) ? [item('2x', 'Double-time hours (2x)', `${r.totals.doubleTime} h`, rulesOf('double time'))] : []),
        item('TT', 'Qualified overtime, W-2 code TT', r.totals.qualifiedOvertime ?? 'no rate', `${r.totals.flsaOvertime} FLSA overtime hours x half the regular rate (IRS FS-2026-13)`, 'tot'),
      ]),
      h('details', { class: 'xpand oa-fold' }, [
        h('summary', {}, 'Day by day, with the rule for each hour'),
        h('div', { class: 'xp-in' }, [
          dayTable(r.weeks, `${r.state.name}: workweek starting ${dayLabel(w.workweekStart)}`),
          r.state.note ? h('p', { class: 'tf-cost' }, r.state.note) : '',
        ]),
      ]),
    );
  } catch (e) {
    $('oa-err').textContent = errorText(e);
  }
}

// ---------- the file ----------

function fileInput(op) {
  const input = { op, csv: $('oa-csv').value, workweekStart: $('oa-ws').value };
  if ($('oa-default-state').value) input.defaultState = $('oa-default-state').value;
  return input;
}

function download(name, body) {
  const a = h('a', { href: URL.createObjectURL(new Blob([body], { type: 'text/csv' })), download: name }, name);
  return a;
}

function renderTotals(r) {
  const s = r.summary;
  const facts = [
    ['Employees', String(s.employees)], ['Employee-weeks', String(s.employeeWeeks)], ['Hours worked', s.hoursWorked],
    ['Overtime hours', s.overtime], ['Double-time hours', s.doubleTime], ['Weeks underpaid', s.weeksChecked ? `${s.weeksUnderpaid} of ${s.weeksChecked}` : 'not checked (no paid columns)'],
    ['Short in total', s.shortfall ?? 'not checked'], ['California seventh-day weeks', String(s.californiaSeventhDayWeeks)], ['Code TT, all employees', s.qualifiedOvertime ?? 'no rates'],
  ];
  return [
    h('p', { class: 'oa-answer' }, r.answer),
    h('dl', { class: 'oa-facts' }, facts.map(([k, v]) => h('div', {}, [h('dt', {}, k), h('dd', {}, v)]))),
    s.statesNotCovered.length ? h('p', { class: 'small' }, `Federal rule only for ${s.statesNotCovered.map((x) => x.name).join(', ')}: ${s.statesNotCovered[0].note}`) : null,
    s.skippedExempt.length ? h('p', { class: 'small' }, `Skipped as exempt: ${s.skippedExempt.join(', ')}.`) : null,
  ];
}

function renderAudit(json) {
  const r = json.result;
  const out = $('oa-file-out');
  out.textContent = '';
  out.append(...renderTotals(r).filter(Boolean));
  out.append(h('p', {}, ['Your results file: ', download('overtime-audit.csv', r.csv), json.charged?.display ? `. Charged ${json.charged.display}.` : '.']));
  out.append(h('h3', {}, 'Per employee'));
  out.append(h('div', { class: 'oa-table-wrap' }, h('table', { class: 'oa-table' }, [
    h('thead', {}, h('tr', {}, ['Employee', 'Weeks', 'Hours', 'Overtime', 'Double', 'Weeks short', 'Short', 'Code TT by year'].map((x, i) => h('th', i ? { class: 'num' } : {}, x)))),
    h('tbody', {}, r.employees.map((e) => h('tr', {}, [
      h('td', {}, e.employee), h('td', { class: 'num' }, String(e.weeks)), h('td', { class: 'num' }, e.hoursWorked), h('td', { class: 'num' }, e.overtime), h('td', { class: 'num' }, e.doubleTime),
      h('td', { class: 'num' }, String(e.weeksUnderpaid)), h('td', { class: 'num' }, e.shortfall ?? ''), h('td', { class: 'num' }, Object.entries(e.qualifiedOvertimeByYear).map(([y, v]) => `${y}: ${v}`).join(', ')),
    ]))),
  ])));
  out.append(h('h3', {}, 'Per workweek'));
  const weeks = r.weeks.slice(0, SHOWN_WEEKS);
  out.append(h('div', { class: 'oa-table-wrap' }, h('table', { class: 'oa-table' }, [
    h('thead', {}, h('tr', {}, ['Employee', 'Week of', 'Hours', 'Regular', 'Overtime', 'Double', 'Owed', 'Short', 'Flags'].map((x, i) => h('th', i > 1 && i < 8 ? { class: 'num' } : {}, x)))),
    h('tbody', {}, weeks.map((w) => h('tr', { class: w.underpaid ? 'oa-short' : '' }, [
      h('td', {}, w.employee), h('td', {}, dayLabel(w.workweekStart)), h('td', { class: 'num' }, w.hoursWorked), h('td', { class: 'num' }, w.regular), h('td', { class: 'num' }, w.overtime), h('td', { class: 'num' }, w.doubleTime),
      h('td', { class: 'num' }, w.owed ?? ''), h('td', { class: 'num' }, w.shortfall ?? ''), h('td', {}, w.flags.join(' ')),
    ]))),
  ])));
  if (r.weeks.length > weeks.length) out.append(h('p', { class: 'small muted' }, `And ${r.weeks.length - weeks.length} more weeks in the results file.`));
}

async function runFile(op) {
  $('oa-file-err').textContent = '';
  if (!$('oa-csv').value.trim()) { $('oa-file-err').textContent = 'Choose a CSV file or paste one first.'; return; }
  try {
    const json = await T.run(SLUG, fileInput(op));
    if (op === 'preview') {
      const out = $('oa-file-out');
      out.textContent = '';
      out.append(...renderTotals(json.result).filter(Boolean), h('p', { class: 'small muted' }, json.result.note));
    } else renderAudit(json);
  } catch (e) {
    $('oa-file-err').textContent = e.code === 'sign_in_required' || e.status === 401 ? 'Sign in to run the full audit; the totals are free.' : errorText(e);
  }
  quoteAudit();
}

async function quoteAudit() {
  const el = $('oa-audit-price');
  const raw = tool?.pricing?.actions?.find((a) => a.name === 'audit')?.text;
  const text = raw && typeof raw === 'object' ? T.money(raw) : raw;
  if (!signedIn || !$('oa-csv').value.trim()) { if (text) el.textContent = `${text}.`; return; }
  try {
    const q = (await T.api(`/api/run/${SLUG}/quote`, { body: fileInput('audit') })).quote;
    el.textContent = q.amount ? `This audit costs ${q.display} from your balance${text ? ` (${text})` : ''}.` : 'This audit is free for you now.';
  } catch {
    if (text) el.textContent = `${text}.`;
  }
}

// ---------- start ----------

function prefill() {
  const q = new URLSearchParams(window.location.search);
  const has = [...q.keys()].some((k) => /^(state|rate|start|d[0-6])$/.test(k));
  if (q.get('state') && STATE_NAMES[q.get('state').toUpperCase()]) $('oa-state').value = q.get('state').toUpperCase();
  if (q.get('rate')) $('oa-rate').value = q.get('rate');
  if (q.get('start') && /^\d{4}-\d{2}-\d{2}$/.test(q.get('start'))) $('oa-start').value = q.get('start');
  if (q.get('aws')) $('oa-aws').value = q.get('aws');
  if (q.get('awsdays')) $('oa-awsdays').value = q.get('awsdays');
  if (q.get('extra')) $('oa-extra').value = q.get('extra');
  drawDays(Array.from({ length: 7 }, (_, i) => q.get(`d${i}`) ?? (has ? '' : ['10', '10', '13', '8', '8', '9', '6'][i])));
  return has;
}

async function start() {
  fillStates();
  const own = prefill();
  if (!own) DEFAULTS = weekNow();
  $('oa-start').addEventListener('change', () => drawDays(Array.from({ length: 7 }, (_, i) => $(`oa-d${i}`)?.value ?? '')));
  $('oa-form').addEventListener('submit', runWeek);
  $('oa-preview').addEventListener('click', () => runFile('preview'));
  $('oa-audit').addEventListener('click', () => runFile('audit'));
  $('oa-csv').addEventListener('change', quoteAudit);
  $('oa-file-in').addEventListener('change', async (ev) => {
    const f = ev.target.files?.[0];
    if (!f) return;
    $('oa-csv').value = await f.text();
    quoteAudit();
  });
  T.mountCodePanel($('oa-code'), SLUG);
  if (own) runWeek();
  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
    const sample = tool.examples.find((x) => x.input.op === 'audit')?.input.csv;
    if (sample) {
      $('oa-template').addEventListener('click', (ev) => {
        ev.preventDefault();
        const a = download('overtime-sample.csv', sample);
        a.click();
        if (!$('oa-csv').value.trim()) $('oa-csv').value = sample;
      });
    }
  } catch { /* the sample link stays inert */ }
  T.me().then((account) => { signedIn = !!account; quoteAudit(); }).catch(() => {});
}

start();
