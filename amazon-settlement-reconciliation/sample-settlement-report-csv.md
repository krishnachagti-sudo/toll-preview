# Sample Amazon settlement report

This made-up Flat File V2 settlement has the 24 columns Amazon lists and 36 amount rows that add up to its total-amount of $188.14, which ties to two bank deposits of $150.00 and $38.14; $177.77 is posted in October 2026 and $10.37 in November 2026.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=us&ledger=quickbooks-online)

## The rows

Settlement 24816093571: every amount row (the CSV link below has them all)

| Line | Transaction type | Order | Amount type | Description | Amount | Posted | SKU | Period |
| ---: | --- | --- | --- | --- | ---: | --- | --- | --- |
| 3 | other-transaction | (none) | other-transaction | Previous Reserve Amount Balance | 120.00 | 2026-10-24 | (none) | 2026-10 |
| 4 | Order | 112-0000001-0000001 | ItemPrice | Principal | 39.99 | 2026-10-25 | MUG-BLUE | 2026-10 |
| 5 | Order | 112-0000001-0000001 | ItemPrice | Tax | 3.20 | 2026-10-25 | MUG-BLUE | 2026-10 |
| 6 | Order | 112-0000001-0000001 | ItemWithheldTax | MarketplaceFacilitatorTax-Principal | -3.20 | 2026-10-25 | MUG-BLUE | 2026-10 |
| 7 | Order | 112-0000001-0000001 | ItemFees | Commission | -6.00 | 2026-10-25 | MUG-BLUE | 2026-10 |
| 8 | Order | 112-0000001-0000001 | ItemFees | FBAPerUnitFulfillmentFee | -5.40 | 2026-10-25 | MUG-BLUE | 2026-10 |
| 9 | Order | 112-0000002-0000002 | ItemPrice | Principal | 79.98 | 2026-10-29 | MUG-SET | 2026-10 |
| 10 | Order | 112-0000002-0000002 | ItemPrice | Tax | 6.40 | 2026-10-29 | MUG-SET | 2026-10 |
| 11 | Order | 112-0000002-0000002 | ItemWithheldTax | MarketplaceFacilitatorTax-Principal | -6.40 | 2026-10-29 | MUG-SET | 2026-10 |
| 12 | Order | 112-0000002-0000002 | ItemFees | Commission | -12.00 | 2026-10-29 | MUG-SET | 2026-10 |
| 13 | Order | 112-0000002-0000002 | ItemFees | FBAPerUnitFulfillmentFee | -10.80 | 2026-10-29 | MUG-SET | 2026-10 |
| 14 | Order | 112-0000002-0000002 | Promotion | Principal | -5.00 | 2026-10-29 | MUG-SET | 2026-10 |
| 15 | other-transaction | (none) | other-transaction | Subscription Fee | -39.99 | 2026-10-30 | (none) | 2026-10 |
| 16 | Order | 112-0000003-0000003 | ItemPrice | Principal | 24.99 | 2026-10-31 | COASTER-4 | 2026-10 |
| 17 | Order | 112-0000003-0000003 | ItemPrice | Tax | 2.00 | 2026-10-31 | COASTER-4 | 2026-10 |
| 18 | Order | 112-0000003-0000003 | ItemWithheldTax | MarketplaceFacilitatorTax-Principal | -2.00 | 2026-10-31 | COASTER-4 | 2026-10 |
| 19 | Order | 112-0000003-0000003 | ItemFees | Commission | -3.75 | 2026-10-31 | COASTER-4 | 2026-10 |
| 20 | Order | 112-0000003-0000003 | ItemFees | FBAPerUnitFulfillmentFee | -4.25 | 2026-10-31 | COASTER-4 | 2026-10 |
| 21 | other-transaction | (none) | Cost of Advertising | TransactionTotalAmount | -42.17 | 2026-11-01 | (none) | 2026-11 |
| 22 | Order | 112-0000004-0000004 | ItemPrice | Principal | 59.99 | 2026-11-02 | MUG-RED | 2026-11 |
| 23 | Order | 112-0000004-0000004 | ItemPrice | Tax | 4.80 | 2026-11-02 | MUG-RED | 2026-11 |
| 24 | Order | 112-0000004-0000004 | ItemWithheldTax | MarketplaceFacilitatorTax-Principal | -4.80 | 2026-11-02 | MUG-RED | 2026-11 |
| 25 | Order | 112-0000004-0000004 | ItemFees | Commission | -9.00 | 2026-11-02 | MUG-RED | 2026-11 |
| 26 | Order | 112-0000004-0000004 | ItemFees | FBAPerUnitFulfillmentFee | -6.10 | 2026-11-02 | MUG-RED | 2026-11 |
| 27 | Refund | 112-0000001-0000001 | ItemPrice | Principal | -39.99 | 2026-11-03 | MUG-BLUE | 2026-11 |
| 28 | Refund | 112-0000001-0000001 | ItemPrice | Tax | -3.20 | 2026-11-03 | MUG-BLUE | 2026-11 |
| 29 | Refund | 112-0000001-0000001 | ItemWithheldTax | MarketplaceFacilitatorTax-Principal | 3.20 | 2026-11-03 | MUG-BLUE | 2026-11 |
| 30 | Refund | 112-0000001-0000001 | ItemFees | Commission | 6.00 | 2026-11-03 | MUG-BLUE | 2026-11 |
| 31 | Refund | 112-0000001-0000001 | ItemFees | RefundCommission | -1.20 | 2026-11-03 | MUG-BLUE | 2026-11 |
| 32 | other-transaction | (none) | FBA Inventory Reimbursement | WAREHOUSE\_DAMAGE | 18.50 | 2026-11-04 | MUG-RED | 2026-11 |
| 33 | Order | 112-0000005-0000005 | ItemPrice | Principal | 149.99 | 2026-11-05 | MUG-GIFT | 2026-11 |
| 34 | Order | 112-0000005-0000005 | ItemPrice | Tax | 12.00 | 2026-11-05 | MUG-GIFT | 2026-11 |
| 35 | Order | 112-0000005-0000005 | ItemWithheldTax | MarketplaceFacilitatorTax-Principal | -12.00 | 2026-11-05 | MUG-GIFT | 2026-11 |
| 36 | Order | 112-0000005-0000005 | ItemFees | Commission | -22.50 | 2026-11-05 | MUG-GIFT | 2026-11 |
| 37 | Order | 112-0000005-0000005 | ItemFees | FBAPerUnitFulfillmentFee | -8.15 | 2026-11-05 | MUG-GIFT | 2026-11 |
| 38 | other-transaction | (none) | other-transaction | Current Reserve Amount | -95.00 | 2026-11-07 | (none) | 2026-11 |

## The file as Amazon writes it

Tab-delimited, with the summary row first. The first five lines:

```text
settlement-id	settlement-start-date	settlement-end-date	deposit-date	total-amount	currency	transaction-type	order-id	merchant-order-id	adjustment-id	shipment-id	marketplace-name	amount-type	amount-description	amount	fulfillment-id	posted-date	posted-date-time	order-item-code	merchant-order-item-id	merchant-adjustment-item-id	sku	quantity-purchased	promotion-id
24816093571	2026-10-24 07:00:00 UTC	2026-11-07 07:00:00 UTC	2026-11-09 09:00:00 UTC	188.14	USD																		
24816093571						other-transaction						other-transaction	Previous Reserve Amount Balance	120.00		10/24/26	2026-10-24 15:20:11 UTC						
24816093571						Order	112-0000001-0000001				Amazon.com	ItemPrice	Principal	39.99	AFN	10/25/26	2026-10-25 15:20:11 UTC				MUG-BLUE	1	
24816093571						Order	112-0000001-0000001				Amazon.com	ItemPrice	Tax	3.20	AFN	10/25/26	2026-10-25 15:20:11 UTC				MUG-BLUE	1	
```

## As a reconciliation template

- Total: sum the amount column; it must be $188.14, the total-amount.
- By month: sum amount where the posted date is on or before October 31, 2026 ($177.77), and after it ($10.37).
- By line: sum amount by amount-type and amount-description, then group the values into sales, fees, refunds, tax and reserve.

## Sources

- [Amazon SP-API: Settlement Reports (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/docs/report-type-values-settlement)
- [Amazon SP-API changelog: Deprecation of two payment settlement report types (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/changelog/update-deprecation-of-two-payment-settlement-report-types)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Related

- [The columns explained](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/settlement-report-explained/)
- [Reconciling it in a spreadsheet](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/vs/manual-spreadsheet/)
- [Split at month end](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-accrual-split/)
- [A German sample with decimal commas, in Xero](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/xero/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/sample-settlement-report-csv/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/sample-settlement-report-csv.csv
