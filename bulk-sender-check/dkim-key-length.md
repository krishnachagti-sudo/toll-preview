# DKIM key length: 1024 or 2048 bits?

Gmail requires a DKIM key of at least 1024 bits for mail to personal Gmail accounts and recommends 2048, and Yahoo recommends at least 1024; the checker reads the key from the selector's DNS record and measures it: in the worked examples, s2026.\_domainkey.example.com is 2048 bits (pass), k1.\_domainkey.example.org is 1024 bits (pass), esp1.\_domainkey.mailer.example.net is 2048 bits (pass).

- Gmail minimum: 1024 bits
- Google recommends: 2048 bits

## Measure the key on your own message

[Show this worked example](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/?example=one-click-missing)

## The worked examples

Keys measured by the checker on the example zone

| Key | Bits | Gmail rule | What the checker says |
| --- | ---: | --- | --- |
| s2026.\_domainkey.example.com | 2048 | pass | s2026.\_domainkey.example.com is a 2048-bit RSA key: at least the 1024 bits Google requires, and the 2048 it recommends. |
| k1.\_domainkey.example.org | 1024 | pass | k1.\_domainkey.example.org is a 1024-bit RSA key: enough for Google's 1024-bit minimum; Google recommends 2048 bits. |
| esp1.\_domainkey.mailer.example.net | 2048 | pass | esp1.\_domainkey.mailer.example.net is a 2048-bit RSA key: at least the 1024 bits Google requires, and the 2048 it recommends. |

Ed25519 keys (RFC 8463) are 256 bits by design; Google's 1024-bit rule is written for RSA, so the checker flags an Ed25519-only signature for a look rather than a fail.

- [Google: Email sender guidelines, read November 8, 2026](https://support.google.com/a/answer/81126?hl=en)
- [Yahoo Sender Hub: Sender Requirements & Recommendations, read November 8, 2026](https://senders.yahooinc.com/best-practices/)
- [RFC 6376 Section 3.3.3](https://www.rfc-editor.org/rfc/rfc6376#section-3.3.3)

> Rules as published by Google, Yahoo and Microsoft and read on November 8, 2026. Providers also judge reputation and content, so meeting every rule does not guarantee the inbox. Spam rate, volume and unsubscribe handling cannot be judged from one message.

## Steps

1. **Find the selector.** The s= tag of the DKIM-Signature in a sent message names it; the key is at s.\_domainkey.d.
2. **Make a 2048-bit key under a new selector.** Most sending services have a setting for the key length; keep the old selector published while you switch.
3. **Publish and switch.** Publish the new key's TXT record (a 2048-bit key is longer than one 255-character string, so it is split into several strings in one record), then switch signing to the new selector.
4. **Retire the old key.** After mail signed with the old selector has been delivered, publish it with an empty p= (revoked) or remove it.

## Questions

### Is a 1024-bit DKIM key enough for Gmail?

Yes for the requirement: "Sending to personal Gmail accounts requires a DKIM key of 1024 bits or longer." Google recommends 2048 bits if your provider supports it.

### How is the key length measured?

From the p= value of the TXT record at selector.\_domainkey.domain: it is the RSA public key, and its modulus length is the key length. The checker decodes it with the same verifier that checks the signature.

## Related

- [Gmail's rules](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/gmail/)
- [One-click unsubscribe](https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/one-click-unsubscribe/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/bulk-sender-check/dkim-key-length/  
Data as of: 2026-11-08
