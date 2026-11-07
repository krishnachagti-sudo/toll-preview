# News sitemap validator

At most 1,000 \<news:news\> tags, each with publication name and language, publication\_date and title; articles older than two days should lose their news tags. Checked on November 8, 2026, a 6-article example gives: a date that is not W3C Datetime, or not a real date (1); a news entry without a required tag (1); a news language that is not an ISO 639 code (1); news articles older than two days (1).

| Line | Search Console | What the validator says |
| --- | --- | --- |
| 8 | Invalid date | A date that is not W3C Datetime, or not a real date: \<news:publication\_date\>2026-11-08T07:00:00: a time without a time zone (add Z or an offset such as +00:00) |
| 6 | Missing \<publication\> tag / Missing XML tag | A news entry without a required tag: \<news:title\> |
| 7 | - | A news language that is not an ISO 639 code: English |
| 5 | - | News articles older than two days: 2026-11-01 (checked 2026-11-08) |

Language is an ISO 639 code of two or three letters (zh-cn and zh-tw for Chinese); dates use W3C Datetime and give the original publication time.

## Check your news sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [Google Search Central: News sitemaps (updated December 10, 2025), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)
- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)

## Questions

### How many URLs can a news sitemap have?

Up to 1,000 news:news tags per sitemap; split it if there are more (Google).

### How long do articles stay in a news sitemap?

Only articles created in the last two days; then remove the URL or its news:news tag (Google). An empty news sitemap is fine.

## Related

- [Image sitemap validator](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/image-sitemap-validator/)
- [Sitemap invalid date](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-invalid-date/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/news-sitemap-validator/  
Data as of: 2026-11-08
