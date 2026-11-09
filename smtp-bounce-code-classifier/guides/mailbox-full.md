# Mailbox full: soft or hard?

A full mailbox (IANA X.2.2 "Mailbox full", reply code 552) is a soft bounce: retry and suppress only after repeated failures; the exception is Gmail's 552 5.2.2 for an inbox that is full and inactive, which is hard, and Microsoft's 5.2.2 is a different thing (policy: a submission quota).

## Classify your mailbox-full bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=552+5.2.2+Mailbox+full&run=1)

## Five replies, classified

| Reply | Verdict | Suppress? | Rule |
| --- | --- | --- | --- |
| `452 4.2.2 The recipient's inbox is out of storage space. Please direct the recipient to Manage files` | soft | after-repeats | `gmail-452-4-2-2` |
| `552 5.2.2 The recipient's inbox is out of storage space and inactive` | hard | now | `gmail-552-5-2-2` |
| `552 5.2.2 Mailbox full` | soft | after-repeats | `iana-x-2-2` |
| `452 4.2.2 Mailbox full` | soft | after-repeats | `iana-x-2-2` |
| `5.2.2 Submission quota exceeded` | policy | no | `microsoft-x-5-2-2` |

## How platforms treat it

| Platform | What its page says |
| --- | --- |
| Mailchimp | Lists a full mailbox as a soft-bounce reason; converts to hard after 7 soft bounces (no activity) or 15 (with activity). |
| MailerLite | Soft bounces stay active; three soft bounces in a row count as a hard bounce. |
| HubSpot | Lists "Mailbox full" (inactive or over quota for a long time) among hard-bounce reasons; also has "Mailbox misconfiguration" as a soft reason. |
| Postmark | SoftBounce (4096) includes mailbox full. |
| Amazon SES | Transient / MailboxFull. |

Rule of thumb, not a standard: count consecutive mailbox-full failures per address and suppress after a few over a week or more; see [when to suppress](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/).

- [IANA: SMTP Enhanced Status Codes registry (updated December 6, 2024), read November 8, 2026](https://www.iana.org/assignments/smtp-enhanced-status-codes/smtp-enhanced-status-codes.xml)
- [Google: Gmail SMTP errors and codes (last updated October 26, 2026), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)
- [Microsoft Learn: Email non-delivery reports and SMTP errors in Exchange Online (dated August 24, 2026), read November 8, 2026](https://learn.microsoft.com/en-us/troubleshoot/exchange/email-delivery/ndr/non-delivery-reports-in-exchange-online)
- [Mailchimp: Soft vs. Hard Bounces, read November 8, 2026](https://mailchimp.com/help/soft-vs-hard-bounces/)
- [MailerLite: hard vs soft bounce, read November 8, 2026](https://www.mailerlite.com/help/the-difference-between-hard-bounce-and-soft-bounce)
- [HubSpot: Email bounce types, read November 8, 2026](https://knowledge.hubspot.com/marketing-email/what-is-the-difference-between-a-hard-bounce-and-a-soft-bounce)
- [Postmark: bounce types, read November 8, 2026](https://postmarkapp.com/developer/api/bounce-api)
- [Amazon SES: notification contents, read November 8, 2026](https://docs.aws.amazon.com/ses/latest/dg/notification-contents.html)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### Is mailbox full a hard or soft bounce?

Soft: IANA X.2.2 "Mailbox full" is a state that can change, so retry and suppress only after repeated failures. Gmail's own text for a full and inactive account (552 5.2.2) is the exception, classed hard.

### What does Microsoft 5.2.2 mean?

Not mailbox full: Microsoft's NDR table uses 5.2.2 for "Submission quota exceeded", the sender passing a rate limit.

## Related

- [552 5.2.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/552-5-2-2/)
- [452 4.2.2](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/452-4-2-2/)
- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)
- [HubSpot bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/hubspot/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/mailbox-full/  
Data as of: 2026-11-08
