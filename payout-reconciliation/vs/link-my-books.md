# Link My Books vs a per-payout splitter

Link My Books is a subscription priced by your monthly orders and number of sales channels, with a 14-day free trial and no card needed; here a month of 30 payouts costs $3.00 and no month more than $9.00. Link My Books syncs settlements into Xero or QuickBooks continuously; the splitter turns an uploaded export into a journal.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=shopify&ledger=quickbooks-online)

## What Link My Books does

- Priced by orders per month across all channels and by the number of sales channels; the order count is a rolling 12-month average.
- Start a free 14-day trial. No card required.
- The free trial includes 90 days of historical data; paid plans go back up to 24 months.

## What the splitter does

- Reads the processor's own export (Stripe, Shopify Payments, PayPal, Square, or any CSV with its columns named) and splits every payout into sales, refunds, chargebacks, fees and adjustments.
- Proves the rows against the deposit and shows any gap as its own line.
- Builds a balanced journal through a clearing account, as a QuickBooks Online import file or Xero manual journal lines.
- The split is free in the browser; the journal is $0.10 a payout, at least $0.50 a file and at most $9 a month. Nothing is connected and nothing is kept.

## When Link My Books is the better choice

- You sell on Amazon or other marketplaces and want their settlements posted for you.
- You want history imported and kept in sync without uploads.
- You need its deferred-payment handling for Amazon.

## When the splitter is enough

- Your payouts come from Stripe, Shopify Payments, PayPal or Square and you close the month in one sitting.
- You would rather pay per payout than per month.

## Sources

- [Link My Books pricing (read November 8, 2026)](https://linkmybooks.com/pricing)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Related

- [An A2X alternative, priced per payout](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/vs/a2x-alternative/)
- [Webgility and Taxomate compared](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/vs/webgility-and-taxomate/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/vs/link-my-books/  
Data as of: 2026-11-08
