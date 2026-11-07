# Gene names turned into dates

Excel turns gene symbols such as SEPT2 and MARCH1 into dates, so in 2019 the HUGO Gene Nomenclature Committee renamed them SEPTIN2 and MARCHF1. In this 5-row expression table the scan finds 2 values that look like Excel already made them dates; they cannot be turned back into symbols from the file alone, so they are flagged for you to correct from the source.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Gene%2CSample%2CCount%0ASEPTIN2%2CS1%2C412%0A2-Sep%2CS2%2C388%0AMARCHF1%2CS1%2C97%0A1-Mar%2CS2%2C101%0ATP53%2CS1%2C1220%0A&dates=iso&enc=utf-8-bom)

## What HGNC changed

Throughout 2019 HGNC changed symbols beginning MARCH# to MARCHF#, SEPT# to SEPTIN#, MARC# to MTARC# and DEC1 to DELEC1, because Excel auto-converted them to dates.

## Stopping it

- Excel for Microsoft 365 and Excel 2024: clear "Convert continuous letters and numbers to a date". JAN1 stays as text with the date conversion off, but JAN 1 or JAN-1 might still be treated as dates.
- Any version: import the file with the gene column set to Text.
- Use the current symbols (SEPTIN2, MARCHF1), which Excel leaves alone.

## Finding damage in a file

The scan flags values shaped like an Excel date in a column of text (1-Mar, 2-Sep, Sep-02). It cannot know which symbol each one was: 1-Mar could have been MARCH1 or MARC1. Correct them from the original data.

Nothing is changed: the two date-shaped values are reported

| Gene | Sample | Count |
| --- | --- | --- |
| SEPTIN2 | S1 | 412 |
| 2-Sep | S2 | 388 |
| MARCHF1 | S1 | 97 |
| 1-Mar | S2 | 101 |
| TP53 | S1 | 1220 |

## Sources

- [HGNC Summer newsletter 2020 (read November 8, 2026)](https://blog.genenames.org/newsletters/2020/08/28/Summer_newsletter/)
- [Microsoft Support: Data import and analysis options (read November 8, 2026)](https://support.microsoft.com/en-US/Excel/data-import-and-analysis-options-in-excel)

## Related

- [Excel's automatic data conversion settings](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/excel-automatic-data-conversion/)
- [Open a CSV in Excel without changing it](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/open-csv-in-excel-without-changing-data/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/gene-names-dates/  
Data as of: 2026-11-08
