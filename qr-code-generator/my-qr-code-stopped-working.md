# My QR code stopped working: how to find out why

Scan it and read the link before it opens: if it is a short link on a QR vendor's domain, such as qrco.de, the code is dynamic and depends on that vendor. The vendor list on this page holds 7 vendors' redirect domains, checked on 2026-11-02.

## Which vendor owns the link?

| Vendor | Redirect domains |
| --- | --- |
| QR Code Generator PRO (qr-code-generator.com) | qrco.de, l.ead.me, q-r.to |
| QR TIGER (qrcode-tiger.com) | qr1.be |
| Hovercode (hovercode.com) | hov.to, hovqr.co, scango.to |
| QRStuff (qrstuff.com) | qrs.ly |
| QR.io (qr.io) | qr.codes |
| QRFY (qrfy.com) | qrfy.io |
| Bitly (bitly.com) | bit.ly |

Each vendor's own words on what happens when a plan ends are quoted, with dates, on [static vs dynamic QR codes](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/static-vs-dynamic/). For example, QR TIGER says: "If your plan expires, your QR codes and data will be retained for up to one year." (read 2026-11-02).

## What are my options?

- **Renew**: if many codes are already printed and the vendor still holds them, renewing is often the fastest fix.
- **Reprint with a static code**: a static code holds your link itself, so no plan can switch it off. Point it at a page on your own domain.
- **Use your own domain from now on**: if the content will change, print a static code for a page on your site and change that page, not the code.

## Make a static replacement

[Open the generator with this link](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/?type=url&url=https%3A%2F%2Fexample.com%2Fmenu)

> The checker on the tool page reports what a code holds and where it redirects today; it cannot see your account with a vendor.

## Sources

- [QR Code Generator PRO (qr-code-generator.com): policy page (read 2026-11-02)](https://www.qr-code-generator.com/blog/free-qr-code-generator-no-expiration/)
- [QR TIGER (qrcode-tiger.com): policy page (read 2026-11-02)](https://www.qrcode-tiger.com/do-free-qr-codes-expire)

## Steps

1. **Read the link.** Scan the code with your phone camera and look at the address it shows before you open it, or paste the code's image into the checker on the tool page.
2. **Match the domain.** If the address is on a QR vendor's short domain (such as qrco.de or qr1.be), the code is dynamic: it works only while that vendor forwards it.
3. **Find the cause.** For a dynamic code: a trial or plan that ended, or a deleted account. For a code that holds your own address: the page moved or the domain lapsed.
4. **Pick a fix.** Renew with the vendor if you want to keep the printed codes working, or print a new static code that holds a page on your own domain.

## Questions

### Why does my QR code say it is no longer active?

That message comes from the vendor's redirect, not from the code. A dynamic code holds a short link on the vendor's domain, and the vendor stops forwarding it when a trial or plan ends, by its own policy.

### Can I fix the printed codes without reprinting?

Only through the vendor that owns the short link, usually by renewing. The printed modules hold the vendor's link, and no one else can change where it goes.

### Will a new static code stop working too?

Not by itself: the link is in the code. It stops working only if the page it holds is moved or the domain lapses.

## Related

- [Static vs dynamic QR codes](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/static-vs-dynamic/)
- [A restaurant menu code that does not lapse](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/restaurant-menu-qr-code/)
- [Is this QR code safe?](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/is-this-qr-code-safe/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/my-qr-code-stopped-working/  
Data as of: 2026-11-02
