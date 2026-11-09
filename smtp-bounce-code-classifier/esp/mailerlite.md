# MailerLite bounce types, mapped

MailerLite sorts bounces into 2 labels (Hard bounce; Soft bounce); 1 of them can hold a block or policy rejection or more than one verdict, so the raw SMTP reply, classed hard, soft, block or policy here, says whether to suppress the address.

- MailerLite labels: 2

## Classify a MailerLite bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=&run=1)

## MailerLite's labels

From MailerLite's The difference between hard bounce and soft bounce page, read November 8, 2026; meanings paraphrased. The last column is this tool's mapping.

| Label | What it means | Raw reply can be |
| --- | --- | --- |
| Hard bounce | Undeliverable for a permanent reason; the subscriber is removed from the active list. | hard |
| Soft bounce | Undeliverable for a temporary reason; the subscriber stays active. | soft, block, policy |

## How MailerLite handles them

- A subscriber who soft bounces three times in a row is treated as a hard bounce and removed from active subscribers.

## The raw reply decides

| Raw reply | Verdict | Suppress? |
| --- | --- | --- |
| `452 4.2.2 The recipient's inbox is out of storage space. Please` | soft | after-repeats |
| `550 5.4.4 Invalid domain` | hard | now |
| `421 4.7.0 Try again later, closing connection` | soft | after-repeats |

## When MailerLite's own labels are the better source

- You send only through MailerLite and its suppression list already acts on its labels.
- You want MailerLite's retry history: it knows how many times it tried before it gave up.

## When classifying the raw reply helps

- You send through more than one platform or your own MTA and want one rule.
- A label can hold a block or policy rejection, and you do not want to suppress customers for your own authentication or reputation problem.
- You need a reason you can store and audit: every verdict names its rule and source ($0.0005 a bounce over the API).

- [MailerLite: The difference between hard bounce and soft bounce, read November 8, 2026](https://www.mailerlite.com/help/the-difference-between-hard-bounce-and-soft-bounce)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What bounce types does MailerLite use?

Hard bounce; Soft bounce (hard bounce / soft bounce), as its documentation listed them on November 8, 2026.

### When are MailerLite's own labels the better source?

When you send only through MailerLite and its suppression list already acts on them; MailerLite sees the whole delivery history, retries included. Classify the raw reply when you need one rule across platforms, or when a label could be hiding a block or policy rejection.

## Related

- [Salesforce Marketing Cloud bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/salesforce-marketing-cloud/)
- [Twilio SendGrid bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/sendgrid/)
- [Amazon SES bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/amazon-ses/)
- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)
- [Hard vs soft vs block vs policy](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailerlite/  
Data as of: 2026-11-08
