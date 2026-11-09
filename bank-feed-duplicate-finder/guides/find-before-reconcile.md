# Find duplicates before you reconcile

To find duplicates before you reconcile, line up equal amounts within a few days: on this worked month, a same-day window finds 4 pairs, the default 3 days finds 6, and 31 days finds 8, the extra ones being monthly bills such as rent paid on the 1st and the 31st, so start at 3 days.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A10%2F26%2F2026%2CSQUARE+INC+DEP%2C%221%2C245.90%22%0D%0A10%2F28%2F2026%2CVERIZON+WIRELESS%2C-112.60%0D%0A10%2F29%2F2026%2CSQUARE+INC+DEP%2C%221%2C198.05%22%0D%0A10%2F29%2F2026%2CSQUARE+INC+DEP%2C%221%2C198.05%22%0D%0A10%2F30%2F2026%2CCOMCAST+BUSINESS%2C-189.99%0D%0A10%2F30%2F2026%2CSTAPLES+0412%2C-45.17%0D%0A10%2F31%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%0D%0A&books=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2COctober+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%22-2%2C400.00%22%0D%0A%2C10%2F02%2F2026%2CExpense%2C%2CComcast+Business%2C%2CUtilities%2C-189.99%2C%22-2%2C589.99%22%0D%0A%2C10%2F03%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C284.50%22%2C%22-1%2C305.49%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSysco%2CFlour+and+dairy%2CSupplies%2C-642.18%2C%22-1%2C947.67%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSYSCO+FOOD+SVC%2C%2CSupplies%2C-642.18%2C%22-2%2C589.85%22%0D%0A%2C10%2F08%2F2026%2CCheck%2C1052%2CRivera+Electric%2COven+repair%2CRepairs%2C-350.00%2C%22-2%2C939.85%22%0D%0A%2C10%2F10%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C102.75%22%2C%22-1%2C837.10%22%0D%0A%2C10%2F13%2F2026%2CExpense%2C%2CAmazon%2CPackaging%2CSupplies%2C-86.40%2C%22-1%2C923.50%22%0D%0A%2C10%2F14%2F2026%2CExpense%2C%2CAMZN+Mktp+US%2C%2CSupplies%2C-86.40%2C%22-2%2C009.90%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%22-6%2C225.23%22%0D%0A%2C10%2F17%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C317.20%22%2C%22-4%2C908.03%22%0D%0A%2C10%2F20%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-58.00%2C%22-4%2C966.03%22%0D%0A%2C10%2F20%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-58.00%2C%22-5%2C024.03%22%0D%0A%2C10%2F24%2F2026%2CBill+Payment+%28Check%29%2C1053%2CSysco%2C%2CAccounts+Payable+%28A%2FP%29%2C%22-1%2C018.44%22%2C%22-6%2C042.47%22%0D%0A%2C10%2F27%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C245.90%22%2C%22-4%2C796.57%22%0D%0A%2C10%2F28%2F2026%2CExpense%2C%2CVerizon%2CPhones%2CUtilities%2C-112.60%2C%22-4%2C909.17%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22-%244%2C909.17%22%2C%0D%0A)

## The method

1. Put the bank lines and the books for one account and one month side by side, sorted by amount. Intuit's own version: "Set the date range with the Filter, then select the Amount column so identical amounts line up."
2. Pair equal amounts dated within a few days. Score each pair: the same date, the same payee words and the same reference each make it likelier.
3. Check each pair against the bank statement. If the statement shows the charge twice, both are real.
4. Act on the extra copy of each confirmed pair, then reconcile.

## What the window changes

The worked bakery month at five windows

| Window | Pairs | High | Medium | Low |
| --- | ---: | ---: | ---: | ---: |
| 0 days | 4 | 4 | 0 | 0 |
| 1 day | 6 | 4 | 1 | 1 |
| 3 days | 6 | 4 | 1 | 1 |
| 7 days | 6 | 4 | 1 | 1 |
| 31 days | 8 | 4 | 3 | 1 |

Widening to a week adds nothing here; at 31 days the rent ($2,400.00) and the internet bill ($189.99) pair with their own monthly repeats. A wide window is for a feed known to post days late, not for a first pass.

## The candidate list at 3 days

Pairs with confidence, the copy to keep and the action

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | -$642.18 | books line 11: 2026-10-06, SYSCO FOOD SVC | books line 10: 2026-10-06, Sysco Flour and dairy | Remove the extra entry: if it was added from the bank feed, Undo it in Categorized and exclude it; if it was entered by hand, delete or void it in the register |
| 2 | low | -$86.40 | books line 15: 2026-10-14, AMZN Mktp US | books line 14: 2026-10-13, Amazon Packaging | Remove the extra entry: if it was added from the bank feed, Undo it in Categorized and exclude it; if it was entered by hand, delete or void it in the register |
| 3 | high | -$58.00 | books line 19: 2026-10-20, Shell Van fuel | books line 18: 2026-10-20, Shell Van fuel | Remove the extra entry: if it was added from the bank feed, Undo it in Categorized and exclude it; if it was entered by hand, delete or void it in the register |
| 4 | medium | $1,245.90 | feed line 2: 2026-10-26, SQUARE INC DEP | books line 21: 2026-10-27, Square Card sales | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 5 | high | -$112.60 | feed line 3: 2026-10-28, VERIZON WIRELESS | books line 22: 2026-10-28, Verizon Phones | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 6 | high | $1,198.05 | feed line 5: 2026-10-29, SQUARE INC DEP | feed line 4: 2026-10-29, SQUARE INC DEP | Exclude this copy in For review; keep the other to match or add |

## Sources

- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)

## Related

- [Why duplicates happen](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/why-duplicates-happen/)
- [Exclude or delete](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/exclude-vs-delete/)
- [The month-end calendar](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/reconciliation-calendar-2026-2027/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/find-before-reconcile/  
Data as of: 2026-11-08
