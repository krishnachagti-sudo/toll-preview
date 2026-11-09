# Shopify Cost per item with landed cost

Shopify's Cost per item is one number per variant that you set, so freight and duty reach it only when you allocate them and import the result; on this 5-SKU container that moves a lamp from $14.50 to $28.45, and the two-decimal rounding leaves $7.64 between the units at those costs and the exact landed total.

## What the field is

Shopify Help describes the Cost per item column as "How much it costs you to make or acquire the product or variant." and says of Stocky's end: "Each product variant has a single static Cost per item field." "This cost stays fixed when you receive a purchase order or transfer."

## Filling it for a shipment

A product CSV import changes what is in the file. Shopify Help: "When you update products using a CSV file, the only required columns are URL handle and Title." A column left out keeps its value ("the value in the product list remains the same"), but a column included and left blank does not: "the matching value in the product list is overwritten as blank". Leaving out the option columns while including variant columns can replace the variants. So the safe file is your own export with only Cost per item changed, imported with "Overwrite products with matching handles" ticked. The allocator builds exactly that.

Cost per item for container CNT-2611: the exact landed unit cost and the two-decimal value Shopify stores.

| SKU | Units | Supplier cost | Landed per unit | Cost per item | Rounding over the line |
| --- | ---: | ---: | ---: | ---: | ---: |
| LAMP-BR | 120 | $14.50 | $28.4524 | 28.45 | -$0.29 |
| RUG-5X8 | 60 | $38.00 | $54.0865 | 54.09 | $0.21 |
| MUG-12 | 1,200 | $2.10 | $3.3063 | 3.31 | $4.43 |
| BOTTLE-20 | 800 | $3.15 | $4.4890 | 4.49 | $0.83 |
| TOWEL-BTH | 500 | $4.60 | $6.9951 | 7.00 | $2.46 |

The largest drift is on MUG-12: 1,200 units at 3.31 against an exact $3.3063, $4.43 over the line. Margin reports in Shopify use the two-decimal figure.

## Fill Cost per item for your shipment

[Open this shipment in the allocator](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/?lines=LAMP-BR%2C+120%2C+14.50%2C+3.2%2C+0.028%7CRUG-5X8%2C+60%2C+38.00%2C+9.5%2C+0.0144%7CMUG-12%2C+1200%2C+2.10%2C+0.42%2C+0.0018%7CBOTTLE-20%2C+800%2C+3.15%2C+0.31%2C+0.0016%7CTOWEL-BTH%2C+500%2C+4.60%2C+0.55%2C+0.0035&charges=Ocean+freight%2C+freight%2C+3280.00%2C+volume%7CDuty+%28entry+summary%29%2C+duty%2C+2214.36%2C+value%7CCustoms+broker%2C+brokerage%2C+225.00%2C+equal%7CCargo+insurance%2C+insurance%2C+96.40%2C+value%7CDrayage%2C+freight%2C+540.00%2C+weight&ship=CNT-2611)

> The amounts are the worked shipment's, entered as a merchant would from its invoices; nothing here is a rate. Not tax, accounting or customs advice.

## Sources

- [Shopify Help Center: Using CSV files to import and export products (read November 8, 2026)](https://help.shopify.com/en/manual/products/import-export/using-csv)
- [Shopify Help Center: Transitioning from Stocky (read November 8, 2026)](https://help.shopify.com/en/manual/inventory-and-locations/transitioning-from-stocky)
- [Shopify Developer Community: Stocky sunset, Shopify feature parity](https://community.shopify.dev/t/stocky-sunset-shopify-feature-parity/29199)

## Steps

1. **Export the products.** Products, Export, the products in this shipment, as a CSV.
2. **Fill Cost per item.** Paste the export into the allocator with the shipment; it changes only Cost per item on the SKUs in the shipment and keeps every other column and row of those products as exported.
3. **Import.** Products, Import, the filled file, with "Overwrite products with matching handles" ticked.
4. **Check.** Open two or three variants and compare Cost per item with the allocator's table.
5. **Keep the files.** Keep the export as it was before the import: it is your way back.

## Questions

### Does Shopify's Cost per item include freight and duty?

Only if you put them in. Shopify Help: "Each product variant has a single static Cost per item field." and "This cost stays fixed when you receive a purchase order or transfer."

### How many decimals does Shopify keep for cost?

Two. Merchants report that cost prices in Shopify only go to 2 decimal places, against 4 in Stocky.

## Related

- [Stocky alternative](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/stocky-alternative/)
- [Late freight invoices](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/late-freight-invoice-adjustment/)
- [Landed cost per unit](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/how-to-calculate-landed-cost-per-unit/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/shopify-cost-per-item/  
Data as of: 2026-11-08
