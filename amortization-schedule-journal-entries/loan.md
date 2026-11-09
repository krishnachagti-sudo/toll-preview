# Loan amortization journal entries

A $250,000.00 loan at 7.25% over 10 years has a level payment of $2,935.03; the first payment on December 1, 2026 is $1,510.42 interest and $1,424.61 principal, so the entry is debit Loan Payable $1,424.61, debit Interest Expense $1,510.42, credit Checking $2,935.03.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0ATerm+loan%2CLoan%2C250000.00%2C2026-11-01%2C120%2C%2C%2C%2CLoan+Payable%2CInterest+Expense%2CChecking%2C%2C7.25%2C%2C%2C%2C%2C%0D%0A&period=2026-12&from=2026-12&to=2027-11)

## The entries

When the loan is received, November 1, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Checking | $250,000.00 |  |
| Loan Payable |  | $250,000.00 |

Payment 1, December 1, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Loan Payable | $1,424.61 |  |
| Interest Expense | $1,510.42 |  |
| Checking |  | $2,935.03 |

## The first year

Payments 1 to 12

| # | Date | Payment | Interest | Principal | Balance |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | December 1, 2026 | $2,935.03 | $1,510.42 | $1,424.61 | $248,575.39 |
| 2 | January 1, 2027 | $2,935.03 | $1,501.81 | $1,433.22 | $247,142.17 |
| 3 | February 1, 2027 | $2,935.03 | $1,493.15 | $1,441.88 | $245,700.29 |
| 4 | March 1, 2027 | $2,935.03 | $1,484.44 | $1,450.59 | $244,249.70 |
| 5 | April 1, 2027 | $2,935.03 | $1,475.68 | $1,459.35 | $242,790.35 |
| 6 | May 1, 2027 | $2,935.03 | $1,466.86 | $1,468.17 | $241,322.18 |
| 7 | June 1, 2027 | $2,935.03 | $1,457.99 | $1,477.04 | $239,845.14 |
| 8 | July 1, 2027 | $2,935.03 | $1,449.06 | $1,485.97 | $238,359.17 |
| 9 | August 1, 2027 | $2,935.03 | $1,440.09 | $1,494.94 | $236,864.23 |
| 10 | September 1, 2027 | $2,935.03 | $1,431.05 | $1,503.98 | $235,360.25 |
| 11 | October 1, 2027 | $2,935.03 | $1,421.97 | $1,513.06 | $233,847.19 |
| 12 | November 1, 2027 | $2,935.03 | $1,412.83 | $1,522.20 | $232,324.99 |

In the first 12 payments, $17,545.35 goes to interest and $17,675.01 to principal. Over all 120 payments, interest totals $102,202.97; payment 120 is $2,934.40 and clears the balance.

## How the split is worked out

- Interest = opening balance x annual rate / 12: `250000.00 x 7.25% / 12 = 1510.42`.
- Principal = payment - interest: `2935.03 - 1510.42 = 1424.61`.
- The level payment is the annuity formula Excel's PMT uses: `PMT(7.25%/12, 120, -250000)` = $2,935.03.

If the lender's statement shows different interest (daily interest, fees, an odd first period), give the tool the lender's rows instead; the step-by-step is in [splitting a payment into principal and interest](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/loan-principal-interest-split/).

## Sources

- [Intuit QuickBooks: Does QuickBooks Online have an amortization schedule?, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/journal-entries/does-quickbooks-online-have-an-amortization-schedule/00/185786)
- [Microsoft Support: PMT function (read November 8, 2026)](https://support.microsoft.com/en-us/excel/functions/pmt-function)

## Questions

### What is the journal entry when a loan is received?

Debit the bank and credit the loan liability for the amount received: $250,000.00 to Checking and Loan Payable here.

### Why does the interest go down each month?

Interest is worked out on the balance still owed, and every payment lowers it: payment 1 has $1,510.42 of interest, payment 12 has $1,412.83.

## Related

- [Splitting a payment into principal and interest](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/loan-principal-interest-split/)
- [Loan payments in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan/quickbooks-online/)
- [Loan payments in QuickBooks Desktop](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan/quickbooks-desktop/)
- [Loan fees amortization](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan-fees/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan/  
Data as of: 2026-11-08
