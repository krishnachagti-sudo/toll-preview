# Send to Amazon's estimate vs your own freight

Send to Amazon's estimated total inbound cost is the placement fee plus shipping at Amazon's Partner Carrier rates, and Amazon says your own carrier's rates can come out higher or lower; in one seller's posted estimate, minimal splits came to $108.80 of placement fee plus $130.36 of LTL freight = $239.16, against $274.06 of parcel freight for Amazon-optimized splits, so minimal splits were cheaper by $34.90.

## Run this shipment in the calculator

[Compare the options](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/?units=1000&tier=large-standard&weight=2&min=420&opt=690)

## What Send to Amazon's estimate does

- When you create a shipping plan, you'll see a fee estimate for each available inbound placement option.
- "The FBA inbound placement service fee and our estimate of your potential shipping costs, based on our Partner Carrier program rates for domestic shipments".
- Your carrier's rates will determine whether your actual shipping costs are higher or lower than our estimates.
- The API provides the same placement options and fees as Send to Amazon.

The same Amazon FAQ points to the Revenue Calculator for estimates: "Rates shown in the Revenue Calculator are subject to change within officially published rate ranges outlined above."

## When Send to Amazon's estimate is better

- It is authoritative for the fee: the figure it shows for your plan is what you are charged (on units received).
- It knows your account's actual destinations and the options your plan qualifies for.
- With Amazon's partnered carriers, its shipping estimate is the rate you book.

## When this calculator is better

- Your own carrier's quotes for each option, not Partner Carrier rates.
- The fee at which the answer flips, so you can see how close the call is.
- A carton plan checked for Amazon-optimized splits before you build the plan in Seller Central.
- A worksheet CSV to keep with the shipment.

Price here: free on this page; $0.01 a comparison over the API or MCP, $0.10 for the send-in worksheet with its CSV, never more than $4.90 a month.

## Sources

- [Amazon: FBA inbound placement service fee (United States, read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GC3Q44PBK8BXQW3Z)

> Not affiliated with Amazon. Fee ranges are Amazon's US Seller Central table, read November 8, 2026; the fee Send to Amazon shows for your plan is the one charged. Freight figures in the examples are made up for the example; use your own quotes.

## Related

- [Minimal vs Amazon-optimized splits](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/guides/minimal-vs-optimized-splits/)
- [Amazon's full rate table](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/2026-rates/)
- [Why Amazon-optimized splits are greyed out](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/optimized-splits-eligibility/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/vs/send-to-amazon-estimate/  
Data as of: 2026-11-08
