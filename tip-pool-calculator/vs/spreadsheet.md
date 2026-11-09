# Spreadsheet vs calculator

Rounding each share to the nearest cent in a spreadsheet pays out $1,240.01 on this night's $1,240.00 pool, $0.01 more; the largest-remainder rule gives $1,240.00 exactly, and a sheet cannot tell you who may be in the pool.

## What a spreadsheet does (read November 8, 2026)

A spreadsheet does whatever its formulas say. The usual =ROUND(pool\*hours/total,2) rounds each share on its own, so the shares can add up to a cent or two more or less than the pool. It has no idea who may be in the pool.

The worked night: nearest-cent rounding vs largest remainder.

| Name | Nearest cent | Largest remainder |
| --- | ---: | ---: |
| Ana | $193.75 | $193.75 |
| Ben | $155.00 | $155.00 |
| Carla | $135.63 | $135.62 |
| Cleo | $206.67 | $206.67 |
| Dev | $167.92 | $167.92 |
| Ezra | $103.33 | $103.33 |
| Fay | $129.17 | $129.17 |
| Gus | $148.54 | $148.54 |

## What this calculator adds

- A legality check on every run: managers, supervisors and owners, back of house with or without a tip credit, card fees, against 29 CFR 531.54, Fact Sheet #15 and the rules of each state whose own site we read, with the rule quoted.
- Cent-exact shares that add up to the pool, with the leftover-cent rule stated.
- Free on its page; $0.002 per call over the API or MCP; $0.25 for a pay-run record (payroll CSV with the IRS occupation code, tip sheet to sign); never more than $4.99 a month.

Formulas: [Excel template](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/templates/excel/) and [Google Sheets template](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/templates/google-sheets/).

## When a spreadsheet is the better choice

When your pool logic is unusual (several pools, tip-outs feeding pools, carry-overs) and you are happy to keep the formulas and the legal check yourself. The Excel and Google Sheets templates here give the cent-exact formulas.

> Not legal or tax advice. Shares are arithmetic on the hours, points and roles shown; the check applies the quoted rules to those facts. Whether someone is a manager or supervisor, or customarily tipped, depends on their duties. State rules are shown only for states whose own site was read; city rules are not covered.

## Sources

- [29 CFR 531.54, Tip pooling (eCFR, current to November 4, 2026, read November 8, 2026)](https://www.ecfr.gov/current/title-29/section-531.54)

## Related

- [Who can be in the pool](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/guides/who-can-be-in-the-pool/)
- [Split by hours](https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/by-hours/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/tip-pool-calculator/vs/spreadsheet/  
Data as of: 2026-11-08
