# Where to get your 1099-K data, per platform

Download the form and the transaction detail behind it from each platform: Shopify's 1099-K Transactions export, eBay's 1099-K detailed report and Square's Payment methods report in UTC; 2 of the 3 date transactions in UTC, so late-evening sales can move a day.

- Platforms: 3
- UTC dates: 2

You need two things from each platform: the form (Box 1a, Box 3 and Boxes 5a to 5l) and the transactions behind it, so you can see what is in the gross. The tool takes any CSV with a date and an amount column, and uses type, fee, tax and refund columns when there are any.

## Reconcile with your export

[Reconcile it](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/?year=2025&type=sole-proprietor&kind=tpso&run=1&filer=&box1a=48000&box3=612)

Per platform, from each platform's own help page (read November 8, 2026)

| Platform | The form | The detail | Dates |
| --- | --- | --- | --- |
| [Shopify](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/shopify/) | Shopify admin: Finance \> Documents \> 1099-K, then the form. | 1099-K Transactions CSV (Finance \> Payouts \> View transactions \> Export) | Transactions count by when they posted to the Shopify Payments account in UTC, not by order date: an order placed December 31 that posts January 1 is on the next year's form. |
| [eBay](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/ebay/) | Seller Hub: Payments \> Taxes \> 1099-K details \> Generate (the 1099-K detailed report). | 1099-K detailed report (every unadjusted gross payment transaction on the form) | Based on when gross funds are processed by eBay, not necessarily when the seller receives them. |
| [Square](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/square/) | Square Dashboard: Account & Settings \> Tax forms (available by January 31, or the next business day). | Reports \> Payments \> Payment methods, with reporting hours set to UTC+00:00 and cash left out; the Payment amount total should match Box 1a | Transaction dates in Coordinated Universal Time (UTC); the Dashboard shows local time, so late-evening sales can fall on a different day. |

PayPal, Amazon and SeatGeek are not covered here: their help pages could not be read when this page was written.

- [Shopify Help Center: Form 1099-K tax reporting with Shopify Payments for the United States, read November 8, 2026](https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/united-states/tax-reporting)
- [eBay Help: Form 1099-K, read November 8, 2026](https://www.ebay.com/help/selling/fees-credits-invoices/form-1099k?id=4794)
- [Square Support: Manage your Form 1099-K, read November 8, 2026](https://squareup.com/help/us/en/article/5048-1099-k-overview)
- [IRS: Instructions for Form 1099-K (Rev. 12/2026), read November 8, 2026](https://www.irs.gov/instructions/i1099k)

> Computed from IRS instructions and FAQs (each cited with the date read) and the amounts you enter. Not tax or legal advice. You decide which payments are business, personal or in error; the tool applies the IRS reporting text to your classification. State 1099-K thresholds are not covered: check your state revenue department.

## Related

- [Bookkeeping checks before you file](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/guides/bookkeeping-checks-before-filing/)
- [1099-K dates for 2026 forms](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/1099-k-dates-2027/)
- [Shopify 1099-K](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/shopify/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/guides/where-to-get-1099-k-data/  
Data as of: 2026-11-08
