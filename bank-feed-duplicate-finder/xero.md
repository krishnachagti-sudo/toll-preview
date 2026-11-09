# Find duplicate bank transactions in Xero

In this worked Xero file the check pairs 3 statement lines waiting to be reconciled with 6 account transactions and finds 2 likely duplicates: a $246.50 spend money entered twice on October 9, 2026 with the same reference, and one statement line whose transaction was already entered by hand; Xero's own Duplicate Statement Lines report looks at statement lines only.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CAmount%2CPayee%2CDescription%2CReference%2CSource%0D%0A21+Oct+2026%2C-114.90%2CTELCO%2CDIRECT+DEBIT%2C%2CBank+Feed%0D%0A22+Oct+2026%2C631.05%2CSTRIPE%2CSTRIPE+PAYOUT%2CPO-1022%2CBank+Feed%0D%0A23+Oct+2026%2C-87.60%2CFUEL+CO+112%2CPOS+PURCHASE%2C%2CBank+Feed%0D%0A&books=Account+Transactions%0D%0ATidewater+Studio+%28made-up+sample%29%0D%0AFor+the+period+1+October+2026+to+31+October+2026%0D%0A%0D%0ADate%2CSource%2CDescription%2CReference%2CDebit%2CCredit%2CRunning+Balance%2CRelated+account%0D%0ABusiness+Account%0D%0A2+Oct+2026%2CSpend+Money%2CKauri+Lane+Lettings%2CRENT-10%2C%2C%221%2C800.00%22%2C%22-1%2C800.00%22%2CRent%0D%0A6+Oct+2026%2CReceive+Money%2CStripe%2CPO-1006%2C664.10%2C%2C%22-1%2C135.90%22%2CSales%0D%0A9+Oct+2026%2CSpend+Money%2CPrintworks%2CINV-2207%2C%2C246.50%2C%22-1%2C382.40%22%2CPrinting+%26+Stationery%0D%0A9+Oct+2026%2CSpend+Money%2CPrintworks%2CINV-2207%2C%2C246.50%2C%22-1%2C628.90%22%2CPrinting+%26+Stationery%0D%0A13+Oct+2026%2CReceive+Money%2CStripe%2CPO-1013%2C718.40%2C%2C-910.50%2CSales%0D%0A20+Oct+2026%2CSpend+Money%2CTelco%2C%2C%2C114.90%2C%22-1%2C025.40%22%2CTelephone+%26+Internet%0D%0A)

## The two exports

- Statement lines: Xero's Uncoded statement lines list, export a list of bank statement lines not yet reconciled to a PDF or CSV file to work with offline. Steps: In the Accounting menu, select Bank accounts. At the top right of the screen, click the menu icon, then select Uncoded statement lines. Under Bank Account, select a specific bank account (or all, or Bulk download across all orgs). Enter dates in the From and To fields, then choose an Order By and Sort Order option. Click Run, then click Export and select the format. Xero says it needs the administrator user role.
- Account transactions: the Account Transactions report for the bank account, with Debit and Credit (Xero: "The report must include the Debit and Credit columns for the running balance to work."), exported to a spreadsheet and saved as CSV.
- A statement file you imported, in Xero's CSV fields (Date, Amount, Payee, Description, Reference, Check number), reads the same way. A Source column with Bank Feed, Imported or User, as Xero shows it on statement lines, is read too.

## The worked file

What the check found

| Kind | Pairs | Total of the copies |
| --- | ---: | ---: |
| In the feed twice | 0 | $0.00 |
| Feed line already in the books | 1 | $114.90 |
| In the books twice | 1 | $246.50 |

The pairs, with the copy to keep and the Xero action

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | -$246.50 | books line 10: 2026-10-09, Printworks | books line 9: 2026-10-09, Printworks | Remove the extra account transaction (unreconcile it first if it is reconciled) |
| 2 | medium | -$114.90 | feed line 2: 2026-10-21, TELCO DIRECT DEBIT (bank feed) | books line 12: 2026-10-20, Telco | Reconcile this statement line to the transaction already entered; if that transaction is already reconciled, delete this statement line instead |

The two Printworks spend money entries have the same date, amount and reference INV-2207, so they score the most a pair can. Before deleting either, check the bank statement: one Printworks charge there means one entry is extra.

## The Xero actions

- A statement line in twice: delete one. Xero: "You should only delete a statement line to remove a duplicate." Steps: In the Accounting menu, select Bank Accounts. For the relevant bank account, click the menu icon, then select Bank Statements. From Showing, select Statement lines. Select the checkbox next to each statement line you want to delete. Click Delete. Select the reason for deleting the statement line, then click Delete.
- A statement line whose transaction is already entered: reconcile it to that transaction instead of creating a new one.
- An account transaction in twice: remove the extra one. If it is reconciled, deleting its statement line is not the fix: Xero says deleting a reconciled line Xero deletes the bank statement line and reverts the account transaction back to unreconciled.

## Sources

- [Xero Central: Find and remove duplicate bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/Find-and-remove-duplicate-bank-statement-lines)
- [Xero Central: Delete or restore a bank statement line (read November 8, 2026)](https://central.xero.com/s/article/Delete-or-restore-a-bank-statement-line)
- [Xero Central: View bank statements and bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/View-bank-statements-and-bank-statement-lines-UK)
- [Xero Central: Export a list of uncoded bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/Export-a-list-of-uncoded-bank-statement-lines)
- [Xero Central: Account Transactions report (read November 8, 2026)](https://central.xero.com/s/article/Account-Transactions-report-New)
- [Xero Central: Import a bank statement in CSV format (read November 8, 2026)](https://central.xero.com/0/article/Import-a-CSV-bank-statement-US)
- [Xero Product Ideas: Automatically recognise and remove duplicate statement lines (Xero reply, June 16, 2025) (read November 8, 2026)](https://productideas.xero.com/forums/967136-banking-chart-of-accounts/suggestions/45978244-bank-reconciliation-automatically-recognise-and-r)

## Questions

### Does Xero remove duplicate statement lines by itself?

No. Xero's reply on its ideas forum (June 16, 2025): "Xero won't automatically delete duplicate statement lines for you". On import, though: "Transactions matching those already in Xero will be treated as duplicates and won't be imported."

### Can a deleted statement line come back?

Yes. Xero: "You can't permanently delete a statement line from Xero." Deleted lines stay on the statement and can be restored.

## Related

- [Xero duplicates after an overlapping statement import](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/xero/overlapping-statement-import/)
- [Xero duplicate statement lines, step by step](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/xero-duplicate-statement-lines/)
- [Compared with Xero's duplicate report](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/vs/xero-duplicate-report/)
- [The same check in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/xero/  
Data as of: 2026-11-08
