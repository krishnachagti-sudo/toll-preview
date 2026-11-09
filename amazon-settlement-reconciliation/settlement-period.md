# The Amazon settlement period: 14 days, not a month

Amazon's help gives a 14-day payout period, so a settlement rarely lines up with the month: the sample runs from October 24, 2026 to November 7, 2026 (14 days), and 94.5% of it ($177.77) is posted in October 2026. On that cycle, 14 of the 31 settlements from October 2026 to December 2027 straddle a month end.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=us&ledger=quickbooks-online)

## The sample settlement, by month

Settlement 24816093571

| Period | Posted | Rows | Net | Share |
| --- | --- | ---: | ---: | ---: |
| October 2026 | October 24, 2026 to October 31, 2026 | 18 | $177.77 | 94.5% |
| November 2026 | November 1, 2026 to November 7, 2026 | 18 | $10.37 | 5.5% |
| **Settlement** |  | 36 | **$188.14** |  |

## Every 14-day cycle to December 2027

Your own cycle depends on your account's start date; this table follows the sample's, from October 24, 2026. A settlement that straddles a month end needs splitting for accrual books.

14-day settlement periods from the sample's start

| Starts | Next starts | Month end inside | Days before | Days after |
| --- | --- | --- | ---: | ---: |
| October 24, 2026 | November 7, 2026 | October 31, 2026 | 8 | 6 |
| November 7, 2026 | November 21, 2026 | none | 14 | 0 |
| November 21, 2026 | December 5, 2026 | November 30, 2026 | 10 | 4 |
| December 5, 2026 | December 19, 2026 | none | 14 | 0 |
| December 19, 2026 | January 2, 2027 | December 31, 2026 | 13 | 1 |
| January 2, 2027 | January 16, 2027 | none | 14 | 0 |
| January 16, 2027 | January 30, 2027 | none | 14 | 0 |
| January 30, 2027 | February 13, 2027 | January 31, 2027 | 2 | 12 |
| February 13, 2027 | February 27, 2027 | none | 14 | 0 |
| February 27, 2027 | March 13, 2027 | February 28, 2027 | 2 | 12 |
| March 13, 2027 | March 27, 2027 | none | 14 | 0 |
| March 27, 2027 | April 10, 2027 | March 31, 2027 | 5 | 9 |
| April 10, 2027 | April 24, 2027 | none | 14 | 0 |
| April 24, 2027 | May 8, 2027 | April 30, 2027 | 7 | 7 |
| May 8, 2027 | May 22, 2027 | none | 14 | 0 |
| May 22, 2027 | June 5, 2027 | May 31, 2027 | 10 | 4 |
| June 5, 2027 | June 19, 2027 | none | 14 | 0 |
| June 19, 2027 | July 3, 2027 | June 30, 2027 | 12 | 2 |
| July 3, 2027 | July 17, 2027 | none | 14 | 0 |
| July 17, 2027 | July 31, 2027 | none | 14 | 0 |
| July 31, 2027 | August 14, 2027 | July 31, 2027 | 1 | 13 |
| August 14, 2027 | August 28, 2027 | none | 14 | 0 |
| August 28, 2027 | September 11, 2027 | August 31, 2027 | 4 | 10 |
| September 11, 2027 | September 25, 2027 | none | 14 | 0 |
| September 25, 2027 | October 9, 2027 | September 30, 2027 | 6 | 8 |
| October 9, 2027 | October 23, 2027 | none | 14 | 0 |
| October 23, 2027 | November 6, 2027 | October 31, 2027 | 9 | 5 |
| November 6, 2027 | November 20, 2027 | none | 14 | 0 |
| November 20, 2027 | December 4, 2027 | November 30, 2027 | 11 | 3 |
| December 4, 2027 | December 18, 2027 | none | 14 | 0 |
| December 18, 2027 | January 1, 2028 | none | 14 | 0 |

## Dates to know

- settlement-start-date and settlement-end-date are in the report's first row; deposit-date is when Amazon sends the money (the sample: November 9, 2026).
- It can take up to five business days for your money to appear in your bank account after we initiate payment.
- Whenever you add or update your bank account information, a mandatory three-day security hold takes effect, so a payout right after a bank change can be late.
- Amazon also offers Express payout to receive transfers within twenty-four hours.

## Sources

- [Seller Central Help: Why didn't I get paid? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G19301)
- [Seller Central Help: When will I be paid? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G14911)
- [Amazon SP-API: Settlement Reports (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/docs/report-type-values-settlement)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Questions

### How long is an Amazon settlement period?

Amazon's help says: The payout period is for 14 days. The sample runs from October 24, 2026 to November 7, 2026, 14 days.

### How long after the settlement does the money reach the bank?

Amazon's help says: It can take up to five business days for your money to appear in your bank account after we initiate payment.

## Related

- [Split a settlement at month end](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-accrual-split/)
- [Month-end close calendar 2026 to 2027](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-close-calendar-2026-2027/)
- [Why the deposit does not match](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/deposit-doesnt-match/)
- [Deferred transactions](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/deferred-transactions/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/settlement-period/  
Data as of: 2026-11-08
