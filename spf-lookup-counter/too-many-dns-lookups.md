# Fix "SPF permerror: too many DNS lookups"

RFC 7208 lets one SPF check make at most 10 DNS-querying lookups, nested includes included, and the 11th returns permerror; on November 7, 2026 github.com used 10 of 10, its dearest terms being include:\_spf.salesforce.com (2), include:sendgrid.net (2), include:spf.protection.outlook.com (1).

- Lookups github.com used: 10
- The limit: 10
- Void lookup limit: 2

## Count your record

[Count my lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com)

## A real record, counted

github.com's record on November 7, 2026:

```
v=spf1 ip4:192.30.252.0/22 include:spf.protection.outlook.com include:_netblocks.google.com include:_netblocks2.google.com include:mail.zendesk.com include:_spf.salesforce.com include:servers.mcsv.net include:mktomail.com include:sendgrid.net ip4:62.253.227.114 ip4:166.78.69.169 ip4:166.78.69.170 ip4:166.78.71.131 ~all
```

Top-level terms by cost

| Term | Lookups |
| --- | ---: |
| `include:_spf.salesforce.com` | 2 |
| `include:sendgrid.net` | 2 |
| `include:spf.protection.outlook.com` | 1 |
| `include:_netblocks.google.com` | 1 |
| `include:_netblocks2.google.com` | 1 |
| `include:mail.zendesk.com` | 1 |
| `include:servers.mcsv.net` | 1 |
| `include:mktomail.com` | 1 |

Total: 10 of 10, so adding any include, a, mx or exists would push it over.

## Fixes, by lookups saved

- Remove includes for services you no longer send from: saves the whole include cost.
- Remove terms that find nothing: saves 1 lookup and 1 void lookup each.
- Replace a and mx with ip4/ip6 for servers you run: saves 1 each.
- Move a bulk sender to a subdomain with its own record: saves that include's cost on the main domain.
- Flatten (replace an include with the ranges it lists) only for providers with stable, documented ranges: it breaks silently when they change.

- [IETF RFC 7208: Sender Policy Framework (SPF), read 2026-11-07](https://www.rfc-editor.org/rfc/rfc7208)
- [Microsoft Learn: Set up SPF for Microsoft 365 (reduce DNS lookups), read 2026-11-07](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-spf-configure)

> Counts follow RFC 7208 at the time and through the resolver shown; receivers may differ on SHOULD rules such as the void lookup limit. SPF is one of several checks a receiver makes, so passing it does not guarantee delivery.

## Steps

1. **Count.** Run the counter on your domain. It numbers every DNS-querying term, nested ones too, and names the 11th.
2. **Find the dearest include.** Sort the top-level terms by cost: an include costs 1 plus everything inside it.
3. **Remove what you no longer use.** Drop includes for services you stopped using, and any include, a or mx that finds nothing (it also spends a void lookup).
4. **Replace a and mx with ip4/ip6.** Your own servers rarely change address; ip4 and ip6 cost no lookups. Update them if the servers move.
5. **Move a sender to a subdomain.** Send newsletters from news.yourdomain with its own record: it gets its own 10 lookups.
6. **Count the draft before you publish.** Paste the new record (or add and remove terms) in the counter and check it is under 10 before you change DNS.

## Questions

### What does "SPF permerror too many DNS lookups" mean?

The receiver needed more than 10 DNS-querying terms (include, a, mx, ptr, exists, redirect) to check your record, so RFC 7208 Section 4.6.4 makes the result permerror instead of pass or fail.

### Does an SPF record with fewer than 10 includes stay under the limit?

Not always: each include also costs whatever is inside the record it points at, so 4 includes can cost 11.

## Related

- [What counts toward the 10 lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)
- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)
- [Void lookups: the second limit](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/void-lookups/)
- [Add a sender without going over 10](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/add-a-sender/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/  
Data as of: 2026-11-07
