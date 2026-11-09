# QuickBooks built-in tools vs this tool

QuickBooks Online's Bank Deposit window lists all 14 open payments of the worked export and leaves you to tick the ones that add up to each deposit; this tool finds that 2 of the 4 deposits have exactly one set, 1 has 2, and 1 fits only after a fee.

## Run this example in the cleanup tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/?ledger=Harbor+Lane+Studio+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22January+1%2C+2025+-+October+31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0AUndeposited+Funds%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C03%2F14%2F2025%2CPayment%2C1041%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C200.00%22%2C%221%2C200.00%22%0D%0A%2C06%2F02%2F2025%2CSales+Receipt%2C1077%2CWalk-in+sale%2C%2CSales%2C85.00%2C%221%2C285.00%22%0D%0A%2C07%2F06%2F2026%2CPayment%2C2210%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C640.00%2C%221%2C925.00%22%0D%0A%2C07%2F08%2F2026%2CPayment%2C2214%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C150.00%22%2C%223%2C075.00%22%0D%0A%2C07%2F10%2F2026%2CDeposit%2C%2C%2C%2CBusiness+Checking%2C%22-1%2C790.00%22%2C%221%2C285.00%22%0D%0A%2C08%2F03%2F2026%2CPayment%2C2251%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C300.00%2C%221%2C585.00%22%0D%0A%2C08%2F04%2F2026%2CDeposit%2C%2CBirch+Cafe%2C%2CBusiness+Checking%2C-300.00%2C%221%2C285.00%22%0D%0A%2C08%2F20%2F2026%2CPayment%2C2268%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C450.00%2C%221%2C735.00%22%0D%0A%2C09%2F05%2F2026%2CPayment%2C2280%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C275.50%2C%222%2C010.50%22%0D%0A%2C09%2F09%2F2026%2CPayment%2C2283%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C412.25%2C%222%2C422.75%22%0D%0A%2C09%2F12%2F2026%2CPayment%2C2290%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C687.75%2C%223%2C110.50%22%0D%0A%2C09%2F18%2F2026%2CPayment%2C2297%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C412.25%2C%223%2C522.75%22%0D%0A%2C10%2F02%2F2026%2CPayment%2C2305%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C960.00%2C%224%2C482.75%22%0D%0A%2C10%2F06%2F2026%2CPayment%2C2311%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C540.00%2C%225%2C022.75%22%0D%0A%2C10%2F09%2F2026%2CPayment%2C2316%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C230.00%2C%225%2C252.75%22%0D%0A%2C10%2F14%2F2026%2CPayment%2C2320%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C320.00%2C%225%2C572.75%22%0D%0A%2C10%2F14%2F2026%2CPayment%2C2320%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C320.00%2C%225%2C892.75%22%0D%0A%2C10%2F27%2F2026%2CPayment%2C2334%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C050.00%22%2C%226%2C942.75%22%0D%0A%2C10%2F30%2F2026%2CSales+Receipt%2C2339%2CWalk-in+sale%2C%2CSales%2C129.99%2C%227%2C072.74%22%0D%0ATotal+for+Undeposited+Funds%2C%2C%2C%2C%2C%2C%2C%22%247%2C072.74%22%2C%0D%0A&bank=Date%2CDescription%2CAmount%0D%0A09%2F14%2F2026%2CDEPOSIT%2C963.25%0D%0A09%2F15%2F2026%2CACH+VENDOR+PAYMENT%2C-220.00%0D%0A09%2F22%2F2026%2CDEPOSIT%2C412.25%0D%0A10%2F16%2F2026%2CDEPOSIT%2C%221%2C500.00%22%0D%0A10%2F29%2F2026%2CDEPOSIT%2C%221%2C019.25%22%0D%0A&fee=3)

## Side by side

Read on Intuit's help pages, November 8, 2026

|  | QuickBooks Online | This tool |
| --- | --- | --- |
| Lists the open payments | Yes: "All payments in the Undeposited Funds account automatically appear in the Bank Deposit window." | Yes, after netting what the account already cleared |
| Finds which payments make up a deposit | No: you tick them and "Confirm the total of the selected transactions matches your actual deposit slip." | Yes: every set, to the cent, in a date window |
| Ages the items | No aging view is described in the help pages read | 0 to 30, 31 to 60, 61 to 90, over 90 days |
| Changes the books | Yes: records the deposit | No: lists only; you record the deposit in QuickBooks |
| Price | Part of QuickBooks Online | Preview free; $3.00 per report |

What the tool adds for the worked export

| Bank deposit | Result | The sets |
| --- | --- | --- |
| 2026-09-14: $963.25 | one set fits | Oak & Co #2280 $275.50 (2026-09-05) + Rivera Plumbing #2290 $687.75 (2026-09-12) |
| 2026-09-22: $412.25 | several sets fit (2) | Set 1: Pine Street Gym #2297 $412.25 (2026-09-18); Set 2: Lumen Dental #2283 $412.25 (2026-09-09) |
| 2026-10-16: $1,500.00 | one set fits | Birch Cafe #2305 $960.00 (2026-10-02) + Lumen Dental #2311 $540.00 (2026-10-06) |
| 2026-10-29: $1,019.25 | fits only after a fee | Pine Street Gym #2334 $1,050.00 (2026-10-27) = $1,050.00, fee $30.75 (2.93%) |

## When QuickBooks alone is better

When a deposit slip lists its checks, or a deposit is one or two payments, the Bank Deposit window is quicker: tick them and save, and the books change in place. QuickBooks is also where the deposit has to be recorded in the end; this tool only tells you which payments to tick.

## Sources

- [Intuit QuickBooks: Deposit payments into the Undeposited Funds account in QuickBooks Online, updated August 24, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/payroll-setup/deposit-payments-undeposited-funds-account-online/L1td0m8Z2_US_en_US)
- [Intuit QuickBooks: Record and make bank deposits in QuickBooks Online, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-deposits/record-make-bank-deposits-quickbooks-online/L2BBZOPdr_US_en_US)

## Related

- [Clear Undeposited Funds in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/quickbooks-online/)
- [Xenett vs this tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/vs/xenett/)
- [Excel vs this tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/vs/excel-aging/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/vs/qbo-built-in-tools/  
Data as of: 2026-11-08
