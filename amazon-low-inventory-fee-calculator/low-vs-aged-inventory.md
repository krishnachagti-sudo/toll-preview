# Between too little and too old: the FBA stock safe zone

At 12 units a day the safe FBA stock is between 336 units (28 days of supply, under which Amazon charges the low-inventory-level fee) and 2,160 units (180 days: past that, units age into Amazon's aged-inventory storage rates from day 181), a room of 1,824 units.

## Your own safe zone

[Check this SKU](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/?date=2026-11-09&sku=MY-SKU&tier=small-standard&dos30=60&dos90=60&dailySales=12&onHand=900&prepDays=3&transitDays=6&receivingDays=7)

## Safe zone by daily sales

FBA units. First in, first out, steady sales. Worked out by the calculator.

| Daily sales | At least (28 days) | At most (180 days) | Room |
| --- | ---: | ---: | ---: |
| 1 | 28 | 180 | 152 |
| 2 | 56 | 360 | 304 |
| 5 | 140 | 900 | 760 |
| 10 | 280 | 1,800 | 1,520 |
| 20 | 560 | 3,600 | 3,040 |
| 50 | 1,400 | 9,000 | 7,600 |
| 100 | 2,800 | 18,000 | 15,200 |
| 250 | 7,000 | 45,000 | 38,000 |

## The two sides

- Too little: "We recommend that you track your trailing 28-day daily units shipped in FBA Inventory, multiply by 28, and maintain that many units on-hand before the inventory is assessed."
- Too old (to January 31, 2027): Aged Inventory Surcharge: Items aged 181-210 days $0.50 per cubic foot (excluding certain items).
- Too old (from February 1, 2027): Unified monthly storage fee: Age 0 - 180 days $0.78 per cubic foot (standard-size, off-peak); Age 181 - 210 days $2.78.

AWD auto-replenishment at 70% or more of a SKU also takes the youngest storage rate whatever the age, and waives the low-inventory fee, under Amazon's storage page.

## Sources

- [Amazon Seller Central help: Low-inventory-level fee 2027 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GFU8NTVGHP2JQLCR)
- [Amazon Seller Central help: Unified monthly storage fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GVZX6EAEL2KZ3SGA)

> The reorder plan assumes the steady daily sales you give it. Amazon does not publish which day of the week it checks inventory, so dates are to the day of your own plan.

## Questions

### When does inventory count as aged?

From day 181. Until February 1, 2027 Amazon's aged inventory surcharge starts at items aged 181-210 days; from February 1, 2027 the unified monthly storage fee has its own rate for age 181-210 days (standard-size off-peak: $2.78 a cubic foot, against $0.78 for 0-180 days).

### Why 180 days of sales?

Selling first in, first out at steady sales, a unit that arrives with more than 180 days of stock ahead of it will be older than 180 days when it sells.

## Related

- [How many units to send](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fba-restock/)
- [Q4 planning](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/guides/q4-inventory-balance/)
- [How to avoid the fee](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/how-to-avoid/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/low-vs-aged-inventory/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/low-vs-aged-inventory.csv
