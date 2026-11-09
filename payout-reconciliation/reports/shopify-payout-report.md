# The Shopify Payments payout report, explained

Shopify's payout CSV has 11 columns; Amount is the transaction, Fee is the Shopify Payments fee, and Net is the difference between the two. In the sample payout below, 6 rows net to $126.18: $229.75 sales - $22.00 refunds - $49.00 chargebacks - $22.57 fees - $10.00 reserves.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=shopify&ledger=quickbooks-online)

## The columns

| Column | What it holds |
| --- | --- |
| Transaction Date | When the transaction happened, with the time zone. |
| Type | charge, refund, dispute, adjustment, reserved funds and others: the split places rows by it. |
| Order | The order number, where there is one. |
| Card Brand | visa, master, amex and so on. |
| Card Source | How the card was charged. |
| Payout Status | pending, or the status of the payout it went in. |
| Payout Date | The date Shopify sent the payout to your bank. The split groups rows by it. |
| Available On | When the money became available for payout. |
| Amount | The transaction amount: refunds and chargebacks are negative. |
| Fee | The fee on the transaction. |
| Net | Net: The difference between the amount and the fee. |

## Transaction types, and where each goes

| Type | Booked as |
| --- | --- |
| `charge` | Sales |
| `refund` | Refunds |
| `dispute` | Chargebacks and disputes |
| `dispute_reversal` | Chargebacks and disputes |
| `chargeback_fee` | Processing fees |
| `reserved_funds` | Reserves and holds |
| `reserved_funds_reversal` | Reserves and holds |
| `lending_capital_remittance` | Loan and advance repayments |
| `shipping_label` | Shipping labels |
| `customs_duty` | Duties and import taxes |
| `import_tax` | Duties and import taxes |
| `currency_conversion` | Currency conversion |
| `adjustment` | Other adjustments |
| `payout` | The payout itself |

Reserves: Reserve funds represent the portion of your payouts that are placed in reserve. These negative transactions reduce the amount you receive in a payout. Released funds represent the funds that were held in reserve and become available for payout after the reserve is complete. These are positive transactions.

## A sample payout

Made-up payout transactions

| Transaction Date | Type | Order | Card Brand | Card Source | Payout Status | Payout Date | Available On | Amount | Fee | Net |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-10-12 10:14:03 -0400 | charge | #1001 | visa | online | paid | 2026-10-14 | 2026-10-14 | 64.00 | 2.16 | 61.84 |
| 2026-10-12 12:30:41 -0400 | charge | #1002 | master | online | paid | 2026-10-14 | 2026-10-14 | 128.50 | 4.03 | 124.47 |
| 2026-10-12 15:02:19 -0400 | charge | #1003 | amex | online | paid | 2026-10-14 | 2026-10-14 | 37.25 | 1.38 | 35.87 |
| 2026-10-13 09:41:00 -0400 | refund | #0998 | visa | online | paid | 2026-10-14 | 2026-10-14 | -22.00 | 0.00 | -22.00 |
| 2026-10-13 11:00:00 -0400 | dispute | #0975 | visa | online | paid | 2026-10-14 | 2026-10-14 | -49.00 | 15.00 | -64.00 |
| 2026-10-13 11:00:00 -0400 | reserved\_funds |  |  |  | paid | 2026-10-14 | 2026-10-14 | -10.00 | 0.00 | -10.00 |

Payout of October 14, 2026

| Line | Amount |
| --- | ---: |
| Sales | $229.75 |
| Refunds | -$22.00 |
| Chargebacks and disputes | -$49.00 |
| Processing fees | -$22.57 |
| Reserves and holds | -$10.00 |
| **Net (the payout)** | **$126.18** |

## Getting it

- Export a specific payout: Finance \> Payouts, click the payout date and the payout, then Export payout transactions.
- Pending amounts and payout dates are estimates.
- Fees: Your credit card rate depends on your Shopify Plan. You can check your current Shopify Payments credit card rate in your Shopify admin.

## Sources

- [Shopify Help Center: Viewing and exporting your Shopify Payments payout details (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/view-details)
- [Shopify Admin API: ShopifyPaymentsTransactionType (read November 8, 2026)](https://shopify.dev/docs/api/admin-graphql/latest/enums/ShopifyPaymentsTransactionType)
- [Shopify Help Center: Overview of reserves in Shopify Payments (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/reserves)
- [Shopify Help Center: Viewing your Shopify Payments payout fees (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/pay-periods-and-fees)
- [Shopify Help Center: Shopify Payments refunds (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/refunds)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Questions

### How do I get the Shopify payout report?

Export a specific payout: Finance \> Payouts, click the payout date and the payout, then Export payout transactions.

### When does a Shopify payout reach my bank?

The payout date is the date that Shopify sends the payout to your bank. After the payout is sent, it typically takes 1 to 3 business days to arrive, depending on your bank.

### Are Shopify Payments fees refunded when I refund an order?

The original credit card transaction fee isn't refunded to you when issuing a refund.

## Related

- [Reconcile Shopify payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/shopify-to-quickbooks-online/)
- [Reconcile Shopify payouts in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/shopify-to-xero/)
- [A negative payout](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/negative-payout/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/shopify-payout-report/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/shopify-payout-report.csv
