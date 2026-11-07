# Amazon GPSR safety attestation

Amazon's SP-API changelog describes gpsr\_safety\_attestation as "Boolean. True if product is exempt from safety attestation": it is 1 of the 4 GPSR attributes in the listings feed, and it does not replace the manufacturer (19(a)) or responsible person (19(b)) details. An EU-made cup marked true and checked here shows nothing missing.

## Check your Amazon report

[Open the checker](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/?platform=amazon&markets=DE%2CFR)

## The attributes, as Amazon lists them

| Attribute | What it holds |
| --- | --- |
| `gpsr_manufacturer_reference.gpsr_manufacturer_email_address` | Manufacturer's email (ASIN level) |
| `dsa_responsible_party_address` | Responsible party's email (SKU level) |
| `gpsr_safety_attestation` | Boolean. True if product is exempt from safety attestation |
| `compliance_media` | Documents: content\_type (for example safety\_information, user\_manual, instructions\_for\_use), content\_language (for example de\_DE) and source\_location (a document URL; not Google Drive or Dropbox) |

Manufacturer and EU Responsible Person contact information must be entered in Seller Central or Vendor Central before the GPSR attributes are updated.

## How the checker reads it

A row with gpsr\_safety\_attestation set to true is not asked for warnings. Every other Article 19 item is still checked: the attestation flag says nothing about the manufacturer, the responsible person or the picture.

- The cup: nothing missing.

> Amazon does not say on that page what "exempt from safety attestation" covers. Use the definition in your Seller Central notice.

## Sources

- [Amazon SP-API changelog: GPSR attributes (read November 8, 2026)](https://developer-docs.amazon/sp-api/changelog/developers-can-use-attributes-in-their-programmatic-listings-submissions-to-comply-with-gpsr)
- [EUR-Lex: Regulation (EU) 2023/988 on general product safety (read November 8, 2026)](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023R0988)

> This checks what your listing data shows against Article 19 of Regulation (EU) 2023/988 (GPSR). It does not certify that a product is safe or compliant, and it cannot confirm that an address is real or that a company is established in the EU. Each Member State decides the language of warnings. The check compares the warning language with that state's official EU languages; national rules can ask for more. Products under other EU product laws (toys, cosmetics, electrical goods and more) can need further warnings and marks that this check does not cover. Rules read from EUR-Lex and the European Commission on the dates shown. Not legal advice.

## Related

- [GPSR for Amazon sellers](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/amazon/)
- [Auditing a whole store for GPSR gaps](https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/bulk-audit/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/gpsr-listing-checker/amazon/safety-attestation/  
Data as of: 2026-11-08
