# How SPF DNS lookups are counted: method and sources

Every term that makes a DNS query (include, a, mx, ptr, exists and the redirect modifier) is counted across the record and every record it includes, against RFC 7208's limit of 10. ip4, ip6, all and exp cost nothing. Lookups that find nothing are counted separately as void lookups, against a limit of 2.

## How does it work?

1. The record is read: the TXT records at the domain from public DNS (Cloudflare 1.1.1.1 and Google 8.8.8.8 by default, never the machine's own resolver), or the draft given.
2. The record is parsed term by term. Any syntax error, such as an unknown mechanism, a bad network or a domain-spec without a top label, makes the whole record permerror (Section 4.6).
3. The audit walks every term left to right and depth first, the way a receiver would reach them if nothing matched earlier. include, a, mx, ptr and exists each cost one lookup, and so does redirect when the record has no "all". ip4, ip6 and all cost nothing, exp is never counted, and terms after "all" are ignored.
4. Each included record is fetched and walked the same way, sharing one budget of 10 with the record above it.
5. A query that finds no name or no data is a void lookup. The 3rd void lookup is named.

> Steps 6 to 7, each rule and the edge cases are in [the full method](https://krishnachagti-sudo.github.io/toll-preview/methodology/spf-lookup-counter/#what) below.

## What does it not cover?

- It does not send or receive mail and does not check DKIM or DMARC: only the SPF record and what a receiver would decide from it.
- The count is what public DNS answered at the moment of the check. A provider can change its record at any time.
- Private and special-use names, and private or reserved sending IPs, are refused rather than queried.
- Some receivers do not enforce the void lookup limit; the tool reports what RFC 7208 says, not what any one receiver does.

## How fresh is the data?

- [Data as of Nov 4, 2026, from 8 sources](https://krishnachagti-sudo.github.io/toll-preview/updates/): The rules are RFC 7208's and change only with the code. Each check reads live DNS at the moment of the call, through 1.1.1.1 and 8.8.8.8. The provider include hosts were read from each provider's own setup page on 2026-11-07, and what each include costs was measured on public DNS on 2026-11-07.
- [Tested: 4 checks in its test suite](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks): Every counting rule is checked against a recorded DNS zone, with no network: which terms count, nested includes sharing one budget, exactly 10, void lookups, two records, syntax errors, redirect, mx over 10 names, loops and duplicate includes.

- [RFC 7208: Sender Policy Framework (SPF) for Authorizing Use of Domains in Email, Version 1](https://www.rfc-editor.org/rfc/rfc7208), the rules every count applies, not recorded
- [Google Workspace: SPF setup](https://knowledge.workspace.google.com/admin/security/set-up-spf), include \_spf.google.com, read 2026-11-07
- [Microsoft 365: SPF setup](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-spf-configure), include spf.protection.outlook.com, read 2026-11-07
- [Amazon SES (custom MAIL FROM domain): SPF setup](https://docs.aws.amazon.com/ses/latest/dg/mail-from.html), include amazonses.com, read 2026-11-07
- [Zendesk: SPF setup](https://support.zendesk.com/hc/en-us/articles/4408832543770), include mail.zendesk.com, read 2026-11-07
- [HubSpot: SPF setup](https://knowledge.hubspot.com/marketing-email/manage-email-authentication-in-hubspot), include shared.hubspot.com, read 2026-11-07
- [Postmark: SPF setup](https://postmarkapp.com/support/article/1092-how-do-i-set-up-spf-for-postmark), include spf.mtasv.net, read 2026-11-07
- [Zoho Mail: SPF setup](https://www.zoho.com/mail/help/adminconsole/spf-configuration.html), include zohomail.com, read 2026-11-07

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## What does the spf lookup counter compute?

The tool reads a domain's SPF record from public DNS, or takes a draft record, and walks every term of it and of every record it includes. It says how many of the 10 DNS lookups the record uses, which term would be the 11th, how many void lookups it finds, and what each top-level term costs.

**In detail: operations, inputs and outputs**

Given a sending IP, it also runs the evaluation a receiver would run and gives the result. A third operation explains an SPF macro without any DNS.

Operations (the op field):

- `check`: Counts the lookups of one domain's live record, or of a draft: a whole record given as record, or the live record with terms added (add) or removed (remove). With ip, and optionally sender and helo, it also gives the result a receiver returns for that address. The answer has lookups, firstOver, voidLookups, verdict, costs, errors, warnings, suggestions and the full tree.
- `batch`: Counts up to 50 domains in one call, 5 at a time, and returns one summary row per domain (verdict, lookups, void lookups, the first term over the limit, the dearest term and the record). A domain that could not be checked is marked not-run and is not charged.
- `macro`: Expands one SPF macro-string (RFC 7208 Section 7) for a domain, sending IP, sender and HELO name, and shows what each macro letter becomes. It makes no DNS query and is free.

Inputs:

- `domain`: A domain name such as example.com. Private and special-use names (.local, .internal, .lan, .corp, .home.arpa, .arpa and similar) and single-label names are refused, on every hop.
- `record, add, remove`: For check only: a draft record starting with v=spf1 (at most 4,096 characters), or up to 20 terms to add before "all" and up to 20 terms to remove as written.
- `ip, sender, helo`: Optional: the sending IPv4 or IPv6 address, the MAIL FROM address and the HELO name. Private, loopback, link-local and reserved addresses are refused.
- `domains`: For batch: a list of 1 to 50 different domains.
- `macro, validatedName, exp`: For macro: the macro-string, the validated host name to use for %{p}, and whether it is exp text.

Outputs:

- verdict: ok, permerror, temperror or none
- lookups and firstOver: the count and the term that is the 11th
- voidLookups: queries that found no answer
- costs: each top-level term and the lookups it costs, dearest first
- path: for a sending IP, the result a receiver returns and the lookups it used
- dns: the resolver used, the number of queries and when the check ran

**Every step in full (7) and the rules**

1. The record is read: the TXT records at the domain from public DNS (Cloudflare 1.1.1.1 and Google 8.8.8.8 by default, never the machine's own resolver), or the draft given. No v=spf1 record gives none, and two or more give permerror (Section 4.5).
2. The record is parsed term by term. Any syntax error, such as an unknown mechanism, a bad network or a domain-spec without a top label, makes the whole record permerror (Section 4.6).
3. The audit walks every term left to right and depth first, the way a receiver would reach them if nothing matched earlier. include, a, mx, ptr and exists each cost one lookup, and so does redirect when the record has no "all". ip4, ip6 and all cost nothing, exp is never counted, and terms after "all" are ignored.
4. Each included record is fetched and walked the same way, sharing one budget of 10 with the record above it. The term that brings the count to 11 is named, and the walk keeps going so the full overage shows.
5. A query that finds no name or no data is a void lookup. The 3rd void lookup is named. An include or redirect that points at a name with no SPF record is permerror.
6. With a sending IP, check\_host() is run as Section 4 describes: it stops at the first matching term, and returns that term's result, or permerror at the 11th lookup or the 3rd void lookup on its own path, or neutral when nothing matches and there is no redirect.
7. The verdict is none with no record, permerror when there is any error, temperror when a DNS query failed, and ok otherwise. Suggestions name the terms that find nothing, ptr, duplicate includes and, when over the limit, the dearest include to move to a subdomain.

**RFC 7208.**

The limits are Section 4.6.4's: at most 10 DNS-querying terms per check, at most 2 void lookups, at most 10 names looked up for each mx and at most 10 for ptr. TXT answers over 450 octets get a warning from Section 3.4's guide, since an answer over 512 octets needs EDNS0 or TCP.

Macros follow Section 7: each letter (s, l, o, d, i, p, h, v, and c, r and t in exp text only) is replaced by its value, with the digit, reverse and delimiter transformers applied, and a name over 253 characters loses labels from the left until it fits.

**Our own caps.**

So that one call cannot become a flood of DNS queries, one check walks at most 40 counted terms, makes at most 200 queries and stops after 20 seconds, the time RFC 7208 asks receivers to allow. A check stopped by a cap says its count is a floor.

## Which edge cases does it handle?

**The edge cases (7)**

- Nested includes share one budget: an include that itself includes three more costs four.
- The same include written twice costs twice, and the suggestions say to include it once.
- A record of exactly 10 lookups is fine, with a near-limit warning.
- A macro term without a sending IP is counted and not followed, because its target depends on the sender; with an IP it is expanded and followed.
- An mx that finds more than 10 MX names is permerror, and an include or redirect that loops back to a record above it is reported.
- redirect is ignored when the record also has "all", and "+all" gets a warning that it authorizes every address.
- A DNS failure for the domain itself is refunded as an upstream error, not charged as an answer.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Explain a macro: %{ir}.%{v}.\_spf.%{d2} for an IPv4 sender (RFC 7208 Section 7.4)**

Explain a macro: %{ir}.%{v}.\_spf.%{d2} for an IPv4 sender (RFC 7208 Section 7.4)

| Result | Value |
| --- | --- |
| expansion | 3.2.0.192.in-addr.\_spf.example.com |
| %{ir} | 192.0.2.3 becomes 3.2.0.192 |
| %{v} | in-addr becomes in-addr |
| %{d2} | email.example.com becomes example.com |
| valid DNS name | yes |

**The input**

```json
{
  "op": "macro",
  "macro": "%{ir}.%{v}._spf.%{d2}",
  "domain": "email.example.com",
  "ip": "192.0.2.3",
  "sender": "strong-bad@email.example.com"
}
```

**More worked examples (1)**

**The same macro for an IPv6 sender**

The same macro for an IPv6 sender

| Result | Value |
| --- | --- |
| expansion | 1.0.b.c.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.\_spf.example.com |
| %{ir} | 2.0.0.1.0.d.b.8.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.c.b.0.1 becomes 1.0.b.c.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2 |
| %{v} | ip6 becomes ip6 |
| %{d2} | email.example.com becomes example.com |
| valid DNS name | yes |

**The input**

```json
{
  "op": "macro",
  "macro": "%{ir}.%{v}._spf.%{d2}",
  "domain": "email.example.com",
  "ip": "2001:db8::cb01",
  "sender": "strong-bad@email.example.com"
}
```

## How is it tested?

The macro expander is checked against every example in RFC 7208 Section 7.4, IPv4 and IPv6, and check\_host() for each mechanism.

**What its test suite asserts (4)**

- Counting is checked on a recorded DNS zone: include, a, mx, ptr, exists and redirect count; ip4, ip6, all and exp do not; nested includes share one budget and the 11th term is named.
- Void lookups, two records, no record, syntax errors, mx over 10 names, loops and duplicate includes are each checked to give the RFC 7208 result.
- The macro expander reproduces every example in RFC 7208 Section 7.4, IPv4 and IPv6, and check\_host() is checked for each mechanism, the default and the void limit on its path.
- Private and special-use names are never queried on any hop, and the query and time caps stop a check.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the SPF lookup counter tool](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/).

## Questions

### Is there any AI in the spf lookup counter answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the spf lookup counter refuse to answer?

It does not send or receive mail and does not check DKIM or DMARC: only the SPF record and what a receiver would decide from it. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the SPF lookup counter tool](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [What counts as an SPF lookup](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/what-counts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/spf-lookup-counter/  
Data as of: 2026-11-04
