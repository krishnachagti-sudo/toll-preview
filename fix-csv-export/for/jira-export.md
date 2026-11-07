# Jira CSV export garbled in Excel

Atlassian says Jira's CSV export is UTF-8, which Excel versions before 1610 (Build 7466.2038) do not show correctly by default. This 3-issue export has 6 values with accents; the fixed file starts with the BOM bytes EF BB BF, so Excel reads them as UTF-8 and shows Café, not CafÃ©.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Issue+key%2CSummary%2CReporter%0AOPS-101%2CCaf%C3%A9+menu+sync+fails%2CZo%C3%AB+Mart%C3%ADn%0AOPS-102%2CR%C3%A9sum%C3%A9+upload+stalls%2CJos%C3%A9+N%C3%BA%C3%B1ez%0AOPS-103%2CFix+K%C3%B6ln+office+address%2CJ%C3%BCrgen+Wei%C3%9F%0A&dates=iso&enc=utf-8-bom)

## Atlassian's fixes

Re-save the file as UTF-8 with BOM in Notepad, or import it with Data \> From Text and file origin Unicode (UTF-8).

## If the file was already saved garbled

When someone opened the export, saw CafÃ© and saved it, the garbled characters are now in the file. Adding a BOM does not undo that. The fixer turns each garbled value back into the original text, only where that gives valid UTF-8. [How garbled text is repaired](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-encoding-windows-1252-to-utf-8/).

> Endwise is not affiliated with Atlassian.

## Sources

- [Atlassian Support: CSV files exported from search results are garbled when opened by Excel (read November 8, 2026)](https://support.atlassian.com/jira/kb/csv-files-exported-from-search-results-are-garbled-when-open-by-excel/)
- [Unicode FAQ: UTF-8, UTF-16, UTF-32 and BOM (read November 8, 2026)](https://www.unicode.org/faq/utf_bom.html)

## Related

- [UTF-8 with or without a BOM](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-utf-8-bom/)
- [Windows-1252 to UTF-8, and garbled accents](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-encoding-windows-1252-to-utf-8/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/for/jira-export/  
Data as of: 2026-11-08
