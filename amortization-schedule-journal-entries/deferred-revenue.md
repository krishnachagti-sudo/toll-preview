# Deferred revenue schedule with monthly journal entries

Deferred revenue moves to revenue as the service is delivered: for these 3 annual and six-month contracts, January 2027's entry is debit Deferred Revenue $3,415.34 and credit revenue $3,415.34, leaving $31,948.50 deferred at January 31, 2027.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0ANorthgate+annual+plan%2CDeferred+revenue%2C24000.00%2C2027-01-01%2C12%2C%2C%2C%2CDeferred+Revenue%2CSubscription+Revenue%2C%2CNorthgate+Clinics%2C%2C%2C%2C%2C%2C%0D%0A%22Larkspur+support%2C+from+Nov+15%22%2CDeferred+revenue%2C9600.00%2C2026-11-15%2C%2C2027-11-14%2Cdaily%2C%2CDeferred+Revenue%2CSupport+Revenue%2C%2CLarkspur+Studio%2C%2C%2C%2C%2C%2C%0D%0A%22Orchard+onboarding%2C+6+months%22%2CDeferred+revenue%2C3600.00%2C2026-12-01%2C6%2C%2C%2C%2CDeferred+Revenue%2CService+Revenue%2C%2COrchard+Dental%2C%2C%2C%2C%2C%2C%0D%0A&period=2027-01&from=2026-11&to=2027-12)

## The entries

When the annual plan is invoiced

| Account | Debit | Credit |
| --- | ---: | ---: |
| Checking | $24,000.00 |  |
| Deferred Revenue |  | $24,000.00 |

Each month end while it is delivered

| Account | Debit | Credit |
| --- | ---: | ---: |
| Deferred Revenue | $2,000.00 |  |
| Subscription Revenue |  | $2,000.00 |

## The waterfall

Revenue recognized per contract and month, and the balance left at December 31, 2027

| Item | November 2026 | December 2026 | January 2027 | February 2027 | March 2027 | April 2027 | May 2027 | June 2027 | July 2027 | August 2027 | September 2027 | October 2027 | November 2027 | December 2027 | Balance December 31, 2027 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Northgate annual plan | 0.00 | 0.00 | 2000.00 | 2000.00 | 2000.00 | 2000.00 | 2000.00 | 2000.00 | 2000.00 | 2000.00 | 2000.00 | 2000.00 | 2000.00 | 2000.00 | 0.00 |
| Larkspur support, from Nov 15 | 420.82 | 815.34 | 815.34 | 736.44 | 815.34 | 789.04 | 815.34 | 789.04 | 815.34 | 815.34 | 789.04 | 815.34 | 368.24 | 0.00 | 0.00 |
| Orchard onboarding, 6 months | 0.00 | 600.00 | 600.00 | 600.00 | 600.00 | 600.00 | 600.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

The Larkspur contract runs by actual days from November 15, 2026: $420.82 for the 16 days of November, then each month by its days. The other two use equal months.

## Scope

This is straight-line arithmetic on the dates you give. When revenue is earned under ASC 606 (performance obligations, usage, milestones) is a judgement for your accountant; the tool spreads what you tell it to spread.

## Sources

- [Intuit QuickBooks: Import journal entries into QuickBooks Online, updated August 4, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)
- [Xero Central: Add, import and post manual journals (US) (read November 8, 2026)](https://central.xero.com/s/article/Add-import-and-post-manual-journals-US)

## Questions

### What is the journal entry for deferred revenue each month?

Debit Deferred Revenue and credit the revenue account for the part earned that month: $2,000.00 a month on the $24,000.00 Northgate annual plan.

### What is a deferred revenue waterfall?

A table with one row per contract and one column per month: each cell is the revenue recognized that month, and the last column is what is still deferred. The table below is one.

## Related

- [Deferred revenue for a 12-month contract](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/deferred-revenue-12-month-contract/)
- [The deferred revenue template](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/deferred-revenue/template/)
- [Compared with Zenskar's calculator](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/zenskar-deferred-revenue-calculator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/deferred-revenue/  
Data as of: 2026-11-08
