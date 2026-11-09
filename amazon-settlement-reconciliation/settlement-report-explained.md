# The Amazon settlement report, column by column

Amazon's Flat File V2 settlement report has 24 columns and puts every amount in one, amount, labelled by amount-type and amount-description; in the sample below, 36 amount rows add up to the total-amount of $188.14 to the cent.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=us&ledger=quickbooks-online)

## The 24 columns

The column names and their order are Amazon's (GET\_V2\_SETTLEMENT\_REPORT\_DATA\_FLAT\_FILE\_V2, a tab-delimited flat file). Amazon does not describe each column, so the table shows what each holds in the made-up sample and what the reconciler does with it.

Flat File V2 settlement report columns, with the sample's values

| Column | # | Summary row | An order row | Used for |
| --- | ---: | --- | --- | --- |
| settlement-id | 1 | 24816093571 | 24816093571 | Groups the rows into settlements |
| settlement-start-date | 2 | 2026-10-24 07:00:00 UTC | (blank) | The period, shown with the answer |
| settlement-end-date | 3 | 2026-11-07 07:00:00 UTC | (blank) | The last part's journal date |
| deposit-date | 4 | 2026-11-09 09:00:00 UTC | (blank) | Checked against the day the money reached the bank |
| total-amount | 5 | 188.14 | (blank) | The proof: the rows must add up to it |
| currency | 6 | USD | (blank) | Decimal places and the currency of every amount |
| transaction-type | 7 | (blank) | Order | Refund rows of price and shipping go to Refunds |
| order-id | 8 | (blank) | 112-0000001-0000001 | Shown in the row file |
| merchant-order-id | 9 | (blank) | (blank) | Kept as written |
| adjustment-id | 10 | (blank) | (blank) | Kept as written |
| shipment-id | 11 | (blank) | (blank) | Kept as written |
| marketplace-name | 12 | (blank) | Amazon.com | Shown with the settlement |
| amount-type | 13 | (blank) | ItemPrice | Read by the word rules |
| amount-description | 14 | (blank) | Principal | Read by the word rules |
| amount | 15 | (blank) | 39.99 | Every amount, summed by period and line |
| fulfillment-id | 16 | (blank) | AFN | Kept as written |
| posted-date | 17 | (blank) | 10/25/26 | The period each row is split into |
| posted-date-time | 18 | (blank) | 2026-10-25 15:20:11 UTC | The period, when you name a time zone |
| order-item-code | 19 | (blank) | (blank) | Kept as written |
| merchant-order-item-id | 20 | (blank) | (blank) | Kept as written |
| merchant-adjustment-item-id | 21 | (blank) | (blank) | Kept as written |
| sku | 22 | (blank) | MUG-BLUE | Shown in the row file |
| quantity-purchased | 23 | (blank) | 1 | Kept as written |
| promotion-id | 24 | (blank) | (blank) | Kept as written |

## How the rows work

- The first row after the header carries the settlement: its id, start and end, deposit-date and total-amount, with no amount.
- Every other row is one amount: an order's price, its tax, the tax Amazon withholds, each fee, a refund, an advertising charge, a reserve. In the sample, order 112-0000002-0000002 takes 6 rows.
- Amazon's changelog lists posted-date (MM/DD/YY) and posted-date-time (YYYY-MM-DD HH:MM:SS UTC).
- Amazon publishes the columns but not a closed list of amount-type and amount-description values; its Finances API docs say of a similar field that breakdownType is an open-ended string; Amazon does not publish a closed list of values. The reconciler shows every value it finds with the line it booked it to.

## The sample, by line

Every amount-type and amount-description in the sample

| Amount type / description | Transaction type | Rows | Total | Booked to |
| --- | --- | ---: | ---: | --- |
| ItemPrice / Principal | Order | 5 | $354.94 | Product sales |
| Promotion / Principal | Order | 1 | -$5.00 | Promotions |
| ItemPrice / Principal | Refund | 1 | -$39.99 | Refunds |
| ItemPrice / Tax | Order | 5 | $28.40 | Sales tax collected |
| ItemPrice / Tax | Refund | 1 | -$3.20 | Sales tax collected |
| ItemWithheldTax / MarketplaceFacilitatorTax-Principal | Order | 5 | -$28.40 | Tax withheld by Amazon |
| ItemWithheldTax / MarketplaceFacilitatorTax-Principal | Refund | 1 | $3.20 | Tax withheld by Amazon |
| ItemFees / Commission | Order | 5 | -$53.25 | Selling fees |
| ItemFees / Commission | Refund | 1 | $6.00 | Selling fees |
| ItemFees / RefundCommission | Refund | 1 | -$1.20 | Selling fees |
| ItemFees / FBAPerUnitFulfillmentFee | Order | 5 | -$34.70 | FBA fees |
| Cost of Advertising / TransactionTotalAmount | other-transaction | 1 | -$42.17 | Advertising |
| other-transaction / Subscription Fee | other-transaction | 1 | -$39.99 | Subscription |
| FBA Inventory Reimbursement / WAREHOUSE\_DAMAGE | other-transaction | 1 | $18.50 | Reimbursements |
| other-transaction / Previous Reserve Amount Balance | other-transaction | 1 | $120.00 | Reserve held and released |
| other-transaction / Current Reserve Amount | other-transaction | 1 | -$95.00 | Reserve held and released |

## Getting the report

- Seller Central, Payments, All Statements: download the settlement. The Payments (settlements) reports you download from Seller Central are tab-delimited text files.
- Through the SP-API it is GET\_V2\_SETTLEMENT\_REPORT\_DATA\_FLAT\_FILE\_V2 and needs the Finance and Accounting role.
- The old Flat File and XML versions will be unavailable for sellers as of November 11, 2026.

## Sources

- [Amazon SP-API: Settlement Reports (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/docs/report-type-values-settlement)
- [Amazon SP-API changelog: Deprecation of two payment settlement report types (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/changelog/update-deprecation-of-two-payment-settlement-report-types)
- [Amazon SP-API: SP-API Deprecation Schedule (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/docs/sp-api-deprecations)
- [Seller Central Help: How do I read my Payments report? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G14921)
- [Amazon SP-API: Get the latest transactions (breakdownType) (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/docs/get-latest-transactions)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Questions

### Can I request an Amazon settlement report on demand?

No. Amazon's SP-API docs say: Settlement reports cannot be requested or scheduled. They are automatically scheduled by Amazon. You download each one after it closes.

### Why is every amount in one column?

In the Flat File V2 report, Price columns are condensed into three general-purpose columns: amount-type, amount-description, amount. So a fee, a price and a tax are separate rows, each with its amount in the amount column.

### Why does my EU settlement report show 95,00?

Amazon's docs say amounts are displayed in local currency formats (for example, 95,00 for EU instead of 95.00). The reconciler reads the decimal mark from the file.

### When do the old settlement reports stop?

Amazon's changelog says the old Flat File and XML settlement reports will be unavailable for sellers as of November 11, 2026. There is no XML report replacement.

## Related

- [Download the sample settlement report](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/sample-settlement-report-csv/)
- [Split a settlement at month end](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-accrual-split/)
- [Why the deposit does not match](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/deposit-doesnt-match/)
- [Reconciling the report in a spreadsheet](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/vs/manual-spreadsheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/settlement-report-explained/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/settlement-report-explained.csv
