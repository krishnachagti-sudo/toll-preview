# Bank statement vs general ledger

A bank statement is the bank's record of the account and the ledger is yours; in this worked month the 2 timing items explain $99.85 of the $204.85 difference, and the other $105.00 is two errors in the books.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%2CBalance%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A10%2F02%2F2026%2CSQUARE+INC+DEP%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A10%2F05%2F2026%2CMONTHLY+SERVICE+FEE%2C-15.00%2C%2211%2C673.00%22%0D%0A10%2F06%2F2026%2CSYSCO+FOOD+SVC%2C-540.00%2C%2211%2C133.00%22%0D%0A10%2F09%2F2026%2CSQUARE+INC+DEP%2C%221%2C182.50%22%2C%2212%2C315.50%22%0D%0A10%2F12%2F2026%2CCHECK+1049%2C-275.00%2C%2212%2C040.50%22%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%227%2C825.17%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%221%2C317.20%22%2C%229%2C142.37%22%0D%0A10%2F19%2F2026%2CCOMCAST+BUSINESS%2C-189.99%2C%228%2C952.38%22%0D%0A10%2F21%2F2026%2CDEPOSIT%2C%221%2C245.90%22%2C%2210%2C198.28%22%0D%0A10%2F23%2F2026%2CSQUARE+INC+DEP%2C%221%2C274.30%22%2C%2211%2C472.58%22%0D%0A10%2F27%2F2026%2CSHELL+OIL+5741%2C-61.20%2C%2211%2C411.38%22%0D%0A10%2F30%2F2026%2CSQUARE+INC+DEP%2C%221%2C299.75%22%2C%2212%2C711.13%22%0D%0A&ledger=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C%2212%2C842.10%22%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2COctober+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A%2C10%2F02%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A%2C10%2F03%2F2026%2CCheck%2C1049%2CRivera+Electric%2COven+repair%2CRepairs%2C-275.00%2C%2211%2C413.00%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSysco%2CFlour+and+dairy%2CSupplies%2C-450.00%2C%2210%2C963.00%22%0D%0A%2C10%2F09%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C182.50%22%2C%2212%2C145.50%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%227%2C930.17%22%0D%0A%2C10%2F16%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C317.20%22%2C%229%2C247.37%22%0D%0A%2C10%2F19%2F2026%2CExpense%2C%2CComcast+Business%2CInternet%2CUtilities%2C-189.99%2C%229%2C057.38%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CLakeside+Cafe%2CWholesale+invoice+2210%2CSales%2C745.90%2C%229%2C803.28%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CHill+School%2CCatering+invoice+2211%2CSales%2C500.00%2C%2210%2C303.28%22%0D%0A%2C10%2F23%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C274.30%22%2C%2211%2C577.58%22%0D%0A%2C10%2F27%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-61.20%2C%2211%2C516.38%22%0D%0A%2C10%2F28%2F2026%2CCheck%2C1053%2CPacific+Produce%2CFruit%2CSupplies%2C-312.75%2C%2211%2C203.63%22%0D%0A%2C10%2F30%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C299.75%22%2C%2212%2C503.38%22%0D%0A%2C10%2F31%2F2026%2CDeposit%2C%2CFront+counter%2CCash+sales%2CSales%2C412.60%2C%2212%2C915.98%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%2473.88%2C%0D%0A)

Side by side

|  | Bank statement | General ledger (cash account) |
| --- | --- | --- |
| Kept by | The bank | You or your bookkeeper |
| Dated | When the bank processes it | When you record it |
| Holds | Fees, interest and everything that cleared | Checks written, deposits made, your categories |
| Worked month, lines | 13 | 15 |
| Worked month, balance at the end | $12,711.13 | $12,915.98 |

## Where the worked difference comes from

Lines on one side only

| Date | What | Line | Amount | Age (days) |
| --- | --- | --- | ---: | ---: |
| 2026-10-05 | in the bank, not in the books (bank fee) | MONTHLY SERVICE FEE | -$15.00 | 26 |
| 2026-10-28 | outstanding check | Pacific Produce Fruit | -$312.75 | 3 |
| 2026-10-31 | deposit in transit | Front counter Cash sales | $412.60 | 0 |

Errors in the books

| Date | Kind | Bank | Books | Effect |
| --- | --- | --- | --- | ---: |
| 2026-10-06 | digit transposition | bank 2026-10-06 -$540.00 SYSCO FOOD SVC | books 2026-10-06 -$450.00 Sysco Flour and dairy | -$90.00 |

The two sides reconciled

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

## Sources

- [AccountingCoach: Bank reconciliation explanation (read November 8, 2026)](https://www.accountingcoach.com/bank-reconciliation/explanation)

## Questions

### What is the difference between a bank statement and a bank ledger?

The statement is the bank's list of what cleared, with its balance. The bank ledger (the cash account in your general ledger) is your list of what you paid and received, dated when you recorded it.

### Which one is right?

Neither alone: the reconciliation explains every difference. Timing items are right on both sides; errors are corrected in the books.

## Related

- [A bank reconciliation example, step by step](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/bank-reconciliation-example/)
- [Outstanding checks and deposits in transit](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/outstanding-checks-list/)
- [Reconcile from a PDF statement](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/reconcile-from-pdf-statement/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/bank-statement-vs-general-ledger/  
Data as of: 2026-11-08
