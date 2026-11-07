# Recipe cost calculator Excel template

Download a free workbook whose 6 sample recipes all read one price list of 13 ingredients through 24 formula lines, so one price edit updates every recipe; with the sample prices 2 of its 4 menu items miss a 30% target.

- Recipes: 6
- Ingredients: 13
- Formula lines: 24

## Get the template

[Open the download](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/?template=1)

## Four sheets

- **Prices**: ingredient, pack size, pack unit, pack price, yield %, and the usable cost per gram, milliliter or piece.
- **Lines**: one row per recipe line; the cost is looked up on Prices by name, or on Menu for a sub-recipe.
- **Menu**: each recipe's batch cost, cost per portion, food cost %, and the price at your target.
- **Settings**: the target food cost % and the NIST unit factors the amounts use.

## The formulas

| Cell | Formula | What it does |
| --- | --- | --- |
| Prices!F2 | `=B2*453.59237` | The pack in base units (grams here: 1 lb is 453.59237 g exactly, NIST). |
| Prices!H2 | `=D2/F2/E2` | Usable cost per gram: pack price / pack in grams / yield. |
| Lines!G2 | `=INDEX(Prices!$H:$H,MATCH(B2,Prices!$A:$A,0))` | Looks the line's item up on the price list by name. |
| Lines!H2 | `=E2*G2` | Line cost: the amount in base units x the cost per base unit. |
| Menu!C2 | `=SUMIFS(Lines!$H:$H,Lines!$A:$A,A2)` | The recipe's batch cost: every line with its name. |
| Menu!E2 | `=C2/B2+D2` | Cost per portion, plus any extra per portion. |
| Menu!G2 | `=IF(F2="","",E2/F2)` | Food cost %. |
| Menu!I2 | `=E2/H2` | Price at the target food cost (target in Settings!B1). |

Sub-recipes work the same way: a sauce is a row on Menu, and a dish that uses it looks up its cost per portion there. Paste your own recipes into the [calculator](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/) and it writes this workbook from them, with every amount converted for you.

> Costs are only as current as the prices entered and only as true as the yields. A target food cost % is your choice; ranges such as 28% to 35% are rules of thumb, not a standard.

## Sources

- [NIST Handbook 44 (2026), Appendix C: General Tables of Units of Measurement (read 2026-11-08)](https://www.nist.gov/document/2026-nist-handbook-44-appendix-c)
- [USDA FoodData Central, SR Legacy household weights (read 2026-11-08)](https://fdc.nal.usda.gov/download-datasets)

## Steps

1. **Download it.** Open the calculator and choose "Download the sample workbook". It is free.
2. **Type your prices.** On the Prices sheet, put each ingredient's pack size, unit, price and yield.
3. **Write your recipes.** On the Lines sheet, one row per ingredient: recipe, item, quantity and the amount in base units. Or paste your recipes into the calculator and download your own workbook, worked out for you.
4. **Change a price.** Edit any price on the Prices sheet: every line, sub-recipe and menu item that uses it re-costs.

## Questions

### Is the Excel template free?

Yes. The sample workbook is free to download. A workbook built from your own price list and recipes is $0.25.

### Does it need macros?

No. It uses only INDEX, MATCH, SUMIFS and IF, so it opens in Excel, Google Sheets, Numbers and LibreOffice.

## Related

- [Google Sheets version](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/templates/google-sheets/)
- [Printable recipe cost card](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/templates/recipe-cost-card/)
- [Food cost percentage formula in Excel](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/guides/food-cost-percentage-formula-excel/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/templates/excel/  
Data as of: 2026-11-08
