# Postmark bounce types or the classifier

Postmark labels its own bounces with 22 types (HardBounce, SoftBounce, Transient, Blocked, DMARCPolicy and others); Endwise's classifier gives any raw reply, from any platform, one of four verdicts with a rule id, at $0.0005 a bounce.

## Postmark's main types, mapped

From Postmark's Bounce API page, read November 8, 2026; meanings paraphrased. The last column is this tool's mapping.

| Type (code) | What it means | Raw reply can be |
| --- | --- | --- |
| HardBounce (1) | The server could not deliver the message, for example unknown user or mailbox not found. | hard |
| Transient (2) | Delivery was delayed for a temporary reason such as network trouble. | soft |
| SoftBounce (4096) | Temporarily undeliverable: mailbox full, account disabled, over quota, out of disk space. | soft, hard |
| DnsError (256) | A temporary DNS error. | soft |
| Blocked (100006) | Blocked by the ISP for content or blocklisting. | block |
| DMARCPolicy (100009) | Rejected because of a DMARC policy. | policy |
| BadEmailAddress (100000) | Not a valid email address. | hard |
| SpamNotification (512) | Delivered, but blocked by the user or classed as spam or bulk. | block |
| Unknown (2048) | Postmark could not classify the NDR. | soft, hard, block, policy |

## When Postmark's types are the better source

- Postmark is your only sender: its types already drive deactivation and its Bounce API returns the details.
- You want Postmark-only kinds a raw reply cannot show, such as SpamComplaint, Unsubscribe or ManuallyDeactivated.

## When the classifier fits better

- You send through several platforms or your own MTA and want one rule for all of them.
- A SoftBounce can be a full mailbox or a disabled account; the raw reply tells them apart ([mailbox full](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/mailbox-full/)).
- You want an agent to decide through MCP with the same price as the API.

## Classify a Postmark bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=smtp%3B554+delivery+error%3A+dd+This+user+doesn%27t+have+a+yahoo.com+account+%28vicelcown%40yahoo.com%29+%5B0%5D+-+mta1543.mail.ne1.yahoo.com&run=1)

- [Postmark: Bounce API, read November 8, 2026](https://postmarkapp.com/developer/api/bounce-api)

## Questions

### How many bounce types does Postmark have?

Its Bounce API page lists 22 types, each with a TypeCode, from HardBounce (1) to TemplateRenderingFailed (100010), as read November 8, 2026.

### When are Postmark's own types the better source?

When Postmark is your only sender for transactional email: it already deactivates addresses on hard bounces and keeps bounce details for your retention period (45 days by default).

## Related

- [IANA registry vs this classifier](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/vs/iana/)
- [SendGrid bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/sendgrid/)
- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/vs/postmark/  
Data as of: 2026-11-08
