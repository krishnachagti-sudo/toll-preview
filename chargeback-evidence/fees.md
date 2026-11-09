# Chargeback fees and when fighting pays

On a $40 Stripe dispute you have already paid $15; countering costs $15 more (returned if you win), so fighting pays above a 27.3% chance of winning. Shopify Payments charges $15 and returns it on a win; PayPal charges $15 per dispute ($30 high volume) or $20 per card chargeback.

- Stripe, $40: fight above: 27.3%

## Build the evidence for your dispute

[Show the evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/?platform=stripe&network=visa&productType=physical&code=13.1&amount=40)

## The fees

| Platform | Fee | Amount | Returned? |
| --- | --- | ---: | --- |
| Stripe | Dispute received | $15.00 | No, never |
| Stripe | Dispute countered | $15.00 | Yes, if you win |
| Stripe | Visa or Mastercard compliance case | $500.00 | Yes, if you win |
| Shopify Payments | Chargeback fee (United States) | $15.00 | Yes, if you win |
| Shopify Payments | Submitting evidence | $0.00 | No fee |
| PayPal | Standard Dispute Fee | $15.00 | Not stated on the pages read |
| PayPal | High Volume Dispute Fee | $30.00 | Not stated on the pages read |
| PayPal | Card chargeback fee (not via a PayPal account) | $20.00 | Not stated on the pages read |

## Accept, win or lose

Money lost against the sale, US accounts; your time not counted

| Platform | Amount | Accept | Fight and win | Fight and lose | Fight above |
| --- | ---: | ---: | ---: | ---: | ---: |
| Stripe | $25.00 | $40.00 | $15.00 | $55.00 | 37.5% |
| Stripe | $40.00 | $55.00 | $15.00 | $70.00 | 27.3% |
| Stripe | $75.00 | $90.00 | $15.00 | $105.00 | 16.7% |
| Stripe | $100.00 | $115.00 | $15.00 | $130.00 | 13% |
| Stripe | $250.00 | $265.00 | $15.00 | $280.00 | 5.7% |
| Stripe | $500.00 | $515.00 | $15.00 | $530.00 | 2.9% |
| Shopify Payments | $25.00 | $40.00 | $0.00 | $40.00 | 0% |
| Shopify Payments | $40.00 | $55.00 | $0.00 | $55.00 | 0% |
| Shopify Payments | $75.00 | $90.00 | $0.00 | $90.00 | 0% |
| Shopify Payments | $100.00 | $115.00 | $0.00 | $115.00 | 0% |
| Shopify Payments | $250.00 | $265.00 | $0.00 | $265.00 | 0% |
| Shopify Payments | $500.00 | $515.00 | $0.00 | $515.00 | 0% |
| PayPal | $25.00 | $45.00 | $20.00 | $45.00 | 0% |
| PayPal | $40.00 | $60.00 | $20.00 | $60.00 | 0% |
| PayPal | $75.00 | $95.00 | $20.00 | $95.00 | 0% |
| PayPal | $100.00 | $120.00 | $20.00 | $120.00 | 0% |
| PayPal | $250.00 | $270.00 | $20.00 | $270.00 | 0% |
| PayPal | $500.00 | $520.00 | $20.00 | $520.00 | 0% |

The rule: `break-even = extra cost of fighting / (amount + fees returned on a win) = $15.00 / $55.00 = 27.3%`.

> The PayPal pages we could read do not say whether the fee is returned when you win (the User Agreement, which has the rules, could not be read).

## Sources

- [Stripe Support: June 2025 pricing updates for disputes (read November 8, 2026)](https://support.stripe.com/questions/june-2025-pricing-updates-for-disputes)
- [Stripe Docs: Respond to disputes (read November 8, 2026)](https://docs.stripe.com/disputes/responding)
- [Shopify Help Center: Responding to chargebacks and inquiries (read November 8, 2026)](https://help.shopify.com/en/manual/payments/chargebacks/chargeback-process)
- [PayPal Merchant Fees (US), last updated November 4, 2026 (read November 8, 2026)](https://www.paypal.com/us/business/paypal-business-fees)

> Not legal advice. The card issuer decides each dispute; this page shows what the networks and platforms publish, as read on the date shown.

## Related

- [Stripe chargeback evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/stripe/)
- [Shopify Payments chargeback evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/shopify/)
- [PayPal chargeback evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/paypal/)
- [Is it worth fighting?](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/guides/worth-fighting/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/fees/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/fees.csv
