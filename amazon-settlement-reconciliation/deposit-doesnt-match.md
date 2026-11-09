# Why the Amazon deposit does not match the settlement

In the sample, the settlement's total-amount is $188.14 but the first bank line is $150.00, $38.14 short; Amazon's help says one payment can come from two payers, and the second deposit of $38.14 closes the gap.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=us&ledger=quickbooks-online&deposits=150.00)

## The bridge

| Step | Amount |
| --- | ---: |
| Settlement total-amount | $188.14 |
| First bank deposit | $150.00 |
| Gap | $38.14 |
| Second bank deposit (the other payer) | $38.14 |
| **Left** | **$0.00** |

## Eight causes and where to look

| Cause | What Amazon says | Where to look |
| --- | --- | --- |
| Two payers | Your bank statement might show that Amazon's payments come from more than one source: Amazon Payments, Inc. and Amazon Services LLC. | Two bank lines on or near the same day that add up to total-amount. |
| Still in transit | It can take up to five business days for your money to appear in your bank account after we initiate payment. | deposit-date in the report's first row, against the bank date. |
| Reserve held or released | Amazon's account level reserve is the amount of money that is reserved to ensure that you have enough funds to fulfill any financial obligations, such as refunds, claims, or chargebacks not covered by Delivery date-based reserve policies. | Reserve rows in the report (amount-description names a reserve). |
| Deferred transactions | Statements only reflects transactions that were released and included in payout during a settlement period. Deferred transactions are not included. | Seller Central, Payments: the deferred transactions in the Transaction view. |
| A negative balance carried | A negative balance is when the amount of fees you owe and refunds you have issued exceeds your sales during a settlement period. If your negative balance is not resolved by your next settlement, you will need to make a payment. | A negative total-amount, or the next settlement starting below zero. |
| Currency conversion | A settlement in one currency paid into a bank account in another arrives converted. | The report's currency column against the bank account's currency. |
| A bank account change | Whenever you add or update your bank account information, a mandatory three-day security hold takes effect. | Seller Central, Settings, Deposit methods. |
| Express payout | Amazon offers Express payout to receive transfers within twenty-four hours, so money can leave before the settlement's deposit-date. | Seller Central, Payments: the payouts list. |

## The rows still add up

A gap with the bank is different from a gap inside the report. Here the 36 rows add up to $188.14, the total-amount, so the report is whole and the difference is on the bank side.

## Sources

- [Seller Central Help: How Amazon transfers payments (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G19321)
- [Seller Central Help: When will I be paid? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G14911)
- [Seller Central Help: What is account level reserve? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200136810)
- [Seller Central Help: Deferred transactions for accounting and payment reconciliation (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GLRNLZDAKHDBBVBY)
- [Seller Central Help: Negative balance (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G16261)
- [Seller Central Help: Why didn't I get paid? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G19301)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Questions

### Why is my Amazon deposit less than the settlement?

One common reason: Your bank statement might show that Amazon's payments come from more than one source: Amazon Payments, Inc. and Amazon Services LLC. In the sample, the first deposit is $150.00 and the second, $38.14, makes up the $188.14 total.

### How long can an Amazon deposit take?

It can take up to five business days for your money to appear in your bank account after we initiate payment.

## Related

- [The unavailable balance](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/unavailable-balance/)
- [Deferred transactions](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/deferred-transactions/)
- [A negative settlement](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/negative-balance-next-deposit/)
- [The settlement report explained](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/settlement-report-explained/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/deposit-doesnt-match/  
Data as of: 2026-11-08
