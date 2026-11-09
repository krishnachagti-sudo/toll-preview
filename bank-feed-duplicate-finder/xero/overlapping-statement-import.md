# Xero: an imported statement that overlaps the feed

A statement imported into Xero for days the bank feed already covered puts those statement lines in twice: in this worked file 5 lines from October 12, 2026 to October 16, 2026 ($4,708.43) are in both the Imported statement and the Bank Feed, and deleting the 5 imported copies leaves one line per transaction.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CAmount%2CPayee%2CDescription%2CReference%2CSource%0D%0A1+Oct+2026%2C-1800.00%2CKauri+Lane+Lettings%2CRent+October%2CRENT-10%2CImported%0D%0A5+Oct+2026%2C645.12%2CStripe%2CPayout%2CPO-1005%2CImported%0D%0A8+Oct+2026%2C-93.75%2CFuel+Co%2CCard+purchase%2C%2CImported%0D%0A12+Oct+2026%2C718.40%2CStripe%2CPayout%2CPO-1012%2CImported%0D%0A13+Oct+2026%2C-246.50%2CPrintworks%2CCard+purchase%2C%2CImported%0D%0A14+Oct+2026%2C-61.20%2CFuel+Co%2CCard+purchase%2C%2CImported%0D%0A15+Oct+2026%2C-3100.00%2CPayroll%2CWages%2CPAY-15%2CImported%0D%0A16+Oct+2026%2C582.33%2CStripe%2CPayout%2CPO-1016%2CImported%0D%0A12+Oct+2026%2C718.40%2CSTRIPE%2CSTRIPE+PAYOUT%2CPO-1012%2CBank+Feed%0D%0A13+Oct+2026%2C-246.50%2CPRINTWORKS+LTD%2CPOS+PURCHASE%2C%2CBank+Feed%0D%0A14+Oct+2026%2C-61.20%2CFUEL+CO+112%2CPOS+PURCHASE%2C%2CBank+Feed%0D%0A15+Oct+2026%2C-3100.00%2CPAYROLL%2CWAGES%2CPAY-15%2CBank+Feed%0D%0A16+Oct+2026%2C582.33%2CSTRIPE%2CSTRIPE+PAYOUT%2CPO-1016%2CBank+Feed%0D%0A19+Oct+2026%2C691.27%2CSTRIPE%2CSTRIPE+PAYOUT%2CPO-1019%2CBank+Feed%0D%0A21+Oct+2026%2C-114.90%2CTELCO%2CDIRECT+DEBIT%2C%2CBank+Feed%0D%0A)

## What Xero says

"Duplicate bank statement lines can occur if a bank statement is manually imported into an organisation, as well as imported via a bank feed."

## The worked file

A made-up studio imported a CSV statement for October 1 to 16 while its new bank feed was starting from October 12. The statement lines, with Xero's Source column, are the bank-feed file here.

Statement lines in twice: the imported copy is marked to delete

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | $718.40 | feed line 5: 2026-10-12, Stripe Payout (imported) | feed line 10: 2026-10-12, STRIPE STRIPE PAYOUT (bank feed) | Delete this statement line (Bank Statements, Statement lines) |
| 2 | high | -$246.50 | feed line 6: 2026-10-13, Printworks Card purchase (imported) | feed line 11: 2026-10-13, PRINTWORKS LTD POS PURCHASE (bank feed) | Delete this statement line (Bank Statements, Statement lines) |
| 3 | high | -$61.20 | feed line 7: 2026-10-14, Fuel Co Card purchase (imported) | feed line 12: 2026-10-14, FUEL CO 112 POS PURCHASE (bank feed) | Delete this statement line (Bank Statements, Statement lines) |
| 4 | high | -$3,100.00 | feed line 8: 2026-10-15, Payroll Wages (imported) | feed line 13: 2026-10-15, PAYROLL WAGES (bank feed) | Delete this statement line (Bank Statements, Statement lines) |
| 5 | high | $582.33 | feed line 9: 2026-10-16, Stripe Payout (imported) | feed line 14: 2026-10-16, STRIPE STRIPE PAYOUT (bank feed) | Delete this statement line (Bank Statements, Statement lines) |

Each pair keeps the Bank Feed line, so later feed lines carry on from it, and marks the Imported line. Three pairs also share a reference (PO-1012, PAY-15, PO-1016), the highest score.

## Deleting them

1. In the Accounting menu, select Bank Accounts.
2. For the relevant bank account, click the menu icon, then select Bank Statements.
3. From Showing, select Statement lines.
4. Select the checkbox next to each statement line you want to delete.
5. Click Delete.
6. Select the reason for deleting the statement line, then click Delete.

Afterwards, Xero says to make sure your Statement Balance in Xero matches the Balance in Xero.

## Sources

- [Xero Central: Find and remove duplicate bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/Find-and-remove-duplicate-bank-statement-lines)
- [Xero Central: Delete or restore a bank statement line (read November 8, 2026)](https://central.xero.com/s/article/Delete-or-restore-a-bank-statement-line)
- [Xero Central: View bank statements and bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/View-bank-statements-and-bank-statement-lines-UK)
- [Xero Central: Import a bank statement in CSV format (read November 8, 2026)](https://central.xero.com/0/article/Import-a-CSV-bank-statement-US)
- [Xero Central: About manually importing bank transactions (read November 8, 2026)](https://central.xero.com/0/article/About-manually-importing-bank-statements-US)

## Questions

### Does Xero not check for duplicates on import?

Its CSV import does: "Transactions matching those already in Xero will be treated as duplicates and won't be imported." Xero still names a statement imported by hand as well as through a bank feed as a cause of duplicate lines, and says to check once a feed starts: "When the direct feed starts, check you don't have any missing or duplicate transactions."

### What does Source say on each line?

"Bank Feed means the statement was imported via a bank feed." "Imported indicates that a QIF or CSV bank statement file has been imported into Xero."

## Related

- [Xero duplicate statement lines, step by step](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/xero-duplicate-statement-lines/)
- [QuickBooks Online: an overlapping upload](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/quickbooks-online/overlapping-upload/)
- [Compared with Xero's duplicate report](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/vs/xero-duplicate-report/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/xero/overlapping-statement-import/  
Data as of: 2026-11-08
