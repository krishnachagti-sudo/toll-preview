# Why bank transactions are duplicated

Bank-feed duplicates come from a handful of causes, and they look different: in the 6 worked files behind this page, 4 causes leave exact copies on the same date (a reconnect, an overlapping upload or import, an account connected twice) and 2 leave near copies a day apart with different payee text (entries made by hand, a connected app).

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CDescription%2CAmount%0D%0A10%2F26%2F2026%2CSQUARE+INC+DEP%2C%221%2C245.90%22%0D%0A10%2F28%2F2026%2CVERIZON+WIRELESS%2C-112.60%0D%0A10%2F29%2F2026%2CSQUARE+INC+DEP%2C%221%2C198.05%22%0D%0A10%2F29%2F2026%2CSQUARE+INC+DEP%2C%221%2C198.05%22%0D%0A10%2F30%2F2026%2CCOMCAST+BUSINESS%2C-189.99%0D%0A10%2F30%2F2026%2CSTAPLES+0412%2C-45.17%0D%0A10%2F31%2F2026%2CHARBOR+PROPERTIES+RENT%2C%22-2%2C400.00%22%0D%0A&books=Northwind+Bakery+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Checking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CHarbor+Properties%2COctober+rent%2CRent+or+Lease%2C%22-2%2C400.00%22%2C%22-2%2C400.00%22%0D%0A%2C10%2F02%2F2026%2CExpense%2C%2CComcast+Business%2C%2CUtilities%2C-189.99%2C%22-2%2C589.99%22%0D%0A%2C10%2F03%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C284.50%22%2C%22-1%2C305.49%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSysco%2CFlour+and+dairy%2CSupplies%2C-642.18%2C%22-1%2C947.67%22%0D%0A%2C10%2F06%2F2026%2CExpense%2C%2CSYSCO+FOOD+SVC%2C%2CSupplies%2C-642.18%2C%22-2%2C589.85%22%0D%0A%2C10%2F08%2F2026%2CCheck%2C1052%2CRivera+Electric%2COven+repair%2CRepairs%2C-350.00%2C%22-2%2C939.85%22%0D%0A%2C10%2F10%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C102.75%22%2C%22-1%2C837.10%22%0D%0A%2C10%2F13%2F2026%2CExpense%2C%2CAmazon%2CPackaging%2CSupplies%2C-86.40%2C%22-1%2C923.50%22%0D%0A%2C10%2F14%2F2026%2CExpense%2C%2CAMZN+Mktp+US%2C%2CSupplies%2C-86.40%2C%22-2%2C009.90%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CGusto%2CPayroll%2CPayroll+Expenses%2C%22-4%2C215.33%22%2C%22-6%2C225.23%22%0D%0A%2C10%2F17%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C317.20%22%2C%22-4%2C908.03%22%0D%0A%2C10%2F20%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-58.00%2C%22-4%2C966.03%22%0D%0A%2C10%2F20%2F2026%2CExpense%2C%2CShell%2CVan+fuel%2CCar+%26+Truck%2C-58.00%2C%22-5%2C024.03%22%0D%0A%2C10%2F24%2F2026%2CBill+Payment+%28Check%29%2C1053%2CSysco%2C%2CAccounts+Payable+%28A%2FP%29%2C%22-1%2C018.44%22%2C%22-6%2C042.47%22%0D%0A%2C10%2F27%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C245.90%22%2C%22-4%2C796.57%22%0D%0A%2C10%2F28%2F2026%2CExpense%2C%2CVerizon%2CPhones%2CUtilities%2C-112.60%2C%22-4%2C909.17%22%0D%0ATotal+for+Business+Checking%2C%2C%2C%2C%2C%2C%2C%22-%244%2C909.17%22%2C%0D%0A)

## The causes

Each cause, what its duplicates look like and what the worked file for it gives

| Cause | What the copies look like | Pairs in the worked file | Same date | One block of dates |
| --- | --- | ---: | ---: | --- |
| [A bank reconnect downloaded past lines again](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/after-reconnecting-bank/) | Exact copies of lines already in the books, in one block of dates | 12 | 12 | yes |
| [Expenses entered by hand, then the feed](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/manual-entry-and-bank-feed/) | Near copies: same amount, often a day later, different payee text | 5 | 1 | yes |
| [A bank file uploaded over dates the feed had](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/overlapping-upload/) | Exact copies inside the feed, over the overlap only | 7 | 7 | yes |
| [The same account connected twice](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/account-connected-twice/) | Exact copies of every line, every day | 10 | 10 | yes |
| [A connected app and the bank record the same payout](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/connected-app/) | Near copies: the bank a day after the app | 6 | 2 | yes |
| [Xero: a statement imported over the feed](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/xero/overlapping-statement-import/) | Exact copies, one Imported and one Bank Feed | 5 | 5 | yes |

## Causes in Intuit's and Xero's words

- Reconnecting: "Disconnecting and reconnecting the account makes QuickBooks download past transactions again, which creates more duplicates."
- Connected twice: "If the same account is connected twice, QuickBooks downloads every transaction twice."
- Overlapping files and adding instead of matching: Intuit names files that import a file that overlaps with your bank feed, and when you add a downloaded transaction instead of matching it.
- Xero: "Duplicate bank statement lines can occur if a bank statement is manually imported into an organisation, as well as imported via a bank feed."
- Inside the books, Intuit also lists: Income is doubled; A bill and an expense cover the same purchase; A connected app and your bank record the same sale; A recurring template creates duplicate transactions. A bill and an expense for one purchase, or an invoice and a sales receipt for one sale, are the same money twice in the books even when the bank shows it once.

## The symptoms

- The book balance of the bank account is off from the statement by the duplicates: higher for money in counted twice, lower for money out.
- Expenses or income for the month look high, by the same amount.
- A reconciliation that will not tie, with the difference equal to one or more transactions.

Next: [find them before you reconcile](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/find-before-reconcile/).

## Sources

- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)
- [Xero Central: Find and remove duplicate bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/Find-and-remove-duplicate-bank-statement-lines)

## Questions

### How do I know it is a duplicate and not two real charges?

Check the bank statement first. Intuit's first step: if the statement shows the charge twice, "the charge really happened twice", and it is a matter for the bank, not the books.

### What is the symptom in Xero?

"If the statement balance that shows in Xero is different to your actual bank balance, this could be a sign that duplicate statement lines have been imported."

## Related

- [Find duplicates before you reconcile](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/find-before-reconcile/)
- [Exclude or delete](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/exclude-vs-delete/)
- [QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/why-duplicates-happen/  
Data as of: 2026-11-08
