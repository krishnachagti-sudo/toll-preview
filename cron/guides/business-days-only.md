# Cron on business days only

Cron can restrict a job to Monday to Friday (0 9 \* \* 1-5) but has no holiday calendar, so in 2027 it still fires on the 12 US federal holidays that fall on weekdays, from January 1 (New Year's Day) to December 31 (New Year's Day (observed)); fire on weekdays and let the job's first step skip holidays.

## Check the weekday schedule

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+9+*+*+1-5&dialect=vixie&tz=America%2FNew_York)

## US federal holidays on weekdays in 2027

Observed dates; a 0 9 \* \* 1-5 job runs on each unless the job checks.

| Date | Holiday |
| --- | --- |
| Friday, January 1, 2027 | New Year's Day |
| Monday, January 18, 2027 | Birthday of Martin Luther King Jr. |
| Monday, February 15, 2027 | Washington's Birthday |
| Monday, May 31, 2027 | Memorial Day |
| Friday, June 18, 2027 | Juneteenth National Independence Day (observed) |
| Monday, July 5, 2027 | Independence Day (observed) |
| Monday, September 6, 2027 | Labor Day |
| Monday, October 11, 2027 | Columbus Day |
| Thursday, November 11, 2027 | Veterans Day |
| Thursday, November 25, 2027 | Thanksgiving Day |
| Friday, December 24, 2027 | Christmas Day (observed) |
| Friday, December 31, 2027 | New Year's Day (observed) |

## The check, in a crontab line

With a file of holiday dates (one YYYY-MM-DD per line), the job runs only when today is not in it:

```
0 9 * * 1-5 grep -qx "$(date +\%F)" /etc/holidays.txt || /path/to/command
```

Workflow tools can do the same as their first step; the [business days tool](https://krishnachagti-sudo.github.io/toll-preview/business-days/) answers whether a date is a business day over its API.

## Sources

- [Debian crontab(5), cron 3.0pl1-197 (Vixie cron) (read November 8, 2026)](https://manpages.debian.org/trixie/cron/crontab.5.en.html)
- [OPM: Federal holidays](https://www.opm.gov/policy-data-oversight/pay-leave/federal-holidays/)
- [5 U.S.C. 6103 (Cornell LII)](https://www.law.cornell.edu/uscode/text/5/6103)

## Steps

1. **Fire on weekdays.** Use 0 9 \* \* 1-5 (crontab, GitHub, Kubernetes, n8n), or 0 0 9 ? \* 2-6 in Quartz.
2. **Check the date first.** The first step of the job asks whether today is a holiday in your calendar and stops if it is.
3. **Take holidays from a source.** For US federal holidays the observed dates follow 5 U.S.C. 6103 and OPM; the business days tool on this site lists them.
4. **Test across a holiday.** For example Friday, January 1, 2027, New Year's Day: the cron fires, the check stops the job.

## Related

- [Cron every weekday at 9 am](https://krishnachagti-sudo.github.io/toll-preview/cron/weekdays-at-9am/)
- [n8n Schedule Trigger on weekdays](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-weekdays/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/guides/business-days-only/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/guides/business-days-only.csv
