# Sitemap XSD validation

A strict XSD check fails some files Google reads fine. A 4-URL file with no errors still gets 4 notes from the validator: Tags out of the schema order (only a strict XSD validator minds); A URL shorter than the XSD minimum of 12 characters; A time without seconds (fine for Google; the XSD wants seconds); Google ignores \<priority\> and \<changefreq\>.

| Line | Search Console | What the validator says |
| --- | --- | --- |
| 4 | - | Tags out of the schema order (only a strict XSD validator minds): \<lastmod\> \<loc\> (the schema order is \<loc\> \<lastmod\>) |
| 5 | - | A URL shorter than the XSD minimum of 12 characters: http://a.co |
| 3 | - | A time without seconds (fine for Google; the XSD wants seconds): 2026-11-02T09:30+00:00 |
|  | - | Google ignores \<priority\> and \<changefreq\>: 2 \<priority\> and \<changefreq\> tags |

The schema puts \<loc\>, \<lastmod\>, \<changefreq\> and \<priority\> in that order, needs seconds in a time, and sets a 12-character minimum on \<loc\>. Google documents none of these as errors, so the validator reports them as notes, not errors.

```xml
<urlset xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd"
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
```

## Run the strict and Google checks together

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [sitemaps.org: sitemap.xsd and siteindex.xsd (updated March 26, 2008), read November 8, 2026](https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd)
- [sitemaps.org: Sitemaps XML format (protocol) (updated November 21, 2016), read November 8, 2026](https://www.sitemaps.org/protocol.html)
- [Google Search Central: Build and submit a sitemap (updated July 8, 2026), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

## Questions

### Do I need xsi:schemaLocation in my sitemap?

Only for validating against the schema with an XML tool; sitemaps.org shows the extra header for that purpose.

## Related

- [Validate a sitemap for Google](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/validate-sitemap-for-google/)
- [Sitemap lastmod format](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-lastmod-format/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-xsd-validation/  
Data as of: 2026-11-08
