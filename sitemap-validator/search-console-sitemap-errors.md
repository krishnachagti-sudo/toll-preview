# Search Console sitemap errors, decoded

This table maps 25 messages from Search Console's Sitemaps report help, from Couldn't fetch to Too many News URLs, to the check that finds each in your file before you submit; 24 have one, and Temporary error is Google's to retry.

| Search Console says | What it means | The validator's check |
| --- | --- | --- |
| Couldn't fetch / Sitemap could not be read | Google could not retrieve the sitemap: blocked by robots.txt, a manual action, a wrong URL (404), another general error such as the server being unavailable, or low crawl demand. | The sitemap could not be downloaded; The sitemap URL does not answer 200; robots.txt blocks Googlebot from the sitemap itself; An HTML page came back instead of a sitemap |
| HTTP error \[code\] / General HTTP error | A 4xx answer, or another HTTP error, when downloading the sitemap. | The sitemap URL does not answer 200 |
| Compression error | The compressed sitemap could not be uncompressed. | The gzip file could not be uncompressed |
| Empty sitemap | The sitemap lists no URLs. | No URLs listed |
| Sitemap file size error | Larger than 50MB uncompressed. | Over 50MB (52,428,800 bytes) uncompressed |
| Invalid attribute value / Invalid tag value | A tag or attribute holds a value the sitemap format does not allow. | A changefreq that is not one of the seven values; A priority outside 0.0 to 1.0 |
| Invalid date | A date not in W3C Datetime, or not a real date; a time needs a time zone. | A date that is not W3C Datetime, or not a real date |
| Invalid URL | Unsupported characters, spaces or quotes, or a malformed scheme such as htp://. | A URL that is not valid (scheme, spaces, quotes or brackets); A relative URL; sitemaps need full absolute URLs; A URL of 2,048 characters or more |
| Invalid URL in sitemap index file: incomplete URL | The index lists a sitemap without its full URL. | A relative URL; sitemaps need full absolute URLs |
| Invalid XML: too many tags | A tag such as \<loc\> appears twice in one entry. | The same tag twice in one entry |
| Missing XML tag | An entry is missing a required tag. | An entry with no \<loc\>; An \<image:image\> without \<image:loc\>; A news entry without a required tag |
| Incorrect sitemap index format: Nested sitemap indexes | An index lists itself or another index. | A sitemap index lists another index, or itself |
| Parsing error | The XML could not be parsed, often because of an unescaped character such as &. | The XML is not well-formed; A bare & that is not escaped as &amp;; An entity XML does not define, such as &nbsp; |
| Too many sitemaps | An index lists more than 50,000 sitemaps. | More than 50,000 sitemaps in the index |
| Too many URLs | A sitemap lists more than 50,000 URLs. | More than 50,000 URLs |
| Unsupported format | Not a supported format: the wrong header or namespace, or attributes in curly quotes. | The root element is not \<urlset\> or \<sitemapindex\>; An HTML page came back instead of a sitemap; An attribute in curly quotes instead of straight quotes |
| URL not allowed | A URL at a higher level or on another domain or protocol than the sitemap. | A URL on another host, protocol or port than the sitemap; A URL above or beside the sitemap's folder |
| Path mismatch: Missing www / Includes www | The sitemap and its URLs disagree about www. | www and the bare domain mixed between the sitemap and its URLs |
| Incorrect namespace | The root element's namespace is missing, mistyped or wrong for the file type. | The sitemap namespace is missing or wrong; An image, news or video prefix is bound to the wrong namespace |
| Leading whitespace | The file starts with whitespace before the XML declaration; Google still processes it. | Text or whitespace before the XML declaration |
| Too many News URLs | More than 1,000 news URLs in one sitemap. | More than 1,000 \<news:news\> tags |
| Missing \<publication\> tag | A news URL without its \<news:publication\> tag. | A news entry without a required tag |
| Sitemap contains urls which are blocked by robots.txt | robots.txt blocks the sitemap or URLs it lists. | Listed URLs that robots.txt blocks for Googlebot; robots.txt blocks Googlebot from the sitemap itself |
| URLs not followed | Google could not crawl all listed URLs: too many redirects, or relative URLs. | A relative URL; sitemaps need full absolute URLs |
| Temporary error | A problem on Google's side; Google retries. Nothing in the file to fix. | Nothing to check: Google retries |

> Meanings summarize Search Console Help, read November 8, 2026. Video sitemap errors are not covered.

## Run all the checks on your sitemap

[Validate this sitemap](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/?url=https%3A%2F%2Fwww.example.com%2Fsitemap.xml&live=10)

- [Search Console Help: Manage your sitemaps using the Sitemaps report, read November 8, 2026](https://support.google.com/webmasters/answer/7451001?hl=en)

## Questions

### Does Leading whitespace stop Google reading my sitemap?

No. Search Console says it won't prevent processing; remove the whitespace so the file follows the XML standard.

## Related

- [Sitemap could not be read](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-could-not-be-read/)
- [Sitemap parsing error](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/sitemap-parsing-error/)
- [Search Console report vs a pre-submit check](https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/vs/search-console-sitemaps-report/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/search-console-sitemap-errors/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/sitemap-validator/search-console-sitemap-errors.csv
