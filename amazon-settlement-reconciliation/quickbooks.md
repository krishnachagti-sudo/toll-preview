# Amazon settlements in QuickBooks Online, without a connector

In QuickBooks Online, the sample settlement of $188.14 imports as 2 journal entries through Amazon clearing, $177.77 dated October 31, 2026 and $10.37 dated November 7, 2026, plus a transfer of $188.14 to the bank on November 9, 2026.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=us&ledger=quickbooks-online)

## The settlement by month

Settlement 24816093571

| Period | Posted | Rows | Product sales | Promotions | Refunds | Sales tax collected | Tax withheld by Amazon | Selling fees | FBA fees | Advertising | Subscription | Reimbursements | Reserve held and released | Net | Share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| October 2026 | October 24, 2026 to October 31, 2026 | 18 | $144.96 | -$5.00 |  | $11.60 | -$11.60 | -$21.75 | -$20.45 |  | -$39.99 |  | $120.00 | $177.77 | 94.5% |
| November 2026 | November 1, 2026 to November 7, 2026 | 18 | $209.98 |  | -$39.99 | $13.60 | -$13.60 | -$26.70 | -$14.25 | -$42.17 |  | $18.50 | -$95.00 | $10.37 | 5.5% |
| **Settlement** |  | 36 | $354.94 | -$5.00 | -$39.99 | $25.20 | -$25.20 | -$48.45 | -$34.70 | -$42.17 | -$39.99 | $18.50 | $25.00 | **$188.14** |  |

## The journals

Amazon settlement 24816093571, October 2026, October 31, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Amazon sales |  | $144.96 |
| Amazon promotions | $5.00 |  |
| Amazon selling fees | $21.75 |  |
| Amazon FBA fees | $20.45 |  |
| Amazon subscription fee | $39.99 |  |
| Amazon reserve |  | $120.00 |
| Amazon clearing | $177.77 |  |
| **Total** | **$264.96** | **$264.96** |

Amazon settlement 24816093571, November 2026, November 7, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Amazon sales |  | $209.98 |
| Amazon refunds | $39.99 |  |
| Amazon selling fees | $26.70 |  |
| Amazon FBA fees | $14.25 |  |
| Amazon advertising | $42.17 |  |
| Amazon reimbursements |  | $18.50 |
| Amazon reserve | $95.00 |  |
| Amazon clearing | $10.37 |  |
| **Total** | **$228.48** | **$228.48** |

Amazon settlement 24816093571, deposit, November 9, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Checking | $188.14 |  |
| Amazon clearing |  | $188.14 |
| **Total** | **$188.14** | **$188.14** |

## The import file

```csv
Journal No,Journal Date,Account Name,Description,Debits,Credits
AMZ4816093571-1,10/31/2026,Amazon sales,"Amazon settlement 24816093571, October 2026",,144.96
AMZ4816093571-1,10/31/2026,Amazon promotions,"Amazon settlement 24816093571, October 2026",5.00,
AMZ4816093571-1,10/31/2026,Amazon selling fees,"Amazon settlement 24816093571, October 2026",21.75,
AMZ4816093571-1,10/31/2026,Amazon FBA fees,"Amazon settlement 24816093571, October 2026",20.45,
AMZ4816093571-1,10/31/2026,Amazon subscription fee,"Amazon settlement 24816093571, October 2026",39.99,
AMZ4816093571-1,10/31/2026,Amazon reserve,"Amazon settlement 24816093571, October 2026",,120.00
AMZ4816093571-1,10/31/2026,Amazon clearing,"Amazon settlement 24816093571, October 2026",177.77,
AMZ4816093571-2,11/07/2026,Amazon sales,"Amazon settlement 24816093571, November 2026",,209.98
AMZ4816093571-2,11/07/2026,Amazon refunds,"Amazon settlement 24816093571, November 2026",39.99,
```

Intuit's list of import columns: Journal No., Journal Date, Account Name, Journal/Description, Debits, Credits.

## Sources

- [QuickBooks Online: Import journal entries (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/import-export-data-files/import-journal-entries-quickbooks-online/L4tQBwbs7_US_en_US)
- [Amazon SP-API: Settlement Reports (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/docs/report-type-values-settlement)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Steps

1. **Create the accounts.** Add Amazon clearing, Amazon reserve and the other accounts the journal uses. If your spreadsheet has new accounts, be sure to add them in your chart of accounts before importing.
2. **Check and split the settlement.** Run the settlement through the reconciler: the rows must add up to total-amount ($188.14 here), and each month gets its own journal.
3. **Import the journals.** Settings, Import Data, Journal Entries, Browse to the CSV, map your headers, Start import. For sub-accounts, sub accounts: the parent account name and the sub account name separated by a colon.
4. **Match the deposit.** Match the bank feed line to the transfer journal, or record the deposit as a transfer from Amazon clearing (not both). Amazon clearing goes back to zero.

## Questions

### Do I record the Amazon deposit as revenue in QuickBooks Online?

No: the deposit is the net of sales, fees, refunds, tax and reserve. In this example sales are $354.94 and the deposit $188.14; the journal books each line and the deposit only clears Amazon clearing.

## Related

- [In Xero](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/xero/)
- [Split at month end](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-accrual-split/)
- [Booking the reserve](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/amazon-reserve-bookkeeping/)
- [The clearing account in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-quickbooks-online/)
- [A2X for Amazon compared](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/vs/a2x/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/quickbooks/  
Data as of: 2026-11-08
