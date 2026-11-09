# How the overtime auditor works: FLSA and state rules

Each employee's hours are put in fixed 7-day workweeks. The daily and seventh-day rules of California, Alaska, Colorado and Kentucky go first, then the straight-time hours left over 40 in the week are overtime at 1.5x (29 CFR 778.101), so no hour is paid twice. Every other state gets the federal weekly rule only. The rules were read on 2026-11-08.

## What does the overtime auditor for timesheet csvs compute?

Given a timesheet CSV (employees, dates, hours or in and out times, state, rate and what payroll paid), the tool works out for every employee-week the regular, overtime and double-time hours owed, the rule behind each hour, the FLSA regular rate and the pay owed, the shortfall against what was paid, and the FLSA-only overtime premium that goes on Form W-2 in box 12 with code TT. It applies the federal weekly rule everywhere and the state rules of California, Alaska, Colorado and Kentucky.

Operations (the op field):

- `audit`: Audits the whole file and returns every employee-week with its days and the rule behind each overtime hour, the regular rate, owed, paid and shortfall, per-employee totals with code TT by year, flags, the results CSV and the sources used. Priced per employee-week with hours: $0.10 up to 500 in a month, $0.05 up to 5,000 in a month, $0.02 after that, at least 5.
- `preview`: Reads the same file and returns only the answer and the totals (hours, overtime, double time, weeks underpaid, shortfall, owed and code TT), with the columns used. Free.
- `check`: Checks one employee's days (up to 14) in one state, typed as hours or punches, and returns the hours by rule, the pay owed at a given rate and code TT. Free on the tool page; $0.00 a call over the API or MCP.
- `rules`: Returns the state table (what is applied in each of the 50 states and DC, with the source and the date read) and the federal and code TT sources. Free.

Inputs:

- `csv`: The timesheet export, at most 3 MB and 20,000 rows: employee, date, and hours or in and out, with state, break minutes, rate, extra pay, paid regular, overtime and double-time hours, paid amount, aws day hours, aws days and exempt as optional columns.
- `workweekStart`: The day the fixed workweek starts (default sunday).
- `defaultState`: The state for a file with no state column.
- `alaskaSmallEmployer`: true when an Alaska employer is too small for the daily rule.
- `timeZone`: A name such as America/Los\_Angeles, so a night shift across a clock change counts its real hours.
- `state, days, rate, extraPay, aws`: For check: the state, up to 14 days of { date, hours } or { date, punches, breakMinutes }, the hourly rate, extra pay for the week, and a California alternative workweek (day hours over 8 up to 10, and the scheduled days).

Outputs:

- answer: employee-weeks, overtime and double-time hours, weeks underpaid and by how much, and California seventh-day weeks
- summary: employees, employee-weeks, rows, hours worked, regular, overtime, double time, weeks checked and underpaid, shortfall, owed, code TT, states not covered and employees skipped as exempt
- weeks: per employee-week, the days with the rule for each hour, the regular rate, owed, premium, paid, shortfall and its basis, code TT and flags
- employees, flags, columnsUsed, columnsIgnored, csv and rules (audit)

## How is it calculated, step by step?

1. The CSV's separator is the one of comma, semicolon or tab that splits the heading line most; quotes and a byte order mark are handled, and headings are matched by their export names (Employee name, Clock in, Hourly rate, Paid OT hours and so on). Dates are written 2026-11-02 or 11/2/2026, and hours as 8.5 or 8:30. Every refusal names its line.
2. Each employee's rows are made into days. In and out times go through the hours calculator's engine: an overnight shift belongs to the day it starts, up to 6 pairs a day, the unpaid break comes off the first pair, and with a time zone a clock change is counted. A day in two states, or mixing hours and punches, is refused. Days are put in fixed 7-day workweeks from workweekStart (29 CFR 778.105).
3. California (Labor Code 510(a)): over 8 hours in a workday at 1.5x and over 12 at 2x. When all seven days of the workweek are worked, the seventh day's first 8 hours are at 1.5x and the rest at 2x. Under an alternative workweek (Labor Code 511(b)), hours over the scheduled day up to 12 are at 1.5x and over 12 at 2x, and on a day past the scheduled workdays the first 8 hours are at 1.5x and the rest at 2x.
4. Alaska (AS 23.10.060(b)): over 8 hours a day at 1.5x, unless alaskaSmallEmployer is set. Colorado (COMPS Order #40 Rule 4): over 12 hours in a workday, or over 12 consecutive hours, at 1.5x, whichever is more; punch pairs with a gap of at most 60 minutes are one run, even across midnight. Kentucky (KRS 337.050): all time on the seventh day of the workweek at 1.5x, only in a week over 40 hours.
5. Weekly overtime is the straight-time hours left over 40, taken from the week's latest days, so daily, seventh-day and weekly overtime are never paid on the same hour. For Colorado this equals the greatest of its three counts, and for Kentucky the greater of weekly overtime and the seventh day.
6. The regular rate (29 CFR 778.109 and 778.115) is all straight-time pay in the week (every rate times its hours, plus extra pay such as a bonus or shift pay) divided by all hours worked. Owed is straight-time pay plus half the regular rate for each overtime hour and the full rate for each double-time hour, rounded once per week to the cent.
7. The shortfall is owed minus the paid amount when the file has one; otherwise it is the premium owed minus the premium paid, both at the week's regular rate, from the paid overtime and double-time hours (assuming every hour was paid at least straight time). A week with a shortfall over zero is underpaid.
8. Code TT is half the regular rate times the FLSA overtime hours only (over 40 in the workweek), per IRS FS-2026-13: California's daily and double-time premium is left out. A workweek that spans two years is counted in the year it ends.

**What is assumed.**

Every row is taken to be a non-exempt employee covered by the FLSA and by the state rule shown. The tool does not decide exemptions, wage orders, union agreements, or whether an alternative workweek was validly adopted. Rows marked exempt are skipped and listed.

**States not read.**

Every other state and DC: the state's own overtime law was not read for this tool, so rows there get the federal weekly rule only (over 40 hours in the workweek at 1.5 times the regular rate).

Nevada has a daily overtime rule in NRS 608.018, but the Legislature's site (leg.state.nv.us, HTTP 403) and the Labor Commissioner's site (labor.nv.gov, request rejected) refused this network on 2026-11-08. It is not applied; Nevada rows get the federal weekly rule only.

## Which edge cases does it handle?

- A California week of 10, 10, 13, 8, 8, 9 and 6 hours worked all seven days: 40 regular, 23 overtime and 1 double time.
- A California seventh day counts only when all seven days of one workweek are worked, not seven days in a row across two weeks.
- Colorado: 7.5 hours to 11:30 pm and 6.5 hours from midnight are one 14-hour run, so 2 hours are overtime; a gap over an hour starts a new run.
- Kentucky: a seventh day in a week of 34 hours earns no overtime.
- A file that starts or ends inside a workweek is flagged: days outside it count as not worked.
- A week with no rate on some row gives hours only, with no money, and is flagged.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A California week worked all seven days at $22: daily, weekly, double time and the seventh day**

```json
{
  "op": "check",
  "state": "CA",
  "rate": "22",
  "days": [
    {
      "date": "2026-11-01",
      "hours": 10
    },
    {
      "date": "2026-11-02",
      "hours": 10
    },
    {
      "date": "2026-11-03",
      "hours": 13
    },
    {
      "date": "2026-11-04",
      "hours": 8
    },
    {
      "date": "2026-11-05",
      "hours": 8
    },
    {
      "date": "2026-11-06",
      "hours": 9
    },
    {
      "date": "2026-11-07",
      "hours": 6
    }
  ]
}
```

A California week worked all seven days at $22: daily, weekly, double time and the seventh day

| Result | Value |
| --- | --- |
| answer | For Sun 10.00, Mon 10.00, Tue 13.00, Wed 8.00, Thu 8.00, Fri 9.00, Sat 6.00 at $22.00/hour in California the hours are 40.00 regular, 23.00 overtime (1.5x) and 1.00 double time (2x): $1,683.00. |
| Sunday 2026-11-01 | 2.00 overtime (ca-daily) |
| Monday 2026-11-02 | 2.00 overtime (ca-daily) |
| Tuesday 2026-11-03 | 4.00 overtime (ca-daily), 1.00 double time (ca-double) |
| Friday 2026-11-06 | 1.00 overtime (ca-daily), 8.00 overtime (weekly) |
| Saturday 2026-11-07 | 6.00 overtime (ca-7th) |
| FLSA overtime hours | 24.00 |
| code TT | $264.00 |

**A timesheet export for three employees in California, Colorado and Kentucky, against what payroll paid**

```json
op: "audit"
csv: "employee,date,state,in,out,break minutes,rate,paid regular hours,paid overtime hours,paid double time hours\r\nAna Ruiz,2026-11-01,CA,7:00,17:30,30,24.00,8,2,0\r\nAna Ruiz,2026-11-02,CA,7:00,20:30,30,24.00,8,5,0\r\nAna Ruiz,2026-11-03,CA,7:00,15:30,30,24.00,8,0,0\r\nAna Ruiz,2026-11-04,CA,7:00,15:30,30,24.00,8,0,0\r\nAna Ruiz,2026-11-05,CA,7:00,15:30,30,24.00,8,0,0\r\nAna Ruiz,2026-11-06,CA,7:00,15:30,30,24.00,0,8,0\r\nAna Ruiz,2026-11-07,CA,8:00,14:30,30,24.00,0,6,0\r\nBen Okafor,2026-11-02,CO,16:00,23:30,0,21.50,7.5,0,0\r\nBen Okafor,2026-11-03,CO,0:00,6:30,0,21.50,6.5,0,0\r\nBen Okafor,2026-11-04,CO,8:00,16:30,30,21.50,8,0,0\r\nBen Okafor,2026-11-05,CO,8:00,16:30,30,21.50,8,0,0\r\nBen Okafor,2026-11-06,CO,8:00,16:30,30,21.50,8,0,0\r\nCara Bell,2026-11-01,KY,8:00,13:00,0,19.00,5,0,0\r\nCara Bell,2026-11-02,KY,8:00,16:30,30,19.00,8,0,0\r\nCara Bell,2026-11-03,KY,8:00,16:30,30,19.00,8,0,0\r\nCara Bell,2026-11-04,KY,8:00,16:30,30,19.00,8,0,0\r\nCara Bell,2026-11-05,KY,8:00,16:30,30,19.00,8,0,0\r\nCara Bell,2026-11-06,KY,8:00,16:30,30,19.00,3,5,0\r\nCara Bell,2026-11-07,KY,8:00,14:00,0,19.00,0,6,0\r\n"
workweekStart: "sunday"
```

A timesheet export for three employees in California, Colorado and Kentucky, against what payroll paid

| Result | Value |
| --- | --- |
| answer | Across 3 employee-weeks (3 employees) the rules give 33.00 overtime and 1.00 double-time hours; 2 weeks were underpaid, by $33.50 in total; 1 was a California seventh-day week. |
| owed | $3,640.00 |
| Ana Ruiz | 20.00 overtime, 1.00 double time, shortfall $12.00 |
| Ben Okafor | 2.00 overtime, 0.00 double time, shortfall $21.50 |
| Cara Bell | 11.00 overtime, 0.00 double time, shortfall $0.00 |
| code TT | $356.50 |

## What does it not do?

- It applies state law only for California, Alaska, Colorado and Kentucky; every other state, Nevada included, gets the federal weekly rule only.
- It refuses files over 3 MB, 20,000 rows or 10,000 employee-weeks.
- It does not count pay that is not in the file, or California's own regular-rate and meal or rest premium rules.
- Timesheets are used to make the result and are not kept. It is not legal, tax or payroll advice.

## Where does the data come from, and how fresh is it?

Every rule is quoted from its official text, read on 2026-11-08: 29 CFR 778 on eCFR, IRS FS-2026-13, California Labor Code 510 and 511, Alaska AS 23.10.060, Colorado COMPS Order #40 and Kentucky KRS 337.050 and 337.285. They change only by hand, with the tests that pin them.

- [29 CFR 778.101 Maximum nonovertime hours](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-B/section-778.101)
- [29 CFR 778.109 The regular rate is an hourly rate](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.109)
- [29 CFR 778.115 Employees working at two or more rates](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.115)
- [IRS Fact Sheet FS-2026-13, Updates to questions and answers about the new deduction for qualified overtime compensation (August 2026)](https://www.irs.gov/pub/taxpros/fs-2026-13.pdf)
- [California Labor Code section 510(a)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=510)
- [Alaska Statutes AS 23.10.060(b), as printed in Alaska DOLWD Wage and Hour Pamphlet 100 (October 2025)](https://labor.alaska.gov/lss/forms/pam100.pdf)
- [Colorado Overtime and Minimum Pay Standards Order (COMPS Order) #40, 7 CCR 1103-1, Rule 4 (effective February 1, 2026)](https://www.sos.state.co.us/CCR/DisplayRule.do?action=ruleinfo&ruleId=2509)
- [Kentucky Revised Statutes 337.050](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=32049)

Every rule is quoted from its official text, read on 2026-11-08: 29 CFR 778 on eCFR, IRS FS-2026-13, California Labor Code 510 and 511, Alaska AS 23.10.060, Colorado COMPS Order #40 and Kentucky KRS 337.050 and 337.285. They change only by hand, with the tests that pin them.

Overtime auditor for timesheet CSVs: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [29 CFR 778.101 Maximum nonovertime hours](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-B/section-778.101) | see the document | 2026-11-08 |
| [29 CFR 778.104 Each workweek stands alone](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-B/section-778.104) | see the document | 2026-11-08 |
| [29 CFR 778.105 Determining the workweek](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-B/section-778.105) | see the document | 2026-11-08 |
| [29 CFR 778.109 The regular rate is an hourly rate](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.109) | see the document | 2026-11-08 |
| [29 CFR 778.110 Hourly rate employee](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.110) | see the document | 2026-11-08 |
| [29 CFR 778.115 Employees working at two or more rates](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-C/section-778.115) | see the document | 2026-11-08 |
| [29 CFR 778.5 Relation to other laws generally](https://www.ecfr.gov/current/title-29/subtitle-B/chapter-V/subchapter-B/part-778/subpart-A/section-778.5) | see the document | 2026-11-08 |
| [IRS Fact Sheet FS-2026-13, Updates to questions and answers about the new deduction for qualified overtime compensation (August 2026)](https://www.irs.gov/pub/taxpros/fs-2026-13.pdf) | see the document | 2026-11-08 |
| [IRS: One Big Beautiful Bill Act: tax deductions for working Americans and seniors](https://www.irs.gov/newsroom/one-big-beautiful-bill-act-tax-deductions-for-working-americans-and-seniors) | see the document | 2026-11-08 |
| [California Labor Code section 510(a)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=510) | see the document | 2026-11-08 |
| [California Labor Code section 511(a)-(b)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=511) | see the document | 2026-11-08 |
| [California Labor Code section 500(a)-(c)](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=500) | see the document | 2026-11-08 |
| [California Labor Code section 552](https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=LAB&sectionNum=552) | see the document | 2026-11-08 |
| [Alaska Statutes AS 23.10.060(b), as printed in Alaska DOLWD Wage and Hour Pamphlet 100 (October 2025)](https://labor.alaska.gov/lss/forms/pam100.pdf) | see the document | 2026-11-08 |
| [Alaska DOLWD, Summary of Alaska Wage and Hour Act (revised January 2026)](https://labor.alaska.gov/lss/forms/Summary_of_Alaska_Wage_and_Hour_Act-01-2025.pdf) | see the document | 2026-11-08 |
| [Colorado Overtime and Minimum Pay Standards Order (COMPS Order) #40, 7 CCR 1103-1, Rule 4 (effective February 1, 2026)](https://www.sos.state.co.us/CCR/DisplayRule.do?action=ruleinfo&ruleId=2509) | see the document | 2026-11-08 |
| [CDLE COMPS Order Poster and Notice, effective 1/1/2026](https://cdle.colorado.gov/sites/cdle/files/2026_comps_order_poster_english_%5Baccessible%5D.pdf) | see the document | 2026-11-08 |
| [Kentucky Revised Statutes 337.050](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=32049) | see the document | 2026-11-08 |
| [Kentucky Revised Statutes 337.285(1)](https://apps.legislature.ky.gov/law/statutes/statute.aspx?id=54508) | see the document | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests check that every rule is quoted from its official text with the date read, that the punch arithmetic is the hours calculator's engine, California daily, double time, seventh day and alternative workweek, Alaska, Colorado's consecutive hours across midnight, Kentucky's seventh day, the federal rule elsewhere, 29 CFR 778.110(b)'s own regular-rate example, IRS FS-2026-13 Q16's code TT example, CSV reading and refusals, and the sample audit.

What its test suite asserts:

- Every rule is quoted from its official text, read 2026-11-08, and the punch arithmetic is the hours calculator's engine, imported read-only.
- California daily, double time, seventh day and alternative workweek, Alaska, Colorado's 12 consecutive hours across midnight, Kentucky's seventh day and the federal rule in every other state are checked.
- 29 CFR 778.110(b)'s own regular-rate example and IRS FS-2026-13 Q16's code TT example give their published figures, CSV refusals name the line, and the sample audit gives its totals.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Overtime auditor for timesheet CSVs tool](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/).

## Questions

### Is there any AI in the overtime auditor for timesheet csvs answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the overtime auditor for timesheet csvs refuse to answer?

It applies state law only for California, Alaska, Colorado and Kentucky; every other state, Nevada included, gets the federal weekly rule only. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Overtime auditor for timesheet CSVs tool](https://krishnachagti-sudo.github.io/toll-preview/overtime-auditor/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/overtime-auditor/  
Data as of: 2026-11-04
