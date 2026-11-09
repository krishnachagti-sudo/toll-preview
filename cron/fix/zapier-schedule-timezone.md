# Zapier schedule time zone

Schedule by Zapier uses the time zone set in your Zapier account, not the time zone set in the Zap; change it in your profile settings, then turn the Zap off and back on for the change to take effect (Zapier's help article, updated May 29, 2026).

## Check your schedule

[Check the next runs](https://krishnachagti-sudo.github.io/toll-preview/cron/?expr=0+9+*+*+1-5&dialect=vixie&tz=America%2FChicago)

> Zapier's article (updated May 29, 2026, read November 8, 2026) also says Schedule by Zapier does not count towards task usage.

## Sources

- [Zapier Help: Schedule Zaps to run at specific intervals (read November 8, 2026)](https://help.zapier.com/hc/en-us/articles/8496288648461-Schedule-Zaps-to-run-at-specific-intervals)

## Steps

1. **Account time zone.** Open your Zapier profile settings and set the time zone. Zapier's help article says schedule triggers use it.
2. **Turn the Zap off and on.** After changing the time zone, Zapier says to turn the Zap off and back on.
3. **Know the options.** The trigger offers Every Hour (with an optional offset past the hour), Every Day, Every Week, Every Month and a custom frequency; the article describes nothing shorter than hourly.
4. **Need minutes?.** A cron-based scheduler that calls the Zap's webhook can fire more often; compare the options on the Zapier schedule alternatives page.

## Related

- [n8n Schedule Trigger not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-not-working/)
- [Change the n8n Schedule Trigger time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-timezone/)
- [n8n Schedule Trigger on weekdays](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/n8n-schedule-trigger-weekdays/)
- [GitHub Actions scheduled workflow not running](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-not-running/)
- [GitHub Actions cron time zone](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-timezone/)
- [GitHub Actions schedule delayed](https://krishnachagti-sudo.github.io/toll-preview/cron/fix/github-actions-cron-delay/)
- [Daylight saving time and cron](https://krishnachagti-sudo.github.io/toll-preview/cron/guides/daylight-saving-time/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/cron/fix/zapier-schedule-timezone/  
Data as of: 2026-11-08
