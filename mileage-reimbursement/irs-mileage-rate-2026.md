# IRS mileage rate 2026

The 2026 IRS business mileage rate is 72.5 cents a mile for miles driven January 1 to June 30 and 76 cents from July 1 to December 31, 2026; the medical and moving rate goes from 20.5 to 23.5 cents and the charity rate stays at 14 cents.

- Business, January 1 to June 30: 72.5 cents
- Business, from July 1: 76 cents
- Medical or moving: 20.5 then 23.5 cents
- Charity, all year: 14 cents

## Your 2026 miles at both rates

[Work out my amount](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/?mode=split&purpose=business&year=2026&m1=2600&m2=1600)

## The 2026 rates by period

Cents per mile. Source: the IRS standard mileage rates table.

| Purpose | January 1 to June 30, 2026 | July 1 to December 31, 2026 |
| --- | ---: | ---: |
| Business (self-employed, employer allowances) | 72.5 | 76 |
| Medical | 20.5 | 23.5 |
| Moving (active-duty military, certain intelligence-community moves) | 20.5 | 23.5 |
| Charity (fixed by IRC 170(i)) | 14 | 14 |
| IRS source | IR-2025-128, Notice 2026-10 | IR-2026-29, Announcement 2026-11 |

4,200 business miles, 2,600 before July 1, 2026 and 1,600 from July 1: 2,600 x $0.725 + 1,600 x $0.76 = $3,101.00. Miles driven over the change are split by the date of each leg: a trip from June 30 to July 1 is two lines.

## What common mileages are worth in 2026

Business miles at each 2026 rate, and the difference the July change makes.

| Miles | At 72.5 cents (to June 30) | At 76 cents (from July 1) | Difference |
| --- | ---: | ---: | ---: |
| 100 | $72.50 | $76.00 | $3.50 |
| 250 | $181.25 | $190.00 | $8.75 |
| 500 | $362.50 | $380.00 | $17.50 |
| 1,000 | $725.00 | $760.00 | $35.00 |
| 5,000 | $3,625.00 | $3,800.00 | $175.00 |
| 10,000 | $7,250.00 | $7,600.00 | $350.00 |

## Employer allowances: the date paid matters too

Announcement 2026-11 applies the new rates to mileage allowances "paid both (1) to an employee on or after July 1, 2026, and (2) for transportation expenses paid or incurred by the employee on or after July 1, 2026." The earlier rates still apply to allowances paid before July 1, or for miles driven before July 1.

Worked out by the calculator from the trip date and the date the allowance was paid.

| Trip | Paid | Rate | Why |
| --- | --- | ---: | --- |
| June 28, 2026 | July 5, 2026 | 72.5 cents | Driven before July 1 |
| July 2, 2026 | June 30, 2026 | 72.5 cents | Paid before July 1, as an advance |
| July 14, 2026 | July 20, 2026 | 76 cents | Driven and paid from July 1 |

Payroll that kept paying 72.5 cents for July trips owes the employee 3.5 cents a mile on those trips. The calculator's trip file works out that true-up per employee from the spreadsheet you already have.

## In a spreadsheet

With the trip date in column A and the business miles in column E, this gives each 2026 trip's amount in Excel or Google Sheets:

```excel
=E2*IF(A2<DATE(2026,7,1),0.725,0.76)
```

It prices by trip date only. For an allowance paid before July 1 for later miles, use the earlier rate.

## Every IRS rate since 2011

Cents per mile, from the IRS table. 2011, 2022 and 2026 changed mid-year.

| Period | Business | Medical or moving | Charity | IRS source |
| --- | ---: | ---: | ---: | --- |
| July 1 to December 31, 2026 | 76 | 23.5 | 14 | IR-2026-29 |
| January 1 to June 30, 2026 | 72.5 | 20.5 | 14 | IR-2025-128 |
| 2025 | 70 | 21 | 14 | IR-2024-312 |
| 2024 | 67 | 21 | 14 | IR-2023-239 |
| 2023 | 65.5 | 22 | 14 | IR-2022-234 |
| July 1 to December 31, 2022 | 62.5 | 22 | 14 | IR-2022-124 |
| January 1 to June 30, 2022 | 58.5 | 18 | 14 | IR-2021-251 |
| 2021 | 56 | 16 | 14 | IR-2020-279 |
| 2020 | 57.5 | 17 | 14 | IR-2019-215 |
| 2019 | 58 | 20 | 14 | IR-2018-251 |
| 2018 | 54.5 | 18 | 14 | IR-2017-204 and IR-2018-127 |
| 2017 | 53.5 | 17 | 14 | IR-2016-169 |
| 2016 | 54 | 19 | 14 | IR-2015-137 |
| 2015 | 57.5 | 23 | 14 | IR-2014-114 |
| 2014 | 56 | 23.5 | 14 | IR-2013-95 |
| 2013 | 56.5 | 24 | 14 | IR-2012-95 |
| 2012 | 55.5 | 23 | 14 | IRB-2012-02 |
| July 1 to December 31, 2011 | 55.5 | 23.5 | 14 | IR-2011-69 |
| January 1 to June 30, 2011 | 51 | 19 | 14 | IR-2010-119 |

Rates for 2027 are added here once the IRS announces them, usually in December: [IRS mileage rate 2027](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/irs-mileage-rate-2027/).

> The standard mileage rate is optional: actual car expenses may be used instead. This page computes amounts from the IRS table; it is not tax or legal advice.

## Sources

- [IRS: Standard mileage rates, all years (updated July 28, 2026, read October 31, 2026)](https://www.irs.gov/tax-professionals/standard-mileage-rates)
- [IRS: Internal Revenue Bulletin 2026-29, Announcement 2026-11 (July 13, 2026)](https://www.irs.gov/irb/2026-29_IRB)
- [IRS: Internal Revenue Bulletin 2026-4, Notice 2026-10 (January 20, 2026)](https://www.irs.gov/irb/2026-04_IRB)

## Questions

### What is the IRS mileage rate for 2026?

72.5 cents per business mile for January 1 to June 30, 2026 and 76 cents from July 1 to December 31, 2026.

### Did the IRS mileage rate change in July 2026?

Yes. From July 1, 2026 the business rate rose from 72.5 to 76 cents and the medical and moving rate from 20.5 to 23.5 cents (Announcement 2026-11, IR-2026-29); charity stayed at 14 cents.

### Which rate do I use for a trip in June 2026?

The rate for the period the miles were driven: June miles use 72.5 cents. An employer allowance for June miles also stays at 72.5 cents when it is paid in July.

### What was the IRS mileage rate for 2025?

70 cents per business mile, 21 cents medical or moving and 14 cents charity (IR-2024-312).

### How much is 500 miles at 76 cents?

$380.00 (500 x $0.76).

### How do I calculate mileage reimbursement for 2026?

Split the miles at July 1, multiply the miles before by $0.725 and the miles from July 1 by $0.76, then add. 4,200 business miles, 2,600 before July 1, 2026 and 1,600 from July 1: 2,600 x $0.725 + 1,600 x $0.76 = $3,101.00.

## Related

- [Medical mileage rate 2026](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/medical-mileage-rate-2026/)
- [GSA mileage rate 2026 for federal travel](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/gsa-mileage-rate-2026/)
- [Mileage log template with the July 1 switch](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-log-template/)
- [IRS mileage log requirements](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/irs-mileage-log-requirements/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/irs-mileage-rate-2026/  
Data as of: 2026-10-31  
CSV: https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/irs-mileage-rate-2026.csv
