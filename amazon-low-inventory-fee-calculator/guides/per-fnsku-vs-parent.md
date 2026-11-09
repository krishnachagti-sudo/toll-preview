# Per FNSKU or per parent ASIN?

Per FNSKU: Amazon's help says it calculates days of supply "at the product FNSKU level", so a fast blue mug with 300 units at 20 a day (15.0 days) pays $0.70 a unit while its slow red sibling (200 units at 2 a day) pays nothing; judged as one parent (500 units at 22 a day, 22.7 days) both would have paid $0.36.

## Check each variation

[Check this SKU](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/?date=2027-02-08&sku=MUG-BLUE&tier=large-standard&weightLb=1.2&inventory=300&avgDailyBefore=20&unitsLast7=140)

## The example both ways

2027 rule, steady sales (following = trailing). Worked out by the calculator.

| Judged as | Units | A day | Days of supply | Fee a unit |
| --- | --- | --- | ---: | ---: |
| MUG-BLUE (FNSKU) | 300 | 20 | 15.0 | $0.70 |
| MUG-RED (FNSKU) | 200 | 2 | 100.0 | $0.00 |
| Both as one parent | 500 | 22 | 22.7 | $0.36 |

The red mug also ships under 20 units a week, which is an exemption of its own: Days of supply 100.0 is at or above 28: the fee needs both windows under 28.

## How to plan for it

Plan each variation on its own sales: the fast colour needs its own 28-day line, and a slow colour cannot cover for it. Check the low-inventory-level fee column in FBA Inventory per FNSKU, and SKU Economics for what was charged.

## Sources

- [Amazon Seller Central help: Low-inventory-level fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH)
- [Amazon Seller Central help: Low-inventory-level fee 2027 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GFU8NTVGHP2JQLCR)
- [Amazon Seller Forums: Low-inventory-level fee further explained (Amazon staff post) (read November 8, 2026)](https://sellercentral.amazon.com/seller-forums/discussions/t/aa9f98e5-fa91-4949-af8f-6cf918c86a77)
- [SmartScout: calculator page (read November 8, 2026)](https://smartscout.com/amazon-low-inventory-calculator)

> An estimate from the rules and rates Amazon publishes in its Seller Central help (United States). What Amazon charges is in FBA Inventory, SKU Economics and Transaction View.

## Questions

### Is the low-inventory fee charged per SKU or per parent?

Per FNSKU. Amazon's 2026 help: "For each seller, we'll calculate the historical days of supply metric at the product FNSKU level, and we'll add the low-inventory-level fee to the FBA fulfillment fee for all shipped units of eligible products." The 2027 help: "We calculate days of supply at the product FNSKU level by comparing your inventory levels for any given week with your actual units shipped in the four weeks before the inventory check (trailing) and four weeks after (following)."

### Why do some sources say parent ASIN?

Amazon's own staff post on the Seller Forums that first explained the fee (shown as three years old) said: "The historical days of supply metric is calculated at the parent-product level." Some pages, SmartScout's calculator among them, still say so. Amazon's current help pages say FNSKU and do not give the date of the change, so this site does not give one either.

## Related

- [SmartScout compared](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/vs/smartscout/)
- [Historical days of supply](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/historical-days-of-supply/)
- [How to avoid the fee](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/how-to-avoid/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/guides/per-fnsku-vs-parent/  
Data as of: 2026-11-08
