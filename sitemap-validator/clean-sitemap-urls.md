# Clean noindex, redirected and broken URLs out of a sitemap

List only URLs that answer 200, are indexable and are their own canonical. In the worked example, 9 URLs checked live gave 2 that did not answer 200, 2 noindex and 2 pointing to another canonical, and robots.txt blocked 1 more.

| What the URL does | Verdict | What to do |
| --- | --- | --- |
| Robots meta tag noindex | noindex | Says noindex (robots: noindex); Search Console reports this as "Submitted URL marked noindex". Remove it from the sitemap, or remove the noindex. |
| Robots meta tag none | noindex | Says noindex (robots: none); Search Console reports this as "Submitted URL marked noindex". Remove it from the sitemap, or remove the noindex. |
| Googlebot meta tag noindex | noindex | Says noindex (googlebot: noindex, nofollow); Search Console reports this as "Submitted URL marked noindex". Remove it from the sitemap, or remove the noindex. |
| X-Robots-Tag: noindex header | noindex | Says noindex (X-Robots-Tag: noindex); Search Console reports this as "Submitted URL marked noindex". Remove it from the sitemap, or remove the noindex. |
| X-Robots-Tag: googlebot: noindex | noindex | Says noindex (X-Robots-Tag: googlebot: noindex); Search Console reports this as "Submitted URL marked noindex". Remove it from the sitemap, or remove the noindex. |
| noindex on a PDF, by header | noindex; not an HTML page | Says noindex (X-Robots-Tag: noindex); Search Console reports this as "Submitted URL marked noindex". Remove it from the sitemap, or remove the noindex. Answers 200 with application/pdf; no robots meta tag or canonical link to read. |
| Canonical names another URL | canonical is another URL | Names https://www.example.com/shoes/ as its canonical. List the canonical URL instead. |
| Canonical in a Link header | canonical is another URL; not an HTML page | Names https://www.example.com/guide/ as its canonical. List the canonical URL instead. Answers 200 with application/pdf; no robots meta tag or canonical link to read. |
| Redirects (301) | redirects | Redirects (1 hop) to https://www.example.com/shoes/red/, which answers 200. List the final URL instead. |
| Not found (404) | 404 or 410 | Answers 404. Remove it from the sitemap, or restore the page. |
| Server error (500) | 5xx server error | Answers 500, a server error. |

> Each row is the validator's live-check judge on a made-up answer for one URL.

## Find the URLs to remove

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)
- [Google Search Central: Build and submit a sitemap (updated July 8, 2026), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Search Central: Robots meta tag, data-nosnippet and X-Robots-Tag (updated March 24, 2026), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [RFC 9309: Robots Exclusion Protocol (2022-09), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9309)

## Steps

1. **Check the listed URLs live.** Request each URL and read its status, redirects, robots meta tag, X-Robots-Tag header and canonical.
2. **Sort the problems.** Redirects: list the target. 404 and 410: drop or restore. noindex: drop, or remove the noindex. Canonical elsewhere: list the canonical. Blocked by robots.txt: drop, or change the rule.
3. **Fix at the source.** Change the CMS setting, plugin or generator that builds the sitemap, so the next build is clean too, rather than editing the file by hand.
4. **Validate and resubmit.** Run the check again, then resubmit in Search Console and compare the submitted and indexed counts over the following weeks. Google decides when it recrawls.

## Questions

### Why does Search Console say "Submitted URL marked noindex"?

The sitemap asks Google to index a URL whose page says noindex. Remove one of the two.

### Should redirected URLs be in a sitemap?

No. Google crawls URLs exactly as listed and says to replace redirect URLs with the URLs that should be crawled.

## Related

- [Submitted URL marked noindex](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/submitted-url-marked-noindex/)
- [Sitemap blocked by robots.txt](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-blocked-by-robots-txt/)
- [Redirect chain checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/clean-sitemap-urls/  
Data as of: 2026-11-08
