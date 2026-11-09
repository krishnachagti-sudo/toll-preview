# GitHub Actions cron expressions

In GitHub Actions, every 5 minutes is \*/5 \* \* \* \*; GitHub Actions uses 5 fields (Sunday is 0) and runs in UTC unless you set a time zone.

- Fields: 5
- Sunday: 0
- Time zone: UTC unless set

## Check a GitHub Actions expression

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+9+*+*+1-5&dialect=github&tz=America%2FNew_York)

## What the docs say

- Five fields, POSIX cron syntax; months JAN-DEC and days SUN-SAT allowed; 20/15 in the minute field means minutes 20, 35 and 50.
- The shortest interval is once every 5 minutes.
- UTC by default; a schedule can set timezone to an IANA name. In the spring-forward gap a run advances to the next valid time (2:30 am runs at 3:00 am).
- The schedule event can be delayed at high load, which includes the start of every hour; at enough load some queued jobs may be dropped.
- Scheduled workflows run only on the default branch, and in a public repository they are disabled after 60 days with no repository activity.
- The @yearly, @monthly, @weekly, @daily, @hourly and @reboot strings are not supported.

## Common schedules in GitHub Actions

Each written from its meaning by the checker's engine; where this scheduler cannot say it, the reason is given.

| Schedule | GitHub Actions |
| --- | --- |
| Every 5 minutes | `*/5 * * * *` |
| Every 30 seconds | Not possible: GitHub Actions has no seconds field, and this runs at seconds 0 and 30. |
| Every hour, on the hour | `0 * * * *` |
| Every day at midnight | `0 0 * * *` |
| Every weekday at 9:00 | `0 9 * * 1-5` |
| Every Monday at 9:00 | `0 9 * * 1` |
| Every 15 minutes, 9:00 to 17:45, Monday to Friday | `*/15 9-17 * * 1-5` |
| The 1st of the month at midnight | `0 0 1 * *` |
| The 1st and 15th at midnight | `0 0 1,15 * *` |
| The last day of the month at midnight | Not possible: GitHub Actions has no L or W in the day of month. |
| The last Friday of the month at midnight | Not possible: GitHub Actions has no L or # in the day of week. |
| The first Monday of the month at midnight | Not possible: GitHub Actions has no L or # in the day of week. |

## Weekdays at 9:00, ready to paste

```
on:
  schedule:
    - cron: '0 9 * * 1-5'
      timezone: "America/New_York"
```

## Daylight saving time

GitHub: with a time zone that observes daylight saving time, a run in the skipped hour advances to the next valid time (2:30 am runs at 3:00 am). GitHub's docs do not say what happens in the repeated hour when the clocks go back.

A 2:30 am daily job in New York around the March 14, 2027 change: Sunday 2027-03-14 03:00 EDT (2027-03-14 02:30 does not exist (the clocks go forward); GitHub advances it to the next valid time.); Monday 2027-03-15 02:30 EDT.

Weekdays at 9:00 in New York (0 9 \* \* 1-5), from March 12, 2027: Friday 2027-03-12 09:00 EST (14:00 UTC); Monday 2027-03-15 09:00 EDT (13:00 UTC); Tuesday 2027-03-16 09:00 EDT (13:00 UTC).

## Sources

- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)

## Questions

### How many fields does a GitHub Actions cron expression have?

5: minutes, hours, day of month, month, day of week.

### What does GitHub Actions do when the clocks change?

GitHub: with a time zone that observes daylight saving time, a run in the skipped hour advances to the next valid time (2:30 am runs at 3:00 am). GitHub's docs do not say what happens in the repeated hour when the clocks go back.

## Related

- [Linux crontab (Vixie cron) cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/linux-crontab/)
- [Kubernetes CronJob cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/kubernetes/)
- [Vercel Cron Jobs cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/vercel/)
- [n8n Schedule Trigger (Custom cron) cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/n8n/)
- [Quartz Scheduler cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/quartz/)
- [Spring @Scheduled cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/spring-boot/)
- [UiPath Orchestrator time trigger cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/uipath/)
- [Amazon EventBridge Scheduler cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/aws-eventbridge/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/for/github-actions/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/for/github-actions.csv
