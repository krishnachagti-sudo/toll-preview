# A placement fee spreadsheet, or this calculator

In a spreadsheet the comparison is one line per option, units x fee per unit + freight, with Amazon's table typed in: for 1,000 large standard units at 1.5+ lb to 3 lb, =1000\*0.34+420 to =1000\*0.60+420 against =690 gives the same answer as here: for 1,000 large standard units at 2 lb, minimal splits cost $340.00 to $600.00 in placement fees (Amazon's range) plus $420.00 freight = $760.00 to $1,020.00; Amazon-optimized splits cost $690.00 in freight, no placement fee; cheapest: Amazon-optimized splits, by $70.00 to $330.00 wherever the fee falls in Amazon's range.

## Run this shipment in the calculator

[Compare the options](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/?units=1000&tier=large-standard&weight=2&min=420&opt=690)

## What A spreadsheet does

- Google Sheets: "Open and edit Excel files in Sheets", and "Create, view, and edit spreadsheets without an internet connection" (its product page).
- Any formula you like, kept with your own freight history.

## The formula

```
minimal total   = units * fee_per_unit + freight_one_location
partial total   = units * partial_fee_per_unit + freight_two_or_three   (Bulky only)
optimized total = freight_five_or_more
cheapest        = MIN(minimal total, partial total, optimized total)
```

Amazon's whole table is a CSV beside [the rate table page](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/2026-rates/) (add .csv to its address).

## When A spreadsheet is better

- You compare dozens of shipments with your own freight history and want it all in one file.
- You need columns this calculator does not have (prep labor by SKU, your own landed cost).

## When this calculator is better

- Amazon's table is read and dated for you, with partial splits and the extra-large rule.
- The dimensional weight and size tier from the box size, so the right row is used.
- It gives the fee at which the answer flips: Minimal splits are cheaper while their placement fee stays under $270.00 ($0.27 a unit across 1,000 units); above it, Amazon-optimized splits are cheaper.
- It checks a carton plan for Amazon-optimized splits and names the blocking product and carton.

Price here: free on this page; $0.01 a comparison over the API or MCP, $0.10 for the send-in worksheet with its CSV, never more than $4.90 a month.

## Sources

- [Google Workspace: Google Sheets (read November 8, 2026)](https://workspace.google.com/products/sheets/)
- [Amazon: FBA inbound placement service fee (United States, read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GC3Q44PBK8BXQW3Z)

> Not affiliated with Amazon. Fee ranges are Amazon's US Seller Central table, read November 8, 2026; the fee Send to Amazon shows for your plan is the one charged. Freight figures in the examples are made up for the example; use your own quotes.

## Related

- [Minimal vs Amazon-optimized splits](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/guides/minimal-vs-optimized-splits/)
- [Amazon's full rate table](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/2026-rates/)
- [Why Amazon-optimized splits are greyed out](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/optimized-splits-eligibility/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/vs/spreadsheet/  
Data as of: 2026-11-08
