# Add days, months or years to a date in Excel and Google Sheets

Add days with =A2+90 and months with =EDATE(A2,1); =EOMONTH(A2,0) gives the month's last day. With A2 = January 31, 2027, 90 days later is Saturday, May 1, 2027 and one month later, in the date resolver, is Sunday, February 28, 2027.

## Formulas and the answers to check them against

A2 holds Sunday, January 31, 2027. The answer column is the date resolver's.

| Formula | Same question in words | Answer | Note |
| --- | --- | --- | --- |
| `=A2+90` | [90 days after 2027-01-31](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=90+days+after+2027-01-31&ref=2027-01-31) | Saturday, May 1, 2027 | Adds days: dates are serial numbers |
| `=A2-30` | [30 days before 2027-01-31](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=30+days+before+2027-01-31&ref=2027-01-31) | Friday, January 1, 2027 | Subtracts days |
| `=EDATE(A2,1)` | [1 month after 2027-01-31](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+month+after+2027-01-31&ref=2027-01-31) | Sunday, February 28, 2027 | Month end: test this row in your sheet |
| `=EDATE(A2,3)` | [3 months after 2027-01-31](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=3+months+after+2027-01-31&ref=2027-01-31) | Friday, April 30, 2027 | Month end: test this row in your sheet |
| `=EDATE(A2,12)` | [1 year after 2027-01-31](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+year+after+2027-01-31&ref=2027-01-31) | Monday, January 31, 2028 | Twelve months |
| `=EOMONTH(A2,0)` | [end of January 2027](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=end+of+January+2027&ref=2027-01-31) | Sunday, January 31, 2027 | Last day of the same month |
| `=EOMONTH(A2,1)` | [end of February 2027](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=end+of+February+2027&ref=2027-01-31) | Sunday, February 28, 2027 | Last day of the next month |

## What do Excel and Google say EDATE does?

Microsoft describes EDATE as returning "the serial number that represents the date that is the indicated number of months before or after a specified date", returning #VALUE! when the start date is not a valid date, and truncating a non-integer number of months. Google's EDATE help says the same about truncation and asks for a real date, a date function or a serial number as the start date. Neither page has an example at a month end, so check January 31 plus one month in your own file before you rely on it.

Microsoft recommends EOMONTH "to calculate maturity dates or due dates that fall on the last day of the month"; its example gives February 28, 2011 for =EOMONTH(A2,1) with A2 = January 1, 2011.

## Why does my date formula show a number or an error?

- A number such as 46418: the cell is formatted as a number. Format it as a date.
- #VALUE! from EDATE: the start date is text, not a date. Rebuild it with DATE(year, month, day).
- A wrong date in Google Sheets: its EDATE help notes that 10/10/2000 typed into a formula is read as a division.

## When a formula is not enough

Phrases such as "10 business days after next Friday" or "last business day of this quarter" need weekday rules and a holiday calendar. The [date resolver](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/) reads the phrase and returns the date with its working; from code or a spreadsheet, call its [API](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/api/).

## Check a formula's answer

[Resolve it in the tool](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/?text=1+month+after+2027-01-31&ref=2027-01-31&region=US)

## Sources

- [Microsoft Support: EDATE function (read November 8, 2026)](https://support.microsoft.com/en-us/office/edate-function-3c920eb2-6e66-44e7-a1f5-753ae47ee4f5)
- [Microsoft Support: EOMONTH function (read November 8, 2026)](https://support.microsoft.com/en-us/office/eomonth-function-7314ffa1-2bc9-4005-9d66-f49db127d628)
- [Google Docs Editors Help: EDATE (read November 8, 2026)](https://support.google.com/docs/answer/3092974)

## Steps

1. **Put a real date in A2.** Type it as a date or build it with =DATE(2027,1,31); a date stored as text gives #VALUE! or a wrong answer.
2. **Add days.** Use =A2+90 for 90 days later, =A2-30 for 30 days earlier, or =TODAY()+90 from today.
3. **Add months or years.** Use =EDATE(A2,1) for one month, =EDATE(A2,12) for a year; a negative number goes back.
4. **Get a month end.** Use =EOMONTH(A2,0) for the end of the same month, =EOMONTH(A2,1) for the end of the next.
5. **Format the cell as a date.** The result is a serial number until the cell has a date format.

## Questions

### How do I add 90 days to a date in Excel?

=A2+90. Excel stores dates as serial numbers, so adding 90 adds 90 days. With A2 = January 31, 2027, the answer is Saturday, May 1, 2027.

### How do I add months to a date?

=EDATE(A2, months) in both Excel and Google Sheets. Both help pages say a non-integer number of months is truncated, so 2.6 months is 2.

### What is January 31 plus one month?

The date resolver answers Sunday, February 28, 2027: the day is kept when the month has it, otherwise the month's last day. Microsoft's and Google's EDATE pages do not describe month ends, so check that case in your own sheet.

### How do I add business days instead?

Use WORKDAY(start, days, holidays), which skips weekends and the holidays you list.

## Related

- [Add business days in Excel (WORKDAY)](https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-workday/)
- [Google Sheets NETWORKDAYS and WORKDAY](https://krishnachagti-sudo.github.io/toll-preview/business-days/google-sheets-networkdays/)
- [Use Endwise in Excel](https://krishnachagti-sudo.github.io/toll-preview/guides/excel/)
- [End of month dates in 2027](https://krishnachagti-sudo.github.io/toll-preview/date-resolver/end-of-month-dates-2027/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/date-resolver/add-months-to-a-date-excel-google-sheets/  
Data as of: 2026-11-08
