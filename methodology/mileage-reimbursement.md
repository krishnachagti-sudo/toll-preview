# How mileage reimbursement is calculated: IRS rates

Each trip is priced at the rate in force on its date, from the IRS standard mileage table (loaded from 2011 to 2026), so a year with a mid-year change is split at the change date. Miles are kept in hundredths and rates in tenths of a cent, so every amount is exact and rounded to the cent once per rate.

## What does the mileage reimbursement and irs mileage log compute?

The tool prices trips, totals them by period, purpose and employee, works out what an employer still owes against what was paid, splits an allowance above the federal rate for the W-2, and checks a vehicle log against the record elements of IRS Publication 463.

Operations (the op field):

- `rate`: The rate for one date and purpose, with the period it covers and the document it comes from. With paidDate it applies the paid-date rule below.
- `rates`: The full IRS and GSA tables with their sources.
- `calculate`: Prices up to 25 trips and returns miles, rate and amount by rate period and purpose.
- `batch`: Prices a trip sheet of up to 5,000 rows (rows or csv), totals it per employee, works out the true-up against amounts already paid, and the W-2 box 12 code L and box 1 split.
- `log`: Builds one vehicle's log for a tax year as PDF and CSV, with the completeness checks.

Inputs:

- `date, endDate, miles`: The trip date (a trip may span several days within one rate period), and miles, accepted as numbers or text such as "1,234.5".
- `purpose`: business (default), medical, moving, charity, or one of the GSA purposes for federal travel.
- `paidDate, paidAmount, paidRate`: When and how much an employer already paid, for the paid-date rule and the true-up.
- `employerRate`: Your own rate in cents, or a schedule of rates by effective date, for batch.
- `parking, tolls, odometerStart, odometerEnd, recordedOn`: Extras that are added to the total, and the record fields the log checks.

Outputs:

- rate, its period and its source document for each line
- amounts by period and purpose, and a one-line sentence such as "2,600 x $0.725 + 1,600 x $0.76 = $3,101.00"
- for batch: due, paid, trueUp, box12CodeL and box1Wages per employee
- for log: flags, each with a code and the Publication 463 reason

## How is it calculated, step by step?

1. A purpose is read for each trip. Business is the default. Business, medical, moving and charity use the IRS table. The GSA purposes use the GSA table for privately owned vehicles.
2. The date selects the rate period: each period runs from its date to the day before the next period. The IRS business, medical and moving rates are held in tenths of a cent (72.5 cents is 725 mills). The charity rate is 14 cents, fixed by section 170(i) of the Internal Revenue Code.
3. If a paidDate is given for a business trip and the trip date falls in a period whose announcement carries a paid-date rule, a mileage allowance paid before the period starts keeps the previous period's rate. This is the rule of Announcement 2011-40 and, for 2026, Announcement 2026-11.
4. The exact amount of a trip is miles times rate. Miles are held in hundredths and money as micro-dollars, so nothing is rounded along the way.
5. Totals are formed by adding the miles at each rate and rounding miles times rate to the cent once per rate. This is the way a deduction is figured, and it avoids rounding every trip.
6. For an employer sheet, due is miles times the employer rate if one is given and the IRS rate otherwise. The true-up is what is due on the trips already paid, minus the amount paid.
7. An allowance above the IRS rate on business trips is split: the amount up to the federal rate goes in W-2 box 12 under code L, and the excess goes in box 1 (Publication 463).
8. The log compares each entry with the record elements of Publication 463 Table 5-1 (date, destination, business purpose, mileage, total miles for the year) and flags what is missing.

## Which edge cases does it handle?

- Mid-year rate change: for 2026 the business rate is 72.5 cents to June 30 and 76 cents from July 1. A trip that spans the change is refused with a message to enter the miles before and after as two lines.
- Paid-date rule: a trip on June 28, 2026 reimbursed on July 5 stays at 72.5 cents.
- The 2011 and 2022 mid-year changes are in the table and checked.
- Medical, moving and charity rates are not changed by the paid-date rule, which applies to business allowances.
- GSA does not list every rate for every date (the relocation rate is listed only from a later year than the car rate); asking for a rate GSA does not give for that date is refused, naming the date it starts.
- Airplane distances in nautical miles are converted to statute miles with GSA's factor 1.15077945, rounded to the hundredth.
- Log flags: missing destination or purpose, odometer reversed, overlapping or off by 100 miles or more, a trip recorded more than 7 days later, a trip matching the home and workplace you gave (commuting), duplicates, and a year with no odometer total.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**4,200 business miles in 2026, split at the July 1 change**

```json
{
  "op": "calculate",
  "trips": [
    {
      "date": "2026-01-01",
      "endDate": "2026-06-30",
      "miles": 2600
    },
    {
      "date": "2026-07-01",
      "endDate": "2026-12-31",
      "miles": 1600
    }
  ]
}
```

4,200 business miles in 2026, split at the July 1 change

| Result | Value |
| --- | --- |
| 2026-01-01 to 2026-06-30 | 2600 miles at 72.5 cents a mile = $1,885.00 |
| 2026-07-01 to 2026-12-31 | 1600 miles at 76 cents a mile = $1,216.00 |
| total | $3,101.00 |

**Paid after the change for a trip before it**

```json
{
  "op": "rate",
  "date": "2026-06-28",
  "paidDate": "2026-07-05",
  "purpose": "business"
}
```

Paid after the change for a trip before it

| Result | Value |
| --- | --- |
| rate | 72.5 cents a mile |
| period | January 1 to June 30, 2026 |
| source | IRS IR-2025-128, Notice 2026-10 |
| basis | trip-date |

## What does it not do?

- Rates are loaded from 2011-01-01 through 2026-12-31; a date before or after is refused and never guessed. GSA rates are known through 2026-12-31.
- The tool computes amounts from the trips you enter. It does not decide which trips are business, medical or charity, or whether a log is adequate.
- Medical and charity amounts are inputs to Schedule A. Deduction limits are not applied, and most W-2 employees cannot deduct unreimbursed mileage.
- The standard mileage rate is optional: actual expenses may be used instead. Five or more vehicles in business use at the same time rule it out, and the log flags that when you say so.
- A log is for one vehicle. A file naming several vehicles is refused.

## Where does the data come from, and how fresh is it?

IRS rates were read 2026-10-31 from a page updated 2026-07-28. GSA rates come from a page updated 2026-10-23.

- [IRS: Standard mileage rates (Mileage rates for all years)](https://www.irs.gov/tax-professionals/standard-mileage-rates)
- [GSA: Privately owned vehicle (POV) mileage reimbursement rates](https://www.gsa.gov/travel/plan-a-trip/transportation-airfare-rates-pov-rates-etc/privately-owned-vehicle-pov-mileage-reimbursement)
- [IRS: Internal Revenue Bulletin 2026-29 (July 13, 2026), Announcement 2026-11](https://www.irs.gov/irb/2026-29_IRB)
- [IRS: Internal Revenue Bulletin 2026-4 (January 20, 2026), Notice 2026-10](https://www.irs.gov/irb/2026-04_IRB)
- [IRS: Publication 463 (2025), Travel, Gift, and Car Expenses](https://www.irs.gov/publications/p463)

[All sources, editions and read dates](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The stored IRS table is compared period by period with the IRS table recorded in the test, and every row of the GSA table by the date travel began. The 2026 change, the paid-date rule from Announcement 2026-11 and the 2011 and 2022 mid-year changes are checked, and a worked example is reproduced: 4,200 miles split at July 1 is 2,600 x $0.725 + 1,600 x $0.76 = $3,101.00.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) list what each test suite asserts.

[Open the Mileage reimbursement and IRS mileage log tool](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/).

## Questions

### Is there any AI in the mileage reimbursement and irs mileage log answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the mileage reimbursement and irs mileage log refuse to answer?

Rates are loaded from 2011-01-01 through 2026-12-31; a date before or after is refused and never guessed. GSA rates are known through 2026-12-31. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Mileage reimbursement and IRS mileage log tool](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Mileage log requirements](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/irs-mileage-log-requirements/)
- [Mileage log template](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/mileage-log-template/)
- [IRS mileage rates 2026](https://krishnachagti-sudo.github.io/toll-preview/mileage-reimbursement/irs-mileage-rate-2026/)
- [IRS mileage rate history](https://krishnachagti-sudo.github.io/toll-preview/irs-mileage-rate-history/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/mileage-reimbursement/  
Data as of: 2026-11-04
