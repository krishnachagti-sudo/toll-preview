# How business days are counted: rules and sources

Business days are counted on whole calendar days: the start day is not counted, the end day is, and Saturdays, Sundays and the holidays of the chosen region are skipped. Holidays are worked out by rule for any year from 1971 to 2100 in the United States and in England and Wales, and read from a table for India in 2025 to 2027.

## What does the business days compute?

The tool does two things. It counts the business days between two dates, and it moves a date forward or back by a number of business days. Both use the same calendar for a region, plus any days off you add.

Operations (the op field):

- `between`: Counts the business days after start and up to and including end. The answer is businessDays (negative if end is before start) and holidaysSkipped, the weekday holidays inside the range.
- `add`: Moves start by a whole number of business days, forward or back (up to 3,650 either way). The answer is date and holidaysSkipped, the weekday holidays passed on the way.

Inputs:

- `region`: US (United States federal holidays), GB-ENG (England and Wales bank holidays) or IN-CENTRAL-DELHI (India, central government offices in Delhi).
- `start, end, days`: Real calendar dates written like 2026-07-01, and for add a whole number of days.
- `daysOff`: Optional list of your own dates (at most 400), skipped like holidays and reported separately as daysOffSkipped.

Outputs:

- businessDays or date
- holidaysSkipped: the date and name of each weekday holiday passed
- daysOffSkipped: your own days off that were passed and were not already holidays
- note: for India only, what the list covers and does not

## How is it calculated, step by step?

1. Each date is turned into a whole day number (days since 1970-01-01) with an integer calendar algorithm. No time-zone-dependent date objects are used, so the machine running the code cannot change an answer.
2. Counting visits every day after start up to and including end. Moving visits one day at a time in the direction asked until the requested number of business days has been found. Moving by 0 returns start as given.
3. Saturday and Sunday are never business days in any region.
4. Each remaining weekday is looked up in the region's holiday list for its year. If it is a holiday it is skipped and recorded in holidaysSkipped.
5. A weekday that is not a holiday but is in your daysOff list is skipped too and recorded in daysOffSkipped. A day that is both a holiday and a day off is reported once, as the holiday.
6. If end is before start, the same count is made over the days after end up to start and its sign is reversed (0 stays 0).

**United States (federal).**

Rules from 5 U.S.C. 6103 and the OPM federal holiday list. New Year's Day (1 January), Martin Luther King Jr. Day (third Monday of January, from 1986), Washington's Birthday (third Monday of February), Memorial Day (last Monday of May), Juneteenth (19 June, from 2021), Independence Day (4 July), Labor Day (first Monday of September), Columbus Day (second Monday of October), Veterans Day (11 November; the fourth Monday of October in 1971 to 1977), Thanksgiving (fourth Thursday of November) and Christmas Day (25 December).

A fixed-date holiday on a Saturday is observed on the Friday, and on a Sunday on the Monday, and the name then carries "(observed)". A 1 January that falls on a Saturday is observed on Friday 31 December, which belongs to the previous year and is listed in that year.

**England and Wales.**

Rules from the Banking and Financial Dealings Act 1971 and royal proclamations. Good Friday and Easter Monday come from the Gregorian Easter date (the Meeus, Jones and Butcher algorithm). The early May bank holiday (first Monday of May, from 1978), the spring bank holiday (last Monday of May) and the summer bank holiday (last Monday of August) are tied to a weekday. New Year's Day (from 1974), Christmas Day and Boxing Day are fixed dates.

A fixed-date holiday that falls on a weekend moves to the next weekday that is not already a holiday and is named "(substitute day)". One-off moves and extra days, such as jubilees, royal weddings, the 2022 State Funeral and the 2023 Coronation, are held in tables.

**India (central government, Delhi).**

There is no rule to compute, because festival dates follow lunar calendars. The closed (gazetted) holidays are copied from the Department of Personnel and Training (DoPT) office memorandum for each year, with any later memorandum that moves a date. Only 2025 to 2027 are covered, and other years are refused. A holiday on a weekend is not moved, because the memorandum allows no substitute day. Weekends are Saturday and Sunday under the 5-day week of DoPT O.M. No. 13/4/85-JCA.

## Which edge cases does it handle?

- Observed days: in 2026, 4 July is a Saturday, so the US holiday is Friday 3 July and is named "Independence Day (observed)".
- A Saturday 1 January: the US holiday is observed on the previous 31 December, so 31 December 2021 is a holiday.
- Substitute days in England and Wales: when Christmas Day and Boxing Day both fall on a weekend, the substitutes take the next two free weekdays.
- Two holidays on one date are both listed: the India list for 2 October 2025 has Mahatma Gandhi's Birthday and Dussehra.
- The start day is never counted, so a count may start on a holiday, and for India it may start on 31 December 2024, the day before the first covered year.
- Reversed ranges, a zero move, and your own days off that coincide with a holiday are all handled as described in the steps.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**An observed holiday: 1 to 8 July 2026 in the US**

```json
{
  "op": "between",
  "region": "US",
  "start": "2026-07-01",
  "end": "2026-07-08"
}
```

An observed holiday: 1 to 8 July 2026 in the US

| Result | Value |
| --- | --- |
| businessDays | 4 |
| holidaysSkipped | Independence Day (observed) (2026-07-03) |

**A Saturday New Year's Day: 30 December 2021 to 4 January 2022 in the US**

```json
{
  "op": "between",
  "region": "US",
  "start": "2021-12-30",
  "end": "2022-01-04"
}
```

A Saturday New Year's Day: 30 December 2021 to 4 January 2022 in the US

| Result | Value |
| --- | --- |
| businessDays | 2 |
| holidaysSkipped | New Year's Day (observed) (2021-12-31) |

**Substitute days in England and Wales: 1 business day after Christmas Eve 2026**

```json
{
  "op": "add",
  "region": "GB-ENG",
  "start": "2026-12-24",
  "days": 1
}
```

Substitute days in England and Wales: 1 business day after Christmas Eve 2026

| Result | Value |
| --- | --- |
| date | 2026-12-29 |
| holidaysSkipped | Christmas Day (2026-12-25); Boxing Day (substitute day) (2026-12-28) |

**Your own day off on top of the holiday**

```json
{
  "op": "between",
  "region": "US",
  "start": "2026-07-01",
  "end": "2026-07-08",
  "daysOff": [
    "2026-07-06"
  ]
}
```

Your own day off on top of the holiday

| Result | Value |
| --- | --- |
| businessDays | 3 |
| holidaysSkipped | Independence Day (observed) (2026-07-03) |
| daysOffSkipped | Your day off (2026-07-06) |

**Moving backward: 1 business day before Monday 5 January 2026**

```json
{
  "op": "add",
  "region": "US",
  "start": "2026-01-05",
  "days": -1
}
```

Moving backward: 1 business day before Monday 5 January 2026

| Result | Value |
| --- | --- |
| date | 2026-01-02 |
| holidaysSkipped | none |

## What does it not do?

- US holidays are the statutory federal ones only. One-off closures ordered by the President are not included, and neither are state, local, bank or stock exchange calendars.
- England and Wales only. Scotland and Northern Ireland have different bank holidays and are not computed.
- India is the closed holidays of central government administrative offices in Delhi and New Delhi, 2025 to 2027 only. Restricted (optional) holidays, any state list, bank holidays and one-off office closures are not included.
- US and England and Wales dates must fall between 1971 and 2100, and India dates in its covered years. Anything else is refused with the reason, not guessed.
- A day is either a business day or not. Half days and early closes are not modelled.

## Where does the data come from, and how fresh is it?

The US and England and Wales rules were last changed on 2026-10-30. The India table was read from the DoPT memoranda on 2026-11-03.

- [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)
- [OPM: Federal holidays, "in lieu of" days](https://www.opm.gov/policy-data-oversight/pay-leave/work-schedules/fact-sheets/Federal-Holidays-In-Lieu-Of-Determination)
- [5 U.S.C. 6103: Holidays](https://www.law.cornell.edu/uscode/text/5/6103)
- [GOV.UK: UK bank holidays](https://www.gov.uk/bank-holidays)
- [Banking and Financial Dealings Act 1971](https://www.legislation.gov.uk/ukpga/1971/80)
- [DoPT O.M. F.No.12/2/2023-JCA dated 3 July 2025: holidays during 2026](https://documents.doptcirculars.nic.in/D2/D02est/Holidays%20to%20be%20observed%20in%20Central%20Government%20Offices%20during%20the%20year%2020265vgBs.pdf)
- [DoPT O.M. No. 13/4/85-JCA dated 21 May 1985: the 5-day week](https://documents.doptcirculars.nic.in/D2/D02est/jcm3.html)

The United States and England and Wales holidays are worked out by rule for any year from 1971 to 2100; the rules were last changed on 2026-10-30. India (central government, Delhi) covers 2025 to 2027 only, from the memoranda below, read on 2026-11-03; other years are refused, not guessed.

Business days: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/) | rules as of 2026-10-30 | 2026-10-30 |
| [OPM: Federal holidays, "in lieu of" days](https://www.opm.gov/policy-data-oversight/pay-leave/work-schedules/fact-sheets/Federal-Holidays-In-Lieu-Of-Determination) | rules as of 2026-10-30 | 2026-10-30 |
| [5 U.S.C. 6103: Holidays](https://www.law.cornell.edu/uscode/text/5/6103) | rules as of 2026-10-30 | 2026-10-30 |
| [Federal Reserve: Holidays observed (K.8)](https://www.federalreserve.gov/aboutthefed/k8.htm) | rules as of 2026-10-30 | 2026-10-30 |
| [GOV.UK: UK bank holidays](https://www.gov.uk/bank-holidays) | rules as of 2026-10-30 | 2026-10-30 |
| [Banking and Financial Dealings Act 1971](https://www.legislation.gov.uk/ukpga/1971/80) | rules as of 2026-10-30 | 2026-10-30 |
| [DoPT O.M. F.No.12/2/2023-JCA dated 9 July 2024: holidays during 2025](https://documents.doptcirculars.nic.in/D2/D02est/List%20of%20holidays%202025KtKLw.pdf) | holidays during 2025 | 2026-11-03 |
| [DoPT O.M. F.No.12/4/2020-JCA2 dated 27 March 2025: holiday on 14 April 2025](https://documents.doptcirculars.nic.in/D2/D02est/Holiday%20on%2014th%20April%202025%20Birthday%20of%20Dr%20B%20R%20AmbedkarDHZ8b.pdf) | holidays during 2025 | 2026-11-03 |
| [DoPT O.M. F.No.12/2/2023-JCA dated 3 July 2025: holidays during 2026](https://documents.doptcirculars.nic.in/D2/D02est/Holidays%20to%20be%20observed%20in%20Central%20Government%20Offices%20during%20the%20year%2020265vgBs.pdf) | holidays during 2026 | 2026-11-03 |
| [DoPT O.M. F.No.12/3/2023-JCA dated 22 May 2026: Id-ul-Zuha (Bakrid) moved to 28 May 2026](https://documents.doptcirculars.nic.in/D2/D02est/Change%20in%20the%20date%20of%20holiday%20of%20Id-ul-Zuhamg709.PDF) | holidays during 2026 | 2026-11-03 |
| [DoPT O.M. F.No.12/2/2023-JCA dated 16 July 2026: holidays during 2027](https://documents.doptcirculars.nic.in/D2/D02est/Holiday%20list%202027Cj0HU.PDF) | holidays during 2027 | 2026-11-03 |
| [DoPT O.M. No. 13/4/85-JCA dated 21 May 1985: the 5-day week](https://documents.doptcirculars.nic.in/D2/D02est/jcm3.html) | the 5-day week | 2026-11-03 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

Easter is compared with published dates for nine years from 1971 to 2100, England and Wales lists with the official lists, US lists in full for 2026 and for the years where rules changed, and India name by name with the DoPT memoranda. Counting and adding are checked to agree with each other.

What its test suite asserts:

- Easter Sunday is compared with published dates for nine years from 1971 to 2100.
- England and Wales holidays are compared with the official lists for 2020 to 2025 and 2027, and the 2026 list is checked in full.
- United States holidays are checked in full for 2026, and for the years where rules changed: Juneteenth from 2021, Martin Luther King Jr. Day from 1986, Veterans Day in 1971 to 1977, New Year's Day on a Saturday.
- India is compared with the DoPT memoranda for 2025, 2026 and 2027, name by name, and the weekday printed in each memorandum must agree with the calendar. The Bakrid move to 28 May 2026 is checked.
- Counting days and adding days must agree with each other, forwards and backwards.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Business days tool](https://krishnachagti-sudo.github.io/toll-preview/business-days/).

## Questions

### Is there any AI in the business days answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the business days refuse to answer?

US holidays are the statutory federal ones only. One-off closures ordered by the President are not included, and neither are state, local, bank or stock exchange calendars. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Business days tool](https://krishnachagti-sudo.github.io/toll-preview/business-days/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Business days guides and API](https://krishnachagti-sudo.github.io/toll-preview/business-days/api/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/business-days/  
Data as of: 2026-11-04
