# Item not received chargebacks

An item-not-received chargeback is Visa 13.1, Mastercard 4855, Amex C08 or Discover 4755 (and PayPal's "not received"); Stripe files all 9 of these codes under "Product not received". Tracking marked delivered answers it best when it shows the full delivery address matching the order, plus a signature or delivery photo.

- Codes in the category: 9

## Build the evidence for your dispute

[Show the evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/?platform=stripe&network=visa&productType=physical&code=13.1)

## The codes

| Network | Code | Name |
| --- | --- | --- |
| Visa | 13.1 | Merchandise/Services Not Received |
| Visa | 13.9 | Non-Receipt of Cash or Load Transaction Value |
| Mastercard | 4855 | Transaction Did Not Complete |
| American Express | C08 | Goods/Services Not Received or Only Partially Received |
| American Express | 004 | Product Not Received |
| American Express | 155 | Goods not Received (Request Credit) |
| Discover | 4755 | Non-Receipt of Goods or Services |
| Discover | 4864 | Non Receipt Of Cash From ATM |
| PayPal | MERCHANDISE\_OR\_SERVICE\_NOT\_RECEIVED | Merchandise or service not received |

## What a proof of delivery needs (Visa)

- Proof of delivery with the full delivery address matching the order, and the courier's delivery status
- A recipient signature or a delivery photo where you have one
- Delivery confirmation sent to the email or phone the customer gave at purchase
- For services: records, logs or a signed acknowledgement that the cardholder received the service
- For future services: proof the service is still available and you are ready to provide it

- Visa says you stay responsible for delivery even when a courier or customs causes the failure.
- The cardholder does not have to accept another date or a replacement service.
- Visa's own guide heads this section "Invalid Data" by mistake; the text is about non-receipt.

## Evidence, strongest first

| # | Evidence | What to include | Stripe field | PayPal evidence type |
| ---: | --- | --- | --- | --- |
| 1 | Proof of delivery | The carrier record showing delivery status and the full delivery address (it must match the order), plus the signature or delivery photo where the carrier has one. | shipping\_documentation | PROOF\_OF\_FULFILLMENT |
| 2 | Shipping details | Ship-to address, ship date, carrier and tracking number, typed in (not a tracking link: banks do not follow links). | shipping\_address, shipping\_date, shipping\_carrier, shipping\_tracking\_number | ONLINE\_TRACKING\_INFORMATION |
| 3 | Signature or ID at pickup or delivery | A signed delivery or pickup record, or the ID the customer showed, linking the cardholder to the goods. | customer\_signature | PROOF\_OF\_DELIVERY\_SIGNATURE |
| 4 | Messages with the customer | Only the relevant emails, chats or dated call notes, combined into one file. If the customer never contacted you before disputing, say so in the letter. | customer\_communication | OTHER |
| 5 | Proof the customer has the goods | Anything showing the cardholder has or uses what they bought: photos, messages, reviews or support requests about the item. | uncategorized\_file | OTHER |
| 6 | Receipt or order confirmation | The receipt or confirmation sent to the customer: date, amount, items and the address it went to. | receipt | PROOF\_OF\_RECEIPT\_COPY |
| 7 | Delivery not due yet, or held by customs | The agreed delivery date shown at checkout (still in the future), or the customs hold record. | uncategorized\_file | PROOF\_OF\_EXPECTED\_DELIVERY\_DATE |
| 8 | Proof a refund or credit was already issued | The refund record: amount, date and reference, from your payment dashboard. | uncategorized\_file | PROOF\_OF\_REFUND |
| 9 | The customer withdrew the dispute | The customer's written statement that they no longer dispute the charge (or the bank's withdrawal letter). | customer\_communication | OTHER |

## Digital goods and services

| # | Evidence | What to include | Stripe field | PayPal evidence type |
| ---: | --- | --- | --- | --- |
| 1 | Access or download log | Server or account records of logins, downloads or use after the payment, with dates, times and IP addresses. | uncategorized\_file, access\_activity\_log | PROOF\_FOR\_SOFTWARE\_OR\_SERVICE\_DELIVERED |
| 2 | Customer details | Customer name, email, billing address and the IP address used for the purchase, typed in. | customer\_name, customer\_email\_address, billing\_address, customer\_purchase\_ip | DETAILS\_OF\_PURCHASE |
| 3 | Messages with the customer | Only the relevant emails, chats or dated call notes, combined into one file. If the customer never contacted you before disputing, say so in the letter. | customer\_communication | OTHER |
| 4 | Receipt or order confirmation | The receipt or confirmation sent to the customer: date, amount, items and the address it went to. | receipt | PROOF\_OF\_RECEIPT\_COPY |
| 5 | Delivery not due yet, or held by customs | The agreed delivery date shown at checkout (still in the future), or the customs hold record. | uncategorized\_file | PROOF\_OF\_EXPECTED\_DELIVERY\_DATE |
| 6 | Proof a refund or credit was already issued | The refund record: amount, date and reference, from your payment dashboard. | uncategorized\_file | PROOF\_OF\_REFUND |
| 7 | The customer withdrew the dispute | The customer's written statement that they no longer dispute the charge (or the bank's withdrawal letter). | customer\_communication | OTHER |

## Sources

- [Stripe Docs: Dispute reason code categories (read November 8, 2026)](https://docs.stripe.com/disputes/categories)
- [Stripe Docs: Dispute reason codes (read November 8, 2026)](https://docs.stripe.com/disputes/reason-codes-defense-requirements)
- [Visa Dispute Management Guide for Merchants, October 2026 (read November 8, 2026)](https://usa.visa.com/dam/VCOM/global/support-legal/documents/merchants-dispute-management-guidelines.pdf)
- [PayPal Customer Disputes API v1.12 (schema) (read November 8, 2026)](https://developer.paypal.com/api/customer-disputes/v1/)

> Not legal advice. The card issuer decides each dispute; this page shows what the networks and platforms publish, as read on the date shown.

## Please read

- Not legal advice. The card issuer (or PayPal, for a PayPal claim) decides every dispute; no packet guarantees a win.
- Rules, limits and fees are as read on the dates shown. Card networks change their rules in April and October, and platforms change fees with notice.
- Your platform's due date is the deadline. The tool counts from the date you enter; it does not read your account.
- Files you upload are processed in memory to build the packet and are not kept. Only send evidence you are allowed to share with the card issuer.
- Mastercard, American Express and Discover codes are shown as Stripe publishes them; those networks' own rule books were not read.

## Questions

### What evidence wins an item-not-received chargeback?

Proof of delivery with the full delivery address matching the order and the courier's delivery status, ideally with a signature or delivery photo, plus messages with the customer.

## Related

- [Visa 13.1](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/visa/13-1/)
- [Mastercard 4855](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/mastercard/4855/)
- [Friendly fraud chargebacks](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/disputes/friendly-fraud/)
- [Not received, but tracking says delivered](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/guides/not-received-with-tracking/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/disputes/item-not-received/  
Data as of: 2026-11-08
