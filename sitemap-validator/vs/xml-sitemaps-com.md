# XML-Sitemaps.com vs this sitemap validator

XML-Sitemaps.com builds a sitemap by crawling your site (free to a 500-page limit) and checks a file's format; its validator also offers to ping Google, an endpoint Google deprecated in June 2023, saying pings would get a 404 error. This validator does not generate files; it checks the file and its URLs.

## What XML-Sitemaps.com says it does

- The validator checks whether a sitemap is formatted correctly and offers to ping Google with its location.
- The free online generator builds a sitemap by crawling the site, with a 500-page limit.
- Pro Sitemaps (cloud hosting with automatic updates) is advertised from $2.44 a month.

Price: free validator; free generator with a 500-page limit; Pro Sitemaps hosting from $2.44 a month (read on November 8, 2026).

## What this validator does

- Fetches the sitemap or index by address (gzip included), or checks pasted XML in the browser.
- The sitemaps.org schema, the 50,000 URL and 50MB limits, lastmod format and a labelled sanity check, host and folder scope, image and news tags.
- robots.txt against every listed URL and the sitemap itself.
- Each listed URL's status, redirect, noindex (meta tag and X-Robots-Tag) and canonical, 10 free on the page, up to 250 a run.
- Issues named as Search Console names them, with line numbers and a CSV; REST and MCP for scripts and agents.

Price: One sitemap with 10 URLs checked live is free on the page; beyond that $0.0005 a check (a file read or a URL requested), $0.0001 after 20,000 a month.

## Side by side

|  | XML-Sitemaps.com | This validator |
| --- | --- | --- |
| Generates a sitemap | Yes, free to a 500-page limit | No |
| Checks a sitemap's format | Yes | Yes, with line numbers |
| Checks the listed URLs | Not on the validator page | Status, noindex, canonical, robots.txt |
| Pings Google | Offered | No: Google retired the ping endpoint; submit in Search Console or robots.txt |
| Price | free validator; free generator with a 500-page limit; Pro Sitemaps hosting from $2.44 a month | One sitemap with 10 URLs checked live is free on the page; beyond that $0.0005 a check (a file read or a URL requested), $0.0001 after 20,000 a month. |

## When XML-Sitemaps.com is the better choice

If your site has no sitemap and your CMS does not make one, a generator is the right first step; XML-Sitemaps.com does that for small static sites. Then validate what it made.

## Try it on your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [XML-Sitemaps.com (read November 8, 2026)](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
- [XML-Sitemaps.com (read November 8, 2026)](https://www.xml-sitemaps.com/)
- [Google Search Central Blog: Sitemaps ping endpoint is going away (June 26, 2023), read November 8, 2026](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)

## Related

- [Sitemap validator](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/)
- [Search Console sitemap errors decoded](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/search-console-sitemap-errors/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/vs/xml-sitemaps-com/  
Data as of: 2026-11-08
