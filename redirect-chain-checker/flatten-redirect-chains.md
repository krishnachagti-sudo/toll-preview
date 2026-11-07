# Flatten redirect chains

Each migration adds a layer: a URL from two moves ago can take 3 hops to reach its page. Flattening points every old URL straight at the final page, so each takes 1 hop; Google advises chains of ideally no more than 3.

## Before: two migrations stacked

| Old URL | Redirects | What the report says |
| --- | ---: | --- |
| http://example.com/2018/spring-launch | 3 | Plain-HTTP URL inside the chain; Chain (2 or more hops) |
| https://example.com/2018/spring-launch | 2 | Chain (2 or more hops) |
| https://example.com/blog/spring-launch | 1 | OK |

Flatten it: point http://example.com/2018/spring-launch straight at https://example.com/news/spring-launch with one 301, and do the same for the 2 URLs in between.

## After: one hop each

| Old URL | Redirects | What the report says |
| --- | ---: | --- |
| http://example.com/2018/spring-launch | 1 | OK |
| https://example.com/2018/spring-launch | 1 | OK |
| https://example.com/blog/spring-launch | 1 | OK |

## How to find them on your site

- Collect the old URLs of every past migration, not only the last one: old sitemaps, old redirect files, backlinks.
- Run them through the checker and sort the CSV by the redirects column.
- For each chain, change the first rule to point at the final URL. Include the http:// and www variants, which often add a hop of their own.
- Re-run and confirm every row has 1 redirect. [How many hops is too many](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/how-many-redirects-is-too-many/) explains the limits.

## Find your chains

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=http%3A%2F%2Fexample.com%2F2018%2Fspring-launch)

> Worked chains on example.com addresses, judged by the checker's own rules.

## Sources

- [Google Search Central: Site moves with URL changes (read November 8, 2026)](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)

## Questions

### How many redirects in a chain are OK?

Google: "Avoid chaining redirects." and, where you must, "keep the number of redirects in the chain low, ideally no more than 3 and fewer than 5."

### Do I delete the middle redirects?

No. Keep a redirect for every URL that ever existed, but point each one at the final page, not at the next URL in the old chain.

## Related

- [How many redirects is too many?](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/how-many-redirects-is-too-many/)
- [Site migration redirect checklist](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/site-migration-redirect-checklist/)
- [Redirect map template](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-map-template/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/flatten-redirect-chains/  
Data as of: 2026-11-08
