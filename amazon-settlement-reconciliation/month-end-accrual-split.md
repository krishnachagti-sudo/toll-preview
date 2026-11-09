# Split an Amazon settlement at month end

Split the settlement by each row's posted date: the sample's $188.14 is $177.77 posted in October 2026 and $10.37 in November 2026, booked as two journals through an Amazon clearing account that the one deposit then clears.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=us&ledger=quickbooks-online)

## The split, line by line

Settlement 24816093571, October 24, 2026 to November 7, 2026

| Period | Posted | Rows | Product sales | Promotions | Refunds | Sales tax collected | Tax withheld by Amazon | Selling fees | FBA fees | Advertising | Subscription | Reimbursements | Reserve held and released | Net | Share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| October 2026 | October 24, 2026 to October 31, 2026 | 18 | $144.96 | -$5.00 |  | $11.60 | -$11.60 | -$21.75 | -$20.45 |  | -$39.99 |  | $120.00 | $177.77 | 94.5% |
| November 2026 | November 1, 2026 to November 7, 2026 | 18 | $209.98 |  | -$39.99 | $13.60 | -$13.60 | -$26.70 | -$14.25 | -$42.17 |  | $18.50 | -$95.00 | $10.37 | 5.5% |
| **Settlement** |  | 36 | $354.94 | -$5.00 | -$39.99 | $25.20 | -$25.20 | -$48.45 | -$34.70 | -$42.17 | -$39.99 | $18.50 | $25.00 | **$188.14** |  |

## The journals

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

Amazon settlement 24816093571, November 2026, November 7, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Amazon sales |  | $209.98 |
| Amazon refunds | $39.99 |  |
| Amazon selling fees | $26.70 |  |
| Amazon FBA fees | $14.25 |  |
| Amazon advertising | $42.17 |  |
| Amazon reimbursements |  | $18.50 |
| Amazon reserve | $95.00 |  |
| Amazon clearing | $10.37 |  |
| **Total** | **$228.48** | **$228.48** |

Together the two journals put $188.14 into Amazon clearing: $177.77 + $10.37. The deposit then moves it to the bank.

## What the posted date means

Statements (also known as Settlement Reports) represent details on cash payouts and include only released transactions paid during a given settlement period. When a deferred transaction is later released, it will move from the Deferred Transactions Report to the Settlement or Date Range reports, and its posted date will update to match the release date. So the split follows when Amazon released the money. For earnings by shipment date, Amazon says to request the Transaction Report for your selected period for accrual accounting and sales-to-earnings reconciliation.

## Sources

- [Amazon SP-API: Settlement Reports (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/docs/report-type-values-settlement)
- [Amazon SP-API changelog: Deprecation of two payment settlement report types (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/changelog/update-deprecation-of-two-payment-settlement-report-types)
- [Seller Central Help: Deferred transactions for accounting and payment reconciliation (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GLRNLZDAKHDBBVBY)
- [Seller Central Help: How do I find my order payment in payment reports? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GGBXCUY3ARH6ULYZ)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Steps

1. **Download the settlement.** In Seller Central, Payments, All Statements, download the settlement that crosses the month end as Flat File V2.
2. **Check it adds up.** Sum the amount column: it must equal total-amount in the first row.
3. **Split by posted date.** Put each row in the month of its posted-date: here $177.77 in October 2026 and $10.37 in November 2026.
4. **Book a journal per month.** Date the first October 31, 2026 and the second November 7, 2026: sales, fees, refunds, tax and reserve each on their own line, the net into an Amazon clearing account.
5. **Clear the deposit.** When the $188.14 reaches the bank, match it from the clearing account; the clearing account goes back to zero.

## Questions

### Does the settlement show when the sale shipped?

Not always. Amazon's help says Transaction reports use posted date, while Statements use release date, so timing may differ between the two. Statements only reflects transactions that were released and included in payout during a settlement period. Deferred transactions are not included.

## Related

- [The settlement period](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/settlement-period/)
- [The month-end checklist](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/month-end-checklist/)
- [In QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/quickbooks/)
- [In Xero](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/xero/)
- [The clearing account in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-quickbooks-online/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-accrual-split/  
Data as of: 2026-11-08
