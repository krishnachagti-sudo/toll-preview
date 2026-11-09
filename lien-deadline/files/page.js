// The lien deadline page. The state rules live on the server (data/ is never served), so every
// answer is the server's, through Endwise.run: free on this page; the notice PDF is paid.
const T = window.Endwise;
const h = T.h;
const SLUG = 'lien-deadline';
const $ = (id) => document.getElementById(id);

// The states, the ones whose own statute sites we have read, and the ones with a notice form here
// (the tests check these lists against the data).
export const STATES = { AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California', CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', DC: 'District of Columbia', FL: 'Florida', GA: 'Georgia', HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa', KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland', MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri', MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey', NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio', OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina', SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont', VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming' };
export const COVERED = ['AZ', 'DC', 'FL', 'KS', 'MD', 'MN', 'MT', 'TX', 'VA', 'WA'];
export const FORMS = {
  AZ: 'Arizona\'s preliminary twenty day notice (A.R.S. 33-992.01(D))',
  FL: 'Florida\'s notice to owner (Fla. Stat. 713.06(2)(c))',
  MD: 'Maryland\'s notice of intention to claim a lien (Real Prop. 9-104(b))',
  MN: 'Minnesota\'s pre-lien notice (514.011, subd. 2)',
  TX: 'Texas\'s notice of claim for unpaid labor or materials (Prop. Code 53.056(a-2)), one per month of work',
  WA: 'Washington\'s notice to owner (RCW 60.04.031(4))',
};
const ROLES = ['prime', 'sub', 'sub-sub', 'supplier-prime', 'supplier-sub', 'laborer'];
const PROJECTS = ['commercial', 'new-home', 'home-improvement'];

const val = (id) => $(id).value.trim();
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v);
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const longDate = (iso) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}, ${iso.slice(0, 4)}`;
const monthName = (ym) => `${MONTHS[Number(ym.slice(5, 7)) - 1]} ${ym.slice(0, 4)}`;

function fillStates() {
  const sel = $('ld-state');
  const byName = Object.entries(STATES).sort((a, b) => a[1].localeCompare(b[1]));
  sel.replaceChildren(
    h('optgroup', { label: 'Covered' }, byName.filter(([c]) => COVERED.includes(c)).map(([c, n]) => h('option', { value: c }, n))),
    h('optgroup', { label: 'Federal' }, [h('option', { value: 'US' }, 'Federal project (Miller Act)')]),
    h('optgroup', { label: 'Not covered yet' }, byName.filter(([c]) => !COVERED.includes(c)).map(([c, n]) => h('option', { value: c }, n))),
  );
  sel.value = 'AZ';
}

// ---------- inputs ----------

function jobInput() {
  const input = { state: val('ld-state'), role: val('ld-role'), project: val('ld-project') };
  if (input.project !== 'commercial') input.ownerOccupied = $('ld-occupied').checked;
  const dates = [['ld-first', 'firstFurnish'], ['ld-last', 'lastFurnish'], ['ld-completion', 'completion'], ['ld-sent', 'noticeSent'], ['ld-recorded', 'recorded'], ['ld-noc', 'noticeOfCompletion'], ['ld-agreed', 'agreed'], ['ld-ownend', 'ownContractEnd']];
  for (const [id, key] of dates) if (val(id)) input[key] = val(id);
  if ($('ld-retainage').checked) input.retainage = true;
  if ($('ld-large').checked) input.largeProject = true;
  if ($('ld-today').checked) input.asOf = localToday();
  return input;
}
function noticeInput() {
  const parties = { claimantName: val('ld-claimant'), property: val('ld-property') };
  const opt = [['ld-caddr', 'claimantAddress'], ['ld-owner', 'owner'], ['ld-gc', 'contractor'], ['ld-hirer', 'hiringParty'], ['ld-desc', 'description'], ['ld-amount', 'amount'], ['ld-county', 'county']];
  for (const [id, key] of opt) if (val(id)) parties[key] = val(id);
  parties.date = localToday();
  const input = { op: 'notice', ...jobInput(), parties };
  if (input.state === 'TX' && val('ld-month')) input.forMonth = val('ld-month');
  return input;
}

// ---------- answers ----------

const quotes = (list) => (list?.length ? h('ul', { class: 'ld-quotes' }, list.map((q) => h('li', {}, [
  h('q', {}, q.quote), ' ', h('a', { href: q.url, rel: 'noopener' }, q.source), `, read ${longDate(q.readOn)}`,
]))) : null);

const shortDate = (iso) => `${MONTHS[Number(iso.slice(5, 7)) - 1].slice(0, 3)} ${Number(iso.slice(8, 10))}, ${iso.slice(0, 4)}`;

// One step in full, inside the fold: who gets it, how, any extension or month table, the quotes.
function stepCard(s) {
  const body = [h('p', { class: 'ld-name' }, s.name), h('p', {}, `${s.rule} (${s.cite}).`)];
  if (s.to) body.push(h('p', { class: 'ld-small' }, `To: ${s.to}.`));
  if (s.how) body.push(h('p', { class: 'ld-small' }, `How: ${s.how}.`));
  if (s.moved) body.push(h('p', { class: 'ld-small' }, `${s.moved.why}.`));
  if (s.extension) body.push(h('p', { class: 'ld-small' }, `${s.extension.text} Then: ${longDate(s.extension.date)}.`));
  if (s.monthly) {
    body.push(h('table', { class: 'ld-months' }, [
      h('thead', {}, h('tr', {}, [h('th', {}, 'Work in'), h('th', {}, 'Notice by'), h('th', {}, '')])),
      h('tbody', {}, s.monthly.map((m) => h('tr', { class: m.status === 'passed' ? 'ld-gone' : '' }, [h('td', {}, monthName(m.month)), h('td', {}, longDate(m.due)), h('td', {}, m.text ?? '')]))),
    ]));
  }
  body.push(quotes(s.quotes));
  return h('li', { class: `ld-stepcard ld-k-${s.kind}` }, body);
}

// One line per deadline: the step, its date, and the statute it comes from.
function stepLine(s, i) {
  const notes = [s.text, s.assumptions?.length ? `assumes ${s.assumptions.join('; ')}` : null,
    s.partial ? (s.partial === 'could-be-earlier' ? 'could be earlier: enter the missing date' : 'could be later: enter the missing date') : null].filter(Boolean);
  const cls = [s.kind === 'lien' ? 'hi' : '', s.status === 'passed' ? 'ld-passed' : ''].filter(Boolean).join(' ') || null;
  return h('li', { class: cls }, [
    h('span', { class: 'k', 'aria-hidden': 'true' }, String(i + 1)),
    h('span', {}, s.name),
    h('b', {}, s.due ? shortDate(s.due) : (s.undated ? 'No separate day' : 'Needs a date')),
    h('em', {}, `${s.cite}: ${s.rule}${notes.length ? ` (${notes.join('; ')})` : ''}`),
  ]);
}

// The inputs in one line: "Arizona, subcontractor, commercial job, work March 3 to August 14, 2026".
function inputsLine() {
  const opt = (id) => $(id).selectedOptions[0]?.textContent ?? '';
  const parts = [opt('ld-state'), opt('ld-role').toLowerCase(), `${opt('ld-project').toLowerCase()} job`];
  if (val('ld-first') && val('ld-last')) parts.push(`work ${longDate(val('ld-first'))} to ${longDate(val('ld-last'))}`);
  if (val('ld-completion')) parts.push(`completed ${longDate(val('ld-completion'))}`);
  return parts.join(', ');
}

function show(r, el, example) {
  el.replaceChildren();
  const tag = example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result');
  if (!r.covered) {
    el.append(h('div', { class: 'tf-rh' }, [tag, h('span', { class: 'tf-src' }, 'Not covered')]),
      h('p', { class: 'tf-exin' }, inputsLine()), h('p', { class: 'tf-sub' }, r.answer));
    return;
  }
  const read = r.steps?.flatMap((s) => s.quotes ?? [])[0]?.readOn;
  el.append(
    h('div', { class: 'tf-rh' }, [tag, h('span', { class: 'tf-src' }, `${r.stateName ?? ''} statutes${read ? `, read ${shortDate(read)}` : ''}`)]),
    h('p', { class: 'tf-exin' }, example ? `Example: ${inputsLine()}` : inputsLine()),
  );
  const lien = r.steps?.find((s) => s.kind === 'lien' && s.due) ?? r.steps?.find((s) => s.due);
  if (lien) el.append(h('p', { class: 'tf-big' }, [h('b', { class: 'word' }, longDate(lien.due)), h('span', {}, lien.kind === 'lien' ? 'last day to record the lien' : lien.name.toLowerCase())]));
  el.append(h('p', { class: 'tf-sub' }, r.answer));
  if (r.bar) { el.append(quotes(r.bar.quotes)); return; }
  for (const n of r.needs ?? []) el.append(h('p', { class: 'ld-warn' }, n.text));
  el.append(h('ol', { class: 'tf-items ld-items' }, r.steps.map(stepLine)));
  for (const s of r.steps) {
    if (s.offDay) el.append(h('p', { class: 'ld-warn' }, s.offDay.text));
    if (s.safest) el.append(h('p', { class: 'ld-warn' }, s.safest.text));
  }
  if (r.lateNotice?.text) el.append(h('p', { class: r.lateNotice.sentOn ? (r.lateNotice.onTime ? 'ld-ok' : 'ld-warn') : 'tf-note' }, r.lateNotice.text));
  el.append(h('details', { class: 'xpand ld-fold' }, [
    h('summary', {}, 'The statute\'s words, who gets each notice and how'),
    h('div', { class: 'xp-in' }, [h('ol', { class: 'ld-steps' }, r.steps.map(stepCard)),
      ...(r.notes?.length ? [h('ul', { class: 'ld-list' }, r.notes.map((n) => h('li', {}, n)))] : [])]),
  ]));
  if (r.ics) {
    const href = URL.createObjectURL(new Blob([r.ics], { type: 'text/calendar' }));
    el.append(h('p', { class: 'ld-ics' }, [h('a', { href, download: `lien-deadlines-${r.state.toLowerCase()}.ics`, class: 'btn btn-small btn-quiet' }, 'Add the dates to a calendar (.ics)')]));
  }
}

// ---------- running ----------

// The job form as first served, so a result for the same job still says "Example".
let DEFAULTS = null;
const JOB_IDS = ['ld-state', 'ld-role', 'ld-project', 'ld-first', 'ld-last', 'ld-completion', 'ld-sent', 'ld-recorded', 'ld-noc', 'ld-agreed', 'ld-ownend'];
const formNow = () => JOB_IDS.map((id) => $(id).value).concat(['ld-occupied', 'ld-retainage', 'ld-large'].map((id) => $(id).checked)).join('|');

let seq = 0;
async function update() {
  const mine = ++seq;
  $('ld-err').textContent = '';
  const st = val('ld-state');
  $('ld-nwhich').textContent = FORMS[st] ? `${FORMS[st]}, in the statute's words, with a proof-of-service log. Uses the job above.` : `${STATES[st] ?? 'This choice'} has no statutory notice form here; the dates above are free.`;
  $('ld-nbtn').disabled = !FORMS[st];
  $('ld-occupied-row').hidden = val('ld-project') === 'commercial';
  try {
    const res = await T.run(SLUG, { op: 'deadlines', ...jobInput() });
    if (mine !== seq) return;
    show(res.result ?? res, $('ld-out'), formNow() === DEFAULTS);
  } catch (e) {
    if (mine !== seq) return;
    $('ld-err').textContent = e.fields ? Object.values(e.fields).join(' ') : e.message;
  }
}

const fromBase64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
let pendingQuote = null;
async function makeNotice() {
  const input = noticeInput();
  const button = $('ld-nbtn');
  const box = $('ld-nout');
  $('ld-nerr').textContent = '';
  button.disabled = true;
  try {
    const key = JSON.stringify(input);
    if (!pendingQuote || pendingQuote.key !== key) {
      const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
      pendingQuote = { key, q };
      button.textContent = q.amount ? `Pay ${q.display} and download` : 'Download (no charge)';
      return;
    }
    const json = await T.run(SLUG, input);
    const r = json.result;
    const href = URL.createObjectURL(new Blob([fromBase64(r.pdf.base64)], { type: 'application/pdf' }));
    box.replaceChildren(
      h('div', { class: 'tf-rh' }, [h('span', { class: 'tf-tag run' }, 'Your notice'), h('span', { class: 'tf-src' }, r.notice.title)]),
      h('p', { class: 'tf-sub' }, `Serve it by ${r.notice.dueText} on ${r.notice.to}.`),
      ...(r.lateWarning ? [h('p', { class: 'ld-warn' }, r.lateWarning)] : []),
      h('p', { class: 'ld-ics' }, [h('a', { href, download: r.pdf.filename, class: 'btn btn-small' }, 'Download the PDF')]),
      h('p', { class: 'tf-cost' }, `Notice ${r.noticeId}. ${r.blanks.length ? `Blanks left: ${r.blanks.join(', ')}. ` : ''}${json.charged ? `Charged ${json.charged.display}.` : 'No charge.'}`),
    );
    pendingQuote = null;
    button.textContent = 'Make the notice PDF';
  } catch (e) {
    const fields = e.fields ? Object.values(e.fields) : [];
    const err = $('ld-nerr');
    err.textContent = fields[0] ?? e.message;
    if (e.code === 'unauthorized' || e.code === 'rate_limited') err.append(' ', h('a', { href: T.signInHref() }, 'Sign in or create an account'));
    if (e.code === 'insufficient_balance' || e.code === 'cap_reached') err.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
  } finally {
    button.disabled = !FORMS[val('ld-state')];
  }
}

// ?state=TX&role=supplier-sub&project=commercial&first=2026-03-03&last=2026-06-19&completion=...&sent=...&recorded=...
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const set = (id, key, ok) => { const v = q.get(key); if (v !== null && v.length <= 40 && ok(v)) $(id).value = v; };
  const st = q.get('state')?.toUpperCase();
  if (st && (Object.hasOwn(STATES, st) || st === 'US')) $('ld-state').value = st;
  set('ld-role', 'role', (v) => ROLES.includes(v));
  set('ld-project', 'project', (v) => PROJECTS.includes(v));
  for (const [id, key] of [['ld-first', 'first'], ['ld-last', 'last'], ['ld-completion', 'completion'], ['ld-sent', 'sent'], ['ld-recorded', 'recorded'], ['ld-noc', 'noc'], ['ld-agreed', 'agreed'], ['ld-ownend', 'ownend']]) {
    if (q.has(key) && q.get(key) === '') $(id).value = '';
    set(id, key, isDate);
  }
  if (q.get('occupied') === 'no') $('ld-occupied').checked = false;
  if (q.get('retainage') === 'yes') $('ld-retainage').checked = true;
  if (q.get('large') === 'yes') $('ld-large').checked = true;
  if (['sent', 'recorded', 'noc', 'agreed', 'ownend', 'retainage', 'large'].some((k) => q.has(k))) $('ld-more').open = true;
  return q.has('state') || q.has('first');
}

const soon = (fn, ms = 350) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

function start() {
  fillStates();
  $('ld-coverage').textContent = `Covered: ${COVERED.map((c) => STATES[c]).join(', ')}, and federal projects under the Miller Act. Not covered yet: ${Object.keys(STATES).filter((c) => !COVERED.includes(c)).map((c) => STATES[c]).join(', ')}.`;
  T.mountCodePanel($('ld-code'), SLUG);
  DEFAULTS = formNow();
  const linked = fromQuery();
  $('ld-occupied-row').hidden = val('ld-project') === 'commercial';
  $('ld-form').addEventListener('submit', (e) => { e.preventDefault(); update(); });
  $('ld-form').addEventListener('input', soon(update));
  $('ld-form').addEventListener('change', soon(update));
  $('ld-nform').addEventListener('submit', (e) => { e.preventDefault(); makeNotice(); });
  $('ld-nform').addEventListener('input', () => { pendingQuote = null; $('ld-nbtn').textContent = 'Make the notice PDF'; });
  // The worked example stays as written until the visitor changes something (no run used at rest),
  // unless the address carried their own job.
  if (linked) update();
}

start();
