# How often DMARC reports are sent

Daily: RFC 9990 describes daily (or more frequent) reports whose period typically covers one UTC day starting at 00:00 UTC, and Google, Microsoft and Mail.ru all describe their reports as daily; you get one from each receiver that saw mail claiming your domain that day, so a busy domain can get many a day, as Google notes.

Each reporter's period, from a real report it sent to the IETF's public archive (read November 8, 2026).

| Reporter | Period in the report | Report dated |
| --- | --- | --- |
| [Microsoft](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/microsoft/) | One UTC day; the end time is the next midnight (00:00:00), so periods overlap by one second | November 7, 2026 |
| [Google](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/google/) | One UTC day, 00:00:00 to 23:59:59 | November 7, 2026 |
| [Yahoo](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/yahoo/) | One UTC day, 00:00:00 to 23:59:59 | November 7, 2026 |
| [Mail.ru](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/mail-ru/) | One UTC day; the end time is the next midnight (00:00:00), so periods overlap by one second | November 6, 2026 |
| [GMX](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/gmx/) | One UTC day, 00:00:00 to 23:59:59 | November 7, 2026 |

## Why the count varies

- One report per receiver per day per policy domain: RFC 9990 requires a separate report for each DMARC policy domain.
- Only receivers that got mail claiming your domain that day report: Mail.ru says no report comes if no such mail arrived in the past day.
- Some receivers send none: Microsoft 365 sends none for domains whose MX does not point directly to it.
- Reports can be re-sent: RFC 9990 says a re-sent report keeps the same filename, so you can discard duplicates.

## Sources

- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)
- [Google Workspace Admin Help: About DMARC reports (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/security/about-dmarc-reports)
- [Microsoft Learn: Set up DMARC (updated July 17, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure)
- [Mail.ru Help: DMARC reports (in Russian), read November 8, 2026](https://help.mail.ru/developers/notes/rua/)
- [IETF dmarc-report list archive (real reports for ietf.org), read November 8, 2026](https://mailarchive.ietf.org/arch/browse/dmarc-report/)

## Related

- [Why am I getting DMARC reports?](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/why-am-i-getting-dmarc-reports/)
- [How to read a DMARC report](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-to-read-dmarc-reports/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/how-often/  
Data as of: 2026-11-08
