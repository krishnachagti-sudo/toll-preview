// The FMLA eligibility checker page. core.js (the same file the server runs) works out the check,
// the balance and the weeks-to-hours conversion in the browser as you type, so they are free and
// never use a run; the five business days use the federal holiday calendar of the business days
// tool. The leave record is the server's answer to the same input, through Endwise.run, and is the
// paid output.
import { check, balance, compareMethods, entitlement, hoursText, longDate, dayDate, addDays, weekdayOf, isRealDate, FmlaError, METHOD_NAMES } from './core.js';
import * as businessDaysCore from '../../business-days/files/core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'fmla-eligibility-checker';
const $ = (id) => document.getElementById(id);
const businessDays = (start, n, closed) => businessDaysCore.addBusinessDays('US', start, n, closed?.length ? closed : undefined);

let tool = null;
let signedIn = false;
let lastCheck = null; // the last good check input
let lastBal = null; // the last good balance input

// ---------- reading the form ----------

const DATE = /(\d{4}-\d{2}-\d{2})/;
function needDate(s, what) {
  if (!isRealDate(s)) throw new FmlaError(`${what}: "${s}" is not a date like 2026-11-10.`);
  return s;
}
// "2012-05-07 to 2018-08-31 userra" / "2026-03-02" -> periods, or a lone hire date.
function readPeriods(text) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new FmlaError('Type the hire date, or each period worked.');
  if (lines.length > 20) throw new FmlaError('At most 20 periods.');
  const periods = lines.map((l) => {
    const m = /^(\d{4}-\d{2}-\d{2})(?:\s*(?:to|-|–)\s*(\d{4}-\d{2}-\d{2}))?\s*(userra|agreement)?$/i.exec(l);
    if (!m) throw new FmlaError(`Could not read "${l.slice(0, 40)}". Write 2012-05-07 to 2018-08-31, or 2026-03-02 for a job that continues.`);
    return { start: needDate(m[1], 'Start'), ...(m[2] ? { end: needDate(m[2], 'End') } : {}), ...(m[3] ? { breakBefore: m[3].toLowerCase() } : {}) };
  });
  if (periods.length === 1 && !periods[0].end && !periods[0].breakBefore) return { hireDate: periods[0].start };
  return { periods };
}
// "Headquarters, 210" / "Suburban office, 90, 28" / "Toronto, 30, 500, outside US" or a lone count.
function readSites(text) {
  const t = text.trim();
  if (/^\d[\d,]*$/.test(t)) return { employeesWithin75: Number(t.replace(/,/g, '')) };
  const lines = t.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new FmlaError('Type the sites, or the number of employees within 75 miles.');
  return {
    sites: lines.map((l) => {
      const parts = l.split(',').map((x) => x.trim());
      const outsideUS = parts.length > 1 && /^outside\s*(us|u\.s\.)$/i.test(parts.at(-1));
      if (outsideUS) parts.pop();
      const [name, emp, miles] = parts;
      if (!name || !/^\d+$/.test(emp ?? '')) throw new FmlaError(`Could not read "${l.slice(0, 40)}". Write a name, the employees there, then the miles: Suburban office, 90, 28.`);
      if (miles !== undefined && !/^\d+(\.\d+)?$/.test(miles)) throw new FmlaError(`"${miles}" is not a number of miles.`);
      return { name, employees: Number(emp), ...(miles !== undefined ? { miles: Number(miles) } : {}), ...(outsideUS ? { outsideUS: true } : {}) };
    }),
  };
}
// "2026-02-09 8" / "2026-06-01 to 2026-06-26 8" (Mondays to Fridays) -> [{ date, hours }].
function readLeave(text, what) {
  const out = [];
  for (const raw of text.split(/\n+/)) {
    const l = raw.trim();
    if (!l) continue;
    const m = /^(\d{4}-\d{2}-\d{2})(?:\s*(?:to|-|–)\s*(\d{4}-\d{2}-\d{2}))?\s+(\d+(?:\.\d{1,2})?)\s*h?(?:ours?)?$/i.exec(l);
    if (!m) throw new FmlaError(`${what}: could not read "${l.slice(0, 40)}". Write 2026-02-09 8, or 2026-06-01 to 2026-06-26 8.`);
    const from = needDate(m[1], what);
    const to = m[2] ? needDate(m[2], what) : from;
    if (to < from) throw new FmlaError(`${what}: ${l} ends before it starts.`);
    for (let d = from; d <= to; d = addDays(d, 1)) {
      if (m[2] && (weekdayOf(d) === 0 || weekdayOf(d) === 6)) continue;
      out.push({ date: d, hours: m[3] });
      if (out.length > 1000) throw new FmlaError('At most 1,000 days of leave.');
    }
  }
  return out;
}

function checkInput() {
  const input = { op: 'check', leaveStart: needDate($('fm-leave').value, 'Leave starts') };
  if ($('fm-notice').value) input.noticeDate = needDate($('fm-notice').value, 'Leave requested on');
  Object.assign(input, readPeriods($('fm-periods').value));
  if ($('fm-oldservice').checked) input.countOldService = true;
  if ($('fm-crew').checked) input.flightCrew = true;
  else input.hours = $('fm-hours').value.trim().replace(/,/g, '') || '0';
  if ($('fm-userra').value.trim()) input.userraHours = $('fm-userra').value.trim().replace(/,/g, '');
  if ($('fm-norecords').checked) input.recordsKept = false;
  input.workLocation = $('fm-where').value;
  if ($('fm-reports').value.trim()) input.reportsTo = $('fm-reports').value.trim();
  Object.assign(input, readSites($('fm-sites').value));
  const employer = { type: $('fm-type').value };
  const w50 = $('fm-weeks50').value.trim();
  if (w50) {
    if (!/^\d{1,2}$/.test(w50)) throw new FmlaError('Workweeks with 50 or more employees is a whole number, like 52.');
    employer.workweeksWith50 = Number(w50);
  }
  input.employer = employer;
  const closed = $('fm-closed').value.split(/[\s,;]+/).filter(Boolean);
  if (closed.length) input.closedDays = closed.map((d) => needDate(d, 'Closed days'));
  return input;
}

function balanceInput() {
  const input = { op: 'balance', method: $('fm-method').value, weeklyHours: $('fm-weekly').value.trim(), asOf: needDate($('fm-asof').value, 'Balance on') };
  if ($('fm-kind').value === '26') input.weeks = 26;
  if (input.method === 'fixed') input.leaveYearStart = $('fm-ly').value.trim();
  else if (/^\d{2}-\d{2}$/.test($('fm-ly').value.trim())) input.leaveYearStart = $('fm-ly').value.trim();
  input.used = readLeave($('fm-used').value, 'Leave taken');
  const requested = readLeave($('fm-requested').value, 'Leave asked for');
  if (requested.length) input.requested = requested;
  return input;
}

// ---------- drawing ----------

function put(el, ...nodes) {
  el.textContent = '';
  for (const n of nodes.flat()) if (n) el.append(n);
}
const fact = (k, v) => h('div', {}, [h('dt', {}, k), h('dd', {}, v)]);
const table = (cols, rows) => h('div', { class: 'table-scroll' }, h('table', { class: 'rules fm-table' }, [
  h('thead', {}, h('tr', {}, cols.map((c, i) => h('th', { scope: 'col', class: i ? 'num' : null }, c)))),
  h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, i) => (i ? h('td', { class: 'num' }, c) : h('th', { scope: 'row' }, c)))))),
]));
const item = (label, value, src, key = false) => h('li', key ? { class: 'key' } : {}, [h('span', {}, label), h('b', {}, value), h('small', {}, src)]);
const mark = (pass) => (pass === true ? 'met' : pass === false ? 'not met' : 'open');

function renderCheck(r, example) {
  const t = r.tests;
  const s = t.service;
  const site = t.worksite;
  put($('fm-out'),
    example ? h('p', { class: 'fm-label' }, 'Worked example') : null,
    h('p', { class: `tf-big fm-answer ${r.eligible === true ? 'yes' : r.eligible === false ? 'no' : 'maybe'}` }, [
      r.eligible === true ? 'Eligible' : r.eligible === false ? 'Not eligible' : 'Not decided',
      h('small', {}, `for FMLA leave starting ${longDate(r.leaveStart)}`),
    ]),
    h('p', { class: 'fm-sub' }, r.answer),
    // One line per test: what the employee has, what is needed, and the rule it comes from.
    h('ul', { class: 'tf-items' }, [
      item('Employer covered', t.coverage.type === 'private' ? (t.coverage.assumed ? 'assumed' : `${t.coverage.workweeksWith50} weeks`) : 'any size', `needs 20 workweeks with 50+ employees · ${mark(t.coverage.pass)} · 29 CFR 825.104`),
      item('12 months of employment', s.measure === 'months' ? `${s.months} months` : `${s.weeks} weeks`, `needs ${s.measure === 'months' ? '12 months' : '52 weeks'} · ${mark(s.pass)} · 29 CFR 825.110(b)`),
      item('Hours in the 12 months before leave', t.hours.flightCrew ? 'flight crew rule' : hoursText(t.hours.total), `needs 1,250 · ${mark(t.hours.pass)} · 29 CFR 825.110(c)`),
      item(`Employees within 75 miles of ${site.worksite ?? 'the worksite'}`, site.count.toLocaleString('en-US'), `needs 50 · ${mark(site.pass)} · 29 CFR 825.111`),
      item('Eligibility notice due', dayDate(r.notice.due), 'five business days from the request · 29 CFR 825.300(b)', true),
    ]),
    r.reasons.length ? [h('p', { class: 'fm-heading' }, 'Reason to state on the eligibility notice'), h('ul', { class: 'fm-list' }, r.reasons.map((x) => h('li', {}, x)))] : null,
    h('p', { class: 'fm-due fm-sub' }, `${r.notice.text}${r.notice.holidaysSkipped.length ? ` Skips ${r.notice.holidaysSkipped.map((x) => x.name).join(', ')}.` : ''}`),
    site.sites ? h('details', { class: 'fm-why' }, [h('summary', {}, 'The headcount, site by site'), table(['Site', 'Employees', 'Miles', 'Counted'], site.sites.map((x) => [x.name, x.employees.toLocaleString('en-US'), x.worksite ? 'worksite' : String(x.miles), x.counted ? 'yes' : x.outsideUS ? 'no (outside US)' : 'no'])) ]) : null,
    r.notes.length ? [h('p', { class: 'fm-heading' }, 'Notes'), h('ul', { class: 'fm-list' }, r.notes.map((x) => h('li', {}, x)))] : null,
  );
}

function renderBalance(r, cmp, example) {
  const requested = r.rows.filter((x) => x.kind === 'requested');
  put($('fm-bal-out'),
    example ? h('p', { class: 'fm-label' }, 'Worked example') : null,
    h('p', { class: 'tf-big fm-answer' }, [`${hoursText(r.remaining)} hours`, h('small', {}, `left on ${longDate(r.asOf)}: ${r.remainingWeeks} of ${r.weeks} weeks`)]),
    h('p', { class: 'fm-sub' }, r.answer),
    h('dl', { class: 'fm-facts' }, [
      fact('Entitlement', `${hoursText(r.entitlement)} h`),
      fact('Used in the period', `${hoursText(r.used)} h`),
      r.periodFrom ? fact('Period from', longDate(r.periodFrom)) : null,
      r.resetOn ? fact('Full balance again', longDate(r.resetOn)) : r.fullOn ? fact('All back by', longDate(r.fullOn)) : null,
    ]),
    r.restores.length ? [h('p', { class: 'fm-heading' }, 'When hours come back'), table(['Date', 'Hours back', 'Balance then'], r.restores.slice(0, 10).map((x) => [dayDate(x.date), hoursText(x.hours), hoursText(x.balance)]))] : null,
    requested.length ? [h('p', { class: 'fm-heading' }, 'The leave asked for'), table(['Day', 'Hours', 'Protected', 'Not protected'], requested.map((x) => [dayDate(x.date), hoursText(x.hours), hoursText(x.protected), x.over ? hoursText(x.over) : ''])) ] : null,
    cmp ? [h('p', { class: 'fm-heading' }, 'The same leave under each method'), table(['Method', 'Used', 'Left', 'Requested protected'], cmp.map((x) => [`${x.name}${x.best ? ' (most for the employee)' : ''}`, hoursText(x.used), hoursText(x.remaining), hoursText(x.protectedRequested)])),
      h('p', { class: 'fm-aside' }, 'If an employer never chose a method, the one most beneficial to the employee applies, and changing method takes 60 days\' notice to all employees (29 CFR 825.200(d), (e)).')] : null,
    r.caregiver ? h('p', { class: 'fm-aside' }, 'Military caregiver leave is 26 workweeks in a single 12-month period measured forward from the first day of that leave, whatever method the employer uses for other leave (29 CFR 825.127(e)(1), 825.200(f)).') : null,
  );
}

function recomputeCheck() {
  $('fm-check-err').textContent = '';
  try {
    const input = checkInput();
    renderCheck(check(input, { businessDays }));
    lastCheck = input;
  } catch (e) {
    if (!(e instanceof FmlaError) && !(e instanceof RangeError) && !(e instanceof TypeError)) throw e;
    lastCheck = null;
    $('fm-check-err').textContent = e.message;
  }
  if (buy) buy.refresh();
}
function recomputeBalance() {
  $('fm-bal-err').textContent = '';
  try {
    const input = balanceInput();
    const r = balance(input);
    renderBalance(r, r.caregiver ? null : compareMethods(input));
    lastBal = input;
  } catch (e) {
    if (!(e instanceof FmlaError)) throw e;
    lastBal = null;
    $('fm-bal-err').textContent = e.message;
  }
  if (buy) buy.refresh();
}
function recomputeConv() {
  try {
    $('fm-conv-out').textContent = entitlement({ weeklyHours: $('fm-cw').value.trim(), weeks: Number($('fm-cn').value) }).answer;
  } catch (e) {
    if (!(e instanceof FmlaError)) throw e;
    $('fm-conv-out').textContent = e.message;
  }
}

// ---------- the leave record ----------

function download(name, body) {
  return h('a', { href: URL.createObjectURL(body), download: name }, name);
}
function recordInput() {
  if (!lastBal) return null;
  const employee = $('fm-employee').value.trim();
  if (!employee) return null;
  const { op, ...bal } = lastBal;
  const out = { op: 'record', employee, ...bal };
  if ($('fm-withcheck').checked && lastCheck) {
    const { op: _o, ...c } = lastCheck;
    out.check = c;
  }
  return out;
}
let buy = null;
function buyBox(el) {
  const price = h('p', { class: 'fm-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Download the leave record');
  const got = h('p', { class: 'fm-got', role: 'status' });
  const err = h('p', { class: 'form-error', role: 'alert' });
  const words = () => {
    const text = tool?.pricing?.actions.find((a) => a.name === 'record')?.text;
    return text ? T.money(text) : '';
  };
  button.addEventListener('click', async () => {
    err.textContent = '';
    const input = recordInput();
    if (!input) { err.textContent = lastBal ? 'Name the employee first.' : 'Fix the leave lines above first.'; return; }
    button.disabled = true;
    try {
      const json = await T.run(SLUG, input);
      const r = json.result;
      got.textContent = '';
      const charged = json.charged ? (json.charged.amount ? ` Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : ' Free: an update for the same employee.') : '';
      got.append('Your record: ', download(r.filename, new Blob([r.csv], { type: 'text/csv' })), ' and ', download(r.filename.replace(/\.csv$/, '.json'), new Blob([JSON.stringify({ employee: r.employee, eligibility: r.eligibility, notice: r.notice, balance: { ...r.balance, rows: undefined }, compare: r.compare, sources: r.sources }, null, 2)], { type: 'application/json' })), `.${charged}`);
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
        const input = recordInput();
        if (!signedIn) { price.textContent = `${words()}. Sign in to download.`; return; }
        if (!input) { price.textContent = words(); return; }
        try {
          const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
          price.textContent = q.amount ? `This record costs ${q.display} from your balance (${words()}).` : `This record is free for you now (${words()}).`;
        } catch {
          price.textContent = words();
        }
      }, 300);
    },
  };
}

// ---------- the address ----------

// ?leave=2026-12-01&notice=2026-11-05&periods=2024-03-04&hours=1612&where=home&reports=HQ&sites=64
// &type=private&w50=52&method=rolling&ly=07-01&weekly=40&asof=2026-11-10&kind=12&used=...&requested=...
// &cw=36&cn=12. Multi-line fields take their lines separated by new lines or "|".
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const lines = (v) => v.split('|').join('\n');
  const set = (id, key, ok = () => true, map = (v) => v) => { const v = q.get(key); if (v !== null && v.length <= 4000 && ok(v)) $(id).value = map(v); };
  const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
  set('fm-leave', 'leave', isDate);
  set('fm-notice', 'notice', isDate);
  set('fm-periods', 'periods', () => true, lines);
  set('fm-hours', 'hours');
  set('fm-userra', 'userra');
  set('fm-where', 'where', (v) => ['site', 'home', 'no-fixed-site'].includes(v));
  set('fm-reports', 'reports');
  set('fm-sites', 'sites', () => true, lines);
  set('fm-type', 'type', (v) => ['private', 'public-agency', 'school'].includes(v));
  set('fm-weeks50', 'w50');
  set('fm-method', 'method', (v) => Object.keys(METHOD_NAMES).includes(v));
  set('fm-ly', 'ly');
  set('fm-weekly', 'weekly');
  set('fm-asof', 'asof', isDate);
  set('fm-kind', 'kind', (v) => v === '12' || v === '26');
  set('fm-used', 'used', () => true, lines);
  set('fm-requested', 'requested', () => true, lines);
  set('fm-cw', 'cw');
  set('fm-cn', 'cn', (v) => v === '12' || v === '26');
  if (q.get('crew') === '1') $('fm-crew').checked = true;
  if (q.get('norecords') === '1') $('fm-norecords').checked = true;
  if (q.get('oldservice') === '1') $('fm-oldservice').checked = true;
  if (q.has('type') || q.has('w50')) $('fm-more').open = true;
  // A link that sets only the balance, or only the hours, clears the other example so it is not
  // mistaken for the visitor's own.
  const has = (keys) => keys.some((k) => q.has(k));
  // A linked employee brings their own worksite: the example's office and telework do not carry over.
  if (has(['leave', 'periods', 'sites']) && !q.has('reports')) $('fm-reports').value = '';
  if (has(['leave', 'periods', 'sites']) && !q.has('where')) $('fm-where').value = 'site';
  if (has(['used', 'weekly', 'method']) && !q.has('requested')) $('fm-requested').value = '';
  return { check: has(['leave', 'periods', 'hours', 'sites']), balance: has(['used', 'weekly', 'method', 'asof']) };
}

// ---------- start ----------

const EXAMPLE_LINE = 'Example: teleworker reporting to Headquarters (210 employees; Suburban office 90 at 28 miles), hired March 4, 2024, 1,612 hours, leave from December 1, 2026, asked for November 5';
const soon = (fn, ms = 200) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

async function start() {
  T.mountCodePanel($('fm-code'), SLUG);
  const linked = fromQuery();
  recomputeCheck();
  recomputeBalance();
  recomputeConv();
  // The page opens on the first worked example, tagged as one; the visitor's own facts replace it.
  if (!linked.check && lastCheck) $('fm-out').prepend(h('div', { class: 'tf-res-h' }, [h('span', { class: 'ex-tag' }, 'Example'), h('p', { class: 'fm-label' }, 'Worked example')]), h('p', { class: 'tf-exin' }, EXAMPLE_LINE));
  if (!linked.balance && lastBal) $('fm-bal-out').prepend(h('div', { class: 'tf-res-h' }, [h('span', { class: 'ex-tag' }, 'Example'), h('p', { class: 'fm-label' }, 'Worked example')]));
  for (const [form, fn] of [['fm-check', recomputeCheck], ['fm-bal', recomputeBalance], ['fm-conv', recomputeConv]]) {
    $(form).addEventListener('submit', (e) => { e.preventDefault(); fn(); });
    $(form).addEventListener('input', soon(fn));
    $(form).addEventListener('change', fn);
  }
  for (const id of ['fm-employee', 'fm-withcheck']) $(id).addEventListener('input', () => buy && buy.refresh());
  try { tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool; } catch { tool = null; }
  buy = buyBox($('fm-buy'));
  try { signedIn = !!(await T.me()); } catch { signedIn = false; }
  buy.refresh();
}

start();
