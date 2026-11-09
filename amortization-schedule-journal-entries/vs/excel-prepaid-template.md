# Compared with an Excel schedule

Excel's PMT gives the payment on Microsoft's own example, a $10,000.00 loan at 8% over 10 months, as ($1,037.03), and the tool's level payment is the same $1,037.03; the spreadsheet stops at the payment, while the tool splits all 10 payments and writes the entries.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0AMicrosoft+PMT+example%2CLoan%2C10000.00%2C2026-11-01%2C10%2C%2C%2C%2CLoan+Payable%2CInterest+Expense%2CChecking%2C%2C8%2C%2C%2C%2C%2C%0D%0A&period=2026-12&from=2026-12&to=2027-09)

## Microsoft's example, split

Microsoft: PMT "calculates the payment for a loan based on constant payments and a constant interest rate". Its example formula `=PMT(A2/12,A3,A4)` returns ($1,037.03). "Make sure that you are consistent about the units you use for specifying rate and nper."

All ten payments

| # | Date | Payment | Interest | Principal | Balance |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | December 1, 2026 | $1,037.03 | $66.67 | $970.36 | $9,029.64 |
| 2 | January 1, 2027 | $1,037.03 | $60.20 | $976.83 | $8,052.81 |
| 3 | February 1, 2027 | $1,037.03 | $53.69 | $983.34 | $7,069.47 |
| 4 | March 1, 2027 | $1,037.03 | $47.13 | $989.90 | $6,079.57 |
| 5 | April 1, 2027 | $1,037.03 | $40.53 | $996.50 | $5,083.07 |
| 6 | May 1, 2027 | $1,037.03 | $33.89 | $1,003.14 | $4,079.93 |
| 7 | June 1, 2027 | $1,037.03 | $27.20 | $1,009.83 | $3,070.10 |
| 8 | July 1, 2027 | $1,037.03 | $20.47 | $1,016.56 | $2,053.54 |
| 9 | August 1, 2027 | $1,037.03 | $13.69 | $1,023.34 | $1,030.20 |
| 10 | September 1, 2027 | $1,037.07 | $6.87 | $1,030.20 | $0.00 |

## Side by side

Excel's side from Microsoft Support, read November 8, 2026

|  | Excel | This tool |
| --- | --- | --- |
| Loan payment | PMT(rate, nper, pv, \[fv\], \[type\]) | The same annuity formula, to the cent |
| Interest and principal per payment | Further formulas you write (or IPMT and PPMT) | Computed; the last payment clears the balance |
| Prepaids | Amount / months, by hand per row | Equal months, half-month or actual days, with the rounding cent |
| Entries and file | Typed in | Balanced journals and an import file |
| Cost | Already owned | $0.50 per schedule |

## When Excel is enough

- One schedule, one time, with no import needed.
- You want to change the layout freely.

## Sources

- [Microsoft Support: PMT function (read November 8, 2026)](https://support.microsoft.com/en-us/excel/functions/pmt-function)

## Related

- [A prepaid spreadsheet compared](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/spreadsheet/)
- [Splitting a payment into principal and interest](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/loan-principal-interest-split/)
- [The prepaid expense template](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/template/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/vs/excel-prepaid-template/  
Data as of: 2026-11-08
