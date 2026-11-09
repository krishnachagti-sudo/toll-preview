# Prediko vs this allocator

Prediko starts at $49 a month for demand planning, purchase orders and stock takes, and its pricing page does not mention landed cost; a shipment's landed cost here is $1.50 for up to 50 lines, so the two can run side by side.

## Prediko, from its own page

- Price: $49 a month under $100K annual revenue, rising with GMV; 14-day free trial (pricing page, read November 8, 2026).
- Demand and supply planning, purchase orders, stock takes.
- The pricing page does not mention landed cost.

## This allocator

- Price: $1.50 per shipment of up to 50 lines, free for 3 lines or fewer, re-runs for the same shipment free for a year, at most $14.90 a month.
- Bases: value, weight, CBM, units, per line, as given per SKU, or a mix, chosen per invoice.
- Every invoice split to the cent and added back exactly; Shopify's two-decimal drift shown.
- Late invoices: units on hand re-costed, sold units' share as a COGS variance.
- Your own Shopify export returned with only Cost per item filled; a CSV per SKU and a spreadsheet with formulas.
- No app install and no write access to your store: you import the file yourself.

## When Prediko is the better choice

When what you need is forecasting and reorder planning; it and this allocator do different jobs.

## Try a shipment

[Open this shipment in the allocator](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/?lines=MUG-12%2C+600%2C+2.10%2C+0.42%2C+0.0018%7CTEE-M%2C+1200%2C+3.85%2C+0.18%2C+0.0009%7CCANDLE-8%2C+400%2C+4.40%2C+0.35%2C+0.0011&charges=Ocean+freight%2C+freight%2C+1840.00%2C+volume%7CDuty+%28entry+summary%29%2C+duty%2C+1312.47%2C+value%7CCustoms+broker%2C+brokerage%2C+185.00%2C+equal&ship=PO-1042)

> The amounts are the worked shipment's, entered as a merchant would from its invoices; nothing here is a rate. Not tax, accounting or customs advice.

## Sources

- [Prediko: pricing page (read November 8, 2026)](https://www.prediko.io/pricing)

## Related

- [Stocky alternatives compared](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/stocky-alternative/)
- [Landed cost per unit](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-calculate-landed-cost-per-unit/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/vs-prediko/  
Data as of: 2026-11-08
