# How rolled-up holiday pay is worked out: GOV.UK method

Rolled-up holiday pay is 12.07% of the worker's total pay in the pay period, shown as its own payslip line, because 5.6 weeks of leave over 46.4 working weeks is 12.07%. Holiday hours accrue at 12.07% of hours worked, rounded to the nearest hour with 30 minutes rounding up: GOV.UK's 68 hours accrue 8.

## What does the rolled-up holiday pay calculator (uk, 12.07%) compute?

For irregular-hours and part-year workers in Great Britain, the tool works out the rolled-up holiday pay line for a pay period and the holiday hours accrued, for one worker or a payroll CSV of up to 5,000 rows. It also gives the accrual percentage for a larger entitlement, applies the two contract definitions and the 1 April 2024 leave-year start, averages a week's pay over the last 52 paid weeks, and works out the hours accrued during sick or statutory leave, each as GOV.UK's guidance sets it out.

Operations (the op field):

- `calculate`: One worker, one pay period: the total pay (from a figure or added from pay lines), the rate, the holiday pay line under the chosen rounding with all three roundings shown, the payslip lines, the hours accrued when hours are given and, with the worker's contract facts, whether rolled-up pay is allowed.
- `batch`: A payroll CSV in, the same rows out with six columns added (the rate, the holiday pay, the hours accrued, the payslip line, a status and a note), and the totals. Rows that are regular-hours or cannot be read are marked, not dropped.
- `rate`: The accrual percentage for an entitlement in weeks, or in days on a 1 to 5-day week, with the working.
- `accrual`: Holiday hours accrued for hours worked in a pay period, rounded to the hour, up to the next half hour, or not at all.
- `reference`: A week's holiday pay as the average of the last 52 paid weeks, and the pay for a number of weeks of leave.
- `leave-accrual`: Holiday hours accrued over weeks of sick or statutory leave, from the hours worked in the relevant period.
- `eligibility`: Whether the contract makes the worker irregular-hours, part-year or regular-hours, and whether rolled-up pay can be used given the leave-year start.

Inputs:

- `pay or lines`: The total pay for the period, or up to 20 pay lines (basic, premium hours, overtime and so on) that are added together. Pounds and pence, like 364.70.
- `hours`: Hours worked in the period, up to two decimal places.
- `entitlement`: weeks, or days with daysPerWeek (1 to 5), when the contract gives more than the statutory 5.6 weeks. Left out, the rate is 12.07%.
- `rounding, hourRounding`: nearest, up, govuk-steps for the pay line (default nearest); hour, half-hour-up, none for the hours (default hour).
- `worker`: hours: wholly-variable, mostly-variable, fixed; unpaidWeeks: whether the contract has unpaid weeks off; leaveYearStart as a date like 2026-04-01.
- `csv, periodEnd, leaveYearStart`: For batch: the payroll CSV (at most 2,000,000 characters) with a worker column, a pay or pay-part columns and optionally hours, worker type, period end, leave-year start and entitlement; periodEnd and leaveYearStart for every row.
- `weeks, leaveWeeks`: For reference: weekly pay, most recent first, up to 104 weeks, each optionally marked excluded (sick or statutory); and the weeks of leave to price.
- `hours, weeksOff, divisor`: For leave-accrual: hours worked in the relevant period, the weeks of leave, and the divisor (default 46.4).

Outputs:

- answer: the holiday pay line, or the rate, hours or average, in one sentence
- holidayPay: the amount, the exact figure, the three roundings and the working
- payslip: the pay lines, the rolled-up holiday pay line and the gross pay
- accrual: hours accrued, the exact figure and the working; eligibility: the kind of worker and the reasons
- batch: rows with status and note, totals, the pay columns used and the CSV

## How is it calculated, step by step?

1. Money is whole pence and the rate is hundredths of a percent (12.07% is 1207), so every answer is integer arithmetic and the same input gives the same pence.
2. The rate is entitlement weeks ÷ (52 - entitlement weeks) x 100, to two decimal places, half up: 5.6 ÷ 46.4 is 12.07%, and GOV.UK's 6 weeks give 13.04%. Days are turned into weeks on a 1 to 5-day week. Less than 5.6 weeks is refused as below the statutory minimum, and more than 10 weeks is not supported.
3. The pay line is total pay x rate. nearest rounds to the nearest penny (half a penny up), up rounds up to the next penny, and govuk-steps follows GOV.UK's worked tables: pay ÷ 100 to the nearest penny, then x 12.07, to the nearest penny (Hana: £44.06). All three are returned so a payroll can see a difference before it chooses.
4. Premium-rate hours and overtime are part of total pay: GOV.UK applies the rate to total pay in the period regardless of differing hourly rates.
5. Hours accrued are hours worked x rate. hour rounds to the nearest hour, 30 minutes or more up and less down (to zero when under 30 minutes); half-hour-up rounds up to the next half hour, GOV.UK's note for workers on 4 hours a week or less; none keeps four decimal places.
6. A worker is irregular-hours when paid hours each pay period are wholly or mostly variable under the contract, and part-year when the contract has unpaid weeks off of at least a week. A rotating pattern of fixed hours counts as fixed. Rolled-up pay is allowed only for those two kinds, in leave years beginning on or after 1 April 2024.
7. The 52-week average takes weeks most recent first, skips weeks with no pay and weeks with any sick or statutory leave, counts earlier weeks instead, never looks back more than 104 weeks, and divides by the paid weeks found (fewer than 52 when that is all there is), to the nearest penny.
8. Leave accrual follows GOV.UK section 3.3: hours in the relevant period ÷ 46.4 (or another divisor), x 12.07%, x the weeks of leave, each step to three decimal places, then to the nearest hour.
9. A payroll CSV is read by its headings with case and spacing ignored. Pay is the total column, or the pay parts (basic, overtime, commission, premium and others) added. Worker types such as zero-hours, casual, bank and agency are irregular-hours; term-time and seasonal are part-year; regular, fixed and salaried rows are refused the line. A row with no type is assumed eligible and noted.

**GOV.UK: Holiday pay and entitlement reforms from 1 January 2024.**

"The 12.07% figure is based on the fact that all workers are entitled to 5.6 weeks’ leave. This means that a worker’s total working weeks in a year is 46.4 (52 weeks in a year minus 5.6 weeks of leave). 12.07% of 46.4 is 5.6." The rounding of hours, the enhanced percentage, the two definitions, the 52-week reference period and the accrual during leave are applied as this guidance states them, updated 2024-04-01 and read on 2026-11-08.

**GOV.UK: Holiday entitlement.**

"For regular-hours workers (full- or part- time), an employer cannot include an amount for holiday pay in the hourly rate (known as ‘rolled-up holiday pay’)." The guide, updated 2026-11-05, also sets the record duty quoted on the pages: "From 6 April 2026, employers must keep detailed records of annual leave and holiday pay for a minimum of 6 years from the date they were made."

**Working Time Regulations 1998.**

The regulations themselves were not read: legislation.gov.uk answered automated reads with a bot challenge on the read date, so every rule here is GOV.UK's guidance.

## Which edge cases does it handle?

- GOV.UK's Hana: 364.70 by GOV.UK's steps is £44.06, while the exact 12.07% to the nearest penny is £44.02.
- GOV.UK's Jill: 68 hours x 12.07% is 8.2076 hours, which rounds to 8; exactly 30 minutes over an hour rounds up.
- A worker whose contract alternates two fixed weekly patterns is regular-hours, so the line is refused.
- A leave year that began before 1 April 2024 keeps the old method until it renews.
- GOV.UK's Table 9 average of £12,040 over 52 weeks is £231.54.
- GOV.UK's Harriet: 1032 hours and 40 weeks of maternity leave accrue 107 hours.
- A list with no paid week is refused: GOV.UK says to pay an amount that fairly represents the worker's pay.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**One week for a zero-hours bar worker with premium hours**

```json
{
  "op": "calculate",
  "lines": [
    {
      "label": "Basic pay (31.5 hours at £12.80)",
      "amount": "403.20"
    },
    {
      "label": "Premium hours (3.5 at £14.00)",
      "amount": "49.00"
    }
  ],
  "hours": "35",
  "worker": {
    "hours": "wholly-variable",
    "leaveYearStart": "2026-04-01"
  }
}
```

One week for a zero-hours bar worker with premium hours

| Result | Value |
| --- | --- |
| answer | On total pay of £452.20 this pay period, rolled-up holiday pay is £54.58 (12.07%), shown as a separate payslip line; the worker also accrues 4 hours of holiday. |
| total pay | £452.20 |
| holiday pay (nearest) | £54.58 |
| holiday pay (up) | £54.59 |
| holiday pay (GOV.UK steps) | £54.56 |
| hours accrued | 35 x 12.07% = 4.2245 hours (4 hours 13 minutes), to the nearest hour: 4 |

**A small payroll CSV with one regular-hours row refused**

```json
{
  "op": "batch",
  "csv": "worker,period_end,worker_type,hours,basic,overtime\nSample A,2026-11-06,zero-hours,22,281.60,\nSample B,2026-11-06,zero-hours,35.5,454.40,55.20\nSample C,2026-11-06,term-time,30,384.00,\nSample D,2026-11-06,regular,37.5,480.00,\nSample E,2026-11-06,casual,6.25,80.00,\n"
}
```

A small payroll CSV with one regular-hours row refused

| Result | Value |
| --- | --- |
| answer | 4 of 5 worker rows get a rolled-up holiday pay line: £151.51 in all on £1,255.20 of pay, and 12 hours of holiday accrued; 1 row is not allowed rolled-up pay. |
| Sample A | Rolled-up holiday pay (12.07%) £33.99, 3 hours |
| Sample B | Rolled-up holiday pay (12.07%) £61.51, 4 hours |
| Sample C | Rolled-up holiday pay (12.07%) £46.35, 4 hours |
| Sample D | Regular-hours worker: rolled-up pay not allowed; pay holiday when taken. |
| Sample E | Rolled-up holiday pay (12.07%) £9.66, 1 hour |

**GOV.UK's Hana by GOV.UK's worked steps**

```json
{
  "op": "calculate",
  "pay": "364.70",
  "rounding": "govuk-steps"
}
```

GOV.UK's Hana by GOV.UK's worked steps

| Result | Value |
| --- | --- |
| answer | On total pay of £364.70 this pay period, rolled-up holiday pay is £44.06 (12.07%), shown as a separate payslip line. |
| working | £364.70 ÷ 100 = £3.65; £3.65 x 12.07 = £44.0555, to the nearest penny £44.06 |
| exact | £44.01929 |

**The rate for 33 days on a 5-day week**

```json
{
  "op": "rate",
  "days": "33",
  "daysPerWeek": 5
}
```

The rate for 33 days on a 5-day week

| Result | Value |
| --- | --- |
| answer | With 33 days on a 5-day week = 6.6 weeks of holiday, the accrual rate is 6.6 ÷ (52 - 6.6) = 6.6 ÷ 45.4 = 14.54%. |

**GOV.UK's Harriet: 40 weeks of maternity leave**

```json
{
  "op": "leave-accrual",
  "hours": "1032",
  "weeksOff": "40"
}
```

GOV.UK's Harriet: 40 weeks of maternity leave

| Result | Value |
| --- | --- |
| step 1 | 1,032 hours ÷ 46.4 = 22.241 hours a week |
| step 2 | 22.241 ÷ 100 x 12.07 = 2.684 hours of holiday a week |
| step 3 | 2.684 x 40 weeks = 107.36 |
| step 4 | to the nearest hour: 107 |

## What does it not do?

- Great Britain only. Northern Ireland has its own rules and is not covered.
- Whether a worker is irregular-hours or part-year depends on the contract; the tool applies your answer, and the pay figures are yours.
- On a 6 or 7-day week the 28-day cap on statutory leave applies and GOV.UK gives no percentage, so it is refused.
- It is not legal advice.

## Where does the data come from, and how fresh is it?

The guidance was read on GOV.UK on 2026-11-08: the reforms guidance (updated 2024-04-01) and the holiday entitlement guide (updated 2026-11-05). The rules and quotes are copied into the tool's data file and change only by hand, with the tests that pin them.

- [Department for Business and Trade, GOV.UK: Holiday pay and entitlement reforms from 1 January 2024](https://www.gov.uk/government/publications/simplifying-holiday-entitlement-and-holiday-pay-calculations/holiday-pay-and-entitlement-reforms-from-1-january-2024)
- [GOV.UK: Holiday entitlement](https://www.gov.uk/holiday-entitlement-rights)
- [GOV.UK: Holiday entitlement: Holiday pay](https://www.gov.uk/holiday-entitlement-rights/holiday-pay)
- [GOV.UK: Holiday entitlement: Calculate leave entitlement](https://www.gov.uk/holiday-entitlement-rights/calculate-leave-entitlement)
- [Security Industry Authority, GOV.UK: SIA approved contractors and rolled-up holiday pay](https://www.gov.uk/guidance/sia-approved-contractors-and-rolled-up-holiday-pay)

The guidance was read on GOV.UK on 2026-11-08: the reforms guidance (updated 2024-04-01) and the holiday entitlement guide (updated 2026-11-05). The rules and quotes are copied into the tool's data file and change only by hand, with the tests that pin them.

Rolled-up holiday pay calculator (UK, 12.07%): sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [Department for Business and Trade, GOV.UK: Holiday pay and entitlement reforms from 1 January 2024](https://www.gov.uk/government/publications/simplifying-holiday-entitlement-and-holiday-pay-calculations/holiday-pay-and-entitlement-reforms-from-1-january-2024) | updated 2024-04-01 | 2026-11-08 |
| [GOV.UK: Holiday entitlement](https://www.gov.uk/holiday-entitlement-rights) | updated 2026-11-05 | 2026-11-08 |
| [GOV.UK: Holiday entitlement: Holiday pay](https://www.gov.uk/holiday-entitlement-rights/holiday-pay) | updated 2026-11-05 | 2026-11-08 |
| [GOV.UK: Holiday entitlement: Calculate leave entitlement](https://www.gov.uk/holiday-entitlement-rights/calculate-leave-entitlement) | updated 2026-11-05 | 2026-11-08 |
| [Security Industry Authority, GOV.UK: SIA approved contractors and rolled-up holiday pay](https://www.gov.uk/guidance/sia-approved-contractors-and-rolled-up-holiday-pay) | updated 2026-06-24 | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The quoted rules and their read date are pinned to GOV.UK. The tests reproduce GOV.UK's own figures: Hana £44.06, Mark £55.52, Jill 8 hours, 6 weeks at 13.04%, Table 9 £231.54, Harriet 107 and Sharon 41 hours; and check the 30-minute boundary, the 1 April 2024 start, the 104-week cap and the payroll CSV.

What its test suite asserts:

- The quoted GOV.UK rules are pinned with their read date, 2026-11-08.
- GOV.UK's worked figures are reproduced: Hana £44.06, Mark £55.52, Jill 8 hours, 13.04% for 6 weeks, Table 9 £231.54, Harriet 107 hours.
- The 30-minute rounding boundary, the 1 April 2024 leave-year start, excluded weeks and the 104-week cap, and the payroll CSV with per-row errors are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Rolled-up holiday pay calculator (UK, 12.07%) tool](https://krishnachagti-sudo.github.io/toll-preview/rolled-up-holiday-pay-calculator/).

## Questions

### Is there any AI in the rolled-up holiday pay calculator (uk, 12.07%) answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the rolled-up holiday pay calculator (uk, 12.07%) refuse to answer?

Great Britain only. Northern Ireland has its own rules and is not covered. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Rolled-up holiday pay calculator (UK, 12.07%) tool](https://krishnachagti-sudo.github.io/toll-preview/rolled-up-holiday-pay-calculator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/rolled-up-holiday-pay-calculator/  
Data as of: 2026-11-04
