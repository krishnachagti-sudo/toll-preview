# How QR codes are generated: ISO/IEC 18004 method

The text is encoded in the densest single mode that holds it, in the smallest of the 40 versions that fits at the chosen error correction level, with Reed-Solomon codewords added and the one of 8 masks with the lowest penalty applied. Every file is decoded again before it is returned.

## What does the qr code generator compute?

The tool builds static QR Code symbols (Model 2) as SVG, PNG or PDF from a link, text, WiFi details, a contact card, email, SMS, phone or location, or from exact text you give. It can make many codes from a spreadsheet, read a code from a PNG, and report what a printed code encodes and where it redirects.

Operations (the op field):

- `static`: One code as a file, with the version, size in modules, error correction level, mask and mode, the read-back proof and print checks.
- `payload`: The exact text a payload type produces, and the version it needs at each error correction level, without making a file.
- `bulk`: Many codes from rows, a CSV or an .xlsx sheet, as files named by a column, a manifest and an optional label sheet. Rows that cannot be made are reported and not charged.
- `decode`: Reads a code from a PNG of a clean image.
- `expiry-check`: Says what a code encodes, follows a link's redirects, and reports a vendor's published expiry policy.

Inputs:

- `type, fields`: A payload type (url, text, wifi, vcard, email, sms, phone, location) and its fields, or data: the exact text to encode, up to 7,100 characters.
- `ecc, boostEcc, mask`: Error correction L, M (default), Q or H; whether to raise the level when the size does not change; or a fixed mask 0 to 7.
- `margin, fg, bg, logo, logoShare`: The quiet zone in modules (default 4), colors, and a PNG logo of at most 30% of the code's width.
- `format, widthMm, sizePx, printerDpi`: The file type and size, and your printer's resolution for the print check.

Outputs:

- version, modules, ecc, mask and mode of the symbol
- verified and readBack: what a decoder read from the finished file
- print.checks: quiet zone, module size, contrast
- payloadNotes: any escaping applied

## How is it calculated, step by step?

1. The payload text is built from the fields by the grammar of its type (WiFi, vCard 3.0, mailto, SMS, geo), with special characters escaped as the format requires. Or your exact text is used as given.
2. One segment is chosen for the whole text in the densest single mode that holds it: numeric if it is digits only, alphanumeric if every character is in the 45-character set, otherwise byte (UTF-8).
3. The smallest version from 1 to 40 whose data capacity at the chosen error correction level holds the bit stream is used. With boostEcc on, the level is raised to M, Q or H as long as the version does not change.
4. The bit stream is the mode indicator, the character count, the data, a terminator of up to 4 zero bits, padding to a byte, then the pad bytes 0xEC and 0x11 until the capacity is filled.
5. The data is split into blocks for the version and level, Reed-Solomon error correction codewords are computed over GF(256) with polynomial 0x11D, and blocks are interleaved.
6. The codewords are placed in the module grid around the function patterns (finder, timing, alignment, version information).
7. Each of the 8 masks is applied and scored with the standard's penalty rules (N1 = 3, N2 = 3, N3 = 40, N4 = 10). The mask with the lowest penalty is used unless you fix one. The format and version information are then written.
8. The file is drawn as SVG, PNG or PDF, then read back with the decoder. If the decoded text is not the input, no file is returned.
9. Print checks are added: a quiet zone under 4 modules, light-on-dark colors, contrast below 4:1, module size in millimeters and, with your printer's dpi, a warning under 4 printer dots a module.

## Which edge cases does it handle?

- WiFi passwords with a semicolon, comma, colon, quote or backslash are escaped with a backslash, and the notes say so.
- The same text needs a different version at each error correction level: the payload operation shows version and modules at L, M, Q and H.
- A logo covers modules, so the code relies on error correction; the file is read back with the logo to check that it still decodes, and a logo above 30% of the width is refused.
- Text too long for version 40 at the chosen level is refused with the maximum for that mode.
- In a bulk file, a blank row or a row with a missing link is refused, listed by row and not charged.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**A static code for a menu link**

```json
{
  "op": "static",
  "type": "url",
  "fields": {
    "url": "https://example.com/menu"
  },
  "format": "svg",
  "widthMm": 30,
  "printerDpi": 300
}
```

A static code for a menu link

| Result | Value |
| --- | --- |
| payload | https://example.com/menu |
| version | 2 |
| modules | 25 x 25 |
| error correction | M |
| mask | 2 |
| mode | byte |
| read back | https://example.com/menu |

**WiFi text with a semicolon in the password**

```json
{
  "op": "payload",
  "type": "wifi",
  "fields": {
    "ssid": "Cafe Guest",
    "password": "tea;time42",
    "security": "WPA"
  }
}
```

WiFi text with a semicolon in the password

| Result | Value |
| --- | --- |
| payload | WIFI:T:WPA;S:Cafe Guest;P:tea\\;time42;; |
| bytes | 39 |
| version at L | 3 (29 x 29) |
| version at M | 3 (29 x 29) |
| version at Q | 4 (33 x 33) |
| version at H | 5 (37 x 37) |

## What does it not do?

- Static codes only. A static code holds its content and cannot expire, but it works only while its destination exists. The tool does not host redirects.
- Numeric, alphanumeric and byte modes in a single segment. Kanji mode and mixed-mode segmentation are not used.
- The image reader handles clean images (renders and screenshots), not angled photos from a phone.
- The expiry check reports what the code encodes, where a link redirects today (at most 10 hops, private addresses refused) and a vendor's published policy. It cannot see your account or promise what a vendor will do.
- Test-scan every code at its final print size before a print run. QR Code is a registered trademark of DENSO WAVE INCORPORATED.

## Where does the data come from, and how fresh is it?

Format and print rules were read 2026-11-02. The encoder follows ISO/IEC 18004.

- [ISO/IEC 18004 (QR Code bar code symbology specification)](https://www.iso.org/standard/83389.html)
- [DENSO WAVE: Points for using QR Code (quiet zone of four modules)](https://www.qrcode.com/en/howto/code.html)
- [DENSO WAVE: Module size (4 or more printer dots a module)](https://www.qrcode.com/en/howto/cell.html)
- [DENSO WAVE: Error correction (Level M 15% is most often selected)](https://www.qrcode.com/en/about/error_correction.html)
- [ZXing wiki: Barcode Contents (WiFi, SMS, geo, tel, mailto, vCard)](https://github.com/zxing/zxing/wiki/Barcode-Contents)
- [RFC 2426: vCard 3.0 (escaping of commas, semicolons, backslashes and newlines)](https://www.rfc-editor.org/rfc/rfc2426)

[All sources, editions and read dates](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The encoder is compared bit for bit with an independent implementation (node-qrcode 1.5.4) at every one of the 40 versions and 4 error-correction levels, in numeric, alphanumeric and byte modes. A decoder reads every code back, and the Reed-Solomon error correction fixes damage up to its limit and refuses more.

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) list what each test suite asserts.

[Open the QR code generator tool](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/).

## Questions

### Is there any AI in the qr code generator answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the qr code generator refuse to answer?

Static codes only. A static code holds its content and cannot expire, but it works only while its destination exists. The tool does not host redirects. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the QR code generator tool](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [Static vs dynamic QR codes](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/static-vs-dynamic/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/qr-code-generator/  
Data as of: 2026-11-04
