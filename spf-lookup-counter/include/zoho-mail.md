# Zoho Mail SPF include: lookup cost

As measured on November 7, 2026, include:zohomail.com costs 2 of your 10 SPF lookups: 1 for itself and 1 for what is inside it (spf.zohomail.com), leaving 8 for your other senders.

- Lookups for include:zohomail.com: 2
- Left for other senders: 8
- ip4 / ip6 ranges: 8 / 0

## Add Zoho Mail to your record

[Count my lookups with it added](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&add=include%3Azohomail.com)

## The record behind the include

```
v=spf1 include:spf.zohomail.com -all
```

What each term costs

| Term | Lookups |
| --- | --- |
| `include:spf.zohomail.com` | 1 + 0 inside = 1 |
| `-all` | 0 |

Nested: spf.zohomail.com costs 1. A nested include counts toward the same 10 as your own terms.

> Measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8), by walking "v=spf1 include:\<host\> -all" with the same RFC 7208 engine the tool runs. Providers change their records without notice: run the tool for today's number.

## Setting it up

Put the include in your one SPF record, before the "all" at the end; a second v=spf1 record makes every SPF check return permerror ([RFC 7208 Section 4.5](https://www.rfc-editor.org/rfc/rfc7208#section-4.5)). Zoho Mail's page shows: `v=spf1 include:zohomail.com -all`.

- [Zoho Mail: SPF setup page, read November 7, 2026](https://www.zoho.com/mail/help/adminconsole/spf-configuration.html)
- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### How many SPF lookups does Zoho Mail use?

include:zohomail.com costs 2 of your 10 SPF lookups: 1 for itself and 1 for what is inside it (spf.zohomail.com), as measured on November 7, 2026. That leaves 8 of the 10 for your other senders.

### What include does Zoho Mail give for SPF?

Zoho Mail's setup page shows the record "v=spf1 include:zohomail.com -all".

## Related

- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [What counts toward the 10 lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/zoho-mail/  
Data as of: 2026-11-07
