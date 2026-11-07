# Amazon SES (custom MAIL FROM domain) SPF include: lookup cost

As measured on November 7, 2026, include:amazonses.com costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges), leaving 9 for your other senders.

- Lookups for include:amazonses.com: 1
- Left for other senders: 9
- ip4 / ip6 ranges: 13 / 0

## Add Amazon SES (custom MAIL FROM domain) to your record

[Count my lookups with it added](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&add=include%3Aamazonses.com)

## The record behind the include

```
v=spf1 ip4:199.255.192.0/22 ip4:199.127.232.0/22 ip4:54.240.0.0/18 ip4:69.169.224.0/20 ip4:23.249.208.0/20 ip4:23.251.224.0/19 ip4:76.223.176.0/20 ip4:54.240.64.0/18 ip4:76.223.128.0/19 ip4:216.221.160.0/19 ip4:206.55.144.0/20 ip4:24.110.64.0/18 ip4:98.77.0.0/16 -all
```

What each term costs

| Term | Lookups |
| --- | --- |
| `ip4:199.255.192.0/22` | 0 |
| `ip4:199.127.232.0/22` | 0 |
| `ip4:54.240.0.0/18` | 0 |
| `ip4:69.169.224.0/20` | 0 |
| `ip4:23.249.208.0/20` | 0 |
| `ip4:23.251.224.0/19` | 0 |
| `ip4:76.223.176.0/20` | 0 |
| `ip4:54.240.64.0/18` | 0 |
| `ip4:76.223.128.0/19` | 0 |
| `ip4:216.221.160.0/19` | 0 |
| `ip4:206.55.144.0/20` | 0 |
| `ip4:24.110.64.0/18` | 0 |
| `ip4:98.77.0.0/16` | 0 |
| `-all` | 0 |

> Measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8), by walking "v=spf1 include:\<host\> -all" with the same RFC 7208 engine the tool runs. Providers change their records without notice: run the tool for today's number.

> Only for a custom MAIL FROM subdomain; with SES's default MAIL FROM, SPF is checked against amazonses.com and needs nothing from you.

## Setting it up

Put the include in your one SPF record, before the "all" at the end; a second v=spf1 record makes every SPF check return permerror ([RFC 7208 Section 4.5](https://www.rfc-editor.org/rfc/rfc7208#section-4.5)). Amazon SES (custom MAIL FROM domain)'s page shows: `v=spf1 include:amazonses.com ~all`.

- [Amazon SES: SPF setup page, read November 7, 2026](https://docs.aws.amazon.com/ses/latest/dg/mail-from.html)
- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### How many SPF lookups does Amazon SES (custom MAIL FROM domain) use?

include:amazonses.com costs 1 of your 10 SPF lookups (its record lists only ip4/ip6 ranges), as measured on November 7, 2026. That leaves 9 of the 10 for your other senders.

### What include does Amazon SES (custom MAIL FROM domain) give for SPF?

Amazon SES (custom MAIL FROM domain)'s setup page shows the record "v=spf1 include:amazonses.com ~all".

### Do I need Amazon SES (custom MAIL FROM domain)'s include at all?

Only for a custom MAIL FROM subdomain; with SES's default MAIL FROM, SPF is checked against amazonses.com and needs nothing from you.

## Related

- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [What counts toward the 10 lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/amazon-ses/  
Data as of: 2026-11-07
