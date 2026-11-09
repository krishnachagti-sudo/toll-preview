# Year-end overtime audit, 2026

2026 is the first year Forms W-2 must report qualified overtime in box 12, code TT, so a year-end audit now does two jobs: find the weeks paid short, and total each employee's FLSA premium; the sample's three employees have Ana Ruiz $252.00, Ben Okafor $0.00, Cara Bell $104.50.

- First W-2 year for code TT: 2026
- Deduction years: 2025 through 2028
- Sample code TT: $356.50

## The sample, per employee

Three made-up employees, one week each, from the auditor's sample file.

| Employee | Overtime | Double | Short | Code TT 2026 |
| --- | ---: | ---: | ---: | ---: |
| Ana Ruiz | 20.00 | 1.00 | $12.00 | $252.00 |
| Ben Okafor | 2.00 | 0.00 | $21.50 | $0.00 |
| Cara Bell | 11.00 | 0.00 | $0.00 | $104.50 |

## California: what stays out

The 64-hour California week at $22 pays $275.00 of premium; $264.00 of it (24 hours over 40 x $11) is qualified overtime. The rest is California daily, seventh-day and double-time premium, which FS-2026-13 Q16 leaves out: "only the amount minimally necessary to satisfy 29 USC § 207 is qualified overtime compensation for purposes of the tax deduction."

Run the year's export through [the auditor](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/): it lists code TT per employee per year beside the audit.

> A workweek that runs from December 2026 into January 2027 is counted in the year it ends; use the year it was paid if that differs. Not tax advice.

> Worked out by the auditor from the hours shown and the rules quoted with the date read. It assumes a non-exempt employee covered by the rule shown; a wage order, contract or policy may require more. Not legal, tax or payroll advice.

## Sources

- [IRS FS-2026-13, questions and answers on qualified overtime compensation, August 2026 (read November 8, 2026)](https://www.irs.gov/pub/taxpros/fs-2026-13.pdf)
- [IRS: One Big Beautiful Bill Act tax deductions (read November 8, 2026)](https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors)
- [California Labor Code section 510 (read November 8, 2026 from the Legislature's data download)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=510)

## Steps

1. **Export the whole year.** Every workweek of 2026 for every non-exempt employee, with the state, rate and what was paid.
2. **Audit the weeks.** Recompute overtime per workweek and correct any short weeks before the year closes.
3. **Total code TT.** Per employee: FLSA hours over 40 x one-half x the regular rate, added over the year.
4. **Report.** Put each employee's total in box 12, code TT, in full even above the deduction limit (FS-2026-13, Q10).

## Questions

### Is code TT required on 2026 Forms W-2?

Yes. FS-2026-13 Q10: "an employer must report the amount of qualified overtime compensation paid to an employee beginning in 2026, on Form W-2 in box 12, using code TT."

### What if the code TT amount was wrong?

FS-2026-13 Q11: the employer must file Form W-2c with SSA and furnish it to the employee as soon as possible, and may face information reporting penalties.

## Related

- [Qualified overtime calculator](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/qualified-overtime-calculator/)
- [How to audit last quarter's overtime](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/guides/audit-last-quarter/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/year-end-overtime-audit-2026/  
Data as of: 2026-11-08
