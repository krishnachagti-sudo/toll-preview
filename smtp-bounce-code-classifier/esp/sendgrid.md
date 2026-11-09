# Twilio SendGrid bounce types, mapped

Twilio SendGrid sorts bounces into 7 labels (Invalid Address; Technical; Content; Reputation; Frequency/Volume Too High; Mailbox Unavailable; Unclassified); 6 of them can hold a block or policy rejection or more than one verdict, so the raw SMTP reply, classed hard, soft, block or policy here, says whether to suppress the address.

- Twilio SendGrid labels: 7

## Classify a Twilio SendGrid bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=&run=1)

## Twilio SendGrid's labels

From Twilio SendGrid's Bounce and Block Classifications page, read November 8, 2026; meanings paraphrased. The last column is this tool's mapping.

| Label | What it means | Raw reply can be |
| --- | --- | --- |
| Invalid Address | The address is syntactically wrong or the mailbox does not exist; SendGrid notes these are often called hard bounces. | hard |
| Technical | A technical problem on the sender's or the mailbox provider's side; SendGrid says the side is often impossible to tell from the message alone. | soft, policy |
| Content | The provider thinks the content is spam, malicious or untrustworthy. | block |
| Reputation | The provider sees reputation problems with the sending domain or IP. | block |
| Frequency/Volume Too High | The provider cannot or will not take the number of messages, or the speed they arrive. | soft, block |
| Mailbox Unavailable | A problem with one recipient's mailbox; the address is not necessarily invalid. | soft, hard |
| Unclassified | The reply was too ambiguous to place in a class. | soft, hard, block, policy |

## How Twilio SendGrid handles them

- SendGrid maps every SMTP response it receives to one of seven classifications.
- SendGrid recommends hard bounces from fewer than 5% of attempted messages.
- SendGrid says classifications change as its system and mailbox providers change.

## The raw reply decides

| Raw reply | Verdict | Suppress? |
| --- | --- | --- |
| `550 5.7.26 This email has been blocked because the sender is unauthenticated` | policy | no |
| `550 5.1.1 The email account that you tried to reach does not exist` | hard | now |
| `421 4.7.28 Gmail has detected an unusual rate of email` | block | no |

## When Twilio SendGrid's own labels are the better source

- You send only through Twilio SendGrid and its suppression list already acts on its labels.
- You want Twilio SendGrid's retry history: it knows how many times it tried before it gave up.

## When classifying the raw reply helps

- You send through more than one platform or your own MTA and want one rule.
- A label can hold a block or policy rejection, and you do not want to suppress customers for your own authentication or reputation problem.
- You need a reason you can store and audit: every verdict names its rule and source ($0.0005 a bounce over the API).

- [Twilio SendGrid: Bounce and Block Classifications, read November 8, 2026](https://www.twilio.com/docs/sendgrid/ui/analytics-and-reporting/bounce-and-block-classifications)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What bounce types does Twilio SendGrid use?

Invalid Address; Technical; Content; Reputation; Frequency/Volume Too High; Mailbox Unavailable; Unclassified (classification), as its documentation listed them on November 8, 2026.

### When are Twilio SendGrid's own labels the better source?

When you send only through Twilio SendGrid and its suppression list already acts on them; Twilio SendGrid sees the whole delivery history, retries included. Classify the raw reply when you need one rule across platforms, or when a label could be hiding a block or policy rejection.

## Related

- [Amazon SES bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/amazon-ses/)
- [Mailgun bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailgun/)
- [Mailchimp bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailchimp/)
- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)
- [Hard vs soft vs block vs policy](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/sendgrid/  
Data as of: 2026-11-08
