# Seasonal and discontinued items

Winding down a product: under the 2026 rule a boot at 20.0 and 18.0 days pays $0.87 a unit while it still ships 20 or more a week, but from February 1, 2027 the same 100 units against 5 a day before and 2 a day after the check (Amazon's own sell-down case) pay $0.00, because the following 28 days show 50.0 days of supply; once it ships under 20 units a week it is exempt in both.

## Test your sell-down

[Check this SKU](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/?date=2027-02-08&sku=BOOT-W&tier=large-standard&weightLb=3.5&inventory=100&avgDailyBefore=5&avgDailyAfter=2&unitsLast7=35)

## The same product under both rules

- BOOT-W pays Amazon's low-inventory-level fee: days of supply 20.0 (30-day 20.0, 90-day 18.0), so $0.87 a unit for Large standard 3+ lb to 20 lb; to stop it, raise the 30-day days of supply to 28.
- BOOT-W does not pay the low-inventory-level fee: days of supply 50.0 is at or above 28: the fee needs both windows under 28. (trailing 20.0, following 50.0).
- BOOT-W is exempt from the low-inventory-level fee even though both windows are under 28 days (30-day 9.0, 90-day 16.0): 12 units in the past 7 days, under Amazon's 20.

## Last shipment timing

For a product you are dropping, the cheapest end is to let it sell through: once weekly shipments fall under 20 units the fee stops, and from February 1, 2027 a falling demand curve raises the following days of supply. Sending one more small shipment only pays when it keeps both windows at 28 or more for the weeks that still sell 20 or more.

## In Amazon's words

2027 rule: "We only apply the low-inventory level fee if your inventory levels are insufficient based on your actual shipped units in both the trailing and following 28-day periods. The fee rate is applied using the higher of the two days of supply metrics."

## Sources

- [Amazon Seller Central help: Low-inventory-level fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH)
- [Amazon Seller Central help: Low-inventory-level fee 2027 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GFU8NTVGHP2JQLCR)
- [Amazon: 2027 US Referral and Fulfillment by Amazon fees (read November 8, 2026)](https://amazon.com/selling-fee-changes)

> An estimate from the rules and rates Amazon publishes in its Seller Central help (United States). What Amazon charges is in FBA Inventory, SKU Economics and Transaction View.

## Questions

### Is there a waiver for Q4 seasonality?

Amazon lists no seasonal waiver. Its 2026 help shows a winter-boot example where 19 of 730 units a year were charged, about $0.01 per unit sold over the year; from February 1, 2027 the following 28 days are meant to cut fees on end-of-season and end-of-life products.

### How long am I charged if the item is listed but out of stock?

The fee is per unit shipped: with nothing shipping there is nothing to charge. With no shipments in a window the days of supply show as "--" and no fee applies.

## Related

- [Q4 planning](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/guides/q4-inventory-balance/)
- [Exemptions](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/exemptions/)
- [Low-inventory fee dates](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/low-inventory-fee-calendar-2027/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/guides/seasonal-and-discontinued-items/  
Data as of: 2026-11-08
