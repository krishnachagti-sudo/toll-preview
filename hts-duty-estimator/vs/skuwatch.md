# SkuWatch vs this estimator

SkuWatch HTS Code Finder suggests US HTS codes inside Shopify admin from locally stored official tariff data, with a free plan (local matching and an Excel or CSV export of every variant) and paid plans for 100 or 1,000 AI classifications a month; it does not show duty by origin, which is what this estimator adds per SKU.

|  | SkuWatch | This estimator |
| --- | --- | --- |
| Where | Inside Shopify admin | Any CSV (Shopify, Etsy, other), REST and MCP |
| Codes | Suggestions from official data; optional AI | Checks codes exist; no suggestions |
| Duty by origin | Not listed | Every layer with its source |
| Price | Free plan; paid plans for AI classifications | One SKU, and the check of a product CSV for missing data, are free on the estimator's page. An estimate for a list of SKUs, or any estimate over the API or MCP, is $0.01 per SKU row for the first 2,000 rows in a month and $0.004 after that, at least $0.1 a call and at most $25 a month; rows we refuse are refunded at once. |
| Reviews on the listing | 0 (read November 8, 2026) | Not applicable |

## When SkuWatch is better

When you want code suggestions written into Shopify without leaving the admin.

> Estimate, not a customs ruling: U.S. Customs and Border Protection decides the classification, value, origin and duty at entry, and the importer is responsible for them. This is not legal or customs advice. Rates are from the USITC 2026 HTS Revision 22 (effective 10/30/2026) and the Federal Register actions read on 2026-11-08. A layer we have not read is refused, never guessed: Section 232, the section 338 duties on Canada, Russia, safeguards and quotas are not computed, and antidumping and countervailing duties are never included.

## Sources

- [Shopify App Store: SkuWatch HTS Code Finder (read November 8, 2026)](https://apps.shopify.com/skuwatch-hts-code-finder)

## Related

- [Shopify HS code checker](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/shopify-hs-code-checker/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/vs/skuwatch/  
Data as of: 2026-11-08
