# Xero reconciliation reports vs this tool

Xero's Bank Reconciliation Summary gives the Calculated balance out by amount; on the worked Xero month this tool gives the same $418.10 gap split into $236.50 of timing and 2 line-level errors (a refund entered as a spend and a payout entered twice) with the date it began, October 8, 2026.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CAmount%2CPayee%2CDescription%2CReference%0D%0A1+Oct+2026%2C-1800.00%2CKauri+Lane+Lettings%2CRent+October%2CRENT-10%0D%0A5+Oct+2026%2C645.12%2CStripe%2CPayout%2CPO-1005%0D%0A8+Oct+2026%2C450.00%2CPrintworks%2CRefund+on+order+2207%2CRF-2207%0D%0A12+Oct+2026%2C718.40%2CStripe%2CPayout%2CPO-1012%0D%0A15+Oct+2026%2C-3100.00%2CPayroll%2CWages%2CPAY-15%0D%0A19+Oct+2026%2C582.33%2CStripe%2CPayout%2CPO-1019%0D%0A21+Oct+2026%2C-114.90%2CTelco%2CDirect+debit%2C%0D%0A26+Oct+2026%2C691.27%2CStripe%2CPayout%2CPO-1026%0D%0A&ledger=Account+Transactions%0D%0ATidewater+Studio+%28made-up+sample%29%0D%0AFor+the+period+1+October+2026+to+31+October+2026%0D%0A%0D%0ADate%2CSource%2CDescription%2CReference%2CDebit%2CCredit%2CRunning+Balance%2CRelated+account%0D%0ABusiness+Account%0D%0AOpening+Balance%2C%2C%2C%2C%2C%2C%226%2C423.50%22%2C%0D%0A1+Oct+2026%2CSpend+Money%2CKauri+Lane+Lettings%2CRENT-10%2C%2C%221%2C800.00%22%2C%224%2C623.50%22%2CRent%0D%0A5+Oct+2026%2CReceive+Money%2CStripe%2CPO-1005%2C645.12%2C%2C%225%2C268.62%22%2CSales%0D%0A8+Oct+2026%2CSpend+Money%2CPrintworks%2CRF-2207%2C%2C450.00%2C%224%2C818.62%22%2CPrinting+%26+Stationery%0D%0A12+Oct+2026%2CReceive+Money%2CStripe%2CPO-1012%2C718.40%2C%2C%225%2C537.02%22%2CSales%0D%0A12+Oct+2026%2CReceive+Money%2CStripe%2CPO-1012%2C718.40%2C%2C%226%2C255.42%22%2CSales%0D%0A15+Oct+2026%2CSpend+Money%2CPayroll%2CPAY-15%2C%2C%223%2C100.00%22%2C%223%2C155.42%22%2CWages%0D%0A19+Oct+2026%2CReceive+Money%2CStripe%2CPO-1019%2C582.33%2C%2C%223%2C737.75%22%2CSales%0D%0A21+Oct+2026%2CSpend+Money%2CTelco%2C%2C%2C114.90%2C%223%2C622.85%22%2CTelephone+%26+Internet%0D%0A26+Oct+2026%2CReceive+Money%2CStripe%2CPO-1026%2C691.27%2C%2C%224%2C314.12%22%2CSales%0D%0A30+Oct+2026%2CSpend+Money%2CInkwell+Supplies%2CINV-88%2C%2C236.50%2C%224%2C077.62%22%2CPrinting+%26+Stationery%0D%0AClosing+Balance%2C%2C%2C%2C%2C%2C%224%2C077.62%22%2C%0D%0A&sopen=6%2C423.50&end=2026-10-31)

Read on Xero Central on November 8, 2026

|  | Xero reports | This tool |
| --- | --- | --- |
| Shows the gap | The difference between the Bank statement ending balance you entered at the top of the report and the Statement balance (calculated). | The difference at the statement date, and the part that is not timing |
| Shows the lines | The report lists unreconciled and reconciled statement lines and transactions in Xero within the report date range. | Each line on one side only, classified |
| Exceptions | Statement lines created by a user marking a transaction as reconciled; Deleted statement lines; All statement lines that Xero has identified as potential duplicates | Entries made twice, swaps, sign flips, slides, wrong amounts |
| Break date | No | Yes |
| Price | Included in Xero | $3.00 per reconciliation; preview free |

## When Xero's reports are better

- Feeds are live and every line was matched in Xero: the Summary shows the three balances agree and nothing more is needed.
- You need deleted or user-created statement lines: only Xero sees them.

## When this tool is

- The out-by amount is not zero and you need the line.
- Your Xero user role cannot run the reports, or you are checking a client file offline.

A Xero ideas-forum request to show the difference to the real bank balance had 3 votes and the status Submitted (August 8, 2024) when read.

## Sources

- [Xero Central: Bank Reconciliation reports (read November 8, 2026)](https://central.xero.com/0/article/Bank-Reconciliation-Summary)
- [Xero Central: Bank Reconciliation Detail report (read November 8, 2026)](https://central.xero.com/0/article/Bank-Reconciliation-Detail-report)
- [Xero Product Ideas: Bank Reconciliation - Show difference between Statement Balance and the balance at the actual bank (read November 8, 2026)](https://productideas.xero.com/forums/967136-banking-chart-of-accounts/suggestions/48710924-bank-reconciliation-show-difference-between-stat)

## Related

- [Xero](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/xero/)
- [Xero statement vs ledger](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/xero-statement-vs-ledger/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/vs/xero-bank-reconciliation-report/  
Data as of: 2026-11-08
