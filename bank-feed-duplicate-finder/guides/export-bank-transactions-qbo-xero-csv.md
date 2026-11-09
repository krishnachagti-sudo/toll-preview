# Export bank transactions for a duplicate check

To check for duplicates you need two CSVs for one account and one date range, the bank lines and the books; in this worked card account the books were exported with charges positive and the bank with charges negative, and the tool flips the signs to pair 3 of 4 bank lines with their entries.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A10%2F04%2F2026%2CCHEVRON+0091842%2C-91.24%0D%0A10%2F12%2F2026%2CTHE+HOME+DEPOT+%236512%2C-742.30%0D%0A10%2F19%2F2026%2CCHEVRON+0091842%2C-88.06%0D%0A10%2F25%2F2026%2CNAPA+AUTO+PARTS%2C-31.50%0D%0A&books=Copperleaf+Landscaping+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Card%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C10%2F04%2F2026%2CExpense%2C%2CChevron%2CTruck+fuel%2CCar+%26+Truck%2C91.24%2C91.24%0D%0A%2C10%2F11%2F2026%2CExpense%2C%2CHome+Depot%2CStone%2CSupplies%2C742.30%2C833.54%0D%0A%2C10%2F18%2F2026%2CExpense%2C%2CChevron%2CTruck+fuel%2CCar+%26+Truck%2C88.06%2C921.60%0D%0ATotal+for+Business+Card%2C%2C%2C%2C%2C%2C%2C%24921.60%2C%0D%0A)

## QuickBooks Online

- The books: open Transaction Detail by Account for the bank or card account and the dates, then export. Intuit: Go to Reports and select Standard reports. Search for and select the report you want to export. Classic view: select the Export icon, then select Export to Excel. New enhanced experience: select Export/Print, then select Export to Excel. Save the file somewhere you can easily find, like your Downloads folder or your desktop. Open the file and save it as CSV.
- The bank lines: the lines waiting in For review for the same dates, or the bank's own CSV. Intuit's bank layouts: Date, Description, Amount, or Date, Description, Credit, Debit.

## Xero

- The statement lines: In the Accounting menu, select Bank accounts. At the top right of the screen, click the menu icon, then select Uncoded statement lines. Under Bank Account, select a specific bank account (or all, or Bulk download across all orgs). Enter dates in the From and To fields, then choose an Order By and Sort Order option. Click Run, then click Export and select the format.
- The books: the Account Transactions report for the bank account, with Debit and Credit. Xero: "The report must include the Debit and Credit columns for the running balance to work." It can be exported to either a PDF or spreadsheet format.

## Columns the check reads

Header names recognised (any order, any title rows above)

| Field | Header names |
| --- | --- |
| Date (required) | Date, Transaction Date, Posting Date, Posted Date |
| Amount (required) | Amount; or Debit and Credit; or Spent and Received; or Withdrawals and Deposits |
| Payee | Name, Payee, Contact, Vendor, Customer |
| Description | Memo/Description, Description, Details, Particulars |
| Reference | Num, Reference, Ref, Check number |
| Source | Source (Xero: Bank Feed, Imported, User) |
| Status | Status, Reconciled, Clr (Reconciled or R, Cleared or C, Deleted) |

## Signs

A bank file's credit is money in; a ledger report's debit is money into a bank account. Card accounts often differ: Intuit notes that for credit cards "deposits may appear as negative amounts because paying your credit card reduces your balance". Xero's CSV wants income positive and expenses negative. With the default setting the tool compares both ways and keeps the one that pairs more lines, and says so.

The worked card account, paired with the books' signs flipped

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | -$91.24 | feed line 2: 2026-10-04, CHEVRON 0091842 | books line 7: 2026-10-04, Chevron Truck fuel | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 2 | medium | -$742.30 | feed line 3: 2026-10-12, THE HOME DEPOT #6512 | books line 8: 2026-10-11, Home Depot Stone | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 3 | medium | -$88.06 | feed line 4: 2026-10-19, CHEVRON 0091842 | books line 9: 2026-10-18, Chevron Truck fuel | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |

## Sources

- [Intuit QuickBooks: Export your reports to Excel from QuickBooks Online (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-articles/export-your-reports-to-excel-from-quickbooks-online/00/262097)
- [Intuit QuickBooks: Format CSV files in Excel to get bank transactions into QuickBooks, updated August 24, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/format-csv-files-excel-bank-transactions-quickbooks/L4BjLWckq_US_en_US)
- [Xero Central: Export a list of uncoded bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/Export-a-list-of-uncoded-bank-statement-lines)
- [Xero Central: Account Transactions report (read November 8, 2026)](https://central.xero.com/s/article/Account-Transactions-report-New)
- [Xero Central: Import a bank statement in CSV format (read November 8, 2026)](https://central.xero.com/0/article/Import-a-CSV-bank-statement-US)

## Related

- [QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/)
- [Xero](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/xero/)
- [Checking many clients](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/batch-clients/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/export-bank-transactions-qbo-xero-csv/  
Data as of: 2026-11-08
