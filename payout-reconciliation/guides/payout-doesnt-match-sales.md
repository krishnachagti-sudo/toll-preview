# Why your payout doesn't match your sales

A payout is a net figure: in this sample Shopify Payments payout, $229.75 of sales became a $126.18 deposit, because $229.75 sales - $22.00 refunds - $49.00 chargebacks - $22.57 fees - $10.00 reserves. It rarely equals a day's sales, because refunds, chargebacks, fees and reserves come out first, and the orders in it can span several days.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=shopify&ledger=quickbooks-online)

## Where the money went

Made-up payout of October 14, 2026

| Line | Amount |
| --- | ---: |
| Sales | $229.75 |
| Refunds | -$22.00 |
| Chargebacks and disputes | -$49.00 |
| Processing fees | -$22.57 |
| Reserves and holds | -$10.00 |
| **Net (the payout)** | **$126.18** |

## The usual causes

- **Processing fees** come out of every charge before the payout.
- **Refunds** are taken from the next payout: "When you issue a refund through Shopify Payments, the refunded amount is deducted from your next available payout."
- **Chargebacks**: "If any customers initiated a dispute or chargeback, then the payment amount and any associated dispute fees are deducted from your account."
- **Reserves**: Reserve funds represent the portion of your payouts that are placed in reserve. These negative transactions reduce the amount you receive in a payout.
- **Timing**: a payout groups the orders that became available since the last one, so it does not line up with a calendar day. Stripe groups each payout by its estimated arrival date.
- **Other gateways**: orders paid through PayPal or another provider are paid out by that provider, in its own deposits.

## The journal that books it

Shopify Payments payout payout-2026-10-14, October 14, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Sales |  | $229.75 |
| Refunds | $22.00 |  |
| Chargebacks | $49.00 |  |
| Merchant fees | $22.57 |  |
| Processor reserve | $10.00 |  |
| Shopify Payments clearing | $126.18 |  |
| **Total** | **$229.75** | **$229.75** |

Book sales gross, fees and refunds on their own lines, and the net into a clearing account. The bank deposit is then matched to the clearing account, not to orders. [How the clearing account works in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-quickbooks-online/).

## Sources

- [Shopify Help Center: Lower or missing payouts (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/lower-or-missing-payouts)
- [Shopify Help Center: Shopify Payments refunds (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/refunds)
- [Shopify Help Center: Overview of reserves in Shopify Payments (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/reserves)
- [Stripe Docs: Payout reconciliation report (read November 8, 2026)](https://docs.stripe.com/reports/payout-reconciliation)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Questions

### Why is my Shopify payout lower than my sales?

Shopify lists the reasons: Adjustments, chargebacks, currency conversion, negative balance, payout holds, refunds, reserves, Shopify Payments processing fees, taxes on fees. In the sample payout here, $103.57 of the $229.75 in sales went to those lines.

### Should I match the bank deposit to orders?

Match the deposit to the payout, and the payout to its rows. A payout bundles several days of orders, refunds and fees, so it rarely equals any one day's orders.

## Related

- [A negative payout](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/negative-payout/)
- [Reconcile Shopify payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/shopify-to-quickbooks-online/)
- [The Shopify payout report, explained](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/shopify-payout-report/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/payout-doesnt-match-sales/  
Data as of: 2026-11-08
