# Excel aging worksheet vs this tool

Excel's Solver add-in can search for a set of payments that adds up to a deposit, with up to 200 variable cells and binary constraints, but each run fills in one set of values; for the $412.25 deposit in the worked export there are 2 sets that fit, and this tool lists both.

## Run this example in the cleanup tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/?ledger=Harbor+Lane+Studio+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22January+1%2C+2025+-+October+31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0AUndeposited+Funds%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C03%2F14%2F2025%2CPayment%2C1041%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C200.00%22%2C%221%2C200.00%22%0D%0A%2C06%2F02%2F2025%2CSales+Receipt%2C1077%2CWalk-in+sale%2C%2CSales%2C85.00%2C%221%2C285.00%22%0D%0A%2C07%2F06%2F2026%2CPayment%2C2210%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C640.00%2C%221%2C925.00%22%0D%0A%2C07%2F08%2F2026%2CPayment%2C2214%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C150.00%22%2C%223%2C075.00%22%0D%0A%2C07%2F10%2F2026%2CDeposit%2C%2C%2C%2CBusiness+Checking%2C%22-1%2C790.00%22%2C%221%2C285.00%22%0D%0A%2C08%2F03%2F2026%2CPayment%2C2251%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C300.00%2C%221%2C585.00%22%0D%0A%2C08%2F04%2F2026%2CDeposit%2C%2CBirch+Cafe%2C%2CBusiness+Checking%2C-300.00%2C%221%2C285.00%22%0D%0A%2C08%2F20%2F2026%2CPayment%2C2268%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C450.00%2C%221%2C735.00%22%0D%0A%2C09%2F05%2F2026%2CPayment%2C2280%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C275.50%2C%222%2C010.50%22%0D%0A%2C09%2F09%2F2026%2CPayment%2C2283%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C412.25%2C%222%2C422.75%22%0D%0A%2C09%2F12%2F2026%2CPayment%2C2290%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C687.75%2C%223%2C110.50%22%0D%0A%2C09%2F18%2F2026%2CPayment%2C2297%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C412.25%2C%223%2C522.75%22%0D%0A%2C10%2F02%2F2026%2CPayment%2C2305%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C960.00%2C%224%2C482.75%22%0D%0A%2C10%2F06%2F2026%2CPayment%2C2311%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C540.00%2C%225%2C022.75%22%0D%0A%2C10%2F09%2F2026%2CPayment%2C2316%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C230.00%2C%225%2C252.75%22%0D%0A%2C10%2F14%2F2026%2CPayment%2C2320%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C320.00%2C%225%2C572.75%22%0D%0A%2C10%2F14%2F2026%2CPayment%2C2320%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C320.00%2C%225%2C892.75%22%0D%0A%2C10%2F27%2F2026%2CPayment%2C2334%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C050.00%22%2C%226%2C942.75%22%0D%0A%2C10%2F30%2F2026%2CSales+Receipt%2C2339%2CWalk-in+sale%2C%2CSales%2C129.99%2C%227%2C072.74%22%0D%0ATotal+for+Undeposited+Funds%2C%2C%2C%2C%2C%2C%2C%22%247%2C072.74%22%2C%0D%0A&bank=Date%2CDescription%2CAmount%0D%0A09%2F14%2F2026%2CDEPOSIT%2C963.25%0D%0A09%2F15%2F2026%2CACH+VENDOR+PAYMENT%2C-220.00%0D%0A09%2F22%2F2026%2CDEPOSIT%2C412.25%0D%0A10%2F16%2F2026%2CDEPOSIT%2C%221%2C500.00%22%0D%0A10%2F29%2F2026%2CDEPOSIT%2C%221%2C019.25%22%0D%0A&fee=3)

## Side by side

Solver facts from Microsoft Support, read November 8, 2026

|  | Excel | This tool |
| --- | --- | --- |
| Aging | A formula for age and a pivot by bucket, built by hand | Built in, after netting |
| Finding a set for a deposit | Solver: "Solver is a Microsoft Excel add-in program you can use for what-if analysis." You can specify up to 200 variable cells. | Every set, up to 40 payments per deposit in a date window |
| More than one answer | One set of values per run | Counts and lists every set (2 for the $412.25 deposit) |
| Audit | Every formula visible | The rules are fixed and stated; the CSVs show every match |

The worked export's deposits

| Bank deposit | Result | The sets |
| --- | --- | --- |
| 2026-09-14: $963.25 | one set fits | Oak & Co #2280 $275.50 (2026-09-05) + Rivera Plumbing #2290 $687.75 (2026-09-12) |
| 2026-09-22: $412.25 | several sets fit (2) | Set 1: Pine Street Gym #2297 $412.25 (2026-09-18); Set 2: Lumen Dental #2283 $412.25 (2026-09-09) |
| 2026-10-16: $1,500.00 | one set fits | Birch Cafe #2305 $960.00 (2026-10-02) + Lumen Dental #2311 $540.00 (2026-10-06) |
| 2026-10-29: $1,019.25 | fits only after a fee | Pine Street Gym #2334 $1,050.00 (2026-10-27) = $1,050.00, fee $30.75 (2.93%) |

## When Excel is better

Excel is better for a custom view, an unusual layout, or when a reviewer needs to see every formula. It is already installed. This tool is better when the question is "which payments add up to this deposit", where finding every set, not just one, is what keeps you from picking the wrong one.

## Sources

- [Microsoft Support: Define and solve a problem by using Solver (read November 8, 2026)](https://support.microsoft.com/en-us/office/define-and-solve-a-problem-by-using-solver-5d1a388f-079d-43ac-a7eb-f63e45925040)

## Related

- [Which payments make up this deposit?](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/match-deposit/)
- [The reconciliation template](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/template/)
- [QuickBooks built-in tools vs this tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/vs/qbo-built-in-tools/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/vs/excel-aging/  
Data as of: 2026-11-08
