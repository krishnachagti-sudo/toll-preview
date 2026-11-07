# Site migration redirect checklist

After a site move, check every old URL against its intended target: each should land on its own new page in 1 permanent hop (301 or 308). Google advises chains of ideally no more than 3 hops and keeping redirects "generally at least 1 year".

- Keep redirects: at least 1 year
- Redirect type: 301 or 308
- Chain length: ideally 3 or fewer
- URLs per call: 1,000

## What a post-launch check finds

On the worked 12-row map in the [redirect map template](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-map-template/), the checker reports 6 rows on target in one hop, 2 reaching the target through a chain, 1 off by a trailing slash, 1 on the wrong page, 1 loop, 1 ending on a 404 and 2 with a temporary redirect. Each of those is a different fix.

## What to fix first

- **Loops and errors:** the old URL reaches nothing. See [the redirect loop checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-loop-checker/).
- **Wrong target or the homepage:** the visitor lands on a page that is not the replacement. See [redirects to the homepage](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-to-homepage/).
- **Chains:** point the old URL straight at the final one. See [flatten redirect chains](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/flatten-redirect-chains/).
- **Temporary codes:** a 302 or 307 that should be a 301 or 308. See [redirect status codes](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-status-codes/).
- **Plain-http hops:** see [the HTTP to HTTPS checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/http-to-https-redirect-checker/).

## Check your old URLs

[Check the redirects](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/?list=https%3A%2F%2Fexample.com%2Fold-page)

## After the check

Google: "Search Console is your friend, especially during a site move." Watch the old site's traffic fall while the new site's rises, and re-run the map whenever someone changes the server rules.

> Worked rows on example.com addresses, judged by the checker's own rules. Google's advice is quoted from its page as read on the date in the sources.

## Sources

- [Google Search Central: Site moves with URL changes (read November 8, 2026)](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Google Search Central: Redirects and Google Search](https://developers.google.com/search/docs/crawling-indexing/301-redirects)

## Steps

1. **List every old URL.** Take the old sitemap, the landing pages in your analytics and the top pages in Search Console. Every URL that had traffic or links goes on the list.
2. **Write the map.** Give each old URL its new address, one to one where an equivalent page exists. Google: "Once you have the listing of old URLs, decide where each one should redirect to."
3. **Use permanent redirects.** Google recommends server-side permanent redirects: "we recommend that you use HTTP permanent redirects if possible, such as 301 and 308."
4. **Check the map after launch.** Paste the map as old,new lines into the checker. Each row says whether the old URL lands on its target, through how many hops and with which codes. Up to 10 URLs are free on the tool's page; a longer list costs $0.0003 a URL ($0.0001 past 20,000 URLs in a month), up to 1,000 URLs a call.
5. **Fix in this order.** Loops and errors first, then wrong targets and homepage redirects, then chains, then temporary codes, then plain-http hops.
6. **Run it again and keep both runs.** Re-check the full map after the fixes and keep both CSV files as the launch record.
7. **Keep the redirects.** Keep the redirects for as long as possible, generally at least 1 year. Set a reminder before anyone removes them.

## Questions

### How long should I keep 301 redirects after a site move?

Google: "Keep the redirects for as long as possible, generally at least 1 year." Keep them longer while old URLs still get links or visits.

### Should I use 301 or 302 for a migration?

A permanent code. Google: "We recommend that you use HTTP permanent redirects if possible, such as 301 and 308." A 302 or 307 is temporary to Google.

### How many hops are acceptable?

One. Google: "Avoid chaining redirects." and, where that is not possible, "keep the number of redirects in the chain low, ideally no more than 3 and fewer than 5."

### Can I redirect old pages to the homepage?

Not in bulk. Google: "Don't redirect many old URLs to one irrelevant single URL destination, such as the home page of the new site."

## Related

- [Redirect map template](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-map-template/)
- [Flatten redirect chains](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/flatten-redirect-chains/)
- [Redirects to the homepage](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/redirect-to-homepage/)
- [301 redirect checker](https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/301-redirect-checker/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/redirect-chain-checker/site-migration-redirect-checklist/  
Data as of: 2026-11-08
