# How to read a DMARC report

Each \<record\> is one sending IP: \<count\> is the number of messages, and \<policy\_evaluated\> gives the receiver's aligned DKIM and SPF results and its action (RFC 9990 sections 3.1.1.8 and 3.1.1.9); DMARC passed if either aligned result is pass. In the sample below, 57 messages from Amazon SES (54.240.8.17) failed because dKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

## Read your own report

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## The parts of a report

From RFC 9990 section 3.1.1 (the XML schema is its Appendix A); RFC 7489 Appendix C has the same parts.

| Element | Holds | What it tells you | RFC 9990 |
| --- | --- | --- | --- |
| `report_metadata` | org\_name, email, report\_id, date\_range (begin and end in seconds since 1970, UTC) | Who sent the report and which day it covers. | 3.1.1.3 |
| `policy_published` | domain, p, sp, np, adkim, aspf, testing, discovery\_method (RFC 7489 also pct) | The DMARC record the receiver found for your domain. | 3.1.1.5 |
| `record/row` | source\_ip, count | One sending IP and how many messages it sent for this combination of results. | 3.1.1.8 |
| `row/policy_evaluated` | disposition (none, quarantine, reject; RFC 9990 adds pass), dkim, spf, reason | The DMARC verdict: aligned DKIM and aligned SPF, and what the receiver did. DMARC passes if either is pass. | 3.1.1.9 |
| `record/identifiers` | header\_from, envelope\_from, envelope\_to | The From: domain, the bounce (MAIL FROM) domain and, from some reporters, the recipient's domain. | 3.1.1.10 |
| `auth_results/dkim` | domain (d=), selector (s=), result | Every DKIM signature checked, with its raw result before alignment. | 3.1.1.12 |
| `auth_results/spf` | domain, scope (mfrom), result | The raw SPF result for the domain that was checked. | 3.1.1.13 |
| `policy_evaluated/reason` | type, comment | Why the receiver applied a different action than your policy asked. | 3.1.6 |

## Aligned results and raw results

The most common confusion: `policy_evaluated` holds the results as they relate to DMARC, so dkim and spf there are pass only when they passed for a domain aligned with your From: domain. `auth_results` holds the raw DKIM and SPF results, uninterpreted. Microsoft's guide puts it the same way: an SPF auth pass with an SPF aligned fail means the sender is authorized but not set up for DMARC.

## Policy override reasons

| type | Meaning |
| --- | --- |
| `forwarded` | the receiver thinks the message was forwarded (RFC 7489) |
| `sampled_out` | the pct tag left this message out of the policy (RFC 7489) |
| `trusted_forwarder` | it came through a forwarder the receiver trusts |
| `mailing_list` | the receiver thinks it came through a mailing list |
| `local_policy` | the receiver's own policy exempted it |
| `other` | another exception (see the comment) |
| `policy_test_mode` | your record has t=y (test mode), so the policy was applied one step lower (RFC 9990) |

## A sample, read

This report from google.com covers 2026-11-06 (UTC) for example.com: 670 messages from 7 sources; 90 messages (13.4%) failed DMARC from 4 sources. The largest is Amazon SES (54.240.8.17), 57 failing messages: DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns.

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

- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)
- [RFC 7489: DMARC (2015, now obsolete), Appendix C schema, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7489.txt)
- [Microsoft Learn: Set up DMARC (updated July 17, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Steps

1. **Check who sent it and for which day.** report\_metadata gives the reporter (org\_name, email) and date\_range in seconds since 1970, UTC.
2. **Check the policy it saw.** policy\_published is your DMARC record as the receiver found it: p, sp, np and the alignment modes.
3. **Read each record.** row/source\_ip is the sending IP and count the number of messages; policy\_evaluated gives aligned DKIM and SPF and the action taken.
4. **Find why a record failed.** If both aligned results are fail, auth\_results shows which domains DKIM and SPF passed or failed for; a pass for another domain means a missing alignment, not a forgery.
5. **Name the source.** Match the IP against the ranges your senders publish, or drop the file in the analyzer, which names it with the evidence.

## Related

- [A DMARC report example, parsed](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/dmarc-report-example/)
- [SPF pass but DMARC fail](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/spf-pass-dmarc-fail/)
- [Find the service behind an IP](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/find-sender-from-ip/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/  
Data as of: 2026-11-08
