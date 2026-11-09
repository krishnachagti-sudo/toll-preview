# Which payments make up this bank deposit?

Of these 8 payments, 2 different sets add up to a $1,500.00 deposit exactly ($960.00 + $540.00, and $1,050.00 + $450.00); with dates added and a window of 31 days before to 3 days after the October 16 deposit, only 1 set is left: $960.00 + $540.00.

## Try the quick match

[Open in the quick match](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/?payments=2026-10-02%2C+960%3B2026-10-06%2C+540%3B2026-10-09%2C+230%3B2026-10-14%2C+320%3B2026-10-14%2C+320%3B2026-10-27%2C+1050%3B2026-10-30%2C+129.99%3B2026-08-20%2C+450&deposit=1500.00&depositDate=2026-10-16)

## The search, in plain words

Finding a group of payments whose total equals the deposit means trying combinations. The tool sorts the payments from largest to smallest and tries them in order, dropping a branch as soon as it passes the deposit or cannot reach it with what is left. It counts every set that fits, lists up to 20, closest dates first, and says when a search stopped before it finished.

The payments in the example

| # | Date | Amount |
| ---: | --- | ---: |
| 1 | 2026-10-02 | $960.00 |
| 2 | 2026-10-06 | $540.00 |
| 3 | 2026-10-09 | $230.00 |
| 4 | 2026-10-14 | $320.00 |
| 5 | 2026-10-14 | $320.00 |
| 6 | 2026-10-27 | $1,050.00 |
| 7 | 2026-10-30 | $129.99 |
| 8 | 2026-08-20 | $450.00 |

## Dates narrow it down

Without dates: $1,500.00: 2 sets fit; the closest by date is payments 1, 2. With dates: $1,500.00: one set fits, payments 1, 2. The $1,050.00 payment is dated after the deposit window, and the $450.00 one before it.

## Limits

- Up to 40 payments are searched per deposit: the nearest by date when more fit the window.
- Sets of up to 12 payments by default (up to 25 when you ask).
- Cents are exact: amounts are whole cents throughout, never floating-point.

## Sources

- [Intuit QuickBooks: Record and make bank deposits in QuickBooks Online, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/bank-deposits/record-make-bank-deposits-quickbooks-online/L2BBZOPdr_US_en_US)
- [QuickBooks Community: How do I clear old QuickBooks Payments from Undeposited Funds when merchant statements are no longer available? (read November 8, 2026)](https://quickbooks.intuit.com/community/payments-3/how-do-i-clear-old-quickbooks-payments-from-undeposited-funds-when-merchant-statements-are-no-longer-available-19748)

## Questions

### Why not just take the first set that adds up?

Because the first is not always the right one: in the example 2 sets add up to the same deposit. The tool counts and lists every set and never picks one when more than one fits.

### What if the deposit is a little less than the payments?

That is usually a processor fee. With a fee allowance, sets that exceed the deposit by up to that share of their total are listed apart, each with the fee it implies; Intuit records a fee as a negative line on the deposit.

## Related

- [Clear Undeposited Funds in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/quickbooks-online/)
- [Clearing account reconciliation](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/clearing-account/)
- [Excel Solver vs this tool](https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/vs/excel-aging/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/clearing-account-cleanup/undeposited-funds/match-deposit/  
Data as of: 2026-11-08
