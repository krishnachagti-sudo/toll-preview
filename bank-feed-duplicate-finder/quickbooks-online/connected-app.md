# A connected app and the bank feed record the same sale

When a connected app records the same money the bank feed brings, each sale or payout is in twice: in this worked online store 6 of 7 bank lines ($5,163.14) are payouts the app had already posted, a day apart or the same day, and should be matched, not added.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A10%2F03%2F2026%2CSHOPIFY+PAYMENTS+TRANSFER%2C842.13%0D%0A10%2F07%2F2026%2CSHOPIFY+PAYMENTS+TRANSFER%2C%221%2C128.70%22%0D%0A10%2F09%2F2026%2CSHOPIFY+PAYMENTS+TRANSFER%2C599.44%0D%0A10%2F14%2F2026%2CSHOPIFY+PAYMENTS+TRANSFER%2C%221%2C401.25%22%0D%0A10%2F16%2F2026%2CPIRATE+SHIP+POSTAGE%2C-218.60%0D%0A10%2F21%2F2026%2CSHOPIFY+PAYMENTS+TRANSFER%2C973.02%0D%0A10%2F24%2F2026%2CSHOPIFY+PAYMENTS+TRANSFER%2C881.40%0D%0A&books=Fernway+Goods+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C10%2F02%2F2026%2CDeposit%2C%2CShopify+Payments%2CPayout+synced+by+app%2CShopify+Clearing%2C842.13%2C842.13%0D%0A%2C10%2F06%2F2026%2CDeposit%2C%2CShopify+Payments%2CPayout+synced+by+app%2CShopify+Clearing%2C%221%2C128.70%22%2C%221%2C970.83%22%0D%0A%2C10%2F09%2F2026%2CDeposit%2C%2CShopify+Payments%2CPayout+synced+by+app%2CShopify+Clearing%2C599.44%2C%222%2C570.27%22%0D%0A%2C10%2F13%2F2026%2CDeposit%2C%2CShopify+Payments%2CPayout+synced+by+app%2CShopify+Clearing%2C%221%2C401.25%22%2C%223%2C971.52%22%0D%0A%2C10%2F16%2F2026%2CExpense%2C%2CPirate+Ship%2CPostage%2CShipping%2C-218.60%2C%223%2C752.92%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CShopify+Payments%2CPayout+synced+by+app%2CShopify+Clearing%2C973.02%2C%224%2C725.94%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22%244%2C725.94%22%2C%0D%0A)

## What Intuit says

Intuit lists "A connected app and your bank record the same sale" as a cause, and the fix is to match the bank download to the app's entry or exclude the extra copy. "For Square, keep the itemized entries and exclude the daily lump sum."

## The worked file

A made-up online store's app posts each payout to Business Checking as a deposit. The bank feed then brings the transfers, usually a day later.

Bank lines the app had already posted

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | medium | $842.13 | feed line 2: 2026-10-03, SHOPIFY PAYMENTS TRANSFER | books line 7: 2026-10-02, Shopify Payments Payout synced by app | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 2 | medium | $1,128.70 | feed line 3: 2026-10-07, SHOPIFY PAYMENTS TRANSFER | books line 8: 2026-10-06, Shopify Payments Payout synced by app | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 3 | high | $599.44 | feed line 4: 2026-10-09, SHOPIFY PAYMENTS TRANSFER | books line 9: 2026-10-09, Shopify Payments Payout synced by app | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 4 | medium | $1,401.25 | feed line 5: 2026-10-14, SHOPIFY PAYMENTS TRANSFER | books line 10: 2026-10-13, Shopify Payments Payout synced by app | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 5 | high | -$218.60 | feed line 6: 2026-10-16, PIRATE SHIP POSTAGE | books line 11: 2026-10-16, Pirate Ship Postage | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 6 | medium | $973.02 | feed line 7: 2026-10-21, SHOPIFY PAYMENTS TRANSFER | books line 12: 2026-10-20, Shopify Payments Payout synced by app | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |

The postage line pairs with the expense entered for it, and the last payout of the month has no entry yet, so it is new.

## When it is not one-for-one

A bank deposit that is the total of several app entries (a daily lump sum against itemized sales) has no single twin, so it is not listed here. That is a set-matching job: [which payments add up to a deposit](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/match-deposit/), in the clearing-account cleanup.

## Sources

- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)

## Questions

### What does Intuit say to do for Square and Wix?

"For Square, keep the itemized entries and exclude the daily lump sum." "For Wix, turn off extra syncs in the connection's Retrieve settings."

## Related

- [Manual entries the bank feed brought again](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/manual-entry-and-bank-feed/)
- [Clearing account reconciliation](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/clearing-account/)
- [Which payments make up a deposit?](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/match-deposit/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/connected-app/  
Data as of: 2026-11-08
