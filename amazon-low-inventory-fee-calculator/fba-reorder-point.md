# FBA reorder point, with the 28-day fee line

Reorder point = daily sales 12 x lead time 16 days (3 prep + 6 transit + 7 receiving days) + the 28-day line 12 x 28 = 528 units of FBA stock; send when you are there, and the shipment lands before stock falls under 28 days of supply, the level at which Amazon's low-inventory-level fee starts.

## Your own reorder point

[Work out the dates](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/?date=2026-11-09&sku=MY-SKU&tier=small-standard&dos30=60&dos90=60&dailySales=12&onHand=900&prepDays=3&transitDays=6&receivingDays=7)

## Reorder points by daily sales and lead time

FBA units at which to send, no safety stock. Worked out by the calculator.

| Daily sales | 14-day lead | 21-day lead | 30-day lead | 45-day lead | 60-day lead |
| --- | ---: | ---: | ---: | ---: | ---: |
| 2 | 84 | 98 | 116 | 146 | 176 |
| 5 | 210 | 245 | 290 | 365 | 440 |
| 10 | 420 | 490 | 580 | 730 | 880 |
| 20 | 840 | 980 | 1,160 | 1,460 | 1,760 |
| 50 | 2,100 | 2,450 | 2,900 | 3,650 | 4,400 |
| 100 | 4,200 | 4,900 | 5,800 | 7,300 | 8,800 |

## The formula

```
reorder point = daily sales x lead time + daily sales x 28 + safety stock
```

The first part sells while the shipment is on its way. The second keeps days of supply at 28 when it lands: under Amazon's 2027 rule days of supply are inventory at the weekly check divided by daily units shipped, so stock of 28 x daily sales is exactly the line. A free reorder point calculator that leaves the 28 days out (InventoryHero's example: 30 a day, 45 days, 200 units of safety stock, 1,550 units) would land the shipment at about 7 days of supply; with the line it is 2,190 plus the safety stock.

## Send-by date from the reorder point

With 900 units on hand at 12 a day, stock reaches the reorder point on December 11, 2026: that is the send-by date, and the shipment is in by December 27, 2026. Add 30 supplier days and the purchase order is due November 11, 2026.

## Sources

- [Amazon Seller Central help: Low-inventory-level fee 2027 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GFU8NTVGHP2JQLCR)
- [Amazon Seller Central help: Low-inventory-level fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH)
- [Amazon Seller Central help: FBA inventory overview (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GTMXYZN64UJL7TT6)

> The reorder plan assumes the steady daily sales you give it. Amazon does not publish which day of the week it checks inventory, so dates are to the day of your own plan.

## Questions

### What is the reorder point formula for FBA?

Daily sales x total lead time (prep, transit and Amazon receiving) + the stock you never want to go under. To stay clear of Amazon's low-inventory-level fee that floor is 28 days of sales: at 12 a day, 12 x 16 + 12 x 28 = 528 units.

### Why add 28 days of sales?

Amazon's help: "We recommend that you track your trailing 28-day daily units shipped in FBA Inventory, multiply by 28, and maintain that many units on-hand before the inventory is assessed." A shipment that arrives when stock is at 28 days keeps the fee off.

### What lead time should I use?

Everything between deciding to send and the units being sellable: your prep, the carrier's transit and Amazon's receiving. Amazon's FBA Inventory page calls the part from creating a shipment to its receipt "Total lead time". Add your supplier's days to get the date to order.

## Related

- [How many units to send](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fba-restock/)
- [Historical days of supply](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/historical-days-of-supply/)
- [How to avoid the fee](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/how-to-avoid/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fba-reorder-point/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/fba-reorder-point.csv
