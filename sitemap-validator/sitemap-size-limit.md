# Sitemap size limit

At most 50,000 URLs and 50MB (52,428,800 bytes) uncompressed per sitemap, whichever comes first. With short URLs the 50,000 count binds; at 1,000-character URLs with a lastmod the 50MB limit binds first, at 49,044 entries.

- URLs per sitemap: 50,000
- Size, uncompressed: 52,428,800 bytes
- Sitemaps per index: 50,000
- Index files per site: 500

## Which limit binds first

One \<url\> entry with a URL of each length, as the validator measures it

| URL length | lastmod | Bytes per entry | Entries in 50MB | Limit reached first |
| ---: | --- | ---: | ---: | --- |
| 40 | no | 65 | 806,595 | the 50,000 URL limit |
| 40 | yes | 109 | 480,997 | the 50,000 URL limit |
| 100 | no | 125 | 419,429 | the 50,000 URL limit |
| 100 | yes | 169 | 310,228 | the 50,000 URL limit |
| 250 | no | 275 | 190,649 | the 50,000 URL limit |
| 250 | yes | 319 | 164,353 | the 50,000 URL limit |
| 500 | no | 525 | 99,864 | the 50,000 URL limit |
| 500 | yes | 569 | 92,141 | the 50,000 URL limit |
| 1000 | no | 1025 | 51,149 | the 50,000 URL limit |
| 1000 | yes | 1069 | 49,044 | the 50MB limit |
| 1500 | no | 1525 | 34,379 | the 50MB limit |
| 1500 | yes | 1569 | 33,415 | the 50MB limit |
| 2000 | no | 2025 | 25,890 | the 50MB limit |
| 2000 | yes | 2069 | 25,340 | the 50MB limit |

## How many files you need

| URLs | Sitemaps (50,000 each) | Index files |
| ---: | ---: | ---: |
| 12,000 | 1 | 1 |
| 50,000 | 1 | 1 |
| 50,001 | 2 | 1 |
| 120,000 | 3 | 1 |
| 480,000 | 10 | 1 |
| 1,000,000 | 20 | 1 |
| 2,500,000 | 50 | 1 |

Over the limit? Split by type or date (products, posts, one file per year) and list the files in a sitemap index. Then submit the index.

## Measure your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [sitemaps.org: Sitemaps XML format (protocol) (updated November 21, 2016), read November 8, 2026](https://www.sitemaps.org/protocol.html)
- [Google Search Central: Build and submit a sitemap (updated July 8, 2026), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Search Central: Manage your sitemaps with a sitemap index file (updated December 10, 2025), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps)

## Questions

### How many URLs can a sitemap have?

50,000, and the file must be no larger than 50MB (52,428,800 bytes) uncompressed (sitemaps.org; Google).

### Does gzip let a sitemap go over 50MB?

No. You may gzip it, but once uncompressed it must be no larger than 50MB (sitemaps.org).

### How many sitemaps can an index list?

Up to 50,000, under the same 50MB limit (sitemaps.org).

## Related

- [Sitemap index checker](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-index-checker/)
- [Do I need a sitemap?](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/do-i-need-a-sitemap/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-size-limit/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-size-limit.csv
