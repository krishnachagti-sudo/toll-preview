# Chargeback evidence API

POST the reason code to /api/v1/tools/chargeback-evidence with op "checklist" and get the evidence list with each Stripe field and PayPal evidence type (9 items for Visa 13.1); op "packet" returns the letter and one PDF per evidence slot, checked against the platform's limits, for $2.90 per dispute.

- Items for Visa 13.1: 9

## Operations

| op | What it returns | Price |
| --- | --- | --- |
| rules, codes | The data: every code, category, evidence item, limit and fee with sources | Free |
| checklist | Meaning, category, evidence strongest first with Stripe fields and PayPal types | Free on the page; $0.01 over the API or MCP |
| worth | Fees, costs if you accept, win or lose, break-even | Free |
| deadline | Days left and an .ics calendar file | Free |
| ce3 | Visa Compelling Evidence 3.0 test, payment by payment | Free |
| packet (preview: true) | Watermarked letter and the limits check | Free |
| packet | Letter, one PDF per evidence slot (base64), Stripe text fields, the limits check and the upload steps | $2.90 per dispute; changes free for 30 days |

## A checklist call

```bash
curl -X POST https://conyso.com/endwise/api/v1/tools/chargeback-evidence \
  -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" \
  -d '{"op":"checklist","platform":"stripe","network":"visa","code":"13.1","productType":"physical"}'
```

First items returned: Proof of delivery (file field shipping\_documentation); Shipping details (text fields shipping\_address, shipping\_date, shipping\_carrier, shipping\_tracking\_number); Signature or ID at pickup or delivery (file field customer\_signature).

## From a Stripe webhook

- On charge.dispute.created, read the dispute's reason, payment\_method\_details.card.network\_reason\_code and evidence\_details.due\_by.
- Call op "checklist" with the network and code; gather the files it lists from your order system.
- Call op "packet" with the files (base64); upload each returned file with purpose dispute\_evidence and set evidence\[slot\] to its file id; put textFields in the evidence text fields.
- Stripe takes one submission: submit only when the limits check says ok.

## PayPal

Upload each file to provide-evidence with the evidence type the packet names; PayPal accepts up to 10 MB per file and 50 MB per case.

## Sources

- [Stripe Docs: Manage disputes programmatically (read November 8, 2026)](https://docs.stripe.com/disputes/api)
- [Stripe API: the Dispute object (evidence fields) (read November 8, 2026)](https://docs.stripe.com/api/disputes/object)
- [Stripe Docs: Dispute evidence best practices (read November 8, 2026)](https://docs.stripe.com/disputes/best-practices)
- [PayPal Customer Disputes API v1.12 (schema) (read November 8, 2026)](https://developer.paypal.com/api/customer-disputes/v1/)

## Related

- [Stripe dispute evidence](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/stripe/)
- [PayPal disputes](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/paypal/)
- [Reason codes](https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/reason-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/chargeback-evidence/developers/  
Data as of: 2026-11-08
