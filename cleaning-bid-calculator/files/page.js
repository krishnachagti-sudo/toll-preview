// The cleaning bid calculator page. core.js (the same file the server runs) works out the bid in
// the browser as you type, so it is free and never uses a run. The proposal PDF is the server's
// answer to the same input, through Endwise.run, and is the paid output. The official figures the
// engine needs are copied below from data/ (a test keeps the copy equal to the files).
import { makeEngine, BidError, CATEGORIES, CATEGORY_NAMES, PHASES, PHASE_NAMES } from './core.js';

/* DATA:BEGIN */
const DATA = {"wages":{"source":{"name":"U.S. Bureau of Labor Statistics, Occupational Employment and Wage Statistics (OEWS), May 2025 estimates","publisher":"U.S. Bureau of Labor Statistics","released":"2026-05-15","readOn":"2026-11-08","api":"https://api.bls.gov/publicAPI/v1/timeseries/data/","pages":{"home":"https://www.bls.gov/oes/","tables":"https://www.bls.gov/oes/tables.htm"},"seriesPattern":"OEU + N0000000 (US) or S + state FIPS + 00000, + 000000 (all industries) + occupation 372011 or 372012 + datatype 01 employment, 03 hourly mean, 08 hourly median","occupations":{"janitors":"37-2011 Janitors and Cleaners, Except Maids and Housekeeping Cleaners","maids":"37-2012 Maids and Housekeeping Cleaners"},"licence":"U.S. government work, public domain","note":"Hourly wages in US dollars, all industries, statewide. Employment is rounded by BLS. Values pulled with the BLS Public Data API v1 on the date read; no figure is edited."},"us":{"name":"United States","janitors":{"employment":2209760,"mean":"18.64","median":"17.71"},"maids":{"mean":"17.83","median":"17.07"}},"states":{"DE":{"name":"Delaware","fips":"10","janitors":{"employment":9220,"mean":"18.21","median":"16.98"},"maids":{"mean":"16.49","median":"16.42"}},"DC":{"name":"District of Columbia","fips":"11","janitors":{"employment":16400,"mean":"19.54","median":"18.52"},"maids":{"mean":"21.83","median":"20.32"}},"FL":{"name":"Florida","fips":"12","janitors":{"employment":131900,"mean":"16.86","median":"16.58"},"maids":{"mean":"16.78","median":"16.28"}},"GA":{"name":"Georgia","fips":"13","janitors":{"employment":55660,"mean":"16.54","median":"16.50"},"maids":{"mean":"15.02","median":"14.31"}},"HI":{"name":"Hawaii","fips":"15","janitors":{"employment":11230,"mean":"19.44","median":"18.13"},"maids":{"mean":"25.18","median":"24.81"}},"ID":{"name":"Idaho","fips":"16","janitors":{"employment":10800,"mean":"18.01","median":"17.36"},"maids":{"mean":"16.94","median":"16.62"}},"IL":{"name":"Illinois","fips":"17","janitors":{"employment":93760,"mean":"19.59","median":"18.18"},"maids":{"mean":"18.73","median":"17.49"}},"IN":{"name":"Indiana","fips":"18","janitors":{"employment":49220,"mean":"17.69","median":"17.53"},"maids":{"mean":"15.88","median":"15.11"}},"IA":{"name":"Iowa","fips":"19","janitors":{"employment":23960,"mean":"17.64","median":"17.01"},"maids":{"mean":"15.88","median":"15.68"}},"KS":{"name":"Kansas","fips":"20","janitors":{"employment":17220,"mean":"16.80","median":"16.58"},"maids":{"mean":"15.41","median":"14.95"}},"KY":{"name":"Kentucky","fips":"21","janitors":{"employment":25750,"mean":"16.71","median":"15.54"},"maids":{"mean":"15.35","median":"14.85"}},"LA":{"name":"Louisiana","fips":"22","janitors":{"employment":27610,"mean":"14.56","median":"13.91"},"maids":{"mean":"13.15","median":"12.79"}},"ME":{"name":"Maine","fips":"23","janitors":{"employment":9180,"mean":"19.83","median":"18.72"},"maids":{"mean":"18.84","median":"18.09"}},"MD":{"name":"Maryland","fips":"24","janitors":{"employment":40390,"mean":"18.88","median":"17.61"},"maids":{"mean":"17.40","median":"17.07"}},"MA":{"name":"Massachusetts","fips":"25","janitors":{"employment":55490,"mean":"21.75","median":"21.91"},"maids":{"mean":"20.38","median":"18.73"}},"MI":{"name":"Michigan","fips":"26","janitors":{"employment":65790,"mean":"17.81","median":"17.33"},"maids":{"mean":"16.36","median":"16.66"}},"MN":{"name":"Minnesota","fips":"27","janitors":{"employment":42300,"mean":"19.86","median":"19.04"},"maids":{"mean":"18.45","median":"18.01"}},"MS":{"name":"Mississippi","fips":"28","janitors":{"employment":15940,"mean":"14.32","median":"13.64"},"maids":{"mean":"12.43","median":"12.19"}},"MO":{"name":"Missouri","fips":"29","janitors":{"employment":41070,"mean":"17.92","median":"17.26"},"maids":{"mean":"16.41","median":"16.19"}},"MT":{"name":"Montana","fips":"30","janitors":{"employment":8320,"mean":"18.59","median":"17.84"},"maids":{"mean":"17.66","median":"17.18"}},"NE":{"name":"Nebraska","fips":"31","janitors":{"employment":12860,"mean":"17.95","median":"17.26"},"maids":{"mean":"16.45","median":"16.43"}},"NV":{"name":"Nevada","fips":"32","janitors":{"employment":32830,"mean":"19.16","median":"18.47"},"maids":{"mean":"20.89","median":"22.38"}},"NH":{"name":"New Hampshire","fips":"33","janitors":{"employment":9420,"mean":"19.76","median":"18.82"},"maids":{"mean":"18.31","median":"17.75"}},"NJ":{"name":"New Jersey","fips":"34","janitors":{"employment":67660,"mean":"19.57","median":"18.09"},"maids":{"mean":"19.10","median":"18.26"}},"NM":{"name":"New Mexico","fips":"35","janitors":{"employment":14360,"mean":"17.52","median":"17.32"},"maids":{"mean":"15.46","median":"14.65"}},"NY":{"name":"New York","fips":"36","janitors":{"employment":195250,"mean":"21.55","median":"20.02"},"maids":{"mean":"23.88","median":"20.17"}},"NC":{"name":"North Carolina","fips":"37","janitors":{"employment":53330,"mean":"16.39","median":"16.59"},"maids":{"mean":"16.07","median":"15.05"}},"ND":{"name":"North Dakota","fips":"38","janitors":{"employment":6720,"mean":"19.34","median":"18.15"},"maids":{"mean":"17.14","median":"16.85"}},"OH":{"name":"Ohio","fips":"39","janitors":{"employment":72540,"mean":"18.06","median":"17.26"},"maids":{"mean":"15.68","median":"15.47"}},"OK":{"name":"Oklahoma","fips":"40","janitors":{"employment":23620,"mean":"15.52","median":"14.96"},"maids":{"mean":"14.21","median":"13.76"}},"OR":{"name":"Oregon","fips":"41","janitors":{"employment":25890,"mean":"20.29","median":"18.92"},"maids":{"mean":"19.00","median":"18.07"}},"PA":{"name":"Pennsylvania","fips":"42","janitors":{"employment":86920,"mean":"18.16","median":"17.56"},"maids":{"mean":"16.23","median":"16.29"}},"RI":{"name":"Rhode Island","fips":"44","janitors":{"employment":7270,"mean":"19.42","median":"17.94"},"maids":{"mean":"18.88","median":"18.05"}},"SC":{"name":"South Carolina","fips":"45","janitors":{"employment":30100,"mean":"15.73","median":"14.99"},"maids":{"mean":"14.88","median":"14.55"}},"SD":{"name":"South Dakota","fips":"46","janitors":{"employment":8630,"mean":"17.48","median":"17.06"},"maids":{"mean":"15.38","median":"14.40"}},"TN":{"name":"Tennessee","fips":"47","janitors":{"employment":38120,"mean":"16.66","median":"16.08"},"maids":{"mean":"15.24","median":"14.83"}},"TX":{"name":"Texas","fips":"48","janitors":{"employment":184840,"mean":"16.29","median":"15.87"},"maids":{"mean":"14.56","median":"14.26"}},"UT":{"name":"Utah","fips":"49","janitors":{"employment":24710,"mean":"16.64","median":"15.48"},"maids":{"mean":"17.65","median":"17.44"}},"VT":{"name":"Vermont","fips":"50","janitors":{"employment":5130,"mean":"20.35","median":"19.67"},"maids":{"mean":"18.63","median":"18.12"}},"VA":{"name":"Virginia","fips":"51","janitors":{"employment":65970,"mean":"17.55","median":"16.91"},"maids":{"mean":"16.59","median":"16.26"}},"WA":{"name":"Washington","fips":"53","janitors":{"employment":47380,"mean":"22.79","median":"21.89"},"maids":{"mean":"20.61","median":"20.28"}},"WV":{"name":"West Virginia","fips":"54","janitors":{"employment":9340,"mean":"15.96","median":"14.90"},"maids":{"mean":"13.97","median":"13.51"}},"WI":{"name":"Wisconsin","fips":"55","janitors":{"employment":45640,"mean":"18.53","median":"17.79"},"maids":{"mean":"17.13","median":"17.08"}},"WY":{"name":"Wyoming","fips":"56","janitors":{"employment":4760,"mean":"18.04","median":"17.33"},"maids":{"mean":"16.26","median":"15.32"}},"AL":{"name":"Alabama","fips":"01","janitors":{"employment":25110,"mean":"15.51","median":"14.72"},"maids":{"mean":"13.40","median":"13.21"}},"AK":{"name":"Alaska","fips":"02","janitors":{"employment":5200,"mean":"20.05","median":"19.48"},"maids":{"mean":"19.03","median":"17.97"}},"AZ":{"name":"Arizona","fips":"04","janitors":{"employment":38290,"mean":"18.17","median":"17.42"},"maids":{"mean":"17.67","median":"17.13"}},"AR":{"name":"Arkansas","fips":"05","janitors":{"employment":19490,"mean":"15.21","median":"14.30"},"maids":{"mean":"13.86","median":"13.44"}},"CA":{"name":"California","fips":"06","janitors":{"employment":234240,"mean":"21.25","median":"19.75"},"maids":{"mean":"22.08","median":"20.51"}},"CO":{"name":"Colorado","fips":"08","janitors":{"employment":34220,"mean":"20.11","median":"18.56"},"maids":{"mean":"18.99","median":"18.06"}},"CT":{"name":"Connecticut","fips":"09","janitors":{"employment":28740,"mean":"20.48","median":"18.25"},"maids":{"mean":"18.22","median":"17.39"}}}},"payroll":{"readOn":"2026-11-08","irs":{"source":"IRS Publication 15 (2026), (Circular E), Employer's Tax Guide","url":"https://www.irs.gov/publications/p15","year":2026,"socialSecurityRate":"6.2","socialSecurityWageBase":184500,"medicareRate":"1.45","futaRate":"6.0","futaMaxCredit":"5.4","futaNetRate":"0.6","futaWageBase":7000,"quotes":{"socialSecurity":"The rate of social security tax on taxable wages is 6.2% each for the employer and employee.","wageBase":"The social security wage base limit is $184,500.","medicare":"The Medicare tax rate is 1.45% each for the employee and employer, unchanged from 2025.","futa":"For 2026, the FUTA tax rate is 6.0%.","futaBase":"The tax applies to the first $7,000 you pay to each employee as wages during the year.","futaNet":"If you're entitled to the maximum 5.4% credit, the FUTA tax rate after credit is 0.6%."}},"ecec":{"source":"BLS Employer Costs for Employee Compensation, June 2026 (USDL-26-1494), Table 4, private industry workers, service occupations","url":"https://www.bls.gov/news.release/ecec.t04.htm","release":"https://www.bls.gov/news.release/ecec.nr0.htm","released":"2026-09-09","referenceMonth":"2026-06","basis":"employer cost per hour worked","serviceOccupations":{"totalCompensation":"23.73","wages":"18.26","wagesPercent":"76.9","benefits":"5.47","benefitsPercent":"23.1","paidLeave":"1.03","supplementalPay":"0.63","insurance":"1.36","retirement":"0.38","legallyRequired":"2.08"},"allPrivateIndustry":{"totalCompensation":"46.89","wages":"32.82","wagesPercent":"70.0","benefits":"14.07","benefitsPercent":"30.0"}}},"minimum":{"source":"U.S. Department of Labor, Wage and Hour Division: State Minimum Wage Laws (basic minimum rate, non-farm employment)","url":"https://www.dol.gov/agencies/whd/minimum-wage/state","pageUpdated":"2026-11-05","readOn":"2026-11-08","federal":"7.25","note":"basic is the state's basic minimum rate as DOL prints it (null where the state has no minimum wage law). Where DOL lists several rates, basic is the standard statewide rate and note says what else applies. Employers covered by the federal FLSA pay at least $7.25. City and county minimums are not in this table.","states":{"AL":{"basic":null,"note":"No state minimum wage law."},"AK":{"basic":"14.00"},"AZ":{"basic":"15.15"},"AR":{"basic":"11.00","note":"Employers with 4 or more employees."},"CA":{"basic":"16.90"},"CO":{"basic":"15.16"},"CT":{"basic":"16.94"},"DE":{"basic":"15.00"},"DC":{"basic":"18.40"},"FL":{"basic":"15.00"},"GA":{"basic":"5.15","note":"Employers of 6 or more; FLSA-covered employers pay $7.25."},"HI":{"basic":"16.00"},"ID":{"basic":"7.25"},"IL":{"basic":"15.00","note":"Employers of 4 or more, excluding family members."},"IN":{"basic":"7.25","note":"Employers of 2 or more."},"IA":{"basic":"7.25"},"KS":{"basic":"7.25"},"KY":{"basic":"7.25"},"LA":{"basic":null,"note":"No state minimum wage law."},"ME":{"basic":"15.10"},"MD":{"basic":"15.00"},"MA":{"basic":"15.00"},"MI":{"basic":"13.73","note":"Employers of 2 or more. DOL: scheduled to increase on January 1, 2027 to $15.00.","next":{"date":"2027-01-01","basic":"15.00"}},"MN":{"basic":"11.41"},"MS":{"basic":null,"note":"No state minimum wage law."},"MO":{"basic":"15.00"},"MT":{"basic":"10.85","note":"Businesses with gross annual sales over $110,000; $4.00 for non-FLSA businesses with sales of $110,000 or less."},"NE":{"basic":"15.00","note":"Employers of 4 or more."},"NV":{"basic":"12.00"},"NH":{"basic":"7.25"},"NJ":{"basic":"15.92","note":"$15.23 for employers of fewer than 6 and seasonal employees."},"NM":{"basic":"12.00"},"NY":{"basic":"16.00","note":"Remainder of the state; $17.00 in New York City and Nassau, Suffolk and Westchester counties."},"NC":{"basic":"7.25"},"ND":{"basic":"7.25"},"OH":{"basic":"11.00","note":"Employers with annual gross receipts of $405,000 or more; $7.25 for smaller employers."},"OK":{"basic":"7.25","note":"Employers of 10 or more full-time employees at one location or with sales over $100,000; $2.00 for others."},"OR":{"basic":"15.55","note":"Standard state rate; $16.80 in the Portland metro area and $14.55 in non-urban counties."},"PA":{"basic":"7.25"},"RI":{"basic":"16.00"},"SC":{"basic":null,"note":"No state minimum wage law."},"SD":{"basic":"11.85"},"TN":{"basic":null,"note":"No state minimum wage law."},"TX":{"basic":"7.25"},"UT":{"basic":"7.25"},"VT":{"basic":"14.42","note":"Employers of 2 or more."},"VA":{"basic":"12.77"},"WA":{"basic":"17.13"},"WV":{"basic":"8.75","note":"Employers of 6 or more at one location."},"WI":{"basic":"7.25"},"WY":{"basic":"5.15","note":"FLSA-covered employers pay $7.25."}}}};
/* DATA:END */

const T = window.Endwise;
const h = T.h;
const SLUG = 'cleaning-bid-calculator';
const $ = (id) => document.getElementById(id);
const engine = makeEngine(DATA);

let tool = null;
let signedIn = false;
let last = null; // the last good { input, result }

// ---------- task and extra rows ----------

const FIELDS = ['task', 'category', 'phase', 'sqft', 'rate', 'count', 'minutes', 'hours'];
const isPost = () => $('cb-type').value === 'post-construction';

function lineRow(v = {}) {
  const i = $('cb-lines').children.length;
  const sel = (cls, options, value, label) => h('select', { class: cls, 'aria-label': label }, options.map(([k, t]) => h('option', { value: k, selected: k === value ? '' : null }, t)));
  const inp = (cls, value, placeholder, label, mode = 'decimal') => h('input', { type: 'text', class: cls, value: value ?? '', placeholder, inputmode: mode, autocomplete: 'off', 'aria-label': label });
  const row = h('div', { class: 'cb-line' }, [
    inp('l-task', v.task, 'Task, such as Vacuum carpet', `Task ${i + 1}`, 'text'),
    sel('l-category', CATEGORIES.map((c) => [c, CATEGORY_NAMES[c]]), v.category ?? 'area', `Kind of task ${i + 1}`),
    sel('l-phase cb-post', PHASES.map((p) => [p, PHASE_NAMES[p]]), v.phase ?? 'final', `Phase of task ${i + 1}`),
    inp('l-sqft', v.sqft, 'sq ft (all)', `Square feet, task ${i + 1}`),
    inp('l-rate', v.rate, 'sq ft/hour', `Production rate, task ${i + 1}`),
    inp('l-count', v.count, 'count', `Count, task ${i + 1}`, 'numeric'),
    inp('l-minutes', v.minutes, 'min each', `Minutes each, task ${i + 1}`),
    inp('l-hours', v.hours, 'or hours', `Hours, task ${i + 1}`),
    h('span', { class: 'l-out' }),
    h('button', { type: 'button', class: 'cb-x', 'aria-label': `Remove task ${i + 1}` }, '×'),
  ]);
  row.querySelector('.cb-x').addEventListener('click', () => { row.remove(); recompute(); });
  $('cb-lines').append(row);
}
function extraRow(v = {}) {
  const row = h('div', { class: 'cb-extra' }, [
    h('input', { type: 'text', class: 'x-name', value: v.name ?? '', placeholder: 'Extra, such as Dumpster haul', 'aria-label': 'Extra charge' }),
    h('input', { type: 'text', class: 'x-amount', value: v.amount ?? '', placeholder: 'cost $', inputmode: 'decimal', 'aria-label': 'Its cost in dollars' }),
    h('select', { class: 'x-phase cb-post', 'aria-label': 'Phase' }, [h('option', { value: '' }, 'Whole job'), ...PHASES.map((p) => h('option', { value: p, selected: p === v.phase ? '' : null }, PHASE_NAMES[p]))]),
    h('button', { type: 'button', class: 'cb-x', 'aria-label': 'Remove extra' }, '×'),
  ]);
  row.querySelector('.cb-x').addEventListener('click', () => { row.remove(); recompute(); });
  $('cb-extras').append(row);
}

// ---------- the form ----------

const val = (id) => $(id).value.trim();
function readForm() {
  const post = isPost();
  const lines = [];
  for (const row of $('cb-lines').children) {
    const get = (f) => row.querySelector(`.l-${f}`).value.trim();
    if (!get('task') && !get('rate') && !get('count') && !get('hours')) continue;
    const l = { task: get('task'), category: get('category') };
    if (post) l.phase = get('phase');
    for (const f of ['sqft', 'rate', 'count', 'minutes', 'hours']) if (get(f)) l[f] = get(f);
    lines.push(l);
  }
  const input = { type: post ? 'post-construction' : 'janitorial', sqft: val('cb-sqft'), lines };
  if (!post) input.visitsPerWeek = val('cb-visits') || '5';
  if (val('cb-crew')) input.crew = val('cb-crew');
  const src = $('cb-wsrc').value;
  input.wage = src === 'mine' ? { hourly: val('cb-wage') } : { state: src, occupation: $('cb-occ').value, stat: $('cb-stat').value };
  const mode = $('cb-bmode').value;
  if (mode === 'itemized') {
    input.burden = { mode };
    if (!$('cb-fica').checked) input.burden.fica = false;
    if (!$('cb-futa').checked) input.burden.futa = false;
    if (val('cb-suta')) input.burden.suta = val('cb-suta');
    if (val('cb-wc')) input.burden.workersComp = val('cb-wc');
    if (val('cb-ben')) input.burden.benefits = val('cb-ben');
  } else if (mode === 'flat') input.burden = { mode, percent: val('cb-bpct') || '0' };
  else input.burden = { mode };
  input.suppliesPercent = val('cb-sup') || '0';
  input.overheadPercent = val('cb-oh') || '0';
  input.marginPercent = val('cb-margin') || '0';
  if (val('cb-min')) input.minimum = val('cb-min');
  if ($('cb-state').value) input.state = $('cb-state').value;
  const extras = [];
  for (const row of $('cb-extras').children) {
    const name = row.querySelector('.x-name').value.trim();
    const amount = row.querySelector('.x-amount').value.trim();
    if (!name && !amount) continue;
    const x = { name, amount };
    const ph = row.querySelector('.x-phase').value;
    if (post && ph) x.phase = ph;
    extras.push(x);
  }
  if (extras.length) input.extras = extras;
  if (val('cb-tlow') || val('cb-thigh')) {
    input.target = { per: post ? 'job' : $('cb-tper').value };
    if (val('cb-tlow')) input.target.low = val('cb-tlow');
    if (val('cb-thigh')) input.target.high = val('cb-thigh');
  }
  return input;
}

function showModes() {
  const post = isPost();
  document.querySelectorAll('.cb-jan').forEach((el) => { el.hidden = post; });
  document.querySelectorAll('.cb-post').forEach((el) => { el.hidden = !post; });
  const mine = $('cb-wsrc').value === 'mine';
  $('cb-wage-mine').hidden = !mine;
  document.querySelectorAll('.cb-bls').forEach((el) => { el.hidden = mine; });
  const mode = $('cb-bmode').value;
  document.querySelectorAll('.cb-b-item').forEach((el) => { el.hidden = mode !== 'itemized'; });
  document.querySelectorAll('.cb-b-flat').forEach((el) => { el.hidden = mode !== 'flat'; });
}

// ---------- the result ----------

function put(el, ...nodes) {
  el.textContent = '';
  for (const n of nodes.flat()) if (n) el.append(n);
}
const fact = (k, v) => h('div', {}, [h('dt', {}, k), h('dd', {}, v)]);
const table = (cols, rows) => h('div', { class: 'table-scroll' }, h('table', { class: 'rules cb-table' }, [
  h('thead', {}, h('tr', {}, cols.map((c, i) => h('th', { scope: 'col', class: i > 1 ? 'num' : null }, c)))),
  h('tbody', {}, rows.map((r) => h('tr', {}, r.map((c, i) => (i ? h('td', { class: i > 1 ? 'num' : null }, c) : h('th', { scope: 'row' }, c)))))),
]));

// The inputs in one line: "25,000 sq ft, 5 visits a week, 5 tasks, BLS United States median wage, 15% margin".
function inputsLine(input, r) {
  const n = input.lines.length;
  const w = input.wage.hourly ? `$${input.wage.hourly}/h wage` : `BLS ${input.wage.state === 'US' ? 'United States' : DATA.wages.states[input.wage.state]?.name ?? input.wage.state} ${input.wage.stat} wage`;
  return [
    `${Number(r.sqft).toLocaleString('en-US')} sq ft`,
    r.type === 'post-construction' ? 'post-construction' : `${r.visitsPerWeek} visits a week`,
    `${n} ${n === 1 ? 'task' : 'tasks'}`,
    w,
    `${r.rates.marginPercent} margin`,
  ].join(', ');
}

const item = (k, label, amount, why, cls = null) => h('li', { class: cls }, [
  h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, label), amount ? h('b', {}, amount) : null, h('em', {}, why),
]);

// The bid like the other tool pages: a header row, the inputs, the price as the big figure, then
// one line per figure with where it comes from; the task and cost tables are folded.
function render(r, { example = false, input = last?.input } = {}) {
  const post = r.type === 'post-construction';
  const part = post ? r.job : r.visit;
  const w = r.rates.wage;
  const n = r.lines.length;
  const items = [
    item('h', 'Labor hours', post ? part.hours : `${part.hours} a visit`, `from ${n} ${n === 1 ? 'task' : 'tasks'} at your production rates`),
    r.crew ? item('h', 'On site', `${part.onSiteHours} h`, `with a crew of ${r.crew}`) : null,
    item('$', 'Wage', `${w.wage}/h`, w.wageSource),
    item('$', 'Loaded labor', `${w.loaded}/h`, `the wage plus ${r.rates.burden.percent} payroll burden`),
    item('$', 'Billed', `${w.billed}/h`, `with ${r.rates.suppliesPercent} supplies, ${r.rates.overheadPercent} overhead and a ${r.rates.marginPercent} margin (${w.markupOnCost} markup)`),
    ...(post
      ? r.phases.map((ph) => item(ph.name.slice(0, 1), ph.name, ph.price, `${ph.hours} labor hours, ${ph.perSqft} per sq ft`, 'plain'))
      : [item('×', 'A month', r.month.price, `the visit price × ${r.visitsPerWeek} visits a week × 52 weeks ÷ 12`, 'hi')]),
    item('/', '$/sq ft', post ? r.perSqft.job : `${r.perSqft.month} a month`, post ? `the job price over ${Number(r.sqft).toLocaleString('en-US')} cleanable sq ft` : `the monthly price over ${Number(r.sqft).toLocaleString('en-US')} cleanable sq ft (${r.perSqft.visit} a visit)`),
    r.counts.panes ? item('#', 'Per pane', r.lines.filter((l) => l.category === 'glass' && l.pricePerItem).map((l) => l.pricePerItem).join(', '), `${r.counts.panes} glass panes`) : null,
  ];
  put($('cb-out'),
    h('div', { class: 'tf-rh' }, [
      example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
      h('span', { class: 'tf-src' }, example ? 'Sample production rates' : (post ? 'Post-construction' : 'Janitorial')),
    ]),
    input ? h('p', { class: 'tf-exin' }, example ? `Example: ${inputsLine(input, r)}` : inputsLine(input, r)) : null,
    h('p', { class: 'tf-big' }, [h('b', {}, r.headline.price), h('span', {}, post ? 'for the job' : `a visit, ${r.month.price} a month`)]),
    h('p', { class: 'tf-sub' }, r.answer),
    h('ul', { class: 'tf-items cb-items' }, items),
    r.check ? h('p', { class: `cb-check cb-${r.check.status}` }, `${r.check.message} Break-even: ${r.check.breakeven} per sq ft.`) : null,
    r.flags.length ? [h('p', { class: 'cb-label' }, `Checks (${r.flags.length})`), h('ul', { class: 'cb-flags' }, r.flags.map((f) => h('li', {}, f.message)))] : null,
    post ? h('details', { class: 'xpand' }, [h('summary', {}, 'By phase'), h('div', { class: 'xp-in' }, table(['Phase', 'Hours', 'Price', '$/sq ft'], r.phases.map((p) => [p.name, p.hours, p.price, p.perSqft])))]) : null,
    h('details', { class: 'xpand' }, [h('summary', {}, `By task (${n + r.extras.length})`), h('div', { class: 'xp-in' }, table(['Task', 'Measure', 'Hours', 'Price'], [
      ...r.lines.map((l) => [`${l.task}${post ? ` (${PHASE_NAMES[l.phase].toLowerCase()})` : ''}`, l.how, l.hours, l.price]),
      ...r.extras.map((x) => [`${x.name}${x.phase ? ` (${PHASE_NAMES[x.phase].toLowerCase()})` : ''}`, `cost ${x.cost}`, '', x.price]),
    ]))]),
    h('details', { class: 'xpand' }, [h('summary', {}, 'Cost build-up'), h('div', { class: 'xp-in' }, table(['Part', 'Basis', post ? 'Job' : 'Visit'], [
      ['Wages', `${w.wage}/h, ${w.wageSource}`, part.wages, ''],
      ['Payroll burden', r.rates.burden.lines.map((l) => `${l.percent} ${l.name.split(' (')[0].replace(/^./, (c) => c.toLowerCase())}`).join('; ') || 'none', part.burden, ''],
      ['Supplies and equipment', r.rates.suppliesPercent, part.supplies, ''],
      ...(r.extras.length ? [['Extras', 'at cost', part.extras, '']] : []),
      ['Overhead', r.rates.overheadPercent, part.overhead, ''],
      ['Profit', `${r.rates.marginPercent} margin (${w.markupOnCost} markup)`, part.profit, ''],
      ['Price', '', part.price, ''],
    ].map((row) => row.slice(0, 3))))]),
    h('p', { class: 'tf-cost' }, 'Worked out on this page, free.'),
  );
  // Each line's hours beside its row.
  [...$('cb-lines').children].filter((row) => row.querySelector('.l-task').value.trim() || row.querySelector('.l-rate').value.trim() || row.querySelector('.l-count').value.trim() || row.querySelector('.l-hours').value.trim())
    .forEach((row, i) => { row.querySelector('.l-out').textContent = r.lines[i] ? `${r.lines[i].hours} h` : ''; });
}

function recompute() {
  $('cb-err').textContent = '';
  showModes();
  try {
    const input = readForm();
    const result = engine.bid(input);
    last = { input, result };
    render(result);
  } catch (e) {
    if (!(e instanceof BidError)) throw e;
    last = null;
    $('cb-err').textContent = e.message;
  }
  if (buy) buy.refresh();
}

// ---------- the proposal PDF ----------

function download(name, body) {
  return h('a', { href: URL.createObjectURL(body), download: name }, name);
}
function base64Blob(b64, type) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return new Blob([out], { type });
}
function costNote(json) {
  if (json.charged) return json.charged.amount ? `Charged ${json.charged.display}. Your balance is ${json.balance.display}.` : 'Free: a corrected proposal for the same job.';
  return '';
}
function errorInto(box, e) {
  box.textContent = e.message;
  if (e.code === 'unauthorized' || e.code === 'rate_limited') box.append(' ', h('a', { href: `${T.base}/account` }, 'Sign in'));
  if (e.code === 'insufficient_balance' || e.code === 'cap_reached') box.append(' ', h('a', { href: `${T.base}/account#top-up` }, 'Open your account'));
}

function proposalInput() {
  if (!last) return null;
  const company = val('cb-company');
  const client = val('cb-client');
  const job = val('cb-job');
  if (!company || !client || !job) return null;
  const extra = { detail: $('cb-detail').value };
  if (val('cb-addr')) extra.address = val('cb-addr');
  if (val('cb-date')) extra.date = val('cb-date');
  if (/^\d{1,3}$/.test(val('cb-valid')) && Number(val('cb-valid')) >= 1) extra.validDays = Number(val('cb-valid'));
  if (val('cb-notes')) extra.notes = val('cb-notes');
  return { op: 'proposal', company, client, job, ...extra, ...last.input };
}

let buy = null;
function buyBox(el) {
  const price = h('p', { class: 'cb-aside' });
  const button = h('button', { class: 'btn', type: 'button' }, 'Download the proposal PDF');
  const got = h('p', { class: 'cb-got', role: 'status' });
  const err = h('p', { class: 'form-error', role: 'alert' });
  const words = () => {
    const text = tool?.pricing?.actions.find((a) => a.name === 'proposal')?.text;
    return text ? T.money(text) : '';
  };
  button.addEventListener('click', async () => {
    err.textContent = '';
    const input = proposalInput();
    if (!input) { err.textContent = last ? 'Name your company, the client and the job first.' : 'Fix the bid above first.'; return; }
    button.disabled = true;
    try {
      const json = await T.run(SLUG, input);
      const pdf = json.result.pdf;
      got.textContent = '';
      got.append('Your proposal: ', download(pdf.filename, base64Blob(pdf.base64, 'application/pdf')), ' and ', download(pdf.filename.replace(/\.pdf$/, '.csv'), new Blob([json.result.csv], { type: 'text/csv' })), `. ${costNote(json)}`);
    } catch (e) {
      errorInto(err, e);
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
        const input = proposalInput();
        if (!signedIn) { price.textContent = `${words()}. Sign in to download.`; return; }
        if (!input) { price.textContent = words(); return; }
        try {
          const q = (await T.api(`/api/run/${SLUG}/quote`, { body: input })).quote;
          price.textContent = q.amount ? `This proposal costs ${q.display} from your balance (${words()}).` : `This proposal is free for you now (${words()}).`;
        } catch {
          price.textContent = words();
        }
      }, 300);
    },
  };
}

function sampleLink() {
  const ex = tool?.examples.find((x) => x.input.op === 'proposal');
  const box = $('cb-sample-link');
  if (!ex?.output.pdf || !box) return;
  box.textContent = '';
  box.append(download(ex.output.pdf.filename, base64Blob(ex.output.pdf.base64, 'application/pdf')), ' (PDF).');
}

// ---------- the timing box ----------

function timing() {
  const out = $('cb-timing-out');
  try {
    const count = val('cb-tcount');
    out.textContent = engine.rate(count ? { count, minutes: val('cb-tmin') } : { sqft: val('cb-tsq'), minutes: val('cb-tmin') }).answer;
  } catch (e) {
    if (!(e instanceof BidError)) throw e;
    out.textContent = e.message;
  }
}

// ---------- the address ----------

// ?type=post-construction&sqft=12000&visits=5&crew=3&wage=18.50 (or &wsrc=OH&occ=janitors&stat=median)
// &bmode=itemized&suta=2.7&wc=4&sup=6&oh=15&margin=15&min=150&state=OH&tlow=0.1&thigh=0.2&tper=month
// &l0=task|category|phase|sqft|rate|count|minutes|hours (l0 to l39) &x0=name|amount|phase
// and the timing box: ?tsq=1500&tmin=25 or ?tcount=12&tmin=50
function fromQuery() {
  const q = new URLSearchParams(location.search);
  const set = (id, key, ok = () => true) => { const v = q.get(key); if (v !== null && v.length <= 80 && ok(v)) $(id).value = v; };
  set('cb-type', 'type', (v) => v === 'janitorial' || v === 'post-construction');
  for (const [id, key] of [['cb-sqft', 'sqft'], ['cb-visits', 'visits'], ['cb-crew', 'crew'], ['cb-wage', 'wage'], ['cb-suta', 'suta'], ['cb-wc', 'wc'], ['cb-ben', 'ben'], ['cb-bpct', 'bpct'], ['cb-sup', 'sup'], ['cb-oh', 'oh'], ['cb-margin', 'margin'], ['cb-min', 'min'], ['cb-tlow', 'tlow'], ['cb-thigh', 'thigh'], ['cb-tsq', 'tsq'], ['cb-tcount', 'tcount'], ['cb-tmin', 'tmin']]) set(id, key);
  set('cb-wsrc', 'wsrc', (v) => [...$('cb-wsrc').options].some((o) => o.value === v));
  if (q.has('wage') && !q.has('wsrc')) $('cb-wsrc').value = 'mine';
  set('cb-occ', 'occ', (v) => v === 'janitors' || v === 'maids');
  set('cb-stat', 'stat', (v) => v === 'median' || v === 'mean');
  set('cb-bmode', 'bmode', (v) => ['itemized', 'ecec', 'flat'].includes(v));
  set('cb-state', 'state', (v) => [...$('cb-state').options].some((o) => o.value === v));
  set('cb-tper', 'tper', (v) => v === 'month' || v === 'visit');
  const lines = [];
  for (let i = 0; i < 40; i++) {
    const v = q.get(`l${i}`);
    if (v === null) continue;
    const parts = v.slice(0, 200).split('|');
    lines.push(Object.fromEntries(FIELDS.map((f, k) => [f, parts[k] ?? '']).filter(([, x]) => x !== '')));
  }
  const extras = [];
  for (let i = 0; i < 20; i++) {
    const v = q.get(`x${i}`);
    if (v === null) continue;
    const [name, amount, phase] = v.slice(0, 120).split('|');
    extras.push({ name, amount, phase });
  }
  if (extras.length || q.has('tlow') || q.has('thigh')) $('cb-more').open = true;
  if (lines.length) $('cb-tasks-fold').open = true;
  return { lines: lines.length ? lines : null, extras };
}

// ---------- start ----------

const soon = (fn, ms = 200) => { let t = null; return () => { clearTimeout(t); t = setTimeout(fn, ms); }; };

// The worked example at rest: the tool's office example, with its sample rates.
const EXAMPLE = {
  lines: [
    { task: 'Vacuum carpeted offices', category: 'area', sqft: '18000', rate: '3600' },
    { task: 'Dust mop and damp mop hard floors', category: 'area', sqft: '7000', rate: '2800' },
    { task: 'Empty trash and recycling', category: 'other', count: '120', minutes: '0.75' },
    { task: 'Clean restroom fixtures and refill dispensers', category: 'restroom', count: '16', minutes: '4' },
    { task: 'Entrance door glass', category: 'glass', count: '6', minutes: '2' },
  ],
};

async function start() {
  const chip = document.querySelector('[data-endwise-chip]');
  if (chip) T.mountAccountChip(chip);
  T.mountCodePanel($('cb-code'), SLUG);
  const states = Object.entries(DATA.wages.states).sort((a, b) => a[1].name.localeCompare(b[1].name));
  $('cb-wsrc').append(h('option', { value: 'mine' }, 'My own wage'), h('option', { value: 'US', selected: '' }, 'BLS: United States'), ...states.map(([k, s]) => h('option', { value: k }, `BLS: ${s.name}`)));
  $('cb-state').append(h('option', { value: '' }, 'None'), ...states.map(([k, s]) => h('option', { value: k }, s.name)));
  const linked = fromQuery();
  if (!linked.lines && !new URLSearchParams(location.search).has('suta')) { $('cb-suta').value = '2.7'; $('cb-wc').value = '4'; }
  for (const l of linked.lines ?? EXAMPLE.lines) lineRow(l);
  for (const x of linked.extras) extraRow(x);
  recompute();
  if (!linked.lines && last) render(last.result, { example: true });
  timing();

  const form = $('cb-form');
  // The button shows the bid for the form as it stands (it also updates as you type).
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    recompute();
    if (last && window.matchMedia('(max-width: 1080px)').matches) $('cb-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  form.addEventListener('input', soon(recompute));
  form.addEventListener('change', recompute);
  $('cb-add-line').addEventListener('click', () => { lineRow({ category: 'area', phase: isPost() ? 'final' : undefined }); showModes(); });
  $('cb-add-extra').addEventListener('click', () => { extraRow(); showModes(); });
  $('cb-timing').addEventListener('input', soon(timing));
  for (const id of ['cb-company', 'cb-client', 'cb-job', 'cb-addr', 'cb-date', 'cb-valid', 'cb-detail', 'cb-notes']) $(id).addEventListener('input', () => buy && buy.refresh());

  try {
    tool = (await T.api(`/api/v1/tools/${SLUG}`)).tool;
  } catch {
    tool = null;
  }
  sampleLink();
  buy = buyBox($('cb-buy'));
  try { signedIn = !!(await T.me()); } catch { signedIn = false; }
  buy.refresh();
}

start();
