# www redirect checker

The checker names what every hop changes, so a www rule shows as "adds www" or "removes www"; in the worked examples, the site with two separate rules takes 2 hops where one would do.

## Check your www redirect

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=https%3A%2F%2Fexample.com%2F)

## What each hop changes

| Case | Chain | Changes per hop | Verdict |
| --- | --- | --- | --- |
| Adds www | 301 https://example.com/pricing \> 200 https://www.example.com/pricing | adds www | OK |
| Removes www and adds a slash | 301 https://www.example.com/pricing \> 200 https://example.com/pricing/ | removes www, adds a trailing slash | OK |
| Two rules: https, then remove www | 301 http://www.example.com/pricing \> 301 https://www.example.com/pricing \> 200 https://example.com/pricing | http to https \| removes www | Chain (2 or more hops) |

> Worked examples on example.com addresses, judged by the checker's own rules.

## Related

- [HTTP to HTTPS redirect checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/http-to-https-redirect-checker/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/www-redirect-checker/  
Data as of: 2026-11-07
