# Sigma level, DPMO and yield

3.4 defects per million opportunities is 6.00 sigma with the conventional 1.5 sigma shift and 4.50 sigma without it; the table converts every half sigma both ways.

- 3.4 DPMO, with shift: 6.00
- without shift: 4.50

## Defects, opportunities, DPU and DPMO

A defect is one failure to meet a requirement; an opportunity is one place a defect could occur. 37 defects found in 500 units with 4 opportunities each: DPU = 37 / 500 = 0.074, and DPMO = 37 / (500 x 4) x 1,000,000 = 18,500, which is 3.59 sigma with the shift.

## The conversion table

| Sigma level | DPMO (1.5 shift) | Yield (1.5 shift) | DPMO (no shift) |
| --- | ---: | ---: | ---: |
| 1.0 | 691,462 | 30.85% | 158,655 |
| 1.5 | 500,000 | 50.00% | 66,807 |
| 2.0 | 308,538 | 69.15% | 22,750 |
| 2.5 | 158,655 | 84.13% | 6,210 |
| 3.0 | 66,807 | 93.32% | 1,350 |
| 3.5 | 22,750 | 97.72% | 233 |
| 4.0 | 6,210 | 99.38% | 31.7 |
| 4.5 | 1,350 | 99.87% | 3.4 |
| 5.0 | 233 | 99.98% | 0.287 |
| 5.5 | 31.7 | 99.99683% | 0.0190 |
| 6.0 | 3.4 | 99.99966% | 0.000987 |

> DPMO = 1,000,000 x P(Z \> sigma level - shift), one-sided, as the usual Six Sigma tables count it. Yield = 100% - DPMO / 10,000.

## The 1.5 sigma shift

The shift is a convention: it assumes the process mean drifts by up to 1.5 standard deviations over the long run, so a short-term 6 sigma process is scored by the long-term defect rate at 4.5 sigma. It is not a law of nature, and many statisticians object to it. Say which column you used; the two differ by exactly 1.5 at every DPMO.

## From DPMO to sigma

- 233 DPMO: 5.000 sigma with the shift, 3.500 without.
- 12,000 DPMO: 3.757 sigma with the shift, 2.257 without.

## Your own counts

[Convert](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/?op=sigma&dpmo=12000)

For a capability index instead of a sigma level, see [Cp, Cpk, Pp and Ppk](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/cp-cpk-pp-ppk/).

- [NIST/SEMATECH e-Handbook 1.3.6.7.1: Cumulative distribution function of the standard normal distribution (read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/eda/section3/eda3671.htm)

## Questions

### What sigma level is 3.4 DPMO?

6.0 with the 1.5 sigma shift (6.00); 4.50 without it.

### What sigma level is 233 DPMO?

5.00 with the 1.5 shift, 3.50 without it.

## Related

- [Cp, Cpk, Pp and Ppk](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/cp-cpk-pp-ppk/)
- [Reading z tables](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/reading-distribution-tables/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/sigma-level-dpmo-yield/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/sigma-level-dpmo-yield.csv
