# Sitemap URLs blocked by robots.txt

One fetch of robots.txt tests every listed URL: with the rules below, 4 of 8 sample URLs are blocked for Googlebot. The validator lists each blocked URL with the rule that matched.

```text
User-agent: *
Disallow: /cart/
Disallow: /*?sessionid=
Allow: /cart/gift-cards$

User-agent: Googlebot-Image
Disallow: /

Sitemap: https://www.example.com/sitemap.xml
```

| URL | Googlebot | Rule that decides |
| --- | --- | --- |
| https://www.example.com/cart/ | Blocked | Disallow: /cart/ |
| https://www.example.com/cart/checkout | Blocked | Disallow: /cart/ |
| https://www.example.com/cart/gift-cards | Allowed | Allow: /cart/gift-cards$ |
| https://www.example.com/cart/gift-cards/terms | Blocked | Disallow: /cart/ |
| https://www.example.com/shoes/?sessionid=42 | Blocked | Disallow: /\*?sessionid= |
| https://www.example.com/shoes/?colour=red | Allowed | no rule matches |
| https://www.example.com/sitemap.xml | Allowed | no rule matches |
| https://www.example.com/robots.txt | Allowed | robots.txt is always allowed |

> Worked out by the validator's robots.txt reader. The Googlebot-Image group does not apply to Googlebot, so the \* group does.

## Test robots.txt against your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [RFC 9309: Robots Exclusion Protocol (2022-09), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9309)
- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)

## Questions

### Which rule wins when Allow and Disallow both match?

The most specific: the rule with the most characters. When an Allow and a Disallow are equally long, Allow wins (RFC 9309).

### What if robots.txt returns a 404 or a 500?

A 4xx means no rules, so everything may be crawled; a 5xx or no answer means crawlers must assume everything is disallowed (RFC 9309).

### Does a group for Googlebot-Image apply to Googlebot?

No. A crawler obeys the group that names its own token, and the \* group only when no group names it.

## Related

- [Sitemap could not be read](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-could-not-be-read/)
- [Remove blocked and noindex URLs](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/clean-sitemap-urls/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-blocked-by-robots-txt/  
Data as of: 2026-11-08
