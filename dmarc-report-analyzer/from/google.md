# DMARC reports from Google

Reports from Google arrive from noreply-dmarc-support@google.com as zip (.zip holding one .xml); each one lists the mail Google's systems received claiming your domain over one UTC day, grouped by sending IP, and is sent because your domain's DMARC record has a rua= address. In Google's format, a sample for example.com reads: 670 messages from 7 sources; 90 messages (13.4%) failed DMARC from 4 sources. The largest is Amazon SES (54.240.8.17), 57 failing messages: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

- Messages in the sample: 670
- Failing sources: 4

## Read a report in Google's format

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## What a Google report looks like

From a real Google report in the IETF's public archive (dated November 7, 2026) and Google's own pages, read November 8, 2026.

| Part | Google |
| --- | --- |
| From | `noreply-dmarc-support@google.com` |
| Subject | `Report domain: <your domain> Submitter: google.com Report-ID: <id>` |
| Attachment | `google.com!<your domain>!<begin>!<end>.zip` |
| Compression | `zip (.zip holding one .xml)` |
| org\_name and email in the XML | `google.com; noreply-dmarc-support@google.com` |
| Format | `RFC 7489 style: no DMARC namespace, version 1.0; includes np` |
| Period | `One UTC day, 00:00:00 to 23:59:59` |

## Its quirks

- The attachment is a .zip, not the .xml.gz that RFC 9990 names.
- The subject says "Report domain:" with a lowercase d, where the RFC's subject format has "Domain:".
- Records carry override reasons of type local\_policy with comments such as "arc=pass" and "Sender requirement failed: 550-5.7.27".
- extra\_contact\_info points to https://support.google.com/a/answer/2466580.

## What Google says about its reports

- DMARC reports are usually sent once a day by email, to the addresses in your DMARC record's rua tag; every server that receives mail from your domain sends one.
- Depending on mail volume you can get many reports a day.
- Raw reports are XML with report metadata and one or more records; each record summarises the messages from one IP address for the period, their SPF, DKIM and DMARC results, and actions such as accepting mail that passed ARC.
- Google recommends a dedicated group or mailbox for reports, or a third-party service to read them.

## The sample, read by the analyzer

The same made-up mail for example.com, written in Google's format: 670 messages from 7 sources, 86.6% passing DMARC. The largest failing source is Amazon SES: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

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

- [Google Workspace Admin Help: About DMARC reports (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/security/about-dmarc-reports)
- [Google: Email sender guidelines, read November 8, 2026](https://support.google.com/a/answer/81126?hl=en)
- [A real Google report in the IETF dmarc-report archive (November 7, 2026), read November 8, 2026](https://mailarchive.ietf.org/arch/msg/dmarc-report/XTdi_FxNlYL_EnY60IoBXxue0A0/)
- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Questions

### Is the DMARC report email from Google legitimate?

A real one comes from noreply-dmarc-support@google.com, names google.com as the submitter in the subject and carries google.com!\<your domain\>!\<begin\>!\<end\>.zip. It is sent only because your DMARC record asks for reports (rua=). Do not open other attachment types it might carry.

### How do I stop the Google DMARC reports?

Remove the rua= tag (or the address in it) from your domain's DMARC TXT record at \_dmarc.\<your domain\>; RFC 9989 says receivers must not send aggregate reports when there is no rua tag. Keep it if you are still checking your senders or moving to quarantine or reject.

## Related

- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)
- [Why am I getting DMARC reports?](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/why-am-i-getting-dmarc-reports/)
- [Microsoft DMARC aggregate reports](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/microsoft/)
- [DMARC reports from Yahoo](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/yahoo/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/google/  
Data as of: 2026-11-08
