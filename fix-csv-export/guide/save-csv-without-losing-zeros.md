# Save as CSV without losing zeros or digits

A CSV saved from Excel holds what Excel had in its cells, so zeros it already removed and digits past the 15th it already dropped are saved that way; in the worked file 2 account codes and 5 ZIP codes had to be restored afterwards. Keep the risky columns as text from the moment the file is opened, or fix the file outside Excel and do not round-trip it.

## A round trip, restored

A file saved from Excel, restored with the account width 4

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

Number formatting does not help here: number formatting will not restore leading zeros removed before formatting.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Account%2CVendor%2CZIP%0A10%2CNorth+Depot%2C2134%0A200%2CHarbor+Supply%2C7030%0A3000%2CRidge+Co%2C90210%0A4100%2CBayline%2C501%0A1250%2CCedar+Mills%2C60614%0A3300%2CPine+Freight%2C2116%0A5120%2COak+Tools%2C10001%0A2210%2CElm+Paper%2C8540%0A6045%2CAsh+Metals%2C30303%0A7300%2CBirch+Foods%2C98101%0A&dates=iso&enc=utf-8-bom)

## Sources

- [Microsoft Support: Keeping leading zeros and large numbers (read November 8, 2026)](https://support.microsoft.com/en-us/excel/keeping-leading-zeros-and-large-numbers)
- [Microsoft Support: Data import and analysis options (read November 8, 2026)](https://support.microsoft.com/en-US/Excel/data-import-and-analysis-options-in-excel)

## Steps

1. **Open with the columns as text.** Turn off the conversions (Microsoft 365, Excel 2024) or import with the code and ID columns set to Text, before you edit anything.
2. **Edit and save as CSV UTF-8.** Text cells are saved as written, zeros and all. Choose the CSV UTF-8 type so accented characters survive.
3. **If the zeros are already gone.** Run the saved file through the fixer with the code width stated (ZIP codes need no width: they are 5 digits). Digits Excel cut from long IDs cannot be restored; export those again from the source.

## Related

- [Keep leading zeros in a CSV](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/keep-leading-zeros-csv/)
- [Long IDs and scientific notation](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-long-numbers-scientific-notation/)
- [Save a recipe for a monthly export](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/saved-recipe/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/save-csv-without-losing-zeros/  
Data as of: 2026-11-08
