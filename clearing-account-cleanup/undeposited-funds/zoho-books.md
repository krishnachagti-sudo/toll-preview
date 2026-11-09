# Clear Undeposited Funds in Zoho Books

Zoho Books gives 3 ways to move payments out of Undeposited Funds, and the third (one Deposit From Other Accounts per bank line) is the one that needs the exact set: in the worked export, 2 of 4 bank deposits are made of exactly one set of open payments.

## Run this example in the cleanup tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/?ledger=Harbor+Lane+Studio+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22January+1%2C+2025+-+October+31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0AUndeposited+Funds%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C03%2F14%2F2025%2CPayment%2C1041%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C200.00%22%2C%221%2C200.00%22%0D%0A%2C06%2F02%2F2025%2CSales+Receipt%2C1077%2CWalk-in+sale%2C%2CSales%2C85.00%2C%221%2C285.00%22%0D%0A%2C07%2F06%2F2026%2CPayment%2C2210%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C640.00%2C%221%2C925.00%22%0D%0A%2C07%2F08%2F2026%2CPayment%2C2214%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C150.00%22%2C%223%2C075.00%22%0D%0A%2C07%2F10%2F2026%2CDeposit%2C%2C%2C%2CBusiness+Checking%2C%22-1%2C790.00%22%2C%221%2C285.00%22%0D%0A%2C08%2F03%2F2026%2CPayment%2C2251%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C300.00%2C%221%2C585.00%22%0D%0A%2C08%2F04%2F2026%2CDeposit%2C%2CBirch+Cafe%2C%2CBusiness+Checking%2C-300.00%2C%221%2C285.00%22%0D%0A%2C08%2F20%2F2026%2CPayment%2C2268%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C450.00%2C%221%2C735.00%22%0D%0A%2C09%2F05%2F2026%2CPayment%2C2280%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C275.50%2C%222%2C010.50%22%0D%0A%2C09%2F09%2F2026%2CPayment%2C2283%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C412.25%2C%222%2C422.75%22%0D%0A%2C09%2F12%2F2026%2CPayment%2C2290%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C687.75%2C%223%2C110.50%22%0D%0A%2C09%2F18%2F2026%2CPayment%2C2297%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C412.25%2C%223%2C522.75%22%0D%0A%2C10%2F02%2F2026%2CPayment%2C2305%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C960.00%2C%224%2C482.75%22%0D%0A%2C10%2F06%2F2026%2CPayment%2C2311%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C540.00%2C%225%2C022.75%22%0D%0A%2C10%2F09%2F2026%2CPayment%2C2316%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C230.00%2C%225%2C252.75%22%0D%0A%2C10%2F14%2F2026%2CPayment%2C2320%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C320.00%2C%225%2C572.75%22%0D%0A%2C10%2F14%2F2026%2CPayment%2C2320%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C320.00%2C%225%2C892.75%22%0D%0A%2C10%2F27%2F2026%2CPayment%2C2334%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C050.00%22%2C%226%2C942.75%22%0D%0A%2C10%2F30%2F2026%2CSales+Receipt%2C2339%2CWalk-in+sale%2C%2CSales%2C129.99%2C%227%2C072.74%22%0D%0ATotal+for+Undeposited+Funds%2C%2C%2C%2C%2C%2C%2C%22%247%2C072.74%22%2C%0D%0A&bank=Date%2CDescription%2CAmount%0D%0A09%2F14%2F2026%2CDEPOSIT%2C963.25%0D%0A09%2F15%2F2026%2CACH+VENDOR+PAYMENT%2C-220.00%0D%0A09%2F22%2F2026%2CDEPOSIT%2C412.25%0D%0A10%2F16%2F2026%2CDEPOSIT%2C%221%2C500.00%22%0D%0A10%2F29%2F2026%2CDEPOSIT%2C%221%2C019.25%22%0D%0A&fee=3)

## Zoho Books' three ways

1. Edit each payment under Payments Received and change Deposit To to the bank account.
2. Select several payments under Payments Received and use Bulk Update to set Deposit To.
3. In Banking, open the bank account and add a Deposit From Other Accounts entry with From Account set to Undeposited Funds.

The first two change where each payment was deposited, one payment at a time or in bulk. The third records one transfer from Undeposited Funds to the bank, which should equal the bank line, so it is where the exact set matters.

## Find the set for each bank line

Export the Undeposited Funds account's transactions to CSV with a date and an amount column, and the bank statement as CSV. The tool lists every set of open payments that adds up to each deposit.

The worked export against its bank statement

| Bank deposit | Result | The sets |
| --- | --- | --- |
| 2026-09-14: $963.25 | one set fits | Oak & Co #2280 $275.50 (2026-09-05) + Rivera Plumbing #2290 $687.75 (2026-09-12) |
| 2026-09-22: $412.25 | several sets fit (2) | Set 1: Pine Street Gym #2297 $412.25 (2026-09-18); Set 2: Lumen Dental #2283 $412.25 (2026-09-09) |
| 2026-10-16: $1,500.00 | one set fits | Birch Cafe #2305 $960.00 (2026-10-02) + Lumen Dental #2311 $540.00 (2026-10-06) |
| 2026-10-29: $1,019.25 | fits only after a fee | Pine Street Gym #2334 $1,050.00 (2026-10-27) = $1,050.00, fee $30.75 (2.93%) |

## Sources

- [Zoho Books: How do I transfer payments from undeposited funds to my bank account? (read November 8, 2026)](https://www.zoho.com/us/books/kb/banking/transfer-funds.html)

## Related

- [QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/quickbooks-online/)
- [QuickBooks Desktop](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/quickbooks-desktop/)
- [Which payments make up this deposit?](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/match-deposit/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/zoho-books/  
Data as of: 2026-11-08
