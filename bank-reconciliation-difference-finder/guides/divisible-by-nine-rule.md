# Off by 9, 90 or 900: the divisible-by-9 rule

A bank reconciliation off by 9, 90 or 900 points to two swapped digits, because swapping neighbours changes a number by 9 x the gap between them; in this worked month the gaps are $18.00 ($46.00 for $64.00) and $90.00 ($450.00 for $540.00), and a $1,080.00 gap is a slide ($120.00 for $1,200.00), also a multiple of 9.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%2CBalance%0D%0A10%2F02%2F2026%2CSQUARE+INC+DEP%2C987.60%2C%225%2C107.60%22%0D%0A10%2F05%2F2026%2COFFICE+DEPOT%2C-64.00%2C%225%2C043.60%22%0D%0A10%2F09%2F2026%2CSYSCO+FOOD+SVC%2C-540.00%2C%224%2C503.60%22%0D%0A10%2F13%2F2026%2CSQUARE+INC+DEP%2C%221%2C012.45%22%2C%225%2C516.05%22%0D%0A10%2F16%2F2026%2CCITY+WATER%2C%22-1%2C200.00%22%2C%224%2C316.05%22%0D%0A10%2F21%2F2026%2CSQUARE+INC+DEP%2C998.30%2C%225%2C314.35%22%0D%0A10%2F27%2F2026%2CCOMCAST+BUSINESS%2C-189.99%2C%225%2C124.36%22%0D%0A&ledger=Pine+Street+Deli+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0AChecking%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C%224%2C120.00%22%0D%0A%2C10%2F02%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C987.60%2C%225%2C107.60%22%0D%0A%2C10%2F05%2F2026%2CExpense%2C%2COffice+Depot%2CReceipt+rolls%2CSupplies%2C-46.00%2C%225%2C061.60%22%0D%0A%2C10%2F09%2F2026%2CExpense%2C%2CSysco%2CProduce%2CSupplies%2C-450.00%2C%224%2C611.60%22%0D%0A%2C10%2F13%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C%221%2C012.45%22%2C%225%2C624.05%22%0D%0A%2C10%2F16%2F2026%2CExpense%2C%2CCity+Water%2CWater+and+sewer%2CUtilities%2C-120.00%2C%225%2C504.05%22%0D%0A%2C10%2F21%2F2026%2CDeposit%2C%2CSquare%2CCard+sales%2CSales%2C998.30%2C%226%2C502.35%22%0D%0A%2C10%2F27%2F2026%2CExpense%2C%2CComcast+Business%2CInternet%2CUtilities%2C-189.99%2C%226%2C312.36%22%0D%0ATotal+for+Checking%2C%2C%2C%2C%2C%2C%2C%22%242%2C192.36%22%2C%0D%0A)

## The proof

A two-digit block ab is worth 10a + b; swapped it is 10b + a. The gap is 9a - 9b = 9 x (a - b). In a longer number the block sits at some place value, which multiplies the gap and keeps it a multiple of 9. AccountingTools: "Transposition errors are often revealed during reconciliation processes, especially when the difference is divisible by 9."

Swaps and slides, worked out by the checker

| Right | Typed | Gap | Gap / 9 | Kind |
| --- | --- | ---: | ---: | --- |
| $540.00 | $450.00 | $90.00 | $10.00 | swap, digits 1 apart |
| $64.00 | $46.00 | $18.00 | $2.00 | swap, digits 2 apart |
| $983.00 | $893.00 | $90.00 | $10.00 | swap, digits 1 apart |
| $1,250.00 | $1,520.00 | $270.00 | $30.00 | swap, digits 3 apart |
| $72.00 | $27.00 | $45.00 | $5.00 | swap, digits 5 apart |
| $3,080.00 | $3,800.00 | $720.00 | $80.00 | swap, digits 8 apart |
| $1,200.00 | $120.00 | $1,080.00 | $120.00 | slide (ten times) |

## The worked month

At October 31, 2026 the statement shows $5,124.36 and the books $6,312.36: a difference of $1,188.00. 4 lines match and 6 lines are on one side only. There are no timing items; the other $1,188.00 (the books are higher) comes from 2 likely transpositions and 1 slide. The running balances first disagree on October 5, 2026.

The swapped and slid amounts

| Date | Kind | Bank | Books | Effect |
| --- | --- | --- | --- | ---: |
| 2026-10-05 | digit transposition | bank 2026-10-05 -$64.00 OFFICE DEPOT | books 2026-10-05 -$46.00 Office Depot Receipt rolls | -$18.00 |
| 2026-10-09 | digit transposition | bank 2026-10-09 -$540.00 SYSCO FOOD SVC | books 2026-10-09 -$450.00 Sysco Produce | -$90.00 |
| 2026-10-16 | slide (a missing or extra zero) | bank 2026-10-16 -$1,200.00 CITY WATER | books 2026-10-16 -$120.00 City Water Water and sewer | -$1,080.00 |

The month's total gap, $1,188.00, is divisible by 9 as well, but its quotient is not one digit followed by zeros, so no single swap explains it: several errors are mixed. That is why the tool tests each unmatched pair, not only the total.

## The order to check in

- A swap: two unmatched amounts that are the same digits with neighbours swapped.
- A missing line: an amount equal to the difference.
- An entry made twice.
- A sign error: an amount equal to half the difference.

## Check a difference

[Open the check with this difference](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?diff=90.00&amounts=450.00)

## Sources

- [AccountingTools: Transposition error, February 13, 2026 (read November 8, 2026)](https://accountingtools.com/articles/transposition-error)

## Questions

### Why does a difference divisible by 9 hint at a transposition?

Swap neighbouring digits a and b in places 10^(k+1) and 10^k and the number changes by (10a + b - 10b - a) x 10^k = 9 x (a - b) x 10^k: always a multiple of 9.

### Is it proof?

No. A slide (an extra or missing zero) gives a multiple of 9 too, and two errors can add up to one. Check the pair against the statement.

## Related

- [Transposition error checker](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/transposition-error-checker/)
- [Difference is twice an amount](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/difference-is-double-a-transaction/)
- [Why a reconciliation does not balance](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/why-bank-reconciliation-not-balancing/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/divisible-by-nine-rule/  
Data as of: 2026-11-08
