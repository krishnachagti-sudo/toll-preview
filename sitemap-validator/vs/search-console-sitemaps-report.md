# Search Console's Sitemaps report vs a pre-submit check

Use both: Search Console is the record of what Google fetched and parsed, after you submit and on Google's schedule; a validator tests the file (and 10 of its URLs free) now and names the cause. Search Console can see manual actions and crawl demand; a validator cannot.

## What Google Search Console Sitemaps report says it does

- Shows the status of Google's last request for each submitted sitemap: Success, Has errors or Couldn't fetch.
- Shows only sitemaps submitted through the report or the API, not ones found through robots.txt.
- If a fetch fails, Google keeps trying for a few days, then stops; fix the problem and resubmit.
- Lists low crawl demand among the reasons for Couldn't fetch.

Price: free (read on November 8, 2026).

## What this validator does

- Fetches the sitemap or index by address (gzip included), or checks pasted XML in the browser.
- The sitemaps.org schema, the 50,000 URL and 50MB limits, lastmod format and a labelled sanity check, host and folder scope, image and news tags.
- robots.txt against every listed URL and the sitemap itself.
- Each listed URL's status, redirect, noindex (meta tag and X-Robots-Tag) and canonical, 10 free on the page, up to 250 a run.
- Issues named as Search Console names them, with line numbers and a CSV; REST and MCP for scripts and agents.

Price: One sitemap with 10 URLs checked live is free on the page; beyond that $0.0005 a check (a file read or a URL requested), $0.0001 after 20,000 a month.

## Side by side

|  | Google Search Console Sitemaps report | This validator |
| --- | --- | --- |
| When it runs | After submission, when Google fetches | Whenever you run it, before or after submitting |
| Couldn't fetch | Reports it; the details page may not say why | Tests the status, content, robots.txt and XML and names the cause |
| Errors in the file | Lists them by Search Console name | Same names, with line numbers and a CSV |
| Listed URLs | Page indexing report, filtered by sitemap | Live status, redirect, noindex and canonical for a sample |
| Manual actions, crawl demand | Yes | No |
| Price | Free | One sitemap with 10 URLs checked live is free on the page; beyond that $0.0005 a check (a file read or a URL requested), $0.0001 after 20,000 a month. |

## When Google Search Console Sitemaps report is the better choice

Search Console is the ground truth for Google: only it shows when Google last read the sitemap, how many pages it discovered and which are indexed, and whether a manual action stops it reading. Check there after submitting.

## Try it on your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [Google Search Console Sitemaps report (read November 8, 2026)](https://support.google.com/webmasters/answer/7451001?hl=en)
- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)

## Related

- [Sitemap validator](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/)
- [Search Console sitemap errors decoded](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/search-console-sitemap-errors/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/vs/search-console-sitemaps-report/  
Data as of: 2026-11-08
