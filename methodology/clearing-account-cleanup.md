# How clearing account cleanup works: aging and matches

The tool first pairs each clearing line inside the account with the item it cleared, then ages what is still open into 0 to 30 days, 31 to 60 days, 61 to 90 days, over 90 days as of a date, then finds every set of open items whose amounts add up to each bank deposit to the cent, in whole cents. A deposit that two sets fit is never settled for you.

## How does it work?

1. The CSV is read with comma, tab or semicolon, and quotes and line breaks inside a field are handled. The header row is found in the first 40 rows by its column names (Date, Amount, Debit, Credit, Split, Related account and others); title rows, account headings and Total rows are skipped, and an opening balance row is kept as a figure.
2. Amounts are read to whole cents: "$1,234.56", "(45.00)", "45.00-" and -45 all work, and a decimal comma is refused rather than guessed.
3. The item side is the side the balance is on (debits for Undeposited Funds and Ask My Accountant).
4. Each clearing line is paired one for one with an item of the same amount dated no later than it (plus the window after), the same name first, then the closest earlier date. A clearing line left over is matched to a set of items in its window (the deposit window or 92 days, whichever is longer): when exactly one set fits, those items are cleared; when several fit, the line is left open and every set is listed.
5. What is still open is aged in days to the as-of date and put in a bucket: 0 to 30 days, 31 to 60 days, 61 to 90 days, over 90 days.

> Steps 6 to 8, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/clearing-account-cleanup/#what) below.

## What does it not cover?

- It lists matches and never posts a deposit or an entry to your books; when several sets fit, you choose with payment IDs, names and memos.
- It reads at most 20,000 lines in the account and 300 deposits at a time; a longer export must be split by date.
- Amounts with a decimal comma (1 234,56) are refused rather than guessed.
- It is not accounting or tax advice. Have your accountant review any journal entry before you clear leftovers.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 12 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): Uses no outside data in the answer: the matching is arithmetic on your own file. The QuickBooks, Xero, Zoho, Stripe and Microsoft pages behind the export layouts and the deposit steps were read on 2026-11-08. They change only by hand, with the tests that pin them.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check money read to whole cents from each export format, date order proven by the values, CSV quoting, QuickBooks and Xero layouts, bank CSVs, the set search with its pruning and limits, the fee ceiling, the worked Undeposited Funds export (netting, aging, tie-out, duplicates and four deposits), conflicts and ties, processor payouts after a fee, the quick match and that the same input gives the same output.

- [Intuit QuickBooks: Deposit payments into the Undeposited Funds account in QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-us/help-article/payroll-setup/deposit-payments-undeposited-funds-account-online/L1td0m8Z2_US_en_US), updated 2026-08-24, read 2026-11-08
- [Intuit QuickBooks: Record and make bank deposits in QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-deposits/record-make-bank-deposits-quickbooks-online/L2BBZOPdr_US_en_US), updated 2026-08-03, read 2026-11-08
- [Intuit QuickBooks: Record and make bank deposits in QuickBooks Desktop](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-deposits/record-make-bank-deposits-quickbooks-desktop/L2R3J0uic_US_en_US), updated 2026-08-03, read 2026-11-08
- [Intuit QuickBooks: Run a ledger report that shows debits and credits for each transaction](https://quickbooks.intuit.com/learn-support/en-us/help-article/profit-loss-reports/create-report-shows-debits-credits-transaction/L1zvqNX0e_US_en_US), updated 2026-08-03, read 2026-11-08
- [Intuit QuickBooks: Export your reports to Excel from QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-us/help-articles/export-your-reports-to-excel-from-quickbooks-online/00/262097), see the document, read 2026-11-08
- [QuickBooks Community: How do I clear old QuickBooks Payments from Undeposited Funds when merchant statements are no longer available?](https://quickbooks.intuit.com/community/payments-3/how-do-i-clear-old-quickbooks-payments-from-undeposited-funds-when-merchant-statements-are-no-longer-available-19748), see the document, read 2026-11-08
- [QuickBooks Community: Why can't I find a transaction to match to a bank deposit in QuickBooks Online?](https://quickbooks.intuit.com/community/banking-4/why-can-t-i-find-a-transaction-to-match-to-a-bank-deposit-in-quickbooks-online-24717), see the document, read 2026-11-08
- [QuickBooks Community: How do I clean up undeposited funds from the past?](https://quickbooks.intuit.com/community/banking-4/how-do-i-clean-up-undeposited-funds-from-the-past-20731), see the document, read 2026-11-08
- [Xero Central: Account Transactions report](https://central.xero.com/s/article/Account-Transactions-report-New), see the document, read 2026-11-08
- [Zoho Books: How do I transfer payments from undeposited funds to my bank account?](https://www.zoho.com/us/books/kb/banking/transfer-funds.html), see the document, read 2026-11-08
- [Stripe Docs: Payout reconciliation](https://docs.stripe.com/payouts/reconciliation), see the document, read 2026-11-08
- [Microsoft Support: Define and solve a problem by using Solver](https://support.microsoft.com/en-us/office/define-and-solve-a-problem-by-using-solver-5d1a388f-079d-43ac-a7eb-f63e45925040), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the clearing account cleanup: aging and exact deposit matches compute?

Given an account export from QuickBooks Online, Xero or any CSV with a date and an amount, the tool reads the account's lines, nets off what already clears inside the account (a deposit or transfer out of Undeposited Funds, a reclass out of Ask My Accountant), ages every open item, and for each bank deposit lists every set of open items that adds up to it within a date window.

**In detail: operations, inputs and outputs**

With a fee allowance it also lists sets that exceed a deposit by up to that percent, apart from the exact ones. It lists matches; it never posts a deposit or an entry to your books.

Operations (the op field):

- `preview`: Returns the account, the layout read, the as-of date, the tie-out of the lines to the report's own total, what nets off, the open count and total, the aging buckets, the over-a-year count, the possible duplicates and how many deposits match exactly, several ways, only after a fee, or not at all. Free.
- `report`: Does what preview does and also returns every open item with its age, bucket and flags, what each clearing line netted off against, every match set for each deposit, the payee totals and two CSV working papers (open items and matches). The same ledger file is free again for 7 days.
- `match`: Takes up to 200 payment amounts and up to 50 deposits, with no ledger file, and returns every set of payments that adds up to each deposit, closest by date first.

Inputs:

- `ledger`: The clearing account export as CSV text, at most 2,000,000 characters and 20,000 lines in the chosen account: QuickBooks Online Transaction Detail by Account or General Ledger, Xero Account Transactions, or any CSV with a Date and an Amount (or Debit and Credit) column.
- `bank, deposits`: A bank statement CSV of at most 1,000,000 characters, read for money in only, and/or a list of deposits with an amount and optionally a date, reference and memo; at most 300 deposits in one report.
- `account`: The account to clean up when the file holds several. Without it: the only account, or the first one named like a clearing account (Undeposited Funds, Payments to Deposit, Ask My Accountant, suspense, clearing, uncategorized or Opening Balance Equity).
- `asOf, dateOrder`: The date to age items to (default: the latest date in the file), and how slash dates are written: auto (default, read from the values, falling back to MM/DD), mdy or dmy.
- `windowBefore, windowAfter`: How many days before a deposit a payment may be dated (default 31, at most 366) and after it (default 3, at most 31).
- `feePercent, maxSetSize`: List sets that exceed a deposit by up to this percent of their total (default 0, exact only; at most 10); the most payments in one set (default 12, at most 25).
- `payments (match only)`: The amounts to combine, each with an optional date, reference and name.

Outputs:

- answer: the open items and their total as of the date, how many are over 90 days, what already nets off, and how the deposits matched
- balance: the lines added up against the report's own total, with the difference and the opening balance
- netted, openCount, openTotal, aging (four buckets with count and total), overYear and duplicates
- deposits: how many were given and how many are exact, several, fee, conflict, none or incomplete
- open, netOff, matches, payees and csv (report only); answer and deposits per deposit (match)
- warnings and disclaimers

**Every step in full (8) and the rules**

1. The CSV is read with comma, tab or semicolon, and quotes and line breaks inside a field are handled. The header row is found in the first 40 rows by its column names (Date, Amount, Debit, Credit, Split, Related account and others); title rows, account headings and Total rows are skipped, and an opening balance row is kept as a figure.
2. Amounts are read to whole cents: "$1,234.56", "(45.00)", "45.00-" and -45 all work, and a decimal comma is refused rather than guessed. Slash dates are read in the order the values prove (a day over 12 settles it), or MM/DD when nothing does.
3. The item side is the side the balance is on (debits for Undeposited Funds and Ask My Accountant). Lines on the other side are clearing lines: deposits out of the account, reclass journals.
4. Each clearing line is paired one for one with an item of the same amount dated no later than it (plus the window after), the same name first, then the closest earlier date. A clearing line left over is matched to a set of items in its window (the deposit window or 92 days, whichever is longer): when exactly one set fits, those items are cleared; when several fit, the line is left open and every set is listed.
5. What is still open is aged in days to the as-of date and put in a bucket: 0 to 30 days, 31 to 60 days, 61 to 90 days, over 90 days. Each item is flagged when it is the opening balance, an unmatched clearing line, a possible duplicate (same date, amount, name and number), over a year old, or dated after the as-of date.
6. For each deposit, the open items within the date window are the candidates (the 40 nearest by date when more fit). Every set of up to maxSetSize candidates that adds up to the deposit to the cent is counted, and up to 20 are listed, closest by date and then fewest items first. The search stops after 2,000,000 steps for one deposit and 40,000,000 for one report, and says so.
7. One exact set is "exact"; more than one is "several", and none is chosen for you. Two exact sets that use the same item are both marked "conflict". With a fee allowance and no exact set, sets totaling more than the deposit by up to feePercent of their own total are listed as "fee", with the fee each implies.
8. The lines are added up and compared with the total the report shows, so a wrong date range or basis is caught. Payee totals are listed largest first with their share of the open balance.

**QuickBooks and Xero.**

Intuit describes Undeposited Funds as "a temporary account that holds payments you plan to deposit later at the bank", and says QuickBooks looks for a single matching record, not several combined ones; this tool lists the combinations a bank deposit window needs. The deposit steps it points to are Intuit's own, read on 2026-11-08.

Xero's Account Transactions report lists transactions oldest first within each account and needs the Debit and Credit columns for its running balance (Xero Central, read 2026-11-08).

**Before you record anything.**

When more than one set of payments fits a deposit, every set is shown and none is chosen for you. Confirm with payment IDs, names and memos before you record the deposit. Have your accountant review any journal entry before you clear leftovers, especially into a year that is already closed or filed.

## Which edge cases does it handle?

**The edge cases (6)**

- A clearing line that could pair with more than one item of the same amount takes the one with the same name, then the closest earlier date, and the answer says how many such ties there were.
- An opening balance is aged as one item on the report's first day, with a warning to run the report from an earlier date to see its items.
- Two deposits whose only exact sets share an item are both marked as a conflict rather than settled.
- A fee is measured as a share of the set's total, not of the deposit, the way a processor takes its fee off the payments.
- A file with several accounts uses the one named, or the first clearing-type account, and warns which others it holds.
- Items dated after the as-of date are counted in the first bucket and flagged.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A made-up Undeposited Funds export with four bank deposits and a 3% fee allowance**

A made-up Undeposited Funds export with four bank deposits and a 3% fee allowance

| Result | Value |
| --- | --- |
| answer | Undeposited Funds holds 14 open payments totaling $7,072.74 as of October 30, 2026 (the latest date in the file). 2 are over 90 days old ($1,285.00), 2 of them over a year. 5 lines already net off inside the account (1 one-for-one pair and 1 clearing line made of several items). 2 of 4 bank deposits are matched exactly by one set of open items; 1 has more than one possible set; 1 matches only after a fee. |
| layout | QuickBooks account report (Transaction Detail by Account or General Ledger) |
| 0 to 30 days | 7: $3,549.99 |
| 31 to 60 days | 4: $1,787.75 |
| 61 to 90 days | 1: $450.00 |
| Over 90 days | 2: $1,285.00 |
| deposits | 2 exact, 1 several, 1 after a fee, 0 none |

**The input**

```json
op: "preview"
ledger: "Harbor Lane Studio (made-up sample)\r\nTransaction Detail by Account\r\n\"January 1, 2025 - October 31, 2026\"\r\n\r\n,Date,Transaction Type,Num,Name,Memo/Description,Split,Amount,Balance\r\nUndeposited Funds,,,,,,,,\r\n,03/14/2025,Payment,1041,Birch Cafe,,Accounts Receivable (A/R),\"1,200.00\",\"1,200.00\"\r\n,06/02/2025,Sales Receipt,1077,Walk-in sale,,Sales,85.00,\"1,285.00\"\r\n,07/06/2026,Payment,2210,Oak & Co,,Accounts Receivable (A/R),640.00,\"1,925.00\"\r\n,07/08/2026,Payment,2214,Lumen Dental,,Accounts Receivable (A/R),\"1,150.00\",\"3,075.00\"\r\n,07/10/2026,Deposit,,,,Business Checking,\"-1,790.00\",\"1,285.00\"\r\n,08/03/2026,Payment,2251,Birch Cafe,,Accounts Receivable (A/R),300.00,\"1,585.00\"\r\n,08/04/2026,Deposit,,Birch Cafe,,Business Checking,-300.00,\"1,285.00\"\r\n,08/20/2026,Payment,2268,Pine Street Gym,,Accounts Receivable (A/R),450.00,\"1,735.00\"\r\n,09/05/2026,Payment,2280,Oak & Co,,Accounts Receivable (A/R),275.50,\"2,010.50\"\r\n,09/09/2026,Payment,2283,Lumen Dental,,Accounts Receivable (A/R),412.25,\"2,422.75\"\r\n,09/12/2026,Payment,2290,Rivera Plumbing,,Accounts Receivable (A/R),687.75,\"3,110.50\"\r\n,09/18/2026,Payment,2297,Pine Street Gym,,Accounts Receivable (A/R),412.25,\"3,522.75\"\r\n,10/02/2026,Payment,2305,Birch Cafe,,Accounts Receivable (A/R),960.00,\"4,482.75\"\r\n,10/06/2026,Payment,2311,Lumen Dental,,Accounts Receivable (A/R),540.00,\"5,022.75\"\r\n,10/09/2026,Payment,2316,Oak & Co,,Accounts Receivable (A/R),230.00,\"5,252.75\"\r\n,10/14/2026,Payment,2320,Rivera Plumbing,,Accounts Receivable (A/R),320.00,\"5,572.75\"\r\n,10/14/2026,Payment,2320,Rivera Plumbing,,Accounts Receivable (A/R),320.00,\"5,892.75\"\r\n,10/27/2026,Payment,2334,Pine Street Gym,,Accounts Receivable (A/R),\"1,050.00\",\"6,942.75\"\r\n,10/30/2026,Sales Receipt,2339,Walk-in sale,,Sales,129.99,\"7,072.74\"\r\nTotal for Undeposited Funds,,,,,,,\"$7,072.74\",\r\n"
bank: "Date,Description,Amount\r\n09/14/2026,DEPOSIT,963.25\r\n09/15/2026,ACH VENDOR PAYMENT,-220.00\r\n09/22/2026,DEPOSIT,412.25\r\n10/16/2026,DEPOSIT,\"1,500.00\"\r\n10/29/2026,DEPOSIT,\"1,019.25\"\r\n"
feePercent: 3
```

**More worked examples (1)**

**Which payments add up to a $963.25 deposit?**

Which payments add up to a $963.25 deposit?

| Result | Value |
| --- | --- |
| answer | $963.25: one set fits, payments 1, 3. |
| status | exact |
| sets found | 1 |

**The input**

```json
{
  "op": "match",
  "payments": [
    {
      "amount": 275.5,
      "date": "2026-09-05",
      "ref": "2280"
    },
    {
      "amount": 412.25,
      "date": "2026-09-09",
      "ref": "2283"
    },
    {
      "amount": 687.75,
      "date": "2026-09-12",
      "ref": "2290"
    },
    {
      "amount": 450,
      "date": "2026-08-20",
      "ref": "2268"
    }
  ],
  "deposits": [
    {
      "amount": 963.25,
      "date": "2026-09-14"
    }
  ]
}
```

## How is it tested?

**What its test suite asserts (3)**

- Money is read to whole cents from each export format, and slash dates in the order the values prove.
- The worked Undeposited Funds export nets off, ages and ties out to its own total, and each of its four deposits matches as expected: exact, several, after a fee.
- The set search finds every set, stops at its step budget and says so; two exact sets sharing an item are a conflict; the same input gives the same output.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Clearing account cleanup: aging and exact deposit matches tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/).

## Questions

### Is there any AI in the clearing account cleanup: aging and exact deposit matches answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the clearing account cleanup: aging and exact deposit matches refuse to answer?

It lists matches and never posts a deposit or an entry to your books; when several sets fit, you choose with payment IDs, names and memos. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Clearing account cleanup: aging and exact deposit matches tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/clearing-account-cleanup/  
Data as of: 2026-11-04
