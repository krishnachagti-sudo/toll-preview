# Cron every quarter

The cron expression for every quarter (January, April, July and October 1) is 0 0 1 1,4,7,10 \*; from midnight UTC on Monday, November 9, 2026 it runs at 00:00 on January 1, 2027, 00:00 on April 1, 2027 and 00:00 on July 1, 2027 UTC. In Quartz it is 0 0 0 1 \*/3 ?, and in AWS EventBridge cron(0 0 1 1/3 ? \*).

- Crontab: 0 0 1 1,4,7,10 \*
- Quartz: 0 0 0 1 \*/3 ?
- Reads as: At 00:00, on the 1st of the month, every 3 months from January.

## Check every quarter in your time zone

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+0+1+1%2C4%2C7%2C10+*&dialect=vixie&tz=America%2FNew_York)

## The next runs

From midnight on Monday, November 9, 2026, worked out the day this page is read.

| UTC | New York (from its own midnight) |
| --- | --- |
| Fri 2027-01-01 00:00 | Fri 2027-01-01 00:00 EST |
| Thu 2027-04-01 00:00 | Thu 2027-04-01 00:00 EDT |
| Thu 2027-07-01 00:00 | Thu 2027-07-01 00:00 EDT |
| Fri 2027-10-01 00:00 | Fri 2027-10-01 00:00 EDT |
| Sat 2028-01-01 00:00 | Sat 2028-01-01 00:00 EST |
| Sat 2028-04-01 00:00 | Sat 2028-04-01 00:00 EDT |

## The same schedule for each scheduler

Written from the meaning: Sunday is 0 in crontab and 1 in Quartz, UiPath and AWS; Quartz and AWS put ? in the day field they do not use.

| Scheduler | Expression |
| --- | --- |
| Linux crontab (Vixie cron) | `0 0 1 */3 *` |
| GitHub Actions | `0 0 1 */3 *` |
| Kubernetes CronJob | `0 0 1 */3 *` |
| Vercel Cron Jobs | `0 0 1 */3 *` |
| n8n Schedule Trigger (Custom cron) | `0 0 1 */3 *` |
| Quartz Scheduler | `0 0 0 1 */3 ?` |
| Spring @Scheduled | `0 0 0 1 */3 *` |
| UiPath Orchestrator time trigger | `0 0 0 1 */3 ?` |
| Amazon EventBridge Scheduler | `cron(0 0 1 1/3 ? *)` |

## Field by field

- Minutes: `0` (0)
- Hours: `0` (0)
- Day of month: `1` (1)
- Month: `1,4,7,10` (1, 4, 7, 10)
- Day of week: `*` (Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday)

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
- [Cron once a year](https://krishnachagti-sudo.github.io/toll-preview/cron/every-year/)
- [Cron on the last day of every month](https://krishnachagti-sudo.github.io/toll-preview/cron/last-day-of-month/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/every-quarter/  
Worked out for: 2026-11-09  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/every-quarter.csv
