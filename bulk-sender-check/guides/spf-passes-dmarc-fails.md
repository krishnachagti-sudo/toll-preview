# SPF passes but DMARC fails

DMARC needs SPF or DKIM to pass for a domain that aligns with the From: domain, so it fails when an email service authenticates with its own domain: in the worked example, SPF and DKIM both pass, but neither the DKIM domain (mailer.example.net) nor the SPF domain (mailer.example.net) is in shop.example.com's organizational domain, example.com, so the message fails DMARC and Gmail's alignment rule (bounce 4.7.32 or 5.7.32).

## See the example in the checker

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=not-aligned)

## The headers

```
Authentication-Results: mx.google.com;
       dkim=pass header.i=@mailer.example.net header.s=esp1 header.b=jmGYgMSN;
       spf=pass (google.com: domain of b-88213-55102@mailer.example.net designates 192.0.2.44 as permitted sender) smtp.mailfrom=b-88213-55102@mailer.example.net;
       dmarc=fail (p=NONE sp=NONE dis=NONE) header.from=shop.example.com
```

Not aligned: DKIM passes for mailer.example.net, which is not in the same organizational domain as shop.example.com; SPF passes for mailer.example.net, which is not in the same organizational domain as shop.example.com (relaxed alignment).

## The fix

Sign with DKIM as example.com (most services call this a custom or branded DKIM domain), or use a return-path (bounce) domain under example.com.

Relaxed alignment (the default) accepts any subdomain of your organizational domain, so a DKIM d=example.com aligns with From: news.example.com. See [ten worked pairs](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/dmarc-alignment/).

- [RFC 7489 Section 3.1](https://www.rfc-editor.org/rfc/rfc7489#section-3.1)
- [Google: Email sender guidelines, read November 8, 2026](https://support.google.com/a/answer/81126?hl=en)
- [Google: Email sender guidelines FAQ, read November 8, 2026](https://support.google.com/a/answer/14229414?hl=en)
- [Google Workspace: Gmail SMTP errors and codes (last updated 2026-10-26), read November 8, 2026](https://knowledge.workspace.google.com/admin/support/troubleshooting/gmail-smtp-errors-and-codes?hl=en)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Meeting every rule does not guarantee the inbox; spam rate, volume and unsubscribe handling cannot be judged from one message.

## Steps

1. **Find the domains.** In Authentication-Results, compare header.from with smtp.mailfrom (SPF) and header.d or header.i (DKIM).
2. **Sign with your own domain.** Turn on custom (branded) DKIM at your email service so d= is your domain or a subdomain of it.
3. **Or align the bounce domain.** Set a custom return-path (bounce) domain under your domain, with the service's SPF include on it.
4. **Recheck.** Send again and check the copy that arrived.

## Related

- [DMARC alignment](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/dmarc-alignment/)
- [Is DMARC p=none enough?](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/dmarc-p-none-enough/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/guides/spf-passes-dmarc-fails/  
Data as of: 2026-11-08
