# Microsoft 365 operated by 21Vianet SPF include: lookup cost

As measured on November 7, 2026, include:spf.protection.partner.outlook.cn costs 2 of your 10 SPF lookups: 1 for itself and 1 for what is inside it (spfa.protection.partner.outlook.cn), leaving 8 for your other senders.

- Lookups for include:spf.protection.partner.outlook.cn: 2
- Left for other senders: 8
- ip4 / ip6 ranges: 10 / 4

## Add Microsoft 365 operated by 21Vianet to your record

[Count my lookups with it added](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&add=include%3Aspf.protection.partner.outlook.cn)

## The record behind the include

```
v=spf1 ip4:42.159.33.192/27 ip4:42.159.161.192/27 ip4:42.159.164.0/24 ip4:42.159.36.0/24 ip4:139.219.16.0/27 ip4:139.219.17.0/24 ip4:139.219.145.0/27 ip4:139.219.146.0/24 ip4:139.219.24.0/22 include:spfa.protection.partner.outlook.cn -all
```

What each term costs

| Term | Lookups |
| --- | --- |
| `ip4:42.159.33.192/27` | 0 |
| `ip4:42.159.161.192/27` | 0 |
| `ip4:42.159.164.0/24` | 0 |
| `ip4:42.159.36.0/24` | 0 |
| `ip4:139.219.16.0/27` | 0 |
| `ip4:139.219.17.0/24` | 0 |
| `ip4:139.219.145.0/27` | 0 |
| `ip4:139.219.146.0/24` | 0 |
| `ip4:139.219.24.0/22` | 0 |
| `include:spfa.protection.partner.outlook.cn` | 1 + 0 inside = 1 |
| `-all` | 0 |

Nested: spfa.protection.partner.outlook.cn costs 1. A nested include counts toward the same 10 as your own terms.

> Measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8), by walking "v=spf1 include:\<host\> -all" with the same RFC 7208 engine the tool runs. Providers change their records without notice: run the tool for today's number.

## Setting it up

Put the include in your one SPF record, before the "all" at the end; a second v=spf1 record makes every SPF check return permerror ([RFC 7208 Section 4.5](https://www.rfc-editor.org/rfc/rfc7208#section-4.5)). Microsoft 365 operated by 21Vianet's page shows: `v=spf1 include:spf.protection.partner.outlook.cn -all`.

- [Microsoft 365 operated by 21Vianet: SPF setup page, read November 7, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-spf-configure)
- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### How many SPF lookups does Microsoft 365 operated by 21Vianet use?

include:spf.protection.partner.outlook.cn costs 2 of your 10 SPF lookups: 1 for itself and 1 for what is inside it (spfa.protection.partner.outlook.cn), as measured on November 7, 2026. That leaves 8 of the 10 for your other senders.

### What include does Microsoft 365 operated by 21Vianet give for SPF?

Microsoft 365 operated by 21Vianet's setup page shows the record "v=spf1 include:spf.protection.partner.outlook.cn -all".

## Related

- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [What counts toward the 10 lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/microsoft-365-21vianet/  
Data as of: 2026-11-07
