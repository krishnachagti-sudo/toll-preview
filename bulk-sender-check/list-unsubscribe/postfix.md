# Postfix: List-Unsubscribe-Post for one-click

Postfix does not write per-recipient unsubscribe headers itself, so your sending application must add List-Unsubscribe with a per-recipient HTTPS link and List-Unsubscribe-Post: List-Unsubscribe=One-Click; and OpenDKIM by default signs the header fields RFC 6376 lists, which include List-Unsubscribe but not List-Unsubscribe-Post (RFC 6376 predates RFC 8058), so add List-Unsubscribe-Post to SignHeaders or Gmail's one-click check fails.

## Check a message sent through Postfix

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=not-aligned)

## What it looks like when the header is not signed

From the worked example "SPF and DKIM pass but DMARC fails (Gmail)": The passing DKIM signature (d=mailer.example.net) signs List-Unsubscribe but not List-Unsubscribe-Post; RFC 8058 Section 4 requires both in h=.

```text
SignHeaders  From,Reply-To,Subject,Date,To,Cc,Resent-Date,Resent-From,Resent-To,Resent-Cc,In-Reply-To,References,List-Id,List-Help,List-Unsubscribe,List-Unsubscribe-Post,List-Subscribe,List-Post,List-Owner,List-Archive
```

That is RFC 6376 Section 5.4.1's list with List-Unsubscribe-Post added. OpenDKIM's manual: by default, the fields RFC 6376 says "SHOULD" be signed are signed.

- [RFC 8058 Section 4](https://www.rfc-editor.org/rfc/rfc8058#section-4)
- [RFC 6376 Section 5.4.1](https://www.rfc-editor.org/rfc/rfc6376#section-5.4.1)
- [OpenDKIM: opendkim.conf(5), SignHeaders, read November 8, 2026](http://www.opendkim.org/opendkim.conf.5.html)
- [Postfix: header\_checks(5), PREPEND, read November 8, 2026](https://www.postfix.org/header_checks.5.html)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Providers also judge reputation and content, so meeting every rule does not guarantee the inbox. Spam rate, volume and unsubscribe handling cannot be judged from one message.

## Steps

1. **Add the headers in your application.** For each recipient, write List-Unsubscribe: \<https://your-domain/unsub/TOKEN\> and List-Unsubscribe-Post: List-Unsubscribe=One-Click before handing the message to Postfix.
2. **Sign List-Unsubscribe-Post.** In opendkim.conf, set SignHeaders to the default list plus List-Unsubscribe-Post (OpenDKIM adds any field DKIM itself mandates).
3. **Do not use a fixed header\_checks line for it.** Postfix's header\_checks PREPEND action adds the same text to every matching message; RFC 8058 needs a URI that identifies the recipient and the list.
4. **Check a sent message.** Send to a Gmail address, copy the raw message and run the bulk sender check: the one-click row lists each RFC 8058 step.

## Related

- [One-click unsubscribe, checked](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/one-click-unsubscribe/)
- [DKIM key length](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/dkim-key-length/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/list-unsubscribe/postfix/  
Data as of: 2026-11-08
