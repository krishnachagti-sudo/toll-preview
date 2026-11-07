# Sitemap lastmod format

Write YYYY-MM-DD, or YYYY-MM-DDThh:mm:ss with a time zone. Of the 14 values below, the validator accepts 5; a time without a zone, slashes, a month alone and impossible dates fail.

| Value | Valid | Read as, or why not |
| --- | --- | --- |
| `2026-11-08` | Yes | a date (midnight UTC) |
| `2026-11-08T09:30:00+00:00` | Yes | 2026-11-08T09:30:00.000Z |
| `2026-11-08T09:30:00Z` | Yes | 2026-11-08T09:30:00.000Z |
| `2026-11-08T09:30:00.45-05:00` | Yes | 2026-11-08T14:30:00.450Z |
| `2026-11-08T09:30+01:00` | Yes | 2026-11-08T08:30:00.000Z (no seconds: fine for Google; the strict XSD wants seconds) |
| `2026-11-08T09:30:00` | No | a time without a time zone (add Z or an offset such as +00:00) |
| `2026-11-08 09:30:00` | No | a space between date and time; use T, as in 2026-11-08T09:30:00+00:00 |
| `2026/11/08` | No | slashes; use hyphens: YYYY-MM-DD |
| `11/08/2026` | No | day and month first; the format is YYYY-MM-DD |
| `2026-11` | No | only a year or month; the sitemap schema needs a full date (YYYY-MM-DD) |
| `2026-02-30` | No | 2026-02-30 is not a real date (that month has 28 days) |
| `Sun, 08 Nov 2026 09:30:00 GMT` | No | an email-style (RFC 822) date; use YYYY-MM-DD |
| `1762594200` | No | a Unix timestamp; use YYYY-MM-DD |
| `2026-11-8` | No | month and day need two digits each (2026-01-05) |

## Will Google trust it?

Google uses lastmod if it is consistently and verifiably accurate; it should reflect the last significant update (main content, structured data or links), not a copyright date (Google).

The validator flags patterns that look generated rather than true (our heuristic, labelled as such): dates in the future, nearly every URL on one date, nearly every URL dated the day of the check, and dates later than the sitemap file itself.

## Check every lastmod in your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [sitemaps.org: Sitemaps XML format (protocol) (updated November 21, 2016), read November 8, 2026](https://www.sitemaps.org/protocol.html)
- [sitemaps.org: sitemap.xsd and siteindex.xsd (updated March 26, 2008), read November 8, 2026](https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd)
- [Google Search Central: Build and submit a sitemap (updated July 8, 2026), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)

## Questions

### What format does sitemap lastmod use?

W3C Datetime. YYYY-MM-DD is enough; a time needs a time zone, such as 2026-11-08T09:30:00+00:00 (sitemaps.org; Search Console).

### Does Google use lastmod?

Only if it is consistently and verifiably accurate, and it should reflect a significant change (main content, structured data or links), not a copyright date (Google).

### Is lastmod required?

No. It is optional in the sitemaps.org protocol.

## Related

- [Sitemap invalid date](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-invalid-date/)
- [Validate a sitemap for Google](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/validate-sitemap-for-google/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-lastmod-format/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-lastmod-format.csv
