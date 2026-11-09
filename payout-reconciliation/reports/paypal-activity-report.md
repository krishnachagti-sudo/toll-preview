# The PayPal Activity Download, explained

PayPal's Activity Download gives each row a Gross (fee included), a Fee and a Net, and its Balance Impact says Debit, Credit or Memo. In the sample month below, 6 balance rows net to $133.05 before $150.00 of withdrawals, and the Balance column runs from $74.73 to $57.78.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=paypal&ledger=quickbooks-online&rate=paypal-checkout)

## The columns the split reads

| Column | What it holds |
| --- | --- |
| Date | For US accounts, it uses this format: MM/DD/YYYY. |
| Type | Type: The transaction event code T-code description. |
| Status | Completed, Pending, Reversed and others. |
| Currency | The ISO currency code of the row. |
| Gross | Gross: The localized gross amount of the transaction, including fees. |
| Fee | The fee on the row; most files write it as a negative amount. |
| Net | Net: The localized net amount of the transaction (typically the gross minus any fees) |
| Transaction ID | PayPal's id for the row. |
| Reference Txn ID | The parent transaction: a refund points to its sale. |
| Balance | Balance: The running available balance in the merchant's account in the transaction currency. The balance is the previous balance plus the net amount of the current activity. |
| Sales Tax | Sales Tax: The localized sales tax amount paid as part of the transaction, as reported by PayPal or the merchant |
| Balance Impact | Balance Impact: The impact of the transaction on the account balance: Debit, Credit, or Memo. |

## Transaction types, and where each goes

| Type (T-code) | Booked as |
| --- | --- |
| Express Checkout payment (T0006) | Sales |
| General payment (T0000) | Sales |
| Payment refund (T1107) | Refunds |
| Fee refund (T1109) | Processing fees |
| Chargeback (T1201) | Chargebacks and disputes |
| Chargeback fee (T0106) | Processing fees |
| Dispute fee (T0114) | Processing fees |
| Hold on balance for dispute investigation (T1110) | Chargebacks and disputes |
| Reserve hold (T2103) | Reserves and holds |
| General currency conversion (T0200) | Currency conversion |
| General withdrawal, bank account (T0400) | Withdrawal to the bank |
| Bank deposit to PayPal account (T0300) | Money from the bank |

## A sample month

Made-up Activity Download rows, newest first

| Date | Time | TimeZone | Name | Type | Status | Currency | Gross | Fee | Net | Transaction ID | Reference Txn ID | Balance | Sales Tax | Balance Impact |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 10/20/2026 | 16:05:00 | PDT |  | General Withdrawal | Completed | USD | -150.00 | 0.00 | -150.00 | 8SAMPLE0000000007 |  | 57.78 | 0.00 | Debit |
| 10/19/2026 | 09:30:12 | PDT |  | Chargeback Fee | Completed | USD | -20.00 | 0.00 | -20.00 | 8SAMPLE0000000006 | 8SAMPLE0000000005 | 207.78 | 0.00 | Debit |
| 10/18/2026 | 14:22:51 | PDT | Sample Buyer C | Payment Refund | Completed | USD | -25.00 | 0.00 | -25.00 | 8SAMPLE0000000005 | 8SAMPLE0000000002 | 227.78 | 0.00 | Debit |
| 10/17/2026 | 11:02:33 | PDT | Sample Buyer C | Express Checkout Payment | Completed | USD | 25.00 | -1.36 | 23.64 | 8SAMPLE0000000004 |  | 252.78 | 0.00 | Credit |
| 10/16/2026 | 18:45:09 | PDT | Sample Buyer B | Express Checkout Payment | Completed | USD | 54.00 | -2.37 | 51.63 | 8SAMPLE0000000003 |  | 229.14 | 0.00 | Credit |
| 10/16/2026 | 18:45:09 | PDT | Sample Buyer B | Authorization | Pending | USD | 54.00 | 0.00 | 54.00 | 8SAMPLE0000000009 |  |  | 0.00 | Memo |
| 10/15/2026 | 10:10:10 | PDT | Sample Buyer A | Express Checkout Payment | Completed | USD | 107.00 | -4.22 | 102.78 | 8SAMPLE0000000002 |  | 177.51 | 7.00 | Credit |

The month, split

| Line | Amount |
| --- | ---: |
| Sales | $179.00 |
| Sales tax collected | $7.00 |
| Refunds | -$25.00 |
| Processing fees | -$27.95 |
| **Net (the payout)** | **$133.05** |

The Memo row (an authorization) is left out because it does not move the balance. The fee check: PayPal Checkout is PayPal Checkout: 3.49% + fixed fee, with Fixed fee for commercial transactions, US dollar: 0.49 USD; on these 3 sales it gives $7.95, against $7.95 charged.

## Sources

- [PayPal Developer: Activity Download report (read November 8, 2026)](https://developer.paypal.com/reports/activity-download)
- [PayPal Developer: Transaction event code (T-code) reference (read November 8, 2026)](https://developer.paypal.com/reports/reference/t-codes)
- [PayPal merchant fees (United States) (read November 8, 2026)](https://www.paypal.com/us/business/paypal-business-fees)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Questions

### What does Balance Impact mean in the PayPal download?

Balance Impact: The impact of the transaction on the account balance: Debit, Credit, or Memo.

### Is the PayPal fee included in Gross?

Gross: The localized gross amount of the transaction, including fees.

## Related

- [Record PayPal sales and fees in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/paypal-to-quickbooks-online/)
- [Record PayPal sales and fees in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/paypal-to-xero/)
- [PayPal fees and payouts in your books](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/paypal-fees-bookkeeping/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/paypal-activity-report/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/paypal-activity-report.csv
