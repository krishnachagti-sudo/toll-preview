# How to download your eBay transaction report

Seller Hub, Payments, Reports, Transaction report: pick the type and the start and end dates, select Create report, and eBay emails you when the CSV is ready; in the made-up sample below, its 17 rows fold into 5 sales.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=us)

## The steps, from eBay's help

Your transaction report provides a detailed breakdown of all your account activity for a specific date range. It's in CSV format, which you can open with spreadsheet software such as Microsoft Excel or Google Sheets. It shows transaction date, order number, buyer name, payout date, fees, and other information.

## Add the fee and item columns first

Your transaction report includes customizable columns to view your fees. In the same Reports page, select Customize column settings: Customize column settings: Transaction details, Payout details, Shipping details, Item details, or Buyer details; Save. Any customization you make will apply to all future transaction reports. Reset to default settings returns the defaults.

- Turn on the fee columns, so each fee shows on the sale's row.
- Turn on the item details (the title and your SKU), so each sale names what sold.
- Keep the order number on: it is how a label or a fee row is matched to its sale.

## What you get

For an order with a single item, you'll find the order and the item details on a single row of your transaction report. For an order with multiple items, the first row will include the order details, and the following rows will include the item details. An order with multiple quantities of the same item will show as one line item. Labels, other fees, refunds and claims are their own rows. In the sample:

The sample report, by row type

| Row type | Rows |
| --- | ---: |
| Order (sale) | 7 |
| Shipping label | 4 |
| Other fee | 2 |
| Payout | 1 |
| Refund | 1 |
| Claim | 1 |
| Adjustment | 1 |

The flattener folds them into 5 rows, one per sale. [Why one sale has several rows](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/why-multiple-rows-per-sale/).

## Sources

- [eBay Help (US): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (US): Using the Payments tab in Seller Hub (read November 8, 2026)](https://www.ebay.com/help/fees-billing/payouts-payments-paid/seller-hub-payouts-tab?id=4798)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Steps

1. **Open Payments.** In Seller Hub, open the Payments tab.
2. **Reports.** From the menu on the left, select Reports.
3. **Transaction report.** Select Transaction report from the download section.
4. **Type and dates.** Select the transaction Type, and the Start and End date.
5. **Create.** Select Create report. eBay emails you when the report is ready; download the CSV.

## Questions

### Can I add columns to the eBay transaction report?

Yes. eBay's help: select Customize column settings, then Customize column settings: Transaction details, Payout details, Shipping details, Item details, or Buyer details; Save. Any customization you make will apply to all future transaction reports. Reset to default settings returns the defaults.

### Why do the times in my report not match my records?

eBay's help says: The times in your transaction report may not match the transaction times in your records due to the differences in international time zones.

### How long can I download eBay financial statements?

eBay's help says: Financial statements are available to download for 10 years from the date of issue, and only show details for payments processed by eBay. The transaction report is created for any date range you choose.

## Related

- [The columns explained](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/columns-explained/)
- [Export to Excel, one row per sale](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/export-to-excel/)
- [Why one sale has several rows](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/why-multiple-rows-per-sale/)
- [The Earnings report compared](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/vs/ebay-earnings-report/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/download/  
Data as of: 2026-11-08
