# A negative Amazon settlement

The sample settlement is -$132.55: $149.99 of refunds plus advertising, storage fees and a new reserve outweigh $24.99 of sales and a $95.00 reserve release, so Amazon deposits nothing and the $132.55 is owed to Amazon.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=negative&ledger=quickbooks-online)

## The settlement, line by line

| Line | Amount |
| --- | ---: |
| Product sales | $24.99 |
| Refunds | -$149.99 |
| Sales tax collected | -$10.00 |
| Tax withheld by Amazon | $10.00 |
| Selling fees | $14.25 |
| FBA fees | -$33.00 |
| Advertising | -$63.80 |
| Reserve released less held | $75.00 |
| **Total-amount** | **-$132.55** |

## What Amazon says happens next

- If your negative balance is not resolved by your next settlement, you will need to make a payment.
- We might charge your credit card to cover the selling fees in this situation.
- Refunds cost more than the sale's net: refund a customer the $10.00 total sales price of a product in a category with a 15% referral fee: a charge of $8.80 ($10.00 + $0.30 refund administration fee - $1.50 referral fee).

## The journal

Amazon settlement 24816093572, November 2026, November 21, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Amazon sales |  | $24.99 |
| Amazon refunds | $149.99 |  |
| Amazon selling fees |  | $14.25 |
| Amazon FBA fees | $33.00 |  |
| Amazon advertising | $63.80 |  |
| Amazon reserve |  | $75.00 |
| Amazon clearing |  | $132.55 |
| **Total** | **$246.79** | **$246.79** |

Amazon clearing is credited $132.55: it is a debt to Amazon until the next settlement covers it or you pay it.

## Sources

- [Seller Central Help: Negative balance (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G16261)
- [Seller Central Help: Why didn't I get paid? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G19301)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Questions

### Why is my Amazon settlement negative?

Amazon's help: your account may have a negative balance if the amount of fees you owe and refunds you have issued exceeds your sales during a settlement period.

### What happens to a negative Amazon balance?

If your negative balance is not resolved by your next settlement, you will need to make a payment. We might charge your credit card to cover the selling fees in this situation.

## Related

- [Why the deposit does not match](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/deposit-doesnt-match/)
- [Booking the reserve](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/amazon-reserve-bookkeeping/)
- [The unavailable balance](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/unavailable-balance/)
- [A negative payout from Stripe, Shopify or PayPal](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/negative-payout/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/negative-balance-next-deposit/  
Data as of: 2026-11-08
