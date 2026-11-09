# Checking every Amazon title in a file

Export the titles, paste or upload them, give the brand and media rows, run, then fix from the CSV: the worked 6-title file comes back with 4 to fix (2 over 75, 1 with a banned character, 1 with a word three times) and costs $0.012 to check.

## Run the audit

[Open the checker](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/?tab=file)

## What the fix list looks like

```csv
line,sku,title,characters,over by,verdict,problems,title cut to the limit,overflow (Item Highlights draft),overflow characters
2,BTL-32,"Harbor & Pine Insulated Water Bottle 32 oz, Leakproof Lid, Keeps Drinks Cold 24 Hours",85,10,fix,"85 characters, 10 over the 75-character limit.","Harbor & Pine Insulated Water Bottle 32 oz, Leakproof Lid, Keeps Drinks",Cold 24 Hours,13
3,MUG-12,Harbor & Pine Stoneware Coffee Mug 12 oz - Dishwasher Safe!,59,0,fix,"Contains !, not allowed unless part of the brand name.",,,
4,SET-03,"Harbor & Pine Glass Set, Glass Tumblers and Glass Coasters, 6 Pieces",68,0,fix,"""glass"" 3 times: no word more than twice.",,,
5,KNF-08,"Chef Knife 8 Inch High Carbon Stainless Steel, Ergonomic Handle, Gift Box, by Harbor & Pine",91,16,fix,"91 characters, 16 over the 75-character limit. The brand ""Harbor & Pine"" ends at character 91, past 75: cutting the title to 75 loses it.","Chef Knife 8 Inch High Carbon Stainless Steel, Ergonomic Handle, Gift Box",by Harbor & Pine,16
6,BRD-01,Harbor & Pine Acacia Cutting Board with Juice Groove,52,0,ok,,,,
7,BK-101,"The Harbor & Pine Kitchen Book: 101 Recipes for Small Kitchens, Slow Weekends and Big Family Dinners",100,0,ok,,,,
```

## Sources

- [Amazon Seller Forums, News\_Amazon: "Updates to improve your product titles begin on July 27" (updated June 10, 2026; read November 8, 2026)](https://sellercentral.amazon.com/seller-forums/discussions/t/145b6d0f-999c-4555-896c-c694bda2e470)
- [Amazon Seller Forums, News\_Amazon: "New product title requirements effective January 21, 2025" (read November 8, 2026)](https://sellercentral.amazon.com/seller-forums/discussions/t/b2b15728-0d43-453e-974f-59eb63f73059)

> This checks titles against the rules Amazon published in its Seller Forums announcements on the dates shown: 75 characters including spaces outside media (July 27, 2026), the characters ! $ ? \_ { } ^ ¬ ¦ outside the brand name and no word more than twice (January 21, 2025). Amazon's help page and category style guides can add rules this check does not cover. The split is a mechanical cut at the last whole word that fits, not a rewrite. Not affiliated with Amazon.

## Steps

1. **Export the titles.** Download your listings from Seller Central as a report or a flat file, or copy the title column from any spreadsheet.
2. **Paste or upload.** Open the checker's Many titles tab and paste the file or choose it. A header with a title column (title, item\_name, item-name) is read as a table with sku, brand\_name, media and item highlights columns; without a header, each line is a title.
3. **Give the brand and media rows.** A brand column (or one brand for all) lets banned characters inside the brand pass and warns when the brand falls past 75; mark books, music and video as media.
4. **Run it.** Each title gets its count, what to fix and, when over 75, the cut and the overflow for Item Highlights.
5. **Fix in order.** Download the fix list CSV and sort by verdict: "fix" titles break a published rule; "check" titles keep the rules but lose the brand in a cut.
6. **Update and re-check.** Edit the titles in Manage All Inventory or a flat file, then run the new export; nothing should be left to fix.

## Questions

### What does checking a file cost?

$0.002 per title for the first 5,000 titles in a month and $0.001 after, at most $4.99 a month; one title on the page is free. 500 titles cost $1.00; 10,000 titles in a month cost $4.99.

### How many titles in one file?

Up to 10,000 titles in one run; split a bigger file.

## Related

- [How to shorten a title to 75](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/shorten-to-75/)
- [Checker vs Excel LEN](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/vs/excel-len-formula/)
- [Amazon title examples, counted](https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/title-examples/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-title-checker/guides/bulk-audit-titles/  
Data as of: 2026-11-08
