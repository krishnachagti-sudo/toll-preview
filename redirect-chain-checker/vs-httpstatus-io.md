# Endwise vs httpstatus.io

httpstatus.io checks up to 100 URLs at once and shows up to 10 redirects each. The Endwise checker takes up to 1,000 URLs a call, follows up to 20 hops and gives each URL a verdict: 10 URLs free on the page, then $0.0003 a URL.

## Side by side

httpstatus.io facts from its home page, read November 8, 2026. Prices for it are not shown there.

|  | httpstatus.io | Endwise redirect checker |
| --- | --- | --- |
| URLs at once | Up to 100 | Up to 1,000 a call |
| Redirects followed | Up to 10 | Up to 20 |
| User agents | Browsers, search, social and AI crawlers, mobile | Its own, Googlebot smartphone, desktop Chrome |
| Export | Google Sheets, CSV, XLS | CSV |
| API | Yes | Yes, plus MCP |
| Verdict per URL | Not described on its home page | Loops, chains, temporary codes, plain-http hops, homepage, expected target |

## When httpstatus.io is the better choice

- You want to look at headers, response bodies and round-trip times, which its page lists.
- You need a user agent the Endwise checker does not offer, such as Bingbot or a social crawler.
- You export straight to Google Sheets.

## When Endwise is the better choice

- More than 100 URLs in one go, such as a migration map.
- Checking each old URL against where it should land: see the [redirect map template](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-map-template/).
- A plain verdict per row that says what to fix, and the same answer from the API and MCP.

## Try a check

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=https%3A%2F%2Fexample.com%2Fold-page)

## Sources

- [httpstatus.io home page (read November 8, 2026)](https://httpstatus.io/)

## Questions

### How many URLs can httpstatus.io check?

Its home page says "Analyse up to 100 URLs simultaneously" (read November 8, 2026).

### How many hops does each tool follow?

httpstatus.io's page offers insights into "up to ten redirects". The Endwise checker follows up to 20 and flags chains past Google's limit of 10.

## Related

- [Endwise vs Screaming Frog for redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/vs-screaming-frog/)
- [curl -sIL or a bulk checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/vs-curl/)
- [Googlebot redirect checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/googlebot-redirect-checker/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/vs-httpstatus-io/  
Data as of: 2026-11-08
