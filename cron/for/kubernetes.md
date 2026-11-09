# Kubernetes CronJob cron expressions

In a Kubernetes CronJob, every 5 minutes is \*/5 \* \* \* \*; Kubernetes CronJob uses 5 fields (Sunday is 0) and runs in the kube-controller-manager's local time zone.

- Fields: 5
- Sunday: 0
- Time zone: Scheduler's, or set

## Check a Kubernetes CronJob expression

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+9+*+*+1-5&dialect=kubernetes&tz=America%2FNew_York)

## What the docs say

- Five fields in .spec.schedule; days 0-6 (Sunday to Saturday) or sun-sat; Vixie-style steps such as \*/2.
- A ? means the same as \*.
- @yearly (or @annually), @monthly, @weekly, @daily (or @midnight) and @hourly are allowed.
- Without .spec.timeZone the schedule follows the kube-controller-manager's local time zone; CRON\_TZ or TZ inside .spec.schedule is refused with a validation error.
- startingDeadlineSeconds skips a run that could not start in time; after more than 100 missed schedules the controller records a warning and starts only the most recent.

## Common schedules in Kubernetes CronJob

Each written from its meaning by the checker's engine; where this scheduler cannot say it, the reason is given.

| Schedule | Kubernetes CronJob |
| --- | --- |
| Every 5 minutes | `*/5 * * * *` |
| Every 30 seconds | Not possible: Kubernetes CronJob has no seconds field, and this runs at seconds 0 and 30. |
| Every hour, on the hour | `0 * * * *` |
| Every day at midnight | `0 0 * * *` |
| Every weekday at 9:00 | `0 9 * * 1-5` |
| Every Monday at 9:00 | `0 9 * * 1` |
| Every 15 minutes, 9:00 to 17:45, Monday to Friday | `*/15 9-17 * * 1-5` |
| The 1st of the month at midnight | `0 0 1 * *` |
| The 1st and 15th at midnight | `0 0 1,15 * *` |
| The last day of the month at midnight | Not possible: Kubernetes CronJob has no L or W in the day of month. |
| The last Friday of the month at midnight | Not possible: Kubernetes CronJob has no L or # in the day of week. |
| The first Monday of the month at midnight | Not possible: Kubernetes CronJob has no L or # in the day of week. |

## Weekdays at 9:00, ready to paste

```
spec:
  schedule: "0 9 * * 1-5"
  timeZone: "America/New_York"
```

## Daylight saving time

Kubernetes CronJob's docs do not say what happens to a run in the skipped or repeated hour at a daylight saving change; those runs are flagged.

A 2:30 am daily job in New York around the March 14, 2027 change: Sunday 2027-03-14 03:00 EDT (2027-03-14 02:30 does not exist (the clocks go forward); this scheduler's docs do not say whether it runs soon after or is skipped.); Monday 2027-03-15 02:30 EDT.

Weekdays at 9:00 in New York (0 9 \* \* 1-5), from March 12, 2027: Friday 2027-03-12 09:00 EST (14:00 UTC); Monday 2027-03-15 09:00 EDT (13:00 UTC); Tuesday 2027-03-16 09:00 EDT (13:00 UTC).

## Sources

- [Kubernetes docs: CronJob (read November 8, 2026)](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)

## Questions

### How many fields does a Kubernetes CronJob cron expression have?

5: minutes, hours, day of month, month, day of week.

### What does Kubernetes CronJob do when the clocks change?

Kubernetes CronJob's docs do not say what happens to a run in the skipped or repeated hour at a daylight saving change; those runs are flagged.

## Related

- [Linux crontab (Vixie cron) cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/linux-crontab/)
- [GitHub Actions cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/github-actions/)
- [Vercel Cron Jobs cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/vercel/)
- [n8n Schedule Trigger (Custom cron) cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/n8n/)
- [Quartz Scheduler cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/quartz/)
- [Spring @Scheduled cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/spring-boot/)
- [UiPath Orchestrator time trigger cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/uipath/)
- [Amazon EventBridge Scheduler cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/aws-eventbridge/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/for/kubernetes/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/for/kubernetes.csv
