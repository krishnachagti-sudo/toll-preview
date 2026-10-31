# ECB exchange rate API for any date

POST /api/v1/tools/fx-on-date with base USD, quote INR and date 2026-10-24 returns rate 94.945055 and fixingDate 2026-10-23, the ECB reference rate and the fixing it came from, for $0.001 (₹0.08 on a rupee account).

## Try the same call in the browser

[Get the rate in the tool](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/?base=USD&quote=INR&date=2026-10-24)

## The request

Send a POST with a JSON body to /api/v1/tools/fx-on-date on this site, with your key as a Bearer token in the Authorization header. [The docs](https://krishnachagti-sudo.github.io/toll-preview/docs) cover keys, errors, idempotency and rate limits.

| Field | Type | Example | Meaning |
| --- | --- | --- | --- |
| base | string | USD | Three-letter code of the currency you convert from. |
| quote | string | INR | Three-letter code of the currency you convert to. |
| date | string | 2026-10-24 | The day, written YYYY-MM-DD, from 1999-01-04. |

## The answer

The result sits inside the usual envelope with what the call cost, your balance and the data version (the latest ECB fixing the server holds).

| Field | Example | Meaning |
| --- | --- | --- |
| base, quote | USD, INR | The pair you asked for. |
| requestedDate | 2026-10-24 | The date you asked for. |
| fixingDate | 2026-10-23 | The ECB fixing used: the same day, or the last one up to 7 days before it. |
| rate | 94.945055 | Units of quote per one base, rounded half away from zero to 6 decimals. |
| inverse | 0.010532 | Units of base per one quote, from the unrounded rate. |
| source | European Central Bank euro foreign exchange reference rates | Where the rate comes from. |

## More worked examples

| Example | Date asked | Fixing used | Rate |
| --- | --- | --- | ---: |
| US dollars to Indian rupees on a Saturday, which uses the Friday fixing | 2026-10-24 | 2026-10-23 | 94.945055 |
| Pounds to yen on Christmas Day 2024, when the ECB did not publish | 2024-12-25 | 2024-12-24 | 197.149931 |
| Euros to US dollars on a day with a fixing | 2026-10-29 | 2026-10-29 | 1.113 |

## For AI agents over MCP

The same tool is available to AI agents through the MCP endpoint at /mcp on this site. Its MCP name is fx-on-date and its input is the same three fields; calls are priced and limited like API calls. [Connection details are in the docs](https://krishnachagti-sudo.github.io/toll-preview/docs).

## Errors you can expect

| Status | Code | When | Charged |
| --- | --- | --- | --- |
| 400 | invalid\_input | A code that is not three capital letters, an unknown currency, or a date that is not real. | No |
| 422 | not\_available | No ECB fixing on the date or in the 7 days before it, a date before 1999-01-04, or a working day not published yet. | No |
| 502 | upstream\_failed | The rate file could not be read. | Refunded |

## How these rates are made

The European Central Bank publishes how many units of each currency one euro buys, usually at around 16:00 CET on every TARGET working day. A rate between two other currencies is worked out from the same day's fixing: units of the second per euro divided by units of the first per euro, rounded half away from zero to 6 decimal places. The inverse comes from the unrounded rate.

A weekend or TARGET holiday has no fixing, so a date like that uses the last fixing before it, up to 7 days back, and the tool names the day it used. Averages here are the mean of the daily rates, each as the tool reports it, rounded to 6 decimal places.

> These are ECB reference rates. The ECB publishes them for information only and discourages their use for transactions. They are not the rate a bank, card or money transfer service charges.

## Sources

- [European Central Bank: Euro foreign exchange reference rates](https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html)
- [European Central Bank: full history of the reference rates (CSV in a zip file)](https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip)

## Questions

### What does a call return on a weekend date?

The last ECB fixing before it, and fixingDate says which day that was. For USD to INR on 2026-10-24 (a Saturday) the answer is 94.945055 from the fixing of 2026-10-23.

### Am I charged when there is no rate?

No. A date with no fixing in the 7 days before it, a date before 4 January 1999, or a working day the ECB has not published yet returns not\_available and costs nothing.

## Related

- [ECB euro reference rates for every currency](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/ecb-reference-rates/)
- [Historical exchange rates in Excel](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/historical-exchange-rates-in-excel/)
- [Exchange rate on a date (the tool)](https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/)
- [API docs: keys, errors, limits](https://krishnachagti-sudo.github.io/toll-preview/docs)

---

Page: https://krishnachagti-sudo.github.io/toll-preview/fx-on-date/ecb-exchange-rate-api/  
Data as of: 2026-10-31
