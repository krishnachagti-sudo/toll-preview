// The Ontario rent increase page. The worked example is static HTML (a test keeps it equal to the
// engine's answer); every real answer comes from the server through Endwise.run, which runs the
// same core.js. URL parameters prefill the form (content pages link here with them); run=1 runs once.
import { longDate, dayDate, METHODS } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'ontario-rent-increase';
const $ = (id) => document.getElementById(id);
const op = () => document.querySelector('input[name="op"]:checked').value;
let last = null;

const FIELD_ERRORS = { rent: 'ri-rent-err', lastIncrease: 'ri-last-err', tenancyStart: 'ri-last-err', effectiveDate: 'ri-eff-err', servedOn: 'ri-served-err', proposedRent: 'ri-proposed-err', deposit: 'ri-deposit-err', paidOn: 'ri-paid-err', rentChanges: 'ri-changes-err', unitAddress: 'ri-address-err' };

function syncOp() {
  for (const el of document.querySelectorAll('[data-op]')) el.hidden = el.dataset.op !== op();
  $('ri-run').textContent = op() === 'check' ? 'Work out my increase' : 'Work out the interest';
  const kind = $('ri-kind').value;
  for (const el of document.querySelectorAll('[data-kind]')) el.hidden = !el.dataset.kind.split(' ').includes(kind);
}

const val = (id) => $(id).value.trim();
const opt = (id) => (val(id) === '' ? undefined : val(id));

function checkInput() {
  const input = { op: 'check', rent: Number(val('ri-rent')), method: $('ri-method').value };
  const d = opt('ri-last');
  if (d) input[$('ri-start').checked ? 'tenancyStart' : 'lastIncrease'] = d;
  if (opt('ri-eff')) input.effectiveDate = val('ri-eff');
  if (opt('ri-served')) input.servedOn = val('ri-served');
  if (opt('ri-proposed')) input.proposedRent = Number(val('ri-proposed'));
  const kind = $('ri-kind').value;
  if (kind) {
    const unit = { kind };
    if (kind === 'building' || kind === 'addition') { if (opt('ri-first')) unit.firstOccupied = val('ri-first'); }
    if (kind === 'house') {
      unit.unitsOnCutoff = Number(val('ri-units') || 1);
      unit.selfContained = $('ri-self').checked;
      if (opt('ri-became')) unit.becameUnit = val('ri-became');
      unit.ownerLivedThere = $('ri-owner').checked;
      unit.unfinishedSpace = $('ri-unfinished').checked;
    }
    if (kind !== 'other' && opt('ri-agreed')) unit.tenancyAgreed = val('ri-agreed');
    input.unit = unit;
  }
  return input;
}

function depositInput() {
  const input = { op: 'deposit-interest', deposit: Number(val('ri-deposit')), paidOn: val('ri-paid') };
  const changes = val('ri-changes').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const [from, rent] = l.split(/[\s,]+/);
    return { from, rent: Number(String(rent ?? '').replace(/[$,]/g, '')) };
  });
  if (changes.length) {
    input.rentChanges = changes;
    input.rent = input.deposit;
  }
  return input;
}

function clearErrors() {
  $('ri-error').textContent = '';
  for (const id of new Set(Object.values(FIELD_ERRORS))) $(id).textContent = '';
}

function showError(e, box = 'ri-error') {
  const fields = e.fields ?? {};
  let shown = false;
  for (const [k, msg] of Object.entries(fields)) {
    const id = FIELD_ERRORS[k.split('.')[0]];
    if (id) { $(id).textContent = msg; shown = true; }
  }
  if (!shown) $(box).textContent = e.status === 401 ? 'Sign in to keep going: you have used today\'s free runs.' : (e.message || 'Something went wrong. Try again.');
}

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const short = (iso) => `${MON[+iso.slice(5, 7) - 1]} ${+iso.slice(8)}, ${iso.slice(0, 4)}`;
const item = (k, what, fig, em, cls) => h('li', { class: cls ?? null }, [h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, what), h('b', {}, fig), h('em', {}, em)]);
const head = (src) => h('div', { class: 'tf-rh' }, [h('span', { class: 'tf-tag run' }, 'Your result'), h('span', { class: 'tf-src' }, src)]);

// The inputs in one line: "a $2,000.00 rent last raised March 1, 2026, the notice sent by mail".
function checkLine(r) {
  const since = r.since ? `${r.since.kind === 'last increase' ? 'last raised' : 'tenancy began'} ${longDate(r.since.date)}` : 'no date given';
  return `a ${r.rent} rent ${since}, the notice ${{ hand: 'handed over', mailbox: 'left in the mail box', mail: 'sent by mail' }[r.method] ?? r.method}${r.effectiveChosen ? `, increase on ${longDate(r.effectiveDate)}` : ''}`;
}

function renderCheck(r) {
  const out = $('ri-out');
  out.textContent = '';
  const chosen = r.serveBy[r.method];
  out.append(
    head(r.guideline ? `${r.guideline.year} guideline ${r.guideline.percent}%, RTA s.120` : 'RTA s.120'),
    h('p', { class: 'tf-exin' }, checkLine(r)),
    h('p', { class: 'tf-big' }, [h('b', { class: r.maxRent ? null : 'word' }, r.maxRent ?? (r.exemption.exempt ? 'No limit' : 'Not published')), h('span', {}, `${r.maxRent ? 'at most, ' : ''}from ${longDate(r.effectiveDate)}`)]),
    h('p', { class: 'tf-sub' }, r.answer),
  );
  if (r.problems.length) out.append(h('ul', { class: 'ri-problems' }, r.problems.map((p) => h('li', {}, p.text))));
  out.append(h('ol', { class: 'tf-items ri-items' }, [
    item('%', 'New rent', r.maxRent ?? (r.exemption.exempt ? 'No guideline limit' : 'Not published yet'), r.guideline ? `${r.rent} plus the ${r.guideline.year} guideline of ${r.guideline.percent}%, rounded down to the cent (s.120)` : 'The guideline for that year is not published yet (s.120)', 'hi'),
    item('12', 'Earliest increase date', short(r.twelveMonthDate ?? r.effectiveDate), r.since ? `12 months after the ${r.since.kind} on ${longDate(r.since.date)} (s.119)` : '12 months since the last increase (s.119)'),
    ...['mail', 'hand', 'mailbox'].map((m) => item('90', `Serve ${METHODS[m].label} by`, short(r.serveBy[m]), `90 days' notice (s.116, s.${METHODS[m].section})`, m === r.method ? null : 'dim')),
  ]));
  if (r.lastDayIsSunday) out.append(h('p', { class: 'tf-note' }, `That last day (${short(chosen)}) is a Sunday: serve it earlier.`));
  if (r.notice) out.append(h('p', { class: 'tf-note' }, `Served ${longDate(r.notice.servedOn)}, it counts as given ${longDate(r.notice.deemedGiven)}: ${r.notice.days} days before the increase.`));
  if (r.exemption.exempt !== null || r.exemption.missing?.length && r.exemption.missing[0] !== 'kind') {
    out.append(h('details', { class: 'xpand ri-ex', open: true }, [h('summary', {}, 'Exemption (RTA s.6.1)'), h('div', { class: 'xp-in' }, h('ul', {}, r.exemption.reasons.map((x) => h('li', {}, x))))]));
  }
  if (r.deposit) out.append(h('p', { class: 'tf-note' }, `Deposit held ${r.deposit.held}; top-up the landlord may ask for after the increase: ${r.deposit.topUp ?? 'not known'} (s.106(3)).`));
  if (r.guidelineNote) out.append(h('p', { class: 'tf-note' }, r.guidelineNote));
  $('ri-sheet-box').hidden = false;
}

function renderDeposit(r) {
  const out = $('ri-out');
  out.textContent = '';
  out.append(head('Deposit interest, RTA s.106'), h('p', { class: 'tf-sub ri-dep' }, r.answer));
  if (r.rows.length) {
    out.append(h('ol', { class: 'tf-items ri-items' }, r.rows.map((x, i) => item(String(i + 1), `Due ${short(x.due)} at ${x.rate}`, x.interest,
      `Kept as top-up ${x.keptForTopUp}, paid to the tenant ${x.paidToTenant}, deposit after ${x.depositAfter} (s.106(6), (7))`))));
  }
  if (r.note) out.append(h('p', { class: 'tf-note' }, r.note));
  $('ri-sheet-box').hidden = true;
}

async function run() {
  clearErrors();
  const input = op() === 'check' ? checkInput() : depositInput();
  $('ri-status').textContent = 'Working it out';
  try {
    const res = await T.run(SLUG, input);
    last = input;
    if (input.op === 'check') renderCheck(res.result); else renderDeposit(res.result);
    $('ri-status').textContent = 'Done';
  } catch (e) {
    showError(e);
    $('ri-status').textContent = '';
  }
}

async function makeSheet() {
  $('ri-sheet-error').textContent = '';
  $('ri-address-err').textContent = '';
  const base = last && last.op === 'check' ? last : checkInput();
  const input = { ...base, op: 'sheet', unitAddress: val('ri-address') };
  if (!input.effectiveDate) {
    try { input.effectiveDate = (await T.run(SLUG, { ...base, op: 'check' })).result.effectiveDate; } catch (e) { showError(e, 'ri-sheet-error'); return; }
  }
  if (opt('ri-tenant-name')) input.tenantName = val('ri-tenant-name');
  if (opt('ri-landlord-name')) input.landlordName = val('ri-landlord-name');
  try {
    const res = await T.run(SLUG, input);
    const md = res.result.sheet.markdown;
    const out = $('ri-sheet-out');
    out.textContent = '';
    const status = h('span', { class: 'small muted' }, '');
    const file = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }));
    out.append(
      h('table', { class: 'rules' }, h('tbody', {}, res.result.sheet.fields.map((f) => h('tr', {}, [h('th', {}, f.field), h('td', {}, f.value)])))),
      h('p', { class: 'tf-note' }, res.result.sheet.formNote),
      h('pre', { class: 'ri-md' }, md),
      h('p', {}, [
        h('button', { class: 'btn btn-ghost', type: 'button', onclick: (ev) => T.copy(md, ev.currentTarget, status) }, 'Copy'), ' ',
        h('a', { class: 'btn btn-ghost', href: file, download: 'n1-prep-sheet.md' }, 'Download'), ' ', status,
      ]),
    );
  } catch (e) {
    showError(e, 'ri-sheet-error');
  }
}

function prefill() {
  const q = new URLSearchParams(location.search);
  const set = (id, v) => { if (v !== null && v !== '') $(id).value = v; };
  if (q.get('op') === 'deposit-interest') document.querySelector('input[name="op"][value="deposit-interest"]').checked = true;
  set('ri-rent', q.get('rent'));
  set('ri-last', q.get('last') ?? q.get('start'));
  if (q.get('start')) $('ri-start').checked = true;
  set('ri-eff', q.get('eff'));
  if (q.get('method') && METHODS[q.get('method')]) $('ri-method').value = q.get('method');
  if (q.get('served') || q.get('proposed')) { $('ri-tenant').open = true; set('ri-served', q.get('served')); set('ri-proposed', q.get('proposed')); }
  set('ri-deposit', q.get('deposit'));
  set('ri-paid', q.get('paid'));
  if (q.get('op') === 'deposit-interest' && q.get('changes') !== null) $('ri-changes').value = q.get('changes').split(';').join('\n');
  syncOp();
  if (q.get('run') === '1') run();
}

for (const r of document.querySelectorAll('input[name="op"]')) r.addEventListener('change', syncOp);
$('ri-kind').addEventListener('change', syncOp);
$('ri-form').addEventListener('submit', (e) => { e.preventDefault(); run(); });
$('ri-sheet-run').addEventListener('click', makeSheet);
prefill();
