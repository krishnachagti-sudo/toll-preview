# HubSpot bounce types, mapped

HubSpot sorts bounces into 8 labels (Hard bounce: Unknown user; Hard bounce: Mailbox full; Hard bounce: Content; Hard bounce: Spam; Hard bounce: Policy; Soft bounce; Pending bounce; Global bounce); 4 of them can hold a block or policy rejection or more than one verdict, so the raw SMTP reply, classed hard, soft, block or policy here, says whether to suppress the address.

- HubSpot labels: 8

## Classify a HubSpot bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=&run=1)

## HubSpot's labels

From HubSpot's Email bounce types page (updated October 15, 2026), read November 8, 2026; meanings paraphrased. The last column is this tool's mapping.

| Label | What it means | Raw reply can be |
| --- | --- | --- |
| Hard bounce: Unknown user | Usually an invalid address; the contact is dropped from future marketing email. | hard |
| Hard bounce: Mailbox full | An inbox inactive or over quota for a long time; dropped from future email. | soft, hard |
| Hard bounce: Content | Something in the body or subject triggered spam filters. | block |
| Hard bounce: Spam | Content or sender reputation flagged as spam. | block |
| Hard bounce: Policy | Failed one of the recipient server's security policies, including DMARC, DKIM and SPF failures. | policy |
| Soft bounce | A temporary problem with the recipient's server or another temporary technical problem; the contact can still receive email. | soft |
| Pending bounce | A temporary technical issue; HubSpot keeps trying for up to 72 hours, then it becomes a soft bounce. | soft |
| Global bounce | A hard bounce for a permanent reason across three or more HubSpot accounts. | hard |

## How HubSpot handles them

- HubSpot drops hard-bounced contacts from future marketing email; for content, spam and policy hard bounces it suggests the contact allowlists your sending IPs and you then unbounce them.
- Pending bounces are retried for up to 72 hours.

## The raw reply decides

| Raw reply | Verdict | Suppress? |
| --- | --- | --- |
| `552 5.2.2 Mailbox full` | soft | after-repeats |
| `550 5.7.26 Unauthenticated email from example.com is not accepted due to domain's DMARC policy. Contact` | policy | no |
| `550 5.1.1 Recipient address rejected: User unknown` | hard | now |

## When HubSpot's own labels are the better source

- You send only through HubSpot and its suppression list already acts on its labels.
- You want HubSpot's retry history: it knows how many times it tried before it gave up.

## When classifying the raw reply helps

- You send through more than one platform or your own MTA and want one rule.
- A label can hold a block or policy rejection, and you do not want to suppress customers for your own authentication or reputation problem.
- You need a reason you can store and audit: every verdict names its rule and source ($0.0005 a bounce over the API).

- [HubSpot: Email bounce types, read November 8, 2026](https://knowledge.hubspot.com/marketing-email/what-is-the-difference-between-a-hard-bounce-and-a-soft-bounce)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What bounce types does HubSpot use?

Hard bounce: Unknown user; Hard bounce: Mailbox full; Hard bounce: Content; Hard bounce: Spam; Hard bounce: Policy; Soft bounce; Pending bounce; Global bounce (hard / soft / pending / global bounce, with a reason), as its documentation listed them on November 8, 2026.

### When are HubSpot's own labels the better source?

When you send only through HubSpot and its suppression list already acts on them; HubSpot sees the whole delivery history, retries included. Classify the raw reply when you need one rule across platforms, or when a label could be hiding a block or policy rejection.

## Related

- [MailerLite bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailerlite/)
- [Salesforce Marketing Cloud bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/salesforce-marketing-cloud/)
- [Twilio SendGrid bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/sendgrid/)
- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)
- [Hard vs soft vs block vs policy](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/hubspot/  
Data as of: 2026-11-08
