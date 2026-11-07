# Bulk QR codes from a spreadsheet

Upload a sheet with one row per code and get a ZIP of codes with a manifest CSV. In the sample sheet below, 3 rows became codes and 1 was refused (row 5: A link is required).

## The sample sheet

```csv
asset tag,url,label
00417,https://example.com/a/00417,Pump 3
00418,https://example.com/a/00418,Pump 4
00419,example.com/a/00419,Valve 1
00420,,Spare
```

Columns used: url, label. Ignored: asset tag.

## What the tool makes of it

| Row | File | Content | Symbol |
| --- | --- | --- | --- |
| 2 | qr-2.png | https://example.com/a/00417 | version 3, 29 x 29 |
| 3 | qr-3.png | https://example.com/a/00418 | version 3, 29 x 29 |
| 4 | qr-4.png | https://example.com/a/00419 | version 3, 29 x 29 |
| 5 | none | Refused | A link is required. |

A link written without https:// (row 4) is completed by the tool, so the code opens a web page.

## Label sheets

- US Letter, 30 labels of 1 x 2-5/8 in (the label size of Avery 5160)
- US Letter, 12 square labels of 2 x 2 in (the label size of Avery 22816)
- A4, 21 labels of 63.5 x 38.1 mm (3 across, 7 down)

> The label size and count are the product's; the margins are the tool's own centred grid. Print one page on plain paper and hold it against a label sheet first.

## Make your batch

[Open the generator](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/?type=url)

## Sources

- [Avery 5160 template: 1 x 2-5/8 in, 30 per sheet (read 2026-11-02)](https://www.avery.com/templates/5160)
- [Avery 22816 template: 2 x 2 in square, 12 per sheet (read 2026-11-02)](https://www.avery.com/templates/22816)
- [DENSO WAVE: Points for using QR Code (quiet zone of four modules) (read 2026-11-02)](https://www.qrcode.com/en/howto/code.html)

## Steps

1. **Head the columns.** Name the content column after the field, such as url (or text, or ssid for WiFi). Add label columns for text printed beside each code.
2. **Upload the sheet.** CSV or Excel. Every row is checked first; a row that cannot become a code is refused with its row number.
3. **Download the ZIP.** One image per row, plus manifest.csv listing every row, its file, its symbol and whether it was read back.
4. **Print.** Optionally ask for a label sheet PDF: US Letter, 30 labels of 1 x 2-5/8 in (the label size of Avery 5160); US Letter, 12 square labels of 2 x 2 in (the label size of Avery 22816); A4, 21 labels of 63.5 x 38.1 mm (3 across, 7 down).

## Questions

### Can I make QR codes in bulk from Excel?

Yes. Upload a CSV or an Excel sheet with one row per code, up to 50,000 rows a job. Each code is read back before it goes in the ZIP.

### What happens to a bad row?

It is refused with its row number and the reason, listed in the manifest, and never charged.

## Related

- [How big to print a QR code](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/qr-code-print-size/)
- [WiFi QR code format](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/wifi-qr-code-format/)
- [QR code generator](https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/qr-code-generator/bulk-qr-codes-from-a-spreadsheet/  
Data as of: 2026-11-02
