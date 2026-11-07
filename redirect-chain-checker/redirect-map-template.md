# Redirect map template

A redirect map is one line per old URL with the page it should land on, such as "/about-us,/about". Checked after launch, 6 of these 12 rows land on target and 6 need a look.

## The map as you paste it

```csv
old,new
https://example.com/about-us,/about
https://example.com/products/blue-widget,/shop/blue-widget
https://example.com/blog/2019/launch,/news/launch
https://example.com/contact.html,/contact
https://example.com/old-category,/shop/garden
https://example.com/team,/about/team
https://example.com/pricing,/plans
http://example.com/faq,/help
https://example.com/careers,https://jobs.example.com/
https://example.com/press,/news
https://example.com/docs/v1/start,/docs/start
https://example.com/summer-sale,/sale
```

One line per old URL: the old address, a comma (or a tab, semicolon or space) and the target, as a full URL or a path. A header line is skipped. Lines starting with # are ignored.

## The same map, checked after launch

Each row judged by the checker. Hops are shown as status and path.

| Old URL | Target | Hops | Result | What the report says |
| --- | --- | --- | --- | --- |
| /about-us | /about | 301 /about-us \> 200 /about | Lands on the target | OK |
| /products/blue-widget | /shop/blue-widget | 301 /products/blue-widget \> 200 /shop/blue-widget/ | Off by a trailing slash | Matches the expected target except for a trailing slash |
| /blog/2019/launch | /news/launch | 301 /blog/2019/launch \> 301 /blog/launch \> 200 /news/launch | Lands on the target through a chain | Chain (2 or more hops); Reaches the expected target through a chain |
| /contact.html | /contact | 302 /contact.html \> 200 /contact | Lands on the target | Temporary redirect (302, 303, 307 or delayed refresh) |
| /old-category | /shop/garden | 301 /old-category \> 200 / | Lands on the wrong page | Lands somewhere other than the expected target; Redirected to the homepage |
| /team | /about/team | 301 /team \> 404 /about/team | Never reaches a page | Ends on a 4xx or 5xx |
| /pricing | /plans | 301 /pricing \> 301 /plans | Never reaches a page | Redirect loop; Chain (2 or more hops) |
| http://example.com/faq | /help | 301 http://example.com/faq \> 301 /faq \> 200 /help | Lands on the target through a chain | Chain (2 or more hops); Reaches the expected target through a chain |
| /careers | https://jobs.example.com/ | 301 /careers \> 200 https://jobs.example.com/ | Lands on the target | OK |
| /press | /news | 301 /press \> 200 /news | Lands on the target | OK |
| /docs/v1/start | /docs/start | 308 /docs/v1/start \> 200 /docs/start | Lands on the target | OK |
| /summer-sale | /sale | 307 /summer-sale \> 200 /sale | Lands on the target | Temporary redirect (302, 303, 307 or delayed refresh) |

## Rules for writing the map

- One to one wherever an equivalent page exists.
- The nearest parent (a category, a section) where it does not.
- Never a blanket redirect of everything to the homepage ([why](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-to-homepage/)).
- Targets are final URLs: the exact scheme, host and trailing slash the new site serves, so each row is one hop.
- Temporary codes (302, 307) only for rows that will change back, such as a seasonal sale page.

## Check your map

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=https%3A%2F%2Fexample.com%2Fabout-us)

> Made-up rows on example.com addresses, judged by the checker's own rules.

## Sources

- [Google Search Central: Site moves with URL changes (read November 8, 2026)](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)

## Questions

### What columns does a redirect map need?

Two are enough to check it: the old URL and where it should land. Add the redirect type, an owner and notes for your own tracking; the checker reads the first two columns of each line.

### Can the new URL be a path?

Yes. A target such as /about is read on the site the old URL ends on, so a map written in paths works after a domain move.

### What if the target is right except for the slash?

The row is marked "Matches the expected target except for a trailing slash". Decide which form is canonical and redirect to it directly.

## Related

- [Site migration redirect checklist](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/site-migration-redirect-checklist/)
- [Flatten redirect chains](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/flatten-redirect-chains/)
- [Redirects to the homepage](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-to-homepage/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-map-template/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-map-template.csv
