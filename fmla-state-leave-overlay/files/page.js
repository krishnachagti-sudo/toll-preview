// The state leave overlay page. The state rules live on the server (data/programs.json is never
// served), so every answer is the server's, through Endwise.run: the overlay is free on this page,
// the case plan is the paid output.
const T = window.Endwise;
const h = T.h;
const SLUG = 'fmla-state-leave-overlay';
const $ = (id) => document.getElementById(id);

// The states, and the ones whose own sites we have read (the tests check these lists against the data).
export const STATES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
export const COVERED = ['CA', 'CO', 'CT', 'DC', 'DE', 'IA', 'MD', 'ME', 'MN', 'MT', 'NJ', 'NY', 'OR', 'WA'];
export const BLOCKED = ['HI', 'MA', 'RI', 'VA'];
const REASONS = ['birth', 'bonding', 'own', 'care', 'military'];

const val = (id) => $(id).value.trim();
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);

function fillStates(value) {
  const sel = $('so-state');
  const byName = Object.entries(STATES).sort((a, b) => a[1].localeCompare(b[1]));
  const group = (label, test) => h('optgroup', { label }, byName.filter(([c]) => test(c)).map(([c, n]) => h('option', { value: c }, n)));
  sel.replaceChildren(
    group('State laws covered', (c) => COVERED.includes(c)),
    group('State site could not be read', (c) => BLOCKED.includes(c)),
    group('FMLA only', (c) => !COVERED.includes(c) && !BLOCKED.includes(c)),
  );
  sel.value = value;
}

function caseInput() {
  const input = { state: val('so-state'), reason: val('so-reason'), startDate: val('so-start'), hireDate: val('so-hire'), hours12: val('so-hours'), employees: val('so-emp') };
  if (val('so-instate')) input.employeesInState = val('so-instate');
  if (val('so-75')) input.employeesWithin75 = val('so-75');
  if (val('so-public') === 'public') input.employer = 'public';
  if (input.reason === 'birth') {
    if (val('so-dis')) input.disabilityWeeks = val('so-dis');
    if ($('so-incap').checked) input.incapacity = true;
  }
  if (!$('so-earn').checked) input.meetsEarnings = false;
  return input;
}

// ---------- answers ----------

const STATUS = { yes: 'Applies', if: 'Applies if the state\'s conditions are met', no: 'Does not apply', 'not-yet': 'Not in force yet', none: '', 'n/a': 'Does not cover this reason' };
const PART = { pregnancy: 'Pregnancy disability', bonding: 'Bonding', own: 'Own health', care: 'Family care', military: 'Military exigency' };
const wk = (w) => (w === null ? 'as certified' : String(w));

const quotes = (list) => (list?.length ? h('ul', { class: 'so-quotes' }, list.map((q) => h('li', {}, [h('q', {}, q.quote), ' ', h('a', { href: q.url, rel: 'noopener' }, q.source)]))) : null);

function lawCard(l) {
  const lines = [];
  if (l.job && l.job !== 'none') lines.push(`Job protection: ${STATUS[l.job] ?? l.job}`);
  if (l.paid && l.paid !== 'none') lines.push(`Pay: ${STATUS[l.paid] ?? l.paid}`);
  return h('details', { class: 'so-law' }, [
    h('summary', {}, [h('strong', {}, l.name), h('span', { class: 'so-tag' }, l.covers ? lines.join(' · ') || 'Listed' : STATUS['n/a'])]),
    l.why?.length ? h('ul', { class: 'so-list' }, l.why.map((w) => h('li', {}, w))) : null,
    h('p', { class: 'so-sub' }, `With the FMLA: ${l.fmla}`),
    quotes(l.quotes),
  ]);
}

function showOverlay(r, el) {
  el.replaceChildren();
  const t = r.totals;
  el.append(h('div', { class: 'tf-res-h' }, h('p', { class: 'so-label' }, 'Your case')));
  el.append(h('p', { class: 'so-big tf-big' }, [`${t.protectedWeeks} weeks protected`, h('small', {}, t.paidWeeks === null ? 'paid for as long as the provider certifies' : t.paidWeeks ? `${t.paidAtLeast ? 'at least ' : ''}${t.paidWeeks} of them paid by the state` : 'none of them paid by a state program')]));
  // One line per part of the leave, with the laws that protect and pay it.
  const by = (list) => list.map((x) => `${x.short} ${x.weeks}`).join(', ') || 'none';
  if (r.parts?.length) {
    el.append(h('ul', { class: 'tf-items' }, [
      ...r.parts.map((p) => h('li', {}, [
        h('span', {}, `${PART[p.reason]}: ${p.protectedWeeks} weeks protected, ${wk(p.paidWeeks)} paid`),
        h('b', {}, `${wk(p.weeks)} wk`),
        h('small', {}, `protected by ${by(p.protectedBy)}; paid by ${by(p.paidBy)}`),
      ])),
      h('li', { class: 'key' }, [h('span', {}, 'Job-protected in total'), h('b', {}, `${t.protectedWeeks} wk`), h('small', {}, t.paidWeeks === null ? 'paid for as long as the provider certifies' : `${t.paidAtLeast ? 'at least ' : ''}${t.paidWeeks} of them paid by the state`)]),
    ]));
  }
  el.append(h('p', { class: 'so-sub' }, r.answer));
  for (const u of t.unprotected ?? []) el.append(h('p', { class: 'so-need' }, `${u.weeks} weeks of ${PART[u.reason].toLowerCase()} are not job-protected by any law here.`));
  el.append(h('p', { class: 'so-heading' }, 'Federal FMLA'), h('p', { class: 'so-sub' }, [r.federal.answer, ' ', h('a', { href: `${T.base}/fmla-eligibility-checker/` }, 'Check it in detail')]));
  if (r.laws?.length) el.append(h('p', { class: 'so-heading' }, 'State laws'), ...r.laws.map(lawCard));
  if (r.notices?.length) el.append(h('p', { class: 'so-heading' }, 'Notices'), h('ul', { class: 'so-list' }, r.notices.map((n) => h('li', {}, [h('strong', {}, `${n.who}: `), n.text]))));
  if (r.notes?.length) el.append(h('p', { class: 'so-heading' }, 'Notes'), h('ul', { class: 'so-list' }, r.notes.map((n) => h('li', {}, n))));
}

function showPlan(r, el) {
  showOverlay(r, el);
  el.append(h('p', { class: 'so-heading' }, 'Designation note'), h('pre', { class: 'so-pre' }, r.notice));
  const blob = new Blob([r.csv], { type: 'text/csv' });
  el.append(h('p', {}, h('a', { href: URL.createObjectURL(blob), download: r.filename, class: 'btn' }, 'Download the CSV')));
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

// ?state=NJ&reason=bonding&start=2026-12-14&hire=2026-08-03&hours=600&employees=20&instate=20&within75=20&dis=10&incap=1
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const set = (id, key, ok = () => true) => { const v = q.get(key); if (v !== null && v.length <= 40 && ok(v)) $(id).value = v; };
  const num = (v) => /^\d+(\.\d+)?$/.test(v);
  const up = q.get('state')?.toUpperCase();
  if (up && Object.hasOwn(STATES, up)) $('so-state').value = up;
  set('so-reason', 'reason', (v) => REASONS.includes(v));
  set('so-start', 'start', isDate);
  set('so-hire', 'hire', isDate);
  set('so-hours', 'hours', num);
  set('so-emp', 'employees', num);
  set('so-instate', 'instate', num);
  set('so-75', 'within75', num);
  set('so-dis', 'dis', num);
  if (q.get('incap') === '1') $('so-incap').checked = true;
  if (q.get('earnings') === '0') $('so-earn').checked = false;
  if (q.get('employer') === 'public') $('so-public').value = 'public';
  return q.has('state') || q.has('reason');
}

const soon = (fn, ms = 350) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
const birthFields = () => { for (const el of document.querySelectorAll('.so-birth')) el.hidden = val('so-reason') !== 'birth'; };

function start() {
  fillStates('CA');
  T.mountCodePanel($('so-code'), SLUG);
  const linked = fromQuery();
  birthFields();
  const go = runner('so-out', 'so-err', () => ({ op: 'overlay', ...caseInput() }), showOverlay);
  const plan = runner('so-plan-out', 'so-plan-err', () => ({ op: 'plan', employee: val('so-name'), ...caseInput() }), showPlan);
  $('so-form').addEventListener('submit', (e) => { e.preventDefault(); go(); });
  $('so-form').addEventListener('input', soon(go));
  $('so-form').addEventListener('change', () => { birthFields(); soon(go)(); });
  $('so-plan').addEventListener('submit', (e) => { e.preventDefault(); plan(); });
  // The worked example stays as written until the visitor changes something (no run used at rest),
  // unless the address carried a case of its own.
  if (linked) go();
}

start();
