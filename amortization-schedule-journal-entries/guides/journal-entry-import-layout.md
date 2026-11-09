# Journal entry import file layout for QuickBooks Online and Xero

QuickBooks Online's journal import reads 6 columns (Journal No., Journal Date, Account Name, Journal/Description, Debits, Credits); Xero's manual journal import reads Narration, Date, Description, AccountCode, TaxRate, Amount, TrackingName\[X\], TrackingOption\[X\], with debits positive, credits negative and at most 300 lines a file; November 2026 for the two worked schedules is 4 lines in either.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0AAnnual+liability+policy%2CPrepaid%2C1200.00%2C2026-11-01%2C12%2C%2C%2C%2CPrepaid+Insurance%2CInsurance+Expense%2C%2C%2C%2C%2C%2C%2C%2C%0D%0AAnnual+contract+invoiced+Nov+15%2CDeferred+revenue%2C18000.00%2C2026-11-15%2C12%2C%2C%2C%2CDeferred+Revenue%2CSubscription+Revenue%2C%2CWestbrook+Partners%2C%2C%2C%2C%2C%2C%0D%0A&period=2026-11&from=2026-11&to=2026-11)

## QuickBooks Online

- Columns Intuit lists: Journal No., Journal Date, Account Name, Journal/Description, Debits, Credits. The tool writes Journal No., Journal Date, Account Name, Debits, Credits, Description, Name; QuickBooks asks you to map each heading on import.
- File: "We'll show you how to use a CSV file."
- Accounts: "If your spreadsheet has new accounts, be sure to add them in your chart of accounts before importing."
- One Journal No. per journal: the tool numbers them AM-YYYYMMDD, one per date, each balanced.
- Names: lines to Accounts Payable or Receivable need a customer or vendor; Intuit says "the system will request the Name column to have a vendor selected".

```csv
Journal No.,Journal Date,Account Name,Debits,Credits,Description,Name
AM-20261130,11/30/2026,Insurance Expense,100.00,,"Annual liability policy: amortization, November 2026 (1 of 12)",
AM-20261130,11/30/2026,Prepaid Insurance,,100.00,"Annual liability policy: amortization, November 2026 (1 of 12)",
AM-20261130,11/30/2026,Deferred Revenue,1500.00,,"Annual contract invoiced Nov 15: revenue earned, November 2026 (1 of 12)",Westbrook Partners
AM-20261130,11/30/2026,Subscription Revenue,,1500.00,"Annual contract invoiced Nov 15: revenue earned, November 2026 (1 of 12)",Westbrook Partners
```

## Xero

- Fields: Narration, Date, Description, AccountCode, TaxRate, Amount, TrackingName\[X\], TrackingOption\[X\]. Download Xero's own template from the import screen and keep its headings: "Don't change any of the column headings in the template file, as this causes the import to fail."
- One journal over several rows: "If you leave both the date and narration cells blank, Xero treats that row as belonging to the same journal as the row above it."
- Dates: "The date format needs to be either mmm dd yyyy or mm/dd/yyyy." The tool writes mm/dd/yyyy.
- Accounts: "When importing, just enter the account code, don't include the account name."
- Amounts: "When importing, enter debits amounts as positives and credits as negative numbers."
- Size: "you can import up to 300 lines in one template file"; the tool starts a new file before a journal would cross 300 lines.
- Currency: "you can only add manual journals in your base currency".

```csv
Narration,Date,Description,AccountCode,TaxRate,Amount,TrackingName1,TrackingOption1,TrackingName2,TrackingOption2
"Schedule entries November 30, 2026 (AM-20261130)",11/30/2026,"Annual liability policy: amortization, November 2026 (1 of 12)",433,,100.00,,,,
,,"Annual liability policy: amortization, November 2026 (1 of 12)",620,,-100.00,,,,
,,"Annual contract invoiced Nov 15: revenue earned, November 2026 (1 of 12)",835,,1500.00,,,,
,,"Annual contract invoiced Nov 15: revenue earned, November 2026 (1 of 12)",200,,-1500.00,,,,
```

## Common import errors

What each one means

| Error or symptom | Cause | Fix |
| --- | --- | --- |
| Line Account Invalid (QuickBooks Online) | A sub-account without its parent, or an account not in the chart | Write Parent:Sub; add the account first |
| Duplicate journal number (QuickBooks Online) | The setting "Warn if duplicate journal number is used" is on | Change the prefix |
| Import fails at once (Xero) | A changed column heading | Paste the rows under Xero's downloaded headings |
| Draft will not post (Xero) | No tax rate, or debits not equal to credits | Add the tax rate; check the journal totals |
| Wrong account (Xero) | An account name instead of a code | Use codes such as 200 |

## Sources

- [Intuit QuickBooks: Import journal entries into QuickBooks Online, updated August 4, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)
- [Xero Central: Add, import and post manual journals (US) (read November 8, 2026)](https://central.xero.com/s/article/Add-import-and-post-manual-journals-US)

## Questions

### Why does QuickBooks say "Line Account Invalid"?

Usually a sub-account written alone. Intuit: "Only entering the sub account name will cause a "Line Account Invalid" error." Write Parent:Sub.

### Why will my Xero import not post?

Two common causes: "You can import a template file with no tax rate entered, but you need to add this before you can post the journal in Xero." And "The total debits must equal the total credits before you can post the journal."

## Related

- [Prepaids in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/quickbooks-online/)
- [Xero repeating journals compared](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/xero-repeating-journals/)
- [Dancing Numbers compared](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/dancing-numbers/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/journal-entry-import-layout/  
Data as of: 2026-11-08
