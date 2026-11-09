// The statistical tables page. core.js (the same file the server runs) computes every answer in the
// browser as you type, so the page is free and never uses a run. The API and MCP run the same code.
import { compute, constantsFor, CONSTANT_NAMES, CONSTANT_INFO, exampleSubgroups, StatsError, DIST_NAMES } from './core.js';

const T = window.Endwise;
const h = T.h;
const $ = (id) => document.getElementById(id);
const fx = (x, d = 4) => (typeof x === 'number' && Number.isFinite(x) ? String(Number(x.toFixed(d))) : String(x));
const LABEL = { d2inv: '1/d2', c4inv: '1/c4' };

const EXAMPLE = exampleSubgroups().map((g) => g.join(' ')).join('\n');
const NIST_FLOW = '49.6 47.6 49.9 51.3 47.8 51.2 52.6 52.4 53.6 52.1';

// ---------- reading the form ----------

const num = (id, what, field) => {
  const v = $(id).value.trim();
  const n = Number(v);
  if (v === '' || !Number.isFinite(n)) throw new StatsError(`${what} must be a number.`, field);
  return n;
};
const rows = () => $('st-data').value.trim().split(/\n+/).map((l) => l.trim()).filter(Boolean)
  .map((l) => l.split(/[\s,;\t]+/).filter(Boolean).map(Number));

function readInput() {
  const op = $('st-op').value;
  if (op === 'constants') return { op, n: num('st-n', 'n', 'n') };
  if (op === 'critical' || op === 'probability') {
    const dist = $('st-dist').value;
    const o = { op, dist };
    if (op === 'critical') { o.alpha = num('st-alpha', 'Alpha', 'alpha'); o.tail = $('st-tail').value; } else o.x = num('st-x', 'The test statistic', 'x');
    if (dist === 't' || dist === 'chi-square') o.df = num('st-df', 'Degrees of freedom', 'df');
    if (dist === 'f') { o.df1 = num('st-df1', 'df1', 'df1'); o.df2 = num('st-df2', 'df2', 'df2'); }
    return o;
  }
  if (op === 'limits' || op === 'capability') {
    const r = rows();
    if (r.flat().some((v) => !Number.isFinite(v))) throw new StatsError('Every reading must be a number.', 'subgroups');
    const chart = $('st-chart').value;
    const single = op === 'limits' ? chart === 'i-mr' : r.every((g) => g.length === 1) || r.length === 1;
    const data = single ? { values: r.flat() } : { subgroups: r };
    if (op === 'limits') return { op, chart, ...data };
    const o = { op, ...data };
    if ($('st-lsl').value.trim()) o.lsl = num('st-lsl', 'LSL', 'lsl');
    if ($('st-usl').value.trim()) o.usl = num('st-usl', 'USL', 'usl');
    return o;
  }
  if (op === 'sigma') return { op, [$('st-from').value]: num('st-sv', 'The value', 'dpmo'), shift: num('st-shift', 'Shift', 'shift') };
  const o = { op, n: num('st-ocn', 'n', 'n'), c: num('st-occ', 'Ac', 'c') };
  if ($('st-lot').value.trim()) o.lotSize = num('st-lot', 'Lot size', 'lotSize');
  return o;
}

// ---------- drawing ----------

const table = (head, body, cls = 'st-table') => h('div', { class: 'table-scroll' }, [h('table', { class: cls }, [
  h('thead', {}, [h('tr', {}, head.map((c) => h('th', { scope: 'col' }, c)))]),
  h('tbody', {}, body.map((r) => h('tr', {}, r.map((c, i) => (i === 0 ? h('th', { scope: 'row' }, String(c)) : h('td', {}, String(c))))))),
])]);
const fold = (summary, ...kids) => h('details', { class: 'xpand' }, [h('summary', {}, summary), h('div', { class: 'xp-in' }, kids)]);
// One line per figure: a mark, what it is, its value and where it comes from.
const item = (k, label, value, why, cls = null) => h('li', { class: cls }, [
  h('span', { class: 'k', 'aria-hidden': 'true' }, k), h('span', {}, label), h('b', {}, value), h('em', {}, why),
]);
const items = (list) => h('ul', { class: 'tf-items st-items' }, list.filter(Boolean));
// The headline: a big figure (or words) and what it is.
const big = (value, words, isWord = false) => h('p', { class: 'tf-big' }, [h('b', { class: isWord ? 'word' : null }, value), words ? h('span', {}, words) : null]);
const sub = (text) => (text ? h('p', { class: 'tf-sub' }, text) : null);

const DRAW = {
  constants(r) {
    const k = r.rows[0];
    const why = (c) => CONSTANT_INFO[c].formula;
    return [
      big(fx(k.A2, 4), `A2 for a subgroup of ${k.n}`),
      sub(`X-bar and R: A2 ${fx(k.A2, 4)}, D3 ${fx(k.D3, 4)}, D4 ${fx(k.D4, 4)}, d2 ${fx(k.d2, 4)}. X-bar and s: A3 ${fx(k.A3, 4)}, B3 ${fx(k.B3, 4)}, B4 ${fx(k.B4, 4)}, c4 ${fx(k.c4, 4)}.`),
      items(['A2', 'D3', 'D4', 'd2', 'A3', 'B3', 'B4', 'c4'].map((c, i) => item(c, LABEL[c] ?? c, fx(k[c], 4), why(c), i === 0 ? 'hi' : null))),
      fold(`Every constant for n = ${k.n} (${CONSTANT_NAMES.length})`, table(['Constant', 'Value', 'Used for', 'Formula'], CONSTANT_NAMES.map((c) => [LABEL[c] ?? c, k[c], CONSTANT_INFO[c].what, CONSTANT_INFO[c].formula]))),
    ];
  },
  critical(r) {
    const v = r.value !== undefined && r.lower === undefined ? fx(r.value, 6) : r.dist === 'z' || r.dist === 't' ? `+/- ${fx(r.value, 6)}` : `${fx(r.lower, 6)} and ${fx(r.upper, 6)}`;
    const df = r.df !== undefined ? `df ${r.df}` : r.df1 !== undefined ? `df ${r.df1} and ${r.df2}` : null;
    return [
      big(v, `${DIST_NAMES[r.dist]} critical value`),
      sub(r.meaning),
      items([
        item('α', 'Alpha', String(r.alpha), r.tail ? `${r.tail === 'two' ? 'two-sided' : `${r.tail} tail`}` : 'your alpha'),
        df ? item('df', 'Degrees of freedom', df, 'your input') : null,
        item('=', 'Critical value', v, `the ${DIST_NAMES[r.dist]} distribution function, inverted`, 'hi'),
      ]),
      fold('Every field', table(['Field', 'Value'], Object.entries(r).filter(([k]) => k !== 'meaning').map(([k, x]) => [k, x]))),
    ];
  },
  probability(r) {
    return [
      big(`p = ${fx(r.twoSided, 6)}`, 'two-sided'),
      sub(`${DIST_NAMES[r.dist]} at ${r.x}.`),
      items([
        item('<', 'P(X < x)', String(r.lower), 'the lower tail'),
        item('>', 'P(X > x)', String(r.upper), 'the upper tail'),
        item('2', 'Two-sided p', fx(r.twoSided, 6), 'twice the smaller tail', 'hi'),
      ]),
    ];
  },
  limits(r) {
    const main = r.chart === 'i-mr' ? r.individuals : r.xbar;
    const name = r.chart === 'i-mr' ? 'Individuals' : 'X-bar';
    const second = r.chart === 'i-mr' ? ['Moving range', r.movingRange] : r.chart === 'xbar-s' ? ['s', r.s] : ['Range', r.range];
    const sigs = r.signals ? Object.entries(r.signals).flatMap(([chart, list]) => list.map((s) => `${chart}: point ${s.point} (${fx(s.value, 4)}) ${s.side}`)) : [];
    return [
      big(`${fx(main.lcl)} to ${fx(main.ucl)}`, `${name} chart limits`, true),
      sub(`Center ${fx(main.cl)}; sigma within ${fx(r.sigmaWithin)}. ${sigs.length ? `Outside the limits: ${sigs.join('; ')}.` : 'No point is outside the limits.'}`),
      items([
        item('U', `${name} UCL`, fx(main.ucl), 'center plus 3 sigma within'),
        item('C', `${name} center`, fx(main.cl), 'the mean of your readings', 'hi'),
        item('L', `${name} LCL`, fx(main.lcl), 'center minus 3 sigma within'),
        item('U', `${second[0]} UCL`, fx(second[1].ucl), 'from the control chart constants'),
        item('C', `${second[0]} center`, fx(second[1].cl), 'the mean of your ranges', 'plain'),
        item('L', `${second[0]} LCL`, fx(second[1].lcl), 'from the control chart constants'),
      ]),
      fold('The formulas', h('ul', { class: 'st-notes' }, [...r.formulas, ...(r.note ? [r.note] : [])].map((t) => h('li', {}, t)))),
    ];
  },
  capability(r) {
    return [
      big(fx(r.Cpk, 3), `Cpk; Ppk ${fx(r.Ppk, 3)}`),
      sub(`Sigma within ${fx(r.sigmaWithin, 5)} (${r.withinMethod}); overall ${fx(r.sigmaOverall, 5)}.`),
      items([
        item('Cp', 'Cp / Pp', `${fx(r.Cp, 3)} / ${fx(r.Pp, 3)}`, 'spec width over 6 sigma'),
        item('k', 'Cpk / Ppk', `${fx(r.Cpk, 3)} / ${fx(r.Ppk, 3)}`, 'distance to the nearer spec over 3 sigma', 'hi'),
        item('U', 'Upper', `${fx(r.Cpu, 3)} / ${fx(r.Ppu, 3)}`, 'USL side, within / overall'),
        item('L', 'Lower', `${fx(r.Cpl, 3)} / ${fx(r.Ppl, 3)}`, 'LSL side, within / overall'),
        item('ppm', 'Expected outside spec', `${fx(r.expectedPpmWithin, 1)} / ${fx(r.expectedPpmOverall, 1)}`, 'parts per million, within / overall, normal model'),
      ]),
      h('p', { class: 'tf-note' }, r.note),
    ];
  },
  sigma(r) {
    return [
      big(fx(r.sigmaShortTerm, 3), `sigma (shift ${r.shift})`),
      sub(`${fx(r.sigmaLongTerm, 3)} sigma without the shift.`),
      items([
        item('#', 'DPMO', fx(r.dpmo, 2), 'defects per million opportunities'),
        item('%', 'Yield', `${fx(r.yieldPercent, 5)}%`, 'the share without a defect'),
        item('σ', 'Sigma level', fx(r.sigmaShortTerm, 3), `the normal quantile of the yield plus the ${r.shift} shift`, 'hi'),
        item('σ', 'Without the shift', fx(r.sigmaLongTerm, 3), 'the normal quantile of the yield'),
      ]),
      h('p', { class: 'tf-note' }, r.note),
    ];
  },
  oc(r) {
    const a = r.percentDefectiveAt;
    return [
      big(`${fx(a.pAccept95, 3)}%`, 'defective is accepted 95% of the time'),
      sub(`10% of lots are accepted at ${fx(a.pAccept10, 3)}% defective. Model: ${r.model}.`),
      items([
        item('n', 'Sample size', String(r.n), 'your plan'),
        item('Ac', 'Accept number', String(r.c), 'your plan'),
        item('95', 'Accepted 95% of the time', `${fx(a.pAccept95, 3)}%`, 'percent defective', 'hi'),
        item('10', 'Accepted 10% of the time', `${fx(a.pAccept10, 3)}%`, 'percent defective'),
        r.aoqlPercent !== undefined ? item('Q', 'AOQL', `${fx(r.aoqlPercent, 3)}%`, `the worst average outgoing quality for a lot of ${r.lotSize}`) : null,
      ]),
      fold(`The OC curve (${r.rows.length} points)`, table(['% defective', 'P(accept)', ...(r.lotSize ? ['AOQ %', 'ATI'] : [])], r.rows.map((x) => [x.percentDefective, fx(x.pAccept, 4), ...(r.lotSize ? [fx(x.aoqPercent, 4), fx(x.ati, 1)] : [])]))),
    ];
  },
};

// The inputs in one line: "Control chart constants, n = 5".
const OPS = { constants: 'Control chart constants', critical: 'Critical value', probability: 'p-value', limits: 'Control limits', capability: 'Capability', sigma: 'Sigma level', oc: 'OC curve' };
function inputsLine(i) {
  const bits = [OPS[i.op]];
  if (i.op === 'constants') bits.push(`n = ${i.n}`);
  if (i.dist) bits.push(DIST_NAMES[i.dist]);
  if (i.alpha !== undefined) bits.push(`alpha ${i.alpha}`, i.tail === 'two' ? 'two-sided' : `${i.tail} tail`);
  if (i.x !== undefined) bits.push(`statistic ${i.x}`);
  if (i.df !== undefined) bits.push(`df ${i.df}`);
  if (i.df1 !== undefined) bits.push(`df ${i.df1} and ${i.df2}`);
  if (i.chart) bits.push($('st-chart').selectedOptions[0].textContent);
  if (i.values) bits.push(`${i.values.length} readings`);
  if (i.subgroups) bits.push(`${i.subgroups.length} subgroups of ${i.subgroups[0].length}`);
  if (i.lsl !== undefined || i.usl !== undefined) bits.push(`spec ${i.lsl ?? ''} to ${i.usl ?? ''}`);
  for (const k of ['dpmo', 'yield', 'sigma']) if (i[k] !== undefined) bits.push(`${k === 'dpmo' ? 'DPMO' : k} ${i[k]}`, `shift ${i.shift}`);
  if (i.op === 'oc') bits.push(`n = ${i.n}, Ac = ${i.c}${i.lotSize ? `, lot ${i.lotSize}` : ''}`);
  return bits.join(', ');
}

// The form as first served, so the result says "Example" until it is changed.
let DEFAULTS = null;
const formNow = () => [...$('st-form').elements].filter((e) => e.id).map((e) => e.value).join('|');

function show() {
  const op = $('st-op').value;
  for (const set of document.querySelectorAll('.st-set')) set.hidden = !set.dataset.op.split(' ').includes(op);
  for (const el of document.querySelectorAll('[data-for]')) el.hidden = el.dataset.for !== op;
  const dist = $('st-dist').value;
  for (const el of document.querySelectorAll('[data-dist]')) el.hidden = !el.dataset.dist.split(' ').includes(dist);
  if (op === 'limits' || op === 'capability') $('st-data-hint').textContent = op === 'limits' && $('st-chart').value === 'i-mr' ? 'Individual readings, in time order, separated by spaces, commas or new lines.' : 'One subgroup per line, readings separated by spaces or commas (all subgroups the same size). For individuals, put them all on one line.';
}

function run() {
  show();
  const out = $('st-out');
  $('st-err').textContent = '';
  try {
    const input = readInput();
    const res = compute(input);
    const example = formNow() === DEFAULTS;
    out.replaceChildren(
      h('div', { class: 'tf-rh' }, [
        example ? h('span', { class: 'tf-tag' }, 'Example') : h('span', { class: 'tf-tag run' }, 'Your result'),
        h('span', { class: 'tf-src' }, 'Computed, checked against NIST'),
      ]),
      h('p', { class: 'tf-exin' }, example ? `Example: ${inputsLine(input)}` : inputsLine(input)),
      ...DRAW[input.op](res).filter(Boolean),
      h('p', { class: 'tf-cost' }, 'Worked out on this page, free.'),
    );
    $('st-status').textContent = 'Updated.';
  } catch (e) {
    if (!(e instanceof StatsError)) throw e;
    $('st-err').textContent = e.message;
  }
}

// ---------- prefill from the address ----------

function prefill() {
  const q = new URLSearchParams(location.search);
  const set = (id, key) => { if (q.has(key)) $(id).value = q.get(key); };
  set('st-op', 'op'); set('st-n', 'n'); set('st-dist', 'dist'); set('st-alpha', 'alpha'); set('st-tail', 'tail');
  set('st-x', 'x'); set('st-df', 'df'); set('st-df1', 'df1'); set('st-df2', 'df2'); set('st-chart', 'chart');
  set('st-lsl', 'lsl'); set('st-usl', 'usl'); set('st-ocn', 'ocn'); set('st-occ', 'ac'); set('st-lot', 'lot');
  for (const k of ['dpmo', 'yield', 'sigma']) if (q.has(k)) { $('st-from').value = k; $('st-sv').value = q.get(k); }
  if ($('st-op').value === '') $('st-op').value = 'constants';
  $('st-data').value = q.get('data') ?? ($('st-chart').value === 'i-mr' ? NIST_FLOW : EXAMPLE);
}

$('st-chart').addEventListener('change', () => {
  const v = $('st-data').value;
  if (v === EXAMPLE || v === NIST_FLOW) $('st-data').value = $('st-chart').value === 'i-mr' ? NIST_FLOW : EXAMPLE;
});
$('st-form').addEventListener('input', run);
$('st-form').addEventListener('change', run);
$('st-form').addEventListener('submit', (e) => {
  e.preventDefault();
  run();
  if (window.matchMedia('(max-width: 1080px)').matches) $('st-out').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
prefill();
DEFAULTS = new URLSearchParams(location.search).toString() ? null : formNow();
constantsFor(5);
run();
