# eBay sales spreadsheet template (filled in for you)

Download the sheet: 5 rows with item, sale price, shipping, each fee and net already filled, from a made-up 17-row report; your own report fills the same 26 columns.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=us)

## The template, filled

One row per sale (the CSV beside this page has every column)

| Order | sale\_date | items | gross | final\_value\_fee\_variable | shipping\_labels | ad\_and\_other\_fees | kept | your\_cost | profit |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 01-11111-00001 | 2025-12-18 | Vintage Pyrex mixing bowl | 32.50 | -4.31 | -6.85 | 0.00 | 20.94 | -6.00 | 14.94 |
| 02-22222-00002 | 2026-10-03 | Fleece jacket, size M | 24.00 | -3.18 | 0.00 | -1.82 | 18.60 | -4.00 | 14.60 |
| 03-33333-00003 | 2026-10-05 | Minifigure lot x2; Baseplate 32x32 | 46.00 | -6.10 | 0.00 | 0.00 | 30.75 | -16.00 | 14.75 |
| 04-44444-00004 | 2026-10-12 | Camera lens 50mm | 120.00 | -15.90 | -9.40 | 0.00 | 72.32 | -55.00 | 17.32 |
| 05-55555-00005 | 2026-11-02 | Board game, sealed | 23.00 | -3.05 | -7.10 | 0.00 | -10.55 | -8.00 | -18.55 |

## The columns

- One column per fee column in your report, named as eBay named it (here: Final value fee - fixed, Final value fee - variable, International fee).
- other\_deductions\_on\_sale\_row: Gross minus Net on the sale row that the fee columns do not explain (zero when they add up).
- shipping\_labels, ad\_and\_other\_fees, refunds, claims\_and\_disputes, adjustments: eBay's rows with the same order number.
- labels\_outside\_ebay and your\_cost: what you add. kept and profit are worked out.

## Sources

- [eBay Help (US): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (US): Earnings report (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions/earnings-report?id=5481)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Related

- [Profit per item sheet](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/profit-per-item-sheet/)
- [Export to Excel](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/export-to-excel/)
- [Yearly totals for taxes](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/taxes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/spreadsheet-template/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/spreadsheet-template.csv
