# Booking the Amazon reserve

Book the reserve to a balance-sheet account, not to expenses: across the two sample settlements, $120.00 held by Amazon comes back, $95.00 is held, $95.00 comes back and $20.00 is held, so the reserve account ends at $20.00, what Amazon still holds.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=us&ledger=quickbooks-online)

## The reserve ledger

| Entry | Date | Debit (held) | Credit (released) | Balance |
| --- | --- | ---: | ---: | ---: |
| Held before the first sample settlement | October 24, 2026 |  |  | $120.00 |
| Settlement 24816093571: released | October 24, 2026 |  | $120.00 | $0.00 |
| Settlement 24816093571: held | November 7, 2026 | $95.00 |  | $95.00 |
| Settlement 24816093572: released | November 7, 2026 |  | $95.00 | $0.00 |
| Settlement 24816093572: held | November 21, 2026 | $20.00 |  | $20.00 |

## In the journal

Amazon settlement 24816093571, October 2026, October 31, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Amazon sales |  | $144.96 |
| Amazon promotions | $5.00 |  |
| Amazon selling fees | $21.75 |  |
| Amazon FBA fees | $20.45 |  |
| Amazon subscription fee | $39.99 |  |
| Amazon reserve |  | $120.00 |
| Amazon clearing | $177.77 |  |
| **Total** | **$264.96** | **$264.96** |

The $120.00 release is a credit to Amazon reserve in the October journal; the $95.00 hold is a debit in the November one. Neither touches income or expenses.

## Why Amazon holds it

- open A-to-z Guarantee claims
- chargebacks in the last 90 days
- performance below benchmarks
- account under review
- income tax withholding required by local regulations

Some claims can take up to 14 days or longer to resolve. The reserve rows are found by the word "reserve" in amount-description, the reconciler's own rule.

## Sources

- [Seller Central Help: What is account level reserve? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200136810)
- [Seller Central Help: Payments based on delivery date (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/202124090)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Steps

1. **Open a reserve account.** Create "Amazon reserve" as a current asset: the money is still yours, held by Amazon.
2. **Book each release.** A "previous reserve" row is money coming back: credit the reserve account ($120.00 in the first sample).
3. **Book each new hold.** A "current reserve" row is money held: debit the reserve account ($95.00 in the first sample).
4. **Compare with Amazon.** The account's balance should equal what Amazon holds after the last settlement: $20.00 after the second sample.

## Questions

### What is the Amazon reserve?

Amazon's help calls the account level reserve the amount of money that is reserved to ensure that you have enough funds to fulfill any financial obligations, such as refunds, claims, or chargebacks not covered by Delivery date-based reserve policies.

## Related

- [The unavailable balance](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/unavailable-balance/)
- [A negative settlement](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/negative-balance-next-deposit/)
- [In QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/quickbooks/)
- [The month-end checklist](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/month-end-checklist/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/amazon-reserve-bookkeeping/  
Data as of: 2026-11-08
