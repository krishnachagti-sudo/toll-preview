# Reverse retainage calculator

A $45,000.00 check net of 10% retainage means $50,000.00 was billed and $5,000.00 is being held; at 5% retainage the same check means $47,368.42 billed.

- Gross at 10%: $50,000.00
- Gross at 5%: $47,368.42

## Work back from your check

[Work it out](https://krishnachagti-sudo.github.io/toll-preview/pay-application/?calc=reverse&net=45%2C000.00&rate=10)

## The formula

```
gross = net / (1 - rate)
held  = gross - net
```

The tool then checks the result the other way: the gross less its retainage, rounded to the cent, must equal the net exactly; where two billed amounts would, it gives the smaller.

## Net to gross at 5% and 10%

| Net received | Billed at 5% | Billed at 10% |
| ---: | ---: | ---: |
| $900.00 | $947.37 | $1,000.00 |
| $4,500.00 | $4,736.84 | $5,000.00 |
| $9,500.00 | $10,000.00 | $10,555.56 |
| $45,000.00 | $47,368.42 | $50,000.00 |
| $95,000.00 | $100,000.00 | $105,555.56 |
| $450,000.00 | $473,684.21 | $500,000.00 |

> A check is often less than the billing for other reasons too (a previous overpayment, a backcharge, a line the payer did not approve). Compare against the approved pay application, not only the rate.

## Sources

- [AIA Contract Documents: Instructions, G703-1992 Continuation Sheet (read November 8, 2026)](https://help.aiacontracts.com/hc/en-us/articles/1500009308302-Instructions-G703-1992-Continuation-Sheet)
- [AIA Contract Documents: Instructions, G702-1992 Application and Certificate for Payment (read November 8, 2026)](https://help.aiacontracts.com/hc/en-us/articles/1500009308242-Instructions-G702-1992-Application-and-Certificate-for-Payment)

## Questions

### How do I find what was billed from a net payment?

Divide the net by one minus the rate: $45,000.00 / 0.90 = $50,000.00, of which $5,000.00 is retainage.

### Is the answer exact to the cent?

Yes. Retainage is rounded to the cent, so the tool finds the smallest billed amount whose retainage leaves exactly the net: at 7.5%, $1,000.01 comes from $1,081.09 billed ($81.08 held).

## Related

- [Retainage calculator](https://krishnachagti-sudo.github.io/toll-preview/pay-application/retainage-calculator/)
- [How to bill retainage](https://krishnachagti-sudo.github.io/toll-preview/pay-application/how-to-bill-retainage/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/pay-application/reverse-retainage-calculator/  
Data as of: 2026-11-08  
CSV: https://krishnachagti-sudo.github.io/toll-preview/pay-application/reverse-retainage-calculator.csv
