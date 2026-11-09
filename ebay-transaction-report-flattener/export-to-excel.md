# Export eBay sales to Excel, one row per sale

eBay's transaction report is a CSV that opens in Excel, but one sale spans several rows; flattened, the sample's 17 rows become 5 rows, and the fleece jacket's line shows gross $24.00, fees $3.58, an ad fee of $1.82 and $18.60 kept.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=us&costs=none)

## Before and after

In eBay's report: the fleece jacket on two rows

| Line | Type | Order ID | Gross transaction amount | Final value fee - fixed | Final value fee - variable | Net amount | Description |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | Order | 02-22222-00002 | 24.00 | -0.40 | -3.18 | 20.42 |  |
| 5 | Other fee | 02-22222-00002 | -- | -- | -- | -1.82 | Promoted Listings - General fee |

Flattened: one row per sale

| Order | Date | Items | Gross | Fees | Labels | Ad and other fees | Refunds and claims | Kept |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 01-11111-00001 | December 18, 2025 | Vintage Pyrex mixing bowl | $32.50 | $4.71 | $6.85 | $0.00 | $0.00 | $20.94 |
| 02-22222-00002 | October 3, 2026 | Fleece jacket, size M | $24.00 | $3.58 | $0.00 | $1.82 | $0.00 | $18.60 |
| 03-33333-00003 | October 5, 2026 | Minifigure lot x2; Baseplate 32x32 | $46.00 | $6.50 | $0.00 | $0.00 | $0.00 | $39.50 |
| 04-44444-00004 | October 12, 2026 | Camera lens 50mm | $120.00 | $18.28 | $9.40 | $0.00 | -$20.00 | $72.32 |
| 05-55555-00005 | November 2, 2026 | Board game, sealed | $23.00 | $3.45 | $7.10 | $0.00 | -$23.00 | -$10.55 |

It's in CSV format, which you can open with spreadsheet software such as Microsoft Excel or Google Sheets (eBay's help). The flattened file is a plain CSV too, with every amount as a number, so Excel sums it without fixing text cells.

## Sources

- [eBay Help (US): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [Microsoft Support: Create a PivotTable to analyze worksheet data (read November 8, 2026)](https://support.microsoft.com/en-us/office/create-a-pivottable-to-analyze-worksheet-data-a9a84538-bfe9-40a9-a8e9-f99134456576)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Steps

1. **Create the report.** Seller Hub, Payments, Reports, Transaction report: choose the type and dates and select Create report.
2. **Download the CSV.** eBay emails you when it is ready. Keep the file as it is; do not open and re-save it first.
3. **Preview it.** Drop the CSV into the flattener. The preview runs in your browser: the totals by year, the proof and the first sales.
4. **Get every sale.** Get the CSV files: one row per sale, totals by year and by month, and the rows without an order number.
5. **Open in Excel.** Open the one-row-per-sale CSV in Excel or Google Sheets. Each fee column keeps the name it had in eBay's report.

## Related

- [Excel pivot of the report: where it breaks](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/vs/excel-pivot/)
- [Spreadsheet template](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/spreadsheet-template/)
- [Profit per item sheet](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/profit-per-item-sheet/)
- [How to download the report](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/download/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/export-to-excel/  
Data as of: 2026-11-08
