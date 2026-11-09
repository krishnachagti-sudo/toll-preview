# Chargeback vs dispute

A dispute is the cardholder's challenge; a chargeback is the bank taking the money back while it is decided. On Shopify an inquiry takes no money, a chargeback takes the amount and a $15 fee at once; on PayPal a dispute opened with PayPal has 20 days to settle before it becomes a claim, while a chargeback goes through the card issuer.

- Shopify chargeback fee: $15

## Side by side

|  | Inquiry (pre-dispute) | Chargeback | PayPal dispute or claim |
| --- | --- | --- | --- |
| Who starts it | The card issuer, often when the cardholder does not recognize a charge | The card issuer, for the cardholder | The buyer, with PayPal |
| Money taken | None yet (Shopify); answer it to stop a chargeback | The amount, plus a fee (Shopify $15, Stripe $15) | PayPal holds the payment until it is resolved |
| Who decides | No decision; it may escalate | The card issuer | PayPal, within 10 days of escalation to a claim |
| Time | Shopify: usually 65 to 75 days to close | Stripe up to 3 months; Shopify up to 75 days after you submit | 20 days to settle, then a claim |

On Stripe, if an inquiry becomes a chargeback you must respond again.

## Sources

- [Stripe Docs: Respond to disputes (read November 8, 2026)](https://docs.stripe.com/disputes/responding)
- [Shopify Help Center: Responding to chargebacks and inquiries (read November 8, 2026)](https://help.shopify.com/en/manual/payments/chargebacks/chargeback-process)
- [PayPal Developer: Disputes overview, last updated November 3, 2026 (read November 8, 2026)](https://developer.paypal.com/docs/disputes/)

> Not legal advice. The card issuer decides each dispute; this page shows what the networks and platforms publish, as read on the date shown.

## Related

- [How to win a chargeback](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/guides/how-to-win-a-chargeback/)
- [PayPal disputes](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/paypal/)
- [Shopify chargebacks](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/shopify/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/guides/chargeback-vs-dispute/  
Data as of: 2026-11-08
