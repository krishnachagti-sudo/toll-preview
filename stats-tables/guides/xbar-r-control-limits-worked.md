# X-bar and R chart control limits, worked step by step

For these 25 subgroups of 5, the grand mean is 10.0013 and R-bar is 0.1112, so the X-bar chart runs from 9.9371 to 10.0654 (A2 = 0.5768) and the R chart from 0 to 0.2351 (D4 = 2.1145).

- X-double-bar: 10.0013
- R-bar: 0.1112
- UCL: 10.0654
- LCL: 9.9371

## Your own subgroups

[Open the control limits calculator](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/?op=limits&chart=xbar-r)

## The data, with each subgroup's mean and range

> The readings are made up for this example (a fixed random sequence, mean 10.00 mm, sigma 0.05 mm, with subgroup 17 shifted up by 0.12 mm). The CSV below has every number.

| Subgroup | Readings (mm) | Mean | Range |
| --- | --- | ---: | ---: |
| 1 | 10.00, 9.96, 10.02, 9.98, 10.05 | 10.002 | 0.09 |
| 2 | 9.98, 10.00, 10.00, 10.04, 9.93 | 9.990 | 0.11 |
| 3 | 10.10, 10.05, 10.08, 9.96, 10.06 | 10.050 | 0.14 |
| 4 | 9.99, 10.01, 10.08, 10.05, 10.07 | 10.040 | 0.09 |
| 5 | 9.98, 9.99, 9.92, 9.97, 10.04 | 9.980 | 0.12 |
| 6 | 9.96, 9.95, 10.08, 9.94, 9.97 | 9.980 | 0.14 |
| 7 | 10.01, 10.05, 10.00, 10.00, 9.99 | 10.010 | 0.06 |
| 8 | 10.05, 10.01, 10.03, 10.05, 10.02 | 10.032 | 0.04 |
| 9 | 9.94, 10.03, 9.88, 10.04, 10.07 | 9.992 | 0.19 |
| 10 | 9.93, 9.91, 9.98, 9.98, 9.96 | 9.952 | 0.07 |
| 11 | 9.94, 9.97, 10.03, 10.02, 10.02 | 9.996 | 0.09 |
| 12 | 9.94, 10.06, 10.01, 10.02, 10.02 | 10.010 | 0.12 |
| 13 | 9.94, 10.00, 9.97, 9.93, 10.01 | 9.970 | 0.08 |
| 14 | 9.99, 9.96, 10.07, 10.03, 10.07 | 10.024 | 0.11 |
| 15 | 9.96, 9.93, 9.97, 10.00, 10.01 | 9.974 | 0.08 |
| 16 | 10.05, 10.03, 10.08, 9.87, 10.04 | 10.014 | 0.21 |
| 17 | 10.08, 10.11, 10.06, 10.15, 10.02 | 10.084 | 0.13 |
| 18 | 10.00, 9.91, 9.97, 10.03, 10.07 | 9.996 | 0.16 |
| 19 | 9.94, 10.02, 10.02, 10.06, 9.97 | 10.002 | 0.12 |
| 20 | 9.97, 10.00, 10.04, 9.94, 9.98 | 9.986 | 0.10 |
| 21 | 9.93, 9.90, 9.99, 10.01, 10.00 | 9.966 | 0.11 |
| 22 | 9.94, 10.01, 10.01, 9.94, 10.05 | 9.990 | 0.11 |
| 23 | 10.03, 10.05, 10.00, 9.99, 9.97 | 10.008 | 0.08 |
| 24 | 9.97, 9.92, 9.95, 10.05, 10.01 | 9.980 | 0.13 |
| 25 | 9.98, 10.03, 9.95, 10.05, 10.01 | 10.004 | 0.10 |

## The arithmetic

- Grand mean: the 25 subgroup means add to 250.032; divided by 25, `X-double-bar = 10.00128`.
- Average range: the ranges add to 2.78; divided by 25, `R-bar = 0.1112`.
- `UCL = 10.00128 + 0.5768 x 0.1112 = 10.0654`
- `LCL = 10.00128 - 0.5768 x 0.1112 = 9.9371`
- `R chart: 0 x 0.1112 = 0 to 2.1145 x 0.1112 = 0.2351`
- `sigma within = R-bar / d2 = 0.1112 / 2.3259 = 0.0478`

Result: subgroup 17 (mean 10.084) is above the UCL; no range is outside its limits.

## The common mistake

Using the standard deviation of all 125 readings (0.0508) instead of R-bar / d2 (0.0478). The overall figure includes the shift between subgroups, so limits built on it are wider and hide the very shifts the chart is for. Limits come from within-subgroup variation only.

## When to recalculate, and what not to plot

- NIST's advice: change limits only for a compelling reason, such as at least 30 more points with no known process change, or a real change to the process.
- Do not draw specification limits on an X-bar chart: it plots subgroup means, and specs apply to single parts. Compare parts to specs with capability instead.
- After plotting, apply the run rules you use (NIST describes the Western Electric rules) as well as the 3-sigma limits.

- [NIST/SEMATECH e-Handbook 6.3.2.1: Shewhart X-bar and R and S control charts (A2, D3, D4 for n = 2 to 10; read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc321.htm)
- [NIST/SEMATECH e-Handbook 6.3.2: What are variables control charts? (the c4 formula; read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc32.htm)

## Steps

1. **Lay out the data.** Put the readings in rows of one subgroup each: here 25 subgroups of 5 shaft diameters in mm.
2. **Subgroup means and ranges.** For each subgroup, the mean of its readings and the range (largest minus smallest).
3. **Grand mean and average range.** Average the 25 means (X-double-bar = 10.00128) and the 25 ranges (R-bar = 0.1112).
4. **X-bar chart limits.** X-double-bar plus and minus A2 R-bar, with A2 = 0.5768 for n = 5: 9.9371 to 10.0654.
5. **R chart limits.** D3 R-bar to D4 R-bar, with D3 = 0 and D4 = 2.1145: 0 to 0.2351.
6. **Plot and look.** Plot the means and ranges against the limits. Here subgroup 17 is above the X-bar UCL, so look for its cause.

## Related

- [Control chart constants](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/control-chart-constants/)
- [Cp, Cpk, Pp and Ppk on the same data](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/cp-cpk-pp-ppk/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/xbar-r-control-limits-worked/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/xbar-r-control-limits-worked.csv
