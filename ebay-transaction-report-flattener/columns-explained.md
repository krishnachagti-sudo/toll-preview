# The eBay transaction report, column by column

eBay's help lists 21 details for the US transaction report, from Order ID to Exchange rate, and the UK page adds the Regulatory operating fee; a sale's fee columns are on its own row, while its shipping label, other fees (ad fees), claims and adjustments are separate rows with the same order number.

## Run this example in the flattener

[Open this report in the flattener](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/?sample=us)

## Every detail, in eBay's words

The definitions are eBay's. eBay does not publish the exact CSV headings, so the third column shows the heading the made-up sample uses (eBay's help name) and the flattener finds your columns by these names, then by word, and shows how it found each.

Transaction report details (eBay Help, read November 8, 2026)

| Detail | eBay's definition | Sample heading | In the flattener | Listed for |
| --- | --- | --- | --- | --- |
| Order ID | The unique ID for your order | "Order ID" | Folds every row with this number into one sale | US, UK, AU, CA |
| Item ID | The unique ID for your eBay listing | "Item ID" | Names the items; matches your cost | US, UK, AU, CA |
| Payout ID | The unique ID for the payout | "Payout ID" | Kept as written | US, UK, AU, CA |
| Reference ID | The unique ID for the transaction | (not in the sample) | Kept as written | US, UK, AU, CA |
| Transaction ID | The unique ID that combines information about a buyer, item, and item price | (not in the sample) | Not needed | US, UK, AU, CA |
| Gross transaction amount | The total payment for a transaction before any fees or credits are applied | "Gross transaction amount" | Gross of the sale | US, UK, AU, CA |
| Net amount | The total payment for a transaction after any fees or credits are applied | "Net amount" | Summed per order: what you kept | US, UK, AU, CA |
| Payout method | The linked checking account for the payout | (not in the sample) | Not needed | US, UK, AU, CA |
| Payout status | The status of the payout transaction | (not in the sample) | Not needed | US, UK, AU, CA |
| Reason for hold | Additional information about a hold transaction status | (not in the sample) | Not needed | US, UK, AU, CA |
| Claim | Charges or credits related to eBay Money Back Guarantee (eMBG) refunds, including Item Not Received cases and Not as Described returns | (not in the sample) | A row type: folded into its sale | US, UK, AU, CA |
| Payment dispute | When a buyer requests their money back by reporting an issue with their order to their bank, credit card provider, PayPal, or other payment institution | (not in the sample) | A row type: folded into its sale | US, UK, AU, CA |
| Hold | Funds that are unavailable while we resolve an issue with an order or an account | (not in the sample) | A row type: listed apart as money moved | US, UK, AU, CA |
| Seller collected tax | Tax collected by the seller on a sold item | "Seller collected tax" | Shown on the sale's row | US, CA |
| Final value fee | A fee calculated as a variable percentage of the total amount of each sale, plus a fixed amount on each sale. This fee is deducted from your funds before you receive your payout | "Final value fee - variable" | Each fee column kept by name | US, UK, AU, CA |
| Regulatory operating fee | A fee calculated as a fixed percentage of the total amount of each sale. This fee is deducted from your funds before you receive your payout | (not in the sample) | A fee column, kept by name | UK |
| Other fees | eBay fees that are not part of the final value fees from a sale, for example, subscription fees, listing upgrades, ad fees | (not in the sample) | A row type: folded into its sale (ad fees) | US, UK, AU, CA |
| Shipping label | Charges or credits related to shipping label purchases and refunds | (not in the sample) | A row type: folded into its sale, or listed apart | US |
| Charge | Amounts recouped from your on-file payment methods for fees and other selling costs owed to eBay | (not in the sample) | A row type: listed apart as money moved | US, UK, AU, CA |
| Adjustment | Charges or credits initiated by eBay, for example, if eBay issues a credit to the seller | (not in the sample) | A row type: folded into its sale, or listed apart | US, UK, AU, CA |
| Transaction currency | The currency the buyer used to pay for the transaction | (not in the sample) | Not needed | US, UK, AU, CA |
| Exchange rate | The exchange rate used by eBay if the transaction currency and payout currency are different | (not in the sample) | Not needed | US, UK, AU, CA |

## Columns the flattener reads

- Type (transaction report: Type): required
- Transaction date (transaction report: transaction date): required
- Order ID (transaction report: Order ID, order number)
- Item ID (transaction report: Item ID)
- Item title (found by word)
- Quantity (found by word)
- SKU / custom label (found by word)
- Item subtotal (Earnings report: Item subtotal)
- Shipping and handling (Earnings report: Shipping and handling)
- Seller collected tax (transaction report: Seller collected tax)
- Gross transaction amount (transaction report: Gross transaction amount): required
- Net amount (transaction report: Net amount): required
- Payout ID (transaction report: Payout ID)
- Payout date (transaction report: payout date)
- Description (found by word)
- Payout currency (found by word)
- Reference ID (transaction report: Reference ID)

Any other heading with the word "fee" is a fee column and is kept on the sale's row by its own name; a heading with "tax" is shown apart. You can name any column in the settings.

## Sources

- [eBay Help (US): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (UK): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.co.uk/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (Australia): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.com.au/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (Canada): Reconciling your eBay sales transactions (read November 8, 2026)](https://www.ebay.ca/help/selling/selling-fees/reconciling-ebay-sales-transactions?id=4847)
- [eBay Help (US): Earnings report (read November 8, 2026)](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions/earnings-report?id=5481)

> Not tax or accounting advice: this is arithmetic on eBay's own transaction report. The sample reports are made up; their headings are the names eBay's help uses for these details, and your own report's headings may differ (the tool shows how it found each column).

## Questions

### What is the final value fee on the eBay transaction report?

eBay's help: A fee calculated as a variable percentage of the total amount of each sale, plus a fixed amount on each sale. This fee is deducted from your funds before you receive your payout.

### What does Charge mean on the eBay transaction report?

eBay's help: Amounts recouped from your on-file payment methods for fees and other selling costs owed to eBay.

### What does Adjustment mean on the eBay transaction report?

eBay's help: Charges or credits initiated by eBay, for example, if eBay issues a credit to the seller.

### What is the difference between Gross transaction amount and Net amount?

Gross transaction amount is "the total payment for a transaction before any fees or credits are applied"; Net amount is "the total payment for a transaction after any fees or credits are applied". On the sample's sale rows, the difference is the fee columns to the cent.

## Related

- [How to download the report](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/download/)
- [Why one sale has several rows](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/why-multiple-rows-per-sale/)
- [Ad fees in the report](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/ad-fees-in-report/)
- [Reports outside the US](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/guides/ebay-reports-other-countries/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/columns-explained/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/columns-explained.csv
