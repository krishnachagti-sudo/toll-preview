# Find a reconciliation discrepancy in QuickBooks Online

QuickBooks Online shows the reconciliation difference but not which line causes it; in this worked October file the statement and the Transaction Detail by Account export differ by $204.85, of which $99.85 is timing, and the other $105.00 is a $450.00 payment that the bank shows as $540.00 plus a $15.00 bank fee missing from the books, first on October 5, 2026.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%2CBalance%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A10%2F02%2F2026%2CSQUARE+INC+DEP%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A10%2F05%2F2026%2CMONTHLY+SERVICE+FEE%2C-15.00%2C%2211%2C673.00%22%0D%0A10%2F06%2F2026%2CSYSCO+FOOD+SVC%2C-540.00%2C%2211%2C133.00%22%0D%0A10%2F09%2F2026%2CSQUARE+INC+DEP%2C%221%2C182.50%22%2C%2212%2C315.50%22%0D%0A10%2F12%2F2026%2CCHECK+1049%2C-275.00%2C%2212%2C040.50%22%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%227%2C825.17%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%221%2C317.20%22%2C%229%2C142.37%22%0D%0A10%2F19%2F2026%2CCOMCAST+BUSINESS%2C-189.99%2C%228%2C952.38%22%0D%0A10%2F21%2F2026%2CDEPOSIT%2C%221%2C245.90%22%2C%2210%2C198.28%22%0D%0A10%2F23%2F2026%2CSQUARE+INC+DEP%2C%221%2C274.30%22%2C%2211%2C472.58%22%0D%0A10%2F27%2F2026%2CSHELL+OIL+5741%2C-61.20%2C%2211%2C411.38%22%0D%0A10%2F30%2F2026%2CSQUARE+INC+DEP%2C%221%2C299.75%22%2C%2212%2C711.13%22%0D%0A&ledger=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C%2212%2C842.10%22%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2COctober+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A%2C10%2F02%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A%2C10%2F03%2F2026%2CCheck%2C1049%2CRivera+Electric%2COven+repair%2CRepairs%2C-275.00%2C%2211%2C413.00%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSysco%2CFlour+and+dairy%2CSupplies%2C-450.00%2C%2210%2C963.00%22%0D%0A%2C10%2F09%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C182.50%22%2C%2212%2C145.50%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%227%2C930.17%22%0D%0A%2C10%2F16%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C317.20%22%2C%229%2C247.37%22%0D%0A%2C10%2F19%2F2026%2CExpense%2C%2CComcast+Business%2CInternet%2CUtilities%2C-189.99%2C%229%2C057.38%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CLakeside+Cafe%2CWholesale+invoice+2210%2CSales%2C745.90%2C%229%2C803.28%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CHill+School%2CCatering+invoice+2211%2CSales%2C500.00%2C%2210%2C303.28%22%0D%0A%2C10%2F23%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C274.30%22%2C%2211%2C577.58%22%0D%0A%2C10%2F27%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-61.20%2C%2211%2C516.38%22%0D%0A%2C10%2F28%2F2026%2CCheck%2C1053%2CPacific+Produce%2CFruit%2CSupplies%2C-312.75%2C%2211%2C203.63%22%0D%0A%2C10%2F30%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C299.75%22%2C%2212%2C503.38%22%0D%0A%2C10%2F31%2F2026%2CDeposit%2C%2CFront+counter%2CCash+sales%2CSales%2C412.60%2C%2212%2C915.98%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%2473.88%2C%0D%0A)

## The two files

- The ledger: in QuickBooks Online, Intuit says to "start with the Transaction Detail by Account report" and filter it to the bank account ("Select the Filter by dropdown, then select Account."), for the statement's dates. Then export it: Go to Reports and select Standard reports. Find the report and select it. Classic view: select the Export icon, then Export to Excel. Enhanced view: select Export/Print, then Export to Excel. Save the file somewhere easy to find. Save the sheet as CSV. Its Beginning Balance row and Balance column are read too.
- The statement: your bank's CSV download for the same dates. The reader takes Intuit's bank layouts (Date, Description, Amount or Date, Description, Credit, Debit), with a Balance column when the bank gives one, and most other bank CSVs with a date and an amount.
- Both files are read in your browser for the free preview; the paid report sends them to the server, where they are processed in memory and not kept.

## The worked file

A made-up bakery's Business Checking for October 2026: 13 statement lines and 15 ledger lines. At October 31, 2026 the statement shows $12,711.13 and the books $12,915.98: a difference of $204.85. 11 lines match (1 as a split) and 5 lines are on one side only. Timing explains $99.85 (1 outstanding check and 1 deposit in transit); the other $105.00 (the books are higher) comes from 1 likely transposition and 1 bank line missing from the books. The running balances first disagree on October 5, 2026.

Likely errors

| Date | Kind | Bank | Books | Effect |
| --- | --- | --- | --- | ---: |
| 2026-10-06 | digit transposition | bank 2026-10-06 -$540.00 SYSCO FOOD SVC | books 2026-10-06 -$450.00 Sysco Flour and dairy | -$90.00 |

Lines on one side only

| Date | What | Line | Amount | Age (days) |
| --- | --- | --- | ---: | ---: |
| 2026-10-05 | in the bank, not in the books (bank fee) | MONTHLY SERVICE FEE | -$15.00 | 26 |
| 2026-10-28 | outstanding check | Pacific Produce Fruit | -$312.75 | 3 |
| 2026-10-31 | deposit in transit | Front counter Cash sales | $412.60 | 0 |

The reconciliation statement

| Line | Amount |
| --- | ---: |
| Balance per bank statement | $12,711.13 |
| Add: deposits in transit | $412.60 |
| Less: outstanding checks and payments | $312.75 |
| **Adjusted bank balance** | **$12,810.98** |
| Balance per books | $12,915.98 |
| Bank lines not in the books | -$15.00 |
| Corrections the hints point to | -$90.00 |
| **Adjusted books balance** | **$12,810.98** |

## What QuickBooks Online shows, and what it does not

- While you tick lines, the Difference field counts down. Intuit: "Enter the Ending balance and Ending date from your account statement." then "Continue matching until the Difference is $0.00."
- Past reconciliations: "To see these reports, on the Reconcile page, select History by account."
- Intuit's three reports to run when the beginning balance is off: Reconciliation Discrepancy report, Missing Checks report, Transaction Detail report. None of them compares your statement line by line.
- Check 1049 shows how timing is handled: written October 3, it cleared October 12, nine days later; the shared check number matches it even outside the 7-day window.

## Sources

- [Intuit QuickBooks: Reconcile an account in QuickBooks Online, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/statement-reconciliation/reconcile-account-quickbooks-online/L3XzsllsK_US_en_US)
- [Intuit QuickBooks: Fix reconciliation discrepancies in QuickBooks Online, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/bank-transactions/fix-reconciliation-discrepancies/00/201285)
- [Intuit QuickBooks: Run a ledger report that shows debits and credits for each transaction, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/profit-loss-reports/create-report-shows-debits-credits-transaction/L1zvqNX0e_US_en_US)
- [Intuit QuickBooks: Export your reports to Excel from QuickBooks Online (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-articles/export-your-reports-to-excel-from-quickbooks-online/00/262097)
- [Intuit QuickBooks: Format CSV files in Excel to get bank transactions into QuickBooks, updated August 24, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/format-csv-files-excel-bank-transactions-quickbooks/L4BjLWckq_US_en_US)

## Questions

### Where is the reconciliation discrepancy report in QuickBooks Online?

Intuit: "Go to the Reports menu. Hover over Banking and select Reconciliation Discrepancy." This report shows any transactions that were changed since your last reconciliation. It lists changes to items already reconciled, not lines the books never had.

### What should the difference be when I finish?

Intuit: "Continue matching until the Difference is $0.00." If it is not, this page's method shows which lines make up the rest.

### Should I let QuickBooks post an adjustment?

Intuit warns "Adjustments don't fix errors." and "You shouldn't do a reconciliation adjustment without your accountant's guidance." Find the lines first.

## Related

- [Beginning balance is wrong in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/beginning-balance-wrong/)
- [Compared with the Reconciliation Discrepancy report](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/vs/quickbooks-reconciliation-discrepancy-report/)
- [Undo a reconciliation safely](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/undo-reconciliation-safely/)
- [The same check in Xero](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/xero/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/quickbooks-online/  
Data as of: 2026-11-08
