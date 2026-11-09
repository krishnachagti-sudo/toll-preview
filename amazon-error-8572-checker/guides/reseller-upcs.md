# UPCs from a reseller and Amazon

A resold UPC usually fails the check Amazon describes: Amazon verifies UPCs against the GS1 database, the GS1 record names whoever licensed the prefix (not your brand), and Amazon's Error 8572 help says "We do not accept that the barcode which is from a third party."; GS1 US says a prefix is for the sole use of the member it is licensed to.

## Check a code you bought

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=614142000004&brand=Harbor+%26+Pine&licensee=Example+Code+Seller+Inc&prefix=0614141&role=brand-owner)

## What the checker says about such a code

A made-up case: code 614142000004, bought from a reseller whose name is on the GS1 record, listed by a brand whose own prefix is 0614141: The code does not start with your company prefix 0614141, so GS1's record for it names whoever licensed that number, not you. The brand "Harbor & Pine" and the GS1 licensee "Example Code Seller Inc" are different names.

## What Amazon and GS1 say

- Amazon, Valid UPCs: "We verify the authenticity of product UPCs by checking the GS1 database. UPCs that do not match the information provided by GS1 will be considered invalid."
- Amazon, Error 8572: "We do not accept that the barcode which is from a third party."
- GS1 US: "a GS1 Company Prefix, GS1 US GTIN or GLN is for the sole use of the member to which it is licensed."
- GS1 US: identifiers can only be transferred from one company to another when your company’s ownership or business structure changes.

## If you already listed with resold codes

GS1 US says that a seller who cannot prove ownership should work with Amazon Selling Partner Support on moving the listing from the old GTIN to a new GS1-issued one. A single GS1 US GTIN is $30 with no renewal.

## Sources

- [Amazon Seller Central help: Error 8572 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GUBJ9DCQUDLG9YGQ)
- [Amazon Seller Central help: Valid UPCs (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GLE2KYT2UVPMTYGS)
- [GS1 US FAQ: Update prefix registration (identifier transfer, M&A, company name change) (read November 8, 2026)](https://www.gs1us.org/faqs/update-prefix-registration)
- [GS1 US: Barcodes for Amazon (read November 8, 2026)](https://www.gs1us.org/upcs-barcodes-prefixes/amazon/barcodes-for-amazon)
- [GS1 US: Get Authentic U.P.C. Barcodes (GS1 Company Prefix pricing) (read November 8, 2026)](https://www.gs1us.org/upcs-barcodes-prefixes/how-to-get-a-upc-barcode/get-upc-barcodes)

## Questions

### Will Amazon accept reseller UPCs?

Amazon's Error 8572 help: "We do not accept that the barcode which is from a third party." Its Valid UPCs page: obtain UPCs directly from GS1, not from third parties selling UPC licenses.

### Can a GS1 prefix be transferred to me?

GS1 US: "a GS1 Company Prefix, GS1 US GTIN or GLN is for the sole use of the member to which it is licensed." Transfers happen only when a company's ownership or structure changes (merger, acquisition, sale of a business line).

## Related

- [Resold UPCs: what to verify before you buy](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/vs/upcs-com-resold-barcodes/)
- [GS1 US cost: single GTINs or a prefix](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/gs1-barcode-cost/us/)
- [Letter of affiliation](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/letter-of-affiliation/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/reseller-upcs/  
Data as of: 2026-11-08
