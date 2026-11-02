# The WiFi QR code format

A WiFi QR code holds one line of text, such as WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;;. In it, T is the security (WPA, WEP, WPA2-EAP or nopass), S the network name, P the password, and the characters \\ ; , " : are escaped with a backslash. That example is a version 3 (29 x 29 modules) at level M.

## Examples

```
WIFI:T:WPA;S:Cafe Guest;P:tea\;time42;;
WIFI:T:nopass;S:Lobby;;
```

Enterprise networks add E: (EAP method), A: (anonymous identity), I: (identity) and PH2: (phase 2), as ZXing documents. Phone support for enterprise fields varies; test with the phones your guests use.

## Make a WiFi code

[Open the WiFi code maker](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/?type=wifi)

## Please read

- A static code stores your content directly and has no expiry, but it only works while its destination (website, form, network) exists.
- Test-scan every code at its final print size before a print run.
- Expiry check: this reports what the code encodes and where it redirects today, plus the vendor's published policy on the date shown; it cannot see your account or promise what a vendor will do. Vendor policies are quoted from the vendor's own pages on the date shown and can change; we are not affiliated with any vendor named.
- WiFi codes: phone support varies, especially for enterprise (WPA2-EAP) fields; test with the phones your guests use.
- QR Code is registered trademark of DENSO WAVE INCORPORATED.

## Sources

- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard) (read 2026-11-02)](https://github.com/zxing/zxing/wiki/Barcode-Contents)

## Steps

1. **Start with WIFI:.** Then the fields, each ending in a semicolon, in any order.
2. **Security.** T:WPA for WPA, WPA2 and WPA3 personal networks, T:WEP, T:WPA2-EAP for enterprise, or T:nopass for an open network.
3. **Name and password.** S: the network name, P: the password. Put a backslash before any \\ ; , " or :. A name or password that could be read as hex goes in double quotes.
4. **Finish.** Add H:true for a hidden network, then end with a second semicolon.

## Related

- [Static vs dynamic QR codes](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/static-vs-dynamic/)
- [Contact card (vCard) QR code format](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/vcard-qr-code-format/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/wifi-qr-code-format/  
Data as of: 2026-11-02
