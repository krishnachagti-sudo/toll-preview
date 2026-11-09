# Amazon SES bounce types, mapped

Amazon SES sorts bounces into 10 labels (Undetermined / Undetermined; Permanent / General; Permanent / NoEmail; Permanent / Suppressed; Permanent / OnAccountSuppressionList; Transient / General; Transient / MailboxFull; Transient / MessageTooLarge; Transient / ContentRejected; Transient / AttachmentRejected); 5 of them can hold a block or policy rejection or more than one verdict, so the raw SMTP reply, classed hard, soft, block or policy here, says whether to suppress the address.

- Amazon SES labels: 10

## Classify a Amazon SES bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=&run=1)

## Amazon SES's labels

From Amazon SES's Amazon SNS notification contents for Amazon SES page, read November 8, 2026; meanings paraphrased. The last column is this tool's mapping.

| Label | What it means | Raw reply can be |
| --- | --- | --- |
| Undetermined / Undetermined | The provider's bounce did not say enough for SES to decide. | soft, hard, block, policy |
| Permanent / General | A hard bounce; SES says to remove the address from your list at once. | hard |
| Permanent / NoEmail | SES could not read the recipient address from the bounce. | hard |
| Permanent / Suppressed | The address is on the SES global suppression list after recent hard bounces. | hard |
| Permanent / OnAccountSuppressionList | The address is on your account-level suppression list; delivery was not tried. | hard |
| Transient / General | A general bounce; sending later may work once the cause is fixed. | soft, block, policy |
| Transient / MailboxFull | The recipient's inbox was full. | soft |
| Transient / MessageTooLarge | The message was too large. | policy |
| Transient / ContentRejected | The provider does not allow the content. | block |
| Transient / AttachmentRejected | The provider refused an attachment. | block, policy |

## How Amazon SES handles them

- SES sends bounceType Undetermined, Permanent or Transient, each with subtypes.
- SES says to remove an address immediately after a Permanent/General bounce.

## The raw reply decides

| Raw reply | Verdict | Suppress? |
| --- | --- | --- |
| `550 5.4.4 Invalid domain` | hard | now |
| `552 5.2.2 Mailbox full` | soft | after-repeats |
| `550 5.7.1 This message is likely unsolicited email` | block | no |

A reader comment on AWS's soft-bounce article reports SES labelling "550 5.4.4 Invalid domain" as a soft bounce. The classifier calls 5.4.4 with class 5 a hard bounce (IANA X.4.4 "Unable to route"), but with a 4xx reply soft: see [no such domain](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/no-such-domain/).

## When Amazon SES's own labels are the better source

- You send only through Amazon SES and its suppression list already acts on its labels.
- You want Amazon SES's retry history: it knows how many times it tried before it gave up.

## When classifying the raw reply helps

- You send through more than one platform or your own MTA and want one rule.
- A label can hold a block or policy rejection, and you do not want to suppress customers for your own authentication or reputation problem.
- You need a reason you can store and audit: every verdict names its rule and source ($0.0005 a bounce over the API).

- [Amazon SES: Amazon SNS notification contents for Amazon SES, read November 8, 2026](https://docs.aws.amazon.com/ses/latest/dg/notification-contents.html)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What bounce types does Amazon SES use?

Undetermined / Undetermined; Permanent / General; Permanent / NoEmail; Permanent / Suppressed; Permanent / OnAccountSuppressionList; Transient / General; Transient / MailboxFull; Transient / MessageTooLarge; Transient / ContentRejected; Transient / AttachmentRejected (bounceType / bounceSubType), as its documentation listed them on November 8, 2026.

### When are Amazon SES's own labels the better source?

When you send only through Amazon SES and its suppression list already acts on them; Amazon SES sees the whole delivery history, retries included. Classify the raw reply when you need one rule across platforms, or when a label could be hiding a block or policy rejection.

## Related

- [Mailgun bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailgun/)
- [Mailchimp bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailchimp/)
- [HubSpot bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/hubspot/)
- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)
- [Hard vs soft vs block vs policy](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/amazon-ses/  
Data as of: 2026-11-08
