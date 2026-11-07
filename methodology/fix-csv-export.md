# How CSV exports are fixed: method and sources

A date is read as DD/MM only when its first part is above 12, and as MM/DD only when its second part is; a column proven one way reads its other dates that way, and a date with both parts 12 or below is otherwise listed and left as written. ZIP codes go back to 5 or 9 digits, and one call takes a file of up to 2,000,000 bytes.

## What does the fix a csv export (leading zeros, dates, encoding) with a saved recipe compute?

The tool takes the bytes of a CSV export and works out its encoding, its delimiter and what each column holds: dates and which order they are written in, ZIP codes and codes that lost their leading zeros, IDs of 16 or more digits, values Excel already damaged, amounts with currency signs and accents garbled by the wrong encoding. A scan reports it all, with the first 20 rows fixed and a suggested recipe. A fix returns the whole file fixed, a change report and the recipe, which holds settings only and applies the same fix to next month's export.

Operations (the op field):

- `scan`: Reads the file and returns the answer sentence, the encoding and delimiter, each column with what it holds and the rule it would get, ragged rows, how the columns differ from a recipe, the changes a fix would make, a preview of the first 20 rows before and after, and a suggested recipe. Free.
- `fix`: Applies the rules to every row and returns the fixed file (base64), the counts of each change, the values left as written with their lines, a change report CSV (up to 5,000 rows listed, all counted) and the recipe used.

Inputs:

- `file or text`: The CSV as its bytes in base64 (so the encoding can be read) or as text, one of the two, at most 2,000,000 bytes.
- `name`: The file name, used to name the fixed file (name-fixed.csv).
- `recipe`: An earlier recipe: the input settings (encoding, delimiter, header row, garbled-accent repair), the output choices and a rule per column by heading (keep, date with an order, zip, code with an optional width, or number with a decimal mark).
- `output`: The encoding written (utf-8-bom by default, utf-8 or windows-1252), the delimiter, CRLF or LF line ends, dates as iso (YYYY-MM-DD, the default), mdy or dmy, and excelGuard, which writes codes as ="..." so Excel keeps them as text.

Outputs:

- answer: one sentence on what was found or fixed
- encoding, delimiter and rows
- columns: per column, its kind (date, zip, code, long-id, number, text or empty), the proof counts for dates, the code widths, and the rule applied
- changes and flags: the count of each kind of change, and the values left as written with the reason and their lines
- drift: headings missing, added or moved since the recipe
- recipe: the settings that fix the file, never its values; and for fix, the fixed file and the change report CSV

## How is it calculated, step by step?

1. The bytes are decoded. A byte order mark comes first (EF BB BF for UTF-8, FF FE and FE FF for UTF-16), then UTF-16 without a BOM when most bytes in odd or even places are zero, then strict UTF-8 (overlong forms, surrogates and code points above U+10FFFF are invalid). A file that is not valid UTF-8 is read as Windows-1252, and the first bad byte and its offset are named.
2. Text that was UTF-8 read as Windows-1252 (CafÃ© for Café) is turned back field by field, only where turning it back gives valid UTF-8 with a non-ASCII character in it.
3. The delimiter is found from the first 50 records: of comma, semicolon, tab and pipe, the one that splits the most records into the same number of fields (more than one); a tie goes to more fields, then in that order. The records are parsed by RFC 4180: quoted fields may hold the delimiter, doubled quotes and line breaks. Rows with a different field count from the heading row are listed.
4. Each column is analysed. It is a date column when at least 90% of its filled values read as dates; a first part above 12 proves DD/MM, a second part above 12 proves MM/DD, and both in one column make it mixed. Two-digit years follow Excel's rule: 00 to 29 are 2000 to 2029, 30 to 99 are 1930 to 1999.
5. A column headed ZIP, postal or postcode with at least 90% ZIP-shaped values is a ZIP column. A column of digits only is a code column when values start with 0, a long-ID column when values have 16 or more digits or were already turned into scientific notation (E+15 and up), and otherwise a number. Amounts with currency signs, digit-grouping commas, brackets or a trailing minus are noted.
6. Each column gets its rule: the recipe's, matched by heading with case and spaces ignored, or else the suggestion from the analysis. A column the recipe knew without a rule is kept as written, and a new one gets the suggestion. Missing, added and moved headings are reported.
7. The rules are applied to every value. Dates are rewritten when their own day proves the order, or by the column's proven order or the recipe; a value that reads the same either way is settled; a date against the recipe's order is flagged, not swapped. ZIP codes are padded to 5 digits, or 9 for ZIP+4. Codes are padded only to a width the recipe states, and a longer value is flagged. Amounts become plain numbers, with brackets read as negative.
8. The file is written by RFC 4180, quoting only fields that hold the delimiter, a quote or a line break, in the chosen encoding; a character with no Windows-1252 byte is written as "?" and counted. The change report lists each change with its line, column, before, after and rule.

**RFC 4180.**

The CSV format of RFC 4180 is read and written: fields separated by the delimiter, records by line breaks, a field with the delimiter, a quote or a line break in double quotes, and a quote inside a field doubled. A quote opened and never closed is reported with its line, and a quote inside an unquoted field is kept as written.

**WHATWG Encoding Standard and Unicode.**

Windows-1252 is decoded and encoded by the WHATWG index-windows-1252 table dated 2024-09-18: bytes 0x80 to 0x9F map to the 32 code points it lists, and 0xA0 to 0xFF are the same code points as the bytes. The UTF-8 byte order mark is EF BB BF, used only as a signature, as the Unicode FAQ says.

**Microsoft Excel.**

Two-digit years follow the 2029 rule from Microsoft's page on two-digit years. IDs of 16 or more digits are flagged because Excel keeps at most 15 significant digits; a value already in scientific notation has lost digits and is flagged, never filled in.

**Our own rules.**

Nothing is guessed. A date with both parts 12 or below is settled only by its column's proven order or the recipe. A code is padded only to a width a rule gives (ZIP 5, ZIP+4 9) or the recipe states; a width the analysis finds is suggested, never applied. The same bytes and recipe always give the same bytes out.

## Which edge cases does it handle?

- A column that mixes DD/MM and MM/DD rewrites each provable date its own way and leaves the ambiguous ones as written, unless the recipe says how to read them.
- A date column with no proof either way asks for the order instead of guessing.
- ZIP+4 written with a space is written back with a hyphen, and 6 to 9 digits with no hyphen are padded to 9 digits.
- Two columns with the same heading are told apart by position.
- A file with a line break at the end has no empty last row, and blank lines in the middle are kept.
- A file without a heading row names its columns Column 1, Column 2 and so on.
- Values Excel already turned into dates in a text column (such as 1-Mar) are counted and reported.

## What does a worked example look like?

> Every figure below is the output of the tool's engine, not typed in.

**Scan a monthly export: encoding, ZIP codes, the date order and its proof, damaged IDs**

```json
{
  "op": "scan",
  "text": "Account,Customer,ZIP,Posted,Amount,Order ID\r\n0010,CafÃ© Rio,2134,13/03/2026,\"$1,200.50\",4000123412341234\r\n0200,ZoÃ« Park,90210,03/04/2026,(45.00),4000123412349876\r\n3000,Ann Lee,501,05/05/2026,12.00,1.23457E+15\r\n0040,Ã‰lise Roy,7030,28/02/2026,\"$2,050.00\",4000555566667777\r\n",
  "name": "bank-export-march.csv"
}
```

Scan a monthly export: encoding, ZIP codes, the date order and its proof, damaged IDs

| Result | Value |
| --- | --- |
| answer | Your file is UTF-8 without a BOM, comma-separated, with 4 rows and 6 columns: 3 ZIP codes in "ZIP" lost their leading zero; 1 column of codes with leading zeros to keep as text ("Account"); 3 IDs of 16 or more digits that Excel would cut to 15; dates in "Posted" read DD/MM (2 values prove it); 1 value already in scientific notation (1.23E+15), whose lost digits are not in the file; 3 amounts written with currency signs, digit-grouping commas or brackets in "Amount" (a recipe can write them as plain numbers); 3 values with accents or symbols that Excel shows garbled unless the file has a BOM; 3 values with garbled accents (such as Ã© for é) to repair. |
| encoding | utf-8 |
| rows | 4 |
| Account | code; rule code |
| Customer | text; rule keep |
| ZIP | zip; rule zip |
| Posted | date; rule date (dmy) |
| Amount | number; rule keep |
| Order ID | long-id; rule code |

**Fix it with a saved recipe: ZIP codes restored, dates as YYYY-MM-DD, amounts plain**

```json
op: "fix"
text: "Account,Customer,ZIP,Posted,Amount,Order ID\r\n0010,CafÃ© Rio,2134,13/03/2026,\"$1,200.50\",4000123412341234\r\n0200,ZoÃ« Park,90210,03/04/2026,(45.00),4000123412349876\r\n3000,Ann Lee,501,05/05/2026,12.00,1.23457E+15\r\n0040,Ã‰lise Roy,7030,28/02/2026,\"$2,050.00\",4000555566667777\r\n"
name: "bank-export-march.csv"
recipe: {...}
```

Fix it with a saved recipe: ZIP codes restored, dates as YYYY-MM-DD, amounts plain

| Result | Value |
| --- | --- |
| answer | Fixed 4 rows: 3 ZIP codes restored to full width, 4 dates written as YYYY-MM-DD, 3 amounts written as plain numbers, 3 garbled values repaired; saved as UTF-8 with a BOM. 1 other value could not be fixed and is listed with its line. |
| file | bank-export-march-fixed.csv, 271 bytes, utf-8-bom |
| changes: zip-restored | 3 |
| changes: date-proved-dmy | 2 |
| changes: amount-plain | 3 |
| changes: date-column-dmy | 1 |
| changes: date-same | 1 |
| changes: mojibake | 3 |
| changes listed | 13 |

## What does it not do?

- One call takes one file of at most 2,000,000 bytes (2 MB), 100,000 rows and 300 columns. An empty file, or one holding null bytes (an .xlsx, a PDF or UTF-16 read the wrong way), is refused.
- Digits Excel already cut to 15, and zeros already stripped from codes with no known width, are not in the file any more. They are flagged, never invented.
- It does not check the file against a schema, rename headings or remove rows.
- Files are processed in memory and not kept; a recipe holds settings only, never the file's values.

## Where does the data come from, and how fresh is it?

The Windows-1252 table is the WHATWG index dated 2024-09-18, read on 2026-11-08. The Microsoft and Unicode facts were read on 2026-11-08, and the Microsoft pages are checked for changes once a day. The rules change only with the code (engine fix-csv-export-1); nothing is fetched when a file is fixed.

- [IETF RFC 4180: Common Format and MIME Type for CSV Files (Informational, October 2005)](https://www.rfc-editor.org/rfc/rfc4180.txt)
- [WHATWG Encoding Standard: index-windows-1252 (dated 2024-09-18)](https://encoding.spec.whatwg.org/index-windows-1252.txt)
- [Unicode FAQ: UTF-8, UTF-16, UTF-32 and BOM](https://www.unicode.org/faq/utf_bom.html)
- [Microsoft Learn: How Excel works with two-digit year numbers](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/two-digit-year-numbers)
- [Microsoft Support: Keeping leading zeros and large numbers](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers)

[All sources, editions and read dates](https://krishnachagti-sudo.github.io/toll-preview/sources/) are listed on one page, and [each change to the data or rules](https://krishnachagti-sudo.github.io/toll-preview/updates/) is logged with its date.

## How is it tested?

The tests pin the Windows-1252 table to the WHATWG index and the facts to their read date, then check decoding (BOMs, strict UTF-8, Windows-1252), encoding with and without a BOM, garbled-accent repair, RFC 4180 parsing and writing, delimiter detection, what each date proves, the 2029 rule, ZIP codes and amounts, mixed and unproven date columns, codes and widths, long IDs, recipes applied to next month's file with drift, limits and refusals, and that the same file and recipe give the same bytes. The worked examples equal run().

[The checks for every tool](https://krishnachagti-sudo.github.io/toll-preview/sources/#checks) list what each test suite asserts.

[Open the Fix a CSV export (leading zeros, dates, encoding) with a saved recipe tool](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/).

## Questions

### Is there any AI in the fix a csv export (leading zeros, dates, encoding) with a saved recipe answers?

No. The answer is worked out by fixed rules from the data on this page, so the same input gives the same answer every time.

### What will the fix a csv export (leading zeros, dates, encoding) with a saved recipe refuse to answer?

One call takes one file of at most 2,000,000 bytes (2 MB), 100,000 rows and 300 columns. An empty file, or one holding null bytes (an .xlsx, a PDF or UTF-16 read the wrong way), is refused. A request outside what the data covers is refused with the reason and costs nothing.

## Related

- [Open the Fix a CSV export (leading zeros, dates, encoding) with a saved recipe tool](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/)
- [Sources and checks](https://krishnachagti-sudo.github.io/toll-preview/sources/)
- [Data updates](https://krishnachagti-sudo.github.io/toll-preview/updates/)
- [DD/MM and MM/DD dates in a CSV](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-date-format-dd-mm-mm-dd/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/methodology/fix-csv-export/  
Data as of: 2026-11-04
