# Record PayPal sales and fees in QuickBooks Online

PayPal activity books in QuickBooks Online as one journal per month against a PayPal account that works like a bank: in this sample, $179.00 sales + $7.00 sales tax - $25.00 refunds - $27.95 fees = $133.05 goes in as 5 lines, and the $150.00 withdrawal is a transfer from PayPal to the bank.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=paypal&ledger=quickbooks-online&rate=paypal-checkout)

## The sample month, split

Made-up PayPal activity, October 20, 2026

| Line | Amount |
| --- | ---: |
| Sales | $179.00 |
| Sales tax collected | $7.00 |
| Refunds | -$25.00 |
| Processing fees | -$27.95 |
| **Net (the payout)** | **$133.05** |

PayPal's US rate for PayPal Checkout is PayPal Checkout: 3.49% + fixed fee, and the fixed fee in US dollars is $0.49; the split checks each sale's fee against it. Here the fees on 3 payments were $7.95, and the published rate gives $7.95.

## The journal

PayPal USD 2026-10-15 to 2026-10-20, October 20, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Sales |  | $179.00 |
| Sales tax payable |  | $7.00 |
| Refunds | $25.00 |  |
| Merchant fees | $27.95 |  |
| PayPal | $133.05 |  |
| **Total** | **$186.00** | **$186.00** |

PayPal is a balance, not a pass-through: what is not withdrawn stays in it. So the PayPal account in your books should equal the PayPal balance, and each withdrawal is a transfer from it to the bank.

## The QuickBooks Online import file

```csv
Journal No,Journal Date,Account Name,Description,Debits,Credits,Currency Code
paypal-USD,10/20/2026,Sales,PayPal USD 2026-10-15 to 2026-10-20,,179.00,USD
paypal-USD,10/20/2026,Sales tax payable,PayPal USD 2026-10-15 to 2026-10-20,,7.00,USD
paypal-USD,10/20/2026,Refunds,PayPal USD 2026-10-15 to 2026-10-20,25.00,,USD
paypal-USD,10/20/2026,Merchant fees,PayPal USD 2026-10-15 to 2026-10-20,27.95,,USD
paypal-USD,10/20/2026,PayPal,PayPal USD 2026-10-15 to 2026-10-20,133.05,,USD
```

## Getting the PayPal file

- In PayPal, download the Activity Download report as CSV for the month, with the Balance Impact, Balance and Sales Tax columns selected (they are selected by default).
- CSV and TAB reports are limited to 50,000 records.

Each row is one balance event: its Type is the T-code description, Gross includes the fee, and Balance Impact says Debit, Credit or Memo. Memo rows do not move the balance and are left out.

## Sources

- [PayPal Developer: Activity Download report (read November 8, 2026)](https://developer.paypal.com/reports/activity-download)
- [PayPal Developer: Transaction event code (T-code) reference (read November 8, 2026)](https://developer.paypal.com/reports/reference/t-codes)
- [PayPal merchant fees (United States) (read November 8, 2026)](https://www.paypal.com/us/business/paypal-business-fees)
- [QuickBooks Online: Import journal entries (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Steps

1. **Create the accounts.** Add the clearing account (PayPal) and any account in the journal you do not have yet. Add any new accounts to the chart of accounts before importing.
2. **Download the import file.** Get the journal from the splitter as a QuickBooks Online import file: one journal number per payout, with Journal Date, Account Name, Description, Debits and Credits.
3. **Import it.** Settings, Import Data, Journal Entries, upload the file, map your headers, start the import. Sub-accounts are written as "Parent:Sub".
4. **Match the deposit.** When the deposit shows in the bank feed, record it as a transfer from PayPal to the bank. The clearing account goes back to zero.

## Questions

### Do I record gross sales or the net PayPal deposit?

Gross sales, with the fees as an expense and refunds on their own line. The deposit is the net of those lines; in this sample the sales are $179.00 and the net activity is $133.05.

### What does the clearing account do?

It holds each PayPal payout between the sale and the bank. The journal puts the net into it and the matched deposit takes it out, so a zero balance means every payout is accounted for.

## Related

- [Record PayPal sales and fees in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/paypal-to-xero/)
- [Reconcile Shopify payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/shopify-to-quickbooks-online/)
- [Reconcile Stripe payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/stripe-to-quickbooks-online/)
- [The PayPal payout export, column by column](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/paypal-activity-report/)
- [The clearing account in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-quickbooks-online/)
- [PayPal fees and payouts in your books](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/paypal-fees-bookkeeping/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/paypal-to-quickbooks-online/  
Data as of: 2026-11-08
