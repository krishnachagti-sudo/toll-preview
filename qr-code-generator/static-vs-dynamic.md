# Static and dynamic QR codes: which ones can stop working

A static QR code holds your link or details in its own modules, so it never expires; a dynamic code holds a short link on a vendor's domain (such as qrco.de or qr1.be) and works only while that vendor forwards it.

## What each vendor says

Each domain below was checked on 2026-11-02 by resolving it, and each quote is from the vendor's own page on the date shown. Policies change; this is not a prediction of what a vendor will do with a given code.

| Vendor | Redirect domains | Published policy (date read) |
| --- | --- | --- |
| QR Code Generator PRO (qr-code-generator.com) | qrco.de, l.ead.me, q-r.to | "the redirect that powers it stops routing scans to your page." (2026-11-02) |
| QR TIGER (qrcode-tiger.com) | qr1.be | "If your plan expires, your QR codes and data will be retained for up to one year." (2026-11-02) |
| Hovercode (hovercode.com) | hov.to, hovqr.co, scango.to | "Your first 3 dynamic QR codes, first 3 short links, and first multi-link page stay active." (2026-11-02) |
| QRStuff (qrstuff.com) | qrs.ly | "The code itself stays valid as long as your plan keeps the redirect active." (2026-11-02) |
| QR.io (qr.io) | qr.codes | "Static QR Codes will continue to work after the free trial expires." (2026-11-02) |
| QRFY (qrfy.com) | qrfy.io | No published policy read |
| Bitly (bitly.com) | bit.ly | No published policy read |

## A static link still needs its website

A static code that holds https://example.com/menu keeps saying that forever. If the menu page moves or the domain lapses, the code leads nowhere. Point printed codes at a page on a domain you control.

## Please read

- A static code stores your content directly and has no expiry, but it only works while its destination (website, form, network) exists.
- Test-scan every code at its final print size before a print run.
- Expiry check: this reports what the code encodes and where it redirects today, plus the vendor's published policy on the date shown; it cannot see your account or promise what a vendor will do. Vendor policies are quoted from the vendor's own pages on the date shown and can change; we are not affiliated with any vendor named.
- WiFi codes: phone support varies, especially for enterprise (WPA2-EAP) fields; test with the phones your guests use.
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## Sources

- [QR Code Generator PRO (qr-code-generator.com): policy page (read 2026-11-02)](https://www.qr-code-generator.com/blog/free-qr-code-generator-no-expiration/)
- [QR TIGER (qrcode-tiger.com): policy page (read 2026-11-02)](https://www.qrcode-tiger.com/do-free-qr-codes-expire)
- [Hovercode (hovercode.com): policy page (read 2026-11-02)](https://hovercode.com/pricing/)
- [QRStuff (qrstuff.com): policy page (read 2026-11-02)](https://www.qrstuff.com/dynamic-qr-code)
- [QR.io (qr.io): policy page (read 2026-11-02)](https://qr.io/pricing)
- [DENSO WAVE FAQ: no licence needed to use QR Code; trademark notice (read 2026-11-02)](https://www.qrcode.com/en/faq.html)

## Questions

### Do free QR codes expire?

A static code cannot expire: what it says is printed in the code. A free dynamic code can, because it goes through the vendor's redirect, and some vendors limit or switch off free or lapsed ones; the table on this page quotes what each says.

### How can I tell if my printed code is dynamic?

Scan it and look at the address it holds before the page opens. If it is a short link on a QR vendor's domain rather than your own website, it is dynamic. The checker on the tool page follows it and names the vendor.

### Can a dynamic code be turned into a static one?

No. The printed modules hold the vendor's link. You can make a new static code for the page it leads to and reprint.

## Related

- [WiFi QR code format](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/wifi-qr-code-format/)
- [Contact card (vCard) QR code format](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/vcard-qr-code-format/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/static-vs-dynamic/  
Data as of: 2026-11-02
