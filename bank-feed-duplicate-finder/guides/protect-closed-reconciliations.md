# Protect closed reconciliations while you clean up

A duplicate clean-up must not change a reconciled period: in this worked Xero account, 2 pairs are found, the reconciled copy is kept in 1, 1 pair has both copies reconciled and goes to your accountant, and 1 line already marked Deleted is left out.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CAmount%2CPayee%2CDescription%2CReference%2CSource%2CStatus%0D%0A2+Sep+2026%2C-1800.00%2CKauri+Lane+Lettings%2CRent+September%2CRENT-09%2CBank+Feed%2CReconciled%0D%0A2+Sep+2026%2C-1800.00%2CKauri+Lane+Lettings%2CRent+September%2CRENT-09%2CImported%2CUnreconciled%0D%0A10+Sep+2026%2C612.40%2CStripe%2CPayout%2CPO-0910%2CBank+Feed%2CReconciled%0D%0A11+Sep+2026%2C612.40%2CSTRIPE%2CSTRIPE+PAYOUT%2CPO-0910%2CBank+Feed%2CReconciled%0D%0A18+Sep+2026%2C-246.50%2CPrintworks%2CCard+purchase%2C%2CBank+Feed%2CUnreconciled%0D%0A25+Sep+2026%2C-61.20%2CFuel+Co%2CCard+purchase%2C%2CBank+Feed%2CReconciled%0D%0A29+Sep+2026%2C-61.20%2CFuel+Co%2CCard+purchase%2C%2CImported%2CDeleted%0D%0A)

## The checklist

1. Write down the last reconciled statement date and its ending balance for the account.
2. Lock the books up to that date in QuickBooks Online. Intuit's steps: Go to Settings and select Account and settings. Select the Advanced tab. In the Accounting section, select Edit. Turn on Close the books. Enter a Closing date. Select a security option: Allow changes after viewing a warning, or Allow changes after viewing a warning and entering password. Select Save.
3. In every pair, keep the reconciled copy. Intuit: "If one of the transactions is reconciled, keep that one."
4. Where both copies are reconciled, stop: removing either changes a reconciled period. Take that pair to your accountant.
5. After the clean-up, rerun the reconciliation report for the last closed period and compare the ending balance with the one you wrote down.

## The worked account

Xero statement lines with Xero's Status column (Reconciled, Unreconciled, Deleted) and Source column. The tool reads both.

Pairs, with the reconciled copy kept

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | -$1,800.00 | feed line 3: 2026-09-02, Kauri Lane Lettings Rent September (imported) | feed line 2: 2026-09-02, Kauri Lane Lettings Rent September (bank feed) | Delete this statement line (Bank Statements, Statement lines) |
| 2 | high | $612.40 | feed line 5: 2026-09-11, STRIPE STRIPE PAYOUT (bank feed) | feed line 4: 2026-09-10, Stripe Payout (bank feed) | Both copies are reconciled: ask your accountant before changing a reconciled period |

The two Stripe lines a day apart are both reconciled. They may be a real duplicate that was reconciled twice, or two payouts of the same amount; only the Stripe dashboard and the statement settle it, and a reconciled period changes whichever way it goes.

## Xero

Deleting a statement line changes the Statement Balance, and Xero says "You should only delete a statement line to remove a duplicate." The QuickBooks Online locking steps above are Intuit's; Xero's own lock-date page could not be read for this guide, so its steps are not given here.

## Sources

- [Intuit QuickBooks (Canada): Lock your books in QuickBooks Online, "Updated 1 month ago" (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-ca/help-article/close-books/close-books-quickbooks-online/L59LelyPM_CA_en_CA)
- [Intuit QuickBooks: Fix duplicate transactions in QuickBooks Online bank feeds (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/duplicate-transactions/fix-duplicate-transactions-quickbooks-online-bank-feeds/L1fjxl88f_US_en_US)
- [Xero Central: Delete or restore a bank statement line (read November 8, 2026)](https://central.xero.com/s/article/Delete-or-restore-a-bank-statement-line)
- [Xero Central: View bank statements and bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/View-bank-statements-and-bank-statement-lines-UK)

## Questions

### What happens in Xero if I delete a reconciled statement line?

Xero Xero deletes the bank statement line and reverts the account transaction back to unreconciled.

## Related

- [Exclude or delete](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/exclude-vs-delete/)
- [Xero duplicate statement lines](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/xero-duplicate-statement-lines/)
- [The month-end calendar](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/reconciliation-calendar-2026-2027/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/protect-closed-reconciliations/  
Data as of: 2026-11-08
