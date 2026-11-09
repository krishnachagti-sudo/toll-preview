# The Reimbursements report, column by column

Amazon's Reimbursements report has 19 download columns; match amazon-order-id to your refunds, count quantity-reimbursed-total as units paid and amount-total as cash. In the sample, order 112-0000005-0000005 was paid $42.00 and reversed for $42.00, so it nets to nothing and is still owed.

## Check your own refunds

[Open the checker with the sample](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/?marketplace=US&asOf=2026-11-08)

## The columns

Reimbursements report columns, from Amazon's help page

| Download header | Online header | What Amazon says | Used for |
| --- | --- | --- | --- |
| approval-date | Date | The date the reimbursement was approved. | Starts the 60 days to dispute the value |
| reimbursement-id | Reimbursement ID | The unique identifier for this reimbursement. Each reimbursement may include multiple line items. | Named in the dispute text |
| case-id | Case ID | The unique identifier assigned to the case when you request a reimbursement. | Shown with the order |
| amazon-order-id | Amazon Order ID | The unique identifier assigned to the customer order. This field is empty if the reimbursement is not associated with an order. | The join to the refund |
| reason | Reason | The reason for the reimbursement (for example, Damaged: Warehouse). | Shown as written |
| Sku | Merchant SKU | The merchant SKU you assigned to your product. | Kept as written |
| fnsku | FNSKU | The fulfillment network SKU Fulfillment by Amazon assigned to your product. | Kept as written |
| asin | ASIN | The Amazon Standard Identification Number. | Kept as written |
| product-name | Title | The name of your product. | Kept as written |
| condition | Condition | The condition of your item (for example, New). | Kept as written |
| quantity | Quantity | The total number of units reimbursed for this line item. | Kept as written |
| currency-unit | (download only) | The currency for the applicable store. | The currency of the amounts |
| amount-per-unit | Amount Per Unit | The per-unit reimbursement amount for this line item. | Kept as written |
| quantity-reimbursed-cash | Quantity Reimbursed \[Cash\] | The total number of units reimbursed with cash. | Units paid in cash |
| amount-total | Amount Total | The total amount of the cash reimbursement for this line item. | Cash paid, compared with the refund |
| quantity-reimbursed-inventory | Quantity Reimbursed \[Inventory\] | The number of units reimbursed with inventory. | Units paid back in stock |
| quantity-reimbursed-total | Quantity Reimbursed \[Total\] | Cash plus inventory units reimbursed. | Units counted as paid |
| original-reimbursement-id | Original Reimbursement ID | The original reimbursement being adjusted, if present. | Marks a reversal |
| original-reimbursement-type | Original Reimbursement Type | The type of the original reimbursement being adjusted, if present. | Kept as written |

## Reading it

- When more than one reimbursement is processed on the same day for the same issue, they may be combined into a single transaction.
- A reversal has a negative cash quantity and the Original Reimbursement ID of what it reverses (Quantity Reimbursed \[Cash\] \< 0, Quantity Reimbursed \[Inventory\] empty, Quantity Reimbursed \[Total\] \< 0).
- A reimbursement in inventory has quantity-reimbursed-inventory above zero and no cash: the unit came back as stock.
- Reimbursements appear in your account 4-5 business days after the reimbursement is approved.
- Amazon's help gives "Damaged: Warehouse" as one example of the reason; it publishes no full list, so the checker matches by order ID and shows the reason as written.

## Sources

- [Seller Central Help (US): Reimbursements report (overview) (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200732720)
- [Seller Central Help (US): Reversed Reimbursement (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GL9ZDED52WXZUMFD)

> Not legal or accounting advice: Amazon decides every claim. The sample reports are made up; claim windows and report columns are from Amazon's help pages, read November 8, 2026.

## Questions

### What does the Reimbursements report show?

The Reimbursements report provides itemized details for all reimbursements, including those requested by you and those that are generated automatically.

### How long until a reimbursement shows in the report?

Reimbursements can take up to five days to appear in the report after they have been approved.

### Where else can I see reimbursements?

In the Payments dashboard's Transaction view, filter by Other. In the Product Details column, search for Balance Adjustment or FBA Inventory Reimbursement.

## Related

- [The FBA Customer Returns report, column by column](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/guides/returns-report-columns/)
- [Reversed reimbursements](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/guides/re-evaluation-and-reversal/)
- [Find the refunds that never came back](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/guides/find-unreturned-refunds/)
- [The settlement report, column by column](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/settlement-report-explained/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/guides/reimbursement-report/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/guides/reimbursement-report.csv
