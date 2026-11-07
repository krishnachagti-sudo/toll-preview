# URL not allowed and path mismatch in a sitemap

Each URL must use the sitemap's protocol, host and port: a sitemap on https://www.example.com listing https://example.com/shoes/ is reported as "Path mismatch: Missing www / Includes www". Of the 9 pairs below, 2 are allowed. A URL outside the sitemap's own folder is a warning, since Google waives that rule for sitemaps submitted in Search Console.

| Sitemap | Listed URL | Result |
| --- | --- | --- |
| https://www.example.com/sitemap.xml | https://www.example.com/shoes/ | Allowed |
| https://www.example.com/sitemap.xml | https://example.com/shoes/ | Path mismatch: Missing www / Includes www (error) |
| https://example.com/sitemap.xml | https://www.example.com/shoes/ | Path mismatch: Missing www / Includes www (error) |
| https://www.example.com/sitemap.xml | http://www.example.com/shoes/ | URL not allowed (error) |
| https://www.example.com/sitemap.xml | https://shop.example.com/shoes/ | URL not allowed (error) |
| https://www.example.com/sitemap.xml | https://www.example.com:8443/shoes/ | URL not allowed (error) |
| https://www.example.com/blog/sitemap.xml | https://www.example.com/blog/post-1/ | Allowed |
| https://www.example.com/blog/sitemap.xml | https://www.example.com/shoes/ | URL not allowed (warning) |
| https://www.example.com/blog/sitemap.xml | https://www.example.com/ | URL not allowed (warning) |

> Each row is the validator's scope rule on the pair shown.

## Check the hosts in your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [sitemaps.org: Sitemaps XML format (protocol) (updated November 21, 2016), read November 8, 2026](https://www.sitemaps.org/protocol.html)
- [Google Search Central: Build and submit a sitemap (updated July 8, 2026), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)

## Questions

### Can a sitemap list URLs on another host?

Not by default. sitemaps.org requires the same protocol and host; you can prove you own the other host with a Sitemap: line in its robots.txt, and Google also allows it for sites verified in Search Console.

### Does the folder rule apply to Google?

Google says a sitemap affects only descendants of its folder unless you submit it in Search Console.

## Related

- [Sitemap index checker](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-index-checker/)
- [Validate a sitemap for Google](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/validate-sitemap-for-google/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-url-not-allowed/  
Data as of: 2026-11-08
