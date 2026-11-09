# Verified by GS1

Verified by GS1 is GS1's own lookup: it returns the company a barcode number (GTIN, UPC, EAN) is licensed to, which is the record Amazon checks UPCs against; gepir.gs1.org now redirects to it, the web search is for single lookups, and batch querying and API access are enterprise services.

## Compare what you found with your listing

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=614141000012&brand=Harbor+%26+Pine&licensee=)

## What it is

- "Verified by GS1 makes it easy to search, look up and verify information about any barcode number (GTIN, UPC, EAN), location (GLN), company or other GS1 key (SSCC)."
- "Enterprise-level capabilities are also available for retrieving data such as batch querying and API connection."
- https://gepir.gs1.org answered with a 301 redirect to https://www.gs1.org/services/verified-by-gs1 (campaign vbg\_replaces\_gepir) on 2026-11-08.

## What this site does with it

Nothing automatic. GS1's terms of use do not allow its information to be redistributed or commercialised without written approval, so this checker never fetches or stores GS1 records. You search Verified by GS1 yourself (or read your certificate) and give the checker the name; it checks the digits and prefix and compares the names.

## Why the name matters on Amazon

Amazon's Valid UPCs page: "We verify the authenticity of product UPCs by checking the GS1 database. UPCs that do not match the information provided by GS1 will be considered invalid." Its Error 8572 help asks for "the certificate issued by GS1 showing your legal entity and associated GTIN prefix, or the screenshot of GS1 website."

## Sources

- [GS1: Verified by GS1 (read November 8, 2026)](https://www.gs1.org/services/verified-by-gs1)
- [GS1: Terms of use (gs1.org) (read November 8, 2026)](https://www.gs1.org/terms-use)
- [GS1 US FAQ: GS1 Company Prefix, barcodes and identification (read November 8, 2026)](https://www.gs1us.org/faqs/gs1-company-prefix-barcodes-and-indentification)
- [Amazon Seller Central help: Error 8572 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GUBJ9DCQUDLG9YGQ)
- [Amazon Seller Central help: Valid UPCs (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GLE2KYT2UVPMTYGS)

## Steps

1. **Search the GTIN.** On gs1.org, Verified by GS1, search by Global Trade Item Number.
2. **Copy the company name.** Copy the company name exactly, with its legal form.
3. **Compare it with the brand.** Put the code, your Amazon brand value and that name into the checker; it says how the two differ.
4. **Keep a screenshot.** Amazon's Error 8572 help accepts the GS1 certificate or a screenshot of the GS1 website.

## Questions

### What is Verified by GS1?

GS1: "Verified by GS1 makes it easy to search, look up and verify information about any barcode number (GTIN, UPC, EAN), location (GLN), company or other GS1 key (SSCC)."

### Is GEPIR still available?

gepir.gs1.org redirected to Verified by GS1 when this page was checked (November 8, 2026). GS1 US's FAQ still calls the database GEPIR.

### Can I look up many codes at once?

GS1: "Enterprise-level capabilities are also available for retrieving data such as batch querying and API connection." GS1 US members can also search UPCs in GS1 US Data Hub \| Company.

## Related

- [GS1 Company Prefix lookup](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/gs1-prefix-lookup/)
- [Checking 200 UPCs: one by one or a batch](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/vs/manual-gepir/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/verified-by-gs1/  
Data as of: 2026-11-08
