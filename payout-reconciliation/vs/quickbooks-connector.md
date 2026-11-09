# The QuickBooks Shopify Connector vs a payout split

Intuit's Shopify Connector downloads Shopify sales into QuickBooks Online and groups each payout's payments, fees and refunds into one payout transaction; the splitter books a whole payout as one journal (6 lines for the sample payout below), for Shopify Payments and for Stripe, PayPal and Square too, in QuickBooks Online or Xero.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=shopify&ledger=quickbooks-online)

## What the QuickBooks Shopify Connector does

- A payout transaction will group received payments, fees, and refunds that represent the net payout you receive from Shopify.
- Until the payout arrives, sales sit in Undeposited Funds (also called Payments to Deposit).
- You must confirm imported transactions before they can be matched in your bank transactions.

## What the splitter does

- Reads the processor's own export (Stripe, Shopify Payments, PayPal, Square, or any CSV with its columns named) and splits every payout into sales, refunds, chargebacks, fees and adjustments.
- Proves the rows against the deposit and shows any gap as its own line.
- Builds a balanced journal through a clearing account, as a QuickBooks Online import file or Xero manual journal lines.
- The split is free in the browser; the journal is $0.10 a payout, at least $0.50 a file and at most $9 a month. Nothing is connected and nothing is kept.

## When the QuickBooks Shopify Connector is the better choice

- You want each sale in QuickBooks with its customer and products, not one journal per payout.
- You want a native Intuit integration with no file to handle.

## When the splitter is enough

- You want one summarized journal per payout, which keeps the ledger small.
- You take payments through Stripe, PayPal or Square as well, or you use Xero.

## Sources

- [QuickBooks Online: How to use the Shopify Connector app (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/manage-integrations/use-shopify-connector-app-quickbooks/L39NK2Bhe_US_en_US)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Related

- [Reconcile Shopify payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/shopify-to-quickbooks-online/)
- [The clearing account in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-quickbooks-online/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/vs/quickbooks-connector/  
Data as of: 2026-11-08
