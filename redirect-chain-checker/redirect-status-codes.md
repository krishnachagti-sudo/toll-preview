# Redirect status codes: 301, 302, 303, 307, 308

Google treats 301 and 308 as permanent redirects and 302, 303 and 307 as temporary ones; an instant meta refresh counts as permanent and a delayed one as temporary. Google uses a 301 as a strong signal and a 302 as a weak signal that the redirect target should be processed.

| Code | Name | Google treats it as | Request method | Defined in |
| --- | --- | --- | --- | --- |
| 301 | Moved Permanently | permanent | may change POST to GET | RFC 9110 15.4.2 |
| 302 | Found | temporary | may change POST to GET | RFC 9110 15.4.3 |
| 303 | See Other | temporary | becomes GET | RFC 9110 15.4.4 |
| 307 | Temporary Redirect | temporary | kept | RFC 9110 15.4.8 |
| 308 | Permanent Redirect | permanent | kept | RFC 9110 15.4.9 |
| meta refresh 0 s | Instant meta refresh | permanent | GET | HTML |
| meta refresh \> 0 s | Delayed meta refresh | temporary | GET | HTML |

Permanent redirects show the new target in search results; temporary redirects show the source page.

Google advises JavaScript redirects only where server-side or meta refresh redirects are not possible, since it may never see one if rendering fails.

## See which codes your redirects send

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=http%3A%2F%2Fexample.com%2F)

- [Google Search Central: Redirects and Google Search (updated April 14, 2026, read November 7, 2026)](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google Search Central: HTTP status codes, network and DNS errors (updated February 4, 2026, read November 7, 2026)](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)
- [RFC 9110, HTTP Semantics, section 15.4: Redirection 3xx](https://www.rfc-editor.org/rfc/rfc9110#section-15.4)

## Questions

### Is a 308 permanent like a 301?

Yes. Google treats 301 and 308 as permanent; 308 also keeps the request method, so a POST stays a POST.

### Does Google see JavaScript redirects?

Google advises JavaScript redirects only where server-side or meta refresh redirects are not possible, since it may never see one if rendering fails.

## Related

- [301 redirect checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/301-redirect-checker/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-status-codes/  
Data as of: 2026-11-07  
CSV: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-status-codes.csv
