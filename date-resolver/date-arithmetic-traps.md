# Date arithmetic traps

One month after January 31, 2027 is Sunday, February 28, 2027; one year after February 29, 2028 is Wednesday, February 28, 2029; and 1 business day after Thursday, December 30, 2027 is Monday, January 3, 2028, because New Year's Day 2028 falls on a Saturday and is observed on Friday, December 31.

- Jan 31, 2027 + 1 month: February 28, 2027
- Feb 29, 2028 + 1 year: February 28, 2029
- ISO week of Jan 1, 2027: 2026-W53

## Try your own tricky date

[Resolve it in the tool](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+month+after+2027-01-31&ref=2027-01-01&region=US)

## Fifteen tricky dates

| Phrase | Said on | Answer | Why |
| --- | --- | --- | --- |
| [1 month after 2027-01-31](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+month+after+2027-01-31&ref=2027-01-01) | 2027-01-01 | Sunday, February 28, 2027 | February 2027 has 28 days: the month's last day |
| [1 month after 2028-01-31](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+month+after+2028-01-31&ref=2027-01-01) | 2027-01-01 | Tuesday, February 29, 2028 | 2028 is a leap year: February 29 |
| [1 month before 2027-03-31](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+month+before+2027-03-31&ref=2027-01-01) | 2027-01-01 | Sunday, February 28, 2027 | Going back also clamps to the month's last day |
| [1 year after 2028-02-29](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+year+after+2028-02-29&ref=2027-01-01) | 2027-01-01 | Wednesday, February 28, 2029 | No February 29 in 2029: February 28 |
| [1 quarter after 2027-08-31](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+quarter+after+2027-08-31&ref=2027-01-01) | 2027-01-01 | Tuesday, November 30, 2027 | November has 30 days |
| [end of February 2028](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=end+of+February+2028&ref=2027-01-01) | 2027-01-01 | Tuesday, February 29, 2028 | Leap-year month end |
| [1 business day after 2027-07-02](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+business+day+after+2027-07-02&ref=2027-01-01) | 2027-01-01 | Tuesday, July 6, 2027 | July 4, 2027 is a Sunday, observed Monday, July 5 |
| [1 business day after 2027-06-17](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+business+day+after+2027-06-17&ref=2027-01-01) | 2027-01-01 | Monday, June 21, 2027 | Juneteenth 2027 is a Saturday, observed Friday, June 18 |
| [1 business day after 2027-12-23](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+business+day+after+2027-12-23&ref=2027-01-01) | 2027-01-01 | Monday, December 27, 2027 | Christmas 2027 is a Saturday, observed Friday, December 24 |
| [1 business day after 2027-12-30](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+business+day+after+2027-12-30&ref=2027-01-01) | 2027-01-01 | Monday, January 3, 2028 | New Year's Day 2028 is a Saturday, observed Friday, December 31, 2027 |
| [10 business days after 2026-11-20](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=10+business+days+after+2026-11-20&ref=2026-11-01) | 2026-11-01 | Monday, December 7, 2026 | Thanksgiving, November 26, 2026, is skipped |
| [2026-12-31](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=2026-12-31&ref=2026-11-01) | 2026-11-01 | Thursday, December 31, 2026 | ISO week 53 of 2026 |
| [2027-01-01](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=2027-01-01&ref=2026-11-01) | 2026-11-01 | Friday, January 1, 2027 | Still ISO week 53 of 2026: ISO years start on a Monday |
| [next Friday](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=next+Friday&ref=2026-11-06) | 2026-11-06 | Friday, November 13, 2026 | Said on a Friday: a week later on both readings |
| [March 3](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=March+3&ref=2026-11-07) | 2026-11-07 | Wednesday, March 3, 2027 | No year given: the next March 3 |

## The rules behind them

- Months, quarters and years keep the day of the month, or the month's last day when the month is shorter.
- US business days skip the federal holidays of 5 U.S.C. 6103 on the days OPM observes them: a Saturday holiday on the Friday before, a Sunday holiday on the Monday after. That includes New Year's Day on a Saturday, observed on December 31 of the year before.
- ISO 8601 weeks start on Monday; week 1 is the week with the year's first Thursday, so the first days of January can belong to the last week of the year before.
- The start day is never counted.

## Sources

- [OPM: Federal holidays (read November 7, 2026)](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)
- [5 U.S.C. 6103: Holidays](https://www.law.cornell.edu/uscode/text/5/6103)
- [ISO 8601: Date and time format](https://www.iso.org/iso-8601-date-and-time-format.html)

## Questions

### What is one month after January 31?

The last day of February: Sunday, February 28, 2027 in 2027, and Tuesday, February 29, 2028 in the leap year 2028. The day of the month is kept when the month has it, otherwise the month's last day is used.

### What is one year after February 29, 2028?

Wednesday, February 28, 2029, because 2029 has no February 29.

### Which ISO week is January 1, 2027 in?

Week 53 of 2026 (2026-W53): ISO weeks start on Monday and week 1 is the week with the year's first Thursday.

## Related

- [What "next Friday" means](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/next-friday-meaning/)
- [Date resolver API and MCP](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/api/)
- [US federal holidays and business days](https://krishnachagti-sudo.github.io/toll-preview/business-days/)
- [Leap day 2028](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/leap-day-2028/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/date-resolver/date-arithmetic-traps/  
Data as of: 2026-11-07  
CSV: https://krishnachagti-sudo.github.io/toll-preview/date-resolver/date-arithmetic-traps.csv
