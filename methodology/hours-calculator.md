# How hours and overtime are calculated: method and sources

Hours are added up in whole minutes from each in and out punch, less unpaid breaks, and decimals are worked out from the minutes. Overtime is the time over 40 hours in each fixed workweek, never averaged over two weeks, at 1.5 times the rate. Rounding to 5, 6, 15 minutes is shown next to the punches as entered.

## What does the hours calculator and timesheet compute?

The tool adds up clock-in and clock-out times less unpaid breaks, across midnight and, with a time zone, across daylight-saving changes. It splits the hours into regular time, overtime and optional double time by workweek, shows what time-clock rounding does to the punches, converts hours and minutes to decimal hours and back, and makes a timesheet PDF to sign.

Operations (the op field):

- `calculate`: Adds up a list of days, each with in and out pairs and unpaid break minutes. The answer has the totals, each day and each workweek, pay when an hourly rate is given, the rounding check when rounding is asked for, and flags.
- `timesheet`: The same calculation for one named employee and pay period, with a CSV and a signable PDF timesheet.
- `convert`: Turns hours and minutes into decimal hours (7 hours 53 minutes is 7.88), or decimal hours into hours and minutes to the nearest minute.
- `between`: The time between two clock times on one shift, less a break, across midnight when the end is earlier than the start, and with a date and time zone across a daylight-saving change.

Inputs:

- `days`: Up to 62 days, each with a date, up to 6 in and out pairs and unpaid break minutes (0 to 720). Times may be written like 8:45 am, 17:15, 0845, noon or midnight; without am or pm a time is on the 24-hour clock.
- `weekStart, weekStartTime`: The day and time the fixed workweek starts. The default is Sunday at 12:00 AM.
- `weeklyOvertimeAfter, dailyOvertimeAfter, dailyDoubleTimeAfter`: Hours thresholds. Weekly overtime starts after 40 hours unless set otherwise or set to null; daily overtime and double time apply only when given.
- `rounding`: Optional: an increment of 5, 6, 15 minutes, and a mode of nearest (the default) or in-up-out-down.
- `timeZone, hourlyRate, periodStart, periodEnd`: A zone like America/Chicago to count real elapsed time; a rate in dollars with at most 2 decimals for gross pay; the pay period, which must hold every day entered.
- `employee, employer, approver`: For a timesheet: the names printed on it.

Outputs:

- totals: worked, regular, overtime, double time and unpaid breaks, each in minutes, h:mm and decimal hours
- days and weeks, with the hours of each and where each workweek starts
- pay: regular, overtime at 1.5 times, double time at 2 times and gross, when a rate is given
- rounding: the punched and rounded totals, the net difference and how many punches moved for or against the worker
- flags: long shifts, short unpaid breaks, a break longer than the time punched, clock changes and workweeks cut by the pay period
- for a timesheet, a CSV and a PDF

## How is it calculated, step by step?

1. Each clock time is read to a minute of the day. An out punch at or before its in punch is the next day, so overnight shifts need no date of their own.
2. Every punch is placed on one wall-clock line of whole minutes. With a time zone, the real minutes between two punches are counted, so a shift over the night clocks fall back is an hour longer.
3. When rounding is asked for, each punch is rounded to the increment: nearest rounds the lower half down and the upper half up, and in-up-out-down rounds every in punch up and every out punch down. The unrounded punches are worked out too, for the check.
4. Each shift is split at the moment its workweek ends, so a shift over the boundary counts in both weeks.
5. The unpaid break comes off the earliest minutes of the day. Daily double time and daily overtime, when set, are the last minutes of the day, and are not counted again in the weekly overtime.
6. In each workweek, the straight-time minutes over the weekly threshold are overtime. Each workweek stands alone: hours are never averaged over two weeks.
7. Decimals are worked out from the minutes, to two places, half up. Pay is minutes times the rate, 1.5 times for overtime and 2 times for double time, to the nearest cent.

**Workweek and overtime.**

29 CFR 778.105: a workweek is a fixed and regularly recurring period of 168 hours that may begin on any day and at any hour. 29 CFR 778.104 and DOL Fact Sheet #23: overtime is due on hours over 40 in a workweek, and averaging over two or more weeks is not permitted.

**Rounding.**

29 CFR 785.48(b) accepts recording time to the nearest 5 minutes, or the nearest one-tenth or quarter of an hour, as long as it does not fail to pay employees for all the time they worked over a period of time. The check shows what rounding did to these punches; it does not decide whether a rounding practice is lawful.

**Breaks.**

29 CFR 785.18: rest periods of 5 to about 20 minutes count as hours worked, so an unpaid break or gap under 20 minutes is flagged. 29 CFR 785.19: a meal period is ordinarily 30 minutes or more.

## Which edge cases does it handle?

- A biweekly pay period of 30 and 50 hours has 10 hours of overtime, because each workweek stands alone.
- On the night clocks fall back in New York (October 31, 2026), 10 PM to 6 AM is 9 hours; on the night they spring forward (March 13, 2027) it is 7. A time skipped by the spring change is read with the offset before it, and a time that happens twice is read as its first occurrence; both are reported.
- Equal start and end times on one shift are a full 24 hours.
- A shift longer than 16 hours is flagged as a possible AM and PM slip, and a pair longer than 24 hours is refused.
- A pay period given outright that cuts a workweek is flagged, because weekly overtime then counts only the hours entered.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A week with lunches, a split shift and a Saturday morning, at $18.50 an hour**

```json
{
  "op": "calculate",
  "days": [
    {
      "date": "2026-11-02",
      "punches": [
        {
          "in": "8:45 am",
          "out": "5:15 pm"
        }
      ],
      "breakMinutes": 30
    },
    {
      "date": "2026-11-03",
      "punches": [
        {
          "in": "9:00 am",
          "out": "6:00 pm"
        }
      ],
      "breakMinutes": 30
    },
    {
      "date": "2026-11-04",
      "punches": [
        {
          "in": "8:30 am",
          "out": "12:00 pm"
        },
        {
          "in": "12:30 pm",
          "out": "5:00 pm"
        }
      ]
    },
    {
      "date": "2026-11-05",
      "punches": [
        {
          "in": "9:00 am",
          "out": "7:30 pm"
        }
      ],
      "breakMinutes": 30
    },
    {
      "date": "2026-11-06",
      "punches": [
        {
          "in": "8:45 am",
          "out": "4:45 pm"
        }
      ],
      "breakMinutes": 30
    },
    {
      "date": "2026-11-07",
      "punches": [
        {
          "in": "9:00 am",
          "out": "1:00 pm"
        }
      ]
    }
  ],
  "hourlyRate": "18.50"
}
```

A week with lunches, a split shift and a Saturday morning, at $18.50 an hour

| Result | Value |
| --- | --- |
| worked | 46:00 |
| regular | 40.00 |
| overtime | 6.00 |
| overtime pay | $166.50 |
| gross | $906.50 |

**A biweekly pay period of 30 and 50 hours**

```json
op: "calculate"
days: 10 items
```

A biweekly pay period of 30 and 50 hours

| Result | Value |
| --- | --- |
| week from 2026-11-01 | 30.00 worked, 0.00 overtime |
| week from 2026-11-08 | 50.00 worked, 10.00 overtime |
| overtime | 10.00 |

**The rounding check: in up and out down to the quarter hour**

```json
{
  "op": "calculate",
  "days": [
    {
      "date": "2026-11-02",
      "punches": [
        {
          "in": "6:53 am",
          "out": "3:08 pm"
        }
      ],
      "breakMinutes": 30
    },
    {
      "date": "2026-11-03",
      "punches": [
        {
          "in": "7:06 am",
          "out": "3:22 pm"
        }
      ],
      "breakMinutes": 30
    },
    {
      "date": "2026-11-04",
      "punches": [
        {
          "in": "6:58 am",
          "out": "3:04 pm"
        }
      ],
      "breakMinutes": 30
    },
    {
      "date": "2026-11-05",
      "punches": [
        {
          "in": "7:07 am",
          "out": "3:13 pm"
        }
      ],
      "breakMinutes": 30
    },
    {
      "date": "2026-11-06",
      "punches": [
        {
          "in": "7:02 am",
          "out": "3:09 pm"
        }
      ],
      "breakMinutes": 30
    }
  ],
  "rounding": {
    "increment": 15,
    "mode": "in-up-out-down"
  },
  "hourlyRate": "17.00"
}
```

The rounding check: in up and out down to the quarter hour

| Result | Value |
| --- | --- |
| punched | 38:20 |
| paid after rounding | 37:00 |
| net | -1:20 |
| punches against the worker | 10 |
| pay difference | -$22.67 |

**An overnight shift on the night clocks fall back in New York**

```json
{
  "op": "between",
  "start": "10:00 pm",
  "end": "6:00 am",
  "date": "2026-10-31",
  "timeZone": "America/New_York"
}
```

An overnight shift on the night clocks fall back in New York

| Result | Value |
| --- | --- |
| hours | 9:00 |
| decimal | 9.00 |
| overnight | true |

**7 hours 53 minutes in decimal hours**

```json
{
  "op": "convert",
  "hours": 7,
  "minutes": 53
}
```

7 hours 53 minutes in decimal hours

| Result | Value |
| --- | --- |
| decimal | 7.88 |
| exact | 7.8833 |

## What does it not do?

- Overtime follows the federal rule unless other thresholds are set. A state law, contract or policy may require more, and no state rule is held.
- The rounding check does not decide whether a rounding practice is lawful.
- Gross pay uses the hourly rate entered. Other pay that can count toward the regular rate for overtime, such as some bonuses, is not included.
- Not legal or payroll advice.

## Where does the data come from, and how fresh is it?

The federal rules were copied by hand from Cornell LII and dol.gov on 2026-11-07 (Fact Sheet #23 revised October 2019, Fact Sheet #21 revised July 2008). A change on a source page is caught by the daily watch and checked by a person.

- [29 CFR 785.48 Use of time clocks](https://www.law.cornell.edu/cfr/text/29/785.48)
- [29 CFR 785.18 Rest](https://www.law.cornell.edu/cfr/text/29/785.18)
- [29 CFR 785.19 Meal](https://www.law.cornell.edu/cfr/text/29/785.19)
- [29 CFR 778.104 Each workweek stands alone](https://www.law.cornell.edu/cfr/text/29/778.104)
- [29 CFR 778.105 Determining the workweek](https://www.law.cornell.edu/cfr/text/29/778.105)
- [U.S. Department of Labor, Wage and Hour Division, Fact Sheet #23: Overtime Pay Requirements of the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay)
- [U.S. Department of Labor, Wage and Hour Division, Fact Sheet #21: Recordkeeping Requirements under the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping)

The federal rules were copied by hand on 2026-11-07. No state rule is held.

Hours calculator and timesheet: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [29 CFR 785.48 Use of time clocks](https://www.law.cornell.edu/cfr/text/29/785.48) | current text | 2026-11-07 |
| [29 CFR 785.18 Rest](https://www.law.cornell.edu/cfr/text/29/785.18) | current text | 2026-11-07 |
| [29 CFR 785.19 Meal](https://www.law.cornell.edu/cfr/text/29/785.19) | current text | 2026-11-07 |
| [29 CFR 778.104 Each workweek stands alone](https://www.law.cornell.edu/cfr/text/29/778.104) | current text | 2026-11-07 |
| [29 CFR 778.105 Determining the workweek](https://www.law.cornell.edu/cfr/text/29/778.105) | current text | 2026-11-07 |
| [U.S. Department of Labor, Wage and Hour Division, Fact Sheet #23: Overtime Pay Requirements of the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay) | revised October 2019 | 2026-11-07 |
| [U.S. Department of Labor, Wage and Hour Division, Fact Sheet #21: Recordkeeping Requirements under the FLSA](https://www.dol.gov/agencies/whd/fact-sheets/21-flsa-recordkeeping) | revised July 2008 | 2026-11-07 |
| [U.S. Department of Labor: Minimum Length of Meal Period Required under State Law for Adult Employees in Private Sector](https://www.dol.gov/agencies/whd/state/meal-breaks) | last updated 2023-01-01 | 2026-11-07 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The rules held are compared with the text read from each source. The worked week, the biweekly period, a shift over the workweek boundary, daily overtime and double time, rounding to 5, 6 and 15 minutes, daylight-saving nights and conversions are each checked to the minute, and the same timesheet input gives the same PDF bytes.

What its test suite asserts:

- The federal rules held are compared with the text read from Cornell LII and dol.gov on 2026-11-07: 29 CFR 785.48, 785.18, 785.19, 778.104 and 778.105, and DOL Fact Sheets #21 and #23.
- A worked week is reproduced: 46 hours with 6 of overtime, and $18.50 x 40 + $27.75 x 6 = $906.50.
- A biweekly period of 30 and 50 hours gives 10 hours of overtime, never averaged (29 CFR 778.104), and moving the workweek start moves the overtime.
- Daylight-saving nights in America/New\_York are checked: 10 PM to 6 AM is 9 hours on October 31, 2026 and 7 hours on March 13, 2027.
- Rounding to 5, 6 and 15 minutes, nearest and in up and out down, is checked punch by punch, and the same timesheet input gives the same PDF bytes.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Hours calculator and timesheet tool](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/).

## Questions

### Is there any AI in the hours calculator and timesheet answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the hours calculator and timesheet refuse to answer?

Overtime follows the federal rule unless other thresholds are set. A state law, contract or policy may require more, and no state rule is held. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Hours calculator and timesheet tool](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Hours calculator](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/hours-calculator/  
Data as of: 2026-11-04
