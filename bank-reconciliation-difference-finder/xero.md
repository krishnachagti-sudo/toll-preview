# Xero bank reconciliation not balancing: find the difference

Xero's reconciliation reports give an out-by amount; in this worked October file the statement lines and the Account Transactions export differ by $418.10: $236.50 is a payment not yet at the bank, and the other $181.60 is a $450.00 refund entered as a spend ($900.00, twice the amount) less a $718.40 payout entered twice, first on October 8, 2026.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CAmount%2CPayee%2CDescription%2CReference%0D%0A1+Oct+2026%2C-1800.00%2CKauri+Lane+Lettings%2CRent+October%2CRENT-10%0D%0A5+Oct+2026%2C645.12%2CStripe%2CPayout%2CPO-1005%0D%0A8+Oct+2026%2C450.00%2CPrintworks%2CRefund+on+order+2207%2CRF-2207%0D%0A12+Oct+2026%2C718.40%2CStripe%2CPayout%2CPO-1012%0D%0A15+Oct+2026%2C-3100.00%2CPayroll%2CWages%2CPAY-15%0D%0A19+Oct+2026%2C582.33%2CStripe%2CPayout%2CPO-1019%0D%0A21+Oct+2026%2C-114.90%2CTelco%2CDirect+debit%2C%0D%0A26+Oct+2026%2C691.27%2CStripe%2CPayout%2CPO-1026%0D%0A&ledger=Account+Transactions%0D%0ATidewater+Studio+%28made-up+sample%29%0D%0AFor+the+period+1+October+2026+to+31+October+2026%0D%0A%0D%0ADate%2CSource%2CDescription%2CReference%2CDebit%2CCredit%2CRunning+Balance%2CRelated+account%0D%0ABusiness+Account%0D%0AOpening+Balance%2C%2C%2C%2C%2C%2C%226%2C423.50%22%2C%0D%0A1+Oct+2026%2CSpend+Money%2CKauri+Lane+Lettings%2CRENT-10%2C%2C%221%2C800.00%22%2C%224%2C623.50%22%2CRent%0D%0A5+Oct+2026%2CReceive+Money%2CStripe%2CPO-1005%2C645.12%2C%2C%225%2C268.62%22%2CSales%0D%0A8+Oct+2026%2CSpend+Money%2CPrintworks%2CRF-2207%2C%2C450.00%2C%224%2C818.62%22%2CPrinting+%26+Stationery%0D%0A12+Oct+2026%2CReceive+Money%2CStripe%2CPO-1012%2C718.40%2C%2C%225%2C537.02%22%2CSales%0D%0A12+Oct+2026%2CReceive+Money%2CStripe%2CPO-1012%2C718.40%2C%2C%226%2C255.42%22%2CSales%0D%0A15+Oct+2026%2CSpend+Money%2CPayroll%2CPAY-15%2C%2C%223%2C100.00%22%2C%223%2C155.42%22%2CWages%0D%0A19+Oct+2026%2CReceive+Money%2CStripe%2CPO-1019%2C582.33%2C%2C%223%2C737.75%22%2CSales%0D%0A21+Oct+2026%2CSpend+Money%2CTelco%2C%2C%2C114.90%2C%223%2C622.85%22%2CTelephone+%26+Internet%0D%0A26+Oct+2026%2CReceive+Money%2CStripe%2CPO-1026%2C691.27%2C%2C%224%2C314.12%22%2CSales%0D%0A30+Oct+2026%2CSpend+Money%2CInkwell+Supplies%2CINV-88%2C%2C236.50%2C%224%2C077.62%22%2CPrinting+%26+Stationery%0D%0AClosing+Balance%2C%2C%2C%2C%2C%2C%224%2C077.62%22%2C%0D%0A&sopen=6%2C423.50&end=2026-10-31)

## The two files

- The ledger: the Account Transactions report for the bank account with Debit and Credit (Xero: "The report must include the Debit and Credit columns for the running balance to work."). You can also export the report to either a PDF or spreadsheet format. Save the spreadsheet as CSV.
- The statement: your bank's CSV for the dates, or Xero's own list of lines. Xero: "Uncoded bank statement lines are lines from your bank statements imported into Xero that you haven't reconciled yet." Steps: In the Accounting menu, select Bank accounts. Click the menu icon, then select Uncoded statement lines. Choose the bank account and the From and To dates. Click Run, then Export and choose PDF or CSV. Xero says this needs the administrator user role. That list holds unreconciled lines only, so for a whole month use the bank's download.
- Enter the statement's opening balance under Balances when the file has no Balance column, as Xero's CSV fields do not.

## The worked file

At October 31, 2026 the statement shows $4,495.72 and the books $4,077.62: a difference of $418.10. 7 lines match and 4 lines are on one side only. Timing explains $236.50 (1 outstanding payment); the other $181.60 (the bank is higher) comes from 1 sign flip and 1 entry made twice in the books. The running balances first disagree on October 8, 2026.

Likely errors

| Date | Kind | Bank | Books | Effect |
| --- | --- | --- | --- | ---: |
| 2026-10-08 | sign flip (entered the wrong way round) | bank 2026-10-08 $450.00 Printworks Refund on order 2207 | books 2026-10-08 -$450.00 Printworks | $900.00 |
| 2026-10-12 | entered twice in the books |  | books 2026-10-12 $718.40 Stripe | -$718.40 |

The difference that is not timing, date by date

| Date | Change | Difference after | Why |
| --- | ---: | ---: | --- |
| Opening |  | $0.00 | The gap between the two opening balances |
| 2026-10-08 | $900.00 | $900.00 | sign flip (entered the wrong way round): The $450.00 in the books (October 8, 2026) is a payment there and a deposit at the bank: entered the wrong way round, it moves the balance by $900.00, twice the amount |
| 2026-10-12 | -$718.40 | $181.60 | entered twice in the books: $718.40 on October 12, 2026 repeats books line 11 (October 12, 2026), which the bank shows once |

The reconciliation statement

| Line | Amount |
| --- | ---: |
| Balance per bank statement | $4,495.72 |
| Add: deposits in transit | $0.00 |
| Less: outstanding checks and payments | $236.50 |
| **Adjusted bank balance** | **$4,259.22** |
| Balance per books | $4,077.62 |
| Bank lines not in the books | $0.00 |
| Corrections the hints point to | $181.60 |
| **Adjusted books balance** | **$4,259.22** |

## What Xero's reports add

- Balance in Xero: "The sum of all bank transactions entered for the bank account dated on the report date or earlier."
- Statement balance (calculated): "The balance isn't taken from your online bank balance, it's calculated using the bank statement lines in Xero."
- Statement Exceptions: Statement lines created by a user marking a transaction as reconciled; Deleted statement lines; All statement lines that Xero has identified as potential duplicates.
- Dates matter: "A reconciled bank statement line or account transaction matched to a future dated item will appear in the report as unreconciled."

## Sources

- [Xero Central: Bank Reconciliation reports (read November 8, 2026)](https://central.xero.com/0/article/Bank-Reconciliation-Summary)
- [Xero Central: Bank Reconciliation Detail report (read November 8, 2026)](https://central.xero.com/0/article/Bank-Reconciliation-Detail-report)
- [Xero Central: Account Transactions report (read November 8, 2026)](https://central.xero.com/s/article/Account-Transactions-report-New)
- [Xero Central: Export a list of uncoded bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/Export-a-list-of-uncoded-bank-statement-lines)

## Questions

### Which Xero report shows the difference?

The Bank Reconciliation report pack (Bank Reconciliation Summary, Bank Statement, Statement Exceptions). Its Calculated balance out by is the difference between the Bank statement ending balance you entered at the top of the report and the Statement balance (calculated).

### Does Xero say which line is wrong?

The Detail report lists lines to compare by eye: "The report lists unreconciled and reconciled statement lines and transactions in Xero within the report date range." The Statement Exceptions report adds deleted lines, user-created lines and potential duplicates.

## Related

- [Xero statement balance vs the balance in Xero](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/xero-statement-vs-ledger/)
- [Compared with Xero's reconciliation reports](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/vs/xero-bank-reconciliation-report/)
- [The same check in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/quickbooks-online/)
- [Difference is twice an amount](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/difference-is-double-a-transaction/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/xero/  
Data as of: 2026-11-08
