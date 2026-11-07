# How many redirects is too many?

By default, Google's crawlers follow up to 10 redirect hops. In January 2020 Google's John Mueller advised having fewer than 5 hops in a redirect chain for URLs that are crawled often (as reported by Search Engine Journal). One hop is the aim; the checker marks 2 or more as a chain, 5 or more as long, more than 10 as past Google's limit, and stops at 20.

| Redirects | Verdict | Severity |
| ---: | --- | --- |
| 1 | OK | ok |
| 2 | Chain (2 or more hops) | review |
| 3 | Chain (2 or more hops) | review |
| 4 | Chain (2 or more hops) | review |
| 5 | Long chain (5 hops or more); Chain (2 or more hops) | review |
| 9 | Long chain (5 hops or more); Chain (2 or more hops) | review |
| 10 | Long chain (5 hops or more); Chain (2 or more hops) | review |
| 11 | More than 10 hops: past Google's default limit; Long chain (5 hops or more); Chain (2 or more hops) | fix |
| 21 or more | Stopped: more hops than the limit; More than 10 hops: past Google's default limit; Long chain (5 hops or more); Chain (2 or more hops) | fix |

The two numbers answer different questions. Ten is where Google's crawlers stop following by default; Mueller's five was advice for URLs that are crawled often. Neither is a target: every extra hop is a request a browser waits for.

## Measure your longest chain

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=http%3A%2F%2Fexample.com%2F)

- [Google Search Central: HTTP status codes, network and DNS errors (updated February 4, 2026, read November 7, 2026)](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)
- [Search Engine Journal, January 22, 2020: John Mueller on redirect hops](https://www.searchenginejournal.com/googles-john-mueller-recommends-less-than-5-hops-per-redirect-chain/344664/)

## Questions

### How many redirects does Googlebot follow?

By default, Google's crawlers follow up to 10 redirect hops.

### What is a redirect chain?

A URL that reaches its final page through two or more redirects. The fix is to point the first URL straight at the final one.

## Related

- [Googlebot redirect checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/googlebot-redirect-checker/)
- [Redirect loop checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-loop-checker/)
- [Flatten redirect chains](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/flatten-redirect-chains/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/how-many-redirects-is-too-many/  
Data as of: 2026-11-07
