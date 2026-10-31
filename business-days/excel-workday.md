# Add business days to a date in Excel

`=WORKDAY(A2, 10, $H$2:$H$24)` gives the date 10 business days after the date in A2, not counting A2 itself and skipping the holidays listed in H2:H24: 10 business days after Wednesday, July 1, 2026 with US federal holidays is Thursday, July 16, 2026, the same date this tool gives.

- Result: Thursday, July 16, 2026

## The formula

```excel
=WORKDAY(start_date, days, [holidays])
=WORKDAY(A2, B2, $H$2:$H$24)
=WORKDAY(DATE(2026,7,1), 10, $H$2:$H$24)
```

A positive number of days gives a later date and a negative one an earlier date; a fraction is cut to a whole number. If the cell shows a number such as 46219, format it as a date: that is Thursday, July 16, 2026. Weekends are Saturday and Sunday; `WORKDAY.INTL` takes other weekends.

## It matches this tool

WORKDAY never counts the start date: day 1 is the next business day, whatever day the start falls on. This tool adds business days the same way, so with the same holiday list the dates agree, including starts on a weekend or a holiday.

| Region | Start | Days | WORKDAY and this tool | Holidays skipped |
| --- | --- | ---: | --- | --- |
| US | Wednesday, July 1, 2026 | 10 | [Thursday, July 16, 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2026-07-01&days=10) | Independence Day (observed) |
| US | Wednesday, November 25, 2026 | 2 | [Monday, November 30, 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2026-11-25&days=2) | Thanksgiving Day |
| England and Wales | Thursday 24 December 2026 | 1 | [Tuesday 29 December 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=GB-ENG&start=2026-12-24&days=1) | Christmas Day; Boxing Day (substitute day) |
| US | Monday, January 5, 2026 | -1 | [Friday, January 2, 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2026-01-05&days=-1) |  |

> Each date in the fourth column opens the tool with that start and number of days.

## Turning calendar days into business days

To find how many business days a span of calendar days holds, count them with [NETWORKDAYS](https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-networkdays/): for the 30 calendar days after the date in A2, `=NETWORKDAYS(A2+1, A2+30, $H$2:$H$24)`.

## Holiday lists to paste, 2026 and 2027

US federal holidays: 23 days off, for H2:H24. Each is the day off, so observed and substitute days are already moved off the weekend. Other years: [2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/us-federal-holidays-2026/), [2027](https://krishnachagti-sudo.github.io/toll-preview/business-days/us-federal-holidays-2027/) and the rest of the calendar pages, each with a CSV.

```text
2026-01-01
2026-01-19
2026-02-16
2026-05-25
2026-06-19
2026-07-03
2026-09-07
2026-10-12
2026-11-11
2026-11-26
2026-12-25
2027-01-01
2027-01-18
2027-02-15
2027-05-31
2027-06-18
2027-07-05
2027-09-06
2027-10-11
2027-11-11
2027-11-25
2027-12-24
2027-12-31
```

England and Wales bank holidays: 16 days off, for H2:H17. Each is the day off, so observed and substitute days are already moved off the weekend. Other years: [2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/england-wales-bank-holidays-2026/), [2027](https://krishnachagti-sudo.github.io/toll-preview/business-days/england-wales-bank-holidays-2027/) and the rest of the calendar pages, each with a CSV.

```text
2026-01-01
2026-04-03
2026-04-06
2026-05-04
2026-05-25
2026-08-31
2026-12-25
2026-12-28
2027-01-01
2027-03-26
2027-03-29
2027-05-03
2027-05-31
2027-08-30
2027-12-27
2027-12-28
```

## Sources

- [Microsoft: WORKDAY function](https://support.microsoft.com/en-us/office/workday-function-f764a5b7-05fc-4494-9486-60d494efbf33)
- [Microsoft: NETWORKDAYS function](https://support.microsoft.com/en-us/office/networkdays-function-48e717bf-a7a3-495f-969e-5005e3eb18e7)
- [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)
- [GOV.UK: UK bank holidays](https://www.gov.uk/bank-holidays)

## Steps

1. **Enter the start.** Put the start date in A2 as a real date and the number of business days in B2. A negative number goes back.
2. **Paste the holidays.** Paste the holiday list for your region from this page into column H, starting at H2.
3. **Add.** In C2, type =WORKDAY(A2, B2, $H$2:$H$24) for the US or =WORKDAY(A2, B2, $H$2:$H$17) for England and Wales, and format C2 as a date.

## Related

- [Count business days in Excel with NETWORKDAYS](https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-networkdays/)
- [NETWORKDAYS and WORKDAY in Google Sheets](https://krishnachagti-sudo.github.io/toll-preview/business-days/google-sheets-networkdays/)
- [How long is 10 business days?](https://krishnachagti-sudo.github.io/toll-preview/business-days/how-long-is-10-business-days/)
- [Business days calculator](https://krishnachagti-sudo.github.io/toll-preview/business-days/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-workday/  
Data as of: 2026-10-30
