# Excel's automatic data conversion settings

Excel for Microsoft 365 and Excel 2024 have 4 automatic data conversion switches, under File \> Options \> Data \> Automatic Data Conversion on Windows and Excel \> Preferences \> Edit \> Automatic Data Conversion on a Mac. Clearing "Remove leading zeros and convert to a number" keeps leading zeros, and clearing "Keep first 15 digits of long numbers and display in scientific notation" keeps all the digits of long IDs, when you open a CSV.

## The switches

| Setting | Clear it to keep |
| --- | --- |
| Remove leading zeros and convert to a number | Leading zeros: 00123 stays 00123, as text |
| Keep first 15 digits of long numbers and display in scientific notation | All digits of numbers with 16 or more digits, as text |
| Convert digits surrounding the letter "E" into a number in scientific notation | Values like 1E5 as text |
| Convert continuous letters and numbers to a date | Values like JAN1 as text (JAN 1 or JAN-1 may still become dates) |

There is also "When loading a .csv file or similar file, notify me of any automatic data conversions". With it on, Excel tells you which conversions it is about to make when you open a CSV.

## Versions

Automatic Data Conversions is available in Excel for Microsoft 365, Excel for Microsoft 365 for Mac, Excel 2024 and Excel 2024 for Mac. Microsoft's Insider post gives the first builds: Windows Version 2309 (Build 16808.10000) or later; Mac Version 16.77 (Build 23091003) or later. Older versions do not have the switches; import the file with column types instead, or fix it first.

## The limits of a setting

- It is per computer: a colleague opening the same file gets their own settings.
- It does not settle DD/MM against MM/DD; dates are still read in your computer's order.
- It cannot bring back zeros or digits removed by an earlier save.

## Fix the file instead, for everyone who opens it

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Account%2CVendor%2CZIP%0A10%2CNorth+Depot%2C2134%0A200%2CHarbor+Supply%2C7030%0A3000%2CRidge+Co%2C90210%0A4100%2CBayline%2C501%0A1250%2CCedar+Mills%2C60614%0A3300%2CPine+Freight%2C2116%0A5120%2COak+Tools%2C10001%0A2210%2CElm+Paper%2C8540%0A6045%2CAsh+Metals%2C30303%0A7300%2CBirch+Foods%2C98101%0A&dates=iso&enc=utf-8-bom)

## Sources

- [Microsoft Support: Data import and analysis options (read November 8, 2026)](https://support.microsoft.com/en-US/Excel/data-import-and-analysis-options-in-excel)
- [Microsoft Support: Keeping leading zeros and large numbers (read November 8, 2026)](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers)
- [Microsoft 365 Insider blog: Control data conversions in Excel for Windows and Mac (read November 8, 2026)](https://techcommunity.microsoft.com/blog/microsoft365insiderblog/control-data-conversions-in-excel-for-windows-and-mac/4215336)

## Questions

### Which Excel versions have Automatic Data Conversion?

Automatic Data Conversions is available in Excel for Microsoft 365, Excel for Microsoft 365 for Mac, Excel 2024 and Excel 2024 for Mac.

### Where is the setting?

On Windows: File \> Options \> Data \> Automatic Data Conversion. On a Mac: Excel \> Preferences \> Edit \> Automatic Data Conversion.

## Related

- [Open a CSV in Excel without changing it](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/open-csv-in-excel-without-changing-data/)
- [Long IDs and scientific notation](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-long-numbers-scientific-notation/)
- [Gene names turned into dates](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/gene-names-dates/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/excel-automatic-data-conversion/  
Data as of: 2026-11-08
