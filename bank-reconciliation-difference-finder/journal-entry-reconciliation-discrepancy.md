# Journal entry for a bank reconciliation discrepancy

Post a journal entry only after you find the cause: in this worked month a $105.00 adjustment would close the gap, but it would hide a $90.00 transposition in a supplier payment and leave the $15.00 bank fee in the wrong account; the right entries are a $15.00 bank charge and a $90.00 correction to the payment.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%2CBalance%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A10%2F02%2F2026%2CSQUARE+INC+DEP%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A10%2F05%2F2026%2CMONTHLY+SERVICE+FEE%2C-15.00%2C%2211%2C673.00%22%0D%0A10%2F06%2F2026%2CSYSCO+FOOD+SVC%2C-540.00%2C%2211%2C133.00%22%0D%0A10%2F09%2F2026%2CSQUARE+INC+DEP%2C%221%2C182.50%22%2C%2212%2C315.50%22%0D%0A10%2F12%2F2026%2CCHECK+1049%2C-275.00%2C%2212%2C040.50%22%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%227%2C825.17%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%221%2C317.20%22%2C%229%2C142.37%22%0D%0A10%2F19%2F2026%2CCOMCAST+BUSINESS%2C-189.99%2C%228%2C952.38%22%0D%0A10%2F21%2F2026%2CDEPOSIT%2C%221%2C245.90%22%2C%2210%2C198.28%22%0D%0A10%2F23%2F2026%2CSQUARE+INC+DEP%2C%221%2C274.30%22%2C%2211%2C472.58%22%0D%0A10%2F27%2F2026%2CSHELL+OIL+5741%2C-61.20%2C%2211%2C411.38%22%0D%0A10%2F30%2F2026%2CSQUARE+INC+DEP%2C%221%2C299.75%22%2C%2212%2C711.13%22%0D%0A&ledger=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C%2212%2C842.10%22%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2COctober+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A%2C10%2F02%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A%2C10%2F03%2F2026%2CCheck%2C1049%2CRivera+Electric%2COven+repair%2CRepairs%2C-275.00%2C%2211%2C413.00%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSysco%2CFlour+and+dairy%2CSupplies%2C-450.00%2C%2210%2C963.00%22%0D%0A%2C10%2F09%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C182.50%22%2C%2212%2C145.50%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%227%2C930.17%22%0D%0A%2C10%2F16%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C317.20%22%2C%229%2C247.37%22%0D%0A%2C10%2F19%2F2026%2CExpense%2C%2CComcast+Business%2CInternet%2CUtilities%2C-189.99%2C%229%2C057.38%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CLakeside+Cafe%2CWholesale+invoice+2210%2CSales%2C745.90%2C%229%2C803.28%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CHill+School%2CCatering+invoice+2211%2CSales%2C500.00%2C%2210%2C303.28%22%0D%0A%2C10%2F23%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C274.30%22%2C%2211%2C577.58%22%0D%0A%2C10%2F27%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-61.20%2C%2211%2C516.38%22%0D%0A%2C10%2F28%2F2026%2CCheck%2C1053%2CPacific+Produce%2CFruit%2CSupplies%2C-312.75%2C%2211%2C203.63%22%0D%0A%2C10%2F30%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C299.75%22%2C%2212%2C503.38%22%0D%0A%2C10%2F31%2F2026%2CDeposit%2C%2CFront+counter%2CCash+sales%2CSales%2C412.60%2C%2212%2C915.98%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%2473.88%2C%0D%0A)

## What Intuit says

- "Adjustments don't fix errors."
- "You shouldn't do a reconciliation adjustment without your accountant's guidance."
- "Adjusting entries should be a last resort, as making them for large discrepancies can cause accounting issues."

## The entries instead, for the worked month

Each line of the difference and the entry it needs

| Found | Amount | Entry |
| --- | ---: | --- |
| Bank fee on October 5, 2026 | $15.00 | Record a bank charge (expense) dated the same day |
| Transposition on October 6, 2026 | $90.00 | Edit the payment from $450.00 to $540.00 |
| Outstanding check on October 28, 2026 | $312.75 | No entry: it clears on the next statement |
| Deposit in transit on October 31, 2026 | $412.60 | No entry: it clears on the next statement |

After the bank charge and the edit, the books equal the adjusted bank balance and the reconciliation finishes at $0.00 with no adjustment.

## Sources

- [Intuit QuickBooks: Enter an adjusting entry for a reconciliation in QuickBooks Online, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/statement-reconciliation/enter-adjusting-entry-reconciliation-quickbooks/L2m1jHhBS_US_en_US)
- [Intuit QuickBooks: Fix reconciliation discrepancies in QuickBooks Online, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/bank-transactions/fix-reconciliation-discrepancies/00/201285)

## Questions

### What does QuickBooks Online post when I accept the difference?

Intuit: "This creates an expense transaction if the difference is negative, or an income transaction if the difference is positive."

### When is an adjustment acceptable?

Intuit: "When there's only a small amount left over, QuickBooks lets you create an adjusting entry." "You must be absolutely sure the amount is small and an error." Talk to your accountant first.

## Related

- [Why a reconciliation does not balance](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/why-bank-reconciliation-not-balancing/)
- [Compared with the Reconciliation Discrepancy report](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/vs/quickbooks-reconciliation-discrepancy-report/)
- [Undo a reconciliation safely](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/undo-reconciliation-safely/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/journal-entry-reconciliation-discrepancy/  
Data as of: 2026-11-08
