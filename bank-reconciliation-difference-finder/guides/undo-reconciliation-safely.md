# Undo a reconciliation safely in QuickBooks Online

Before you undo a reconciliation, find what changed: in this worked file the October beginning balance is $642.18 off, and comparing August to October dates it to one deleted $642.18 payment on September 14, 2026, so restoring that payment fixes it without undoing any reconciliation.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%2CBalance%0D%0A08%2F03%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2216%2C214.55%22%0D%0A08%2F07%2F2026%2CSQUARE+INC+DEP%2C%225%2C124.00%22%2C%2221%2C338.55%22%0D%0A08%2F14%2F2026%2CPACIFIC+GAS+ELECTRIC%2C-589.04%2C%2220%2C749.51%22%0D%0A08%2F17%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%2216%2C534.18%22%0D%0A08%2F21%2F2026%2CSQUARE+INC+DEP%2C%224%2C987.60%22%2C%2221%2C521.78%22%0D%0A08%2F28%2F2026%2CSYSCO+FOOD+SVC%2C-612.00%2C%2220%2C909.78%22%0D%0A09%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2218%2C509.78%22%0D%0A09%2F04%2F2026%2CSQUARE+INC+DEP%2C%225%2C053.10%22%2C%2223%2C562.88%22%0D%0A09%2F14%2F2026%2CPACIFIC+GAS+ELECTRIC%2C-642.18%2C%2222%2C920.70%22%0D%0A09%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%2218%2C705.37%22%0D%0A09%2F18%2F2026%2CSQUARE+INC+DEP%2C%224%2C872.15%22%2C%2223%2C577.52%22%0D%0A09%2F25%2F2026%2CSYSCO+FOOD+SVC%2C-598.70%2C%2222%2C978.82%22%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%2C%2220%2C578.82%22%0D%0A10%2F02%2F2026%2CSQUARE+INC+DEP%2C%225%2C211.40%22%2C%2225%2C790.22%22%0D%0A10%2F14%2F2026%2CPACIFIC+GAS+ELECTRIC%2C-613.77%2C%2225%2C176.45%22%0D%0A10%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%2C%2220%2C961.12%22%0D%0A10%2F16%2F2026%2CSQUARE+INC+DEP%2C%224%2C933.80%22%2C%2225%2C894.92%22%0D%0A10%2F26%2F2026%2CSYSCO+FOOD+SVC%2C-630.45%2C%2225%2C264.47%22%0D%0A10%2F30%2F2026%2CSQUARE+INC+DEP%2C%221%2C320.55%22%2C%2226%2C585.02%22%0D%0A&ledger=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22August+1+-+October+31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C%2218%2C614.55%22%0D%0A%2C08%2F03%2F2026%2CExpense%2C%2CHarbor+Properties%2C%2CSupplies%2C%22-2%2C400.00%22%2C%2216%2C214.55%22%0D%0A%2C08%2F07%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%225%2C124.00%22%2C%2221%2C338.55%22%0D%0A%2C08%2F14%2F2026%2CExpense%2C%2CPacific+Gas+%26+Electric%2C%2CSupplies%2C-589.04%2C%2220%2C749.51%22%0D%0A%2C08%2F17%2F2026%2CExpense%2C%2CGusto%2C%2CSupplies%2C%22-4%2C215.33%22%2C%2216%2C534.18%22%0D%0A%2C08%2F21%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%224%2C987.60%22%2C%2221%2C521.78%22%0D%0A%2C08%2F28%2F2026%2CExpense%2C%2CSysco%2C%2CSupplies%2C-612.00%2C%2220%2C909.78%22%0D%0A%2C09%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2C%2CSupplies%2C%22-2%2C400.00%22%2C%2218%2C509.78%22%0D%0A%2C09%2F04%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%225%2C053.10%22%2C%2223%2C562.88%22%0D%0A%2C09%2F15%2F2026%2CExpense%2C%2CGusto%2C%2CSupplies%2C%22-4%2C215.33%22%2C%2219%2C347.55%22%0D%0A%2C09%2F18%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%224%2C872.15%22%2C%2224%2C219.70%22%0D%0A%2C09%2F25%2F2026%2CExpense%2C%2CSysco%2C%2CSupplies%2C-598.70%2C%2223%2C621.00%22%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2C%2CSupplies%2C%22-2%2C400.00%22%2C%2221%2C221.00%22%0D%0A%2C10%2F02%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%225%2C211.40%22%2C%2226%2C432.40%22%0D%0A%2C10%2F14%2F2026%2CExpense%2C%2CPacific+Gas+%26+Electric%2C%2CSupplies%2C-613.77%2C%2225%2C818.63%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2C%2CSupplies%2C%22-4%2C215.33%22%2C%2221%2C603.30%22%0D%0A%2C10%2F16%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%224%2C933.80%22%2C%2226%2C537.10%22%0D%0A%2C10%2F26%2F2026%2CExpense%2C%2CSysco%2C%2CSupplies%2C-630.45%2C%2225%2C906.65%22%0D%0A%2C10%2F30%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%221%2C320.55%22%2C%2227%2C227.20%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22%248%2C612.65%22%2C%0D%0A)

The one change since the last good month

| Date | Change | Difference after | Why |
| --- | ---: | ---: | --- |
| Opening |  | $0.00 | The gap between the two opening balances |
| 2026-09-14 | -$642.18 | -$642.18 | money out at the bank, not in the books: PACIFIC GAS ELECTRIC -$642.18 |

> The undo article read is Intuit's Canadian help page; check the United States page in your account for wording differences.

## Sources

- [Intuit QuickBooks (Canada): Undo a client's entire reconciliation in QuickBooks Online Accountant (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-ca/help-article/statement-reconciliation/undo-clients-reconciliation-quickbooks-online/L2rUvgAg6_CA_en_CA)
- [Intuit QuickBooks: Fix reconciliation discrepancies in QuickBooks Online, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/bank-transactions/fix-reconciliation-discrepancies/00/201285)

## Steps

1. **Download first.** Intuit: Download any attachments and reports tied to the reconciliation.
2. **Find the change.** Run the Reconciliation Discrepancy report, then compare the statements and ledger from the last good month to now.
3. **Prefer the fix.** Restore or correct the one transaction the break date points to.
4. **Undo only if you must.** Where: Reconcile, then History by account, then Undo in the Action column. Every later reconciliation is undone with it; redo them oldest first.
5. **Check after.** Beginning balance equals the last statement's ending balance; the files compare with no opening difference.

## Questions

### Who can undo a reconciliation in QuickBooks Online?

Intuit (Canada help page): "You can undo a reconciliation if you're the Primary Admin of the QuickBooks Online company." Accountants with access to the company can too.

### Does undoing one month undo later months?

Yes. Intuit: "The reconciliation you chose, and any reconciliations completed after it, are undone." "Reconciled transactions revert to uncleared or cleared status."

## Related

- [Beginning balance wrong](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/beginning-balance-wrong/)
- [Opening balance difference](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/opening-balance-difference/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/undo-reconciliation-safely/  
Data as of: 2026-11-08
