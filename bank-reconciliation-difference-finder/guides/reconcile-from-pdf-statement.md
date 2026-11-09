# Reconcile from a PDF bank statement

With only a PDF statement, type or convert it to rows of date, description and amount, then compare: in this worked file 7 of 8 typed lines match, and check 1051 is $138.80 in the books but $138.30 as typed, a $0.50 gap from one misread digit, first on October 17, 2026.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%0D%0A10%2F01%2F2026%2CRENT+HARBOR+PROPERTIES%2C%22-2%2C400.00%22%0D%0A10%2F02%2F2026%2CDEPOSIT%2C%221%2C245.90%22%0D%0A10%2F09%2F2026%2CDEPOSIT%2C%221%2C182.50%22%0D%0A10%2F12%2F2026%2CCHECK+1049%2C-275.00%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%0D%0A10%2F16%2F2026%2CDEPOSIT%2C%221%2C317.20%22%0D%0A10%2F20%2F2026%2CCHECK+1051%2C-138.30%0D%0A10%2F23%2F2026%2CDEPOSIT%2C%221%2C274.30%22%0D%0A&ledger=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C0.00%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2COctober+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%22-2%2C400.00%22%0D%0A%2C10%2F02%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C245.90%22%2C%22-1%2C154.10%22%0D%0A%2C10%2F03%2F2026%2CCheck%2C1049%2CRivera+Electric%2COven+repair%2CRepairs%2C-275.00%2C%22-1%2C429.10%22%0D%0A%2C10%2F09%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C182.50%22%2C-246.60%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%22-4%2C461.93%22%0D%0A%2C10%2F16%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C317.20%22%2C%22-3%2C144.73%22%0D%0A%2C10%2F17%2F2026%2CCheck%2C1051%2CBaylor+Paper%2CBoxes%2CSupplies%2C-138.80%2C%22-3%2C283.53%22%0D%0A%2C10%2F23%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C274.30%22%2C%22-2%2C009.23%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22-%242%2C009.23%22%2C%0D%0A&sopen=12%2C842.10&lopen=12%2C842.10&end=2026-10-31)

## The worked file

At October 31, 2026 the statement shows $10,833.37 and the books $10,832.87: a difference of $0.50. 7 lines match and 2 lines are on one side only. There are no timing items; the other $0.50 (the bank is higher) comes from 1 wrong amount. The running balances first disagree on October 17, 2026.

The misread line

| Date | Kind | Bank | Books | Effect |
| --- | --- | --- | --- | ---: |
| 2026-10-17 | wrong amount on the same reference | bank 2026-10-20 -$138.30 CHECK 1051 | books 2026-10-17 -$138.80 Baylor Paper Boxes | $0.50 |

## Scanned statements

- A 3 and an 8, a 1 and a 7, and a 5 and a 6 are the usual misreads; the gap is then not a multiple of 9, unlike a swap.
- Check every hint against the PDF itself before you change the books: here it is the typing, not the ledger, that is wrong.
- Intuit's bank file layout to type into: Date, Description, Amount. "Remove any zeros (0) from the file. Leave those cells blank."

## Sources

- [Intuit QuickBooks: Format CSV files in Excel to get bank transactions into QuickBooks, updated August 24, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/format-csv-files-excel-bank-transactions-quickbooks/L4BjLWckq_US_en_US)

## Steps

1. **Extract the rows.** Copy or convert the PDF into three columns: Date, Description, Amount, one row per line; leave out the page headers and running totals.
2. **Normalise the signs.** Money in positive, money out negative, the way Intuit's 3-column layout writes them.
3. **Enter the balances.** A typed statement has no balance column: enter its opening balance and the books' opening balance under Balances.
4. **Compare and read the hints.** A wrong amount on the same check number, or two swapped digits, often means the PDF was misread rather than the books.

## Related

- [Bank statement vs general ledger](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/bank-statement-vs-general-ledger/)
- [Bank reconciliation in Excel](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/bank-reconciliation-in-excel/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/reconcile-from-pdf-statement/  
Data as of: 2026-11-08
