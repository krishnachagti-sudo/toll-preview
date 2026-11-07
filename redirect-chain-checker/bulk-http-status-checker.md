# Bulk HTTP status checker

Each URL is followed to the end and reported with its first status, its final URL and final status: in the recorded run of 7 URLs on November 7, 2026, 6 ended on a 2xx, 1 on a 4xx and 0 on a 5xx.

## Check a list

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=https%3A%2F%2Fexample.com%2F)

## The recorded run

First and final status

| URL | First status | Final status | Final URL |
| --- | --- | --- | --- |
| http://github.com/about | 301 | 200 | https://github.com/about |
| http://bbc.co.uk/news | 301 | 200 | https://www.bbc.co.uk/news |
| http://apple.com/ | 301 | 200 | https://www.apple.com/ |
| https://example.com/ | 200 | 200 | https://example.com/ |
| https://httpbin.org/redirect/3 | 302 | 200 | https://httpbin.org/get |
| https://httpbin.org/redirect-to?url=http://example.com/&status\_code=302 | 302 | 200 | http://example.com/ |
| https://github.com/this-page-does-not-exist-endwise | 404 | 404 | https://github.com/this-page-does-not-exist-endwise |

> The recorded run: a real run of this checker on 7 public URLs with its own user agent, recorded on November 7, 2026 during the build. Sites change; run the check to see them today.

Each run returns a CSV with these columns for every URL, plus the full chain and the verdicts. A URL listed twice is fetched once. Each host gets at most two requests at a time, and a run stops starting new requests after 40 seconds; anything not reached is listed and not charged.

- [Google Search Central: HTTP status codes, network and DNS errors (updated February 4, 2026, read November 7, 2026)](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)

## Related

- [Redirect status codes](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-status-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/bulk-http-status-checker/  
Data as of: 2026-11-07
