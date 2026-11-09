# Compared with a prepaid spreadsheet

A prepaid spreadsheet in the shape Ramp describes (identification, accounts, term, calculation) gives a $12,000.00 subscription from June 16 $500.00 in the first June, $1,000.00 in each of the next 11 months and $500.00 in the last; the tool computes the same schedule and adds the journal entries, the import file and the GL tie-out.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0A%22Subscription%2C+June+16+to+June+15%22%2CPrepaid%2C12000.00%2C2026-06-16%2C12%2C%2Chalf-month%2C%2CPrepaid+Expenses%2CSoftware+Subscriptions%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A&period=2026-06)

## Side by side

The spreadsheet's side from Ramp's guide, read November 8, 2026

|  | Spreadsheet (Ramp's described shape) | This tool |
| --- | --- | --- |
| Columns | Identification, Accounts, Term, Calculation | The same, plus method, paid-on date and cancellation |
| Partial months | When a term starts mid-month, the first and last months are prorated under the team's policy. | Equal months, half-month or actual days, per row |
| Rounding | Not addressed in the guide | Each month to the cent; the last month takes the difference |
| Journal entries | Typed from the sheet | Balanced journals per date, and the import file |
| Tie-out | A check cell you build | Rollforward per account against the GL balance you give |
| Cost | Free | Preview free; $0.50 per schedule for the entries, free re-runs for 12 months |

Ramp's example, computed

| Month | Amortized | Balance at month end |
| --- | ---: | ---: |
| June 2026 | $500.00 | $11,500.00 |
| July 2026 | $1,000.00 | $10,500.00 |
| August 2026 | $1,000.00 | $9,500.00 |
| September 2026 | $1,000.00 | $8,500.00 |
| October 2026 | $1,000.00 | $7,500.00 |
| November 2026 | $1,000.00 | $6,500.00 |
| December 2026 | $1,000.00 | $5,500.00 |
| January 2027 | $1,000.00 | $4,500.00 |
| February 2027 | $1,000.00 | $3,500.00 |
| March 2027 | $1,000.00 | $2,500.00 |
| April 2027 | $1,000.00 | $1,500.00 |
| May 2027 | $1,000.00 | $500.00 |
| June 2027 | $500.00 | $0.00 |

## When the spreadsheet is better

- A team comfortable owning a template, with a few items that rarely change.
- You need columns the tool does not have, such as a department split per item.

## When the tool adds something

- Many items, many clients: the same rows give every month's entries and an import file.
- Rounding and partial months worked the same way every time.
- A rollforward that says which account is off and by how much.

## Sources

- [Ramp: Prepaid amortization schedule (read November 8, 2026)](https://ramp.com/answers/accruals-recurring-schedules/prepaid-amortization-schedule)

## Related

- [Excel template compared](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/excel-prepaid-template/)
- [The prepaid expense template](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/template/)
- [Daily vs monthly proration](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/daily-vs-monthly-proration/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/spreadsheet/  
Data as of: 2026-11-08
