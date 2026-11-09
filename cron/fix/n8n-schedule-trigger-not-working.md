# n8n Schedule Trigger not running

An n8n Schedule Trigger runs only once the workflow is saved and published, and it uses the workflow time zone if one is set, otherwise the instance time zone (America/New York by default when self-hosted); a daily trigger that fires hours off is almost always a time zone mismatch.

## Check your schedule

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+9+*+*+*&dialect=n8n&tz=America%2FNew_York)

## The same trigger in two time zones

0 9 \* \* \* in a workflow set to America/New\_York runs Monday, November 9 at 09:00 EST and Tuesday, November 10 at 09:00 EST (14:00 and 14:00 UTC). On an instance left at UTC it runs Monday, November 9 at 09:00 UTC and Tuesday, November 10 at 09:00 UTC: five hours earlier for someone in New York in winter, four in summer.

## Sources

- [n8n docs: Schedule Trigger node (read November 8, 2026)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)
- [n8n docs: Schedule Trigger common issues (read November 8, 2026)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/common-issues/)

## Steps

1. **Publish the workflow.** n8n's docs: a workflow that uses the Schedule node as a trigger must be saved and published.
2. **Check the workflow time zone.** Workflow settings \> Timezone. If it is not set, the instance time zone is used: America/New York by default on self-hosted n8n; n8n Cloud tries the owner's time zone at sign-up and falls back to GMT.
3. **Check the instance time zone.** Self-hosted: the instance time zone is set with environment variables; on n8n Cloud the owner sets it in the Cloud console.
4. **Use Custom (Cron) for clock times.** From n8n 2.45.0 the Seconds and Minutes intervals run at even gaps measured from when the workflow was published, not on the clock; Custom (Cron) keeps clock timing, so \*/5 \* \* \* \* runs at :00, :05, :10.
5. **Decide what happens to missed runs.** From n8n 2.36, If Execution Is Missed can discard missed executions (the default) or run the most recent one; a restart during the scheduled time otherwise loses the run.
6. **Re-publish after changing variables.** Variables in the cron expression are read when the workflow is published; change them, then unpublish and publish again.

## Related

- [Change the n8n Schedule Trigger time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-timezone/)
- [n8n Schedule Trigger on weekdays](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-weekdays/)
- [GitHub Actions scheduled workflow not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-not-running/)
- [GitHub Actions cron time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-timezone/)
- [GitHub Actions schedule delayed](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-delay/)
- [Zapier schedule time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/zapier-schedule-timezone/)
- [Daylight saving time and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-not-working/  
Data as of: 2026-11-08
