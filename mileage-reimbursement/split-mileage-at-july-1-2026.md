# Split 2026 mileage at the July 1 rate change

Price each trip at the rate for the day it was driven: 72.5 cents a business mile through June 30, 2026 and 76 cents from July 1. For six trips from June 8 to August 15, **$676.23**: 222 miles at 72.5 cents ($160.95) plus 678 miles at 76 cents ($515.28).

## A worked example

Priced by the calculator at the IRS rate for each trip date.

| Trip date | Miles | Cents | Amount | IRS source |
| --- | ---: | ---: | ---: | --- |
| June 8, 2026 | 64 | 72.5 | $46.40 | IRS IR-2025-128, Notice 2026-10 |
| June 22, 2026 | 120 | 72.5 | $87.00 | IRS IR-2025-128, Notice 2026-10 |
| June 30, 2026 | 38 | 72.5 | $27.55 | IRS IR-2025-128, Notice 2026-10 |
| July 1, 2026 | 38 | 76 | $28.88 | IRS IR-2026-29, Announcement 2026-11 |
| July 14, 2026 | 300 | 76 | $228.00 | IRS IR-2026-29, Announcement 2026-11 |
| August 15, 2026 | 340 | 76 | $258.40 | IRS IR-2026-29, Announcement 2026-11 |

The same trips, totaled per rate period.

| Period | Trips | Miles | Rate | Amount |
| --- | ---: | ---: | --- | ---: |
| January 1 to June 30, 2026 | 3 | 222 | 72.5 cents a mile | $160.95 |
| July 1 to December 31, 2026 | 3 | 678 | 76 cents a mile | $515.28 |
| Total | 6 | 900 |  | $676.23 |

The June 30 and July 1 trips are the same 38 miles: $27.55 and $28.88. Priced all at 72.5 cents, the six trips would come to $652.50, $23.73 short.

## Price your own trips

[Price these trips](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/?mode=trips&trips=2026-06-08%2C64%3B2026-06-22%2C120%3B2026-06-30%2C38%3B2026-07-01%2C38%3B2026-07-14%2C300%3B2026-08-15%2C340)

## How do I split trips in a spreadsheet?

With the trip date in column A and business miles in column E, this gives each trip's amount; sum the column for the total:

```excel
=E2*IF(A2<DATE(2026,7,1),0.725,0.76)
```

To total each period instead, use SUMIFS on the date column, one formula per period:

```excel
=SUMIFS(E:E,A:A,"<"&DATE(2026,7,1))*0.725+SUMIFS(E:E,A:A,">="&DATE(2026,7,1))*0.76
```

Both formulas price by trip date only. They do not apply the paid-date rule for employer allowances, and they treat every row as business miles.

## Does the date paid change the rate?

For a deduction, no: the date driven decides. For an employer's mileage allowance, yes: Announcement 2026-11 keeps the earlier rate for an allowance paid before July 1, 2026. See [the paid-date rule](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-allowance-paid-date-rule/) and, for payroll, [the July 2026 true-up](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-true-up-july-2026/).

> This page works out amounts from the IRS tables and quotes the IRS rules; it is not tax, payroll or legal advice.

## Sources

- [IRS: Standard mileage rates, all years (updated July 28, 2026, read November 6, 2026)](https://www.irs.gov/tax-professionals/standard-mileage-rates)
- [IRS: Internal Revenue Bulletin 2026-29, Announcement 2026-11 (July 13, 2026)](https://www.irs.gov/irb/2026-29_IRB)
- [IRS: Internal Revenue Bulletin 2026-4, Notice 2026-10 (January 20, 2026)](https://www.irs.gov/irb/2026-04_IRB)

## Steps

1. **Sort the trips by date driven.** Each trip takes the rate for the day it was driven. A trip from June 30 into July 1 is two lines, one per day.
2. **Add up the miles in each rate period.** Miles January 1 to June 30, 2026 in one total; miles July 1 to December 31, 2026 in the other.
3. **Multiply each total by its rate.** Business: $0.725 a mile before July 1 and $0.76 from July 1. Medical and moving: $0.205, then $0.235. Charity: $0.14 all year.
4. **Add the two amounts.** Add parking and tolls on top: the standard mileage rate does not include them.
5. **For employer allowances, check the date paid.** An allowance paid before July 1 keeps the earlier rate even for later miles (Announcement 2026-11).

## Questions

### How do I calculate mileage for trips on both sides of July 1, 2026?

Add the miles before July 1 and multiply by $0.725, add the miles from July 1 and multiply by $0.76, then add the two. 900 business miles, 222 before July 1, 2026 and 678 from July 1: 222 x $0.725 + 678 x $0.76 = $676.23.

### How much is 340 miles at 76 cents?

$258.40 (340 x $0.76), for business miles driven on or after July 1, 2026.

### What if I price the whole quarter at one rate?

For the example on this page, 900 miles all at 72.5 cents would be $652.50; split by date it is $676.23.

## Related

- [IRS mileage rate 2026](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/irs-mileage-rate-2026/)
- [Paid date or trip date: the allowance rule](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-allowance-paid-date-rule/)
- [Payroll true-up for July 2026 trips](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-true-up-july-2026/)
- [Mileage log template](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-log-template/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/split-mileage-at-july-1-2026/  
Data as of: 2026-10-31
