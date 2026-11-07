# Validate a sitemap for Google

Google needs a fetchable UTF-8 file within the limits, absolute canonical URLs and an accurate lastmod; it ignores priority and changefreq. On the worked example the validator gives this order of fixes: Fix the XML errors first (Search Console calls these Parsing error): escape & as &amp; inside \<loc\>, and close every tag; Write every lastmod as YYYY-MM-DD, or with a time and a time zone (2026-11-08T09:30:00+00:00); List only URLs on the sitemap's own protocol and host (with or without www, exactly as the sitemap is served).

## Validate your sitemap for Google

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

## What Google says

- All formats limit a single sitemap to 50MB (uncompressed) or 50,000 URLs (Google); 50,000 URLs and 52,428,800 bytes (sitemaps.org).
- The sitemap file must be UTF-8 encoded (Google; sitemaps.org).
- Use fully-qualified, absolute URLs; Google crawls URLs exactly as listed (Google).
- Google uses lastmod if it is consistently and verifiably accurate; it should reflect the last significant update (main content, structured data or links), not a copyright date (Google).
- Google ignores \<priority\> and \<changefreq\> (Google).
- Google's sitemaps ping endpoint was deprecated in June 2023; requests to it return 404. Submit through robots.txt or Search Console (Google).

- [Google Search Central: Build and submit a sitemap (updated July 8, 2026), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Search Central Blog: Sitemaps ping endpoint is going away (June 26, 2023), read November 8, 2026](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)
- [sitemaps.org: Sitemaps XML format (protocol) (updated November 21, 2016), read November 8, 2026](https://www.sitemaps.org/protocol.html)

## Steps

1. **Make it fetchable.** Status 200, XML (not an HTML page), not blocked by robots.txt or a firewall.
2. **Keep it within limits.** 50,000 URLs and 50MB uncompressed per file; an index for more.
3. **Use UTF-8 and escaped, absolute URLs.** Full https:// URLs on the sitemap's own host, with & written &amp;.
4. **List only canonical, indexable pages.** No redirects, 404s, noindex pages or URLs whose canonical is another page.
5. **Make lastmod true.** W3C Datetime, set to the last significant change. Skip priority and changefreq: Google ignores them.
6. **Submit it.** In Search Console's Sitemaps report or with a Sitemap: line in robots.txt. The old ping endpoint returns 404.

## Questions

### Does Google use priority and changefreq?

No: Google ignores \<priority\> and \<changefreq\> (Google).

### Can I still ping Google with my sitemap?

No. Google deprecated the sitemaps ping endpoint in June 2023; requests to it return 404. Submit through robots.txt or Search Console.

### Does the order of URLs matter?

No. Google says the order of URLs in a sitemap does not matter.

## Related

- [Strict XSD validation](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-xsd-validation/)
- [Search Console errors decoded](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/search-console-sitemap-errors/)
- [Do I need a sitemap?](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/do-i-need-a-sitemap/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/validate-sitemap-for-google/  
Data as of: 2026-11-08
