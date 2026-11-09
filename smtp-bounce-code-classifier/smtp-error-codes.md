# SMTP error codes, with a verdict for each

4xx replies are temporary and 5xx are permanent (RFC 5321), but 103 of the 116 5xx texts Gmail and Microsoft publish are not bad addresses: they are block, policy or soft rejections (such as Gmail 550 5.7.26) that you fix rather than suppress.

- 5xx texts that are not bad addresses: 103

## Classify your error

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=&run=1)

## Reply codes (RFC 5321, RFC 7504, RFC 4954)

| Code | Meaning | RFC | Verdict alone | Provider texts |
| --- | --- | --- | --- | ---: |
| `421` | \<domain\> Service not available, closing transmission channel | RFC 5321 | soft | 20 |
| `432` | A password transition is needed | RFC 4954 | policy | 1 |
| `450` | Requested mail action not taken: mailbox unavailable (e.g., mailbox busy or temporarily blocked for policy reasons) | RFC 5321 | soft | 4 |
| `451` | Requested action aborted: local error in processing | RFC 5321 | soft | 7 |
| `452` | Requested action not taken: insufficient system storage | RFC 5321 | soft | 2 |
| `454` | Temporary authentication failure | RFC 4954 | soft | 2 |
| `455` | Server unable to accommodate parameters | RFC 5321 | soft | 0 |
| `500` | Syntax error, command unrecognized | RFC 5321 | policy | 0 |
| `501` | Syntax error in parameters or arguments | RFC 5321 | policy | 2 |
| `502` | Command not implemented | RFC 5321 | policy | 0 |
| `503` | Bad sequence of commands | RFC 5321 | policy | 1 |
| `504` | Command parameter not implemented | RFC 5321 | policy | 1 |
| `521` | The host does not accept mail under any circumstances (used at connection opening) | RFC 7504 | hard | 0 |
| `530` | Authentication required | RFC 4954 | policy | 1 |
| `534` | Authentication mechanism is too weak | RFC 4954 | policy | 2 |
| `535` | Authentication credentials invalid | RFC 4954 | policy | 2 |
| `538` | Encryption required for requested authentication mechanism | RFC 4954 | policy | 0 |
| `550` | Requested action not taken: mailbox unavailable (e.g., mailbox not found, no access, or command rejected for policy reasons) | RFC 5321 | hard | 35 |
| `551` | User not local; please try \<forward-path\> | RFC 5321 | hard | 0 |
| `552` | Requested mail action aborted: exceeded storage allocation | RFC 5321 | soft | 3 |
| `553` | Requested action not taken: mailbox name not allowed (e.g., mailbox syntax incorrect) | RFC 5321 | hard | 3 |
| `554` | Transaction failed (or, at connection opening, "No SMTP service here") | RFC 5321 | block | 4 |
| `555` | MAIL FROM/RCPT TO parameters not recognized or not implemented | RFC 5321 | policy | 0 |
| `556` | The domain does not accept mail (reported by a relay without connecting, for example after finding a null MX) | RFC 7504 | hard | 0 |

> A reply code alone is a weak signal: a bare 550 is classed hard only because RFC 5321 gives "mailbox not found" first, and the tool marks it low confidence. When an enhanced code or a known text is present, those decide.

## Common reply and enhanced code pairs

| Code | IANA meaning | Verdict alone | Texts |
| --- | --- | --- | --- |
| [550 5.1.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-1-1/) | Bad destination mailbox address | hard | 2 (hard) |
| [550 5.7.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-1/) | Delivery not authorized, message refused | block | 12 (policy, block) |
| [554 5.7.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/554-5-7-1/) | Delivery not authorized, message refused | block | 3 (policy) |
| [421 4.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/421-4-7-0/) | Other or undefined security status | block | 8 (soft, block, policy) |
| [550 5.4.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-4-1/) | No answer from host | soft | 1 (hard) |
| [452 4.2.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/452-4-2-2/) | Mailbox full | soft | 1 (soft) |
| [552 5.2.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/552-5-2-2/) | Mailbox full | soft | 2 (hard, policy) |
| [550 5.2.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-2-1/) | Mailbox disabled, not accepting messages | hard | 2 (hard, soft) |
| [553 5.1.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/553-5-1-2/) | Bad destination system address | hard | 1 (hard) |
| [553 5.1.3](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/553-5-1-3/) | Bad destination mailbox address syntax | hard | 1 (hard) |
| [450 4.2.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/450-4-2-1/) | Mailbox disabled, not accepting messages | soft | 2 (soft, policy) |
| [451 4.3.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/451-4-3-0/) | Other or undefined mail system status | soft | 2 (soft, policy) |
| [421 4.3.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/421-4-3-0/) | Other or undefined mail system status | soft | 1 (soft) |
| [451 4.4.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/451-4-4-2/) | Bad connection | soft | 1 (soft) |
| [421 4.4.5](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/421-4-4-5/) | Mail system congestion | soft | 1 (soft) |
| [452 4.5.3](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/452-4-5-3/) | Too many recipients | policy | 2 (policy) |
| [552 5.3.4](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/552-5-3-4/) | Message too big for system | policy | 1 (policy) |
| [550 5.4.5](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-4-5/) | Mail system congestion | soft | 1 (policy) |
| [554 5.4.6](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/554-5-4-6/) | Routing loop detected | policy | 2 (policy) |
| [503 5.5.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/503-5-5-1/) | Invalid command | policy | 1 (policy) |
| [501 5.5.4](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/501-5-5-4/) | Invalid command arguments | policy | 1 (policy) |
| [554 5.6.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/554-5-6-0/) | Other or undefined media error | policy | 1 (policy) |
| [550 5.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-0/) | Other or undefined security status | block | 3 (policy, block) |
| [530 5.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/530-5-7-0/) | Other or undefined security status | policy | 1 (policy) |
| [552 5.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/552-5-7-0/) | Other or undefined security status | block | 1 (block) |
| [550 5.7.23](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-23/) | SPF validation failed | policy | 1 (policy) |
| [550 5.7.24](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-24/) | SPF validation error | policy | 1 (policy) |
| [550 5.7.25](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-25/) | Reverse DNS validation failed | policy | 2 (policy) |
| [550 5.7.27](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-27/) | Sender address has null MX | policy | 1 (policy) |
| [550 5.7.28](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-28/) | Mail flood detected | block | 1 (block) |
| [550 5.7.29](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-29/) | ARC validation failure | policy | 1 (policy) |
| [550 5.7.30](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-30/) | REQUIRETLS support required | policy | 1 (policy) |
| [535 5.7.8](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/535-5-7-8/) | Authentication credentials invalid | policy | 0 |
| [550 5.1.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-1-0/) | Other address status | hard | 1 (hard) |
| [550 5.4.4](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-4-4/) | Unable to route | hard | 0 |
| [553 5.1.7](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/553-5-1-7/) | Bad sender's mailbox address syntax | policy | 1 (policy) |
| [556 5.1.10](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/556-5-1-10/) | Recipient address has null MX | hard | 1 (hard) |
| [550 5.5.3](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-5-3/) | Too many recipients | policy | 1 (policy) |
| [451 4.7.24](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/451-4-7-24/) | SPF validation error | policy | 1 (policy) |

## What each verdict means

| Verdict | When | Suppress? | Send again? |
| --- | --- | --- | --- |
| hard | The address is bad (does not exist, domain gone, null MX) | Suppress now | No |
| soft | Temporary or mailbox-level (full, busy, timeout, deferral) | Only after repeated failures | Yes, with backoff |
| block | The receiver refuses the sender (reputation, content, volume, block lists) | No | After fixing the sender |
| policy | A rule the sending setup breaks (SPF, DKIM, DMARC, TLS, size, format, relay) | No | After fixing the setup |

- [RFC 5321: Simple Mail Transfer Protocol, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc5321.txt)
- [RFC 7504: SMTP 521 and 556 Reply Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7504.txt)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)
- [IANA: SMTP Enhanced Status Codes registry (updated December 6, 2024), read November 8, 2026](https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xml)
- [Google: Gmail SMTP errors and codes (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)
- [Microsoft Learn: Email non-delivery reports and SMTP errors in Exchange Online (dated August 24, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/troubleshoot/exchange/email-delivery/ndr/non-delivery-reports-in-exchange-online)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### Is every 5xx SMTP error a hard bounce?

No. 103 of the 116 5xx texts in Gmail's and Microsoft's tables are block, policy or soft rejections; only a bad address (such as 5.1.1, 5.1.2 or 5.1.10 at Microsoft) is hard.

### Is a 4xx SMTP error a hard bounce?

No. RFC 5321 calls 4yz a transient negative completion: the error condition is temporary and the action may be requested again.

## Related

- [Every IANA enhanced status code](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/enhanced-status-codes/)
- [Hard vs soft vs block vs policy](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/)
- [Postfix dsn= values](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/postfix-dsn-status-bounced/)
- [Relay access denied](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-1-relaying-denied/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/smtp-error-codes/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/smtp-error-codes.csv
