# Why SPF checkers give different lookup counts

Two SPF checkers disagree when one counts every nested include and another counts only the top level, ignores macros or uses stale numbers: measured on November 7, 2026, include:\_spf.google.com cost 1 lookup, where some published tables still say 4.

- Google include, 2026-11-07: 1

## Count it exactly

[Count my lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com)

## The five reasons

- Top level only: a tool that counts the includes in your record but not inside them reports too few. The limit covers the whole check (RFC 7208 Section 4.6.4).
- Worst case or path taken: the worst case counts every term; a receiver stops at the first match, so a sender listed early uses fewer.
- Macros: include:%{ir}.%{v}.\_spf.example.com builds a different name per sender; without a sending IP a checker can only count the term itself.
- Stale numbers: provider records change. Tables written years ago still say Google costs 4.
- Different DNS: answers vary by resolver and by minute; the counter shows the resolver and the time.

What-if example, recorded November 7, 2026: Google Workspace plus Microsoft 365 plus HubSpot's shared include came to 4 of 10.

> Measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8), by walking "v=spf1 include:\<host\> -all" with the same RFC 7208 engine the tool runs. Providers change their records without notice: run the tool for today's number.

- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Related

- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)
- [SPF macros, expanded](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/macros/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/checkers-disagree/  
Data as of: 2026-11-07
