# Labels bought outside eBay

A label bought outside eBay is not an eBay transaction, so it is not in the report: in the sample, the Lego order's $8.75 label from another site turns $39.50 of eBay net into $30.75 kept.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=us)

## What eBay's help says

- The transaction report's Shipping label rows are "charges or credits related to shipping label purchases and refunds".
- For the Earnings report, eBay says: Charges and credits for shipping labels purchased with methods other than eBay funds, such as PayPal, aren't included in this report.

## Adding them

- Export the labels from the service you used, with the order number on each.
- Give the flattener one line per order: the order number and the label cost.
- It subtracts the label from that sale's kept and lists any order number it cannot find.
- Do not add a label that eBay's report already has as a Shipping label row, or it counts twice.

## Sources

- [eBay Help (US): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (US): Earnings report (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions/earnings-report?id=5481)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Related

- [Profit per item](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/profit-per-item-sheet/)
- [Why one sale has several rows](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/why-multiple-rows-per-sale/)
- [eBay's Earnings report compared](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/vs/ebay-earnings-report/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/labels-bought-outside-ebay/  
Data as of: 2026-11-08
