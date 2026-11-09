# Why am I getting DMARC reports?

You get DMARC reports because your domain's DMARC record (the TXT record at \_dmarc.\<your domain\>) has a rua= address: every receiver that supports reporting then sends a daily XML report about all mail it received claiming your domain, including spoofed and forwarded mail, even if you send none yourself (RFC 9989 rua tag; RFC 9990 section 3.1).

## See what one says

[Open this sample in the analyzer](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/?sample=google)

## Who sends them

From real reports in the IETF's public archive and each provider's pages, read November 8, 2026.

| Provider | From | Attachment |
| --- | --- | --- |
| [Microsoft](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/microsoft/) | `dmarcreport@microsoft.com` | gzip (.xml.gz) |
| [Google](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/google/) | `noreply-dmarc-support@google.com` | zip (.zip holding one .xml) |
| [Yahoo](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/yahoo/) | `noreply@dmarc.yahoo.com` | gzip (.xml.gz) |
| [Mail.ru](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/mail-ru/) | `dmarc_support@corp.mail.ru` | gzip (.xml.gz) |
| [GMX](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/gmx/) | `noreply-dmarc@sicher.gmx.net` | gzip (.xml.gz) |

## What to do with them

- Keep them while you are checking that every service sending as your domain passes DMARC, especially before moving to p=quarantine or p=reject.
- Send them to a dedicated mailbox: Google says a busy domain can get many a day.
- Read them with a tool: each is XML, one record per sending IP.
- To stop them, remove the rua= tag; with no rua, RFC 9989 says receivers must not generate aggregate reports.
- If your rua address is in another domain, that domain must publish \<your domain\>.\_report.\_dmarc.\<their domain\> with v=DMARC1, or receivers will not send there (RFC 9990 section 4).

## Sources

- [RFC 9989: DMARC (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9989.html)
- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)
- [Google Workspace Admin Help: About DMARC reports (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/security/about-dmarc-reports)
- [Microsoft Learn: Set up DMARC (updated July 17, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure)

> Source names are inferred from published provider data (each provider's SPF ranges, the signing and bounce domains its own documentation names, and the AWS and Google Cloud range lists), read on the dates shown, with the evidence listed for every name. Shared infrastructure can carry several companies' mail, so check before you change DNS. Reports you upload are read in memory and not kept.

## Questions

### I don't send email from this domain. Why do I get reports?

Reports cover all mail that claims your domain in From:, including spoofed mail and mail forwarded by others. A domain that sends nothing should publish p=reject so receivers refuse such mail.

### Why only Google (or only a few providers)?

Each receiver decides whether to send reports. Microsoft 365, for example, sends them only when the receiving domain's MX points directly to Microsoft 365, and Google says every server that receives your mail sends one when rua is set.

### Is it safe to open the attachment?

A real report is a single .xml file, usually inside .gz or .zip (RFC 9990 names .xml and .xml.gz). Any other file type inside is a warning sign. You can drop it in the analyzer instead of opening it.

## Related

- [How often reports are sent](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-often/)
- [rua vs ruf](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/rua-vs-ruf/)
- [Reports from Google](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/google/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/why-am-i-getting-dmarc-reports/  
Data as of: 2026-11-08
