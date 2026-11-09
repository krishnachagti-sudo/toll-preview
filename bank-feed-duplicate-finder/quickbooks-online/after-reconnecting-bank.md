# Duplicates after reconnecting the bank in QuickBooks Online

After a reconnect, QuickBooks Online downloads past transactions again; in this worked file 12 lines in For review from September 1, 2026 to September 29, 2026 match entries already in the register (100% of the feed lines in that range, $13,202.20 in all), and the 2 October lines are new.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A09%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%0D%0A09%2F02%2F2026%2CCOMCAST+BUSINESS%2C-189.99%0D%0A09%2F04%2F2026%2CSQUARE+INC+DEP%2C%221%2C315.40%22%0D%0A09%2F08%2F2026%2CSYSCO+FOOD+SVC%2C-712.06%0D%0A09%2F11%2F2026%2CSQUARE+INC+DEP%2C%221%2C208.75%22%0D%0A09%2F14%2F2026%2CSHELL+OIL+5741%2C-61.20%0D%0A09%2F15%2F2026%2CGUSTO+PAYROLL%2C%22-4%2C215.33%22%0D%0A09%2F18%2F2026%2CSQUARE+INC+DEP%2C%221%2C288.10%22%0D%0A09%2F22%2F2026%2CAMAZON+MKTPL%2C-93.12%0D%0A09%2F25%2F2026%2CSQUARE+INC+DEP%2C%221%2C330.65%22%0D%0A09%2F28%2F2026%2CVERIZON+WIRELESS%2C-112.60%0D%0A09%2F29%2F2026%2CCHECK+1049%2C-275.00%0D%0A10%2F01%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%0D%0A10%2F02%2F2026%2CSQUARE+INC+DEP%2C%221%2C274.30%22%0D%0A&books=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22September+1-30%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C09%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2CSeptember+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%22-2%2C400.00%22%0D%0A%2C09%2F02%2F2026%2CExpense%2C%2CComcast+Business%2C%2CUtilities%2C-189.99%2C%22-2%2C589.99%22%0D%0A%2C09%2F04%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C315.40%22%2C%22-1%2C274.59%22%0D%0A%2C09%2F08%2F2026%2CExpense%2C%2CSysco%2C%2CSupplies%2C-712.06%2C%22-1%2C986.65%22%0D%0A%2C09%2F11%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C208.75%22%2C-777.90%0D%0A%2C09%2F14%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-61.20%2C-839.10%0D%0A%2C09%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%22-5%2C054.43%22%0D%0A%2C09%2F18%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C288.10%22%2C%22-3%2C766.33%22%0D%0A%2C09%2F22%2F2026%2CExpense%2C%2CAmazon%2CPackaging%2CSupplies%2C-93.12%2C%22-3%2C859.45%22%0D%0A%2C09%2F25%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C330.65%22%2C%22-2%2C528.80%22%0D%0A%2C09%2F28%2F2026%2CExpense%2C%2CVerizon%2CPhones%2CUtilities%2C-112.60%2C%22-2%2C641.40%22%0D%0A%2C09%2F29%2F2026%2CCheck%2C1049%2CRivera+Electric%2C%2CRepairs%2C-275.00%2C%22-2%2C916.40%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22-%242%2C916.40%22%2C%0D%0A)

## The worked file

A made-up bakery reconnected Business Checking on October 3. September was already matched and reconciled. For review now holds 14 lines: September again, and two new October lines.

The September lines that came back, and the entries they match

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

12 pairs in a row covering every September feed line is the reconnect pattern: one block of dates, all already in the books. One pair (the check) is medium confidence because the bank wrote CHECK 1049 and the register says Rivera Electric; the amount and date still match.

## Clearing them

1. Confirm the range: the dates in the pattern above should end where your last reconciled statement ends.
2. Select the lines in For review and exclude them in one batch. Intuit: "Once a downloaded transaction is added or excluded, QuickBooks stops the bank from downloading it again."
3. Leave the October lines: they are new and still need to be matched or added.
4. Check the reconciled balance afterwards: excluding lines in For review does not change the register. Steps for large piles: [batch exclude](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/batch-exclude-duplicates-quickbooks-online/).

## Sources

- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)
- [Intuit QuickBooks: Match your bank and credit card transactions, updated August 14, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-feeds/match-online-bank-transactions-quickbooks-online/L6qyw0PvP_US_en_US)

## Questions

### Why did reconnecting bring old transactions back?

Intuit: "Disconnecting and reconnecting the account makes QuickBooks download past transactions again, which creates more duplicates."

### Do I match or exclude the lines that came back?

Exclude them when the entries they repeat are already matched or reconciled. Intuit's matching article: "You already reconciled the record. In this case, exclude the transaction so it doesn't create a duplicate."

## Related

- [Before you reconnect: a checklist](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/reconnect-checklist/)
- [Batch exclude in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/batch-exclude-duplicates-quickbooks-online/)
- [Protect closed reconciliations](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/protect-closed-reconciliations/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/after-reconnecting-bank/  
Data as of: 2026-11-08
