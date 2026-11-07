# Microsoft 365 SPF include: lookup cost

As measured on November 7, 2026, include:spf.protection.outlook.com costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges), leaving 9 for your other senders.

- Lookups for include:spf.protection.outlook.com: 1
- Left for other senders: 9
- ip4 / ip6 ranges: 6 / 5

## Add Microsoft 365 to your record

[Count my lookups with it added](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&add=include%3Aspf.protection.outlook.com)

## The record behind the include

```
v=spf1 ip4:40.92.0.0/15 ip4:40.107.0.0/16 ip4:52.100.0.0/15 ip4:52.102.0.0/16 ip4:52.103.0.0/17 ip4:104.47.0.0/17 ip6:2a01:111:f400::/48 ip6:2a01:111:f403::/49 ip6:2a01:111:f403:8000::/51 ip6:2a01:111:f403:c000::/51 ip6:2a01:111:f403:f000::/52 -all
```

What each term costs

| Term | Lookups |
| --- | --- |
| `ip4:40.92.0.0/15` | 0 |
| `ip4:40.107.0.0/16` | 0 |
| `ip4:52.100.0.0/15` | 0 |
| `ip4:52.102.0.0/16` | 0 |
| `ip4:52.103.0.0/17` | 0 |
| `ip4:104.47.0.0/17` | 0 |
| `ip6:2a01:111:f400::/48` | 0 |
| `ip6:2a01:111:f403::/49` | 0 |
| `ip6:2a01:111:f403:8000::/51` | 0 |
| `ip6:2a01:111:f403:c000::/51` | 0 |
| `ip6:2a01:111:f403:f000::/52` | 0 |
| `-all` | 0 |

> Measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8), by walking "v=spf1 include:\<host\> -all" with the same RFC 7208 engine the tool runs. Providers change their records without notice: run the tool for today's number.

> Also for Microsoft 365 GCC.

## Setting it up

Put the include in your one SPF record, before the "all" at the end; a second v=spf1 record makes every SPF check return permerror ([RFC 7208 Section 4.5](https://www.rfc-editor.org/rfc/rfc7208#section-4.5)). Microsoft 365's page shows: `v=spf1 include:spf.protection.outlook.com -all`.

- [Microsoft 365: SPF setup page, read November 7, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-spf-configure)
- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### How many SPF lookups does Microsoft 365 use?

include:spf.protection.outlook.com costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges), as measured on November 7, 2026. That leaves 9 of the 10 for your other senders.

### What include does Microsoft 365 give for SPF?

Microsoft 365's setup page shows the record "v=spf1 include:spf.protection.outlook.com -all".

### Do I need Microsoft 365's include at all?

Also for Microsoft 365 GCC.

## Related

- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [What counts toward the 10 lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/microsoft-365/  
Data as of: 2026-11-07
