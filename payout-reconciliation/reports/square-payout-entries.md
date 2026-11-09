# Square payout entries, explained

Each Square payout entry carries a type and three amounts in cents, gross, fee and net, and the entries of a payout add up to its deposit: in the sample below 3 entries make $130.93, which ties to the payout's $130.93 to the cent.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=square&ledger=quickbooks-online&rate=square-in-person)

## An entry

- gross\_amount\_money: The amount of money involved in this payout entry. fee\_amount\_money: The amount of Square fees associated with this payout entry. net\_amount\_money: The net proceeds from this transaction after any fees.
- The amount of money, in the smallest denomination of the currency indicated by currency. For example, when currency is USD, amount is in cents.
- amount\_money: A positive amount indicates a deposit, and a negative amount indicates a withdrawal.

## Activity types, and where each goes

| Type | Booked as |
| --- | --- |
| `CHARGE` | Sales |
| `REFUND` | Refunds |
| `DISPUTE` | Chargebacks and disputes |
| `OPEN_DISPUTE` | Chargebacks and disputes |
| `FEE` | Processing fees |
| `PROCESSING_FEE` | Processing fees |
| `DEPOSIT_FEE` | Processing fees |
| `TAX_ON_FEE` | Tax on fees |
| `RESERVE_HOLD` | Reserves and holds |
| `RESERVE_RELEASE` | Reserves and holds |
| `SQUARE_CAPITAL_PAYMENT` | Loan and advance repayments |
| `AUTOMATIC_SAVINGS` | Transfers between balances |
| `RETURNED_PAYOUT` | Money back to the bank |
| `ADJUSTMENT` | Other adjustments |

The full list of 51 types is in the CSV of this page.

## A sample payout

Payout po\_SAMPLE-SQ-1016, October 16, 2026

| Line | Amount |
| --- | ---: |
| Sales | $145.00 |
| Refunds | -$10.00 |
| Processing fees | -$4.07 |
| **Net (the payout)** | **$130.93** |

Square's US Free plan charges Tap, dip, or swipe: 2.6% + 15¢ (Square Free), 2.5% + 15¢ (Plus), 2.4% + 15¢ (Premium); at 2.6% + 15¢ these 2 charges give $4.07 in fees, and $4.07 were charged.

## Getting the entries

- Square documents its payouts in the Payouts API: list the payout's entries (ListPayoutEntries) and upload the JSON. Add the payout from ListPayouts to the same JSON as "payouts" and the split checks the entries against the deposit.
- You can only download transaction details as a CSV file in your Square Dashboard. Square does not publish that CSV's columns, so read it as "Another CSV" and name its amount, fee and net columns.

## Sources

- [Square Developer: Payouts API, ListPayoutEntries and PayoutEntry (read November 8, 2026)](https://developer.squareup.com/reference/square/payouts-api/list-payout-entries)
- [Square Support: Match transfers to sales (read November 8, 2026)](https://squareup.com/help/us/en/article/3813-match-deposits-to-sales)
- [Square pricing (United States) (read November 8, 2026)](https://squareup.com/us/en/pricing)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Questions

### Are Square payout amounts in dollars or cents?

The amount of money, in the smallest denomination of the currency indicated by currency. For example, when currency is USD, amount is in cents.

### Can I export a Square transfer as CSV?

You can only download transaction details as a CSV file in your Square Dashboard. Square does not publish that file's columns; read it here as another CSV and name its columns.

## Related

- [Reconcile Square payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/square-to-quickbooks-online/)
- [Reconcile Square payouts in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/square-to-xero/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/square-payout-entries/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/square-payout-entries.csv
