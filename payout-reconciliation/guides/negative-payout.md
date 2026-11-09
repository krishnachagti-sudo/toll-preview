# How to book a negative payout

A negative payout means refunds and fees beat sales: in this sample, $42.00 sales - $215.00 refunds - $1.52 fees = -$174.52, so $174.52 comes out of your bank. Book it like any payout, with the clearing account credited $174.52, and the bank debit taken out of the clearing account.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=shopifyNegative&ledger=quickbooks-online)

## The payout, split

Made-up payout of November 5, 2026

| Line | Amount |
| --- | ---: |
| Sales | $42.00 |
| Refunds | -$215.00 |
| Processing fees | -$1.52 |
| **Net (the payout)** | **-$174.52** |

## The journal

Shopify Payments payout payout-2026-11-05, November 5, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Sales |  | $42.00 |
| Refunds | $215.00 |  |
| Merchant fees | $1.52 |  |
| Shopify Payments clearing |  | $174.52 |
| **Total** | **$216.52** | **$216.52** |

Refunds are debited at their full amount; the fee on the one sale is still an expense, because the original fee is not refunded. The clearing account is credited the net, so it now holds a negative balance until the money is taken from the bank.

When the processor debits your bank

| Account | Debit | Credit |
| --- | ---: | ---: |
| Checking |  | $174.52 |
| Shopify Payments clearing | $174.52 |  |
| **Total** | **$174.52** | **$174.52** |

## How the processor gets the money back

- United States: The balance required for the refund is debited from your bank account. This debit occurs on a day outside your regular payout schedule.
- If the initial debit attempt fails, then a second attempt is made after 3 business days.
- Elsewhere, Shopify says the amount is taken from later payouts until it is covered; then the clearing account is cleared by those payouts instead of a bank debit.

## Keeping it from happening

- Watch for a run of refunds after a sale or a bad batch, and keep enough sales in the period to cover them.
- Chargebacks take the payment and a fee: answer them with evidence quickly.

## Sources

- [Shopify Help Center: Shopify Payments refunds (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/refunds)
- [Shopify Help Center: Lower or missing payouts (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/lower-or-missing-payouts)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Questions

### What does a negative Shopify payout mean?

Refunds, chargebacks and fees in the period were more than its sales. United States: The balance required for the refund is debited from your bank account. This debit occurs on a day outside your regular payout schedule.

### What if the debit fails?

If the initial debit attempt fails, then a second attempt is made after 3 business days.

## Related

- [Why your payout doesn't match your sales](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/payout-doesnt-match-sales/)
- [Chargebacks in your payouts](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/chargebacks-in-payouts/)
- [The clearing account in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-xero/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/negative-payout/  
Data as of: 2026-11-08
