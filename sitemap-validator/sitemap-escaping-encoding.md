# Sitemap escaping and encoding

Escape & ' " \> \< as &amp; &apos; &quot; &gt; &lt; and percent-encode spaces and non-ASCII characters: https://www.example.com/ümlat.php&q=name goes in as https://www.example.com/%C3%BCmlat.php&amp;q=name, the protocol's own example.

| Character | Name | Write |
| --- | --- | --- |
| `&` | Ampersand | `&amp;` |
| `'` | Single quote | `&apos;` |
| `"` | Double quote | `&quot;` |
| `>` | Greater than | `&gt;` |
| `<` | Less than | `&lt;` |

URLs as typed, and as they belong inside \<loc\>

| As typed | Inside \<loc\> |
| --- | --- |
| `https://www.example.com/products?item=12&desc=vacation` | `https://www.example.com/products?item=12&amp;desc=vacation` |
| `https://www.example.com/ümlat.php&q=name` | `https://www.example.com/%C3%BCmlat.php&amp;q=name` |
| `https://www.example.com/red shoes/` | `https://www.example.com/red%20shoes/` |
| `https://www.example.com/café/menu` | `https://www.example.com/caf%C3%A9/menu` |
| `https://www.example.com/search?q="tea"` | `https://www.example.com/search?q=%22tea%22` |
| `https://www.example.com/a?b=1&c=2&d=3` | `https://www.example.com/a?b=1&amp;c=2&amp;d=3` |
| `https://www.example.com/日本/` | `https://www.example.com/%E6%97%A5%E6%9C%AC/` |

> Worked out by the validator: percent-encoding as a browser does it, then the five entities.

## Check the escaping in your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [sitemaps.org: Sitemaps XML format (protocol) (updated November 21, 2016), read November 8, 2026](https://www.sitemaps.org/protocol.html)
- [Google Search Central: Build and submit a sitemap (updated July 8, 2026), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)

## Questions

### Should & in a sitemap URL be &amp;?

Yes. Inside the XML, & is written &amp;. The URL itself is unchanged: a crawler reads &amp; back as &.

### What encoding must a sitemap use?

UTF-8 (sitemaps.org; Google).

## Related

- [Sitemap parsing error](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-parsing-error/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-escaping-encoding/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-escaping-encoding.csv
