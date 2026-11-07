# 301 redirect checker

Google treats 301 and 308 as permanent redirects and 302, 303 and 307 as temporary ones; an instant meta refresh counts as permanent and a delayed one as temporary. The checker labels every hop that way: in the recorded run of 7 URLs on November 7, 2026, 4 hops were 301s and 4 were 302s.

- Permanent: 301 and 308
- Temporary: 302, 303 and 307
- Meta refresh: instant: permanent; delayed: temporary
- Google hop limit: 10

## Check your redirects

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=http%3A%2F%2Fexample.com%2F)

## What each code means to Google

| Code | Name | Google treats it as | Request method on the next hop |
| --- | --- | --- | --- |
| 301 | Moved Permanently | permanent | may change POST to GET |
| 302 | Found | temporary | may change POST to GET |
| 303 | See Other | temporary | becomes GET |
| 307 | Temporary Redirect | temporary | kept |
| 308 | Permanent Redirect | permanent | kept |

The method column is from [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110#section-15.4): 307 and 308 keep the method (a POST stays a POST), 303 always becomes a GET, and clients may turn a POST into a GET on 301 and 302.

## The recorded run, hop by hop

Status code of each hop

| URL | Hops | Kinds | Verdict |
| --- | --- | --- | --- |
| http://github.com/about | 301 \> 200 | permanent | OK |
| http://bbc.co.uk/news | 301 \> 301 \> 200 | permanent, permanent | Chain (2 or more hops); Reaches the expected target through a chain |
| http://apple.com/ | 301 \> 200 | permanent | OK |
| https://example.com/ | 200 | no redirect | OK |
| https://httpbin.org/redirect/3 | 302 \> 302 \> 302 \> 200 | temporary, temporary, temporary | Temporary redirect (302, 303, 307 or delayed refresh); Chain (2 or more hops) |
| https://httpbin.org/redirect-to?url=http://example.com/&status\_code=302 | 302 \> 200 | temporary | Downgrades from https to http; Ends on plain http; Plain-HTTP URL inside the chain; Redirected to the homepage; Temporary redirect (302, 303, 307 or delayed refresh) |
| https://github.com/this-page-does-not-exist-endwise | 404 | no redirect | Ends on a 4xx or 5xx |

> The recorded run: a real run of this checker on 7 public URLs with its own user agent, recorded on November 7, 2026 during the build. Sites change; run the check to see them today.

## When a 302 is the right answer

A temporary redirect is right for a page that will come back: a sale page, a login bounce, a geo or language choice. For a move meant to last, such as a migration, use 301 or 308, so the new URL takes the old one's place in results.

- [Google Search Central: Redirects and Google Search (updated April 14, 2026, read November 7, 2026)](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google Search Central: HTTP status codes, network and DNS errors (updated February 4, 2026, read November 7, 2026)](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)
- [RFC 9110, HTTP Semantics, section 15.4: Redirection 3xx](https://www.rfc-editor.org/rfc/rfc9110#section-15.4)

## Questions

### Which redirects are permanent for Google?

Google treats 301 and 308 as permanent redirects and 302, 303 and 307 as temporary ones; an instant meta refresh counts as permanent and a delayed one as temporary.

### Does a 302 pass signals like a 301?

Not as strongly. Google uses a 301 as a strong signal and a 302 as a weak signal that the redirect target should be processed. Permanent redirects show the new target in search results; temporary redirects show the source page.

## Related

- [Redirect status codes: 301, 302, 303, 307, 308](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-status-codes/)
- [Redirect loop checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-loop-checker/)
- [How many redirects is too many?](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/how-many-redirects-is-too-many/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/301-redirect-checker/  
Data as of: 2026-11-07
