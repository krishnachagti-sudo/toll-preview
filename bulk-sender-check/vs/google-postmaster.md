# Google Postmaster Tools vs a one-message bulk sender check

Google Postmaster Tools is free and shows what Gmail actually observed for your verified domain, including the spam rate and a Compliance status dashboard, usually updated within 24 hours and only when you send enough mail; the bulk sender check grades one message, before you send the campaign, against Gmail's rules and Yahoo's and Outlook.com's too.

## See what the check shows

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=compliant)

## What Google Postmaster Tools does

- Free, with a Google Account; you add and verify your domain with a DNS record.
- Dashboards: Compliance status, Spam rate, IP and domain reputation, Feedback loop, Authentication, Encryption, Delivery errors.
- Compliance status for all senders: SPF and DKIM, DNS records, message formatting, encryption, spam rate; for bulk senders also DMARC, one-click unsubscribe and honoring unsubscribes. States: Compliant, Needs work, No data found.
- Data covers personal Gmail accounts only, is typically updated within 24 hours, and may be missing on low-volume days; compliance status is shown for primary domains only.

## What the bulk sender check does

- Paste one raw message: Gmail's, Yahoo's and Outlook.com's rules, each quoted from the provider with a link, pass or fail for that message, and the fix.
- Verifies every DKIM signature itself (RFC 6376) and measures the key; works out DMARC alignment with the Public Suffix List (RFC 7489); checks one-click unsubscribe to RFC 8058 including the DKIM h= coverage.
- Price: $0.02 per message for the first 1,000 a month, then $0.01; the provider rule table and the worked examples are free. Five free checks a day without an account. Also over a REST API and MCP.
- Cannot show spam rate, volume or inbox placement: those need the provider's data or seed accounts.

## When Google Postmaster Tools is better

Postmaster Tools is better because it shows what Gmail actually saw for your domain over time, including the spam rate, which no message check can know. Use it every day you send.

## When the bulk sender check is better

The bulk sender check is better for testing one message before it goes out, for a domain without enough volume to show data, and for Yahoo and Outlook.com in the same result.

- [Google: Postmaster Tools dashboards, read November 8, 2026](https://support.google.com/mail/answer/14668346?hl=en)
- [Google: Set up Postmaster Tools, read November 8, 2026](https://support.google.com/mail/answer/9981691?hl=en)

> Facts about Google Postmaster Tools come only from its own pages, read on November 8, 2026; prices change, so check them there.

## Related

- [All three providers' rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/requirements/)
- [vs Mail-Tester](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/mail-tester/)
- [vs MxToolbox](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/mxtoolbox/)
- [vs Yahoo Sender Hub](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/yahoo-sender-hub/)
- [vs GlockApps](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/glockapps/)
- [vs dmarcian](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/dmarcian/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/google-postmaster/  
Data as of: 2026-11-08
