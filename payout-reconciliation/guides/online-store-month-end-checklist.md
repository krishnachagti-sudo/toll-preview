# Month-end payout checklist for an online store

Five checks close the month: payouts in transit, the clearing account, fees and refunds, sales tax and the files. In the sample Stripe file, 1 of 2 payouts spans the month end: payout po\_SAMPLE1102 on November 2, 2026 holds activity from 2026-10 and 2026-11, so its October sales sit in the clearing account on October 31.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=stripe&ledger=quickbooks-online)

## The payout that crosses the month end

Payout po\_SAMPLE1102, November 2, 2026

| Line | Amount |
| --- | ---: |
| Sales | $269.99 |
| Refunds | -$19.99 |
| Processing fees | -$10.43 |
| **Net (the payout)** | **$239.57** |

The split flags any payout whose activity runs across a month end. Sales booked to October and paid in November leave the October clearing account holding exactly that payout, which is right; the November deposit clears it.

## Year-end dates

| Year end | Day | Payouts that land after it carry |
| --- | --- | --- |
| December 31, 2026 | Thursday | the last days of December 2026 |
| December 31, 2027 | Friday | the last days of December 2027 |

Stripe groups a payout by its estimated arrival date, not the bank's posting date, and Shopify says a payout typically takes 1 to 3 business days to arrive after it is sent. So December's last sales usually reach the bank in January.

## Sources

- [Stripe Docs: Payout reconciliation report (read November 8, 2026)](https://docs.stripe.com/reports/payout-reconciliation)
- [Shopify Help Center: Viewing and exporting your Shopify Payments payout details (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/view-details)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Steps

1. **List payouts in transit.** Sales made in the last days of the month are paid out next month. They sit in the clearing account at month end; list them by payout.
2. **Check the clearing account.** Its balance should equal the payouts in transit and nothing else. Anything more is a payout not booked or a deposit not matched.
3. **Agree fees and refunds to the processor.** The month's fees and refunds in your books should equal the processor's own totals for the same dates.
4. **Agree sales tax.** Payout files from Stripe, Shopify Payments and Square carry no sales tax collected, so agree the sales tax liability to your store's sales report.
5. **Keep the files.** Save each processor's export and the journal file with the month's close, so the numbers can be traced later.

## Related

- [The clearing account in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-quickbooks-online/)
- [Reconciling BFCM: payout lag and dispute spikes](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/bfcm-payout-lag/)
- [Why your payout doesn't match your sales](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/payout-doesnt-match-sales/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/online-store-month-end-checklist/  
Data as of: 2026-11-08
