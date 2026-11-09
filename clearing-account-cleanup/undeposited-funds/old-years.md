# Clean up old Undeposited Funds from previous years

Of the 14 open payments in the worked export, 2 date from 2025 ($1,285.00) and have no bank deposit in the file to match, 4 are matched exactly to a deposit, and the other 8 are all under 72 days old. Only the unmatched old items are a question for the accountant; an Intuit Community Manager advises that you "have your accountant review any journal entry approach before proceeding".

## Run this example in the cleanup tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/?ledger=Harbor+Lane+Studio+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22January+1%2C+2025+-+October+31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0AUndeposited+Funds%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C03%2F14%2F2025%2CPayment%2C1041%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C200.00%22%2C%221%2C200.00%22%0D%0A%2C06%2F02%2F2025%2CSales+Receipt%2C1077%2CWalk-in+sale%2C%2CSales%2C85.00%2C%221%2C285.00%22%0D%0A%2C07%2F06%2F2026%2CPayment%2C2210%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C640.00%2C%221%2C925.00%22%0D%0A%2C07%2F08%2F2026%2CPayment%2C2214%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C150.00%22%2C%223%2C075.00%22%0D%0A%2C07%2F10%2F2026%2CDeposit%2C%2C%2C%2CBusiness+Checking%2C%22-1%2C790.00%22%2C%221%2C285.00%22%0D%0A%2C08%2F03%2F2026%2CPayment%2C2251%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C300.00%2C%221%2C585.00%22%0D%0A%2C08%2F04%2F2026%2CDeposit%2C%2CBirch+Cafe%2C%2CBusiness+Checking%2C-300.00%2C%221%2C285.00%22%0D%0A%2C08%2F20%2F2026%2CPayment%2C2268%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C450.00%2C%221%2C735.00%22%0D%0A%2C09%2F05%2F2026%2CPayment%2C2280%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C275.50%2C%222%2C010.50%22%0D%0A%2C09%2F09%2F2026%2CPayment%2C2283%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C412.25%2C%222%2C422.75%22%0D%0A%2C09%2F12%2F2026%2CPayment%2C2290%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C687.75%2C%223%2C110.50%22%0D%0A%2C09%2F18%2F2026%2CPayment%2C2297%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C412.25%2C%223%2C522.75%22%0D%0A%2C10%2F02%2F2026%2CPayment%2C2305%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C960.00%2C%224%2C482.75%22%0D%0A%2C10%2F06%2F2026%2CPayment%2C2311%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C540.00%2C%225%2C022.75%22%0D%0A%2C10%2F09%2F2026%2CPayment%2C2316%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C230.00%2C%225%2C252.75%22%0D%0A%2C10%2F14%2F2026%2CPayment%2C2320%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C320.00%2C%225%2C572.75%22%0D%0A%2C10%2F14%2F2026%2CPayment%2C2320%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C320.00%2C%225%2C892.75%22%0D%0A%2C10%2F27%2F2026%2CPayment%2C2334%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C050.00%22%2C%226%2C942.75%22%0D%0A%2C10%2F30%2F2026%2CSales+Receipt%2C2339%2CWalk-in+sale%2C%2CSales%2C129.99%2C%227%2C072.74%22%0D%0ATotal+for+Undeposited+Funds%2C%2C%2C%2C%2C%2C%2C%22%247%2C072.74%22%2C%0D%0A&bank=Date%2CDescription%2CAmount%0D%0A09%2F14%2F2026%2CDEPOSIT%2C963.25%0D%0A09%2F15%2F2026%2CACH+VENDOR+PAYMENT%2C-220.00%0D%0A09%2F22%2F2026%2CDEPOSIT%2C412.25%0D%0A10%2F16%2F2026%2CDEPOSIT%2C%221%2C500.00%22%0D%0A10%2F29%2F2026%2CDEPOSIT%2C%221%2C019.25%22%0D%0A&fee=3)

## What is old, and what is only unmatched

Open payments, oldest first, as of October 30, 2026

| Date | Age (days) | Name | Num | Amount | Notes |
| --- | ---: | --- | --- | ---: | --- |
| 2025-03-14 | 595 | Birch Cafe | 1041 | $1,200.00 | over a year old |
| 2025-06-02 | 515 | Walk-in sale | 1077 | $85.00 | over a year old |
| 2026-08-20 | 71 | Pine Street Gym | 2268 | $450.00 |  |
| 2026-09-05 | 55 | Oak & Co | 2280 | $275.50 | matched to a bank deposit |
| 2026-09-09 | 51 | Lumen Dental | 2283 | $412.25 |  |
| 2026-09-12 | 48 | Rivera Plumbing | 2290 | $687.75 | matched to a bank deposit |
| 2026-09-18 | 42 | Pine Street Gym | 2297 | $412.25 |  |
| 2026-10-02 | 28 | Birch Cafe | 2305 | $960.00 | matched to a bank deposit |
| 2026-10-06 | 24 | Lumen Dental | 2311 | $540.00 | matched to a bank deposit |
| 2026-10-09 | 21 | Oak & Co | 2316 | $230.00 |  |
| 2026-10-14 | 16 | Rivera Plumbing | 2320 | $320.00 | possible duplicate |
| 2026-10-14 | 16 | Rivera Plumbing | 2320 | $320.00 | possible duplicate |
| 2026-10-27 | 3 | Pine Street Gym | 2334 | $1,050.00 |  |
| 2026-10-30 | 0 | Walk-in sale | 2339 | $129.99 |  |

The two 2025 payments are the cleanup question. Everything matched to a deposit is not old in the sense that matters: it only needs its Bank Deposit recorded. Intuit staff's method for old QuickBooks Payments is the same: use payment IDs, dates and amounts to pick the payments, and "Set the date to match the actual deposit date shown on the bank statement."

## The risk with a journal entry

A Community Manager warns that "if a bank feed deposit is then also matched separately, you could end up with a double deposit on the bank account side", and a QuickBooks Team reply that "adding a journal entry creates a duplicate deposit, inflating the bank balance unnecessarily". Match first; journal only what is left, and only after the accountant agrees, especially for a year already filed.

## Sources

- [QuickBooks Community: How do I clear old QuickBooks Payments from Undeposited Funds when merchant statements are no longer available? (read November 8, 2026)](https://quickbooks.intuit.com/community/payments-3/how-do-i-clear-old-quickbooks-payments-from-undeposited-funds-when-merchant-statements-are-no-longer-available-19748)
- [QuickBooks Community: How do I clean up undeposited funds from the past? (read November 8, 2026)](https://quickbooks.intuit.com/community/banking-4/how-do-i-clean-up-undeposited-funds-from-the-past-20731)

## Steps

1. **Export everything.** Export the account from its first transaction, not just this year, so the deposits that already cleared old payments are in the file.
2. **Net and age.** Load it into the tool: lines that cancel are taken out and what is left is aged, oldest first.
3. **Get the bank statements.** Intuit holds QuickBooks Payments merchant statements for two years; your client's bank typically keeps its own statements for five to seven years.
4. **Match by bank deposit.** Load the bank statement CSV: each deposit gets every set of open payments that adds up to it. Record one deposit per set, dated like the statement.
5. **Take the rest to the accountant.** The payments with no match are listed with their dates and amounts in the open-items CSV. Any journal entry for them is the accountant's call.

## Questions

### How long does Intuit keep QuickBooks Payments merchant statements?

An Intuit Community Manager (August 19, 2026): "Intuit holds QuickBooks Payments merchant statements for two years." and your client's bank typically keeps its own statements for five to seven years.

### Can I clear the old balance with one journal entry?

Intuit staff list it as a fallback but warn about doubles: "adding a journal entry creates a duplicate deposit, inflating the bank balance unnecessarily" (QuickBooks Team, July 14, 2025). The Community Manager's advice is to have your accountant review any journal entry approach before proceeding.

## Related

- [Which payments make up this deposit?](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/match-deposit/)
- [Pre-tax-season clearing checklist](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/guides/pre-tax-season-clearing-checklist/)
- [Why the balance grows](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/guides/undeposited-funds-balance-explained/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/old-years/  
Data as of: 2026-11-08
