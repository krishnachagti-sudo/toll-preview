# Daylight saving time and cron

It depends on the scheduler: on Sunday, March 14, 2027 in New York (2:00 am becomes 3:00 am) a daily 2:30 am job runs soon after the change in Debian cron, is skipped by AWS EventBridge and moves to 3:00 am in GitHub Actions; on November 7, 2027 (2:00 am becomes 1:00 am) a 1:30 am job runs once in Debian cron and EventBridge, while most other schedulers do not document it.

## Check your job around the next change

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=30+2+*+*+*&dialect=vixie&tz=America%2FNew_York&from=2027-03-13T00%3A00)

## Spring forward: 2:30 am in New York, March 14, 2027

| Scheduler | Expression | What happens |
| --- | --- | --- |
| Linux crontab (Vixie cron) | `30 2 * * *` | Runs soon after the change, at about 03:00 EDT. |
| GitHub Actions | `30 2 * * *` | Runs at 03:00 EDT (moved to the next valid time). |
| Kubernetes CronJob | `30 2 * * *` | Not documented: it may run soon after the change or be skipped. |
| Vercel Cron Jobs | `30 2 * * *` | Runs at 02:30 UTC; Vercel has no time zone setting, so nothing changes. |
| n8n Schedule Trigger (Custom cron) | `30 2 * * *` | Not documented: it may run soon after the change or be skipped. |
| Quartz Scheduler | `0 30 2 * * ?` | Not documented: it may run soon after the change or be skipped. |
| Spring @Scheduled | `0 30 2 * * *` | Not documented: it may run soon after the change or be skipped. |
| UiPath Orchestrator time trigger | `0 30 2 * * ?` | Not documented: it may run soon after the change or be skipped. |
| Amazon EventBridge Scheduler | `cron(30 2 * * ? *)` | Skipped that day. |

## Fall back: 1:30 am in New York, November 7, 2027

| Scheduler | Expression | What happens |
| --- | --- | --- |
| Linux crontab (Vixie cron) | `30 1 * * *` | Runs once, at 01:30 EDT. |
| GitHub Actions | `30 1 * * *` | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| Kubernetes CronJob | `30 1 * * *` | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| Vercel Cron Jobs | `30 1 * * *` | Runs at 01:30 UTC; Vercel has no time zone setting, so nothing changes. |
| n8n Schedule Trigger (Custom cron) | `30 1 * * *` | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| Quartz Scheduler | `0 30 1 * * ?` | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| Spring @Scheduled | `0 30 1 * * *` | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| UiPath Orchestrator time trigger | `0 30 1 * * ?` | Runs at 01:30 EDT; its docs do not say whether it runs again an hour later. |
| Amazon EventBridge Scheduler | `cron(30 1 * * ? *)` | Runs once, at 01:30 EDT. |

> Debian cron treats a job with \* in the minute or hour field (such as \*/15 \* \* \* \*) differently: it runs on the new time immediately, so in the repeated hour it runs both times.

## Clock changes 2026 to 2030

Worked out from the IANA time zone database.

| Time zone | Date | Direction | Clocks |
| --- | --- | --- | --- |
| America/New\_York | Sunday, March 8, 2026 | Forward | 02:00 becomes 03:00 |
| America/New\_York | Sunday, November 1, 2026 | Back | 02:00 becomes 01:00 |
| America/New\_York | Sunday, March 14, 2027 | Forward | 02:00 becomes 03:00 |
| America/New\_York | Sunday, November 7, 2027 | Back | 02:00 becomes 01:00 |
| America/New\_York | Sunday, March 12, 2028 | Forward | 02:00 becomes 03:00 |
| America/New\_York | Sunday, November 5, 2028 | Back | 02:00 becomes 01:00 |
| America/New\_York | Sunday, March 11, 2029 | Forward | 02:00 becomes 03:00 |
| America/New\_York | Sunday, November 4, 2029 | Back | 02:00 becomes 01:00 |
| America/New\_York | Sunday, March 10, 2030 | Forward | 02:00 becomes 03:00 |
| America/New\_York | Sunday, November 3, 2030 | Back | 02:00 becomes 01:00 |
| America/Los\_Angeles | Sunday, March 8, 2026 | Forward | 02:00 becomes 03:00 |
| America/Los\_Angeles | Sunday, November 1, 2026 | Back | 02:00 becomes 01:00 |
| America/Los\_Angeles | Sunday, March 14, 2027 | Forward | 02:00 becomes 03:00 |
| America/Los\_Angeles | Sunday, November 7, 2027 | Back | 02:00 becomes 01:00 |
| America/Los\_Angeles | Sunday, March 12, 2028 | Forward | 02:00 becomes 03:00 |
| America/Los\_Angeles | Sunday, November 5, 2028 | Back | 02:00 becomes 01:00 |
| America/Los\_Angeles | Sunday, March 11, 2029 | Forward | 02:00 becomes 03:00 |
| America/Los\_Angeles | Sunday, November 4, 2029 | Back | 02:00 becomes 01:00 |
| America/Los\_Angeles | Sunday, March 10, 2030 | Forward | 02:00 becomes 03:00 |
| America/Los\_Angeles | Sunday, November 3, 2030 | Back | 02:00 becomes 01:00 |
| Europe/London | Sunday, March 29, 2026 | Forward | 01:00 becomes 02:00 |
| Europe/London | Sunday, October 25, 2026 | Back | 02:00 becomes 01:00 |
| Europe/London | Sunday, March 28, 2027 | Forward | 01:00 becomes 02:00 |
| Europe/London | Sunday, October 31, 2027 | Back | 02:00 becomes 01:00 |
| Europe/London | Sunday, March 26, 2028 | Forward | 01:00 becomes 02:00 |
| Europe/London | Sunday, October 29, 2028 | Back | 02:00 becomes 01:00 |
| Europe/London | Sunday, March 25, 2029 | Forward | 01:00 becomes 02:00 |
| Europe/London | Sunday, October 28, 2029 | Back | 02:00 becomes 01:00 |
| Europe/London | Sunday, March 31, 2030 | Forward | 01:00 becomes 02:00 |
| Europe/London | Sunday, October 27, 2030 | Back | 02:00 becomes 01:00 |
| Europe/Berlin | Sunday, March 29, 2026 | Forward | 02:00 becomes 03:00 |
| Europe/Berlin | Sunday, October 25, 2026 | Back | 03:00 becomes 02:00 |
| Europe/Berlin | Sunday, March 28, 2027 | Forward | 02:00 becomes 03:00 |
| Europe/Berlin | Sunday, October 31, 2027 | Back | 03:00 becomes 02:00 |
| Europe/Berlin | Sunday, March 26, 2028 | Forward | 02:00 becomes 03:00 |
| Europe/Berlin | Sunday, October 29, 2028 | Back | 03:00 becomes 02:00 |
| Europe/Berlin | Sunday, March 25, 2029 | Forward | 02:00 becomes 03:00 |
| Europe/Berlin | Sunday, October 28, 2029 | Back | 03:00 becomes 02:00 |
| Europe/Berlin | Sunday, March 31, 2030 | Forward | 02:00 becomes 03:00 |
| Europe/Berlin | Sunday, October 27, 2030 | Back | 03:00 becomes 02:00 |
| Australia/Sydney | Sunday, April 5, 2026 | Back | 03:00 becomes 02:00 |
| Australia/Sydney | Sunday, October 4, 2026 | Forward | 02:00 becomes 03:00 |
| Australia/Sydney | Sunday, April 4, 2027 | Back | 03:00 becomes 02:00 |
| Australia/Sydney | Sunday, October 3, 2027 | Forward | 02:00 becomes 03:00 |
| Australia/Sydney | Sunday, April 2, 2028 | Back | 03:00 becomes 02:00 |
| Australia/Sydney | Sunday, October 1, 2028 | Forward | 02:00 becomes 03:00 |
| Australia/Sydney | Sunday, April 1, 2029 | Back | 03:00 becomes 02:00 |
| Australia/Sydney | Sunday, October 7, 2029 | Forward | 02:00 becomes 03:00 |
| Australia/Sydney | Sunday, April 7, 2030 | Back | 03:00 becomes 02:00 |
| Australia/Sydney | Sunday, October 6, 2030 | Forward | 02:00 becomes 03:00 |

## Sources

- [Debian cron(8): clock changes (read November 8, 2026)](https://manpages.debian.org/bookworm/cron/cron.8.en.html)
- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)
- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Quartz 2.3 tutorial: CronTrigger (read November 8, 2026)](https://www.quartz-scheduler.org/documentation/quartz-2.3.0/tutorials/crontrigger.html)
- [Kubernetes docs: CronJob (read November 8, 2026)](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
- [n8n docs: Schedule Trigger node (read November 8, 2026)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)
- [IANA: Time zone database](https://www.iana.org/time-zones)

## Steps

1. **Find the risky hour.** In the US the clocks change at 2:00 am local time; in the EU at 01:00 UTC. Jobs between 1:00 and 3:00 local time are the ones affected.
2. **Know your scheduler's rule.** Debian cron runs a skipped fixed-time job soon after the change and does not repeat one; EventBridge skips it and runs once; GitHub moves it to 3:00. Most others do not document it.
3. **Prefer UTC for jobs that must run exactly once.** UTC has no clock changes; or schedule outside the changing hours.
4. **Test the next runs around the change.** Put the expression, time zone and a start date before the change into the checker.

## Related

- [US clock changes 2027 and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/daylight-saving-2027-us/)
- [Europe clock changes 2027 and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/daylight-saving-2027-europe/)
- [GitHub Actions cron time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-timezone/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time.csv
