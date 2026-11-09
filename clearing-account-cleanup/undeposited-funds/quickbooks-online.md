# Clear Undeposited Funds in QuickBooks Online

In QuickBooks Online, clear Undeposited Funds with one Bank Deposit per bank line, ticking exactly the payments that make it up: in the worked export, 2 deposits have exactly one set ($963.25 = Oak & Co #2280 $275.50 (2026-09-05) + Rivera Plumbing #2290 $687.75 (2026-09-12)), one has 2 sets to choose from, and one needs a $30.75 fee line.

## Run this example in the cleanup tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/?ledger=Harbor+Lane+Studio+%28made-up+sample%29%0D%0ATransaction+Detail+by+Account%0D%0A%22January+1%2C+2025+-+October+31%2C+2026%22%0D%0A%0D%0A%2CDate%2CTransaction+Type%2CNum%2CName%2CMemo%2FDescription%2CSplit%2CAmount%2CBalance%0D%0AUndeposited+Funds%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A%2C03%2F14%2F2025%2CPayment%2C1041%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C200.00%22%2C%221%2C200.00%22%0D%0A%2C06%2F02%2F2025%2CSales+Receipt%2C1077%2CWalk-in+sale%2C%2CSales%2C85.00%2C%221%2C285.00%22%0D%0A%2C07%2F06%2F2026%2CPayment%2C2210%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C640.00%2C%221%2C925.00%22%0D%0A%2C07%2F08%2F2026%2CPayment%2C2214%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C150.00%22%2C%223%2C075.00%22%0D%0A%2C07%2F10%2F2026%2CDeposit%2C%2C%2C%2CBusiness+Checking%2C%22-1%2C790.00%22%2C%221%2C285.00%22%0D%0A%2C08%2F03%2F2026%2CPayment%2C2251%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C300.00%2C%221%2C585.00%22%0D%0A%2C08%2F04%2F2026%2CDeposit%2C%2CBirch+Cafe%2C%2CBusiness+Checking%2C-300.00%2C%221%2C285.00%22%0D%0A%2C08%2F20%2F2026%2CPayment%2C2268%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C450.00%2C%221%2C735.00%22%0D%0A%2C09%2F05%2F2026%2CPayment%2C2280%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C275.50%2C%222%2C010.50%22%0D%0A%2C09%2F09%2F2026%2CPayment%2C2283%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C412.25%2C%222%2C422.75%22%0D%0A%2C09%2F12%2F2026%2CPayment%2C2290%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C687.75%2C%223%2C110.50%22%0D%0A%2C09%2F18%2F2026%2CPayment%2C2297%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C412.25%2C%223%2C522.75%22%0D%0A%2C10%2F02%2F2026%2CPayment%2C2305%2CBirch+Cafe%2C%2CAccounts+Receivable+%28A%2FR%29%2C960.00%2C%224%2C482.75%22%0D%0A%2C10%2F06%2F2026%2CPayment%2C2311%2CLumen+Dental%2C%2CAccounts+Receivable+%28A%2FR%29%2C540.00%2C%225%2C022.75%22%0D%0A%2C10%2F09%2F2026%2CPayment%2C2316%2COak+%26+Co%2C%2CAccounts+Receivable+%28A%2FR%29%2C230.00%2C%225%2C252.75%22%0D%0A%2C10%2F14%2F2026%2CPayment%2C2320%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C320.00%2C%225%2C572.75%22%0D%0A%2C10%2F14%2F2026%2CPayment%2C2320%2CRivera+Plumbing%2C%2CAccounts+Receivable+%28A%2FR%29%2C320.00%2C%225%2C892.75%22%0D%0A%2C10%2F27%2F2026%2CPayment%2C2334%2CPine+Street+Gym%2C%2CAccounts+Receivable+%28A%2FR%29%2C%221%2C050.00%22%2C%226%2C942.75%22%0D%0A%2C10%2F30%2F2026%2CSales+Receipt%2C2339%2CWalk-in+sale%2C%2CSales%2C129.99%2C%227%2C072.74%22%0D%0ATotal+for+Undeposited+Funds%2C%2C%2C%2C%2C%2C%2C%22%247%2C072.74%22%2C%0D%0A&bank=Date%2CDescription%2CAmount%0D%0A09%2F14%2F2026%2CDEPOSIT%2C963.25%0D%0A09%2F15%2F2026%2CACH+VENDOR+PAYMENT%2C-220.00%0D%0A09%2F22%2F2026%2CDEPOSIT%2C412.25%0D%0A10%2F16%2F2026%2CDEPOSIT%2C%221%2C500.00%22%0D%0A10%2F29%2F2026%2CDEPOSIT%2C%221%2C019.25%22%0D%0A&fee=3)

## 1. Export the account

1. Go to Reports and select Standard reports.
2. Search for and select the report you want.
3. Classic view: select the Export icon, then Export to Excel. New enhanced experience: select Export/Print, then Export to Excel.
4. Pick Transaction Detail by Account, filter it to the one account, set the dates, then save the Excel file as CSV.

Intuit's ledger article says to "start with the Transaction Detail by Account report and then customize it to add the appropriate columns"; the tool reads Amount, or Debit and Credit, either way. If the account has another name in your file, "This account can be renamed, so check the Detail type column for "Undeposited Funds.""

## 2. Find which payments make up each deposit

The worked export against its bank statement

| Bank deposit | Result | The sets |
| --- | --- | --- |
| 2026-09-14: $963.25 | one set fits | Oak & Co #2280 $275.50 (2026-09-05) + Rivera Plumbing #2290 $687.75 (2026-09-12) |
| 2026-09-22: $412.25 | several sets fit (2) | Set 1: Pine Street Gym #2297 $412.25 (2026-09-18); Set 2: Lumen Dental #2283 $412.25 (2026-09-09) |
| 2026-10-16: $1,500.00 | one set fits | Birch Cafe #2305 $960.00 (2026-10-02) + Lumen Dental #2311 $540.00 (2026-10-06) |
| 2026-10-29: $1,019.25 | fits only after a fee | Pine Street Gym #2334 $1,050.00 (2026-10-27) = $1,050.00, fee $30.75 (2.93%) |

Payments still in Undeposited Funds cannot be matched one by one to a bank line that combines them: an Intuit Community Manager wrote (August 21, 2026) that "QuickBooks looks for a single matching record, not several combined ones." So the Bank Deposit comes first, then the bank feed matches it.

## 3. Record one Bank Deposit per bank line

1. Select + Create.
2. Select Bank Deposit.
3. From the Account dropdown, choose the account you want to put the money into.
4. Select the checkbox for each transaction you want to combine.
5. Confirm the total of the selected transactions matches your actual deposit slip.
6. Select Save and close or Save and new.

Date each deposit to the bank statement. For a fee, add a line under "Add funds to this deposit" in Bank Charges & Fees: "Enter the amount fee as a negative number." Intuit also says: "Don't edit the original transactions in QuickBooks."

## Sources

- [Intuit QuickBooks: Record and make bank deposits in QuickBooks Online, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-deposits/record-make-bank-deposits-quickbooks-online/L2BBZOPdr_US_en_US)
- [Intuit QuickBooks: Export your reports to Excel from QuickBooks Online (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-articles/export-your-reports-to-excel-from-quickbooks-online/00/262097)
- [Intuit QuickBooks: Run a ledger report that shows debits and credits for each transaction, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/profit-loss-reports/create-report-shows-debits-credits-transaction/L1zvqNX0e_US_en_US)
- [Intuit QuickBooks: Deposit payments into the Undeposited Funds account in QuickBooks Online, updated August 24, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/payroll-setup/deposit-payments-undeposited-funds-account-online/L1td0m8Z2_US_en_US)
- [QuickBooks Community: Why can't I find a transaction to match to a bank deposit in QuickBooks Online? (read November 8, 2026)](https://quickbooks.intuit.com/community/banking-4/why-can-t-i-find-a-transaction-to-match-to-a-bank-deposit-in-quickbooks-online-24717)

## Steps

1. **Export the account.** Run Transaction Detail by Account for Undeposited Funds over the dates you are cleaning, export it to Excel and save it as CSV.
2. **Find the sets.** Load the CSV and your bank statement CSV into the tool; each bank deposit gets every set of open payments that adds up to it.
3. **Bank Deposit step 1.** Select + Create.
4. **Bank Deposit step 2.** Select Bank Deposit.
5. **Bank Deposit step 3.** From the Account dropdown, choose the account you want to put the money into.
6. **Bank Deposit step 4.** Select the checkbox for each transaction you want to combine.
7. **Bank Deposit step 5.** Confirm the total of the selected transactions matches your actual deposit slip.
8. **Bank Deposit step 6.** Select Save and close or Save and new.

## Questions

### My chart of accounts says Payments to deposit, not Undeposited Funds.

Intuit says: "This account can be renamed, so check the Detail type column for "Undeposited Funds."" Export the account by the name it has in your file.

### How do I record the processor fee on a deposit?

Intuit: add it under "Add funds to this deposit" with the account Bank Charges & Fees. "Enter the amount fee as a negative number."

## Related

- [QuickBooks Desktop](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/quickbooks-desktop/)
- [Old Undeposited Funds](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/old-years/)
- [QuickBooks built-in tools vs this tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/vs/qbo-built-in-tools/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/quickbooks-online/  
Data as of: 2026-11-08
