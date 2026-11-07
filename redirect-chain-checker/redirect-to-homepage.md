# Redirects to the homepage

Google advises against sending many old URLs to one irrelevant page such as the homepage. The checker flags a redirect from a URL with a path to the root of a site: 2 of the 4 patterns below are flagged.

## Four patterns, judged

| Pattern | Hops | What the report says |
| --- | --- | --- |
| A retired category sent to the homepage | 301 /old-category \> 200 / | Redirected to the homepage |
| A discontinued product sent to the homepage | 301 /products/red-kettle \> 200 / | Redirected to the homepage |
| A discontinued product sent to its category | 301 /products/red-kettle \> 200 /shop/kettles | OK |
| An old home page path, homepage expected | 301 /index.html \> 200 / | OK |

## What to redirect to instead

- The page that replaces it: same product, same article, same topic.
- The nearest parent: the category or section the page lived in.
- Nothing: if no page serves the same need, let the old URL return 404 or 410.

Write the target into your [redirect map](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-map-template/) so the check can tell an intended homepage redirect from a lazy one.

## Find homepage redirects

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=https%3A%2F%2Fexample.com%2Fold-category)

> Worked patterns on example.com addresses, judged by the checker's own rules.

## Sources

- [Google Search Central: Site moves with URL changes (read November 8, 2026)](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)

## Questions

### Is it bad to redirect all old URLs to the homepage?

Google: "Don't redirect many old URLs to one irrelevant single URL destination, such as the home page of the new site."

### What should a removed product redirect to?

Its replacement if there is one, else its category. If nothing on the new site serves the same need, a 404 or 410 is the honest answer.

### Does the checker flag every redirect to /?

Only from an old URL with a path. A row whose expected target is the homepage, such as /index.html to /, is not flagged.

## Related

- [Redirect map template](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-map-template/)
- [Site migration redirect checklist](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/site-migration-redirect-checklist/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-to-homepage/  
Data as of: 2026-11-08
