# Gmail bulk sender requirements

Google treats you as a bulk sender once you send close to 5,000 messages or more to personal Gmail accounts within 24 hours from one primary domain (its FAQ; the guidelines page says more than 5,000 a day), and the status is permanent; bulk senders must meet 13 rules, including SPF and DKIM, a DMARC record (p=none is enough), From: alignment and one-click unsubscribe, and Google says that starting November 2025 Gmail is ramping up its enforcement on non-compliant traffic.

- Bulk rules: 13
- Rules for all senders: 7
- Read: November 8, 2026

## Check a message against Gmail's rules

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=not-aligned)

Scope: Personal Gmail accounts (addresses ending in @gmail.com or @googlemail.com). Google's FAQ: the guidelines do not apply to mail sent to Google Workspace accounts.

## 5,000 or more messages a day

The guidelines page says senders who send more than 5,000 messages per day to Gmail accounts; the FAQ defines a bulk sender as one that sends close to 5,000 messages or more to personal Gmail accounts within 24 hours, counted per primary domain, and the status is permanent.

Gmail: 5,000 or more messages a day, since February 1, 2024

| Rule | In the provider's words | What the checker looks at | Bounce code |
| --- | --- | --- | --- |
| SPF passes | ["Set up SPF and DKIM email authentication for your domain."](https://support.google.com/a/answer/81126?hl=en) | the receiver's SPF result, re-checked for the sending IP | 421 4.7.27, 550 5.7.27 |
| DKIM passes | ["Set up SPF and DKIM email authentication for your domain."](https://support.google.com/a/answer/81126?hl=en) | every DKIM signature, verified with its key | 421 4.7.30, 550 5.7.30 |
| DKIM key of 1024 bits or longer | ["Sending to personal Gmail accounts requires a DKIM key of 1024 bits or longer."](https://support.google.com/a/answer/81126?hl=en) | the key length in DNS | none listed |
| DMARC record (p=none is enough) | ["Set up DMARC email authentication for your sending domain. Your DMARC enforcement policy can be set to none."](https://support.google.com/a/answer/81126?hl=en) | \_dmarc TXT record at the From: domain or its organizational domain | 421 4.7.40, 550 5.7.40 |
| From aligned with SPF or DKIM | ["For direct email, the domain in the sender's From: header must be aligned with either the SPF domain or the DKIM domain."](https://support.google.com/a/answer/81126?hl=en) | From: domain against the passing SPF and DKIM domains | 421 4.7.32, 550 5.7.32 |
| Valid forward and reverse DNS (PTR) | ["Ensure that sending domains or IPs have valid forward and reverse DNS records, also referred to as PTR records."](https://support.google.com/a/answer/81126?hl=en) | PTR of the sending IP and its forward lookup | 451 4.7.23, 550 5.7.25 |
| TLS connection | ["Use a TLS connection for transmitting email."](https://support.google.com/a/answer/81126?hl=en) | the receiving hop's Received line | 421 4.7.29, 550 5.7.29 |
| RFC 5322 format | ["Format messages according to the Internet Message Format standard, RFC 5322."](https://support.google.com/a/answer/81126?hl=en) | single From:, Date:, Message-ID:, no repeated headers | 550 5.7.1, 554 5.6.0 |
| No impersonated Gmail From: | ["Don’t impersonate Gmail From: headers."](https://support.google.com/a/answer/81126?hl=en) | a @gmail.com From: not signed by gmail.com | none listed |
| One-click unsubscribe (RFC 8058) on marketing mail (marketing mail) | ["Marketing messages and subscribed messages must support one-click unsubscribe, and include a clearly visible unsubscribe link in the message body."](https://support.google.com/a/answer/81126?hl=en) | RFC 8058 headers and their DKIM coverage | none listed |
| Visible unsubscribe link in the body of marketing mail (marketing mail) | ["Marketing messages and subscribed messages must support one-click unsubscribe, and include a clearly visible unsubscribe link in the message body."](https://support.google.com/a/answer/81126?hl=en) | an unsubscribe link in the text or HTML body | none listed |
| Spam rate below 0.3% in Postmaster Tools | ["Keep spam rates reported in Postmaster Tools below 0.30%."](https://support.google.com/a/answer/81126?hl=en) | not checkable from one message | none listed |
| Unsubscribes honored within 48 hours | ["we recommend that you fulfill unsubscribe requests within 48 hours"](https://support.google.com/a/answer/14229414?hl=en) | not checkable from one message | none listed |

## All senders

Gmail: All senders, since February 1, 2024

| Rule | In the provider's words | What the checker looks at | Bounce code |
| --- | --- | --- | --- |
| SPF or DKIM | ["Set up SPF or DKIM email authentication for your sending domains."](https://support.google.com/a/answer/81126?hl=en) | SPF or DKIM passing | 550 5.7.26 |
| DKIM key of 1024 bits or longer | ["Sending to personal Gmail accounts requires a DKIM key of 1024 bits or longer."](https://support.google.com/a/answer/81126?hl=en) | the key length in DNS | none listed |
| Valid forward and reverse DNS (PTR) | ["Ensure that sending domains or IPs have valid forward and reverse DNS records, also referred to as PTR records."](https://support.google.com/a/answer/81126?hl=en) | PTR of the sending IP and its forward lookup | 451 4.7.23, 550 5.7.25 |
| TLS connection | ["Use a TLS connection for transmitting email."](https://support.google.com/a/answer/81126?hl=en) | the receiving hop's Received line | none listed |
| Spam rate below 0.3% in Postmaster Tools | ["Keep spam rates reported in Postmaster Tools below 0.3%."](https://support.google.com/a/answer/81126?hl=en) | not checkable from one message | none listed |
| RFC 5322 format | ["Format messages according to the Internet Message Format standard, RFC 5322."](https://support.google.com/a/answer/81126?hl=en) | single From:, Date:, Message-ID:, no repeated headers | 550 5.7.1, 554 5.6.0 |
| No impersonated Gmail From: | ["Don’t impersonate Gmail From: headers."](https://support.google.com/a/answer/81126?hl=en) | a @gmail.com From: not signed by gmail.com | none listed |

## The bounce code for each rule

From Gmail's SMTP errors and codes page (4.x.x is a temporary rate limit, 5.x.x a block)

| Rule | Codes |
| --- | --- |
| SPF passes | 421 4.7.27, 550 5.7.27 |
| DKIM passes | 421 4.7.30, 550 5.7.30 |
| DMARC record (p=none is enough) | 421 4.7.40, 550 5.7.40 |
| From aligned with SPF or DKIM | 421 4.7.32, 550 5.7.32 |
| Valid forward and reverse DNS (PTR) | 451 4.7.23, 550 5.7.25 |
| TLS connection | 421 4.7.29, 550 5.7.29 |
| RFC 5322 format | 550 5.7.1, 554 5.6.0 |

Code by code, with the classifier's verdict: [550 5.7.26](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/550-5-7-26/), [550 5.7.40](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/550-5-7-40/), [421 4.7.28](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/provider/gmail/421-4-7-28/), [550 5.7.1](https://krishnachagti-sudo.github.io/toll-preview/smtp-bounce-code-classifier/code/550-5-7-1/).

## One message, checked

The three worked examples, checked by the engine

| Example | Gmail 5,000+/day | Yahoo bulk | Microsoft 5,000+/day | First failing check |
| --- | ---: | ---: | ---: | --- |
| A compliant newsletter received by Gmail | 11 of 11 | 8 of 8 | 3 of 3 | none |
| A promotion received by Outlook.com with no one-click unsubscribe | 10 of 11 | 7 of 8 | 3 of 3 | one-click unsubscribe |
| SPF and DKIM pass but DMARC fails (Gmail) | 7 of 11 | 4 of 8 | 2 of 3 | DMARC alignment |

- [Google: Email sender guidelines, read November 8, 2026](https://support.google.com/a/answer/81126?hl=en)
- [Google: Email sender guidelines FAQ, read November 8, 2026](https://support.google.com/a/answer/14229414?hl=en)
- [Google Workspace: Gmail SMTP errors and codes (last updated 2026-10-26), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Providers also judge reputation and content, so meeting every rule does not guarantee the inbox. Spam rate, volume and unsubscribe handling cannot be judged from one message.

## Questions

### When did Gmail start enforcing the bulk sender rules?

Google's guidelines apply from February 1, 2024; its FAQ adds that starting November 2025 Gmail is ramping up enforcement, with temporary and permanent rejections for messages that do not meet the requirements.

### How long must a Gmail DKIM key be?

Google: "Sending to personal Gmail accounts requires a DKIM key of 1024 bits or longer." It recommends 2048 bits.

### Does Gmail accept a mailto unsubscribe?

Google's FAQ: mailto links do not meet its one-click unsubscribe requirement; the List-Unsubscribe header must include one HTTPS URL, as RFC 8058 describes.

## Related

- [All three side by side](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/requirements/)
- [Yahoo rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/yahoo/)
- [Microsoft (Outlook.com) rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/microsoft-outlook/)
- [One-click unsubscribe](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/one-click-unsubscribe/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/gmail/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/gmail.csv
