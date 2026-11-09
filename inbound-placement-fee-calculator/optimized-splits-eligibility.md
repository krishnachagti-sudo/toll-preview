# Why Amazon-optimized shipment splits are greyed out

Amazon-optimized splits need at least five identical cartons per item, all packed with the same mix and quantities: of Amazon's three example plans only the first qualifies, and five identical cartons plus one odd carton fails too. Pack Extra the same as the others (24 x SKU-A), so all 6 match, or move it to another shipment; the other 5 cartons qualify.

## Check your cartons

[Check the cartons](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/?mode=eligibility&ecartons=5+x+SKU-A%3A+24%7C%5BExtra%5D+SKU-A%3A+10)

## Amazon's rule

"To qualify, shipments must include at least five identical cartons or pallets per item. Each carton or pallet must contain the same quantity per item and the same item mix."

## Amazon's three examples, checked

Each plan has five cartons; items 1 and 2

| Plan | Carton 5 | Amazon | This checker |
| --- | --- | --- | --- |
| 1 | 100 of item 1, 20 of item 2 | Eligible | Eligible |
| 2 | 100 of item 1, 0 of item 2 | Ineligible | Ineligible: 1 is in 5 cartons, but they are not identical: Carton 5 is packed differently from the other 4 (100 x 1 + 20 x 2). |
| 3 | 50 of item 1, 20 of item 2 | Ineligible | Ineligible: 1 is in 5 cartons, but they are not identical: Carton 5 is packed differently from the other 4 (100 x 1 + 20 x 2). |

Plan 1: "All cartons include items 1 and 2, and the quantity for each item is the same across all cartons, so this plan is eligible for an Amazon-optimized option." Plan 2: "All cartons except for carton 5 have items 1 and 2, so this plan is not eligible for an Amazon-optimized option." Plan 3: "All cartons include items 1 and 2 but carton 5 has a different quantity of item 1, so this plan is not eligible for an Amazon-optimized option."

## Five identical cartons plus one

Sellers in Amazon's forums found that one extra carton packed differently greys the option out. Amazon's rule explains it: every carton holding the product must be the same. Amazon-optimized splits: not eligible. 1 of 1 product blocks it: SKU-A. Pack Extra the same as the others (24 x SKU-A), so all 6 match, or move it to another shipment; the other 5 cartons qualify.

## A mixed plan

Amazon-optimized splits: not eligible. 1 of 3 products blocks it: SKU-C. Repack SKU-C's 120 units as 5 identical cartons of 24.

Six cartons of SKU-A with SKU-B, three of SKU-C

| Product | Cartons | Identical | Result |
| --- | ---: | ---: | --- |
| SKU-A | 6 | 6 | Qualifies |
| SKU-B | 6 | 6 | Qualifies |
| SKU-C | 3 | 3 | Repack SKU-C's 120 units as 5 identical cartons of 24. |

## More options in Send to Amazon

- Create separate shipments for standard-size items, non-standard-size items, and each of the following categories: apparel, jewelry, shoes, watches, and dangerous goods
- Ensure the item mix and item quantities are equal across all boxes
- Increase the number of boxes

## Sources

- [Amazon: FBA inbound placement service fee (United States, read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GC3Q44PBK8BXQW3Z)
- [Amazon Seller Forums: "5 identical boxes + 1 additional box does not work" (read November 8, 2026)](https://sellercentral-europe.amazon.com/seller-forums/discussions/t/7724a081-fb95-48db-97fe-aaa0a6567100)

> Not affiliated with Amazon. Fee ranges are Amazon's US Seller Central table, read November 8, 2026; the fee Send to Amazon shows for your plan is the one charged. Freight figures in the examples are made up for the example; use your own quotes.

## Steps

1. **List the cartons.** One carton or pallet a line, with each product and its units.
2. **Group by product.** For each product, take every carton that holds it.
3. **Compare the packing.** All of those cartons must hold the same products in the same quantities.
4. **Count.** There must be at least five of them. Any product that fails blocks Amazon-optimized splits for the plan.

## Questions

### Why is Amazon-optimized shipment splits unavailable?

Amazon: "When creating shipments, you'll only see the inbound placement options your shipments qualify for." To qualify, "To qualify, shipments must include at least five identical cartons or pallets per item. Each carton or pallet must contain the same quantity per item and the same item mix." One product with fewer than five identical cartons, or one carton packed differently, is enough to block it.

### Do I need five identical boxes of every product?

Yes, per item: "at least five identical cartons or pallets per item". Amazon's reason: "Shipping five or more identical cartons or pallets for each item provides the minimum quantity required to spread your inventory nationwide".

### Can a carton hold several products?

Yes, if every carton holding them has the same mix and quantities. Amazon's first example, five cartons each with 100 of item 1 and 20 of item 2, is eligible.

## Related

- [How to avoid the placement fee](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/guides/avoid-placement-fees/)
- [Minimal vs Amazon-optimized splits](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/guides/minimal-vs-optimized-splits/)
- [The FBA prep checker](https://krishnachagti-sudo.github.io/toll-preview/fba-prep-checker/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/optimized-splits-eligibility/  
Data as of: 2026-11-08
