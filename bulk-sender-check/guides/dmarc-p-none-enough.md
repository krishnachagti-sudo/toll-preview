# Is DMARC p=none enough?

Yes for all 3 providers' requirements: Google says your DMARC enforcement policy "can be set to none", Yahoo asks for "a valid DMARC policy with at least p=none" that passes, and Microsoft for "At least p=none (p=reject is recommended)"; p=none still asks receivers to take no action on mail that fails, so it protects nothing against spoofing until you move to quarantine or reject.

## Check your record and alignment on a real message

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=compliant)

## The three policies

| p= | RFC 7489 says the receiver should |
| --- | --- |
| none | take no specific action on failing mail (monitor only) |
| quarantine | treat failing mail as suspicious, for example the spam folder |
| reject | reject failing mail during the SMTP transaction |

## A rollout

- Publish p=none with rua= to receive aggregate reports.
- Read the reports until every service that sends as your domain passes and aligns.
- Move to p=quarantine; pct= lets you apply it to a share of failing mail first.
- Move to p=reject. Microsoft advises moving gradually, none to quarantine to reject.

Forwarding can break SPF (the forwarder's IP is not in your record); DKIM usually survives it, which is one reason to align DKIM, not only SPF.

- [Google: Email sender guidelines, read November 8, 2026](https://support.google.com/a/answer/81126?hl=en)
- [Yahoo Sender Hub: Sender Requirements & Recommendations, read November 8, 2026](https://senders.yahooinc.com/best-practices/)
- [Outlook.com Postmaster: Policies, Practices, and Guidelines, read November 8, 2026](https://substrate.office.com/ip-domain-management-snds/postmaster/Policies)
- [Microsoft: Outlook's new requirements for high-volume senders (updated Apr 30, 2025), read November 8, 2026](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730)
- [RFC 7489 Section 6.3](https://www.rfc-editor.org/rfc/rfc7489#section-6.3)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Meeting every rule does not guarantee the inbox; spam rate, volume and unsubscribe handling cannot be judged from one message.

## Questions

### Does p=none satisfy Gmail?

Yes. Google: "Your DMARC enforcement policy can be set to none."

### Does DMARC have to pass, or just exist?

Gmail requires the record and From: alignment with SPF or DKIM; Yahoo says "DMARC must pass"; Outlook.com requires p=none at least, aligned with SPF or DKIM.

## Related

- [DMARC alignment](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/dmarc-alignment/)
- [SPF passes but DMARC fails](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/spf-passes-dmarc-fails/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/dmarc-p-none-enough/  
Data as of: 2026-11-08
