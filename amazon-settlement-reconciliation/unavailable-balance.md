# Amazon's unavailable balance and reserve

Money Amazon holds back shows in the settlement as reserve rows: in the sample, the previous reserve of $120.00 comes back and a new reserve of $95.00 is held, so the deposit is $25.00 more than the period's sales, fees and refunds alone.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=us&ledger=quickbooks-online)

## The two reserves

- Account level reserve: the amount of money that is reserved to ensure that you have enough funds to fulfill any financial obligations, such as refunds, claims, or chargebacks not covered by Delivery date-based reserve policies. For example, a $40 chargeback and a $20 open A-to-z claim make a $60 account level reserve.
- Delivery-date reserve: The standard reserve period is 7 days after delivery date (“DD + 7” reserve policy). Amazon now shows these as deferred transactions, which do not appear in the settlement until they are released.

## Reasons Amazon gives for an account level reserve

- open A-to-z Guarantee claims
- chargebacks in the last 90 days
- performance below benchmarks
- account under review
- income tax withholding required by local regulations

## The reserve rows in the sample

| Row | Posted | Amount |
| --- | --- | ---: |
| Previous Reserve Amount Balance | October 24, 2026 | $120.00 |
| Current Reserve Amount | November 7, 2026 | -$95.00 |

The reconciler finds these rows by the word "reserve" in amount-description (its own rule; Amazon publishes no list of values) and books them to a reserve account on the balance sheet. In the sample they net to $25.00.

## Sources

- [Seller Central Help: What is account level reserve? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200136810)
- [Seller Central Help: Payments based on delivery date (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/202124090)
- [Seller Central Help: Deferred transactions for accounting and payment reconciliation (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GLRNLZDAKHDBBVBY)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Questions

### Why is Amazon holding my money?

Amazon's help calls the account level reserve the amount of money that is reserved to ensure that you have enough funds to fulfill any financial obligations, such as refunds, claims, or chargebacks not covered by Delivery date-based reserve policies. Common reasons: open A-to-z Guarantee claims; chargebacks in the last 90 days; performance below benchmarks; account under review; income tax withholding required by local regulations.

### How long does a delivery-date reserve last?

The standard reserve period is 7 days after delivery date (“DD + 7” reserve policy). Your reserve period may be extended following an assessment of your overall risk and historical performance.

## Related

- [Booking the reserve](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/amazon-reserve-bookkeeping/)
- [Deferred transactions](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/deferred-transactions/)
- [Why the deposit does not match](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/deposit-doesnt-match/)
- [A negative settlement](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/negative-balance-next-deposit/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/unavailable-balance/  
Data as of: 2026-11-08
