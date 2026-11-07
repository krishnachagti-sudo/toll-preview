# SPF void lookups

A void lookup is a DNS query from an SPF term that returns no records or NXDOMAIN; RFC 7208 Section 4.6.4 says receivers SHOULD allow at most 2 per check and return permerror on the 3rd.

- Void lookups allowed: 2
- The one that gives permerror: 3rd

## Find your void lookups

[Count my lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com)

## Where they come from

- An a or mx term for a host that no longer exists.
- An include of a provider you left, whose record is gone (that is also a permerror on its own, RFC 7208 Section 5.2).
- An exists term built from macros: for most senders the name it builds has no A record, by design. Salesforce's exists:%{i}.\_spf.mta.salesforce.com is one.

On November 7, 2026, checking 192.0.2.10 against "v=spf1 include:\_spf.salesforce.com -all" found 1 void lookup: the exists term built a name with no A record. One is fine; a record with three such terms fails for every sender that reaches the third.

- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Questions

### What is an SPF void lookup?

A DNS query made for an SPF term (a, mx, exists, ptr, include) that returns either no answer records or NXDOMAIN.

### Do all receivers enforce the void lookup limit?

No. RFC 7208 says implementations SHOULD limit void lookups to 2, not MUST, and lets the limit be configurable, so some receivers allow more.

## Related

- [What counts toward the 10 lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)
- [Every SPF permerror cause](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/permerror/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/void-lookups/  
Data as of: 2026-11-07
