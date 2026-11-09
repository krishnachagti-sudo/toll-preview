# Amortize prepaid expenses in QuickBooks Online

QuickBooks Online has no amortization schedule, so a $12,000.00 annual policy means 12 monthly journal entries of $1,000.00 (debit the insurance expense, credit Prepaid expenses); the import file posts all 12 at once, 24 lines, instead of a recurring entry you must remember to stop.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0AProperty+insurance+policy%2CPrepaid%2C12000.00%2C2027-01-01%2C12%2C%2C%2C%2CPrepaid+expenses%2CProperty+insurance+expenses%2C%2CHartwell+Mutual%2C%2C%2C%2C%2C%2C%0D%0A&period=2027-01&from=2027-01&to=2027-12)

## Intuit's entries

- When paid: "Debit: Prepaid expenses $12,000", credit the bank.
- Each month: "Debit: Property insurance expenses $1,000", credit Prepaid expenses.
- Intuit: "you amortize the insurance evenly as you consume the coverage".

The policy, month by month

| Month | Amortized | Balance at month end |
| --- | ---: | ---: |
| January 2027 | $1,000.00 | $11,000.00 |
| February 2027 | $1,000.00 | $10,000.00 |
| March 2027 | $1,000.00 | $9,000.00 |
| April 2027 | $1,000.00 | $8,000.00 |
| May 2027 | $1,000.00 | $7,000.00 |
| June 2027 | $1,000.00 | $6,000.00 |
| July 2027 | $1,000.00 | $5,000.00 |
| August 2027 | $1,000.00 | $4,000.00 |
| September 2027 | $1,000.00 | $3,000.00 |
| October 2027 | $1,000.00 | $2,000.00 |
| November 2027 | $1,000.00 | $1,000.00 |
| December 2027 | $1,000.00 | $0.00 |

## The import file

```csv
Journal No.,Journal Date,Account Name,Debits,Credits,Description,Name
AM-20270131,01/31/2027,Property insurance expenses,1000.00,,"Property insurance policy: amortization, January 2027 (1 of 12)",Hartwell Mutual
AM-20270131,01/31/2027,Prepaid expenses,,1000.00,"Property insurance policy: amortization, January 2027 (1 of 12)",Hartwell Mutual
AM-20270228,02/28/2027,Property insurance expenses,1000.00,,"Property insurance policy: amortization, February 2027 (2 of 12)",Hartwell Mutual
AM-20270228,02/28/2027,Prepaid expenses,,1000.00,"Property insurance policy: amortization, February 2027 (2 of 12)",Hartwell Mutual
AM-20270331,03/31/2027,Property insurance expenses,1000.00,,"Property insurance policy: amortization, March 2027 (3 of 12)",Hartwell Mutual
AM-20270331,03/31/2027,Prepaid expenses,,1000.00,"Property insurance policy: amortization, March 2027 (3 of 12)",Hartwell Mutual
... 18 more lines
```

- Columns Intuit lists: Journal No., Journal Date, Account Name, Journal/Description, Debits, Credits. The file adds Name; map Description to the journal description when QuickBooks asks.
- Steps: Open Settings, then go to Import Data. Select Journal Entries. Select Browse, choose your CSV file, then Open and Next. Map your spreadsheet headers to the QuickBooks fields. Select Next, then Start import, then Done.
- A sub-account is written Parent:Sub. Intuit: "Only entering the sub account name will cause a "Line Account Invalid" error."

## Sources

- [Intuit QuickBooks: Prepaid expenses and amortization, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/expense-accounting/prepaid-expenses-amortization/L0aBbAeMQ_US_en_US)
- [Intuit QuickBooks: Import journal entries into QuickBooks Online, updated August 4, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)
- [Intuit QuickBooks: Does QuickBooks Online have an amortization schedule?, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/journal-entries/does-quickbooks-online-have-an-amortization-schedule/00/185786)

## Questions

### Should I use a recurring journal entry instead?

Intuit suggests one: "Set up a recurring journal entry to automate the amortization." It works when every month is the same amount; it does not stop itself unless you set an end, and a mid-month start or daily proration changes the first and last months.

## Related

- [QuickBooks recurring journal compared](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/quickbooks-recurring-journal/)
- [The import file layout](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/journal-entry-import-layout/)
- [Prepaid insurance journal entry](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/prepaid-insurance-journal-entry/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/quickbooks-online/  
Data as of: 2026-11-08
