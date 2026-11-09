# How the eBay transaction report flattener works

Every row with a sale's order number (the sale, its fees, its shipping label, refunds and claims) is folded into that sale, and what you kept is the sum of eBay's own Net amount on those rows, as written; the proof checks that every row's Net amount is accounted for to the cent. Flattening costs per started block of 2,500 sales.

## How does it work?

1. Lines above the header are skipped, the delimiter is found from the header, and missing columns and bad cells are named with their line.
2. Each column is found by eBay's help name first, then by a word rule (any heading with "fee" is a fee column, kept by its own name), or by the columns you name. eBay does not publish the exact header text, so every column is reported with how it was found.
3. Amounts are read exactly: dashes are blank, currency signs, parentheses, digit grouping and decimal commas are read.
4. Row types are read by eBay's own words (order, refund, claim, payment dispute, hold, shipping label, other fee, charge, adjustment, transfer, payout); a type no rule knows is kept, counted with its order and named in the warnings.
5. Rows are joined by order number into one sale; what you kept is the sum of the Net amount of its rows.

> Step 6, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/ebay-transaction-report-flattener/#what) below.

## What does it not cover?

- A report it cannot read is a named error, and the charge is refunded.
- It uses eBay's own Net amounts as written and estimates nothing; your costs and outside labels are yours.
- Not tax or accounting advice. Files are processed in memory and not kept.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 6 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Uses no rates: it reads your own report. eBay's field names and row types were read on eBay's help pages on 2026-11-08, and the pages are checked daily for changes.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check CSV reading with line numbers, every amount and date form, eBay's column names and the word rule, row types, the US sample folded from 17 rows into 5 sales to the cent with its proof, costs and outside labels, spreading by gross, fee signs, the UK sample in pounds and the files.

- [eBay Help (US): Reconciling your eBay sales transactions](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847), see the document, read 2026-11-08
- [eBay Help (UK): Reconciling your eBay sales transactions](https://www.ebay.co.uk/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions?id=4847), see the document, read 2026-11-08
- [eBay Help (US): Earnings report](https://www.ebay.com/help/selling/fees-credits-invoices/reconciling-ebay-sales-transactions/earnings-report?id=5481), see the document, read 2026-11-08
- [eBay Help (US): Using the Payments tab in Seller Hub](https://www.ebay.com/help/fees-billing/payouts-payments-paid/seller-hub-payouts-tab?id=4798), see the document, read 2026-11-08
- [eBay Help (US): Selling fees](https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822), see the document, read 2026-11-08
- [IRS: Estimated tax FAQ](https://www.irs.gov/faqs/estimated-tax/individuals/individuals-2), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the ebay transaction report flattener compute?

Upload the transaction report from Seller Hub and the tool gives one row per sale: item, gross, shipping charged, every fee column by its own name, the shipping label and ad fee rows folded in by order number, refunds and claims, and what you kept, with totals by year and month.

**In detail: operations, inputs and outputs**

Your costs per item and labels bought outside eBay can be added to give profit per sale.

Operations (the op field):

- `preview`: Returns the answer, the totals by year, the proof, the columns found and the first sales. Free.
- `flatten`: Returns every sale, the totals by month, the money moved and the files: one row per sale, years, months and the rows with no order number. The same file within 7 days is free.

Inputs:

- `file or text`: The report as base64 or CSV text, up to 5 MB and 100,000 rows.
- `columns`: Only when a column is not found: the heading in your file for a field.
- `currency, decimal, dateOrder`: The payout currency when the report has no such column, the decimal mark, and month-first or day-first slash dates.
- `costs, labels`: Your cost per unit by Item ID or SKU (up to 5,000), and labels bought outside eBay by order number.
- `spread`: Label and fee rows with no order number: listed apart (the default) or spread over the sales in proportion to gross, each share marked.

Outputs:

- answer: rows, sales, gross, fees, labels, ad and other fees, refunds and claims, and net
- totals, years, the proof, the columns with how each was found, row types, unmatched rows and warnings
- flatten: sales, months, money moved and the CSV files

**Every step in full (6) and the rules**

1. Lines above the header are skipped, the delimiter is found from the header, and missing columns and bad cells are named with their line.
2. Each column is found by eBay's help name first, then by a word rule (any heading with "fee" is a fee column, kept by its own name), or by the columns you name. eBay does not publish the exact header text, so every column is reported with how it was found.
3. Amounts are read exactly: dashes are blank, currency signs, parentheses, digit grouping and decimal commas are read. Dates in ISO, month names or slashes; mixed slash orders are refused.
4. Row types are read by eBay's own words (order, refund, claim, payment dispute, hold, shipping label, other fee, charge, adjustment, transfer, payout); a type no rule knows is kept, counted with its order and named in the warnings.
5. Rows are joined by order number into one sale; what you kept is the sum of the Net amount of its rows. Fee signs are read as written; fee columns that do not add up to gross less net are shown, not absorbed.
6. The proof checks that every row's Net amount is accounted for, to the cent.

**eBay's report help.**

The field names and row types are read from eBay's help pages for the US and UK, read on 2026-11-08.

## Which edge cases does it handle?

**The edge cases (3)**

- A UK report in pounds with day-month-year dates and the Regulatory operating fee is read the same way.
- A bulk label row with no order number is listed apart, or spread over the sales by gross when asked.
- Cells a spreadsheet would read as a formula are guarded.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Preview a made-up US report: the totals, the proof and the first sales**

Preview a made-up US report: the totals, the proof and the first sales

| Result | Value |
| --- | --- |
| answer | Your report's 17 rows became 5 sales: gross $245.50, fees $36.52, labels $42.29, ad and other fees $6.77, refunds and claims $43.00, net $121.92; 1 label row had no order number. |

**The input**

```json
op: "preview"
text: "Transaction date,Type,Order ID,Item ID,Item title,Quantity,Item subtotal,Shipping and handling,Seller collected tax,Final value fee - fixed,Final value fee - variable,International fee,Gross transaction amount,Net amount,Payout ID,Payout date,Description\r\n2025-12-18,Order,01-11111-00001,110000000001,Vintage Pyrex mixing bowl,1,24.00,8.50,0.00,-0.40,-4.31,--,32.50,27.79,P-0001,2025-12-22,\r\n2025-12-19,Shipping label,01-11111-00001,--,--,--,--,--,--,--,--,--,--,-6.85,P-0001,2025-12-22,USPS Ground Advantage\r\n2026-10-03,Order,02-22222-00002,110000000002,\"Fleece jacket, size M\",1,15.00,9.00,0.00,-0.40,-3.18,--,24.00,20.42,P-0102,2026-10-06,\r\n2026-10-03,Other fee,02-22222-00002,--,--,--,--,--,--,--,--,--,--,-1.82,P-0102,2026-10-06,Promoted Listings - General fee\r\n2026-10-04,Shipping label,--,--,--,--,--,--,--,--,--,--,--,-18.94,P-0102,2026-10-06,Bulk shipping labels (4)\r\n2026-10-05,Order,03-33333-00003,--,--,3,40.00,6.00,0.00,-0.40,-6.10,--,46.00,39.50,P-0103,2026-10-08,\r\n2026-10-05,Order,03-33333-00003,110000000003,Minifigure lot,2,--,--,--,--,--,--,--,--,P-0103,2026-10-08,\r\n2026-10-05,Order,03-33333-00003,110000000004,Baseplate 32x32,1,--,--,--,--,--,--,--,--,P-0103,2026-10-08,\r\n2026-10-10,Payout,--,--,--,--,--,--,--,--,--,--,--,-57.92,P-0103,2026-10-10,Payout to checking ...1234\r\n2026-10-12,Order,04-44444-00004,110000000005,Camera lens 50mm,1,120.00,0.00,0.00,-0.40,-15.90,-1.98,120.00,101.72,P-0104,2026-10-15,\r\n2026-10-12,Shipping label,04-44444-00004,--,--,--,--,--,--,--,--,--,--,-9.40,P-0104,2026-10-15,USPS Priority Mail\r\n2026-10-20,Refund,04-44444-00004,110000000005,Camera lens 50mm,1,--,--,--,--,--,--,-20.00,-20.00,P-0105,2026-10-23,Partial refund\r\n2026-10-31,Other fee,--,--,--,--,--,--,--,--,--,--,--,-4.95,P-0106,2026-11-03,Store subscription fee\r\n2026-11-02,Order,05-55555-00005,110000000006,\"Board game, sealed\",1,18.00,5.00,0.00,-0.40,-3.05,--,23.00,19.55,P-0106,2026-11-03,\r\n2026-11-02,Shipping label,05-55555-00005,--,--,--,--,--,--,--,--,--,--,-7.10,P-0106,2026-11-03,USPS Ground Advantage\r\n2026-11-15,Claim,05-55555-00005,110000000006,\"Board game, sealed\",1,--,--,--,--,--,--,-23.00,-23.00,P-0107,2026-11-18,Item not received\r\n2026-11-20,Adjustment,--,--,--,--,--,--,--,--,--,--,--,5.00,P-0107,2026-11-18,Credit from eBay\r\n"
```

## How is it tested?

**What its test suite asserts (3)**

- Every fact is dated and read on eBay's own help pages on 2026-11-08.
- The US sample folds 17 rows into 5 sales with totals and the proof to the cent; the UK sample is read in pounds.
- Fee columns that do not add up to gross less net are shown, not absorbed.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the eBay transaction report flattener tool](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/).

## Questions

### Is there any AI in the ebay transaction report flattener answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the ebay transaction report flattener refuse to answer?

A report it cannot read is a named error, and the charge is refunded. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the eBay transaction report flattener tool](https://krishnachagti-sudo.github.io/toll-preview/ebay-transaction-report-flattener/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/ebay-transaction-report-flattener/  
Data as of: 2026-11-04
