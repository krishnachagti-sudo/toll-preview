# Mileage true-up after the July 1, 2026 rate change

Employees reimbursed 72.5 cents for trips driven and paid on or after July 1, 2026 are owed 3.5 cents a mile. In the 3-trip example below, two employees are owed **$26.25** in total: A. Rivera $10.50, B. Chen $15.75.

## A worked trip file

Trips and amounts paid at the old rate, as a payroll export would show them.

| Employee | Trip date | Miles | Paid |
| --- | --- | ---: | ---: |
| A. Rivera | June 22, 2026 | 120 | $87.00 |
| A. Rivera | July 14, 2026 | 300 | $217.50 |
| B. Chen | August 3, 2026 | 450 | $326.25 |

Worked out by the calculator's trip file: the IRS amount for each trip date, what was paid and the difference.

| Employee | Miles | At the IRS rate | Paid | Owed |
| --- | ---: | ---: | ---: | ---: |
| A. Rivera | 420 | $315.00 | $304.50 | $10.50 |
| B. Chen | 450 | $342.00 | $326.25 | $15.75 |
| Total | 870 | $657.00 | $630.75 | $26.25 |

The June 22 trip was paid correctly at 72.5 cents. The July and August trips needed 76 cents.

## What if the allowance was more than the IRS rate?

Paid at 80 cents a mile instead, the same three trips come to $696.00 against $657.00 at the IRS rates: $39.00 over. The calculator splits that the way Pub 463 describes: $657.00 up to the federal rate under code L in W-2 box 12, and $39.00 above it as wages in box 1.

Pub 463: "If your allowance is more than the federal rate, your employer must include the allowance amount up to the federal rate under code L in box 12 of your Form W-2. This amount isn’t taxable. However, the excess allowance will be included in box 1 of your Form W-2."

## How do I run my own file?

Open the [mileage calculator](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/) and upload the trip sheet you already have (CSV), with columns for employee, date, miles and paid amount; a paid date column applies the July 1 rule to advances. The file costs $0.001 a trip row with a $0.25 minimum and returns every row with its rate and source, plus a file of totals per employee for payroll.

> This page works out amounts from the IRS tables and quotes the IRS rules; it is not tax, payroll or legal advice.

## Sources

- [IRS: Internal Revenue Bulletin 2026-29, Announcement 2026-11 (July 13, 2026)](https://www.irs.gov/irb/2026-29_IRB)
- [IRS: Publication 463 (2025), Travel, Gift, and Car Expenses (read November 6, 2026)](https://www.irs.gov/publications/p463)
- [IRS: Standard mileage rates, all years (updated July 28, 2026, read November 6, 2026)](https://www.irs.gov/tax-professionals/standard-mileage-rates)

## Steps

1. **Export the trip sheet.** One row per trip: employee, trip date, miles, and the amount already paid for it. Add the date paid where an allowance was paid before July 1.
2. **Price each trip at the IRS rate for its date.** $0.725 a mile through June 30, 2026, $0.76 from July 1, with the paid-date rule for allowances.
3. **Compare with what was paid, per employee.** The difference is the true-up owed, or the overpayment.
4. **Pay the difference.** Pay what is owed in the next run. Anything paid above the federal rate goes in W-2 box 1 as wages, with the amount up to the federal rate under code L in box 12 (Pub 463).

## Questions

### How much is owed for July 2026 miles paid at 72.5 cents?

3.5 cents a mile: 76 minus 72.5. 300 miles is $10.50.

### What if we paid more than the IRS rate?

Pub 463: "If your allowance is more than the federal rate, your employer must include the allowance amount up to the federal rate under code L in box 12 of your Form W-2. This amount isn’t taxable. However, the excess allowance will be included in box 1 of your Form W-2."

## Related

- [Paid date or trip date](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-allowance-paid-date-rule/)
- [Accountable plan mileage reimbursement](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/accountable-plan-mileage-reimbursement/)
- [Split 2026 trips at July 1](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/split-mileage-at-july-1-2026/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-true-up-july-2026/  
Data as of: 2026-10-31
