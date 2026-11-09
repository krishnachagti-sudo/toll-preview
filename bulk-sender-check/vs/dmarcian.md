# dmarcian vs a one-message bulk sender check

dmarcian processes your DMARC aggregate reports continuously (Personal free for non-business use; Basic $24 a month; Plus $240; Enterprise $600; read November 8, 2026); the bulk sender check is a one-message check of SPF, DKIM, DMARC alignment, one-click unsubscribe, PTR and TLS against the providers' rules, $0.02 per message for the first 1,000 a month, then $0.01; the provider rule table and the worked examples are free.

## See what the check shows

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=not-aligned)

## What dmarcian does

- Plans: Personal $0 (non-business use), Basic $24 a month ($288 a year), Plus $240 a month, Enterprise $600 a month.
- DMARC report (RUA) processing with message allowances per plan, DKIM inspector and validator, BIMI inspector, TLS reporting.

## What the bulk sender check does

- Paste one raw message: Gmail's, Yahoo's and Outlook.com's rules, each quoted from the provider with a link, pass or fail for that message, and the fix.
- Verifies every DKIM signature itself (RFC 6376) and measures the key; works out DMARC alignment with the Public Suffix List (RFC 7489); checks one-click unsubscribe to RFC 8058 including the DKIM h= coverage.
- Price: $0.02 per message for the first 1,000 a month, then $0.01; the provider rule table and the worked examples are free. Five free checks a day without an account. Also over a REST API and MCP.
- Cannot show spam rate, volume or inbox placement: those need the provider's data or seed accounts.

## When dmarcian is better

dmarcian is better for continuous DMARC report monitoring: seeing every service that sends as your domain and moving safely to p=reject.

## When the bulk sender check is better

The bulk sender check is better for a one-message check, including the parts DMARC reports never show: one-click unsubscribe headers, their DKIM coverage, TLS and message format.

- [dmarcian pricing, read November 8, 2026](https://dmarcian.com/pricing/)

> Facts about dmarcian come only from its own pages, read on November 8, 2026; prices change, so check them there.

## Related

- [All three providers' rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/requirements/)
- [vs Mail-Tester](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/mail-tester/)
- [vs Google Postmaster Tools](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/google-postmaster/)
- [vs MxToolbox](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/mxtoolbox/)
- [vs Yahoo Sender Hub](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/yahoo-sender-hub/)
- [vs GlockApps](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/glockapps/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/dmarcian/  
Data as of: 2026-11-08
