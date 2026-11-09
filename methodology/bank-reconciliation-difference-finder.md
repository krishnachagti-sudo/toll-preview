# How the bank reconciliation difference finder works

Statement and ledger lines are matched one to one on the same amount within 7 days (or the same check number within 120 days); what is left is explained as timing (outstanding checks, deposits in transit) or as a likely error found by arithmetic: a transposition is a multiple of 9, a slide is ten times an amount, a sign flip moves the balance by twice it.

## What does the bank reconciliation difference finder compute?

Give the bank statement CSV and the ledger for the same account (QuickBooks Online Transaction Detail by Account, Xero Account Transactions or any CSV with a date and an amount) and the tool works out the difference at the statement date, matches every line it can, sets timing items apart from likely errors, finds the date the running balances first disagreed and writes the reconciliation statement. It never changes your books: every hint names both lines and the arithmetic, to check against the statement.

Operations (the op field):

- `preview`: Returns the answer, the difference, how much is timing and how much is not, the counts of matches and unmatched lines, the break date and the statement totals, without the line detail. Free.
- `report`: Returns every match and unmatched line, each error hint, the timing items aged, the balance trail, the reconciliation statement and the CSVs. The same two files again within 7 days are free.
- `check`: For one difference, whether a single adjacent-digit swap, a slide or a sign flip can explain it, and which of the given amounts could have produced it. Free.

Inputs:

- `statement`: The bank's lines as CSV text, up to 2,000,000 characters: a bank download (Date, Description, Amount, optionally Balance, or Debit and Credit), Intuit's 3- or 4-column layout, Xero's import fields or its uncoded statement lines.
- `ledger`: The books' lines for the same account as CSV text, with Beginning, Opening or Closing Balance rows and a balance column read when present.
- `windowDays, staleDays`: How many days apart the same amount may still match (default 7, at most 60), and when an outstanding item is stale (default 90 days).
- `balances, periodEnd`: Opening and closing balances of either side and the statement date, when the files do not show them.
- `compare, account, dateOrder`: Whether the ledger's signs are flipped (a card account), which account of a several-account ledger to use, and how slash dates are written.
- `difference, amounts`: For check: the difference and, optionally, the period's amounts.

Outputs:

- answer: the difference, how many lines match, what timing explains, what the rest comes from and the break date
- difference, timing, notTiming, counts, balances and the break date
- report: matches, hints, items, the balance trail, the reconciliation statement and CSVs with formula cells made plain text

## How is it calculated, step by step?

1. Both files are read by their headings: amounts into whole cents ("(45.00)", "45.00-", CR and DR suffixes), dates as ISO, slash dates (the order read from the values, MM/DD by default) or Xero's word dates. A decimal comma is refused rather than guessed.
2. Balance columns and balance rows are read; a balance column is used only when at least 80% of rows chain from one to the next.
3. Lines are matched one to one: the same amount within the window, or the same check or reference number within 120 days, best score first. Then one line against two to 4 on the other side (a split deposit), only when exactly one set fits.
4. Error hints come first, from arithmetic only: a digit transposition (an actual swap of two adjacent digits), a slide (ten times another amount), a sign flip (the same amount the other way), a wrong amount on the same reference and a books line that repeats a matched one.
5. Then timing: books lines on or before the statement date are outstanding payments or deposits in transit, aged and flagged when stale; bank lines are items the books do not have yet.
6. The reconciliation statement sets the adjusted bank balance against the adjusted books balance; the difference that is not timing is reported, and the break date is the first date something the books are missing or have wrong took effect, or before the files start when the opening balances already differ.

**Export layouts.**

The ledger and statement layouts and report names follow Intuit's and Xero's own help pages, read on 2026-11-08.

## Which edge cases does it handle?

- Equal amounts on the same day are flagged as ambiguous rather than paired by guess.
- A pair further apart than the window is matched only by reference, with a date flag.
- A card account exported with opposite signs is flipped when more amounts agree that way, or as chosen.
- A closing balance you enter overrides the file's, and balances that do not add up are reported.
- The same input always gives the same output.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A made-up bakery's October statement and its QuickBooks Online ledger**

```json
op: "preview"
statement: "Date,Description,Amount,Balance\r\n10/01/2026,HARBOR PROPERTIES RENT,\"-2,400.00\",\"10,442.10\"\r\n10/02/2026,SQUARE INC DEP,\"1,245.90\",\"11,688.00\"\r\n10/05/2026,MONTHLY SERVICE FEE,-15.00,\"11,673.00\"\r\n10/06/2026,SYSCO FOOD SVC,-540.00,\"11,133.00\"\r\n10/09/2026,SQUARE INC DEP,\"1,182.50\",\"12,315.50\"\r\n10/12/2026,CHECK 1049,-275.00,\"12,040.50\"\r\n10/15/2026,GUSTO PAYROLL,\"-4,215.33\",\"7,825.17\"\r\n10/16/2026,SQUARE INC DEP,\"1,317.20\",\"9,142.37\"\r\n10/19/2026,COMCAST BUSINESS,-189.99,\"8,952.38\"\r\n10/21/2026,DEPOSIT,\"1,245.90\",\"10,198.28\"\r\n10/23/2026,SQUARE INC DEP,\"1,274.30\",\"11,472.58\"\r\n10/27/2026,SHELL OIL 5741,-61.20,\"11,411.38\"\r\n10/30/2026,SQUARE INC DEP,\"1,299.75\",\"12,711.13\"\r\n"
ledger: "Northwind Bakery (made-up sample)\r\nTransaction Detail by Account\r\n\"October 1-31, 2026\"\r\n\r\n,Date,Transaction Type,Num,Name,Memo/Description,Split,Amount,Balance\r\nBusiness Checking,,,,,,,,\r\nBeginning Balance,,,,,,,,\"12,842.10\"\r\n,10/01/2026,Expense,,Harbor Properties,October rent,Rent or Lease,\"-2,400.00\",\"10,442.10\"\r\n,10/02/2026,Deposit,,Square,Card sales,Sales,\"1,245.90\",\"11,688.00\"\r\n,10/03/2026,Check,1049,Rivera Electric,Oven repair,Repairs,-275.00,\"11,413.00\"\r\n,10/06/2026,Expense,,Sysco,Flour and dairy,Supplies,-450.00,\"10,963.00\"\r\n,10/09/2026,Deposit,,Square,Card sales,Sales,\"1,182.50\",\"12,145.50\"\r\n,10/15/2026,Expense,,Gusto,Payroll,Payroll Expenses,\"-4,215.33\",\"7,930.17\"\r\n,10/16/2026,Deposit,,Square,Card sales,Sales,\"1,317.20\",\"9,247.37\"\r\n,10/19/2026,Expense,,Comcast Business,Internet,Utilities,-189.99,\"9,057.38\"\r\n,10/20/2026,Deposit,,Lakeside Cafe,Wholesale invoice 2210,Sales,745.90,\"9,803.28\"\r\n,10/20/2026,Deposit,,Hill School,Catering invoice 2211,Sales,500.00,\"10,303.28\"\r\n,10/23/2026,Deposit,,Square,Card sales,Sales,\"1,274.30\",\"11,577.58\"\r\n,10/27/2026,Expense,,Shell,Van fuel,Car & Truck,-61.20,\"11,516.38\"\r\n,10/28/2026,Check,1053,Pacific Produce,Fruit,Supplies,-312.75,\"11,203.63\"\r\n,10/30/2026,Deposit,,Square,Card sales,Sales,\"1,299.75\",\"12,503.38\"\r\n,10/31/2026,Deposit,,Front counter,Cash sales,Sales,412.60,\"12,915.98\"\r\nTotal for Business Checking,,,,,,,$73.88,\r\n"
```

A made-up bakery's October statement and its QuickBooks Online ledger

| Result | Value |
| --- | --- |
| answer | At October 31, 2026 the statement shows $12,711.13 and the books $12,915.98: a difference of $204.85. 11 lines match (1 as a split) and 5 lines are on one side only. Timing explains $99.85 (1 outstanding check and 1 deposit in transit); the other $105.00 (the books are higher) comes from 1 likely transposition and 1 bank line missing from the books. The running balances first disagree on October 5, 2026. |

**Is a $90.00 difference two swapped digits?**

```json
{
  "op": "check",
  "difference": "90.00",
  "amounts": [
    "450.00",
    "1,245.90",
    "312.75"
  ]
}
```

Is a $90.00 difference two swapped digits?

| Result | Value |
| --- | --- |
| answer | $90.00 is divisible by 9 ($90.00 / 9 = $10.00), so a transposition is possible: two adjacent digits 1 apart in the $100 and $10 places. Amounts that become it with one swap: $450.00 (vs $540.00). |

## What does it not do?

- A file with no header, a bad window, or an amount or date it cannot read is refused with the line.
- A hint is an arithmetic clue, not proof: check it against the statement before correcting anything.
- It never posts, adjusts or changes your books. Not accounting or tax advice. Files are processed in memory and not kept.

## Where does the data come from, and how fresh is it?

Uses no rates: it is arithmetic on your two files. The export layouts, report names and facts the pages quote were read on Intuit's and Xero's own help pages on 2026-11-08, and the pages are checked daily for changes.

- [Intuit: Fix reconciliation discrepancies in QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-us/bank-transactions/fix-reconciliation-discrepancies/00/201285)
- [Intuit: Reconcile an account in QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-us/help-article/statement-reconciliation/reconcile-account-quickbooks-online/L3XzsllsK_US_en_US)
- [Intuit: Enter an adjusting entry for a reconciliation](https://quickbooks.intuit.com/learn-support/en-us/help-article/statement-reconciliation/enter-adjusting-entry-reconciliation-quickbooks/L2m1jHhBS_US_en_US)
- [Intuit: Undo a client's entire reconciliation](https://quickbooks.intuit.com/learn-support/en-ca/help-article/statement-reconciliation/undo-clients-reconciliation-quickbooks-online/L2rUvgAg6_CA_en_CA)
- [Intuit: Ledger report with debits and credits](https://quickbooks.intuit.com/learn-support/en-us/help-article/profit-loss-reports/create-report-shows-debits-credits-transaction/L1zvqNX0e_US_en_US)
- [Intuit: Format CSV files for bank transactions](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/format-csv-files-excel-bank-transactions-quickbooks/L4BjLWckq_US_en_US)
- [Xero Central: Bank Reconciliation reports](https://central.xero.com/0/article/Bank-Reconciliation-Summary)
- [Xero Central: Bank Reconciliation Detail report](https://central.xero.com/0/article/Bank-Reconciliation-Detail-report)
- [Xero Central: Account Transactions report](https://central.xero.com/s/article/Account-Transactions-report-New)
- [Xero Central: Export uncoded statement lines](https://central.xero.com/s/article/Export-a-list-of-uncoded-bank-statement-lines)

Uses no rates: it is arithmetic on your two files. The export layouts, report names and facts the pages quote were read on Intuit's and Xero's own help pages on 2026-11-08, and the pages are checked daily for changes.

Bank reconciliation difference finder: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [Intuit: Fix reconciliation discrepancies in QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-us/bank-transactions/fix-reconciliation-discrepancies/00/201285) | see the document | 2026-11-08 |
| [Intuit: Reconcile an account in QuickBooks Online](https://quickbooks.intuit.com/learn-support/en-us/help-article/statement-reconciliation/reconcile-account-quickbooks-online/L3XzsllsK_US_en_US) | see the document | 2026-11-08 |
| [Intuit: Enter an adjusting entry for a reconciliation](https://quickbooks.intuit.com/learn-support/en-us/help-article/statement-reconciliation/enter-adjusting-entry-reconciliation-quickbooks/L2m1jHhBS_US_en_US) | see the document | 2026-11-08 |
| [Intuit: Undo a client's entire reconciliation](https://quickbooks.intuit.com/learn-support/en-ca/help-article/statement-reconciliation/undo-clients-reconciliation-quickbooks-online/L2rUvgAg6_CA_en_CA) | see the document | 2026-11-08 |
| [Intuit: Ledger report with debits and credits](https://quickbooks.intuit.com/learn-support/en-us/help-article/profit-loss-reports/create-report-shows-debits-credits-transaction/L1zvqNX0e_US_en_US) | see the document | 2026-11-08 |
| [Intuit: Format CSV files for bank transactions](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/format-csv-files-excel-bank-transactions-quickbooks/L4BjLWckq_US_en_US) | see the document | 2026-11-08 |
| [Xero Central: Bank Reconciliation reports](https://central.xero.com/0/article/Bank-Reconciliation-Summary) | see the document | 2026-11-08 |
| [Xero Central: Bank Reconciliation Detail report](https://central.xero.com/0/article/Bank-Reconciliation-Detail-report) | see the document | 2026-11-08 |
| [Xero Central: Account Transactions report](https://central.xero.com/s/article/Account-Transactions-report-New) | see the document | 2026-11-08 |
| [Xero Central: Export uncoded statement lines](https://central.xero.com/s/article/Export-a-list-of-uncoded-bank-statement-lines) | see the document | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests check the money and date reading, the QuickBooks and Xero layouts, a worked month to the cent (matches by check number and split, a transposition, a missing fee, timing and the statement), every error hint, the break date, stale items, flipped card accounts, ambiguity, the checker and that the outputs are the same every time.

What its test suite asserts:

- A worked month reconciles to the cent: matches by check number and split, a transposition, a missing fee, timing items and the statement.
- Every error hint (swap, slide, sign flip, wrong amount, duplicate) and the break date are tested; the same input gives the same output.
- Export layouts are only from Intuit's and Xero's own pages, read on 2026-11-08.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the Bank reconciliation difference finder tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/).

## Questions

### Is there any AI in the bank reconciliation difference finder answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the bank reconciliation difference finder refuse to answer?

A file with no header, a bad window, or an amount or date it cannot read is refused with the line. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Bank reconciliation difference finder tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/bank-reconciliation-difference-finder/  
Data as of: 2026-11-04
