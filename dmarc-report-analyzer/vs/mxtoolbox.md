# MXToolbox's DMARC Report Analyzer and this one

MXToolbox describes its DMARC Report Analyzer as making reports readable by "parsing and aggregating them by IP address", from an XML upload; this analyzer also names the service behind each IP from published provider ranges, gives the reason each one failed and the fix, and reads .gz, .zip and .eml files directly, up to 50 at a time (MXToolbox's page read November 8, 2026).

## Try a report here

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## What MXToolbox offers

- An "Upload XML Report" button that parses the report and aggregates it by IP address.
- The page names XML; it does not mention .gz or .zip uploads (read November 8, 2026).
- Part of MXToolbox's wider set of DNS and email lookups.

## What this analyzer does

- Names the service behind each IP from 10 providers' published SPF ranges, 6 documented signing and bounce domains, and the AWS and Google Cloud range lists, with the evidence for every name.
- Says why each failing source failed (another domain's signature, the service's bounce domain, a broken signature, an IP not in your SPF) and the usual fix.
- Reads .xml, .gz, .zip and the .eml, in both RFC 9990 and RFC 7489 formats, up to 50 files at once, combined by source.
- No subscription and no account for one report: one report on the page is free; over the API, MCP or several files at once it is $0.01 a report file for the first 1,000 a month, then $0.002.
- Nothing is stored: reports are read in memory for the answer.

## When MXToolbox is better

- You already use MXToolbox's monitoring and want everything in one account.
- You only need the IP grouping and will look the IPs up yourself.

## Sources

- [MXToolbox: DMARC Report Analyzer, read November 8, 2026](https://mxtoolbox.com/DmarcReportAnalyzer.aspx)

## Related

- [The DMARC report API](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/api/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/vs/mxtoolbox/  
Data as of: 2026-11-08
