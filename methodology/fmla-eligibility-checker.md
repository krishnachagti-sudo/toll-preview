# How FMLA eligibility is checked: 29 CFR 825 method

An employee is eligible when the employer is covered and, as of the day leave starts, has employed them for 12 months, they worked 1,250 hours in the 12 months before, and 50 employees work within 75 surface miles of their worksite (29 CFR 825.110). The eligibility notice is due within 5 business days.

## What does the fmla eligibility checker compute?

The tool takes the facts an employer has about one employee and one leave: the dates employed, the hours worked, the headcount near the worksite and the employer. It runs the three eligibility tests of 29 CFR 825.110 and the employer coverage test, gives the reason the eligibility notice must state when an employee is not eligible, and the day that notice is due. It also turns 12 or 26 workweeks into hours for a schedule, and keeps a leave balance under each of the four 12-month methods of 825.200(b), with the days leave comes back under the rolling method.

Operations (the op field):

- `check`: Runs the coverage test and the three eligibility tests for a leave start date. The answer has eligible (yes, no, or null when it cannot be found ineligible), each test with its figures, the reasons for the notice, the notice due date with the holidays and closed days skipped, and notes.
- `balance`: Works out the leave used and left on an as-of date under one method (rolling by default), the period it is measured in, the dates leave comes back or the full amount returns, and how much of each requested day is FMLA-protected. With compare, it also gives the balance under every method and marks the one that gives the employee the most.
- `hours`: Turns 12 workweeks, or 26 for military caregiver leave, into hours for the normal workweek given.
- `record`: Returns one employee's leave record: the balance, the comparison of methods, the ledger as CSV with one line per day of leave and, with a check, the fields of the eligibility notice (form WH-381, Part A).

Inputs:

- `leaveStart, noticeDate`: The day the leave starts, and the day the employee asked for it or the employer learned it may qualify (the leave start when not given). Dates are written like 2026-11-10.
- `hireDate or periods`: The hire date, or up to 20 employment periods with a start, an end (none while still employed) and, for a break before a period, breakBefore: userra or agreement. countOldService says the employer counts service before long breaks for everyone.
- `hours or hoursLog, userraHours, recordsKept, flightCrew`: The hours worked in the 12 months before the leave, or a log of up to 400 dated lines; hours credited for USERRA service; whether the employer kept an accurate record of hours; and whether the employee is airline flight crew. Hours take at most two decimals.
- `employeesWithin75 or sites, reportsTo, workLocation`: The count within 75 miles, or up to 200 sites with their employees, surface miles from the worksite and whether they are outside the United States; the site the employee reports to; and site, home or no-fixed-site.
- `employer`: type (private, public-agency or school) and workweeksWith50, the workweeks with 50 or more employees in the current or preceding calendar year.
- `closedDays`: Up to 60 dates the employer is closed, skipped when counting business days.
- `method, leaveYearStart, weeklyHours, weeks, used, requested, asOf`: For balance and record: rolling, calendar, fixed (with the first day of the leave year as MM-DD) or forward; the normal workweek in hours; 12 or 26 weeks; days of leave taken and days requested, each with its hours (at most 24 a day, at most 1,000 days in one call); and the as-of date.
- `employee, check`: For record: the employee's name or ID as it should show, and optionally the facts for a check.

Outputs:

- eligible and answer: the verdict in one sentence, with the months of service, the hours, the count near the worksite and the notice due date
- tests: coverage, service (months or weeks, breaks, the date the test is met), hours (the 12-month window, hours short) and worksite (the count, the worksite, each site counted or not)
- reasons: the sentences the eligibility notice must state when an employee is not eligible
- notice: the due date, the federal holidays and closed days skipped, and the sentence to act on
- balance: hours used and remaining, the period, restore dates or the reset date, and protected and unprotected hours per day
- record: the ledger CSV, the comparison of methods and the eligibility notice fields

## How is it calculated, step by step?

1. Coverage: a public agency or a school is covered at any size. A private employer is covered with 50 or more employees in undefined or more workweeks of the current or preceding calendar year (825.104, 825.105(e)); when the workweeks are not given, coverage is assumed and the answer says so.
2. 12 months (825.110(b)): one continuous job is measured in calendar months and passes on the 12-month anniversary of the hire date (a February 29 hire reaches it on February 28). Separate periods are added up in Sunday-to-Saturday weeks, where any part of a week on the payroll counts as a week, and 52 weeks equal 12 months. Service is counted to the day before the leave starts.
3. Breaks: service before a break of 7 years or more is dropped, unless the break was USERRA-covered service (which itself counts as employment), a written rehire agreement covers it, or the employer counts such service for everyone (825.110(b)(1), (2) and (4)).
4. 1,250 hours (825.110(c)): the hours are counted from the same date a year before the leave starts to the day before it. A log counts only the lines inside that window. USERRA hours are added. Short of 1,250 with no accurate record kept, the employee cannot be found ineligible, because the employer has the burden. Airline flight crew have their own rule, which is not worked out.
5. 50 within 75 miles (825.111): the employees of every site at 75 surface miles or less from the worksite are added, the worksite itself counting at 0 miles, and sites outside the United States are left out. A teleworker's worksite is the office they report to or get assignments from, never their home (825.111(a)(2) and FAB 2023-1).
6. The verdict is not eligible when any test fails, cannot be found ineligible when the hours are short but no record was kept or the employee is flight crew, and eligible otherwise. Each failed test gives the reason sentence the notice must state (825.300(b)(2)).
7. The notice is due 5 business days after the notice date (825.300(b)(1)). Business days are Monday to Friday less US federal holidays and the days the employer is closed. Part 825 does not define business days; this is the reading the tool states.
8. Hours of leave: the normal workweek times 12 weeks, or 26 for military caregiver leave (825.205(b)). Hours are kept as whole hundredths, never rounded floats.
9. Balance: the days of leave are taken in date order. Each day is protected up to the hours left in its 12-month period, and the rest of it is marked not protected. Under the rolling method a day counts until the same date a year later, when its hours come back; under the calendar, fixed and forward methods the full amount returns when the period ends. Military caregiver leave is always measured forward from its first day (825.200(f)).

**29 CFR Part 825.**

The thresholds are the regulation's: 12 months (52 weeks), 1,250 hours, 50 employees within 75 miles, a break of 7 years, coverage at 50 employees in 20 workweeks, 12 and 26 workweeks of leave, and a notice in 5 business days. The sections applied are quoted word for word in the tool's data file, from eCFR current to 2026-11-02.

**The four 12-month methods.**

825.200(b) lets an employer choose one of four methods: rolling 12 months measured backward, calendar year, fixed 12-month leave year, 12 months measured forward from the first leave. Under 825.200(e), an employer that chose none uses the one most beneficial to the employee, so the comparison marks the method that leaves the most hours, counting the protected requested hours.

**DOL Field Assistance Bulletin 2023-1.**

A teleworker's worksite for FMLA eligibility is the office they report to or get assignments from, and that office's count includes the teleworkers assigned to it. The bulletin is guidance to Wage and Hour Division staff, not a regulation.

## Which edge cases does it handle?

- A rehire after a break of seven years or more starts the 12 months again; exactly seven years counts as seven years or more, and a day less does not.
- Seasonal periods are added up in weeks, so a period that touches a Saturday and the next Sunday counts two weeks.
- When the 12-month test fails, the answer gives the first leave date on which it would be met if the employee stays employed.
- A site at exactly 75 miles is counted; one at 75.1 miles is not.
- A notice date before Veterans Day or Thanksgiving moves the due date past the holiday, and a closed day moves it again.
- The same day listed twice in a leave log is refused, so one day's hours sit on one line.
- Leave that runs across January 1 can be protected twice over under the calendar method and only once under the rolling method.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A teleworker who reports to headquarters: the 50 are counted around that office**

```json
{
  "op": "check",
  "leaveStart": "2026-12-01",
  "noticeDate": "2026-11-05",
  "hireDate": "2024-03-04",
  "hours": 1612,
  "workLocation": "home",
  "reportsTo": "Headquarters",
  "sites": [
    {
      "name": "Headquarters",
      "employees": 210
    },
    {
      "name": "Suburban office",
      "employees": 90,
      "miles": 28
    },
    {
      "name": "Regional office",
      "employees": 45,
      "miles": 140
    }
  ],
  "employer": {
    "type": "private",
    "workweeksWith50": 52
  }
}
```

A teleworker who reports to headquarters: the 50 are counted around that office

| Result | Value |
| --- | --- |
| eligible | yes |
| months of service | 32 |
| hours in the 12 months before leave | 1,612 |
| employees within 75 miles of the worksite | 300 |
| worksite | Headquarters |
| notice due | November 13, 2026 |
| holidays skipped | Veterans Day |

**A rehire after a break of more than seven years: the old service does not count**

```json
{
  "op": "check",
  "leaveStart": "2026-11-16",
  "noticeDate": "2026-11-09",
  "periods": [
    {
      "start": "2012-05-07",
      "end": "2018-08-31"
    },
    {
      "start": "2026-03-02"
    }
  ],
  "hours": 1104,
  "employeesWithin75": 140
}
```

A rehire after a break of more than seven years: the old service does not count

| Result | Value |
| --- | --- |
| eligible | no |
| service dropped before | March 2, 2026 |
| months of service | 8 |
| 12 months met on | March 2, 2027 |
| reason 1 | You have been employed by the employer for 8 months as of November 16, 2026, less than 12 months. |
| reason 2 | You have worked 1,104 hours of service with the employer in the 12 months before November 16, 2026 (November 16, 2025 to November 15, 2026), fewer than 1,250. |
| notice due | November 17, 2026 |

**Rolling 12 months: hours left, the day leave comes back, and two requested weeks**

```json
op: "balance"
method: "rolling"
weeklyHours: 40
asOf: "2026-11-10"
used: 50 items
requested: 10 items
compare: true
```

Rolling 12 months: hours left, the day leave comes back, and two requested weeks

| Result | Value |
| --- | --- |
| used | 392 of 480 hours |
| remaining | 88 hours (2.2 weeks) |
| period from | November 11, 2025 |
| first hours back | 8 on November 17, 2026 |
| Rolling 12 months measured backward | 88 hours left |
| Calendar year | 128 hours left (most beneficial) |
| 12 months measured forward from the first leave | 88 hours left |

**12 weeks of FMLA in hours on a 36-hour week**

```json
{
  "op": "hours",
  "weeklyHours": 36
}
```

12 weeks of FMLA in hours on a 36-hour week

| Result | Value |
| --- | --- |
| answer | 12 workweeks at 36 hours a week is 432 hours of FMLA leave (12 x 36). |

## What does it not do?

- It does not decide whether a reason for leave qualifies, or whether employers are joint or integrated employers.
- State family and medical leave laws are not covered: none was read on a state's own site.
- The airline flight crew hours rule of 825.801 is not worked out.
- The headcount, worksite, distances and hours are the facts entered; the tool cannot check them. It is not legal advice.

## Where does the data come from, and how fresh is it?

The rules were read on 2026-11-08: 29 CFR Part 825 on eCFR, current to 2026-11-02; DOL Fact Sheet #28, revised March 2025; and Field Assistance Bulletin 2023-1 of 2023-02-09. Federal holidays come from the business days tool's calendar. The rules change only by hand, with the tests that pin them.

- [29 CFR Part 825, The Family and Medical Leave Act of 1993 (eCFR)](https://www.ecfr.gov/current/title-29/part-825)
- [DOL Wage and Hour Division, Fact Sheet #28: The Family and Medical Leave Act](https://www.dol.gov/agencies/whd/fact-sheets/28-fmla)
- [DOL Wage and Hour Division, Field Assistance Bulletin No. 2023-1, Telework Under the Fair Labor Standards Act and Family and Medical Leave Act](https://www.dol.gov/sites/dolgov/files/WHD/fab/2023-1.pdf)
- [DOL: FMLA forms](https://www.dol.gov/agencies/whd/fmla/forms)

The rules were read on 2026-11-08: 29 CFR Part 825 on eCFR, current to 2026-11-02; DOL Fact Sheet #28, revised March 2025; and Field Assistance Bulletin 2023-1 of 2023-02-09. Federal holidays come from the business days tool's calendar. The rules change only by hand, with the tests that pin them.

FMLA eligibility checker: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [29 CFR Part 825, The Family and Medical Leave Act of 1993 (eCFR)](https://www.ecfr.gov/current/title-29/part-825) | eCFR current to 2026-11-02 | 2026-11-08 |
| [DOL Wage and Hour Division, Fact Sheet #28: The Family and Medical Leave Act](https://www.dol.gov/agencies/whd/fact-sheets/28-fmla) | revised March 2025 | 2026-11-08 |
| [DOL Wage and Hour Division, Field Assistance Bulletin No. 2023-1, Telework Under the Fair Labor Standards Act and Family and Medical Leave Act](https://www.dol.gov/sites/dolgov/files/WHD/fab/2023-1.pdf) | dated 2023-02-09 | 2026-11-08 |
| [DOL: FMLA forms](https://www.dol.gov/agencies/whd/fmla/forms) | see the document | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The thresholds and quoted sections are pinned to eCFR and dol.gov with their read date. Each test is checked at its boundary: the anniversary and the day before, 51 and 52 weeks, seven years and a day less, 1,250 hours and 1,249.75, 75 and 75.1 miles, 19 and 20 workweeks. The rolling balance reproduces the regulation's own example in 825.200(c).

What its test suite asserts:

- The thresholds (12 months or 52 weeks, 1,250 hours, 50 employees within 75 miles, 7 years, 20 workweeks, 5 business days) and the quoted sections of Part 825 are pinned to eCFR and dol.gov as read on 2026-11-08.
- The 12-month test is checked on the anniversary and the day before, a leap-day hire, seasonal periods in weeks, 51 and 52 weeks, and breaks of seven years kept by USERRA, an agreement or the employer.
- The hours window, logs, USERRA credit, missing records and flight crew are checked, and so are 75 and 75.1 miles, staff abroad and the 300 employees of FAB 2023-1 example 5.
- The notice due date skips weekends, Veterans Day, Thanksgiving and closed days; the rolling balance reproduces the 825.200(c) example; calendar, fixed, forward and military caregiver years and the ledger CSV are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the FMLA eligibility checker tool](https://krishnachagti-sudo.github.io/toll-preview/fmla-eligibility-checker/).

## Questions

### Is there any AI in the fmla eligibility checker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the fmla eligibility checker refuse to answer?

It does not decide whether a reason for leave qualifies, or whether employers are joint or integrated employers. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the FMLA eligibility checker tool](https://krishnachagti-sudo.github.io/toll-preview/fmla-eligibility-checker/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Rolling 12-month FMLA calculator](https://krishnachagti-sudo.github.io/toll-preview/fmla-eligibility-checker/rolling-12-month-calculator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/fmla-eligibility-checker/  
Data as of: 2026-11-04
