# Historical days of supply

Historical days of supply is average daily units on hand divided by average daily units shipped: in Amazon's own example 220.5 / 12.6 = 17.5 days over 30 days and 243.6 / 5.8 = 42.0 over 90 days; FBA Inventory shows the larger, 42.0, so this product pays no low-inventory-level fee (the fee needs both under 28).

## Work out your own

[Check this SKU](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/?date=2026-11-09&sku=MY-SKU&tier=small-standard&weightLb=0.5&avgInventory30=220.5&unitsShipped30=378&avgInventory90=243.6&unitsShipped90=522)

## 30-day days of supply by stock and sales

Average units on hand a day (rows) against units shipped in the 30 days (columns). Under 28 is in the fee range if the 90-day figure is too.

| Average on hand | 60 shipped | 120 shipped | 240 shipped | 360 shipped | 600 shipped |
| --- | ---: | ---: | ---: | ---: | ---: |
| 60 | 30.0 | 15.0 | 7.5 | 5.0 | 3.0 |
| 120 | 60.0 | 30.0 | 15.0 | 10.0 | 6.0 |
| 240 | 120.0 | 60.0 | 30.0 | 20.0 | 12.0 |
| 480 | 240.0 | 120.0 | 60.0 | 40.0 | 24.0 |

## How a sale spike moves it

A spike raises the 30-day units shipped at once and the 90-day units a third as much, so the short-term figure falls fast and the long-term one slowly. Because the fee needs both under 28, the 90-day figure carries a product through a short promotion, which is Amazon's Prime Day example in its help.

## Check it weekly

Amazon's help: "The metric will be updated weekly, and the latest available historical days of supply will determine the fee rate for units shipped that week."

## Sources

- [Amazon Seller Central help: Low-inventory-level fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH)
- [Amazon Seller Central help: Low-inventory-level fee 2027 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GFU8NTVGHP2JQLCR)

> An estimate from the rules and rates Amazon publishes in its Seller Central help (United States). What Amazon charges is in FBA Inventory, SKU Economics and Transaction View.

## Questions

### What is historical days of supply on Amazon?

Amazon's help: "We'll use historical days of supply, which is calculated based on average daily inventory units on hand divided by average daily shipped units, over the long term (last 90 days) and short term (last 30 days)."

### Which of the two numbers counts?

Amazon's help: "We'll use the larger of the long and short term historical days to determine the fee tier." FBA Inventory shows that larger one.

### Is it per FNSKU or per parent?

Amazon's help (2026): "For each seller, we'll calculate the historical days of supply metric at the product FNSKU level, and we'll add the low-inventory-level fee to the FBA fulfillment fee for all shipped units of eligible products."

### What changes on February 1, 2027?

The 30- and 90-day averages are replaced by inventory at the weekly check against units shipped in the 28 days before and after it. Amazon's example: 100 units, 5 a day before (20 days) and 2 a day after (50 days): no fee. The calculator gives 20.0 and 50.0.

## Related

- [Fee rates 2026](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fee-rates-2026/)
- [The fee in 2026, explained](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/guides/low-inventory-fee-2026-explained/)
- [Per FNSKU or parent?](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/guides/per-fnsku-vs-parent/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/historical-days-of-supply/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/historical-days-of-supply.csv
