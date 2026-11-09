# Error 8572 on the next product

When one product lists and the next hits Error 8572, the second code usually differs: it comes from another company prefix, the brand is typed differently, it was issued by GS1 less than 72 hours ago, or it repeats a GTIN; in this made-up four-row file the checker passes 1, and flags LAMP-02, LAMP-03, LAMP-04.

## Check the code that failed

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=614142000011&brand=Harbor+%26+Pine&licensee=Harbor+%26+Pine&prefix=0614141)

## Four rows, one file

| SKU | Code | Verdict | Why |
| --- | --- | --- | --- |
| LAMP-01 | 614141000067 | pass | Nothing found. |
| LAMP-02 | 614142000011 | fail | The code does not start with your company prefix 0614141, so GS1's record for it names whoever licensed that number, not you. |
| LAMP-03 | 614141000074 | review | The brand "Harbor&Pine" and the GS1 licensee "Harbor & Pine" are not identical: spacing between words. |
| LAMP-04 | 614141000067 | review | The same GTIN as line 1. |

## Other causes the file cannot show

- New codes: Amazon recommends at least 72 hours after buying them from GS1.
- An expired exemption: "Amazon may expire previous GTIN exemptions toward brands that initially didn’t have GTINs, but have since acquired GS1 barcodes."
- A lapsed GS1 US prefix: the company no longer appears in the GS1 company database.
- A brand that is not yet approved on Amazon, which shows as other error codes (5664, 5665, 5668, 5461).

## Prevention

- Keep the brand value in one cell of the template and copy it, never retype it.
- Assign each product and variation its own GTIN from your prefix.
- Run every new batch through the checker before upload.
- Renew your GS1 prefix on time.

## Sources

- [Amazon Seller Central help: Error 8572 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GUBJ9DCQUDLG9YGQ)
- [Amazon Seller Central help: List products that do not have a product ID (UPC, EAN, JAN, or ISBN) (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200426310)
- [Amazon Seller Central help: Amazon Brand Name policy (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G2N3GKE5SGSHWYRZ)
- [GS1 US FAQ: GS1 Company Prefix, barcodes and identification (read November 8, 2026)](https://www.gs1us.org/faqs/gs1-company-prefix-barcodes-and-indentification)

> Every company name and code in the examples is made up; a code may happen to belong to a real company, and this page does not say who.

## Related

- [Checking 200 UPCs](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/vs/manual-gepir/)
- [Fix Error 8572 step by step](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/fix-error-8572-step-by-step/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/error-8572-comes-back/  
Data as of: 2026-11-08
