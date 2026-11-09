# Cron on the last day of the month

Quartz writes the last day of the month as 0 0 0 L \* ? (L in the day-of-month field); Spring uses 0 0 0 L \* \* and AWS EventBridge cron(0 0 L \* ? \*). In crontab it is not possible: crontab has no L. After Monday, November 9, 2026 it next runs on November 30, 2026, December 31, 2026 and January 31, 2027 at midnight UTC.

- Crontab: not possible
- Quartz: 0 0 0 L \* ?
- Reads as: At 00:00, on the last day of the month.

## Check on the last day of every month in your time zone

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+0+0+L+*+%3F&dialect=quartz&tz=America%2FNew_York)

## The next runs

From midnight on Monday, November 9, 2026, worked out the day this page is read.

| UTC | New York (from its own midnight) |
| --- | --- |
| Mon 2026-11-30 00:00 | Mon 2026-11-30 00:00 EST |
| Thu 2026-12-31 00:00 | Thu 2026-12-31 00:00 EST |
| Sun 2027-01-31 00:00 | Sun 2027-01-31 00:00 EST |
| Sun 2027-02-28 00:00 | Sun 2027-02-28 00:00 EST |
| Wed 2027-03-31 00:00 | Wed 2027-03-31 00:00 EDT |
| Fri 2027-04-30 00:00 | Fri 2027-04-30 00:00 EDT |

## The same schedule for each scheduler

Written from the meaning: Sunday is 0 in crontab and 1 in Quartz, UiPath and AWS; Quartz and AWS put ? in the day field they do not use.

| Scheduler | Expression |
| --- | --- |
| Linux crontab (Vixie cron) | Not possible: Linux crontab (Vixie cron) has no L or W in the day of month. |
| GitHub Actions | Not possible: GitHub Actions has no L or W in the day of month. |
| Kubernetes CronJob | Not possible: Kubernetes CronJob has no L or W in the day of month. |
| Vercel Cron Jobs | Not possible: Vercel Cron Jobs has no L or W in the day of month. |
| n8n Schedule Trigger (Custom cron) | Not possible: n8n Schedule Trigger (Custom cron) has no L or W in the day of month. |
| Quartz Scheduler | `0 0 0 L * ?` |
| Spring @Scheduled | `0 0 0 L * *` |
| UiPath Orchestrator time trigger | `0 0 0 L * ?` |
| Amazon EventBridge Scheduler | `cron(0 0 L * ? *)` |

## In crontab

Debian's crontab(5) says the syntax cannot define every period, and that the best approach is for the program to check the date itself. One way: run on days 28 to 31 and go on only when tomorrow is the 1st (GNU date):

```
0 0 28-31 * * [ "$(date -d tomorrow +\%d)" = "01" ] && /path/to/command
```

The % signs are escaped because cron turns an unescaped % in the command into a new line.

## Field by field

- Seconds: `0` (0)
- Minutes: `0` (0)
- Hours: `0` (0)
- Day of month: `L`
- Month: `*` (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
- Day of week: `?` (Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday)
- Year: `*`

## Sources

- [Debian crontab(5), cron 3.0pl1-197 (Vixie cron) (read November 8, 2026)](https://manpages.debian.org/trixie/cron/crontab.5.en.html)
- [Quartz 2.3 tutorial: CronTrigger (read November 8, 2026)](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)

## Questions

### Which time zone does it run in?

The scheduler's: crontab uses the cron daemon's time zone, GitHub Actions UTC unless the schedule sets timezone, Kubernetes the controller manager's unless .spec.timeZone is set, Vercel always UTC, and AWS EventBridge Scheduler UTC unless the schedule sets one.

## Related

- [Cron once a week](https://krishnachagti-sudo.github.io/toll-preview/cron/every-week/)
- [Cron once a month](https://krishnachagti-sudo.github.io/toll-preview/cron/every-month/)
- [Cron every quarter](https://krishnachagti-sudo.github.io/toll-preview/cron/every-quarter/)
- [Cron once a year](https://krishnachagti-sudo.github.io/toll-preview/cron/every-year/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/last-day-of-month/  
Worked out for: 2026-11-09  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/last-day-of-month.csv
