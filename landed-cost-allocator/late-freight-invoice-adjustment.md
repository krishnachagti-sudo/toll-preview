# A freight invoice came late: re-cost the units on hand

Split the late invoice over the shipment like any other, then put each SKU's on-hand part into its units on hand and book the rest as a COGS variance: here the $412.80 drayage bill adds $238.85 to the 1,540 units on hand and $173.95 to cost of goods sold, and a mug on hand goes from $3.8374 to $4.1226.

Shipment PO-1042 was received with its ocean freight, duty and broker invoices. Five weeks later the trucker's drayage invoice for $412.80 arrives (split by weight). By then 360 of the 600 mugs and 300 of the 400 candles have sold; no T-shirts have.

Drayage (late invoice): each line's share, cut between units on hand and units sold.

| SKU | On hand | Late share | To units on hand | To COGS | Unit cost before | On hand after | Cost per item |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| MUG-12 | 240 of 600 | $171.10 | $68.44 | $102.66 | $3.8374 | $4.1226 | 4.12 |
| TEE-M | 1,200 of 1,200 | $146.65 | $146.65 | $0.00 | $5.1997 | $5.3219 | 5.32 |
| CANDLE-8 | 100 of 400 | $95.05 | $23.76 | $71.29 | $6.0885 | $6.3261 | 6.33 |

Under this split, a unit on hand ends at the same cost it would have had if the invoice had come on time ($6.3261 a candle). The alternative, putting the whole late amount into what is left, loads the remaining 100 candles with the sold ones' share: **$7.0390** each. The allocator does either; your accountant picks the policy.

## Re-cost your own late invoice

[Open this late invoice in the allocator](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/?lines=MUG-12%2C+600%2C+2.10%2C+0.42%2C+0.0018%2C+240%7CTEE-M%2C+1200%2C+3.85%2C+0.18%2C+0.0009%2C+1200%7CCANDLE-8%2C+400%2C+4.40%2C+0.35%2C+0.0011%2C+100&charges=Ocean+freight%2C+freight%2C+1840.00%2C+volume%7CDuty+%28entry+summary%29%2C+duty%2C+1312.47%2C+value%7CCustoms+broker%2C+brokerage%2C+185.00%2C+equal%7CDrayage+%28late+invoice%29%2C+freight%2C+412.80%2C+weight%2C+late&ship=PO-1042)

## Why sold units stay as they were

Sold units have already gone through cost of goods sold at the cost known then. Rewriting them changes closed periods; a variance line keeps the trail. Merchants in the [Shopify Community thread](https://community.shopify.com/t/how-are-you-handling-landed-cost-per-unit-once-stocky-is-gone/661708) describe the same practice: leave the sold units, push the difference into the remaining stock and record the variance.

> The amounts are the worked shipment's, entered as a merchant would from its invoices; nothing here is a rate. Not tax, accounting or customs advice.

## Sources

- [Shopify Community: How are you handling landed cost per unit once Stocky is gone? (August 7, 2026)](https://community.shopify.com/t/how-are-you-handling-landed-cost-per-unit-once-stocky-is-gone/661708)
- [IRS Publication 538 (01/2022), Accounting Periods and Methods (page reviewed April 30, 2026, read November 8, 2026)](https://www.irs.gov/publications/p538)

## Steps

1. **Split the late invoice like any other.** By its basis over the shipment's lines, to the cent.
2. **Count what is left.** For each SKU, the units still on hand when the invoice is booked.
3. **Cut each line's share.** On-hand units take units on hand / units received of it; the rest belongs to units already sold.
4. **Re-cost the units on hand.** New unit cost = (cost before x units on hand + their part) / units on hand. Update Cost per item.
5. **Book the sold part.** As a cost of goods sold variance for the period, so sold units are never re-costed.

## Questions

### What do I do when the freight invoice arrives after the stock has sold?

Split it over the shipment's lines, add the part for units still on hand to their cost, and record the part for units already sold as a cost of goods sold variance. Your accountant decides the policy.

## Related

- [Landed cost per unit](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-calculate-landed-cost-per-unit/)
- [Update Shopify Cost per item](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/shopify-cost-per-item/)
- [QuickBooks landed cost](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/landed-cost-quickbooks/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/late-freight-invoice-adjustment/  
Data as of: 2026-11-08
