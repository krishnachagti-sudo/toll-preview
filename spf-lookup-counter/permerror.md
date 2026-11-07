# SPF permerror: every cause

SPF permerror means the record cannot be evaluated as published; RFC 7208 gives 9 causes, the most common being more than 10 DNS lookups and a second v=spf1 record.

- Causes in RFC 7208: 9

## Check your record

[Count my lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com)

## The causes

| Cause | RFC 7208 |
| --- | --- |
| More than 10 DNS-querying terms | [RFC 7208 Section 4.6.4](https://www.rfc-editor.org/rfc/rfc7208#section-4.6.4) |
| More than 2 void lookups (SHOULD) | [RFC 7208 Section 4.6.4](https://www.rfc-editor.org/rfc/rfc7208#section-4.6.4) |
| An mx term with more than 10 MX names | [RFC 7208 Section 4.6.4](https://www.rfc-editor.org/rfc/rfc7208#section-4.6.4) |
| Two or more v=spf1 records at one name | [RFC 7208 Section 4.5](https://www.rfc-editor.org/rfc/rfc7208#section-4.5) |
| Any syntax error anywhere in the record | [RFC 7208 Section 4.6](https://www.rfc-editor.org/rfc/rfc7208#section-4.6) |
| An include whose target has no SPF record | [RFC 7208 Section 5.2](https://www.rfc-editor.org/rfc/rfc7208#section-5.2) |
| A redirect whose target has no SPF record | [RFC 7208 Section 6.1](https://www.rfc-editor.org/rfc/rfc7208#section-6.1) |
| redirect= or exp= given twice | [RFC 7208 Section 6](https://www.rfc-editor.org/rfc/rfc7208#section-6) |
| A "%" not followed by {, %, \_ or - | [RFC 7208 Section 7.3](https://www.rfc-editor.org/rfc/rfc7208#section-7.3) |

A permerror is decided per message: a sender matched before the 11th lookup still passes, so a record over the limit can look fine for your main mail and fail for the senders listed last.

- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### What happens if a domain has two SPF records?

Every SPF check returns permerror: RFC 7208 Section 4.5 says that if more than one v=spf1 record remains, check\_host() produces permerror.

### What happens if an include points to a domain with no SPF record?

The include returns permerror, not a non-match (RFC 7208 Section 5.2).

## Related

- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [Void lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/void-lookups/)
- [Two SPF records: merge them into one](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/two-spf-records/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/permerror/  
Data as of: 2026-11-07
