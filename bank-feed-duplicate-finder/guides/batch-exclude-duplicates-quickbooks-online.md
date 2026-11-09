# Batch exclude or delete duplicates in QuickBooks Online

To clear bank-feed duplicates in QuickBooks Online, tick each extra copy in For review and choose Exclude; in this worked file that is 7 lines ($8,433.16) selected together, and any copy already added must first be undone from Categorized.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%0D%0A10%2F05%2F2026%2CSQUARE+INC+DEP%2C%221%2C284.50%22%0D%0A10%2F07%2F2026%2CCOMCAST+BUSINESS%2C-189.99%0D%0A10%2F12%2F2026%2CSQUARE+INC+DEP%2C%221%2C182.50%22%0D%0A10%2F13%2F2026%2CSYSCO+FOOD+SVC%2C-588.41%0D%0A10%2F14%2F2026%2CSHELL+OIL+5741%2C-59.40%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%221%2C244.00%22%0D%0A10%2F19%2F2026%2CAMAZON+MKTPL%2C-44.17%0D%0A10%2F20%2F2026%2CSQUARE+INC+DEP%2C%221%2C099.35%22%0D%0A10%2F12%2F2026%2CSQUARE+INC+DEP%2C%221%2C182.50%22%0D%0A10%2F13%2F2026%2CSYSCO+FOOD+SVC%2C-588.41%0D%0A10%2F14%2F2026%2CSHELL+OIL+5741%2C-59.40%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%221%2C244.00%22%0D%0A10%2F19%2F2026%2CAMAZON+MKTPL%2C-44.17%0D%0A10%2F20%2F2026%2CSQUARE+INC+DEP%2C%221%2C099.35%22%0D%0A10%2F22%2F2026%2CVERIZON+WIRELESS%2C-112.60%0D%0A10%2F23%2F2026%2CSQUARE+INC+DEP%2C%221%2C211.80%22%0D%0A)

## The list to work from

The exclude-ready list for the worked file

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | $1,182.50 | feed line 12: 2026-10-12, SQUARE INC DEP | feed line 5: 2026-10-12, SQUARE INC DEP | Exclude this copy in For review; keep the other to match or add |
| 2 | high | -$588.41 | feed line 13: 2026-10-13, SYSCO FOOD SVC | feed line 6: 2026-10-13, SYSCO FOOD SVC | Exclude this copy in For review; keep the other to match or add |
| 3 | high | -$59.40 | feed line 14: 2026-10-14, SHELL OIL 5741 | feed line 7: 2026-10-14, SHELL OIL 5741 | Exclude this copy in For review; keep the other to match or add |
| 4 | high | -$4,215.33 | feed line 15: 2026-10-15, GUSTO PAYROLL | feed line 8: 2026-10-15, GUSTO PAYROLL | Exclude this copy in For review; keep the other to match or add |
| 5 | high | $1,244.00 | feed line 16: 2026-10-16, SQUARE INC DEP | feed line 9: 2026-10-16, SQUARE INC DEP | Exclude this copy in For review; keep the other to match or add |
| 6 | high | -$44.17 | feed line 17: 2026-10-19, AMAZON MKTPL | feed line 10: 2026-10-19, AMAZON MKTPL | Exclude this copy in For review; keep the other to match or add |
| 7 | high | $1,099.35 | feed line 18: 2026-10-20, SQUARE INC DEP | feed line 11: 2026-10-20, SQUARE INC DEP | Exclude this copy in For review; keep the other to match or add |

## Exclude many at once

Intuit's steps (its South Africa page, where the tab is called Pending): Open Bank transactions and choose the affected bank account. Tick the box for each duplicate in the Pending tab. Click Exclude. The lines move from the Pending tab to the Excluded tab.

## If the duplicate was already added

In Categorized (or Posted), tick the copies and select Undo, which moves the transactions back to the Pending tab; then exclude them. A copy that was entered by hand rather than added from the feed is deleted or voided in the register instead.

## Deleting from the Excluded tab

Open the Excluded tab. Tick the transactions you want to remove. Click Delete. Whether deleting changes what downloads next is a different question: [exclude or delete](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/exclude-vs-delete/).

## Sources

- [Intuit QuickBooks (South Africa): Remove duplicate bank transactions in QuickBooks Online, "Updated 1 month ago" (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-za/help-article/bank-transactions/remove-duplicate-bank-transactions-quickbooks/L3X1ZPiEW_ZA_en_ZA)
- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)

## Steps

1. **Get the list.** Run the duplicate finder on the For review lines and the register; download the exclude-ready CSV.
2. **Exclude in For review.** Open Bank transactions, choose the account, tick each extra copy in For review (Pending) and select Exclude.
3. **Undo added copies first.** For a copy already added or matched, find it in Categorized (Posted), select Undo, then exclude it from For review.
4. **Delete if you want them gone from the list.** Excluded lines can be deleted from the Excluded tab: tick them and select Delete.

## Related

- [Exclude or delete: which to use](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/exclude-vs-delete/)
- [Duplicates after reconnecting the bank](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/after-reconnecting-bank/)
- [Overlapping file upload](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/overlapping-upload/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/batch-exclude-duplicates-quickbooks-online/  
Data as of: 2026-11-08
