# Landed cost template with formulas

The landed cost formula for one charge is =charge\*line basis/SUM(basis), copied down each SKU row: in the example sheet the mug row reads =H$2\*E3/SUM(E$3:E$5) for ocean freight by CBM, and the mug lands at $3.8374 a unit.

## The sheet

Row 1 names the columns, row 2 holds each charge's amount, then one row per SKU: units, unit cost, weight, CBM and value, the product cost, one column per charge and the landed cost. The last row checks how far the cents drift when each share is rounded.

```
SKU,Qty,Unit cost,Weight (kg),CBM,Value,Product cost,Ocean freight (by volume (CBM)),Duty (entry summary) (by value),Customs broker (equally per line),Landed total (USD),Landed per unit
Charge amounts,,,,,,,1840.00,1312.47,185.00,,
MUG-12,600,2.1000,252,1.08,1260.0000,=B3*C3,=H$2*E3/SUM(E$3:E$5),=I$2*F3/SUM(F$3:F$5),=J$2/3,=G3+SUM(H3:J3),=K3/B3
TEE-M,1200,3.8500,216,1.08,4620.0000,=B4*C4,=H$2*E4/SUM(E$3:E$5),=I$2*F4/SUM(F$3:F$5),=J$2/3,=G4+SUM(H4:J4),=K4/B4
...
```

The mug row in full: `MUG-12,600,2.1000,252,1.08,1260.0000,=B3*C3,=H$2*E3/SUM(E$3:E$5),=I$2*F3/SUM(F$3:F$5),=J$2/3,=G3+SUM(H3:J3),=K3/B3`

## Get it for your shipment

On the allocator, enter your lines and invoices, then "download it for the shipment above" under The files. It is free and made in your browser: a CSV that Excel and Google Sheets open with the formulas live.

## Make the sheet for your shipment

[Open this shipment in the allocator](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/?lines=MUG-12%2C+600%2C+2.10%2C+0.42%2C+0.0018%7CTEE-M%2C+1200%2C+3.85%2C+0.18%2C+0.0009%7CCANDLE-8%2C+400%2C+4.40%2C+0.35%2C+0.0011&charges=Ocean+freight%2C+freight%2C+1840.00%2C+volume%7CDuty+%28entry+summary%29%2C+duty%2C+1312.47%2C+value%7CCustoms+broker%2C+brokerage%2C+185.00%2C+equal&ship=PO-1042)

## What a spreadsheet does not do

Rounding each share to the cent in a sheet can leave the lines a cent or more off the invoice; the check row shows it. The allocator's own result gives the leftover cents to the largest remainders so every invoice adds back exactly, splits late invoices between units on hand and sold, and fills your Shopify export ($1.50 per shipment of up to 50 lines, free for 3 lines or fewer, re-runs for the same shipment free for a year, at most $14.90 a month).

> The amounts are the worked shipment's, entered as a merchant would from its invoices; nothing here is a rate. Not tax, accounting or customs advice.

## Sources

- [IRS Publication 538 (01/2022), Accounting Periods and Methods (page reviewed April 30, 2026, read November 8, 2026)](https://www.irs.gov/publications/p538)

## Questions

### What is the landed cost formula in Excel?

For a charge in H2 split by CBM in column E over rows 3 to 5: =H$2\*E3/SUM(E$3:E$5). Landed per unit = (product cost + the charge columns) / units.

## Related

- [Landed cost per unit, step by step](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-calculate-landed-cost-per-unit/)
- [What landed cost is](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/what-is-landed-cost/)
- [Stocky alternative](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/stocky-alternative/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/landed-cost-template-excel/  
Data as of: 2026-11-08
