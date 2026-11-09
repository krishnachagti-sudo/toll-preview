# eBay reports outside the US

eBay's help describes the same transaction report on its UK, Australian and Canadian sites, with differences: the UK list adds a Regulatory operating fee, and the made-up UK report flattens to 3 sales netting £60.11 with its fee columns (Final value fee - fixed, Final value fee - variable, Regulatory operating fee) kept by name.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=uk)

## What each help page lists

Differences from the US list (eBay Help, read November 8, 2026)

| Site | What differs |
| --- | --- |
| eBay UK | The UK list adds Regulatory operating fee and does not list Seller collected tax or Shipping label; Item ID is "The unique ID for the item". Regulatory operating fee: "A fee calculated as a fixed percentage of the total amount of each sale. This fee is deducted from your funds before you receive your payout". |
| eBay Australia | The Australian list does not list Seller collected tax or Shipping label, and Payout method is "The linked bank account for the payout". |
| eBay Canada | The Canadian list matches the US list except that it does not list Shipping label. |

## What the flattener reads

- Any heading with the word "fee" is a fee column, so a fee one site has and another does not is still kept by name.
- Amounts with £, A $, C $ or $ signs, and decimal commas when the whole file uses them.
- Dates such as 8 Oct 2026, Oct 8, 2026, 2026-10-08, and slash dates read month-first or day-first from the file.
- The currency from a payout currency column, or the one you name. A report with two payout currencies is refused: create one per currency.

Until a real report from each site has been checked, these sites are described from eBay's help only; the column report on the tool shows how each of your columns was found.

## Sources

- [eBay Help (US): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (UK): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.co.uk/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (Australia): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com.au/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (Canada): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.ca/help/selling/selling-fees/reconciling-ebay-sales-transactions?id=4847)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Related

- [eBay UK, one row per sale](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/uk/)
- [The columns explained](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/columns-explained/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/ebay-reports-other-countries/  
Data as of: 2026-11-08
