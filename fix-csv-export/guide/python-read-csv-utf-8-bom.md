# UTF-8 BOM CSVs in Python and PowerShell

A UTF-8 byte order mark is 3 bytes (EF BB BF) at the start of a file. Python's utf-8-sig codec skips them when reading and writes them when writing, and PowerShell 7.6's Export-Csv writes no BOM unless you pass -Encoding utf8BOM, so pick the one the file's reader needs.

## Python

On encoding the utf-8-sig codec writes 0xef, 0xbb, 0xbf as the first three bytes; on decoding it skips those three bytes if they appear first.

```python
import csv

with open('export.csv', newline='', encoding='utf-8-sig') as f:
    rows = list(csv.reader(f))   # no BOM stuck to the first heading

with open('for-excel.csv', 'w', newline='', encoding='utf-8-sig') as f:
    csv.writer(f).writerows(rows)  # starts with EF BB BF
```

## pandas: keep codes as text

Use str or object together with suitable na\_values settings to preserve and not interpret dtype. By default empty strings, NaN, N/A, NULL and other common markers are read as missing values.

```python
import pandas as pd

df = pd.read_csv('export.csv', encoding='utf-8-sig', dtype=str, keep_default_na=False)
df.to_csv('for-excel.csv', index=False, encoding='utf-8-sig')
```

## PowerShell

The -Encoding default is utf8NoBOM; utf8BOM writes UTF-8 with a byte order mark.

```powershell
Import-Csv .\export.csv | Export-Csv .\for-excel.csv -Encoding utf8BOM -UseQuotes AsNeeded
```

A script that runs every month still needs to know which columns are codes and which order the dates are in. The fixer works that out and saves it as a recipe you can send with each call. [Save a recipe](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/saved-recipe/).

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Name%2CCity%2CNote%0ARen%C3%A9e+Dubois%2CMontr%C3%A9al%2CCaf%C3%A9+order%0AJ%C3%BCrgen+Wei%C3%9F%2CK%C3%B6ln%2CPaid+in+%E2%82%AC%0AAna+Mu%C3%B1oz%2CSan+Jos%C3%A9%2CDeposit%0A&dates=iso&enc=utf-8-bom)

## Sources

- [Python documentation: codecs, encodings.utf\_8\_sig (read November 8, 2026)](https://docs.python.org/3/library/codecs.html)
- [pandas 3.1.1 documentation: pandas.read\_csv (read November 8, 2026)](https://pandas.pydata.org/docs/reference/api/pandas.read_csv.html)
- [Microsoft Learn: Export-Csv (PowerShell 7.6) (read November 8, 2026)](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/export-csv)
- [Unicode FAQ: UTF-8, UTF-16, UTF-32 and BOM (read November 8, 2026)](https://www.unicode.org/faq/utf_bom.html)

## Related

- [UTF-8 with or without a BOM](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-utf-8-bom/)
- [pandas vs a saved recipe](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/vs/pandas/)
- [Semicolon or comma: delimiters by locale](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/delimiters-locale/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/python-read-csv-utf-8-bom/  
Data as of: 2026-11-08
