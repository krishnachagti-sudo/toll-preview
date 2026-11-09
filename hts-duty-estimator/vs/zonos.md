# Zonos vs this estimator

Zonos Classify assigns HS and HTS codes with AI (its page offers a trial of up to 3 uses) and Zonos lists landed cost, checkout and brokerage products with pricing through its sales team; this estimator does not classify, and prices each SKU's known HTS code by origin, layer by layer, with a published per-row price.

|  | Zonos | This estimator |
| --- | --- | --- |
| Classification | AI engine; also from a photo or a product page URL; validates existing codes | None: you bring the code (the code checker validates it) |
| Duty | Landed cost and checkout products | Per SKU, every layer with its source and date; refuses what it has not verified |
| Price | Contact sales (no prices on its pricing page) | One SKU, and the check of a product CSV for missing data, are free on the estimator's page. An estimate for a list of SKUs, or any estimate over the API or MCP, is $0.01 per SKU row for the first 2,000 rows in a month and $0.004 after that, at least $0.1 a call and at most $25 a month; rows we refuse are refunded at once. |

## When Zonos is better

When you want codes assigned for you at scale, and duties collected at checkout automatically.

> Estimate, not a customs ruling: U.S. Customs and Border Protection decides the classification, value, origin and duty at entry, and the importer is responsible for them. This is not legal or customs advice. Rates are from the USITC 2026 HTS Revision 22 (effective 10/30/2026) and the Federal Register actions read on 2026-11-08. A layer we have not read is refused, never guessed: Section 232, the section 338 duties on Canada, Russia, safeguards and quotas are not computed, and antidumping and countervailing duties are never included.

## Sources

- [Zonos: Classify (read November 8, 2026)](https://zonos.com/classify)
- [Zonos: Contact sales (pricing) (read November 8, 2026)](https://zonos.com/pricing)

## Related

- [Shopify HS code checker](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/shopify-hs-code-checker/)
- [Find your HS code](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/guides/find-your-hs-code/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/vs/zonos/  
Data as of: 2026-11-08
