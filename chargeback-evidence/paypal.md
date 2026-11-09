# PayPal chargeback evidence: limits, deadlines and fees

PayPal gives a standard window of 10 days to answer a card chargeback, and 20 days to settle a PayPal dispute before it can be escalated to a claim. Evidence files must be under 10 MB each and 50 MB per case. US fees: $15 standard dispute fee, $30 high volume, $20 card chargeback fee.

- Chargeback window: 10 days
- Dispute stage: 20 days
- Each file: 10 MB

## Build the evidence for your dispute

[Show the evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/?platform=paypal&network=paypal&productType=physical&code=MERCHANDISE_OR_SERVICE_NOT_RECEIVED)

## Upload limits

| Rule | PayPal |
| --- | --- |
| File types | PDF, JPEG, PNG, GIF |
| Combined size | 50 MB |
| Each file | under 10 MB |
| One file per evidence type | No |
| Links, audio, video | Not stated |
| Submissions | PayPal requests evidence when a case needs it; an internal dispute can be escalated to a claim and either side can appeal. |

Window: Card chargebacks: PayPal gives a standard 10-day window to respond. PayPal disputes: buyer and seller have up to 20 days to settle before either can escalate to a claim. The exact date is seller\_response\_due\_date on the case. Decision: For a claim, PayPal reviews and decides within 10 days of escalation. For a card chargeback, the card issuer decides.

## Fees

US accounts, in dollars

| Fee | Amount | Returned? |
| --- | ---: | --- |
| Standard Dispute Fee | $15.00 | Not stated on the pages read |
| High Volume Dispute Fee | $30.00 | Not stated on the pages read |
| Card chargeback fee (not via a PayPal account) | $20.00 | Not stated on the pages read |

The PayPal pages we could read do not say whether the fee is returned when you win (the User Agreement, which has the rules, could not be read).

## When fighting pays

The chance of winning above which countering costs less than accepting (your time not counted)

| Disputed amount | Extra cost to fight | Fight above |
| ---: | ---: | ---: |
| $25.00 | $0.00 | 0% |
| $40.00 | $0.00 | 0% |
| $75.00 | $0.00 | 0% |
| $100.00 | $0.00 | 0% |
| $250.00 | $0.00 | 0% |
| $500.00 | $0.00 | 0% |

## PayPal dispute reasons

Reasons from PayPal's Customer Disputes API, with the evidence to lead with (physical products)

| PayPal reason | Same as Stripe category | Lead with |
| --- | --- | --- |
| MERCHANDISE\_OR\_SERVICE\_NOT\_RECEIVED | Product not received | Proof of delivery, shipping details and signature or ID at pickup or delivery |
| MERCHANDISE\_OR\_SERVICE\_NOT\_AS\_DESCRIBED | Product unacceptable | How the product was described, messages with the customer and refund or return policy, and where it was shown |
| UNAUTHORISED | Fraudulent | Proof of delivery, shipping details and signature or ID at pickup or delivery |
| CREDIT\_NOT\_PROCESSED | Credit not processed | Proof a refund or credit was already issued, refund or return policy, and where it was shown and why no refund (or no further refund) is due |
| DUPLICATE\_TRANSACTION | Duplicate | Records showing the two charges are separate, proof of delivery and messages with the customer |
| INCORRECT\_AMOUNT | Unrecognized | Proof of delivery, shipping details and signature or ID at pickup or delivery |
| PAYMENT\_BY\_OTHER\_MEANS | Duplicate | Records showing the two charges are separate, proof of delivery and messages with the customer |
| CANCELED\_RECURRING\_BILLING | Subscription canceled | Cancellation policy, and where it was shown, why this charge stands after the claimed cancellation and renewal notices and use after the claimed cancellation |
| PROBLEM\_WITH\_REMITTANCE | General | Receipt or order confirmation, messages with the customer and proof of delivery |
| OTHER | General | Receipt or order confirmation, messages with the customer and proof of delivery |

## Time limits

- The buyer has 180 days from the payment to open a PayPal dispute.
- Buyer and seller have up to 20 days to settle it; then either can escalate it to a claim, which PayPal decides within 10 days.
- For a card chargeback, PayPal gives you a standard 10-day window, whatever the bank's own date, so it can prepare the response for the card processor.
- The exact date is seller\_response\_due\_date on the case; if you do not answer by then the case closes in the buyer's favor.

## Sources

- [PayPal Merchant Fees (US), last updated November 4, 2026 (read November 8, 2026)](https://www.paypal.com/us/business/paypal-business-fees)
- [PayPal Developer: Disputes overview, last updated November 3, 2026 (read November 8, 2026)](https://developer.paypal.com/docs/disputes/)
- [PayPal Developer: Disputes and chargebacks FAQ, last updated October 14, 2026 (read November 8, 2026)](https://developer.paypal.com/limited-release/commerce-platform/manage-risks-liabilities/disputes-chargebacks/faqs/)
- [PayPal Customer Disputes API v1.12 (schema) (read November 8, 2026)](https://developer.paypal.com/api/customer-disputes/v1/)

> Not legal advice. The card issuer decides each dispute; this page shows what the networks and platforms publish, as read on the date shown.

## Please read

- Not legal advice. The card issuer (or PayPal, for a PayPal claim) decides every dispute; no packet guarantees a win.
- Rules, limits and fees are as read on the dates shown. Card networks change their rules in April and October, and platforms change fees with notice.
- Your platform's due date is the deadline. The tool counts from the date you enter; it does not read your account.
- Files you upload are processed in memory to build the packet and are not kept. Only send evidence you are allowed to share with the card issuer.
- Mastercard, American Express and Discover codes are shown as Stripe publishes them; those networks' own rule books were not read.

## Questions

### How long do I have to respond to a PayPal dispute?

A standard 10 days for a card chargeback; 20 days to settle a PayPal dispute before escalation.

### Is it worth fighting a $40 PayPal dispute?

On a $40.00 PayPal dispute, fighting adds no fee, so submit evidence whenever you have it.

## Related

- [Stripe chargeback evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/stripe/)
- [Shopify Payments chargeback evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/shopify/)
- [Chargeback fees and break-even](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/fees/)
- [How to win a chargeback](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/guides/how-to-win-a-chargeback/)
- [Chargeback evidence API](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/developers/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/paypal/  
Data as of: 2026-11-08
