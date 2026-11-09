# How the bank-feed duplicate finder pairs and scores lines

Two lines are a candidate pair when they have the same amount to the cent and are at most 3 days apart (you can set 0 to 31), inside the feed, inside the books or one in each. Each pair scores up to 6 points on the date gap, the payee words and the reference: 4 or more is high confidence, 2 or 3 medium, 0 or 1 low.

## How does it work?

1. Each file is read as CSV (comma, tab or semicolon). The header row is the first of the first 40 rows with a Date column and an Amount (or Debit and Credit) column; title rows, account headings, Total rows and opening or closing balance rows are skipped, and lines marked Deleted are left out and counted.
2. Amounts become whole cents ("$1,234.56", "(45.00)" and "45.00-" all read); a decimal comma is refused rather than guessed.
3. A books file grouped by account keeps one account: the one you name, else the one with the most lines, and a warning lists the others.
4. Candidate pairs are two lines with exactly the same amount dated at most windowDays apart (default 3).
5. Each pair is scored: a 0-day gap is 2 points and 1 day is 1; payee words shared (over the shorter list, after dropping words like inc, pos, ach and card) of 0.6 or more is 2 points and 0.3 or more is 1; the same reference is 2.

> Steps 6 to 10, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/bank-feed-duplicate-finder/#what) below.

## What does it not cover?

- It lists likely duplicates and the action for each; it never excludes, deletes or changes anything in QuickBooks Online or Xero.
- It pairs only lines with the same amount to the cent, so a duplicate entered with a different amount is not found.
- One account per run, up to 20,000 lines a file and a window of 31 days.
- It is not accounting or tax advice. Check every pair against the bank statement, and ask your accountant before changing a closed or reconciled period.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 13 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The QuickBooks Online and Xero help pages behind the layouts, the copy to keep and the actions were read on their own sites on 2026-11-08; each page's own updated date is shown where it gives one. The matching rules live in the tool's code and change only by hand, with the tests that pin them.
- [Tested: 3 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): The tests check money and date reading, every layout (QuickBooks reports with title and Total rows, Intuit's 3- and 4-column bank CSV, Xero statement lines with Source and Status, Xero Account Transactions), the scoring at its boundaries, the worked bakery month (six pairs of three kinds), the window from 0 to 31 days, a reconnect pattern, Xero's keep rules, flipped signs, settling three copies, and that the same input gives the same output.

- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US), see the document, read 2026-11-08
- [Intuit QuickBooks: Match your bank and credit card transactions](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-feeds/match-online-bank-transactions-quickbooks-online/L6qyw0PvP_US_en_US), page updated 2026-08-14, read 2026-11-08
- [Intuit QuickBooks (South Africa): Remove duplicate bank transactions in QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-za/help-article/bank-transactions/remove-duplicate-bank-transactions-quickbooks/L3X1ZPiEW_ZA_en_ZA), Updated 1 month ago on 2026-11-08, read 2026-11-08
- [Intuit QuickBooks: Format CSV files in Excel to get bank transactions into QuickBooks](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/format-csv-files-excel-bank-transactions-quickbooks/L4BjLWckq_US_en_US), page updated 2026-08-24, read 2026-11-08
- [Intuit QuickBooks: Export your reports to Excel from QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-us/help-articles/export-your-reports-to-excel-from-quickbooks-online/00/262097), Updated 3 months ago on 2026-11-08, read 2026-11-08
- [Intuit QuickBooks (Canada): Lock your books in QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-ca/help-article/close-books/close-books-quickbooks-online/L59LelyPM_CA_en_CA), Updated 1 month ago on 2026-11-08, read 2026-11-08
- [Xero Central: Find and remove duplicate bank statement lines](https://central.xero.com/s/article/Find-and-remove-duplicate-bank-statement-lines), see the document, read 2026-11-08
- [Xero Central: Delete or restore a bank statement line](https://central.xero.com/s/article/Delete-or-restore-a-bank-statement-line), see the document, read 2026-11-08
- [Xero Central: View bank statements and bank statement lines](https://central.xero.com/s/article/View-bank-statements-and-bank-statement-lines-UK), see the document, read 2026-11-08
- [Xero Central: Export a list of uncoded bank statement lines](https://central.xero.com/s/article/Export-a-list-of-uncoded-bank-statement-lines), see the document, read 2026-11-08
- [Xero Central: Account Transactions report](https://central.xero.com/s/article/Account-Transactions-report-New), see the document, read 2026-11-08
- [Xero Central: Import a bank statement in CSV format](https://central.xero.com/0/article/Import-a-CSV-bank-statement-US), see the document, read 2026-11-08
- [Xero Central: About manually importing bank transactions](https://central.xero.com/0/article/About-manually-importing-bank-statements-US), see the document, read 2026-11-08

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the bank-feed duplicate finder for quickbooks online and xero compute?

Given the bank-feed lines waiting for review, the entries already posted to the same account, or both, as CSV, the tool lists every pair of lines that look like one transaction twice: twice in the feed, twice in the books, or a feed line already entered in the books.

**In detail: operations, inputs and outputs**

Each pair gets a confidence, which copy to keep and why, the cause, and the action in QuickBooks Online or Xero, with an exclude-ready CSV. It never removes, excludes or changes anything; every pair is for you to check against the bank statement.

Operations (the op field):

- `preview`: Reads both files and returns the answer in words, the line counts and date range, the number of pairs by kind and by confidence, the totals of the copies to act on, any whole date range that came in twice, and the warnings. No pair detail. Free.
- `report`: Does what preview does and also returns every pair (up to 2,000 listed, all counted): both lines, the score, the copy to keep and why, the cause, the action and any flags, plus the exclude-ready CSV and a CSV of every pair. The same two files again within 7 days, with other settings, are free.

Inputs:

- `feed`: The bank lines as CSV text, at most 2,000,000 characters and 20,000 lines: QuickBooks Online For review lines, a bank CSV in Intuit's 3-column (Date, Description, Amount) or 4-column (Date, Description, Credit, Debit) layout, or Xero statement lines. Optional when books is given.
- `books`: What is already posted to the account as CSV text: QuickBooks Online Transaction Detail by Account or a register export, Xero Account Transactions, or any CSV with a Date and an Amount (or Debit and Credit) column. Optional when feed is given.
- `windowDays`: The most days apart two lines of the same amount may be and still be paired: 0 to 31, default 3.
- `platform`: auto (default), qbo or xero: whose words the actions use. auto picks Xero when a file looks like a Xero export or carries Xero's Source values, otherwise QuickBooks Online.
- `compare`: auto (default), same or flipped: how the books file's signs compare with the bank's. auto tries both and keeps the one that pairs more lines across the two files, the same signs on a tie.
- `account`: When the books file holds several accounts, the one to check (its name or part of it). Default: the one with the most lines.
- `dateOrder`: auto (default), mdy or dmy for slash dates. auto reads the order from the values and falls back to MM/DD.

Outputs:

- answer: how many likely duplicates of each kind, their totals, the confidence split, any doubled date range, and the effect on the account balance
- platform, windowDays, compare, files (layout, account, lines, date order), lines and range
- counts and totals: pairs by confidence and kind, and the size of the copies to act on
- patterns: a date range where nearly every feed line came in twice or is already in the books
- pairs (report only): each pair with both lines, kind, cause, confidence, score, days apart, payee words shared, same reference, the copy kept and why, the action and flags
- csv.exclude and csv.pairs (report only), and warnings

**Every step in full (10) and the rules**

1. Each file is read as CSV (comma, tab or semicolon). The header row is the first of the first 40 rows with a Date column and an Amount (or Debit and Credit) column; title rows, account headings, Total rows and opening or closing balance rows are skipped, and lines marked Deleted are left out and counted.
2. Amounts become whole cents ("$1,234.56", "(45.00)" and "45.00-" all read); a decimal comma is refused rather than guessed. In a bank file Credit is money in; in a books report Debit is money into the bank account. Zero amounts are skipped.
3. A books file grouped by account keeps one account: the one you name, else the one with the most lines, and a warning lists the others.
4. Candidate pairs are two lines with exactly the same amount dated at most windowDays apart (default 3). With both files, the books amounts are compared as written or with their signs flipped, whichever gives more pairs across the files.
5. Each pair is scored: a 0-day gap is 2 points and 1 day is 1; payee words shared (over the shorter list, after dropping words like inc, pos, ach and card) of 0.6 or more is 2 points and 0.3 or more is 1; the same reference is 2. A score of 4 or more is high confidence, 2 or 3 medium, 0 or 1 low.
6. Pairs are settled best score first, then the smallest gap, then file order. A line is removed at most once, and a line kept is never also removed, so three copies make two pairs with one kept.
7. The copy to keep: the entry already in the books over a feed line; otherwise the reconciled or cleared copy; then, in Xero, the Bank Feed line over an imported one; else the earlier line.
8. An amount that appears three or more times on one side (rent, a subscription) caps that side's pairs at medium confidence. Two equal amounts on the same day in one file are flagged: both can be real.
9. At least 5 pairs of one kind covering 80% or more of the feed lines in their date range are named as a pattern: a feed downloaded twice, or a block of feed lines already in the books.
10. Each pair gets its action in the platform's words: Exclude in For review, Match to the entry already in the books (or exclude when it is already reconciled), Delete the statement line in Xero, or remove the extra entry from the books. When both copies are reconciled the action is to ask your accountant.

**Intuit QuickBooks help.**

Which copy to keep follows Intuit's help: "If one of the transactions is reconciled, keep that one." A feed line for a record you already entered is matched rather than added, and a line whose record is already reconciled is excluded (Intuit's match article). The causes named (an account connected twice, a reconnect that downloads history again, an imported file that overlaps the feed) are the ones Intuit lists.

**Xero Central.**

In Xero a duplicate statement line is deleted from Bank Statements; Xero says "You should only delete a statement line to remove a duplicate." Its own duplicate report compares date and amount only and "It doesn't show any partial matches", which is why this tool also pairs lines a few days apart.

## Which edge cases does it handle?

**The edge cases (6)**

- Two equal charges on the same day are listed but flagged, because the bank may really have charged twice.
- Rent paid on October 1 in the books and October 31 in the feed is not a pair: it is outside the window.
- Three copies of one charge make two pairs, both keeping the first copy.
- A credit card account exported with opposite signs in the books is compared with the signs flipped, and a warning says so.
- Dates that can only be day first (20/11) and only month first (11/20) in one column are refused, with both values named.
- With only a books file, only entries in the books twice are looked for, and a warning says to add the feed.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A made-up bakery's October register and the bank lines waiting in For review**

A made-up bakery's October register and the bank lines waiting in For review

| Result | Value |
| --- | --- |
| answer | Found 6 likely duplicates in 7 bank-feed lines and 16 books entries from October 1, 2026 to October 31, 2026, each the same amount within 3 days: 1 is in the feed twice ($1,198.05); 2 are feed lines already entered in the books ($1,358.50); 3 are in the books twice ($786.58). Confidence: 4 high, 1 medium, 1 low. The entries in the books twice make the account's balance $786.58 lower than it should be. |
| pair 1 | twice in the books, -$642.18, high: keep books line 10, act on books line 11; the earlier copy is kept |
| pair 2 | twice in the books, -$86.40, low: keep books line 14, act on books line 15; the earlier copy is kept |
| pair 3 | twice in the books, -$58.00, high: keep books line 18, act on books line 19; the earlier copy is kept |
| pair 4 | feed line already in the books, $1,245.90, medium: keep books line 21, act on feed line 2; the entry already in the books is kept |
| pair 5 | feed line already in the books, -$112.60, high: keep books line 22, act on feed line 3; the entry already in the books is kept |
| pair 6 | twice in the feed, $1,198.05, high: keep feed line 4, act on feed line 5; the earlier copy is kept |

**The input**

```json
op: "report"
feed: "Date,Description,Amount\r\n10/26/2026,SQUARE INC DEP,\"1,245.90\"\r\n10/28/2026,VERIZON WIRELESS,-112.60\r\n10/29/2026,SQUARE INC DEP,\"1,198.05\"\r\n10/29/2026,SQUARE INC DEP,\"1,198.05\"\r\n10/30/2026,COMCAST BUSINESS,-189.99\r\n10/30/2026,STAPLES 0412,-45.17\r\n10/31/2026,HARBOR PROPERTIES RENT,\"-2,400.00\"\r\n"
books: "Northwind Bakery (made-up sample)\r\nTransaction Detail by Account\r\n\"October 1-31, 2026\"\r\n\r\n,Date,Transaction Type,Num,Name,Memo/Description,Split,Amount,Balance\r\nBusiness Checking,,,,,,,,\r\n,10/01/2026,Expense,,Harbor Properties,October rent,Rent or Lease,\"-2,400.00\",\"-2,400.00\"\r\n,10/02/2026,Expense,,Comcast Business,,Utilities,-189.99,\"-2,589.99\"\r\n,10/03/2026,Deposit,,Square,Card sales,Sales,\"1,284.50\",\"-1,305.49\"\r\n,10/06/2026,Expense,,Sysco,Flour and dairy,Supplies,-642.18,\"-1,947.67\"\r\n,10/06/2026,Expense,,SYSCO FOOD SVC,,Supplies,-642.18,\"-2,589.85\"\r\n,10/08/2026,Check,1052,Rivera Electric,Oven repair,Repairs,-350.00,\"-2,939.85\"\r\n,10/10/2026,Deposit,,Square,Card sales,Sales,\"1,102.75\",\"-1,837.10\"\r\n,10/13/2026,Expense,,Amazon,Packaging,Supplies,-86.40,\"-1,923.50\"\r\n,10/14/2026,Expense,,AMZN Mktp US,,Supplies,-86.40,\"-2,009.90\"\r\n,10/15/2026,Expense,,Gusto,Payroll,Payroll Expenses,\"-4,215.33\",\"-6,225.23\"\r\n,10/17/2026,Deposit,,Square,Card sales,Sales,\"1,317.20\",\"-4,908.03\"\r\n,10/20/2026,Expense,,Shell,Van fuel,Car & Truck,-58.00,\"-4,966.03\"\r\n,10/20/2026,Expense,,Shell,Van fuel,Car & Truck,-58.00,\"-5,024.03\"\r\n,10/24/2026,Bill Payment (Check),1053,Sysco,,Accounts Payable (A/P),\"-1,018.44\",\"-6,042.47\"\r\n,10/27/2026,Deposit,,Square,Card sales,Sales,\"1,245.90\",\"-4,796.57\"\r\n,10/28/2026,Expense,,Verizon,Phones,Utilities,-112.60,\"-4,909.17\"\r\nTotal for Business Checking,,,,,,,\"-$4,909.17\",\r\n"
```

## How is it tested?

**What its test suite asserts (3)**

- The source pages are pinned with their read date, 2026-11-08, and the facts quoted from Intuit and Xero are checked word for word.
- Scoring is checked at its boundaries (4 or more high, 2 or 3 medium, 0 or 1 low), and the worked bakery month gives six pairs of three kinds with the copy kept and the action for each.
- The window from 0 to 31 days, a reconnect pattern, an overlapping upload, Xero's keep rules, flipped card signs and settling three copies are each tested, and the same input always gives the same output.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Bank-feed duplicate finder for QuickBooks Online and Xero tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/).

## Questions

### Is there any AI in the bank-feed duplicate finder for quickbooks online and xero answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the bank-feed duplicate finder for quickbooks online and xero refuse to answer?

It lists likely duplicates and the action for each; it never excludes, deletes or changes anything in QuickBooks Online or Xero. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Bank-feed duplicate finder for QuickBooks Online and Xero tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/bank-feed-duplicate-finder/  
Data as of: 2026-11-04
