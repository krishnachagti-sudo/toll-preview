# The FBA Customer Returns report, column by column

Amazon's FBA Customer Returns report has 13 columns and 6 dispositions; DAMAGED and CARRIER DAMAGED mean Amazon takes responsibility, CUSTOMER DAMAGED and DEFECTIVE are not eligible, and a refunded order missing from the report entirely is a candidate claim once checked against the Reimbursements report (7 of the sample's 11 have no return line).

## Check your own refunds

[Open the checker with the sample](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/?marketplace=US&asOf=2026-11-08)

## The columns

FBA Customer Returns report columns, from Amazon's help page

| Download header | Online header | What Amazon says | Used for |
| --- | --- | --- | --- |
| return-date | Returned date | Date returned merchandise was processed at the fulfillment center (DD-MM-YYYY) | Shown with the order |
| amazon-order-id | Order ID | Unique ID in the original shipment for returned item, if available | The join to the refund |
| sku | Merchant SKU | Seller's item identifier | Shown with the order |
| Asin | ASIN | Amazon standard item number | Kept as written |
| fnsku | FNSKU | Fulfillment network SKU | Kept as written |
| product-name | Product name | Name of the product as it appears on Amazon | Kept as written |
| quantity | Quantity | Number of units of this item returned | Units back |
| fulfillment-center-id | FC | Fulfillment center where the returned merchandise was processed | Kept as written |
| detailed disposition | Disposition | Condition of the returned item | Who is responsible |
| reason | Reason | Short description of reason for return as indicated by the customer | Kept as written |
| status | Status | A short description of the status of the customer return | Shown as written |
| lpn | LPN | Unique serial number that identifies specific items throughout the fulfillment process | Kept as written |
| customer-comments | (download only) | Comments submitted by customers about the reason for the return | Kept as written |

## The dispositions

| Disposition | What Amazon says | For a claim |
| --- | --- | --- |
| SELLABLE | The unit was returned to stock and is available for purchase. | Returned, not owed |
| DAMAGED | We take responsibility for the damage. Ownership is transferred to us. | Owed if not reimbursed |
| CUSTOMER DAMAGED | Returned to stock in unsellable condition; the customer is refunded but the unit stays in your inventory as unsellable. | Not eligible |
| DEFECTIVE | Returned to stock in unsellable condition; obviously damaged or the customer stated it is faulty. | Not eligible |
| CARRIER DAMAGED | We take responsibility for the damage. Ownership is transferred to Amazon. | Owed if not reimbursed |
| EXPIRED | Within approximately 50 days of the expiration date; may be set aside as unsellable and removed for disposal. | Returned, not owed |

The help page writes the return date as DD-MM-YYYY; downloads may carry an ISO date and time. The checker reads both, and reads CARRIER\_DAMAGED and CARRIER DAMAGED alike. Statuses: Unit returned to inventory; Reimbursed; Pending repackaging; Repackaged successfully; To be auto- removed; Immediate disposal; Immediate donation; Immediate liquidation; Policy-related disposal.

## Sources

- [Seller Central Help (US): FBA Customer Returns report (overview) (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/200453320)
- [Seller Central Help (US): FBA inventory reimbursement policy (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200213130)

> Not legal or accounting advice: Amazon decides every claim. The sample reports are made up; claim windows and report columns are from Amazon's help pages, read November 8, 2026.

## Questions

### Why is a refunded order missing from the returns report?

At our discretion, we may give a refund without requiring that the customer return the item. These refunds don't appear in the FBA Customer Returns report.

### What does the status Reimbursed mean?

A reimbursement has been approved for the unit. The unit has not been returned to your inventory (allow 5 days for reimbursements to post).

## Related

- [The Reimbursements report](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/guides/reimbursement-report/)
- [Find the refunds that never came back](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/guides/find-unreturned-refunds/)
- [By hand with Amazon's reports](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/vs/manual-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/guides/returns-report-columns/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/guides/returns-report-columns.csv
