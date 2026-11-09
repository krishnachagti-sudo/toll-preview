# Fix a product list: HTS, origin, weight

Of your 6 product rows, 1 has no valid HTS code, 1 no country of origin and 0 no weight; 4 are complete. After the fix, the estimate gives 3 rows a duty ($2.27 in all) and refuses 1 it cannot compute.

## The example rows

| SKU | Title | Missing | Duty |
| --- | --- | --- | --- |
| TEE-WHT-M | Cotton T-shirt | complete | $1.86 |
| CND-SOY-8 | Soy candle 8 oz | complete | $0.41 |
| MUG-CER-12 | Ceramic mug | HTS code | - |
| HAT-KNT-01 | Knit beanie | country of origin | - |
| BTL-STL-20 | Steel water bottle | complete | refused |
| BK-PRNT-01 | Printed book | complete | $0.00 |

Run it on your own file on the [estimator](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/). One SKU, and the check of a product CSV for missing data, are free on the estimator's page. An estimate for a list of SKUs, or any estimate over the API or MCP, is $0.01 per SKU row for the first 2,000 rows in a month and $0.004 after that, at least $0.1 a call and at most $25 a month; rows we refuse are refunded at once.

> Estimate, not a customs ruling: U.S. Customs and Border Protection decides the classification, value, origin and duty at entry, and the importer is responsible for them. This is not legal or customs advice. Rates are from the USITC 2026 HTS Revision 22 (effective 10/30/2026) and the Federal Register actions read on 2026-11-08. A layer we have not read is refused, never guessed: Section 232, the section 338 duties on Canada, Russia, safeguards and quotas are not computed, and antidumping and countervailing duties are never included.

## Sources

- [USITC: Harmonized Tariff Schedule, 2026 HTS Revision 22, effective 10/30/2026 (read November 8, 2026)](https://hts.usitc.gov/)
- [Shopify Help: Inventory CSV (HS Code and COO columns) (read November 8, 2026)](https://help.shopify.com/en/manual/inventory-and-locations/setup/inventory-csv)
- [Etsy Help: How to download your listing information (read November 8, 2026)](https://help.etsy.com/hc/en-us/articles/360000343508-How-to-Download-Your-Etsy-Data)

## Steps

1. **Export the products.** Download the product CSV from your store (Shopify: products and inventory; Etsy: the listings CSV).
2. **Find the blanks.** Run the free check: every row missing an HTS code, a country of origin, a weight or a value is listed.
3. **Fix the best sellers first.** Sort the missing rows by sales or value; a wrong code on a fast seller costs the most.
4. **Classify.** Find each 10-digit HTS number from what the item is and what it is made of, and write down why.
5. **Estimate the duty.** Run the estimate on the complete rows: each SKU gets its base rate and every additional layer for its origin.
6. **Import back.** Put the codes and origins back into the store (Shopify: the inventory CSV columns HS Code and COO).

## Related

- [Shopify HS code checker](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/shopify-hs-code-checker/)
- [Etsy HS codes](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/etsy-hs-codes/)
- [Find your HS code](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/guides/find-your-hs-code/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/guides/product-data-audit/  
Data as of: 2026-11-08
