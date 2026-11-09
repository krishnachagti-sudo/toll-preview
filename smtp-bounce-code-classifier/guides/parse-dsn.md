# Reading a DSN (RFC 3464)

A DSN's Action field says failed, delayed, delivered, relayed or expanded (RFC 3464), its Status is the enhanced code and its Diagnostic-Code the remote reply; in the example below Status 5.7.26 and the text "sender is unauthenticated" make it a policy rejection, so the address is kept.

## Classify your DSN

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=Status%3A+5.1.1%0ADiagnostic-Code%3A+smtp%3B+550+5.1.1+The+email+account+that+you+tried+to+reach+does+not+exist&run=1)

## The parts of a bounce message

- A human-readable part: the "Mail Delivery Subsystem" text.
- A message/delivery-status part: per-message fields, then one block of fields per recipient.
- Optionally the original message or just its headers.

## An example, annotated

```
Final-Recipient: rfc822; sam@gmail.com
Action: failed
Status: 5.7.26
Remote-MTA: dns; gmail-smtp-in.l.google.com
Diagnostic-Code: smtp; 550-5.7.26 This email has been blocked because the sender is
 unauthenticated. Gmail requires all senders to authenticate with either SPF or DKIM.
```

| Field | Here | What it tells you |
| --- | --- | --- |
| Final-Recipient | `sam@gmail.com` | The address the report is about |
| Action | failed | failed: the MTA gave up; delayed: it is still trying |
| Status | `5.7.26` | IANA X.7.26: Multiple authentication checks failed |
| Remote-MTA | `gmail-smtp-in.l.google.com` | The server that answered |
| Diagnostic-Code | `smtp; 550 5.7.26 ...` | The remote server's own reply, which decides here |

The classifier reads it as: 550 5.7.26 is a policy rejection: Gmail's published text "sender is unauthenticated" means: the message passed neither SPF nor DKIM, and Gmail requires one of them; set up SPF or DKIM for the sending domain; do not suppress the recipient.

## Bounces that do not follow RFC 3464

Some servers send a plain-text bounce with no delivery-status part (Yahoo's Sender Hub shows a qmail-style "failure notice" example). The classifier still finds the reply code, the enhanced code and the provider text in plain text; a line with none of them is classed unknown and not charged.

- [RFC 3464: An Extensible Message Format for Delivery Status Notifications, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3464.txt)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)
- [Google: Gmail SMTP errors and codes (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)
- [Yahoo Sender Hub: SMTP error codes, read November 8, 2026](https://senders.yahooinc.com/smtp-error-codes/)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What are the Action values in a DSN?

failed, delayed, delivered, relayed or expanded (RFC 3464 Section 2.3.3).

### Which DSN field says why the message bounced?

Status gives the enhanced code (RFC 3463) and Diagnostic-Code the remote server's own reply; the reply text is often what tells a policy rejection from a bad address.

## Related

- [API and MCP](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/api/)
- [Postfix dsn= lines](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/postfix-dsn-status-bounced/)
- [SMTP error codes list](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/smtp-error-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/parse-dsn/  
Data as of: 2026-11-08
