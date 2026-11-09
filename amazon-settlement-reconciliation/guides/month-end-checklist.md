# Amazon month-end checklist

For the sample settlement, 7 of 7 checks pass: its 36 rows make the $188.14 total, two bank lines tie to it, it is split into October 2026 ($177.77) and November 2026 ($10.37), and the reserve moves by $25.00.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=us&ledger=quickbooks-online&bankDate=2026-11-10)

## The checklist, from the file

| Check | Result | Detail |
| --- | --- | --- |
| The rows add up to total-amount | Pass | 36 rows make $188.14. |
| Tied to the bank | Pass | $188.14 in the bank equals the total. |
| Split at the period end | Pass | Split into 2 parts: October 2026 $177.77, November 2026 $10.37. |
| Reserve on the balance sheet | Pass | $120.00 released and $95.00 held: book them to the reserve account, not to expenses. |
| Every amount-type placed on a line | Pass | Every value matched a rule; review the list before you post. |
| Every row has a posted date | Pass | Yes. |
| Arrived within five business days | Pass | 1 business day after the deposit-date. |

## Before you sign off

- Statements only reflects transactions that were released and included in payout during a settlement period. Deferred transactions are not included. Sales delivered late in the month may sit in next month's settlement.
- Settlement reports reflect payout timing. Date Range reports reflect activity timing.
- The old Flat File and XML settlement reports will be unavailable for sellers as of November 11, 2026: use Flat File V2.

## Sources

- [Seller Central Help: Deferred transactions for accounting and payment reconciliation (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/GLRNLZDAKHDBBVBY)
- [Seller Central Help: Payment Date Range Transaction and Summary reports (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G200989190)
- [Seller Central Help: When will I be paid? (read November 8, 2026)](https://sellercentral.amazon.com/help/hub/reference/external/G14911)
- [Amazon SP-API changelog: Deprecation of two payment settlement report types (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/changelog/update-deprecation-of-two-payment-settlement-report-types)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Steps

1. **Pull every settlement that touches the month.** In Seller Central, All Statements: the one that starts in the month before and ends in this one, and the one that starts in this month and ends in the next.
2. **Prove each one.** The rows add up to total-amount.
3. **Tie each one to the bank.** One or two bank lines add up to total-amount, within five business days of the deposit-date.
4. **Split the straddlers.** Book each month's part in its own month by posted date.
5. **Book the reserve and check unplaced values.** Reserve to the balance sheet; any value booked to Other is decided and moved.
6. **Note what is still deferred.** Sales delivered in the last days of the month are paid next month (DD + 7).

## Related

- [Split at month end](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-accrual-split/)
- [Month-end close calendar](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-close-calendar-2026-2027/)
- [Deferred transactions](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/deferred-transactions/)
- [Month-end close for an online store's payouts](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/online-store-month-end-checklist/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/month-end-checklist/  
Data as of: 2026-11-08
