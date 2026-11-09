# Amazon settlements in a spreadsheet

In a spreadsheet the sample settlement takes three formulas: the amount column sums to $188.14, the total-amount; posted on or before October 31, 2026 gives $177.77 for October 2026; and after it $10.37 for November 2026.

## Run this example in the reconciler

[Open this settlement in the reconciler](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/?sample=us&ledger=quickbooks-online)

## The formulas

Open the tab-delimited file in Excel or Google Sheets. With amount in column O and posted-date-time in column R (Amazon's column order), and the amounts read as numbers:

```text
=SUM(O3:O400)                                        total: must equal total-amount (E2)
=SUMIFS(O3:O400, R3:R400, "<"&TEXT(DATE(2026,11,1),"yyyy-mm-dd"))   posted before November 1
=SUMIFS(O3:O400, R3:R400, ">="&TEXT(DATE(2026,11,1),"yyyy-mm-dd"))  posted from November 1
=SUMIFS(O3:O400, N3:N400, "Commission")             one amount-description
```

The posted-date-time text (YYYY-MM-DD HH:MM:SS UTC) compares as text in that form. On EU files, amounts are displayed in local currency formats (for example, 95,00 for EU instead of 95.00), so set the import's decimal separator to a comma first.

## Where a spreadsheet stops

- Every amount-type and amount-description has to be grouped into sales, fees, refunds, tax and reserve by hand, for every new value Amazon adds.
- Refund rows of price and shipping go to refunds, not sales: one more condition in each formula.
- The journals and the import file for QuickBooks Online or Xero are typed by hand.
- A gap with the bank (two payers, five business days) is found by eye.

## When the spreadsheet is the better choice

- Your accountant already has a template for your account and volumes are small.
- You need a one-off look at a single value, such as total commission in a year.

## Sources

- [Amazon SP-API: Settlement Reports (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/docs/report-type-values-settlement)
- [Amazon SP-API changelog: Deprecation of two payment settlement report types (read November 8, 2026)](https://developer-docs.amazon.com/sp-api/changelog/update-deprecation-of-two-payment-settlement-report-types)

> Not accounting or tax advice: this is arithmetic on Amazon's own settlement file. The sample reports are made up; their amount-type and amount-description values are illustrative, and your file's own values are read as written.

## Related

- [The sample settlement report](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/sample-settlement-report-csv/)
- [The columns explained](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/settlement-report-explained/)
- [Split at month end](https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/month-end-accrual-split/)
- [Doing processor payouts by hand](https://krishnachagti-sudo.github.io/toll-preview/payout-reconciliation/vs/manual-csv/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amazon-settlement-reconciliation/vs/manual-spreadsheet/  
Data as of: 2026-11-08
