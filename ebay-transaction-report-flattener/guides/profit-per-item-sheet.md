# Profit per item from your eBay report

In the made-up report, the camera lens kept $72.32 after fees, its label and a $20.00 partial refund, and made $17.32 over its $55.00 cost; the board game lost $18.55 once a $23.00 claim came back.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=us)

## Every sale with its profit

The sample with costs per item (and one label bought outside eBay)

| Order | Date | Items | Gross | Fees | Labels | Ad and other fees | Refunds and claims | Kept | Your cost | Profit |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 01-11111-00001 | December 18, 2025 | Vintage Pyrex mixing bowl | $32.50 | $4.71 | $6.85 | $0.00 | $0.00 | $20.94 | $6.00 | $14.94 |
| 02-22222-00002 | October 3, 2026 | Fleece jacket, size M | $24.00 | $3.58 | $0.00 | $1.82 | $0.00 | $18.60 | $4.00 | $14.60 |
| 03-33333-00003 | October 5, 2026 | Minifigure lot x2; Baseplate 32x32 | $46.00 | $6.50 | $8.75 | $0.00 | $0.00 | $30.75 | $16.00 | $14.75 |
| 04-44444-00004 | October 12, 2026 | Camera lens 50mm | $120.00 | $18.28 | $9.40 | $0.00 | -$20.00 | $72.32 | $55.00 | $17.32 |
| 05-55555-00005 | November 2, 2026 | Board game, sealed | $23.00 | $3.45 | $7.10 | $0.00 | -$23.00 | -$10.55 | $8.00 | -$18.55 |

The Minifigure lot and Baseplate sold in one order: eBay puts the order details on the first row and the items on the rows after it (eBay's help), so the cost is $16.00 for 3 units and one label of $8.75 bought elsewhere.

## What eBay's Earnings report already does

eBay's Earnings report also takes your cost ([compared here](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/vs/ebay-earnings-report/)). The flattener adds each fee by name, labels from anywhere, and the rows with no order number.

## Sources

- [eBay Help (US): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (US): Earnings report (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions/earnings-report?id=5481)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Steps

1. **Join by order number.** Fold every row with the same order number into the sale: its label, its ad fee, refunds and claims.
2. **Keep each fee.** Keep each fee column on the sale's row, by its own name.
3. **Add your cost.** Add what each item cost you per unit, by Item ID or SKU, times the quantity sold.
4. **Net per item.** Kept (the sum of eBay's Net amount for the order, minus labels bought elsewhere) minus your cost is the profit.
5. **Sort.** Sort by profit to find the items that lose money once labels, ad fees and returns are in.

## Related

- [Spreadsheet template](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/spreadsheet-template/)
- [Refunds and claims](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/refunds-and-returns/)
- [Labels bought outside eBay](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/labels-bought-outside-ebay/)
- [eBay's Earnings report compared](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/vs/ebay-earnings-report/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/profit-per-item-sheet/  
Data as of: 2026-11-08
