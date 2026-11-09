# Shopify 1099-K reconciliation

Your Shopify 1099-K is gross: refunds, chargebacks and processing fees are not deducted, so a $48,000.00 Box 1a with the example's refunds and fees comes down to $48,000.00 of gross receipts and $44,127.60 kept.

- Box 1a: $48,000.00
- Gross receipts: $48,000.00
- Kept: $44,127.60
- Time zone: UTC

Shopify's help page says the form covers this: Only transactions processed through Shopify Payments; PayPal Express, manual payment methods and cash sales are not on it. The gross value of Shopify Payments transactions; refunds, chargebacks, processing fees and Shopify Balance bills are not deducted. The IRS defines Box 1a the same way for every platform: the gross, without regard to credits, cash equivalents, discounts, fees, refunds, shipping or any other amounts ([what Box 1a includes](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/what-box-1a-includes/)).

## Reconcile your Shopify 1099-K

[Reconcile my Shopify 1099-K](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/?year=2025&type=sole-proprietor&kind=tpso&run=1&filer=Shopify+Payments&box1a=48000&box3=612&refunds=2150&fees=1422.4)

## The walkdown, worked

A Shopify form for 2025 with made-up amounts, worked by the engine

| Line | Amount | Where it goes |
| --- | ---: | --- |
| Box 1a gross | $48,000.00 | Form 1099-K |
| Business gross receipts from these forms | $48,000.00 | Schedule C line 1, gross receipts |
| Less: Refunds to customers | -$2,150.00 | Schedule C line 2, returns and allowances |
| Less: Chargebacks and disputes lost | -$300.00 | Schedule C line 2, returns and allowances |
| Net sales after returns and allowances | $45,550.00 | Schedule C line 3 |
| Less: Platform and processing fees | -$1,422.40 | Schedule C line 10, commissions and fees |
| What you kept from these sales before other costs | $44,127.60 | Should be close to what the platform paid out to you |

## What Shopify says is in the form

Shopify Form 1099-K, from Shopify's help page (read November 8, 2026)

| Amount | In Box 1a |
| --- | --- |
| Refunded sales | Included |
| Fees (not deducted) | Included |
| Sales tax | Not stated |
| Tips | Not stated |
| Shipping charged | Not stated |
| Cash sales | Not included |

## Dates and time zones

Transactions count by when they posted to the Shopify Payments account in UTC, not by order date: an order placed December 31 that posts January 1 is on the next year's form.

## Where to get the form and the detail

- Shopify admin: Finance \> Documents \> 1099-K, then the form.
- The transactions on the form: Finance \> Payouts \> View transactions \> Export \> 1099-K Transactions, with the date range.
- The detail to reconcile with: 1099-K Transactions CSV (Finance \> Payouts \> View transactions \> Export).

Accounts on one tax ID: Reporting is per tax ID: accounts sharing a TIN are combined for the threshold, and each account gets a form for its own volume. Corrections: Name, address or tax ID can be updated from Finance \> Documents \> 1099-K \> Update Details until July 15.

- [Shopify Help Center: Form 1099-K tax reporting with Shopify Payments for the United States, read November 8, 2026](https://help.shopify.com/en/manual/payments/shopify-payments/supported-countries/united-states/tax-reporting)
- [IRS: Instructions for Form 1099-K (Rev. 12/2026), read November 8, 2026](https://www.irs.gov/instructions/i1099k)
- [IRS: What to do with Form 1099-K, read November 8, 2026](https://www.irs.gov/businesses/what-to-do-with-form-1099-k)
- [IRS: Instructions for Schedule C (Form 1040) (2025), read November 8, 2026](https://www.irs.gov/instructions/i1040sc)

> Computed from IRS instructions and FAQs (each cited with the date read) and the amounts you enter. Not tax or legal advice. You decide which payments are business, personal or in error; the tool applies the IRS reporting text to your classification. State 1099-K thresholds are not covered: check your state revenue department.

## Questions

### Does the Shopify 1099-K include refunds and fees?

Yes: The gross value of Shopify Payments transactions; refunds, chargebacks, processing fees and Shopify Balance bills are not deducted. The refunds go on Schedule C line 2 and the fees on line 10.

### What does the Shopify 1099-K cover?

Only transactions processed through Shopify Payments; PayPal Express, manual payment methods and cash sales are not on it.

### Where do I download my Shopify 1099-K?

Shopify admin: Finance \> Documents \> 1099-K, then the form. The transactions on the form: Finance \> Payouts \> View transactions \> Export \> 1099-K Transactions, with the date range.

### Why does my Shopify 1099-K not match my sales report?

Transactions count by when they posted to the Shopify Payments account in UTC, not by order date: an order placed December 31 that posts January 1 is on the next year's form. The gross value of Shopify Payments transactions; refunds, chargebacks, processing fees and Shopify Balance bills are not deducted.

## Related

- [eBay 1099-K](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/ebay/)
- [Square 1099-K](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/square/)
- [Where to get the data per platform](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/guides/where-to-get-1099-k-data/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/shopify/  
Data as of: 2026-11-08
