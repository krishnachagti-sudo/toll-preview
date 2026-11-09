# Reconciling Black Friday and Cyber Monday payouts

Cyber Monday 2026 falls on Monday, November 30, 2026, the last day of the month, so its sales are paid out in December; book them to November and let the clearing account carry them across. Black Friday is November 27, 2026; in 2027 the pair falls on November 26, 2027 and November 29, 2027.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=stripe&ledger=quickbooks-online)

## The dates

| Day | Date | Weekday |
| --- | --- | --- |
| Black Friday 2026 | November 27, 2026 | Friday |
| Cyber Monday 2026 | November 30, 2026 | Monday |
| Black Friday 2027 | November 26, 2027 | Friday |
| Cyber Monday 2027 | November 29, 2027 | Monday |

Black Friday is the day after Thanksgiving, the fourth Thursday of November; Cyber Monday is the Monday after.

## Payouts across the month end

Stripe groups a payout by its estimated arrival date, and Shopify says a payout typically takes 1 to 3 business days to arrive after it is sent. Sales on November 28 to 30 therefore reach the bank in December. The sample below shows the pattern: payout po\_SAMPLE1102 on November 2, 2026 holds activity from 2026-10 and 2026-11.

Payout po\_SAMPLE1102, November 2, 2026

| Line | Amount |
| --- | ---: |
| Sales | $269.99 |
| Refunds | -$19.99 |
| Processing fees | -$10.43 |
| **Net (the payout)** | **$239.57** |

## Disputes come later

A sale disputed weeks after BFCM comes out of a December or January payout, with a dispute fee. Book it when it happens, against the payout it is in. [How to book chargebacks](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/chargebacks-in-payouts/).

## Reserves

A processor may hold part of a busy period's money: Reserve funds represent the portion of your payouts that are placed in reserve. These negative transactions reduce the amount you receive in a payout. Released funds represent the funds that were held in reserve and become available for payout after the reserve is complete. These are positive transactions. The split books both to a reserve account, which is money you are still owed.

## Sources

- [Stripe Docs: Payout reconciliation report (read November 8, 2026)](https://docs.stripe.com/reports/payout-reconciliation)
- [Shopify Help Center: Viewing and exporting your Shopify Payments payout details (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/view-details)
- [Shopify Help Center: Overview of reserves in Shopify Payments (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/reserves)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Questions

### When is Cyber Monday 2026?

Monday, November 30, 2026, the last day of November, so its payouts arrive in December.

### When are Black Friday and Cyber Monday 2027?

Black Friday is November 26, 2027 and Cyber Monday November 29, 2027.

## Related

- [Month-end payout checklist](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/online-store-month-end-checklist/)
- [Chargebacks in your payouts](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/chargebacks-in-payouts/)
- [A negative payout](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/negative-payout/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/bfcm-payout-lag/  
Data as of: 2026-11-08
