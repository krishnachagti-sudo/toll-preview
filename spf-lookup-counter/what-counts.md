# What counts toward the SPF 10 lookup limit

RFC 7208 Section 4.6.4 counts 6 terms toward the limit of 10 per SPF check (include, a, mx, ptr, exists and redirect); ip4, ip6, all and exp count 0, and void lookups have their own limit of 2.

- Terms that count: 6
- Lookup limit: 10
- Void lookup limit: 2

## Count your record

[Count my lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com)

## Every term

| Term | Counts toward 10 | Extra limit | RFC 7208 |
| --- | --- | --- | --- |
| `include` | yes | 1 plus every lookup inside the included record | [RFC 7208 Section 5.2](https://www.rfc-editor.org/rfc/rfc7208#section-5.2) |
| `a` | yes | none beyond the 10 | [RFC 7208 Section 5.3](https://www.rfc-editor.org/rfc/rfc7208#section-5.3) |
| `mx` | yes | at most 10 MX names, else permerror | [RFC 7208 Section 4.6.4](https://www.rfc-editor.org/rfc/rfc7208#section-4.6.4) |
| `ptr` | yes | names past the first 10 ignored; do not use | [RFC 7208 Section 5.5](https://www.rfc-editor.org/rfc/rfc7208#section-5.5) |
| `exists` | yes | none beyond the 10 | [RFC 7208 Section 5.7](https://www.rfc-editor.org/rfc/rfc7208#section-5.7) |
| `redirect=` | yes | ignored when the record has all | [RFC 7208 Section 6.1](https://www.rfc-editor.org/rfc/rfc7208#section-6.1) |
| `ip4` | no | none | [RFC 7208 Section 5.6](https://www.rfc-editor.org/rfc/rfc7208#section-5.6) |
| `ip6` | no | none | [RFC 7208 Section 5.6](https://www.rfc-editor.org/rfc/rfc7208#section-5.6) |
| `all` | no | terms after it are ignored | [RFC 7208 Section 5.1](https://www.rfc-editor.org/rfc/rfc7208#section-5.1) |
| `exp=` | no | looked up only after a fail | [RFC 7208 Section 6.2](https://www.rfc-editor.org/rfc/rfc7208#section-6.2) |

The order matters to a receiver: it evaluates left to right, depth first, and stops at the first match. A sender matched by the 4th term never reaches the 11th, so a record over 10 fails only for senders listed late. On November 7, 2026, a check of 192.0.2.10 against "v=spf1 include:\_spf.salesforce.com -all" used 2 lookups and returned fail.

- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### Do ip4, ip6 and all count toward the SPF lookup limit?

No. Only include, a, mx, ptr, exists and the redirect modifier count (RFC 7208 Section 4.6.4).

### Do nested includes count toward the 10 lookup limit?

Yes. The limit is for the whole check, so every include, a, mx, ptr, exists and redirect inside an included record adds to the same 10.

## Related

- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [Void lookups: the second limit](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/void-lookups/)
- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/  
Data as of: 2026-11-07  
CSV: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts.csv
