// The final paycheck page. The state rules live on the server (data/states.json is never served), so
// every answer is the server's, through Endwise.run: free on this page for all three forms.
const T = window.Endwise;
const h = T.h;
const SLUG = 'final-paycheck-deadline';
const $ = (id) => document.getElementById(id);

// The states, and the ones whose own sites we have read (the tests check this list against the data).
export const STATES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
export const COVERED = ['AK', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'HI', 'IA', 'ID', 'IL', 'KS', 'KY', 'MA', 'MD', 'ME', 'MI', 'MN', 'MT', 'NC', 'ND', 'NH', 'NJ', 'NY', 'OK', 'OR', 'PA', 'SC', 'SD', 'TN', 'TX', 'VA', 'VT', 'WA', 'WV', 'WY'];

const val = (id) => $(id).value.trim();
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);

function fillStates(id, value) {
  const sel = $(id);
  const byName = Object.entries(STATES).sort((a, b) => a[1].localeCompare(b[1]));
  sel.replaceChildren(
    h('optgroup', { label: 'Covered' }, byName.filter(([c]) => COVERED.includes(c)).map(([c, n]) => h('option', { value: c }, n))),
    h('optgroup', { label: 'Not covered yet' }, byName.filter(([c]) => !COVERED.includes(c)).map(([c, n]) => h('option', { value: c }, n))),
  );
  sel.value = value;
}

// ---------- inputs ----------

function deadlineInput() {
  const input = { op: 'deadline', state: val('fp-state'), separation: val('fp-sep'), separatedAt: val('fp-date') + (val('fp-time') ? `T${val('fp-time')}` : '') };
  const freq = val('fp-freq');
  if (freq === 'weekly' || freq === 'biweekly') input.schedule = { frequency: freq, anchor: val('fp-anchor') || val('fp-payday') };
  else if (freq === 'semimonthly') input.schedule = { frequency: 'semimonthly', days: [15, 31] };
  else if (freq === 'monthly') input.schedule = { frequency: 'monthly', day: 31 };
  else if (val('fp-payday')) input.nextPayday = val('fp-payday');
  if (val('fp-notice')) input.noticeDate = val('fp-notice');
  if (val('fp-ntime')) input.noticeTime = val('fp-ntime');
  if (val('fp-period')) input.periodPayday = val('fp-period');
  if (val('fp-pend')) input.periodEnd = val('fp-pend');
  if (val('fp-request')) { input.requestDate = val('fp-request'); input.options = { ...input.options, writtenRequest: true }; }
  if (val('fp-demand')) input.demandAt = val('fp-demand');
  if ($('fp-policy').checked) input.options = { ...input.options, writtenPolicy: true };
  const closed = val('fp-closed').split(/[\s,]+/).filter(Boolean);
  if (closed.length) input.closedDays = closed;
  return input;
}
function deductionInput() {
  const input = { op: 'deductions', state: val('fp-dstate'), topic: val('fp-topic') };
  if (val('fp-amount')) input.amount = val('fp-amount');
  if (val('fp-gross') && val('fp-hours')) input.finalWeek = { gross: val('fp-gross'), hours: Number(val('fp-hours')) };
  if (val('fp-mw')) input.minimumWage = val('fp-mw');
  return input;
}
function penaltyInput() {
  const input = { op: 'penalty', state: val('fp-pstate'), unpaid: val('fp-unpaid'), dueDate: val('fp-due'), paidDate: val('fp-paid') };
  if (val('fp-hourly')) input.hourlyRate = val('fp-hourly');
  if (val('fp-daily')) input.dailyRate = val('fp-daily');
  return input;
}

// ---------- answers ----------

const quotes = (list) => (list?.length ? h('ul', { class: 'fp-quotes' }, list.map((q) => h('li', {}, [
  h('q', {}, q.quote), ' ', h('a', { href: q.url, rel: 'noopener' }, q.source), q.readOn ? `, read ${q.readOn}` : '',
]))) : null);

// One line per figure: what it is, the figure, and where it comes from.
const item = (label, value, src, key = false) => h('li', key ? { class: 'key' } : {}, [h('span', {}, label), h('b', {}, value), h('small', {}, src)]);
const items = (list) => h('ul', { class: 'tf-items' }, list);
const head = (text) => h('div', { class: 'tf-res-h' }, h('p', { class: 'fp-label' }, text));
const shortDate = (iso) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
const clock = (t) => { if (!t) return ''; const [hh, mm] = t.split(':').map(Number); return `, ${((hh + 11) % 12) + 1}:${String(mm).padStart(2, '0')} ${hh < 12 ? 'am' : 'pm'}`; };
const SEP = { discharge: 'fired', layoff: 'laid off', quit: 'quit' };

function showDeadline(r, el) {
  el.replaceChildren();
  if (!r.covered) {
    el.append(head('Not covered'), h('p', { class: 'fp-sub' }, r.answer));
    return;
  }
  el.append(head('Your deadline'));
  if (r.due) {
    el.append(h('p', { class: 'fp-big tf-big' }, [r.due.time ? r.due.text : r.due.text.replace(/^the end of /, ''), h('small', {}, r.due.time ? r.due.how : `by the end of the day: ${r.due.how}`)]));
    el.append(items([
      item(`Separated (${SEP[r.separation] ?? r.separation})`, `${shortDate(r.separatedAt.date)}${clock(r.separatedAt.time)}`, 'you entered'),
      item(`The rule: ${r.rule}`, r.stateName, r.cite),
      item('Final paycheck due', `${shortDate(r.due.date)}${clock(r.due.time)}`, r.due.how, true),
    ]));
  }
  el.append(h('p', { class: 'fp-sub' }, r.answer));
  for (const n of r.needs ?? []) el.append(h('p', { class: 'fp-need' }, n.text));
  if (r.notes?.length) el.append(h('ul', { class: 'fp-list' }, r.notes.map((n) => h('li', {}, n))));
  if (r.holidaysSkipped?.length) el.append(h('p', { class: 'small muted' }, `Holidays skipped: ${r.holidaysSkipped.map((x) => `${x.name} (${x.date})`).join(', ')}.`));
  el.append(h('p', { class: 'fp-heading' }, 'The state\'s words'), quotes(r.quotes));
  if (r.penalty) el.append(h('p', { class: 'fp-heading' }, 'If it is late'), h('p', { class: 'fp-sub' }, r.penalty.text));
}
function showDeduction(r, el) {
  el.replaceChildren(head(r.covered ? r.verdictText : 'Not covered'));
  if (r.floor) el.append(h('p', { class: 'fp-big tf-big' }, [`${r.floor.maxDeduction} at most`, h('small', {}, `can come out of that final week; ${r.floor.deduction} is ${r.covered ? r.verdictText : 'not covered here'}`)]));
  el.append(h('p', { class: 'fp-sub' }, r.answer));
  if (r.floor) {
    const f = r.floor;
    el.append(items([
      item('Final week\'s gross pay', f.gross, 'you entered'),
      item('Deduction', f.deduction, 'you entered'),
      item(`Left for ${f.hours} hours`, `${f.net} (${f.netPerHour} an hour)`, 'gross less the deduction'),
      item('Minimum wage floor', f.minimumWage, f.rateFrom),
      item('Most you can take that week', f.maxDeduction, '29 CFR 531.35: not below the minimum wage', true),
    ]));
  }
  if (r.notes?.length) el.append(h('ul', { class: 'fp-list' }, r.notes.map((n) => h('li', {}, n))));
  if (r.quotes?.length) el.append(h('p', { class: 'fp-heading' }, 'The state\'s words'), quotes(r.quotes));
  if (r.federal) el.append(h('p', { class: 'small muted' }, [r.federal.text, ' ', h('a', { href: r.federal.url, rel: 'noopener' }, '29 CFR 531.35')]));
}
function showPenalty(r, el) {
  el.replaceChildren(head('Your late check'));
  if (r.amount) {
    el.append(h('p', { class: 'fp-big tf-big' }, [r.amount, h('small', {}, `on top of ${r.unpaid} of wages, ${r.daysLate} days late`)]));
    el.append(items([
      item('Final wages unpaid', r.unpaid, 'you entered'),
      item('Days late', String(r.daysLate), `due ${shortDate(r.dueDate)}, paid ${shortDate(r.paidDate)}`),
      item('Penalty on top of the wages', r.amount, r.math, true),
    ]));
  }
  el.append(h('p', { class: 'fp-sub' }, r.answer));
  if (r.quotes?.length) el.append(h('p', { class: 'fp-heading' }, 'The state\'s words'), quotes(r.quotes));
}

// ---------- running ----------

function runner(form, out, err, make, show) {
  let seq = 0;
  return async () => {
    const mine = ++seq;
    $(err).textContent = '';
    let input;
    try { input = make(); } catch (e) { $(err).textContent = e.message; return; }
    try {
      const res = await T.run(SLUG, input);
      if (mine !== seq) return;
      show(res.result ?? res, $(out));
    } catch (e) {
      if (mine !== seq) return;
      const fields = e.fields ? Object.values(e.fields).join(' ') : '';
      $(err).textContent = fields || e.message;
    }
  };
}

// ?state=TX&sep=quit&date=2026-11-13&time=16:00&payday=2026-11-20&freq=biweekly&anchor=...&notice=...
// &topic=advance&amount=320&gross=600&hours=40&unpaid=1840&due=2026-11-27&paid=2026-12-04&hourly=23
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const set = (id, key, ok = () => true) => { const v = q.get(key); if (v !== null && v.length <= 40 && ok(v)) $(id).value = v; };
  const st = (v) => Object.hasOwn(STATES, v.toUpperCase());
  const up = q.get('state')?.toUpperCase();
  if (up && st(up)) for (const id of ['fp-state', 'fp-dstate', 'fp-pstate']) $(id).value = up;
  set('fp-sep', 'sep', (v) => ['discharge', 'layoff', 'quit'].includes(v));
  set('fp-date', 'date', isDate);
  set('fp-time', 'time', (v) => /^\d{2}:\d{2}$/.test(v));
  if (q.has('date') && !q.has('time')) $('fp-time').value = '';
  set('fp-payday', 'payday', isDate);
  set('fp-freq', 'freq', (v) => ['weekly', 'biweekly', 'semimonthly', 'monthly'].includes(v));
  set('fp-anchor', 'anchor', isDate);
  set('fp-notice', 'notice', isDate);
  set('fp-topic', 'topic', (v) => ['equipment', 'advance', 'shortage', 'overpayment', 'benefits', 'other'].includes(v));
  set('fp-amount', 'amount');
  set('fp-gross', 'gross');
  set('fp-hours', 'hours');
  set('fp-unpaid', 'unpaid');
  set('fp-due', 'due', isDate);
  set('fp-paid', 'paid', isDate);
  set('fp-hourly', 'hourly');
  set('fp-daily', 'daily');
  if (q.has('notice')) $('fp-more').open = true;
  return q.has('state') || q.has('date');
}

const soon = (fn, ms = 350) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

function start() {
  fillStates('fp-state', 'TX');
  fillStates('fp-dstate', 'KS');
  fillStates('fp-pstate', 'OR');
  $('fp-coverage').textContent = `Covered: ${COVERED.map((c) => STATES[c]).join(', ')}. Not covered yet: ${Object.keys(STATES).filter((c) => !COVERED.includes(c)).map((c) => STATES[c]).join(', ')}.`;
  T.mountCodePanel($('fp-code'), SLUG);
  const linked = fromQuery();
  const dl = runner('fp-dl', 'fp-dl-out', 'fp-dl-err', deadlineInput, showDeadline);
  const ded = runner('fp-ded', 'fp-ded-out', 'fp-ded-err', deductionInput, showDeduction);
  const pen = runner('fp-pen', 'fp-pen-out', 'fp-pen-err', penaltyInput, showPenalty);
  for (const [form, fn] of [['fp-dl', dl], ['fp-ded', ded], ['fp-pen', pen]]) {
    $(form).addEventListener('submit', (e) => { e.preventDefault(); fn(); });
    $(form).addEventListener('input', soon(fn));
    $(form).addEventListener('change', soon(fn));
  }
  // The worked examples stay as written until the visitor changes something (no run used at rest),
  // unless the address carried their own case.
  if (linked) { dl(); ded(); pen(); }
}

start();
