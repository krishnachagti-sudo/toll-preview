# CSV dates flipped between DD/MM and MM/DD

In this 4-row UK invoice export, 2 dates (13/04/2026 and 28/04/2026) can only be DD/MM, because no month is above 12, so the whole column reads DD/MM: 03/04/2026 is April 3, 2026, not March 4. Excel reads a CSV's dates in your computer's date order, which is why the same file flips on a US machine.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Invoice%2CIssued%2CAmount%0AUK-1041%2C03%2F04%2F2026%2C120.00%0AUK-1042%2C13%2F04%2F2026%2C75.50%0AUK-1043%2C28%2F04%2F2026%2C310.00%0AUK-1044%2C05%2F05%2F2026%2C42.00%0A&dates=iso&enc=utf-8-bom)

## What each date proves

| In the file | Reads as | Written as |
| --- | --- | --- |
| 03/04/2026 | either way | 2026-04-03 |
| 13/04/2026 | only DD/MM | 2026-04-13 |
| 28/04/2026 | only DD/MM | 2026-04-28 |
| 05/05/2026 | the same either way | 2026-05-05 |

A column is read by its proof: one value with a day above 12 settles the order for the whole column, because one system wrote it. Values that read either way, like 03/04/2026, then follow the column. 05/05/2026 is the same date either way.

## When nothing proves it

If every date in a column has both parts at 12 or below, the file cannot say which order it uses. The fixer then leaves those dates as written and asks you to choose the order once; the recipe remembers it.

## Why some dates stay as text in Excel

On a computer set to MM/DD, Excel turns 03/04/2026 into March 4 and leaves 13/04/2026 as text, because there is no month 13. People report exactly this on [Microsoft's Tech Community](https://techcommunity.microsoft.com/t5/excel/date-format-changes/td-p/3842810). Writing the dates as YYYY-MM-DD before opening the file avoids it: that order reads the same everywhere.

## Sources

- [Microsoft Learn: How Excel works with two-digit year numbers (read November 8, 2026)](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/two-digit-year-numbers)
- [Microsoft Learn: Data types in Power Query (read November 8, 2026)](https://learn.microsoft.com/en-us/power-query/data-types)

## Questions

### How can I tell which date format a column uses?

Look for a value whose first part is above 12: it can only be DD/MM. A second part above 12 proves MM/DD. In this worked file 2 of 4 values prove DD/MM.

### How does Excel read two-digit years in a CSV?

Imported dates follow the 2029 rule: two-digit years 00 to 29 are 2000 to 2029, 30 to 99 are 1930 to 1999.

## Related

- [One column, two date formats](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-mixed-date-formats/)
- [QuickBooks Online bank CSV dates](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/for/quickbooks-online-bank-import/)
- [Open a CSV in Excel without changing it](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/open-csv-in-excel-without-changing-data/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-date-format-dd-mm-mm-dd/  
Data as of: 2026-11-08
