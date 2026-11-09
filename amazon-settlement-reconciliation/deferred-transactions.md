# Amazon deferred transactions and the settlement

Under Amazon's standard DD + 7 reserve, an order delivered on November 24, 2026 is released around December 1, 2026 or December 2, 2026 (Amazon's two help examples count 7 and 8 days), so all 7 days of deliveries from November 24, 2026 to November 30, 2026 are paid in a December settlement.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=us&ledger=quickbooks-online)

## Late-November 2026 deliveries

| Delivered | Delivery + 7 | Delivery + 8 | Released in |
| --- | --- | --- | --- |
| November 24, 2026 | December 1, 2026 | December 2, 2026 | December |
| November 25, 2026 | December 2, 2026 | December 3, 2026 | December |
| November 26, 2026 | December 3, 2026 | December 4, 2026 | December |
| November 27, 2026 | December 4, 2026 | December 5, 2026 | December |
| November 28, 2026 | December 5, 2026 | December 6, 2026 | December |
| November 29, 2026 | December 6, 2026 | December 7, 2026 | December |
| November 30, 2026 | December 7, 2026 | December 8, 2026 | December |

Amazon's examples: sold on January 1, delivered on January 6: under DD + 7 the funds become available for disbursement starting on January 14; and ships January 1, delivered January 4, released January 11 under the 7-day deferral. In the absence of valid tracking data, we will use the latest estimated delivery date (EDD).

## What it does to the books

- Statements only reflects transactions that were released and included in payout during a settlement period. Deferred transactions are not included.
- When a deferred transaction is later released, it will move from the Deferred Transactions Report to the Settlement or Date Range reports, and its posted date will update to match the release date.
- Fees that are part of a customer order (such as Referral Fees and FBA Fulfillment Fees) are deferred along with the order payment; other fees (such as Cost of Advertising, Shipping Transportation Charge and Shipping Services purchased through Amazon) will continue to be charged directly to your account at the time of purchase or service billing.
- Invoiced orders placed by Amazon Business customers are deferred while awaiting payment by the buyer, typically within 30-45 days after the order date.

## Finding deferred orders

- Seller Central, Payments, Transaction view: filter by Deferred transactions.
- The Deferred Transaction Report (GET\_DATE\_RANGE\_FINANCIAL\_HOLDS\_DATA): A point-in-time report that contains a list of deferred transactions. A single report can provide up to 10 years of data.
- Amazon's February to March 2026: Transaction reports include deferred and released transactions, with Transaction status and Transaction release date columns.

## Sources

- [Seller Central Help: Deferred transactions for accounting and payment reconciliation (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GLRNLZDAKHDBBVBY)
- [Seller Central Help: Payments based on delivery date (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/202124090)
- [Seller Central Help: How do I find my order payment in payment reports? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GGBXCUY3ARH6ULYZ)
- [Amazon SP-API: Payment Reports (Deferred Transaction Report) (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/docs/report-type-values-payment)
- [Seller Central Help: Payment Date Range Transaction and Summary reports (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200989190)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Questions

### What is a deferred transaction on Amazon?

A deferred transaction is one where you have earned the amount, but it is not yet available for payout.

### Are deferred transactions in the settlement report?

Statements only reflects transactions that were released and included in payout during a settlement period. Deferred transactions are not included.

### Are fees deferred too?

Fees that are part of a customer order (such as Referral Fees and FBA Fulfillment Fees) are deferred along with the order payment. Other fees (such as Cost of Advertising, Shipping Transportation Charge and Shipping Services purchased through Amazon) will continue to be charged directly to your account at the time of purchase or service billing.

## Related

- [The unavailable balance](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/unavailable-balance/)
- [Split a settlement at month end](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-accrual-split/)
- [Why the deposit does not match](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/deposit-doesnt-match/)
- [Month-end close calendar](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-close-calendar-2026-2027/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/deferred-transactions/  
Data as of: 2026-11-08
