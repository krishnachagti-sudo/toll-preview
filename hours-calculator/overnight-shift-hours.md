# Overnight shift hours

When the out time is earlier than the in time, add 24 hours: 10:00 PM to 6:30 AM with a 30-minute break is 8:00 (8.00 hours); on the night clocks fall back, 10:00 PM to 6:00 AM is 9.00 real hours, and 7.00 on the night they spring forward.

- 10 PM to 6:30 AM, 30-minute break: 8.00
- 10 PM to 6 AM, clocks fall back: 9.00
- 10 PM to 6 AM, clocks spring forward: 7.00

## Your night shift

[Work it out](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/?from=10%3A00+pm&to=6%3A30+am&brk=30)

## Common night shifts

End plus 24 hours, minus start, minus the unpaid break.

| Shift | Unpaid break | Hours | Decimal |
| --- | --- | ---: | ---: |
| 6:00 PM to 2:00 AM | none | 8:00 | 8.00 |
| 7:00 PM to 7:00 AM | 30 min | 11:30 | 11.50 |
| 8:00 PM to 4:30 AM | 30 min | 8:00 | 8.00 |
| 10:00 PM to 6:00 AM | none | 8:00 | 8.00 |
| 10:00 PM to 6:30 AM | 30 min | 8:00 | 8.00 |
| 11:00 PM to 7:00 AM | 30 min | 7:30 | 7.50 |
| 11:00 PM to 7:30 AM | 30 min | 8:00 | 8.00 |
| 12:00 AM to 8:00 AM | none | 8:00 | 8.00 |
| 3:00 PM to 1:00 AM | 30 min | 9:30 | 9.50 |
| 9:00 PM to 9:00 AM | 60 min | 11:00 | 11.00 |

## Daylight-saving nights

Clock times hide the change. In America/New\_York, 10:00 PM on October 31 to 6:00 AM on November 1, 2026 is 9:00 of real time, because 1 AM to 2 AM happens twice; 10:00 PM on March 13 to 6:00 AM on March 14, 2027 is 7:00. Pick a time zone in the calculator and it counts the real time.

## The change night on a timesheet

[Open the change night](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/?start=2026-10-31&weeks=1&d0=10%3A00+pm+-+6%3A00+am&tz=America%2FNew_York)

## In Excel or Google Sheets

With the in time in A2 and the out time in B2, this gives the hours as a decimal for any shift, overnight or not:

```excel
=MOD(B2-A2,1)*24
```

Keep the brackets: `=B2-A2*24` multiplies only the start. Take off a 30-minute lunch with `=MOD(B2-A2,1)*24-0.5`. A spreadsheet counts clock times, so it gives 8 hours on a change night too.

> Worked out from the times shown, under the federal rules quoted. A state law, contract or policy may require more. Not legal or payroll advice.

## Sources

- [29 CFR 778.105, Determining the workweek (read November 7, 2026)](https://www.law.cornell.edu/cfr/text/29/778.105)
- [DOL Wage and Hour Division, Fact Sheet #23, Overtime Pay (revised October 2019, read November 7, 2026)](https://www.dol.gov/agencies/whd/fact-sheets/23-flsa-overtime-pay)

## Questions

### Why does Excel show #### for my night shift?

Excel cannot show a negative time, and 6:00 AM minus 10:00 PM is negative. Use =MOD(end-start,1) for the duration and =MOD(end-start,1)\*24 for decimal hours.

### How many hours is a 10 PM to 6 AM shift when the clocks change?

9.00 hours on the night clocks fall back (the 1 AM hour happens twice) and 7.00 on the night they spring forward, against 8.00 on other nights.

### Which workweek does an overnight shift count in?

Hours count in the workweek they are worked. With a workweek starting Sunday at midnight, a Saturday 10 PM to Sunday 6 AM shift puts 2:00 in the old week and 7:00 in the new one (on the November 1, 2026 change night).

## Related

- [Hours between two times](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/hours-between-times/)
- [24-hour (military) time chart](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/military-time-chart/)
- [Biweekly timesheet with overtime](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/biweekly-timesheet-overtime/)
- [Daylight saving nights, 2026 to 2030](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/daylight-saving-time-2026-2027-night-shifts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/overnight-shift-hours/  
Data as of: 2026-11-07  
CSV: https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/overnight-shift-hours.csv
