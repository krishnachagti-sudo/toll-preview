# Cron once a year

The cron expression for once a year (January 1 at midnight) is 0 0 1 1 \*; from midnight UTC on Monday, November 9, 2026 it runs at 00:00 on January 1, 2027, 00:00 on January 1, 2028 and 00:00 on January 1, 2029 UTC. In Quartz it is 0 0 0 1 1 ?, and in AWS EventBridge cron(0 0 1 1 ? \*).

- Crontab: 0 0 1 1 \*
- Quartz: 0 0 0 1 1 ?
- Reads as: At 00:00, on the 1st of the month, in January.

## Check once a year in your time zone

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+0+1+1+*&dialect=vixie&tz=America%2FNew_York)

## The next runs

From midnight on Monday, November 9, 2026, worked out the day this page is read.

| UTC | New York (from its own midnight) |
| --- | --- |
| Fri 2027-01-01 00:00 | Fri 2027-01-01 00:00 EST |
| Sat 2028-01-01 00:00 | Sat 2028-01-01 00:00 EST |
| Mon 2029-01-01 00:00 | Mon 2029-01-01 00:00 EST |
| Tue 2030-01-01 00:00 | Tue 2030-01-01 00:00 EST |
| Wed 2031-01-01 00:00 | Wed 2031-01-01 00:00 EST |
| Thu 2032-01-01 00:00 | Thu 2032-01-01 00:00 EST |

## The same schedule for each scheduler

Written from the meaning: Sunday is 0 in crontab and 1 in Quartz, UiPath and AWS; Quartz and AWS put ? in the day field they do not use.

| Scheduler | Expression |
| --- | --- |
| Linux crontab (Vixie cron) | `0 0 1 1 *` |
| GitHub Actions | `0 0 1 1 *` |
| Kubernetes CronJob | `0 0 1 1 *` |
| Vercel Cron Jobs | `0 0 1 1 *` |
| n8n Schedule Trigger (Custom cron) | `0 0 1 1 *` |
| Quartz Scheduler | `0 0 0 1 1 ?` |
| Spring @Scheduled | `0 0 0 1 1 *` |
| UiPath Orchestrator time trigger | `0 0 0 1 1 ?` |
| Amazon EventBridge Scheduler | `cron(0 0 1 1 ? *)` |

## Field by field

- Minutes: `0` (0)
- Hours: `0` (0)
- Day of month: `1` (1)
- Month: `1` (1)
- Day of week: `*` (Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday)

## Sources

- [Debian crontab(5), cron 3.0pl1-197 (Vixie cron) (read November 8, 2026)](https://manpages.debian.org/trixie/cron/crontab.5.en.html)
- [Quartz 2.3 tutorial: CronTrigger (read November 8, 2026)](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)

## Questions

### Is there a shortcut for 0 0 1 1 \*?

Yes: @yearly (or @annually) in Debian cron, Kubernetes and Spring (Spring's has a seconds field). GitHub Actions does not support the @ strings.

### Which time zone does it run in?

The scheduler's: crontab uses the cron daemon's time zone, GitHub Actions UTC unless the schedule sets timezone, Kubernetes the controller manager's unless .spec.timeZone is set, Vercel always UTC, and AWS EventBridge Scheduler UTC unless the schedule sets one.

## Related

- [Cron once a week](https://krishnachagti-sudo.github.io/toll-preview/cron/every-week/)
- [Cron once a month](https://krishnachagti-sudo.github.io/toll-preview/cron/every-month/)
- [Cron every quarter](https://krishnachagti-sudo.github.io/toll-preview/cron/every-quarter/)
- [Cron on the last day of every month](https://krishnachagti-sudo.github.io/toll-preview/cron/last-day-of-month/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/every-year/  
Worked out for: 2026-11-09  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/every-year.csv
