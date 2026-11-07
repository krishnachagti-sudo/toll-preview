# How redirect chains are checked: method and sources

Each URL is followed hop by hop, up to 20 redirects. 301 and 308 count as permanent and 302, 303 and 307 as temporary, as Google Search Central lists them, and a chain of more than 10 redirects is flagged as past Google's default limit.

## What does the bulk redirect chain checker compute?

The tool takes a list of up to 1,000 URLs, or an old-to-new redirect map, and requests each URL from our server, following every redirect. For each URL it gives every hop with its status code, the final URL and status, and verdicts such as a loop, a chain, a temporary redirect, a plain-HTTP hop or a wrong target, graded ok, review or fix, with a CSV. It can also judge pasted curl output without making any request, and it lists Google's redirect status codes.

Operations (the op field):

- `check`: Fetches each URL in list (text, one per line or "old,new" per line) or urls (a list, or { url, expected } rows) and follows its redirects. The answer has a summary line, counts, one row per URL with every hop and its verdicts, and a CSV. Options: userAgent (endwise, googlebot or chrome), maxHops (at most 20), followMetaRefresh and issuesOnly.
- `analyse`: Judges one chain from pasted curl -sIL output, or from a list of { status, location } answers, exactly as a live run is judged, without any request. Free.
- `codes`: Returns Google's table of redirect status codes (permanent or temporary, and whether the method may change), the meta refresh rule, the facts quoted in the verdicts, the limits and the sources. Free.

Inputs:

- `list or urls`: The URLs, or a redirect map with the expected target per row. A bare host is read as http://. A header line and comments are skipped. At most 1,000 different URLs per call, each at most 2,048 characters.
- `expected`: Where a URL should land: a full URL, or a path such as /new-page, read on the site the chain ends on when that is the same site (www and scheme aside), else on the old URL's site over https.
- `userAgent, maxHops, followMetaRefresh, issuesOnly`: Who the requests are sent as, the redirects to follow before stopping (default 20), whether meta refresh and the Refresh header are followed (default yes), and whether only rows to fix or review are returned.
- `url and curl or hops`: For analyse: the URL the output starts from, and the pasted output or the answers in order.

Outputs:

- rows: per URL, the hops (status, kind, next URL, what changed), redirects, finalUrl, finalStatus, verdicts, severity, a one-line summary and notes
- summary: counts of chains, loops, temporary redirects, plain HTTP, broken endings and map results
- csv: the rows as a spreadsheet, with formula-like cells defused
- billedUrls: the different URLs actually fetched

## How is it calculated, step by step?

1. Each line is read as a URL, or as an old URL and its expected target. Credentials, other schemes and unreadable lines are refused and listed by line number. A URL given twice is fetched once.
2. Before every hop the address is checked: private, loopback, link-local (cloud metadata), CGNAT and reserved addresses are never fetched, and only ports 80, 443, 8080 and 8443 are used.
3. Each URL is requested with the chosen user agent. A 3xx answer (other than 304) with a Location is followed to the next URL; a 2xx answer is followed too when it carries a Refresh header or a meta refresh in the first 64 kB of the page. Anything else ends the chain.
4. The walk stops when a URL repeats (a loop), after 20 redirects, on a missing or unreadable Location, on a refused address or on a failed request. At most 2 requests go to one host at a time and 16 overall, and URLs not reached within 40 seconds are returned as not checked.
5. Each redirect is classed by Google's table: 301 and 308 permanent, 302, 303 and 307 temporary, a 0-second refresh permanent and a delayed one temporary.
6. The verdicts are set: loop, too many hops, broken (ends on 4xx or 5xx), more than 10 redirects (past Google's default), a downgrade from https to http, ending on http, a plain-HTTP URL after the first hop, a temporary redirect, a long chain (5 or more), a chain (2 or more), meta refresh and, against the map, a match, a match through a chain, a trailing-slash difference, a wrong target, or a redirect to the homepage.
7. Each row is graded fix (a loop, an error, a broken ending, a downgrade, a wrong target and the other severe verdicts), review (any other verdict) or ok, and given a one-line summary and notes on how to fix it.

**Google Search Central.**

The permanent and temporary codes, the meta refresh rule and the 10-hop default come from Google's pages on redirects and on HTTP status codes, with the dates they were updated and read.

**RFC 9110.**

The method column of the status code table is from RFC 9110 section 15.4: 307 and 308 keep the method, 303 becomes a GET, and clients may turn a POST into a GET on 301 and 302.

**Our own rules.**

A plain http:// URL reached by a redirect is flagged; the address you typed is not, since a visitor who types http:// is expected to take one hop to https. A redirect from a page to the root of a site is flagged as sent to the homepage unless the root is the expected target.

## Which edge cases does it handle?

- Loops are reported with the hop they start at and the cycle, and the http and https, www and bare host, trailing slash and Cloudflare self-loop patterns get their own note.
- A relative Location is read against the URL that sent it, and an empty or unreadable Location is a bad-location verdict.
- A Refresh header and a meta refresh are hops when followMetaRefresh is on; a refresh with no URL is not a redirect.
- A redirect to a private address in the middle of a chain stops the chain there, and the URL is still counted as checked.
- An expected path is read on the right site, so /new-page matches on www or the bare host alike.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Judging pasted curl -sIL output against an expected target (no request made)**

```json
{
  "op": "analyse",
  "url": "http://example.com/old-page",
  "curl": "HTTP/1.1 301 Moved Permanently\nLocation: https://example.com/old-page\n\nHTTP/2 302\nlocation: /new-page\n\nHTTP/2 200\ncontent-type: text/html; charset=UTF-8\n",
  "expected": "/new-page"
}
```

Judging pasted curl -sIL output against an expected target (no request made)

| Result | Value |
| --- | --- |
| summary | http://example.com/old-page reaches https://example.com/new-page (200) in 2 redirects, with a temporary redirect. |
| chain | 301 http://example.com/old-page \> 302 https://example.com/old-page \> 200 https://example.com/new-page |
| redirects | 2 |
| verdicts | temporary, chain, via-chain |
| expected target | via-chain |
| severity | review |

**Google's redirect codes and limits**

```json
{
  "op": "codes"
}
```

Google's redirect codes and limits

| Result | Value |
| --- | --- |
| 301 | Moved Permanently: permanent |
| 302 | Found: temporary |
| 303 | See Other: temporary |
| 307 | Temporary Redirect: temporary |
| 308 | Permanent Redirect: permanent |
| Google hop limit | 10 |
| long chain from | 5 |

## What does it not do?

- JavaScript redirects are not followed: only HTTP redirects, the Refresh header and meta refresh tags.
- A check is one request per hop from our server in the United States. Servers can answer differently for other user agents, countries, cookies or logins, and some block automated requests.
- Nothing here promises a ranking effect. What Google does with redirects is quoted from Google with the date it was read.
- Private, local and reserved addresses are never fetched, on any hop.

## Where does the data come from, and how fresh is it?

Google's redirect table and facts were read on 2026-11-07 (redirects page updated 2026-04-14, HTTP status codes page updated 2026-02-04). Each check fetches the URLs live at the moment of the call.

- [RFC 9110, HTTP Semantics, section 15.4 (Redirection 3xx) (read 2026-11-07)](https://www.rfc-editor.org/rfc/rfc9110#section-15.4)
- [Google Search Central: Redirects and Google Search (read 2026-11-07)](https://developers.google.com/search/docs/crawling-indexing/301-redirects)
- [Google Search Central: How HTTP status codes, and network and DNS errors affect Google Search (read 2026-11-07)](https://developers.google.com/search/docs/crawling-indexing/http-network-errors)
- [Cloudflare: ERR\_TOO\_MANY\_REDIRECTS (read 2026-11-07)](https://developers.cloudflare.com/ssl/troubleshooting/too-many-redirects/)
- [Search Engine Journal: Google's John Mueller recommends less than 5 hops per redirect chain (read 2026-11-07)](https://www.searchenginejournal.com/googles-john-mueller-recommends-less-than-5-hops-per-redirect-chain/344664/)

[All sources, editions and read dates](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

Every verdict is checked against a fake web, with no network: one hop, chains, Google's codes, loops and their patterns, hop limits, plain HTTP, meta refresh, errors and refusals, and expected targets. Pasted curl output is judged like a live run, the worked examples equal run(), and blocked address forms are checked one by one.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) list what each test suite asserts.

[Open the Bulk redirect chain checker tool](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/).

## Questions

### Is there any AI in the bulk redirect chain checker answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the bulk redirect chain checker refuse to answer?

JavaScript redirects are not followed: only HTTP redirects, the Refresh header and meta refresh tags. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Bulk redirect chain checker tool](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Redirect status codes](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-status-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/redirect-chain-checker/  
Data as of: 2026-11-04
