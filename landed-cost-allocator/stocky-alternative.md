# Stocky alternatives for landed cost

Stocky ended on August 31, 2026, its APIs stopped the same day and Shopify gives read-only export access for at least 90 days (to November 29, 2026 at the earliest); for landed cost, the replacements we read range from free (Stockroom) to SKU.io at $1,000 a month and up, or $1.50 per shipment of up to 50 lines here with no subscription.

## What Stocky left

- Historical purchase orders can't be imported into Shopify.
- Suppliers can't be exported from Stocky.
- Each product variant has a single static Cost per item field.
- This cost stays fixed when you receive a purchase order or transfer.

## The alternatives, from their own pages

Read on each product's own page on November 8, 2026.

| Product | Price | Landed cost, as listed | Rating |
| --- | --- | --- | --- |
| Stockroom | Free | Track landed costs at receiving and report on margins | 4.9 (59 reviews) |
| Landed Cost Receiving | about $28.89 a month (one Standard plan; the listing showed us a local-currency price converted at its own rate of 0.0106 US dollars) | Value, quantity or weight basis; writes cost per item to shopify as a weighted average | no reviews yet |
| Landrio: Landed Cost & COGS | Free plan; Starter, Growth and Pro about $28.89, $58.77 and $98.62 a month (converted at the listing's own rate) | Split freight, duty and fees by value, quantity or weight | no reviews yet |
| SKU.io | Starting at $1,000 per month, personalized | FIFO landed cost | not shown |
| Prediko | $49 a month under $100K annual revenue, rising with GMV; 14-day free trial | The pricing page does not mention landed cost | not shown |
| This allocator | $1.50 per shipment of up to 50 lines, free for 3 lines or fewer, re-runs for the same shipment free for a year, at most $14.90 a month | Value, weight, CBM, units, per line, as given or a mix; late invoices on units on hand; your export filled | new |

## When each is the better choice

- **Stockroom**: you want purchase orders, receiving and counts inside Shopify as a Stocky replacement, free.
- **Landed Cost Receiving or Landrio: Landed Cost & COGS**: you receive stock continuously in Shopify and want costs written back automatically as a weighted average.
- **SKU.io**: you run several channels and want inventory, orders and purchasing in one system.
- **This allocator**: you import a few shipments a month, want freight by CBM or a mix, cents that add back to every invoice, late invoices kept off sold units, and no subscription.

Moving off Stocky step by step: [Shopify Cost per item with landed cost](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/shopify-cost-per-item/).

## Cost your next shipment

[Open this shipment in the allocator](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/?lines=MUG-12%2C+600%2C+2.10%2C+0.42%2C+0.0018%7CTEE-M%2C+1200%2C+3.85%2C+0.18%2C+0.0009%7CCANDLE-8%2C+400%2C+4.40%2C+0.35%2C+0.0011&charges=Ocean+freight%2C+freight%2C+1840.00%2C+volume%7CDuty+%28entry+summary%29%2C+duty%2C+1312.47%2C+value%7CCustoms+broker%2C+brokerage%2C+185.00%2C+equal&ship=PO-1042)

> The amounts are the worked shipment's, entered as a merchant would from its invoices; nothing here is a rate. Not tax, accounting or customs advice.

## Sources

- [Shopify Help Center: Transitioning from Stocky (read November 8, 2026)](https://help.shopify.com/en/manual/inventory-and-locations/transitioning-from-stocky)
- [Stockroom: Shopify App Store listing (read November 8, 2026)](https://apps.shopify.com/stock-room)
- [Landed Cost Receiving: Shopify App Store listing (read November 8, 2026)](https://apps.shopify.com/landed-cost-receiving)
- [Landrio: Landed Cost & COGS: Shopify App Store listing (read November 8, 2026)](https://apps.shopify.com/landedwise)
- [SKU.io: pricing page (read November 8, 2026)](https://www.sku.io/pricing)
- [Prediko: pricing page (read November 8, 2026)](https://www.prediko.io/pricing)

## Questions

### When did Stocky stop working?

Shopify Help: "Stocky is no longer available as of August 31, 2026." "Stocky APIs stopped working on August 31, 2026." "You'll have read-only access to export your data for at least 90 days after that date."

## Related

- [Shopify Cost per item](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/shopify-cost-per-item/)
- [Late freight invoices](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/late-freight-invoice-adjustment/)
- [Landed cost template for Excel](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/landed-cost-template-excel/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/stocky-alternative/  
Data as of: 2026-11-08
