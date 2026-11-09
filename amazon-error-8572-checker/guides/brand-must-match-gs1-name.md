# Brand name vs GS1 company name

Amazon does not say the brand must be letter-for-letter the GS1 company name, but its Error 8572 help says the barcode must belong to the brand and asks a brand owner whose GS1 legal entity differs from the brand for proof the two are related; so "Harbor & Pine" against a GS1 record for "Harbor & Pine LLC" (the same name apart from the legal form) needs a trademark or a website naming the legal entity, while "Pine Street Goods" against it (different names) needs a letter from the licensee.

## Compare your two names

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=614141000012&brand=Harbor+%26+Pine&licensee=Harbor+%26+Pine+LLC)

## Eight pairs, compared

The checker's comparison; Amazon does not publish its own.

| Brand on Amazon | GS1 licensee | Result | Differences |
| --- | --- | --- | --- |
| Harbor & Pine LLC | Harbor & Pine LLC | identical | none |
| HARBOR & PINE LLC | Harbor & Pine LLC | the same letters, but not the same capitals or spacing | capitalization |
| Harbor & Pine, LLC | Harbor & Pine LLC | the same words, but not the same punctuation | punctuation |
| Harbor and Pine LLC | Harbor & Pine LLC | the same words, but not the same punctuation | & written as "and" |
| Harbor & Pine | Harbor & Pine LLC | the same name apart from the legal form | legal form (LLC) |
| Harbor & Pine Home | Harbor & Pine LLC | one name inside the other, with extra words | extra words: home; legal form (LLC) |
| HarborPine | Harbor & Pine LLC | different names | different names |
| Pine Street Goods | Harbor & Pine LLC | different names | different names |

## What to do about a difference

- Capitals or spacing: type the brand as it is printed on the product. Amazon's brand formatting allows all caps only if the product shows it that way.
- Legal form or extra words: send proof that the legal entity is related to the brand (trademark, or a website that shows the brand and names the entity) with the GS1 certificate.
- Different names: a letter of affiliation from the licensee, or GS1 codes licensed to the brand's own company. GS1 US changes a legal name only after it is amended with the Secretary of State (confirmation within 5 business days, a decision 3 business days later).
- A DBA or trade name: GS1 US lists a fictitious name certificate among the documents for a name change.

## Sources

- [Amazon Seller Central help: Error 8572 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GUBJ9DCQUDLG9YGQ)
- [Amazon Seller Central help: Amazon Brand Name policy (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G2N3GKE5SGSHWYRZ)
- [Amazon Seller Central help: List products that do not have a product ID (UPC, EAN, JAN, or ISBN) (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200426310)
- [GS1 US FAQ: Update prefix registration (identifier transfer, M&A, company name change) (read November 8, 2026)](https://www.gs1us.org/faqs/update-prefix-registration)

> Every company name and code in the examples is made up; a code may happen to belong to a real company, and this page does not say who.

## Questions

### My brand is a trade name of my LLC. Is that a problem?

Amazon's Error 8572 help asks the brand owner for proof that the legal entity on the GS1 certificate is related to the brand, such as a trademark or a website that shows the brand and names the legal entity.

### Can I change the company name GS1 US has?

GS1 US: "A company can request for GS1 US to change its legal name in GS1 US records after it has amended it with the Secretary of State."

### Can I fix the brand on an existing ASIN?

Amazon's Brand Name policy: "Minor corrections can be made such as fixing typos, capitalization, and issues with legal abbreviations." Through Selling Partner Support, Brand - update.

## Related

- [Error 8572 explained](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/error-8572-explained/)
- [Letter of affiliation](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/letter-of-affiliation/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/brand-must-match-gs1-name/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/brand-must-match-gs1-name.csv
