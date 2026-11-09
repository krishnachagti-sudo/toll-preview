# Credit card reconciliation keeps being off

A credit card reconciliation stays off when signs are mixed up: in this worked card month the ledger's signs are the opposite of the bank's (flipped automatically), a $129.00 return was entered as a charge ($258.00 out, twice the amount), and $38.40 of interest is missing from the books, together $219.60.

## Run this example in the difference finder

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/?statement=Date%2CDescription%2CAmount%0D%0A10%2F03%2F2026%2CCHEVRON+0091842%2C-91.24%0D%0A10%2F07%2F2026%2CTHE+HOME+DEPOT+%236512%2C-742.30%0D%0A10%2F11%2F2026%2CADOBE+CREATIVE+CLD%2C-59.99%0D%0A10%2F14%2F2026%2CTHE+HOME+DEPOT+%236512+RETURN%2C129.00%0D%0A10%2F18%2F2026%2CCHEVRON+0091842%2C-88.06%0D%0A10%2F22%2F2026%2CPAYMENT+THANK+YOU%2C%221%2C500.00%22%0D%0A10%2F25%2F2026%2CNAPA+AUTO+PARTS%2C-31.50%0D%0A10%2F28%2F2026%2CINTEREST+CHARGE%2C-38.40%0D%0A&ledger=Copperleaf+Landscaping+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22October+1-31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0ABusiness+Card%2C%2C%2C%2C%2C%2C%2C%2C%0D%0ABeginning+Balance%2C%2C%2C%2C%2C%2C%2C%2C0.00%0D%0A%2C10%2F03%2F2026%2CExpense%2C%2CChevron%2CTruck+fuel%2CCar+%26+Truck%2C91.24%2C91.24%0D%0A%2C10%2F07%2F2026%2CExpense%2C%2CHome+Depot%2CStone%2CSupplies%2C742.30%2C833.54%0D%0A%2C10%2F11%2F2026%2CExpense%2C%2CAdobe%2CSoftware%2CSoftware%2C59.99%2C893.53%0D%0A%2C10%2F14%2F2026%2CExpense%2C%2CHome+Depot%2CReturned+edging%2CSupplies%2C129.00%2C%221%2C022.53%22%0D%0A%2C10%2F18%2F2026%2CExpense%2C%2CChevron%2CTruck+fuel%2CCar+%26+Truck%2C88.06%2C%221%2C110.59%22%0D%0A%2C10%2F22%2F2026%2CCredit+Card+Payment%2C%2CBusiness+Checking%2CCard+payment%2CBusiness+Checking%2C%22-1%2C500.00%22%2C-389.41%0D%0A%2C10%2F25%2F2026%2CExpense%2C%2CNAPA+Auto+Parts%2CFilters%2CRepairs%2C31.50%2C-357.91%0D%0A%2C10%2F30%2F2026%2CExpense%2C%2CSiteOne+Landscape+Supply%2CIrrigation+parts%2CSupplies%2C212.75%2C-145.16%0D%0ATotal+for+Business+Card%2C%2C%2C%2C%2C%2C%2C-%24145.16%2C%0D%0A)

## The worked card month

From October 3, 2026 to October 31, 2026 the statement lines and the books lines differ by $432.35. 6 lines match and 4 lines are on one side only. Timing explains $212.75 (1 outstanding payment); the other $219.60 (the bank is higher) comes from 1 sign flip and 1 bank line missing from the books. The running balances first disagree on October 14, 2026.

Errors

| Date | Kind | Bank | Books | Effect |
| --- | --- | --- | --- | ---: |
| 2026-10-14 | sign flip (entered the wrong way round) | bank 2026-10-14 $129.00 THE HOME DEPOT #6512 RETURN | books 2026-10-14 -$129.00 Home Depot Returned edging | $258.00 |

Lines on one side only

| Date | What | Line | Amount | Age (days) |
| --- | --- | --- | ---: | ---: |
| 2026-10-28 | in the bank, not in the books (interest) | INTEREST CHARGE | -$38.40 | 3 |
| 2026-10-30 | outstanding payment | SiteOne Landscape Supply Irrigation parts | -$212.75 | 1 |

## What to check on a card

- Signs: a charge raises what you owe. If one file writes charges negative and the other positive, flip one (the tool does it when more amounts agree that way).
- Returns and refunds: entered as a new charge, they move the balance by twice their amount.
- Interest and fees: on the statement, often missing from the books.
- Pending charges: in the books before the bank posts them; outstanding until the next statement.
- The payment from checking: one line on each account, the same day or a day or two apart.

## Sources

- [Intuit QuickBooks: Format CSV files in Excel to get bank transactions into QuickBooks, updated August 24, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-transactions/format-csv-files-excel-bank-transactions-quickbooks/L4BjLWckq_US_en_US)
- [QuickBooks Community: reconciling difference but transactions match (Community Manager answer, August 6, 2026) (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/banking/reconciling-difference-but-transactions-match/00/1536939)

## Questions

### Why are card deposits negative in my file?

Intuit: "deposits may appear as negative amounts because paying your credit card reduces your balance".

### Why is my card difference so large?

A QuickBooks Community Manager wrote that a positive ending balance entered for a credit card or other liability account can create a large difference.

## Related

- [Difference is twice an amount](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/difference-is-double-a-transaction/)
- [Why a reconciliation does not balance](https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/why-bank-reconciliation-not-balancing/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bank-reconciliation-difference-finder/guides/credit-card-reconciliation-off/  
Data as of: 2026-11-08
