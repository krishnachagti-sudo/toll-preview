# Cron every 3 minutes

The cron expression for every 3 minutes is \*/3 \* \* \* \*; from midnight UTC on Monday, November 9, 2026 it runs at 00:00, 00:03 and 00:06 UTC. In Quartz it is 0 \*/3 \* \* \* ?, and in AWS EventBridge cron(0/3 \* \* \* ? \*).

- Crontab: \*/3 \* \* \* \*
- Quartz: 0 \*/3 \* \* \* ?
- Reads as: Every 3 minutes.

## Check every 3 minutes in your time zone

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=*%2F3+*+*+*+*&dialect=vixie&tz=America%2FNew_York)

## The next runs

From midnight on Monday, November 9, 2026, worked out the day this page is read.

| UTC | New York (from its own midnight) |
| --- | --- |
| Mon 2026-11-09 00:00 |  |
| Mon 2026-11-09 00:03 |  |
| Mon 2026-11-09 00:06 |  |
| Mon 2026-11-09 00:09 |  |
| Mon 2026-11-09 00:12 |  |
| Mon 2026-11-09 00:15 |  |

## The same schedule for each scheduler

Written from the meaning: Sunday is 0 in crontab and 1 in Quartz, UiPath and AWS; Quartz and AWS put ? in the day field they do not use.

| Scheduler | Expression |
| --- | --- |
| Linux crontab (Vixie cron) | `*/3 * * * *` |
| GitHub Actions | `*/3 * * * *` |
| Kubernetes CronJob | `*/3 * * * *` |
| Vercel Cron Jobs | `*/3 * * * *` |
| n8n Schedule Trigger (Custom cron) | `*/3 * * * *` |
| Quartz Scheduler | `0 */3 * * * ?` |
| Spring @Scheduled | `0 */3 * * * *` |
| UiPath Orchestrator time trigger | `0 */3 * * * ?` |
| Amazon EventBridge Scheduler | `cron(0/3 * * * ? *)` |

> GitHub Actions runs a schedule at most once every 5 minutes; this asks for runs 3 minutes apart.

> Vercel Hobby accounts are limited to cron jobs that run once a day; this would fail to deploy on Hobby (Pro and Enterprise allow once a minute).

## Field by field

- Minutes: `*/3` (20 values)
- Hours: `*` (24 values)
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

- [Cron every minute](https://krishnachagti-sudo.github.io/toll-preview/cron/every-minute/)
- [Cron every 2 minutes](https://krishnachagti-sudo.github.io/toll-preview/cron/every-2-minutes/)
- [Cron every 4 minutes](https://krishnachagti-sudo.github.io/toll-preview/cron/every-4-minutes/)
- [Cron every 5 minutes](https://krishnachagti-sudo.github.io/toll-preview/cron/every-5-minutes/)
- [Cron every 10 minutes](https://krishnachagti-sudo.github.io/toll-preview/cron/every-10-minutes/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/every-3-minutes/  
Worked out for: 2026-11-09  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/every-3-minutes.csv
