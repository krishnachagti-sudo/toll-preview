# One column, two date formats

Of the 6 dates in this merged export, 1 proves DD/MM, 1 proves MM/DD, 1 reads the same either way, 2 are written year-first or with a month name, and 1 (02/03/2026) could be either: each provable row is read its own way and the ambiguous one is left as written and listed, never guessed.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Ref%2CDate%2CSource%0AA1%2C13%2F01%2F2026%2CUK+shop%0AA2%2C01%2F13%2F2026%2CUS+shop%0AA3%2C02%2F03%2F2026%2CUK+shop%0AA4%2C07%2F07%2F2026%2CUS+shop%0AA5%2C2026-01-20%2CAPI%0AA6%2C20+Jan+2026%2CEmail%0A&dates=iso&enc=utf-8-bom)

## Row by row

| Ref | Date | Source | What it proves | Written as |
| --- | --- | --- | --- | --- |
| A1 | 13/01/2026 | UK shop | proves DD/MM | 2026-01-13 |
| A2 | 01/13/2026 | US shop | proves MM/DD | 2026-01-13 |
| A3 | 02/03/2026 | UK shop | could be either | left as written |
| A4 | 07/07/2026 | US shop | same either way | 2026-07-07 |
| A5 | 2026-01-20 | API | year first | left as written |
| A6 | 20 Jan 2026 | Email | month name | 2026-01-20 |

## Why swapping the column breaks it

Swapping day and month for the whole column fixes the rows from one system and breaks the rows from the other. That is what people report on the [Microsoft Fabric community](https://community.fabric.microsoft.com/t5/Desktop/Column-with-mixed-date-types-half-is-mm-dd-yyyy-half-is-dd-mm/m-p/1147653). Power Query's "Using locale" reads a whole column in one locale, so it has the same problem with a mixed column.

## Settling the ambiguous rows

- Leave them as written (the default): they are listed with their line numbers in the scan and the change report.
- If you know where they came from (all ambiguous rows are from the US shop, say), set the recipe to read ambiguous dates as MM/DD or DD/MM. That is your decision, recorded in the recipe, not a guess by the tool.
- Ask the source system to export ISO dates (YYYY-MM-DD), which cannot be read two ways.

## Sources

- [Microsoft Learn: Data types in Power Query (read November 8, 2026)](https://learn.microsoft.com/en-us/power-query/data-types)
- [Microsoft Learn: How Excel works with two-digit year numbers (read November 8, 2026)](https://learn.microsoft.com/en-us/troubleshoot/microsoft-365-apps/excel/two-digit-year-numbers)

## Related

- [CSV dates flipped between DD/MM and MM/DD](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-date-format-dd-mm-mm-dd/)
- [Save a recipe for a monthly export](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/saved-recipe/)
- [Power Query vs a recipe](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/vs/power-query/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-mixed-date-formats/  
Data as of: 2026-11-08
