# Amazon title examples, counted

Amazon's own example shortens a 99-character title to "Premium Stainless Steel Insulated Water Bottle – BPA-Free", 57 characters, and moves "Keeps drinks cold 24 hours, hot 12 hours. Ideal for gym, office, and outdoor adventures." (88) to Item Highlights; in the worked six-title file, 4 titles break a rule and 2 pass.

## Count your own

[Count it](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/?title=Premium+Stainless+Steel+Insulated+Water+Bottle+%E2%80%93+BPA-Free&brand=)

## Amazon's example

From Amazon's Engage post; the stated count is the one printed beside each text

|  | Text | Stated | Counted, spaces included |
| --- | --- | ---: | ---: |
| Before | Premium Stainless Steel Insulated Water Bottle – Keeps Drinks Cold 24 Hours, Hot 12 Hours, BPA-Free | 92 | 99 |
| After | Premium Stainless Steel Insulated Water Bottle – BPA-Free | 62 | 57 |
| Item Highlights | Keeps drinks cold 24 hours, hot 12 hours. Ideal for gym, office, and outdoor adventures. | 98 | 88 |

> The stated and counted numbers differ: count your own titles rather than relying on a printed number.

## Six worked titles

The worked flat file (made-up titles), checked by the engine

| SKU | Title | Characters | Verdict | Why |
| --- | --- | ---: | --- | --- |
| BTL-32 | Harbor & Pine Insulated Water Bottle 32 oz, Leakproof Lid, Keeps Drinks Cold 24 Hours | 85 | fix | 85 characters, 10 over the 75-character limit. |
| MUG-12 | Harbor & Pine Stoneware Coffee Mug 12 oz - Dishwasher Safe! | 59 | fix | Contains !, not allowed unless part of the brand name. |
| SET-03 | Harbor & Pine Glass Set, Glass Tumblers and Glass Coasters, 6 Pieces | 68 | fix | "glass" 3 times: no word more than twice. |
| KNF-08 | Chef Knife 8 Inch High Carbon Stainless Steel, Ergonomic Handle, Gift Box, by Harbor & Pine | 91 | fix | 91 characters, 16 over the 75-character limit. The brand "Harbor & Pine" ends at character 91, past 75: cutting the title to 75 loses it. |
| BRD-01 | Harbor & Pine Acacia Cutting Board with Juice Groove | 52 | ok | Nothing. |
| BK-101 | The Harbor & Pine Kitchen Book: 101 Recipes for Small Kitchens, Slow Weekends and Big Family Dinners | 100 (media) | ok | Nothing. |

## Sources

- [Amazon Seller Forums, Dougal\_Amazon: "Engage With Amazon: Get your Product Title Update Questions Answered!" (June 2, 2026; read November 8, 2026)](https://sellercentral.amazon.com/seller-forums/discussions/t/ac660707-60c7-43e3-a3fd-420d7321cc4e)
- [Amazon Seller Forums, News\_Amazon: "Updates to improve your product titles begin on July 27" (updated June 10, 2026; read November 8, 2026)](https://sellercentral.amazon.com/seller-forums/discussions/t/145b6d0f-999c-4555-896c-c694bda2e470)
- [Amazon Seller Forums, News\_Amazon: "New product title requirements effective January 21, 2025" (January 3, 2025; read November 8, 2026)](https://sellercentral.amazon.com/seller-forums/discussions/t/b2b15728-0d43-453e-974f-59eb63f73059)

> This checks titles against the rules Amazon published in its Seller Forums announcements on the dates shown: 75 characters including spaces outside media (July 27, 2026), the characters ! $ ? \_ { } ^ ¬ ¦ outside the brand name and no word more than twice (January 21, 2025). Amazon's help page and category style guides can add rules this check does not cover. The split is a mechanical cut at the last whole word that fits, not a rewrite. Not affiliated with Amazon.

## Related

- [How to shorten a title to 75](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/shorten-to-75/)
- [The 75-character limit](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/character-limit-2026/)
- [Checking every title in a file](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/guides/bulk-audit-titles/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/title-examples/  
Data as of: 2026-11-08
