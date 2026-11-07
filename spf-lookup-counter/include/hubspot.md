# HubSpot SPF include: lookup cost

As measured on November 7, 2026, include:shared.hubspot.com costs 2 of your 10 SPF lookups: 1 for itself and 1 for what is inside it (shared1.hubspot.com), leaving 8 for your other senders.

- Lookups for include:shared.hubspot.com: 2
- Left for other senders: 8
- ip4 / ip6 ranges: 27 / 0

## Add HubSpot to your record

[Count my lookups with it added](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&add=include%3Ashared.hubspot.com)

## The record behind the include

```
v=spf1 include:shared1.hubspot.com ip4:149.72.0.0/16 ip4:54.174.53.128/30 ip4:139.180.17.0/24 ip4:54.174.52.0/24 ip4:54.174.57.0/24 ip4:54.174.59.0/24 ip4:54.174.60.0/23 ip4:54.174.63.0/24 ip4:134.128.64.0/18 ip4:143.244.80.0/20 ip4:192.254.112.0/20 ip4:18.208.124.128/25 ip4:159.26.176.0/20 ip4:167.89.0.0/17 ip4:168.245.0.0/17 ip4:159.183.0.0/16 ip4:158.247.16.0/20 ip4:208.117.48.0/20 ip4:223.165.113.0/24 -all
```

What each term costs

| Term | Lookups |
| --- | --- |
| `include:shared1.hubspot.com` | 1 + 0 inside = 1 |
| `ip4:149.72.0.0/16` | 0 |
| `ip4:54.174.53.128/30` | 0 |
| `ip4:139.180.17.0/24` | 0 |
| `ip4:54.174.52.0/24` | 0 |
| `ip4:54.174.57.0/24` | 0 |
| `ip4:54.174.59.0/24` | 0 |
| `ip4:54.174.60.0/23` | 0 |
| `ip4:54.174.63.0/24` | 0 |
| `ip4:134.128.64.0/18` | 0 |
| `ip4:143.244.80.0/20` | 0 |
| `ip4:192.254.112.0/20` | 0 |
| `ip4:18.208.124.128/25` | 0 |
| `ip4:159.26.176.0/20` | 0 |
| `ip4:167.89.0.0/17` | 0 |
| `ip4:168.245.0.0/17` | 0 |
| `ip4:159.183.0.0/16` | 0 |
| `ip4:158.247.16.0/20` | 0 |
| `ip4:208.117.48.0/20` | 0 |
| `ip4:223.165.113.0/24` | 0 |
| `-all` | 0 |

Nested: shared1.hubspot.com costs 1. A nested include counts toward the same 10 as your own terms.

> Measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8), by walking "v=spf1 include:\<host\> -all" with the same RFC 7208 engine the tool runs. Providers change their records without notice: run the tool for today's number.

> HubSpot's page also shows an account-specific include (like 123456.spf03.hubspotemail.net) from your account's Required data column; count that one with the tool.

## Setting it up

Put the include in your one SPF record, before the "all" at the end; a second v=spf1 record makes every SPF check return permerror ([RFC 7208 Section 4.5](https://www.rfc-editor.org/rfc/rfc7208#section-4.5)). HubSpot's page shows: `include:shared.hubspot.com`.

- [HubSpot: SPF setup page, read November 7, 2026](https://knowledge.hubspot.com/marketing-email/manage-email-authentication-in-hubspot)
- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### How many SPF lookups does HubSpot use?

include:shared.hubspot.com costs 2 of your 10 SPF lookups: 1 for itself and 1 for what is inside it (shared1.hubspot.com), as measured on November 7, 2026. That leaves 8 of the 10 for your other senders.

### What include does HubSpot give for SPF?

HubSpot's setup page shows "include:shared.hubspot.com".

### Do I need HubSpot's include at all?

HubSpot's page also shows an account-specific include (like 123456.spf03.hubspotemail.net) from your account's Required data column; count that one with the tool.

## Related

- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [What counts toward the 10 lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/hubspot/  
Data as of: 2026-11-07
