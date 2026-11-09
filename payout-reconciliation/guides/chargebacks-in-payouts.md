# Chargebacks in your payouts

A chargeback takes the payment and a fee out of the next payout: in this sample, two disputes on $80.00 and $60.00 took $140.00 plus $30.00 of fees from payout po\_SAMPLE1105, and winning the $60.00 one put $60.00 back in payout po\_SAMPLE1203. Book the amounts to a chargebacks account and the dispute fees to fees.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=stripe&ledger=quickbooks-online)

## The payout with two disputes

Payout po\_SAMPLE1105, November 5, 2026

| Line | Amount |
| --- | ---: |
| Sales | $300.00 |
| Chargebacks and disputes | -$140.00 |
| Processing fees | -$39.00 |
| **Net (the payout)** | **$121.00** |

Stripe payout po\_SAMPLE1105, November 5, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Sales |  | $300.00 |
| Chargebacks | $140.00 |  |
| Merchant fees | $39.00 |  |
| Stripe clearing | $121.00 |  |
| **Total** | **$300.00** | **$300.00** |

## The payout with the dispute won

Payout po\_SAMPLE1203, December 3, 2026

| Line | Amount |
| --- | ---: |
| Sales | $120.00 |
| Chargebacks and disputes | $60.00 |
| Processing fees | -$3.78 |
| **Net (the payout)** | **$176.22** |

Stripe payout po\_SAMPLE1203, December 3, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Sales |  | $120.00 |
| Chargebacks |  | $60.00 |
| Merchant fees | $3.78 |  |
| Stripe clearing | $176.22 |  |
| **Total** | **$180.00** | **$180.00** |

Stripe: "When a customer disputes a charge, Stripe deducts the disputed amount from your balance." and "When you win a dispute, the disputed amount is returned to your balance." Stripe also says $15.00 for each dispute you respond to manually. You get this fee back for won disputes. How the returned fee shows in your file is Stripe's to say; this made-up file shows only the amount coming back.

## The lifecycle

- Notice: the processor takes the disputed amount from your balance (and the next payout).
- Fee: the processor charges its dispute or chargeback fee.
- Evidence: you respond with proof of delivery and your messages with the customer.
- Decision: won, the amount comes back; lost, it stays gone.

Shopify: "If any customers initiated a dispute or chargeback, then the payment amount and any associated dispute fees are deducted from your account."

## Sources

- [Stripe Docs: Reporting categories (read November 8, 2026)](https://docs.stripe.com/reports/reporting-categories)
- [Stripe pricing (United States) (read November 8, 2026)](https://stripe.com/us/pricing)
- [PayPal merchant fees (United States) (read November 8, 2026)](https://www.paypal.com/us/business/paypal-business-fees)
- [Shopify Help Center: Lower or missing payouts (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/lower-or-missing-payouts)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Questions

### What does a Stripe dispute cost?

$15.00 for each dispute you receive; and $15.00 for each dispute you respond to manually. You get this fee back for won disputes.

### What do PayPal chargebacks cost?

Chargeback fee, US dollar: 20.00 USD for card chargebacks outside a PayPal account, and Standard dispute fee, US dollar: 15.00 USD.

## Related

- [A negative payout](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/negative-payout/)
- [The Stripe payout reconciliation report](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/stripe-payout-reconciliation-report/)
- [Reconciling BFCM: payout lag and dispute spikes](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/bfcm-payout-lag/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/chargebacks-in-payouts/  
Data as of: 2026-11-08
