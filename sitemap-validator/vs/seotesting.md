# SEOTesting sitemap validator vs this validator

Both check the sitemap file and follow a sitemap index for free. SEOTesting's own page says it does not crawl the pages listed, so it does not report redirected, broken, non-canonical, blocked or noindex URLs; this validator does, for 10 URLs free and more per check.

## What SEOTesting XML Sitemap Validator says it does

- Validates a sitemap or sitemap index by its public URL, including the sitemaps an index references.
- Offers strict validation against the sitemaps.org specification and a non-strict mode that only reads the URLs.
- Its page says it does not crawl every page listed, so redirected, broken, non-canonical, blocked or non-indexable URLs are not reported.

Price: free tool; the SEOTesting app is $50 a month for one site (read on November 8, 2026).

## What this validator does

- Fetches the sitemap or index by address (gzip included), or checks pasted XML in the browser.
- The sitemaps.org schema, the 50,000 URL and 50MB limits, lastmod format and a labelled sanity check, host and folder scope, image and news tags.
- robots.txt against every listed URL and the sitemap itself.
- Each listed URL's status, redirect, noindex (meta tag and X-Robots-Tag) and canonical, 10 free on the page, up to 250 a run.
- Issues named as Search Console names them, with line numbers and a CSV; REST and MCP for scripts and agents.

Price: One sitemap with 10 URLs checked live is free on the page; beyond that $0.0005 a check (a file read or a URL requested), $0.0001 after 20,000 a month.

## Side by side

|  | SEOTesting XML Sitemap Validator | This validator |
| --- | --- | --- |
| Fetch by URL, sitemap index | Yes | Yes |
| Strict XSD mode | Yes (strict or non-strict) | Errors, warnings and strict-only notes in one report |
| robots.txt against listed URLs | Not listed on its page | Yes, every URL |
| Listed URLs' status, noindex, canonical | No (its page says so) | Yes, 10 free, up to 250 a run |
| API or MCP | Not listed on its page | REST and MCP |
| Price | free tool; the SEOTesting app is $50 a month for one site | One sitemap with 10 URLs checked live is free on the page; beyond that $0.0005 a check (a file read or a URL requested), $0.0001 after 20,000 a month. |

## When SEOTesting XML Sitemap Validator is the better choice

If you already use SEOTesting for Search Console reporting and only need to know the file parses, its free validator is right there, with a plain strict and non-strict switch.

## Try it on your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [SEOTesting XML Sitemap Validator (read November 8, 2026)](https://seotesting.com/free-seo-tools/xml-sitemap-validator/)
- [SEOTesting XML Sitemap Validator (read November 8, 2026)](https://seotesting.com/home/pricing/)

## Related

- [Sitemap validator](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/)
- [Search Console sitemap errors decoded](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/search-console-sitemap-errors/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/vs/seotesting/  
Data as of: 2026-11-08
