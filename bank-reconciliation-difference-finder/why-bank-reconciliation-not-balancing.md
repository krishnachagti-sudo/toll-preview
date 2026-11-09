# Why is my bank reconciliation not balancing?

A bank reconciliation does not balance for one of 7 reasons, and in this worked month the tool finds 3 of them: $99.85 of timing items, a $15.00 bank fee missing from the books and a $90.00 transposition, which together explain the whole $204.85 difference.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%2CBalance%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A10%2F02%2F2026%2CSQUARE+INC+DEP%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A10%2F05%2F2026%2CMONTHLY+SERVICE+FEE%2C-15.00%2C%2211%2C673.00%22%0D%0A10%2F06%2F2026%2CSYSCO+FOOD+SVC%2C-540.00%2C%2211%2C133.00%22%0D%0A10%2F09%2F2026%2CSQUARE+INC+DEP%2C%221%2C182.50%22%2C%2212%2C315.50%22%0D%0A10%2F12%2F2026%2CCHECK+1049%2C-275.00%2C%2212%2C040.50%22%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%227%2C825.17%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%221%2C317.20%22%2C%229%2C142.37%22%0D%0A10%2F19%2F2026%2CCOMCAST+BUSINESS%2C-189.99%2C%228%2C952.38%22%0D%0A10%2F21%2F2026%2CDEPOSIT%2C%221%2C245.90%22%2C%2210%2C198.28%22%0D%0A10%2F23%2F2026%2CSQUARE+INC+DEP%2C%221%2C274.30%22%2C%2211%2C472.58%22%0D%0A10%2F27%2F2026%2CSHELL+OIL+5741%2C-61.20%2C%2211%2C411.38%22%0D%0A10%2F30%2F2026%2CSQUARE+INC+DEP%2C%221%2C299.75%22%2C%2212%2C711.13%22%0D%0A&ledger=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C%2212%2C842.10%22%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2COctober+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%2210%2C442.10%22%0D%0A%2C10%2F02%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C245.90%22%2C%2211%2C688.00%22%0D%0A%2C10%2F03%2F2026%2CCheck%2C1049%2CRivera+Electric%2COven+repair%2CRepairs%2C-275.00%2C%2211%2C413.00%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSysco%2CFlour+and+dairy%2CSupplies%2C-450.00%2C%2210%2C963.00%22%0D%0A%2C10%2F09%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C182.50%22%2C%2212%2C145.50%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%227%2C930.17%22%0D%0A%2C10%2F16%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C317.20%22%2C%229%2C247.37%22%0D%0A%2C10%2F19%2F2026%2CExpense%2C%2CComcast+Business%2CInternet%2CUtilities%2C-189.99%2C%229%2C057.38%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CLakeside+Cafe%2CWholesale+invoice+2210%2CSales%2C745.90%2C%229%2C803.28%22%0D%0A%2C10%2F20%2F2026%2CDeposit%2C%2CHill+School%2CCatering+invoice+2211%2CSales%2C500.00%2C%2210%2C303.28%22%0D%0A%2C10%2F23%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C274.30%22%2C%2211%2C577.58%22%0D%0A%2C10%2F27%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-61.20%2C%2211%2C516.38%22%0D%0A%2C10%2F28%2F2026%2CCheck%2C1053%2CPacific+Produce%2CFruit%2CSupplies%2C-312.75%2C%2211%2C203.63%22%0D%0A%2C10%2F30%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C299.75%22%2C%2212%2C503.38%22%0D%0A%2C10%2F31%2F2026%2CDeposit%2C%2CFront+counter%2CCash+sales%2CSales%2C412.60%2C%2212%2C915.98%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%2473.88%2C%0D%0A)

## The seven causes

Each cause, how the tool finds it, and what the worked month holds

| Cause | How it is found | Worked month |
| --- | --- | --- |
| Timing: outstanding checks and deposits in transit | Books lines on or before the statement date with no bank match | 2 items, $99.85 |
| A bank fee, interest or payment the books never got | Bank lines with no books match | 1 line, $15.00 |
| Two digits swapped | Unmatched pairs that are one adjacent swap apart | 1 pair, $90.00 |
| An amount entered the wrong way round | Unmatched pairs of the same amount, opposite signs | see the double-a-transaction guide |
| An extra or missing zero | Unmatched pairs ten times apart | 1 slide in the digit-errors file |
| An entry made twice | Books lines repeating a matched line within the window | see the Xero worked file |
| A wrong opening balance | Opening balances compared before the first line | see the opening balance guide |

## The worked month

At October 31, 2026 the statement shows $12,711.13 and the books $12,915.98: a difference of $204.85. 11 lines match (1 as a split) and 5 lines are on one side only. Timing explains $99.85 (1 outstanding check and 1 deposit in transit); the other $105.00 (the books are higher) comes from 1 likely transposition and 1 bank line missing from the books. The running balances first disagree on October 5, 2026.

The difference that is not timing, date by date

| Date | Change | Difference after | Why |
| --- | ---: | ---: | --- |
| Opening |  | $0.00 | The gap between the two opening balances |
| 2026-10-05 | -$15.00 | -$15.00 | bank fee at the bank, not in the books: MONTHLY SERVICE FEE -$15.00 |
| 2026-10-06 | -$90.00 | -$105.00 | digit transposition: The $450.00 payment in the books (October 6, 2026) is $540.00 at the bank: the same digits with two neighbours swapped, a gap of $90.00 (9 x $10.00) |

The total that is not timing, $105.00, is not divisible by 9, yet a transposition is inside it, because the fee is mixed in. Checking each unmatched pair, not only the total, is what finds it. Single-number checks: the [transposition error checker](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/transposition-error-checker/).

## Sources

- [QuickBooks Community: reconciling difference but transactions match (Community Manager answer, August 6, 2026) (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/banking/reconciling-difference-but-transactions-match/00/1536939)
- [Intuit QuickBooks: Fix reconciliation discrepancies in QuickBooks Online, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/bank-transactions/fix-reconciliation-discrepancies/00/201285)
- [AccountingTools: Transposition error, February 13, 2026 (read November 8, 2026)](https://accountingtools.com/articles/transposition-error)

## Steps

1. **Check the balances you typed.** The statement ending balance and date, and the beginning balance against the last reconciliation's ending balance.
2. **Set aside timing items.** Books lines on or before the statement date that the bank has not processed yet: outstanding checks and deposits in transit.
3. **Enter what the bank has.** Bank fees, interest and payments with no books line.
4. **Test the rest for digit and sign errors.** Pairs that are a swap of two digits, ten times apart, or the same amount the other way round.
5. **Look for entries made twice.** A books line that repeats a matched one within a few days.

## Questions

### Every transaction matches, but there is still a difference. Why?

Then the gap is in a balance, not a line. A QuickBooks Community Manager answered in August 2026 that the cause is usually the beginning or ending balance, not the transactions, and that a positive ending balance entered for a credit card or other liability account can create a large difference.

### What should I check first?

The ending balance and date you typed, then the beginning balance against the last reconciliation, then the lines: missing, swapped, the wrong way round, twice.

## Related

- [Opening balance difference](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/opening-balance-difference/)
- [Transposition error checker](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/transposition-error-checker/)
- [Difference is twice an amount](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/difference-is-double-a-transaction/)
- [Journal entry for a discrepancy](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/journal-entry-reconciliation-discrepancy/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/why-bank-reconciliation-not-balancing/  
Data as of: 2026-11-08
