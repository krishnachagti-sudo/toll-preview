# Currency symbols and negative numbers

An amount written as $4,200.00 or (1,850.00) is text to a spreadsheet or an importer, so totals skip it. In this 3-row ledger 3 amounts are rewritten as plain numbers: (1,850.00) becomes -1850.00, $4,200.00 becomes 4200.00 and 12.50- becomes -12.50, with the decimal places kept as written.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Date%2CPayee%2CAmount%0A2026-03-02%2CRent%2C%22%281%2C850.00%29%22%0A2026-03-04%2CClient+A%2C%22%244%2C200.00%22%0A2026-03-09%2CBank+fee%2C12.50-%0A&dates=iso&enc=utf-8-bom)

## The rules

| In the file | Decimal mark | Written as |
| --- | --- | --- |
| $1,200.50 | point | 1200.50 |
| (45.00) | point | -45.00 |
| 45.00- | point | -45.00 |
| -$3.10 | point | -3.10 |
| £2,050 | point | 2050 |
| € 1.234,56 | comma | 1234.56 |
| 12,5 | comma | 12.5 |
| (1.000,00) | comma | -1000.00 |
| 1,2,3 | point | left as written |
| 12 USD | point | left as written |

- Brackets and a trailing minus both mean negative; both together cancel out.
- Currency signs (such as $ £ € ¥) and spaces are removed; letters (USD) are not, so the value is left as written and listed.
- With a decimal point, commas must group digits in threes; with a decimal comma, points must.

## The worked ledger

Ledger export, amounts written as plain numbers

| Date | Payee | Amount |
| --- | --- | --- |
| 2026-03-02 | Rent | (1,850.00) → -1850.00 |
| 2026-03-04 | Client A | $4,200.00 → 4200.00 |
| 2026-03-09 | Bank fee | 12.50- → -12.50 |

## Sources

- [Intuit QuickBooks: Common errors for importing bank transactions using CSV (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-articles/common-errors-for-importing-bank-transactions-using-csv/00/324768)

## Related

- [QuickBooks Online bank CSV import](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/for/quickbooks-online-bank-import/)
- [Semicolon or comma: delimiters by locale](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/delimiters-locale/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/negative-numbers-currency-formats/  
Data as of: 2026-11-08
