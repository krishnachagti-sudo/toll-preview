# Cron every Saturday and Sunday at midnight

The cron expression for every Saturday and Sunday at midnight is 0 0 \* \* 0,6; from midnight UTC on Monday, November 9, 2026 it runs at 00:00 on November 14, 2026, 00:00 on November 15, 2026 and 00:00 on November 21, 2026 UTC. In Quartz it is 0 0 0 ? \* 1,7, and in AWS EventBridge cron(0 0 ? \* 1,7 \*).

- Crontab: 0 0 \* \* 0,6
- Quartz: 0 0 0 ? \* 1,7
- Reads as: At 00:00, on Saturdays and Sundays.

## Check every Saturday and Sunday at midnight in your time zone

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+0+*+*+0%2C6&dialect=vixie&tz=America%2FNew_York)

## The next runs

From midnight on Monday, November 9, 2026, worked out the day this page is read.

| UTC | New York (from its own midnight) |
| --- | --- |
| Sat 2026-11-14 00:00 | Sat 2026-11-14 00:00 EST |
| Sun 2026-11-15 00:00 | Sun 2026-11-15 00:00 EST |
| Sat 2026-11-21 00:00 | Sat 2026-11-21 00:00 EST |
| Sun 2026-11-22 00:00 | Sun 2026-11-22 00:00 EST |
| Sat 2026-11-28 00:00 | Sat 2026-11-28 00:00 EST |
| Sun 2026-11-29 00:00 | Sun 2026-11-29 00:00 EST |

## The same schedule for each scheduler

Written from the meaning: Sunday is 0 in crontab and 1 in Quartz, UiPath and AWS; Quartz and AWS put ? in the day field they do not use.

| Scheduler | Expression |
| --- | --- |
| Linux crontab (Vixie cron) | `0 0 * * 0,6` |
| GitHub Actions | `0 0 * * 0,6` |
| Kubernetes CronJob | `0 0 * * 0,6` |
| Vercel Cron Jobs | `0 0 * * 0,6` |
| n8n Schedule Trigger (Custom cron) | `0 0 * * 0,6` |
| Quartz Scheduler | `0 0 0 ? * 1,7` |
| Spring @Scheduled | `0 0 0 * * 0,6` |
| UiPath Orchestrator time trigger | `0 0 0 ? * 1,7` |
| Amazon EventBridge Scheduler | `cron(0 0 ? * 1,7 *)` |

## Field by field

- Minutes: `0` (0)
- Hours: `0` (0)
- Day of month: `*` (31 values)
- Month: `*` (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
- Day of week: `0,6` (Sunday, Saturday)

## Sources

- [Debian crontab(5), cron 3.0pl1-197 (Vixie cron) (read November 8, 2026)](https://manpages.debian.org/trixie/cron/crontab.5.en.html)
- [Quartz 2.3 tutorial: CronTrigger (read November 8, 2026)](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)

## Questions

### Which time zone does it run in?

The scheduler's: crontab uses the cron daemon's time zone, GitHub Actions UTC unless the schedule sets timezone, Kubernetes the controller manager's unless .spec.timeZone is set, Vercel always UTC, and AWS EventBridge Scheduler UTC unless the schedule sets one.

## Related

- [Cron every day at midnight](https://krishnachagti-sudo.github.io/toll-preview/cron/every-day-at-midnight/)
- [Cron every day at noon](https://krishnachagti-sudo.github.io/toll-preview/cron/every-day-at-noon/)
- [Cron every day at 9 am](https://krishnachagti-sudo.github.io/toll-preview/cron/every-day-at-9am/)
- [Cron twice a day](https://krishnachagti-sudo.github.io/toll-preview/cron/twice-a-day/)
- [Cron every weekday at 9 am](https://krishnachagti-sudo.github.io/toll-preview/cron/weekdays-at-9am/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/weekends-at-midnight/  
Worked out for: 2026-11-09  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/weekends-at-midnight.csv
