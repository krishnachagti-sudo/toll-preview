# Sitemap invalid date

A date fails when it is not W3C Datetime or not a real date. In a 3-URL example the validator reports 2 of 3: line 4, \<lastmod\>2026/10/15\</lastmod\>: slashes; use hyphens: YYYY-MM-DD; line 5, \<lastmod\>2026-10-15T09:30:00\</lastmod\>: a time without a time zone (add Z or an offset such as +00:00).

| Written as | Why it fails | Write |
| --- | --- | --- |
| `2026/10/15` | slashes; use hyphens: YYYY-MM-DD | `2026-10-15` |
| `10/15/2026` | day and month first; the format is YYYY-MM-DD | `2026-10-15` |
| `15-10-2026` | day and month first; the format is YYYY-MM-DD | `2026-10-15` |
| `2026-10-15 09:30:00` | a space between date and time; use T, as in 2026-11-08T09:30:00+00:00 | `2026-10-15T09:30:00+00:00` |
| `2026-10-15T09:30:00` | a time without a time zone (add Z or an offset such as +00:00) | `2026-10-15T09:30:00+00:00` |
| `2026-10` | only a year or month; the sitemap schema needs a full date (YYYY-MM-DD) | `2026-10-01` |
| `2026-2-5` | month and day need two digits each (2026-01-05) | `2026-02-05` |
| `2026-02-30` | 2026-02-30 is not a real date (that month has 28 days) | `2026-02-28` |
| `Thu, 15 Oct 2026 09:30:00 GMT` | an email-style (RFC 822) date; use YYYY-MM-DD | `2026-10-15T09:30:00+00:00` |
| `1792143000` | a Unix timestamp; use YYYY-MM-DD | `2026-10-15T09:30:00+00:00` |
| `20261015` | no hyphens; write YYYY-MM-DD | `2026-10-15` |
| `2026-13-01` | month 13 does not exist | `2026-12-01` |

> Every reason is the validator's own message; every corrected value passes the same parser.

The same rule applies to `<news:publication_date>` in news sitemaps and to `<lastmod>` in a sitemap index.

## Find the bad dates in your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)
- [sitemaps.org: Sitemaps XML format (protocol) (updated November 21, 2016), read November 8, 2026](https://www.sitemaps.org/protocol.html)
- [sitemaps.org: sitemap.xsd and siteindex.xsd (updated March 26, 2008), read November 8, 2026](https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd)

## Questions

### Does a sitemap date need a time?

No. YYYY-MM-DD is enough; if you give a time, add a time zone (Search Console).

### Is 2026-10-15T09:30:00 valid?

No: a time without a time zone (add Z or an offset such as +00:00).

## Related

- [Sitemap lastmod format](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-lastmod-format/)
- [News sitemap validator](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/news-sitemap-validator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-invalid-date/  
Data as of: 2026-11-08
