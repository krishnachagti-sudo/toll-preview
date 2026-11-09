# How much extra freight can splitting cost?

Splitting into Amazon-optimized locations is cheaper whenever its extra freight is less than the placement fee it saves: for 1,000 large standard units at 1.5+ lb to 3 lb that is $340.00 to $600.00, and the table below gives it for every row of Amazon's table.

## Run this shipment in the calculator

[Compare the options](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/?units=1000&tier=large-standard&weight=2&min=420&opt=690)

## The most extra freight, by row and shipment size

Minimal-split fee saved (Amazon's range) = the most extra freight splitting can add

| Size tier and weight | 100 units | 500 units | 1,000 units | 5,000 units |
| --- | ---: | ---: | ---: | ---: |
| Small standard, 8 oz or less | $14.00 to $32.00 | $70.00 to $160.00 | $140.00 to $320.00 | $700.00 to $1,600.00 |
| Small standard, 8+ oz to 16 oz | $16.00 to $32.00 | $80.00 to $160.00 | $160.00 to $320.00 | $800.00 to $1,600.00 |
| Large standard, 12 oz or less | $20.00 to $40.00 | $100.00 to $200.00 | $200.00 to $400.00 | $1,000.00 to $2,000.00 |
| Large standard, 12+ oz to 1.5 lb | $24.00 to $50.00 | $120.00 to $250.00 | $240.00 to $500.00 | $1,200.00 to $2,500.00 |
| Large standard, 1.5+ lb to 3 lb | $34.00 to $60.00 | $170.00 to $300.00 | $340.00 to $600.00 | $1,700.00 to $3,000.00 |
| Large standard, 3+ lb to 5 lb | $38.00 to $76.00 | $190.00 to $380.00 | $380.00 to $760.00 | $1,900.00 to $3,800.00 |
| Large standard, 5+ lb to 7 lb | $40.00 to $98.00 | $200.00 to $490.00 | $400.00 to $980.00 | $2,000.00 to $4,900.00 |
| Large standard, 7+ lb to 10 lb | $42.00 to $120.00 | $210.00 to $600.00 | $420.00 to $1,200.00 | $2,100.00 to $6,000.00 |
| Large standard, 10+ lb to 15 lb | $44.00 to $150.00 | $220.00 to $750.00 | $440.00 to $1,500.00 | $2,200.00 to $7,500.00 |
| Large standard, 15+ lb to 20 lb | $55.00 to $190.00 | $275.00 to $950.00 | $550.00 to $1,900.00 | $2,750.00 to $9,500.00 |
| Small/Medium Bulky, 5 lb or less | $110.00 to $160.00 | $550.00 to $800.00 | $1,100.00 to $1,600.00 | $5,500.00 to $8,000.00 |
| Small/Medium Bulky, 5+ lb to 12 lb | $175.00 to $240.00 | $875.00 to $1,200.00 | $1,750.00 to $2,400.00 | $8,750.00 to $12,000.00 |
| Small/Medium Bulky, 12+ lb to 28 lb | $274.00 to $350.00 | $1,370.00 to $1,750.00 | $2,740.00 to $3,500.00 | $13,700.00 to $17,500.00 |
| Small/Medium Bulky, 28+ lb to 42 lb | $395.00 to $495.00 | $1,975.00 to $2,475.00 | $3,950.00 to $4,950.00 | $19,750.00 to $24,750.00 |
| Small/Medium Bulky, 42+ lb to 50 lb | $480.00 to $595.00 | $2,400.00 to $2,975.00 | $4,800.00 to $5,950.00 | $24,000.00 to $29,750.00 |
| Large/Extra Large Bulky, 5 lb or less | $130.00 to $180.00 | $650.00 to $900.00 | $1,300.00 to $1,800.00 | $6,500.00 to $9,000.00 |
| Large/Extra Large Bulky, 5+ lb to 12 lb | $210.00 to $290.00 | $1,050.00 to $1,450.00 | $2,100.00 to $2,900.00 | $10,500.00 to $14,500.00 |
| Large/Extra Large Bulky, 12+ lb to 28 lb | $340.00 to $410.00 | $1,700.00 to $2,050.00 | $3,400.00 to $4,100.00 | $17,000.00 to $20,500.00 |
| Large/Extra Large Bulky, 28+ lb to 42 lb | $470.00 to $560.00 | $2,350.00 to $2,800.00 | $4,700.00 to $5,600.00 | $23,500.00 to $28,000.00 |
| Large/Extra Large Bulky, 42+ lb to 50 lb | $550.00 to $650.00 | $2,750.00 to $3,250.00 | $5,500.00 to $6,500.00 | $27,500.00 to $32,500.00 |

## The formula

```
extra freight = freight to the five or more locations - freight to one location
split when: extra freight < units x placement fee per unit
```

- Per destination: divide the extra freight by the extra locations to see what each one may cost.
- Partial splits (Bulky): compare their reduced fee plus freight to two or three locations in the same way ($0.55 to $1.10 a unit for small/medium bulky at 5 lb or less).
- Time and prep are costs too: put them in the calculator's other costs.
- Amazon publishes ranges; with the fee Send to Amazon shows, the answer is exact.

## Sources

- [Amazon: FBA inbound placement service fee (United States, read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GC3Q44PBK8BXQW3Z)

> Not affiliated with Amazon. Fee ranges are Amazon's US Seller Central table, read November 8, 2026; the fee Send to Amazon shows for your plan is the one charged. Freight figures in the examples are made up for the example; use your own quotes.

## Related

- [Minimal vs Amazon-optimized splits](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/guides/minimal-vs-optimized-splits/)
- [SPD vs LTL](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/guides/spd-vs-ltl/)
- [Amazon's full rate table](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/2026-rates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/guides/split-shipment-freight-cost/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/guides/split-shipment-freight-cost.csv
