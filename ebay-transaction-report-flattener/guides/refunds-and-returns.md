# Refunds and claims in the eBay report

A refund or claim is its own row with the sale's order number: the sample camera lens kept $72.32 after a $20.00 partial refund 8 days later, and the board game ended at -$10.55 after a $23.00 Item Not Received claim in a later month.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=us)

## The rows

Refund and claim rows in the sample

| Line | Transaction date | Type | Order ID | Gross transaction amount | Net amount | Description |
| --- | --- | --- | --- | --- | --- | --- |
| 13 | 2026-10-20 | Refund | 04-44444-00004 | -20.00 | -20.00 | Partial refund |
| 17 | 2026-11-15 | Claim | 05-55555-00005 | -23.00 | -23.00 | Item not received |

## Matching and dates

- Each row carries the order number, so it folds into its sale wherever it falls in the report.
- In the yearly and monthly totals each row counts on its own date: a refund in January belongs to January.
- To catch a refund on last year's sale, create the report for a range that includes both dates; a refund row with no sale row in the file is flagged as an earlier sale.

## Sources

- [eBay Help (US): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Questions

### What is a claim on the eBay transaction report?

eBay's help: Charges or credits related to eBay Money Back Guarantee (eMBG) refunds, including Item Not Received cases and Not as Described returns.

### What is a payment dispute?

eBay's help: When a buyer requests their money back by reporting an issue with their order to their bank, credit card provider, PayPal, or other payment institution.

## Related

- [Profit per item](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/profit-per-item-sheet/)
- [Yearly totals for taxes](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/taxes/)
- [Why one sale has several rows](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/why-multiple-rows-per-sale/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/refunds-and-returns/  
Data as of: 2026-11-08
