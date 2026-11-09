# How to read z, t, chi-square and F tables

For 95% two-sided with 10 degrees of freedom the critical t is 2.228 (one-sided 95%: 1.812); the rule for every table is to know which tail its columns give before you read across.

- t, 10 df, two-sided 95%: 2.228
- one-sided 95%: 1.812

## Any critical value

[Find the critical value](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/?op=critical&dist=t&alpha=0.05&df=10&tail=two)

## One tail or two

A two-sided test at alpha 0.05 puts 0.025 in each tail, so you read the column for 0.025 (NIST labels it 0.975, the probability below the value). Reading the 0.05 column instead is the most common mistake: with 10 df it gives 1.812, the one-sided value, not 2.228.

## z: negative scores and symmetry

P(Z \< -1.23) = 0.10935. A table that only lists positive z gives the same number as 1 - P(Z \< 1.23), because the curve is symmetric. NIST's table gives the area from 0 to z instead (0.39065 at 1.23), so add 0.5 for P(Z \< z).

## t: why the values shrink toward z

With few degrees of freedom the sample standard deviation is uncertain, so t is wider; as df grows it approaches the normal value 1.9600.

Two-sided 95% critical t by degrees of freedom

| df | t |
| --- | ---: |
| 1 | 12.7062 |
| 2 | 4.3027 |
| 5 | 2.5706 |
| 10 | 2.2281 |
| 30 | 2.0423 |
| 100 | 1.9840 |
| 1000 | 1.9623 |
| infinity (z) | 1.9600 |

## Chi-square: two tails, two tables

Chi-square is not symmetric, so its tables come in upper and lower tails. With 10 df, P(X \> 18.307) = 0.05 and P(X \< 3.940) = 0.05. A two-sided test of a variance at 0.05 uses the 0.025 point of each tail.

## F: the order of the degrees of freedom

F tables put the numerator df (df1) across the top and the denominator df (df2) down the side, and the order matters: at 0.05, F(3, 20) = 3.098 but F(20, 3) = 8.660. For a one-way ANOVA with 4 groups and 24 observations, df1 = 3 and df2 = 20.

## Exact values versus a printed table

Printed tables round to three decimals and stop at fixed rows. Values here are computed to about ten significant digits at any df. They agree with the NIST e-Handbook's tables cell for cell to the decimals NIST prints, apart from a few last-digit rounding differences listed in [the NIST comparison](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/vs/nist-handbook/).

## Upper-tail t, df 1 to 30

| df | 0.1 | 0.05 | 0.025 | 0.01 | 0.005 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 1 | 3.078 | 6.314 | 12.706 | 31.821 | 63.657 |
| 2 | 1.886 | 2.920 | 4.303 | 6.965 | 9.925 |
| 3 | 1.638 | 2.353 | 3.182 | 4.541 | 5.841 |
| 4 | 1.533 | 2.132 | 2.776 | 3.747 | 4.604 |
| 5 | 1.476 | 2.015 | 2.571 | 3.365 | 4.032 |
| 6 | 1.440 | 1.943 | 2.447 | 3.143 | 3.707 |
| 7 | 1.415 | 1.895 | 2.365 | 2.998 | 3.499 |
| 8 | 1.397 | 1.860 | 2.306 | 2.896 | 3.355 |
| 9 | 1.383 | 1.833 | 2.262 | 2.821 | 3.250 |
| 10 | 1.372 | 1.812 | 2.228 | 2.764 | 3.169 |
| 11 | 1.363 | 1.796 | 2.201 | 2.718 | 3.106 |
| 12 | 1.356 | 1.782 | 2.179 | 2.681 | 3.055 |
| 13 | 1.350 | 1.771 | 2.160 | 2.650 | 3.012 |
| 14 | 1.345 | 1.761 | 2.145 | 2.624 | 2.977 |
| 15 | 1.341 | 1.753 | 2.131 | 2.602 | 2.947 |
| 16 | 1.337 | 1.746 | 2.120 | 2.583 | 2.921 |
| 17 | 1.333 | 1.740 | 2.110 | 2.567 | 2.898 |
| 18 | 1.330 | 1.734 | 2.101 | 2.552 | 2.878 |
| 19 | 1.328 | 1.729 | 2.093 | 2.539 | 2.861 |
| 20 | 1.325 | 1.725 | 2.086 | 2.528 | 2.845 |
| 21 | 1.323 | 1.721 | 2.080 | 2.518 | 2.831 |
| 22 | 1.321 | 1.717 | 2.074 | 2.508 | 2.819 |
| 23 | 1.319 | 1.714 | 2.069 | 2.500 | 2.807 |
| 24 | 1.318 | 1.711 | 2.064 | 2.492 | 2.797 |
| 25 | 1.316 | 1.708 | 2.060 | 2.485 | 2.787 |
| 26 | 1.315 | 1.706 | 2.056 | 2.479 | 2.779 |
| 27 | 1.314 | 1.703 | 2.052 | 2.473 | 2.771 |
| 28 | 1.313 | 1.701 | 2.048 | 2.467 | 2.763 |
| 29 | 1.311 | 1.699 | 2.045 | 2.462 | 2.756 |
| 30 | 1.310 | 1.697 | 2.042 | 2.457 | 2.750 |

- [NIST/SEMATECH e-Handbook 1.3.6.7.1: Cumulative distribution function of the standard normal distribution (read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3671.htm)
- [NIST/SEMATECH e-Handbook 1.3.6.7.2: Critical values of the Student's t distribution (read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3672.htm)
- [NIST/SEMATECH e-Handbook 1.3.6.7.4: Critical values of the chi-square distribution (read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3674.htm)
- [NIST/SEMATECH e-Handbook 1.3.6.7.3: Upper critical values of the F distribution (read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3673.htm)

## Questions

### What is the critical t value for 95% confidence with 10 degrees of freedom?

Two-sided 95%: t = 2.228. One-sided 95%: t = 1.812.

## Related

- [Control chart constants](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/control-chart-constants/)
- [NIST handbook tables compared](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/vs/nist-handbook/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/reading-distribution-tables/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/reading-distribution-tables.csv
