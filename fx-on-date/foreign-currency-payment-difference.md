# Why a foreign-currency payment is worth a different amount than its invoice

Mostly because the rate moves between invoice and payment. At ECB reference rates, $5,000 invoiced on 30 September 2026 was €4,403.35; on 30 October 2026 it was €4,475.48, more by €72.13, before any bank margin or fee.

## The rate movement, worked out

| Date | ECB fixing used | Euros per dollar | $5,000 in euros |
| --- | --- | ---: | ---: |
| Invoice, 30 September 2026 | 30 September 2026 | 0.880669 | €4,403.35 |
| Payment, 30 October 2026 | 30 October 2026 | 0.895095 | €4,475.48 |
| Difference from the rate alone |  |  | €72.13 |

## What else takes a share?

- **Conversion margin**: the bank or payment firm converts at its own buy or sell rate, not a reference rate. The gap between the two is its margin.
- **Fees**: the sending bank, an intermediary bank or your own bank may deduct a fee from the amount. These show as a lower amount received, in the invoice currency.
- **Timing**: the money may be converted a day or more after it was sent; the rate on the day of conversion is the one that counts.

## How to check your own payment

1. Find the rate for the invoice date and the date the money was converted, from one source.
2. Convert the invoice amount at each. The difference is the rate movement.
3. Compare the second figure with what reached your account. What remains is margin and fees.

For many invoices, call the tool over the API once per date: [ECB exchange rate API](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/ecb-exchange-rate-api/). How your books record the difference depends on your accounting rules; ask your accountant.

## Look up your two dates

[Get the rate in the tool](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/?base=USD&quote=EUR&date=2026-10-30)

## Sources

- [European Central Bank: Euro foreign exchange reference rates (read 6 November 2026)](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)

## Questions

### Why did I receive less than I invoiced?

Three usual causes: the rate moved between the invoice date and the day the money was converted, the bank or payment firm converted at its own rate with a margin, and fees were taken by the sending, receiving or an intermediary bank. Your bank statement and the payer's remittance show which.

### How do I measure the rate movement alone?

Look up a reference rate for the invoice date and the payment date, convert the invoice amount at each, and subtract. What is left after that is margin and fees.

## Related

- [Which rate a foreign-currency invoice uses](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/foreign-currency-invoice-exchange-rate/)
- [Why exchange rates differ between sources](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/why-exchange-rates-differ/)
- [ECB exchange rate API](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/ecb-exchange-rate-api/)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/foreign-currency-payment-difference/  
Data as of: 2026-10-30
