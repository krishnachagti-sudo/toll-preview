# Prompt Payment Act interest calculator

A federal agency paying your $1,500 invoice 76 days late owes $15.09 at 4.75% a year (the July to December 2026 rate), compounded every 30 days on a 360-day year; 10 days late it is $1.98.

- $1,500, 76 days: $15.09
- Rate, Jul to Dec 2026: 4.75%

## Work out your own invoice

[Work it out](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/?jurisdiction=us-federal&amount=1500&dueDate=2026-07-01&paidDate=2026-09-15)

## Rates since 2020

| Period | Rate | Federal Register |
| --- | ---: | --- |
| July 1, 2026 to December 31, 2026 | 4.75% | Vol. 91, No. 130, Thursday, July 9, 2026, p. 42594 |
| January 1, 2026 to June 30, 2026 | 4.125% | Vol. 91, No. 22, Tuesday, February 3, 2026, p. 5035 |
| July 1, 2025 to December 31, 2025 | 4.625% | Vol. 90, No. 145, July 31, 2025, p. 36094 |
| January 1, 2025 to June 30, 2025 | 4.625% | Vol. 90, No. 36, February 25, 2025, p. 10678 |
| July 1, 2024 to December 31, 2024 | 4.875% | Vol. 89, No. 138, July 18, 2024, p. 58467 |
| January 1, 2024 to June 30, 2024 | 4.875% | Vol. 89, No. 46, March 7, 2024, p. 16616 |
| July 1, 2023 to December 31, 2023 | 4.875% | Vol. 88, No. 156, August 15, 2023, p. 55501 |
| January 1, 2023 to June 30, 2023 | 4.625% | Vol. 88, No. 21, February 1, 2023, p. 6812 |
| July 1, 2022 to December 31, 2022 | 4.000% | Vol. 87, No. 146, August 1, 2022, p. 47034 |
| January 1, 2022 to June 30, 2022 | 1.625% | Vol. 87, No. 8, January 12, 2022, p. 1839 |
| July 1, 2021 to December 31, 2021 | 1.125% | Vol. 86, No. 138, July 22, 2021, p. 38813 |
| January 1, 2021 to June 30, 2021 | 0.875% | Vol. 86, No. 17, January 28, 2021, p. 7457 |
| July 1, 2020 to December 31, 2020 | 1.125% | Vol. 85, No. 133, July 10, 2020, p. 41671 |
| January 1, 2020 to June 30, 2020 | 2.125% | Vol. 84, No. 249, December 30, 2019, p. 72139 |

## The rules

- 5 CFR 1315.10(a)(1): "Interest will be calculated from the day after the payment due date through the payment date at the interest rate in effect on the day after the payment due date;"
- (a)(3): "For up to one year, interest penalties remaining unpaid at the end of any 30 day period will be added to the principal and subsequent interest penalties will accrue on that amount until paid;"
- (a)(9): "Interest calculations are to be based on a 360 day year;"
- (a)(7): "Interest penalties of less than one dollar need not be paid;"

The Treasury formula: `P(1+r/12)n * (1+(r/360*d)) -P`, where n is the 30-day periods and d the days left. Agencies must pay the interest without a request; a claim letter is still a useful record.

## Sources

- [Bureau of the Fiscal Service: Prompt Payment interest rates (read November 8, 2026)](https://fiscal.treasury.gov/payments-from-government/prompt-payment/rates)
- [Bureau of the Fiscal Service: Monthly compounding interest calculator (read November 8, 2026)](https://fiscal.treasury.gov/payments-from-government/prompt-payment/monthly-interest)
- [eCFR: 5 CFR 1315.10 Late payment interest penalties (read November 8, 2026)](https://www.ecfr.gov/current/title-5/chapter-III/subchapter-B/part-1315/section-1315.10)

> Not legal advice. The figures follow the official rules and rates quoted on this page, read on the date shown; a court decides any dispute.

## Questions

### What is the Prompt Payment Act interest rate?

4.75% for July 1 to December 31, 2026 (Bureau of the Fiscal Service).

### Is Prompt Payment interest compounded?

Yes: for up to one year, interest unpaid at the end of each 30-day period is added to the principal (5 CFR 1315.10), and it is based on a 360-day year.

## Related

- [US overview](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/us/)
- [Texas](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/us/prompt-payment/texas/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/us/prompt-payment-act/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/us/prompt-payment-act.csv
