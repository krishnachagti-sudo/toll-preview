# How to do a bank reconciliation in Excel

In Excel, match on amount with COUNTIFS and a 7-day date window; for these 13 statement lines that leaves 4 with no match ($15.00, $540.00, $275.00, $1,245.90), but it cannot tell a fee from a transposition or see the split deposit and the late check, which the finder lists with the break date October 5, 2026.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%2CBalance%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A10%2F02%2F2026%2CSQUARE+INC+DEP%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A10%2F05%2F2026%2CMONTHLY+SERVICE+FEE%2C-15.00%2C%2211%2C673.00%22%0D%0A10%2F06%2F2026%2CSYSCO+FOOD+SVC%2C-540.00%2C%2211%2C133.00%22%0D%0A10%2F09%2F2026%2CSQUARE+INC+DEP%2C%221%2C182.50%22%2C%2212%2C315.50%22%0D%0A10%2F12%2F2026%2CCHECK+1049%2C-275.00%2C%2212%2C040.50%22%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%227%2C825.17%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%221%2C317.20%22%2C%229%2C142.37%22%0D%0A10%2F19%2F2026%2CCOMCAST+BUSINESS%2C-189.99%2C%228%2C952.38%22%0D%0A10%2F21%2F2026%2CDEPOSIT%2C%221%2C245.90%22%2C%2210%2C198.28%22%0D%0A10%2F23%2F2026%2CSQUARE+INC+DEP%2C%221%2C274.30%22%2C%2211%2C472.58%22%0D%0A10%2F27%2F2026%2CSHELL+OIL+5741%2C-61.20%2C%2211%2C411.38%22%0D%0A10%2F30%2F2026%2CSQUARE+INC+DEP%2C%221%2C299.75%22%2C%2212%2C711.13%22%0D%0A&ledger=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C%2212%2C842.10%22%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2COctober+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A%2C10%2F02%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A%2C10%2F03%2F2026%2CCheck%2C1049%2CRivera+Electric%2COven+repair%2CRepairs%2C-275.00%2C%2211%2C413.00%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSysco%2CFlour+and+dairy%2CSupplies%2C-450.00%2C%2210%2C963.00%22%0D%0A%2C10%2F09%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C182.50%22%2C%2212%2C145.50%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%227%2C930.17%22%0D%0A%2C10%2F16%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C317.20%22%2C%229%2C247.37%22%0D%0A%2C10%2F19%2F2026%2CExpense%2C%2CComcast+Business%2CInternet%2CUtilities%2C-189.99%2C%229%2C057.38%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CLakeside+Cafe%2CWholesale+invoice+2210%2CSales%2C745.90%2C%229%2C803.28%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CHill+School%2CCatering+invoice+2211%2CSales%2C500.00%2C%2210%2C303.28%22%0D%0A%2C10%2F23%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C274.30%22%2C%2211%2C577.58%22%0D%0A%2C10%2F27%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-61.20%2C%2211%2C516.38%22%0D%0A%2C10%2F28%2F2026%2CCheck%2C1053%2CPacific+Produce%2CFruit%2CSupplies%2C-312.75%2C%2211%2C203.63%22%0D%0A%2C10%2F30%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C299.75%22%2C%2212%2C503.38%22%0D%0A%2C10%2F31%2F2026%2CDeposit%2C%2CFront+counter%2CCash+sales%2CSales%2C412.60%2C%2212%2C915.98%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%2473.88%2C%0D%0A)

## The formulas

```excel
=COUNTIFS(Ledger!$C:$C,C2,Ledger!$A:$A,">="&(A2-7),Ledger!$A:$A,"<="&(A2+7))
```

Or bring back the books date of the first match with XLOOKUP, which Microsoft documents as `=XLOOKUP(lookup_value, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])` with exact match as the default:

```excel
=XLOOKUP(C2,Ledger!$C:$C,Ledger!$A:$A,"not in books")
```

Microsoft notes: XLOOKUP is not available in Excel 2016 and Excel 2019. In those versions use COUNTIFS or INDEX and MATCH. XLOOKUP returns the first match only, so an amount that appears twice is matched twice.

## What the formulas give on the worked month

Statement lines with a 0 in column D

| Date | Description | Amount | What it really is |
| --- | --- | ---: | --- |
| 2026-10-05 | MONTHLY SERVICE FEE | -$15.00 | a bank fee missing from the books |
| 2026-10-06 | SYSCO FOOD SVC | -$540.00 | a transposition: books has $450.00 |
| 2026-10-12 | CHECK 1049 | -$275.00 | check cleared 9 days after it was written |
| 2026-10-21 | DEPOSIT | $1,245.90 | a split deposit: $745.90 + $500.00 in the books |

Each zero needs a different answer, and the formulas cannot say which. The finder runs the same matching with check numbers, splits and the error tests, and dates the break.

## Sources

- [Microsoft Support: XLOOKUP function (read November 8, 2026)](https://support.microsoft.com/en-us/office/xlookup-function-b7fd680e-6d10-43e6-84f9-88eae8bf5929)

## Steps

1. **Two sheets.** Paste the statement on a sheet named Statement and the ledger on one named Ledger, each with Date in column A, Description in B and a signed Amount in C.
2. **Count matches.** In Statement!D2: =COUNTIFS(Ledger!$C:$C,C2,Ledger!$A:$A,"\>="&(A2-7),Ledger!$A:$A,"\<="&(A2+7)), filled down. 0 means no books line of that amount within 7 days.
3. **Repeat the other way.** The same formula on the Ledger sheet against the Statement sheet lists books lines with no bank match: outstanding items, or errors.
4. **Look at the zeros.** Sort each sheet by column D. Every 0 is a line to explain; a 2 or more is an amount that appears twice and needs a closer look.

## Related

- [Reconciliation template for Excel](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/bank-reconciliation-template-excel/)
- [Excel XLOOKUP vs this tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/vs/excel-xlookup-reconciliation/)
- [Reconciliation template for Google Sheets](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/bank-reconciliation-template-google-sheets/)
- [Reconcile from a PDF statement](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/reconcile-from-pdf-statement/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/bank-reconciliation-in-excel/  
Data as of: 2026-11-08
