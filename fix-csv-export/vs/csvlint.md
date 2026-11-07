# CSV Lint vs a recipe-based fixer

CSV Lint checks that a CSV is readable and, with a schema, that it has the expected columns and value types; it reports, it does not change the file. The fixer changes the file: 3 ZIP codes, 4 dates and 3 garbled names in the sample export are rewritten, with a report of each change, and the fix is saved as a recipe.

## What CSV Lint does

- Checks that a CSV is readable and, with a schema, that it has the expected columns and value types.
- Submitted files are deleted after validation; reports are kept without file names or contents.

## What the fixer does

- Reads the encoding from the bytes and repairs garbled accents value by value.
- Proves DD/MM or MM/DD per column from the values, settles mixed columns row by row and lists ambiguous dates instead of guessing.
- Restores ZIP codes by rule and other codes only to a width you state; flags long IDs Excel already cut.
- Saves all of it as a recipe for next month's file, with a warning when columns change. The scan is free in the browser; the fixed file is $0.25.

## When CSV Lint is the better choice

- Publishing open data that must meet a published schema.
- You need a validation report, not a changed file.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Account%2CCustomer%2CZIP%2CPosted%2CAmount%2COrder+ID%0A0010%2CCaf%C3%83%C2%A9+Rio%2C2134%2C13%2F03%2F2026%2C%22%241%2C200.50%22%2C4000123412341234%0A0200%2CZo%C3%83%C2%AB+Park%2C90210%2C03%2F04%2F2026%2C%2845.00%29%2C4000123412349876%0A3000%2CAnn+Lee%2C501%2C05%2F05%2F2026%2C12.00%2C1.23457E%2B15%0A0040%2C%C3%83%E2%80%B0lise+Roy%2C7030%2C28%2F02%2F2026%2C%22%242%2C050.00%22%2C4000555566667777%0A&dates=iso&enc=utf-8-bom)

## Sources

- [CSV Lint (Open Data Institute) (read November 8, 2026)](https://csvlint.io/)

## Related

- [Commas inside CSV fields](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/csv-with-commas-in-fields/)
- [OpenRefine vs a saved recipe](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/vs/openrefine/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/vs/csvlint/  
Data as of: 2026-11-08
