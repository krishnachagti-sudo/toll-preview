# Amazon settlements in Xero, without a connector

In Xero, this German settlement of €147.74 goes in as 2 manual journals through Amazon clearing, €136.47 dated October 31, 2026 and €11.27 dated November 5, 2026, and the €147.74 deposit is reconciled against Amazon clearing.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=eu&ledger=xero)

## The settlement by month

Settlement 13572468024

| Period | Posted | Rows | Product sales | Selling fees | FBA fees | Subscription | Reserve held and released | Net | Share |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| October 2026 | October 23, 2026 to October 31, 2026 | 7 | €218.50 | -€32.78 | -€10.25 | -€39.00 |  | €136.47 | 92.4% |
| November 2026 | November 2, 2026 to November 5, 2026 | 4 | €47.50 | -€7.13 | -€4.10 |  | -€25.00 | €11.27 | 7.6% |
| **Settlement** |  | 11 | €266.00 | -€39.91 | -€14.35 | -€39.00 | -€25.00 | **€147.74** |  |

## The journals

Amazon settlement 13572468024, October 2026, October 31, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Amazon sales |  | €218.50 |
| Amazon selling fees | €32.78 |  |
| Amazon FBA fees | €10.25 |  |
| Amazon subscription fee | €39.00 |  |
| Amazon clearing | €136.47 |  |
| **Total** | **€218.50** | **€218.50** |

Amazon settlement 13572468024, November 2026, November 5, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Amazon sales |  | €47.50 |
| Amazon selling fees | €7.13 |  |
| Amazon FBA fees | €4.10 |  |
| Amazon reserve | €25.00 |  |
| Amazon clearing | €11.27 |  |
| **Total** | **€47.50** | **€47.50** |

## The manual journal lines

```csv
Narration,Date,Description,Account,Amount
"Amazon settlement 13572468024, October 2026",10/31/2026,"Amazon settlement 13572468024, October 2026",Amazon sales,-218.50
"Amazon settlement 13572468024, October 2026",10/31/2026,"Amazon settlement 13572468024, October 2026",Amazon selling fees,32.78
"Amazon settlement 13572468024, October 2026",10/31/2026,"Amazon settlement 13572468024, October 2026",Amazon FBA fees,10.25
"Amazon settlement 13572468024, October 2026",10/31/2026,"Amazon settlement 13572468024, October 2026",Amazon subscription fee,39.00
"Amazon settlement 13572468024, October 2026",10/31/2026,"Amazon settlement 13572468024, October 2026",Amazon clearing,136.47
"Amazon settlement 13572468024, November 2026",11/05/2026,"Amazon settlement 13572468024, November 2026",Amazon sales,-47.50
"Amazon settlement 13572468024, November 2026",11/05/2026,"Amazon settlement 13572468024, November 2026",Amazon selling fees,7.13
"Amazon settlement 13572468024, November 2026",11/05/2026,"Amazon settlement 13572468024, November 2026",Amazon FBA fees,4.10
"Amazon settlement 13572468024, November 2026",11/05/2026,"Amazon settlement 13572468024, November 2026",Amazon reserve,25.00
```

The report writes amounts as 95,00; amounts are displayed in local currency formats (for example, 95,00 for EU instead of 95.00). The journal lines use a decimal point.

## Sources

- [Xero Accounting API (OpenAPI): ManualJournalLine (read November 8, 2026)](https://github.com/XeroAPI/Xero-OpenAPI/blob/master/xero_accounting.yaml)
- [Amazon SP-API: Settlement Reports (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/docs/report-type-values-settlement)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Steps

1. **Create the accounts.** Add Amazon clearing and Amazon reserve (balance sheet) and the income and expense accounts the journal uses: Amazon sales, Amazon selling fees, Amazon FBA fees and the others in the file.
2. **Check and split the settlement.** Run the settlement through the reconciler: the rows must add up to total-amount (€147.74 here), and each month gets its own journal.
3. **Enter the manual journals.** LineAmount: total for line. Debits are positive, credits are negative value: paste the lines into Xero's manual journal import template, or enter them by hand, one journal per month.
4. **Reconcile the deposit.** When the deposit shows in the bank feed, reconcile it as a transfer from Amazon clearing. Amazon clearing goes back to zero.

## Questions

### Do I record the Amazon deposit as revenue in Xero?

No: the deposit is the net of sales, fees, refunds, tax and reserve. In this example sales are €266.00 and the deposit €147.74; the journal books each line and the deposit only clears Amazon clearing.

## Related

- [In QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/quickbooks/)
- [Split at month end](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-accrual-split/)
- [Booking the reserve](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/guides/amazon-reserve-bookkeeping/)
- [The clearing account in Xero](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/guides/clearing-account-xero/)
- [A2X for Amazon compared](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/vs/a2x/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/xero/  
Data as of: 2026-11-08
