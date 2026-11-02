# The contact card (vCard) QR code format

A contact card QR code holds a vCard: BEGIN:VCARD, VERSION:3.0, the name, phone, email and other lines, then END:VCARD, with commas, semicolons and backslashes in text escaped by a backslash (RFC 2426). The example below is a version 9 (53 x 53 modules) at level M; a QR code holds at most 2,953 bytes at level L.

## Example

```
BEGIN:VCARD
VERSION:3.0
N:Rivera;Jane;;;
FN:Jane Rivera
ORG:Acme\, Inc
TEL;TYPE=WORK,VOICE:+12125551212
EMAIL;TYPE=INTERNET:jane@example.com
END:VCARD
```

More lines make a bigger, denser code. Level M restores about 15% of the codewords and is the level DENSO WAVE says is most often chosen; print a dense code larger.

## Make a contact card code

[Open the contact card maker](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/?type=vcard)

## Please read

- A static code stores your content directly and has no expiry, but it only works while its destination (website, form, network) exists.
- Test-scan every code at its final print size before a print run.
- Expiry check: this reports what the code encodes and where it redirects today, plus the vendor's published policy on the date shown; it cannot see your account or promise what a vendor will do. Vendor policies are quoted from the vendor's own pages on the date shown and can change; we are not affiliated with any vendor named.
- WiFi codes: phone support varies, especially for enterprise (WPA2-EAP) fields; test with the phones your guests use.
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## Sources

- [RFC 2426: vCard 3.0 (escaping of commas, semicolons, backslashes and newlines) (read 2026-11-02)](https://www.rfc-editor.org/rfc/rfc2426)
- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard) (read 2026-11-02)](https://github.com/zxing/zxing/wiki/Barcode-Contents)
- [DENSO WAVE: Error correction (Level M 15% is most often selected) (read 2026-11-02)](https://www.qrcode.com/en/about/error_correction.html)

## Related

- [WiFi QR code format](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/wifi-qr-code-format/)
- [Static vs dynamic QR codes](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/static-vs-dynamic/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/vcard-qr-code-format/  
Data as of: 2026-11-02
