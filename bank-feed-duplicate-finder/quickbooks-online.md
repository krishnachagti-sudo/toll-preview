# Find duplicate transactions in QuickBooks Online

QuickBooks Online has no built-in duplicate finder; in this worked October file the check pairs 7 bank lines waiting in For review with 16 register entries and lists 6 likely duplicates: 3 entries in the register twice, 2 feed lines already entered by hand and 1 line the feed sent twice, each the same amount within 3 days.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A10%2F26%2F2026%2CSQUARE+INC+DEP%2C%221%2C245.90%22%0D%0A10%2F28%2F2026%2CVERIZON+WIRELESS%2C-112.60%0D%0A10%2F29%2F2026%2CSQUARE+INC+DEP%2C%221%2C198.05%22%0D%0A10%2F29%2F2026%2CSQUARE+INC+DEP%2C%221%2C198.05%22%0D%0A10%2F30%2F2026%2CCOMCAST+BUSINESS%2C-189.99%0D%0A10%2F30%2F2026%2CSTAPLES+0412%2C-45.17%0D%0A10%2F31%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%0D%0A&books=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2COctober+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%22-2%2C400.00%22%0D%0A%2C10%2F02%2F2026%2CExpense%2C%2CComcast+Business%2C%2CUtilities%2C-189.99%2C%22-2%2C589.99%22%0D%0A%2C10%2F03%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C284.50%22%2C%22-1%2C305.49%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSysco%2CFlour+and+dairy%2CSupplies%2C-642.18%2C%22-1%2C947.67%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSYSCO+FOOD+SVC%2C%2CSupplies%2C-642.18%2C%22-2%2C589.85%22%0D%0A%2C10%2F08%2F2026%2CCheck%2C1052%2CRivera+Electric%2COven+repair%2CRepairs%2C-350.00%2C%22-2%2C939.85%22%0D%0A%2C10%2F10%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C102.75%22%2C%22-1%2C837.10%22%0D%0A%2C10%2F13%2F2026%2CExpense%2C%2CAmazon%2CPackaging%2CSupplies%2C-86.40%2C%22-1%2C923.50%22%0D%0A%2C10%2F14%2F2026%2CExpense%2C%2CAMZN+Mktp+US%2C%2CSupplies%2C-86.40%2C%22-2%2C009.90%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%22-6%2C225.23%22%0D%0A%2C10%2F17%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C317.20%22%2C%22-4%2C908.03%22%0D%0A%2C10%2F20%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-58.00%2C%22-4%2C966.03%22%0D%0A%2C10%2F20%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-58.00%2C%22-5%2C024.03%22%0D%0A%2C10%2F24%2F2026%2CBill+Payment+%28Check%29%2C1053%2CSysco%2C%2CAccounts+Payable+%28A%2FP%29%2C%22-1%2C018.44%22%2C%22-6%2C042.47%22%0D%0A%2C10%2F27%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C245.90%22%2C%22-4%2C796.57%22%0D%0A%2C10%2F28%2F2026%2CExpense%2C%2CVerizon%2CPhones%2CUtilities%2C-112.60%2C%22-4%2C909.17%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22-%244%2C909.17%22%2C%0D%0A)

## The two exports

- The books: run Transaction Detail by Account for the bank account and the month, then export it. Intuit's export steps: Go to Reports and select Standard reports. Search for and select the report you want to export. Classic view: select the Export icon, then select Export to Excel. New enhanced experience: select Export/Print, then select Export to Excel. Save the file somewhere you can easily find, like your Downloads folder or your desktop. Save the sheet as CSV.
- The bank lines: the lines waiting in For review, or the bank's own CSV for the same dates. The reader takes Intuit's upload layouts, Date, Description, Amount or Date, Description, Credit, Debit, and most bank CSVs with a date and an amount.
- Either file alone also works: the books alone finds entries in the register twice; the bank lines alone find lines the feed sent twice.

## The worked file

A made-up bakery's Business Checking for October 2026: 16 register entries and 7 bank lines still in For review.

What the check found

| Kind | Pairs | Total of the copies |
| --- | ---: | ---: |
| In the feed twice | 1 | $1,198.05 |
| Feed line already in the books | 2 | $1,358.50 |
| In the books twice | 3 | $786.58 |

Every pair, in date order, with the copy to keep and the action

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | -$642.18 | books line 11: 2026-10-06, SYSCO FOOD SVC | books line 10: 2026-10-06, Sysco Flour and dairy | Remove the extra entry: if it was added from the bank feed, Undo it in Categorized and exclude it; if it was entered by hand, delete or void it in the register |
| 2 | low | -$86.40 | books line 15: 2026-10-14, AMZN Mktp US | books line 14: 2026-10-13, Amazon Packaging | Remove the extra entry: if it was added from the bank feed, Undo it in Categorized and exclude it; if it was entered by hand, delete or void it in the register |
| 3 | high | -$58.00 | books line 19: 2026-10-20, Shell Van fuel | books line 18: 2026-10-20, Shell Van fuel | Remove the extra entry: if it was added from the bank feed, Undo it in Categorized and exclude it; if it was entered by hand, delete or void it in the register |
| 4 | medium | $1,245.90 | feed line 2: 2026-10-26, SQUARE INC DEP | books line 21: 2026-10-27, Square Card sales | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 5 | high | -$112.60 | feed line 3: 2026-10-28, VERIZON WIRELESS | books line 22: 2026-10-28, Verizon Phones | Match this line to the entry already in the books (Find other match if it is not suggested); if that entry is already matched or reconciled, exclude this line instead |
| 6 | high | $1,198.05 | feed line 5: 2026-10-29, SQUARE INC DEP | feed line 4: 2026-10-29, SQUARE INC DEP | Exclude this copy in For review; keep the other to match or add |

Pair 2 ($86.40, Amazon and AMZN Mktp US a day apart) is low confidence: the payee words do not match. Rent of $2,400.00 on October 1 and October 31 is not paired at all: 30 days apart is outside the window.

## What each action means in QuickBooks Online

- A line the feed sent twice: exclude the extra copy in For review. Intuit: "Once a downloaded transaction is added or excluded, QuickBooks stops the bank from downloading it again."
- A feed line you had already entered: match it instead of adding it. Intuit: "Match downloaded transactions to existing records instead of adding them." If the entry is already reconciled, Intuit says: "You already reconciled the record. In this case, exclude the transaction so it doesn't create a duplicate."
- An entry in the register twice: if it was added from the feed, undo it in Categorized and exclude it; if it was entered by hand, delete or void it. Step by step: [batch exclude in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/batch-exclude-duplicates-quickbooks-online/).

## Sources

- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)
- [Intuit QuickBooks: Match your bank and credit card transactions, updated August 14, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-feeds/match-online-bank-transactions-quickbooks-online/L6qyw0PvP_US_en_US)
- [Intuit QuickBooks: Export your reports to Excel from QuickBooks Online (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-articles/export-your-reports-to-excel-from-quickbooks-online/00/262097)
- [Intuit QuickBooks: Format CSV files in Excel to get bank transactions into QuickBooks, updated August 24, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/format-csv-files-excel-bank-transactions-quickbooks/L4BjLWckq_US_en_US)
- [QuickBooks Community: transactions from my bank account are being duplicated (Intuit moderator answer, September 22, 2025) (read November 8, 2026)](https://quickbooks.intuit.com/community/banking-27/transactions-brought-in-direct-from-my-bank-account-are-being-duplicated-this-is-causing-a-big-problem-why-is-this-happening-and-what-can-i-do-about-it-298748)

## Questions

### Does QuickBooks Online have a duplicate finder?

Not as a report. Intuit's help page says to set the date range with the Filter, then select the Amount column so identical amounts line up. An Intuit Community moderator wrote in September 2025: "Currently, the only way to handle duplicate transactions is to review them individually and exclude them by batch."

### Which copy do I keep?

Intuit: "If one of the transactions is reconciled, keep that one." The tool applies that rule first, then keeps the entry already in the books over a feed line waiting for review, then the earlier copy.

### The tabs on my screen say Pending and Posted. Is that the same?

Yes. Intuit: "Select the For review tab. It may be labeled as Pending instead." and "Select the Categorized tab. It may be labeled as Posted instead."

## Related

- [Duplicates after reconnecting the bank](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/after-reconnecting-bank/)
- [Manual entries the feed brought again](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/manual-entry-and-bank-feed/)
- [Batch exclude in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/batch-exclude-duplicates-quickbooks-online/)
- [The same check in Xero](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/xero/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/  
Data as of: 2026-11-08
