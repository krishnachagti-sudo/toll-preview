# Change the n8n Schedule Trigger time zone

The n8n Schedule Trigger uses the workflow time zone if it is set (workflow settings), otherwise the instance time zone, which is America/New York by default on self-hosted n8n; set the workflow time zone to make a trigger independent of the server.

## Check your schedule

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=30+2+*+*+*&dialect=n8n&tz=Europe%2FLondon)

## At the clock change

n8n's docs do not say what a Schedule Trigger does with a time the clocks skip or repeat. A 1:30 am trigger in Europe/London around March 28, 2027 (when 01:00 becomes 02:00): Saturday 2027-03-27 01:30 GMT; Sunday 2027-03-28 02:00 GMT+1 (flagged: 2027-03-28 01:30 does not exist (the clocks go forward); this scheduler's docs do not say whether it runs soon after or is skipped.); Monday 2027-03-29 01:30 GMT+1. Pick a time outside 01:00 to 02:00 in the UK, or 02:00 to 03:00 in the US, to avoid the question.

## Sources

- [n8n docs: Schedule Trigger node (read November 8, 2026)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)

## Steps

1. **Per workflow.** Open the workflow settings and set Timezone. This wins over the instance setting.
2. **Self-hosted instance.** Set the instance time zone with n8n's environment variables; the default is America/New York.
3. **n8n Cloud.** n8n Cloud detects the owner's time zone at sign-up (GMT if it cannot); the owner can change it in the Cloud console.
4. **Check the next runs.** Paste the expression and the time zone into the checker below to see the next runs, including the days the clocks change.

## Related

- [n8n Schedule Trigger not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-not-working/)
- [n8n Schedule Trigger on weekdays](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-weekdays/)
- [GitHub Actions scheduled workflow not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-not-running/)
- [GitHub Actions cron time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-timezone/)
- [GitHub Actions schedule delayed](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-delay/)
- [Zapier schedule time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/zapier-schedule-timezone/)
- [Daylight saving time and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-timezone/  
Data as of: 2026-11-08
