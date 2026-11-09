# Chargeback reason codes, by category

Visa uses numbered codes (10.x fraud, 11.x authorization, 12.x processing errors, 13.x consumer disputes), Mastercard four-digit 48xx codes, Amex a letter and number (C08, F29) and Discover four digits; Stripe groups the 195 card codes it publishes into nine categories, and the evidence follows the category.

- Card codes: 195

## Build the evidence for your dispute

[Show the evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/?platform=stripe&network=visa&productType=physical&code=13.1)

## Codes per category

Number of codes Stripe maps to each category, and the evidence to lead with for a physical product

| Category | Visa | Mastercard | Amex | Discover | PayPal | Lead with |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Product not received | 2 | 1 | 3 | 2 | 1 | Proof of delivery, shipping details and signature or ID at pickup or delivery |
| Product unacceptable | 3 | 14 | 5 | 0 | 1 | How the product was described, messages with the customer and refund or return policy, and where it was shown |
| Fraudulent | 6 | 5 | 11 | 5 | 1 | Proof of delivery, shipping details and signature or ID at pickup or delivery |
| Unrecognized | 0 | 2 | 3 | 0 | 1 | Proof of delivery, shipping details and signature or ID at pickup or delivery |
| Subscription canceled | 1 | 4 | 2 | 1 | 1 | Cancellation policy, and where it was shown, why this charge stands after the claimed cancellation and renewal notices and use after the claimed cancellation |
| Credit not processed | 2 | 3 | 14 | 1 | 1 | Proof a refund or credit was already issued, refund or return policy, and where it was shown and why no refund (or no further refund) is due |
| Duplicate | 2 | 9 | 4 | 2 | 2 | Records showing the two charges are separate, proof of delivery and messages with the customer |
| General | 13 | 24 | 25 | 13 | 2 | Receipt or order confirmation, messages with the customer and proof of delivery |
| Non-compliant | 13 | 0 | 0 | 0 | 0 | Authorization records, receipt or order confirmation and messages with the customer |

## What each category claims

- **Product not received**: The customer says they did not receive what they paid for.
- **Product unacceptable**: The customer says the product was defective, damaged or not as described.
- **Fraudulent**: The cardholder says they did not make or authorize the payment.
- **Unrecognized**: The cardholder does not recognize the payment on their statement. Stripe treats this much like a fraud claim.
- **Subscription canceled**: The customer says they were charged after cancelling a subscription.
- **Credit not processed**: The customer says a refund or credit they were owed never arrived (after a return, cancellation or partial delivery).
- **Duplicate**: The customer says they were charged more than once for the same purchase.
- **General**: A catch-all reason: the claim does not fit another category. Stripe suggests contacting the customer to learn why they disputed.
- **Non-compliant**: The card issuer says the payment broke a card network rule (a Visa or Mastercard compliance case).

## Full lists

- [Visa reason codes](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/reason-codes/visa/) (42 codes)
- [Mastercard reason codes](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/reason-codes/mastercard/) (62 codes)
- [American Express reason codes](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/reason-codes/amex/) (67 codes)
- [Discover reason codes](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/reason-codes/discover/) (24 codes)

## Sources

- [Stripe Docs: Dispute reason code categories (read November 8, 2026)](https://docs.stripe.com/disputes/categories)
- [PayPal Customer Disputes API v1.12 (schema) (read November 8, 2026)](https://developer.paypal.com/api/customer-disputes/v1/)

> Not legal advice. The card issuer decides each dispute; this page shows what the networks and platforms publish, as read on the date shown.

## Related

- [Visa reason codes](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/reason-codes/visa/)
- [Mastercard reason codes](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/reason-codes/mastercard/)
- [American Express reason codes](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/reason-codes/amex/)
- [Discover reason codes](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/reason-codes/discover/)
- [Item not received chargebacks](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/disputes/item-not-received/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/reason-codes/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/reason-codes.csv
