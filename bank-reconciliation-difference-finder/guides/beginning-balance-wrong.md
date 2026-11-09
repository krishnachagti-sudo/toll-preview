# Beginning balance is wrong in the reconciliation

When the beginning balance is wrong after you reconciled, a cleared transaction was usually edited or deleted later; in this worked file the October statement opens at $22,978.82 and the books at $23,621.00, $642.18 apart, and running August to October dates it to September 14, 2026, a payment missing from the books.

## Open the three-month example

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%2CBalance%0D%0A08%2F03%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2216%2C214.55%22%0D%0A08%2F07%2F2026%2CSQUARE+INC+DEP%2C%225%2C124.00%22%2C%2221%2C338.55%22%0D%0A08%2F14%2F2026%2CPACIFIC+GAS+ELECTRIC%2C-589.04%2C%2220%2C749.51%22%0D%0A08%2F17%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%2216%2C534.18%22%0D%0A08%2F21%2F2026%2CSQUARE+INC+DEP%2C%224%2C987.60%22%2C%2221%2C521.78%22%0D%0A08%2F28%2F2026%2CSYSCO+FOOD+SVC%2C-612.00%2C%2220%2C909.78%22%0D%0A09%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2218%2C509.78%22%0D%0A09%2F04%2F2026%2CSQUARE+INC+DEP%2C%225%2C053.10%22%2C%2223%2C562.88%22%0D%0A09%2F14%2F2026%2CPACIFIC+GAS+ELECTRIC%2C-642.18%2C%2222%2C920.70%22%0D%0A09%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%2218%2C705.37%22%0D%0A09%2F18%2F2026%2CSQUARE+INC+DEP%2C%224%2C872.15%22%2C%2223%2C577.52%22%0D%0A09%2F25%2F2026%2CSYSCO+FOOD+SVC%2C-598.70%2C%2222%2C978.82%22%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2220%2C578.82%22%0D%0A10%2F02%2F2026%2CSQUARE+INC+DEP%2C%225%2C211.40%22%2C%2225%2C790.22%22%0D%0A10%2F14%2F2026%2CPACIFIC+GAS+ELECTRIC%2C-613.77%2C%2225%2C176.45%22%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%2220%2C961.12%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%224%2C933.80%22%2C%2225%2C894.92%22%0D%0A10%2F26%2F2026%2CSYSCO+FOOD+SVC%2C-630.45%2C%2225%2C264.47%22%0D%0A10%2F30%2F2026%2CSQUARE+INC+DEP%2C%221%2C320.55%22%2C%2226%2C585.02%22%0D%0A&ledger=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22August+1+-+October+31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C%2218%2C614.55%22%0D%0A%2C08%2F03%2F2026%2CExpense%2C%2CHarbor+Properties%2C%2CSupplies%2C%22-2%2C400.00%22%2C%2216%2C214.55%22%0D%0A%2C08%2F07%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%225%2C124.00%22%2C%2221%2C338.55%22%0D%0A%2C08%2F14%2F2026%2CExpense%2C%2CPacific+Gas+%26+Electric%2C%2CSupplies%2C-589.04%2C%2220%2C749.51%22%0D%0A%2C08%2F17%2F2026%2CExpense%2C%2CGusto%2C%2CSupplies%2C%22-4%2C215.33%22%2C%2216%2C534.18%22%0D%0A%2C08%2F21%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%224%2C987.60%22%2C%2221%2C521.78%22%0D%0A%2C08%2F28%2F2026%2CExpense%2C%2CSysco%2C%2CSupplies%2C-612.00%2C%2220%2C909.78%22%0D%0A%2C09%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2C%2CSupplies%2C%22-2%2C400.00%22%2C%2218%2C509.78%22%0D%0A%2C09%2F04%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%225%2C053.10%22%2C%2223%2C562.88%22%0D%0A%2C09%2F15%2F2026%2CExpense%2C%2CGusto%2C%2CSupplies%2C%22-4%2C215.33%22%2C%2219%2C347.55%22%0D%0A%2C09%2F18%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%224%2C872.15%22%2C%2224%2C219.70%22%0D%0A%2C09%2F25%2F2026%2CExpense%2C%2CSysco%2C%2CSupplies%2C-598.70%2C%2223%2C621.00%22%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2C%2CSupplies%2C%22-2%2C400.00%22%2C%2221%2C221.00%22%0D%0A%2C10%2F02%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%225%2C211.40%22%2C%2226%2C432.40%22%0D%0A%2C10%2F14%2F2026%2CExpense%2C%2CPacific+Gas+%26+Electric%2C%2CSupplies%2C-613.77%2C%2225%2C818.63%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2C%2CSupplies%2C%22-4%2C215.33%22%2C%2221%2C603.30%22%0D%0A%2C10%2F16%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%224%2C933.80%22%2C%2226%2C537.10%22%0D%0A%2C10%2F26%2F2026%2CExpense%2C%2CSysco%2C%2CSupplies%2C-630.45%2C%2225%2C906.65%22%0D%0A%2C10%2F30%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%221%2C320.55%22%2C%2227%2C227.20%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22%248%2C612.65%22%2C%0D%0A)

## October alone

At October 31, 2026 the statement shows $26,585.02 and the books $27,227.20: a difference of $642.18. 7 lines match and no line is on one side only. There are no timing items; the other $642.18 (the books are higher) comes from an opening difference of $642.18. The running balances already disagree before October 1, 2026: the opening balances differ.

## August to October

The break, dated

| Date | Change | Difference after | Why |
| --- | ---: | ---: | --- |
| Opening |  | $0.00 | The gap between the two opening balances |
| 2026-09-14 | -$642.18 | -$642.18 | money out at the bank, not in the books: PACIFIC GAS ELECTRIC -$642.18 |

The $642.18 payment cleared the bank on September 14, 2026, was reconciled in September, then deleted from the books. Restoring it puts both balances back together.

## Sources

- [Intuit QuickBooks: Fix reconciliation discrepancies in QuickBooks Online, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/bank-transactions/fix-reconciliation-discrepancies/00/201285)
- [QuickBooks Community: beginning balance is off and the discrepancy report shows nothing (staff answer) (read November 8, 2026)](https://quickbooks.intuit.com/community/account-management-7/when-i-try-to-reconcile-my-account-my-beginning-balance-is-off-how-can-i-view-a-full-reconciliation-discrepancy-report-i-tried-to-view-report-and-nothing-shows-up-72781)
- [QuickBooks Community: reconciling difference but transactions match (Community Manager answer, August 6, 2026) (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/banking/reconciling-difference-but-transactions-match/00/1536939)

## Steps

1. **Compare the balances.** The last statement's ending balance against the books' cleared balance at that date (the reconciliation's beginning balance).
2. **Run the Reconciliation Discrepancy report.** Go to the Reports menu. Hover over Banking and select Reconciliation Discrepancy. This report shows any transactions that were changed since your last reconciliation.
3. **Check the audit log.** Staff advice: review the audit log for deleted or voided transactions since the last completed reconciliation.
4. **Look for doubled opening entries and transfers.** An opening balance entry posted twice, or a transfer recorded in both accounts.
5. **Restore the item rather than plug it.** Intuit: Adjustments don't fix errors.
6. **Run the files again.** Statement and ledger from an earlier month to now: when the opening balances agree, the break date is the line to fix.

## Questions

### The discrepancy report is empty, but the beginning balance is off. Why?

A QuickBooks staff answer explains that the discrepancy report only tracks changes to previously reconciled transactions; a deleted item or a wrong opening entry can leave it empty.

## Related

- [Opening balance difference: walk back by month](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/opening-balance-difference/)
- [Undo a reconciliation safely](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/undo-reconciliation-safely/)
- [Compared with the Reconciliation Discrepancy report](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/vs/quickbooks-reconciliation-discrepancy-report/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/beginning-balance-wrong/  
Data as of: 2026-11-08
