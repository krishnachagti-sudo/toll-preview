# Business days between two dates in Excel

`=NETWORKDAYS(A2, B2, $H$2:$H$24)` counts the business days from the date in A2 to the date in B2, both included, skipping weekends and the holiday dates in H2:H24. From Wednesday, July 1, 2026 to Wednesday, July 8, 2026 with US federal holidays it gives 5; this tool, which does not count the start date, gives 4.

- NETWORKDAYS: 5
- This tool: 4

## The formula

```excel
=NETWORKDAYS(start_date, end_date, [holidays])
=NETWORKDAYS(A2, B2, $H$2:$H$24)
=NETWORKDAYS(DATE(2026,7,1), DATE(2026,7,8), $H$2:$H$24)
```

Weekends are Saturday and Sunday. `holidays` is optional: a range of cells holding dates, or an array of date serial numbers. Microsoft advises entering dates with `DATE` or as real dates, because dates typed as text can go wrong. For other weekend days, Excel has `NETWORKDAYS.INTL`.

## Where it differs from this tool

NETWORKDAYS counts the start date as well as the end date. This tool counts the days after the start, up to and including the end, so when the start is a business day NETWORKDAYS gives one more. To get the same number in Excel, start a day later: `=NETWORKDAYS(A2+1, B2, $H$2:$H$24)`.

| Region | Start | End | NETWORKDAYS | This tool |
| --- | --- | --- | ---: | ---: |
| US | Wednesday, July 1, 2026 | Wednesday, July 8, 2026 | 5 | [4](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=between&region=US&start=2026-07-01&end=2026-07-08) |
| US | Sunday, November 1, 2026 | Monday, November 30, 2026 | 19 | [19](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=between&region=US&start=2026-11-01&end=2026-11-30) |
| England and Wales | Monday 21 December 2026 | Thursday 31 December 2026 | 7 | [6](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=between&region=GB-ENG&start=2026-12-21&end=2026-12-31) |
| England and Wales | Monday 22 March 2027 | Friday 2 April 2027 | 8 | [7](https://krishnachagti-sudo.github.io/toll-preview/business-days/?op=between&region=GB-ENG&start=2027-03-22&end=2027-04-02) |

> November 1, 2026 is a Sunday, so for November 2026 both give the same number. Each figure in the last column opens the tool with those dates.

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

Only the holidays in the list are skipped. The lists here are US federal holidays ([5 U.S.C. 6103](https://www.law.cornell.edu/uscode/text/5/6103)) and England and Wales bank holidays (GOV.UK); add your state, company or Scottish holidays to the range if they apply.

## Sources

- [Microsoft: NETWORKDAYS function](https://support.microsoft.com/en-us/office/networkdays-function-48e717bf-a7a3-495f-969e-5005e3eb18e7)
- [Microsoft: WORKDAY function](https://support.microsoft.com/en-us/office/workday-function-f764a5b7-05fc-4494-9486-60d494efbf33)
- [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)
- [GOV.UK: UK bank holidays](https://www.gov.uk/bank-holidays)

## Steps

1. **Enter the dates.** Put the start date in A2 and the end date in B2, as real dates, not text.
2. **Paste the holidays.** Paste the holiday list for your region from this page into column H, starting at H2 (23 US dates or 16 England and Wales dates).
3. **Count.** In C2, type =NETWORKDAYS(A2, B2, $H$2:$H$24) for the US or =NETWORKDAYS(A2, B2, $H$2:$H$17) for England and Wales. Both the start and the end date count when they are business days.
4. **Leave out the start date.** To count the way this tool does (the days after the start, up to and including the end), use =NETWORKDAYS(A2+1, B2, $H$2:$H$24).

## Related

- [Add business days in Excel with WORKDAY](https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-workday/)
- [NETWORKDAYS and WORKDAY in Google Sheets](https://krishnachagti-sudo.github.io/toll-preview/business-days/google-sheets-networkdays/)
- [Business days in Python](https://krishnachagti-sudo.github.io/toll-preview/business-days/python/)
- [Business days calculator](https://krishnachagti-sudo.github.io/toll-preview/business-days/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/business-days/excel-networkdays/  
Data as of: 2026-10-30
