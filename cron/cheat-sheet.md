# Cron cheat sheet

A cron expression has 5 fields: minute (0-59), hour (0-23), day of month (1-31), month (1-12), day of week (0-6, Sunday = 0); Quartz, Spring and UiPath add seconds in front, and Quartz, UiPath and AWS EventBridge a year at the end, with Sunday = 1.

## Read any expression

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+*%2F2+*+*+*&dialect=vixie&tz=UTC)

## The fields

| Field | Values | Notes |
| --- | --- | --- |
| Minute | 0-59 |  |
| Hour | 0-23 | 24-hour clock |
| Day of month | 1-31 | Quartz/AWS: L, W, ? |
| Month | 1-12 or JAN-DEC | Vercel: numbers only |
| Day of week | 0-6 or SUN-SAT | Sunday 0 (crontab, Spring also 7); 1 in Quartz, UiPath, AWS |
| Seconds (first) | 0-59 | Quartz, Spring, UiPath; optional in n8n |
| Year (last) | 1970-2099 / 2199 | Quartz, UiPath (optional); AWS (required, to 2199) |

## Characters

- `*` every value
- `a-b` a range, inclusive
- `a,b` a list
- `*/n` or `a-b/n` every nth value; GitHub, Quartz and AWS also take `a/n`
- `?` no specific value: required in one day field in Quartz and AWS; the same as \* in Kubernetes and Spring
- `L` last day of the month, or `5L` the last Friday (Quartz numbers it 6L)
- `W` nearest weekday: `15W`
- `#` nth weekday: `6#3` is the third Friday in Quartz and AWS

## Common expressions

| Schedule | Expression | Reads as |
| --- | --- | --- |
| Every minute | `* * * * *` | Every minute. |
| Every 5 minutes | `*/5 * * * *` | Every 5 minutes. |
| Every 15 minutes | `*/15 * * * *` | Every 15 minutes. |
| Every hour | `0 * * * *` | At minute 0 past every hour. |
| Every 2 hours | `0 */2 * * *` | At minute 0 past every 2nd hour. |
| Every day at midnight | `0 0 * * *` | At 00:00. |
| Every day at 9:30 | `30 9 * * *` | At 09:30. |
| Weekdays at 9:00 | `0 9 * * 1-5` | At 09:00, on weekdays (Monday to Friday). |
| Weekends at 10:00 | `0 10 * * 0,6` | At 10:00, on Saturdays and Sundays. |
| Every Monday at 8:00 | `0 8 * * 1` | At 08:00, on Monday. |
| 1st of the month | `0 0 1 * *` | At 00:00, on the 1st of the month. |
| 1st and 15th | `0 0 1,15 * *` | At 00:00, on the 1st and 15th of the month. |
| Every quarter | `0 0 1 1,4,7,10 *` | At 00:00, on the 1st of the month, every 3 months from January. |
| Once a year | `0 0 1 1 *` | At 00:00, on the 1st of the month, in January. |
| Every 10 minutes, 8:00 to 18:50 | `*/10 8-18 * * *` | Every 10 minutes from 08:00 through 18:59. |

## What cron cannot say directly

- The last day of the month: use L where it exists, otherwise days 28-31 and a date check (see [the last-day page](https://krishnachagti-sudo.github.io/toll-preview/cron/last-day-of-month/)).
- Every 90 minutes: steps restart every hour and every day, so it takes two lines, `0 0-21/3 * * *` and `30 1-22/3 * * *`, which run at 00:00, 01:30, 03:00, 04:30, 06:00 and 07:30 UTC and on.
- Day of month AND day of week (the 13th only if it is a Friday): crontab runs on either; check the weekday inside the job.
- Public holidays: cron has no calendar; see [running only on business days](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/business-days-only/).

## Sources

- [Debian crontab(5), cron 3.0pl1-197 (Vixie cron) (read November 8, 2026)](https://manpages.debian.org/trixie/cron/crontab.5.en.html)
- [Quartz 2.3 tutorial: CronTrigger (read November 8, 2026)](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- [Spring Framework reference: Task execution and scheduling, cron expressions (read November 8, 2026)](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)
- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)
- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Vercel docs: Cron Jobs (read November 8, 2026)](https://vercel.com/docs/cron-jobs)

## Questions

### What does 0 \*/2 \* \* \* mean?

At minute 0 past every 2nd hour. That is 00:00, 02:00, 04:00 and so on, in the scheduler's time zone.

### What does each cron field mean?

In order: minute (0-59), hour (0-23), day of month (1-31), month (1-12 or JAN-DEC), day of week (0-6 with Sunday as 0, or SUN-SAT; crontab and Spring also take 7 for Sunday).

### How do I run a cron job on the last day of the month?

Crontab has no last-day token: run on days 28 to 31 and check inside the job whether tomorrow is the 1st. Quartz, Spring, UiPath and AWS EventBridge have L in the day-of-month field.

## Related

- [Unix cron vs Quartz cron](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/unix-vs-quartz/)
- [Cron on the last day of the month](https://krishnachagti-sudo.github.io/toll-preview/cron/last-day-of-month/)
- [Daylight saving time and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet.csv
