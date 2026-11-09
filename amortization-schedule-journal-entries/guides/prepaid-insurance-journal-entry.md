# Prepaid insurance journal entry

For a $1,200.00 annual policy, book the payment to Prepaid Insurance, then each month debit Insurance Expense and credit Prepaid Insurance $100.00; after 12 entries the balance is $0.00, and a $1,000.00 policy posts $83.33 for 11 months and $83.37 in the last.

## Run this example in the tool

[Open this example in the tool](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/?csv=Item%2CType%2CAmount%2CStart%2CMonths%2CEnd%2CMethod%2CPaid+on%2CBalance+account%2CPL+account%2CCash+account%2CName%2CRate%2CPayment%2CFirst+payment%2CDay+count%2CCancel+on%2CRefund%0D%0AAnnual+liability+policy%2CPrepaid%2C1200.00%2C2026-11-01%2C12%2C%2C%2C%2CPrepaid+Insurance%2CInsurance+Expense%2C%2C%2C%2C%2C%2C%2C%2C%0D%0AUmbrella+policy%2CPrepaid%2C1000.00%2C2026-11-01%2C12%2C%2C%2C%2CPrepaid+Insurance%2CInsurance+Expense%2C%2C%2C%2C%2C%2C%2C%2C%0D%0A&period=2026-11&from=2026-11&to=2027-10)

## The two entries

Premium paid, November 1, 2026

| Account | Debit | Credit |
| --- | ---: | ---: |
| Prepaid Insurance | $1,200.00 |  |
| Checking |  | $1,200.00 |

Each month end

| Account | Debit | Credit |
| --- | ---: | ---: |
| Insurance Expense | $100.00 |  |
| Prepaid Insurance |  | $100.00 |

## A policy that starts on the 17th

$1,200.00 from November 17, 2026, by convention

| Convention | November 2026 | December 2026 | Last month |
| --- | ---: | ---: | ---: |
| equal months (the start month counts in full) | $100.00 | $100.00 | $100.00 (October 2027) |
| half-month (half a month in the first and last month) | $50.00 | $100.00 | $50.00 (November 2027) |
| actual days in each month | $46.03 | $101.92 | $52.59 (November 2027) |

## The rounding cent

$1,000.00 / 12 is $83.33 and a third of a cent. Eleven months of $83.33 leave $83.37 for the last month, so the asset ends at $0.00, not at a stray cent.

The umbrella policy

| Month | Amortized | Balance at month end |
| --- | ---: | ---: |
| November 2026 | $83.33 | $916.67 |
| December 2026 | $83.33 | $833.34 |
| January 2027 | $83.33 | $750.01 |
| February 2027 | $83.33 | $666.68 |
| March 2027 | $83.33 | $583.35 |
| April 2027 | $83.33 | $500.02 |
| May 2027 | $83.33 | $416.69 |
| June 2027 | $83.33 | $333.36 |
| July 2027 | $83.33 | $250.03 |
| August 2027 | $83.33 | $166.70 |
| September 2027 | $83.33 | $83.37 |
| October 2027 | $83.37 | $0.00 |

## Tie it out each month end

At November 30, 2026 the two policies leave $2,016.67 in Prepaid Insurance. If the balance sheet says anything else, the difference is a missed entry, a policy not on the schedule or a payment coded to expense.

Step by step: [the month-end prepaid rollforward checklist](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/prepaid-rollforward-checklist/).

## Sources

- [Intuit QuickBooks: Prepaid expenses and amortization, updated August 3, 2026 (read November 8, 2026)](https://quickbooks.intuit.com/learn-support/en-us/help-article/expense-accounting/prepaid-expenses-amortization/L0aBbAeMQ_US_en_US)

## Questions

### What is the journal entry for a 12-month prepaid?

Debit Prepaid Insurance and credit Cash when paid; each month debit Insurance Expense and credit Prepaid Insurance for a twelfth: $100.00 a month on $1,200.00.

### How do you amortize insurance?

Evenly over the coverage. Intuit's own example: "you amortize the insurance evenly as you consume the coverage".

## Related

- [Prepaid expense schedule](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/)
- [Prepaids in QuickBooks Online](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/prepaid-expense/quickbooks-online/)
- [Daily vs monthly proration](https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/daily-vs-monthly-proration/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/amortization-schedule-journal-entries/guides/prepaid-insurance-journal-entry/  
Data as of: 2026-11-08
