# Ad fees in the eBay transaction report

Ad fees are Other fee rows, not part of the sale row: the sample fleece jacket's sale row nets $20.42, and its $1.82 promoted listing fee row (same order number) brings it to $18.60; a $4.95 store subscription fee has no order number and stays apart unless you spread it.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=us)

## In the report

Other fee rows in the sample

| Line | Transaction date | Type | Order ID | Net amount | Description |
| --- | --- | --- | --- | --- | --- |
| 5 | 2026-10-03 | Other fee | 02-22222-00002 | -1.82 | Promoted Listings - General fee |
| 14 | 2026-10-31 | Other fee | -- | -4.95 | Store subscription fee |

## Fee rows with no order number

Some other fees belong to the account, not a sale (eBay's examples include subscription fees). The flattener lists them apart. If you choose to spread them, together with label rows that have no order number, they are shared over the sales in proportion to gross: in the sample $23.89 in all, each share marked.

## Sources

- [eBay Help (US): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Community: Why is there no way to get all the sales info & fees for specific items?, a seller's description of the layout (read November 8, 2026)](https://community.ebay.com/t5/Selling/Why-is-there-no-way-to-get-all-the-sales-info-fees-for-specific/td-p/33329855)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Questions

### What are Other fees on the eBay transaction report?

eBay's help: eBay fees that are not part of the final value fees from a sale, for example, subscription fees, listing upgrades, ad fees.

## Related

- [Why one sale has several rows](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/why-multiple-rows-per-sale/)
- [The columns explained](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/columns-explained/)
- [Profit per item](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/profit-per-item-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/ad-fees-in-report/  
Data as of: 2026-11-08
