# Invoice late fee calculator

At 1.5% a month simple interest, a $2,500 invoice 45 days late accrues $56.25; compounded every 30 days, 90 days late is $114.20 against $112.50 simple. Charge it only if your signed terms state the rate.

- $2,500, 45 days: $56.25

## Work out your own invoice

[Work it out](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/?jurisdiction=terms&amount=2500&dueDate=2026-09-30&paidDate=2026-11-14&rate=1.5)

## 1.5% a month, simple, by days late

| Invoice | 15 days | 30 days | 45 days | 60 days | 90 days |
| ---: | ---: | ---: | ---: | ---: | ---: |
| $500.00 | $3.75 | $7.50 | $11.25 | $15.00 | $22.50 |
| $1,000.00 | $7.50 | $15.00 | $22.50 | $30.00 | $45.00 |
| $2,500.00 | $18.75 | $37.50 | $56.25 | $75.00 | $112.50 |
| $5,000.00 | $37.50 | $75.00 | $112.50 | $150.00 | $225.00 |
| $10,000.00 | $75.00 | $150.00 | $225.00 | $300.00 | $450.00 |

## The formula

```text
fee = amount x monthly rate x days late / 30        (simple)
fee = amount x (1 + r)^n x (1 + r x d / 30) - amount  (compounded every 30 days: n full periods, d days left)
```

18% a year is the same as 1.5% a month only for whole months; by day, a yearly rate uses days / 365. The calculator does either.

> Not legal advice. The figures follow the official rules and rates quoted on this page, read on the date shown; a court decides any dispute.

## Questions

### How do I calculate a 1.5% monthly late fee?

Multiply the overdue amount by 1.5% for each month late, prorated by day for part months: $2,500 x 1.5% x 45 / 30 = $56.25, if your terms set that rate.

## Related

- [US overview](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/us/)
- [Clause examples](https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/templates/late-payment-clause/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/late-payment-interest/us/late-fee-calculator/  
Data as of: 2026-11-08
