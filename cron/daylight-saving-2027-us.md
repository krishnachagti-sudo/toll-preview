# US clock changes in 2027 and your cron jobs

In America/New\_York the clocks go forward on Sunday, March 14, 2027 (02:00 becomes 03:00) and back on Sunday, November 7, 2027 (02:00 becomes 01:00); a daily 02:30 job on March 14 runs soon after the change, at about 03:00 EDT in Linux crontab, runs at 03:00 EDT in GitHub Actions and is skipped by AWS EventBridge.

## Check your job around March 14

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=30+2+*+*+*&dialect=vixie&tz=America%2FNew_York&from=2027-03-13T00%3A00)

## March 14: a 02:30 job in America/New\_York

| Scheduler | What happens |
| --- | --- |
| Linux crontab (Vixie cron) | Runs soon after the change, at about 03:00 EDT. |
| GitHub Actions | Runs at 03:00 EDT (moved to the next valid time). |
| Kubernetes CronJob | Not documented: it may run soon after the change or be skipped. |
| Vercel Cron Jobs | Runs at 02:30 UTC; Vercel has no time zone setting, so nothing changes. |
| n8n Schedule Trigger (Custom cron) | Not documented: it may run soon after the change or be skipped. |
| Quartz Scheduler | Not documented: it may run soon after the change or be skipped. |
| Spring @Scheduled | Not documented: it may run soon after the change or be skipped. |
| UiPath Orchestrator time trigger | Not documented: it may run soon after the change or be skipped. |
| Amazon EventBridge Scheduler | Skipped that day. |

## November 7: a 01:30 job in America/New\_York

| Scheduler | What happens |
| --- | --- |
| Linux crontab (Vixie cron) | Runs once, at 01:30 EDT. |
| GitHub Actions | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| Kubernetes CronJob | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| Vercel Cron Jobs | Runs at 01:30 UTC; Vercel has no time zone setting, so nothing changes. |
| n8n Schedule Trigger (Custom cron) | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| Quartz Scheduler | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| Spring @Scheduled | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| UiPath Orchestrator time trigger | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| Amazon EventBridge Scheduler | Runs once, at 01:30 EDT. |

## Every US time zone in 2027

Worked out from the IANA time zone database.

| Time zone | Date | Clocks | UTC offset |
| --- | --- | --- | --- |
| America/New\_York | Sunday, March 14, 2027 | 02:00 becomes 03:00 | -05:00 to -04:00 |
| America/New\_York | Sunday, November 7, 2027 | 02:00 becomes 01:00 | -04:00 to -05:00 |
| America/Chicago | Sunday, March 14, 2027 | 02:00 becomes 03:00 | -06:00 to -05:00 |
| America/Chicago | Sunday, November 7, 2027 | 02:00 becomes 01:00 | -05:00 to -06:00 |
| America/Denver | Sunday, March 14, 2027 | 02:00 becomes 03:00 | -07:00 to -06:00 |
| America/Denver | Sunday, November 7, 2027 | 02:00 becomes 01:00 | -06:00 to -07:00 |
| America/Phoenix | No change |  |  |
| America/Los\_Angeles | Sunday, March 14, 2027 | 02:00 becomes 03:00 | -08:00 to -07:00 |
| America/Los\_Angeles | Sunday, November 7, 2027 | 02:00 becomes 01:00 | -07:00 to -08:00 |
| America/Anchorage | Sunday, March 14, 2027 | 02:00 becomes 03:00 | -09:00 to -08:00 |
| America/Anchorage | Sunday, November 7, 2027 | 02:00 becomes 01:00 | -08:00 to -09:00 |
| Pacific/Honolulu | No change |  |  |

## Sources

- [IANA: Time zone database](https://www.iana.org/time-zones)
- [Debian cron(8): clock changes (read November 8, 2026)](https://manpages.debian.org/bookworm/cron/cron.8.en.html)
- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)
- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)

## Related

- [Daylight saving time and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time/)
- [Europe clock changes 2027 and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/daylight-saving-2027-europe/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/daylight-saving-2027-us/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/daylight-saving-2027-us.csv
