# Mailchimp bounce types, mapped

Mailchimp sorts bounces into 2 labels (Hard bounce; Soft bounce); 2 of them can hold a block or policy rejection or more than one verdict, so the raw SMTP reply, classed hard, soft, block or policy here, says whether to suppress the address.

- Mailchimp labels: 2

## Classify a Mailchimp bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=&run=1)

## Mailchimp's labels

From Mailchimp's Soft vs. Hard Bounces page, read November 8, 2026; meanings paraphrased. The last column is this tool's mapping.

| Label | What it means | Raw reply can be |
| --- | --- | --- |
| Hard bounce | A permanent reason, such as an address that does not exist or a server that has permanently blocked delivery; usually cleaned from the audience at once. | hard, block |
| Soft bounce | A temporary issue: full or inactive mailbox, server down, too many messages, too large, blocked content, DMARC failure, policy or anti-spam requirements. | soft, block, policy |

## How Mailchimp handles them

- Mailchimp allows 7 soft bounces for an address with no subscriber activity and up to 15 for contacts with previous activity, then treats it as a hard bounce and cleans it.
- Bounce receipts stay in email reports for 30 days after sending.

## The raw reply decides

| Raw reply | Verdict | Suppress? |
| --- | --- | --- |
| `550 5.7.1 This message is likely unsolicited email` | block | no |
| `550 5.7.509 Access denied, sending domain does not pass DMARC verification and has a DMARC policy of reject` | policy | no |
| `553 5.1.2 We weren't able to find the recipient domain` | hard | now |

## When Mailchimp's own labels are the better source

- You send only through Mailchimp and its suppression list already acts on its labels.
- You want Mailchimp's retry history: it knows how many times it tried before it gave up.

## When classifying the raw reply helps

- You send through more than one platform or your own MTA and want one rule.
- A label can hold a block or policy rejection, and you do not want to suppress customers for your own authentication or reputation problem.
- You need a reason you can store and audit: every verdict names its rule and source ($0.0005 a bounce over the API).

- [Mailchimp: Soft vs. Hard Bounces, read November 8, 2026](https://mailchimp.com/help/soft-vs-hard-bounces/)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What bounce types does Mailchimp use?

Hard bounce; Soft bounce (hard bounce / soft bounce), as its documentation listed them on November 8, 2026.

### When are Mailchimp's own labels the better source?

When you send only through Mailchimp and its suppression list already acts on them; Mailchimp sees the whole delivery history, retries included. Classify the raw reply when you need one rule across platforms, or when a label could be hiding a block or policy rejection.

## Related

- [HubSpot bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/hubspot/)
- [MailerLite bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailerlite/)
- [Salesforce Marketing Cloud bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/salesforce-marketing-cloud/)
- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)
- [Hard vs soft vs block vs policy](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailchimp/  
Data as of: 2026-11-08
