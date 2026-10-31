# Business days in Google Sheets

`=NETWORKDAYS(DATE(2026,7,1), DATE(2026,7,8), $H$2:$H$24)` returns 5 in Google Sheets with the US federal holidays pasted into column H: the business days from Wednesday, July 1, 2026 to Wednesday, July 8, 2026, both included. To add business days, `=WORKDAY(DATE(2026,7,1), 10, $H$2:$H$24)` returns Thursday, July 16, 2026.

- NETWORKDAYS: 5
- WORKDAY: Thursday, July 16, 2026

## The formulas

```excel
=NETWORKDAYS(start_date, end_date, [holidays])
=WORKDAY(start_date, num_days, [holidays])

=NETWORKDAYS(A2, B2, $H$2:$H$24)
=WORKDAY(A2, 10, $H$2:$H$24)
```

Both treat Saturday and Sunday as the weekend (`NETWORKDAYS.INTL` and `WORKDAY.INTL` take others). `holidays` is a range of dates or an array of date values. A negative `num_days` counts backwards, and a fraction is cut to a whole number.

Write dates inside a formula with `DATE`. Google notes that `NETWORKDAYS(10/10/2000,10/10/2001)` divides the numbers instead of reading dates.

## Where they differ from this tool

NETWORKDAYS counts both the start and the end date when they are business days; this tool leaves out the start date, so it gives one less when the start is a business day. Use `=NETWORKDAYS(A2+1, B2, $H$2:$H$24)` to match it. WORKDAY already matches: neither counts the start date.

| Region | Start | End | NETWORKDAYS | This tool |
| --- | --- | --- | ---: | ---: |
| US | Wednesday, July 1, 2026 | Wednesday, July 8, 2026 | 5 | [4](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=between&region=US&start=2026-07-01&end=2026-07-08) |
| US | Sunday, November 1, 2026 | Monday, November 30, 2026 | 19 | [19](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=between&region=US&start=2026-11-01&end=2026-11-30) |
| England and Wales | Monday 21 December 2026 | Thursday 31 December 2026 | 7 | [6](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=between&region=GB-ENG&start=2026-12-21&end=2026-12-31) |
| England and Wales | Monday 22 March 2027 | Friday 2 April 2027 | 8 | [7](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=between&region=GB-ENG&start=2027-03-22&end=2027-04-02) |

| Region | Start | Days | WORKDAY and this tool | Holidays skipped |
| --- | --- | ---: | --- | --- |
| US | Wednesday, July 1, 2026 | 10 | [Thursday, July 16, 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2026-07-01&days=10) | Independence Day (observed) |
| US | Wednesday, November 25, 2026 | 2 | [Monday, November 30, 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2026-11-25&days=2) | Thanksgiving Day |
| England and Wales | Thursday 24 December 2026 | 1 | [Tuesday 29 December 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=GB-ENG&start=2026-12-24&days=1) | Christmas Day; Boxing Day (substitute day) |
| US | Monday, January 5, 2026 | -1 | [Friday, January 2, 2026](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=add&region=US&start=2026-01-05&days=-1) |  |

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

- [Google Docs Editors Help: NETWORKDAYS](https://support.google.com/docs/answer/3092979?hl=en)
- [Google Docs Editors Help: WORKDAY](https://support.google.com/docs/answer/3093059?hl=en)
- [Microsoft: NETWORKDAYS function](https://support.microsoft.com/en-us/office/networkdays-function-48e717bf-a7a3-495f-969e-5005e3eb18e7)
- [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)
- [GOV.UK: UK bank holidays](https://www.gov.uk/bank-holidays)

## Steps

1. **Enter the dates.** Put the start date in A2 and the end date in B2, as real dates, not text.
2. **Paste the holidays.** Paste the holiday list for your region from this page into column H, starting at H2 (23 US dates or 16 England and Wales dates).
3. **Count.** In C2, type =NETWORKDAYS(A2, B2, $H$2:$H$24) for the US or =NETWORKDAYS(A2, B2, $H$2:$H$17) for England and Wales. Both the start and the end date count when they are business days.
4. **Leave out the start date.** To count the way this tool does (the days after the start, up to and including the end), use =NETWORKDAYS(A2+1, B2, $H$2:$H$24).

## Related

- [Count business days in Excel with NETWORKDAYS](https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-networkdays/)
- [Add business days in Excel with WORKDAY](https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-workday/)
- [Business days API](https://krishnachagti-sudo.github.io/toll-preview/business-days/api/)
- [Business days calculator](https://krishnachagti-sudo.github.io/toll-preview/business-days/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/business-days/google-sheets-networkdays/  
Data as of: 2026-10-30
