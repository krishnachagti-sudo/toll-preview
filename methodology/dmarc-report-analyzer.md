# How the DMARC report analyzer names senders and failures

Each report is unpacked (.xml, .gz, .zip or .eml), read under RFC 9990 or RFC 7489, and every record's IP is named from the ranges 10 sending providers publish in their SPF records, measured 2026-11-07. Records are grouped by service, and each failing source gets a reason from the receiver's own verdicts.

## What does the dmarc report analyzer compute?

Given up to 50 report files, the tool reads each DMARC aggregate report and answers which services sent mail as your domain, how many messages each sent, which failed DMARC and why, with the fix. Each service is named with the evidence for the name and how sure that is. Several reports are combined by source. It can also name the service behind a list of IP addresses. Reports are read in memory and not kept.

Operations (the op field):

- `analyze`: Returns, for each report, the reporter, the format, the period, your published policy, the totals, and each source with its name, confidence, IPs, messages passed and failed, the reasons with their fixes and the records; with several reports, the combined table by source; and per file, how many reports it held.
- `identify`: Names the service behind up to 100 IP addresses from the same dated data, with the evidence and the confidence. Free.

Inputs:

- `files (analyze)`: Up to 50 files, each { name, base64 } (an .xml, .xml.gz, .zip or .eml file, at most 10 MB as sent) or { name, xml } (the report's XML as text, at most 32 MB).
- `ips (identify)`: Up to 100 IPv4 or IPv6 addresses.

Outputs:

- answer: the report's period, domain, messages and sources, how many failed, and the largest failing source with its reason
- reports: per report, the reporter (and whether it is one we know), schema, period, policy, totals, sources, errors and warnings
- sources: per source, its label, named services, confidence, IPs, messages, passed, failed, pass rate, reasons, main reason, fix and evidence
- combined: with several reports, the sources added up across reporters
- files: per file, how many reports it held and why any part was skipped; billable: the files that held a report
- rows (identify): per IP, the name, confidence, evidence and the cloud network it sits in, if any

## How is it calculated, step by step?

1. Each file is unpacked in memory: gzip, zip (at most 20 entries) and an .eml message (MIME parts at most 4 levels deep, at most 50 parts) are opened down to the XML. A report decompresses to at most 32 MB, all reports in one call to 96 MB, and a file that expands more than 250 times its size is refused as a bomb.
2. The XML is read by a small reader that refuses DOCTYPE and unknown entities, with at most 1,500,000 elements, 24 levels and 200,000 records. A root other than \<feedback\> is not a report. The namespace says the format: urn:ietf:params:xml:ns:dmarc-2.0 is RFC 9990, none (or the RFC 7489 namespace) is RFC 7489.
3. The metadata, the published policy and each record (source IP, count, disposition, the aligned DKIM and SPF verdicts, the identifiers and the raw DKIM and SPF results) are read. What real reporters do is tolerated with a warning: spaces around values, missing optional elements, the next midnight as the end time.
4. Each record's IP is named, strongest evidence first: an IP inside a range a provider publishes in its SPF record names that provider; otherwise a passing DKIM signature or SPF check for a domain the provider's own documentation names for sending names it. When more than one provider publishes the range, all are named and the confidence is shared. An IP inside a cloud network's published ranges is only a rented server there.
5. Records are grouped into sources: one per named service (all its IPs together), or one per IP when nothing names it. Sources are sorted by failed messages, then by messages.
6. Each record gets a reason from the receiver's verdicts: passed on aligned DKIM, on aligned SPF only (which a forward breaks), or both; failed because a passing signature or SPF check was for another domain (not aligned), because your own DKIM signature did not verify, because SPF returned an error, or because the IP is not authorized at all. Each reason carries its fix, and any override reason the receiver gave is quoted.
7. The answer names the period, the domain, the messages, the share that failed and the largest failing source with its reason. Several reports are combined by source name, or by IP when unnamed.

**RFC 9990 and RFC 7489.**

Both aggregate report formats are read: RFC 9990 (May 2026), with its namespace, and the older RFC 7489 Appendix C schema most reporters still send. Override reasons are read with their RFC meanings, including RFC 9990's policy\_test\_mode: forwarded, sampled\_out, trusted\_forwarder, mailing\_list, local\_policy, other, policy\_test\_mode.

**Naming a sender.**

IP ranges come from the published SPF records of 10 sending providers, measured 2026-11-07; signing and bounce domains for 6 providers come from each provider's own documentation, read 2026-11-08; cloud ranges come from Amazon Web Services (EC2) and Google Cloud. The confidence words are: high, named from one provider's published range; medium, named from a signing or bounce domain the provider documents; shared, the range is published by more than one provider; hosting, a rented server in a cloud network; not a named service; none, nothing in the dated provider data names this IP.

**Reporters.**

The report shapes of Microsoft, Google, Yahoo, Mail.ru, GMX were read from each provider's own page where it has one and from real reports in the IETF's public dmarc-report list archive, read 2026-11-08. Only the format is described; no report content is copied.

## Which edge cases does it handle?

- A file that holds no readable report is named with the reason and not charged.
- Reports from Microsoft and Mail.ru end their period at the next midnight; the period is shown as the one UTC day it covers.
- A source whose signing or bounce domain names one service but whose IP is inside another provider's published range is named by the IP; the evidence list shows both.
- An unnamed IP is not called spoofing: it may be a forwarder or a mailing list, and the fix says so.
- Mail that passes on SPF alone is flagged, because forwarding breaks SPF.
- Encrypted zip entries, compression bombs and files that are not reports are refused with a reason.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A Google report for example.com: which service fails DMARC and why**

```json
op: "analyze"
files: 1 items
```

A Google report for example.com: which service fails DMARC and why

| Result | Value |
| --- | --- |
| answer | This report from google.com covers 2026-11-06 (UTC) for example.com: 670 messages from 7 sources; 90 messages (13.4%) failed DMARC from 4 sources. The largest is Amazon SES (54.240.8.17), 57 failing messages: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns. |
| policy | p=none (monitor only) |
| messages | 670 |
| failed | 90 (4 sources) |
| largest failing source | Amazon SES |
| confidence | high |
| fix | Set up the sender's custom DKIM so it signs with d=example.com (or a subdomain), or a custom MAIL FROM (return-path) under example.com. |

**Name the services behind three IPs from a report**

```json
{
  "op": "identify",
  "ips": [
    "54.240.8.17",
    "149.72.134.20",
    "35.174.145.124"
  ]
}
```

Name the services behind three IPs from a report

| Result | Value |
| --- | --- |
| answer | 2 of 3 IPs are named from published provider ranges; 1 more is a rented server in a cloud network. |
| 54.240.8.17 | Amazon SES: named from one provider's published range |
| 149.72.134.20 | HubSpot: named from one provider's published range |
| 35.174.145.124 | not named: a rented server in a cloud network; not a named service |

## What does it not do?

- It reads aggregate (rua) reports only, not failure (ruf) reports.
- Names are inferred from published provider data; shared infrastructure can carry several companies' mail, so check before you change DNS.
- It does not look up your DNS records; it works only from what the report says.
- Reports are read in memory for the answer and are not kept.

## Where does the data come from, and how fresh is it?

The RFCs and provider pages were read on 2026-11-08. Provider IP ranges are the SPF lookup counter's measurements of 2026-11-07; the AWS and Google Cloud lists were read on 2026-11-08. Each change to the data is logged with its date.

- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)
- [RFC 9989: DMARC (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9989.html)
- [RFC 7489: DMARC (2015, now obsolete), Appendix C schema, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7489.txt)
- [Microsoft Learn: Set up DMARC (updated July 17, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure)
- [Google Workspace Admin Help: About DMARC reports (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/security/about-dmarc-reports)
- [Mail.ru Help: DMARC reports (in Russian), read November 8, 2026](https://help.mail.ru/developers/notes/rua/)
- [IETF dmarc-report list archive (real reports for ietf.org), read November 8, 2026](https://mailarchive.ietf.org/arch/browse/dmarc-report/)
- [AWS IP address ranges (ip-ranges.json, EC2), read November 8, 2026](https://docs.aws.amazon.com/vpc/latest/userguide/aws-ip-ranges.html)
- [Google Cloud IP ranges (cloud.json), read November 8, 2026](https://cloud.google.com/compute/docs/faq#find_ip_range)

The RFCs and provider pages were read on 2026-11-08. Provider IP ranges are the SPF lookup counter's measurements of 2026-11-07; the AWS and Google Cloud lists were read on 2026-11-08. Each change to the data is logged with its date.

DMARC report analyzer: sources

| Source | Edition or date | Read on |
| --- | --- | --- |
| [RFC 9990: DMARC Aggregate Reporting (May 2026)](https://www.rfc-editor.org/rfc/rfc9990.html) | see the document | 2026-11-08 |
| [RFC 9989: DMARC (May 2026)](https://www.rfc-editor.org/rfc/rfc9989.html) | see the document | 2026-11-08 |
| [RFC 7489: DMARC (2015, now obsolete), Appendix C schema](https://www.rfc-editor.org/rfc/rfc7489.txt) | see the document | 2026-11-08 |
| [Microsoft Learn: Set up DMARC (updated July 17, 2026)](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure) | see the document | 2026-11-08 |
| [Google Workspace Admin Help: About DMARC reports (last updated October 26, 2026)](https://knowledge.workspace.google.com/admin/security/about-dmarc-reports) | see the document | 2026-11-08 |
| [Mail.ru Help: DMARC reports (in Russian)](https://help.mail.ru/developers/notes/rua/) | see the document | 2026-11-08 |
| [IETF dmarc-report list archive (real reports for ietf.org)](https://mailarchive.ietf.org/arch/browse/dmarc-report/) | see the document | 2026-11-08 |
| [AWS IP address ranges (ip-ranges.json, EC2)](https://docs.aws.amazon.com/vpc/latest/userguide/aws-ip-ranges.html) | see the document | 2026-11-08 |
| [Google Cloud IP ranges (cloud.json)](https://cloud.google.com/compute/docs/faq#find_ip_range) | see the document | 2026-11-08 |

[The sources of every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests check the safe XML reader, IPv4 and IPv6 matching, naming from provider ranges, documented domains and cloud ranges, that both report formats and every reporter's shape read the same, each failure pattern's reason and fix, the worked example, combining reports and the CSV, unpacking .gz, .zip and .eml, refusing bombs and encrypted or foreign files without a charge, and the dated data.

What its test suite asserts:

- RFC 9990 and RFC 7489 reports, and the shapes of every known reporter, read to the same totals.
- Each failure pattern gets its own reason and fix; unnamed and cloud sources are not called spoofing.
- Compressed, zipped and emailed reports are unpacked in memory; bombs, encrypted and foreign files are refused and not charged.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) are linked from one page.

[Open the DMARC report analyzer tool](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/).

## Questions

### Is there any AI in the dmarc report analyzer answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the dmarc report analyzer refuse to answer?

It reads aggregate (rua) reports only, not failure (ruf) reports. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the DMARC report analyzer tool](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/dmarc-report-analyzer/  
Data as of: 2026-11-04
