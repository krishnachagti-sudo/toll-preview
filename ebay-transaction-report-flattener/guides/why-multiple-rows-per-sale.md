# Why one eBay sale has several rows

Because the report lists transactions, not sales: in the sample the camera lens is on 3 rows (the sale, its shipping label and a partial refund) that share order number 04-44444-00004, and folded together they keep $72.32, not the sale row's $101.72.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=us)

## The rows of one sale

Order 04-44444-00004 as eBay's report lists it (made-up values)

| Line | Transaction date | Type | Gross transaction amount | Net amount | Description |
| --- | --- | --- | --- | --- | --- |
| 11 | 2026-10-12 | Order | 120.00 | 101.72 |  |
| 12 | 2026-10-12 | Shipping label | -- | -9.40 | USPS Priority Mail |
| 13 | 2026-10-20 | Refund | -20.00 | -20.00 | Partial refund |

## The row types, in eBay's words

Row types and what the flattener does

| Row | eBay's help | Flattener |
| --- | --- | --- |
| Order | For an order with a single item, you'll find the order and the item details on a single row of your transaction report. | Opens the sale |
| Shipping label | Charges or credits related to shipping label purchases and refunds | Folded into its sale; with no order number, listed apart |
| Other fee | eBay fees that are not part of the final value fees from a sale, for example, subscription fees, listing upgrades, ad fees | Folded into its sale; with no order number, listed apart |
| Claim | Charges or credits related to eBay Money Back Guarantee (eMBG) refunds, including Item Not Received cases and Not as Described returns | Folded into its sale |
| Payment dispute | When a buyer requests their money back by reporting an issue with their order to their bank, credit card provider, PayPal, or other payment institution | Folded into its sale |
| Adjustment | Charges or credits initiated by eBay, for example, if eBay issues a credit to the seller | Folded into its sale, or listed apart |
| Hold | Funds that are unavailable while we resolve an issue with an order or an account | Money moved: left out of sales |
| Charge | Amounts recouped from your on-file payment methods for fees and other selling costs owed to eBay | Money moved: left out of sales |
| Payout, transfer | The Payments tab lists sales, refunds, claims, disputes, holds, shipping labels, transfers (funds transferring in or out from your on-file payment method), and payouts | Money moved: left out of sales |

## Check the total

Every row's Net amount should land somewhere. In the sample the file's Net amount totals $64.00: $140.81 in sales, -$18.89 on rows with no order number and -$57.92 of payouts, to the cent.

## Sources

- [eBay Help (US): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (US): Using the Payments tab in Seller Hub (read November 8, 2026)](https://www.ebay.com/help/fees-billing/payouts-payments-paid/seller-hub-payouts-tab?id=4798)
- [eBay Community: Why is there no way to get all the sales info & fees for specific items?, a seller's description of the layout (read November 8, 2026)](https://community.ebay.com/t5/Selling/Why-is-there-no-way-to-get-all-the-sales-info-fees-for-specific/td-p/33329855)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Questions

### Why does a multi-item order show several rows?

eBay's help: For an order with multiple items, the first row will include the order details, and the following rows will include the item details. An order with multiple quantities of the same item will show as one line item.

### Does the sale row's Net amount include the shipping label?

No: on eBay's report the label is its own row ("Charges or credits related to shipping label purchases and refunds"). In the sample the camera lens's sale row nets $101.72, and with its label and a refund the order keeps $72.32.

## Related

- [The columns explained](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/columns-explained/)
- [Ad fees in the report](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/ad-fees-in-report/)
- [Refunds and claims](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/refunds-and-returns/)
- [Export to Excel](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/export-to-excel/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/why-multiple-rows-per-sale/  
Data as of: 2026-11-08
