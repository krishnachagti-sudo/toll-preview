# 4xx deferrals: retry, slow down or stop

Retry a soft 4xx no sooner than 30 minutes apart and for at least 4 to 5 days (RFC 5321 Section 4.5.4.1), but of the 49 4xx texts Gmail and Microsoft publish, 7 are blocks and 28 are policy deferrals that keep coming back until you fix the sender.

## Classify your deferral

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=421+4.7.0+Try+again+later%2C+closing+connection&run=1)

## Five deferrals, classified

| Reply | Verdict | Suppress? | Rule |
| --- | --- | --- | --- |
| `421 4.7.0 Try again later, closing connection` | soft | after-repeats | `gmail-421-4-7-0-3` |
| `451 4.7.26 Unauthenticated email from example.com is not accepted due to domain's DMARC policy, but temporary DNS failures prevent authentication` | soft | after-repeats | `gmail-451-4-7-26` |
| `421 4.7.28 Gmail has detected an unusual rate of email` | block | no | `gmail-421-4-7-28` |
| `421 4.7.0 [TSS04] Messages temporarily deferred due to user complaints` | block | no | `yahoo-x-x` |
| `450 4.2.1 The user you are trying to contact is receiving email too quickly` | soft | after-repeats | `gmail-450-4-2-1` |

## Timing

| Who | Setting | Value |
| --- | --- | --- |
| RFC 5321 | Retry interval | at least 30 minutes (SHOULD) |
| RFC 5321 | Give-up time | generally at least 4-5 days |
| Postfix | minimal\_backoff\_time | 300s |
| Postfix | maximal\_backoff\_time | 4000s |
| Postfix | maximal\_queue\_lifetime | 5d |
| HubSpot | Pending bounce retried for | up to 72 hours, then soft bounce |

The 4xx texts by verdict: 14 soft, 7 block, 28 policy. See them all in [every provider text](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/provider-strings/).

- [RFC 5321: Simple Mail Transfer Protocol, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc5321.txt)
- [Postfix: postconf(5) configuration parameters, read November 8, 2026](https://www.postfix.org/postconf.5.html)
- [Google: Gmail SMTP errors and codes (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)
- [Microsoft Learn: Email non-delivery reports and SMTP errors in Exchange Online (dated August 24, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/troubleshoot/exchange/email-delivery/ndr/non-delivery-reports-in-exchange-online)
- [HubSpot: Email bounce types (updated October 15, 2026), read November 8, 2026](https://knowledge.hubspot.com/marketing-email/what-is-the-difference-between-a-hard-bounce-and-a-soft-bounce)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Steps

1. **Classify the reply.** A 4xx is never a hard bounce, but it can be soft (busy, full, timeout), a block (reputation, volume) or policy (authentication, TLS).
2. **Retry with spacing.** RFC 5321 Section 4.5.4.1: the retry interval SHOULD be at least 30 minutes, with more sophisticated strategies allowed.
3. **Slow down on a block.** For rate and reputation deferrals, send less and more slowly to that provider; retrying at the same speed keeps the deferral going.
4. **Fix policy deferrals first.** A 4xx about SPF, DKIM, DMARC or TLS will repeat until the setup is fixed.
5. **Give up in days, not minutes.** RFC 5321: the give-up time generally needs to be at least 4-5 days; Postfix gives up after 5 days by default.
6. **Then decide on the address.** A soft failure that lasted the whole retry window counts as one failure for that address; suppress after repeated ones.

## Questions

### How often should I retry a 4xx SMTP error?

RFC 5321 says the retry interval SHOULD be at least 30 minutes; Postfix by default waits between 300 and 4000 seconds between attempts and gives up after 5 days.

### Should I suppress an address after a 4xx?

Not after one. A 4xx means the receiver may accept it later; suppress only after repeated failures, and never for a block or policy deferral.

## Related

- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)
- [Yahoo 421 4.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/yahoo-421-4-7-0/)
- [421 4.7.0](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/421-4-7-0/)
- [Postfix dsn= lines](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/postfix-dsn-status-bounced/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/4xx-retry/  
Data as of: 2026-11-08
