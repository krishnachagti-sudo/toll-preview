# Incorrect sitemap index format: Nested sitemap indexes

An index may list only sitemap files. In the worked index of 3 entries the validator reports: https://www.example.com/sitemap\_index.xml lists itself; https://www.example.com/products/sitemap\_index.xml is itself a sitemap index, listed in https://www.example.com/sitemap\_index.xml.

```xml
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap><loc>https://www.example.com/sitemap_index.xml</loc></sitemap>
  <sitemap><loc>https://www.example.com/sitemap-posts.xml</loc></sitemap>
  <sitemap><loc>https://www.example.com/products/sitemap_index.xml</loc></sitemap>
</sitemapindex>
```

Fix: list the product sitemaps themselves in the main index, and delete the entry that points at the index itself. Several index files are fine as long as each is submitted on its own.

## Check your sitemap index

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap_index.xml&live=10)

- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)
- [sitemaps.org: Sitemaps XML format (protocol) (updated November 21, 2016), read November 8, 2026](https://www.sitemaps.org/protocol.html)
- [Google Search Central: Manage your sitemaps with a sitemap index file (updated December 10, 2025), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps)

## Questions

### How many sitemaps can an index list?

Up to 50,000, and the index must be no larger than 50MB uncompressed (sitemaps.org). You can submit up to 500 index files per site in Search Console (Google).

## Related

- [Sitemap index checker](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-index-checker/)
- [Sitemap size limits](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-size-limit/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/nested-sitemap-indexes/  
Data as of: 2026-11-08
