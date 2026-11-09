# No such domain: 5.1.2, 5.4.4 and null MX

5 of these 6 domain-level replies are hard bounces: 5.1.2 (IANA "Bad destination system address"), 5.4.4 with class 5, 556 with a null MX and 521 mean the domain takes no mail, while 451 4.4.4 is soft because a DNS failure can clear.

## Classify your domain bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=553+5.1.2+We+weren%27t+able+to+find+the+recipient+domain&run=1)

## Six replies, classified

| Reply | Verdict | Suppress? | Rule |
| --- | --- | --- | --- |
| `553 5.1.2 We weren't able to find the recipient domain` | hard | now | `gmail-553-5-1-2` |
| `550 5.4.4 Invalid domain` | hard | now | `iana-x-4-4` |
| `451 4.4.4 Unable to route` | soft | after-repeats | `iana-x-4-4` |
| `556 5.1.10 Recipient address has null MX` | hard | now | `iana-x-1-10` |
| `521 Host does not accept mail` | hard | now | `reply-521` |
| `550 5.1.10 Recipient not found by SMTP address lookup` | hard | now | `microsoft-x-5-1-10` |

## Before you suppress

- Look for a typo in the domain (gmial.com, outlok.com): fix it and ask the person, rather than deleting them.
- An expired company domain will not come back: suppress.
- A null MX (RFC 7505) is the domain saying it never accepts mail: suppress.

> Microsoft uses 5.1.10 for "Recipient not found" (the address, not the domain); IANA registers X.1.10 for a null MX with reply code 556. Both are hard, for different reasons.

- [IANA: SMTP Enhanced Status Codes registry (updated December 6, 2024), read November 8, 2026](https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xml)
- [RFC 7504: SMTP 521 and 556 Reply Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc7504.txt)
- [Google: Gmail SMTP errors and codes (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)
- [Microsoft Learn: Email non-delivery reports and SMTP errors in Exchange Online (dated August 24, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/troubleshoot/exchange/email-delivery/ndr/non-delivery-reports-in-exchange-online)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What does 5.1.2 mean?

IANA X.1.2 is "Bad destination system address": the domain does not exist or cannot accept mail. With class 5 it is a hard bounce; check for a typo in the domain first.

### Is a temporary DNS failure a hard bounce?

No. With a 4xx reply (such as 451 4.4.4) the domain may resolve again, so it is soft.

## Related

- [553 5.1.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/553-5-1-2/)
- [550 5.4.4](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-4-4/)
- [556 5.1.10](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/556-5-1-10/)
- [Microsoft 550 5.1.10](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/550-5-1-10/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/no-such-domain/  
Data as of: 2026-11-08
