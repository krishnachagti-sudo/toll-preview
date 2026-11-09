# Low-inventory-level fee rates, 2026

Under Amazon's 2026 rule, which runs until January 31, 2027, the low-inventory-level fee is $0.32 to $2.09 a unit shipped, set by size tier, shipping weight and the larger of the 30- and 90-day historical days of supply; nothing is charged at 28 days or more, or unless both are under 28. Amazon's own example: a large standard item at 24 days pays $0.36.

## Look up one SKU

[Check this SKU](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/?date=2026-11-09&sku=MY-SKU&tier=large-standard&weightLb=0.5&dos30=24&dos90=18)

## Amazon's 2026 table

2026 size tier, from Amazon Seller Central help: Low-inventory-level fee, read November 8, 2026. Per unit shipped.

| Size tier | Shipping weight | 0 to under 14 days | 14 to under 21 days | 21 to under 28 days |
| --- | --- | ---: | ---: | ---: |
| Small standard | Up to 16 oz | $0.89 | $0.63 | $0.32 |
| Large standard | Up to 3 lb | $0.97 | $0.70 | $0.36 |
| Large standard | 3+ lb to 20 lb | $1.11 | $0.87 | $0.47 |
| Small Bulky | Up to 50 lb | $1.85 | $1.02 | $0.51 |
| Large Bulky | Up to 50 lb | $2.09 | $1.15 | $0.57 |

For small standard products the shipping weight is the unit weight; for large standard it is the greater of unit or dimensional weight. Extra-large tiers are not charged.

## Amazon's examples, worked by the calculator

| Example | Size tier | 30-day / 90-day | Days of supply | Fee a unit |
| --- | --- | --- | ---: | ---: |
| Example 1 | large-standard | 24.0 / 18.0 | 24.0 | $0.36 |
| Example 2 | small-standard | 20.0 / 40.0 | 40.0 | $0.00 |
| Example 3 | large-standard | 35.0 / 12.0 | 35.0 | $0.00 |
| Example 4 | large-bulky | 15.0 / 12.0 | 15.0 | $1.15 |

## Sources

- [Amazon Seller Central help: Low-inventory-level fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH)
- [Amazon Seller Central help: Product size tiers (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GG5KW835AHDJCH8W)

> An estimate from the rules and rates Amazon publishes in its Seller Central help (United States). What Amazon charges is in FBA Inventory, SKU Economics and Transaction View.

## Questions

### When does Amazon charge it?

Amazon's help: "We'll only charge a low-inventory-level fee when both the long-term historical days of supply (last 90 days) and short-term historical days of supply (last 30 days) are below 28 days (4 weeks)."

### Which products?

Amazon's help: "The low-inventory-level fee only applies to standard-sized and Small and Large Bulky products if the historical days of supply is less than 28 days." Extra-large products are not charged under the 2026 rule.

### Until when do these rates apply?

Amazon's table is headed "Until January 31, 2027". From February 1, 2027 the 2027 rule and table apply (same standard and bulky rates, oversize added).

## Related

- [Fee rates 2027](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fee-rates-2027/)
- [The fee in 2026, explained](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/guides/low-inventory-fee-2026-explained/)
- [Exemptions](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/exemptions/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fee-rates-2026/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fee-rates-2026.csv
