# Stocky shut down: the export checklist

Stocky stopped on Monday, August 31, 2026, and Shopify promises read-only export access for at least 90 days after, which runs to Sunday, November 29, 2026 at the earliest; export the completed purchase orders and cost history before then, because past purchase orders cannot be imported into Shopify.

Shopify Help, read November 8, 2026: "Stocky is no longer available as of August 31, 2026." "Stocky APIs stopped working on August 31, 2026." "You'll have read-only access to export your data for at least 90 days after that date." "Historical purchase orders can't be imported into Shopify." "Suppliers can't be exported from Stocky."

## Where landed cost goes next

"Each product variant has a single static Cost per item field." "This cost stays fixed when you receive a purchase order or transfer." So for each new shipment: allocate its invoices, then fill Cost per item from your own export ([how](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/shopify-cost-per-item/)). A late invoice re-costs only the units on hand ([late invoices](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/late-freight-invoice-adjustment/)).

## Cost your first shipment after Stocky

[Open this shipment in the allocator](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/?lines=MUG-12%2C+600%2C+2.10%2C+0.42%2C+0.0018%7CTEE-M%2C+1200%2C+3.85%2C+0.18%2C+0.0009%7CCANDLE-8%2C+400%2C+4.40%2C+0.35%2C+0.0011&charges=Ocean+freight%2C+freight%2C+1840.00%2C+volume%7CDuty+%28entry+summary%29%2C+duty%2C+1312.47%2C+value%7CCustoms+broker%2C+brokerage%2C+185.00%2C+equal&ship=PO-1042)

> The amounts are the worked shipment's, entered as a merchant would from its invoices; nothing here is a rate. Not tax, accounting or customs advice.

## Sources

- [Shopify Help Center: Transitioning from Stocky (read November 8, 2026)](https://help.shopify.com/en/manual/inventory-and-locations/transitioning-from-stocky)

## Steps

1. **Export the completed purchase orders.** Stocky's purchase order reports, as CSV files, while read-only access lasts.
2. **Export stocktakes and cost history.** From Stocky's built-in reports.
3. **Write down the suppliers.** Shopify Help says suppliers cannot be exported from Stocky.
4. **Re-create Cost per item.** For stock still on hand, from the last shipments' landed cost; for each new shipment, allocate and import.
5. **Check against a real invoice.** Run one past shipment through the replacement and compare with what Stocky showed.

## Related

- [Stocky alternatives compared](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/stocky-alternative/)
- [Shopify Cost per item](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/shopify-cost-per-item/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/after-stocky/  
Data as of: 2026-11-08
