# Multiple SPF records: how to merge them

A domain with 2 SPF records fails every SPF check with permerror (RFC 7208 Section 4.5), so merge them: "v=spf1 include:\_spf.google.com ~all" and "v=spf1 include:spf.protection.outlook.com -all" become "v=spf1 include:\_spf.google.com include:spf.protection.outlook.com ~all", which uses 2 of 10 lookups.

## What the counter reports

For a made-up domain publishing both records, the engine says: "example.org publishes 2 SPF records, so every SPF check returns permerror (Section 4.5)."

Worked by the counter's engine on Google's and Microsoft's includes as measured November 7, 2026

| Published | Result | Lookups |
| --- | --- | ---: |
| v=spf1 include:\_spf.google.com ~all  +  v=spf1 include:spf.protection.outlook.com -all | permerror | - |
| `v=spf1 include:_spf.google.com include:spf.protection.outlook.com ~all` | one record, evaluated | 2 |

Picking the ending: the two records ended differently. ~all is kept here because a sender missed by either list then gets softfail rather than fail; see [~all vs -all](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/all-qualifiers/).

## Where a second record comes from

- One way it happens: a new provider's setup page shows a full record ("v=spf1 include:... ~all") and it is added as a new TXT record instead of merged into the old one.
- Records must be published as DNS TXT records (RFC 7208 Section 3.1); the separate SPF record type is no longer used.

## Count the merged record

[Count this record](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&record=v%3Dspf1+include%3A_spf.google.com+include%3Aspf.protection.outlook.com+%7Eall)

> SPF is one of several checks a receiver makes, so passing it does not guarantee delivery. Receivers may differ on SHOULD rules such as the void lookup limit.

## Sources

- [IETF RFC 7208: Sender Policy Framework (SPF), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7208)

## Steps

1. **List the records.** Find every TXT record at the domain that starts with v=spf1. Other TXT records (site verifications) do not matter.
2. **Collect the terms.** Take every include, ip4, ip6, a and mx term from all of them, once each.
3. **Keep one all.** End the merged record with a single all: the stricter of the two if you are sure every sender is listed, ~all if not.
4. **Count it.** Paste the merged record in the counter: two records under 10 each can be over 10 together.
5. **Replace, then delete.** Publish the merged record and delete the others in the same change.

## Questions

### Can a domain have two SPF records?

No. RFC 7208 Section 4.5: if more than one v=spf1 record remains, check\_host() returns permerror, for every sender.

### Is the second record ignored?

No. Neither is used: the result is permerror, not the first record.

### Do subdomains count as a second record?

No. Each name has its own record: example.com and news.example.com can each publish one.

## Related

- [SPF record examples](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/record-examples/)
- [~all vs -all vs ?all](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/all-qualifiers/)
- [Every permerror cause](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/permerror/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/two-spf-records/  
Data as of: 2026-11-08
