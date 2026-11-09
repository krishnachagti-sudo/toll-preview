# Visa Compelling Evidence 3.0 (CE 3.0)

CE 3.0 applies only to Visa 10.4. For disputes processed from October 24, 2026, you need 2 earlier payments on the same card, not reported as fraud, processed more than 120 and no more than 365 days before the dispute, each matching it on the device ID or fingerprint or the IP address plus at least one more of login ID, full delivery address, device or IP.

- Earlier payments needed: 2

## Build the evidence for your dispute

[Show the evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/?platform=stripe&network=visa&productType=physical&code=10.4)

## The identifiers, as Visa defines them

| Element | Visa's requirement |
| --- | --- |
| Device ID | A unique identifier the cardholder can verify (a serial number such as an IMEI), at least 15 characters, in clear text |
| Device fingerprint | Derived from at least two software or hardware properties, at least 20 characters, may be hashed; counts as the same element as device ID |
| IP address | The cardholder's public IPv4 or IPv6 address, in clear text |
| Login ID | The account or login ID used to authenticate the cardholder, in clear text |
| Delivery address | The full shipping address: street, city, state or province, postal code and country |

## A worked example

Not eligible for Compelling Evidence 3.0 as entered: 1 of the 2 qualifying earlier payments needed. Qualifying payments fall between November 8, 2025 and July 10, 2026.

- Payment of March 2, 2026 (251 days before): qualifies, matching IP address and account or login ID.
- Payment of August 1, 2026 (99 days before): only 99 days before the dispute (more than 120 needed).

Also needed: a detailed description of what was bought in the disputed payment and both earlier payments. Visa's merchant guide says your acquirer can advise on the exact data your response needs.

## Sources

- [Visa Core Rules and Visa Product and Service Rules, 24 October 2026 (read November 8, 2026)](https://usa.visa.com/content/dam/VCOM/download/about-visa/visa-rules-public.pdf)
- [Visa Dispute Management Guide for Merchants, October 2026 (read November 8, 2026)](https://usa.visa.com/dam/VCOM/global/support-legal/documents/merchants-dispute-management-guidelines.pdf)
- [Stripe Docs: Dispute evidence best practices (read November 8, 2026)](https://docs.stripe.com/disputes/best-practices)

> Not legal advice. The card issuer decides each dispute; this page shows what the networks and platforms publish, as read on the date shown.

## Questions

### Does CE 3.0 apply to every fraud dispute?

No. Only to Visa 10.4 (card-absent fraud), and only when the earlier payments, their dates and their matching identifiers meet the rule.

## Related

- [Visa 10.4](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/visa/10-4/)
- [Friendly fraud chargebacks](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/disputes/friendly-fraud/)
- [Stripe dispute tools compared](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/vs/stripe-dispute-tools/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/guides/visa-ce3/  
Data as of: 2026-11-08
