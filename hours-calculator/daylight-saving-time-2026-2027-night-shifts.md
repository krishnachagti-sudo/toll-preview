# Daylight saving time 2026 to 2030: night shift hours

Clocks went back at 2 AM on Sunday, November 1, 2026, and go forward at 2 AM on Sunday, March 14, 2027: a 10 PM to 6 AM shift is 9.00 real hours on the first of those nights and 7.00 on the second, in every US zone that changes; in Arizona and Hawaii it stays 8.

- Fall 2026 change: November 1, 2026
- Spring 2027 change: March 14, 2027
- 10 PM to 6 AM, fall night: 9.00 h

## The change dates, 2026 to 2030

The law: daylight saving time runs "commencing at 2 o'clock antemeridian on the second Sunday of March of each year" and "ending at 2 o'clock antemeridian on the first Sunday of November of each year" (15 U.S.C. 260a). The dates below are that rule worked out for each year.

Clocks go forward one hour in March and back one hour in November, at 2 AM local time.

| Year | Clocks forward | Clocks back |
| --- | --- | --- |
| 2026 | Sunday, March 8, 2026 | Sunday, November 1, 2026 |
| 2027 | Sunday, March 14, 2027 | Sunday, November 7, 2027 |
| 2028 | Sunday, March 12, 2028 | Sunday, November 5, 2028 |
| 2029 | Sunday, March 11, 2029 | Sunday, November 4, 2029 |
| 2030 | Sunday, March 10, 2030 | Sunday, November 3, 2030 |

## How long is a night shift on a change night?

A 10 PM to 6 AM shift that starts the Saturday evening before each change, worked out by the calculator in each zone:

Real hours from 10 PM Saturday to 6 AM Sunday. Fall: October 31, 2026 into November 1, 2026. Spring: March 13, 2027 into March 14, 2027.

| Zone | Time zone name | Fall 2026 | Spring 2027 |
| --- | --- | ---: | ---: |
| Eastern | America/New\_York | 9.00 | 7.00 |
| Central | America/Chicago | 9.00 | 7.00 |
| Mountain | America/Denver | 9.00 | 7.00 |
| Arizona | America/Phoenix | 8.00 | 8.00 |
| Pacific | America/Los\_Angeles | 9.00 | 7.00 |
| Alaska | America/Anchorage | 9.00 | 7.00 |
| Hawaii | Pacific/Honolulu | 8.00 | 8.00 |

On the fall night the hour from 1 AM to 2 AM happens twice, so the shift holds 9:00 of real time; in spring 2 AM to 3 AM never happens, so it holds 7:00. A spreadsheet formula such as `=MOD(B2-A2,1)*24` subtracts clock times and gives 8 both nights. See [overnight shift hours](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/overnight-shift-hours/) for the formula and other night shifts.

## Which workweek gets the hours?

With a workweek that starts Sunday at midnight, the fall shift splits across two workweeks: 2:00 before midnight and 7:00 after it, because the repeated hour falls on Sunday morning. "An employee's workweek is a fixed and regularly recurring period of 168 hours, seven consecutive 24-hour periods. It need not coincide with the calendar week but may begin on any day and at any hour of the day." (29 CFR 778.105).

## Check the fall night on a timesheet

[Open the change night](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/?start=2026-10-31&weeks=1&d0=10%3A00+pm+-+6%3A00+am&tz=America%2FNew_York)

> Worked out from the times shown, under the federal rules quoted. A state law, contract or policy may require more. Not legal or payroll advice.

## Sources

- [15 U.S.C. 260a, Advancement of time or changeover dates (Cornell LII, read November 8, 2026)](https://www.law.cornell.edu/uscode/text/15/260a)
- [IANA Time Zone Database (the zone rules the calculator uses)](https://www.iana.org/time-zones)
- [29 CFR 778.105, Determining the workweek (read November 7, 2026)](https://www.law.cornell.edu/cfr/text/29/778.105)

## Questions

### When does daylight saving time end in 2026?

At 2 AM on Sunday, November 1, 2026, when clocks go back one hour (15 U.S.C. 260a: the first Sunday of November).

### When does daylight saving time start in 2027?

At 2 AM on Sunday, March 14, 2027, when clocks go forward one hour (the second Sunday of March).

### Is a night shift paid for 9 hours when the clocks go back?

The worker is on duty for 9.00 real hours from 10 PM to 6 AM that night, and hours worked are what count. A time clock or spreadsheet that subtracts clock times shows 8; check the timesheet by hand or with a time zone set.

### Does Arizona change its clocks?

America/Phoenix in the time zone database has no clock change, so a 10 PM to 6 AM shift there is 8 hours on both nights. 15 U.S.C. 260a lets a state that lies entirely within one time zone exempt itself.

## Related

- [Overnight shift hours and the Excel fix](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/overnight-shift-hours/)
- [Overtime in the Christmas and New Year weeks](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/holiday-week-overtime-2026/)
- [Biweekly timesheet with overtime](https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/biweekly-timesheet-overtime/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/hours-calculator/daylight-saving-time-2026-2027-night-shifts/  
Data as of: 2026-11-08
