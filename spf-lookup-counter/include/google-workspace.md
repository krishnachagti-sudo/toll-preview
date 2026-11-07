# Google Workspace SPF include: lookup cost

As measured on November 7, 2026, include:\_spf.google.com costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges), leaving 9 for your other senders.

- Lookups for include:\_spf.google.com: 1
- Left for other senders: 9
- ip4 / ip6 ranges: 2 / 6

## Add Google Workspace to your record

[Count my lookups with it added](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&add=include%3A_spf.google.com)

## The record behind the include

```
v=spf1 ip4:74.125.0.0/16 ip4:209.85.128.0/17 ip6:2001:4860:4864::/56 ip6:2404:6800:4864::/56 ip6:2607:f8b0:4864::/56 ip6:2800:3f0:4864::/56 ip6:2a00:1450:4864::/56 ip6:2c0f:fb50:4864::/56 ~all
```

What each term costs

| Term | Lookups |
| --- | --- |
| `ip4:74.125.0.0/16` | 0 |
| `ip4:209.85.128.0/17` | 0 |
| `ip6:2001:4860:4864::/56` | 0 |
| `ip6:2404:6800:4864::/56` | 0 |
| `ip6:2607:f8b0:4864::/56` | 0 |
| `ip6:2800:3f0:4864::/56` | 0 |
| `ip6:2a00:1450:4864::/56` | 0 |
| `ip6:2c0f:fb50:4864::/56` | 0 |
| `~all` | 0 |

> Measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8), by walking "v=spf1 include:\<host\> -all" with the same RFC 7208 engine the tool runs. Providers change their records without notice: run the tool for today's number.

## Setting it up

Put the include in your one SPF record, before the "all" at the end; a second v=spf1 record makes every SPF check return permerror ([RFC 7208 Section 4.5](https://www.rfc-editor.org/rfc/rfc7208#section-4.5)). Google Workspace's page shows: `v=spf1 include:_spf.google.com ~all`.

- [Google Workspace: SPF setup page, read November 7, 2026](https://knowledge.workspace.google.com/admin/security/set-up-spf)
- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### How many SPF lookups does Google Workspace use?

include:\_spf.google.com costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges), as measured on November 7, 2026. That leaves 9 of the 10 for your other senders.

### What include does Google Workspace give for SPF?

Google Workspace's setup page shows the record "v=spf1 include:\_spf.google.com ~all".

## Related

- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [What counts toward the 10 lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/google-workspace/  
Data as of: 2026-11-07
