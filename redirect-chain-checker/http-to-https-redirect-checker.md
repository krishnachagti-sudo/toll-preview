# HTTP to HTTPS redirect checker

Every variant should reach the canonical URL in one permanent hop. In the worked example below, a site that sends http to https and then adds www takes 2 hops from http://example.com/, and one variant uses a 302; pointing each variant straight at https://www.example.com/ with a 301 cuts every one to a single hop.

## Check your four variants

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=http%3A%2F%2Fexample.com%2F%0Ahttp%3A%2F%2Fwww.example.com%2F%0Ahttps%3A%2F%2Fexample.com%2F%0Ahttps%3A%2F%2Fwww.example.com%2F)

## Before: two rules in a row

| Typed | Hops | Chain | Verdict |
| --- | ---: | --- | --- |
| http://example.com/ | 2 | 301 http://example.com/ \> 301 https://example.com/ \> 200 https://www.example.com/ | Chain (2 or more hops) |
| http://www.example.com/ | 1 | 302 http://www.example.com/ \> 200 https://www.example.com/ | Temporary redirect (302, 303, 307 or delayed refresh) |
| https://example.com/ | 1 | 301 https://example.com/ \> 200 https://www.example.com/ | OK |
| https://www.example.com/ | 0 | 200 https://www.example.com/ | OK |

## After: one hop each

| Typed | Hops | What the hop changes | Verdict |
| --- | ---: | --- | --- |
| http://example.com/ | 1 | http to https, adds www | OK |
| http://www.example.com/ | 1 | http to https | OK |
| https://example.com/ | 1 | adds www | OK |
| https://www.example.com/ | 0 | no redirect | OK |

> Worked example on example.com addresses, judged by the checker's own rules. With HSTS, a browser that has visited before skips the http hop itself, so a first visit can still show it; the checker always sends the http request.

- [Google Search Central: Redirects and Google Search (updated April 14, 2026, read November 7, 2026)](https://developers.google.com/search/docs/crawling-indexing/301-redirects)

## Related

- [Redirect chain contains HTTP](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-chain-contains-http/)
- [www redirect checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/www-redirect-checker/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/http-to-https-redirect-checker/  
Data as of: 2026-11-07
