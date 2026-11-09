# Cp, Cpk, Pp and Ppk

Cp and Cpk use the within-subgroup sigma (R-bar / d2), Pp and Ppk the overall standard deviation; on the example data (LSL 9.8, USL 10.2) that gives Cp 1.394, Cpk 1.386, Pp 1.314 and Ppk 1.305.

- Cp: 1.394
- Cpk: 1.386
- Pp: 1.314
- Ppk: 1.305

## The four indices

| Index | Formula | Sigma used |
| --- | --- | --- |
| Cp | `(USL - LSL) / (6 sigma_within)` | Within subgroups: R-bar / d2, s-bar / c4, or MR-bar / 1.128 |
| Cpk | `min(USL - mean, mean - LSL) / (3 sigma_within)` | Within subgroups |
| Pp | `(USL - LSL) / (6 sigma_overall)` | Overall standard deviation of all readings |
| Ppk | `min(USL - mean, mean - LSL) / (3 sigma_overall)` | Overall |

The link to the constants table is d2: within-subgroup sigma is R-bar / d2 (d2 = 2.3259 for subgroups of 5). See [control chart constants](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/control-chart-constants/).

## NIST's example

NIST's e-Handbook takes USL 20, LSL 8, mean 16 and sigma 2: Cp = 12 / 12 = 1.0000, Cpu = 4 / 6 = 0.6667, Cpl = 8 / 6 = 1.3333, so Cpk = 0.6667. The process could fit the specs if it were centred at 14, but it runs at 16.

## One dataset, both ways

The 125 readings from [the worked X-bar and R chart](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/xbar-r-control-limits-worked/), with specs 9.8 to 10.2 mm:

|  | Within (Cp, Cpk) | Overall (Pp, Ppk) |
| --- | ---: | ---: |
| Sigma | 0.04781 | 0.05075 |
| Capability (Cp / Pp) | 1.394 | 1.314 |
| Upper (Cpu / Ppu) | 1.386 | 1.305 |
| Lower (Cpl / Ppl) | 1.403 | 1.322 |
| Cpk / Ppk | 1.386 | 1.305 |
| Expected parts outside spec, per million | 28.9 | 81.7 |

The gap (Ppk 1.305 against Cpk 1.386) is the shift in subgroup 17: overall variation counts it, within-subgroup variation does not.

## Reading the numbers

- NIST notes it would like Cpk to be at least 1.0 in its example. Customers set their own minimums (1.33 and 1.67 are common in contracts); check the one that applies to you rather than a general rule.
- Capability assumes normal data from a stable process: check the control chart first, and do not read Cpk from an unstable process.
- Too few subgroups make sigma, and so every index, uncertain.

## Your own data

[Open the capability calculator](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/?op=capability)

- [NIST/SEMATECH e-Handbook 6.1.6: What is process capability? (read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm)
- [NIST/SEMATECH e-Handbook 6.3.2.1: Shewhart X-bar and R and S control charts (A2, D3, D4 for n = 2 to 10; read November 8, 2026)](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc321.htm)

## Questions

### What is the difference between Cpk and Ppk?

Cpk uses the within-subgroup sigma (R-bar / d2 or s-bar / c4); Ppk uses the overall standard deviation of all readings. When Ppk is well below Cpk, the process mean is moving between subgroups.

## Related

- [The worked X-bar and R chart (same data)](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/xbar-r-control-limits-worked/)
- [Sigma level, DPMO and yield](https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/sigma-level-dpmo-yield/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/stats-tables/guides/cp-cpk-pp-ppk/  
Data as of: 2026-11-08
