# Postmark SPF include: lookup cost

As measured on November 7, 2026, include:spf.mtasv.net costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges), leaving 9 for your other senders.

- Lookups for include:spf.mtasv.net: 1
- Left for other senders: 9
- ip4 / ip6 ranges: 4 / 0

## Add Postmark to your record

[Count my lookups with it added](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&add=include%3Aspf.mtasv.net)

## The record behind the include

```
v=spf1 ip4:50.31.156.96/27 ip4:104.245.209.192/26 ip4:50.31.205.0/24 ip4:147.160.158.0/24 -all
```

What each term costs

| Term | Lookups |
| --- | --- |
| `ip4:50.31.156.96/27` | 0 |
| `ip4:104.245.209.192/26` | 0 |
| `ip4:50.31.205.0/24` | 0 |
| `ip4:147.160.158.0/24` | 0 |
| `-all` | 0 |

> Measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8), by walking "v=spf1 include:\<host\> -all" with the same RFC 7208 engine the tool runs. Providers change their records without notice: run the tool for today's number.

> Postmark says the include is no longer required: its custom Return-Path handles SPF.

## Setting it up

Put the include in your one SPF record, before the "all" at the end; a second v=spf1 record makes every SPF check return permerror ([RFC 7208 Section 4.5](https://www.rfc-editor.org/rfc/rfc7208#section-4.5)). Postmark's page shows: `include:spf.mtasv.net`.

- [Postmark: SPF setup page, read November 7, 2026](https://postmarkapp.com/support/article/1092-how-do-i-set-up-spf-for-postmark)
- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### How many SPF lookups does Postmark use?

include:spf.mtasv.net costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges), as measured on November 7, 2026. That leaves 9 of the 10 for your other senders.

### What include does Postmark give for SPF?

Postmark's setup page shows "include:spf.mtasv.net".

### Do I need Postmark's include at all?

Postmark says the include is no longer required: its custom Return-Path handles SPF.

## Related

- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [What counts toward the 10 lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/postmark/  
Data as of: 2026-11-07
