# Overtime across state lines

Each day follows the overtime law of the state where the work was done, and weekly overtime counts the whole workweek: 10-hour days in California and Nevada plus an 8-hour day in Arizona are 48.00 hours with 8.00 overtime hours, 4 of them California daily overtime and 4 over 40.

- Hours: 48.00
- Overtime: 8.00
- Owed at $25: $1,300.00

## The week

Workweek starting Sunday, November 1, 2026, $25.00 an hour.

| Day | State | Hours | Regular | Overtime | Rule |
| --- | --- | ---: | ---: | ---: | --- |
| Mon, November 2 | CA | 10.00 | 8.00 | 2.00 | 2.00: California Labor Code 510(a): over 8 hours in a workday at 1.5x |
| Tue, November 3 | CA | 10.00 | 8.00 | 2.00 | 2.00: California Labor Code 510(a): over 8 hours in a workday at 1.5x |
| Wed, November 4 | NV | 10.00 | 10.00 | 0.00 |  |
| Thu, November 5 | NV | 10.00 | 10.00 | 0.00 |  |
| Fri, November 6 | AZ | 8.00 | 4.00 | 4.00 | 4.00: Over 40 hours in the workweek at 1.5x (29 CFR 778.101; the state's weekly rule where it has one) |

- Nevada, Arizona: state law not read for this tool; the federal weekly rule only.
- Worked in more than one state this week: each day follows its own state's daily rule, and weekly overtime counts the whole week.
- The file starts and ends inside this workweek; days outside the file are counted as not worked.

## How it is worked

- Put the state where the work was done on every row.
- Daily rules first, day by day, under that day's state: California 8 and 12, Alaska 8, Colorado 12 and 12 consecutive.
- Weekly overtime on the straight hours left over 40 in the whole workweek, so no hour is paid twice.
- One regular rate for the week: all straight-time pay over all hours (29 CFR 778.115).

```csv
employee,date,state,hours,rate
Dee Park,2026-11-02,CA,10,25
Dee Park,2026-11-03,CA,10,25
Dee Park,2026-11-04,NV,10,25
Dee Park,2026-11-05,NV,10,25
Dee Park,2026-11-06,AZ,8,25
```

> Worked out by the auditor from the hours shown and the rules quoted with the date read. It assumes a non-exempt employee covered by the rule shown; a wage order, contract or policy may require more. Not legal, tax or payroll advice.

## Sources

- [California Labor Code section 510 (read November 8, 2026 from the Legislature's data download)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=510)
- [29 CFR 778.101, Maximum nonovertime hours (eCFR, read November 8, 2026)](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-B/section-778.101)
- [29 CFR 778.115, Employees working at two or more rates (eCFR, read November 8, 2026)](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.115)
- [Alaska AS 23.10.060, in Alaska DOLWD Wage and Hour Pamphlet 100, October 2025 (read November 8, 2026)](https://labor.alaska.gov/lss/forms/pam100.pdf)
- [Colorado COMPS Order #40, 7 CCR 1103-1, effective February 1, 2026 (Secretary of State, read November 8, 2026)](https://www.sos.state.co.us/CCR/DisplayRule.do?action=ruleinfo&ruleId=2509)

## Questions

### Which state's overtime rules apply?

The auditor applies each day's rule from the state in that row (where the work was done) and counts weekly overtime on the whole workweek, federal law's 40 hours included. It does not decide which state's law governs a particular employee; that is a legal question.

### What happens to a state the auditor has not read?

Its days get the federal weekly rule only, and the week is flagged. Nevada has a daily overtime rule in NRS 608.018, but the Legislature's site (leg.state.nv.us, HTTP 403) and the Labor Commissioner's site (labor.nv.gov, request rejected) refused this network on 2026-11-08. It is not applied; Nevada rows get the federal weekly rule only.

## Related

- [Which states have daily overtime](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/daily-overtime-states/)
- [Run the auditor](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/guides/multi-state/  
Data as of: 2026-11-08
