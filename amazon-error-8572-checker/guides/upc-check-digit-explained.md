# The UPC and EAN check digit

Multiply the digits by 3 and 1 in turn, starting with 3 on the digit next to the check digit, add them, and the check digit is what takes the sum to the next multiple of ten: for the UPC 03600029145\_ the sum is 58, so the check digit is 2; for GS1's own EAN-13 example 629104150021\_ the sum is 57 and the check digit 3.

## Check any code

[Check this code](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/?gtin=036000291452)

## GS1's example, digit by digit

GTIN-13 6291041500213, as GS1 works it.

| Digit | Weight | Product |
| --- | --- | --- |
| 6 | x1 | 6 |
| 2 | x3 | 6 |
| 9 | x1 | 9 |
| 1 | x3 | 3 |
| 0 | x1 | 0 |
| 4 | x3 | 12 |
| 1 | x1 | 1 |
| 5 | x3 | 15 |
| 0 | x1 | 0 |
| 0 | x3 | 0 |
| 2 | x1 | 2 |
| 1 | x3 | 3 |

Sum 57; the next multiple of ten is 60; 60 - 57 = 3.

## More worked codes

| Digits | GTIN length | Sum | Next ten | Check digit | Full code |
| --- | --- | --- | --- | --- | --- |
| 03600029145 | 12 | 58 | 60 | 2 | 036000291452 |
| 61414100001 | 12 | 48 | 50 | 2 | 614141000012 |
| 629104150021 | 13 | 57 | 60 | 3 | 6291041500213 |
| 400638133393 | 13 | 89 | 90 | 1 | 4006381333931 |
| 1061414100001 | 14 | 51 | 60 | 9 | 10614141000019 |

## Common mistakes

- Two digits swapped: the check digit usually no longer fits.
- The leading zero of a UPC dropped by a spreadsheet: 11 digits left.
- A code rounded to scientific notation (6.14141E+11): the last digits are gone.
- A GTIN-14 printed on a case used for a single unit.

## Sources

- [GS1: How to calculate a check digit manually (read November 8, 2026)](https://www.gs1.org/how-calculate-check-digit-manually)
- [GS1: Check digit calculator (read November 8, 2026)](https://www.gs1.org/services/check-digit-calculator)
- [Amazon Seller Central help: Find your product ID (GTIN) (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200211450)

## Steps

1. **Step 1.** Multiply value of each position by 3 or 1
2. **Step 2.** Add results together to create sum
3. **Step 3.** Subtract the sum from nearest equal or higher multiple of ten = Check Digit

## Related

- [Excel and leading zeros](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/excel-leading-zeros-upc/)
- [Fix Error 8572 step by step](https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/fix-error-8572-step-by-step/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/upc-check-digit-explained/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/amazon-error-8572-checker/guides/upc-check-digit-explained.csv
