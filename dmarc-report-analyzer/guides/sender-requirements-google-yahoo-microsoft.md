# Sender requirements: Google, Yahoo and Microsoft

Gmail (from February 1, 2024, for senders of more than 5,000 messages a day), Yahoo (enforcement from February 2024 for bulk senders) and Outlook.com (from May 5, 2025, for domains sending more than 5,000 a day) all require SPF and DKIM and a published DMARC record, at least p=none, with the From: domain aligned with SPF or DKIM; your aggregate reports from each show whether your mail passes.

From each provider's own page, read November 8, 2026.

| Provider | From | Who | DMARC and authentication | If not met |
| --- | --- | --- | --- | --- |
| Gmail (Google) | February 1, 2024 | More than 5,000 messages a day to Gmail accounts | SPF and DKIM; DMARC published, p=none allowed; From: aligned with SPF or DKIM; one-click unsubscribe | Mail may be marked as spam or rejected with a 5.7.26 error |
| Yahoo | February 2024, rolled out gradually (one-click unsubscribe from June 2024) | Bulk senders (judged per authenticated or From: domain) | SPF and DKIM; valid DMARC with at least p=none that passes; rua strongly recommended; relaxed alignment is acceptable | A negative impact on delivery |
| Outlook.com (Microsoft) | May 5, 2025 | Domains sending more than 5,000 emails a day to Outlook.com consumer addresses | SPF, DKIM and DMARC (at least p=none) aligned with SPF or DKIM | The same post says both junk first and reject with 550 5.7.515; verify the current behaviour |

## A minimum record

```dns
_dmarc.example.com  TXT  "v=DMARC1; p=none; rua=mailto:dmarc-reports@example.com"
```

p=none meets all three; rua= makes the reports arrive, which is how you see whether you pass. Each provider also asks for things outside DMARC (one-click unsubscribe, low spam rates, valid reverse DNS).

## How reports show you pass

- A report from Google, Yahoo or Microsoft lists your mail by sending IP; DMARC passes where policy\_evaluated has dkim or spf pass.
- Google adds local\_policy reasons such as "Sender requirement failed: 550-5.7.27" when mail missed a requirement.
- Microsoft 365 sends reports only when the receiving domain's MX points directly to it.

## Check a report from them

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## Senders below the thresholds

- Gmail requires all senders to set up SPF or DKIM; Yahoo requires SPF or DKIM at a minimum.
- Publishing DMARC at p=none with rua costs nothing and shows you who sends as your domain.

## Sources

- [Google: Email sender guidelines, read November 8, 2026](https://support.google.com/a/answer/81126?hl=en)
- [Yahoo Sender Hub: Sender Best Practices, read November 8, 2026](https://senders.yahooinc.com/best-practices/)
- [Yahoo Sender Hub: FAQs, read November 8, 2026](https://senders.yahooinc.com/faqs/)
- [Microsoft Tech Community: Outlook's new requirements for high-volume senders (posted April 2, 2025, updated April 30, 2025), read November 8, 2026](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730)
- [Microsoft Learn: Set up DMARC (updated July 17, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Related

- [Reports from Google](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/google/)
- [Reports from Yahoo](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/yahoo/)
- [Reports from Microsoft](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/microsoft/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/guides/sender-requirements-google-yahoo-microsoft/  
Data as of: 2026-11-08
