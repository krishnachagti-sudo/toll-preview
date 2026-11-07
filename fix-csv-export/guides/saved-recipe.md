# Save a recipe for a monthly export

A recipe is the fix saved as settings: 5 column rules, the input and output choices, and the header row it was made from, never your data. Applied to next month's export it found 1 column missing (ZIP) and 2 new (Postal Code, Channel), gave the new ones the suggested rules, and fixed the 2 rows the same way as last month.

## Try next month's file in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Account%2CCustomer%2CPostal+Code%2CPosted%2CAmount%2COrder+ID%2CChannel%0A0010%2CAnn+Lee%2C2134%2C14%2F04%2F2026%2C%22%245.00%22%2C4000123412340001%2CWeb%0A0200%2CBo+Diaz%2C501%2C02%2F04%2F2026%2C%2812.00%29%2C4000123412340002%2CPhone%0A&dates=iso&enc=utf-8-bom)

## What a recipe holds

```json
{
  "v": 1,
  "name": "Monthly bank export",
  "headers": [
    "Account",
    "Customer",
    "ZIP",
    "Posted",
    "Amount",
    "Order ID"
  ],
  "input": {
    "encoding": "auto",
    "delimiter": ",",
    "header": true,
    "repairMojibake": true
  },
  "output": {
    "encoding": "utf-8-bom",
    "delimiter": ",",
    "lineEnd": "crlf",
    "dates": "iso",
    "excelGuard": false
  },
  "columns": {
    "Account": {
      "type": "code",
      "width": 4
    },
    "ZIP": {
      "type": "zip"
    },
    "Posted": {
      "type": "date",
      "order": "dmy"
    },
    "Amount": {
      "type": "number"
    },
    "Order ID": {
      "type": "code"
    }
  }
}
```

The header row also gives the recipe a short signature (85d9bc28 for this one), so a recipe is matched to files with the same columns. Headings match whatever their case and spacing.

## Next month's file

Next month: "ZIP" became "Postal Code" and "Channel" was added

| Account | Customer | Postal Code | Posted | Amount | Order ID | Channel |
| --- | --- | --- | --- | --- | --- | --- |
| 0010 | Ann Lee | 2134 → 02134 | 14/04/2026 → 2026-04-14 | $5.00 → 5.00 | 4000123412340001 | Web |
| 0200 | Bo Diaz | 501 → 00501 | 02/04/2026 → 2026-04-02 | (12.00) → -12.00 | 4000123412340002 | Phone |

"Postal Code" is new to the recipe, so it got the suggested rule (it is a ZIP column by its heading). Save the recipe again after checking, and the change is remembered.

## Sharing a recipe

Send the JSON file to a colleague; it holds no values from your data, only column headings and rules. They choose it in the fixer next to their file.

## Steps

1. **Scan this month's file.** Choose the file in the fixer. The scan suggests a rule for each column; change any you disagree with (a code width, a date order).
2. **Download the fixed file.** The recipe comes with it, as a small JSON file, and is remembered in your browser for files with the same columns.
3. **Next month, choose the new file.** The remembered recipe is used by itself. If the columns changed, the scan says which; new columns get the suggested rule until you choose.
4. **From code.** Send the recipe with each call to the API or MCP tool. The same file and recipe always give the same bytes.

## Related

- [Keep leading zeros in a CSV](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/keep-leading-zeros-csv/)
- [One column, two date formats](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-mixed-date-formats/)
- [Read a UTF-8 BOM CSV in Python and PowerShell](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/python-read-csv-utf-8-bom/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/saved-recipe/  
Data as of: 2026-11-08
