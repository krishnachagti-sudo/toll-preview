# Europe clock changes in 2027 and your cron jobs

In Europe/London the clocks go forward on Sunday, March 28, 2027 (01:00 becomes 02:00) and back on Sunday, October 31, 2027 (02:00 becomes 01:00); a daily 01:30 job on March 28 runs soon after the change, at about 02:00 GMT+1 in Linux crontab, runs at 02:00 GMT+1 in GitHub Actions and is skipped by AWS EventBridge.

## Check your job around March 28

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=30+1+*+*+*&dialect=vixie&tz=Europe%2FLondon&from=2027-03-27T00%3A00)

## March 28: a 01:30 job in Europe/London

| Scheduler | What happens |
| --- | --- |
| Linux crontab (Vixie cron) | Runs soon after the change, at about 02:00 GMT+1. |
| GitHub Actions | Runs at 02:00 GMT+1 (moved to the next valid time). |
| Kubernetes CronJob | Not documented: it may run soon after the change or be skipped. |
| Vercel Cron Jobs | Runs at 01:30 UTC; Vercel has no time zone setting, so nothing changes. |
| n8n Schedule Trigger (Custom cron) | Not documented: it may run soon after the change or be skipped. |
| Quartz Scheduler | Not documented: it may run soon after the change or be skipped. |
| Spring @Scheduled | Not documented: it may run soon after the change or be skipped. |
| UiPath Orchestrator time trigger | Not documented: it may run soon after the change or be skipped. |
| Amazon EventBridge Scheduler | Skipped that day. |

## October 31: a 01:30 job in Europe/London

| Scheduler | What happens |
| --- | --- |
| Linux crontab (Vixie cron) | Runs once, at 01:30 GMT+1. |
| GitHub Actions | Runs at 01:30 GMT+1; its docs do not say whether it runs again an hour later. |
| Kubernetes CronJob | Runs at 01:30 GMT+1; its docs do not say whether it runs again an hour later. |
| Vercel Cron Jobs | Runs at 01:30 UTC; Vercel has no time zone setting, so nothing changes. |
| n8n Schedule Trigger (Custom cron) | Runs at 01:30 GMT+1; its docs do not say whether it runs again an hour later. |
| Quartz Scheduler | Runs at 01:30 GMT+1; its docs do not say whether it runs again an hour later. |
| Spring @Scheduled | Runs at 01:30 GMT+1; its docs do not say whether it runs again an hour later. |
| UiPath Orchestrator time trigger | Runs at 01:30 GMT+1; its docs do not say whether it runs again an hour later. |
| Amazon EventBridge Scheduler | Runs once, at 01:30 GMT+1. |

## Every Europe time zone in 2027

Worked out from the IANA time zone database.

| Time zone | Date | Clocks | UTC offset |
| --- | --- | --- | --- |
| Europe/London | Sunday, March 28, 2027 | 01:00 becomes 02:00 | +00:00 to +01:00 |
| Europe/London | Sunday, October 31, 2027 | 02:00 becomes 01:00 | +01:00 to +00:00 |
| Europe/Dublin | Sunday, March 28, 2027 | 01:00 becomes 02:00 | +00:00 to +01:00 |
| Europe/Dublin | Sunday, October 31, 2027 | 02:00 becomes 01:00 | +01:00 to +00:00 |
| Europe/Lisbon | Sunday, March 28, 2027 | 01:00 becomes 02:00 | +00:00 to +01:00 |
| Europe/Lisbon | Sunday, October 31, 2027 | 02:00 becomes 01:00 | +01:00 to +00:00 |
| Europe/Paris | Sunday, March 28, 2027 | 02:00 becomes 03:00 | +01:00 to +02:00 |
| Europe/Paris | Sunday, October 31, 2027 | 03:00 becomes 02:00 | +02:00 to +01:00 |
| Europe/Berlin | Sunday, March 28, 2027 | 02:00 becomes 03:00 | +01:00 to +02:00 |
| Europe/Berlin | Sunday, October 31, 2027 | 03:00 becomes 02:00 | +02:00 to +01:00 |
| Europe/Madrid | Sunday, March 28, 2027 | 02:00 becomes 03:00 | +01:00 to +02:00 |
| Europe/Madrid | Sunday, October 31, 2027 | 03:00 becomes 02:00 | +02:00 to +01:00 |
| Europe/Rome | Sunday, March 28, 2027 | 02:00 becomes 03:00 | +01:00 to +02:00 |
| Europe/Rome | Sunday, October 31, 2027 | 03:00 becomes 02:00 | +02:00 to +01:00 |
| Europe/Amsterdam | Sunday, March 28, 2027 | 02:00 becomes 03:00 | +01:00 to +02:00 |
| Europe/Amsterdam | Sunday, October 31, 2027 | 03:00 becomes 02:00 | +02:00 to +01:00 |
| Europe/Athens | Sunday, March 28, 2027 | 03:00 becomes 04:00 | +02:00 to +03:00 |
| Europe/Athens | Sunday, October 31, 2027 | 04:00 becomes 03:00 | +03:00 to +02:00 |
| Europe/Helsinki | Sunday, March 28, 2027 | 03:00 becomes 04:00 | +02:00 to +03:00 |
| Europe/Helsinki | Sunday, October 31, 2027 | 04:00 becomes 03:00 | +03:00 to +02:00 |

## Sources

- [IANA: Time zone database](https://www.iana.org/time-zones)
- [Debian cron(8): clock changes (read November 8, 2026)](https://manpages.debian.org/bookworm/cron/cron.8.en.html)
- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)
- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)

## Related

- [Daylight saving time and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time/)
- [US clock changes 2027 and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/daylight-saving-2027-us/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/daylight-saving-2027-europe/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/daylight-saving-2027-europe.csv
