# A prepaid cancelled mid-term

A $3,600.00 12-month prepaid cancelled on November 20, 2026 has $2,100.00 left after November's amortization: with a $1,000.00 refund, debit Checking $1,000.00 and write off $1,100.00 to expense; with no refund, the whole $2,100.00 is written off.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0AEquipment+service+contract%2CPrepaid%2C3600.00%2C2026-07-01%2C12%2C%2C%2C%2CPrepaid+Expenses%2CRepairs+and+Maintenance%2CChecking%2CApex+Service+Co%2C%2C%2C%2C%2C2026-11-20%2C1000.00%0D%0A&period=2026-11)

## With a refund

Cancellation, November 20, 2026, $1,000.00 refunded

| Account | Debit | Credit |
| --- | ---: | ---: |
| Checking | $1,000.00 |  |
| Repairs and Maintenance | $1,100.00 |  |
| Prepaid Expenses |  | $2,100.00 |

## With no refund

Cancellation, November 20, 2026, nothing refunded

| Account | Debit | Credit |
| --- | ---: | ---: |
| Repairs and Maintenance | $2,100.00 |  |
| Prepaid Expenses |  | $2,100.00 |

## The revised schedule

Amortization to the cancellation, then cleared

| Month | Amortized | Balance at month end |
| --- | ---: | ---: |
| July 2026 | $300.00 | $3,300.00 |
| August 2026 | $300.00 | $3,000.00 |
| September 2026 | $300.00 | $2,700.00 |
| October 2026 | $300.00 | $2,400.00 |
| November 2026 | $300.00 | $2,100.00 |
| November 2026 (cancelled) | $2,100.00 | $0.00 |

November is amortized in full under equal months (the month was used); with actual days only the days to the 20th would be. Later months stop: there is nothing left to amortize. A refund still owed at month end is a receivable rather than cash; put that account in the cash column.

## For the file

- The cancellation notice or email with its date.
- The refund calculation from the vendor, and the deposit when it arrives.
- The revised schedule showing the write-off.

## Sources

Arithmetic only; the prepaid entries follow Intuit's example:

- [Intuit QuickBooks: Prepaid expenses and amortization, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/expense-accounting/prepaid-expenses-amortization/L0aBbAeMQ_US_en_US)

## Related

- [Prepaid expense schedule](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/)
- [Month-end rollforward checklist](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/prepaid-rollforward-checklist/)
- [Deferred revenue for a 12-month contract](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/deferred-revenue-12-month-contract/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/prepaid-cancelled-mid-term/  
Data as of: 2026-11-08
