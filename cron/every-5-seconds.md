# Cron every 5 seconds

Standard 5-field cron cannot run every 5 seconds (in crontab it is not possible): its smallest unit is the minute. In n8n and Spring, which have a seconds field, it is \*/5 \* \* \* \* \* (Quartz: \*/5 \* \* \* \* ?); from midnight UTC on Monday, November 9, 2026 it runs at 00:00:00, 00:00:05 and 00:00:10 UTC.

- Crontab: not possible
- Quartz: \*/5 \* \* \* \* ?
- Reads as: Every 5 seconds.

## Check every 5 seconds in your time zone

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=*%2F5+*+*+*+*+*&dialect=n8n&tz=America%2FNew_York)

## The next runs

From midnight on Monday, November 9, 2026, worked out the day this page is read.

| UTC | New York (from its own midnight) |
| --- | --- |
| Mon 2026-11-09 00:00:00 |  |
| Mon 2026-11-09 00:00:05 |  |
| Mon 2026-11-09 00:00:10 |  |
| Mon 2026-11-09 00:00:15 |  |
| Mon 2026-11-09 00:00:20 |  |
| Mon 2026-11-09 00:00:25 |  |

## The same schedule for each scheduler

Written from the meaning: Sunday is 0 in crontab and 1 in Quartz, UiPath and AWS; Quartz and AWS put ? in the day field they do not use.

| Scheduler | Expression |
| --- | --- |
| Linux crontab (Vixie cron) | Not possible: Linux crontab (Vixie cron) has no seconds field, and this runs at seconds 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50 and 55. |
| GitHub Actions | Not possible: GitHub Actions has no seconds field, and this runs at seconds 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50 and 55. |
| Kubernetes CronJob | Not possible: Kubernetes CronJob has no seconds field, and this runs at seconds 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50 and 55. |
| Vercel Cron Jobs | Not possible: Vercel Cron Jobs has no seconds field, and this runs at seconds 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50 and 55. |
| n8n Schedule Trigger (Custom cron) | `*/5 * * * * *` |
| Quartz Scheduler | `*/5 * * * * ?` |
| Spring @Scheduled | `*/5 * * * * *` |
| UiPath Orchestrator time trigger | `*/5 * * * * ?` |
| Amazon EventBridge Scheduler | Not possible: Amazon EventBridge Scheduler has no seconds field, and this runs at seconds 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50 and 55. |

## In crontab

Crontab cannot. A common workaround runs the job every minute and again after a 5-second pause, one line per offset:

```
* * * * * /path/to/command
* * * * * sleep 5; /path/to/command
* * * * * sleep 10; /path/to/command
* * * * * sleep 15; /path/to/command
* * * * * sleep 20; /path/to/command
* * * * * sleep 25; /path/to/command
* * * * * sleep 30; /path/to/command
* * * * * sleep 35; /path/to/command
* * * * * sleep 40; /path/to/command
* * * * * sleep 45; /path/to/command
* * * * * sleep 50; /path/to/command
* * * * * sleep 55; /path/to/command
```

AWS EventBridge cron expressions start at minutes, and its scheduled rules do not support rates faster than one minute.

## Field by field

- Seconds: `*/5` (0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
- Minutes: `*` (60 values)
- Hours: `*` (24 values)
- Day of month: `*` (31 values)
- Month: `*` (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
- Day of week: `*` (Sunday, Monday, Tuesday, Wednesday, Thursday, Friday, Saturday)

## Sources

- [Debian crontab(5), cron 3.0pl1-197 (Vixie cron) (read November 8, 2026)](https://manpages.debian.org/trixie/cron/crontab.5.en.html)
- [Quartz 2.3 tutorial: CronTrigger (read November 8, 2026)](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)
- [n8n docs: Schedule Trigger node (read November 8, 2026)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)
- [Spring Framework reference: Task execution and scheduling, cron expressions (read November 8, 2026)](https://docs.spring.io/spring-framework/reference/integration/scheduling.html)

## Questions

### Can crontab run every 5 seconds?

No. A crontab line has five fields and the smallest is the minute (crontab(5)). Schedulers with a seconds field (n8n, Spring, Quartz, UiPath) can.

### Which time zone does it run in?

The scheduler's: crontab uses the cron daemon's time zone, GitHub Actions UTC unless the schedule sets timezone, Kubernetes the controller manager's unless .spec.timeZone is set, Vercel always UTC, and AWS EventBridge Scheduler UTC unless the schedule sets one.

## Related

- [Cron every 10 seconds](https://krishnachagti-sudo.github.io/toll-preview/cron/every-10-seconds/)
- [Cron every 15 seconds](https://krishnachagti-sudo.github.io/toll-preview/cron/every-15-seconds/)
- [Cron every 30 seconds](https://krishnachagti-sudo.github.io/toll-preview/cron/every-30-seconds/)
- [Cron syntax cheat sheet](https://krishnachagti-sudo.github.io/toll-preview/cron/cheat-sheet/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/every-5-seconds/  
Worked out for: 2026-11-09  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/every-5-seconds.csv
