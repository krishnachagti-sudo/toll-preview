# Stripe chargeback evidence: limits, deadlines and fees

Stripe gives you usually 7 to 21 days and one submission: one file per evidence type (PDF, JPEG or PNG), 4.5 MB combined, a 50-page limit (a 19-page cap for Mastercard disputes), with no links. US fees are $15 when the dispute arrives (kept) and $15 to counter (returned if you win).

- Combined size: 4.5 MB
- Mastercard pages: 19
- Dispute fees (US): $15 + $15

## Build the evidence for your dispute

[Show the evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/?platform=stripe&network=visa&productType=physical&code=13.1)

## Upload limits

| Rule | Stripe |
| --- | --- |
| File types | PDF, JPEG, PNG |
| Combined size | 4.5 MB |
| Combined pages | under 50 |
| Mastercard disputes | a 19-page limit |
| Text in all fields | 150,000 characters |
| One file per evidence type | Yes: combine items of one type into one file |
| Links, audio, video | Not reviewed: use screenshots |
| Submissions | Stripe takes one submission: it forwards the response at once, and you cannot edit it or add files. |

Window: Usually 7 to 21 days depending on the card network; the exact due date is on the dispute (evidence\_details.due\_by in the API). Decision: The cardholder's bank can take up to 3 months after you counter.

## Fees

US accounts, in dollars

| Fee | Amount | Returned? |
| --- | ---: | --- |
| Dispute received | $15.00 | No, never |
| Dispute countered | $15.00 | Yes, if you win |
| Visa or Mastercard compliance case | $500.00 | Yes, if you win |

## When fighting pays

The chance of winning above which countering costs less than accepting (your time not counted)

| Disputed amount | Extra cost to fight | Fight above |
| ---: | ---: | ---: |
| $25.00 | $15.00 | 37.5% |
| $40.00 | $15.00 | 27.3% |
| $75.00 | $15.00 | 16.7% |
| $100.00 | $15.00 | 13% |
| $250.00 | $15.00 | 5.7% |
| $500.00 | $15.00 | 2.9% |

## Evidence fields

Each piece of evidence and the Stripe field it goes in

| Evidence | Stripe field |
| --- | --- |
| Proof of delivery | shipping\_documentation |
| Shipping details | shipping\_address, shipping\_date, shipping\_carrier, shipping\_tracking\_number |
| Signature or ID at pickup or delivery | customer\_signature |
| Proof the customer has the goods | uncategorized\_file |
| Messages with the customer | customer\_communication |
| Receipt or order confirmation | receipt |
| Customer details | customer\_name, customer\_email\_address, billing\_address, customer\_purchase\_ip |
| Access or download log | uncategorized\_file, access\_activity\_log |
| Proof the service was provided | service\_documentation, service\_date |
| How the product was described | uncategorized\_file, product\_description |
| Refund or return policy, and where it was shown | refund\_policy, refund\_policy\_disclosure |
| Why no refund (or no further refund) is due | refund\_refusal\_explanation |
| Cancellation policy, and where it was shown | cancellation\_policy, cancellation\_policy\_disclosure |
| Why this charge stands after the claimed cancellation | cancellation\_rebuttal |
| Renewal notices and use after the claimed cancellation | customer\_communication |
| Records showing the two charges are separate | duplicate\_charge\_documentation, duplicate\_charge\_id, duplicate\_charge\_explanation |
| Proof a refund or credit was already issued | uncategorized\_file |
| The customer withdrew the dispute | customer\_communication |
| Delivery not due yet, or held by customs | uncategorized\_file |
| Earlier undisputed payments by the same customer | uncategorized\_file |
| Authentication and verification results | uncategorized\_file |
| The amount the customer agreed to | receipt |
| Authorization records | uncategorized\_file |

## How often disputes are won

Stripe's own table for its win-likelihood ranking (shown to Radar users), for disputes countered with relevant evidence:

| Ranking | Chance of winning |
| --- | ---: |
| 5 dots | 60% |
| 4 dots | 40% |
| 3 dots | 25% |
| 2 dots | 15% |
| 1 dot | 5% |

## Sources

- [Stripe Docs: Respond to disputes (read November 8, 2026)](https://docs.stripe.com/disputes/responding)
- [Stripe Docs: Dispute evidence best practices (read November 8, 2026)](https://docs.stripe.com/disputes/best-practices)
- [Stripe Docs: Manage disputes programmatically (read November 8, 2026)](https://docs.stripe.com/disputes/api)
- [Stripe Support: June 2025 pricing updates for disputes (read November 8, 2026)](https://support.stripe.com/questions/june-2025-pricing-updates-for-disputes)
- [Stripe Docs: Dispute reason code categories (read November 8, 2026)](https://docs.stripe.com/disputes/categories)

> Not legal advice. The card issuer decides each dispute; this page shows what the networks and platforms publish, as read on the date shown.

## Please read

- Not legal advice. The card issuer (or PayPal, for a PayPal claim) decides every dispute; no packet guarantees a win.
- Rules, limits and fees are as read on the dates shown. Card networks change their rules in April and October, and platforms change fees with notice.
- Your platform's due date is the deadline. The tool counts from the date you enter; it does not read your account.
- Files you upload are processed in memory to build the packet and are not kept. Only send evidence you are allowed to share with the card issuer.
- Mastercard, American Express and Discover codes are shown as Stripe publishes them; those networks' own rule books were not read.

## Questions

### How long do I have to respond to a Stripe dispute?

Usually 7 to 21 days; the exact due date is on the dispute.

### Is it worth fighting a $40 Stripe dispute?

On a $40.00 Stripe dispute, fighting costs $15.00 more than accepting and pays off when your chance of winning is above 27.3%.

## Related

- [Shopify Payments chargeback evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/shopify/)
- [PayPal chargeback evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/paypal/)
- [Chargeback fees and break-even](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/fees/)
- [How to win a chargeback](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/guides/how-to-win-a-chargeback/)
- [Chargeback evidence API](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/developers/)
- [Stripe's dispute tools compared](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/vs/stripe-dispute-tools/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/stripe/  
Data as of: 2026-11-08
