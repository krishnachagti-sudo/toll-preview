# GitHub Actions schedule delayed

GitHub's docs say the schedule event can be delayed during high load of Actions runs, that high load includes the start of every hour, and that at high enough load some queued jobs may be dropped; schedule at a minute other than 0 (17 \* \* \* \* rather than 0 \* \* \* \*) and make the job safe to run late or twice.

## Check your schedule

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=17+*+*+*+*&dialect=github&tz=UTC)

Community reports describe long delays, such as a daily run that started 4 hours 23 minutes late on October 19, 2026 (GitHub Community discussion 210625). GitHub's docs promise no start time.

## Sources

- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)
- [GitHub Community: scheduled workflow delayed by 4 hours 23 minutes (read Nov 8, 2026)](https://github.com/orgs/community/discussions/210625)

## Steps

1. **Move off the top of the hour.** GitHub suggests a different time of the hour; 17 or 43 past is less contended than 0.
2. **Add workflow\_dispatch.** A manual trigger lets you, or another system calling the GitHub API, start the run when the schedule is late.
3. **Make the job idempotent.** A late run, or a manual run followed by the scheduled one, should do no harm.
4. **Watch for a missing run.** Alert when no run has happened inside the expected window.

## Related

- [n8n Schedule Trigger not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-not-working/)
- [Change the n8n Schedule Trigger time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-timezone/)
- [n8n Schedule Trigger on weekdays](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-weekdays/)
- [GitHub Actions scheduled workflow not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-not-running/)
- [GitHub Actions cron time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-timezone/)
- [Zapier schedule time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/zapier-schedule-timezone/)
- [Daylight saving time and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-delay/  
Data as of: 2026-11-08
