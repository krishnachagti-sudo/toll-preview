# GitHub Actions cron time zone

GitHub Actions reads a schedule in UTC unless it sets timezone to an IANA name; with timezone: "America/New\_York", 30 5 \* \* 1-5 runs Monday, November 9 at 05:30 EST and Tuesday, November 10 at 05:30 EST, which is 10:30 UTC.

## Check your schedule

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=30+5+*+*+1-5&dialect=github&tz=America%2FNew_York)

## The 2:30 am example

30 2 \* \* \* with timezone America/New\_York on March 14, 2027, when 2:00 am becomes 3:00 am: Sunday, March 14 at 03:00 EDT and Monday, March 15 at 02:30 EDT.

```
on:
  schedule:
    - cron: '30 5 * * 1-5'
      timezone: "America/New_York"
```

## Sources

- [GitHub Docs: Events that trigger workflows, schedule (read November 8, 2026)](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows)

## Steps

1. **Add timezone under the cron line.** on.schedule\[\].timezone takes an IANA time zone string; GitHub's example is 30 5 \* \* 1-5 with timezone: "America/New\_York".
2. **Know the spring-forward rule.** In a zone with daylight saving time, a run in the skipped hour advances to the next valid time: 2:30 am runs at 3:00 am.
3. **The fall-back hour.** GitHub's docs do not say whether a time in the repeated hour runs once or twice; avoid 1:00 to 2:00 am local time for jobs that must run exactly once.

## Related

- [n8n Schedule Trigger not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-not-working/)
- [Change the n8n Schedule Trigger time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-timezone/)
- [n8n Schedule Trigger on weekdays](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-weekdays/)
- [GitHub Actions scheduled workflow not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-not-running/)
- [GitHub Actions schedule delayed](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-delay/)
- [Zapier schedule time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/zapier-schedule-timezone/)
- [Daylight saving time and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-timezone/  
Data as of: 2026-11-08
