# Power Query: keep leading zeros on every refresh

Power Query looks at the first 200 rows of a CSV and adds a "Changed type" step that turns a column of digits into numbers, so 0010 becomes 10 again on every refresh. Set those columns to Text in that step, or switch type detection off, and read date columns with Change type \> Using locale.

> For CSV and text files, automatic type detection inspects the first 200 rows and adds a Changed type step; it is on by default.

## What Using locale does not do

Using locale reads the whole column in one order. A column that mixes DD/MM and MM/DD rows gets errors or wrong dates either way. [Fixing a mixed date column](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-mixed-date-formats/).

## Check a date column before it reaches Power Query

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Ref%2CDate%2CSource%0AA1%2C13%2F01%2F2026%2CUK+shop%0AA2%2C01%2F13%2F2026%2CUS+shop%0AA3%2C02%2F03%2F2026%2CUK+shop%0AA4%2C07%2F07%2F2026%2CUS+shop%0AA5%2C2026-01-20%2CAPI%0AA6%2C20+Jan+2026%2CEmail%0A&dates=iso&enc=utf-8-bom)

## Sources

- [Microsoft Learn: Data types in Power Query (read November 8, 2026)](https://learn.microsoft.com/en-us/power-query/data-types)

## Steps

1. **Find the Changed type step.** In the Power Query editor, look under Applied steps for "Changed type", added right after the headers were promoted.
2. **Set codes to Text.** Select it and change the code, ID and ZIP columns to Text (the icon left of the heading, or Transform \> Data type). Do it in that step, not a later one: once a later step sees numbers, the zeros are gone.
3. **Read dates in their locale.** For a DD/MM column, right-click the heading, Change type \> Using locale, and choose Date with a DD/MM locale such as English (United Kingdom).
4. **Or turn detection off.** In Power Query Desktop: File \> Options and settings \> Options \> Data load \> Type detection, and choose to never detect column types for unstructured sources (or set it for the current file only).

## Related

- [Power Query vs a saved recipe](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/vs/power-query/)
- [Keep leading zeros in a CSV](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/keep-leading-zeros-csv/)
- [One column, two date formats](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-mixed-date-formats/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/power-query-keep-leading-zeros/  
Data as of: 2026-11-08
