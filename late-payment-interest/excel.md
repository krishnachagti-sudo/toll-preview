# Late payment interest in Excel

Formula: =amount\*(base rate+8%)\*days/365, with the base rate from the reference date, not today. With £3,600, a 3.75% base rate and 63 days the cell shows £73.01; add £70 for the fixed sum.

- £3,600, 63 days: £73.01

## The formulas

Columns: A amount (with VAT), B due date, C paid date (or today), D Bank Rate on the reference date. In row 2:

```text
=C2-B2                                          days late (E2)
=IF(MONTH(B2+1)<=6, DATE(YEAR(B2+1)-1,12,31), DATE(YEAR(B2+1),6,30))   reference date: look up D2 for it
=ROUND(A2*(D2+8%)*E2/365, 2)                    statutory interest
=IF(A2<1000, 40, IF(A2<10000, 70, 100))        fixed sum
```

Download the [reference rate table as CSV](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/uk/rates/) and look the rate up by the reference date with XLOOKUP or VLOOKUP.

## A sample sheet, checked

| Invoice | Amount | Days | Rate | Interest | Fixed | Claim |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| INV-201 | £850.00 | 45 | 11.75% | £12.31 | £40 | £52.31 |
| INV-202 | £1,200.00 | 47 | 11.75% | £18.16 | £70 | £88.16 |
| INV-203 | £3,600.00 | 63 | 11.75% | £73.01 | £70 | £143.01 |
| INV-204 | £9,999.99 | 35 | 11.75% | £112.67 | £70 | £182.67 |
| INV-205 | £14,500.00 | 60 | 11.75% | £280.07 | £100 | £380.07 |
| INV-206 | £22,000.00 | 45 | 11.75% | £318.70 | £100 | £418.70 |

## Where spreadsheets go wrong

- Using today's Bank Rate instead of the rate on June 30 or December 31 before the debt became late.
- Compounding: statutory interest is simple.
- Leaving out VAT, or adding the fixed sum to the interest invoice twice.
- Changing the rate when Bank Rate moves: the UK rate stays fixed for the life of the debt (EU and Irish rates change by half-year).

Many invoices at once: the tool takes a CSV and returns each claim and the totals ([open the calculator](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/)).

> Not legal advice. The figures follow the official rules and rates quoted on this page, read on the date shown; a court decides any dispute.

## Related

- [Reference rates (CSV)](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/uk/rates/)
- [UK calculator](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/uk/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/excel/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/excel.csv
