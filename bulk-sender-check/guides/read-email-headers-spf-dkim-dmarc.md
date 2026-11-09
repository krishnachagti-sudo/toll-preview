# Reading SPF, DKIM and DMARC in the headers

The receiver's verdict is the topmost Authentication-Results header: in the compliant worked example Gmail wrote 3 results, spf=pass, dkim=pass and dmarc=pass, and DMARC passes only when the domain after header.from= aligns with the smtp.mailfrom domain (SPF) or a passing signature's header.i or header.d domain (DKIM).

## Let the checker read them

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=compliant)

## Gmail's line

```
Authentication-Results: mx.google.com;
       dkim=pass header.i=@example.com header.s=s2026 header.b=QfKQJFCl;
       spf=pass (google.com: domain of bounces@example.com designates 203.0.113.10 as permitted sender) smtp.mailfrom=bounces@example.com;
       dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=example.com
```

## Outlook.com's line

```
Authentication-Results: spf=pass (sender IP is 198.51.100.25)
 smtp.mailfrom=bounce.example.org; dkim=pass (signature was verified)
 header.d=example.org;dmarc=pass action=none
 header.from=example.org;compauth=pass reason=100
```

Outlook.com writes no server name before the results, and adds compauth (its composite verdict).

## The fields

| Field | Meaning |
| --- | --- |
| spf=pass | The sending IP is allowed by the SPF record of the envelope domain. |
| smtp.mailfrom= | The envelope sender (Return-Path) SPF checked. |
| dkim=pass | A DKIM signature verified with the key in DNS. |
| header.i= / header.d= | The signing domain (d= of the DKIM-Signature). |
| header.s= | The selector: the key is at selector.\_domainkey.domain. |
| dmarc=pass | SPF or DKIM passed and that domain aligns with the From: domain. |
| header.from= | The domain in the visible From: line. |
| (p=NONE sp=NONE dis=NONE) | Gmail's note of the DMARC policy and what it did (dis=NONE: delivered). |

## The values

- pass: authenticated.
- fail: the record says this sender is not allowed, or the signature did not verify.
- softfail (SPF ~all): probably not allowed; most receivers accept and mark.
- neutral (SPF ?all) and none (no record): no statement.
- temperror: a DNS problem for now; permerror: a broken record (for SPF, often more than 10 lookups).

Check the SPF lookup count with the [SPF lookup counter](https://krishnachagti-sudo.github.io/toll-preview/spf-lookup-counter/).

- [RFC 7489 Section 3.1](https://www.rfc-editor.org/rfc/rfc7489#section-3.1)
- [RFC 6376](https://www.rfc-editor.org/rfc/rfc6376)
- [RFC 7208 Section 2.6](https://www.rfc-editor.org/rfc/rfc7208#section-2.6)

## Questions

### Which Authentication-Results header is the right one?

The topmost one: each receiving server adds its own above the message, so the first is the final receiver's. One lower down may come from a relay, or have been written by the sender.

### What do header.from and smtp.mailfrom mean?

header.from is the domain in the From: line people see; smtp.mailfrom is the envelope sender (Return-Path) that SPF checks. DMARC needs one passing identifier aligned with header.from.

## Related

- [Get the raw message in Gmail](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/headers/gmail/)
- [DMARC alignment](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/dmarc-alignment/)
- [SPF passes but DMARC fails](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/spf-passes-dmarc-fails/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/read-email-headers-spf-dkim-dmarc/  
Data as of: 2026-11-08
