# Keep leading zeros in a CSV

In this worked export, 2 account codes had lost their leading zeros (10 and 200); with the width set to 4 digits they come back as 0010 and 0200, and 5 ZIP codes go back to 5 digits. Excel removes leading zeros because it reads a column of digits as numbers, and Microsoft says formatting the column afterwards will not restore zeros already removed.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Account%2CVendor%2CZIP%0A10%2CNorth+Depot%2C2134%0A200%2CHarbor+Supply%2C7030%0A3000%2CRidge+Co%2C90210%0A4100%2CBayline%2C501%0A1250%2CCedar+Mills%2C60614%0A3300%2CPine+Freight%2C2116%0A5120%2COak+Tools%2C10001%0A2210%2CElm+Paper%2C8540%0A6045%2CAsh+Metals%2C30303%0A7300%2CBirch+Foods%2C98101%0A&dates=iso&enc=utf-8-bom)

## The worked file

The file was opened and saved in Excel, so its zeros are already gone. The scan sees that most account codes are 4 digits and the rest are shorter, and suggests 4 as the width. It never pads by itself: a width is applied only when you confirm it, because only you know your codes are fixed-width.

The worked file, with the account width set to 4 and the ZIP rule on

| Account | Vendor | ZIP |
| --- | --- | --- |
| 10 → 0010 | North Depot | 2134 → 02134 |
| 200 → 0200 | Harbor Supply | 7030 → 07030 |
| 3000 | Ridge Co | 90210 |
| 4100 | Bayline | 501 → 00501 |
| 1250 | Cedar Mills | 60614 |
| 3300 | Pine Freight | 2116 → 02116 |
| 5120 | Oak Tools | 10001 |
| 2210 | Elm Paper | 8540 → 08540 |
| 6045 | Ash Metals | 30303 |
| 7300 | Birch Foods | 98101 |

## Two different problems

- **The zeros are still in the file.** The CSV says 0010, but Excel shows 10 when you open it. Nothing is lost yet: open the file with the column set to Text, turn the conversion off, or let the fixer write the codes as ="0010" so a double-click open keeps them.
- **The zeros are gone from the file.** Someone opened it in Excel and saved it. The zeros can only come back if you know the width: ZIP codes are 5 digits (ZIP+4 is 9), and your own codes have the width your system gives them.

## Next month

Save the choices as a recipe. Next month's export gets the same width and rules, and the scan warns you if a column was added, removed or renamed. [How a recipe works](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/saved-recipe/).

## Sources

- [Microsoft Support: Keeping leading zeros and large numbers (read November 8, 2026)](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers)
- [Microsoft Support: Data import and analysis options (read November 8, 2026)](https://support.microsoft.com/en-US/Excel/data-import-and-analysis-options-in-excel)
- [Microsoft 365 Insider blog: Control data conversions in Excel for Windows and Mac (read November 8, 2026)](https://techcommunity.microsoft.com/blog/microsoft365insiderblog/control-data-conversions-in-excel-for-windows-and-mac/4215336)

## Questions

### Why does Excel remove leading zeros from a CSV?

A CSV has no column types, so Excel reads a column of digits as numbers when it opens the file, and a number has no leading zeros.

### Will formatting the column as Text bring the zeros back?

No. Number formatting will not restore leading zeros removed before formatting.

### Can I stop Excel removing leading zeros?

In Excel for Microsoft 365 and Excel 2024, yes: on Windows go to File \> Options \> Data \> Automatic Data Conversion (on a Mac, Excel \> Preferences \> Edit \> Automatic Data Conversion) and clear "Remove leading zeros and convert to a number". Older versions need the file imported with the column set to Text.

## Related

- [ZIP codes lost their leading zero](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-zip-codes-leading-zeros/)
- [Excel's automatic data conversion settings](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/excel-automatic-data-conversion/)
- [Power Query: keep leading zeros on every refresh](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/power-query-keep-leading-zeros/)
- [Save a recipe for a monthly export](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/saved-recipe/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/keep-leading-zeros-csv/  
Data as of: 2026-11-08
