# pandas vs a saved recipe

pandas keeps codes as text with dtype=str and reads DD/MM dates with dayfirst, but its own docs call per-value format inference ("mixed") risky. The fixer proves each date column's order from its values (in the sample export, 2 dates prove DD/MM), lists the ambiguous ones, and gives the same result with no code, as a recipe your script can send to the API; if you already write Python for the rest of the job, pandas is the natural fit.

## What pandas does

- Use str or object together with suitable na\_values settings to preserve and not interpret dtype.
- dayfirst: DD/MM format dates, international and European format.
- date\_format='mixed' infers the format for each element individually; the docs call this risky.
- By default empty strings, NaN, N/A, NULL and other common markers are read as missing values.

## What the fixer does

- Reads the encoding from the bytes and repairs garbled accents value by value.
- Proves DD/MM or MM/DD per column from the values, settles mixed columns row by row and lists ambiguous dates instead of guessing.
- Restores ZIP codes by rule and other codes only to a width you state; flags long IDs Excel already cut.
- Saves all of it as a recipe for next month's file, with a warning when columns change. The scan is free in the browser; the fixed file is $0.25.

## When pandas is the better choice

- You write Python already and the cleaning is one step of a longer pipeline.
- Files of any size, and transformations of any kind.
- You want the logic in your own code review.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Account%2CCustomer%2CZIP%2CPosted%2CAmount%2COrder+ID%0A0010%2CCaf%C3%83%C2%A9+Rio%2C2134%2C13%2F03%2F2026%2C%22%241%2C200.50%22%2C4000123412341234%0A0200%2CZo%C3%83%C2%AB+Park%2C90210%2C03%2F04%2F2026%2C%2845.00%29%2C4000123412349876%0A3000%2CAnn+Lee%2C501%2C05%2F05%2F2026%2C12.00%2C1.23457E%2B15%0A0040%2C%C3%83%E2%80%B0lise+Roy%2C7030%2C28%2F02%2F2026%2C%22%242%2C050.00%22%2C4000555566667777%0A&dates=iso&enc=utf-8-bom)

## Sources

- [pandas 3.1.1 documentation: pandas.read\_csv (read November 8, 2026)](https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html)

## Related

- [Read a UTF-8 BOM CSV in Python and PowerShell](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/python-read-csv-utf-8-bom/)
- [CSV dates flipped between DD/MM and MM/DD](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-date-format-dd-mm-mm-dd/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/vs/pandas/  
Data as of: 2026-11-08
