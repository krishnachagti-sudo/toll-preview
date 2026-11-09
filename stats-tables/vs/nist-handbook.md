# The NIST e-Handbook tables and these computed values

Of the 8,016 table cells checked in the NIST/SEMATECH e-Handbook (normal, t, chi-square, F), 7,993 match values computed from the definitions to every decimal NIST prints; the other 23 differ in the last digit, such as F(0.01; 2, 1), printed 4999.52, which is exactly 4999.5 (the closed form 1 / (2 x 0.01^2) - 1 / 2).

## What the handbook has

- Standard normal: the area from 0 to z, for z from 0.00 to 4.09 (5 decimals).
- Student's t: df 1 to 100 and infinity, six probabilities from 0.90 to 0.999 (3 decimals).
- Chi-square: df 1 to 100, upper and lower tails at five probabilities each (3 decimals).
- F: numerator df 1 to 20, denominator df 1 to 100, at the 10%, 5% and 1% levels (3 decimals, 2 for the largest values).
- Control charts: the c4 formula (c4 = 0.9727 for n = 10) and A2, D3 and D4 for n = 2 to 10.

## Where it differs in the last digit

| Cell | NIST prints | Computed |
| --- | ---: | ---: |
| F at 0.01, df1 = 2, df2 = 1 | 4999.52 | 4999.5 |
| F at 0.01, df1 = 1, df2 = 1 | 4052.19 | 4052.181 |
| F at 0.01, df1 = 4, df2 = 1 | 5624.62 | 5624.583 |
| Chi-square upper 0.001, df = 8 | 26.125 | 26.1245 |
| Normal, area 0 to 1.36 | 0.41308 | 0.413085 |
| D4 for n = 5 | 2.115 | 2.11450 |

F(0.01; 1, 1) and F(0.01; 2, 1) have closed forms (tan(0.495 pi)^2 and 4999.5), so these are rounding slips in the printed table, not a different method. Most are in the df2 = 1 row at the 1% level, the largest values in the table. The t table also labels its last row, the normal values, as "100." on the page we read; the same values are its infinity row.

## When the handbook is better

For learning: it explains why each table exists, how to use it in a test, and the theory behind control charts and capability, with worked examples, and it is free and authoritative. These pages compute values; NIST teaches the subject.

## What computed values add

- Any df, any alpha (not only the printed columns), to about ten significant digits.
- Control chart constants past n = 10 (to 100), all eighteen of them, and the s-chart constants.
- The same numbers over a REST API and MCP, so a script or an AI agent can use exact values instead of recalling a table.

## Look one up

[Find the critical value](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/?op=critical&dist=f&alpha=0.01&df1=2&df2=1&tail=upper)

- [NIST/SEMATECH e-Handbook 1.3.6.7.1: Cumulative distribution function of the standard normal distribution (read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3671.htm)
- [NIST/SEMATECH e-Handbook 1.3.6.7.2: Critical values of the Student's t distribution (read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm)
- [NIST/SEMATECH e-Handbook 1.3.6.7.4: Critical values of the chi-square distribution (read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3674.htm)
- [NIST/SEMATECH e-Handbook 1.3.6.7.3: Upper critical values of the F distribution (read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3673.htm)
- [NIST/SEMATECH e-Handbook 6.3.2: What are variables control charts? (the c4 formula; read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc32.htm)
- [NIST/SEMATECH e-Handbook 6.3.2.1: Shewhart X-bar and R and S control charts (A2, D3, D4 for n = 2 to 10; read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc321.htm)

## Related

- [Reading z, t, chi-square and F tables](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/reading-distribution-tables/)
- [Minitab compared](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/vs/minitab/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/stats-tables/vs/nist-handbook/  
Data as of: 2026-11-08
