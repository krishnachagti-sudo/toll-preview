# Landed cost in QuickBooks

Intuit's help page says QuickBooks Desktop Enterprise (Platinum and Diamond with Advanced Inventory) splits shipping and handling by quantity, amount, percentage, or by S&H (shipping & handling) cost; it names no weight or volume split, so a $3,280.00 ocean freight bill split by amount puts $502.39 on the lamps where CBM would put $1,170.68.

## In QuickBooks Desktop Enterprise

Intuit's steps (updated August 4, 2026): enter the bills for the inventory items and separate bills for shipping and handling, open Calculate Landed Cost from the Inventory menu, add the bills, choose a split method and post to the bill. The page lists the editions as Platinum and Diamond with Advanced Inventory.

## By CBM or weight first

When freight should follow space or weight, work out each item's share here first, then post those amounts per item rather than letting a quantity or amount split decide.

Ocean freight $3,280.00 on container CNT-2611, per item, by each basis.

| Item | by value | by weight | by volume (CBM) | by units |
| --- | ---: | ---: | ---: | ---: |
| LAMP-BR | $502.39 | $635.80 | $1,170.68 | $146.87 |
| RUG-5X8 | $658.31 | $943.77 | $301.03 | $73.43 |
| MUG-12 | $727.61 | $834.49 | $752.58 | $1,468.66 |
| BOTTLE-20 | $727.61 | $410.62 | $445.98 | $979.10 |
| TOWEL-BTH | $664.08 | $455.32 | $609.73 | $611.94 |

## QuickBooks Online

We did not find an Intuit help article with landed cost steps for QuickBooks Online. The allocator's per-SKU CSV gives the capitalised amount of each charge per item and the late-invoice variance, the figures any journal or item adjustment needs; which accounts to use is for you and your accountant.

- Shipment CNT-2611: goods $11,360.00, charges $6,355.76, landed $17,715.76.
- Ocean freight: $3,280.00, by volume (CBM).
- Duty (entry summary): $2,214.36, by value.
- Customs broker: $225.00, equally per line.
- Cargo insurance: $96.40, by value.
- Drayage: $540.00, by weight.

## Allocate your bills first

[Open this shipment in the allocator](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/?lines=LAMP-BR%2C+120%2C+14.50%2C+3.2%2C+0.028%7CRUG-5X8%2C+60%2C+38.00%2C+9.5%2C+0.0144%7CMUG-12%2C+1200%2C+2.10%2C+0.42%2C+0.0018%7CBOTTLE-20%2C+800%2C+3.15%2C+0.31%2C+0.0016%7CTOWEL-BTH%2C+500%2C+4.60%2C+0.55%2C+0.0035&charges=Ocean+freight%2C+freight%2C+3280.00%2C+volume%7CDuty+%28entry+summary%29%2C+duty%2C+2214.36%2C+value%7CCustoms+broker%2C+brokerage%2C+225.00%2C+equal%7CCargo+insurance%2C+insurance%2C+96.40%2C+value%7CDrayage%2C+freight%2C+540.00%2C+weight&ship=CNT-2611)

> The amounts are the worked shipment's, entered as a merchant would from its invoices; nothing here is a rate. Not tax, accounting or customs advice.

## Sources

- [Intuit: Calculate landed cost in QuickBooks Desktop Enterprise (updated August 4, 2026, read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/set-inventory-lists/calculate-landed-cost-quickbooks-enterprise/L4D21nWRC_US_en_US)

## Related

- [Allocate freight by CBM, weight or value](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-allocate-freight-to-inventory/)
- [Late freight invoices](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/late-freight-invoice-adjustment/)
- [Landed cost per unit](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-calculate-landed-cost-per-unit/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/landed-cost-quickbooks/  
Data as of: 2026-11-08
