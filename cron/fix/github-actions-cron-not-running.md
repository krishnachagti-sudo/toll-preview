# GitHub Actions scheduled workflow not running

A GitHub Actions schedule runs only from the workflow file on the default branch, at most once every 5 minutes, in UTC unless timezone is set; in a public repository it is disabled after 60 days with no repository activity, and at high load (including the start of every hour) runs can be late or dropped.

## Check your schedule

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=17+6+*+*+1-5&dialect=github&tz=UTC)

## Sources

- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)

## Steps

1. **Default branch.** The schedule event triggers only if the workflow file exists on the default branch, and scheduled workflows run on the latest commit there.
2. **Disabled after 60 days.** In a public repository, scheduled workflows are disabled when no repository activity has occurred in 60 days. Re-enable the workflow; a commit that changes the cron schedule also reactivates it.
3. **Interval.** The shortest interval is once every 5 minutes; \*/1 or \*/2 will not run that often.
4. **Time zone.** Without timezone the cron is read in UTC. Add timezone with an IANA name such as America/New\_York.
5. **Load.** Runs can be delayed during high load, which includes the start of every hour; if load is high enough, some queued jobs may be dropped. Schedule at another minute, such as 17.
6. **The actor.** In an enterprise with Enterprise Managed Users, scheduled workflows do not run if the last actor has been deprovisioned.

## Related

- [n8n Schedule Trigger not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-not-working/)
- [Change the n8n Schedule Trigger time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-timezone/)
- [n8n Schedule Trigger on weekdays](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-weekdays/)
- [GitHub Actions cron time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-timezone/)
- [GitHub Actions schedule delayed](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-delay/)
- [Zapier schedule time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/zapier-schedule-timezone/)
- [Daylight saving time and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-not-running/  
Data as of: 2026-11-08
