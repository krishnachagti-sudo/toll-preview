# Etsy HS codes for US shipping

Etsy's listing CSV has no HS code, country of origin or weight column, so all 4 listings in an export start incomplete; add columns named HS Code, COO and Weight (kg), and the check then reads them (in the example below, 4 of 4 become complete).

- Listings: 4
- Complete before: 0
- Complete after: 4

Download the listings CSV (Shop Manager, Settings, Options, Download Data), add the three columns, and upload it on the [estimator](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/) with "Exported from: Etsy".

## After adding the columns

| SKU | Title | HS Code | COO | Still missing |
| --- | --- | --- | --- | --- |
| CND-SOY-8 | Hand-poured soy candle | 3406.00.00 | US | complete |
| TT-LIN-01 | Linen tea towel | 6302.99.20 | PT | complete |
| HAT-KNT-02 | Knit beanie | 6505.00.30 | GB | complete |
| MUG-CER-12 | Ceramic mug | 6912.00.48 | CN | complete |

> Origin "US" is accepted by the check, but the estimator does not compute duty on US goods coming back (chapter 98).

## What to put in each column

- HS Code: the 10-digit US HTS number for imports to the US (for example 3406.00.00 for candles). The first 6 digits are the international HS code other countries use.
- COO: where the item was made, as a two-letter code (GB, PT, CN). Where you bought it does not decide it.
- Weight (kg): the net weight of one item.

> Estimate, not a customs ruling: U.S. Customs and Border Protection decides the classification, value, origin and duty at entry, and the importer is responsible for them. This is not legal or customs advice. Rates are from the USITC 2026 HTS Revision 22 (effective 10/30/2026) and the Federal Register actions read on 2026-11-08. A layer we have not read is refused, never guessed: Section 232, the section 338 duties on Canada, Russia, safeguards and quotas are not computed, and antidumping and countervailing duties are never included.

## Sources

- [Etsy Help: How to download your listing information (read November 8, 2026)](https://help.etsy.com/hc/en-us/articles/360000343508-How-to-Download-Your-Etsy-Data)
- [USITC: Harmonized Tariff Schedule, 2026 HTS Revision 22, effective 10/30/2026 (read November 8, 2026)](https://hts.usitc.gov/)
- [eCFR: 19 CFR 134.1, country of origin (read November 8, 2026)](https://www.ecfr.gov/current/title-19/chapter-I/part-134/subpart-A/section-134.1)

## Questions

### Does Etsy's listing CSV include HS codes?

No. Etsy Help lists the columns as title, description, price, currency code, quantity, tags, materials, image URLs and SKU.

### Is there an HTS code for "handmade"?

No HTS line is defined by being handmade; an item is classified by what it is and what it is made of.

## Related

- [Shopify HS code checker](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/shopify-hs-code-checker/)
- [HS codes after de minimis](https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/hs-codes-after-de-minimis/)
- [Find your HS code](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/guides/find-your-hs-code/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hts-duty-estimator/etsy-hs-codes/  
Data as of: 2026-11-08
