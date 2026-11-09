# The 1099-K threshold: $20,000 and 200 transactions

A payment app or online marketplace files Form 1099-K only when a payee's gross payments exceed $20,000 and the transactions exceed 200, both in the same year; $20,000.01 in 201 transactions needs a form, $20,000.00 or 200 transactions does not. Card processors report any amount.

- Gross over: $20,000
- Transactions over: 200
- Card processors: any amount
- Payee copy, 2026 forms: February 1, 2027

The test is in the Instructions for Form 1099-K under Box 1a, "Exception for de minimis payments": the gross amount of reportable payments must exceed $20,000 and the number of transactions must exceed 200. Both must be passed. It applies to third party settlement organizations (payment apps and online marketplaces); payment card transactions have no threshold, so a card processor reports even $0.01 (IRS FAQ, General information Q2).

## Check your own forms

[Reconcile it](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/?year=2025&type=sole-proprietor&kind=tpso&run=1&filer=&box1a=21350&box3=214)

## Twelve cases

Whether the federal rule requires the form (worked by the engine)

| Case | Gross | Transactions | App or marketplace must file | Card processor must file |
| --- | ---: | ---: | --- | --- |
| Under the amount | $19,999.99 | 500 | No | Yes (any amount) |
| Exactly $20,000 | $20,000.00 | 500 | No | Yes (any amount) |
| Over $20,000, exactly 200 | $20,000.01 | 200 | No | Yes (any amount) |
| Just over both | $20,000.01 | 201 | Yes | Yes (any amount) |
| Over the amount, few sales | $25,000.00 | 150 | No | Yes (any amount) |
| A busy store | $48,000.00 | 612 | Yes | Yes (any amount) |
| Side seller | $6,150.00 | 64 | No | Yes (any amount) |
| Large, 199 sales | $150,000.00 | 199 | No | Yes (any amount) |
| Personal items | $21,350.00 | 214 | Yes | Yes (any amount) |
| Many small sales | $5,000.00 | 1000 | No | Yes (any amount) |
| Small side income | $600.00 | 30 | No | Yes (any amount) |
| Just over both, 201 | $20,500.00 | 201 | Yes | Yes (any amount) |

## How it got here

The American Rescue Plan Act of 2021 lowered the line to more than $600.00 with no transaction count. The IRS gave transition relief in Notices 2023-10, 2023-74 and 2024-85, and the One, Big, Beautiful Bill retroactively reinstated the earlier threshold of over $20,000 and over 200 transactions (FS-2025-08). Platform help pages still show the transition years differently (Shopify's lists $5,000 for 2024), which is why the IRS text is quoted here.

> The 2025 General Instructions' Guide to Information Returns still lists third party network transactions at more than $2,500; the 12/2026 Form 1099-K instructions and FS-2025-08 (which supersede it on this point) say over $20,000 and over 200 transactions.

- [IRS: Instructions for Form 1099-K (Rev. 12/2026), read November 8, 2026](https://www.irs.gov/instructions/i1099k)
- [IRS news release IR-2025-107 (October 23, 2025): Form 1099-K threshold reverts to $20,000, read November 8, 2026](https://www.irs.gov/newsroom/irs-issues-faqs-on-form-1099-k-threshold-under-the-one-big-beautiful-bill-dollar-limit-reverts-to-20000)
- [IRS Fact Sheet FS-2025-08, Form 1099-K FAQs (October 2025), read November 8, 2026](https://www.irs.gov/pub/taxpros/fs-2025-08.pdf)
- [IRS: Form 1099-K FAQs, General information, read November 8, 2026](https://www.irs.gov/newsroom/form-1099-k-faqs-general-information)
- [IRS: Understanding your Form 1099-K, read November 8, 2026](https://www.irs.gov/businesses/understanding-your-form-1099-k)
- [IRS: General Instructions for Certain Information Returns (2025), Guide to Information Returns, read November 8, 2026](https://www.irs.gov/instructions/i1099gi)

> Computed from IRS instructions and FAQs (each cited with the date read) and the amounts you enter. Not tax or legal advice. You decide which payments are business, personal or in error; the tool applies the IRS reporting text to your classification. State 1099-K thresholds are not covered: check your state revenue department.

## Questions

### What is the 1099-K threshold for 2025 and 2026?

Over $20,000 in gross payments and over 200 transactions, for payment apps and online marketplaces (third party settlement organizations). The One, Big, Beautiful Bill retroactively reinstated it (IRS IR-2025-107, October 23, 2025).

### Is the 1099-K threshold $600?

Not now. The American Rescue Plan Act of 2021 set $600 with no transaction count; the IRS delayed it with Notices 2023-10, 2023-74 and 2024-85, and the One, Big, Beautiful Bill put back $20,000 and 200 transactions.

### Can I get a 1099-K under $20,000?

Yes. The IRS says a platform may send one for lower amounts, card processors have no threshold, backup withholding makes a form due, and a state may set a lower threshold.

### Do I report income under the threshold?

Yes. The IRS says the threshold does not change whether payments are taxable; all income is reported with or without a form.

## Related

- [1099-K reconciliation worksheet](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/worksheet/)
- [How to report a 1099-K on Schedule C](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/report-on-schedule-c/)
- [1099-K dates for 2026 forms](https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/1099-k-dates-2027/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/threshold/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/1099-k-reconciliation/threshold.csv
