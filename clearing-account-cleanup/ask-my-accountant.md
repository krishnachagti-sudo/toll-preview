# Ask My Accountant: age it and clear the balance

In this worked Ask My Accountant export, 10 items totaling $2,732.52 are still open after 2 one-for-one entries and 1 reclass journal made of 2 items are netted out, 9 of them over 90 days old, and one item (Check 1187, $1,500.00) is 54.9% of the balance.

## Run this example in the cleanup tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/?ledger=Northfield+Landscaping+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22January+-+October%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0AAsk+My+Accountant%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C01%2F12%2F2026%2CExpense%2C%2CAmazon%2CAMZN+Mktp+US%2CBusiness+Checking%2C186.40%2C186.40%0D%0A%2C02%2F03%2F2026%2CExpense%2C%2CAmazon%2CAMZN+Mktp+US%2CBusiness+Checking%2C94.17%2C280.57%0D%0A%2C02%2F15%2F2026%2CExpense%2C%2CShell%2CFuel%2CBusiness+Card%2C61.25%2C341.82%0D%0A%2C03%2F02%2F2026%2CExpense%2C%2CHome+Depot%2C%2CBusiness+Checking%2C412.80%2C754.62%0D%0A%2C03%2F20%2F2026%2CExpense%2C%2CAmazon%2CAMZN+Mktp+US%2CBusiness+Checking%2C231.06%2C985.68%0D%0A%2C04%2F08%2F2026%2CCheck%2C1187%2C%2CCheck+1187%2CBusiness+Checking%2C%221%2C500.00%22%2C%222%2C485.68%22%0D%0A%2C05%2F11%2F2026%2CExpense%2C%2CShell%2CFuel%2CBusiness+Card%2C58.90%2C%222%2C544.58%22%0D%0A%2C05%2F30%2F2026%2CExpense%2C%2CHome+Depot%2C%2CBusiness+Checking%2C129.33%2C%222%2C673.91%22%0D%0A%2C06%2F14%2F2026%2CExpense%2C%2CVenmo%2C%2CBusiness+Checking%2C250.00%2C%222%2C923.91%22%0D%0A%2C07%2F01%2F2026%2CJournal+Entry%2CJE-14%2CHome+Depot%2CReclass+to+Supplies%2C%2C-412.80%2C%222%2C511.11%22%0D%0A%2C07%2F22%2F2026%2CExpense%2C%2CAmazon%2CAMZN+Mktp+US%2CBusiness+Checking%2C77.49%2C%222%2C588.60%22%0D%0A%2C08%2F09%2F2026%2CExpense%2C%2CShell%2CFuel%2CBusiness+Card%2C64.10%2C%222%2C652.70%22%0D%0A%2C09%2F03%2F2026%2CExpense%2C%2CVenmo%2C%2CBusiness+Checking%2C250.00%2C%222%2C902.70%22%0D%0A%2C09%2F12%2F2026%2CExpense%2C%2CShell%2CFuel%2CBusiness+Card%2C55.60%2C%222%2C958.30%22%0D%0A%2C09%2F30%2F2026%2CJournal+Entry%2CJE-22%2C%2CReclass+to+Fuel%2C%2C-119.70%2C%222%2C838.60%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CAmazon%2CAMZN+Mktp+US%2CBusiness+Checking%2C143.92%2C%222%2C982.52%22%0D%0A%2C10%2F28%2F2026%2CDeposit%2C%2CVenmo%2CRefund%2CBusiness+Checking%2C-250.00%2C%222%2C732.52%22%0D%0ATotal+for+Ask+My+Accountant%2C%2C%2C%2C%2C%2C%2C%22%242%2C732.52%22%2C%0D%0A&fee=0)

## The worked export

A made-up landscaping business, January to October 2026: 17 lines in Ask My Accountant, on the debit side like an expense. 7 lines already cancel: a reclass of $412.80 to Supplies matches one Home Depot purchase, a refund matches one of two equal Venmo payments, and a $119.70 reclass to Fuel matches Shell $64.10 (2026-08-09) + Shell $55.60 (2026-09-12).

Open Ask My Accountant items by age, as of October 28, 2026

| Age | Items | Total |
| --- | ---: | ---: |
| 0 to 30 days | 1 | $143.92 |
| 31 to 60 days | 0 | $0.00 |
| 61 to 90 days | 0 | $0.00 |
| Over 90 days | 9 | $2,588.60 |
| All open items | 10 | $2,732.52 |

The refund could have cleared either Venmo payment of $250.00. The tool used the one with the same name and the closest earlier date, and says so in the report, so the choice can be checked.

## Who makes up the balance

Open totals by name (or memo where there is no name), largest first

| Name | Items | Total | Share | Running share |
| --- | ---: | ---: | ---: | ---: |
| Check 1187 | 1 | $1,500.00 | 54.9% | 54.9% |
| Amazon | 5 | $733.04 | 26.8% | 81.7% |
| Venmo | 1 | $250.00 | 9.1% | 90.9% |
| Home Depot | 1 | $129.33 | 4.7% | 95.6% |
| Shell | 2 | $120.15 | 4.4% | 100% |

The biggest names are the questions for the client: one check with no payee is more than half the balance. A full method for a large pile is in [triage a big Ask My Accountant balance](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/guides/ask-my-accountant-triage/).

## The same export for any account

The tool reads the account the way it reads Undeposited Funds: export Transaction Detail by Account for the one account and save it as CSV. Intuit's ledger article says to start with the Transaction Detail by Account report and then customize it to add the appropriate columns; with Debit and Credit columns instead of Amount, it reads the same.

## Sources

- [Intuit QuickBooks: Run a ledger report that shows debits and credits for each transaction, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/profit-loss-reports/create-report-shows-debits-credits-transaction/L1zvqNX0e_US_en_US)
- [Intuit QuickBooks: Export your reports to Excel from QuickBooks Online (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-articles/export-your-reports-to-excel-from-quickbooks-online/00/262097)

## Related

- [Triage a large Ask My Accountant pile](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/guides/ask-my-accountant-triage/)
- [Suspense accounts](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/suspense-account/)
- [Pre-tax-season clearing checklist](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/guides/pre-tax-season-clearing-checklist/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/ask-my-accountant/  
Data as of: 2026-11-08
