# Microsoft Outlook.com bulk sender requirements

Since May 5, 2025, domains sending more than 5,000 emails a day to Outlook.com accounts (hotmail.com, live.com and outlook.com) must pass SPF and DKIM and publish DMARC of at least p=none aligned with SPF or DKIM; Microsoft's postmaster page says non-compliant mail goes to the Junk folder and, if issues remain, may be rejected with 550 5.7.515.

- In force since: May 5, 2025
- Bulk rules: 3
- Rules for all senders: 2
- Read: November 8, 2026

## Check a message against Microsoft (Outlook.com)'s rules

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=one-click-missing)

Scope: Outlook.com, Microsoft's consumer service for hotmail.com, live.com and outlook.com addresses. Not Microsoft 365 business mailboxes.

## More than 5,000 emails a day

Effective May 5th, 2025: domains sending more than 5,000 emails per day to Outlook.com accounts.

Microsoft (Outlook.com): More than 5,000 emails a day, since May 5, 2025

| Rule | In the provider's words | What the checker looks at | Bounce code |
| --- | --- | --- | --- |
| SPF passes | ["Must pass for the sending domain."](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies) | the receiver's SPF result, re-checked for the sending IP | 550 5.7.515 |
| DKIM passes | ["Must pass to validate email integrity and authenticity."](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies) | every DKIM signature, verified with its key | 550 5.7.515 |
| DMARC of at least p=none, aligned with SPF or DKIM | ["At least p=none (p=reject is recommended) and align with either SPF or DKIM (preferably both)"](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies) | \_dmarc TXT record at the From: domain or its organizational domain; From: domain against the passing SPF and DKIM domains | 550 5.7.515 |
| Functional, clearly visible unsubscribe link (recommended) (recommended) (marketing mail) | ["Functional Unsubscribe Links: Provide an easy, clearly visible way for recipients to opt out of further messages, particularly for marketing or bulk mail."](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730) | an unsubscribe link in the text or HTML body | none listed |

## All senders

Microsoft (Outlook.com): All senders

| Rule | In the provider's words | What the checker looks at | Bounce code |
| --- | --- | --- | --- |
| Valid reverse DNS | ["Email servers must have valid reverse DNS records."](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies) | PTR of the sending IP and its forward lookup | none listed |
| Internet email standards | ["Sender is expected to comply with all technical standards for the transmission of Internet email, as published by The Internet Society's Internet Engineering Task Force (IETF), including RFC 2821, RFC 2822, and others."](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies) | single From:, Date:, Message-ID:, no repeated headers | none listed |

## The bounce

```
550; 5.7.515 Access denied, sending domain [SendingDomain] does not meet the required authentication level.
```

The classifier's page for it: [Outlook.com 550 5.7.515](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/microsoft/550-5-7-515/). Microsoft also asks senders with a "functional unsubscribe link" for marketing or bulk mail (a recommendation in its announcement, shown as one here).

## One message, checked

The three worked examples, checked by the engine

| Example | Gmail 5,000+/day | Yahoo bulk | Microsoft 5,000+/day | First failing check |
| --- | ---: | ---: | ---: | --- |
| A compliant newsletter received by Gmail | 11 of 11 | 8 of 8 | 3 of 3 | none |
| A promotion received by Outlook.com with no one-click unsubscribe | 10 of 11 | 7 of 8 | 3 of 3 | one-click unsubscribe |
| SPF and DKIM pass but DMARC fails (Gmail) | 7 of 11 | 4 of 8 | 2 of 3 | DMARC alignment |

- [Outlook.com Postmaster: Policies, Practices, and Guidelines, read November 8, 2026](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies)
- [Microsoft: Outlook's new requirements for high-volume senders (updated Apr 30, 2025), read November 8, 2026](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Providers also judge reputation and content, so meeting every rule does not guarantee the inbox. Spam rate, volume and unsubscribe handling cannot be judged from one message.

## Questions

### What does 550 5.7.515 mean?

Outlook.com rejected the message because the sending domain "does not meet the required authentication level": SPF, DKIM and aligned DMARC for domains sending more than 5,000 a day.

### Do the Outlook.com rules cover Microsoft 365?

Microsoft's announcement applies them to Outlook.com, its consumer service supporting hotmail.com, live.com and outlook.com addresses.

### Is DMARC p=none enough for Outlook.com?

Yes for the requirement: "At least p=none (p=reject is recommended)", aligned with SPF or DKIM.

## Related

- [All three side by side](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/requirements/)
- [Gmail rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/gmail/)
- [Yahoo rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/yahoo/)
- [One-click unsubscribe](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/one-click-unsubscribe/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/microsoft-outlook/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/microsoft-outlook.csv
