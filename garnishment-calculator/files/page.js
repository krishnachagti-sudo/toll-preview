// The garnishment calculator page. The worked example is in the HTML; a run sends the form to the
// server's engine (free on this page, never using a free run) and draws the answer, the line map
// for the answer form, the warnings and the sources. Links from the content pages prefill the form
// (?state=CA&freq=weekly&gross=1000&req=200&support=0&order=creditor ...).
const T = window.Endwise;
const h = T.h;
const SLUG = 'garnishment-calculator';
const $ = (id) => document.getElementById(id);

const STATES = [['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'], ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'], ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'], ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'], ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'], ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'], ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'], ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'], ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'], ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'], ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming']];

const usd = (cents) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const val = (id) => $(id).value.trim();
const opt = (o, k, v) => { if (v !== '' && v !== undefined && v !== null) o[k] = v; };

function fillStates() {
  const sel = $('gc-state');
  for (const [code, name] of STATES) sel.appendChild(h('option', { value: code, ...(code === 'CA' ? { selected: '' } : {}) }, name));
}

// Show only the fields that matter for the order type.
function showFields() {
  const order = val('gc-order');
  const levy = order === 'levy';
  document.querySelectorAll('.gc-not-levy').forEach((el) => { el.hidden = levy; });
  document.querySelectorAll('.gc-levy').forEach((el) => { el.hidden = !levy; });
  document.querySelectorAll('.gc-creditor').forEach((el) => { el.hidden = order !== 'creditor'; });
  document.querySelectorAll('.gc-support').forEach((el) => { el.hidden = order !== 'support'; });
  const daily = document.querySelector('.gc-levy-only');
  daily.disabled = !levy;
  if (!levy && $('gc-freq').value === 'daily') $('gc-freq').value = 'weekly';
}

function readInput() {
  const order = val('gc-order');
  const deps = Number(val('gc-deps') || 0);
  if (order === 'levy') {
    const i = { op: 'levy', payFrequency: val('gc-freq'), filingStatus: val('gc-fs'), dependents: deps, additional: Number(val('gc-add') || 0) };
    opt(i, 'takeHomePay', val('gc-take'));
    return i;
  }
  const i = { op: 'calculate', orderType: order, state: val('gc-state'), payFrequency: val('gc-freq'), grossPay: val('gc-gross') };
  opt(i, 'payDate', val('gc-date'));
  opt(i, 'requiredDeductions', val('gc-req'));
  opt(i, 'supportWithheld', val('gc-support'));
  if (order === 'creditor') {
    opt(i, 'otherWithheld', val('gc-other'));
    opt(i, 'debtType', val('gc-debt'));
    opt(i, 'minimumWage', val('gc-wage'));
    opt(i, 'localMinimumWage', val('gc-local'));
    if (i.state === 'NY') i.nyRegion = val('gc-region');
    if (deps) i.dependents = deps;
    if ($('gc-hof').checked) i.headOfFamily = true;
    if ($('gc-waiver').checked) i.waiverSigned = true;
    opt(i, 'expectedAnnualEarnings', val('gc-annual'));
    opt(i, 'garnishedThisYear', val('gc-ytd'));
    opt(i, 'balanceOwed', val('gc-owed'));
  }
  if (order === 'support') {
    i.supportingOthers = $('gc-others').checked;
    i.arrears12Weeks = $('gc-arrears').checked;
    opt(i, 'supportOrdered', val('gc-ordered'));
  }
  if (order === 'federal-debt') opt(i, 'otherWithheld', val('gc-other'));
  return i;
}

// One line per figure: what it is, the amount, and where it comes from (the engine names the law in
// brackets at the end of a limit's line; the rest are the inputs or worked from the lines above).
const ENTERED = /^(Gross earnings|Deductions required|Already withheld|Take-home pay)/;
function item(l, last) {
  const m = /^(.*?) \((.+)\)$/.exec(l.line);
  const label = m ? m[1] : l.line;
  const src = ENTERED.test(l.line) ? 'you entered' : m ? m[2] : last ? 'the lower limit less what is already withheld' : 'worked out from the lines above';
  return h('li', last ? { class: 'key' } : {}, [h('span', {}, label), h('b', {}, usd(l.cents)), h('small', {}, src)]);
}

function draw(r) {
  const out = $('gc-out');
  out.textContent = '';
  out.appendChild(h('div', { class: 'tf-res-h' }, [h('h2', { class: 'gc-out-title' }, 'Your paycheck')]));
  const lines = r.answerForm ?? [
    { line: 'Exempt amount (Publication 1494)', cents: r.exemptCents },
    ...(r.takeHomeCents === null ? [] : [{ line: 'Take-home pay', cents: r.takeHomeCents }, { line: 'Paid to the IRS this period (take-home pay less the exempt amount)', cents: r.levyCents }]),
  ];
  const key = lines[lines.length - 1];
  out.appendChild(h('p', { class: 'tf-big' }, [usd(key.cents), h('small', {}, key.line.replace(/ \(.*\)$/, ''))]));
  out.appendChild(h('p', { class: 'gc-answer tf-answer' }, r.answer));
  out.appendChild(h('ul', { class: 'gc-lines tf-items' }, lines.map((l, i) => item(l, i === lines.length - 1))));
  const tests = [...(r.federal?.tests ?? []).map((t) => `Federal: ${t.label}: ${usd(t.cents)}`), ...(r.stateLimit?.tests ?? []).map((t) => `${r.state.name}: ${t.label}: ${usd(t.cents)}`)];
  if (tests.length) out.appendChild(h('details', { class: 'gc-tests' }, [h('summary', {}, 'How each limit was worked out'), h('ul', {}, tests.map((t) => h('li', {}, t)))]));
  if (r.disposable?.lines?.length) {
    out.appendChild(h('p', { class: 'small muted' }, `Disposable earnings ${usd(r.disposable.disposableCents)}: gross ${usd(r.disposable.grossCents)} less ${usd(r.disposable.requiredCents)} required by law${r.disposable.voluntaryCents ? `; ${usd(r.disposable.voluntaryCents)} of voluntary deductions stays in` : ''}.`));
  }
  const notes = [...(r.warnings ?? []), ...(r.state?.notes ?? [])];
  if (notes.length) out.appendChild(h('ul', { class: 'gc-warn' }, notes.map((w) => h('li', {}, w))));
  if (r.sources?.length) out.appendChild(h('p', { class: 'small muted' }, ['Sources: ', ...r.sources.flatMap((s, i) => [i ? '; ' : '', h('a', { href: s.url }, s.name), ` (read ${s.readOn})`])]));
  if (r.disclaimer) out.appendChild(h('p', { class: 'small' }, h('strong', {}, r.disclaimer)));
}

async function go(e) {
  if (e) e.preventDefault();
  $('gc-err').textContent = '';
  try {
    const json = await T.run(SLUG, readInput());
    draw(json.result);
  } catch (err) {
    $('gc-err').textContent = err.fields ? Object.values(err.fields).join(' ') : err.message;
  }
}

// ?state=CA&freq=weekly&gross=1000&req=200&support=0&other=0&order=creditor&debt=...&deps=2&fs=single&take=800
function prefill() {
  const q = new URLSearchParams(location.search);
  const set = (id, k) => { if (q.has(k)) $(id).value = q.get(k); };
  set('gc-order', 'order'); set('gc-state', 'state'); set('gc-freq', 'freq'); set('gc-gross', 'gross'); set('gc-req', 'req');
  set('gc-support', 'support'); set('gc-other', 'other'); set('gc-debt', 'debt'); set('gc-deps', 'deps'); set('gc-fs', 'fs');
  set('gc-take', 'take'); set('gc-region', 'region'); set('gc-date', 'date');
  // A link that sets a field under "More" opens it, so nothing that changes the answer is hidden.
  if (['other', 'debt', 'deps', 'fs', 'take', 'region', 'date'].some((k) => q.has(k))) $('gc-more').open = true;
  return [...q.keys()].some((k) => k !== 'run');
}

fillStates();
const prefilled = prefill();
showFields();
$('gc-order').addEventListener('change', showFields);
$('gc-form').addEventListener('submit', go);
if (T.takeRunFlag() || prefilled) go();
