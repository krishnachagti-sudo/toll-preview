# Record loan payments in QuickBooks Desktop

In QuickBooks Desktop, record each loan payment in Write Checks with two lines: the principal to the liability account and the interest to an expense account; for this $120,000.00 loan at 6% over 20 years, the $859.72 payment on December 1, 2026 is $259.72 principal and $600.00 interest, and 2027's twelve payments hold $7,096.83 of interest.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0ABuilding+mortgage%2CLoan%2C120000.00%2C2026-11-01%2C240%2C%2C%2C%2CMortgage+Payable%2CMortgage+Interest%2CChecking%2C%2C6%2C%2C%2C%2C%2C%0D%0A&period=2027-01&from=2027-01&to=2027-12)

## The Write Checks split

1. Once: "Set up a liability account for your loan." Also set up an expense account for the interest.
2. In Write Checks: "In the $ field, enter the payment for the principal amount."
3. On the Expenses tab, first line: "Enter the name of the liability account you created in Step 1."
4. Second line, the interest expense account: "Enter the payment amount for the loan interest."
5. To repeat the check monthly: "Select Memorize." Change the two amounts each month: they shift as the balance falls.

## The amounts for 2027

Each 2027 payment, split

| Date | Payment | Principal | Interest | Balance |
| --- | ---: | ---: | ---: | ---: |
| January 1, 2027 | $859.72 | $261.02 | $598.70 | $119,479.26 |
| February 1, 2027 | $859.72 | $262.32 | $597.40 | $119,216.94 |
| March 1, 2027 | $859.72 | $263.64 | $596.08 | $118,953.30 |
| April 1, 2027 | $859.72 | $264.95 | $594.77 | $118,688.35 |
| May 1, 2027 | $859.72 | $266.28 | $593.44 | $118,422.07 |
| June 1, 2027 | $859.72 | $267.61 | $592.11 | $118,154.46 |
| July 1, 2027 | $859.72 | $268.95 | $590.77 | $117,885.51 |
| August 1, 2027 | $859.72 | $270.29 | $589.43 | $117,615.22 |
| September 1, 2027 | $859.72 | $271.64 | $588.08 | $117,343.58 |
| October 1, 2027 | $859.72 | $273.00 | $586.72 | $117,070.58 |
| November 1, 2027 | $859.72 | $274.37 | $585.35 | $116,796.21 |
| December 1, 2027 | $859.72 | $275.74 | $583.98 | $116,520.47 |

The tool's import files are for QuickBooks Online and Xero; for Desktop, key the split from this table, or use the generic CSV with your own import tool.

## Sources

- [Intuit QuickBooks: Manually track loans in QuickBooks Desktop, updated August 18, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/chart-accounts/manually-track-loans-quickbooks-desktop/L6UGYFBQX_US_en_US)
- [Intuit QuickBooks: QuickBooks Loan Manager, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/vendor-loans/quickbooks-loan-manager/L7goT1WgX_US_en_US)
- [Microsoft Support: PMT function (read November 8, 2026)](https://support.microsoft.com/en-us/excel/functions/pmt-function)

## Questions

### Is Loan Manager still in QuickBooks Desktop?

Intuit: "Loan Manager was discontinued in QuickBooks Desktop 2022." "You can still use Loan Manager in previous, currently supported versions."

## Related

- [Loan payments in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan/quickbooks-online/)
- [Splitting a payment into principal and interest](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/loan-principal-interest-split/)
- [Loan amortization journal entries](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/loan/quickbooks-desktop/  
Data as of: 2026-11-08
