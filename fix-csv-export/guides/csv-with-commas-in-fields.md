# Commas inside CSV fields

RFC 4180 says a field holding a comma, a quote or a line break must be in double quotes, with any quote inside doubled. In this 2-row file the first row follows that, but line 3 has an unquoted comma in the address, so it splits into 4 fields instead of 3 and every column after it shifts; the scan names the line instead of guessing where the comma belonged.

## The rules

- Fields containing line breaks, double quotes or commas should be in double quotes.
- A double quote inside a quoted field is written twice: "Said ""call after 5""".
- Each line should have the same number of fields.
- Records end with CRLF; the fixed file uses CRLF unless you choose LF.

## The worked file

| Line | Fields | Read as |
| --- | --- | --- |
| 2 | 3 | Lee, Ann \| 12 Main St, Apt 4 \| Said "call after 5" |
| 3 | 4 | Bo Diaz \| 9 Elm St \|  Unit 2 \| Paid |

A ragged line is written as it is and listed in the scan with its field count. Fix it at the source (quote the field) or by hand; no tool can know which comma was meant to be data.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Name%2CAddress%2CNote%0A%22Lee%2C+Ann%22%2C%2212+Main+St%2C+Apt+4%22%2C%22Said+%22%22call+after+5%22%22%22%0ABo+Diaz%2C9+Elm+St%2C+Unit+2%2CPaid%0A&dates=iso&enc=utf-8-bom)

## Sources

- [IETF RFC 4180: Common Format and MIME Type for CSV Files (Informational, October 2005) (read November 8, 2026)](https://www.rfc-editor.org/rfc/rfc4180.txt)

## Related

- [Semicolon or comma: delimiters by locale](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/delimiters-locale/)
- [CSV Lint vs a recipe-based fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/vs/csvlint/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/csv-with-commas-in-fields/  
Data as of: 2026-11-08
