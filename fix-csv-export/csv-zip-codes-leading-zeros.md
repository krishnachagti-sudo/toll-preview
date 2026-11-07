# ZIP codes lost their leading zero

In this list of 6 customers, 5 ZIP codes had lost a leading zero: Boston's 2134 goes back to 02134, Holtsville's 501 to 00501, and the ZIP+4 codes 2134-1234 and 70301234 back to 02134-1234 and 070301234. A ZIP code is always 5 digits, or 9 with the +4, so restoring it is a rule, not a guess.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Customer%2CCity%2CState%2CZIP%0AAnn+Lee%2CBoston%2CMA%2C2134%0ABo+Diaz%2CHoltsville%2CNY%2C501%0ACy+Park%2CHoboken%2CNJ%2C7030%0ADee+Fox%2CBeverly+Hills%2CCA%2C90210%0AEd+Moss%2CBoston%2CMA%2C2134-1234%0AFay+Ng%2CHoboken%2CNJ%2C70301234%0A&dates=iso&enc=utf-8-bom)

## The worked list

Customer list, ZIP column restored

| Customer | City | State | ZIP |
| --- | --- | --- | --- |
| Ann Lee | Boston | MA | 2134 → 02134 |
| Bo Diaz | Holtsville | NY | 501 → 00501 |
| Cy Park | Hoboken | NJ | 7030 → 07030 |
| Dee Fox | Beverly Hills | CA | 90210 |
| Ed Moss | Boston | MA | 2134-1234 → 02134-1234 |
| Fay Ng | Hoboken | NJ | 70301234 → 070301234 |

## The rule

A column is treated as ZIP codes when its heading says ZIP or postal code. Each value is restored by its shape:

| Value in the file | Written as |
| --- | --- |
| 1 | 00001 |
| 12 | 00012 |
| 123 | 00123 |
| 1234 | 01234 |
| 12345 | 12345 |
| 1234-5678 | 01234-5678 |
| 1234 5678 | 01234-5678 |
| 1234567 | 001234567 |
| 12345678 | 012345678 |
| 123456789 | 123456789 |
| K1A 0B1 | left as written (not a ZIP shape) |

A value that is not a ZIP shape (a Canadian or UK postcode, for example) is left as written and listed with its line, so a mixed address list is never damaged.

## Keep them next time

The restored ZIP codes are text in the fixed file. If you then double-click the file in Excel, Excel strips them again unless you turn the conversion off (Microsoft 365 and Excel 2024) or tick the option that writes them as ="02134". [Excel's conversion settings](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/excel-automatic-data-conversion/).

## Sources

- [Microsoft Support: Keeping leading zeros and large numbers (read November 8, 2026)](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers)
- [Microsoft Support: Data import and analysis options (read November 8, 2026)](https://support.microsoft.com/en-US/Excel/data-import-and-analysis-options-in-excel)

## Questions

### How do I keep leading zeros on ZIP codes?

Pad them back to 5 digits (9 for ZIP+4) before the file reaches Excel, and keep the column as text. In this worked list 5 of 6 ZIP codes were short.

## Related

- [Keep leading zeros in a CSV](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/keep-leading-zeros-csv/)
- [Open a CSV in Excel without changing it](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/open-csv-in-excel-without-changing-data/)
- [Save a recipe for a monthly export](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/saved-recipe/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-zip-codes-leading-zeros/  
Data as of: 2026-11-08
