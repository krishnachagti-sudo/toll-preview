// The rolled-up holiday pay calculator page. core.js (the same file the server runs) works out one
// worker, the 52-week average and the sick-leave accrual in the browser as you type, so they are
// free and never use a run, and previews a payroll CSV (totals and the first rows). The full
// payroll file is the server's answer to the same input, through Endwise.run, and is the paid
// output.
import { calculate, batch, reference, leaveAccrual, rate, toCentiHours, pounds, hoursText, HolidayError, ROUNDINGS, HOUR_ROUNDINGS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'rolled-up-holiday-pay-calculator';
const $ = (id) => document.getElementById(id);

let tool = null;
let signedIn = false;
let lastBatch = null; // the last batch input that read

const put = (el, ...kids) => { el.textContent = ''; el.append(...kids.flat().filter(Boolean)); };
const errorText = (e) => { if (!(e instanceof HolidayError)) throw e; return e.message; };

// ---------- reading the form ----------

// "Basic pay 403.20" / "403.20" / "£1,000" per line -> { pay } or { lines }.
function readPay(text) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new HolidayError('Type the pay for the period.');
  if (lines.length > 20) throw new HolidayError('At most 20 pay lines.');
  const parsed = lines.map((l) => {
    const m = /^(.*?)[\s:]*(£?\s*[\d,]+(?:\.\d{1,2})?)$/.exec(l);
    if (!m) throw new HolidayError(`Could not read "${l.slice(0, 40)}". End each line with an amount, like Basic pay 403.20.`);
    return { label: m[1].trim(), amount: m[2].replace(/\s/g, '') };
  });
  if (parsed.length === 1 && !parsed[0].label) return { pay: parsed[0].amount };
  return { lines: parsed.map((p, i) => ({ label: p.label || `Pay ${i + 1}`, amount: p.amount })) };
}
// "5.6 weeks" / "6" / "33 days" / "30 days 4" -> an entitlement.
export function readEnt(text) {
  const t = text.trim().toLowerCase();
  if (!t) return {};
  let m = /^(\d+(?:\.\d+)?)\s*(?:weeks?|w)?$/.exec(t);
  if (m) return { weeks: m[1] };
  m = /^(\d+(?:\.\d)?)\s*days?(?:\s*(?:on\s*a\s*)?(\d)(?:\s*-?\s*day(?:\s*week)?)?)?$/.exec(t);
  if (m) return { days: m[1], ...(m[2] ? { daysPerWeek: Number(m[2]) } : {}) };
  throw new HolidayError(`Could not read "${text.slice(0, 30)}". Write 6 (weeks), 33 days, or 30 days 4 for a 4-day week.`);
}

function oneInput() {
  const worker = $('rh-var').value || $('rh-unpaid').checked ? {
    ...($('rh-var').value ? { hours: $('rh-var').value } : {}),
    ...($('rh-unpaid').checked ? { unpaidWeeks: true } : {}),
    ...($('rh-ly').value ? { leaveYearStart: $('rh-ly').value } : {}),
  } : undefined;
  return {
    op: 'calculate',
    ...readPay($('rh-pay').value),
    ...($('rh-hours').value.trim() ? { hours: $('rh-hours').value.trim() } : {}),
    entitlement: readEnt($('rh-ent').value),
    rounding: $('rh-round').value,
    hourRounding: $('rh-hround').value,
    ...(worker ? { worker } : {}),
  };
}

// ---------- one worker ----------

let pristine = true;
function recomputeOne() {
  $('rh-one-err').textContent = '';
  let r;
  try {
    r = calculate(oneInput());
  } catch (e) {
    $('rh-one-err').textContent = errorText(e);
    return;
  }
  // Like the other tool pages: the tag and source, the inputs in one line, the holiday pay line as the
  // big figure, then one line per figure with how it was worked out.
  const i = oneInput();
  const item = (k, what, v, why, cls = null) => h('li', { class: cls }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), v ? h('b', {}, v) : null, h('em', {}, why)]);
  const ins = `${r.pay?.display ?? ''} of pay in ${i.lines?.length ?? 1} ${i.lines?.length === 1 ? 'line' : 'lines'}, ${i.hours ?? '?'} hours worked, ${$('rh-var').selectedOptions[0]?.textContent.toLowerCase()} hours, leave year from ${i.worker?.leaveYearStart ? new Date(`${i.worker.leaveYearStart}T12:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }) : 'not given'}`;
  const out = [
    h('div', { class: 'tf-rh' }, [h('span', { class: pristine ? 'tf-tag' : 'tf-tag run' }, pristine ? 'Example' : 'Your result'), h('span', { class: 'tf-src' }, 'GOV.UK holiday pay guidance')]),
    h('p', { class: 'tf-exin' }, pristine ? `Example: one week for a zero-hours bar worker, ${ins}` : ins),
    h('p', { class: 'tf-big' }, [h('b', { class: r.allowed ? null : 'word' }, r.allowed ? r.holidayPay.display : 'Not allowed'), r.allowed ? h('span', {}, 'holiday pay line') : null]),
    h('p', { class: 'tf-sub' }, r.answer),
  ];
  out.push(h('ul', { class: 'tf-items' }, [
    r.pay ? item('£', 'Total pay this period', r.pay.display, 'your figures, overtime and premium pay included') : null,
    item('%', 'Rate', r.rate.percent, `${r.rate.working}`),
    r.allowed ? item('=', 'Holiday pay line', r.holidayPay.display, r.holidayPay.working, 'tot') : null,
    r.accrual ? item('h', 'Holiday accrued', `${r.accrual.hours} hours`, r.accrual.working) : null,
  ]));
  if (r.payslip) {
    out.push(h('details', { class: 'xpand' }, [h('summary', {}, 'The payslip'), h('div', { class: 'xp-in' },
      h('table', { class: 'rh-table' }, [h('tbody', {}, r.payslip.map((l, n) => h('tr', { class: n === r.payslip.length - 2 ? 'rh-line' : '' }, [h('td', {}, l.item), h('td', { class: 'num' }, l.amount)])))]))]));
  }
  if (r.holidayPay.differs) {
    const b = r.holidayPay.byRounding;
    out.push(h('p', { class: 'tf-note' }, `Rounding: nearest penny ${b.nearest}, up to the penny ${b.up}, GOV.UK's worked-example steps ${b['govuk-steps']}. Exact: ${r.holidayPay.exact}.`));
  }
  if (r.eligibility) out.push(h('ul', { class: 'rh-list small' }, r.eligibility.reasons.map((x) => h('li', {}, x))));
  put($('rh-out'), out);
}

// ---------- the payroll CSV ----------

function batchInput() {
  const csv = $('rh-csv').value;
  if (!csv.trim()) throw new HolidayError('Paste or choose a payroll CSV.');
  return {
    op: 'batch',
    csv,
    ...($('rh-bend').value ? { periodEnd: $('rh-bend').value } : {}),
    ...($('rh-bly').value ? { leaveYearStart: $('rh-bly').value } : {}),
    ...(Object.keys(readEnt($('rh-ent').value)).length ? { entitlement: readEnt($('rh-ent').value) } : {}),
    rounding: $('rh-round').value,
    hourRounding: $('rh-hround').value,
  };
}
function recomputeBatch() {
  $('rh-batch-err').textContent = '';
  lastBatch = null;
  let r;
  let input;
  try {
    input = batchInput();
    const { op, csv, ...o } = input;
    r = batch(csv, o);
  } catch (e) {
    $('rh-batch-err').textContent = errorText(e);
    put($('rh-preview'));
    buy?.refresh();
    return;
  }
  lastBatch = input;
  const shown = r.rows.slice(0, 3);
  put($('rh-preview'), [
    h('p', { class: 'rh-sub' }, r.answer),
    h('p', { class: 'rh-heading' }, `Preview: ${shown.length} of ${r.rows.length} rows`),
    h('table', { class: 'rh-table' }, [
      h('thead', {}, h('tr', {}, ['Worker', 'Pay', 'Holiday pay', 'Hours', 'Status'].map((c, i) => h('th', { class: i && i < 4 ? 'num' : '' }, c)))),
      h('tbody', {}, shown.map((x) => h('tr', {}, [h('td', {}, x.worker), h('td', { class: 'num' }, x.pay ?? ''), h('td', { class: 'num' }, x.holidayPay || '-'), h('td', { class: 'num' }, x.accruedHours === null ? '-' : String(x.accruedHours)), h('td', {}, x.status)]))),
    ]),
  ]);
  buy?.refresh();
}

function download(name, body) {
  return h('a', { href: URL.createObjectURL(body), download: name }, name);
}
let buy = null;
function buyBox(el) {
  const price = h('p', { class: 'rh-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Download the payroll file');
  const got = h('p', { class: 'rh-got', role: 'status' });
  const err = h('p', { class: 'form-error', role: 'alert' });
  const words = () => {
    const text = tool?.pricing?.actions.find((a) => a.name === 'batch')?.text;
    return text ? T.money(text) : '';
  };
  button.addEventListener('click', async () => {
    err.textContent = '';
    if (!lastBatch) { err.textContent = 'Fix the CSV above first.'; return; }
    button.disabled = true;
    try {
      const json = await T.run(SLUG, lastBatch);
      const r = json.result;
      const charged = json.charged ? (json.charged.amount ? ` Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : ' Free: these rows were already paid for.') : '';
      got.textContent = '';
      got.append('Your file: ', download(r.filename, new Blob([r.csv], { type: 'text/csv' })), `. ${r.answer}${charged}`);
    } catch (e) {
      err.textContent = e.message;
      if (e.code === 'unauthorized' || e.code === 'rate_limited') err.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
      if (e.code === 'insufficient_balance' || e.code === 'cap_reached') err.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
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
        if (!signedIn) { price.textContent = `${words()}. Sign in to download.`; return; }
        if (!lastBatch) { price.textContent = words(); return; }
        try {
          const q = (await T.api(`/api/run/${SLUG}/quote`, { body: lastBatch })).quote;
          price.textContent = q.amount ? `This file costs ${q.display} from your balance (${words()}).` : `This file is free for you now (${words()}).`;
        } catch {
          price.textContent = words();
        }
      }, 300);
    },
  };
}

// ---------- 52 weeks and sick leave ----------

function recomputeRef() {
  try {
    const weeks = $('rh-weeks').value.split(/[\n,|]+/).map((x) => x.trim()).filter(Boolean).map((x) => {
      const m = /^(£?[\d,]*\.?\d+)\s*(sick|statutory)?$/i.exec(x);
      if (!m) throw new HolidayError(`Could not read "${x.slice(0, 30)}": write an amount, then sick or statutory if the week had that leave.`);
      return { pay: m[1], ...(m[2] ? { excluded: m[2].toLowerCase() } : {}) };
    });
    const r = reference({ weeks, leaveWeeks: $('rh-lw').value.trim() || undefined });
    $('rh-ref-out').textContent = `${r.display} a week: ${r.working}${r.skipped.unpaid || r.skipped.excluded ? `, after skipping ${r.skipped.unpaid} week${r.skipped.unpaid === 1 ? '' : 's'} with no pay and ${r.skipped.excluded} with sick or statutory leave` : ''}.${r.holiday ? ` ${r.holiday.weeks} week${r.holiday.weeks === 1 ? '' : 's'} of leave: ${r.holiday.display}.` : ''}${r.short ? ' Fewer than 52 paid weeks: the average is over those there are.' : ''}`;
  } catch (e) {
    $('rh-ref-out').textContent = errorText(e);
  }
}
function recomputeSick() {
  try {
    const r = leaveAccrual({ centiHours: toCentiHours($('rh-sh').value), weeksOff: $('rh-sw').value.trim(), divisor: $('rh-sd').value.trim() || '46.4', rate: rate(readEnt($('rh-ent').value)).rate });
    $('rh-sick-out').textContent = `${r.hours} hours of holiday accrue: ${r.steps.join('; ')}.`;
  } catch (e) {
    $('rh-sick-out').textContent = errorText(e);
  }
}

// ---------- the address ----------

// ?pay=452.20&hours=35&ent=6&rounding=govuk-steps&hr=hour&var=wholly-variable&unpaid=1&ly=2026-04-01
// &ref=412.50|298|0&lw=1&sh=1032&sw=40&sd=46.4. pay lines are separated by "|".
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const set = (id, key, ok = () => true, map = (v) => v) => { const v = q.get(key); if (v !== null && v.length <= 4000 && ok(v)) $(id).value = map(v); };
  const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
  set('rh-pay', 'pay', () => true, (v) => v.split('|').join('\n'));
  set('rh-hours', 'hours');
  set('rh-ent', 'ent');
  set('rh-round', 'rounding', (v) => ROUNDINGS.includes(v));
  set('rh-hround', 'hr', (v) => HOUR_ROUNDINGS.includes(v));
  set('rh-var', 'var', (v) => ['', 'wholly-variable', 'mostly-variable', 'fixed'].includes(v));
  set('rh-ly', 'ly', isDate);
  set('rh-weeks', 'ref', () => true, (v) => v.split('|').join(', '));
  set('rh-lw', 'lw');
  set('rh-sh', 'sh');
  set('rh-sw', 'sw');
  set('rh-sd', 'sd');
  if (q.get('unpaid') === '1') $('rh-unpaid').checked = true;
  if (q.has('rounding') || q.has('hr')) $('rh-more').open = true;
  const one = ['pay', 'hours', 'ent', 'var', 'ly'].some((k) => q.has(k));
  // A linked pay period brings its own facts: the example's hours and worker do not carry over.
  if (one && !q.has('hours')) $('rh-hours').value = '';
  if (one && !q.has('var')) $('rh-var').value = '';
  if (one && !q.has('ly')) $('rh-ly').value = '';
  if (one && !q.has('ent')) $('rh-ent').value = '5.6 weeks';
  if ((q.has('ref') || q.has('lw')) && !one) document.getElementById('reference')?.scrollIntoView();
  return { one };
}

// ---------- start ----------

const soon = (fn, ms = 200) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

async function start() {
  T.mountCodePanel($('rh-code'), SLUG);
  const linked = fromQuery();
  pristine = !linked.one;
  recomputeOne();
  recomputeRef();
  recomputeSick();
  buy = buyBox($('rh-buy'));
  recomputeBatch();
  for (const [form, fn] of [['rh-one', () => { pristine = false; recomputeOne(); recomputeBatch(); }], ['rh-ref', recomputeRef], ['rh-sick', recomputeSick]]) {
    $(form).addEventListener('submit', (e) => { e.preventDefault(); fn(); });
    $(form).addEventListener('input', soon(fn));
    $(form).addEventListener('change', fn);
  }
  for (const id of ['rh-csv', 'rh-bend', 'rh-bly']) $(id).addEventListener('input', soon(recomputeBatch, 300));
  $('rh-file').addEventListener('change', async () => {
    const f = $('rh-file').files?.[0];
    if (!f) return;
    if (f.size > 2_000_000) { $('rh-batch-err').textContent = 'The file is over 2 MB: split the payroll.'; return; }
    $('rh-csv').value = await f.text();
    recomputeBatch();
  });
  try { tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool; } catch { tool = null; }
  try { signedIn = !!(await T.me()); } catch { signedIn = false; }
  buy.refresh();
}

start();
