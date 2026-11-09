# Reconcile Stripe payouts in Xero

A Stripe payout books in Xero as one journal against a Stripe clearing account: this sample payout of $156.69 is $254.99 sales - $30.00 refunds - $45.00 chargebacks - $23.30 fees, 5 journal lines, and the clearing account returns to zero when the deposit is matched.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=stripe&ledger=xero&rate=stripe-card)

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

## The Xero manual journal lines

```csv
Narration,Date,Description,Account,Amount,Currency
Stripe payout po_SAMPLE1014,10/14/2026,Stripe payout po_SAMPLE1014,Sales,-254.99,USD
Stripe payout po_SAMPLE1014,10/14/2026,Stripe payout po_SAMPLE1014,Refunds,30.00,USD
Stripe payout po_SAMPLE1014,10/14/2026,Stripe payout po_SAMPLE1014,Chargebacks,45.00,USD
Stripe payout po_SAMPLE1014,10/14/2026,Stripe payout po_SAMPLE1014,Merchant fees,23.30,USD
Stripe payout po_SAMPLE1014,10/14/2026,Stripe payout po_SAMPLE1014,Stripe clearing,156.69,USD
Stripe payout po_SAMPLE1102,11/02/2026,Stripe payout po_SAMPLE1102,Sales,-269.99,USD
Stripe payout po_SAMPLE1102,11/02/2026,Stripe payout po_SAMPLE1102,Refunds,19.99,USD
Stripe payout po_SAMPLE1102,11/02/2026,Stripe payout po_SAMPLE1102,Merchant fees,10.43,USD
Stripe payout po_SAMPLE1102,11/02/2026,Stripe payout po_SAMPLE1102,Stripe clearing,239.57,USD
```

## Getting the Stripe file

- Open the Payout reconciliation report, pick a date range that includes the payout's estimated arrival date, and download the Itemized CSV (payout\_reconciliation.itemized.7).
- The payout reconciliation report is only available for users with automatic payouts enabled, or a platform on manual payouts whose Connected Accounts have automatic payouts enabled.

Each row is a balance transaction with its gross, fee, net and reporting\_category, and the automatic\_payout\_id that groups it into a payout.

## Sources

- [Stripe Docs: Payout reconciliation report (read November 8, 2026)](https://docs.stripe.com/reports/payout-reconciliation)
- [Stripe Docs: Reporting categories (read November 8, 2026)](https://docs.stripe.com/reports/reporting-categories)
- [Stripe pricing (United States) (read November 8, 2026)](https://stripe.com/us/pricing)
- [Xero Accounting API (OpenAPI): ManualJournalLine (read November 8, 2026)](https://github.com/XeroAPI/Xero-OpenAPI/blob/master/xero_accounting.yaml)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Steps

1. **Create the accounts.** Add the clearing account (Stripe clearing) and any account in the journal you do not have yet, with the names the journal uses.
2. **Download the journal lines.** Get the journal from the splitter as Xero manual journal lines: one narration and date per payout, each line with one signed amount.
3. **Enter or import the manual journal.** LineAmount: total for line. Debits are positive, credits are negative value, so a debit of $10.00 is 10.00 and a credit is -10.00. Paste the lines into Xero's manual journal import template, or enter them by hand.
4. **Match the deposit.** When the deposit shows in the bank feed, reconcile it as a transfer from Stripe clearing. The clearing account goes back to zero.

## Questions

### Do I record gross sales or the net Stripe deposit?

Gross sales, with the fees as an expense and refunds on their own line. The deposit is the net of those lines; in this sample the sales are $254.99 and the deposit is $156.69.

### What does the clearing account do?

It holds each Stripe payout between the sale and the bank. The journal puts the net into it and the matched deposit takes it out, so a zero balance means every payout is accounted for.

## Related

- [Reconcile Stripe payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/stripe-to-quickbooks-online/)
- [Reconcile Shopify payouts in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/shopify-to-xero/)
- [Record PayPal sales and fees in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/paypal-to-xero/)
- [The Stripe payout export, column by column](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/stripe-payout-reconciliation-report/)
- [The clearing account in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-xero/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/stripe-to-xero/  
Data as of: 2026-11-08
