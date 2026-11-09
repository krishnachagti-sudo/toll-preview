# Cron every 6 hours

The cron expression for every 6 hours is 0 \*/6 \* \* \*; from midnight UTC on Monday, November 9, 2026 it runs at 00:00, 06:00 and 12:00 UTC. In Quartz it is 0 0 \*/6 \* \* ?, and in AWS EventBridge cron(0 0/6 \* \* ? \*).

- Crontab: 0 \*/6 \* \* \*
- Quartz: 0 0 \*/6 \* \* ?
- Reads as: At 00:00, 06:00, 12:00 and 18:00.

## Check every 6 hours in your time zone

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+*%2F6+*+*+*&dialect=vixie&tz=America%2FNew_York)

## The next runs

From midnight on Monday, November 9, 2026, worked out the day this page is read.

| UTC | New York (from its own midnight) |
| --- | --- |
| Mon 2026-11-09 00:00 | Mon 2026-11-09 00:00 EST |
| Mon 2026-11-09 06:00 | Mon 2026-11-09 06:00 EST |
| Mon 2026-11-09 12:00 | Mon 2026-11-09 12:00 EST |
| Mon 2026-11-09 18:00 | Mon 2026-11-09 18:00 EST |
| Tue 2026-11-10 00:00 | Tue 2026-11-10 00:00 EST |
| Tue 2026-11-10 06:00 | Tue 2026-11-10 06:00 EST |

## The same schedule for each scheduler

Written from the meaning: Sunday is 0 in crontab and 1 in Quartz, UiPath and AWS; Quartz and AWS put ? in the day field they do not use.

| Scheduler | Expression |
| --- | --- |
| Linux crontab (Vixie cron) | `0 */6 * * *` |
| GitHub Actions | `0 */6 * * *` |
| Kubernetes CronJob | `0 */6 * * *` |
| Vercel Cron Jobs | `0 */6 * * *` |
| n8n Schedule Trigger (Custom cron) | `0 */6 * * *` |
| Quartz Scheduler | `0 0 */6 * * ?` |
| Spring @Scheduled | `0 0 */6 * * *` |
| UiPath Orchestrator time trigger | `0 0 */6 * * ?` |
| Amazon EventBridge Scheduler | `cron(0 0/6 * * ? *)` |

> Vercel Hobby accounts are limited to cron jobs that run once a day; this would fail to deploy on Hobby (Pro and Enterprise allow once a minute).

## Field by field

- Minutes: `0` (0)
- Hours: `*/6` (0, 6, 12, 18)
- Day of month: `*` (31 values)
- Month: `*` (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
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

- [Cron every hour](https://krishnachagti-sudo.github.io/toll-preview/cron/every-hour/)
- [Cron every 2 hours](https://krishnachagti-sudo.github.io/toll-preview/cron/every-2-hours/)
- [Cron every 3 hours](https://krishnachagti-sudo.github.io/toll-preview/cron/every-3-hours/)
- [Cron every 4 hours](https://krishnachagti-sudo.github.io/toll-preview/cron/every-4-hours/)
- [Cron every 8 hours](https://krishnachagti-sudo.github.io/toll-preview/cron/every-8-hours/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/every-6-hours/  
Worked out for: 2026-11-09  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/every-6-hours.csv
