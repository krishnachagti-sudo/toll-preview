# The clearing account in QuickBooks Online

A payout clearing account takes each payout's net in and gives the same amount out to the bank, so it returns to zero: in this two-payout Stripe sample, $396.26 goes in through two journals and $396.26 goes out as two deposits. Its balance at month end is exactly the payouts still in transit.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=stripe&ledger=quickbooks-online)

## In: the payout journal

Stripe payout po\_SAMPLE1014, October 14, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Sales |  | $254.99 |
| Refunds | $30.00 |  |
| Chargebacks | $45.00 |  |
| Merchant fees | $23.30 |  |
| Stripe clearing | $156.69 |  |
| **Total** | **$254.99** | **$254.99** |

## Out: the deposit

The deposit of $156.69 lands

| Account | Debit | Credit |
| --- | ---: | ---: |
| Checking | $156.69 |  |
| Stripe clearing |  | $156.69 |
| **Total** | **$156.69** | **$156.69** |

If your bank feed already shows the deposit, match it in the feed as a transfer from the clearing account instead of importing this second journal, or it is booked twice.

## Both payouts

| Payout | In (net) | Out (deposit) | Left |
| --- | ---: | ---: | ---: |
| po\_SAMPLE1014 | $156.69 | $156.69 | $0.00 |
| po\_SAMPLE1102 | $239.57 | $239.57 | $0.00 |

## Sources

- [QuickBooks Online: Import journal entries (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)
- [QuickBooks Online: How to use the Shopify Connector app (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/manage-integrations/use-shopify-connector-app-quickbooks/L39NK2Bhe_US_en_US)
- [Stripe Docs: Payout reconciliation report (read November 8, 2026)](https://docs.stripe.com/reports/payout-reconciliation)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Steps

1. **Create one clearing account per processor.** For example "Stripe clearing" and "Shopify Payments clearing", so each returns to zero on its own. Add any new accounts to the chart of accounts before importing.
2. **Book each payout into it.** Sales gross as a credit, fees, refunds and chargebacks as debits, and the net as a debit to the clearing account.
3. **Match the deposit out of it.** When the deposit arrives, record it as a transfer from the clearing account to the bank.
4. **Check the balance.** At month end the clearing account should hold only payouts in transit: sales whose deposit has not landed yet.

## Questions

### What is a clearing account for payouts?

A holding account where each processor's sales, fees and refunds post before the net payout moves to the bank; a zero balance means every payout is accounted for.

### Does the QuickBooks Shopify Connector use a clearing account?

It uses Undeposited Funds the same way: Until the payout arrives, sales sit in Undeposited Funds (also called Payments to Deposit).

## Related

- [The clearing account in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-xero/)
- [Reconcile Stripe payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/stripe-to-quickbooks-online/)
- [Reconcile Shopify payouts in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/shopify-to-quickbooks-online/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-quickbooks-online/  
Data as of: 2026-11-08
