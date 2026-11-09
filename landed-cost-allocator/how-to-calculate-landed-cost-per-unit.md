# How to calculate landed cost per unit

Landed cost per unit is each SKU's product cost plus its share of every charge, divided by its units: on this 5-SKU container LAMP-BR lands at $28.4524 (bought at $14.50) and MUG-12 at $3.3063 (bought at $2.10), from $6,355.76 of charges on $11,360.00 of goods.

```
landed per unit = (unit cost x units + share of each charge) / units
share of a charge = charge x line basis / total basis   (to the cent, adding back)
```

## The worked container

Shipment CNT-2611: 2,680 units, $17,715.76 landed. Each charge's column adds back to its invoice exactly.

| SKU | Item | Units | Unit cost | Ocean freight (by volume (CBM)) | Duty (entry summary) (by value) | Customs broker (equally per line) | Cargo insurance (by value) | Drayage (by weight) | Landed per unit | Uplift |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| LAMP-BR | Brass table lamp | 120 | $14.50 | $1,170.68 | $339.17 | $45.00 | $14.77 | $104.67 | $28.4524 | 96.2% |
| RUG-5X8 | Wool rug 5 x 8 ft | 60 | $38.00 | $301.03 | $444.43 | $45.00 | $19.35 | $155.38 | $54.0865 | 42.3% |
| MUG-12 | Ceramic mug 12 oz | 1,200 | $2.10 | $752.58 | $491.22 | $45.00 | $21.38 | $137.39 | $3.3063 | 57.4% |
| BOTTLE-20 | Steel bottle 20 oz | 800 | $3.15 | $445.98 | $491.21 | $45.00 | $21.38 | $67.60 | $4.4890 | 42.5% |
| TOWEL-BTH | Cotton bath towel | 500 | $4.60 | $609.73 | $448.33 | $45.00 | $19.52 | $74.96 | $6.9951 | 52.1% |

## The arithmetic for LAMP-BR

1. LAMP-BR: 120 units x $14.50 = $1,740.00 product cost.
2. Ocean freight: $3,280.00 by volume (CBM), LAMP-BR's share $1,170.68 (rounded to the cent; the leftover cents go to the largest remainders so the lines add back to $3,280.00).
3. Duty (entry summary): $2,214.36 by value, LAMP-BR's share $339.17 (rounded to the cent; the leftover cents go to the largest remainders so the lines add back to $2,214.36).
4. Customs broker: $225.00 equally per line, LAMP-BR's share $45.00 (rounded to the cent; the leftover cents go to the largest remainders so the lines add back to $225.00).
5. Cargo insurance: $96.40 by value, LAMP-BR's share $14.77 (rounded to the cent; the leftover cents go to the largest remainders so the lines add back to $96.40).
6. Drayage: $540.00 by weight, LAMP-BR's share $104.67 (rounded to the cent; the leftover cents go to the largest remainders so the lines add back to $540.00).
7. Landed: $1,740.00 + $1,674.29 = $3,414.29; / 120 units = $28.4524 a unit ($28.45 in a 2-decimal field).

The lamp carries a **96.2%** uplift because it is bulky: ocean freight is split by CBM. A mug carries **57.4%**. One percentage applied to every SKU would hide that; [allocating freight by CBM, weight or value](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-allocate-freight-to-inventory/) shows how much the basis moves each SKU.

## Run your own shipment

[Open this shipment in the allocator](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/?lines=LAMP-BR%2C+120%2C+14.50%2C+3.2%2C+0.028%7CRUG-5X8%2C+60%2C+38.00%2C+9.5%2C+0.0144%7CMUG-12%2C+1200%2C+2.10%2C+0.42%2C+0.0018%7CBOTTLE-20%2C+800%2C+3.15%2C+0.31%2C+0.0016%7CTOWEL-BTH%2C+500%2C+4.60%2C+0.55%2C+0.0035&charges=Ocean+freight%2C+freight%2C+3280.00%2C+volume%7CDuty+%28entry+summary%29%2C+duty%2C+2214.36%2C+value%7CCustoms+broker%2C+brokerage%2C+225.00%2C+equal%7CCargo+insurance%2C+insurance%2C+96.40%2C+value%7CDrayage%2C+freight%2C+540.00%2C+weight&ship=CNT-2611)

## Rounding

Shares are rounded to the cent and the leftover cents go to the largest remainders, so the five lines of every invoice add back to it. Unit costs keep four decimals. Shopify's Cost per item keeps two, so the units at the two-decimal costs differ from the exact landed total by $7.64 on this container.

> The amounts are the worked shipment's, entered as a merchant would from its invoices; nothing here is a rate. Not tax, accounting or customs advice.

## Sources

- [IRS Publication 538 (01/2022), Accounting Periods and Methods (page reviewed April 30, 2026, read November 8, 2026)](https://www.irs.gov/publications/p538)
- [Shopify Community: How are you handling landed cost per unit once Stocky is gone? (August 7, 2026)](https://community.shopify.com/t/how-are-you-handling-landed-cost-per-unit-once-stocky-is-gone/661708)

## Steps

1. **List the lines.** For each SKU in the shipment: units received, unit cost, and the weight and CBM if a charge will be split by them.
2. **List the charges.** Every invoice that brought the goods in: freight, duty from the entry summary, the customs broker, insurance, drayage, less any supplier discount.
3. **Pick a basis per charge.** Freight by CBM or weight, duty and insurance by value, a flat broker fee per line or by value.
4. **Split each charge.** Line share = charge x line basis / total basis, rounded to the cent, with the leftover cents to the largest remainders so the lines add back to the invoice.
5. **Divide by units.** Landed per unit = (unit cost x units + the line's shares) / units.

## Questions

### How do you calculate landed cost per unit?

Add the line's product cost and its share of every freight, duty and fee invoice, then divide by the units of that SKU received.

### How do you calculate landed cost as a percentage?

Charges divided by the goods: on this container $6,355.76 / $11,360.00 = 55.9%. Per SKU it differs: 96.2% on the lamp, 57.4% on the mug.

## Related

- [Allocate freight by CBM, weight or value](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-allocate-freight-to-inventory/)
- [What landed cost is](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/what-is-landed-cost/)
- [Late freight invoices](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/late-freight-invoice-adjustment/)
- [Landed cost template for Excel](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/landed-cost-template-excel/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-calculate-landed-cost-per-unit/  
Data as of: 2026-11-08
