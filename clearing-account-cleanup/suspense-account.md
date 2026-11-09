# Suspense account: find and clear the items

In this worked Xero suspense account, 8 items are open with a credit balance of $2,742.60, and one $1,100.00 reclass journal fits 2 different sets of deposits ($760.00 plus either $340.00), so it is left open with both sets shown rather than guessed.

## Run this example in the cleanup tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/?ledger=Account+Transactions%0D%0ACedar+%26+Pine+Ltd+%28made-up+sample%29%0D%0AFor+the+period+1+March+2026+to+30+September+2026%0D%0A%0D%0ADate%2CSource%2CDescription%2CReference%2CDebit%2CCredit%2CRunning+Balance%2CRelated+account%0D%0ASuspense%0D%0A3+Mar+2026%2CReceive+Money%2CUnidentified+deposit%2C%2C%2C500.00%2C-500.00%2CBusiness+Account%0D%0A17+Mar+2026%2CSpend+Money%2CUnknown+card+charge%2C%2C82.40%2C%2C-417.60%2CBusiness+Account%0D%0A2+Apr+2026%2CReceive+Money%2CUnidentified+deposit%2C%2C%2C%221%2C250.00%22%2C%22-1%2C667.60%22%2CBusiness+Account%0D%0A9+May+2026%2CManual+Journal%2CReclass+to+Sales%2CMJ-7%2C500.00%2C%2C%22-1%2C167.60%22%2CSales%0D%0A28+Jun+2026%2CReceive+Money%2CUnidentified+deposit%2C%2C%2C340.00%2C%22-1%2C507.60%22%2CBusiness+Account%0D%0A30+Jun+2026%2CSpend+Money%2CUnknown+bank+charge%2C%2C15.00%2C%2C%22-1%2C492.60%22%2CBusiness+Account%0D%0A14+Aug+2026%2CReceive+Money%2CUnidentified+deposit%2C%2C%2C760.00%2C%22-2%2C252.60%22%2CBusiness+Account%0D%0A20+Aug+2026%2CReceive+Money%2CUnidentified+deposit%2C%2C%2C340.00%2C%22-2%2C592.60%22%2CBusiness+Account%0D%0A2+Sep+2026%2CManual+Journal%2CReclass+to+Sales%2CMJ-11%2C%221%2C100.00%22%2C%2C%22-1%2C492.60%22%2CSales%0D%0A30+Sep+2026%2CReceive+Money%2CUnidentified+deposit%2C%2C%2C%221%2C250.00%22%2C%22-2%2C742.60%22%2CBusiness+Account%0D%0ATotal+Suspense%2C%2C%2C%2C%221%2C697.40%22%2C%224%2C440.00%22%2C%2C%0D%0A&fee=0)

## The worked file (Xero layout)

Xero's Account Transactions report lists each account's lines with the oldest at the top. The worked file has its Debit, Credit, Running Balance and Related account columns; Xero says the running balance needs the Debit and Credit columns, and the Related account column "Shows where each transaction in the report was categorised to – the other side of the ledger. It's sometimes called the Split column".

Open suspense items, oldest first, as of September 30, 2026 (credits are negative)

| Date | Age (days) | Name | Num | Amount | Notes |
| --- | ---: | --- | --- | ---: | --- |
| 2026-03-17 | 197 | Spend Money |  | $82.40 | clearing line with no match |
| 2026-04-02 | 181 | Receive Money |  | -$1,250.00 |  |
| 2026-06-28 | 94 | Receive Money |  | -$340.00 |  |
| 2026-06-30 | 92 | Spend Money |  | $15.00 | clearing line with no match |
| 2026-08-14 | 47 | Receive Money |  | -$760.00 |  |
| 2026-08-20 | 41 | Receive Money |  | -$340.00 |  |
| 2026-09-02 | 28 | Manual Journal | MJ-11 | $1,100.00 | clearing line with no match |
| 2026-09-30 | 0 | Receive Money |  | -$1,250.00 |  |

## What nets off, and what is left open

- MJ-7 ($500.00 to Sales) clears the $500.00 deposit of March 3, one for one.
- MJ-11 ($1,100.00 to Sales) equals $760.00 + $340.00, and there are two $340.00 deposits (June 28 and August 20). Both sets are listed; the journal stays open until someone says which deposit it was.
- The card charge and the bank charge are on the other side of the account with nothing to clear them, so they are flagged as clearing lines with no match.

Suspense by age (credits are negative)

| Age | Items | Total |
| --- | ---: | ---: |
| 0 to 30 days | 2 | -$150.00 |
| 31 to 60 days | 2 | -$1,100.00 |
| 61 to 90 days | 0 | $0.00 |
| Over 90 days | 4 | -$1,492.60 |
| All open items | 8 | -$2,742.60 |

The same method works for any account that should return to zero; a processor clearing account is on [its own page](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/clearing-account/).

## Sources

- [Xero Central: Account Transactions report (read November 8, 2026)](https://central.xero.com/s/article/Account-Transactions-report-New)

## Questions

### Is a suspense account a debit or a credit?

Either: it takes whatever side the unknown items fall on. In the worked file the unidentified deposits put it at a credit balance of $2,742.60, with two small debits (an unknown card charge and a bank charge) on the other side.

## Related

- [Clearing accounts and processor payouts](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/clearing-account/)
- [Ask My Accountant](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/ask-my-accountant/)
- [Month-end clearing review](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/guides/month-end-clearing-review/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/suspense-account/  
Data as of: 2026-11-08
