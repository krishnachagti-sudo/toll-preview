# The difference is double a transaction

A difference of exactly twice a transaction means it was entered the wrong way round: in this worked file a $450.00 deposit was recorded as a payment, so the books are $900.00 below the bank, and half the difference, $450.00, is the amount to look for.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%2CBalance%0D%0A11%2F02%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%226%2C052.10%22%0D%0A11%2F04%2F2026%2CSQUARE+INC+DEP%2C%221%2C182.50%22%2C%227%2C234.60%22%0D%0A11%2F06%2F2026%2CMOBILE+DEPOSIT%2C450.00%2C%227%2C684.60%22%0D%0A11%2F10%2F2026%2CSYSCO+FOOD+SVC%2C-521.15%2C%227%2C163.45%22%0D%0A11%2F13%2F2026%2CSQUARE+INC+DEP%2C%221%2C244.00%22%2C%228%2C407.45%22%0D%0A11%2F16%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%224%2C192.12%22%0D%0A&ledger=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22November+1-16%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C%228%2C452.10%22%0D%0A%2C11%2F02%2F2026%2CExpense%2C%2CHarbor+Properties%2CNovember+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%226%2C052.10%22%0D%0A%2C11%2F04%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C182.50%22%2C%227%2C234.60%22%0D%0A%2C11%2F06%2F2026%2CExpense%2C%2CLakeside+Cafe%2CWholesale+payment%2CSales%2C-450.00%2C%226%2C784.60%22%0D%0A%2C11%2F10%2F2026%2CExpense%2C%2CSysco%2CSupplies%2CSupplies%2C-521.15%2C%226%2C263.45%22%0D%0A%2C11%2F13%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C244.00%22%2C%227%2C507.45%22%0D%0A%2C11%2F16%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%223%2C292.12%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22-%245%2C159.98%22%2C%0D%0A&end=2026-11-16)

The sign flip

| Date | Kind | Bank | Books | Effect |
| --- | --- | --- | --- | ---: |
| 2026-11-06 | sign flip (entered the wrong way round) | bank 2026-11-06 $450.00 MOBILE DEPOSIT | books 2026-11-06 -$450.00 Lakeside Cafe Wholesale payment | $900.00 |

$900.00 is divisible by 9 ($900.00 / 9 = $100.00), so a transposition is possible: two adjacent digits 1 apart in the $1,000 and $100 places. Half the difference is $450.00: an amount of that size entered the wrong way round would do it.

## Correcting it

- Edit the entry's type (a payment to a deposit) rather than adding a second entry of twice the amount, so the record matches the bank line.
- If the period is closed or filed, ask your accountant how they want it corrected.
- Run the files again: the difference should be gone.

## Check a difference

[Open the check with this difference](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?diff=900.00&amounts=-450.00)

## Sources

- [Intuit QuickBooks: Fix reconciliation discrepancies in QuickBooks Online, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/bank-transactions/fix-reconciliation-discrepancies/00/201285)

## Questions

### Why twice and not once?

Recording +450 as -450 removes the 450 that should be there and takes away another 450: a gap of 900.

### Can a transfer cause it?

Yes: a transfer recorded in the wrong direction between two of your accounts puts each of them out by twice the amount.

## Related

- [Off by 9, 90 or 900](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/divisible-by-nine-rule/)
- [Credit card reconciliation off](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/credit-card-reconciliation-off/)
- [Transposition error checker](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/transposition-error-checker/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/difference-is-double-a-transaction/  
Data as of: 2026-11-08
