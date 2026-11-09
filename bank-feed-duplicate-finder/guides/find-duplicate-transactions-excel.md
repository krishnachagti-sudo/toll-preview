# Find duplicate bank transactions in Excel or Google Sheets

To find duplicate bank transactions in a spreadsheet, count the other rows with the same amount dated within N days: on this worked file of 23 rows, the COUNTIFS formula below flags 12 rows with a twin within 3 days, the 6 pairs the tool lists, but it does not say which row of each pair to keep.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A10%2F26%2F2026%2CSQUARE+INC+DEP%2C%221%2C245.90%22%0D%0A10%2F28%2F2026%2CVERIZON+WIRELESS%2C-112.60%0D%0A10%2F29%2F2026%2CSQUARE+INC+DEP%2C%221%2C198.05%22%0D%0A10%2F29%2F2026%2CSQUARE+INC+DEP%2C%221%2C198.05%22%0D%0A10%2F30%2F2026%2CCOMCAST+BUSINESS%2C-189.99%0D%0A10%2F30%2F2026%2CSTAPLES+0412%2C-45.17%0D%0A10%2F31%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%0D%0A&books=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2COctober+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%22-2%2C400.00%22%0D%0A%2C10%2F02%2F2026%2CExpense%2C%2CComcast+Business%2C%2CUtilities%2C-189.99%2C%22-2%2C589.99%22%0D%0A%2C10%2F03%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C284.50%22%2C%22-1%2C305.49%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSysco%2CFlour+and+dairy%2CSupplies%2C-642.18%2C%22-1%2C947.67%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSYSCO+FOOD+SVC%2C%2CSupplies%2C-642.18%2C%22-2%2C589.85%22%0D%0A%2C10%2F08%2F2026%2CCheck%2C1052%2CRivera+Electric%2COven+repair%2CRepairs%2C-350.00%2C%22-2%2C939.85%22%0D%0A%2C10%2F10%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C102.75%22%2C%22-1%2C837.10%22%0D%0A%2C10%2F13%2F2026%2CExpense%2C%2CAmazon%2CPackaging%2CSupplies%2C-86.40%2C%22-1%2C923.50%22%0D%0A%2C10%2F14%2F2026%2CExpense%2C%2CAMZN+Mktp+US%2C%2CSupplies%2C-86.40%2C%22-2%2C009.90%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%22-6%2C225.23%22%0D%0A%2C10%2F17%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C317.20%22%2C%22-4%2C908.03%22%0D%0A%2C10%2F20%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-58.00%2C%22-4%2C966.03%22%0D%0A%2C10%2F20%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-58.00%2C%22-5%2C024.03%22%0D%0A%2C10%2F24%2F2026%2CBill+Payment+%28Check%29%2C1053%2CSysco%2C%2CAccounts+Payable+%28A%2FP%29%2C%22-1%2C018.44%22%2C%22-6%2C042.47%22%0D%0A%2C10%2F27%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C245.90%22%2C%22-4%2C796.57%22%0D%0A%2C10%2F28%2F2026%2CExpense%2C%2CVerizon%2CPhones%2CUtilities%2C-112.60%2C%22-4%2C909.17%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22-%244%2C909.17%22%2C%0D%0A)

## The formula

With dates in column A, descriptions in B and amounts in C (one row per transaction, both files pasted into one sheet), put this in D2 and fill down:

```
=COUNTIFS($C:$C,C2,$A:$A,">="&(A2-3),$A:$A,"<="&(A2+3))-1
```

It counts the rows with the same amount dated from 3 days before to 3 days after, minus the row itself. Anything above 0 has a candidate twin. Change both 3s to set the window. It works the same in Google Sheets.

## On the worked file

The pairs behind the flagged rows

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | -$642.18 | books line 11: 2026-10-06, SYSCO FOOD SVC | books line 10: 2026-10-06, Sysco Flour and dairy | Remove the extra entry: if it was added from the bank feed, Undo it in Categorized and exclude it; if it was entered by hand, delete or void it in the register |
| 2 | low | -$86.40 | books line 15: 2026-10-14, AMZN Mktp US | books line 14: 2026-10-13, Amazon Packaging | Remove the extra entry: if it was added from the bank feed, Undo it in Categorized and exclude it; if it was entered by hand, delete or void it in the register |
| 3 | high | -$58.00 | books line 19: 2026-10-20, Shell Van fuel | books line 18: 2026-10-20, Shell Van fuel | Remove the extra entry: if it was added from the bank feed, Undo it in Categorized and exclude it; if it was entered by hand, delete or void it in the register |
| 4 | medium | $1,245.90 | feed line 2: 2026-10-26, SQUARE INC DEP | books line 21: 2026-10-27, Square Card sales | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 5 | high | -$112.60 | feed line 3: 2026-10-28, VERIZON WIRELESS | books line 22: 2026-10-28, Verizon Phones | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 6 | high | $1,198.05 | feed line 5: 2026-10-29, SQUARE INC DEP | feed line 4: 2026-10-29, SQUARE INC DEP | Exclude this copy in For review; keep the other to match or add |

## What the formula does not do

- It flags both rows of a pair and says nothing about which to keep. The tool keeps the reconciled copy, then the books entry, then the earlier one.
- It cannot tell two copies of one charge from three: three equal rows each count 2.
- It treats rent paid on the 1st and the 31st as different only because they are outside the window; with a wider window, every monthly bill pairs. The tool marks amounts that repeat three or more times.
- Highlighting duplicate values (Home \> Conditional Formatting \> Highlight Cells Rules \> Duplicate Values) marks cells whose value repeats. On a bank sheet only the amount repeats for a charge entered twice with different text or dates, and amounts alone repeat for every monthly bill.

## Sources

- [Microsoft Support: Find and remove duplicates (read November 8, 2026)](https://support.microsoft.com/en-us/office/find-and-remove-duplicates-00e35bea-b46a-4d5d-b28e-66a552dc138d)
- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)

## Related

- [Excel duplicate highlighting compared](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/vs/excel-duplicates/)
- [Find duplicates before you reconcile](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/find-before-reconcile/)
- [Export bank transactions for checking](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/export-bank-transactions-qbo-xero-csv/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/find-duplicate-transactions-excel/  
Data as of: 2026-11-08
