# Zoho (several Zoho services) SPF include: lookup cost

As measured on November 7, 2026, include:one.zoho.com costs 4 of your 10 SPF lookups: 1 for itself and 3 for what is inside it (spf.zoho.com, zeptomail.net, zcsend.net), leaving 6 for your other senders.

- Lookups for include:one.zoho.com: 4
- Left for other senders: 6
- ip4 / ip6 ranges: 73 / 3

## Add Zoho (several Zoho services) to your record

[Count my lookups with it added](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&add=include%3Aone.zoho.com)

## The record behind the include

```
v=spf1 include:spf.zoho.com include:zeptomail.net include:zcsend.net -all
```

What each term costs

| Term | Lookups |
| --- | --- |
| `include:spf.zoho.com` | 1 + 0 inside = 1 |
| `include:zeptomail.net` | 1 + 0 inside = 1 |
| `include:zcsend.net` | 1 + 0 inside = 1 |
| `-all` | 0 |

Nested: spf.zoho.com costs 1; zeptomail.net costs 1; zcsend.net costs 1. A nested include counts toward the same 10 as your own terms.

> Measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8), by walking "v=spf1 include:\<host\> -all" with the same RFC 7208 engine the tool runs. Providers change their records without notice: run the tool for today's number.

## Setting it up

Put the include in your one SPF record, before the "all" at the end; a second v=spf1 record makes every SPF check return permerror ([RFC 7208 Section 4.5](https://www.rfc-editor.org/rfc/rfc7208#section-4.5)). Zoho (several Zoho services)'s page shows: `v=spf1 include:one.zoho.com -all`.

- [Zoho: SPF setup page, read November 7, 2026](https://www.zoho.com/mail/help/adminconsole/spf-configuration.html)
- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### How many SPF lookups does Zoho (several Zoho services) use?

include:one.zoho.com costs 4 of your 10 SPF lookups: 1 for itself and 3 for what is inside it (spf.zoho.com, zeptomail.net, zcsend.net), as measured on November 7, 2026. That leaves 6 of the 10 for your other senders.

### What include does Zoho (several Zoho services) give for SPF?

Zoho (several Zoho services)'s setup page shows the record "v=spf1 include:one.zoho.com -all".

## Related

- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [What counts toward the 10 lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/zoho-one/  
Data as of: 2026-11-07
