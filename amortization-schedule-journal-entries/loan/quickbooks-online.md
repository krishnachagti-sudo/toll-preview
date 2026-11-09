# Record loan payments in QuickBooks Online

QuickBooks Online has no amortization schedule (Intuit says it will have to be done through manual transactions); for this $40,000.00 loan at 5.9% over 48 months, payment 1 on November 20, 2026 splits into $740.90 principal and $196.67 interest, and the import file posts all 48 payments at once.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0AVehicle+loan%2CLoan%2C40000.00%2C2026-10-20%2C48%2C%2C%2C%2CVehicle+Loan%2CInterest+Expense%2CChecking%2C%2C5.9%2C%2C%2C%2C%2C%0D%0A&period=2026-11&from=2026-11&to=2027-10)

## The split check, as Intuit describes it

1. Write the check (or expense) for the full payment from the bank account.
2. Line 1: the loan liability account, with the principal ($740.90 for payment 1).
3. Line 2: "On line 2, enter the interest expense account and the interest amount under Amount." ($196.67).
4. Intuit: "The amount on your check must equal the total of the lines listing principal and interest."

The first 12 payments

| # | Date | Payment | Interest | Principal | Balance |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | November 20, 2026 | $937.57 | $196.67 | $740.90 | $39,259.10 |
| 2 | December 20, 2026 | $937.57 | $193.02 | $744.55 | $38,514.55 |
| 3 | January 20, 2027 | $937.57 | $189.36 | $748.21 | $37,766.34 |
| 4 | February 20, 2027 | $937.57 | $185.68 | $751.89 | $37,014.45 |
| 5 | March 20, 2027 | $937.57 | $181.99 | $755.58 | $36,258.87 |
| 6 | April 20, 2027 | $937.57 | $178.27 | $759.30 | $35,499.57 |
| 7 | May 20, 2027 | $937.57 | $174.54 | $763.03 | $34,736.54 |
| 8 | June 20, 2027 | $937.57 | $170.79 | $766.78 | $33,969.76 |
| 9 | July 20, 2027 | $937.57 | $167.02 | $770.55 | $33,199.21 |
| 10 | August 20, 2027 | $937.57 | $163.23 | $774.34 | $32,424.87 |
| 11 | September 20, 2027 | $937.57 | $159.42 | $778.15 | $31,646.72 |
| 12 | October 20, 2027 | $937.57 | $155.60 | $781.97 | $30,864.75 |

## When the bank feed already posted the payment

A common shortcut is to add each bank-feed payment to the loan account in full. Then the loan balance is too low by the interest, and interest expense is missing. The fix is one entry per payment: debit Interest Expense, credit the loan account, $196.67 for payment 1. In the tool, set Loan entries to interest only.

## All payments at once: the import file

```csv
Journal No.,Journal Date,Account Name,Debits,Credits,Description,Name
AM-20261120,11/20/2026,Vehicle Loan,740.90,,"Vehicle loan: payment 1 of 48, interest $196.67, principal $740.90",
AM-20261120,11/20/2026,Interest Expense,196.67,,"Vehicle loan: payment 1 of 48, interest $196.67, principal $740.90",
AM-20261120,11/20/2026,Checking,,937.57,"Vehicle loan: payment 1 of 48, interest $196.67, principal $740.90",
AM-20261220,12/20/2026,Vehicle Loan,744.55,,"Vehicle loan: payment 2 of 48, interest $193.02, principal $744.55",
AM-20261220,12/20/2026,Interest Expense,193.02,,"Vehicle loan: payment 2 of 48, interest $193.02, principal $744.55",
AM-20261220,12/20/2026,Checking,,937.57,"Vehicle loan: payment 2 of 48, interest $193.02, principal $744.55",
... 30 more lines
```

- Intuit's steps: Open Settings, then go to Import Data. Select Journal Entries. Select Browse, choose your CSV file, then Open and Next. Map your spreadsheet headers to the QuickBooks fields. Select Next, then Start import, then Done.
- Accounts must exist first: "If your spreadsheet has new accounts, be sure to add them in your chart of accounts before importing."

## Sources

- [Intuit QuickBooks: Does QuickBooks Online have an amortization schedule?, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/journal-entries/does-quickbooks-online-have-an-amortization-schedule/00/185786)
- [Intuit QuickBooks: Import journal entries into QuickBooks Online, updated August 4, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)

## Questions

### Does QuickBooks Online have an amortization schedule?

No. Intuit: "Amortization of debts and assets in QuickBooks Online will have to be done through manual transactions".

### Can I make the loan payment recurring?

Intuit suggests it only when the amounts are going to always be the same; a loan's interest falls every month, so a recurring entry with fixed amounts drifts from the lender's balance. Import the computed payments instead.

### How do I record a mortgage payment in QuickBooks Online?

The same way: principal to the mortgage liability, interest to mortgage interest expense. Escrow for taxes and insurance, if the payment includes it, is a third line to an escrow account.

## Related

- [Loan payments in QuickBooks Desktop](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan/quickbooks-desktop/)
- [The import file layout](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/journal-entry-import-layout/)
- [QuickBooks recurring journal compared](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/quickbooks-recurring-journal/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan/quickbooks-online/  
Data as of: 2026-11-08
