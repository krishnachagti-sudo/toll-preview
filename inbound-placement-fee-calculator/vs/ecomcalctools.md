# EcomCalcTools' placement fee calculator compared

EcomCalcTools models the fee as a per-unit figure times a size-tier and a split multiplier plus one inbound shipping cost, with margin outputs; this calculator uses Amazon's own rows and a freight figure per option: for 1,000 large standard units at 2 lb, minimal splits cost $340.00 to $600.00 in placement fees (Amazon's range) plus $420.00 freight = $760.00 to $1,020.00; Amazon-optimized splits cost $690.00 in freight, no placement fee; cheapest: Amazon-optimized splits, by $70.00 to $330.00 wherever the fee falls in Amazon's range.

## Run this shipment in the calculator

[Compare the options](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/?units=1000&tier=large-standard&weight=2&min=420&opt=690)

## What EcomCalcTools does

- Free and "Runs in your browser", with the formula shown.
- Inputs: units, size tier multiplier, shipment split multiplier, placement fee per unit, inbound shipping cost, number of destinations, shipments a month, selling price and target margin.
- Outputs: placement fee total and per unit, monthly and annual impact, and a break-even price increase.
- Its page says "Last updated: June 30, 2026".

## When EcomCalcTools is better

- You want the placement fee turned into a price increase at a target margin.
- You want a monthly and annual impact from a shipment frequency.

## When this calculator is better

- It adds your own freight for each option to the fee and names the cheapest: for 1,000 large standard units at 2 lb, minimal splits cost $340.00 to $600.00 in placement fees (Amazon's range) plus $420.00 freight = $760.00 to $1,020.00; Amazon-optimized splits cost $690.00 in freight, no placement fee; cheapest: Amazon-optimized splits, by $70.00 to $330.00 wherever the fee falls in Amazon's range.
- It gives the fee at which the answer flips: Minimal splits are cheaper while their placement fee stays under $270.00 ($0.27 a unit across 1,000 units); above it, Amazon-optimized splits are cheaper.
- It checks a carton plan for Amazon-optimized splits and names the blocking product and carton.
- Every row of Amazon's table, read November 8, 2026, with partial splits for Bulky items and no fee for extra-large.
- One freight figure per option rather than one for the shipment, so the options can be compared.

Price here: free on this page; $0.01 a comparison over the API or MCP, $0.10 for the send-in worksheet with its CSV, never more than $4.90 a month.

## Sources

- [EcomCalcTools: Amazon Inbound Placement Fee Calculator 2026 (read November 8, 2026)](https://ecomcalctools.com/amazon/inbound-placement-fee-calculator/)
- [Amazon: FBA inbound placement service fee (United States, read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GC3Q44PBK8BXQW3Z)

> Not affiliated with Amazon. Fee ranges are Amazon's US Seller Central table, read November 8, 2026; the fee Send to Amazon shows for your plan is the one charged. Freight figures in the examples are made up for the example; use your own quotes.

## Related

- [Minimal vs Amazon-optimized splits](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/guides/minimal-vs-optimized-splits/)
- [Amazon's full rate table](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/2026-rates/)
- [Why Amazon-optimized splits are greyed out](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/optimized-splits-eligibility/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/vs/ecomcalctools/  
Data as of: 2026-11-08
