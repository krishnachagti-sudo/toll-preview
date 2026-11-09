# How the statistical tables are computed from definitions

No value is typed in from a printed table: d2 and d3 come from numerical integration of the range of n normal values, c4 from its gamma-function formula, and critical values from inverting the normal, t, chi-square and F distributions by bisection. Every printed cell of the NIST/SEMATECH e-Handbook tables, read 2026-11-08, is checked.

## How does it work?

1. Log-gamma uses the Lanczos approximation (g = 7).
2. The tails of each distribution come from those functions: z and chi-square from the incomplete gamma, t and F from the incomplete beta. A critical value is found by bisection on the tail until the bracket cannot shrink, so it is as exact as the tail. Values are returned to 10 significant digits.
3. Two-sided z and t values put alpha/2 in each tail and give plus and minus one value; two-sided chi-square and F give the lower and upper alpha/2 points.
4. d2 and d3, the mean and standard deviation of the range of n standard normal values, come from integrating the range's distribution on a grid of step 0.01 (the trapezoid rule across x, Simpson's rule across the range). c4 is sqrt(2/(n-1)) Gamma(n/2) / Gamma((n-1)/2).
5. Control limits use those constants: X-double-bar plus or minus A2 R-bar (or A3 s-bar), the range chart from D3 and D4 R-bar, the s chart from B3 and B4 s-bar, and the individuals chart from X-bar plus or minus 3 MR-bar / d2 with moving ranges of 2.

> Steps 6 to 8, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/stats-tables/#what) below.

## What does it not cover?

- It assumes normal data from a stable process for capability and sigma level.
- Subgroups of unequal size are not charted.
- It covers single sampling plans only, not double or sequential plans, and no published sampling standard tables.
- It is computed from the definitions; it does not judge whether a chart or test is the right one for your data.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 8 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Nothing is read from a data file at run time: every value is computed. The NIST/SEMATECH e-Handbook tables the tests compare with were read on 2026-11-08 and are stored with each page's hash.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check log-gamma and the distributions against exact formulas, every printed cell of the NIST normal, t, chi-square and F tables (with the cells where NIST's last printed digit is off named and bounded), d2 and d3 against their exact values for n = 2 and 3, c4 against NIST, NIST's printed A2, D3 and D4, the NIST individuals and capability examples, sigma level with and without the shift, and binomial and hypergeometric OC curves.

- [NIST/SEMATECH e-Handbook 1.3.6.7.1: Cumulative distribution function of the standard normal distribution](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3671.htm), see the document, read 2026-11-08
- [NIST/SEMATECH e-Handbook 1.3.6.7.2: Critical values of the Student's t distribution](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm), see the document, read 2026-11-08
- [NIST/SEMATECH e-Handbook 1.3.6.7.4: Critical values of the chi-square distribution](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3674.htm), see the document, read 2026-11-08
- [NIST/SEMATECH e-Handbook 1.3.6.7.3: Upper critical values of the F distribution](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3673.htm), see the document, read 2026-11-08
- [NIST/SEMATECH e-Handbook 6.3.2: What are variables control charts? (the c4 formula](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc32.htm), see the document, read 2026-11-08
- [NIST/SEMATECH e-Handbook 6.3.2.1: Shewhart X-bar and R and S control charts (A2, D3, D4 for n = 2 to 10](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc321.htm), see the document, read 2026-11-08
- [NIST/SEMATECH e-Handbook 6.3.2.2: Individuals control charts](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc322.htm), see the document, read 2026-11-08
- [NIST/SEMATECH e-Handbook 6.1.6: What is process capability?](https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the statistical tables: control chart constants and critical values compute?

The tool gives the control chart constants (d2, d3, c4, c5, A, A2, A3, D1, D2, D3, D4, B3, B4, B5, B6, E2, d2inv, c4inv) for any subgroup size from 2 to 100; critical values and p-values for the z, t, chi-square, f distributions at any degrees of freedom up to 100,000; printed-style tables; control limits for xbar-r, xbar-s, i-mr charts from data or summaries; Cp, Cpk, Pp and Ppk; sigma level from DPMO, yield or counts; and the operating characteristic curve of a single sampling plan. Every value is computed, so any n, df or alpha works, not only the rows a printed table has.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `constants`: Returns every constant for one subgroup size n, or a row for each n from one size to another (2 to 25 by default).
- `critical`: Returns the critical value for a distribution, alpha and tail (upper, lower or two-sided, the default), with what it means in words.
- `probability`: Returns the lower, upper and two-sided tail probabilities (p-values) of a statistic x.
- `table`: Returns a printed-style table: cumulative z by row and column; t or chi-square upper critical values by df and alpha; or F upper critical values by df1 and df2 for one alpha. At most 200 rows and 2,500 values.
- `limits`: Returns the center line and control limits of an X-bar and R, X-bar and s, or individuals and moving range chart, from the data or from summaries, with the constants used, the within sigma and, from data, the points outside the limits.
- `capability`: Returns Cp, Cpk, Cpu, Cpl from the within-subgroup sigma and Pp, Ppk, Ppu, Ppl from the overall standard deviation, with the expected parts per million outside each limit.
- `sigma`: Returns DPMO, yield and the short-term and long-term sigma level from any one of them, or from defects, units and opportunities per unit.
- `oc`: Returns the probability of accepting a lot at each percent defective for a plan of sample size n and acceptance number c, the percent defective at 95%, 50% and 10% acceptance, and, for a finite lot, the average outgoing quality, total inspection and AOQL.

Inputs:

- `n, from, to`: Subgroup size, or a range of sizes, from 2 to 100.
- `dist, alpha, tail, df, df1, df2, x`: The distribution (z, t, chi-square, f), the significance level between 0 and 1, the tail, the degrees of freedom (above 0, at most 100,000), and the statistic for probability.
- `alphas, df1s`: For table: up to 12 alphas as columns (t and chi-square), or up to 20 df1 columns (F).
- `chart, subgroups, values`: The chart (xbar-r, xbar-s, i-mr); equal-size subgroups (at most 1,000) or individual values (3 to 10,000).
- `grandMean, rBar, sBar, mean, mrBar`: Summaries instead of data, for limits.
- `lsl, usl, method, sigmaWithin, sigmaOverall`: For capability: the specification limits (one or both), rbar or sbar for the within sigma from subgroups, or the sigmas given directly.
- `dpmo, yield, sigma, defects, units, opportunities, shift`: For sigma: one way in, and the shift (1.5 by default, 0 to 3).
- `n, c, lotSize, points`: For oc: the sample size, the acceptance number, the lot size for the hypergeometric model, and up to 101 percent-defective points.

Outputs:

- constants: rows of every constant by n
- critical: value (or lower and upper) and meaning; probability: lower, upper and twoSided
- table: meaning, columns and rows
- limits: the center lines and limits of both charts, sigmaWithin, the constants and formulas, and signals from data
- capability: mean, sigmas, the method, the indices and expected ppm; sigma: dpmo, yieldPercent, sigmaShortTerm and sigmaLongTerm
- oc: the model, the percent defective at 95%, 50% and 10% acceptance, the rows and, for a lot, the AOQL

**Every step in full (8) and the rules**

1. Log-gamma uses the Lanczos approximation (g = 7). The regularized incomplete gamma uses its series or continued fraction, and the regularized incomplete beta its continued fraction.
2. The tails of each distribution come from those functions: z and chi-square from the incomplete gamma, t and F from the incomplete beta. A critical value is found by bisection on the tail until the bracket cannot shrink, so it is as exact as the tail. Values are returned to 10 significant digits.
3. Two-sided z and t values put alpha/2 in each tail and give plus and minus one value; two-sided chi-square and F give the lower and upper alpha/2 points.
4. d2 and d3, the mean and standard deviation of the range of n standard normal values, come from integrating the range's distribution on a grid of step 0.01 (the trapezoid rule across x, Simpson's rule across the range). c4 is sqrt(2/(n-1)) Gamma(n/2) / Gamma((n-1)/2). Every other constant follows from d2, d3 and c4 by its formula, for example A2 = 3 / (d2 sqrt(n)), D4 = 1 + 3 d3 / d2 and B4 = 1 + 3 c5 / c4.
5. Control limits use those constants: X-double-bar plus or minus A2 R-bar (or A3 s-bar), the range chart from D3 and D4 R-bar, the s chart from B3 and B4 s-bar, and the individuals chart from X-bar plus or minus 3 MR-bar / d2 with moving ranges of 2. From data, every point outside a limit is listed.
6. Capability takes the within sigma from R-bar / d2, s-bar / c4 or MR-bar / d2, and the overall sigma as the sample standard deviation. Cp is (USL - LSL) / 6 sigma and Cpk the smaller of the two one-sided indices; Pp and Ppk do the same with the overall sigma.
7. Sigma level is the normal z value of the defect rate (long term) plus the shift, 1.5 by default (short term). 3.4 DPMO is 6 sigma only with the 1.5 shift.
8. The OC curve is the binomial probability of at most c defectives in n, or the hypergeometric for a finite lot, and the 95%, 50% and 10% points are found by bisection.

**NIST/SEMATECH e-Handbook of Statistical Methods.**

The c4 formula (6.3.2), the X-bar, R and s charts with their printed A2, D3 and D4 for n = 2 to 10 (6.3.2.1), the individuals chart example (6.3.2.2), the capability example (6.1.6) and the normal, t, chi-square and F tables (1.3.6.7.1 to 1.3.6.7.4) are the reference, read on 2026-11-08.

## Which edge cases does it handle?

**The edge cases (6)**

- Any subgroup size from 2 to 100 and any degrees of freedom up to 100,000 work, not only the printed rows.
- D3 is 0 below n = 7 and B3 is 0 below n = 6, as the formulas give.
- Subgroups of unequal size are refused: they need limits per subgroup.
- For subgroups larger than about 10, the X-bar and R answer notes that the s chart uses the data better.
- Capability with only one specification limit gives the one-sided indices and no Cp or Pp.
- Data with no spread is refused, since capability is not defined.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Control chart constants for a subgroup of 5**

Control chart constants for a subgroup of 5

| Result | Value |
| --- | --- |
| d2 | 2.3259289 |
| d3 | 0.86408194 |
| c4 | 0.939985603 |
| A2 | 0.57681933 |
| A3 | 1.4272993 |
| D3 | 0 |
| D4 | 2.1144991 |
| B3 | 0 |
| B4 | 2.0889979 |

**The input**

```json
{
  "op": "constants",
  "n": 5
}
```

**More worked examples (3)**

**Critical t, two-tailed, alpha 0.05, 12 degrees of freedom**

Critical t, two-tailed, alpha 0.05, 12 degrees of freedom

| Result | Value |
| --- | --- |
| value | 2.17881283 |
| meaning | P(\|X\| \> 2.1788) = 0.05 for the Student's t distribution with df = 12: reject a two-sided test when \|statistic\| \> 2.1788. |

**The input**

```json
{
  "op": "critical",
  "dist": "t",
  "alpha": 0.05,
  "tail": "two",
  "df": 12
}
```

**Individuals and moving range limits for the NIST flow-rate example**

Individuals and moving range limits for the NIST flow-rate example

| Result | Value |
| --- | --- |
| individuals LCL | 45.81758847 |
| center | 50.81 |
| individuals UCL | 55.80241153 |
| moving range UCL | 6.133821012 |
| sigma within | 1.664137178 |

**The input**

```json
{
  "op": "limits",
  "chart": "i-mr",
  "values": [
    49.6,
    47.6,
    49.9,
    51.3,
    47.8,
    51.2,
    52.6,
    52.4,
    53.6,
    52.1
  ]
}
```

**Sigma level for 3.4 defects per million opportunities**

Sigma level for 3.4 defects per million opportunities

| Result | Value |
| --- | --- |
| yield | 99.99966% |
| sigma short term | 5.99985447 |
| sigma long term | 4.49985447 |

**The input**

```json
{
  "op": "sigma",
  "dpmo": 3.4
}
```

## How is it tested?

**What its test suite asserts (3)**

- Every printed cell of the NIST e-Handbook normal, t, chi-square and F tables is reproduced; the cells where the printed last digit differs are named and bounded.
- d2 and d3 match their exact values for n = 2 and 3, c4 matches NIST, and NIST's printed A2, D3 and D4 for n = 2 to 10 are reproduced.
- The NIST individuals chart and capability examples are reproduced, and 3.4 DPMO is 6 sigma only with the 1.5 shift.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Statistical tables: control chart constants and critical values tool](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/).

## Questions

### Is there any AI in the statistical tables: control chart constants and critical values answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the statistical tables: control chart constants and critical values refuse to answer?

It assumes normal data from a stable process for capability and sigma level. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Statistical tables: control chart constants and critical values tool](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/stats-tables/  
Data as of: 2026-11-04
