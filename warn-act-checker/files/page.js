// The WARN Act checker page. core.js (the same file the server runs) works out the site check, the
// employee list's site summary and the exposure in the browser as you type, so they are free and
// never use a run. The employee CSV (every employee's notice dates) is the server's answer to the
// same input, through Endwise.run, and is the paid output.
import { check, list, exposure, sampleRoster, WarnError, isRealDate, longDate, pct, STATES, STATE_NAMES, MINI_WARN, COVERED, REASONS, normState } from './core.js';

const T = window.Endwise;
const h = T.h;
const SLUG = 'warn-act-checker';
const $ = (id) => document.getElementById(id);

let tool = null;
let signedIn = false;
let lastList = null; // the last good list input

// ---------- reading the forms ----------

const num = (s, what) => {
  const t = String(s ?? '').replace(/,/g, '').trim();
  if (!/^\d+$/.test(t)) throw new WarnError(`${what}: "${String(s).slice(0, 20)}" is not a whole number.`);
  return Number(t);
};
// "Fresno plant, CA, 160, 20[, 5][, closing][, moves 120 miles]"
function readSites(text) {
  const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) throw new WarnError('List at least one site.');
  return lines.map((l) => {
    const parts = l.split(',').map((x) => x.trim()).filter(Boolean);
    const site = { name: parts[0], losses: [] };
    if (parts.length < 3) throw new WarnError(`Could not read "${l.slice(0, 40)}". Write a name, the state, then the full-time count: Fresno plant, CA, 160, 20.`);
    site.state = normState(parts[1]);
    const nums = [];
    for (const p of parts.slice(2)) {
      const miles = /^(?:moves|relocat\w*)\s+(\d+(?:\.\d+)?)\s*(?:miles?|mi)?$/i.exec(p);
      if (/^clos(?:ing|ed|e|ure)$/i.test(p)) site.closing = true;
      else if (miles) site.relocationMiles = Number(miles[1]);
      else nums.push(num(p, site.name));
    }
    [site.fullTime = 0, site.partTime = 0, site.short = 0] = nums;
    return site;
  });
}
// "2027-01-15, Fresno plant, 40, 5[, 1]"
function readLosses(text, sites) {
  const byName = new Map(sites.map((s) => [s.name.toLowerCase(), s]));
  for (const l of text.split(/\n+/).map((x) => x.trim()).filter(Boolean)) {
    const parts = l.split(',').map((x) => x.trim());
    if (!isRealDate(parts[0])) throw new WarnError(`Could not read "${l.slice(0, 40)}". Start with the date: 2027-01-15, Fresno plant, 40.`);
    const site = byName.get((parts[1] ?? '').toLowerCase());
    if (!site) throw new WarnError(`"${parts[1] ?? ''}" is not one of the sites above.`);
    site.losses.push({ date: parts[0], fullTime: num(parts[2] ?? '0', site.name), partTime: num(parts[3] ?? '0', site.name), short: num(parts[4] ?? '0', site.name) });
  }
  return sites;
}
function readStates(text) {
  const out = {};
  for (const l of text.split(/\n+/).map((x) => x.trim()).filter(Boolean)) {
    const [st, ft, pt = '0', sh = '0'] = l.split(',').map((x) => x.trim());
    out[normState(st)] = { fullTime: num(ft ?? '', st), partTime: num(pt, st), short: num(sh, st) };
  }
  return out;
}

function checkInput() {
  const sites = readLosses($('wn-losses').value, readSites($('wn-sites').value));
  const input = { op: 'check', sites };
  const employer = {};
  if ($('wn-cft').value.trim()) employer.fullTime = num($('wn-cft').value, 'Full-time employees');
  if ($('wn-cpt').value.trim()) employer.partTime = num($('wn-cpt').value, 'Part-time employees');
  if ($('wn-hours').value.trim()) employer.weeklyHours = num($('wn-hours').value, 'Hours a week');
  if (Object.keys(employer).length) input.employer = employer;
  const states = readStates($('wn-states').value);
  if (Object.keys(states).length) input.states = states;
  if ($('wn-notice').value) input.noticeDate = $('wn-notice').value;
  return input;
}

// A small CSV reader: quoted cells, commas and new lines inside quotes, a header row.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let q = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i += 1; } else if (c === '"') q = false; else cell += c;
    } else if (c === '"') q = true;
    else if (c === ',') { row.push(cell); cell = ''; } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); cell = '';
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}
const HEAD = { employee: 'id', id: 'id', name: 'id', site: 'site', location: 'site', state: 'state', hire_date: 'hireDate', hired: 'hireDate', weekly_hours: 'weeklyHours', hours: 'weeklyHours', separation_date: 'separationDate', last_day: 'separationDate', reason: 'reason' };
function rowsInput() {
  const table = parseCsv($('wn-rows').value);
  if (table.length < 2) throw new WarnError('Paste a header row and at least one employee.');
  const keys = table[0].map((x) => HEAD[x.trim().toLowerCase().replace(/[\s-]+/g, '_')] ?? null);
  for (const need of ['site', 'hireDate', 'weeklyHours']) if (!keys.includes(need)) throw new WarnError(`The header needs a ${need === 'hireDate' ? 'hire_date' : need === 'weeklyHours' ? 'weekly_hours' : need} column.`);
  const rows = table.slice(1).map((r) => {
    const o = {};
    keys.forEach((k, i) => { if (k && r[i] !== undefined && r[i].trim() !== '') o[k] = r[i].trim(); });
    if (o.reason) o.reason = o.reason.toLowerCase();
    if (o.reason && !REASONS.includes(o.reason)) throw new WarnError(`${o.id ?? 'A row'}: reason "${o.reason}" is not one of ${REASONS.join(', ')}.`);
    if (o.weeklyHours !== undefined) o.weeklyHours = Number(o.weeklyHours);
    return o;
  });
  const input = { op: 'list', plan: $('wn-plan').value.trim() || 'Layoff plan', rows };
  // The company totals from the site check above, when given, count staff not on this list.
  const employer = {};
  if ($('wn-cft').value.trim()) employer.fullTime = num($('wn-cft').value, 'Full-time employees');
  if ($('wn-cpt').value.trim()) employer.partTime = num($('wn-cpt').value, 'Part-time employees');
  if (Object.keys(employer).length) input.employer = employer;
  return input;
}

function exposureInput() {
  const input = { op: 'exposure', hireDate: $('wn-ehire').value, separationDate: $('wn-esep').value, dailyPay: $('wn-epay').value.trim() };
  if ($('wn-est').value) input.state = $('wn-est').value;
  if ($('wn-enot').value) input.noticeDate = $('wn-enot').value;
  else input.noticeDays = 0;
  for (const [id, k] of [['wn-eavg', 'averageDailyPay'], ['wn-eben', 'dailyBenefits'], ['wn-ewk', 'weeklyPay'], ['wn-epaid', 'wagesPaid']]) if ($(id).value.trim()) input[k] = $(id).value.trim();
  return input;
}

// ---------- drawing ----------

function put(el, ...nodes) {
  el.textContent = '';
  for (const n of nodes.flat()) if (n) el.append(n);
}
const fact = (k, v) => h('div', {}, [h('dt', {}, k), h('dd', {}, v)]);
const table = (cols, rows, cls = '') => h('div', { class: 'table-scroll' }, h('table', { class: `rules wn-table ${cls}` }, [
  h('thead', {}, h('tr', {}, cols.map((c) => h('th', c.num ? { class: 'num' } : {}, c.label)))),
  h('tbody', {}, rows.map((r) => h('tr', {}, r.map((v, i) => h('td', cols[i].num ? { class: 'num' } : {}, v))))),
]));

function lawBlock(l) {
  if (l.federalOnly) return h('div', { class: 'wn-law' }, [h('h4', {}, `${l.name}: no separate state law`), h('ul', { class: 'wn-list-plain' }, [...l.reasons, ...l.recipients].map((x) => h('li', {}, x)))]);
  const verdict = l.triggered ? (l.noticeWhenTold ? 'Phone the Commissioner when employees are told' : l.noticeAfter ? `Tell the Director by ${longDate(l.noticeBy)}` : `${l.noticeDays} days' notice, by ${longDate(l.noticeBy)}`) : 'Not triggered';
  const kids = [h('h4', {}, [h('span', { class: l.triggered ? 'wn-yes' : 'wn-no' }, l.triggered ? 'Triggered' : 'Not triggered'), ` ${l.name}`]), h('p', { class: 'wn-verdict' }, verdict), h('ul', { class: 'wn-list-plain' }, l.reasons.map((x) => h('li', {}, x)))];
  if (l.employer?.estimated && l.employer.covered !== undefined) kids.push(h('p', { class: 'small muted' }, `The ${STATE_NAMES[l.code] ?? ''} headcount is the sites listed; add the state's other staff under "Hours test and staff in each state".`));
  if (l.triggered && l.groups.length) {
    kids.push(table([{ label: 'Last day' }, { label: 'People', num: true }, { label: 'Notice by' }, ...(l.groups[0].daysGiven !== undefined ? [{ label: 'Days given', num: true }, { label: 'Days short', num: true }] : [])],
      l.groups.map((g) => [longDate(g.date), String(g.employees), g.noticeBy ? longDate(g.noticeBy) : 'when told', ...(g.daysGiven !== undefined ? [String(g.daysGiven), String(g.daysShort)] : [])])));
    kids.push(h('p', { class: 'wn-heading' }, 'Who gets the notice'), h('ul', { class: 'wn-list-plain' }, l.recipients.map((x) => h('li', {}, x))));
    if (l.rules?.length) kids.push(h('details', { class: 'wn-why' }, [h('summary', {}, `${l.short}: the rules applied`), h('ul', { class: 'wn-list-plain' }, l.rules.map((x) => h('li', {}, x))), h('p', { class: 'small' }, [h('a', { href: l.url }, l.citation), ` (read ${longDate(l.readOn)})`])]));
  }
  return h('div', { class: 'wn-law' }, kids);
}

// One line per site and law: a mark, the site and law, the deadline, and why, with the law's citation.
function lawItem(site, l) {
  const when = l.federalOnly ? 'no state law' : !l.triggered ? 'not triggered'
    : l.noticeWhenTold ? 'when told' : l.noticeAfter ? `tell by ${longDate(l.noticeBy)}` : `by ${longDate(l.noticeBy)}`;
  const why = l.triggered ? `${l.noticeDays ? `${l.noticeDays} days' notice` : 'notice'}; ${l.reasons[l.reasons.length - 1]}` : l.reasons[l.reasons.length - 1] ?? '';
  return h('li', { class: l.triggered ? 'hi' : 'dim' }, [
    h('span', { class: 'k', 'aria-hidden': 'true' }, l.code === 'US' ? 'US' : l.code ?? site.state),
    h('span', {}, `${site.name}: ${l.short ?? l.name}`),
    h('b', {}, when),
    h('em', {}, [why, l.citation ? ` (${l.citation})` : '']),
  ]);
}

// The inputs in one line: "3 sites (Fresno plant, CA; ...), 400 full-time in the company, notice December 1, 2026".
function inputsLine(input) {
  const sites = input.sites.map((x) => `${x.name}, ${x.state}`).join('; ');
  const co = input.employer?.fullTime != null ? `, ${input.employer.fullTime} full-time in the company` : '';
  return `${input.sites.length} ${input.sites.length === 1 ? 'site' : 'sites'} (${sites})${co}${input.noticeDate ? `, notice ${longDate(input.noticeDate)}` : ''}`;
}

let atRest = true; // the worked example, until the form changes
function drawCheck(r, el, input) {
  const s = r.summary;
  put(el,
    h('div', { class: 'tf-rh' }, [
      atRest ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your sites'),
      h('span', { class: 'tf-src' }, '20 CFR Part 639 and state laws'),
    ]),
    h('p', { class: 'tf-exin' }, atRest ? `Example: ${inputsLine(input)}` : inputsLine(input)),
    h('p', { class: `tf-big wn-answer${s.triggeredSites ? ' yes' : ''}` }, s.triggeredSites
      ? [h('b', {}, `${s.triggeredSites} of ${s.sites}`), h('span', {}, `sites owe notice${s.firstNoticeBy ? `; first by ${longDate(s.firstNoticeBy)}, ${s.firstNoticeSite}` : ''}`)]
      : [h('b', { class: 'word' }, 'No notice due'), h('span', {}, 'at any site in the list')]),
    h('p', { class: 'tf-sub' }, `Federal WARN at ${s.federalSites} of ${s.sites} sites, a state law at ${s.stateSites} of ${s.sites}; ${s.company.fullTime} full-time in the company.`),
    h('ol', { class: 'tf-items wn-items' }, r.sites.flatMap((site) => [
      ...site.laws.map((l) => lawItem(site, l)),
      site.stateCovered ? null : h('li', { class: 'plain' }, [h('span', { class: 'k', 'aria-hidden': 'true' }, site.state), h('span', {}, `${site.name}: ${site.stateName} law`), h('b', {}, 'not covered'), h('em', {}, 'Not read on the state\'s site; federal WARN above still applies.')]),
    ])),
    h('details', { class: 'xpand wn-full' }, [
      h('summary', {}, 'Each site in full: dates, recipients, rules'),
      h('div', { class: 'xp-in' }, [
        h('p', {}, r.answer),
        r.sites.map((site) => h('section', { class: 'wn-site' }, [
          h('h3', {}, `${site.name}, ${site.stateName}`),
          h('p', { class: 'small muted' }, `${site.headcount.fullTime} full-time, ${site.headcount.partTime} part-time${site.headcount.short ? `, ${site.headcount.short} under 6 months` : ''}; ${site.lost.fullTime + site.lost.partTime + site.lost.short} losing their jobs${site.closing ? '; closing' : ''}${site.relocationMiles !== null ? `; moving ${site.relocationMiles} miles` : ''}.`),
          site.laws.map(lawBlock),
          site.stateCovered ? null : h('p', { class: 'small muted' }, `${site.stateName}'s own law is not covered by this tool (not read on the state's site). Federal WARN above still applies.`),
        ].flat())),
      ].flat()),
    ]),
  );
}

// The folded company part says what is in it.
function companySummary() {
  const v = (id) => $(id).value.trim();
  $('wn-sum-co').textContent = [v('wn-cft') && `${v('wn-cft')} full-time`, v('wn-cpt') && `${v('wn-cpt')} part-time`, v('wn-notice') && `notice ${v('wn-notice')}`].filter(Boolean).join(', ');
}

function recomputeCheck() {
  companySummary();
  try {
    const input = checkInput();
    const r = check(input);
    $('wn-check-err').textContent = '';
    drawCheck(r, $('wn-out'), input);
  } catch (e) {
    if (!(e instanceof WarnError)) throw e;
    $('wn-check-err').textContent = e.message;
  }
}

function recomputeList() {
  const out = $('wn-list-out');
  try {
    const input = rowsInput();
    const r = list(input);
    lastList = input;
    $('wn-list-err').textContent = '';
    put(out,
      h('p', { class: 'wn-sub' }, r.answer),
      h('dl', { class: 'wn-facts' }, [fact('Employees', String(input.rows.length)), fact('Leaving', String(r.employees.length)), fact('Counted on', longDate(r.countOn)), fact('Part-time or under 6 months', String(r.classes.partTime + r.classes.short))]),
      table([{ label: 'Site' }, { label: 'Full-time', num: true }, { label: 'Losing jobs', num: true }, { label: 'Share' }, { label: 'Federal' }, { label: 'State law' }, { label: 'Notice by' }],
        r.sites.map((s) => [`${s.name}, ${s.state}`, String(s.headcount.fullTime), String(s.lost.fullTime + s.lost.partTime + s.lost.short), pct(s.lost.fullTime, s.headcount.fullTime), s.laws[0].triggered ? 'yes' : 'no', s.laws[1] ? (s.laws[1].federalOnly ? 'none' : s.laws[1].triggered ? 'yes' : 'no') : 'not covered', s.noticeBy ? longDate(s.noticeBy) : ''])),
    );
  } catch (e) {
    if (!(e instanceof WarnError)) throw e;
    lastList = null;
    $('wn-list-err').textContent = e.message;
    out.textContent = '';
  }
  buy && buy.refresh();
}

function recomputeExposure() {
  const el = $('wn-exp-out');
  try {
    const r = exposure(exposureInput());
    put(el, h('p', {}, h('strong', {}, r.answer)), h('ul', { class: 'wn-list-plain small' }, [...r.lines, ...(r.penaltyCeiling ? [`Civil penalty: ${r.penaltyCeiling}.`] : [])].map((x) => h('li', {}, x))));
  } catch (e) {
    if (!(e instanceof WarnError)) throw e;
    put(el, h('p', { class: 'field-error' }, e.message));
  }
}

function drawStates() {
  const body = $('wn-states-table').querySelector('tbody');
  put(body, COVERED.map((c) => {
    const s = STATES[c];
    if (s.federalOnly) return h('tr', {}, [h('td', {}, STATE_NAMES[c]), h('td', {}, 'Federal Act only'), h('td', {}, 'As federal'), h('td', { class: 'num' }, '60 days'), h('td', {}, h('a', { href: s.url }, 'State DOL'))]);
    const trig = Object.values(s.triggers).map((t) => t.name).join('; ');
    const notice = s.noticeDays ? `${s.noticeDays} days` : 'when told';
    return h('tr', {}, [h('td', {}, STATE_NAMES[c]), h('td', {}, `${s.employer.min}${s.employer.max ? ` to ${s.employer.max}` : '+'} (${s.employer.scope === 'site' ? 'at the site' : s.employer.scope === 'state' ? 'in the state' : 'company'})`), h('td', {}, trig), h('td', { class: 'num' }, notice), h('td', {}, h('a', { href: s.url }, s.citation))]);
  }));
}

// ---------- the paid download ----------

const download = (name, blob) => {
  const a = h('a', { href: URL.createObjectURL(blob), download: name }, name);
  return a;
};
let buy = null;
function buyBox(el) {
  const price = h('p', { class: 'wn-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Download the employee notice list');
  const got = h('p', { class: 'wn-got', role: 'status' });
  const err = h('p', { class: 'form-error', role: 'alert' });
  const words = () => {
    const text = tool?.pricing?.actions.find((a) => a.name === 'list')?.text;
    return text ? T.money(text) : '';
  };
  button.addEventListener('click', async () => {
    err.textContent = '';
    if (!lastList) { err.textContent = 'Fix the rows above first.'; return; }
    button.disabled = true;
    try {
      const json = await T.run(SLUG, lastList);
      const r = json.result;
      const charged = json.charged ? (json.charged.amount ? ` Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : ' Free: a re-run of the same plan.') : '';
      put(got, 'Your list: ', download(r.filename, new Blob([r.csv], { type: 'text/csv' })), `.${charged}`);
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
        if (!lastList) { price.textContent = words(); return; }
        try {
          const q = (await T.api(`/api/run/${SLUG}/quote`, { body: lastList })).quote;
          price.textContent = q.amount ? `This list costs ${q.display} from your balance (${words()}).` : `This list is free for you now (${words()}).`;
        } catch {
          price.textContent = words();
        }
      }, 300);
    },
  };
}

// ---------- the address ----------

// ?sites=...&losses=...&cft=400&cpt=40&notice=2026-12-01&hours=&states=...&plan=...
// &est=NY&ehire=&esep=&enot=&epay=&eavg=&eben=&ewk=&epaid=. Multi-line fields take "|" between lines.
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const lines = (v) => v.split('|').join('\n');
  const set = (id, key, ok = () => true, map = (v) => v) => { const v = q.get(key); if (v !== null && v.length <= 4000 && ok(v)) $(id).value = map(v); };
  const isDate = (v) => v === '' || /^\d{4}-\d{2}-\d{2}$/.test(v);
  set('wn-sites', 'sites', () => true, lines);
  set('wn-losses', 'losses', () => true, lines);
  set('wn-cft', 'cft');
  set('wn-cpt', 'cpt');
  set('wn-notice', 'notice', isDate);
  set('wn-hours', 'hours');
  set('wn-states', 'states', () => true, lines);
  set('wn-plan', 'plan');
  set('wn-est', 'est', (v) => v === '' || ['CA', 'NY', 'NJ', 'IL', 'WA', 'ME'].includes(v));
  for (const k of ['ehire', 'esep', 'enot']) set(`wn-${k}`, k, isDate);
  for (const k of ['epay', 'eavg', 'eben', 'ewk', 'epaid']) set(`wn-${k}`, k);
  if (q.has('hours') || q.has('states')) $('wn-more').open = true;
  const has = (keys) => keys.some((k) => q.has(k));
  // A linked set of sites brings its own company: the example's totals and notice date do not carry over.
  if (has(['sites', 'losses'])) {
    if (!q.has('cft')) $('wn-cft').value = '';
    if (!q.has('cpt')) $('wn-cpt').value = '';
    if (!q.has('notice')) $('wn-notice').value = '';
  }
  return { check: has(['sites', 'losses', 'cft']), exposure: has(['ehire', 'esep', 'epay', 'est']) };
}

// ---------- start ----------

const soon = (fn, ms = 200) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };
const rosterCsv = () => ['employee,site,state,hire_date,weekly_hours,separation_date,reason', ...sampleRoster().map((r) => [r.id, r.site, r.state, r.hireDate, r.weeklyHours, r.separationDate ?? '', r.reason ?? ''].join(','))].join('\n');

async function start() {
  T.mountCodePanel($('wn-code'), SLUG);
  drawStates();
  $('wn-rows').value = rosterCsv();
  const linked = fromQuery();
  atRest = !linked.check;
  recomputeCheck();
  recomputeExposure();
  $('wn-check').addEventListener('input', () => { atRest = false; });
  for (const [form, fn] of [['wn-check', recomputeCheck], ['wn-exp', recomputeExposure]]) {
    $(form).addEventListener('submit', (e) => { e.preventDefault(); if (form === 'wn-check') atRest = false; fn(); });
    $(form).addEventListener('input', soon(fn));
    $(form).addEventListener('change', fn);
  }
  $('wn-rows').addEventListener('input', soon(recomputeList, 400));
  $('wn-plan').addEventListener('input', soon(recomputeList, 400));
  $('wn-file').addEventListener('change', async () => {
    const f = $('wn-file').files[0];
    if (!f) return;
    if (f.size > 3_000_000) { $('wn-list-err').textContent = 'The file is over 3 MB; split it by site.'; return; }
    $('wn-rows').value = await f.text();
    recomputeList();
  });
  try { tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool; } catch { tool = null; }
  buy = buyBox($('wn-buy'));
  recomputeList();
  $('wn-list-out').prepend(h('div', { class: 'tf-rh' }, h('span', { class: 'tf-tag' }, 'Example')));
  try { signedIn = !!(await T.me()); } catch { signedIn = false; }
  buy.refresh();
}

start();
