# Redirect loop checker

A redirect loop is a chain that comes back to a URL it already visited; the checker stops there, names the hop where the loop starts and the two rules that alternate. Of the 5 common patterns below, 4 loop within two URLs.

## Find your loop

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=https%3A%2F%2Fexample.com%2F)

## The usual loops and what the checker says

| Pattern | Hops | Loop starts at hop | What the report says |
| --- | --- | ---: | --- |
| http and https fight | 301 https://example.com/a \> 301 http://example.com/a | 1 | The loop alternates between http and https of the same URL: one rule sends visitors to https and another sends them back. Look for an https-to-http rule at the origin, a proxy or a CMS setting. |
| www and bare host fight | 301 https://example.com/ \> 301 https://www.example.com/ | 1 | The loop alternates between the www and bare host: two rules disagree on which one is canonical. |
| Trailing slash added and removed | 301 https://example.com/shop \> 301 https://example.com/shop/ | 1 | The loop adds and removes a trailing slash: two rules disagree on the slash. |
| Three-step cycle | 302 https://example.com/a \> 302 https://example.com/b \> 302 https://example.com/c | 1 | Redirect loop |
| Redirects to itself behind Cloudflare | 301 https://example.com/ | 1 | This URL redirects to itself behind Cloudflare: Cloudflare documents this loop when the origin redirects HTTP to HTTPS while the SSL/TLS encryption mode is Flexible. Its fix: remove the origin's HTTPS redirect or set the mode to Full or higher. |

The browser shows ERR\_TOO\_MANY\_REDIRECTS (Chrome) or "The page isn't redirecting properly" (Firefox) and gives up. It does not say which rule is wrong; the hop list does.

## Cloudflare's documented loops

- Flexible encryption mode, while the origin redirects all HTTP requests to HTTPS: Cloudflare reaches the origin over HTTP, the origin sends it to HTTPS, and the visitor sees the same URL again. Fix: remove the origin's HTTPS redirects or set the encryption mode to Full or higher.
- Always Use HTTPS on, while the origin redirects HTTPS to HTTP. Fix: remove the origin's HTTP redirect or turn the setting off.
- Redirect rules or Page Rules that conflict with each other.

- [Cloudflare: ERR\_TOO\_MANY\_REDIRECTS (updated September 1, 2026, read November 7, 2026)](https://developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/)
- [Google Search Central: HTTP status codes, network and DNS errors (updated February 4, 2026, read November 7, 2026)](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)

## Questions

### How do I fix ERR\_TOO\_MANY\_REDIRECTS on Cloudflare?

Cloudflare: with the Flexible encryption mode, redirect loops occur if the origin redirects all HTTP requests to HTTPS; the fix is to remove the origin's HTTPS redirects or set the SSL/TLS encryption mode to Full or higher.

## Related

- [HTTP to HTTPS redirect checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/http-to-https-redirect-checker/)
- [How many redirects is too many?](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/how-many-redirects-is-too-many/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-loop-checker/  
Data as of: 2026-11-07
