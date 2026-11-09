# Worked example: a missing $1,350 payment

Across three months of statements and books $1,350.00 apart, the running balances first disagree on September 21, 2026: the $1,350.00 TRAVELERS INS payment is at the bank and not in the books, and entering it brings the two to $24,184.62.

## Open the sample files

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%2CBalance%0D%0A08%2F03%2F2026%2CMAPLE+LEASING%2C%22-1%2C850.00%22%2C%2219%2C193.77%22%0D%0A08%2F06%2F2026%2CCLIENT+PMT+RIVERA%2C%226%2C400.00%22%2C%2225%2C593.77%22%0D%0A08%2F12%2F2026%2CFERGUSON+SUPPLY%2C%22-2%2C124.80%22%2C%2223%2C468.97%22%0D%0A08%2F20%2F2026%2CCLIENT+PMT+OKAFOR%2C%224%2C550.00%22%2C%2228%2C018.97%22%0D%0A08%2F27%2F2026%2CADP+PAYROLL%2C%22-3%2C982.00%22%2C%2224%2C036.97%22%0D%0A09%2F02%2F2026%2CMAPLE+LEASING%2C%22-1%2C850.00%22%2C%2222%2C186.97%22%0D%0A09%2F09%2F2026%2CCLIENT+PMT+CHEN%2C%227%2C125.00%22%2C%2229%2C311.97%22%0D%0A09%2F16%2F2026%2CFERGUSON+SUPPLY%2C%22-1%2C899.75%22%2C%2227%2C412.22%22%0D%0A09%2F21%2F2026%2CTRAVELERS+INS%2C%22-1%2C350.00%22%2C%2226%2C062.22%22%0D%0A09%2F24%2F2026%2CADP+PAYROLL%2C%22-3%2C982.00%22%2C%2222%2C080.22%22%0D%0A10%2F01%2F2026%2CMAPLE+LEASING%2C%22-1%2C850.00%22%2C%2220%2C230.22%22%0D%0A10%2F07%2F2026%2CCLIENT+PMT+PATEL%2C%225%2C800.00%22%2C%2226%2C030.22%22%0D%0A10%2F14%2F2026%2CFERGUSON+SUPPLY%2C%22-2%2C013.60%22%2C%2224%2C016.62%22%0D%0A10%2F22%2F2026%2CADP+PAYROLL%2C%22-3%2C982.00%22%2C%2220%2C034.62%22%0D%0A10%2F28%2F2026%2CCLIENT+PMT+RIVERA%2C%224%2C150.00%22%2C%2224%2C184.62%22%0D%0A&ledger=Alder+Ridge+Builders+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22August+1+-+October+31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0AOperating+Account%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C%2221%2C043.77%22%0D%0A%2C08%2F03%2F2026%2CExpense%2C%2CMaple+Leasing%2C%2CJob+Costs%2C%22-1%2C850.00%22%2C%2219%2C193.77%22%0D%0A%2C08%2F06%2F2026%2CPayment%2C%2CRIVERA%2C%2CAccounts+Receivable%2C%226%2C400.00%22%2C%2225%2C593.77%22%0D%0A%2C08%2F12%2F2026%2CExpense%2C%2CFerguson%2C%2CJob+Costs%2C%22-2%2C124.80%22%2C%2223%2C468.97%22%0D%0A%2C08%2F20%2F2026%2CPayment%2C%2COKAFOR%2C%2CAccounts+Receivable%2C%224%2C550.00%22%2C%2228%2C018.97%22%0D%0A%2C08%2F27%2F2026%2CExpense%2C%2CADP%2C%2CJob+Costs%2C%22-3%2C982.00%22%2C%2224%2C036.97%22%0D%0A%2C09%2F02%2F2026%2CExpense%2C%2CMaple+Leasing%2C%2CJob+Costs%2C%22-1%2C850.00%22%2C%2222%2C186.97%22%0D%0A%2C09%2F09%2F2026%2CPayment%2C%2CCHEN%2C%2CAccounts+Receivable%2C%227%2C125.00%22%2C%2229%2C311.97%22%0D%0A%2C09%2F16%2F2026%2CExpense%2C%2CFerguson%2C%2CJob+Costs%2C%22-1%2C899.75%22%2C%2227%2C412.22%22%0D%0A%2C09%2F24%2F2026%2CExpense%2C%2CADP%2C%2CJob+Costs%2C%22-3%2C982.00%22%2C%2223%2C430.22%22%0D%0A%2C10%2F01%2F2026%2CExpense%2C%2CMaple+Leasing%2C%2CJob+Costs%2C%22-1%2C850.00%22%2C%2221%2C580.22%22%0D%0A%2C10%2F07%2F2026%2CPayment%2C%2CPATEL%2C%2CAccounts+Receivable%2C%225%2C800.00%22%2C%2227%2C380.22%22%0D%0A%2C10%2F14%2F2026%2CExpense%2C%2CFerguson%2C%2CJob+Costs%2C%22-2%2C013.60%22%2C%2225%2C366.62%22%0D%0A%2C10%2F22%2F2026%2CExpense%2C%2CADP%2C%2CJob+Costs%2C%22-3%2C982.00%22%2C%2221%2C384.62%22%0D%0A%2C10%2F28%2F2026%2CPayment%2C%2CRIVERA%2C%2CAccounts+Receivable%2C%224%2C150.00%22%2C%2225%2C534.62%22%0D%0ATotal+for+Operating+Account%2C%2C%2C%2C%2C%2C%2C%22%244%2C490.85%22%2C%0D%0A)

## The files

15 statement lines and 14 ledger lines from August 3, 2026 to October 31, 2026, Alder Ridge Builders (made up). The ending balances: statement $24,184.62, books $25,534.62.

The difference, date by date

| Date | Change | Difference after | Why |
| --- | ---: | ---: | --- |
| Opening |  | $0.00 | The gap between the two opening balances |
| 2026-09-21 | -$1,350.00 | -$1,350.00 | money out at the bank, not in the books: TRAVELERS INS -$1,350.00 |

## Narrowing it down

- Before September 21, 2026 the balances agree once timing is set aside, so nothing earlier needs checking.
- On September 21, 2026 the bank has a $1,350.00 line (TRAVELERS INS) with no books line of that amount within 92 days.
- The check on the difference agrees: $1,350.00 is divisible by 9 ($1,350.00 / 9 = $150.00), so a transposition is possible, but not one swap of two adjacent digits (the quotient is not one digit followed by zeros). One amount equals the difference: a line missing on one side.

## The correction

After entering the payment, both sides agree

| Line | Amount |
| --- | ---: |
| Balance per bank statement | $24,184.62 |
| Add: deposits in transit | $0.00 |
| Less: outstanding checks and payments | $0.00 |
| **Adjusted bank balance** | **$24,184.62** |
| Balance per books | $25,534.62 |
| Bank lines not in the books | -$1,350.00 |
| Corrections the hints point to | $0.00 |
| **Adjusted books balance** | **$24,184.62** |

## Sources

- [AccountingCoach: Bank reconciliation explanation (read November 8, 2026)](https://www.accountingcoach.com/bank-reconciliation/explanation)

## Related

- [Opening balance difference](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/opening-balance-difference/)
- [Bank reconciliation example (one month)](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/bank-reconciliation-example/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/worked-example-missing-payment/  
Data as of: 2026-11-08
