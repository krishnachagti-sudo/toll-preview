# Before you reconnect a bank feed

Before you reconnect a bank feed, note the date and balance of the last transaction already in the books: in this worked reconnect, 12 lines dated September 1, 2026 to September 29, 2026, all before that date, came back into For review and are all already in the books.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A09%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%0D%0A09%2F02%2F2026%2CCOMCAST+BUSINESS%2C-189.99%0D%0A09%2F04%2F2026%2CSQUARE+INC+DEP%2C%221%2C315.40%22%0D%0A09%2F08%2F2026%2CSYSCO+FOOD+SVC%2C-712.06%0D%0A09%2F11%2F2026%2CSQUARE+INC+DEP%2C%221%2C208.75%22%0D%0A09%2F14%2F2026%2CSHELL+OIL+5741%2C-61.20%0D%0A09%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%0D%0A09%2F18%2F2026%2CSQUARE+INC+DEP%2C%221%2C288.10%22%0D%0A09%2F22%2F2026%2CAMAZON+MKTPL%2C-93.12%0D%0A09%2F25%2F2026%2CSQUARE+INC+DEP%2C%221%2C330.65%22%0D%0A09%2F28%2F2026%2CVERIZON+WIRELESS%2C-112.60%0D%0A09%2F29%2F2026%2CCHECK+1049%2C-275.00%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%0D%0A10%2F02%2F2026%2CSQUARE+INC+DEP%2C%221%2C274.30%22%0D%0A&books=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22September+1-30%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C09%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2CSeptember+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%22-2%2C400.00%22%0D%0A%2C09%2F02%2F2026%2CExpense%2C%2CComcast+Business%2C%2CUtilities%2C-189.99%2C%22-2%2C589.99%22%0D%0A%2C09%2F04%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C315.40%22%2C%22-1%2C274.59%22%0D%0A%2C09%2F08%2F2026%2CExpense%2C%2CSysco%2C%2CSupplies%2C-712.06%2C%22-1%2C986.65%22%0D%0A%2C09%2F11%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C208.75%22%2C-777.90%0D%0A%2C09%2F14%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-61.20%2C-839.10%0D%0A%2C09%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%22-5%2C054.43%22%0D%0A%2C09%2F18%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C288.10%22%2C%22-3%2C766.33%22%0D%0A%2C09%2F22%2F2026%2CExpense%2C%2CAmazon%2CPackaging%2CSupplies%2C-93.12%2C%22-3%2C859.45%22%0D%0A%2C09%2F25%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C330.65%22%2C%22-2%2C528.80%22%0D%0A%2C09%2F28%2F2026%2CExpense%2C%2CVerizon%2CPhones%2CUtilities%2C-112.60%2C%22-2%2C641.40%22%0D%0A%2C09%2F29%2F2026%2CCheck%2C1049%2CRivera+Electric%2C%2CRepairs%2C-275.00%2C%22-2%2C916.40%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22-%242%2C916.40%22%2C%0D%0A)

## Before

1. Write down the date of the newest transaction in the books for the account, and the reconciled balance.
2. Clear For review (or Xero's unreconciled lines) first, so anything new afterwards is from the reconnect.
3. Check that you are reconnecting the existing account and not adding it again as a new one.

## Why

- QuickBooks Online: "Disconnecting and reconnecting the account makes QuickBooks download past transactions again, which creates more duplicates."
- Adding it again as a new account is the other cause: "If the same account is connected twice, QuickBooks downloads every transaction twice."
- Xero, when a feed starts on an account already in Xero: For bank accounts already in Xero, this defaults to the date of the last transaction imported into the account. And: "When the direct feed starts, check you don't have any missing or duplicate transactions."

## After

1. Export what came back and the books for the same dates, and pair them.
2. Lines dated before the date you wrote down that pair with entries already there are the re-download: exclude them (QuickBooks Online) or delete the statement lines (Xero).
3. Lines after that date are new.

The worked re-download

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | -$2,400.00 | feed line 2: 2026-09-01, HARBOR PROPERTIES RENT | books line 7: 2026-09-01, Harbor Properties September rent | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 2 | high | -$189.99 | feed line 3: 2026-09-02, COMCAST BUSINESS | books line 8: 2026-09-02, Comcast Business | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 3 | high | $1,315.40 | feed line 4: 2026-09-04, SQUARE INC DEP | books line 9: 2026-09-04, Square Card sales | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 4 | high | -$712.06 | feed line 5: 2026-09-08, SYSCO FOOD SVC | books line 10: 2026-09-08, Sysco | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 5 | high | $1,208.75 | feed line 6: 2026-09-11, SQUARE INC DEP | books line 11: 2026-09-11, Square Card sales | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 6 | high | -$61.20 | feed line 7: 2026-09-14, SHELL OIL 5741 | books line 12: 2026-09-14, Shell Van fuel | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 7 | high | -$4,215.33 | feed line 8: 2026-09-15, GUSTO PAYROLL | books line 13: 2026-09-15, Gusto Payroll | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 8 | high | $1,288.10 | feed line 9: 2026-09-18, SQUARE INC DEP | books line 14: 2026-09-18, Square Card sales | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 9 | high | -$93.12 | feed line 10: 2026-09-22, AMAZON MKTPL | books line 15: 2026-09-22, Amazon Packaging | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 10 | high | $1,330.65 | feed line 11: 2026-09-25, SQUARE INC DEP | books line 16: 2026-09-25, Square Card sales | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 11 | high | -$112.60 | feed line 12: 2026-09-28, VERIZON WIRELESS | books line 17: 2026-09-28, Verizon Phones | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 12 | medium | -$275.00 | feed line 13: 2026-09-29, CHECK 1049 | books line 18: 2026-09-29, Rivera Electric | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |

## Sources

- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)
- [Xero Central: About manually importing bank transactions (read November 8, 2026)](https://central.xero.com/0/article/About-manually-importing-bank-statements-US)

## Related

- [Duplicates after reconnecting the bank](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/after-reconnecting-bank/)
- [Bank account connected twice](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/account-connected-twice/)
- [Why duplicates happen](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/why-duplicates-happen/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/reconnect-checklist/  
Data as of: 2026-11-08
