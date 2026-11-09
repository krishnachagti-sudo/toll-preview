# How the low-inventory-level fee is estimated: FBA method

A SKU pays only when both days-of-supply windows are under 28 days; the larger sets the band (0 to 14 days, 14 to 21 days, 21 to 28 days) and the rate per unit shipped, such as $0.36 for large standard up to 3 lb at 21 to 28 days. The 2026 rule (30- and 90-day history) runs through January 31, 2027; from February 1, 2027 the 2027 rule uses 28 days before and after the weekly check.

## What does the amazon low-inventory-level fee and reorder planner compute?

For each SKU and the date of a weekly check, the tool picks Amazon's rule in force (the 2026 rule through January 31, 2027, the 2027 rule from February 1, 2027), works out the days of supply in each window, applies the exemptions, and gives whether the low-inventory-level fee applies, the rate per unit and about how much this week's shipped units pay, and the stock that would clear it. Given daily sales and stock on hand, it also plans the next shipment: when to send it, how many units, and the fee a late shipment would cost. An estimate from the rules and rates Amazon publishes in its Seller Central help (United States). What Amazon charges is in FBA Inventory, SKU Economics and Transaction View.

Operations (the op field):

- `plan`: Checks one or more SKUs (as a list or a CSV) for the week of the date: the rule, the windows, the exemptions, the status (fee, exempt, no fee or not charged), the rate, the fee on this week's units and what clears it; with stock and lead times, the reorder plan. Returns a summary and a CSV.
- `rates`: Returns both rate tables, the exemptions, the key dates, the size tiers and the Seller Central pages they were read from. Free.

Inputs:

- `date, rule`: The day of the weekly check, written like 2026-11-09; the rule follows the date unless rule ("2026" or "2027") is given.
- `skus or csv, defaults`: The SKUs as a list or as a CSV with named headers, and default values for any column left out. Every SKU needs its size tier.
- `tier, weightLb`: The size tier and, for large standard, the shipping weight, which picks the rate row (up to 3 lb, or over 3 lb to 20 lb).
- `dos30, dos90, avgInventory30/90, avgShipped30/90, unitsShipped30/90`: For the 2026 rule, each window given one way: Amazon's days of supply, or the average units on hand with the average shipped a day or the units shipped in the window.
- `inventory, avgDailyBefore, avgDailyAfter, unitsBefore, unitsAfter`: For the 2027 rule: the units at the check, and the sales in the 28 days before and after it.
- `unitsThisWeek, unitsLast7, grocery, awdSharePct, sellerFirstReceived, newSelection, productFirstReceived, unitsSinceFirstReceived`: The units the fee applies to this week, and the facts the exemptions turn on.
- `dailySales, onHand, inboundUnits, inboundArrives, prepDays, transitDays, receivingDays, supplierDays, safetyDays, coverDays, plan`: For the reorder plan: sales a day, stock now, a shipment already on its way, the lead times, extra safety days, how many days a shipment should cover (60 by default, at least 28 plus the safety days), and plan: false to skip it.

Outputs:

- answer and summary: how many SKUs pay, are exempt or are not charged, the fee this week and how many need a shipment now
- results: for each SKU the windows, the days of supply that governs, the band, the rate, the fee on this week's units, each exemption checked and the units that clear the fee
- plan: the reorder point, the date to send by (and order by, given supplier days), the units to send, when they arrive, and the weekly checks that fall under 28 days before then
- csv: one line per SKU
- rates: both rate tables, the exemptions, the dates and the sources

## How is it calculated, step by step?

1. The rule is the one in force on the date: the 2026 rule through January 31, 2027, the 2027 rule from February 1, 2027. An explicit rule wins.
2. Under the 2026 rule each window's days of supply is the average units on hand divided by the average units shipped a day, over 30 and over 90 days (or Amazon's own figure). Under the 2027 rule it is the units at the check divided by the average sold a day in the 28 days before, and in the 28 days after.
3. The fee applies only when both windows are under 28 days. The larger of the two sets the band (0 to 14 days, 14 to 21 days, 21 to 28 days). A window with no shipments gives no figure and no fee.
4. The rate comes from the table for the rule and the size tier (and, for large standard, the weight row). Under the 2026 rule extra-large items are not charged.
5. Exemptions: under 20 units shipped in the past 7 days, grocery, 70% or more auto-replenished through AWD over the prior 90 days, a new Professional seller for 365 days, and the New Selection programs (180 days for the earlier program under the 2026 rule; 120 days or 200 units for the 2026 program).
6. The fee this week is the rate times the units shipped this week. The units that clear it are 28 days at the average daily sales: under the 2026 rule as a 30-day average on hand, under the 2027 rule as units at the check.
7. The plan projects stock day by day at steady sales (with any inbound shipment added on its day), finds the first day it falls under the 28-day line plus safety days, and counts back the prep, transit and receiving days to the send-by date. The units to send bring stock up to the days of cover when they arrive, rounded up.
8. When the send-by date has passed, the plan sends today and lists each weekly check before the units arrive that falls under 28 days, with its band.

**Amazon's pages.**

The rates, the 28-day line, the windows, the exemptions and the dates were read on November 8, 2026 from Amazon's Seller Central help pages for the United States, with the sentences each rests on quoted. Amazon's own worked examples for both rules are reproduced in the tests.

## Which edge cases does it handle?

- Both windows must be under 28 days; one under and one over is no fee.
- January 31, 2027 is checked under the 2026 rule and February 1, 2027 under the 2027 rule.
- Large standard at exactly 3 lb takes the up-to-3-lb row.
- A window given two ways, a CSV with a bad number, or a SKU with no size tier is refused, naming the field or the line.
- Daily sales of 0 gives no reorder plan, and says so.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**One SKU this week under the 2026 rule: the fee, and when to send how many**

```json
{
  "op": "plan",
  "date": "2026-11-09",
  "skus": [
    {
      "sku": "MUG-12OZ",
      "tier": "large-standard",
      "weightLb": 1.2,
      "avgInventory30": 240,
      "unitsShipped30": 360,
      "avgInventory90": 280,
      "unitsShipped90": 990,
      "unitsLast7": 84,
      "onHand": 230
    }
  ],
  "prepDays": 3,
  "transitDays": 6,
  "receivingDays": 7,
  "coverDays": 60,
  "supplierDays": 30
}
```

One SKU this week under the 2026 rule: the fee, and when to send how many

| Result | Value |
| --- | --- |
| answer | MUG-12OZ pays Amazon's low-inventory-level fee: days of supply 25.5 (30-day 20.0, 90-day 25.5), so $0.36 a unit for Large standard up to 3 lb, about $30.24 on 84 units this week; to stop it, keep the 30-day average at 336 units on hand (28 x 12 a day). |
| rule | 2026 rule (historical days of supply, 30 and 90 days) |
| days of supply | 25.5 (short 20.0, long 25.5) |
| band and rate | 21 to 28 days: $0.36 a unit, Large standard up to 3 lb |
| fee this week | $30.24 on 84 units |
| to clear the fee | keep the 30-day average at 336 units on hand (28 x 12 a day) |
| send | 682 units on November 9, 2026, arriving November 25, 2026 |

**Amazon's own 2027 Example 4: large bulky, 120 units, 10 a day before, 8 after**

```json
{
  "op": "plan",
  "date": "2027-02-08",
  "skus": [
    {
      "sku": "BULKY-1",
      "tier": "large-bulky",
      "inventory": 120,
      "avgDailyBefore": 10,
      "avgDailyAfter": 8,
      "unitsLast7": 70
    }
  ],
  "plan": false
}
```

Amazon's own 2027 Example 4: large bulky, 120 units, 10 a day before, 8 after

| Result | Value |
| --- | --- |
| answer | BULKY-1 pays Amazon's low-inventory-level fee: days of supply 15.0 (trailing 12.0, following 15.0), so $1.15 a unit for Large/Extra Large Bulky up to 50 lb, about $64.40 on 56 units this week; to stop it, have 280 units at the check (28 x 10 a day, Amazon's own advice). |
| rule | 2027 rule (days of supply, 28 days before and after the weekly check) |
| days of supply | 15 (trailing 12.0, following 15.0) |
| band and rate | 14 to 21 days: $1.15 a unit, Large/Extra Large Bulky up to 50 lb |
| fee this week | $64.40 on 56 units |
| to clear the fee | have 280 units at the check (28 x 10 a day, Amazon's own advice) |

**A four-SKU weekly review file**

```json
{
  "op": "plan",
  "date": "2026-11-09",
  "csv": "sku,size_tier,shipping_weight_lb,avg_inventory_30,units_shipped_30,avg_inventory_90,units_shipped_90,units_last_7d,daily_sales,on_hand,new_selection,product_first_received\r\nMUG-12OZ,large-standard,1.2,240,360,280,990,84,12,230,,\r\nRUG-5X7,large-bulky,14,150,90,170,300,21,3,140,,\r\nCANDLE-SM,small-standard,0.6,20,45,25,150,10,1.5,18,,\r\nLAMP-NEW,large-standard,4.5,60,120,60,120,28,4,55,2026,2026-09-20",
  "prepDays": 3,
  "transitDays": 6,
  "receivingDays": 7,
  "coverDays": 60
}
```

A four-SKU weekly review file

| Result | Value |
| --- | --- |
| answer | 4 SKUs under Amazon's 2026 rule for the week of November 9, 2026: 1 pays the low-inventory-level fee (about $30.24 this week), 1 exempt, 2 not charged; 3 need a shipment sent now. |
| MUG-12OZ | fee |
| RUG-5X7 | no-fee |
| CANDLE-SM | exempt |
| LAMP-NEW | no-fee |

## What does it not do?

- The reorder plan assumes the steady daily sales you give it. Amazon does not publish which day of the week it checks inventory, so dates are to the day of your own plan.
- US marketplace only. Rules and rates read November 8, 2026. Not financial or accounting advice.
- It estimates the fee from the figures you give; what Amazon charges is in your Seller Central reports.

## Where does the data come from, and how fresh is it?

Amazon's rules, rates, exemptions and dates were read on November 8, 2026 from Seller Central help (United States). They change only by hand, with the tests that pin each rate and Amazon's own examples.

- [Amazon Seller Central help: Low-inventory-level fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH)
- [Amazon Seller Central help: Low-inventory-level fee 2027 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GFU8NTVGHP2JQLCR)
- [Amazon: 2027 US Referral and Fulfillment by Amazon fees (read November 8, 2026)](https://amazon.com/selling-fee-changes)
- [Amazon Seller Central help: Product size tiers (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GG5KW835AHDJCH8W)
- [Amazon Seller Central help: Unified monthly storage fee (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GVZX6EAEL2KZ3SGA)
- [Amazon Seller Central help: New Selection Program - 2026 (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GB36EVK8V94P8J5D)
- [Amazon Seller Central help: FBA New Selection (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GWHQRT98SAZC29VQ)
- [Amazon Seller Central help: FBA inventory overview (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GTMXYZN64UJL7TT6)
- [Amazon Seller Forums: Low-inventory-level fee further explained (Amazon staff post) (read November 8, 2026)](https://sellercentral.amazon.com/seller-forums/discussions/t/aa9f98e5-fa91-4949-af8f-6cf918c86a77)

Amazon's rules, rates, exemptions and dates were read on November 8, 2026 from Seller Central help (United States). They change only by hand, with the tests that pin each rate and Amazon's own examples.

Amazon low-inventory-level fee and reorder planner: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [Amazon Seller Central help: Low-inventory-level fee](https://sellercentral.amazon.com/help/hub/reference/external/GV43F6S76Y9DHYRH) | Seller Central help, United States | 2026-11-08 |
| [Amazon Seller Central help: Low-inventory-level fee 2027](https://sellercentral.amazon.com/help/hub/reference/external/GFU8NTVGHP2JQLCR) | Seller Central help, United States | 2026-11-08 |
| [Amazon: 2027 US Referral and Fulfillment by Amazon fees](https://amazon.com/selling-fee-changes) | Seller Central help, United States | 2026-11-08 |
| [Amazon Seller Central help: Product size tiers](https://sellercentral.amazon.com/help/hub/reference/external/GG5KW835AHDJCH8W) | Seller Central help, United States | 2026-11-08 |
| [Amazon Seller Central help: Unified monthly storage fee](https://sellercentral.amazon.com/help/hub/reference/external/GVZX6EAEL2KZ3SGA) | Seller Central help, United States | 2026-11-08 |
| [Amazon Seller Central help: New Selection Program - 2026](https://sellercentral.amazon.com/help/hub/reference/external/GB36EVK8V94P8J5D) | Seller Central help, United States | 2026-11-08 |
| [Amazon Seller Central help: FBA New Selection](https://sellercentral.amazon.com/help/hub/reference/external/GWHQRT98SAZC29VQ) | Seller Central help, United States | 2026-11-08 |
| [Amazon Seller Central help: FBA inventory overview](https://sellercentral.amazon.com/help/hub/reference/external/GTMXYZN64UJL7TT6) | Seller Central help, United States | 2026-11-08 |
| [Amazon Seller Forums: Low-inventory-level fee further explained (Amazon staff post)](https://sellercentral.amazon.com/seller-forums/discussions/t/aa9f98e5-fa91-4949-af8f-6cf918c86a77) | Seller Central help, United States | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests pin Amazon's rates, threshold, exemptions and dates as read, and reproduce Amazon's own examples for both rules. They check that both windows must be under 28 days, the band edges, no shipments, the size tiers and weights, the rule change date, each exemption, the weekly fee and the units to clear it, the planner (send-by, order-by, units, a late plan and its fee) and the CSV.

What its test suite asserts:

- Amazon's rates, the 28-day line, the exemptions and the dates are pinned as read on 2026-11-08, and Amazon's own worked examples for the 2026 and 2027 rules are reproduced.
- Both windows must be under 28 days, the larger sets the band, the band edges are exact, the rule changes on February 1, 2027, and each exemption and size tier is checked.
- The weekly fee, the units that clear it, the planner (send-by, order-by, units, a late plan and its fee), the CSV and the worked examples are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Amazon low-inventory-level fee and reorder planner tool](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/).

## Questions

### Is there any AI in the amazon low-inventory-level fee and reorder planner answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the amazon low-inventory-level fee and reorder planner refuse to answer?

The reorder plan assumes the steady daily sales you give it. Amazon does not publish which day of the week it checks inventory, so dates are to the day of your own plan. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Amazon low-inventory-level fee and reorder planner tool](https://krishnachagti-sudo.github.io/toll-preview/amazon-low-inventory-fee-calculator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/amazon-low-inventory-fee-calculator/  
Data as of: 2026-11-04
