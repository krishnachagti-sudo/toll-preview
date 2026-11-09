# How to allocate freight to inventory

Split freight by what the carrier charged for: on this container the $3,280.00 ocean freight puts $1,170.68 on the bulky lamps by CBM but only $502.39 by value, so a lamp lands at $27.0821 or $21.5130; the heavy, dear rug goes the other way, $50.4243 by CBM against $56.3790 by value.

## One freight invoice, four bases

Ocean freight $3,280.00: each SKU's share by each basis.

| SKU | by value | by weight | by volume (CBM) | by units |
| --- | ---: | ---: | ---: | ---: |
| LAMP-BR | $502.39 | $635.80 | $1,170.68 | $146.87 |
| RUG-5X8 | $658.31 | $943.77 | $301.03 | $73.43 |
| MUG-12 | $727.61 | $834.49 | $752.58 | $1,468.66 |
| BOTTLE-20 | $727.61 | $410.62 | $445.98 | $979.10 |
| TOWEL-BTH | $664.08 | $455.32 | $609.73 | $611.94 |

Landed cost per unit with the freight split each way, duty ($2,214.36) by value in every column.

| SKU | by value | by weight | by volume (CBM) | by units |
| --- | ---: | ---: | ---: | ---: |
| LAMP-BR | $21.5130 | $22.6248 | $27.0821 | $18.5503 |
| RUG-5X8 | $56.3790 | $61.1367 | $50.4243 | $46.6310 |
| MUG-12 | $3.1157 | $3.2048 | $3.1365 | $3.7332 |
| BOTTLE-20 | $4.6735 | $4.2773 | $4.3215 | $4.9879 |
| TOWEL-BTH | $6.8248 | $6.4073 | $6.7161 | $6.7205 |

## Which basis for which charge

- **Volume (CBM)**: ocean freight and container costs, where the space is what you pay for. Bulky, light goods carry more.
- **Weight**: air freight, parcel and heavy freight, drayage by weight. Dense goods carry more.
- **Value**: duty (customs assesses most duty on value), cargo insurance and value-based fees. Value-based freight overloads dear, light items and under-costs heavy, cheap ones.
- **Units**: fair only when the items are alike, such as one product in several colors.
- **Per line or as given**: a flat broker fee per entry line, or duty per line copied from the entry summary.
- **A mix**: for example 70% by CBM and 30% by weight when a rate has both.

Merchants in the Shopify Community thread on landed cost after Stocky land on a basis per charge rather than per shipment: freight by weight, duty by value. The allocator takes a basis per invoice and shows the freight under every basis your lines have data for.

## Compare the bases on your shipment

[Open this shipment in the allocator](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/?lines=LAMP-BR%2C+120%2C+14.50%2C+3.2%2C+0.028%7CRUG-5X8%2C+60%2C+38.00%2C+9.5%2C+0.0144%7CMUG-12%2C+1200%2C+2.10%2C+0.42%2C+0.0018%7CBOTTLE-20%2C+800%2C+3.15%2C+0.31%2C+0.0016%7CTOWEL-BTH%2C+500%2C+4.60%2C+0.55%2C+0.0035&charges=Ocean+freight%2C+freight%2C+3280.00%2C+volume%7CDuty+%28entry+summary%29%2C+duty%2C+2214.36%2C+value&ship=CNT-2611)

> The amounts are the worked shipment's, entered as a merchant would from its invoices; nothing here is a rate. Not tax, accounting or customs advice.

## Sources

- [Shopify Community: How are you handling landed cost per unit once Stocky is gone? (August 7, 2026)](https://community.shopify.com/t/how-are-you-handling-landed-cost-per-unit-once-stocky-is-gone/661708)

## Questions

### Should freight be allocated by weight, volume or value?

By what the carrier charged for: ocean freight priced by space by CBM, air or heavy freight by weight. Value-based freight loads expensive light items and under-costs heavy cheap ones. Duty and insurance follow value.

### How do you split one freight bill across several products?

Divide the bill by the total of the basis (CBM, kg or value) and multiply by each SKU's part of it, then round to the cent so the lines add back to the bill.

## Related

- [Landed cost per unit, step by step](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-calculate-landed-cost-per-unit/)
- [Late freight invoices](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/late-freight-invoice-adjustment/)
- [QuickBooks landed cost](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/landed-cost-quickbooks/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-allocate-freight-to-inventory/  
Data as of: 2026-11-08
