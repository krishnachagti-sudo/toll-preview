# Is SPF flattening safe?

Flattening saves lookups but trades them for upkeep and size: flattening Google Workspace + Microsoft 365 takes the record from 2 lookups to 0, but the ranges are a copy that goes stale when either provider changes them, and the record grows to 429 characters. Do it last, after removing unused senders.

## Before and after, worked out

Includes replaced by the ip4/ip6 ranges they listed on November 7, 2026; sizes by the counter's engine for example.com.

| Flattened | Lookups before | After | Ranges | Characters | 255-char strings | Under the 450 guide |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| Google Workspace | 1 | 0 | 8 | 192 | 1 | Yes |
| Microsoft 365 | 1 | 0 | 11 | 248 | 1 | Yes |
| Google Workspace + Microsoft 365 | 2 | 0 | 19 | 429 | 2 | Yes |
| Google Workspace + HubSpot | 3 | 0 | 35 | 721 | 3 | No |
| Google Workspace + Microsoft 365 + HubSpot + Zendesk | 5 | 0 | 51 | 1059 | 5 | No |

> Counts worked out by the counter's RFC 7208 engine on the provider records measured on November 7, 2026 through public DNS (Cloudflare 1.1.1.1, Google 8.8.8.8). Providers change their records without notice: run the tool for today's number.

The last row saves 5 lookups and needs 5 TXT strings. Multiple strings are fine: receivers join them without spaces ([RFC 7208 Section 3.3](https://www.rfc-editor.org/rfc/rfc7208#section-3.3)). The size guide is the harder limit: RFC 7208 says the record SHOULD stay small enough that the answer fits in 512 octets, and that a name plus text under 450 octets ought to fit in UDP; records too long for one UDP packet "could be silently ignored" by some verifiers ([RFC 7208 Section 3.4](https://www.rfc-editor.org/rfc/rfc7208#section-3.4)). Other TXT records at the same name count toward the same answer.

## Why flattening goes stale

An include is a pointer: the provider edits its own record and every domain that includes it follows. A flattened record is a copy taken on one day. Providers add ranges as they grow; until your copy is updated, mail from the new ranges matches nothing and gets your "all" result. Services that re-flatten automatically need control of your DNS record and must keep running.

## Try these first

- Remove includes for services you no longer use.
- Replace a and mx for your own servers with ip4/ip6: their addresses are yours, so the copy does not go stale without you knowing.
- Move a bulk sender to a subdomain with its own record ([adding a sender](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/add-a-sender/)).
- Flatten only providers that publish stable, documented ranges, and recount after every change.

## Count your record before and after

[Count my lookups](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/?domain=example.com)

> SPF is one of several checks a receiver makes, so passing it does not guarantee delivery. Receivers may differ on SHOULD rules such as the void lookup limit.

## Sources

- [IETF RFC 7208: Sender Policy Framework (SPF), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7208)

## Questions

### What is SPF flattening?

Replacing include terms with the ip4 and ip6 ranges they resolve to today. ip4 and ip6 cost no DNS lookups, so the count drops.

### What is the risk of flattening?

The ranges are a copy. When a provider changes its ranges, its include follows automatically but your flattened copy does not, and mail from the new addresses stops passing SPF until someone updates the record.

### How long can an SPF record be?

One TXT string holds at most 255 octets; longer records are split into several strings that receivers join without spaces (RFC 7208 Section 3.3). RFC 7208 Section 3.4 says the answer SHOULD fit in 512 octets and gives 450 octets (name plus text) as the guide.

## Related

- [Add a sender without going over 10](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/add-a-sender/)
- [Fix "too many DNS lookups"](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/too-many-dns-lookups/)
- [Every provider include and its cost](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/include-costs/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/flattening/  
Data as of: 2026-11-08
