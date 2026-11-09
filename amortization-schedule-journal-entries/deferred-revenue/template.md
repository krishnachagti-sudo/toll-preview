# Deferred revenue schedule template

The template lists each contract's amount, start and term; its month columns give the revenue recognized: for these 5 contracts, $3,062.12 in November 2026 and $44,537.88 still deferred at November 30, 2026, and uploading the filled CSV to the tool returns the journal entries and an import file.

## Upload this template to the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0ANorthgate+annual+plan%2CDeferred+revenue%2C24000.00%2C2027-01-01%2C12%2C%2C%2C%2CDeferred+Revenue%2CSubscription+Revenue%2C%2CNorthgate+Clinics%2C%2C%2C%2C%2C%2C%0D%0A%22Larkspur+support%2C+from+Nov+15%22%2CDeferred+revenue%2C9600.00%2C2026-11-15%2C%2C2027-11-14%2Cdaily%2C%2CDeferred+Revenue%2CSupport+Revenue%2C%2CLarkspur+Studio%2C%2C%2C%2C%2C%2C%0D%0A%22Orchard+onboarding%2C+6+months%22%2CDeferred+revenue%2C3600.00%2C2026-12-01%2C6%2C%2C%2C%2CDeferred+Revenue%2CService+Revenue%2C%2COrchard+Dental%2C%2C%2C%2C%2C%2C%0D%0APinecrest+two-year+plan%2CDeferred+revenue%2C36000.00%2C2026-09-01%2C24%2C%2C%2C%2CDeferred+Revenue%2CSubscription+Revenue%2C%2CPinecrest+Schools%2C%2C%2C%2C%2C%2C%0D%0AHarbor+training+block%2CDeferred+revenue%2C5000.00%2C2026-11-10%2C%2C2027-02-09%2Cdaily%2C%2CDeferred+Revenue%2CTraining+Revenue%2C%2CHarbor+Logistics%2C%2C%2C%2C%2C%2C%0D%0A&period=2026-11&from=2026-11&to=2027-12)

## The template, filled in

Columns: Item, Type, Amount, Start, Months, End, Method, Paid on, Balance account, PL account, Cash account, Name, Rate, Payment, First payment, Day count, Cancel on, Refund, then one per month

| Item | Amount | Start | Term | Method | November 2026 | December 2026 | January 2027 | February 2027 | March 2027 | April 2027 |
| --- | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Northgate annual plan | 24000.00 | 2027-01-01 | 12 months | monthly | 0.00 | 0.00 | 2000.00 | 2000.00 | 2000.00 | 2000.00 |
| Larkspur support, from Nov 15 | 9600.00 | 2026-11-15 | to 2027-11-14 | daily | 420.82 | 815.34 | 815.34 | 736.44 | 815.34 | 789.04 |
| Orchard onboarding, 6 months | 3600.00 | 2026-12-01 | 6 months | monthly | 0.00 | 600.00 | 600.00 | 600.00 | 600.00 | 600.00 |
| Pinecrest two-year plan | 36000.00 | 2026-09-01 | 24 months | monthly | 1500.00 | 1500.00 | 1500.00 | 1500.00 | 1500.00 | 1500.00 |
| Harbor training block | 5000.00 | 2026-11-10 | to 2027-02-09 | daily | 1141.30 | 1684.78 | 1684.78 | 489.14 | 0.00 | 0.00 |

The CSV mirror of this page carries all 33 columns: the 18 input columns, 14 months from November 2026 to December 2027, and the balance left.

## Tie it to the GL

At each month end the deferred revenue account in the GL should equal the template's remaining balance: $44,537.88 at November 30, 2026 for these rows. Give the tool the GL balance and it shows the difference.

## Sources

Computed by the tool's engine; the import layouts it produces come from:

- [Intuit QuickBooks: Import journal entries into QuickBooks Online, updated August 4, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)
- [Xero Central: Add, import and post manual journals (US) (read November 8, 2026)](https://central.xero.com/s/article/Add-import-and-post-manual-journals-US)

## Questions

### How do I use the template?

Download the CSV (the link under the table), open it in Excel or Google Sheets, replace the rows with your own (Item, Type, Amount, Start, Months or End, Method and the accounts), and upload it to the tool. The month columns can stay; the tool ignores them and works the schedule out again.

### Why does the last month differ by a cent?

Every month is rounded to the cent and the last month takes the difference, so the balance ends at exactly zero.

## Related

- [Deferred revenue schedule](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/deferred-revenue/)
- [The prepaid expense template](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/template/)
- [Compared with Zenskar's calculator](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/zenskar-deferred-revenue-calculator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/deferred-revenue/template/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/deferred-revenue/template.csv
