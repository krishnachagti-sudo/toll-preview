# Excel and leading zeros in UPCs

Excel removes leading zeros and shows long numbers in scientific notation unless the cells are formatted as Text, so a UPC that starts with 0 comes out with 11 digits; format the column as Text before pasting, or put the zero back with =TEXT(A2,"000000000000") and re-check: 36000291452 padded to 036000291452 has a valid check digit.

## Check a code from your sheet

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=61414100001)

## Twelve cells as a spreadsheet leaves them

Made-up codes, checked by the tool.

| Cell | Verdict | What the checker says |
| --- | --- | --- |
| 614141000012 | readable | Readable; check digit valid. |
| 61414100001 | fix | 11 digits: a UPC has 12, and a spreadsheet often drops the leading zero. |
| 6.14141E+11 | fix | "6.14141E+11" is a number a spreadsheet rounded into scientific notation; the last digits are lost. |
| 614141000012.0 | review | "614141000012.0" was stored as a number with decimals. The same GTIN as line 1. |
| 36000291452 | fix | 11 digits: a UPC has 12, and a spreadsheet often drops the leading zero. With it back, 036000291452 has a valid check digit. |
| 0614141000012 | review | The same GTIN as line 1. |
| 6141410000 | fix | 10 digits: Amazon's help lists 12 digits for a UPC, 13 for EAN and JAN and 14 for GTIN-14. |
| '614141000029 | readable | Readable; check digit valid. |
| 614141 000036 | readable | Readable; check digit valid. |
| 6141-4100-0043 | readable | Readable; check digit valid. |
| 5.01235E+12 | fix | "5.01235E+12" is a number a spreadsheet rounded into scientific notation; the last digits are lost. |
| 14141000012 | fix | 11 digits: a UPC has 12, and a spreadsheet often drops the leading zero. |

## The formula

```excel
=TEXT(A2,"000000000000")
```

Microsoft: "the number of zeros in the formula represents the total number of characters you want." Use 12 zeros for UPC-A, 13 for EAN-13, 14 for GTIN-14.

## Why it happens

Microsoft says Excel removes leading zeros and converts numbers longer than 12 digits to scientific notation in a General cell (15 in a Number cell), and keeps only 15 significant digits. A 12-digit UPC can also display as 6.14141E+11 in a narrow General column; if that display is what gets saved to CSV, the digits are lost.

## Sources

- [Microsoft Support: Keeping leading zeros and large numbers (read November 8, 2026)](https://support.microsoft.com/en-us/office/keeping-leading-zeros-and-large-numbers-1bf7b935-36e1-4985-842f-5dfa51f85fe7)
- [Microsoft Support: TEXT function (read November 8, 2026)](https://support.microsoft.com/en-us/office/text-function-20d5ac4d-7b94-49fd-bb38-93d29371225c)
- [Amazon Seller Central help: Find your product ID (GTIN) (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200211450)

## Steps

1. **Format the column as Text first.** Select the column, Ctrl+1, Number tab, Text, before pasting or typing codes (Microsoft).
2. **Restore lost zeros.** In a spare column, =TEXT(A2,"000000000000") pads a UPC back to 12 digits (13 zeros for EAN-13, 14 for GTIN-14); copy it down, then paste as values.
3. **Do not trust scientific notation.** A cell showing 6.14141E+11 may have lost digits; paste the codes again from the GS1 record into a Text column.
4. **Re-check every code.** Run the file through the checker: a padded code must still have a valid check digit.

## Related

- [Check digit explained](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/upc-check-digit-explained/)
- [Fix Error 8572 step by step](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/fix-error-8572-step-by-step/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/excel-leading-zeros-upc/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/excel-leading-zeros-upc.csv
