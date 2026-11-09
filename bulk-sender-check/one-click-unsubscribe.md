# One-click unsubscribe: List-Unsubscribe-Post, checked

One-click unsubscribe (RFC 8058) needs two headers, List-Unsubscribe with one HTTPS URI and List-Unsubscribe-Post: List-Unsubscribe=One-Click, both listed in the h= tag of a DKIM signature that passes; of the 6 variants below, the engine passes 1 and fails 5, and a mailto: link alone does not count for Gmail.

- Header value: List-Unsubscribe=One-Click
- HTTPS URIs: 1
- Variants checked: 6

## Check your own message

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=one-click-missing)

## A correct pair

```
List-Unsubscribe: <https://example.com/u/7Hq2xk9Lw3>, <mailto:unsub-7Hq2xk9Lw3@example.com>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
DKIM-Signature: v=1; a=rsa-sha256; d=example.com; s=s2026;
 h=from:to:subject:date:message-id:list-unsubscribe:list-unsubscribe-post:...
```

## Six variants, checked

Each row is the compliant example changed one way (or a worked example), run through the engine

| Message | Gmail one-click | Yahoo List-Unsubscribe | Why |
| --- | --- | --- | --- |
| Both headers, HTTPS, signed (the compliant example) | pass | pass | meets RFC 8058 |
| List-Unsubscribe-Post missing | fail | accepted (mailto) | There is no List-Unsubscribe-Post header; it must be exactly "List-Unsubscribe-Post: List-Unsubscribe=One-Click". |
| List-Unsubscribe-Post: List-Unsubscribe=Yes | fail | accepted (mailto) | List-Unsubscribe-Post is "List-Unsubscribe=Yes"; RFC 8058 Section 3.1 requires the single key/value pair "List-Unsubscribe=One-Click". |
| Only a mailto: link (no List-Unsubscribe-Post) | fail | accepted (mailto) | List-Unsubscribe has only a mailto: URI; RFC 8058 requires one HTTPS URI, and Google says mailto does not meet its one-click requirement. |
| A plain http:// link | fail | accepted (mailto) | List-Unsubscribe has only a plain http:// URI; RFC 8058 requires one HTTPS URI. |
| List-Unsubscribe-Post not in the DKIM h= list | fail | fail | The passing DKIM signature (d=mailer.example.net) signs List-Unsubscribe but not List-Unsubscribe-Post; RFC 8058 Section 4 requires both in h=. |

## What the providers add

- Gmail: required for marketing and subscribed mail from senders of 5,000 or more a day, with a clearly visible unsubscribe link in the body too; mailto links do not count; fulfil unsubscribes within 48 hours (recommended).
- Yahoo: a functioning List-Unsubscribe that supports one-click for marketing and subscribed mail; POST highly recommended, mailto acceptable; a visible link in the body; honor unsubscribes within 2 days.
- Outlook.com: a functional, clearly visible unsubscribe link is recommended for marketing or bulk mail.

> The checker reads the headers only. It never calls your unsubscribe URL: a POST to it would unsubscribe the recipient.

- [RFC 8058](https://www.rfc-editor.org/rfc/rfc8058)
- [Google: Email sender guidelines, read November 8, 2026](https://support.google.com/a/answer/81126?hl=en)
- [Google: Email sender guidelines FAQ, read November 8, 2026](https://support.google.com/a/answer/14229414?hl=en)
- [Yahoo Sender Hub: Sender Requirements & Recommendations, read November 8, 2026](https://senders.yahooinc.com/best-practices/)
- [Microsoft: Outlook's new requirements for high-volume senders (updated Apr 30, 2025), read November 8, 2026](https://techcommunity.microsoft.com/blog/microsoftdefenderforoffice365blog/strengthening-email-ecosystem-outlook%E2%80%99s-new-requirements-for-high%E2%80%90volume-senders/4399730)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Providers also judge reputation and content, so meeting every rule does not guarantee the inbox. Spam rate, volume and unsubscribe handling cannot be judged from one message.

## Steps

1. **Give each recipient a link.** Make an HTTPS URL that identifies the recipient and the list with a hard-to-forge token, and that unsubscribes on a POST with no cookies, no login and no redirect (RFC 8058 Section 3.1).
2. **Add both headers.** List-Unsubscribe: \<https://your-domain/unsub/TOKEN\>, \<mailto:...\> (mailto optional) and List-Unsubscribe-Post: List-Unsubscribe=One-Click.
3. **Sign them.** Make sure your DKIM signer lists list-unsubscribe and list-unsubscribe-post in h=; many sign List-Unsubscribe by default but not List-Unsubscribe-Post.
4. **Check a real send.** Send to a Gmail or Yahoo address, copy the raw message and run it through the checker.

## Questions

### What is the exact List-Unsubscribe-Post header?

List-Unsubscribe-Post: List-Unsubscribe=One-Click. RFC 8058 Section 3.1: it "MUST contain the single key/value pair".

### Does one-click unsubscribe need DKIM?

Yes. RFC 8058 Section 4: both List-Unsubscribe and List-Unsubscribe-Post "MUST be covered by the signature and included in the h= tag of a valid DKIM-Signature header field".

### Is a mailto: List-Unsubscribe enough?

For Gmail, no: its FAQ says mailto links do not meet the one-click requirement. Yahoo accepts mailto: but highly recommends the RFC 8058 POST method.

### Is one-click unsubscribe required on transactional email?

No. Google's FAQ: one-click unsubscribe is required only for marketing and promotional messages; password resets and reservation confirmations are examples of transactional mail.

## Related

- [Postfix: add the headers](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/list-unsubscribe/postfix/)
- [Gmail's rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/gmail/)
- [Yahoo's rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/yahoo/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/one-click-unsubscribe/  
Data as of: 2026-11-08
