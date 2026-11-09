# Microsoft DMARC aggregate reports

Reports from Microsoft arrive from dmarcreport@microsoft.com as gzip (.xml.gz); each one lists the mail Microsoft's systems received claiming your domain over one UTC day, grouped by sending IP, and is sent because your domain's DMARC record has a rua= address. In Microsoft's format, a sample for example.com reads: 670 messages from 7 sources; 90 messages (13.4%) failed DMARC from 4 sources. The largest is Amazon SES (54.240.8.17), 57 failing messages: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

- Messages in the sample: 670
- Failing sources: 4

## Read a report in Microsoft's format

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=microsoft)

## What a Microsoft report looks like

From a real Microsoft report in the IETF's public archive (dated November 7, 2026) and Microsoft's own pages, read November 8, 2026.

| Part | Microsoft |
| --- | --- |
| From | `DMARC Aggregate Report <dmarcreport@microsoft.com>` |
| Subject | `[Preview] Report Domain: <your domain> Submitter: enterprise.protection.outlook.com Report-ID: <id>` |
| Attachment | `enterprise.protection.outlook.com!<your domain>!<begin>!<end>.xml.gz` |
| Compression | `gzip (.xml.gz)` |
| org\_name and email in the XML | `Enterprise Outlook; dmarcreport@microsoft.com` |
| Format | `RFC 7489 style: no DMARC namespace (the root declares only xsd and xsi), version 1.0` |
| Period | `One UTC day; the end time is the next midnight (00:00:00), so periods overlap by one second` |

## Its quirks

- Every record carries envelope\_to, the recipient's domain: these reports reveal which organisations received your mail.
- Some SPF results have scope helo, which DMARC does not use.
- The subject starts with \[Preview\].
- Reports can be large: the sample was 99 KB compressed and 4.1 MB of XML (3,868 records).

## What Microsoft says about its reports

- Microsoft 365 sends aggregate reports to every domain with a valid rua=mailto: address, as long as the MX record of the Microsoft 365 domain points directly to Microsoft 365; mail routed through another service first (including hybrid setups) produces no reports.
- Microsoft 365 does not send DMARC failure (forensic) reports, even if a valid ruf= address exists.
- The report email is typically sent once a day with the previous day's results; the XML attachment is likely GZIP compressed.
- Outlook's high-volume sender post says: "We send RUA to the addresses specified in your DMARC record" and "We don't have plans to send RUF."

## The sample, read by the analyzer

The same made-up mail for example.com, written in Microsoft's format: 670 messages from 7 sources, 86.6% passing DMARC. The largest failing source is Amazon SES: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

| Source | IPs | Messages | Failed | Why |
| --- | --- | ---: | ---: | --- |
| Amazon SES | 54.240.8.17 | 57 | 57 | DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns. |
| Unnamed (203.0.113.9) | 203.0.113.9 | 23 | 23 | The mail was not DKIM-signed, and SPF softfail for example.com: this IP is not authorized to send as example.com. |
| Unnamed (192.0.2.44) | 192.0.2.44 | 6 | 6 | A DKIM signature for example.com did not verify (fail), and SPF did not pass for example.com. The message was probably changed on the way (forwarding, a mailing list, a security gateway) or the published key does not match. The receiver gave a reason: local\_policy: the receiver's own policy exempted it ("arc=pass"). |
| A server at Amazon Web Services (EC2) (35.174.145.124) | 35.174.145.124 | 4 | 4 | The mail was not DKIM-signed, and SPF fail for example.com: this IP is not authorized to send as example.com. |
| Google Workspace | 209.85.220.41 | 412 | 0 | Passed DMARC. |
| Microsoft 365 | 40.107.22.55 | 130 | 0 | Passed DMARC. |
| HubSpot | 149.72.134.20 | 38 | 0 | Passed DMARC. |

> The analyzer's notes on this format: The end time is the next midnight (00:00:00 UTC), not 23:59:59; RFC 9990 asks for non-overlapping periods, so the last second overlaps the next report. Microsoft and Mail.ru reports do this.

## Sources

- [Microsoft Learn: Set up DMARC to validate the From address domain for cloud senders (updated July 17, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure)
- [Microsoft Tech Community: Outlook's new requirements for high-volume senders (updated April 30, 2025), read November 8, 2026](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730)
- [A real Microsoft report in the IETF dmarc-report archive (November 7, 2026), read November 8, 2026](https://mailarchive.ietf.org/arch/msg/dmarc-report/aj1KsZ1A1Kywn_CckQNBmOQ1B2A/)
- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Questions

### Is the DMARC report email from Microsoft legitimate?

A real one comes from dmarcreport@microsoft.com, names enterprise.protection.outlook.com as the submitter in the subject and carries enterprise.protection.outlook.com!\<your domain\>!\<begin\>!\<end\>.xml.gz. It is sent only because your DMARC record asks for reports (rua=). Do not open other attachment types it might carry.

### How do I stop the Microsoft DMARC reports?

Remove the rua= tag (or the address in it) from your domain's DMARC TXT record at \_dmarc.\<your domain\>; RFC 9989 says receivers must not send aggregate reports when there is no rua tag. Keep it if you are still checking your senders or moving to quarantine or reject.

## Related

- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)
- [Why am I getting DMARC reports?](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/why-am-i-getting-dmarc-reports/)
- [DMARC reports from Google](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/google/)
- [DMARC reports from Yahoo](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/yahoo/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/microsoft/  
Data as of: 2026-11-08
