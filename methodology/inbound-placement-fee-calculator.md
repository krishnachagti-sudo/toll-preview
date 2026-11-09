# How the inbound placement fee is compared: FBA method

Each product's placement fee comes from Amazon's US table by size tier and shipping weight, as a range per unit on minimal splits (for example $0.34 to $0.60 for large standard at 1.5+ lb to 3 lb) and none on Amazon-optimized splits; your freight for each option is added, and the cheapest is named only when it wins across the whole range. The fee is charged 45 days after Amazon receives the shipment.

## What does the inbound placement fee calculator compute?

Given the products in a shipping plan (size tier and weight, or the packaged sides and unit weight) and your freight quote for each placement option, the tool prices minimal, partial and Amazon-optimized splits with Amazon's published fee range (or the exact fee Send to Amazon shows you), names the cheapest and how sure that is, and gives the most the fee can be before the free option wins. It also checks a carton plan against the five-identical-cartons rule, looks up Amazon's fee row, and prices Amazon Warehousing and Distribution (AWD) against the fee. Not affiliated with Amazon. The fee table is Amazon's US Seller Central page, read on the date shown.

Operations (the op field):

- `compare`: Prices each placement option asked for: the placement fee (Amazon's range or your figure, less any new-seller credits), your freight and other costs, the total and per unit; names the cheapest and how sure, the break-even fee, the options Amazon would not offer for the plan, and, with worksheet, a CSV per product and option.
- `eligibility`: Checks a carton (or pallet) plan against Amazon's rule for Amazon-optimized splits: at least five identical cartons per item, the same quantity and item mix in each. Names each item that blocks it and how to fix it.
- `rates`: Returns Amazon's placement fee table, and for a tier and weight its row, the range per unit for each option and the inbound defect fee for the same row.
- `awd`: Prices a carton through AWD (processing, transport to FBA and storage for the months held, at the base, smart or managed rate) per unit and per carton, against a placement fee per unit or Amazon's minimal-split range, with the months at which each end of the range breaks even.

Inputs:

- `items`: Up to 200 products, each with units and either a size tier with its shipping weight, or the packaged length, width, height and unit weight, from which the tier and shipping weight are worked out.
- `options`: minimal, partial and optimized, each with your freight quote for all its shipments and any other costs; minimal and partial may also take the fee (or fee per unit) Send to Amazon shows.
- `planDate, receivedDate`: The day the plan is created (it picks Amazon's 2026 or 2027 size tiers) and the day Amazon receives it (the fee is charged 45 days later). Dates are written like 2026-11-20.
- `credits, region`: New-seller placement fee credits left, in dollars, and the inbound region for a minimal-split shipment (for notes only).
- `cartons, unit`: The carton or pallet plan, each with a count and what it holds, to check Amazon-optimized splits.
- `unitsPerCarton, cubicFeet, months, region, rate, date, placementFeePerUnit`: For awd: one carton, the months it waits in AWD, the storage region and rate, and the fee to compare with.
- `worksheet`: With compare, the send-in worksheet as CSV, the paid output.

Outputs:

- answer: the total for each option and the cheapest, with how sure that is
- verdict: exact, certain, cheapest at both ends of the range, depends on where the fee falls, or the only option
- items: each product's tier, shipping weight, fee row, range per unit and inbound defect fee
- options: the placement fee and its source, credits, freight, other costs, total and per unit; breakEven: the most the fee can be
- eligibility: each item's cartons, how many are identical, why it blocks and the fix
- rates: the matched row and the table; awd: the cost per unit and per carton, its parts and the break-even months

## How is it calculated, step by step?

1. Each product's size tier is the one given, or is worked out from the packaged sides and unit weight with Amazon's size tier tables (the 2026 table, or the 2027 table for a plan dated January 15, 2027 or later). Shipping weight is the unit weight for small standard and the larger of unit and dimensional weight otherwise; dimensional weight is the volume divided by 139, with sides of at least 2 inches for bulky items.
2. The weight picks the fee row and band in Amazon's table; a band's top edge is inclusive. Weights and money are read exactly, so a figure on an edge lands in the right band.
3. Minimal and partial splits are priced at the low and high ends of Amazon's published range times the units, unless you give the fee Send to Amazon shows, which is then exact. Amazon-optimized splits have no placement fee. Credits come off the fee, up to the fee.
4. Partial splits are not offered for a plan with standard-size items. Amazon-optimized splits are not offered when the carton plan fails the five-identical-cartons rule, or, with no carton plan, when an item has fewer than five units.
5. Each option's total is the fee less credits, plus freight and other costs, at both ends of the range. An option that is cheapest even against the others' best case is named with the margin; otherwise the answer says which wins at the low end and which at the high end.
6. The break-even is the most a fee option's placement fee can be before Amazon-optimized splits cost less, in total and per unit.
7. The carton check groups cartons by item: an item qualifies when it sits in at least five cartons packed identically (same quantity and item mix), and an odd carton is named with the packing that would make it match.
8. AWD is priced from Amazon's AWD fee table for the date (before or from February 1, 2027): processing and transport per carton plus storage per cubic foot a month, divided by the units in the carton.

**Amazon's pages.**

The fee table, the option rules, the size tiers, dimensional weight, the inbound defect fee and the AWD fees were read on November 8, 2026 from Amazon's US Seller Central pages, with the sentences they rest on quoted.

## Which edge cases does it handle?

- A fee you give outside Amazon's published range for the items is flagged, with the range.
- A plan whose items pay no placement fee says partial splits are not for it.
- A plan dated January 15, 2027 or later uses Amazon's 2027 size tiers, including medium bulky, extra-large bulky and oversize.
- A product with neither a tier and weight nor its sides is refused, naming the field.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**1,000 large standard units at 2 lb: minimal splits with $420 freight against Amazon-optimized with $690**

```json
{
  "op": "compare",
  "items": [
    {
      "sku": "MUG-2LB",
      "units": 1000,
      "tier": "large-standard",
      "weight": "2"
    }
  ],
  "options": {
    "minimal": {
      "freight": "420"
    },
    "optimized": {
      "freight": "690"
    }
  },
  "planDate": "2026-11-08",
  "receivedDate": "2026-11-20"
}
```

1,000 large standard units at 2 lb: minimal splits with $420 freight against Amazon-optimized with $690

| Result | Value |
| --- | --- |
| answer | For 1,000 large standard units at 2 lb, minimal splits cost $340.00 to $600.00 in placement fees (Amazon's range) plus $420.00 freight = $760.00 to $1,020.00; Amazon-optimized splits cost $690.00 in freight, no placement fee; cheapest: Amazon-optimized splits, by $70.00 to $330.00 wherever the fee falls in Amazon's range. |
| size table | 2026 |
| MUG-2LB: fee row | Large standard, 1.5+ lb to 3 lb, $0.34 to $0.60 a unit on minimal splits |
| Minimal shipment splits | $340.00 to $600.00 (Amazon's published range) + $420.00 freight = $760.00 to $1,020.00 |
| Amazon-optimized shipment splits | $0.00 (No placement fee) + $690.00 freight = $690.00 |

**An exact fee from Send to Amazon: $108.80 plus $130.36 LTL against $274.06 of parcel freight**

```json
{
  "op": "compare",
  "items": [
    {
      "sku": "FORUM",
      "units": 272,
      "tier": "large-standard",
      "weight": "1"
    }
  ],
  "options": {
    "minimal": {
      "freight": "130.36",
      "fee": "108.80"
    },
    "optimized": {
      "freight": "274.06"
    }
  },
  "planDate": "2026-11-08"
}
```

An exact fee from Send to Amazon: $108.80 plus $130.36 LTL against $274.06 of parcel freight

| Result | Value |
| --- | --- |
| answer | For 272 large standard units at 1 lb, minimal splits cost $108.80 in placement fees plus $130.36 freight = $239.16; Amazon-optimized splits cost $274.06 in freight, no placement fee; cheapest: minimal splits, by $34.90. |
| size table | 2026 |
| FORUM: fee row | Large standard, 12+ oz to 1.5 lb, $0.24 to $0.50 a unit on minimal splits |
| Minimal shipment splits | $108.80 (The fee you entered) + $130.36 freight = $239.16 |
| Amazon-optimized shipment splits | $0.00 (No placement fee) + $274.06 freight = $274.06 |
| break-even | Minimal splits are cheaper while their placement fee stays under $143.70 ($0.52 a unit across 272 units); above it, Amazon-optimized splits are cheaper. |

**Five identical cartons and one odd carton**

```json
{
  "op": "eligibility",
  "cartons": [
    {
      "count": 5,
      "items": {
        "SKU-A": 24
      }
    },
    {
      "id": "Extra",
      "items": {
        "SKU-A": 10
      }
    }
  ]
}
```

Five identical cartons and one odd carton

| Result | Value |
| --- | --- |
| answer | Amazon-optimized splits: not eligible. 1 of 1 product blocks it: SKU-A. Pack Extra the same as the others (24 x SKU-A), so all 6 match, or move it to another shipment; the other 5 cartons qualify. |

**AWD for a 1.5 cubic foot carton of 24 held three months**

```json
{
  "op": "awd",
  "unitsPerCarton": 24,
  "cubicFeet": "1.5",
  "months": 3,
  "tier": "large-standard",
  "weight": "2",
  "date": "2026-11-08"
}
```

AWD for a 1.5 cubic foot carton of 24 held three months

| Result | Value |
| --- | --- |
| answer | AWD costs $0.29 a unit for a carton of 24 at 1.5 cu ft held 3 months ($0.20 of it processing and transport to FBA), against a minimal-split placement fee of $0.34 to $0.60 a unit; AWD is cheaper across that range. Freight into AWD is not included. |
| per carton | $7.06 |
| fees used | AWD fees until January 31, 2027 |

## What does it not do?

- Amazon publishes the placement fee as a range per unit that varies with the inbound location and capacity. The fee Send to Amazon shows for your plan is the one you are charged; enter it for an exact answer.
- Freight figures are your own quotes. The cheapest pick is only as good as them.
- Freight into AWD is not included in the AWD cost. US marketplace only.

## Where does the data come from, and how fresh is it?

Amazon's placement fee table and the pages around it were read on November 8, 2026 on Amazon's US Seller Central. They change only by hand, with the tests that pin the table row by row.

- [FBA inbound placement service fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GC3Q44PBK8BXQW3Z)
- [2027 US Referral and Fulfillment by Amazon fees (read November 8, 2026)](https://amazon.com/selling-fee-changes)
- [Product size tiers (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G5KW835AHDJCH8W)
- [Dimensional weight (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G53Z9EKF8VVZVH29)
- [Inbound defect fees (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GL5XA3MNXAJKJE8E)
- [Amazon Warehousing and Distribution fees (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GAYG62Q3MPE6STFS)
- [Amazon Warehousing and Distribution (read November 8, 2026)](https://sell.amazon.com/programs/warehousing)
- [New Seller Incentives (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GXMJ38VA95GUN5XU)
- [Small-parcel delivery to Amazon (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/200280260)
- [Truckload delivery to Amazon (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/200280270)
- [Shipping and routing requirements (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200141510)
- [2026 Updates to US Referral and Fulfillment by Amazon Fees (Amazon's announcement in Seller Forums) (read November 8, 2026)](https://sellercentral.amazon.com/seller-forums/discussions/t/f3fa3211-820b-4e2e-a023-158a9cf55f99)

Amazon's placement fee table and the pages around it were read on November 8, 2026 on Amazon's US Seller Central. They change only by hand, with the tests that pin the table row by row.

Inbound placement fee calculator: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [FBA inbound placement service fee](https://sellercentral.amazon.com/help/hub/reference/external/GC3Q44PBK8BXQW3Z) | Amazon page, United States | 2026-11-08 |
| [2027 US Referral and Fulfillment by Amazon fees](https://amazon.com/selling-fee-changes) | Amazon page, United States | 2026-11-08 |
| [Product size tiers](https://sellercentral.amazon.com/help/hub/reference/external/G5KW835AHDJCH8W) | Amazon page, United States | 2026-11-08 |
| [Dimensional weight](https://sellercentral.amazon.com/help/hub/reference/external/G53Z9EKF8VVZVH29) | Amazon page, United States | 2026-11-08 |
| [Inbound defect fees](https://sellercentral.amazon.com/help/hub/reference/external/GL5XA3MNXAJKJE8E) | Amazon page, United States | 2026-11-08 |
| [Amazon Warehousing and Distribution fees](https://sellercentral.amazon.com/help/hub/reference/external/GAYG62Q3MPE6STFS) | Amazon page, United States | 2026-11-08 |
| [Amazon Warehousing and Distribution](https://sell.amazon.com/programs/warehousing) | Amazon page, United States | 2026-11-08 |
| [New Seller Incentives](https://sellercentral.amazon.com/help/hub/reference/external/GXMJ38VA95GUN5XU) | Amazon page, United States | 2026-11-08 |
| [Small-parcel delivery to Amazon](https://sellercentral.amazon.com/help/hub/reference/external/200280260) | Amazon page, United States | 2026-11-08 |
| [Truckload delivery to Amazon](https://sellercentral.amazon.com/help/hub/reference/external/200280270) | Amazon page, United States | 2026-11-08 |
| [Shipping and routing requirements](https://sellercentral.amazon.com/help/hub/reference/external/G200141510) | Amazon page, United States | 2026-11-08 |
| [2026 Updates to US Referral and Fulfillment by Amazon Fees (Amazon's announcement in Seller Forums)](https://sellercentral.amazon.com/seller-forums/discussions/t/f3fa3211-820b-4e2e-a023-158a9cf55f99) | Amazon page, United States | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests pin Amazon's placement fee table row by row as read, and check exact money and weights, inclusive band edges, size tiers from dimensions against Amazon's own examples (with the 2-inch minimum and the 2027 table), totals per option, the cheapest and how sure, the break-even, options Amazon does not offer, credits, refusals, Amazon's carton plan examples, rates and AWD.

What its test suite asserts:

- Amazon's placement fee table is pinned row by row as read on 2026-11-08, with band edges inclusive at the top and the size tiers from dimensions checked against Amazon's own examples.
- Totals per option, the cheapest and how sure, the break-even fee, options Amazon does not offer, mixed plans, credits and dates are checked, and inputs it cannot price are refused naming the field.
- Amazon's carton plan examples for the five-identical-cartons rule, the rates lookup, AWD and the worked examples are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Inbound placement fee calculator tool](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/).

## Questions

### Is there any AI in the inbound placement fee calculator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the inbound placement fee calculator refuse to answer?

Amazon publishes the placement fee as a range per unit that varies with the inbound location and capacity. The fee Send to Amazon shows for your plan is the one you are charged; enter it for an exact answer. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Inbound placement fee calculator tool](https://krishnachagti-sudo.github.io/toll-preview/inbound-placement-fee-calculator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/inbound-placement-fee-calculator/  
Data as of: 2026-11-04
