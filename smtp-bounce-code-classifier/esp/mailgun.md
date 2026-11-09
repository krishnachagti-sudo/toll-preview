# Mailgun bounce types, mapped

Mailgun sorts bounces into 5 labels (severity permanent, bounce type hard; bounce type soft; severity permanent, reason old; severity temporary; reason espblock); 3 of them can hold a block or policy rejection or more than one verdict, so the raw SMTP reply, classed hard, soft, block or policy here, says whether to suppress the address.

- Mailgun labels: 5

## Classify a Mailgun bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=&run=1)

## Mailgun's labels

From Mailgun's Metric definitions page, read November 8, 2026; meanings paraphrased. The last column is this tool's mapping.

| Label | What it means | Raw reply can be |
| --- | --- | --- |
| severity permanent, bounce type hard | Undeliverable to an invalid address or a mailbox that does not exist; added to your suppressions automatically. | hard |
| bounce type soft | A temporary issue (outage, full mailbox, size, blocklisting, reputation); Mailgun does not retry it and does not suppress the address. | soft, block, policy |
| severity permanent, reason old | Retried the maximum number of times with temporary failures, then marked too old. | soft |
| severity temporary | A temporary failure Mailgun retries. | soft, block, policy |
| reason espblock | Counted from failed events with reason espblock. | block |

## How Mailgun handles them

- Mailgun says it treats soft bounces as permanent failures: it does not redeliver them, and the next send is attempted again.
- Hard bounces are added to the suppressions list.

## The raw reply decides

| Raw reply | Verdict | Suppress? |
| --- | --- | --- |
| `452 4.2.2 The recipient's inbox is out of storage space. Please` | soft | after-repeats |
| `550 5.7.708 Access denied, traffic not accepted from this IP` | block | no |
| `550 5.1.1 Bad destination mailbox address` | hard | now |

## When Mailgun's own labels are the better source

- You send only through Mailgun and its suppression list already acts on its labels.
- You want Mailgun's retry history: it knows how many times it tried before it gave up.

## When classifying the raw reply helps

- You send through more than one platform or your own MTA and want one rule.
- A label can hold a block or policy rejection, and you do not want to suppress customers for your own authentication or reputation problem.
- You need a reason you can store and audit: every verdict names its rule and source ($0.0005 a bounce over the API).

- [Mailgun: Metric definitions, read November 8, 2026](https://documentation.mailgun.com/docs/mailgun/user-manual/reporting/metric-definitions)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What bounce types does Mailgun use?

severity permanent, bounce type hard; bounce type soft; severity permanent, reason old; severity temporary; reason espblock (failed event severity and reason), as its documentation listed them on November 8, 2026.

### When are Mailgun's own labels the better source?

When you send only through Mailgun and its suppression list already acts on them; Mailgun sees the whole delivery history, retries included. Classify the raw reply when you need one rule across platforms, or when a label could be hiding a block or policy rejection.

## Related

- [Mailchimp bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailchimp/)
- [HubSpot bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/hubspot/)
- [MailerLite bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailerlite/)
- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)
- [Hard vs soft vs block vs policy](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailgun/  
Data as of: 2026-11-08
