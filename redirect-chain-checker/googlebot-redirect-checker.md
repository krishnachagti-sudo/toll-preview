# Googlebot redirect checker

By default, Google's crawlers follow up to 10 redirect hops. The checker can send the Googlebot smartphone user agent and flags any chain longer than that: a 10-hop chain passes, an 11-hop chain is marked "More than 10 hops: past Google's default limit".

## Check as Googlebot

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=http%3A%2F%2Fexample.com%2F&ua=googlebot)

## Why check as Googlebot

- Google Inspection Tools doesn't follow redirects.
- Some sites redirect bots differently from browsers (by user agent or country). Run the same list as our own agent and as Googlebot and compare.
- A request with the Googlebot user agent is not Googlebot: sites that check Google's IP addresses will treat it as a normal visitor, so a difference in the answers is a lead, not proof.

## Chain length against the limit

| Redirects | Verdict |
| ---: | --- |
| 10 | Long chain (5 hops or more); Chain (2 or more hops) |
| 11 | More than 10 hops: past Google's default limit; Long chain (5 hops or more); Chain (2 or more hops) |

- [Google Search Central: HTTP status codes, network and DNS errors (updated February 4, 2026, read November 7, 2026)](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)

## Questions

### Does the URL Inspection tool follow redirects?

No. Google Inspection Tools doesn't follow redirects. By default, Google's crawlers follow up to 10 redirect hops.

### What does Google index from a URL that redirects?

Nothing from that URL. Any content Google receives from the redirecting URL is ignored.

## Related

- [How many redirects is too many?](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/how-many-redirects-is-too-many/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/googlebot-redirect-checker/  
Data as of: 2026-11-07
