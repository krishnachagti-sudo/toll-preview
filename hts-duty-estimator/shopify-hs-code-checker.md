# Shopify HS code checker

Shopify keeps HS Code and COO in its inventory CSV and the SKU, weight and cost in its product CSV, so upload both: in this 6-variant example the check finds 2 without a usable HTS code, 2 without a country of origin and 2 without a weight, and 2 complete.

- Variants: 6
- No HTS code: 2
- No origin: 2
- No weight: 2

Export the products (Products, Export) and the inventory (Inventory, Export), then upload both on the [estimator](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/) with "Exported from: Shopify". The check of missing data is free; the duty for every SKU is charged per row.

## What the check found in the example

| SKU | Title | Missing |
| --- | --- | --- |
| TEE-WHT-M | Cotton tee | complete |
| TEE-WHT-L | Cotton tee | HTS code (has a 6-digit HS code only) |
| CND-SOY-8 | Soy candle | country of origin |
| HAT-KNT-01 | Knit beanie | weight |
| BTL-STL-20 | Steel bottle | complete |
| GIFT-25 | Gift card | HTS code, country of origin, weight |

> Rows with a weight of 0 grams are counted as missing a weight; a gift card is a row like any other, so leave it out or ignore it.

## The columns Shopify uses

| Field | Shopify CSV | Column |
| --- | --- | --- |
| HS code | Inventory CSV | HS Code |
| Country of origin | Inventory CSV | COO (ISO country code) |
| SKU (to join the two) | Both | SKU |
| Weight | Product CSV | Weight value (grams) |
| Customs value | Product CSV | Cost per item (what the goods cost you), else Price |

- Shopify Help: HS codes are required for all international orders, and some countries, such as Switzerland, also need a product weight.
- Duties are calculated from each product's HS code and its country or region of origin, so add both before you collect duties at checkout.
- For a US import the HS code is the 10-digit HTS number; the first 6 digits alone are flagged.

> Estimate, not a customs ruling: U.S. Customs and Border Protection decides the classification, value, origin and duty at entry, and the importer is responsible for them. This is not legal or customs advice. Rates are from the USITC 2026 HTS Revision 22 (effective 10/30/2026) and the Federal Register actions read on 2026-11-08. A layer we have not read is refused, never guessed: Section 232, the section 338 duties on Canada, Russia, safeguards and quotas are not computed, and antidumping and countervailing duties are never included.

## Sources

- [Shopify Help: Inventory CSV (HS Code and COO columns) (read November 8, 2026)](https://help.shopify.com/en/manual/inventory-and-locations/setup/inventory-csv)
- [Shopify Help: Product CSV columns (read November 8, 2026)](https://help.shopify.com/en/manual/products/import-export/using-csv)
- [Shopify Help: Collecting duties and import taxes at checkout (read November 8, 2026)](https://help.shopify.com/en/manual/international/duties-and-import-taxes/charging-duties)
- [USITC: Harmonized Tariff Schedule, 2026 HTS Revision 22, effective 10/30/2026 (read November 8, 2026)](https://hts.usitc.gov/)

## Questions

### Where does Shopify keep the HS code?

In the inventory CSV, as the columns HS Code and COO (country of origin, as an ISO code); the product CSV has the SKU, the weight in grams and the cost per item.

### What does Shopify do without an HS code?

Shopify Help says it calculates duties from the product description and category instead, and that results without an HS code, description or category are likely to be inaccurate.

### Is a 6-digit HS code enough for the US?

A US entry uses the 10-digit HTS number; the checker flags a 6-digit code, such as 6109.10, as incomplete for US imports.

## Related

- [Duty on every SKU](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/)
- [Fix a product list: missing HTS, origin and weight](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/guides/product-data-audit/)
- [Etsy HS codes](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/etsy-hs-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/shopify-hs-code-checker/  
Data as of: 2026-11-08
