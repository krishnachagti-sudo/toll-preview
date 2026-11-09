# Reconcile Square payouts in Xero

A Square payout books in Xero as one journal against a Square clearing account: this sample payout of $130.93 is $145.00 sales - $10.00 refunds - $4.07 fees, 4 journal lines, and the clearing account returns to zero when the deposit is matched.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=square&ledger=xero&rate=square-in-person)

## The sample payout, split

Made-up Square payout, October 16, 2026

| Line | Amount |
| --- | ---: |
| Sales | $145.00 |
| Refunds | -$10.00 |
| Processing fees | -$4.07 |
| **Net (the payout)** | **$130.93** |

Square's US in-person rate on the Free plan is 2.6% + 15¢ (Tap, dip, or swipe: 2.6% + 15¢ (Square Free), 2.5% + 15¢ (Plus), 2.4% + 15¢ (Premium)); the split checks the charges' fees against it. Here the fees on 2 payments were $4.07, and the published rate gives $4.07.

## The journal

Square payout po\_SAMPLE-SQ-1016, October 16, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Sales |  | $145.00 |
| Refunds | $10.00 |  |
| Merchant fees | $4.07 |  |
| Square clearing | $130.93 |  |
| **Total** | **$145.00** | **$145.00** |

Sales are credited gross; fees, refunds and chargebacks are debited to their own accounts; the net goes into Square clearing. Debits equal credits, $145.00 each.

## The Xero manual journal lines

```csv
Narration,Date,Description,Account,Amount,Currency
Square payout po_SAMPLE-SQ-1016,10/16/2026,Square payout po_SAMPLE-SQ-1016,Sales,-145.00,USD
Square payout po_SAMPLE-SQ-1016,10/16/2026,Square payout po_SAMPLE-SQ-1016,Refunds,10.00,USD
Square payout po_SAMPLE-SQ-1016,10/16/2026,Square payout po_SAMPLE-SQ-1016,Merchant fees,4.07,USD
Square payout po_SAMPLE-SQ-1016,10/16/2026,Square payout po_SAMPLE-SQ-1016,Square clearing,130.93,USD
```

## Getting the Square file

- Square documents its payouts in the Payouts API: list the payout's entries (ListPayoutEntries) and upload the JSON. Add the payout from ListPayouts to the same JSON as "payouts" and the split checks the entries against the deposit.
- You can only download transaction details as a CSV file in your Square Dashboard. Square does not publish that CSV's columns, so read it as "Another CSV" and name its amount, fee and net columns.

Each entry has a type (CHARGE, REFUND, FEE and so on) and gross, fee and net amounts in cents.

## Sources

- [Square Developer: Payouts API, ListPayoutEntries and PayoutEntry (read November 8, 2026)](https://developer.squareup.com/reference/square/payouts-api/list-payout-entries)
- [Square Support: Match transfers to sales (read November 8, 2026)](https://squareup.com/help/us/en/article/3813-match-deposits-to-sales)
- [Square pricing (United States) (read November 8, 2026)](https://squareup.com/us/en/pricing)
- [Xero Accounting API (OpenAPI): ManualJournalLine (read November 8, 2026)](https://github.com/XeroAPI/Xero-OpenAPI/blob/master/xero_accounting.yaml)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Steps

1. **Create the accounts.** Add the clearing account (Square clearing) and any account in the journal you do not have yet, with the names the journal uses.
2. **Download the journal lines.** Get the journal from the splitter as Xero manual journal lines: one narration and date per payout, each line with one signed amount.
3. **Enter or import the manual journal.** LineAmount: total for line. Debits are positive, credits are negative value, so a debit of $10.00 is 10.00 and a credit is -10.00. Paste the lines into Xero's manual journal import template, or enter them by hand.
4. **Match the deposit.** When the deposit shows in the bank feed, reconcile it as a transfer from Square clearing. The clearing account goes back to zero.

## Questions

### Do I record gross sales or the net Square deposit?

Gross sales, with the fees as an expense and refunds on their own line. The deposit is the net of those lines; in this sample the sales are $145.00 and the deposit is $130.93.

### What does the clearing account do?

It holds each Square payout between the sale and the bank. The journal puts the net into it and the matched deposit takes it out, so a zero balance means every payout is accounted for.

## Related

- [Reconcile Square payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/square-to-quickbooks-online/)
- [Reconcile Shopify payouts in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/shopify-to-xero/)
- [Reconcile Stripe payouts in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/stripe-to-xero/)
- [The Square payout export, column by column](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/square-payout-entries/)
- [The clearing account in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-xero/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/square-to-xero/  
Data as of: 2026-11-08
