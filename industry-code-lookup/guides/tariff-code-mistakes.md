# Tariff code mistakes

Five mistakes cause most code rejections: too few digits (6109.10 is a heading-level line, not a 10-digit entry number), a number that does not exist (6109.10.00.99), an export number on an import (3,775 Schedule B numbers are not HTS numbers), a chapter 99 number alone, and a code from an old edition, such as NAICS 2017 454110.

- Export-only numbers: 3,775

## Check your codes before they ship

[Check it](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/?q=6109.10.00.99%2C+6109.10.00.12%2C+454110&system=auto)

## The five mistakes

| Mistake | Example | What the checker says |
| --- | --- | --- |
| Too few digits for the field | 6109.10 |  |
| A number that does not exist | 6109.10.00.99 | 6109.10.00.99 is not in the US HTS (2026 HTS Revision 22). 6109.10.00 is: T-shirts, singlets, tank tops and similar garments, knitted or crocheted: Of cotton. Its statistical numbers are 6109.10.00.04, 6109.10.00.07, 6109.10.00.11, 6109.10.00.12, 6109.10.00.14, 6109.10.00.18, 6109.10.00.23, 6109.10.00.27 and more. |
| Export number on an import, or the reverse | 3,775 Schedule B numbers are not HTS numbers; 13,827 HTS numbers are not Schedule B numbers | Each Schedule B check says whether the same digits are an HTS number. |
| Chapter 99 alone | 9903.88.03 | Chapter 99 is reported alongside a chapter 1 to 97 number, not instead of it. |
| An old edition | 454110 | 454110 is not in NAICS 2022: it is a NAICS 2017 code (Electronic Shopping and Mail-Order Houses), now split across 42 NAICS 2022 codes, such as 441227 Motorcycle, ATV, and All Other Motor Vehicle Dealers, 441330 Automotive Parts and Accessories Retailers, 441340 Tire Dealers. |

HTS revisions come several times a year and HS 2028 starts on January 1, 2028; check codes again after each revision you rely on.

> Reference, not a customs ruling or tax advice: a code that exists may still be the wrong one for your goods or business. Only U.S. Customs and Border Protection (by a binding ruling) decides an import classification, and the IRS decides what goes on a return. Each answer names the official table it came from and that table's date; check the official source before you file.

## Sources

- [USITC: Harmonized Tariff Schedule, 2026 HTS Revision 22, effective 10/30/2026 (read November 8, 2026)](https://hts.usitc.gov/)
- [U.S. Census Bureau: Schedule B, 2026 export concordance (read November 8, 2026)](https://www.census.gov/foreign-trade/schedules/b/index.html)
- [U.S. Census Bureau: 2022 NAICS codes, descriptions and index file (read November 8, 2026)](https://www.census.gov/naics/)

## Questions

### Why does my shipping app say the harmonized code is invalid?

Usually the number does not exist in the edition the carrier checks, has the wrong number of digits for that field, or is a heading rather than a full line. Check it against the current table.

### Is a Schedule B number valid on a US import?

Only when the same 10 digits are also an HTS number: 3,775 Schedule B numbers are not.

## Related

- [Find your HS code](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/guides/find-your-hs-code/)
- [Schedule B vs HTS](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/schedule-b-vs-hts/)
- [HTS code lookup](https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/hts/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/industry-code-lookup/guides/tariff-code-mistakes/  
Data as of: 2026-11-08
