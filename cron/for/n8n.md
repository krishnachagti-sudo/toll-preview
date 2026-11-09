# n8n Schedule Trigger (Custom cron) cron expressions

In n8n, every 5 minutes is \*/5 \* \* \* \*; n8n Schedule Trigger (Custom cron) uses 5 or 6 fields (Sunday is 0) and runs in the workflow time zone, else the instance time zone (America/New\_York by default when self-hosted).

- Fields: 5 or 6
- Sunday: 0
- Time zone: Scheduler's, or set

## Check a n8n Schedule Trigger (Custom cron) expression

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+9+*+*+1-5&dialect=n8n&tz=America%2FNew_York)

## What the docs say

- The Custom (Cron) interval takes five fields, with an optional sixth, leading field for seconds (\*/10 \* \* \* \* \* is every 10 seconds).
- The workflow time zone is used if set, otherwise the instance time zone; self-hosted instances default to America/New York.
- The workflow must be saved and published before the trigger runs.
- From n8n 2.45.0 the Seconds and Minutes intervals run at even gaps measured from publication, not on clock boundaries; Custom (Cron) keeps clock timing.
- From n8n 2.36, If Execution Is Missed can discard missed runs (the default), or run the most recent one.

## Common schedules in n8n Schedule Trigger (Custom cron)

Each written from its meaning by the checker's engine; where this scheduler cannot say it, the reason is given.

| Schedule | n8n Schedule Trigger (Custom cron) |
| --- | --- |
| Every 5 minutes | `*/5 * * * *` |
| Every 30 seconds | `*/30 * * * * *` |
| Every hour, on the hour | `0 * * * *` |
| Every day at midnight | `0 0 * * *` |
| Every weekday at 9:00 | `0 9 * * 1-5` |
| Every Monday at 9:00 | `0 9 * * 1` |
| Every 15 minutes, 9:00 to 17:45, Monday to Friday | `*/15 9-17 * * 1-5` |
| The 1st of the month at midnight | `0 0 1 * *` |
| The 1st and 15th at midnight | `0 0 1,15 * *` |
| The last day of the month at midnight | Not possible: n8n Schedule Trigger (Custom cron) has no L or W in the day of month. |
| The last Friday of the month at midnight | Not possible: n8n Schedule Trigger (Custom cron) has no L or # in the day of week. |
| The first Monday of the month at midnight | Not possible: n8n Schedule Trigger (Custom cron) has no L or # in the day of week. |

## Weekdays at 9:00, ready to paste

```
Trigger Interval: Custom (Cron)
Expression: 0 9 * * 1-5
Workflow settings > Timezone: America/New_York
```

## Daylight saving time

n8n Schedule Trigger (Custom cron)'s docs do not say what happens to a run in the skipped or repeated hour at a daylight saving change; those runs are flagged.

A 2:30 am daily job in New York around the March 14, 2027 change: Sunday 2027-03-14 03:00 EDT (2027-03-14 02:30 does not exist (the clocks go forward); this scheduler's docs do not say whether it runs soon after or is skipped.); Monday 2027-03-15 02:30 EDT.

Weekdays at 9:00 in New York (0 9 \* \* 1-5), from March 12, 2027: Friday 2027-03-12 09:00 EST (14:00 UTC); Monday 2027-03-15 09:00 EDT (13:00 UTC); Tuesday 2027-03-16 09:00 EDT (13:00 UTC).

## Sources

- [n8n docs: Schedule Trigger node (read November 8, 2026)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)

## Questions

### How many fields does a n8n Schedule Trigger (Custom cron) cron expression have?

5 or 6: seconds, minutes, hours, day of month, month, day of week (the seconds field is optional).

### What does n8n Schedule Trigger (Custom cron) do when the clocks change?

n8n Schedule Trigger (Custom cron)'s docs do not say what happens to a run in the skipped or repeated hour at a daylight saving change; those runs are flagged.

## Related

- [Linux crontab (Vixie cron) cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/linux-crontab/)
- [GitHub Actions cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/github-actions/)
- [Kubernetes CronJob cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/kubernetes/)
- [Vercel Cron Jobs cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/vercel/)
- [Quartz Scheduler cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/quartz/)
- [Spring @Scheduled cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/spring-boot/)
- [UiPath Orchestrator time trigger cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/uipath/)
- [Amazon EventBridge Scheduler cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/aws-eventbridge/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/for/n8n/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/for/n8n.csv
