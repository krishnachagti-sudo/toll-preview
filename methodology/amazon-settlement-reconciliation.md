# How Amazon settlement reconciliation splits at month end

The rows of each settlement are added in whole cents and must equal its total-amount; the total is checked against the bank deposits you give, and each row goes to the month of its posted date. Amazon's payout period is 14 days, so a settlement that crosses a month end is split, with 13 lines and a balanced journal per month.

## What does the amazon settlement reconciliation compute?

Upload an Amazon Flat File V2 settlement report and the tool proves its rows add up to the settlement's total-amount, ties that total to the money that reached your bank, and splits the settlement at each month end (or your own cut-offs) by posted date. The paid run places every amount-type and amount-description on a line (product sales, shipping and gift wrap charged, promotions, refunds, sales tax collected, tax withheld by amazon, selling fees, fba fees, advertising, subscription, reimbursements, reserve held and released, other) and builds one balanced journal per month through a clearing account, with an import file for QuickBooks Online or Xero.

Operations (the op field):

- `check`: Returns, per settlement, the proof (rows against total-amount), the bank tie with Amazon's own reasons for a gap, the parts per month with their net and share, the reserve held and released, and the month-end checklist. Free.
- `reconcile`: Does what check does and also returns each month's totals by line, every amount-type and amount-description with the line it went to and the rule, the balanced journals, the account names, and three files: the QuickBooks Online or Xero import, a summary per month and every row with its line. The same file again within 7 days is free.

Inputs:

- `file or text`: The settlement report as base64 or as text, one of the two, up to 5 MB, 100,000 rows and 60 settlements. Tabs, commas or semicolons.
- `columns`: Only for a renamed or translated copy: the heading in your file for any of the 24 Flat File V2 columns, for example { "amount": "Betrag" }.
- `decimal, dateOrder, currency`: point or comma when the file cannot show its decimal mark; mdy (default) or dmy for slash dates; and the currency of a copy with no currency column (default USD).
- `timeZone, cutoff`: Split by posted-date-time (UTC) converted to an IANA time zone instead of the posted-date column; or split at your own period ends (up to 24 dates) instead of month ends.
- `deposits, bankCurrency, bankDate`: What reached the bank: one amount, a list (up to 10), or amounts per settlement-id; the bank account's currency when Amazon converted the payout; and the day the money arrived.
- `map`: Move a value to another line: { "\<amount-type\>/\<amount-description\>": line } or { "\<amount-description\>": line }.
- `ledger, accounts, feesAs, transfer, dates`: For reconcile: quickbooks-online (default) or xero; account names per line, clearing and bank; fees as expenses (default) or contra-revenue; whether to add the journal moving the deposit to the bank; and mdy, dmy or iso dates in the import file.

Outputs:

- answer: the total, whether the rows add up to it, whether it ties to the bank, and the share posted in each month
- settlements: per settlement the dates, total, rowsAddUpTo, proof, difference, bank tie, straddles, periods, reserve and checklist (amounts as decimal strings)
- warnings: a proof gap, values booked to Other, rows with no posted date
- values, ledger, accounts, journals and files (reconcile only)

## How is it calculated, step by step?

1. The first line is matched to Amazon's Flat File V2 column names (GET\_V2\_SETTLEMENT\_REPORT\_DATA\_FLAT\_FILE\_V2). A file with no settlement-id or amount column, or no posted-date and no posted-date-time, is refused with how to name the column.
2. The decimal mark is read from the amounts: Amazon writes them in the marketplace's local format (95,00 in the EU). A file that mixes 12.50 and 12,50 is refused until you say which. Amounts are kept as whole minor units of the currency, so nothing is lost to rounding.
3. Dates are read as Amazon writes them: posted-date as MM/DD/YY, posted-date-time as YYYY-MM-DD HH:MM:SS UTC, and also ISO and DD.MM.YYYY. A settlement with two different total-amount values, or two different start, end or deposit dates, is refused, naming both.
4. The proof: every row with an amount is added and compared with total-amount to the cent. The summary row, which carries the totals and no amount, is not counted.
5. The tie: total-amount is compared with the bank deposits you give. One deposit short gets Amazon's note that a payment can come from two payers; a bank date more than five business days after the deposit-date, or before it, is noted; a payout in another currency gives the rate implied. A negative settlement pays nothing.
6. The split: each row goes to the calendar month of its posted date (or the time zone or cut-off you choose). A row with no posted date goes on the settlement's end date and is counted. Each part's journal date is its month end, or the settlement end in the last part.
7. The lines: each row is placed by Endwise's word rules on its transaction-type, amount-type and amount-description, first match wins: reserve, advertising, subscription, reimbursement, withheld tax, tax, promotion, FBA service, fee or commission, shipping, then the item price. A refund of price or shipping goes to Refunds. A value no rule knows goes to Other and is named; your map wins over the rules.
8. The journals: each line's month total is a credit when it is money to you and a debit when it is taken, and the month's net goes to the clearing account, so debits equal credits. With transfer, a journal moves total-amount from clearing to the bank on the deposit-date.

**Amazon SP-API documentation.**

The 24 column names, the tab-delimited layout and the local number format come from Amazon's Settlement Reports page, which says all prices are condensed into amount-type, amount-description and amount. Amazon publishes the columns but no closed list of amount-type or amount-description values, so the line each value goes to is the tool's own rule, shown value by value and open to change with map.

The SP-API changelog says the older flat file and XML settlement report types will be unavailable for sellers as of November 11, 2026; this tool reads the V2 flat file.

**Seller Central help.**

The payout period is 14 days; money can take up to five business days to reach the bank; a payment can come from Amazon Payments, Inc. and Amazon Services LLC; and a negative balance not cleared by the next settlement has to be paid. Statements list only released transactions, so for earnings by shipment date Amazon points to the Date Range Transaction report.

**Ledger import formats.**

The QuickBooks Online file has Intuit's journal entry columns (Journal No., Journal Date, Account Name, Journal/Description, Debits, Credits); the Xero file has one signed amount per line, debits positive and credits negative, as in Xero's ManualJournalLine.

## Which edge cases does it handle?

- An order posted at 22:41 UTC on October 31 stays in October by posted-date, and in America/Los\_Angeles too.
- A settlement paid in two deposits ties when both are given; one alone is reported as short by the other's amount.
- A negative settlement is still proved and split, and the transfer journal moves the money from the bank to clearing.
- Several settlements pasted together are counted and tied by settlement-id; one bare deposit amount is not applied when there are several.
- Sales tax collected and the same tax withheld by Amazon as marketplace facilitator net to nothing on the shared Sales tax payable account.
- Spreadsheet formulas in descriptions are written as plain text in the files.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A settlement crossing October 31, paid in two deposits**

```json
op: "check"
text: "settlement-id\tsettlement-start-date\tsettlement-end-date\tdeposit-date\ttotal-amount\tcurrency\ttransaction-type\torder-id\tmerchant-order-id\tadjustment-id\tshipment-id\tmarketplace-name\tamount-type\tamount-description\tamount\tfulfillment-id\tposted-date\tposted-date-time\torder-item-code\tmerchant-order-item-id\tmerchant-adjustment-item-id\tsku\tquantity-purchased\tpromotion-id\n24816093571\t2026-10-24 07:00:00 UTC\t2026-11-07 07:00:00 UTC\t2026-11-09 09:00:00 UTC\t188.14\tUSD\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n24816093571\t\t\t\t\t\tother-transaction\t\t\t\t\t\tother-transaction\tPrevious Reserve Amount Balance\t120.00\t\t10/24/26\t2026-10-24 15:20:11 UTC\t\t\t\t\t\t\n24816093571\t\t\t\t\t\tOrder\t112-0000001-0000001\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t39.99\tAFN\t10/25/26\t2026-10-25 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000001-0000001\t\t\t\tAmazon.com\tItemPrice\tTax\t3.20\tAFN\t10/25/26\t2026-10-25 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000001-0000001\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t-3.20\tAFN\t10/25/26\t2026-10-25 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000001-0000001\t\t\t\tAmazon.com\tItemFees\tCommission\t-6.00\tAFN\t10/25/26\t2026-10-25 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000001-0000001\t\t\t\tAmazon.com\tItemFees\tFBAPerUnitFulfillmentFee\t-5.40\tAFN\t10/25/26\t2026-10-25 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t79.98\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tItemPrice\tTax\t6.40\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t-6.40\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tItemFees\tCommission\t-12.00\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tItemFees\tFBAPerUnitFulfillmentFee\t-10.80\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tPromotion\tPrincipal\t-5.00\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tother-transaction\t\t\t\t\t\tother-transaction\tSubscription Fee\t-39.99\t\t10/30/26\t2026-10-30 15:20:11 UTC\t\t\t\t\t\t\n24816093571\t\t\t\t\t\tOrder\t112-0000003-0000003\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t24.99\tAFN\t10/31/26\t2026-10-31 22:41:05 UTC\t\t\t\tCOASTER-4\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000003-0000003\t\t\t\tAmazon.com\tItemPrice\tTax\t2.00\tAFN\t10/31/26\t2026-10-31 22:41:05 UTC\t\t\t\tCOASTER-4\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000003-0000003\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t-2.00\tAFN\t10/31/26\t2026-10-31 22:41:05 UTC\t\t\t\tCOASTER-4\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000003-0000003\t\t\t\tAmazon.com\tItemFees\tCommission\t-3.75\tAFN\t10/31/26\t2026-10-31 22:41:05 UTC\t\t\t\tCOASTER-4\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000003-0000003\t\t\t\tAmazon.com\tItemFees\tFBAPerUnitFulfillmentFee\t-4.25\tAFN\t10/31/26\t2026-10-31 22:41:05 UTC\t\t\t\tCOASTER-4\t1\t\n24816093571\t\t\t\t\t\tother-transaction\t\t\t\t\t\tCost of Advertising\tTransactionTotalAmount\t-42.17\t\t11/01/26\t2026-11-01 15:20:11 UTC\t\t\t\t\t\t\n24816093571\t\t\t\t\t\tOrder\t112-0000004-0000004\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t59.99\tAFN\t11/02/26\t2026-11-02 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000004-0000004\t\t\t\tAmazon.com\tItemPrice\tTax\t4.80\tAFN\t11/02/26\t2026-11-02 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000004-0000004\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t-4.80\tAFN\t11/02/26\t2026-11-02 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000004-0000004\t\t\t\tAmazon.com\tItemFees\tCommission\t-9.00\tAFN\t11/02/26\t2026-11-02 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000004-0000004\t\t\t\tAmazon.com\tItemFees\tFBAPerUnitFulfillmentFee\t-6.10\tAFN\t11/02/26\t2026-11-02 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tRefund\t112-0000001-0000001\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t-39.99\tAFN\t11/03/26\t2026-11-03 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tRefund\t112-0000001-0000001\t\t\t\tAmazon.com\tItemPrice\tTax\t-3.20\tAFN\t11/03/26\t2026-11-03 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tRefund\t112-0000001-0000001\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t3.20\tAFN\t11/03/26\t2026-11-03 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tRefund\t112-0000001-0000001\t\t\t\tAmazon.com\tItemFees\tCommission\t6.00\tAFN\t11/03/26\t2026-11-03 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tRefund\t112-0000001-0000001\t\t\t\tAmazon.com\tItemFees\tRefundCommission\t-1.20\tAFN\t11/03/26\t2026-11-03 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tother-transaction\t\t\t\t\t\tFBA Inventory Reimbursement\tWAREHOUSE_DAMAGE\t18.50\t\t11/04/26\t2026-11-04 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000005-0000005\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t149.99\tAFN\t11/05/26\t2026-11-05 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000005-0000005\t\t\t\tAmazon.com\tItemPrice\tTax\t12.00\tAFN\t11/05/26\t2026-11-05 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000005-0000005\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t-12.00\tAFN\t11/05/26\t2026-11-05 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000005-0000005\t\t\t\tAmazon.com\tItemFees\tCommission\t-22.50\tAFN\t11/05/26\t2026-11-05 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000005-0000005\t\t\t\tAmazon.com\tItemFees\tFBAPerUnitFulfillmentFee\t-8.15\tAFN\t11/05/26\t2026-11-05 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093571\t\t\t\t\t\tother-transaction\t\t\t\t\t\tother-transaction\tCurrent Reserve Amount\t-95.00\t\t11/07/26\t2026-11-07 15:20:11 UTC\t\t\t\t\t\t\n"
deposits: 2 items
bankDate: "2026-11-10"
```

A settlement crossing October 31, paid in two deposits

| Result | Value |
| --- | --- |
| answer | Settlement 24816093571 (October 24, 2026 to November 7, 2026) totals $188.14, and its 36 rows add up to it to the cent; it ties to the bank deposits of $150.00 and $38.14. 94.5% ($177.77) is posted in October 2026 and 5.5% ($10.37) in November 2026. |
| proof | 36 rows add up to 188.14: ties |
| bank | 150.00 + 38.14 = 188.14: ties |
| October 2026 | 177.77 (94.5%), journal dated 2026-10-31 |
| November 2026 | 10.37 (5.5%), journal dated 2026-11-07 |
| reserve | 120.00 released, 95.00 held |

**The same settlement as QuickBooks Online journals**

```json
op: "reconcile"
text: "settlement-id\tsettlement-start-date\tsettlement-end-date\tdeposit-date\ttotal-amount\tcurrency\ttransaction-type\torder-id\tmerchant-order-id\tadjustment-id\tshipment-id\tmarketplace-name\tamount-type\tamount-description\tamount\tfulfillment-id\tposted-date\tposted-date-time\torder-item-code\tmerchant-order-item-id\tmerchant-adjustment-item-id\tsku\tquantity-purchased\tpromotion-id\n24816093571\t2026-10-24 07:00:00 UTC\t2026-11-07 07:00:00 UTC\t2026-11-09 09:00:00 UTC\t188.14\tUSD\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n24816093571\t\t\t\t\t\tother-transaction\t\t\t\t\t\tother-transaction\tPrevious Reserve Amount Balance\t120.00\t\t10/24/26\t2026-10-24 15:20:11 UTC\t\t\t\t\t\t\n24816093571\t\t\t\t\t\tOrder\t112-0000001-0000001\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t39.99\tAFN\t10/25/26\t2026-10-25 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000001-0000001\t\t\t\tAmazon.com\tItemPrice\tTax\t3.20\tAFN\t10/25/26\t2026-10-25 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000001-0000001\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t-3.20\tAFN\t10/25/26\t2026-10-25 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000001-0000001\t\t\t\tAmazon.com\tItemFees\tCommission\t-6.00\tAFN\t10/25/26\t2026-10-25 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000001-0000001\t\t\t\tAmazon.com\tItemFees\tFBAPerUnitFulfillmentFee\t-5.40\tAFN\t10/25/26\t2026-10-25 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t79.98\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tItemPrice\tTax\t6.40\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t-6.40\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tItemFees\tCommission\t-12.00\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tItemFees\tFBAPerUnitFulfillmentFee\t-10.80\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tOrder\t112-0000002-0000002\t\t\t\tAmazon.com\tPromotion\tPrincipal\t-5.00\tAFN\t10/29/26\t2026-10-29 15:20:11 UTC\t\t\t\tMUG-SET\t2\t\n24816093571\t\t\t\t\t\tother-transaction\t\t\t\t\t\tother-transaction\tSubscription Fee\t-39.99\t\t10/30/26\t2026-10-30 15:20:11 UTC\t\t\t\t\t\t\n24816093571\t\t\t\t\t\tOrder\t112-0000003-0000003\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t24.99\tAFN\t10/31/26\t2026-10-31 22:41:05 UTC\t\t\t\tCOASTER-4\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000003-0000003\t\t\t\tAmazon.com\tItemPrice\tTax\t2.00\tAFN\t10/31/26\t2026-10-31 22:41:05 UTC\t\t\t\tCOASTER-4\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000003-0000003\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t-2.00\tAFN\t10/31/26\t2026-10-31 22:41:05 UTC\t\t\t\tCOASTER-4\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000003-0000003\t\t\t\tAmazon.com\tItemFees\tCommission\t-3.75\tAFN\t10/31/26\t2026-10-31 22:41:05 UTC\t\t\t\tCOASTER-4\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000003-0000003\t\t\t\tAmazon.com\tItemFees\tFBAPerUnitFulfillmentFee\t-4.25\tAFN\t10/31/26\t2026-10-31 22:41:05 UTC\t\t\t\tCOASTER-4\t1\t\n24816093571\t\t\t\t\t\tother-transaction\t\t\t\t\t\tCost of Advertising\tTransactionTotalAmount\t-42.17\t\t11/01/26\t2026-11-01 15:20:11 UTC\t\t\t\t\t\t\n24816093571\t\t\t\t\t\tOrder\t112-0000004-0000004\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t59.99\tAFN\t11/02/26\t2026-11-02 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000004-0000004\t\t\t\tAmazon.com\tItemPrice\tTax\t4.80\tAFN\t11/02/26\t2026-11-02 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000004-0000004\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t-4.80\tAFN\t11/02/26\t2026-11-02 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000004-0000004\t\t\t\tAmazon.com\tItemFees\tCommission\t-9.00\tAFN\t11/02/26\t2026-11-02 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000004-0000004\t\t\t\tAmazon.com\tItemFees\tFBAPerUnitFulfillmentFee\t-6.10\tAFN\t11/02/26\t2026-11-02 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tRefund\t112-0000001-0000001\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t-39.99\tAFN\t11/03/26\t2026-11-03 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tRefund\t112-0000001-0000001\t\t\t\tAmazon.com\tItemPrice\tTax\t-3.20\tAFN\t11/03/26\t2026-11-03 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tRefund\t112-0000001-0000001\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t3.20\tAFN\t11/03/26\t2026-11-03 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tRefund\t112-0000001-0000001\t\t\t\tAmazon.com\tItemFees\tCommission\t6.00\tAFN\t11/03/26\t2026-11-03 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tRefund\t112-0000001-0000001\t\t\t\tAmazon.com\tItemFees\tRefundCommission\t-1.20\tAFN\t11/03/26\t2026-11-03 15:20:11 UTC\t\t\t\tMUG-BLUE\t1\t\n24816093571\t\t\t\t\t\tother-transaction\t\t\t\t\t\tFBA Inventory Reimbursement\tWAREHOUSE_DAMAGE\t18.50\t\t11/04/26\t2026-11-04 15:20:11 UTC\t\t\t\tMUG-RED\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000005-0000005\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t149.99\tAFN\t11/05/26\t2026-11-05 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000005-0000005\t\t\t\tAmazon.com\tItemPrice\tTax\t12.00\tAFN\t11/05/26\t2026-11-05 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000005-0000005\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t-12.00\tAFN\t11/05/26\t2026-11-05 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000005-0000005\t\t\t\tAmazon.com\tItemFees\tCommission\t-22.50\tAFN\t11/05/26\t2026-11-05 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093571\t\t\t\t\t\tOrder\t112-0000005-0000005\t\t\t\tAmazon.com\tItemFees\tFBAPerUnitFulfillmentFee\t-8.15\tAFN\t11/05/26\t2026-11-05 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093571\t\t\t\t\t\tother-transaction\t\t\t\t\t\tother-transaction\tCurrent Reserve Amount\t-95.00\t\t11/07/26\t2026-11-07 15:20:11 UTC\t\t\t\t\t\t\n"
deposits: 2 items
ledger: "quickbooks-online"
transfer: true
```

The same settlement as QuickBooks Online journals

| Result | Value |
| --- | --- |
| Amazon settlement 24816093571, October 2026 | dated 2026-10-31, debits 264.96 = credits 264.96 |
| Amazon settlement 24816093571, November 2026 | dated 2026-11-07, debits 228.48 = credits 228.48 |
| Amazon settlement 24816093571, deposit | dated 2026-11-09, debits 188.14 = credits 188.14 |
| import file | amazon-settlement-24816093571-quickbooks-online.csv |

**A negative settlement: refunds and fees larger than sales**

```json
op: "check"
text: "settlement-id\tsettlement-start-date\tsettlement-end-date\tdeposit-date\ttotal-amount\tcurrency\ttransaction-type\torder-id\tmerchant-order-id\tadjustment-id\tshipment-id\tmarketplace-name\tamount-type\tamount-description\tamount\tfulfillment-id\tposted-date\tposted-date-time\torder-item-code\tmerchant-order-item-id\tmerchant-adjustment-item-id\tsku\tquantity-purchased\tpromotion-id\n24816093572\t2026-11-07 07:00:00 UTC\t2026-11-21 07:00:00 UTC\t2026-11-23 09:00:00 UTC\t-132.55\tUSD\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\n24816093572\t\t\t\t\t\tother-transaction\t\t\t\t\t\tother-transaction\tPrevious Reserve Amount Balance\t95.00\t\t11/07/26\t2026-11-07 15:20:11 UTC\t\t\t\t\t\t\n24816093572\t\t\t\t\t\tOrder\t112-0000006-0000006\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t24.99\tAFN\t11/10/26\t2026-11-10 15:20:11 UTC\t\t\t\tCOASTER-4\t1\t\n24816093572\t\t\t\t\t\tOrder\t112-0000006-0000006\t\t\t\tAmazon.com\tItemPrice\tTax\t2.00\tAFN\t11/10/26\t2026-11-10 15:20:11 UTC\t\t\t\tCOASTER-4\t1\t\n24816093572\t\t\t\t\t\tOrder\t112-0000006-0000006\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t-2.00\tAFN\t11/10/26\t2026-11-10 15:20:11 UTC\t\t\t\tCOASTER-4\t1\t\n24816093572\t\t\t\t\t\tOrder\t112-0000006-0000006\t\t\t\tAmazon.com\tItemFees\tCommission\t-3.75\tAFN\t11/10/26\t2026-11-10 15:20:11 UTC\t\t\t\tCOASTER-4\t1\t\n24816093572\t\t\t\t\t\tOrder\t112-0000006-0000006\t\t\t\tAmazon.com\tItemFees\tFBAPerUnitFulfillmentFee\t-4.25\tAFN\t11/10/26\t2026-11-10 15:20:11 UTC\t\t\t\tCOASTER-4\t1\t\n24816093572\t\t\t\t\t\tRefund\t112-0000005-0000005\t\t\t\tAmazon.com\tItemPrice\tPrincipal\t-149.99\tAFN\t11/12/26\t2026-11-12 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093572\t\t\t\t\t\tRefund\t112-0000005-0000005\t\t\t\tAmazon.com\tItemPrice\tTax\t-12.00\tAFN\t11/12/26\t2026-11-12 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093572\t\t\t\t\t\tRefund\t112-0000005-0000005\t\t\t\tAmazon.com\tItemWithheldTax\tMarketplaceFacilitatorTax-Principal\t12.00\tAFN\t11/12/26\t2026-11-12 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093572\t\t\t\t\t\tRefund\t112-0000005-0000005\t\t\t\tAmazon.com\tItemFees\tCommission\t22.50\tAFN\t11/12/26\t2026-11-12 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093572\t\t\t\t\t\tRefund\t112-0000005-0000005\t\t\t\tAmazon.com\tItemFees\tRefundCommission\t-4.50\tAFN\t11/12/26\t2026-11-12 15:20:11 UTC\t\t\t\tMUG-GIFT\t1\t\n24816093572\t\t\t\t\t\tother-transaction\t\t\t\t\t\tCost of Advertising\tTransactionTotalAmount\t-63.80\t\t11/15/26\t2026-11-15 15:20:11 UTC\t\t\t\t\t\t\n24816093572\t\t\t\t\t\tother-transaction\t\t\t\t\t\tother-transaction\tFBA Inventory Storage Fee\t-28.75\t\t11/16/26\t2026-11-16 15:20:11 UTC\t\t\t\t\t\t\n24816093572\t\t\t\t\t\tother-transaction\t\t\t\t\t\tother-transaction\tCurrent Reserve Amount\t-20.00\t\t11/21/26\t2026-11-21 15:20:11 UTC\t\t\t\t\t\t\n"
```

A negative settlement: refunds and fees larger than sales

| Result | Value |
| --- | --- |
| answer | Settlement 24816093572 (November 7, 2026 to November 21, 2026) totals -$132.55, and its 14 rows add up to it to the cent; it is negative, so no deposit comes from it. All of it is posted in November 2026. |

## What does it not do?

- It reads only the Flat File V2 settlement report; it does not read the Date Range or Deferred Transaction reports, and a settlement shows only released transactions by release date.
- Which line a value goes to is the tool's word rules, not an Amazon list: review the value list before you post.
- It does not fetch reports from Seller Central and does not post to QuickBooks Online or Xero; you import the file.
- It is arithmetic on Amazon's own file, not accounting or tax advice.

## Where does the data come from, and how fresh is it?

Amazon's SP-API pages and Seller Central help (United States), and the QuickBooks Online and Xero import formats, were read on 2026-11-08. The column list is pinned to Amazon's page by the tests. The word rules and journals live in the tool's code and change only by hand, with the tests that pin them.

- [Amazon SP-API: Settlement Reports](https://developer-docs.amazon.com/sp-api/docs/report-type-values-settlement)
- [Amazon SP-API changelog: Deprecation of two payment settlement report types](https://developer-docs.amazon.com/sp-api/changelog/update-deprecation-of-two-payment-settlement-report-types)
- [Amazon SP-API: SP-API Deprecation Schedule](https://developer-docs.amazon.com/sp-api/docs/sp-api-deprecations)
- [Seller Central Help: Deferred transactions for accounting and payment reconciliation](https://sellercentral.amazon.com/help/hub/reference/external/GLRNLZDAKHDBBVBY)
- [Seller Central Help: Payments based on delivery date](https://sellercentral.amazon.com/help/hub/reference/external/202124090)
- [Seller Central Help: What is account level reserve?](https://sellercentral.amazon.com/help/hub/reference/external/G200136810)
- [Seller Central Help: When will I be paid?](https://sellercentral.amazon.com/help/hub/reference/external/G14911)
- [Seller Central Help: Why didn't I get paid?](https://sellercentral.amazon.com/help/hub/reference/external/G19301)
- [Seller Central Help: How Amazon transfers payments](https://sellercentral.amazon.com/help/hub/reference/external/G19321)
- [Seller Central Help: Negative balance](https://sellercentral.amazon.com/help/hub/reference/external/G16261)
- [Seller Central Help: How do I read my Payments report?](https://sellercentral.amazon.com/help/hub/reference/external/G14921)
- [Seller Central Help: What are "Other" transactions in my Payments report?](https://sellercentral.amazon.com/help/hub/reference/external/G16091)
- [Seller Central Help: How do I find my order payment in payment reports?](https://sellercentral.amazon.com/help/hub/reference/external/GGBXCUY3ARH6ULYZ)
- [Seller Central Help: Payment Date Range Transaction and Summary reports](https://sellercentral.amazon.com/help/hub/reference/external/G200989190)
- [QuickBooks Online: Import journal entries](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)
- [Xero Accounting API (OpenAPI): ManualJournalLine](https://github.com/XeroAPI/Xero-OpenAPI/blob/master/xero_accounting.yaml)

Amazon's SP-API pages and Seller Central help (United States), and the QuickBooks Online and Xero import formats, were read on 2026-11-08. The column list is pinned to Amazon's page by the tests. The word rules and journals live in the tool's code and change only by hand, with the tests that pin them.

Amazon settlement reconciliation: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [Amazon SP-API: Settlement Reports](https://developer-docs.amazon.com/sp-api/docs/report-type-values-settlement) | page updated 2026-10-14 | 2026-11-08 |
| [Amazon SP-API changelog: Deprecation of two payment settlement report types](https://developer-docs.amazon.com/sp-api/changelog/update-deprecation-of-two-payment-settlement-report-types) | see the document | 2026-11-08 |
| [Amazon SP-API: SP-API Deprecation Schedule](https://developer-docs.amazon.com/sp-api/docs/sp-api-deprecations) | page updated 2026-09-09 | 2026-11-08 |
| [Seller Central Help: Deferred transactions for accounting and payment reconciliation](https://sellercentral.amazon.com/help/hub/reference/external/GLRNLZDAKHDBBVBY) | see the document | 2026-11-08 |
| [Seller Central Help: Payments based on delivery date](https://sellercentral.amazon.com/help/hub/reference/external/202124090) | see the document | 2026-11-08 |
| [Seller Central Help: What is account level reserve?](https://sellercentral.amazon.com/help/hub/reference/external/G200136810) | see the document | 2026-11-08 |
| [Seller Central Help: When will I be paid?](https://sellercentral.amazon.com/help/hub/reference/external/G14911) | see the document | 2026-11-08 |
| [Seller Central Help: Why didn't I get paid?](https://sellercentral.amazon.com/help/hub/reference/external/G19301) | see the document | 2026-11-08 |
| [Seller Central Help: How Amazon transfers payments](https://sellercentral.amazon.com/help/hub/reference/external/G19321) | see the document | 2026-11-08 |
| [Seller Central Help: Negative balance](https://sellercentral.amazon.com/help/hub/reference/external/G16261) | see the document | 2026-11-08 |
| [Seller Central Help: How do I read my Payments report?](https://sellercentral.amazon.com/help/hub/reference/external/G14921) | see the document | 2026-11-08 |
| [Seller Central Help: What are "Other" transactions in my Payments report?](https://sellercentral.amazon.com/help/hub/reference/external/G16091) | see the document | 2026-11-08 |
| [Seller Central Help: How do I find my order payment in payment reports?](https://sellercentral.amazon.com/help/hub/reference/external/GGBXCUY3ARH6ULYZ) | see the document | 2026-11-08 |
| [Seller Central Help: Payment Date Range Transaction and Summary reports](https://sellercentral.amazon.com/help/hub/reference/external/G200989190) | see the document | 2026-11-08 |
| [QuickBooks Online: Import journal entries](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US) | page updated 2026-08-04 | 2026-11-08 |
| [Xero Accounting API (OpenAPI): ManualJournalLine](https://github.com/XeroAPI/Xero-OpenAPI/blob/master/xero_accounting.yaml) | see the document | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests check that the columns are Amazon's list, decimal points and commas, Amazon's date formats, the word rules for every sample value, the US sample (proof, two-payer tie, split at October 31, reserve), the bank tie notes, the EU and negative samples, cut-offs and refusals, several settlements in one file, balanced journals, the import file columns and the same bytes every time.

What its test suite asserts:

- The 24 columns equal Amazon's published list, and every source is dated and read on Amazon's own pages on 2026-11-08.
- The US sample proves to $188.14, ties to two deposits and splits 94.5% into October and 5.5% into November; the EU (decimal comma) and negative samples are proved and split too.
- Every journal balances, the clearing account holds the total until the transfer empties it, and the import files have the documented columns and the same bytes every time.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Amazon settlement reconciliation tool](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/).

## Questions

### Is there any AI in the amazon settlement reconciliation answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the amazon settlement reconciliation refuse to answer?

It reads only the Flat File V2 settlement report; it does not read the Date Range or Deferred Transaction reports, and a settlement shows only released transactions by release date. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Amazon settlement reconciliation tool](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/amazon-settlement-reconciliation/  
Data as of: 2026-11-04
