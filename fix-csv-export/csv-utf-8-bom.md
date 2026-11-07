# UTF-8 with or without a BOM

A UTF-8 byte order mark (BOM) is the 3 bytes EF BB BF at the very start of a file. This 3-row export has 8 values with accents that Excel can show garbled when the BOM is missing; the fixed file starts with EF BB BF, so Excel reads them as UTF-8.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Name%2CCity%2CNote%0ARen%C3%A9e+Dubois%2CMontr%C3%A9al%2CCaf%C3%A9+order%0AJ%C3%BCrgen+Wei%C3%9F%2CK%C3%B6ln%2CPaid+in+%E2%82%AC%0AAna+Mu%C3%B1oz%2CSan+Jos%C3%A9%2CDeposit%0A&dates=iso&enc=utf-8-bom)

## Which to choose

| The file is for | Save as | Why |
| --- | --- | --- |
| Excel (double-click open) | UTF-8 with a BOM | The BOM tells Excel the file is UTF-8. |
| Python, R, a database import | UTF-8 without a BOM | A reader that does not expect it may keep the three bytes at the start of the first heading. |
| An older system that wants Windows-1252 | Windows-1252 | Characters it has no byte for are written as "?" and counted in the result. |

## The worked file

The values do not change; only the first three bytes of the file do

| Name | City | Note |
| --- | --- | --- |
| Renée Dubois | Montréal | Café order |
| Jürgen Weiß | Köln | Paid in € |
| Ana Muñoz | San José | Deposit |

Already garbled text such as CafÃ© is a different problem: the bytes were read the wrong way at some point. [Windows-1252 and garbled accents](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-encoding-windows-1252-to-utf-8/).

## Sources

- [Unicode FAQ: UTF-8, UTF-16, UTF-32 and BOM (read November 8, 2026)](https://www.unicode.org/faq/utf_bom.html)
- [Atlassian Support: CSV files exported from search results are garbled when opened by Excel (read November 8, 2026)](https://support.atlassian.com/jira/kb/csv-files-exported-from-search-results-are-garbled-when-open-by-excel/)
- [Python documentation: codecs, encodings.utf\_8\_sig (read November 8, 2026)](https://docs.python.org/3/library/codecs.html)

## Questions

### What is a UTF-8 BOM?

The byte sequence EF BB BF at the start of a file. The UTF-8 byte order mark is EF BB BF; UTF-8 can contain a BOM, used only as a signature.

### Should my CSV have a BOM?

Yes for a file people open in Excel. Leave it off for a file read by a script or database that does not expect it, where it can end up stuck to the first column heading.

## Related

- [Convert Windows-1252 to UTF-8](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-encoding-windows-1252-to-utf-8/)
- [Read a UTF-8 BOM CSV in Python and PowerShell](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guide/python-read-csv-utf-8-bom/)
- [Jira CSV export garbled in Excel](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/for/jira-export/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-utf-8-bom/  
Data as of: 2026-11-08
