# Prepaid expense amortization schedule and journal entries

A $9,000.00 prepaid over 12 months amortizes $750.00 per month, so this month's entry is: debit Software Subscriptions $750.00, credit Prepaid Expenses $750.00. The remaining balance after November 2026 is $8,250.00.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0AAnnual+software+subscription%2CPrepaid%2C9000.00%2C2026-11-01%2C12%2C%2C%2C%2CPrepaid+Expenses%2CSoftware+Subscriptions%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A&period=2026-11)

## The entries

When paid, November 1, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Prepaid Expenses | $9,000.00 |  |
| Checking |  | $9,000.00 |

Each month end, from November 30, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Software Subscriptions | $750.00 |  |
| Prepaid Expenses |  | $750.00 |

## The schedule

$9,000.00 over 12 months, equal months

| Month | Amortized | Balance at month end |
| --- | ---: | ---: |
| November 2026 | $750.00 | $8,250.00 |
| December 2026 | $750.00 | $7,500.00 |
| January 2027 | $750.00 | $6,750.00 |
| February 2027 | $750.00 | $6,000.00 |
| March 2027 | $750.00 | $5,250.00 |
| April 2027 | $750.00 | $4,500.00 |
| May 2027 | $750.00 | $3,750.00 |
| June 2027 | $750.00 | $3,000.00 |
| July 2027 | $750.00 | $2,250.00 |
| August 2027 | $750.00 | $1,500.00 |
| September 2027 | $750.00 | $750.00 |
| October 2027 | $750.00 | $0.00 |

## A mid-month start

The same $9,000.00 starting November 17, 2026 posts differently by convention. Pick one and use it for every prepaid; the tool takes monthly, half-month or daily per schedule.

First three months and the last, starting November 17, 2026

| Convention | First month | Second | Third | Last month | Months |
| --- | ---: | ---: | ---: | ---: | ---: |
| equal months (the start month counts in full) | $750.00 (November 2026) | $750.00 | $750.00 | $750.00 (October 2027) | 12 |
| half-month (half a month in the first and last month) | $375.00 (November 2026) | $750.00 | $750.00 | $375.00 (November 2027) | 13 |
| actual days in each month | $345.21 (November 2026) | $764.38 | $764.38 | $394.53 (November 2027) | 13 |

Why they differ, with a policy starting on the 17th: [daily vs monthly proration](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/daily-vs-monthly-proration/). Equipment and other fixed assets are depreciated instead: see [the depreciation journal entry](https://krishnachagti-sudo.github.io/toll-preview/macrs-depreciation/depreciation-journal-entry/).

## Sources

- [Intuit QuickBooks: Prepaid expenses and amortization, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/expense-accounting/prepaid-expenses-amortization/L0aBbAeMQ_US_en_US)
- [eCFR: 26 CFR 1.263(a)-4(f), the 12-month rule (up to date as of November 5, 2026) (read November 8, 2026)](https://www.ecfr.gov/current/title-26/chapter-I/subchapter-A/part-1/section-1.263%28a%29-4)

## Questions

### Do you amortize prepaid expenses?

Yes, for the books: a prepaid is an asset expensed as it is used. Intuit's example: "you amortize the insurance evenly as you consume the coverage", "Debit: Property insurance expenses $1,000" each month on a $12,000 policy.

### Can a prepaid be deducted for tax when it is paid?

Under the 12-month rule, 26 CFR 1.263(a)-4(f)(1) does not require capitalizing a benefit that does not extend beyond the earlier of "12 months after the first date on which the taxpayer realizes the right or benefit" and "The end of the taxable year following the taxable year in which the payment is made." For this subscription: Coverage ends October 31, 2027, not beyond November 1, 2027 (the earlier of 12 months after November 1, 2026 and the end of the tax year after the one paid in, December 31, 2027): the duration test of the 12-month rule is met. Other conditions apply; ask your tax preparer.

### Is equipment a prepaid?

No. Equipment is a fixed asset that is depreciated, not a prepaid that is amortized; its year-end entry is on the depreciation journal entry page of the MACRS tool.

## Related

- [Prepaid insurance journal entry](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/prepaid-insurance-journal-entry/)
- [Prepaids in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/quickbooks-online/)
- [The prepaid expense template](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/template/)
- [Daily vs monthly proration](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/daily-vs-monthly-proration/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/  
Data as of: 2026-11-08
