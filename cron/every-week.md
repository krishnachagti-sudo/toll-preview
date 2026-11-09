# Cron once a week

The cron expression for once a week (Sunday at midnight) is 0 0 \* \* 0; from midnight UTC on Monday, November 9, 2026 it runs at 00:00 on November 15, 2026, 00:00 on November 22, 2026 and 00:00 on November 29, 2026 UTC. In Quartz it is 0 0 0 ? \* 1, and in AWS EventBridge cron(0 0 ? \* 1 \*).

- Crontab: 0 0 \* \* 0
- Quartz: 0 0 0 ? \* 1
- Reads as: At 00:00, on Sunday.

## Check once a week in your time zone

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+0+*+*+0&dialect=vixie&tz=America%2FNew_York)

## The next runs

From midnight on Monday, November 9, 2026, worked out the day this page is read.

| UTC | New York (from its own midnight) |
| --- | --- |
| Sun 2026-11-15 00:00 | Sun 2026-11-15 00:00 EST |
| Sun 2026-11-22 00:00 | Sun 2026-11-22 00:00 EST |
| Sun 2026-11-29 00:00 | Sun 2026-11-29 00:00 EST |
| Sun 2026-12-06 00:00 | Sun 2026-12-06 00:00 EST |
| Sun 2026-12-13 00:00 | Sun 2026-12-13 00:00 EST |
| Sun 2026-12-20 00:00 | Sun 2026-12-20 00:00 EST |

## The same schedule for each scheduler

Written from the meaning: Sunday is 0 in crontab and 1 in Quartz, UiPath and AWS; Quartz and AWS put ? in the day field they do not use.

| Scheduler | Expression |
| --- | --- |
| Linux crontab (Vixie cron) | `0 0 * * 0` |
| GitHub Actions | `0 0 * * 0` |
| Kubernetes CronJob | `0 0 * * 0` |
| Vercel Cron Jobs | `0 0 * * 0` |
| n8n Schedule Trigger (Custom cron) | `0 0 * * 0` |
| Quartz Scheduler | `0 0 0 ? * 1` |
| Spring @Scheduled | `0 0 0 * * 0` |
| UiPath Orchestrator time trigger | `0 0 0 ? * 1` |
| Amazon EventBridge Scheduler | `cron(0 0 ? * 1 *)` |

## Field by field

- Minutes: `0` (0)
- Hours: `0` (0)
- Day of month: `*` (31 values)
- Month: `*` (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
- Day of week: `0` (Sunday)

## Sources

- [Debian crontab(5), cron 3.0pl1-197 (Vixie cron) (read November 8, 2026)](https://manpages.debian.org/trixie/cron/crontab.5.en.html)
- [Quartz 2.3 tutorial: CronTrigger (read November 8, 2026)](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)

## Questions

### Is there a shortcut for 0 0 \* \* 0?

Yes: @weekly in Debian cron, Kubernetes and Spring (Spring's has a seconds field). GitHub Actions does not support the @ strings.

### Which time zone does it run in?

The scheduler's: crontab uses the cron daemon's time zone, GitHub Actions UTC unless the schedule sets timezone, Kubernetes the controller manager's unless .spec.timeZone is set, Vercel always UTC, and AWS EventBridge Scheduler UTC unless the schedule sets one.

## Related

- [Cron once a month](https://krishnachagti-sudo.github.io/toll-preview/cron/every-month/)
- [Cron every quarter](https://krishnachagti-sudo.github.io/toll-preview/cron/every-quarter/)
- [Cron once a year](https://krishnachagti-sudo.github.io/toll-preview/cron/every-year/)
- [Cron on the last day of every month](https://krishnachagti-sudo.github.io/toll-preview/cron/last-day-of-month/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/every-week/  
Worked out for: 2026-11-09  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/every-week.csv
