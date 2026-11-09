# Checking a whole list of UPCs

Verified by GS1's web search (where gepir.gs1.org now redirects) answers one code at a time, which is fine for one or two; for a whole list, look up one code per company prefix, then check the whole file against that prefix and name: the made-up 7-code file on the tool page finds 4 codes to fix and 2 to review in one pass.

## One by one or in a batch

|  | One-by-one GS1 lookup | Batch pre-check |
| --- | --- | --- |
| Gives the licensee | Yes, from GS1 | No: you give one name per prefix |
| 200 codes | 200 searches | One file |
| Typos and spreadsheet damage | A failed search | Named: check digit, scientific notation, lost zero |
| Codes from another prefix | You notice a different company | Flagged as outside your prefix |
| Brand vs licensee | By eye | Identical, or what differs |

## When one-by-one lookups are better

- One or two codes.
- Codes from many different companies (a reseller's or wholesaler's product list), where each needs its own licensee.
- When you need GS1's record itself as evidence.

## Start with one code

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=614141000012&brand=Harbor+%26+Pine&licensee=Harbor+%26+Pine+LLC&prefix=0614141)

## Sources

- [GS1: Verified by GS1 (read November 8, 2026)](https://www.gs1.org/services/verified-by-gs1)
- [GS1 US FAQ: GS1 Company Prefix, barcodes and identification (read November 8, 2026)](https://www.gs1us.org/faqs/gs1-company-prefix-barcodes-and-indentification)

> https://gepir.gs1.org answered with a 301 redirect to https://www.gs1.org/services/verified-by-gs1 (campaign vbg\_replaces\_gepir) on 2026-11-08.

## Steps

1. **Group the codes by prefix.** Codes from one GS1 Company Prefix share one licensee; codes from your own prefix all start with it.
2. **Look up one code per prefix.** Search one code per prefix in Verified by GS1 and note the company name, or read your certificate.
3. **Check the whole file.** Give the checker the file, your company prefix and that name: every code is checked for its digits, its prefix and the brand.
4. **Look up only the odd ones.** Codes outside your prefix are the ones whose licensee you need to look up one by one.

## Related

- [Verified by GS1](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/verified-by-gs1/)
- [Why Error 8572 comes back](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/error-8572-comes-back/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/vs/manual-gepir/  
Data as of: 2026-11-08
