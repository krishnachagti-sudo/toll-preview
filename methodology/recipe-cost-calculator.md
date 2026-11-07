# How recipe costs are calculated: method and sources

Each ingredient's cost per gram, milliliter or piece is its pack price divided by its pack size and by its yield %. Each recipe line is converted into the pack's unit with NIST Handbook 44's exact factors (1 lb = 453.59237 g, 1 gal = 3785.411784 ml), and a portion costs the batch total divided by the portions. Food cost % is portion cost / menu price x 100, and the price that meets a target is portion cost / target, rounded up.

## What does the recipe cost calculator and menu re-coster compute?

From one price list (each ingredient with its pack size, unit, price and yield %), the tool costs every recipe and every sub-recipe used inside another. For each recipe it gives the batch and portion cost, the cost of each line, the food cost % against the menu price, the price that meets your target and a rounded suggested price. If the list carries last time's prices it also says how far each dish moved. The same engine answers single calculations (menu price, food cost %, pour cost, cake and bakery pricing, catering per guest, yield, unit conversion and actual food cost) and builds an Excel workbook with live formulas.

Operations (the op field):

- `recost`: Costs a whole menu: the price list as ingredients or priceListCsv, the recipes as recipes or recipesCsv, a target food cost % (default 30), a price ending and a drift threshold in points (default 1). The answer has a summary, a repricing list of dishes over target, the drift since the last prices, the ingredients that changed or are unused, every recipe with its lines, and a CSV.
- `workbook`: Costs the same menu as recost and returns it as an Excel workbook with four sheets (Menu, Lines, Prices, Settings) whose formulas read one price list, so one price edit updates every recipe.
- `template`: Returns the workbook built from the sample menu of 6 recipes. Free.
- `cost`: Costs one recipe (with any sub-recipes it uses) from a price list: the plate cost, the food cost % against its menu price and the price at the target.
- `menu-price`: The menu price for a plate cost at a target food cost %: cost / target, rounded up to the chosen ending, with the food cost % at that price and the gross profit.
- `food-cost`: Food cost % = cost / price x 100, with the gross profit and margin, and the price at a target if one is given.
- `pour`: Pour cost: the bottle's usable volume after any loss, divided by the pour, gives the pours a bottle; the bottle price over the pours, plus any mixer and garnish, is the cost per pour. With a drink price it gives the pour cost %, and with a target the price that meets it.
- `bake`: Cake and bakery pricing: ingredients, labor (hours x rate), overhead (a % of ingredients and labor plus a per-batch amount) and packaging per piece make the batch cost; the cost per piece divided by (1 - profit margin) is the price.
- `catering`: Catering per guest: each item's cost per portion times the portions per guest, summed, is the food cost a guest; that over the target, plus any extra per guest, is the price a guest. It also gives the portions to make of each item, rounded up.
- `yield`: Yield and edible portion cost: yield % = edible weight / as-purchased weight x 100, and the edible portion price = as-purchased price / yield.
- `convert`: Converts a quantity between units with NIST's exact factors; between volume and weight or count and weight only with grams per cup, grams each or a USDA household weight.
- `actual`: Actual food cost: beginning inventory + purchases - ending inventory is the cost of food sold, as a % of food sales; with an ideal % it gives the gap in points and dollars.
- `reference`: Returns the unit table from NIST Handbook 44 Appendix C and the 35 USDA household weights the tool uses, with their sources. Free.

Inputs:

- `ingredients or priceListCsv`: The price list: for each ingredient a name, pack size, pack unit and pack price, with optional yield % (default 100), previous pack price, grams per cup, grams each or a USDA weight. At most 2,000 ingredients; a CSV is found by its header names and holds at most 150,000 characters.
- `recipes or recipesCsv`: Each recipe: a name, portions (default 1), an optional menu price, what one batch makes (a weight or volume), an extra cost per portion, and up to 120 lines of item, quantity and unit. At most 500 recipes. In a CSV, rows with a blank recipe name belong to the recipe above.
- `units`: g, kg, oz, lb, ml, l, tsp, tbsp, fl oz, cup, pt, qt, gal, each, dozen, written in many common forms (pounds, fl. oz, tablespoons). A sub-recipe can also be used by portion or by batch. The single letters t and T are not read, since they mean teaspoon or tablespoon depending on who wrote the recipe.
- `targetPct, ending, driftPoints`: The target food cost %, above 0 and at most 100; the price ending, one of cent, quarter, half, whole, .95, .99 (default cent); and how many points a dish must move to be listed as drift.
- `single calculations`: Each takes its own figures, such as cost and targetPct for menu-price, bottle and pour sizes and prices for pour, or guests and items for catering.

Outputs:

- recipes: per recipe, the batch cost, portion cost, food cost %, price at target, suggested price, status (on target, over target or no menu price), the cost change and points moved, and each line's cost and share
- summary: recipes, priced, over target, the average food cost % and how many moved more than the threshold
- reprice and drift: the dishes to reprice and the dishes that moved
- csv: one row per recipe, with formula-like cells written as text
- file: for workbook and template, the .xlsx file

## How is it calculated, step by step?

1. Each ingredient is read: a name used once, a pack unit among g, kg, oz, lb, ml, l, tsp, tbsp, fl oz, cup, pt, qt, gal, each, dozen, a pack size above 0, a price of 0 or more and a yield % above 0 and at most 100.
2. Its edible portion cost per gram, milliliter or piece is the pack price divided by the pack size in that base unit and by the yield (pack price / base quantity / (yield % / 100)). With a previous price the same is worked out for the old price.
3. Each recipe line is either an ingredient or another recipe. An ingredient line is converted into the dimension of its pack: within weight, volume or count by NIST's exact factors; from volume to weight with the grams per cup or the USDA household weight given for it; from a count to weight with grams each or a USDA count weight such as a large egg. Without that weight the line is refused, naming what to add.
4. A sub-recipe line counts portions: by portion, by batch (times its portions), or by weight or volume against what one batch makes. Sub-recipes may nest up to 12 deep, and a circle of sub-recipes is refused, naming it.
5. The batch cost is the sum of the lines plus the extra cost per portion times the portions, and the portion cost is the batch cost divided by the portions.
6. The food cost % is the portion cost / menu price x 100. The price at target is the portion cost / target, and the suggested price is that rounded up, never down, to whole cents and then to the chosen ending. A dish is over target when its food cost % is above the target.
7. When the price list has previous prices, each dish's points moved is its food cost % now less its food cost % at the old prices; dishes that moved more than the threshold are listed, with the ingredients whose price changed and where they are used.
8. Costs are kept at full precision and rounded only for output: costs to 4 decimals, prices to cents and percentages to 1 decimal.

**NIST Handbook 44 (2026), Appendix C.**

Every factor is exact: 1 lb = 453.59237 g, 1 oz = 28.349523125 g, 1 gal = 231 cubic inches = 3785.411784 ml, 1 fl oz = 1/128 gal = 29.5735295625 ml, 1 cup = 8 fl oz, 1 tbsp = 1/2 fl oz and 1 tsp = 1/3 tbsp. A dozen is 12 pieces.

**USDA FoodData Central, SR Legacy.**

The 35 household weights (such as a cup of all-purpose flour or a large egg) are the gram weights USDA lists for that measure. They are averages: packing, sifting and brand change them, so your own grams per cup or grams each are used first.

**Costing formulas.**

Yield % = edible weight / as-purchased weight x 100, and edible portion cost = as-purchased cost / yield, as the LibreTexts chapter on recipe and menu costing sets out. Food cost % = cost / price x 100, and the price at a target = cost / target.

**Our own rules.**

A suggested price is always rounded up, since a price rounded down would land above the target food cost. The target food cost % is your choice; the tool sets no standard range.

## Which edge cases does it handle?

- A price change ripples through a sub-recipe into every dish that uses it, and a dish that does not use it keeps its cost.
- With no previous prices, no drift is claimed.
- The same name on the price list twice, or as both a recipe and an ingredient, is refused.
- A sub-recipe used by weight or volume needs what one batch makes, in the same dimension.
- Rounding up to .95 or .99 moves to the next dollar only when the price is already past that ending, and floating point never pushes a whole-cent price up a cent.
- A pour larger than the bottle, an edible weight above the as-purchased weight, and an ending inventory above the beginning inventory plus purchases are each refused.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A six-recipe menu with two sauces after butter, cream and salmon went up, against a 30% target**

```json
op: "recost"
targetPct: 30
ingredients: 13 items
recipes: 6 items
```

A six-recipe menu with two sauces after butter, cream and salmon went up, against a 30% target

| Result | Value |
| --- | --- |
| recipes, priced, over target | 6, 4, 2 |
| average food cost | 29.3% |
| Lemon butter sauce | $0.60 a portion |
| Alfredo sauce | $1.01 a portion |
| Pan-seared salmon | $6.09 a portion, 32.1% of $19.00, over target |
| Spaghetti Alfredo | $3.18 a portion, 26.5% of $12.00, on target |
| Lemon chicken plate | $3.79 a portion, 30.3% of $12.50, over target |
| Shortbread cookies | $0.21 a portion, 28.1% of $0.75, on target |
| to reprice | Pan-seared salmon to $20.31; Lemon chicken plate to $12.63 |
| moved more than 1 point | Pan-seared salmon (5 points); Shortbread cookies (4.4 points) |

**Menu price for a $6.00 plate at a 30% food cost, rounded to .95**

```json
{
  "op": "menu-price",
  "cost": 6,
  "targetPct": 30,
  "ending": ".95"
}
```

Menu price for a $6.00 plate at a 30% food cost, rounded to .95

| Result | Value |
| --- | --- |
| exact price | $20.00 |
| price | $20.95 |
| food cost at that price | 28.6% |
| gross profit | $14.95 |

**Pour cost of a 1.5 oz pour from a $28, 750 ml bottle sold at $9**

```json
{
  "op": "pour",
  "bottleSize": 750,
  "bottleUnit": "ml",
  "bottlePrice": 28,
  "pourSize": 1.5,
  "pourUnit": "fl oz",
  "drinkPrice": 9,
  "targetPct": 20
}
```

Pour cost of a 1.5 oz pour from a $28, 750 ml bottle sold at $9

| Result | Value |
| --- | --- |
| bottle | 25.3605 fl oz |
| pours a bottle | 16.9 |
| cost per pour | $1.66 |
| pour cost | 18.4% |
| price at 20% | $8.28 |

**Edible portion cost of salmon at $11 per pound with a 64% yield**

```json
{
  "op": "yield",
  "yieldPct": 64,
  "apPrice": 11,
  "unit": "lb"
}
```

Edible portion cost of salmon at $11 per pound with a 64% yield

| Result | Value |
| --- | --- |
| yield | 64.0% |
| edible portion price | $17.19 per lb |

## What does it not do?

- Costs are only as current as the prices entered and only as true as the yields given.
- A menu re-cost counts ingredients and any extra cost per portion; labor and overhead enter only the cake and bakery calculation.
- USDA household weights are averages; for exact costs, weigh your own and give grams per cup or grams each.
- It reads no supplier price feeds or inventory systems: the price list is what you give it.

## Where does the data come from, and how fresh is it?

The unit factors are NIST Handbook 44 (2026 edition), Appendix C, read on 2026-11-08. The household weights are USDA FoodData Central's SR Legacy release (April 2018), read on 2026-11-08. Both are read once when the server starts and change only with a deploy. Prices are yours and are used as given at the moment of the call.

- [NIST Handbook 44 (2026 edition), Appendix C: General Tables of Units of Measurement (read 2026-11-08)](https://www.nist.gov/document/2026-nist-handbook-44-appendix-c)
- [USDA FoodData Central, SR Legacy (April 2018), food\_portion.csv (read 2026-11-08)](https://fdc.nal.usda.gov/download-datasets)
- [Recipe and Menu Costing, Introduction to Food Production and Service (Beth Egan, LibreTexts, CC BY 4.0)](https://workforce.libretexts.org/Bookshelves/Food_Production_Service_and_Culinary_Arts/Introduction_to_Food_Production_and_Service_%28Egan%29/02%3A_Menus_and_Recipes/2.04%3A_Recipe_and_Menu_Costing)

[All sources, editions and read dates](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The NIST factors are checked to be exact against each other and the USDA weights against the published figures. Unit aliases and conversions, the sample menu with its sub-recipes, yields and USDA cups, a price change rippling through a sub-recipe, refused input, rounding up to each ending, every single calculation, CSV reading and writing, and the workbook's sheets and formulas are each tested, and the worked examples equal run().

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) list what each test suite asserts.

[Open the Recipe cost calculator and menu re-coster tool](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/).

## Questions

### Is there any AI in the recipe cost calculator and menu re-coster answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the recipe cost calculator and menu re-coster refuse to answer?

Costs are only as current as the prices entered and only as true as the yields given. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Recipe cost calculator and menu re-coster tool](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Food cost percentage calculator](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/food-cost-percentage-calculator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/recipe-cost-calculator/  
Data as of: 2026-11-04
