# How big to print a QR code

Count the modules and keep at least 4 printer dots per module (DENSO WAVE). A code for https://example.com/menu is version 2, 25 x 25 modules, or 33 with the 4-module quiet zone; printed 15 mm wide, each module is 0.45 mm, 5.4 dots at 300 dpi.

## Width, module size and dots

https://example.com/menu, level M, quiet zone included in the width

| Printed width | Module | Dots at 300 dpi | Dots at 600 dpi | Print check |
| --- | ---: | ---: | ---: | --- |
| 10 mm | 0.30 mm | 3.6 | 7.2 | Under 4 dots at 300 dpi |
| 15 mm | 0.45 mm | 5.4 | 10.7 | OK |
| 20 mm | 0.61 mm | 7.2 | 14.3 | OK |
| 25 mm | 0.76 mm | 8.9 | 17.9 | OK |
| 30 mm | 0.91 mm | 10.7 | 21.5 | OK |
| 40 mm | 1.21 mm | 14.3 | 28.6 | OK |

> Worked out by the tool's engine: width divided by modules (quiet zone included), then by the size of one printer dot (25.4 mm divided by the dpi).

## Why does a longer link need a bigger code?

More characters need more modules. At the same printed width, each module gets smaller. Higher error correction does the same: level M restores about 15% of the codewords and level H about 30%, but H needs more modules for the same link. Keep printed links short.

## Before the print run

- Leave the four-module quiet zone clear of text and edges.
- Keep dark modules on a light background; the tool warns when contrast is low.
- Print one copy at the final size and scan it with two or three phones from where people will stand.

## Get the print check for your link

[Open the generator with this link](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/?type=url&url=https%3A%2F%2Fexample.com%2Fmenu)

## Sources

- [DENSO WAVE: Module size (4 or more printer dots a module) (read 2026-11-02)](https://www.qrcode.com/en/howto/cell.html)
- [DENSO WAVE: Points for using QR Code (quiet zone of four modules) (read 2026-11-02)](https://www.qrcode.com/en/howto/code.html)
- [DENSO WAVE: QR Code versions (40 versions, 21 x 21 to 177 x 177 modules) (read 2026-11-02)](https://www.qrcode.com/en/about/version.html)
- [DENSO WAVE: Error correction (Level M 15% is most often selected) (read 2026-11-02)](https://www.qrcode.com/en/about/error_correction.html)

## Questions

### What is the smallest size for a QR code?

It depends on how many modules the code has and on the printer. DENSO WAVE recommends 4 or more printer dots a module. For a 25 x 25 code with its quiet zone, 15 mm wide gives 0.45 mm modules, 5.4 dots each at 300 dpi.

### How much blank space does a QR code need?

DENSO WAVE says a margin (quiet zone) of four modules on every side.

### Is there a rule for scanning distance?

DENSO WAVE's pages read for this guide do not give one, so none is given here. Print a test at the final size and scan it from where people will stand.

## Related

- [A restaurant menu code that does not lapse](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/restaurant-menu-qr-code/)
- [Bulk codes and label sheets](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/bulk-qr-codes-from-a-spreadsheet/)
- [QR code generator](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/qr-code-print-size/  
Data as of: 2026-11-02
