// Statistical tables, computed from their definitions. No table is typed in: every value comes from
// the mathematics below, so any subgroup size, degrees of freedom or probability works, not only the
// rows a printed table has. Pure and dependency-free: the page loads this same file in the browser.
//
//   Special functions   log-gamma (Lanczos, g = 7), the regularized incomplete gamma (series and
//                       continued fraction) and the regularized incomplete beta (continued fraction).
//   Distributions       standard normal, Student's t, chi-square and F: both tails of the CDF, and
//                       critical values by inverting the CDF with bisection to machine precision.
//   Control charts      c4 from its gamma-function formula; d2 and d3, the mean and standard
//                       deviation of the range of n standard normal values, by numerical
//                       integration of the range's distribution; every other constant from those.
//   Control limits      X-bar and R, X-bar and s, individuals and moving range, from data or summaries.
//   Capability          Cp, Cpk, Pp, Ppk (and Cpu, Cpl, Ppu, Ppl) with the within and overall sigma.
//   Sigma level         DPMO, yield and sigma level, with and without the 1.5 sigma shift.
//   OC curve            any single sampling plan (n, Ac): binomial, or hypergeometric for a finite lot.
// Checked against the NIST/SEMATECH e-Handbook's printed tables (server/test/stats-tables.test.js).

export const READ_ON = '2026-11-08';
export const LIMITS = { n: 100, df: 100_000, rows: 200, cells: 2500, values: 10_000, subgroups: 1000, points: 101 };

export class StatsError extends Error {
  constructor(message, field) { super(message); this.name = 'StatsError'; this.field = field; }
}
const fail = (message, field) => { throw new StatsError(message, field); };

// ---------- special functions ----------

const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
  -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
const LN_SQRT_2PI = 0.9189385332046728;

// ln Gamma(x) for x > 0.
export function lgamma(x) {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  const z = x - 1;
  let a = LANCZOS[0];
  const t = z + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (z + i);
  return LN_SQRT_2PI + (z + 0.5) * Math.log(t) - t + Math.log(a);
}

const EPS = 1e-16;
const TINY = 1e-300;

// The regularized incomplete gamma: [P(a, x), Q(a, x)], each computed so its own tail keeps its
// relative precision (the series for P below a + 1, the continued fraction for Q above).
export function gammaPQ(a, x) {
  if (x <= 0) return [0, 1];
  const lead = a * Math.log(x) - x - lgamma(a);
  if (x < a + 1) {
    let sum = 1 / a; let term = sum; let ap = a;
    for (let i = 0; i < 100_000; i++) {
      ap += 1; term *= x / ap; sum += term;
      if (Math.abs(term) < Math.abs(sum) * EPS) break;
    }
    const p = Math.exp(lead) * sum;
    return [p, 1 - p];
  }
  let b = x + 1 - a; let c = 1 / TINY; let d = 1 / b; let h = d;
  for (let i = 1; i < 100_000; i++) {
    const an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < TINY) d = TINY;
    c = b + an / c; if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  const q = Math.exp(lead) * h;
  return [1 - q, q];
}

function betacf(a, b, x) {
  const qab = a + b; const qap = a + 1; const qam = a - 1;
  let c = 1; let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d; let h = d;
  for (let m = 1; m < 100_000; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

// The regularized incomplete beta: [I_x(a, b), 1 - I_x(a, b)], each tail computed directly.
export function betaPQ(a, b, x) {
  if (x <= 0) return [0, 1];
  if (x >= 1) return [1, 0];
  const lead = lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log1p(-x);
  if (x < (a + 1) / (a + b + 2)) {
    const p = (Math.exp(lead) * betacf(a, b, x)) / a;
    return [p, 1 - p];
  }
  const q = (Math.exp(lead) * betacf(b, a, 1 - x)) / b;
  return [1 - q, q];
}

// ---------- distributions ----------

export const DISTS = ['z', 't', 'chi-square', 'f'];
export const DIST_NAMES = { z: 'standard normal (z)', t: "Student's t", 'chi-square': 'chi-square', f: 'F' };

// [lower, upper] tail probabilities at x.
export function tails(dist, x, { df, df1, df2 } = {}) {
  if (dist === 'z') {
    if (x === 0) return [0.5, 0.5];
    const q = 0.5 * gammaPQ(0.5, (x * x) / 2)[1];
    return x > 0 ? [1 - q, q] : [q, 1 - q];
  }
  if (dist === 't') {
    if (x === 0) return [0.5, 0.5];
    const q = 0.5 * betaPQ(df / 2, 0.5, df / (df + x * x))[0];
    return x > 0 ? [1 - q, q] : [q, 1 - q];
  }
  if (dist === 'chi-square') return x <= 0 ? [0, 1] : gammaPQ(df / 2, x / 2);
  if (dist === 'f') {
    if (x <= 0) return [0, 1];
    // P(F > x) = I_{df2 / (df2 + df1 x)}(df2 / 2, df1 / 2).
    const [up, low] = betaPQ(df2 / 2, df1 / 2, df2 / (df2 + df1 * x));
    return [low, up];
  }
  return fail(`dist must be one of ${DISTS.join(', ')}.`, 'dist');
}

// The x with the chosen tail equal to p: bisection on the CDF until the bracket stops shrinking.
function invert(dist, params, p, side) {
  const symmetric = dist === 'z' || dist === 't';
  const at = (x) => tails(dist, x, params)[side === 'upper' ? 1 : 0];
  // Symmetric: solve on the upper half and mirror.
  if (symmetric) {
    if (p === 0.5) return 0;
    const upperP = side === 'upper' ? p : 1 - p;
    if (upperP > 0.5) return -invert(dist, params, 1 - upperP, 'upper');
    let lo = 0; let hi = 1;
    while (tails(dist, hi, params)[1] > upperP) { lo = hi; hi *= 2; if (hi > 1e300) break; }
    return bisect((x) => tails(dist, x, params)[1] > upperP, lo, hi);
  }
  let lo = 0; let hi = 1;
  const above = side === 'upper' ? (x) => at(x) > p : (x) => at(x) < p;
  while (above(hi)) { lo = hi; hi *= 2; if (hi > 1e300) break; }
  return bisect(above, lo, hi);
}
// Smallest x with !stillBelow(x), to the last bit the doubles allow.
function bisect(stillBelow, lo, hi) {
  for (let i = 0; i < 2000; i++) {
    const mid = (lo + hi) / 2;
    if (mid <= lo || mid >= hi) break;
    if (stillBelow(mid)) lo = mid; else hi = mid;
  }
  return (lo + hi) / 2;
}

// Ten significant digits: what the methods above are good for, and what the tool returns.
export const sig = (x, digits = 10) => (x === 0 || !Number.isFinite(x) ? x : Number(x.toPrecision(digits)));

function checkParams(dist, { df, df1, df2 } = {}) {
  const dfOk = (v) => Number.isFinite(v) && v > 0 && v <= LIMITS.df;
  if (dist === 't' || dist === 'chi-square') {
    if (!dfOk(df)) fail(`df (degrees of freedom) must be a number above 0 and at most ${LIMITS.df.toLocaleString('en-US')}.`, 'df');
    return { df };
  }
  if (dist === 'f') {
    if (!dfOk(df1)) fail(`df1 (numerator degrees of freedom) must be above 0 and at most ${LIMITS.df.toLocaleString('en-US')}.`, 'df1');
    if (!dfOk(df2)) fail(`df2 (denominator degrees of freedom) must be above 0 and at most ${LIMITS.df.toLocaleString('en-US')}.`, 'df2');
    return { df1, df2 };
  }
  if (dist !== 'z') fail(`dist must be one of ${DISTS.join(', ')}.`, 'dist');
  return {};
}

export const TAILS = ['upper', 'lower', 'two'];

// The critical value(s) for a significance level alpha.
//   upper: P(X > x) = alpha     lower: P(X < x) = alpha
//   two:   z and t: +/- x with P(|X| > x) = alpha; chi-square and F: the lower and upper alpha/2 points
export function critical({ dist, alpha, tail = 'two', ...rest }) {
  const params = checkParams(dist, rest);
  if (!(alpha > 0 && alpha < 1)) fail('alpha must be between 0 and 1, like 0.05.', 'alpha');
  if (!TAILS.includes(tail)) fail('tail must be "upper", "lower" or "two".', 'tail');
  const symmetric = dist === 'z' || dist === 't';
  const out = { dist, ...params, alpha, tail };
  if (tail === 'upper') out.value = sig(invert(dist, params, alpha, 'upper'));
  else if (tail === 'lower') out.value = sig(invert(dist, params, alpha, 'lower'));
  else if (symmetric) {
    out.value = sig(invert(dist, params, alpha / 2, 'upper'));
    out.lower = -out.value; out.upper = out.value;
  } else {
    out.lower = sig(invert(dist, params, alpha / 2, 'lower'));
    out.upper = sig(invert(dist, params, alpha / 2, 'upper'));
  }
  out.meaning = meaning(out);
  return out;
}

const fmt = (x, d = 4) => (Number.isFinite(x) ? x.toFixed(d) : String(x));
const dfText = (o) => (o.dist === 'f' ? `df1 = ${o.df1}, df2 = ${o.df2}` : o.dist === 'z' ? '' : `df = ${o.df}`);
function meaning(o) {
  const name = DIST_NAMES[o.dist];
  const dfs = dfText(o) ? ` with ${dfText(o)}` : '';
  if (o.tail === 'upper') return `P(X > ${fmt(o.value)}) = ${o.alpha} for the ${name} distribution${dfs}.`;
  if (o.tail === 'lower') return `P(X < ${fmt(o.value)}) = ${o.alpha} for the ${name} distribution${dfs}.`;
  if (o.dist === 'z' || o.dist === 't') return `P(|X| > ${fmt(o.value)}) = ${o.alpha} for the ${name} distribution${dfs}: reject a two-sided test when |statistic| > ${fmt(o.value)}.`;
  return `P(X < ${fmt(o.lower)}) = P(X > ${fmt(o.upper)}) = ${o.alpha / 2} for the ${name} distribution${dfs}.`;
}

// Tail probabilities (p-values) of a statistic.
export function probability({ dist, x, ...rest }) {
  const params = checkParams(dist, rest);
  if (!Number.isFinite(x)) fail('x must be a number.', 'x');
  const [lower, upper] = tails(dist, x, params);
  const out = { dist, ...params, x, lower: sig(lower), upper: sig(upper) };
  if (dist === 'z' || dist === 't') out.twoSided = sig(Math.min(1, 2 * Math.min(lower, upper)));
  else out.twoSided = sig(Math.min(1, 2 * Math.min(lower, upper)));
  return out;
}

// A printed-style table: rows of degrees of freedom by columns of tail probabilities.
//   z:          cumulative P(Z < z) for z = from..to by 0.1 rows and 0.00..0.09 columns
//   t, chi-sq:  df rows from..to, one column per alpha (upper tail)
//   f:          one alpha; df1 columns, df2 rows
export function table({ dist, alphas = [0.10, 0.05, 0.025, 0.01, 0.005, 0.001], from, to, df1s, alpha = 0.05 }) {
  if (!DISTS.includes(dist)) fail(`dist must be one of ${DISTS.join(', ')}.`, 'dist');
  if (dist === 'z') {
    const a = from ?? -3.4; const b = to ?? 3.4;
    if (!(a >= -8 && b <= 8 && a <= b)) fail('For z, from and to must be between -8 and 8, from no larger than to.', 'from');
    const rows = [];
    for (let k = Math.round(a * 10); k <= Math.round(b * 10); k++) {
      const z0 = k / 10;
      // Printed z tables add the column to |z| on both sides of zero (row -1.2, column 0.03 is -1.23).
      rows.push({ z: z0, values: Array.from({ length: 10 }, (_, j) => { const z = z0 < 0 || (z0 === 0 && k < 0) ? z0 - j / 100 : z0 + j / 100; return sig(tails('z', Number(z.toFixed(2)))[0], 8); }) });
    }
    return { dist, meaning: 'P(Z < z), where z is the row plus the column (the row minus the column for negative rows).', columns: Array.from({ length: 10 }, (_, j) => (j / 100).toFixed(2)), rows };
  }
  if (dist === 'f') {
    const cols = df1s ?? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20, 24, 30, 40, 60, 120];
    const a = from ?? 1; const b = to ?? 30;
    checkRange(a, b, cols.length);
    if (!(alpha > 0 && alpha < 1)) fail('alpha must be between 0 and 1.', 'alpha');
    for (const c of cols) checkParams('f', { df1: c, df2: 1 });
    const rows = [];
    for (let df2 = a; df2 <= b; df2++) rows.push({ df2, values: cols.map((df1) => sig(invert('f', { df1, df2 }, alpha, 'upper'), 8)) });
    return { dist, alpha, meaning: `Upper ${alpha} critical values: P(F > value) = ${alpha}; columns are df1 (numerator), rows df2 (denominator).`, columns: cols, rows };
  }
  const a = from ?? 1; const b = to ?? 30;
  checkRange(a, b, alphas.length);
  for (const al of alphas) if (!(al > 0 && al < 1)) fail('Every alpha must be between 0 and 1.', 'alphas');
  const rows = [];
  for (let df = a; df <= b; df++) rows.push({ df, values: alphas.map((al) => sig(invert(dist, { df }, al, 'upper'), 8)) });
  return { dist, meaning: `Upper-tail critical values: P(X > value) = alpha, one column per alpha${dist === 't' ? ' (a two-sided test at 2 x alpha uses the same column)' : ''}.`, columns: alphas, rows };
}
function checkRange(a, b, cols) {
  if (!(Number.isInteger(a) && Number.isInteger(b) && a >= 1 && b >= a && b <= LIMITS.df)) fail('from and to must be whole degrees of freedom, from at least 1 and to no smaller than from.', 'from');
  if (b - a + 1 > LIMITS.rows) fail(`At most ${LIMITS.rows} rows in one table.`, 'to');
  if (!cols || (b - a + 1) * cols > LIMITS.cells) fail(`At most ${LIMITS.cells} values in one table.`, 'to');
}

// The standard normal quantile, used by the capability and sigma-level work.
export const zQuantile = (p) => (p <= 0 ? -Infinity : p >= 1 ? Infinity : invert('z', {}, p, 'lower'));
export const phi = (x) => tails('z', x)[0];

// ---------- control chart constants ----------

// c4: E(s) = c4 sigma for n normal values (NIST e-Handbook 6.3.2).
export const c4 = (n) => Math.sqrt(2 / (n - 1)) * Math.exp(lgamma(n / 2) - lgamma((n - 1) / 2));

// The range W of n standard normal values: P(W <= w) = n * integral of phi(x) [Phi(x + w) - Phi(x)]^(n-1) dx.
// d2 = E(W) = integral over w of P(W > w); E(W^2) = integral of 2 w P(W > w); d3 = sqrt(E(W^2) - d2^2).
// x runs on a grid of step H over [-X, X] (the trapezoid rule, which converges geometrically for
// this smooth, fast-decaying integrand); w on the same step (Simpson's rule), so Phi(x + w) is
// read off the same grid. Checked against the closed forms for n = 2 and 3 to 1e-9.
const H = 0.01;
const X = 9;
const WMAX = 14;
let GRID = null;
function grid() {
  if (GRID) return GRID;
  const nx = Math.round((2 * X) / H) + 1;
  const total = Math.round((2 * X + WMAX) / H) + 1;
  const Phi = new Float64Array(total);
  const dens = new Float64Array(nx);
  for (let i = 0; i < total; i++) {
    const x = -X + i * H;
    Phi[i] = tails('z', x)[0];
    if (i < nx) dens[i] = Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  }
  GRID = { nx, Phi, dens, nw: Math.round(WMAX / H) };
  return GRID;
}
const RANGE = new Map();
export function rangeMoments(n) {
  if (RANGE.has(n)) return RANGE.get(n);
  const { nx, Phi, dens, nw } = grid();
  const e = n - 1;
  let m1 = 0; let m2 = 0;
  for (let k = 0; k <= nw; k++) {
    let s = 0;
    for (let i = 0; i < nx; i++) {
      const d = Phi[i + k] - Phi[i];
      if (d > 0) s += dens[i] * Math.exp(e * Math.log(d));
    }
    const survive = Math.max(0, 1 - n * s * H);
    const wgt = k === 0 || k === nw ? 1 : k % 2 ? 4 : 2;
    m1 += wgt * survive;
    m2 += wgt * 2 * (k * H) * survive;
    // Past here the range is beyond w with probability under 1e-20: the rest adds nothing.
    if (survive < 1e-20 && k % 2 === 0) break;
  }
  m1 *= H / 3; m2 *= H / 3;
  const out = { d2: m1, d3: Math.sqrt(m2 - m1 * m1) };
  RANGE.set(n, out);
  return out;
}

export const CONSTANT_NAMES = ['d2', 'd3', 'c4', 'c5', 'A', 'A2', 'A3', 'D1', 'D2', 'D3', 'D4', 'B3', 'B4', 'B5', 'B6', 'E2', 'd2inv', 'c4inv'];
export const CONSTANT_INFO = {
  d2: { what: 'Mean of the range of n normal values, in sigmas: sigma is estimated as R-bar / d2.', formula: 'E(W), W the range of n standard normal values' },
  d3: { what: 'Standard deviation of that range, in sigmas.', formula: 'sqrt(E(W^2) - d2^2)' },
  c4: { what: 'Mean of the sample standard deviation, in sigmas: sigma is estimated as s-bar / c4.', formula: 'sqrt(2/(n-1)) Gamma(n/2) / Gamma((n-1)/2)' },
  c5: { what: 'Standard deviation of s, in sigmas.', formula: 'sqrt(1 - c4^2)' },
  A: { what: 'X-bar chart limits from a known sigma: mu +/- A sigma.', formula: '3 / sqrt(n)' },
  A2: { what: 'X-bar chart limits from the average range: X-double-bar +/- A2 R-bar.', formula: '3 / (d2 sqrt(n))' },
  A3: { what: 'X-bar chart limits from the average standard deviation: X-double-bar +/- A3 s-bar.', formula: '3 / (c4 sqrt(n))' },
  D1: { what: 'R chart lower limit from a known sigma: D1 sigma.', formula: 'max(0, d2 - 3 d3)' },
  D2: { what: 'R chart upper limit from a known sigma: D2 sigma.', formula: 'd2 + 3 d3' },
  D3: { what: 'R chart lower limit: D3 R-bar.', formula: 'max(0, 1 - 3 d3 / d2)' },
  D4: { what: 'R chart upper limit: D4 R-bar.', formula: '1 + 3 d3 / d2' },
  B3: { what: 's chart lower limit: B3 s-bar.', formula: 'max(0, 1 - 3 c5 / c4)' },
  B4: { what: 's chart upper limit: B4 s-bar.', formula: '1 + 3 c5 / c4' },
  B5: { what: 's chart lower limit from a known sigma: B5 sigma.', formula: 'max(0, c4 - 3 c5)' },
  B6: { what: 's chart upper limit from a known sigma: B6 sigma.', formula: 'c4 + 3 c5' },
  E2: { what: 'Individuals chart limits from the average moving range of span n: X-bar +/- E2 MR-bar.', formula: '3 / d2' },
  d2inv: { what: '1 / d2, to turn an average range into sigma.', formula: '1 / d2' },
  c4inv: { what: '1 / c4, to turn an average standard deviation into sigma.', formula: '1 / c4' },
};

export function constantsFor(n) {
  if (!(Number.isInteger(n) && n >= 2 && n <= LIMITS.n)) fail(`n (subgroup size) must be a whole number from 2 to ${LIMITS.n}.`, 'n');
  const { d2, d3 } = rangeMoments(n);
  const C4 = c4(n);
  const c5 = Math.sqrt(1 - C4 * C4);
  const r = Math.sqrt(n);
  const v = {
    d2, d3, c4: C4, c5,
    A: 3 / r, A2: 3 / (d2 * r), A3: 3 / (C4 * r),
    D1: Math.max(0, d2 - 3 * d3), D2: d2 + 3 * d3, D3: Math.max(0, 1 - (3 * d3) / d2), D4: 1 + (3 * d3) / d2,
    B3: Math.max(0, 1 - (3 * c5) / C4), B4: 1 + (3 * c5) / C4, B5: Math.max(0, C4 - 3 * c5), B6: C4 + 3 * c5,
    E2: 3 / d2, d2inv: 1 / d2, c4inv: 1 / C4,
  };
  // d2 and d3 come from quadrature (good to about 1e-9); the rest follow from them and c4.
  for (const k of CONSTANT_NAMES) v[k] = sig(v[k], k === 'c4' || k === 'c5' || k === 'A' || k === 'c4inv' ? 10 : 8);
  return { n, ...v };
}

export function constants({ n, from, to }) {
  if (n !== undefined) return { rows: [constantsFor(n)] };
  const a = from ?? 2; const b = to ?? 25;
  if (!(Number.isInteger(a) && Number.isInteger(b) && a >= 2 && b <= LIMITS.n && a <= b)) fail(`from and to must be whole subgroup sizes from 2 to ${LIMITS.n}, from no larger than to.`, 'from');
  const rows = [];
  for (let k = a; k <= b; k++) rows.push(constantsFor(k));
  return { rows };
}

// ---------- control limits ----------

const mean = (xs) => xs.reduce((s, x) => s + x, 0) / xs.length;
const sd = (xs) => { const m = mean(xs); return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1)); };
const range = (xs) => Math.max(...xs) - Math.min(...xs);
const r6 = (x) => sig(x, 10);

export const CHARTS = ['xbar-r', 'xbar-s', 'i-mr'];

function readSubgroups(subgroups) {
  if (!Array.isArray(subgroups) || subgroups.length < 2) fail('Give at least 2 subgroups.', 'subgroups');
  if (subgroups.length > LIMITS.subgroups) fail(`At most ${LIMITS.subgroups} subgroups.`, 'subgroups');
  const n = subgroups[0].length;
  if (!(n >= 2 && n <= LIMITS.n)) fail(`Each subgroup needs 2 to ${LIMITS.n} readings.`, 'subgroups');
  subgroups.forEach((g, i) => {
    if (g.length !== n) fail(`Subgroup ${i + 1} has ${g.length} readings; every subgroup needs the same number (${n}). Unequal subgroups need limits per subgroup.`, 'subgroups');
    if (!g.every(Number.isFinite)) fail(`Subgroup ${i + 1} has a reading that is not a number.`, 'subgroups');
  });
  return n;
}

const signals = (points, ucl, lcl) => points.map((v, i) => ({ i: i + 1, v })).filter((p) => p.v > ucl || p.v < lcl).map((p) => ({ point: p.i, value: r6(p.v), side: p.v > ucl ? 'above UCL' : 'below LCL' }));

export function limits(input) {
  const { chart } = input;
  if (!CHARTS.includes(chart)) fail(`chart must be one of ${CHARTS.join(', ')}.`, 'chart');
  if (chart === 'i-mr') {
    let xbar; let mrBar; let xs = null;
    if (input.values) {
      xs = input.values;
      if (!Array.isArray(xs) || xs.length < 3 || !xs.every(Number.isFinite)) fail('values must be at least 3 numbers.', 'values');
      if (xs.length > LIMITS.values) fail(`At most ${LIMITS.values} values.`, 'values');
      xbar = mean(xs); mrBar = mean(xs.slice(1).map((x, i) => Math.abs(x - xs[i])));
    } else {
      xbar = input.mean; mrBar = input.mrBar;
      if (!Number.isFinite(xbar) || !(mrBar >= 0)) fail('Give values, or mean and mrBar (the average moving range).', 'values');
    }
    const k = constantsFor(2);
    const sigma = mrBar / k.d2;
    const out = {
      chart, n: 2,
      center: { individuals: r6(xbar), movingRange: r6(mrBar) },
      individuals: { lcl: r6(xbar - 3 * sigma), cl: r6(xbar), ucl: r6(xbar + 3 * sigma) },
      movingRange: { lcl: 0, cl: r6(mrBar), ucl: r6(k.D4 * mrBar) },
      sigmaWithin: r6(sigma),
      constants: { d2: k.d2, E2: k.E2, D3: k.D3, D4: k.D4 },
      formulas: [`Individuals: X-bar +/- 3 MR-bar / d2, with d2 = ${k.d2.toFixed(4)} for moving ranges of 2`, 'MR chart: UCL = D4 MR-bar, LCL = D3 MR-bar = 0'],
    };
    if (xs) {
      const mr = xs.slice(1).map((x, i) => Math.abs(x - xs[i]));
      out.count = xs.length;
      out.signals = { individuals: signals(xs, out.individuals.ucl, out.individuals.lcl), movingRange: signals(mr, out.movingRange.ucl, -Infinity).map((s) => ({ ...s, point: s.point + 1 })) };
    }
    return out;
  }
  let n; let grand; let spread; let groups = null;
  const useS = chart === 'xbar-s';
  if (input.subgroups) {
    groups = input.subgroups;
    n = readSubgroups(groups);
    grand = mean(groups.map(mean));
    spread = mean(groups.map(useS ? sd : range));
  } else {
    n = input.n; grand = input.grandMean; spread = useS ? input.sBar : input.rBar;
    if (!Number.isFinite(grand) || !(spread >= 0)) fail(`Give subgroups, or n, grandMean and ${useS ? 'sBar' : 'rBar'}.`, 'subgroups');
  }
  const k = constantsFor(n);
  const a = useS ? k.A3 : k.A2;
  const lo = useS ? k.B3 : k.D3;
  const hi = useS ? k.B4 : k.D4;
  const sigma = spread / (useS ? k.c4 : k.d2);
  const sName = useS ? 's' : 'range';
  const out = {
    chart, n,
    xbar: { lcl: r6(grand - a * spread), cl: r6(grand), ucl: r6(grand + a * spread) },
    [sName]: { lcl: r6(lo * spread), cl: r6(spread), ucl: r6(hi * spread) },
    sigmaWithin: r6(sigma),
    constants: useS ? { A3: k.A3, B3: k.B3, B4: k.B4, c4: k.c4 } : { A2: k.A2, D3: k.D3, D4: k.D4, d2: k.d2 },
    formulas: useS
      ? ['X-bar chart: X-double-bar +/- A3 s-bar', 's chart: LCL = B3 s-bar, UCL = B4 s-bar', 'sigma = s-bar / c4']
      : ['X-bar chart: X-double-bar +/- A2 R-bar', 'R chart: LCL = D3 R-bar, UCL = D4 R-bar', 'sigma = R-bar / d2'],
  };
  if (!useS && n > 10) out.note = 'For subgroups larger than about 10 the s chart uses the data better than the range (NIST e-Handbook 6.3.2.1).';
  if (groups) {
    out.subgroupCount = groups.length;
    out.subgroupStats = groups.map((g, i) => ({ subgroup: i + 1, mean: r6(mean(g)), [sName]: r6(useS ? sd(g) : range(g)) }));
    out.signals = {
      xbar: signals(groups.map(mean), out.xbar.ucl, out.xbar.lcl),
      [sName]: signals(groups.map(useS ? sd : range), out[sName].ucl, out[sName].lcl),
    };
  }
  return out;
}

// ---------- capability ----------

export function capability(input) {
  const { lsl, usl } = input;
  if (lsl === undefined && usl === undefined) fail('Give lsl, usl or both (the specification limits).', 'usl');
  if (lsl !== undefined && usl !== undefined && !(usl > lsl)) fail('usl must be above lsl.', 'usl');
  let mu; let within; let overall; let method; let count;
  if (input.subgroups) {
    const n = readSubgroups(input.subgroups);
    const all = input.subgroups.flat();
    count = all.length;
    mu = mean(all);
    overall = sd(all);
    const k = constantsFor(n);
    if (input.method === 'sbar') { within = mean(input.subgroups.map(sd)) / k.c4; method = `s-bar / c4 (c4 = ${k.c4.toFixed(4)} for n = ${n})`; }
    else { within = mean(input.subgroups.map(range)) / k.d2; method = `R-bar / d2 (d2 = ${k.d2.toFixed(4)} for n = ${n})`; }
  } else if (input.values) {
    const xs = input.values;
    if (!Array.isArray(xs) || xs.length < 3 || !xs.every(Number.isFinite)) fail('values must be at least 3 numbers.', 'values');
    if (xs.length > LIMITS.values) fail(`At most ${LIMITS.values} values.`, 'values');
    count = xs.length;
    mu = mean(xs); overall = sd(xs);
    const d2 = constantsFor(2).d2;
    within = mean(xs.slice(1).map((x, i) => Math.abs(x - xs[i]))) / d2;
    method = `MR-bar / d2 (d2 = ${d2.toFixed(4)}, moving ranges of 2)`;
  } else {
    mu = input.mean; within = input.sigmaWithin; overall = input.sigmaOverall ?? input.sigmaWithin;
    if (!Number.isFinite(mu) || !(within > 0) || !(overall > 0)) fail('Give values, subgroups, or mean with sigmaWithin (and sigmaOverall for Pp and Ppk).', 'values');
    method = 'given';
  }
  if (!(within > 0) || !(overall > 0)) fail('The data have no spread, so capability is not defined.', 'values');
  const idx = (s) => {
    const upper = usl !== undefined ? (usl - mu) / (3 * s) : null;
    const lower = lsl !== undefined ? (mu - lsl) / (3 * s) : null;
    const both = upper !== null && lower !== null;
    return {
      p: both ? (usl - lsl) / (6 * s) : null,
      pu: upper, pl: lower,
      pk: Math.min(...[upper, lower].filter((v) => v !== null)),
      ppm: 1e6 * ((usl !== undefined ? tails('z', (usl - mu) / s)[1] : 0) + (lsl !== undefined ? tails('z', (lsl - mu) / s)[0] : 0)),
    };
  };
  const w = idx(within); const o = idx(overall);
  const n4 = (x) => (x === null ? null : r6(x));
  return {
    mean: r6(mu), sigmaWithin: r6(within), sigmaOverall: r6(overall), withinMethod: method, ...(count ? { count } : {}),
    Cp: n4(w.p), Cpk: n4(w.pk), Cpu: n4(w.pu), Cpl: n4(w.pl),
    Pp: n4(o.p), Ppk: n4(o.pk), Ppu: n4(o.pu), Ppl: n4(o.pl),
    expectedPpmWithin: sig(w.ppm, 6), expectedPpmOverall: sig(o.ppm, 6),
    note: 'Cp and Cpk use the within-subgroup sigma; Pp and Ppk use the overall standard deviation. All assume normal data from a stable process.',
  };
}

// ---------- sigma level ----------

export function sigmaLevel(input) {
  const shift = input.shift ?? 1.5;
  if (!(shift >= 0 && shift <= 3)) fail('shift must be from 0 to 3 (1.5 is the usual convention).', 'shift');
  let dpmo; let from;
  if (input.defects !== undefined) {
    const { defects, units, opportunities = 1 } = input;
    if (!(defects >= 0 && units > 0 && opportunities > 0)) fail('defects must be 0 or more, units and opportunities above 0.', 'defects');
    dpmo = (defects / (units * opportunities)) * 1e6;
    if (dpmo > 1e6) fail('More defects than opportunities: check units and opportunities per unit.', 'defects');
    from = { defects, units, opportunities, dpu: r6(defects / units) };
  } else if (input.dpmo !== undefined) {
    dpmo = input.dpmo; from = { dpmo };
  } else if (input.yield !== undefined) {
    if (!(input.yield >= 0 && input.yield <= 100)) fail('yield is a percentage from 0 to 100.', 'yield');
    dpmo = (1 - input.yield / 100) * 1e6; from = { yield: input.yield };
  } else if (input.sigma !== undefined) {
    if (!(input.sigma >= -10 && input.sigma <= 12)) fail('sigma must be from -10 to 12.', 'sigma');
    dpmo = tails('z', input.sigma - shift)[1] * 1e6; from = { sigma: input.sigma };
  } else fail('Give dpmo, yield, sigma, or defects with units (and opportunities per unit).', 'dpmo');
  if (!(dpmo >= 0 && dpmo <= 1e6)) fail('dpmo must be from 0 to 1,000,000.', 'dpmo');
  const p = dpmo / 1e6;
  const longTerm = p <= 0 ? Infinity : p >= 1 ? -Infinity : invert('z', {}, p, 'upper');
  return {
    from, shift,
    dpmo: sig(dpmo, 8),
    yieldPercent: sig(100 * (1 - p), 10),
    sigmaShortTerm: Number.isFinite(longTerm) ? r6(longTerm + shift) : longTerm,
    sigmaLongTerm: Number.isFinite(longTerm) ? r6(longTerm) : longTerm,
    note: `Short-term sigma adds the ${shift} sigma shift to the z value of the defect rate; long-term sigma is the z value itself.`,
  };
}

// ---------- operating characteristic curve ----------

function lchoose(n, k) { return lgamma(n + 1) - lgamma(k + 1) - lgamma(n - k + 1); }

// P(accept) for a single sampling plan: at most c defectives among n.
export function acceptProbability(n, c, p, N) {
  if (c >= n) return 1;
  if (p <= 0) return 1;
  if (p >= 1) return 0;
  if (N === undefined) return betaPQ(n - c, c + 1, 1 - p)[0];
  // Hypergeometric: D = round(p N) defectives in the lot.
  const D = Math.round(p * N);
  let s = 0;
  for (let x = Math.max(0, n - (N - D)); x <= Math.min(c, D); x++) s += Math.exp(lchoose(D, x) + lchoose(N - D, n - x) - lchoose(N, n));
  return Math.min(1, s);
}

export function ocCurve({ n, c, lotSize, points }) {
  if (!(Number.isInteger(n) && n >= 1 && n <= 100_000)) fail('n (sample size) must be a whole number from 1 to 100,000.', 'n');
  if (!(Number.isInteger(c) && c >= 0 && c < n)) fail('c (acceptance number) must be a whole number from 0 to n - 1.', 'c');
  if (lotSize !== undefined && !(Number.isInteger(lotSize) && lotSize >= n && lotSize <= 10_000_000)) fail('lotSize must be a whole number no smaller than n.', 'lotSize');
  const N = lotSize;
  const pa = (p) => acceptProbability(n, c, p, N);
  // The p (fraction defective) where P(accept) falls to a target: bisection, P(accept) decreasing in p.
  const pAt = (target) => (N === undefined ? bisect((p) => pa(p) > target, 0, 1) : bisect((p) => pa(p) > target, 0, 1));
  const p95 = pAt(0.95); const p50 = pAt(0.5); const p10 = pAt(0.10);
  const grid = points ?? defaultPoints(p10);
  if (grid.length > LIMITS.points) fail(`At most ${LIMITS.points} points.`, 'points');
  const rows = grid.map((pct) => {
    if (!(pct >= 0 && pct <= 100)) fail('points are percent defective, from 0 to 100.', 'points');
    const p = pct / 100;
    const a = pa(p);
    const row = { percentDefective: pct, pAccept: sig(a, 8) };
    if (N !== undefined) { row.aoqPercent = sig(100 * a * p * ((N - n) / N), 8); row.ati = sig(n + (1 - a) * (N - n), 8); }
    return row;
  });
  const out = {
    n, c, model: N === undefined ? 'binomial (large lot)' : `hypergeometric (lot of ${N})`, ...(N !== undefined ? { lotSize: N } : {}),
    percentDefectiveAt: { pAccept95: sig(100 * p95, 6), pAccept50: sig(100 * p50, 6), pAccept10: sig(100 * p10, 6) },
    rows,
  };
  if (N !== undefined) {
    // AOQL: the worst average outgoing quality with rectifying inspection; a fine scan, then refined.
    let best = 0; let bestP = 0;
    for (let i = 1; i <= 2000; i++) { const p = (i / 2000) * Math.min(1, p10 * 3); const v = pa(p) * p; if (v > best) { best = v; bestP = p; } }
    out.aoqlPercent = sig(100 * best * ((N - n) / N), 6);
    out.aoqlAtPercentDefective = sig(100 * bestP, 4);
  }
  return out;
}
function defaultPoints(p10) {
  const top = Math.min(100, Math.max(1, Math.ceil(p10 * 150)));
  const step = top / 20;
  return Array.from({ length: 21 }, (_, i) => sig(i * step, 6));
}

// ---------- one entry point ----------

export const OPS = ['constants', 'critical', 'probability', 'table', 'limits', 'capability', 'sigma', 'oc'];

export function compute(input) {
  switch (input.op) {
    case 'constants': return constants(input);
    case 'critical': return critical(input);
    case 'probability': return probability(input);
    case 'table': return table(input);
    case 'limits': return limits(input);
    case 'capability': return capability(input);
    case 'sigma': return sigmaLevel(input);
    case 'oc': return ocCurve(input);
    default: return fail(`op must be one of ${OPS.join(', ')}.`, 'op');
  }
}

// ---------- the worked example's readings ----------

// 25 subgroups of 5 made-up shaft diameters (mm) for the worked guides and the page: a fixed
// pseudo-random sequence (an LCG and Box-Muller), mean 10.00, sigma 0.05, rounded to 0.01 mm, with
// subgroup 17 shifted up by 0.12 mm so the chart has a point to find. Illustrative, not real data.
export function exampleSubgroups() {
  let seed = 20261108;
  const u = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return (seed + 0.5) / 2147483648; };
  const out = [];
  for (let g = 0; g < 25; g++) {
    const row = [];
    for (let i = 0; i < 5; i++) {
      const zz = Math.sqrt(-2 * Math.log(u())) * Math.cos(2 * Math.PI * u());
      row.push(Math.round((10 + 0.05 * zz + (g === 16 ? 0.12 : 0)) * 100) / 100);
    }
    out.push(row);
  }
  return out;
}
