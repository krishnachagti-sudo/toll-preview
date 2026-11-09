# When to suppress an address

Suppress hard bounces at once, soft bounces only after repeated failures (Mailchimp waits for 7 or 15, MailerLite for 3 in a row), and never block or policy rejections; record the rule and date with every suppression.

## Classify before you suppress

[Classify it](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/?text=&run=1)

## The rule table

| Who | Type | Suppress | Send again | Note |
| --- | --- | --- | --- | --- |
| This classifier | hard | Suppress now | No | The address is bad (does not exist, domain gone, null MX) |
| This classifier | soft | Only after repeated failures | Yes, with backoff | Temporary or mailbox-level (full, busy, timeout, deferral) |
| This classifier | block | No | After fixing the sender | The receiver refuses the sender (reputation, content, volume, block lists) |
| This classifier | policy | No | After fixing the setup | A rule the sending setup breaks (SPF, DKIM, DMARC, TLS, size, format, relay) |
| Mailchimp | soft | After 7 soft bounces (no activity) or 15 (with activity) | Yes | Then treated as hard and cleaned |
| MailerLite | soft | After 3 soft bounces in a row | Yes | Then removed from active subscribers |
| HubSpot | pending | Becomes a soft bounce after 72 hours of retries | Up to 72 hours | Hard bounces are dropped from marketing email |
| Mailgun | hard | Added to suppressions automatically | No | Soft bounces are not retried and not suppressed |
| Amazon SES | Permanent / General | Remove immediately (SES) | No | Transient bounces may succeed later |
| Yahoo (receiver) | 5xx | List managers should remove 5xx addresses (Yahoo) | No | This classifier keeps 5xx policy and content blocks |

## In code

```js
switch (result.suppress) {
  case 'now': suppress(address, result.rule.id); break;
  case 'after-repeats': if (++softCount[address] >= 3) suppress(address, result.rule.id); break;
  default: alertSender(result.rule.id); // block or policy: fix the sender, keep the address
}
```

The threshold of 3 is an example, not a standard. Store rule.id and the date with each suppression so you can audit or undo it. Over the API each bounce costs $0.0005, at most $29 a month.

- [Mailchimp: Soft vs. Hard Bounces, read November 8, 2026](https://mailchimp.com/help/soft-vs-hard-bounces/)
- [MailerLite: hard vs soft bounce, read November 8, 2026](https://www.mailerlite.com/help/the-difference-between-hard-bounce-and-soft-bounce)
- [HubSpot: Email bounce types, read November 8, 2026](https://knowledge.hubspot.com/marketing-email/what-is-the-difference-between-a-hard-bounce-and-a-soft-bounce)
- [Mailgun: Metric definitions, read November 8, 2026](https://documentation.mailgun.com/docs/mailgun/user-manual/reporting/metric-definitions)
- [Amazon SES: notification contents, read November 8, 2026](https://docs.aws.amazon.com/ses/latest/dg/notification-contents.html)
- [Yahoo Sender Hub: SMTP error codes, read November 8, 2026](https://senders.yahooinc.com/smtp-error-codes/)

> Verdicts follow the RFCs, the IANA registry and each provider's published texts as read on November 8, 2026; receivers change their texts without notice. Suppression is your decision: a verdict is a rule-based recommendation, not proof that an address is valid or invalid.

## Questions

### How many soft bounces before I remove an address?

There is no standard. Mailchimp converts after 7 soft bounces (15 for active contacts) and MailerLite after 3 in a row; a count within a window, such as three in a week, is a common rule of thumb.

### Should I suppress after a block or policy bounce?

No. Both are about the sender (reputation, content, authentication, setup), not the address; fix the cause and the same address usually accepts mail.

## Related

- [Hard vs soft vs block vs policy](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/hard-vs-soft-bounce/)
- [Mailbox full: soft or hard?](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/mailbox-full/)
- [4xx deferrals](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/4xx-retry/)
- [API and MCP](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/api/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/guides/suppression-rules.csv
