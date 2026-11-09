# Doing payouts by hand from the CSV

By hand, a payout is a pivot table and a journal: this sample Shopify Payments payout's 6 rows total $229.75 of charges and net to $126.18, one pivot table and one journal per payout, so a month of daily payouts means one of each per day. The splitter does the same from the file and proves it to the cent.

## Run this example in the splitter

[Open this payout in the splitter](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/?sample=shopify&ledger=quickbooks-online)

## The result to aim for

Made-up payout of October 14, 2026

| Line | Amount |
| --- | ---: |
| Sales | $229.75 |
| Refunds | -$22.00 |
| Chargebacks and disputes | -$49.00 |
| Processing fees | -$22.57 |
| Reserves and holds | -$10.00 |
| **Net (the payout)** | **$126.18** |

Shopify Payments payout payout-2026-10-14, October 14, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Sales |  | $229.75 |
| Refunds | $22.00 |  |
| Chargebacks | $49.00 |  |
| Merchant fees | $22.57 |  |
| Processor reserve | $10.00 |  |
| Shopify Payments clearing | $126.18 |  |
| **Total** | **$229.75** | **$229.75** |

## When doing it by hand is better

- A tiny store with a few payouts a month.
- You want to see every row yourself.
- Your processor or export is not one this tool reads, and you would rather not name its columns.

## What the splitter adds

- Reads the processor's own export (Stripe, Shopify Payments, PayPal, Square, or any CSV with its columns named) and splits every payout into sales, refunds, chargebacks, fees and adjustments.
- Proves the rows against the deposit and shows any gap as its own line.
- Builds a balanced journal through a clearing account, as a QuickBooks Online import file or Xero manual journal lines.
- The split is free in the browser; the journal is $0.10 a payout, at least $0.50 a file and at most $9 a month. Nothing is connected and nothing is kept.

## Sources

- [Shopify Help Center: Viewing and exporting your Shopify Payments payout details (read November 8, 2026)](https://help.shopify.com/en/manual/payments/shopify-payments/payouts/view-details)

> Not accounting or tax advice: this is arithmetic on the processor's own file, placed by the categories the processor documents. The sample files are made up.

## Steps

1. **Export the payout.** Export a specific payout: Finance \> Payouts, click the payout date and the payout, then Export payout transactions.
2. **Total by type.** In a spreadsheet, a pivot table of Amount and Fee by Type gives charges, refunds, disputes and reserves, and the fees.
3. **Check the net.** The sum of Net must equal the deposit in your bank.
4. **Write the journal.** Charges to sales, refunds and disputes to their accounts, fees to merchant fees, the net to the clearing account.

## Related

- [The Shopify payout report, explained](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/reports/shopify-payout-report/)
- [Why your payout doesn't match your sales](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/payout-doesnt-match-sales/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/vs/manual-csv/  
Data as of: 2026-11-08
