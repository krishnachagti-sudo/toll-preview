# Manual entries the bank feed brought again

Of 7 card lines the feed brought in this worked file, 5 ($2,439.50) were already typed in from receipts, 4 of them posted by the bank a day later than the receipt date, and 2 are new; the 5 should be matched to the entries, not added.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A11%2F03%2F2026%2CTHE+HOME+DEPOT+%236512%2C-384.12%0D%0A11%2F03%2F2026%2CCHEVRON+0091842%2C-94.88%0D%0A11%2F06%2F2026%2CSITEONE+LANDSCAPE%2C-612.75%0D%0A11%2F07%2F2026%2CADOBE+CREATIVE+CLD%2C-59.99%0D%0A11%2F10%2F2026%2CTHE+HOME+DEPOT+%236512%2C%22-1%2C259.60%22%0D%0A11%2F11%2F2026%2CCHEVRON+0091842%2C-88.15%0D%0A11%2F12%2F2026%2CNAPA+AUTO+PARTS%2C-43.19%0D%0A&books=Copperleaf+Landscaping+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22November+1-14%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Card%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C11%2F02%2F2026%2CExpense%2C%2CHome+Depot%2CMulch+and+edging%2CSupplies%2C-384.12%2C-384.12%0D%0A%2C11%2F03%2F2026%2CExpense%2C%2CChevron%2CTruck+fuel%2CCar+%26+Truck%2C-94.88%2C-479.00%0D%0A%2C11%2F05%2F2026%2CExpense%2C%2CSiteOne+Landscape+Supply%2CIrrigation+parts%2CSupplies%2C-612.75%2C%22-1%2C091.75%22%0D%0A%2C11%2F09%2F2026%2CExpense%2C%2CHome+Depot%2CPavers%2CSupplies%2C%22-1%2C259.60%22%2C%22-2%2C351.35%22%0D%0A%2C11%2F10%2F2026%2CExpense%2C%2CChevron%2CTruck+fuel%2CCar+%26+Truck%2C-88.15%2C%22-2%2C439.50%22%0D%0ATotal+for+Business+Card%2C%2C%2C%2C%2C%2C%2C%22-%242%2C439.50%22%2C%0D%0A)

## The worked file

A made-up landscaper enters card purchases from receipts the day they happen. The card feed then brings 7 lines for November 2 to 12.

Feed lines already entered by hand

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | medium | -$384.12 | feed line 2: 2026-11-03, THE HOME DEPOT #6512 | books line 7: 2026-11-02, Home Depot Mulch and edging | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 2 | high | -$94.88 | feed line 3: 2026-11-03, CHEVRON 0091842 | books line 8: 2026-11-03, Chevron Truck fuel | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 3 | medium | -$612.75 | feed line 4: 2026-11-06, SITEONE LANDSCAPE | books line 9: 2026-11-05, SiteOne Landscape Supply Irrigation parts | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 4 | medium | -$1,259.60 | feed line 6: 2026-11-10, THE HOME DEPOT #6512 | books line 10: 2026-11-09, Home Depot Pavers | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 5 | medium | -$88.15 | feed line 7: 2026-11-11, CHEVRON 0091842 | books line 11: 2026-11-10, Chevron Truck fuel | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |

The receipt says Chevron and the bank says CHEVRON 0091842: the payee words still match. The Adobe and NAPA lines have no entry in the books, so they are new and are added as usual.

## Why it happens and how to stop it

- Intuit lists adding instead of matching as a cause: when you add a downloaded transaction instead of matching it.
- The fix for the future is the same sentence: "Match downloaded transactions to existing records instead of adding them."
- If you keep entering receipts by hand, leave the feed lines for those accounts to match, never to add.

## Sources

- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)
- [Intuit QuickBooks: Match your bank and credit card transactions, updated August 14, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-feeds/match-online-bank-transactions-quickbooks-online/L6qyw0PvP_US_en_US)

## Questions

### What is the difference between Match and adding the line?

Intuit on Match: "Choose this option if you already entered a record for the transaction in QuickBooks." On categorizing (adding): "Choose this option if you don't have an existing record. This creates a brand-new record in QuickBooks."

### How far apart can the dates be for QuickBooks to suggest a match?

Intuit says it suggests matches in "90 days before to 20 days after the transaction date". The tool pairs within 3 days by default because a receipt and its bank line are usually that close; you can widen it to 31.

## Related

- [Match, add and exclude explained](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/quickbooks-for-review-tab-explained/)
- [Find duplicates before you reconcile](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/find-before-reconcile/)
- [Duplicates after reconnecting the bank](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/after-reconnecting-bank/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/manual-entry-and-bank-feed/  
Data as of: 2026-11-08
