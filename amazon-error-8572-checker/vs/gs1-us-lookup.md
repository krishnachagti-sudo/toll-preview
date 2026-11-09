# GS1's lookup and this pre-check

GS1's Verified by GS1 is the authoritative record of who a barcode is licensed to, one search at a time; this pre-check takes that name (or your certificate's) and checks a whole file against it: check digits, the GS1 Prefix, your company prefix, and how your Amazon brand differs from the licensee name (for example "Harbor and Pine" vs "Harbor & Pine LLC": the same name apart from the legal form).

## Try one code

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=614141000012&brand=Harbor+and+Pine&licensee=Harbor+%26+Pine+LLC&prefix=0614141)

## Side by side

GS1's pages read November 8, 2026.

|  | Verified by GS1 | This pre-check |
| --- | --- | --- |
| Who the code is licensed to | Yes: GS1's own record | No: you give it the name |
| Check digit | GS1 has a separate free calculator | Yes, every row |
| Brand compared with the licensee | No | Yes: identical, or what differs |
| Inside your company prefix | Shows the prefix | Yes, against your certificate |
| A whole file | Enterprise batch querying and API (price not published) | Yes: CSV or an Amazon flat file |
| What Amazon asks you to send | No | Yes: the documents from Amazon's Error 8572 help |
| Price | Free web search | 1 code free on the web; files from $0.001 a code |

## When GS1 is better

- To find out who a code is actually licensed to: only GS1 has that record.
- To buy barcodes, or to change the company name GS1 US has on file (GS1 US reviews a legal name change after you amend it with the Secretary of State).
- For a screenshot of the GS1 website, which Amazon's Error 8572 help accepts in place of the certificate.

## When this pre-check helps

- Before uploading a product file, to catch typos, spreadsheet damage and codes from the wrong prefix in one pass.
- When the names look the same to you but are not identical: the checker names the difference.
- When you need the document list and a letter of affiliation in Amazon's format.

## Sources

- [GS1: Verified by GS1 (read November 8, 2026)](https://www.gs1.org/services/verified-by-gs1)
- [GS1: Check digit calculator (read November 8, 2026)](https://www.gs1.org/services/check-digit-calculator)
- [GS1 US FAQ: Update prefix registration (identifier transfer, M&A, company name change) (read November 8, 2026)](https://www.gs1us.org/faqs/update-prefix-registration)
- [Amazon Seller Central help: Error 8572 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GUBJ9DCQUDLG9YGQ)

> Every company name and code in the examples is made up; a code may happen to belong to a real company, and this page does not say who.

## Related

- [Verified by GS1](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/verified-by-gs1/)
- [Checking 200 UPCs](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/vs/manual-gepir/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/vs/gs1-us-lookup/  
Data as of: 2026-11-08
