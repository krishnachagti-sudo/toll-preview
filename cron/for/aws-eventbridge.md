# Amazon EventBridge Scheduler cron expressions

In AWS EventBridge, every 5 minutes is cron(0/5 \* \* \* ? \*); Amazon EventBridge Scheduler uses 6 fields (Sunday is 1) and runs in UTC unless you set a time zone.

- Fields: 6
- Sunday: 1
- Time zone: UTC unless set

## Check a Amazon EventBridge Scheduler expression

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=cron%280+9+%3F+*+2-6+*%29&dialect=aws&tz=America%2FNew_York)

## What the docs say

- Six required fields inside cron(...): minutes, hours, day of month, month, day of week (1-7 or SUN-SAT), year (1970-2199).
- One of day of month and day of week must be ?.
- L and W in day of month; L and # in day of week (3#2 is the second Tuesday; only one # expression).
- EventBridge Scheduler runs in UTC or a time zone you set (IANA names) and invokes targets with 60-second precision.
- When the clocks go forward a run at a time that does not exist is skipped; when they go back it runs only once. Legacy scheduled rules run in UTC and do not support rates faster than 1 minute.

## Common schedules in Amazon EventBridge Scheduler

Each written from its meaning by the checker's engine; where this scheduler cannot say it, the reason is given.

| Schedule | Amazon EventBridge Scheduler |
| --- | --- |
| Every 5 minutes | `cron(0/5 * * * ? *)` |
| Every 30 seconds | Not possible: Amazon EventBridge Scheduler has no seconds field, and this runs at seconds 0 and 30. |
| Every hour, on the hour | `cron(0 * * * ? *)` |
| Every day at midnight | `cron(0 0 * * ? *)` |
| Every weekday at 9:00 | `cron(0 9 ? * 2-6 *)` |
| Every Monday at 9:00 | `cron(0 9 ? * 2 *)` |
| Every 15 minutes, 9:00 to 17:45, Monday to Friday | `cron(0/15 9-17 ? * 2-6 *)` |
| The 1st of the month at midnight | `cron(0 0 1 * ? *)` |
| The 1st and 15th at midnight | `cron(0 0 1,15 * ? *)` |
| The last day of the month at midnight | `cron(0 0 L * ? *)` |
| The last Friday of the month at midnight | `cron(0 0 ? * 6L *)` |
| The first Monday of the month at midnight | `cron(0 0 ? * 2#1 *)` |

## Weekdays at 9:00, ready to paste

```
aws scheduler create-schedule --schedule-expression "cron(0 9 ? * 2-6 *)" --schedule-expression-timezone "America/New_York" ...
```

## Daylight saving time

EventBridge Scheduler: a run at a time that does not exist when the clocks go forward is skipped; when they go back, it runs only once.

A 2:30 am daily job in New York around the March 14, 2027 change: 2027-03-14 02:30 skipped; Monday 2027-03-15 02:30 EDT; Tuesday 2027-03-16 02:30 EDT.

Weekdays at 9:00 in New York (cron(0 9 ? \* 2-6 \*)), from March 12, 2027: Friday 2027-03-12 09:00 EST (14:00 UTC); Monday 2027-03-15 09:00 EDT (13:00 UTC); Tuesday 2027-03-16 09:00 EDT (13:00 UTC).

## Sources

- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)
- [Amazon EventBridge: Schedule patterns for scheduled rules (legacy) (read November 8, 2026)](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-scheduled-rule-pattern.html)

## Questions

### How many fields does a Amazon EventBridge Scheduler cron expression have?

6: minutes, hours, day of month, month, day of week, year.

### What does Amazon EventBridge Scheduler do when the clocks change?

EventBridge Scheduler: a run at a time that does not exist when the clocks go forward is skipped; when they go back, it runs only once.

## Related

- [Linux crontab (Vixie cron) cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/linux-crontab/)
- [GitHub Actions cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/github-actions/)
- [Kubernetes CronJob cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/kubernetes/)
- [Vercel Cron Jobs cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/vercel/)
- [n8n Schedule Trigger (Custom cron) cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/n8n/)
- [Quartz Scheduler cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/quartz/)
- [Spring @Scheduled cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/spring-boot/)
- [UiPath Orchestrator time trigger cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/uipath/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/for/aws-eventbridge/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/for/aws-eventbridge.csv
