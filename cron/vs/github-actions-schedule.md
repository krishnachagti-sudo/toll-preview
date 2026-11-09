# GitHub Actions schedule compared

GitHub Actions runs a schedule at most once every 5 minutes, in UTC unless the schedule sets an IANA timezone, and says runs can be delayed at high load (including the start of every hour) and some queued jobs dropped; Kubernetes, AWS EventBridge and cron-job.org go down to a minute, and EventBridge invokes within 60 seconds.

## Check a GitHub Actions schedule

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=17+6+*+*+1-5&dialect=github&tz=America%2FNew_York)

From each scheduler's own docs, read November 8, 2026.

| Scheduler | Shortest interval | Time zone | Clock changes | Timing |
| --- | --- | --- | --- | --- |
| GitHub Actions schedule | 5 minutes | UTC, or timezone (IANA) | GitHub: with a time zone that observes daylight saving time, a run in the skipped hour advances to the next valid time (2:30 am runs at 3:00 am). GitHub's docs do not say what happens in the repeated hour when the clocks go back. | Can be delayed at high load; queued jobs may be dropped |
| Kubernetes CronJob | 1 minute | Controller manager, or .spec.timeZone | Kubernetes CronJob's docs do not say what happens to a run in the skipped or repeated hour at a daylight saving change; those runs are flagged. | startingDeadlineSeconds; one catch-up after 100+ missed |
| AWS EventBridge Scheduler | 1 minute | UTC, or a time zone (IANA) | EventBridge Scheduler: a run at a time that does not exist when the clocks go forward is skipped; when they go back, it runs only once. | 60-second precision |
| Vercel Cron Jobs | Hobby: a day; Pro: a minute | UTC only | Vercel Cron Jobs runs in UTC, which has no daylight saving changes. | Hobby runs within the hour |
| cron-job.org | 1 minute | Set per job | Not stated in its FAQ | No punctuality promise; 30-second timeout |
| Linux crontab | 1 minute | The daemon's time zone | Debian cron(8): when the clocks go forward, a job at a particular time that falls in the skipped time runs soon after the change; when they go back, a job in the repeated time is not run again. Jobs with \* in the minute or hour field run on the new time. | Runs on your own server |

## When GitHub Actions is the better choice

- The job belongs with the code and needs the repository checked out.
- A delay of minutes is acceptable and you want no other service to run or pay for.
- You want the schedule reviewed in pull requests with the workflow file.

## When to look elsewhere

- The run must start within a minute: GitHub promises no start time.
- You need under 5 minutes between runs.
- The repository is public and may go 60 days without activity: the schedule is then disabled.

## Sources

- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [Kubernetes docs: CronJob (read November 8, 2026)](https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/)
- [Amazon EventBridge Scheduler: Schedule types (read November 8, 2026)](https://docs.aws.amazon.com/scheduler/latest/UserGuide/schedule-types.html)
- [Vercel docs: Cron Jobs usage and pricing (read November 8, 2026)](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [cron-job.org: FAQ (read November 8, 2026)](https://cron-job.org/en/faq/)
- [Debian cron(8): clock changes (read November 8, 2026)](https://manpages.debian.org/bookworm/cron/cron.8.en.html)

## Related

- [GitHub Actions schedule delayed](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-delay/)
- [GitHub Actions cron not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-not-running/)
- [Free cron job services compared](https://krishnachagti-sudo.github.io/toll-preview/cron/alternative/free-cron-job-service/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/vs/github-actions-schedule/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/cron/vs/github-actions-schedule.csv
