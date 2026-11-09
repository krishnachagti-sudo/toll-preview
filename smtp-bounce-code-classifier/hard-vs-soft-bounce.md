# Hard bounce, soft bounce, block or policy

A hard bounce is a permanent failure for the address (5.X.X such as 5.1.1, "Bad destination mailbox address") and a soft bounce is temporary (4.X.X, which RFC 3463 says may succeed if sent again); of the 170 provider texts this tool matches, 28 are blocks and 108 policy rejections that should not suppress the address.

- Provider texts matched: 170

## Which one is yours?

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=&run=1)

## The four verdicts

| Verdict | When | Suppress? | Send again? | Provider texts |
| --- | --- | --- | --- | ---: |
| hard | The address is bad (does not exist, domain gone, null MX) | Suppress now | No | 16 |
| soft | Temporary or mailbox-level (full, busy, timeout, deferral) | Only after repeated failures | Yes, with backoff | 18 |
| block | The receiver refuses the sender (reputation, content, volume, block lists) | No | After fixing the sender | 28 |
| policy | A rule the sending setup breaks (SPF, DKIM, DMARC, TLS, size, format, relay) | No | After fixing the setup | 108 |

## One example of each

| Reply | Verdict | Rule |
| --- | --- | --- |
| `550 5.1.1 The email account that you tried to reach does not exist` | hard | `gmail-550-5-1-1` |
| `452 4.2.2 The recipient's inbox is out of storage space. Please` | soft | `gmail-452-4-2-2` |
| `421 4.7.0 This message is suspicious due to the very low reputation of the sending IP address` | block | `gmail-421-4-7-0-6` |
| `550 5.7.26 This email has been blocked because the sender is unauthenticated` | policy | `gmail-550-5-7-26` |

## Why two kinds are not enough

RFC 5321 gives 550 three example causes: "mailbox not found, no access, or command rejected for policy reasons". A platform that treats every 5xx as hard suppresses real customers when the real problem is the sender's authentication or reputation. HubSpot, for one, lists content, spam and policy among its hard-bounce reasons and asks you to unbounce those contacts once the cause is fixed ([how platforms label bounces](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/hubspot/)).

- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)
- [RFC 5321: Simple Mail Transfer Protocol, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc5321.txt)
- [Google: Gmail SMTP errors and codes (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)
- [Microsoft Learn: Email non-delivery reports and SMTP errors in Exchange Online (dated August 24, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/troubleshoot/exchange/email-delivery/ndr/non-delivery-reports-in-exchange-online)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What is the difference between a hard and a soft bounce?

A hard bounce is permanent for that address (it does not exist, or its domain does not); a soft bounce is temporary (mailbox full, server busy, a deferral). RFC 3463: 4.X.X "sending in the future may be successful"; 5.X.X is "not likely to be resolved by resending the message in the current form".

### What is a block bounce?

A rejection of the sender, not the address: the receiver objects to the sending IP or domain reputation, the content or the volume. Fix that; the address is probably fine.

### What is a policy bounce?

A rejection because the sending setup breaks a rule: SPF, DKIM or DMARC, TLS, message size or format, relay permissions or a quota. Fix the setup and resend.

## Related

- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)
- [Mailbox full: soft or hard?](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/mailbox-full/)
- [5.7.x codes decoded](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/5-7-codes/)
- [SMTP error codes list](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/smtp-error-codes/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce.csv
