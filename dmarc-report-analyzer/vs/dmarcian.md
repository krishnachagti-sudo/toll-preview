# dmarcian and this analyzer

dmarcian's Basic plan is $19.99 a month billed yearly ($24 month to month) for up to 2 active domains, and its XML to Human Converter reads one file free; here one report on the page is free and $0.01 a report file over the API, so 300 reports a month cost $3.00 and the break-even with Basic is 5,995 reports a month (read November 8, 2026).

## Try a report here

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## What dmarcian offers

- Personal (non-business use): $0 a month, up to 2 domains, 1,250 DMARC-capable messages a month, 1 month of history.
- Basic: $19.99 a month billed yearly or $24 monthly; up to 2 active domains, 100,000 messages, 3 months of history.
- Plus: $199 a month yearly ($240 monthly), up to 8 domains; Enterprise: $499 a month yearly ($600 monthly), up to 15 domains.
- Enriched DMARC data with sources, SPF Surveyor, DKIM Inspector, and a free XML to Human Converter for one report.

## What this analyzer does

- Names the service behind each IP from 10 providers' published SPF ranges, 6 documented signing and bounce domains, and the AWS and Google Cloud range lists, with the evidence for every name.
- Says why each failing source failed (another domain's signature, the service's bounce domain, a broken signature, an IP not in your SPF) and the usual fix.
- Reads .xml, .gz, .zip and the .eml, in both RFC 9990 and RFC 7489 formats, up to 50 files at once, combined by source.
- No subscription and no account for one report: one report on the page is free; over the API, MCP or several files at once it is $0.01 a report file for the first 1,000 a month, then $0.002.
- Nothing is stored: reports are read in memory for the answer.

## When dmarcian is better

- You want reports collected for you every day, with history and alerts: dmarcian is a monitoring platform, this is a reader.
- You want forensic (ruf) report processing (on its paid plans) or a team account.
- Your use is personal and non-business: its free Personal account covers it.

## Sources

- [dmarcian: Pricing, read November 8, 2026](https://dmarcian.com/pricing/)
- [dmarcian: XML to Human Converter, read November 8, 2026](https://dmarcian.com/xml-to-human-converter/)

## Related

- [The DMARC report API](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/api/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/vs/dmarcian/  
Data as of: 2026-11-08
