# Open a CSV in Excel without changing it

Excel can make 4 automatic changes when it opens a CSV: it removes leading zeros, keeps only 15 digits of long numbers, reads digits around an E as scientific notation and turns letter-and-number values into dates. To open a file without them, import it with each column's type set, turn the conversions off (Microsoft 365 and Excel 2024), or fix the file first so the risky columns are already safe.

## The four automatic conversions

1. "Remove leading zeros and convert to a number"
2. "Keep first 15 digits of long numbers and display in scientific notation"
3. "Convert digits surrounding the letter "E" into a number in scientific notation"
4. "Convert continuous letters and numbers to a date"

> Microsoft's support page lists Automatic Data Conversions for Excel for Microsoft 365 (Windows and Mac) and Excel 2024. JAN1 stays as text with the date conversion off, but JAN 1 or JAN-1 might still be treated as dates.

## Which way suits you

| Way | Good for | Watch out |
| --- | --- | --- |
| Conversion settings | Your own computer, every file | Not in older versions; colleagues have their own settings |
| Import with column types | A one-off file, or a query you refresh | Type detection looks at the first 200 rows and can undo it |
| Fix the file first | A file you pass on, or the same export every month | Excel still converts codes on a double-click unless the Excel option is on |

## Fix a file before it reaches Excel

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Account%2CVendor%2CZIP%0A10%2CNorth+Depot%2C2134%0A200%2CHarbor+Supply%2C7030%0A3000%2CRidge+Co%2C90210%0A4100%2CBayline%2C501%0A1250%2CCedar+Mills%2C60614%0A3300%2CPine+Freight%2C2116%0A5120%2COak+Tools%2C10001%0A2210%2CElm+Paper%2C8540%0A6045%2CAsh+Metals%2C30303%0A7300%2CBirch+Foods%2C98101%0A&dates=iso&enc=utf-8-bom)

## Sources

- [Microsoft Support: Data import and analysis options (read November 8, 2026)](https://support.microsoft.com/en-US/Excel/data-import-and-analysis-options-in-excel)
- [Microsoft 365 Insider blog: Control data conversions in Excel for Windows and Mac (read November 8, 2026)](https://techcommunity.microsoft.com/blog/microsoft365insiderblog/control-data-conversions-in-excel-for-windows-and-mac/4215336)
- [Microsoft Learn: Data types in Power Query (read November 8, 2026)](https://learn.microsoft.com/en-us/power-query/data-types)

## Steps

1. **Excel for Microsoft 365 or 2024: turn the conversions off.** On Windows open File \> Options \> Data \> Automatic Data Conversion; on a Mac, Excel \> Preferences \> Edit \> Automatic Data Conversion. Clear the conversions you do not want. This is a setting on your computer, so it applies to every file you open there.
2. **Any version: import with column types.** Use Data \> From Text/CSV, choose Transform Data, and set the risky columns (codes, IDs, ZIP codes) to Text and the date columns with Change type \> Using locale. Remove the automatic "Changed type" step if it already turned them into numbers.
3. **Or fix the file first.** Run the export through the fixer: dates are written as YYYY-MM-DD, codes keep their zeros, and the file is UTF-8 with a BOM. With the Excel option on, codes are written as ="0010" so even a double-click open keeps them.

## Related

- [Excel's automatic data conversion settings](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/excel-automatic-data-conversion/)
- [Power Query: keep leading zeros on every refresh](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/power-query-keep-leading-zeros/)
- [Keep leading zeros in a CSV](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/keep-leading-zeros-csv/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/open-csv-in-excel-without-changing-data/  
Data as of: 2026-11-08
