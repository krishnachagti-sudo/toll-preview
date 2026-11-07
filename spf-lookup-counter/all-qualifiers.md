# SPF ~all vs -all vs ?all

The last term decides what a sender matched by nothing else gets: -all returns "fail", ~all "softfail" and ?all "neutral" (RFC 7208 Section 4.6.2). Checked by the engine, 192.0.2.10 against "v=spf1 include:\_spf.google.com ~all" gets softfail, while 74.125.1.1, inside Google's ranges, gets pass whichever ending you choose.

## What each ending returns

Each record checked for two sending IPs by the counter's engine, on Google's include as measured November 7, 2026.

| Record | 74.125.1.1 (in Google's ranges) | 192.0.2.10 (not listed) | RFC 7208 |
| --- | --- | --- | --- |
| `v=spf1 include:_spf.google.com -all` | pass | fail | [RFC 7208 Section 8.4](https://www.rfc-editor.org/rfc/rfc7208#section-8.4) |
| `v=spf1 include:_spf.google.com ~all` | pass | softfail | [RFC 7208 Section 8.5](https://www.rfc-editor.org/rfc/rfc7208#section-8.5) |
| `v=spf1 include:_spf.google.com ?all` | pass | neutral | [RFC 7208 Section 8.2](https://www.rfc-editor.org/rfc/rfc7208#section-8.2) |

The qualifier only matters for mail that matches nothing before it. RFC 7208 reads the terms left to right and stops at the first match, so the "all" at the end is the default for everyone else ([RFC 7208 Section 5.1](https://www.rfc-editor.org/rfc/rfc7208#section-5.1)).

## What does a receiver do with each result?

- **fail (-all):** "an explicit statement that the client is not authorized to use the domain". What to do with it is the receiver's local policy; a receiver that rejects during SMTP should use reply code 550 (Section 8.4).
- **softfail (~all):** somewhere between fail and neutral. Receivers SHOULD NOT reject on this result alone but MAY look at the message more closely (Section 8.5).
- **neutral (?all):** MUST be treated exactly like "none", the result that gives the receiver no information either way (Section 8.2).
- **pass (+all):** the RFC's own example: with "v=spf1 +all", any IP passes. Never end a sending domain's record this way.

## How does DMARC see ~all and -all?

RFC 7489 (DMARC, an Informational RFC) counts SPF only when it "produces a 'pass' result" for an identifier aligned with the From domain ([RFC 7489 Section 4.2](https://www.rfc-editor.org/rfc/rfc7489#section-4.2)). A softfail is not a pass and neither is a fail, so with DMARC in place the ending changes what a receiver does with SPF on its own, not whether DMARC passes. An aligned DKIM signature can still make DMARC pass when SPF does not, since one aligned pass is enough.

## Which ending do providers show?

The setup pages of the providers we track, as read for the [include cost table](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/), end their example records like this:

- ~all: Google Workspace, Amazon SES
- -all: Microsoft 365, Microsoft 365 GCC High and DoD, Microsoft 365 operated by 21Vianet, Zendesk, Zoho Mail, Zoho

A common path: start with ~all while you find every service that sends as you, and move to -all once DMARC reports show nothing legitimate failing. A domain that sends no mail at all can publish "v=spf1 -all", the record RFC 7208 Section 10.1.2 gives for it.

## See what your record returns

[Count my lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com)

> SPF is one of several checks a receiver makes, so passing it does not guarantee delivery. Receivers may differ on SHOULD rules such as the void lookup limit.

## Sources

- [IETF RFC 7208: Sender Policy Framework (SPF), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7208)
- [IETF RFC 7489: Domain-based Message Authentication, Reporting, and Conformance (DMARC), Informational, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7489)

## Questions

### What is the difference between ~all and -all?

A sender that matches nothing else gets "softfail" with ~all and "fail" with -all (RFC 7208 Section 4.6.2). RFC 7208 says receivers SHOULD NOT reject on softfail alone; what they do with fail is local policy.

### Does ~all or -all matter for DMARC?

Not for the DMARC result itself: under RFC 7489 SPF helps DMARC only when it returns "pass" for a domain aligned with the From address. Softfail and fail are both not a pass.

### What happens if a record has no all at the end?

A sender that matches nothing gets "neutral", as if ?all were written (RFC 7208 Section 4.7). RFC 7208 says ending the record explicitly aids debugging.

### Should I ever use +all?

No for a sending domain: RFC 7208's own example says that with "v=spf1 +all" any IP passes, so the record authorizes the whole internet.

## Related

- [SPF record examples for common providers](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/record-examples/)
- [Two SPF records: merge them into one](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/two-spf-records/)
- [Every permerror cause](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/permerror/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/all-qualifiers/  
Data as of: 2026-11-08
