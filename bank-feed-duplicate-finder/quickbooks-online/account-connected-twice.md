# Bank account connected twice

When the same bank account is connected twice, QuickBooks Online downloads every transaction twice; loading the second connection's lines against the first account's register in this worked file pairs all 10 of 10 lines (100%, $13,634.30), the sign that the fix is to disconnect the extra connection, not to exclude lines one by one.

## Pair the two accounts' lines

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES%2C%22-2%2C400.00%22%0D%0A10%2F03%2F2026%2CSQUARE%2C%221%2C284.50%22%0D%0A10%2F06%2F2026%2CSYSCO%2C-642.18%0D%0A10%2F08%2F2026%2CCHECK+1052%2C-350.00%0D%0A10%2F10%2F2026%2CSQUARE%2C%221%2C102.75%22%0D%0A10%2F15%2F2026%2CGUSTO%2C%22-4%2C215.33%22%0D%0A10%2F17%2F2026%2CSQUARE%2C%221%2C317.20%22%0D%0A10%2F20%2F2026%2CSHELL%2C-58.00%0D%0A10%2F24%2F2026%2CSYSCO%2C%22-1%2C018.44%22%0D%0A10%2F27%2F2026%2CSQUARE%2C%221%2C245.90%22%0D%0A&books=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-27%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2C%2CSupplies%2C%22-2%2C400.00%22%2C%22-2%2C400.00%22%0D%0A%2C10%2F03%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%221%2C284.50%22%2C%22-1%2C115.50%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSysco%2C%2CSupplies%2C-642.18%2C%22-1%2C757.68%22%0D%0A%2C10%2F08%2F2026%2CExpense%2C%2CCheck+1052%2C%2CSupplies%2C-350.00%2C%22-2%2C107.68%22%0D%0A%2C10%2F10%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%221%2C102.75%22%2C%22-1%2C004.93%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2C%2CSupplies%2C%22-4%2C215.33%22%2C%22-5%2C220.26%22%0D%0A%2C10%2F17%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%221%2C317.20%22%2C%22-3%2C903.06%22%0D%0A%2C10%2F20%2F2026%2CExpense%2C%2CShell%2C%2CSupplies%2C-58.00%2C%22-3%2C961.06%22%0D%0A%2C10%2F24%2F2026%2CExpense%2C%2CSysco%2C%2CSupplies%2C%22-1%2C018.44%22%2C%22-4%2C979.50%22%0D%0A%2C10%2F27%2F2026%2CDeposit%2C%2CSquare%2C%2CSales%2C%221%2C245.90%22%2C%22-3%2C733.60%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22-%243%2C733.60%22%2C%0D%0A)

## What Intuit says

"If the same account is connected twice, QuickBooks downloads every transaction twice." Intuit's fix is on the bank connection, not the lines: check the bank transactions page, disconnect the extra connection, make its account inactive and keep the original.

## Confirming it with the two accounts' lines

Export the register of the account you keep (the books file) and the lines of the second account (the bank-feed file) for the same dates. If nearly every line pairs, same date and same amount, it is one bank account connected twice.

Every line of the second connection has a twin

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | -$2,400.00 | feed line 2: 2026-10-01, HARBOR PROPERTIES | books line 7: 2026-10-01, Harbor Properties | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 2 | high | $1,284.50 | feed line 3: 2026-10-03, SQUARE | books line 8: 2026-10-03, Square | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 3 | high | -$642.18 | feed line 4: 2026-10-06, SYSCO | books line 9: 2026-10-06, Sysco | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 4 | high | -$350.00 | feed line 5: 2026-10-08, CHECK 1052 | books line 10: 2026-10-08, Check 1052 | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 5 | high | $1,102.75 | feed line 6: 2026-10-10, SQUARE | books line 11: 2026-10-10, Square | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 6 | high | -$4,215.33 | feed line 7: 2026-10-15, GUSTO | books line 12: 2026-10-15, Gusto | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 7 | high | $1,317.20 | feed line 8: 2026-10-17, SQUARE | books line 13: 2026-10-17, Square | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 8 | high | -$58.00 | feed line 9: 2026-10-20, SHELL | books line 14: 2026-10-20, Shell | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 9 | high | -$1,018.44 | feed line 10: 2026-10-24, SYSCO | books line 15: 2026-10-24, Sysco | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 10 | high | $1,245.90 | feed line 11: 2026-10-27, SQUARE | books line 16: 2026-10-27, Square | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |

10 of 10 pairs on the same day with the same payee is not a coincidence of amounts. A few unpaired lines would mean two real accounts that share some payments; then do not disconnect.

## Sources

- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)

## Related

- [Duplicates after reconnecting the bank](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/after-reconnecting-bank/)
- [Why duplicates happen](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/why-duplicates-happen/)
- [Before you reconnect: a checklist](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/reconnect-checklist/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/account-connected-twice/  
Data as of: 2026-11-08
