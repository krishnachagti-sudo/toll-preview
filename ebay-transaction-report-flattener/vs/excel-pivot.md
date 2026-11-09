# An Excel pivot of the eBay report

A pivot on order number sums each sale's Net amount, but rows with no order number fall into a "(blank)" group (3 rows in the sample, including a $18.94 bulk label row), and a column with text such as dashes is counted, not summed, until it is cleaned.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=us)

## Where it breaks

- Rows with no order number: a bulk label or a subscription fee lands in "(blank)", not on a sale.
- Text in amount columns: If Excel interprets your data as text, the data is displayed as a COUNT.
- Multi-item orders: For an order with multiple items, the first row will include the order details, and the following rows will include the item details. An order with multiple quantities of the same item will show as one line item. The item rows need a fill-down of the order number before titles can be joined.
- Payouts and transfers: they are rows too, and must be filtered out of a sales pivot.
- No proof: the pivot does not show that every row's Net amount landed somewhere.

## When Excel is better

- You know pivots and want full control of every column.
- You want to add your own grouping (by category, by month) in the same workbook.

## When the flattener is better

- Labels, ad fees and item rows resolve to one line per sale without cleaning.
- Rows with no order number are listed, or spread by gross and marked.
- The proof shows the Net amount is accounted for to the cent.

## Sources

- [Microsoft Support: Create a PivotTable to analyze worksheet data (read November 8, 2026)](https://support.microsoft.com/en-us/office/create-a-pivottable-to-analyze-worksheet-data-a9a84538-bfe9-40a9-a8e9-f99134456576)
- [eBay Help (US): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Steps

1. **Clean the sheet.** Microsoft: "Your data should be organized in columns with a single header row." Delete any lines above the header row.
2. **Insert the pivot.** Microsoft: "Select the cells you want to create a PivotTable from. Select Insert \> PivotTable."
3. **Rows.** Put the order number in Rows.
4. **Values.** Put Net amount and each fee in Values. By default, PivotTable fields placed in the Values area are displayed as a SUM.
5. **Check.** If a column shows counts, its cells hold text: If Excel interprets your data as text, the data is displayed as a COUNT.

## Related

- [Export to Excel, one row per sale](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/export-to-excel/)
- [Reconciling an Amazon settlement in a spreadsheet](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/vs/manual-spreadsheet/)
- [Why one sale has several rows](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/why-multiple-rows-per-sale/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/vs/excel-pivot/  
Data as of: 2026-11-08
