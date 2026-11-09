# Bank reconciliation example

Bank reconciliation example: a statement ending at $12,711.13 and books at $12,915.98 reconcile to $12,810.98 on both sides after $412.60 in transit, $312.75 outstanding, a $15.00 fee to record and a $90.00 correction.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%2CBalance%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A10%2F02%2F2026%2CSQUARE+INC+DEP%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A10%2F05%2F2026%2CMONTHLY+SERVICE+FEE%2C-15.00%2C%2211%2C673.00%22%0D%0A10%2F06%2F2026%2CSYSCO+FOOD+SVC%2C-540.00%2C%2211%2C133.00%22%0D%0A10%2F09%2F2026%2CSQUARE+INC+DEP%2C%221%2C182.50%22%2C%2212%2C315.50%22%0D%0A10%2F12%2F2026%2CCHECK+1049%2C-275.00%2C%2212%2C040.50%22%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%227%2C825.17%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%221%2C317.20%22%2C%229%2C142.37%22%0D%0A10%2F19%2F2026%2CCOMCAST+BUSINESS%2C-189.99%2C%228%2C952.38%22%0D%0A10%2F21%2F2026%2CDEPOSIT%2C%221%2C245.90%22%2C%2210%2C198.28%22%0D%0A10%2F23%2F2026%2CSQUARE+INC+DEP%2C%221%2C274.30%22%2C%2211%2C472.58%22%0D%0A10%2F27%2F2026%2CSHELL+OIL+5741%2C-61.20%2C%2211%2C411.38%22%0D%0A10%2F30%2F2026%2CSQUARE+INC+DEP%2C%221%2C299.75%22%2C%2212%2C711.13%22%0D%0A&ledger=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C%2212%2C842.10%22%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2COctober+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A%2C10%2F02%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A%2C10%2F03%2F2026%2CCheck%2C1049%2CRivera+Electric%2COven+repair%2CRepairs%2C-275.00%2C%2211%2C413.00%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSysco%2CFlour+and+dairy%2CSupplies%2C-450.00%2C%2210%2C963.00%22%0D%0A%2C10%2F09%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C182.50%22%2C%2212%2C145.50%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%227%2C930.17%22%0D%0A%2C10%2F16%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C317.20%22%2C%229%2C247.37%22%0D%0A%2C10%2F19%2F2026%2CExpense%2C%2CComcast+Business%2CInternet%2CUtilities%2C-189.99%2C%229%2C057.38%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CLakeside+Cafe%2CWholesale+invoice+2210%2CSales%2C745.90%2C%229%2C803.28%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CHill+School%2CCatering+invoice+2211%2CSales%2C500.00%2C%2210%2C303.28%22%0D%0A%2C10%2F23%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C274.30%22%2C%2211%2C577.58%22%0D%0A%2C10%2F27%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-61.20%2C%2211%2C516.38%22%0D%0A%2C10%2F28%2F2026%2CCheck%2C1053%2CPacific+Produce%2CFruit%2CSupplies%2C-312.75%2C%2211%2C203.63%22%0D%0A%2C10%2F30%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C299.75%22%2C%2212%2C503.38%22%0D%0A%2C10%2F31%2F2026%2CDeposit%2C%2CFront+counter%2CCash+sales%2CSales%2C412.60%2C%2212%2C915.98%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%2473.88%2C%0D%0A)

The finished reconciliation

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

## The lines behind it

Timing items and bank lines to enter

| Date | What | Line | Amount | Age (days) |
| --- | --- | --- | ---: | ---: |
| 2026-10-05 | in the bank, not in the books (bank fee) | MONTHLY SERVICE FEE | -$15.00 | 26 |
| 2026-10-28 | outstanding check | Pacific Produce Fruit | -$312.75 | 3 |
| 2026-10-31 | deposit in transit | Front counter Cash sales | $412.60 | 0 |

Errors found

| Date | Kind | Bank | Books | Effect |
| --- | --- | --- | --- | ---: |
| 2026-10-06 | digit transposition | bank 2026-10-06 -$540.00 SYSCO FOOD SVC | books 2026-10-06 -$450.00 Sysco Flour and dairy | -$90.00 |

## Sources

- [AccountingCoach: Bank reconciliation explanation (read November 8, 2026)](https://www.accountingcoach.com/bank-reconciliation/explanation)

## Steps

1. **Match each statement line to the books.** 11 lines match: the same amount within 7 days, or the same check number.
2. **Match split deposits.** The $1,245.90 deposit on October 21, 2026 is two books deposits of $745.90 and $500.00.
3. **List timing items.** Outstanding: $312.75 (October 28, 2026). In transit: $412.60 (October 31, 2026).
4. **Find the errors.** A $15.00 fee to record; the $450.00 payment in the books (october 6, 2026) is $540.00 at the bank: the same digits with two neighbours swapped, a gap of $90.00 (9 x $10.00).
5. **Write the statement.** Adjusted bank $12,810.98 equals adjusted books $12,810.98.

## Related

- [The template, filled from this example](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/bank-reconciliation-template-excel/)
- [Worked example: a missing payment across three months](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/worked-example-missing-payment/)
- [Bank statement vs general ledger](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/bank-statement-vs-general-ledger/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/bank-reconciliation-example/  
Data as of: 2026-11-08
