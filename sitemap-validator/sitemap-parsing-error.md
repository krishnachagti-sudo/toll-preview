# Sitemap parsing error

Search Console says it often comes from an unescaped character in a URL. The validator gives the line: for a bare & it reports "line 3: https://www.example.com/search?q=tea&page=2". Each mistake below was run through it.

| Mistake | The validator says | Search Console |
| --- | --- | --- |
| A bare & in a URL | line 3: https://www.example.com/search?q=tea&page=2 | Parsing error |
| An HTML entity such as &nbsp; | line 4: &eacute; | Parsing error |
| A tag that never closes | line 5: \</urlset\> where \</url\> (opened on line 4) should close first | Parsing error |
| A bare \< in text | line 3: a bare \< in text near "\< 2026-11-02\</lastmod\>\</url\>" (write &lt;) | Parsing error |
| Curly quotes around the namespace | line 2: xmlns=“http://www.sitemaps.org/schemas/sitemap/0.9” | Unsupported format |
| Text before the first tag | not reported | Parsing error |
| Whitespace before \<?xml | line 1: 2 whitespace characters before \<?xml | Leading whitespace |

Escape the five characters (& becomes `&amp;`) and percent-encode spaces and non-ASCII characters. The table is on [sitemap escaping and encoding](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-escaping-encoding/).

## Find the broken line in your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)
- [sitemaps.org: Sitemaps XML format (protocol) (updated November 21, 2016), read November 8, 2026](https://www.sitemaps.org/protocol.html)

## Questions

### What causes a sitemap parsing error most often?

An unescaped character in a URL: Search Console names & ' " \< \> and asks for entity escaping, such as &amp; for &.

## Related

- [Sitemap escaping and encoding](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-escaping-encoding/)
- [Sitemap could not be read](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-could-not-be-read/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-parsing-error/  
Data as of: 2026-11-08
