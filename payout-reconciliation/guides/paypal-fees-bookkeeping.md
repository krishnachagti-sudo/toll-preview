# PayPal fees and payouts in your books

Book a PayPal sale at its gross and the fee as an expense: at PayPal Checkout's US rate of 3.49% + $0.49, the fees on this sample month's 3 sales are $7.95, exactly the $7.95 in the file. The month's activity, $179.00 sales + $7.00 sales tax - $25.00 refunds - $27.95 fees, is $133.05, and the $150.00 withdrawal is a transfer to the bank, not income.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=paypal&ledger=quickbooks-online&rate=paypal-checkout)

## Each sale, gross, fee and net

| Sale | Gross | 3.49% of gross | Fixed | Fee | Net |
| --- | ---: | ---: | ---: | ---: | ---: |
| Sample Buyer A | $107.00 | $3.73 | $0.49 | $4.22 | $102.78 |
| Sample Buyer B | $54.00 | $1.88 | $0.49 | $2.37 | $51.63 |
| Sample Buyer C | $25.00 | $0.87 | $0.49 | $1.36 | $23.64 |

Sample Buyer A's $107.00 includes $7.00 of sales tax from the Sales Tax column, which the split books to sales tax payable, not to sales.

## The month's journal

PayPal USD 2026-10-15 to 2026-10-20, October 20, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Sales |  | $179.00 |
| Sales tax payable |  | $7.00 |
| Refunds | $25.00 |  |
| Merchant fees | $27.95 |  |
| PayPal | $133.05 |  |
| **Total** | **$186.00** | **$186.00** |

## Withdrawals and the balance

The PayPal account in your books works like a bank account. Its balance went from $74.73 to $57.78 in the file's Balance column; the activity of $133.05 less the withdrawal of $150.00 is exactly that change. Match each withdrawal to its bank deposit as a transfer.

## More than one currency

A PayPal balance can hold several currencies. The split keeps each currency apart, with its own journal and its own balance check, and books General currency conversion rows (T0200) to a currency conversion account.

## PayPal's published fees

- PayPal Checkout: 3.49% + fixed fee
- Standard Credit and Debit Card Payments: 2.99% + fixed fee
- Fixed fee for commercial transactions, US dollar: 0.49 USD
- Additional percentage-based fee for international commercial transactions: 1.50%
- Chargeback fee, US dollar: 20.00 USD
- Standard dispute fee, US dollar: 15.00 USD
- Standard withdrawal to a bank account: no fee (when no currency conversion is involved); instant: 1.50% of the amount transferred, minimum 0.50 USD

## Sources

- [PayPal merchant fees (United States) (read November 8, 2026)](https://www.paypal.com/us/business/paypal-business-fees)
- [PayPal Developer: Activity Download report (read November 8, 2026)](https://developer.paypal.com/reports/activity-download)
- [PayPal Developer: Transaction event code (T-code) reference (read November 8, 2026)](https://developer.paypal.com/reports/reference/t-codes)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Questions

### How much is the PayPal fee on a $107.00 sale?

At PayPal Checkout's US rate of 3.49% + $0.49, $3.73 + $0.49 = $4.22, which is what the sample file shows.

### Does PayPal charge to withdraw to a bank?

Standard withdrawal to a bank account: no fee (when no currency conversion is involved); instant: 1.50% of the amount transferred, minimum 0.50 USD

## Related

- [Record PayPal sales and fees in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/paypal-to-quickbooks-online/)
- [Record PayPal sales and fees in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/paypal-to-xero/)
- [The PayPal Activity Download, explained](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/paypal-activity-report/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/paypal-fees-bookkeeping/  
Data as of: 2026-11-08
