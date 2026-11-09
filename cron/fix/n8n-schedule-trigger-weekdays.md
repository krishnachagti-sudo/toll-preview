# n8n Schedule Trigger on weekdays

For weekdays only, use a Custom (Cron) interval such as 0 9 \* \* 1-5 (9:00 am Monday to Friday; n8n counts the day of week from Sunday = 0), or the Weeks interval with Monday to Friday ticked; in America/New\_York the next runs from Monday, November 9, 2026 are Monday, November 9 at 09:00 EST, Tuesday, November 10 at 09:00 EST and Wednesday, November 11 at 09:00 EST.

## Check your schedule

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+9+*+*+1-5&dialect=n8n&tz=America%2FNew_York)

> n8n's docs list no random-time option for the Schedule Trigger; a random delay has to be a later step in the workflow.

## Sources

- [n8n docs: Schedule Trigger node (read November 8, 2026)](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/)

## Steps

1. **Custom (Cron).** Trigger Interval: Custom (Cron), Expression: 0 9 \* \* 1-5. n8n's own example for weekdays is exactly this.
2. **Or the Weeks interval.** Trigger Interval: Weeks, Weeks Between Triggers: 1, Trigger on Weekdays: Monday to Friday, hour and minute.
3. **Every 15 minutes in working hours.** Custom (Cron): \*/15 9-17 \* \* 1-5 runs from 9:00 to 17:45.
4. **Holidays.** Cron knows nothing about public holidays; add a step that checks the date, as in the business-days guide.

## Related

- [n8n Schedule Trigger not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-not-working/)
- [Change the n8n Schedule Trigger time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-timezone/)
- [GitHub Actions scheduled workflow not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-not-running/)
- [GitHub Actions cron time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-timezone/)
- [GitHub Actions schedule delayed](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-delay/)
- [Zapier schedule time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/zapier-schedule-timezone/)
- [Daylight saving time and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-weekdays/  
Data as of: 2026-11-08
