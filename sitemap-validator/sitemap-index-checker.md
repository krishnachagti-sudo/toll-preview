# Sitemap index checker

The validator reads the index, then each sitemap it lists, and judges every file. On the worked example: https://www.example.com/sitemap\_index.xml is not valid: an index of 2 sitemaps; 2 child files read hold 11 URLs, the largest 707 bytes uncompressed, 4 errors and 1 warning, 1 future lastmod date, 1 URL blocked by robots.txt; of 9 URLs checked live, 2 did not answer 200, 2 are noindex and 2 name another canonical.

| File | Kind | Entries | Errors | Warnings |
| --- | --- | ---: | ---: | ---: |
| https://www.example.com/sitemap\_index.xml | Sitemap index | 2 | 0 | 0 |
| https://www.example.com/sitemap-pages.xml | XML sitemap | 6 | 1 | 0 |
| https://www.example.com/sitemap-products.xml | XML sitemap | 5 | 3 | 1 |

> The worked example is a made-up store on example.com, its answers replayed through the same check.

- At most 50,000 sitemaps and 50MB uncompressed per index (sitemaps.org).
- Only sitemaps, not other indexes (Search Console: Nested sitemap indexes).
- Full URLs: a relative entry is "Invalid URL in sitemap index file: incomplete URL".
- Up to 500 index files per site in Search Console (Google).

## Check your sitemap index

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap_index.xml&live=10)

- [Google Search Central: Manage your sitemaps with a sitemap index file (updated December 10, 2025), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps)
- [sitemaps.org: Sitemaps XML format (protocol) (updated November 21, 2016), read November 8, 2026](https://www.sitemaps.org/protocol.html)
- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)

## Questions

### Where must the sitemaps in an index live?

On the same site, in the index's folder or lower (Google), unless cross-site submission is set up.

### Does the validator read every child?

Up to 50 children a call (10 free on the page); start a later call at the next child for larger indexes.

## Related

- [Nested sitemap indexes](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/nested-sitemap-indexes/)
- [Sitemap size limit](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-size-limit/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-index-checker/  
Data as of: 2026-11-08
