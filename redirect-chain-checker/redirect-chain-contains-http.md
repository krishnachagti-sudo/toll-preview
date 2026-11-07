# Redirect chain contains HTTP

The checker flags a chain when an http:// URL appears after the first hop, when an https URL redirects to http, or when the chain ends on http; 3 of the 4 worked chains below are flagged, and the one that only starts on http (as a typed address does) is not.

## Check your chains

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=https%3A%2F%2Fexample.com%2F)

## How each chain is judged

| Chain | Hops | Verdict |
| --- | --- | --- |
| Typed http, one hop to https | 301 http://example.com/login \> 200 https://example.com/login | OK |
| https, then through http on another host | 302 https://example.com/go \> 301 http://www.example.com/go \> 200 https://www.example.com/go | Downgrades from https to http; Plain-HTTP URL inside the chain; Temporary redirect (302, 303, 307 or delayed refresh); Chain (2 or more hops) |
| Typed http, then a second http hop | 301 http://example.com/ \> 301 http://www.example.com/ \> 200 https://www.example.com/ | Plain-HTTP URL inside the chain; Chain (2 or more hops) |
| Ends on http | 301 https://example.com/old \> 200 http://example.net/new | Downgrades from https to http; Ends on plain http; Plain-HTTP URL inside the chain |

Security ratings services such as SecurityScorecard and Bitsight raise findings about plain-HTTP redirects. Their exact rules are their own; this checker states its rule above so you can see why each chain is flagged and fix the hop it names.

> Worked chains on example.com and example.net addresses, judged by the checker's own rules.

## Related

- [HTTP to HTTPS redirect checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/http-to-https-redirect-checker/)
- [Redirect status codes](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-status-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-chain-contains-http/  
Data as of: 2026-11-07
