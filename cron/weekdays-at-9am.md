# Cron every weekday at 9 am

The cron expression for every weekday at 9 am is 0 9 \* \* 1-5; from midnight UTC on Monday, November 9, 2026 it runs at 09:00, 09:00 on November 10, 2026 and 09:00 on November 11, 2026 UTC. In Quartz it is 0 0 9 ? \* 2-6, and in AWS EventBridge cron(0 9 ? \* 2-6 \*).

- Crontab: 0 9 \* \* 1-5
- Quartz: 0 0 9 ? \* 2-6
- Reads as: At 09:00, on weekdays (Monday to Friday).

## Check every weekday at 9 am in your time zone

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+9+*+*+1-5&dialect=vixie&tz=America%2FNew_York)

## The next runs

From midnight on Monday, November 9, 2026, worked out the day this page is read.

| UTC | New York (from its own midnight) |
| --- | --- |
| Mon 2026-11-09 09:00 | Mon 2026-11-09 09:00 EST |
| Tue 2026-11-10 09:00 | Tue 2026-11-10 09:00 EST |
| Wed 2026-11-11 09:00 | Wed 2026-11-11 09:00 EST |
| Thu 2026-11-12 09:00 | Thu 2026-11-12 09:00 EST |
| Fri 2026-11-13 09:00 | Fri 2026-11-13 09:00 EST |
| Mon 2026-11-16 09:00 | Mon 2026-11-16 09:00 EST |

## The same schedule for each scheduler

Written from the meaning: Sunday is 0 in crontab and 1 in Quartz, UiPath and AWS; Quartz and AWS put ? in the day field they do not use.

| Scheduler | Expression |
| --- | --- |
| Linux crontab (Vixie cron) | `0 9 * * 1-5` |
| GitHub Actions | `0 9 * * 1-5` |
| Kubernetes CronJob | `0 9 * * 1-5` |
| Vercel Cron Jobs | `0 9 * * 1-5` |
| n8n Schedule Trigger (Custom cron) | `0 9 * * 1-5` |
| Quartz Scheduler | `0 0 9 ? * 2-6` |
| Spring @Scheduled | `0 0 9 * * 1-5` |
| UiPath Orchestrator time trigger | `0 0 9 ? * 2-6` |
| Amazon EventBridge Scheduler | `cron(0 9 ? * 2-6 *)` |

## Field by field

- Minutes: `0` (0)
- Hours: `9` (9)
- Day of month: `*` (31 values)
- Month: `*` (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
- Day of week: `1-5` (Monday, Tuesday, Wednesday, Thursday, Friday)

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
- [Cron every Monday at 9 am](https://krishnachagti-sudo.github.io/toll-preview/cron/every-monday-at-9am/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/weekdays-at-9am/  
Worked out for: 2026-11-09  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/weekdays-at-9am.csv
