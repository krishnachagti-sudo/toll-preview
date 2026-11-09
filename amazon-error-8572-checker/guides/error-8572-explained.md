# Amazon Error 8572 explained

Amazon Error 8572 means the product ID you entered (UPC, EAN, ISBN, JAN or ASIN) does not match the brand or product: in Amazon's words, "The barcode you are using doesn't belong to the brand"; Amazon checks UPCs against the GS1 database, so the code must be licensed to the brand, or you must prove the link with documents.

## Check your code

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=614141000012&brand=Harbor+%26+Pine&licensee=Harbor+%26+Pine+LLC&prefix=0614141)

## The message

"You are using UPCs, EANs, ISBNs, ASINs, or JAN codes that do not match the products you are trying to list. Using incorrect codes is prohibited and it can result in your ASIN creation privileges being suspended or permanently removed. Ensure you are always using the appropriate code when listing a product."

## What has to agree

- The GTIN: 12, 13 or 14 digits with a valid GS1 check digit.
- The GS1 record: the company the code's prefix is licensed to.
- The brand on your listing: the brand on the product.
- Your relationship to that company: owner, authorized seller, or licensee through a licensing company.

## The four ways out

| If | Then |
| --- | --- |
| The code has a typo or lost digits | Fix the number; the checker shows the valid one when the damage is a lost leading zero. |
| The codes are new from GS1 (under 72 hours) | Wait 72 hours and list again. |
| You own the brand but GS1 shows your company's legal name | Send proof that the legal entity is related to the brand (trademark, or a website showing the brand that names the legal entity), with the GS1 certificate. |
| You are not the brand owner | Send a letter or agreement from the manufacturer or brand confirming the GTIN is valid and theirs. |
| The code came from a reseller | Amazon: "We do not accept that the barcode which is from a third party." Use GS1 codes licensed to the brand. |
| The product has no barcode at all | Apply for a GTIN exemption. |

## Sources

- [Amazon Seller Central help: Error 8572 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GUBJ9DCQUDLG9YGQ)
- [Amazon Seller Central help: Valid UPCs (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GLE2KYT2UVPMTYGS)
- [Amazon Seller Central help: List products that do not have a product ID (UPC, EAN, JAN, or ISBN) (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200426310)

> Amazon decides listings and does not publish how it matches names. Not legal advice.

## Questions

### What is Amazon Error 8572?

Amazon's message: "You are using UPCs, EANs, ISBNs, ASINs, or JAN codes that do not match the products you are trying to list. Using incorrect codes is prohibited and it can result in your ASIN creation privileges being suspended or permanently removed. Ensure you are always using the appropriate code when listing a product."

### Does the brand have to match GS1 exactly?

Amazon's help says the barcode must belong to the brand and asks a brand owner for proof that the legal entity on the GS1 certificate is related to the brand. It does not publish how it compares the names.

### Why do I get 8572 on codes I just bought from GS1?

Amazon recommends waiting at least 72 hours after buying newly issued GTINs from GS1 so it can validate them.

## Related

- [Fix Error 8572 step by step](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/fix-error-8572-step-by-step/)
- [Error 8572: cómo resolverlo (español)](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/error-8572-es/)
- [Letter of affiliation](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/letter-of-affiliation/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/error-8572-explained/  
Data as of: 2026-11-08
