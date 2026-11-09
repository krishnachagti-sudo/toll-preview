# DMARC reports from GMX

Reports from GMX arrive from noreply-dmarc@sicher.gmx.net as gzip (.xml.gz); each one lists the mail GMX's systems received claiming your domain over one UTC day, grouped by sending IP, and is sent because your domain's DMARC record has a rua= address. In GMX's format, a sample for example.com reads: 670 messages from 7 sources; 90 messages (13.4%) failed DMARC from 4 sources. The largest is Amazon SES (54.240.8.17), 57 failing messages: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

- Messages in the sample: 670
- Failing sources: 4

## Read a report in GMX's format

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=gmx)

## What a GMX report looks like

From a real GMX report in the IETF's public archive (dated November 7, 2026) and GMX's own pages, read November 8, 2026.

| Part | GMX |
| --- | --- |
| From | `GMX DMARC Report <noreply-dmarc@sicher.gmx.net>` |
| Subject | `Report Domain: <your domain> Submitter: gmx.net Report-ID: <id>` |
| Attachment | `gmx.net!<your domain>!<begin>!<end>!<unique-id>.xml.gz` |
| Compression | `gzip (.xml.gz)` |
| org\_name and email in the XML | `GMX; noreply-dmarc@sicher.gmx.net` |
| Format | `RFC 9990: namespace urn:ietf:params:xml:ns:dmarc-2.0, version 1.0, with discovery_method and testing` |
| Period | `One UTC day, 00:00:00 to 23:59:59` |

## Its quirks

- The first of these five to use the RFC 9990 namespace: parsers that expect no namespace can find no records in it.
- The filename carries RFC 9990's optional unique-id after the end time.
- discovery\_method says psl (the RFC 7489 way of finding the policy), not treewalk.

## What GMX says about its reports

- GMX recommends a DMARC policy and requires DKIM as a minimum; SPF alone is not enough.
- GMX's postmaster pages do not describe the reports it sends; the format here is read from a real report.

## The sample, read by the analyzer

The same made-up mail for example.com, written in GMX's format: 670 messages from 7 sources, 86.6% passing DMARC. The largest failing source is Amazon SES: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

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

- [GMX Postmaster: Requirements and recommendations, read November 8, 2026](https://postmaster.gmx.net/en/requirements-and-recommendations)
- [A real GMX report in the IETF dmarc-report archive (November 7, 2026), read November 8, 2026](https://mailarchive.ietf.org/arch/msg/dmarc-report/b4aYdOC_H2LePkIa3dKO3Aw9sw8/)
- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Questions

### Is the DMARC report email from GMX legitimate?

A real one comes from noreply-dmarc@sicher.gmx.net, names gmx.net as the submitter in the subject and carries gmx.net!\<your domain\>!\<begin\>!\<end\>!\<unique-id\>.xml.gz. It is sent only because your DMARC record asks for reports (rua=). Do not open other attachment types it might carry.

### How do I stop the GMX DMARC reports?

Remove the rua= tag (or the address in it) from your domain's DMARC TXT record at \_dmarc.\<your domain\>; RFC 9989 says receivers must not send aggregate reports when there is no rua tag. Keep it if you are still checking your senders or moving to quarantine or reject.

## Related

- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)
- [Why am I getting DMARC reports?](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/why-am-i-getting-dmarc-reports/)
- [Microsoft DMARC aggregate reports](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/microsoft/)
- [DMARC reports from Google](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/google/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/gmx/  
Data as of: 2026-11-08
