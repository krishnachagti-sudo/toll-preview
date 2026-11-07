# Windows-1252 to UTF-8, and garbled accents

In Windows-1252, é is the single byte E9, which is not valid UTF-8; in UTF-8 it is C3 A9. This 70-byte export has 6 values with accented names, so the scan reads it as Windows-1252 and the fix writes them as UTF-8; UTF-8 read the wrong way shows é as Ã©, which the fixer turns back.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Name%2CCity%0AJos%C3%A9+%C3%81lvarez%2CBogot%C3%A1%0AFran%C3%A7ois+C%C3%B4t%C3%A9%2CQu%C3%A9bec%0ALars+Nyg%C3%A5rd%2CTroms%C3%B8%0A&dates=iso&enc=utf-8-bom)

## How the encoding is read

- A byte order mark at the start decides it: EF BB BF is UTF-8, FF FE and FE FF are UTF-16.
- Without one, the bytes are checked as UTF-8. A file that passes is UTF-8.
- A file that fails is read as Windows-1252, using the WHATWG table, and the scan names the first byte that was not UTF-8 and where it is.

## Common characters, byte by byte

| Character | Windows-1252 byte | UTF-8 bytes | UTF-8 read as Windows-1252 | Turned back by the fixer |
| --- | --- | --- | --- | --- |
| é | E9 | C3 A9 | Ã© | yes |
| è | E8 | C3 A8 | Ã¨ | yes |
| á | E1 | C3 A1 | Ã¡ | yes |
| ñ | F1 | C3 B1 | Ã± | yes |
| ü | FC | C3 BC | Ã¼ | yes |
| ö | F6 | C3 B6 | Ã¶ | yes |
| ç | E7 | C3 A7 | Ã§ | yes |
| ø | F8 | C3 B8 | Ã¸ | yes |
| € | 80 | E2 82 AC | â‚¬ | yes |
| ’ | 92 | E2 80 99 | â€™ | yes |
| “ | 93 | E2 80 9C | â€œ | yes |
| – | 96 | E2 80 93 | â€“ | yes |

## Garbled text is repaired value by value

When a file is valid UTF-8 but its text was garbled earlier (someone opened UTF-8 as Windows-1252 and saved it), the fixer turns each garbled value back, but only when the bytes it gets are valid UTF-8. Text that merely contains Ã or Â on purpose is left alone, and the repair can be switched off in the recipe.

## Sources

- [WHATWG Encoding Standard: index-windows-1252 (dated 2024-09-18) (read November 8, 2026)](https://encoding.spec.whatwg.org/index-windows-1252.txt)
- [Unicode FAQ: UTF-8, UTF-16, UTF-32 and BOM (read November 8, 2026)](https://www.unicode.org/faq/utf_bom.html)

## Related

- [UTF-8 with or without a BOM](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-utf-8-bom/)
- [Jira CSV export garbled in Excel](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/for/jira-export/)
- [Read a UTF-8 BOM CSV in Python and PowerShell](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/python-read-csv-utf-8-bom/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-encoding-windows-1252-to-utf-8/  
Data as of: 2026-11-08
