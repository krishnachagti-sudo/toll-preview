# How payout reconciliation works: rows to deposit

Each row of a Stripe, Shopify Payments, PayPal or Square export is placed in one of 17 lines by the category or type the processor documents, the rows of each payout are added in whole cents, and the total is checked against the deposit. The journal credits sales and debits refunds, fees and the rest against a clearing account, so debits equal credits.

## How does it work?

1. The processor is found from the headings it documents: Stripe's balance\_transaction\_id and reporting\_category, Shopify's Transaction Date, Type and Payout Date, PayPal's Gross, Fee, Net and Type with Balance Impact, Transaction ID or TimeZone, and JSON for Square.
2. Amounts are read exactly into the currency's smallest unit, with its decimal places taken from ISO 4217 (two for USD, none for JPY). "(12.00)", "-3.20", "1.234,56" and "$5" are read; a value that is not an amount is refused with its line.
3. Each row goes to one line by the processor's own label: Stripe's reporting\_category, Shopify's transaction type (exact names, then families such as reserved\_funds or shipping\_), PayPal's Type text by T-code family, Square's activity type.
4. Inside a row, PayPal's Sales Tax column is split out of the gross, Stripe's withheld\_tax (already inside the fee) goes to tax on fees, and the fee goes to fees.
5. Rows are grouped by payout id and currency. Shopify rows still pending are kept apart from paid payouts.

> Steps 6 to 8, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/payout-reconciliation/#what) below.

## What does it not cover?

- Stripe, Shopify Payments and Square payout files carry no sales tax collected; book it from the store's sales report.
- Stripe's report covers automatic payouts only: Stripe cannot say which transactions are in an instant payout.
- Check the account names against your chart of accounts, and skip the transfer journal when the bank feed already records the deposit.
- It is arithmetic on your processor's own file, not accounting or tax advice. Files are processed in memory and not kept.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 13 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Every report format, category list, fee rate and import format was read on the processor's or ledger's own page on 2026-11-08. The pages are checked daily for changes, and the mappings change only by hand, with the tests that pin them.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): Every Stripe reporting category and Square activity type is pinned to a known line, and the rate presets to the published rates.

- [Stripe Docs: Payout reconciliation report](https://docs.stripe.com/reports/payout-reconciliation), see the document, read 2026-11-08
- [Stripe Docs: Reporting categories](https://docs.stripe.com/reports/reporting-categories), see the document, read 2026-11-08
- [Stripe pricing (United States)](https://stripe.com/us/pricing), see the document, read 2026-11-08
- [Shopify Help Center: Viewing and exporting your Shopify Payments payout details](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/view-details), see the document, read 2026-11-08
- [Shopify Admin API: ShopifyPaymentsTransactionType](https://shopify.dev/docs/api/admin-graphql/latest/enums/ShopifyPaymentsTransactionType), see the document, read 2026-11-08
- [Shopify Help Center: Overview of reserves in Shopify Payments](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/reserves), see the document, read 2026-11-08
- [PayPal Developer: Activity Download report](https://developer.paypal.com/reports/activity-download), see the document, read 2026-11-08
- [PayPal Developer: Transaction event code (T-code) reference](https://developer.paypal.com/reports/reference/t-codes), see the document, read 2026-11-08
- [PayPal merchant fees (United States)](https://www.paypal.com/us/business/paypal-business-fees), see the document, read 2026-11-08
- [Square Developer: Payouts API, ListPayoutEntries and PayoutEntry](https://developer.squareup.com/reference/square/payouts-api/list-payout-entries), see the document, read 2026-11-08
- [Square pricing (United States)](https://squareup.com/us/en/pricing), see the document, read 2026-11-08
- [QuickBooks Online: Import journal entries](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US), see the document, read 2026-11-08
- [Xero Accounting API (OpenAPI): ManualJournalLine](https://github.com/XeroAPI/Xero-OpenAPI/blob/master/xero_accounting.yaml), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the payout reconciliation: split a payout into sales, refunds, fees and tax compute?

Upload the payout export your processor gives you and the tool reads it as the processor documents it, places every row in a line of the split (sales, sales tax, refunds, chargebacks, fees, tax on fees, reserves, loans, transfers and the rest), adds them per payout and per currency, and proves the total against the money that reached the bank.

**In detail: operations, inputs and outputs**

It can check the fees charged on sales against a published standard rate, and it builds a balanced journal for each payout with an import file for QuickBooks Online or Xero. Nothing is guessed: what the file does not say is reported.

Operations (the op field):

- `split`: Returns every payout's totals by line, its net, the deposit and the difference where one is known, the first and last activity dates, the sales count, gross and fee percentage, the warnings, the rows skipped and, with a rate, the fee check per payout. Free.
- `journal`: Does what split does and also returns one balanced journal per payout (and, with transfer, one moving the deposit from the clearing account to the bank), the account names used and three files: the QuickBooks Online or Xero import, a summary per payout and every row with the line it went to.

Inputs:

- `file or text`: The export as base64 or as text, one of the two, up to 5 MB and 50,000 rows: Stripe's itemized payout reconciliation CSV, Shopify Payments' payout transactions CSV, PayPal's Activity Download CSV, Square's payout entries JSON, or any CSV with its columns named.
- `processor, columns`: stripe, shopify, paypal, square, custom; found from the headings when left out. For any other CSV, the headings of its amount, fee, net, type, date, payout, currency and reference columns, and whether fees are written positive or negative.
- `currency, dateOrder`: The currency of a file with no currency column (default USD), and mdy or dmy for slash dates the file cannot settle.
- `deposits`: The amount each payout put in the bank, by payout id, at most 500, to check the rows against.
- `rate`: A published standard rate to check sale fees against: stripe-card (2.9% + 30¢), stripe-card-international (4.4% + 30¢), paypal-checkout (3.49% + 49¢), paypal-cards (2.99% + 49¢), square-in-person (2.6% + 15¢), square-online (3.3% + 30¢), square-online-plus (2.9% + 30¢); or your own percent and fixed cents.
- `ledger, accounts, transfer, dates`: For journal: quickbooks-online (the default) or xero; account names to replace the defaults; whether to add the bank transfer journal; and mdy, dmy or iso dates in the import file.

Outputs:

- answer: each payout as sales less refunds, chargebacks, fees and the rest equals the net, and whether it ties to the deposit
- groups: per payout and currency, the totals by line, net, deposit, difference, dates, months and sales figures (amounts as decimal strings)
- warnings and skipped: what to check, and the rows left out with the reason
- feeCheck: per payout, the fees charged on sales, the fees the rate would charge, and the difference
- journals, accounts and files (journal only)

**Every step in full (8) and the rules**

1. The processor is found from the headings it documents: Stripe's balance\_transaction\_id and reporting\_category, Shopify's Transaction Date, Type and Payout Date, PayPal's Gross, Fee, Net and Type with Balance Impact, Transaction ID or TimeZone, and JSON for Square. A file named as one processor but headed as another is refused.
2. Amounts are read exactly into the currency's smallest unit, with its decimal places taken from ISO 4217 (two for USD, none for JPY). "(12.00)", "-3.20", "1.234,56" and "$5" are read; a value that is not an amount is refused with its line.
3. Each row goes to one line by the processor's own label: Stripe's reporting\_category, Shopify's transaction type (exact names, then families such as reserved\_funds or shipping\_), PayPal's Type text by T-code family, Square's activity type. A label not in the processor's published list goes to other adjustments and is named in a warning.
4. Inside a row, PayPal's Sales Tax column is split out of the gross, Stripe's withheld\_tax (already inside the fee) goes to tax on fees, and the fee goes to fees. A row whose stated net is not the gross less the fee is counted in a warning, and the gross and fee are used.
5. Rows are grouped by payout id and currency. Shopify rows still pending are kept apart from paid payouts. PayPal is a balance, not payouts: withdrawals are the money moved to the bank, and the running Balance column, where present, must run from the first balance to the last with these rows.
6. The deposit is the payout row in the file, Square's payout amount, or the amount you give, which wins. The difference is the deposit less the rows' net. A payout with activity in two months, a negative payout, a difference from the deposit and a Stripe file with no payout ids are each warned about.
7. The fee check charges the rate on each sale payment, percent plus fixed, rounded half up to the cent, adds them, and compares the total with the fees charged on those sales.
8. The journal posts each line to its account, credit when money came into the processor balance and debit when it went out; the clearing account takes the net, so debits equal credits. The QuickBooks Online file has Journal No, Journal Date, Account Name, Description, Debits, Credits and Currency Code; the Xero file has one signed amount per line, debits positive. A cell that a spreadsheet would read as a formula is prefixed with an apostrophe.

**The processors' report documentation.**

Stripe's itemized payout reconciliation report (payout\_reconciliation.itemized.7) and reporting categories, Shopify's payout CSV columns and transaction types, PayPal's Activity Download fields and T-code families, and Square's payout entries are read from each processor's own pages, on 2026-11-08. Stripe: "Taxes collected by Stripe to be remitted to the appropriate local governments. Typically, this is a tax on Stripe fees."

**Published standard rates.**

The fee check presets are each processor's US pricing page as read on 2026-11-08: Stripe, domestic cards 2.9% + 30¢; Stripe, international cards (2.9% + 1.5%) 4.4% + 30¢; PayPal Checkout 3.49% + 49¢; PayPal standard credit and debit card payments 2.99% + 49¢; Square Free plan, tap, dip or swipe 2.6% + 15¢; Square Free plan, online 3.3% + 30¢; Square Plus or Premium, online 2.9% + 30¢. Shopify Payments rates depend on the plan and show only in the store's admin, so there is no Shopify preset.

**Import formats.**

The QuickBooks Online columns follow Intuit's "Import journal entries" help page; the Xero lines follow the ManualJournalLine LineAmount in Xero's Accounting API definition, debits positive and credits negative.

## Which edge cases does it handle?

**The edge cases (6)**

- A Stripe partial capture reversal reduces the sale rather than counting as a refund, because Stripe says the two transactions together are the captured part.
- A Shopify payout of refunds larger than its sales is negative, and the answer says the processor takes it from the bank or later payouts.
- PayPal memo rows, such as an authorization, and rows with a pending, denied or voided status are left out and listed.
- PayPal fees are written negative in most files; the Net column decides which way round a fee is.
- Slash dates are read day first only when a first part above 12 proves it, unless dateOrder says otherwise.
- The same file gives the same import file bytes every time.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Two Stripe payouts split, with the fee check against 2.9% + 30¢**

Two Stripe payouts split, with the fee check against 2.9% + 30¢

| Result | Value |
| --- | --- |
| answer | 2 Stripe payouts from October 14, 2026 to November 2, 2026: $396.26 = $524.98 sales - $49.99 refunds - $45.00 chargebacks - $33.73 fees. |
| payout po\_SAMPLE1014 | $156.69 net from 3 sales of $254.99, fees 3.26% of sales |
| payout po\_SAMPLE1102 | $239.57 net from 2 sales of $269.99, fees 3.12% of sales |
| fee check po\_SAMPLE1014 | charged $8.30, rate gives $8.30 |
| fee check po\_SAMPLE1102 | charged $8.43, rate gives $8.43 |
| warning 1 | Payout po\_SAMPLE1102 holds activity from 2026-10 and 2026-11: it spans a month end. |

**The input**

```json
op: "split"
text: "automatic_payout_id,automatic_payout_effective_at,balance_transaction_id,created,available_on,currency,gross,fee,net,reporting_category,description\npo_SAMPLE1014,2026-10-14,txn_S01,2026-10-10 14:02:11,2026-10-12,usd,120.00,3.78,116.22,charge,Order 1041\npo_SAMPLE1014,2026-10-14,txn_S02,2026-10-10 16:40:05,2026-10-12,usd,45.00,1.61,43.39,charge,Order 1042\npo_SAMPLE1014,2026-10-14,txn_S03,2026-10-11 09:15:44,2026-10-13,usd,89.99,2.91,87.08,charge,Order 1043\npo_SAMPLE1014,2026-10-14,txn_S04,2026-10-11 11:20:00,2026-10-13,usd,-30.00,0.00,-30.00,refund,Refund for order 1038\npo_SAMPLE1014,2026-10-14,txn_S05,2026-10-12 08:00:00,2026-10-12,usd,-45.00,15.00,-60.00,dispute,Chargeback on order 1022\npo_SAMPLE1102,2026-11-02,txn_S06,2026-10-30 13:05:09,2026-11-01,usd,250.00,7.55,242.45,charge,Order 1050\npo_SAMPLE1102,2026-11-02,txn_S07,2026-10-31 19:44:31,2026-11-02,usd,19.99,0.88,19.11,charge,Order 1051\npo_SAMPLE1102,2026-11-02,txn_S08,2026-11-01 10:12:00,2026-11-01,usd,-19.99,0.00,-19.99,refund,Refund for order 1051\npo_SAMPLE1102,2026-11-02,txn_S09,2026-11-01 00:00:00,2026-11-01,usd,-2.00,0.00,-2.00,fee,Billing - usage fee\n"
rate: "stripe-card"
```

**More worked examples (2)**

**A Shopify Payments payout with a chargeback and reserved funds, as Xero journal lines**

A Shopify Payments payout with a chargeback and reserved funds, as Xero journal lines

| Result | Value |
| --- | --- |
| answer | Your Shopify Payments payout of $126.18 on October 14, 2026 = $229.75 sales - $22.00 refunds - $49.00 chargebacks - $22.57 fees - $10.00 reserves. |
| Sales | credit $229.75 |
| Refunds | debit $22.00 |
| Chargebacks | debit $49.00 |
| Merchant fees | debit $22.57 |
| Processor reserve | debit $10.00 |
| Shopify Payments clearing | debit $126.18 |
| import file | shopify-payouts-xero.csv |

**The input**

```json
op: "journal"
text: "Transaction Date,Type,Order,Card Brand,Card Source,Payout Status,Payout Date,Available On,Amount,Fee,Net\n2026-10-12 10:14:03 -0400,charge,#1001,visa,online,paid,2026-10-14,2026-10-14,64.00,2.16,61.84\n2026-10-12 12:30:41 -0400,charge,#1002,master,online,paid,2026-10-14,2026-10-14,128.50,4.03,124.47\n2026-10-12 15:02:19 -0400,charge,#1003,amex,online,paid,2026-10-14,2026-10-14,37.25,1.38,35.87\n2026-10-13 09:41:00 -0400,refund,#0998,visa,online,paid,2026-10-14,2026-10-14,-22.00,0.00,-22.00\n2026-10-13 11:00:00 -0400,dispute,#0975,visa,online,paid,2026-10-14,2026-10-14,-49.00,15.00,-64.00\n2026-10-13 11:00:00 -0400,reserved_funds,,,,paid,2026-10-14,2026-10-14,-10.00,0.00,-10.00\n"
ledger: "xero"
```

**A PayPal Activity Download with sales tax, a refund, a chargeback fee and a withdrawal**

A PayPal Activity Download with sales tax, a refund, a chargeback fee and a withdrawal

| Result | Value |
| --- | --- |
| answer | PayPal USD activity from October 15, 2026 to October 20, 2026: $179.00 sales + $7.00 sales tax - $25.00 refunds - $27.95 fees = $133.05 net, of which $150.00 was withdrawn to the bank and the balance went from $74.73 to $57.78, to the cent. |
| withdrawn to the bank | $150.00 |
| balance | $74.73 to $57.78, ties |
| rows skipped | 1 |

**The input**

```json
op: "split"
text: "Date,Time,TimeZone,Name,Type,Status,Currency,Gross,Fee,Net,Transaction ID,Reference Txn ID,Balance,Sales Tax,Balance Impact\n10/20/2026,16:05:00,PDT,,General Withdrawal,Completed,USD,-150.00,0.00,-150.00,8SAMPLE0000000007,,57.78,0.00,Debit\n10/19/2026,09:30:12,PDT,,Chargeback Fee,Completed,USD,-20.00,0.00,-20.00,8SAMPLE0000000006,8SAMPLE0000000005,207.78,0.00,Debit\n10/18/2026,14:22:51,PDT,Sample Buyer C,Payment Refund,Completed,USD,-25.00,0.00,-25.00,8SAMPLE0000000005,8SAMPLE0000000002,227.78,0.00,Debit\n10/17/2026,11:02:33,PDT,Sample Buyer C,Express Checkout Payment,Completed,USD,25.00,-1.36,23.64,8SAMPLE0000000004,,252.78,0.00,Credit\n10/16/2026,18:45:09,PDT,Sample Buyer B,Express Checkout Payment,Completed,USD,54.00,-2.37,51.63,8SAMPLE0000000003,,229.14,0.00,Credit\n10/16/2026,18:45:09,PDT,Sample Buyer B,Authorization,Pending,USD,54.00,0.00,54.00,8SAMPLE0000000009,,,0.00,Memo\n10/15/2026,10:10:10,PDT,Sample Buyer A,Express Checkout Payment,Completed,USD,107.00,-4.22,102.78,8SAMPLE0000000002,,177.51,7.00,Credit\n"
```

## How is it tested?

The tests check CSV quoting, every written amount form, date orders, processor detection, each processor's sample file to the cent, deposits and unknown types, that every journal balances, and the import file columns and bytes.

**What its test suite asserts (3)**

- Every fact is dated and read on the processor's own page on 2026-11-08, and the fee presets match the published rates.
- Every Stripe reporting category and Square activity type lands in a known line; each processor's sample file splits to the cent.
- Every journal balances, accounts can be renamed and merged, and the import files have the documented columns and the same bytes every time.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Payout reconciliation: split a payout into sales, refunds, fees and tax tool](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/).

## Questions

### Is there any AI in the payout reconciliation: split a payout into sales, refunds, fees and tax answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the payout reconciliation: split a payout into sales, refunds, fees and tax refuse to answer?

Stripe, Shopify Payments and Square payout files carry no sales tax collected; book it from the store's sales report. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Payout reconciliation: split a payout into sales, refunds, fees and tax tool](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/payout-reconciliation/  
Data as of: 2026-11-04
