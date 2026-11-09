# California overtime formulas in Excel

Daily bucket formulas: regular = MIN(hours,8), overtime = MIN(MAX(hours-8,0),4), double = MAX(hours-12,0); the weekly 40-hour and seventh-day rules then move hours between buckets, which is where most sheets go wrong: in the 64.00-hour week below the daily formulas give 9.00 overtime hours and the full rules 23.00.

- Daily formulas: overtime: 9.00
- Full rules: overtime: 23.00
- Full rules: double: 1.00

## The formulas

Put each day on its own row, with the hours worked (decimal, after unpaid breaks) in column B, rows 2 to 8 for one workweek.

```text
C2  regular        =MIN(B2,8)
D2  overtime       =MIN(MAX(B2-8,0),4)
E2  double time    =MAX(B2-12,0)

Weekly overtime on straight time over 40 (one workweek in rows 2 to 8):
F9  =MAX(SUM(C2:C8)-40,0)

Seventh day (all seven rows have hours): replace row 8 with
C8  0
D8  =MIN(B8,8)
E8  =MAX(B8-8,0)
and recompute F9 after the change.
```

Weekly overtime then has to come out of the latest days' regular column, and a workweek that does not start on the sheet's first row breaks every SUM. That is the work the auditor does for each employee and week in a file.

## The formulas against the auditor

The 64-hour California week. Columns C to E are the daily formulas; the last three are the auditor with weekly and seventh-day rules.

| Day | Hours | =MIN regular | =MIN/MAX OT | =MAX double | Regular | Overtime | Double |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Sun (row 2) | 10.00 | 8.00 | 2.00 | 0.00 | 8.00 | 2.00 | 0.00 |
| Mon (row 3) | 10.00 | 8.00 | 2.00 | 0.00 | 8.00 | 2.00 | 0.00 |
| Tue (row 4) | 13.00 | 8.00 | 4.00 | 1.00 | 8.00 | 4.00 | 1.00 |
| Wed (row 5) | 8.00 | 8.00 | 0.00 | 0.00 | 8.00 | 0.00 | 0.00 |
| Thu (row 6) | 8.00 | 8.00 | 0.00 | 0.00 | 8.00 | 0.00 | 0.00 |
| Fri (row 7) | 9.00 | 8.00 | 1.00 | 0.00 | 0.00 | 9.00 | 0.00 |
| Sat (row 8) | 6.00 | 6.00 | 0.00 | 0.00 | 0.00 | 6.00 | 0.00 |

Download the sample timesheet CSV on [the auditor](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/) and use its columns (employee, date, state, hours or in and out, rate, paid hours) as your sheet's header: the same file then runs through the audit unchanged.

> Worked out by the auditor from the hours shown and the rules quoted with the date read. It assumes a non-exempt employee covered by the rule shown; a wage order, contract or policy may require more. Not legal, tax or payroll advice.

## Sources

- [California Labor Code section 510 (read November 8, 2026 from the Legislature's data download)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=510)
- [29 CFR 778.101, Maximum nonovertime hours (eCFR, read November 8, 2026)](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-B/section-778.101)

## Questions

### What is the Excel formula for California daily overtime?

With the day's hours in B2: regular =MIN(B2,8), overtime =MIN(MAX(B2-8,0),4), double time =MAX(B2-12,0).

### Why do the daily formulas get the week wrong?

They miss weekly overtime and the seventh day. In the worked week the daily formulas give 9.00 overtime hours; the full rules give 23.00, because the hours over 40 and the seventh day move 14.00 hours out of regular time.

## Related

- [California overtime calculator](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/california-overtime-calculator/)
- [Excel time formulas or a time card calculator](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/vs-excel-time-formulas/)
- [How to audit last quarter's overtime](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/guides/audit-last-quarter/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/overtime-calculator-excel/  
Data as of: 2026-11-08
