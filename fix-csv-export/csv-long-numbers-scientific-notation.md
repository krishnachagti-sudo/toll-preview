# Long IDs and scientific notation

Excel keeps 15 significant digits, so a 16-digit ID such as 4000123412341234 opened in Excel is kept as 4000123412341230. In this order export 5 IDs have 16 or more digits and stay text in the fixed file, and 1 (1.23457E+15) was already saved in scientific notation: its lost digits are not in the file, so it is flagged, not invented.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Order+ID%2CTracking%2CTotal%0A4000123412341234%2C9400111899223344556677%2C18.00%0A4000123412349876%2C9400111899223344556688%2C7.25%0A1.23457E%2B15%2C9400111899223344556699%2C12.00%0A&dates=iso&enc=utf-8-bom)

## The worked file

Order export: long IDs kept as text, the damaged value flagged

| Order ID | Tracking | Total |
| --- | --- | --- |
| 4000123412341234 | 9400111899223344556677 | 18.00 |
| 4000123412349876 | 9400111899223344556688 | 7.25 |
| 1.23457E+15 | 9400111899223344556699 | 12.00 |

## Which values are at risk

- Order numbers from e-commerce platforms
- Card-style numbers and gift card codes
- Parcel tracking numbers (often 20 or more digits)
- Bank account and barcode numbers

Turning off "Keep first 15 digits of long numbers and display in scientific notation" in Excel for Microsoft 365 or Excel 2024 keeps them as text when you open the file. [The four conversion settings](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/excel-automatic-data-conversion/).

## Sources

- [Microsoft Support: Keeping leading zeros and large numbers (read November 8, 2026)](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers)
- [Microsoft Support: Data import and analysis options (read November 8, 2026)](https://support.microsoft.com/en-US/Excel/data-import-and-analysis-options-in-excel)

## Questions

### Why do long ID numbers turn into 1.23E+15?

Excel has a maximum precision of 15 significant digits. Unless the conversion is turned off, Excel stores a 16-digit number with its last digits as zeros and shows it in scientific notation.

### Can the lost digits be recovered?

Not from the saved file: once it holds 1.23457E+15 or a 15-digit value, the original digits are gone. Export the file again from the source system.

## Related

- [Excel's automatic data conversion settings](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/excel-automatic-data-conversion/)
- [Save as CSV without losing zeros or digits](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/save-csv-without-losing-zeros/)
- [Keep leading zeros in a CSV](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/keep-leading-zeros-csv/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-long-numbers-scientific-notation/  
Data as of: 2026-11-08
