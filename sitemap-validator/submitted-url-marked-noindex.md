# Submitted URL marked noindex

Request each listed URL and read its robots meta tags and X-Robots-Tag header: in the worked example, 2 of 9 URLs checked live say noindex, one by meta tag and one by header. The table shows how each form is read.

| What the page sends | Verdict | Read as |
| --- | --- | --- |
| Robots meta tag noindex | noindex | robots: noindex |
| Robots meta tag none | noindex | robots: none |
| Googlebot meta tag noindex | noindex | googlebot: noindex, nofollow |
| X-Robots-Tag: noindex header | noindex | X-Robots-Tag: noindex |
| X-Robots-Tag: googlebot: noindex | noindex | X-Robots-Tag: googlebot: noindex |
| X-Robots-Tag: bingbot: noindex (another crawler) | 200, indexable, canonical | - |
| noindex on a PDF, by header | noindex; not an HTML page | X-Robots-Tag: noindex |
| noindex inside an HTML comment | 200, indexable, canonical | - |
| nofollow only | 200, indexable, canonical | - |

> Worked out by the validator's own reader on made-up answers for one URL.

## Fix it at the source

- If the page should be found in search: remove the noindex (the meta tag, or the header set by the server, CDN or plugin).
- If it should not: exclude it from the sitemap in your CMS or generator, not by editing the file by hand.
- Validate again, then resubmit the sitemap in Search Console.

## Find the noindex URLs in your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [Google Search Central: Robots meta tag, data-nosnippet and X-Robots-Tag (updated March 24, 2026), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Google Search Central: Build and submit a sitemap (updated July 8, 2026), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

## Questions

### Where can noindex be set?

In a robots meta tag in the page's HTML, or in an X-Robots-Tag HTTP header, which also works for non-HTML files such as PDFs (Google).

### Does "X-Robots-Tag: bingbot: noindex" stop Google?

No. A rule that names another crawler applies to that crawler only.

### Should noindex pages be in my sitemap?

No. A sitemap lists the URLs you want in search results; a noindex page says the opposite, so remove it from the sitemap or remove the noindex.

## Related

- [Remove noindex, redirected and 404 URLs from a sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/clean-sitemap-urls/)
- [Sitemap blocked by robots.txt](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-blocked-by-robots-txt/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/submitted-url-marked-noindex/  
Data as of: 2026-11-08
