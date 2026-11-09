# Bulk sender requirements: Gmail, Yahoo and Outlook.com

Gmail applies its bulk-sender rules at about 5,000 messages a day to personal Gmail accounts (since February 1, 2024, counted per primary domain), Outlook.com at more than 5,000 a day (since May 5, 2025), and Yahoo sets no number; all three require SPF, DKIM and a DMARC record of at least p=none with the From: domain aligned, and Gmail and Yahoo add one-click unsubscribe for marketing mail and a spam rate below 0.3%.

- Gmail threshold: about 5,000 messages a day
- Outlook.com threshold: more than 5,000 a day
- Yahoo threshold: none stated
- Rules read: November 8, 2026

## Check a real message against all three

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=not-aligned)

## Who each rule applies to

Read November 8, 2026. "All senders" means the provider requires it of everyone; the others apply to bulk senders.

| Requirement | Gmail | Yahoo | Outlook.com |
| --- | --- | --- | --- |
| SPF passes | [5,000 or more messages a day](https://support.google.com/a/answer/81126?hl=en) | [Bulk senders](https://senders.yahooinc.com/best-practices/) | [More than 5,000 emails a day](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies) |
| DKIM passes | [5,000 or more messages a day](https://support.google.com/a/answer/81126?hl=en) | [Bulk senders](https://senders.yahooinc.com/best-practices/) | [More than 5,000 emails a day](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies) |
| DKIM key of 1024 bits or more | [All senders](https://support.google.com/a/answer/81126?hl=en) | [Recommended](https://senders.yahooinc.com/best-practices/) | Not stated |
| DMARC record (p=none or stricter) | [5,000 or more messages a day](https://support.google.com/a/answer/81126?hl=en) | [Bulk senders](https://senders.yahooinc.com/best-practices/) | [More than 5,000 emails a day](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies) |
| From: aligned with SPF or DKIM | [5,000 or more messages a day](https://support.google.com/a/answer/81126?hl=en) | [Bulk senders](https://senders.yahooinc.com/best-practices/) | [More than 5,000 emails a day](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies) |
| DMARC passes | Not stated | [Bulk senders](https://senders.yahooinc.com/best-practices/) | Not stated |
| Forward and reverse DNS (PTR) | [All senders](https://support.google.com/a/answer/81126?hl=en) | [All senders](https://senders.yahooinc.com/best-practices/) | [All senders](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies) |
| TLS connection | [All senders](https://support.google.com/a/answer/81126?hl=en) | Not stated | Not stated |
| RFC 5322 format | [All senders](https://support.google.com/a/answer/81126?hl=en) | [All senders](https://senders.yahooinc.com/best-practices/) | [All senders](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies) |
| One-click unsubscribe (marketing mail) | [5,000 or more messages a day](https://support.google.com/a/answer/81126?hl=en) | [Bulk senders](https://senders.yahooinc.com/best-practices/) | Not stated |
| Visible unsubscribe link in the body | [5,000 or more messages a day](https://support.google.com/a/answer/81126?hl=en) | [Bulk senders](https://senders.yahooinc.com/best-practices/) | [Recommended](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730) |
| Spam rate below 0.3% | [All senders](https://support.google.com/a/answer/81126?hl=en) | [All senders](https://senders.yahooinc.com/best-practices/) | Not stated |
| Unsubscribes honored quickly | [5,000 or more messages a day](https://support.google.com/a/answer/14229414?hl=en) | [Bulk senders](https://senders.yahooinc.com/best-practices/) | Not stated |

Gmail requires SPF or DKIM of every sender and both of bulk senders; Yahoo the same; Outlook.com requires SPF, DKIM and DMARC of domains sending more than 5,000 a day. Alignment means the From: domain matches the domain SPF or DKIM authenticated (see [DMARC alignment](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/dmarc-alignment/)).

## The three providers in one message

The three worked examples, checked by the engine

| Example | Gmail 5,000+/day | Yahoo bulk | Microsoft 5,000+/day | First failing check |
| --- | ---: | ---: | ---: | --- |
| A compliant newsletter received by Gmail | 11 of 11 | 8 of 8 | 3 of 3 | none |
| A promotion received by Outlook.com with no one-click unsubscribe | 10 of 11 | 7 of 8 | 3 of 3 | one-click unsubscribe |
| SPF and DKIM pass but DMARC fails (Gmail) | 7 of 11 | 4 of 8 | 2 of 3 | DMARC alignment |

The examples are real DKIM-signed messages on documentation domains, checked on recorded DNS. Open one in the checker to see every rule with its source.

## What one message cannot show

- Spam rate: Google reads it in Postmaster Tools, Yahoo in its own system; both set 0.3% as the line.
- Volume: whether you are over 5,000 a day.
- How fast you honor unsubscribes: Google recommends 48 hours, Yahoo requires 2 days.

- [Google: Email sender guidelines, read November 8, 2026](https://support.google.com/a/answer/81126?hl=en)
- [Google: Email sender guidelines FAQ, read November 8, 2026](https://support.google.com/a/answer/14229414?hl=en)
- [Yahoo Sender Hub: Sender Requirements & Recommendations, read November 8, 2026](https://senders.yahooinc.com/best-practices/)
- [Outlook.com Postmaster: Policies, Practices, and Guidelines, read November 8, 2026](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies)
- [Microsoft: Outlook's new requirements for high-volume senders (updated Apr 30, 2025), read November 8, 2026](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Providers also judge reputation and content, so meeting every rule does not guarantee the inbox. Spam rate, volume and unsubscribe handling cannot be judged from one message.

## Questions

### What counts as a bulk sender for Gmail?

Google's FAQ: "any email sender that sends close to 5,000 messages or more to personal Gmail accounts within a 24-hour period", counting all messages from the same primary domain; once classed as a bulk sender, always one. The guidelines page words it as more than 5,000 messages per day.

### Does Yahoo define a bulk sender volume?

No. Yahoo's Sender Hub lists requirements for all senders and for bulk senders but gives no volume figure.

### Do Microsoft's rules apply to Microsoft 365 business mailboxes?

Microsoft's announcement says the rules apply to Outlook.com, its consumer service for hotmail.com, live.com and outlook.com addresses, for domains sending more than 5,000 emails a day.

## Related

- [Gmail's rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/gmail/)
- [Yahoo's rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/yahoo/)
- [Outlook.com's rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/microsoft-outlook/)
- [One-click unsubscribe](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/one-click-unsubscribe/)
- [PTR and reverse DNS](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/ptr-reverse-dns/)
- [Black Friday sending checklist](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/bfcm-sending-checklist/)
- [vs Google Postmaster Tools](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/vs/google-postmaster/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/requirements/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/requirements.csv
