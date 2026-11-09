# Xero duplicate statement lines

Xero's Duplicate Statement Lines report compares the date and amount of statement lines; in this worked account it would flag the $520.10 payout listed twice on October 6, 2026, and the 3-day check here also finds a $128.75 purchase imported a day after its bank-feed line with different text.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CAmount%2CPayee%2CDescription%2CReference%2CSource%0D%0A3+Oct+2026%2C-45.99%2CSOFTWARE+CO%2CMONTHLY+PLAN%2CSUB-88%2CBank+Feed%0D%0A6+Oct+2026%2C520.10%2CSTRIPE%2CSTRIPE+PAYOUT%2CPO-1006%2CBank+Feed%0D%0A6+Oct+2026%2C520.10%2CSTRIPE%2CSTRIPE+PAYOUT%2CPO-1006%2CBank+Feed%0D%0A9+Oct+2026%2C-128.75%2COFFICE+MART%2CPOS+PURCHASE+4471%2C%2CBank+Feed%0D%0A10+Oct+2026%2C-128.75%2COffice+Mart%2CCard+purchase%2C%2CImported%0D%0A14+Oct+2026%2C-33.00%2CCAFE+NORTE%2CPOS+PURCHASE%2C%2CBank+Feed%0D%0A20+Oct+2026%2C477.25%2CSTRIPE%2CSTRIPE+PAYOUT%2CPO-1020%2CBank+Feed%0D%0A)

## Find them

Run the Duplicate Statement Lines report. Xero: "This report compares the date and amounts of the statement lines in a particular bank account and identifies any that are potential duplicates." The Statement Exceptions report in the Bank Reconciliation report pack shows lines Xero has already treated as duplicates.

## The worked account

Statement lines in twice

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | $520.10 | feed line 4: 2026-10-06, STRIPE STRIPE PAYOUT (bank feed) | feed line 3: 2026-10-06, STRIPE STRIPE PAYOUT (bank feed) | Delete this statement line (Bank Statements, Statement lines) |
| 2 | medium | -$128.75 | feed line 6: 2026-10-10, Office Mart Card purchase (imported) | feed line 5: 2026-10-09, OFFICE MART POS PURCHASE 4471 (bank feed) | Delete this statement line (Bank Statements, Statement lines) |

Pair 2 is the kind a date-and-amount comparison is not built for: the bank-feed line says OFFICE MART on October 9, the imported line says Office Mart on October 10. The window and the payee words pair them; the Source column marks the imported copy.

## Delete them

For one line: On the Reconcile tab, for the statement line you want to delete, click Options, then select Delete statement line. For several:

1. In the Accounting menu, select Bank Accounts.
2. For the relevant bank account, click the menu icon, then select Bank Statements.
3. From Showing, select Statement lines.
4. Select the checkbox next to each statement line you want to delete.
5. Click Delete.
6. Select the reason for deleting the statement line, then click Delete.

Xero: "You can't permanently delete a statement line from Xero." A line deleted in error can be restored from the same Statement lines view.

## Sources

- [Xero Central: Find and remove duplicate bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/Find-and-remove-duplicate-bank-statement-lines)
- [Xero Central: Delete or restore a bank statement line (read November 8, 2026)](https://central.xero.com/s/article/Delete-or-restore-a-bank-statement-line)
- [Xero Central: View bank statements and bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/View-bank-statements-and-bank-statement-lines-UK)

## Questions

### Does the report show near-duplicates?

Xero: "It doesn't show any partial matches".

### Who can delete statement lines?

"You need the administrator or standard + bank accounts user role to delete or restore a bank statement."

## Related

- [Xero: an imported statement that overlaps the feed](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/xero/overlapping-statement-import/)
- [Compared with Xero's duplicate report](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/vs/xero-duplicate-report/)
- [Protect closed reconciliations](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/protect-closed-reconciliations/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/xero-duplicate-statement-lines/  
Data as of: 2026-11-08
