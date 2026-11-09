# Prepaid expense schedule template

The template lists each prepaid's cost, start date and term; its month columns give the amount expensed: for these 6 items, $4,303.84 in November 2026 and a prepaid balance of $23,384.65 at November 30, 2026, which must equal the GL; uploading the filled CSV to the tool returns the journal entries and an import file.

## Upload this template to the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0AGeneral+liability+policy%2CPrepaid%2C12000.00%2C2026-07-01%2C12%2C%2C%2C%2CPrepaid+Insurance%2CInsurance+Expense%2C%2C%2C%2C%2C%2C%2C%2C%0D%0AWorkers+comp+deposit+premium%2CPrepaid%2C5400.00%2C2026-10-15%2C%2C2027-10-14%2Cdaily%2C%2CPrepaid+Insurance%2CInsurance+Expense%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ADesign+software+seats%2CPrepaid%2C4380.00%2C2026-09-17%2C%2C2027-09-16%2Cdaily%2C%2CPrepaid+Expenses%2CSoftware+Subscriptions%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%22Office+rent%2C+last+month+deposit%22%2CPrepaid%2C7500.00%2C2026-11-01%2C3%2C%2C%2C%2CPrepaid+Rent%2CRent+Expense%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ATrade+show+booth%2CPrepaid%2C3200.00%2C2027-03-01%2C1%2C%2C%2C2026-11-20%2CPrepaid+Expenses%2CMarketing%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ACRM+annual+plan%2CPrepaid%2C2988.00%2C2026-12-16%2C12%2C%2Chalf-month%2C%2CPrepaid+Expenses%2CSoftware+Subscriptions%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A&period=2026-11&from=2026-11&to=2027-12)

## The template, filled in

Columns: Item, Type, Amount, Start, Months, End, Method, Paid on, Balance account, PL account, Cash account, Name, Rate, Payment, First payment, Day count, Cancel on, Refund, then one per month

| Item | Amount | Start | Term | Method | November 2026 | December 2026 | January 2027 | February 2027 | March 2027 | April 2027 |
| --- | ---: | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| General liability policy | 12000.00 | 2026-07-01 | 12 months | monthly | 1000.00 | 1000.00 | 1000.00 | 1000.00 | 1000.00 | 1000.00 |
| Workers comp deposit premium | 5400.00 | 2026-10-15 | to 2027-10-14 | daily | 443.84 | 458.63 | 458.63 | 414.25 | 458.63 | 443.84 |
| Design software seats | 4380.00 | 2026-09-17 | to 2027-09-16 | daily | 360.00 | 372.00 | 372.00 | 336.00 | 372.00 | 360.00 |
| Office rent, last month deposit | 7500.00 | 2026-11-01 | 3 months | monthly | 2500.00 | 2500.00 | 2500.00 | 0.00 | 0.00 | 0.00 |
| Trade show booth | 3200.00 | 2027-03-01 | 1 months | monthly | 0.00 | 0.00 | 0.00 | 0.00 | 3200.00 | 0.00 |
| CRM annual plan | 2988.00 | 2026-12-16 | 12 months | half-month | 0.00 | 124.50 | 249.00 | 249.00 | 249.00 | 249.00 |

The CSV mirror of this page carries all 33 columns: the 18 input columns, 14 months from November 2026 to December 2027, and the balance left.

## Tie it to the GL

At each month end the prepaid accounts in the GL should equal the template's remaining balances: Prepaid Insurance $11,704.65, Prepaid Expenses $6,680.00, Prepaid Rent $5,000.00 at November 30, 2026 for these rows. Give the tool the GL balances and it shows any difference.

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

- [Prepaid expense schedule](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/)
- [The deferred revenue template](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/deferred-revenue/template/)
- [Month-end rollforward checklist](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/prepaid-rollforward-checklist/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/template/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/template.csv
