# Split a loan payment into principal and interest

Interest is the opening balance times the periodic rate and principal is the rest of the payment: on $50,000.00 at 6.5% over 60 months the payment is $978.31, payment 1 is $270.83 interest and $707.48 principal, payment 2 is $267.00 and $711.31, and payment 60 of $978.16 leaves $0.00.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0ABusiness+loan%2CLoan%2C50000.00%2C2026-11-10%2C60%2C%2C%2C%2CLoan+Payable%2CInterest+Expense%2CChecking%2C%2C6.5%2C%2C%2C%2C%2C%0D%0A&period=2026-12&from=2026-12&to=2027-11)

## The first payments

Payments 1 to 6

| # | Date | Payment | Interest | Principal | Balance |
| --- | --- | ---: | ---: | ---: | ---: |
| 1 | December 10, 2026 | $978.31 | $270.83 | $707.48 | $49,292.52 |
| 2 | January 10, 2027 | $978.31 | $267.00 | $711.31 | $48,581.21 |
| 3 | February 10, 2027 | $978.31 | $263.15 | $715.16 | $47,866.05 |
| 4 | March 10, 2027 | $978.31 | $259.27 | $719.04 | $47,147.01 |
| 5 | April 10, 2027 | $978.31 | $255.38 | $722.93 | $46,424.08 |
| 6 | May 10, 2027 | $978.31 | $251.46 | $726.85 | $45,697.23 |

## The monthly entry

Payment 1, December 10, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Loan Payable | $707.48 |  |
| Interest Expense | $270.83 |  |
| Checking |  | $978.31 |

## 30/360 or actual days

Many lenders charge interest for the actual days since the last payment. Payment 1 here covers 30 days: on actual/365 its interest is $267.12 against $270.83 on 30/360, and a February payment differs the other way ($268.20 against $263.15 for payment 3). Use the lender's convention, or give the tool the lender's own rows.

## The check

The principal column adds up to the loan: $50,000.00 over 60 payments, with $8,698.45 of interest. The level payment is the same as Excel's PMT(rate, nper, pv, \[fv\], \[type\]): $978.31.

## Sources

- [Microsoft Support: PMT function (read November 8, 2026)](https://support.microsoft.com/en-us/excel/functions/pmt-function)
- [Intuit QuickBooks: Does QuickBooks Online have an amortization schedule?, updated August 5, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/journal-entries/does-quickbooks-online-have-an-amortization-schedule/00/185786)

## Steps

1. **Gather the terms.** Amount $50,000.00, annual rate 6.5%, 60 monthly payments, first payment December 10, 2026.
2. **Interest.** Opening balance x rate / 12: 50000.00 x 6.5% / 12 = 270.83.
3. **Principal.** Payment - interest: 978.31 - 270.83 = 707.48.
4. **New balance.** 50000.00 - 707.48 = 49292.52, the opening balance for payment 2.
5. **Last payment.** Payment 60 is whatever clears the balance: $978.16.

## Related

- [Loan amortization journal entries](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan/)
- [Loan payments in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan/quickbooks-online/)
- [Loan fees amortization](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan-fees/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/loan-principal-interest-split/  
Data as of: 2026-11-08
