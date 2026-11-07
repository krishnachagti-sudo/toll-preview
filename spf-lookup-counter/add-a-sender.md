# Add a new sender to SPF without breaking it

Count first: a provider's include costs 1 plus every lookup inside it, and RFC 7208 allows 10 in all. As measured on November 7, 2026, adding HubSpot (2 lookups) to a Google Workspace record brings it to 3 of 10.

## What each sender adds

Totals worked out by the counter's what-if, on records measured November 7, 2026

| Adding | Include | Its cost | Google Workspace + it | Microsoft 365 + it |
| --- | --- | ---: | ---: | ---: |
| [HubSpot](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/hubspot/) | `include:shared.hubspot.com` | 2 | 3 | 3 |
| [Zendesk](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/zendesk/) | `include:mail.zendesk.com` | 1 | 2 | 2 |
| [Postmark](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/postmark/) | `include:spf.mtasv.net` | 1 | 2 | 2 |
| [Zoho Mail](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/zoho-mail/) | `include:zohomail.com` | 2 | 3 | 3 |
| [Zoho](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/zoho-one/) | `include:one.zoho.com` | 4 | 5 | 5 |
| [Amazon SES](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include/amazon-ses/) | `include:amazonses.com` | 1 | 2 | 2 |

> Counts worked out by the counter's RFC 7208 engine on the provider records measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8). Providers change their records without notice: run the tool for today's number.

Amazon SES's include usually goes on your custom MAIL FROM subdomain instead, where it starts from zero.

## If the total goes over 10

- Drop includes for services you stopped using: that saves their whole cost.
- Swap a and mx terms for your own servers to ip4/ip6: 1 lookup saved each, and RFC 7208 Section 10.1.2 recommends ip4/ip6 over a and mx when addresses rarely change.
- Send the new provider's mail from a subdomain (for example news.example.com) with its own record: the subdomain gets its own 10.
- Flatten only as a last resort: see [is flattening safe](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/flattening/).

DMARC reads SPF on the envelope sender's domain, so a subdomain still lines up with your From address under DMARC's default relaxed alignment: in relaxed mode the two domains need only share the same Organizational Domain ([RFC 7489 Section 3.1.2](https://www.rfc-editor.org/rfc/rfc7489#section-3.1.2)).

## Try adding HubSpot to your record

[Count this record](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com&add=include%3Ashared.hubspot.com)

> SPF is one of several checks a receiver makes, so passing it does not guarantee delivery. Receivers may differ on SHOULD rules such as the void lookup limit.

## Sources

- [IETF RFC 7208: Sender Policy Framework (SPF), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7208)
- [IETF RFC 7489: Domain-based Message Authentication, Reporting, and Conformance (DMARC), Informational, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7489)
- [HubSpot: SPF setup page, read November 7, 2026](https://knowledge.hubspot.com/marketing-email/manage-email-authentication-in-hubspot)

## Steps

1. **Get the include.** Copy the include from the provider's own setup page, not a forum post: hosts change.
2. **Count what you have.** Run the counter on your domain to see how many of the 10 lookups you use today.
3. **Count the draft.** Add the include with "What if I add" and read the new total, nested includes counted.
4. **Publish one record.** Edit your existing v=spf1 record; never add a second one.
5. **Check again.** Re-run the counter after publishing, and again whenever a provider changes its include.

## Questions

### How many lookups does adding HubSpot use?

Its include cost 2 as measured on November 7, 2026: 1 for itself and 1 for the include inside it. From a Google Workspace record that makes 3 of 10.

### What if adding a sender takes me over 10?

Remove includes for services you no longer use, replace a and mx terms for your own servers with ip4/ip6, or send that provider's mail from a subdomain with its own SPF record, which gets its own 10 lookups.

### Do I need to add every provider to SPF?

Only the ones whose mail uses your domain in the envelope sender (MAIL FROM). Some providers send with their own bounce domain unless you set up a custom one (Amazon SES calls it a custom MAIL FROM domain); their setup page says which.

## Related

- [SPF record examples](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/record-examples/)
- [Is SPF flattening safe?](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/flattening/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/add-a-sender/  
Data as of: 2026-11-08
