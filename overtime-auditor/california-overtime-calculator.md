# California overtime calculator

For Sun 10, Mon 10, Tue 13, Wed 8, Thu 8, Fri 9 and Sat 6 hours at $22/hour in California you owe 40.00 regular, 23.00 overtime (1.5x) and 1.00 double-time (2x) hours: $1,683.00.

- Regular: 40.00
- Overtime (1.5x): 23.00
- Double time (2x): 1.00
- Gross at $22: $1,683.00

## Work out your week

[Work out the week](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/?state=CA&start=2026-11-01&d0=10&d1=10&d2=13&d3=8&d4=8&d5=9&d6=6&rate=22)

## The week, hour by hour

Workweek Sunday, November 1 to Saturday, November 7, 2026, worked all seven days at $22.00.

| Day | Hours | Regular | Overtime | Double time | Rule |
| --- | ---: | ---: | ---: | ---: | --- |
| Sun, November 1 | 10.00 | 8.00 | 2.00 | 0.00 | 2.00: California Labor Code 510(a): over 8 hours in a workday at 1.5x |
| Mon, November 2 | 10.00 | 8.00 | 2.00 | 0.00 | 2.00: California Labor Code 510(a): over 8 hours in a workday at 1.5x |
| Tue, November 3 | 13.00 | 8.00 | 4.00 | 1.00 | 4.00: California Labor Code 510(a): over 8 hours in a workday at 1.5x; 1.00: California Labor Code 510(a): over 12 hours in a workday at 2x |
| Wed, November 4 | 8.00 | 8.00 | 0.00 | 0.00 |  |
| Thu, November 5 | 8.00 | 8.00 | 0.00 | 0.00 |  |
| Fri, November 6 | 9.00 | 0.00 | 9.00 | 0.00 | 1.00: California Labor Code 510(a): over 8 hours in a workday at 1.5x; 8.00: Over 40 hours in the workweek at 1.5x (29 CFR 778.101; the state's weekly rule where it has one) |
| Sat, November 7 | 6.00 | 0.00 | 6.00 | 0.00 | 6.00: California Labor Code 510(a): first 8 hours on the seventh day of work in the workweek at 1.5x |

Pay: 64 hours at $22.00 is $1,408.00; the premium is half the rate on 23.00 overtime hours and the full rate on 1.00 double-time hour, $275.00; total $1,683.00.

## One day at $20 an hour

An ordinary workday (not a seventh day), at $20.00 an hour.

| Hours worked | Regular | Overtime | Double time | Pay |
| ---: | ---: | ---: | ---: | ---: |
| 6.00 | 6.00 | 0.00 | 0.00 | $120.00 |
| 8.00 | 8.00 | 0.00 | 0.00 | $160.00 |
| 9.00 | 8.00 | 1.00 | 0.00 | $190.00 |
| 10.00 | 8.00 | 2.00 | 0.00 | $220.00 |
| 11.00 | 8.00 | 3.00 | 0.00 | $250.00 |
| 12.00 | 8.00 | 4.00 | 0.00 | $280.00 |
| 13.00 | 8.00 | 4.00 | 1.00 | $320.00 |
| 14.00 | 8.00 | 4.00 | 2.00 | $360.00 |
| 16.00 | 8.00 | 4.00 | 4.00 | $440.00 |

## The rule

Labor Code 510(a): "Eight hours of labor constitutes a day’s work. Any work in excess of eight hours in one workday and any work in excess of 40 hours in any one workweek and the first eight hours worked on the seventh day of work in any one workweek shall be compensated at the rate of no less than one and one-half times the regular rate of pay for an employee. Any work in excess of 12 hours in one day shall be compensated at the rate of no less than twice the regular rate of pay for an employee. In addition, any work in excess of eight hours on any seventh day of a workweek shall be compensated at the rate of no less than twice the regular rate of pay of an employee. Nothing in this section requires an employer to combine more than one rate of overtime compensation in order to calculate the amount to be paid to an employee for any hour of overtime work."

Checking a quarter for many employees? [The auditor reads the timesheet export](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/) and lists every week paid short.

> Worked out by the auditor from the hours shown and the rules quoted with the date read. It assumes a non-exempt employee covered by the rule shown; a wage order, contract or policy may require more. Not legal, tax or payroll advice.

## Sources

- [California Labor Code section 510 (read November 8, 2026 from the Legislature's data download)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=510)
- [California Labor Code section 500 (read November 8, 2026)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=500)
- [29 CFR 778.104, Each workweek stands alone (eCFR, read November 8, 2026)](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-B/section-778.104)

## Steps

1. **Fix the workweek.** Use the employer's workweek: seven consecutive days starting the same calendar day each week (Labor Code 500(b)).
2. **Split each day.** Up to 8 hours regular; over 8 up to 12 at 1.5x; over 12 at 2x.
3. **Check the seventh day.** If all seven days of the workweek were worked, the seventh day's first 8 hours are 1.5x and the rest 2x.
4. **Add weekly overtime.** Straight-time hours left over 40 in the workweek are 1.5x. An hour already paid as daily overtime is not counted again.
5. **Price it.** Pay every hour at the regular rate, plus half the rate for each overtime hour and the full rate again for each double-time hour.

## Questions

### When does overtime start in California?

After 8 hours in a workday, after 40 hours in the workweek, and from the first hour on the seventh day of work in the workweek (the first 8 hours that day), all at 1.5 times the regular rate (Labor Code 510(a)).

### Are daily overtime hours counted again toward the 40?

No. In this example the week is 64.00 hours: daily, double-time and seventh-day hours are taken out first, and only the 40.00 plus 8 straight hours left are tested against 40. Labor Code 510(a): "Nothing in this section requires an employer to combine more than one rate of overtime compensation in order to calculate the amount to be paid to an employee for any hour of overtime work."

### Does California average overtime over two weeks?

No. The workweek is a fixed period of seven consecutive days (Labor Code 500(b)), and each workweek is counted alone (29 CFR 778.104).

## Related

- [California double time](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/california-double-time/)
- [The seventh-day rule](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/california-7th-day-overtime/)
- [Alternative workweek (4/10)](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/california-alternative-workweek/)
- [Overtime formulas in Excel](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/overtime-calculator-excel/)
- [Time card calculator for punches](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/california-overtime-calculator/  
Data as of: 2026-11-08
