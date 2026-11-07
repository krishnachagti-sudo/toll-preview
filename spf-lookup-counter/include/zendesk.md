# Zendesk SPF include: lookup cost

As measured on November 7, 2026, include:mail.zendesk.com costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges), leaving 9 for your other senders.

- Lookups for include:mail.zendesk.com: 1
- Left for other senders: 9
- ip4 / ip6 ranges: 5 / 0

## Add Zendesk to your record

[Count my lookups with it added](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&add=include%3Amail.zendesk.com)

## The record behind the include

```
v=spf1 ip4:103.151.192.0/23 ip4:185.12.80.0/22 ip4:188.172.128.0/20 ip4:192.161.144.0/20 ip4:216.198.0.0/18 ~all
```

What each term costs

| Term | Lookups |
| --- | --- |
| `ip4:103.151.192.0/23` | 0 |
| `ip4:185.12.80.0/22` | 0 |
| `ip4:188.172.128.0/20` | 0 |
| `ip4:192.161.144.0/20` | 0 |
| `ip4:216.198.0.0/18` | 0 |
| `~all` | 0 |

> Measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8), by walking "v=spf1 include:\<host\> -all" with the same RFC 7208 engine the tool runs. Providers change their records without notice: run the tool for today's number.

## Setting it up

Put the include in your one SPF record, before the "all" at the end; a second v=spf1 record makes every SPF check return permerror ([RFC 7208 Section 4.5](https://www.rfc-editor.org/rfc/rfc7208#section-4.5)). Zendesk's page shows: `v=spf1 include:mail.zendesk.com -all`.

- [Zendesk: SPF setup page, read November 7, 2026](https://support.zendesk.com/hc/en-us/articles/4408832543770)
- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### How many SPF lookups does Zendesk use?

include:mail.zendesk.com costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges), as measured on November 7, 2026. That leaves 9 of the 10 for your other senders.

### What include does Zendesk give for SPF?

Zendesk's setup page shows the record "v=spf1 include:mail.zendesk.com -all".

## Related

- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [What counts toward the 10 lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/zendesk/  
Data as of: 2026-11-07
