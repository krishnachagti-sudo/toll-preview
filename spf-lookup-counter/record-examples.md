# SPF record examples, with their lookup counts

One record, every sender's include in it, one "all" at the end: "v=spf1 include:\_spf.google.com include:shared.hubspot.com ~all" covers Google Workspace and HubSpot and uses 3 of the 10 DNS lookups RFC 7208 allows. The examples below are counted by the counter's engine on each provider's record as measured on November 7, 2026.

## The records

Lookups used of 10, measured November 7, 2026

| Sends through | Record | Lookups | Result |
| --- | --- | ---: | --- |
| Google Workspace only | `v=spf1 include:_spf.google.com ~all` | 1 | 9 left |
| Microsoft 365 only | `v=spf1 include:spf.protection.outlook.com -all` | 1 | 9 left |
| Google Workspace and HubSpot | `v=spf1 include:_spf.google.com include:shared.hubspot.com ~all` | 3 | 7 left |
| Microsoft 365, Zendesk and Postmark | `v=spf1 include:spf.protection.outlook.com include:mail.zendesk.com include:spf.mtasv.net -all` | 3 | 7 left |
| Google Workspace, Microsoft 365, HubSpot and Zendesk | `v=spf1 include:_spf.google.com include:spf.protection.outlook.com include:shared.hubspot.com include:mail.zendesk.com ~all` | 5 | 5 left |
| Everything at once (over the limit) | `v=spf1 include:_spf.google.com include:spf.protection.outlook.com include:mail.zendesk.com include:shared.hubspot.com include:spf.mtasv.net include:zohomail.com include:one.zoho.com -all` | 12 | permerror: over 10 |

> Counts worked out by the counter's RFC 7208 engine on the provider records measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8). Providers change their records without notice: run the tool for today's number.

The last row shows how a record goes over: 7 includes, but 12 lookups, because include:one.zoho.com costs 4 and include:shared.hubspot.com costs 2 and include:zohomail.com costs 2. An include costs 1 plus every lookup inside the record it points at ([what counts](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)).

## The syntax, term by term

- `v=spf1` first, exactly; a record starting with anything else, such as v=spf10, is ignored (RFC 7208 Section 4.5).
- `include:host` one per provider, each costing at least 1 lookup.
- `ip4:203.0.113.5` or `ip6:2001:db8::/32` for servers you run: no lookup.
- `~all` or `-all` last; see [~all vs -all](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/all-qualifiers/).

## Providers whose include goes elsewhere

Amazon SES's include belongs in the record of the custom MAIL FROM subdomain you set up in SES, not on your main domain (see [Amazon SES](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/amazon-ses/)). Microsoft 365 GCC High and 21Vianet have their own includes, listed in the [include cost table](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/).

## Count a record before you publish it

[Count this record](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&record=v%3Dspf1+include%3A_spf.google.com+include%3Ashared.hubspot.com+%7Eall)

> SPF is one of several checks a receiver makes, so passing it does not guarantee delivery. Receivers may differ on SHOULD rules such as the void lookup limit.

## Sources

- [IETF RFC 7208: Sender Policy Framework (SPF), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7208)
- [Google Workspace: SPF setup page, read November 7, 2026](https://knowledge.workspace.google.com/admin/security/set-up-spf)
- [Microsoft 365: SPF setup page, read November 7, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-spf-configure)
- [Zendesk: SPF setup page, read November 7, 2026](https://support.zendesk.com/hc/en-us/articles/4408832543770)
- [HubSpot: SPF setup page, read November 7, 2026](https://knowledge.hubspot.com/marketing-email/manage-email-authentication-in-hubspot)
- [Postmark: SPF setup page, read November 7, 2026](https://postmarkapp.com/support/article/1092-how-do-i-set-up-spf-for-postmark)

## Questions

### What is the SPF record for Google Workspace?

Google's setup page gives "v=spf1 include:\_spf.google.com ~all". It uses 1 of the 10 lookups as measured on November 7, 2026.

### What is the SPF record for Microsoft 365?

Microsoft's setup page gives "v=spf1 include:spf.protection.outlook.com -all". It uses 1 of the 10 lookups as measured on November 7, 2026.

### How do I combine Google Workspace and HubSpot in one SPF record?

Put both includes in one record before the all: "v=spf1 include:\_spf.google.com include:shared.hubspot.com ~all". It uses 3 of 10 lookups.

### Can I publish one SPF record per provider?

No. A domain must publish one v=spf1 record; two or more make every check return permerror (RFC 7208 Section 4.5). Put every include in the same record.

## Related

- [Add a sender without going over 10](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/add-a-sender/)
- [~all vs -all vs ?all](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/all-qualifiers/)
- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/record-examples/  
Data as of: 2026-11-08
