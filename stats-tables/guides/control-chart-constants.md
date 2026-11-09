# Control chart constants A2, D3, D4 and d2

For a subgroup of 5, A2 = 0.577, D3 = 0, D4 = 2.114 and d2 = 2.326; the table gives d2, d3, A2, D3 and D4 for every n from 2 to 25, computed from their definitions.

- A2: 0.577
- D4: 2.114
- d2: 2.326

X-bar and R chart constants, n = 2 to 25

| n | d2 | d3 | A2 | D3 | D4 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2 | 1.1284 | 0.8525 | 1.8800 | 0.0000 | 3.2665 |
| 3 | 1.6926 | 0.8884 | 1.0233 | 0.0000 | 2.5746 |
| 4 | 2.0588 | 0.8798 | 0.7286 | 0.0000 | 2.2821 |
| 5 | 2.3259 | 0.8641 | 0.5768 | 0.0000 | 2.1145 |
| 6 | 2.5344 | 0.8480 | 0.4832 | 0.0000 | 2.0038 |
| 7 | 2.7044 | 0.8332 | 0.4193 | 0.0757 | 1.9243 |
| 8 | 2.8472 | 0.8198 | 0.3725 | 0.1362 | 1.8638 |
| 9 | 2.9700 | 0.8078 | 0.3367 | 0.1840 | 1.8160 |
| 10 | 3.0775 | 0.7971 | 0.3083 | 0.2230 | 1.7770 |
| 11 | 3.1729 | 0.7873 | 0.2851 | 0.2556 | 1.7444 |
| 12 | 3.2585 | 0.7785 | 0.2658 | 0.2833 | 1.7167 |
| 13 | 3.3360 | 0.7704 | 0.2494 | 0.3072 | 1.6928 |
| 14 | 3.4068 | 0.7630 | 0.2354 | 0.3281 | 1.6719 |
| 15 | 3.4718 | 0.7562 | 0.2231 | 0.3466 | 1.6534 |
| 16 | 3.5320 | 0.7499 | 0.2123 | 0.3630 | 1.6370 |
| 17 | 3.5879 | 0.7441 | 0.2028 | 0.3779 | 1.6221 |
| 18 | 3.6401 | 0.7386 | 0.1943 | 0.3913 | 1.6087 |
| 19 | 3.6890 | 0.7335 | 0.1866 | 0.4035 | 1.5965 |
| 20 | 3.7350 | 0.7287 | 0.1796 | 0.4147 | 1.5853 |
| 21 | 3.7783 | 0.7242 | 0.1733 | 0.4250 | 1.5750 |
| 22 | 3.8194 | 0.7199 | 0.1675 | 0.4345 | 1.5655 |
| 23 | 3.8583 | 0.7159 | 0.1621 | 0.4434 | 1.5566 |
| 24 | 3.8953 | 0.7121 | 0.1572 | 0.4516 | 1.5484 |
| 25 | 3.9306 | 0.7084 | 0.1526 | 0.4593 | 1.5407 |

## Constants for any n from 2 to 100

[Show the constants](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/?op=constants&n=5)

## Worked example, n = 5

Say 25 subgroups of 5 give a grand mean of 10.00 and an average range of 0.12. Then:

- `UCL(X-bar) = 10.00 + 0.577 x 0.12 = 10.0692`
- `LCL(X-bar) = 10.00 - 0.577 x 0.12 = 9.9308`
- `UCL(R) = 2.114 x 0.12 = 0.2537` and LCL(R) = 0 x 0.12 = 0
- `sigma = R-bar / d2 = 0.12 / 2.326 = 0.0516`

The full step-by-step version, from raw readings, is in [the worked X-bar and R chart](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/xbar-r-control-limits-worked/).

## Why D3 is 0 below n = 7

The R chart's lower limit is D3 R-bar with D3 = 1 - 3 d3 / d2. For n = 6 that is 1 - 3 x 0.8480 / 2.5344 = -0.0038, below zero; a range cannot be negative, so the factor is set to 0. From n = 7 it turns positive (0.076), so only from there can a range be too small to be plausible.

## The formulas

- `A2 = 3 / (d2 sqrt(n))`
- `D3 = max(0, 1 - 3 d3 / d2)` and `D4 = 1 + 3 d3 / d2`
- d2 and d3 are the mean and standard deviation of the range of n standard normal values (NIST credits the range-to-sigma relationship to Patnaik, 1946). They are computed here by numerical integration and match the exact values 2 / sqrt(pi) and 3 / sqrt(pi) for n = 2 and 3.

> NIST prints D4 = 2.115 for n = 5; the computed value is 2.11450, which most printed tables round to 2.114. Every other A2, D3 and D4 that NIST prints for n = 2 to 10 agrees to its three decimals.

## Other charts

- X-bar and s chart (better for n above about 10): A3 = 1.427, B3 = 0, B4 = 2.089, c4 = 0.9400 for n = 5. [All constants for n = 30](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/control-chart-constants/n-30/).
- Individuals and moving range chart: X-bar +/- 2.659 MR-bar, and the moving range chart's upper limit 3.267 MR-bar (the n = 2 values of 3 / d2 and D4).

- [NIST/SEMATECH e-Handbook 6.3.2.1: Shewhart X-bar and R and S control charts (A2, D3, D4 for n = 2 to 10; read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc321.htm)
- [NIST/SEMATECH e-Handbook 6.3.2: What are variables control charts? (the c4 formula; read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc32.htm)
- [NIST/SEMATECH e-Handbook 6.3.2.2: Individuals control charts (read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc322.htm)

## Questions

### What are the control chart constants for subgroup size 5?

For n = 5: A2 = 0.577, D3 = 0, D4 = 2.114 and d2 = 2.326 (d3 = 0.864).

### Why is D3 zero for small subgroups?

D3 = 1 - 3 d3 / d2 is negative until n = 7, and a range cannot be below 0, so the lower limit of the R chart is 0 for n of 6 or less.

## Related

- [Worked X-bar and R chart](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/xbar-r-control-limits-worked/)
- [Constants for n = 2 to 100 (printable)](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/control-chart-constants-pdf/)
- [Cp, Cpk, Pp and Ppk](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/cp-cpk-pp-ppk/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/control-chart-constants/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/control-chart-constants.csv
