# "Relay access denied": what it means

554 5.7.1 is a policy rejection: Microsoft's published text "Relay Access Denied" means: the receiving server is not a destination or relay for that domain (often a wrong MX or a missing relay permission); check the recipient domain's MX and your relay settings; do not suppress.

- Verdict: policy

## Classify your relay error

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=554+5.7.1+%3Cjane%40example.org%3E%3A+Relay+access+denied&run=1)

## Three forms, one verdict

| Reply | Verdict | Rule |
| --- | --- | --- |
| `554 5.7.1 <jane@example.org>: Relay access denied` | policy | `microsoft-x-5-4-1-2` |
| `550 5.7.1 Unable to relay` | policy | `microsoft-x-5-7-1-2` |
| `550 5.4.1 Relay Access Denied` | policy | `microsoft-x-5-4-1-2` |

Microsoft documents "Relay Access Denied" with 5.4.1 (the server does not accept mail for the recipient's domain; a mail server or DNS misconfiguration) and "Unable to relay" with 5.7.1. The same words from any server get the same verdict, whatever enhanced code comes with them.

## What to check

- The recipient domain's MX records: do they point at the server that refused you?
- Your own server or app: does it need to sign in (SMTP AUTH) before relaying?
- A connector or smart host that changed: Microsoft lists 5.7.64 "TenantAttribution; Relay Access Denied" for a broken inbound connector.

- [Microsoft Learn: Email non-delivery reports and SMTP errors in Exchange Online (dated August 24, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/troubleshoot/exchange/email-delivery/ndr/non-delivery-reports-in-exchange-online)
- [IANA: SMTP Enhanced Status Codes registry (updated December 6, 2024), read November 8, 2026](https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xml)
- [RFC 5321: Simple Mail Transfer Protocol, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc5321.txt)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### Is "Relay access denied" a hard bounce?

No. It is classed policy: the receiving server is not a destination or relay for that domain, which says nothing about whether the address exists.

### What causes "Relay access denied"?

The server that answered does not accept mail for the recipient's domain from you: often a wrong or stale MX record, or a client that should authenticate (SMTP AUTH) and did not.

## Related

- [550 5.7.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-1/)
- [554 5.7.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/554-5-7-1/)
- [550 5.4.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-4-1/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-1-relaying-denied/  
Data as of: 2026-11-08
