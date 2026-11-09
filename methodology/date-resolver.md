# How date phrases are resolved: rules and sources

A phrase is read by a small fixed grammar and worked out on whole day numbers from an explicit reference date, so the machine's time zone cannot change it. The start day is not counted, months keep the day of the month or the month's last day, weeks run Monday to Sunday, and business days skip weekends and the chosen holidays. Dates run from 1900 to 2199.

## What does the natural-language date resolver compute?

The tool turns a phrase such as "90 days from today", "10 business days after next Friday" or "end of next month" into one calendar date with its weekday, ISO week and day of the year. It says every step it took and every holiday it skipped. When a phrase can honestly mean two dates, such as "next Friday" said on a Monday, the answer says so and gives both.

Inputs:

- `text or texts`: One phrase, or a list of up to 50 phrases, each at most 200 characters. One of the two, not both.
- `ref`: The date the phrase is said on, like 2026-11-07, or "today" with a timeZone. It is required, so the answer never depends on the server's clock.
- `timeZone`: An IANA name like America/New\_York, needed with ref "today": today is the date in that zone at the moment of the call.
- `region`: US (federal holidays, the default), GB-ENG (England and Wales bank holidays), IN-CENTRAL-DELHI (India, central government offices in Delhi) or none (weekends only).
- `daysOff`: Optional list of your own dates (at most 400), skipped as business days and named as your days off.
- `weekdayRule, dateOrder, roll`: weekdayRule "nearest" (default) or "next-week" for "next Friday"; dateOrder "MDY" (default) or "DMY" for 3/4/2027; roll none (default), following, preceding or modified-following.

Outputs:

- date, weekday, dateText, isoWeek and dayOfYear
- calendarDaysFromRef and businessDay: whether the date itself is a business day in the chosen calendar
- ambiguous, and readings: the other reading with its date when the phrase can mean two days
- holidaysSkipped and daysOffSkipped, each with its date and name; rolledFrom when a roll moved the date
- steps in words, and assumptions: the reference date and where it came from, the holiday calendar, the weekday rule, the date order, the roll and the counting rules

## How is it calculated, step by step?

1. The phrase is lowercased and split into words and numbers. Number words such as "twenty-one" are read as numbers, and filler such as "excluding federal holidays" is dropped, because business days always skip the chosen holidays.
2. A small hand-written grammar reads the phrase into a tree: an offset (such as 3 weeks) from or before an anchor (today, a weekday, the start or end of a period, an nth weekday of a month, or a written date). Anything it does not know is refused with a list of the forms it does know.
3. Every date is turned into a whole day number (days since 1970-01-01). No date objects are used, so the time zone of the machine cannot change an answer.
4. Calendar days and weeks are added as whole days. Months, quarters and years keep the day of the month, or the month's last day when it is shorter.
5. Business days are added with the Business days engine for the chosen region, which skips Saturdays, Sundays and that region's holidays and names each one. With region none only weekends are skipped. Your own days off are skipped too.
6. If a roll is asked for and the result is not a business day, it is moved to the next business day (following), the one before (preceding), or the next one unless that is in another month, in which case the one before (modified following).
7. Where the phrase allowed a second reading, the phrase is worked out again with the other choice, and the second date is given when it differs.

**Counting.**

The start day is never counted: 1 day after a Friday is the Saturday, and 1 business day after a Friday is the Monday. "Net 30" is 30 calendar days after the invoice date.

January 31 plus 1 month is February 28, or February 29 in a leap year. A quarter is 3 months.

**Weekdays and weeks.**

Weeks run Monday to Sunday, as in ISO 8601, and "end of the week" is the Sunday, with the Friday as the other reading.

"Friday" or "this Friday" is the coming Friday, or the reference date itself if it is a Friday, with the Friday a week later as the other reading. "Next Friday" is the nearest Friday after the reference date by default; the Friday of next week is the other reading when it is a different day, and weekdayRule "next-week" swaps the two. "Last Friday" works the same way backwards.

**Written dates.**

A date with no year, such as "March 3", is the next one on or after the reference date, with the one in the reference date's year as the other reading. 3/4/2027 is read month first unless dateOrder is DMY, and the other order is given as the other reading when both are real dates.

**Holidays.**

The holiday calendars are the Business days tool's, imported read-only: US federal holidays under 5 U.S.C. 6103 on the days OPM observes them, and England and Wales bank holidays, both by rule from 1971 to 2100; India's central government holidays for offices in Delhi from the DoPT memoranda, 2025 to 2027.

## Which edge cases does it handle?

- A Saturday New Year's Day: the US holiday is observed on Friday, December 31, so 1 business day after Thursday, December 30, 2027 is Monday, January 3, 2028.
- "Next Friday" said on a Saturday or Sunday is the same day on both readings, so the answer is not marked ambiguous.
- A roll on a date that is already a business day leaves it unchanged and reports no rolledFrom.
- Modified following never leaves the month: Saturday, July 31, 2027 rolls back to Friday, July 30.
- Quantities above 99,999 are refused, and so are dates outside 1900 to 2199 or outside the holiday calendar's years.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**"10 business days after next Friday", said on Monday, November 2, 2026**

```json
{
  "text": "10 business days after next Friday",
  "ref": "2026-11-02",
  "region": "US"
}
```

"10 business days after next Friday", said on Monday, November 2, 2026

| Result | Value |
| --- | --- |
| date | 2026-11-23 |
| weekday | Monday |
| holidaysSkipped | Veterans Day (2026-11-11) |
| other reading | 2026-11-30 |

**Net 30 from Monday, October 12, 2026, rolled to the following business day**

```json
{
  "text": "net 30 from 2026-10-12",
  "ref": "2026-10-12",
  "roll": "following"
}
```

Net 30 from Monday, October 12, 2026, rolled to the following business day

| Result | Value |
| --- | --- |
| date | 2026-11-12 |
| weekday | Thursday |
| rolledFrom | 2026-11-11 |

**Three phrases in one call, said on Saturday, November 7, 2026**

```json
{
  "texts": [
    "end of next month",
    "first Monday of March 2027",
    "last business day of this quarter"
  ],
  "ref": "2026-11-07",
  "region": "US"
}
```

Three phrases in one call, said on Saturday, November 7, 2026

| Result | Value |
| --- | --- |
| end of next month | 2026-12-31 (Thursday) |
| first Monday of March 2027 | 2027-03-01 (Monday) |
| last business day of this quarter | 2026-12-31 (Thursday) |

## What does it not do?

- Times of day are refused: the answer is a calendar date, never a time.
- Only the grammar's forms are read. A phrase it does not know is refused with the forms it does know, never guessed.
- Holidays are the US federal, England and Wales or India central government (Delhi) calendars only. State, bank, school and company calendars are not included, except your own days off.
- The tool does not decide which reading of an ambiguous phrase you meant. It gives the default and the other one.

## Where does the data come from, and how fresh is it?

The grammar and counting rules are fixed in the code. The holiday rules are the Business days tool's, last changed on 2026-10-30, and the OPM federal holiday page was read on 2026-11-07.

- [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)
- [5 U.S.C. 6103: Holidays](https://www.law.cornell.edu/uscode/text/5/6103)
- [ISO 8601: Date and time format](https://www.iso.org/iso-8601-date-and-time-format.html)

The grammar and counting rules are fixed in the code. Business days use the Business days tool's holiday calendars (rules last changed 2026-10-30); the OPM federal holiday page was read on 2026-11-07.

Natural-language date resolver: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/) | federal holidays and observed days | 2026-11-07 |
| [5 U.S.C. 6103: Holidays](https://www.law.cornell.edu/uscode/text/5/6103) | rules as of 2026-10-30 | 2026-10-30 |
| [ISO 8601: Date and time format](https://www.iso.org/iso-8601-date-and-time-format.html) | weeks Monday to Sunday | not recorded |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

Calendar days, months, quarters and years, month-end clamping, weekdays on both readings, periods, business days, written dates, rolling and ISO weeks are each checked phrase by phrase from a fixed reference date. Business days must equal the Business days tool's own add, and refused phrases are checked to be refused.

What its test suite asserts:

- Calendar days, weeks, months, quarters and years are checked phrase by phrase from a fixed reference date: 90 days from Monday, November 2, 2026 is Sunday, January 31, 2027.
- Month ends are clamped and leap years kept: 1 month after January 31, 2027 is February 28, and 1 year after February 29, 2028 is February 28, 2029.
- "Next Friday", "last Tuesday" and dates with no year are checked on both readings, and the second reading is given only when it differs.
- Business days must equal the Business days tool's own add for US federal holidays; England and Wales, India, weekends only and your own days off are checked too.
- Rolling (following, preceding, modified following), ISO weeks and the refusal of times, unknown words and out-of-range dates are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Natural-language date resolver tool](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/).

## Questions

### Is there any AI in the natural-language date resolver answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the natural-language date resolver refuse to answer?

Times of day are refused: the answer is a calendar date, never a time. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Natural-language date resolver tool](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Date resolver guides and API](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/api/)
- [How business days are counted](https://krishnachagti-sudo.github.io/toll-preview/methodology/business-days/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/date-resolver/  
Data as of: 2026-11-04
