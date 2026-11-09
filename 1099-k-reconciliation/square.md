# Square 1099-K reconciliation

Your Square 1099-K is gross: the sales tax and tips collected on card sales are inside it, and fees, refunds and chargebacks are not deducted, so a $64,800.00 Box 1a with the example's sales tax, refunds and fees comes down to $60,180.00 of gross receipts and $57,271.70 kept.

- Box 1a: $64,800.00
- Gross receipts: $60,180.00
- Kept: $57,271.70
- Time zone: UTC

Square's help page says the form covers this: Card payments processed by Square: credit and debit cards, gift cards and Cash App Pay where they apply. Cash sales are not included. Box 1a includes taxes and tips collected on card transactions and card payments later refunded; it is not reduced for processing fees, refunds or chargebacks, credits or discounts, shipping or other adjustments. The IRS defines Box 1a the same way for every platform: the gross, without regard to credits, cash equivalents, discounts, fees, refunds, shipping or any other amounts ([what Box 1a includes](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/what-box-1a-includes/)).

## Reconcile your Square 1099-K

[Reconcile my Square 1099-K](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/?year=2025&type=sole-proprietor&kind=card&run=1&filer=Square&box1a=64800&box3=2914&refunds=1210&fees=1698.3&salesTax=4620)

## The walkdown, worked

A Square form for 2025 with made-up amounts, worked by the engine

| Line | Amount | Where it goes |
| --- | ---: | --- |
| Box 1a gross | $64,800.00 | Form 1099-K |
| Less: Sales tax collected for the state and paid over (by you or the marketplace) | -$4,620.00 | Not gross receipts when the tax is imposed on the buyer and paid over (Schedule C line 23 instructions) |
| Business gross receipts from these forms | $60,180.00 | Schedule C line 1, gross receipts |
| Less: Refunds to customers | -$1,210.00 | Schedule C line 2, returns and allowances |
| Net sales after returns and allowances | $58,970.00 | Schedule C line 3 |
| Less: Platform and processing fees | -$1,698.30 | Schedule C line 10, commissions and fees |
| What you kept from these sales before other costs | $57,271.70 | Should be close to what the platform paid out to you |

The seller's books show $70,080.00 of gross receipts, $9,900.00 more than the walkdown: Square says cash sales are not on the form, and here they are the difference.

## What Square says is in the form

Square Form 1099-K, from Square's help page (read November 8, 2026)

| Amount | In Box 1a |
| --- | --- |
| Refunded sales | Included |
| Fees (not deducted) | Included |
| Sales tax | Included |
| Tips | Included |
| Shipping charged | Not stated |
| Cash sales | Not included |

## Dates and time zones

Transaction dates in Coordinated Universal Time (UTC); the Dashboard shows local time, so late-evening sales can fall on a different day.

From 2026, card tips for a U.S. individual or sole proprietor are shown separately in Box 1c, with the Treasury Tipped Occupation Code in Box 1d.

## Where to get the form and the detail

- Square Dashboard: Account & Settings \> Tax forms (available by January 31, or the next business day).
- The detail to reconcile with: Reports \> Payments \> Payment methods, with reporting hours set to UTC+00:00 and cash left out; the Payment amount total should match Box 1a.

Accounts on one tax ID: All accounts on the same TIN are added together for the threshold. Corrections: Prior-year corrections for the past three tax years, with a bank statement, from Account & Settings \> Tax forms \> Request a Form 1099-K correction.

- [Square Support: Manage your Form 1099-K, read November 8, 2026](https://squareup.com/help/us/en/article/5048-1099-k-overview)
- [IRS: Instructions for Form 1099-K (Rev. 12/2026), read November 8, 2026](https://www.irs.gov/instructions/i1099k)
- [IRS: What to do with Form 1099-K, read November 8, 2026](https://www.irs.gov/businesses/what-to-do-with-form-1099-k)
- [IRS: Instructions for Schedule C (Form 1040) (2025), read November 8, 2026](https://www.irs.gov/instructions/i1040sc)

> Computed from IRS instructions and FAQs (each cited with the date read) and the amounts you enter. Not tax or legal advice. You decide which payments are business, personal or in error; the tool applies the IRS reporting text to your classification. State 1099-K thresholds are not covered: check your state revenue department.

## Questions

### Does the Square 1099-K include refunds and fees?

Yes: Box 1a includes taxes and tips collected on card transactions and card payments later refunded; it is not reduced for processing fees, refunds or chargebacks, credits or discounts, shipping or other adjustments. The refunds go on Schedule C line 2 and the fees on line 10.

### What does the Square 1099-K cover?

Card payments processed by Square: credit and debit cards, gift cards and Cash App Pay where they apply. Cash sales are not included.

### Where do I download my Square 1099-K?

Square Dashboard: Account & Settings \> Tax forms (available by January 31, or the next business day).

### Why does my Square 1099-K not match my sales report?

Transaction dates in Coordinated Universal Time (UTC); the Dashboard shows local time, so late-evening sales can fall on a different day. Box 1a includes taxes and tips collected on card transactions and card payments later refunded; it is not reduced for processing fees, refunds or chargebacks, credits or discounts, shipping or other adjustments.

### Does the Square 1099-K include sales tax?

Square says Box 1a includes taxes and tips collected on card transactions. Sales tax imposed on the buyer that you collected and paid over is not gross receipts (Schedule C instructions, line 23), so it comes out in the walkdown.

## Related

- [Sales tax in a 1099-K](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/sales-tax-in-1099-k/)
- [Personal items sold at a loss](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/personal-items-sold-at-loss/)
- [Where to get the data per platform](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/guides/where-to-get-1099-k-data/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/square/  
Data as of: 2026-11-08
