# How Amazon Error 8572 codes are checked: GS1 rules

Each code is read as digits, must be 12, 13 or 14 long, must have the right GS1 check digit (weights 3 and 1 from the right), must sit in a GS1 Prefix used for trade items and inside the company prefix you give, and the brand you list is compared with the GS1 licensee name in 6 levels, from identical to different names. A file holds at most 5,000 codes.

## How does it work?

1. Rows are read from the list or the CSV. The CSV's separator is the one of comma, semicolon or tab most used in the heading line. Headings are matched with case, underscores and dots ignored (gtin, upc, ean, barcode or external\_product\_id for the code; brand\_name; gs1 licensee or legal entity; company prefix; sku).
2. Each cell is read: spaces, hyphens and a leading apostrophe are removed and a trailing .0 is dropped with a review note.
3. The length must be 12 (UPC), 13 (EAN or JAN) or 14 (GTIN-14), the lengths Amazon's help lists.
4. The check digit is worked out by GS1's method: from the right, the digits are multiplied alternately by 3 and 1, added, and the check digit is what is left from the sum to the nearest equal or higher multiple of ten.
5. The GS1 Prefix is read from the 13-digit form (a 12-digit code has an implied leading zero; a GTIN-14 drops its indicator digit), by the longest match among 20 ranges.

> Steps 6 to 10, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/amazon-error-8572-checker/#what) below.

## What does it not cover?

- It does not look up GS1 records: it compares the licensee name and company prefix you give it, from your GS1 certificate or your own Verified by GS1 search, with the brand you list.
- Amazon decides which listings it accepts and does not publish how it matches names, so a pass here is not Amazon's approval.
- Prefixes of GS1 Member Organisations outside the US are not looked up or named.
- Amazon rules are from Amazon's Seller Central help for the United States. Not legal advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 17 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Amazon's help pages, gs1.org and gs1us.org were read on 2026-11-08. Each page is checked once a day for changes, and the rules change only by hand, with the tests that pin them. This checker does not look up GS1 records. It compares the licensee name and company prefix you give it (from your GS1 certificate or your own Verified by GS1 search) with the brand you list.
- [Tested: 4 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check GS1's own check digit example (sum 57, check digit 3) and every wrong last digit, reading cells with spaces, apostrophes, decimals and scientific notation, lengths and the lost zero, every special GS1 Prefix range and the implied zero, company prefixes in both forms, each level of the name comparison, verdicts and duplicates, CSV headings and defaults, the documents by role, the letter's five components and refusals, and the exact cheapest GS1 US mix.

- [Amazon Seller Central help: Error 8572](https://sellercentral.amazon.com/help/hub/reference/external/GUBJ9DCQUDLG9YGQ), see the document, read 2026-11-08
- [Amazon Seller Central help: Valid UPCs](https://sellercentral.amazon.com/help/hub/reference/external/GLE2KYT2UVPMTYGS), see the document, read 2026-11-08
- [Amazon Seller Central help: Find your product ID (GTIN)](https://sellercentral.amazon.com/help/hub/reference/external/G200211450), see the document, read 2026-11-08
- [Amazon Seller Central help: List products that do not have a product ID (UPC, EAN, JAN, or ISBN)](https://sellercentral.amazon.com/help/hub/reference/external/G200426310), see the document, read 2026-11-08
- [Amazon Seller Central help: Product ID (GTIN) requirements by category](https://sellercentral.amazon.com/help/hub/reference/external/G200317520), see the document, read 2026-11-08
- [Amazon Seller Central help: Guidelines for UPC and GTIN](https://sellercentral.amazon.com/help/hub/reference/external/G5JQC6VY6BVYWDPT), see the document, read 2026-11-08
- [Amazon Seller Central help: Amazon Brand Name policy](https://sellercentral.amazon.com/help/hub/reference/external/G2N3GKE5SGSHWYRZ), see the document, read 2026-11-08
- [GS1: How to calculate a check digit manually](https://www.gs1.org/how-calculate-check-digit-manually), see the document, read 2026-11-08
- [GS1: Check digit calculator](https://www.gs1.org/services/check-digit-calculator), see the document, read 2026-11-08
- [GS1: GS1 Company Prefix (the GS1 Prefixes)](https://www.gs1.org/standards/id-keys/company-prefix), see the document, read 2026-11-08
- [GS1: Verified by GS1](https://www.gs1.org/services/verified-by-gs1), see the document, read 2026-11-08
- [GS1: Terms of use (gs1.org)](https://www.gs1.org/terms-use), see the document, read 2026-11-08
- [GS1 US: Get Authentic U.P.C. Barcodes (GS1 Company Prefix pricing)](https://www.gs1us.org/upcs-barcodes-prefixes/how-to-get-a-upc-barcode/get-upc-barcodes), see the document, read 2026-11-08
- [GS1 US: Barcodes for Amazon](https://www.gs1us.org/upcs-barcodes-prefixes/amazon/barcodes-for-amazon), see the document, read 2026-11-08
- [GS1 US FAQ: GS1 Company Prefix, barcodes and identification](https://www.gs1us.org/faqs/gs1-company-prefix-barcodes-and-indentification), see the document, read 2026-11-08
- [GS1 US FAQ: Update prefix registration (identifier transfer, M&A, company name change)](https://www.gs1us.org/faqs/update-prefix-registration), see the document, read 2026-11-08
- [GS1 US: What is a GS1 Company Prefix?](https://www.gs1us.org/upcs-barcodes-prefixes/what-is-a-prefix), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the amazon error 8572 checker compute?

Given codes as rows or a CSV (such as an Amazon flat file), each with the brand you list and the GS1 licensee name and company prefix from your GS1 certificate, the tool says which codes will likely hit Error 8572 or another product ID error and why, which to review, and the fix for each, with the documents Amazon's Error 8572 help asks for by your role and a fix list CSV. It also writes a letter of affiliation built to the five components Amazon's help checks, and finds the cheapest mix of GS1 US single GTINs and prefixes for a number of products and years. It does not look up GS1 records.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `check`: Checks one or more codes. The answer has the headline, a summary (pass, review and fail counts and the issues by count), each code's result (its format, 14-digit form, check digit, GS1 Prefix and what it is used for, company prefix, brand against licensee, findings with a fix and a verdict), the documents Amazon asks for, a fix list CSV and the columns used.
- `letter`: Writes a letter of affiliation from the GS1 licensee for a brand and a list of GTINs, with how it meets each of Amazon's five components, the formats Amazon accepts and the documents to attach.
- `cost`: Finds the cheapest GS1 US way to give a number of products a GTIN over a number of years, with every single-size option for comparison. Free.
- `rules`: Returns the Amazon and GS1 rules the tool applies with the dated sources and the disclaimers. Free.

Inputs:

- `rows or csv`: For check, one of the two: rows of { gtin, brand, licensee, manufacturer, companyPrefix, sku } (at most 5,000), or CSV text of at most 1,500,000 characters with comma, semicolon or tab. Each value at most 300 characters.
- `columns, defaults`: For check: names the CSV heading for a field when it is not recognized, and fills a blank brand, licensee, manufacturer or companyPrefix on every row.
- `role`: For check: brand-owner, not-brand-owner, third-party-licensing (default brand-owner), which picks the documents Amazon asks for.
- `licensee, brand, gtins, relationship`: For letter: the company on the GS1 certificate, the brand on the products, 1 to 200 GTINs, and how the brand and the licensee are related (needed when the two names differ).
- `companyPrefix, seller, issuer, date`: For letter, optional except issuer and date: the GS1 Company Prefix (4 to 12 digits), a seller authorized to list, the issuer's name with an email or phone, and the letter's date as YYYY-MM-DD.
- `items, years`: For cost: 1 to 200,000 products and 1 to 30 years.

Outputs:

- answer: one line for one code, or the counts to fix, to review and with nothing that points to Error 8572
- results: per code, the line, sku, format, gtin14, checkDigit (given, expected, valid), gs1Prefix and prefixClass, companyPrefix, brandVsLicensee, findings (severity, code, text, fix) and verdict
- documents: what Amazon's Error 8572 help asks for from every seller and for your role, the wait for new codes and the third-party rule
- fixCsv: one row per code with its verdict, findings and fixes
- letter: text, gtins, the five component checks, formats and documents to attach; cost: best, options, tiers and a note

**Every step in full (10) and the rules**

1. Rows are read from the list or the CSV. The CSV's separator is the one of comma, semicolon or tab most used in the heading line. Headings are matched with case, underscores and dots ignored (gtin, upc, ean, barcode or external\_product\_id for the code; brand\_name; gs1 licensee or legal entity; company prefix; sku). A file with no barcode column is refused. Defaults fill blank cells.
2. Each cell is read: spaces, hyphens and a leading apostrophe are removed and a trailing .0 is dropped with a review note. A number in scientific notation (6.14141E+11), a 10-character ISBN ending in X, and anything with letters fail, since the digits are lost or it is not a GTIN.
3. The length must be 12 (UPC), 13 (EAN or JAN) or 14 (GTIN-14), the lengths Amazon's help lists. 11 digits fail as a lost leading zero, and the answer says whether the code with the zero back has a valid check digit; 8 digits fail with advice to list the 12-digit UPC-A.
4. The check digit is worked out by GS1's method: from the right, the digits are multiplied alternately by 3 and 1, added, and the check digit is what is left from the sum to the nearest equal or higher multiple of ten. A wrong check digit fails.
5. The GS1 Prefix is read from the 13-digit form (a 12-digit code has an implied leading zero; a GTIN-14 drops its indicator digit), by the longest match among 20 ranges. Restricted circulation numbers, coupons, refund receipts, demonstrations, unused, reserved and GS1 Global Office numbers, and ISSN, fail; 978 and 979 (ISBN) are flagged for review; any other prefix is a GS1 Member Organisation that is not looked up. A GTIN-14 with an indicator other than 0 is flagged as a case level.
6. A company prefix you give (4 to 12 digits) is matched as written or with a leading zero added (a U.P.C. Company Prefix is the GS1 one without its zero, per GS1 US). A code outside it fails. The prefix's room for codes is 10 to the power of 12 minus its length.
7. The same GTIN twice in a file (compared in its 14-digit form) is flagged for review.
8. The brand is compared with the GS1 licensee name: identical; the same letters in other capitals or spacing; the same words with other punctuation (& and "and" count as the same word); the same apart from a legal form such as LLC, Inc or GmbH; one name inside the other with extra words; or different names. Different names fail; the levels between are flagged for review with what differs. A missing licensee or brand asks for it. ISBNs are not compared.
9. A brand with extra spaces, a trademark symbol or an underscore is flagged, from Amazon's brand formatting rules.
10. A code fails if any finding fails, is for review if any finding is for review, and passes otherwise.

**Amazon.**

Error 8572 means the product ID does not match the brand or product; Amazon's help says the barcode must belong to the brand and that UPCs are checked against the GS1 database. Newly issued codes should wait at least 72 hours before listing.

The letter is built to the 5 components Amazon's help checks: issued by the brand or parent brand on their letterhead (preferably with logo); clearly calls out the brand and the gtin owner as on gs1; clearly mentions the affiliation; includes the issuer's name and contact information; signed by the brand representative, or carries the brand seal. The GTINs must each have 12, 13 or 14 digits and a valid check digit before they go in the letter, and repeats are written once.

**GS1 US prices.**

The cost planner uses the GS1 US prices read on 2026-11-08: one GTIN $30 with no renewal, and prefixes of 10 items $250 then $50 a year, 100 items $750 then $150 a year, 1,000 items $2,500 then $500 a year, 10,000 items $6,500 then $1,300 a year, 100,000 items $10,500 then $2,100 a year. The total is the initial fees plus one renewal for each year after the first, and the cheapest mix of single GTINs and prefixes is found exactly.

## Which edge cases does it handle?

**The edge cases (7)**

- A code a spreadsheet turned into 6.14141E+11 fails: the last digits are gone and must be copied again from the label or the GS1 record.
- An 11-digit code fails as a lost leading zero; when 0 plus the code has a valid check digit, the fix names that 12-digit code.
- A 12-digit code beginning 614 has GS1 Prefix 061, not 614, because of the implied leading zero.
- A company prefix given as 614141 or 0614141 is the same prefix.
- Harbor & Pine against Harbor & Pine LLC is the same name apart from the legal form: for review, with Amazon's proof of the link between brand and legal entity named in the fix.
- A letter for a brand whose name differs from the licensee's needs the relationship stated, and the issuer's email or phone.
- A formula-looking cell in the fix list CSV is written as text, so a spreadsheet does not run it.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A seven-code upload file checked against the brand's own GS1 prefix**

A seven-code upload file checked against the brand's own GS1 prefix

| Result | Value |
| --- | --- |
| answer | 7 codes checked: 4 to fix before upload, 2 to review, 1 with nothing that points to Error 8572. |
| MUG-01 (614141000012) | review: name-legal-form |
| MUG-02 (614141000029) | review: name-legal-form |
| MUG-03 (614141000036) | fail: name-different |
| BOWL-01 (6.14141E+11) | fail: scientific |
| BOWL-02 (614142000004) | fail: not-your-prefix, name-legal-form |
| BOWL-03 (614141000047) | fail: check-digit, name-legal-form |
| BOWL-04 (614141000050) | pass: no findings |

**The input**

```json
{
  "op": "check",
  "csv": "sku,external_product_id,brand_name,gs1 licensee\r\nMUG-01,614141000012,Harbor & Pine,Harbor & Pine LLC\r\nMUG-02,614141000029,Harbor and Pine,Harbor & Pine LLC\r\nMUG-03,614141000036,HarborPine Home,Harbor & Pine LLC\r\nBOWL-01,6.14141E+11,Harbor & Pine,Harbor & Pine LLC\r\nBOWL-02,614142000004,Harbor & Pine,Harbor & Pine LLC\r\nBOWL-03,614141000047,Harbor & Pine,Harbor & Pine LLC\r\nBOWL-04,614141000050,Harbor & Pine,Harbor & Pine",
  "defaults": {
    "companyPrefix": "0614141"
  },
  "role": "brand-owner"
}
```

**More worked examples (2)**

**One UPC: the brand typed in Amazon against the company on the GS1 certificate**

One UPC: the brand typed in Amazon against the company on the GS1 certificate

| Result | Value |
| --- | --- |
| answer | 614141000012: check digit valid; GS1 Prefix 061 (GS1 US); inside your company prefix 0614141; brand "Harbor & Pine" vs GS1 licensee "Harbor & Pine LLC": the same name apart from the legal form. Verdict: check the points below before you list. |
| check digit | 2, expected 2 |
| company prefix | 0614141, room for 100,000 codes |

**The input**

```json
{
  "op": "check",
  "rows": [
    {
      "gtin": "614141000012",
      "brand": "Harbor & Pine",
      "licensee": "Harbor & Pine LLC",
      "companyPrefix": "614141"
    }
  ]
}
```

**GS1 US: the cheapest way to barcode 12 products for one year**

GS1 US: the cheapest way to barcode 12 products for one year

| Result | Value |
| --- | --- |
| answer | For 12 products over 1 year, 12 single GTINs cost $360; the cheapest GS1 US option is 10-item prefix + 2 single GTINs at $310 up front + $50 a year after the first = $310. |
| 12 single GTINs | $360 |
| 2 x 10-item prefix | $500 |
| 100-item prefix | $750 |
| 1,000-item prefix | $2,500 |
| 10,000-item prefix | $6,500 |
| 100,000-item prefix | $10,500 |

**The input**

```json
{
  "op": "cost",
  "items": 12,
  "years": 1
}
```

## How is it tested?

**What its test suite asserts (4)**

- GS1's own check digit example (629104150021: sum 57, check digit 3) and every wrong last digit are checked.
- Spreadsheet damage (scientific notation, the lost leading zero, decimals), every special GS1 Prefix range with the implied zero, and company prefixes in GS1 and U.P.C. form are checked.
- Each level of the brand against licensee comparison, verdicts, duplicates, CSV headings, the documents by role and the letter's five components are checked.
- The GS1 US cost planner gives the exact cheapest mix of single GTINs and prefixes for fixed cases, with renewals after the first year.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Amazon Error 8572 checker tool](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/).

## Questions

### Is there any AI in the amazon error 8572 checker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the amazon error 8572 checker refuse to answer?

It does not look up GS1 records: it compares the licensee name and company prefix you give it, from your GS1 certificate or your own Verified by GS1 search, with the brand you list. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Amazon Error 8572 checker tool](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/amazon-error-8572-checker/  
Data as of: 2026-11-04
