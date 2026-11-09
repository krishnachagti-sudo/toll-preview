# How the FBA refunded but never returned checker works

Each refunded FBA order is matched by order ID against the returns and reimbursements reports; one neither returned nor reimbursed is owed, and gets its marketplace's claim window from Amazon's help page: in the US days 60 to 120 after the refund, in Canada and Australia days 45 to 105.

## How does it work?

1. Each report is read by its download headings, tabs or commas; dates are taken as written (no time-zone shift) and amounts into whole cents.
2. Refunds are the Refund rows of FBA orders in the Date Range report, a settlement report's refunds, or a mapped list.
3. Each refunded order is joined by order ID to the returns (returned, or returned damaged by the customer or defective, which is not eligible) and to the reimbursements (reimbursed, or reimbursed below the refund).
4. An order neither returned nor reimbursed is owed.
5. A reimbursement below the refund can be disputed within 60 days of the reimbursement; Amazon pays at most $5,000.00 for a single unit.

> Step 6, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/fba-refund-not-returned/#what) below.

## What does it not cover?

- A file it cannot read is a named error, and the charge is refunded.
- It cannot see what Amazon has not put in your reports, or file claims for you.
- Not legal or accounting advice. Files are processed in memory and not kept.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 12 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The claim windows, value rules and report columns were read on Amazon's Seller Central help pages on 2026-11-08, and the pages are checked daily for changes.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check the windows, values and columns against Amazon's pages, every date and amount form, the three refund report shapes, the US, CA, AU and UK windows inclusive, a sample with every order classified, valued and dated, the $5,000 cap, the dispute window and the CSV.

- [Seller Central Help (US): Customer return claims](https://sellercentral.amazon.com/help/hub/reference/external/G9N934L7Y4SFWPJ4), see the document, read 2026-11-08
- [Seller Central Help (CA): Customer return claims](https://sellercentral.amazon.ca/help/hub/reference/external/G9N934L7Y4SFWPJ4), see the document, read 2026-11-08
- [Seller Central Help (AU): Customer returns](https://sellercentral.amazon.com.au/help/hub/reference/external/G9N934L7Y4SFWPJ4), see the document, read 2026-11-08
- [Seller Central Help (UK): FBA customer returns reimbursement policy](https://sellercentral.amazon.co.uk/help/hub/reference/external/G9N934L7Y4SFWPJ4), see the document, read 2026-11-08
- [Seller Central Help (US): FBA inventory reimbursement policy](https://sellercentral.amazon.com/help/hub/reference/external/G200213130), see the document, read 2026-11-08
- [Seller Central Help (US): Reimbursements report](https://sellercentral.amazon.com/help/hub/reference/external/G200732720), see the document, read 2026-11-08
- [Seller Central Help (US): FBA Customer Returns report](https://sellercentral.amazon.com/help/hub/reference/external/200453320), see the document, read 2026-11-08
- [Seller Central Help (US): Payment Date Range reports](https://sellercentral.amazon.com/help/hub/reference/external/G200989190), see the document, read 2026-11-08
- [Seller Central Help (US): Reversed Reimbursement](https://sellercentral.amazon.com/help/hub/reference/external/GL9ZDED52WXZUMFD), see the document, read 2026-11-08
- [Seller Central Help (US): Fulfillment center operations claim](https://sellercentral.amazon.com/help/hub/reference/external/GGEV4254LJJ9BAEG), see the document, read 2026-11-08
- [Seller Central Help (US): Removals claims](https://sellercentral.amazon.com/help/hub/reference/external/G9ZB3H4DP4H72U6R), see the document, read 2026-11-08
- [Seller Central Help (US): Shipment to Amazon claims](https://sellercentral.amazon.com/help/hub/reference/external/GEYPWTSQRTXXXMVB), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the refunded but never returned: fba customer return reimbursement checker compute?

Upload Amazon's refunds (the Payment Date Range Transaction report, a settlement report or any refunds list), the FBA Customer Returns report and the Reimbursements report, and the tool shows which refunded FBA orders were neither returned nor reimbursed, or were reimbursed below the refund, each with the claim window, its status on the day and, in the audit, the case text to paste.

**In detail: operations, inputs and outputs**

Operations (the op field):

- `windows`: Returns the claim window for up to 100 refund dates in a marketplace, and each one's status on the day. Free.
- `check`: Returns how many refunded orders are still owed, their total, the next window to close and what is left. Free.
- `audit`: Does what check does and also returns every order with its status, claim dates and case text, and a CSV. Priced per order found still owed.

Inputs:

- `refunds, returns, reimbursements`: The three reports as text or base64, up to 5 MB each.
- `marketplace`: US, CA, AU or UK: the store whose help page sets the window (US days 60 to 120, CA and AU days 45 to 105, UK 45 days, no closing day published). Default US.
- `asOf, window`: The day to judge each window on (default today, UTC), or your own window in days.
- `columns, dateOrder, decimal`: Headings for renamed or translated columns, the slash date order and the decimal mark.

Outputs:

- answer: how many refunded orders are owed, what can be claimed today and when the first window closes
- owed, totals, nextClose, left and warnings
- audit: orders with status and claim dates, case text and the CSV

**Every step in full (6) and the rules**

1. Each report is read by its download headings, tabs or commas; dates are taken as written (no time-zone shift) and amounts into whole cents.
2. Refunds are the Refund rows of FBA orders in the Date Range report, a settlement report's refunds, or a mapped list.
3. Each refunded order is joined by order ID to the returns (returned, or returned damaged by the customer or defective, which is not eligible) and to the reimbursements (reimbursed, or reimbursed below the refund).
4. An order neither returned nor reimbursed is owed. Its window opens and closes the marketplace's days after the refund, inclusive, and on the as-of day it is claimable, not yet claimable or closed.
5. A reimbursement below the refund can be disputed within 60 days of the reimbursement; Amazon pays at most $5,000.00 for a single unit.
6. Case text is written only for orders inside their window or the dispute window.

**Amazon's claim windows.**

The windows, the dispute period and the per-unit maximum are read on each marketplace's Seller Central help page on 2026-11-08. The UK page says Amazon reimburses a refund not returned within 45 days and states no closing day, so a UK check needs your own window for the closing day.

## Which edge cases does it handle?

**The edge cases (3)**

- An order covered by an inventory reimbursement counts as reimbursed.
- A reimbursement whose dispute window has passed is shown but no case text is written.
- With no returns or reimbursements report given, the answer says what it could not check.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Check a made-up seller's three reports**

Check a made-up seller's three reports

| Result | Value |
| --- | --- |
| answer | 7 of your 11 refunded FBA orders from June 20, 2026 to October 1, 2026 were neither returned nor reimbursed: 4 can be claimed today ($146.45 refunded; the first window closes November 12, 2026), 2 open later ($54.49 refunded) and 1 expired; 1 order was reimbursed $16.87 below the refund. |

**The input**

```json
op: "check"
refunds: "\"Includes Amazon Marketplace, Fulfillment by Amazon (FBA), and Amazon Webstore transactions\"\n\"All amounts in USD, unless specified\"\ndate/time,settlement id,type,order id,sku,description,quantity,store,fulfillment,order city,order state,order post code,tax collection model,product sales,product sales tax,shipping credits,shipping credits tax,gift wrap credits,gift wrap credits tax,regulatory fee,tax on regulatory fee,promotional rebate,promotional rebate tax,marketplace withheld tax,selling fees,fba fees,other transaction fees,other,total\n\"Jun 20, 2026 9:14:02 AM PDT\",24816093571,Refund,112-0000001-0000001,MUG-BLUE,Sample product MUG-BLUE,1,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,-19.99,0,0,0,0,0,0,0,0,0,0,2.40,0,0,0,-17.59\n\"Jul 1, 2026 4:02:11 PM PDT\",24816093571,Refund,112-0000002-0000002,MUG-RED,Sample product MUG-RED,1,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,-19.99,0,0,0,0,0,0,0,0,0,0,2.40,0,0,0,-17.59\n\"Jul 10, 2026 11:45:00 AM PDT\",24816093571,Refund,112-0000003-0000003,LAMP-01,Sample product LAMP-01,1,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,-34.50,0,0,0,0,0,0,0,0,0,0,4.14,0,0,0,-30.36\n\"Jul 15, 2026 8:30:41 AM PDT\",24816093571,Refund,112-0000004-0000004,LAMP-01,Sample product LAMP-01,1,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,-34.50,0,0,0,0,0,0,0,0,0,0,4.14,0,0,0,-30.36\n\"Jul 25, 2026 2:12:09 PM PDT\",24816093571,Refund,112-0000005-0000005,KETTLE-2,Sample product KETTLE-2,1,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,-42.00,0,0,0,0,0,0,0,0,0,0,5.04,0,0,0,-36.96\n\"Aug 1, 2026 7:55:30 AM PDT\",24816093571,Refund,112-0000006-0000006,MUG-BLUE,Sample product MUG-BLUE,1,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,-24.99,0,0,0,0,0,0,0,0,0,0,3.00,0,0,0,-21.99\n\"Aug 10, 2026 10:10:10 AM PDT\",24816093571,Refund,112-0000007-0000007,KETTLE-2,Sample product KETTLE-2,1,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,-42.00,0,0,0,0,0,0,0,0,0,0,5.04,0,0,0,-36.96\n\"Aug 20, 2026 6:20:00 PM PDT\",24816093571,Refund,112-0000008-0000008,TEAPOT-3,Sample product TEAPOT-3,1,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,-27.95,0,0,0,0,0,0,0,0,0,0,3.35,0,0,0,-24.60\n\"Sep 2, 2026 1:00:00 PM PDT\",24816093571,Order,112-0000013-0000013,MUG-BLUE,Sample product MUG-BLUE,1,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,24.99,0,0,0,0,0,0,0,0,0,0,-3.75,-4.10,0,0,17.14\n\"Sep 5, 2026 3:33:33 PM PDT\",24816093571,Refund,112-0000009-0000009,TEAPOT-3,Sample product TEAPOT-3,1,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,-27.95,0,0,0,0,0,0,0,0,0,0,3.35,0,0,0,-24.60\n\"Sep 12, 2026 9:00:00 AM PDT\",24816093571,Refund,112-0000012-0000012,MUG-RED,Sample product MUG-RED,1,amazon.com,Seller,Austin,TX,78701,MarketplaceFacilitator,-19.99,0,0,0,0,0,0,0,0,0,0,2.40,0,0,0,-17.59\n\"Sep 20, 2026 12:00:00 PM PDT\",24816093571,Refund,112-0000010-0000010,LAMP-01,Sample product LAMP-01,1,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,-34.50,0,0,0,0,0,0,0,0,0,0,4.14,0,0,0,-30.36\n\"Oct 1, 2026 5:45:00 PM PDT\",24816093571,Refund,112-0000011-0000011,MUG-RED,Sample product MUG-RED,2,amazon.com,Amazon,Austin,TX,78701,MarketplaceFacilitator,-39.98,0,0,0,0,0,0,0,0,0,0,4.80,0,0,0,-35.18\n"
returns: "return-date\torder-id\tsku\tasin\tfnsku\tproduct-name\tquantity\tfulfillment-center-id\tdetailed-disposition\treason\tstatus\tlicense-plate-number\tcustomer-comments\n2026-07-10T15:02:00+00:00\t112-0000002-0000002\tMUG-RED\tB0SAMPLE02\tX00SAMPLE2\tSample product MUG-RED\t1\tSBD1\tSELLABLE\tNO_REASON_GIVEN\tUnit returned to inventory\tLPN0000002\t\n2026-08-25T11:20:00+00:00\t112-0000007-0000007\tKETTLE-2\tB0SAMPLE07\tX00SAMPLE7\tSample product KETTLE-2\t1\tSBD1\tCARRIER_DAMAGED\tDAMAGED_BY_CARRIER\tUnit returned to inventory\tLPN0000007\t\n2026-09-19T09:40:00+00:00\t112-0000009-0000009\tTEAPOT-3\tB0SAMPLE09\tX00SAMPLE9\tSample product TEAPOT-3\t1\tONT8\tCUSTOMER_DAMAGED\tUNWANTED_ITEM\tUnit returned to inventory\tLPN0000009\t\n2026-10-09T13:05:00+00:00\t112-0000011-0000011\tMUG-RED\tB0SAMPLE02\tX00SAMPLE2\tSample product MUG-RED\t1\tONT8\tSELLABLE\tNO_REASON_GIVEN\tUnit returned to inventory\tLPN0000011\t\n"
reimbursements: "approval-date\treimbursement-id\tcase-id\tamazon-order-id\treason\tsku\tfnsku\tasin\tproduct-name\tcondition\tcurrency-unit\tamount-per-unit\tamount-total\tquantity-reimbursed-cash\tquantity-reimbursed-inventory\tquantity-reimbursed-total\toriginal-reimbursement-id\toriginal-reimbursement-type\n2026-08-21T08:00:00+00:00\t9000000001\t\t112-0000001-0000001\tCustomerReturn\tMUG-BLUE\tX00SAMPLE1\tB0SAMPLE01\tSample product MUG-BLUE\tNewItem\tUSD\t19.99\t19.99\t1\t0\t1\t\t\n2026-09-25T08:00:00+00:00\t9000000005\t\t112-0000005-0000005\tCustomerReturn\tKETTLE-2\tX00SAMPLE5\tB0SAMPLE05\tSample product KETTLE-2\tNewItem\tUSD\t42.00\t42.00\t1\t0\t1\t\t\n2026-10-20T08:00:00+00:00\t9000000015\t\t112-0000005-0000005\tReimbursement_Reversal\tKETTLE-2\tX00SAMPLE5\tB0SAMPLE05\tSample product KETTLE-2\tNewItem\tUSD\t-42.00\t-42.00\t-1\t\t-1\t9000000005\tCustomerReturn\n2026-10-01T08:00:00+00:00\t9000000006\t\t112-0000006-0000006\tCustomerReturn\tMUG-BLUE\tX00SAMPLE1\tB0SAMPLE01\tSample product MUG-BLUE\tNewItem\tUSD\t8.12\t8.12\t1\t0\t1\t\t\n"
asOf: "2026-11-08"
```

**More worked examples (1)**

**The claim window for a refund made on September 20, 2026**

The claim window for a refund made on September 20, 2026

| Result | Value |
| --- | --- |
| answer | A refund made on September 20, 2026 can be claimed from November 19, 2026 to January 18, 2027 (days 60 to 120 after the refund, Amazon's United States help page); on November 8, 2026 it is: not yet claimable. |

**The input**

```json
{
  "op": "windows",
  "refundDates": "2026-09-20",
  "marketplace": "US",
  "asOf": "2026-11-08"
}
```

## How is it tested?

**What its test suite asserts (3)**

- Windows, values and columns are pinned to Amazon's help pages as read on 2026-11-08.
- The US window is days 60 to 120 inclusive, CA and AU 45 to 105, and the UK open-ended.
- The sample classifies, values and dates every order; the $5,000 per-unit cap and the dispute window are checked.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Refunded but never returned: FBA customer return reimbursement checker tool](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/).

## Questions

### Is there any AI in the refunded but never returned: fba customer return reimbursement checker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the refunded but never returned: fba customer return reimbursement checker refuse to answer?

A file it cannot read is a named error, and the charge is refunded. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Refunded but never returned: FBA customer return reimbursement checker tool](https://krishnachagti-sudo.github.io/toll-preview/fba-refund-not-returned/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/fba-refund-not-returned/  
Data as of: 2026-11-04
