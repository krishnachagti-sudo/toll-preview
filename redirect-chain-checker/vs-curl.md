# Checking redirects: curl or Endwise

Run curl -sIL on the URL: it follows every redirect, up to 50 by default, and prints one status line per hop. For one URL on a server you own, that is enough; for a list, a map or a verdict per URL, paste the output into the checker free, or check up to 1,000 URLs in one call.

## The curl command

```sh
curl -sIL http://example.com/old-page
```

What it printed (worked example):

```text
HTTP/1.1 301 Moved Permanently
Location: https://example.com/old-page

HTTP/2 302
location: /new-page

HTTP/2 200
content-type: text/html; charset=UTF-8
```

Read it top to bottom: each block is one answer. Here the checker reads 2 redirects (301 then 302), a final 200 at https://example.com/new-page, and says: Temporary redirect (302, 303, 307 or delayed refresh); Chain (2 or more hops); Reaches the expected target through a chain.

> Flatten it: point http://example.com/old-page straight at https://example.com/new-page with one 301, and do the same for the 1 URL in between.

> Google treats 302, 303 and 307 (and a delayed meta refresh) as temporary: a weak signal, and the source page tends to stay in results. Use 301 or 308 for a move that is meant to last.

## What the curl manual says

- `-L`: "If the server reports that the requested page has moved to a different location ... this option makes curl redo the request to the new place."
- `--max-redirs`: the limit for -L, 50 by default.
- `-I`: "Fetch the headers only."
- On a POST, curl "it sends the following request with a GET if the HTTP response was 301, 302, or 303."

## When curl is the better choice

- You are a developer checking a few URLs on servers you own: curl is free and already installed on most systems.
- You need a custom header, cookie, method or client certificate on the request.
- You are scripting a check into a deploy pipeline and want no outside service.

## When the checker is the better choice

- A list or a redirect map: Up to 10 URLs are free on the tool's page; a longer list costs $0.0003 a URL ($0.0001 past 20,000 URLs in a month), up to 1,000 URLs a call.
- A verdict per URL: loops, chains, temporary codes, plain-http hops, Google's 10-hop limit, the homepage, and whether it lands on the expected target.
- A CSV with one row per URL to hand to a client or a developer.
- The same rules for curl output you already have: paste it and get the verdict free.

## Check a URL

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=http%3A%2F%2Fexample.com%2Fold-page)

## Sources

- [curl manual page: -L/--location, --max-redirs, -I/--head (read November 8, 2026)](https://curl.se/docs/manpage.html)

## Questions

### How do I see every redirect with curl?

curl -sIL followed by the URL: -I asks for the headers only, -L follows each Location, -s hides the progress bar. Each response block starts with its HTTP status line.

### How many redirects does curl follow?

With -L, up to 50 by default; --max-redirs changes it (-1 for unlimited), per the curl manual.

### Does curl change POST to GET on a redirect?

The manual says that when following a redirect of a POST request "it sends the following request with a GET if the HTTP response was 301, 302, or 303." Other 3xx codes resend the same method.

### Can I paste curl output into the checker?

Yes, for free: the tool's analyse operation reads curl -sIL output for a URL you give and judges it with the same rules as a live check, without making any request.

## Related

- [Endwise vs Screaming Frog for redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/vs-screaming-frog/)
- [Endwise vs httpstatus.io](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/vs-httpstatus-io/)
- [Redirect status codes](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-status-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/vs-curl/  
Data as of: 2026-11-08
