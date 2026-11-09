# Deferred revenue for a 12-month contract

An $18,000.00 annual invoice is credited to Deferred Revenue and released $1,500.00 a month with equal months; starting on November 15, the half-month convention releases $750.00 in November and actual days $789.04, and a cancellation after April 2027 with a $4,000.00 refund recognizes the other $5,000.00 at once.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0AAnnual+contract+invoiced+Nov+15%2CDeferred+revenue%2C18000.00%2C2026-11-15%2C12%2C%2C%2C%2CDeferred+Revenue%2CSubscription+Revenue%2C%2CWestbrook+Partners%2C%2C%2C%2C%2C%2C%0D%0A&period=2026-11&from=2026-11&to=2027-11)

## The invoice and the monthly entry

With receivables: debit Accounts Receivable, credit Deferred Revenue when invoiced. The tool's initial entry assumes it is paid at once (debit the bank); either way the deferred balance is the same.

Each month end

| Account | Debit | Credit |
| --- | ---: | ---: |
| Deferred Revenue | $1,500.00 |  |
| Subscription Revenue |  | $1,500.00 |

## A first and last partial month

Starting November 15, 2026, by convention

| Convention | November 2026 | December 2026 | Last month | Months |
| --- | ---: | ---: | ---: | ---: |
| equal months (the start month counts in full) | $1,500.00 | $1,500.00 | $1,500.00 (October 2027) | 12 |
| half-month (half a month in the first and last month) | $750.00 | $1,500.00 | $750.00 (November 2027) | 13 |
| actual days in each month | $789.04 | $1,528.77 | $690.40 (November 2027) | 13 |

## Upgrades, credits and cancellations

- An upgrade billed mid-term: a new row from the upgrade date to the end of the term.
- A credit note that ends the contract early: set the last day of service and put the credit in the refund column; the rest is recognized at once.
- Cancelled after April 30, 2027 with $4,000.00 refunded: April is recognized as usual, then Deferred Revenue is debited $9,000.00, the bank credited $4,000.00 and revenue $5,000.00.

## Scope

This page explains arithmetic. When revenue is earned under the revenue recognition standard that applies to the business (ASC 606 in the US) is a judgement this tool does not make.

## Sources

Arithmetic only. The import layouts the tool writes:

- [Intuit QuickBooks: Import journal entries into QuickBooks Online, updated August 4, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)
- [Xero Central: Add, import and post manual journals (US) (read November 8, 2026)](https://central.xero.com/s/article/Add-import-and-post-manual-journals-US)

## Questions

### How do I recognize deferred revenue monthly?

Credit Deferred Revenue when invoiced, then each month debit it and credit revenue for the month's share: $1,500.00 a month on $18,000.00 with equal months.

## Related

- [Deferred revenue schedule](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/deferred-revenue/)
- [The deferred revenue template](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/deferred-revenue/template/)
- [Daily vs monthly proration](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/daily-vs-monthly-proration/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/deferred-revenue-12-month-contract/  
Data as of: 2026-11-08
