# A spreadsheet vs this allocator

A spreadsheet is free and fine for 3 SKUs and one invoice; on the 5-SKU container, rounding each share to the cent leaves Ocean freight $0.01 short and Duty (entry summary) $0.01 short, which the allocator removes by giving leftover cents to the largest remainders (a mug lands at $3.8374 in the 3-SKU example).

## A spreadsheet

- Free, and every formula is yours to change.
- Rounding: on container CNT-2611, plain per-line rounding leaves Ocean freight $0.01 short from its invoice; Duty (entry summary) $0.01 short from its invoice.
- Late invoices, a basis per charge and a Shopify file have to be built by hand.
- Merchants in the Shopify Community thread asked to see others' spreadsheets for exactly these cases.

## This allocator

- Price: $1.50 per shipment of up to 50 lines, free for 3 lines or fewer, re-runs for the same shipment free for a year, at most $14.90 a month.
- Bases: value, weight, CBM, units, per line, as given per SKU, or a mix, chosen per invoice.
- Every invoice split to the cent and added back exactly; Shopify's two-decimal drift shown.
- Late invoices: units on hand re-costed, sold units' share as a COGS variance.
- Your own Shopify export returned with only Cost per item filled; a CSV per SKU and a spreadsheet with formulas.
- No app install and no write access to your store: you import the file yourself.

## When a spreadsheet is the better choice

When you have 3 SKUs and one invoice: a sheet is fine, and the allocator makes the spreadsheet with formulas for your shipment free.

## Try a shipment

[Open this shipment in the allocator](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/?lines=MUG-12%2C+600%2C+2.10%2C+0.42%2C+0.0018%7CTEE-M%2C+1200%2C+3.85%2C+0.18%2C+0.0009%7CCANDLE-8%2C+400%2C+4.40%2C+0.35%2C+0.0011&charges=Ocean+freight%2C+freight%2C+1840.00%2C+volume%7CDuty+%28entry+summary%29%2C+duty%2C+1312.47%2C+value%7CCustoms+broker%2C+brokerage%2C+185.00%2C+equal&ship=PO-1042)

> The amounts are the worked shipment's, entered as a merchant would from its invoices; nothing here is a rate. Not tax, accounting or customs advice.

## Sources

- [Shopify Community: How are you handling landed cost per unit once Stocky is gone? (August 7, 2026)](https://community.shopify.com/t/how-are-you-handling-landed-cost-per-unit-once-stocky-is-gone/661708)

## Related

- [Stocky alternatives compared](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/stocky-alternative/)
- [Landed cost per unit](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-calculate-landed-cost-per-unit/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/vs-spreadsheet/  
Data as of: 2026-11-08
