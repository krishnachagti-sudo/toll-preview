# Your own spreadsheet vs this calculator

A spreadsheet is better for your own cost data, but it is easy to get the fee wrong at the edges: a SKU with 279.6 units on hand on average and 300 shipped in 30 days shows 28.0 days rounded, yet is charged ($0.32 a unit) because the exact figure is under 28; this calculator compares exact fractions and switches rules on February 1, 2027.

## Check the edge case

[Check this SKU](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/?date=2026-11-09&sku=EDGE&tier=small-standard&weightLb=0.5&avgInventory30=279.6&unitsShipped30=300&avgInventory90=279.6&unitsShipped90=900)

## Where spreadsheets slip

- Rounding before the test: 27.96 shown as 28.0 is still under 28.
- One window instead of both: the fee needs both under 28, and the band uses the larger.
- Divide by zero: no shipments in a window means no fee, not an error.
- Rates by hand: the 2027 table adds oversize rows and the rule changes on February 1, 2027.
- Exemptions forgotten: under 20 units in 7 days, New Selection, AWD, new sellers, grocery.

## When a spreadsheet is better

When the plan has to sit with your own landed costs, cash flow, supplier minimums and carton sizes, or when you want to change the logic yourself. Google Sheets and Excel do that well, and the template on this site gives you the columns to start.

## When this calculator is better

When you want Amazon's current rules applied the same way every week, for many SKUs, with the sources dated, or from code.

## Sources

- [Amazon Seller Central help: Low-inventory-level fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH)
- [Amazon Seller Central help: Low-inventory-level fee 2027 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GFU8NTVGHP2JQLCR)

> An estimate from the rules and rates Amazon publishes in its Seller Central help (United States). What Amazon charges is in FBA Inventory, SKU Economics and Transaction View.

## Related

- [The spreadsheet template](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/reorder-point-spreadsheet/)
- [EcomCalcTools compared](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/vs/ecomcalctools/)
- [Fee rates 2027](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fee-rates-2027/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/vs/spreadsheet-reorder-model/  
Data as of: 2026-11-08
