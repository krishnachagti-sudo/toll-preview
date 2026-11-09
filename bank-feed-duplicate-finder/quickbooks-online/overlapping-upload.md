# Duplicates from an overlapping bank file upload

An uploaded bank file that overlaps the feed brings those days in twice: in this worked file every feed line from October 12, 2026 to October 20, 2026 is in For review twice (7 pairs, $8,433.16), and excluding one copy of each leaves 12 lines to review.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%0D%0A10%2F05%2F2026%2CSQUARE+INC+DEP%2C%221%2C284.50%22%0D%0A10%2F07%2F2026%2CCOMCAST+BUSINESS%2C-189.99%0D%0A10%2F12%2F2026%2CSQUARE+INC+DEP%2C%221%2C182.50%22%0D%0A10%2F13%2F2026%2CSYSCO+FOOD+SVC%2C-588.41%0D%0A10%2F14%2F2026%2CSHELL+OIL+5741%2C-59.40%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%221%2C244.00%22%0D%0A10%2F19%2F2026%2CAMAZON+MKTPL%2C-44.17%0D%0A10%2F20%2F2026%2CSQUARE+INC+DEP%2C%221%2C099.35%22%0D%0A10%2F12%2F2026%2CSQUARE+INC+DEP%2C%221%2C182.50%22%0D%0A10%2F13%2F2026%2CSYSCO+FOOD+SVC%2C-588.41%0D%0A10%2F14%2F2026%2CSHELL+OIL+5741%2C-59.40%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%221%2C244.00%22%0D%0A10%2F19%2F2026%2CAMAZON+MKTPL%2C-44.17%0D%0A10%2F20%2F2026%2CSQUARE+INC+DEP%2C%221%2C099.35%22%0D%0A10%2F22%2F2026%2CVERIZON+WIRELESS%2C-112.60%0D%0A10%2F23%2F2026%2CSQUARE+INC+DEP%2C%221%2C211.80%22%0D%0A)

## The worked file

A made-up bakery uploaded its bank CSV for October 1 to 20 to fill a gap, but the feed had already downloaded October 12 onwards. For review holds both.

The days in For review twice

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | $1,182.50 | feed line 12: 2026-10-12, SQUARE INC DEP | feed line 5: 2026-10-12, SQUARE INC DEP | Exclude this copy in For review; keep the other to match or add |
| 2 | high | -$588.41 | feed line 13: 2026-10-13, SYSCO FOOD SVC | feed line 6: 2026-10-13, SYSCO FOOD SVC | Exclude this copy in For review; keep the other to match or add |
| 3 | high | -$59.40 | feed line 14: 2026-10-14, SHELL OIL 5741 | feed line 7: 2026-10-14, SHELL OIL 5741 | Exclude this copy in For review; keep the other to match or add |
| 4 | high | -$4,215.33 | feed line 15: 2026-10-15, GUSTO PAYROLL | feed line 8: 2026-10-15, GUSTO PAYROLL | Exclude this copy in For review; keep the other to match or add |
| 5 | high | $1,244.00 | feed line 16: 2026-10-16, SQUARE INC DEP | feed line 9: 2026-10-16, SQUARE INC DEP | Exclude this copy in For review; keep the other to match or add |
| 6 | high | -$44.17 | feed line 17: 2026-10-19, AMAZON MKTPL | feed line 10: 2026-10-19, AMAZON MKTPL | Exclude this copy in For review; keep the other to match or add |
| 7 | high | $1,099.35 | feed line 18: 2026-10-20, SQUARE INC DEP | feed line 11: 2026-10-20, SQUARE INC DEP | Exclude this copy in For review; keep the other to match or add |

Each pair is the same date, amount and description, so the later copy in the list is the one marked to exclude; the earlier copy stays to be matched or added. The days outside the overlap (October 1 to 7 and 22 to 23) are single.

## Clearing them

- Exclude one copy of each pair in For review: select them together and choose Exclude, as in [batch exclude](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/batch-exclude-duplicates-quickbooks-online/).
- Next time, start the file after the newest transaction already in QuickBooks. The cause in Intuit's words: "import a file that overlaps with your bank feed".
- The upload layout the tool also reads: Date, Description, Amount.

## Sources

- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)
- [Intuit QuickBooks: Format CSV files in Excel to get bank transactions into QuickBooks, updated August 24, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/format-csv-files-excel-bank-transactions-quickbooks/L4BjLWckq_US_en_US)

## Questions

### How do I upload a file without overlapping the feed?

Intuit: "Import files that start after the newest transaction that's already in QuickBooks."

## Related

- [Batch exclude in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/batch-exclude-duplicates-quickbooks-online/)
- [Xero: an overlapping statement import](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/xero/overlapping-statement-import/)
- [Export bank transactions for checking](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/export-bank-transactions-qbo-xero-csv/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/overlapping-upload/  
Data as of: 2026-11-08
