# parsedmarc and a per-report API

parsedmarc is a free, Apache-2.0 Python package and CLI that parses aggregate and forensic DMARC reports and sends them to JSON, CSV, Elasticsearch, OpenSearch or Splunk, on a server you run; this analyzer is one HTTPS or MCP call per report ($0.01, then $0.002 past 1,000 a month) that also names the sending service and the reason it failed.

## Try a report here

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## What parsedmarc (self-hosted) offers

- Open source under the Apache-2.0 licence, on GitHub (domainaware/parsedmarc).
- Parses aggregate and forensic reports; simple JSON and/or CSV output.
- Optionally sends results to Elasticsearch, OpenSearch, Splunk and other sinks for dashboards.
- You run and update the Python, the mailbox polling and the search stack.

## What this analyzer does

- Names the service behind each IP from 10 providers' published SPF ranges, 6 documented signing and bounce domains, and the AWS and Google Cloud range lists, with the evidence for every name.
- Says why each failing source failed (another domain's signature, the service's bounce domain, a broken signature, an IP not in your SPF) and the usual fix.
- Reads .xml, .gz, .zip and the .eml, in both RFC 9990 and RFC 7489 formats, up to 50 files at once, combined by source.
- No subscription and no account for one report: one report on the page is free; over the API, MCP or several files at once it is $0.01 a report file for the first 1,000 a month, then $0.002.
- Nothing is stored: reports are read in memory for the answer.

## When parsedmarc (self-hosted) is better

- You process large volumes of reports continuously and already run Elasticsearch, OpenSearch or Splunk.
- Reports must never leave your own servers.
- You also want forensic (ruf) reports parsed.

## Sources

- [domainaware/parsedmarc on GitHub, read November 8, 2026](https://github.com/domainaware/parsedmarc)

## Related

- [The DMARC report API](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/api/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/vs/self-hosted/  
Data as of: 2026-11-08
