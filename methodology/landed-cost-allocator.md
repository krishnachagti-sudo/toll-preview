# How the landed cost allocator works: charges to SKUs

Each charge is split over the PO lines in proportion to the basis you choose (value, weight, volume, quantity, equal, specific amounts or a mix) by the largest remainder method, so the line shares add back to the invoice to the cent; the landed cost per unit is the product cost plus the line's shares, over its units. Shipments of 3 lines or fewer are free.

## How does it work?

1. Amounts are read exactly into integers: product cost in ten-thousandths of a unit (unit prices may have four decimals), charges in cents.
2. Each charge's basis is what you choose; the default by kind is freight by volume, duty by value, brokerage by value, insurance by value, fees by value, discount by value, other by value.
3. Each line's weight in the basis is its share of the total; the charge in cents times each weight is divided by the total weight, the whole cents are given out, and the cents left over go to the lines with the largest remainders (ties to the larger weight, then line order).
4. A mixed charge is split into its parts by percent first, each part by its own basis. A discount is a negative charge.
5. The landed cost per unit is the line's product cost plus its shares, divided by its units, shown to four decimals.

> Step 6, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/landed-cost-allocator/#what) below.

## What does it not cover?

- A line or charge the basis cannot be applied to is refused with the line and field.
- Every freight, duty and fee amount is yours: it uses no rates. For US duty use the broker's entry summary.
- How you book a late invoice is for you and your accountant. Not tax, accounting or customs advice.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 9 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The engine uses no rates or outside data. The facts the pages quote were read on 2026-11-08 on the publishers' own pages, which are checked daily for changes.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check that largest remainder shares add back exactly with ties broken by weight then order, a worked shipment to the cent, every basis, refusals, late invoices, the CSV and formula workbook, the Shopify round trip, and the price of $1.50 per 50 lines with 3 lines free.

- [Shopify Help: Transitioning from Stocky](https://help.shopify.com/en/manual/inventory-and-locations/transitioning-from-stocky), see the document, read 2026-11-08
- [Shopify Help: Using CSV files to import and export products](https://help.shopify.com/en/manual/products/import-export/using-csv), see the document, read 2026-11-08
- [IRS Publication 538, Accounting Periods and Methods](https://www.irs.gov/publications/p538), see the document, read 2026-11-08
- [Intuit: Calculate landed cost in QuickBooks Desktop Enterprise](https://quickbooks.intuit.com/learn-support/en-us/help-article/set-inventory-lists/calculate-landed-cost-quickbooks-enterprise/L4D21nWRC_US_en_US), see the document, read 2026-11-08
- [Stockroom app listing](https://apps.shopify.com/stock-room), see the document, read 2026-11-08
- [Landed Cost Receiving app listing](https://apps.shopify.com/landed-cost-receiving), see the document, read 2026-11-08
- [Landrio app listing](https://apps.shopify.com/landedwise), see the document, read 2026-11-08
- [SKU.io pricing](https://www.sku.io/pricing), see the document, read 2026-11-08
- [Prediko pricing](https://www.prediko.io/pricing), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the landed cost allocator compute?

Enter a shipment's PO lines (SKU, quantity, unit cost and, where a basis needs them, weight, volume or dimensions) and its invoices, and the tool spreads each invoice over the lines, gives the landed cost per unit of every SKU and adds every invoice back exactly.

**In detail: inputs and outputs**

A late invoice can be split between units still on hand and units already sold. It writes a CSV, a spreadsheet with live formulas and, from your Shopify product export, the same file back with only Cost per item changed.

Inputs:

- `lines or linesCsv`: Up to 2,000 PO lines: sku, title, qty, unitCost (up to four decimals), and optionally value, weight (kg or lb, per unit or per line), CBM, dimensions in cm, and units on hand.
- `charges`: Up to 40 invoices, each with a kind (freight, duty, brokerage, insurance, fees, discount, other), an amount and a basis (value, weight, volume, quantity, equal, specific, mixed), a mix of bases by percent, amounts per SKU, the lines it applies to, and whether it is late.
- `shipment`: A PO or container reference, needed over 3 lines: re-runs for the same shipment are free.
- `latePolicy, currency, shopifyExport`: For a late invoice, split by units on hand (onhand) or across all units (split); the currency code; and a Shopify product export to fill.

Outputs:

- answer: the landed cost per unit of each SKU, the charges on the goods and their share
- rows: per SKU the product cost, each charge's share and the landed cost per unit; charges: each invoice with its split
- late (when a late invoice is given): what goes to stock on hand and what goes to cost of goods sold
- compare: each charge under the other bases, and the files

**Every step in full (6) and the rules**

1. Amounts are read exactly into integers: product cost in ten-thousandths of a unit (unit prices may have four decimals), charges in cents. More decimals than allowed are refused, never rounded.
2. Each charge's basis is what you choose; the default by kind is freight by volume, duty by value, brokerage by value, insurance by value, fees by value, discount by value, other by value. Volume comes from CBM or from the dimensions in cm; weight from kg or lb, per unit or per line.
3. Each line's weight in the basis is its share of the total; the charge in cents times each weight is divided by the total weight, the whole cents are given out, and the cents left over go to the lines with the largest remainders (ties to the larger weight, then line order). The shares add back to the invoice exactly.
4. A mixed charge is split into its parts by percent first, each part by its own basis. A discount is a negative charge.
5. The landed cost per unit is the line's product cost plus its shares, divided by its units, shown to four decimals.
6. A late invoice is split between units on hand and units sold: the on-hand part re-costs the stock, and the sold part is reported as a cost of goods sold variance.

**What landed cost includes.**

IRS Publication 538 says the cost of merchandise purchased is the invoice price less appropriate discounts plus transportation or other charges incurred in acquiring the goods (read 2026-11-08).

## Which edge cases does it handle?

**The edge cases (4)**

- A charge on a basis a line lacks (no weight given) names the line instead of guessing.
- Ties in the remainder go to the larger weight, then to line order, so the same input splits the same way.
- A Shopify export comes back with only Cost per item changed, for whole products only.
- Cells that a spreadsheet would read as a formula are made plain text.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A 3-SKU ocean shipment: freight by CBM, duty by value, the broker fee per line**

A 3-SKU ocean shipment: freight by CBM, duty by value, the broker fee per line

| Result | Value |
| --- | --- |
| answer | Landed cost per unit is $3.8374 for MUG-12, $5.1997 for TEE-M, $6.0885 for CANDLE-8: $3,337.47 of charges on $7,640.00 of goods (43.7%), every charge split to the cent and added back to its invoice. |

**The input**

```json
{
  "shipment": "PO-1042",
  "lines": [
    {
      "sku": "MUG-12",
      "title": "Ceramic mug 12 oz",
      "qty": 600,
      "unitCost": "2.10",
      "unitWeightKg": 0.42,
      "unitCbm": 0.0018
    },
    {
      "sku": "TEE-M",
      "title": "Cotton T-shirt M",
      "qty": 1200,
      "unitCost": "3.85",
      "unitWeightKg": 0.18,
      "unitCbm": 0.0009
    },
    {
      "sku": "CANDLE-8",
      "title": "Soy candle 8 oz",
      "qty": 400,
      "unitCost": "4.40",
      "unitWeightKg": 0.35,
      "unitCbm": 0.0011
    }
  ],
  "charges": [
    {
      "name": "Ocean freight",
      "kind": "freight",
      "amount": "1840.00",
      "basis": "volume"
    },
    {
      "name": "Duty (entry summary)",
      "kind": "duty",
      "amount": "1312.47",
      "basis": "value"
    },
    {
      "name": "Customs broker",
      "kind": "brokerage",
      "amount": "185.00",
      "basis": "equal"
    }
  ]
}
```

**More worked examples (1)**

**A late drayage invoice on the same shipment**

A late drayage invoice on the same shipment

| Result | Value |
| --- | --- |
| answer | Landed cost per unit is $4.1226 for MUG-12, $5.3219 for TEE-M, $6.3261 for CANDLE-8: $3,750.27 of charges on $7,640.00 of goods (49.1%), every charge split to the cent and added back to its invoice. The late $412.80 adds $238.85 to the 1,540 units still on hand and $173.95 to cost of goods sold for units already sold. |

**The input**

```json
shipment: "PO-1042"
lines: 3 items
charges: 4 items
```

## How is it tested?

**What its test suite asserts (3)**

- Largest remainder shares add back to each invoice exactly, with ties broken by weight then line order.
- A worked shipment is checked to the cent on every basis, and late invoices split between stock on hand and cost of goods sold.
- The CSV adds up and is formula-safe; a Shopify export comes back with only Cost per item changed.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Landed cost allocator tool](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/).

## Questions

### Is there any AI in the landed cost allocator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the landed cost allocator refuse to answer?

A line or charge the basis cannot be applied to is refused with the line and field. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Landed cost allocator tool](https://krishnachagti-sudo.github.io/toll-preview/landed-cost-allocator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/landed-cost-allocator/  
Data as of: 2026-11-04
