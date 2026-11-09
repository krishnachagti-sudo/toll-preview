# Forwarding and mailing lists

Forwarded mail fails SPF because the forwarder's IP is not in your SPF record, and mailing lists often break DKIM by changing the subject or body, so both show as DMARC failures in your reports; in the sample, 192.0.2.44 has a DKIM signature for example.com that failed and a receiver reason of local\_policy "arc=pass", the pattern of a list or forwarder, not of a spoofer.

## Spot them in your report

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## The patterns

| In the report | Likely |
| --- | --- |
| DKIM for your domain: fail; SPF for another domain or none | A mailing list or gateway changed the message |
| DKIM for your domain: pass; SPF: fail | A plain forward: DKIM survived, so DMARC still passes |
| reason forwarded, mailing\_list or trusted\_forwarder | The receiver recognised it; RFC 7489 had forwarded, RFC 9990 keeps mailing\_list and trusted\_forwarder |
| reason local\_policy with comment arc=pass (Google) | ARC from the forwarder vouched for the original authentication |
| No DKIM at all, SPF fail for your domain | Not a forward of your signed mail: an unknown sender or a service without DKIM |

## What ARC does

ARC lets a forwarder or list record the authentication results it saw before it changed the message, so the final receiver can trust them. Outlook's requirements post says ARC "preserves the original authentication checks" for forwarded mail, and Google's reports name arc=pass as an override reason.

## What to do

- Sign everything you send with DKIM for your own domain: it is what survives a plain forward.
- Do not add forwarders' IPs to your SPF record.
- Treat a small, steady count of these failures as normal; they do not block a move to p=reject for mail you send directly.

## Sources

- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)
- [RFC 7489: DMARC (2015, now obsolete), Appendix C schema, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7489.txt)
- [Microsoft Tech Community: Outlook's new requirements for high-volume senders (posted April 2, 2025, updated April 30, 2025), read November 8, 2026](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730)
- [Microsoft Learn: Set up DMARC (updated July 17, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure)
- [A real Google report in the IETF archive (reason arc=pass), read November 8, 2026](https://mailarchive.ietf.org/arch/msg/dmarc-report/XTdi_FxNlYL_EnY60IoBXxue0A0/)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Related

- [SPF pass but DMARC fail](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/spf-pass-dmarc-fail/)
- [Find the service behind an IP](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/find-sender-from-ip/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/forwarding-mailing-lists/  
Data as of: 2026-11-08
