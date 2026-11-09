# DMARC rua vs ruf

rua= is the address for aggregate reports, daily XML summaries per sending IP defined in RFC 9990; ruf= is the address for failure reports, near-immediate copies of the headers (and possibly content) of individual messages that failed DMARC, defined in RFC 9991. Both RFCs date from May 2026 and replace RFC 7489, and Microsoft 365 sends no failure reports at all.

|  | rua (aggregate) | ruf (failure) |
| --- | --- | --- |
| Defined in | RFC 9990 (May 2026) | RFC 9991 (May 2026), updating RFC 6591 |
| Format | XML, namespace urn:ietf:params:xml:ns:dmarc-2.0, usually gzip | An email in the Abuse Reporting Format with DMARC fields (Identity-Alignment, DKIM-Domain, ...) |
| When | Daily (or more often), one report per policy domain | Normally almost immediately after a failure |
| Holds | Counts per sending IP, aligned and raw DKIM/SPF results, the action taken | As much of the failed message's header and body as the receiver's privacy policy allows |
| Privacy | Aggregate data; some reporters include recipient domains (envelope\_to) | May contain personal data; RFC 9991 says privacy concerns have led many operators to restrict them |
| Example tag | rua=mailto:dmarc@example.com | ruf=mailto:dmarc-failures@example.com |

## Which to use

- Start with rua only: aggregate reports are what RFC 9991 itself calls the recommended mechanism for visibility.
- Add ruf only if you will act on single failures and accept the privacy load; fo= decides when failure reports are generated (0, 1, d, s in RFC 9989).
- Do not expect ruf from everyone: Microsoft 365 does not send them even if ruf= is set, and Outlook says it has no plans to.

## Sources

- [RFC 9990: DMARC Aggregate Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9990.html)
- [RFC 9991: DMARC Failure Reporting (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9991.html)
- [RFC 9989: DMARC (May 2026), read November 8, 2026](https://www.rfc-editor.org/rfc/rfc9989.html)
- [Microsoft Learn: Set up DMARC (updated July 17, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/defender-office-365/email-authentication-dmarc-configure)

## Related

- [Why am I getting DMARC reports?](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/why-am-i-getting-dmarc-reports/)
- [Reports from Microsoft](https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/from/microsoft/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/dmarc-report-analyzer/rua-vs-ruf/  
Data as of: 2026-11-08
