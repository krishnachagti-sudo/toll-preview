# DMARC reports from Mail.ru

Reports from Mail.ru arrive from dmarc\_support@corp.mail.ru as gzip (.xml.gz); each one lists the mail Mail.ru's systems received claiming your domain over one UTC day, grouped by sending IP, and is sent because your domain's DMARC record has a rua= address. In Mail.ru's format, a sample for example.com reads: 670 messages from 7 sources; 90 messages (13.4%) failed DMARC from 4 sources. The largest is Amazon SES (54.240.8.17), 57 failing messages: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

- Messages in the sample: 670
- Failing sources: 4

## Read a report in Mail.ru's format

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=mail-ru)

## What a Mail.ru report looks like

From a real Mail.ru report in the IETF's public archive (dated November 6, 2026) and Mail.ru's own pages, read November 8, 2026.

| Part | Mail.ru |
| --- | --- |
| From | `dmarc_support@corp.mail.ru` |
| Subject | `Report Domain: <your domain>; Submitter: Mail.Ru; Report-ID: <id>` |
| Attachment | `mail.ru!<your domain>!<begin>!<end>.xml.gz` |
| Compression | `gzip (.xml.gz)` |
| org\_name and email in the XML | `Mail.Ru; dmarc_support@corp.mail.ru` |
| Format | `RFC 7489 style: no namespace and no version element; the whole XML is on one line` |
| Period | `One UTC day; the end time is the next midnight (00:00:00), so periods overlap by one second` |

## Its quirks

- The subject separates its parts with semicolons and names the submitter as "Mail.Ru", not a domain name.
- extra\_contact\_info is http://help.mail.ru/mail-help.

## What Mail.ru says about its reports

- Aggregate (RUA) reports are sent daily by a mail server that received mail from your domain in the past day, and contain SPF, DKIM and DMARC results.
- Reports arrive only if mail with your domain in the From field reached the receiving server in the past day.
- A report is a GZIP archive (.gz) holding an XML file; Mail.ru's own sample names org\_name Mail.Ru and the address dmarc\_support@corp.mail.ru.

## The sample, read by the analyzer

The same made-up mail for example.com, written in Mail.ru's format: 670 messages from 7 sources, 86.6% passing DMARC. The largest failing source is Amazon SES: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

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

- [Mail.ru Help for developers: DMARC reports (Otchety DMARC, in Russian), read November 8, 2026](https://help.mail.ru/developers/notes/rua/)
- [A real Mail.ru report in the IETF dmarc-report archive (November 6, 2026), read November 8, 2026](https://mailarchive.ietf.org/arch/msg/dmarc-report/bWvpmYLSqm6ZmfP8e49T9Wqlfkk/)
- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Questions

### Is the DMARC report email from Mail.ru legitimate?

A real one comes from dmarc\_support@corp.mail.ru, names Mail.Ru as the submitter in the subject and carries mail.ru!\<your domain\>!\<begin\>!\<end\>.xml.gz. It is sent only because your DMARC record asks for reports (rua=). Do not open other attachment types it might carry.

### How do I stop the Mail.ru DMARC reports?

Remove the rua= tag (or the address in it) from your domain's DMARC TXT record at \_dmarc.\<your domain\>; RFC 9989 says receivers must not send aggregate reports when there is no rua tag. Keep it if you are still checking your senders or moving to quarantine or reject.

## Related

- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)
- [Why am I getting DMARC reports?](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/why-am-i-getting-dmarc-reports/)
- [Microsoft DMARC aggregate reports](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/microsoft/)
- [DMARC reports from Google](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/google/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/mail-ru/  
Data as of: 2026-11-08
