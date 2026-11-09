# DMARC alignment, worked out

DMARC alignment (RFC 7489) passes when the domain SPF or DKIM authenticated has the same organizational domain as the From: domain (relaxed, the default) or is the very same name (strict, adkim=s or aspf=s); of the 10 pairs below, 6 align relaxed and 1 strict, and in the worked example neither the DKIM domain (mailer.example.net) nor the SPF domain (mailer.example.net) is in shop.example.com's organizational domain, example.com.

- Default mode: relaxed
- Pairs worked: 10

## Check the alignment of a real message

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=not-aligned)

## The rule

RFC 7489 Section 3.1: in relaxed mode the organizational domains must match; in strict mode the names must be identical. The organizational domain is the public suffix plus one label, from the Public Suffix List ([RFC 7489 Section 3.2](https://www.rfc-editor.org/rfc/rfc7489#section-3.2)). DMARC passes when SPF or DKIM passes and that identifier aligns.

## Ten pairs

Organizational domains from the Public Suffix List as published November 8, 2026

| From: domain | SPF or DKIM domain | Organizational domains | Relaxed | Strict |
| --- | --- | --- | --- | --- |
| example.com | example.com | example.com / example.com | aligned | aligned |
| example.com | mail.example.com | example.com / example.com | aligned | not aligned |
| shop.example.com | example.com | example.com / example.com | aligned | not aligned |
| shop.example.com | bounce.shop.example.com | example.com / example.com | aligned | not aligned |
| shop.example.com | mailer.example.net | example.com / example.net | not aligned | not aligned |
| example.co.uk | news.example.co.uk | example.co.uk / example.co.uk | aligned | not aligned |
| example.co.uk | other.co.uk | example.co.uk / other.co.uk | not aligned | not aligned |
| brand.github.io | other.github.io | brand.github.io / other.github.io | not aligned | not aligned |
| example.com.au | em.example.com.au | example.com.au / example.com.au | aligned | not aligned |
| example.org | example.org.mailer.example.net | example.org / example.net | not aligned | not aligned |

github.io is on the Public Suffix List's private section, so brand.github.io and other.github.io are different organizations; com.au and co.uk are public suffixes, so example.com.au is the organizational domain.

- [RFC 7489 Section 3.1](https://www.rfc-editor.org/rfc/rfc7489#section-3.1)
- [Public Suffix List (Mozilla Public License 2.0), read November 8, 2026](https://publicsuffix.org/list/public_suffix_list.dat)
- [Google: Email sender guidelines FAQ, read November 8, 2026](https://support.google.com/a/answer/14229414?hl=en)
- [Yahoo Sender Hub: Sender Requirements & Recommendations, read November 8, 2026](https://senders.yahooinc.com/best-practices/)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Providers also judge reputation and content, so meeting every rule does not guarantee the inbox. Spam rate, volume and unsubscribe handling cannot be judged from one message.

## Questions

### Does Gmail need SPF and DKIM both aligned?

No. Google's FAQ: only one of them needs to be aligned, though it recommends aligning both and says that is likely to become a requirement.

### Is relaxed alignment enough for Yahoo?

Yes. Yahoo's Sender Hub: "Relaxed alignment is acceptable".

## Related

- [SPF passes but DMARC fails](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/spf-passes-dmarc-fails/)
- [Is DMARC p=none enough?](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/dmarc-p-none-enough/)
- [Gmail's rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/gmail/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/dmarc-alignment/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/dmarc-alignment.csv
