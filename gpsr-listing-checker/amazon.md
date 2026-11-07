# GPSR for Amazon sellers

Amazon's listings feed carries 4 GPSR attributes: gpsr\_manufacturer\_reference.gpsr\_manufacturer\_email\_address, dsa\_responsible\_party\_address, gpsr\_safety\_attestation, compliance\_media; the manufacturer's and EU responsible person's contact details must first be entered in Seller Central or Vendor Central. Checked here, the worked example's LED lamp shows nothing missing.

## Check your Amazon export

[Open the checker](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/?platform=amazon&markets=DE%2CFR)

## Amazon's GPSR attributes

From Amazon's SP-API changelog (read November 8, 2026)

| Attribute | What it holds | Article 19 |
| --- | --- | --- |
| `gpsr_manufacturer_reference.gpsr_manufacturer_email_address` | Manufacturer's email (ASIN level) | (a) |
| `dsa_responsible_party_address` | Responsible party's email (SKU level) | (b) |
| `gpsr_safety_attestation` | Boolean. True if product is exempt from safety attestation | (d) |
| `compliance_media` | Documents: content\_type (for example safety\_information, user\_manual, instructions\_for\_use), content\_language (for example de\_DE) and source\_location (a document URL; not Google Drive or Dropbox) | (d) |

Manufacturer and EU Responsible Person contact information must be entered in Seller Central or Vendor Central before the GPSR attributes are updated.

Compliance documents: content\_type is one of `patient_fact_sheet, provider_fact_sheet, installation_manual, instructions_for_use, user_guide, user_manual, safety_information`. Amazon refuses Google Drive and Dropbox links, and the checker flags them.

## A listing checked

An LED desk lamp made in Shenzhen, sold into Germany. Its report carries only the emails, so the manufacturer's name and postal address are given once as shop-wide details:

```json
{
  "item_sku": "LAMP-7",
  "item_name": "LED desk lamp",
  "gpsr_manufacturer_reference#1.gpsr_manufacturer_email_address": "compliance@lumenlamps.example",
  "dsa_responsible_party_address": "rp@dublin-rep.example",
  "responsible person": "Dublin Rep Ltd",
  "responsible person address": "7 Quay St, Dublin 2, D02 X285, Ireland",
  "main_image_url": "https://cdn.example.com/lamp-7.jpg",
  "model_number": "LL-7",
  "external_product_id": "4006381333931",
  "safety information": "Nur in Innenräumen verwenden. Nicht für Kinder unter 3 Jahren geeignet."
}
```

- Nothing missing.

The manufacturer is in China, so the responsible person is needed (needed); the warning reads as German, an official language of Germany.

## Sources

- [Amazon SP-API changelog: GPSR attributes (read November 8, 2026)](https://developer-docs.amazon/sp-api/changelog/developers-can-use-attributes-in-their-programmatic-listings-submissions-to-comply-with-gpsr)
- [EUR-Lex: Regulation (EU) 2023/988 on general product safety (read November 8, 2026)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R0988)

> Amazon's field names and limits change; they are quoted as read on November 8, 2026. Rules read from EUR-Lex and the European Commission on the dates shown. Not legal advice.

## Questions

### What does gpsr\_safety\_attestation mean?

Amazon describes it as: "Boolean. True if product is exempt from safety attestation".

## Related

- [Amazon GPSR safety attestation](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/amazon/safety-attestation/)
- [Do I need an EU responsible person?](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/responsible-person/)
- [GPSR for eBay sellers](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/ebay/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/amazon/  
Data as of: 2026-11-08
