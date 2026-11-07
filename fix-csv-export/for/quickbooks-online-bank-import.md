# QuickBooks Online bank CSV import

QuickBooks Online needs Date, Description and Amount columns, with every date in the format you pick when mapping. In this 4-row bank export, the dates, written 4 different ways (Mar 2 2026, 2026-03-05, 03/09/2026, 3/16/2026), all come out as MM/DD/YYYY (3 of them change) and 3 amounts lose their $ signs, digit-grouping commas and brackets.

## Run this example in the fixer

[Open this file in the fixer](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/?text=Date%2CDescription%2CAmount%0AMar+2+2026%2COpening+deposit%2C%22%241%2C200.00%22%0A2026-03-05%2CCard+fee%2C%284.50%29%0A03%2F09%2F2026%2COffice+supplies%2C-38.20%0A3%2F16%2F2026%2CClient+payment%2C%22%242%2C450.00%22%0A&dates=mdy&enc=utf-8-bom)

## What Intuit says

- The columns QuickBooks requires are Date, Description and Amount.
- The date format must match the one chosen at the mapping stage.
- Keep the amount column as simple as possible: Currency formatting changed to General.
- Special characters in the bank description can prevent the import.

## The worked bank file

Bank export, dates as MM/DD/YYYY and amounts plain

| Date | Description | Amount |
| --- | --- | --- |
| Mar 2 2026 → 03/02/2026 | Opening deposit | $1,200.00 → 1200.00 |
| 2026-03-05 → 03/05/2026 | Card fee | (4.50) → -4.50 |
| 03/09/2026 | Office supplies | -38.20 |
| 3/16/2026 → 03/16/2026 | Client payment | $2,450.00 → 2450.00 |

Money going out stays negative: (4.50) becomes -4.50. Pick MM/DD/YYYY when QuickBooks asks for the date format at the mapping step, because that is what the fixed file holds.

> Endwise is not affiliated with Intuit. QuickBooks's own rules are quoted from its help page on the date shown; check your bank feed settings in QuickBooks too.

## Sources

- [Intuit QuickBooks: Common errors for importing bank transactions using CSV (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-articles/common-errors-for-importing-bank-transactions-using-csv/00/324768)

## Questions

### What columns does QuickBooks Online need in a bank CSV?

The columns QuickBooks requires are Date, Description and Amount. The date format must match the one chosen at the mapping stage.

## Related

- [Currency symbols and negative numbers in exports](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/negative-numbers-currency-formats/)
- [CSV dates flipped between DD/MM and MM/DD](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/csv-date-format-dd-mm-mm-dd/)
- [Save a recipe for a monthly export](https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/guides/saved-recipe/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fix-csv-export/for/quickbooks-online-bank-import/  
Data as of: 2026-11-08
