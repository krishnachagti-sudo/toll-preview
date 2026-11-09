# Triage a large Ask My Accountant balance

In the worked Ask My Accountant export, 2 names (Check 1187 and Amazon) make up 81.7% of the $2,732.52 still open, so 2 client questions clear most of the balance; the other 3 names hold $499.48.

## Run this example in the cleanup tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/?ledger=Northfield+Landscaping+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22January+-+October%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0AAsk+My+Accountant%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C01%2F12%2F2026%2CExpense%2C%2CAmazon%2CAMZN+Mktp+US%2CBusiness+Checking%2C186.40%2C186.40%0D%0A%2C02%2F03%2F2026%2CExpense%2C%2CAmazon%2CAMZN+Mktp+US%2CBusiness+Checking%2C94.17%2C280.57%0D%0A%2C02%2F15%2F2026%2CExpense%2C%2CShell%2CFuel%2CBusiness+Card%2C61.25%2C341.82%0D%0A%2C03%2F02%2F2026%2CExpense%2C%2CHome+Depot%2C%2CBusiness+Checking%2C412.80%2C754.62%0D%0A%2C03%2F20%2F2026%2CExpense%2C%2CAmazon%2CAMZN+Mktp+US%2CBusiness+Checking%2C231.06%2C985.68%0D%0A%2C04%2F08%2F2026%2CCheck%2C1187%2C%2CCheck+1187%2CBusiness+Checking%2C%221%2C500.00%22%2C%222%2C485.68%22%0D%0A%2C05%2F11%2F2026%2CExpense%2C%2CShell%2CFuel%2CBusiness+Card%2C58.90%2C%222%2C544.58%22%0D%0A%2C05%2F30%2F2026%2CExpense%2C%2CHome+Depot%2C%2CBusiness+Checking%2C129.33%2C%222%2C673.91%22%0D%0A%2C06%2F14%2F2026%2CExpense%2C%2CVenmo%2C%2CBusiness+Checking%2C250.00%2C%222%2C923.91%22%0D%0A%2C07%2F01%2F2026%2CJournal+Entry%2CJE-14%2CHome+Depot%2CReclass+to+Supplies%2C%2C-412.80%2C%222%2C511.11%22%0D%0A%2C07%2F22%2F2026%2CExpense%2C%2CAmazon%2CAMZN+Mktp+US%2CBusiness+Checking%2C77.49%2C%222%2C588.60%22%0D%0A%2C08%2F09%2F2026%2CExpense%2C%2CShell%2CFuel%2CBusiness+Card%2C64.10%2C%222%2C652.70%22%0D%0A%2C09%2F03%2F2026%2CExpense%2C%2CVenmo%2C%2CBusiness+Checking%2C250.00%2C%222%2C902.70%22%0D%0A%2C09%2F12%2F2026%2CExpense%2C%2CShell%2CFuel%2CBusiness+Card%2C55.60%2C%222%2C958.30%22%0D%0A%2C09%2F30%2F2026%2CJournal+Entry%2CJE-22%2C%2CReclass+to+Fuel%2C%2C-119.70%2C%222%2C838.60%22%0D%0A%2C10%2F15%2F2026%2CExpense%2C%2CAmazon%2CAMZN+Mktp+US%2CBusiness+Checking%2C143.92%2C%222%2C982.52%22%0D%0A%2C10%2F28%2F2026%2CDeposit%2C%2CVenmo%2CRefund%2CBusiness+Checking%2C-250.00%2C%222%2C732.52%22%0D%0ATotal+for+Ask+My+Accountant%2C%2C%2C%2C%2C%2C%2C%22%242%2C732.52%22%2C%0D%0A&fee=0)

## Open totals by name

Ask My Accountant, open items by name, as of October 28, 2026

| Name | Items | Total | Share | Running share |
| --- | ---: | ---: | ---: | ---: |
| Check 1187 | 1 | $1,500.00 | 54.9% | 54.9% |
| Amazon | 5 | $733.04 | 26.8% | 81.7% |
| Venmo | 1 | $250.00 | 9.1% | 90.9% |
| Home Depot | 1 | $129.33 | 4.7% | 95.6% |
| Shell | 2 | $120.15 | 4.4% | 100% |

## The client question sheet

One line per open item, biggest names first

| Date | Name or memo | Amount | What was it for? |
| --- | --- | ---: | --- |
| 2026-04-08 | Check 1187 | $1,500.00 |  |
| 2026-01-12 | Amazon | $186.40 |  |
| 2026-02-03 | Amazon | $94.17 |  |
| 2026-03-20 | Amazon | $231.06 |  |
| 2026-07-22 | Amazon | $77.49 |  |
| 2026-10-15 | Amazon | $143.92 |  |
| 2026-06-14 | Venmo | $250.00 |  |
| 2026-05-30 | Home Depot | $129.33 |  |
| 2026-02-15 | Shell | $61.25 |  |
| 2026-05-11 | Shell | $58.90 |  |

## Check the total moved, not vanished

Before: $2,732.52 open across 10 items. After the client answers and you reclassify, export again: the open total should fall by exactly the amount reclassified, and the reclass lines should pair one for one with the items they cleared. If they do not pair, something was reclassified twice or from the wrong item.

## Sources

- [Intuit QuickBooks: Run a ledger report that shows debits and credits for each transaction, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/profit-loss-reports/create-report-shows-debits-credits-transaction/L1zvqNX0e_US_en_US)
- [Intuit QuickBooks: Export your reports to Excel from QuickBooks Online (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-articles/export-your-reports-to-excel-from-quickbooks-online/00/262097)

## Steps

1. **Net out what is done.** Export the account and load it: reclass entries and refunds already posted are paired with the items they cleared.
2. **Sort by name and size.** Read the open totals by name, largest first, with the running share.
3. **Batch the questions.** Send the client one list: the top names, each with dates and amounts, from the open-items CSV.
4. **Reclassify.** Reclassify each answered item to its account; repeat names may become bank rules.
5. **Check the total moved.** Export again: the open total should fall by exactly what was reclassified.

## Related

- [Ask My Accountant](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/ask-my-accountant/)
- [Pre-tax-season clearing checklist](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/guides/pre-tax-season-clearing-checklist/)
- [Xenett vs this tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/vs/xenett/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/guides/ask-my-accountant-triage/  
Data as of: 2026-11-08
