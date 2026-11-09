# Mail-Tester vs Endwise bulk sender check

Mail-Tester asks you to send your email to an address it gives you and scores how spammy it is, free for occasional manual tests and from $10 a month for 50 tests (read November 8, 2026); the bulk sender check grades a message you already sent rule by rule against Gmail's, Yahoo's and Outlook.com's published requirements, $0.02 per message for the first 1,000 a month, then $0.01; the provider rule table and the worked examples are free, so 50 checks cost $1.00.

## See what the check shows

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=not-aligned)

## What Mail-Tester does

- Its home page: "Test the Spammyness of your Emails", by first sending your email to an address it shows.
- Manual tests on the web without an account: "If you occasionally perform manual tests, no need to create an account".
- Monthly plans: 50 tests $10 ($0.20 each), 500 tests $25 ($0.05), 2,000 tests $80 ($0.04), 7,500 tests $250 ($0.0333). One-time packs from 10 tests for $5 to 15,000 tests for $700.
- An account adds an iframe and JSON API, white label, statistics and a list of tests from the last 30 days.
- Free tools listed: SPF and DKIM checker, DMARC checker and generator, BIMI checker, DNS lookup and others.

## What the bulk sender check does

- Paste one raw message: Gmail's, Yahoo's and Outlook.com's rules, each quoted from the provider with a link, pass or fail for that message, and the fix.
- Verifies every DKIM signature itself (RFC 6376) and measures the key; works out DMARC alignment with the Public Suffix List (RFC 7489); checks one-click unsubscribe to RFC 8058 including the DKIM h= coverage.
- Price: $0.02 per message for the first 1,000 a month, then $0.01; the provider rule table and the worked examples are free. Five free checks a day without an account. Also over a REST API and MCP.
- Cannot show spam rate, volume or inbox placement: those need the provider's data or seed accounts.

## When Mail-Tester is better

Mail-Tester is better for a quick overall spam score from a test inbox, including content checks, without pasting anything.

## When the bulk sender check is better

The bulk sender check is better when you need to know which Gmail, Yahoo or Outlook.com rule a real message fails and why, with the provider's own words and the bounce code, and for one-click unsubscribe and DMARC alignment details.

- [Mail-Tester home page, read November 8, 2026](https://www.mail-tester.com/)
- [Mail-Tester Manager pricing, read November 8, 2026](https://www.mail-tester.com/manager/)

> Facts about Mail-Tester come only from its own pages, read on November 8, 2026; prices change, so check them there.

## Related

- [All three providers' rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/requirements/)
- [vs Google Postmaster Tools](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/google-postmaster/)
- [vs MxToolbox](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/mxtoolbox/)
- [vs Yahoo Sender Hub](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/yahoo-sender-hub/)
- [vs GlockApps](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/glockapps/)
- [vs dmarcian](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/dmarcian/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/mail-tester/  
Data as of: 2026-11-08
