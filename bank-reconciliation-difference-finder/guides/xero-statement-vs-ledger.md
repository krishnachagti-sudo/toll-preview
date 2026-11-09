# Xero statement balance vs the balance in Xero

In Xero the statement balance comes from the statement lines and the Balance in Xero from your transactions, so they differ by the unreconciled items; in this worked file they are $4,495.72 and $4,077.62, $418.10 apart: $236.50 is a payment not yet at the bank and $181.60 is a refund entered as a spend and a payout entered twice.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CAmount%2CPayee%2CDescription%2CReference%0D%0A1+Oct+2026%2C-1800.00%2CKauri+Lane+Lettings%2CRent+October%2CRENT-10%0D%0A5+Oct+2026%2C645.12%2CStripe%2CPayout%2CPO-1005%0D%0A8+Oct+2026%2C450.00%2CPrintworks%2CRefund+on+order+2207%2CRF-2207%0D%0A12+Oct+2026%2C718.40%2CStripe%2CPayout%2CPO-1012%0D%0A15+Oct+2026%2C-3100.00%2CPayroll%2CWages%2CPAY-15%0D%0A19+Oct+2026%2C582.33%2CStripe%2CPayout%2CPO-1019%0D%0A21+Oct+2026%2C-114.90%2CTelco%2CDirect+debit%2C%0D%0A26+Oct+2026%2C691.27%2CStripe%2CPayout%2CPO-1026%0D%0A&ledger=Account+Transactions%0D%0ATidewater+Studio+%28made-up+sample%29%0D%0AFor+the+period+1+October+2026+to+31+October+2026%0D%0A%0D%0ADate%2CSource%2CDescription%2CReference%2CDebit%2CCredit%2CRunning+Balance%2CRelated+account%0D%0ABusiness+Account%0D%0AOpening+Balance%2C%2C%2C%2C%2C%2C%226%2C423.50%22%2C%0D%0A1+Oct+2026%2CSpend+Money%2CKauri+Lane+Lettings%2CRENT-10%2C%2C%221%2C800.00%22%2C%224%2C623.50%22%2CRent%0D%0A5+Oct+2026%2CReceive+Money%2CStripe%2CPO-1005%2C645.12%2C%2C%225%2C268.62%22%2CSales%0D%0A8+Oct+2026%2CSpend+Money%2CPrintworks%2CRF-2207%2C%2C450.00%2C%224%2C818.62%22%2CPrinting+%26+Stationery%0D%0A12+Oct+2026%2CReceive+Money%2CStripe%2CPO-1012%2C718.40%2C%2C%225%2C537.02%22%2CSales%0D%0A12+Oct+2026%2CReceive+Money%2CStripe%2CPO-1012%2C718.40%2C%2C%226%2C255.42%22%2CSales%0D%0A15+Oct+2026%2CSpend+Money%2CPayroll%2CPAY-15%2C%2C%223%2C100.00%22%2C%223%2C155.42%22%2CWages%0D%0A19+Oct+2026%2CReceive+Money%2CStripe%2CPO-1019%2C582.33%2C%2C%223%2C737.75%22%2CSales%0D%0A21+Oct+2026%2CSpend+Money%2CTelco%2C%2C%2C114.90%2C%223%2C622.85%22%2CTelephone+%26+Internet%0D%0A26+Oct+2026%2CReceive+Money%2CStripe%2CPO-1026%2C691.27%2C%2C%224%2C314.12%22%2CSales%0D%0A30+Oct+2026%2CSpend+Money%2CInkwell+Supplies%2CINV-88%2C%2C236.50%2C%224%2C077.62%22%2CPrinting+%26+Stationery%0D%0AClosing+Balance%2C%2C%2C%2C%2C%2C%224%2C077.62%22%2C%0D%0A&sopen=6%2C423.50&end=2026-10-31)

Xero's totals, in Xero's words

| Total | What it is |
| --- | --- |
| Balance in Xero | The sum of all bank transactions entered for the bank account dated on the report date or earlier. |
| Total Outstanding Payments/Receipts | Transactions entered into Xero but not reconciled as at the report date. |
| Total Unreconciled Statement Lines | Statement lines imported for the bank account but not reconciled as at the report date. |
| Statement balance (calculated) | The balance isn't taken from your online bank balance, it's calculated using the bank statement lines in Xero. |

## The worked file

Errors between the two

| Date | Kind | Bank | Books | Effect |
| --- | --- | --- | --- | ---: |
| 2026-10-08 | sign flip (entered the wrong way round) | bank 2026-10-08 $450.00 Printworks Refund on order 2207 | books 2026-10-08 -$450.00 Printworks | $900.00 |
| 2026-10-12 | entered twice in the books |  | books 2026-10-12 $718.40 Stripe | -$718.40 |

Timing items

| Date | What | Line | Amount | Age (days) |
| --- | --- | --- | ---: | ---: |
| 2026-10-30 | outstanding payment | Inkwell Supplies | -$236.50 | 1 |

## Feed gaps and duplicate imports

A statement line deleted in Xero, a line created by marking a transaction reconciled, or a line Xero thinks is a duplicate shows on the Statement Exceptions report. Duplicate statement lines are covered by the [bank-feed duplicate finder](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/).

## Sources

- [Xero Central: Bank Reconciliation reports (read November 8, 2026)](https://central.xero.com/0/article/Bank-Reconciliation-Summary)
- [Xero Central: View bank statements and bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/View-bank-statements-and-bank-statement-lines-UK)
- [Xero Central: Account Transactions report (read November 8, 2026)](https://central.xero.com/s/article/Account-Transactions-report-New)

## Related

- [Xero reconciliation not balancing](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/xero/)
- [Compared with Xero's reconciliation reports](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/vs/xero-bank-reconciliation-report/)
- [Duplicates in Xero statement lines](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/xero-statement-vs-ledger/  
Data as of: 2026-11-08
