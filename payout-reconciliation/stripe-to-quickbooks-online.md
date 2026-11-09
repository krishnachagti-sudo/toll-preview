# Reconcile Stripe payouts in QuickBooks Online

A Stripe payout books in QuickBooks Online as one journal against a Stripe clearing account: this sample payout of $156.69 is $254.99 sales - $30.00 refunds - $45.00 chargebacks - $23.30 fees, 5 journal lines, and the clearing account returns to zero when the deposit is matched.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=stripe&ledger=quickbooks-online&rate=stripe-card)

## The sample payout, split

Made-up Stripe payout, October 14, 2026

| Line | Amount |
| --- | ---: |
| Sales | $254.99 |
| Refunds | -$30.00 |
| Chargebacks and disputes | -$45.00 |
| Processing fees | -$23.30 |
| **Net (the payout)** | **$156.69** |

Stripe's US price for domestic cards is 2.9% + 30¢ per successful transaction for domestic cards; the split checks each payout's card fees against it. Here the fees on 3 payments were $8.30, and the published rate gives $8.30.

## The journal

Stripe payout po\_SAMPLE1014, October 14, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Sales |  | $254.99 |
| Refunds | $30.00 |  |
| Chargebacks | $45.00 |  |
| Merchant fees | $23.30 |  |
| Stripe clearing | $156.69 |  |
| **Total** | **$254.99** | **$254.99** |

Sales are credited gross; fees, refunds and chargebacks are debited to their own accounts; the net goes into Stripe clearing. Debits equal credits, $254.99 each.

## The QuickBooks Online import file

```csv
Journal No,Journal Date,Account Name,Description,Debits,Credits,Currency Code
poSAMPLE1014,10/14/2026,Sales,Stripe payout po_SAMPLE1014,,254.99,USD
poSAMPLE1014,10/14/2026,Refunds,Stripe payout po_SAMPLE1014,30.00,,USD
poSAMPLE1014,10/14/2026,Chargebacks,Stripe payout po_SAMPLE1014,45.00,,USD
poSAMPLE1014,10/14/2026,Merchant fees,Stripe payout po_SAMPLE1014,23.30,,USD
poSAMPLE1014,10/14/2026,Stripe clearing,Stripe payout po_SAMPLE1014,156.69,,USD
poSAMPLE1102,11/02/2026,Sales,Stripe payout po_SAMPLE1102,,269.99,USD
poSAMPLE1102,11/02/2026,Refunds,Stripe payout po_SAMPLE1102,19.99,,USD
poSAMPLE1102,11/02/2026,Merchant fees,Stripe payout po_SAMPLE1102,10.43,,USD
poSAMPLE1102,11/02/2026,Stripe clearing,Stripe payout po_SAMPLE1102,239.57,,USD
```

## Getting the Stripe file

- Open the Payout reconciliation report, pick a date range that includes the payout's estimated arrival date, and download the Itemized CSV (payout\_reconciliation.itemized.7).
- The payout reconciliation report is only available for users with automatic payouts enabled, or a platform on manual payouts whose Connected Accounts have automatic payouts enabled.

Each row is a balance transaction with its gross, fee, net and reporting\_category, and the automatic\_payout\_id that groups it into a payout.

## Sources

- [Stripe Docs: Payout reconciliation report (read November 8, 2026)](https://docs.stripe.com/reports/payout-reconciliation)
- [Stripe Docs: Reporting categories (read November 8, 2026)](https://docs.stripe.com/reports/reporting-categories)
- [Stripe pricing (United States) (read November 8, 2026)](https://stripe.com/us/pricing)
- [QuickBooks Online: Import journal entries (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Steps

1. **Create the accounts.** Add the clearing account (Stripe clearing) and any account in the journal you do not have yet. Add any new accounts to the chart of accounts before importing.
2. **Download the import file.** Get the journal from the splitter as a QuickBooks Online import file: one journal number per payout, with Journal Date, Account Name, Description, Debits and Credits.
3. **Import it.** Settings, Import Data, Journal Entries, upload the file, map your headers, start the import. Sub-accounts are written as "Parent:Sub".
4. **Match the deposit.** When the deposit shows in the bank feed, record it as a transfer from Stripe clearing to the bank. The clearing account goes back to zero.

## Questions

### Do I record gross sales or the net Stripe deposit?

Gross sales, with the fees as an expense and refunds on their own line. The deposit is the net of those lines; in this sample the sales are $254.99 and the deposit is $156.69.

### What does the clearing account do?

It holds each Stripe payout between the sale and the bank. The journal puts the net into it and the matched deposit takes it out, so a zero balance means every payout is accounted for.

## Related

- [Reconcile Stripe payouts in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/stripe-to-xero/)
- [Reconcile Shopify payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/shopify-to-quickbooks-online/)
- [Record PayPal sales and fees in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/paypal-to-quickbooks-online/)
- [The Stripe payout export, column by column](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/stripe-payout-reconciliation-report/)
- [The clearing account in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-quickbooks-online/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/stripe-to-quickbooks-online/  
Data as of: 2026-11-08
