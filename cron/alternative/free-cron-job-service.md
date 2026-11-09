# Free cron job services compared

cron-job.org is free with jobs every minute and a 30-second timeout; FastCron's free plan allows 15 jobs every 5 minutes and EasyCron's 200 executions a day at 20-minute intervals, while GitHub Actions runs at most every 5 minutes and Vercel Hobby once a day (each read on November 8, 2026).

From each service's own page, read November 8, 2026.

| Service | Free tier | Shortest interval | Timeout | Note |
| --- | --- | --- | --- | --- |
| cron-job.org | Free; no job-count limit (fair use) | Every minute (60 runs an hour per job) | 30 seconds; reads up to 64 KB | No promise on punctuality; disables a job after more than 25 failures in a row |
| FastCron Free | $0: 15 cron jobs | 5 minutes | 15 seconds | Paid plans from $6 a month (30-second interval) |
| EasyCron Free | $0: 200 executions a day, expires monthly | 20 minutes | 5 seconds | Paid plans from $24 a year (1-minute interval) |
| GitHub Actions schedule | Part of GitHub Actions | 5 minutes | The workflow's own limits | Can be delayed at high load; disabled after 60 days without activity in public repos |
| Vercel Cron Jobs (Hobby) | Included: 100 cron jobs per project | Once a day | The function's limits | Runs anywhere within the hour; UTC only |

The checker on this site works out when a schedule runs; it does not call URLs. Use it to confirm the expression before you paste it into any of these services.

## Every 2 minutes, written for each scheduler

The same schedule for each cron dialect.

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

## When each one fits

- cron-job.org: free calls to a URL every minute, with custom headers and request bodies, if a 30-second timeout is enough.
- FastCron or EasyCron paid plans: sub-minute or long-running calls with logs.
- GitHub Actions: the job lives in the repository and a few minutes' delay is fine.
- Vercel Hobby: one daily job for a Vercel function.

## Sources

- [cron-job.org: FAQ (read November 8, 2026)](https://cron-job.org/en/faq/)
- [FastCron: Pricing (read November 8, 2026)](https://www.fastcron.com/pricing)
- [EasyCron: Plans and pricing (read November 8, 2026)](https://www.easycron.com/pricing)
- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Vercel docs: Cron Jobs usage and pricing (read November 8, 2026)](https://vercel.com/docs/cron-jobs/usage-and-pricing)

## Questions

### Is cron-job.org free?

Yes. Its FAQ says the service is entirely free, with no limit on the number of jobs (fair use), up to 60 runs an hour per job and a 30-second timeout.

### Which free service runs every minute?

Of these, cron-job.org: every job can run up to 60 times an hour. FastCron Free allows every 5 minutes and EasyCron Free every 20.

## Related

- [Zapier schedule alternatives](https://krishnachagti-sudo.github.io/toll-preview/cron/alternative/zapier-scheduler-alternative/)
- [GitHub Actions schedule compared](https://krishnachagti-sudo.github.io/toll-preview/cron/vs/github-actions-schedule/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/alternative/free-cron-job-service/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/alternative/free-cron-job-service.csv
