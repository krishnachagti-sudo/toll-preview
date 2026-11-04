# How the IFTA return is calculated: Form 9740 method

The return follows Oregon DOT Form 735-9740: fleet MPG is total miles divided by total gallons, taxable gallons in each jurisdiction are its taxable miles divided by that MPG, and tax is net taxable gallons times the quarter's rate. Final matrix rates are held for 4th Quarter 2025 to 3rd Quarter 2026.

## What does the ifta quarterly return calculator compute?

The tool works out an IFTA quarterly return, from totals by jurisdiction or from trip sheets and fuel receipts. It reconciles odometer readings, checks each record against the IFTA distance and fuel record elements, and works out due dates, interest and the late penalty.

Operations (the op field):

- `estimate`: One fuel type from totals by jurisdiction: miles, taxable miles, tax-paid gallons and all fuel put in the tanks. Returns fleet MPG, each jurisdiction's line and the net.
- `check`: Reconciles a trip sheet and receipts and checks the records, returning counts only.
- `return`: The full return for a licensee and quarter across all fuel types, as a PDF and a CSV, with the reconciliation and the record check.
- `rates`: The rates on file by quarter, jurisdiction and fuel, with source and cross-check.
- `due-dates`: The four due dates in a year, moved off weekends.
- `late-cost`: Interest and penalty for a return filed late.

Inputs:

- `quarter`: Written like 2026Q3. A quarter with no rate table on file is refused.
- `fuel, rows`: The fuel type and, for each jurisdiction, miles, taxable miles (default all miles) and tax-paid gallons.
- `nonIftaMiles, totalGallons`: Miles in Alaska, Hawaii, D.C., the territories or Mexico, and all fuel put in the tanks wherever bought.
- `vehicles, trips, receipts`: For check and return: units with fuel type, trips with odometer readings and miles by jurisdiction, and receipts with gallons and jurisdiction.
- `filedOn, lines`: For late-cost: the filing date and the tax or credit by jurisdiction.

Outputs:

- mpg and each jurisdiction line: taxable gallons, net taxable gallons, rate, tax and surcharge
- netDue, with a credit shown as a negative figure
- dueDate with the statutory date and the date it moves to
- reconciliation and recordCheck for trip sheets

## How is it calculated, step by step?

1. Miles and gallons are rounded to whole numbers (525.5 becomes 526).
2. Fleet MPG for a fuel type is total miles (IFTA plus non-IFTA) divided by total gallons, carried to three decimals (cut, not rounded) and then rounded half up to two decimals (6.155 becomes 6.16).
3. Taxable gallons in a jurisdiction are its taxable miles divided by that MPG, rounded to a whole number.
4. Net taxable gallons are taxable gallons minus the tax-paid gallons bought there. Tax is net taxable gallons times the quarter's rate, in dollars and cents. A negative figure is a credit.
5. A surcharge (the Indiana, Kentucky and Virginia rows of the matrix) is taxable gallons times the surcharge rate, with no credit for fuel bought there.
6. Rates are held as ten-thousandths of a dollar and money as whole cents, so every step is exact integer arithmetic. The rate table is the one for the same quarter and year as the return.
7. The due date is the last day of the month after the quarter. If it falls on a Saturday or Sunday it moves to the next business day (Virginia DMV).
8. Interest on a late return is the tax due on each line times the monthly rate for each month or part of a month late, never on credits. The penalty is the greater of $50 or 10% of the net tax.

## Which edge cases does it handle?

- Weekend due dates: 31 October 2026 is a Saturday, so the third quarter 2026 return is due Monday, 2 November 2026. 31 January 2027 is a Sunday, so the fourth quarter is due Monday, 1 February 2027.
- Part of a month is a month: a return filed one day late is one month late for interest.
- Credits: a jurisdiction where you bought more fuel than you used shows a negative line and earns no interest.
- Rounding is the form's: 6.155 MPG is 6.16, and gallons are whole numbers.
- Interest rates change by period (the Idaho State Tax Commission table is held from 2019); each month late uses the rate for that month.
- Receipts bought without fuel tax count in total fuel but earn no credit. Odometer gaps between trips are reconciled per unit.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Third quarter 2026, diesel, from totals by state**

```json
{
  "op": "estimate",
  "quarter": "2026Q3",
  "fuel": "special_diesel",
  "rows": [
    {
      "jurisdiction": "MO",
      "miles": 670,
      "taxPaidGallons": 50
    },
    {
      "jurisdiction": "IL",
      "miles": 260,
      "taxPaidGallons": 160
    },
    {
      "jurisdiction": "IN",
      "miles": 250
    },
    {
      "jurisdiction": "KY",
      "miles": 380
    },
    {
      "jurisdiction": "WV",
      "miles": 360
    },
    {
      "jurisdiction": "VA",
      "miles": 370,
      "taxPaidGallons": 150
    },
    {
      "jurisdiction": "OK",
      "miles": 500,
      "taxPaidGallons": 70
    },
    {
      "jurisdiction": "TX",
      "miles": 270,
      "taxPaidGallons": 60
    },
    {
      "jurisdiction": "TN",
      "miles": 1290,
      "taxPaidGallons": 200
    }
  ],
  "totalGallons": 690
}
```

Third quarter 2026, diesel, from totals by state

| Result | Value |
| --- | --- |
| fleet MPG | 6.30 |
| Kentucky | 380 miles, 60 taxable gallons, tax $13.20, surcharge $6.30 |
| Illinois | 41 taxable gallons less 160 paid is -119, tax -$87.82 |
| net | -$28.73 |
| due | 2026-11-02 |

**Due dates for 2026**

```json
{
  "op": "due-dates",
  "year": 2026
}
```

Due dates for 2026

| Result | Value |
| --- | --- |
| 2026Q1 | 2026-04-30 |
| 2026Q2 | 2026-07-31 |
| 2026Q3 | 2026-10-31 moved to 2026-11-02 |
| 2026Q4 | 2027-01-31 moved to 2027-02-01 |

**A second quarter 2026 return filed September 15, 2026**

```json
{
  "op": "late-cost",
  "quarter": "2026Q2",
  "filedOn": "2026-09-15",
  "lines": [
    {
      "jurisdiction": "TN",
      "tax": 120.5
    },
    {
      "jurisdiction": "KY",
      "tax": 64.1
    },
    {
      "jurisdiction": "IL",
      "tax": -30.25
    }
  ]
}
```

A second quarter 2026 return filed September 15, 2026

| Result | Value |
| --- | --- |
| months late | 2 |
| net tax | $154.35 |
| interest | $2.77 |
| penalty | $50.00 |
| total | $52.77 |

## What does it not do?

- Rates are final rates only, by quarter, from 4th Quarter 2025 to 3rd Quarter 2026. A quarter that is not on file is refused, not guessed.
- Only fuels with a computed method are accepted. LNG, CNG, electricity, hydrogen and hythane are refused with the reason: the matrix copies give a rate but not the unit it applies to.
- Rounding follows Oregon DOT Form 9740. Your base jurisdiction may compute or round differently, and its return governs.
- It is a calculation, not tax or legal advice. Diesel exhaust fluid and fuel for a separate reefer tank are not IFTA fuel.
- Due dates move only for weekends: the four statutory dates are never US federal holidays.

## Where does the data come from, and how fresh is it?

Rates are held by quarter, 4th Quarter 2025 to 3rd Quarter 2026, all final, read 2026-11-02. Rules were read 2026-11-02.

- [Oregon DOT, IFTA Tax Return Form 735-9740 and its filing instructions (03-26)](https://www.oregon.gov/odot/forms/motcarr/9740.pdf)
- [Virginia DMV, IFTA tax returns](https://www.dmv.virginia.gov/businesses/motor-carriers/ifta/tax)
- [Idaho State Tax Commission, IFTA reporting step 6 (interest)](https://tax.idaho.gov/taxes/product-excise-taxes/fuels-taxes-and-fees/consumer-fuels/ifta-licenses/ifta-reporting/idaho-ifta-reporting-step-6/)
- [Idaho State Tax Commission, IFTA licenses: records (IVDR)](https://tax.idaho.gov/?p=1239)
- [Oregon DOT copy of the IFTA matrix, 3Q2026 FINAL Fuel Tax Rates (PDF)](https://www.oregon.gov/odot/MCT/Fuel%20Tax%20Rates/3Q2026FuelRates.pdf)

[All sources, editions and read dates](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

Each of the four quarters on file is final, from the Oregon DOT copy with the New York State Tax cross-check. A two-state return is worked out by hand in the test and compared with the engine. Due dates for 2026 are compared with the Oregon DOT calendar, and the late-interest example from the Idaho State Tax Commission ($100 over 3 months late is $1.25) is reproduced.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) list what each test suite asserts.

[Open the IFTA quarterly return calculator tool](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/).

## Questions

### Is there any AI in the ifta quarterly return calculator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the ifta quarterly return calculator refuse to answer?

Rates are final rates only, by quarter, from 4th Quarter 2025 to 3rd Quarter 2026. A quarter that is not on file is refused, not guessed. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the IFTA quarterly return calculator tool](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [How IFTA is calculated](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/how-ifta-is-calculated/)
- [IFTA due dates](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/due-dates/)
- [IFTA record keeping](https://krishnachagti-sudo.github.io/toll-preview/ifta-calculator/record-keeping/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/ifta-calculator/  
Data as of: 2026-11-04
