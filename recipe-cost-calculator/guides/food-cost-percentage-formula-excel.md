# Food cost percentage formula in Excel

With the plate cost in B2 and the menu price in C2, =B2/C2 formatted as a percentage is the food cost: $4.20 on $14.00 gives 30.0%; =B2/0.3 is the price at a 30% target, $14.00.

## Check a number

[Work it out](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/?calc=food-cost&cost=4.20&price=14.00)

## The formulas

| What | Formula |
| --- | --- |
| Food cost % | `=B2/C2` |
| Price at a 30% target | `=B2/0.3` |
| Rounded up to the cent | `=ROUNDUP(B2/0.3,2)` |
| Rounded up to a quarter | `=CEILING(B2/0.3,0.25)` |
| Rounded up to .95 | `=CEILING(B2/0.3+0.05,1)-0.05` |
| Gross profit per plate | `=C2-B2` |

## Checked against the calculator

| Plate cost (B2) | Menu price (C2) | =B2/C2 | =B2/0.3 | .95 ending |
| --- | ---: | ---: | ---: | ---: |
| $4.20 | $14.00 | 30.0% | $14.00 | $14.95 |
| $6.00 | $19.00 | 31.6% | $20.00 | $20.95 |
| $3.79 | $12.50 | 30.3% | $12.64 | $12.95 |
| $1.68 | $12.00 | 14.0% | $5.60 | $5.95 |
| $0.21 | $0.75 | 28.0% | $0.70 | $0.95 |

A sheet with these formulas and one linked price list: the [Excel template](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/templates/excel/).

> Costs are only as current as the prices entered and only as true as the yields. A target food cost % is your choice; ranges such as 28% to 35% are rules of thumb, not a standard.

## Questions

### What is the Excel formula for food cost percentage?

With the plate cost in B2 and the menu price in C2: =B2/C2, formatted as a percentage.

### How do I round a menu price up to .95 in Excel?

=CEILING(B2/0.3+0.05,1)-0.05 gives the next price ending in .95 at or above the price at a 30% target.

## Related

- [Excel template with a linked price list](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/templates/excel/)
- [Food cost percentage calculator](https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/food-cost-percentage-calculator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/recipe-cost-calculator/guides/food-cost-percentage-formula-excel/  
Data as of: 2026-11-08
