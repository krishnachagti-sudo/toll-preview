# Who owns this UPC? Looking up a GS1 Company Prefix

Read a 12-digit UPC as a 13-digit number with a leading zero: 614141234561 has GS1 Prefix 061 (GS1 US), not 614; the GS1 Company Prefix inside it (and the company it is licensed to) is not written in the number, so look the code up in Verified by GS1 and compare that company name with the brand you list.

## Compare the licensee with your brand

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=614141234561&brand=&licensee=)

## GS1 Prefixes of some codes

Worked out by the checker. The licensee is not shown: that is GS1's record.

| Code | Format | GS1 Prefix | Range | Check digit |
| --- | --- | --- | --- | --- |
| 614141234561 | GTIN-12 (UPC-A) | 061 | GS1 US | valid |
| 036000291452 | GTIN-12 (UPC-A) | 003 | GS1 US | valid |
| 0012345678905 | GTIN-13 (EAN/JAN) | 001 | GS1 US | valid |
| 5012345678900 | GTIN-13 (EAN/JAN) | 501 | another GS1 Member Organisation (not looked up here) | valid |
| 4006381333931 | GTIN-13 (EAN/JAN) | 400 | another GS1 Member Organisation (not looked up here) | valid |
| 10614141000019 | GTIN-14 | 061 | GS1 US | valid |

## How many items a company prefix can number

A GTIN-12 has 11 digits before its check digit. GS1 US: the U.P.C. Company Prefix is the GS1 Company Prefix without its leading zero, so a longer prefix leaves fewer digits for items. 614141 inside 0614141000012 is a 7-digit GS1 Company Prefix with room for 100,000 items.

| U.P.C. Company Prefix digits | GS1 Company Prefix digits | Items it can number | GS1 US price |
| --- | --- | --- | --- |
| 10 | 11 | 10 | $250 + $50 a year |
| 9 | 10 | 100 | $750 + $150 a year |
| 8 | 9 | 1,000 | $2,500 + $500 a year |
| 7 | 8 | 10,000 | $6,500 + $1,300 a year |
| 6 | 7 | 100,000 | $10,500 + $2,100 a year |

## Special prefixes that never belong to a brand

- 0000000: restricted circulation numbers within a company
- 0000001-0000099: unused (kept clear of GTIN-8)
- 020-029: restricted circulation numbers within a geographic region
- 040-049: restricted circulation numbers within a company
- 050-059: GS1 US reserved for future use
- 200-299: restricted circulation numbers within a geographic region
- 950: GS1 Global Office
- 951: GS1 Global Office (General Manager Numbers for the EPC scheme)
- 952: demonstrations and examples of the GS1 system
- 960-969: GS1 Global Office, GTIN-8
- 977: serial publications (ISSN)
- 978-979: Bookland (ISBN)
- 980: refund receipts
- 981-983: GS1 coupon identification for common currency areas
- 99: GS1 coupon identification

> This site uses only these special-purpose ranges and GS1 US's ranges from GS1's list. GS1's terms of use do not allow its content to be redistributed without written approval, so other countries' prefixes are not listed or looked up here.

## Sources

- [GS1: GS1 Company Prefix (the GS1 Prefixes) (read November 8, 2026)](https://www.gs1.org/standards/id-keys/company-prefix)
- [GS1: Verified by GS1 (read November 8, 2026)](https://www.gs1.org/services/verified-by-gs1)
- [GS1 US FAQ: GS1 Company Prefix, barcodes and identification (read November 8, 2026)](https://www.gs1us.org/faqs/gs1-company-prefix-barcodes-and-indentification)
- [GS1 US: Get Authentic U.P.C. Barcodes (GS1 Company Prefix pricing) (read November 8, 2026)](https://www.gs1us.org/upcs-barcodes-prefixes/how-to-get-a-upc-barcode/get-upc-barcodes)
- [GS1: Terms of use (gs1.org) (read November 8, 2026)](https://www.gs1.org/terms-use)

## Steps

1. **Read the GS1 Prefix.** Write a 12-digit UPC with a leading zero; the first three digits are the GS1 Prefix. It names the GS1 office that issued the number, not the country the product comes from.
2. **Look up the licensee.** Search the GTIN in Verified by GS1 (gs1.org). gepir.gs1.org now redirects there. GS1 US members can also use GS1 US Data Hub \| Company.
3. **Copy the company name and prefix.** Note the company name and the GS1 Company Prefix exactly as shown, or read them from your own GS1 certificate.
4. **Compare with your listing.** Put the code, the brand you type into Amazon and that company name into the checker.

## Questions

### What is the GS1 Prefix of a 12-digit UPC?

GS1: "For 12-digit GTINs, and only 12-digit GTINs, there is an implied leading zero. For example, given the 12-digit GTIN 614141234561, the GS1 Prefix is 061, not 614."

### Does the GS1 Prefix tell me the country of origin?

No. GS1: "Since GS1 user companies can manufacture products anywhere in the world, GS1 Prefixes do not identify the country of origin for a given product."

### How long is a GS1 Company Prefix?

It varies, and the number alone does not say. GS1 US sells prefixes by capacity: a 10-item prefix leaves one digit for items, a 100,000-item prefix leaves five. The certificate or a Verified by GS1 search gives the exact prefix.

## Related

- [Verified by GS1](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/verified-by-gs1/)
- [GS1 lookup vs this pre-check](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/vs/gs1-us-lookup/)
- [Does the brand have to match the GS1 name?](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/brand-must-match-gs1-name/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/gs1-prefix-lookup/  
Data as of: 2026-11-08
