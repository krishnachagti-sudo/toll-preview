# SPF pass but DMARC fail

SPF can pass and DMARC still fail because DMARC needs SPF or DKIM to pass for a domain aligned with your From: domain: in the sample, 54.240.8.17 (Amazon SES) passed SPF for us-east-1.amazonses.com and DKIM for d=amazonses.com, but neither is example.com, so the receiver reported dkim=fail and spf=fail under policy\_evaluated.

## See this row in the analyzer

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## The row

| Field | Value |
| --- | --- |
| source\_ip | 54.240.8.17 |
| count | 57 |
| policy\_evaluated dkim / spf | fail / fail |
| header\_from | example.com |
| auth\_results dkim | amazonses.com:pass |
| auth\_results spf | us-east-1.amazonses.com:pass |
| Analyzer's reason | DKIM passed for d=amazonses.com and SPF passed for us-east-1.amazonses.com, but neither is example.com, so neither aligns. |
| Fix | Set up the sender's custom DKIM so it signs with d=example.com (or a subdomain), or a custom MAIL FROM (return-path) under example.com. |

## The causes

| Pattern | Cause | Fix |
| --- | --- | --- |
| SPF auth pass, SPF aligned fail | The service uses its own bounce (MAIL FROM) domain | Set a custom MAIL FROM or return-path under your domain, or rely on DKIM |
| DKIM auth pass, DKIM aligned fail | The service signs with its own domain | Turn on custom DKIM so it signs with d=\<your domain\> |
| Both fail, DKIM for your domain fails | The message was changed in transit (forwarding, a list, a gateway) | Usually nothing; see forwarding and mailing lists |
| Passes on SPF only | No DKIM for your domain | Add DKIM: SPF breaks on every forward |

## Relaxed and strict alignment

With adkim=r and aspf=r (the defaults), a subdomain aligns with its organizational domain: mail.example.com aligns with example.com. With s (strict) the domains must match exactly. In the sample, HubSpot passes because it signs with d=example.com, even though SPF passed only for its own bounce domain.

## Sources

- [RFC 9989: DMARC (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9989.html)
- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)
- [Microsoft Learn: Set up DMARC (updated July 17, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Related

- [Find the service behind an IP](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/find-sender-from-ip/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/spf-pass-dmarc-fail/  
Data as of: 2026-11-08
