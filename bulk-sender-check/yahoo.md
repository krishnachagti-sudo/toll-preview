# Yahoo bulk sender requirements

Yahoo asks every sender for SPF or DKIM, a spam rate below 0.3%, valid forward and reverse DNS and RFC 5321/5322 compliance, and bulk senders for 10 rules: SPF and DKIM, a DMARC policy of at least p=none that passes (relaxed alignment is fine), a working List-Unsubscribe with one-click (the RFC 8058 POST method highly recommended, mailto: accepted), a visible unsubscribe link in the body and unsubscribes honored within 2 days; Yahoo gives no volume figure for a bulk sender.

- Bulk rules: 10
- Rules for all senders: 4
- Read: November 8, 2026

## Check a message against Yahoo's rules

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=not-aligned)

Scope: Yahoo Mail domains. Yahoo does not publish a volume figure for a bulk sender.

## Bulk senders

Yahoo lists requirements for bulk senders but gives no volume threshold.

Yahoo: Bulk senders, since February 1, 2024

| Rule | In the provider's words | What the checker looks at | Bounce code |
| --- | --- | --- | --- |
| SPF passes | ["Implement both SPF & DKIM"](https://senders.yahooinc.com/best-practices/) | the receiver's SPF result, re-checked for the sending IP | none listed |
| DKIM passes | ["Implement both SPF & DKIM"](https://senders.yahooinc.com/best-practices/) | every DKIM signature, verified with its key | none listed |
| DMARC policy of at least p=none, and DMARC passes | ["Publish a valid DMARC policy with at least p=none - DMARC must pass"](https://senders.yahooinc.com/best-practices/) | \_dmarc TXT record at the From: domain or its organizational domain; alignment with a passing identifier | none listed |
| From aligned with SPF or DKIM (relaxed is fine) | ["Ensure the domain in the From: header is aligned with either the SPF domain or the DKIM domain."](https://senders.yahooinc.com/best-practices/) | From: domain against the passing SPF and DKIM domains | none listed |
| List-Unsubscribe with one-click (POST preferred, mailto accepted) (marketing mail) | ["Implement a functioning list-unsubscribe header, which supports one-click unsubscribe for marketing and subscribed messages"](https://senders.yahooinc.com/best-practices/) | List-Unsubscribe with one-click POST or mailto: | none listed |
| Visible unsubscribe link in the body (marketing mail) | ["Have a clearly visible unsubscribe link in the email body - this may direct to a preference page"](https://senders.yahooinc.com/best-practices/) | an unsubscribe link in the text or HTML body | none listed |
| Valid forward and reverse DNS | ["Have a valid forward and reverse DNS record for your sending IPs"](https://senders.yahooinc.com/best-practices/) | PTR of the sending IP and its forward lookup | none listed |
| RFC 5321 and 5322 | ["Comply with RFCs 5321 and 5322"](https://senders.yahooinc.com/best-practices/) | single From:, Date:, Message-ID:, no repeated headers | none listed |
| Unsubscribes honored within 2 days | ["Honor unsubscribes within 2 days"](https://senders.yahooinc.com/best-practices/) | not checkable from one message | none listed |
| Spam rate below 0.3% | ["Keep your spam rate below 0.3%"](https://senders.yahooinc.com/best-practices/) | not checkable from one message | none listed |

## All senders

Yahoo: All senders, since February 1, 2024

| Rule | In the provider's words | What the checker looks at | Bounce code |
| --- | --- | --- | --- |
| SPF or DKIM | ["Implement SPF or DKIM at a minimum"](https://senders.yahooinc.com/best-practices/) | SPF or DKIM passing | none listed |
| Valid forward and reverse DNS | ["Have a valid forward and reverse DNS record for your sending IPs"](https://senders.yahooinc.com/best-practices/) | PTR of the sending IP and its forward lookup | none listed |
| RFC 5321 and 5322 | ["Comply with RFCs 5321 and 5322"](https://senders.yahooinc.com/best-practices/) | single From:, Date:, Message-ID:, no repeated headers | none listed |
| Spam rate below 0.3% | ["Keep your spam rate below 0.3%"](https://senders.yahooinc.com/best-practices/) | not checkable from one message | none listed |
| DKIM key of at least 1024 bits (recommended) (recommended) | ["Authenticate every email with DKIM (Domain Keys Identified Mail) with a minimum 1024-bit key length"](https://senders.yahooinc.com/best-practices/) | the key length in DNS | none listed |

## One message, checked

The three worked examples, checked by the engine

| Example | Gmail 5,000+/day | Yahoo bulk | Microsoft 5,000+/day | First failing check |
| --- | ---: | ---: | ---: | --- |
| A compliant newsletter received by Gmail | 11 of 11 | 8 of 8 | 3 of 3 | none |
| A promotion received by Outlook.com with no one-click unsubscribe | 10 of 11 | 7 of 8 | 3 of 3 | one-click unsubscribe |
| SPF and DKIM pass but DMARC fails (Gmail) | 7 of 11 | 4 of 8 | 2 of 3 | DMARC alignment |

- [Yahoo Sender Hub: Sender Requirements & Recommendations, read November 8, 2026](https://senders.yahooinc.com/best-practices/)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Providers also judge reputation and content, so meeting every rule does not guarantee the inbox. Spam rate, volume and unsubscribe handling cannot be judged from one message.

## Questions

### Does Yahoo accept a mailto List-Unsubscribe?

Yes. Yahoo's Sender Hub: "The Post (RFC 8058) method is highly recommended" and "The mail-to: method is acceptable". Gmail does not accept mailto alone, so for both providers use RFC 8058.

### How fast must Yahoo unsubscribes be honored?

Within 2 days, per Yahoo's Sender Hub.

### What DKIM key length does Yahoo want?

Yahoo recommends authenticating every email with DKIM "with a minimum 1024-bit key length" (in its additional recommendations).

## Related

- [All three side by side](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/requirements/)
- [Gmail rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/gmail/)
- [Microsoft (Outlook.com) rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/microsoft-outlook/)
- [One-click unsubscribe](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/one-click-unsubscribe/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/yahoo/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/yahoo.csv
