# Salesforce Marketing Cloud bounce types, mapped

Salesforce Marketing Cloud sorts bounces into 5 labels (Hard bounce; Soft bounce; Block bounce; Technical or other bounce; Unknown bounce); 3 of them can hold a block or policy rejection or more than one verdict, so the raw SMTP reply, classed hard, soft, block or policy here, says whether to suppress the address.

- Salesforce Marketing Cloud labels: 5

## Classify a Salesforce Marketing Cloud bounce

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=&run=1)

## Salesforce Marketing Cloud's labels

From Salesforce Marketing Cloud's Bounces (bounce event extract) page, read November 8, 2026; meanings paraphrased. The last column is this tool's mapping.

| Label | What it means | Raw reply can be |
| --- | --- | --- |
| Hard bounce | One of the five BounceCategory values; the page does not define it further. | hard |
| Soft bounce | One of the five BounceCategory values; the page does not define it further. | soft |
| Block bounce | One of the five BounceCategory values; the page does not define it further. | block, policy |
| Technical or other bounce | One of the five BounceCategory values; the page does not define it further. | soft, policy |
| Unknown bounce | One of the five BounceCategory values; the page does not define it further. | soft, hard, block, policy |

## How Salesforce Marketing Cloud handles them

- The bounce event extract's BounceCategory is one of: Block bounce, Hard bounce, Soft bounce, Unknown bounce, Technical or other bounce.
- BounceSubcategoryText gives a reason such as User Unknown, Domain Unknown, Bad Address Syntax, Mailbox Full, Inactive Account, Spamblocked, Content, URL Block, Complaints, Authentication, Network Error, Server Too Busy or Data Format Error; the page does not say which category each reason belongs to.

## The raw reply decides

| Raw reply | Verdict | Suppress? |
| --- | --- | --- |
| `550 5.7.1 This message is likely unsolicited email` | block | no |
| `421 4.4.5 Server busy, try again later` | soft | after-repeats |
| `550 5.7.23 The message was rejected because of Sender Policy Framework violation` | policy | no |

## When Salesforce Marketing Cloud's own labels are the better source

- You send only through Salesforce Marketing Cloud and its suppression list already acts on its labels.
- You want Salesforce Marketing Cloud's retry history: it knows how many times it tried before it gave up.

## When classifying the raw reply helps

- You send through more than one platform or your own MTA and want one rule.
- A label can hold a block or policy rejection, and you do not want to suppress customers for your own authentication or reputation problem.
- You need a reason you can store and audit: every verdict names its rule and source ($0.0005 a bounce over the API).

- [Salesforce Marketing Cloud: Bounces (bounce event extract), read November 8, 2026](https://help.salesforce.com/s/articleView?id=mktg.mc_as_bounces.htm&language=en_US&type=5)
- [RFC 3463: Enhanced Mail System Status Codes, read November 8, 2026](https://www.rfc-editor.org/rfc/rfc3463.txt)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### What bounce types does Salesforce Marketing Cloud use?

Hard bounce; Soft bounce; Block bounce; Technical or other bounce; Unknown bounce (BounceCategory and BounceSubcategoryText), as its documentation listed them on November 8, 2026.

### When are Salesforce Marketing Cloud's own labels the better source?

When you send only through Salesforce Marketing Cloud and its suppression list already acts on them; Salesforce Marketing Cloud sees the whole delivery history, retries included. Classify the raw reply when you need one rule across platforms, or when a label could be hiding a block or policy rejection.

## Related

- [Twilio SendGrid bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/sendgrid/)
- [Amazon SES bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/amazon-ses/)
- [Mailgun bounce types](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/mailgun/)
- [When to suppress an address](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/)
- [Hard vs soft vs block vs policy](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/esp/salesforce-marketing-cloud/  
Data as of: 2026-11-08
