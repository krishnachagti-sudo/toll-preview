# What is landed cost?

Landed cost is the supplier price plus every cost of getting the goods to you, per unit: in this 3-SKU shipment a T-shirt bought at $3.85 lands at $5.1997 once its share of $3,337.47 in freight, duty and broker fees is added, 43.7% on top of the goods across the shipment.

## What goes into it

- The supplier price, less trade discounts
- Freight: ocean, air or truck, and drayage from the port
- Duty and other customs charges, from the entry summary
- The customs broker's fees
- Cargo insurance
- Other charges to acquire the goods, such as inspection

The IRS puts it this way for inventory: "For merchandise purchased during the year, cost means the invoice price minus appropriate discounts plus transportation or other charges incurred in acquiring the goods." (Publication 538). Outbound shipping to your customers is not part of it.

## A worked example

Shipment PO-1042: ocean freight by CBM, duty by value, the broker fee per line.

| SKU | Item | Units | Unit cost | Ocean freight (by volume (CBM)) | Duty (entry summary) (by value) | Customs broker (equally per line) | Landed per unit | Uplift |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| MUG-12 | Ceramic mug 12 oz | 600 | $2.10 | $764.31 | $216.45 | $61.67 | $3.8374 | 82.7% |
| TEE-M | Cotton T-shirt M | 1,200 | $3.85 | $764.31 | $793.67 | $61.67 | $5.1997 | 35.1% |
| CANDLE-8 | Soy candle 8 oz | 400 | $4.40 | $311.38 | $302.35 | $61.66 | $6.0885 | 38.4% |

## Try it with your numbers

[Open this shipment in the allocator](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/?lines=MUG-12%2C+600%2C+2.10%2C+0.42%2C+0.0018%7CTEE-M%2C+1200%2C+3.85%2C+0.18%2C+0.0009%7CCANDLE-8%2C+400%2C+4.40%2C+0.35%2C+0.0011&charges=Ocean+freight%2C+freight%2C+1840.00%2C+volume%7CDuty+%28entry+summary%29%2C+duty%2C+1312.47%2C+value%7CCustoms+broker%2C+brokerage%2C+185.00%2C+equal&ship=PO-1042)

Next: [landed cost per unit, step by step](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-calculate-landed-cost-per-unit/), and [which basis to split freight by](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-allocate-freight-to-inventory/).

> The amounts are the worked shipment's, entered as a merchant would from its invoices; nothing here is a rate. Not tax, accounting or customs advice.

## Sources

- [IRS Publication 538 (01/2022), Accounting Periods and Methods (page reviewed April 30, 2026, read November 8, 2026)](https://www.irs.gov/publications/p538)

## Questions

### What is landed cost per unit?

The supplier price of one unit plus its share of every cost of bringing the shipment in (freight, duty, brokerage, insurance, fees), less any discount.

### Is landed cost the same as COGS?

No. Landed cost is what each unit in inventory cost; cost of goods sold is that cost for the units sold in the period.

## Related

- [Landed cost per unit, step by step](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-calculate-landed-cost-per-unit/)
- [Allocate freight by CBM, weight or value](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-allocate-freight-to-inventory/)
- [Landed cost template for Excel](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/landed-cost-template-excel/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/what-is-landed-cost/  
Data as of: 2026-11-08
