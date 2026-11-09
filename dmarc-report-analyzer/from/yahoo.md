# DMARC reports from Yahoo

Reports from Yahoo arrive from noreply@dmarc.yahoo.com as gzip (.xml.gz); each one lists the mail Yahoo's systems received claiming your domain over one UTC day, grouped by sending IP, and is sent because your domain's DMARC record has a rua= address. In Yahoo's format, a sample for example.com reads: 670 messages from 7 sources; 90 messages (13.4%) failed DMARC from 4 sources. The largest is Amazon SES (54.240.8.17), 57 failing messages: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

- Messages in the sample: 670
- Failing sources: 4

## Read a report in Yahoo's format

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=yahoo)

## What a Yahoo report looks like

From a real Yahoo report in the IETF's public archive (dated November 7, 2026) and Yahoo's own pages, read November 8, 2026.

| Part | Yahoo |
| --- | --- |
| From | `noreply@dmarc.yahoo.com` |
| Subject | `Report Domain: <your domain> Submitter: yahoo.com Report-ID: <id in angle brackets>` |
| Attachment | `yahoo.com!<your domain>!<begin>!<end>.xml.gz` |
| Compression | `gzip (.xml.gz)` |
| org\_name and email in the XML | `Yahoo; dmarchelp@yahooinc.com` |
| Format | `RFC 7489 style: no namespace and no version element` |
| Period | `One UTC day, 00:00:00 to 23:59:59` |

## Its quirks

- The email comes from noreply@dmarc.yahoo.com, while the report's contact is dmarchelp@yahooinc.com.
- Lines end with a tab character after the tags; strict parsers that do not trim values can misread them.
- No envelope\_from and no SPF scope; a record can list several DKIM signatures, including the same selector twice with different results.

## What Yahoo says about its reports

- Bulk senders must publish a valid DMARC policy with at least p=none, and DMARC must pass; a rua tag set up to receive reports is strongly recommended for monitoring during initial setup.
- Enforcement of the sender requirements began in February 2024.
- If a domain has p=reject, any message without a proper DKIM signature or SPF alignment is rejected by Yahoo's mail servers.

## The sample, read by the analyzer

The same made-up mail for example.com, written in Yahoo's format: 670 messages from 7 sources, 86.6% passing DMARC. The largest failing source is Amazon SES: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

| Source | IPs | Messages | Failed | Why |
| --- | --- | ---: | ---: | --- |
| Amazon SES | 54.240.8.17 | 57 | 57 | DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns. |
| Unnamed (203.0.113.9) | 203.0.113.9 | 23 | 23 | The mail was not DKIM-signed, and SPF softfail for example.com: this IP is not authorized to send as example.com. |
| Unnamed (192.0.2.44) | 192.0.2.44 | 6 | 6 | A DKIM signature for example.com did not verify (fail), and SPF did not pass for example.com. The message was probably changed on the way (forwarding, a mailing list, a security gateway) or the published key does not match. The receiver gave a reason: local\_policy: the receiver's own policy exempted it ("arc=pass"). |
| A server at Amazon Web Services (EC2) (35.174.145.124) | 35.174.145.124 | 4 | 4 | The mail was not DKIM-signed, and SPF fail for example.com: this IP is not authorized to send as example.com. |
| Google Workspace | 209.85.220.41 | 412 | 0 | Passed DMARC. |
| Microsoft 365 | 40.107.22.55 | 130 | 0 | Passed DMARC. |
| HubSpot | 149.72.134.20 | 38 | 0 | Passed DMARC. |

## Sources

- [Yahoo Sender Hub: Sender Best Practices, read November 8, 2026](https://senders.yahooinc.com/best-practices/)
- [Yahoo Sender Hub: FAQs, read November 8, 2026](https://senders.yahooinc.com/faqs/)
- [A real Yahoo report in the IETF dmarc-report archive (November 7, 2026), read November 8, 2026](https://mailarchive.ietf.org/arch/msg/dmarc-report/UYf6AxRcguu-COoPDBOZqvyaYVE/)
- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Questions

### Is the DMARC report email from Yahoo legitimate?

A real one comes from noreply@dmarc.yahoo.com, names yahoo.com as the submitter in the subject and carries yahoo.com!\<your domain\>!\<begin\>!\<end\>.xml.gz. It is sent only because your DMARC record asks for reports (rua=). Do not open other attachment types it might carry.

### How do I stop the Yahoo DMARC reports?

Remove the rua= tag (or the address in it) from your domain's DMARC TXT record at \_dmarc.\<your domain\>; RFC 9989 says receivers must not send aggregate reports when there is no rua tag. Keep it if you are still checking your senders or moving to quarantine or reject.

## Related

- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)
- [Why am I getting DMARC reports?](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/why-am-i-getting-dmarc-reports/)
- [Microsoft DMARC aggregate reports](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/microsoft/)
- [DMARC reports from Google](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/google/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/yahoo/  
Data as of: 2026-11-08
