# How sitemaps are validated: method and sources

A sitemap may list up to 50,000 URLs and be up to 52,428,800 bytes (50MB) uncompressed, and an index up to 50,000 sitemaps, as sitemaps.org sets them. Each problem found is named with its Search Console error name where Google has one, and any error makes the sitemap not valid.

## What does the sitemap validator compute?

The tool fetches a sitemap or sitemap index from its address (.xml, .xml.gz or .txt), or takes pasted text, and judges it against the sitemaps.org protocol and Google's sitemap pages. It reports every issue with its line, its severity (error, warning or note) and, for 34 of them, the name the Search Console Sitemaps report uses. It reads up to 50 child sitemaps of an index in one call, checks every listed URL against robots.txt, and can request up to 250 listed URLs live for status, redirects, noindex and canonical. The answer comes with a verdict, advice in order and a CSV.

Operations (the op field):

- `check`: Fetches the sitemap at url, with its host's robots.txt, and judges it. For an index, maxSitemaps (default and most 50) and sitemapFrom choose which children to read; live (most 250), liveFrom and pick (first or spread) choose which listed URLs to request. The answer has the verdict, a summary, each file with its issues, the robots.txt result, the live rows, advice, what was billed and a CSV.
- `paste`: Judges pasted sitemap XML or a text sitemap (at most 5,000,000 characters) with no request made. With url, the address the file will live at, the host, protocol and folder rules are checked too. Free.
- `rules`: Returns the limits, the dated facts, lastmod examples, the Search Console error names with the issue codes behind each, the list of issues and the per-call limits, with the sources. Free.

Inputs:

- `url`: The sitemap address, at most 2,048 characters. A bare host such as example.com/sitemap.xml is read as https://. Only http and https are fetched; an address with a space, a user name or a password is refused.
- `maxSitemaps, sitemapFrom`: For an index: how many children to read in this call (0 to 50) and which child to start at, so a large index can be read over several calls.
- `live, liveFrom, pick`: How many listed URLs to request live (0 to 250, default 0), where in the list to start (liveFrom needs live), and whether to take the first ones or spread them evenly through the list.
- `xml`: For paste: the sitemap as text, 1 to 5,000,000 characters.

Outputs:

- verdict: fetch-failed, invalid, warnings or valid, with an answer line
- summary: files, URLs, sitemaps, bytes, errors, warnings, notes, future lastmod dates, URLs blocked by robots.txt and the live counts
- files: per file, its kind, size, URL count, lastmod range, extensions and issues (code, severity, Search Console name, count and up to 200 examples with line numbers)
- robots: how robots.txt answered, whether it lists the sitemap and whether it blocks it
- live: per URL requested, the status, final URL, redirects, noindex, canonical, verdicts and a one-line summary
- advice, billed (files read and URLs requested) and a CSV with formula-like cells defused

## How is it calculated, step by step?

1. The address is read: a bare host gets https://, the fragment is dropped, and anything other than an http or https address with a domain name is refused before any request.
2. The host's robots.txt is fetched first (RFC 9309). A 2xx answer gives the rules for Googlebot (the groups naming it, merged, else the \* group); a 4xx means no rules; a 5xx or no answer means everything must be assumed disallowed, which is an error. A rule that blocks the sitemap itself is an error.
3. The sitemap is fetched, following at most 5 redirects hop by hop (a redirect is a warning: submit the final address). A non-2xx answer is an HTTP error. A gzip file is uncompressed up to the size cap. Bytes that are not valid UTF-8 are an error and are read anyway.
4. The text is classed: empty, an HTML page, a text sitemap (one URL per line), or XML. The XML reader keeps going after a bare &, an undefined entity or a stray \< and reports each with its line; a closing tag that does not match, a second root or a file that ends inside a tag stops the read at that line.
5. The root must be \<urlset\> or \<sitemapindex\> in the namespace http://www.sitemaps.org/schemas/sitemap/0.9. RSS and Atom feeds are read as feeds. Each \<url\> may hold loc, lastmod, changefreq and priority (an index entry loc and lastmod), each once; a missing \<loc\>, a tag twice or a tag the schema does not allow there is an error, and tags out of schema order are a note.
6. Each \<loc\> must be an absolute http or https URL with no spaces, quotes or brackets and under 2,048 characters; under 12 characters is a note, and characters that should be percent-encoded are a warning. It must be on the sitemap's protocol, host and port (www and the bare domain mixed is named Path mismatch), and a URL outside the sitemap's folder is a warning. A URL listed twice is a warning.
7. Each lastmod must be W3C Datetime: YYYY-MM-DD, or a date and time with a time zone, and a real date. A date alone is read as midnight UTC. changefreq must be one of its seven values and priority between 0.0 and 1.0; both are noted as ignored by Google.
8. Google's extensions are checked: at most 1,000 \<image:image\> tags in one \<url\>, each with \<image:loc\>; at most 1,000 \<news:news\> tags in a file, each with publication, name, language, publication\_date and title, a language that is an ISO 639 code, and a warning for articles older than 2 days. Video entries are counted, not checked. A wrong image, news or video namespace is a warning.
9. More than 50,000 URLs, more than 50,000 sitemaps in an index, or more than 52,428,800 bytes uncompressed is an error. For an index, the chosen children are read 2 at a time and judged the same way; a child that is itself an index, or an index that lists itself, is a nested index error.
10. Every listed URL on the sitemap's own host is run against robots.txt for Googlebot: the longest matching rule wins, Allow wins a tie, \* and $ are understood, and /robots.txt is always allowed. Each blocked URL is an error.
11. When live is set, the chosen URLs are requested, 4 at a time per host and 8 overall, following redirects. Each gets verdicts: redirect, 404 or 410, other 4xx, 5xx, noindex (from a robots or googlebot meta tag in the first 256 kB, or X-Robots-Tag for Googlebot), a canonical naming another URL (from the Link header or the link tag), not HTML, or ok.
12. The verdict is fetch-failed when the sitemap could not be read, invalid with any error, warnings with any warning or any live problem, and valid otherwise. Advice is written in order, starting with the fetch, then XML errors, dates, scope and size.

**sitemaps.org protocol and schema.**

The limits are the protocol's: 50,000 URLs and 52,428,800 bytes uncompressed per sitemap, 50,000 sitemaps per index, a \<loc\> under 2,048 characters, and URLs on the sitemap's protocol and host and under its folder. The minimum of 12 characters is from the XSD and is only a note.

**Google Search Central and Search Console.**

The file must be UTF-8 with absolute URLs; an index may not list another index; a time in lastmod needs a time zone (Search Console: Invalid date); Google ignores priority and changefreq; and the image and news limits are from Google's image and news sitemap pages. Each issue carries the Search Console report's name where the report has one, so the answer reads in the words the user saw.

**RFC 9309.**

robots.txt is read as RFC 9309 sets out: groups for the same crawler merged, the \* group as the fallback, the longest match wins with Allow winning a tie, and a 5xx or unreachable robots.txt means crawlers assume everything is disallowed.

**Our own rules.**

The lastmod sanity flags are heuristics, not Google's rules: a date more than one day after the check, at least 95% of at least 20 dated URLs on one value or on the day of the check, and a lastmod later than the file's own Last-Modified header. One call stops starting requests after 40 seconds and reads at most 160 MB of sitemap files; files and URLs not reached are listed and not charged.

## Which edge cases does it handle?

- A byte order mark at the start is skipped; whitespace before \<?xml is a Leading whitespace warning, and text before the first tag is an XML error.
- An attribute in curly quotes is reported as Unsupported format, and a DOCTYPE is a warning.
- A namespace that mentions sitemaps.org/schemas/sitemap but is not exactly right is reported as a near miss, and the file is still read in it.
- A read cut at the size cap says "more than" the byte count, and an unclosed tag at the cut is not reported as an error.
- A text sitemap line that is not a URL is an error, and a text sitemap whose name does not end in .txt gets a note.
- A URL listed twice is a warning, and it is checked against robots.txt and live only once.
- A relative \<loc\> in an index says where Google would look for it.
- A private, local, link-local or reserved address is never fetched, on any hop, and a URL refused that way is not charged.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Check pasted XML before it ships (nothing fetched)**

```json
{
  "op": "paste",
  "xml": "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n  <url><loc>https://example.com/</loc><lastmod>2026-11-02</lastmod></url>\n  <url><loc>https://example.com/search?q=tea&page=2</loc><lastmod>2026-11-02T10:00:00</lastmod></url>\n</urlset>",
  "url": "https://example.com/sitemap.xml"
}
```

Check pasted XML before it ships (nothing fetched)

| Result | Value |
| --- | --- |
| answer | https://example.com/sitemap.xml is not valid: 2 URLs (under 0.01% of the 50,000 limit), 285 bytes uncompressed, 2 errors and 0 warnings. |
| verdict | is not valid |
| unescaped-ampersand (Parsing error) | line 4: https://example.com/search?q=tea&page=2 |
| invalid-date (Invalid date) | line 4: \<lastmod\>2026-11-02T10:00:00\</lastmod\>: a time without a time zone (add Z or an offset such as +00:00) |

**The limits the validator applies**

```json
{
  "op": "rules"
}
```

The limits the validator applies

| Result | Value |
| --- | --- |
| URLs per sitemap | 50,000 |
| bytes per sitemap, uncompressed | 52,428,800 |
| sitemaps per index | 50,000 |
| loc length, fewer than | 2,048 |
| images per URL | 1,000 |
| news tags per sitemap | 1,000 |
| child sitemaps read per call | 50 |
| URLs checked live per call | 250 |

## What does it not do?

- Private, local, link-local (cloud metadata) and reserved addresses are never fetched, on any hop, and only ports 80, 443, 8080 and 8443 are used.
- A check is what each server answered at that moment to one request from our server in the United States. Servers can answer Googlebot, other countries or signed-in visitors differently.
- It cannot see Search Console's crawl schedule, crawl demand or manual actions, so a clean result does not by itself clear a Couldn't fetch status.
- noindex and canonical are read from the HTML the server sends and from the headers; tags added by JavaScript are not seen.
- Video sitemap entries are counted but not checked.

## Where does the data come from, and how fresh is it?

The rules and limits were read on 2026-11-08: the sitemaps.org protocol (page updated 2016-11-21), Google's Build and submit a sitemap page (updated 2026-07-08) and the Search Console Sitemaps report help. The pages are checked for changes once a day. A check fetches the sitemap live at the moment of the call; paste and rules make no request. Engine sitemap-validator-1.

- [sitemaps.org: Sitemaps XML format (protocol) (read 2026-11-08)](https://www.sitemaps.org/protocol.html)
- [sitemaps.org: sitemap.xsd and siteindex.xsd (read 2026-11-08)](https://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd)
- [Google Search Central: Build and submit a sitemap (read 2026-11-08)](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google Search Central: What is a sitemap (Do I need a sitemap?) (read 2026-11-08)](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Google Search Central: Manage your sitemaps with a sitemap index file (read 2026-11-08)](https://developers.google.com/search/docs/crawling-indexing/sitemaps/large-sitemaps)
- [Google Search Central: News sitemaps (read 2026-11-08)](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)
- [Google Search Central: Image sitemaps (read 2026-11-08)](https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps)
- [Search Console Help: Manage your sitemaps using the Sitemaps report (read 2026-11-08)](https://support.google.com/webmasters/answer/7451001?hl=en)
- [Google Search Central: Robots meta tag, data-nosnippet and X-Robots-Tag (read 2026-11-08)](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Google Search Central Blog: Sitemaps ping endpoint is going away (read 2026-11-08)](https://developers.google.com/search/blog/2023/06/sitemaps-lastmod-ping)
- [RFC 9309: Robots Exclusion Protocol (read 2026-11-08)](https://www.rfc-editor.org/rfc/rfc9309)
- [Search Engine Journal: Google Explains The "Couldn't Fetch" Sitemap Errors (read 2026-11-08)](https://www.searchenginejournal.com/google-explains-couldnt-fetch-sitemap-errors/592040/)

[All sources, editions and read dates](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests pin the rules, limits and source dates as read, then check the XML reader (recoverable and structural errors with line numbers), every format and entry problem, the 50,000 URL and byte limits, URL scope, W3C dates, the lastmod heuristics, image and news extensions, nested indexes, robots.txt matching, noindex and canonical reading, every live verdict, the summary, answer line and CSV. Fetching runs against a fake web with no network: gzip, redirects, size caps, the per-host limit and the time budget, robots.txt blocking, private addresses refused and not charged. The worked examples equal run().

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) list what each test suite asserts.

[Open the Sitemap validator tool](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/).

## Questions

### Is there any AI in the sitemap validator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the sitemap validator refuse to answer?

Private, local, link-local (cloud metadata) and reserved addresses are never fetched, on any hop, and only ports 80, 443, 8080 and 8443 are used. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Sitemap validator tool](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Search Console sitemap errors](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/search-console-sitemap-errors/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/sitemap-validator/  
Data as of: 2026-11-04
