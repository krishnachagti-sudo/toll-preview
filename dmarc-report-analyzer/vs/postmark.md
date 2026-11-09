# Postmark DMARC digests and this analyzer

Postmark's free DMARC monitoring turns the reports sent to its address into a weekly email digest every Monday, and its paid "Weekly & Monthly" plan is $14 a month per domain; this analyzer reads the reports you already receive the moment you drop them in, with no rua change.

## Try a report here

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## What Postmark DMARC digests offers

- Free monitoring: a weekly email digest, after you add a DMARC record that sends reports to Postmark.
- Weekly & Monthly: $14 a month per domain, with a 14-day free trial; dashboards, report history, team members.
- An API token to retrieve reports.

## What this analyzer does

- Reads one report, or up to 50 at once, the moment you have it: .xml, .gz, .zip or the .eml, RFC 9990 or RFC 7489. You do not change your rua= address.
- Names the service behind each IP from published provider data, says why it failed and how it is usually fixed, with the evidence.
- One report on the page is free; over the API, MCP or several files at once it is $0.01 a report file for the first 1,000 a month, then $0.002; no subscription.
- Keeps nothing: there is no history or dashboard, by design.

## When Postmark DMARC digests is better

- You want a free summary every week without doing anything.
- You want history over time for a few domains at a fixed price.

## Sources

- [Postmark: Free DMARC Monitoring, read November 8, 2026](https://dmarc.postmarkapp.com/)

## Related

- [dmarcian compared](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/vs/dmarcian/)
- [The DMARC report API](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/api/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/vs/postmark/  
Data as of: 2026-11-08
