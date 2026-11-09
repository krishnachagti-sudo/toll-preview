# How to audit last quarter's overtime

To audit a quarter, export employee, date, hours (or in and out), state, rate and what payroll paid, recompute each employee-week under the daily, weekly and seventh-day rules, and compare; in the sample of 3 employee-weeks, 2 were short by $33.50 in total.

- Employee-weeks: 3
- Weeks short: 2
- Short in total: $33.50
- Code TT, all: $356.50

## The sample export

```csv
employee,date,state,in,out,break minutes,rate,paid regular hours,paid overtime hours,paid double time hours
Ana Ruiz,2026-11-01,CA,7:00,17:30,30,24.00,8,2,0
Ana Ruiz,2026-11-02,CA,7:00,20:30,30,24.00,8,5,0
Ana Ruiz,2026-11-03,CA,7:00,15:30,30,24.00,8,0,0
Ana Ruiz,2026-11-04,CA,7:00,15:30,30,24.00,8,0,0
Ana Ruiz,2026-11-05,CA,7:00,15:30,30,24.00,8,0,0
Ana Ruiz,2026-11-06,CA,7:00,15:30,30,24.00,0,8,0
Ana Ruiz,2026-11-07,CA,8:00,14:30,30,24.00,0,6,0
Ben Okafor,2026-11-02,CO,16:00,23:30,0,21.50,7.5,0,0
Ben Okafor,2026-11-03,CO,0:00,6:30,0,21.50,6.5,0,0
Ben Okafor,2026-11-04,CO,8:00,16:30,30,21.50,8,0,0
Ben Okafor,2026-11-05,CO,8:00,16:30,30,21.50,8,0,0
Ben Okafor,2026-11-06,CO,8:00,16:30,30,21.50,8,0,0
Cara Bell,2026-11-01,KY,8:00,13:00,0,19.00,5,0,0
Cara Bell,2026-11-02,KY,8:00,16:30,30,19.00,8,0,0
Cara Bell,2026-11-03,KY,8:00,16:30,30,19.00,8,0,0
Cara Bell,2026-11-04,KY,8:00,16:30,30,19.00,8,0,0
Cara Bell,2026-11-05,KY,8:00,16:30,30,19.00,8,0,0
Cara Bell,2026-11-06,KY,8:00,16:30,30,19.00,3,5,0
Cara Bell,2026-11-07,KY,8:00,14:00,0,19.00,0,6,0
```

## What the audit found

One row per employee-week, from the auditor.

| Employee | State | Hours | Overtime | Double | Owed | Short | Finding |
| --- | --- | ---: | ---: | ---: | ---: | ---: | --- |
| Ana Ruiz | CA | 61.00 | 20.00 | 1.00 | $1,728.00 | $12.00 | 1.00 double-time hours owed but not paid as double time. |
| Ben Okafor | CO | 38.00 | 2.00 | 0.00 | $838.50 | $21.50 | 2.00 overtime hours owed but not paid as overtime. |
| Cara Bell | KY | 51.00 | 11.00 | 0.00 | $1,073.50 | $0.00 | Paid as owed |

Per employee, with qualified overtime for W-2 code TT.

| Employee | Weeks short | Short | Code TT 2026 |
| --- | ---: | ---: | ---: |
| Ana Ruiz | 1 | $12.00 | $252.00 |
| Ben Okafor | 1 | $21.50 | $0.00 |
| Cara Bell | 0 | $0.00 | $104.50 |

## Records to keep

- Alaska: "An employer shall keep for a period of at least three years all payroll information and records for each employee" (DOLWD summary, revised January 2026).
- Colorado: give employees pay statements and keep them 3 years (COMPS Order poster, effective January 1, 2026).
- Federal record-keeping periods are on [the hours calculator's timesheet page](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/printable-timesheet/).

## When to bring in counsel

When the audit finds a pattern rather than a slip, when exemptions, an alternative workweek election or a union agreement are in question, or when a claim has been filed. The auditor recomputes hours and pay from the file; it does not decide those questions.

Run your own file through [the auditor](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/): the totals are free, the per-week detail is $0.10 an employee-week.

> Worked out by the auditor from the hours shown and the rules quoted with the date read. It assumes a non-exempt employee covered by the rule shown; a wage order, contract or policy may require more. Not legal, tax or payroll advice.

## Sources

- [29 CFR 778.104, Each workweek stands alone (eCFR, read November 8, 2026)](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-B/section-778.104)
- [29 CFR 778.105, Determining the workweek (eCFR, read November 8, 2026)](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-B/section-778.105)
- [29 CFR 778.109, The regular rate is an hourly rate (eCFR, read November 8, 2026)](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.109)
- [California Labor Code section 510 (read November 8, 2026 from the Legislature's data download)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=510)
- [Colorado COMPS Order #40, 7 CCR 1103-1, effective February 1, 2026 (Secretary of State, read November 8, 2026)](https://www.sos.state.co.us/CCR/DisplayRule.do?action=ruleinfo&ruleId=2509)
- [Alaska DOLWD, Summary of Alaska Wage and Hour Act, revised January 2026 (read November 8, 2026)](https://labor.alaska.gov/lss/forms/Summary_of_Alaska_Wage_and_Hour_Act-01-2025.pdf)
- [CDLE COMPS Order poster, effective January 1, 2026 (read November 8, 2026)](https://cdle.colorado.gov/sites/cdle/files/2026_comps_order_poster_english_%5Baccessible%5D.pdf)
- [Kentucky KRS 337.050 (read November 8, 2026)](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=32049)
- [IRS FS-2026-13, questions and answers on qualified overtime compensation, August 2026 (read November 8, 2026)](https://www.irs.gov/pub/taxpros/fs-2026-13.pdf)

## Steps

1. **Export the time records.** One row per shift or day: employee, date, state worked, hours or in and out times, unpaid break, hourly rate, and any bonus or shift pay.
2. **Export what was paid.** Per row or per day: paid regular, overtime and double-time hours, or the gross paid.
3. **Fix the workweek.** Use the employer's fixed workweek start; each workweek stands alone (29 CFR 778.104, 778.105).
4. **Recompute each employee-week.** Daily rules for the state of each day, the seventh day, then weekly overtime on the straight hours left over 40, at the week's regular rate.
5. **Compare and list the gaps.** Owed minus paid per week; flag missing daily overtime, double time paid as overtime, a missed seventh day and a rate without the bonus.
6. **Keep the records.** Keep the export, the results and the corrections with the payroll records.

## Questions

### What columns does an overtime audit need?

Employee, date, state, and hours or in and out times; for money, the hourly rate and any bonus or shift pay; for the comparison, the paid regular, overtime and double-time hours or the paid amount.

### What does an audit usually find?

Daily overtime paid only on weekly hours, double time paid as time and a half, a seventh day missed, and overtime at the base rate without the bonus. In the sample: Ana Ruiz, 1.00 double-time hours owed but not paid as double time.; Ben Okafor, 2.00 overtime hours owed but not paid as overtime.

## Related

- [Run the auditor](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/)
- [Overtime formulas in Excel](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/overtime-calculator-excel/)
- [Biweekly pay periods and workweeks](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/biweekly-timesheet-overtime/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/guides/audit-last-quarter/  
Data as of: 2026-11-08
