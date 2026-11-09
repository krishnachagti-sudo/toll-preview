# Cron every Monday at 9 am

The cron expression for every Monday at 9 am is 0 9 \* \* 1; from midnight UTC on Monday, November 9, 2026 it runs at 09:00, 09:00 on November 16, 2026 and 09:00 on November 23, 2026 UTC. In Quartz it is 0 0 9 ? \* 2, and in AWS EventBridge cron(0 9 ? \* 2 \*).

- Crontab: 0 9 \* \* 1
- Quartz: 0 0 9 ? \* 2
- Reads as: At 09:00, on Monday.

## Check every Monday at 9 am in your time zone

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+9+*+*+1&dialect=vixie&tz=America%2FNew_York)

## The next runs

From midnight on Monday, November 9, 2026, worked out the day this page is read.

| UTC | New York (from its own midnight) |
| --- | --- |
| Mon 2026-11-09 09:00 | Mon 2026-11-09 09:00 EST |
| Mon 2026-11-16 09:00 | Mon 2026-11-16 09:00 EST |
| Mon 2026-11-23 09:00 | Mon 2026-11-23 09:00 EST |
| Mon 2026-11-30 09:00 | Mon 2026-11-30 09:00 EST |
| Mon 2026-12-07 09:00 | Mon 2026-12-07 09:00 EST |
| Mon 2026-12-14 09:00 | Mon 2026-12-14 09:00 EST |

## The same schedule for each scheduler

Written from the meaning: Sunday is 0 in crontab and 1 in Quartz, UiPath and AWS; Quartz and AWS put ? in the day field they do not use.

| Scheduler | Expression |
| --- | --- |
| Linux crontab (Vixie cron) | `0 9 * * 1` |
| GitHub Actions | `0 9 * * 1` |
| Kubernetes CronJob | `0 9 * * 1` |
| Vercel Cron Jobs | `0 9 * * 1` |
| n8n Schedule Trigger (Custom cron) | `0 9 * * 1` |
| Quartz Scheduler | `0 0 9 ? * 2` |
| Spring @Scheduled | `0 0 9 * * 1` |
| UiPath Orchestrator time trigger | `0 0 9 ? * 2` |
| Amazon EventBridge Scheduler | `cron(0 9 ? * 2 *)` |

## Field by field

- Minutes: `0` (0)
- Hours: `9` (9)
- Day of month: `*` (31 values)
- Month: `*` (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
- Day of week: `1` (Monday)

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

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/every-monday-at-9am/  
Worked out for: 2026-11-09  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/every-monday-at-9am.csv
