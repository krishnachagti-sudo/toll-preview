# The low-inventory-level fee in 2026, explained

Through January 31, 2027 Amazon charges the low-inventory-level fee on every unit shipped while both the 30-day and the 90-day historical days of supply of an FNSKU are under 28, at the band of the larger one: in Amazon's first example (large-standard, 30-day 24, 90-day 18) that is $0.36 on top of a $3.95 fulfillment fee, $4.31 a unit.

## Test your SKU

[Check this SKU](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/?date=2026-11-09&sku=MY-SKU&tier=large-standard&weightLb=0.5&dos30=24&dos90=18&unitsLast7=60)

## The trigger

- "We'll only charge a low-inventory-level fee when both the long-term historical days of supply (last 90 days) and short-term historical days of supply (last 30 days) are below 28 days (4 weeks)."
- "We'll use the larger of the long and short term historical days to determine the fee tier."
- "For each seller, we'll calculate the historical days of supply metric at the product FNSKU level, and we'll add the low-inventory-level fee to the FBA fulfillment fee for all shipped units of eligible products."
- "The low-inventory-level fee only applies to standard-sized and Small and Large Bulky products if the historical days of supply is less than 28 days."

## Amazon's four examples, worked by the calculator

| Example | Size tier | 30-day | 90-day | Status | Fee a unit | Fulfillment + fee |
| --- | --- | --- | --- | --- | ---: | ---: |
| Example 1 | large-standard | 24 | 18 | fee | $0.36 | $4.31 |
| Example 2 | small-standard | 20 | 40 | no-fee | $0.00 | $3.54 |
| Example 3 | large-standard | 35 | 12 | no-fee | $0.00 | $5.92 |
| Example 4 | large-bulky | 15 | 12 | fee | $1.15 | $12.40 |

## What it costs

The 2026 table runs from $0.32 (small standard at 21 to 28 days) to $2.09 (large bulky under 14 days) a unit; the full table is on the 2026 rates page.

## Where to check

FBA Inventory shows the historical days of supply and an estimated fee per unit sold; SKU Economics and Transaction View show what was charged.

## Sources

- [Amazon Seller Central help: Low-inventory-level fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH)

> An estimate from the rules and rates Amazon publishes in its Seller Central help (United States). What Amazon charges is in FBA Inventory, SKU Economics and Transaction View.

## Questions

### What is Amazon's low inventory level fee?

A per-unit charge added to the FBA fulfillment fee of standard-size and bulky products whose days of supply are under 28. Amazon's help: "We'll only charge a low-inventory-level fee when both the long-term historical days of supply (last 90 days) and short-term historical days of supply (last 30 days) are below 28 days (4 weeks)."

### When is it charged?

Amazon's help, time of charge: "The time when the customer’s order is shipped." The metric will be updated weekly, and the latest available historical days of supply will determine the fee rate for units shipped that week.

### Does seller-fulfilled stock count?

Amazon's help: "No. The historical days of supply metric only considers FBA inventory stored in our fulfillment network."

## Related

- [Fee rates 2026](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fee-rates-2026/)
- [Historical days of supply](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/historical-days-of-supply/)
- [Fee rates 2027](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fee-rates-2027/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/guides/low-inventory-fee-2026-explained/  
Data as of: 2026-11-08
