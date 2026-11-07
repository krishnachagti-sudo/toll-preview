# Image sitemap validator

Each image needs an \<image:image\> with an \<image:loc\>, at most 1,000 per \<url\>. In a 3-URL example with 4 images the validator reports: An \<image:image\> without \<image:loc\> (\<image:image\> on line 4); Image tags Google removed from its documentation (\<image:title\>, \<image:caption\>).

| Line | Search Console | What the validator says |
| --- | --- | --- |
| 4 | Missing XML tag | An \<image:image\> without \<image:loc\>: \<image:image\> on line 4 |
| 4 | - | Image tags Google removed from its documentation: \<image:title\> |

The namespace is `xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"`. Google removed image:caption, image:geo\_location, image:title and image:license from its documentation; they are flagged as notes.

## Check your image sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [Google Search Central: Image sitemaps (updated December 10, 2025), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)

## Questions

### Can image URLs be on another domain?

Yes, for example a CDN, as long as both domains are verified in Search Console (Google).

## Related

- [News sitemap validator](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/news-sitemap-validator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/image-sitemap-validator/  
Data as of: 2026-11-08
