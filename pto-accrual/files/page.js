// The PTO and sick leave page. The rules live on the server (data/rules.json is never served), so every
// answer is the server's, through Endwise.run: free on this page for all four forms.
const T = window.Endwise;
const h = T.h;
const SLUG = 'pto-accrual';
const $ = (id) => document.getElementById(id);

// The places (the tests check these lists against the data).
export const STATES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
export const COVERED = ['AK', 'AZ', 'CA', 'CO', 'CT', 'DC', 'IL', 'MA', 'MD', 'ME', 'MI', 'MN', 'NJ', 'NY', 'OR', 'VA', 'VT', 'WA'];
export const CITIES = { chicago: 'Chicago, IL', 'los-angeles': 'Los Angeles, CA', 'montgomery-county-md': 'Montgomery County, MD', 'new-york-city': 'New York City, NY', philadelphia: 'Philadelphia, PA', 'saint-paul': 'Saint Paul, MN', seattle: 'Seattle, WA' };
export const VACATION = ['CT', 'IA', 'IL', 'MD', 'ME', 'ND', 'OK', 'OR', 'SC', 'SD', 'TN', 'TX', 'VT', 'WV', 'WY'];

const val = (id) => $(id).value.trim();
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const num = (v, label) => {
  const n = Number(String(v).replace(/,/g, ''));
  if (!Number.isFinite(n)) throw new Error(`${label} must be a number.`);
  return n;
};
const byName = (obj) => Object.entries(obj).sort((a, b) => a[1].localeCompare(b[1]));

function fillPlaces(id, value) {
  $(id).replaceChildren(
    h('optgroup', { label: 'States with a sick leave law we read' }, byName(STATES).filter(([c]) => COVERED.includes(c)).map(([c, n]) => h('option', { value: c }, n))),
    h('optgroup', { label: 'Cities and counties' }, byName(CITIES).map(([c, n]) => h('option', { value: c }, n))),
    h('optgroup', { label: 'Other states (PTO bank only)' }, byName(STATES).filter(([c]) => !COVERED.includes(c)).map(([c, n]) => h('option', { value: c }, n))),
  );
  $(id).value = value;
}
function fillStates(id, value) {
  $(id).replaceChildren(
    h('optgroup', { label: 'Vacation rule read' }, byName(STATES).filter(([c]) => VACATION.includes(c)).map(([c, n]) => h('option', { value: c }, n))),
    h('optgroup', { label: 'Not read yet' }, byName(STATES).filter(([c]) => !VACATION.includes(c)).map(([c, n]) => h('option', { value: c }, n))),
  );
  $(id).value = value;
}

// ---------- inputs ----------

function accrueInput() {
  const input = { op: 'accrue', place: val('pa-place'), frequency: val('pa-freq'), firstPeriodEnd: val('pa-first'), hoursPerPeriod: num(val('pa-hours'), 'Hours'), periods: num(val('pa-periods'), 'Pay periods') };
  if (val('pa-emp')) input.employees = num(val('pa-emp'), 'Employees');
  if (val('pa-hire')) input.hireDate = val('pa-hire');
  if (val('pa-ystart') && val('pa-ystart') !== '01-01') input.yearStart = val('pa-ystart');
  const sick = {};
  if (val('pa-method') === 'frontload') sick.method = 'frontload';
  if (!$('pa-caps').checked) sick.applyCaps = false;
  if (Object.keys(sick).length) input.sick = sick;
  if (val('pa-pto')) {
    input.pto = { annualHours: num(val('pa-pto'), 'PTO hours') };
    if (val('pa-ptocap')) input.pto.cap = num(val('pa-ptocap'), 'Balance cap');
    if (val('pa-ptocarry')) input.pto.carryCap = num(val('pa-ptocarry'), 'Carryover limit');
  }
  const use = val('pa-use').split(/[\s,]+/).filter(Boolean).map((x) => {
    const [p, hrs] = x.split(':');
    return { period: num(p, 'Used period'), sick: num(hrs, 'Used hours') };
  });
  if (use.length) input.use = use;
  return input;
}
function payoutInput() {
  const input = { op: 'payout', state: val('pa-pstate'), ptoHours: num(val('pa-ptoh') || 0, 'PTO hours'), rate: val('pa-rate') };
  if (val('pa-sickh')) input.sickHours = num(val('pa-sickh'), 'Sick hours');
  if ($('pa-combined').checked) input.combined = true;
  return input;
}
const perInput = () => ({ op: 'per-period', annualHours: num(val('pa-annual'), 'PTO hours') });
const rulesInput = () => ({ op: 'rules', place: val('pa-rplace') });

// ---------- answers ----------

const quotes = (list) => (list?.length ? h('ul', { class: 'pa-quotes' }, list.map((q) => h('li', {}, [
  h('q', {}, q.quote), ' ', h('a', { href: q.url, rel: 'noopener' }, q.source), q.readOn ? `, read ${q.readOn}` : '',
]))) : null);
const fmt = (n) => (n === null || n === undefined ? '' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 }));

// Each result like the other tool pages: a header row with its tag and source, the big figure,
// the answer, one line per figure with where it comes from, and the long parts folded.
const head = (src) => h('div', { class: 'tf-rh' }, [h('span', { class: 'tf-tag run' }, 'Your result'), h('span', { class: 'tf-src' }, src)]);
const item = (k, what, v, why, cls = null) => h('li', { class: cls }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), v ? h('b', {}, v) : null, h('em', {}, why)]);
const fold = (title, ...kids) => h('details', { class: 'xpand' }, [h('summary', {}, title), h('div', { class: 'xp-in' }, kids)]);

function showAccrue(r, el) {
  el.replaceChildren();
  const s = r.totals.sick;
  const p = r.totals.pto;
  const used = r.rows.filter((x) => x.sick?.used).map((x) => `${fmt(x.sick.used)} hours in paycheck ${x.n}`);
  el.append(head(r.place.cite ? `${r.place.name} · ${r.place.cite}` : r.place.name));
  if (s || p) el.append(h('p', { class: 'tf-big' }, [h('b', {}, `${fmt((s ?? p).balance)} h`), h('span', {}, s ? 'of sick time at the end' : 'of PTO at the end')]));
  el.append(h('p', { class: 'tf-sub' }, r.answer));
  el.append(h('ul', { class: 'tf-items' }, [
    s ? item('+', 'Sick time earned', `${fmt(s.earned)} h`, r.tier ? `${r.tier.rule.split(';')[0]} on ${fmt(r.totals.hours)} hours, ${r.place.cite ?? r.place.name}` : `on ${fmt(r.totals.hours)} hours`) : null,
    s && s.used ? item('-', 'Sick time used', `${fmt(s.used)} h`, `your entry: ${used.join(', ') || 'time used'}`) : null,
    s ? item('=', 'Sick balance', `${fmt(s.balance)} h`, r.tier?.rule.split('; ')[1] ?? 'what is left at the end', 'tot') : null,
    p ? item('P', 'PTO balance', `${fmt(p.balance)} h`, `your policy: ${r.policy?.text ?? `${fmt(p.earned)} hours earned`}${p.used ? `, ${fmt(p.used)} used` : ''}`) : null,
  ]));
  if (r.refused.length) el.append(h('ul', { class: 'pa-list pa-warn' }, r.refused.map((x) => h('li', {}, `Paycheck ${x.period}: ${fmt(x.hours)} ${x.bank} hours not allowed (${x.reason}).`))));
  if (r.events.length) el.append(h('ul', { class: 'pa-list' }, r.events.map((e) => h('li', {}, e))));
  if (r.notes?.length) el.append(h('ul', { class: 'pa-list' }, r.notes.map((n) => h('li', {}, n))));
  const cols = ['#', 'Period ends', 'Hours', ...(s ? ['Sick earned', 'Sick used', 'Sick balance'] : []), ...(p ? ['PTO earned', 'PTO used', 'PTO balance'] : [])];
  const rows = r.rows.map((x) => [x.n, x.end, fmt(x.hours), ...(x.sick ? [fmt(x.sick.earned), fmt(x.sick.used), fmt(x.sick.balance)] : []), ...(x.pto ? [fmt(x.pto.earned), fmt(x.pto.used), fmt(x.pto.balance)] : [])]);
  el.append(fold(`Paycheck by paycheck (${r.rows.length})`,
    h('div', { class: 'pa-scroll' }, h('table', {}, [h('thead', {}, h('tr', {}, cols.map((c) => h('th', {}, c)))), h('tbody', {}, rows.map((row) => h('tr', {}, row.map((c) => h('td', {}, String(c))))))]))));
  if (r.quotes?.length) el.append(fold('The law\'s words', quotes(r.quotes)));
}
function showPayout(r, el) {
  el.replaceChildren(head(r.pto.rule ? `${r.name} · ${r.pto.rule.cite}` : r.name), h('p', { class: 'tf-big' }, [h('b', {}, r.owedByLaw), h('span', {}, 'owed by state law')]), h('p', { class: 'tf-sub' }, r.answer),
    h('ul', { class: 'tf-items' }, [
      item('P', 'Unused PTO', r.pto.amount, `${r.pto.hours} hours at ${r.rate}${r.pto.rule ? `; ${r.pto.rule.cite}` : ''}`),
      item('S', 'Unused sick time', r.sick.amount, `${r.sick.hours} hours at ${r.rate}${r.sick.rule ? `; ${r.sick.rule.cite}` : ''}`, 'dim'),
      item('=', 'Owed by state law', r.owedByLaw, 'from the state\'s own words, below', 'tot'),
    ]));
  el.append(h('p', { class: 'tf-note' }, [r.deadline.text.replace(/the final paycheck deadline tool\.$/, ''), h('a', { href: `${T.base}/final-paycheck-deadline/?state=${encodeURIComponent(r.state)}` }, 'the final paycheck deadline tool'), '.']));
  if (r.quotes?.length) el.append(fold('The state\'s words', quotes(r.quotes)));
}
function showPer(r, el) {
  el.replaceChildren(head('arithmetic'), h('p', { class: 'tf-sub' }, r.answer),
    h('ul', { class: 'tf-items' }, [...r.rows.map((x) => item('h', x.frequency, `${x.hours.toFixed(2)} h`, 'hours a paycheck')), item('/', 'per hour worked', String(r.perHourWorked), 'on 2,080 hours a year')]));
}
function showRules(r, el) {
  el.replaceChildren(head(r.covered ? r.law ?? r.name : 'Not covered'), h('p', { class: 'tf-sub' }, r.answer));
  if (r.facts?.length) el.append(h('ul', { class: 'tf-items' }, r.facts.map((f) => item('§', f.text, null, f.cite))));
  if (r.notes?.length) el.append(h('ul', { class: 'pa-list' }, r.notes.map((n) => h('li', {}, n))));
  if (r.quotes?.length) el.append(fold('The law\'s words', quotes(r.quotes)));
}

// ---------- running ----------

function runner(out, err, make, show) {
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

// ?place=WA&employees=20&freq=biweekly&first=2027-01-08&hours=44&periods=26&pto=80&ptocap=&ptocarry=
// &method=frontload&use=10:8 ; ?state=IL&ptohours=64&sickhours=20&rate=28 ; ?annual=120 ; ?rules=seattle
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const set = (id, key, ok = () => true) => { const v = q.get(key); if (v !== null && v.length <= 60 && ok(v)) $(id).value = v; };
  const isPlace = (v) => Object.hasOwn(STATES, v.toUpperCase()) || Object.hasOwn(CITIES, v.toLowerCase());
  const pl = q.get('place');
  if (pl && isPlace(pl)) $('pa-place').value = Object.hasOwn(CITIES, pl.toLowerCase()) ? pl.toLowerCase() : pl.toUpperCase();
  set('pa-emp', 'employees', (v) => /^\d+$/.test(v));
  set('pa-freq', 'freq', (v) => ['weekly', 'biweekly', 'semimonthly', 'monthly'].includes(v));
  set('pa-first', 'first', isDate);
  set('pa-hours', 'hours');
  set('pa-periods', 'periods', (v) => /^\d+$/.test(v));
  set('pa-pto', 'pto');
  set('pa-ptocap', 'ptocap');
  set('pa-ptocarry', 'ptocarry');
  set('pa-method', 'method', (v) => ['accrue', 'frontload'].includes(v));
  set('pa-use', 'use');
  if (q.has('method') || q.has('use')) $('pa-more').open = true;
  const st = q.get('state')?.toUpperCase();
  if (st && Object.hasOwn(STATES, st)) $('pa-pstate').value = st;
  set('pa-ptoh', 'ptohours');
  set('pa-sickh', 'sickhours');
  set('pa-rate', 'rate');
  if (q.get('combined') === '1') $('pa-combined').checked = true;
  set('pa-annual', 'annual');
  const rp = q.get('rules');
  if (rp && isPlace(rp)) $('pa-rplace').value = Object.hasOwn(CITIES, rp.toLowerCase()) ? rp.toLowerCase() : rp.toUpperCase();
  return { acc: q.has('place') || q.has('hours'), pay: q.has('state') || q.has('ptohours'), per: q.has('annual'), rul: q.has('rules') };
}

const soon = (fn, ms = 350) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

function start() {
  fillPlaces('pa-place', 'WA');
  fillPlaces('pa-rplace', 'seattle');
  fillStates('pa-pstate', 'IL');
  $('pa-coverage').textContent = `Sick leave covered: ${COVERED.map((c) => STATES[c]).join(', ')}; ${byName(CITIES).map(([, n]) => n).join('; ')}. Vacation payout rule read: ${VACATION.map((c) => STATES[c]).join(', ')}. Every other state works for the PTO bank only.`;
  T.mountCodePanel($('pa-code'), SLUG);
  const linked = fromQuery();
  const acc = runner('pa-acc-out', 'pa-acc-err', accrueInput, showAccrue);
  const pay = runner('pa-pay-out', 'pa-pay-err', payoutInput, showPayout);
  const per = runner('pa-per-out', 'pa-per-err', perInput, showPer);
  const rul = runner('pa-rul-out', 'pa-rul-err', rulesInput, showRules);
  for (const [form, fn] of [['pa-acc', acc], ['pa-pay', pay], ['pa-per', per], ['pa-rul', rul]]) {
    $(form).addEventListener('submit', (e) => { e.preventDefault(); fn(); });
    $(form).addEventListener('input', soon(fn));
    $(form).addEventListener('change', soon(fn));
  }
  // The worked examples stay as written until the visitor changes something (no run used at rest),
  // unless the address carried their own case.
  if (linked.acc) acc();
  if (linked.pay) pay();
  if (linked.per) per();
  if (linked.rul) rul();
}

start();
