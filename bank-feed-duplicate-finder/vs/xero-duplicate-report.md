# Compared with Xero's duplicate report

Xero's Duplicate Statement Lines report compares the date and amount of statement lines in one bank account; on this worked account 1 of the 2 pairs found here is on the same date, and the other is a near-duplicate a day apart with different text; Xero says its report does not show partial matches.

## Run this example in the duplicate finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/?feed=Date%2CAmount%2CPayee%2CDescription%2CReference%2CSource%0D%0A3+Oct+2026%2C-45.99%2CSOFTWARE+CO%2CMONTHLY+PLAN%2CSUB-88%2CBank+Feed%0D%0A6+Oct+2026%2C520.10%2CSTRIPE%2CSTRIPE+PAYOUT%2CPO-1006%2CBank+Feed%0D%0A6+Oct+2026%2C520.10%2CSTRIPE%2CSTRIPE+PAYOUT%2CPO-1006%2CBank+Feed%0D%0A9+Oct+2026%2C-128.75%2COFFICE+MART%2CPOS+PURCHASE+4471%2C%2CBank+Feed%0D%0A10+Oct+2026%2C-128.75%2COffice+Mart%2CCard+purchase%2C%2CImported%0D%0A14+Oct+2026%2C-33.00%2CCAFE+NORTE%2CPOS+PURCHASE%2C%2CBank+Feed%0D%0A20+Oct+2026%2C477.25%2CSTRIPE%2CSTRIPE+PAYOUT%2CPO-1020%2CBank+Feed%0D%0A)

## Side by side

Xero's side from Xero Central, read November 8, 2026

|  | Xero Duplicate Statement Lines report | This tool |
| --- | --- | --- |
| Compares | This report compares the date and amounts of the statement lines in a particular bank account and identifies any that are potential duplicates. | Equal amounts within 0 to 31 days, scored on date, payee words and reference |
| Near-duplicates | It doesn't show any partial matches | Listed with a confidence |
| What it looks at | Statement lines | Statement lines, account transactions, or both together |
| Which copy to keep | You choose | Stated: reconciled first, then the Bank Feed line over an Imported one |
| Cost | Included in Xero | Preview free; $3.00 for the full list per account check |

The worked account

| # | Confidence | Amount | Act on | Keep | Action |
| --- | --- | ---: | --- | --- | --- |
| 1 | high | $520.10 | feed line 4: 2026-10-06, STRIPE STRIPE PAYOUT (bank feed) | feed line 3: 2026-10-06, STRIPE STRIPE PAYOUT (bank feed) | Delete this statement line (Bank Statements, Statement lines) |
| 2 | medium | -$128.75 | feed line 6: 2026-10-10, Office Mart Card purchase (imported) | feed line 5: 2026-10-09, OFFICE MART POS PURCHASE 4471 (bank feed) | Delete this statement line (Bank Statements, Statement lines) |

## When Xero's report is better

- A few duplicates in one account: run Xero's report first; it is free and inside Xero.
- You want to see what Xero already removed: the Statement Exceptions report shows lines treated as duplicates.

## When this tool adds something

- Near-duplicates with different dates or text.
- Account transactions entered twice (spend money, receive money), which a statement-line report does not cover.
- A list of the copies to delete, in date order, as a CSV.

## Sources

- [Xero Central: Find and remove duplicate bank statement lines (read November 8, 2026)](https://central.xero.com/s/article/Find-and-remove-duplicate-bank-statement-lines)
- [Xero Product Ideas: Automatically recognise and remove duplicate statement lines (Xero reply, June 16, 2025) (read November 8, 2026)](https://productideas.xero.com/forums/967136-banking-chart-of-accounts/suggestions/45978244-bank-reconciliation-automatically-recognise-and-r)

## Related

- [Xero duplicate statement lines, step by step](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/guides/xero-duplicate-statement-lines/)
- [Xero: an overlapping statement import](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/xero/overlapping-statement-import/)
- [Practice review tools compared](https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/vs/practice-review-tools/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-feed-duplicate-finder/vs/xero-duplicate-report/  
Data as of: 2026-11-08
