# Power Query vs a saved recipe

Power Query detects column types from the first 200 rows of a CSV and reads dates in one locale per column, which works when a column uses one order. The fixer proves the order from every value, settles a column holding both DD/MM and MM/DD row by row, lists the ambiguous rows, and writes a file anyone can open; if your report already lives in Excel and refreshes from a folder, Power Query is the better home.

## What Power Query does

- For CSV and text files, automatic type detection inspects the first 200 rows and adds a Changed type step; it is on by default.
- Change type \> Using locale reads a column in a chosen locale, such as English (United Kingdom) for day/month/year.
- The steps are saved in the workbook and run again on refresh.

## What the fixer does

- Reads the encoding from the bytes and repairs garbled accents value by value.
- Proves DD/MM or MM/DD per column from the values, settles mixed columns row by row and lists ambiguous dates instead of guessing.
- Restores ZIP codes by rule and other codes only to a width you state; flags long IDs Excel already cut.
- Saves all of it as a recipe for next month's file, with a warning when columns change. The scan is free in the browser; the fixed file is $0.25.

## When Power Query is the better choice

- Your report is in Excel or Power BI and refreshes from the same source.
- You need joins, pivots or merges across files after cleaning.
- Each date column uses a single order, so Using locale settles it.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Account%2CCustomer%2CZIP%2CPosted%2CAmount%2COrder+ID%0A0010%2CCaf%C3%83%C2%A9+Rio%2C2134%2C13%2F03%2F2026%2C%22%241%2C200.50%22%2C4000123412341234%0A0200%2CZo%C3%83%C2%AB+Park%2C90210%2C03%2F04%2F2026%2C%2845.00%29%2C4000123412349876%0A3000%2CAnn+Lee%2C501%2C05%2F05%2F2026%2C12.00%2C1.23457E%2B15%0A0040%2C%C3%83%E2%80%B0lise+Roy%2C7030%2C28%2F02%2F2026%2C%22%242%2C050.00%22%2C4000555566667777%0A&dates=iso&enc=utf-8-bom)

## Sources

- [Microsoft Learn: Data types in Power Query (read November 8, 2026)](https://learn.microsoft.com/en-us/power-query/data-types)

## Related

- [Power Query: keep leading zeros on every refresh](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/power-query-keep-leading-zeros/)
- [One column, two date formats](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-mixed-date-formats/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/vs/power-query/  
Data as of: 2026-11-08
