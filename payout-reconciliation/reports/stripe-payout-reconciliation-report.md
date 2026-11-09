# The Stripe payout reconciliation report, explained

Stripe's itemized payout reconciliation report (payout\_reconciliation.itemized.7) has 11 default columns: gross is the transaction, fee is Stripe's fee, net is what reached the payout, and automatic\_payout\_id ties each row to its payout. In the sample below, 2 payouts come to $396.26.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=stripe&ledger=quickbooks-online&rate=stripe-card)

## The default columns

| Column | What it holds |
| --- | --- |
| `automatic_payout_effective_at` | The date Stripe expects the payout to arrive; also when it leaves your Stripe balance. |
| `automatic_payout_id` | The automatic payout this row belongs to. Rows with the same id add up to that payout. |
| `available_on` | When the row's net became available in your Stripe balance. |
| `balance_transaction_id` | The row's own id. |
| `created` | When the balance transaction was created. |
| `currency` | The currency of gross, fee and net. |
| `description` | Free text, often the order or the fee's name. |
| `fee` | Fees for this row, in dollars (major units). Any withheld\_tax is already inside it. |
| `gross` | The row's gross amount: a charge's full price, a refund as a negative. |
| `net` | Gross less fee: what the row added to or took from the payout. |
| `reporting_category` | What the row is: charge, refund, dispute, fee and so on. The split places rows by it. |

## Reporting categories, and where each goes

| reporting\_category | Booked as |
| --- | --- |
| `charge` | Sales |
| `partial_capture_reversal` | Sales |
| `charge_failure` | Sales |
| `refund` | Refunds |
| `refund_failure` | Refunds |
| `dispute` | Chargebacks and disputes |
| `dispute_reversal` | Chargebacks and disputes |
| `fee` | Processing fees |
| `tax` | Tax on fees |
| `tax_withholding` | Tax withheld by the processor |
| `tax_fund` | Transfers between balances |
| `risk_reserved_funds` | Reserves and holds |
| `connect_reserved_funds` | Reserves and holds |
| `payment_network_reserve_hold` | Reserves and holds |
| `payment_network_reserve_release` | Reserves and holds |
| `payout_minimum_balance_hold` | Reserves and holds |
| `payout_minimum_balance_release` | Reserves and holds |
| `anticipation_repayment` | Loan and advance repayments |
| `transfer` | Transfers between balances |
| `transfer_reversal` | Transfers between balances |
| `connect_collection_transfer` | Transfers between balances |
| `platform_earning` | Platform earnings |
| `platform_earning_refund` | Platform earnings |
| `currency_conversion` | Currency conversion |
| `topup` | Money from or back to your bank |
| `topup_reversal` | Money from or back to your bank |
| `payout_reversal` | Money from or back to your bank |
| `other_adjustment` | Other adjustments |
| `advance` | Other adjustments |
| `advance_funding` | Other adjustments |
| `climate_order_purchase` | Other adjustments |
| `climate_order_refund` | Other adjustments |
| `contribution` | Other adjustments |
| `revenue_share` | Other adjustments |
| `reward` | Other adjustments |
| `fee_credit_funding` | Processing fees |
| `stripe_balance_payment_debit` | Other adjustments |
| `stripe_balance_payment_debit_reversal` | Other adjustments |
| `unreconciled_customer_funds` | Other adjustments |

Two worth knowing: Summing the two balance transactions yields the captured portion of the charge. So a partial\_capture\_reversal reduces the sale rather than counting as a refund. And tax is "Taxes collected by Stripe to be remitted to the appropriate local governments. Typically, this is a tax on Stripe fees."

## A sample file

Made-up itemized payout reconciliation rows

| automatic\_payout\_id | automatic\_payout\_effective\_at | balance\_transaction\_id | created | available\_on | currency | gross | fee | net | reporting\_category | description |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| po\_SAMPLE1014 | 2026-10-14 | txn\_S01 | 2026-10-10 14:02:11 | 2026-10-12 | usd | 120.00 | 3.78 | 116.22 | charge | Order 1041 |
| po\_SAMPLE1014 | 2026-10-14 | txn\_S02 | 2026-10-10 16:40:05 | 2026-10-12 | usd | 45.00 | 1.61 | 43.39 | charge | Order 1042 |
| po\_SAMPLE1014 | 2026-10-14 | txn\_S03 | 2026-10-11 09:15:44 | 2026-10-13 | usd | 89.99 | 2.91 | 87.08 | charge | Order 1043 |
| po\_SAMPLE1014 | 2026-10-14 | txn\_S04 | 2026-10-11 11:20:00 | 2026-10-13 | usd | -30.00 | 0.00 | -30.00 | refund | Refund for order 1038 |
| po\_SAMPLE1014 | 2026-10-14 | txn\_S05 | 2026-10-12 08:00:00 | 2026-10-12 | usd | -45.00 | 15.00 | -60.00 | dispute | Chargeback on order 1022 |
| po\_SAMPLE1102 | 2026-11-02 | txn\_S06 | 2026-10-30 13:05:09 | 2026-11-01 | usd | 250.00 | 7.55 | 242.45 | charge | Order 1050 |
| po\_SAMPLE1102 | 2026-11-02 | txn\_S07 | 2026-10-31 19:44:31 | 2026-11-02 | usd | 19.99 | 0.88 | 19.11 | charge | Order 1051 |
| po\_SAMPLE1102 | 2026-11-02 | txn\_S08 | 2026-11-01 10:12:00 | 2026-11-01 | usd | -19.99 | 0.00 | -19.99 | refund | Refund for order 1051 |
| po\_SAMPLE1102 | 2026-11-02 | txn\_S09 | 2026-11-01 00:00:00 | 2026-11-01 | usd | -2.00 | 0.00 | -2.00 | fee | Billing - usage fee |

Payout po\_SAMPLE1014, October 14, 2026

| Line | Amount |
| --- | ---: |
| Sales | $254.99 |
| Refunds | -$30.00 |
| Chargebacks and disputes | -$45.00 |
| Processing fees | -$23.30 |
| **Net (the payout)** | **$156.69** |

Payout po\_SAMPLE1102, November 2, 2026

| Line | Amount |
| --- | ---: |
| Sales | $269.99 |
| Refunds | -$19.99 |
| Processing fees | -$10.43 |
| **Net (the payout)** | **$239.57** |

## Before you download

- The payout reconciliation report is only available for users with automatic payouts enabled, or a platform on manual payouts whose Connected Accounts have automatic payouts enabled.
- You control the timing and amount of instant payouts, so Stripe can't identify which transactions are included in each payout.
- The report groups a payout by the estimated arrival date shown on the Payouts page, not the date your bank posts the deposit.
- Expressed in major units of the currency (e.g. dollars for USD, yen for JPY).

## Fees

Stripe's US prices: 2.9% + 30¢ per successful transaction for domestic cards, + 1.5% for international cards, + 1% if currency conversion is required; $15.00 for each dispute you receive; Instant Payouts 1.5% of Instant Payouts volume. The payment processing, Connect and currency conversion fees from the original transaction are not returned.

## Sources

- [Stripe Docs: Payout reconciliation report (read November 8, 2026)](https://docs.stripe.com/reports/payout-reconciliation)
- [Stripe Docs: Reporting categories (read November 8, 2026)](https://docs.stripe.com/reports/reporting-categories)
- [Stripe pricing (United States) (read November 8, 2026)](https://stripe.com/us/pricing)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Questions

### Which Stripe report lists every transaction in a payout?

The Payout reconciliation report. Download the Itemized CSV to review every payment, refund, dispute, fee and other balance transaction included in the payout.

### Can I reconcile Stripe instant payouts with this report?

No. You control the timing and amount of instant payouts, so Stripe can't identify which transactions are included in each payout. You reconcile those against your transaction history yourself.

### What date does Stripe use to group a payout in the report?

The report groups a payout by the estimated arrival date shown on the Payouts page, not the date your bank posts the deposit.

### What is the withheld\_tax column?

withheld\_tax: Sales tax, VAT or GST withheld. This amount is already included within the fee column.

## Related

- [Reconcile Stripe payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/stripe-to-quickbooks-online/)
- [Reconcile Stripe payouts in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/stripe-to-xero/)
- [Why your payout does not match your sales](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/payout-doesnt-match-sales/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/stripe-payout-reconciliation-report/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/stripe-payout-reconciliation-report.csv
