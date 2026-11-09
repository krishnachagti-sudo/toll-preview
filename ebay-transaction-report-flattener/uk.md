# eBay UK: one row per sale, in pounds

On the made-up eBay UK report, 3 sales netted £60.11 after fees £11.75, promoted listing fees £0.99 and postage labels £9.60; 1 bulk label row had no order number.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=uk)

## The sales

The UK sample, one row per sale

| Order | Date | Items | Gross | Fees | Labels | Ad and other fees | Refunds and claims | Kept |
| --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 11-00001-00001 | October 8, 2026 | Wool scarf | £25.95 | £3.72 | £3.20 | £0.00 | £0.00 | £19.03 |
| 11-00002-00002 | October 14, 2026 | Paperback set (5) | £16.50 | £2.47 | £0.00 | £0.99 | £0.00 | £13.04 |
| 11-00003-00003 | October 21, 2026 | Ceramic vase | £40.00 | £5.56 | £0.00 | £0.00 | £0.00 | £34.44 |

Fee columns found: Final value fee - fixed, Final value fee - variable, Regulatory operating fee. Dates such as "8 Oct 2026" and amounts with a £ sign are read as written; the currency comes from the payout currency column (GBP).

## What eBay's UK help says differently

- Regulatory operating fee: A fee calculated as a fixed percentage of the total amount of each sale. This fee is deducted from your funds before you receive your payout
- The UK list adds Regulatory operating fee and does not list Seller collected tax or Shipping label; Item ID is "The unique ID for the item".

## HMRC and platform reporting

GOV.UK: "You need to report sellers who actively supply or are paid for goods or services on your digital platform." Sellers are exempt if they get 2,000 euros or less (approximately £1,700) for fewer than 30 sales of goods in a year. The flattened year totals are records you can keep beside eBay's own; they do not say what is taxable.

## Sources

- [eBay Help (UK): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.co.uk/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [GOV.UK: Reporting rules for digital platforms (read November 8, 2026)](https://www.gov.uk/guidance/reporting-rules-for-digital-platforms)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Questions

### What is the Regulatory operating fee on an eBay UK report?

eBay's UK help: A fee calculated as a fixed percentage of the total amount of each sale. This fee is deducted from your funds before you receive your payout.

### Does eBay report my sales to HMRC?

GOV.UK's guidance for digital platforms says platforms report sellers who actively supply goods or services, and sellers are exempt if they get 2,000 euros or less (approximately £1,700) for fewer than 30 sales of goods in a year (GOV.UK, updated July 21, 2026). Whether you owe tax is for HMRC's own guidance or an adviser.

## Related

- [Reports outside the US](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/ebay-reports-other-countries/)
- [The columns explained](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/columns-explained/)
- [Year-end checklist](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/year-end-checklist/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/uk/  
Data as of: 2026-11-08
