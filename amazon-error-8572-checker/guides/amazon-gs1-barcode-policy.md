# Amazon's GS1 barcode policy

Amazon verifies every UPC against the GS1 database and treats codes that do not match GS1's information as invalid; it tells sellers to get UPCs directly from GS1, not from third parties selling UPC licenses, and to wait at least 72 hours after buying new GS1 codes before listing.

## Check one of your codes

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=614141000012&brand=Harbor+%26+Pine&licensee=Harbor+%26+Pine&prefix=0614141)

## The rules, in Amazon's words

From Amazon's Seller Central help (United States), read November 8, 2026.

| Rule | Amazon help page |
| --- | --- |
| "We verify the authenticity of product UPCs by checking the GS1 database. UPCs that do not match the information provided by GS1 will be considered invalid." | Valid UPCs |
| "Obtain your UPCs directly from GS1 (and not from other third parties selling UPC licenses)" | Valid UPCs |
| "We do not accept that the barcode which is from a third party." | Error 8572 |
| Wait at least 72 hours after buying newly issued GTINs or UPCs from GS1 before listing. | Error 8572 |
| Product IDs will be confirmed against the GS1 database. | Find your product ID (GTIN) |
| "The use of false product identification information, including UPC codes, is prohibited." | Guidelines for UPC and GTIN |
| UPC: 12 digits. EAN and JAN: 13 digits. GTIN-14: 14 digits. ISBN: 10 or 13 digits. | Find your product ID (GTIN) |

## What a code that passes looks like

614141000012: the check digit is 2, the GS1 Prefix is 061 (GS1 US), it sits inside the company prefix 0614141 and the brand on the listing is the name on the GS1 record. That is the shape Amazon's Error 8572 help describes: a barcode that belongs to the brand.

## What Amazon does when a code does not match

The Valid UPCs page says invalid product UPC listings will be removed and may cost a seller its ASIN creation or selling privileges, temporarily or permanently. The Error 8572 message itself says using incorrect codes can get ASIN creation privileges suspended or removed.

## Categories that require a product ID

Amazon's Product ID (GTIN) requirements by category table requires a product ID in most categories; for many it adds "Major brands require a UPC, but exemptions may be requested for private label brands." Everything Else and Sports Collectibles do not require one. Where your product has no barcode, see the GTIN exemption guide.

## Sources

- [Amazon Seller Central help: Valid UPCs (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GLE2KYT2UVPMTYGS)
- [Amazon Seller Central help: Error 8572 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GUBJ9DCQUDLG9YGQ)
- [Amazon Seller Central help: Find your product ID (GTIN) (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200211450)
- [Amazon Seller Central help: Guidelines for UPC and GTIN (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G5JQC6VY6BVYWDPT)
- [Amazon Seller Central help: Product ID (GTIN) requirements by category (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200317520)

> Amazon decides which listings it accepts and does not publish how it matches names; a pass here is not Amazon's approval.

## Questions

### Does Amazon check UPCs against GS1?

Yes. Amazon's Valid UPCs help page: "We verify the authenticity of product UPCs by checking the GS1 database. UPCs that do not match the information provided by GS1 will be considered invalid."

### How long after buying GS1 codes can I list?

Amazon's Error 8572 help recommends waiting at least 72 hours after buying newly issued GTINs or UPCs from GS1, so it can validate them in the GS1 database.

### Can I use UPCs bought from another company?

Amazon's Valid UPCs help says to obtain UPCs directly from GS1 and not from other third parties selling UPC licenses, and its Error 8572 help says: "We do not accept that the barcode which is from a third party."

## Related

- [Error 8572 explained](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/error-8572-explained/)
- [Bought UPCs from a reseller?](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/reseller-upcs/)
- [Amazon GTIN exemption](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/gtin-exemption/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/amazon-gs1-barcode-policy/  
Data as of: 2026-11-08
