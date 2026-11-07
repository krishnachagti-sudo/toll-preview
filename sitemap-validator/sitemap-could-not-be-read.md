# Sitemap could not be read: find the cause

"Couldn't fetch" means Google could not retrieve the file. Test 4 things in order: the HTTP status, an HTML page instead of XML, robots.txt, then the XML. The table shows how the validator reports each of 6 causes; on a file with none of these faults it says: "Nothing technical in the file stops Google reading it. If Search Console still says Couldn't fetch, resubmit the exact URL and wait: Google retries for a few days, and its help lists low crawl demand among the reasons."

## Test your sitemap now

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

## Each cause, as the check reports it

| Cause | What the check says | Search Console calls it | Fix |
| --- | --- | --- | --- |
| Wrong address (404) | The sitemap URL does not answer 200: HTTP 404 from https://www.example.com/sitemap.xml (not found at this address) | HTTP error / General HTTP error | Submit the exact address the file lives at. Open it in a private window first. |
| Login, firewall or security plugin (403) | The sitemap URL does not answer 200: HTTP 403 from https://www.example.com/sitemap.xml (access refused: a login, firewall, or security plugin) | HTTP error / General HTTP error | Let crawlers fetch the file: allow it in the firewall (WAF), security plugin or password protection. |
| Server error (503) | The sitemap URL does not answer 200: HTTP 503 from https://www.example.com/sitemap.xml (a server error) | HTTP error / General HTTP error | A server or hosting problem; often temporary. Check the server logs and try again. |
| An HTML page comes back (200) | An HTML page came back instead of a sitemap: Content-Type text/html; charset=utf-8; Log in | Unsupported format | The address serves a web page, not the sitemap: a theme route, a login wall or a missing file served as a page. |
| robots.txt blocks the sitemap | robots.txt blocks Googlebot from the sitemap itself: https://www.example.com/sitemap.xml (Disallow: /sitemap) | Couldn't fetch (blocked by robots.txt) | Google respects robots.txt when fetching sitemaps: remove the rule that matches the sitemap. |
| Nothing wrong with the file | https://www.example.com/sitemap.xml is valid: 2 URLs (under 0.01% of the 50,000 limit), 272 bytes uncompressed, 0 errors and 0 warnings. | Success (if Google fetches it) | Resubmit the exact URL and wait; Google retries for a few days. Search Console lists low crawl demand among the reasons. |

> Worked out by the validator on a made-up sitemap at www.example.com, with each server answer replayed.

## When nothing in the file is wrong

Search Console's help lists low crawl demand among the reasons for Couldn't fetch, and on October 6, 2026 [Search Engine Journal reported](https://www.searchenginejournal.com/google-explains-couldnt-fetch-sitemap-errors/592040/) Google's John Mueller saying the cause is often how Google sees the site's quality rather than a technical fault. A sitemap is a hint: Google still finds pages through links.

## Sources

- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)
- [Google Search Central: Build and submit a sitemap (updated July 8, 2026), read November 8, 2026](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Search Engine Journal: Google Explains The "Couldn't Fetch" Sitemap Errors (October 6, 2026), read November 8, 2026](https://www.searchenginejournal.com/google-explains-couldnt-fetch-sitemap-errors/592040/)

## Steps

1. **Open the address logged out.** Open the exact sitemap URL in a private browser window. It should show the XML file with status 200, not a login page, an error or a block page.
2. **Check the answer.** A 401 or 403 is a password, firewall or security plugin; a 404 is a wrong address; a 5xx is the server. An HTML page with status 200 is a page, not a sitemap.
3. **Check robots.txt.** Google respects robots.txt when fetching sitemaps; a Disallow rule that matches the sitemap address stops the fetch.
4. **Check the XML.** An unescaped & or an unclosed tag makes the file unreadable: run the validator for the line number.
5. **If all of that is clean, resubmit and wait.** Google keeps trying a failed sitemap for a few days. Its help lists low crawl demand among the reasons for Couldn't fetch.

## Questions

### Is "Couldn't fetch" the same as "Sitemap could not be read"?

Yes, in practice. Couldn't fetch is the status on the Sitemaps list; Sitemap could not be read is what the details page says when the fetch failed.

### My sitemap opens fine in a browser. Why does Google say it could not be read?

Search Console's help lists these reasons: robots.txt blocks it, a manual action, a wrong URL (404), another error such as the server being unavailable, and low crawl demand ("the higher the quality of the site's content, the higher the crawl demand").

### How long does Google keep trying?

If a sitemap fetch or parse fails, Google keeps trying for a few days; if it keeps failing, Google stops. Fix the problem and resubmit.

## Related

- [Sitemap general HTTP error](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-general-http-error/)
- [Sitemap blocked by robots.txt](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-blocked-by-robots-txt/)
- [Sitemap parsing error](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-parsing-error/)
- [Every Search Console sitemap error](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/search-console-sitemap-errors/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-could-not-be-read/  
Data as of: 2026-11-08
