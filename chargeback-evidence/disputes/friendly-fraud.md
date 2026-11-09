# Friendly fraud chargebacks

"Friendly fraud" is a fraud or "unrecognized" chargeback on a purchase the cardholder did make. Stripe files 28 network codes under "Fraudulent" (Visa 10.4, Mastercard 4837, Amex F29, Discover 7030 among them) and 6 under "Unrecognized". For Visa 10.4, Compelling Evidence 3.0 lets two earlier undisputed payments, 121 to 365 days old, with the same device or IP plus one more match, answer it.

- Fraud codes: 28
- Unrecognized codes: 6

## Build the evidence for your dispute

[Show the evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/?platform=stripe&network=visa&productType=physical&code=10.4)

## Fraud codes

| Network | Code | Name |
| --- | --- | --- |
| Visa | 33 | Fraud analysis request |
| Visa | 10.1 | EMV Liability Shift Counterfeit Fraud |
| Visa | 10.2 | EMV Liability Shift Non-Counterfeit Fraud |
| Visa | 10.3 | Other Fraud - Card Present Environment |
| Visa | 10.4 | Other Fraud - Card Absent Environment |
| Visa | 10.5 | Visa Fraud Monitoring Program |
| Mastercard | 6341 | Fraud investigation |
| Mastercard | 4837 | No Cardholder Authorization |
| Mastercard | 4849 | Questionable Merchant Activity |
| Mastercard | 4870 | Chip Liability Shift |
| Mastercard | 4871 | Chip Liability Shift - Lost/Stolen/Never Received Issue (NRI) Fraud |
| American Express | F10 | Missing Imprint |
| American Express | F24 | Multiple ROCs |
| American Express | F29 | Card Not Present |
| American Express | F30 | EMV Liability Shift - Counterfeit |
| American Express | F31 | EMV Liability Shift - Lost/Stolen/Non-Received |
| American Express | FR2 | Fraud Full Recourse Program |
| American Express | FR4 | Immediate Chargeback Program |
| American Express | FR5 | Immediate Chargeback Program |
| American Express | FR6 | Partial Immediate Chargeback Program |
| American Express | 177 | Unauthorized Charge |
| American Express | 193 | Fraudulent Charge |
| Discover | 6041 | Transaction Documentation Request for Fraud Analysis |
| Discover | 4866 | Fraud Chip Card Counterfeit Transaction |
| Discover | 4867 | Fraud Chip Card and PIN Transaction |
| Discover | 7010 | Fraud Card Present Transaction |
| Discover | 7030 | Fraud Card Not Present Transaction |
| PayPal | UNAUTHORISED | Unauthorized |

## Unrecognized codes

| Network | Code | Name |
| --- | --- | --- |
| Mastercard | 6321 | Cardholder does not recognize transaction |
| Mastercard | 4863 | Cardholder Does Not Recognize - Potential Fraud |
| American Express | 127 | Unrecognized Charge |
| American Express | 176 | Unrecognized Charge (Card Not Present) |
| American Express | 691 | Requesting Support |
| PayPal | INCORRECT\_AMOUNT | Incorrect amount |

## Evidence for a physical product

| # | Evidence | What to include | Stripe field | PayPal evidence type |
| ---: | --- | --- | --- | --- |
| 1 | Proof of delivery | The carrier record showing delivery status and the full delivery address (it must match the order), plus the signature or delivery photo where the carrier has one. | shipping\_documentation | PROOF\_OF\_FULFILLMENT |
| 2 | Shipping details | Ship-to address, ship date, carrier and tracking number, typed in (not a tracking link: banks do not follow links). | shipping\_address, shipping\_date, shipping\_carrier, shipping\_tracking\_number | ONLINE\_TRACKING\_INFORMATION |
| 3 | Signature or ID at pickup or delivery | A signed delivery or pickup record, or the ID the customer showed, linking the cardholder to the goods. | customer\_signature | PROOF\_OF\_DELIVERY\_SIGNATURE |
| 4 | Proof the customer has the goods | Anything showing the cardholder has or uses what they bought: photos, messages, reviews or support requests about the item. | uncategorized\_file | OTHER |
| 5 | Earlier undisputed payments by the same customer | Earlier payments on the same card that were not disputed, with the matching device ID or IP address plus login, delivery address or email. | uncategorized\_file | OTHER |
| 6 | Authentication and verification results | 3D Secure result, AVS (address) and CVC check results for this payment. | uncategorized\_file | OTHER |
| 7 | Messages with the customer | Only the relevant emails, chats or dated call notes, combined into one file. If the customer never contacted you before disputing, say so in the letter. | customer\_communication | OTHER |
| 8 | Proof a refund or credit was already issued | The refund record: amount, date and reference, from your payment dashboard. | uncategorized\_file | PROOF\_OF\_REFUND |
| 9 | The customer withdrew the dispute | The customer's written statement that they no longer dispute the charge (or the bank's withdrawal letter). | customer\_communication | OTHER |

## Evidence for a digital product or service

| # | Evidence | What to include | Stripe field | PayPal evidence type |
| ---: | --- | --- | --- | --- |
| 1 | Customer details | Customer name, email, billing address and the IP address used for the purchase, typed in. | customer\_name, customer\_email\_address, billing\_address, customer\_purchase\_ip | DETAILS\_OF\_PURCHASE |
| 2 | Access or download log | Server or account records of logins, downloads or use after the payment, with dates, times and IP addresses. | uncategorized\_file, access\_activity\_log | PROOF\_FOR\_SOFTWARE\_OR\_SERVICE\_DELIVERED |
| 3 | Earlier undisputed payments by the same customer | Earlier payments on the same card that were not disputed, with the matching device ID or IP address plus login, delivery address or email. | uncategorized\_file | OTHER |
| 4 | Authentication and verification results | 3D Secure result, AVS (address) and CVC check results for this payment. | uncategorized\_file | OTHER |
| 5 | Messages with the customer | Only the relevant emails, chats or dated call notes, combined into one file. If the customer never contacted you before disputing, say so in the letter. | customer\_communication | OTHER |
| 6 | Proof a refund or credit was already issued | The refund record: amount, date and reference, from your payment dashboard. | uncategorized\_file | PROOF\_OF\_REFUND |
| 7 | The customer withdrew the dispute | The customer's written statement that they no longer dispute the charge (or the bank's withdrawal letter). | customer\_communication | OTHER |

## Visa Compelling Evidence 3.0

- Compelling evidence must name the payment credential (last 4 digits or token), the amount and the cardholder.
- CE 3.0 needs two earlier undisputed payments on the same card, processed more than 120 days and no more than 365 days before the dispute, with the device ID or fingerprint or IP address plus one more element matching.
- Stripe flags CE 3.0 eligible disputes and pre-fills the fields; do not edit pre-filled values.

> Visa 10.5 (Visa Fraud Monitoring Program) disputes take no evidence, per Stripe.

## Sources

- [Stripe Docs: Dispute reason code categories (read November 8, 2026)](https://docs.stripe.com/disputes/categories)
- [Stripe Docs: Dispute reason codes (read November 8, 2026)](https://docs.stripe.com/disputes/reason-codes-defense-requirements)
- [Stripe Docs: Dispute evidence best practices (read November 8, 2026)](https://docs.stripe.com/disputes/best-practices)
- [Visa Dispute Management Guide for Merchants, October 2026 (read November 8, 2026)](https://usa.visa.com/dam/VCOM/global/support-legal/documents/merchants-dispute-management-guidelines.pdf)
- [Visa Core Rules and Visa Product and Service Rules, 24 October 2026 (read November 8, 2026)](https://usa.visa.com/content/dam/VCOM/download/about-visa/visa-rules-public.pdf)

> Not legal advice. The card issuer decides each dispute; this page shows what the networks and platforms publish, as read on the date shown.

## Please read

- Not legal advice. The card issuer (or PayPal, for a PayPal claim) decides every dispute; no packet guarantees a win.
- Rules, limits and fees are as read on the dates shown. Card networks change their rules in April and October, and platforms change fees with notice.
- Your platform's due date is the deadline. The tool counts from the date you enter; it does not read your account.
- Files you upload are processed in memory to build the packet and are not kept. Only send evidence you are allowed to share with the card issuer.
- Mastercard, American Express and Discover codes are shown as Stripe publishes them; those networks' own rule books were not read.

## Questions

### Can I win a fraud chargeback?

Stripe calls fraud disputes difficult to win, because the claim is often true; you need proof the cardholder or someone they authorized made the payment, or 3D Secure authentication, or for Visa 10.4 Compelling Evidence.

## Related

- [Visa 10.4](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/visa/10-4/)
- [Mastercard 4837](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/mastercard/4837/)
- [Visa CE 3.0 guide](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/guides/visa-ce3/)
- [Item not received chargebacks](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/disputes/item-not-received/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/disputes/friendly-fraud/  
Data as of: 2026-11-08
