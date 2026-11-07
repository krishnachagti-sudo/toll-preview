# OpenRefine vs a saved recipe

OpenRefine is free and open source and runs on your own computer, and its operation history can be replayed on a new version of the data. The fixer runs in a browser with nothing to install, and for a monthly export it settles DD/MM vs MM/DD from the values in each column, restores ZIP codes to 5 digits and saves the fix as a recipe; for deep one-off cleaning, OpenRefine does far more.

## What OpenRefine does

- A free, open source tool that cleans data on your own machine.
- Its operation history can be replayed on a new version of the data.
- It is a general tool: faceting, clustering and transformations of any kind.

## What the fixer does

- Reads the encoding from the bytes and repairs garbled accents value by value.
- Proves DD/MM or MM/DD per column from the values, settles mixed columns row by row and lists ambiguous dates instead of guessing.
- Restores ZIP codes by rule and other codes only to a width you state; flags long IDs Excel already cut.
- Saves all of it as a recipe for next month's file, with a warning when columns change. The scan is free in the browser; the fixed file is $0.25.

## When OpenRefine is the better choice

- Deep one-off cleaning: clustering near-duplicate names, reshaping, reconciling against other data.
- Files far larger than 2 MB.
- When you want everything to stay on your computer, including the fix.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Account%2CCustomer%2CZIP%2CPosted%2CAmount%2COrder+ID%0A0010%2CCaf%C3%83%C2%A9+Rio%2C2134%2C13%2F03%2F2026%2C%22%241%2C200.50%22%2C4000123412341234%0A0200%2CZo%C3%83%C2%AB+Park%2C90210%2C03%2F04%2F2026%2C%2845.00%29%2C4000123412349876%0A3000%2CAnn+Lee%2C501%2C05%2F05%2F2026%2C12.00%2C1.23457E%2B15%0A0040%2C%C3%83%E2%80%B0lise+Roy%2C7030%2C28%2F02%2F2026%2C%22%242%2C050.00%22%2C4000555566667777%0A&dates=iso&enc=utf-8-bom)

## Sources

- [OpenRefine (read November 8, 2026)](https://openrefine.org/)

## Related

- [Power Query vs a saved recipe](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/vs/power-query/)
- [Save a recipe for a monthly export](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/saved-recipe/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/vs/openrefine/  
Data as of: 2026-11-08
