# EasyDMARC and this analyzer

EasyDMARC's cheapest plan, DMARC Plus, is $44.99 a month ($35.99 a month billed annually) for 2 domains and 100,000 emails, and API access is listed only on its enterprise tier; parsing 300 reports a month here costs $3.00, and it stays cheaper up to 18,495 reports a month (read November 8, 2026).

## Try a report here

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## What EasyDMARC offers

- DMARC Plus: $44.99 a month, or $35.99 billed annually; 2 domains, from 100,000 emails a month, 3 months of history.
- DMARC Premium: $89.99 a month ($71.99 annually); 4 domains, 1 year of history, EasySPF, alerts.
- Deliverability and Enterprise tiers by quote; "SSO, API Access & Audit Logs" are listed on Enterprise: Email Trust.
- Free tools including a DMARC XML Report Analyzer.

## What this analyzer does

- Names the service behind each IP from 10 providers' published SPF ranges, 6 documented signing and bounce domains, and the AWS and Google Cloud range lists, with the evidence for every name.
- Says why each failing source failed (another domain's signature, the service's bounce domain, a broken signature, an IP not in your SPF) and the usual fix.
- Reads .xml, .gz, .zip and the .eml, in both RFC 9990 and RFC 7489 formats, up to 50 files at once, combined by source.
- No subscription and no account for one report: one report on the page is free; over the API, MCP or several files at once it is $0.01 a report file for the first 1,000 a month, then $0.002.
- Nothing is stored: reports are read in memory for the answer.

## When EasyDMARC is better

- You want managed SPF, DKIM, BIMI or MTA-STS hosting and alerts in one suite.
- You want reports collected continuously with history.
- Your company needs SSO, audit logs and a dedicated customer success manager.

## Sources

- [EasyDMARC: Pricing, read November 8, 2026](https://easydmarc.com/pricing)

## Related

- [The DMARC report API](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/api/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/vs/easydmarc/  
Data as of: 2026-11-08
