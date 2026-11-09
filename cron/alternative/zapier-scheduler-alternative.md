# Zapier schedule alternatives

Schedule by Zapier offers Every Hour, Day, Week, Month and a custom frequency, in your account's time zone, and its help article describes nothing shorter than hourly; n8n's Custom (Cron) interval goes down to seconds (\*/2 \* \* \* \* is every 2 minutes), AWS EventBridge to a minute (cron(0/2 \* \* \* ? \*)), and GitHub Actions to 5 minutes.

## What Schedule by Zapier does

- Every Hour (with an optional offset past the hour), Every Day, Every Week, Every Month, or a custom frequency such as every 3 months.
- Runs in the time zone of your Zapier account, not the Zap's; after changing it, turn the Zap off and on.
- Does not count towards task usage.

## Every 2 minutes elsewhere

Every 2 minutes in each cron dialect; GitHub Actions will still run it at most every 5 minutes.

| Scheduler | Expression |
| --- | --- |
| Linux crontab (Vixie cron) | `*/2 * * * *` |
| GitHub Actions | `*/2 * * * *` |
| Kubernetes CronJob | `*/2 * * * *` |
| Vercel Cron Jobs | `*/2 * * * *` |
| n8n Schedule Trigger (Custom cron) | `*/2 * * * *` |
| Quartz Scheduler | `0 */2 * * * ?` |
| Spring @Scheduled | `0 */2 * * * *` |
| UiPath Orchestrator time trigger | `0 */2 * * * ?` |
| Amazon EventBridge Scheduler | `cron(0/2 * * * ? *)` |

## Before you rely on a new schedule

- Check the next runs in the time zone the scheduler will use (the checker above does this for each dialect).
- Make the triggered step safe to run late or twice.
- Watch for a missing run: none of these schedulers promise an exact start time.

## Sources

- [Zapier Help: Schedule Zaps to run at specific intervals (read November 8, 2026)](https://help.zapier.com/hc/en-us/articles/8496288648461-Schedule-Zaps-to-run-at-specific-intervals)
- [n8n docs: Schedule Trigger node (read November 8, 2026)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)
- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [cron-job.org: FAQ (read November 8, 2026)](https://cron-job.org/en/faq/)
- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)

## Related

- [Zapier schedule time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/zapier-schedule-timezone/)
- [Free cron job services compared](https://krishnachagti-sudo.github.io/toll-preview/cron/alternative/free-cron-job-service/)
- [n8n Schedule Trigger cron](https://krishnachagti-sudo.github.io/toll-preview/cron/for/n8n/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/alternative/zapier-scheduler-alternative/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/alternative/zapier-scheduler-alternative.csv
