# Reconcile Shopify payouts in QuickBooks Online

A Shopify Payments payout books in QuickBooks Online as one journal against a Shopify Payments clearing account: this sample payout of $126.18 is $229.75 sales - $22.00 refunds - $49.00 chargebacks - $22.57 fees - $10.00 reserves, 6 journal lines, and the clearing account returns to zero when the deposit is matched.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=shopify&ledger=quickbooks-online)

## The sample payout, split

Made-up Shopify Payments payout, October 14, 2026

| Line | Amount |
| --- | ---: |
| Sales | $229.75 |
| Refunds | -$22.00 |
| Chargebacks and disputes | -$49.00 |
| Processing fees | -$22.57 |
| Reserves and holds | -$10.00 |
| **Net (the payout)** | **$126.18** |

Your credit card rate depends on your Shopify Plan. You can check your current Shopify Payments credit card rate in your Shopify admin. So there is no published rate to check the fees against; the effective rate is shown instead.

## The journal

Shopify Payments payout payout-2026-10-14, October 14, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Sales |  | $229.75 |
| Refunds | $22.00 |  |
| Chargebacks | $49.00 |  |
| Merchant fees | $22.57 |  |
| Processor reserve | $10.00 |  |
| Shopify Payments clearing | $126.18 |  |
| **Total** | **$229.75** | **$229.75** |

Sales are credited gross; fees, refunds and chargebacks are debited to their own accounts; the net goes into Shopify Payments clearing. Debits equal credits, $229.75 each.

## The QuickBooks Online import file

```csv
Journal No,Journal Date,Account Name,Description,Debits,Credits,Currency Code
payout-2026-10-14,10/14/2026,Sales,Shopify Payments payout payout-2026-10-14,,229.75,USD
payout-2026-10-14,10/14/2026,Refunds,Shopify Payments payout payout-2026-10-14,22.00,,USD
payout-2026-10-14,10/14/2026,Chargebacks,Shopify Payments payout payout-2026-10-14,49.00,,USD
payout-2026-10-14,10/14/2026,Merchant fees,Shopify Payments payout payout-2026-10-14,22.57,,USD
payout-2026-10-14,10/14/2026,Processor reserve,Shopify Payments payout payout-2026-10-14,10.00,,USD
payout-2026-10-14,10/14/2026,Shopify Payments clearing,Shopify Payments payout payout-2026-10-14,126.18,,USD
```

## Getting the Shopify Payments file

- In the Shopify admin: Export a specific payout: Finance \> Payouts, click the payout date and the payout, then Export payout transactions.
- The file has no currency column; the splitter reads it in your store's payout currency (USD unless you say otherwise).

Each row is a charge, refund, dispute, adjustment or reserve with its Amount, Fee and Net. Shopify says Net is the difference between the amount and the fee.

## Sources

- [Shopify Help Center: Viewing and exporting your Shopify Payments payout details (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/view-details)
- [Shopify Admin API: ShopifyPaymentsTransactionType (read November 8, 2026)](https://shopify.dev/docs/api/admin-graphql/latest/enums/ShopifyPaymentsTransactionType)
- [Shopify Help Center: Viewing your Shopify Payments payout fees (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/pay-periods-and-fees)
- [QuickBooks Online: Import journal entries (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Steps

1. **Create the accounts.** Add the clearing account (Shopify Payments clearing) and any account in the journal you do not have yet. Add any new accounts to the chart of accounts before importing.
2. **Download the import file.** Get the journal from the splitter as a QuickBooks Online import file: one journal number per payout, with Journal Date, Account Name, Description, Debits and Credits.
3. **Import it.** Settings, Import Data, Journal Entries, upload the file, map your headers, start the import. Sub-accounts are written as "Parent:Sub".
4. **Match the deposit.** When the deposit shows in the bank feed, record it as a transfer from Shopify Payments clearing to the bank. The clearing account goes back to zero.

## Questions

### Do I record gross sales or the net Shopify Payments deposit?

Gross sales, with the fees as an expense and refunds on their own line. The deposit is the net of those lines; in this sample the sales are $229.75 and the deposit is $126.18.

### What does the clearing account do?

It holds each Shopify Payments payout between the sale and the bank. The journal puts the net into it and the matched deposit takes it out, so a zero balance means every payout is accounted for.

## Related

- [Reconcile Shopify payouts in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/shopify-to-xero/)
- [Reconcile Stripe payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/stripe-to-quickbooks-online/)
- [Record PayPal sales and fees in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/paypal-to-quickbooks-online/)
- [The Shopify Payments payout export, column by column](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/shopify-payout-report/)
- [The clearing account in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-quickbooks-online/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/shopify-to-quickbooks-online/  
Data as of: 2026-11-08
