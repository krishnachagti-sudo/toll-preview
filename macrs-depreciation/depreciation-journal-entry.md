# The year-end depreciation journal entry

Debit Depreciation Expense and credit Accumulated Depreciation for the year's total, dated the last day of the tax year: for the sample 2026 client that is $183,669.96 on December 31, 2026, split into Section 179 ($32,000.00), the special allowance ($132,600.00) and MACRS ($19,069.96).

## Open the tool with the sample client

[Open the schedule tool](https://krishnachagti-sudo.github.io/toll-preview/macrs-depreciation/?year=2026&electout=7&income=250000)

## What is the journal entry?

| Account | Debit | Credit |
| --- | ---: | ---: |
| Depreciation Expense | $183,669.96 |  |
| Accumulated Depreciation |  | $183,669.96 |

Sample client (made-up assets), tax year 2026. The schedule tool splits the debit by kind so the entry shows what the return claims:

```csv
date,journal,account,debit,credit,description
2026-12-31,DEP-2026,Depreciation Expense,32000.00,0.00,"Section 179 expense, tax year 2026"
2026-12-31,DEP-2026,Depreciation Expense,132600.00,0.00,"Special depreciation allowance, tax year 2026"
2026-12-31,DEP-2026,Depreciation Expense,19069.96,0.00,"MACRS depreciation, tax year 2026"
2026-12-31,DEP-2026,Accumulated Depreciation,0.00,183669.96,"Depreciation, tax year 2026"
```

## The QuickBooks Online layout

QuickBooks Online imports journal entries from a file with these columns: Journal No., Journal Date, Account Name, Debits, Credits, Description ([Intuit help article](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)).

```csv
Journal No.,Journal Date,Account Name,Debits,Credits,Description
DEP-2026,12/31/2026,Depreciation Expense,32000.00,,"Section 179 expense, tax year 2026"
DEP-2026,12/31/2026,Depreciation Expense,132600.00,,"Special depreciation allowance, tax year 2026"
DEP-2026,12/31/2026,Depreciation Expense,19069.96,,"MACRS depreciation, tax year 2026"
DEP-2026,12/31/2026,Accumulated Depreciation,,183669.96,"Depreciation, tax year 2026"
```

> The tax depreciation for the year. Whether your books carry tax depreciation or a separate book method is your accounting choice. QuickBooks Online maps the columns and the date format when you import; check both on its import screen.

## Common mistakes

- Booking Section 179 or bonus as a separate expense account the tax return does not match.
- Dating the entry outside the tax year.
- Posting it twice after re-running the schedule: delete the old entry first.

To choose between the methods first, see [Section 179 vs bonus vs regular MACRS](https://krishnachagti-sudo.github.io/toll-preview/macrs-depreciation/section-179-vs-bonus-vs-macrs/).

## Sources

- [Intuit, Import journal entries in QuickBooks Online (US help article)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)
- [IRS Publication 946 (2025), How To Depreciate Property](https://www.irs.gov/publications/p946)

## Steps

1. **Build the schedule.** Run the year's additions through the schedule tool for the entity and tax year.
2. **Download the journal CSV.** Take the generic journal CSV, or the QuickBooks Online layout with the columns Journal No., Journal Date, Account Name, Debits, Credits and Description.
3. **Match the account names.** Change the account names to the ones in your chart of accounts, or set them in the request.
4. **Import and check.** Import into QuickBooks Online; on its import screen check the column mapping and the date format before you finish.

## Questions

### Should my books use tax depreciation?

That is your accounting choice. Some businesses book the tax figure; others keep a separate book method and track the difference. The CSV is the tax depreciation for the year.

### Where does Form 4562 come in?

Form 4562 reports the depreciation and Section 179 on the tax return; the journal entry records the same amounts in your books.

## Related

- [Section 179 vs bonus vs regular MACRS](https://krishnachagti-sudo.github.io/toll-preview/macrs-depreciation/section-179-vs-bonus-vs-macrs/)
- [MACRS tables (Table A-1)](https://krishnachagti-sudo.github.io/toll-preview/macrs-depreciation/macrs-tables/)
- [MACRS depreciation schedule](https://krishnachagti-sudo.github.io/toll-preview/macrs-depreciation/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/macrs-depreciation/depreciation-journal-entry/  
Data as of: 2026-11-02
