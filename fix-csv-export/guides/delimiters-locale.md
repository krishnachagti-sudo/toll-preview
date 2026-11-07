# Semicolon or comma: delimiters by locale

Where the comma is the decimal mark, CSV files are often separated by semicolons instead, so the two do not clash. This 3-row file is read as semicolon-separated from its first rows; with the decimal comma set, 3,50 becomes 3.50 and 1.234,00 becomes 1234.00, and the fixed file is comma-separated.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Produkt%3BMenge%3BPreis%0AKaffee%3B2%3B3%2C50%0ATee%3B10%3B1.234%2C00%0AKuchen%3B1%3B12%2C75%0A&dates=iso&enc=utf-8-bom)

## How the delimiter is found

The first 50 records are split by comma, semicolon, tab and pipe in turn, quotes respected. The one that gives the same number of fields (more than one) on the most lines wins; a decimal comma inside a value does not fool it, because it does not split every line evenly.

## The worked file

Semicolon file with decimal commas, written comma-separated with plain numbers

| Produkt | Menge | Preis |
| --- | --- | --- |
| Kaffee | 2 | 3,50 → 3.50 |
| Tee | 10 | 1.234,00 → 1234.00 |
| Kuchen | 1 | 12,75 → 12.75 |

PowerShell can write the separator your computer uses: -UseCulture uses the current culture's list separator as the delimiter.

## Sources

- [IETF RFC 4180: Common Format and MIME Type for CSV Files (Informational, October 2005) (read November 8, 2026)](https://www.rfc-editor.org/rfc/rfc4180.txt)
- [Microsoft Learn: Export-Csv (PowerShell 7.6) (read November 8, 2026)](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/export-csv)

## Related

- [Currency symbols and negative numbers](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/negative-numbers-currency-formats/)
- [Commas inside CSV fields](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/csv-with-commas-in-fields/)
- [Read a UTF-8 BOM CSV in Python and PowerShell](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/python-read-csv-utf-8-bom/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/delimiters-locale/  
Data as of: 2026-11-08
