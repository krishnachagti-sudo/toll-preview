# PTO and sick accrual in a spreadsheet

In Excel or Google Sheets, PTO per pay period is =annual\_hours/periods (120/26 = 4.62 hours every two weeks); sick time is =FLOOR(hours\_worked\_this\_year/rate, 0.001) less what was already credited, capped with MIN() at the yearly limit, which for 70 hours every two weeks in Washington comes to 45.50 hours in 2027.

## The formulas

```text
PTO this paycheck      =ROUND($annual/26*ROW_IN_YEAR,3)-ROUND($annual/26*(ROW_IN_YEAR-1),3)
Sick earned to date    =FLOOR(SUM($B$2:B2)/30,0.001)
Sick this paycheck     =MIN(C2-C1, $year_cap-SUM($D$1:D1), $balance_cap-E1)
Balance                =E1+D2-used
Year-end carryover     =MIN(balance,$carry_cap)
```

## Where a sheet goes wrong

- Rounding each paycheck instead of the year to date drifts: 120/26 rounded to 4.62 each time gives 120.12 hours in a year, not 120.
- Maryland earns nothing in a two-week period under 24 hours (Md. Lab. & Empl. 3-1304(c)(5)); a plain hours/30 column misses it. [Maryland sick leave](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/maryland/).
- Size tiers (Arizona, Alaska, D.C., Seattle, New York City) change the rate or cap with the head count.
- A front-loaded year replaces carryover in some places and adds to it in others.

## PTO per paycheck

120 PTO hours a year by pay frequency

| Paid | Paychecks a year | Hours a paycheck |
| --- | ---: | ---: |
| weekly | 52 | 2.308 |
| biweekly | 26 | 4.615 |
| semimonthly | 24 | 5.000 |
| monthly | 12 | 10.000 |

## Skip the sheet: run one employee

[Work out the balances](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/?place=WA&freq=biweekly&first=2027-01-08&hours=70&periods=26)

> Worked out from each state's or city's own published text, quoted with the date we read it. Not legal advice. The limits shown are the most an employer may apply; your written policy, a union contract or a local ordinance can give more. Places whose official sites we could not read are listed as not covered rather than guessed.

## Steps

1. **PTO per paycheck.** =annual\_hours/periods\_per\_year: 120/26 = 4.62, 120/24 = 5.00, 120/52 = 2.31.
2. **Sick time to date.** =FLOOR(SUM(hours\_this\_year)/30, 0.001) for a 1-per-30 law; the paycheck's accrual is that less the previous row.
3. **Cap it.** =MIN(earned, yearly\_cap - earned\_before) and =MIN(earned, balance\_cap - balance\_before).
4. **Year end.** =MIN(balance, carryover\_limit) becomes the first row of the new plan year.

## Related

- [Sick leave accrual calculator](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave/)
- [Paid sick leave laws by state](https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/sick-leave-laws-by-state/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/pto-accrual/excel/  
Data as of: 2026-11-09
